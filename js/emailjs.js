// ============================================
// EmailJS — sends form submissions straight to email
// ============================================
// This lets the Contact, Join a Wing, Booking and Newsletter forms on
// the site actually email Living Waters — no backend server needed.
//
// To activate it:
// 1. Create a free account at https://www.emailjs.com
// 2. Add an Email Service (e.g. connect livingwatersincorporated@gmail.com)
//    — copy its Service ID.
// 3. Create one Email Template with these variables in the body:
//      {{form_type}}   — which form it came from
//      {{name}}        — the person's name
//      {{contact}}     — their email or phone
//      {{subject}}     — a short subject line
//      {{message}}     — the full message / details
//    Copy the Template ID.
// 4. In Account -> General, copy your Public Key.
// 5. Replace the three placeholders below with those real values.
// 6. Save this file — every form on the site will start emailing you.
//
// Until you do this, forms simply show their local "thanks" message
// without sending anything (no errors, nothing breaks).

var EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
var EMAILJS_SERVICE_ID = 'service_nzfqfss';
var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

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

  function send(templateParams) {
    if (!ready || !window.emailjs) {
      return Promise.reject(new Error('EmailJS not configured yet'));
    }
    return window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
  }

  function isConfigured() { return configured; }

  return { send: send, isConfigured: isConfigured };
})();
