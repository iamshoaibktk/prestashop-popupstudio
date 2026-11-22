from tpl_common import *


def t47():
    CUR['slug'] = 'black-friday-sticker'
    s1 = step('s1', 'Offer', [H('BLACK\nFRIDAY'), P('Up to 40% off sitewide. Our lowest prices of the year, until Monday night.'), BTN('Shop the sale', act='url', href='/')])
    doc = {'format': 'modal', 'width': 600, 'mobile': {'format': 'sheet'}, 'fonts': ['Archivo Black', 'Archivo'],
           'theme': {'bg': '#0A0A0A', 'ink': '#FFFFFF', 'accent': '#FF2E63', 'accentInk': '#FFFFFF', 'line': '#FFFFFF', 'radius': 0, 'fh': 'Archivo Black', 'fb': 'Archivo', 'overlay': 'rgba(0,0,0,.6)'},
           'decor': [decor('<span class="bf-st bf-1">−40%</span>', name='Sticker 1', right='34px', top='-26px', rot=12, m={'right': '20px', 'top': '-34px'}),
                     decor('<span class="bf-st bf-2">Ends Monday</span>', name='Sticker 2', right='56px', top='196px', rot=-8, hideMobile=True),
                     decor('<span class="bf-st bf-3">Free shipping</span>', name='Sticker 3', right='30px', bottom='-18px', rot=5, hideMobile=True)],
           'closeBtn': {'look': 'x'}, 'steps': [s1]}
    css = r'''
.psx-t-black-friday-sticker .psx-box{overflow:visible;box-shadow:0 22px 50px rgba(0,0,0,.5);min-height:380px}
.psx-t-black-friday-sticker .psx-col{padding:36px 40px;gap:18px;align-items:flex-start}
.psx-t-black-friday-sticker .psx-h{font:400 92px/.86 var(--psx-fh);letter-spacing:-.03em}
.psx-t-black-friday-sticker .psx-p{max-width:290px;font-weight:500;font-size:16px;color:#D4D4D4}
.psx-t-black-friday-sticker .psx-btn{border-radius:0;font:400 18px var(--psx-fh);min-height:54px;padding:0 26px}
.psx-t-black-friday-sticker .bf-st{display:flex;align-items:center;justify-content:center;font:400 18px/1 var(--psx-fh);text-align:center;box-shadow:0 0 0 4px #fff,0 6px 12px rgba(0,0,0,.4)}
.psx-t-black-friday-sticker .bf-1{width:120px;height:120px;border-radius:50%;background:#FF2E63;color:#fff;font-size:30px}
.psx-t-black-friday-sticker .bf-2{padding:10px 14px;background:#FFE14D;color:#0A0A0A;border-radius:6px}
.psx-t-black-friday-sticker .bf-3{padding:12px 16px;background:#fff;color:#0A0A0A;border-radius:999px;font-size:15px;box-shadow:0 0 0 4px #0A0A0A,0 6px 12px rgba(0,0,0,.4)}
.psx-t-black-friday-sticker .psx-x{left:12px;right:auto;top:12px}
.psx-t-black-friday-sticker.psx-mobile .psx-box{min-height:0;overflow:visible}
.psx-t-black-friday-sticker.psx-mobile .psx-col{padding:44px 22px 24px}
.psx-t-black-friday-sticker.psx-mobile .psx-h{font-size:62px}
.psx-t-black-friday-sticker.psx-mobile .bf-1{width:90px;height:90px;font-size:24px}
.psx-t-black-friday-sticker.psx-mobile .psx-btn{align-self:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=4), 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON,
          'schedule': {'days': [1, 2, 3, 4, 5, 6, 7], 'from': '00:00', 'to': '23:59'}, 'dates': ['2026-11-27 00:00', '2026-11-30 23:59']}
    return tpl('47', 'black-friday-sticker', 'Black Friday Sticker', 'seasonal', 'Modal, centre', ['seasonal', 'black friday', 'sale'], doc, st, css)


def t48():
    CUR['slug'] = 'winter-market'
    sprig = '<svg viewBox="0 0 150 40" width="150" height="40"><g fill="none" stroke="#7FB69A" stroke-width="1.6" stroke-linecap="round"><path d="M10 34 L70 20"/><path d="M20 32l-4-8M30 30l-4-9M40 27l-3-9M50 25l-3-9M60 23l-2-9M20 32l6-6M30 30l7-6M40 27l7-6M50 25l7-6M60 23l7-5"/><path d="M140 34 L80 20"/><path d="M130 32l4-8M120 30l4-9M110 27l3-9M100 25l3-9M90 23l2-9M130 32l-6-6M120 30l-7-6M110 27l-7-6M100 25l-7-6M90 23l-7-5"/></g><circle cx="75" cy="19" r="5" fill="#C8102E"/><circle cx="68" cy="14" r="3.5" fill="#C8102E"/><circle cx="82" cy="14" r="3.5" fill="#C8102E"/></svg>'
    s1 = step('s1', 'Offer', [HTML(sprig, cls='psx-hide-m'), H('The Winter Market\n*is open*'), P('Gifts wrapped by hand, and 15% off everything until the 24th. Order by **20 December** to receive it in time.'),
                              HTML('<div class="wm-seal">15%<small>OFF</small></div>', cls='psx-hide-m'), BTN('Shop the gifts', act='url', href='/')])
    doc = {'format': 'modal', 'width': 520, 'mobile': {'format': 'sheet'}, 'fonts': ['Playfair Display', 'Mulish'],
           'theme': {'bg': '#0E3B2C', 'ink': '#F7F3EA', 'accent': '#F7F3EA', 'accentInk': '#0E3B2C', 'line': '#F7F3EA', 'radius': 0, 'fh': 'Playfair Display', 'fb': 'Mulish', 'overlay': 'rgba(5,22,16,.62)'},
           'steps': [s1]}
    css = r'''
.psx-t-winter-market .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.45);text-align:center;background-image:radial-gradient(circle,rgba(247,243,234,.16) 1.2px,transparent 1.5px);background-size:22px 22px}
.psx-t-winter-market .psx-box::before,.psx-t-winter-market .psx-box::after{content:"";display:block;height:16px;background:repeating-linear-gradient(90deg,#C8102E 0 10px,#F7F3EA 10px 20px);-webkit-mask:radial-gradient(circle 5px at 50% 50%,#000 96%,#0000) 0 0/10px 16px;mask:radial-gradient(circle 5px at 50% 50%,#000 96%,#0000) 0 0/10px 16px}
.psx-t-winter-market .psx-col{padding:24px 40px 26px;align-items:center;gap:12px}
.psx-t-winter-market .psx-h{font:700 40px/1.05 var(--psx-fh)}
.psx-t-winter-market .psx-h em{font-weight:600}
.psx-t-winter-market .psx-p{max-width:340px;color:#D9E6DD;line-height:1.55}
.psx-t-winter-market .psx-p strong{color:#F7F3EA}
.psx-t-winter-market .wm-seal{width:88px;height:88px;border-radius:50%;background:#C8102E;color:#F7F3EA;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 0 4px #0E3B2C,0 0 0 5px #C8102E;font:700 24px/1 var(--psx-fh)}
.psx-t-winter-market .wm-seal small{font:600 10px var(--psx-fb);margin-top:4px}
.psx-t-winter-market .psx-btn{border-radius:0;font-weight:700;padding:0 28px;min-height:50px}
.psx-t-winter-market.psx-mobile .psx-col{padding:20px 22px 24px}
.psx-t-winter-market.psx-mobile .psx-h{font-size:30px}
.psx-t-winter-market.psx-mobile .psx-btn{align-self:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=5), 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON, 'dates': ['2026-12-01 00:00', '2026-12-24 23:59']}
    return tpl('48', 'winter-market', 'Winter Market', 'seasonal', 'Modal, centre', ['seasonal', 'christmas', 'winter', 'gifts'], doc, st, css)


def t49():
    CUR['slug'] = 'love-letter'
    heart = '<div class="ll-win"><div class="ll-heart"><b>15%</b><span>{coupon|LOVE15}</span></div></div>'
    s1 = step('s1', 'Offer', [col([SM('A note for you', cls='ll-k'), H('Dear you,\nwe picked\nsomething.'), P("Valentine's gifts with 15% off, wrapped and with a card. Ships until 11 February."), BTN('Find a gift', act='url', href='/')], cls='ll-l'),
                              col([HTML(heart), BTN('Copy the code', act='copy', variant='secondary', cls='ll-copy')], cls='ll-r', w='0 0 190px')])
    doc = {'format': 'modal', 'width': 600, 'mobile': {'format': 'sheet'}, 'fonts': ['Della Respira', 'Quicksand'],
           'theme': {'bg': '#FFD6E0', 'ink': '#5C0A2E', 'accent': '#E0115F', 'accentInk': '#FFFFFF', 'line': '#5C0A2E', 'radius': 0, 'fh': 'Della Respira', 'fb': 'Quicksand', 'overlay': 'rgba(92,10,46,.5)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-love-letter .psx-box{background:linear-gradient(180deg,#FFD6E0 0 49.6%,#F7C2D0 49.6% 50.4%,#FFD6E0 50.4%);box-shadow:0 22px 50px rgba(92,10,46,.35)}
.psx-t-love-letter .psx-cols{align-items:center;padding:0 40px;min-height:380px;gap:32px}
.psx-t-love-letter .ll-l{gap:12px}
.psx-t-love-letter .ll-k{color:var(--psx-accent);font-weight:600;font-size:13px;opacity:1}
.psx-t-love-letter .psx-h{font:400 40px/1.08 var(--psx-fh)}
.psx-t-love-letter .psx-p{font-weight:500;color:#7A2148;line-height:1.55}
.psx-t-love-letter .psx-btn{align-self:flex-start;border-radius:999px;font-weight:700;padding:0 24px}
.psx-t-love-letter .ll-r{align-items:center;text-align:center}
.psx-t-love-letter .ll-win{padding:18px;background:#E0115F;border-radius:6px;box-shadow:0 6px 16px rgba(224,17,95,.35)}
.psx-t-love-letter .ll-heart{width:150px;height:136px;background:#fff;clip-path:path('M75 136 C 20 100, 0 70, 0 42 C 0 18, 18 0, 40 0 C 56 0, 68 9, 75 22 C 82 9, 94 0, 110 0 C 132 0, 150 18, 150 42 C 150 70, 130 100, 75 136 Z');display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:16px}
.psx-t-love-letter .ll-heart b{font:700 26px var(--psx-fb);color:var(--psx-accent)}
.psx-t-love-letter .ll-heart span{font:600 12px ui-monospace,Menlo,monospace;margin-top:4px;max-width:104px;text-align:center;overflow-wrap:anywhere;line-height:1.25}
.psx-t-love-letter .ll-copy{align-self:center!important;box-shadow:none;text-decoration:underline;text-underline-offset:3px;min-height:36px}
.psx-t-love-letter .psx-x{background:rgba(255,255,255,.6)}
.psx-t-love-letter.psx-mobile .psx-cols{flex-direction:column-reverse;padding:22px 20px;min-height:0;gap:8px}
.psx-t-love-letter.psx-mobile .ll-win{padding:8px}
.psx-t-love-letter.psx-mobile .ll-heart{transform:scale(.6);margin:-26px}
.psx-t-love-letter.psx-mobile .psx-h{font-size:26px}
.psx-t-love-letter.psx-mobile .psx-btn{align-self:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=5), 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': FIXED('LOVE15'), 'dates': ['2027-02-01 00:00', '2027-02-14 23:59']}
    return tpl('49', 'love-letter', 'Love Letter', 'seasonal', 'Modal, centre', ['seasonal', 'valentine', 'gifts'], doc, st, css)


def t50():
    CUR['slug'] = 'summer-swell'
    waves = '<svg viewBox="0 0 560 400" width="100%" height="100%" preserveAspectRatio="none"><path d="M0 290 C 70 260, 140 320, 210 290 S 350 260, 420 290 S 530 320, 560 290 V400 H0z" fill="#56B4C9"/><path d="M0 325 C 70 300, 140 350, 210 325 S 350 300, 420 325 S 530 350, 560 325 V400 H0z" fill="#1C7C9C"/><path d="M0 360 C 70 340, 140 380, 210 360 S 350 340, 420 360 S 530 380, 560 360 V400 H0z" fill="#0B4F6C"/></svg>'
    sun = '<svg viewBox="0 0 210 210" width="100%" height="100%"><circle cx="105" cy="105" r="78" fill="#FF7F11"/><circle cx="105" cy="105" r="100" fill="none" stroke="#FF7F11" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/></svg>'
    s1 = step('s1', 'Offer', [H('Summer\nsale is\non'), P('Up to 30% off swimwear and sandals, until the last wave of August.'), BTN('Dive in', act='url', href='/')])
    doc = {'format': 'modal', 'width': 560, 'mobile': {'format': 'same'}, 'fonts': ['Righteous', 'Nunito'],
           'theme': {'bg': '#FFE8C2', 'ink': '#0B4F6C', 'accent': '#0B4F6C', 'accentInk': '#FFE8C2', 'line': '#0B4F6C', 'radius': 26, 'fh': 'Righteous', 'fb': 'Nunito', 'overlay': 'rgba(11,79,108,.5)'},
           'decor': [decor(waves, name='Waves', left='0', top='0', width='100%', height='100%'), decor(sun, name='Sun', right='24px', top='6px', width='210px', height='210px', m={'right': '-30px', 'top': '-10px', 'width': '150px', 'height': '150px'})], 'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-summer-swell .psx-box{overflow:hidden;box-shadow:0 22px 50px rgba(11,79,108,.35);min-height:400px}
.psx-t-summer-swell .psx-decor{overflow:hidden}
.psx-t-summer-swell .psx-col{padding:40px 44px;max-width:300px;gap:12px}
.psx-t-summer-swell .psx-h{font:400 54px/.95 var(--psx-fh)}
.psx-t-summer-swell .psx-p{font-weight:700}
.psx-t-summer-swell .psx-btn{align-self:flex-start;border-radius:999px;font-weight:800;padding:0 24px}
.psx-t-summer-swell .psx-x{background:var(--psx-bg);box-shadow:0 0 0 2px var(--psx-ink);font-weight:800}
.psx-t-summer-swell.psx-mobile .psx-box{min-height:420px}
.psx-t-summer-swell.psx-mobile .psx-col{padding:30px 24px}
.psx-t-summer-swell.psx-mobile .psx-h{font-size:44px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=6), 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON, 'dates': ['2027-06-01 00:00', '2027-08-31 23:59']}
    return tpl('50', 'summer-swell', 'Summer Swell', 'seasonal', 'Modal, centre', ['seasonal', 'summer', 'sale'], doc, st, css)


TEMPLATES = [t47, t48, t49, t50]
