// Paintings: content/paintings.json holds the collage pieces in board order (drag to sort in /admin/).
// Thumbnails are generated here at build time with eleventy-img, so CMS uploads never need a thumbs folder.
import fs from "node:fs";
import Image from "@11ty/eleventy-img";
export default async function () {
  const rows = (JSON.parse(fs.readFileSync("content/paintings.json", "utf8")).pieces || [])
    .filter((p) => p.image && !p.hidden);
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
