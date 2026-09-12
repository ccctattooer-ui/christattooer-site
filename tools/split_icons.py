"""Final cut of the two icon sheets.

Cell boxes and caption clips are explicit, measured off the sheets — the art on several cells
touches its caption, so no automatic rule separated them reliably. Background is flooded in
from the sheet border so the whites inside an icon (skull, calendar, folded shirts) survive.
"""
import json
import os
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

NEAR_WHITE = 26

# name, x0, y0, x1, clipY  — clipY is the bottom of the ART, captions sit below it
S1 = [
    # big row 1
    ("art",            42,   11,  309,  306),
    ("games",          344,  11,  658,  300),
    ("shop",           690,  11,  970,  325),
    ("explore",        995,  11, 1315,  308),
    # big row 2
    ("tattoos",        30,  350,  314,  634),
    ("booking",        332, 350,  647,  636),
    ("merch",          673, 350,  986,  641),
    ("skate",          1022,350, 1300,  640),
    # heroes
    ("memento-mori",   44,  686,  630, 1224),
    ("web-is-ours",    681, 686, 1298, 1192),
]
S1_BANDS = [
    (1297, 1418, [".txt", "starchart", "roster", "dossier", "gallery", "recycle", "videos", "booking-form", "mail"]),
    (1471, 1576, ["home", "search", "download", "about", "chat", "links", "favorites", "settings", "login"]),
    (1620, 1743, ["zen", "music", "media", "computer", "archive", "food", "travel", "diy", "cool-stuff"]),
    (1792, 1926, ["news", "punk", "arcade", "inspo", "mixtapes", "pets", "support", "random", "tattoo-cursor"]),
]

S2 = [
    ("art",            13,    0,  244,  340),
    ("games",          260,   0,  506,  340),
    ("shop-alien",     526,   0,  734,  340),
    ("explore",        746,   0,  997,  340),
    ("tattoos",        21,  340,  250,  620),
    ("booking-appt",   255, 340,  515,  620),
    ("ufo-cow",        520, 340,  750,  620),
    ("merch-web",      759, 340,  991,  620),
    ("skull-holo",     10,  620,  490, 1118),
    ("world-wide-web", 495, 620,  995, 1050),
]
S2_BANDS = [
    (1120, 1250, [".txt", "starchart", "roster", "dossier", "gallery", "recycle", "video", "booking-form", "tattoo-cursor"]),
]


def prep(path):
    im = Image.open(path).convert("RGB")
    rgb = np.array(im)
    near = (255 - rgb.astype(np.int16)).max(axis=2) <= NEAR_WHITE
    lab, _ = ndimage.label(near)
    border = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    border.discard(0)
    paper = np.isin(lab, list(border))
    fg = ndimage.binary_closing(~paper, np.ones((3, 3)))
    rgba = np.dstack([rgb, np.where(paper, 0, 255).astype(np.uint8)])
    return im, fg, rgba


def runs(flags, min_len):
    out, s = [], None
    for i, f in enumerate(flags):
        if f and s is None:
            s = i
        elif not f and s is not None:
            if i - s >= min_len:
                out.append((s, i))
            s = None
    if s is not None and len(flags) - s >= min_len:
        out.append((s, len(flags)))
    return out


def trim_save(im, fg, rgba, x0, y0, x1, y1, path, pad=8):
    cell = fg[y0:y1, x0:x1]
    ys = np.where(cell.sum(axis=1) > 0)[0]
    xs = np.where(cell.sum(axis=0) > 0)[0]
    if not len(ys) or not len(xs):
        return None
    ay0 = max(0, y0 + int(ys[0]) - pad)
    ay1 = min(y1, y0 + int(ys[-1]) + 1 + pad)
    ax0 = max(0, x0 + int(xs[0]) - pad)
    ax1 = min(im.width, x0 + int(xs[-1]) + 1 + pad)
    img = Image.fromarray(rgba[ay0:ay1, ax0:ax1], "RGBA")
    s = max(img.size)
    sq = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    sq.paste(img, ((s - img.width) // 2, (s - img.height) // 2), img)
    sq.save(path)
    return sq.size


def run(path, cells, bands, out_dir, tag):
    im, fg, rgba = prep(path)
    os.makedirs(out_dir, exist_ok=True)
    made = []
    for name, x0, y0, x1, cy in cells:
        sz = trim_save(im, fg, rgba, x0, y0, x1, cy, os.path.join(out_dir, name + ".png"))
        if sz:
            made.append({"name": name, "size": list(sz), "kind": "large"})
    for y0, cy, names in bands:
        sub = fg[y0:cy]
        gaps = runs(sub.sum(axis=0) < 2, 12)
        edges = [0] + [(a + b) // 2 for a, b in gaps] + [sub.shape[1]]
        cols = []
        for a, b in zip(edges, edges[1:]):
            if sub[:, a:b].sum() > 150:
                xs = np.where(sub[:, a:b].sum(axis=0) > 1)[0]
                cols.append((a + int(xs[0]), a + int(xs[-1]) + 1))
        if len(cols) != len(names):
            print(f"  !! band y{y0}: {len(cols)} columns, expected {len(names)}")
        for i, (x0, x1) in enumerate(cols):
            name = "sm-" + (names[i] if i < len(names) else f"c{i}")
            sz = trim_save(im, fg, rgba, x0, y0, x1, cy, os.path.join(out_dir, name + ".png"), pad=5)
            if sz:
                made.append({"name": name, "size": list(sz), "kind": "small"})
    print(f"{tag}: {len(made)} icons -> {out_dir}")
    return made


if __name__ == "__main__":
    out = sys.argv[1]
    m = {
        "sheet1": run("docs/icon-sheets/Icons_1_FirstPicks.png", S1, S1_BANDS, os.path.join(out, "sheet1"), "sheet1"),
        "sheet2": run("docs/icon-sheets/Icons_2_supplementary.png", S2, S2_BANDS, os.path.join(out, "sheet2"), "sheet2"),
    }
    with open(os.path.join(out, "manifest.json"), "w") as f:
        json.dump(m, f, indent=2)
