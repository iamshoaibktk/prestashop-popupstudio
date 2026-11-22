from tpl_common import *

BARFREQ = FREQ(mode='page', stopConvert=False, afterCloseOn=True, afterCloseDays=1)
NOW = TRIG(timerOn=True, timerSec=0)


def bar_doc(theme, fonts, position='top', bar='push', mobile=None):
    d = {'format': 'bar', 'position': position, 'bar': bar, 'mobile': mobile or {'format': 'same'}, 'fonts': fonts, 'theme': theme, 'overlay': False}
    return d


def t32():
    CUR['slug'] = 'quiet-announcement'
    truck = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CC3E6" stroke-width="2" stroke-linecap="round"><path d="M3 7h13v9H3zM16 10h3l2 3v3h-5M7 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01"/></svg>'
    s1 = step('s1', 'Bar', [ROW([HTML(truck, cls='psx-hide-m'), P('Order by 18 December for delivery before Christmas.'), BTN('See delivery dates', act='url', href='/', cls='qa-link')], cls='qa-row')])
    doc = bar_doc({'bg': '#24364B', 'ink': '#FFFFFF', 'accent': '#9CC3E6', 'accentInk': '#24364B', 'radius': 0}, [])
    doc['steps'] = [s1]
    doc['ariaLabel'] = 'Announcement'
    css = r'''
.psx-t-quiet-announcement .psx-box{box-shadow:none}
.psx-t-quiet-announcement .psx-col{padding:0 56px 0 20px;min-height:42px;justify-content:center}
.psx-t-quiet-announcement .qa-row{justify-content:center;gap:10px;flex-wrap:nowrap}
.psx-t-quiet-announcement .psx-p{font-size:13.5px}
.psx-t-quiet-announcement .qa-link{background:none;color:#CFE3F5;min-height:0;padding:0;font-weight:500;font-size:13.5px;text-decoration:underline;text-underline-offset:3px;border-radius:0}
.psx-t-quiet-announcement .psx-x{top:3px;right:6px;width:36px;height:36px;color:#CFE3F5;font-size:20px}
.psx-t-quiet-announcement.psx-mobile .psx-col{padding:12px 50px 12px 16px}
.psx-t-quiet-announcement.psx-mobile .qa-row{flex-wrap:wrap;justify-content:flex-start;gap:2px 8px}
.psx-t-quiet-announcement.psx-mobile .psx-p{font-size:13px;line-height:1.4}
.psx-t-quiet-announcement.psx-mobile .psx-x{top:50%;transform:translateY(-50%);width:44px;height:44px}
'''
    st = {'triggers': NOW, 'close': CLOSE(overlay=False), 'frequency': BARFREQ, 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('32', 'quiet-announcement', 'Quiet Announcement', 'bars', 'Bar, top', ['bar', 'announcement', 'shipping'], doc, st, css)


def t33():
    CUR['slug'] = 'marquee'
    s1 = step('s1', 'Bar', [MARQ(['Free shipping over €60', 'New drop: Field Jacket, olive', '30-day returns', 'Order by 2 pm, ships today'])])
    doc = bar_doc({'bg': '#111111', 'ink': '#F5F5F0', 'accent': '#FF5C39', 'accentInk': '#111111', 'radius': 0, 'fh': 'Unbounded', 'fb': 'Unbounded'}, ['Unbounded'])
    doc['steps'] = [s1]
    css = r'''
.psx-t-marquee .psx-col{padding:0}
.psx-t-marquee .psx-marquee{min-height:44px;font:500 13px var(--psx-fb);padding-right:84px}
.psx-t-marquee .psx-sep{color:var(--psx-accent)}
.psx-t-marquee .psx-pause{background:#111;color:#F5F5F0;box-shadow:-14px 0 14px #111}
.psx-t-marquee .psx-x{top:4px;right:6px;width:36px;height:36px;color:#F5F5F0;background:#111}
.psx-t-marquee.psx-mobile .psx-marquee{font-size:12px;min-height:40px}
'''
    st = {'triggers': NOW, 'close': CLOSE(overlay=False), 'frequency': BARFREQ, 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('33', 'marquee', 'Marquee', 'bars', 'Bar, top, scrolling', ['bar', 'ticker', 'announcement'], doc, st, css)


def t34():
    CUR['slug'] = 'countdown-strip'
    s1 = step('s1', 'Bar', [ROW([P('Winter sale: up to 40% off', cls='cs-t'), CD(mode='date', end='2026-12-31T23:59', look='strip', hideAtZero=True), BTN('Shop now', act='url', href='/', cls='cs-btn')], cls='cs-row')])
    doc = bar_doc({'bg': '#4B1D3F', 'ink': '#FFFFFF', 'accent': '#FFB4A2', 'accentInk': '#4B1D3F', 'radius': 0, 'fh': 'Red Hat Display', 'fb': 'Red Hat Display'}, ['Red Hat Display', 'Red Hat Mono'])
    doc['steps'] = [s1]
    css = r'''
.psx-t-countdown-strip .psx-col{padding:0 56px 0 20px;min-height:60px;justify-content:center}
.psx-t-countdown-strip .cs-row{justify-content:center;gap:22px;flex-wrap:nowrap}
.psx-t-countdown-strip .cs-t{font:900 16px var(--psx-fh)}
.psx-t-countdown-strip .psx-cd{gap:8px}
.psx-t-countdown-strip .psx-cd-u b{min-width:0;width:44px;padding:4px 0;background:var(--psx-accent);color:var(--psx-accentInk);font:700 18px "Red Hat Mono",monospace;border-radius:4px}
.psx-t-countdown-strip .psx-cd-u small{font-size:9.5px;color:#F3D3CB}
.psx-t-countdown-strip .cs-btn{background:#fff;color:#4B1D3F;border-radius:999px;min-height:36px;padding:0 14px;font-weight:700;font-size:13px}
.psx-t-countdown-strip .psx-x{top:12px;right:8px;width:36px;height:36px;color:#F3D3CB}
.psx-t-countdown-strip.psx-mobile .psx-col{padding:12px 44px 10px 12px}
.psx-t-countdown-strip.psx-mobile .cs-row{flex-wrap:wrap;gap:8px;justify-content:center}
.psx-t-countdown-strip.psx-mobile .cs-t{width:100%;text-align:center;font-size:14px}
.psx-t-countdown-strip.psx-mobile .psx-cd-u b{width:36px;font-size:16px}
.psx-t-countdown-strip.psx-mobile .psx-x{top:6px;right:2px}
'''
    st = {'triggers': NOW, 'close': CLOSE(overlay=False), 'frequency': BARFREQ, 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('34', 'countdown-strip', 'Countdown Strip', 'bars', 'Bar, top, countdown', ['bar', 'countdown', 'sale'], doc, st, css)


def t35():
    CUR['slug'] = 'free-shipping-meter'
    s1 = step('s1', 'Bar', [ROW([METER(), BTN('See cart', act='url', href='{cart_url}', cls='fm-link')], cls='fm-row')])
    doc = bar_doc({'bg': '#FFFFFF', 'ink': '#0F2A22', 'accent': '#1E6B52', 'accentInk': '#FFFFFF', 'line': '#DDE3E0', 'radius': 0, 'fh': 'Manrope', 'fb': 'Manrope'}, ['Manrope'], position='bottom')
    doc['steps'] = [s1]
    css = r'''
.psx-t-free-shipping-meter .psx-box{border-top:1px solid #DDE3E0;box-shadow:0 -6px 18px rgba(15,42,34,.06)}
.psx-t-free-shipping-meter .psx-col{padding:14px 64px 16px 22px}
.psx-t-free-shipping-meter .fm-row{flex-wrap:nowrap;gap:22px}
.psx-t-free-shipping-meter .psx-meter{flex:1}
.psx-t-free-shipping-meter .psx-meter-t{font:800 15px var(--psx-fh)}
.psx-t-free-shipping-meter .psx-meter-n{font-weight:600;color:#3B5249}
.psx-t-free-shipping-meter .psx-track{background:#DCEDE5}
.psx-t-free-shipping-meter .psx-van{width:30px;height:30px;margin:-15px 0 0 -15px;background:#1E6B52 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M3 7h11v8H3zM14 10h3.5l2.5 3v2h-6M7 18a1.6 1.6 0 1 0 0-.01M17 18a1.6 1.6 0 1 0 0-.01'/%3E%3C/svg%3E") center no-repeat}
.psx-t-free-shipping-meter .psx-meter-done .psx-meter-t{color:var(--psx-accent)}
.psx-t-free-shipping-meter .psx-meter-done .psx-meter-t::before{content:"✓ "}
.psx-t-free-shipping-meter .fm-link{background:none;color:var(--psx-ink);padding:0;min-height:0;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.psx-t-free-shipping-meter .psx-x{top:50%;transform:translateY(-50%);right:14px;background:#F0F5F2;width:36px;height:36px;font-size:16px}
.psx-t-free-shipping-meter.psx-mobile .psx-col{padding:12px 52px 16px 16px}
.psx-t-free-shipping-meter.psx-mobile .fm-row{flex-direction:column;align-items:stretch;gap:6px}
.psx-t-free-shipping-meter.psx-mobile .fm-link{align-self:flex-end;font-size:12.5px}
'''
    st = {'triggers': NOW, 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='page', stopConvert=False, afterCloseOn=True, afterCloseDays=1), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('35', 'free-shipping-meter', 'Free-shipping Meter', 'bars', 'Bar, bottom, push', ['bar', 'free shipping', 'cart', 'progress'], doc, st, css)


def t36():
    CUR['slug'] = 'coupon-strip'
    scis = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E85D04" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/></svg>'
    s1 = step('s1', 'Bar', [ROW([P('**Take 15% off today**\nOn orders over €40 · expires 23:59 tonight', cls='cp-t'), COUPON(code='SNIP15', note=None, cls='cp-code')], cls='cp-row')])
    doc = bar_doc({'bg': '#FFF1E6', 'ink': '#3A1F0F', 'accent': '#E85D04', 'accentInk': '#FFFFFF', 'line': '#3A1F0F', 'radius': 8, 'fh': 'Chivo', 'fb': 'Chivo'}, ['Chivo', 'Chivo Mono'], position='bottom', bar='overlay')
    doc['steps'] = [s1]
    doc['decor'] = [decor(scis, name='Scissors', left='30px', top='-13px')]
    css = r'''
.psx-t-coupon-strip .psx-box{border-top:2px dashed var(--psx-accent);overflow:visible}
.psx-t-coupon-strip .psx-dec{background:var(--psx-bg);padding:1px}
.psx-t-coupon-strip .psx-col{padding:14px 64px 14px 22px}
.psx-t-coupon-strip .cp-row{flex-wrap:nowrap;gap:18px}
.psx-t-coupon-strip .cp-t{flex:1;font-size:13px;color:#6E4A33;line-height:1.5}
.psx-t-coupon-strip .cp-t strong{display:inline-block;font:900 18px var(--psx-fh);color:var(--psx-ink)}
.psx-t-coupon-strip .psx-coupon{border:2px dashed var(--psx-ink);border-radius:8px;background:#fff;min-height:44px}
.psx-t-coupon-strip .psx-code{font:600 16px "Chivo Mono",monospace;padding:0 14px;display:flex;align-items:center}
.psx-t-coupon-strip .psx-copy{border-left:2px dashed var(--psx-ink);background:var(--psx-accent);color:#fff;font-weight:700}
.psx-t-coupon-strip .psx-x{top:50%;transform:translateY(-50%);right:14px;width:36px;height:36px}
.psx-t-coupon-strip.psx-mobile .psx-col{padding:12px 46px 16px 14px}
.psx-t-coupon-strip.psx-mobile .cp-row{flex-direction:column;align-items:stretch;gap:8px}
.psx-t-coupon-strip.psx-mobile .psx-x{top:8px;transform:none}
'''
    st = {'triggers': TRIG(pagesOn=True, pagesN=2), 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': FIXED('SNIP15')}
    return tpl('36', 'coupon-strip', 'Coupon Strip', 'bars', 'Bar, bottom', ['bar', 'coupon', 'code'], doc, st, css)


def t37():
    CUR['slug'] = 'inline-signup-bar'
    s1 = step('s1', 'Bar', [ROW([P('**Get 10% off your first order** and a monthly letter.', cls='ib-t'), FORM(btn='Sign up', label='Email', hideLabel=True, ph='Email address', layout='inline', consent=False, nxt='s2')], cls='ib-row')])
    s2 = step('s2', 'Done', [ROW([P('**Check your inbox.** Your code: '), COUPON(note=None, cls='ib-code')], cls='ib-row')])
    doc = bar_doc({'bg': '#E8F1EE', 'ink': '#0B3D2E', 'accent': '#0B3D2E', 'accentInk': '#E8F1EE', 'field': '#FFFFFF', 'line': '#9DBFB3', 'radius': 6, 'fh': 'Public Sans', 'fb': 'Public Sans'}, ['Public Sans'])
    doc['steps'] = [s1, s2]
    css = r'''
.psx-t-inline-signup-bar .psx-box{border-bottom:1px solid #C9DDD5}
.psx-t-inline-signup-bar .psx-col{padding:0 56px 0 22px;min-height:58px;justify-content:center}
.psx-t-inline-signup-bar .ib-row{justify-content:center;gap:14px;flex-wrap:nowrap}
.psx-t-inline-signup-bar .psx-p{font-size:13.5px;color:#2F5D4E}
.psx-t-inline-signup-bar .psx-p strong{color:var(--psx-ink);font-weight:800}
.psx-t-inline-signup-bar .psx-form{flex-direction:row}
.psx-t-inline-signup-bar .psx-input{min-height:38px;width:230px;border-radius:6px}
.psx-t-inline-signup-bar .psx-btn{min-height:38px;border-radius:6px;font-weight:600}
.psx-t-inline-signup-bar .psx-msg{position:absolute;bottom:2px;font-size:11px}
.psx-t-inline-signup-bar .psx-coupon{min-height:36px;border-radius:6px}
.psx-t-inline-signup-bar .psx-code{font-size:15px;padding:6px 12px}
.psx-t-inline-signup-bar .psx-x{top:11px;right:8px;width:36px;height:36px}
.psx-t-inline-signup-bar.psx-mobile .psx-col{padding:12px 48px 12px 14px}
.psx-t-inline-signup-bar.psx-mobile .ib-row{flex-direction:column;align-items:stretch;gap:8px}
.psx-t-inline-signup-bar.psx-mobile .psx-input{width:100%}
'''
    st = {'triggers': NOW, 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='page', afterCloseOn=True, afterCloseDays=7), 'form': {'list': 'newsletter', 'consent': False, 'consentRequired': False}, 'coupon': GEN('BAR10-')}
    return tpl('37', 'inline-signup-bar', 'Inline Signup Bar', 'bars', 'Bar, top, with email field', ['bar', 'newsletter', 'signup'], doc, st, css)


TEMPLATES = [t32, t33, t34, t35, t36, t37]
