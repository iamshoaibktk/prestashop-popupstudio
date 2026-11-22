from tpl_common import *

BARS = 'background:repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 4px,currentColor 4px 5px,transparent 5px 8px,currentColor 8px 11px,transparent 11px 13px)'


def t13():
    CUR['slug'] = 'ticket-stub'
    stub = '<div class="ts-stub"><span class="ts-code">TIX-15-········</span><i class="ts-bars"></i><small>no. 000 001</small></div>'
    s1 = step('s1', 'Offer', [col([SM('Admit one · your first order · row A, seat 1', cls='ts-k'), H('15% off'), P('Your ticket prints with your email. One code, one order.'),
                                   FORM(btn='Print my ticket', label='Email', hideLabel=True, layout='inline', consentText='Send me the newsletter too', nxt='s2')], cls='ts-main'), col([HTML(stub)], cls='ts-side', w='0 0 170px')])
    s2 = step('s2', 'Ticket', [col([SM('Admit one · your first order', cls='ts-k'), H('15% off'), P('Printed. Tear off the stub at checkout.')], cls='ts-main'),
                              col([COUPON(copy='Copy code', note='Valid until {coupon_expiry}'), HTML('<i class="ts-bars"></i>'), BTN('Apply to cart', act='apply', full=True)], cls='ts-side ts-side2', w='0 0 230px')])
    doc = {'format': 'modal', 'width': 640, 'mobile': {'format': 'same'}, 'fonts': ['Bricolage Grotesque', 'DM Mono'],
           'theme': {'bg': '#FFF4DD', 'ink': '#2B1D0E', 'accent': '#2B1D0E', 'accentInk': '#FFF4DD', 'field': '#FFFFFF', 'line': '#2B1D0E', 'radius': 0, 'fh': 'Bricolage Grotesque', 'fb': 'Bricolage Grotesque', 'overlay': 'rgba(43,29,14,.6)'},
           'decor': [decor('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B1D0E" stroke-width="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/></svg>', name='Scissors', right='161px', top='120px', hideMobile=True)],
           'steps': [s1, s2]}
    css = r'''
.psx-t-ticket-stub .psx-box{background:transparent;overflow:visible;filter:drop-shadow(0 18px 30px rgba(0,0,0,.35));border-radius:0}
.psx-t-ticket-stub .psx-step{background:var(--psx-bg);-webkit-mask:radial-gradient(circle 15px at calc(100% - 170px) 0,#0000 97%,#000) top/100% 51% no-repeat,radial-gradient(circle 15px at calc(100% - 170px) 100%,#0000 97%,#000) bottom/100% 51% no-repeat;mask:radial-gradient(circle 15px at calc(100% - 170px) 0,#0000 97%,#000) top/100% 51% no-repeat,radial-gradient(circle 15px at calc(100% - 170px) 100%,#0000 97%,#000) bottom/100% 51% no-repeat}
.psx-t-ticket-stub .psx-step[data-step=s2]{-webkit-mask-image:radial-gradient(circle 15px at calc(100% - 230px) 0,#0000 97%,#000),radial-gradient(circle 15px at calc(100% - 230px) 100%,#0000 97%,#000);mask-image:radial-gradient(circle 15px at calc(100% - 230px) 0,#0000 97%,#000),radial-gradient(circle 15px at calc(100% - 230px) 100%,#0000 97%,#000)}
.psx-t-ticket-stub .psx-cols{min-height:300px}
.psx-t-ticket-stub .ts-main{padding:26px 30px;gap:6px;border-right:2px dashed rgba(43,29,14,.45)}
.psx-t-ticket-stub .ts-side{align-items:center;justify-content:center;padding:20px 14px;gap:12px}
.psx-t-ticket-stub .ts-side2{align-items:stretch}
.psx-t-ticket-stub .ts-k{font:500 12px "DM Mono",monospace;opacity:1}
.psx-t-ticket-stub .psx-h{font:800 92px/.9 var(--psx-fh);color:#E4572E;letter-spacing:-.04em}
.psx-t-ticket-stub .psx-p{font-weight:500;margin-bottom:10px}
.psx-t-ticket-stub .ts-stub{display:flex;flex-direction:column;align-items:center;gap:12px}
.psx-t-ticket-stub .ts-code{writing-mode:vertical-rl;transform:rotate(180deg);font:500 13px "DM Mono",monospace;letter-spacing:.06em;color:rgba(43,29,14,.45)}
.psx-t-ticket-stub .ts-bars{display:block;width:110px;height:34px;color:var(--psx-ink);background:repeating-linear-gradient(90deg,currentColor 0 2px,transparent 2px 4px,currentColor 4px 5px,transparent 5px 8px,currentColor 8px 11px,transparent 11px 13px)}
.psx-t-ticket-stub .ts-stub small{font:500 10.5px "DM Mono",monospace;color:rgba(43,29,14,.6)}
.psx-t-ticket-stub .psx-input{border:2px solid var(--psx-ink);border-radius:0;font-family:"DM Mono",monospace}
.psx-t-ticket-stub .psx-btn{border-radius:0;font-weight:800}
.psx-t-ticket-stub .psx-box-ck{border-radius:0;border-width:2px;width:14px;height:14px}
.psx-t-ticket-stub .psx-check{font:400 11.5px "DM Mono",monospace}
.psx-t-ticket-stub .psx-coupon{border-radius:0;border-width:2px;flex-direction:column}
.psx-t-ticket-stub .psx-code{font-family:"DM Mono",monospace;text-align:center}
.psx-t-ticket-stub .psx-copy{border-left:0;border-top:2px dashed var(--psx-ink);min-height:38px}
.psx-t-ticket-stub .psx-x{top:6px;right:8px}
.psx-t-ticket-stub.psx-mobile .psx-step,.psx-t-ticket-stub.psx-mobile .psx-step[data-step=s2]{-webkit-mask:none;mask:none}
.psx-t-ticket-stub.psx-mobile .ts-main{border-right:0;border-bottom:2px dashed rgba(43,29,14,.45);padding:22px 20px}
.psx-t-ticket-stub.psx-mobile .psx-h{font-size:72px}
.psx-t-ticket-stub.psx-mobile .ts-code{writing-mode:horizontal-tb;transform:none}
.psx-t-ticket-stub.psx-mobile .psx-row{flex-direction:column}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=6), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': False}, 'coupon': GEN('TIX-15-', 15)}
    return tpl('13', 'ticket-stub', 'Ticket Stub', 'discount', 'Modal, centre', ['discount', 'coupon', 'ticket'], doc, st, css)


def t14():
    CUR['slug'] = 'price-tag'
    s1 = step('s1', 'Tag', [SM('Today only', cls='pt-k'), H('−12%'), P('on this product and anything you add with it.'), COUPON(copy='Copy', note=None, code='TAG12', cls='pt-code'), BTN('Copy and apply', act='apply', full=True)])
    doc = {'format': 'slidein', 'position': 'bl', 'width': 230, 'mobile': {'format': 'same'}, 'fonts': ['Bitter'],
           'theme': {'bg': '#F6E7C8', 'ink': '#3A2A12', 'accent': '#8C2F1B', 'accentInk': '#F6E7C8', 'line': '#3A2A12', 'radius': 0, 'fh': 'Bitter', 'fb': 'Bitter'},
           'decor': [decor('<span class="pt-eye"></span>', name='Eyelet', left='50%', top='22px')], 'steps': [s1]}
    css = r'''
.psx-t-price-tag .psx-box{background:transparent;overflow:visible;filter:drop-shadow(0 12px 18px rgba(58,42,18,.28));transform-origin:50% 0}
.psx-t-price-tag.psx-in .psx-box{animation:psx-swing 1.2s ease-out}
@keyframes psx-swing{0%{transform:rotate(14deg)}40%{transform:rotate(-8deg)}70%{transform:rotate(4deg)}100%{transform:rotate(-2deg)}}
.psx-t-price-tag .psx-step{background:var(--psx-bg);clip-path:polygon(22% 0,78% 0,100% 13%,100% 100%,0 100%,0 13%)}
.psx-t-price-tag .psx-col{padding:56px 22px 22px;text-align:center;gap:4px}
.psx-t-price-tag .pt-eye{display:block;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:#fff;box-shadow:inset 0 0 0 4px #C9A96E}
.psx-t-price-tag .pt-k{font-weight:600;font-size:12px;color:var(--psx-accent);opacity:1}
.psx-t-price-tag .psx-h{font:800 54px/.95 var(--psx-fh);letter-spacing:-.03em}
.psx-t-price-tag .psx-p{font-size:13px;margin-bottom:10px}
.psx-t-price-tag .psx-coupon{border:0;border-top:1.5px dashed var(--psx-ink);border-bottom:1.5px dashed var(--psx-ink);border-radius:0;justify-content:center}
.psx-t-price-tag .psx-code{text-align:center;font-size:18px;letter-spacing:.06em}
.psx-t-price-tag .psx-copy{display:none}
.psx-t-price-tag .psx-btn{border-radius:0;margin-top:10px;font-weight:600}
.psx-t-price-tag .psx-x{top:16px;right:12px;width:30px;height:30px;font-size:18px}
.psx-t-price-tag.psx-mobile .psx-box{left:14px!important;right:14px!important;width:auto}
.psx-t-price-tag.psx-mobile .psx-step{clip-path:polygon(0 18%,8% 0,92% 0,100% 18%,100% 100%,0 100%)}
.psx-t-price-tag.psx-mobile .psx-col{padding:40px 18px 16px}
.psx-t-price-tag.psx-mobile .psx-h{font-size:42px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=20), 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': FIXED('TAG12', True),
          'targeting': {'groups': [{'rules': [{'type': 'page', 'op': 'show_on', 'pages': ['product'], 'categories': [], 'products': [], 'cms': []}]}]}}
    return tpl('14', 'price-tag', 'Price Tag', 'discount', 'Slide-in, bottom left', ['discount', 'product page', 'tag'], doc, st, css)


def t15():
    CUR['slug'] = 'flash-hazard'
    s1 = step('s1', 'Sale', [SM('Flash sale · ends tonight', cls='fh-k'), H('30% off\neverything'), CD(mode='date', end='2026-12-31T23:59', look='flap', noDays=True, hideAtZero=True), BTN('Shop the sale', act='url', href='/'), SM('Applied at checkout. No code needed.', cls='fh-n')])
    doc = {'format': 'modal', 'width': 560, 'mobile': {'format': 'same'}, 'fonts': ['Big Shoulders Display', 'Barlow'],
           'theme': {'bg': '#FFD400', 'ink': '#111111', 'accent': '#111111', 'accentInk': '#FFD400', 'line': '#111111', 'radius': 0, 'fh': 'Big Shoulders Display', 'fb': 'Barlow', 'overlay': 'rgba(17,17,17,.6)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-flash-hazard .psx-box{padding:14px;background:repeating-linear-gradient(-45deg,#111 0 18px,#FFD400 18px 36px);box-shadow:0 22px 50px rgba(0,0,0,.45);overflow:visible}
.psx-t-flash-hazard .psx-step{background:var(--psx-bg)}
.psx-t-flash-hazard .psx-col{padding:26px 30px;text-align:center;align-items:center;gap:12px}
.psx-t-flash-hazard .fh-k{background:#111;color:#FFD400;padding:4px 10px;font-weight:600;font-size:14px;opacity:1}
.psx-t-flash-hazard .psx-h{font:900 96px/.82 var(--psx-fh);text-transform:uppercase}
.psx-t-flash-hazard .psx-cd-u b{background:#111;color:#FFD400;font:900 50px/1 var(--psx-fh);min-width:64px;padding:12px 4px;border-radius:4px;position:relative}
.psx-t-flash-hazard .psx-cd-u b::after{content:"";position:absolute;left:0;right:0;top:50%;height:2px;background:#FFD400}
.psx-t-flash-hazard .psx-cd{gap:14px}
.psx-t-flash-hazard .psx-cd-u small{font-weight:600}
.psx-t-flash-hazard .psx-btn{border-radius:0;font:900 24px var(--psx-fh);text-transform:uppercase;min-height:52px;padding:0 30px}
.psx-t-flash-hazard .fh-n{font-size:12px;font-weight:500;opacity:1}
.psx-t-flash-hazard .psx-x{top:-16px;right:-16px;background:#111;color:#FFD400;box-shadow:0 0 0 3px #FFD400}
.psx-t-flash-hazard.psx-mobile .psx-box{padding:10px}
.psx-t-flash-hazard.psx-mobile .psx-col{padding:22px 16px}
.psx-t-flash-hazard.psx-mobile .psx-h{font-size:64px}
.psx-t-flash-hazard.psx-mobile .psx-cd-u b{font-size:40px;min-width:50px}
.psx-t-flash-hazard.psx-mobile .psx-btn{align-self:stretch}
.psx-t-flash-hazard.psx-mobile .psx-x{top:-10px;right:-6px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=0), 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('15', 'flash-hazard', 'Flash Hazard', 'discount', 'Modal with countdown', ['discount', 'flash sale', 'countdown', 'urgent'], doc, st, css)


def t16():
    CUR['slug'] = 'welcome-back'
    s1 = step('s1', 'Offer', [SM('Good to see you again', cls='wb-k'), H('Welcome\nback.'), HTML('<i class="wb-rule"></i>'), P('You were looking at **{last_category|our new arrivals}**. Here is 10% off anything there, for the next 48 hours.'),
                              COUPON(code='BACK10', note=None), BTN('Back to {last_category|the shop}', act='url', href='{last_category_url}')])
    doc = {'format': 'modal', 'width': 560, 'mobile': {'format': 'sheet'}, 'fonts': ['Gloock', 'Inter'],
           'theme': {'bg': '#1C2B2A', 'ink': '#F2EAD3', 'accent': '#D9A441', 'accentInk': '#1C2B2A', 'line': '#D9A441', 'radius': 0, 'fh': 'Gloock', 'fb': 'Inter', 'overlay': 'rgba(12,20,19,.6)'},
           'steps': [s1]}
    css = r'''
.psx-t-welcome-back .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.45);text-align:center}
.psx-t-welcome-back .psx-col{padding:40px 48px 34px;align-items:center;gap:14px}
.psx-t-welcome-back .wb-k{color:var(--psx-accent);font-weight:500;font-size:13px;opacity:1}
.psx-t-welcome-back .psx-h{font:400 72px/.95 var(--psx-fh);letter-spacing:-.02em}
.psx-t-welcome-back .wb-rule{display:block;width:260px;height:1px;background:linear-gradient(90deg,transparent,#D9A441 15%,#D9A441 85%,transparent)}
.psx-t-welcome-back .psx-p{max-width:380px;color:#D7D0BB;line-height:1.6}
.psx-t-welcome-back .psx-p strong{color:#F2EAD3}
.psx-t-welcome-back .psx-coupon{border-style:solid;border-color:var(--psx-accent);border-width:1px;border-radius:0}
.psx-t-welcome-back .psx-copy{border-left:1px solid var(--psx-accent);color:var(--psx-accent)}
.psx-t-welcome-back .psx-btn{border-radius:0;font-weight:600}
.psx-t-welcome-back.psx-mobile .psx-col{padding:28px 22px 24px}
.psx-t-welcome-back.psx-mobile .psx-h{font-size:54px}
.psx-t-welcome-back.psx-mobile .psx-coupon,.psx-t-welcome-back.psx-mobile .psx-btn{align-self:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=4), 'close': CLOSE(), 'frequency': FREQ(days=14), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': FIXED('BACK10'),
          'targeting': {'groups': [{'rules': [{'type': 'visit', 'value': 'returning'}]}]}}
    return tpl('16', 'welcome-back', 'Welcome Back', 'discount', 'Modal, returning visitors', ['discount', 'returning', 'luxury'], doc, st, css)


def t17():
    CUR['slug'] = 'spend-ladder'
    s1 = step('s1', 'Ladder', [H('The more you add,\nthe more you save.'), P('Your cart is **{cart_total}**. Climb a step for a bigger discount, applied at checkout.'),
                               LADDER([{'min': 50, 'pct': 10}, {'min': 100, 'pct': 15}, {'min': 150, 'pct': 20}]),
                               ROW([BTN('Keep shopping', act='close', cls='sl-main'), BTN('Go to checkout', act='url', href='{checkout_url}', variant='secondary')])])
    doc = {'format': 'modal', 'width': 560, 'mobile': {'format': 'sheet'}, 'fonts': ['Sora'],
           'theme': {'bg': '#FFFFFF', 'ink': '#14213D', 'accent': '#FCA311', 'accentInk': '#14213D', 'line': '#D5DBE7', 'radius': 20, 'fh': 'Sora', 'fb': 'Sora', 'overlay': 'rgba(20,33,61,.55)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-spend-ladder .psx-col{padding:30px 32px 26px;gap:12px}
.psx-t-spend-ladder .psx-h{font:800 30px/1.1 var(--psx-fh);letter-spacing:-.02em}
.psx-t-spend-ladder .psx-p{color:#4A5672}
.psx-t-spend-ladder .psx-p strong{color:var(--psx-ink)}
.psx-t-spend-ladder .psx-ladder{border-bottom:3px solid var(--psx-ink);margin-top:6px}
.psx-t-spend-ladder .psx-step-t{border-radius:12px 12px 0 0;background:#E8ECF4}
.psx-t-spend-ladder .psx-step-t b{font-weight:800}
.psx-t-spend-ladder .psx-step-t small{font-size:12px}
.psx-t-spend-ladder .psx-step-t.psx-done{background:var(--psx-ink);color:#fff}
.psx-t-spend-ladder .psx-step-t.psx-next{background:var(--psx-accent);color:var(--psx-ink)}
.psx-t-spend-ladder .psx-rowb{margin-top:8px}
.psx-t-spend-ladder .sl-main{flex:1;background:var(--psx-ink);color:#fff;border-radius:12px}
.psx-t-spend-ladder .psx-btn-secondary{border-radius:12px;box-shadow:inset 0 0 0 1.5px #D5DBE7}
.psx-t-spend-ladder .psx-x{background:#F0F3F8;top:16px;right:16px}
.psx-t-spend-ladder.psx-mobile .psx-col{padding:22px 18px 20px}
.psx-t-spend-ladder.psx-mobile .psx-h{font-size:23px}
.psx-t-spend-ladder.psx-mobile .psx-ladder{grid-template-columns:1fr;border:0}
.psx-t-spend-ladder.psx-mobile .psx-step-t{min-height:0;flex-direction:row;justify-content:space-between;align-items:center;border-radius:12px}
.psx-t-spend-ladder.psx-mobile .psx-step-t b{font-size:16px}
.psx-t-spend-ladder.psx-mobile .psx-rowb{flex-direction:column;align-items:stretch}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=3), 'close': CLOSE(), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON,
          'targeting': {'groups': [{'rules': [{'type': 'page', 'op': 'show_on', 'pages': ['cart'], 'categories': [], 'products': [], 'cms': []}]}]}}
    return tpl('17', 'spend-ladder', 'Spend Ladder', 'discount', 'Modal, cart page', ['discount', 'tiers', 'cart'], doc, st, css)


def t18():
    CUR['slug'] = 'mystery-envelope'
    env = ('<svg viewBox="0 0 440 270" width="100%" height="100%"><rect width="440" height="270" fill="#EADBC8"/><path d="M0 0 L220 150 L440 0 V270 H0z" fill="#E3D1B9"/>'
           '<path d="M0 0 H440 L220 160z" fill="#DCC8AE"/></svg>')
    s1 = step('s1', 'Sealed', [H('Something came for you.'), PICK('envelope', [{'svg': env, 't': L(''), 'aria': L('Break the seal and open the envelope')}], label='Envelope'),
                               SM('Inside: a discount between 5% and 20%. One envelope per visitor.', cls='me-n')])
    s2 = step('s2', 'Claim', [SM("It's yours", cls='me-k'), H('{prize}', cls='me-prize'), P('Leave your email to keep it.'), FORM(btn='Keep my discount', label='Email', hideLabel=True, consentText='Send me the newsletter as well', nxt='s3')])
    s3 = step('s3', 'Code', [SM("It's yours", cls='me-k'), H('{prize}', cls='me-prize'), COUPON(note='Valid 7 days, one use.'), BTN('Copy and shop', act='apply', full=True)])
    doc = {'format': 'modal', 'width': 520, 'mobile': {'format': 'same'}, 'fonts': ['Libre Baskerville'],
           'theme': {'bg': 'transparent', 'ink': '#F7EDE2', 'accent': '#A4161A', 'accentInk': '#F7EDE2', 'field': '#FFFDF8', 'fieldInk': '#3D2B1F', 'line': '#3D2B1F', 'radius': 0, 'fh': 'Libre Baskerville', 'fb': 'Libre Baskerville', 'overlay': 'rgba(40,26,18,.72)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, s2, s3]}
    css = r'''
.psx-t-mystery-envelope .psx-box{background:transparent;box-shadow:none;overflow:visible;text-align:center}
.psx-t-mystery-envelope .psx-col{align-items:center;gap:16px;padding:10px}
.psx-t-mystery-envelope .psx-h{font:italic 400 34px/1.1 var(--psx-fh)}
.psx-t-mystery-envelope .psx-pick-i{position:relative;width:440px;max-width:100%;aspect-ratio:440/270;box-shadow:0 20px 44px rgba(0,0,0,.4)}
.psx-t-mystery-envelope .psx-pick-art{display:block;width:100%;height:100%}
.psx-t-mystery-envelope .psx-pick-i::after{content:"open";position:absolute;left:50%;top:47%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:47% 53% 49% 51%/52% 46% 54% 48%;background:radial-gradient(circle at 40% 35%,#C2272D,#A4161A 60%,#7E0F13);color:#F3D9C6;font:italic 400 15px/76px var(--psx-fh);box-shadow:0 3px 6px rgba(0,0,0,.35),inset 0 0 0 6px rgba(0,0,0,.12)}
.psx-t-mystery-envelope .psx-pick-i:hover{transform:translateY(-4px)}
.psx-t-mystery-envelope .psx-chosen::after{transform:scale(.2);opacity:0;transition:all .5s}
.psx-t-mystery-envelope .psx-pick-t{display:none}
.psx-t-mystery-envelope .me-n{font-size:13.5px;color:#E6D3BF;opacity:1}
.psx-t-mystery-envelope .psx-step[data-step=s2] .psx-col,.psx-t-mystery-envelope .psx-step[data-step=s3] .psx-col{background:#FFFDF8;color:#3D2B1F;padding:26px 28px;box-shadow:0 20px 44px rgba(0,0,0,.4);max-width:420px;margin:0 auto}
.psx-t-mystery-envelope .me-k{font-style:italic;color:var(--psx-accent);opacity:1}
.psx-t-mystery-envelope .me-prize{font:700 46px/1 var(--psx-fh);font-style:normal}
.psx-t-mystery-envelope .psx-form{align-self:stretch}
.psx-t-mystery-envelope .psx-input{border:1px solid #3D2B1F;border-radius:0}
.psx-t-mystery-envelope .psx-btn{border-radius:0;font-weight:700}
.psx-t-mystery-envelope .psx-check{color:#3D2B1F}
.psx-t-mystery-envelope .psx-coupon{border-color:#3D2B1F;color:#3D2B1F;border-radius:0;align-self:stretch}
.psx-t-mystery-envelope .psx-x{top:-6px;right:-6px;border:1px solid rgba(247,237,226,.4);color:#F7EDE2}
.psx-t-mystery-envelope.psx-mobile .psx-h{font-size:26px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=10), 'close': CLOSE(), 'frequency': FREQ(mode='once'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': False},
          'coupon': NOCOUPON, 'game': {'type': 'pick', 'emailFirst': False, 'prizes': [prize('p5', '5% off', 40, value=5, days=7), prize('p10', '10% off', 35, value=10, days=7), prize('p15', '15% off', 20, value=15, days=7), prize('p20', '20% off', 5, value=20, days=7)]}}
    return tpl('18', 'mystery-envelope', 'Mystery Envelope', 'discount', 'Modal, click to open', ['discount', 'game', 'envelope', 'surprise'], doc, st, css)


def t19():
    CUR['slug'] = 'bundle-builder'
    s1 = step('s1', 'Bundle', [SM('Added to cart ✓', cls='bb-k'), H('Complete the set'), PRODUCT(source='bestseller', btn='Add it too', view=None), SM('Pairs well with what you just added.', cls='bb-n')])
    doc = {'format': 'slidein', 'position': 'tr', 'width': 340, 'mobile': {'format': 'same'}, 'fonts': ['Outfit'],
           'theme': {'bg': '#F5F7FA', 'ink': '#0F172A', 'accent': '#0E7490', 'accentInk': '#FFFFFF', 'line': '#E2E8F0', 'radius': 18, 'fh': 'Outfit', 'fb': 'Outfit'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-bundle-builder .psx-box{box-shadow:0 18px 40px rgba(15,23,42,.22),0 0 0 1px rgba(15,23,42,.06)}
.psx-t-bundle-builder .psx-col{padding:20px 20px 18px;gap:10px}
.psx-t-bundle-builder .bb-k{color:var(--psx-accent);font-weight:600;font-size:12.5px;opacity:1}
.psx-t-bundle-builder .psx-h{font:700 22px/1.2 var(--psx-fh)}
.psx-t-bundle-builder .psx-product{background:#fff;border-radius:12px;padding:10px;box-shadow:0 0 0 1px #E2E8F0;flex-direction:row;align-items:center;gap:12px}
.psx-t-bundle-builder .psx-product-img{width:92px;height:92px;flex:none;border-radius:8px;background:#E8EEF3;aspect-ratio:auto}
.psx-t-bundle-builder .psx-product-b{flex:1;display:flex;flex-direction:column;gap:2px}
.psx-t-bundle-builder .psx-product-n{font-size:14px;font-weight:500}
.psx-t-bundle-builder .psx-product-pr{font-size:16px}
.psx-t-bundle-builder .psx-btn{border-radius:12px;min-height:42px;font-weight:600;width:100%}
.psx-t-bundle-builder .bb-n{color:#475569;opacity:1}
.psx-t-bundle-builder .psx-x{background:#E2E8F0;top:14px;right:14px;width:32px;height:32px;font-size:16px}
.psx-t-bundle-builder.psx-mobile .psx-col{padding:16px}
'''
    st = {'triggers': TRIG(addcartOn=True), 'close': CLOSE(overlay=False, timeOn=True, timeSec=25), 'frequency': FREQ(mode='page', stopConvert=False, afterCloseOn=False), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('19', 'bundle-builder', 'Bundle Builder', 'discount', 'Slide-in, top right', ['upsell', 'cross-sell', 'product'], doc, st, css)


def t20():
    CUR['slug'] = 'first-order-gold'
    ring = '<div class="fg-ring"><span>{shop_initial}</span></div>'
    s1 = step('s1', 'Offer', [HTML('<div class="fg-ring"><span>✦</span></div>'), H('An introduction,\nwith our compliments.'), P('Your first order carries <span class="fg-off">15% OFF</span>. Join the list to receive it.'),
                              FORM(btn='Receive my invitation', label='Email address', hideLabel=True, ph='Email address', consent=False, nxt='s2'), SM('By joining you agree to receive our emails. Unsubscribe any time.', cls='fg-l')])
    s2 = step('s2', 'Code', [HTML('<div class="fg-ring"><span>✦</span></div>'), H('With our compliments.'), COUPON(note='Valid for 30 days on your first order.'), BTN('Begin shopping', act='apply', variant='secondary', full=True)])
    doc = {'format': 'modal', 'width': 480, 'mobile': {'format': 'sheet'}, 'fonts': ['Marcellus', 'Manrope'],
           'theme': {'bg': '#0E0E0E', 'ink': '#EDE6D6', 'accent': '#C9A54C', 'accentInk': '#0E0E0E', 'field': 'transparent', 'fieldInk': '#EDE6D6', 'line': '#5A5245', 'radius': 0, 'fh': 'Marcellus', 'fb': 'Manrope', 'overlay': 'rgba(0,0,0,.66)'},
           'steps': [s1, s2]}
    css = r'''
.psx-t-first-order-gold .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.6),inset 0 0 0 1px #2A2620;text-align:center}
.psx-t-first-order-gold .psx-col{padding:44px 52px 36px;align-items:stretch;gap:12px}
.psx-t-first-order-gold .fg-ring{width:78px;height:78px;margin:0 auto 8px;border-radius:50%;background:conic-gradient(from 210deg,#8A6E2F,#E8CD84,#A9883E,#F3DE9F,#8A6E2F);display:flex;align-items:center;justify-content:center}
.psx-t-first-order-gold .fg-ring span{width:68px;height:68px;border-radius:50%;background:#0E0E0E;display:flex;align-items:center;justify-content:center;font:400 28px var(--psx-fh);color:var(--psx-accent)}
.psx-t-first-order-gold .psx-h{font:400 32px/1.15 var(--psx-fh);letter-spacing:.01em}
.psx-t-first-order-gold .psx-p{color:#B9B2A2;line-height:1.6;margin-bottom:10px}
.psx-t-first-order-gold .fg-off{font-weight:600;font-size:13px;letter-spacing:.12em;color:var(--psx-accent)}
.psx-t-first-order-gold .psx-input{border:0;border-bottom:1px solid var(--psx-line);border-radius:0;text-align:center}
.psx-t-first-order-gold .psx-input:focus{box-shadow:none;border-bottom-color:var(--psx-accent)}
.psx-t-first-order-gold .psx-btn{background:transparent;color:var(--psx-accent);box-shadow:inset 0 0 0 1px var(--psx-accent);border-radius:0;font-weight:500;margin-top:8px}
.psx-t-first-order-gold .fg-l{color:#8C8577;font-size:11.5px;opacity:1}
.psx-t-first-order-gold .psx-coupon{border-style:solid;border-width:1px;border-color:var(--psx-accent);border-radius:0;color:var(--psx-accent)}
.psx-t-first-order-gold .psx-copy{border-left:1px solid var(--psx-accent)}
.psx-t-first-order-gold .psx-x{color:#8C8577}
.psx-t-first-order-gold.psx-mobile .psx-col{padding:34px 24px 26px}
.psx-t-first-order-gold.psx-mobile .psx-h{font-size:26px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=6), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': False, 'consentRequired': False}, 'coupon': GEN('GOLD-', 15, days=30),
          'targeting': {'groups': [{'rules': [{'type': 'visit', 'value': 'first'}]}]}}
    return tpl('20', 'first-order-gold', 'First Order Gold', 'discount', 'Modal, first-time visitors', ['discount', 'luxury', 'first order'], doc, st, css)


TEMPLATES = [t13, t14, t15, t16, t17, t18, t19, t20]
