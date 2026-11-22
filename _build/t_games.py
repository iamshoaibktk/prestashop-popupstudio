from tpl_common import *


def win_steps(prefix, heading='You won {prize}!', note='Saved to your email. Valid 14 days.'):
    return step('won', 'Prize', [H(heading), COUPON(note=note), BTN('Apply to my cart', act='apply', full=True)])


def t26():
    CUR['slug'] = 'fairground-wheel'
    s1 = step('s1', 'Spin', [col([WHEEL('bulbs')], cls='fw-w', w='0 0 330px'), col([H('Step right up!'), P('One spin per visitor. Every slice wins something, and the prize is saved to your email.'),
                                                                                  FORM(btn='Spin the wheel', label='Your email', consentText='Send me offers by email. I can unsubscribe any time.', play=True, nxt='won')], cls='fw-f')])
    doc = {'format': 'modal', 'width': 700, 'mobile': {'format': 'same'}, 'fonts': ['Lilita One', 'Nunito'],
           'theme': {'bg': '#7A0F12', 'ink': '#FFF4E0', 'accent': '#F2C14E', 'accentInk': '#4E080B', 'field': '#FFF4E0', 'fieldInk': '#4E080B', 'line': '#FFF4E0', 'radius': 18, 'fh': 'Lilita One', 'fb': 'Nunito', 'overlay': 'rgba(30,4,6,.62)',
                     'w1': '#FFF4E0', 'w2': '#C8202A', 'w3': '#F2C14E', 'w4': '#C8202A', 'wi1': '#4E080B', 'wi2': '#FFF4E0', 'wi3': '#4E080B', 'wi4': '#FFF4E0'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, win_steps('fw')]}
    css = r'''
.psx-t-fairground-wheel .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.45);overflow:hidden}
.psx-t-fairground-wheel .psx-box::before{content:"";position:absolute;left:0;right:0;top:0;height:30px;background:repeating-linear-gradient(90deg,#FFF4E0 0 30px,#C8202A 30px 60px);-webkit-mask:radial-gradient(circle 15px at 15px 15px,#000 98%,#0000) 0 0/30px 30px repeat-x,linear-gradient(#000,#000) 0 0/100% 15px no-repeat;mask:radial-gradient(circle 15px at 15px 15px,#000 98%,#0000) 0 0/30px 30px repeat-x,linear-gradient(#000,#000) 0 0/100% 15px no-repeat;z-index:2}
.psx-t-fairground-wheel .psx-cols{align-items:center;padding:44px 34px 24px 24px;gap:20px}
.psx-t-fairground-wheel .psx-step[data-step=won] .psx-col{padding:56px 40px 32px;text-align:center;align-items:center}
.psx-t-fairground-wheel .psx-h{font:400 46px/.95 var(--psx-fh);color:var(--psx-accent)}
.psx-t-fairground-wheel .psx-p{font-weight:500;line-height:1.5}
.psx-t-fairground-wheel .psx-rim{fill:#4E080B}
.psx-t-fairground-wheel .psx-wheel-svg text{font:400 17px var(--psx-fh)}
.psx-t-fairground-wheel .psx-seg{stroke:#4E080B;stroke-width:2}
.psx-t-fairground-wheel .psx-bulb:nth-of-type(odd){fill:#FFF4E0}
.psx-t-fairground-wheel .psx-hub{fill:#F2C14E;stroke:#4E080B;stroke-width:4}
.psx-t-fairground-wheel .psx-hub2{fill:#4E080B}
.psx-t-fairground-wheel .psx-pointer{fill:#FFF4E0;stroke:#4E080B}
.psx-t-fairground-wheel .psx-label{font-weight:700}
.psx-t-fairground-wheel .psx-input{border:0;border-radius:10px;font-weight:500}
.psx-t-fairground-wheel .psx-btn{border-radius:10px;font:400 22px var(--psx-fh);min-height:52px;box-shadow:0 4px 0 #B8862A}
.psx-t-fairground-wheel .psx-box-ck{border-radius:4px;border:2px solid #F2C14E;background:transparent}
.psx-t-fairground-wheel .psx-check{font-size:12px}
.psx-t-fairground-wheel .psx-x{top:38px;right:12px;background:rgba(255,244,224,.14)}
.psx-t-fairground-wheel .psx-coupon{border-color:#F2C14E;border-radius:10px;align-self:stretch}
.psx-t-fairground-wheel.psx-mobile .psx-cols{padding:38px 18px 18px}
.psx-t-fairground-wheel.psx-mobile .fw-w{order:2}
.psx-t-fairground-wheel.psx-mobile .fw-f{order:1;text-align:center}
.psx-t-fairground-wheel.psx-mobile .fw-w .psx-wheel-svg{max-width:220px}
.psx-t-fairground-wheel.psx-mobile .psx-h{font-size:32px}
.psx-t-fairground-wheel.psx-mobile .psx-p{display:none}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=8), 'close': CLOSE(), 'frequency': FREQ(mode='once'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': NOCOUPON,
          'game': {'type': 'wheel', 'emailFirst': True, 'prizes': [prize('p5a', '5% off', 25, value=5), prize('ship', 'Free ship', 15, 'shipping'), prize('p10a', '10% off', 20, value=10), prize('gift', 'Gift', 5, 'amount', 10),
                                                                    prize('p15', '15% off', 8, value=15), prize('p5b', '5% off', 20, value=5), prize('p10b', '10% off', 6, value=10), prize('p20', '20% off', 1, value=20)]}}
    return tpl('26', 'fairground-wheel', 'Fairground Wheel', 'games', 'Modal, spin to win', ['game', 'wheel', 'spin to win', 'carnival'], doc, st, css)


def t27():
    CUR['slug'] = 'mono-wheel'
    s1 = step('s1', 'Spin', [col([WHEEL('ticks')], cls='mw-w', w='0 0 320px'), col([H('One turn.\n*Every slice wins.*'), P('Enter your email and give it a spin. Your prize is saved to your address.'),
                                                                                 FORM(btn='Turn the wheel', label='Email', consentText='Email me offers. Unsubscribe any time.', play=True, nxt='won')], cls='mw-f')])
    doc = {'format': 'modal', 'width': 680, 'mobile': {'format': 'sheet'}, 'fonts': ['Instrument Serif', 'Instrument Sans'],
           'theme': {'bg': '#F4F4F2', 'ink': '#111111', 'accent': '#111111', 'accentInk': '#F4F4F2', 'field': '#FFFFFF', 'line': '#B5B5B0', 'radius': 0, 'fh': 'Instrument Serif', 'fb': 'Instrument Sans', 'overlay': 'rgba(17,17,17,.55)',
                     'w1': '#FBFBF9', 'w2': '#E9E9E5', 'w3': '#FBFBF9', 'w4': '#E9E9E5', 'wi1': '#111111', 'wi2': '#111111', 'wi3': '#111111', 'wi4': '#111111'},
           'steps': [s1, win_steps('mw', heading='*{prize}.* Yours.')]}
    css = r'''
.psx-t-mono-wheel .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.35)}
.psx-t-mono-wheel .psx-cols{align-items:center;padding:30px 40px 30px 30px;gap:34px}
.psx-t-mono-wheel .psx-step[data-step=won] .psx-col{padding:40px;text-align:center}
.psx-t-mono-wheel .psx-h{font:400 44px/1 var(--psx-fh)}
.psx-t-mono-wheel .psx-p{color:#3D3D3A}
.psx-t-mono-wheel .psx-rim{fill:#fff;stroke:#111;stroke-width:1.5}
.psx-t-mono-wheel .psx-seg{stroke:#111;stroke-width:.8}
.psx-t-mono-wheel .psx-wheel-svg text{font:500 14px var(--psx-fb)}
.psx-t-mono-wheel .psx-hub{fill:#111}
.psx-t-mono-wheel .psx-hub2{fill:#9A9A96}
.psx-t-mono-wheel .psx-pointer{fill:#9A9A96;stroke:#111;stroke-width:1.2}
.psx-t-mono-wheel .psx-input{border:1px solid var(--psx-line);border-radius:0}
.psx-t-mono-wheel .psx-btn{border-radius:0;font-weight:500}
.psx-t-mono-wheel .psx-box-ck{border-radius:0;border-width:1px;width:14px;height:14px}
.psx-t-mono-wheel .psx-check{font-size:12px}
.psx-t-mono-wheel .psx-coupon{border-radius:0;border-style:solid;border-width:1px}
.psx-t-mono-wheel.psx-mobile .psx-cols{padding:22px 20px;gap:10px}
.psx-t-mono-wheel.psx-mobile .mw-w .psx-wheel-svg{max-width:200px}
.psx-t-mono-wheel.psx-mobile .psx-h{font-size:32px;text-align:center}
.psx-t-mono-wheel.psx-mobile .psx-p{display:none}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=8), 'close': CLOSE(), 'frequency': FREQ(mode='once'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': NOCOUPON,
          'game': {'type': 'wheel', 'emailFirst': True, 'prizes': [prize('p5a', '5%', 25, value=5), prize('ship', 'Free ship', 15, 'shipping'), prize('p10a', '10%', 20, value=10), prize('p5b', '5%', 20, value=5),
                                                                    prize('p15', '15%', 8, value=15), prize('gift', 'Gift', 5, 'amount', 10), prize('p10b', '10%', 6, value=10), prize('p20', '20%', 1, value=20)]}}
    return tpl('27', 'mono-wheel', 'Mono Wheel', 'games', 'Modal, spin to win', ['game', 'wheel', 'minimal', 'design'], doc, st, css)


def t28():
    CUR['slug'] = 'silver-scratch'
    coin = '<svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="#C0C6D0"/><circle cx="28" cy="28" r="17" fill="none" stroke="#8C94A3" stroke-width="2"/><text x="28" y="34" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="16" fill="#5B6373">%</text></svg>'
    s0 = step('s1', 'Email', [H('Scratch for your prize'), P('Leave your email to get a card. Every card wins.'), FORM(btn='Get my card', label='Email', hideLabel=True, consentText='Send me offers by email.', nxt='scratch')])
    s1 = step('scratch', 'Scratch', [H('Scratch for your prize'), P('Use your mouse or finger. Every card wins.'), SCRATCH(prize='{prize}', reveal='Reveal it all')])
    s2 = step('won', 'Prize', [H('You won {prize}'), COUPON(note='Saved to your email. Valid 14 days.'), BTN('Apply to my cart', act='apply', full=True)])
    doc = {'format': 'modal', 'width': 480, 'mobile': {'format': 'same'}, 'fonts': ['Space Grotesk', 'Rubik'],
           'theme': {'bg': '#1E2433', 'ink': '#F1F3F7', 'accent': '#F1F3F7', 'accentInk': '#1E2433', 'field': '#2A3245', 'fieldInk': '#F1F3F7', 'line': '#3A4358', 'radius': 20, 'fh': 'Space Grotesk', 'fb': 'Rubik', 'overlay': 'rgba(10,13,20,.66)'},
           'decor': [decor(coin, name='Coin', left='-14px', top='-14px'), decor(coin.replace('56', '40', 2), name='Coin 2', right='-10px', bottom='40px', hideMobile=True)],
           'closeBtn': {'look': 'circle'}, 'steps': [s0, s1, s2]}
    css = r'''
.psx-t-silver-scratch .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.08);overflow:visible;text-align:center}
.psx-t-silver-scratch .psx-col{padding:28px 30px 24px;gap:12px;align-items:stretch}
.psx-t-silver-scratch .psx-h{font:700 30px/1.05 var(--psx-fh);letter-spacing:-.02em}
.psx-t-silver-scratch .psx-p{color:#B7BDCA}
.psx-t-silver-scratch .psx-scratch{min-height:170px}
.psx-t-silver-scratch .psx-prize{min-height:170px;background:#F6EFD9;color:#1E2433;font:900 56px/1 var(--psx-fb);border-radius:14px}
.psx-t-silver-scratch .psx-foil{height:170px;border-radius:14px}
.psx-t-silver-scratch .psx-reveal{border-radius:12px;background:#F1F3F7;color:#1E2433;box-shadow:none;font-weight:700}
.psx-t-silver-scratch .psx-input{border-radius:12px;border:1px solid var(--psx-line)}
.psx-t-silver-scratch .psx-btn{border-radius:12px;font-weight:700}
.psx-t-silver-scratch .psx-check{color:#B7BDCA;justify-content:center}
.psx-t-silver-scratch .psx-box-ck{background:transparent}
.psx-t-silver-scratch .psx-coupon{border-color:#C0C6D0;border-radius:12px}
.psx-t-silver-scratch .psx-x{background:rgba(255,255,255,.1)}
.psx-t-silver-scratch.psx-mobile .psx-col{padding:24px 18px 18px}
.psx-t-silver-scratch.psx-mobile .psx-h{font-size:24px}
.psx-t-silver-scratch.psx-mobile .psx-prize{font-size:44px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=10), 'close': CLOSE(), 'frequency': FREQ(mode='once'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': False}, 'coupon': NOCOUPON,
          'game': {'type': 'scratch', 'emailFirst': False, 'prizes': [prize('p10', '10% OFF', 60, value=10), prize('p15', '15% OFF', 25, value=15), prize('ship', 'FREE SHIPPING', 15, 'shipping')]}}
    return tpl('28', 'silver-scratch', 'Silver Scratch', 'games', 'Modal, scratch card', ['game', 'scratch card', 'dark'], doc, st, css)


GIFT = [
    '<svg viewBox="0 0 120 130" width="120" height="130"><rect x="12" y="56" width="96" height="70" rx="6" fill="#C8432F"/><rect x="6" y="40" width="108" height="22" rx="5" fill="#E05A44"/><rect x="52" y="40" width="16" height="86" fill="#E9B44C"/><path d="M60 40 C 40 10, 20 30, 60 40 C 100 30, 80 10, 60 40" fill="none" stroke="#E9B44C" stroke-width="7" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 130 150" width="130" height="150"><rect x="14" y="74" width="102" height="72" rx="6" fill="#F3E6C8"/><g class="lid"><rect x="8" y="50" width="114" height="24" rx="5" fill="#FFF8E7"/><rect x="57" y="50" width="16" height="24" fill="#2E8B6A"/><circle cx="65" cy="44" r="9" fill="#2E8B6A"/><path d="M65 44 l-20 -16 M65 44 l20 -16" stroke="#2E8B6A" stroke-width="7" stroke-linecap="round"/></g><rect x="57" y="74" width="16" height="72" fill="#2E8B6A"/></svg>',
    '<svg viewBox="0 0 110 120" width="110" height="120"><rect x="10" y="50" width="90" height="66" rx="6" fill="#E9B44C"/><rect x="4" y="34" width="102" height="22" rx="5" fill="#F2C76A"/><rect x="48" y="34" width="14" height="82" fill="#0C3B2E"/><rect x="4" y="76" width="102" height="12" fill="#0C3B2E"/><path d="M55 34 c-6-16-26-16-22-2 c4 8 22 2 22 2 c0 0 18 6 22-2 c4-14-16-14-22 2" fill="#0C3B2E"/></svg>'
]


def t29():
    CUR['slug'] = 'pick-a-gift'
    items = [{'svg': GIFT[0], 't': L('Red'), 'aria': L('Open the red box')}, {'svg': GIFT[1], 't': L('Cream'), 'aria': L('Open the cream box')}, {'svg': GIFT[2], 't': L('Gold'), 'aria': L('Open the gold box')}]
    s1 = step('s1', 'Pick', [H('Pick a gift, any gift'), P('Each box holds a different surprise. Choose one.'), PICK('gift', items, label='Three gift boxes'), SM("You'll be asked for your email to keep the prize.", cls='pg-n')])
    s2 = step('claim', 'Claim', [H('You found {prize}!'), P('Leave your email to keep it.'), FORM(btn='Keep my gift', label='Email', hideLabel=True, consentText='Send me offers too', nxt='won')])
    s3 = step('won', 'Prize', [H('{prize}, wrapped.'), COUPON(note='Saved to your email. Valid 14 days.'), BTN('Apply to my cart', act='apply', full=True)])
    doc = {'format': 'modal', 'width': 600, 'mobile': {'format': 'same'}, 'fonts': ['Fredoka'],
           'theme': {'bg': '#0C3B2E', 'ink': '#FFF8E7', 'accent': '#E9B44C', 'accentInk': '#0C3B2E', 'field': '#FFF8E7', 'fieldInk': '#0C3B2E', 'line': '#FFF8E7', 'radius': 24, 'fh': 'Fredoka', 'fb': 'Fredoka', 'overlay': 'rgba(5,25,19,.6)'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, s2, s3]}
    css = r'''
.psx-t-pick-a-gift .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.45);text-align:center}
.psx-t-pick-a-gift .psx-col{padding:32px 36px 28px;align-items:center;gap:10px}
.psx-t-pick-a-gift .psx-h{font:700 34px/1.1 var(--psx-fh)}
.psx-t-pick-a-gift .psx-p{color:#CFE3D9}
.psx-t-pick-a-gift .psx-pick{gap:34px;align-items:flex-end;margin:12px 0}
.psx-t-pick-a-gift .psx-pick-i{color:#FFF8E7}
.psx-t-pick-a-gift .psx-pick-i:nth-child(2){transform:translateY(-12px)}
.psx-t-pick-a-gift .psx-pick-i .lid{transition:transform .5s;transform-origin:20px 60px}
.psx-t-pick-a-gift .psx-pick-i:hover .lid,.psx-t-pick-a-gift .psx-chosen .lid{transform:rotate(-10deg) translateY(-6px)}
.psx-t-pick-a-gift .pg-n{color:#A9C7B9;opacity:1}
.psx-t-pick-a-gift .psx-form{align-self:stretch}
.psx-t-pick-a-gift .psx-input{border:0;border-radius:14px}
.psx-t-pick-a-gift .psx-btn{border-radius:14px;font-weight:700}
.psx-t-pick-a-gift .psx-check{justify-content:center;color:#CFE3D9}
.psx-t-pick-a-gift .psx-box-ck{background:transparent;border-color:#E9B44C}
.psx-t-pick-a-gift .psx-coupon{border-color:#E9B44C;border-radius:14px;align-self:stretch}
.psx-t-pick-a-gift .psx-x{background:rgba(255,248,231,.12)}
.psx-t-pick-a-gift.psx-mobile .psx-col{padding:24px 16px 20px}
.psx-t-pick-a-gift.psx-mobile .psx-h{font-size:27px}
.psx-t-pick-a-gift.psx-mobile .psx-pick{gap:10px}
.psx-t-pick-a-gift.psx-mobile .psx-pick-art svg{width:84px;height:auto}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=10), 'close': CLOSE(), 'frequency': FREQ(mode='once'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': False}, 'coupon': NOCOUPON,
          'game': {'type': 'pick', 'emailFirst': False, 'prizes': [prize('p10', '10% off', 55, value=10), prize('p15', '15% off', 30, value=15), prize('ship', 'free shipping', 15, 'shipping')]}}
    return tpl('29', 'pick-a-gift', 'Pick a Gift', 'games', 'Modal, pick one of three', ['game', 'gift', 'pick'], doc, st, css)


def t30():
    CUR['slug'] = 'three-cards'
    sun = '<svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="12" fill="none" stroke="#D4A657" stroke-width="1.5"/><path d="M22 4v6M22 34v6M4 22h6M34 22h6" stroke="#D4A657" stroke-width="1.5"/></svg>'
    moon = '<svg width="44" height="44" viewBox="0 0 44 44"><path d="M30 8a14 14 0 1 0 6 20 11 11 0 1 1-6-20z" fill="none" stroke="#D4A657" stroke-width="1.5"/></svg>'
    star = '<svg width="44" height="44" viewBox="0 0 44 44"><path d="M22 6l4.5 10 11 1-8.3 7.4 2.5 10.8L22 29.5 12.3 35l2.5-10.8L6.5 17l11-1z" fill="none" stroke="#D4A657" stroke-width="1.5"/></svg>'
    items = [{'svg': sun, 'aria': L('Turn the first card')}, {'svg': star, 'aria': L('Turn the second card')}, {'svg': moon, 'aria': L('Turn the third card')}]
    s1 = step('s1', 'Pick', [H('Choose your card'), P('The fortune you draw is yours to keep.'), PICK('card', items, label='Three cards')])
    s2 = step('claim', 'Claim', [H('{prize}'), P('Leave your email to keep your fortune.'), FORM(btn='Keep it', label='Email', hideLabel=True, consentText='Send me offers too', nxt='won')])
    s3 = step('won', 'Prize', [H('{prize}'), COUPON(note='Valid 14 days, one use.'), BTN('Apply to my cart', act='apply', full=True)])
    doc = {'format': 'modal', 'width': 580, 'mobile': {'format': 'sheet'}, 'fonts': ['Cinzel', 'Lato'],
           'theme': {'bg': '#1B1424', 'ink': '#EDE3F7', 'accent': '#D4A657', 'accentInk': '#1B1424', 'field': '#2A1F38', 'fieldInk': '#EDE3F7', 'line': '#D4A657', 'radius': 16, 'fh': 'Cinzel', 'fb': 'Lato', 'overlay': 'rgba(10,6,16,.66)'},
           'steps': [s1, s2, s3]}
    css = r'''
.psx-t-three-cards .psx-box{box-shadow:0 22px 50px rgba(0,0,0,.55),inset 0 0 0 1px #3A2D4D;text-align:center}
.psx-t-three-cards .psx-col{padding:30px;align-items:center;gap:10px}
.psx-t-three-cards .psx-h{font:500 28px/1.2 var(--psx-fh);letter-spacing:.02em}
.psx-t-three-cards .psx-p{color:#BBAECD}
.psx-t-three-cards .psx-pick{gap:18px;margin:14px 0 4px}
.psx-t-three-cards .psx-pick-i{width:128px;height:196px;border-radius:10px;background:#2A1F38;box-shadow:inset 0 0 0 2px #D4A657,inset 0 0 0 7px #2A1F38,inset 0 0 0 8px rgba(212,166,87,.5),0 10px 20px rgba(0,0,0,.4);background-image:repeating-linear-gradient(45deg,rgba(212,166,87,.14) 0 2px,transparent 2px 12px),repeating-linear-gradient(-45deg,rgba(212,166,87,.14) 0 2px,transparent 2px 12px);justify-content:center;transition:transform .5s}
.psx-t-three-cards .psx-pick-i:nth-child(1){transform:rotate(-6deg) translateY(8px)}
.psx-t-three-cards .psx-pick-i:nth-child(3){transform:rotate(6deg) translateY(8px)}
.psx-t-three-cards .psx-chosen{transform:rotateY(180deg) translateY(-10px)!important;background:#F4EAD7}
.psx-t-three-cards .psx-chosen .psx-pick-art{opacity:0}
.psx-t-three-cards .psx-pick-t{position:absolute;font:700 18px var(--psx-fh);color:#1B1424;transform:rotateY(180deg)}
.psx-t-three-cards .psx-input{border:1px solid var(--psx-line);border-radius:10px}
.psx-t-three-cards .psx-form{align-self:stretch}
.psx-t-three-cards .psx-btn{border-radius:10px;font-weight:700}
.psx-t-three-cards .psx-check{justify-content:center;color:#BBAECD}
.psx-t-three-cards .psx-box-ck{background:transparent}
.psx-t-three-cards .psx-coupon{border-color:var(--psx-accent);border-radius:10px;align-self:stretch}
.psx-t-three-cards.psx-mobile .psx-col{padding:24px 16px 20px}
.psx-t-three-cards.psx-mobile .psx-pick{gap:10px}
.psx-t-three-cards.psx-mobile .psx-pick-i{width:82px;height:126px}
'''
    st = {'triggers': TRIG(timerOn=True, timerSec=10), 'close': CLOSE(), 'frequency': FREQ(mode='once'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': False}, 'coupon': NOCOUPON,
          'game': {'type': 'pick', 'emailFirst': False, 'prizes': [prize('p10', 'The Moon: 10% off', 55, value=10), prize('p15', 'The Star: 15% off', 30, value=15), prize('p20', 'The Sun: 20% off', 15, value=20)]}}
    return tpl('30', 'three-cards', 'Three Cards', 'games', 'Modal, pick a card', ['game', 'cards', 'mystic'], doc, st, css)


def t31():
    CUR['slug'] = 'sunburst-wheel'
    s1 = step('s1', 'Spin', [col([WHEEL('plain')], cls='sb-w', w='0 0 330px'), col([H("Feelin' lucky?"), P('Spin once, win something groovy. Your prize lands in your inbox.'),
                                                                                  FORM(btn='Spin it!', label='Email', hideLabel=True, ph='your email', consentText='Send me offers. Unsubscribe any time.', play=True, nxt='won')], cls='sb-f')])
    doc = {'format': 'modal', 'width': 680, 'mobile': {'format': 'same'}, 'fonts': ['Shrikhand', 'Poppins'],
           'theme': {'bg': '#F3E3C3', 'ink': '#4A2511', 'accent': '#E07A1F', 'accentInk': '#FFF6E3', 'field': '#FFF6E3', 'line': '#4A2511', 'radius': 28, 'fh': 'Shrikhand', 'fb': 'Poppins', 'overlay': 'rgba(74,37,17,.6)',
                     'w1': '#E07A1F', 'w2': '#F2B33D', 'w3': '#B4471C', 'w4': '#F3E3C3', 'wi1': '#FFF6E3', 'wi2': '#4A2511', 'wi3': '#FFF6E3', 'wi4': '#4A2511'},
           'closeBtn': {'look': 'circle'}, 'steps': [s1, win_steps('sb', heading='Far out! {prize}')]}
    css = r'''
.psx-t-sunburst-wheel .psx-box{overflow:hidden;box-shadow:0 22px 50px rgba(0,0,0,.4)}
.psx-t-sunburst-wheel .psx-box::before{content:"";position:absolute;inset:-40%;background:repeating-conic-gradient(from 0deg at 30% 50%,rgba(224,122,31,.14) 0 8deg,transparent 8deg 16deg);pointer-events:none}
.psx-t-sunburst-wheel .psx-cols{align-items:center;padding:30px 36px 30px 24px;gap:26px}
.psx-t-sunburst-wheel .psx-step[data-step=won] .psx-col{padding:48px 40px;text-align:center;align-items:center}
.psx-t-sunburst-wheel .psx-h{font:400 46px/1 var(--psx-fh);color:var(--psx-accent);text-shadow:3px 3px 0 var(--psx-ink)}
.psx-t-sunburst-wheel .psx-rim{fill:#4A2511}
.psx-t-sunburst-wheel .psx-wheel-svg text{font:400 19px var(--psx-fh)}
.psx-t-sunburst-wheel .psx-hub{fill:#F3E3C3;stroke:#4A2511;stroke-width:6;r:34px}
.psx-t-sunburst-wheel .psx-hub2{fill:#E07A1F;r:12px}
.psx-t-sunburst-wheel .psx-pointer{fill:#4A2511;stroke:none}
.psx-t-sunburst-wheel .psx-input{border:3px solid var(--psx-ink);border-radius:999px;font-weight:500}
.psx-t-sunburst-wheel .psx-btn{border:3px solid var(--psx-ink);border-radius:999px;font:400 21px var(--psx-fh);box-shadow:0 5px 0 var(--psx-ink);min-height:54px}
.psx-t-sunburst-wheel .psx-box-ck{border-radius:50%;border:2px solid var(--psx-ink);background:transparent}
.psx-t-sunburst-wheel .psx-check{font-size:12px}
.psx-t-sunburst-wheel .psx-x{border:3px solid var(--psx-ink);background:#FFF6E3;font-weight:700}
.psx-t-sunburst-wheel .psx-coupon{border:3px dashed var(--psx-ink);border-radius:999px;align-self:stretch}
.psx-t-sunburst-wheel.psx-mobile .psx-cols{padding:22px 18px}
.psx-t-sunburst-wheel.psx-mobile .sb-w{order:2}
.psx-t-sunburst-wheel.psx-mobile .sb-w .psx-wheel-svg{max-width:220px}
.psx-t-sunburst-wheel.psx-mobile .psx-h{font-size:34px;text-align:center}
.psx-t-sunburst-wheel.psx-mobile .psx-p{display:none}
'''
    st = {'triggers': TRIG(scrollOn=True, scrollVal=40), 'close': CLOSE(), 'frequency': FREQ(mode='once'), 'form': {'list': 'newsletter', 'consent': True, 'consentRequired': True}, 'coupon': NOCOUPON,
          'game': {'type': 'wheel', 'emailFirst': True, 'prizes': [prize('p5a', '5%', 25, value=5), prize('ship', 'Ship free', 15, 'shipping'), prize('p10a', '10%', 20, value=10), prize('gift', 'Gift', 5, 'amount', 10),
                                                                    prize('p15', '15%', 8, value=15), prize('p5b', '5%', 20, value=5), prize('p10b', '10%', 6, value=10), prize('p20', '20%', 1, value=20)]}}
    return tpl('31', 'sunburst-wheel', 'Sunburst Wheel', 'games', 'Modal, spin to win', ['game', 'wheel', 'retro', '70s'], doc, st, css)


TEMPLATES = [t26, t27, t28, t29, t30, t31]
