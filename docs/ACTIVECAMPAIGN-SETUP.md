# ActiveCampaign Setup Guide

**Already done via API:** Lists (4), Tags (16), website form endpoints (3 Cloudflare Functions), client-side form handler.

**What you need to build in the AC dashboard:** Automations (4) and their email content.

---

## Step 1: Verify Sender Domain

Before sending any emails:
1. Go to **Settings → Advanced → I want to manage my own email authentication**
2. Add `gregorythegreat.ca` as a verified domain
3. AC will give you DNS records (SPF, DKIM, DMARC) to add to Cloudflare
4. Once verified, set your sender as `info@gregorythegreat.ca` or `magnalia@gregorythegreat.ca`

**Until the domain is verified, use your personal email as sender for testing.**

---

## Step 2: Automation 1 — Magnalia Letter Welcome Sequence

**Trigger:** Contact subscribes to list "Magnalia Letter"

### Email 1: Immediate — Welcome

**Subject:** Welcome to the Magnalia Letter
**From:** Dr. Ryan Topping <info@gregorythegreat.ca>

```
Dear [FIRST_NAME],

Thank you for subscribing to the Magnalia Letter.

Each month, I'll send you a curated selection of the best essays, books, articles, art, and ideas oriented toward faith, reason, and culture. This is not a newsletter about our organization. It's a guide to the Catholic intellectual life — assembled by people whose taste and judgment I hope you'll come to trust.

Here's what to expect:

• A monthly essay from one of Canada's leading Catholic thinkers
• Book and reading recommendations for serious formation
• Art, music, and cultural commentary — because beauty is not optional
• Early invitations to our conferences, book studies, and courses

If you'd like to know more about the Gregory the Great Institute and the work we're doing to renew Catholic culture in Canada, start here:

→ About the Institute: https://gregorythegreat.ca/about/
→ Our Programs: https://gregorythegreat.ca/programs/
→ Magnalia Journal: https://gregorythegreat.ca/magnalia/

I'm glad you're here.

In Christ,
Dr. Ryan N.S. Topping
Executive Director
Gregory the Great Institute
```

---

### Email 2: Day 3 — The Vision

**Subject:** Why we started the Gregory the Great Institute
**From:** Dr. Ryan Topping <info@gregorythegreat.ca>

```
Dear [FIRST_NAME],

Three years ago, I looked around and saw something troubling: Catholic intellectual life in Canada was in retreat. The institutions that once formed leaders, shaped discourse, and transmitted the tradition had weakened or disappeared. Seminaries were half-empty. Catholic publications had folded. The intellectual confidence that once characterized the Church in this country had quietly evaporated.

So a small group of us decided to build something new.

The Gregory the Great Institute exists to do three things:

1. Form leaders through courses, seminars, and the Great Books
2. Publish research and scholarship that equips Catholics to engage the culture
3. Build community among believers who refuse to accept decline as inevitable

In our first year, we published Magnalia and placed it in the hands of every bishop and seminary rector in Canada. We ran formation programs in four provinces. We hosted our inaugural conference. And we built a community of over 1,500 people who believe — as I do — that the best days of Catholic culture in Canada are still ahead.

I share this not to boast, but so you know: when you read the Magnalia Letter each month, it comes from people who are actually building something. Not talking about renewal — doing it.

Your first Letter arrives next month. In the meantime, I'd recommend this essay from our library:

→ [LINK TO A FEATURED LIBRARY ARTICLE]

Yours in the Great Tradition,
Ryan
```

---

### Email 3: Day 7 — Magnalia Journal Introduction

**Subject:** Have you seen Magnalia?
**From:** Gregory the Great Institute <info@gregorythegreat.ca>

```
Dear [FIRST_NAME],

The Magnalia Letter is free — and always will be.

But the Letter is just one part of something larger. Twice a year, we publish Magnalia — a 60-page print journal of the best Catholic writing in Canada. Original essays, letters from the field, interviews, reviews, and art from leading thinkers across the country.

Issue One was sent to every Catholic bishop and seminary rector in Canada. Subscribers tell us it's unlike anything else being published in the Canadian Church today.

A few things you can do:

→ Subscribe to the print journal ($80/year): https://gregorythegreat.ca/magnalia/subscribe/
→ Read about Issue One: https://gregorythegreat.ca/magnalia/issue-one/
→ See our contributors: https://gregorythegreat.ca/magnalia/contributors/

Not ready to subscribe? No worries — the monthly Letter will keep arriving. But if you ever want to go deeper, Magnalia is the way.

Warm regards,
The Magnalia Team
Gregory the Great Institute
```

---

### Email 4: Day 14 — Programs & Community

**Subject:** More than a newsletter
**From:** Dr. Ryan Topping <info@gregorythegreat.ca>

```
Dear [FIRST_NAME],

I wanted to make sure you know about the other ways to engage with the Institute — beyond the Letter.

BOOK STUDIES (Free)
Our Inklings Clubs are free small-group reading groups running across Canada. Study guides, webinars, and community. 2026 reads include Josef Pieper, George Orwell, and Fr. Jacques Philippe.
→ Join a Book Study: https://gregorythegreat.ca/programs/book-studies/

RENEWING CULTURE CONFERENCE
Our flagship annual gathering. This October: "Bringing Back Sunday" — reflections on Pieper's Leisure: The Basis of Culture. Mt Carmel Spirituality Centre, October 2-3, 2026.
→ Learn more: https://gregorythegreat.ca/events/conference-2026/

MASTERCLASSES
Short courses on Aquinas, Virtuous Leadership, Christian Beauty, and Classical Education. Online and in-person.
→ Browse courses: https://gregorythegreat.ca/programs/masterclasses/

The whole point of the Institute is that Catholic intellectual life shouldn't be a solitary pursuit. If any of these resonate, come join us.

In Christ,
Ryan
```

---

### Email 5: Day 21 — Soft Ask

**Subject:** Can I ask you something?
**From:** Dr. Ryan Topping <info@gregorythegreat.ca>

```
Dear [FIRST_NAME],

You've been receiving the Magnalia Letter for a few weeks now. I hope it's been valuable.

I want to be honest with you: the Institute runs almost entirely on the generosity of people who believe this work matters. We don't receive government funding. We don't have a large endowment. Everything we publish, every program we run, every event we host — it's made possible by a growing community of Friends and Patrons.

If the Institute's vision resonates with you, here are two ways to support it:

BECOME A FRIEND ($15+/month)
Monthly prayer inclusion, digital Magnalia, early event access, and named recognition. The foundation of our community.
→ https://gregorythegreat.ca/support/friend/

BECOME A PATRON ($50+/month)
Print Magnalia subscription, annual gathering with me, named recognition in the journal, and a signed book. The backbone of the Institute.
→ https://gregorythegreat.ca/magnalia/patron/

And if giving isn't right for you right now, there's something else that helps enormously: forward this email to one person who might care about Catholic intellectual life in Canada. Word of mouth is how we've grown from zero to 1,500 — and every introduction matters.

Thank you for being here.

Gratefully,
Ryan

P.S. If you'd like to know more about what your support builds, our Impact Report tells the full story: https://gregorythegreat.ca/about/impact/
```

---

## Step 3: Automation 2 — Ambassador Application Notification

**Trigger:** Contact is added to list "Ambassador Applications"

### Email 1: Immediate — To Victor

**This is an internal notification, not sent to the contact.**

Set up as: **Send a notification email**
**To:** vcarpay@gregorythegreat.ca
**Subject:** New Ambassador Application — [FIRST_NAME] [LAST_NAME]

```
A new Ambassador application has been submitted.

Name: [FIRST_NAME] [LAST_NAME]
Email: [EMAIL]

Log in to ActiveCampaign to view their full profile and follow up:
https://evanropp.activehosted.com/app/contacts

Note: City, province, and application details are captured in the contact record.
```

### Email 2: Immediate — To the applicant

**Subject:** We received your Ambassador application
**From:** Victor Carpay <vcarpay@gregorythegreat.ca>

```
Dear [FIRST_NAME],

Thank you for applying to become a Gregory the Great Institute Ambassador. We're excited that you want to bring Catholic cultural renewal to your community.

Here's what happens next:

1. I'll review your application within the next few days
2. I'll reach out to schedule a 20-minute call
3. We'll discuss how the program fits your context and get you set up

In the meantime, if you have any questions, just reply to this email.

Looking forward to connecting,
Victor Carpay
Communications & Development
Gregory the Great Institute
```

---

## Step 4: Automation 3 — Contact Form Notification

**Trigger:** Contact is added to list "General Contact"

### Email 1: Immediate — To Victor

**Send a notification email**
**To:** vcarpay@gregorythegreat.ca
**Subject:** New website inquiry — [SUBJECT_TAG]

```
A new contact form submission has been received.

Name: [FIRST_NAME] [LAST_NAME]
Email: [EMAIL]
Tags: [TAGS]

Log in to ActiveCampaign to view details and respond:
https://evanropp.activehosted.com/app/contacts
```

### Email 2: Immediate — Auto-reply to contact

**Subject:** We received your message
**From:** Gregory the Great Institute <info@gregorythegreat.ca>

```
Dear [FIRST_NAME],

Thank you for reaching out to the Gregory the Great Institute. We've received your message and will respond within 2 business days.

If your inquiry is urgent, you can reach us directly:

General: info@gregorythegreat.ca
Dr. Ryan Topping: rtopping@gregorythegreat.ca
Programs: crenneberg@gregorythegreat.ca

Warm regards,
The Gregory the Great Institute
```

---

## Step 5: Automation 4 — Event Registration Confirmation

**Trigger:** Tag is added — any tag starting with "event-"

*(Build this when event registration goes live. For now, the tag is applied but no email fires.)*

---

## How to Build Each Automation

1. Go to **Automations → Create an Automation → Start from Scratch**
2. Set the trigger (list subscribe or tag added)
3. Add action: **Send an Email**
4. Paste the subject and body from above
5. Set the wait times between emails (Day 3, Day 7, etc.)
6. Toggle the automation **Active**

For the welcome sequence, the flow looks like:

```
[Subscribe to Magnalia Letter]
  → Send Email 1 (Welcome) — immediately
  → Wait 3 days
  → Send Email 2 (Vision)
  → Wait 4 days
  → Send Email 3 (Magnalia Journal)
  → Wait 7 days
  → Send Email 4 (Programs)
  → Wait 7 days
  → Send Email 5 (Soft Ask)
  → End
```

---

## Environment Variables for Cloudflare Pages

When deploying, add these in **Cloudflare Pages → Settings → Environment Variables**:

```
AC_API_URL = https://evanropp.api-us1.com
AC_API_KEY = [your API key — do not commit to code]
```

---

## Testing

1. Deploy to Cloudflare Pages
2. Submit the Magnalia Letter form on the live site
3. Check ActiveCampaign — contact should appear in the Magnalia Letter list with the magnalia-letter tag
4. The welcome sequence should trigger automatically
5. Test the contact form and ambassador form the same way

**Important:** Until the sender domain is verified, emails may land in spam. Verify the domain first.
