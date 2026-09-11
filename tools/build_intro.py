"""Build the landing-page TV montage from the clips and photos in AboutMe/.

Output (assets/intro/): montage.mp4 (H.264, plays everywhere including iPhone) and poster.jpg (first frame). Everything is 480x360 (4:3, like a CRT; it is shown at most 560px wide behind scanlines), 24 fps, silent.

EDIT below is the cut: (file, start seconds, length seconds). Photos get a slow Ken Burns zoom.
"static" inserts a burst of TV snow (channel change). Anything in AboutMe/ that is not listed is
appended automatically with a short snippet, so new clips show up without editing this file.
Requires ffmpeg on PATH (winget install Gyan.FFmpeg) and pillow + pillow-heif.
"""
import os, sys, json, subprocess, shutil, hashlib, tempfile
from PIL import Image, ImageOps, ImageFilter
import pillow_heif; pillow_heif.register_heif_opener()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, OUT = os.path.join(ROOT, "AboutMe"), os.path.join(ROOT, "assets", "intro")
W, H, FPS = 480, 360, 24
STATIC = 0.25  # seconds of snow between groups

EDIT = [
    "static",
    ("IMG_6136.heic", 0, 2.6),          # wave hello
    ("IMG_8543.mov", 2.0, 2.4),         # tattooing, close
    ("IMG_6782.MOV", 0.8, 2.4),         # drawings on the desk
    "static",
    ("zo3dby.mov", 1.2, 3.2),           # two quickscope eliminations
    "static",
    ("IMG_8202.MOV", 0.3, 2.2),         # the shop chair
    ("IMG_6228(1).MOV", 3.0, 2.6),      # head tattoo
    ("s841.jpg", 0, 2.6),               # black and white at work
    "static",
    ("IMG_9413(1).mov", 2.4, 3.0),      # one shot, one kill
    "static",
    ("IMG_8566.MOV", 1.0, 2.6),         # fresh tattoo, wipe
    ("IMG_8545.mov", 7.0, 2.6),         # wide shop shot
    "static",
    ("ninemagtv - ram7 lockwood.mp4", 11.6, 3.0),  # the kill streak
    "static",
    ("IMG_8425.HEIC", 0, 2.4),          # plants
    ("IMG_5340.MOV", 0, 2.3),           # beach with the dog
    "static",
    ("zo3dby.mov", 5.4, 2.2),           # two more scope kills
    ("My Movie 4.mov", 7.0, 1.6),       # hand cam
    "static",
    ("IMG_0410.HEIC", 0, 2.2),          # red mirror selfie
    "static",
]

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode: raise SystemExit("ffmpeg failed:\n" + " ".join(args) + "\n" + r.stderr[-1500:])

def probe(p):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", p], capture_output=True, text=True).stdout or "{}")
    v = next((s for s in j.get("streams", []) if s.get("codec_type") == "video"), None)
    return (float(j["format"].get("duration", 0)) if v else 0), v

def is_video(p):
    d, v = probe(p); return d > 0.5

def frame_43(im):
    """Fit any image into 4:3 over a blurred, darkened copy of itself (TV pillarbox)."""
    im = ImageOps.exif_transpose(im).convert("RGB")
    bg = ImageOps.fit(im, (W * 2, H * 2)).filter(ImageFilter.GaussianBlur(28)).point(lambda v: int(v * 0.55))
    fg = im.copy(); fg.thumbnail((W * 2, H * 2))
    bg.paste(fg, ((W * 2 - fg.width) // 2, (H * 2 - fg.height) // 2)); return bg

def seg_static(out, secs):
    run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"nullsrc=s={W}x{H}:r={FPS}", "-vf", "geq=random(1)*255:128:128,format=yuv420p", "-t", str(secs), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", out])

def seg_photo(src, out, secs, tmp):
    png = os.path.join(tmp, hashlib.md5(src.encode()).hexdigest() + ".png"); frame_43(Image.open(src)).save(png)
    n = int(secs * FPS)
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", png, "-vf", f"zoompan=z='min(1+0.0018*on,1.22)':d={n}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},format=yuv420p", "-frames:v", str(n), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", out])

def seg_video(src, out, start, secs):
    d, v = probe(src)
    start = max(0, min(start, max(0, d - secs)))
    rot = 0
    for sd in (v or {}).get("side_data_list", []): rot = sd.get("rotation", rot)
    portrait = (v["height"] > v["width"]) != (abs(rot) == 90)
    if portrait:
        vf = (f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=24:2,eq=brightness=-0.2[bg];"
              f"[b]scale=-2:{H}[fg];[bg][fg]overlay=(W-w)/2:0,fps={FPS},format=yuv420p")
    else:
        vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=yuv420p"
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(secs), "-i", src, "-filter_complex" if portrait else "-vf", vf, "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", out])

def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="intro-")
    listed = {e[0] for e in EDIT if isinstance(e, tuple)}
    seen = set(); extra = []
    for f in sorted(os.listdir(SRC)):
        p = os.path.join(SRC, f)
        h = hashlib.md5(open(p, "rb").read(1 << 22)).hexdigest()
        if h in seen or f in listed: seen.add(h); continue
        seen.add(h)
        if is_video(p): extra.append((f, 0.3 * probe(p)[0], 2.0))
        elif f.lower().endswith((".jpg", ".jpeg", ".png", ".heic")): extra.append((f, 0, 2.2))
    cut = EDIT + extra + (["static"] if extra else [])
    parts = []
    for i, e in enumerate(cut):
        out = os.path.join(tmp, f"{i:03d}.mp4")
        if e == "static": seg_static(out, STATIC)
        else:
            f, start, secs = e; p = os.path.join(SRC, f)
            if not os.path.exists(p): print("missing, skipped:", f); continue
            (seg_video if is_video(p) else seg_photo)(p, out, *((start, secs) if is_video(p) else (secs, tmp)))
        parts.append(out); print("segment", i, e if e == "static" else e[0])
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w", encoding="utf-8") as fh:
        for p in parts: fh.write(f"file '{p.replace(os.sep, '/')}'\n")
    look = "eq=saturation=1.12:contrast=1.05"  # the CRT look (scanlines, glare, flicker) is CSS on the page
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf", look, "-an", "-c:v", "libx264", "-profile:v", "main", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart", os.path.join(OUT, "montage.mp4")])
    run(["ffmpeg", "-v", "error", "-y", "-ss", "0.9", "-i", os.path.join(OUT, "montage.mp4"), "-frames:v", "1", "-q:v", "4", os.path.join(OUT, "poster.jpg")])
    shutil.rmtree(tmp, ignore_errors=True)
    for f in ("montage.mp4", "poster.jpg"):
        print(f, round(os.path.getsize(os.path.join(OUT, f)) / 1e6, 2), "MB")
    print("duration", round(probe(os.path.join(OUT, "montage.mp4"))[0], 1), "s")

if __name__ == "__main__": main()
