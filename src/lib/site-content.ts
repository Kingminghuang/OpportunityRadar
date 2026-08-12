import { parseReports, type RawReport, type Report } from './reports';
import type { MarkdownInstance } from 'astro';

type MarkdownModule = MarkdownInstance<Record<string, unknown>>;

export type ReportModule = {
  report: Report;
  Content: MarkdownModule['Content'];
};

const markdownModules = import.meta.glob('../../_posts/*.md', { eager: true }) as Record<string, MarkdownModule>;

export function loadReportModules(): ReportModule[] {
  const rawReports: RawReport[] = Object.entries(markdownModules).map(([path, module]) => ({
    path: path.replace('../../', '/'),
    frontmatter: module.frontmatter
  }));
  const reports = parseReports(rawReports);

  return reports.map((report) => {
    const matchingModule = Object.entries(markdownModules).find(([path]) => path.replace('../../', '/') === report.path)?.[1];

    if (!matchingModule) {
      throw new Error(`无法加载日报内容：${report.path}`);
    }

    return { report, Content: matchingModule.Content };
  });
}
