// ============================================
// EmailJS — sends form submissions straight to email
// ============================================
// This lets the Contact, Join a Wing, Booking and Newsletter forms on
// the site email Living Waters directly (the "sending" template) AND
// send the visitor an automatic confirmation (the "receiving" /
// auto-reply template) — no backend server needed.
//
// To activate it:
// 1. Create a free account at https://www.emailjs.com
// 2. Add an Email Service (e.g. connect livingwatersincorporated@gmail.com)
//    — copy its Service ID.
// 3. Create TWO Email Templates in the EmailJS dashboard using the exact
//    content given in the chat message this file came with:
//      a) "New website enquiry" — sent TO you. Copy its Template ID into
//         EMAILJS_TEMPLATE_ID below.
//      b) "We got your message" — sent TO the visitor (set its "To Email"
//         field to {{reply_to}} in the template settings so it goes to
//         whoever submitted the form). Copy its Template ID into
//         EMAILJS_AUTOREPLY_TEMPLATE_ID below. This one is optional —
//         leave it as the placeholder to skip auto-replies entirely.
// 4. In Account -> General, copy your Public Key.
// 5. Replace the placeholders below with those real values.
// 6. Save this file.
//
// Until EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID and EMAILJS_TEMPLATE_ID
// are all filled in, forms simply show their local "thanks" message
// without sending anything (no errors, nothing breaks).

var EMAILJS_PUBLIC_KEY = 'rqYHfuRtfQXbJoxI0';
var EMAILJS_SERVICE_ID = 'service_nzfqfss';
var EMAILJS_TEMPLATE_ID = 'template_1m7mzcj';
var EMAILJS_AUTOREPLY_TEMPLATE_ID = 'template_6s51gnh';

var EmailJSBridge = (function () {
  var ready = false;
  var configured = EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
    && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID'
    && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

  if (configured) {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = function () {
      if (window.emailjs) {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
        ready = true;
      }
    };
    document.head.appendChild(s);
  }

  function looksLikeEmail(value) {
    return typeof value === 'string' && /\S+@\S+\.\S+/.test(value);
  }

  function send(templateParams) {
    if (!ready || !window.emailjs) {
      return Promise.reject(new Error('EmailJS not configured yet'));
    }
    return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
  }

  // Best-effort: only fires if an auto-reply template is set AND the
  // visitor's contact field actually looks like an email address (some
  // forms accept "phone or email", so this quietly skips phone numbers).
  function sendAutoReply(templateParams) {
    if (!ready || !window.emailjs) return Promise.resolve();
    if (EMAILJS_AUTOREPLY_TEMPLATE_ID === 'YOUR_AUTOREPLY_TEMPLATE_ID') return Promise.resolve();
    if (!looksLikeEmail(templateParams.reply_to)) return Promise.resolve();
    return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTOREPLY_TEMPLATE_ID, templateParams)
      .catch(function (err) {
        if (window.console) console.error('EmailJS auto-reply error:', err);
      });
  }

  function isConfigured() { return configured; }

  return { send: send, sendAutoReply: sendAutoReply, isConfigured: isConfigured };
})();
