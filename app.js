(() => {
  document.documentElement.classList.add('js');
  const CFG = window.SHII_CONFIG || {};
  const KEY = 'br0wnie-data-v2', CKEY = 'br0wnie-cart-v1';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const rp = n => 'Rp' + Number(n || 0).toLocaleString('id-ID');
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  const defaults = () => ({
    products: [
      {id:'original', nama:'Original Fudgy', harga:15000, kategori:'Klasik', desk:'Brownies cokelat klasik, fudgy dan moist. Isi 4 pcs.', img:'assets/p-classic.jpg', habis:false, laris:true},
      {id:'cheese', nama:'Cheese Brownies', harga:18000, kategori:'Topping', desk:'Perpaduan cokelat dan cream cheese yang creamy. Isi 4 pcs.', img:'assets/p-cheese.jpg', habis:false},
      {id:'almond', nama:'Almond Brownies', harga:18000, kategori:'Topping', desk:'Brownies cokelat dengan topping kacang almond. Isi 4 pcs.', img:'assets/p-almond.jpg', habis:false},
      {id:'marshmallow', nama:'Marshmallow', harga:18000, kategori:'Topping', desk:'Brownies cokelat dengan topping marshmallow panggang. Isi 4 pcs.', img:'assets/p-marshmallow.jpg', habis:false},
      {id:'matcha', nama:'Matcha Brownies', harga:20000, kategori:'Spesial', desk:'Brownies rasa matcha dengan white chocolate. Isi 4 pcs.', img:'assets/p-matcha.jpg', habis:false},
      {id:'redvelvet', nama:'Red Velvet', harga:20000, kategori:'Spesial', desk:'Rasa red velvet dengan topping cream cheese. Isi 4 pcs.', img:'assets/p-redvelvet.jpg', habis:false},
      {id:'biscoff', nama:'Biscoff Brownies', harga:23000, kategori:'Spesial', desk:'Brownies dengan selai dan remahan biskuit Biscoff. Isi 4 pcs.', img:'assets/p-biscoff.jpg', habis:false, laris:true},
      {id:'family9', nama:'Family Box isi 9', harga:40000, kategori:'Hampers', desk:'9 pcs, campur rasa sesukamu. Tulis kombinasinya di catatan.', img:'', habis:false, laris:true},
    ],

    toko: { wa: CFG.WA_NUMBER || '', jam: 'Setiap hari, 08.00–20.00', qrisPayload: '', qrisImg: '', fb: CFG.FACEBOOK || '', ig: CFG.INSTAGRAM || '', outlets: [{ nama: 'Br0wNie Liya One Melangka', alamat: 'Liya One Melangka, Kec. Wangi-Wangi Selatan, Wanci, Kab. Wakatobi, Sulawesi Tenggara', maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Liya One Melangka, Wangi-Wangi Selatan, Wakatobi'), jam: '08.00–20.00' }], marquee: 'Fudgy, Crackly top, Dipanggang pagi ini, Dark chocolate asli, Tanpa pengawet, Hampers custom' }
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
    const soc = [['Instagram', db.toko.ig], ['Facebook', db.toko.fb]];
    $('#foot-social').innerHTML = soc.map(([n, u]) => u ? `<a class="soc" href="${esc(u)}" target="_blank" rel="noopener">${n}</a>` : `<span class="soc off" title="Segera hadir">${n} <small>segera</small></span>`).join('');
    const o = (db.toko.outlets || [])[0];
    $('#foot-addr').textContent = o ? o.alamat : '';
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
  const OKEY = 'br0wnie-last-order';
  const nowLocal = (addMin = 60) => { const d = new Date(Date.now() + addMin * 6e4); return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  form.tanggal.value = ymd(new Date()); form.tanggal.min = ymd(new Date());
  form.ambil.value = nowLocal(60); form.ambil.min = nowLocal(0);
  const outlets = () => db.toko.outlets || [];
  function renderOutletSelect() {
    const sel = $('#sel-outlet'), cur = sel.value;
    sel.innerHTML = outlets().map((o, i) => `<option value="${i}">${esc(o.nama)}</option>`).join('') || '<option value="">Belum ada outlet</option>';
    if (cur && outlets()[cur]) sel.value = cur;
    const o = outlets()[sel.value];
    $('#outlet-info').innerHTML = o ? `${esc(o.alamat)}${o.jam ? `<br>Buka ${esc(o.jam)}` : ''}${o.maps ? `<br><a href="${esc(o.maps)}" target="_blank" rel="noopener">Buka di Google Maps →</a>` : ''}` : 'Toko belum menambahkan alamat outlet.';
  }
  const syncMetode = () => {
    const m = form.metode.value;
    $$('.grp').forEach(g => g.hidden = g.dataset.for !== m);
    form.alamat.required = m === 'antar'; form.tanggal.required = m === 'antar';
    form.ambil.required = m === 'toko';
    $('#btn-order').textContent = m === 'antar' ? 'Kirim pesanan ke WhatsApp' : (form.bayar.value === 'qris' ? 'Buat pesanan & bayar QRIS' : 'Buat kode pesanan');
    $('#order-fine').textContent = m === 'antar' ? 'Ongkir dihitung saat konfirmasi di WhatsApp.' : 'Tanpa ongkir. Tunjukkan kode pesanan saat ambil di outlet.';
    renderOutletSelect();
  };
  form.addEventListener('change', syncMetode); syncMetode();

  function openWA(text) {
    const n = waNumber();
    const url = (n ? `https://wa.me/${n}` : 'https://wa.me/') + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener');
  }
  const fmtDT = s => new Date(s).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  function makeCode() {
    const d = new Date(), A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let r = ''; const rnd = crypto.getRandomValues(new Uint8Array(4)); rnd.forEach(x => r += A[x % A.length]);
    return `BRW-${pad(d.getDate())}${pad(d.getMonth() + 1)}-${r}`;
  }

  // ---- QRIS (EMVCo) helpers: static -> dynamic with amount ----
  function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) { crc ^= str.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1; crc &= 0xFFFF; }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  function parseTLV(s) { const out = []; let i = 0; while (i + 4 <= s.length) { const t = s.substr(i, 2), l = parseInt(s.substr(i + 2, 2), 10); if (isNaN(l)) throw 0; out.push([t, s.substr(i + 4, l)]); i += 4 + l; } if (i !== s.length) throw 0; return out; }
  function isQris(s) { try { const t = parseTLV(s); const crc = t.find(x => x[0] === '63'); return t[0][0] === '00' && crc && crc16(s.slice(0, -4)) === crc[1].toUpperCase(); } catch { return false; } }
  function dynamicQris(payload, amount) {
    let t = parseTLV(payload).filter(([k]) => k !== '63' && k !== '54');
    t = t.map(([k, v]) => k === '01' ? [k, '12'] : [k, v]);
    const amt = String(Math.round(amount));
    const idx = t.findIndex(([k]) => Number(k) > 54);
    t.splice(idx < 0 ? t.length : idx, 0, ['54', amt]);
    const body = t.map(([k, v]) => k + String(v.length).padStart(2, '0') + v).join('') + '6304';
    return body + crc16(body);
  }
  function qrSvg(text) {
    if (!window.qrcode) return '<p class="muted">QR tidak bisa dimuat. Tunjukkan kode di atas ke kasir.</p>';
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  }

  let lastOrder = null;
  try { lastOrder = JSON.parse(localStorage.getItem(OKEY)); } catch {}
  const showTicketBtn = () => { $('#btn-ticket').hidden = !lastOrder; };
  showTicketBtn();

  function showTicket(o) {
    const outlet = o.outlet;
    $('#drawer-title').textContent = o.bayar === 'qris' ? 'Bayar dengan QRIS' : 'Kode pesanan';
    $('#t-code').textContent = o.kode;
    let qrText, hint, kicker;
    if (o.bayar === 'qris' && db.toko.qrisPayload) {
      qrText = dynamicQris(db.toko.qrisPayload, o.total);
      kicker = '<span class="status-pill wait">Menunggu pembayaran</span><br>Kode pesanan';
      hint = `Scan pakai m-banking atau e-wallet apa pun. Nominal ${rp(o.total)} sudah otomatis terisi. Tunjukkan bukti bayar + kode ini saat ambil.`;
      $('#t-qr').innerHTML = qrSvg(qrText); $('#t-qr').classList.remove('small');
    } else if (o.bayar === 'qris' && db.toko.qrisImg) {
      kicker = '<span class="status-pill wait">Menunggu pembayaran</span><br>Kode pesanan';
      hint = `Scan QRIS ini lalu masukkan nominal <b>${rp(o.total)}</b>. Tunjukkan bukti bayar + kode ini saat ambil.`;
      $('#t-qr').innerHTML = `<img src="${db.toko.qrisImg}" alt="QRIS toko">`; $('#t-qr').classList.remove('small');
    } else {
      qrText = `${o.kode} | ${o.nama} | ${o.items.map(i => i.q + 'x ' + i.nama).join(', ')} | Total ${rp(o.total)} | ${o.bayar === 'qris' ? 'QRIS' : 'Tunai'}`;
      kicker = '<span class="status-pill cash">Bayar di kasir</span><br>Kode pesanan';
      hint = o.bayar === 'qris' ? 'QRIS toko belum tersedia. Tunjukkan kode ini ke kasir dan bayar di outlet.' : 'Tunjukkan kode atau QR ini ke kasir, lalu bayar tunai saat mengambil pesanan.';
      $('#t-qr').innerHTML = qrSvg(qrText); $('#t-qr').classList.add('small');
    }
    $('#t-kicker').innerHTML = kicker; $('#t-hint').innerHTML = hint;
    $('#t-total').textContent = rp(o.total);
    $('#t-rows').innerHTML = o.items.map(i => `<div><span>${i.q}× ${esc(i.nama)}</span><span>${rp(i.q * i.harga)}</span></div>`).join('') + `<div><span>Atas nama</span><span>${esc(o.nama)}</span></div>`;
    $('#t-outlet').innerHTML = outlet ? `<strong>${esc(outlet.nama)}</strong>${esc(outlet.alamat)}${outlet.jam ? `<br>Buka ${esc(outlet.jam)}` : ''}<br>Ambil: ${fmtDT(o.ambil)}${outlet.maps ? `<br><a href="${esc(outlet.maps)}" target="_blank" rel="noopener">Petunjuk arah →</a>` : ''}` : `Ambil: ${fmtDT(o.ambil)}`;
    ['view-cart', 'foot-cart'].forEach(id => $('#' + id).hidden = true);
    ['view-done', 'foot-done'].forEach(id => $('#' + id).hidden = false);
    openDrawer(true);
  }
  function backToCart() {
    $('#drawer-title').textContent = 'Keranjang';
    ['view-cart', 'foot-cart'].forEach(id => $('#' + id).hidden = false);
    ['view-done', 'foot-done'].forEach(id => $('#' + id).hidden = true);
  }
  $('#btn-done').addEventListener('click', () => { openDrawer(false); setTimeout(backToCart, 400); });
  $('#btn-ticket').addEventListener('click', () => lastOrder && showTicket(lastOrder));
  $('#btn-cart').addEventListener('click', backToCart, true);
  $('#btn-confirm-wa').addEventListener('click', () => {
    const o = lastOrder; if (!o) return;
    openWA([`Halo ${CFG.STORE_NAME || 'Br0wNie'}, saya pesan untuk diambil di toko.`, '', `Kode: ${o.kode}`,
      ...o.items.map(i => `• ${i.q}x ${i.nama} — ${rp(i.q * i.harga)}`), `Total: ${rp(o.total)}`,
      `Pembayaran: ${o.bayar === 'qris' ? 'QRIS (bukti bayar saya lampirkan)' : 'Tunai di kasir'}`,
      `Outlet: ${o.outlet ? o.outlet.nama : '-'}`, `Ambil: ${fmtDT(o.ambil)}`, `Nama: ${o.nama}`, ...(o.catatan ? [`Catatan: ${o.catatan}`] : [])].join('\n'));
  });
  $('#btn-save-ticket').addEventListener('click', () => {
    const o = lastOrder; if (!o) return;
    const svg = $('#t-qr svg'), img = $('#t-qr img');
    const c = document.createElement('canvas'); c.width = 720; c.height = 1040; const g = c.getContext('2d');
    g.fillStyle = '#fffaf2'; g.fillRect(0, 0, 720, 1040);
    g.fillStyle = '#2a1a12'; g.textAlign = 'center';
    g.font = '800 44px "Cabinet Grotesk", sans-serif'; g.fillText('Br0wNie', 360, 80);
    g.font = '500 24px Satoshi, sans-serif'; g.fillStyle = '#5b4335'; g.fillText(o.bayar === 'qris' ? 'Bayar dengan QRIS' : 'Bayar tunai di kasir', 360, 125);
    g.fillStyle = '#2a1a12'; g.font = '800 56px "Cabinet Grotesk", sans-serif'; g.fillText(o.kode, 360, 205);
    const finish = () => {
      g.font = '700 34px "Cabinet Grotesk", sans-serif'; g.fillText('Total ' + rp(o.total), 360, 790);
      g.font = '400 22px Satoshi, sans-serif'; g.fillStyle = '#5b4335';
      g.fillText(o.outlet ? o.outlet.nama : '', 360, 840);
      g.fillText('Ambil ' + fmtDT(o.ambil), 360, 875);
      g.fillText('Atas nama ' + o.nama, 360, 910);
      const a = document.createElement('a'); a.download = `${o.kode}.png`;
      try { a.href = c.toDataURL('image/png'); a.click(); } catch { toast('Tidak bisa menyimpan gambar, screenshot saja ya'); }
    };
    const src = svg ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML) : img ? img.src : null;
    if (!src) return finish();
    const im = new Image(); im.onload = () => { g.drawImage(im, 160, 250, 400, 400); finish(); }; im.onerror = finish; im.src = src;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const items = cartItems(); if (!items.length) return toast('Keranjang masih kosong');
    const f = Object.fromEntries(new FormData(form));
    const total = items.reduce((s, x) => s + x.q * x.p.harga, 0);
    if (f.metode === 'antar') {
      const tgl = new Date(f.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      openWA([`Halo ${CFG.STORE_NAME || 'Br0wNie'}, saya mau pesan (diantar):`, '',
        ...items.map(({ p, q }) => `• ${q}x ${p.nama} — ${rp(p.harga * q)}`), '',
        `Total: ${rp(total)} (belum ongkir)`, '', `Nama: ${f.nama}`, `Alamat: ${f.alamat}`, `Tanggal kirim: ${tgl}`,
        ...(f.catatan ? [`Catatan: ${f.catatan}`] : [])].join('\n'));
      toast('Membuka WhatsApp…'); return;
    }
    if (!outlets().length) return toast('Toko belum menambahkan alamat outlet');
    lastOrder = { kode: makeCode(), nama: f.nama, bayar: f.bayar, ambil: f.ambil, catatan: f.catatan, total,
      outlet: outlets()[f.outlet] || outlets()[0], items: items.map(({ p, q }) => ({ nama: p.nama, harga: p.harga, q })), dibuat: Date.now() };
    try { localStorage.setItem(OKEY, JSON.stringify(lastOrder)); } catch {}
    cart = {}; saveCart(); renderCart(); showTicketBtn();
    showTicket(lastOrder);
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
  const HKEY = 'br0wnie-admin-hash-v2', SKEY = 'br0wnie-admin-session';
  async function sha(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const adminHash = () => CFG.ADMIN_HASH;
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
    const t = $('#form-toko'); t.fb.value = db.toko.fb || ''; t.ig.value = db.toko.ig || ''; t.wa.value = db.toko.wa; t.jam.value = db.toko.jam; t.marquee.value = db.toko.marquee;
    renderOutletAdmin(); renderQrisAdmin();
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
    Object.assign(db.toko, { fb: f.fb.value.trim(), ig: f.ig.value.trim(), wa: f.wa.value.replace(/\D/g, ''), jam: f.jam.value.trim(), marquee: f.marquee.value.trim() || defaults().toko.marquee });
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
  function renderOutletAdmin() {
    $('#outlet-list').innerHTML = outlets().map((o, i) => `<li><span class="ph">${i + 1}</span><span class="grow"><b>${esc(o.nama)}</b><small>${esc(o.alamat)}${o.jam ? ' · ' + esc(o.jam) : ''}</small></span><button class="mini del" data-odel="${i}">Hapus</button></li>`).join('') || '<li class="muted">Belum ada outlet.</li>';
  }
  $('#outlet-list').addEventListener('click', e => {
    const t = e.target.closest('[data-odel]'); if (!t || !guard()) return;
    if (!t.classList.contains('armed')) { t.classList.add('armed'); t.textContent = 'Yakin?'; return; }
    db.toko.outlets.splice(Number(t.dataset.odel), 1); save(); renderOutletAdmin(); renderOutletSelect(); toast('Outlet dihapus');
  });
  $('#form-outlet').addEventListener('submit', e => {
    e.preventDefault(); if (!guard()) return; const f = e.target;
    (db.toko.outlets ||= []).push({ nama: f.nama.value.trim(), alamat: f.alamat.value.trim(), maps: f.maps.value.trim(), jam: f.jam.value.trim() });
    save(); f.reset(); renderOutletAdmin(); renderOutletSelect(); toast('Outlet ditambahkan');
  });
  function renderQrisAdmin() {
    const t = db.toko;
    $('#qris-preview').innerHTML = t.qrisImg ? `<img src="${t.qrisImg}" alt="QRIS">` : 'Belum ada QRIS';
    $('#qris-msg').innerHTML = t.qrisPayload ? '✓ QRIS terbaca. Nominal otomatis aktif.' : t.qrisImg ? 'QR tidak terbaca otomatis. Pembeli akan diminta mengetik nominal sendiri.' : '';
  }
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  $('#qris-file').addEventListener('change', async e => {
    if (!guard()) return; const file = e.target.files[0]; if (!file) return;
    $('#qris-msg').textContent = 'Membaca QRIS…';
    try {
      const url = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
      const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const max = 1000, k = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
      let payload = '';
      try {
        if (!window.jsQR) await loadScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js');
        const d = g.getImageData(0, 0, c.width, c.height); const r = jsQR(d.data, c.width, c.height);
        if (r && isQris(r.data)) payload = r.data;
      } catch {}
      db.toko.qrisImg = c.toDataURL('image/jpeg', .85); db.toko.qrisPayload = payload; save(); renderQrisAdmin();
      toast(payload ? 'QRIS tersimpan' : 'Gambar tersimpan, QR tidak terbaca otomatis');
    } catch { $('#qris-msg').textContent = 'Gambar tidak bisa dibaca.'; }
    e.target.value = '';
  });
  $('#qris-clear').addEventListener('click', () => { if (!guard()) return; db.toko.qrisImg = ''; db.toko.qrisPayload = ''; save(); renderQrisAdmin(); toast('QRIS dihapus'); });

  $('#btn-logout').addEventListener('click', () => { sessionStorage.removeItem(SKEY); da.close(); applyAdmin(); toast('Keluar dari mode admin'); });

  function renderAll() { renderFilters(); renderProducts(); renderToko(); renderCart(); renderOutletSelect(); }
  renderAll(); applyAdmin();
})();
