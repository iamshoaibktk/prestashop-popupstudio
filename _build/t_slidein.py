from tpl_common import *


def t38():
    CUR['slug'] = 'shop-owner-note'
    av = '<div class="on-av"><span>MK</span></div>'
    s1 = step('s1', 'Note', [col([HTML(av)], cls='on-a', w='0 0 52px'), col([HTML('<div class="on-dots"><i></i><i></i><i></i></div>'), SM('Marie, who runs this shop', cls='on-who'),
                                                                          P("Hi! First time here? If you're not sure about sizing, reply and I'll help. Here's 10% off to say hello: **HELLO10**"),
                                                                          ROW([BTN('Ask Marie', act='url', href='/contact-us', cls='on-ask'), BTN('Copy code', act='copy', variant='secondary')])], cls='on-bub')])
    doc = {'format': 'slidein', 'position': 'bl', 'width': 400, 'mobile': {'format': 'same'}, 'fonts': ['Nunito Sans'],
           'theme': {'bg': 'transparent', 'ink': '#1C1C1E', 'accent': '#2F6FEB', 'accentInk': '#FFFFFF', 'line': '#D6DBE3', 'radius': 18, 'fh': 'Nunito Sans', 'fb': 'Nunito Sans'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-shop-owner-note .psx-box{background:transparent;box-shadow:none;overflow:visible}
.psx-t-shop-owner-note .psx-cols{align-items:flex-end;gap:10px}
.psx-t-shop-owner-note .on-av{width:44px;height:44px;border-radius:50%;background:#D9DEE6;box-shadow:0 0 0 3px #fff,0 4px 10px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;font:800 16px var(--psx-fh);color:#5A6170;position:relative}
.psx-t-shop-owner-note .on-av::after{content:"";position:absolute;right:0;bottom:1px;width:11px;height:11px;border-radius:50%;background:#2DBE6C;box-shadow:0 0 0 2px #fff}
.psx-t-shop-owner-note .on-bub{background:#fff;border-radius:18px 18px 18px 4px;box-shadow:0 10px 30px rgba(0,0,0,.16),0 0 0 1px rgba(0,0,0,.05);padding:14px 16px;gap:6px;position:relative}
.psx-t-shop-owner-note .on-dots{display:inline-flex;gap:4px;padding:8px 10px;border-radius:12px;background:#F0F2F5;align-self:flex-start;animation:psx-dots 1.4s ease-in 1 forwards}
.psx-t-shop-owner-note .on-dots i{width:6px;height:6px;border-radius:50%;background:#9AA1AE}
@keyframes psx-dots{0%,80%{opacity:1;max-height:30px}100%{opacity:0;max-height:0;padding:0}}
.psx-t-shop-owner-note .on-who{font-weight:700;font-size:12.5px;color:#5A6170;opacity:1}
.psx-t-shop-owner-note .psx-p{font-size:15px;line-height:1.5}
.psx-t-shop-owner-note .psx-p strong{font-family:ui-monospace,Menlo,monospace;color:var(--psx-accent)}
.psx-t-shop-owner-note .psx-rowb{gap:8px;margin-top:6px}
.psx-t-shop-owner-note .psx-btn{border-radius:999px;min-height:40px;font-weight:700;font-size:14px}
.psx-t-shop-owner-note .psx-btn-secondary{box-shadow:inset 0 0 0 1.5px #D6DBE3;color:var(--psx-ink)}
.psx-t-shop-owner-note .psx-x{top:6px;right:6px;width:30px;height:30px;font-size:16px;color:#5A6170}
.psx-t-shop-owner-note.psx-mobile .on-av{width:38px;height:38px;font-size:14px}
.psx-t-shop-owner-note.psx-mobile .psx-cols{flex-direction:row}
.psx-t-shop-owner-note.psx-mobile .on-a{flex:0 0 44px}
.psx-t-shop-owner-note.psx-mobile .psx-p{font-size:14px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=15), 'close': CLOSE(overlay=False), 'frequency': FREQ(), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': FIXED('HELLO10'),
          'targeting': {'groups': [{'rules': [{'type': 'visit', 'value': 'first'}]}]}}
    return tpl('38', 'shop-owner-note', 'Shop Owner Note', 'slidein', 'Slide-in, chat bubble', ['slide-in', 'chat', 'personal'], doc, st, css)


def t39():
    CUR['slug'] = 'corner-product'
    s1 = step('s1', 'Product', [BADGE('Bestseller', cls='cp-badge'), PRODUCT(source='bestseller', btn='Add to cart', view='View')])
    doc = {'format': 'slidein', 'position': 'br', 'width': 300, 'mobile': {'format': 'same'}, 'fonts': ['Albert Sans'],
           'theme': {'bg': '#FFFFFF', 'ink': '#18181B', 'accent': '#18181B', 'accentInk': '#FFFFFF', 'line': '#D4D4D8', 'radius': 0, 'fh': 'Albert Sans', 'fb': 'Albert Sans'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-corner-product .psx-box{border:1px solid #E4E4E7;box-shadow:0 16px 36px rgba(24,24,27,.16)}
.psx-t-corner-product .psx-col{gap:0;position:relative}
.psx-t-corner-product .cp-badge{position:absolute;left:10px;top:10px;z-index:2;background:var(--psx-ink);color:#fff;padding:3px 8px;font-size:11px}
.psx-t-corner-product .psx-product-img{border-radius:0;aspect-ratio:auto;height:170px;background:#F4F4F5}
.psx-t-corner-product .psx-product-b{padding:14px 16px 16px;display:flex;flex-direction:column;gap:4px}
.psx-t-corner-product .psx-product-n{font-size:16px}
.psx-t-corner-product .psx-product-pr{font-size:16px}
.psx-t-corner-product .psx-small{color:#52525B;opacity:1;margin-bottom:8px}
.psx-t-corner-product .psx-btns{flex-wrap:nowrap}
.psx-t-corner-product .psx-btn{border-radius:0;min-height:44px;font-weight:600}
.psx-t-corner-product .psx-btn-primary{flex:1}
.psx-t-corner-product .psx-btn-secondary{box-shadow:inset 0 0 0 1px #D4D4D8;font-weight:500}
.psx-t-corner-product .psx-x{top:8px;right:8px;width:32px;height:32px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.15);font-size:16px}
.psx-t-corner-product.psx-mobile .psx-product{flex-direction:row;align-items:center;padding:10px;gap:12px}
.psx-t-corner-product.psx-mobile .psx-product-img{width:76px;height:76px;flex:none}
.psx-t-corner-product.psx-mobile .psx-product-b{padding:0;flex:1}
.psx-t-corner-product.psx-mobile .psx-btn-secondary,.psx-t-corner-product.psx-mobile .cp-badge{display:none}
'''
    st = {'triggers': TRIG(scrollOn=True, scrollVal=50), 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='visit'), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON,
          'targeting': {'groups': [{'rules': [{'type': 'page', 'op': 'show_on', 'pages': ['category', 'home'], 'categories': [], 'products': [], 'cms': []}]}]}}
    return tpl('39', 'corner-product', 'Corner Product', 'slidein', 'Slide-in, product', ['slide-in', 'product', 'upsell'], doc, st, css)


def t40():
    CUR['slug'] = 'follow-along'
    grid = '<div class="fa-grid"><i style="background:#E9C3A8"></i><i style="background:#C2410C"></i><i style="background:#F2DCCB"></i><i style="background:#8C5A3C"></i><i style="background:#F6E7D9"></i><i style="background:#D88C5A"></i></div>'
    s1 = step('s1', 'Follow', [HTML(grid), ROW([HTML('<span class="fa-av"><span>YS</span></span>'), H('@yourshop\n<small>Behind the scenes and first looks</small>')], cls='fa-who'),
                               SOCIAL([('Follow us', 'https://instagram.com/')], cls='fa-btn')])
    doc = {'format': 'slidein', 'position': 'br', 'width': 310, 'mobile': {'format': 'same'}, 'fonts': ['Epilogue'],
           'theme': {'bg': '#FFF7F0', 'ink': '#2C1A12', 'accent': '#C2410C', 'accentInk': '#FFF7F0', 'line': '#E9C3A8', 'radius': 16, 'fh': 'Epilogue', 'fb': 'Epilogue'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1]}
    css = r'''
.psx-t-follow-along .psx-box{box-shadow:0 16px 36px rgba(44,26,18,.2),0 0 0 1px rgba(44,26,18,.06)}
.psx-t-follow-along .psx-col{padding:16px;gap:12px}
.psx-t-follow-along .fa-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;border-radius:10px;overflow:hidden}
.psx-t-follow-along .fa-grid i{aspect-ratio:1;display:block}
.psx-t-follow-along .fa-who{flex-wrap:nowrap;gap:10px}
.psx-t-follow-along .fa-av{width:38px;height:38px;border-radius:50%;background:conic-gradient(#C2410C,#E9A36C,#C2410C);display:flex;align-items:center;justify-content:center;flex:none}
.psx-t-follow-along .fa-av span{width:32px;height:32px;border-radius:50%;background:#FFF7F0;display:flex;align-items:center;justify-content:center;font:800 13px var(--psx-fh)}
.psx-t-follow-along .psx-h{font:800 16px/1.2 var(--psx-fh)}
.psx-t-follow-along .psx-h small{display:block;font:400 12.5px var(--psx-fb);color:#6E5444}
.psx-t-follow-along .psx-social .psx-btn{flex:1;white-space:nowrap;border-radius:999px;min-height:44px;font-weight:700}
.psx-t-follow-along .psx-x{top:22px;right:22px;width:30px;height:30px;background:#FFF7F0;font-size:15px}
.psx-t-follow-along.psx-mobile .psx-step .psx-col{display:grid;grid-template-columns:96px 1fr;gap:6px 12px;align-items:center;padding:12px}
.psx-t-follow-along.psx-mobile .fa-grid{grid-row:span 2;gap:2px}
.psx-t-follow-along.psx-mobile .fa-av{display:none}
.psx-t-follow-along.psx-mobile .psx-x{top:6px;right:6px}
'''
    st = {'triggers': TRIG(scrollOn=True, scrollVal=60), 'close': CLOSE(overlay=False), 'frequency': FREQ(days=30), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON}
    return tpl('40', 'follow-along', 'Follow Along', 'slidein', 'Slide-in, social', ['slide-in', 'social', 'instagram'], doc, st, css)


def t41():
    CUR['slug'] = 'rate-us'
    s1 = step('s1', 'Rate', [H('How was shopping with us?'), P('One tap. It helps a small shop a lot.'), STARS('rating', low='low', high='high', cut=3)])
    s_low = step('low', 'Low score', [H('Sorry about that. What went wrong?'), TA('Your message', 'Tell us, we read every message.', name='feedback', cls='ru-ta'), BTN('Send to the team', act='next', step='thanks', full=True)])
    s_high = step('high', 'High score', [H('Thank you!'), P('Would you share it in a review? It takes a minute.'), BTN('Write a review', act='url', href='/', full=True), LINK('Maybe later')])
    s_t = step('thanks', 'Thanks', [H('Thanks for telling us.'), P('Someone from the team will read it today.'), LINK('Close')])
    doc = {'format': 'slidein', 'position': 'br', 'width': 330, 'mobile': {'format': 'same'}, 'fonts': ['Lexend'],
           'theme': {'bg': '#FFFFFF', 'ink': '#111827', 'accent': '#F59E0B', 'accentInk': '#111827', 'field': '#FFFFFF', 'line': '#D1D5DB', 'radius': 16, 'fh': 'Lexend', 'fb': 'Lexend'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, s_low, s_high, s_t]}
    css = r'''
.psx-t-rate-us .psx-box{box-shadow:0 16px 36px rgba(17,24,39,.18),0 0 0 1px rgba(17,24,39,.06)}
.psx-t-rate-us .psx-col{padding:20px 20px 18px;gap:6px}
.psx-t-rate-us .psx-h{font:600 18px/1.3 var(--psx-fh);padding-right:28px}
.psx-t-rate-us .psx-p{font-size:13px;color:#4B5563;margin-bottom:6px}
.psx-t-rate-us .psx-btn{background:#111827;color:#fff;border-radius:10px;font-weight:600}
.psx-t-rate-us .psx-input{border-radius:10px}
.psx-t-rate-us .psx-x{top:12px;right:12px;width:32px;height:32px;background:#F3F4F6;font-size:15px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=3), 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='days', days=60), 'form': {'list': 'leads', 'consent': False, 'consentRequired': False}, 'coupon': NOCOUPON,
          'targeting': {'groups': [{'rules': [{'type': 'page', 'op': 'show_on', 'pages': ['confirmation'], 'categories': [], 'products': [], 'cms': []}]}]}}
    return tpl('41', 'rate-us', 'Rate Us', 'slidein', 'Slide-in, rating', ['slide-in', 'rating', 'feedback', 'reviews'], doc, st, css)


def t42():
    CUR['slug'] = 'teaser-tab'
    s1 = step('s1', 'Panel', [H('10% off. Just say hi.'), P('Leave your email and the code is on its way.'), FORM(btn='Go', label='Email', hideLabel=True, ph='you@mail.com', layout='inline', consent=False, nxt='s2')])
    s2 = step('s2', 'Code', [H('Hi! Here it is.'), COUPON(note=None)])
    doc = {'format': 'drawer', 'position': 'left', 'width': 300, 'overlay': False, 'mobile': {'format': 'sheet'}, 'fonts': ['Space Grotesk'],
           'theme': {'bg': '#FF6B35', 'ink': '#FFFFFF', 'accent': '#1B1B1B', 'accentInk': '#FFFFFF', 'field': '#FFFFFF', 'fieldInk': '#1B1B1B', 'line': '#FFFFFF', 'radius': 16, 'fh': 'Space Grotesk', 'fb': 'Space Grotesk'},
           'closeBtn': {'look': 'circle', 'label': L('←')}, 'steps': [s1, s2]}
    css = r'''
.psx-t-teaser-tab.psx-f-drawer .psx-box{top:auto;bottom:auto;top:40%;border-radius:0 16px 16px 0;box-shadow:6px 10px 28px rgba(0,0,0,.22);max-height:none}
.psx-t-teaser-tab .psx-col{padding:20px 22px 20px 20px;gap:8px}
.psx-t-teaser-tab .psx-h{font:700 26px/1.05 var(--psx-fh);padding-right:30px}
.psx-t-teaser-tab .psx-p{font-weight:500;font-size:13.5px;color:#FFE5DA}
.psx-t-teaser-tab .psx-input{border:0;border-radius:8px;min-height:44px}
.psx-t-teaser-tab .psx-btn{border-radius:8px;min-height:44px;font-weight:700}
.psx-t-teaser-tab .psx-coupon{border-color:#fff;border-radius:8px}
.psx-t-teaser-tab .psx-x{top:10px;right:10px;width:30px;height:30px;background:rgba(255,255,255,.2);font-size:15px}
.psx-tab.psx-t-teaser-tab{background:#FF6B35;color:#fff;font:700 16px "Space Grotesk",sans-serif}
.psx-t-teaser-tab.psx-mobile .psx-col{padding:18px}
.psx-t-teaser-tab.psx-mobile .psx-row{flex-direction:column}
'''
    st = {'triggers': TRIG(clickOn=True, clickSel='.psx-open-teaser'), 'close': CLOSE(overlay=False), 'frequency': FREQ(mode='page', stopConvert=True, afterCloseOn=False),
          'teaser': {'on': True, 'text': L('Get 10% off ↑'), 'edge': 'left', 'life': 'always'}, 'form': {'list': 'newsletter', 'consent': False, 'consentRequired': False}, 'coupon': GEN('HI10-'), 'startClosed': True}
    return tpl('42', 'teaser-tab', 'Teaser Tab', 'slidein', 'Teaser tab that opens a panel', ['teaser', 'tab', 'slide-in', 'newsletter'], doc, st, css)


TEMPLATES = [t38, t39, t40, t41, t42]
