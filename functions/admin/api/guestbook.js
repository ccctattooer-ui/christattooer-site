// Guestbook moderation at /admin/api/guestbook, behind the same HTTP Basic auth as the price sheet.
//   GET                          — every entry, waiting ones first.
//   POST {action, ids:[...]}     — approve, hide or delete them.
// Secrets: ADMIN_USER, ADMIN_PASSWORD_SHA256. Needs the D1 binding DB.

const enc = new TextEncoder();
const sha256 = async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const hex = (h) => new Uint8Array((h.match(/../g) || []).map((x) => parseInt(x, 16)));
const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; };
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function authorized(request, env) {
  const h = request.headers.get("authorization") || "";
  if (!h.startsWith("Basic ") || !env.ADMIN_USER || !env.ADMIN_PASSWORD_SHA256) return false;
  const [user = "", pass = ""] = atob(h.slice(6)).split(/:(.*)/s);
  return same(await sha256(user), await sha256(env.ADMIN_USER)) &&
         same(await sha256(pass), hex(env.ADMIN_PASSWORD_SHA256));
}

const guard = async (request, env) => {
  if (!(await authorized(request, env))) {
    await new Promise((r) => setTimeout(r, 1500));
    return json({ error: "Wrong username or password." }, 401);
  }
  if (!env.DB) return json({ error: "The guestbook database isn't connected yet." }, 503);
  return null;
};

export async function onRequestGet({ request, env }) {
  const stop = await guard(request, env);
  if (stop) return stop;
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, message, created_at, approved FROM guestbook ORDER BY approved ASC, created_at DESC LIMIT 300"
    ).all();
    return json({ ok: true, entries: results || [] });
  } catch (e) {
    return json({ error: String(e.message || e) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const stop = await guard(request, env);
  if (stop) return stop;

  let body;
  try { body = await request.json(); } catch (e) { return json({ error: "Bad JSON" }, 400); }

  const ids = (Array.isArray(body.ids) ? body.ids : []).map(Number).filter(Number.isInteger);
  const action = String(body.action || "");
  if (!ids.length || ids.length > 300) return json({ error: "Pick between 1 and 300 entries." }, 400);
  if (!["approve", "hide", "delete"].includes(action)) return json({ error: "Unknown action." }, 400);

  const marks = ids.map(() => "?").join(",");
  const sql = action === "delete"
    ? `DELETE FROM guestbook WHERE id IN (${marks})`
    : `UPDATE guestbook SET approved = ${action === "approve" ? 1 : 0} WHERE id IN (${marks})`;

  try {
    const res = await env.DB.prepare(sql).bind(...ids).run();
    return json({ ok: true, action, changed: res.meta ? res.meta.changes : ids.length });
  } catch (e) {
    return json({ error: String(e.message || e) }, 500);
  }
}
