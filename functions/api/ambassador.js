// POST /api/ambassador — Ambassador application
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const body = await context.request.json();

    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin);
    }

    const email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);
    const city = sanitize(body.city, 100);
    const province = sanitize(body.province, 100);
    const connection = sanitize(body.connection, 1000);
    const community = sanitize(body.community, 1000);
    const ideas = sanitize(body.ideas, 1000);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName || !lastName) {
      return jsonResponse({ error: 'Name is required' }, 400, origin);
    }

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '5',
      tags: ['2'],
    });

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Failed to submit application' }, 500, origin);
  }
}
