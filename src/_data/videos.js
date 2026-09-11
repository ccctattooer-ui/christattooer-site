// Game montages: one JSON file per YouTube video in content/videos (editable in /admin/).
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve("content/videos");
export default function () {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .filter((v) => v.id && v.title)
    .sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999) || a.title.localeCompare(b.title));
}
