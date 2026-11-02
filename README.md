# Shii

Web kelas sederhana: **jadwal pelajaran**, **daftar nilai** yang diinput pengguna, dan **streak belajar** harian, plus **login admin**.

- Jadwal pelajaran per hari (Senin–Sabtu), menandai pelajaran yang sedang berlangsung. Hanya admin yang bisa menambah/menghapus jadwal.
- Daftar nilai: input mapel, jenis (tugas, kuis, UTS, UAS, dll.), nilai 0–100, dan tanggal; rata-rata per mapel otomatis.
- Streak belajar: catat belajar tiap hari, streak saat ini & terpanjang, heatmap 16 minggu.
- Panel admin: ganti password, hapus semua nilai, reset streak, kosongkan jadwal.
- Ekspor/impor data (JSON).

## Catatan teknis
Situs statis (HTML/CSS/JS murni) untuk GitHub Pages. Data tersimpan di `localStorage` browser masing-masing.
Login admin bersifat sisi-klien (password disimpan sebagai hash SHA-256 di `config.js`) — cocok untuk membatasi pengeditan biasa, tetapi bukan keamanan tingkat server.

Mengganti password untuk semua perangkat: hitung `printf 'shii-salt:PASSWORD_BARU' | sha256sum` lalu ganti `ADMIN_HASH` di `config.js`.
