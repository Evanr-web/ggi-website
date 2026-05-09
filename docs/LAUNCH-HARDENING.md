# GGI Launch Hardening Checklist

Pre-launch security, stability, and operational readiness checklist.
**Do not go live until every Critical item is resolved.**

---

## 🔴 CRITICAL — Must fix before launch

### 1. Sanity API tokens: separate read vs write
**Risk:** One token with Editor access used for both builds and Studio. If it leaks via build logs or env dump, anyone can edit/delete all CMS content.

**Fix:**
- Create a **read-only Viewer token** in Sanity → Settings → API → Tokens
- Use the Viewer token for Astro builds (`SANITY_TOKEN` in Cloudflare env vars)
- Keep the existing Editor token **only** for Sanity Studio (local use or Studio deploy)
- Never put the write token in any CI/CD environment
- [ ] Done

### 2. CORS: lock down API function origins
**Risk:** `corsHeaders()` in `_shared.js` falls back to `Access-Control-Allow-Origin: *`. Anyone can POST to your API endpoints from any domain — form spam, list pollution, AC quota burn.

**Fix in `functions/api/_shared.js`:**
```javascript
const ALLOWED_ORIGINS = [
  'https://gregorythegreat.ca',
  'https://www.gregorythegreat.ca',
];

export function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
```
- [ ] Done

### 3. Rate limiting on Cloudflare
**Risk:** No rate limiting on `/api/*` endpoints. Bot networks can hammer subscribe/contact endpoints, flooding ActiveCampaign with junk contacts and burning your AC plan quota.

**Fix:** In Cloudflare dashboard → Security → WAF → Rate Limiting Rules:
- Rule: `/api/*` — max 5 requests per 10 seconds per IP → block for 60s
- Rule: `/api/subscribe` — max 3 requests per minute per IP → block for 300s
- [ ] Done

### 4. Input validation on all endpoints
**Risk:** No email format validation. No length limits on text fields. The `message` field in contact.js and `ideas`/`community` fields in ambassador.js accept unlimited text — potential for abuse or injection into AC.

**Fix for every endpoint — add at the top of each `onRequestPost`:**
```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return jsonResponse({ error: 'Invalid email address' }, 400, origin);
}

// Length limits
if (firstName && firstName.length > 100) {
  return jsonResponse({ error: 'Name too long' }, 400, origin);
}
if (message && message.length > 5000) {
  return jsonResponse({ error: 'Message too long' }, 400, origin);
}
```
- [ ] Done for subscribe.js
- [ ] Done for contact.js
- [ ] Done for ambassador.js
- [ ] Done for career.js

### 5. Career file upload validation
**Risk:** `career.js` checks file size (5MB, good) but not file type. Someone could upload an executable, script, or HTML file to your R2 bucket.

**Fix — add after the size check:**
```javascript
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
if (!ALLOWED_TYPES.includes(resume.type)) {
  return jsonResponse({ error: 'Only PDF and Word documents accepted' }, 400, origin);
}
```
- [ ] Done

---

## 🟡 HIGH — Fix before or shortly after launch

### 6. Security headers via Cloudflare
**Risk:** No CSP, no X-Frame-Options, no HSTS. Site can be iframed (clickjacking), no XSS mitigation layer.

**Fix:** Create `_headers` file in project root (Cloudflare Pages reads this):
```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.sanity.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://cdn.sanity.io data:; connect-src 'self' https://*.sanity.io; frame-ancestors 'none'
```
**Note:** CSP may need tuning — test after deploying. If Zeffy embeds or other third-party scripts are used, add their domains.
- [ ] Done

### 7. Add .nvmrc for consistent builds
**Risk:** `engines` field exists in package.json (good) but CI/CD and contributors may ignore it. Node 25 breaks the build silently.

**Fix:**
```bash
echo "22" > .nvmrc
```
And add to README: "Run `nvm use` before building."
- [ ] Done

### 8. Cloudflare Turnstile (CAPTCHA)
**Risk:** Even with rate limiting, bots can submit forms at human pace. No CAPTCHA = easy target for list poisoning and AC quota burn. Zeffy/Stripe handle their own fraud detection — Turnstile is only for **your** 4 form endpoints.

**Fix — client side:** Add Turnstile widget to each form:
```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY" data-theme="light"></div>
```

**Fix — server side:** Validate the token in each Cloudflare Function before processing:
```javascript
const turnstileSecret = env.TURNSTILE_SECRET_KEY;
const token = body['cf-turnstile-response'];
const ip = request.headers.get('CF-Connecting-IP');

const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: turnstileSecret, response: token, remoteip: ip }),
});
const result = await verification.json();
if (!result.success) {
  return jsonResponse({ error: 'Verification failed' }, 403, origin);
}
```

**Setup:**
1. Cloudflare dashboard → Turnstile → Add site → `gregorythegreat.ca`
2. Choose "Managed" mode (invisible when possible, challenges when suspicious)
3. Copy site key → frontend widget. Copy secret key → `TURNSTILE_SECRET_KEY` env var in Cloudflare Pages.
4. Add `https://challenges.cloudflare.com` to CSP `script-src` in `_headers`

- [ ] Site key created
- [ ] Secret key in Cloudflare Pages env vars
- [ ] Widget added to all 4 forms
- [ ] Server-side validation in all 4 endpoints
- [ ] CSP updated

### 9. Honeypot field for bot filtering
**Risk:** Defense in depth — catches dumb bots that bypass or don't execute JavaScript (Turnstile requires JS). Zero cost, zero user friction.

**Fix:** Add a hidden field to each form:
```html
<input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />
```
In each function, reject submissions where it's filled (check **before** Turnstile to save an API call):
```javascript
if (body.website) {
  // Bot detected — return success to not reveal detection
  return jsonResponse({ success: true }, 200, origin);
}
```
- [ ] Done

### 10. Error logging
**Risk:** All `catch` blocks return generic "Failed to submit" with no logging. When something breaks, you'll have zero visibility.

**Fix:** Add `console.error` in every catch block (Cloudflare captures these in Workers logs):
```javascript
} catch (err) {
  console.error(`[subscribe] Error: ${err.message}`, { email: email?.slice(0, 3) + '***' });
  return jsonResponse({ error: 'Failed to subscribe' }, 500, origin);
}
```
Redact PII in logs — only log partial email for debugging.
- [ ] Done

### 11. Confirm Pagefind search works
**Risk:** Flagged as potentially broken. 42-page site with no working search is a usability failure.

**Fix:** Build locally, open in browser, test search for "Ryan", "Magnalia", "Ambassador". Confirm results appear.
- [ ] Done

---

## 🟢 MEDIUM — Before scaling / marketing push

### 12. Uptime monitoring
Set up a free monitoring service (UptimeRobot, Freshping, or Cloudflare health check):
- Monitor: `https://gregorythegreat.ca`
- Alert: email to Evan + whoever is ops contact at GGI
- Check interval: 5 minutes
- [ ] Done

### 13. Sanity content backup
**Risk:** No backup strategy. Accidental deletion by CMS users = content loss.

**Fix options (pick one):**
- Sanity CLI export on a schedule: `sanity dataset export production backup.tar.gz`
- Or: Sanity webhooks → backup to R2/S3 on content change
- Simplest: monthly manual export, store in the repo's `/backups/` (gitignored)
- [ ] Done

### 14. Ops runbook
**Risk:** Bus factor = 1 (Evan). If something breaks, no one else can fix it.

**Write a 1-pager covering:**
- How to trigger a rebuild (push to `main`)
- How to check Cloudflare Functions logs
- How to access Sanity Studio
- What the AC API key is and where it lives
- Who to contact if DNS breaks
- Emergency: how to put up a static maintenance page
- [ ] Done

### 15. 301 redirects from old site
**Risk:** Old URLs return 404, killing any existing Google juice and confusing bookmarked users.

**Fix:** `_redirects` file in project root (Cloudflare Pages format):
```
/old-path /new-path 301
```
Map every old URL to its new equivalent.
- [ ] Done

### 16. Ambassador/contact fields not captured in AC
The ambassador form collects city, province, connection, community, ideas — but none of these are sent to AC custom fields (noted in the TODO comments). Data is silently dropped.

**Fix:** Create custom fields in AC dashboard, get their IDs, map them in `ambassador.js` via the `fields` parameter.
- [ ] Done

---

## Post-launch

- [ ] Set up Cloudflare analytics (privacy-friendly, no cookie banner needed)
- [ ] Configure AC welcome automation (7 email templates already in `docs/welcome-series/`)
- [ ] DNS cutover from old host
- [ ] Remove GitHub Pages preview (or redirect to production domain)
- [ ] Test all forms end-to-end with real AC environment
- [ ] Review AC email deliverability (SPF/DKIM/DMARC on gregorythegreat.ca)
