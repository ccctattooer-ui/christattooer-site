"""Convert Plant_Breeding_Images (HEIC/JPG) to web JPEGs in assets/plants, keeping existing plant-NNN
names stable (matched by source file name in _manifest.txt) and appending new photos as the next numbers.
Prints the new files so their captions can be added to content/departments/spacecraft.json.
"""
import os
from PIL import Image, ImageOps
import pillow_heif; pillow_heif.register_heif_opener()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(ROOT, "Plant_Breeding_Images"), os.path.join(ROOT, "assets", "plants")
os.makedirs(OUT, exist_ok=True)
manifest = os.path.join(OUT, "_manifest.txt")
known = {}  # source name -> output name
if os.path.exists(manifest):
    for line in open(manifest, encoding="utf-8"):
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 2: known[parts[1]] = parts[0]
n = max([int(v.split("-")[1].split(".")[0]) for v in known.values()] + [0])
rows, new = [], []
for f in sorted(os.listdir(SRC), key=str.lower):
    if not f.lower().endswith((".heic", ".jpg", ".jpeg", ".png")): continue
    if f in known: name = known[f]
    else: n += 1; name = f"plant-{n:03d}.jpg"; new.append((name, f))
    p = os.path.join(SRC, f)
    im = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
    if not os.path.exists(os.path.join(OUT, name)):
        full = im.copy(); full.thumbnail((1600, 1600), Image.LANCZOS)
        full.save(os.path.join(OUT, name), "JPEG", quality=85, optimize=True, progressive=True)
    rows.append((name, f, f"{im.size[0]}x{im.size[1]}"))
with open(manifest, "w", encoding="utf-8") as m:
    for r in rows: m.write("\t".join(r) + "\n")
print("plants:", len(rows), "new:", len(new))
for name, f in new: print("  ", name, "<-", f)
