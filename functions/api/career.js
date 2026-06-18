// POST /api/career — Career application with file upload
import { addContact, jsonResponse, corsHeaders, isValidEmail, sanitize, checkHoneypot, isAllowedFile, logError, verifyTurnstile } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const formData = await context.request.formData();

    // Turnstile verification
    const turnstile = await verifyTurnstile(context.request, context.env, formData);
    if (!turnstile.success) {
      return jsonResponse({ error: turnstile.error }, 403, origin);
    }

    // Honeypot check (from form field)
    if (formData.get('website') || formData.get('url_confirm')) {
      return jsonResponse({ success: true, contactId: 'ok' }, 200, origin);
    }

    const email = sanitize(formData.get('email'), 254);
    const firstName = sanitize(formData.get('firstName'), 100);
    const lastName = sanitize(formData.get('lastName'), 100);
    const position = sanitize(formData.get('position'), 200);
    const message = sanitize(formData.get('message'), 2000);
    const resume = formData.get('resume');

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address' }, 400, origin);
    }
    if (!firstName || !lastName) {
      return jsonResponse({ error: 'Name is required' }, 400, origin);
    }

    // File validation
    let resumeUrl = null;
    if (resume && resume.size > 0) {
      if (!isAllowedFile(resume)) {
        return jsonResponse({ error: 'Only PDF, DOC, or DOCX files are accepted' }, 400, origin);
      }

      const maxSize = 5 * 1024 * 1024;
      if (resume.size > maxSize) {
        return jsonResponse({ error: 'File too large. Max 5MB.' }, 400, origin);
      }

      const timestamp = Date.now();
      const safeName = `${firstName}-${lastName}-${timestamp}`.replace(/[^a-zA-Z0-9-]/g, '_');
      const ext = resume.name?.split('.').pop()?.toLowerCase() || 'pdf';
      const key = `careers/${safeName}.${ext}`;

      if (context.env.CAREER_UPLOADS) {
        await context.env.CAREER_UPLOADS.put(key, resume.stream(), {
          httpMetadata: { contentType: resume.type },
          customMetadata: { applicant: `${firstName} ${lastName}`, email, position: position || '' },
        });
        resumeUrl = key;
      }
    }

    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '8',
      tags: ['17'],
      utmData: {
        utm_source: formData.get('utm_source') || '',
        utm_medium: formData.get('utm_medium') || '',
        utm_campaign: formData.get('utm_campaign') || '',
        utm_content: formData.get('utm_content') || '',
        signup_page: formData.get('signup_page') || '',
      },
    });

    return jsonResponse({ success: true, contactId, resumeUrl }, 200, origin);
  } catch (err) {
    logError('career', err, { email: email ? 'present' : 'missing' });
    return jsonResponse({ error: 'Failed to submit application' }, 500, origin);
  }
}
