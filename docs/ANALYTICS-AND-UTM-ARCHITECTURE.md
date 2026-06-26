# GGI Analytics & UTM Attribution Architecture

## Overview

Track where visitors come from, connect that data to ActiveCampaign contacts, and enable source-based segmentation across all channels (YouTube, Substack, social media, email, paid).

---

## Analytics Stack

### GA4 (Google Analytics 4)
- **Purpose:** Traffic analytics — where visitors come from, what pages they visit, conversions
- **Cost:** Free
- **Setup:** Single script tag in `BaseLayout.astro`
- **Tracks:** Source/medium, page views, session duration, conversion events (form submissions, Zeffy clicks)

### Cloudflare Analytics (already included)
- **Purpose:** High-level server-side dashboard — no JS, no cookies
- **Covers:** Total visits, unique visitors, top pages, countries, web vitals
- **Does NOT track:** UTM parameters, individual user journeys, conversions

### Google Tag Manager (Phase 2)
- **Purpose:** Container for all tracking scripts (GA4, Facebook Pixel, YouTube retargeting, etc.)
- **When:** Add after launch when additional pixels are needed
- **Why:** Lets you add/modify tracking without code changes or deploys

---

## UTM Parameters

### Standard Parameters
Every outbound link should include:
- `utm_source` — where (youtube, substack, instagram, facebook, twitter, email)
- `utm_medium` — how (video, newsletter, social, paid, organic)
- `utm_campaign` — which campaign (ep01-intro, magnalia-launch, conference-2026)
- `utm_content` — which link/creative (description-link, pinned-comment, bio-link)
- `utm_term` — optional, usually for paid search keywords

### Example Links
```
YouTube video description:
https://gregorythegreat.ca/magnalia/subscribe/?utm_source=youtube&utm_medium=video&utm_campaign=ep01-beauty-of-liturgy&utm_content=description-link

Substack cross-post:
https://gregorythegreat.ca/library/medicine-forgets-vocation/?utm_source=substack&utm_medium=newsletter&utm_campaign=magnalia-may-2026

Instagram bio:
https://gregorythegreat.ca/?utm_source=instagram&utm_medium=social&utm_content=bio-link

QR code on printed flyer:
https://gregorythegreat.ca/events/conference-2026/?utm_source=print&utm_medium=flyer&utm_campaign=conference-2026-promo
```

---

## UTM → ActiveCampaign Flow

```
Outbound link (UTM tagged)
  → User lands on site
    → UTM params stored in sessionStorage (JS script on every page)
      → User fills out any form
        → Hidden fields auto-populate from sessionStorage
          → Cloudflare Function passes UTM values to AC as custom fields
            → AC contact has: first_source, first_medium, first_campaign, etc.
```

### Site-Side Implementation
1. **UTM capture script** — runs on every page via `BaseLayout.astro`
   - Reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` from URL
   - Stores in `sessionStorage` (persists across page navigation within session)
   - Does NOT overwrite if already set (preserves first touch within session)

2. **Hidden form fields** — added to every form
   - `<input type="hidden" name="utm_source" />`
   - `<input type="hidden" name="utm_medium" />`
   - `<input type="hidden" name="utm_campaign" />`
   - `<input type="hidden" name="utm_content" />`
   - `<input type="hidden" name="signup_page" />` (auto-set to current path)
   - Auto-populated from `sessionStorage` on form load

3. **Cloudflare Functions** — `_shared.js` `addContact()` updated
   - Reads UTM hidden fields from form body
   - Passes to AC as custom field values
   - Sets `first_source` only if empty (first touch attribution)
   - Always updates `last_source` (last touch attribution)

### AC Custom Fields
| Field | AC Field ID | Perstag | Type | Behavior |
|-------|-------------|---------|------|----------|
| `first_source` | 2 | FIRST_SOURCE | Text | Set once on first form submission, never overwritten |
| `first_medium` | 3 | FIRST_MEDIUM | Text | Set once on first form submission, never overwritten |
| `first_campaign` | 4 | FIRST_CAMPAIGN | Text | Set once on first form submission, never overwritten |
| `last_source` | 5 | LAST_SOURCE | Text | Updated on every form submission |
| `last_medium` | 6 | LAST_MEDIUM | Text | Updated on every form submission |
| `last_campaign` | 7 | LAST_CAMPAIGN | Text | Updated on every form submission |
| `signup_page` | 8 | SIGNUP_PAGE | Text | Page path where they first converted |

*Field IDs created 2026-06-12. Referenced in `functions/api/_shared.js` → `UTM_FIELD_IDS`.*
*AC account: gregorythegreat.activehosted.com | API: gregorythegreat.api-us1.com*

---

## Segments Enabled by UTM Data

| Segment | Definition | Use Case |
|---------|------------|----------|
| YouTube audience | `first_source = youtube` | Measure video content ROI |
| Substack crossover | `first_source = substack` | Cross-post effectiveness |
| Social converts | `first_source = instagram OR facebook OR twitter` | Social media ROI |
| Campaign performance | `first_campaign = ep01-beauty-of-liturgy` | Per-video/per-campaign attribution |
| Channel × giving | `first_source = youtube` + `giving:patron` | YouTube viewers who became patrons |
| Organic search | `first_source = google` (or no UTM + referrer) | SEO effectiveness |
| Print/QR | `first_source = print` | Offline marketing attribution |

---

## GA4 Conversion Events

Set up these events in GA4 to track form submissions and key actions:
- `form_submit_newsletter` — Magnalia Letter signup
- `form_submit_contact` — Contact form
- `form_submit_book_study` — Book Study registration
- `form_submit_ambassador` — Ambassador application
- `form_submit_career` — Career application
- `form_submit_event_interest` — Event registration/interest
- `form_submit_leadership` — Leadership Circle inquiry
- `click_zeffy_donate` — Click on any Zeffy donation/checkout link
- `click_zeffy_subscribe` — Click on Zeffy Magnalia subscription link

---

## UTM Discipline

### Rules for Everyone (Ryan, Victor, social media)
1. **Every outbound link gets UTM tags.** No exceptions.
2. Use consistent naming — lowercase, hyphens, no spaces.
3. `utm_source` is always the platform name: `youtube`, `substack`, `instagram`, `facebook`, `twitter`, `email`, `print`
4. `utm_medium` is the format: `video`, `newsletter`, `social`, `paid`, `organic`, `flyer`, `qr`
5. `utm_campaign` is specific: `ep01-beauty-of-liturgy`, `conference-2026-promo`, `magnalia-may-2026`

### Recommended Tool
Use [utm.io](https://utm.io) (free) or a shared Google Sheet to generate UTM links. Keeps naming consistent across team members.

---

## Build Order

### Before Go-Live
1. Add GA4 property + script tag to `BaseLayout.astro`
2. Write UTM capture script (sessionStorage)
3. Add hidden UTM fields to all forms
4. Update `_shared.js` to pass UTM values to AC custom fields
5. Create custom fields in AC (first_source, first_medium, etc.)

### Post-Launch
6. Set up GA4 conversion events
7. Create UTM link template/spreadsheet for Ryan and Victor
8. Add GTM container (migrate GA4 into it)
9. Tag all YouTube video description links
10. Tag all Substack cross-post links
11. Tag social media bio links
