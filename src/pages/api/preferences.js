export const prerender = false;

import { env } from 'cloudflare:workers';
import { jsonResponse, corsHeaders, isValidEmail, sanitize, logError } from '../../lib/api-shared.js';

// Interest checkbox values → AC tag IDs
const INTEREST_TAG_MAP = {
  'magnalia-journal': '24',   // interest:magnalia-journal
  'events':           '32',   // interest:events
  'book-studies':     '54',   // interest:book-study
  'courses':          '51',   // interest:courses
};

export async function OPTIONS({ request }) {
  return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
}

export async function POST({ request }) {
  const origin = request.headers.get('Origin');

  try {
    const body = await request.json();

    const email = sanitize(body.email, 254);
    const interests = Array.isArray(body.interests) ? body.interests : [];

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }

    const AC_URL = env.AC_API_URL;
    const AC_KEY = env.AC_API_KEY;
    if (!AC_URL || !AC_KEY) {
      throw new Error('ActiveCampaign environment variables not configured');
    }

    const acHeaders = { 'Api-Token': AC_KEY, 'Content-Type': 'application/json' };

    // Look up contact by email
    const searchRes = await fetch(`${AC_URL}/api/3/contacts?email=${encodeURIComponent(email)}`, {
      headers: { 'Api-Token': AC_KEY },
    });
    const searchData = await searchRes.json();
    const contact = (searchData.contacts || [])[0];

    if (!contact) {
      return jsonResponse({ error: 'We couldn\'t find your email. Please check and try again.' }, 404, origin);
    }

    const contactId = contact.id;

    // Get all possible interest tag IDs
    const allInterestTagIds = Object.values(INTEREST_TAG_MAP);

    // Get current tags on the contact
    const tagsRes = await fetch(`${AC_URL}/api/3/contacts/${contactId}/contactTags`, {
      headers: { 'Api-Token': AC_KEY },
    });
    const tagsData = await tagsRes.json();
    const currentContactTags = tagsData.contactTags || [];

    // Remove interest tags that are no longer selected
    for (const ct of currentContactTags) {
      if (allInterestTagIds.includes(ct.tag)) {
        const interestKey = Object.entries(INTEREST_TAG_MAP).find(([, id]) => id === ct.tag)?.[0];
        if (interestKey && !interests.includes(interestKey)) {
          // Contact has this tag but didn't select it — remove
          await fetch(`${AC_URL}/api/3/contactTags/${ct.id}`, {
            method: 'DELETE',
            headers: { 'Api-Token': AC_KEY },
          });
        }
      }
    }

    // Add selected interest tags
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
        // Best-effort
      }
    }

    return jsonResponse({ success: true }, 200, origin);
  } catch (err) {
    logError('preferences', err, {});
    return jsonResponse({ error: 'Failed to save preferences' }, 500, origin);
  }
}
