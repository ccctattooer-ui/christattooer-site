// Price sheet API at /admin/api/flash (Cloudflare Pages Function): bulk-edit size, hours, price and
// Ready on flash designs. POST { changes: [{ sku, size, hours, price, available }] } with HTTP Basic
// auth (the admin username/password) commits all changed content/flash/<SKU>.json files in ONE commit.
// Secrets: ADMIN_USER, ADMIN_PASSWORD_SHA256, GITHUB_TOKEN. Optional vars: GITHUB_REPO, GITHUB_BRANCH.

const enc = new TextEncoder();
const sha256 = async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const hex = (h) => new Uint8Array((h.match(/../g) || []).map((x) => parseInt(x, 16)));
const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const fromB64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));

async function authorized(request, env) {
  const h = request.headers.get("authorization") || "";
  if (!h.startsWith("Basic ") || !env.ADMIN_USER || !env.ADMIN_PASSWORD_SHA256) return false;
  const [user = "", pass = ""] = atob(h.slice(6)).split(/:(.*)/s);
  return same(await sha256(user), await sha256(env.ADMIN_USER)) && same(await sha256(pass), hex(env.ADMIN_PASSWORD_SHA256));
}

const clean = {
  size: (v) => String(v ?? "").trim().slice(0, 40),
  hours: (v) => (v === "" || v == null ? "" : Math.max(0, Math.round(Number(v) * 4) / 4)),
  price: (v) => Math.max(0, Math.round(Number(v) || 0)),
  available: (v) => v === true || v === "true" || v === 1,
};

export async function onRequestPost({ request, env }) {
  if (!env.GITHUB_TOKEN) return json({ error: "GITHUB_TOKEN is not set" }, 500);
  if (!(await authorized(request, env))) { await new Promise((r) => setTimeout(r, 1500)); return json({ error: "Wrong username or password." }, 401); }
  const REPO = env.GITHUB_REPO || "ccctattooer-ui/christattooer-site", BRANCH = env.GITHUB_BRANCH || "main";
  const gh = async (path, init = {}) => {
    const r = await fetch("https://api.github.com" + path, { ...init, headers: { authorization: `Bearer ${env.GITHUB_TOKEN}`, accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": "christattooer-admin", ...(init.headers || {}) } });
    if (!r.ok) throw new Error(`GitHub ${init.method || "GET"} ${path} -> ${r.status} ${(await r.text()).slice(0, 200)}`);
    return r.json();
  };

  let changes;
  try { changes = (await request.json()).changes; } catch (e) { return json({ error: "Bad JSON" }, 400); }
  if (!Array.isArray(changes) || !changes.length || changes.length > 100) return json({ error: "Send 1 to 100 changes." }, 400);

  try {
    const files = [];
    for (const c of changes) {
      const sku = String(c.sku || "");
      if (!/^FL-\d{3}$/.test(sku)) return json({ error: `Bad SKU ${sku}` }, 400);
      const path = `content/flash/${sku}.json`;
      const cur = await gh(`/repos/${REPO}/contents/${path}?ref=${BRANCH}`);
      const before = fromB64(cur.content);
      const next = { ...JSON.parse(before) };
      for (const k of ["size", "hours", "price", "available"]) if (k in c) next[k] = clean[k](c[k]);
      const text = JSON.stringify(next, null, 2) + "\n";
      if (text.trim() !== before.trim()) files.push({ path, mode: "100644", type: "blob", content: text });
    }
    if (!files.length) return json({ ok: true, committed: 0, message: "Nothing changed." });

    const head = (await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`)).object.sha;
    const commit = await gh(`/repos/${REPO}/git/commits/${head}`);
    const tree = await gh(`/repos/${REPO}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: commit.tree.sha, tree: files }) });
    const skus = files.map((f) => f.path.match(/FL-\d{3}/)[0]);
    const newCommit = await gh(`/repos/${REPO}/git/commits`, { method: "POST", body: JSON.stringify({ message: `Price sheet: ${skus.join(", ")}`, tree: tree.sha, parents: [head] }) });
    await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: newCommit.sha }) });
    return json({ ok: true, committed: files.length, skus, commit: newCommit.sha });
  } catch (e) {
    return json({ error: String(e.message || e) }, 502);
  }
}
