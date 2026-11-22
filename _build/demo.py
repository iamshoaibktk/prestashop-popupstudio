"""Build the public template demo (GitHub Pages, branch gh-pages) into _dev/dist/popupstudio-demo/.
Run from anywhere: python3 -I _build/demo.py   (rebuild templates first with _build/templates.py)"""
import glob, json, os, re, shutil, time

HERE = os.path.dirname(os.path.abspath(__file__))
MOD = os.path.dirname(HERE)
OUT = os.path.join(os.path.dirname(os.path.dirname(MOD)), '_dev', 'dist', 'popupstudio-demo')
REPO = 'https://github.com/iamshoaibktk/prestashop-popupstudio'

version = re.search(r"->version = '([^']+)'", open(os.path.join(MOD, 'popupstudio.php')).read()).group(1)
fonts = json.load(open(os.path.join(MOD, 'views', 'fonts', 'fonts.json')))

templates = []
for f in sorted(glob.glob(os.path.join(MOD, 'templates', '*.json'))):
    t = json.load(open(f, encoding='utf-8'))
    doc = t['doc']
    css_file = os.path.join(MOD, 'templates', 'css', t['slug'] + '.css')
    if os.path.exists(css_file):
        doc['css'] = open(css_file, encoding='utf-8').read()
    templates.append({'num': t['num'], 'slug': t['slug'], 'name': t['name'], 'group': t['group'], 'formatLabel': t['formatLabel'],
                      'tags': t.get('tags', []), 'doc': doc, 'game': (t.get('settings') or {}).get('game')})

# Storefront strings (countdown units, copy button...) in every language, as the shop would send them.
KEYS = {'close': 'Close', 'copy': 'Copy', 'copied': 'Copied', 'sending': 'Sending…', 'days': 'days', 'hours': 'hours',
        'minutes': 'minutes', 'seconds': 'seconds', 'pause': 'Pause', 'play': 'Play', 'applied': 'Applied to your cart.'}
LOC = {'en': 'en-US', 'fr': 'fr-FR', 'es': 'es-ES', 'it': 'it-IT', 'de': 'de-DE', 'nl': 'nl-NL', 'pl': 'pl-PL', 'cs': 'cs-CZ', 'pt': 'pt-PT', 'ru': 'ru-RU'}
shop = json.load(open(os.path.join(MOD, 'translations.json'), encoding='utf-8')).get('Shop', {})
i18n = {iso: {k: (src if iso == 'en' else (shop.get(src, {}).get(loc) or src)) for k, src in KEYS.items()} for iso, loc in LOC.items()}

langs = [['en', 'English'], ['fr', 'Français'], ['es', 'Español'], ['it', 'Italiano'], ['de', 'Deutsch'], ['nl', 'Nederlands'],
         ['pl', 'Polski'], ['cs', 'Čeština'], ['pt', 'Português'], ['ru', 'Русский']]
groups = [['all', 'All'], ['newsletter', 'Newsletter'], ['discount', 'Discount'], ['exit', 'Exit intent'], ['games', 'Games'],
          ['bars', 'Bars'], ['slidein', 'Slide-ins'], ['info', 'Info and notices'], ['seasonal', 'Seasonal']]
sample = {'shop': 'Your shop', 'cart_total': 45.5, 'cart_items': 3, 'free_threshold': 60, 'currency': {'iso': 'EUR', 'sign': '€'}, 'locale': 'en-GB',
          'last_category': '', 'cart': {'total': 45.5, 'total_fmt': '€45.50', 'lines': [
              {'name': 'Stoneware mug', 'attrs': 'Sand', 'qty': 2, 'total': '€21.50', 'img': ''},
              {'name': 'Canvas tote', 'attrs': 'Olive', 'qty': 1, 'total': '€24.00', 'img': ''}]},
          'products': {'bestseller:0': {'id': 1, 'name': 'Dome table lamp, brass', 'price': '€89.00', 'url': '#', 'img': '', 'qty': 4}}}

v = str(int(time.time()))
data = {'v': v, 'templates': templates, 'fonts': fonts, 'i18n': i18n, 'langs': langs, 'groups': groups, 'sample': sample}

ui = ''
for fam in ('Geist', 'Geist Mono'):
    for face in fonts.get(fam, []):
        ui += '@font-face{font-family:"%s";src:url("assets/fonts/%s") format("woff2");font-weight:%s;font-style:%s;font-display:swap;unicode-range:%s}\n' % (fam, face['f'], face['w'], face['s'], face['r'])

page = open(os.path.join(HERE, 'demo_page.html'), encoding='utf-8').read()
page = page.replace('/*__UIFONTS__*/', ui)
page = page.replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
page = page.replace('__REPO__', REPO).replace('__RELEASE__', REPO + '/releases/latest').replace('__VERSION__', version)

if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(os.path.join(OUT, 'assets', 'fonts'))
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page)
open(os.path.join(OUT, '.nojekyll'), 'w').write('')
shutil.copy(os.path.join(MOD, 'views', 'js', 'render.js'), os.path.join(OUT, 'assets', 'render.js'))
shutil.copy(os.path.join(MOD, 'views', 'css', 'front.css'), os.path.join(OUT, 'assets', 'front.css'))
for f in glob.glob(os.path.join(MOD, 'views', 'fonts', '*.woff2')):
    shutil.copy(f, os.path.join(OUT, 'assets', 'fonts'))
shutil.copy(os.path.join(MOD, 'views', 'fonts', 'LICENSE.txt'), os.path.join(OUT, 'assets', 'fonts', 'LICENSE.txt'))
print('demo written to', OUT, '(%d templates, %d KB page)' % (len(templates), os.path.getsize(os.path.join(OUT, 'index.html')) // 1024))
