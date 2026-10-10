export const prerender = false;

// POST /api/zeffy-webhook — Receives Zeffy payment.completed webhooks
// Syncs contacts to ActiveCampaign with full CRM taxonomy (CRM Concept v3)
//
// Flow:
// 1. Validate webhook payload
// 2. Find or create AC contact
// 3. Fetch all payments from Zeffy for this contact (for accurate tier calc)
// 4. Update custom fields (tier, giving totals, dates, consent)
// 5. Apply tags (donor type, tier, campaign, source)
// 6. Manage list subscriptions (Partners in Renewal, Events, Newsletter)

import { env } from 'cloudflare:workers';
import { jsonResponse, logError } from '../../lib/api-shared.js';

// ── AC Structure IDs ──
const AC_LISTS = {
  newsletter: '17',
  events: '18',
  partners: '19',
  magnaliaJournal: '25',
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
  streetAddress: '9',
  city: '10',
  province: '11',
  postalCode: '12',
};

// ── Tag name → AC tag ID mapping (loaded on first request) ──
let _tagCache = null;

async function getTagIds() {
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
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

function matchCampaignTag(description) {
  const desc = (description || '').toLowerCase();
  for (const [key, tag] of Object.entries(CAMPAIGN_TAG_MAP)) {
    if (desc.includes(key)) return { tag, autoCreate: false };
  }
  if (description && description.trim()) {
    return { tag: `campaign:${slugify(description)}`, autoCreate: true };
  }
  return null;
}

// ── Donation Classification ──
function isDonation(payment) {
  if ((payment.campaign_category || '').toLowerCase() === 'event') return false;
  const desc = (payment.description || '').toLowerCase();
  const nonDonationKeywords = ['magnalia', 'single issue', 'bulk order', 'annual subscription', 'journal'];
  for (const keyword of nonDonationKeywords) {
    if (desc.includes(keyword)) return false;
  }
  return true;
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

// ── Zeffy API Helpers ──
async function fetchZeffyPayments(contactId) {
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

async function findZeffyContact(email) {
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
async function acRequest(method, endpoint, body) {
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

async function syncContact({ email, firstName, lastName, fieldValues }) {
  const result = await acRequest('POST', 'contact/sync', {
    contact: { email, firstName, lastName, fieldValues },
  });
  return result?.contact?.id || null;
}

async function addToList(contactId, listId) {
  await acRequest('POST', 'contactLists', {
    contactList: { list: listId, contact: contactId, status: 1 },
  });
}

async function addTag(contactId, tagId) {
  await acRequest('POST', 'contactTags', {
    contactTag: { contact: contactId, tag: tagId },
  });
}

async function removeTag(contactId, tagId) {
  const result = await acRequest('GET', `contacts/${contactId}/contactTags`);
  const ct = (result?.contactTags || []).find(t => t.tag === tagId);
  if (ct) {
    await acRequest('DELETE', `contactTags/${ct.id}`);
  }
}

// ── Main Webhook Handler ──
export async function POST({ request }) {
  const startTime = Date.now();

  // Auth check
  const authHeader = request.headers.get('Authorization');
  const expectedToken = env.ZEFFY_WEBHOOK_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    console.error('[zeffy-webhook] Unauthorized request');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const rawBody = await request.text();
    console.log('[zeffy-webhook] Received payload');

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      console.error('[zeffy-webhook] Invalid JSON');
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }

    // Only process payment.completed
    const eventType = event.event || event.type;
    if (eventType !== 'payment.completed' || !event.data) {
      return jsonResponse({ success: true, note: `Ignored: ${eventType}` });
    }

    const payment = event.data || event;
    const buyer = payment.buyer || payment.payer || {};
    const email = (buyer.email || buyer.first_name || '').trim().toLowerCase();
    const firstName = buyer.first_name || buyer.firstName || '';
    const lastName = buyer.last_name || buyer.lastName || '';

    if (!email || !email.includes('@')) {
      console.warn('[zeffy-webhook] No valid email');
      return jsonResponse({ success: true, note: 'No email, skipped' });
    }

    // Load tag IDs
    const tagIds = await getTagIds();

    // ── Find Zeffy contact and pull all payments ──
    const zeffyContact = await findZeffyContact(email);
    let allPayments = [];
    let zeffyContactId = null;

    if (zeffyContact) {
      zeffyContactId = zeffyContact.id;
      allPayments = await fetchZeffyPayments(zeffyContactId);
      console.log(`[zeffy-webhook] ${email}: ${allPayments.length} total payments from Zeffy`);
    } else {
      allPayments = [payment];
      console.log(`[zeffy-webhook] ${email}: no Zeffy contact found, using single payment`);
    }

    // ── Calculate derived fields ──
    const donationPayments = allPayments.filter(isDonation);
    const now = Date.now();
    const twelveMonthsAgo = now - (365 * 24 * 60 * 60 * 1000);

    let lifetimeEligible = 0;
    let totalEngagement = 0;
    let largestGift = 0;
    let trailing12mo = 0;
    let firstGiftDate = null;
    let lastGiftDate = null;
    let donationCount = donationPayments.length;

    for (const p of allPayments) {
      totalEngagement += (p.amount || 0);
    }

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

    const tier = calculateTier(trailing12mo);
    const paymentIsDonation = isDonation(payment);
    console.log(`[zeffy-webhook] ${email}: isDonation=${paymentIsDonation} | ${donationPayments.length}/${allPayments.length} are donations`);

    // ── Determine donor tag ──
    let donorTag = 'donor:one-time';
    if (zeffyContact) {
      const dt = zeffyContact.donor_type;
      if (dt === 'Monthly') donorTag = 'donor:monthly';
      else if (dt === 'Returning') donorTag = 'donor:returning';
      else if (dt === 'Member') donorTag = 'donor:member';
      else if (dt === 'Prospect') donorTag = 'donor:prospect';
    }
    if (payment.recurring?.is_recurring && payment.recurring?.interval === 'monthly') {
      donorTag = 'donor:monthly';
    }

    // ── Campaign tag ──
    const campaignTag = matchCampaignTag(payment.description);
    const campaignTagName = campaignTag?.tag || null;

    // ── Address from Zeffy contact ──
    let streetAddress = null;
    let city = null;
    let province = null;
    let postalCode = null;
    let phone = null;

    if (zeffyContact?.address) {
      const addr = zeffyContact.address;
      streetAddress = addr.line1 || null;
      city = addr.city || null;
      province = addr.state || null;
      postalCode = addr.postal_code || null;
    }
    if (zeffyContact?.phone_number) {
      phone = zeffyContact.phone_number;
    }

    // ── Buyer questions: newsletter opt-in + fallback address/phone ──
    let newsletterOptin = false;

    for (const bq of payment.buyer_questions || []) {
      const q = (bq.question || '').toLowerCase();
      const a = bq.answer || '';

      if ((q.includes('newsletter') || q.includes('monthly updates')) &&
          ['true', 'yes', '1'].includes(String(a).toLowerCase())) {
        newsletterOptin = true;
      }
      if ((q.includes('address') || q.includes('street')) && a && !streetAddress) streetAddress = a;
      if (q.includes('city') && a && !city) city = a;
      if ((q.includes('province') || q.includes('state')) && a && !province) province = a;
      if (q.includes('postal') && a && !postalCode) postalCode = a;
      if (q.includes('phone') && a && !phone) phone = a;
    }

    // ── Build AC field values ──
    const fieldValues = [
      { field: AC_FIELDS.totalEngagement, value: (totalEngagement / 100).toFixed(2) },
    ];

    if (paymentIsDonation) {
      fieldValues.push(
        { field: AC_FIELDS.donorTier, value: tier },
        { field: AC_FIELDS.trailing12mo, value: (trailing12mo / 100).toFixed(2) },
        { field: AC_FIELDS.lifetimeGiving, value: (lifetimeEligible / 100).toFixed(2) },
        { field: AC_FIELDS.largestGift, value: (largestGift / 100).toFixed(2) },
        { field: AC_FIELDS.donationCount, value: String(donationCount) },
      );
      if (firstGiftDate) fieldValues.push({ field: AC_FIELDS.firstGiftDate, value: firstGiftDate });
      if (lastGiftDate) fieldValues.push({ field: AC_FIELDS.lastGiftDate, value: lastGiftDate });
    }

    if (zeffyContactId) fieldValues.push({ field: AC_FIELDS.zeffyContactId, value: zeffyContactId });
    if (streetAddress) fieldValues.push({ field: AC_FIELDS.streetAddress, value: streetAddress });
    if (city) fieldValues.push({ field: AC_FIELDS.city, value: city });
    if (province) fieldValues.push({ field: AC_FIELDS.province, value: province });
    if (postalCode) fieldValues.push({ field: AC_FIELDS.postalCode, value: postalCode });
    if (phone) fieldValues.push({ field: AC_FIELDS.phone, value: phone });

    // Consent
    if (newsletterOptin) {
      fieldValues.push({ field: AC_FIELDS.consentStatus, value: 'Express' });
      fieldValues.push({ field: AC_FIELDS.consentSource, value: 'newsletter-optin' });
    } else {
      fieldValues.push({ field: AC_FIELDS.consentStatus, value: 'Implied', overwrite: 0 });
      fieldValues.push({ field: AC_FIELDS.consentSource, value: 'transaction', overwrite: 0 });
    }
    fieldValues.push({ field: AC_FIELDS.consentDate, value: new Date().toISOString().slice(0, 10) });

    if (payment.recurring?.subscription_id) {
      fieldValues.push({ field: AC_FIELDS.zeffySubscriptionId, value: payment.recurring.subscription_id });
    }

    // ── 1. Sync contact to AC ──
    const contactId = await syncContact({ email, firstName, lastName, fieldValues });
    if (!contactId) {
      console.error(`[zeffy-webhook] Failed to sync ${email}`);
      return jsonResponse({ success: true, note: 'AC sync failed, logged' });
    }

    if (paymentIsDonation) {
      console.log(`[zeffy-webhook] ${email} → AC ${contactId} | ${tier} | $${(trailing12mo / 100).toFixed(0)}/yr`);
    } else {
      console.log(`[zeffy-webhook] ${email} → AC ${contactId} | non-donation`);
    }

    // ── 2. List management ──
    if (paymentIsDonation && lifetimeEligible > 0) {
      await addToList(contactId, AC_LISTS.partners);
    }
    if (payment.campaign_category === 'event') {
      await addToList(contactId, AC_LISTS.events);
    }
    if (newsletterOptin) {
      await addToList(contactId, AC_LISTS.newsletter);
    }
    // Magnalia journal purchases
    const desc = (payment.description || '').toLowerCase();
    if (desc.includes('magnalia') || desc.includes('journal') || desc.includes('subscription')) {
      await addToList(contactId, AC_LISTS.magnaliaJournal);
    }

    // ── 3. Tags ──
    if (paymentIsDonation) {
      // Donor tags — swap to current type
      const donorTags = ['donor:monthly', 'donor:one-time', 'donor:returning', 'donor:prospect', 'donor:lapsed', 'donor:member'];
      for (const dt of donorTags) {
        if (dt !== donorTag && tagIds[dt]) {
          await removeTag(contactId, tagIds[dt]);
        }
      }
      if (tagIds[donorTag]) {
        await addTag(contactId, tagIds[donorTag]);
      }

      // Remove lapsed (they just gave)
      if (tagIds['donor:lapsed']) {
        await removeTag(contactId, tagIds['donor:lapsed']);
      }

      // Tier tags — swap to match calculated tier
      const tierTags = ['tier:general-donor', 'tier:friend', 'tier:patron', 'tier:leadership-partner', 'tier:visionary-partner'];
      const tierTagName = `tier:${tier.toLowerCase().replace(/ /g, '-')}`;
      for (const tt of tierTags) {
        if (tt !== tierTagName && tagIds[tt]) {
          await removeTag(contactId, tagIds[tt]);
        }
      }
      if (tagIds[tierTagName]) {
        await addTag(contactId, tagIds[tierTagName]);
      }
    }

    // Campaign tag
    if (campaignTag) {
      let campaignTagId = tagIds[campaignTag.tag];
      if (!campaignTagId && campaignTag.autoCreate) {
        console.log(`[zeffy-webhook] Auto-creating tag: ${campaignTag.tag}`);
        const createResult = await acRequest('POST', 'tags', {
          tag: { tag: campaignTag.tag, tagType: 'contact' },
        });
        campaignTagId = createResult?.tag?.id;
        if (campaignTagId) tagIds[campaignTag.tag] = campaignTagId;
      }
      if (campaignTagId) {
        await addTag(contactId, campaignTagId);
      }
    }

    // Source tags
    if (payment.campaign_category === 'event') {
      if (tagIds['source:event']) await addTag(contactId, tagIds['source:event']);
    } else {
      if (tagIds['source:donation']) await addTag(contactId, tagIds['source:donation']);
    }

    const elapsed = Date.now() - startTime;
    console.log(`[zeffy-webhook] Done: ${email} in ${elapsed}ms`);

    return jsonResponse({
      success: true,
      contactId,
      isDonation: paymentIsDonation,
      tier: paymentIsDonation ? tier : null,
      trailing12mo: paymentIsDonation ? trailing12mo / 100 : null,
      donorTag: paymentIsDonation ? donorTag : null,
      campaignTag: campaignTagName,
    });
  } catch (err) {
    logError('zeffy-webhook', err);
    return jsonResponse({ success: true, note: 'Error logged' });
  }
}

// GET for health check
export async function GET() {
  return jsonResponse({ status: 'ok', service: 'ggi-zeffy-webhook', version: '2.0' });
}

// Reject other methods
export async function ALL() {
  return new Response('Method not allowed', { status: 405 });
}
