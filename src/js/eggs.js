// Easter eggs, one file for the lot. Every one is switched on or off in the admin under "Fun stuff"
// (src/_data/eggs.json) and arrives here as window.EGGS, so nothing below runs unless it was asked for.
//
// House rules this file keeps to:
//   - nothing moves until it is invited (the screensaver waits for real idle, and nothing autoplays)
//   - anything animated gives up when the visitor asks for reduced motion
//   - phones get less: the screensaver needs a desktop-sized screen and a mouse
(function () {
  "use strict";
  var EGGS = window.EGGS || {};
  var on = function (k) { return EGGS[k] && EGGS[k].show; };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var roomy = window.matchMedia && matchMedia("(min-width: 900px) and (pointer: fine)").matches;

  // ---------------------------------------------------------------- time of day
  // Tints the ParlorOS wallpaper by the visitor's own clock. It only ever lays a wash over the
  // colour picked in Look & colors, so changing the brand purple in the admin still wins.
  (function () {
    if (on("timeOfDay")) {
      var h = new Date().getHours();
      var tod = h < 5 ? "night" : h < 8 ? "dawn" : h < 17 ? "day" : h < 21 ? "dusk" : "night";
      document.documentElement.setAttribute("data-tod", tod);
    }
  })();

  // ---------------------------------------------------------------- konami code
  // Works on every page. The payoff is a gold desktop and a small toast; the message is editable.
  (function () {
    if (on("konami")) {
      var SEQ = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
      var got = 0;
      window.addEventListener("keydown", function (e) {
        var t = e.target && e.target.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return; // don't eat what someone is typing
        var k = e.key === "B" ? "b" : e.key === "A" ? "a" : e.key;
        if (k === SEQ[got]) got++;
        else got = k === SEQ[0] ? 1 : 0;
        if (got !== SEQ.length) return;
        got = 0;
        document.body.classList.add("konami");
        var msg = (EGGS.konami && EGGS.konami.message) || "CHEAT MODE";
        var toast = document.createElement("div");
        toast.className = "egg-toast";
        toast.setAttribute("role", "status");
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 5000);
      });
    }
  })();

  // ---------------------------------------------------------------- the shop helper
  // A skull that turns up once with something to say. Dismiss it and it is gone for good, because
  // the fastest way to make a mascot hateful is to let it come back. Lines come from the admin.
  (function () {
    var H = window.HELPER || {};
    var hEl = document.getElementById("helper");
    if (hEl && H.show && (H.lines || []).length) {
      var KEY = "ct-helper-dismissed";
      var dismissed = false;
      try { dismissed = !!localStorage.getItem(KEY); } catch (e) {}
      // "returns: false" means once per visitor, ever. Turn it on and it comes back each visit.
      if (!(dismissed && !H.returns)) {
        var lines = H.lines.slice();
        var i = Math.floor(Math.random() * lines.length);
        var lineEl = document.getElementById("helper-line");
        var show = function () {
          lineEl.textContent = lines[i % lines.length];
          hEl.hidden = false;
          hEl.classList.add("in");
        };
        var bye = function (remember) {
          hEl.classList.remove("in");
          setTimeout(function () { hEl.hidden = true; }, reduce ? 0 : 260);
          if (remember) { try { localStorage.setItem(KEY, "1"); } catch (e) {} }
        };
        document.getElementById("helper-next").addEventListener("click", function () {
          i++; lineEl.textContent = lines[i % lines.length];
        });
        document.getElementById("helper-go").addEventListener("click", function () { bye(true); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !hEl.hidden) bye(false); });
        setTimeout(show, Math.max(2, Number(H.delaySeconds) || 14) * 1000);
      }
    }
  })();

  // ---------------------------------------------------------------- the sticker hunt
  // Six stickers hidden one per department. Progress lives in this visitor's browser only — there is
  // no server in this, by design: Chris would rather a hundred people print the coupon than lock it
  // down. Find all six and the coupon page fills in, stamped with the day it was earned.
  (function () {
    var ST = window.STICKERS || {};
    var CO = window.COUPON || {};
    if (ST.show && (ST.items || []).length) {
      var SKEY = "ct-stickers";
      var ids = ST.items.map(function (s) { return s.id; });

      var read = function () {
        try {
          var v = JSON.parse(localStorage.getItem(SKEY) || "{}");
          if (!v || typeof v !== "object") return {};
          return v;
        } catch (e) { return {}; }
      };
      var write = function (v) { try { localStorage.setItem(SKEY, JSON.stringify(v)); } catch (e) {} };
      var countOf = function (v) { return ids.filter(function (i) { return v[i]; }).length; };

      // ---- the footer tally, on every page
      var tally = document.getElementById("stick-tally");
      var paintTally = function (v) {
        if (tally) tally.textContent = countOf(v) + " of " + ids.length;
      };

      // ---- finding one
      var found = read();
      paintTally(found);
      Array.prototype.forEach.call(document.querySelectorAll("[data-sticker]"), function (spot) {
        var id = spot.dataset.sticker;
        if (found[id]) spot.classList.add("got");
        spot.addEventListener("click", function () {
          var now = read();
          if (!now[id]) {
            now[id] = Date.now();
            // the first time all six are in, remember when, so the coupon's clock starts then
            if (countOf(now) === ids.length && !now._done) now._done = Date.now();
            write(now);
          }
          found = now;
          spot.classList.add("got");
          paintTally(now);
          var n = countOf(now);
          var toast = document.createElement("div");
          toast.className = "egg-toast";
          toast.setAttribute("role", "status");
          var words = n === ids.length
            ? (ST.toastAll || "ALL SIX FOUND")
            : (ST.toastFound || "STICKER FOUND") + " · " + n + " OF " + ids.length;
          toast.innerHTML = words.replace(/&/g, "&amp;").replace(/</g, "&lt;") +
            ' &middot; <a href="/stickers/">SEE THE SHEET</a>';
          document.body.appendChild(toast);
          setTimeout(function () { toast.remove(); }, 6000);
        });
      });

      // ---- the sheet page
      var sheet = document.getElementById("sheet");
      if (sheet) {
        var reward = document.getElementById("reward");
        var paintSheet = function () {
          var v = read(), n = countOf(v);
          var cnt = document.getElementById("stick-count");
          if (cnt) cnt.textContent = n;
          Array.prototype.forEach.call(sheet.querySelectorAll("[data-slot]"), function (slot) {
            slot.classList.toggle("got", !!v[slot.dataset.slot]);
          });
          if (!reward) return;
          var all = n === ids.length;
          reward.hidden = !all;
          if (all) stampCoupon(v._done || Date.now());
        };

        // A code that carries its own issue date, so the 90 days can be read straight off the paper.
        var stampCoupon = function (when) {
          var d = new Date(when);
          var days = Math.max(1, Number(CO.expiryDays) || 90);
          var ends = new Date(when + days * 864e5);
          var two = function (x) { return String(x).padStart(2, "0"); };
          var stamp = String(d.getFullYear()).slice(2) + two(d.getMonth() + 1) + two(d.getDate());
          var salt = Math.abs(Math.floor(when / 1000) % 46656).toString(36).toUpperCase();
          while (salt.length < 3) salt = "0" + salt;
          var fmt = function (x) {
            return x.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
          };
          var set = function (id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; };
          set("c-code", "CT" + (CO.amount || 50) + "-" + stamp + "-" + salt);
          set("c-issued", fmt(d));
          set("c-expires", fmt(ends));
        };

        paintSheet();

        var printBtn = document.getElementById("print-coupon");
        if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

        var reset = document.getElementById("stick-reset");
        if (reset) reset.addEventListener("click", function () {
          if (!window.confirm(ST.resetConfirm || "Clear all the stickers and start again?")) return;
          write({}); paintSheet(); paintTally({});
        });
      }
    }
  })();

  // ---------------------------------------------------------------- visitor counter
  // Counts visits, not page views: it only adds one on the first page of a browser session, so a
  // read through six departments is one visitor. If the database isn't connected the box stays
  // hidden and nothing on the page moves.
  (function () {
    var hitbox = document.getElementById("hitbox");
    if (on("counter") && hitbox) {
      var SEEN = "ct-counted";
      var fresh = false;
      try { fresh = !sessionStorage.getItem(SEEN); } catch (e) {}
      fetch("/api/hits", { method: fresh ? "POST" : "GET" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.ok || typeof d.n !== "number") return;
          try { sessionStorage.setItem(SEEN, "1"); } catch (e) {}
          var digits = String(d.n).padStart(6, "0").split("");
          var odo = document.getElementById("odo");
          odo.innerHTML = "";
          digits.forEach(function (ch) {
            var cell = document.createElement("i");
            cell.textContent = reduce ? ch : "0";
            odo.appendChild(cell);
          });
          hitbox.hidden = false;
          if (reduce) return;
          Array.prototype.forEach.call(odo.children, function (cell, i) {
            var target = digits[i], spin = 0;
            var t = setInterval(function () {
              cell.textContent = String(spin++ % 10);
              if (spin > 8 + i * 2) { clearInterval(t); cell.textContent = target; }
            }, 55);
          });
        })
        .catch(function () { /* no counter, no noise */ });
    }
  })();

  // ---------------------------------------------------------------- sparkle trail
  // Ships OFF. There is a switch for it in the footer, and whichever way a visitor sets it, it is
  // remembered for them. Nobody gets glitter they did not ask for.
  (function () {
    var sparkToggle = document.getElementById("spark-toggle");
    if (on("sparkles") && sparkToggle && !reduce) {
      var SKEY = "ct-sparkles";
      var sparkOn = false;
      try { sparkOn = localStorage.getItem(SKEY) === "1"; } catch (e) {}

      var pop = function (e) {
        var s = document.createElement("span");
        s.className = "spark";
        s.style.left = e.clientX + "px";
        s.style.top = e.clientY + "px";
        s.style.setProperty("--dx", (Math.random() * 26 - 13).toFixed(1) + "px");
        s.style.setProperty("--rot", (Math.random() * 180 - 90).toFixed(0) + "deg");
        document.body.appendChild(s);
        setTimeout(function () { s.remove(); }, 750);
      };
      var last = 0;
      var onMove = function (e) {
        var now = Date.now();
        if (now - last < 45) return;      // thin it out, or it's a fog rather than a trail
        last = now;
        pop(e);
      };
      var apply = function () {
        sparkToggle.setAttribute("aria-pressed", String(sparkOn));
        sparkToggle.textContent = sparkOn ? "Sparkles: on" : "Sparkles: off";
        if (sparkOn) window.addEventListener("pointermove", onMove, { passive: true });
        else window.removeEventListener("pointermove", onMove);
      };
      sparkToggle.addEventListener("click", function () {
        sparkOn = !sparkOn;
        try { localStorage.setItem(SKEY, sparkOn ? "1" : "0"); } catch (e) {}
        apply();
      });
      sparkToggle.hidden = false;
      apply();
    }
  })();

  // ---------------------------------------------------------------- draggable desktop icons
  // Drag the department icons around the ParlorOS desktop and they stay where they were left.
  // Desktop only: on a phone the icons are a fixed row and moving them would just break the layout.
  (function () {
    var iconNav = document.querySelector(".icons");
    if (on("dragIcons") && iconNav && roomy) {
      var IKEY = "ct-icon-spots";
      var spots = {};
      try { spots = JSON.parse(localStorage.getItem(IKEY) || "{}") || {}; } catch (e) { spots = {}; }
      var save = function () { try { localStorage.setItem(IKEY, JSON.stringify(spots)); } catch (e) {} };
      var keyOf = function (el) { return (el.getAttribute("href") || el.textContent).trim(); };

      iconNav.classList.add("draggable");
      Array.prototype.forEach.call(iconNav.querySelectorAll(".icon"), function (el) {
        var id = keyOf(el);
        if (spots[id]) el.style.transform = "translate(" + spots[id].x + "px," + spots[id].y + "px)";

        var from = null, base = { x: 0, y: 0 }, moved = false;
        el.addEventListener("pointerdown", function (e) {
          if (e.button !== undefined && e.button !== 0) return;
          from = { x: e.clientX, y: e.clientY };
          base = spots[id] || { x: 0, y: 0 };
          moved = false;
          el.setPointerCapture(e.pointerId);
        });
        el.addEventListener("pointermove", function (e) {
          if (!from) return;
          var dx = e.clientX - from.x, dy = e.clientY - from.y;
          if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;   // a small wobble is still a click
          moved = true;
          el.classList.add("dragging");
          spots[id] = { x: Math.round(base.x + dx), y: Math.round(base.y + dy) };
          el.style.transform = "translate(" + spots[id].x + "px," + spots[id].y + "px)";
        });
        var drop = function () {
          if (!from) return;
          from = null;
          el.classList.remove("dragging");
          if (moved) save();
        };
        el.addEventListener("pointerup", drop);
        el.addEventListener("pointercancel", drop);
        // a drag must not also follow the link
        el.addEventListener("click", function (e) { if (moved) { e.preventDefault(); moved = false; } });
      });

      var tidy = document.getElementById("tidy-icons");
      if (tidy) {
        tidy.hidden = false;
        tidy.addEventListener("click", function () {
          spots = {}; save();
          Array.prototype.forEach.call(iconNav.querySelectorAll(".icon"), function (el) { el.style.transform = ""; });
        });
      }
    }
  })();

  // ---------------------------------------------------------------- flash screensaver
  // Sixty seconds of nothing happening on a ParlorOS desktop and the drawings start bouncing.
  // Any key, click, touch or mouse move puts it away again, and a video window open on the
  // desktop keeps it away for as long as it is open.
  (function () {
    var saverHost = document.querySelector(".wallpaper");
    var art = window.EGGS_FLASH || [];
    if (on("screensaver") && saverHost && art.length && roomy && !reduce) {
      var idleMs = Math.max(10, Number(EGGS.screensaver.idleSeconds) || 60) * 1000;
      var timer = null, layer = null, raf = null, sprites = [];

      function build() {
        layer = document.createElement("div");
        layer.className = "egg-saver";
        layer.setAttribute("aria-hidden", "true");
        art.slice(0, 7).forEach(function (src, i) {
          var img = document.createElement("img");
          img.src = src; img.alt = ""; img.decoding = "async";
          layer.appendChild(img);
          sprites.push({
            el: img,
            x: Math.random() * 70 + 5, y: Math.random() * 70 + 5,
            dx: (i % 2 ? 1 : -1) * (0.045 + Math.random() * 0.04),
            dy: (i % 3 ? 1 : -1) * (0.035 + Math.random() * 0.035)
          });
        });
        document.body.appendChild(layer);
      }

      function step() {
        sprites.forEach(function (s) {
          s.x += s.dx; s.y += s.dy;
          if (s.x < 0) { s.x = 0; s.dx *= -1; } else if (s.x > 88) { s.x = 88; s.dx *= -1; }
          if (s.y < 0) { s.y = 0; s.dy *= -1; } else if (s.y > 84) { s.y = 84; s.dy *= -1; }
          s.el.style.transform = "translate(" + s.x + "vw," + s.y + "vh)";
        });
        raf = requestAnimationFrame(step);
      }

      // A montage can play for ten minutes with nobody touching the mouse, so the screensaver
      // keeps out of the way while a window with a player in it is open — the gamer zone's
      // montages and the Twitch window. Close them and the idle clock goes back to normal.
      function watching() {
        return !!document.querySelector(".win:not([hidden]) .player");
      }

      function start() {
        if (layer) return;
        if (watching()) { timer = setTimeout(start, idleMs); return; }
        build(); step();
        document.body.classList.add("saving");
      }
      function stop() {
        if (!layer) return;
        cancelAnimationFrame(raf);
        layer.remove(); layer = null; sprites = [];
        document.body.classList.remove("saving");
      }
      function poke() {
        stop();
        clearTimeout(timer);
        timer = setTimeout(start, idleMs);
      }
      ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "focusin"].forEach(function (ev) {
        window.addEventListener(ev, poke, { passive: true });
      });
      document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else poke(); });
      poke();
    }
  })();

})();
