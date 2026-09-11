// Flash designs: one JSON file per design in content/flash (editable in /admin/). Sorted by SKU.
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve("content/flash");
export default function () {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => ({ ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), _file: f }))
    .filter((d) => d.image && d.name)
    .sort((a, b) => String(a.sku).localeCompare(String(b.sku), "en", { numeric: true }));
}
