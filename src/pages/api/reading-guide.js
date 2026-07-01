export const prerender = false;

import { env } from 'cloudflare:workers';
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from '../../lib/api-shared.js';

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

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: '4',
      tags: ['1', '33'],  // 1 = newsletter, 33 = reading-guide
      utmData: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        signup_page: body.signup_page || '/resources/roadmap/',
      },
    });

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('reading-guide', err, { email: email ? 'present' : 'missing' });
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
