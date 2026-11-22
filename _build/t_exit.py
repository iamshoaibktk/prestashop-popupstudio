from tpl_common import *

EXIT = TRIG(exitOn=True)


def t21():
    CUR['slug'] = 'wait-your-cart'
    s1 = step('s1', 'Cart', [H('You left something behind.'), P('They are still in your cart on this device.'), CART(), METER(t_empty='', t_progress='{free_shipping_remaining} more for free shipping', t_done='Free shipping is unlocked on this order', cls='wc-meter'),
                             ROW([BTN('Go to checkout', act='url', href='{checkout_url}', cls='wc-go'), BTN('Keep browsing', act='close', variant='secondary')])])
    doc = {'format': 'modal', 'width': 500, 'mobile': {'format': 'sheet'}, 'fonts': ['Rubik'],
           'theme': {'bg': '#FBFAF7', 'ink': '#1D1D1B', 'accent': '#1F6F5C', 'accentInk': '#FFFFFF', 'line': '#E7E4DC', 'radius': 16, 'fh': 'Rubik', 'fb': 'Rubik', 'overlay': 'rgba(29,29,27,.5)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-wait-your-cart .psx-col{padding:26px 28px 22px;gap:6px}
.psx-t-wait-your-cart .psx-h{font:700 26px/1.15 var(--psx-fh)}
.psx-t-wait-your-cart .psx-p{font-size:14px;color:#4E4C46;margin-bottom:6px}
.psx-t-wait-your-cart .psx-cart-img{background:#EFEBE2;border-radius:10px;width:64px;height:64px}
.psx-t-wait-your-cart .psx-cart-n b{font-weight:600}
.psx-t-wait-your-cart .psx-cart-total{border-top-color:var(--psx-ink);font-size:16px}
.psx-t-wait-your-cart .wc-meter .psx-meter-n,.psx-t-wait-your-cart .wc-meter .psx-track{display:none}
.psx-t-wait-your-cart .wc-meter .psx-meter-t{font-weight:500;font-size:13px;color:var(--psx-accent)}
.psx-t-wait-your-cart .wc-meter.psx-meter-done .psx-meter-t::before{content:"✓ "}
.psx-t-wait-your-cart .psx-rowb{margin-top:12px;flex-wrap:nowrap}
.psx-t-wait-your-cart .wc-go{flex:1;border-radius:12px;min-height:50px}
.psx-t-wait-your-cart .psx-btn-secondary{border-radius:12px;box-shadow:inset 0 0 0 1.5px #CFCAC0;min-height:50px}
.psx-t-wait-your-cart .psx-x{background:#EFEBE2;top:14px;right:14px}
.psx-t-wait-your-cart.psx-mobile .psx-col{padding:16px 18px 20px}
.psx-t-wait-your-cart.psx-mobile .psx-h{font-size:22px}
.psx-t-wait-your-cart.psx-mobile .psx-rowb{flex-direction:column;align-items:stretch}
'''
    st = {'triggers': EXIT, 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON,
          'targeting': {'groups': [{'rules': [{'type': 'cart_items', 'op': 'gte', 'a': 1}, {'type': 'page', 'op': 'except', 'pages': ['cart', 'checkout', 'confirmation'], 'categories': [], 'products': [], 'cms': []}]}]}}
    return tpl('21', 'wait-your-cart', 'Wait, your cart', 'exit', 'Modal, exit intent', ['exit intent', 'cart', 'abandonment'], doc, st, css)


def t22():
    CUR['slug'] = 'what-stopped-you'
    s1 = step('s1', 'Question', [SM('One question, 5 seconds', cls='ws-k'), H('What stopped you from buying today?'),
                                 CHOICES('reason', [('price', 'The price is a bit high', 'price'), ('shipping', 'Shipping cost or delivery time', 'shipping'), ('size', "I couldn't find my size or option", 'size'), ('looking', 'Just looking for now', 'thanks'), ('other', 'Something else…', 'other')], submit='Send answer', letters=True),
                                 SM('Anonymous. No email needed.', cls='ws-n')])
    s_price = step('price', 'Reply: price', [SM('Thanks for telling us', cls='ws-k'), H('Here is 10% to soften it.'), COUPON(code='TRY10', note=None), BTN('Back to my cart', act='url', href='{cart_url}')])
    s_ship = step('shipping', 'Reply: shipping', [SM('Thanks for telling us', cls='ws-k'), H('Shipping on us, then.'), P('Use this code for free delivery on any order today. Most orders arrive in 2–3 days.'), COUPON(code='SHIPFREE', note=None), BTN('Back to my cart', act='url', href='{cart_url}')])
    s_size = step('size', 'Reply: size', [SM('Thanks for telling us', cls='ws-k'), H('Tell us what you were after.'), TA('What were you looking for?', 'Size, colour, product…', name='wanted'), BTN('Send', act='next', step='thanks')])
    s_other = step('other', 'Reply: other', [SM('Thanks for telling us', cls='ws-k'), H('What could we do better?'), TA('Your answer', name='other'), BTN('Send', act='next', step='thanks')])
    s_thanks = step('thanks', 'Thanks', [H('Thank you!'), P('We read every answer.'), BTN('Close', act='close')])
    doc = {'format': 'modal', 'width': 480, 'mobile': {'format': 'sheet'}, 'fonts': ['IBM Plex Sans'],
           'theme': {'bg': '#EEF3FF', 'ink': '#101828', 'accent': '#3056D3', 'accentInk': '#FFFFFF', 'field': '#FFFFFF', 'line': '#C7D3F5', 'radius': 14, 'fh': 'IBM Plex Sans', 'fb': 'IBM Plex Sans', 'overlay': 'rgba(16,24,40,.5)'},
           'steps': [s1, s_price, s_ship, s_size, s_other, s_thanks]}
    css = r'''
.psx-t-what-stopped-you .psx-col{padding:26px 26px 22px;gap:10px}
.psx-t-what-stopped-you .ws-k{color:var(--psx-accent);font-weight:500;font-size:13px;opacity:1}
.psx-t-what-stopped-you .psx-h{font:700 25px/1.2 var(--psx-fh)}
.psx-t-what-stopped-you .psx-choice{border-radius:10px}
.psx-t-what-stopped-you .psx-choices .psx-btn{align-self:flex-end;border-radius:10px;min-height:44px;margin-top:6px}
.psx-t-what-stopped-you .ws-n{color:#475467;font-size:12.5px;opacity:1;margin-top:-34px;max-width:55%}
.psx-t-what-stopped-you .psx-coupon{border-color:var(--psx-accent);border-radius:10px;background:#fff}
.psx-t-what-stopped-you .psx-btn{border-radius:10px}
.psx-t-what-stopped-you.psx-mobile .psx-col{padding:20px 18px}
.psx-t-what-stopped-you.psx-mobile .psx-h{font-size:21px}
.psx-t-what-stopped-you.psx-mobile .ws-n{margin-top:0;max-width:none}
'''
    st = {'triggers': EXIT, 'close': CLOSE(lastOn=False), 'frequency': FREQ(days=30), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('22', 'what-stopped-you', 'What Stopped You', 'exit', 'Modal, exit survey', ['exit intent', 'survey', 'feedback'], doc, st, css)


def t23():
    CUR['slug'] = 'half-moon'
    s1 = step('s1', 'Offer', [H('Leaving so soon?'), P("Sleep on it. We'll email you a link back to your cart, and 5% off if you come back this week."),
                              FORM(btn='Remind me', label='Email', hideLabel=True, ph='your@email.com', layout='inline', consent=False, nxt='s2'), LINK('No thanks, goodnight')])
    s2 = step('s2', 'Done', [H('Sweet dreams.'), P('Your link and code are on their way. The code is here too:'), COUPON(), LINK('Close')])
    doc = {'format': 'modal', 'width': 560, 'mobile': {'format': 'sheet'}, 'fonts': ['Young Serif', 'Figtree'],
           'theme': {'bg': '#0F1B3D', 'ink': '#E8ECF7', 'accent': '#F4D58D', 'accentInk': '#0F1B3D', 'field': 'rgba(232,236,247,.12)', 'fieldInk': '#FFFFFF', 'line': 'transparent', 'radius': 22, 'fh': 'Young Serif', 'fb': 'Figtree', 'overlay': 'rgba(6,10,26,.62)'},
           'decor': [decor('<div class="hm-moon"></div>', name='Moon', right='-60px', top='-50px', m={'right': '-40px', 'top': '-40px'})], 'closeBtn': {'look': 'circle'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-half-moon .psx-box{overflow:hidden;box-shadow:0 22px 50px rgba(0,0,0,.5);background-image:radial-gradient(1.5px 1.5px at 20% 30%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 70% 18%,#fff 50%,transparent 51%),radial-gradient(1.2px 1.2px at 85% 70%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 40% 80%,#C9D3F2 50%,transparent 51%),radial-gradient(1.4px 1.4px at 55% 45%,#fff 50%,transparent 51%)}
.psx-t-half-moon .hm-moon{position:relative;width:260px;height:260px;border-radius:50%;background:#F4D58D;box-shadow:0 0 60px rgba(244,213,141,.35);overflow:hidden}
.psx-t-half-moon .hm-moon::after{content:"";position:absolute;left:-15%;top:-12%;width:100%;height:100%;border-radius:50%;background:#0F1B3D}
.psx-t-half-moon .psx-col{padding:40px 44px;gap:12px;max-width:380px}
.psx-t-half-moon .psx-h{font:400 38px/1.08 var(--psx-fh)}
.psx-t-half-moon .psx-p{color:#C3CAE0;line-height:1.6}
.psx-t-half-moon .psx-input{border-radius:999px;border:0;padding:0 18px}
.psx-t-half-moon .psx-btn{border-radius:999px;font-weight:700}
.psx-t-half-moon .psx-link{color:#C3CAE0;font-size:13px}
.psx-t-half-moon .psx-x{top:auto;bottom:16px;right:18px;background:rgba(232,236,247,.12)}
.psx-t-half-moon .psx-coupon{border-color:var(--psx-accent);border-radius:999px;color:var(--psx-accent)}
.psx-t-half-moon.psx-mobile .hm-moon{width:160px;height:160px}
.psx-t-half-moon.psx-mobile .psx-col{padding:34px 22px 24px;max-width:none}
.psx-t-half-moon.psx-mobile .psx-h{font-size:32px}
.psx-t-half-moon.psx-mobile .psx-row{flex-direction:column}
.psx-t-half-moon.psx-mobile .psx-x{top:12px;bottom:auto}
'''
    st = {'triggers': EXIT, 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': False, 'consentRequired': False}, 'coupon': GEN('BACK5-', 5, days=7)}
    return tpl('23', 'half-moon', 'Half Moon', 'exit', 'Modal, exit intent', ['exit intent', 'night', 'reminder'], doc, st, css)


def t24():
    CUR['slug'] = 'sticky-note'
    arrow = '<svg width="70" height="40" viewBox="0 0 70 40"><path d="M4 30 C 20 6, 40 6, 60 20" fill="none" stroke="#2D2A1E" stroke-width="2.2" stroke-linecap="round"/><path d="M60 20 l-10 -2 M60 20 l-5 9" stroke="#2D2A1E" stroke-width="2.2" stroke-linecap="round"/></svg>'
    s1 = step('s1', 'Note', [H("Psst! Don't forget…"), P('10% off today with code'), ROW([COUPON(code='NOTE10', note=None, copy='Copy code', cls='sn-code'), HTML(arrow, cls='psx-hide-m')]), ROW([BTN('Copy code', act='copy'), BTN('Keep shopping', act='close', variant='secondary')])])
    doc = {'format': 'modal', 'width': 340, 'mobile': {'format': 'same', 'width': '270px'}, 'fonts': ['Gochi Hand', 'Karla'],
           'theme': {'bg': '#FFE873', 'ink': '#2D2A1E', 'accent': '#2D2A1E', 'accentInk': '#FFE873', 'line': '#2D2A1E', 'radius': 0, 'fh': 'Gochi Hand', 'fb': 'Gochi Hand', 'overlay': 'rgba(45,42,30,.35)'},
           'steps': [s1]}
    css = r'''
.psx-t-sticky-note .psx-box{background:linear-gradient(180deg,#FFF08A 0,#FFE873 30%,#FBDE5A 100%);box-shadow:0 18px 28px rgba(0,0,0,.25),0 2px 4px rgba(0,0,0,.12);clip-path:polygon(0 0,100% 0,100% 88%,88% 100%,0 100%);overflow:hidden;transform:translate(-50%,-50%) rotate(-3deg)}
.psx-t-sticky-note.psx-f-modal.psx-in .psx-box{transform:translate(-50%,-50%) rotate(-3deg)}
.psx-t-sticky-note .psx-box::after{content:"";position:absolute;right:0;bottom:0;width:12%;aspect-ratio:1;background:linear-gradient(135deg,#E5C944 0,#F7E27A 45%,rgba(0,0,0,.12) 50%,transparent 52%)}
.psx-t-sticky-note .psx-col{padding:34px 30px 40px;gap:6px;min-height:340px}
.psx-t-sticky-note .psx-h{font:400 40px/1.05 var(--psx-fh)}
.psx-t-sticky-note .psx-p{font:400 23px/1.3 var(--psx-fh);margin-top:6px}
.psx-t-sticky-note .sn-code .psx-coupon{border:0;border-radius:0}
.psx-t-sticky-note .sn-code .psx-code{padding:0;font:400 38px/1.1 var(--psx-fh);color:#E2483D;border-bottom:3px solid #E2483D;letter-spacing:0}
.psx-t-sticky-note .sn-code .psx-code[data-len="l"]{font-size:28px;letter-spacing:0}
.psx-t-sticky-note .sn-code .psx-code[data-len="xl"]{font-size:22px;letter-spacing:0;padding:0}
.psx-t-sticky-note .sn-code .psx-copy{display:none}
.psx-t-sticky-note .psx-rowb:last-child{margin-top:16px;flex-wrap:nowrap}
.psx-t-sticky-note .psx-btn{border-radius:6px;font:700 15px Karla,sans-serif;min-height:46px;padding:0 16px;border:2px solid var(--psx-ink)}
.psx-t-sticky-note .psx-btn-secondary{background:transparent;color:var(--psx-ink);box-shadow:none}
.psx-t-sticky-note .psx-x{font:400 28px/1 var(--psx-fh);top:8px;right:10px}
.psx-t-sticky-note.psx-mobile .psx-col{padding:26px 22px 34px;min-height:270px}
.psx-t-sticky-note.psx-mobile .psx-h{font-size:32px}
.psx-t-sticky-note.psx-mobile .psx-p{font-size:19px}
.psx-t-sticky-note.psx-mobile .psx-btn-secondary{display:none}
'''
    st = {'triggers': EXIT, 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': FIXED('NOTE10')}
    return tpl('24', 'sticky-note', 'Sticky Note', 'exit', 'Small modal', ['exit intent', 'coupon', 'handwritten'], doc, st, css)


def t25():
    CUR['slug'] = 'last-call'
    s1 = step('s1', 'Offer', [SM('Before you go', cls='lc-k'), H('Last call:\n20% off'), ROW([P('Everything in your cart, for the next hour. Applied automatically at checkout.'), BTN('Take it →', act='apply')], cls='lc-bot')])
    doc = {'format': 'fullscreen', 'mobile': {'format': 'same'}, 'fonts': ['Bebas Neue', 'Barlow'],
           'theme': {'bg': '#E10600', 'ink': '#FFFFFF', 'accent': '#111111', 'accentInk': '#FFFFFF', 'line': '#FFFFFF', 'radius': 0, 'fh': 'Bebas Neue', 'fb': 'Barlow'},
           'closeBtn': {'look': 'text', 'label': L('Close ×')}, 'steps': [s1]}
    css = r'''
.psx-t-last-call .psx-box{display:flex}
.psx-t-last-call .psx-step{display:flex;flex:1;padding:34px 40px}
.psx-t-last-call .psx-cols{flex:1}
.psx-t-last-call .psx-col{justify-content:space-between;gap:20px}
.psx-t-last-call .lc-k{font-weight:600;font-size:14px;opacity:1}
.psx-t-last-call .psx-h{font:400 clamp(110px,17vw,260px)/.82 var(--psx-fh);letter-spacing:-.01em}
.psx-t-last-call .lc-bot{justify-content:space-between;align-items:flex-end;flex-wrap:wrap}
.psx-t-last-call .psx-p{max-width:340px;font-weight:500;font-size:17px;line-height:1.45}
.psx-t-last-call .psx-btn{border-radius:0;min-height:64px;padding:0 34px;font:400 32px var(--psx-fh)}
.psx-t-last-call .psx-x{width:auto;height:40px;padding:0 14px;border:2px solid #fff;border-radius:0;font:700 13px var(--psx-fb);top:34px;right:40px}
.psx-t-last-call.psx-mobile .psx-step{padding:26px 22px}
.psx-t-last-call.psx-mobile .psx-h{font-size:104px}
.psx-t-last-call.psx-mobile .lc-bot{flex-direction:column;align-items:stretch}
.psx-t-last-call.psx-mobile .psx-x{top:22px;right:22px}
'''
    st = {'triggers': EXIT, 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': FIXED('LASTCALL20', True)}
    return tpl('25', 'last-call', 'Last Call', 'exit', 'Full screen', ['exit intent', 'bold', 'full screen'], doc, st, css)


TEMPLATES = [t21, t22, t23, t24, t25]
