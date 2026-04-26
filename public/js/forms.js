// Form handler — submits to Cloudflare Pages Functions
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-ac-endpoint]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const endpoint = form.dataset.acEndpoint;
      const hasFile = form.querySelector('input[type="file"]');

      let fetchOptions;

      if (hasFile) {
        // File upload — send as FormData (multipart)
        const formData = new FormData(form);
        fetchOptions = {
          method: 'POST',
          body: formData,
        };
      } else {
        // Standard form — send as JSON
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        };
      }

      try {
        const res = await fetch(endpoint, fetchOptions);
        const result = await res.json();

        if (res.ok && result.success) {
          form.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <p style="font-family: var(--font-display); font-size: 1.3rem; color: var(--color-navy); margin-bottom: 8px;">
                ✓ Thank you!
              </p>
              <p style="font-family: var(--font-body); font-size: 0.95rem; color: var(--color-gray);">
                ${form.dataset.acSuccess || 'Your submission has been received.'}
              </p>
            </div>
          `;
        } else {
          btn.textContent = result.error || 'Something went wrong — try again';
          btn.disabled = false;
          setTimeout(() => { btn.textContent = originalText; }, 3000);
        }
      } catch (err) {
        btn.textContent = 'Connection error — try again';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    });
  });
});
