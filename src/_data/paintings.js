// Paintings: one JSON file per piece in content/paintings (editable in /admin/). Sorted by "order", then filename.
// Thumbnails are generated here at build time with eleventy-img, so CMS uploads never need a thumbs folder.
import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";
const dir = path.resolve("content/paintings");
export default async function () {
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => ({ ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), _file: f }))
    .filter((p) => p.image && !p.hidden)
    .sort((a, b) => (Number(a.order) || 9999) - (Number(b.order) || 9999) || a._file.localeCompare(b._file));
  for (const p of rows) {
    const local = "." + p.image;
    if (!fs.existsSync(local)) { p.missing = true; continue; }
    const m = await Image(local, { widths: [640], formats: ["jpeg"], outputDir: "_site/assets/thumbs", urlPath: "/assets/thumbs", sharpJpegOptions: { quality: 80 } });
    const s = await Image(local, { statsOnly: true, widths: ["auto"], formats: ["jpeg"] });
    p.thumb = m.jpeg[0].url; p.w = s.jpeg[0].width; p.h = s.jpeg[0].height;
    p.shape = p.w > p.h * 1.15 ? "wide" : p.h > p.w * 1.15 ? "tall" : "sq";
  }
  return rows.filter((p) => !p.missing);
}
