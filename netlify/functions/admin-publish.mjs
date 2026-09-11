// "Publish site" for the admin: POST with the admin username/password (HTTP Basic) fires the Netlify
// build hook in PUBLISH_HOOK. Automatic builds on push are switched off in netlify.toml (build.ignore),
// so this is the only thing that deploys, and each publish costs one deploy's worth of Netlify credits.
import { createHash, timingSafeEqual } from "node:crypto";
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest();
const same = (a, b) => a.length === b.length && timingSafeEqual(a, b);
function authorized(req) {
  const { ADMIN_USER, ADMIN_PASSWORD_SHA256 } = process.env;
  const h = req.headers.get("authorization") || "";
  if (!h.startsWith("Basic ") || !ADMIN_USER || !ADMIN_PASSWORD_SHA256) return false;
  const [user = "", pass = ""] = Buffer.from(h.slice(6), "base64").toString("utf8").split(/:(.*)/s);
  return same(sha256(user), sha256(ADMIN_USER)) && same(sha256(pass), Buffer.from(ADMIN_PASSWORD_SHA256, "hex"));
}
export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!process.env.PUBLISH_HOOK) return json({ error: "PUBLISH_HOOK is not set in Netlify" }, 500);
  if (!authorized(req)) { await new Promise((r) => setTimeout(r, 1500)); return json({ error: "Wrong username or password." }, 401); }
  const r = await fetch(process.env.PUBLISH_HOOK, { method: "POST" });
  if (!r.ok) return json({ error: `Netlify said ${r.status}` }, 502);
  return json({ ok: true, message: "Publishing. The site updates in about a minute." });
};
export const config = { path: "/admin/api/publish" };
