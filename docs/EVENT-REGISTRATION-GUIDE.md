# Event Registration Guide
**For: Catherine, Ryan, Victor**

---

## Quick Reference: Which Tool Do I Use?

| Situation | Use | Example |
|-----------|-----|---------|
| Free event (no payment) | Website form → ActiveCampaign | Book Study signup, webinar RSVP |
| Paid event (needs payment) | Zeffy form → auto-syncs to AC | Conference registration, camp signup |
| Email registrants | ActiveCampaign | "Here's the schedule for Saturday" |
| Check who paid | Zeffy dashboard | Payment status, refunds, receipts |
| Export attendee list | ActiveCampaign (contacts) or Zeffy (payments) | Print name badges, share with venue |

**Golden Rule:** ActiveCampaign is your single source of truth for *people*. Zeffy is your source of truth for *money*. Everyone ends up in AC automatically.

---

## Scenario 1: Paid Event Registration (Conference, Camp)

### Step 1: Create the Event in Zeffy
1. Log in to [Zeffy](https://www.zeffy.com)
2. Click **Create** → **Event**
3. Fill in event details (title, date, location, description)
4. Set up **ticket types** (e.g., Early Bird $60, Standard $80, Student $40)
5. Set capacity limits if needed
6. **Publish** the event

### Step 2: Get the Embed Link
1. In Zeffy, go to your event → **Share**
2. Copy the **embed URL** (looks like `https://www.zeffy.com/embed/ticketing/your-event-name`)
3. Send this URL to Evan or Victor to update the event page on the website

### Step 3: Registrations Come In
When someone registers and pays through Zeffy:
- ✅ Zeffy processes the payment and sends a receipt
- ✅ The registrant is **automatically added to ActiveCampaign** (via webhook)
- ✅ They're tagged with the event name (e.g., `conference-2026-registered`)
- ✅ They're added to the "Event Attendees" list

**You don't need to do anything manually.** The sync is automatic.

### Step 4: Email Your Registrants
1. Log in to [ActiveCampaign](https://gregorythegreat.activehosted.com)
2. Go to **Campaigns** → **Create Campaign**
3. Choose **Standard Campaign**
4. Under **List**, select "Event Attendees"
5. Add a **Segment**: Tag is `event-conference-2026` (or the relevant event tag)
6. Write your email (schedule, parking info, what to bring, etc.)
7. **Send** or **Schedule**

### Step 5: Export the Attendee List
**From ActiveCampaign (contact details):**
1. Go to **Contacts**
2. Filter by Tag: `conference-2026-registered`
3. Click **Export** → CSV
4. You get: names, emails, signup dates

**From Zeffy (payment details):**
1. Go to your event in Zeffy
2. Click **Registrations** or **Orders**
3. Click **Export** → CSV/Excel
4. You get: names, emails, ticket types, amounts paid, payment status

---

## Scenario 2: Free Event Registration (Book Study, Webinar, Prayer Breakfast)

### Step 1: Create the Event Page
1. In [Sanity Studio](https://gregorythegreat.sanity.studio), go to **Events**
2. Click **+** to create a new event (or **Duplicate** an existing one from the ▾ menu next to Publish)
3. Fill in the details: title, date, location, description
4. Set **CTA Status** to "active" and add the registration button text
5. **Publish**

The website automatically rebuilds with the new event (~1-2 minutes).

### Step 2: Registrations Come In
When someone fills out the registration form on the website:
- ✅ They're added to ActiveCampaign automatically
- ✅ Tagged with the event name
- ✅ Added to the "Event Attendees" list
- No payment involved — no Zeffy needed

### Step 3: Email & Export
Same as Steps 4-5 above, but export from ActiveCampaign only (no Zeffy payment data).

---

## How to Email a Specific Group

### All conference registrants:
- List: Event Attendees → Tag: `event-conference-2026`

### All book study participants:
- List: Book Study → Tag: `book-study`

### All newsletter subscribers:
- List: Magnalia Letter

### Everyone who's ever interacted with GGI:
- All contacts (no filter)

---

## How Tags Work

Tags are labels attached to contacts. They tell you *how* someone is connected to GGI.

| Tag | Meaning |
|-----|---------|
| `magnalia-letter` | Subscribed to the monthly newsletter |
| `event-conference-2026` | Interested in or registered for the 2026 conference |
| `conference-2026-registered` | Confirmed registered (paid via Zeffy) |
| `book-study` | Signed up for a book study |
| `ambassador` | Applied to be an ambassador |
| `source:website-form` | Came through the website (vs manually added) |

---

## Common Questions

**Q: Someone registered in Zeffy but I don't see them in ActiveCampaign?**
A: The sync usually takes a few seconds. If it's been more than 5 minutes, check:
1. Did the payment succeed in Zeffy? (failed payments don't sync)
2. Contact Evan — the webhook may need attention

**Q: Can I add someone to AC manually?**
A: Yes! Go to Contacts → Add Contact → fill in their info → add to the right list and tags.

**Q: Someone wants a refund — do I need to update AC?**
A: No. Process the refund in Zeffy. Their AC contact stays (they're still a known person). You can add a tag like `refunded` if you want to track it.

**Q: How do I know if someone is a *paid* registrant vs just *interested*?**
A: Check their tags:
- `event-conference-2026` = expressed interest (website form)
- `conference-2026-registered` = paid and registered (Zeffy)

**Q: Can I send different emails to paid vs interested people?**
A: Absolutely. Create a segment with the specific tag. Paid people get logistics emails. Interested people get "last chance to register" emails.

---

## Setup Checklist (for Evan)

- [ ] Add `ZEFFY_WEBHOOK_SECRET` to Cloudflare Pages env vars
- [ ] In Zeffy: Settings → Integrations → Add webhook URL: `https://gregorythegreat.ca/api/zeffy-webhook/`
- [ ] In Zeffy: Copy the webhook secret and save as `ZEFFY_WEBHOOK_SECRET` in Cloudflare
- [ ] Test with a $0 test transaction
- [ ] Verify contact appears in AC with correct tags
- [ ] Update campaign tag mapping in `src/pages/api/zeffy-webhook.js` as new events are created
