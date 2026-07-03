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

      // Skip if phase 2 enrichment is active (handled by its own logic)
      if (form.dataset.phase2) return;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const endpoint = form.dataset.acEndpoint;
      const hasFile = form.querySelector('input[type="file"]');

      // Get Turnstile token
      const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
      const turnstileToken = turnstileInput ? turnstileInput.value : '';

      if (!turnstileToken && form.querySelector('.cf-turnstile')) {
        btn.textContent = 'Please complete verification first';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
        return;
      }

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
        for (const [key, value] of formData.entries()) {
          if (data[key] !== undefined) {
            if (!Array.isArray(data[key])) data[key] = [data[key]];
            data[key].push(value);
          } else {
            data[key] = value;
          }
        }
        data['cf-turnstile-response'] = turnstileToken;
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
          // Fire GA4 conversion event
          if (typeof gtag === 'function') {
            var eventMap = {
              '/api/subscribe': 'newsletter_signup',
              '/api/contact': 'contact_form',
              '/api/ambassador': 'ambassador_application',
              '/api/book-study': 'book_study_registration',
              '/api/event-interest': 'event_interest',
              '/api/leadership': 'leadership_inquiry',
              '/api/career': 'career_application'
            };
            var eventName = eventMap[endpoint] || 'form_submission';
            gtag('event', eventName, {
              event_category: 'engagement',
              event_label: document.title,
              page_path: window.location.pathname
            });
          }

          // Phase 2 enrichment for newsletter subscribe forms
          if (endpoint === '/api/subscribe' && result.contactId && form.dataset.acPhase2 !== 'false') {
            showPhase2(form, result.contactId);
          } else {
            showThankYou(form);
          }
        } else {
          btn.textContent = result.error || 'Something went wrong — try again';
          btn.disabled = false;
          setTimeout(() => { btn.textContent = originalText; }, 3000);
          // Reset Turnstile for retry
          if (window.turnstile) {
            var widget = form.querySelector('.cf-turnstile');
            if (widget) window.turnstile.reset(widget);
          }
        }
      } catch (err) {
        btn.textContent = 'Connection error — try again';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
        if (window.turnstile) {
          var widget = form.querySelector('.cf-turnstile');
          if (widget) window.turnstile.reset(widget);
        }
      }
    });
  });

  // --- Phase 2 enrichment form ---
  function showPhase2(formEl, contactId) {
    // Detect context: footer (compact), modal, or section (full)
    var isFooter = formEl.closest('.footer');
    var isModal = formEl.closest('.nl-modal-card');

    formEl.dataset.phase2 = 'true';
    formEl.innerHTML = buildPhase2HTML(contactId, isFooter);
    formEl.removeAttribute('data-ac-endpoint');

    // Animate in
    var phase2 = formEl.querySelector('.phase2');
    if (phase2) {
      phase2.style.opacity = '0';
      phase2.style.transform = 'translateY(8px)';
      requestAnimationFrame(function () {
        phase2.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        phase2.style.opacity = '1';
        phase2.style.transform = 'translateY(0)';
      });
    }

    // Wire up phase 2 submit
    var phase2Form = formEl.querySelector('.phase2-form');
    var phase2Btn = formEl.querySelector('.phase2-submit');
    if (phase2Form && phase2Btn) {
      phase2Btn.addEventListener('click', function () {
        submitPhase2(formEl, phase2Form, contactId);
      });
    }

    // Wire up skip
    var skipBtn = formEl.querySelector('.phase2-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', function (e) {
        e.preventDefault();
        showThankYou(formEl);
      });
    }

    // Wire up province → show/hide postal code hint
    var provinceSelect = formEl.querySelector('[name="province"]');
    if (provinceSelect) {
      provinceSelect.addEventListener('change', function () {
        var postalGroup = formEl.querySelector('.phase2-postal-group');
        if (postalGroup) postalGroup.style.display = this.value ? '' : '';
      });
    }
  }

  function buildPhase2HTML(contactId, isCompact) {
    var provinces = [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
      'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
      'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
    ];
    var provinceOptions = '<option value="">Province</option>' +
      provinces.map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join('');

    return '<div class="phase2">' +
      '<div class="phase2-header">' +
        '<p class="phase2-check">✓ You\'re in!</p>' +
        '<p class="phase2-prompt">Help us tailor what we send you:</p>' +
      '</div>' +
      '<div class="phase2-form">' +
        '<input type="hidden" name="contactId" value="' + contactId + '" />' +

        // Last name
        '<input type="text" name="lastName" placeholder="Last name" class="phase2-input" aria-label="Last name" />' +

        // Interests
        '<fieldset class="phase2-interests">' +
          '<legend class="phase2-legend">I\'m interested in:</legend>' +
          '<label class="phase2-check-label"><input type="checkbox" name="interests" value="magnalia-journal" /> Magnalia Journal</label>' +
          '<label class="phase2-check-label"><input type="checkbox" name="interests" value="events" /> Events &amp; Conferences</label>' +
          '<label class="phase2-check-label"><input type="checkbox" name="interests" value="book-studies" /> Book Studies</label>' +
          '<label class="phase2-check-label"><input type="checkbox" name="interests" value="news" /> Institute News &amp; Resources</label>' +
        '</fieldset>' +

        // Mailing address
        '<fieldset class="phase2-address">' +
          '<legend class="phase2-legend">Mailing address <span class="phase2-optional">(optional — for printed materials)</span></legend>' +
          '<input type="text" name="streetAddress" placeholder="Street address" class="phase2-input" aria-label="Street address" />' +
          '<div class="phase2-row">' +
            '<input type="text" name="city" placeholder="City" class="phase2-input" aria-label="City" />' +
            '<select name="province" class="phase2-input phase2-select" aria-label="Province">' + provinceOptions + '</select>' +
          '</div>' +
          '<input type="text" name="postalCode" placeholder="Postal code" class="phase2-input phase2-input--short" aria-label="Postal code" />' +
        '</fieldset>' +

        '<div class="phase2-actions">' +
          '<button type="button" class="phase2-submit">Save Preferences</button>' +
          '<a href="#" class="phase2-skip">Skip for now</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  async function submitPhase2(formEl, phase2Form, contactId) {
    var btn = phase2Form.querySelector('.phase2-submit');
    var originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    // Collect data
    var data = {
      contactId: contactId,
      lastName: (phase2Form.querySelector('[name="lastName"]')?.value || '').trim(),
      streetAddress: (phase2Form.querySelector('[name="streetAddress"]')?.value || '').trim(),
      city: (phase2Form.querySelector('[name="city"]')?.value || '').trim(),
      province: (phase2Form.querySelector('[name="province"]')?.value || '').trim(),
      postalCode: (phase2Form.querySelector('[name="postalCode"]')?.value || '').trim(),
      interests: [],
    };

    // Collect checked interests
    phase2Form.querySelectorAll('input[name="interests"]:checked').forEach(function (cb) {
      data.interests.push(cb.value);
    });

    try {
      var res = await fetch('/api/subscribe-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      var result = await res.json();

      if (res.ok && result.success) {
        if (typeof gtag === 'function') {
          gtag('event', 'newsletter_enrichment', {
            event_category: 'engagement',
            event_label: 'phase2_complete',
            page_path: window.location.pathname
          });
        }
        showThankYou(formEl, true);
      } else {
        btn.textContent = result.error || 'Something went wrong';
        btn.disabled = false;
        setTimeout(function () { btn.textContent = originalText; }, 3000);
        if (window.turnstile) {
          var widget = phase2Form.querySelector('.cf-turnstile');
          if (widget) window.turnstile.reset(widget);
        }
      }
    } catch (err) {
      btn.textContent = 'Connection error — try again';
      btn.disabled = false;
      setTimeout(function () { btn.textContent = originalText; }, 3000);
      if (window.turnstile) {
        var widget = phase2Form.querySelector('.cf-turnstile');
        if (widget) window.turnstile.reset(widget);
      }
    }
  }

  function showThankYou(formEl, enriched) {
    var message = enriched
      ? 'Your preferences have been saved. Welcome to the GGI community!'
      : 'Welcome to the GGI community!';

    formEl.innerHTML =
      '<div style="text-align: center; padding: 20px;">' +
        '<p style="font-family: var(--font-display); font-size: 1.3rem; color: var(--color-navy); margin-bottom: 8px;">' +
          '✓ Thank you!' +
        '</p>' +
        '<p style="font-family: var(--font-body); font-size: 0.95rem; color: var(--color-gray);">' +
          message +
        '</p>' +
      '</div>';
  }
});
