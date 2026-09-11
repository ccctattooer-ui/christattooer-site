// Game montages: one JSON file per YouTube video in content/videos (editable in /admin/).
import fs from "node:fs";
import path from "node:path";
import { byOrder } from "../_lib/order.js";
const dir = path.resolve("content/videos");
export default function () {
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .filter((v) => v.id && v.title);
  return byOrder(rows, "videos", (v) => v.id, (a, b) => a.title.localeCompare(b.title));
}
