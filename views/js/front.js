/**
 * Popup Studio storefront runtime: browser rules, triggers, frequency, opening and closing, forms and games.
 *
 * @author    iamshoaibktk (https://github.com/iamshoaibktk)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */
(function (w, d) {
  'use strict';

  var cfgEl = d.getElementById('psx-config');
  if (!cfgEl || !w.PSX) return;
  var C;
  try { C = JSON.parse(cfgEl.textContent); } catch (e) { return; }
  var PSX = w.PSX;
  var I = C.i18n || {};
  PSX.fontBase = C.fonts || '';
  PSX.fontFiles = C.fontFiles || null;

  /* ---------- storage (local storage, falls back to memory) ---------- */
  var mem = {};
  var store = {
    get: function (k, def) {
      try { var v = w.localStorage.getItem('psx_' + k); return v ? JSON.parse(v) : def; } catch (e) { return mem[k] !== undefined ? mem[k] : def; }
    },
    set: function (k, v) {
      try { w.localStorage.setItem('psx_' + k, JSON.stringify(v)); } catch (e) { mem[k] = v; }
    },
    sget: function (k, def) {
      try { var v = w.sessionStorage.getItem('psx_' + k); return v ? JSON.parse(v) : def; } catch (e) { return mem['s' + k] !== undefined ? mem['s' + k] : def; }
    },
    sset: function (k, v) {
      try { w.sessionStorage.setItem('psx_' + k, JSON.stringify(v)); } catch (e) { mem['s' + k] = v; }
    }
  };

  /* ---------- visit tracking ---------- */
  var now = Date.now();
  var visit = store.get('visit', null);
  if (!visit || now - visit.last > 30 * 60 * 1000) {
    var q = new URLSearchParams(w.location.search);
    visit = {
      start: now, last: now, pages: 0, shown: 0,
      utm: { source: q.get('utm_source') || '', medium: q.get('utm_medium') || '', campaign: q.get('utm_campaign') || '' },
      ref: d.referrer && d.referrer.indexOf(w.location.host) === -1 ? d.referrer : ''
    };
    var visits = store.get('visits', 0) + 1;
    store.set('visits', visits);
  }
  visit.pages += 1;
  visit.last = now;
  store.set('visit', visit);
  var visitsCount = store.get('visits', 1);
  if (!store.get('first', 0)) store.set('first', now);

  function device() {
    var ua = navigator.userAgent || '';
    var wd = Math.min(w.innerWidth, w.screen ? w.screen.width : w.innerWidth);
    if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua))) return 'tablet';
    if (/Mobi|iPhone|Android/i.test(ua) || wd < 768) return 'mobile';
    return 'desktop';
  }
  var DEV = device();
  var MOBILE = w.matchMedia('(max-width: 767px)').matches;
  var REDUCED = C.motion && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- browser rules ---------- */
  function clientRule(r) {
    var v = r.value;
    switch (r.type) {
      case 'device':
        return (Array.isArray(v) ? v : [v]).indexOf(DEV) !== -1;
      case 'utm': {
        var have = (visit.utm && visit.utm[r.key || 'campaign']) || '';
        var want = String(v || '').toLowerCase();
        have = have.toLowerCase();
        return r.op === 'contains' ? have.indexOf(want) !== -1 : have === want;
      }
      case 'referrer': {
        var ref = (visit.ref || '').toLowerCase();
        if (r.op === 'none') return ref === '';
        return ref !== '' && ref.indexOf(String(v || '').toLowerCase()) !== -1;
      }
      case 'visit':
        if (v === 'first') return visitsCount <= 1;
        if (v === 'returning') return visitsCount > 1;
        return true;
    }
    return true;
  }
  function clientPass(groups) {
    if (!groups || !groups.length) return true;
    return groups.some(function (g) { return (g || []).every(clientRule); });
  }

  /* ---------- frequency ---------- */
  function fstate(id) { return store.get('f' + id, { n: 0, last: 0, closed: 0, conv: 0 }); }
  function fsave(id, s) { store.set('f' + id, s); }
  function freqOk(p) {
    var f = p.frequency || {};
    var s = fstate(p.id);
    var sess = store.sget('seen', {});
    if (f.stopConvert !== false && s.conv) return false;
    if (f.maxOn && f.max && s.n >= f.max) return false;
    if (f.afterCloseOn && s.closed && now - s.closed < (f.afterCloseDays || 1) * 86400000) return false;
    switch (f.mode || 'visit') {
      case 'page': return true;
      case 'visit': return !sess[p.id];
      case 'days': return !s.last || now - s.last >= (f.days || 7) * 86400000;
      case 'once': return !s.n;
    }
    return true;
  }
  function markShown(p) {
    var s = fstate(p.id);
    s.n += 1;
    s.last = Date.now();
    fsave(p.id, s);
    var sess = store.sget('seen', {});
    sess[p.id] = 1;
    store.sset('seen', sess);
    if (!isBar(p)) { visit.shown += 1; store.set('visit', visit); }
  }

  /* ---------- api ---------- */
  function api(action, params, beacon) {
    var body = new URLSearchParams(Object.assign({ do: action, token: C.token, ajax: 1, d: DEV }, params || {}));
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(C.api, body);
      return Promise.resolve({ ok: true });
    }
    return fetch(C.api, { method: 'POST', body: body, credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; });
  }
  function track(p, e) { api('event', { id: p.id, v: p.v, e: e, key: previewKey() }, true); }
  function previewKey() { return new URLSearchParams(w.location.search).get('psx_key') || ''; }

  /* ---------- open / close ---------- */
  var open = [];
  var lastFocus = null;

  function isBar(p) { return (p.doc && (p.doc.format === 'bar' || p.doc.format === 'inline')); }
  function formatOf(p) {
    var m = p.doc.mobile || {};
    return MOBILE && m.format && m.format !== 'same' ? m.format : p.doc.format;
  }

  function capOk(p) {
    if (p.preview) return true;
    if (isBar(p) && !C.cap.bars) return true;
    if (C.cap.visit > 0 && visit.shown >= C.cap.visit) return false;
    var modalsOpen = open.filter(function (o) { return !isBar(o.p); }).length;
    return modalsOpen < (C.cap.once || 1);
  }

  function focusables(root) {
    return Array.prototype.slice.call(root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])'))
      .filter(function (n) { return n.offsetParent !== null || n === d.activeElement; });
  }

  function setInert(on, except) {
    Array.prototype.forEach.call(d.body.children, function (n) {
      if (n === except || n.tagName === 'SCRIPT' || n.classList.contains('psx-tab')) return;
      if (on) {
        if (!n.hasAttribute('aria-hidden')) { n.setAttribute('aria-hidden', 'true'); n.setAttribute('data-psx-hid', '1'); }
        if ('inert' in n) { n.inert = true; n.setAttribute('data-psx-inert', '1'); }
      } else {
        if (n.getAttribute('data-psx-hid')) { n.removeAttribute('aria-hidden'); n.removeAttribute('data-psx-hid'); }
        if (n.getAttribute('data-psx-inert')) { n.inert = false; n.removeAttribute('data-psx-inert'); }
      }
    });
  }

  function show(p, how) {
    if (p.el) return;
    if (!capOk(p)) return;
    var fmt = formatOf(p);
    if (!p.coupon && p.fixed) p.coupon = p.fixed;
    var root = PSX.render(p.doc, { id: p.id, lang: C.lang, data: C.data, i18n: I, mobile: MOBILE, game: p.game, coupon: p.coupon || '' });
    p.el = root;
    p.step = 0;
    var modal = ['modal', 'fullscreen', 'drawer', 'sheet'].indexOf(fmt) !== -1;
    if (p.inline) {
      var slot = d.querySelector('[data-psx-inline="' + p.id + '"]');
      if (!slot) { p.el = null; return; }
      slot.appendChild(root);
    } else {
      d.body.appendChild(root);
    }
    if (fmt === 'bar' && (p.doc.bar || 'push') === 'push') {
      var box = root.querySelector('.psx-box');
      var h = box.offsetHeight;
      var top = (p.doc.position || 'top') === 'top';
      d.documentElement.style.setProperty(top ? '--psx-push-top' : '--psx-push-bottom', h + 'px');
      d.documentElement.classList.add(top ? 'psx-pushed-top' : 'psx-pushed-bottom');
    }
    if (modal && !p.inline) {
      lastFocus = d.activeElement;
      d.documentElement.classList.add('psx-lock');
      setInert(true, root);
    }
    root.addEventListener('click', function (e) { onClick(p, e); });
    root.addEventListener('submit', function (e) { onSubmit(p, e); });
    root.addEventListener('keydown', function (e) { onKey(p, e, modal); });
    wireStep(p);
    requestAnimationFrame(function () {
      root.classList.add('psx-in');
      if (modal) {
        var t = root.querySelector('.psx-step:not([hidden]) .psx-h') || root.querySelector('.psx-box');
        if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
      }
    });
    open.push({ p: p, modal: modal });
    if (!p.inline || true) { markShown(p); track(p, 'view'); }
    autoClose(p);
    hideTab(p);
    if (C.debug) debugMark(p, 'shown by ' + how);
  }

  function hide(p, reason) {
    if (!p.el) return;
    var root = p.el;
    var entry = open.filter(function (o) { return o.p === p; })[0];
    open = open.filter(function (o) { return o.p !== p; });
    clearTimeout(p.timer);
    clearInterval(p.ticker);
    root.classList.remove('psx-in');
    root.classList.add('psx-out');
    var done = function () {
      if (root.parentNode) root.parentNode.removeChild(root);
    };
    setTimeout(done, REDUCED ? 0 : 260);
    if (entry && entry.modal && !p.inline) {
      if (!open.some(function (o) { return o.modal; })) {
        d.documentElement.classList.remove('psx-lock');
        setInert(false);
      }
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    d.documentElement.classList.remove('psx-pushed-top', 'psx-pushed-bottom');
    p.el = null;
    if (reason !== 'convert') {
      var s = fstate(p.id);
      s.closed = Date.now();
      fsave(p.id, s);
      if (reason !== 'auto') track(p, 'close');
    }
    showTab(p);
  }

  function convert(p) {
    var s = fstate(p.id);
    s.conv = Date.now();
    fsave(p.id, s);
    store.set('tabgone' + p.id, 1);
  }

  /* ---------- steps ---------- */
  function sendFeedback(p, step) {
    if (!step) return;
    Array.prototype.forEach.call(step.querySelectorAll('.psx-ta textarea'), function (ta) {
      var v = ta.value.trim();
      if (!v || ta.getAttribute('data-sent') === v) return;
      ta.setAttribute('data-sent', v);
      var a = p.answers || {};
      var rating = 0;
      Object.keys(a).forEach(function (k) { if (typeof a[k] === 'number') rating = a[k]; });
      api('feedback', { id: p.id, v: p.v, q: ta.name || 'message', msg: v.slice(0, 2000), rating: rating, page: w.location.pathname.slice(0, 255), key: previewKey() });
    });
  }

  function goStep(p, id) {
    var steps = p.el.querySelectorAll('.psx-step');
    sendFeedback(p, steps[p.step]);
    var idx = -1;
    Array.prototype.forEach.call(steps, function (s, i) { if (s.getAttribute('data-step') === id) idx = i; });
    if (id === 'next') idx = Math.min(steps.length - 1, p.step + 1);
    if (idx < 0) return;
    Array.prototype.forEach.call(steps, function (s, i) { s.hidden = i !== idx; });
    p.step = idx;
    p.el.setAttribute('data-at', steps[idx].getAttribute('data-step'));
    wireStep(p);
    var h = steps[idx].querySelector('.psx-h');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    var cl = p.close || {};
    if (idx === steps.length - 1 && cl.lastOn) {
      clearTimeout(p.lastTimer);
      p.lastTimer = setTimeout(function () { hide(p, 'auto'); }, (cl.lastSec || 6) * 1000);
    }
  }

  function wireStep(p) {
    var step = p.el.querySelector('.psx-step:not([hidden])') || p.el;
    fill(p, step);
    Array.prototype.forEach.call(step.querySelectorAll('.psx-cd'), countdown);
    Array.prototype.forEach.call(step.querySelectorAll('[data-scratch]'), function (n) { scratch(p, n); });
    if (REDUCED) Array.prototype.forEach.call(step.querySelectorAll('.psx-marquee'), function (m) { m.classList.add('psx-paused'); });
  }

  function fill(p, scope) {
    if (p.coupon) {
      Array.prototype.forEach.call(scope.querySelectorAll('[data-psx-code]'), function (n) { n.textContent = p.coupon; n.setAttribute('data-len', PSX.codeLen(p.coupon)); });
      Array.prototype.forEach.call(scope.querySelectorAll('.psx-expiry, .psx-p, .psx-h, .psx-small'), function (n) {
        if (n.innerHTML.indexOf('{coupon') !== -1) n.innerHTML = n.innerHTML.replace(/\{coupon\}/g, PSX.esc(p.coupon)).replace(/\{coupon_expiry\}/g, PSX.esc(p.expires || ''));
      });
    }
    if (p.email) {
      Array.prototype.forEach.call(scope.querySelectorAll('.psx-p, .psx-small, .psx-h'), function (n) {
        if (n.innerHTML.indexOf('{email}') !== -1) n.innerHTML = n.innerHTML.replace(/\{email\}/g, PSX.esc(p.email));
      });
    }
    if (p.prizeLabel) {
      Array.prototype.forEach.call(scope.querySelectorAll('[data-psx-prize], .psx-h, .psx-p'), function (n) {
        if (n.innerHTML.indexOf('{prize}') !== -1) n.innerHTML = n.innerHTML.replace(/\{prize\}/g, PSX.esc(p.prizeLabel));
      });
    }
  }

  /* ---------- events ---------- */
  // Esc also works when focus is outside the popup (for example after a click on the page behind a slide-in).
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !open.length) return;
    var top = open[open.length - 1];
    if (!top.p.el || top.p.el.contains(e.target)) return;
    if ((top.p.close || {}).esc === false) return;
    hide(top.p, 'esc');
  });
  function onKey(p, e, modal) {
    var cl = p.close || {};
    if (e.key === 'Escape' && cl.esc !== false) { e.preventDefault(); hide(p, 'esc'); return; }
    if (e.key === 'Tab' && modal) {
      var f = focusables(p.el.querySelector('.psx-box'));
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.target.classList.contains('psx-star')) {
      var stars = Array.prototype.slice.call(p.el.querySelectorAll('.psx-star'));
      var i = stars.indexOf(e.target) + (e.key === 'ArrowRight' ? 1 : -1);
      if (stars[i]) stars[i].focus();
    }
  }

  function onClick(p, e) {
    var t = e.target.closest('[data-act], .psx-chip');
    if (!t || !p.el.contains(t)) return;
    if (t.classList.contains('psx-chip')) { t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }
    var act = t.getAttribute('data-act');
    var cl = p.close || {};
    switch (act) {
      case 'overlay':
        if (cl.overlay !== false && e.target === t) hide(p, 'overlay');
        break;
      case 'close':
        hide(p, 'close');
        break;
      case 'next':
        track(p, 'click');
        goStep(p, t.getAttribute('data-step') || 'next');
        break;
      case 'step':
        track(p, 'click');
        goStep(p, t.getAttribute('data-step'));
        break;
      case 'url':
        track(p, 'click');
        convert(p);
        break;
      case 'copy':
        copy(p, t);
        break;
      case 'apply':
        track(p, 'click');
        api('apply', { code: p.coupon || t.getAttribute('data-code') || '' }).then(function (r) {
          t.textContent = r.ok ? (I.applied || 'Applied') : (I.error || 'Error');
          if (r.ok && w.prestashop && w.prestashop.emit) w.prestashop.emit('updateCart', { reason: { linkAction: 'popupstudio' } });
        });
        break;
      case 'addcart':
        track(p, 'click');
        addToCart(t.getAttribute('data-id'), t);
        convert(p);
        break;
      case 'play':
        play(p, t);
        break;
      case 'pick':
        pick(p, t);
        break;
      case 'reveal':
        reveal(p, t.closest('[data-scratch]'));
        break;
      case 'choice':
        Array.prototype.forEach.call(t.parentNode.querySelectorAll('.psx-choice'), function (b) { b.setAttribute('aria-pressed', b === t ? 'true' : 'false'); });
        if (!t.parentNode.querySelector('[data-act=answer]')) answer(p, t.parentNode);
        break;
      case 'answer':
        answer(p, t.parentNode);
        break;
      case 'star':
        star(p, t);
        break;
      case 'video':
        video(p, t.closest('.psx-video'));
        break;
      case 'pause':
        var m = t.closest('.psx-marquee');
        m.classList.toggle('psx-paused');
        break;
    }
  }

  function copy(p, btn) {
    var code = p.coupon || (btn.parentNode.querySelector('[data-psx-code]') || {}).textContent || '';
    var ok = function () { btn.textContent = '✓ ' + (I.copied || 'Copied'); btn.classList.add('psx-done'); track(p, 'click'); };
    if (navigator.clipboard && w.isSecureContext) navigator.clipboard.writeText(code).then(ok, ok);
    else {
      var ta = d.createElement('textarea');
      ta.value = code; d.body.appendChild(ta); ta.select();
      try { d.execCommand('copy'); } catch (e) { /* ignore */ }
      d.body.removeChild(ta); ok();
    }
  }

  function addToCart(id, btn) {
    var url = (w.prestashop && w.prestashop.urls && w.prestashop.urls.pages && w.prestashop.urls.pages.cart) || C.data.cart_url;
    var body = new URLSearchParams({ token: (w.prestashop && w.prestashop.static_token) || C.token, id_product: id, qty: 1, add: 1, action: 'update', ajax: 1 });
    btn.disabled = true;
    fetch(url, { method: 'POST', body: body, credentials: 'same-origin', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        btn.disabled = false;
        if (w.prestashop && w.prestashop.emit) w.prestashop.emit('updateCart', { reason: { idProduct: id, linkAction: 'add-to-cart', cart: r.cart }, resp: r });
        btn.textContent = '✓';
      })
      .catch(function () { btn.disabled = false; });
  }

  function msg(form, text, kind) {
    var m = form.querySelector('.psx-msg');
    if (!m) return;
    m.textContent = text || '';
    m.className = 'psx-msg' + (kind ? ' psx-msg-' + kind : '');
    m.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  }

  function onSubmit(p, e) {
    var form = e.target.closest('form.psx-form');
    if (!form) return;
    e.preventDefault();
    var email = form.querySelector('input[name=email]');
    var consent = form.querySelector('input[name=consent]');
    email.removeAttribute('aria-invalid');
    if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      email.setAttribute('aria-invalid', 'true');
      form.classList.add('psx-err');
      msg(form, I.email_invalid, 'error');
      email.focus();
      return;
    }
    if (consent && consent.required && !consent.checked) {
      form.classList.add('psx-err');
      msg(form, I.consent_needed, 'error');
      consent.focus();
      return;
    }
    form.classList.remove('psx-err');
    var btn = form.querySelector('[type=submit]');
    var label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = PSX.esc(I.sending || '…'); }
    form.classList.add('psx-busy');
    Array.prototype.forEach.call(form.querySelectorAll('input'), function (i) { i.readOnly = true; });
    var chips = Array.prototype.map.call(p.el.querySelectorAll('.psx-chip[aria-pressed=true]'), function (c) { return c.getAttribute('data-chip'); });
    var playNow = form.getAttribute('data-play') === '1' || (p.game && p.game.emailFirst && p.game.type === 'wheel');
    var params = {
      id: p.id, v: p.v, key: previewKey(),
      email: email.value.trim(),
      firstname: (form.querySelector('input[name=firstname]') || {}).value || '',
      phone: (form.querySelector('input[name=phone]') || {}).value || '',
      consent: consent && consent.checked ? 1 : 0,
      consent_text: consent ? consent.parentNode.textContent.trim() : '',
      extra: JSON.stringify({ interests: chips, answers: p.answers || {} }),
      play: playNow ? 1 : 0,
      claim: p.claim || ''
    };
    api('subscribe', params).then(function (r) {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
      form.classList.remove('psx-busy');
      Array.prototype.forEach.call(form.querySelectorAll('input'), function (i) { i.readOnly = false; });
      if (!r.ok) {
        var key = r.error === 'email' ? 'email_invalid' : (r.error === 'consent' ? 'consent_needed' : (r.error === 'played' ? 'played' : 'error'));
        msg(form, I[key], 'error');
        if (r.error === 'email') email.setAttribute('aria-invalid', 'true');
        return;
      }
      if (r.state === 'exists') { msg(form, I.exists, 'info'); convert(p); return; }
      p.coupon = r.coupon || '';
      p.expires = r.expires || '';
      p.email = params.email;
      p.consent = params.consent;
      if (params.claim) p.claimed = true;
      convert(p);
      var next = form.getAttribute('data-next') || 'next';
      if (playNow && r.index !== null && r.index !== undefined) {
        p.prizeLabel = prizeLabel(p, r.index);
        spin(p, r.index, function () { goStep(p, next); });
        return;
      }
      if (r.state === 'pending') {
        msg(form, I.pending, 'info');
      }
      goStep(p, next);
    });
  }

  function prizeLabel(p, idx) {
    var pr = p.game && p.game.prizes && p.game.prizes[idx];
    return pr ? String(pr.label || '') : '';
  }

  /* ---------- games ---------- */
  function spin(p, idx, done) {
    var g = p.el.querySelector('.psx-spin');
    var n = (p.game && p.game.prizes && p.game.prizes.length) || 8;
    if (!g) { done(); return; }
    var target = 360 * 6 - idx * (360 / n);
    if (REDUCED) { g.style.transform = 'rotate(' + target + 'deg)'; setTimeout(done, 400); return; }
    g.style.transition = 'transform 4.2s cubic-bezier(.17,.67,.12,1)';
    requestAnimationFrame(function () { g.style.transform = 'rotate(' + target + 'deg)'; });
    setTimeout(done, 4500);
  }

  function play(p, btn) {
    btn.disabled = true;
    api('play', { id: p.id, v: p.v, key: previewKey() }).then(function (r) {
      btn.disabled = false;
      if (!r.ok) { btn.textContent = I[r.error === 'played' ? 'played' : 'error']; return; }
      p.claim = r.claim;
      p.prizeLabel = prizeLabel(p, r.index);
      spin(p, r.index, function () { goStep(p, btn.getAttribute('data-step') || 'next'); });
    });
  }

  function pick(p, btn) {
    var group = btn.closest('.psx-pick');
    if (group.classList.contains('psx-picked')) return;
    group.classList.add('psx-picked');
    btn.classList.add('psx-chosen');
    api('play', { id: p.id, v: p.v, key: previewKey() }).then(function (r) {
      if (!r.ok) { group.classList.remove('psx-picked'); btn.classList.remove('psx-chosen'); btn.setAttribute('title', I.played || ''); return; }
      p.claim = r.claim;
      p.prizeLabel = prizeLabel(p, r.index);
      var t = btn.querySelector('.psx-pick-t');
      if (t) t.textContent = p.prizeLabel;
      setTimeout(function () { goStep(p, group.getAttribute('data-step') || 'next'); }, REDUCED ? 300 : 1300);
    });
  }

  function scratch(p, wrap) {
    if (wrap.getAttribute('data-ready')) return;
    wrap.setAttribute('data-ready', '1');
    var cv = wrap.querySelector('canvas');
    var prize = wrap.querySelector('.psx-prize');
    var ctx = cv.getContext('2d');
    var started = false;
    var size = function () {
      var r = prize.getBoundingClientRect();
      cv.width = Math.max(10, r.width);
      cv.height = Math.max(10, r.height);
      var gr = ctx.createLinearGradient(0, 0, cv.width, cv.height);
      gr.addColorStop(0, '#9EA5B2'); gr.addColorStop(0.35, '#E4E8EE'); gr.addColorStop(0.5, '#AEB5C1'); gr.addColorStop(0.7, '#EEF1F5'); gr.addColorStop(1, '#8F97A5');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = 'rgba(30,36,51,.4)';
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(wrap.getAttribute('data-hint') || '', cv.width / 2, cv.height / 2);
    };
    setTimeout(size, 30);
    var draw = function (x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    };
    var pos = function (ev) {
      var r = cv.getBoundingClientRect();
      var pt = ev.touches ? ev.touches[0] : ev;
      return [pt.clientX - r.left, pt.clientY - r.top];
    };
    var down = false;
    var start = function (ev) {
      ev.preventDefault();
      down = true;
      if (!started) {
        started = true;
        ensurePrize(p, function () { prize.innerHTML = PSX.esc(p.prizeLabel || ''); });
      }
      var xy = pos(ev); draw(xy[0], xy[1]);
    };
    var move = function (ev) { if (!down) return; ev.preventDefault(); var xy = pos(ev); draw(xy[0], xy[1]); cleared(); };
    var up = function () { down = false; };
    cv.addEventListener('mousedown', start); cv.addEventListener('touchstart', start, { passive: false });
    cv.addEventListener('mousemove', move); cv.addEventListener('touchmove', move, { passive: false });
    w.addEventListener('mouseup', up); w.addEventListener('touchend', up);
    var cleared = function () {
      var data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      var clear = 0;
      for (var i = 3; i < data.length; i += 64) if (data[i] === 0) clear++;
      if (clear / (data.length / 64) > 0.55) reveal(p, wrap);
    };
  }

  function ensurePrize(p, cb) {
    if (p.claim) { cb(); return; }
    api('play', { id: p.id, v: p.v, key: previewKey() }).then(function (r) {
      if (r.ok) { p.claim = r.claim; p.prizeLabel = prizeLabel(p, r.index); }
      else p.prizeLabel = I.played || '';
      cb();
    });
  }

  function reveal(p, wrap) {
    if (!wrap || wrap.getAttribute('data-done')) return;
    wrap.setAttribute('data-done', '1');
    ensurePrize(p, function () {
      var prize = wrap.querySelector('.psx-prize');
      prize.innerHTML = PSX.esc(p.prizeLabel || '');
      var cv = wrap.querySelector('canvas');
      cv.style.transition = 'opacity .5s'; cv.style.opacity = '0';
      var started = Date.now();
      var go = function () { setTimeout(function () { goStep(p, wrap.getAttribute('data-step') || 'next'); }, Math.max(0, (REDUCED ? 200 : 1200) - (Date.now() - started))); };
      // Email was asked before the card: claim the prize for that email now, so the next step can show its code.
      if (p.email && p.claim && !p.claimed) {
        api('subscribe', { id: p.id, v: p.v, key: previewKey(), email: p.email, consent: p.consent || 0, claim: p.claim }).then(function (r) {
          if (r && r.ok) { p.claimed = true; if (r.coupon) p.coupon = r.coupon; if (r.expires) p.expires = r.expires; }
          go();
        });
        return;
      }
      go();
    });
  }

  function answer(p, group) {
    var sel = group.querySelector('.psx-choice[aria-pressed=true]');
    if (!sel) return;
    var q = group.getAttribute('data-q');
    p.answers = p.answers || {};
    p.answers[q] = sel.getAttribute('data-key');
    api('answer', { id: p.id, v: p.v, q: q, a: sel.getAttribute('data-key'), key: previewKey() });
    track(p, 'click');
    convert(p);
    goStep(p, sel.getAttribute('data-step') || 'next');
  }

  function star(p, btn) {
    var g = btn.closest('.psx-stars');
    var n = parseInt(btn.getAttribute('data-n'), 10);
    Array.prototype.forEach.call(g.querySelectorAll('.psx-star'), function (s, i) { s.setAttribute('aria-checked', i + 1 === n ? 'true' : 'false'); s.classList.toggle('psx-on', i < n); });
    p.answers = p.answers || {};
    p.answers[g.getAttribute('data-q')] = n;
    api('answer', { id: p.id, v: p.v, q: g.getAttribute('data-q'), a: String(n), key: previewKey() });
    track(p, 'click');
    convert(p);
    var cut = parseInt(g.getAttribute('data-cut'), 10) || 3;
    var to = n <= cut ? g.getAttribute('data-low') : g.getAttribute('data-high');
    if (to) setTimeout(function () { goStep(p, to); }, 300);
  }

  function video(p, wrap) {
    var src = wrap.getAttribute('data-src') || '';
    var yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
    var vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    wrap.innerHTML = '';
    var onEnd = function () { if (p.close && p.close.videoOn) hide(p, 'auto'); };
    if (yt) {
      var f = d.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + yt[1] + '?autoplay=1&mute=1&cc_load_policy=1&enablejsapi=1&rel=0';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.title = 'Video';
      wrap.appendChild(f);
      w.addEventListener('message', function (ev) {
        if (!/youtube/.test(ev.origin)) return;
        try { var m = JSON.parse(ev.data); if (m.event === 'onStateChange' && m.info === 0) onEnd(); } catch (e) { /* ignore */ }
      });
      f.addEventListener('load', function () { f.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*'); });
    } else if (vm) {
      var v = d.createElement('iframe');
      v.src = 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1&muted=1&dnt=1';
      v.allow = 'autoplay; fullscreen; picture-in-picture';
      v.title = 'Video';
      wrap.appendChild(v);
      w.addEventListener('message', function (ev) {
        if (!/vimeo/.test(ev.origin)) return;
        try { var m = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data; if (m.event === 'ended') onEnd(); if (m.event === 'ready') v.contentWindow.postMessage(JSON.stringify({ method: 'addEventListener', value: 'ended' }), '*'); } catch (e) { /* ignore */ }
      });
    } else {
      var el = d.createElement('video');
      el.src = src; el.controls = true; el.autoplay = true; el.muted = true; el.playsInline = true;
      el.addEventListener('ended', onEnd);
      wrap.appendChild(el);
    }
    track(p, 'click');
  }

  function countdown(n) {
    if (n.getAttribute('data-ready')) return;
    n.setAttribute('data-ready', '1');
    var end;
    if (n.getAttribute('data-mode') === 'evergreen') {
      var key = 'cd' + (n.closest('[data-psx]') || {}).getAttribute('data-psx');
      end = store.get(key, 0);
      if (!end) { end = Date.now() + (parseInt(n.getAttribute('data-minutes'), 10) || 60) * 60000; store.set(key, end); }
    } else {
      end = Date.parse(n.getAttribute('data-end')) || (Date.now() + 3600000);
    }
    var tick = function () {
      var left = Math.max(0, end - Date.now());
      var s = Math.floor(left / 1000);
      var parts = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      if (!n.querySelector('[data-u=d]')) parts.h += parts.d * 24;
      Array.prototype.forEach.call(n.querySelectorAll('[data-u]'), function (b) { b.textContent = String(parts[b.getAttribute('data-u')]).padStart(2, '0'); });
      if (left <= 0) {
        clearInterval(iv);
        if (n.getAttribute('data-hide')) { var root = n.closest('[data-psx]'); var pp = byId(root && root.getAttribute('data-psx')); if (pp) hide(pp, 'auto'); }
      }
    };
    var iv = setInterval(tick, 1000);
    tick();
  }

  function autoClose(p) {
    var c = p.close || {};
    if (c.timeOn) p.timer = setTimeout(function () { hide(p, 'auto'); }, (c.timeSec || 20) * 1000);
    if (c.scrollOn) {
      var onS = function () {
        if (!p.el) { w.removeEventListener('scroll', onS); return; }
        if (scrolledPct() >= (c.scrollPct || 80)) { w.removeEventListener('scroll', onS); hide(p, 'auto'); }
      };
      w.addEventListener('scroll', onS, { passive: true });
    }
    var xd = (c.xDelay || 0) * 1000;
    if (xd && p.el) {
      var x = p.el.querySelector('.psx-x');
      if (x) { x.style.visibility = 'hidden'; setTimeout(function () { x.style.visibility = ''; }, xd); }
    }
    if (c.x === false && p.el) { var xx = p.el.querySelector('.psx-x'); if (xx) xx.remove(); }
  }

  /* ---------- teaser tab ---------- */
  function showTab(p) {
    var t = p.teaser || {};
    if (!t.on || store.get('tabgone' + p.id, 0)) return;
    if (t.life === 'visit' && store.sget('tabx' + p.id, 0)) return;
    if (d.querySelector('.psx-tab[data-for="' + p.id + '"]')) return;
    var b = PSX.el('button', { type: 'button', class: 'psx-tab psx-tab-' + (t.edge || 'left') + ' psx-t-' + (p.doc.template || 'blank'), 'data-for': String(p.id), html: PSX.esc(t.text || '') });
    var th = p.doc.theme || {};
    if (th.accent) b.style.setProperty('--psx-accent', th.accent);
    if (th.accentInk) b.style.setProperty('--psx-accentInk', th.accentInk);
    if (th.fh) b.style.setProperty('--psx-fh', '"' + th.fh + '", system-ui, sans-serif');
    b.addEventListener('click', function () { b.remove(); show(p, 'tab'); });
    d.body.appendChild(b);
  }
  function hideTab(p) {
    var t = d.querySelector('.psx-tab[data-for="' + p.id + '"]');
    if (t) t.remove();
  }

  /* ---------- triggers ---------- */
  function scrolledPct() {
    var h = d.documentElement.scrollHeight - w.innerHeight;
    return h > 0 ? (w.scrollY / h) * 100 : 100;
  }

  function arm(p, linksOnly) {
    var T = p.triggers || {};
    if (linksOnly) T = { clickOn: T.clickOn, clickSel: T.clickSel, linksOnly: true };
    var fired = {};
    var need = [];
    var fire = function (name) {
      fired[name] = true;
      if (p.el) return;
      if (T.mode === 'all' && need.some(function (n) { return !fired[n]; })) return;
      show(p, name);
    };
    if (p.inline) { show(p, 'inline'); return; }
    if (T.timerOn) { need.push('timer'); setTimeout(function () { fire('timer'); }, (T.timerSec || 0) * 1000); }
    if (T.exitOn) {
      need.push('exit');
      var sens = { low: 2, normal: 12, high: 40 }[T.exitSens || 'normal'];
      if (DEV === 'desktop') {
        d.addEventListener('mouseout', function (e) {
          if (!e.relatedTarget && e.clientY <= sens) fire('exit');
        });
      } else {
        var lastY = w.scrollY;
        var lastT = Date.now();
        w.addEventListener('scroll', function () {
          var dy = lastY - w.scrollY;
          var dt = Date.now() - lastT;
          if (dy > 0 && dt > 0 && dy / dt > (T.exitSens === 'high' ? 1 : 2) && w.scrollY > 300) fire('exit');
          lastY = w.scrollY; lastT = Date.now();
        }, { passive: true });
        try {
          history.pushState({ psx: 1 }, '');
          w.addEventListener('popstate', function () { if (!p.el && !fired.exit) { fire('exit'); history.pushState({ psx: 1 }, ''); } });
        } catch (e) { /* ignore */ }
      }
    }
    if (T.idleOn) {
      need.push('idle');
      var it;
      var reset = function () { clearTimeout(it); it = setTimeout(function () { fire('idle'); }, (T.idleSec || 30) * 1000); };
      ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function (ev) { w.addEventListener(ev, reset, { passive: true }); });
      reset();
    }
    if (T.scrollOn) {
      need.push('scroll');
      var onS = function () {
        var hit = (T.scrollUnit || 'pct') === 'px' ? w.scrollY >= (T.scrollVal || 0) : scrolledPct() >= (T.scrollVal || 40);
        if (hit) { w.removeEventListener('scroll', onS); fire('scroll'); }
      };
      w.addEventListener('scroll', onS, { passive: true });
      onS();
    }
    if (T.pagesOn) {
      need.push('pages');
      var pagesOk = !T.pagesN || visit.pages >= T.pagesN;
      var siteSec = T.pagesSec ? (T.pagesSec * 1000 - (Date.now() - visit.start)) : -1;
      if (pagesOk && siteSec <= 0) fire('pages');
      else if (pagesOk && siteSec > 0) setTimeout(function () { fire('pages'); }, siteSec);
    }
    if (T.addcartOn) {
      need.push('addcart');
      if (w.prestashop && w.prestashop.on) {
        w.prestashop.on('updateCart', function (ev) { if (ev && ev.reason && ev.reason.linkAction === 'add-to-cart') fire('addcart'); });
      }
    }
    var sel = T.clickOn && T.clickSel ? T.clickSel + ',' : '';
    sel += '[data-popup="' + p.id + '"],a[href="#popup-' + p.id + '"]';
    d.addEventListener('click', function (e) {
      var t;
      try { t = e.target.closest(sel); } catch (err) { t = null; }
      if (t) { e.preventDefault(); if (!p.el) show(p, 'click'); }
    });
    if (!T.linksOnly && !T.timerOn && !T.exitOn && !T.idleOn && !T.scrollOn && !T.pagesOn && !T.addcartOn && !T.clickOn) {
      setTimeout(function () { fire('load'); }, 0);
    }
  }

  function byId(id) { return (C.popups || []).filter(function (p) { return String(p.id) === String(id); })[0]; }

  /* ---------- cart refresh for meter and cart blocks ---------- */
  if (w.prestashop && w.prestashop.on) {
    w.prestashop.on('updateCart', function () {
      var live = open.filter(function (o) { return o.p.el && o.p.el.querySelector('[data-psx-meter],[data-psx-cart],.psx-ladder'); });
      if (!live.length) return;
      api('cart', {}).then(function (r) {
        if (!r.ok) return;
        C.data.cart = r.cart;
        C.data.cart_total = r.cart.total;
        live.forEach(function (o) {
          ['[data-psx-meter]', '[data-psx-cart]', '.psx-ladder'].forEach(function (s) {
            Array.prototype.forEach.call(o.p.el.querySelectorAll(s), function (n) {
              var bid = n.getAttribute('data-bid');
              var block = findBlock(o.p.doc, bid);
              if (!block) return;
              var fresh = PSX.renderBlock(block, { lang: C.lang, data: C.data, i18n: I, mobile: MOBILE });
              if (fresh) n.parentNode.replaceChild(fresh, n);
            });
          });
        });
      });
    });
  }
  function findBlock(doc, bid) {
    var found = null;
    (doc.steps || []).forEach(function (s) {
      (s.cols || [{ blocks: s.blocks || [] }]).forEach(function (c) { (c.blocks || []).forEach(function (b) { if (b.id === bid) found = b; }); });
    });
    return found;
  }

  /* ---------- debug panel (preview links only) ---------- */
  function debugMark(p, text) {
    var box = d.getElementById('psx-debug');
    if (!box) return;
    var li = d.createElement('li');
    li.textContent = '#' + p.id + ' ' + text;
    box.querySelector('ul').appendChild(li);
  }
  function debugPanel() {
    if (!C.debug) return;
    var box = PSX.el('div', { id: 'psx-debug', class: 'psx-debug', role: 'complementary', 'aria-label': 'Popup Studio test panel' });
    var html = '<strong>Popup Studio, test as visitor</strong><ul>';
    Object.keys(C.debug).forEach(function (id) {
      var t = C.debug[id];
      var p = byId(id);
      html += '<li><b>#' + id + ' ' + PSX.esc(t.name) + '</b>: ' + (t.pass ? 'server rules pass' : 'server rules fail') + '<br>';
      html += 'schedule ' + (t.schedule ? '✓' : '✕') + ' · ';
      (t.rules || []).forEach(function (r) { html += PSX.esc(r.type) + ' ' + (r.pass ? '✓' : '✕') + ' (' + PSX.esc(r.why) + ') · '; });
      if (p) {
        html += 'browser rules ' + (clientPass(t.client) ? '✓' : '✕') + ' · frequency ' + (freqOk(p) ? '✓' : '✕ (seen before)') + ' · device ' + DEV;
      }
      html += '</li>';
    });
    box.innerHTML = html + '</ul><button type="button" class="psx-debug-x" aria-label="Close test panel">×</button>';
    box.querySelector('.psx-debug-x').addEventListener('click', function () { box.remove(); });
    d.body.appendChild(box);
  }

  /* ---------- start ---------- */
  function start() {
    debugPanel();
    var list = (C.popups || []).slice().sort(function (a, b) { return b.priority - a.priority; });
    // When popups qualify on the same page, a higher priority wins: lower ones keep only their links and tabs
    // and wait for the next page. Equal priorities all stay armed (the "open at once" cap still applies).
    var top = null;
    list.forEach(function (p) {
      if (!p.preview && !p.inline && !clientPass(p.client)) return;
      if (!p.preview && !p.inline && !freqOk(p)) { if (fstate(p.id).n) showTab(p); return; }
      if (p.preview) { show(p, 'preview'); return; }
      var T0 = p.triggers || {};
      var auto = !p.inline && !isBar(p) && (T0.timerOn || T0.exitOn || T0.idleOn || T0.scrollOn || T0.pagesOn || T0.addcartOn || !T0.clickOn);
      var waits = auto && top !== null && p.priority < top;
      if (auto && top === null) top = p.priority;
      if (p.startClosed) showTab(p);
      arm(p, waits);
    });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();

  w.PopupStudio = { open: function (id) { var p = byId(id); if (p) show(p, 'api'); }, close: function (id) { var p = byId(id); if (p) hide(p, 'api'); } };
})(window, document);
