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
    const name = sanitize(body.name, 200);
    const province = sanitize(body.province, 50);
    const city = sanitize(body.city, 100);
    const otherCity = sanitize(body.other_city, 100);
    const interest = sanitize(body.interest, 50);
    const hostCount = sanitize(body.host_count, 20);
    const wantsMagnalia = body.magnalia_letter === 'yes';

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!name) {
      return jsonResponse({ error: 'Name is required' }, 400, origin);
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const interestTagMap = {
      join: '29',
      waitlist: '30',
      host: '31',
      online: '29',
    };

    const tags = ['14'];
    if (interestTagMap[interest]) {
      tags.push(interestTagMap[interest]);
    }

    const lists = ['9'];
    if (wantsMagnalia) {
      lists.push('4');
      tags.push('interest:magnalia-letter');
    }

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: lists[0],
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

    if (wantsMagnalia && contactId) {
      const AC_URL = env.AC_API_URL;
      const AC_KEY = env.AC_API_KEY;
      await fetch(`${AC_URL}/api/3/contactLists`, {
        method: 'POST',
        headers: {
          'Api-Token': AC_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactList: { list: '4', contact: contactId, status: 1 },
        }),
      });
    }

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('book-study', err);
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
