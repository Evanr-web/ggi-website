// POST /api/event-interest — Event registration / "Get Notified" signups
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const body = await context.request.json();

    // Turnstile verification
    const turnstile = await verifyTurnstile(context.request, context.env, body);
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
    const interestType = sanitize(body.interestType, 50); // 'notify' | 'register'
    const message = sanitize(body.message, 1000);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName) {
      return jsonResponse({ error: 'First name is required' }, 400, origin);
    }

    // Build tags based on event
    const tags = ['19']; // source:website-form

    // Map event slugs to interest tags
    const eventTagMap = {
      'conference-2026': '11',  // event-conference-2026
      'music-camp-2026': '12',  // event-music-camp-2026
      'finances-101': '13',     // event-finances-101
      'masterclass': '23',      // interest:masterclass
    };

    if (eventTagMap[eventName]) {
      tags.push(eventTagMap[eventName]);
    }

    // List 6 = Event Attendees
    const contactId = await addContact(context.env, {
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
