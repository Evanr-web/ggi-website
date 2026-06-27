# GGI Website — Glass Break Handoff Document

**Purpose:** If Evan Ropp is unavailable, this document contains everything a developer needs to maintain, update, debug, and operate the Gregory the Great Institute website and all supporting systems.

**Audience:** A cold developer who has never seen this project. This document should be self-contained enough that they can get the site running locally, understand how every piece connects, and resolve common issues without prior context.

**Last Updated:** June 27, 2026
**Prepared by:** Evan Ropp (Fundraising Chair, GGI)

> ⚠️ **CONFIDENTIAL** — This document contains (or will contain) credentials and access details. Store securely. Do not commit credentials to GitHub.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Developer Setup (From Zero)](#2-developer-setup-from-zero)
3. [How the Build Works](#3-how-the-build-works)
4. [Codebase Map](#4-codebase-map)
5. [Sanity CMS](#5-sanity-cms)
6. [Cloudflare Pages & Functions](#6-cloudflare-pages--functions)
7. [GitHub & CI/CD](#7-github--cicd)
8. [ActiveCampaign (Email & CRM)](#8-activecampaign-email--crm)
9. [Zeffy (Donations & Registration)](#9-zeffy-donations--registration)
10. [Domain, DNS & Email Authentication](#10-domain-dns--email-authentication)
11. [Security Architecture](#11-security-architecture)
12. [Day-to-Day Operations](#12-day-to-day-operations)
13. [Troubleshooting Guide](#13-troubleshooting-guide)
14. [Emergency Procedures](#14-emergency-procedures)
15. [How-To: Common Developer Tasks](#15-how-to-common-developer-tasks)
16. [Credentials Vault](#16-credentials-vault)

---

## 1. System Overview

The GGI website is a **static site** built with Astro 6, content managed through Sanity CMS, hosted on Cloudflare Pages, with email marketing through ActiveCampaign and donation processing through Zeffy.

### Architecture

```
Content editors (Ryan, Victor, Catherine)
        │
        ▼
   Sanity Studio ──────── sanity.io (content database)
   (gregorythegreat.       │
    sanity.studio)         │ webhook on publish
        │                  │
        │                  ▼
   GitHub repo ─────────► Cloudflare Pages (hosting)
   Evanr-web/ggi-website  gregorythegreat.ca
   (source code)           ggi-website.pages.dev
                           │
                     ┌─────┴──────┐
                     │ Cloudflare  │
                     │ Functions   │
                     │ (7 API      │
                     │ endpoints)  │
                     └─────┬──────┘
                           │
                    ┌──────┴───────┐
                    │ ActiveCampaign│──── Email campaigns, automations
                    │ (CRM/email)  │     Welcome series, newsletters
                    └──────────────┘

   Zeffy (donations & event registration) — separate platform, linked via URLs
   Google Workspace — email (gregorythegreat.ca domain, DMARC/SPF/DKIM verified)
```

### How Content Gets Published

1. An editor creates/updates content in **Sanity Studio** (web-based CMS)
2. Clicking "Publish" in Sanity triggers a **webhook** to Cloudflare
3. Cloudflare pulls the latest code from **GitHub**, runs the build (~1-2 min)
4. The updated static site is live at **gregorythegreat.ca**

No code changes required for content updates. Code changes go through GitHub → auto-deploy.

### Key People

| Person | Role | Contact For |
|--------|------|-------------|
| **Evan Ropp** | Technical lead, Fundraising Chair | Code, deploys, DNS, debugging |
| **Ryan Topping** | Executive Director | Organizational decisions, escalation |
| **Victor Carpay** | Comms / CMS user | Content questions, CMS workflow |
| **Catherine Renneberg** | Programs | Program-related content |

---

## 2. Developer Setup (From Zero)

### Prerequisites

- **Node.js 22** (not 23, not 25 — see [Node Version warning](#node-version-critical-warning) below)
- **npm** (comes with Node)
- **Git**
- A **Sanity account** added to the project (for CMS access)

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/Evanr-web/ggi-website.git
cd ggi-website

# 2. Verify Node version — MUST be 22.x
node -v
# If wrong version, install Node 22 via nvm, fnm, or direct download
# nvm install 22 && nvm use 22
# The repo has a .nvmrc file that pins Node 22

# 3. Install website dependencies
npm install

# 4. Install Sanity Studio dependencies
cd sanity
npm install
cd ..

# 5. Create environment variables
# Create a .env file in the project root:
cat > .env << 'EOF'
SANITY_READ_TOKEN=<viewer-token-from-credentials-vault>
SANITY_PREVIEW_TOKEN=<preview-token-from-credentials-vault>
TURNSTILE_SECRET_KEY=<turnstile-secret-from-credentials-vault>
AC_API_KEY=<activecampaign-api-key>
AC_API_URL=https://gregorythegreat.api-us1.com
EOF

# 6. Run the dev server
npm run dev -- --host 0.0.0.0
# Site available at http://localhost:4321

# 7. Run Sanity Studio (separate terminal)
cd sanity
npx sanity dev
# Studio available at http://localhost:3333
```

### Node Version: CRITICAL WARNING

**The project requires Node 22.** This is pinned in `.nvmrc` and `package.json` (`engines.node >= 22.12.0`).

Node 25 has a **broken `simdjson` native dependency** that causes build failures. If you see errors mentioning `simdjson` or native module loading failures, your Node version is wrong. Downgrade to Node 22 immediately.

```bash
# If using Homebrew on macOS:
PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run build

# If using nvm:
nvm use 22
```

### Verify Your Setup Works

```bash
# Build the site (same command Cloudflare runs)
npm run build

# You should see:
# 1. Astro build output (pages generated)
# 2. esbuild bundling the worker
# 3. Pagefind indexing pages
# No errors = you're good
```

---

## 3. How the Build Works

The build command in `package.json` is a **three-stage pipeline**:

```bash
astro build && \
npx esbuild dist/server/entry.mjs --bundle --format=esm \
  --outfile=dist/client/_worker.js \
  --conditions=workerd --platform=neutral \
  '--external:node:*' '--external:cloudflare:*' && \
npx pagefind --site dist/client --root-selector main
```

### Stage 1: Astro Build (`astro build`)

- Reads all `.astro` pages from `src/pages/`
- Fetches content from Sanity CMS via GROQ queries (defined in `src/lib/sanity.ts`)
- Generates static HTML into `dist/client/` (public-facing files)
- Generates server entry at `dist/server/entry.mjs` (for Cloudflare Workers/Functions)
- The `@astrojs/cloudflare` adapter handles this split

### Stage 2: esbuild Worker Bundle

- Takes the server entry point (`dist/server/entry.mjs`) and bundles it into a single Cloudflare Workers-compatible file (`dist/client/_worker.js`)
- This is what handles server-side routes (preview pages, any SSR)
- The `--conditions=workerd` flag targets the Cloudflare Workers runtime
- External `node:*` and `cloudflare:*` imports are left for the runtime to resolve

### Stage 3: Pagefind Indexing (`npx pagefind`)

- Crawls the built HTML in `dist/client/`
- Only indexes content inside `<main>` elements (`--root-selector main`)
- Generates a client-side search index
- All `<h1>` tags have `data-pagefind-weight="10"` for ranking boost
- Article/event `<h1>`s also have `data-pagefind-meta="title"` for display

### Build Output Structure

```
dist/
├── client/           ← This is what gets deployed to Cloudflare
│   ├── _headers      ← Security headers (copied from public/_headers)
│   ├── _worker.js    ← Bundled Cloudflare Worker (from esbuild)
│   ├── _pagefind/    ← Search index
│   ├── index.html    ← Homepage
│   ├── about/        ← Static HTML pages
│   ├── docs/         ← Static assets (PDFs, etc.)
│   └── ...
└── server/
    └── entry.mjs     ← Raw server entry (consumed by esbuild, not deployed)
```

**⚠️ Deploy target is `dist/client/` only.** Never deploy `dist/server/` directly. The esbuild step bundles the server entry into `dist/client/_worker.js`.

### What Astro Config Controls

```javascript
// astro.config.mjs
export default defineConfig({
  site: process.env.SITE || 'https://gregorythegreat.ca',
  base: isGHPages ? '/ggi-website' : '/',    // Different base for GitHub Pages preview
  trailingSlash: 'always',                    // All URLs end with /
  output: 'static',                           // Static site generation
  adapter: cloudflare(),                      // Cloudflare Pages adapter
  integrations: [
    sanity({ projectId: 'dhzbvx7r', dataset: 'production', useCdn: true }),
    sitemap(),
  ],
});
```

Key: The `SITE` environment variable controls the base URL. On Cloudflare it's `https://gregorythegreat.ca`. On GitHub Pages it's `https://evanr-web.github.io` (which also flips the base path to `/ggi-website`).

---

## 4. Codebase Map

```
ggi-website/
├── astro.config.mjs        # Astro configuration (adapter, integrations, site URL)
├── package.json             # Dependencies, build command, Node engine requirement
├── .nvmrc                   # Pins Node 22
├── .env                     # Local environment variables (not in Git)
│
├── src/
│   ├── pages/               # Every .astro file = a page on the site
│   │   ├── index.astro                    # Homepage
│   │   ├── 404.astro                      # Error page
│   │   ├── about/                         # /about/* pages
│   │   ├── careers/index.astro            # /careers/
│   │   ├── contact/index.astro            # /contact/
│   │   ├── events/                        # /events/* (static + archive)
│   │   ├── library/
│   │   │   ├── index.astro                # Library listing (editorial layout)
│   │   │   ├── [slug].astro               # Dynamic CMS-driven articles
│   │   │   └── *.astro                    # Static articles
│   │   ├── magnalia/                      # /magnalia/* pages
│   │   ├── preview/                       # Sanity live preview routes (SSR)
│   │   │   ├── homepage.astro
│   │   │   ├── careers/[slug].astro
│   │   │   ├── events/[slug].astro
│   │   │   ├── library/[slug].astro
│   │   │   ├── magnalia/[slug].astro
│   │   │   ├── programs/[slug].astro
│   │   │   └── site-settings.astro
│   │   ├── programs/
│   │   │   ├── index.astro                # Programs listing
│   │   │   ├── [slug].astro               # Dynamic CMS-driven programs
│   │   │   └── *.astro                    # Static program pages
│   │   └── support/                       # /support/* (donate, tiers, ambassadors)
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro      # Base HTML shell (head, nav, footer, scripts)
│   │   ├── ArticleLayout.astro   # Library article pages (Goudy drop caps)
│   │   └── EventLayout.astro     # Event pages (status badges, registration CTAs)
│   │
│   ├── components/               # 25 reusable UI components
│   │   ├── Navigation.astro      # Site navigation with dropdown menus
│   │   ├── Footer.astro          # Site footer
│   │   ├── Hero.astro            # Page hero sections
│   │   ├── Card.astro            # Content cards (events, articles)
│   │   ├── EventCard.astro       # Event-specific card
│   │   ├── Button.astro          # Styled button component
│   │   ├── BookStudyForm.astro   # Book study registration form
│   │   ├── EventNotifyForm.astro # "Notify me" form for past/upcoming events
│   │   ├── CanadaGroupMap.astro  # Interactive SVG map of reading groups
│   │   ├── GoogleMap.astro       # Embedded Google Map
│   │   ├── Testimonials.astro    # Auto-carousel from Sanity data
│   │   ├── RibbonBanner.astro    # Top-of-site announcement bar
│   │   ├── FlyinPopup.astro      # Timed popup (CMS-controlled)
│   │   ├── Search.astro          # Pagefind search component
│   │   ├── GivingTier.astro      # Donation tier card
│   │   ├── DarkSection.astro     # Dark-background section wrapper
│   │   ├── ShareBar.astro        # Social share buttons
│   │   ├── QuoteBlock.astro      # Styled pull quotes
│   │   ├── SectionDivider.astro  # Visual section separator
│   │   ├── AddToCalendar.astro   # .ics calendar download
│   │   ├── EndorsementCard.astro # Endorsement display
│   │   ├── NewsletterModal.astro # Newsletter signup modal
│   │   ├── EventInterestModal.astro # Event interest modal
│   │   ├── Breadcrumbs.astro     # Breadcrumb navigation
│   │   └── BackToTop.astro       # Scroll-to-top button
│   │
│   ├── lib/
│   │   └── sanity.ts             # ALL Sanity CMS queries (346 lines)
│   │                               Every GROQ query in the project lives here.
│   │                               This is the single source of truth for what
│   │                               data the site pulls from the CMS.
│   │
│   └── styles/
│       └── global.css            # Global styles, CSS custom properties,
│                                   brand colors, typography, spacing
│
├── public/
│   ├── _headers                  # Cloudflare security headers (CSP, HSTS, etc.)
│   ├── docs/                     # Static PDFs (impact report, etc.)
│   ├── fonts/                    # Web fonts (Goudy Initialen for drop caps)
│   └── images/                   # Static images
│
├── functions/
│   └── api/                      # Cloudflare Pages Functions (serverless)
│       ├── _shared.js            # Shared utilities: AC integration, validation,
│       │                           Turnstile verification, CORS, honeypot,
│       │                           error logging, file type checking
│       ├── subscribe.js          # POST /api/subscribe (newsletter)
│       ├── contact.js            # POST /api/contact
│       ├── ambassador.js         # POST /api/ambassador
│       ├── career.js             # POST /api/career (with file upload)
│       ├── book-study.js         # POST /api/book-study
│       ├── event-interest.js     # POST /api/event-interest
│       └── leadership.js         # POST /api/leadership
│
├── sanity/
│   ├── sanity.config.ts          # Sanity Studio configuration
│   ├── schemas/                  # CMS content type definitions
│   ├── backups/                  # Sanity export backups (gitignored)
│   └── package.json              # Sanity Studio dependencies
│
├── scripts/
│   └── backup-sanity.sh          # Automated backup script (keeps last 5)
│
├── docs/                         # All documentation (this folder)
│   ├── GLASS-BREAK-HANDOFF.md    # ← You are here
│   ├── OPS-RUNBOOK.md            # Non-technical operations guide
│   ├── cms-guide/                # CMS guide with 25+ screenshots
│   ├── ECOSYSTEM.md              # Full system reference
│   ├── ACTIVECAMPAIGN-SETUP.md   # AC configuration details
│   ├── AC-SENDER-DOMAIN-SETUP.md # DKIM/SPF/DMARC setup
│   ├── FORMS-AND-AC-ARCHITECTURE.md # Form → AC data flow
│   ├── ANALYTICS-AND-UTM-ARCHITECTURE.md # UTM tracking setup
│   ├── GIVING-STRUCTURE.md       # Donation tier operating manual
│   ├── EVENT-REGISTRATION-GUIDE.md # Event registration workflows
│   ├── SANITY-BACKUP.md          # Backup strategy & restore guide
│   ├── UPTIME-MONITORING.md      # Better Stack monitoring setup
│   ├── LAUNCH-CHECKLIST.md       # Pre-launch verification list
│   ├── LAUNCH-HARDENING.md       # Security hardening details
│   ├── FUTURE-IMPROVEMENTS.md    # Backlog and wishlist
│   └── welcome-series/           # 7 HTML email templates for AC
│
└── .github/
    └── workflows/                # GitHub Actions CI/CD
```

### Key File: `src/lib/sanity.ts`

This single file contains **every GROQ query** the site uses to fetch data from Sanity. If you need to understand what data a page pulls, look here. It exports named functions like:

- `getSiteSettings()` — global config (banner, popup, social links, footer)
- `getHomepage()` — homepage content blocks
- `getEvents()` — all events
- `getPrograms()` — all programs
- `getLibraryItems()` — all library articles
- `getPeople()` — team/board/contributor bios
- `getBookStudies()` — reading group book list
- `getReadingGroups()` — map data (province, city, group count)
- `getCareerPostings()` — job listings
- `getMagnaliaIssues()` — journal issues
- `getGivingTiers()` — donation tier data
- `urlFor(source)` — Sanity image URL builder

Each page imports the function it needs and calls it at build time (in the Astro frontmatter). The data is baked into static HTML.

### Key File: `public/_headers`

Controls all HTTP security headers served by Cloudflare. The current Content Security Policy allows:

```
script-src: 'self' 'unsafe-inline' cdn.sanity.io challenges.cloudflare.com www.zeffy.com zeffy-scripts.s3.ca-central-1.amazonaws.com
style-src: 'self' 'unsafe-inline' fonts.googleapis.com
font-src: 'self' fonts.gstatic.com
img-src: 'self' data: cdn.sanity.io *.sanity.io i.ytimg.com
connect-src: 'self' *.sanity.io *.apicdn.sanity.io
frame-src: youtube.com zeffy.com challenges.cloudflare.com
frame-ancestors: 'none'
```

**If you add a new external script, font, image source, or iframe embed, you must update this CSP or it will be silently blocked by the browser.** This is the most common "it works locally but not in production" issue.

### Key File: `functions/api/_shared.js`

All 7 API endpoints share this module. It provides:

- **`addContact(env, options)`** — Creates/updates a contact in ActiveCampaign (with list subscription, tags, and UTM tracking)
- **`corsHeaders(origin)`** — CORS with allowed-origin allowlist
- **`verifyTurnstile(request, env, body)`** — Cloudflare CAPTCHA verification
- **`checkHoneypot(body)`** — Invisible honeypot field detection (silent bot rejection)
- **`isValidEmail(str)`** — Email format validation
- **`sanitize(str, maxLen)`** — Input sanitization (strips `<>`, enforces length)
- **`isAllowedFile(file)`** — File upload type restriction (PDF/DOC/DOCX only)
- **`logError(endpoint, err, context)`** — Structured error logging (visible in Cloudflare dashboard)

**CORS allowed origins:** `gregorythegreat.ca`, `www.gregorythegreat.ca`, `evanr-web.github.io`, `ggi-website.pages.dev`

### Design System Quick Reference

| Element | Value |
|---------|-------|
| Navy | `#0e3352` |
| Gold | `#b89a47` |
| Crimson | `#84292d` |
| Laurel Green | `#2d6a4f` (ribbon banner) |
| Parchment | `#f8ebd9` |
| Display font | `--font-display` (CSS variable) |
| Body font | `--font-body` |
| UI font | `--font-ui` |
| Drop caps | Goudy Initialen (crimson, on ArticleLayout pages) |
| Tagline | Fides ✠ Ratio ✠ Cultura |

---

## 5. Sanity CMS

### What It Is

Sanity is the headless CMS. All dynamic website content lives here — programs, events, library articles, career postings, Magnalia issues, team bios, and site-wide settings. Non-technical editors use it through a browser-based dashboard.

### Key URLs

| Resource | URL |
|----------|-----|
| Sanity Studio (hosted) | https://gregorythegreat.sanity.studio/ |
| Sanity Project Dashboard | https://www.sanity.io/manage/project/dhzbvx7r |
| Sanity Status Page | https://status.sanity.io |

### Project Details

- **Project ID:** `dhzbvx7r`
- **Dataset:** `production`
- **Plan:** Free tier (sufficient for current scale)
- **API version used:** `2024-01-01`

### Content Types (Schemas)

| Schema | What It Controls | Enable/Disable Toggle | Notes |
|--------|-----------------|----------------------|-------|
| `siteSettings` | Global site config | N/A (singleton) | Ribbon banner, popup, social links, footer, CRA number |
| `homepage` | Homepage content | N/A (singleton) | Hero text, CTAs, video, featured items, pillars |
| `program` | Program pages | ✅ Yes | Conference, book studies, faith & reason, masterclasses |
| `event` | Event listings | ✅ Yes | Conferences, book studies, camps, prayer breakfast |
| `libraryItem` | Articles & resources | ✅ Yes | Essays, videos, resources. Has `featured` toggle too |
| `careerPosting` | Job listings | ✅ Yes | Active toggle controls visibility |
| `magnaliaIssue` | Journal issues | ⭐ "Current Issue" toggle | Cover, TOC, sample article, contributors |
| `person` | Team/contributor bios | Published toggle | Board, staff, contributors, advisors |
| `bookStudy` | Reading group books | No | Book title, author, month, year, status |
| `readingGroup` | Map data | Active toggle | Province, city, group count (feeds CanadaGroupMap) |
| `givingTier` | Donation tiers | No | Friend, Patron, Leadership — pricing, benefits |
| `tag` | Library topic tags | No | Used for categorizing library items |
| `testimonial` | Program testimonials | No | Quote + attribution, linked to programs |

### How Data Flows: Sanity → Website

1. Editor publishes a document in Sanity Studio
2. At build time, `src/lib/sanity.ts` runs GROQ queries against the Sanity Content Lake API
3. Each page's frontmatter calls the relevant query function (e.g., `getEvents()`)
4. Astro generates static HTML with the fetched data baked in
5. **Content is frozen at build time.** Changes in Sanity don't appear until the next build.

### API Tokens (3 tokens, different permissions)

| Token | Environment Variable | Permission | Used By |
|-------|---------------------|------------|---------|
| Viewer | `SANITY_READ_TOKEN` | Read-only, published content | Website build (fetches content) |
| Editor | `SANITY_TOKEN` | Read + write | Backup script, data imports |
| Preview | `SANITY_PREVIEW_TOKEN` | Read drafts | Preview routes (`/preview/*`) |

Managed at: https://www.sanity.io/manage/project/dhzbvx7r/api#tokens

### CORS Settings

Allowed origins for browser-based Sanity API access:
- `gregorythegreat.ca`
- `www.gregorythegreat.ca`
- `evanr-web.github.io`

Managed at: https://www.sanity.io/manage/project/dhzbvx7r/api#cors-origins

### Sanity Webhook → Cloudflare Auto-Deploy

A webhook is configured in the Sanity dashboard (**API → Webhooks**) that fires on every create/update/delete in the `production` dataset. It hits the Cloudflare Pages deploy hook URL, triggering a rebuild.

**Deploy hook URL:** Set in Sanity dashboard (also stored in Cloudflare: Pages → ggi-website → Settings → Builds & deployments → Deploy hooks)

**If the webhook stops working:**
1. Check Sanity dashboard → API → Webhooks → look for delivery failures
2. Verify the deploy hook URL hasn't changed in Cloudflare
3. Recreate if needed: Cloudflare dashboard → Pages → ggi-website → Settings → Builds & deployments → Deploy hooks → "Add deploy hook" (name it "Sanity CMS", branch `main`) → copy URL → paste into Sanity webhook

### Sanity Live Preview

Seven preview routes exist under `/preview/` for editors to see unpublished draft content:

| Route | What It Previews |
|-------|-----------------|
| `/preview/homepage` | Homepage draft changes |
| `/preview/library/[slug]` | Library article drafts |
| `/preview/events/[slug]` | Event drafts |
| `/preview/programs/[slug]` | Program drafts |
| `/preview/magnalia/[slug]` | Magnalia issue drafts |
| `/preview/careers/[slug]` | Career posting drafts |
| `/preview/site-settings` | Site settings drafts |

These routes use the `SANITY_PREVIEW_TOKEN` to fetch draft documents. They are configured as iframe preview panes in Sanity Studio (split-screen editing).

### Backups

- **Automated monthly backup:** Cron job runs on the 1st of each month at 7 AM MST
- **Backup script:** `scripts/backup-sanity.sh` (keeps last 5 backups)
- **Manual backup:**
  ```bash
  cd sanity
  npx sanity dataset export production ./backups/production-$(date +%Y-%m-%d).tar.gz
  ```
- **Restore to test dataset first (recommended):**
  ```bash
  npx sanity dataset create restore-test
  npx sanity dataset import ./backups/production-YYYY-MM-DD.tar.gz restore-test
  # Verify in Studio, then:
  npx sanity dataset import ./backups/production-YYYY-MM-DD.tar.gz production --replace
  npx sanity dataset delete restore-test
  ```
- **Baseline backup:** May 8, 2026 (84 documents, 36 assets)
- Full details: `docs/SANITY-BACKUP.md`

### Sanity Studio Users

Managed at: https://www.sanity.io/manage/project/dhzbvx7r/members

### CMS User Guide

A comprehensive guide with 25+ screenshots is at `docs/cms-guide/CMS-GUIDE.md`. It walks through every content type, the sidebar structure, adding/editing content, SEO fields, and revision history.

---

## 6. Cloudflare Pages & Functions

### What It Is

Cloudflare Pages hosts the static website and runs serverless API functions (form submissions). It also provides DNS management, SSL, DDoS protection, bot protection, and CDN.

### Key URLs

| Resource | URL |
|----------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Pages Project | Dashboard → Pages → `ggi-website` |
| DNS Settings | Dashboard → `gregorythegreat.ca` → DNS |
| Functions Logs | Dashboard → Pages → `ggi-website` → Functions tab |

### Pages Project Configuration

| Setting | Value |
|---------|-------|
| Project name | `ggi-website` |
| Production URL | `gregorythegreat.ca` (also `ggi-website.pages.dev`) |
| Build command | `npm run build` |
| Build output directory | `dist/client/` |
| Root directory | `/` (project root) |
| Node version | `22` (via `.nvmrc`) |
| Connected GitHub repo | `Evanr-web/ggi-website` |
| Production branch | `main` |
| Auto-deploy | Yes — every push to `main` triggers a rebuild |

### Environment Variables (Cloudflare Pages)

Set in: Cloudflare Dashboard → Pages → ggi-website → Settings → Environment variables

| Variable | Purpose | Where to get it |
|----------|---------|----------------|
| `SANITY_READ_TOKEN` | Sanity viewer token (read-only) | Sanity dashboard → API → Tokens |
| `SANITY_PREVIEW_TOKEN` | Sanity preview token (draft access) | Sanity dashboard → API → Tokens |
| `TURNSTILE_SECRET_KEY` | Cloudflare CAPTCHA secret | Cloudflare → Turnstile → Site → Settings |
| `AC_API_KEY` | ActiveCampaign API key | AC → Settings → Developer |
| `AC_API_URL` | ActiveCampaign API URL | `https://gregorythegreat.api-us1.com` |
| `NODE_VERSION` | Node.js version for build | `22` |
| `SITE` | Site base URL | `https://gregorythegreat.ca` |

**⚠️ If any of these are missing or wrong, the build or forms will fail.** Check these first when debugging.

### Cloudflare Functions (API Endpoints)

These are serverless functions that run on Cloudflare's edge. They handle all form submissions and forward data to ActiveCampaign.

| Endpoint | File | Purpose | AC List ID | AC Tag ID |
|----------|------|---------|------------|-----------|
| `POST /api/subscribe` | `functions/api/subscribe.js` | Newsletter signup | `4` | `1` |
| `POST /api/contact` | `functions/api/contact.js` | Contact form | varies | varies by subject |
| `POST /api/ambassador` | `functions/api/ambassador.js` | Ambassador application | — | `ambassador` |
| `POST /api/career` | `functions/api/career.js` | Career application (with file upload) | — | `career-applicant` |
| `POST /api/book-study` | `functions/api/book-study.js` | Book study registration | — | — |
| `POST /api/event-interest` | `functions/api/event-interest.js` | Event interest/notification | — | — |
| `POST /api/leadership` | `functions/api/leadership.js` | Leadership circle signup | — | — |

**Every endpoint includes:**
1. Turnstile (CAPTCHA) verification
2. Honeypot field detection (invisible `website` field — bots fill it, humans don't → silent rejection with fake 200 OK)
3. Input validation (email regex, string sanitization, length limits)
4. CORS origin checking (allowlist in `_shared.js`)
5. Structured error logging (`console.error` visible in Cloudflare dashboard)

### How to Debug Functions

1. **Cloudflare Dashboard → Pages → ggi-website → Functions tab**
2. Click "Begin log stream" (or check recent invocations)
3. Errors from `logError()` in `_shared.js` appear here with endpoint name, error message, and partial stack trace
4. Check the specific function file in `functions/api/` to understand the expected request format

### Security Features (Cloudflare)

| Feature | Status | Details |
|---------|--------|---------|
| Turnstile (CAPTCHA) | ✅ Active | Site key: `0x4AAAAAADm6eYaBvIIwZNRm` — on all 14 forms |
| Bot Fight Mode | ✅ Enabled | Cloudflare → Security → Bots |
| Security Headers | ✅ Active | CSP, HSTS, X-Frame-Options DENY, nosniff (in `public/_headers`) |
| SSL/TLS | ✅ Automatic | Full (strict) via Cloudflare |
| DDoS Protection | ✅ Automatic | Cloudflare built-in |

### Deployment Rollback

If a bad deploy goes out:
1. Cloudflare Dashboard → Pages → ggi-website → Deployments
2. Find the last known-good deployment
3. Click the three-dot menu → **Rollback to this deploy**
4. The site reverts immediately while you fix the issue

---

## 7. GitHub & CI/CD

### Repository

| Detail | Value |
|--------|-------|
| Repository | https://github.com/Evanr-web/ggi-website |
| Owner | Evanr-web (Evan Ropp) |
| Production branch | `main` |
| GitHub Pages preview | https://evanr-web.github.io/ggi-website/ |
| Actions | https://github.com/Evanr-web/ggi-website/actions |

### CI/CD Pipeline

Two deployment paths exist:

**1. Cloudflare Pages (production):**
- Every push to `main` auto-triggers a Cloudflare Pages build
- Also triggered by Sanity webhook (content changes)
- Build runs on Cloudflare's infrastructure

**2. GitHub Actions (staging preview):**
- Workflow deploys to GitHub Pages (`evanr-web.github.io/ggi-website/`)
- Includes a `verify` job that curls the homepage after deploy — fails the workflow on non-200
- Uses `SITE=https://evanr-web.github.io` and base path `/ggi-website`

### GitHub Actions Secrets

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API access for deployments |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

### How to Make a Code Change

```bash
# 1. Pull latest
git pull origin main

# 2. Make your changes
# Edit files in src/pages/, src/components/, etc.

# 3. Test locally
npm run dev -- --host 0.0.0.0
# Visit http://localhost:4321 and verify

# 4. Build to verify no errors
npm run build

# 5. Commit and push
git add -A
git commit -m "description of change"
git push origin main

# 6. Cloudflare auto-deploys in ~1-2 minutes
# Verify at gregorythegreat.ca
```

---

## 8. ActiveCampaign (Email & CRM)

### What It Is

ActiveCampaign handles all email marketing: newsletters, event announcements, fundraising campaigns, and automated email sequences (welcome series).

### Key URLs

| Resource | URL |
|----------|-----|
| AC Dashboard | https://gregorythegreat.activehosted.com |
| API Base URL | `https://gregorythegreat.api-us1.com` |
| API Docs | https://developers.activecampaign.com |

### Lists (8 configured)

| # | List | Purpose |
|---|------|---------|
| 1 | GGI Newsletter (Magnalia Letter) | Newsletter subscribers |
| 2 | Conference attendees | Event registrations |
| 3 | Book Study participants | Book study signups |
| 4 | Ambassador network | Campus/parish ambassadors |
| 5 | Leadership Circle | Major donors ($5,000+/yr) |
| 6 | Event interest | "Notify me" signups |
| 7 | Career applicants | Job applications |
| 8 | General contacts | Contact form submissions |

### Tags (18 configured)

Tags provide fine-grained segmentation within lists. They track entry point, interest, and donor status. Full list in `docs/ACTIVECAMPAIGN-SETUP.md`.

### UTM Tracking

The website captures UTM parameters from URLs and stores them as custom fields in ActiveCampaign:
- `first_source` / `last_source` (field IDs 2/5)
- `first_medium` / `last_medium` (field IDs 3/6)
- `first_campaign` / `last_campaign` (field IDs 4/7)
- `signup_page` (field ID 8)

"First" fields use `overwrite: 0` (only set on first contact creation). "Last" fields always overwrite. This tracks both original acquisition source and most recent touchpoint.

Full architecture: `docs/ANALYTICS-AND-UTM-ARCHITECTURE.md`

### Welcome Email Series

7 HTML templates are ready in `docs/welcome-series/`. They need to be imported into ActiveCampaign as an automation sequence. See `docs/welcome-series.md` for the sequence design.

### Sending a Campaign (One-Off Email)

1. AC Dashboard → **Campaigns → Create a Campaign**
2. Click **"Start from scratch instead"** (below the AI generator)
3. Choose **Standard** campaign type
4. Select audience (list or segment)
5. Fill in subject line, from name, from email
6. Click **"Create with email designer"** for drag-and-drop builder
7. Design → Preview → Send test → Schedule or Send

### API Integration Details

All form endpoints use the `addContact()` function in `functions/api/_shared.js`. This function:
1. Creates or updates a contact via `POST /api/3/contact/sync`
2. Subscribes to the specified list via `POST /api/3/contactLists`
3. Adds tags via `POST /api/3/contactTags` (loops through each tag)
4. Includes UTM field values with appropriate overwrite settings

### Key Documentation

| Document | What It Covers |
|----------|---------------|
| `docs/ACTIVECAMPAIGN-SETUP.md` | Full AC setup and configuration |
| `docs/FORMS-AND-AC-ARCHITECTURE.md` | How website forms connect to AC |
| `docs/AC-SENDER-DOMAIN-SETUP.md` | DKIM/SPF DNS record setup for email auth |
| `docs/ANALYTICS-AND-UTM-ARCHITECTURE.md` | UTM tracking field mapping |
| `docs/welcome-series.md` | Welcome email sequence design |
| `docs/welcome-series/` | 7 HTML email templates ready for import |

---

## 9. Zeffy (Donations & Registration)

### What It Is

Zeffy is a **0% fee** Canadian nonprofit payment platform. GGI uses it for conference registration, donation processing, and Magnalia subscriptions. It issues CRA tax receipts automatically.

### Key URL

| Resource | URL |
|----------|-----|
| Dashboard | https://www.zeffy.com/en/dashboard |

### How It Integrates with the Website

Zeffy appears on the website in two ways:

**1. Modal Buttons (most common)**
- HTML anchor elements with a `zeffy-form-link` attribute
- Clicking opens a Zeffy checkout modal overlaying the current page
- Requires `embed-form-script.min.js` loaded globally (in BaseLayout.astro, sourced from `https://www.zeffy.com`)
- Example: `<a href="#" zeffy-form-link="https://www.zeffy.com/en/embed/donation-form/magnalia-patron">Become a Patron</a>`

**2. Inline Embeds**
- Uses `data-zeffy-embed` and `data-form-url` attributes on a div
- Renders the full Zeffy form inline on the page
- Used on the Conference 2026 page for registration
- Example: `<div data-zeffy-embed data-form-url="https://www.zeffy.com/en/embed/ticketing/2nd-annual-renewing-culture-conference-bringing-back-sunday"></div>`

**⚠️ CSP Requirement:** Both methods require these entries in the `_headers` CSP:
- `script-src`: `https://www.zeffy.com https://zeffy-scripts.s3.ca-central-1.amazonaws.com`
- `frame-src`: `https://www.zeffy.com`

Without these, Zeffy modals and embeds will silently fail.

### Active Zeffy Forms

| Page | Form Type | Zeffy Form |
|------|-----------|------------|
| Conference 2026 | Inline embed | Ticketing form |
| Magnalia Patron | Modal button | Donation form |
| Magnalia Subscribe - Order | Modal button | Single issue order |
| Magnalia Subscribe - Subscribe | Modal button | Annual subscription |
| Magnalia Subscribe - Bulk | Modal button | Bulk order |

### What Zeffy Handles

- Payment processing (credit card, no data touches GGI servers)
- Tax receipts (automatic, under Catholic Voices Canada's CRA registration)
- Registrant/donor data (exportable as CSV)
- **No automated sync** between Zeffy and ActiveCampaign currently (manual CSV export/import)

---

## 10. Domain, DNS & Email Authentication

### Domain Registration

| Detail | Value |
|--------|-------|
| Domain | `gregorythegreat.ca` |
| Registrar | **WHC.ca** (not GoDaddy) |
| Nameservers | `pearl.ns.cloudflare.com` / `phil.ns.cloudflare.com` |
| DNS managed at | **Cloudflare** (all DNS changes go here, not WHC) |
| SSL | Automatic via Cloudflare (Full strict) |
| Domain renewal | Check WHC.ca dashboard |

### DNS Records

| Record | Type | Value | Purpose |
|--------|------|-------|---------|
| `@` | CNAME | `ggi-website.pages.dev` | Points domain to Cloudflare Pages (proxied) |
| `www` | CNAME | `ggi-website.pages.dev` | www subdomain (proxied) |
| `_dmarc` | TXT | `v=DMARC1; p=none; ...` | DMARC policy (currently monitor-only) |
| Google DKIM | TXT | (Google-provided) | Google Workspace email authentication |
| Google SPF | TXT | (includes Google servers) | Google Workspace sender verification |

### Email Authentication Status (as of June 27, 2026)

| Provider | SPF | DKIM | DMARC | Status |
|----------|-----|------|-------|--------|
| **Google Workspace** | ✅ Pass | ✅ Pass (selector: `google`) | ✅ Pass | Fully authenticated |
| **ActiveCampaign** | ✅ Configured | ✅ Configured | ✅ Pass | Fully authenticated |

**DMARC policy** is currently `p=none` (monitor mode). This means authentication failures are reported but not blocked. Once consistent pass rates are confirmed over several weeks, the policy should be tightened to `p=quarantine` and eventually `p=reject`.

**DMARC reports** are sent automatically by email providers (Google, etc.) as XML files. They show which IPs sent email as `gregorythegreat.ca` and whether authentication passed.

### If You Need to Change DNS

All DNS changes must be made in the **Cloudflare dashboard** (not at WHC.ca). WHC only controls the nameserver delegation, which points to Cloudflare.

---

## 11. Security Architecture

### Defense Layers

| Layer | What It Does | Where Configured |
|-------|-------------|-----------------|
| **Cloudflare DDoS** | Absorbs volumetric attacks | Automatic |
| **Bot Fight Mode** | Blocks known bot signatures | Cloudflare → Security → Bots |
| **Turnstile CAPTCHA** | Verifies form submitters are human | All 14 forms + 7 API endpoints |
| **Honeypot Fields** | Invisible field that bots fill, humans don't | `_shared.js` → `checkHoneypot()` |
| **Input Validation** | Email regex, string sanitization, length limits | `_shared.js` → `isValidEmail()`, `sanitize()` |
| **File Type Restriction** | Career uploads limited to PDF/DOC/DOCX | `_shared.js` → `isAllowedFile()` |
| **CORS Allowlist** | Only approved origins can hit API | `_shared.js` → `corsHeaders()` |
| **CSP Headers** | Controls what scripts/styles/frames load | `public/_headers` |
| **HSTS** | Forces HTTPS with 1-year max-age | `public/_headers` |
| **X-Frame-Options DENY** | Prevents clickjacking | `public/_headers` |
| **Static Site Architecture** | No server-side database = no SQL injection, no session hijacking | Astro static output |

### What's NOT on the GGI Server

- No credit card data (Zeffy handles all payment processing, PCI-compliant)
- No user accounts or passwords
- No server-side database
- No Google Analytics or third-party tracking pixels
- No cookies (except Cloudflare's edge cookies for bot detection)

---

## 12. Day-to-Day Operations

### Content Updates (No Code Required)

1. Log into [Sanity Studio](https://gregorythegreat.sanity.studio/)
2. Create/edit content → click **Publish**
3. Site auto-rebuilds in ~1-2 minutes (via Sanity webhook → Cloudflare)

Full CMS instructions: `docs/cms-guide/CMS-GUIDE.md`

### Monitoring

| What | How | Frequency |
|------|-----|-----------|
| Site up/down | Health check cron job | 3×/day (8am, 2pm, 8pm MST) → Telegram alert if down |
| Traffic & performance | Cloudflare dashboard → Analytics | On demand |
| Form errors | Cloudflare dashboard → Pages → Functions → Logs | On demand |
| Email delivery | ActiveCampaign → Reports | Monthly |
| Sanity content | Sanity Studio | As needed |
| Donations/registrations | Zeffy dashboard | As needed |
| Deploy status | Cloudflare → Pages → Deployments | After changes |

### Monthly Checklist

- [ ] Test all forms (submit test entries, verify in ActiveCampaign)
- [ ] Review Sanity for stale content (past events still showing, expired banners)
- [ ] Check Cloudflare Analytics for traffic trends
- [ ] Check Cloudflare Functions tab for error spikes
- [ ] Spot-check 5–6 pages on desktop and mobile
- [ ] Run Sanity backup (or verify the monthly cron ran successfully)
- [ ] Review ActiveCampaign contacts (growth, bounce rates, unsubscribes)

---

## 13. Troubleshooting Guide

### Build Failures

**Symptom:** Cloudflare deployment fails, or `npm run build` errors locally.

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `simdjson` / native module error | Wrong Node version | Use Node 22 (`nvm use 22`) |
| Sanity fetch timeout / 401 | Missing or expired `SANITY_READ_TOKEN` | Regenerate token in Sanity dashboard → update Cloudflare env var |
| `Cannot find module` | Missing `npm install` | Run `npm install` in project root |
| esbuild errors | Usually upstream Astro/adapter issue | Check Astro GitHub issues, pin dependency versions |
| Pagefind errors | Build output path changed | Verify `dist/client/` exists after Astro build |

### Content Not Appearing After Publishing

**Symptom:** Published content in Sanity doesn't show on the live site.

1. **Was a rebuild triggered?** Check Cloudflare → Pages → Deployments for a recent build
2. **Did the build succeed?** Look for green checkmark. If red ❌, check build logs
3. **Is it a caching issue?** Try Cmd+Shift+R (hard refresh) or incognito window
4. **Is the content type enabled?** Check the "Enabled" toggle in Sanity (programs, events, library items, career postings all have one)
5. **Manual rebuild:** Push an empty commit or hit the deploy hook directly

### Forms Not Working

**Symptom:** Form submission fails, no data appears in ActiveCampaign.

1. **Check browser console** for CORS or CSP errors
2. **Check Cloudflare Functions logs:** Dashboard → Pages → ggi-website → Functions tab → click "Begin log stream"
3. **Verify env vars exist:** Dashboard → Pages → Settings → Environment variables → confirm `AC_API_KEY` and `AC_API_URL` are set
4. **Test AC API directly:** `curl -H "Api-Token: YOUR_KEY" https://gregorythegreat.api-us1.com/api/3/contacts?limit=1` — should return JSON
5. **Turnstile issues:** If CAPTCHA isn't loading, check CSP allows `challenges.cloudflare.com` in script-src and frame-src

### Search Not Working

**Symptom:** Site search returns no results or stale results.

- Search is rebuilt with every deploy (Pagefind indexes at build time)
- Trigger a rebuild to regenerate the search index
- Verify `pagefind-ui.js` is loaded — it's an **IIFE** (not an ES module), must load via `<script>` tag, NOT `import()`
- Check that `<main>` elements exist on pages (Pagefind only indexes content inside `main`)

### Zeffy Modals Not Opening

**Symptom:** Clicking a Zeffy button does nothing, or the modal doesn't appear.

1. **Check browser console** for CSP violations
2. **Verify CSP** in `public/_headers` includes:
   - `script-src`: `https://www.zeffy.com` AND `https://zeffy-scripts.s3.ca-central-1.amazonaws.com`
   - `frame-src`: `https://www.zeffy.com`
3. **Verify the Zeffy script** is loaded in BaseLayout.astro (the `embed-form-script.min.js` from zeffy.com)
4. **Check the button HTML** — must have `zeffy-form-link` attribute with the full Zeffy URL

### Navigation Dropdown Issues

The navigation dropdown has both CSS `:hover` and JavaScript hover intent:
- CSS handles basic show/hide
- JS adds 400ms leave delay to prevent accidental close
- JS adds/removes `dropdown--open` class
- Escape key closes dropdown
- Gap between nav link and dropdown is 4px with a `::before` bridge zone

### Sanity Studio Won't Load

1. Check [status.sanity.io](https://status.sanity.io)
2. Try different browser or incognito
3. Clear browser cache
4. If running locally: `cd sanity && npx sanity dev` — check terminal for errors
5. Verify your Sanity account has access to project `dhzbvx7r`

---

## 14. Emergency Procedures

### Site Is Down

1. **Check if it's just you:** Try from phone (cellular, not WiFi). Ask someone else.
2. **Check Cloudflare status:** [cloudflarestatus.com](https://www.cloudflarestatus.com)
3. **Check for failed deploys:** Cloudflare → Pages → ggi-website → Deployments
4. **Rollback if bad deploy:** Find last green deployment → three-dot menu → **Rollback to this deploy**
5. **If DNS issue:** Check Cloudflare DNS settings haven't changed. The A/CNAME for `@` and `www` should point to `ggi-website.pages.dev`
6. **Fallback:** The GitHub Pages preview at `evanr-web.github.io/ggi-website/` may still be up (separate infrastructure, may be stale)

**Key insight:** Static sites are resilient. Even if builds break, the last deployed version stays up. Content might be stale, but the site stays online.

### Forms Not Submitting and ActiveCampaign Unreachable

1. Forms will show an error to users, but the site itself stays up
2. Check AC status / try logging into dashboard
3. If AC is down, it's on their end — wait for recovery
4. If API key expired, regenerate in AC → update Cloudflare env var → redeploy

### Need to Roll Back Code

1. **Quick (Cloudflare):** Rollback to previous deployment (see above)
2. **Proper (Git):**
   ```bash
   git log --oneline -10          # Find the last good commit
   git revert HEAD                 # Revert the bad commit
   git push origin main            # Triggers auto-deploy of the fix
   ```

### Lost Access to a Service

| Service | Recovery Path |
|---------|--------------|
| Sanity | Contact sanity.io with the project's registered email |
| Cloudflare | Contact Cloudflare support through dashboard, or email with account details |
| GitHub | Account recovery via registered email / 2FA backup |
| ActiveCampaign | Contact AC support at the account's registered email |
| WHC.ca (domain) | Contact WHC support with domain ownership verification |
| Zeffy | Contact support with organization details |

### Escalation Without Evan

1. **First 24 hours:** Content and the live site are fine. Content editors can continue working in Sanity; auto-deploy will push changes. No urgency unless something is actively broken.
2. **If site is down 48+ hours:** Rollback via Cloudflare (step above), or contact Cloudflare support.
3. **For code changes:** Any Astro/JavaScript developer can work with this codebase. It's standard Astro 6 + Sanity. The codebase map above tells them where everything is.

---

## 15. How-To: Common Developer Tasks

### Add a New Static Page

1. Create a new `.astro` file in the appropriate `src/pages/` subdirectory
2. Import and use `BaseLayout` (or `ArticleLayout` / `EventLayout` depending on content type)
3. For CMS data, import the relevant query from `src/lib/sanity.ts` and call it in the frontmatter
4. Run `npm run dev` to preview
5. Commit and push — auto-deploys

Example skeleton:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getSiteSettings } from '../../lib/sanity';
const settings = await getSiteSettings();
---
<BaseLayout title="New Page" description="Description for SEO" settings={settings}>
  <main>
    <h1>New Page</h1>
    <p>Content here.</p>
  </main>
</BaseLayout>
```

### Add a New CMS-Driven Content Type

1. Create a new schema in `sanity/schemas/` (follow existing patterns)
2. Register it in `sanity/sanity.config.ts`
3. Add GROQ query function in `src/lib/sanity.ts`
4. Create the page(s) in `src/pages/` that call the query
5. Run Sanity Studio locally to test: `cd sanity && npx sanity dev`
6. Commit and push both website and Sanity changes

### Add a New Form

1. Create the form component in `src/components/` (follow `BookStudyForm.astro` pattern)
2. Include Turnstile widget, honeypot field, and proper validation
3. Create the API endpoint in `functions/api/` (follow `subscribe.js` pattern)
4. Import `addContact`, `verifyTurnstile`, `checkHoneypot` etc. from `_shared.js`
5. Test locally with `wrangler pages dev` (or deploy and test on staging)
6. Add the form to `docs/FORMS-AND-AC-ARCHITECTURE.md`

### Add an External Script or Service

1. Add the domain to the appropriate CSP directive in `public/_headers`
2. If it's a script: add to `script-src`
3. If it's an iframe: add to `frame-src`
4. If it loads images: add to `img-src`
5. If it makes API calls from the browser: add to `connect-src`
6. **Test in production** (not just dev) — CSP only applies from the `_headers` file, which Cloudflare serves

### Update Dependencies

```bash
# Check what's outdated
npm outdated

# Update carefully — test after each major bump
npm update

# Always verify the build works
npm run build

# Known constraint: Node must stay at 22.x
```

### Run a Sanity Backup Manually

```bash
cd ggi-website/sanity
npx sanity dataset export production ./backups/production-$(date +%Y-%m-%d).tar.gz
ls -lh ./backups/
```

---

## 16. Credentials

> ⚠️ **All credentials are stored in a separate encrypted document, NOT in this file or in Git.**

The credentials document (`GLASS-BREAK-CREDENTIALS.md`) contains every login, API key, and token needed to operate the GGI digital infrastructure. It is maintained as an **encrypted ZIP file** on Google Drive, accessible to Dr. Topping.

**To access credentials:**
1. Download `GLASS-BREAK-CREDENTIALS.zip` from the shared Google Drive folder
2. Unzip with the password (shared out-of-band — by phone or in person)
3. Open `GLASS-BREAK-CREDENTIALS.md` — it contains all service logins, API keys, and tokens

**If the credentials document is missing or the password is unknown:**
- Check with Dr. Topping (Ryan) — he has the password
- Individual service credentials can be recovered via the registered email addresses for each service

**The credentials document covers:** Sanity CMS, Cloudflare, GitHub, ActiveCampaign, Zeffy, WHC.ca (domain registrar), Google Workspace, and all API tokens / environment variables.

---

## Appendix A: API Contract Reference

All endpoints accept `POST` requests with JSON bodies. All return JSON responses. All require a valid Turnstile CAPTCHA token.

### Common Request Fields (all endpoints)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `cf-turnstile-response` | string | ✅ | Cloudflare Turnstile CAPTCHA token |
| `website` | string | ❌ | Honeypot field — must be empty. Bots that fill it get a silent 200 OK (fake success) |
| `utm_source` | string | ❌ | UTM tracking — stored in AC custom fields |
| `utm_medium` | string | ❌ | UTM tracking |
| `utm_campaign` | string | ❌ | UTM tracking |
| `signup_page` | string | ❌ | Page URL where the form was submitted |

### Common Response Format

**Success (200):**
```json
{ "success": true, "contactId": "12345" }
```

**Validation Error (400):**
```json
{ "error": "Please enter a valid email address" }
```

**CAPTCHA Failure (403):**
```json
{ "error": "CAPTCHA verification failed" }
```

**Server Error (500):**
```json
{ "error": "Failed to subscribe" }
```

### POST /api/subscribe

Newsletter (Magnalia Letter) signup.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `firstName` | string | ❌ | Max 100 chars, `<>` stripped |
| `lastName` | string | ❌ | Max 100 chars, `<>` stripped |

**AC destination:** List ID `4`, Tag ID `1` (`magnalia-letter`)

### POST /api/contact

General contact form.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `firstName` | string | ❌ | Max 100 chars |
| `lastName` | string | ❌ | Max 100 chars |
| `subject` | string | ❌ | Max 50 chars — determines AC tag |
| `message` | string | ❌ | Max 2000 chars |

**AC destination:** List ID `7`, tag varies by subject value (e.g., `contact-speaker-booking`, `contact-programs`, `contact-support`, `contact-volunteering`)

### POST /api/ambassador

Ambassador network application.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `firstName` | string | ❌ | Max 100 chars |
| `lastName` | string | ❌ | Max 100 chars |
| `city` | string | ❌ | Max 100 chars |
| `province` | string | ❌ | Max 100 chars |
| `connection` | string | ❌ | Max 1000 chars — how they're connected to GGI |
| `community` | string | ❌ | Max 1000 chars — their community/parish |
| `ideas` | string | ❌ | Max 1000 chars — how they want to help |

**AC destination:** List ID `5`, Tag ID `2` (`ambassador`)

### POST /api/career

Career/job application with optional file upload.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `firstName` | string | ❌ | Max 100 chars |
| `lastName` | string | ❌ | Max 100 chars |
| `position` | string | ❌ | Max 200 chars |
| `message` | string | ❌ | Max 2000 chars |
| `resume` | File | ❌ | PDF, DOC, or DOCX only (MIME + extension check) |

**AC destination:** List ID `8`, tag `career-applicant`

**Note:** This endpoint accepts `multipart/form-data` (not JSON) when a file is attached. The Turnstile token and honeypot field are read via `formData.get()` rather than from a JSON body.

### POST /api/book-study

Book study registration.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `name` | string | ❌ | Max 200 chars |
| `province` | string | ❌ | Max 50 chars |
| `city` | string | ❌ | Max 100 chars |
| `other_city` | string | ❌ | Max 100 chars — if city not in dropdown |
| `interest` | string | ❌ | Max 50 chars — interest level |
| `host_count` | string | ❌ | Max 20 chars — how many they'd host |
| `magnalia_letter` | string | ❌ | `"yes"` to also subscribe to newsletter |

**AC destination:** Book Study participants list (list ID from config)

### POST /api/event-interest

Event interest / "notify me" form.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `firstName` | string | ❌ | Max 100 chars |
| `lastName` | string | ❌ | Max 100 chars |
| `interestType` | string | ❌ | Max 50 chars — `"notify"` or `"register"` |
| `message` | string | ❌ | Max 1000 chars |
| `events` | string[] | ❌ | Array of event names. Also accepts single `event` string. |

**AC destination:** List ID `6`, tags per event selection

### POST /api/leadership

Leadership Circle signup.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, max 254 chars |
| `firstName` | string | ❌ | Max 100 chars |
| `lastName` | string | ❌ | Max 100 chars |
| `phone` | string | ❌ | Max 30 chars |
| `message` | string | ❌ | Max 2000 chars |

**AC destination:** List ID `12`

### CORS

All endpoints respond to `OPTIONS` preflight requests. Allowed origins:
- `https://gregorythegreat.ca`
- `https://www.gregorythegreat.ca`
- `https://evanr-web.github.io`
- `https://ggi-website.pages.dev`

Requests from other origins receive the default origin (`https://gregorythegreat.ca`) in the `Access-Control-Allow-Origin` header.

---

## Appendix B: Architecture Decision Records

These document the key "why" decisions behind the technology choices. Understanding the reasoning helps future developers make informed changes rather than cargo-culting the current setup.

### ADR-001: Astro over Next.js / Gatsby / WordPress

**Decision:** Astro 6 as the framework.

**Context:** GGI is a content-heavy nonprofit with no user accounts, no authentication, no dynamic application state. The website is primarily a publishing and lead-generation tool.

**Reasoning:**
- **Static-first architecture** — Astro generates plain HTML with zero client-side JavaScript by default. This means maximum performance, maximum security (no server-side runtime to exploit), and maximum reliability (static files survive infrastructure outages).
- **Island architecture** — The rare interactive components (search, forms, map) hydrate independently without shipping a full framework runtime to every page.
- **Content-focused** — Astro's content collections and headless CMS integrations are first-class, unlike Next.js where static generation is an afterthought bolted onto a server framework.
- **Not WordPress** — WordPress requires PHP hosting, a MySQL database, ongoing security patching, plugin management, and is the #1 target for web exploits. For a nonprofit with limited technical staff, eliminating that attack surface entirely is the right call.
- **Not Gatsby** — Gatsby's build times, GraphQL complexity, and declining ecosystem made it a poor long-term bet.

**Trade-off accepted:** Astro is less well-known than Next.js. Hiring a developer who knows Astro specifically may be harder, but any developer comfortable with component-based frameworks (React, Vue, Svelte) can pick up Astro in a day. The `.astro` template syntax is close to JSX/HTML.

### ADR-002: Cloudflare Pages over Vercel / Netlify / Traditional Hosting

**Decision:** Cloudflare Pages for hosting + Cloudflare Functions for server-side form processing.

**Context:** The site needs static hosting, serverless functions for form submissions, DNS management, SSL, and DDoS protection.

**Reasoning:**
- **All-in-one platform** — DNS, hosting, CDN, edge functions, bot protection, and security headers all managed in one dashboard. Reduces the number of accounts and services to maintain.
- **Generous free tier** — Cloudflare Pages has unlimited bandwidth, unlimited sites, and 500 builds/month on the free plan. For a nonprofit, cost matters.
- **Edge network** — 200+ global edge locations means fast load times everywhere, important for a Canadian org with international reach.
- **Cloudflare Functions** — Run on the same platform as the site, no separate serverless provider needed. Simple request/response model for form handling.
- **Not Vercel** — Vercel's free tier has bandwidth limits and the pricing model scales unpredictably. Cloudflare is more generous and predictable.
- **Not Netlify** — Similar capabilities but Cloudflare's DNS and security tooling (Turnstile, Bot Fight Mode) are superior on the free tier.

**Trade-off accepted:** Cloudflare Pages has some quirks — the `@astrojs/cloudflare` adapter requires an esbuild step to bundle the worker, and the `dist/client/` + `dist/server/` output split can confuse developers who expect a single output directory.

### ADR-003: Sanity CMS over Contentful / Strapi / Markdown

**Decision:** Sanity as the headless CMS.

**Context:** Non-technical team members (Ryan, Victor, Catherine) need to manage events, articles, people, and site settings without developer involvement.

**Reasoning:**
- **Hosted Studio** — Sanity Studio runs in the browser with no setup required for editors. No local development environment needed for content work.
- **Real-time collaboration** — Multiple editors can work simultaneously without conflicts.
- **Structured content** — GROQ queries give precise control over what data each page fetches. No over-fetching, no under-fetching.
- **Free tier** — Generous for small teams (3 users, 500K API requests/month, 20GB bandwidth).
- **Portable data** — Full dataset export/import via CLI. GGI owns their data, not locked into Sanity.
- **Not Contentful** — More expensive, less flexible content modeling, harder to customize the editing experience.
- **Not Strapi** — Self-hosted, meaning GGI would need to run and maintain a server + database. Defeats the purpose of going static.
- **Not Markdown/Git** — Non-technical editors can't be expected to write Markdown, commit to Git, and manage pull requests.

**Trade-off accepted:** Content changes aren't instant — there's a 1-2 minute rebuild delay. This is inherent to static site architecture and is worth the performance and security benefits.

### ADR-004: Zeffy over Stripe Direct / PayPal / Donorbox

**Decision:** Zeffy for donation and event registration processing.

**Context:** GGI needs to collect donations and event registrations with Canadian tax receipts.

**Reasoning:**
- **0% platform fees** — Zeffy charges nothing. They ask donors for an optional tip. For a nonprofit, every dollar matters.
- **Canadian CRA tax receipts** — Automatic, compliant, no additional setup.
- **No PCI compliance burden** — All payment data stays on Zeffy's infrastructure. The GGI website never touches credit card numbers.
- **Not Stripe direct** — Would require building a payment form, handling PCI compliance, and managing tax receipt generation. Significant development and compliance overhead for no benefit.

**Trade-off accepted:** Less customization of the checkout experience. Zeffy modals and embeds have their own styling that doesn't perfectly match the GGI brand. The integration is URL-based rather than API-based, so there's no automated sync between Zeffy registrations and ActiveCampaign contacts (manual CSV export/import).

### ADR-005: Static Output with Cloudflare Adapter (not pure static, not full SSR)

**Decision:** `output: 'static'` in Astro config with the `@astrojs/cloudflare` adapter.

**Context:** The site is primarily static content, but Sanity live preview requires server-side rendering for draft documents.

**Reasoning:**
- **Static for production pages** — All public-facing pages are pre-rendered at build time. Maximum performance, cacheable, resilient.
- **SSR for preview routes only** — The `/preview/*` routes need to fetch draft documents from Sanity at request time, which requires a server-side runtime. The Cloudflare adapter handles this via the bundled `_worker.js`.
- **Not pure static** — Without the adapter, preview routes wouldn't work. Editors wouldn't be able to preview drafts in Sanity Studio.
- **Not full SSR** — SSR for every page would mean every request hits Sanity's API, adding latency, API usage costs, and a runtime dependency. Static pages are faster and more reliable.

**Trade-off accepted:** The build pipeline is more complex (three-stage: Astro → esbuild → Pagefind). A simpler `@astrojs/static` adapter would eliminate the esbuild step but lose preview functionality.

---

## Appendix C: Test Strategy

This project does not have automated tests. This is a deliberate decision, not an oversight.

**Rationale:**
- The site is a static marketing site for a nonprofit. The blast radius of a bug is "a page looks wrong" — not data loss, not financial impact, not security breach.
- Static sites are inherently safe — no runtime state, no user sessions, no database mutations from the frontend.
- **The build itself is the primary test.** If Astro can't fetch from Sanity, a component has a syntax error, or a dependency breaks, the build fails and nothing deploys. The existing deployed version stays live.
- A post-deploy smoke test in the GitHub Actions workflow verifies the homepage returns HTTP 200 after every deployment.
- The 7 Cloudflare Functions are simple pass-throughs: validate input → call ActiveCampaign API → return response. There is very little branching logic to test.
- Maintaining a test suite has real cost. For a project maintained by a single developer and potentially handed off to someone unfamiliar, test suites that break on dependency updates create more problems than they solve.

**When to add tests:**
If the project evolves to include any of the following, a test suite should be introduced:
- Dynamic user accounts or authentication
- Payment logic or pricing calculations on the server
- Complex conditional routing in Cloudflare Functions
- Data transformations or business logic beyond input validation

**Where to start (if adding tests):**
The highest-value targets would be the pure utility functions in `functions/api/_shared.js`:
- `isValidEmail()` — edge cases around email format validation
- `sanitize()` — string truncation, `<>` stripping, empty/null handling
- `checkHoneypot()` — verify bot detection logic
- `isAllowedFile()` — MIME type and extension checking

These are pure functions with clear inputs and outputs. A handful of unit tests (using Vitest, which Astro supports natively) would take ~15 minutes to write and would catch regressions if validation logic is modified.

---

## Appendix D: Known Gotchas

These are hard-won lessons from building and maintaining this site. Save a future developer hours of debugging:

1. **Node 22 only.** Node 25 breaks `simdjson`. This will bite anyone who just runs `node` without checking version.

2. **`_headers` CSP blocks new services silently.** If you add Zeffy, YouTube, a new font, a new analytics tool — and it doesn't work in production but works locally — check the CSP in `public/_headers` first.

3. **Pagefind is an IIFE, not an ES module.** You cannot load `pagefind-ui.js` via `import()`. It must be a `<script>` tag. It sets `window.PagefindUI`.

4. **Astro scoped styles don't reach child components.** If you style something in a parent page's `<style>` block, it won't apply to HTML rendered inside a child component. Styles must live in the component that renders the HTML.

5. **Sanity `featuredImage` vs `image`.** Library items use `featuredImage`. Other schemas use `image`. GROQ queries must use the correct field name.

6. **Sanity author is a reference.** The `author` field on library items is a reference to the `person` type. In GROQ, you must dereference it: `"author": author->name`. Forgetting `->` returns a ref object, not a string.

7. **Deploy output is `dist/client/`, not `dist/`.** The Cloudflare adapter splits build output. If you change the adapter or output mode, verify what Cloudflare is deploying.

8. **Trailing slashes are enforced.** Astro config has `trailingSlash: 'always'`. All internal links must end with `/`. Missing trailing slashes cause redirects, which can break form submissions.

9. **GitHub Pages vs Cloudflare use different base paths.** GitHub Pages uses `/ggi-website/` base. Cloudflare uses `/`. The `SITE` env var controls this. Don't hardcode absolute paths.

10. **Zeffy modal buttons vs inline embeds are different.** Modal buttons use `zeffy-form-link` attribute on `<a>` tags. Inline embeds use `data-zeffy-embed` + `data-form-url` on `<div>` tags. They require the same CSP entries but are different integration patterns.

11. **Ukrainian text in JS single-quoted strings breaks silently.** Apostrophes in Ukrainian text (`'`) look identical to JS string delimiters. Always use double quotes for strings containing Ukrainian text.

12. **Service worker cache can serve stale versions.** After deploys, users may see old content until their service worker updates. Cmd+Shift+R or clearing browser cache forces a fresh load.

---

*This document should be reviewed and updated whenever significant changes are made to the website architecture, integrations, or infrastructure.*
