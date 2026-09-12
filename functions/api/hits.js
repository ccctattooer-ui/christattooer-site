// The visitor counter at /api/hits.
// GET  reads the number. POST adds one and reads it back.
// The page only POSTs once per browser session, so this counts visits rather than page views, and
// anything that doesn't run JavaScript (most bots) never reaches it.
// Needs the D1 binding DB. Without it every call answers {ok:false} and the footer simply stays quiet.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function read(env) {
  const row = await env.DB.prepare("SELECT n FROM counters WHERE name = 'hits'").first();
  return row ? Number(row.n) : 0;
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false, reason: "no-db" });
  try {
    return json({ ok: true, n: await read(env) });
  } catch (e) {
    return json({ ok: false, reason: "query-failed" });
  }
}

export async function onRequestPost({ env }) {
  if (!env.DB) return json({ ok: false, reason: "no-db" });
  try {
    // One statement, so two visitors landing together can't read the same number and both write it back.
    await env.DB.prepare(
      "INSERT INTO counters (name, n) VALUES ('hits', 1) " +
      "ON CONFLICT(name) DO UPDATE SET n = n + 1"
    ).run();
    return json({ ok: true, n: await read(env) });
  } catch (e) {
    return json({ ok: false, reason: "write-failed" });
  }
}
