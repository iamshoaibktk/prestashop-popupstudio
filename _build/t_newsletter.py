from tpl_common import *


def t01():
    CUR['slug'] = 'ledger'
    media = col([IMG(placeholder='halftone', caption='Fig. 1. Your product photo')], cls='lg-media', w='0 0 230px')
    mast = ROW([SM('The Shop Gazette', cls='lg-title'), SM('No. 1 · Free', cls='lg-no')], cls='lg-mast')
    s1 = step('s1', 'Offer', [media, col([mast, H('Ten percent off your first order.'), P('One letter a month: new arrivals, restocks and the odd essay. Leave your address and the code is yours.'),
                                         FORM(btn='Subscribe →', label='Email address', ph='your@email.com', layout='inline', consentText='I agree to receive the newsletter. Unsubscribe any time.', nxt='s2')], cls='lg-body')])
    s2 = step('s2', 'Thanks', [col([IMG(placeholder='halftone')], cls='lg-media', w='0 0 230px'), col([ROW([SM('The Shop Gazette', cls='lg-title'), SM('No. 1 · Free', cls='lg-no')], cls='lg-mast'), H('Done. Here is your ten percent.'), P('We also sent it to {email}.'), COUPON(),
                                                                                                   ROW([BTN('Apply to my cart', act='apply'), LINK('Continue shopping')])], cls='lg-body')])
    doc = {'format': 'modal', 'width': 640, 'position': 'center', 'mobile': {'format': 'sheet'}, 'fonts': ['Playfair Display', 'Libre Franklin', 'IBM Plex Mono'],
           'theme': {'bg': '#F4F1EA', 'ink': '#1A1A1A', 'accent': '#1A1A1A', 'accentInk': '#F4F1EA', 'line': '#1A1A1A', 'field': 'transparent', 'error': '#B3261E', 'radius': 0, 'fh': 'Playfair Display', 'fb': 'Libre Franklin', 'overlay': 'rgba(26,26,26,.55)'},
           'decor': [decor('<div class="lg-stamp">10%<br>off</div>', name='Stamp', right='-30px', top='150px', rot=-14, hideMobile=True)],
           'steps': [s1, s2]}
    css = r'''
.psx-t-ledger .psx-box{border-radius:0;box-shadow:0 20px 50px rgba(0,0,0,.35);overflow:visible}
.psx-t-ledger .psx-cols{gap:0}
.psx-t-ledger .lg-media{position:relative;background:#E9E4D8;border-right:1px solid var(--psx-ink);min-height:330px}
.psx-t-ledger .lg-media .psx-img{position:absolute;inset:14px 14px 34px}
.psx-t-ledger .psx-img-halftone{background:radial-gradient(circle,var(--psx-ink) 1.5px,transparent 1.8px) 0 0/6px 6px,radial-gradient(circle,var(--psx-ink) 1px,transparent 1.3px) 3px 3px/6px 6px;opacity:.8}
.psx-t-ledger .psx-img img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.15)}
.psx-t-ledger .psx-caption{position:absolute;left:0;right:0;bottom:-24px;font:italic 400 11px var(--psx-fb);opacity:1}
.psx-t-ledger .lg-body{padding:22px 26px 24px;gap:10px}
.psx-t-ledger .lg-mast{justify-content:space-between;align-items:baseline;border-bottom:3px double var(--psx-ink);padding:0 28px 6px 0}
.psx-t-ledger .lg-title{font:900 18px var(--psx-fh);opacity:1}
.psx-t-ledger .lg-no{font-size:11px;opacity:1}
.psx-t-ledger .psx-h{font:italic 700 32px/1.05 var(--psx-fh);margin-top:4px}
.psx-t-ledger .psx-p{font-size:13.5px;line-height:1.5}
.psx-t-ledger .psx-label{font-size:11.5px}
.psx-t-ledger .psx-row{gap:0;border-bottom:1.5px solid var(--psx-ink)}
.psx-t-ledger .psx-input{border:0;border-radius:0;padding:0;background:transparent;min-height:42px}
.psx-t-ledger .psx-input:focus{box-shadow:none}
.psx-t-ledger .psx-row:focus-within{outline:2px solid var(--psx-ink);outline-offset:4px}
.psx-t-ledger .psx-err .psx-row{border-bottom:2px solid var(--psx-error)}
.psx-t-ledger .psx-btn{border-radius:0;font-weight:600;font-size:13.5px;white-space:nowrap}
.psx-t-ledger .psx-box-ck{border-radius:0;border-color:var(--psx-ink)}
.psx-t-ledger .psx-check{font-size:11.5px}
.psx-t-ledger:has(.psx-step[data-step="s2"]:not([hidden])) .lg-stamp{opacity:0;transform:scale(.6)}
.psx-t-ledger .lg-stamp{transition:opacity .3s,transform .3s;width:86px;height:86px;border-radius:50%;border:2px solid #C8102E;color:#C8102E;display:flex;align-items:center;justify-content:center;text-align:center;font:900 20px/.95 var(--psx-fh);background:rgba(244,241,234,.6)}
.psx-t-ledger .psx-coupon{border-radius:0;border-color:var(--psx-ink)}
.psx-t-ledger .psx-code{font-family:"IBM Plex Mono",monospace;font-weight:500}
.psx-t-ledger .psx-copy{border-color:var(--psx-ink)}
.psx-t-ledger .psx-x{border-radius:0;top:6px;right:6px}
.psx-t-ledger.psx-mobile .psx-box{border-top:1px solid var(--psx-ink)}
.psx-t-ledger.psx-mobile .psx-cols{flex-direction:column}
.psx-t-ledger.psx-mobile .lg-media{min-height:90px;border-right:0;border-bottom:1px solid var(--psx-ink)}
.psx-t-ledger.psx-mobile .lg-media .psx-img{inset:10px 14px}
.psx-t-ledger.psx-mobile .psx-caption{display:none}
.psx-t-ledger.psx-mobile .lg-body{padding:16px 18px 22px}
.psx-t-ledger.psx-mobile .psx-h{font-size:26px}
.psx-t-ledger.psx-mobile .psx-row{flex-direction:column;border:0;gap:10px}
.psx-t-ledger.psx-mobile .psx-input{border-bottom:1.5px solid var(--psx-ink)}
.psx-t-ledger.psx-mobile .psx-btn{min-height:48px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=8, exitOn=True), 'close': CLOSE(lastOn=False), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('WELCOME-'), 'teaser': {'on': True, 'text': L('Get 10%'), 'edge': 'left', 'life': 'visit'}}
    return tpl('01', 'ledger', 'Ledger', 'newsletter', 'Modal, split image', ['newsletter', 'newspaper', 'editorial'], doc, st, css)


def t02():
    CUR['slug'] = 'pebble'
    blobs = '<svg viewBox="0 0 520 460" width="100%" height="100%" preserveAspectRatio="none"><path d="M40 70c30-50 120-60 150-10s-20 90-70 95S10 120 40 70z" fill="#CFE0CF"/><path d="M400 20c50-10 110 30 100 80s-70 60-110 40-40-110 10-120z" fill="#F2C9B1"/><path d="M380 380c40-30 120-10 120 40s-80 60-120 40-30-50 0-80z" fill="#CFE0CF"/><path d="M30 360c20-20 70-20 80 10s-30 50-60 45-40-35-20-55z" fill="#B9D1BA"/></svg>'
    s1 = step('s1', 'Offer', [H('Stay in touch,\nsave 10%'), P('Small news, slow letters, and a welcome code for your first order.'), FORM(btn='Count me in', label='Email', hideLabel=True, ph='Your email', consentText='Yes, send me the newsletter', nxt='s2')])
    s2 = step('s2', 'Thanks', [H('Welcome aboard!'), P('Here is your code. It also waits in your inbox.'), COUPON(), BTN('Shop with 10% off', act='apply', full=True)])
    doc = {'format': 'modal', 'width': 460, 'mobile': {'format': 'same'}, 'fonts': ['Nunito'],
           'theme': {'bg': '#E6EEE6', 'ink': '#1F3A2E', 'accent': '#E9A27C', 'accentInk': '#2A1A10', 'field': '#ffffff', 'line': '#ffffff', 'radius': 34, 'fh': 'Nunito', 'fb': 'Nunito', 'overlay': 'rgba(31,58,46,.5)'},
           'decor': [decor(blobs, name='Pebbles', left='-30px', top='-20px', width='calc(100% + 60px)', height='calc(100% + 40px)')], 'closeBtn': {'look': 'circle'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-pebble .psx-box{text-align:center;overflow:hidden;box-shadow:0 20px 44px rgba(31,58,46,.3)}
.psx-t-pebble .psx-col{padding:46px 44px 34px;gap:12px;align-items:stretch}
.psx-t-pebble .psx-h{font:900 34px/1.1 var(--psx-fh)}
.psx-t-pebble .psx-p{font-weight:500;color:#3B5A4C}
.psx-t-pebble .psx-input{border:0;border-radius:999px;text-align:center;font-weight:600;min-height:52px}
.psx-t-pebble .psx-btn{min-height:54px;border-radius:58% 42% 55% 45%/60% 55% 45% 40%;font-weight:900;font-size:16px}
.psx-t-pebble .psx-check{justify-content:center;font-weight:600;color:#3B5A4C}
.psx-t-pebble .psx-box-ck{border-radius:50%;border:2px solid var(--psx-ink)}
.psx-t-pebble .psx-x{background:#fff;top:16px;right:18px}
.psx-t-pebble .psx-coupon{border-radius:999px;background:#fff;border-style:solid;border-color:#CFE0CF}
.psx-t-pebble .psx-copy{border-left:0;background:var(--psx-accent);color:var(--psx-accentInk);border-radius:999px;margin:4px}
.psx-t-pebble.psx-mobile .psx-col{padding:40px 22px 26px}
.psx-t-pebble.psx-mobile .psx-h{font-size:28px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=10), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('HELLO-')}
    return tpl('02', 'pebble', 'Pebble', 'newsletter', 'Modal, centre', ['newsletter', 'soft', 'rounded'], doc, st, css)


def t03():
    CUR['slug'] = 'neon-night'
    left = col([SM('issue 003 · members hear about drops first', cls='nn-meta'), H('<span class="nn-a">Ten</span>\npercent\noff\n<span class="nn-o">tonight</span>', cls='nn-h')], cls='nn-left', w='1.25')
    right = col([P('Drop your email. The code lands in your inbox before the kettle boils.'), FORM(btn='Send it', label='email', ph='you@domain.com', consentText='Yes, email me. I can unsubscribe in one click.', nxt='s2')], cls='nn-right')
    s1 = step('s1', 'Offer', [left, right])
    s2 = step('s2', 'Thanks', [col([SM('issue 003', cls='nn-meta'), H('<span class="nn-a">You\'re</span>\nin.', cls='nn-h'), P('Your code, valid for two weeks:'), COUPON(), BTN('Use it now', act='apply')])])
    doc = {'format': 'fullscreen', 'mobile': {'format': 'same'}, 'fonts': ['Anton', 'Space Mono'],
           'theme': {'bg': '#0B0B0C', 'ink': '#F5F5F0', 'accent': '#C6FF3D', 'accentInk': '#0B0B0C', 'field': 'transparent', 'line': '#C6FF3D', 'radius': 0, 'fh': 'Anton', 'fb': 'Space Mono', 'error': '#FF6B6B'},
           'closeBtn': {'look': 'text', 'label': L('esc ×')}, 'steps': [s1, s2]}
    css = r'''
.psx-t-neon-night .psx-box{background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.2px);background-size:3px 3px;display:flex;align-items:center;justify-content:center}
.psx-t-neon-night .psx-step{width:100%;max-width:1100px;padding:56px 64px}
.psx-t-neon-night .psx-cols{gap:56px}
.psx-t-neon-night .nn-left{justify-content:space-between;gap:28px}
.psx-t-neon-night .nn-right{justify-content:flex-end;gap:16px}
.psx-t-neon-night .nn-meta{font-size:12px;color:#9A9A92;opacity:1}
.psx-t-neon-night .nn-h,.psx-t-neon-night .psx-h{font:400 clamp(64px,10vw,150px)/.86 var(--psx-fh);text-transform:uppercase;letter-spacing:-.01em}
.psx-t-neon-night .nn-a{color:var(--psx-accent)}
.psx-t-neon-night .nn-o{-webkit-text-stroke:1.5px var(--psx-ink);color:transparent}
.psx-t-neon-night .psx-p{font-size:14px;line-height:1.6;color:#D9D9D2}
.psx-t-neon-night .psx-label{font-weight:400;color:#9A9A92}
.psx-t-neon-night .psx-row{border-bottom:2px solid var(--psx-accent);align-items:center}
.psx-t-neon-night .psx-row::before{content:">";color:var(--psx-accent);font-weight:700;margin-right:6px}
.psx-t-neon-night .psx-input{border:0;padding:0;background:transparent;font-family:var(--psx-fb);color:var(--psx-ink)}
.psx-t-neon-night .psx-input:focus{box-shadow:none}
.psx-t-neon-night .psx-btn{min-height:56px;font:400 24px var(--psx-fh);text-transform:uppercase;letter-spacing:.02em;border-radius:0}
.psx-t-neon-night .psx-check{color:#B8B8B0;font-size:11.5px}
.psx-t-neon-night .psx-box-ck{border-radius:0;border-color:var(--psx-accent);background:transparent}
.psx-t-neon-night .psx-x{width:auto;padding:0 10px;height:30px;border:1px solid #3A3A3A;border-radius:0;font:700 12px var(--psx-fb);top:22px;right:26px}
.psx-t-neon-night .psx-coupon{border-color:var(--psx-accent);border-radius:0}
.psx-t-neon-night .psx-code{font-family:var(--psx-fb)}
.psx-t-neon-night.psx-mobile .psx-step{padding:64px 22px 26px}
.psx-t-neon-night.psx-mobile .psx-cols{gap:18px}
.psx-t-neon-night.psx-mobile .nn-h{font-size:74px}
'''
    st = {'triggers': TRIG(pagesOn=True, pagesN=2), 'close': CLOSE(overlay=False), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('NIGHT-')}
    return tpl('03', 'neon-night', 'Neon Night', 'newsletter', 'Full screen', ['newsletter', 'streetwear', 'bold', 'dark'], doc, st, css)


def t04():
    CUR['slug'] = 'botanica'
    fern = '<svg viewBox="0 0 210 120" width="210" height="120"><path d="M8 112 C 60 90, 120 60, 202 8" fill="none" stroke="#2E7D4F" stroke-width="1.6" stroke-linecap="round"/><path d="M40 96c-6-14-4-26 4-34M40 96c12-6 22-6 32 0M66 82c-4-14 0-26 10-32M66 82c12-4 22-2 30 6M92 66c-2-14 4-24 14-28M92 66c12-2 22 2 28 10M118 50c0-12 6-22 16-24M118 50c10 0 20 4 24 12M144 34c2-10 8-17 16-18M144 34c8 2 15 6 18 13M168 21c3-7 8-11 14-11M168 21c6 2 10 5 12 10" fill="none" stroke="#2E7D4F" stroke-width="1.4" stroke-linecap="round"/></svg>'
    s1 = step('s1', 'Offer', [H('Hello, green thumb.'), P('Seasonal planting notes once a month, and 10% off your first pots and seeds.'), FORM(btn='Join the garden letter', label='Email', consentText="I'd like the letter. I can leave whenever I want.", nxt='s2')])
    s2 = step('s2', 'Thanks', [H('Planted!'), P('Your 10% code:'), COUPON(), LINK('Back to the shop')])
    doc = {'format': 'slidein', 'position': 'br', 'width': 360, 'mobile': {'format': 'same'}, 'fonts': ['Fraunces', 'Work Sans'],
           'theme': {'bg': '#EAF4EC', 'ink': '#173B2A', 'accent': '#173B2A', 'accentInk': '#EAF4EC', 'field': '#ffffff', 'line': '#8FB8A0', 'radius': 18, 'fh': 'Fraunces', 'fb': 'Work Sans'},
           'decor': [decor(fern, name='Fern', right='-30px', top='-14px')], 'closeBtn': {'look': 'circle'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-botanica .psx-box{box-shadow:0 18px 40px rgba(23,59,42,.22),0 0 0 1px rgba(23,59,42,.08);overflow:hidden}
.psx-t-botanica .psx-col{padding:66px 26px 22px;gap:10px}
.psx-t-botanica .psx-h{font:italic 600 30px/1.05 var(--psx-fh)}
.psx-t-botanica .psx-p{font-size:14px;color:#2C4E3D}
.psx-t-botanica .psx-input{border-radius:12px}
.psx-t-botanica .psx-btn{border-radius:999px}
.psx-t-botanica .psx-box-ck{border-radius:5px;border-color:#2E7D4F;background:#fff}
.psx-t-botanica .psx-check{font-size:12px;color:#2C4E3D}
.psx-t-botanica .psx-x{left:14px;right:auto;top:12px;background:#fff;box-shadow:inset 0 0 0 1px #BFD8C8;width:32px;height:32px;font-size:18px}
.psx-t-botanica .psx-coupon{border-color:#8FB8A0;background:#fff;border-radius:12px}
.psx-t-botanica.psx-mobile .psx-col{padding:52px 18px 18px}
.psx-t-botanica.psx-mobile .psx-h{font-size:25px}
.psx-t-botanica.psx-mobile .psx-dec svg{width:150px;height:86px}
'''
    st = {'triggers': TRIG(scrollOn=True, scrollVal=50), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('GARDEN-')}
    return tpl('04', 'botanica', 'Botanica', 'newsletter', 'Slide-in, bottom right', ['newsletter', 'garden', 'organic', 'slide-in'], doc, st, css)


def t05():
    CUR['slug'] = 'postcard'
    stamp = '<div class="pc-stamp"><div><b>10%</b><small>PAR AVION</small></div></div>'
    left = col([H('Greetings\nfrom the shop.'), P("Wish you were here. Write your address on the right and we'll mail you 10% off, plus a letter now and then."), SM('— the team', cls='pc-sign')], cls='pc-msg')
    right = col([HTML(stamp, cls='pc-stampw'), FORM(btn='Post it →', label='Address', ph='you@example.com', name=True, nameLabel='To', consentText='Yes, send me letters. I can stop them any time.', nxt='s2')], cls='pc-addr')
    s1 = step('s1', 'Offer', [left, right])
    s2 = step('s2', 'Thanks', [col([H('Posted!'), P('Your code arrives by email too. Here it is now:'), COUPON(), LINK('Back to the shop')], cls='pc-msg')])
    doc = {'format': 'modal', 'width': 620, 'mobile': {'format': 'same'}, 'fonts': ['DM Serif Display', 'Courier Prime'],
           'theme': {'bg': '#FBF7EF', 'ink': '#1E2A44', 'accent': '#1E2A44', 'accentInk': '#FBF7EF', 'field': 'transparent', 'line': '#1E2A44', 'radius': 0, 'fh': 'DM Serif Display', 'fb': 'Courier Prime', 'overlay': 'rgba(30,42,68,.55)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-postcard .psx-box{padding:10px;background:repeating-linear-gradient(135deg,#D1453B 0 14px,#FBF7EF 14px 24px,#1E2A44 24px 38px,#FBF7EF 38px 48px);box-shadow:0 20px 44px rgba(0,0,0,.35);overflow:visible;transform:translate(-50%,-50%) rotate(-1.2deg)}
.psx-t-postcard.psx-f-modal.psx-in .psx-box{transform:translate(-50%,-50%) rotate(-1.2deg)}
.psx-t-postcard .psx-step{background:var(--psx-bg)}
.psx-t-postcard .psx-cols{min-height:320px}
.psx-t-postcard .pc-msg{padding:28px 26px;gap:10px;border-right:1.5px solid rgba(30,42,68,.35)}
.psx-t-postcard .pc-addr{padding:22px 26px;gap:12px}
.psx-t-postcard .psx-h{font:italic 400 40px/1.02 var(--psx-fh)}
.psx-t-postcard .psx-p{font-size:14px;line-height:1.55}
.psx-t-postcard .pc-sign{margin-top:auto;font:italic 400 18px var(--psx-fh);color:#D1453B;opacity:1}
.psx-t-postcard .pc-stampw{display:flex;justify-content:flex-end}
.psx-t-postcard .pc-stamp{background:#FBF7EF;padding:6px;transform:rotate(4deg);-webkit-mask:radial-gradient(circle 4px,#0000 96%,#000) -5px -5px/12px 12px;mask:radial-gradient(circle 4px,#0000 96%,#000) -5px -5px/12px 12px}
.psx-t-postcard .pc-stamp>div{width:78px;height:92px;border:1.5px solid #D1453B;color:#D1453B;display:flex;flex-direction:column;align-items:center;justify-content:center}
.psx-t-postcard .pc-stamp b{font:400 34px/1 var(--psx-fh)}
.psx-t-postcard .pc-stamp small{font:700 11px var(--psx-fb)}
.psx-t-postcard .psx-label{font-weight:400;font-size:11.5px}
.psx-t-postcard .psx-input{border:0;border-bottom:1.5px solid var(--psx-ink);border-radius:0;padding:0 2px;min-height:38px;font-family:var(--psx-fb)}
.psx-t-postcard .psx-input:focus{box-shadow:none;background:rgba(209,69,59,.06)}
.psx-t-postcard .psx-btn{border-radius:0;font-weight:700}
.psx-t-postcard .psx-box-ck{border-radius:0;width:13px;height:13px;border-color:var(--psx-ink)}
.psx-t-postcard .psx-check{font-size:11.5px}
.psx-t-postcard .psx-x{top:-14px;right:-14px;background:#FBF7EF;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.psx-t-postcard.psx-mobile .psx-box{padding:8px;transform:translate(-50%,-50%)}
.psx-t-postcard.psx-mobile .pc-msg{border-right:0;padding:22px 18px 6px}
.psx-t-postcard.psx-mobile .pc-addr{padding:6px 18px 20px}
.psx-t-postcard.psx-mobile .psx-h{font-size:32px}
.psx-t-postcard.psx-mobile .pc-sign,.psx-t-postcard.psx-mobile .pc-stampw{display:none}
'''
    st = {'triggers': TRIG(exitOn=True), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('POST-')}
    return tpl('05', 'postcard', 'Postcard', 'newsletter', 'Modal, centre', ['newsletter', 'travel', 'vintage'], doc, st, css)


def t06():
    CUR['slug'] = 'swiss-grid'
    left = col([HTML('<div class="sg-sq"></div>', cls='sg-sqw'), SM('10', cls='sg-num')], cls='sg-left', w='0 0 42%')
    right = col([ROW([SM('Newsletter'), SM('Nº 01')], cls='sg-meta'), H('Percent off your first order.'), P('Monthly. Short. New products and the reason we made them.'),
                 FORM(btn='Subscribe', label='Email', ph='name@domain.com', layout='inline', consentText='I agree to receive the newsletter.', nxt='s2')], cls='sg-right')
    s1 = step('s1', 'Offer', [left, right])
    s2 = step('s2', 'Thanks', [col([HTML('<div class="sg-sq"></div>', cls='sg-sqw'), SM('✓', cls='sg-num')], cls='sg-left', w='0 0 42%'), col([ROW([SM('Newsletter'), SM('Nº 01')], cls='sg-meta'), H('Subscribed.'), P('Your code:'), COUPON(), BTN('Apply to cart', act='apply')], cls='sg-right')])
    doc = {'format': 'modal', 'width': 620, 'mobile': {'format': 'sheet'}, 'fonts': ['Inter Tight'],
           'theme': {'bg': '#FFFFFF', 'ink': '#111111', 'accent': '#111111', 'accentInk': '#FFFFFF', 'field': '#FFFFFF', 'line': '#111111', 'radius': 0, 'fh': 'Inter Tight', 'fb': 'Inter Tight', 'overlay': 'rgba(17,17,17,.6)'},
           'closeBtn': {'look': 'square'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-swiss-grid .psx-box{background-image:repeating-linear-gradient(90deg,transparent 0 calc(100%/12 - 1px),rgba(227,6,19,.09) calc(100%/12 - 1px) calc(100%/12))}
.psx-t-swiss-grid .psx-cols{min-height:380px}
.psx-t-swiss-grid .sg-left{padding:22px 0 14px 22px;justify-content:space-between}
.psx-t-swiss-grid .sg-sq{width:46px;height:46px;background:#E30613}
.psx-t-swiss-grid .sg-num{font:900 210px/.78 var(--psx-fh);letter-spacing:-.07em;opacity:1}
.psx-t-swiss-grid .sg-right{padding:22px 22px 22px 0;gap:10px;justify-content:space-between}
.psx-t-swiss-grid .sg-meta{justify-content:space-between;font-size:12px;padding-right:30px}
.psx-t-swiss-grid .sg-meta .psx-small{opacity:1}
.psx-t-swiss-grid .psx-h{font:700 34px/1.02 var(--psx-fh);letter-spacing:-.03em;margin-top:auto}
.psx-t-swiss-grid .psx-p{font-size:14px;color:#333}
.psx-t-swiss-grid .psx-row{gap:0}
.psx-t-swiss-grid .psx-input{border:2px solid var(--psx-ink);border-right:0;min-height:48px}
.psx-t-swiss-grid .psx-input:focus{box-shadow:none;border-color:#E30613}
.psx-t-swiss-grid .psx-btn{border-radius:0;min-height:48px;font-weight:700}
.psx-t-swiss-grid .psx-box-ck{border-radius:0;border-width:2px}
.psx-t-swiss-grid .psx-check{font-size:12px}
.psx-t-swiss-grid .psx-x{top:0;right:0;width:44px;height:44px;border-radius:0;background:var(--psx-ink);color:#fff}
.psx-t-swiss-grid .psx-coupon{border-radius:0;border-style:solid;border-width:2px}
.psx-t-swiss-grid.psx-mobile .psx-cols{flex-direction:column;min-height:0}
.psx-t-swiss-grid.psx-mobile .sg-left{flex-direction:row-reverse;justify-content:flex-end;align-items:flex-end;gap:12px;padding:22px 20px 0}
.psx-t-swiss-grid.psx-mobile .sg-num{font-size:120px}
.psx-t-swiss-grid.psx-mobile .sg-sq{width:30px;height:30px;margin-bottom:6px}
.psx-t-swiss-grid.psx-mobile .sg-meta{display:none}
.psx-t-swiss-grid.psx-mobile .sg-right{padding:10px 20px 24px}
.psx-t-swiss-grid.psx-mobile .psx-h{font-size:26px}
.psx-t-swiss-grid.psx-mobile .psx-row{flex-direction:column;gap:10px}
.psx-t-swiss-grid.psx-mobile .psx-input{border-right:2px solid var(--psx-ink)}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=20), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('GRID-')}
    return tpl('06', 'swiss-grid', 'Swiss Grid', 'newsletter', 'Modal, centre', ['newsletter', 'minimal', 'grid', 'design'], doc, st, css)


def t07():
    CUR['slug'] = 'polaroid'
    photo = '<div class="pl-photo"><span class="pl-tape"></span><div class="pl-shot"><svg viewBox="0 0 210 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><circle cx="150" cy="60" r="22" fill="#F4E3B5"/><path d="M0 160 L60 110 L110 150 L150 120 L210 165 V200 H0z" fill="#8FA07E"/></svg></div><span class="pl-cap">summer days</span></div>'
    s1 = step('s1', 'Offer', [col([HTML(photo, cls='pl-pw')], cls='pl-left', w='0 0 250px'), col([H("Let's keep\nin touch!"), P('Snapshots of new things, once a month. 10% off your first order for saying hi.'),
                                                                                            FORM(btn='Say hi →', label='my email is…', ph='you@example.com', consentText="Yes, I'd like the monthly letter.", nxt='s2')], cls='pl-right')])
    s2 = step('s2', 'Thanks', [col([HTML(photo, cls='pl-pw')], cls='pl-left', w='0 0 250px'), col([H('Hi back!'), P('Here is your 10%:'), COUPON(), LINK('Keep browsing')], cls='pl-right')])
    doc = {'format': 'modal', 'width': 640, 'mobile': {'format': 'sheet'}, 'fonts': ['Caveat', 'Karla'],
           'theme': {'bg': '#F2EDE6', 'ink': '#2A2622', 'accent': '#3B6EA8', 'accentInk': '#FFFFFF', 'field': 'transparent', 'line': '#C9D6E6', 'radius': 4, 'fh': 'Caveat', 'fb': 'Karla', 'overlay': 'rgba(42,38,34,.55)'},
           'closeBtn': {'look': 'x'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-polaroid .psx-box{border-radius:4px;box-shadow:0 20px 44px rgba(0,0,0,.35);overflow:visible}
.psx-t-polaroid .psx-cols{align-items:center;min-height:360px}
.psx-t-polaroid .pl-left{padding:0 0 0 30px;align-items:center}
.psx-t-polaroid .pl-photo{position:relative;background:#fff;padding:12px 12px 46px;box-shadow:0 6px 14px rgba(0,0,0,.18);transform:rotate(-5deg)}
.psx-t-polaroid .pl-shot{width:210px;height:200px;background:linear-gradient(160deg,#B9C9D9 0,#E7D7C1 55%,#C9A98C 100%);overflow:hidden}
.psx-t-polaroid .pl-tape{position:absolute;left:50%;top:-12px;width:86px;height:26px;margin-left:-43px;background:rgba(232,220,170,.75);transform:rotate(3deg)}
.psx-t-polaroid .pl-cap{position:absolute;left:12px;right:12px;bottom:10px;text-align:center;font:700 22px var(--psx-fh)}
.psx-t-polaroid .pl-right{padding:30px 34px 30px 26px;gap:8px}
.psx-t-polaroid .psx-h{font:700 46px/.95 var(--psx-fh)}
.psx-t-polaroid .psx-p{font-size:14px}
.psx-t-polaroid .psx-label{font:700 18px/34px var(--psx-fh);color:var(--psx-accent)}
.psx-t-polaroid .psx-fields{gap:0;background:repeating-linear-gradient(#F2EDE6 0 33px,#C9D6E6 33px 34px)}
.psx-t-polaroid .psx-input{border:0;border-radius:0;background:transparent;padding:0 2px;min-height:34px;font-weight:500}
.psx-t-polaroid .psx-input:focus{box-shadow:none;background:rgba(59,110,168,.08)}
.psx-t-polaroid .psx-btn{align-self:flex-start;width:auto;border:2px solid var(--psx-ink);border-radius:4px;box-shadow:3px 3px 0 var(--psx-ink);font-weight:700}
.psx-t-polaroid .psx-box-ck{border-radius:3px;width:14px;height:14px}
.psx-t-polaroid .psx-check{font-size:12px}
.psx-t-polaroid .psx-x{font:700 28px/1 var(--psx-fh)}
.psx-t-polaroid .psx-coupon{border-radius:4px}
.psx-t-polaroid.psx-mobile .psx-cols{flex-direction:column;min-height:0}
.psx-t-polaroid.psx-mobile .pl-left{padding:0;margin-top:-80px}
.psx-t-polaroid.psx-mobile .pl-photo{padding:8px 8px 30px;transform:rotate(-4deg)}
.psx-t-polaroid.psx-mobile .pl-shot{width:140px;height:110px}
.psx-t-polaroid.psx-mobile .pl-cap{font-size:17px;bottom:4px}
.psx-t-polaroid.psx-mobile .pl-right{padding:16px 22px 24px;align-items:stretch;text-align:center}
.psx-t-polaroid.psx-mobile .psx-h{font-size:38px}
.psx-t-polaroid.psx-mobile .psx-btn{align-self:stretch}
.psx-t-polaroid.psx-mobile .psx-box{overflow:visible}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=12), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('HI-')}
    return tpl('07', 'polaroid', 'Polaroid', 'newsletter', 'Modal with photo slot', ['newsletter', 'photo', 'handwritten'], doc, st, css)


def t08():
    CUR['slug'] = 'terminal'
    bar = '<div class="tm-bar"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><span>~/shop — subscribe</span></div>'
    s1 = step('s1', 'Offer', [HTML(bar), SM('<span class="tm-g">$</span> shop --welcome', cls='tm-line'), H('Get <span class="tm-g">10%</span> off your first build.'), SM('# one email a month: new gear, restocks, changelogs. no spam.', cls='tm-c'),
                              FORM(btn='Run ⏎', label='$ subscribe --email', ph='you@domain.dev', layout='inline', consentText='--consent "I want the newsletter"', nxt='s2')])
    s2 = step('s2', 'Thanks', [HTML(bar), SM('<span class="tm-g">$</span> shop --welcome --email ok', cls='tm-line'), H('<span class="tm-g">✓</span> subscribed.'), SM('# your code (valid 14 days):', cls='tm-c'), COUPON(copy='copy'), BTN('apply --cart', act='apply')])
    doc = {'format': 'modal', 'width': 600, 'mobile': {'format': 'same', 'width': 'calc(100vw - 20px)'}, 'fonts': ['JetBrains Mono'],
           'theme': {'bg': '#15181C', 'ink': '#D6F5DD', 'accent': '#3DDC84', 'accentInk': '#0E1013', 'field': '#0E1013', 'fieldInk': '#FFFFFF', 'line': '#2A2F36', 'radius': 12, 'fh': 'JetBrains Mono', 'fb': 'JetBrains Mono', 'overlay': 'rgba(8,10,12,.6)', 'error': '#FF7B72'},
           'closeBtn': {'look': 'x'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-terminal .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.5),0 0 0 1px #2A2F36;overflow:hidden}
.psx-t-terminal .psx-col{padding:0 26px 24px;gap:8px;font-size:14px}
.psx-t-terminal .tm-bar{display:flex;align-items:center;gap:8px;height:38px;margin:0 -26px 14px;padding:0 14px;background:#1E2228;border-bottom:1px solid #2A2F36;font-size:12px;color:#8B949E}
.psx-t-terminal .tm-bar i{width:12px;height:12px;border-radius:50%}
.psx-t-terminal .tm-bar span{margin:0 auto}
.psx-t-terminal .tm-g{color:var(--psx-accent)}
.psx-t-terminal .tm-line,.psx-t-terminal .tm-c{font-size:14px;opacity:1}
.psx-t-terminal .tm-c{color:#8B949E}
.psx-t-terminal .psx-h{font:800 30px/1.15 var(--psx-fh);color:#fff;letter-spacing:-.02em}
.psx-t-terminal .psx-label{color:var(--psx-accent);font-weight:500;font-size:13px}
.psx-t-terminal .psx-input{border-color:var(--psx-line);border-radius:8px;font-family:var(--psx-fb)}
.psx-t-terminal .psx-btn{border-radius:6px;font-weight:800}
.psx-t-terminal .psx-check{color:#B7C4BC;font-size:12px}
.psx-t-terminal .psx-box-ck{border-radius:2px;border-color:var(--psx-accent);background:transparent}
.psx-t-terminal .psx-x{top:2px;right:6px;color:#8B949E;font-size:16px}
.psx-t-terminal .psx-coupon{border-color:var(--psx-accent);border-radius:8px;color:#fff}
.psx-t-terminal.psx-mobile .psx-col{padding:0 16px 18px}
.psx-t-terminal.psx-mobile .tm-bar{margin:0 -16px 10px}
.psx-t-terminal.psx-mobile .psx-h{font-size:22px}
.psx-t-terminal.psx-mobile .psx-row{flex-direction:column}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=15), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('DEV-')}
    return tpl('08', 'terminal', 'Terminal', 'newsletter', 'Modal, centre', ['newsletter', 'tech', 'gadgets', 'dark'], doc, st, css)


def t09():
    CUR['slug'] = 'bloom-drawer'
    flower = '<div class="bd-frame"><div class="bd-art"><svg viewBox="0 0 260 200" width="100%" height="100%"><g fill="none" stroke="#B5525C" stroke-width="1.2" stroke-linecap="round"><path d="M130 196 C 128 150, 132 110, 130 70"/><path d="M130 70 c-14-18-10-40 0-50 c10 10 14 32 0 50z"/><path d="M130 70 c-24-4-40-20-42-36 c18 0 36 14 42 36z"/><path d="M130 70 c24-4 40-20 42-36 c-18 0-36 14-42 36z"/><path d="M130 130 c-20-6-34-22-34-38 c16 4 30 18 34 38z"/><path d="M130 150 c20-6 34-22 34-38 c-16 4-30 18-34 38z"/></g></svg></div><span>pressed, not picked</span></div>'
    s1 = step('s1', 'Offer', [HTML(flower), H('The <i>Bloom</i>\nletter'), P('Notes on skin, scent and slow mornings. Ten percent off when you join.'), FORM(btn='Join the letter', label='Email address', consentText="I'd like to receive the letter. I can leave at any time.", nxt='s2')])
    s2 = step('s2', 'Thanks', [HTML(flower), H('Welcome to <i>Bloom</i>'), P('Your welcome code:'), COUPON(), LINK('Back to the shop')])
    doc = {'format': 'drawer', 'position': 'right', 'width': 360, 'mobile': {'format': 'same', 'width': '88vw'}, 'fonts': ['Cormorant', 'Jost'],
           'theme': {'bg': '#F8E9E6', 'ink': '#4A2C2A', 'accent': '#4A2C2A', 'accentInk': '#F8E9E6', 'field': 'transparent', 'line': '#4A2C2A', 'radius': 0, 'fh': 'Cormorant', 'fb': 'Jost', 'overlay': 'rgba(74,44,42,.42)'},
           'closeBtn': {'look': 'text', 'label': L('Close')}, 'steps': [s1, s2]}
    css = r'''
.psx-t-bloom-drawer .psx-box{box-shadow:-18px 0 40px rgba(74,44,42,.2)}
.psx-t-bloom-drawer .psx-col{padding:70px 32px 30px;gap:16px}
.psx-t-bloom-drawer .bd-frame{position:relative;border:1px solid #D9A9A4;padding:10px;margin-bottom:24px}
.psx-t-bloom-drawer .bd-art{height:200px;background:#EFD3CE}
.psx-t-bloom-drawer .bd-frame span{position:absolute;left:0;right:0;bottom:-26px;text-align:center;font:italic 500 14px var(--psx-fh)}
.psx-t-bloom-drawer .psx-h{font:500 38px/1.02 var(--psx-fh)}
.psx-t-bloom-drawer .psx-p{font:300 14px/1.6 var(--psx-fb)}
.psx-t-bloom-drawer .psx-label{font-weight:400;font-size:11.5px}
.psx-t-bloom-drawer .psx-input{border:0;border-bottom:1px solid var(--psx-ink);border-radius:0;padding:0;font-weight:300;min-height:40px}
.psx-t-bloom-drawer .psx-input:focus{box-shadow:none;border-bottom-color:#B5525C}
.psx-t-bloom-drawer .psx-btn{border-radius:0;font-weight:400;font-size:14px;min-height:48px}
.psx-t-bloom-drawer .psx-box-ck{border-radius:0;width:13px;height:13px;border-width:1px}
.psx-t-bloom-drawer .psx-check{font-weight:300;font-size:12px}
.psx-t-bloom-drawer .psx-x{width:auto;height:auto;padding:6px 0;right:32px;top:26px;font:300 13px var(--psx-fb);text-decoration:underline;text-underline-offset:4px;border-radius:0}
.psx-t-bloom-drawer .psx-coupon{border-radius:0;border-style:solid;border-width:1px}
.psx-t-bloom-drawer.psx-mobile .psx-col{padding:60px 22px 24px;gap:12px}
.psx-t-bloom-drawer.psx-mobile .bd-art{height:150px}
.psx-t-bloom-drawer.psx-mobile .psx-h{font-size:32px}
'''
    st = {'triggers': TRIG(clickOn=True, clickSel='a[href*="newsletter"],.js-join'), 'close': CLOSE(), 'frequency': FREQ(mode='page'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('BLOOM-')}
    return tpl('09', 'bloom-drawer', 'Bloom Drawer', 'newsletter', 'Side drawer, right', ['newsletter', 'beauty', 'drawer', 'elegant'], doc, st, css)


def t10():
    CUR['slug'] = 'kraft'
    s1 = step('s1', 'Offer', [H('Plain paper. Good news.'), P('We send one unbleached email a month: what we made, where it came from. Join and take 10% off.'), HTML('<div class="kr-twine"></div>'),
                              FORM(btn='Stamp it', label='Your email', layout='inline', consentText='Yes to the monthly email. Unsubscribe any time.', nxt='s2')])
    s2 = step('s2', 'Thanks', [H('Stamped and sent.'), P('Your 10% code:'), COUPON(), HTML('<div class="kr-twine"></div>'), LINK('Back to the shop')])
    doc = {'format': 'modal', 'width': 520, 'mobile': {'format': 'sheet'}, 'fonts': ['Special Elite', 'Archivo'],
           'theme': {'bg': '#C8A97E', 'ink': '#2B2118', 'accent': '#2B2118', 'accentInk': '#F1E6D2', 'field': '#F1E6D2', 'line': '#2B2118', 'radius': 0, 'fh': 'Special Elite', 'fb': 'Archivo', 'overlay': 'rgba(43,33,24,.55)'},
           'decor': [decor('<div class="kr-seal">MADE<br>BY HAND<br>· 10% ·</div>', name='Ink stamp', right='30px', top='26px', rot=12, m={'right': '18px', 'top': '-30px'})],
           'closeBtn': {'look': 'x'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-kraft .psx-box{background-image:repeating-linear-gradient(17deg,rgba(255,255,255,.06) 0 1px,transparent 1px 7px),repeating-linear-gradient(-31deg,rgba(60,40,20,.07) 0 1px,transparent 1px 11px);box-shadow:0 20px 44px rgba(0,0,0,.35);overflow:visible}
.psx-t-kraft .psx-col{padding:34px 40px 30px;gap:14px}
.psx-t-kraft .psx-h{font:400 34px/1.08 var(--psx-fh);max-width:330px}
.psx-t-kraft .psx-p{font-size:15px;line-height:1.55;max-width:360px}
.psx-t-kraft .kr-twine{height:6px;background:repeating-linear-gradient(60deg,#E9DCC3 0 4px,#B99566 4px 8px);border-radius:3px}
.psx-t-kraft .kr-seal{width:96px;height:96px;border-radius:50%;border:3px double var(--psx-ink);display:flex;align-items:center;justify-content:center;text-align:center;font:400 13px/1.15 var(--psx-fh);opacity:.8;background:#C8A97E}
.psx-t-kraft .psx-label{font-size:12px;font-weight:700}
.psx-t-kraft .psx-input{border:2px solid var(--psx-ink);border-radius:0;min-height:48px}
.psx-t-kraft .psx-btn{border-radius:0;font:400 16px var(--psx-fh);border:2px solid var(--psx-ink);min-height:48px}
.psx-t-kraft .psx-box-ck{border-radius:0;border-width:2px}
.psx-t-kraft .psx-check{font-size:12.5px}
.psx-t-kraft .psx-x{left:10px;right:auto;top:8px;font:400 22px var(--psx-fh)}
.psx-t-kraft .psx-coupon{border-radius:0;background:var(--psx-field)}
.psx-t-kraft .psx-code{font-family:var(--psx-fh)}
.psx-t-kraft.psx-mobile .psx-col{padding:26px 22px 24px;gap:12px}
.psx-t-kraft.psx-mobile .psx-h{font-size:27px;max-width:220px}
.psx-t-kraft.psx-mobile .kr-seal{width:76px;height:76px;font-size:11px}
.psx-t-kraft.psx-mobile .psx-row{flex-direction:column}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=8), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('KRAFT-')}
    return tpl('10', 'kraft', 'Kraft', 'newsletter', 'Modal, centre', ['newsletter', 'eco', 'handmade', 'paper'], doc, st, css)


def t11():
    CUR['slug'] = 'yes-or-no'
    s1 = step('s1', 'Question', [SM('Quick question', cls='yn-k'), H('Want 15% off\nyour first order?'),
                                 ROW([BTN('Yes, 15% please<small>Next: your email →</small>', act='step', step='s2', cls='yn-yes'), BTN('No, I like paying full price<small>Closes this</small>', act='close', cls='yn-no')], cls='yn-grid')])
    s2 = step('s2', 'Email', [HTML('<div class="yn-prog"><i></i><i></i></div>'), SM('Step 2 of 2', cls='yn-k'), H('Great. Where should we send it?'), FORM(btn='Send my 15%', label='Email', hideLabel=True, consentText='I agree to receive emails. Unsubscribe any time.', nxt='s3')])
    s3 = step('s3', 'Code', [SM('Done', cls='yn-k'), H('15% off. Yours.'), COUPON(), BTN('Apply to my cart', act='apply')])
    doc = {'format': 'modal', 'width': 620, 'mobile': {'format': 'sheet'}, 'fonts': ['Archivo Black', 'Archivo'],
           'theme': {'bg': '#2D2BD6', 'ink': '#FFFFFF', 'accent': '#FFD23F', 'accentInk': '#14136B', 'field': '#FFFFFF', 'fieldInk': '#14136B', 'line': '#FFFFFF', 'radius': 0, 'fh': 'Archivo Black', 'fb': 'Archivo', 'overlay': 'rgba(16,15,80,.55)', 'error': '#FFD23F'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, s2, s3]}
    css = r'''
.psx-t-yes-or-no .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.4)}
.psx-t-yes-or-no .psx-col{padding:30px;gap:12px}
.psx-t-yes-or-no .yn-k{font-weight:600;font-size:13px;color:#C9C8FF;opacity:1}
.psx-t-yes-or-no .psx-h{font:400 44px/1 var(--psx-fh);letter-spacing:-.02em;margin-bottom:10px}
.psx-t-yes-or-no .yn-grid{display:grid;grid-template-columns:1.25fr 1fr;gap:12px;align-items:stretch}
.psx-t-yes-or-no .yn-grid .psx-btn{min-height:150px;flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left;padding:22px;font:400 26px/1.05 var(--psx-fh);border-radius:0;white-space:normal}
.psx-t-yes-or-no .yn-grid small{font:600 14px var(--psx-fb)}
.psx-t-yes-or-no .yn-no{background:#1E1CA8;color:#fff}
.psx-t-yes-or-no .yn-no small{color:#C9C8FF}
.psx-t-yes-or-no .yn-prog{display:flex;gap:6px}
.psx-t-yes-or-no .yn-prog i{flex:1;height:5px;border-radius:3px;background:var(--psx-accent)}
.psx-t-yes-or-no .psx-input{border:0;border-radius:0;min-height:52px}
.psx-t-yes-or-no .psx-btn{border-radius:0;font:400 18px var(--psx-fh);min-height:54px}
.psx-t-yes-or-no .psx-box-ck{border-radius:0;border:2px solid var(--psx-accent);background:transparent}
.psx-t-yes-or-no .psx-check{color:#DCDBFF;font-size:12px}
.psx-t-yes-or-no .psx-x{background:rgba(255,255,255,.14);top:14px;right:14px}
.psx-t-yes-or-no .psx-coupon{border-radius:0;border-color:var(--psx-accent);color:#fff}
.psx-t-yes-or-no .psx-copy.psx-done{color:var(--psx-accentInk)}
.psx-t-yes-or-no.psx-mobile .psx-col{padding:24px 20px 22px}
.psx-t-yes-or-no.psx-mobile .psx-h{font-size:30px}
.psx-t-yes-or-no.psx-mobile .yn-grid{grid-template-columns:1fr}
.psx-t-yes-or-no.psx-mobile .yn-grid .psx-btn{min-height:96px;font-size:22px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=10), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': GEN('YES15-', 15)}
    return tpl('11', 'yes-or-no', 'Yes or No', 'newsletter', 'Modal, two steps', ['newsletter', 'two-step', 'bold'], doc, st, css)


def t12():
    CUR['slug'] = 'pocket-sheet'
    bell = '<div class="ps-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A7CFF" stroke-width="2" stroke-linecap="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg></div>'
    s1 = step('s1', 'Offer', [HTML(bell, cls='psx-hide-m'), H('Get the drops you care about'), P('Pick what you like. We only email about those, and you get 10% off now.'),
                              CHIPS([('running', 'Running', True), ('outdoor', 'Outdoor', False), ('sale', 'Sale only', True), ('kids', 'Kids', False)]),
                              FORM(btn='Get 10% off', label='Email address', hideLabel=True, ph='Email address', consent=False, nxt='s2'), SM('By signing up you agree to receive emails. Unsubscribe any time.', cls='ps-legal'), LINK('Not now', cls='psx-hide-d ps-not')])
    s2 = step('s2', 'Thanks', [HTML(bell, cls='psx-hide-m'), H("You're in"), P('We will only write about what you picked. Your code:'), COUPON(), BTN('Apply to cart', act='apply', full=True)])
    doc = {'format': 'modal', 'width': 440, 'mobile': {'format': 'sheet'}, 'fonts': ['Plus Jakarta Sans'],
           'theme': {'bg': '#FFFFFF', 'ink': '#121417', 'accent': '#0A7CFF', 'accentInk': '#FFFFFF', 'field': '#FFFFFF', 'line': '#D5D9E0', 'radius': 24, 'fh': 'Plus Jakarta Sans', 'fb': 'Plus Jakarta Sans', 'overlay': 'rgba(18,20,23,.45)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, s2]}
    css = r'''
.psx-t-pocket-sheet .psx-col{padding:28px 28px 24px;gap:14px}
.psx-t-pocket-sheet .ps-ico{width:48px;height:48px;border-radius:14px;background:#E8F2FF;display:flex;align-items:center;justify-content:center}
.psx-t-pocket-sheet .psx-h{font:800 26px/1.15 var(--psx-fh);letter-spacing:-.02em}
.psx-t-pocket-sheet .psx-p{font-weight:500;color:#4B5563;margin-top:-4px}
.psx-t-pocket-sheet .psx-chip{border-radius:999px}
.psx-t-pocket-sheet .psx-chip[aria-pressed=true]::before{content:"✓ "}
.psx-t-pocket-sheet .psx-input{border-radius:14px;min-height:52px;font-weight:600}
.psx-t-pocket-sheet .psx-btn{border-radius:14px;min-height:54px;font-weight:700;font-size:16px}
.psx-t-pocket-sheet .ps-legal{text-align:center;color:#6B7280;font-size:12px;opacity:1}
.psx-t-pocket-sheet .ps-not{align-self:center;text-decoration:none;font-weight:600;color:#4B5563}
.psx-t-pocket-sheet .psx-x{background:#F1F3F6;top:18px;right:18px}
.psx-t-pocket-sheet .psx-coupon{border-radius:14px;border-color:#0A7CFF}
.psx-t-pocket-sheet.psx-f-sheet .psx-box{border-radius:26px 26px 0 0}
.psx-t-pocket-sheet.psx-f-sheet .psx-box::before{content:"";display:block;width:40px;height:5px;border-radius:3px;background:#D5D9E0;margin:10px auto 0}
.psx-t-pocket-sheet.psx-mobile .psx-col{padding:12px 18px 22px;gap:12px}
.psx-t-pocket-sheet.psx-mobile .psx-h{font-size:22px}
.psx-t-pocket-sheet.psx-mobile .psx-x{display:none}
'''
    st = {'triggers': TRIG(pagesOn=True, pagesN=2), 'close': CLOSE(), 'frequency': FREQ(), 'form': {'list': 'newsletter', 'consent': False, 'consentRequired': False}, 'coupon': GEN('DROP-')}
    return tpl('12', 'pocket-sheet', 'Pocket Sheet', 'newsletter', 'Bottom sheet on phones', ['newsletter', 'interests', 'app', 'mobile'], doc, st, css)


TEMPLATES = [t01, t02, t03, t04, t05, t06, t07, t08, t09, t10, t11, t12]
