import { describe, expect, it } from 'vitest';

import { contentAnchor, decisionLabel, parseReports, reportHref, sitePath } from '../src/lib/reports';

const validReport = {
  path: '/_data/reports/2026-08-12.json',
  data: {
    schemaVersion: 1,
    date: '2026-08-12',
    timezone: 'Asia/Singapore',
    title: '每日机会扫描 — 2026-08-12',
    summary: '面向 AI Agent 基础设施的高质量机会。',
    categories: ['opportunities'],
    opportunities: [
      {
        rank: 1,
        slug: 'ai-session-manager',
        title: 'AI 编程会话管理器',
        category: 'developer-tools',
        decision: 'deep-dive',
        score: { total: 23, demand: 5, payment: 4, mvp: 5, competition: 4, acquisition: 5 },
        opportunity: '统一管理 AI 编程会话。',
        whyNow: '会话正变成长生命周期工作资产。',
        evidence: [
          { title: 'Source one', url: 'https://example.com/one', sourceType: 'github-issue', publishedAt: '2026-07-28', summary: '明确需求。' },
          { title: 'Source two', url: 'https://example.com/two', sourceType: 'hacker-news', publishedAt: '2026-07-29', summary: '独立佐证。' }
        ],
        verdict: '先做本地版本。',
        tags: ['AI Agent', '本地优先']
      }
    ],
    priorities: {
      deepDive: { slug: 'ai-session-manager', reason: '需求明确。' },
      fastestMvp: { slug: 'ai-session-manager', reason: '范围可控。' },
      highestCommercialValue: { slug: 'ai-session-manager', reason: '价值可量化。' },
      needsValidation: { slug: 'ai-session-manager', reason: '需要访谈。' }
    },
    scanNotes: {
      coverageWindow: '2026-08-05 至 2026-08-12',
      sources: ['GitHub Issues', 'Hacker News'],
      limitations: '受登录态限制的平台未作为核心证据。'
    }
  }
};

describe('parseReports', () => {
  it('parses JSON reports and sorts them newest first', () => {
    const reports = parseReports([
      validReport,
      { ...validReport, path: '/_data/reports/2026-08-11.json', data: { ...validReport.data, date: '2026-08-11' } }
    ]);

    expect(reports.map((report) => report.date)).toEqual(['2026-08-12', '2026-08-11']);
    expect(reports[0].opportunities[0].score.total).toBe(23);
  });

  it('rejects a total that does not equal the component scores', () => {
    const invalid = structuredClone(validReport);
    invalid.data.opportunities[0].score.total = 24;

    expect(() => parseReports([invalid])).toThrow(/总分/);
  });

  it('rejects impossible calendar dates', () => {
    const invalid = { ...validReport, path: '/_data/reports/2026-02-30.json', data: { ...validReport.data, date: '2026-02-30' } };

    expect(() => parseReports([invalid])).toThrow(/日期/);
  });

  it('rejects duplicate opportunity slugs', () => {
    const invalid = structuredClone(validReport);
    invalid.data.opportunities.push({ ...invalid.data.opportunities[0], rank: 2 });

    expect(() => parseReports([invalid])).toThrow(/slug/);
  });

  it('rejects an invalid decision or a priority that does not refer to an opportunity', () => {
    const invalidDecision = structuredClone(validReport);
    invalidDecision.data.opportunities[0].decision = '深挖';
    expect(() => parseReports([invalidDecision])).toThrow();

    const invalidPriority = structuredClone(validReport);
    invalidPriority.data.priorities.deepDive.slug = 'missing-opportunity';
    expect(() => parseReports([invalidPriority])).toThrow(/优先级/);
  });
});

describe('presentation helpers', () => {
  it('maps stable decision values to Chinese labels', () => {
    expect(decisionLabel('deep-dive')).toBe('深挖');
    expect(decisionLabel('watch')).toBe('观察');
    expect(decisionLabel('skip')).toBe('跳过');
  });

  it('uses stable anchors and Pages-safe links', () => {
    expect(contentAnchor('ai-session-manager')).toBe('opportunity-ai-session-manager');
    expect(sitePath('/OpportunityRadar', 'reports/')).toBe('/OpportunityRadar/reports/');
    expect(reportHref('/OpportunityRadar', '2026-08-12', 'ai-session-manager')).toBe(
      '/OpportunityRadar/reports/2026-08-12/#opportunity-ai-session-manager'
    );
  });
});
