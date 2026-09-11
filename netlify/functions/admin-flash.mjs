// Price sheet API for /admin/prices/: bulk-edit size, hours, price and Ready on flash designs.
// POST { changes: [{ sku, size, hours, price, available }] } with HTTP Basic auth (the admin
// username/password) commits all changed content/flash/<SKU>.json files to GitHub in ONE commit.
import { createHash, timingSafeEqual } from "node:crypto";

const REPO = process.env.GITHUB_REPO || "ccctattooer-ui/christattooer-site";
const BRANCH = process.env.GITHUB_BRANCH || "main";
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

async function gh(path, init = {}) {
  const r = await fetch("https://api.github.com" + path, {
    ...init,
    headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": "christattooer-admin", ...(init.headers || {}) },
  });
  if (!r.ok) throw new Error(`GitHub ${init.method || "GET"} ${path} -> ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

const clean = {
  size: (v) => String(v ?? "").trim().slice(0, 40),
  hours: (v) => (v === "" || v == null ? "" : Math.max(0, Math.round(Number(v) * 4) / 4)),
  price: (v) => Math.max(0, Math.round(Number(v) || 0)),
  available: (v) => v === true || v === "true" || v === 1,
};

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!process.env.GITHUB_TOKEN) return json({ error: "GITHUB_TOKEN is not set in Netlify" }, 500);
  if (!authorized(req)) { await new Promise((r) => setTimeout(r, 1500)); return json({ error: "Wrong username or password." }, 401); }

  let changes;
  try { changes = (await req.json()).changes; } catch (e) { return json({ error: "Bad JSON" }, 400); }
  if (!Array.isArray(changes) || !changes.length || changes.length > 100) return json({ error: "Send 1 to 100 changes." }, 400);

  const files = [];
  for (const c of changes) {
    const sku = String(c.sku || "");
    if (!/^FL-\d{3}$/.test(sku)) return json({ error: `Bad SKU ${sku}` }, 400);
    const path = `content/flash/${sku}.json`;
    const cur = await gh(`/repos/${REPO}/contents/${path}?ref=${BRANCH}`);
    const data = JSON.parse(Buffer.from(cur.content, "base64").toString("utf8"));
    const next = { ...data };
    for (const k of ["size", "hours", "price", "available"]) if (k in c) next[k] = clean[k](c[k]);
    const text = JSON.stringify(next, null, 2) + "\n";
    if (text.trim() !== Buffer.from(cur.content, "base64").toString("utf8").trim()) files.push({ path, mode: "100644", type: "blob", content: text });
  }
  if (!files.length) return json({ ok: true, committed: 0, message: "Nothing changed." });

  const ref = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
  const head = ref.object.sha;
  const commit = await gh(`/repos/${REPO}/git/commits/${head}`);
  const tree = await gh(`/repos/${REPO}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree: files }) });
  const skus = files.map((f) => f.path.match(/FL-\d{3}/)[0]);
  const newCommit = await gh(`/repos/${REPO}/git/commits`, { method: "POST", body: JSON.stringify({ message: `Price sheet: ${skus.join(", ")}`, tree: tree.sha, parents: [head] }) });
  await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: newCommit.sha }) });
  return json({ ok: true, committed: files.length, skus, commit: newCommit.sha });
};

export const config = { path: "/admin/api/flash" };
