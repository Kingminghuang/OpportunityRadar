import { describe, expect, it } from 'vitest';

import { createOpportunityId, parseResearchIndex, parseResearchIssue } from '../src/lib/research';

const metadata = {
  version: 1,
  opportunityId: '2026-08-12--ai-session-manager',
  originReport: '2026-08-12',
  originSlug: 'ai-session-manager',
  status: 'research-complete',
  siteSummary: '验证重度 AI 编程用户是否愿意为会话持久化付费。'
};

const completeMarkdown = `## 研究结论

值得先用本地版本验证。

## 用户与问题

开发者需要可搜索的会话资产。

## 证据

公开需求已记录。

## 竞品与替代方案

现有工具只覆盖单一 Agent。

## 市场与付费

重度用户可为可靠迁移付费。

## MVP

先做本地搜索与导出。

## 验证计划

访谈十位重度用户。

## 风险与 Kill Criteria

若没有五位愿意试用则停止。`;

const requiredHeadings = [
  '研究结论',
  '用户与问题',
  '证据',
  '竞品与替代方案',
  '市场与付费',
  'MVP',
  '验证计划',
  '风险与 Kill Criteria'
];

const issue = {
  number: 17,
  html_url: 'https://github.com/Kingminghuang/OpportunityRadar/issues/17',
  title: '[Deep Dive] AI 编程会话资产化与跨设备连续性',
  updated_at: '2026-08-13T04:00:00Z',
  body: `<!-- opportunity-radar:research ${JSON.stringify(metadata)} -->\n\n${completeMarkdown}`
};

describe('research issue metadata', () => {
  it('creates a stable opportunity ID from the origin report and slug', () => {
    expect(createOpportunityId('2026-08-12', 'ai-session-manager')).toBe('2026-08-12--ai-session-manager');
  });

  it('parses the hidden metadata and preserves the full research Markdown', () => {
    expect(parseResearchIssue(issue)).toEqual({
      issueNumber: 17,
      issueUrl: 'https://github.com/Kingminghuang/OpportunityRadar/issues/17',
      title: '[Deep Dive] AI 编程会话资产化与跨设备连续性',
      updatedAt: '2026-08-13T04:00:00Z',
      metadata,
      markdown: completeMarkdown
    });
  });

  it('returns null for ordinary issues without Opportunity Radar metadata', () => {
    expect(parseResearchIssue({ ...issue, body: '## 普通项目问题' })).toBeNull();
  });

  it('rejects invalid metadata and mismatched opportunity IDs', () => {
    expect(() => parseResearchIssue({ ...issue, body: '<!-- opportunity-radar:research {not-json} -->' })).toThrow(/元数据/);
    expect(() => parseResearchIssue({
      ...issue,
      body: `<!-- opportunity-radar:research ${JSON.stringify({ ...metadata, opportunityId: '2026-08-12--different' })} -->`
    })).toThrow(/opportunityId/);
  });

  it('rejects research without every required report section', () => {
    expect(() => parseResearchIssue({ ...issue, body: `<!-- opportunity-radar:research ${JSON.stringify(metadata)} -->\n\n## 研究结论\n\n值得先验证。` })).toThrow(/完整报告/);
  });

  it('rejects multiline or misplaced Opportunity Radar metadata markers', () => {
    const multilineMetadata = JSON.stringify(metadata, null, 2);
    expect(() => parseResearchIssue({ ...issue, body: `<!-- opportunity-radar:research ${multilineMetadata} -->\n\n## 研究结论` })).toThrow(/单行/);
    expect(() => parseResearchIssue({ ...issue, body: `研究草稿\n\n<!-- opportunity-radar:research ${JSON.stringify(metadata)} -->` })).toThrow(/第一个非空块/);
    expect(() => parseResearchIssue({ ...issue, body: `> <!-- opportunity-radar:research ${JSON.stringify(metadata)} -->` })).toThrow(/第一个非空块/);
  });

  it('ignores ordinary issues that mention the marker only in prose or fenced code', () => {
    expect(parseResearchIssue({ ...issue, body: '文档说明：opportunity-radar:research 仅用于深挖报告。' })).toBeNull();
    expect(parseResearchIssue({ ...issue, body: '```html\n<!-- opportunity-radar:research {"example":true} -->\n```' })).toBeNull();
  });

  it('validates a generated index and rejects duplicate research records', () => {
    const parsedIssue = parseResearchIssue(issue);
    const index = parseResearchIndex({ version: 1, generatedAt: '2026-08-13T04:00:00Z', research: [parsedIssue] });

    expect(index.research[0].metadata.opportunityId).toBe(metadata.opportunityId);
    expect(() => parseResearchIndex({ version: 1, generatedAt: '2026-08-13T04:00:00Z', research: [parsedIssue, parsedIssue] })).toThrow(/唯一/);
  });

  it('rejects an index that bypasses the required report sections', () => {
    const parsedIssue = parseResearchIssue(issue)!;
    expect(() => parseResearchIndex({
      version: 1,
      generatedAt: '2026-08-13T04:00:00Z',
      research: [{ ...parsedIssue, markdown: '## 研究结论\n\n不完整。' }]
    })).toThrow(/完整报告/);
  });

  it('does not count headings placed inside a fenced code block', () => {
    const parsedIssue = parseResearchIssue(issue)!;
    const fakeHeadings = requiredHeadings.map((heading) => `## ${heading}`).join('\n');
    expect(() => parseResearchIndex({
      version: 1,
      generatedAt: '2026-08-13T04:00:00Z',
      research: [{ ...parsedIssue, markdown: `\`\`\`markdown\n${fakeHeadings}\n\`\`\`` }]
    })).toThrow(/完整报告/);
  });
});
