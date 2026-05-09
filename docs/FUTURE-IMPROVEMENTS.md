# GGI Future Improvements

## When Zeffy/Stripe Is Connected
- [ ] Create `donor:active` tag in AC — apply automatically when someone donates
- [ ] Create `subscriber:magnalia` tag in AC — apply when someone subscribes to print journal
- [ ] Add If/Else before Email 5 (The Invitation) in welcome sequence:
  - If `donor:active` OR `subscriber:magnalia` → skip or send alternate version
  - Else → send Email 5 as-is
- [ ] Wire Zeffy webhooks to AC to auto-tag contacts on purchase

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
