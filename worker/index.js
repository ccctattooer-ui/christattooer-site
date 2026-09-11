// Worker entry: routes the three server endpoints to their handlers in functions/ and serves
// everything else from the static build (_site) through the ASSETS binding.
import * as auth from "../functions/admin/auth.js";
import * as flash from "../functions/admin/api/flash.js";
import * as book from "../functions/api/book.js";

const routes = { "/admin/auth": auth, "/admin/api/flash": flash, "/api/book": book };

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname.replace(/\/+$/, "");
    const mod = routes[path];
    if (mod) {
      const m = request.method;
      const handler = mod["onRequest" + m[0] + m.slice(1).toLowerCase()] || mod.onRequest;
      if (handler) return handler({ request, env, ctx });
      return new Response("Method not allowed", { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
};
