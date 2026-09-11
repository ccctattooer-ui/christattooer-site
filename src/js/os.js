// ParlorOS windows: focus, close, drag on desktop, taskbar buttons, clock.
(function () {
  const wins = [...document.querySelectorAll('.win')]; let z = 10;
  const mobile = () => matchMedia('(max-width:760px)').matches;
  const tasks = document.getElementById('tasks');
  function renderTasks() {
    tasks.innerHTML = '';
    wins.filter(w => !w.hidden).forEach(w => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'tb' + (w.classList.contains('active') ? ' active' : '');
      b.textContent = w.querySelector('.title b').textContent.split(/[(]/)[0].trim();
      b.onclick = () => focusWin(w); tasks.appendChild(b);
    });
  }
  function focusWin(w) { z++; w.style.zIndex = z; wins.forEach(x => x.classList.toggle('active', x === w)); renderTasks(); }
  function openWin(id) { const w = document.getElementById(id); if (!w) return; w.hidden = false; focusWin(w); }
  function closeWin(w) { w.hidden = true; const o = wins.filter(x => !x.hidden); if (o.length) focusWin(o[o.length - 1]); else renderTasks(); }
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openWin(b.dataset.open); }));
  wins.forEach(w => {
    w.addEventListener('pointerdown', () => { if (!w.classList.contains('active')) focusWin(w); }, true);
    w.querySelector('.x').onclick = () => closeWin(w);
    const t = w.querySelector('.title'); let sx, sy, ox, oy, drag = false;
    t.addEventListener('pointerdown', e => { if (mobile() || e.target.classList.contains('x')) return; drag = true; sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop; t.setPointerCapture(e.pointerId); });
    t.addEventListener('pointermove', e => { if (!drag) return; w.style.left = Math.max(0, ox + e.clientX - sx) + 'px'; w.style.top = Math.max(44, oy + e.clientY - sy) + 'px'; });
    t.addEventListener('pointerup', () => drag = false);
  });
  function clock() { const c = document.getElementById('clock'); if (c) c.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  clock(); setInterval(clock, 30000);
  if (mobile()) wins.slice(1).forEach(w => w.hidden = true);
  if (wins.length) focusWin(wins[0]);
})();
