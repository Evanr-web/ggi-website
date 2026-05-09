// POST /api/subscribe — Magnalia Letter signup
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const body = await context.request.json();

    // Honeypot check
    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin); // silent reject
    }

    const email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }

    const contactId = await addContact(context.env, {
      email,
      firstName,
      listId: '4',
      tags: ['1'],
    });

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Failed to subscribe' }, 500, origin);
  }
}
