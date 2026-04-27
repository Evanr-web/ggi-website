# GGI Website — Architecture Overview

**Gregory the Great Institute** — gregorythegreat.ca

Last updated: April 2026

---

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     CONTENT FLOW                         │
│                                                          │
│  Sanity Studio ──webhook──→ Cloudflare Pages (rebuild)  │
│  (Victor edits)             (static HTML served)         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                     AUDIENCE FLOW                        │
│                                                          │
│  Website forms ──POST──→ ActiveCampaign                 │
│  (signups, contact,       (lists, tags, sequences,      │
│   ambassador apps)         CRM, segmentation)           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                     PAYMENT FLOW                         │
│                                                          │
│  Donate/Subscribe ──link──→ Zeffy (donations)           │
│  buttons                    Stripe (future products)     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Accounts & Services

| Service | Purpose | Account Owner | URL |
|---------|---------|---------------|-----|
| **GitHub** | Source code | GGI org (TODO: transfer from Evanr-web) | github.com/Evanr-web/ggi-website |
| **Cloudflare** | DNS + hosting | GGI (TODO: set up) | dash.cloudflare.com |
| **Sanity** | CMS | GGI project `dhzbvx7r` | sanity.io/manage |
| **ActiveCampaign** | Email + CRM | GGI (TODO: set up) | gregorythegreat.activehosted.com |
| **Zeffy** | Donations | GGI | zeffy.com |
| **Google** | Analytics, Ad Grant | GGI (TODO: set up) | analytics.google.com |
| **Domain** | gregorythegreat.ca | GGI | (registrar TBD) |

**Critical:** Ensure all accounts are under GGI organizational ownership, not personal accounts. Use info@gregorythegreat.ca as the billing/admin email where possible.

---

## What Lives Where

### In the Code (Astro .astro files)
These are marketing/design pages with custom layouts. Changes require a developer or AI coding tool:
- Homepage
- About — Mission & Vision
- About — Founding Director
- About — Impact Report
- About — Leadership
- Programs — index, Book Studies, Faith & Reason, Masterclasses
- Magnalia — index, subscribe, patron, issue pages, contributors
- Magnalia — Letter (signup page)
- Support — index (giving tiers + Case for Support)
- Support — Ambassadors
- Support — Donate
- Contact
- Privacy, Credits, 404

### In Sanity CMS (once wired)
These are content collections that Victor manages without code:
- **Events** — title, date, location, description, image, program tag, registration link, slug
- **Library Articles** — title, author, date, body, category, hero image, slug
- **People** — name, photo, role, bio, email, group (staff/board/fellow/advisory)
- **Magnalia Issues** — issue number, cover image, table of contents, featured essay, date
- **Endorsements** — quote, name, title, photo

### In ActiveCampaign
- Contact lists and segments
- Email sequences (welcome, nurture, event-specific)
- Form endpoints for all website forms
- Tags (magnalia-letter, ambassador, contact-general, event-attendee, etc.)
- Automation workflows

### In Cloudflare
- DNS records for gregorythegreat.ca
- Pages project connected to GitHub main branch
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `SITE=https://gregorythegreat.ca`

---

## Rebuild Triggers

The site rebuilds (and deploys) when:
1. **Code push** — any push to `main` branch triggers Cloudflare Pages build
2. **Sanity publish** — webhook from Sanity triggers Cloudflare Pages build
3. **Manual** — trigger rebuild from Cloudflare Pages dashboard

Build time: ~1–2 seconds. Deploy time: ~30–60 seconds including CDN propagation.

---

## Form Routing

| Form | Location | ActiveCampaign Action |
|------|----------|----------------------|
| Magnalia Letter signup | Homepage footer, `/magnalia/letter/` | Add to "Magnalia Letter" list, tag `magnalia-letter`, trigger welcome sequence |
| Contact form | `/contact/` | Tag by subject dropdown, notify Victor via email |
| Ambassador application | `/support/ambassadors/` | Tag `ambassador-application`, notify Victor, add to "Ambassadors" list |
| Event registration | Individual event pages | Tag per event, add to "Event Attendees" list |
| Magnalia subscribe | `/magnalia/subscribe/` | Redirect to Zeffy or Stripe payment page |

---

## Content Update Frequency

| Content Type | How Often | Who Updates | Where |
|-------------|-----------|-------------|-------|
| Events | Monthly | Victor | Sanity |
| Library articles | 2–4x/month | Victor | Sanity |
| People/leadership | Quarterly | Victor | Sanity |
| Magnalia issues | 2x/year | Victor | Sanity |
| Endorsements | As received | Victor | Sanity |
| Marketing pages | 2–3x/year | Developer | Code |
| Design tokens | Rarely | Developer | Code |
| Navigation | Rarely | Developer | Code |

---

## Backup & Recovery

- **Code:** GitHub is the source of truth. Every change is committed and pushed.
- **Content:** Sanity maintains full version history. Any document can be reverted.
- **Site:** Cloudflare Pages keeps previous deployments. Instant rollback from dashboard.
- **Email lists:** ActiveCampaign maintains contact data. Export regularly as CSV backup.

---

## Cost Summary (Annual)

| Item | Cost | Notes |
|------|------|-------|
| Cloudflare Pages | Free | Free tier covers this site easily |
| Sanity | Free | Free tier: 3 users, 500K API requests/month |
| Domain renewal | ~$20/yr | gregorythegreat.ca |
| ActiveCampaign | ~$500–800/yr | Nonprofit pricing, depends on list size |
| Zeffy | Free | 0% platform fee for Canadian nonprofits |
| Google Ad Grant | Free | $10K/month in free ads (requires CRA status) |
| **Total** | **~$520–820/yr** | |

---

## Emergency Contacts

| Role | Name | Email |
|------|------|-------|
| Website Builder | Evan Ropp | (contact via GGI team) |
| Communications | Victor Carpay | vcarpay@gregorythegreat.ca |
| Executive Director | Dr. Ryan Topping | rtopping@gregorythegreat.ca |
| Programs | Catherine Renneberg | crenneberg@gregorythegreat.ca |

---

## If You're a New Developer

Read `CONTRIBUTING.md` first. It has the practical how-to. This document is the big picture — what connects to what, who owns what, and where things live.
