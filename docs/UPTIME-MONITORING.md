# Uptime Monitoring with Better Stack

## What This Does

Uptime monitoring automatically checks whether your website is responding every few minutes. If the site goes down, you get an email (or text) alert immediately — instead of finding out hours later when someone complains.

Think of it as a tireless assistant that visits your website every 3 minutes, 24/7, and calls you if something's wrong.

---

## Why You Need This (Even With the Existing Health Check)

The GGI site already has a **cron-based health check** (cron ID `ce73454f`) that runs 3 times per day and checks content correctness — verifying that pages render properly and contain expected content.

Better Stack serves a **different purpose**: pure uptime/availability monitoring. It checks far more frequently (every 3 minutes vs 3 times daily) and answers a simpler question: *"Does the site respond at all?"*

| | Existing Cron Health Check | Better Stack |
|---|---|---|
| **Frequency** | 3× per day | Every 3 minutes |
| **What it checks** | Content correctness (pages render with expected content) | Basic availability (does it respond with HTTP 200?) |
| **Alert method** | Telegram | Email, SMS, Slack |
| **Incident history** | Manual logs | 30-day dashboard |
| **Cost** | Free (self-hosted) | Free tier |

**They complement each other.** Better Stack catches outages fast. The cron check catches subtle content or rendering issues.

---

## Better Stack Free Tier — What You Get

- **10 monitors** (more than enough for GGI)
- **3-minute check intervals**
- **Email alerts** (included free)
- **Slack integration** (included free)
- **30-day incident history** with timeline
- **Public status page** (optional)
- No credit card required

---

## Setup Steps

### 1. Create a Better Stack Account

1. Go to [**betterstack.com**](https://betterstack.com)
2. Click **Get Started Free** or **Sign Up**
3. Create an account with your email (use `evanropp@gmail.com` or a shared GGI email)
4. Verify your email address
5. You'll land on the Better Stack dashboard

### 2. Navigate to Uptime Monitoring

1. In the Better Stack dashboard, find **Uptime** in the left sidebar
2. Click **Monitors**

### 3. Add Monitors

Click **Create Monitor** for each of the following. For each one:
- **Monitor type:** HTTP(s)
- **Check frequency:** Every 3 minutes
- **Request method:** GET

#### Recommended Monitors

Set up these monitors for the **current GitHub Pages preview** site:

| Monitor Name | URL |
|---|---|
| GGI — Homepage | `https://evanr-web.github.io/ggi-website/` |
| GGI — Contact Page | `https://evanr-web.github.io/ggi-website/contact/` |
| GGI — Magnalia Letter | `https://evanr-web.github.io/ggi-website/magnalia-letter/` |
| GGI — Careers | `https://evanr-web.github.io/ggi-website/careers/` |

**After migrating to Cloudflare Pages**, update or duplicate the monitors with production URLs:

| Monitor Name | URL |
|---|---|
| GGI — Homepage (Prod) | `https://gregorythegreat.ca/` |
| GGI — Contact Page (Prod) | `https://gregorythegreat.ca/contact/` |
| GGI — Magnalia Letter (Prod) | `https://gregorythegreat.ca/magnalia-letter/` |
| GGI — Careers (Prod) | `https://gregorythegreat.ca/careers/` |

> You'll use 4–8 of your 10 free monitors, leaving room for future additions (e.g., API endpoints, Sanity Studio).

### 4. Configure Each Monitor

For each monitor, set:

- **Expected status code:** `200`
- **Timeout:** 30 seconds (default is fine)
- **Confirmation period:** 1 (re-check once before alerting — reduces false positives)
- **Recovery period:** 1 (alert as soon as site comes back)

### 5. Set Up Alert Contacts

1. Go to **Uptime** → **Integrations** (or **Who to notify** section)
2. Add an **Email** integration:
   - Email: `evanropp@gmail.com`
3. Optionally add **Ryan's email** as a second contact for redundancy
4. Assign these contacts to all your monitors

### 6. Verify It Works

1. After creating a monitor, wait 3 minutes for the first check
2. The monitor should show a green **"Up"** status
3. You can test alerts by temporarily pointing a monitor at a fake URL (e.g., `https://gregorythegreat.ca/nonexistent-page-test-12345/`) and waiting for the alert, then deleting that test monitor

---

## Status Page (Optional)

Better Stack's free tier includes a **public status page** — a simple webpage that shows whether your services are up or down.

### When It's Useful

- **Transparency:** If donors, parents, or partners want to know if the site is having issues, they can check the status page instead of emailing you
- **During incidents:** You can post updates ("We're aware of the issue, working on a fix")

### How to Set It Up

1. In Better Stack, go to **Status Pages** in the sidebar
2. Click **Create Status Page**
3. Give it a name: `Gregory the Great Institute`
4. Select which monitors to display (all 4 recommended)
5. Better Stack gives you a URL like `ggi.betteruptime.com`
6. Optionally link it from the GGI website footer

### When to Skip It

If you don't expect external users to check site status independently, skip this for now. You can always add it later. The alerting is the important part.

---

## Maintenance

Better Stack is largely set-and-forget:

- **If you add new important pages**, add monitors for them
- **When you migrate to Cloudflare Pages**, update the URLs in your monitors from `evanr-web.github.io` to `gregorythegreat.ca`
- **Review the incident history monthly** (part of the monthly checklist in the Ops Runbook) — look for patterns (e.g., brief outages at the same time each day)
- **If you start getting false positive alerts**, increase the confirmation period to 2 or 3 (requires more consecutive failures before alerting)
