"""Convert Tattoo_Images (HEIC/JPG) to web JPEGs in assets/tattoos (+thumbs), skipping any file whose
content also exists in Plant_Breeding_Images. Also converts plant photos to assets/plants.
Prints an old->new name mapping when a previous _manifest.txt exists.
"""
import os, hashlib, shutil, sys
from PIL import Image, ImageOps
import pillow_heif; pillow_heif.register_heif_opener()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""): h.update(chunk)
    return h.hexdigest()
def convert(src_dir, out_dir, prefix, skip_hashes=()):
    thumbs = os.path.join(out_dir, "thumbs")
    if os.path.isdir(out_dir): shutil.rmtree(out_dir)
    os.makedirs(thumbs)
    files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith((".heic", ".jpg", ".jpeg", ".png")))
    rows, skipped, n = [], [], 0
    for f in files:
        p = os.path.join(src_dir, f)
        if md5(p) in skip_hashes or f in NOT_TATTOOS: skipped.append(f); continue
        n += 1; name = f"{prefix}-{n:03d}.jpg"
        im = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
        full = im.copy(); full.thumbnail((1600, 1600), Image.LANCZOS)
        full.save(os.path.join(out_dir, name), "JPEG", quality=85, optimize=True, progressive=True)
        th = im.copy(); th.thumbnail((480, 480), Image.LANCZOS)
        th.save(os.path.join(thumbs, name), "JPEG", quality=80, optimize=True)
        rows.append((name, f, f"{im.size[0]}x{im.size[1]}"))
    with open(os.path.join(out_dir, "_manifest.txt"), "w") as m:
        for r in rows: m.write("\t".join(r) + "\n")
    return rows, skipped
plants_dir = os.path.join(ROOT, "Plant_Breeding_Images")
plant_hashes = {md5(os.path.join(plants_dir, f)) for f in os.listdir(plants_dir)}
# Source files that are plant photos living in Tattoo_Images (re-encoded copies exist in Plant_Breeding_Images)
NOT_TATTOOS = {"IMG_0208.HEIC","IMG_0211.HEIC","IMG_0216.HEIC","IMG_2082.HEIC","IMG_2084.HEIC","IMG_8304.HEIC"}
old_manifest = os.path.join(ROOT, "assets", "tattoos", "_manifest.txt")
old = {}
if os.path.exists(old_manifest):
    for line in open(old_manifest):
        name, src, _ = line.rstrip("\n").split("\t"); old[src] = name
rows, skipped = convert(os.path.join(ROOT, "Tattoo_Images"), os.path.join(ROOT, "assets", "tattoos"), "tattoo", plant_hashes)
print("tattoos:", len(rows), "skipped (duplicates of plant photos):", skipped)
mapping = {old[src]: name for name, src, _ in rows if src in old and old[src] != name}
with open(os.path.join(ROOT, "assets", "tattoos", "_renamed.txt"), "w") as f:
    for k, v in mapping.items(): f.write(f"{k}\t{v}\n")
print("renamed:", len(mapping))
prow, _ = convert(plants_dir, os.path.join(ROOT, "assets", "plants"), "plant")
print("plants:", len(prow))
# remap references inside mockups in a single pass
import re
for f in os.listdir(os.path.join(ROOT, "mockups")):
    if not f.endswith(".html"): continue
    p = os.path.join(ROOT, "mockups", f); s = open(p, encoding="utf-8").read()
    s2 = re.sub(r"tattoo-\d{3}\.jpg", lambda m: mapping.get(m.group(0), m.group(0)), s)
    if s2 != s: open(p, "w", encoding="utf-8").write(s2); print("remapped", f)
