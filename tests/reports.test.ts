import { describe, expect, it } from 'vitest';

import { contentAnchor, parseReports, reportHref, sitePath } from '../src/lib/reports';

const validReport = {
  path: '/_posts/2026-08-12-daily-opportunities.md',
  frontmatter: {
    layout: 'post',
    title: '每日机会扫描 — 2026-08-12',
    date: '2026-08-12',
    summary: '面向 AI Agent 基础设施的高质量机会。',
    categories: ['opportunities'],
    opportunities: [
      {
        slug: 'ai-session-manager',
        title: 'AI 编程会话管理器',
        score: 23,
        demand: 5,
        payment: 4,
        mvp: 5,
        competition: 4,
        acquisition: 5,
        category: 'developer-tools',
        decision: '深挖'
      }
    ]
  }
};

describe('parseReports', () => {
  it('parses a valid report and sorts reports newest first', () => {
    const reports = parseReports([
      validReport,
      {
        ...validReport,
        path: '/_posts/2026-08-11-daily-opportunities.md',
        frontmatter: { ...validReport.frontmatter, date: '2026-08-11' }
      }
    ]);

    expect(reports.map((report) => report.date)).toEqual(['2026-08-12', '2026-08-11']);
    expect(reports[0].opportunities[0].score).toBe(23);
  });

  it('rejects a score that does not equal the component scores', () => {
    const invalid = structuredClone(validReport);
    invalid.frontmatter.opportunities[0].score = 24;

    expect(() => parseReports([invalid])).toThrow(/总分/);
  });

  it('rejects duplicate opportunity slugs within a report', () => {
    const invalid = structuredClone(validReport);
    invalid.frontmatter.opportunities.push({ ...invalid.frontmatter.opportunities[0] });

    expect(() => parseReports([invalid])).toThrow(/slug/);
  });

  it('normalizes an unquoted YAML date parsed as a Date object', () => {
    const reportWithYamlDate = {
      ...validReport,
      frontmatter: { ...validReport.frontmatter, date: new Date('2026-08-12T00:00:00.000Z') }
    };

    expect(parseReports([reportWithYamlDate])[0].date).toBe('2026-08-12');
  });

  it('normalizes Astro’s serialized YAML date', () => {
    const reportWithAstroDate = {
      ...validReport,
      frontmatter: { ...validReport.frontmatter, date: '2026-08-12T00:00:00.000Z' }
    };

    expect(parseReports([reportWithAstroDate])[0].date).toBe('2026-08-12');
  });
});

describe('contentAnchor', () => {
  it('uses a stable opportunity slug for report links', () => {
    expect(contentAnchor('ai-session-manager')).toBe('opportunity-ai-session-manager');
  });
});

describe('site paths', () => {
  it('joins the GitHub Pages base path without dropping its separator', () => {
    expect(sitePath('/OpportunityRadar', 'reports/')).toBe('/OpportunityRadar/reports/');
    expect(reportHref('/OpportunityRadar', '2026-08-12', 'ai-session-manager')).toBe(
      '/OpportunityRadar/reports/2026-08-12/#opportunity-ai-session-manager'
    );
  });
});
