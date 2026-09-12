// The guestbook page. Talks to /api/guestbook, which keeps every signature invisible until Chris
// approves it — so nothing here can put a stranger's words on the site on its own.
(function () {
  "use strict";
  var list = document.getElementById("gb-list");
  if (!list) return;
  var form = document.getElementById("gb-form");
  var status = document.getElementById("gb-status");
  var send = document.getElementById("gb-send");
  var count = document.getElementById("gb-count");
  var G = window.GUESTBOOK || {};
  var CLOSED = G.closed || "The guestbook isn't open yet.";

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };
  var ago = function (ms) {
    var d = Math.floor((Date.now() - Number(ms)) / 864e5);
    if (d <= 0) return "today";
    if (d === 1) return "yesterday";
    if (d < 30) return d + " days ago";
    if (d < 365) return Math.round(d / 30) + " months ago";
    return Math.round(d / 365) + " years ago";
  };

  function paint(entries) {
    if (!entries.length) {
      list.innerHTML = '<p class="fine">' + esc(G.empty || "Nobody has signed it yet.") + "</p>";
      if (count) count.textContent = "";
      return;
    }
    if (count) count.textContent = entries.length + (entries.length === 1 ? " signature" : " signatures");
    list.innerHTML = entries.map(function (e) {
      return '<div class="gb-entry"><p>' + esc(e.message) + "</p>" +
             "<footer><b>" + esc(e.name) + "</b><span>" + ago(e.created_at) + "</span></footer></div>";
    }).join("");
  }

  fetch("/api/guestbook")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d.ok) {
        list.innerHTML = '<p class="fine">' + esc(CLOSED) + "</p>";
        if (form) form.hidden = true;
        return;
      }
      paint(d.entries || []);
    })
    .catch(function () {
      list.innerHTML = '<p class="fine">Couldn\'t load the guestbook just now.</p>';
    });

  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = document.getElementById("gb-msg").value.trim();
    if (msg.length < 2) { status.textContent = G.writeFirst || "Write something first."; return; }
    send.disabled = true;
    status.textContent = "Sending…";
    fetch("/api/guestbook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("gb-name").value,
        message: msg,
        "bot-field": form.elements["bot-field"].value
      })
    })
      .then(function (r) { return r.json().then(function (d) { return { s: r.status, d: d }; }); })
      .then(function (res) {
        if (res.d.ok) {
          form.reset();
          status.textContent = G.thanks || "Thanks — it will be read before it goes up.";
        } else if (res.s === 429) {
          status.textContent = G.tooSoon || "You have already signed recently.";
        } else if (res.d.reason === "no-db") {
          status.textContent = CLOSED;
        } else {
          status.textContent = G.failed || "That didn't send. Try again in a moment.";
        }
      })
      .catch(function () { status.textContent = G.failed || "That didn't send. Try again in a moment."; })
      .then(function () { send.disabled = false; });
  });
})();
