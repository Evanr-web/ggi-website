// POST /api/book-study — Inklings Club / Book Study signup
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

    // Split name into first/last
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Map interest type to status tag
    const interestTagMap = {
      join: '29',    // book-study:join
      waitlist: '30', // book-study:waitlist
      host: '31',    // book-study:host
      online: '29',  // book-study:join
    };

    const tags = ['14']; // book-study (base interest tag)
    if (interestTagMap[interest]) {
      tags.push(interestTagMap[interest]);
    }

    // Lists: Book Study (9) + optionally Magnalia Letter (4)
    const lists = ['9'];
    if (wantsMagnalia) {
      lists.push('4');
      tags.push('interest:magnalia-letter');
    }

    // Add to primary list (Book Study)
    const contactId = await addContact(context.env, {
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

    // Subscribe to Magnalia Letter list if checked
    if (wantsMagnalia && contactId) {
      const AC_URL = context.env.AC_API_URL;
      const AC_KEY = context.env.AC_API_KEY;
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
