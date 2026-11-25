# Br0wNie

Website toko brownies **Br0wNie**: menu satuan, hampers, keranjang belanja, pesan otomatis lewat WhatsApp, dan **login admin** untuk mengelola toko.

## Fitur
- Menu brownies dengan filter kategori (Klasik, Topping, Spesial) dan label Terlaris/Habis.
- Box & hampers (isi 4, 9, 16).
- Keranjang dengan dua pilihan:
  - **Diantar**: pesanan otomatis tersusun dan dikirim ke WhatsApp toko.
  - **Datang ke toko**: pembeli mendapat alamat outlet + kode pesanan (mis. `BRW-2511-KZAC`), lalu memilih **QRIS** (QR dengan nominal otomatis) atau **Tunai** (tunjukkan kode/QR ke kasir). Tiket bisa disimpan sebagai gambar.
- Panel admin: tambah/edit/hapus produk (termasuk upload foto), tandai stok habis, nomor WhatsApp, link Instagram/Facebook, outlet, upload QRIS, jam buka, teks berjalan, ekspor/impor data, ganti password.

## Pengaturan
Edit `config.js`:
- `WA_NUMBER`: nomor WhatsApp toko, format `628xxxxxxxxxx`.
- `INSTAGRAM`, `FACEBOOK`: link akun sosial media (kosong = tampil "segera").
- `ADMIN_HASH`: hash password admin. Hitung: `printf 'shii-salt:PASSWORD_BARU' | sha256sum`.

## Catatan teknis
Situs statis untuk GitHub Pages. Perubahan dari panel admin disimpan di browser perangkat admin (localStorage). Agar menu baru tampil untuk semua pengunjung, ekspor data dari panel admin lalu ubah daftar `defaults()` di `app.js`, atau hubungkan ke database online.
Login admin bersifat sisi-klien, cocok untuk membatasi pengeditan biasa, bukan keamanan tingkat server.
