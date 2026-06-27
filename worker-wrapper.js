// Worker wrapper — injects 301 redirect logic before the Astro worker handles requests.
// This file wraps the Astro-generated entry.mjs and is bundled by esbuild into _worker.js.

import { EXACT_REDIRECTS, PREFIX_REDIRECTS } from './src/redirects.js';
import astroWorker from './dist/server/entry.mjs';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Normalize: strip trailing slash for matching (except root)
    const normalized = path.length > 1 && path.endsWith('/')
      ? path.slice(0, -1)
      : path;

    // Check exact redirects
    let target = EXACT_REDIRECTS[normalized] || EXACT_REDIRECTS[path];

    // Check prefix catch-alls
    if (!target) {
      for (const rule of PREFIX_REDIRECTS) {
        if (path.startsWith(rule.prefix) || normalized.startsWith(rule.prefix)) {
          target = rule.target;
          break;
        }
      }
    }

    if (target) {
      const redirectUrl = new URL(target, url.origin);
      redirectUrl.search = url.search;
      return Response.redirect(redirectUrl.toString(), 301);
    }

    // No redirect — delegate to the Astro worker
    return astroWorker.fetch(request, env, ctx);
  },
};
