// Konfigurasi admin Shii.
// ADMIN_HASH = SHA-256 dari "shii-salt:" + password. Untuk mengganti password,
// login sebagai admin lalu pakai menu "Ganti password" (akan menampilkan hash baru
// yang bisa ditempel di sini), atau hitung sendiri: printf 'shii-salt:PASSWORD' | sha256sum
window.SHII_CONFIG = {
  ADMIN_USER: "admin",
  ADMIN_HASH: "da3a4914b634ab18f4e01caafc3d8b9425e7b393f42b6c0c088e94f674f5a743"
};
