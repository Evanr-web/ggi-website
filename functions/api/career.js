// POST /api/career — Career application with file upload
import { addContact, jsonResponse, corsHeaders } from './_shared.js';

export async function onRequestOptions(context) {
  return new Response(null, { headers: corsHeaders(context.request.headers.get('Origin')) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin');

  try {
    const formData = await context.request.formData();
    const email = formData.get('email');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const position = formData.get('position');
    const message = formData.get('message');
    const resume = formData.get('resume');

    if (!email || !firstName || !lastName) {
      return jsonResponse({ error: 'Name and email are required' }, 400, origin);
    }

    // Upload resume to R2 if provided
    let resumeUrl = null;
    if (resume && resume.size > 0) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (resume.size > maxSize) {
        return jsonResponse({ error: 'File too large. Max 5MB.' }, 400, origin);
      }

      const timestamp = Date.now();
      const safeName = `${firstName}-${lastName}-${timestamp}`.replace(/[^a-zA-Z0-9-]/g, '_');
      const ext = resume.name?.split('.').pop() || 'pdf';
      const key = `careers/${safeName}.${ext}`;

      // Store in R2 bucket (configured as binding in Cloudflare Pages)
      if (context.env.CAREER_UPLOADS) {
        await context.env.CAREER_UPLOADS.put(key, resume.stream(), {
          httpMetadata: { contentType: resume.type },
          customMetadata: { applicant: `${firstName} ${lastName}`, email, position: position || '' },
        });
        resumeUrl = key;
      }
    }

    // Add contact to ActiveCampaign
    const contactId = await addContact(context.env, {
      email,
      firstName,
      lastName,
      listId: '8', // Career Applications list
      tags: ['17'], // career-applicant tag
    });

    return jsonResponse({ success: true, contactId, resumeUrl }, 200, origin);
  } catch (err) {
    return jsonResponse({ error: 'Failed to submit application' }, 500, origin);
  }
}
