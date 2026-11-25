// Konfigurasi toko Br0wNie.
// WA_NUMBER: nomor WhatsApp toko, format internasional tanpa + (mis. "6281234567890").
//            Bisa juga diatur lewat Panel admin > Toko (berlaku di perangkat itu).
// ADMIN_HASH: SHA-256 dari "shii-salt:" + password admin.
//            Hitung: printf 'shii-salt:PASSWORD_BARU' | sha256sum
window.SHII_CONFIG = {
  STORE_NAME: "Br0wNie",
  WA_NUMBER: "6285123107523",
  // Isi link kalau akun sudah dibuat, mis. "https://instagram.com/br0wnie"
  INSTAGRAM: "",
  FACEBOOK: "",
  ADMIN_USER: "admin",
  ADMIN_HASH: "d3546e19ad4c735e16e3b1b93ef812fb9750a5706fa7b8038f609db460fdea82"
};
