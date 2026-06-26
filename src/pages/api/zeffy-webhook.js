export const prerender = false;

import { env } from 'cloudflare:workers';
import { addContact, jsonResponse, logError } from '../../lib/api-shared.js';

/**
 * POST /api/zeffy-webhook/
 *
 * Receives payment.completed events from Zeffy and syncs the
 * buyer/registrant into ActiveCampaign with proper tags and lists.
 *
 * Zeffy webhook payload (payment.completed):
 * {
 *   "event": "payment.completed",
 *   "data": {
 *     "id": "pay_...",
 *     "amount": 8000,        // cents
 *     "currency": "cad",
 *     "status": "succeeded",
 *     "buyer": {
 *       "firstName": "...",
 *       "lastName": "...",
 *       "email": "...",
 *       "phone": "..."
 *     },
 *     "lineItems": [
 *       {
 *         "name": "Conference Registration",
 *         "campaign": { "id": "...", "title": "..." },
 *         "quantity": 1,
 *         "unitAmount": 8000
 *       }
 *     ],
 *     "campaign": {
 *       "id": "...",
 *       "title": "2nd Annual Renewing Culture Conference"
 *     }
 *   }
 * }
 */

// Map Zeffy campaign titles (or IDs) to AC tags and lists
// Update this when new paid events/campaigns are created in Zeffy
const CAMPAIGN_MAP = {
  // Conference
  'conference': {
    listId: '6',       // Event Attendees
    tags: ['11', '19'], // event-conference-2026, source:website-form
    tagLabel: 'conference-2026-registered',
  },
  // Music Camp
  'music': {
    listId: '6',
    tags: ['12', '19'], // event-music-camp-2026, source:website-form
    tagLabel: 'music-camp-2026-registered',
  },
  // Magnalia Journal Subscription
  'magnalia': {
    listId: '4',       // Magnalia Letter
    tags: ['1', '19'], // magnalia-letter, source:website-form
    tagLabel: 'magnalia-subscriber',
  },
  // Donation / Friend / Patron — general giving
  'donation': {
    listId: '10',      // Donors (create this list in AC)
    tags: ['19'],      // source:website-form
    tagLabel: 'donor',
  },
};

// Match a Zeffy campaign to our mapping by searching the title
function matchCampaign(campaignTitle) {
  if (!campaignTitle) return CAMPAIGN_MAP['donation']; // default

  const title = campaignTitle.toLowerCase();

  if (title.includes('conference') || title.includes('renewing culture')) {
    return CAMPAIGN_MAP['conference'];
  }
  if (title.includes('music') || title.includes('camp')) {
    return CAMPAIGN_MAP['music'];
  }
  if (title.includes('magnalia') || title.includes('journal') || title.includes('subscription')) {
    return CAMPAIGN_MAP['magnalia'];
  }
  // Default: treat as donation
  return CAMPAIGN_MAP['donation'];
}

export async function POST({ request }) {
  // Verify the webhook is from Zeffy using a shared secret
  const authHeader = request.headers.get('Authorization');
  const expectedToken = env.ZEFFY_WEBHOOK_SECRET;

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    console.error('[zeffy-webhook] Unauthorized request');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = await request.json();

    // Only process payment.completed events
    const eventType = payload.event || payload.type;
    if (eventType !== 'payment.completed') {
      // Acknowledge but ignore other event types
      return jsonResponse({ received: true, skipped: eventType });
    }

    const data = payload.data || payload;
    const buyer = data.buyer || data.payer || {};
    const campaign = data.campaign || data.lineItems?.[0]?.campaign || {};

    const email = buyer.email;
    const firstName = buyer.firstName || buyer.first_name || '';
    const lastName = buyer.lastName || buyer.last_name || '';

    if (!email) {
      console.error('[zeffy-webhook] No email in payload');
      return jsonResponse({ error: 'No email in payload' }, 400);
    }

    // Match the Zeffy campaign to AC tags/lists
    const mapping = matchCampaign(campaign.title || campaign.name);

    // Sync to ActiveCampaign
    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: mapping.listId,
      tags: mapping.tags,
      utmData: {
        utm_source: 'zeffy',
        utm_medium: 'payment',
        utm_campaign: campaign.title || 'unknown',
        signup_page: 'zeffy-webhook',
      },
    });

    console.log(`[zeffy-webhook] Synced ${email} to AC (contact ${contactId}, campaign: ${campaign.title})`);

    return jsonResponse({
      received: true,
      contactId,
      campaign: campaign.title,
      mapped: mapping.tagLabel,
    });
  } catch (err) {
    logError('zeffy-webhook', err);
    // Return 200 anyway to prevent Zeffy retries on our errors
    // (we don't want to lose the event, but retries on AC failures are noisy)
    return jsonResponse({ received: true, error: err.message }, 200);
  }
}

// Reject non-POST methods
export async function ALL({ request }) {
  return new Response('Method not allowed', { status: 405 });
}
