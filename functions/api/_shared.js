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

// --- Error logging + email alert ---
export async function logError(env, endpoint, err, context = {}) {
  // 1. Always log to Cloudflare console (visible in CF dashboard)
  console.error(`[${endpoint}] ${err.message}`, {
    stack: err.stack?.split('\n').slice(0, 3).join(' | '),
    ...context,
  });

  // 2. Send email alert via AgentMail (best-effort, don't throw)
  try {
    const AGENTMAIL_KEY = env.AGENTMAIL_API_KEY;
    if (!AGENTMAIL_KEY) return;

    await fetch('https://api.agentmail.to/v0/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENTMAIL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'evan_agent@agentmail.to',
        to: 'evanropp@gmail.com',
        subject: `[GGI] Error in /api/${endpoint}`,
        text: [
          `Endpoint: /api/${endpoint}`,
          `Time: ${new Date().toISOString()}`,
          `Error: ${err.message}`,
          context.email ? `Email present: yes` : `Email present: no`,
          `---`,
          `Stack (truncated):`,
          err.stack?.split('\n').slice(0, 5).join('\n') || 'no stack',
        ].join('\n'),
      }),
    });
  } catch (_) {
    // Email alert is best-effort — don't let it break the response
    console.warn(`[${endpoint}] Failed to send error alert email`);
  }
}
