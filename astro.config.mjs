// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';  // ✅ Import the adapter

export default defineConfig({
  output: 'server',  // SSR mode
  adapter: node({    // ✅ Call as function, not string
    mode: 'standalone',
  }),
  
  // SEO settings
  site: 'https://forum.techengineer.co/',
  trailingSlash: 'never',
  
  build: {
    inlineStylesheets: 'auto'
  }
});