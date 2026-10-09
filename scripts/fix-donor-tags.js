#!/usr/bin/env node
/**
 * fix-donor-tags.js
 *
 * Retroactive cleanup: finds all AC contacts with donor:* tags, re-evaluates
 * their Zeffy payment history using the same isDonation() classifier as the
 * webhook, and corrects fields/tags for anyone whose donor status was inflated
 * by event tickets or Magnalia journal purchases.
 *
 * Usage:
 *   node fix-donor-tags.js            # dry-run (default) — shows what WOULD change
 *   node fix-donor-tags.js --execute  # actually makes the API changes
 *
 * Requires env vars:
 *   AC_API_KEY   — ActiveCampaign API key
 *   ZEFFY_API_KEY — Zeffy API key
 */

import 'dotenv/config';

// ── Config ──────────────────────────────────────────────────────────────────
const AC_BASE = 'https://gregorythegreat.api-us1.com/api/3';
const ZEFFY_BASE = 'https://api.zeffy.com/api/v1';
const AC_API_KEY = process.env.AC_API_KEY;
const ZEFFY_API_KEY = process.env.ZEFFY_API_KEY;

const DRY_RUN = !process.argv.includes('--execute');

// AC Tag IDs (from migration build, Aug 2026)
const DONOR_TAG_IDS = {
  'donor:one-time': '46',
  'donor:monthly': '45',
  'donor:returning': '47',
  'donor:member': '50',
  'donor:prospect': '48',
  'donor:lapsed': '49',
};

// AC Field IDs
const AC_FIELDS = {
  donorTier: '13',
  trailing12mo: '14',
  lifetimeGiving: '15',
  largestGift: '16',
  totalEngagement: '17',  // kept as-is — tracks all transaction value
  donationCount: '18',
  firstGiftDate: '19',
  lastGiftDate: '20',
};

const AC_LISTS = {
  partners: '19',
};

// Tier names for logging
const TIER_NAMES = {
  Visionary: 'Visionary Partner',
  Leadership: 'Leadership Partner',
  Patron: 'Patron',
  Friend: 'Friend',
  General: 'General Donor',
};

// Rate limiting — 200ms between contacts to respect AC API limits
const RATE_LIMIT_MS = 200;

// ── isDonation (same logic as webhook — MUST stay in sync) ──────────────────
/**
 * Returns true only for actual charitable donations/gifts.
 * Returns false for event tickets, Magnalia journal purchases, and other
 * non-charitable transactions.
 *
 * NOTE: This is a copy of isDonation() from zeffy-webhook.js.
 * If you change one, change the other.
 */
function isDonation(payment) {
  // Event ticket purchases are never donations
  if ((payment.campaign_category || '').toLowerCase() === 'event') return false;

  // Magnalia journal purchases and related commerce items are not donations
  const desc = (payment.description || '').toLowerCase();
  const nonDonationKeywords = [
    'magnalia',
    'single issue',
    'bulk order',
    'annual subscription',
    'journal',
  ];
  for (const keyword of nonDonationKeywords) {
    if (desc.includes(keyword)) return false;
  }

  return true;
}

// ── Tier Calculation (same as webhook) ──────────────────────────────────────
function calculateTier(trailing12moCents) {
  const dollars = trailing12moCents / 100;
  if (dollars >= 25000) return 'Visionary Partner';
  if (dollars >= 5000) return 'Leadership Partner';
  if (dollars >= 600) return 'Patron';
  if (dollars >= 180) return 'Friend';
  return 'General Donor';
}

// ── Sleep ────────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── AC API helpers ───────────────────────────────────────────────────────────
async function acGet(endpoint) {
  const res = await fetch(`${AC_BASE}/${endpoint}`, {
    headers: { 'Api-Token': AC_API_KEY },
  });
  if (!res.ok) throw new Error(`AC GET ${endpoint} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function acPost(endpoint, body) {
  const res = await fetch(`${AC_BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Api-Token': AC_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AC POST ${endpoint} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function acDelete(endpoint) {
  const res = await fetch(`${AC_BASE}/${endpoint}`, {
    method: 'DELETE',
    headers: { 'Api-Token': AC_API_KEY },
  });
  // 204 = success, no body
  if (!res.ok && res.status !== 204) {
    throw new Error(`AC DELETE ${endpoint} → ${res.status}: ${await res.text()}`);
  }
}

/** Fetch all contacts with a given tag ID (handles pagination). */
async function getContactsByTag(tagId) {
  const contacts = [];
  let offset = 0;
  while (true) {
    const data = await acGet(`contacts?tagid=${tagId}&limit=100&offset=${offset}`);
    const batch = data.contacts || [];
    contacts.push(...batch);
    if (batch.length < 100) break;
    offset += 100;
  }
  return contacts;
}

/** Get all contactTag entries for a contact (to find the contactTag ID for deletion). */
async function getContactTags(contactId) {
  const data = await acGet(`contacts/${contactId}/contactTags`);
  return data.contactTags || [];
}

/** Remove a specific tag from a contact. */
async function removeTagFromContact(contactId, tagId, currentContactTags) {
  const ct = currentContactTags.find(t => String(t.tag) === String(tagId));
  if (!ct) return false; // tag not present, nothing to do
  await acDelete(`contactTags/${ct.id}`);
  return true;
}

/** Add a tag to a contact. */
async function addTagToContact(contactId, tagId) {
  await acPost('contactTags', {
    contactTag: { contact: contactId, tag: tagId },
  });
}

/** Update AC contact fields + optionally remove from Partners list. */
async function syncContactFields(email, firstName, lastName, fieldValues) {
  await acPost('contact/sync', {
    contact: { email, firstName, lastName, fieldValues },
  });
}

/** Remove contact from a list (status: 2 = unsubscribed). */
async function removeFromList(contactId, listId) {
  await acPost('contactLists', {
    contactList: { list: listId, contact: contactId, status: 2 },
  });
}

// ── Zeffy API helpers ─────────────────────────────────────────────────────────
async function zeffyGet(endpoint) {
  const res = await fetch(`${ZEFFY_BASE}/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${ZEFFY_API_KEY}`,
      'Accept': 'application/json',
      'User-Agent': 'GGI-FixDonorTags/1.0',
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function findZeffyContact(email) {
  const data = await zeffyGet(`contacts?email=${encodeURIComponent(email)}&limit=1`);
  return (data?.data || [])[0] || null;
}

async function fetchZeffyPayments(contactId) {
  const payments = [];
  let cursor = null;

  while (true) {
    let url = `payments?limit=100&contact=${contactId}`;
    if (cursor) url += `&starting_after=${cursor}`;

    const data = await zeffyGet(url);
    if (!data) break;

    const items = data.data || [];
    payments.push(...items);
    if (!data.has_more || items.length === 0) break;
    cursor = items[items.length - 1].id;
  }

  return payments;
}

// ── Recalculate giving fields from donation payments ──────────────────────────
function recalcFromPayments(donationPayments) {
  const now = Date.now();
  const twelveMonthsAgo = now - (365 * 24 * 60 * 60 * 1000);

  let lifetimeEligible = 0;
  let largestGift = 0;
  let trailing12mo = 0;
  let firstGiftDate = null;
  let lastGiftDate = null;
  let donationCount = donationPayments.length;

  for (const p of donationPayments) {
    const eligible = p.eligible_amount || 0;
    const created = p.created ? p.created * 1000 : null;

    lifetimeEligible += eligible;
    if (eligible > largestGift) largestGift = eligible;

    if (created) {
      const dateStr = new Date(created).toISOString().slice(0, 10);
      if (!firstGiftDate || dateStr < firstGiftDate) firstGiftDate = dateStr;
      if (!lastGiftDate || dateStr > lastGiftDate) lastGiftDate = dateStr;

      if (created > twelveMonthsAgo && eligible > 0) {
        trailing12mo += eligible;
      }
    }
  }

  return { lifetimeEligible, largestGift, trailing12mo, firstGiftDate, lastGiftDate, donationCount };
}

// ── Log helper ────────────────────────────────────────────────────────────────
function log(email, message) {
  const prefix = DRY_RUN ? '[DRY-RUN]' : '[EXECUTE]';
  console.log(`${prefix} [${email}] ${message}`);
}

// ── Process a single contact ──────────────────────────────────────────────────
async function processContact(acContact) {
  const email = acContact.email;
  const contactId = acContact.id;
  const firstName = acContact.firstName || '';
  const lastName = acContact.lastName || '';

  // Find Zeffy contact
  const zeffyContact = await findZeffyContact(email);
  if (!zeffyContact) {
    log(email, `SKIP — no Zeffy contact found`);
    return;
  }

  const allPayments = await fetchZeffyPayments(zeffyContact.id);
  const donationPayments = allPayments.filter(isDonation);

  // Determine current donor tags on this AC contact
  const currentContactTags = await getContactTags(contactId);
  const currentTagIds = new Set(currentContactTags.map(t => String(t.tag)));

  const hasDonorTag = Object.values(DONOR_TAG_IDS).some(id => currentTagIds.has(String(id)));
  if (!hasDonorTag) {
    // Nothing to fix
    return;
  }

  // ── Case 1: Zero real donations ──────────────────────────────────────────
  if (donationPayments.length === 0) {
    log(email, `action: ZERO real donations (${allPayments.length} total payments are all non-donations)`);

    // Find current tier field for logging
    const tierField = acContact.fieldValues?.find?.(f => String(f.field) === AC_FIELDS.donorTier);
    const currentTier = tierField?.value || '(unknown)';

    // Remove all donor:* tags except prospect
    const tagsToRemove = Object.entries(DONOR_TAG_IDS).filter(([name]) => name !== 'donor:prospect');
    for (const [tagName, tagId] of tagsToRemove) {
      if (currentTagIds.has(String(tagId))) {
        log(email, `  remove tag: ${tagName}`);
        if (!DRY_RUN) await removeTagFromContact(contactId, tagId, currentContactTags);
      }
    }

    // Add donor:prospect if not already there
    const prospectId = DONOR_TAG_IDS['donor:prospect'];
    if (!currentTagIds.has(String(prospectId))) {
      log(email, `  add tag: donor:prospect`);
      if (!DRY_RUN) await addTagToContact(contactId, prospectId);
    }

    // Remove from Partners in Renewal list
    log(email, `  remove from Partners in Renewal list`);
    if (!DRY_RUN) await removeFromList(contactId, AC_LISTS.partners);

    // Zero out donor fields, clear tier
    log(email, `  clear donor fields | tier: ${currentTier} → (none) | lifetime: $0 | trailing12mo: $0`);
    if (!DRY_RUN) {
      const fieldValues = [
        { field: AC_FIELDS.donorTier, value: '' },
        { field: AC_FIELDS.trailing12mo, value: '0.00' },
        { field: AC_FIELDS.lifetimeGiving, value: '0.00' },
        { field: AC_FIELDS.largestGift, value: '0.00' },
        { field: AC_FIELDS.donationCount, value: '0' },
        { field: AC_FIELDS.firstGiftDate, value: '' },
        { field: AC_FIELDS.lastGiftDate, value: '' },
      ];
      await syncContactFields(email, firstName, lastName, fieldValues);
    }
    return;
  }

  // ── Case 2: Some real donations (mixed with non-donation payments) ────────
  if (donationPayments.length < allPayments.length) {
    const { lifetimeEligible, largestGift, trailing12mo, firstGiftDate, lastGiftDate, donationCount }
      = recalcFromPayments(donationPayments);

    const newTier = calculateTier(trailing12mo);

    // Determine correct donor tag from Zeffy contact
    let newDonorTag = 'donor:one-time';
    const dt = zeffyContact.donor_type;
    if (dt === 'Monthly') newDonorTag = 'donor:monthly';
    else if (dt === 'Returning') newDonorTag = 'donor:returning';
    else if (dt === 'Member') newDonorTag = 'donor:member';
    else if (dt === 'Prospect') newDonorTag = 'donor:prospect';

    const newDonorTagId = DONOR_TAG_IDS[newDonorTag];

    log(email, `action: MIXED payments — recalculating with ${donationPayments.length}/${allPayments.length} donation payments`);
    log(email, `  tier: → ${newTier} | lifetime: $${(lifetimeEligible/100).toFixed(2)} | trailing12mo: $${(trailing12mo/100).toFixed(2)}`);
    log(email, `  donor tag: → ${newDonorTag}`);

    if (!DRY_RUN) {
      // Fix donor tags: remove all conflicting, set correct one
      for (const [tagName, tagId] of Object.entries(DONOR_TAG_IDS)) {
        if (tagName !== newDonorTag && currentTagIds.has(String(tagId))) {
          await removeTagFromContact(contactId, tagId, currentContactTags);
        }
      }
      if (!currentTagIds.has(String(newDonorTagId))) {
        await addTagToContact(contactId, newDonorTagId);
      }

      // Update fields
      const fieldValues = [
        { field: AC_FIELDS.donorTier, value: newTier },
        { field: AC_FIELDS.trailing12mo, value: (trailing12mo / 100).toFixed(2) },
        { field: AC_FIELDS.lifetimeGiving, value: (lifetimeEligible / 100).toFixed(2) },
        { field: AC_FIELDS.largestGift, value: (largestGift / 100).toFixed(2) },
        { field: AC_FIELDS.donationCount, value: String(donationCount) },
      ];
      if (firstGiftDate) fieldValues.push({ field: AC_FIELDS.firstGiftDate, value: firstGiftDate });
      if (lastGiftDate) fieldValues.push({ field: AC_FIELDS.lastGiftDate, value: lastGiftDate });
      await syncContactFields(email, firstName, lastName, fieldValues);
    }
    return;
  }

  // ── Case 3: All payments are real donations — no changes needed ───────────
  // (donationPayments.length === allPayments.length && allPayments.length > 0)
  // Leave unchanged.
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!AC_API_KEY) { console.error('ERROR: AC_API_KEY not set'); process.exit(1); }
  if (!ZEFFY_API_KEY) { console.error('ERROR: ZEFFY_API_KEY not set'); process.exit(1); }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`fix-donor-tags.js — ${DRY_RUN ? 'DRY RUN (no changes)' : 'EXECUTE MODE (live changes!)'}`);
  console.log(`${'='.repeat(60)}\n`);

  if (!DRY_RUN) {
    console.log('⚠️  EXECUTE MODE — changes will be made to ActiveCampaign!\n');
  }

  // Collect all unique contacts that have ANY donor:* tag
  console.log('Fetching contacts with donor:* tags...');
  const seenIds = new Set();
  const allContacts = [];

  for (const [tagName, tagId] of Object.entries(DONOR_TAG_IDS)) {
    console.log(`  Fetching contacts with tag: ${tagName} (id=${tagId})`);
    const contacts = await getContactsByTag(tagId);
    console.log(`    → ${contacts.length} contacts`);
    for (const c of contacts) {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        allContacts.push(c);
      }
    }
  }

  console.log(`\nTotal unique contacts to evaluate: ${allContacts.length}\n`);
  console.log(`${'─'.repeat(60)}\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const contact of allContacts) {
    try {
      await processContact(contact);
      processed++;
    } catch (err) {
      console.error(`ERROR [${contact.email}]: ${err.message}`);
      errors++;
    }

    // Rate limiting: 200ms between contacts
    await sleep(RATE_LIMIT_MS);

    if (processed % 20 === 0) {
      console.log(`  ... processed ${processed}/${allContacts.length}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Done. Processed: ${processed} | Errors: ${errors}`);
  if (DRY_RUN) {
    console.log('\nThis was a DRY RUN. Run with --execute to apply changes.');
  }
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
