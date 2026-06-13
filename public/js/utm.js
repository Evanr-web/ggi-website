// UTM capture — stores UTM params in sessionStorage on first landing
// Preserves first-touch attribution within a session
(function () {
  var params = new URLSearchParams(window.location.search);
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

  utmKeys.forEach(function (key) {
    var val = params.get(key);
    if (val && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, val);
    }
  });

  // Always store the current signup page (updated on every page view)
  sessionStorage.setItem('signup_page', window.location.pathname);
})();
