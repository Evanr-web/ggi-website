// POST /api/book-study — Inklings Club / Book Study signup
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const body = await context.request.json();

    const turnstile = await verifyTurnstile(context.request, context.env, body);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    if (checkHoneypot(body)) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin);
    }

    const email = sanitize(body.email, 254);
    const name = sanitize(body.name, 200);
    const interest = sanitize(body.interest, 50);
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

    // Tags: interest:book-study + source:website + specific interest type
    const tags = ['54', '35'];  // interest:book-study, source:website

    const interestTagMap = {
      join: '29',      // book-study:join
      waitlist: '30',  // book-study:waitlist
      host: '31',      // book-study:host (→ also role:book-study-leader)
      online: '29',    // book-study:join
    };

    if (interestTagMap[interest]) {
      tags.push(interestTagMap[interest]);
    }
    if (interest === 'host') {
      tags.push('62');  // role:book-study-leader
    }

    // Subscribe to Institute Events list (book studies are events)
    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '18',              // Institute Events (new)
      tags,
      fields: {
        '21': 'Express',
        '22': 'book-study-form',
        '23': new Date().toISOString().slice(0, 10),
      },
      utmData: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        signup_page: body.signup_page,
      },
    });

    // Also subscribe to Newsletter if they opted in
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
          contactList: { list: '17', contact: contactId, status: 1 },
        }),
      });
    }

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('book-study', err);
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
