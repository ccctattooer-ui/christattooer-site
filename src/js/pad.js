// The sketch pad on /book/. Loaded only on this page, because a drawing canvas has no business
// shipping to the rest of the site.
//
// How the drawing reaches Chris: the booking handler already loops over every form field named
// "reference", so the finished PNG is handed to a second, hidden file input of that same name. The
// form still posts natively and functions/api/book.js needs no changes at all. A blank pad attaches
// nothing, so nobody emails a white rectangle by accident.
(function () {
  "use strict";
  var cv = document.getElementById("pad");
  if (!cv) return;
  var ctx = cv.getContext("2d", { willReadFrequently: true });
  var slot = document.getElementById("b-sketch");
  var COLS = ["#141414", "#C8102E", "#FFD21F", "#1E8E3E", "#4B2E9C", "#8FD6FF"];
  var WID = { pen: 3, brush: 10, eraser: 22 };
  var tool = "pen", colour = COLS[0], drawing = false, dirty = false;
  var undos = [];

  function blank() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cv.width, cv.height);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  blank();

  // ---- tools
  function pickTool(t, btn) {
    tool = t;
    Array.prototype.forEach.call(document.querySelectorAll(".pad-tool"), function (b) {
      b.classList.toggle("on", b === btn);
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll(".pad-tool"), function (b) {
    b.addEventListener("click", function () { pickTool(b.dataset.tool, b); });
  });

  var swatches = document.getElementById("pad-colours");
  COLS.forEach(function (c, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pad-col" + (i === 0 ? " on" : "");
    b.style.background = c;
    b.setAttribute("aria-label", "Colour " + (i + 1));
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    b.addEventListener("click", function () {
      colour = c;
      if (tool === "eraser") pickTool("pen", document.querySelector('.pad-tool[data-tool="pen"]'));
      Array.prototype.forEach.call(swatches.children, function (x) {
        x.classList.toggle("on", x === b);
        x.setAttribute("aria-pressed", x === b ? "true" : "false");
      });
    });
    swatches.appendChild(b);
  });

  // ---- undo, capped so a long session can't eat memory
  function remember() {
    try { undos.push(cv.toDataURL("image/png")); } catch (e) {}
    if (undos.length > 12) undos.shift();
    document.getElementById("pad-undo").disabled = false;
  }
  function restore(url, then) {
    var img = new Image();
    img.onload = function () { blank(); ctx.drawImage(img, 0, 0); if (then) then(); };
    img.src = url;
  }
  document.getElementById("pad-undo").addEventListener("click", function () {
    var prev = undos.pop();
    if (!prev) return;
    restore(prev, function () {
      dirty = undos.length > 0;
      attach();
    });
    if (!undos.length) this.disabled = true;
  });
  document.getElementById("pad-clear").addEventListener("click", function () {
    remember();
    blank();
    dirty = false;
    attach();
  });

  // ---- drawing
  function at(e) {
    var r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (cv.width / r.width), y: (e.clientY - r.top) * (cv.height / r.height) };
  }
  function begin(e) {
    if (e.button !== undefined && e.button !== 0) return;
    remember();
    drawing = true;
    var p = at(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    move(e);
    cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function move(e) {
    if (!drawing) return;
    var p = at(e);
    ctx.strokeStyle = tool === "eraser" ? "#fff" : colour;
    ctx.lineWidth = WID[tool] || 3;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    dirty = true;
    e.preventDefault();
  }
  function end() {
    if (!drawing) return;
    drawing = false;
    attach();
  }
  cv.addEventListener("pointerdown", begin);
  cv.addEventListener("pointermove", move);
  cv.addEventListener("pointerup", end);
  cv.addEventListener("pointercancel", end);
  cv.addEventListener("pointerleave", end);

  // ---- hand the drawing to the form as a file
  var note = document.getElementById("pad-note");
  function attach() {
    if (!slot) return;
    if (!dirty) {
      slot.value = "";                                  // nothing drawn: attach nothing
      if (note) note.textContent = "Nothing drawn yet — the pad is optional.";
      return;
    }
    if (!cv.toBlob || typeof DataTransfer === "undefined") {
      if (note) note.textContent = "Your browser can't attach the drawing. Describe it above instead.";
      return;
    }
    cv.toBlob(function (blob) {
      if (!blob) return;
      try {
        var file = new File([blob], "sketch.png", { type: "image/png" });
        var dt = new DataTransfer();
        dt.items.add(file);
        slot.files = dt.files;
        if (note) note.textContent = "Drawing attached (" + Math.round(blob.size / 1024) + " KB). It'll come through with your request.";
      } catch (e) {
        if (note) note.textContent = "Your browser can't attach the drawing. Describe it above instead.";
      }
    }, "image/png");
  }
  attach();
})();
