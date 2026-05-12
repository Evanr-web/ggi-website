# GGI Future Improvements

## Zeffy → AC Webhook Integration
- [ ] Build `/api/zeffy-webhook` Cloudflare Function
  - Receives Zeffy webhook events (donation, ticket purchase, registration)
  - Creates/updates contact in AC with name, email, phone
  - Auto-tags by event (e.g. `event:music-camp-2026`) and action (`donor:active`)
- [ ] Configure webhook URL in Zeffy admin dashboard
- [ ] Create `donor:active` tag in AC — apply automatically when someone donates
- [ ] Create `subscriber:magnalia` tag in AC — apply when someone subscribes to print journal
- [ ] Add If/Else before Email 5 (The Invitation) in welcome sequence:
  - If `donor:active` OR `subscriber:magnalia` → skip or send alternate version
  - Else → send Email 5 as-is
- [ ] AC becomes single source of truth for all registrations (paid via Zeffy + free via site forms)

## Sanity Form Builder
- [ ] Create "Form" schema in Sanity (name, fields array, AC list/tag destination)
  - Field types: text, email, phone, dropdown, textarea, checkbox
- [ ] Build generic Astro form component that renders Sanity-defined forms
- [ ] Build generic `/api/form-submit` CF Function that routes submissions to AC
- [ ] Team can create simple forms (RSVP, contact, interest, signup) from CMS — no dev needed
- [ ] Custom forms (file uploads, payment, multi-step) still built by hand as needed

## Page Accent Colors (Brand-Safe)
- [ ] Add "Page Accent" dropdown to event/program schemas
  - Preset options: Gold (default), Navy, Crimson, Laurel Green
  - Affects hero overlay, CTA buttons, section dividers
- [ ] No free color pickers — curated palette only to protect brand continuity

## When Contact List Reaches 500+
- [ ] Add Email 4c (content discoverer variant) to welcome sequence If/Else
  - Branch on `source:lead-magnet` OR `source:youtube`
- [ ] Build segmented fundraising email variants (content-first, community-first, upgrade, lapsed)
- [ ] Review welcome sequence open/click rates and optimize

## When Lead Magnet Landing Page Is Built
- [ ] Create `source:lead-magnet` tag
- [ ] Host reading list PDF and update `%%READING_LIST_URL%%` in Email 1 and Email 2
- [ ] Build dedicated capture page that tags `source:lead-magnet` on subscribe

## Email Template Maintenance
- [ ] When site goes live on gregorythegreat.ca: find/replace all image URLs in AC templates
  - Find: `https://evanr-web.github.io/ggi-website/`
  - Replace: `https://gregorythegreat.ca/`
- [ ] Re-scan AC Brand Kit with `https://gregorythegreat.ca/`
- [ ] Fill Email 3 curated selection placeholders with real content
- [ ] Ryan reviews Email 2 (Founder's Story) biographical details for accuracy
