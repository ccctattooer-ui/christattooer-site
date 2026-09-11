// Booking request form handler at /api/book (Cloudflare Worker route).
// Takes the multipart POST from /book/ (and the catalog drawer), emails it through Resend with the
// reference photos attached, then sends the visitor to /thanks/.
// Secrets: RESEND_API_KEY, BOOKING_TO (your email). Optional: BOOKING_FROM (default onboarding@resend.dev).

const MAX_FILE = 8 * 1024 * 1024, MAX_TOTAL = 20 * 1024 * 1024;
const esc = (s) => String(s ?? "").replace(/[<>]/g, "");
const b64 = (buf) => { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const fail = (msg) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:system-ui;padding:24px;max-width:520px"><h1>That didn't send</h1><p>${esc(msg)}</p><p>Please DM <a href="https://instagram.com/christattooer">@christattooer</a> instead, or <a href="javascript:history.back()">go back</a> and try again.</p></body>`, { status: 500, headers: { "content-type": "text/html; charset=utf-8" } });

export async function onRequestPost({ request, env }) {
  let fd;
  try { fd = await request.formData(); } catch (e) { return fail("The form data couldn't be read."); }
  const site = new URL(request.url).origin;
  if (String(fd.get("bot-field") || "").trim()) return Response.redirect(site + "/thanks/", 303); // honeypot

  const f = (k) => String(fd.get(k) || "").trim();
  const name = f("name"), contact = f("contact");
  if (!name || !contact) return fail("Name and a way to contact you are required.");
  if (!env.RESEND_API_KEY || !env.BOOKING_TO) return fail("The booking form isn't configured yet.");

  const lines = [
    `Name: ${name}`, `Contact: ${contact}`, "",
    `What: ${f("notes")}`, `Placement: ${f("placement")}`, `Size: ${f("size")}`, `Days that work: ${f("days")}`, "",
    `Picked from the catalog: ${f("picks") || "(none)"}`, "",
    `Sent from ${site}/book/ on ${new Date().toISOString()}`,
  ];

  const attachments = []; let total = 0;
  for (const file of fd.getAll("reference")) {
    if (!(file instanceof File) || !file.size) continue;
    if (file.size > MAX_FILE || total + file.size > MAX_TOTAL) { lines.push(`(A reference photo "${file.name}" was too big to attach.)`); continue; }
    total += file.size;
    attachments.push({ filename: file.name || "reference.jpg", content: b64(await file.arrayBuffer()) });
  }

  const email = {
    from: env.BOOKING_FROM || "Booking form <onboarding@resend.dev>",
    to: [env.BOOKING_TO],
    subject: `Tattoo request from ${name}`,
    text: lines.join("\n"),
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? { reply_to: contact } : {}),
    ...(attachments.length ? { attachments } : {}),
  };
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify(email) });
  if (!r.ok) return fail(`The email service replied ${r.status}.`);
  return Response.redirect(site + "/thanks/", 303);
}

export const onRequestGet = ({ request }) => Response.redirect(new URL(request.url).origin + "/book/", 302);
