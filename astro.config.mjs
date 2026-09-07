import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://sami.github.io',
  base: '/tm470',
  integrations: [react()],
});
