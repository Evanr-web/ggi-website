// POST /api/event-interest — Event "Get Notified" / interest signups
import { addContact, resolveTagByName, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, logError, verifyTurnstile } from './_shared.js';

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
    const firstName = sanitize(body.firstName, 100);
    const lastName = sanitize(body.lastName, 100);

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName) {
      return jsonResponse({ error: 'First name is required' }, 400, origin);
    }

    // Tags: source:website + interest:events (base)
    const tags = ['35', '32'];  // source:website, interest:events

    // Map specific event interests to tags
    const eventTagMap = {
      'conference': '74',        // campaign:conference-2026
      'music-camp': '12',        // event-music-camp-2026 (legacy, keep for now)
      'masterclass': '23',       // interest:masterclass
      'book-study': '54',        // interest:book-study
    };

    const events = Array.isArray(body.events) ? body.events : (body.event ? [body.event] : []);
    for (const eventSlug of events) {
      const slug = sanitize(eventSlug, 100);
      if (eventTagMap[slug]) {
        tags.push(eventTagMap[slug]);
      }
    }

    // Per-event notify tag (e.g. "interest:book-study-beauty") — applied as a
    // free-form AC tag so the team can segment by specific event interest
    const notifyTag = sanitize(body.notifyTag, 100);
    // Also detect book-study notify tags and add the general book-study interest tag
    if (notifyTag && notifyTag.startsWith('interest:book-study')) {
      tags.push('54');  // interest:book-study
    }

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '18',              // Institute Events (new)
      tags,
      fields: {
        '21': 'Express',         // Consent Status (they asked to be notified)
        '22': 'event-interest-form',
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

    // Apply per-event notifyTag (e.g. "interest:book-study-beauty") as a named AC tag
    if (notifyTag && contactId) {
      try {
        const tagId = await resolveTagByName(context.env, notifyTag);
        if (tagId) {
          const AC_URL = context.env.AC_API_URL;
          const AC_KEY = context.env.AC_API_KEY;
          await fetch(`${AC_URL}/api/3/contactTags`, {
            method: 'POST',
            headers: { 'Api-Token': AC_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactTag: { contact: contactId, tag: tagId } }),
          });
        }
      } catch (tagErr) {
        logError('event-interest:notifyTag', tagErr);
        // Non-fatal — contact is already created
      }
    }

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    logError('event-interest', err);
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
