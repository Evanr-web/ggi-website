// POST /api/zeffy-webhook — Receives Zeffy payment.completed webhooks
// Syncs contacts to ActiveCampaign with full CRM taxonomy (CRM Concept v3)
//
// Flow:
// 1. Validate webhook payload
// 2. Find or create AC contact
// 3. Fetch all payments from Zeffy for this contact (for accurate tier calc)
// 4. Update custom fields (tier, giving totals, dates, consent)
// 5. Apply tags (donor type, campaign, source)
// 6. Manage list subscriptions (Partners in Renewal, Events, Newsletter)

import { logError } from './_shared.js';

// ── AC Structure IDs (from migration build, Aug 2026) ──
const AC_LISTS = {
  newsletter: '17',
  events: '18',
  partners: '19',
};

const AC_FIELDS = {
  donorTier: '13',
  trailing12mo: '14',
  lifetimeGiving: '15',
  largestGift: '16',
  totalEngagement: '17',
  donationCount: '18',
  firstGiftDate: '19',
  lastGiftDate: '20',
  consentStatus: '21',
  consentSource: '22',
  consentDate: '23',
  zeffyContactId: '24',
  zeffySubscriptionId: '25',
  sourceImportDate: '26',
  phone: '27',
  city: '10',
  province: '11',
  postalCode: '12',
};

// Tag name → AC tag ID mapping (loaded on first request)
let _tagCache = null;

async function getTagIds(env) {
  if (_tagCache) return _tagCache;

  const tags = {};
  let offset = 0;
  while (true) {
    const res = await fetch(`${env.AC_API_URL}/api/3/tags?limit=100&offset=${offset}`, {
      headers: { 'Api-Token': env.AC_API_KEY },
    });
    const data = await res.json();
    for (const t of data.tags || []) {
      tags[t.tag] = t.id;
    }
    if ((data.tags || []).length < 100) break;
    offset += 100;
  }
  _tagCache = tags;
  return tags;
}

// ── Campaign Mapping ──
const CAMPAIGN_TAG_MAP = {
  'gregory the great institute for cultural renewal': 'campaign:general-donation',
  'fundraising for 2026': 'campaign:fundraising-2026',
  'benedict institute feasibility study cheque': 'campaign:benedict-cheques',
  'benedict institute feasibility study': 'campaign:benedict-feasibility',
  'magnalia patron': 'campaign:magnalia-patron',
  'renewing culture conference': 'campaign:conference-2026',
  'bringing back sunday': 'campaign:conference-2026',
  'faith and reason': 'campaign:faith-reason-2026',
  'marriage retreat': 'campaign:marriage-retreat',
  'rekindling the hearth': 'campaign:marriage-retreat',
  'personal finances': 'campaign:masterclass-finances',
  'master class': 'campaign:masterclass-finances',
  'bbq': 'campaign:bbq-birthday',
  'pilgrimage': 'campaign:summer-pilgrimage',
  'bulk order': 'campaign:magnalia-bulk',
  'annual subscription': 'campaign:magnalia-subscription',
  'single issue': 'campaign:magnalia-single',
  'friend of the institute': 'campaign:friend-of-institute',
  'support the gregory': 'campaign:support-ggi',
  'cvc import': 'campaign:cvc-import',
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function matchCampaignTag(description) {
  const desc = (description || '').toLowerCase();
  for (const [key, tag] of Object.entries(CAMPAIGN_TAG_MAP)) {
    if (desc.includes(key)) return { tag, autoCreate: false };
  }
  // Auto-generate tag from campaign title
  if (description && description.trim()) {
    return { tag: `campaign:${slugify(description)}`, autoCreate: true };
  }
  return null;
}

// ── Tier Calculation ──
function calculateTier(trailing12moCents) {
  const dollars = trailing12moCents / 100;
  if (dollars >= 25000) return 'Visionary Partner';
  if (dollars >= 5000) return 'Leadership Partner';
  if (dollars >= 600) return 'Patron';
  if (dollars >= 180) return 'Friend';
  return 'General Donor';
}

// ── Zeffy API Helper ──
async function fetchZeffyPayments(env, contactId) {
  const headers = {
    'Authorization': `Bearer ${env.ZEFFY_API_KEY}`,
    'Accept': 'application/json',
    'User-Agent': 'GGI-Webhook/1.0',
  };

  const payments = [];
  let cursor = null;

  while (true) {
    let url = `https://api.zeffy.com/api/v1/payments?limit=100&contact=${contactId}`;
    if (cursor) url += `&starting_after=${cursor}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`[zeffy-webhook] Zeffy API ${res.status}: ${await res.text()}`);
      break;
    }

    const data = await res.json();
    const items = data.data || [];
    payments.push(...items);

    if (!data.has_more || items.length === 0) break;
    cursor = items[items.length - 1].id;
  }

  return payments;
}

async function findZeffyContact(env, email) {
  const headers = {
    'Authorization': `Bearer ${env.ZEFFY_API_KEY}`,
    'Accept': 'application/json',
    'User-Agent': 'GGI-Webhook/1.0',
  };

  const res = await fetch(`https://api.zeffy.com/api/v1/contacts?email=${encodeURIComponent(email)}&limit=1`, { headers });
  if (!res.ok) return null;

  const data = await res.json();
  return (data.data || [])[0] || null;
}

// ── AC API Helpers ──
async function acRequest(env, method, endpoint, body) {
  const opts = {
    method,
    headers: {
      'Api-Token': env.AC_API_KEY,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${env.AC_API_URL}/api/3/${endpoint}`, opts);
  return res.json();
}

async function syncContact(env, { email, firstName, lastName, fieldValues }) {
  const result = await acRequest(env, 'POST', 'contact/sync', {
    contact: { email, firstName, lastName, fieldValues },
  });
  return result?.contact?.id || null;
}

async function addToList(env, contactId, listId) {
  await acRequest(env, 'POST', 'contactLists', {
    contactList: { list: listId, contact: contactId, status: 1 },
  });
}

async function addTag(env, contactId, tagId) {
  await acRequest(env, 'POST', 'contactTags', {
    contactTag: { contact: contactId, tag: tagId },
  });
}

async function removeTag(env, contactId, tagId) {
  // Find the contactTag ID first
  const result = await acRequest(env, 'GET', `contacts/${contactId}/contactTags`);
  const ct = (result?.contactTags || []).find(t => t.tag === tagId);
  if (ct) {
    await acRequest(env, 'DELETE', `contactTags/${ct.id}`);
  }
}

// ── Main Webhook Handler ──
export async function onRequestPost(context) {
  const startTime = Date.now();

  try {
    const rawBody = await context.request.text();
    console.log('[zeffy-webhook] Received payload');

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      console.error('[zeffy-webhook] Invalid JSON');
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    // Only process payment.completed
    if (event.type !== 'payment.completed' || !event.data) {
      return jsonResponse({ success: true, note: `Ignored: ${event.type}` });
    }

    const payment = event.data;
    const buyer = payment.buyer || {};
    const email = (buyer.email || '').trim().toLowerCase();
    const firstName = buyer.first_name || '';
    const lastName = buyer.last_name || '';

    if (!email || !email.includes('@')) {
      console.warn('[zeffy-webhook] No valid email');
      return jsonResponse({ success: true, note: 'No email, skipped' });
    }

    const env = context.env;

    // Load tag IDs
    const tagIds = await getTagIds(env);

    // ── Find Zeffy contact and pull all payments ──
    const zeffyContact = await findZeffyContact(env, email);
    let allPayments = [];
    let zeffyContactId = null;

    if (zeffyContact) {
      zeffyContactId = zeffyContact.id;
      allPayments = await fetchZeffyPayments(env, zeffyContactId);
      console.log(`[zeffy-webhook] ${email}: ${allPayments.length} total payments from Zeffy`);
    } else {
      // No Zeffy contact found — use just this payment
      allPayments = [payment];
      console.log(`[zeffy-webhook] ${email}: no Zeffy contact found, using single payment`);
    }

    // ── Calculate derived fields from ALL payments ──
    const now = Date.now();
    const twelveMonthsAgo = now - (365 * 24 * 60 * 60 * 1000);

    let lifetimeEligible = 0;
    let totalEngagement = 0;
    let largestGift = 0;
    let trailing12mo = 0;
    let firstGiftDate = null;
    let lastGiftDate = null;
    let donationCount = allPayments.length;

    for (const p of allPayments) {
      const amt = p.amount || 0;
      const eligible = p.eligible_amount || 0;
      const created = p.created ? p.created * 1000 : null; // unix seconds → ms

      totalEngagement += amt;
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

    const tier = calculateTier(trailing12mo);

    // ── Determine donor tag ──
    let donorTag = 'donor:one-time';
    if (zeffyContact) {
      const dt = zeffyContact.donor_type;
      if (dt === 'Monthly') donorTag = 'donor:monthly';
      else if (dt === 'Returning') donorTag = 'donor:returning';
      else if (dt === 'Member') donorTag = 'donor:member';
      else if (dt === 'Prospect') donorTag = 'donor:prospect';
    }
    // Check recurring on this payment
    if (payment.recurring?.is_recurring && payment.recurring?.interval === 'monthly') {
      donorTag = 'donor:monthly';
    }

    // ── Campaign tag ──
    const campaignTag = matchCampaignTag(payment.description);
    const campaignTagName = campaignTag?.tag || null;

    // ── Buyer questions: newsletter opt-in, address, phone ──
    let newsletterOptin = false;
    let city = null;
    let postalCode = null;
    let phone = null;

    for (const bq of payment.buyer_questions || []) {
      const q = (bq.question || '').toLowerCase();
      const a = bq.answer || '';

      if ((q.includes('newsletter') || q.includes('monthly updates')) &&
          ['true', 'yes', '1'].includes(String(a).toLowerCase())) {
        newsletterOptin = true;
      }
      if (q.includes('city') && a && !city) city = a;
      if (q.includes('postal') && a && !postalCode) postalCode = a;
      if (q.includes('phone') && a && !phone) phone = a;
    }

    // ── Build AC field values ──
    const fieldValues = [
      { field: AC_FIELDS.donorTier, value: tier },
      { field: AC_FIELDS.trailing12mo, value: (trailing12mo / 100).toFixed(2) },
      { field: AC_FIELDS.lifetimeGiving, value: (lifetimeEligible / 100).toFixed(2) },
      { field: AC_FIELDS.largestGift, value: (largestGift / 100).toFixed(2) },
      { field: AC_FIELDS.totalEngagement, value: (totalEngagement / 100).toFixed(2) },
      { field: AC_FIELDS.donationCount, value: String(donationCount) },
    ];

    if (firstGiftDate) fieldValues.push({ field: AC_FIELDS.firstGiftDate, value: firstGiftDate });
    if (lastGiftDate) fieldValues.push({ field: AC_FIELDS.lastGiftDate, value: lastGiftDate });
    if (zeffyContactId) fieldValues.push({ field: AC_FIELDS.zeffyContactId, value: zeffyContactId });
    if (city) fieldValues.push({ field: AC_FIELDS.city, value: city });
    if (postalCode) fieldValues.push({ field: AC_FIELDS.postalCode, value: postalCode });
    if (phone) fieldValues.push({ field: AC_FIELDS.phone, value: phone });

    // Consent — payment = implied; newsletter checkbox = express
    if (newsletterOptin) {
      fieldValues.push({ field: AC_FIELDS.consentStatus, value: 'Express' });
      fieldValues.push({ field: AC_FIELDS.consentSource, value: 'newsletter-optin' });
    } else {
      fieldValues.push({ field: AC_FIELDS.consentStatus, value: 'Implied', overwrite: 0 });
      fieldValues.push({ field: AC_FIELDS.consentSource, value: 'transaction', overwrite: 0 });
    }
    fieldValues.push({ field: AC_FIELDS.consentDate, value: new Date().toISOString().slice(0, 10) });

    // Recurring subscription ID
    if (payment.recurring?.subscription_id) {
      fieldValues.push({ field: AC_FIELDS.zeffySubscriptionId, value: payment.recurring.subscription_id });
    }

    // ── 1. Sync contact to AC ──
    const contactId = await syncContact(env, { email, firstName, lastName, fieldValues });
    if (!contactId) {
      console.error(`[zeffy-webhook] Failed to sync ${email}`);
      return jsonResponse({ success: true, note: 'AC sync failed, logged' });
    }

    console.log(`[zeffy-webhook] ${email} → AC contact ${contactId} | ${tier} | $${(trailing12mo/100).toFixed(0)}/yr`);

    // ── 2. List management ──
    // Partners in Renewal: any eligible giving > 0
    if (lifetimeEligible > 0) {
      await addToList(env, contactId, AC_LISTS.partners);
    }

    // Institute Events: event campaigns
    if (payment.campaign_category === 'event') {
      await addToList(env, contactId, AC_LISTS.events);
    }

    // Newsletter: explicit opt-in
    if (newsletterOptin) {
      await addToList(env, contactId, AC_LISTS.newsletter);
    }

    // ── 3. Tags ──
    // Donor tag — remove conflicting, add current
    const donorTags = ['donor:monthly', 'donor:one-time', 'donor:returning', 'donor:prospect', 'donor:lapsed', 'donor:member'];
    for (const dt of donorTags) {
      if (dt !== donorTag && tagIds[dt]) {
        await removeTag(env, contactId, tagIds[dt]);
      }
    }
    if (tagIds[donorTag]) {
      await addTag(env, contactId, tagIds[donorTag]);
    }

    // Remove lapsed if present (they just gave)
    if (tagIds['donor:lapsed']) {
      await removeTag(env, contactId, tagIds['donor:lapsed']);
    }

    // Campaign tag
    if (campaignTag) {
      let campaignTagId = tagIds[campaignTag.tag];

      // Auto-create tag if it doesn't exist yet
      if (!campaignTagId && campaignTag.autoCreate) {
        console.log(`[zeffy-webhook] Auto-creating tag: ${campaignTag.tag}`);
        const createResult = await acRequest(env, 'POST', 'tags', {
          tag: { tag: campaignTag.tag, tagType: 'contact' },
        });
        campaignTagId = createResult?.tag?.id;
        if (campaignTagId) {
          tagIds[campaignTag.tag] = campaignTagId; // cache it
        }
      }

      if (campaignTagId) {
        await addTag(env, contactId, campaignTagId);
      }
    }

    // Source tag
    if (tagIds['source:event'] && payment.campaign_category === 'event') {
      await addTag(env, contactId, tagIds['source:event']);
    }

    const elapsed = Date.now() - startTime;
    console.log(`[zeffy-webhook] Done: ${email} in ${elapsed}ms`);

    return jsonResponse({
      success: true,
      contactId,
      tier,
      trailing12mo: trailing12mo / 100,
      donorTag,
      campaignTag: campaignTagName,
    });
  } catch (err) {
    logError('zeffy-webhook', err);
    // Return 200 to prevent Zeffy retries on our errors
    return jsonResponse({ success: true, note: 'Error logged' });
  }
}

// GET for health check
export async function onRequestGet() {
  return jsonResponse({ status: 'ok', service: 'ggi-zeffy-webhook', version: '2.0' });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
