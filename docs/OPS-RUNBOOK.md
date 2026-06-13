# GGI Website — Operations Runbook

This guide is for **Ryan, Victor, and anyone** who needs to manage the Gregory the Great Institute website without touching code. If something breaks and Evan isn't available, start here.

---

## 1. Quick Reference

| What | Where |
|------|-------|
| **Live site** | [gregorythegreat.ca](https://gregorythegreat.ca) |
| **GitHub Pages preview** | [evanr-web.github.io/ggi-website](https://evanr-web.github.io/ggi-website/) |
| **Sanity Studio (CMS)** | [localhost:3333](http://localhost:3333) or [gregorythegreat.sanity.studio](https://gregorythegreat.sanity.studio) |
| **Sanity project ID** | `dhzbvx7r` (dataset: `production`) |
| **Cloudflare Pages dashboard** | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **ActiveCampaign** | Login via ActiveCampaign dashboard |
| **GitHub repo** | [github.com/Evanr-web/ggi-website](https://github.com/Evanr-web/ggi-website) |

### Key People

| Person | Role | Contact For |
|--------|------|-------------|
| **Evan** | Technical lead, Fundraising Chair | Code changes, deploys, DNS, debugging, anything technical |
| **Victor Carpay** | Comms / CMS user | Content questions, CMS workflow |
| **Ryan Topping** | Executive Director | Organizational decisions, escalation |
| **Catherine Renneberg** | Programs | Program-related content |

### Brand Colours

- **Navy:** `#0e3352`
- **Gold:** `#b89a47`
- **Crimson:** `#84292d`

---

## 2. Content Updates (Victor)

All content on the site is managed through **Sanity Studio** — a web-based content editor. You do not need to touch any code.

👉 **For detailed CMS instructions, see [`docs/cms-guide/CMS-GUIDE.md`](cms-guide/CMS-GUIDE.md).**

### What You Can Do in Sanity Studio

- Add/edit/remove **events** (upcoming and past)
- Add **library items** (articles, resources)
- Publish new **Magnalia** newsletter issues
- Update **homepage content** (hero text, featured items)
- Manage **banner/popup** announcements
- Add/edit **people** (team members, board, fellows)

### How to Access Sanity Studio

1. Go to the Sanity Studio URL (see Quick Reference above)
2. Log in with your **sanity.io account** (uses browser-based login — Google or email)
3. You'll see the content dashboard with document types on the left sidebar
4. Click any document type → select or create a document → edit → **Publish**

### Important: Content Won't Appear Immediately

After publishing in Sanity, the content is saved but the **live site needs to be rebuilt** to show your changes. See the next section for how to trigger a rebuild.

---

## 3. Routine Operations

### Triggering a Rebuild / Deploy

The site is **static** — it's built once and served as plain files. When you update content in Sanity, the site needs to be rebuilt to pick up changes.

**How to trigger a rebuild:**

1. Go to [github.com/Evanr-web/ggi-website](https://github.com/Evanr-web/ggi-website)
2. Navigate to **Actions** tab at the top
3. Find the deploy/build workflow on the left
4. Click **Run workflow** → confirm
5. Wait 2–5 minutes for the build to complete
6. Check the site to verify your changes appear

> **If you don't have GitHub access or this doesn't work, ask Evan to trigger a deploy.**

### Checking If the Site Is Up

1. Open [gregorythegreat.ca](https://gregorythegreat.ca) in your browser
2. If the page loads normally → the site is up
3. If you get an error page → see "Common Issues" below

> **Automated monitoring:** A health-check cron job already runs 3 times per day and sends a Telegram alert if the site is down. You don't need to manually check unless you suspect an issue.

### What To Do If the Site Is Down

1. **Don't panic.** The site is static files served by Cloudflare — it's very reliable.
2. **Check if it's just you:** Try from your phone (on cellular data, not your WiFi). Ask someone else to try.
3. **Check Cloudflare status:** Go to [cloudflarestatus.com](https://www.cloudflarestatus.com) — if Cloudflare is having issues, you just have to wait.
4. **If the site is genuinely down:** Contact Evan immediately (see Emergency Contacts).

---

## 4. Emergency Contacts

| Issue | Who to Contact | How |
|-------|---------------|-----|
| Site is down | **Evan** (first), then Cloudflare support | Telegram / phone |
| CMS not loading or login issues | **Evan** (first), then [Sanity support](https://www.sanity.io/contact) | Email / Telegram |
| Forms not submitting | **Evan** | Telegram |
| Content looks wrong after publish | **Victor** (content issue) or **Evan** (code issue) | Telegram |
| DNS / domain issues | **Evan** | Telegram |
| ActiveCampaign (email delivery, lists) | **Evan** | Telegram |

**Evan's escalation priority:** Telegram first, then phone.

---

## 5. Common Issues & Fixes

### Build Fails

- **What it looks like:** GitHub Actions shows a red ❌ on the build
- **Most common cause:** Wrong Node.js version. The project requires **Node 22**. Node 25 breaks a dependency called `simdjson`.
- **Fix:** Check that the build environment uses Node 22 (there's a `.nvmrc` file that pins this). If unsure, ask Evan.

### Content Not Showing After Publishing

- **What it looks like:** You published something in Sanity Studio but the website still shows old content
- **Cause:** The site needs to be **rebuilt** to pick up CMS changes (see "Triggering a Rebuild" above)
- **Fix:** Trigger a new build. Changes appear after the build completes (2–5 minutes).

### Forms Not Working (Subscribe, Contact, Ambassador, Career)

- **What it looks like:** Someone fills out a form and gets an error, or submissions don't appear in ActiveCampaign
- **Cause:** Usually an issue with the ActiveCampaign API connection
- **What to check:** The Cloudflare Pages environment variables `AC_API_URL` and `AC_API_KEY` need to be set correctly. The Career form also needs `CAREER_UPLOADS` (an R2 storage bucket).
- **Fix:** This requires Evan — environment variables are set in the Cloudflare dashboard.

### Search Not Working

- **What it looks like:** The site search returns no results or outdated results
- **Cause:** Search is powered by **Pagefind**, which indexes the site at build time
- **Fix:** Trigger a rebuild. The search index is regenerated with every build.

### Sanity Studio Won't Load

- **Try:** Clear your browser cache, try a different browser, try incognito mode
- **If still broken:** Check [status.sanity.io](https://status.sanity.io) for Sanity service issues
- **Still stuck:** Contact Evan

---

## 6. Architecture Overview

Here's how all the pieces connect:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────┐
│   Sanity     │────▶│  Astro Build │────▶│ Cloudflare Pages │────▶│  Visitor  │
│   Studio     │     │  (GitHub)    │     │  (hosting)       │     │ (browser) │
│  (content)   │     │              │     │                  │     │          │
└─────────────┘     └──────────────┘     └──────────────────┘     └──────────┘
                                                │
                                          ┌─────┴─────┐
                                          │ Cloudflare │
                                          │ Functions  │
                                          │ (4 forms)  │
                                          └─────┬─────┘
                                                │
                                         ┌──────┴───────┐
                                         │ ActiveCampaign│
                                         │ (email lists) │
                                         └──────────────┘
```

**In plain English:**

1. **Victor (or anyone)** edits content in **Sanity Studio** (the CMS — like a WordPress dashboard)
2. When a **build is triggered**, the Astro framework pulls all content from Sanity and generates static HTML pages
3. Those pages are deployed to **Cloudflare Pages** (the hosting service that serves the website)
4. When a **visitor** fills out a form, it goes through **Cloudflare Functions** (small server programs) that send the data to **ActiveCampaign** (the email/contact management system)

**Key insight:** Content lives in Sanity. The website is just a snapshot of that content at the time of the last build. New content requires a new build.

---

## 7. Monthly Checklist

Do these once a month to keep things healthy:

- [ ] **Review ActiveCampaign contacts** — Check subscriber growth, bounce rates, unsubscribes. Log into ActiveCampaign dashboard → Contacts → Lists.
- [ ] **Test all forms** — Submit a test entry to each form (Subscribe, Contact, Ambassador, Career). Verify it appears in ActiveCampaign.
- [ ] **Review Sanity for stale content** — Check for past events still showing, outdated announcements, expired banners/popups.
- [ ] **Check Cloudflare dashboard** — Look at the Analytics tab for traffic trends. Check the Workers/Functions tab for any error spikes.
- [ ] **Verify site loads correctly** — Spot-check 5–6 pages on both desktop and mobile.
- [ ] **Back up Sanity content** — See [`docs/SANITY-BACKUP.md`](SANITY-BACKUP.md) for instructions.

---

## 8. If Evan Is Unavailable

### What You CAN Do Without Evan

✅ **Content updates** — Add, edit, or remove any content in Sanity Studio. This is fully self-service.
✅ **Check if the site is up** — Just visit it in a browser.
✅ **Read error messages** — If a build fails, the GitHub Actions log often says what went wrong in plain English.
✅ **Check ActiveCampaign** — Review contacts, lists, email delivery stats.
✅ **Trigger a rebuild** — Via GitHub Actions (if you have access).
✅ **Back up Sanity content** — Follow the export steps in the backup guide (requires terminal access).

### What NEEDS Evan

❌ **Code changes** — Any change to how the site looks or works (layout, design, functionality)
❌ **Deploy configuration** — Cloudflare Pages settings, environment variables, build settings
❌ **DNS changes** — Domain routing, SSL certificates
❌ **Fixing broken builds** — If a build fails and the error isn't obvious
❌ **Form/API debugging** — If forms stop working
❌ **New features** — Any new page, form, integration, or functionality
❌ **Server/hosting issues** — Anything in Cloudflare that isn't just checking the dashboard

### Escalation Path (If Evan Can't Be Reached)

1. **Wait 24 hours** — Most issues aren't truly urgent. Content updates can wait for the next build.
2. **If the site is completely down and Evan is unreachable for 48+ hours:**
   - Check [Cloudflare status](https://www.cloudflarestatus.com) — it may be a platform-wide issue
   - Contact Cloudflare support through the dashboard
   - The site is static files — even if builds break, the last deployed version stays up
3. **If ActiveCampaign stops working:**
   - Log into ActiveCampaign directly to check service status
   - Contact ActiveCampaign support — they have good documentation
4. **If Sanity CMS is down:**
   - Check [status.sanity.io](https://status.sanity.io)
   - Contact Sanity support at [sanity.io/contact](https://www.sanity.io/contact)

> **Remember:** The biggest advantage of a static site is that it stays up even when everything else breaks. The last deployed version will keep serving until someone pushes a new build. Content might be stale, but the site stays online.
