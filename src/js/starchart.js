// SpaceCraft: the "bred in house" board, the tabbed plant readout and the lineage star chart.
// Everything is drawn from window.GENETICS (content/genetics/*.json) and window.RUNS (src/_data/runs.json).
// The 51 SpaceCraft crosses are the point of the page; the other plants are the outside genetics they
// came from, kept so every cross can be traced back to a landrace.
(function () {
  const data = window.GENETICS || []; if (!data.length) return;
  const runList = window.RUNS || [];
  const byId = new Map(data.map((n) => [n.id, n]));
  const byRun = new Map(runList.map((r) => [Number(r.n), r]));
  const KIND = { spacecraft: 'SpaceCraft cross', cut: 'clone-only cut', seedline: 'seed line', landrace: 'landrace', bagseed: 'bagseed', homebrew: 'homebrew line', unknown: 'unknown' };
  const runLabel = (n) => { const r = byRun.get(Number(n)); return r ? `Run ${r.n} · ${r.name} · ${r.year}` : (n ? 'Run ' + n : ''); };
  const mine = (n) => n.kind === 'spacecraft';
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

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
  const colLabel = (g, col) => g === 0 ? 'ROOTS & LANDRACES' : col.some((n) => n.kind === 'spacecraft') ? 'SPACECRAFT' : 'ANCESTORS';

  // ancestors / descendants, used by the chart highlight and the lineage tab
  const up_ = (id, acc = new Set()) => { const n = byId.get(id); if (!n) return acc; [n.mother, n.father].forEach((p) => { if (p && byId.has(p) && p !== id && !acc.has(p)) { acc.add(p); up_(p, acc); } }); return acc; };
  const down_ = (id, acc = new Set()) => { (kids.get(id) || []).forEach((k) => { if (!acc.has(k)) { acc.add(k); down_(k, acc); } }); return acc; };

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

  // ---- draw the chart
  const box = document.getElementById('chart');
  const ns = 'http://www.w3.org/2000/svg';
  const el = (t, a = {}, parent) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  let svg, view, stars, edgeEls = [], nodeEls = new Map();
  if (box) {
    svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'sky' }, box); svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    view = el('g', { class: 'view' }, svg);
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    stars = el('g', { class: 'stars' }, view);
    for (let i = 0; i < 260; i++) el('circle', { cx: (rnd() * W).toFixed(0), cy: (rnd() * H).toFixed(0), r: (rnd() * 1.4 + .3).toFixed(1), opacity: (rnd() * .6 + .2).toFixed(2) }, stars);
    cols.forEach((c, g) => { const t = el('text', { x: PADX + g * COLW, y: 30, class: 'col' }, view); t.textContent = colLabel(g, c); });
    const edges = el('g', { class: 'edges' }, view);
    data.forEach((n) => [['mother', n.mother], ['father', n.father]].forEach(([role, p]) => {
      if (!p || !pos.has(p) || p === n.id) return;
      const a = pos.get(p), b = pos.get(n.id); const dx = (b.x - a.x) / 2;
      edgeEls.push(el('path', { d: `M${a.x + 10},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x - 10},${b.y}`, class: 'edge ' + role, 'data-from': p, 'data-to': n.id }, edges));
    }));
    const nodes = el('g', { class: 'nodes' }, view);
    data.forEach((n) => {
      const p = pos.get(n.id);
      const g = el('g', { class: `node k-${n.kind}${n.flagship ? ' flag' : ''}${mine(n) ? ' mine' : ''}`, transform: `translate(${p.x},${p.y})`, tabindex: 0, role: 'button', 'aria-label': n.name }, nodes);
      if (n.flagship) { el('path', { d: 'M0,-13 L3.5,-3.5 L13,0 L3.5,3.5 L0,13 L-3.5,3.5 L-13,0 L-3.5,-3.5 Z', class: 'glyph' }, g); }
      else if (mine(n)) { el('circle', { r: 8, class: 'glyph' }, g); el('ellipse', { rx: 13.5, ry: 4, class: 'ring', transform: 'rotate(-20)' }, g); }
      else if (n.kind === 'cut' || n.kind === 'seedline' || n.kind === 'homebrew') { el('circle', { r: 5, class: 'glyph' }, g); }
      else { el('circle', { r: 3.5, class: 'glyph' }, g); }
      const t = el('text', { x: 17, y: 5, class: 'lbl' }, g); t.textContent = n.name;
      g.addEventListener('click', () => select(n.id, true));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n.id, true); } });
      nodeEls.set(n.id, g);
    });
  }

  // ---- pan / zoom
  let scale = 1, tx = 0, ty = 0;
  const apply = () => view && view.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`);
  const boxSize = () => { const r = box.getBoundingClientRect(); return { w: r.width || 800, h: r.height || 480 }; };
  const unit = () => { const { w, h } = boxSize(); return Math.min(w / W, h / H); };
  function fit() { scale = 1; tx = 0; ty = 0; apply(); }
  function centerOn(id, s) {
    const p = pos.get(id); if (!p || !box) return;
    if (s) scale = s; tx = W / 2 - p.x * scale; ty = H / 2 - p.y * scale; apply();
  }
  const svgPt = (cx, cy) => { const r = box.getBoundingClientRect(); const u = unit(); return { x: (cx - r.left - (r.width - W * u) / 2) / u, y: (cy - r.top - (r.height - H * u) / 2) / u }; };
  function zoomAt(f, cx, cy) { const p = svgPt(cx, cy); const ns2 = Math.min(6, Math.max(.3, scale * f)); tx = p.x - (p.x - tx) * (ns2 / scale); ty = p.y - (p.y - ty) * (ns2 / scale); scale = ns2; apply(); }
  if (box) {
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
    // "Mine only" pushes the 174 outside plants into the background so the crosses stand alone.
    const mineBtn = document.getElementById('chart-mine');
    mineBtn?.addEventListener('click', () => {
      const on = svg.classList.toggle('mine-only');
      mineBtn.setAttribute('aria-pressed', String(on)); mineBtn.classList.toggle('on', on);
    });
    svg.addEventListener('click', (e) => { if (e.target === svg || e.target.parentNode === stars) clearSel(); });
  }

  // ---- selection
  let current = null;
  function select(id, open) {
    if (!byId.has(id)) return;
    current = id; const anc = up_(id), des = down_(id);
    nodeEls.forEach((g, nid) => { g.classList.toggle('sel', nid === id); g.classList.toggle('anc', anc.has(nid)); g.classList.toggle('des', des.has(nid)); g.classList.toggle('dim', nid !== id && !anc.has(nid) && !des.has(nid)); });
    const lit = new Set([id, ...anc, ...des]);
    edgeEls.forEach((p) => { const on = lit.has(p.dataset.from) && lit.has(p.dataset.to); p.classList.toggle('on', on); p.classList.toggle('dim', !on); });
    openDossier(id);
    document.querySelectorAll('.vault .row').forEach((r) => r.classList.toggle('sel', r.dataset.id === id));
    document.querySelectorAll('.roster .rrow').forEach((r) => r.classList.toggle('sel', r.dataset.id === id));
    if (open) window.ParlorOS?.openWin('w-dossier');
  }
  function clearSel() { current = null; nodeEls.forEach((g) => g.classList.remove('sel', 'anc', 'des', 'dim')); edgeEls.forEach((p) => p.classList.remove('on', 'dim')); }

  // ================= the readout =================
  const dossier = document.getElementById('dossier'), tabsBar = document.getElementById('dossier-tabs');
  let tab = 'dossier';
  const link = (id) => { const n = byId.get(id); return n ? `<a href="#" data-go="${id}">${esc(n.name)}</a>` : '<span class="unknown">not recorded</span>'; };
  // Terps are written as one free line; split it so each smell becomes something you can chase.
  const terpList = (s) => String(s || '').split(/[;,]| and /)
    .map((t) => t.trim().replace(/^(a|an|the)\s+/i, '').replace(/\s+(pheno|phenos|terps?)$/i, '').trim())
    .filter((t) => t.length > 1);
  // Words that say nothing about a smell, so they never drag in an unrelated plant.
  const STOP = new Set(['with', 'that', 'some', 'very', 'like', 'more', 'than', 'this', 'from', 'into', 'over', 'both', 'when', 'been', 'pheno', 'phenos', 'leaner', 'terps', 'notes', 'something', 'insane']);
  const sharesTerp = (t, id) => {
    const w = [...new Set(t.toLowerCase().split(/[^a-z]+/).filter((x) => x.length > 3 && !STOP.has(x)))];
    if (!w.length) return [];
    return data
      .map((n) => (n.id === id || !n.terps ? null : { n, hits: w.filter((x) => n.terps.toLowerCase().includes(x)).length }))
      .filter((r) => r && r.hits)
      .sort((a, b) => b.hits - a.hits || (mine(b.n) - mine(a.n)) || a.n.name.localeCompare(b.n.name))
      .map((r) => r.n);
  };

  function openDossier(id) {
    const n = byId.get(id); if (!n || !dossier) return;
    document.getElementById('dossier-name').textContent = n.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.txt';
    const tabs = [['dossier', 'DOSSIER'], ['lineage', 'LINEAGE']];
    if (mine(n) && byRun.has(Number(n.run))) tabs.push(['run', 'THE RUN']);
    if ((kids.get(id) || []).length) tabs.push(['kids', 'WHAT IT MADE']);
    if (!tabs.some(([k]) => k === tab)) tab = 'dossier';
    tabsBar.innerHTML = tabs.map(([k, l]) => `<button type="button" role="tab" class="dtab${k === tab ? ' on' : ''}" data-tab="${k}" aria-selected="${k === tab}">${l}</button>`).join('');
    tabsBar.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; openDossier(id); }));
    dossier.className = 'body dossier' + (mine(n) ? ' is-mine' : ' is-outside');
    dossier.innerHTML = ({ dossier: tabDossier, lineage: tabLineage, run: tabRun, kids: tabKids })[tab](n);
    wire(dossier, id);
    dossier.scrollTop = 0;
  }

  function wire(root, id) {
    root.querySelectorAll('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); select(a.dataset.go, false); centerOn(a.dataset.go); }));
    root.querySelector('[data-center]')?.addEventListener('click', (e) => { e.preventDefault(); centerOn(id, Math.max(scale, 1.6)); window.ParlorOS?.openWin('w-chart'); });
    // the lineage tree: each branch opens in place
    root.querySelectorAll('[data-expand]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault(); const li = b.closest('li'); const open = li.classList.toggle('open');
      b.textContent = open ? '▾' : '▸'; b.setAttribute('aria-expanded', String(open));
      if (open && !li.querySelector('ul')) { li.insertAdjacentHTML('beforeend', branch(b.dataset.expand)); wire(li, id); }
    }));
    // a terp chip lists everything else that smells like it
    root.querySelectorAll('[data-terp]').forEach((b) => b.addEventListener('click', (e) => {
      e.preventDefault();
      const t = b.dataset.terp, out = root.querySelector('#terp-out'); if (!out) return;
      const hits = sharesTerp(t, id);
      root.querySelectorAll('[data-terp]').forEach((x) => x.classList.toggle('on', x === b));
      out.innerHTML = hits.length
        ? `<p class="small">${hits.length} other plant${hits.length > 1 ? 's' : ''} with <b>${esc(t)}</b> in the notes:</p><p class="terp-hits">${hits.slice(0, 24).map((h) => `${mine(h) ? '✦ ' : ''}${link(h.id)}`).join(' · ')}</p>`
        : `<p class="small">Nothing else on the chart smells like <b>${esc(t)}</b>. That one is its own.</p>`;
      wire(out, id);
    }));
  }

  // ---- tab: dossier
  function tabDossier(n) {
    const terps = terpList(n.terps);
    const badge = n.flagship ? '<span class="badge flag">FLAGSHIP</span>' : (mine(n) ? '<span class="badge mine">BRED HERE</span>' : '');
    const meta = [mine(n) ? 'SpaceCraft cross' : (KIND[n.kind] || n.kind), !mine(n) && n.breeder ? n.breeder : '', mine(n) ? runLabel(n.run) : n.year, n.status].filter(Boolean);
    return `
      ${n.thumb ? `<a class="photo" href="${esc(n.image)}" target="_blank" rel="noopener"><img src="${esc(n.thumb)}" alt="${esc(n.name)}" loading="lazy"></a>` : ''}
      <h1>${esc(n.name)}${badge}</h1>
      <p class="kind">${meta.map(esc).join(' · ')}</p>
      ${mine(n) ? '' : '<p class="outside-note">Outside genetics — not bred here. It is on the chart because one of the crosses traces back to it.</p>'}
      <dl class="kv">
        <dt>Mother ♀</dt><dd>${n.mother ? link(n.mother) : '<span class="unknown">not recorded</span>'}</dd>
        <dt>Father ♂</dt><dd>${n.father ? link(n.father) : '<span class="unknown">not recorded</span>'}</dd>
      </dl>
      ${terps.length ? `<div class="terps"><h2>Smells like</h2><p class="terp-chips">${terps.map((t) => `<button type="button" class="terp" data-terp="${esc(t)}">${esc(t)}</button>`).join('')}</p><div id="terp-out"><p class="small">Tap a smell to find everything else on the chart that shares it.</p></div></div>` : ''}
      ${n.notes ? `<p class="notes">${esc(n.notes)}</p>` : ''}
      <p class="acts"><a class="btn ghost" href="#" data-center="${n.id}">FIND ON CHART</a>${n.seedfinder ? ` <a class="btn ghost" href="${esc(n.seedfinder)}" target="_blank" rel="noopener">SEEDFINDER ↗</a>` : ''}</p>`;
  }

  // ---- tab: lineage (an ancestry tree you open a branch at a time)
  function branch(id) {
    const n = byId.get(id); if (!n) return '';
    const ps = [['♀', n.mother], ['♂', n.father]].filter(([, p]) => p && byId.has(p));
    if (!ps.length) return '';
    return `<ul>${ps.map(([sym, p]) => {
      const pn = byId.get(p);
      const more = (pn.mother && byId.has(pn.mother)) || (pn.father && byId.has(pn.father));
      return `<li class="${mine(pn) ? 'mine' : ''}">
        ${more ? `<button type="button" class="ex" data-expand="${p}" aria-expanded="false" aria-label="Show the parents of ${esc(pn.name)}">▸</button>` : '<span class="ex leaf">·</span>'}
        <span class="sym">${sym}</span>${link(p)}
        <small>${esc(mine(pn) ? 'bred here' : (KIND[pn.kind] || pn.kind))}${pn.breeder && !mine(pn) ? ' · ' + esc(pn.breeder) : ''}</small>
      </li>`;
    }).join('')}</ul>`;
  }
  function tabLineage(n) {
    const anc = up_(n.id);
    const roots = [...anc].map((a) => byId.get(a)).filter((a) => a && !(a.mother && byId.has(a.mother)) && !(a.father && byId.has(a.father)));
    const landrace = [...anc].map((a) => byId.get(a)).filter((a) => a && a.kind === 'landrace');
    const back = gen.get(n.id) || 0;
    return `
      <h1>Where ${esc(n.name)} comes from</h1>
      <p class="kind">${anc.size} known ancestors · ${back} generation${back === 1 ? '' : 's'} deep</p>
      <div class="tree">${branch(n.id) || '<p class="small">No parents recorded for this one.</p>'}</div>
      ${landrace.length ? `<h2>Landraces at the bottom</h2><p class="small">${landrace.map((l) => link(l.id)).join(' · ')}</p>` : ''}
      ${roots.length ? `<h2>Where the trail stops</h2><p class="small">${roots.slice(0, 14).map((r) => link(r.id)).join(' · ')}${roots.length > 14 ? ' …' : ''}</p>` : ''}
      <p class="acts"><a class="btn ghost" href="#" data-center="${n.id}">SEE IT ON THE CHART</a></p>`;
  }

  // ---- tab: the run this cross was made in
  function tabRun(n) {
    const r = byRun.get(Number(n.run)); if (!r) return '';
    const sibs = data.filter((s) => mine(s) && Number(s.run) === Number(n.run) && s.id !== n.id);
    return `
      <h1>Run ${r.n} · ${esc(r.name)}</h1>
      <p class="kind">${esc(r.season)} · ${sibs.length + 1} cross${sibs.length ? 'es' : ''} off this male</p>
      <dl class="kv">
        <dt>Pollen</dt><dd>${esc(r.donor)}</dd>
        <dt>Mother ♀</dt><dd>${n.mother ? link(n.mother) : '<span class="unknown">not recorded</span>'}</dd>
      </dl>
      ${r.donorNote ? `<p class="notes">${esc(r.donorNote)}</p>` : ''}
      ${r.story ? `<p>${esc(r.story)}</p>` : ''}
      ${r.dates ? `<p class="dates">${esc(r.dates)}</p>` : ''}
      ${sibs.length ? `<h2>Made in the same run</h2><p class="small">${sibs.map((s) => `${s.flagship ? '★ ' : ''}${link(s.id)}`).join(' · ')}</p>` : ''}`;
  }

  // ---- tab: what this plant went on to make
  function tabKids(n) {
    const direct = (kids.get(n.id) || []).map((k) => byId.get(k)).filter(Boolean);
    const all = down_(n.id);
    const mineDown = [...all].map((d) => byId.get(d)).filter((d) => d && mine(d));
    return `
      <h1>What ${esc(n.name)} made</h1>
      <p class="kind">${direct.length} direct · ${mineDown.length} SpaceCraft cross${mineDown.length === 1 ? '' : 'es'} downstream</p>
      <ul class="kidlist">${direct.map((k) => `<li class="${mine(k) ? 'mine' : ''}">
        <span class="sym">${k.mother === n.id ? '♀' : '♂'}</span>${link(k.id)}
        <small>${esc(mine(k) ? runLabel(k.run) || 'bred here' : (KIND[k.kind] || k.kind))}${k.flagship ? ' · flagship' : ''}</small>
        ${k.terps ? `<em>${esc(k.terps)}</em>` : ''}
      </li>`).join('')}</ul>
      ${mineDown.length > direct.length ? `<h2>Further down the line</h2><p class="small">${mineDown.filter((d) => !direct.includes(d)).map((d) => link(d.id)).join(' · ')}</p>` : ''}`;
  }

  // ================= the roster: every cross, grouped by the run that made it =================
  const listBox = document.getElementById('bred-list'), bredQ = document.getElementById('bred-q'), bredNone = document.getElementById('bred-none');
  let bredFilter = 'all';
  function renderBred() {
    if (!listBox) return;
    const term = (bredQ?.value || '').trim().toLowerCase();
    let list = data.filter(mine);
    if (bredFilter === 'flag') list = list.filter((n) => n.flagship);
    else if (bredFilter !== 'all') list = list.filter((n) => Number(n.run) === Number(bredFilter));
    if (term) list = list.filter((n) => [n.name, n.terps, n.notes, n.status, byId.get(n.mother)?.name, byId.get(n.father)?.name].join(' ').toLowerCase().includes(term));

    // Grouped by run, oldest first, so the whole body of work reads in the order it was made.
    const groups = new Map();
    list.forEach((n) => { const k = Number(n.run) || 0; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(n); });
    let i = 0, html = '';
    [...groups.keys()].sort((a, b) => a - b).forEach((k) => {
      const r = byRun.get(k), rws = groups.get(k).sort((a, b) => (b.flagship - a.flagship) || a.name.localeCompare(b.name));
      html += `<div class="rgroup">
        <div class="rhead">
          <b>${r ? `Run ${r.n} · ${esc(r.name)}` : 'Other crosses'}</b>
          <i>${rws.length}</i>
          ${r ? `<span>${esc(r.season)} · pollen from ${esc(r.donor)}</span>` : ''}
        </div>
        ${rws.map((n) => {
          i++;
          return `<button type="button" class="rrow${n.flagship ? ' flag' : ''}${n.id === current ? ' sel' : ''}" data-id="${n.id}">
            <span class="num">${String(i).padStart(2, '0')}</span>
            <span class="rmain">
              <span class="rn">${esc(n.name)}${n.flagship ? '<em title="Flagship: bred with again">★</em>' : ''}</span>
              <span class="rp">${esc(byId.get(n.mother)?.name || 'not recorded')} <i>×</i> ${esc(byId.get(n.father)?.name || 'not recorded')}</span>
              ${n.terps ? `<span class="rt">${esc(n.terps)}</span>` : ''}
            </span>
            ${n.status ? `<span class="rs s-${esc(n.status)}">${esc(n.status)}</span>` : ''}
          </button>`;
        }).join('')}
      </div>`;
    });
    listBox.innerHTML = html;
    if (bredNone) bredNone.hidden = list.length > 0;
    listBox.querySelectorAll('.rrow').forEach((b) => b.addEventListener('click', () => { select(b.dataset.id, true); centerOn(b.dataset.id, Math.max(scale, 1.4)); }));
  }
  document.querySelectorAll('#bred-runs .chip').forEach((c) => c.addEventListener('click', () => {
    document.querySelectorAll('#bred-runs .chip').forEach((x) => x.classList.remove('on')); c.classList.add('on');
    bredFilter = c.dataset.run; renderBred();
  }));
  bredQ?.addEventListener('input', renderBred);
  renderBred();

  // ================= vault list (the plain text index) =================
  const vault = document.getElementById('vault'), q = document.getElementById('vault-q'), flagOnly = document.getElementById('vault-flag');
  function renderVault() {
    if (!vault) return; const term = (q?.value || '').trim().toLowerCase(); const only = flagOnly?.checked;
    const groups = new Map();
    data.filter((n) => mine(n) || n.run).forEach((n) => { const k = Number(n.run) || 0; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(n); });
    let html = '';
    [...groups.keys()].sort((a, b) => a - b).forEach((r) => {
      const rws = groups.get(r).filter((n) => (!only || n.flagship) && (!term || [n.name, n.terps, n.notes, byId.get(n.mother)?.name, byId.get(n.father)?.name].join(' ').toLowerCase().includes(term)));
      if (!rws.length) return;
      html += `<h2>${esc(runLabel(r) || 'Other')}</h2>` + rws.map((n) => `<button type="button" class="row${n.flagship ? ' flag' : ''}${n.id === current ? ' sel' : ''}" data-id="${n.id}"><b>${esc(n.name)}</b><small>${esc(byId.get(n.mother)?.name || '?')} × ${esc(byId.get(n.father)?.name || '?')}</small></button>`).join('');
    });
    vault.innerHTML = html || '<p class="txt small">Nothing matches.</p>';
    vault.querySelectorAll('.row').forEach((b) => b.addEventListener('click', () => { select(b.dataset.id, true); centerOn(b.dataset.id, Math.max(scale, 1.4)); }));
  }
  q?.addEventListener('input', renderVault); flagOnly?.addEventListener('change', renderVault); renderVault();

  // ---- first view of the chart: zoomed enough to read, centred on the first SpaceCraft generation
  let viewed = false;
  function initView() {
    if (viewed || !box) return; const { w, h } = boxSize(); if (!w || !h) return; viewed = true;
    const scCol = cols.findIndex((c) => c.some((n) => n.kind === 'spacecraft'));
    const col = cols[scCol > 0 ? scCol : Math.min(1, maxGen)]; const mid = col[Math.floor(col.length / 2)];
    const s = Math.min(3, Math.max(1, 15 / (ROWH * unit())));
    if (mid) centerOn(mid.id, s); else fit();
  }
  if (box) {
    fit(); initView();
    if (window.ResizeObserver) new ResizeObserver(() => initView()).observe(box);
    document.querySelectorAll('[data-open="w-chart"]').forEach((b) => b.addEventListener('click', () => setTimeout(initView, 60)));
    window.addEventListener('resize', apply);
  }
})();
