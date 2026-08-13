import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('favicon', () => {
  it('defines the radar SVG and links it from the shared layout', async () => {
    const [svg, layout] = await Promise.all([
      readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8'),
      readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8')
    ]);

    expect(svg).toContain('<svg');
    expect(svg).toContain('viewBox="0 0 64 64"');
    expect(svg).toContain('#0a1530');
    expect(svg).toContain('#8f81ff');
    expect(layout).toContain('rel="icon"');
    expect(layout).toContain("`${base}favicon.svg`");
  });
});
