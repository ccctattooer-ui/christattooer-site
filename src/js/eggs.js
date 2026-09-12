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
  if (on("timeOfDay")) {
    var h = new Date().getHours();
    var tod = h < 5 ? "night" : h < 8 ? "dawn" : h < 17 ? "day" : h < 21 ? "dusk" : "night";
    document.documentElement.setAttribute("data-tod", tod);
  }

  // ---------------------------------------------------------------- konami code
  // Works on every page. The payoff is a gold desktop and a small toast; the message is editable.
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

  // ---------------------------------------------------------------- the shop helper
  // A skull that turns up once with something to say. Dismiss it and it is gone for good, because
  // the fastest way to make a mascot hateful is to let it come back. Lines come from the admin.
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

  // ---------------------------------------------------------------- flash screensaver
  // Sixty seconds of nothing happening on a ParlorOS desktop and the drawings start bouncing.
  // Any key, click, touch or mouse move puts it away again.
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

    function start() {
      if (layer) return;
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
