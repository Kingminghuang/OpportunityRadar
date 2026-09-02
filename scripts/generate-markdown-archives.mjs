import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const priorityLabels = {
  deepDive: '最值得深挖',
  fastestMvp: '最快可做 MVP',
  highestCommercialValue: '商业价值最高',
  needsValidation: '最需要验证'
};

const decisionLabels = {
  'deep-dive': '深挖',
  watch: '观察',
  skip: '跳过'
};

function sourceLine(evidence) {
  return `[${evidence.title}](${evidence.url}) · ${evidence.sourceType}${evidence.publishedAt ? ` · ${evidence.publishedAt}` : ''}`;
}

export function renderMarkdownArchive(report) {
  const opportunitiesBySlug = new Map(report.opportunities.map((opportunity) => [opportunity.slug, opportunity]));
  const reportsDirectoryName = report.track === 'office' ? 'office-reports' : 'reports';
  const frontMatter = [
    '---',
    `title: ${JSON.stringify(report.title)}`,
    `date: ${report.date}`,
    `timezone: ${report.timezone}`,
    `track: ${report.track ?? 'developer'}`,
    `source: _data/${reportsDirectoryName}/${report.date}.json`,
    'generated: true',
    '---'
  ].join('\n');
  const opportunitySections = report.opportunities.map((opportunity) => [
    `<a id="opportunity-${opportunity.slug}"></a>`,
    '',
    `## ${opportunity.rank}. ${opportunity.title} — ${opportunity.score.total}/25`,
    '',
    `- 分类：${opportunity.category}`,
    `- 判断：${decisionLabels[opportunity.decision] ?? opportunity.decision}`,
    `- 标签：${opportunity.tags.join(' · ')}`,
    '',
    '### 机会',
    '',
    opportunity.opportunity,
    '',
    '### 为什么现在',
    '',
    opportunity.whyNow,
    '',
    '### 评分',
    '',
    '| 需求 | 付费 | MVP | 竞争 | 获客 |',
    '| --- | --- | --- | --- | --- |',
    `| ${opportunity.score.demand} | ${opportunity.score.payment} | ${opportunity.score.mvp} | ${opportunity.score.competition} | ${opportunity.score.acquisition} |`,
    '',
    '### 证据',
    '',
    ...opportunity.evidence.flatMap((evidence) => [`- ${sourceLine(evidence)}`, `  - ${evidence.summary}`]),
    '',
    '### 判断',
    '',
    opportunity.verdict
  ].join('\n'));
  const priorities = Object.entries(report.priorities).map(([key, priority]) => {
    const opportunity = opportunitiesBySlug.get(priority.slug);
    const title = opportunity?.title ?? priority.slug;
    return `- **${priorityLabels[key] ?? key}**：[${title}](#opportunity-${priority.slug}) — ${priority.reason}`;
  });

  return [
    `<!-- Generated from _data/${reportsDirectoryName}/${report.date}.json. Do not edit. -->`,
    '',
    frontMatter,
    '',
    `# ${report.title}`,
    '',
    report.summary,
    '',
    '## 机会清单',
    '',
    ...opportunitySections.flatMap((section) => [section, '']),
    '### 今日优先级',
    '',
    ...priorities,
    '',
    '### 扫描说明',
    '',
    `- 覆盖时间：${report.scanNotes.coverageWindow}`,
    `- 来源：${report.scanNotes.sources.join(' · ')}`,
    `- 限制：${report.scanNotes.limitations}`,
    ''
  ].join('\n');
}

export async function generateMarkdownArchives({ reportsDirectory, outputDirectory }) {
  let entries;
  try {
    entries = (await readdir(reportsDirectory)).filter((entry) => extname(entry) === '.json').sort();
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(entries.map(async (entry) => {
    const inputPath = join(reportsDirectory, entry);
    const report = JSON.parse(await readFile(inputPath, 'utf8'));
    const outputPath = join(outputDirectory, entry.replace(/\.json$/, '.md'));
    await writeFile(outputPath, renderMarkdownArchive(report), 'utf8');
  }));
}

async function main() {
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const repositoryRoot = resolve(scriptDirectory, '..');
  const outputFlagIndex = process.argv.indexOf('--out');
  const baseOutputDirectory = outputFlagIndex === -1
    ? join(repositoryRoot, 'dist', 'archives')
    : resolve(repositoryRoot, process.argv[outputFlagIndex + 1]);

  if (outputFlagIndex !== -1 && !process.argv[outputFlagIndex + 1]) {
    throw new Error('`--out` 必须指定归档输出目录');
  }

  const tracks = [
    { name: 'developer', reportsDirectory: join(repositoryRoot, '_data', 'reports'), outputDirectory: baseOutputDirectory },
    { name: 'office', reportsDirectory: join(repositoryRoot, '_data', 'office-reports'), outputDirectory: join(baseOutputDirectory, 'office') }
  ];

  for (const { reportsDirectory, outputDirectory } of tracks) {
    await generateMarkdownArchives({ reportsDirectory, outputDirectory });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
