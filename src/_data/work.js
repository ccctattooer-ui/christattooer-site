// Healed & recent work: one JSON file per photo in content/work (editable in /admin/). Thumbs are built here.
import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";
const dir = path.resolve("content/work");
export default async function () {
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => ({ ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), file: f.replace(/\.json$/, "") }))
    .filter((w) => w.image).sort((a, b) => a.file.localeCompare(b.file, "en", { numeric: true }));
  for (const w of rows) {
    const local = "." + w.image;
    if (!fs.existsSync(local)) { w.missing = true; continue; }
    const m = await Image(local, { widths: [480], formats: ["jpeg"], outputDir: "_site/assets/thumbs", urlPath: "/assets/thumbs", sharpJpegOptions: { quality: 80 } });
    w.thumb = m.jpeg[0].url;
  }
  return rows.filter((w) => !w.missing);
}
