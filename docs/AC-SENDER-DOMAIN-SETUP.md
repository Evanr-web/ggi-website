# ActiveCampaign Sender Domain Setup

**Who does this:** Ryan or Victor (needs AC admin login + Cloudflare DNS access)
**Time:** ~15 minutes
**Why:** Without this, every email AC sends on behalf of gregorythegreat.ca will land in spam or get rejected. This is the #1 go-live blocker for email.

---

## Part 1: Get DNS Records from ActiveCampaign (~5 min)

1. Log in to ActiveCampaign: https://gregorythegreat.activehosted.com
2. Go to **Settings** (gear icon, bottom left)
3. Click **Advanced** in the left sidebar
4. Click **"I want to manage my own email authentication"**
5. Click **"Add a domain"**
6. Enter: `gregorythegreat.ca`
7. AC will show you **3 DNS records** to add:
   - A **DKIM** record (TXT type, looks like `dk1._domainkey.gregorythegreat.ca`)
   - A **DMARC** record (TXT type, `_dmarc.gregorythegreat.ca`) — AC may suggest one, or use the one below
   - An **SPF** update (TXT type on the root domain)

**⚠️ Copy all 3 records exactly.** Screenshot them or paste into a note before moving to Part 2.

---

## Part 2: Add DNS Records in Cloudflare (~10 min)

> **Note:** These DNS records go in Cloudflare, NOT in WHC. Once you swap nameservers to Cloudflare (which is a separate step), Cloudflare manages all DNS.
>
> If nameservers haven't been swapped yet, add these in WHC's DNS panel instead — they'll need to be re-added in Cloudflare after the swap.

1. Log in to Cloudflare: https://dash.cloudflare.com
2. Select the `gregorythegreat.ca` domain
3. Go to **DNS → Records**
4. For each record AC gave you:

### Record 1: DKIM
- Click **Add Record**
- **Type:** TXT
- **Name:** whatever AC specified (e.g. `dk1._domainkey`)
- **Content:** the long string AC provided
- **TTL:** Auto
- **Proxy:** DNS only (grey cloud) ← important: TXT records must NOT be proxied

### Record 2: SPF
- Look for an existing TXT record on `@` (root) that starts with `v=spf1`
- If one exists: **edit it** and add AC's `include:` directive before the `~all`
  - Example: `v=spf1 include:emsd1.com ~all`
- If none exists: **add a new TXT record**
  - **Name:** `@`
  - **Content:** `v=spf1 include:emsd1.com ~all`
  - **TTL:** Auto

### Record 3: DMARC
- Check if a TXT record for `_dmarc` already exists
- If not, add:
  - **Type:** TXT
  - **Name:** `_dmarc`
  - **Content:** `v=DMARC1; p=none; rua=mailto:info@gregorythegreat.ca`
  - **TTL:** Auto

> **Why `p=none`?** Start with `none` (monitoring only) so you can see who's sending email as your domain without accidentally blocking legitimate mail. After 30 days, review DMARC reports and tighten to `p=quarantine` or `p=reject`.

---

## Part 3: Verify in ActiveCampaign (~1 min, but may take up to 48h)

1. Go back to AC: **Settings → Advanced → Email Authentication**
2. Click **"Verify"** next to `gregorythegreat.ca`
3. If it says ✅ Verified — you're done
4. If it says ❌ Not verified — DNS propagation can take up to 48 hours. Check again later.

---

## Part 4: Set Sender Address

Once verified:
1. Go to **Settings → Addresses**
2. Add a new sender: `info@gregorythegreat.ca` (name: "Gregory the Great Institute")
3. Optionally add: `magnalia@gregorythegreat.ca` (for the Magnalia Letter)
4. Use these as the "From" address in all automations and campaigns

---

## After This Is Done

Tell Evan, and he'll:
- Set the AC environment variables in Cloudflare Pages
- Test the welcome email sequence
- Confirm deliverability with a test send

---

## Quick Reference

| Record | Type | Name | Example Value |
|--------|------|------|---------------|
| DKIM | TXT | `dk1._domainkey` | *(from AC — long string)* |
| SPF | TXT | `@` | `v=spf1 include:emsd1.com ~all` |
| DMARC | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@gregorythegreat.ca` |

*The `include:emsd1.com` is ActiveCampaign's standard SPF include. Confirm the exact value AC shows you — it may vary by account region.*
