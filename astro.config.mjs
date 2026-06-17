import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://forum.techengineer.co',
  integrations: [sitemap()],
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto'
  }
});