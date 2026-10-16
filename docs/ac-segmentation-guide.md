# ActiveCampaign Segmentation Guide — Fundraising & Communications

**For Victor Carpay, Communications**
Gregory the Great Institute
Last updated: August 2026

---

## Table of Contents

1. [How the System Works](#1-how-the-system-works)
2. [Your Three Email Lists](#2-your-three-email-lists)
3. [Understanding Tags](#3-understanding-tags)
4. [Understanding Custom Fields](#4-understanding-custom-fields)
5. [Donor Tiers Explained](#5-donor-tiers-explained)
6. [Building Segments](#6-building-segments)
7. [Fundraising Playbook — Ready-Made Segments](#7-fundraising-playbook--ready-made-segments)
8. [Sending a Campaign to a Segment](#8-sending-a-campaign-to-a-segment)
9. [Tips & Guardrails](#9-tips--guardrails)
10. [Quick Reference — Tag & Field Cheat Sheet](#10-quick-reference--tag--field-cheat-sheet)

---

## 1. How the System Works

Every person in ActiveCampaign has three layers of data you can filter on:

| Layer | What it is | Example |
|-------|-----------|---------|
| **Lists** | Which email streams they opted into | Newsletter, Events, Partners in Renewal |
| **Tags** | Labels describing how they found us, what they're interested in, and what role they play | `source:zeffy`, `interest:book-study`, `role:ambassador` |
| **Custom Fields** | Structured data attached to each contact | Donor Tier = "Patron", Lifetime Giving = $2,400 |

**Lists** control *who can receive email* (consent). **Tags** and **Fields** control *who should receive which email* (targeting).

A **Segment** is a saved filter that combines these layers. You don't create a new list for every campaign — you build a segment.

---

## 2. Your Three Email Lists

| List | Who's on it | Use it for |
|------|------------|------------|
| **Newsletter (Magnalia Letter)** | Everyone who signed up via the website, contact form, or reading guide download. Your broadest audience. | Monthly Magnalia letter, general announcements, soft fundraising CTAs |
| **Institute Events** | People who registered for events or signed up for book studies. | Event invitations, program announcements, post-event follow-ups |
| **Partners in Renewal** | Anyone who has ever made a donation through Zeffy. Added automatically by the webhook. | Fundraising appeals, impact reports, stewardship updates, tax receipt reminders |

**Key rule:** A person can be on multiple lists. A monthly donor who also subscribes to the newsletter is on both *Newsletter* and *Partners in Renewal*. When you build a segment, you choose which list(s) to draw from.

---

## 3. Understanding Tags

Tags use a `category:value` naming convention. Here are the categories:

### Source Tags — *How did they find us?*
| Tag | Meaning |
|-----|---------|
| `source:website` | Signed up through a website form |
| `source:zeffy` | Came in through a Zeffy donation |
| `source:event` | Registered at a live event |
| `source:reading-guide` | Downloaded the reading guide |

### Donor Tags — *What kind of giver are they?*
| Tag | Meaning |
|-----|---------|
| `donor:monthly` | Active recurring donor |
| `donor:one-time` | Made a one-time gift |
| `donor:prospect` | Engaged but hasn't donated yet |
| `donor:lapsed` | Previously gave, but no gift in 12+ months |
| `donor:honor-memorial` | Made an honour/memorial gift |

### Interest Tags — *What are they interested in?*
| Tag | Meaning |
|-----|---------|
| `interest:book-study` | Signed up for or asked about book studies |
| `interest:events` | General event interest |
| `interest:masterclass` | Interested in masterclass series |
| `interest:magnalia-journal` | Interested in the print journal |
| `interest:speaker-booking` | Inquired about booking a speaker |
| `interest:volunteering` | Expressed interest in volunteering |
| `interest:programs` | General programs interest |
| `interest:courses` | Interest in courses |
| `interest:think-tank` | Interest in think-tank programming |

### Role Tags — *What role do they play?*
| Tag | Meaning |
|-----|---------|
| `role:ambassador` | Confirmed ambassador |
| `role:ambassador-applicant` | Applied, not yet confirmed |
| `role:career-applicant` | Submitted a job application |
| `role:book-study-leader` | Hosts a book study group |
| `role:leadership-inquiry` | Expressed interest in major giving |
| `role:prayer-partner` | Prayer partner |

### Campaign Tags — *Event/campaign specific (created as needed)*
| Tag | Meaning |
|-----|---------|
| `campaign:conference-2026` | 2026 conference registrant |
| `campaign:music-camp-2026` | 2026 music camp registrant |
| `campaign:general-donation` | General (non-campaign) donation |

---

## 4. Understanding Custom Fields

These are the structured data fields on each contact. The ones most useful for fundraising:

| Field | What it contains | Example |
|-------|-----------------|---------|
| **Donor Tier** | Calculated tier based on trailing 12-month giving | "Patron" |
| **Trailing 12mo Giving** | Dollar amount given in the last 12 months | $750.00 |
| **Lifetime Giving** | Total amount given all-time | $2,400.00 |
| **Largest Single Gift** | Their biggest one-time donation | $500.00 |
| **First Gift Date** | When they first donated | 2024-03-15 |
| **Last Gift Date** | Their most recent donation | 2026-07-01 |
| **Donation Count** | Number of individual transactions | 12 |
| **City** | Contact's city | Calgary |
| **Province** | Contact's province | AB |
| **Consent Status** | Express / Implied / None | Express |

**These fields are updated automatically** every time a donation comes through Zeffy. You don't need to maintain them manually.

---

## 5. Donor Tiers Explained

Tiers are calculated from the **trailing 12-month giving total** (not lifetime). They update automatically with each donation.

| Tier | Annual Giving | Typical Profile |
|------|--------------|-----------------|
| **General Donor** | Under $180/yr | Small or first-time givers |
| **Friend** | $180 – $599/yr | Regular supporters (~$15+/mo) |
| **Patron** | $600 – $4,999/yr | Committed supporters (~$50+/mo) |
| **Leadership Partner** | $5,000 – $24,999/yr | Major donors |
| **Visionary Partner** | $25,000+/yr | Transformational partners |

---

## 6. Building Segments

In ActiveCampaign, go to **Contacts → Segments** (or build inline when creating a campaign).

### How Segment Conditions Work

You combine conditions with **AND** (all must be true) or **OR** (any can be true):

- **AND** narrows your audience: "On Partners list AND Donor Tier is Patron"
- **OR** broadens it: "Donor Tier is Patron OR Donor Tier is Leadership Partner"

### Step-by-Step: Create a Segment

1. Go to **Contacts** in the left sidebar
2. Click **"Advanced Search"** (or the filter icon)
3. Add your first condition (e.g., *Tag exists: donor:monthly*)
4. Click **"+ Add another condition"** for additional filters
5. Choose AND/OR between conditions
6. Once your results look right, click **"Save as Segment"**
7. Give it a clear name (e.g., "Monthly Donors — Active")

You can now select this segment when sending campaigns.

---

## 7. Fundraising Playbook — Ready-Made Segments

Here are the segments you'll use most often, with exact conditions to build them:

### Year-End Appeal — Broad

**Purpose:** Annual fundraising ask to everyone who has given or shown interest.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | List | is | Partners in Renewal |
| | **OR** | | |
| 2 | Tag | exists | donor:prospect |

**Who gets it:** All past donors + engaged non-donors flagged as prospects.

---

### Year-End Appeal — Major Donor Version

**Purpose:** Personalized, higher-touch version of the appeal for your best supporters.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | List | is | Partners in Renewal |
| | **AND** | | |
| 2 | Donor Tier | is | Leadership Partner |
| | **OR** | | |
| 3 | Donor Tier | is | Visionary Partner |

**Who gets it:** $5,000+/yr donors. These people should get a different letter — more personal, more vision-casting, possibly hand-signed.

---

### Lapsed Donors — Re-engagement

**Purpose:** Win back people who used to give but stopped.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | Tag | exists | donor:lapsed |
| | **AND** | | |
| 2 | Lifetime Giving | is greater than | 0 |

**Who gets it:** Anyone tagged as lapsed (no gift in 12+ months) who has given before. Tone: "We miss your partnership" — not guilt, gratitude.

---

### Monthly Donors — Stewardship

**Purpose:** Thank and retain your most reliable supporters.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | Tag | exists | donor:monthly |

**Who gets it:** All active recurring donors. Use for: impact updates, exclusive behind-the-scenes content, upgrade asks (e.g., "Could you add $10/month?").

---

### Upgrade Candidates — Friend → Patron

**Purpose:** Identify loyal mid-level supporters who might increase their giving.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | Donor Tier | is | Friend |
| | **AND** | | |
| 2 | Donation Count | is greater than | 3 |

**Who gets it:** Friends who've given 4+ times — they're committed. A gentle ask to increase could move them to Patron level.

---

### Engaged Non-Donors

**Purpose:** People who are clearly interested but haven't donated yet.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | List | is | Newsletter |
| | **AND** | | |
| 2 | Tag | does not exist | donor:one-time |
| | **AND** | | |
| 3 | Tag | does not exist | donor:monthly |
| | **AND** | | |
| 4 | Has opened/clicked | in the last | 90 days |

**Who gets it:** Newsletter subscribers who read your emails but have never given. These are warm leads. Soft ask with a compelling story.

---

### Event Attendees — Post-Event Follow-Up

**Purpose:** Thank people who attended a specific event and invite them deeper.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | Tag | exists | campaign:conference-2026 |

**Who gets it:** Everyone tagged for that specific event. Use for: thank-you emails, survey links, next event invitations, first-time donor asks.

---

### Local Supporters (by Province or City)

**Purpose:** Geographic targeting for regional events or in-person cultivation.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | Province | is | AB |
| | **AND** | | |
| 2 | List | is | Partners in Renewal |

**Who gets it:** Alberta-based donors. Useful for: in-person dinner invitations, regional event promotion, local volunteer recruitment.

---

### VIP / High-Touch List

**Purpose:** Your most important relationships — board members, major donors, key influencers.

| # | Condition | Operator | Value |
|---|-----------|----------|-------|
| 1 | Tag | exists | flag:vip |

**Who gets it:** Anyone you've manually tagged as VIP. Use sparingly — these are people who should hear from Ryan or the board chair directly, not from a mass email.

---

## 8. Sending a Campaign to a Segment

1. Go to **Campaigns → Create a Campaign**
2. Choose your campaign type (Standard is most common)
3. On the **"List"** step, select the relevant list (e.g., Partners in Renewal)
4. On the **"Segment"** step, choose your saved segment — or build conditions inline
5. Review the contact count — AC shows you exactly how many people match
6. Design your email, preview, and send

**Always preview the contact count.** If it looks way too high or too low, double-check your conditions before sending.

---

## 9. Tips & Guardrails

### Do
- **Save segments with clear names.** Future you will thank present you. Use format: `[Purpose] — [Audience]` (e.g., "Year-End Appeal — Major Donors")
- **Check contact count before sending.** If your "major donors" segment has 800 people, something is wrong.
- **Use the preview/test send feature.** Send yourself a test before blasting the full list.
- **Combine list + segment.** Always start with a list (consent boundary), then narrow with tags/fields.
- **Let the system handle tiers.** Don't manually set Donor Tier — the Zeffy webhook updates it automatically.

### Don't
- **Don't create new lists for every campaign.** Use tags and segments instead. Lists are consent boundaries, not targeting tools.
- **Don't email people on no list.** If someone isn't on Newsletter, Events, or Partners in Renewal, they haven't opted in to that stream. Use tags to add them to the right list first.
- **Don't manually tag donors.** The webhook handles `donor:monthly`, `donor:one-time`, tier calculations, and giving totals. Manual tags will get overwritten.
- **Don't delete contacts to "clean up."** If someone hasn't engaged, let the lapse detection handle it. Deleted contacts lose all history.
- **Don't send fundraising appeals to Newsletter-only subscribers.** They signed up for content, not asks. Use soft CTAs in the newsletter; save direct appeals for the Partners in Renewal list.

---

## 10. Quick Reference — Tag & Field Cheat Sheet

### Tags You'll Use Most for Fundraising

| What you want | Tag to filter on |
|---------------|-----------------|
| All recurring donors | `donor:monthly` |
| One-time donors | `donor:one-time` |
| Stopped giving | `donor:lapsed` |
| Interested but never gave | `donor:prospect` |
| Honour/memorial gifts | `donor:honor-memorial` |
| Leadership-level interest | `role:leadership-inquiry` |
| VIPs | `flag:vip` |

### Fields You'll Use Most for Fundraising

| What you want to filter | Field name | Example condition |
|------------------------|------------|-------------------|
| High-value donors | Donor Tier | is "Leadership Partner" |
| Recent donors | Last Gift Date | is after [date] |
| Lapsing donors | Last Gift Date | is before [12 months ago] |
| Donors who could upgrade | Trailing 12mo Giving | is between $180 and $599 |
| Long-time supporters | First Gift Date | is before [2 years ago] |
| Donors in a specific city | City | is "Calgary" |
| High capacity | Largest Single Gift | is greater than $1,000 |

---

*Questions? Ask Evan or email evanropp@gmail.com.*
