// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

const isGHPages = process.env.SITE?.includes('github.io');

export default defineConfig({
  site: process.env.SITE || 'https://gregorythegreat.ca',
  base: isGHPages ? '/ggi-website' : '/',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sanity({
      projectId: 'dhzbvx7r',
      dataset: 'production',
      useCdn: true,
    }),
  ],
});
