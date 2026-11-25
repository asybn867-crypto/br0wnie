# Br0wNie

Website toko brownies **Br0wNie**: menu satuan, hampers, keranjang belanja, pesan otomatis lewat WhatsApp, dan **login admin** untuk mengelola toko.

## Fitur
- Menu brownies dengan filter kategori (Klasik, Topping, Spesial) dan label Terlaris/Habis.
- Box & hampers (isi 4, 9, 16).
- Keranjang: atur jumlah, pilih diantar/ambil sendiri, tanggal, catatan. Tombol "Kirim pesanan ke WhatsApp" menyusun pesan pesanan otomatis.
- Panel admin: tambah/edit/hapus produk (termasuk upload foto), tandai stok habis, atur nomor WhatsApp, jam buka, teks berjalan, ekspor/impor data, ganti password.

## Pengaturan
Edit `config.js`:
- `WA_NUMBER`: nomor WhatsApp toko, format `628xxxxxxxxxx`.
- `ADMIN_HASH`: hash password admin. Hitung: `printf 'shii-salt:PASSWORD_BARU' | sha256sum`.

## Catatan teknis
Situs statis untuk GitHub Pages. Perubahan dari panel admin disimpan di browser perangkat admin (localStorage). Agar menu baru tampil untuk semua pengunjung, ekspor data dari panel admin lalu ubah daftar `defaults()` di `app.js`, atau hubungkan ke database online.
Login admin bersifat sisi-klien, cocok untuk membatasi pengeditan biasa, bukan keamanan tingkat server.
