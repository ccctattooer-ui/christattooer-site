// SpaceCraft star chart: a generational lineage map drawn from window.GENETICS (content/genetics/*.json).
// Left to right = older to newer. Pan/zoom, tap a plant for its dossier, ancestry and descendants light up.
(function () {
  const data = window.GENETICS || []; if (!data.length) return;
  const byId = new Map(data.map((n) => [n.id, n]));
  const KIND = { spacecraft: 'SpaceCraft cross', cut: 'clone-only cut', seedline: 'seed line', landrace: 'landrace', bagseed: 'bagseed', homebrew: 'homebrew line', unknown: 'unknown' };
  const RUNS = { 1: 'Run 1 · Charcuterie · 2024', 2: 'Run 2 · Lime Bubble · 2025', 3: 'Run 3 · Gushy Kush · 2025', 4: 'Side chucks · 2025', 5: 'Run 5 · pine line · 2026' };

  // ---- generations (longest path from the roots) and children
  const gen = new Map(), kids = new Map();
  data.forEach((n) => kids.set(n.id, []));
  data.forEach((n) => [n.mother, n.father].forEach((p) => { if (p && byId.has(p) && p !== n.id) kids.get(p).push(n.id); }));
  const depth = (id, seen = new Set()) => {
    if (gen.has(id)) return gen.get(id);
    if (seen.has(id)) return 0; seen.add(id);
    const n = byId.get(id); const ps = [n.mother, n.father].filter((p) => p && byId.has(p) && p !== id);
    const d = ps.length ? 1 + Math.max(...ps.map((p) => depth(p, seen))) : 0; gen.set(id, d); return d;
  };
  data.forEach((n) => depth(n.id));
  const maxGen = Math.max(...gen.values());
  const colLabel = (g) => g === 0 ? 'ANCESTORS' : g === maxGen && maxGen > 1 ? 'NEWEST' : (g === 1 ? 'STARTING STOCK' : 'GENERATION ' + g);

  // ---- layout: columns by generation, rows ordered by the average row of the parents
  const COLW = 250, ROWH = 36, PADX = 60, PADY = 70;
  const cols = []; for (let g = 0; g <= maxGen; g++) cols.push(data.filter((n) => gen.get(n.id) === g));
  const row = new Map();
  cols[0].sort((a, b) => a.name.localeCompare(b.name)).forEach((n, i) => row.set(n.id, i));
  for (let g = 1; g <= maxGen; g++) {
    const bary = (n) => { const ps = [n.mother, n.father].filter((p) => row.has(p)); return ps.length ? ps.reduce((s, p) => s + row.get(p), 0) / ps.length : 1e6; };
    cols[g].sort((a, b) => bary(a) - bary(b) || (b.flagship - a.flagship) || a.name.localeCompare(b.name)).forEach((n, i) => row.set(n.id, i));
  }
  const rows = Math.max(...cols.map((c) => c.length));
  const pos = new Map();
  cols.forEach((c, g) => { const off = (rows - c.length) * ROWH / 2; c.forEach((n) => pos.set(n.id, { x: PADX + g * COLW, y: PADY + off + row.get(n.id) * ROWH })); });
  const W = PADX * 2 + maxGen * COLW + 200, H = PADY + rows * ROWH + 40;

  // ---- draw
  const box = document.getElementById('chart'); if (!box) return;
  const ns = 'http://www.w3.org/2000/svg';
  const el = (t, a = {}, parent) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sky' }, box); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
  const view = el('g', { class: 'view' }, svg);
  // stars (deterministic)
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const stars = el('g', { class: 'stars' }, view);
  for (let i = 0; i < 260; i++) el('circle', { cx: (rnd() * W).toFixed(0), cy: (rnd() * H).toFixed(0), r: (rnd() * 1.4 + .3).toFixed(1), opacity: (rnd() * .6 + .2).toFixed(2) }, stars);
  // column labels
  cols.forEach((c, g) => { const t = el('text', { x: PADX + g * COLW, y: 30, class: 'col' }, view); t.textContent = colLabel(g); });
  // edges
  const edges = el('g', { class: 'edges' }, view);
  const edgeEls = [];
  data.forEach((n) => [['mother', n.mother], ['father', n.father]].forEach(([role, p]) => {
    if (!p || !pos.has(p) || p === n.id) return;
    const a = pos.get(p), b = pos.get(n.id); const dx = (b.x - a.x) / 2;
    const path = el('path', { d: `M${a.x + 10},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x - 10},${b.y}`, class: 'edge ' + role, 'data-from': p, 'data-to': n.id }, edges);
    edgeEls.push(path);
  }));
  // nodes
  const nodes = el('g', { class: 'nodes' }, view), nodeEls = new Map();
  data.forEach((n) => {
    const p = pos.get(n.id);
    const g = el('g', { class: `node k-${n.kind}${n.flagship ? ' flag' : ''}`, transform: `translate(${p.x},${p.y})`, tabindex: 0, role: 'button', 'aria-label': n.name }, nodes);
    if (n.flagship) { el('path', { d: 'M0,-12 L3.2,-3.2 L12,0 L3.2,3.2 L0,12 L-3.2,3.2 L-12,0 L-3.2,-3.2 Z', class: 'glyph' }, g); }
    else if (n.kind === 'spacecraft') { el('circle', { r: 7, class: 'glyph' }, g); el('ellipse', { rx: 12, ry: 3.5, class: 'ring', transform: 'rotate(-20)' }, g); }
    else if (n.kind === 'cut' || n.kind === 'seedline' || n.kind === 'homebrew') { el('circle', { r: 5.5, class: 'glyph' }, g); }
    else { el('circle', { r: 3.5, class: 'glyph' }, g); }
    const t = el('text', { x: 16, y: 5, class: 'lbl' }, g); t.textContent = n.name;
    g.addEventListener('click', () => select(n.id, true));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id, true); } });
    nodeEls.set(n.id, g);
  });

  // ---- pan / zoom
  let scale = 1, tx = 0, ty = 0;
  const apply = () => view.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`);
  const boxSize = () => { const r = box.getBoundingClientRect(); return { w: r.width || 800, h: r.height || 480 }; };
  const unit = () => { const { w, h } = boxSize(); return Math.min(w / W, h / H); }; // svg units per viewBox unit
  function fit() { scale = 1; tx = 0; ty = 0; apply(); }
  function centerOn(id, s) {
    // the viewBox is letterboxed and centred in the box, so its centre is (W/2, H/2) in viewBox units
    const p = pos.get(id); if (!p) return;
    if (s) scale = s; tx = W / 2 - p.x * scale; ty = H / 2 - p.y * scale; apply();
  }
  const svgPt = (cx, cy) => { const r = box.getBoundingClientRect(); const u = unit(); return { x: (cx - r.left - (r.width - W * u) / 2) / u, y: (cy - r.top - (r.height - H * u) / 2) / u }; };
  function zoomAt(f, cx, cy) { const p = svgPt(cx, cy); const ns2 = Math.min(6, Math.max(.3, scale * f)); tx = p.x - (p.x - tx) * (ns2 / scale); ty = p.y - (p.y - ty) * (ns2 / scale); scale = ns2; apply(); }
  box.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY); }, { passive: false });
  const ptrs = new Map(); let last = null, moved = false;
  box.addEventListener('pointerdown', (e) => { ptrs.set(e.pointerId, e); box.setPointerCapture(e.pointerId); last = null; moved = false; });
  box.addEventListener('pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, e);
    const u = unit(); const ps = [...ptrs.values()];
    if (ps.length === 1) { if (last) { const dx = (e.clientX - last.x) / u, dy = (e.clientY - last.y) / u; if (Math.abs(dx) + Math.abs(dy) > .5) moved = true; tx += dx; ty += dy; apply(); } last = { x: e.clientX, y: e.clientY }; }
    else if (ps.length === 2) { const d = Math.hypot(ps[0].clientX - ps[1].clientX, ps[0].clientY - ps[1].clientY); const c = { x: (ps[0].clientX + ps[1].clientX) / 2, y: (ps[0].clientY + ps[1].clientY) / 2 }; if (last && last.d) { zoomAt(d / last.d, c.x, c.y); tx += (c.x - last.x) / u; ty += (c.y - last.y) / u; apply(); moved = true; } last = { x: c.x, y: c.y, d }; }
  });
  const up = (e) => { ptrs.delete(e.pointerId); last = null; };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  box.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); moved = false; } }, true);
  document.getElementById('chart-fit')?.addEventListener('click', fit);
  document.getElementById('chart-zoom-in')?.addEventListener('click', () => { const r = box.getBoundingClientRect(); zoomAt(1.3, r.left + r.width / 2, r.top + r.height / 2); });
  document.getElementById('chart-zoom-out')?.addEventListener('click', () => { const r = box.getBoundingClientRect(); zoomAt(1 / 1.3, r.left + r.width / 2, r.top + r.height / 2); });

  // ---- selection: ancestors + descendants light up, dossier opens
  const up_ = (id, acc = new Set()) => { const n = byId.get(id); [n.mother, n.father].forEach((p) => { if (p && byId.has(p) && p !== id && !acc.has(p)) { acc.add(p); up_(p, acc); } }); return acc; };
  const down_ = (id, acc = new Set()) => { kids.get(id).forEach((k) => { if (!acc.has(k)) { acc.add(k); down_(k, acc); } }); return acc; };
  let current = null;
  function select(id, open) {
    current = id; const anc = up_(id), des = down_(id);
    nodeEls.forEach((g, nid) => { g.classList.toggle('sel', nid === id); g.classList.toggle('anc', anc.has(nid)); g.classList.toggle('des', des.has(nid)); g.classList.toggle('dim', nid !== id && !anc.has(nid) && !des.has(nid)); });
    const lit = new Set([id, ...anc, ...des]);
    edgeEls.forEach((p) => { const on = lit.has(p.dataset.from) && lit.has(p.dataset.to); p.classList.toggle('on', on); p.classList.toggle('dim', !on); });
    renderDossier(id);
    document.querySelectorAll('.vault .row').forEach((r) => r.classList.toggle('sel', r.dataset.id === id));
    if (open) window.ParlorOS?.openWin('w-dossier');
  }
  function clearSel() { current = null; nodeEls.forEach((g) => g.classList.remove('sel', 'anc', 'des', 'dim')); edgeEls.forEach((p) => p.classList.remove('on', 'dim')); }
  svg.addEventListener('click', (e) => { if (e.target === svg || e.target.parentNode === stars) clearSel(); });

  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function link(id) { const n = byId.get(id); return n ? `<a href="#" data-go="${id}">${esc(n.name)}</a>` : ''; }
  function renderDossier(id) {
    const n = byId.get(id); const d = document.getElementById('dossier'); if (!n || !d) return;
    document.getElementById('dossier-name').textContent = n.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.txt';
    const parents = [n.mother && `<dt>Mother</dt><dd>${link(n.mother)}</dd>`, n.father && `<dt>Father</dt><dd>${link(n.father)}</dd>`].filter(Boolean).join('');
    const children = kids.get(id).map(link).join(', ');
    d.innerHTML = `
      <h1>${esc(n.name)}${n.flagship ? ' <span class="badge flag">FLAGSHIP</span>' : ''}</h1>
      <p class="kind">${esc(KIND[n.kind] || n.kind)}${n.breeder && n.breeder !== 'SpaceCraft' ? ' · ' + esc(n.breeder) : ''}${n.run ? ' · ' + esc(RUNS[n.run] || 'Run ' + n.run) : (n.year ? ' · ' + esc(n.year) : '')}${n.status ? ' · ' + esc(n.status) : ''}</p>
      <dl class="kv">${parents}${children ? `<dt>Children</dt><dd>${children}</dd>` : ''}${n.terps ? `<dt>Terps</dt><dd>${esc(n.terps)}</dd>` : ''}</dl>
      ${n.notes ? `<p>${esc(n.notes)}</p>` : ''}
      <p class="acts"><a class="btn ghost" href="#" data-center="${id}">CENTER ON CHART</a>${n.seedfinder ? ` <a class="btn ghost" href="${esc(n.seedfinder)}" target="_blank" rel="noopener">SEEDFINDER ↗</a>` : ''}</p>`;
    d.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); select(a.dataset.go, false); centerOn(a.dataset.go); }));
    d.querySelector('[data-center]')?.addEventListener('click', (e) => { e.preventDefault(); centerOn(id, Math.max(scale, 1.6)); window.ParlorOS?.openWin('w-chart'); });
  }

  // ---- vault list
  const vault = document.getElementById('vault'), q = document.getElementById('vault-q'), flagOnly = document.getElementById('vault-flag');
  function renderVault() {
    if (!vault) return; const term = (q?.value || '').trim().toLowerCase(); const only = flagOnly?.checked;
    const groups = new Map();
    data.filter((n) => n.kind === 'spacecraft' || n.run).forEach((n) => { const k = n.run || 0; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(n); });
    let html = '';
    [...groups.keys()].sort((a, b) => a - b).forEach((r) => {
      const rows = groups.get(r).filter((n) => (!only || n.flagship) && (!term || [n.name, n.terps, n.notes, byId.get(n.mother)?.name, byId.get(n.father)?.name].join(' ').toLowerCase().includes(term)));
      if (!rows.length) return;
      html += `<h2>${esc(RUNS[r] || 'Other')}</h2>` + rows.map((n) => `<button type="button" class="row${n.flagship ? ' flag' : ''}${n.id === current ? ' sel' : ''}" data-id="${n.id}"><b>${esc(n.name)}</b><small>${esc(byId.get(n.mother)?.name || '?')} × ${esc(byId.get(n.father)?.name || '?')}</small></button>`).join('');
    });
    vault.innerHTML = html || '<p class="txt small">Nothing matches.</p>';
    vault.querySelectorAll('.row').forEach((b) => b.addEventListener('click', () => { select(b.dataset.id, true); centerOn(b.dataset.id, Math.max(scale, 1.4)); }));
  }
  q?.addEventListener('input', renderVault); flagOnly?.addEventListener('change', renderVault); renderVault();

  // ---- first view: zoom in enough that labels are readable, centred on the first SpaceCraft generation.
  // Runs when the chart window is actually visible (on phones it starts hidden), FIT shows the whole map.
  let viewed = false;
  function initView() {
    if (viewed) return; const { w, h } = boxSize(); if (!w || !h) return; viewed = true;
    const scCol = cols.findIndex((c) => c.some((n) => n.kind === 'spacecraft'));
    const col = cols[scCol > 0 ? scCol : Math.min(1, maxGen)]; const mid = col[Math.floor(col.length / 2)];
    const s = Math.min(3, Math.max(1, 15 / (ROWH * unit())));
    if (mid) centerOn(mid.id, s); else fit();
  }
  fit(); initView();
  if (window.ResizeObserver) new ResizeObserver(() => initView()).observe(box);
  document.querySelectorAll('[data-open="w-chart"]').forEach((b) => b.addEventListener('click', () => setTimeout(initView, 60)));
  window.addEventListener('resize', apply);
})();
