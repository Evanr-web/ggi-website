// POST /api/subscribe — Magnalia Letter signup
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  let email;
  try {
    const body = await context.request.json();

    // Turnstile verification
    const turnstile = await verifyTurnstile(context.request, context.env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    // Honeypot check
    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin); // silent reject
    }

    email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '4',
      tags: ['1'],
      utmData: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        signup_page: body.signup_page,
      },
    });

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('subscribe', err, { email: email ? 'present' : 'missing' });
    return jsonResponse({ error: 'Failed to subscribe' }, 500, origin);
  }
}
