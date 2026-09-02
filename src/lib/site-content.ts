import { parseReports, type RawReport, type Report, type Track } from './reports';
import { parseResearchIndex, type ResearchIssue } from './research';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const reportModules = import.meta.glob(
  ['../../_data/reports/*.json', '../../_data/office-reports/*.json'],
  { eager: true, import: 'default' }
) as Record<string, unknown>;

export function loadReports(track?: Track): Report[] {
  const rawReports: RawReport[] = Object.entries(reportModules).map(([path, data]) => ({
    path: path.replace('../../', '/'),
    data
  }));

  const reports = parseReports(rawReports);
  return track ? reports.filter((report) => report.track === track) : reports;
}

export function researchIndexPath(repositoryRoot = process.cwd()): string {
  return join(repositoryRoot, '.opportunity-radar', 'research-index.json');
}

const defaultResearchIndexPath = researchIndexPath();

export function loadResearch(indexPath: URL | string = defaultResearchIndexPath): ResearchIssue[] {
  try {
    return parseResearchIndex(JSON.parse(readFileSync(indexPath, 'utf8'))).research;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}
