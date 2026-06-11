import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Make sure output: 'server' and adapter: node() are COMPLETELY GONE
  integrations: [
    // ... your integrations
  ],
});