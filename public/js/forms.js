// Form handler — submits to Cloudflare Pages Functions
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-ac-endpoint]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const endpoint = form.dataset.acEndpoint;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok && result.success) {
          // Show success state
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
          btn.textContent = 'Something went wrong — try again';
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
