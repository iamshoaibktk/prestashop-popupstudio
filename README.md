# Popup Studio: free popup builder module for PrestaShop 8 and 9

**Popup Studio** is a free, open-source **PrestaShop popup module**. Build newsletter popups, exit-intent popups, spin-to-win wheels, coupon popups, announcement bars and slide-ins with a drag-and-drop editor, then show them to the right visitors with targeting, scheduling and A/B tests.

- 50 ready-made popup templates, each with its own desktop and mobile design
- Grow your email list, recover abandoning visitors and lift conversions
- GDPR consent, 10 languages, no external services

**[Download the latest release](https://github.com/iamshoaibktk/prestashop-popupstudio/releases/latest)**

## Compatibility
- PrestaShop 8.0 to 9.x
- PHP 7.2.5 or newer

## Features
- **Formats**: modal, full screen, slide-in, bar (top or bottom), side drawer, bottom sheet on phones, inline block (hook `displayPopupStudio` or `{widget name="popupstudio" id=ID}`), and a teaser tab that reopens a closed popup.
- **Drag-and-drop editor** with a live preview, multi-step popups, per-block mobile settings, undo and redo, a contrast check and per-language texts.
- **Triggers**: timer, exit intent (desktop and mobile), inactivity, scroll % or px, click on any CSS selector, Nth page of a visit, add to cart. Any or all.
- **Closing**: X (with optional delay), overlay, Esc, after N seconds, at a scroll position, at the end of a video, after the last step.
- **Targeting**: visitor type, first visit, customer group, past orders, newsletter status, cart value, cart contents, item count, page types, URL, UTM, referrer, country, language, currency, device, days and hours. AND inside a group, OR between groups. Stores, start and end dates.
- **Frequency**: every page, once per visit, every N days, once ever, a maximum number of showings, stop after conversion, wait after close. A shop-wide cap per visit.
- **Signups**: newsletter (ps_emailsubscription, double opt-in respected), a separate leads list with CSV export, GDPR consent text and log (psgdpr), first name and phone fields, a signed webhook.
- **Coupons**: fixed code or one unique cart rule per signup, auto-apply to the cart, expired-code clean-up.
- **Games**: wheel, scratch card, gift boxes, cards and envelopes. Prizes are drawn on the server with weights and stock.
- **Also**: countdowns, free-shipping meter, spend tiers, cart reminder, product cards, surveys, star ratings with written feedback, video, ticker, social links.
- **A/B tests** with sticky variants and a two-proportion z-test verdict.
- **Stats**: views, closes, clicks, signups, orders and revenue credited, per day, device and popup; survey answers and feedback.
- **Privacy and speed**: fonts bundled (no Google requests), videos load on click, no script is loaded on pages with no qualifying popup, bots and listed IPs excluded, reduced-motion respected.

## Languages
English, French, Spanish, Italian, Polish, German, Czech, Dutch, Portuguese, Russian. User guides in all ten are in `docs/`.

## Installation
1. Download the release zip.
2. Back office › Modules › Module Manager › **Upload a module**.
3. Open **Marketing › Popup Studio** and start from a template.

## Author and support
- Email: iamshoaibktk@gmail.com
- WhatsApp: +923459016286
- Fiverr: https://www.fiverr.com/shoaibktk
- GitHub: https://github.com/iamshoaibktk

## Fonts
The popup fonts are bundled so visitors' browsers never contact Google. They come from Google Fonts and keep their own licences (SIL Open Font License 1.1 or Apache 2.0); see `views/fonts/LICENSE.txt`.

## License
[Academic Free License 3.0 (AFL-3.0)](https://opensource.org/licenses/AFL-3.0)
