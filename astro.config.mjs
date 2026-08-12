import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kingminghuang.github.io',
  base: '/OpportunityRadar',
  output: 'static',
  vite: {
    resolve: {
      alias: {
        post: new URL('./src/layouts/LegacyMarkdown.astro', import.meta.url).pathname
      }
    }
  }
});
