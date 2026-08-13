import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { z } from 'zod';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须为 YYYY-MM-DD');
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 必须为小写 kebab-case');
const metadataSchema = z
  .object({
    version: z.literal(1),
    opportunityId: z.string().min(1),
    originReport: dateSchema,
    originSlug: slugSchema,
    status: z.literal('research-complete'),
    siteSummary: z.string().trim().min(1)
  })
  .refine((metadata) => metadata.opportunityId === createOpportunityId(metadata.originReport, metadata.originSlug), {
    message: 'opportunityId 必须与 originReport 和 originSlug 匹配',
    path: ['opportunityId']
  });

const researchMarker = /^\s*<!-- opportunity-radar:research ([^\r\n]+?) -->[ \t]*(?:\r?\n)?/;
const requiredResearchHeadings = [
  '研究结论',
  '用户与问题',
  '证据',
  '竞品与替代方案',
  '市场与付费',
  'MVP',
  '验证计划',
  '风险与 Kill Criteria'
];

function missingResearchHeadings(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const headings = new Set(tree.children
    .filter((node) => node.type === 'heading' && node.depth === 2)
    .map((node) => node.children.map((child) => ('value' in child ? child.value : '')).join('')));

  return requiredResearchHeadings.filter((heading) => !headings.has(heading));
}

function hasResearchMetadataComment(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const visit = (node) =>
    (node.type === 'html' && node.value?.includes('<!-- opportunity-radar:research') === true) ||
    node.children?.some((child) => visit(child)) === true;

  return visit(tree);
}

export function createOpportunityId(originReport, originSlug) {
  return `${originReport}--${originSlug}`;
}

function parseResearchIssue(issue) {
  const body = typeof issue.body === 'string' ? issue.body : '';
  const match = body.match(researchMarker);
  if (!match) {
    if (hasResearchMetadataComment(body)) {
      throw new Error(`Issue #${issue.number} 的 Opportunity Radar 元数据必须是第一个非空块中的单行紧凑 JSON 注释`);
    }
    return null;
  }

  let rawMetadata;
  try {
    rawMetadata = JSON.parse(match[1]);
  } catch {
    throw new Error(`Issue #${issue.number} 的 Opportunity Radar 元数据不是有效 JSON`);
  }
  if (JSON.stringify(rawMetadata) !== match[1]) {
    throw new Error(`Issue #${issue.number} 的 Opportunity Radar 元数据必须使用紧凑 JSON`);
  }

  const metadata = metadataSchema.parse(rawMetadata);
  const markdown = body.slice(match[0].length).trim();
  if (!markdown) throw new Error(`Issue #${issue.number} 的研究报告不能为空`);
  const missingHeadings = missingResearchHeadings(markdown);
  if (missingHeadings.length) throw new Error(`Issue #${issue.number} 的完整报告缺少必填章节：${missingHeadings.join('、')}`);

  const issueDetails = z.object({
    number: z.number().int().positive(),
    html_url: z.url(),
    title: z.string().min(1),
    updated_at: z.iso.datetime()
  }).parse(issue);

  return {
    issueNumber: issueDetails.number,
    issueUrl: issueDetails.html_url,
    title: issueDetails.title,
    updatedAt: issueDetails.updated_at,
    metadata,
    markdown
  };
}

function nextPageUrl(linkHeader) {
  if (!linkHeader) return null;
  const next = linkHeader.split(',').find((entry) => /rel="?next"?/.test(entry));
  return next?.match(/<([^>]+)>/)?.[1] ?? null;
}

export async function fetchRepositoryIssues({ repository, token, fetchImpl = fetch }) {
  let url = `https://api.github.com/repos/${repository}/issues?state=all&per_page=100`;
  const issues = [];

  while (url) {
    const response = await fetchImpl(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    if (!response.ok) throw new Error(`GitHub Issue 同步失败：HTTP ${response.status}`);

    const page = await response.json();
    if (!Array.isArray(page)) throw new Error('GitHub Issue 同步失败：API 返回不是数组');
    issues.push(...page);
    url = nextPageUrl(response.headers.get('link'));
  }

  return issues;
}

export function buildResearchIndex({ issues, opportunityIds, generatedAt = new Date().toISOString() }) {
  const research = [];
  const seenOpportunityIds = new Set();

  for (const issue of issues) {
    if (issue.pull_request) continue;
    const parsed = parseResearchIssue(issue);
    if (!parsed) continue;

    if (!opportunityIds.has(parsed.metadata.opportunityId)) {
      throw new Error(`Issue #${parsed.issueNumber} 引用了不存在的日报机会：${parsed.metadata.opportunityId}`);
    }
    if (seenOpportunityIds.has(parsed.metadata.opportunityId)) {
      throw new Error(`机会 ${parsed.metadata.opportunityId} 存在重复的深挖 Issue`);
    }

    seenOpportunityIds.add(parsed.metadata.opportunityId);
    research.push(parsed);
  }

  return { version: 1, generatedAt, research };
}

export async function loadOpportunityIds(reportsDirectory) {
  const entries = (await readdir(reportsDirectory)).filter((entry) => entry.endsWith('.json'));
  const opportunityIds = new Set();

  await Promise.all(entries.map(async (entry) => {
    const report = JSON.parse(await readFile(join(reportsDirectory, entry), 'utf8'));
    for (const opportunity of report.opportunities ?? []) opportunityIds.add(createOpportunityId(report.date, opportunity.slug));
  }));

  return opportunityIds;
}

export async function writeResearchIndex(outputPath, index) {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
}

export async function syncIssueResearch({ repository, token, reportsDirectory, outputPath, fetchImpl = fetch }) {
  if (!token) {
    console.warn('未提供 GITHUB_TOKEN；生成空的 Issue 研究索引用于本地构建。');
    const index = { version: 1, generatedAt: new Date().toISOString(), research: [] };
    await writeResearchIndex(outputPath, index);
    return index;
  }
  if (!repository) throw new Error('提供 GITHUB_TOKEN 时必须提供 GITHUB_REPOSITORY');

  const [issues, opportunityIds] = await Promise.all([
    fetchRepositoryIssues({ repository, token, fetchImpl }),
    loadOpportunityIds(reportsDirectory)
  ]);
  const index = buildResearchIndex({ issues, opportunityIds });
  await writeResearchIndex(outputPath, index);
  return index;
}

async function main() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const repositoryRoot = resolve(scriptDirectory, '..');
  await syncIssueResearch({
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
    reportsDirectory: join(repositoryRoot, '_data', 'reports'),
    outputPath: join(repositoryRoot, '.opportunity-radar', 'research-index.json')
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
