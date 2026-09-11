"""Inline ../assets/ image references as data URIs so a mockup can be published standalone.
Usage: python tools/build_mockups.py <out_dir>
"""
import os, re, sys, base64, io
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOCK = os.path.join(ROOT, "mockups")
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
cache = {}
def data_uri(rel):
    if rel in cache: return cache[rel]
    path = os.path.normpath(os.path.join(MOCK, rel))
    im = Image.open(path)
    if path.lower().endswith(".png"):
        im.thumbnail((420, 420), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "PNG", optimize=True); mime = "image/png"
    else:
        im = im.convert("RGB"); im.thumbnail((520, 520), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, "JPEG", quality=78, optimize=True); mime = "image/jpeg"
    uri = f"data:{mime};base64," + base64.b64encode(buf.getvalue()).decode()
    cache[rel] = uri
    return uri
for f in sorted(os.listdir(MOCK)):
    if not f.endswith(".html"): continue
    html = open(os.path.join(MOCK, f), encoding="utf-8").read()
    html = re.sub(r"\.\./assets/[\w\-/]+\.(?:png|jpg)", lambda m: data_uri(m.group(0)), html)
    out = os.path.join(OUT, f)
    open(out, "w", encoding="utf-8").write(html)
    print(f, f"{len(html)/1e6:.2f} MB")
