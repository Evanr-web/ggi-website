#!/usr/bin/env node
// One-time backfill: sync addresses from Zeffy contacts → ActiveCampaign
// Only updates address fields (street, city, province, postal, phone)
// Does NOT recalculate tiers or giving totals — those are handled by the webhook
//
// Usage: ZEFFY_API_KEY=xxx AC_API_KEY=xxx node scripts/backfill-addresses.js [--dry-run]

const ZEFFY_API_KEY = process.env.ZEFFY_API_KEY;
const AC_API_KEY = process.env.AC_API_KEY;
const AC_API_URL = process.env.AC_API_URL || 'https://gregorythegreat.api-us1.com';
const DRY_RUN = process.argv.includes('--dry-run');

const AC_FIELDS = {
  streetAddress: '9',
  city: '10',
  province: '11',
  postalCode: '12',
  phone: '27',
};

if (!ZEFFY_API_KEY || !AC_API_KEY) {
  console.error('Required: ZEFFY_API_KEY and AC_API_KEY environment variables');
  process.exit(1);
}

async function fetchAllZeffyContacts() {
  const contacts = [];
  let cursor = null;

  while (true) {
    let url = 'https://api.zeffy.com/api/v1/contacts?limit=100';
    if (cursor) url += `&starting_after=${cursor}`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${ZEFFY_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Zeffy API error: ${res.status} ${await res.text()}`);
      break;
    }

    const data = await res.json();
    const items = data.data || [];
    contacts.push(...items);
    console.log(`  Fetched ${contacts.length} contacts so far...`);

    if (!data.has_more || items.length === 0) break;
    cursor = data.next_cursor;
  }

  return contacts;
}

async function syncToAC(email, firstName, lastName, fieldValues) {
  const res = await fetch(`${AC_API_URL}/api/3/contact/sync`, {
    method: 'POST',
    headers: {
      'Api-Token': AC_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contact: { email, firstName, lastName, fieldValues },
    }),
  });

  const data = await res.json();
  return data?.contact?.id || null;
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE BACKFILL ===');
  console.log('Fetching all Zeffy contacts...');

  const contacts = await fetchAllZeffyContacts();
  console.log(`\nTotal contacts: ${contacts.length}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of contacts) {
    const email = (c.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      skipped++;
      continue;
    }

    const addr = c.address || {};
    const hasAddress = addr.line1 || addr.city || addr.state || addr.postal_code;
    const hasPhone = c.phone_number;

    if (!hasAddress && !hasPhone) {
      skipped++;
      continue;
    }

    const fieldValues = [];
    if (addr.line1) fieldValues.push({ field: AC_FIELDS.streetAddress, value: addr.line1 });
    if (addr.city) fieldValues.push({ field: AC_FIELDS.city, value: addr.city });
    if (addr.state) fieldValues.push({ field: AC_FIELDS.province, value: addr.state });
    if (addr.postal_code) fieldValues.push({ field: AC_FIELDS.postalCode, value: addr.postal_code });
    if (c.phone_number) fieldValues.push({ field: AC_FIELDS.phone, value: c.phone_number });

    if (DRY_RUN) {
      console.log(`[DRY] ${email} → ${addr.line1 || '-'}, ${addr.city || '-'}, ${addr.state || '-'} ${addr.postal_code || '-'} | phone: ${c.phone_number || '-'}`);
      updated++;
      continue;
    }

    try {
      const contactId = await syncToAC(email, c.first_name || '', c.last_name || '', fieldValues);
      if (contactId) {
        console.log(`✓ ${email} → AC #${contactId} | ${addr.line1 || '-'}, ${addr.city || '-'}, ${addr.state || '-'} ${addr.postal_code || '-'}`);
        updated++;
      } else {
        console.error(`✗ ${email} — AC sync returned no ID`);
        failed++;
      }
      // Rate limit: ~2 req/sec to be safe with AC
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`✗ ${email} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no address/phone or no email): ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
