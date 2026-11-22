/**
 * Popup Studio renderer: turns a popup document into DOM.
 * Shared by the storefront (front.js) and the back-office editor (admin.js), so the preview is the real thing.
 *
 * @author    iamshoaibktk (https://github.com/iamshoaibktk)
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 */
(function (w) {
  'use strict';

  var PSX = w.PSX || {};
  var fontsLoaded = {};
  var cssLoaded = {};

  /* ---------- helpers ---------- */

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'text') n.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(function (s) { if (v[s] !== '' && v[s] != null) n.style.setProperty(s, v[s]); });
        else n.setAttribute(k, v === true ? '' : String(v));
      });
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Pick the visitor's language from a {"en": "..", "fr": ".."} map; plain strings pass through. */
  function tr(v, lang) {
    if (v == null) return '';
    if (typeof v !== 'object') return String(v);
    return v[lang] || v.en || v[Object.keys(v)[0]] || '';
  }

  function money(n, data) {
    var cur = (data && data.currency) || {};
    try {
      return new Intl.NumberFormat((data && data.locale) || undefined, { style: 'currency', currency: cur.iso || 'EUR' }).format(n);
    } catch (e) {
      return (cur.sign || '') + Number(n).toFixed(2);
    }
  }

  /** Dynamic tags and light formatting: **bold**, *italic*, [text](url), new lines. */
  function fmt(text, o) {
    var d = o.data || {};
    var remaining = Math.max(0, (d.free_threshold || 0) - (d.cart_total || 0));
    var tags = {
      firstname: d.firstname || '',
      shop_name: d.shop || '',
      cart_total: money(d.cart_total || 0, d),
      cart_items: String(d.cart_items || 0),
      free_shipping_remaining: money(remaining, d),
      free_shipping_threshold: money(d.free_threshold || 0, d),
      coupon: o.coupon || '{coupon}',
      coupon_expiry: o.expires || '{coupon_expiry}',
      last_category: d.last_category || '',
      email: o.email || '{email}'
    };
    var s = esc(text);
    s = s.replace(/\{(\w+)\|([^}]*)\}/g, function (m, k, fb) { return Object.prototype.hasOwnProperty.call(tags, k) && tags[k] && tags[k].charAt(0) !== '{' ? esc(tags[k]) : fb; });
    s = s.replace(/\{(\w+)\}/g, function (m, k) { return Object.prototype.hasOwnProperty.call(tags, k) ? esc(tags[k]) : m; });
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
    // A short list of inline tags is allowed back (templates use them for accents); attributes other than class are not.
    s = s.replace(/&lt;(\/?)(i|b|em|strong|small|br|span|u|s)((?: class=&quot;[\w -]+&quot;)?)\s*\/?&gt;/g, function (m, sl, tag, cls) {
      return '<' + sl + tag + cls.replace(/&quot;/g, '"') + '>';
    });
    return s.replace(/\n/g, '<br>');
  }

  function uid(p) { return (p || 'psx') + '-' + Math.random().toString(36).slice(2, 9); }

  /* ---------- fonts and template css ---------- */

  PSX.fontBase = PSX.fontBase || '';
  PSX.fontFiles = PSX.fontFiles || null;

  /**
   * fonts: ["Playfair Display", "Libre Franklin", ...]. Faces come from the bundled fonts.json
   * ({family: [{f: file, w: weight, s: style, r: unicode-range}]}); the browser only downloads the faces it uses.
   */
  PSX.loadFonts = function (fonts, doc2) {
    var D = doc2 || document;
    if (!fonts || !fonts.length || !PSX.fontFiles) return;
    var css = '';
    fonts.forEach(function (spec) {
      var fam = String(spec).split(':')[0];
      var key = fam + (doc2 ? '@frame' : '');
      var faces = PSX.fontFiles[fam];
      if (!faces || (fontsLoaded[key] && !doc2) || (doc2 && D.__psxFonts && D.__psxFonts[fam])) return;
      fontsLoaded[key] = 1;
      if (doc2) { D.__psxFonts = D.__psxFonts || {}; D.__psxFonts[fam] = 1; }
      faces.forEach(function (fc) {
        css += '@font-face{font-family:"' + fam + '";src:url("' + PSX.fontBase + fc.f + '") format("woff2");font-weight:' + fc.w + ';font-style:' + fc.s + ';font-display:swap;unicode-range:' + fc.r + '}';
      });
    });
    if (css) D.head.appendChild(el('style', { 'data-psx-fonts': '1', text: css }));
  };

  PSX.loadCss = function (key, css) {
    if (!css || cssLoaded[key]) return;
    cssLoaded[key] = 1;
    document.head.appendChild(el('style', { 'data-psx-css': key, text: css }));
  };

  /* ---------- blocks ---------- */

  var B = {};

  function blockStyle(b) {
    var s = b.style || {};
    return {
      'text-align': s.align || '',
      color: s.color || '',
      'font-size': s.size ? s.size + 'px' : '',
      'font-weight': s.weight || '',
      'margin-top': s.mt != null && s.mt !== '' ? s.mt + 'px' : '',
      'margin-bottom': s.mb != null && s.mb !== '' ? s.mb + 'px' : '',
      'max-width': s.maxw ? s.maxw + 'px' : ''
    };
  }

  B.heading = function (b, o) {
    var lvl = Math.min(4, Math.max(2, b.level || 2));
    var n = el('h' + lvl, { class: 'psx-h', html: fmt(tr(b.t, o.lang), o) });
    if (!o.titled) { n.id = o.titleId; o.titled = true; }
    return n;
  };
  B.text = function (b, o) { return el('p', { class: 'psx-p', html: fmt(tr(b.t, o.lang), o) }); };
  B.badge = function (b, o) { return el('span', { class: 'psx-badge', html: fmt(tr(b.t, o.lang), o) }); };
  B.small = function (b, o) { return el('p', { class: 'psx-small', html: fmt(tr(b.t, o.lang), o) }); };

  B.image = function (b, o) {
    var wrap = el('div', { class: 'psx-img' + (b.placeholder ? ' psx-img-' + b.placeholder : '') });
    if (b.src) {
      wrap.appendChild(el('img', { src: b.src, alt: tr(b.alt, o.lang), loading: 'lazy', decoding: 'async' }));
    } else if (b.art) {
      wrap.innerHTML = b.art;
      wrap.setAttribute('aria-hidden', 'true');
    } else {
      wrap.setAttribute('aria-hidden', 'true');
    }
    if (b.caption) wrap.appendChild(el('span', { class: 'psx-caption', html: fmt(tr(b.caption, o.lang), o) }));
    return wrap;
  };

  B.art = function (b) { return el('div', { class: 'psx-art', 'aria-hidden': 'true', html: b.svg || '' }); };

  B.button = function (b, o) {
    var label = fmt(tr(b.t, o.lang), o);
    var cls = 'psx-btn psx-btn-' + (b.variant || 'primary') + (b.full ? ' psx-full' : '');
    if (b.act === 'url' && b.href) {
      var d0 = o.data || {};
      var href = String(b.href).replace('{last_category_url}', d0.last_category_url || '/').replace('{cart_url}', d0.cart_url || '/').replace('{checkout_url}', d0.checkout_url || '/');
      return el('a', { class: cls, href: href, 'data-act': 'url', html: label });
    }
    return el('button', { type: 'button', class: cls, 'data-act': b.act || 'close', 'data-step': b.step || null, html: label });
  };
  B.link = function (b, o) {
    return el('button', { type: 'button', class: 'psx-link', 'data-act': b.act || 'close', 'data-step': b.step || null, html: fmt(tr(b.t, o.lang), o) });
  };
  B.buttons = function (b, o) {
    return el('div', { class: 'psx-btns' }, (b.items || []).map(function (i) { return B[i.type === 'link' ? 'link' : 'button'](i, o); }));
  };

  B.form = function (b, o) {
    var id = uid('f');
    var f = el('form', { class: 'psx-form psx-form-' + (b.layout || 'stack'), novalidate: true, 'data-next': b.next || '', 'data-play': b.play ? '1' : null });
    var fields = el('div', { class: 'psx-fields' });
    if (b.name) {
      fields.appendChild(el('label', { class: 'psx-label', for: id + 'n', text: tr(b.nameLabel, o.lang) || 'First name' }));
      fields.appendChild(el('input', { id: id + 'n', class: 'psx-input', name: 'firstname', type: 'text', autocomplete: 'given-name', placeholder: tr(b.namePh, o.lang) || null }));
    }
    var emailLabel = tr(b.label, o.lang) || 'Email';
    fields.appendChild(el('label', { class: 'psx-label' + (b.hideLabel ? ' psx-sr' : ''), for: id + 'e', text: emailLabel }));
    var row = el('div', { class: 'psx-row' });
    row.appendChild(el('input', { id: id + 'e', class: 'psx-input', name: 'email', type: 'email', required: true, autocomplete: 'email', inputmode: 'email', placeholder: tr(b.ph, o.lang) || 'you@example.com', 'aria-describedby': id + 'm' }));
    if (b.layout === 'inline') row.appendChild(el('button', { type: 'submit', class: 'psx-btn psx-btn-primary', html: fmt(tr(b.btn, o.lang) || 'Subscribe', o) }));
    fields.appendChild(row);
    if (b.phone) {
      fields.appendChild(el('label', { class: 'psx-label', for: id + 'p', text: tr(b.phoneLabel, o.lang) || 'Phone' }));
      fields.appendChild(el('input', { id: id + 'p', class: 'psx-input', name: 'phone', type: 'tel', autocomplete: 'tel' }));
    }
    f.appendChild(fields);
    if (b.layout !== 'inline') f.appendChild(el('button', { type: 'submit', class: 'psx-btn psx-btn-primary psx-full', html: fmt(tr(b.btn, o.lang) || 'Subscribe', o) }));
    f.appendChild(el('p', { id: id + 'm', class: 'psx-msg', 'aria-live': 'polite' }));
    if (b.consent) {
      var ct = tr(b.consentText, o.lang) || (o.consentText || 'I agree to receive emails. I can unsubscribe at any time.');
      f.appendChild(el('label', { class: 'psx-check' }, [
        el('input', { type: 'checkbox', name: 'consent', value: '1', required: b.consentRequired ? true : null }),
        el('span', { class: 'psx-box-ck', 'aria-hidden': 'true' }),
        el('span', { class: 'psx-ck-t', html: fmt(ct, o) })
      ]));
    }
    return f;
  };

  B.chips = function (b, o) {
    var g = el('div', { class: 'psx-chips', role: 'group', 'aria-label': tr(b.label, o.lang) || null });
    (b.options || []).forEach(function (opt, i) {
      g.appendChild(el('button', { type: 'button', class: 'psx-chip', 'aria-pressed': opt.on ? 'true' : 'false', 'data-chip': opt.key || String(i), html: fmt(tr(opt.t, o.lang), o) }));
    });
    return g;
  };

  PSX.codeLen = function (c) { c = String(c || ''); return c.length > 14 ? 'xl' : (c.length > 10 ? 'l' : 's'); };

  B.coupon = function (b, o) {
    var code = o.coupon || b.code || 'CODE';
    var n = el('div', { class: 'psx-coupon' }, [
      el('span', { class: 'psx-code', 'data-psx-code': '1', 'data-len': PSX.codeLen(code), text: code }),
      el('button', { type: 'button', class: 'psx-copy', 'data-act': 'copy', 'aria-live': 'polite', text: tr(b.copy, o.lang) || (o.i18n && o.i18n.copy) || 'Copy' })
    ]);
    var wrap = el('div', { class: 'psx-coupon-wrap' }, [n]);
    if (b.note) wrap.appendChild(el('p', { class: 'psx-small psx-expiry', html: fmt(tr(b.note, o.lang), o) }));
    return wrap;
  };

  B.countdown = function (b, o) {
    var labels = (o.i18n) || {};
    var n = el('div', { class: 'psx-cd psx-cd-' + (b.look || 'boxes'), role: 'timer', 'data-mode': b.mode || 'date', 'data-end': b.end || '', 'data-minutes': b.minutes || 60, 'data-hide': b.hideAtZero ? '1' : null });
    // Starting value, so previews and the first paint show real numbers before the ticker runs.
    var left = (b.mode === 'evergreen') ? (b.minutes || 60) * 60000 : Math.max(0, (Date.parse(b.end || '') || (Date.now() + 3600000)) - Date.now());
    var sec = Math.floor(left / 1000);
    var parts = { d: Math.floor(sec / 86400), h: Math.floor(sec % 86400 / 3600), m: Math.floor(sec % 3600 / 60), s: sec % 60 };
    if (b.noDays) parts.h += parts.d * 24;
    [['d', b.lD || labels.days || 'days'], ['h', b.lH || labels.hours || 'hours'], ['m', b.lM || labels.minutes || 'min'], ['s', b.lS || labels.seconds || 'sec']].forEach(function (u) {
      if (u[0] === 'd' && b.noDays) return;
      n.appendChild(el('span', { class: 'psx-cd-u' }, [el('b', { 'data-u': u[0], text: (parts[u[0]] < 10 ? '0' : '') + parts[u[0]] }), el('small', { text: tr(u[1], o.lang) })]));
    });
    return n;
  };

  function wheelSvg(prizes, o, look) {
    var n = prizes.length || 8;
    var R = 148;
    var step = 2 * Math.PI / n;
    var p = function (r, a) { return (r * Math.cos(a)).toFixed(2) + ' ' + (r * Math.sin(a)).toFixed(2); };
    var segs = '';
    for (var i = 0; i < n; i++) {
      var pr = prizes[i] || {};
      var a0 = -Math.PI / 2 - step / 2 + i * step;
      var a1 = a0 + step;
      var m = (a0 + a1) / 2;
      var fill = pr.color || ['var(--psx-w1)', 'var(--psx-w2)', 'var(--psx-w3)', 'var(--psx-w4)'][i % 4];
      var ink = pr.ink || ['var(--psx-wi1)', 'var(--psx-wi2)', 'var(--psx-wi3)', 'var(--psx-wi4)'][i % 4];
      segs += '<path class="psx-seg" d="M0 0 L' + p(R, a0) + ' A' + R + ' ' + R + ' 0 0 1 ' + p(R, a1) + ' Z" fill="' + fill + '"></path>';
      // Longer labels (other languages) shrink to fit the width of their slice.
      var lbl = tr(pr.label, o.lang);
      var maxC = Math.max(4, 2 * R * 0.66 * Math.sin(step / 2) / 9.5);
      var sc = lbl.length > maxC ? (maxC / lbl.length).toFixed(3) : 0;
      segs += '<text transform="translate(' + p(R * 0.66, m) + ') rotate(' + (m * 180 / Math.PI + 90).toFixed(1) + ')' + (sc ? ' scale(' + sc + ')' : '') + '" text-anchor="middle" dominant-baseline="middle" fill="' + ink + '">' + esc(lbl) + '</text>';
    }
    var bulbs = '';
    if (look === 'bulbs') {
      for (var j = 0; j < 16; j++) {
        var a = j / 16 * 2 * Math.PI;
        bulbs += '<circle class="psx-bulb" cx="' + (154 * Math.cos(a)).toFixed(1) + '" cy="' + (154 * Math.sin(a)).toFixed(1) + '" r="5"></circle>';
      }
    }
    var ticks = '';
    if (look === 'ticks') {
      for (var k = 0; k < 64; k++) {
        var b2 = k / 64 * 2 * Math.PI;
        var big = k % 8 === 0;
        ticks += '<line class="psx-tick" x1="' + (156 * Math.cos(b2)).toFixed(1) + '" y1="' + (156 * Math.sin(b2)).toFixed(1) + '" x2="' + ((big ? 150 : 153) * Math.cos(b2)).toFixed(1) + '" y2="' + ((big ? 150 : 153) * Math.sin(b2)).toFixed(1) + '"></line>';
      }
    }
    return '<svg class="psx-wheel-svg" viewBox="-170 -178 340 348" role="img" aria-label="' + esc(o.wheelLabel || 'Prize wheel') + '">' +
      '<circle class="psx-rim" r="162"></circle>' + ticks + '<g class="psx-spin">' + segs + '</g>' + bulbs +
      '<circle class="psx-hub" r="26"></circle><circle class="psx-hub2" r="8"></circle>' +
      '<path class="psx-pointer" d="M0 -138 L-13 -174 L13 -174 Z"></path></svg>';
  }

  B.wheel = function (b, o) {
    var prizes = (o.game && o.game.prizes) || b.prizes || [];
    return el('div', { class: 'psx-wheel psx-wheel-' + (b.look || 'plain'), html: wheelSvg(prizes, o, b.look) });
  };

  B.scratch = function (b, o) {
    var n = el('div', { class: 'psx-scratch', 'data-scratch': '1' }, [
      el('div', { class: 'psx-prize', html: fmt(tr(b.prize, o.lang) || '{prize}', o) }),
      el('canvas', { class: 'psx-foil', 'aria-hidden': 'true' })
    ]);
    n.appendChild(el('button', { type: 'button', class: 'psx-btn psx-btn-secondary psx-full psx-reveal', 'data-act': 'reveal', html: fmt(tr(b.reveal, o.lang) || 'Reveal it all', o) }));
    return n;
  };

  B.pick = function (b, o) {
    var g = el('div', { class: 'psx-pick psx-pick-' + (b.look || 'gift'), role: 'group', 'aria-label': tr(b.label, o.lang) || null });
    (b.items || []).forEach(function (it, i) {
      g.appendChild(el('button', { type: 'button', class: 'psx-pick-i', 'data-act': 'pick', 'data-i': String(i), 'aria-label': tr(it.aria, o.lang) || null }, [
        el('span', { class: 'psx-pick-art', 'aria-hidden': 'true', html: it.svg || '' }),
        it.t ? el('span', { class: 'psx-pick-t', html: fmt(tr(it.t, o.lang), o) }) : null
      ]));
    });
    return g;
  };

  B.prize = function (b, o) {
    return el('div', { class: 'psx-prize-out', 'data-psx-prize': '1', html: fmt(tr(b.t, o.lang) || '{prize}', o) });
  };

  B.video = function (b, o) {
    var n = el('div', { class: 'psx-video', 'data-src': b.src || '', 'data-poster': b.poster || '' });
    n.appendChild(el('button', { type: 'button', class: 'psx-play', 'data-act': 'video', 'aria-label': tr(b.playLabel, o.lang) || (o.i18n && o.i18n.play) || 'Play' }, [
      el('span', { html: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"></path></svg>' })
    ]));
    if (b.poster) n.style.backgroundImage = 'url("' + b.poster + '")';
    return n;
  };

  B.spacer = function (b) { return el('div', { class: 'psx-spacer', style: { height: (b.h || 12) + 'px' }, 'aria-hidden': 'true' }); };
  B.divider = function () { return el('hr', { class: 'psx-hr' }); };

  B.social = function (b, o) {
    return el('div', { class: 'psx-social' }, (b.links || []).map(function (l) {
      return el('a', { class: 'psx-btn psx-btn-' + (b.variant || 'primary'), href: l.url || '#', target: '_blank', rel: 'noopener', html: fmt(tr(l.t, o.lang) || l.net || 'Follow', o) });
    }));
  };

  B.product = function (b, o) {
    var key = (b.source || 'fixed') + ':' + (b.id_product || 0);
    var p = (o.data && o.data.products && o.data.products[key]) || o.sampleProduct || null;
    if (!p) return el('div', { class: 'psx-product psx-empty', 'aria-hidden': 'true' });
    return el('div', { class: 'psx-product' }, [
      el('a', { class: 'psx-product-img', href: p.url || '#', tabindex: '-1', 'aria-hidden': 'true' }, [p.img ? el('img', { src: p.img, alt: '', loading: 'lazy' }) : el('span')]),
      el('div', { class: 'psx-product-b' }, [
        el('p', { class: 'psx-product-n', text: p.name }),
        el('p', { class: 'psx-product-pr', text: p.price }),
        p.qty > 0 && p.qty < 10 ? el('p', { class: 'psx-small', text: tr(b.lowStock, o.lang).replace('{n}', p.qty) || '' }) : null,
        el('div', { class: 'psx-btns' }, [
          el('button', { type: 'button', class: 'psx-btn psx-btn-primary', 'data-act': 'addcart', 'data-id': String(p.id), html: fmt(tr(b.btn, o.lang) || 'Add to cart', o) }),
          b.view ? el('a', { class: 'psx-btn psx-btn-secondary', href: p.url, html: fmt(tr(b.view, o.lang), o) }) : null
        ])
      ])
    ]);
  };

  B.cart = function (b, o) {
    var c = (o.data && o.data.cart) || { lines: [], total_fmt: '' };
    var n = el('div', { class: 'psx-cart', 'data-psx-cart': '1' });
    c.lines.slice(0, b.max || 3).forEach(function (l) {
      n.appendChild(el('div', { class: 'psx-cart-l' }, [
        el('span', { class: 'psx-cart-img', 'aria-hidden': 'true' }, [l.img ? el('img', { src: l.img, alt: '', loading: 'lazy' }) : null]),
        el('span', { class: 'psx-cart-n' }, [el('b', { text: l.name }), el('small', { text: (l.attrs ? l.attrs + ' · ' : '') + '× ' + l.qty })]),
        el('span', { class: 'psx-cart-t', text: l.total })
      ]));
    });
    n.appendChild(el('div', { class: 'psx-cart-total' }, [el('span', { text: tr(b.totalLabel, o.lang) || 'Total' }), el('b', { text: c.total_fmt })]));
    return n;
  };

  B.meter = function (b, o) {
    var d = o.data || {};
    var th = b.threshold > 0 ? b.threshold : (d.free_threshold || 0);
    var total = (d.cart && d.cart.total) || d.cart_total || 0;
    var pct = th > 0 ? Math.min(100, Math.round(total / th * 100)) : 0;
    var state = total <= 0 ? 'empty' : (total >= th ? 'done' : 'progress');
    var oo = Object.assign({}, o, { data: Object.assign({}, d, { cart_total: total, free_threshold: th }) });
    var text = tr(b['t_' + state], o.lang) || '';
    return el('div', { class: 'psx-meter psx-meter-' + state, 'data-psx-meter': '1', 'data-th': th }, [
      el('div', { class: 'psx-meter-row' }, [
        el('span', { class: 'psx-meter-t', html: fmt(text, oo) }),
        el('span', { class: 'psx-meter-n', text: money(total, d) + ' / ' + money(th, d) })
      ]),
      el('div', { class: 'psx-track', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(th), 'aria-valuenow': String(total) }, [
        el('div', { class: 'psx-fill', style: { width: pct + '%' } }),
        el('span', { class: 'psx-van', style: { left: pct + '%' }, 'aria-hidden': 'true' })
      ])
    ]);
  };

  B.ladder = function (b, o) {
    var d = o.data || {};
    var total = (d.cart && d.cart.total) || d.cart_total || 0;
    var tiers = b.tiers || [];
    var next = null;
    var g = el('div', { class: 'psx-ladder', role: 'list' });
    tiers.forEach(function (t, i) {
      var st = total >= t.min ? 'done' : (next === null ? (next = i, 'next') : 'todo');
      g.appendChild(el('div', { class: 'psx-step-t psx-' + st, role: 'listitem', style: { '--i': i } }, [
        el('b', { text: t.pct + '%' }),
        el('small', { html: fmt(tr(st === 'done' ? b.doneT : (st === 'next' ? b.nextT : b.todoT), o.lang).replace('{min}', money(t.min, d)).replace('{left}', money(Math.max(0, t.min - total), d)), o) })
      ]));
    });
    return g;
  };

  B.list = function (b, o) {
    return el('ul', { class: 'psx-list' }, (b.items || []).map(function (i) {
      return el('li', {}, [el('span', { html: fmt(tr(i.k, o.lang), o) }), i.v ? el('b', { html: fmt(tr(i.v, o.lang), o) }) : null]);
    }));
  };

  B.choices = function (b, o) {
    var g = el('div', { class: 'psx-choices', role: 'group', 'data-q': b.q || 'q' });
    (b.options || []).forEach(function (opt, i) {
      g.appendChild(el('button', { type: 'button', class: 'psx-choice', 'aria-pressed': 'false', 'data-act': 'choice', 'data-key': opt.key || String(i), 'data-step': opt.step || '' }, [
        b.letters ? el('span', { class: 'psx-k', text: String.fromCharCode(65 + i) }) : null,
        el('span', { html: fmt(tr(opt.t, o.lang), o) })
      ]));
    });
    if (b.submit) g.appendChild(el('button', { type: 'button', class: 'psx-btn psx-btn-primary', 'data-act': 'answer', html: fmt(tr(b.submit, o.lang), o) }));
    return g;
  };

  B.stars = function (b, o) {
    var g = el('div', { class: 'psx-stars', role: 'radiogroup', 'aria-label': tr(b.label, o.lang) || 'Rating', 'data-q': b.q || 'rating', 'data-low': b.low || '', 'data-high': b.high || '', 'data-cut': b.cut || 3 });
    for (var i = 1; i <= 5; i++) {
      g.appendChild(el('button', { type: 'button', class: 'psx-star', role: 'radio', 'aria-checked': 'false', 'data-act': 'star', 'data-n': String(i), 'aria-label': i + ' / 5',
        html: '<svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"></path></svg>' }));
    }
    var wrap = el('div', { class: 'psx-stars-w' }, [g]);
    if (b.lo || b.hi) wrap.appendChild(el('div', { class: 'psx-stars-l' }, [el('span', { text: tr(b.lo, o.lang) }), el('span', { text: tr(b.hi, o.lang) })]));
    return wrap;
  };

  B.textarea = function (b, o) {
    var id = uid('ta');
    return el('div', { class: 'psx-ta' }, [
      el('label', { class: 'psx-label' + (b.hideLabel ? ' psx-sr' : ''), for: id, text: tr(b.label, o.lang) || 'Message' }),
      el('textarea', { id: id, class: 'psx-input', name: b.name || 'message', rows: b.rows || 3, placeholder: tr(b.ph, o.lang) || null })
    ]);
  };

  B.marquee = function (b, o) {
    var items = (b.items || []).map(function (t) { return fmt(tr(t, o.lang), o); });
    var sep = '<span class="psx-sep" aria-hidden="true">' + esc(b.sep || '✦') + '</span>';
    var one = items.map(function (t) { return '<span>' + t + '</span>' + sep; }).join('');
    var n = el('div', { class: 'psx-marquee' }, [
      el('div', { class: 'psx-track-m', html: one + '<span aria-hidden="true" class="psx-dup">' + one + '</span>' })
    ]);
    n.appendChild(el('button', { type: 'button', class: 'psx-pause', 'data-act': 'pause', 'aria-label': (o.i18n && o.i18n.pause) || 'Pause', text: 'II' }));
    return n;
  };

  B.row = function (b, o) {
    return el('div', { class: 'psx-rowb' + (b.cls ? ' ' + b.cls : '') }, (b.blocks || []).map(function (c) { return renderBlock(c, o); }));
  };

  B.html = function (b, o) {
    var d1 = o.data || {};
    var html = tr(b.html, o.lang).replace(/\{coupon(?:\|([^}]*))?\}/g, function (m, fb) { return esc(o.coupon || fb || ''); }).replace(/\{shop_name\}/g, esc(d1.shop || ''));
    return el('div', { class: 'psx-html', html: html });
  };

  function renderBlock(b, o) {
    var fn = B[b.type];
    if (!fn) return null;
    var n = fn(b, o);
    if (!n) return null;
    n.classList.add('psx-b', 'psx-b-' + b.type);
    if (b.cls) b.cls.split(/\s+/).forEach(function (c) { if (c) n.classList.add(c); });
    if (b.m && b.m.hide) n.classList.add('psx-hide-m');
    if (b.d && b.d.hide) n.classList.add('psx-hide-d');
    if (b.id) n.setAttribute('data-bid', b.id);
    var st = blockStyle(b);
    Object.keys(st).forEach(function (k) { if (st[k]) n.style.setProperty(k, st[k]); });
    if (o.mobile && b.m && b.m.size) n.style.setProperty('font-size', b.m.size + 'px');
    return n;
  }

  /* ---------- popup ---------- */

  var THEME_VARS = ['bg', 'ink', 'accent', 'accentInk', 'muted', 'line', 'field', 'fieldInk', 'error', 'ok', 'overlay', 'radius', 'fh', 'fb', 'w1', 'w2', 'w3', 'w4', 'wi1', 'wi2', 'wi3', 'wi4'];

  /**
   * @param doc  popup document
   * @param opts {id, lang, data, i18n, mobile, editor, coupon, game, consentText}
   */
  PSX.render = function (doc, opts) {
    opts = opts || {};
    var o = Object.assign({ lang: 'en', data: {}, i18n: {}, titled: false }, opts);
    o.titleId = uid('psx-t');
    var mobile = !!opts.mobile;
    var mob = doc.mobile || {};
    var format = mobile && mob.format && mob.format !== 'same' ? mob.format : (doc.format || 'modal');
    var pos = mobile && mob.position ? mob.position : (doc.position || 'center');
    var tpl = doc.template || 'blank';

    var fl = (doc.fonts || []).slice();
    var thf = doc.theme || {};
    if (thf.fh && fl.indexOf(thf.fh) === -1) fl.push(thf.fh);
    if (thf.fb && fl.indexOf(thf.fb) === -1) fl.push(thf.fb);
    PSX.loadFonts(fl);
    if (doc.css) PSX.loadCss('t-' + tpl + '-' + (doc.cssv || 1), doc.css);
    if (doc.customCss && opts.id) PSX.loadCss('p-' + opts.id, doc.customCss.replace(/&/g, '[data-psx="' + opts.id + '"]'));

    var vars = {};
    var th = doc.theme || {};
    THEME_VARS.forEach(function (k) {
      if (th[k] == null || th[k] === '') return;
      var v = th[k];
      if (k === 'radius') v = parseInt(v, 10) + 'px';
      if (k === 'fh' || k === 'fb') v = '"' + v + '", ' + ((th.ffb && th.ffb[v]) || th[k + 'Fallback'] || 'system-ui, sans-serif');
      vars['--psx-' + k] = v;
    });
    var width = mobile ? (mob.width || '') : (doc.width ? doc.width + 'px' : '');
    if (width) vars['--psx-w'] = /px|%|vw/.test(width) ? width : width + 'px';

    var modalish = ['modal', 'fullscreen', 'drawer', 'sheet'].indexOf(format) !== -1;
    var root = el('div', {
      lang: opts.lang || null, class: 'psx psx-f-' + format + ' psx-pos-' + pos + ' psx-t-' + tpl + (mobile ? ' psx-mobile' : ' psx-desktop') + (opts.editor ? ' psx-editor' : '') + (doc.bar ? ' psx-bar-' + doc.bar : ''),
      'data-psx': opts.id || '',
      style: vars
    });
    if (modalish && doc.overlay !== false) root.appendChild(el('div', { class: 'psx-ov', 'data-act': (doc.overlayClose === false ? null : 'overlay') }));

    var box = el('div', {
      class: 'psx-box',
      role: modalish ? 'dialog' : (format === 'bar' ? 'region' : 'dialog'),
      'aria-modal': modalish ? 'true' : null,
      'aria-labelledby': o.titleId,
      'aria-label': format === 'bar' ? (doc.ariaLabel || 'Announcement') : null,
      tabindex: '-1'
    });
    if (doc.decor && doc.decor.length) {
      var dec = el('div', { class: 'psx-decor', 'aria-hidden': 'true' });
      doc.decor.forEach(function (d) {
        if (mobile && d.hideMobile) return;
        if (!mobile && d.hideDesktop) return;
        var pos2 = (mobile && d.m) || d;
        var item = el('div', { class: 'psx-dec' + (d.cls ? ' ' + d.cls : ''), html: d.html ? tr(d.html, o.lang).replace(/\{(\w+)\}/g, function (m, k) { return k === 'coupon' ? esc(o.coupon || '') : m; }) : (d.t ? fmt(tr(d.t, o.lang), o) : '') });
        ['left', 'right', 'top', 'bottom', 'width', 'height'].forEach(function (k) { if (pos2[k] != null && pos2[k] !== '') item.style.setProperty(k, typeof pos2[k] === 'number' ? pos2[k] + 'px' : pos2[k]); });
        if (pos2.rot) item.style.transform = 'rotate(' + pos2.rot + 'deg)';
        dec.appendChild(item);
      });
      box.appendChild(dec);
    }

    (doc.steps || []).forEach(function (s, si) {
      var step = el('div', { class: 'psx-step' + (s.cls ? ' ' + s.cls : ''), 'data-step': s.id || ('s' + si), hidden: si === 0 ? null : true });
      var cols = s.cols && s.cols.length ? s.cols : [{ blocks: s.blocks || [] }];
      var wrap = el('div', { class: 'psx-cols' + (cols.length > 1 ? ' psx-multi' : '') });
      cols.forEach(function (c) {
        var col = el('div', { class: 'psx-col' + (c.cls ? ' ' + c.cls : '') });
        if (c.w && !mobile) col.style.flex = c.w;
        (c.blocks || []).forEach(function (b) { var n = renderBlock(b, o); if (n) col.appendChild(n); });
        wrap.appendChild(col);
      });
      step.appendChild(wrap);
      box.appendChild(step);
    });

    var cb = doc.closeBtn || {};
    if (cb.show !== false && format !== 'inline') {
      box.appendChild(el('button', {
        type: 'button', class: 'psx-x psx-x-' + (cb.look || 'x'), 'data-act': 'close',
        'aria-label': (o.i18n && o.i18n.close) || 'Close', html: cb.label ? esc(tr(cb.label, o.lang)) : '<span aria-hidden="true">×</span>'
      }));
    }
    root.appendChild(box);
    return root;
  };

  /** Render one step on its own (used by the editor for thumbnails). */
  PSX.wheelSvg = wheelSvg;
  PSX.fmt = fmt;
  PSX.tr = tr;
  PSX.esc = esc;
  PSX.el = el;
  PSX.blocks = B;
  PSX.renderBlock = renderBlock;
  PSX.money = money;

  w.PSX = PSX;
})(window);
