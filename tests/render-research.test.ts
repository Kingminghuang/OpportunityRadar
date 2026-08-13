import { describe, expect, it } from 'vitest';

import { renderResearchMarkdown } from '../src/lib/render-research';

describe('renderResearchMarkdown', () => {
  it('renders GitHub-flavored Markdown while removing unsafe HTML', async () => {
    const html = await renderResearchMarkdown('## 研究结论\n\n| 付费 | 证据 |\n| --- | --- |\n| 高 | 已验证 |\n\n<script>alert("unsafe")</script>');

    expect(html).toContain('<h2>研究结论</h2>');
    expect(html).toContain('<table>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert("unsafe")');
  });
});
