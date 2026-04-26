// POST /api/subscribe — Magnalia Letter signup
import { addContact, jsonResponse, corsHeaders } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const body = await context.request.json();
    const { email, firstName } = body;

    if (!email) {
      return jsonResponse({ error: 'Email is required' }, 400, origin);
    }

    const contactId = await addContact(context.env, {
      email,
      firstName,
      listId: '4', // Magnalia Letter list
      tags: ['1'],  // magnalia-letter tag
    });

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Failed to subscribe' }, 500, origin);
  }
}
