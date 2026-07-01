# Reading List Lead Magnet — ActiveCampaign Automation Setup

## What's Already Done
- ✅ Landing page: `/resources/roadmap/`
- ✅ Thank-you page: `/resources/roadmap/thank-you/`
- ✅ API endpoint: `/api/reading-guide` (Turnstile + honeypot + newsletter list)
- ✅ AC tag created: `reading-guide` (ID: 33)
- ✅ PDF hosted: `/downloads/roadmap-reading-guide.pdf` (unlisted, not linked from nav)

## Automation Setup (ActiveCampaign UI — ~5 minutes)

### Step 1: Create the Automation

1. Go to **Automations → Create an Automation → Start from Scratch**
2. **Trigger:** "Tag is added" → select `reading-guide`
3. Set to run **Once** (so repeat visitors don't get the email again)

### Step 2: Add the Email Action

1. Add action: **Send an Email**
2. **Subject:** "Your Reading List: The Roadmap to Renewal"
3. **From:** Gregory the Great Institute (use your standard sender)
4. **Email body** (suggested copy below):

---

**Email Copy:**

> **Subject:** Your Reading List: The Roadmap to Renewal
>
> Hi %FIRSTNAME%,
>
> Thank you for your interest in the Gregory the Great Institute's mission of cultural renewal.
>
> Here is your free copy of **The Roadmap to Renewal: 6 Models of Cultural Restoration** — a curated reading list based on Dr. Ryan Topping's framework.
>
> **[Download Your Reading List →](https://gregorythegreat.ca/downloads/roadmap-reading-guide.pdf)**
>
> Inside you'll find 18 carefully selected titles spanning philosophy, theology, social thought, and spiritual formation — each paired with one of the six models of cultural restoration.
>
> **Want to go deeper?** Our guided [book studies](https://gregorythegreat.ca/programs/book-studies/) bring these texts to life through discussion, reflection, and community.
>
> In Christ,
> The Gregory the Great Institute
>
> ---
> *gregorythegreat.ca*

---

### Step 3: Activate

1. Review the automation flow
2. Set to **Active**
3. Test by submitting the form yourself at `/resources/roadmap/`

## Flow Summary

```
YouTube CTA → /resources/roadmap/ → form submit
  → /api/reading-guide (Cloudflare Function)
    → AC: create/update contact
    → AC: add to newsletter list (4)
    → AC: add tag "reading-guide" (33)
  → redirect to /resources/roadmap/thank-you/
  → AC automation triggers on tag → sends PDF email
```

## Notes
- The PDF is at an unlisted URL — not in nav, not in sitemap, `noindex` on the landing page
- Contact also joins the newsletter list, so they'll get regular updates too
- UTM params from YouTube links are captured (utm_source, utm_medium, utm_campaign)
- Example YouTube description CTA: `Get the free reading list: https://gregorythegreat.ca/resources/roadmap/?utm_source=youtube&utm_medium=video&utm_campaign=6-models`
