import { describe, expect, it } from 'vitest';

import { buildResearchIndex, fetchRepositoryIssues } from '../scripts/sync-issue-research.mjs';

const metadata = {
  version: 1,
  opportunityId: '2026-08-12--ai-session-manager',
  originReport: '2026-08-12',
  originSlug: 'ai-session-manager',
  status: 'research-complete',
  siteSummary: '验证本地会话管理是否值得付费。'
};

const completeMarkdown = `## 研究结论

先验证本地版本。

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

const researchIssue = {
  number: 17,
  html_url: 'https://github.com/Kingminghuang/OpportunityRadar/issues/17',
  title: '[Deep Dive] AI 编程会话资产化与跨设备连续性',
  updated_at: '2026-08-13T04:00:00Z',
  body: `<!-- opportunity-radar:research ${JSON.stringify(metadata)} -->\n\n${completeMarkdown}`
};

function response(body: unknown, link = '') {
  return {
    ok: true,
    status: 200,
    headers: { get: (name: string) => (name === 'link' ? link : null) },
    json: async () => body
  };
}

describe('issue research sync', () => {
  it('paginates repository issues and retains ordinary issues for later filtering', async () => {
    const requestedUrls: string[] = [];
    const fetchImpl = (async (url: URL | RequestInfo) => {
      requestedUrls.push(String(url));
      return requestedUrls.length === 1
        ? response([{ number: 1 }], '<https://api.github.com/repos/Kingminghuang/OpportunityRadar/issues?page=2>; rel="next"') as Response
        : response([researchIssue]) as Response;
    }) as typeof fetch;

    const issues = await fetchRepositoryIssues({
      repository: 'Kingminghuang/OpportunityRadar',
      token: 'test-token',
      fetchImpl
    });

    expect(requestedUrls).toHaveLength(2);
    expect(issues).toEqual([{ number: 1 }, researchIssue]);
  });

  it('builds an index only from linked, non-pull-request research issues', () => {
    const index = buildResearchIndex({
      issues: [
        { ...researchIssue, pull_request: { url: 'https://api.github.com/repos/Kingminghuang/OpportunityRadar/pulls/17' } },
        { ...researchIssue, number: 18, body: '## 普通项目问题' },
        researchIssue
      ],
      opportunityIds: new Set([metadata.opportunityId])
    });

    expect(index.research).toEqual([
      expect.objectContaining({ issueNumber: 17, metadata, markdown: completeMarkdown })
    ]);
  });

  it('rejects research that has no originating opportunity or duplicates an opportunity ID', () => {
    expect(() => buildResearchIndex({ issues: [researchIssue], opportunityIds: new Set() })).toThrow(/不存在的日报机会/);
    expect(() => buildResearchIndex({
      issues: [researchIssue, { ...researchIssue, number: 18 }],
      opportunityIds: new Set([metadata.opportunityId])
    })).toThrow(/重复/);
  });

  it('rejects Issue reports that omit the required deep-dive sections', () => {
    expect(() => buildResearchIndex({
      issues: [{ ...researchIssue, body: `<!-- opportunity-radar:research ${JSON.stringify(metadata)} -->\n\n## 研究结论\n\n先验证本地版本。` }],
      opportunityIds: new Set([metadata.opportunityId])
    })).toThrow(/完整报告/);
  });
});
