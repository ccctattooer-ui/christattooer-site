// Shared: sort rows by their position in src/_data/order.json (edited by drag-and-drop in /admin/).
// Rows missing from the list go last, in `fallback` order, so new uploads show up at the end until placed.
import fs from "node:fs";
export function byOrder(rows, key, slugOf, fallback) {
  let list = [];
  try { list = JSON.parse(fs.readFileSync("src/_data/order.json", "utf8"))[key] || []; } catch (e) {}
  const pos = new Map(list.map((s, i) => [s, i]));
  const p = (r) => (pos.has(slugOf(r)) ? pos.get(slugOf(r)) : Infinity);
  return [...rows].sort((a, b) => p(a) - p(b) || fallback(a, b));
}
