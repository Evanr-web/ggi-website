// Form handler — submits to Cloudflare Pages Functions
document.addEventListener('DOMContentLoaded', () => {
  // Inject honeypot field into every AC form (hidden from humans, bots fill it)
  document.querySelectorAll('form[data-ac-endpoint]').forEach((form) => {
    // Inject honeypot field (hidden from humans, bots fill it)
    const hp = document.createElement('div');
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;height:0;width:0;overflow:hidden;';
    hp.innerHTML = '<label for="website">Website</label><input type="text" name="website" id="website" tabindex="-1" autocomplete="off" />';
    form.prepend(hp);

    // Inject hidden UTM fields — populated from sessionStorage
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'signup_page'];
    utmKeys.forEach(function (key) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = sessionStorage.getItem(key) || '';
      form.appendChild(input);
    });

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
        const formData = new FormData(form);
        fetchOptions = {
          method: 'POST',
          body: formData,
        };
      } else {
        const formData = new FormData(form);
        const data = {};
        // Handle multiple values (e.g. checkboxes) as arrays
        for (const [key, value] of formData.entries()) {
          if (data[key] !== undefined) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(value);
          } else {
            data[key] = value;
          }
        }
        // Include Turnstile token
        const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
        if (turnstileInput) {
          data['cf-turnstile-response'] = turnstileInput.value;
        }
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
