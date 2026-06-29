// POST /api/subscribe-enrich — Phase 2 enrichment (update existing contact)
import { jsonResponse, corsHeaders, sanitize, checkHoneypot, logError, verifyTurnstile } from './_shared.js';

// Phase 2 interest → AC tag ID mapping
const INTEREST_TAGS = {
  'magnalia-journal': '24',
  'events': '32',
  'book-studies': '14',
};

// Phase 2 address → AC custom field ID mapping
const ADDRESS_FIELDS = {
  streetAddress: '9',
  city: '10',
  province: '11',
  postalCode: '12',
};

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  let contactId;
  try {
    const body = await context.request.json();

    // Turnstile verification
    const turnstile = await verifyTurnstile(context.request, context.env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    // Honeypot check
    if (checkHoneypot(body)) {
      return jsonResponse({ success: true }, 200, origin);
    }

    contactId = sanitize(body.contactId, 20);
    if (!contactId) {
      return jsonResponse({ error: 'Missing contact ID' }, 400, origin);
    }

    const AC_URL = context.env.AC_API_URL;
    const AC_KEY = context.env.AC_API_KEY;

    if (!AC_URL || !AC_KEY) {
      throw new Error('ActiveCampaign environment variables not configured');
    }

    // Build field values for address
    const fieldValues = [];
    const lastName = sanitize(body.lastName, 100);
    const streetAddress = sanitize(body.streetAddress, 200);
    const city = sanitize(body.city, 100);
    const province = sanitize(body.province, 100);
    const postalCode = sanitize(body.postalCode, 10);

    if (streetAddress) fieldValues.push({ field: ADDRESS_FIELDS.streetAddress, value: streetAddress });
    if (city) fieldValues.push({ field: ADDRESS_FIELDS.city, value: city });
    if (province) fieldValues.push({ field: ADDRESS_FIELDS.province, value: province });
    if (postalCode) fieldValues.push({ field: ADDRESS_FIELDS.postalCode, value: postalCode });

    // Update contact with lastName and address fields if any provided
    if (lastName || fieldValues.length > 0) {
      const updatePayload = { contact: {} };
      if (lastName) updatePayload.contact.lastName = lastName;
      if (fieldValues.length > 0) updatePayload.contact.fieldValues = fieldValues;

      await fetch(`${AC_URL}/api/3/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Api-Token': AC_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });
    }

    // Add interest tags
    const interests = Array.isArray(body.interests) ? body.interests : [];
    for (const interest of interests) {
      const tagId = INTEREST_TAGS[interest];
      if (tagId) {
        await fetch(`${AC_URL}/api/3/contactTags`, {
          method: 'POST',
          headers: {
            'Api-Token': AC_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contactTag: {
              contact: contactId,
              tag: tagId,
            },
          }),
        });
      }
    }

    return jsonResponse({ success: true }, 200, origin);
  } catch (err) {
    logError('subscribe-enrich', err, { contactId: contactId || 'missing' });
    return jsonResponse({ error: 'Failed to update profile' }, 500, origin);
  }
}
