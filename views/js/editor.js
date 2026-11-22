/**
 * Popup Studio editor: design (blocks, live preview), triggers, targeting, schedule and frequency, A/B test.
 *
 * @author    iamshoaibktk (https://github.com/iamshoaibktk)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */
(function (w, d) {
  'use strict';
  function init() {
  var A = w.PSXAdmin;
  if (!A) return;
  var B = A.B, T = A.T, h = A.h, api = A.api;

  /* ---------- defaults ---------- */
  var DEF = {
    triggers: { mode: 'any', timerOn: true, timerSec: 8, exitOn: false, exitSens: 'normal', idleOn: false, idleSec: 30, scrollOn: false, scrollVal: 40, scrollUnit: 'pct', clickOn: false, clickSel: '', pagesOn: false, pagesN: 2, pagesSec: 0, addcartOn: false },
    close: { x: true, xDelay: 0, overlay: true, esc: true, timeOn: false, timeSec: 20, scrollOn: false, scrollPct: 80, videoOn: false, lastOn: false, lastSec: 6 },
    teaser: { on: false, text: { en: 'Get 10%' }, edge: 'left', life: 'visit' },
    targeting: { groups: [] },
    schedule: { days: [1, 2, 3, 4, 5, 6, 7], from: '00:00', to: '23:59' },
    frequency: { mode: 'days', days: 7, maxOn: false, max: 3, stopConvert: true, afterCloseOn: true, afterCloseDays: 2 },
    form: { list: 'newsletter', consent: true, consentRequired: true },
    coupon: { mode: 'none', code: '', type: 'percent', value: 10, days: 14, min: 0, prefix: 'WELCOME-', autoApply: false },
    ab: { goal: 'signups' }
  };
  var BLANK_DOC = function (format) {
    return {
      format: format || 'modal', position: format === 'slidein' ? 'br' : (format === 'bar' ? 'top' : 'center'), width: format === 'slidein' ? 340 : 520, template: 'blank', fonts: [],
      theme: { bg: '#ffffff', ink: '#16181d', accent: '#16181d', accentInk: '#ffffff', muted: '#5b6170', line: '#d5d9e0', radius: 12 },
      mobile: { format: format === 'modal' ? 'sheet' : 'same' },
      steps: [
        { id: 's1', name: 'Offer', blocks: [
          { id: uid(), type: 'heading', t: { en: 'Join our newsletter' } },
          { id: uid(), type: 'text', t: { en: 'News, new arrivals and a welcome code for your first order.' } },
          { id: uid(), type: 'form', label: { en: 'Email' }, ph: { en: 'you@example.com' }, btn: { en: 'Subscribe' }, consent: true, consentRequired: true, next: 's2' }
        ] },
        { id: 's2', name: 'Thanks', blocks: [
          { id: uid(), type: 'heading', t: { en: 'Thank you!' } },
          { id: uid(), type: 'text', t: { en: 'Check your inbox for a welcome email.' } },
          { id: uid(), type: 'button', t: { en: 'Continue shopping' }, act: 'close' }
        ] }
      ]
    };
  };
  function uid() { return 'b' + Math.random().toString(36).slice(2, 8); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(def, val) {
    var out = clone(def);
    Object.keys(val || {}).forEach(function (k) {
      if (val[k] && typeof val[k] === 'object' && !Array.isArray(val[k]) && def[k] && typeof def[k] === 'object' && !Array.isArray(def[k])) out[k] = merge(def[k], val[k]);
      else out[k] = val[k];
    });
    return out;
  }
  function getPath(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? undefined : a[k]; }, o); }
  function setPath(o, p, v) {
    var ks = p.split('.');
    var last = ks.pop();
    var t = ks.reduce(function (a, k, i) { if (a[k] == null || typeof a[k] !== 'object') a[k] = /^\d+$/.test(ks[i + 1] || last) ? [] : {}; return a[k]; }, o);
    t[last] = v;
  }

  /* ---------- block catalogue ---------- */
  var TYPES = [
    ['heading', 'Heading', 'M6 4v16M18 4v16M6 12h12'], ['text', 'Text', 'M4 6h16M4 12h16M4 18h10'], ['image', 'Image', 'M3 5h18v14H3zM3 16l5-5 5 5 3-3 5 5'],
    ['button', 'Button', 'M3 8h18v8H3zM8 12h8'], ['link', 'Link', 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1'], ['form', 'Email form', 'M4 6h16v12H4zM4 7l8 6 8-6'],
    ['coupon', 'Coupon', 'M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM10 7v10'], ['countdown', 'Countdown', 'M12 8v5l3 2M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9 2h6'], ['wheel', 'Wheel', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 3v18M3 12h18'],
    ['scratch', 'Scratch card', 'M4 6h16v12H4zM7 15l3-3 2 2 5-5'], ['pick', 'Pick one', 'M4 10h16v10H4zM2 7h20v3H2zM12 7v13'], ['video', 'Video', 'M3 6h13v12H3zM16 10l5-3v10l-5-3'],
    ['product', 'Product', 'M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0'], ['cart', 'Cart items', 'M3 4h2l2 12h11l2-8H6'], ['meter', 'Shipping meter', 'M3 12h18M12 12l4-4M3 12a9 9 0 0 1 18 0'],
    ['ladder', 'Spend tiers', 'M5 20V14M12 20V9M19 20V4'], ['choices', 'Survey', 'M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10'], ['stars', 'Rating', 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z'],
    ['chips', 'Interests', 'M4 8h7v5H4zM13 8h7v5h-7zM4 15h7v5H4z'], ['textarea', 'Message box', 'M4 5h16v14H4zM7 9h10M7 13h6'], ['list', 'List', 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01'],
    ['social', 'Social', 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'], ['marquee', 'Ticker', 'M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4'], ['badge', 'Badge', 'M4 12l8-8h8v8l-8 8z'],
    ['divider', 'Divider', 'M4 12h16'], ['spacer', 'Spacer', 'M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4'], ['html', 'HTML', 'M8 7l-5 5 5 5M16 7l5 5-5 5']
  ];
  function typeName(t) { var x = TYPES.filter(function (r) { return r[0] === t; })[0]; return x ? T(x[1]) : t; }
  function newBlock(type) {
    var b = { id: uid(), type: type };
    var en = function (s) { return { en: s } };
    switch (type) {
      case 'heading': b.t = en('A short, clear headline'); break;
      case 'text': b.t = en('One or two lines that say what the visitor gets.'); break;
      case 'badge': b.t = en('New'); break;
      case 'image': b.placeholder = 'photo'; b.alt = en(''); break;
      case 'button': b.t = en('Shop now'); b.act = 'close'; break;
      case 'link': b.t = en('No thanks'); b.act = 'close'; break;
      case 'form': b.label = en('Email'); b.ph = en('you@example.com'); b.btn = en('Subscribe'); b.consent = true; b.consentRequired = true; b.next = 'next'; break;
      case 'coupon': b.copy = en('Copy'); b.note = en('Valid until {coupon_expiry}.'); break;
      case 'countdown': b.mode = 'evergreen'; b.minutes = 60; b.look = 'boxes'; break;
      case 'wheel': b.look = 'plain'; break;
      case 'scratch': b.prize = en('{prize}'); b.reveal = en('Reveal it all'); break;
      case 'pick': b.look = 'gift'; b.items = [{ t: en('') }, { t: en('') }, { t: en('') }]; break;
      case 'video': b.src = ''; break;
      case 'product': b.source = 'bestseller'; b.btn = en('Add to cart'); break;
      case 'cart': b.max = 3; b.totalLabel = en('Total'); break;
      case 'meter': b.threshold = 0; b.t_empty = en('Free shipping from {free_shipping_threshold}'); b.t_progress = en('{free_shipping_remaining} to go for free shipping'); b.t_done = en('Free shipping unlocked'); break;
      case 'ladder': b.tiers = [{ min: 50, pct: 10 }, { min: 100, pct: 15 }, { min: 150, pct: 20 }]; b.doneT = en('reached'); b.nextT = en('{left} to go'); b.todoT = en('from {min}'); break;
      case 'choices': b.q = 'reason'; b.options = [{ key: 'price', t: en('The price') }, { key: 'shipping', t: en('Shipping') }, { key: 'looking', t: en('Just looking') }]; b.submit = en('Send answer'); b.letters = true; break;
      case 'stars': b.q = 'rating'; b.cut = 3; b.lo = en('Not great'); b.hi = en('Loved it'); break;
      case 'chips': b.options = [{ key: 'a', t: en('Option A') }, { key: 'b', t: en('Option B') }]; break;
      case 'textarea': b.label = en('Message'); b.name = 'message'; break;
      case 'list': b.items = [{ k: en('Item'), v: en('Value') }]; break;
      case 'social': b.links = [{ t: en('Follow us'), url: '' }]; break;
      case 'marquee': b.items = [en('Free shipping over €60'), en('New arrivals every Friday')]; b.sep = '✦'; break;
      case 'spacer': b.h = 12; break;
      case 'html': b.html = '<p>Custom HTML</p>'; break;
    }
    return b;
  }

  /* ---------- state ---------- */
  var E = {
    p: null, vi: 0, tab: 'design', dev: 'd', step: 0, sel: null, decorSel: null, insp: 'content', lang: B.defaultIso || 'en',
    undo: [], redo: [], dirty: false, savedAt: null, ab: null
  };
  A.Editor = E;

  function doc() { return E.p.variants[E.vi].content; }
  function S() { return E.p.settings; }
  function steps() { return doc().steps || []; }
  function cur() { return steps()[E.step] || steps()[0]; }
  function cols(s) {
    s = s || cur();
    if (!s.cols || !s.cols.length) { s.cols = [{ blocks: s.blocks || [] }]; delete s.blocks; }
    return s.cols;
  }
  function find(bid) {
    var out = null;
    steps().forEach(function (s, si) { cols(s).forEach(function (c, ci) { (c.blocks || []).forEach(function (b, bi) { if (b.id === bid) out = { b: b, s: s, si: si, c: c, ci: ci, bi: bi }; }); }); });
    return out;
  }

  function normalize(p) {
    p.settings = merge(DEF, p.settings || {});
    if (!p.variants || !p.variants.length) p.variants = [{ label: 'A', weight: 100, active: 1, content: BLANK_DOC('modal') }];
    p.variants.forEach(function (v) { (v.content.steps || []).forEach(function (s) { cols(s); }); });
    if (!p.shops || !p.shops.length) p.shops = B.contextShops && B.contextShops.length ? B.contextShops.slice() : [B.shops[0] && B.shops[0].id];
    return p;
  }

  E.open = function (id) {
    A.root.innerHTML = '<p class="psx-hint" style="padding:20px">' + h(T('Loading…')) + '</p>';
    api('get', { id: id }).then(function (r) {
      if (!r.ok || !r.popup) { A.toast(h(T('Popup not found.')), true); A.go('list'); return; }
      start(normalize(r.popup));
    });
  };
  E.fromTemplate = function (slug) {
    A.loadTemplates().then(function (list) {
      var t = list.filter(function (x) { return x.slug === slug; })[0];
      if (!t) return;
      var p = normalize({ name: t.name, status: 'draft', template: t.slug, priority: 0, settings: clone(t.settings || {}), ab_active: 0, variants: [{ label: 'A', weight: 100, active: 1, content: clone(t.doc) }] });
      if (t.settings && t.settings.dates) { p.date_start = t.settings.dates[0]; p.date_end = t.settings.dates[1]; }
      api('save', {}, p).then(function (r) {
        if (!r.ok) { A.toast(h(T('Could not create the popup.')), true); return; }
        A.toast(h(T('Created from "{name}". It stays a draft until you switch it on.', { name: t.name })));
        start(normalize(r.popup));
      });
    });
  };
  E.blank = function () {
    var bg = d.createElement('div');
    bg.className = 'psx-dlg-bg';
    var fmts = [['modal', T('Modal'), T('Centred over the page')], ['slidein', T('Slide-in'), T('A card in a corner, page stays usable')], ['bar', T('Bar'), T('A strip at the top or bottom')], ['fullscreen', T('Full screen'), T('Covers the whole page')], ['drawer', T('Side drawer'), T('Slides in from the side')], ['inline', T('Inline'), T('Placed in a hook or with {widget}')]];
    bg.innerHTML = '<div class="psx-dlg" role="dialog" aria-modal="true" aria-labelledby="psx-bt" style="max-width:520px"><h2 id="psx-bt" style="font-size:18px">' + h(T('Choose the format')) + '</h2><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:14px">' +
      fmts.map(function (f) { return '<button type="button" class="psx-opt" data-f="' + f[0] + '" style="flex-direction:column;gap:2px;background:#fff;text-align:left;font-family:inherit"><strong>' + h(f[1]) + '</strong><span class="psx-hint">' + h(f[2]) + '</span></button>'; }).join('') +
      '</div><div class="acts"><button type="button" class="psx-btn2" data-x>' + h(T('Cancel')) + '</button></div></div>';
    d.body.appendChild(bg);
    bg.querySelector('[data-x]').addEventListener('click', function () { bg.remove(); });
    Array.prototype.forEach.call(bg.querySelectorAll('[data-f]'), function (b) {
      b.addEventListener('click', function () {
        bg.remove();
        var f = b.getAttribute('data-f');
        var docu = BLANK_DOC(f);
        if (f === 'bar') docu.steps = [{ id: 's1', name: 'Bar', cols: [{ blocks: [{ id: uid(), type: 'text', t: { en: 'Free shipping on orders over {free_shipping_threshold}' } }, { id: uid(), type: 'button', t: { en: 'Shop now' }, act: 'url', href: '/' }] }] }];
        var p = normalize({ name: T('New popup'), status: 'draft', template: 'blank', settings: {}, variants: [{ label: 'A', weight: 100, active: 1, content: docu }] });
        if (f === 'inline') p.settings.triggers.timerOn = false;
        api('save', {}, p).then(function (r) { if (r.ok) start(normalize(r.popup)); });
      });
    });
    bg.querySelector('[data-f]').focus();
  };

  function start(p) {
    E.p = p; E.vi = 0; E.tab = 'design'; E.step = 0; E.sel = null; E.decorSel = null; E.undo = []; E.redo = []; E.dirty = false; E.savedAt = p.date_upd;
    A.view = 'editor';
    draw();
  }

  /* ---------- undo ---------- */
  var snapTimer = null;
  function snapshot() {
    clearTimeout(snapTimer);
    var s = JSON.stringify({ v: E.p.variants, s: E.p.settings, n: E.p.name });
    snapTimer = setTimeout(function () {
      if (E.undo[E.undo.length - 1] !== s) { E.undo.push(s); if (E.undo.length > 60) E.undo.shift(); E.redo = []; }
    }, 0);
  }
  function restore(json) {
    var o = JSON.parse(json);
    E.p.variants = o.v; E.p.settings = o.s; E.p.name = o.n;
    if (E.vi >= E.p.variants.length) E.vi = 0;
    E.dirty = true;
    draw();
  }
  function changed(soft) {
    E.dirty = true;
    var st = d.getElementById('psx-saved');
    if (st) st.textContent = T('Unsaved changes');
    var pill = d.getElementById('psx-stpill');
    if (pill) { var s2 = A.statusOf(E.p); pill.className = 'psx-pill ' + s2; pill.innerHTML = '<i></i>' + h(A.statusLabel(s2)); }
    if (!soft) preview();
  }

  /* ---------- top bar and tabs ---------- */
  function topBar() {
    var p = E.p;
    var st = A.statusOf(p);
    var tabs = [['design', T('Design')], ['triggers', T('Triggers and closing')], ['targeting', T('Targeting')], ['frequency', T('Schedule and frequency')], ['ab', T('A/B test')]];
    return '<header class="psx-ed-top"><div class="psx-ed-bar">' +
      '<button type="button" class="psx-ib" data-a="ed_back" aria-label="' + h(T('Back to popups')) + '">' + A.icon('back') + '</button>' +
      '<div style="display:flex;flex-direction:column;min-width:0"><label><span class="sr">' + h(T('Popup name')) + '</span><input class="psx-ed-name" value="' + h(p.name) + '" data-i="ed_name"></label><span class="muted" style="font-size:12px" id="psx-saved">' + h(E.dirty ? T('Unsaved changes') : T('Saved {t}', { t: (E.savedAt || '').slice(11, 16) })) + (p.template ? ' · ' + h(T('template {t}', { t: p.template })) : '') + '</span></div>' +
      '<label style="display:flex;align-items:center;gap:6px"><span class="sr">' + h(T('Status')) + '</span><select class="psx-inp" style="width:130px" data-c="ed_status">' + ['draft', 'live', 'paused'].map(function (s1) { return '<option value="' + s1 + '"' + (p.status === s1 ? ' selected' : '') + '>' + h(A.statusLabel(s1)) + '</option>'; }).join('') + '</select></label>' +
      '<span class="psx-pill ' + st + '" id="psx-stpill"><i></i>' + h(A.statusLabel(st)) + '</span><div style="flex:1"></div>' +
      '<div style="display:flex;gap:2px"><button type="button" class="psx-ib" data-a="ed_undo" aria-label="' + h(T('Undo')) + '"' + (E.undo.length ? '' : ' disabled') + '><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg></button><button type="button" class="psx-ib" data-a="ed_redo" aria-label="' + h(T('Redo')) + '"' + (E.redo.length ? '' : ' disabled') + '><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg></button></div>' +
      (E.tab === 'design' ? '<div class="psx-seg" role="group" aria-label="' + h(T('Preview device')) + '"><button type="button" data-a="ed_dev" data-v="d" aria-pressed="' + (E.dev === 'd') + '">' + h(T('Desktop')) + '</button><button type="button" data-a="ed_dev" data-v="m" aria-pressed="' + (E.dev === 'm') + '">' + h(T('Mobile')) + '</button></div>' : '') +
      '<label><span class="sr">' + h(T('Editing language')) + '</span><select class="psx-inp" style="width:130px" data-c="ed_lang">' + B.langs.map(function (l) { return '<option value="' + h(l.iso) + '"' + (E.lang === l.iso ? ' selected' : '') + '>' + h(l.name) + '</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="psx-btn2" data-a="ed_preview">' + A.icon('eye', 16) + h(T('Preview on shop')) + '</button><button type="button" class="psx-btn2 pri" data-a="ed_save">' + h(T('Save')) + '</button></div>' +
      '<nav class="psx-tabs" aria-label="' + h(T('Popup sections')) + '">' + tabs.map(function (t) {
        return '<button type="button" data-a="ed_tab" data-v="' + t[0] + '"' + (E.tab === t[0] ? ' aria-current="page"' : '') + '>' + h(t[1]) + (t[0] === 'ab' && p.variants.length > 1 ? '<span class="n">' + p.variants.length + '</span>' : '') + '</button>';
      }).join('') + '</nav></header>';
  }

  function draw() {
    var body = '';
    if (E.tab === 'design') body = designTab();
    else if (E.tab === 'triggers') body = triggersTab();
    else if (E.tab === 'targeting') body = targetingTab();
    else if (E.tab === 'frequency') body = frequencyTab();
    else if (E.tab === 'ab') body = abTab();
    A.root.innerHTML = '<div class="psx-ed">' + topBar() + body + '</div>';
    if (E.tab === 'design') preview();
    if (E.tab === 'ab') abAfter();
  }
  E.draw = draw;

  var act = A.actions;
  act.ed_back = function () {
    if (E.dirty) {
      A.confirm(T('Leave without saving?'), T('Your changes to this popup will be lost.'), T('Leave'), function () { E.dirty = false; A.go('list'); });
    } else A.go('list');
  };
  act.ed_name = function (t) { snapshot(); E.p.name = t.value; changed(true); };
  act.ed_status = function (t) { E.p.status = t.value; changed(true); };
  act.ed_tab = function (t) { E.tab = t.getAttribute('data-v'); draw(); };
  act.ed_dev = function (t) { E.dev = t.getAttribute('data-v'); draw(); };
  act.ed_lang = function (t) { E.lang = t.value; draw(); };
  act.ed_undo = function () { if (!E.undo.length) return; E.redo.push(JSON.stringify({ v: E.p.variants, s: E.p.settings, n: E.p.name })); restore(E.undo.pop()); };
  act.ed_redo = function () { if (!E.redo.length) return; E.undo.push(JSON.stringify({ v: E.p.variants, s: E.p.settings, n: E.p.name })); restore(E.redo.pop()); };
  act.ed_save = function () { save(); };
  act.ed_preview = function () {
    var go = function () { api('preview', { id: E.p.id, v: E.p.variants[E.vi].id_variant || 0 }).then(function (r) { if (r.ok) w.open(r.url, '_blank', 'noopener'); }); };
    if (E.dirty) save(go); else go();
  };
  function save(cb) {
    var err = validate();
    if (err) { A.toast('<b>' + h(T('Couldn\'t save.')) + '</b> ' + h(err), true); return; }
    api('save', {}, E.p).then(function (r) {
      if (!r.ok) { A.toast('<b>' + h(T('Couldn\'t save.')) + '</b> ' + h(T('Please try again.')), true); return; }
      var keepVi = E.vi;
      E.p = normalize(r.popup);
      E.vi = Math.min(keepVi, E.p.variants.length - 1);
      E.dirty = false;
      E.savedAt = r.popup.date_upd;
      A.toast(h(E.p.status === 'live' ? T('Saved. Live on the shop now.') : T('Saved.')));
      var st = d.getElementById('psx-saved');
      if (st) st.textContent = T('Saved {t}', { t: (E.savedAt || '').slice(11, 16) });
      if (cb) cb();
    });
  }
  function validate() {
    var p = E.p;
    if (p.date_start && p.date_end && p.date_end < p.date_start) return T('The end is before the start.');
    var t = p.settings.triggers;
    if (t.clickOn && t.clickSel) { try { d.querySelector(t.clickSel); } catch (e) { return T('The click selector is not a valid CSS selector.'); } }
    return '';
  }
  w.addEventListener('beforeunload', function (e) { if (A.view === 'editor' && E.dirty) { e.preventDefault(); e.returnValue = ''; } });
  d.addEventListener('keydown', function (e) {
    if (A.view !== 'editor') return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !/INPUT|TEXTAREA|SELECT/.test((d.activeElement || {}).tagName || '')) { e.preventDefault(); (e.shiftKey ? act.ed_redo : act.ed_undo)(); }
  });

  /* ---------- design tab ---------- */
  function designTab() {
    var st = steps();
    var stepBtns = st.map(function (s, i) {
      var blocks = []; cols(s).forEach(function (c) { blocks = blocks.concat(c.blocks || []); });
      var hint = blocks.filter(function (b) { return ['form', 'coupon', 'wheel', 'choices'].indexOf(b.type) !== -1; }).map(function (b) { return typeName(b.type); })[0] || T('{n} blocks', { n: blocks.length });
      return '<button type="button" class="psx-stepb" data-a="ed_step" data-v="' + i + '" aria-pressed="' + (E.step === i) + '">' + (i + 1) + ' · ' + h(s.name || T('Step')) + '<div style="font-weight:400;color:#5B6170">' + h(hint) + '</div></button>';
    }).join('');
    var tiles = TYPES.map(function (t) {
      return '<button type="button" class="psx-tile" draggable="true" data-a="ed_add" data-v="' + t[0] + '" data-drag="new:' + t[0] + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + t[2] + '"/></svg>' + h(T(t[1])) + '</button>';
    }).join('');
    var c = cols();
    var layers = c.map(function (col, ci) {
      return (c.length > 1 ? '<div class="psx-colh"><span>' + h(T('Column {n}', { n: ci + 1 })) + (col.cls ? ' · ' + h(col.cls) : '') + '</span></div>' : '') +
        (col.blocks || []).map(function (b) {
          return '<button type="button" class="psx-lay" draggable="true" data-a="ed_sel" data-v="' + b.id + '" data-drag="move:' + b.id + '" data-drop="' + b.id + '" aria-pressed="' + (E.sel === b.id) + '"><span class="mono" style="color:#7A808C;width:16px">' + h(typeName(b.type).charAt(0)) + '</span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + h(typeName(b.type)) + (b.cls ? ' <span class="muted">.' + h(b.cls.split(' ')[0]) + '</span>' : '') + '</span>' + (b.m && b.m.hide ? '<span class="muted" style="font-size:11px">' + h(T('desktop only')) + '</span>' : '') + '</button>';
        }).join('') + '<div class="psx-coldrop" data-dropcol="' + ci + '"></div>';
    }).join('');
    var decor = (doc().decor || []).map(function (dc, i) {
      return '<button type="button" class="psx-lay" data-a="ed_decsel" data-v="' + i + '" aria-pressed="' + (E.decorSel === i) + '"><span class="mono" style="color:#7A808C;width:16px">◎</span><span style="flex:1">' + h(dc.name || (T('Decor') + ' ' + (i + 1))) + '</span><span class="muted" style="font-size:11px">' + h(T('free layer')) + '</span></button>';
    }).join('');
    return '<div class="psx-ed-body">' +
      '<aside class="psx-side" aria-label="' + h(T('Steps and blocks')) + '">' +
      '<div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;align-items:center"><h2 class="psx-sec">' + h(T('Steps')) + '</h2><button type="button" class="psx-ib" style="width:28px;height:28px" data-a="ed_addstep" aria-label="' + h(T('Add a step')) + '">' + A.icon('plus', 16) + '</button></div><div class="psx-steps">' + stepBtns + '</div></div>' +
      '<div style="display:flex;flex-direction:column;gap:8px"><h2 class="psx-sec">' + h(T('Blocks: click to add, or drag onto the popup')) + '</h2><div class="psx-tiles">' + tiles + '</div></div>' +
      '<div style="display:flex;flex-direction:column;gap:2px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><h2 class="psx-sec">' + h(T('Layers, step {n}', { n: E.step + 1 })) + '</h2><button type="button" class="psx-btn2 sm ghost" data-a="ed_popupset">' + h(T('Popup settings')) + '</button></div>' + layers + decor + '</div>' +
      '</aside>' +
      '<section class="psx-canvas" aria-label="' + h(T('Live preview')) + '"><div class="psx-stagew"><iframe id="psx-stage" class="psx-stage' + (E.dev === 'm' ? ' m' : '') + '" title="' + h(T('Live preview')) + '"></iframe></div>' +
      '<div class="psx-canvas-f"><span>' + h(T('Click a block to edit it. Drag blocks or layers to move them; a red line shows where they land.')) + '</span><span class="mono">' + h(T('Ctrl+S saves · Ctrl+Z undoes')) + '</span></div></section>' +
      '<aside class="psx-insp" id="psx-insp" aria-label="' + h(T('Settings')) + '">' + inspector() + '</aside></div>';
  }

  act.ed_step = function (t) { E.step = +t.getAttribute('data-v'); E.sel = null; E.decorSel = null; draw(); };
  act.ed_addstep = function () {
    snapshot();
    var id = 's' + (steps().length + 1) + Math.random().toString(36).slice(2, 4);
    steps().push({ id: id, name: T('Step {n}', { n: steps().length + 1 }), cols: [{ blocks: [newBlock('heading'), newBlock('text'), newBlock('button')] }] });
    E.step = steps().length - 1; E.sel = null;
    changed(true); draw();
  };
  act.ed_popupset = function () { E.sel = null; E.decorSel = null; refreshInspector(); highlight(); markLayers(); };
  act.ed_sel = function (t) { E.sel = t.getAttribute('data-v'); E.decorSel = null; E.insp = 'content'; refreshInspector(); highlight(); markLayers(); };
  act.ed_decsel = function (t) { E.decorSel = +t.getAttribute('data-v'); E.sel = null; refreshInspector(); markLayers(); };
  act.ed_add = function (t) { insertBlock(newBlock(t.getAttribute('data-v')), E.sel, 'after'); };

  function insertBlock(b, refId, where, colIdx) {
    snapshot();
    var c = cols();
    if (refId) {
      var f = find(refId);
      if (f && f.si === E.step) {
        f.c.blocks.splice(f.bi + (where === 'before' ? 0 : 1), 0, b);
      } else c[0].blocks.push(b);
    } else {
      (c[colIdx != null ? colIdx : 0].blocks = c[colIdx != null ? colIdx : 0].blocks || []).push(b);
    }
    E.sel = b.id;
    changed(true);
    draw();
  }
  function moveBlock(bid, refId, where, colIdx) {
    if (bid === refId) return;
    var f = find(bid);
    if (!f) return;
    snapshot();
    var b = f.c.blocks.splice(f.bi, 1)[0];
    if (refId) {
      var g = find(refId);
      if (g) g.c.blocks.splice(g.bi + (where === 'before' ? 0 : 1), 0, b); else f.c.blocks.splice(f.bi, 0, b);
    } else {
      var col = cols()[colIdx || 0];
      (col.blocks = col.blocks || []).push(b);
    }
    E.sel = bid;
    changed(true);
    draw();
  }
  E.moveBy = function (bid, dir) {
    var f = find(bid);
    if (!f) return;
    var to = f.bi + dir;
    if (to < 0 || to >= f.c.blocks.length) return;
    snapshot();
    var b = f.c.blocks.splice(f.bi, 1)[0];
    f.c.blocks.splice(to, 0, b);
    changed(true); draw();
  };

  /* drag and drop: palette tiles and layers, into layers or the preview */
  A.root.addEventListener('dragstart', function (e) {
    var t = e.target.closest('[data-drag]');
    if (!t) return;
    e.dataTransfer.setData('text/plain', t.getAttribute('data-drag'));
    e.dataTransfer.effectAllowed = 'copyMove';
    E.dragging = t.getAttribute('data-drag');
  });
  A.root.addEventListener('dragend', function () { E.dragging = null; clearDrop(); });
  A.root.addEventListener('dragover', function (e) {
    var t = e.target.closest('[data-drop],[data-dropcol]');
    if (!t || !E.dragging) return;
    e.preventDefault();
    clearDrop();
    if (t.hasAttribute('data-dropcol')) { t.classList.add('over'); return; }
    var r = t.getBoundingClientRect();
    t.classList.add(e.clientY < r.top + r.height / 2 ? 'drop-before' : 'drop-after');
  });
  A.root.addEventListener('drop', function (e) {
    var t = e.target.closest('[data-drop],[data-dropcol]');
    if (!t || !E.dragging) return;
    e.preventDefault();
    var where = t.classList.contains('drop-before') ? 'before' : 'after';
    var data = E.dragging;
    clearDrop();
    if (t.hasAttribute('data-dropcol')) applyDrop(data, null, null, +t.getAttribute('data-dropcol'));
    else applyDrop(data, t.getAttribute('data-drop'), where);
  });
  function clearDrop() {
    Array.prototype.forEach.call(A.root.querySelectorAll('.drop-before,.drop-after,.over'), function (n) { n.classList.remove('drop-before', 'drop-after', 'over'); });
  }
  function applyDrop(data, ref, where, colIdx) {
    E.dragging = null;
    if (!data) return;
    if (data.indexOf('new:') === 0) insertBlock(newBlock(data.slice(4)), ref, where, colIdx);
    else if (data.indexOf('move:') === 0) moveBlock(data.slice(5), ref, where, colIdx);
  }

  /* live preview in an isolated frame */
  var pvTimer = null;
  function preview() {
    clearTimeout(pvTimer);
    pvTimer = setTimeout(function () {
      var f = d.getElementById('psx-stage');
      if (!f) return;
      var docu = clone(doc());
      A.mount(f, docu, { mobile: E.dev === 'm', step: E.step, lang: E.lang, game: S().game, editor: true, consentText: B.settings.gdpr_text, coupon: 'WELCOME-7KQ2M9XA', expires: '06/12/2026', i18n: { copy: T('Copy') } }, function (W, node) {
        wireFrame(W, node);
        highlight();
      });
    }, 60);
  }
  function wireFrame(W, node) {
    var D = W.document;
    if (D.__psxWired) return;
    D.__psxWired = true;
    D.addEventListener('click', function (e) {
      var t = e.target.closest('[data-bid]');
      e.preventDefault();
      if (t) { E.sel = t.getAttribute('data-bid'); E.decorSel = null; E.insp = 'content'; refreshInspector(); highlight(); markLayers(); }
      else if (!e.target.closest('.psx-box')) { E.sel = null; refreshInspector(); highlight(); markLayers(); }
    }, true);
    D.addEventListener('submit', function (e) { e.preventDefault(); }, true);
    D.addEventListener('mouseover', function (e) {
      Array.prototype.forEach.call(D.querySelectorAll('.psx-ed-hover'), function (n) { n.classList.remove('psx-ed-hover'); });
      var t = e.target.closest('[data-bid]');
      if (t && t.getAttribute('data-bid') !== E.sel) t.classList.add('psx-ed-hover');
    });
    D.addEventListener('dragover', function (e) {
      if (!E.dragging) return;
      e.preventDefault();
      Array.prototype.forEach.call(D.querySelectorAll('.psx-ed-drop-before,.psx-ed-drop-after'), function (n) { n.classList.remove('psx-ed-drop-before', 'psx-ed-drop-after'); });
      var t = e.target.closest('[data-bid]');
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.classList.add(e.clientY < r.top + r.height / 2 ? 'psx-ed-drop-before' : 'psx-ed-drop-after');
    });
    D.addEventListener('drop', function (e) {
      if (!E.dragging) return;
      e.preventDefault();
      var t = D.querySelector('.psx-ed-drop-before,.psx-ed-drop-after');
      var data = E.dragging;
      if (t) applyDrop(data, t.getAttribute('data-bid'), t.classList.contains('psx-ed-drop-before') ? 'before' : 'after');
      else applyDrop(data, null, null, 0);
    });
  }
  function highlight() {
    var f = d.getElementById('psx-stage');
    if (!f || !f.contentDocument) return;
    var D = f.contentDocument;
    Array.prototype.forEach.call(D.querySelectorAll('.psx-ed-sel'), function (n) { n.classList.remove('psx-ed-sel'); });
    if (E.sel) { var n = D.querySelector('[data-bid="' + E.sel + '"]'); if (n) { n.classList.add('psx-ed-sel'); n.scrollIntoView({ block: 'nearest' }); } }
  }
  function markLayers() {
    Array.prototype.forEach.call(A.root.querySelectorAll('.psx-lay'), function (n) {
      var isDec = n.getAttribute('data-a') === 'ed_decsel';
      n.setAttribute('aria-pressed', String(isDec ? E.decorSel === +n.getAttribute('data-v') : E.sel === n.getAttribute('data-v')));
    });
  }
  function refreshInspector() { var n = d.getElementById('psx-insp'); if (n) n.innerHTML = inspector(); }

  /* ---------- inspector ---------- */
  function lv(v) { return v && typeof v === 'object' ? (v[E.lang] != null ? v[E.lang] : '') : (v || ''); }
  function langPh(v) { return v && typeof v === 'object' ? (v.en || v[Object.keys(v)[0]] || '') : ''; }
  function F(kind, path, label, opt) {
    opt = opt || {};
    var base = path.charAt(0) === '@' ? E.p : (path.charAt(0) === '#' ? doc() : (find(E.sel) || {}).b);
    var p2 = path.replace(/^[@#]/, '');
    var val = getPath(base || {}, p2);
    var id = 'f' + Math.random().toString(36).slice(2, 8);
    var attrs = 'id="' + id + '" data-f="' + h(path) + '" data-k="' + kind + '"';
    var hint = opt.hint ? '<span class="psx-hint">' + h(opt.hint) + '</span>' : '';
    switch (kind) {
      case 'lt': return '<label class="psx-lbl" for="' + id + '">' + h(label) + '<input class="psx-inp" ' + attrs + ' data-i="ed_f" value="' + h(lv(val)) + '" placeholder="' + h(E.lang !== 'en' ? langPh(val) : (opt.ph || '')) + '">' + hint + '</label>';
      case 'la': return '<label class="psx-lbl" for="' + id + '">' + h(label) + '<textarea class="psx-inp" rows="' + (opt.rows || 3) + '" ' + attrs + ' data-i="ed_f" placeholder="' + h(E.lang !== 'en' ? langPh(val) : '') + '">' + h(lv(val)) + '</textarea>' + hint + '</label>';
      case 'tx': return '<label class="psx-lbl" for="' + id + '">' + h(label) + '<input class="psx-inp' + (opt.mono ? ' mono' : '') + '" ' + attrs + ' data-i="ed_f" value="' + h(val == null ? '' : val) + '" placeholder="' + h(opt.ph || '') + '">' + hint + '</label>';
      case 'ta': return '<label class="psx-lbl" for="' + id + '">' + h(label) + '<textarea class="psx-inp mono" rows="' + (opt.rows || 6) + '" ' + attrs + ' data-i="ed_f" spellcheck="false">' + h(val == null ? '' : val) + '</textarea>' + hint + '</label>';
      case 'nu': return '<label class="psx-lbl" for="' + id + '">' + h(label) + '<input type="number" class="psx-inp mono" ' + attrs + ' data-i="ed_f" value="' + h(val == null ? '' : val) + '"' + (opt.min != null ? ' min="' + opt.min + '"' : '') + (opt.max != null ? ' max="' + opt.max + '"' : '') + (opt.step ? ' step="' + opt.step + '"' : '') + '>' + hint + '</label>';
      case 'dt': return '<label class="psx-lbl" for="' + id + '">' + h(label) + '<input type="datetime-local" class="psx-inp mono" ' + attrs + ' data-c="ed_f" value="' + h((val || '').replace(' ', 'T').slice(0, 16)) + '">' + hint + '</label>';
      case 'se': return '<label class="psx-lbl" for="' + id + '">' + h(label) + '<select class="psx-inp" ' + attrs + ' data-c="ed_f"' + (opt.redraw ? ' data-redraw="1"' : '') + '>' + opt.options.map(function (o) { return '<option value="' + h(o[0]) + '"' + (String(val == null ? (opt.def || '') : val) === String(o[0]) ? ' selected' : '') + '>' + h(o[1]) + '</option>'; }).join('') + '</select>' + hint + '</label>';
      case 'tg': return '<div class="psx-ln"><span>' + h(label) + (opt.hint ? '<span class="psx-hint" style="display:block">' + h(opt.hint) + '</span>' : '') + '</span><button type="button" class="psx-sw" role="switch" aria-checked="' + (!!val) + '" aria-label="' + h(label) + '" data-a="ed_tg" data-f="' + h(path) + '"' + (opt.redraw ? ' data-redraw="1"' : '') + '></button></div>';
      case 'co': return '<label class="psx-swatch" for="' + id + '"><input type="color" ' + attrs + ' data-i="ed_f" value="' + h(toHex(val || opt.def || '#000000')) + '">' + h(label) + '</label>';
      case 'step':
        var o2 = [['next', T('Next step')]].concat(steps().map(function (s, i) { return [s.id, (i + 1) + ' · ' + (s.name || '')]; }));
        return F('se', path, label, { options: o2, def: 'next' });
    }
    return '';
  }
  function toHex(c) {
    if (/^#[0-9a-f]{6}$/i.test(c)) return c;
    if (/^#[0-9a-f]{3}$/i.test(c)) return '#' + c.slice(1).split('').map(function (x) { return x + x; }).join('');
    return '#000000';
  }
  function luminance(hex) {
    hex = toHex(hex);
    var rgb = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  }
  function contrast(a, b) { var l1 = luminance(a), l2 = luminance(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  function contrastChip(label, a, b) {
    if (!a || !b || !/^#/.test(a) || !/^#/.test(b)) return '';
    var r = contrast(a, b);
    var ok = r >= 4.5;
    return '<div class="psx-contrast ' + (ok ? 'ok' : 'bad') + '">' + (ok ? '✓ ' : '! ') + h(T('{what} contrast {r} : 1, {v}', { what: label, r: r.toFixed(1), v: ok ? T('passes') : T('too low for small text') })) + '</div>';
  }

  act.ed_f = function (t) {
    var path = t.getAttribute('data-f');
    var kind = t.getAttribute('data-k');
    var base = path.charAt(0) === '@' ? E.p : (path.charAt(0) === '#' ? doc() : (find(E.sel) || {}).b);
    if (!base) return;
    var p2 = path.replace(/^[@#]/, '');
    snapshot();
    var v = t.value;
    if (kind === 'nu') v = v === '' ? '' : +v;
    if (kind === 'dt') v = v.replace('T', ' ');
    if (kind === 'lt' || kind === 'la') {
      var cur0 = getPath(base, p2);
      var map = cur0 && typeof cur0 === 'object' ? cur0 : { en: cur0 || '' };
      map[E.lang] = v;
      setPath(base, p2, map);
    } else setPath(base, p2, v);
    changed(E.tab !== 'design');
    if (t.getAttribute('data-redraw')) { if (E.tab === 'design') refreshInspector(); else draw(); }
    if (E.tab !== 'design') sentence();
  };
  act.ed_tg = function (t) {
    var path = t.getAttribute('data-f');
    var base = path.charAt(0) === '@' ? E.p : (path.charAt(0) === '#' ? doc() : (find(E.sel) || {}).b);
    var p2 = path.replace(/^[@#]/, '');
    snapshot();
    var on = !getPath(base, p2);
    setPath(base, p2, on);
    t.setAttribute('aria-checked', String(on));
    var row = t.closest('.psx-trow');
    if (row) { row.classList.toggle('on', on); row.classList.toggle('off', !on); }
    changed(E.tab !== 'design');
    if (t.getAttribute('data-redraw')) { if (E.tab === 'design') refreshInspector(); else draw(); }
    if (E.tab !== 'design') sentence();
  };

  function inspector() {
    if (E.decorSel != null && (doc().decor || [])[E.decorSel]) return decorPanel();
    var f = E.sel ? find(E.sel) : null;
    if (!f) return popupPanel();
    var b = f.b;
    var tabs = '<div class="psx-seg" role="group" aria-label="' + h(T('Settings group')) + '" style="align-self:flex-start">' + [['content', T('Content')], ['style', T('Style')], ['mobile', T('Mobile')]].map(function (x) { return '<button type="button" data-a="ed_insp" data-v="' + x[0] + '" aria-pressed="' + (E.insp === x[0]) + '">' + h(x[1]) + '</button>'; }).join('') + '</div>';
    var tools = '<div style="display:flex;gap:2px;flex-wrap:wrap"><button type="button" class="psx-ib" data-a="ed_mv" data-v="-1" aria-label="' + h(T('Move block up')) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg></button><button type="button" class="psx-ib" data-a="ed_mv" data-v="1" aria-label="' + h(T('Move block down')) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button><button type="button" class="psx-ib" data-a="ed_dup" aria-label="' + h(T('Duplicate block')) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg></button><button type="button" class="psx-ib" data-a="ed_del" aria-label="' + h(T('Delete block')) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>' +
      (cols().length > 1 ? '<label><span class="sr">' + h(T('Column')) + '</span><select class="psx-inp" style="width:110px;height:34px" data-c="ed_col">' + cols().map(function (c, i) { return '<option value="' + i + '"' + (f.ci === i ? ' selected' : '') + '>' + h(T('Column {n}', { n: i + 1 })) + '</option>'; }).join('') + '</select></label>' : '') + '</div>';
    var body = E.insp === 'content' ? content(b) : (E.insp === 'style' ? styleFields(b) : mobileFields(b));
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h2>' + h(typeName(b.type)) + '</h2><span class="mono muted" style="font-size:12px">' + h(T('block {a} of {b}', { a: f.bi + 1, b: f.c.blocks.length })) + '</span></div>' + tools + tabs + '<div style="display:flex;flex-direction:column;gap:14px">' + body + '</div>';
  }
  act.ed_insp = function (t) { E.insp = t.getAttribute('data-v'); refreshInspector(); };
  act.ed_mv = function (t) { E.moveBy(E.sel, +t.getAttribute('data-v')); };
  act.ed_dup = function () { var f = find(E.sel); if (!f) return; snapshot(); var c = clone(f.b); c.id = uid(); f.c.blocks.splice(f.bi + 1, 0, c); E.sel = c.id; changed(true); draw(); };
  act.ed_del = function () { var f = find(E.sel); if (!f) return; snapshot(); f.c.blocks.splice(f.bi, 1); E.sel = null; changed(true); draw(); };
  act.ed_col = function (t) { var f = find(E.sel); if (!f) return; snapshot(); var b = f.c.blocks.splice(f.bi, 1)[0]; var col = cols()[+t.value]; (col.blocks = col.blocks || []).push(b); changed(true); draw(); };

  function actOptions() { return [['close', T('Close the popup')], ['next', T('Go to the next step')], ['step', T('Go to a chosen step')], ['url', T('Open a page')], ['copy', T('Copy the coupon')], ['apply', T('Apply the coupon to the cart')], ['play', T('Spin the wheel')]]; }

  function content(b) {
    var x = [];
    switch (b.type) {
      case 'heading': x.push(F('la', 't', T('Text'), { rows: 2, hint: T('**bold**, *italic*, and tags like {firstname} work.') }), F('se', 'level', T('Level'), { options: [[2, 'H2'], [3, 'H3'], [4, 'H4']], def: 2 })); break;
      case 'text': case 'small': x.push(F('la', 't', T('Text'), { rows: 4, hint: T('**bold**, *italic*, [link](https://…) and tags like {cart_total} work.') })); break;
      case 'badge': x.push(F('lt', 't', T('Text'))); break;
      case 'image': x.push(F('tx', 'src', T('Image address'), { ph: 'https://…/photo.jpg', hint: T('Leave empty to keep the template\'s drawn placeholder.') }), F('lt', 'alt', T('Description for screen readers')), F('lt', 'caption', T('Caption'))); break;
      case 'button': case 'link':
        x.push(F('lt', 't', T('Label')), F('se', 'act', T('When clicked'), { options: actOptions(), def: 'close', redraw: true }));
        if (b.act === 'step') x.push(F('step', 'step', T('Step')));
        if (b.act === 'url') x.push(F('tx', 'href', T('Page address'), { ph: '/en/new-arrivals' }));
        if (b.type === 'button') x.push(F('se', 'variant', T('Look'), { options: [['primary', T('Filled')], ['secondary', T('Outline')]], def: 'primary' }), F('tg', 'full', T('Full width')));
        break;
      case 'form':
        x.push(F('lt', 'label', T('Field label')), F('lt', 'ph', T('Placeholder')), F('lt', 'btn', T('Button label')), F('se', 'layout', T('Layout'), { options: [['stack', T('Button under the field')], ['inline', T('Button beside the field')]], def: 'stack' }), F('tg', 'hideLabel', T('Hide the field label (still read by screen readers)')),
          '<h3 class="psx-sec">' + h(T('Fields')) + '</h3>', '<div class="psx-ln"><span>' + h(T('Email')) + '</span><span class="psx-hint">' + h(T('always on')) + '</span></div>', F('tg', 'name', T('First name'), { redraw: true }));
        if (b.name) x.push(F('lt', 'nameLabel', T('First name label')));
        x.push(F('tg', 'phone', T('Phone')), F('tg', 'consent', T('Consent checkbox'), { redraw: true }));
        if (b.consent) x.push(F('la', 'consentText', T('Consent text'), { rows: 3, hint: B.settings.gdpr_text ? T('Empty uses the text from the GDPR module.') : T('Logged with the date and IP for each signup.') }), F('tg', 'consentRequired', T('Visitors must tick it')));
        x.push(F('se', '@settings.form.list', T('Signups go to'), { options: [['newsletter', T('Newsletter (ps_emailsubscription) and leads')], ['leads', T('Leads list only')]] }), F('step', 'next', T('After submit, go to')),
          '<h3 class="psx-sec">' + h(T('Coupon given after signup')) + '</h3>', F('se', '@settings.coupon.mode', T('Coupon'), { options: [['none', T('No coupon')], ['fixed', T('A fixed code')], ['generated', T('A unique code for each signup')]], redraw: true }));
        var cm = S().coupon.mode;
        if (cm === 'fixed') x.push(F('tx', '@settings.coupon.code', T('Code'), { mono: true, hint: T('Create it in Catalog › Discounts first.') }));
        if (cm === 'generated') x.push(couponFields('@settings.coupon'));
        if (cm !== 'none') x.push(F('tg', '@settings.coupon.autoApply', T('Apply it to the cart automatically')));
        break;
      case 'coupon': x.push(F('lt', 'copy', T('Copy button label')), F('lt', 'note', T('Note under the code'), { hint: T('{coupon_expiry} shows the end date.') }), F('tx', 'code', T('Sample code shown in the editor'), { mono: true })); break;
      case 'countdown':
        x.push(F('se', 'mode', T('Counts down to'), { options: [['date', T('A fixed date')], ['evergreen', T('A time per visitor')]], redraw: true }));
        if (b.mode === 'date') x.push(F('dt', 'end', T('End date'))); else x.push(F('nu', 'minutes', T('Minutes per visitor'), { min: 1 }));
        x.push(F('se', 'look', T('Look'), { options: [['boxes', T('Boxes')], ['flap', T('Split flap')], ['plain', T('Plain')]] }), F('tg', 'noDays', T('Hide days')), F('tg', 'hideAtZero', T('Close the popup at zero')));
        break;
      case 'wheel': x.push(F('se', 'look', T('Look'), { options: [['plain', T('Plain')], ['bulbs', T('Light bulbs')], ['ticks', T('Watch dial')]] }), F('tg', '@settings.game.emailFirst', T('Ask for the email before the spin'), { hint: T('The form on this step then spins the wheel.') }), prizes()); break;
      case 'scratch': x.push(F('lt', 'prize', T('Prize text'), { hint: T('{prize} is the prize drawn by the shop.') }), F('lt', 'reveal', T('Reveal button label')), prizes()); break;
      case 'pick': x.push(F('se', 'look', T('Look'), { options: [['gift', T('Gift boxes')], ['card', T('Cards')], ['envelope', T('Envelopes')]] }), prizes()); break;
      case 'prize': x.push(F('lt', 't', T('Text'), { hint: T('{prize} is the prize drawn.') })); break;
      case 'video': x.push(F('tx', 'src', T('Video address'), { ph: 'https://youtu.be/… or https://vimeo.com/… or .mp4', hint: T('Loaded only when the visitor presses play. YouTube uses the no-cookie domain.') }), F('tx', 'poster', T('Cover image address'))); break;
      case 'product':
        x.push(F('se', 'source', T('Which product'), { options: [['bestseller', T('Bestseller (in this category on category pages)')], ['viewed', T('The last product viewed')], ['fixed', T('A chosen product')]], redraw: true }));
        if (b.source === 'fixed') x.push(picker('product', 'id_product', T('Product')));
        x.push(F('lt', 'btn', T('Button label')), F('lt', 'view', T('Second button (empty hides it)')), F('lt', 'lowStock', T('Low stock note'), { hint: T('{n} is the quantity left; shown under 10.') }));
        break;
      case 'cart': x.push(F('nu', 'max', T('Lines shown'), { min: 1, max: 4 }), F('lt', 'totalLabel', T('Total label'))); break;
      case 'meter': x.push(F('nu', 'threshold', T('Free shipping from'), { min: 0, hint: T('0 uses the shop setting (Shipping › Preferences).') }), F('lt', 't_empty', T('Empty cart text')), F('lt', 't_progress', T('Partway text')), F('lt', 't_done', T('Reached text'))); break;
      case 'ladder': x.push(listEditor('tiers', [['nu', 'min', T('From')], ['nu', 'pct', T('% off')]], T('Tier')), F('lt', 'doneT', T('Reached')), F('lt', 'nextT', T('Next tier')), F('lt', 'todoT', T('Later tiers'))); break;
      case 'choices': x.push(F('tx', 'q', T('Question key (for stats)'), { mono: true }), listEditor('options', [['lt', 't', T('Answer')], ['tx', 'key', T('Key')], ['step', 'step', T('Then go to')]], T('Answer')), F('lt', 'submit', T('Send button (empty sends on click)')), F('tg', 'letters', T('Show A, B, C'))); break;
      case 'stars': x.push(F('tx', 'q', T('Question key (for stats)'), { mono: true }), F('nu', 'cut', T('Low score is up to'), { min: 1, max: 4 }), F('step', 'low', T('Low score goes to')), F('step', 'high', T('High score goes to')), F('lt', 'lo', T('Left label')), F('lt', 'hi', T('Right label'))); break;
      case 'chips': x.push(listEditor('options', [['lt', 't', T('Label')], ['tx', 'key', T('Key')]], T('Option'))); break;
      case 'textarea': x.push(F('lt', 'label', T('Label')), F('lt', 'ph', T('Placeholder')), F('tx', 'name', T('Field name'), { mono: true })); break;
      case 'list': x.push(listEditor('items', [['lt', 'k', T('Left')], ['lt', 'v', T('Right')]], T('Row'))); break;
      case 'social': x.push(listEditor('links', [['lt', 't', T('Label')], ['tx', 'url', T('Address')]], T('Link'))); break;
      case 'marquee': x.push(listEditor('items', [['lt', '', T('Message')]], T('Message')), F('tx', 'sep', T('Separator'))); break;
      case 'spacer': x.push(F('nu', 'h', T('Height (px)'), { min: 0 })); break;
      case 'html': x.push(F('la', 'html', T('HTML'), { rows: 8, hint: T('For advanced use. Scripts are not run.') })); break;
      case 'divider': x.push('<p class="psx-hint">' + h(T('A thin line. Style it from the template or the Style tab.')) + '</p>'); break;
    }
    return x.join('');
  }
  function couponFields(base) {
    return F('se', base + '.type', T('Discount'), { options: [['percent', T('Percent off')], ['amount', T('Amount off')], ['shipping', T('Free shipping')]], redraw: true }) +
      '<div class="psx-row2">' + (getPath(E.p, base.slice(1) + '.type') !== 'shipping' ? F('nu', base + '.value', T('Value'), { min: 0 }) : '') + F('nu', base + '.days', T('Valid for (days)'), { min: 1 }) + '</div>' +
      '<div class="psx-row2">' + F('nu', base + '.min', T('Minimum order'), { min: 0 }) + F('tx', base + '.prefix', T('Code prefix'), { mono: true }) + '</div>' +
      '<p class="psx-hint">' + h(T('One cart rule per signup, one use, created in Catalog › Discounts.')) + '</p>';
  }
  function prizes() {
    var g = S().game || (S().game = { type: 'wheel', prizes: [], emailFirst: false });
    if (!g.prizes) g.prizes = [];
    var items = g.prizes.map(function (p, i) {
      var base = '@settings.game.prizes.' + i;
      return '<div class="psx-item"><div class="psx-item-h"><span>' + h(T('Prize {n}', { n: i + 1 })) + '</span><button type="button" class="psx-ib" data-a="ed_pdel" data-v="' + i + '" aria-label="' + h(T('Remove prize {n}', { n: i + 1 })) + '">✕</button></div>' +
        F('lt', base + '.label', T('Label')) + '<div class="psx-row2">' + F('nu', base + '.weight', T('Odds weight'), { min: 0 }) + F('nu', base + '.stock', T('Stock (empty = no limit)'), { min: 0 }) + '</div>' +
        F('se', base + '.coupon.type', T('Gives'), { options: [['percent', T('Percent off')], ['amount', T('Amount off')], ['shipping', T('Free shipping')], ['', T('Nothing (try again)')]], redraw: true }) +
        (p.coupon && p.coupon.type ? '<div class="psx-row2">' + (p.coupon.type !== 'shipping' ? F('nu', base + '.coupon.value', T('Value'), { min: 0 }) : '') + F('nu', base + '.coupon.days', T('Valid days'), { min: 1 }) + '</div>' : '') +
        '<div class="psx-swatches">' + F('co', base + '.color', T('Slice')) + F('co', base + '.ink', T('Text')) + '</div></div>';
    }).join('');
    var total = g.prizes.reduce(function (a, p) { return a + (+p.weight || 0); }, 0);
    return '<h3 class="psx-sec">' + h(T('Prizes, drawn on the server')) + '</h3><div class="psx-items">' + items + '</div><button type="button" class="psx-btn2 sm" data-a="ed_padd">' + h(T('+ Add a prize')) + '</button>' +
      (g.prizes.length ? '<p class="psx-hint">' + h(T('Chances: {list}', { list: g.prizes.map(function (p) { return (A.B && (p.label && (p.label[E.lang] || p.label.en))) + ' ' + (total ? Math.round((+p.weight || 0) / total * 100) : 0) + '%'; }).join(', ') })) + '</p>' : '');
  }
  act.ed_padd = function () { snapshot(); var g = S().game || (S().game = { type: 'wheel', prizes: [] }); g.prizes.push({ key: 'p' + (g.prizes.length + 1), label: { en: '10% off' }, weight: 10, stock: '', coupon: { type: 'percent', value: 10, days: 14 } }); changed(); refreshInspector(); };
  act.ed_pdel = function (t) { snapshot(); S().game.prizes.splice(+t.getAttribute('data-v'), 1); changed(); refreshInspector(); };

  function listEditor(key, fields, label) {
    var b = find(E.sel).b;
    var arr = b[key] || (b[key] = []);
    return '<h3 class="psx-sec">' + h(label) + 's</h3><div class="psx-items">' + arr.map(function (it, i) {
      return '<div class="psx-item"><div class="psx-item-h"><span>' + h(label + ' ' + (i + 1)) + '</span><span><button type="button" class="psx-ib" data-a="ed_lmv" data-k="' + key + '" data-v="' + i + '" aria-label="' + h(T('Move up')) + '">↑</button><button type="button" class="psx-ib" data-a="ed_ldel" data-k="' + key + '" data-v="' + i + '" aria-label="' + h(T('Remove')) + '">✕</button></span></div>' +
        fields.map(function (fl) { return F(fl[0], key + '.' + i + (fl[1] ? '.' + fl[1] : ''), fl[2]); }).join('') + '</div>';
    }).join('') + '</div><button type="button" class="psx-btn2 sm" data-a="ed_ladd" data-k="' + key + '">' + h(T('+ Add')) + '</button>';
  }
  act.ed_ladd = function (t) {
    var b = find(E.sel).b; var k = t.getAttribute('data-k'); snapshot();
    var sample = (b[k] && b[k][0]) ? clone(b[k][0]) : {};
    if (typeof sample === 'object' && sample.key) sample.key = sample.key + (b[k].length + 1);
    (b[k] = b[k] || []).push(sample);
    changed(); refreshInspector();
  };
  act.ed_ldel = function (t) { var b = find(E.sel).b; snapshot(); b[t.getAttribute('data-k')].splice(+t.getAttribute('data-v'), 1); changed(); refreshInspector(); };
  act.ed_lmv = function (t) { var b = find(E.sel).b; var arr = b[t.getAttribute('data-k')]; var i = +t.getAttribute('data-v'); if (i < 1) return; snapshot(); arr.splice(i - 1, 0, arr.splice(i, 1)[0]); changed(); refreshInspector(); };

  function picker(kind, path, label) {
    var b = find(E.sel).b;
    var val = getPath(b, path);
    return '<div class="psx-lbl">' + h(label) + '<div class="psx-picker"><input class="psx-inp" placeholder="' + h(T('Search by name, reference or ID')) + '" data-i="ed_search" data-kind="' + kind + '" data-path="' + h(path) + '" value="' + h(val ? '#' + val : '') + '"><div class="res" hidden></div></div></div>';
  }
  var searchT = null;
  act.ed_search = function (t) {
    clearTimeout(searchT);
    var res = t.parentNode.querySelector('.res');
    searchT = setTimeout(function () {
      if (t.value.length < 1) { res.hidden = true; return; }
      api('search', { kind: t.getAttribute('data-kind'), q: t.value.replace(/^#/, '') }).then(function (r) {
        res.innerHTML = (r.items || []).map(function (it) { return '<button type="button" data-id="' + it.id + '">#' + it.id + ' ' + h(it.name) + '</button>'; }).join('') || '<p class="psx-hint" style="padding:8px 10px">' + h(T('Nothing found.')) + '</p>';
        res.hidden = false;
        Array.prototype.forEach.call(res.querySelectorAll('button'), function (bt) {
          bt.addEventListener('click', function () {
            if (t._cb) { t._cb(+bt.getAttribute('data-id'), bt.textContent); res.hidden = true; t.value = ''; return; }
            var b = find(E.sel).b; snapshot(); setPath(b, t.getAttribute('data-path'), +bt.getAttribute('data-id')); t.value = bt.textContent; res.hidden = true; changed();
          });
        });
      });
    }, 220);
  };

  function styleFields(b) {
    return [
      F('se', 'style.align', T('Alignment'), { options: [['', T('Template default')], ['left', T('Left')], ['center', T('Centre')], ['right', T('Right')]] }),
      '<div class="psx-row2">' + F('nu', 'style.size', T('Font size (px)'), { min: 8, max: 160 }) + F('se', 'style.weight', T('Weight'), { options: [['', T('Default')], ['400', T('Regular')], ['600', T('Semibold')], ['800', T('Bold')]] }) + '</div>',
      '<div class="psx-swatches">' + F('co', 'style.color', T('Text colour'), { def: (doc().theme || {}).ink }) + '<button type="button" class="psx-btn2 sm ghost" data-a="ed_clr" data-v="style.color">' + h(T('Reset')) + '</button></div>',
      '<div class="psx-row2">' + F('nu', 'style.mt', T('Space above (px)')) + F('nu', 'style.mb', T('Space below (px)')) + '</div>',
      F('nu', 'style.maxw', T('Maximum width (px)'), { min: 0 }),
      F('tx', 'cls', T('Template style'), { mono: true, hint: T('Class names the template uses for special looks, for example "stamp".') })
    ].join('');
  }
  act.ed_clr = function (t) { var b = find(E.sel).b; snapshot(); setPath(b, t.getAttribute('data-v'), ''); changed(); refreshInspector(); };
  function mobileFields() {
    return '<p class="psx-hint">' + h(T('These apply on phones only. Everything else follows desktop.')) + '</p>' + F('tg', 'm.hide', T('Hide this block on mobile')) + F('tg', 'd.hide', T('Hide this block on desktop')) + F('nu', 'm.size', T('Font size on mobile (px)'), { min: 8, max: 120 });
  }

  function decorPanel() {
    var i = E.decorSel;
    var base = '#decor.' + i;
    return '<div style="display:flex;justify-content:space-between;align-items:center"><h2>' + h(T('Decor layer')) + '</h2><button type="button" class="psx-btn2 sm ghost" data-a="ed_decdel">' + h(T('Remove')) + '</button></div><p class="psx-hint">' + h(T('Free-placed art such as stamps and stickers. Hidden from screen readers.')) + '</p>' +
      F('tx', base + '.name', T('Name')) + F('la', base + '.html', T('SVG or HTML'), { rows: 6 }) +
      '<div class="psx-row2">' + F('tx', base + '.left', T('Left')) + F('tx', base + '.top', T('Top')) + '</div><div class="psx-row2">' + F('tx', base + '.right', T('Right')) + F('tx', base + '.bottom', T('Bottom')) + '</div>' +
      '<div class="psx-row2">' + F('tx', base + '.width', T('Width')) + F('nu', base + '.rot', T('Rotation (°)')) + '</div>' + F('tx', base + '.cls', T('Class'), { mono: true }) +
      F('tg', base + '.hideMobile', T('Hide on mobile')) + F('tg', base + '.hideDesktop', T('Hide on desktop'));
  }
  act.ed_decdel = function () { snapshot(); doc().decor.splice(E.decorSel, 1); E.decorSel = null; changed(true); draw(); };

  function popupPanel() {
    var dc = doc();
    var th = dc.theme || (dc.theme = {});
    var fonts = Object.keys(B.fontFiles || {}).sort();
    var fontOpt = [['', T('Shop font')]].concat(fonts.map(function (f) { return [f, f]; }));
    var st = cur();
    var nc = cols().length;
    return '<h2>' + h(T('Popup')) + '</h2>' +
      F('se', '#format', T('Format'), { options: [['modal', T('Modal')], ['fullscreen', T('Full screen')], ['slidein', T('Slide-in')], ['bar', T('Bar')], ['drawer', T('Side drawer')], ['sheet', T('Bottom sheet')], ['inline', T('Inline (hook or widget)')]], redraw: true }) +
      (['slidein', 'bar', 'drawer'].indexOf(dc.format) !== -1 ? F('se', '#position', T('Position'), { options: dc.format === 'bar' ? [['top', T('Top')], ['bottom', T('Bottom')]] : (dc.format === 'drawer' ? [['right', T('Right')], ['left', T('Left')]] : [['br', T('Bottom right')], ['bl', T('Bottom left')], ['tr', T('Top right')], ['tl', T('Top left')]]) }) : '') +
      (dc.format === 'bar' ? F('se', '#bar', T('Bar behaviour'), { options: [['push', T('Pushes the page down (no overlap)')], ['overlay', T('Floats over the page')]] }) : '') +
      (dc.format === 'inline' ? '<p class="psx-hint">' + h(T('Place it with the hook displayPopupStudio (id={id}) or the Smarty tag {widget name="popupstudio" id={id}}.', { id: E.p.id || '?' })) + '</p>' : '') +
      (['fullscreen', 'bar', 'inline'].indexOf(dc.format) === -1 ? F('nu', '#width', T('Width on desktop (px)'), { min: 200, max: 1400 }) : '') +
      F('se', '#mobile.format', T('On phones it becomes'), { options: [['same', T('The same format')], ['sheet', T('A bottom sheet')], ['modal', T('A centred modal')], ['fullscreen', T('Full screen')]] }) +
      (['modal', 'fullscreen', 'drawer', 'sheet'].indexOf(dc.format) !== -1 ? F('tx', '#theme.overlay', T('Dimmed page colour'), { mono: true, ph: 'rgba(17,17,17,.55)' }) : '') +
      '<h3 class="psx-sec">' + h(T('Colours')) + '</h3><div class="psx-swatches" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">' +
      F('co', '#theme.bg', T('Background')) + F('co', '#theme.ink', T('Text')) + F('co', '#theme.accent', T('Button')) + F('co', '#theme.accentInk', T('Button text')) + F('co', '#theme.field', T('Field')) + F('co', '#theme.line', T('Field border')) + '</div>' +
      contrastChip(T('Button text'), th.accentInk, th.accent) + contrastChip(T('Body text'), th.ink, th.bg) +
      '<div class="psx-row2">' + F('se', '#theme.fh', T('Heading font'), { options: fontOpt }) + F('se', '#theme.fb', T('Body font'), { options: fontOpt }) + '</div>' +
      F('nu', '#theme.radius', T('Corner radius (px)'), { min: 0, max: 40 }) +
      F('se', '#closeBtn.look', T('Close button'), { options: [['x', '×'], ['circle', T('Circle')], ['text', T('Text')]] }) +
      '<h3 class="psx-sec">' + h(T('Step {n}', { n: E.step + 1 })) + '</h3>' + F('tx', '#steps.' + E.step + '.name', T('Step name')) +
      F('se', '#steps.' + E.step + '.__cols', T('Columns'), { options: [[1, '1'], [2, '2'], [3, '3']], def: nc }) +
      (steps().length > 1 ? '<button type="button" class="psx-btn2 sm" data-a="ed_delstep" style="align-self:flex-start">' + h(T('Delete this step')) + '</button>' : '') +
      '<details><summary class="psx-sec" style="cursor:pointer">' + h(T('Advanced: CSS')) + '</summary><div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">' +
      F('ta', '#customCss', T('Extra CSS for this popup'), { rows: 6, hint: T('"&" stands for this popup, for example: & .psx-h { letter-spacing: 0 }') }) +
      '<button type="button" class="psx-btn2 sm" data-a="ed_decadd" style="align-self:flex-start">' + h(T('+ Add a decor layer')) + '</button></div></details>' +
      '<p class="psx-hint">' + h(st && st.cols && st.cols.length ? '' : '') + '</p>';
  }
  act.ed_delstep = function () {
    A.confirm(T('Delete step {n}?', { n: E.step + 1 }), T('Its blocks go too.'), T('Delete step'), function () { snapshot(); steps().splice(E.step, 1); E.step = 0; E.sel = null; changed(true); draw(); });
  };
  act.ed_decadd = function () { snapshot(); var dc = doc(); (dc.decor = dc.decor || []).push({ name: T('Decor'), html: '<svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" stroke-width="2"/></svg>', right: '20px', top: '20px' }); E.decorSel = dc.decor.length - 1; changed(true); draw(); };
  var origF = act.ed_f;
  act.ed_f = function (t) {
    var path = t.getAttribute('data-f') || '';
    var m = /^#steps\.(\d+)\.__cols$/.exec(path);
    if (m) {
      snapshot();
      var s = steps()[+m[1]];
      var c = cols(s);
      var n = +t.value;
      while (c.length < n) c.push({ blocks: [] });
      while (c.length > n) { var gone = c.pop(); c[c.length - 1].blocks = c[c.length - 1].blocks.concat(gone.blocks || []); }
      changed(true); draw();
      return;
    }
    origF(t);
  };

  /* ---------- triggers tab ---------- */
  function trow(on, path, iconPath, sentenceHtml, sub, label) {
    return '<div class="psx-trow ' + (on ? 'on' : 'off') + '"><div class="ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="' + iconPath + '"/></svg></div><div style="flex:1"><div class="psx-sent">' + sentenceHtml + '</div>' + (sub ? '<div class="psx-sub">' + h(sub) + '</div>' : '') + '</div><button type="button" class="psx-sw" role="switch" aria-checked="' + (!!on) + '" aria-label="' + h(label) + '" data-a="ed_tg" data-f="' + path + '" style="margin-top:6px"></button></div>';
  }
  function n(path, label, w2) { var v = getPath(E.p, path.slice(1)); return '<input class="psx-num" style="' + (w2 ? 'width:' + w2 + 'px' : '') + '" type="number" min="0" value="' + h(v) + '" aria-label="' + h(label) + '" data-f="' + path + '" data-k="nu" data-i="ed_f">'; }
  function sel(path, label, opts) { var v = getPath(E.p, path.slice(1)); return '<select class="psx-tsel" aria-label="' + h(label) + '" data-f="' + path + '" data-k="se" data-c="ed_f">' + opts.map(function (o) { return '<option value="' + h(o[0]) + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + h(o[1]) + '</option>'; }).join('') + '</select>'; }
  function txt(path, label, ph, lang) {
    var v = getPath(E.p, path.slice(1));
    return '<input class="psx-ttxt" value="' + h(lang ? lv(v) : v) + '" placeholder="' + h(ph || '') + '" aria-label="' + h(label) + '" data-f="' + path + '" data-k="' + (lang ? 'lt' : 'tx') + '" data-i="ed_f">';
  }
  function words() {
    if (E.tab === 'triggers') {
      var c = S().close;
      var bits = [];
      if (c.x !== false) bits.push(T('the X'));
      if (c.overlay !== false) bits.push(T('a click on the dimmed page'));
      if (c.esc !== false) bits.push(T('Esc'));
      return '<strong>' + h(T('In words:')) + '</strong> ' + h(T('shows {when}.', { when: A.say.when(S()).toLowerCase() })) + ' ' + h(T('Closes with {how}.', { how: bits.join(', ') || T('its own buttons only') })) + (S().teaser.on ? ' ' + h(T('Leaves a "{t}" tab after closing.', { t: lv(S().teaser.text) })) : '');
    }
    if (E.tab === 'targeting') return '<strong>' + h(T('In words:')) + '</strong> ' + h(A.say.who(S()));
    return '';
  }
  function sentence() { var n2 = d.getElementById('psx-words'); if (n2) n2.innerHTML = words(); }

  function triggersTab() {
    var t = S().triggers;
    var c = S().close;
    var tz = S().teaser;
    return '<div class="psx-wrap"><div class="psx-words" id="psx-words">' + words() + '</div><div class="psx-cols2">' +
      '<section class="psx-card" style="flex:3 1 560px;min-width:0"><div class="psx-card-h"><h2>' + h(T('Show the popup when')) + '</h2><div class="psx-seg" role="group" aria-label="' + h(T('How triggers combine')) + '"><button type="button" data-a="ed_mode" data-v="any" aria-pressed="' + (t.mode !== 'all') + '">' + h(T('Any one happens')) + '</button><button type="button" data-a="ed_mode" data-v="all" aria-pressed="' + (t.mode === 'all') + '">' + h(T('All have happened')) + '</button></div></div>' +
      trow(t.timerOn, '@settings.triggers.timerOn', 'M12 13m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 9v4l2.5 2M9 2h6', T('On landing, after {n} seconds', { n: n('@settings.triggers.timerSec', T('Seconds after landing')) }), T('0 shows it at once.'), T('Timer trigger')) +
      trow(t.exitOn, '@settings.triggers.exitOn', 'M10 4H5v16h5M14 8l4 4-4 4M18 12H9', T('When the visitor is about to leave, with {s} sensitivity', { s: sel('@settings.triggers.exitSens', T('Exit sensitivity'), [['normal', T('normal')], ['high', T('high')], ['low', T('low')]]) }), T('Desktop: the pointer heads for the tabs or address bar. Phones have no pointer, so it uses a fast scroll back up or the back button instead. This is a best guess, not a certainty.'), T('Exit intent trigger')) +
      trow(t.idleOn, '@settings.triggers.idleOn', 'M12 3a9 9 0 1 0 9 9M12 7v5l3 3', T('After {n} seconds without a click, scroll or key press', { n: n('@settings.triggers.idleSec', T('Seconds of inactivity')) }), '', T('Inactivity trigger')) +
      trow(t.scrollOn, '@settings.triggers.scrollOn', 'M12 3v18M7 16l5 5 5-5', T('After scrolling {n} {u}', { n: n('@settings.triggers.scrollVal', T('Scroll amount')), u: sel('@settings.triggers.scrollUnit', T('Scroll unit'), [['pct', T('% of the page')], ['px', T('pixels')]]) }), '', T('Scroll trigger')) +
      trow(t.clickOn, '@settings.triggers.clickOn', 'M9 3v4M3 9h4M5 5l2.5 2.5M12 12l9 3-4 1.5L15.5 21z', T('When someone clicks {sel}', { sel: txt('@settings.triggers.clickSel', T('CSS selector'), '.newsletter-link, [data-popup=welcome]') }), T('Any CSS selector. Every popup also opens from a link to #popup-{id}.', { id: E.p.id }), T('Click trigger')) +
      trow(t.pagesOn, '@settings.triggers.pagesOn', 'M4 4h10v16H4zM14 8h6v12h-6', T('On page {n} of the visit, after {s} seconds on the site', { n: n('@settings.triggers.pagesN', T('Page number in the visit')), s: n('@settings.triggers.pagesSec', T('Seconds on site')) }), T('Leave the seconds at 0 to ignore time.'), T('Page count trigger')) +
      trow(t.addcartOn, '@settings.triggers.addcartOn', 'M3 4h2l2 12h11l2-8H6M12 9v4M10 11h4', T('Right after a product is added to the cart'), T('Good for "complete the look" or free-shipping nudges.'), T('Add to cart trigger')) +
      '</section><div style="flex:2 1 380px;min-width:0;display:flex;flex-direction:column;gap:18px">' +
      '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Visitors can close it with')) + '</h2></div>' +
      trow(c.x !== false, '@settings.close.x', 'M6 6l12 12M18 6L6 18', T('The X button, shown after {n} s', { n: n('@settings.close.xDelay', T('Seconds before the X appears')) }), '', T('Close button')) +
      trow(c.overlay !== false, '@settings.close.overlay', 'M4 4h16v16H4z', T('A click on the dimmed page'), '', T('Overlay click closes')) +
      trow(c.esc !== false, '@settings.close.esc', 'M4 12h16', T('The Esc key'), T('Turn off only for an age gate.'), T('Esc closes')) +
      '</section><section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Close by itself')) + '</h2></div>' +
      trow(c.timeOn, '@settings.close.timeOn', 'M12 8v5l3 2', T('After {n} seconds', { n: n('@settings.close.timeSec', T('Seconds before closing')) }), '', T('Close after time')) +
      trow(c.scrollOn, '@settings.close.scrollOn', 'M12 3v18', T('When the page is scrolled to {n} %', { n: n('@settings.close.scrollPct', T('Scroll position')) }), '', T('Close on scroll')) +
      trow(c.videoOn, '@settings.close.videoOn', 'M3 6h13v12H3zM16 10l5-3v10l-5-3', T('When the video ends'), T('Needs a video block. Works with MP4, YouTube and Vimeo.'), T('Close at video end')) +
      trow(c.lastOn, '@settings.close.lastOn', 'M5 12l5 5L20 7', T('{n} s after the last step is shown', { n: n('@settings.close.lastSec', T('Seconds after last step')) }), '', T('Close after last step')) +
      '</section><section class="psx-card"><div class="psx-card-h"><h2>' + h(T('After closing')) + '</h2></div>' +
      trow(tz.on, '@settings.teaser.on', 'M4 4h6v16H4z', T('Leave a tab saying {t} on the {e} for {l}', { t: txt('@settings.teaser.text', T('Tab text'), 'Get 10%', true), e: sel('@settings.teaser.edge', T('Tab edge'), [['left', T('left edge')], ['right', T('right edge')], ['bl', T('bottom left')]]), l: sel('@settings.teaser.life', T('Tab lifetime'), [['visit', T('this visit')], ['always', T('until signup')]]) }), '', T('Teaser tab')) +
      '</section></div></div></div>';
  }
  act.ed_mode = function (t) { snapshot(); S().triggers.mode = t.getAttribute('data-v'); changed(true); draw(); };

  /* ---------- targeting tab ---------- */
  var RULES = [
    [T('Visitor'), [['audience', T('Visitor, guest, customer')], ['visit', T('First visit or returning')], ['group', T('Customer group')], ['orders', T('Has ordered before')], ['newsletter', T('Newsletter subscribed or not')]]],
    [T('Cart'), [['cart_value', T('Cart value is over or under')], ['cart_contains', T('Cart contains products, categories or brands')], ['cart_items', T('Number of items')]]],
    [T('Page'), [['page', T('Page types, categories, products, CMS')], ['url', T('URL contains or matches')]]],
    [T('Traffic source'), [['utm', T('UTM source, medium, campaign')], ['referrer', T('Referrer domain')]]],
    [T('Place and language'), [['country', T('Country')], ['language', T('Language')], ['currency', T('Currency')]]],
    [T('Device and time'), [['device', T('Desktop, tablet, mobile')], ['daytime', T('Day of the week and hours')]]]
  ];
  function ruleLabel(type) { var out = type; RULES.forEach(function (g) { g[1].forEach(function (r) { if (r[0] === type) out = r[1]; }); }); return out; }
  function newRule(type) {
    var r = { type: type };
    switch (type) {
      case 'audience': r.value = 'visitor'; break;
      case 'visit': r.value = 'first'; break;
      case 'group': r.op = 'any'; r.value = []; break;
      case 'orders': r.op = 'none'; r.n = 1; break;
      case 'newsletter': r.op = 'not'; break;
      case 'cart_value': r.op = 'gt'; r.a = 50; r.b = 100; break;
      case 'cart_contains': r.op = 'any'; r.products = []; r.categories = []; r.brands = []; break;
      case 'cart_items': r.op = 'gte'; r.a = 1; break;
      case 'page': r.op = 'show_on'; r.pages = ['all']; r.categories = []; r.products = []; r.cms = []; break;
      case 'url': r.op = 'contains'; r.value = ''; break;
      case 'utm': r.key = 'campaign'; r.op = 'is'; r.value = ''; break;
      case 'referrer': r.op = 'contains'; r.value = 'google'; break;
      case 'country': r.op = 'any'; r.value = []; break;
      case 'language': r.op = 'any'; r.value = []; break;
      case 'currency': r.op = 'any'; r.value = []; break;
      case 'device': r.value = ['desktop', 'tablet', 'mobile']; break;
      case 'daytime': r.days = [1, 2, 3, 4, 5, 6, 7]; r.from = '00:00'; r.to = '23:59'; break;
    }
    return r;
  }
  function tags(list, nameOf, gi, ri, key) {
    return (list || []).map(function (v, i) { return '<span class="psx-tag">' + h(nameOf(v)) + '<button type="button" data-a="ed_rtagdel" data-g="' + gi + '" data-r="' + ri + '" data-k="' + key + '" data-v="' + i + '" aria-label="' + h(T('Remove {x}', { x: nameOf(v) })) + '">✕</button></span>'; }).join('');
  }
  function rp(gi, ri, f) { return '@settings.targeting.groups.' + gi + '.rules.' + ri + '.' + f; }
  function ruleEditor(r, gi, ri) {
    var inner = '';
    var addSel = function (key, options, label) {
      return '<label><span class="sr">' + h(label) + '</span><select class="psx-tsel" data-c="ed_rtagadd" data-g="' + gi + '" data-r="' + ri + '" data-k="' + key + '"><option value="">' + h(label) + '</option>' + options.map(function (o) { return '<option value="' + h(o[0]) + '">' + h(o[1]) + '</option>'; }).join('') + '</select></label>';
    };
    var langName = function (id) { var l = B.langs.filter(function (x) { return x.id === +id; })[0]; return l ? l.name : id; };
    var ctry = function (iso) { var c = B.countries.filter(function (x) { return x.iso === iso; })[0]; return c ? c.name : iso; };
    var grp = function (id) { var g = B.groups.filter(function (x) { return x.id === +id; })[0]; return g ? g.name : id; };
    var cur2 = function (id) { var c = B.currencies.filter(function (x) { return x.id === +id; })[0]; return c ? c.iso : id; };
    var anyNone = function () { return sel(rp(gi, ri, 'op'), T('Match'), [['any', T('is any of')], ['none', T('is none of')]]); };
    switch (r.type) {
      case 'audience': inner = T('is') + ' ' + sel(rp(gi, ri, 'value'), T('Visitor type'), [['visitor', T('a visitor who is not logged in')], ['guest', T('a guest account')], ['customer', T('a logged-in customer')], ['logged', T('anyone logged in')]]); break;
      case 'visit': inner = T('is a') + ' ' + sel(rp(gi, ri, 'value'), T('Visit'), [['first', T('first-time visitor')], ['returning', T('returning visitor')]]) + '<span class="psx-hint">' + h(T('remembered in the browser')) + '</span>'; break;
      case 'newsletter': inner = T('is') + ' ' + sel(rp(gi, ri, 'op'), T('Newsletter'), [['not', T('not subscribed')], ['subscribed', T('subscribed')]]) + '<span class="psx-hint">' + h(T('checks the account and the guest list')) + '</span>'; break;
      case 'group': inner = anyNone() + tags(r.value, grp, gi, ri, 'value') + addSel('value', B.groups.map(function (g) { return [g.id, g.name]; }), T('+ group')); break;
      case 'orders': inner = sel(rp(gi, ri, 'op'), T('Orders'), [['none', T('has never ordered')], ['gte', T('has ordered at least')]]) + (r.op === 'gte' ? n(rp(gi, ri, 'n'), T('Orders')) + T('times') : ''); break;
      case 'cart_value': inner = T('is') + ' ' + sel(rp(gi, ri, 'op'), T('Compare'), [['gt', T('over')], ['lt', T('under')], ['between', T('between')]]) + n(rp(gi, ri, 'a'), T('Amount'), 80) + (r.op === 'between' ? T('and') + n(rp(gi, ri, 'b'), T('Amount'), 80) : '') + h((B.sample.currency || {}).sign || ''); break;
      case 'cart_items': inner = T('is') + ' ' + sel(rp(gi, ri, 'op'), T('Compare'), [['gte', T('at least')], ['lt', T('fewer than')]]) + n(rp(gi, ri, 'a'), T('Items')); break;
      case 'cart_contains': inner = sel(rp(gi, ri, 'op'), T('Match'), [['any', T('has any of')], ['none', T('has none of')]]) + tags(r.products, function (v) { return '#' + v; }, gi, ri, 'products') + tags(r.categories, function (v) { return T('category') + ' #' + v; }, gi, ri, 'categories') + tags(r.brands, function (v) { return T('brand') + ' #' + v; }, gi, ri, 'brands') + rpicker('product', gi, ri, 'products', T('+ product')) + rpicker('category', gi, ri, 'categories', T('+ category')) + rpicker('brand', gi, ri, 'brands', T('+ brand')); break;
      case 'page':
        inner = sel(rp(gi, ri, 'op'), T('Pages'), [['show_on', T('show on')], ['except', T('show everywhere except')]]) + tags(r.pages, A.pageName, gi, ri, 'pages') + addSel('pages', ['all', 'home', 'category', 'product', 'cms', 'cart', 'checkout', 'search', 'confirmation', 'notfound', 'other'].map(function (p) { return [p, A.pageName(p)]; }), T('+ page type')) +
          tags(r.categories, function (v) { return T('category') + ' #' + v; }, gi, ri, 'categories') + tags(r.products, function (v) { return T('product') + ' #' + v; }, gi, ri, 'products') + tags(r.cms, function (v) { return 'CMS #' + v; }, gi, ri, 'cms') +
          rpicker('category', gi, ri, 'categories', T('+ category')) + rpicker('product', gi, ri, 'products', T('+ product')) + rpicker('cms', gi, ri, 'cms', T('+ CMS page'));
        break;
      case 'url': inner = sel(rp(gi, ri, 'op'), T('Match'), [['contains', T('contains')], ['not_contains', T('does not contain')], ['regex', T('matches the pattern')]]) + txt(rp(gi, ri, 'value'), T('URL text'), '/sale'); break;
      case 'utm': inner = sel(rp(gi, ri, 'key'), T('UTM field'), [['source', 'utm_source'], ['medium', 'utm_medium'], ['campaign', 'utm_campaign']]) + sel(rp(gi, ri, 'op'), T('Match'), [['is', T('is')], ['contains', T('contains')]]) + txt(rp(gi, ri, 'value'), T('Value'), 'black-friday') + '<span class="psx-hint">' + h(T('remembered for the whole visit')) + '</span>'; break;
      case 'referrer': inner = sel(rp(gi, ri, 'op'), T('Match'), [['contains', T('comes from a site containing')], ['none', T('has no referrer (typed or bookmarked)')]]) + (r.op !== 'none' ? txt(rp(gi, ri, 'value'), T('Domain'), 'instagram') : ''); break;
      case 'country':
        inner = anyNone() + tags(r.value, ctry, gi, ri, 'value') + addSel('value', B.countries.map(function (c) { return [c.iso, c.name]; }), T('+ country'));
        if (!B.settings.geolocation) inner += '<span style="display:flex;gap:8px;padding:8px 10px;border-radius:8px;background:#FDF3DC;color:#5E3F00;font-size:12.5px;line-height:1.45;width:100%">' + h(T('Country comes from PrestaShop\'s geolocation (Preferences › Geolocation). It is off on this shop, so only logged-in customers with an address are matched.')) + '</span>';
        break;
      case 'language': inner = anyNone() + tags(r.value, langName, gi, ri, 'value') + addSel('value', B.langs.map(function (l) { return [l.id, l.name]; }), T('+ language')); break;
      case 'currency': inner = anyNone() + tags(r.value, cur2, gi, ri, 'value') + addSel('value', B.currencies.map(function (c) { return [c.id, c.iso]; }), T('+ currency')); break;
      case 'device': inner = ['desktop', 'tablet', 'mobile'].map(function (dv) { var on = (r.value || []).indexOf(dv) !== -1; return '<button type="button" class="psx-day" style="width:auto;padding:0 12px" aria-pressed="' + on + '" data-a="ed_rdev" data-g="' + gi + '" data-r="' + ri + '" data-v="' + dv + '">' + h({ desktop: T('Desktop'), tablet: T('Tablet'), mobile: T('Mobile') }[dv]) + '</button>'; }).join(' '); break;
      case 'daytime': inner = dayButtons('targeting.groups.' + gi + '.rules.' + ri + '.days') + ' ' + T('from') + ' <input class="psx-num" style="width:84px" type="time" value="' + h(r.from) + '" data-f="' + rp(gi, ri, 'from') + '" data-k="tx" data-c="ed_f" aria-label="' + h(T('From')) + '"> ' + T('to') + ' <input class="psx-num" style="width:84px" type="time" value="' + h(r.to) + '" data-f="' + rp(gi, ri, 'to') + '" data-k="tx" data-c="ed_f" aria-label="' + h(T('Until')) + '">'; break;
    }
    return '<div class="psx-rule"><span class="k">' + h(ruleLabel(r.type)) + '</span>' + inner + '<button type="button" class="psx-ib" style="margin-left:auto" data-a="ed_rdel" data-g="' + gi + '" data-r="' + ri + '" aria-label="' + h(T('Remove this rule')) + '">✕</button></div>';
  }
  function rpicker(kind, gi, ri, key, label) {
    return '<span class="psx-picker" style="display:inline-block;width:170px"><input class="psx-inp" style="height:30px" placeholder="' + h(label) + '" data-i="ed_search" data-kind="' + kind + '" data-g="' + gi + '" data-r="' + ri + '" data-key="' + key + '" data-rule="1"><span class="res" hidden></span></span>';
  }
  function dayButtons(path) {
    var days = getPath(E.p.settings, path) || [];
    var names = [T('Mon'), T('Tue'), T('Wed'), T('Thu'), T('Fri'), T('Sat'), T('Sun')];
    return '<span style="display:inline-flex;gap:4px;flex-wrap:wrap" role="group" aria-label="' + h(T('Days of the week')) + '">' + names.map(function (nm, i) { return '<button type="button" class="psx-day" aria-pressed="' + (days.indexOf(i + 1) !== -1) + '" data-a="ed_day" data-path="' + h(path) + '" data-v="' + (i + 1) + '">' + h(nm) + '</button>'; }).join('') + '</span>';
  }
  act.ed_day = function (t) {
    snapshot();
    var path = t.getAttribute('data-path');
    var arr = getPath(E.p.settings, path) || [];
    var v = +t.getAttribute('data-v');
    var i = arr.indexOf(v);
    if (i === -1) arr.push(v); else arr.splice(i, 1);
    arr.sort();
    setPath(E.p.settings, path, arr);
    t.setAttribute('aria-pressed', String(i === -1));
    changed(true);
  };
  function targetingTab() {
    var gs = S().targeting.groups;
    var groups = gs.map(function (g, gi) {
      return (gi ? '<div class="psx-or" role="separator">' + h(T('OR')) + '</div>' : '') + '<section class="psx-card"><div class="psx-card-h"><h2>' + h(gi ? T('Or to visitors who match all of these') : T('Show to visitors who match all of these')) + '</h2><span style="display:flex;gap:8px;align-items:center"><span class="muted" style="font-size:12.5px">' + h(T('Group {n}', { n: gi + 1 })) + '</span><button type="button" class="psx-btn2 sm ghost" data-a="ed_gdel" data-g="' + gi + '">' + h(T('Remove group')) + '</button></span></div><div>' +
        (g.rules || []).map(function (r, ri) { return ruleEditor(r, gi, ri); }).join('') + '<div class="psx-rule" style="padding-top:14px;padding-bottom:16px"><label><span class="sr">' + h(T('Add a rule')) + '</span><select class="psx-inp" style="width:260px" data-c="ed_radd" data-g="' + gi + '"><option value="">' + h(T('+ Add a rule')) + '</option>' + RULES.map(function (grp) { return '<optgroup label="' + h(grp[0]) + '">' + grp[1].map(function (r) { return '<option value="' + r[0] + '">' + h(r[1]) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></label></div></div></section>';
    }).join('');
    var cat = RULES.map(function (g) { return '<div style="display:flex;flex-direction:column;gap:2px;padding:12px 16px;border-top:1px solid #EEF0F3"><h3 class="psx-sec" style="margin-bottom:4px">' + h(g[0]) + '</h3>' + g[1].map(function (r) { return '<button type="button" class="psx-lay" data-a="ed_rcat" data-v="' + r[0] + '">' + h(r[1]) + '</button>'; }).join('') + '</div>'; }).join('');
    return '<div class="psx-wrap"><div class="psx-words" id="psx-words">' + words() + '</div><div class="psx-cols2"><div style="flex:3 1 600px;min-width:0;display:flex;flex-direction:column">' +
      (gs.length ? groups : '<section class="psx-card psx-empty"><h2>' + h(T('Everyone sees this popup')) + '</h2><p class="muted">' + h(T('Add a rule to narrow it down: pages, cart value, country, device and more.')) + '</p></section>') +
      '<div style="padding:14px 0 0"><button type="button" class="psx-btn2" style="border-style:dashed" data-a="ed_gadd">' + h(gs.length ? T('+ Add an OR group') : T('+ Add a rule group')) + '</button></div></div>' +
      '<aside class="psx-card" style="flex:1 1 300px;min-width:0" aria-labelledby="psx-rc"><div class="psx-card-h"><h2 id="psx-rc">' + h(T('Rules you can add')) + '</h2></div>' + cat + '<p class="psx-hint" style="padding:12px 16px 16px;border-top:1px solid #EEF0F3">' + h(T('Device, UTM, referrer and first-visit rules are checked in the browser; the others on the server.')) + '</p></aside></div></div>';
  }
  act.ed_gadd = function () { snapshot(); S().targeting.groups.push({ rules: [] }); changed(true); draw(); };
  act.ed_gdel = function (t) { snapshot(); S().targeting.groups.splice(+t.getAttribute('data-g'), 1); changed(true); draw(); };
  act.ed_radd = function (t) { if (!t.value) return; snapshot(); S().targeting.groups[+t.getAttribute('data-g')].rules.push(newRule(t.value)); changed(true); draw(); };
  act.ed_rcat = function (t) {
    snapshot();
    var gs = S().targeting.groups;
    if (!gs.length) gs.push({ rules: [] });
    gs[gs.length - 1].rules.push(newRule(t.getAttribute('data-v')));
    changed(true); draw();
  };
  act.ed_rdel = function (t) { snapshot(); S().targeting.groups[+t.getAttribute('data-g')].rules.splice(+t.getAttribute('data-r'), 1); changed(true); draw(); };
  act.ed_rtagadd = function (t) {
    if (!t.value) return;
    snapshot();
    var r = S().targeting.groups[+t.getAttribute('data-g')].rules[+t.getAttribute('data-r')];
    var k = t.getAttribute('data-k');
    var v = /^\d+$/.test(t.value) && k !== 'pages' ? +t.value : t.value;
    r[k] = r[k] || [];
    if (r[k].indexOf(v) === -1) r[k].push(v);
    if (k === 'pages' && v !== 'all') r[k] = r[k].filter(function (x) { return x !== 'all'; });
    changed(true); draw();
  };
  act.ed_rtagdel = function (t) { snapshot(); var r = S().targeting.groups[+t.getAttribute('data-g')].rules[+t.getAttribute('data-r')]; r[t.getAttribute('data-k')].splice(+t.getAttribute('data-v'), 1); changed(true); draw(); };
  act.ed_rdev = function (t) { snapshot(); var r = S().targeting.groups[+t.getAttribute('data-g')].rules[+t.getAttribute('data-r')]; var v = t.getAttribute('data-v'); var i = r.value.indexOf(v); if (i === -1) r.value.push(v); else r.value.splice(i, 1); changed(true); draw(); };
  var baseSearch = act.ed_search;
  act.ed_search = function (t) {
    if (t.getAttribute('data-rule')) {
      t._cb = function (id) {
        snapshot();
        var r = S().targeting.groups[+t.getAttribute('data-g')].rules[+t.getAttribute('data-r')];
        var k = t.getAttribute('data-key');
        r[k] = r[k] || [];
        if (r[k].indexOf(id) === -1) r[k].push(id);
        changed(true); draw();
      };
    }
    baseSearch(t);
  };

  /* ---------- schedule and frequency tab ---------- */
  function frequencyTab() {
    var f = S().frequency;
    var opt = function (mode, title, hint, extra) {
      return '<label class="psx-opt' + (f.mode === mode ? ' on' : '') + '"><span class="psx-ck" style="pointer-events:none"><input type="radio" name="psx-fm" ' + (f.mode === mode ? 'checked' : '') + ' tabindex="-1"></span><span style="flex:1"><button type="button" data-a="ed_fmode" data-v="' + mode + '" style="border:0;background:none;padding:0;font:600 14px inherit;font-family:inherit;color:inherit;text-align:left;cursor:pointer">' + title + '</button>' + (extra || '') + (hint ? '<div class="psx-hint">' + h(hint) + '</div>' : '') + '</span></label>';
    };
    var shops = B.multistore ? '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Stores')) + '</h2></div><div class="psx-card-b">' + B.shops.map(function (s) { var on = E.p.shops.indexOf(s.id) !== -1; return '<label class="psx-ck"><input type="checkbox" ' + (on ? 'checked' : '') + ' data-c="ed_shop" value="' + s.id + '">' + h(s.name) + '</label>'; }).join('') + '</div></section>' : '';
    return '<div class="psx-wrap"><div class="psx-cols2"><div style="flex:1 1 520px;min-width:0;display:flex;flex-direction:column;gap:18px">' +
      '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Schedule')) + '</h2><span class="psx-hint">' + h(T('Shop time zone')) + '</span></div><div class="psx-card-b"><div class="psx-row2">' + F('dt', '@date_start', T('Starts'), { hint: T('Empty: starts when switched on.') }) + F('dt', '@date_end', T('Ends'), { hint: T('Empty: no end date.') }) + '</div>' +
      (E.p.date_start && E.p.date_end && E.p.date_end < E.p.date_start ? '<p class="psx-em">' + h(T('The end is before the start.')) + '</p>' : '') +
      '<div class="psx-lbl">' + h(T('Only on these days')) + dayButtons('schedule.days') + '</div><div class="psx-row2" style="max-width:340px"><label class="psx-lbl">' + h(T('From')) + '<input class="psx-inp mono" type="time" value="' + h(S().schedule.from) + '" data-f="@settings.schedule.from" data-k="tx" data-c="ed_f"></label><label class="psx-lbl">' + h(T('Until')) + '<input class="psx-inp mono" type="time" value="' + h(S().schedule.to) + '" data-f="@settings.schedule.to" data-k="tx" data-c="ed_f"></label></div></div></section>' +
      '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Priority')) + '</h2></div><div class="psx-card-b"><p style="color:#3A3F4B">' + h(T('When two popups qualify on the same page, the higher one shows and the other waits for the next page.')) + '</p>' + F('se', '@priority', T('Priority'), { options: [[10, T('High')], [0, T('Normal')], [-10, T('Low')]] }) + '</div></section>' + shops + '</div>' +
      '<section class="psx-card" style="flex:1 1 520px;min-width:0"><div class="psx-card-h"><h2>' + h(T('How often one visitor sees it')) + '</h2></div><div class="psx-card-b"><div role="radiogroup" aria-label="' + h(T('Frequency')) + '" style="display:flex;flex-direction:column;gap:8px">' +
      opt('page', h(T('On every page view')), T('Only sensible for bars and inline blocks.')) + opt('visit', h(T('Once per visit')), T('A visit ends after 30 minutes without activity.')) +
      opt('days', h(T('At most once every')) + ' ', T('Remembered in the visitor\'s browser (local storage), not on the server.'), ' ' + n('@settings.frequency.days', T('Days between showings')) + ' ' + h(T('days'))) + opt('once', h(T('Only once, ever'))) + '</div>' +
      '<div style="height:1px;background:#EEF0F3"></div>' +
      '<div class="psx-ln"><span>' + h(T('Never again after')) + ' ' + n('@settings.frequency.max', T('Maximum showings')) + ' ' + h(T('showings in total')) + '</span><button type="button" class="psx-sw" role="switch" aria-checked="' + !!S().frequency.maxOn + '" aria-label="' + h(T('Maximum showings')) + '" data-a="ed_tg" data-f="@settings.frequency.maxOn"></button></div>' +
      '<div class="psx-ln"><span>' + h(T('Stop showing once the visitor signs up or uses the button')) + '</span><button type="button" class="psx-sw" role="switch" aria-checked="' + (S().frequency.stopConvert !== false) + '" aria-label="' + h(T('Stop after conversion')) + '" data-a="ed_tg" data-f="@settings.frequency.stopConvert"></button></div>' +
      '<div class="psx-ln"><span>' + h(T('After it is closed, wait')) + ' ' + n('@settings.frequency.afterCloseDays', T('Days to wait after closing')) + ' ' + h(T('days')) + '</span><button type="button" class="psx-sw" role="switch" aria-checked="' + !!S().frequency.afterCloseOn + '" aria-label="' + h(T('Wait after closing')) + '" data-a="ed_tg" data-f="@settings.frequency.afterCloseOn"></button></div>' +
      '<div style="display:flex;gap:10px;padding:12px 14px;border-radius:10px;background:#F3F4F6;font-size:13px;color:#3A3F4B">' + h(T('The shop-wide limit in Settings also applies: no visitor gets more than {n} popups per visit, whatever each popup allows.', { n: B.settings.max_visit || '∞' })) + '</div></div></section></div></div>';
  }
  act.ed_fmode = function (t) { snapshot(); S().frequency.mode = t.getAttribute('data-v'); changed(true); draw(); };
  act.ed_shop = function (t) { var id = +t.value; var i = E.p.shops.indexOf(id); if (t.checked && i === -1) E.p.shops.push(id); if (!t.checked && i !== -1) E.p.shops.splice(i, 1); changed(true); };

  /* ---------- A/B tab ---------- */
  function abTab() {
    var vs = E.p.variants;
    var R = E.ab;
    var rows = R && R.rows ? R.rows : [];
    var verdict = '';
    if (R && R.verdict) {
      var v = R.verdict;
      if (v.state === 'winner') verdict = '<section style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;padding:18px 20px;border-radius:12px;background:#fff;border:2px solid #17804A"><div style="flex:1;min-width:260px"><h2 style="font-size:19px">' + h(v.lift ? T('Variant {l} gets {p}% more {g}.', { l: v.label, p: Math.round(v.lift * 100), g: ({ signups: T('signups'), clicks: T('clicks'), orders: T('orders') })[R.goal] || R.goal }) : T('Variant {l} is the best.', { l: v.label })) + '</h2><p style="margin-top:2px;color:#3A3F4B">' + h(T('The chance this is luck is under {p}%. You can end the test now.', { p: Math.max(0.1, Math.round((1 - v.confidence) * 1000) / 10) })) + '</p></div><button type="button" class="psx-btn2 pri" data-a="ed_winner" data-v="' + v.id_variant + '">' + h(T('Make {l} the only version', { l: v.label })) + '</button></section>';
      else if (v.state === 'wait') verdict = '<section class="psx-words" style="background:#fff;color:#16181D;border:1px solid #DADDE3">' + h(T('Not enough data yet: each variant needs at least {n} views before the verdict.', { n: v.min })) + '</section>';
      else if (v.state === 'tie') verdict = '<section class="psx-words" style="background:#fff;color:#16181D;border:1px solid #DADDE3">' + h(T('No clear winner yet. Keep the test running.')) + '</section>';
    }
    var cards = vs.map(function (v, i) {
      var st = rows.filter(function (r) { return r.id_variant === v.id_variant; })[0] || {};
      return '<article class="psx-card psx-ab-v"><div class="psx-card-h"><div style="display:flex;gap:10px;align-items:center"><span style="width:30px;height:30px;border-radius:8px;background:' + (i ? '#2453C9' : '#5B6170') + ';color:#fff;font:700 15px Geist Mono,monospace;display:flex;align-items:center;justify-content:center">' + h(String.fromCharCode(65 + i)) + '</span><label><span class="sr">' + h(T('Variant name')) + '</span><input class="psx-inp" style="width:170px" value="' + h(v.label) + '" data-f="@variants.' + i + '.label" data-k="tx" data-i="ed_f"></label></div><span style="display:flex;gap:6px;align-items:center"><label class="mono" style="font-size:13px;display:flex;gap:6px;align-items:center">' + h(T('Weight')) + '<input type="number" min="0" max="100" class="psx-inp mono" style="width:70px" value="' + h(v.weight) + '" data-f="@variants.' + i + '.weight" data-k="nu" data-i="ed_f"></label>' + (vs.length > 1 ? '<button type="button" class="psx-ib" data-a="ed_vdel" data-v="' + i + '" aria-label="' + h(T('Delete variant')) + '">✕</button>' : '') + '</span></div>' +
        '<div class="psx-ab-pv"><iframe data-vi="' + i + '" title="' + h(T('Variant {l}', { l: v.label })) + '"></iframe></div>' +
        '<div style="padding:14px 18px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;border-top:1px solid #E6E8EC"><div><div class="muted" style="font-size:12px">' + h(T('Shown')) + '</div><div class="mono" style="font-size:20px;font-weight:600">' + A.num(st.views) + '</div></div><div><div class="muted" style="font-size:12px">' + h(T('Signups')) + '</div><div class="mono" style="font-size:20px;font-weight:600">' + A.num(st.signups) + '</div></div><div><div class="muted" style="font-size:12px">' + h(T('Rate')) + '</div><div class="mono" style="font-size:20px;font-weight:600">' + A.pct(st[R ? R.goal : 'signups'], st.views) + '</div></div></div>' +
        '<div style="padding:0 18px 16px;display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="psx-btn2 sm" data-a="ed_vedit" data-v="' + i + '">' + h(T('Edit this variant')) + '</button><button type="button" class="psx-btn2 sm" data-a="ed_vprev" data-v="' + i + '">' + h(T('Preview on shop')) + '</button></div></article>';
    }).join('');
    return '<div class="psx-wrap">' + verdict +
      '<section class="psx-card"><div class="psx-card-b"><div class="psx-ln"><span><strong>' + h(T('Run an A/B test')) + '</strong><span class="psx-hint" style="display:block">' + h(T('Visitors are split by weight and always see the same variant.')) + '</span></span><button type="button" class="psx-sw" role="switch" aria-checked="' + (!!+E.p.ab_active) + '" aria-label="' + h(T('Run an A/B test')) + '" data-a="ed_abon"></button></div>' +
      F('se', '@settings.ab.goal', T('Winner judged on'), { options: [['signups', T('Signups')], ['clicks', T('Clicks on buttons')], ['orders', T('Orders')]], redraw: true }) + '</div></section>' +
      '<div style="display:flex;flex-wrap:wrap;gap:18px;align-items:stretch">' + cards + (vs.length < 4 ? '<button type="button" data-a="ed_vadd" style="flex:0 1 200px;min-height:200px;border:1.5px dashed #9AA0AC;border-radius:12px;background:transparent;font:600 14px inherit;font-family:inherit;color:#3A3F4B;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px"><span style="font-size:26px;line-height:1">+</span>' + h(T('Add variant {l}', { l: String.fromCharCode(65 + vs.length) })) + '<span class="psx-hint">' + h(T('copies the variant you are editing')) + '</span></button>' : '') + '</div>' +
      (rows.length ? '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Every number, per variant')) + '</h2></div><div class="psx-scroll"><table class="psx-tbl" style="min-width:720px"><thead><tr><th>' + h(T('Variant')) + '</th><th class="r">' + h(T('Shown')) + '</th><th class="r">' + h(T('Closed')) + '</th><th class="r">' + h(T('Button clicks')) + '</th><th class="r">' + h(T('Signups')) + '</th><th class="r">' + h(T('Orders')) + '</th><th class="r">' + h(T('Revenue')) + '</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td style="font-weight:600">' + h(r.label) + '</td><td class="r mono">' + A.num(r.views) + '</td><td class="r mono">' + A.num(r.closes) + '</td><td class="r mono">' + A.num(r.clicks) + '</td><td class="r mono">' + A.num(r.signups) + '</td><td class="r mono">' + A.num(r.orders) + '</td><td class="r mono">' + A.money(r.revenue) + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="psx-hint" style="padding:12px 18px 16px">' + h(T('Below 300 views per variant the verdict says "not enough data yet". The test uses a two-proportion z-test.')) + '</p></section>' : '') + '</div>';
  }
  function abAfter() {
    Array.prototype.forEach.call(A.root.querySelectorAll('iframe[data-vi]'), function (f) {
      var v = E.p.variants[+f.getAttribute('data-vi')];
      A.mount(f, clone(v.content), { mobile: false, lang: E.lang, game: S().game, editor: false });
    });
    if (E.p.id && (!E.ab || E.abFor !== E.p.id + S().ab.goal)) {
      E.abFor = E.p.id + S().ab.goal;
      api('variants', { id: E.p.id, goal: S().ab.goal }).then(function (r) { if (r.ok) { E.ab = r.ab; if (E.tab === 'ab') draw(); } });
    }
  }
  act.ed_abon = function (t) { snapshot(); E.p.ab_active = +E.p.ab_active ? 0 : 1; t.setAttribute('aria-checked', String(!!E.p.ab_active)); changed(true); };
  act.ed_vadd = function () {
    snapshot();
    var v = clone(E.p.variants[E.vi]);
    delete v.id_variant;
    v.label = String.fromCharCode(65 + E.p.variants.length);
    E.p.variants.forEach(function (x) { x.weight = Math.round(100 / (E.p.variants.length + 1)); });
    v.weight = Math.round(100 / (E.p.variants.length + 1));
    E.p.variants.push(v);
    E.p.ab_active = 1;
    changed(true); draw();
  };
  act.ed_vdel = function (t) {
    var i = +t.getAttribute('data-v');
    A.confirm(T('Delete variant {l}?', { l: E.p.variants[i].label }), T('Its design is removed when you save. Stats already counted stay.'), T('Delete variant'), function () {
      snapshot(); E.p.variants.splice(i, 1); E.vi = 0; if (E.p.variants.length < 2) E.p.ab_active = 0; changed(true); draw();
    });
  };
  act.ed_vedit = function (t) { E.vi = +t.getAttribute('data-v'); E.tab = 'design'; E.sel = null; E.step = 0; draw(); A.toast(h(T('Editing variant {l}.', { l: E.p.variants[E.vi].label }))); };
  act.ed_vprev = function (t) { var v = E.p.variants[+t.getAttribute('data-v')]; if (!v.id_variant || E.dirty) { save(function () { act.ed_vprev(t); }); return; } api('preview', { id: E.p.id, v: v.id_variant }).then(function (r) { if (r.ok) w.open(r.url, '_blank', 'noopener'); }); };
  act.ed_winner = function (t) {
    var id = +t.getAttribute('data-v');
    snapshot();
    E.p.variants.forEach(function (v) { if (v.id_variant === id) { v.weight = 100; v.active = 1; } else { v.active = 0; v.weight = 0; } });
    E.p.ab_active = 0;
    changed(true);
    save(function () { draw(); });
  };
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
