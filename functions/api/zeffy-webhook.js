// POST /api/zeffy-webhook — Receives Zeffy payment.completed webhooks, syncs contacts to ActiveCampaign
//
// Zeffy PaymentCompletedEvent schema:
// {
//   id: uuid,
//   type: "payment.completed",
//   version: 1,
//   dispatchedAt: ISO-8601,
//   data: Payment {
//     buyer: { email, first_name, last_name, is_corporate, company_name },
//     description: "Campaign title",
//     campaign_category: "auction|donation|event|raffle|membership|peer_to_peer|shop|custom",
//     campaign_id: uuid,
//     amount: cents,
//     items: [{ type: "donation|ticket|additional_donation", amount, recurrence_interval }],
//     recurring: { ... } | null,
//     ...
//   }
// }

import { addContact, logError } from './_shared.js';

// Map campaign descriptions (partial match, lowercase) to AC tag IDs
// TODO: Create these tags in AC and fill in the IDs
const CAMPAIGN_TAG_MAP = {
  'conference': [],                    // conference-2026
  'magnalia-patron': [],               // magnalia-patron
  'magnalia-journal-single': [],       // magnalia-buyer
  'magnalia-journal-annual': [],       // magnalia-subscriber
  'magnalia-journal-bulk': [],         // magnalia-bulk
};

// Fallback tags by campaign_category
const CATEGORY_TAG_MAP = {
  'donation': [],   // general donor tag
  'event': [],      // event registrant tag
};

// AC list for Zeffy contacts
// TODO: update to correct AC list ID (or create a dedicated Zeffy list)
const ZEFFY_LIST_ID = '4';

function getTagsForPayment(payment) {
  const tags = [];
  const description = (payment.description || '').toLowerCase();

  // Try matching campaign description first (most specific)
  for (const [key, tagIds] of Object.entries(CAMPAIGN_TAG_MAP)) {
    if (description.includes(key)) {
      tags.push(...tagIds);
      return tags; // return on first match
    }
  }

  // Fall back to campaign category
  const category = payment.campaign_category || '';
  const categoryTags = CATEGORY_TAG_MAP[category] || [];
  tags.push(...categoryTags);

  return tags;
}

export async function onRequestPost(context) {
  try {
    const rawBody = await context.request.text();

    // Log raw payload for debugging (visible in Cloudflare dashboard → Functions → Logs)
    console.log('[zeffy-webhook] Raw payload:', rawBody);

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch (e) {
      console.error('[zeffy-webhook] Invalid JSON:', e.message);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate event structure
    if (event.type !== 'payment.completed' || !event.data) {
      console.log('[zeffy-webhook] Ignoring event type:', event.type);
      return new Response(JSON.stringify({ success: true, note: 'Event type ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payment = event.data;
    const buyer = payment.buyer || {};

    const email = buyer.email || '';
    const firstName = buyer.first_name || '';
    const lastName = buyer.last_name || '';

    if (!email || !email.includes('@')) {
      console.warn('[zeffy-webhook] No valid email in buyer:', JSON.stringify(buyer));
      return new Response(JSON.stringify({ success: true, note: 'No email, skipped AC sync' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tags = getTagsForPayment(payment);
    const amountDollars = (payment.amount || 0) / 100;
    const isRecurring = !!payment.recurring;
    const campaignCategory = payment.campaign_category || 'unknown';
    const campaignTitle = payment.description || 'Unknown';

    console.log('[zeffy-webhook] Syncing to AC:', {
      email,
      firstName,
      lastName,
      amount: amountDollars,
      campaign: campaignTitle,
      category: campaignCategory,
      recurring: isRecurring,
      tags,
    });

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
    // Return 200 to prevent Zeffy from retrying on our errors
    return new Response(JSON.stringify({ success: true, note: 'Error logged' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// GET for health check / webhook verification
export async function onRequestGet() {
  return new Response(JSON.stringify({ status: 'ok', service: 'ggi-zeffy-webhook' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
