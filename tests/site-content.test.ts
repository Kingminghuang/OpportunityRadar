import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { loadResearch, researchIndexPath } from '../src/lib/site-content';

describe('loadResearch', () => {
  it('resolves the generated index from the repository root instead of the bundled module location', () => {
    expect(researchIndexPath('/workspace/opportunity-radar')).toBe('/workspace/opportunity-radar/.opportunity-radar/research-index.json');
  });

  it('loads the generated research index and returns no research when it does not exist', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'opportunity-radar-'));
    const indexPath = join(directory, 'research-index.json');
    await writeFile(indexPath, JSON.stringify({
      version: 1,
      generatedAt: '2026-08-13T04:00:00Z',
      research: [{
        issueNumber: 17,
        issueUrl: 'https://github.com/Kingminghuang/OpportunityRadar/issues/17',
        title: '[Deep Dive] AI 编程会话管理器',
        updatedAt: '2026-08-13T04:00:00Z',
        metadata: {
          version: 1,
          opportunityId: '2026-08-12--ai-session-manager',
          originReport: '2026-08-12',
          originSlug: 'ai-session-manager',
          status: 'research-complete',
          siteSummary: '验证本地会话管理是否值得付费。'
        },
        markdown: `## 研究结论

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

若没有五位愿意试用则停止。`
      }]
    }), 'utf8');

    expect(loadResearch(indexPath)).toHaveLength(1);
    expect(loadResearch(join(directory, 'missing.json'))).toEqual([]);
  });
});
