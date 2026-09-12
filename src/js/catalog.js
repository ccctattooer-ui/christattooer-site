// Booking picks (kept in localStorage so they survive page changes), flash filtering, and the drawer.
(function () {
  const KEY = 'ct-picks';
  let picks = [];
  try { picks = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { picks = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(picks)); } catch (e) {} };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const drawer = $('#drawer');

  const INFO = window.FLASH_INFO || {};
  const PRICING = window.PRICING || {};
  const esc = (t) => String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const money = (n) => "$" + Number(n || 0).toLocaleString("en-US");

  // One row per picked design: the drawing, what it is, what it costs, and an obvious way out.
  // Price and size are read from FLASH_INFO every time rather than from the saved pick, so a
  // price changed in the admin can never show up stale in someone's basket.
  function pickRow(p, i) {
    const info = INFO[p.sku] || {};
    const size = info.s || p.size || "";
    return `<div class="pick">
      ${info.t ? `<img class="pick-art" src="${esc(info.t)}" alt="" width="48" height="48" loading="lazy">` : '<span class="pick-art pick-none" aria-hidden="true">?</span>'}
      <div class="pick-what">
        <b>${esc(info.n || p.name)}</b>
        <small>${esc(p.sku)}${size ? " · " + esc(size) : ""}</small>
      </div>
      <div class="pick-cost">${info.p ? money(info.p) : '<i>quoted</i>'}</div>
      <button type="button" class="pick-rm" data-rm="${i}" aria-label="Take ${esc(info.n || p.name)} off the request">Remove</button>
    </div>`;
  }

  // The shop minimum is per tattoo, not per basket, so it is applied to each design in turn.
  // Anything with no listed price (custom work) is left out and called out separately.
  function total() {
    const min = Number(PRICING.shopMinimum) || 0;
    let sum = 0, quoted = 0;
    picks.forEach((p) => {
      const price = Number((INFO[p.sku] || {}).p || 0);
      if (price) sum += Math.max(price, min);
      else quoted++;
    });
    return { sum, quoted };
  }

  function basketHTML(empty) {
    if (!picks.length) return `<div class="empty">${empty}</div>`;
    const { sum, quoted } = total();
    const count = `${picks.length} design${picks.length > 1 ? "s" : ""}` +
      (quoted ? `, ${quoted} quoted after a chat` : "");
    const note = sum
      ? "A rough total from the listed prices — I'll confirm once I've seen where it's going." +
        (PRICING.deposit ? " " + money(PRICING.deposit) + " deposit holds the time." : "")
      : "Nothing here has a listed price, so this one gets quoted after a chat.";
    return picks.map(pickRow).join("") + `<div class="pick-total">
      <span>${count}</span>
      <b>${sum ? "about " + money(sum) : "quoted"}</b>
      <small>${note}</small>
    </div>`;
  }

  function render() {
    const cnt = $('#cnt'); if (cnt) cnt.textContent = picks.length;
    document.body.classList.toggle('has-picks', picks.length > 0);
    const list = $('#list');
    if (list) {
      list.innerHTML = basketHTML("Nothing added yet. Add flash from the catalog, or choose custom work.");
      $$('[data-rm]', list).forEach(b => b.onclick = () => { picks.splice(+b.dataset.rm, 1); save(); render(); syncButtons(); });
    }
    $$('#picks, #b-picks').forEach(h => h.value = picks.map(p => `${p.sku} ${p.name}${p.size ? ' (' + p.size + ')' : ''}`).join('; '));
    const summary = $('#picks-summary');
    if (summary) {
      summary.innerHTML = basketHTML("Nothing picked from the catalog yet — you can still describe a custom idea below.");
      $$('[data-rm]', summary).forEach(b => b.onclick = () => { picks.splice(+b.dataset.rm, 1); save(); render(); syncButtons(); });
    }
  }

  function syncButtons() {
    $$('.item[data-sku]').forEach(el => {
      const on = picks.some(p => p.sku === el.dataset.sku);
      const b = $('.add', el); if (!b) return;
      b.classList.toggle('on', on); b.textContent = on ? 'Added ✓' : (el.dataset.sku === 'CU-000' ? (el.dataset.button || 'Request custom') : 'Add to request');
    });
  }
  function openDrawer() { if (drawer) { drawer.hidden = false; $('#d-name')?.focus({ preventScroll: true }); } }
  function closeDrawer() { if (drawer) drawer.hidden = true; }
  $('#reqbtn')?.addEventListener('click', () => drawer.hidden ? openDrawer() : closeDrawer());
  $('#closed')?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // flash items
  $$('.item[data-sku]').forEach(el => {
    $('.add', el)?.addEventListener('click', () => {
      const sku = el.dataset.sku, name = el.dataset.name;
      const i = picks.findIndex(p => p.sku === sku);
      if (i > -1) { picks.splice(i, 1); }
      else {
        picks.push({ sku, name, size: el.dataset.size || '' });
        el.classList.remove('just-added');
        void el.offsetWidth;            // restart the flash if they add two in a row
        el.classList.add('just-added');
        openDrawer();
      }
      save(); render(); syncButtons();
    });
  });

  // category + search filtering
  const items = $$('.item[data-sku]');
  const q = $('#q');
  let cat = 'all';
  function applyFilter() {
    const term = (q?.value || '').trim().toLowerCase();
    let shown = 0, flashShown = 0;
    items.forEach(el => {
      const okCat = cat === 'all' || el.dataset.cat === cat;
      const hay = (el.dataset.name + ' ' + el.dataset.sku + ' ' + el.dataset.cat).toLowerCase();
      const okQ = !term || hay.includes(term);
      el.hidden = !(okCat && okQ);
      if (!el.hidden) { shown++; if (el.dataset.sku !== 'CU-000') flashShown++; }
    });
    // The count is "of N flash designs", so the custom card doesn't count towards it.
    const count = $('#shown'); if (count) count.textContent = flashShown;
    const nores = $('#nores'); if (nores) nores.hidden = shown > 0;
  }
  $$('.cats li[data-cat]').forEach(li => li.addEventListener('click', () => {
    $$('.cats li').forEach(x => x.classList.remove('on')); li.classList.add('on'); cat = li.dataset.cat; applyFilter();
  }));
  if (q) {
    if (items.length) { q.addEventListener('input', applyFilter); $('#qgo')?.addEventListener('click', applyFilter); }
    else { const go = () => { location.href = '/flash/?q=' + encodeURIComponent(q.value); }; $('#qgo')?.addEventListener('click', go); q.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }); }
    const pre = new URLSearchParams(location.search).get('q'); if (pre && items.length) { q.value = pre; applyFilter(); }
  }

  // work page lightbox
  const lb = $('#lb');
  if (lb) {
    $$('.wgrid button').forEach(b => b.addEventListener('click', () => {
      $('#lb-img').src = b.dataset.full; $('#lb-img').alt = b.dataset.title || 'Tattoo';
      $('#lb-title').textContent = b.dataset.title || 'Untitled';
      $('#lb-meta').textContent = [b.dataset.placement, b.dataset.style, b.dataset.hours ? b.dataset.hours + ' hr' : ''].filter(Boolean).join(' · ');
      $('#lb-notes').textContent = b.dataset.notes || '';
      lb.showModal();
    }));
    $('#lb-close')?.addEventListener('click', () => lb.close());
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  }

  render(); syncButtons();
})();
