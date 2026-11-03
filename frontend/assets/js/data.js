/* ==========================================================================
   adopt.mart — DATA CONTOH (dummy)
   Nanti file ini diganti: data diambil dari server Node.js (fetch ke /api/items).
   Satu PRODUK = satu blok { ... }. Penjual + harga + stok + terjual ada di "offers" (penawaran per penjual).
   Satu produk boleh punya banyak penawaran. Harga dalam rupiah (angka polos, tanpa titik).
   cat: "pet" | "item" | "akun" | "lainnya"
   hue: angka 0-360, cuma buat warna gambar placeholder (sebelum ada foto asli)
   ========================================================================== */
window.CATS = [
  { id: "pet",     name: "Pet",     desc: "Hewan & karakter" },
  { id: "item",    name: "Item",    desc: "Barang & aksesori" },
  { id: "akun",    name: "Akun",    desc: "Akun siap pakai" },
  { id: "lainnya", name: "Lainnya", desc: "Mata uang & misc" },
];

window.ITEMS = [
  { id: 1, name: "Pet Legendary — Naga Api", cat: "pet", hue: 12, desc: "Pet legendary kondisi full grown. Trade instan lewat private server. Garansi item sampai pembeli konfirmasi diterima.",
    offers: [ { seller: "Rafi Store", price: 185000, stock: 3, sold: 212 } ] },
  { id: 2, name: "Pet Neon — Kucing Bulan", cat: "pet", hue: 265, desc: "Pet neon tampilan bersinar. Stok terbatas, proses maksimal 1 jam setelah pembayaran dikonfirmasi.",
    offers: [ { seller: "Rafi Store", price: 92000, stock: 7, sold: 148 }, { seller: "Nadia Shop", price: 89000, stock: 2, sold: 61 } ] },
  { id: 3, name: "Pet Mega — Rubah Salju", cat: "pet", hue: 195, desc: "Pet mega langka, cuma ada satu. Kirim bukti trade setelah selesai.",
    offers: [ { seller: "Nadia Shop", price: 420000, stock: 1, sold: 36 } ] },
  { id: 4, name: "Paket 5 Pet Murah", cat: "pet", hue: 140, desc: "Paket 5 pet acak, cocok buat pemula. Rarity common sampai rare.",
    offers: [ { seller: "Nadia Shop", price: 35000, stock: 20, sold: 530 }, { seller: "Rafi Store", price: 37000, stock: 8, sold: 95 } ] },
  { id: 5, name: "Sayap Cahaya (Aksesori)", cat: "item", hue: 48, desc: "Aksesori sayap efek cahaya. Bisa dipakai semua karakter.",
    offers: [ { seller: "Dimas Item", price: 54000, stock: 12, sold: 97 } ] },
  { id: 6, name: "Kendaraan Skuter Neon", cat: "item", hue: 320, desc: "Kendaraan skuter dengan lampu neon. Kondisi baru, belum pernah dipakai.",
    offers: [ { seller: "Dimas Item", price: 78000, stock: 5, sold: 64 } ] },
  { id: 7, name: "Set Dekorasi Rumah Mini", cat: "item", hue: 90, desc: "Satu set dekorasi 10 item untuk rumah. Dikirim berurutan.",
    offers: [ { seller: "Rafi Store", price: 26000, stock: 30, sold: 301 } ] },
  { id: 8, name: "Akun Level 40 + 12 Pet", cat: "akun", hue: 225, desc: "Akun siap pakai, data login dikirim lewat chat setelah lunas. Email bisa diganti sendiri.",
    offers: [ { seller: "Nadia Shop", price: 650000, stock: 1, sold: 11 } ] },
  { id: 9, name: "Akun Starter Siap Main", cat: "akun", hue: 170, desc: "Akun baru dengan beberapa pet dasar. Cocok buat mulai dari nol.",
    offers: [ { seller: "Dimas Item", price: 120000, stock: 4, sold: 40 } ] },
  { id: 10, name: "Voucher Top Up 50 Gem", cat: "lainnya", hue: 30, desc: "Gem dikirim lewat trade. Harga paling murah di toko ini.",
    offers: [ { seller: "Rafi Store", price: 15000, stock: 99, sold: 880 }, { seller: "Dimas Item", price: 16500, stock: 40, sold: 210 } ] },
  { id: 11, name: "Voucher Top Up 500 Gem", cat: "lainnya", hue: 5, desc: "500 gem, proses cepat. Kirim ID in-game saat order.",
    offers: [ { seller: "Rafi Store", price: 135000, stock: 25, sold: 322 } ] },
  { id: 12, name: "Boost Level (Joki 1 Hari)", cat: "lainnya", hue: 280, desc: "Naikin level akun lu dalam 1 hari. Data akun dijaga, tanpa ubah password.",
    offers: [ { seller: "Dimas Item", price: 70000, stock: 6, sold: 58 } ] },
];

/* Kontak WhatsApp admin. ISI SENDIRI:
   waAdmin = nomor format 628xxxxxxxxxx (tanpa +, tanpa spasi). waGroup = link grup (https://chat.whatsapp.com/...).
   Kalau dua-duanya kosong, tombol WhatsApp cuma nampilin pesan "belum diisi". */
window.CONTACT = { waAdmin: "", waGroup: "" };
/* alamat backend pembayaran (gopay-kirim). Lokal: port 3000. Kalau nanti di-hosting, ganti ke alamat server. */
window.API_BASE = "http://localhost:3000";

/* Login Google lewat Firebase Authentication. ISI SENDIRI setelah bikin proyek Firebase:
   Project settings > Your apps > Web app > "firebaseConfig". Contoh bentuknya:
   { apiKey: "...", authDomain: "xxx.firebaseapp.com", projectId: "xxx", appId: "..." }
   Kalau kosong ({}), halaman login cuma nampilin catatan "belum disambungin". */
window.FIREBASE_CONFIG = {};

/* Rating TOKO (contoh/dummy). Nanti dari server: rata-rata nilai pembeli per penjual. */
window.SELLERS = {
  "Rafi Store": { rating: 4.8, late: 0, bio: "Spesialis pet legendary, dekorasi, dan voucher gem. Biasanya online malam hari." },
  "Nadia Shop": { rating: 4.8, late: 1, bio: "Pet langka, paket pemula, dan akun siap main." },
  "Dimas Item": { rating: 4.6, late: 0, bio: "Aksesori, kendaraan, akun starter, dan joki level." },
};
/* late = jumlah pelanggaran telat kirim (contoh). Aturan: kirim maks 30 menit setelah bayar,
   telat = peringatan, 2x pelanggaran = blacklist jualan. Nanti dihitung di backend. */
window.MAX_LATE = 2;

/* High tier: total bayar mulai angka ini disarankan pakai rekber admin */
window.HIGH_TIER = 100000;
window.isHigh = (total) => total >= window.HIGH_TIER;

/* Ringkasan produk dari semua penawaran penjual: harga termurah, total terjual, total stok */
window.prodInfo = (p) => {
  const offers = p.offers.slice().sort((a, b) => a.price - b.price);
  return {
    offers,
    minPrice: offers[0].price,
    sold: offers.reduce((n, o) => n + o.sold, 0),
    stock: offers.reduce((n, o) => n + o.stock, 0),
  };
};

window.fmtRp = (n) => "Rp" + Number(n).toLocaleString("id-ID");

/* Gambar placeholder (gradasi + inisial) sampai foto asli dipasang */
window.itemArt = (it) => {
  const h = it.hue, h2 = (h + 40) % 360;
  const ini = it.name.split("—").pop().replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${it.name}">
    <defs><linearGradient id="g${it.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h} 70% 62%)"/><stop offset="1" stop-color="hsl(${h2} 65% 38%)"/>
    </linearGradient></defs>
    <rect width="400" height="300" fill="url(#g${it.id})"/>
    <circle cx="320" cy="60" r="90" fill="rgba(255,255,255,.12)"/>
    <circle cx="60" cy="270" r="110" fill="rgba(0,0,0,.12)"/>
    <text x="200" y="175" text-anchor="middle" font-family="SUSE, system-ui, sans-serif" font-size="96" font-weight="600" fill="rgba(255,255,255,.92)">${ini}</text>
  </svg>`;
};
