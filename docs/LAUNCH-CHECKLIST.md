# GGI Website Launch Checklist

## DNS & Hosting
- [ ] Deploy to Cloudflare Pages
- [ ] Point `gregorythegreat.ca` DNS to Cloudflare
- [ ] Verify SSL certificate active
- [ ] Set up 301 redirects from old Wix URLs

## ActiveCampaign
- [ ] Verify sender domain (`gregorythegreat.ca`) — add SPF, DKIM, DMARC records to Cloudflare DNS
- [ ] Set Cloudflare Pages env vars: `AC_API_URL`, `AC_API_KEY`
- [ ] **Replace image URLs in all AC email templates:** find `https://evanr-web.github.io/ggi-website/` → replace `https://gregorythegreat.ca/`
- [ ] Build 4 automations in AC dashboard (copy from `ACTIVECAMPAIGN-SETUP.md`)
- [ ] Re-scan Brand Kit with `https://gregorythegreat.ca/`
- [ ] Send test emails — check rendering in Gmail, Apple Mail, Outlook
- [ ] Ryan/Victor review welcome sequence copy

## Forms
- [ ] Test all 11 forms on live site (subscribe, contact, ambassador)
- [ ] Verify contacts appear in correct AC lists with correct tags

## Content
- [ ] Fill Email 3 curated selection placeholders (articles, book, video, beauty)
- [ ] Host reading list PDF and update `%%READING_LIST_URL%%` in Email 1 and Email 2
- [ ] Magnalia sample article ("Irrigating the New Deserts") live in Library

## Sanity CMS
- [ ] Wire remaining pages to Sanity (people, programs, tiers)
- [ ] Confirm Studio accessible for Victor
- [ ] Upgrade Sanity Studio to v4 (required by July 15, 2026 — `npm update sanity` + `npx sanity deploy`)

## GitHub
- [ ] Transfer repo to GGI org (or keep under Evanr-web — decide)

## Final Checks
- [ ] Pagefind search working (hard refresh + test)
- [ ] Media logos on founding director page
- [ ] OG images rendering on social shares
- [ ] RSS feed (`/rss.xml`) validates
- [ ] Mobile test all pages (375px)
