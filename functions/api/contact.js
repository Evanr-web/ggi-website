// POST /api/contact — General contact form
import { addContact, jsonResponse, corsHeaders } from './_shared.js';

// Map subject dropdown values to tag IDs
const SUBJECT_TAGS = {
  general: '3',    // contact-general
  speaker: '4',    // contact-speaker-booking
  magnalia: '5',   // contact-magnalia
  programs: '6',   // contact-programs
  support: '7',    // contact-support
  other: '3',      // contact-general
};

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const body = await context.request.json();
    const { email, firstName, lastName, subject, message } = body;

    if (!email || !message) {
      return jsonResponse({ error: 'Email and message are required' }, 400, origin);
    }

    const tagId = SUBJECT_TAGS[subject] || '3';

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '7', // General Contact list
      tags: [tagId],
    });

    // Send notification email to Victor via AC or fallback
    // For now, contacts appear in AC with tags — Victor monitors the list
    // TODO: Set up AC automation to email Victor on new contact

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Failed to submit' }, 500, origin);
  }
}
