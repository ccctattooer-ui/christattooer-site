// Flash designs: one JSON file per design in content/flash (editable in /admin/). Order comes from order.json, then SKU.
import fs from "node:fs";
import path from "node:path";
import { byOrder } from "../_lib/order.js";
const dir = path.resolve("content/flash");
export default function () {
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => ({ ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")), _file: f }))
    .filter((d) => d.image && d.name);
  return byOrder(rows, "flash", (d) => d._file.replace(/\.json$/, ""), (a, b) => String(a.sku).localeCompare(String(b.sku), "en", { numeric: true }));
}
