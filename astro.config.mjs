// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  // ✅ REMOVE 'server' and the node adapter.
  // 'static' is actually the default, so you don't even need to specify it.
  site: 'https://forum.techengineer.co/',
  trailingSlash: 'never',
  
  build: {
    inlineStylesheets: 'auto'
  }
});