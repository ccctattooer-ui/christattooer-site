// SpaceCraft genetics: one JSON file per plant in content/genetics (editable in /admin/).
// Each plant names its mother and father by id; the star chart works out generations from that.
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve("content/genetics");
export default function () {
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => ({ id: f.replace(/\.json$/, ""), ...JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }))
    .filter((n) => n.name);
  const ids = new Set(rows.map((n) => n.id));
  for (const n of rows) {
    for (const k of ["mother", "father"]) if (n[k] && !ids.has(n[k])) { console.warn(`[genetics] ${n.id}: unknown ${k} "${n[k]}" (ignored)`); n[k] = ""; }
    n.run = Number(n.run) || 0; n.flagship = !!n.flagship;
  }
  return rows.sort((a, b) => a.run - b.run || a.name.localeCompare(b.name));
}
