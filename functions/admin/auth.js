// Username/password login for the /admin/ CMS (Sveltia), as a Cloudflare Pages Function at /admin/auth.
// Speaks the same popup protocol as Netlify's GitHub OAuth so the CMS never sees GitHub: on success it
// hands the CMS the repo-scoped GitHub token in the GITHUB_TOKEN secret.
// Secrets: ADMIN_USER, ADMIN_PASSWORD_SHA256 (hex sha256 of the password), GITHUB_TOKEN.

const enc = new TextEncoder();
const sha256 = async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const hex = (h) => new Uint8Array((h.match(/../g) || []).map((x) => parseInt(x, 16)));
const same = (a, b) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; };

const page = (body, status = 200) =>
  new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Admin login</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#3B2380;font-family:system-ui,sans-serif;color:#15121A}
  form{background:#EFEAD9;border:3px solid #15121A;box-shadow:6px 6px 0 #15121A;padding:22px 24px;width:min(360px,calc(100vw - 32px))}
  h1{font-size:15px;letter-spacing:.08em;text-transform:uppercase;margin:0 0 14px}
  label{display:block;font-size:13px;font-weight:700;margin:10px 0 4px}
  input{width:100%;box-sizing:border-box;font:inherit;padding:9px 10px;border:2px solid #15121A;background:#fff}
  button{margin-top:16px;width:100%;font:inherit;font-weight:700;padding:10px;background:#4B2E9C;color:#fff;border:2px solid #15121A;box-shadow:3px 3px 0 #15121A;cursor:pointer}
  .err{background:#D3322A;color:#fff;padding:8px 10px;font-size:13px;margin-bottom:8px}
</style></head><body>${body}</body></html>`, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

const form = (err = "") => page(`<form method="post">
  <h1>Chris Tattooer · Admin</h1>
  ${err ? `<div class="err">${err}</div>` : ""}
  <label for="u">Username</label><input id="u" name="username" autocomplete="username" required autofocus>
  <label for="p">Password</label><input id="p" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Log in</button>
</form>`, err ? 401 : 200);

export async function onRequest({ request, env }) {
  const { ADMIN_USER, ADMIN_PASSWORD_SHA256, GITHUB_TOKEN } = env;
  if (!ADMIN_USER || !ADMIN_PASSWORD_SHA256 || !GITHUB_TOKEN) {
    return page(`<form><h1>Admin not configured</h1><p>Set ADMIN_USER, ADMIN_PASSWORD_SHA256 and GITHUB_TOKEN in the Cloudflare Pages project.</p></form>`, 500);
  }
  if (request.method !== "POST") return form();
  const data = await request.formData();
  const user = String(data.get("username") || ""), pass = String(data.get("password") || "");
  const ok = same(await sha256(user), await sha256(ADMIN_USER)) && same(await sha256(pass), hex(ADMIN_PASSWORD_SHA256));
  if (!ok) { await new Promise((r) => setTimeout(r, 1500)); return form("Wrong username or password."); }
  const payload = JSON.stringify({ provider: "github", token: GITHUB_TOKEN });
  return page(`<form><h1>Logged in</h1><p>Handing you back to the admin…</p></form>
<script>
  (function () {
    var msg = "authorization:github:success:" + ${JSON.stringify(payload)};
    function send(origin) { window.opener && window.opener.postMessage(msg, origin); }
    window.addEventListener("message", function (e) { if (e.data === "authorizing:github") { send(e.origin); setTimeout(function () { window.close(); }, 300); } });
    if (window.opener) window.opener.postMessage("authorizing:github", "*"); else document.querySelector("p").textContent = "Open this from the admin login button.";
  })();
</script>`);
}
