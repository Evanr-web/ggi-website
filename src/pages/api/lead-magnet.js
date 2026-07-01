export const prerender = false;

import { env } from 'cloudflare:workers';
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from '../../lib/api-shared.js';

// Look up an AC tag by name; create it if it doesn't exist. Returns the tag ID string.
async function resolveTagId(tagName) {
  const AC_URL = env.AC_API_URL;
  const AC_KEY = env.AC_API_KEY;

  // Search for existing tag
  const searchRes = await fetch(`${AC_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`, {
    headers: { 'Api-Token': AC_KEY },
  });
  const searchData = await searchRes.json();

  // Find exact match (search is fuzzy)
  const exact = (searchData.tags || []).find(
    (t) => t.tag.toLowerCase() === tagName.toLowerCase()
  );
  if (exact) return exact.id;

  // Create the tag if it doesn't exist
  const createRes = await fetch(`${AC_URL}/api/3/tags`, {
    method: 'POST',
    headers: {
      'Api-Token': AC_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag: {
        tag: tagName,
        tagType: 'contact',
        description: `Lead magnet: ${tagName}`,
      },
    }),
  });
  const createData = await createRes.json();
  const newId = createData?.tag?.id;
  if (!newId) throw new Error(`Failed to create AC tag: ${tagName}`);
  return newId;
}

export async function OPTIONS({ request }) {
  return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
}

export async function POST({ request }) {
  const origin = request.headers.get('Origin');

  let email;
  try {
    const body = await request.json();

    // Turnstile verification
    const turnstile = await verifyTurnstile(request, env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    // Honeypot check
    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin);
    }

    email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);
    const tagName = sanitize(body.tagName, 100);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }

    if (!tagName) {
      return jsonResponse({ error: 'Missing tag configuration' }, 400, origin);
    }

    // Resolve tag name → ID (creates tag in AC if needed)
    const tagId = await resolveTagId(tagName);

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: '4',
      tags: ['1', tagId],  // 1 = newsletter, resolved lead magnet tag
      utmData: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        signup_page: body.signup_page || '',
      },
    });

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('lead-magnet', err, { email: email ? 'present' : 'missing' });
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
