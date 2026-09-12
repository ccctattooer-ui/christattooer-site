// Spin the wheel, on /flash/ only — a drawing canvas or a prize wheel has no business shipping to
// every page, so this one lives apart from eggs.js and is loaded by the catalog page alone.
//
// It reads the flash cards already rendered on the page, so it adds no data of its own, and ADD IT
// TO MY REQUEST presses the matching card's real button: one code path, and the booking drawer
// behaves exactly as it always does.
(function () {
  "use strict";
  var EGGS = window.EGGS || {};
  var on = function (k) { return EGGS[k] && EGGS[k].show; };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------- spin the wheel
// Reads the flash cards already rendered on /flash/, so it ships no extra data. ADD TO REQUEST
// presses the real card's own button, which means the drawer behaves exactly as it always does.
var wbox = document.getElementById("wheelbox");
if (on("wheel") && wbox) {
  var svg = document.getElementById("wheel-svg");
  var out = document.getElementById("wheel-out");
  var SEG = Math.max(4, Math.min(12, Number(EGGS.wheel.segments) || 10));
  var NS = "http://www.w3.org/2000/svg";
  var PIE = ["#4B2E9C", "#F0C22E", "#D3322A", "#3BAA6E", "#8FD6FF", "#EFEAD9", "#6b4fc4", "#b9b0d6", "#e07a2f", "#7fc4a8", "#c76b9e", "#5a8fd6"];
  var LIGHT = { "#F0C22E": 1, "#EFEAD9": 1, "#8FD6FF": 1, "#b9b0d6": 1, "#7fc4a8": 1 };
  var turn = 0, spinning = false, board = [];

  // every design that is actually up for grabs, straight off the page
  function pool() {
    return Array.prototype.filter.call(document.querySelectorAll(".item[data-sku]"), function (el) {
      var add = el.querySelector(".add");
      return el.dataset.sku !== "CU-000" && add && !add.disabled;
    }).map(function (el) {
      var img = el.querySelector(".art img");
      return {
        sku: el.dataset.sku, name: el.dataset.name, size: el.dataset.size || "",
        price: el.dataset.price || "", img: img ? img.getAttribute("src") : "", el: el
      };
    });
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function draw() {
    var all = pool();
    if (!all.length) return false;
    board = shuffle(all.slice()).slice(0, Math.min(SEG, all.length));
    var n = board.length;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    board.forEach(function (item, i) {
      var a0 = i / n * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / n * 2 * Math.PI - Math.PI / 2;
      var fill = PIE[i % PIE.length];
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", "M100,100 L" + (100 + 95 * Math.cos(a0)) + "," + (100 + 95 * Math.sin(a0)) +
        " A95,95 0 0,1 " + (100 + 95 * Math.cos(a1)) + "," + (100 + 95 * Math.sin(a1)) + " Z");
      path.setAttribute("fill", fill);
      path.setAttribute("stroke", "#141414"); path.setAttribute("stroke-width", "2");
      svg.appendChild(path);
      var am = (a0 + a1) / 2;
      var t = document.createElementNS(NS, "text");
      t.setAttribute("x", 100 + 63 * Math.cos(am)); t.setAttribute("y", 100 + 63 * Math.sin(am));
      t.setAttribute("text-anchor", "middle"); t.setAttribute("dominant-baseline", "middle");
      t.setAttribute("font-family", "IBM Plex Mono, monospace");
      t.setAttribute("font-size", "10"); t.setAttribute("font-weight", "600");
      t.setAttribute("fill", LIGHT[fill] ? "#141414" : "#fff");
      t.textContent = item.sku;
      svg.appendChild(t);
    });
    var hub = document.createElementNS(NS, "circle");
    hub.setAttribute("cx", "100"); hub.setAttribute("cy", "100"); hub.setAttribute("r", "13");
    hub.setAttribute("fill", "#141414");
    svg.appendChild(hub);
    return true;
  }

  function land(item) {
    out.innerHTML =
      '<div class="won">' +
        (item.img ? '<span class="won-art"><img src="' + item.img + '" alt=""></span>' : "") +
        '<div class="won-txt">' +
          '<p class="won-k">THE WHEEL SAYS</p>' +
          "<h3>" + item.name.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</h3>" +
          '<p class="won-spec"><b>' + item.sku + "</b>" +
            (item.size ? " · " + item.size : "") +
            (item.price ? " · $" + item.price : "") + "</p>" +
          '<button class="won-add" type="button">ADD IT TO MY REQUEST</button>' +
          '<button class="won-again" type="button">spin again</button>' +
        "</div>" +
      "</div>";
    out.querySelector(".won-add").addEventListener("click", function () {
      var btn = item.el.querySelector(".add");
      if (btn) btn.click();                       // the card's own button: one code path, no duplication
      wbox.close();
      item.el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    });
    out.querySelector(".won-again").addEventListener("click", go);
  }

  function go() {
    if (spinning) return;
    if (!draw()) { out.innerHTML = '<p class="wheel-idle">Every design is claimed just now. Ask about custom work instead.</p>'; return; }
    spinning = true;
    var n = board.length, pick = Math.floor(Math.random() * n);
    turn += 360 * 4 + (360 - (pick + 0.5) * (360 / n)) - (turn % 360);
    svg.style.transition = reduce ? "none" : "transform 2.7s cubic-bezier(.17,.89,.15,1)";
    svg.style.transform = "rotate(" + turn + "deg)";
    out.innerHTML = '<p class="wheel-idle">Spinning…</p>';
    setTimeout(function () { spinning = false; land(board[pick]); }, reduce ? 30 : 2750);
  }

  document.getElementById("spin-open").addEventListener("click", function () {
    draw();
    out.innerHTML = '<p class="wheel-idle">The needle is at the top. Whatever it lands on is yours.</p>';
    wbox.showModal();
  });
  document.getElementById("wheel-close").addEventListener("click", function () { wbox.close(); });
  document.getElementById("spin-go").addEventListener("click", go);
  wbox.addEventListener("click", function (e) { if (e.target === wbox) wbox.close(); });
}
})();
