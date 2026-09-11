// POST /api/lead-magnet — Generic lead magnet form handler (CMS-driven)
// Accepts tagName (string) from the form, looks up or creates the AC tag,
// then adds the contact with newsletter subscription + tags.
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

// Look up an AC tag by name; create it if it doesn't exist.
async function resolveTagId(env, tagName) {
  const AC_URL = env.AC_API_URL;
  const AC_KEY = env.AC_API_KEY;

  // Search for existing tag
  const searchRes = await fetch(
    `${AC_URL}/api/3/tags?search=${encodeURIComponent(tagName)}`,
    { headers: { 'Api-Token': AC_KEY } }
  );
  const searchData = await searchRes.json();
  const match = searchData?.tags?.find(
    (t) => t.tag.toLowerCase() === tagName.toLowerCase()
  );
  if (match) return match.id;

  // Tag doesn't exist — create it
  const createRes = await fetch(`${AC_URL}/api/3/tags`, {
    method: 'POST',
    headers: { 'Api-Token': AC_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag: { tag: tagName, tagType: 'contact', description: `Lead magnet: ${tagName}` },
    }),
  });
  const createData = await createRes.json();
  if (createData?.tag?.id) return createData.tag.id;

  throw new Error(`Failed to resolve or create tag "${tagName}"`);
}

// Resolve the "source:website" tag (ID 35 in current AC setup, but verify)
const SOURCE_WEBSITE_TAG_ID = '35';

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  let email;
  try {
    const body = await context.request.json();

    const turnstile = await verifyTurnstile(context.request, context.env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin);
    }

    email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);
    const tagName = sanitize(body.tagName, 100);
    const signupPage = sanitize(body.signup_page, 200);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }

    if (!tagName) {
      return jsonResponse({ error: 'Missing resource identifier' }, 400, origin);
    }

    // Look up the AC tag by name
    const tagId = await resolveTagId(context.env, tagName);

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '17',                        // Newsletter list
      tags: [tagId, SOURCE_WEBSITE_TAG_ID], // resource tag + source:website
      fields: {
        '21': 'Express',                   // Consent Status
        '22': tagName,                     // Lead Magnet Name
        '23': new Date().toISOString().slice(0, 10), // Signup Date
      },
      utmData: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        signup_page: signupPage || `/resources/${tagName}/`,
      },
    });

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('lead-magnet', err, { email: email ? 'present' : 'missing' });
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
