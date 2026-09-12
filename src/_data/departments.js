// Departments (ParlorOS desktop): one JSON file each in content/departments (editable in /admin/).
import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";
const dir = path.resolve("content/departments");
const small = async (src, width) => {
  const local = "." + src;
  if (!fs.existsSync(local)) return null;
  const fmt = /\.jpe?g$/i.test(src) ? "jpeg" : "webp";
  const m = await Image(local, { widths: [width], formats: [fmt], outputDir: "_site/assets/thumbs", urlPath: "/assets/thumbs", sharpJpegOptions: { quality: 80 } });
  return m[fmt][0].url;
};
export default async function () {
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .filter((d) => d.slug && d.name).sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  for (const d of rows) {
    d.iconSrc = (d.icon && (await small(d.icon, 128))) || d.icon;
    d.images = await Promise.all((d.images || []).filter((im) => im.image).map(async (im) => ({ ...im, thumb: (await small(im.image, 480)) || im.image })));
  }
  return rows;
}
