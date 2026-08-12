import { parseReports, type RawReport, type Report } from './reports';

const reportModules = import.meta.glob('../../_data/reports/*.json', {
  eager: true,
  import: 'default'
}) as Record<string, unknown>;

export function loadReports(): Report[] {
  const rawReports: RawReport[] = Object.entries(reportModules).map(([path, data]) => ({
    path: path.replace('../../', '/'),
    data
  }));

  return parseReports(rawReports);
}
