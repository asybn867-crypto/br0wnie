// Konfigurasi toko Br0wNie.
// WA_NUMBER: nomor WhatsApp toko, format internasional tanpa + (mis. "6281234567890").
//            Bisa juga diatur lewat Panel admin > Toko (berlaku di perangkat itu).
// ADMIN_HASH: SHA-256 dari "shii-salt:" + password admin.
//            Hitung: printf 'shii-salt:PASSWORD_BARU' | sha256sum
window.SHII_CONFIG = {
  STORE_NAME: "Br0wNie",
  WA_NUMBER: "",
  ADMIN_USER: "admin",
  ADMIN_HASH: "da3a4914b634ab18f4e01caafc3d8b9425e7b393f42b6c0c088e94f674f5a743"
};
