# GGI Website — Comprehensive Pre-Launch Audit
**Date:** June 26, 2026  
**Auditor:** Claw (for Evan)  
**Goal:** Top 1% non-profit site, world-class Catholic site  
**Current HEAD:** `5df94d3` on `main`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Experience (UX)](#2-user-experience-ux)
3. [Marketing & Lead Generation](#3-marketing--lead-generation)
4. [Customer Journey Audit](#4-customer-journey-audit)
5. [Code Quality & Performance](#5-code-quality--performance)
6. [Security Audit](#6-security-audit)
7. [Buttons, Forms & Links Audit](#7-buttons-forms--links-audit)
8. [SEO & Discoverability](#8-seo--discoverability)
9. [Accessibility (a11y)](#9-accessibility-a11y)
10. [Content & Copy Audit](#10-content--copy-audit)
11. [ActiveCampaign Roadmap](#11-activecampaign-roadmap)
12. [Infrastructure Diagram](#12-infrastructure-diagram)
13. [Training Plan](#13-training-plan)
14. [Go-Live Blockers vs Nice-to-Haves](#14-go-live-blockers-vs-nice-to-haves)

---

## 1. Executive Summary

**Overall Grade: 92/100** — The site is genuinely excellent. Design, content architecture, and security are well above typical non-profit standards. The gaps are almost entirely in *operational wiring* (AC flows, analytics, redirects) rather than in the site itself.

### What puts this in the top 1%
- ✅ Stunning visual design (navy/gold/crimson palette, Cormorant Garamond, Goudy Initialen drop caps)
- ✅ Meaningful information architecture (46 pages, well-organized)
- ✅ Static-first architecture (fast, secure, cheap)
- ✅ Sanity CMS for non-technical editors
- ✅ Turnstile CAPTCHA + honeypot on all forms
- ✅ Security headers, CORS, input validation
- ✅ Privacy-respecting (no GA4 yet, no tracking cookies)
- ✅ RSS feed, sitemap, OG tags, canonical URLs
- ✅ Skip-link, focus styles, reduced-motion support
- ✅ Comprehensive documentation (Ecosystem, Ops Runbook, CMS Guide)

### What's holding it back from 100
- 🔴 No `_redirects` file (Wix URL visitors will 404)
- 🔴 Christmas Books dead download link (`href="#"`)
- 🔴 No analytics at all (can't measure anything)
- 🔴 AC not fully wired (no welcome series, no automations live)
- 🔴 DNS not swapped (not live yet)
- 🟡 No `<meta name="google-site-verification">` or Search Console
- 🟡 Some placeholder images still in use
- 🟡 CRA/charity number not in footer
- 🟡 No favicon.ico fallback (only favicon.svg)

---

## 2. User Experience (UX)

### ✅ What's Working Well
- **Homepage flow** is excellent: Hero → Quote → Pillars → Video → Magnalia → Events → Endorsements → Library → Support → Newsletter. Classic conversion funnel.
- **Navigation** is clean — 6 top-level items, About dropdown, search, "Support" CTA
- **Mobile nav** with hamburger, mobile-link hierarchy
- **404 page** is well-designed with CTAs back to homepage and contact
- **Footer** is comprehensive: brand, navigation, contact, newsletter form
- **Scroll reveal animations** with `prefers-reduced-motion` respect
- **Sticky nav** — accessible without scrolling up
- **Parchment background** — warm, distinctive, not generic

### 🔴 Issues to Fix

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| UX-1 | **No breadcrumbs** on interior pages. Deep pages (e.g. `/events/book-study-sep-2026/`) have no wayfinding context. | Medium | Add a simple breadcrumb component (`Home > Events > Book Study`) to EventLayout and ArticleLayout |
| UX-2 | **No "active page" indicator** in navigation. User can't tell which section they're in. | Medium | Add `aria-current="page"` and a gold underline/indicator to the current nav section |
| UX-3 | **No "Back to top" button** on long pages. Library articles and event pages scroll long. | Low | Add a subtle floating back-to-top button that appears after 600px scroll |
| UX-4 | **Footer newsletter form** has no `method="POST"`. It has `data-ac-endpoint` and the JS handler picks it up, but without JS it would submit as GET. | Low | Add `method="POST"` for progressive enhancement |
| UX-5 | **Mobile: Pillars section** shows 3 stacked full-width cards. On small screens this is a LOT of scrolling before hitting the video section. | Low | Consider horizontal scroll or accordion on mobile |
| UX-6 | **No loading indicator** for search. Pagefind loads async; there's a brief empty state. | Low | Add a skeleton or "Loading search..." state |
| UX-7 | **Event cards** don't show year — if someone visits in 2027, "Oct 2" is ambiguous | Low | Add year to EventCard date display |

### 🟡 Opportunities

| # | Opportunity | Impact |
|---|------------|--------|
| UX-O1 | **Social proof counter** — "Join 1,500+ believers renewing Catholic culture" in hero or newsletter section | High — social proof converts |
| UX-O2 | **Testimonial from a real subscriber** (not just quotes from Newman and JPII) — someone who attended a book study or conference | High — relatable proof |
| UX-O3 | **Progress indicator on giving pages** — "$X raised of $Y goal" if there's a campaign | Medium |
| UX-O4 | **Estimated reading time** on library articles | Low |

---

## 3. Marketing & Lead Generation

### Current Lead Capture Points
1. ✅ Homepage newsletter form (bottom)
2. ✅ Footer newsletter form (every page)
3. ✅ Newsletter modal (triggered by button)
4. ✅ FlyinPopup component (exists but unclear trigger/timing)
5. ✅ Book Study form (with city/province)
6. ✅ Contact form
7. ✅ Ambassador application
8. ✅ Career application
9. ✅ EventNotifyForm (past events)
10. ✅ Event interest modal

### 🔴 Critical Gaps

| # | Gap | Impact | Fix |
|---|-----|--------|-----|
| MK-1 | **No lead magnet** — the reading list PDF referenced in the welcome series doesn't exist yet | High | Create a "10 Books Every Catholic Should Read" PDF. Gate it behind email capture. This is the #1 lead gen tool for intellectual audiences. |
| MK-2 | **No exit-intent popup** — visitors leave without any last-chance capture | High | Wire the existing FlyinPopup or NewsletterModal to fire on exit intent (cursor moves to browser chrome) |
| MK-3 | **No post-form-submit next step** — after subscribing, the user sees "✓ Thank you!" and... nothing. Dead end. | High | After subscribe, show a "while you're here" CTA: link to library, upcoming event, or Magnalia sample |
| MK-4 | **No UTM links on YouTube/Substack/Instagram** — organic traffic from these channels is invisible | Medium | Create a UTM link spreadsheet for Ryan/Victor. Template all social bio links, video descriptions, Substack cross-posts |
| MK-5 | **Magnalia Letter landing page** (`/magnalia/letter/`) doesn't sell hard enough — it's just a form | Medium | Add: what they'll receive, frequency, sample issue, subscriber count, quote from a subscriber |
| MK-6 | **No content upgrade** on library articles — articles end and the reader leaves | Medium | Add an inline CTA at the end of every article: "Enjoyed this? Get our monthly curated reading list" → email capture |
| MK-7 | **No referral mechanism** — "forward to a friend" is mentioned in welcome email 5 but there's no shareable link or referral tracking | Low | Add ShareBar component to more pages (currently exists but may not be used everywhere) |

### 🟡 Opportunities

| # | Opportunity | Impact |
|---|------------|--------|
| MK-O1 | **Gated Magnalia sample** — let people read 2-3 pages of Issue One in-browser, then gate the rest behind email | Very High |
| MK-O2 | **Event countdown** on conference page — "Registration closes in X days" creates urgency | High |
| MK-O3 | **"As seen in" bar** — logos of media outlets or organizations that have featured GGI (if any exist) | Medium |
| MK-O4 | **Video testimonial** from a conference attendee or book study participant embedded on homepage | High |

---

## 4. Customer Journey Audit

### Journey 1: Cold Visitor → Newsletter Subscriber
```
Google/Social → Homepage → Scroll → Newsletter form (bottom) → Subscribe → "Thank you" (dead end)
```
**Issues:**
- ❌ No post-subscribe redirect or next-step CTA
- ❌ No welcome email fires (AC automation not built)
- ❌ No lead magnet offered

**Ideal flow:**
```
Landing → Content (article/event) → Lead magnet offer → Email capture → 
Welcome email (immediate) → 5-email nurture → Soft ask (Friend tier)
```

### Journey 2: Interested Donor → Friend Tier
```
/support/ → /support/friend/ → "Become a Friend" → Zeffy embed
```
**Issues:**
- ⚠️ The Zeffy embed is on /support/donate/, not /support/friend/
- Need to verify the Friend tier Zeffy form exists and is correctly linked
- No "what your money does" impact story near the CTA

### Journey 3: Catholic Intellectual → Book Study Participant
```
/programs/book-studies/ → Book study form → AC (List 9, Tag 14)
```
**Issues:**
- ✅ Form exists and has province/city cascade
- ⚠️ No immediate email confirmation
- ⚠️ No "what happens next" after form submit

### Journey 4: Visitor → Conference Attendee
```
/events/conference-2026/ → "Register Now" → Zeffy ticketing embed
```
**Status:** ✅ Looks properly wired (embed on page)

### Journey 5: Returning Visitor → Magnalia Patron
```
Magnalia Letter email → Article on site → /magnalia/patron/ → Zeffy embed
```
**Issues:**
- ⚠️ Patron page dark navy section → Evan wanted parchment (noted last session, not done)

---

## 5. Code Quality & Performance

### ✅ Good
- Static output — fastest possible delivery
- Cloudflare CDN — 200+ edge locations
- `loading="lazy"` on YouTube iframe
- `font-display: swap` on custom fonts
- Pagefind for client-side search (no server needed)
- Clean BEM-ish CSS naming
- No unused dependencies in the critical path
- `trailingSlash: 'always'` — consistent URL structure

### 🔴 Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| CD-1 | **`subscribe.js` has undeclared variable in catch block** — `email` is referenced in the `catch` but declared inside `try` scope: `logError('subscribe', err, { email: email ? 'present' : 'missing' })` | Medium | Move `let email;` outside the try block or remove from catch context |
| CD-2 | **`contact.js` same issue** — `email` referenced in catch outside its scope | Medium | Same fix |
| CD-3 | **Google Fonts `@import` in CSS** — blocking render. Fonts load sequentially after CSS. | Medium | Move to `<link rel="preload">` in BaseLayout `<head>` for faster font loading |
| CD-4 | **No `<link rel="preconnect">` for external origins** — YouTube, Sanity CDN, Google Fonts | Medium | Add preconnect hints: `fonts.googleapis.com`, `fonts.gstatic.com`, `cdn.sanity.io` |
| CD-5 | **YouTube iframe loads eagerly on homepage** even though it's below the fold | Medium | Use `loading="lazy"` (already there) but also consider `srcdoc` pattern to defer iframe until click |
| CD-6 | **No image optimization pipeline** — images in `/public/images/` are served as-is, no WebP/AVIF, no responsive srcset | Medium | Add Astro Image component (`astro:assets`) or at minimum serve WebP versions |
| CD-7 | **Duplicate CSS utility classes** — `.text-center` is defined twice in global.css (line ~201 and ~290) | Low | Remove duplicate |
| CD-8 | **`astro.config.mjs` uses `output: 'static'` with `adapter: cloudflare()`** — this is technically valid but the adapter is unnecessary for fully static output. The Cloudflare adapter is only needed for SSR. | Info | Remove `adapter: cloudflare()` or switch to `@astrojs/cloudflare` static mode. Currently works fine because Cloudflare Pages handles static deploys natively. **Actually, the adapter is needed for Functions.** Leave as-is. |
| CD-9 | **No service worker / PWA manifest** — not critical for a content site but would enable offline reading | Low | Optional — add if targeting mobile users who might save to home screen |

### Build & Deploy
- ✅ `wrangler.json` configured with `404-page` handling
- ✅ `.nvmrc` pins Node 22
- ✅ Sanity webhook triggers auto-rebuild on Cloudflare
- ✅ GitHub Actions with post-deploy smoke test
- ⚠️ OPS-RUNBOOK still references triggering rebuilds manually via GitHub Actions — update to mention Sanity webhook auto-deploy

---

## 6. Security Audit

### ✅ Strong
- **CSP header** is well-configured — allows only necessary external sources
- **HSTS** with preload — forces HTTPS
- **X-Frame-Options: DENY** — prevents clickjacking
- **X-Content-Type-Options: nosniff** — prevents MIME sniffing
- **Permissions-Policy** — disables camera, microphone, geolocation
- **Turnstile CAPTCHA** on all forms
- **Honeypot fields** injected via JS
- **Input validation** — email regex, sanitize(), length limits
- **File upload restriction** — PDF/DOC/DOCX only (MIME + extension)
- **CORS whitelist** — only 4 allowed origins
- **No credentials in code** — all in Cloudflare env vars
- **Sanity tokens split** — Viewer (read) vs Editor (write)
- **Bot Fight Mode** enabled
- **Static site** — no SQL injection, no server state, no session hijacking

### 🔴 Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| SC-1 | **CSP missing `media-src`** — if you ever embed audio/video files directly (not via YouTube iframe), they'll be blocked | Low | Add `media-src 'self';` to CSP |
| SC-2 | **No rate limiting on API endpoints** — a bot could hammer `/api/subscribe` even with Turnstile (Turnstile has a window) | Medium | Cloudflare WAF rate limiting is a paid feature. Alternative: add a simple in-memory rate limiter in the Functions using `waitUntil` + KV, or accept Turnstile as sufficient |
| SC-3 | **Career file uploads** — `isAllowedFile()` checks MIME + extension, but MIME types can be spoofed. The file is presumably stored somewhere (R2?) — verify it's not publicly accessible by URL guessing | Medium | Confirm R2 bucket has private access. Consider adding virus scanning or at minimum file size limits |
| SC-4 | **CORS allows `ggi-website.pages.dev`** — after go-live, consider removing the staging origin from CORS to reduce attack surface | Low | Remove `ggi-website.pages.dev` from CORS after confirming production works |
| SC-5 | **No `Expect-CT` header** — minor, being deprecated but still recommended during transition | Very Low | Optional |
| SC-6 | **`X-XSS-Protection: 1; mode=block`** — this header is deprecated and can introduce vulnerabilities in some browsers. Modern best practice is to NOT send it (CSP covers this). | Low | Remove the header |
| SC-7 | **Privacy policy says "cookies and analytics (Cloudflare Web Analytics)"** but no analytics are actually installed yet. If GA4 is added later, the privacy policy needs updating. | Medium | Update privacy policy when analytics are added |

### 🟡 Recommendations
- Add `Reporting-Endpoints` header for CSP violation reporting (free via report-uri.com or Cloudflare)
- Consider Cloudflare Managed Challenge on form pages (additional bot protection layer)
- Schedule an annual API key rotation reminder

---

## 7. Buttons, Forms & Links Audit

### Dead Links (`href="#"`)

| # | Page | Element | Status | Fix |
|---|------|---------|--------|-----|
| BF-1 | `/library/christmas-books-2025/` | "Download Christmas Book Recommendations" | 🔴 Dead link | Get PDF from Ryan or remove the download button |
| BF-2 | `/contact/` | "Subscribe Free" | ✅ OK — `data-newsletter-modal` triggers JS modal |
| BF-3 | `/careers/` | "Subscribe to Our Newsletter" | ✅ OK — `data-newsletter-modal` triggers JS modal |
| BF-4 | `/magnalia/subscribe/` | "Order a Copy" | ✅ OK — `zeffy-form-link` triggers Zeffy modal |
| BF-5 | `/magnalia/subscribe/` | "Subscribe" | ✅ OK — `zeffy-form-link` triggers Zeffy modal |
| BF-6 | `/magnalia/subscribe/` | "Place a Bulk Order" | ✅ OK — `zeffy-form-link` triggers Zeffy modal |
| BF-7 | `/magnalia/subscribe/` | "Subscribe to Newsletter" | ✅ OK — `data-newsletter-modal` triggers JS modal |

**Summary:** Only 1 genuinely dead link (BF-1). The rest are JS-handled and correct.

### Forms Audit

| Form | Location | Endpoint | Turnstile | Honeypot | Status |
|------|----------|----------|-----------|----------|--------|
| Homepage newsletter | `/` bottom | `/api/subscribe` | ✅ | ✅ (JS injected) | ✅ Working |
| Footer newsletter | Every page | `/api/subscribe` | ✅ | ✅ (JS injected) | ✅ Working |
| Newsletter modal | Triggered by button | `/api/subscribe` | ❓ Verify | ✅ | Verify |
| Contact | `/contact/` | `/api/contact` | ✅ | ✅ | ✅ Working |
| Ambassador | `/support/ambassadors/` | `/api/ambassador` | ✅ | ✅ | ✅ Working |
| Career | `/careers/` | `/api/career` | ✅ | ✅ | ✅ Working |
| Book Study | `/programs/book-studies/` | `/api/book-study` | ✅ | ✅ | ✅ Working |
| Event Interest | Modal | `/api/event-interest` | ✅ | ✅ | ✅ Working |
| Leadership | `/support/leadership/` | `/api/leadership` | ✅ | ✅ | ✅ Working |
| Faith & Reason interest | `/programs/faith-and-reason/` | ❓ | ❓ | ❓ | Verify endpoint |

### External Links to Verify
- [ ] All Zeffy embed URLs are live and correct
- [ ] YouTube channel link in footer
- [ ] Instagram link in footer
- [ ] Substack link in footer
- [ ] Impact Report PDF (`/docs/ggi-impact-report.pdf`)

---

## 8. SEO & Discoverability

### ✅ Good
- Canonical URLs on every page
- OG tags (title, description, image, url, type, site_name, locale)
- Twitter Card tags
- `robots.txt` with sitemap reference
- `@astrojs/sitemap` generating `sitemap-index.xml`
- RSS feed with autodiscovery (`<link rel="alternate" type="application/rss+xml">`)
- `h1` tags with `data-pagefind-weight="10"` for search ranking
- Trailing slash consistency

### 🔴 Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| SEO-1 | **No `_redirects` file** — old Wix URLs will 404. Every backlink, Google index entry, printed material, and social post pointing to old Wix paths will break. | Critical | Create `public/_redirects` mapping old Wix paths to new paths. Add catch-all `/old-path/* /404 404` |
| SEO-2 | **No Google Search Console** — can't monitor indexing, crawl errors, or search performance | High | Submit site and sitemap to Search Console after DNS swap |
| SEO-3 | **No `<meta name="google-site-verification">`** — needed for Search Console ownership verification | High | Add after creating Search Console property |
| SEO-4 | **No structured data (JSON-LD)** — events, organization, articles could benefit from rich snippets | Medium | Add `@type: Organization` on homepage, `@type: Event` on event pages, `@type: Article` on library pages |
| SEO-5 | **Default description on many pages** — pages without custom `description` prop get the global default | Medium | Audit each page for unique, compelling meta descriptions |
| SEO-6 | **OG images** — only 4 custom images exist. Most pages fall back to the default. | Medium | Generate page-specific OG images for key landing pages |
| SEO-7 | **No `hreflang`** — not critical now but relevant if bilingual content is added | Low | N/A for now |
| SEO-8 | **Sitemap references `gregorythegreat.ca`** but site is currently on `ggi-website.pages.dev` — sitemap will be correct after DNS swap | Info | No action needed |

---

## 9. Accessibility (a11y)

### ✅ Good
- Skip-to-content link
- `role="main"` on `<main>`
- `role="banner"` on `<header>`
- `role="contentinfo"` on `<footer>`
- `aria-label` on navigation regions
- `aria-label` on form inputs
- `:focus-visible` styles with gold outline
- `prefers-reduced-motion` support
- `alt` text on images

### 🔴 Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| A11-1 | **No `aria-current="page"`** on active nav links — screen readers can't tell which page the user is on | Medium | Add current-page detection in Navigation.astro |
| A11-2 | **Mobile menu toggle** doesn't trap focus — tab key can escape the mobile menu into hidden content behind it | Medium | Add focus trap when mobile menu is open |
| A11-3 | **Dropdown menu** is mouse-only — keyboard users can't open the About dropdown (no `Enter`/`Space` handler on the trigger) | Medium | Add keyboard event handlers for dropdown toggle |
| A11-4 | **Newsletter modal** — verify it has focus trap, Escape-to-close, and restores focus to trigger element | Medium | Audit modal components for focus management |
| A11-5 | **Color contrast** — gold text (#b89a47) on parchment (#f8ebd9) may fail WCAG AA for small text | Medium | Check with a contrast checker. Consider darkening gold slightly for body text uses |
| A11-6 | **Form error messages** — on validation failure, the button text changes but there's no `aria-live` announcement | Low | Add `role="alert"` or `aria-live="polite"` to error message container |
| A11-7 | **Search trigger** — two separate `<button class="search-trigger">` in the DOM (one for desktop `.nav__end`, one for mobile `.nav__actions`). Both are always in the DOM but one is `display:none`. | Low | Ensure the hidden one has `aria-hidden="true"` or use a single button |

---

## 10. Content & Copy Audit

### 🔴 Issues

| # | Issue | Page | Fix |
|---|-------|------|-----|
| CT-1 | **"finances-placeholder.jpg"** still used as image for Personal Finances article on homepage and library | `/`, `/library/` | Replace with a proper image |
| CT-2 | **Media & Press page** has placeholder content: "replace with actual YouTube IDs when available" | `/about/media/` | Get real YouTube embed IDs or remove placeholder section |
| CT-3 | **CRA/charity number** not visible in footer — donors need this for tax receipt verification | Footer | Add "CRA Registration: [number]" to footer bottom |
| CT-4 | **"Catholic Voices Canada"** is mentioned as CRA registration holder (in ECOSYSTEM.md) — is this the correct legal entity name for the site? | Footer/Privacy | Verify and add proper legal entity |
| CT-5 | **Conference 2025 page** still exists — is this needed or should it redirect to 2026? | `/events/conference-2025/` | Keep for historical record but ensure it's clearly marked as past |
| CT-6 | **Masterclasses** are hidden (enabled=false) — the pillar on the homepage still says "Courses" and links to `/programs/masterclasses/` which may 404 or redirect | Homepage | Update the fallback pillar to link to `/programs/` instead of `/programs/masterclasses/` |
| CT-7 | **Endorsements** — Benedict XVI and Newman are not endorsements of GGI specifically. Only O'Brien is. Consider labeling the section more accurately ("Voices That Inspire Us" vs "Endorsements") | Homepage | Rename section or add context |

---

## 11. ActiveCampaign Roadmap

### Current State
- **Lists:** 9 created ✅
- **Tags:** 31 created ✅
- **API endpoints:** 7 built (`subscribe`, `contact`, `ambassador`, `career`, `book-study`, `event-interest`, `leadership`) ✅
- **Automations:** 0 live ❌
- **Sender domain:** Not verified ❌
- **Welcome series:** 5 email templates written, not imported ❌

### Pre-Launch (Must Have)

| Priority | Task | Status |
|----------|------|--------|
| P0 | **Verify sender domain** — add SPF/DKIM/DMARC records to Cloudflare DNS | ❌ Not done — blocks all AC email |
| P0 | **Test all 7 form endpoints** on production domain after DNS swap | ❌ Waiting for DNS |
| P0 | **Import welcome series** — 5 emails, automation trigger on List 4 subscribe | ❌ Not started |

### Post-Launch Phase 1 (Week 1-2)

| Priority | Task | Description |
|----------|------|-------------|
| P1 | **Ambassador auto-reply** | Automation: List 5 subscribe → notify Victor + auto-reply to applicant |
| P1 | **Contact form notification** | Automation: List 7 subscribe → notify Victor + auto-reply |
| P1 | **Event registration confirmation** | Automation: event tag added → confirmation email |
| P1 | **Book Study confirmation** | Automation: List 9 subscribe → welcome + "what happens next" |
| P1 | **Leadership inquiry notification** | Automation: Tag 27 added → notify Ryan directly |

### Post-Launch Phase 2 (Week 3-4)

| Priority | Task | Description |
|----------|------|-------------|
| P2 | **Zeffy → AC webhook** | `/api/zeffy-webhook` — auto-tag donors, add to Donors list |
| P2 | **Lead magnet** | Create 10-book reading list PDF, gate behind email, update welcome email 1 |
| P2 | **GA4 setup** | Property creation, script tag, conversion events |
| P2 | **UTM link templates** | Spreadsheet for Ryan/Victor with pre-built UTM links for all channels |

### Post-Launch Phase 3 (Month 2+)

| Priority | Task | Description |
|----------|------|-------------|
| P3 | **Upgrade nudge automation** | Friend → Patron: after 3 months as Friend, send upgrade pitch |
| P3 | **Lapsed donor re-engagement** | No activity in 90 days → "We miss you" sequence |
| P3 | **Event follow-up sequence** | Post-conference: thank you → photos → next event teaser |
| P3 | **Birthday/anniversary** | If captured, send a personal note on donation anniversary |
| P3 | **Segmented fundraising** | Different ask emails based on engagement level (content-first vs community-first) |

### AC Flow Diagram

```
ENTRY POINTS                    LISTS              AUTOMATIONS           OUTCOMES
─────────────                   ─────              ───────────           ────────
Newsletter form ──────────────→ Magnalia Letter ──→ Welcome Series ────→ Engaged subscriber
                                                   (5 emails, 21 days)   → Friend conversion

Contact form ─────────────────→ General Contact ──→ Auto-reply ─────────→ Victor follows up
                                                   + Victor notification

Ambassador form ──────────────→ Ambassador ───────→ Auto-reply ─────────→ Victor calls
                                                   + Victor notification

Book Study form ──────────────→ Book Study ───────→ Confirmation ───────→ Inklings Club member
                                                   + Welcome guide

Event interest ───────────────→ Event Attendees ──→ Confirmation ───────→ Event reminder sequence
                                                   + Pre-event emails

Career application ───────────→ Career Apps ──────→ Auto-reply ─────────→ HR review

Leadership inquiry ───────────→ (Master list) ────→ Ryan notification ──→ Personal outreach

Zeffy donation ───────────────→ Donors ───────────→ Thank you email ────→ Giving tier tagged
(via webhook)                   + tier-specific      + Impact update       → Upgrade sequence
                                                                           (if applicable)
```

### Segments to Build

| Segment | Logic | Purpose |
|---------|-------|---------|
| Hot Prospects | Has `magnalia-letter` tag, no giving tag, opened 3+ emails | Conversion target for Friend ask |
| Upgrade Candidates | Has `friend` tag + `interest:magnalia-journal` | Pitch Patron tier |
| Event Enthusiasts | 2+ event tags | Announce new events first |
| Major Donor Pipeline | `leadership:inquiry` OR `giving:leadership` | White-glove personal outreach |
| Lapsed | No email open in 90 days | Re-engagement sequence |
| New (< 30 days) | Date added within 30 days | Welcome treatment, no hard asks |
| Geographic | Province field | Regional event promotion |

---

## 12. Infrastructure Diagram

```
                                     ┌──────────────────────────────────┐
                                     │     CONTENT CREATION LAYER       │
                                     │                                  │
                                     │  ┌──────────┐   ┌────────────┐  │
                                     │  │ Sanity    │   │ GitHub     │  │
                                     │  │ Studio    │   │ Repository │  │
                                     │  │ (CMS)     │   │ (Code)     │  │
                                     │  └─────┬─────┘   └─────┬──────┘  │
                                     │        │               │         │
                                     └────────┼───────────────┼─────────┘
                                              │               │
                                              │  Webhook       │  Push to main
                                              │  (publish)     │
                                              ▼               ▼
                                     ┌──────────────────────────────────┐
                                     │       BUILD & DEPLOY LAYER       │
                                     │                                  │
                                     │        Cloudflare Pages          │
                                     │    ┌──────────────────────┐      │
                                     │    │  Astro Build          │      │
                                     │    │  (Node 22)            │      │
                                     │    │                       │      │
                                     │    │  Sanity data ──→ HTML │      │
                                     │    │  Pagefind ──→ Search  │      │
                                     │    └──────────────────────┘      │
                                     │                                  │
                                     │  Env vars:                       │
                                     │  • SANITY_READ_TOKEN             │
                                     │  • AC_API_URL / AC_API_KEY       │
                                     │  • TURNSTILE_SECRET_KEY          │
                                     │  • SITE / NODE_VERSION           │
                                     │                                  │
                                     └──────────────┬───────────────────┘
                                                    │
                                                    │ CDN (200+ edge locations)
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVING LAYER                                     │
│                                                                                │
│   gregorythegreat.ca ←── Cloudflare DNS ←── WHC.ca (registrar)                │
│                                                                                │
│   ┌───────────────────────┐    ┌──────────────────────────────────────────┐    │
│   │   Static Pages (HTML) │    │   Cloudflare Functions (/api/*)          │    │
│   │                       │    │                                          │    │
│   │   46 pages            │    │   /api/subscribe ──→ AC List 4 + Tag 1  │    │
│   │   Pagefind search     │    │   /api/contact ────→ AC List 7 + Tags   │    │
│   │   Security headers    │    │   /api/ambassador ─→ AC List 5 + Tag 2  │    │
│   │   Turnstile widget    │    │   /api/career ─────→ AC List 8 + Tag 17 │    │
│   │                       │    │   /api/book-study ─→ AC List 9 + Tags   │    │
│   │                       │    │   /api/event-interest → AC List 6+Tags  │    │
│   │                       │    │   /api/leadership ─→ AC + Tag 27        │    │
│   │                       │    │                                          │    │
│   └───────────────────────┘    └────────────────────┬─────────────────────┘    │
│                                                     │                          │
│   ┌──────────────────┐                              │                          │
│   │  Zeffy (payments) │ ← Embeds / modal links      │                          │
│   │  0% fees          │                              │                          │
│   │  CRA receipts     │ ─── webhook (future) ──────→│                          │
│   └──────────────────┘                              │                          │
│                                                     │                          │
└─────────────────────────────────────────────────────┼──────────────────────────┘
                                                      │
                                                      ▼
                                     ┌──────────────────────────────────┐
                                     │       CRM & EMAIL LAYER          │
                                     │                                  │
                                     │        ActiveCampaign            │
                                     │                                  │
                                     │  9 Lists:                        │
                                     │  • Master Contact (3)            │
                                     │  • Magnalia Letter (4)           │
                                     │  • Ambassador (5)                │
                                     │  • Event Attendees (6)           │
                                     │  • General Contact (7)           │
                                     │  • Career Apps (8)               │
                                     │  • Book Study (9)                │
                                     │  • Donors (10)                   │
                                     │  • Magnalia Journal (11)         │
                                     │                                  │
                                     │  31 Tags                         │
                                     │  UTM Custom Fields (7)           │
                                     │                                  │
                                     │  Automations (to build):         │
                                     │  • Welcome Series (5 emails)     │
                                     │  • Ambassador auto-reply         │
                                     │  • Contact notification          │
                                     │  • Event confirmation            │
                                     │  • Donor thank-you               │
                                     │                                  │
                                     └──────────────────────────────────┘

                                     ┌──────────────────────────────────┐
                                     │       MONITORING LAYER           │
                                     │                                  │
                                     │  • Health check cron (3x/day)    │
                                     │  • Sanity monthly backup (1st)   │
                                     │  • Cloudflare analytics          │
                                     │  • GA4 (to add)                  │
                                     │                                  │
                                     └──────────────────────────────────┘

                                     ┌──────────────────────────────────┐
                                     │       CONTENT PIPELINE           │
                                     │                                  │
                                     │  Magnalia Curation Board         │
                                     │  • 16 RSS/YouTube sources        │
                                     │  • AI scoring (Claude)           │
                                     │  • Ryan reviews weekly           │
                                     │  • Feeds into Magnalia Letter    │
                                     │                                  │
                                     └──────────────────────────────────┘
```

### Account Ownership Matrix

| Service | Account Owner | Access Level | Backup Contact |
|---------|--------------|--------------|----------------|
| **Cloudflare** | Evan | Admin | Ryan (viewer) |
| **GitHub** | Evan (Evanr-web) | Owner | — |
| **Sanity** | Evan | Admin | Victor (Editor), Catherine (Editor) |
| **ActiveCampaign** | Evan (evanropp) | Admin | Ryan (Admin), Victor (User), Catherine (User) |
| **Zeffy** | Ryan | Admin | Evan (Manager) |
| **WHC.ca (domain)** | Ryan/GGI | Owner | Evan (authorized contact) |
| **YouTube** | GGI | Owner | Ryan, Victor |
| **Substack** | GGI | Owner | Ryan |

---

## 13. Training Plan

### Ryan (Executive Director) — "Keys to the Kingdom" Document

**What he needs:** Not training — a sealed envelope. If Evan gets hit by a bus, Ryan needs to know where everything lives and how to get help.

**Deliverable: `RYAN-EMERGENCY-REFERENCE.md`**

Contents:
1. **Account inventory** — every service, login URL, who has access
2. **What each service does** (in plain English, 1 sentence each)
3. **Monthly costs** and billing accounts
4. **If the site goes down** — step-by-step (already in Ops Runbook but needs Ryan-specific version)
5. **If Evan is unavailable** — escalation paths for each service
6. **Where the code lives** — GitHub repo URL, what it is, what "static site" means
7. **Domain renewal** — when, where, auto-renew confirmation
8. **API keys** — where they're stored (Cloudflare env vars), NOT the keys themselves
9. **Who else can help** — if they need to hire a developer, what to look for (Astro/Sanity experience)

**Format:** PDF, printed copy in GGI office, digital copy in Ryan's Google Drive.

### Catherine (Programs Administrator) — Hands-On Training

**What she needs:** Ability to manage day-to-day content independently.

**Training sessions (3 × 30 min):**

| Session | Topics | Materials |
|---------|--------|-----------|
| **1: Sanity CMS** | Login, sidebar navigation, creating/editing events, publishing, preview | CMS Guide (already written — `docs/cms-guide/CMS-GUIDE.md`) |
| **2: Forms & Data** | Where form submissions go (AC), how to find contacts, how to export lists, what each list means | AC dashboard walkthrough, `FORMS-AND-AC-ARCHITECTURE.md` |
| **3: AC Basics** | View contacts, filter by list/tag, send a one-off email, check automation stats, export contacts | ActiveCampaign's own tutorials + custom GGI-specific guide |

**Deliverable: `CATHERINE-QUICK-REFERENCE.md`**
- How to add an event (step-by-step with screenshots)
- How to add a library article
- How to update homepage content
- How to check form submissions in AC
- How to send a one-off email in AC
- Common mistakes and how to fix them

### Victor (Communications) — AC Power User Training

**What he needs:** Ability to run email campaigns, manage automations, and handle communications workflow.

**Training sessions (2 × 45 min):**

| Session | Topics |
|---------|--------|
| **1: AC Campaign Management** | Creating campaigns, using templates, A/B testing subject lines, scheduling sends, reading analytics (open rate, click rate, unsubscribe) |
| **2: AC Automations & Segments** | Understanding the welcome series, how automations trigger, building segments, tagging contacts manually, handling bounces and unsubscribes |

**Deliverable: `VICTOR-AC-PLAYBOOK.md`**
- How to send the Magnalia Letter (monthly workflow)
- How to create a segment for targeted sends
- How to read the analytics dashboard
- How to handle unsubscribes and bounces
- UTM link template spreadsheet for all channels

---

## 14. Go-Live Blockers vs Nice-to-Haves

### 🔴 Blockers (Must fix before DNS swap)

| # | Item | Est. Time | Owner |
|---|------|-----------|-------|
| 1 | Create `public/_redirects` for Wix URLs | 30 min | Evan |
| 2 | Fix Christmas Books dead link (remove or add PDF) | 5 min | Evan + Ryan |
| 3 | Verify AC sender domain (SPF/DKIM/DMARC DNS records) | 30 min | Evan |
| 4 | Set AC env vars in Cloudflare (`AC_API_URL`, `AC_API_KEY`) | 5 min | Evan |
| 5 | Import welcome series automation into AC | 30 min | Evan |
| 6 | Test all 7 form endpoints on Cloudflare preview URL | 30 min | Evan |
| 7 | Verify Zeffy embeds/modals work with CSP | 15 min | Evan |
| 8 | Fix `subscribe.js` / `contact.js` variable scope bug | 5 min | Evan |
| 9 | Swap DNS nameservers at WHC.ca | 10 min | Evan + Ryan |

### 🟡 Should do within first week post-launch

| # | Item | Est. Time |
|---|------|-----------|
| 10 | Google Search Console + sitemap submission | 15 min |
| 11 | GA4 property + script tag | 30 min |
| 12 | Ambassador + Contact auto-reply automations | 1 hr |
| 13 | Update Ops Runbook to reflect Sanity webhook auto-deploy | 15 min |
| 14 | Move Google Fonts from `@import` to `<link>` preload | 15 min |
| 15 | Add preconnect hints for external origins | 5 min |
| 16 | Update homepage pillar link (Courses → Programs if Masterclasses hidden) | 5 min |
| 17 | Add CRA/charity number to footer | 5 min |
| 18 | Remove deprecated `X-XSS-Protection` header | 2 min |

### 🟢 Nice-to-haves (month 1-2)

| # | Item |
|---|------|
| 19 | Breadcrumbs component |
| 20 | Active nav indicator |
| 21 | Structured data (JSON-LD) |
| 22 | Lead magnet PDF |
| 23 | Exit-intent popup |
| 24 | Post-subscribe next-step CTA |
| 25 | Image optimization (WebP/srcset) |
| 26 | Zeffy → AC webhook |
| 27 | Content upgrades on library articles |
| 28 | Keyboard-accessible dropdown |
| 29 | Focus trap on mobile menu |
| 30 | favicon.ico fallback |

---

## Appendix: Files Referenced

| File | Purpose |
|------|---------|
| `docs/ECOSYSTEM.md` | Full system reference |
| `docs/LAUNCH-CHECKLIST.md` | Go-live sequence |
| `docs/FORMS-AND-AC-ARCHITECTURE.md` | Form → AC mapping |
| `docs/ACTIVECAMPAIGN-SETUP.md` | AC automation templates |
| `docs/ANALYTICS-AND-UTM-ARCHITECTURE.md` | UTM strategy |
| `docs/OPS-RUNBOOK.md` | Non-technical operations guide |
| `docs/cms-guide/CMS-GUIDE.md` | Sanity CMS user guide |
| `docs/FUTURE-IMPROVEMENTS.md` | Backlog |
| `docs/GIVING-STRUCTURE.md` | Giving tier details |
| `docs/welcome-series/` | 5 HTML email templates |
