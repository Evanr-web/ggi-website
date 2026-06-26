# GGI Website — Glass Break Handoff Document

**Purpose:** If Evan Ropp is unavailable, this document contains everything a developer or administrator needs to maintain, update, and operate the Gregory the Great Institute website and its supporting systems.

**Last Updated:** June 26, 2026
**Prepared by:** Evan Ropp (Fundraising Chair, GGI)

> ⚠️ **CONFIDENTIAL** — This document contains (or will contain) credentials and access details. Store securely. Do not commit credentials to GitHub.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Sanity CMS](#2-sanity-cms)
3. [Cloudflare](#3-cloudflare)
4. [GitHub](#4-github)
5. [ActiveCampaign](#5-activecampaign)
6. [Zeffy](#6-zeffy)
7. [Domain & DNS](#7-domain--dns)
8. [Day-to-Day Operations](#8-day-to-day-operations)
9. [Emergency Procedures](#9-emergency-procedures)
10. [Credentials Vault](#10-credentials-vault)

---

## 1. System Overview

The GGI website is a static site built with **Astro 5**, content managed through **Sanity CMS**, hosted on **Cloudflare Pages**, with email marketing through **ActiveCampaign** and donation/event registration through **Zeffy**.

### Architecture at a Glance

```
Content editors (Ryan, Victor, Catherine)
        │
        ▼
   Sanity Studio ──── sanity.io (content database)
        │                    │
        │              webhook trigger
        │                    │
        ▼                    ▼
   GitHub repo ────► Cloudflare Pages (hosting)
   (source code)      gregorythegreat.ca
        │
        ▼
   Forms ──► Cloudflare Functions ──► ActiveCampaign (email lists)
   
   Zeffy (donations & event registration) — separate platform
```

### How Content Gets Published

1. An editor creates or updates content in **Sanity Studio** (gregorythegreat.sanity.studio)
2. Clicking "Publish" in Sanity triggers a **webhook** to Cloudflare
3. Cloudflare pulls the latest code from **GitHub** and rebuilds the site (~1-2 min)
4. The updated site is live at **gregorythegreat.ca**

No code changes required for content updates. Code changes go through GitHub.

---

## 2. Sanity CMS

### What It Is
Sanity is the content management system. All website content — programs, events, library articles, career postings, Magnalia issues, team bios, and site settings — lives here.

### Key URLs
| Resource | URL |
|----------|-----|
| Sanity Studio | https://gregorythegreat.sanity.studio/ |
| Sanity Dashboard | https://www.sanity.io/manage/project/dhzbvx7r |
| API Documentation | https://www.sanity.io/docs |

### Project Details
- **Project ID:** `dhzbvx7r`
- **Dataset:** `production`
- **Plan:** Free tier (sufficient for current needs)

### Content Types (Schemas)
| Schema | What It Controls | Has Enable Toggle |
|--------|-----------------|-------------------|
| Programs | Program pages (conference, book studies, etc.) | ✅ Yes |
| Events | Event listings and detail pages | ✅ Yes |
| Library Items | Essays, videos, resources | ✅ Yes |
| Career Postings | Job/opportunity listings | ✅ Yes |
| Magnalia Issues | Journal issue details, sample articles | ⭐ Has "Current Issue" toggle |
| People | Team/contributor bios | No |
| Book Studies | Reading group details | No |
| Site Settings | Global site config (ribbon banner, fly-in popup) | N/A |
| Homepage | Homepage content sections | N/A |

### How to Add/Edit Content
A full CMS guide with screenshots is in the repo at `docs/cms-guide/`. It covers every content type step by step.

### The "Enabled" Toggle
Programs, Events, Library Items, and Career Postings all have an **Enabled** toggle at the top of the document. When unchecked, the item is hidden from the site. This lets editors draft content without it going live.

### API Tokens
There are two Sanity tokens:
- **Viewer (Read-only):** Used by the website to fetch published content (`SANITY_READ_TOKEN`)
- **Editor (Write):** Used for backup scripts and preview (`SANITY_TOKEN`)

Tokens are managed at: https://www.sanity.io/manage/project/dhzbvx7r/api#tokens

### Backups
- **Automated monthly backup:** Runs on the 1st of each month at 7 AM MST
- **Backup script:** `scripts/backup-sanity.sh` in the repo
- **Manual backup:** Run `npx sanity dataset export production ./backup.tar.gz` from the `sanity/` directory
- **Restore:** `npx sanity dataset import backup.tar.gz production --replace`
- See `docs/SANITY-BACKUP.md` for full details

### CORS Settings
Allowed origins (managed at sanity.io dashboard):
- `gregorythegreat.ca`
- `www.gregorythegreat.ca`
- `evanr-web.github.io`

### Deploy Webhook
Sanity is configured to trigger a Cloudflare Pages rebuild on every publish. The webhook URL is set in the Sanity dashboard under **API → Webhooks**.

---

## 3. Cloudflare

### What It Is
Cloudflare Pages hosts the website. It also provides DNS, DDoS protection, bot protection, and runs the serverless API functions (form submissions).

### Key URLs
| Resource | URL |
|----------|-----|
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Pages Project | Look for `ggi-website` under Pages |
| DNS Settings | Under the `gregorythegreat.ca` domain |

### Pages Project Details
- **Project name:** `ggi-website`
- **Production URL:** `gregorythegreat.ca` (also `ggi-website.pages.dev`)
- **Build command:** `npm run build`
- **Build output:** `dist/client/`
- **Node version:** 22 (pinned via `.nvmrc`)
- **Connected to:** GitHub repo `Evanr-web/ggi-website`, `main` branch
- **Auto-deploy:** Yes — every push to `main` triggers a rebuild

### Environment Variables (Cloudflare Pages)
These are set in the Cloudflare dashboard under Pages → Settings → Environment Variables:
- `SANITY_READ_TOKEN` — Sanity viewer token
- `SANITY_PREVIEW_TOKEN` — Sanity preview token
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile (CAPTCHA) secret
- `AC_API_KEY` — ActiveCampaign API key
- `AC_API_URL` — ActiveCampaign API base URL

### Cloudflare Functions (API Endpoints)
These serverless functions handle form submissions and send data to ActiveCampaign:

| Endpoint | Purpose |
|----------|---------|
| `/api/subscribe` | Newsletter signup |
| `/api/contact` | Contact form |
| `/api/ambassador` | Ambassador interest |
| `/api/career` | Career applications |
| `/api/book-study` | Book study registration |
| `/api/event-interest` | Event interest/notify |
| `/api/leadership` | Leadership circle signup |

All endpoints include:
- Cloudflare Turnstile (CAPTCHA) verification
- Honeypot field detection
- Input validation and sanitization

### Security Features
- **Turnstile (CAPTCHA):** Site key `0x4AAAAAADm6eYaBvIIwZNRm` — on all 14 forms
- **Bot Fight Mode:** Enabled
- **Security Headers:** CSP, HSTS, X-Frame-Options (configured in `_headers` file)

### DNS / Nameservers
- **Nameservers:** `pearl.ns.cloudflare.com` / `phil.ns.cloudflare.com`
- **Domain Registrar:** WHC.ca (not GoDaddy)

### Post-Deploy Smoke Test
The GitHub Actions workflow includes a `verify` job that checks the homepage returns HTTP 200 after deployment.

---

## 4. GitHub

### What It Is
GitHub hosts the source code. All code changes are tracked here. Cloudflare auto-deploys from the `main` branch.

### Key URLs
| Resource | URL |
|----------|-----|
| Repository | https://github.com/Evanr-web/ggi-website |
| GitHub Pages (preview) | https://evanr-web.github.io/ggi-website/ |
| Actions (CI/CD) | https://github.com/Evanr-web/ggi-website/actions |

### Repository Details
- **Owner:** Evanr-web (Evan Ropp)
- **Branch:** `main` (production)
- **Framework:** Astro 5
- **Node version required:** 22 (Node 25 has a known broken dependency)

### Key Directories
```
ggi-website/
├── src/
│   ├── pages/          # All website pages
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Page layouts (Base, Article, Event)
│   ├── lib/
│   │   └── sanity.ts   # All Sanity CMS queries
│   └── styles/
│       └── global.css  # Global styles, brand variables
├── public/             # Static assets (images, fonts)
├── functions/
│   └── api/            # Cloudflare serverless functions
├── sanity/
│   ├── schemas/        # CMS content type definitions
│   └── sanity.config.ts
├── docs/               # All documentation
├── scripts/            # Utility scripts (backups, etc.)
└── _headers            # Cloudflare security headers
```

### How to Make Code Changes
1. Clone the repo: `git clone https://github.com/Evanr-web/ggi-website.git`
2. Install dependencies: `npm install` (in root) and `cd sanity && npm install`
3. Run locally: `npm run dev -- --host 0.0.0.0` (port 4321)
4. Run Sanity Studio locally: `cd sanity && npx sanity dev` (port 3333)
5. Commit and push to `main` — Cloudflare auto-deploys

### GitHub Actions Secrets
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## 5. ActiveCampaign

### What It Is
ActiveCampaign handles email marketing — newsletters, event announcements, fundraising campaigns, and automated email sequences.

### Key URLs
| Resource | URL |
|----------|-----|
| Dashboard | https://gregorythegreat.activehosted.com |
| API Docs | https://developers.activecampaign.com |

### Account Details
- **Account name:** gregorythegreat
- **API URL:** `https://gregorythegreat.api.activecampaign.com`

### Lists (8 configured)
These are the broad subscriber buckets:
1. GGI Newsletter (Magnalia Letter)
2. Conference attendees
3. Book Study participants
4. Ambassador network
5. Leadership Circle
6. Event interest
7. Career applicants
8. General contacts

### Tags (18 configured)
Tags provide finer segmentation within lists (e.g., `conference-2026`, `donor`, `edmonton`, etc.).

### Segments
Segments are **dynamic saved filters** — they combine lists, tags, and custom fields. Anyone matching the rules right now is included. New contacts who match are automatically added.

### Sending a One-Off Email (Campaign)
1. Go to **Campaigns → Create a Campaign**
2. Click **"Start from scratch instead"** (below the AI generator)
3. Choose **Standard** campaign
4. Select your list or segment as the audience
5. Fill in subject line, from name, from email
6. Click **"Create with email designer"** for the drag-and-drop builder
7. Design the email (drag blocks: text, images, buttons, dividers)
8. Preview → Send test → Schedule or Send

### API Integration
The website sends form submissions to AC via Cloudflare Functions. The API key and URL are stored as Cloudflare environment variables.

### Key Documentation
- `docs/ACTIVECAMPAIGN-SETUP.md` — Full setup details
- `docs/FORMS-AND-AC-ARCHITECTURE.md` — How forms connect to AC
- `docs/AC-SENDER-DOMAIN-SETUP.md` — Email authentication (DKIM/SPF)
- `docs/welcome-series.md` — Welcome email sequence templates

### Email Authentication (DNS Records)
ActiveCampaign requires DKIM and SPF DNS records for email deliverability. These must be added in Cloudflare DNS. See `docs/AC-SENDER-DOMAIN-SETUP.md`.

---

## 6. Zeffy

### What It Is
Zeffy is a **100% free** donation and event registration platform for nonprofits. GGI uses it for conference registration and donations.

### Key URLs
| Resource | URL |
|----------|-----|
| Dashboard | https://www.zeffy.com/en/dashboard |
| Help Center | https://support.zeffy.com |

### What Zeffy Handles
- Conference registration and ticketing
- Donation processing
- Tax receipts (automatic)

### Integration with the Website
- Program and event pages link to Zeffy registration URLs
- Registration URLs are set in Sanity CMS (the `registrationUrl` field on Programs and Events)
- Currently no automated sync between Zeffy and ActiveCampaign (manual CSV export/import)

### Zeffy Webhooks (Future)
Zeffy supports webhooks under **Settings → Integrations** (requires admin access). A webhook endpoint on the GGI site (`/api/event-interest`) is ready to receive registration events when configured.

### Admin Access
Webhook and API configuration requires admin-level access in Zeffy. As of June 2026, Evan has member-level access. Admin access is needed to configure integrations.

---

## 7. Domain & DNS

| Detail | Value |
|--------|-------|
| Domain | `gregorythegreat.ca` |
| Registrar | WHC.ca |
| Nameservers | `pearl.ns.cloudflare.com` / `phil.ns.cloudflare.com` |
| DNS managed at | Cloudflare |
| SSL | Automatic via Cloudflare |
| Domain renewal | Check WHC.ca dashboard |

### Critical DNS Records
- **A / CNAME:** Points to Cloudflare Pages
- **DKIM / SPF:** Required for ActiveCampaign email deliverability
- **Any changes to DNS** should be made in the Cloudflare dashboard, not at WHC

---

## 8. Day-to-Day Operations

### Content Updates (No Code Required)
- Log into [Sanity Studio](https://gregorythegreat.sanity.studio/)
- Create/edit content → Publish
- Site auto-rebuilds in ~1-2 minutes

### Monitoring
- **Uptime:** Site health check runs 3x/day (8am, 2pm, 8pm MST) — alerts via Telegram if down
- **Cloudflare Analytics:** Traffic and performance data in Cloudflare dashboard
- **Error logs:** Cloudflare Functions logs in the Cloudflare dashboard under Pages → Functions

### Common Tasks

| Task | Where | How |
|------|-------|-----|
| Update event details | Sanity Studio | Edit the event document, publish |
| Hide a program | Sanity Studio | Uncheck the "Enabled" toggle, publish |
| Send newsletter | ActiveCampaign | Campaigns → Create → Standard |
| Check donations | Zeffy | Dashboard → Payments |
| Export registrants | Zeffy | Dashboard → Export CSV |
| Check site is up | Browser | Visit gregorythegreat.ca |
| View deploy logs | Cloudflare | Pages → ggi-website → Deployments |
| View form submissions | ActiveCampaign | Contacts → search by list/tag |

### Sanity Studio Users
Current CMS users are managed at: https://www.sanity.io/manage/project/dhzbvx7r/members

---

## 9. Emergency Procedures

### Site Is Down
1. Check [Cloudflare Status](https://www.cloudflarestatus.com/) — is it a Cloudflare outage?
2. Check Cloudflare dashboard → Pages → ggi-website → Deployments — did a recent deploy fail?
3. If a bad deploy: go to Deployments, find the last working deploy, click **"Rollback"**
4. If DNS issue: check Cloudflare DNS settings haven't changed
5. If none of the above: the fallback preview is at https://evanr-web.github.io/ggi-website/

### CMS Not Loading
1. Check [Sanity Status](https://status.sanity.io/)
2. Try a different browser or incognito window
3. Clear browser cache

### Forms Not Working
1. Check Cloudflare dashboard → Pages → Functions tab for error logs
2. Verify environment variables are still set (API keys can expire)
3. Check ActiveCampaign is accessible

### Need to Roll Back Code
1. Go to GitHub → repository → commits
2. Identify the last good commit
3. A developer can `git revert` or Cloudflare can rollback to a previous deployment

### Lost Access to a Service
Use the credentials in the vault below. If credentials are missing or expired, contact the service provider directly with the organization's registered email.

---

## 10. Credentials Vault

> ⚠️ **Fill in these credentials and store this document securely (encrypted file, password manager, or physical safe). Never commit credentials to GitHub.**

### Sanity (sanity.io)
| Field | Value |
|-------|-------|
| Login email | `________________________` |
| Password | `________________________` |
| Project ID | `dhzbvx7r` |
| Viewer Token | `________________________` |
| Editor Token | `________________________` |
| Preview Token | `________________________` |

### Cloudflare
| Field | Value |
|-------|-------|
| Login email | `________________________` |
| Password | `________________________` |
| Account ID | `________________________` |
| API Token | `________________________` |
| Turnstile Site Key | `0x4AAAAAADm6eYaBvIIwZNRm` |
| Turnstile Secret Key | `________________________` |

### GitHub
| Field | Value |
|-------|-------|
| Login username | `________________________` |
| Password / Auth | `________________________` |
| Repo | `Evanr-web/ggi-website` |

### ActiveCampaign
| Field | Value |
|-------|-------|
| Login email | `________________________` |
| Password | `________________________` |
| Account URL | `gregorythegreat.activehosted.com` |
| API URL | `gregorythegreat.api.activecampaign.com` |
| API Key | `________________________` |

### Zeffy
| Field | Value |
|-------|-------|
| Login email | `________________________` |
| Password | `________________________` |
| Organization | `________________________` |

### WHC.ca (Domain Registrar)
| Field | Value |
|-------|-------|
| Login email | `________________________` |
| Password | `________________________` |
| Domain | `gregorythegreat.ca` |
| Renewal date | `________________________` |

---

## Key Contacts

| Person | Role | Contact |
|--------|------|---------|
| Evan Ropp | Fundraising Chair, Web Developer | `________________________` |
| Ryan Topping | Executive Director | `________________________` |
| Victor Carpay | Communications (CMS user) | `________________________` |
| Catherine Renneberg | Programs | `________________________` |

---

## Key Documentation (In the Repo)

All documentation lives in the `docs/` directory of the GitHub repository:

| Document | Purpose |
|----------|---------|
| `ECOSYSTEM.md` | Full system architecture reference |
| `OPS-RUNBOOK.md` | Non-technical operations guide |
| `ACTIVECAMPAIGN-SETUP.md` | AC configuration and list/tag setup |
| `FORMS-AND-AC-ARCHITECTURE.md` | How website forms connect to AC |
| `AC-SENDER-DOMAIN-SETUP.md` | Email authentication DNS records |
| `SANITY-BACKUP.md` | Backup and restore procedures |
| `UPTIME-MONITORING.md` | Monitoring setup guide |
| `EVENT-REGISTRATION-GUIDE.md` | Event + Zeffy registration flow |
| `LAUNCH-CHECKLIST.md` | Pre-launch verification checklist |
| `LAUNCH-HARDENING.md` | Security hardening details |
| `cms-guide/` | Step-by-step CMS guide with screenshots |

---

*This document should be reviewed and updated quarterly, or whenever a system change is made.*
