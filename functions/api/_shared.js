// Shared utilities for Cloudflare Pages Functions
// ActiveCampaign API helper

// UTM custom field ID mapping — update these after creating fields in ActiveCampaign
// To find IDs: AC dashboard → Settings → Custom Fields, or GET /api/3/fields
const UTM_FIELD_IDS = {
  first_source: '2',
  first_medium: '3',
  first_campaign: '4',
  last_source: '5',
  last_medium: '6',
  last_campaign: '7',
  signup_page: '8',
};

export async function addContact(env, { email, firstName, lastName, listId, tags = [], fields = {}, utmData = {} }) {
  const AC_URL = env.AC_API_URL;
  const AC_KEY = env.AC_API_KEY;

  // Build field values from explicit fields + UTM data
  const fieldValues = Object.entries(fields).map(([field, value]) => ({ field, value }));

  // Append UTM fields if we have field IDs configured
  // first_* fields: set only on first contact creation (AC handles via "overwrite: 0" below)
  // last_* fields: always overwrite
  if (utmData.utm_source) {
    if (UTM_FIELD_IDS.first_source) {
      fieldValues.push({ field: UTM_FIELD_IDS.first_source, value: utmData.utm_source, overwrite: 0 });
    }
    if (UTM_FIELD_IDS.last_source) {
      fieldValues.push({ field: UTM_FIELD_IDS.last_source, value: utmData.utm_source });
    }
  }
  if (utmData.utm_medium) {
    if (UTM_FIELD_IDS.first_medium) {
      fieldValues.push({ field: UTM_FIELD_IDS.first_medium, value: utmData.utm_medium, overwrite: 0 });
    }
    if (UTM_FIELD_IDS.last_medium) {
      fieldValues.push({ field: UTM_FIELD_IDS.last_medium, value: utmData.utm_medium });
    }
  }
  if (utmData.utm_campaign) {
    if (UTM_FIELD_IDS.first_campaign) {
      fieldValues.push({ field: UTM_FIELD_IDS.first_campaign, value: utmData.utm_campaign, overwrite: 0 });
    }
    if (UTM_FIELD_IDS.last_campaign) {
      fieldValues.push({ field: UTM_FIELD_IDS.last_campaign, value: utmData.utm_campaign });
    }
  }
  if (utmData.signup_page && UTM_FIELD_IDS.signup_page) {
    fieldValues.push({ field: UTM_FIELD_IDS.signup_page, value: utmData.signup_page, overwrite: 0 });
  }

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
        fieldValues,
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

const ALLOWED_ORIGINS = [
  'https://gregorythegreat.ca',
  'https://www.gregorythegreat.ca',
  'https://evanr-web.github.io',
];

export function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// --- Validation helpers ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(str) {
  return typeof str === 'string' && str.length <= 254 && EMAIL_RE.test(str);
}

export function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen).replace(/[<>]/g, '').trim();
}

export function checkHoneypot(body) {
  // If the hidden "website" field has a value, it's a bot
  return body?.website || body?.url_confirm;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_FILE_EXTS = ['pdf', 'doc', 'docx'];

export function isAllowedFile(file) {
  if (!file || !file.name) return false;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ALLOWED_FILE_EXTS.includes(ext) && ALLOWED_FILE_TYPES.includes(file.type);
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

// --- Error logging ---
export function logError(endpoint, err, context = {}) {
  console.error(`[${endpoint}] ${err.message}`, {
    stack: err.stack?.split('\n').slice(0, 3).join(' | '),
    ...context,
  });
}
