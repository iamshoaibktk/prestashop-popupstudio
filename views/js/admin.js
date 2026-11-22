/**
 * Popup Studio back office: app shell, popups list, template gallery, stats, leads and settings.
 * The editor lives in editor.js.
 *
 * @author    iamshoaibktk (https://github.com/iamshoaibktk)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */
(function (w, d) {
  'use strict';
  function init() {

  var bootEl = d.getElementById('psx-boot');
  var root = d.getElementById('psx-app');
  if (!bootEl || !root) return;
  var B = JSON.parse(bootEl.textContent);
  var S = B.strings || {};

  function T(s, vars) {
    var out = S[s] || s;
    if (vars) Object.keys(vars).forEach(function (k) { out = out.split('{' + k + '}').join(vars[k]); });
    return out;
  }
  function h(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function num(n) { return new Intl.NumberFormat(B.sample.locale || undefined).format(n || 0); }
  function pct(a, b) { return b > 0 ? (Math.round(a / b * 1000) / 10).toLocaleString(B.sample.locale || undefined) + '%' : '–'; }
  function money(n) { try { return new Intl.NumberFormat(B.sample.locale || undefined, { style: 'currency', currency: (B.sample.currency || {}).iso || 'EUR', maximumFractionDigits: 0 }).format(n || 0); } catch (e) { return String(n); } }

  function api(action, params, body) {
    var q = Object.keys(params || {}).map(function (k) { return '&' + encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('');
    var opt = { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } };
    if (body !== undefined) { opt.method = 'POST'; opt.body = JSON.stringify(body); opt.headers['Content-Type'] = 'application/json'; }
    return fetch(B.api + action + q, opt).then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'network' }; });
  }

  /* ---------- icons ---------- */
  var IC = {
    popups: 'M4 5h16v11H9l-4 3v-3H4z', templates: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', stats: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    leads: 'M4 6h16v12H4zM4 7l8 6 8-6', settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', more: '', plus: 'M12 5v14M5 12h14', up: 'M12 3v12M7 8l5-5 5 5M4 21h16', down: 'M12 3v12M7 10l5 5 5-5M4 21h16', back: 'M15 6l-6 6 6 6'
  };
  function icon(k, size) {
    if (k === 'more') return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';
    return '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + IC[k] + '"/></svg>';
  }
  var LOGO = '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect x="1" y="1" width="32" height="32" rx="9" fill="#16181D"/><rect x="8" y="9" width="18" height="13" rx="3" fill="none" stroke="#fff" stroke-width="2"/><path d="M13 22l-1 4 5-4" fill="#fff"/><circle cx="23" cy="10" r="4" fill="#D93A1F"/></svg>';

  /* ---------- app state ---------- */
  var A = {
    B: B, T: T, h: h, api: api, num: num, pct: pct, money: money, icon: icon,
    view: 'list',
    popups: null,
    kpi: null,
    templates: null,
    filter: { status: 'all', q: '', format: '' },
    gallery: { group: 'all', q: '' },
    stats: { days: 30, id: 0, data: null },
    leads: { page: 1, q: '', id: 0, coupon: '', data: null },
    actions: {},
    root: root
  };
  w.PSXAdmin = A;
  if (w.PSX) { w.PSX.fontBase = B.fonts; w.PSX.fontFiles = B.fontFiles; w.PSX.loadFonts(['Geist', 'Geist Mono']); }

  /* ---------- dialogs and toasts ---------- */
  var toasts = d.createElement('div');
  toasts.className = 'psx-toasts';
  toasts.setAttribute('aria-live', 'polite');
  d.body.appendChild(toasts);
  A.toast = function (text, bad, undo) {
    var n = d.createElement('div');
    n.className = 'psx-toast' + (bad ? ' bad' : '');
    n.setAttribute('role', bad ? 'alert' : 'status');
    n.innerHTML = '<span style="flex:1">' + text + '</span>' + (undo ? '<button type="button" class="psx-btn2 sm ghost" style="color:#F2A493">' + h(T('Undo')) + '</button>' : '');
    if (undo) n.querySelector('button').addEventListener('click', function () { undo(); n.remove(); });
    toasts.appendChild(n);
    setTimeout(function () { n.remove(); }, 5000);
  };
  A.confirm = function (title, text, okLabel, cb) {
    var bg = d.createElement('div');
    bg.className = 'psx-dlg-bg';
    bg.innerHTML = '<div class="psx-dlg" role="dialog" aria-modal="true" aria-labelledby="psx-dt"><h2 id="psx-dt" style="font-size:18px">' + h(title) + '</h2><p style="margin-top:8px;color:#3A3F4B">' + h(text) +
      '</p><div class="acts"><button type="button" class="psx-btn2" data-x>' + h(T('Cancel')) + '</button><button type="button" class="psx-btn2 danger" data-ok>' + h(okLabel) + '</button></div></div>';
    d.body.appendChild(bg);
    var close = function () { bg.remove(); d.removeEventListener('keydown', esc); };
    var esc = function (e) { if (e.key === 'Escape') close(); };
    d.addEventListener('keydown', esc);
    bg.querySelector('[data-x]').addEventListener('click', close);
    bg.querySelector('[data-ok]').addEventListener('click', function () { close(); cb(); });
    bg.querySelector('[data-x]').focus();
  };
  A.menu = function (anchor, items) {
    var old = d.querySelector('.psx-menu');
    if (old) old.remove();
    var m = d.createElement('div');
    m.className = 'psx-menu';
    m.setAttribute('role', 'menu');
    items.forEach(function (it) {
      var b = d.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      b.textContent = it.label;
      if (it.bad) b.className = 'bad';
      b.addEventListener('click', function () { m.remove(); it.run(); });
      m.appendChild(b);
    });
    var r = anchor.getBoundingClientRect();
    m.style.top = (r.bottom + w.scrollY + 4) + 'px';
    m.style.left = Math.max(10, r.right + w.scrollX - 190) + 'px';
    d.body.appendChild(m);
    m.querySelector('button').focus();
    setTimeout(function () {
      var off = function (e) { if (!m.contains(e.target)) { m.remove(); d.removeEventListener('click', off); } };
      d.addEventListener('click', off);
    }, 0);
  };

  /* ---------- plain-language summaries ---------- */
  A.say = {
    when: function (s) {
      var t = (s && s.triggers) || {};
      var parts = [];
      if (t.timerOn) parts.push(+t.timerSec ? T('{n} seconds after landing', { n: t.timerSec }) : T('as soon as the page opens'));
      if (t.exitOn) parts.push(T('when leaving the page'));
      if (t.idleOn) parts.push(T('after {n} seconds without activity', { n: t.idleSec || 30 }));
      if (t.scrollOn) parts.push((t.scrollUnit || 'pct') === 'px' ? T('after scrolling {n} px', { n: t.scrollVal || 0 }) : T('after scrolling {n}% of the page', { n: t.scrollVal || 40 }));
      if (t.clickOn) parts.push(T('when someone clicks {sel}', { sel: t.clickSel || '…' }));
      if (t.pagesOn) parts.push(T('on page {n} of a visit', { n: t.pagesN || 2 }));
      if (t.addcartOn) parts.push(T('right after add to cart'));
      if (!parts.length) return T('As soon as the page opens');
      var j = t.mode === 'all' ? T(' and ') : T(', or ');
      var s1 = parts.join(j);
      return s1.charAt(0).toUpperCase() + s1.slice(1);
    },
    who: function (s) {
      var g = (s && s.targeting && s.targeting.groups) || [];
      g = g.filter(function (x) { return x.rules && x.rules.length; });
      if (!g.length) return T('Everyone, on every page');
      return g.map(function (gr) { return gr.rules.map(A.say.rule).join(', '); }).join(T(' — or — '));
    },
    rule: function (r) {
      var v = r.value;
      var list = function (arr, map) { return (arr || []).map(function (x) { return map ? (map(x) || x) : x; }).join(', '); };
      switch (r.type) {
        case 'audience': return { visitor: T('visitors not logged in'), guest: T('guest accounts'), customer: T('logged-in customers'), logged: T('anyone logged in') }[v] || v;
        case 'visit': return v === 'first' ? T('first-time visitors') : T('returning visitors');
        case 'device': return list(v, function (x) { return { desktop: T('Desktop'), tablet: T('Tablet'), mobile: T('Mobile') }[x]; });
        case 'newsletter': return r.op === 'subscribed' ? T('already subscribed') : T('not subscribed yet');
        case 'language': return T('language') + ' ' + list(v, function (id) { var l = B.langs.filter(function (x) { return x.id === +id; })[0]; return l && l.name; });
        case 'country': return (r.op === 'none' ? T('not in') + ' ' : T('in') + ' ') + list(v);
        case 'cart_value': return r.op === 'lt' ? T('cart under {n}', { n: money(r.a) }) : (r.op === 'between' ? T('cart between {a} and {b}', { a: money(r.a), b: money(r.b) }) : T('cart over {n}', { n: money(r.a) }));
        case 'cart_items': return r.op === 'lt' ? T('fewer than {n} items in cart', { n: r.a }) : T('{n} or more items in cart', { n: r.a || 1 });
        case 'cart_contains': return r.op === 'none' ? T('cart without chosen products') : T('cart has chosen products');
        case 'page': return (r.op === 'except' ? T('every page except') + ' ' : T('on') + ' ') + (list(r.pages, function (p) { return A.pageName(p); }) || T('chosen pages'));
        case 'url': return T('URL contains {v}', { v: v });
        case 'utm': return 'UTM ' + (r.key || 'campaign') + ' = ' + v;
        case 'referrer': return r.op === 'none' ? T('no referrer') : T('coming from {v}', { v: v });
        case 'group': return T('customer group');
        case 'orders': return r.op === 'none' ? T('never ordered') : T('ordered before');
        case 'daytime': return T('on chosen days and hours');
        case 'currency': return T('chosen currencies');
      }
      return r.type;
    }
  };
  A.pageName = function (p) {
    return { all: T('every page'), home: T('Home'), category: T('Category'), product: T('Product'), cms: T('CMS'), cart: T('Cart'), checkout: T('Checkout'), search: T('Search'), confirmation: T('Order confirmation'), notfound: T('Page not found'), other: T('Other') }[p] || p;
  };
  A.formatName = function (f) {
    return { modal: T('Modal'), fullscreen: T('Full screen'), slidein: T('Slide-in'), bar: T('Bar'), drawer: T('Side drawer'), sheet: T('Bottom sheet'), inline: T('Inline'), tab: T('Teaser tab') }[f] || f;
  };
  A.statusOf = function (p) {
    if (p.status === 'live' && p.date_start && new Date(p.date_start.replace(' ', 'T')) > new Date()) return 'sched';
    if (p.status === 'live' && p.date_end && new Date(p.date_end.replace(' ', 'T')) < new Date()) return 'ended';
    return p.status;
  };
  A.statusLabel = function (st) { return { live: T('Live'), sched: T('Scheduled'), paused: T('Paused'), draft: T('Draft'), ended: T('Ended') }[st] || st; };

  /* ---------- preview frames (shared with the editor) ---------- */
  A.frameHtml = function (opts) {
    opts = opts || {};
    var v = encodeURIComponent(B.assetv || B.version);
    var skeleton = opts.bare ? '' : '<div class="pg" aria-hidden="true"><div class="hd"></div><div class="hero"></div><div class="gr"><i></i><i></i><i></i><i></i></div><div class="gr"><i></i><i></i><i></i><i></i></div></div>';
    return '<!doctype html><html lang="' + h(B.lang) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<link rel="stylesheet" href="' + B.base + 'views/css/front.css?v=' + v + '">' +
      '<style>html,body{margin:0;min-height:100%;background:#fff;font-family:system-ui,sans-serif}.pg{padding:16px;display:flex;flex-direction:column;gap:14px}.pg .hd{height:30px;border-radius:5px;background:#ECEEF1}.pg .hero{height:190px;border-radius:6px;background:#E3E6EA}.pg .gr{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.pg .gr i{height:150px;border-radius:6px;background:#ECEEF1}@media (max-width:767px){.pg .gr{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '.psx-ed-sel{outline:2px solid #D93A1F!important;outline-offset:4px}.psx-ed-hover{outline:1px dashed #D93A1F!important;outline-offset:3px}.psx-ed-drop-before{box-shadow:0 -3px 0 #D93A1F!important}.psx-ed-drop-after{box-shadow:0 3px 0 #D93A1F!important}.psx-editor *{cursor:default}.psx-editor [data-bid]{cursor:pointer}' +
      (opts.css || '') + '</style></head><body>' + skeleton + '<script src="' + B.base + 'views/js/render.js?v=' + v + '"><\/script></body></html>';
  };
  /** Render a document into a preview iframe. cb(win, node) runs after mount. */
  A.mount = function (frame, doc, opts, cb) {
    var go = function () {
      var W = frame.contentWindow;
      if (!W || !W.PSX) { setTimeout(go, 30); return; }
      W.PSX.fontBase = B.fonts;
      W.PSX.fontFiles = B.fontFiles;
      var old = W.document.querySelectorAll('.psx');
      Array.prototype.forEach.call(old, function (n) { n.remove(); });
      var node = W.PSX.render(doc, Object.assign({ lang: B.lang, data: B.sample, i18n: {}, editor: true }, opts || {}));
      W.document.body.appendChild(node);
      node.classList.add('psx-in');
      if (opts && opts.step != null) {
        var steps = node.querySelectorAll('.psx-step');
        Array.prototype.forEach.call(steps, function (s, i) { s.hidden = i !== opts.step; });
      }
      if (cb) cb(W, node);
    };
    if (frame.getAttribute('data-ready')) go();
    else {
      frame.addEventListener('load', function () { frame.setAttribute('data-ready', '1'); go(); }, { once: true });
      if (!frame.getAttribute('srcdoc')) frame.setAttribute('srcdoc', A.frameHtml(opts && opts.frame));
    }
  };

  /* ---------- shell ---------- */
  function nav(active) {
    var items = [
      ['list', T('Popups'), 'popups', A.popups ? A.popups.length : ''],
      ['gallery', T('Templates'), 'templates', '50'],
      ['stats', T('Stats'), 'stats', ''],
      ['leads', T('Leads'), 'leads', ''],
      ['settings', T('Settings'), 'settings', '']
    ];
    return '<nav class="psx-nav" aria-label="Popup Studio"><div class="psx-brand">' + LOGO + '<div style="display:flex;flex-direction:column"><strong>Popup Studio</strong><span class="mono muted" style="font-size:12px">v' + h(B.version) + '</span></div></div>' +
      items.map(function (it) {
        return '<button type="button" data-a="go" data-v="' + it[0] + '"' + (active === it[0] ? ' aria-current="page"' : '') + '>' + icon(it[2]) + '<span>' + h(it[1]) + '</span><span class="cnt">' + h(it[3]) + '</span></button>';
      }).join('') +
      '</nav>';
  }
  function shell(active, inner) {
    return '<div class="psx-shell">' + nav(active) + '<main class="psx-main">' + inner + '</main></div>';
  }
  function author() {
    var t = d.getElementById('psx-author');
    return t ? '<section class="psx-banner" aria-label="' + h(T('About the author')) + '">' + t.innerHTML + '</section>' : '';
  }

  A.go = function (view, arg) {
    A.view = view;
    w.scrollTo(0, 0);
    if (view === 'editor') { A.Editor.open(arg); return; }
    if (view === 'list') return viewList();
    if (view === 'gallery') return viewGallery();
    if (view === 'stats') return viewStats();
    if (view === 'leads') return viewLeads();
    if (view === 'settings') return viewSettings();
  };

  /* ---------- events: one delegated handler per root ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-a]');
    if (!t || !root.contains(t)) return;
    var fn = A.actions[t.getAttribute('data-a')];
    if (fn) { e.preventDefault(); fn(t, e); }
  });
  root.addEventListener('change', function (e) {
    var t = e.target.closest('[data-c]');
    if (t && A.actions[t.getAttribute('data-c')]) A.actions[t.getAttribute('data-c')](t, e);
  });
  root.addEventListener('input', function (e) {
    var t = e.target.closest('[data-i]');
    if (t && A.actions[t.getAttribute('data-i')]) A.actions[t.getAttribute('data-i')](t, e);
  });
  A.actions.go = function (t) { A.go(t.getAttribute('data-v')); };

  /* ---------- popups list ---------- */
  function thumb(t) {
    var th = (t && t.theme) || {};
    var bg = th.bg || '#fff';
    var acc = th.accent || '#16181D';
    var ink = th.ink || '#16181D';
    var f = (t && t.format) || 'modal';
    var box = { modal: 'left:14px;top:7px;width:34px;height:28px', fullscreen: 'inset:0', slidein: 'right:4px;bottom:4px;width:24px;height:18px', bar: 'left:0;right:0;top:0;height:9px', drawer: 'right:0;top:0;bottom:0;width:22px', sheet: 'left:0;right:0;bottom:0;height:20px', inline: 'left:8px;right:8px;top:10px;height:22px', tab: 'left:0;top:12px;width:8px;height:18px' }[f] || 'left:14px;top:7px;width:34px;height:28px';
    return '<div class="psx-thumb" aria-hidden="true"><i style="' + box + ';background:' + h(bg) + ';box-shadow:0 1px 4px rgba(0,0,0,.25)"></i><i style="' + box.replace(/height:\d+px/, 'height:4px') + ';background:' + h(ink) + ';opacity:.8;margin:6px 0 0 4px;width:16px"></i><i style="' + box + ';height:5px;width:12px;background:' + h(acc) + ';margin:' + (f === 'bar' ? '2px 0 0 26px' : '18px 0 0 4px') + '"></i></div>';
  }
  function spark(arr) {
    var max = Math.max.apply(null, (arr || []).concat([1]));
    var pts = (arr || []).map(function (v, i) { return (i * 96 / 13).toFixed(1) + ',' + (26 - v / max * 22).toFixed(1); }).join(' ');
    return '<svg width="96" height="28" viewBox="0 0 96 28" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="#D93A1F" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }
  function listRows() {
    var f = A.filter;
    return (A.popups || []).filter(function (p) {
      var st = A.statusOf(p);
      if (f.status !== 'all' && st !== f.status) return false;
      if (f.q && p.name.toLowerCase().indexOf(f.q.toLowerCase()) === -1) return false;
      if (f.format && p.thumb.format !== f.format) return false;
      return true;
    });
  }
  function listTable() {
    var rows = listRows();
    if (!rows.length) return '<p class="psx-hint" style="padding:20px 18px">' + h(T('No popup matches these filters.')) + '</p>';
    return '<div class="psx-scroll"><table class="psx-tbl" style="min-width:1000px"><thead><tr><th><span class="sr">' + h(T('On or off')) + '</span></th><th>' + h(T('Popup')) + '</th><th>' + h(T('Status')) + '</th><th>' + h(T('Shows when, to whom')) + '</th><th class="r">' + h(T('Shown')) + '</th><th class="r">' + h(T('Converts')) + '</th><th>' + h(T('14 days')) + '</th><th><span class="sr">' + h(T('Actions')) + '</span></th></tr></thead><tbody>' +
      rows.map(function (p) {
        var st = A.statusOf(p);
        var s = p.stats || {};
        var conv = s.signups ? pct(s.signups, s.views) : (s.clicks ? pct(s.clicks, s.views) : '–');
        var convL = s.signups ? T('signed up') : (s.clicks ? T('clicked') : '');
        var note = st === 'sched' ? T('starts {d}', { d: p.date_start }) : (st === 'ended' ? T('ended {d}', { d: p.date_end }) : '');
        return '<tr><td><button type="button" class="psx-sw" role="switch" aria-checked="' + (p.status === 'live') + '" aria-label="' + h((p.status === 'live' ? T('Turn off') : T('Turn on')) + ' ' + p.name) + '" data-a="toggle" data-id="' + p.id + '"></button></td>' +
          '<td><div style="display:flex;gap:12px;align-items:center">' + thumb(p.thumb) + '<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><a href="#" data-a="edit" data-id="' + p.id + '" style="color:#16181D;font-weight:600;text-decoration:none">' + h(p.name) + '</a><span class="muted" style="font-size:12.5px">' + h(A.formatName(p.thumb.format)) + (p.ab_active && p.variants.length > 1 ? ' · <span style="color:#2453C9;font-weight:600">' + h(T('A/B, {n} variants', { n: p.variants.length })) + '</span>' : '') + '</span></div></div></td>' +
          '<td><span class="psx-pill ' + st + '"><i></i>' + h(A.statusLabel(st)) + '</span>' + (note ? '<div class="muted" style="font-size:12px;margin-top:4px">' + h(note) + '</div>' : '') + '</td>' +
          '<td style="max-width:340px;color:#3A3F4B">' + h(A.say.when(p.settings)) + '<br><span class="muted">' + h(A.say.who(p.settings)) + '</span></td>' +
          '<td class="r mono">' + num(s.views) + '</td><td class="r"><span class="mono" style="font-weight:600">' + conv + '</span><div class="muted" style="font-size:12px">' + h(convL) + '</div></td>' +
          '<td>' + spark(s.spark) + '</td>' +
          '<td style="white-space:nowrap"><button type="button" class="psx-ib" data-a="preview" data-id="' + p.id + '" aria-label="' + h(T('Preview {name} on the shop', { name: p.name })) + '">' + icon('eye') + '</button><button type="button" class="psx-ib" data-a="more" data-id="' + p.id + '" aria-label="' + h(T('More actions for {name}', { name: p.name })) + '">' + icon('more') + '</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function viewList() {
    root.innerHTML = shell('list', '<p class="psx-hint">' + h(T('Loading…')) + '</p>');
    api('list').then(function (r) {
      if (!r.ok) { A.toast(T('Could not load popups.'), true); return; }
      A.popups = r.popups;
      A.kpi = r.kpi;
      drawList();
    });
  }
  function drawList() {
    var P = A.popups || [];
    var counts = { all: P.length, live: 0, sched: 0, paused: 0, draft: 0, ended: 0 };
    P.forEach(function (p) { counts[A.statusOf(p)] = (counts[A.statusOf(p)] || 0) + 1; });
    var k = (A.kpi && A.kpi.totals) || {};
    var prev = (A.kpi && A.kpi.previous) || {};
    var delta = prev.views ? Math.round((k.views - prev.views) / prev.views * 100) : null;
    var empty = !P.length;
    var head = '<header class="psx-head"><div><h1>' + h(T('Popups')) + '</h1><p class="muted" style="margin-top:4px">' +
      h(T('{n} popups. {live} live, {sched} scheduled. Visitors see at most {cap} popups per visit.', { n: P.length, live: counts.live, sched: counts.sched, cap: B.settings.max_visit || '∞' })) + '</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><label class="psx-btn2" style="cursor:pointer">' + icon('down', 16) + h(T('Import')) + '<input type="file" accept="application/json,.json" class="sr" data-c="import"></label><button type="button" class="psx-btn2" data-a="export">' + icon('up', 16) + h(T('Export')) + '</button><button type="button" class="psx-btn2 pri" data-a="go" data-v="gallery">' + icon('plus', 16) + h(T('New popup')) + '</button></div></header>';
    var kpis = '<section class="psx-kpis" aria-label="' + h(T('Last 30 days')) + '">' +
      '<div class="psx-kpi"><span class="k">' + h(T('Shown, 30 days')) + '</span><span class="v">' + num(k.views) + '</span><span class="n" style="color:' + (delta >= 0 ? '#17804A' : '#B42318') + ';font-weight:600">' + (delta === null ? '' : h((delta >= 0 ? '+' : '') + delta + '% ' + T('vs previous 30'))) + '</span></div>' +
      '<div class="psx-kpi"><span class="k">' + h(T('Signups')) + '</span><span class="v">' + num(k.signups) + '</span><span class="n">' + h(T('{p} of views', { p: pct(k.signups, k.views) })) + '</span></div>' +
      '<div class="psx-kpi"><span class="k">' + h(T('Orders credited')) + '</span><span class="v">' + num(k.orders) + '</span><span class="n">' + h(T('popup coupon used, or a recent signup')) + '</span></div>' +
      '<div class="psx-kpi dark"><span class="k">' + h(T('Revenue credited to popups')) + '</span><span class="v">' + money(k.revenue) + '</span><span class="n">' + h(T('Orders within {d} days of a signup or with a popup coupon', { d: B.settings.attrib_days })) + '</span></div></section>';
    if (empty) {
      root.innerHTML = shell('list', head + '<section class="psx-card psx-empty"><svg width="120" height="84" viewBox="0 0 120 84" aria-hidden="true"><rect x="2" y="10" width="92" height="64" rx="8" fill="#EEF0F3" stroke="#C9CDD5"/><rect x="26" y="2" width="92" height="60" rx="8" fill="#fff" stroke="#16181D" stroke-width="2"/><rect x="40" y="18" width="44" height="6" rx="3" fill="#16181D"/><rect x="40" y="30" width="60" height="4" rx="2" fill="#C9CDD5"/><rect x="40" y="42" width="30" height="10" rx="3" fill="#D93A1F"/><circle cx="108" cy="10" r="6" fill="#D93A1F"/></svg><h2 style="font-size:20px">' + h(T('No popups yet')) +
        '</h2><p class="muted" style="max-width:400px">' + h(T('Start from one of 50 templates. Nothing goes live until you switch it on.')) + '</p><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button type="button" class="psx-btn2 pri" data-a="go" data-v="gallery">' + h(T('Browse templates')) + '</button><button type="button" class="psx-btn2" data-a="blank">' + h(T('Start blank')) + '</button></div></section>' + author());
      return;
    }
    var seg = ['all', 'live', 'sched', 'paused', 'draft'].map(function (st) {
      return '<button type="button" data-a="fstatus" data-v="' + st + '" aria-pressed="' + (A.filter.status === st) + '">' + h(st === 'all' ? T('All') : A.statusLabel(st)) + ' <span class="mono" style="opacity:.7">' + (counts[st] || 0) + '</span></button>';
    }).join('');
    root.innerHTML = shell('list', head + kpis +
      '<section class="psx-card"><div class="psx-card-h"><div class="psx-seg" role="group" aria-label="' + h(T('Filter by status')) + '">' + seg + '</div><div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<label><span class="sr">' + h(T('Search popups')) + '</span><input class="psx-inp" type="search" placeholder="' + h(T('Search by name')) + '" value="' + h(A.filter.q) + '" data-i="fq" style="width:230px"></label>' +
      '<label><span class="sr">' + h(T('Format')) + '</span><select class="psx-inp" data-c="fformat" style="width:170px"><option value="">' + h(T('Every format')) + '</option>' + ['modal', 'fullscreen', 'slidein', 'bar', 'drawer', 'sheet', 'inline'].map(function (f) { return '<option value="' + f + '"' + (A.filter.format === f ? ' selected' : '') + '>' + h(A.formatName(f)) + '</option>'; }).join('') + '</select></label></div></div>' +
      '<div id="psx-list-t">' + listTable() + '</div><div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;color:#5B6170;font-size:12.5px;flex-wrap:wrap;gap:8px"><span>' + h(T('When two popups qualify on one page, the higher priority wins. Set priority in Schedule and frequency.')) + '</span><a href="#" data-a="go" data-v="settings">' + h(T('Global limits')) + '</a></div></section>' + author());
  }
  A.actions.fstatus = function (t) { A.filter.status = t.getAttribute('data-v'); drawList(); };
  A.actions.fq = function (t) { A.filter.q = t.value; d.getElementById('psx-list-t').innerHTML = listTable(); };
  A.actions.fformat = function (t) { A.filter.format = t.value; d.getElementById('psx-list-t').innerHTML = listTable(); };
  A.actions.edit = function (t) { A.go('editor', +t.getAttribute('data-id')); };
  A.actions.blank = function () { A.Editor.blank(); };
  A.actions.toggle = function (t) {
    var id = +t.getAttribute('data-id');
    var p = A.popups.filter(function (x) { return x.id === id; })[0];
    var next = p.status === 'live' ? 'paused' : 'live';
    api('status', {}, { id: id, status: next }).then(function (r) {
      if (!r.ok) { A.toast(T('Could not change the status.'), true); return; }
      var before = p.status;
      p.status = next;
      drawList();
      A.toast(h(next === 'live' ? T('"{name}" is live.', { name: p.name }) : T('"{name}" paused.', { name: p.name })), false, function () {
        api('status', {}, { id: id, status: before }).then(function () { p.status = before; drawList(); });
      });
    });
  };
  A.actions.preview = function (t) {
    api('preview', { id: t.getAttribute('data-id') }).then(function (r) { if (r.ok) w.open(r.url, '_blank', 'noopener'); });
  };
  A.actions.more = function (t) {
    var id = +t.getAttribute('data-id');
    var p = A.popups.filter(function (x) { return x.id === id; })[0];
    A.menu(t, [
      { label: T('Edit'), run: function () { A.go('editor', id); } },
      { label: T('Test as a visitor'), run: function () { api('preview', { id: id, debug: 1 }).then(function (r) { if (r.ok) w.open(r.url, '_blank', 'noopener'); }); } },
      { label: T('Duplicate'), run: function () { api('duplicate', {}, { id: id }).then(function (r) { if (r.ok) { A.toast(h(T('Duplicated.'))); viewList(); } }); } },
      { label: T('Export as JSON'), run: function () { exportJson([id]); } },
      { label: T('Delete'), bad: true, run: function () {
        A.confirm(T('Delete "{name}"?', { name: p.name }), T('Its stats go too. Leads it collected stay in the Leads list. This can\'t be undone.'), T('Delete popup'), function () {
          api('delete', {}, { id: id }).then(function () { A.toast(h(T('Deleted.'))); viewList(); });
        });
      } }
    ]);
  };
  function exportJson(ids) {
    api('export', { ids: (ids || []).join(',') }).then(function (r) {
      if (!r.ok) return;
      var blob = new Blob([JSON.stringify(r.file, null, 2)], { type: 'application/json' });
      var a = d.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'popupstudio-' + new Date().toISOString().slice(0, 10) + '.json';
      d.body.appendChild(a); a.click(); a.remove();
    });
  }
  A.actions.export = function () { exportJson([]); };
  A.actions.import = function (t) {
    var f = t.files && t.files[0];
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var data;
      try { data = JSON.parse(rd.result); } catch (e) { A.toast(h(T('That file is not a Popup Studio export.')), true); return; }
      api('import', {}, data).then(function (r) {
        if (r.ok && r.ids.length) { A.toast(h(T('{n} popups imported as drafts.', { n: r.ids.length }))); viewList(); } else A.toast(h(T('That file is not a Popup Studio export.')), true);
      });
    };
    rd.readAsText(f);
  };

  /* ---------- template gallery ---------- */
  var GROUPS = [['all', 'All'], ['newsletter', 'Newsletter'], ['discount', 'Discount'], ['exit', 'Exit intent'], ['games', 'Games'], ['bars', 'Bars'], ['slidein', 'Slide-ins'], ['info', 'Info and notices'], ['seasonal', 'Seasonal']];
  A.loadTemplates = function () {
    if (A.templates) return Promise.resolve(A.templates);
    return api('templates').then(function (r) { A.templates = r.ok ? r.templates : []; return A.templates; });
  };
  function galleryCards() {
    var g = A.gallery;
    var list = (A.templates || []).filter(function (t) {
      if (g.group !== 'all' && t.group !== g.group) return false;
      if (g.q) {
        var hay = (t.name + ' ' + (t.tags || []).join(' ') + ' ' + t.group + ' ' + (t.doc.format || '')).toLowerCase();
        if (hay.indexOf(g.q.toLowerCase()) === -1) return false;
      }
      return true;
    });
    return '<div class="psx-grid"><button type="button" class="psx-tcard" data-a="blank" style="border-style:dashed;border-width:1.5px;border-color:#9AA0AC;background:transparent;align-items:center;justify-content:center;min-height:250px;gap:8px;cursor:pointer;font-family:inherit"><span style="width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #DADDE3;display:flex;align-items:center;justify-content:center;font-size:22px">+</span><strong>' + h(T('Blank popup')) + '</strong><span class="muted" style="font-size:12.5px">' + h(T('Choose the format first')) + '</span></button>' +
      list.map(function (t) {
        return '<article class="psx-tcard"><div class="pv' + (g.device === 'm' ? ' m' : '') + '"><iframe title="' + h(t.name) + '" tabindex="-1" aria-hidden="true" loading="lazy" data-tpl="' + h(t.slug) + '"></iframe></div><div class="b"><div style="display:flex;justify-content:space-between;gap:8px"><strong style="font-size:14px">' + h(t.name) + '</strong><span class="mono muted" style="font-size:12px">' + h(t.num) + '</span></div><span class="muted" style="font-size:12.5px">' + h(T(t.formatLabel || A.formatName(t.doc.format))) + '</span></div><div class="a"><button type="button" class="psx-btn2 pri" style="flex:1" data-a="use" data-slug="' + h(t.slug) + '">' + h(T('Use')) + '</button><button type="button" class="psx-btn2" data-a="tplprev" data-slug="' + h(t.slug) + '" aria-label="' + h(T('Preview {name}', { name: t.name })) + '">' + h(T('Preview')) + '</button></div></article>';
      }).join('') + '</div>';
  }
  function hydrateThumbs() {
    var frames = root.querySelectorAll('iframe[data-tpl]');
    var io = 'IntersectionObserver' in w ? new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fillThumb(e.target); } });
    }, { rootMargin: '200px' }) : null;
    Array.prototype.forEach.call(frames, function (f) { if (io) io.observe(f); else fillThumb(f); });
  }
  function fillThumb(f) {
    var t = (A.templates || []).filter(function (x) { return x.slug === f.getAttribute('data-tpl'); })[0];
    if (!t) return;
    A.mount(f, t.doc, { mobile: A.gallery.device === 'm', game: t.settings && t.settings.game, editor: false });
  }
  function viewGallery() {
    root.innerHTML = shell('gallery', '<p class="psx-hint">' + h(T('Loading…')) + '</p>');
    A.loadTemplates().then(drawGallery);
  }
  function drawGallery() {
    var counts = {};
    (A.templates || []).forEach(function (t) { counts[t.group] = (counts[t.group] || 0) + 1; });
    var chips = GROUPS.map(function (g) {
      return '<button type="button" class="psx-chip2" data-a="ggroup" data-v="' + g[0] + '" aria-pressed="' + (A.gallery.group === g[0]) + '">' + h(T(g[1])) + ' <span class="mono" style="opacity:.75">' + (g[0] === 'all' ? (A.templates || []).length : (counts[g[0]] || 0)) + '</span></button>';
    }).join('');
    root.innerHTML = shell('gallery', '<header class="psx-head"><div><h1>' + h(T('Start from a template')) + '</h1><p class="muted" style="margin-top:4px">' + h(T('50 templates, each with a desktop and a mobile layout. Pick one, then change anything in the editor.')) + '</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><div class="psx-seg" role="group" aria-label="' + h(T('Preview device')) + '"><button type="button" data-a="gdev" data-v="d" aria-pressed="' + (A.gallery.device !== 'm') + '">' + h(T('Desktop')) + '</button><button type="button" data-a="gdev" data-v="m" aria-pressed="' + (A.gallery.device === 'm') + '">' + h(T('Mobile')) + '</button></div><label><span class="sr">' + h(T('Search templates')) + '</span><input class="psx-inp" type="search" placeholder="' + h(T('Search: wheel, Black Friday, bar…')) + '" style="width:270px" data-i="gq" value="' + h(A.gallery.q) + '"></label></div></header>' +
      '<div role="group" aria-label="' + h(T('Filter by goal')) + '" style="display:flex;flex-wrap:wrap;gap:8px">' + chips + '</div><div id="psx-gal">' + galleryCards() + '</div>');
    hydrateThumbs();
  }
  A.actions.ggroup = function (t) { A.gallery.group = t.getAttribute('data-v'); drawGallery(); };
  A.actions.gdev = function (t) { A.gallery.device = t.getAttribute('data-v'); drawGallery(); };
  A.actions.gq = function (t) { A.gallery.q = t.value; d.getElementById('psx-gal').innerHTML = galleryCards(); hydrateThumbs(); };
  A.actions.use = function (t) { A.Editor.fromTemplate(t.getAttribute('data-slug')); };
  A.actions.tplprev = function (t) {
    var tpl = A.templates.filter(function (x) { return x.slug === t.getAttribute('data-slug'); })[0];
    var bg = d.createElement('div');
    bg.className = 'psx-dlg-bg';
    bg.innerHTML = '<div class="psx-dlg" role="dialog" aria-modal="true" aria-label="' + h(tpl.name) + '" style="max-width:1200px;padding:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><strong>' + h(tpl.num + ' ' + tpl.name) + '</strong><div style="display:flex;gap:8px"><button type="button" class="psx-btn2 pri" data-use>' + h(T('Use this template')) + '</button><button type="button" class="psx-btn2" data-x>' + h(T('Close')) + '</button></div></div><div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap"><iframe class="psx-stage" style="flex:1 1 560px;min-width:0;height:min(560px,calc(100vh - 150px))" title="' + h(T('Desktop')) + '"></iframe><iframe class="psx-stage m" style="height:min(560px,calc(100vh - 150px))" title="' + h(T('Mobile')) + '"></iframe></div></div>';
    d.body.appendChild(bg);
    var fr = bg.querySelectorAll('iframe');
    A.mount(fr[0], tpl.doc, { mobile: false, game: tpl.settings && tpl.settings.game, editor: false });
    A.mount(fr[1], tpl.doc, { mobile: true, game: tpl.settings && tpl.settings.game, editor: false });
    var close = function () { bg.remove(); d.removeEventListener('keydown', esc); };
    var esc = function (e) { if (e.key === 'Escape') close(); };
    d.addEventListener('keydown', esc);
    bg.querySelector('[data-x]').addEventListener('click', close);
    bg.querySelector('[data-use]').addEventListener('click', function () { close(); A.Editor.fromTemplate(tpl.slug); });
    bg.querySelector('[data-x]').focus();
  };

  /* ---------- stats ---------- */
  function chart(series) {
    var max = Math.max(10, Math.max.apply(null, series.map(function (s) { return s.views; })));
    var smax = Math.max(1, Math.max.apply(null, series.map(function (s) { return s.signups; })));
    var n = series.length;
    var bw = Math.max(2, 900 / n - 6);
    var bars = series.map(function (s, i) { var hh = Math.round(s.views / max * 200); return '<rect x="' + (50 + i * 900 / n).toFixed(1) + '" y="' + (220 - hh) + '" width="' + bw.toFixed(1) + '" height="' + hh + '" rx="2" fill="#C9CDD5"><title>' + h(s.day + ': ' + s.views) + '</title></rect>'; }).join('');
    var line = series.map(function (s, i) { return (50 + i * 900 / n + bw / 2).toFixed(1) + ',' + (220 - s.signups / smax * 190).toFixed(1); }).join(' ');
    var labels = [0, Math.floor(n / 2), n - 1].map(function (i) { return '<text x="' + (50 + i * 900 / n + bw / 2).toFixed(1) + '" y="244" text-anchor="middle" font-size="11" fill="#5B6170" font-family="Geist Mono, monospace">' + h(series[i].day.slice(5)) + '</text>'; }).join('');
    return '<svg class="psx-chart" viewBox="0 0 960 252" role="img" aria-label="' + h(T('Daily views and signups')) + '"><line x1="50" y1="220" x2="960" y2="220" stroke="#DADDE3"/><text x="44" y="24" text-anchor="end" font-size="11" fill="#5B6170" font-family="Geist Mono, monospace">' + num(max) + '</text>' + bars +
      '<polyline points="' + line + '" fill="none" stroke="#D93A1F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' + labels + '</svg>';
  }
  function viewStats() {
    root.innerHTML = shell('stats', '<p class="psx-hint">' + h(T('Loading…')) + '</p>');
    var load = A.popups ? Promise.resolve() : api('list').then(function (r) { A.popups = r.popups || []; });
    load.then(function () { return api('stats', { days: A.stats.days, id: A.stats.id }); }).then(function (r) { A.stats.data = r.report; drawStats(); });
  }
  function drawStats() {
    var R = A.stats.data || { totals: {}, series: [], devices: [], popups: [] };
    var t = R.totals || {};
    var devName = [T('Desktop'), T('Tablet'), T('Mobile')];
    var devMax = Math.max.apply(null, [1].concat(R.devices.map(function (x) { return x.views ? x.signups / x.views : 0; })));
    root.innerHTML = shell('stats', '<header class="psx-head"><div><h1>' + h(T('Stats')) + '</h1><p class="muted" style="margin-top:4px">' + h(T('Counted per day, with no personal data. Orders are credited when a popup coupon is used, or within {d} days of a signup.', { d: B.settings.attrib_days })) + '</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><label><span class="sr">' + h(T('Popup')) + '</span><select class="psx-inp" data-c="sid" style="width:220px"><option value="0">' + h(T('All popups')) + '</option>' + (A.popups || []).map(function (p) { return '<option value="' + p.id + '"' + (A.stats.id === p.id ? ' selected' : '') + '>' + h(p.name) + '</option>'; }).join('') + '</select></label>' +
      '<label><span class="sr">' + h(T('Period')) + '</span><select class="psx-inp" data-c="sdays" style="width:150px">' + [7, 30, 90, 365].map(function (n) { return '<option value="' + n + '"' + (A.stats.days === n ? ' selected' : '') + '>' + h(T('Last {n} days', { n: n })) + '</option>'; }).join('') + '</select></label><button type="button" class="psx-btn2" data-a="scsv">' + h(T('Export CSV')) + '</button></div></header>' +
      '<section class="psx-card" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">' + [[T('Shown'), num(t.views)], [T('Closed without action'), num(t.closes)], [T('Signups'), num(t.signups)], [T('Orders credited'), num(t.orders)], [T('Revenue credited'), money(t.revenue)]].map(function (k, i) { return '<div class="psx-kpi" style="border:0;border-radius:0;' + (i ? 'border-left:1px solid #EEF0F3' : '') + '"><span class="k">' + h(k[0]) + '</span><span class="v">' + k[1] + '</span></div>'; }).join('') + '</section>' +
      '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Views and signups per day')) + '</h2><div style="display:flex;gap:16px;font-size:12.5px;color:#3A3F4B"><span style="display:flex;gap:6px;align-items:center"><span style="width:12px;height:12px;border-radius:3px;background:#C9CDD5"></span>' + h(T('Shown')) + '</span><span style="display:flex;gap:6px;align-items:center"><span style="width:14px;height:3px;background:#D93A1F"></span>' + h(T('Signups')) + '</span></div></div><div style="padding:16px 18px 8px;overflow-x:auto">' + chart(R.series) + '</div></section>' +
      '<div class="psx-cols2"><section class="psx-card" style="flex:3 1 440px;min-width:0"><div class="psx-card-h"><h2>' + h(T('From view to order')) + '</h2></div><div class="psx-card-b">' +
      [[T('Shown'), t.views, '#C9CDD5'], [T('Signed up'), t.signups, '#D93A1F'], [T('Ordered'), t.orders, '#16181D']].map(function (f) {
        return '<div style="display:grid;grid-template-columns:150px 1fr 80px;gap:12px;align-items:center"><span>' + h(f[0]) + '</span><div class="psx-bar2" style="height:24px;border-radius:6px"><i style="width:' + (t.views ? Math.max(0.5, f[1] / t.views * 100) : 0) + '%;background:' + f[2] + ';border-radius:6px"></i></div><span class="mono" style="text-align:right;font-weight:600">' + num(f[1]) + '</span></div>';
      }).join('') + '</div></section>' +
      '<section class="psx-card" style="flex:2 1 300px;min-width:0"><div class="psx-card-h"><h2>' + h(T('Signup rate by device')) + '</h2></div><div class="psx-card-b">' +
      (R.devices.length ? R.devices.map(function (x) { var r1 = x.views ? x.signups / x.views : 0; return '<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between"><span>' + h(devName[x.device] || '') + '</span><span class="mono" style="font-weight:600">' + pct(x.signups, x.views) + '</span></div><div class="psx-bar2" style="height:8px"><i style="width:' + (r1 / devMax * 100) + '%;background:#16181D"></i></div><span class="muted" style="font-size:12px">' + h(T('{n} views', { n: num(x.views) })) + '</span></div>'; }).join('') : '<p class="muted">' + h(T('No views yet.')) + '</p>') + '</div></section></div>' +
      '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Per popup')) + '</h2></div><div class="psx-scroll"><table class="psx-tbl" style="min-width:760px"><thead><tr><th>' + h(T('Popup')) + '</th><th class="r">' + h(T('Shown')) + '</th><th class="r">' + h(T('Clicks')) + '</th><th class="r">' + h(T('Signups')) + '</th><th class="r">' + h(T('Rate')) + '</th><th class="r">' + h(T('Orders')) + '</th><th class="r">' + h(T('Revenue')) + '</th></tr></thead><tbody>' +
      (R.popups.length ? R.popups.map(function (p) { return '<tr><td style="font-weight:600">' + h(p.name || ('#' + p.id_popup)) + '</td><td class="r mono">' + num(p.views) + '</td><td class="r mono">' + num(p.clicks) + '</td><td class="r mono">' + num(p.signups) + '</td><td class="r mono">' + pct(p.signups || p.clicks, p.views) + '</td><td class="r mono">' + num(p.orders) + '</td><td class="r mono">' + money(p.revenue) + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="muted">' + h(T('No data for this period yet.')) + '</td></tr>') + '</tbody></table></div></section>' +
      answersCard(R.answers || []) + feedbackCard(R.feedback || []));
  }
  function answersCard(rows) {
    if (!rows.length) return '';
    var groups = {};
    var order = [];
    rows.forEach(function (r) { var k = r.id_popup + '|' + r.question; if (!groups[k]) { groups[k] = { name: r.name, q: r.question, total: 0, rows: [] }; order.push(k); } groups[k].rows.push(r); groups[k].total += r.n; });
    return '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Answers')) + '</h2><span class="psx-hint">' + h(T('All time')) + '</span></div><div class="psx-card-b">' +
      order.map(function (k) {
        var g = groups[k];
        return '<div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;justify-content:space-between;gap:12px"><b>' + h(g.name || '') + ' <span class="mono muted" style="font-weight:500">' + h(g.q) + '</span></b><span class="muted">' + h(T('{n} answers', { n: num(g.total) })) + '</span></div>' +
          g.rows.map(function (r) { return '<div style="display:grid;grid-template-columns:160px 1fr 90px;gap:12px;align-items:center"><span class="mono">' + h(r.answer) + '</span><div class="psx-bar2" style="height:10px"><i style="width:' + (g.total ? r.n / g.total * 100 : 0) + '%;background:#16181D"></i></div><span class="mono" style="text-align:right">' + num(r.n) + ' · ' + pct(r.n, g.total) + '</span></div>'; }).join('') + '</div>';
      }).join('') + '</div></section>';
  }
  function feedbackCard(rows) {
    return '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Written feedback')) + '</h2><span class="psx-hint">' + h(T('From text boxes in your popups')) + '</span></div>' +
      (rows.length ? '<div class="psx-scroll"><table class="psx-tbl" style="min-width:760px"><thead><tr><th>' + h(T('Date')) + '</th><th>' + h(T('Popup')) + '</th><th>' + h(T('Rating')) + '</th><th>' + h(T('Message')) + '</th><th>' + h(T('Email')) + '</th><th></th></tr></thead><tbody>' +
        rows.map(function (f) { return '<tr><td class="mono" style="white-space:nowrap">' + h(String(f.date_add).slice(0, 16)) + '</td><td>' + h(f.name || ('#' + f.id_popup)) + '</td><td class="mono">' + (+f.rating ? h(f.rating + '/5') : '—') + '</td><td style="white-space:pre-wrap;max-width:420px">' + h(f.message) + '</td><td>' + (f.email ? h(f.email) : '<span class="muted">' + h(T('Anonymous')) + '</span>') + '</td><td class="r"><button type="button" class="psx-btn2 psx-btn2-sm" data-a="fdel" data-id="' + f.id_feedback + '">' + h(T('Delete')) + '</button></td></tr>'; }).join('') + '</tbody></table></div>'
        : '<div class="psx-card-b"><p class="muted">' + h(T('No written feedback in this period.')) + '</p></div>') + '</section>';
  }
  A.actions.fdel = function (t) {
    var id = +t.getAttribute('data-id');
    A.confirm(T('Delete this message?'), T('This can\'t be undone.'), T('Delete'), function () {
      api('feedback_delete', {}, { id: id }).then(function () { A.toast(h(T('Deleted.'))); viewStats(); });
    });
  };
  A.actions.sid = function (t) { A.stats.id = +t.value; viewStats(); };
  A.actions.sdays = function (t) { A.stats.days = +t.value; viewStats(); };
  A.actions.scsv = function () {
    var R = A.stats.data;
    if (!R) return;
    var csv = 'day,views,signups,clicks\n' + R.series.map(function (s) { return [s.day, s.views, s.signups, s.clicks].join(','); }).join('\n');
    var a = d.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'popupstudio-stats-' + new Date().toISOString().slice(0, 10) + '.csv';
    d.body.appendChild(a); a.click(); a.remove();
  };

  /* ---------- leads ---------- */
  function viewLeads() {
    root.innerHTML = shell('leads', '<p class="psx-hint">' + h(T('Loading…')) + '</p>');
    var L = A.leads;
    var load = A.popups ? Promise.resolve() : api('list').then(function (r) { A.popups = r.popups || []; });
    load.then(function () { return api('leads', { page: L.page, q: L.q, id: L.id, coupon: L.coupon }); }).then(function (r) { L.data = r; drawLeads(); });
  }
  function couponState(r) {
    if (!r.coupon) return ['–', '#fff', '#5B6170', T('No coupon')];
    if (+r.coupon_used) return [r.coupon, '#E7F5EC', '#11663A', T('Used')];
    if (r.date_to && new Date(r.date_to.replace(' ', 'T')) < new Date()) return [r.coupon, '#FDECEA', '#9B1C1C', T('Expired')];
    return [r.coupon, '#EEF0F3', '#3A3F4B', T('Not used')];
  }
  function drawLeads() {
    var L = A.leads;
    var D = L.data || { rows: [], total: 0, page: 1, per: 50 };
    var pages = Math.max(1, Math.ceil(D.total / D.per));
    var news = { subscribed: [T('Subscribed'), '#E7F5EC', '#11663A'], exists: [T('Subscribed'), '#E7F5EC', '#11663A'], pending: [T('Waiting for confirmation'), '#FDF3DC', '#7A5200'], unavailable: [T('Leads list only'), '#EEF0F3', '#3A3F4B'], '': [T('Leads list only'), '#EEF0F3', '#3A3F4B'], error: [T('Not subscribed'), '#FDECEA', '#9B1C1C'] };
    root.innerHTML = shell('leads', '<header class="psx-head"><div><h1>' + h(T('Leads')) + '</h1><p class="muted" style="margin-top:4px">' + h(T('Everyone who signed up through a popup. They are also added to the shop\'s newsletter list when the form says so.')) + '</p></div><a class="psx-btn2" href="' + h(B.leadsCsv + (L.id ? '&id=' + L.id : '')) + '">' + h(T('Export CSV')) + '</a></header>' +
      '<section class="psx-card"><div class="psx-card-h" style="justify-content:flex-start"><label><span class="sr">' + h(T('Search leads')) + '</span><input class="psx-inp" type="search" placeholder="' + h(T('Search email or name')) + '" style="width:250px" value="' + h(L.q) + '" data-c="lq"></label>' +
      '<label><span class="sr">' + h(T('Popup')) + '</span><select class="psx-inp" data-c="lid" style="width:220px"><option value="0">' + h(T('Every popup')) + '</option>' + (A.popups || []).map(function (p) { return '<option value="' + p.id + '"' + (L.id === p.id ? ' selected' : '') + '>' + h(p.name) + '</option>'; }).join('') + '</select></label>' +
      '<label><span class="sr">' + h(T('Coupon')) + '</span><select class="psx-inp" data-c="lcoupon" style="width:180px">' + [['', T('Any coupon state')], ['used', T('Used')], ['open', T('Not used')], ['expired', T('Expired')]].map(function (o) { return '<option value="' + o[0] + '"' + (L.coupon === o[0] ? ' selected' : '') + '>' + h(o[1]) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="psx-scroll"><table class="psx-tbl" style="min-width:980px"><thead><tr><th>' + h(T('Email')) + '</th><th>' + h(T('Name')) + '</th><th>' + h(T('From')) + '</th><th>' + h(T('Coupon')) + '</th><th>' + h(T('Newsletter')) + '</th><th>' + h(T('Consent')) + '</th><th>' + h(T('Date')) + '</th><th><span class="sr">' + h(T('Actions')) + '</span></th></tr></thead><tbody>' +
      (D.rows.length ? D.rows.map(function (r) {
        var c = couponState(r);
        var n = news[r.newsletter] || news[''];
        return '<tr><td class="mono" style="font-size:13px">' + h(r.email) + '</td><td>' + h(r.firstname || '–') + '</td><td>' + h((r.popup || '#') + (r.variant ? ' · ' + r.variant : '')) + '<div class="muted" style="font-size:12px">' + h(r.lang || '') + '</div></td>' +
          '<td><span class="mono" style="font-size:12.5px">' + h(c[0]) + '</span><div><span class="psx-pill" style="background:' + c[1] + ';color:' + c[2] + ';padding:2px 9px;font-size:12px">' + h(c[3]) + '</span></div></td>' +
          '<td><span class="psx-pill" style="background:' + n[1] + ';color:' + n[2] + ';padding:2px 9px;font-size:12px">' + h(n[0]) + '</span></td><td style="font-size:12.5px">' + (+r.consent ? h(T('Yes, {d}', { d: r.date_add.slice(0, 16) })) : h(T('No'))) + '</td><td class="mono" style="font-size:12.5px">' + h(r.date_add.slice(0, 10)) + '</td>' +
          '<td><button type="button" class="psx-ib" data-a="ldel" data-email="' + h(r.email) + '" aria-label="' + h(T('Delete lead {email}', { email: r.email })) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></td></tr>';
      }).join('') : '<tr><td colspan="8" class="muted" style="padding:24px 14px">' + h(T('No leads yet. They appear here as soon as someone signs up through a popup.')) + '</td></tr>') + '</tbody></table></div>' +
      '<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:12px 16px;font-size:12.5px;color:#5B6170;align-items:center"><span>' + h(T('Showing {a} of {b}. Deleting a lead also removes its consent record.', { a: D.rows.length, b: num(D.total) })) + '</span><span style="display:flex;gap:6px;align-items:center"><button type="button" class="psx-btn2 sm" data-a="lpage" data-v="-1"' + (D.page <= 1 ? ' disabled' : '') + '>‹</button><span class="mono">' + D.page + ' / ' + pages + '</span><button type="button" class="psx-btn2 sm" data-a="lpage" data-v="1"' + (D.page >= pages ? ' disabled' : '') + '>›</button></span></div></section>');
  }
  A.actions.lq = function (t) { A.leads.q = t.value; A.leads.page = 1; viewLeads(); };
  A.actions.lid = function (t) { A.leads.id = +t.value; A.leads.page = 1; viewLeads(); };
  A.actions.lcoupon = function (t) { A.leads.coupon = t.value; A.leads.page = 1; viewLeads(); };
  A.actions.lpage = function (t) { A.leads.page = Math.max(1, A.leads.page + (+t.getAttribute('data-v'))); viewLeads(); };
  A.actions.ldel = function (t) {
    var email = t.getAttribute('data-email');
    A.confirm(T('Delete {email}?', { email: email }), T('Every lead and consent record for this address is removed. This can\'t be undone.'), T('Delete lead'), function () {
      api('lead_delete', {}, { email: email }).then(function () { A.toast(h(T('Deleted.'))); viewLeads(); });
    });
  };

  /* ---------- settings ---------- */
  function sw(key, label, hint, on) {
    return '<div class="psx-ln"><span>' + h(label) + (hint ? '<span class="psx-hint" style="display:block">' + h(hint) + '</span>' : '') + '</span><button type="button" class="psx-sw" role="switch" aria-checked="' + (!!on) + '" aria-label="' + h(label) + '" data-a="stoggle" data-k="' + key + '"></button></div>';
  }
  function viewSettings() {
    var s = B.settings;
    var ok = function (txt) { return '<span style="display:inline-flex;gap:6px;align-items:center;font-size:12.5px;font-weight:600;color:#11663A">✓ ' + h(txt) + '</span>'; };
    var warn = function (txt, link) { return '<span style="display:inline-flex;gap:6px;align-items:center;font-size:12.5px;font-weight:600;color:#7A5200">' + h(txt) + (link ? ' · <a href="' + h(link) + '" target="_blank" rel="noopener">' + h(T('open')) + '</a>' : '') + '</span>'; };
    var last = s.webhook_last;
    root.innerHTML = shell('settings', '<header class="psx-head"><div><h1>' + h(T('Settings')) + '</h1><p class="muted" style="margin-top:4px">' + h(T('Shop-wide rules that every popup follows.')) + '</p></div><button type="button" class="psx-btn2 pri" data-a="ssave">' + h(T('Save settings')) + '</button></header>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:18px;align-items:start">' +
      '<section class="psx-card"><div class="psx-card-h" style="display:block"><h2>' + h(T('Limits')) + '</h2><p class="psx-hint" style="margin-top:2px">' + h(T('Keeps popups from piling up on one visitor.')) + '</p></div><div class="psx-card-b">' +
      '<div class="psx-ln"><label for="s-mv">' + h(T('Most popups one visitor sees per visit')) + '</label><input id="s-mv" class="psx-inp mono" style="width:76px;text-align:center" type="number" min="0" data-k="max_visit" value="' + h(s.max_visit) + '"></div>' +
      '<div class="psx-ln"><label for="s-mo">' + h(T('Most popups open at the same time')) + '</label><input id="s-mo" class="psx-inp mono" style="width:76px;text-align:center" type="number" min="1" data-k="max_once" value="' + h(s.max_once) + '"></div>' +
      sw('count_bars', T('Bars and inline blocks count toward these limits'), '', s.count_bars) +
      sw('hide_bots', T('Hide popups from search engine bots'), T('Keeps them out of page snapshots'), s.hide_bots) +
      '<label class="psx-lbl">' + h(T('Never show to these IP addresses')) + '<input class="psx-inp mono" data-k="ip_exclude" value="' + h(s.ip_exclude) + '" placeholder="203.0.113.24, 198.51.100.0/24"><span class="psx-hint">' + h(T('Comma separated. Ranges like 198.51.100.0/24 work.')) + '</span></label></div></section>' +
      '<section class="psx-card"><div class="psx-card-h" style="display:block"><h2>' + h(T('Newsletter and consent')) + '</h2><p class="psx-hint" style="margin-top:2px">' + h(T('Where signups go and how consent is kept.')) + '</p></div><div class="psx-card-b">' +
      '<div class="psx-ln"><span>' + h(T('Newsletter module')) + '<span class="psx-hint" style="display:block">ps_emailsubscription</span></span>' + (s.newsletter_module ? ok(T('Installed')) : warn(T('Not installed'), s.links.newsletter)) + '</div>' +
      '<div class="psx-ln"><span>' + h(T('Confirmation email before subscribing')) + '<span class="psx-hint" style="display:block">' + h(T('Follows the newsletter module\'s own setting')) + '</span></span><span style="font-weight:600">' + h(s.newsletter_verification ? T('On') : T('Off')) + '</span></div>' +
      '<div class="psx-ln"><span>' + h(T('Consent text')) + '<span class="psx-hint" style="display:block">' + h(T('From the Official GDPR module when it is installed')) + '</span></span>' + (s.gdpr_module ? ok(T('psgdpr found')) : warn(T('Not installed'))) + '</div>' +
      sw('consent_log', T('Keep a consent record for each signup'), T('Date, IP, popup and the exact text shown'), s.consent_log) + '</div></section>' +
      '<section class="psx-card"><div class="psx-card-h" style="display:block"><h2>' + h(T('Generated coupons')) + '</h2><p class="psx-hint" style="margin-top:2px">' + h(T('Used when a popup gives each visitor their own code. The prefix is set per popup.')) + '</p></div><div class="psx-card-b">' +
      '<label class="psx-lbl">' + h(T('Random part')) + '<select class="psx-inp" data-k="coupon_len">' + [6, 8, 10, 12].map(function (n) { return '<option value="' + n + '"' + (+s.coupon_len === n ? ' selected' : '') + '>' + h(T('{n} characters', { n: n })) + '</option>'; }).join('') + '</select></label>' +
      sw('coupon_cleanup', T('Delete unused codes after they expire'), T('Keeps Catalog › Discounts readable'), s.coupon_cleanup) +
      '<div class="psx-ln"><span class="psx-hint">' + h(T('Clean up expired codes now')) + '</span><button type="button" class="psx-btn2 sm" data-a="cleanup">' + h(T('Clean up')) + '</button></div></div></section>' +
      '<section class="psx-card"><div class="psx-card-h" style="display:block"><h2>' + h(T('Webhook')) + '</h2><p class="psx-hint" style="margin-top:2px">' + h(T('Sends each signup to another tool, such as Brevo, Mailchimp or Zapier.')) + '</p></div><div class="psx-card-b">' +
      '<label class="psx-lbl">' + h(T('Address')) + '<input class="psx-inp mono" data-k="webhook_url" value="' + h(s.webhook_url) + '" placeholder="https://hooks.example.com/popup-signups"></label>' +
      '<div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap"><label class="psx-lbl" style="flex:1;min-width:200px">' + h(T('Signing secret')) + '<input class="psx-inp mono" type="password" autocomplete="new-password" data-k="webhook_secret" value="' + h(s.webhook_secret) + '"></label><button type="button" class="psx-btn2" data-a="whtest">' + h(T('Send a test')) + '</button></div>' +
      '<p class="psx-hint" id="psx-whl">' + (last ? h(T('Last delivery: {d}, answered {c} in {ms} ms', { d: last.date, c: last.code || '–', ms: last.ms })) : h(T('Nothing sent yet.'))) + '</p></div></section>' +
      '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Speed and privacy')) + '</h2></div><div class="psx-card-b">' +
      sw('reduced_motion', T('Calmer animations for visitors who ask their device for less motion'), '', s.reduced_motion) +
      '<div class="psx-ln"><span>' + h(T('Country rules')) + '<span class="psx-hint" style="display:block">' + h(T('Need PrestaShop geolocation')) + '</span></span>' + (s.geolocation ? ok(T('On')) : warn(T('Off'), s.links.geolocation)) + '</div>' +
      '<div class="psx-ln"><label for="s-ad">' + h(T('Credit an order to a signup within')) + '</label><span style="display:flex;gap:6px;align-items:center"><input id="s-ad" class="psx-inp mono" style="width:70px;text-align:center" type="number" min="1" data-k="attrib_days" value="' + h(s.attrib_days) + '">' + h(T('days')) + '</span></div></div></section>' +
      '<section class="psx-card"><div class="psx-card-h"><h2>' + h(T('Move popups between shops')) + '</h2></div><div class="psx-card-b"><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="psx-btn2" data-a="export">' + h(T('Export all as JSON')) + '</button><label class="psx-btn2" style="cursor:pointer">' + h(T('Import JSON')) + '<input type="file" class="sr" accept="application/json,.json" data-c="import"></label></div>' +
      sw('keep_data', T('Keep popups, leads and stats when the module is uninstalled'), '', s.keep_data) + '</div></section></div>');
  }
  A.actions.stoggle = function (t) { var on = t.getAttribute('aria-checked') !== 'true'; t.setAttribute('aria-checked', String(on)); B.settings[t.getAttribute('data-k')] = on ? 1 : 0; };
  A.actions.ssave = function () {
    var data = {};
    Object.keys(B.settings).forEach(function (k) { data[k] = B.settings[k]; });
    Array.prototype.forEach.call(root.querySelectorAll('[data-k]'), function (n) { if (n.tagName !== 'BUTTON') data[n.getAttribute('data-k')] = n.value; });
    api('settings_save', {}, data).then(function (r) {
      if (r.ok) { B.settings = r.settings; A.toast(h(T('Settings saved.'))); viewSettings(); } else A.toast(h(T('Could not save the settings.')), true);
    });
  };
  A.actions.whtest = function () {
    var url = root.querySelector('[data-k=webhook_url]').value;
    api('webhook_test', {}, { url: url }).then(function (r) {
      var res = r.result;
      d.getElementById('psx-whl').textContent = res ? T('Test sent: answered {c} in {ms} ms', { c: res.code || '–', ms: res.ms }) : T('Add an address that starts with https:// first.');
    });
  };
  A.actions.cleanup = function () { api('cleanup', {}, {}).then(function (r) { A.toast(h(T('{n} expired codes removed.', { n: r.deleted || 0 }))); }); };

  /* ---------- start ---------- */
  d.addEventListener('DOMContentLoaded', function () {});
  setTimeout(function () {
    var m = /[?&]psx_edit=(\d+)/.exec(w.location.search);
    if (m) A.go('editor', +m[1]); else A.go('list');
  }, 0);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})(window, document);
