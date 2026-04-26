# Contributing to the GGI Website

A plain-English guide for anyone maintaining the Gregory the Great Institute website. You don't need to be the original developer — just a competent web developer (or an AI coding tool) comfortable with HTML, CSS, and the command line.

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Evanr-web/ggi-website.git
cd ggi-website

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open in your browser
# → http://localhost:4321/
```

The site hot-reloads — save a file, see the change instantly.

---

## Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Framework** | [Astro 6](https://astro.build) | Static site generator — builds HTML at build time, no JavaScript shipped to visitors |
| **CMS** | [Sanity](https://sanity.io) | Content management for events, articles, people, Magnalia issues |
| **Email** | [ActiveCampaign](https://activecampaign.com) | Newsletter signups, contact forms, email sequences |
| **Hosting** | [Cloudflare Pages](https://pages.cloudflare.com) | Static hosting + CDN |
| **Payments** | [Zeffy](https://zeffy.com) | Donation processing (external links) |
| **Repo** | [GitHub](https://github.com/Evanr-web/ggi-website) | Source code |
| **Domain** | gregorythegreat.ca | Managed via Cloudflare DNS |

---

## Project Structure

```
ggi-website/
├── astro.config.mjs        ← Site config (Sanity project ID, sitemap, base URL)
├── package.json             ← Dependencies
├── public/                  ← Static assets (served as-is)
│   ├── images/
│   │   ├── art/             ← Classical paintings, hero images
│   │   ├── branding/        ← GGI seal, Magnalia cover, OG image
│   │   ├── events/          ← Event thumbnails
│   │   └── people/          ← Headshots, team photos
│   ├── icons/               ← SVG icons (torch, cathedral)
│   └── robots.txt
├── src/
│   ├── components/          ← Reusable UI pieces
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   ├── Navigation.astro ← Site-wide nav (desktop + mobile)
│   │   ├── Footer.astro
│   │   ├── EventCard.astro
│   │   ├── GivingTier.astro
│   │   └── ...
│   ├── layouts/             ← Page templates
│   │   ├── BaseLayout.astro ← Every page uses this (head, nav, footer, scroll reveals)
│   │   ├── EventLayout.astro← Template for individual event pages
│   │   └── ArticleLayout.astro ← Template for library articles
│   ├── pages/               ← Each .astro file = one page on the site
│   │   ├── index.astro      ← Homepage
│   │   ├── about/
│   │   │   ├── index.astro  ← Mission & Vision
│   │   │   ├── leadership.astro
│   │   │   ├── founding-director.astro
│   │   │   └── impact.astro
│   │   ├── magnalia/
│   │   │   ├── index.astro  ← Magnalia main page
│   │   │   ├── letter.astro ← Free newsletter signup
│   │   │   ├── subscribe.astro ← Print subscription
│   │   │   ├── patron.astro
│   │   │   ├── issue-one.astro
│   │   │   └── contributors.astro
│   │   ├── programs/
│   │   ├── events/
│   │   ├── library/
│   │   ├── support/
│   │   │   ├── index.astro  ← Giving tiers
│   │   │   ├── donate.astro
│   │   │   └── ambassadors.astro
│   │   ├── contact/
│   │   ├── credits.astro
│   │   ├── privacy.astro
│   │   └── 404.astro
│   └── styles/
│       └── global.css       ← Design tokens, typography, utilities, scroll reveals
└── dist/                    ← Build output (don't edit, auto-generated)
```

---

## How to Do Common Tasks

### Add a New Event Page

1. Copy an existing event file (e.g., `src/pages/events/conference-2026.astro`)
2. Rename it with a URL-friendly slug (e.g., `retreat-2027.astro`)
3. Update the frontmatter, content, and images
4. Add the event to the events index page (`src/pages/events/index.astro`)
5. Add an `EventCard` entry on the homepage if it's a featured event

Once Sanity is wired up, this will instead be: add a new Event document in Sanity Studio.

### Add a New Library Article

1. Copy an existing article file (e.g., `src/pages/library/fine-gathering-ottawa.astro`)
2. Most articles use `ArticleLayout` — check its props in `src/layouts/ArticleLayout.astro`
3. Add a `Card` entry in `src/pages/library/index.astro`

### Add a New Person to Leadership

1. Open `src/pages/about/leadership.astro`
2. Find the relevant section (Staff, Board, Fellows, Advisory Board)
3. Add a new entry following the existing pattern
4. Add their headshot to `public/images/people/` (aim for ~200×200px, JPG)

### Update Navigation

Open `src/components/Navigation.astro`. The nav structure is a plain array at the top of the file — add, remove, or reorder items there. Desktop dropdowns and mobile menus both render from this same array.

### Change Design Tokens (Colors, Fonts, Spacing)

Open `src/styles/global.css`. All design tokens are CSS custom properties in the `:root` block at the top:

```css
--color-navy: #0e3352;
--color-gold: #b89a47;
--color-crimson: #84292d;
--font-display: 'Cormorant Garamond', Georgia, serif;
--font-body: 'Source Serif 4', Georgia, serif;
--font-ui: 'Inter', system-ui, sans-serif;
```

Change a value here and it updates everywhere.

---

## Design System Reference

### Colors
- **Navy** `#0e3352` — primary brand, backgrounds, headings
- **Gold** `#b89a47` — accents, CTAs, labels
- **Crimson** `#84292d` — form buttons, emphasis
- **Parchment** `#f8ebd9` — page background
- **Linen** `#faf6f0` — alternating section backgrounds
- **Ivory** `#e2e1cb` — secondary background

### Typography
- **Display** — Cormorant Garamond (headings, hero text, tier names)
- **Body** — Source Serif 4 (paragraphs, descriptions)
- **UI** — Inter (labels, nav, buttons, metadata)

### Section Patterns
- `.section` — standard vertical padding
- `.section--dark` — navy background, light text
- `.section--linen` — linen background for alternating rhythm
- `.container` — centered content, max 1200px
- `.section-header` — centered label + heading, used on most pages

### Components
- **Button** — `variant="primary"` (gold), `"secondary"` (outlined), `"tertiary"` (text link)
- **Card** — image + title + description + meta, optional `href` for full-card link
- **EventCard** — date badge + thumbnail + details
- **GivingTier** — pricing card with benefits list
- **SectionDivider** — gold rule between major sections
- **QuoteBlock** — styled blockquote with attribution

### Scroll Reveals
Add `class="reveal"` to any element to animate it on scroll (fade up). Variants:
- `reveal--left` / `reveal--right` — slide in from side
- `reveal--scale` — scale up
- `reveal-stagger` on a parent + `reveal` on children — staggered entrance

These respect `prefers-reduced-motion` automatically.

---

## Build & Deploy

```bash
# Build the site
npm run build
# Output goes to dist/

# Preview the build locally
npm run preview

# Deploy — push to main branch, Cloudflare Pages auto-deploys
git push origin main
```

For GitHub Pages (staging):
```bash
SITE=https://evanr-web.github.io npm run build
npx gh-pages -d dist
```

---

## Sanity CMS

- **Project ID:** `dhzbvx7r`
- **Dataset:** `production`
- **Studio URL:** (to be configured — typically studio.gregorythegreat.ca)

Content types managed by Sanity (once fully wired):
- Events
- Library articles
- People (leadership, fellows, advisory board)
- Magnalia issues
- Endorsements

Marketing pages (homepage, about, support, programs, ambassador) are **not** in Sanity — they're hand-coded Astro pages with specific layouts.

---

## ActiveCampaign

All forms currently use `action="#"` as placeholder. When ActiveCampaign is configured:
- Replace form actions with ActiveCampaign endpoints (embedded forms or API)
- Each form should tag contacts appropriately (e.g., "magnalia-letter", "ambassador-application", "contact-general")
- Welcome email sequences trigger from these tags

---

## Important Notes

- **Images:** Keep under 300KB. JPG for photos, PNG for logos/seals, SVG for icons. Sanity handles image transforms when used via CMS.
- **Apostrophes in code:** If embedding Ukrainian or French text in JavaScript strings, always use double quotes. Single-quoted strings with Unicode apostrophes silently break.
- **Service worker:** Browser caching can serve stale pages. Cmd+Shift+R to hard refresh during development.
- **Base URL:** The site uses `import.meta.env.BASE_URL` for all internal links so it works on both GitHub Pages (`/ggi-website/`) and production (`/`).

---

## Need Help?

If you're a developer picking this up:
1. Read this file
2. Run `npm run dev` and browse the site
3. Look at 2–3 page files to understand the pattern
4. Make your changes and test locally
5. Push to main

The codebase is intentionally simple — no build toolchain complexity, no client-side framework, no state management. It's HTML templates with scoped CSS. If you can read HTML, you can maintain this site.
