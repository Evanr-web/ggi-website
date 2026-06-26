# GGI ActiveCampaign Brand Kit — Setup Guide

## Quick Setup (Auto-Import)

1. Go to **Settings → Brand Kit** in ActiveCampaign
2. Enter URL: `https://gregorythegreat.ca`
3. AC will scan and pull colors, fonts, and logo automatically
4. **Review and correct** using the values below (auto-import often misses secondary colors)

---

## Manual Brand Kit Values

### Colors

| Role | Hex | Name | Where It's Used |
|------|-----|------|----------------|
| Primary | `#0e3352` | Navy | Headers, headings, footer backgrounds |
| Secondary | `#b89a47` | Gold | Accents, links, labels, dividers |
| Accent | `#84292d` | Crimson | CTA buttons, drop caps |
| Background | `#f4f1eb` | Warm Grey | Email body background |
| Card Background | `#f8ebd9` | Parchment | Feature cards, callout boxes |
| Body Text | `#555555` | Dark Grey | Paragraph text |
| Heading Text | `#0e3352` | Navy | Same as primary |
| White | `#ffffff` | White | Email container background |

Enter these in **Brand Kit → Colors**:
- Primary: `#0e3352`
- Secondary: `#b89a47`
- Accent 1: `#84292d`
- Accent 2: `#f8ebd9`
- Background: `#f4f1eb`

### Logo

**Primary logo (seal):**
- URL: `https://gregorythegreat.ca/images/branding/ggi-seal.png`
- Use: Email headers, 48-64px circle with 50% border-radius
- Background: works on both navy and white backgrounds

Upload the seal image in **Brand Kit → Logo**.

### Fonts

ActiveCampaign supports web-safe fonts only in emails. Map as follows:

| Role | Font | AC Equivalent |
|------|------|---------------|
| Display / Headings | Georgia | **Georgia** |
| Body Text | Georgia | **Georgia** |
| UI / Labels | Arial | **Arial** |

In **Brand Kit → Fonts**:
- Heading font: **Georgia**
- Body font: **Georgia**

### Social Links

| Platform | URL |
|----------|-----|
| Website | https://gregorythegreat.ca |

*(Add others as they're established)*

### Sender Identities

| Name | Email | Use |
|------|-------|-----|
| Dr. Ryan Topping | info@gregorythegreat.ca | Welcome series, personal emails |
| Gregory the Great Institute | info@gregorythegreat.ca | Transactional, event confirmations |
| Victor Carpay | vcarpay@gregorythegreat.ca | Ambassador comms |
| Magnalia Team | magnalia@gregorythegreat.ca | Newsletter-specific |

### Footer

All emails use this footer format:

```
Fides • Ratio • Cultura
Gregory the Great Institute • Edmonton, Alberta, Canada
[Unsubscribe] • [gregorythegreat.ca]
```

- Footer background: `#0e3352` (Navy)
- Motto text: `#b89a47` (Gold), Georgia italic, 13px
- Address: rgba(245,239,229,0.5), Arial 12px
- Links: rgba(245,239,229,0.5), underlined

---

## Importing the Master Template

1. In AC, go to **Campaigns → Manage Templates → Import**
2. Choose **"Import from HTML"** or **"Custom HTML"**
3. Paste the contents of `master-template.html` from this folder
4. Save as "GGI Master Template"
5. For each email in the welcome series, duplicate this template and replace content

Alternatively, for the welcome series emails:
1. Create the automation (see `ACTIVECAMPAIGN-SETUP.md`)
2. For each email step, choose **Custom HTML**
3. Paste the HTML from the corresponding file in `docs/welcome-series/`

---

## Domain Verification (Required Before Sending)

Before any emails send from `@gregorythegreat.ca`:

1. **Settings → Advanced → Email Authentication**
2. Add domain: `gregorythegreat.ca`
3. AC gives you 3 DNS records to add to Cloudflare:
   - **SPF** (TXT record)
   - **DKIM** (CNAME record)  
   - **DMARC** (TXT record)
4. Add them in **Cloudflare → DNS → Add Record**
5. Wait for verification (usually <1 hour)

Until verified, use Evan's personal email for testing.
