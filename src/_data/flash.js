// Flash designs: one JSON file per design in content/flash (editable in /admin/). Order comes from order.json, then SKU.
import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";
import { byOrder } from "../_lib/order.js";
const dir = path.resolve("content/flash");
export default async function () {
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => ({ ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), _file: f }))
    .filter((d) => d.image && d.name);
  // A small copy for the booking basket, so picking three designs doesn't pull three full-size
  // drawings down a phone connection.
  await Promise.all(rows.map(async (d) => {
    const local = "." + d.image;
    if (!fs.existsSync(local)) return;
    const m = await Image(local, { widths: [96], formats: ["webp"], outputDir: "_site/assets/thumbs", urlPath: "/assets/thumbs" });
    d.thumb = m.webp[0].url;
  }));
  return byOrder(rows, "flash", (d) => d._file.replace(/\.json$/, ""), (a, b) => String(a.sku).localeCompare(String(b.sku), "en", { numeric: true }));
}
