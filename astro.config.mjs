// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

export default defineConfig({
  site: 'https://gregorythegreat.ca',
  output: 'static',
  integrations: [
    sanity({
      projectId: 'dhzbvx7r',
      dataset: 'production',
      useCdn: true,
    }),
  ],
});
