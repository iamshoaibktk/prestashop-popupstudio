"""Give template fonts a bundled fallback that covers Cyrillic and Latin Extended (Russian, Polish, Czech).
unicode-range means the fallback only downloads when such characters are on the page."""
import json, os

_F = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'views', 'fonts', 'fonts.json')))
SERIF = {'Playfair Display', 'DM Serif Display', 'Fraunces', 'Gloock', 'Instrument Serif', 'Young Serif', 'Libre Baskerville', 'Cinzel', 'Marcellus', 'Della Respira'}
SLAB = {'Zilla Slab'}
CONDENSED = {'Anton', 'Bebas Neue', 'Big Shoulders Display', 'Archivo Black'}
MONO = {'Chivo Mono', 'DM Mono', 'Red Hat Mono', 'Space Mono'}
TYPEWRITER = {'Courier Prime', 'Special Elite'}
SCRIPT = {'Gochi Hand'}
ROUNDED = {'Fredoka', 'Lilita One', 'Righteous', 'Quicksand', 'Shrikhand'}


def covers(fam):
    r = ' '.join(x['r'] for x in _F.get(fam, [])).upper()
    return 'U+0400' in r or 'U+0301' in r, 'U+0100' in r


def pick(fam):
    if fam in SERIF:
        return '"Playfair Display", Georgia, serif', 'Playfair Display'
    if fam in SLAB:
        return '"Bitter", Georgia, serif', 'Bitter'
    if fam in CONDENSED:
        return '"Oswald", "Arial Narrow", sans-serif', 'Oswald'
    if fam in MONO:
        return '"JetBrains Mono", ui-monospace, monospace', 'JetBrains Mono'
    if fam in TYPEWRITER:
        return '"IBM Plex Mono", ui-monospace, monospace', 'IBM Plex Mono'
    if fam in SCRIPT:
        return '"Caveat", cursive', 'Caveat'
    if fam in ROUNDED:
        return '"Nunito", system-ui, sans-serif', 'Nunito'
    return '"Inter", system-ui, sans-serif', 'Inter'


def apply(tpl):
    doc = tpl.get('doc', {})
    th = doc.setdefault('theme', {})
    fonts = doc.setdefault('fonts', [])
    for k in ('fh', 'fb'):
        fam = th.get(k)
        if not fam or fam not in _F:
            continue
        cyr, ext = covers(fam)
        if cyr and ext:
            continue
        stack, add = pick(fam)
        th.setdefault('ffb', {})[fam] = stack
        if add not in fonts:
            fonts.append(add)
    return tpl
