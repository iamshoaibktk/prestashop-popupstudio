"""Helpers to describe templates compactly. Used by _build/templates.py (dev only, not shipped)."""
import itertools, json, os

_ids = itertools.count(1)
CUR = {'slug': 'x'}


def _id():
    return '%s-%d' % (CUR['slug'][:4], next(_ids))


def L(en):
    """A translatable text. Other languages are added by _build/i18n_templates.py."""
    return {'en': en} if isinstance(en, str) else en


def blk(type_, **kw):
    b = {'id': _id(), 'type': type_}
    for k, v in kw.items():
        if v is None:
            continue
        if k in ('t', 'label', 'ph', 'btn', 'consentText', 'nameLabel', 'copy', 'note', 'prize', 'reveal', 'alt', 'caption',
                 'totalLabel', 't_empty', 't_progress', 't_done', 'doneT', 'nextT', 'todoT', 'submit', 'lo', 'hi', 'view', 'lowStock') and isinstance(v, str):
            v = L(v)
        b[k] = v
    return b


def H(t, cls=None, **kw): return blk('heading', t=t, cls=cls, **kw)
def P(t, cls=None, **kw): return blk('text', t=t, cls=cls, **kw)
def SM(t, cls=None, **kw): return blk('small', t=t, cls=cls, **kw)
def BADGE(t, cls=None, **kw): return blk('badge', t=t, cls=cls, **kw)
def BTN(t, act='close', cls=None, variant=None, full=None, href=None, step=None, **kw): return blk('button', t=t, act=act, cls=cls, variant=variant, full=full, href=href, step=step, **kw)
def LINK(t, act='close', cls=None, step=None, **kw): return blk('link', t=t, act=act, cls=cls, step=step, **kw)
def IMG(placeholder=None, art=None, caption=None, cls=None, alt='', **kw): return blk('image', placeholder=placeholder, art=art, caption=caption, cls=cls, alt=alt, **kw)
def ART(svg, cls=None, **kw): return blk('art', svg=svg, cls=cls, **kw)
def FORM(btn='Subscribe', label='Email', ph='you@example.com', layout='stack', consent=True, consentText=None, name=False, nameLabel=None, nxt='next', cls=None, hideLabel=None, play=None, **kw):
    return blk('form', btn=btn, label=label, ph=ph, layout=layout, consent=consent, consentRequired=True if consent else None, consentText=consentText, name=name or None, nameLabel=nameLabel, next=nxt, cls=cls, hideLabel=hideLabel, play=play, **kw)
def COUPON(note='Valid until {coupon_expiry}. One use.', copy='Copy', cls=None, code='WELCOME-7KQ2M9XA', **kw): return blk('coupon', note=note, copy=copy, cls=cls, code=code, **kw)
def CD(mode='evergreen', minutes=60, end=None, look='boxes', noDays=None, hideAtZero=None, cls=None, **kw): return blk('countdown', mode=mode, minutes=minutes, end=end, look=look, noDays=noDays, hideAtZero=hideAtZero, cls=cls, **kw)
def WHEEL(look='plain', cls=None): return blk('wheel', look=look, cls=cls)
def SCRATCH(prize='{prize}', reveal='Reveal it all', cls=None): return blk('scratch', prize=prize, reveal=reveal, cls=cls)
def PICK(look, items, cls=None, label=None): return blk('pick', look=look, items=items, cls=cls, label=L(label) if label else None)
def PRIZE(t='{prize}', cls=None): return blk('prize', t=t, cls=cls)
def CHIPS(opts, cls=None): return blk('chips', options=[{'key': k, 't': L(t), 'on': on} for k, t, on in opts], cls=cls)
def CHOICES(q, opts, submit=None, letters=None, cls=None): return blk('choices', q=q, options=[{'key': k, 't': L(t), 'step': s} for k, t, s in opts], submit=submit, letters=letters, cls=cls)
def STARS(q='rating', low='low', high='high', cut=3, lo='Not great', hi='Loved it', cls=None): return blk('stars', q=q, low=low, high=high, cut=cut, lo=lo, hi=hi, cls=cls)
def TA(label, ph=None, name='message', cls=None): return blk('textarea', label=L(label), ph=L(ph) if ph else None, name=name, cls=cls)
def LIST(items, cls=None): return blk('list', items=[{'k': L(k), 'v': L(v) if v else None} for k, v in items], cls=cls)
def CART(cls=None, totalLabel='Total'): return blk('cart', max=3, totalLabel=totalLabel, cls=cls)
def METER(t_empty='Free shipping from {free_shipping_threshold}', t_progress='{free_shipping_remaining} to go for free shipping', t_done='Free shipping unlocked', cls=None): return blk('meter', threshold=0, t_empty=t_empty, t_progress=t_progress, t_done=t_done, cls=cls)
def LADDER(tiers, cls=None): return blk('ladder', tiers=tiers, doneT='from {min} · reached', nextT='{left} to go', todoT='from {min}', cls=cls)
def PRODUCT(source='bestseller', btn='Add to cart', view='View', cls=None): return blk('product', source=source, btn=btn, view=view, lowStock='{n} left', cls=cls)
def SOCIAL(links, cls=None, variant=None): return blk('social', links=[{'t': L(t), 'url': u} for t, u in links], cls=cls, variant=variant)
def VIDEO(src='', poster='', cls=None): return blk('video', src=src, poster=poster, cls=cls)
def MARQ(items, sep='✦', cls=None): return blk('marquee', items=[L(i) for i in items], sep=sep, cls=cls)
def SPACER(h=12): return blk('spacer', h=h)
def HR(cls=None): return blk('divider', cls=cls)
def ROW(blocks, cls=None): return blk('row', blocks=blocks, cls=cls)
def HTML(html, cls=None): return blk('html', html=html, cls=cls)


def col(blocks, cls=None, w=None):
    c = {'blocks': blocks}
    if cls: c['cls'] = cls
    if w: c['w'] = w
    return c


def step(sid, name, cols, cls=None):
    s = {'id': sid, 'name': name, 'cols': cols if isinstance(cols, list) and cols and isinstance(cols[0], dict) and 'blocks' in cols[0] and 'type' not in cols[0] else [col(cols)]}
    if cls: s['cls'] = cls
    return s


def decor(html, cls=None, name=None, hideMobile=None, m=None, **pos):
    d = {'html': html}
    if cls: d['cls'] = cls
    if name: d['name'] = name
    if hideMobile: d['hideMobile'] = True
    if m: d['m'] = m
    d.update(pos)
    return d


TRIG = lambda **kw: dict({'mode': 'any', 'timerOn': False, 'timerSec': 8, 'exitOn': False, 'exitSens': 'normal', 'idleOn': False, 'idleSec': 30, 'scrollOn': False, 'scrollVal': 40, 'scrollUnit': 'pct', 'clickOn': False, 'clickSel': '', 'pagesOn': False, 'pagesN': 2, 'pagesSec': 0, 'addcartOn': False}, **kw)
CLOSE = lambda **kw: dict({'x': True, 'xDelay': 0, 'overlay': True, 'esc': True, 'timeOn': False, 'timeSec': 20, 'scrollOn': False, 'scrollPct': 80, 'videoOn': False, 'lastOn': False, 'lastSec': 6}, **kw)
FREQ = lambda **kw: dict({'mode': 'days', 'days': 7, 'maxOn': False, 'max': 3, 'stopConvert': True, 'afterCloseOn': True, 'afterCloseDays': 2}, **kw)
GEN = lambda prefix='WELCOME-', value=10, type_='percent', days=14, minv=0, auto=False: {'mode': 'generated', 'code': '', 'type': type_, 'value': value, 'days': days, 'min': minv, 'prefix': prefix, 'autoApply': auto}
FIXED = lambda code, auto=False: {'mode': 'fixed', 'code': code, 'type': 'percent', 'value': 10, 'days': 14, 'min': 0, 'prefix': '', 'autoApply': auto}
NOCOUPON = {'mode': 'none', 'code': '', 'type': 'percent', 'value': 10, 'days': 14, 'min': 0, 'prefix': 'WELCOME-', 'autoApply': False}


def prize(key, label, weight, type_='percent', value=10, days=14, color=None, ink=None, stock=''):
    p = {'key': key, 'label': L(label), 'weight': weight, 'stock': stock, 'coupon': {'type': type_, 'value': value, 'days': days} if type_ else {'type': ''}}
    if color: p['color'] = color
    if ink: p['ink'] = ink
    return p


def tpl(num, slug, name, group, fmt_label, tags, doc, settings, css):
    return {'num': num, 'slug': slug, 'name': name, 'group': group, 'formatLabel': fmt_label, 'tags': tags, 'doc': doc, 'settings': settings, 'css': css}


def write(all_tpls, out_dir):
    os.makedirs(os.path.join(out_dir, 'css'), exist_ok=True)
    for t in all_tpls:
        css = t.pop('css')
        t['doc']['template'] = t['slug']
        with open(os.path.join(out_dir, 'css', t['slug'] + '.css'), 'w') as f:
            f.write(css.strip() + '\n')
        with open(os.path.join(out_dir, '%s-%s.json' % (t['num'], t['slug'])), 'w') as f:
            json.dump(t, f, ensure_ascii=False, indent=1)
