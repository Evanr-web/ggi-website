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
    const eventName = sanitize(body.event, 200);
    const interestType = sanitize(body.interestType, 50);
    const message = sanitize(body.message, 1000);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName) {
      return jsonResponse({ error: 'First name is required' }, 400, origin);
    }

    const tags = ['35', '32'];  // source:website, interest:events

    const eventTagMap = {
      'conference': '74',        // campaign:conference-2026
      'conference-2026': '74',   // campaign:conference-2026
      'music-camp': '12',        // event:music-camp-2026
      'music-camp-2026': '12',   // event:music-camp-2026
      'finances-101': '13',      // event:finances-101
      'masterclass': '23',       // interest:masterclass
      'book-study': '54',        // interest:book-study
    };

    const events = Array.isArray(body.events) ? body.events : (body.event ? [body.event] : [eventName].filter(Boolean));
    for (const ev of events) {
      const slug = sanitize(ev, 100);
      if (eventTagMap[slug]) {
        tags.push(eventTagMap[slug]);
      }
    }

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: '18',              // Institute Events
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
