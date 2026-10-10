export const prerender = false;

import { env } from 'cloudflare:workers';
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from '../../lib/api-shared.js';

const SUBJECT_TAGS = {
  general: '35',           // source:website (default)
  speaker: '25',           // interest:speaker-booking
  magnalia: '24',          // interest:magnalia-journal
  programs: '32',          // interest:events
  support: '35',           // source:website (default)
  volunteering: '26',      // interest:volunteering
  other: '35',             // source:website (default)
};

export async function OPTIONS({ request }) {
  return new Response(null, { headers: corsHeaders(request.headers.get('Origin')) });
}

export async function POST({ request }) {
  const origin = request.headers.get('Origin');

  let email;
  try {
    const body = await request.json();

    const turnstile = await verifyTurnstile(request, env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin);
    }

    email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);
    const subject = sanitize(body.subject, 50);
    const message = sanitize(body.message, 2000);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!message) {
      return jsonResponse({ error: 'Message is required' }, 400, origin);
    }

    const tagId = SUBJECT_TAGS[subject] || '35';

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: null,            // No list for general contact — tag-based
      tags: ['35', '48', tagId],  // source:website, donor:prospect, subject tag
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
    logError('contact', err, { email: typeof email !== 'undefined' ? 'present' : 'missing' });
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
