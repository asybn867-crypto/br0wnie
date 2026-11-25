(() => {
  document.documentElement.classList.add('js');
  const CFG = window.SHII_CONFIG || {};
  const KEY = 'br0wnie-data-v1', CKEY = 'br0wnie-cart-v1';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const rp = n => 'Rp' + Number(n || 0).toLocaleString('id-ID');
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  const defaults = () => ({
    products: [
      {id:'classic', nama:'Classic Fudgy', harga:12000, kategori:'Klasik', desk:'Dark chocolate pekat, tengah lembap, top crackly mengilap.', img:'assets/p-classic.jpg', habis:false, laris:true},
      {id:'cheese', nama:'Cheese Swirl', harga:15000, kategori:'Topping', desk:'Marmer cream cheese gurih di atas brownies cokelat.', img:'assets/p-cheese.jpg', habis:false},
      {id:'almond', nama:'Almond Crunch', harga:14000, kategori:'Topping', desk:'Taburan almond slice panggang yang renyah.', img:'assets/p-almond.jpg', habis:false},
      {id:'hazel', nama:'Hazelnut Lava', harga:16000, kategori:'Spesial', desk:'Swirl selai cokelat hazelnut dan hazelnut sangrai.', img:'assets/p-hazel.jpg', habis:false, laris:true},
      {id:'cookies', nama:'Cookies & Cream', harga:15000, kategori:'Topping', desk:'Potongan biskuit cokelat isi krim di setiap gigitan.', img:'assets/p-cookies.jpg', habis:false},
      {id:'matcha', nama:'Matcha Marble', harga:16000, kategori:'Spesial', desk:'Swirl white chocolate matcha di atas dark chocolate.', img:'assets/p-matcha.jpg', habis:false},
      {id:'box4', nama:'Box Isi 4', harga:55000, kategori:'Hampers', desk:'Pilih 4 rasa, cocok untuk ngemil berdua.', img:'', habis:false},
      {id:'box9', nama:'Box Isi 9', harga:120000, kategori:'Hampers', desk:'Favorit untuk arisan dan kantor.', img:'', habis:false, laris:true},
      {id:'box16', nama:'Hampers Isi 16', harga:205000, kategori:'Hampers', desk:'Box kraft + pita + kartu ucapan.', img:'', habis:false},
    ],
    toko: { wa: CFG.WA_NUMBER || '', jam: 'Setiap hari, 08.00–20.00', marquee: 'Fudgy, Crackly top, Dipanggang pagi ini, Dark chocolate asli, Tanpa pengawet, Hampers custom' }
  });

  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)) || defaults(); } catch { db = defaults(); }
  db.products ||= defaults().products; db.toko = { ...defaults().toko, ...(db.toko || {}) };
  let cart; try { cart = JSON.parse(localStorage.getItem(CKEY)) || {}; } catch { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { toast('Penyimpanan penuh, coba foto yang lebih kecil'); } };
  const saveCart = () => { try { localStorage.setItem(CKEY, JSON.stringify(cart)); } catch {} };
  const waNumber = () => (db.toko.wa || CFG.WA_NUMBER || '').replace(/\D/g, '');

  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); };

  // ---------- Render storefront ----------
  let filter = 'Semua';
  const CATS = ['Semua', 'Klasik', 'Topping', 'Spesial'];
  function renderFilters() {
    $('#filters').innerHTML = CATS.map(c => `<button role="tab" aria-selected="${c === filter}" data-filter="${c}">${c}</button>`).join('');
  }
  const media = p => p.img ? `<img src="${esc(p.img)}" alt="${esc(p.nama)}" loading="lazy" width="600" height="600">` : '';
  function renderProducts() {
    const list = db.products.filter(p => p.kategori !== 'Hampers' && (filter === 'Semua' || p.kategori === filter));
    $('#product-grid').innerHTML = list.length ? list.map(p => `
      <article class="card ${p.habis ? 'is-out' : ''}">
        <div class="card-media">${media(p) || '<div style="height:100%;display:grid;place-items:center;font:800 3rem var(--font-d);color:var(--accent)">0</div>'}
          ${p.habis ? '<span class="badge out">Habis</span>' : p.laris ? '<span class="badge">Terlaris</span>' : ''}</div>
        <div class="card-body"><h3>${esc(p.nama)}</h3><p>${esc(p.desk)}</p>
          <div class="card-foot"><span class="price">${rp(p.harga)}</span><button class="add" data-add="${p.id}" aria-label="Tambah ${esc(p.nama)} ke keranjang">+</button></div></div>
      </article>`).join('') : '<p class="empty">Belum ada menu di kategori ini.</p>';
    const boxes = db.products.filter(p => p.kategori === 'Hampers');
    $('#boxes').innerHTML = boxes.length ? boxes.map(p => `
      <div class="boxrow"><span class="grow"><strong>${esc(p.nama)}${p.laris && !p.habis ? ' <small>· terlaris</small>' : ''}</strong><small>${esc(p.desk)}</small></span>
      <span class="price">${rp(p.harga)}</span>
      <button class="add" data-add="${p.id}" ${p.habis ? 'disabled style="opacity:.35"' : ''} aria-label="Tambah ${esc(p.nama)}">+</button></div>`).join('') : '<p class="empty">Belum ada pilihan hampers.</p>';
  }
  function renderToko() {
    const words = db.toko.marquee.split(',').map(s => s.trim()).filter(Boolean);
    const one = words.map(w => `<span>${esc(w)}</span>`).join('');
    $('#marquee').innerHTML = one + one;
    $('#foot-hours').textContent = db.toko.jam;
  }

  // ---------- Cart ----------
  const prod = id => db.products.find(p => p.id === id);
  function cartItems() { return Object.entries(cart).map(([id, q]) => ({ p: prod(id), q })).filter(x => x.p && x.q > 0); }
  function renderCart() {
    const items = cartItems();
    const count = items.reduce((s, x) => s + x.q, 0), total = items.reduce((s, x) => s + x.q * x.p.harga, 0);
    $('#cart-count').textContent = count;
    $('#cart-total').textContent = rp(total);
    $('#btn-order').disabled = !count;
    $('#cart-list').innerHTML = items.length ? items.map(({ p, q }) => `
      <li>${p.img ? `<img src="${esc(p.img)}" alt="">` : '<span class="ph">0</span>'}
        <span class="grow"><strong>${esc(p.nama)}</strong><small>${rp(p.harga)} × ${q} = ${rp(p.harga * q)}</small></span>
        <span class="qty"><button data-dec="${p.id}" aria-label="Kurangi">−</button><span>${q}</span><button data-inc="${p.id}" aria-label="Tambah">+</button></span></li>`).join('')
      : '<li class="empty">Keranjang masih kosong. Yuk pilih brownies dulu.</li>';
  }
  function addToCart(id, n = 1) {
    const p = prod(id); if (!p || p.habis) return;
    cart[id] = Math.max(0, (cart[id] || 0) + n); if (!cart[id]) delete cart[id];
    saveCart(); renderCart();
    if (n > 0) { const b = $('#btn-cart'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); toast(`${p.nama} masuk keranjang`); }
  }
  const drawer = $('#drawer'), scrim = $('#scrim');
  function openDrawer(on) { drawer.classList.toggle('on', on); scrim.classList.toggle('on', on); drawer.setAttribute('aria-hidden', !on); document.body.style.overflow = on ? 'hidden' : ''; }
  $('#btn-cart').addEventListener('click', () => openDrawer(true));
  scrim.addEventListener('click', () => openDrawer(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('on')) openDrawer(false); });

  const form = $('#form-order');
  form.tanggal.value = ymd(new Date()); form.tanggal.min = ymd(new Date());
  const syncMetode = () => { const d = form.metode.value === 'Diantar'; $('#lbl-alamat').hidden = !d; form.alamat.required = d; };
  form.addEventListener('change', syncMetode); syncMetode();

  function openWA(text) {
    const n = waNumber();
    const url = (n ? `https://wa.me/${n}` : 'https://wa.me/') + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const items = cartItems(); if (!items.length) return toast('Keranjang masih kosong');
    const f = Object.fromEntries(new FormData(form));
    const total = items.reduce((s, x) => s + x.q * x.p.harga, 0);
    const tgl = new Date(f.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const lines = [
      `Halo ${CFG.STORE_NAME || 'Br0wNie'}, saya mau pesan:`, '',
      ...items.map(({ p, q }) => `• ${q}x ${p.nama} — ${rp(p.harga * q)}`), '',
      `Total: ${rp(total)} (belum ongkir)`, '',
      `Nama: ${f.nama}`, `Pengambilan: ${f.metode}`,
      ...(f.metode === 'Diantar' ? [`Alamat: ${f.alamat}`] : []),
      `Tanggal: ${tgl}`, ...(f.catatan ? [`Catatan: ${f.catatan}`] : [])
    ];
    openWA(lines.join('\n'));
    toast('Membuka WhatsApp…');
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-add],[data-inc],[data-dec],[data-filter],[data-quick-wa],[data-close-drawer]'); if (!t) return;
    if (t.dataset.add) addToCart(t.dataset.add);
    if (t.dataset.inc) addToCart(t.dataset.inc, 1);
    if (t.dataset.dec) addToCart(t.dataset.dec, -1);
    if (t.dataset.filter) { filter = t.dataset.filter; renderFilters(); renderProducts(); }
    if ('quickWa' in t.dataset) openWA(`Halo ${CFG.STORE_NAME || 'Br0wNie'}, saya mau tanya soal brownies.`);
    if ('closeDrawer' in t.dataset) openDrawer(false);
  });

  // ---------- Nav + reveal ----------
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
    $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (el.closest('.hero') ? i * 90 : 0) + 'ms'; io.observe(el); });
  } else $$('.reveal').forEach(el => el.classList.add('in'));
  $('#year').textContent = new Date().getFullYear();

  // ---------- Admin ----------
  const HKEY = 'br0wnie-admin-hash', SKEY = 'br0wnie-admin-session';
  async function sha(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const adminHash = () => localStorage.getItem(HKEY) || CFG.ADMIN_HASH;
  function isAdmin() { try { const s = JSON.parse(sessionStorage.getItem(SKEY)); return !!s && s.h === adminHash() && Date.now() < s.exp; } catch { return false; } }
  function applyAdmin() { const on = isAdmin(); const b = $('#btn-admin'); b.textContent = on ? 'Admin ✓' : 'Admin'; b.classList.toggle('on', on); }
  const dl = $('#dlg-login'), da = $('#dlg-admin');
  $('#btn-admin').addEventListener('click', () => {
    if (isAdmin()) { renderAdmin(); da.showModal(); }
    else { $('#login-err').textContent = ''; $('#form-login').reset(); dl.showModal(); }
  });
  document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) c.closest('dialog').close(); });
  [dl, da].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  let fails = 0, lockUntil = 0;
  $('#form-login').addEventListener('submit', async e => {
    e.preventDefault();
    if (Date.now() < lockUntil) { $('#login-err').textContent = `Terlalu banyak percobaan. Tunggu ${Math.ceil((lockUntil - Date.now()) / 1000)} detik.`; return; }
    const f = e.target, h = await sha('shii-salt:' + f.pass.value);
    if (f.user.value.trim() === (CFG.ADMIN_USER || 'admin') && h === adminHash()) {
      fails = 0; sessionStorage.setItem(SKEY, JSON.stringify({ h, exp: Date.now() + 8 * 3600e3 }));
      dl.close(); applyAdmin(); renderAdmin(); da.showModal(); toast('Berhasil masuk sebagai admin');
    } else {
      if (++fails >= 5) { lockUntil = Date.now() + 30e3; fails = 0; }
      $('#login-err').textContent = 'Username atau password salah.'; f.pass.value = ''; f.pass.focus();
    }
  });
  $$('[data-atab]').forEach(b => b.addEventListener('click', () => {
    $$('[data-atab]').forEach(x => x.setAttribute('aria-selected', x === b));
    $$('[data-apane]').forEach(p => p.hidden = p.dataset.apane !== b.dataset.atab);
  }));

  const pf = $('#form-prod');
  function resetProdForm() { pf.reset(); pf.id.value = ''; $('#prod-submit').textContent = 'Tambah produk'; $('#prod-cancel').hidden = true; }
  function renderAdmin() {
    $('#admin-list').innerHTML = db.products.map(p => `
      <li>${p.img ? `<img src="${esc(p.img)}" alt="">` : '<span class="ph">0</span>'}
        <span class="grow"><b>${esc(p.nama)}</b>${p.habis ? ' · <span style="color:var(--accent-h)">habis</span>' : ''}<small>${esc(p.kategori)} · ${rp(p.harga)}</small></span>
        <button class="mini" data-pstock="${p.id}">${p.habis ? 'Tersedia' : 'Habis'}</button>
        <button class="mini" data-pedit="${p.id}">Edit</button>
        <button class="mini del" data-pdel="${p.id}">Hapus</button></li>`).join('');
    const t = $('#form-toko'); t.wa.value = db.toko.wa; t.jam.value = db.toko.jam; t.marquee.value = db.toko.marquee;
    $('#reset-msg').textContent = ''; $('#btn-reset').classList.remove('armed'); $('#pass-out').textContent = '';
  }
  const guard = () => { if (!isAdmin()) { da.close(); applyAdmin(); toast('Sesi admin berakhir, silakan login lagi'); return false; } return true; };
  function readImage(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => { const im = new Image(); im.onload = () => {
        const s = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = 600;
        c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 600, 600);
        res(c.toDataURL('image/jpeg', .82)); }; im.onerror = rej; im.src = r.result; };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }
  pf.addEventListener('submit', async e => {
    e.preventDefault(); if (!guard()) return;
    const f = pf, id = f.id.value;
    let img; if (f.foto.files[0]) { try { img = await readImage(f.foto.files[0]); } catch { return toast('Foto tidak bisa dibaca'); } }
    const data = { nama: f.nama.value.trim(), harga: Number(f.harga.value), kategori: f.kategori.value, desk: f.desk.value.trim(), habis: f.habis.checked };
    if (id) { const p = prod(id); Object.assign(p, data); if (img) p.img = img; toast('Produk diperbarui'); }
    else { db.products.push({ id: uid(), img: img || '', ...data }); toast('Produk ditambahkan'); }
    save(); resetProdForm(); renderAdmin(); renderProducts(); renderCart();
  });
  $('#prod-cancel').addEventListener('click', resetProdForm);
  $('#admin-list').addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t || !guard()) return;
    if (t.dataset.pstock) { const p = prod(t.dataset.pstock); p.habis = !p.habis; if (p.habis) delete cart[p.id]; }
    if (t.dataset.pedit) {
      const p = prod(t.dataset.pedit);
      pf.id.value = p.id; pf.nama.value = p.nama; pf.harga.value = p.harga; pf.kategori.value = p.kategori; pf.desk.value = p.desk; pf.habis.checked = p.habis;
      $('#prod-submit').textContent = 'Simpan perubahan'; $('#prod-cancel').hidden = false; pf.nama.focus(); return;
    }
    if (t.dataset.pdel) {
      if (!t.classList.contains('armed')) { t.classList.add('armed'); t.textContent = 'Yakin?'; return; }
      db.products = db.products.filter(p => p.id !== t.dataset.pdel); delete cart[t.dataset.pdel]; toast('Produk dihapus');
    }
    save(); saveCart(); renderAdmin(); renderProducts(); renderCart();
  });
  $('#form-toko').addEventListener('submit', e => {
    e.preventDefault(); if (!guard()) return; const f = e.target;
    db.toko = { wa: f.wa.value.replace(/\D/g, ''), jam: f.jam.value.trim(), marquee: f.marquee.value.trim() || defaults().toko.marquee };
    save(); renderToko(); toast('Pengaturan toko disimpan');
  });
  $('#btn-reset').addEventListener('click', e => {
    if (!guard()) return; const b = e.currentTarget;
    if (!b.classList.contains('armed')) { b.classList.add('armed'); $('#reset-msg').textContent = 'Klik sekali lagi untuk mengembalikan menu & harga awal.'; return; }
    db.products = defaults().products; cart = {}; save(); saveCart(); renderAll(); renderAdmin(); toast('Menu dikembalikan ke awal');
  });
  $('#btn-export').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
    a.download = `br0wnie-data-${ymd(new Date())}.json`; a.click();
  });
  $('#file-import').addEventListener('change', async e => {
    if (!guard()) return;
    try { const d = JSON.parse(await e.target.files[0].text()); if (!Array.isArray(d.products)) throw 0; db = { products: d.products, toko: { ...defaults().toko, ...d.toko } }; save(); renderAll(); renderAdmin(); toast('Data diimpor'); }
    catch { toast('File tidak valid'); }
    e.target.value = '';
  });
  $('#form-pass').addEventListener('submit', async e => {
    e.preventDefault(); if (!guard()) return; const f = e.target;
    if (f.p1.value !== f.p2.value) { $('#pass-out').textContent = 'Password tidak sama.'; return; }
    const h = await sha('shii-salt:' + f.p1.value);
    localStorage.setItem(HKEY, h); sessionStorage.setItem(SKEY, JSON.stringify({ h, exp: Date.now() + 8 * 3600e3 })); f.reset();
    $('#pass-out').innerHTML = 'Password diganti di perangkat ini. Agar berlaku di semua perangkat, tempel hash ini ke <b>ADMIN_HASH</b> di config.js:<code class="hash">' + h + '</code>';
  });
  $('#btn-logout').addEventListener('click', () => { sessionStorage.removeItem(SKEY); da.close(); applyAdmin(); toast('Keluar dari mode admin'); });

  function renderAll() { renderFilters(); renderProducts(); renderToko(); renderCart(); }
  renderAll(); applyAdmin();
})();
