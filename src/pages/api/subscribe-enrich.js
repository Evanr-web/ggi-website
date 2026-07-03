export const prerender = false;

import { env } from 'cloudflare:workers';
import { jsonResponse, corsHeaders, sanitize, checkHoneypot, logError, verifyTurnstile } from '../../lib/api-shared.js';

// Map phase-2 interest checkbox values → AC tag IDs
// Source: GET /api/3/tags (queried 2026-07-03)
const INTEREST_TAG_MAP = {
  'magnalia-journal': '24',  // interest:magnalia-journal
  'events':          '32',   // interest:events
  'book-studies':    '14',   // book-study
  'news':            '1',    // magnalia-letter (general newsletter)
};

export async function OPTIONS({ request }) {
  return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
}

export async function POST({ request }) {
  const origin = request.headers.get('Origin');

  try {
    const body = await request.json();

    // Turnstile verification
    const turnstile = await verifyTurnstile(request, env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    if (checkHoneypot(body)) {
      return jsonResponse({ success: true }, 200, origin);
    }

    const contactId = body.contactId;
    if (!contactId) {
      return jsonResponse({ error: 'Missing contact reference' }, 400, origin);
    }

    const AC_URL = env.AC_API_URL;
    const AC_KEY = env.AC_API_KEY;
    if (!AC_URL || !AC_KEY) {
      throw new Error('ActiveCampaign environment variables not configured');
    }

    const acHeaders = { 'Api-Token': AC_KEY, 'Content-Type': 'application/json' };

    const lastName = sanitize(body.lastName, 100);
    const streetAddress = sanitize(body.streetAddress, 200);
    const city = sanitize(body.city, 100);
    const province = sanitize(body.province, 50);
    const postalCode = sanitize(body.postalCode, 10);
    const interests = Array.isArray(body.interests) ? body.interests : [];

    // 1. Update contact (lastName + address custom fields)
    // AC custom field IDs: 9=Street Address, 10=City, 11=Province, 12=Postal Code
    const fieldValues = [];
    if (streetAddress) fieldValues.push({ field: '9', value: streetAddress });
    if (city) fieldValues.push({ field: '10', value: city });
    if (province) fieldValues.push({ field: '11', value: province });
    if (postalCode) fieldValues.push({ field: '12', value: postalCode });

    const contactUpdate = {};
    if (lastName) contactUpdate.lastName = lastName;
    if (fieldValues.length > 0) contactUpdate.fieldValues = fieldValues;

    if (Object.keys(contactUpdate).length > 0) {
      await fetch(`${AC_URL}/api/3/contacts/${contactId}`, {
        method: 'PUT',
        headers: acHeaders,
        body: JSON.stringify({ contact: contactUpdate }),
      });
    }

    // 2. Add interest tags
    for (const interest of interests) {
      const tagId = INTEREST_TAG_MAP[interest];
      if (!tagId) continue;
      try {
        await fetch(`${AC_URL}/api/3/contactTags`, {
          method: 'POST',
          headers: acHeaders,
          body: JSON.stringify({ contactTag: { contact: contactId, tag: tagId } }),
        });
      } catch {
        // Best-effort — don't fail the whole request for one tag
      }
    }

    return jsonResponse({ success: true }, 200, origin);
  } catch (err) {
    logError('subscribe-enrich', err, {});
    return jsonResponse({ error: 'Failed to save preferences' }, 500, origin);
  }
}
