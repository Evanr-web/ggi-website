export const prerender = false;

import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from '../../lib/api-shared.js';

export async function OPTIONS({ request }) {
  return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
}

export async function POST({ request, locals }) {
  const env = locals.runtime.env;
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
    const eventName = sanitize(body.event, 200);
    const interestType = sanitize(body.interestType, 50);
    const message = sanitize(body.message, 1000);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName) {
      return jsonResponse({ error: 'First name is required' }, 400, origin);
    }

    const tags = ['19'];

    const eventTagMap = {
      'conference-2026': '11',
      'music-camp-2026': '12',
      'finances-101': '13',
      'masterclass': '23',
    };

    if (eventTagMap[eventName]) {
      tags.push(eventTagMap[eventName]);
    }

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: '6',
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
    logError('event-interest', err);
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
