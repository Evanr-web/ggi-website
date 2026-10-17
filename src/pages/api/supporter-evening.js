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

    const intent = sanitize(body.intent, 20); // 'attend' or 'host'
    const email = sanitize(body.email, 254);
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);
    const phone = sanitize(body.phone, 30);
    const city = sanitize(body.city, 100);
    const message = sanitize(body.message, 2000);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName) {
      return jsonResponse({ error: 'First name is required' }, 400, origin);
    }

    // Tags: source:website (35), interest:events (32)
    // + supporter-evening-attend or supporter-evening-host (create these in AC)
    const tags = ['35', '32'];

    // Notes to attach to contact
    let noteLines = [`Supporter Evening — ${intent === 'host' ? 'HOST' : 'ATTEND'}`];

    if (intent === 'attend') {
      const guestCount = sanitize(body.guestCount, 10);
      const dietary = sanitize(body.dietary, 200);

      // Tag: supporter-evening-attend — SET THIS ID AFTER CREATING IN AC
      if (body.tagAttend) tags.push(body.tagAttend);

      noteLines.push(`City: ${city}`);
      noteLines.push(`Guests: ${guestCount}`);
      if (dietary) noteLines.push(`Dietary: ${dietary}`);
      if (phone) noteLines.push(`Phone: ${phone}`);
      if (message) noteLines.push(`Message: ${message}`);
    } else if (intent === 'host') {
      const preferredDate = sanitize(body.preferredDate, 200);
      const capacity = sanitize(body.capacity, 20);
      const venueDetails = sanitize(body.venueDetails, 1000);

      // Tag: supporter-evening-host — SET THIS ID AFTER CREATING IN AC
      if (body.tagHost) tags.push(body.tagHost);

      noteLines.push(`City: ${city}`);
      noteLines.push(`Preferred Date: ${preferredDate}`);
      noteLines.push(`Capacity: ${capacity}`);
      if (phone) noteLines.push(`Phone: ${phone}`);
      if (venueDetails) noteLines.push(`Venue: ${venueDetails}`);
      if (message) noteLines.push(`Message: ${message}`);
    }

    const contactId = await addContact(env, {
      email,
      firstName,
      lastName,
      listId: '18', // Institute Events list
      tags,
      fields: {},
      utmData: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        signup_page: 'supporter-evenings',
      },
    });

    // Add a note to the contact with the details
    if (contactId && contactId !== 'ok') {
      try {
        const AC_URL = env.AC_API_URL;
        const AC_KEY = env.AC_API_KEY;
        await fetch(`${AC_URL}/api/3/notes`, {
          method: 'POST',
          headers: {
            'Api-Token': AC_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: {
              note: noteLines.join('\n'),
              relid: contactId,
              reltype: 'Subscriber',
            },
          }),
        });
      } catch (noteErr) {
        // Non-fatal — contact was still created
        logError('supporter-evening-note', noteErr);
      }
    }

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('supporter-evening', err);
    return jsonResponse({ error: 'Something went wrong. Please try again.' }, 500, origin);
  }
}
