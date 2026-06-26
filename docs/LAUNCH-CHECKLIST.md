# GGI Launch Checklist — Weekend Sequence

## PHASE 1: Pre-Flight (Friday Night / Saturday Morning)
*Everything before you touch DNS*

### 1.1 — Get Access from Ryan
- [x] WHC.ca login credentials (domain registrar)
- [x] ActiveCampaign live API key + URL
- [ ] Confirm: email is Google Workspace, managed in Cloudflare DNS
- [ ] Ask Ryan for any Wix URLs they've shared publicly (social posts, printed materials, email signatures)

### 1.2 — Snapshot & Backup
- [ ] Take a manual Sanity backup (`scripts/backup-sanity.sh`)
- [ ] Screenshot the current Wix site homepage (rollback reference)
- [ ] Log into WHC.ca → screenshot ALL current DNS records (MX, TXT, CNAME, A, everything) — your insurance policy

### 1.3 — Set Up Cloudflare
- [ ] Create Cloudflare account (use an institute email, or your email — discuss with Ryan who owns it)
- [ ] Add `gregorythegreat.ca` to Cloudflare (free plan)
- [ ] Cloudflare will auto-scan DNS — **verify it imported everything**, especially:
  - [ ] MX records (Google Workspace mail)
  - [ ] SPF TXT record (`v=spf1 include:_spf.google.com ~all` or similar)
  - [ ] DKIM TXT record(s) (Google-generated `google._domainkey`)
  - [ ] DMARC TXT record (`_dmarc`)
  - [ ] Any other TXT/CNAME records (Zeffy verification, etc.)
- [ ] Add Cloudflare Pages project — connect to `Evanr-web/ggi-website` repo
- [ ] Set build config: Node 22, `npm run build`, output `dist/client`
- [ ] Set environment variables: `SITE=https://gregorythegreat.ca` (no `BASE` needed on production)
- [ ] Add `SANITY_READ_TOKEN` as env var in Cloudflare Pages
- [ ] Trigger a test build — confirm it succeeds
- [ ] Set custom domain on Cloudflare Pages: `gregorythegreat.ca` + `www.gregorythegreat.ca`

### 1.4 — Wire ActiveCampaign
- [ ] Add AC API key + URL as Cloudflare environment variables
- [ ] Set up AC lists and tags per `docs/FORMS-AND-AC-ARCHITECTURE.md`
- [ ] Test all 4 existing form endpoints on the Cloudflare preview URL:
  - [ ] `/api/subscribe` — newsletter signup
  - [ ] `/api/contact` — contact form
  - [ ] `/api/ambassador` — ambassador signup
  - [ ] `/api/career` — career application (with file upload)
- [ ] Confirm submissions land in AC with correct lists/tags

### 1.4b — Fix & Build Missing Forms (see `FORMS-AND-AC-ARCHITECTURE.md`)
- [ ] Wire footer newsletter form to `/api/subscribe` (currently dead)
- [ ] Fix Book Study form — new `/api/book-study` endpoint (currently dumps into Magnalia Letter list)
- [ ] Build `/api/event-interest` endpoint (conference notify, event registration)
- [ ] Build `/api/leadership` endpoint (Leadership Circle inquiry form)
- [ ] Create Zeffy checkout pages for all payment forms:
  - [ ] General donation
  - [ ] Friend ($15+/mo)
  - [ ] Magnalia Single Issue ($45)
  - [ ] Magnalia Annual ($80/yr)
  - [ ] Magnalia Patron ($600/yr)
  - [ ] Music Camp registration
- [ ] Swap all placeholder `/contact/` links with Zeffy URLs on payment pages

### 1.4c — Analytics & UTM Attribution (see `ANALYTICS-AND-UTM-ARCHITECTURE.md`)
- [ ] Create GA4 property at [analytics.google.com](https://analytics.google.com)
- [ ] Add GA4 script tag to `BaseLayout.astro`
- [ ] Write UTM capture script (reads URL params → `sessionStorage`, runs on every page)
- [ ] Add hidden UTM fields to all forms (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `signup_page`)
- [ ] Update `_shared.js` `addContact()` to pass UTM values to AC as custom fields
- [ ] Create AC custom fields: `first_source`, `first_medium`, `first_campaign`, `last_source`, `last_medium`, `last_campaign`, `signup_page`
- [ ] Verify end-to-end: visit site with UTM params → fill form → check AC contact has UTM fields populated

### 1.5 — 301 Redirects
- [ ] Create `public/_redirects` file mapping old Wix URLs to new paths
- [ ] At minimum: homepage, about, programs, events, contact, donate
- [ ] Add a catch-all fallback: `/old-wix-path/* /404 404`

### 1.6 — Full Site Smoke Test
- [ ] Click through all 42 pages on the Cloudflare preview URL
- [ ] Test on mobile (phone browser)
- [ ] Verify Pagefind search works
- [ ] Verify Sanity content loads (events, library, magnalia)
- [ ] Check all external links (Zeffy donate, social media, etc.)
- [ ] Verify security headers are present (DevTools → Network → Response Headers)

---

## PHASE 2: Cutover (Saturday Morning)
*Do this when you have the full day ahead of you*

### 2.1 — Flip DNS
- [ ] In WHC.ca: change nameservers to Cloudflare's (`pearl.ns.cloudflare.com` / `phil.ns.cloudflare.com`)
- [ ] Start a timer — propagation begins now
- [ ] Check [dnschecker.org](https://dnschecker.org) for `gregorythegreat.ca` periodically

### 2.2 — Verify During Propagation (check every 30 min)
- [ ] Site loads on `gregorythegreat.ca`
- [ ] HTTPS works (padlock icon)
- [ ] Forms submit successfully
- [ ] Email still works — have Ryan send/receive a test email
- [ ] Search works on production domain

### 2.3 — Cloudflare Hardening (once DNS is active)
- [ ] **WAF rate limiting:** Security → WAF → Rate Limiting Rules
  - Rule: `/api/*` — limit to 10 requests per minute per IP
- [x] **Turnstile CAPTCHA:** Added to all 14 forms (site key `0x4AAAAAADm6eYaBvIIwZNRm`)
- [x] **Bot protection:** Bot Fight Mode enabled
- [x] **Honeypot fields:** Invisible `website` field on all forms
- [ ] **SSL mode:** SSL/TLS → set to "Full (strict)"

---

## PHASE 3: Post-Launch (Saturday Afternoon / Sunday)
*Confirm everything is solid*

### 3.1 — Update References
- [ ] Update GitHub Actions workflow: add Cloudflare Pages deploy (or remove GitHub Pages if no longer needed as preview)
- [ ] Update health check cron (`ce73454f`) to check `gregorythegreat.ca` instead of GitHub Pages URL
- [ ] Update `OPS-RUNBOOK.md` with the live Cloudflare dashboard link
- [ ] CORS in Sanity: confirm `gregorythegreat.ca` is already listed ✅

### 3.2 — SEO & Indexing
- [ ] Submit `gregorythegreat.ca` sitemap to Google Search Console
- [ ] Verify `robots.txt` is accessible
- [ ] Check OG tags render correctly (paste a link in Telegram/Twitter/Facebook to preview)

### 3.3 — Notify Stakeholders
- [ ] Tell Ryan: site is live, here's what changed, here's who to call if something breaks
- [ ] Tell Victor: CMS workflow is unchanged, content updates work the same way
- [ ] Send Ryan the Ops Runbook + CMS Guide links

### 3.4 — Safety Net
- [ ] **DO NOT cancel Wix for 2-4 weeks**
- [ ] If anything breaks: flip WHC.ca nameservers back → instant rollback to Wix
- [ ] Monitor health check alerts (already running 3x/day)

---

## PHASE 4: Post-Launch (Next Week)

### 4.1 — Zeffy → ActiveCampaign Webhook
- [ ] Build `/api/zeffy-webhook` Cloudflare Worker
- [ ] Configure Zeffy outbound webhook → `https://gregorythegreat.ca/api/zeffy-webhook`
- [ ] Implement webhook signature verification
- [ ] Map Zeffy payment types to AC giving tier tags
- [ ] Test end-to-end: Zeffy test payment → AC contact created with correct tags

### 4.2 — Analytics Phase 2
- [ ] Set up GA4 conversion events (form submissions, Zeffy link clicks)
- [ ] Create UTM link template/spreadsheet for Ryan and Victor
- [ ] Add Google Tag Manager container (migrate GA4 into it)
- [ ] Tag all YouTube video description links with UTMs
- [ ] Tag all Substack cross-post links
- [ ] Tag social media bio links

### 4.3 — AC Automations
- [ ] Welcome email series (7 templates already in `docs/welcome-series/`)
- [ ] Upgrade nudge automations (Friend → Patron, etc.)
- [ ] Event follow-up sequences

---

## Rollback Plan (if needed)
1. Log into WHC.ca
2. Change nameservers back to Wix's original nameservers (that's why you screenshot them in 1.2)
3. Wait 1-4 hours
4. You're back on Wix. Fix the issue. Try again.
