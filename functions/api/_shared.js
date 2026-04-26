// Shared utilities for Cloudflare Pages Functions
// ActiveCampaign API helper

export async function addContact(env, { email, firstName, lastName, listId, tags = [], fields = {} }) {
  const AC_URL = env.AC_API_URL;
  const AC_KEY = env.AC_API_KEY;

  // 1. Create or update contact
  const contactRes = await fetch(`${AC_URL}/api/3/contact/sync`, {
    method: 'POST',
    headers: {
      'Api-Token': AC_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contact: {
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        fieldValues: Object.entries(fields).map(([field, value]) => ({ field, value })),
      },
    }),
  });

  const contactData = await contactRes.json();
  const contactId = contactData?.contact?.id;

  if (!contactId) {
    throw new Error('Failed to create contact');
  }

  // 2. Subscribe to list
  if (listId) {
    await fetch(`${AC_URL}/api/3/contactLists`, {
      method: 'POST',
      headers: {
        'Api-Token': AC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactList: {
          list: listId,
          contact: contactId,
          status: 1, // subscribed
        },
      }),
    });
  }

  // 3. Add tags
  for (const tagId of tags) {
    await fetch(`${AC_URL}/api/3/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': AC_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactTag: {
          contact: contactId,
          tag: tagId,
        },
      }),
    });
  }

  return contactId;
}

export function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function jsonResponse(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}
