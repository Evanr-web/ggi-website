// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://gregorythegreat.ca',
  output: 'static',
  integrations: [
    sanity({
      projectId: 'dhzbvx7r',
      dataset: 'production',
      useCdn: true,
      // Enable Studio on /admin route (optional)
      // studioBasePath: '/admin',
    }),
  ],
  image: {
    // Astro built-in image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
