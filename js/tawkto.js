// ============================================
// Tawk.to Live Chat Widget
// ============================================
// This connects the site to a real Tawk.to live-chat agent (free).
//
// To activate it:
// 1. Go to https://www.tawk.to and create a free account.
// 2. Add a new "Property" for the Living Waters website.
// 3. In Admin > Channels > Chat Widget, copy your Property ID
//    and Widget ID (they appear in a URL like:
//    embed.tawk.to/PROPERTY_ID/WIDGET_ID).
// 4. Replace YOUR_PROPERTY_ID and YOUR_WIDGET_ID below with those values.
// 5. Save this file — the chat bubble will appear on every page.
//
// Until you do this, the widget simply won't load (no errors, no
// bubble) since YOUR_PROPERTY_ID isn't a real ID yet.

var Tawk_API = Tawk_API || {};
var Tawk_LoadStart = new Date();

(function () {
  var s1 = document.createElement("script");
  var s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = 'https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();
