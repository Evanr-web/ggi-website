// Form handler — submits to Cloudflare Pages Functions
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form[data-ac-endpoint]').forEach((form) => {
    // Inject honeypot field (hidden from humans, bots fill it)
    const hp = document.createElement('div');
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;height:0;width:0;overflow:hidden;';
    hp.innerHTML = '<label for="website">Website</label><input type="text" name="website" id="website" tabindex="-1" autocomplete="off" />';
    form.prepend(hp);

    // Inject hidden UTM fields from sessionStorage
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

      // Get Turnstile token — handle invisible mode
      let turnstileToken = '';
      const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
      const turnstileWidget = form.querySelector('.cf-turnstile');

      if (turnstileWidget && window.turnstile) {
        // For invisible mode, we need to execute and wait for the token
        if (turnstileInput && turnstileInput.value) {
          turnstileToken = turnstileInput.value;
        } else {
          // Execute invisible turnstile and wait for token
          try {
            turnstileToken = await new Promise((resolve, reject) => {
              const widgetId = turnstileWidget.getAttribute('data-turnstile-widget-id') ||
                turnstileWidget.querySelector('input[name="cf-turnstile-response"]')?.closest('[data-turnstile-widget-id]')?.getAttribute('data-turnstile-widget-id');

              if (widgetId) {
                // Reset and re-execute existing widget
                window.turnstile.reset(widgetId);
                window.turnstile.execute(widgetId, {
                  callback: resolve,
                  'error-callback': reject,
                  'timeout-callback': () => reject(new Error('Turnstile timeout')),
                });
              } else {
                // Render a new invisible widget
                window.turnstile.render(turnstileWidget, {
                  sitekey: turnstileWidget.getAttribute('data-sitekey'),
                  size: 'invisible',
                  callback: resolve,
                  'error-callback': reject,
                  'timeout-callback': () => reject(new Error('Turnstile timeout')),
                });
              }

              // Fallback timeout
              setTimeout(() => reject(new Error('Turnstile timeout')), 10000);
            });
          } catch (err) {
            btn.textContent = 'Verification failed — try again';
            btn.disabled = false;
            setTimeout(() => { btn.textContent = originalText; }, 3000);
            return;
          }
        }
      } else if (turnstileInput) {
        turnstileToken = turnstileInput.value;
      }

      let fetchOptions;

      if (hasFile) {
        const formData = new FormData(form);
        if (turnstileToken) {
          formData.set('cf-turnstile-response', turnstileToken);
        }
        fetchOptions = {
          method: 'POST',
          body: formData,
        };
      } else {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
          if (data[key] !== undefined) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(value);
          } else {
            data[key] = value;
          }
        }
        // Set the turnstile token
        if (turnstileToken) {
          data['cf-turnstile-response'] = turnstileToken;
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
