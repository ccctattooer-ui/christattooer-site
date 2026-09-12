// Worker entry: routes the three server endpoints to their handlers in functions/ and serves
// everything else from the static build (_site) through the ASSETS binding.
import * as auth from "../functions/admin/auth.js";
import * as flash from "../functions/admin/api/flash.js";
import * as book from "../functions/api/book.js";
import * as hits from "../functions/api/hits.js";
import * as guestbook from "../functions/api/guestbook.js";
import * as gbAdmin from "../functions/admin/api/guestbook.js";

const routes = {
  "/admin/auth": auth,
  "/admin/api/flash": flash,
  "/admin/api/guestbook": gbAdmin,
  "/api/book": book,
  "/api/hits": hits,
  "/api/guestbook": guestbook,
};

// Static-asset serving ignores Range headers, and Safari (iPhone) refuses to play a video unless the
// server honours them. So for media files we fetch the whole asset and slice it ourselves (206).
const MEDIA = /\.(mp4|m4v|webm|mov|mp3|m4a)$/i;
async function serveMedia(request, env) {
  const full = await env.ASSETS.fetch(new Request(request.url, { method: "GET" }));
  if (!full.ok) return full;
  const buf = await full.arrayBuffer();
  const total = buf.byteLength;
  const type = full.headers.get("content-type") || "application/octet-stream";
  const base = { "content-type": type, "accept-ranges": "bytes", "cache-control": full.headers.get("cache-control") || "public, max-age=31536000, immutable" };
  const range = request.headers.get("range");
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!m || (m[1] === "" && m[2] === "")) {
    return new Response(request.method === "HEAD" ? null : buf, { status: 200, headers: { ...base, "content-length": String(total) } });
  }
  let start = m[1] === "" ? Math.max(0, total - Number(m[2])) : Number(m[1]);
  let end = m[1] === "" ? total - 1 : (m[2] === "" ? total - 1 : Math.min(Number(m[2]), total - 1));
  if (start > end || start >= total) return new Response(null, { status: 416, headers: { ...base, "content-range": `bytes */${total}` } });
  const slice = buf.slice(start, end + 1);
  return new Response(request.method === "HEAD" ? null : slice, { status: 206, headers: { ...base, "content-range": `bytes ${start}-${end}/${total}`, "content-length": String(slice.byteLength) } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname.startsWith("www.")) { url.hostname = url.hostname.slice(4); return Response.redirect(url.toString(), 301); }
    const path = url.pathname.replace(/\/+$/, "");
    const mod = routes[path];
    if (mod) {
      const m = request.method;
      const handler = mod["onRequest" + m[0] + m.slice(1).toLowerCase()] || mod.onRequest;
      if (handler) return handler({ request, env, ctx });
      return new Response("Method not allowed", { status: 405 });
    }
    if (MEDIA.test(path) && (request.method === "GET" || request.method === "HEAD")) return serveMedia(request, env);
    return env.ASSETS.fetch(request);
  },
};
