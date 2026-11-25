(() => {
  const form = document.querySelector('#form-order');
  const address = form?.elements.namedItem('alamat');
  if (!form || !address) return;

  const wrap = document.createElement('div');
  wrap.className = 'location-tools';
  wrap.innerHTML = '<button type="button" class="btn ghost sm" id="btn-use-location">📍 Gunakan Lokasi Saya</button><p id="location-status" class="location-status" role="status" aria-live="polite">Izinkan akses lokasi untuk mengisi alamat otomatis, atau ketik alamat secara manual.</p>';
  address.insertAdjacentElement('afterend', wrap);

  const style = document.createElement('style');
  style.textContent = '.location-tools{display:grid;gap:.35rem}.location-tools button{width:100%}.location-status{font-size:var(--text-xs);color:var(--muted);line-height:1.4;margin:0}.location-tools button:disabled{opacity:.6;cursor:wait}';
  document.head.appendChild(style);

  const button = document.querySelector('#btn-use-location');
  const status = document.querySelector('#location-status');
  const setStatus = message => { status.textContent = message; };

  button.addEventListener('click', () => {
    if (!navigator.geolocation) {
      setStatus('Browser ini tidak mendukung GPS. Silakan isi alamat secara manual.');
      return;
    }
    button.disabled = true;
    setStatus('Meminta izin lokasi dari browser…');
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        setStatus('Lokasi ditemukan. Mengubah koordinat menjadi alamat…');
        const { latitude, longitude } = position.coords;
        const url = new URL('https://nominatim.openstreetmap.org/reverse');
        url.search = new URLSearchParams({
          format: 'jsonv2',
          lat: String(latitude),
          lon: String(longitude),
          zoom: '18',
          addressdetails: '1'
        }).toString();
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('geocoding');
        const result = await response.json();
        const readableAddress = result.display_name;
        if (!readableAddress) throw new Error('no-address');
        address.value = readableAddress;
        address.dispatchEvent(new Event('input', { bubbles: true }));
        address.dispatchEvent(new Event('change', { bubbles: true }));
        setStatus('Alamat berhasil diisi. Periksa kembali sebelum mengirim pesanan.');
      } catch {
        setStatus('Alamat otomatis gagal ditemukan. Silakan ketik alamat secara manual.');
      } finally {
        button.disabled = false;
      }
    }, error => {
      const message = error.code === 1
        ? 'Izin lokasi ditolak. Aktifkan izin lokasi atau isi alamat secara manual.'
        : error.code === 2
          ? 'Lokasi tidak tersedia. Coba lagi atau isi alamat secara manual.'
          : 'Permintaan lokasi terlalu lama. Coba lagi atau isi alamat secara manual.';
      setStatus(message);
      button.disabled = false;
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  });
})();