from tpl_common import *

STAR = '<svg viewBox="0 0 26 26" width="26" height="26"><path d="M13 1l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#C9A86A"/></svg>'


def t43():
    CUR['slug'] = 'cellar-door'
    glass = '<svg width="44" height="54" viewBox="0 0 44 54"><path d="M12 2h20c0 14 4 18 4 26a14 14 0 0 1-28 0c0-8 4-12 4-26z" fill="none" stroke="#C9A86A" stroke-width="1.6"/><path d="M22 42v8M14 52h16" stroke="#C9A86A" stroke-width="1.6" stroke-linecap="round"/><path d="M10 24c8 3 16 3 24 0" fill="none" stroke="#C9A86A" stroke-width="1.2"/></svg>'
    s1 = step('s1', 'Gate', [HTML('<div class="cd-frame">' + ''.join('<i class="cd-o cd-o%d">%s</i>' % (i, STAR) for i in range(4)) + '</div>'), HTML(glass, cls='cd-glass'), H('Are you of legal drinking age?'),
                             P('This shop sells wine and spirits. You must be 18 or older to enter.'), ROW([BTN('Yes, I am 18 or over', act='close', cls='cd-yes'), BTN('No, take me back', act='url', href='https://www.google.com', variant='secondary')], cls='cd-btns'),
                             SM('Please enjoy responsibly.', cls='cd-n')])
    doc = {'format': 'fullscreen', 'mobile': {'format': 'same'}, 'fonts': ['Cormorant Garamond', 'Jost'],
           'theme': {'bg': '#2B1B1F', 'ink': '#F3E9DC', 'accent': '#C9A86A', 'accentInk': '#2B1B1F', 'line': '#C9A86A', 'radius': 0, 'fh': 'Cormorant Garamond', 'fb': 'Jost'},
           'closeBtn': {'show': False}, 'overlayClose': False, 'steps': [s1]}
    css = r'''
.psx-t-cellar-door .psx-box{background-image:radial-gradient(ellipse at 50% 30%,#3D252B 0,#2B1B1F 70%);display:flex;align-items:center;justify-content:center}
.psx-t-cellar-door .psx-step{position:relative;width:520px;max-width:calc(100% - 48px);border:1px solid var(--psx-line);outline:1px solid rgba(201,168,106,.45);outline-offset:6px}
.psx-t-cellar-door .psx-col{padding:46px 44px 34px;align-items:center;text-align:center;gap:12px}
.psx-t-cellar-door .cd-frame{position:absolute;inset:0;pointer-events:none}
.psx-t-cellar-door .cd-o{position:absolute;width:26px;height:26px}
.psx-t-cellar-door .cd-o0{left:-13px;top:-13px}.psx-t-cellar-door .cd-o1{right:-13px;top:-13px}.psx-t-cellar-door .cd-o2{left:-13px;bottom:-13px}.psx-t-cellar-door .cd-o3{right:-13px;bottom:-13px}
.psx-t-cellar-door .psx-h{font:500 38px/1.1 var(--psx-fh)}
.psx-t-cellar-door .psx-p{max-width:340px;color:#D8C9B6;line-height:1.6;margin-bottom:10px}
.psx-t-cellar-door .cd-btns{justify-content:center;gap:14px}
.psx-t-cellar-door .psx-btn{border-radius:0;font-weight:500;min-height:50px;padding:0 26px;box-shadow:inset 0 0 0 1px var(--psx-accent)}
.psx-t-cellar-door .psx-btn-secondary{color:var(--psx-ink)}
.psx-t-cellar-door .cd-n{font:italic 500 15px var(--psx-fh);color:#B79F86;opacity:1;margin-top:6px}
.psx-t-cellar-door.psx-mobile .psx-col{padding:34px 20px 26px}
.psx-t-cellar-door.psx-mobile .psx-h{font-size:30px}
.psx-t-cellar-door.psx-mobile .cd-btns{flex-direction:column;align-items:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=0), 'close': CLOSE(x=False, overlay=False, esc=False), 'frequency': FREQ(mode='days', days=30, stopConvert=False, afterCloseOn=False), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON, 'ageGate': True}
    return tpl('43', 'cellar-door', 'Cellar Door', 'info', 'Full screen, age gate', ['age gate', 'wine', 'alcohol', 'compliance'], doc, st, css)


def t44():
    CUR['slug'] = 'holiday-hours'
    cal = '<div class="hh-cal"><b>December</b><span class="hh-r"><i></i><i></i></span><strong>24</strong><small>to 2 January</small></div>'
    s1 = step('s1', 'Notice', [col([HTML(cal)], cls='hh-l', w='0 0 150px'), col([H("We're closed for the holidays"), P('The shop stays open, but orders placed after **21 December** ship from **3 January**.'),
                                                                               LIST([('Last order for Christmas', '21 Dec, 12:00'), ('Customer service back', '2 Jan')]), BTN('Got it', act='close')], cls='hh-r2')])
    doc = {'format': 'modal', 'width': 560, 'mobile': {'format': 'sheet'}, 'fonts': ['Zilla Slab'],
           'theme': {'bg': '#FFFFFF', 'ink': '#1F2937', 'accent': '#1F2937', 'accentInk': '#FFFFFF', 'line': '#D1D5DB', 'radius': 0, 'fh': 'Zilla Slab', 'fb': 'Zilla Slab', 'overlay': 'rgba(31,41,55,.5)'},
           'steps': [s1]}
    css = r'''
.psx-t-holiday-hours .psx-box{box-shadow:0 20px 44px rgba(0,0,0,.3)}
.psx-t-holiday-hours .psx-cols{padding:30px 32px;gap:26px}
.psx-t-holiday-hours .hh-cal{display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 0 0 1px #E5E7EB,0 6px 0 -2px #F3F4F6,0 6px 0 -1px #E5E7EB,0 12px 0 -4px #F3F4F6,0 12px 0 -3px #E5E7EB}
.psx-t-holiday-hours .hh-cal b{display:block;align-self:stretch;background:#B91C1C;color:#fff;padding:14px 0 8px;font:700 17px var(--psx-fh)}
.psx-t-holiday-hours .hh-r{display:flex;justify-content:space-around;align-self:stretch;margin-top:-8px}
.psx-t-holiday-hours .hh-r i{width:8px;height:16px;border-radius:4px;background:#9CA3AF}
.psx-t-holiday-hours .hh-cal strong{font:700 72px/1 var(--psx-fh);padding:6px 0 4px}
.psx-t-holiday-hours .hh-cal small{font:600 13px var(--psx-fh);color:#6B7280;padding-bottom:12px}
.psx-t-holiday-hours .psx-h{font:700 28px/1.1 var(--psx-fh)}
.psx-t-holiday-hours .psx-p{font-size:15px;color:#374151}
.psx-t-holiday-hours .psx-list li{font-size:14px}
.psx-t-holiday-hours .psx-btn{align-self:flex-start;border-radius:0;min-height:44px;font-weight:600;margin-top:6px}
.psx-t-holiday-hours.psx-mobile .psx-cols{padding:22px 20px;gap:14px}
.psx-t-holiday-hours.psx-mobile .hh-l{flex-direction:row}
.psx-t-holiday-hours.psx-mobile .hh-cal{width:100px}
.psx-t-holiday-hours.psx-mobile .hh-cal strong{font-size:40px}
.psx-t-holiday-hours.psx-mobile .psx-h{font-size:22px}
.psx-t-holiday-hours.psx-mobile .psx-btn{align-self:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=2), 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('44', 'holiday-hours', 'Holiday Hours', 'info', 'Modal, notice', ['notice', 'holidays', 'shipping', 'closing'], doc, st, css)


def t45():
    CUR['slug'] = 'ships-to-you'
    pin = '<div class="sy-map"><svg width="44" height="54" viewBox="0 0 24 30"><path d="M12 1C6 1 2 5.5 2 11c0 7.5 10 18 10 18s10-10.5 10-18C22 5.5 18 1 12 1z" fill="#2680C2"/><circle cx="12" cy="11" r="4" fill="#F0F4F8"/></svg></div>'
    s1 = step('s1', 'Notice', [HTML(pin), H('Shopping from Germany?'), P('We ship to you in 2–4 days. Our German store shows prices in euro and speaks Deutsch.'),
                               ROW([BTN('Visit the German store', act='url', href='/de/', cls='sy-go'), BTN('Stay here', act='close', variant='secondary')])])
    doc = {'format': 'slidein', 'position': 'bl', 'width': 370, 'mobile': {'format': 'same'}, 'fonts': ['Hanken Grotesk'],
           'theme': {'bg': '#F0F4F8', 'ink': '#102A43', 'accent': '#2680C2', 'accentInk': '#FFFFFF', 'line': '#BCCCDC', 'radius': 14, 'fh': 'Hanken Grotesk', 'fb': 'Hanken Grotesk'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-ships-to-you .psx-box{box-shadow:0 16px 36px rgba(16,42,67,.2),0 0 0 1px rgba(16,42,67,.08);overflow:hidden}
.psx-t-ships-to-you .psx-col{gap:8px;padding:0 18px 18px}
.psx-t-ships-to-you .sy-map{height:96px;margin:0 -18px 8px;background:#D9E6F2 radial-gradient(circle,#B7CCE0 1.3px,transparent 1.5px) 0 0/9px 9px;display:flex;align-items:center;justify-content:center}
.psx-t-ships-to-you .psx-h{font:700 19px/1.25 var(--psx-fh)}
.psx-t-ships-to-you .psx-p{font-size:14px;color:#334E68}
.psx-t-ships-to-you .psx-rowb{flex-wrap:nowrap;margin-top:6px}
.psx-t-ships-to-you .sy-go{flex:1;white-space:nowrap;padding:0 14px;border-radius:10px;font-weight:600}
.psx-t-ships-to-you .psx-btn-secondary{border-radius:10px;box-shadow:inset 0 0 0 1.5px #BCCCDC;font-weight:600}
.psx-t-ships-to-you .psx-x{top:10px;right:10px;width:32px;height:32px;background:#F0F4F8;font-size:15px}
.psx-t-ships-to-you.psx-mobile .sy-map{height:56px}
.psx-t-ships-to-you.psx-mobile .psx-rowb{flex-direction:column;align-items:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=3), 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='days', days=30), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON,
          'targeting': {'groups': [{'rules': [{'type': 'country', 'op': 'any', 'value': ['DE', 'AT']}]}]}}
    return tpl('45', 'ships-to-you', 'Ships to You', 'info', 'Slide-in, country notice', ['country', 'geo', 'store switch'], doc, st, css)


def t46():
    CUR['slug'] = 'cinema'
    s1 = step('s1', 'Video', [ROW([H('The making of the Field Jacket')], cls='ci-top'), VIDEO(src='', poster=''), ROW([SM('Captions on · sound starts muted', cls='ci-n'), BTN('Shop the jacket →', act='url', href='/', cls='ci-link')], cls='ci-bot')])
    doc = {'format': 'modal', 'width': 680, 'mobile': {'format': 'same'}, 'fonts': ['Oswald'],
           'theme': {'bg': 'transparent', 'ink': '#FFFFFF', 'accent': '#FFFFFF', 'accentInk': '#000000', 'line': '#FFFFFF', 'radius': 0, 'fh': 'Oswald', 'fb': 'Oswald', 'overlay': 'rgba(0,0,0,.86)'},
           'closeBtn': {'look': 'text', 'label': L('CLOSE ×')}, 'steps': [s1]}
    css = r'''
.psx-t-cinema .psx-box{background:transparent;box-shadow:none;overflow:visible}
.psx-t-cinema .psx-col{gap:12px}
.psx-t-cinema .ci-top{padding-right:110px}
.psx-t-cinema .psx-h{font:500 26px/1 var(--psx-fh);text-transform:uppercase;letter-spacing:.04em}
.psx-t-cinema .psx-video{border-radius:0;background:linear-gradient(135deg,#2B2B2B,#121212);box-shadow:0 0 0 1px #333}
.psx-t-cinema .ci-bot{justify-content:space-between}
.psx-t-cinema .ci-n{font-family:system-ui,sans-serif;color:#BDBDBD;opacity:1}
.psx-t-cinema .ci-link{background:none;color:#fff;padding:0;min-height:0;font:500 15px var(--psx-fh);letter-spacing:.04em;text-transform:uppercase;text-decoration:underline;text-underline-offset:4px}
.psx-t-cinema .psx-x{top:-4px;right:0;width:auto;height:36px;padding:0 12px;border:1px solid #fff;border-radius:0;font:500 13px var(--psx-fh);letter-spacing:.06em}
.psx-t-cinema.psx-mobile .psx-h{font-size:18px}
.psx-t-cinema.psx-mobile .ci-top{padding-right:60px}
.psx-t-cinema.psx-mobile .ci-n{display:none}
'''
    st = {'triggers': TRIG(clickOn=True, clickSel='.play-film,[href="#film"]'), 'close': CLOSE(videoOn=True), 'frequency': FREQ(mode='page'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('46', 'cinema', 'Cinema', 'info', 'Modal, video', ['video', 'film', 'story'], doc, st, css)


TEMPLATES = [t43, t44, t45, t46]
