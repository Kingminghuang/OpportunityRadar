import { describe, expect, it } from 'vitest';

import { renderMarkdownArchive } from '../scripts/generate-markdown-archives.mjs';

const report = {
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
        { title: 'Source two', url: 'https://example.com/two', sourceType: 'hacker-news', summary: '独立佐证。' }
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
};

describe('renderMarkdownArchive', () => {
  it('renders a self-contained Markdown archive from a report JSON document', () => {
    const markdown = renderMarkdownArchive(report);

    expect(markdown).toContain('<!-- Generated from _data/reports/2026-08-12.json. Do not edit. -->');
    expect(markdown).toContain('title: "每日机会扫描 — 2026-08-12"');
    expect(markdown).toContain('<a id="opportunity-ai-session-manager"></a>');
    expect(markdown).toContain('## 1. AI 编程会话管理器 — 23/25');
    expect(markdown).toContain('| 需求 | 付费 | MVP | 竞争 | 获客 |');
    expect(markdown).toContain('[Source one](https://example.com/one) · github-issue · 2026-07-28');
    expect(markdown).toContain('### 今日优先级');
    expect(markdown).toContain('### 扫描说明');
  });
});
