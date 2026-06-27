# GGI Digital Ecosystem — Internal Reference

**Gregory the Great Institute**
Last updated: June 2026 | Prepared for: Executive Director, Board, Operations

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Website Architecture](#website-architecture)
3. [Content Management (Sanity CMS)](#content-management-sanity-cms)
4. [Email & CRM (ActiveCampaign)](#email--crm-activecampaign)
5. [Payment Processing](#payment-processing)
6. [Magnalia Curation Board](#magnalia-curation-board)
7. [Hosting & Deployment](#hosting--deployment)
8. [Security & Privacy](#security--privacy)
9. [Maintenance & Operations](#maintenance--operations)
10. [Accounts & Access](#accounts--access)
11. [Cost Summary](#cost-summary)
12. [Risk Register](#risk-register)
13. [Future Capabilities](#future-capabilities)

---

## 1. System Overview

The GGI digital ecosystem is a set of interconnected tools that handle the Institute's public web presence, donor management, email communications, content curation, and payment processing.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC WEBSITE                           │
│              gregorythegreat.ca (Astro + Cloudflare)            │
│                                                                 │
│  50+ pages · Static HTML · Full-text search · Print-ready PDFs  │
│  Newsletter signup · Contact forms · Event registration         │
│  Giving tiers · Ambassador applications · Career postings       │
└───────┬──────────────────┬──────────────────┬───────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────────┐
│  Sanity CMS   │  │ ActiveCampaign│  │   Stripe / Zeffy  │
│               │  │               │  │                   │
│ Content mgmt  │  │ Email lists   │  │ Donation & giving │
│ 12 schemas    │  │ Automations   │  │ tier processing   │
│ 35+ documents │  │ Welcome series│  │ Tax receipts      │
│ Hosted Studio │  │ 8 lists       │  │                   │
└───────────────┘  │ 18 tags       │  └───────────────────┘
                   └───────────────┘
                          │
                          ▼
               ┌──────────────────────┐
               │  Magnalia Curation   │
               │  Board               │
               │                      │
               │  Weekly crawl of 16  │
               │  Catholic sources    │
               │  AI-scored articles  │
               │  Content selection   │
               │  for Magnalia Letter │
               └──────────────────────┘
```

---

## 2. Website Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | **Astro 6** | Static site generator — builds fast, secure HTML |
| CMS | **Sanity** (project `dhzbvx7r`) | Headless content management |
| Hosting | **Cloudflare Pages** | CDN, edge functions, DDoS protection |
| Preview | **GitHub Pages** (`evanr-web.github.io/ggi-website/`) | Preview/staging |
| Search | **Pagefind** | Client-side full-text search (no server needed) |
| Sitemap | **@astrojs/sitemap** | Auto-generated XML sitemap for SEO |
| Forms | **Cloudflare Functions** | Server-side form processing |
| Repository | **GitHub** (`Evanr-web/ggi-website`) | Source control, CI/CD |

### Pages (46 static + CMS-generated dynamic pages + 7 preview routes)

**Core (4):**
- Homepage, 404, Privacy, Credits

**About (5):**
- Mission & Vision, Leadership, Founding Director, Impact Report, Media & Press

**Magnalia (6):**
- Overview, Letter (newsletter), Patron, Subscribe, Contributors, Issue One

**Programs (4 static + dynamic [slug]):**
- Overview, Book Studies, Faith & Reason, Masterclasses
- Dynamic pages generated from Sanity CMS program documents

**Events (9):**
- Overview, Archive, Conference 2025, Conference 2026, Book Studies (Feb/May/Sep), Music Camp, Prayer Breakfast, Finances 101

**Library (7 static + dynamic [slug]):**
- Overview, Abolition of Man Guide, Christmas Books 2025, Easter Family, Fine Gathering Ottawa, Medicine & Vocation, Personal Finances
- Dynamic pages generated from Sanity CMS library items

**Support (6):**
- Overview, Case Statement (print-ready prospectus), Donate, Friend Tier, Leadership Tier, Ambassadors

**Other (2):**
- Contact, Careers

**Preview Routes (7, internal):**
- Homepage, Library, Events, Programs, Magnalia, Careers, Site Settings
- Used for Sanity Studio live preview (split-screen draft editing)

### Components (25)

AddToCalendar, BackToTop, BookStudyForm, Breadcrumbs, Button, CanadaGroupMap, Card, DarkSection, EndorsementCard, EventCard, EventInterestModal, EventNotifyForm, FlyinPopup, Footer, GivingTier, GoogleMap, Hero, Navigation, NewsletterModal, QuoteBlock, RibbonBanner, Search, SectionDivider, ShareBar, Testimonials

### Design System

| Element | Value |
|---------|-------|
| Navy | `#0e3352` |
| Gold | `#b89a47` |
| Crimson | `#84292d` |
| Laurel Green | `#2d6a4f` (ribbon) |
| Parchment | `#f8ebd9` |
| Display font | `--font-display` |
| Body font | `--font-body` |
| UI font | `--font-ui` |
| Drop caps | Goudy Initialen (crimson, article pages) |
| Tagline | Fides ✠ Ratio ✠ Cultura |

---

## 3. Content Management (Sanity CMS)

### What It Is

Sanity is a headless CMS — a web-based dashboard where non-technical team members can edit content (events, people, articles, homepage text) without touching code. Changes in Sanity are pulled into the website at build time.

### Schemas (12)

| Schema | What It Manages | Examples |
|--------|----------------|----------|
| `siteSettings` | Global settings | Ribbon banner, popup, contact info, social links, CRA number |
| `homepage` | Homepage content | Hero headline, subtitle, CTA buttons, video, featured items, pillars |
| `event` | Events | Conferences, book studies, prayer breakfasts |
| `program` | Programs | Book studies, Faith & Reason, masterclasses (has enabled toggle) |
| `person` | People | Board, staff, contributors (photos, bios, credentials) |
| `libraryItem` | Library articles | Essays, guides, reading lists (has featured toggle) |
| `magnaliaIssue` | Magnalia issues | Cover, table of contents, sample article, contributors |
| `givingTier` | Giving tiers | Friend, Patron, Leadership — pricing, benefits |
| `careerPosting` | Job postings | Title, description, deadline, PDF upload |
| `bookStudy` | Reading group books | Book title, author, month, year, status |
| `readingGroup` | Map data | Province, city, group count (feeds CanadaGroupMap) |
| `tag` | Library topic tags | Aquinas, Education, Beauty, Liturgy, etc. |

### Access

- **Hosted Studio:** https://gregorythegreat.sanity.studio/
- **Local Studio:** `http://localhost:3333` (run `cd sanity && npx sanity dev`, requires Node 22)
- **Project ID:** `dhzbvx7r`
- **Dataset:** `production`
- **Who can edit:** Anyone with a Sanity account added to the project
- **Project members:** Managed at https://www.sanity.io/manage/project/dhzbvx7r/members

### How to Update Content

1. Open Sanity Studio (hosted URL or locally)
2. Edit the relevant document (e.g., change an event date, add a person)
3. Click **Publish** in Sanity
4. A webhook automatically triggers a Cloudflare Pages rebuild (~1-2 minutes)
5. The updated content is live

> **Note:** Because the site is statically built, content changes in Sanity don't appear instantly. Publishing triggers an automatic rebuild via webhook. The site updates within 1-2 minutes.

---

## 4. Email & CRM (ActiveCampaign)

### Lists (8)

| List | Purpose |
|------|---------|
| Magnalia Letter | Newsletter subscribers |
| Friends of the Institute | Monthly donors ($15+) |
| Patrons | Monthly donors ($50+) |
| Ambassador Network | Campus/parish ambassadors |
| General Contact | Contact form submissions |
| Event Registrations | People who register for events |
| Career Applications | Job applicants |
| Leadership Circle | Major donors ($5,000+/yr) |

### Tags (18)

Tags track how people entered the system and what they're interested in:
- `magnalia-letter`, `ambassador`, `contact-general`, `contact-speaker-booking`, `contact-magnalia`, `contact-programs`, `contact-support`, `contact-volunteering`
- Source tags: `source:event:*`, `source:lead-magnet:*`, `source:youtube`, `source:website`
- Donor tags: `donor:friend`, `donor:patron`, `donor:leadership`
- `career-applicant`

### Website → ActiveCampaign Flow

Every form on the website submits to a Cloudflare Function (`/api/*`) which writes to ActiveCampaign:

| Form | Endpoint | AC List | AC Tag |
|------|----------|---------|--------|
| Newsletter signup | `/api/subscribe` | Magnalia Letter | `magnalia-letter` |
| Contact form | `/api/contact` | General Contact | varies by subject |
| Ambassador application | `/api/ambassador` | Ambassador Network | `ambassador` |
| Career application | `/api/career` | Career Applications | `career-applicant` |
| Book study registration | `/api/book-study` | Book Study participants | — |
| Event interest/notify | `/api/event-interest` | Event interest | — |
| Leadership circle | `/api/leadership` | Leadership Circle | — |

### Welcome Email Series (5 emails, 21 days)

Templates are built and ready for import into ActiveCampaign (`docs/welcome-series/`):

| Day | Email | Type |
|-----|-------|------|
| 0 | Welcome + reading list PDF | Designed |
| 3 | Founder's story (Ryan, personal) | Plain text |
| 7 | Curated monthly selection | Designed |
| 14 | Community & programs | Designed (3 variants by entry point) |
| 21 | Magnalia subscription + Friend tier invite | Designed |

### Setup Status

- [x] Verify sender domain (`gregorythegreat.ca`) in AC — DKIM/SPF DNS records configured
- [x] Set up AC environment variables in Cloudflare (`AC_API_URL`, `AC_API_KEY`)
- [ ] Import HTML templates into AC automations
- [ ] Create the 10-book reading list PDF (lead magnet)

See `docs/ACTIVECAMPAIGN-SETUP.md` for step-by-step instructions.

---

## 5. Payment Processing

### Current Setup

| Provider | Purpose | Tax Receipts |
|----------|---------|-------------|
| **Zeffy** | Primary donation platform | Yes — Canadian CRA receipts |
| **Stripe** | Future/secondary processor | Possible via integration |

### How It Works

- Giving pages on the website link to Zeffy for payment processing
- Zeffy is a Canadian nonprofit payment platform with **0% fees** (they ask donors for an optional tip)
- Zeffy issues tax-deductible receipts automatically under Catholic Voices Canada's CRA registration

### Giving Tiers

| Tier | Amount | What They Receive |
|------|--------|-------------------|
| Friend | $15+/month | Prayer inclusion, Magnalia Letter, digital Magnalia, early event registration |
| Patron | $50+/month | Everything in Friend + print Magnalia, annual gathering, named recognition, signed book |
| Leadership Circle | $5,000+/year | Bespoke — personal relationship with Executive Director |
| Visionary Partner | $25,000+/year | Signal tier — invitation to conversation, not a product |

See `docs/GIVING-STRUCTURE.md` for the full operating manual.

### Security Considerations

- **No credit card data touches the GGI website.** All payment processing happens on Zeffy/Stripe's PCI-compliant infrastructure.
- The website only links to Zeffy — it never collects, stores, or transmits financial information.
- Zeffy handles PCI DSS compliance, fraud detection, and secure payment processing.

---

## 6. Magnalia Curation Board

### What It Is

A separate tool that crawls Catholic intellectual sources weekly, scores content for relevance using AI, and presents a curated board for Dr. Topping to review and select articles for the Magnalia Letter.

- **URL:** https://evanr-web.github.io/magnalia-curation/
- **Repository:** `Evanr-web/magnalia-curation`

### How It Works

```
Sunday 11 PM (planned cron) 
        │
        ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Crawl 16    │────▶│  Validate    │────▶│  AI Score    │
│  RSS/YouTube │     │  Links +     │     │  Relevance   │
│  feeds       │     │  Security    │     │  (Claude)    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Top 20      │
                                          │  published   │
                                          │  to board    │
                                          └──────────────┘
```

### Sources (16 active)

**Read (articles):** First Things, Church Life Journal, The Pillar, Catholic World Report, Crisis Magazine, New Liturgical Movement, Convivium, Comment Magazine, Word on Fire, Public Discourse, Front Porch Republic, The European Conservative

**Watch (video):** Bishop Robert Barron, Matt Fradd / Pints with Aquinas, The Thomistic Institute, Classical Theist

### Three Validation Gates

1. **Link Validation** — confirms every article URL is live and reachable (high-trust sources skip this as they block bots but are editorially vetted)
2. **Security Scan** — checks Google Safe Browsing API, SSL certificates, domain age, content type, blocklist
3. **AI Relevance Scoring** — Claude evaluates each article on a 1-10 rubric: Canadian relevance, intellectual depth, mission alignment, timeliness, source credibility, GGI connection. Minimum score: 5.

### Dr. Topping's Workflow

1. Open the curation board URL (Monday morning)
2. Browse scored articles — filter by category (Read / Watch / Listen)
3. Click to read any article
4. Select articles for inclusion in the Magnalia Letter
5. Add custom items via "Add Your Own" feature
6. Submit selections → emailed to editorial team

---

## 7. Hosting & Deployment

### Production

| Component | Host | URL |
|-----------|------|-----|
| GGI Website | Cloudflare Pages | `gregorythegreat.ca` (also `ggi-website.pages.dev`) |
| API Functions | Cloudflare Functions | `gregorythegreat.ca/api/*` |
| Sanity Studio | Sanity Cloud | `gregorythegreat.sanity.studio` |
| Curation Board | GitHub Pages | `evanr-web.github.io/magnalia-curation/` |

### Preview / Staging

| Component | Host | URL |
|-----------|------|-----|
| GGI Website (preview) | GitHub Pages | `evanr-web.github.io/ggi-website/` |
| Sanity Studio (local) | Local dev | `localhost:3333` |

### Deployment Process

Two triggers cause a deploy:

1. **Code push:** Pushing to the `main` branch on GitHub auto-triggers a Cloudflare Pages build
2. **Content publish:** Publishing in Sanity Studio fires a webhook that triggers a Cloudflare Pages build

Build pipeline: `astro build` → `esbuild` (bundles Cloudflare Worker) → `pagefind` (indexes content)

New version is deployed globally to Cloudflare's CDN (200+ edge locations). Typical deploy time: 1-2 minutes.

A GitHub Actions workflow also deploys to GitHub Pages (preview/staging) with a post-deploy smoke test that verifies the homepage returns HTTP 200.

### DNS (configured in Cloudflare)

| Record | Type | Value | Status |
|--------|------|-------|--------|
| `@` | CNAME | `ggi-website.pages.dev` (proxied) | ✅ Live |
| `www` | CNAME | `ggi-website.pages.dev` (proxied) | ✅ Live |
| `_dmarc` | TXT | DMARC policy (`p=none`, monitor mode) | ✅ Active |
| Google DKIM | TXT | Google Workspace email auth | ✅ Passing |
| Google SPF | TXT | Google Workspace sender verification | ✅ Passing |
| AC DKIM/SPF | TXT | ActiveCampaign sender verification | ✅ Configured |

**Nameservers:** `pearl.ns.cloudflare.com` / `phil.ns.cloudflare.com`
**Domain registrar:** WHC.ca

---

## 8. Security & Privacy

### What We Collect

| Data | Where It's Stored | Who Can Access |
|------|-------------------|----------------|
| Email addresses | ActiveCampaign | AC administrators |
| Names | ActiveCampaign | AC administrators |
| Contact form messages | ActiveCampaign | AC administrators |
| Resumes (career applications) | Cloudflare R2 (planned) | Admin with R2 access |
| Newsletter selections | Browser localStorage (curation board) | User's own device only |
| Payment information | **Zeffy/Stripe only** — never on GGI servers | Zeffy/Stripe |

### What We Do NOT Collect or Store

- Credit card numbers, bank details, or any financial data
- Passwords (no user accounts on the website)
- Tracking cookies or third-party analytics (no Google Analytics, no Facebook Pixel)
- IP addresses or device fingerprints

### Security Measures

| Measure | Status |
|---------|--------|
| **HTTPS everywhere** | ✅ Enforced by Cloudflare (automatic SSL) |
| **No server-side database** | ✅ Static site — no SQL injection, no database breaches possible |
| **DDoS protection** | ✅ Cloudflare's built-in DDoS mitigation |
| **Form validation** | ✅ Server-side validation in Cloudflare Functions |
| **CORS protection** | ✅ API endpoints check request origin |
| **No admin panel on the web** | ✅ Sanity CMS is a separate service with its own auth |
| **PCI compliance** | ✅ Handled entirely by Zeffy/Stripe — GGI never touches payment data |
| **Content Security Policy** | ✅ Configured in `public/_headers` (CSP, HSTS, X-Frame-Options DENY, nosniff) |
| **Turnstile CAPTCHA** | ✅ On all 14 forms + 7 API endpoints |
| **Bot Fight Mode** | ✅ Enabled in Cloudflare |
| **Honeypot fields** | ✅ Invisible field on all forms, silent bot rejection |
| **Rate limiting on forms** | ⬜ Paid feature — skipped (Turnstile + honeypots sufficient) |

### Privacy Compliance

- **PIPEDA (Canada):** The website collects only information that users voluntarily provide (name, email). No covert tracking. Unsubscribe links in all emails (ActiveCampaign handles this automatically).
- **CASL (Anti-Spam):** All email subscriptions are opt-in. The welcome series only sends to people who actively subscribed. Unsubscribe mechanism in every email.
- **Privacy Policy:** Published at `/privacy/` on the website.

### Incident Response

If a security issue is discovered:
1. The website itself has no database to breach — it's static HTML files
2. ActiveCampaign has its own security team and incident response
3. Zeffy/Stripe have their own PCI-compliant security infrastructure
4. The main risk vector is compromised GitHub or Cloudflare credentials — mitigated by 2FA

---

## 9. Maintenance & Operations

### Routine Tasks

| Task | Frequency | Who | How |
|------|-----------|-----|-----|
| Add/edit events | As needed | Any Sanity user | Sanity Studio → rebuild |
| Add library articles | As needed | Any Sanity user | Sanity Studio → rebuild |
| Update people/bios | As needed | Any Sanity user | Sanity Studio → rebuild |
| Update homepage hero | As needed | Any Sanity user | Sanity Studio → rebuild |
| Review curation board | Weekly | Dr. Topping | Open board URL, select articles |
| Review AC analytics | Monthly | Comms lead | AC dashboard |
| Check form submissions | Weekly | Comms lead | AC contact list |
| Update Astro/dependencies | Quarterly | Developer | `npm update`, test, deploy |
| Review SSL/domain | Annually | Operations | Cloudflare dashboard |
| Rotate API keys | Annually | Operations | AC + Cloudflare settings |

### Rebuilding the Site

After content changes in Sanity, the site rebuilds automatically:

**Automatic (production):**
- Publishing in Sanity triggers a webhook → Cloudflare Pages rebuilds (~1-2 min)
- Pushing code to `main` branch on GitHub → Cloudflare Pages rebuilds

**Manual rebuild (if webhook fails):**
- Cloudflare dashboard → Pages → ggi-website → Deployments → "Retry deployment" on the latest
- Or push an empty commit: `git commit --allow-empty -m "trigger rebuild" && git push`

### Sanity Studio

**Hosted (production):** https://gregorythegreat.sanity.studio/ — accessible from any browser, no setup required.

**Local (development):**
```bash
cd ggi-website/sanity
npx sanity dev
# Opens at http://localhost:3333
# Requires Node 22
```

### Dependency Updates

The site uses these core dependencies:
- `astro` ^6.1.9 — framework (update quarterly)
- `@astrojs/cloudflare` ^13.7.0 — Cloudflare Pages adapter
- `@sanity/astro` ^3.3.1 + `@sanity/client` ^7.22.0 — CMS integration
- `@astrojs/sitemap` ^3.7.2 — SEO
- `pagefind` ^1.5.2 — search
- `wrangler` ^4.104.0 — Cloudflare Workers CLI

**⚠️ Node 22 required.** Node 25 has a broken `simdjson` dependency. Pinned via `.nvmrc` and `package.json` engines field.

Run `npm outdated` to check for updates. Test thoroughly before deploying.

---

## 10. Accounts & Access

### Required Accounts

| Service | What For | Who Needs Access |
|---------|----------|-----------------|
| **GitHub** | Source code, deployments | Developer, IT |
| **Cloudflare** | Hosting, DNS, security | Operations, IT |
| **Sanity** | Content editing | ED, Comms, Developer |
| **ActiveCampaign** | Email, CRM | ED, Comms, Fundraising |
| **Zeffy** | Payments, tax receipts | ED, Finance |

### Credential Management

- All service accounts should use **2FA (two-factor authentication)**
- API keys (`AC_API_KEY`, `SAFE_BROWSING_KEY`, `ANTHROPIC_API_KEY`) are stored as **Cloudflare environment variables** — never in code
- GitHub repository access should be limited to people who need it
- Sanity access can be granted per-user with different permission levels

---

## 11. Cost Summary

### Current Monthly Costs

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Cloudflare Pages | Free tier | **$0** |
| Sanity CMS | Free tier (10K API requests/mo) | **$0** |
| GitHub | Free tier | **$0** |
| Zeffy | Free (donor-tipped model) | **$0** |
| Pagefind | Open source | **$0** |
| Domain (`gregorythegreat.ca`) | Annual renewal | ~$15/year |
| **ActiveCampaign** | Lite plan (est.) | **~$29-49/mo** |
| AI scoring (Claude API) | Pay-per-use | **~$2-5/mo** |

**Estimated total: ~$35-55/month** (almost entirely ActiveCampaign)

### Cost at Scale

| Milestone | Additional Cost | Notes |
|-----------|----------------|-------|
| 10,000 email subscribers | ~$100/mo AC | AC pricing scales with contacts |
| 50,000 monthly visitors | $0 | Cloudflare free tier handles this |
| Hosted Sanity Studio | $0-15/mo | Free tier or Team plan |
| Course platform (if Path A) | $50-150/mo | Teachable/Thinkific |
| R2 storage (resumes, files) | ~$0.50/mo | 10GB free, then $0.015/GB |

---

## 12. Risk Register

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Developer unavailability** | Medium | High | All code is on GitHub; documentation enables handoff. Astro is a mainstream framework with large community. |
| **GitHub account compromise** | Low | High | Enable 2FA. Limit collaborator access. Repository is public (code only, no secrets). |
| **Cloudflare outage** | Very Low | High | Cloudflare has 99.99% SLA. Site is static — can be moved to any host quickly. |
| **Sanity API downtime** | Low | Medium | Site is built statically — existing pages work even if Sanity is down. Only new builds are affected. |
| **ActiveCampaign breach** | Low | Medium | AC is SOC 2 Type II compliant. Only names and emails are stored. No financial data. |
| **Dependency vulnerability** | Medium | Low | Run `npm audit` quarterly. Astro and dependencies are actively maintained. |
| **Domain expiration** | Low | High | Set auto-renew. Add calendar reminders. |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **No one can update the site** | Medium | High | This document + Sanity CMS means content updates don't require a developer. Structural changes do. |
| **Email deliverability issues** | Medium | Medium | Verify sender domain (SPF/DKIM/DMARC). Monitor AC deliverability dashboard. Start with warm-up sends. |
| **Donor data loss** | Low | High | ActiveCampaign handles backups. Zeffy maintains payment records independently. Export contacts quarterly as CSV backup. |
| **SEO regression after domain migration** | Medium | Medium | Set up 301 redirects from old Wix site. Submit new sitemap to Google Search Console. Monitor for 30 days post-launch. |

### What Happens If…

**…the developer leaves?**
All source code is on GitHub. This document and the docs folder explain the full system. Any web developer familiar with Astro (or willing to learn — it's well-documented) can maintain and extend the site. Sanity CMS allows content updates without a developer.

**…we want to switch hosting providers?**
The site is static HTML. It runs anywhere — Netlify, Vercel, AWS, a $5/month VPS. Cloudflare Functions would need to be rewritten for the new platform (a few hours of work). The core site moves in minutes.

**…we want to switch CMS?**
Sanity content can be exported as JSON. The Astro pages would need their data-fetching rewritten, but the templates and design remain. Estimated effort: 1-2 days for a developer.

**…we outgrow ActiveCampaign?**
AC scales to hundreds of thousands of contacts. If you outgrow it, contacts export as CSV. The API integration would need to be repointed to the new CRM (HubSpot, Mailchimp, etc.) — the Cloudflare Functions are the only code that touches AC.

---

## 13. Future Capabilities

The current architecture supports these extensions without major rebuilds:

### Near-Term (ready to implement)

- **Cloudflare deployment** — switch from GitHub Pages to production domain
- **Sanity webhook → auto-rebuild** — content changes trigger deploys automatically
- **Hosted Sanity Studio** — web-accessible CMS for non-technical editors
- **AC automations** — welcome series, event follow-ups, donor nurture sequences
- **Weekly curation cron** — automated content crawl every Sunday night
- **Google Search Console + basic analytics** — privacy-respecting traffic data

### Medium-Term (weeks of work)

- **User accounts** — for gated content, course access (via Clerk or Supabase Auth)
- **Online masterclasses** — video hosting + access control + payment
- **Membership portal** — Friends/Patrons see exclusive content after login
- **Bilingual site** — Astro supports i18n natively; Sanity supports localized fields
- **Event ticketing** — integrated registration with seat limits and waitlists

### Long-Term (strategic)

- **Course platform** — full LMS with progress tracking, certificates
- **Parish template** — white-label version of the site architecture for other Catholic organizations
- **Mobile app** — progressive web app (PWA) wrapping the site for home-screen install
- **Podcast hosting** — RSS feed generation for a GGI podcast
- **API for partners** — expose event/content data for diocesan websites to consume

---

## File Map

```
ggi-website/
├── src/
│   ├── pages/          → 46 static + dynamic page files + 7 preview routes
│   ├── components/     → 25 reusable UI components
│   ├── layouts/        → BaseLayout, ArticleLayout, EventLayout
│   ├── styles/         → global.css (design system)
│   └── lib/            → sanity.ts (346 lines, all CMS queries)
├── functions/api/      → 7 Cloudflare Functions + _shared.js utilities
│                         (subscribe, contact, ambassador, career,
│                          book-study, event-interest, leadership)
├── public/
│   ├── _headers        → Cloudflare security headers (CSP, HSTS, etc.)
│   ├── docs/           → Static PDFs (impact report, etc.)
│   ├── fonts/          → Web fonts (Goudy Initialen)
│   └── images/         → Branding, art, event photos
├── sanity/
│   ├── schemas/        → 12 content schemas
│   ├── backups/        → Sanity export backups (gitignored)
│   └── sanity.config   → Studio configuration
├── scripts/
│   └── backup-sanity.sh → Automated backup (keeps last 5)
├── docs/               → All documentation (15+ guides)
│   ├── ECOSYSTEM.md    → This document
│   ├── GLASS-BREAK-HANDOFF.md → Developer handoff (bus test)
│   ├── OPS-RUNBOOK.md  → Non-technical operations guide
│   ├── cms-guide/      → CMS guide with 25+ screenshots
│   └── ...             → AC setup, forms architecture, analytics, etc.
└── astro.config.mjs    → Build configuration

magnalia-curation/
├── index.html          → Curation board UI
├── crawl.py            → Weekly crawl pipeline
├── sources.json        → 16 active RSS/YouTube feeds
├── blocklist.json      → Domain blocklist
├── CRAWL_SPEC.md       → Validation & security spec
├── data/               → Weekly digest JSON files
└── api/                → Submit endpoint (planned)
```

---

*This document should be updated when significant changes are made to the ecosystem. Store it in the repository at `docs/ECOSYSTEM.md` and provide a copy to the Executive Director and Board.*
