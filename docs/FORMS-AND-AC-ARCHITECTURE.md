# GGI Forms & ActiveCampaign Architecture

## Complete Form Audit

### Currently Working (4 endpoints built)

| Form | Page | Endpoint | AC List | AC Tags |
|------|------|----------|---------|---------|
| Contact | `/contact/` | `/api/contact` | — | By subject (general, speaker, magnalia, programs, support, volunteering) |
| Magnalia Letter | `/magnalia/letter/` | `/api/subscribe` | List 4 | Tag 1 |
| Ambassador | `/support/ambassadors/` | `/api/ambassador` | List 5 | Tag 2 |
| Career | `/careers/` | `/api/career` | — | — |

### Partially Working

| Form | Page | Issue |
|------|------|-------|
| Book Study | `/programs/book-studies/#join-form` | Reuses `/api/subscribe` — dumps Book Study signups into the Magnalia Letter list. **Wrong.** Needs its own endpoint. |
| Footer newsletter | Every page | `action="#"` — **not wired at all**. Dead form. |

### Missing — Currently Punting to `/contact/`

| What | Page | CTA Text | Currently Links To |
|------|------|----------|--------------------|
| Friend donation ($15+/mo) | `/support/friend/` | "Become a Friend" | `/support/donate/` → `/contact/` |
| General donation | `/support/donate/` | "Contact Us to Give" | `/contact/` |
| Leadership Circle ($5K+/yr) | `/support/leadership/` | "Request a Conversation" | `/contact/` |
| Magnalia Single Issue ($45) | `/magnalia/subscribe/` | "Order a Copy" | `/contact/` |
| Magnalia Annual ($80/yr) | `/magnalia/subscribe/` | "Subscribe" | `/contact/` |
| Magnalia Patron ($600/yr) | `/magnalia/patron/` | "Become a Patron" | `/contact/` |
| Music Camp registration | `/events/music-camp-2026/` | "Register Your Child" | `/contact/` |
| Conference 2026 interest | `/events/conference-2026/` | "Get Notified" | `/contact/` |
| Finances 101 registration | `/events/finances-101/` | "Register" | `/contact/` |

---

## Solution by Category

### Category 1: Payment Forms → Zeffy
These involve money. Each gets its own Zeffy checkout page, linked from the site:
- **Friend donation** ($15+/mo)
- **General donation** (any amount)
- **Magnalia Single Issue** ($45)
- **Magnalia Annual Subscription** ($80/yr)
- **Magnalia Patron** ($600/yr)
- **Music Camp registration** (if there's a fee)
- **Finances 101** (if there's a fee)

Zeffy webhook pushes payment data to AC via `/api/zeffy-webhook` Cloudflare Worker.

### Category 2: Interest/Registration Forms → New AC Endpoints
No payment, but need contact capture and segmentation:
- **Book Study signup** → `/api/book-study` (own endpoint, not reusing subscribe)
- **Leadership Circle inquiry** → `/api/leadership` (request a conversation form)
- **Conference 2026 "Get Notified"** → `/api/event-interest` (name + email + event name)
- **Event registration (free events)** → `/api/event-interest` with event param

### Category 3: Already Built — Just Needs Wiring
- **Footer newsletter** → same `/api/subscribe` endpoint, just wire `data-ac-endpoint` attribute (5-second fix)

---

## ActiveCampaign Architecture

### Lists
*AC IDs confirmed 2026-06-12. IDs marked ⬜ need manual creation in AC dashboard.*

| AC ID | List | Who Goes Here | Status |
|-------|------|---------------|--------|
| 3 | Master Contact List | Everyone (all contacts added here as baseline) | ✅ |
| 4 | Magnalia Letter | Free newsletter subscribers | ✅ |
| 5 | Ambassador Applications | Ambassador applicants | ✅ |
| 6 | Event Attendees | Event registrants / interest | ✅ |
| 7 | General Contact | Contact form submissions | ✅ |
| 8 | Career Applications | Job applicants | ✅ |
| 10 | Donors | Anyone who's given money (via Zeffy webhook) | ✅ |
| 11 | Magnalia Journal | Paid journal subscribers (via Zeffy webhook) | ✅ |
| 9 | Book Study | Inklings Club interest | ✅ |

### Tags
*AC IDs confirmed 2026-06-12.*

**Original tags (created Apr 26):**
| AC ID | Tag | Used In |
|-------|-----|---------|
| 1 | magnalia-letter | subscribe.js |
| 2 | ambassador | ambassador.js |
| 3 | contact-general | contact.js |
| 4 | contact-speaker-booking | contact.js |
| 5 | contact-magnalia | contact.js |
| 6 | contact-programs | contact.js |
| 7 | contact-support | contact.js |
| 8 | friend | (Zeffy webhook) |
| 9 | patron | (Zeffy webhook) |
| 10 | leadership | (Zeffy webhook) |
| 11 | event-conference-2026 | event-interest.js |
| 12 | event-music-camp-2026 | event-interest.js |
| 13 | event-finances-101 | event-interest.js |
| 14 | book-study | book-study.js |
| 15 | magnalia-subscriber | (Zeffy webhook) |
| 16 | honor-memorial-gift | (Zeffy webhook) |
| 17 | career-applicant | career.js |
| 18 | contact-volunteering | contact.js |

**New tags (created Jun 12):**
| AC ID | Tag | Used In |
|-------|-----|---------|
| 19 | source:website-form | event-interest.js, leadership.js |
| 20 | source:zeffy | (Zeffy webhook) |
| 21 | source:event | (future) |
| 22 | giving:one-time | (Zeffy webhook) |
| 23 | interest:masterclass | event-interest.js |
| 24 | interest:magnalia-journal | (Zeffy webhook) |
| 25 | interest:speaker-booking | (future) |
| 26 | interest:volunteering | (future) |
| 27 | leadership:inquiry | leadership.js |
| 28 | ambassador:applied | (future — upgrade ambassador.js) |
| 29 | book-study:join | book-study.js |
| 30 | book-study:waitlist | book-study.js |
| 31 | book-study:host | book-study.js |

### Segments (built from tag combinations)
- **Hot prospects:** `interest:conference` + no giving tag → engaged but haven't donated
- **Upgrade candidates:** `giving:friend` + `interest:magnalia-journal` → give $15/mo, interested in journal — pitch Patron
- **Event promo:** `interest:conference` OR `interest:book-study` → announce new events
- **Major donor cultivation:** `giving:leadership` OR `leadership:inquiry` → white-glove communication
- **Magnalia audience:** `interest:magnalia-letter` OR `interest:magnalia-journal` → all Magnalia content

---

## Zeffy → ActiveCampaign Webhook

**Architecture:** Zeffy webhook → Cloudflare Worker (`/api/zeffy-webhook`) → ActiveCampaign API

**What it does:**
1. Receives POST from Zeffy on payment events (donation, membership, renewal, etc.)
2. Verifies webhook signature
3. Parses event — extracts email, name, amount, type
4. Creates/updates contact in AC
5. Adds to correct list + applies giving tier tag + source tag

**Environment variables needed:**
- `AC_API_URL` — ActiveCampaign API base URL
- `AC_API_KEY` — ActiveCampaign API key
- `ZEFFY_WEBHOOK_SECRET` — for signature verification

**Deduplication:** If someone donates AND subscribes to Magnalia, they should be one contact with both tags, not two contacts. AC's `contact/sync` endpoint handles this — it matches on email.

---

## Build Order

### Before Go-Live (This Weekend)
1. Wire the footer newsletter form to `/api/subscribe`
2. Fix Book Study form — new `/api/book-study` endpoint + own list/tags
3. Create Zeffy checkout pages and swap placeholder links on site
4. Build `/api/event-interest` endpoint
5. Build `/api/leadership` endpoint (inquiry form)
6. Set up AC lists and tags to match architecture above

### Post-Launch (Next Week)
7. Build `/api/zeffy-webhook` Cloudflare Worker
8. Wire Zeffy → AC for giving tier tags
9. Build AC automations (welcome series, upgrade nudges, etc.)
