(() => {
  const KEY = 'shii-data-v1';
  const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const todayStr = () => ymd(new Date());
  const fmtDate = s => new Date(s + 'T00:00:00').toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'});

  const sample = () => ({
    jadwal: [
      {id:uid(),hari:'Senin',mapel:'Matematika',mulai:'07:30',selesai:'09:00',ket:'Bu Rahma · R.12'},
      {id:uid(),hari:'Senin',mapel:'Bahasa Indonesia',mulai:'09:15',selesai:'10:45',ket:''},
      {id:uid(),hari:'Selasa',mapel:'Fisika',mulai:'07:30',selesai:'09:00',ket:'Lab IPA'},
      {id:uid(),hari:'Rabu',mapel:'Bahasa Inggris',mulai:'07:30',selesai:'09:00',ket:''},
      {id:uid(),hari:'Kamis',mapel:'Kimia',mulai:'09:15',selesai:'10:45',ket:''},
      {id:uid(),hari:'Jumat',mapel:'Informatika',mulai:'07:30',selesai:'09:00',ket:'Lab Komputer'},
    ],
    nilai: [], log: {}
  });

  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)) || sample(); } catch { db = sample(); }
  db.jadwal ||= []; db.nilai ||= []; db.log ||= {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  save();

  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); };

  // Navigation
  function go(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === view));
    document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.go === view));
    window.scrollTo({top:0});
  }
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); }
  });

  // Streak logic
  function streakInfo() {
    const days = Object.keys(db.log).sort();
    const set = new Set(days);
    let best = 0, run = 0, prev = null;
    for (const d of days) {
      const cur = new Date(d + 'T00:00:00');
      run = prev && (cur - prev) / 864e5 === 1 ? run + 1 : 1;
      best = Math.max(best, run); prev = cur;
    }
    let current = 0; const c = new Date(); c.setHours(0,0,0,0);
    if (!set.has(ymd(c))) c.setDate(c.getDate() - 1);
    while (set.has(ymd(c))) { current++; c.setDate(c.getDate() - 1); }
    return { current, best, total: days.length, doneToday: set.has(todayStr()) };
  }

  function checkin(catatan = '', menit = 30) {
    const t = todayStr();
    const e = db.log[t] || { menit: 0, catatan: [] };
    e.menit += Number(menit) || 0;
    if (catatan) e.catatan.push(catatan);
    db.log[t] = e; save(); render();
    toast(`Tercatat. Streak: ${streakInfo().current} hari`);
  }

  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const byTime = (a, b) => toMin(a.mulai) - toMin(b.mulai);
  const avg = arr => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;
  const fmtN = n => n == null ? '–' : (Math.round(n * 10) / 10).toLocaleString('id-ID');

  function renderHome() {
    const now = new Date(), hari = HARI[now.getDay()];
    $('#today-label').textContent = now.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
    const s = streakInfo();
    $('#s-streak').textContent = s.current;
    const hb = $('#btn-checkin-home'); hb.disabled = s.doneToday; hb.textContent = s.doneToday ? 'Sudah tercatat hari ini' : 'Catat belajar hari ini';
    const a = avg(db.nilai.map(n => n.nilai));
    $('#s-avg').textContent = fmtN(a);
    $('#s-avg-sub').textContent = db.nilai.length ? `dari ${db.nilai.length} nilai` : 'Belum ada nilai';
    const list = db.jadwal.filter(j => j.hari === hari).sort(byTime);
    $('#s-today-count').textContent = list.length;
    const nm = now.getHours() * 60 + now.getMinutes();
    const next = list.find(j => toMin(j.selesai) > nm);
    $('#s-next').textContent = !list.length ? 'Tidak ada pelajaran' : next ? (toMin(next.mulai) <= nm ? `Sedang: ${next.mapel}` : `Berikutnya: ${next.mapel} ${next.mulai}`) : 'Semua pelajaran selesai';
    $('#today-list').innerHTML = list.length ? list.map(j => {
      const live = toMin(j.mulai) <= nm && nm < toMin(j.selesai);
      return `<li class="${live ? 'now' : ''}"><span class="time">${j.mulai}–${j.selesai}</span><span class="grow"><b>${esc(j.mapel)}</b>${j.ket ? `<br><span class="sub">${esc(j.ket)}</span>` : ''}</span>${live ? '<span class="pill">Sekarang</span>' : ''}</li>`;
    }).join('') : `<li class="empty">Hari ${hari} tidak ada pelajaran. Waktu yang pas untuk mengulang materi.</li>`;
  }

  function renderJadwal() {
    const today = HARI[new Date().getDay()];
    $('#days').innerHTML = HARI.slice(1).map(h => {
      const list = db.jadwal.filter(j => j.hari === h).sort(byTime);
      return `<article class="card day ${h === today ? 'is-today' : ''}"><h2>${h}${h === today ? '<span class="pill">Hari ini</span>' : ''}</h2>
        <ul class="list">${list.length ? list.map(j => `<li><span class="time">${j.mulai}–${j.selesai}</span><span class="grow">${esc(j.mapel)}${j.ket ? `<br><span class="sub">${esc(j.ket)}</span>` : ''}</span><button class="del admin-only" data-del-j="${j.id}" aria-label="Hapus ${esc(j.mapel)}">×</button></li>`).join('') : '<li class="empty">Kosong</li>'}</ul></article>`;
    }).join('');
  }

  function renderNilai() {
    const mapels = [...new Set([...db.nilai.map(n => n.mapel), ...db.jadwal.map(j => j.mapel)])].sort();
    $('#mapel-list').innerHTML = mapels.map(m => `<option value="${esc(m)}">`).join('');
    const fm = $('#filter-mapel'), cur = fm.value;
    const nm = [...new Set(db.nilai.map(n => n.mapel))].sort();
    fm.innerHTML = '<option value="">Semua mapel</option>' + nm.map(m => `<option ${m === cur ? 'selected' : ''}>${esc(m)}</option>`).join('');
    const groups = nm.map(m => ({ m, a: avg(db.nilai.filter(n => n.mapel === m).map(n => n.nilai)), c: db.nilai.filter(n => n.mapel === m).length })).sort((x, y) => y.a - x.a);
    $('#bars').innerHTML = groups.length ? groups.map(g => `<li><div class="bar-top"><span>${esc(g.m)} <span class="muted">· ${g.c}</span></span><b>${fmtN(g.a)}</b></div><div class="track"><div class="fill ${g.a < 70 ? 'low' : g.a < 80 ? 'mid' : ''}" style="width:${g.a}%"></div></div></li>`).join('') : '<li class="empty">Masukkan nilai pertama Anda lewat formulir di atas.</li>';
    const rows = db.nilai.filter(n => !fm.value || n.mapel === fm.value).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    $('#nilai-body').innerHTML = rows.length ? rows.map(n => `<tr><td>${fmtDate(n.tanggal)}</td><td>${esc(n.mapel)}</td><td>${esc(n.jenis)}</td><td class="r grade" style="color:${n.nilai < 70 ? 'var(--danger)' : 'inherit'}">${fmtN(n.nilai)}</td><td class="r"><button class="del" data-del-n="${n.id}" aria-label="Hapus nilai">×</button></td></tr>`).join('') : '<tr><td colspan="5" class="empty">Belum ada nilai.</td></tr>';
  }

  function renderStreak() {
    const s = streakInfo();
    $('#st-current').textContent = s.current; $('#st-best').textContent = s.best; $('#st-total').textContent = s.total;
    $('#st-msg').textContent = s.doneToday ? 'Hari ini sudah tercatat. Pertahankan.' : s.current ? 'Belajar hari ini agar streak tidak putus.' : 'Mulai streak pertamamu hari ini.';
    const b = $('#btn-checkin'); b.textContent = s.doneToday ? 'Tambah catatan hari ini' : 'Catat belajar hari ini';
    // heatmap: 16 weeks, columns start Monday
    const end = new Date(); end.setHours(0,0,0,0);
    const start = new Date(end); start.setDate(start.getDate() - 7 * 15 - ((end.getDay() + 6) % 7));
    const cells = []; const t = todayStr();
    for (let d = new Date(start), i = 0; i < 16 * 7; i++, d.setDate(d.getDate() + 1)) {
      const k = ymd(d), e = db.log[k];
      if (d > end) { cells.push('<i class="future"></i>'); continue; }
      const lv = !e ? 0 : e.menit >= 90 ? 3 : e.menit >= 45 ? 2 : 1;
      cells.push(`<i class="l${lv} ${k === t ? 'today' : ''}" title="${fmtDate(k)}${e ? ` · ${e.menit} menit` : ''}"></i>`);
    }
    $('#heat').innerHTML = cells.join('');
    const logs = Object.entries(db.log).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14);
    $('#log-list').innerHTML = logs.length ? logs.map(([k, e]) => `<li><span class="time">${fmtDate(k)}</span><span class="grow">${e.catatan.length ? e.catatan.map(esc).join(' · ') : '<span class="sub">Tanpa catatan</span>'}</span><span class="sub">${e.menit} mnt</span><button class="del" data-del-l="${k}" aria-label="Hapus catatan">×</button></li>`).join('') : '<li class="empty">Belum ada catatan belajar.</li>';
  }

  function render() { renderHome(); renderJadwal(); renderNilai(); renderStreak(); }

  // Forms
  $('#form-jadwal').addEventListener('submit', e => {
    e.preventDefault(); if (!isAdmin()) return toast('Hanya admin yang bisa mengubah jadwal');
    const f = new FormData(e.target);
    const j = Object.fromEntries(f); if (toMin(j.selesai) <= toMin(j.mulai)) return toast('Jam selesai harus setelah jam mulai');
    db.jadwal.push({ id: uid(), ...j, mapel: j.mapel.trim() }); save(); render();
    e.target.mapel.value = ''; e.target.ket.value = ''; toast(`${j.mapel} ditambahkan ke ${j.hari}`);
  });
  $('#form-nilai').addEventListener('submit', e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    const v = Number(f.nilai); if (isNaN(v) || v < 0 || v > 100) return toast('Nilai harus 0–100');
    db.nilai.push({ id: uid(), mapel: f.mapel.trim(), jenis: f.jenis, nilai: v, tanggal: f.tanggal }); save(); render();
    e.target.nilai.value = ''; toast('Nilai disimpan');
  });
  $('#form-nilai').tanggal.value = todayStr();
  $('#form-jadwal').hari.value = HARI[new Date().getDay()] === 'Minggu' ? 'Senin' : HARI[new Date().getDay()];
  $('#filter-mapel').addEventListener('change', renderNilai);
  $('#form-streak').addEventListener('submit', e => { e.preventDefault(); checkin(e.target.catatan.value.trim(), e.target.menit.value); e.target.catatan.value = ''; });
  $('#btn-checkin-home').addEventListener('click', () => checkin('', 30));

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-del-j],[data-del-n],[data-del-l]'); if (!t) return;
    if (t.dataset.delJ && !isAdmin()) return toast('Hanya admin yang bisa mengubah jadwal');
    if (t.dataset.delJ) db.jadwal = db.jadwal.filter(x => x.id !== t.dataset.delJ);
    if (t.dataset.delN) db.nilai = db.nilai.filter(x => x.id !== t.dataset.delN);
    if (t.dataset.delL) delete db.log[t.dataset.delL];
    save(); render(); toast('Dihapus');
  });

  // Export / import
  $('#btn-export').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
    a.download = `shii-backup-${todayStr()}.json`; a.click();
  });
  $('#file-import').addEventListener('change', async e => {
    try { const d = JSON.parse(await e.target.files[0].text()); if (!d.jadwal || !d.nilai || !d.log) throw 0; db = d; save(); render(); toast('Data diimpor'); }
    catch { toast('File tidak valid'); }
    e.target.value = '';
  });

  // ---------- Admin ----------
  const CFG = window.SHII_CONFIG || {};
  const HKEY = 'shii-admin-hash', SKEY = 'shii-admin-session';
  async function sha(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const adminHash = () => localStorage.getItem(HKEY) || CFG.ADMIN_HASH;
  function isAdmin() {
    try { const s = JSON.parse(sessionStorage.getItem(SKEY)); return !!s && s.h === adminHash() && Date.now() < s.exp; } catch { return false; }
  }
  function applyAdmin() {
    const on = isAdmin();
    document.body.classList.toggle('is-admin', on);
    const b = $('#btn-admin'); b.textContent = on ? 'Admin ✓' : 'Login admin'; b.classList.toggle('on', on);
  }
  const dl = $('#dlg-login'), da = $('#dlg-admin');
  function openLogin() { $('#login-err').textContent = ''; $('#form-login').reset(); dl.showModal(); $('#form-login').user.focus(); }
  function openPanel() {
    $('#admin-name').textContent = CFG.ADMIN_USER || 'admin';
    $('#admin-stats').innerHTML = `<div><b>${db.jadwal.length}</b>jadwal</div><div><b>${db.nilai.length}</b>nilai</div><div><b>${Object.keys(db.log).length}</b>hari belajar</div>`;
    $('#pass-out').textContent = ''; $('#reset-confirm').textContent = '';
    document.querySelectorAll('[data-reset]').forEach(x => x.classList.remove('armed'));
    da.showModal();
  }
  $('#btn-admin').addEventListener('click', () => isAdmin() ? openPanel() : openLogin());
  document.addEventListener('click', e => {
    if (e.target.closest('[data-open-login]')) openLogin();
    const c = e.target.closest('[data-close]'); if (c) c.closest('dialog').close();
  });
  [dl, da].forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  let fails = 0, lockUntil = 0;
  $('#form-login').addEventListener('submit', async e => {
    e.preventDefault();
    if (Date.now() < lockUntil) { $('#login-err').textContent = `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil((lockUntil - Date.now()) / 1000)} detik.`; return; }
    const f = e.target, h = await sha('shii-salt:' + f.pass.value);
    if (f.user.value.trim() === (CFG.ADMIN_USER || 'admin') && h === adminHash()) {
      fails = 0;
      sessionStorage.setItem(SKEY, JSON.stringify({ h, exp: Date.now() + 8 * 3600e3 }));
      dl.close(); applyAdmin(); toast('Berhasil masuk sebagai admin');
    } else {
      fails++; if (fails >= 5) { lockUntil = Date.now() + 30e3; fails = 0; }
      $('#login-err').textContent = 'Username atau password salah.';
      f.pass.value = ''; f.pass.focus();
    }
  });
  $('#btn-logout').addEventListener('click', () => { sessionStorage.removeItem(SKEY); da.close(); applyAdmin(); toast('Anda keluar dari mode admin'); });
  $('#form-pass').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    if (f.p1.value !== f.p2.value) { $('#pass-out').textContent = 'Password tidak sama.'; return; }
    const h = await sha('shii-salt:' + f.p1.value);
    localStorage.setItem(HKEY, h);
    sessionStorage.setItem(SKEY, JSON.stringify({ h, exp: Date.now() + 8 * 3600e3 }));
    f.reset();
    $('#pass-out').innerHTML = 'Password diganti di perangkat ini. Agar berlaku di semua perangkat, tempel hash ini ke <b>ADMIN_HASH</b> di config.js:<code class="hash">' + h + '</code>';
  });
  document.querySelectorAll('[data-reset]').forEach(btn => btn.addEventListener('click', () => {
    if (!isAdmin()) return;
    if (!btn.classList.contains('armed')) {
      document.querySelectorAll('[data-reset]').forEach(x => x.classList.remove('armed'));
      btn.classList.add('armed'); $('#reset-confirm').textContent = 'Klik sekali lagi untuk konfirmasi.'; return;
    }
    const k = btn.dataset.reset; db[k] = k === 'log' ? {} : []; save(); render(); da.close(); openPanel();
    toast('Data dihapus');
  }));
  applyAdmin();

  render();
  setInterval(renderHome, 60000);
})();
