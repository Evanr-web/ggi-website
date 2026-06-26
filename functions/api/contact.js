// POST /api/contact — General contact form
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from './_shared.js';

const SUBJECT_TAGS = {
  general: '3',
  speaker: '4',
  magnalia: '5',
  programs: '6',
  support: '7',
  volunteering: '18',
  other: '3',
};

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

    const tagId = SUBJECT_TAGS[subject] || '3';

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '7',
      tags: [tagId],
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
    logError('contact', err, { email: email ? 'present' : 'missing' });
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
