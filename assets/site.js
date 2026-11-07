(function () {
  // mobile menu
  var t = document.querySelector('.menu-toggle'), m = document.querySelector('.mobile-links');
  if (t && m) t.addEventListener('click', function () {
    var open = m.classList.toggle('open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // franchise format switch
  var a = document.getElementById('sw-counter'), b = document.getElementById('sw-dining'),
      ma = document.getElementById('m-counter'), mb = document.getElementById('m-dining');
  if (a && b && ma && mb) {
    var show = function (c) { a.setAttribute('aria-pressed', c ? 'true' : 'false'); b.setAttribute('aria-pressed', c ? 'false' : 'true'); ma.hidden = !c; mb.hidden = c; };
    a.addEventListener('click', function () { show(true); });
    b.addEventListener('click', function () { show(false); });
  }

  // reveal on scroll
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var els = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top > window.innerHeight) { el.classList.add('pre'); io.observe(el); } });
  }

  // forms: post to the 'Website Leads' Apps Script (Google Sheet + email)
  var LEADS_ENDPOINT = '';
  var WA = 'https://wa.me/917021314620';
  function fileToB64(file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(String(r.result).split(',')[1] || ''); };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }
  var THANKS = {
    'Franchise enquiry': 'Thank you. Our franchise team will call you within one working day.',
    'Catering / event': 'Thank you. We will call you back with a menu and a price, usually the same day.',
    'Customer feedback': 'Thank you. Your note has gone straight to the kitchen team.',
    'Job application': 'Thank you for applying. We will call you if there is a fit.'
  };
  document.querySelectorAll('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var st = f.querySelector('.status'), btn = f.querySelector('button[type="submit"]');
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var fileInput = f.querySelector('input[type="file"]');
      var file = fileInput && fileInput.files && fileInput.files[0];
      if (file && file.size > 5 * 1024 * 1024) { st.className = 'status err'; st.textContent = 'Please keep the CV under 5 MB.'; return; }
      st.className = 'status'; st.textContent = 'Sending…'; btn.disabled = true;
      var data = new URLSearchParams();
      new FormData(f).forEach(function (v, k) { if (typeof v === 'string') data.append(k, v); });
      data.append('site', 'AP');
      var ready = file ? fileToB64(file).then(function (b64) { data.append('resume_b64', b64); data.append('resume_name', file.name); data.append('resume_type', file.type || 'application/octet-stream'); }) : Promise.resolve();
      ready.then(function () {
        if (!LEADS_ENDPOINT) throw new Error('no endpoint');
        return fetch(LEADS_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data });
      }).then(function () {
        var t = (f.querySelector('input[name="form_type"]') || {}).value;
        st.className = 'status ok'; st.textContent = THANKS[t] || 'Thank you. We will be in touch shortly.'; f.reset();
      }).catch(function () {
        st.className = 'status err';
        st.innerHTML = 'Sorry, that did not go through. Please message us on <a href="' + WA + '">WhatsApp</a> instead.';
      }).finally(function () { btn.disabled = false; });
    });
  });
})();
