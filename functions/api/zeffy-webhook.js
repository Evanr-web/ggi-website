// POST /api/zeffy-webhook — Receives Zeffy payment webhooks, syncs contacts to ActiveCampaign
import { addContact, logError } from './_shared.js';

// Map Zeffy form names (partial match) to AC tags
// UPDATE THESE TAG IDS after creating them in ActiveCampaign
const FORM_TAG_MAP = {
  'conference': [],      // TODO: add AC tag ID for conference-2026
  'magnalia-patron': [], // TODO: add AC tag ID for magnalia-patron
  'magnalia-journal-single': [],  // TODO: add AC tag ID for magnalia-buyer
  'magnalia-journal-annual': [],  // TODO: add AC tag ID for magnalia-subscriber
  'magnalia-journal-bulk': [],    // TODO: add AC tag ID for magnalia-bulk
  'donation': [],        // TODO: add AC tag ID for donor
};

// AC list for Zeffy contacts (set to your main list or a dedicated one)
// TODO: update this to the correct AC list ID
const ZEFFY_LIST_ID = '4'; // default: Magnalia Letter list

function matchFormTags(formName) {
  if (!formName) return [];
  const lower = formName.toLowerCase();
  for (const [key, tags] of Object.entries(FORM_TAG_MAP)) {
    if (lower.includes(key)) return tags;
  }
  return [];
}

// Extract contact info from Zeffy payload (best-effort — logs raw payload for tuning)
function extractContact(data) {
  // Zeffy may nest data differently — try common patterns
  const payment = data.payment || data.transaction || data.data || data;
  const payer = payment.payer || payment.buyer || payment.contact || payment.donor || payment;

  const email = payer.email || payment.email || data.email || '';
  const firstName = payer.firstName || payer.first_name || payment.firstName || data.firstName || '';
  const lastName = payer.lastName || payer.last_name || payment.lastName || data.lastName || '';
  const amount = payment.amount || payment.total || data.amount || 0;
  const formName = payment.formName || payment.form_name || payment.campaignName ||
                   payment.campaign_name || data.formName || data.form_name || '';
  const formType = payment.formType || payment.form_type || payment.type || data.type || '';

  return { email, firstName, lastName, amount, formName, formType };
}

export async function onRequestPost(context) {
  try {
    const rawBody = await context.request.text();

    // Log the raw payload so we can see exactly what Zeffy sends
    console.log('[zeffy-webhook] Raw payload:', rawBody);

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      console.error('[zeffy-webhook] Failed to parse JSON:', e.message);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('[zeffy-webhook] Parsed payload:', JSON.stringify(data, null, 2));

    const { email, firstName, lastName, amount, formName, formType } = extractContact(data);

    if (!email || !email.includes('@')) {
      console.warn('[zeffy-webhook] No valid email found in payload');
      // Still return 200 so Zeffy doesn't retry
      return new Response(JSON.stringify({ success: true, note: 'No email found, skipped AC sync' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Determine tags based on form name
    const tags = matchFormTags(formName);

    console.log('[zeffy-webhook] Syncing to AC:', { email, firstName, lastName, amount, formName, formType, tags });

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: ZEFFY_LIST_ID,
      tags,
    });

    console.log('[zeffy-webhook] AC contact synced:', contactId);

    return new Response(JSON.stringify({ success: true, contactId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    logError('zeffy-webhook', err);
    // Return 200 anyway to prevent Zeffy from retrying on our errors
    return new Response(JSON.stringify({ success: true, note: 'Error logged, will investigate' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Accept GET for webhook verification if Zeffy requires it
export async function onRequestGet(context) {
  return new Response(JSON.stringify({ status: 'ok', service: 'ggi-zeffy-webhook' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
