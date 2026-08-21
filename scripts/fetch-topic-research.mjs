#!/usr/bin/env node

// 选题数据获取：根据 OP slug 组装 topic-brief.json
// 1) 从 _data/reports 定位包含该 slug 的日报 opportunity
// 2) 实时同步 .opportunity-radar/research-index.json（复用 sync-issue-research.mjs 的解析与校验）
// 3) 从索引中按 opportunityId 查询 Deep Dive 研究报告
// 输出 topic-brief.json 供 article-writer 使用；不修改日报 JSON。

import { execFileSync } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { createOpportunityId, syncIssueResearch } from './sync-issue-research.mjs';

const slugSchema = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESEARCH_INDEX_PATH = resolve('.opportunity-radar/research-index.json');
const REPORTS_DIRECTORY = resolve('_data/reports');

function parseArgs(argv) {
  const args = { noSync: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--slug') args.slug = argv[++index];
    else if (value === '--report') args.report = argv[++index];
    else if (value === '--out') args.out = argv[++index];
    else if (value === '--repository') args.repository = argv[++index];
    else if (value === '--no-sync') args.noSync = true;
    else if (value === '--help' || value === '-h') args.help = true;
    else throw new Error(`未知参数：${value}`);
  }
  return args;
}

function usage() {
  console.log(`用法：
  node scripts/fetch-topic-research.mjs --slug SLUG [--report YYYY-MM-DD] [--out PATH] [--repository owner/repo] [--no-sync]

选项：
  --slug SLUG       日报中的机会 slug（必需），如 ai-session-manager
  --report DATE     限定日报日期 YYYY-MM-DD；省略时在所有日报中查找该 slug
  --out PATH        输出 topic-brief.json 路径；默认 artifacts/topic-research/<date>--<slug>.json
  --repository      仓库 owner/repo；省略时用 GITHUB_REPOSITORY 或 git remote origin
  --no-sync         不实时同步 research-index.json，只查询本地已有索引

默认行为：先实时同步 .opportunity-radar/research-index.json（复用 sync-issue-research.mjs），
再从索引中查询该机会的 Deep Dive 研究。GitHub 凭据优先 GITHUB_TOKEN，否则尝试 gh auth token。
`);
}

async function readGitRemoteRepository() {
  try {
    const output = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    const match = output.match(/(?:github\.com[:/])([^/]+)\/([^/.]+)(?:\.git)?$/);
    if (match) return `${match[1]}/${match[2]}`;
  } catch {
    // fall through
  }
  return null;
}

async function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('缺少 GitHub 凭据：请设置 GITHUB_TOKEN 或先 gh auth login');
  }
}

async function findOpportunity(slug, reportDate) {
  if (reportDate) {
    const report = JSON.parse(await readFile(join(REPORTS_DIRECTORY, `${reportDate}.json`), 'utf8'));
    const opportunity = report.opportunities?.find((entry) => entry.slug === slug);
    if (!opportunity) throw new Error(`日报 ${reportDate}.json 中不存在 slug：${slug}`);
    return { report, opportunity, reportPath: `_data/reports/${reportDate}.json` };
  }

  const entries = (await readdir(REPORTS_DIRECTORY)).filter((entry) => entry.endsWith('.json')).sort();
  for (const entry of entries) {
    const report = JSON.parse(await readFile(join(REPORTS_DIRECTORY, entry), 'utf8'));
    const opportunity = report.opportunities?.find((candidate) => candidate.slug === slug);
    if (opportunity) return { report, opportunity, reportPath: `_data/reports/${entry}` };
  }
  throw new Error(`在所有日报中都没有找到 slug：${slug}`);
}

async function readResearchIndex() {
  try {
    return JSON.parse(await readFile(RESEARCH_INDEX_PATH, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return usage();
  if (!args.slug) throw new Error('必须提供 --slug');
  if (!slugSchema.test(args.slug)) throw new Error('slug 必须为小写 kebab-case');

  const { report, opportunity, reportPath } = await findOpportunity(args.slug, args.report);
  const opportunityId = createOpportunityId(report.date, args.slug);

  if (!args.noSync) {
    const repository = args.repository || process.env.GITHUB_REPOSITORY || (await readGitRemoteRepository());
    if (!repository) throw new Error('同步 research-index 需要仓库：请传 --repository 或设置 GITHUB_REPOSITORY');
    const token = await resolveToken();
    console.log(`实时同步 research-index（${repository}）…`);
    await syncIssueResearch({
      repository,
      token,
      reportsDirectory: REPORTS_DIRECTORY,
      outputPath: RESEARCH_INDEX_PATH
    });
  }

  const index = await readResearchIndex();
  if (!index) throw new Error(`本地没有 research-index：${RESEARCH_INDEX_PATH}；请去掉 --no-sync 先同步`);
  const entry = index.research?.find((item) => item.metadata?.opportunityId === opportunityId);
  if (!entry) {
    throw new Error(`research-index 中没有 ${opportunityId} 的 Deep Dive 研究（请确认该机会有 research-complete 状态的研究 Issue）`);
  }

  const outPath = resolve(args.out || join('artifacts', 'topic-research', `${report.date}--${args.slug}.json`));
  const topicBrief = {
    schemaVersion: 1,
    source: {
      slug: args.slug,
      reportDate: report.date,
      reportPath,
      opportunityId,
      issue: {
        number: entry.issueNumber,
        url: entry.issueUrl,
        title: entry.title,
        updatedAt: entry.updatedAt
      }
    },
    opportunity,
    research: {
      title: entry.title,
      updatedAt: entry.updatedAt,
      metadata: entry.metadata,
      markdown: entry.markdown
    }
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(topicBrief, null, 2)}\n`, 'utf8');
  console.log(`topic-brief: ${outPath}`);
  console.log(`opportunity: ${opportunity.title}`);
  console.log(`research: issue #${entry.issueNumber}（${entry.title}）`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
