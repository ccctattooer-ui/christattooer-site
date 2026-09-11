"""Convert Paintings (HEIC/JPG) to web JPEGs in assets/paintings. Duplicate files (same bytes)
are converted once. Keeps existing painting-NNN names stable via _manifest.txt so departments.json keys hold.
"""
import os, hashlib
from PIL import Image, ImageOps
import pillow_heif; pillow_heif.register_heif_opener()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(ROOT, "Paintings"), os.path.join(ROOT, "assets", "paintings")
def md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""): h.update(chunk)
    return h.hexdigest()
manifest = os.path.join(OUT, "_manifest.txt")
known = {}  # md5 -> name
if os.path.exists(manifest):
    for line in open(manifest):
        name, h, src, size = line.rstrip("\n").split("\t"); known[h] = name
rows, n = [], max([int(v.split("-")[1].split(".")[0]) for v in known.values()] + [0])
seen = set()
for f in sorted(os.listdir(SRC)):
    if not f.lower().endswith((".heic", ".jpg", ".jpeg", ".png")): continue
    p = os.path.join(SRC, f); h = md5(p)
    if h in seen: print("duplicate, skipped:", f); continue
    seen.add(h)
    if h in known: name = known[h]
    else: n += 1; name = f"painting-{n:03d}.jpg"
    im = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    if not os.path.exists(os.path.join(OUT, name)):
        full = im.copy(); full.thumbnail((1600, 1600), Image.LANCZOS)
        full.save(os.path.join(OUT, name), "JPEG", quality=85, optimize=True, progressive=True)
    rows.append((name, h, f, f"{im.size[0]}x{im.size[1]}"))
with open(manifest, "w") as m:
    for r in rows: m.write("\t".join(r) + "\n")
print("paintings:", len(rows))
