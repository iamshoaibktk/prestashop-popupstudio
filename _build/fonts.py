"""Download the open-licence fonts used by the templates into views/fonts and write fonts.json.
Run: python3 -I _build/fonts.py  (from the module folder). Needs network access to fonts.googleapis.com."""
import json, os, re, sys, urllib.request, hashlib
MOD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(MOD, 'views', 'fonts')
FAM = {
 'Geist':'wght@400;500;600;700','Geist Mono':'wght@400;500;600',
 'Playfair Display':'ital,wght@0,400;0,700;0,900;1,600;1,700','Libre Franklin':'wght@400;500;600','IBM Plex Mono':'wght@500',
 'Nunito':'wght@500;700;800;900','Anton':'wght@400','Space Mono':'wght@400;700','Fraunces':'ital,wght@0,500;1,500;1,600','Work Sans':'wght@400;500;600',
 'Courier Prime':'wght@400;700','DM Serif Display':'ital@0;1','Inter Tight':'wght@400;500;700;900','Caveat':'wght@500;700','Karla':'wght@400;500;700',
 'JetBrains Mono':'wght@400;500;700;800','Cormorant':'ital,wght@0,500;1,500','Jost':'wght@300;400;500','Special Elite':'wght@400','Archivo':'wght@400;500;600;700','Archivo Black':'wght@400',
 'Plus Jakarta Sans':'wght@500;600;700;800','Bricolage Grotesque':'wght@500;800','DM Mono':'wght@400;500','Bitter':'wght@400;600;800','Big Shoulders Display':'wght@700;900','Barlow':'wght@500;600;700',
 'Gloock':'wght@400','Inter':'wght@400;500;600','Sora':'wght@400;600;700;800','Libre Baskerville':'ital,wght@0,400;0,700;1,400','Outfit':'wght@400;500;600;700','Marcellus':'wght@400','Manrope':'wght@400;500;600;700;800',
 'Rubik':'wght@400;500;600;700;900','IBM Plex Sans':'wght@400;500;600;700','Young Serif':'wght@400','Figtree':'wght@400;500;600;700','Gochi Hand':'wght@400','Bebas Neue':'wght@400',
 'Lilita One':'wght@400','Instrument Sans':'wght@400;500;600','Instrument Serif':'ital@0;1','Space Grotesk':'wght@500;700','Fredoka':'wght@400;500;600;700','Cinzel':'wght@500;700','Lato':'wght@400;700',
 'Shrikhand':'wght@400','Poppins':'wght@400;500;600;700','Unbounded':'wght@500;700','Red Hat Display':'wght@500;700;900','Red Hat Mono':'wght@600;700','Chivo':'wght@500;700;900','Chivo Mono':'wght@600',
 'Public Sans':'wght@400;600;800','Nunito Sans':'wght@400;600;700;800','Albert Sans':'wght@400;500;600;700','Epilogue':'wght@400;500;700;800','Lexend':'wght@400;500;600;700',
 'Cormorant Garamond':'ital,wght@0,500;0,600;1,500','Zilla Slab':'wght@400;600;700','Hanken Grotesk':'wght@400;500;600;700','Oswald':'wght@400;500;600','Mulish':'wght@400;600;700',
 'Della Respira':'wght@400','Quicksand':'wght@500;600;700','Righteous':'wght@400',
}
KEEP = {'latin','latin-ext','cyrillic','cyrillic-ext'}
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read() if binary else r.read().decode('utf-8')
manifest = {}
seen = {}
total = 0
for fam, axes in FAM.items():
    if fam.replace(' ', '') in ('Geist', 'GeistMono') and False:
        pass
    url = 'https://fonts.googleapis.com/css2?family=' + fam.replace(' ', '+') + ':' + axes + '&display=swap'
    try:
        css = get(url)
    except Exception as e:
        print('FAIL', fam, e); continue
    faces = []
    for sub, block in re.findall(r'/\*\s*([\w-]+)\s*\*/\s*@font-face\s*\{([^}]*)\}', css):
        if sub not in KEEP: continue
        src = re.search(r'url\((https://[^)]+\.woff2)\)', block).group(1)
        wt = re.search(r'font-weight:\s*([\d ]+);', block).group(1).strip()
        st = re.search(r'font-style:\s*(\w+);', block).group(1)
        rg = re.search(r'unicode-range:\s*([^;]+);', block).group(1).strip()
        if src not in seen:
            slug = re.sub(r'[^a-z0-9]+', '-', fam.lower()).strip('-')
            name = slug + '-' + hashlib.md5(src.encode()).hexdigest()[:8] + '.woff2'
            data = get(src, True)
            open(os.path.join(OUT, name), 'wb').write(data)
            total += len(data)
            seen[src] = name
        faces.append({'f': seen[src], 'w': wt, 's': st, 'r': rg})
    manifest[fam] = faces
    print(fam, len(faces))
json.dump(manifest, open(os.path.join(OUT, 'fonts.json'), 'w'), separators=(',', ':'))
print('files', len(seen), 'bytes', total)
