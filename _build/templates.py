"""Build templates/*.json and templates/css/*.css from the Python sources. Run: python3 -I _build/templates.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tpl_common import write
import i18n_templates
import font_fallback
import t_newsletter
mods = [t_newsletter]
for name in ('t_discount', 't_exit', 't_games', 't_bars', 't_slidein', 't_info', 't_seasonal'):
    try:
        mods.append(__import__(name))
    except ImportError:
        pass
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'templates')
tpls = [font_fallback.apply(i18n_templates.apply(f())) for m in mods for f in m.TEMPLATES]
if i18n_templates.missing:
    print('untranslated:', len(i18n_templates.missing), sorted(i18n_templates.missing)[:10])
write(tpls, out)
print(len(tpls), 'templates written')
