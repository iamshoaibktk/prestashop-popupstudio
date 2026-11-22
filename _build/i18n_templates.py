"""Add the other 9 languages to every template text. Tables: _build/i18n/<iso>.json (English -> translation)."""
import json, os, re

LANGS = ['fr', 'es', 'it', 'de', 'nl', 'pl', 'cs', 'pt', 'ru']
_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'i18n')
TABLES = {iso: json.load(open(os.path.join(_DIR, iso + '.json'), encoding='utf-8')) for iso in LANGS if os.path.exists(os.path.join(_DIR, iso + '.json'))}
missing = set()


def tr(iso, s):
    t = TABLES.get(iso, {}).get(s)
    if t is None:
        t = TABLES.get(iso, {}).get(s.strip())
        if t is None:
            missing.add(s)
            return None
    lead = s[:len(s) - len(s.lstrip(' '))]
    trail = s[len(s.rstrip(' ')):]
    return lead + t.strip(' ') + trail


def html_map(html):
    """Translate visible text nodes inside decor or HTML-block markup; returns a lang map or the string unchanged."""
    nodes = [n.strip() for n in re.findall(r'>([^<>]+)<', html) if n.strip()]
    hits = [n for n in nodes if any(n in TABLES[i] for i in TABLES)]
    if not hits:
        return html
    out = {'en': html}
    for iso in TABLES:
        out[iso] = re.sub(r'>([^<>]+)<', lambda m: '>' + (TABLES[iso].get(m.group(1).strip(), m.group(1).strip()) if m.group(1).strip() in TABLES[iso] else m.group(1)) + '<', html)
    return out


def walk(n):
    if isinstance(n, dict):
        if set(n.keys()) == {'en'} and isinstance(n['en'], str) and n['en'].strip():
            for iso in TABLES:
                t = tr(iso, n['en'])
                if t is not None:
                    n[iso] = t
            return n
        for k, v in list(n.items()):
            if k == 'html' and isinstance(v, str):
                n[k] = html_map(v)
            else:
                n[k] = walk(v)
        return n
    if isinstance(n, list):
        return [walk(v) for v in n]
    return n


def apply(tpl):
    return walk(tpl)
