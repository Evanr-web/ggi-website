export const prerender = false;

import { env } from 'cloudflare:workers';
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from '../../lib/api-shared.js';

export async function OPTIONS({ request }) {
  return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
}

export async function POST({ request }) {
  const origin = request.headers.get('Origin');

  try {
    const body = await request.json();

    const turnstile = await verifyTurnstile(request, env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin);
    }

    const email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);
    const phone = sanitize(body.phone, 30);
    const message = sanitize(body.message, 2000);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName || !lastName) {
      return jsonResponse({ error: 'Full name is required' }, 400, origin);
    }

    const tags = ['27', '19'];

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: '3',
      tags,
      fields: {},
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
    logError('leadership', err);
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
