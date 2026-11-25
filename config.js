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
  ADMIN_USER: "Syaban",
  ADMIN_HASH: "6bb0c6da716adb37e56740712ce672026073e835dc186e900d8abb66994ac714"
};
