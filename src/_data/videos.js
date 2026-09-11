// Game montages: content/videos.json holds the playlist in play order (drag to sort in /admin/).
import fs from "node:fs";
export default function () {
  return (JSON.parse(fs.readFileSync("content/videos.json", "utf8")).videos || []).filter((v) => v.id && v.title);
}
