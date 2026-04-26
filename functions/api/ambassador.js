// POST /api/ambassador — Ambassador application
import { addContact, jsonResponse, corsHeaders } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const body = await context.request.json();
    const { email, firstName, lastName, city, province, connection, community, ideas } = body;

    if (!email || !firstName || !lastName) {
      return jsonResponse({ error: 'Name and email are required' }, 400, origin);
    }

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '5', // Ambassador Applications list
      tags: ['2'],  // ambassador tag
    });

    // Note: city, province, connection, community, ideas are captured
    // but AC custom fields need to be created in dashboard first.
    // For now, the contact is tagged and listed — Victor follows up.
    // TODO: Create custom fields in AC and map them here.

    return jsonResponse({ success: true, contactId }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Failed to submit application' }, 500, origin);
  }
}
