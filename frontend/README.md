# adopt.mart — README (serah-terima ke AI lain)

> Buat AI yang ngelanjutin project ini: baca bagian **"Cara ngomong sama user"** dulu, baru **"Status"** dan **"Lagi dibahas"**. Jangan lanjut kerja sebelum baca semuanya.
>
> Versi folder saat catatan ini ditulis: **adopt-mart-33** (zip terakhir yang dikirim ke user). **Update v36:** tahap 2 di `order.html` sekarang nampilin QR beneran dari backend `gopay-kirim` (lihat `../README.md` bagian 4). Bagian "Belum ada backend" di bawah sudah ketinggalan untuk QRIS; chat, rekber, item, login masih contoh.

## 1. Ini apa
Frontend (tampilan) web marketplace jual-beli item game, gaya itemku/starpets tapi kecil-kecilan. Penjual cuma beberapa orang yang dikenal dan dipercaya user. Tampilan dibikin dari template gratis **Fjelvik** (html.design), lalu diubah jadi marketplace.

**Murni HTML + CSS + JS biasa.** Nggak ada framework, nggak ada build step, nggak ada library. Data masih contoh (dummy).

## 2. Cara ngomong sama user (WAJIB)
User ini pemula, ngerjain dari **HP** (Termux + ZArchiver), belum punya laptop/PC.

- Jawab pakai **bahasa Indonesia santai (gue/lu)**.
- User **nggak ngerti bahasa Inggris**: tiap pakai istilah Inggris, artiin dulu ke Indonesia.
- **Edit file: ubah HANYA yang diminta**, jangan rombak bagian lain.
- Kasih **file lengkap** hasil edit (bukan potongan). Kecuali perubahan kecil banget; kalau potongan, sebut lokasinya persis (file + bagian mana).
- Kalau ada risiko data/file hilang: **berhenti dan jelasin dulu**. **Jangan nyuruh user hapus file.**
- Tugas banyak langkah (misal setting hosting/cPanel): **satu langkah per giliran**, tunggu screenshot dari user.
- Kalau permintaan kurang jelas: **tanya dulu, maksimal 1 pertanyaan**.
- **Jangan sembunyiin kekurangan.** Bilang terus terang yang belum aman / belum jalan.
- User sering ngirim screenshot HP-nya buat nunjukin masalah. Percaya screenshot itu, jangan debat.
- User minta hasil akhir dikirim **berupa zip utuh** (`adopt-mart-N.zip`, nomor naik tiap perubahan), bukan potongan kode. Ekstrak lalu jalanin server lokal seperti di bagian 3.
- Selera user: **anti mainstream, kelihatan premium** (dia bilang "biar keliatan premium wkwk"). Bukan gaya katalog toko biasa. Kalau nawarin desain, kasih opsi yang berani, bukan yang template.
- Sebelum kirim, tes dulu di browser (lebar 360/390/1280) dan cek nggak ada error JS serta halaman nggak melebar ke samping.

## 3. Cara jalanin (di HP, Termux)
```
cd adopt-mart/frontend  # masuk ke folder frontend hasil ekstrak
python -m http.server 8080
```
Lalu buka `http://localhost:8080` di browser HP. **Jangan buka `index.html` langsung dari dalam zip** (CSS dan JS-nya nggak kebaca, tampilan berantakan dan gambar item hilang).

Kalau gambar/tampilan nggak berubah setelah edit: hapus cache browser dulu.

## 4. Struktur file
```
index.html            Beranda (hero gambar penuh, kategori, item populer, cara belanja, ajakan jadi penjual)
items.html            Daftar item (cari, filter kategori, slider harga, urutan)
seller.html?s=NamaToko  Profil penjual (rating, terjual, telat kirim X/2, daftar item toko itu). Data dari window.SELLERS di data.js
item.html?id=N        Detail produk (pilih penjual, cara bayar, jumlah, total, tombol pesan)
login.html           Halaman Masuk (Google lewat Firebase Authentication). Logika di assets/js/auth.js, config di data.js (`window.FIREBASE_CONFIG`)
order.html?id=N&s=NamaToko&q=1&m=rekber|langsung   Pesanan: tahap, QRIS (contoh), chat per order (TAMPILAN CONTOH)
assets/
  css/tokens.css      Warna/font/ukuran dasar template Fjelvik (jangan diubah kecuali perlu)
  css/site.css        Header, footer, kartu, chip, toast (bawaan template)
  css/market.css      SEMUA tambahan khusus adopt.mart (lihat bagian 6)
  js/main.js          Bawaan template: menu burger, toast, form demo
  js/data.js          DATA CONTOH item + helper (fmtRp, itemArt). Nanti diganti data dari server
  js/market.js        Render beranda/daftar/detail dari data.js + filter + qty
  js/motion.js        Animasi masuk (muncul + mantul pas dibuka & di-scroll). Daftar elemen: SEL di file ini + :is(...) di blok ANIMASI market.css
  img/hero.jpg        Gambar hero desktop 16:9
  img/hero-hp.jpg     Gambar hero HP 9:16
  img/pola-biru.jpg   Latar pola biru di section "Cara belanja" (beranda)
```
Urutan script tiap halaman: `main.js` → `data.js` → `market.js` → `motion.js` (semua `defer`).

## 5. Status
### Sudah jadi
- 4 halaman: beranda, daftar item, detail item, pesanan (tampilan contoh). Responsif HP + desktop (dites di lebar 360/390/412/740/768/980/1024/1280/1366/1920).
- Filter daftar item: cari nama, kategori (pet/item/akun/lainnya), harga maksimal, urutan (terlaris/termurah/termahal/terbaru). Bisa dari link `items.html?cat=pet&q=neon`.
- Hero full layar kiri-kanan. Pilih gambar otomatis: layar lebar (landscape) → `hero.jpg`, layar tegak (HP/portrait) → `hero-hp.jpg`.
- Tema warna pink + biru langit (disesuaikan dengan gambar hero).
- Daftar item gaya katalog Shopee: HP 2 kolom, tablet 3, desktop 4. Kartu: gambar kotak, nama (maks 2 baris), stok tepat di bawah nama, harga pink tebal, nama penjual, lalu "Rating toko X.X" + jumlah terjual. **Tanpa ikon bintang.** Blok CSS-nya `KATALOG ALA SHOPEE` (paling bawah `market.css`).
- Rating toko diambil dari `window.SELLERS` di `data.js` (angka contoh). Dipakai di kartu dan daftar penjual di halaman detail.
- **Satu produk, banyak penjual** (pilihan user, backend menyusul). `data.js`: `ITEMS` = produk (`id, name, cat, hue, desc`) dan tiap produk punya `offers: [{ seller, price, stock, sold }]`. Helper `window.prodInfo(p)` hitung harga termurah, total terjual, total stok. Kartu katalog: kalau >1 penjual tampil "mulai Rp X" + "N penjual"; kalau 1 penjual tampil "oleh X" + rating toko. Halaman detail: daftar "Pilih penjual" (urut termurah), harga/stok/total ikut penjual yang dipilih. Tiga produk contoh punya 2 penjual: id 2, 4, 10. Field `rating` per item sudah dibuang.
- Label kecil "Semua item" di atas judul halaman daftar item sudah dihapus (permintaan user).
- **Rekber (middle man) + chat per order — hanya TAMPILAN CONTOH** (keputusan user, backend menyusul). Detail produk punya pilihan **Cara bayar**: Rekber (disarankan, uang ditahan admin) atau Langsung ke penjual. Tombol "Pesan & ngobrol dulu" membuka `order.html`. Alur 5 tahap: 1 Ngobrol dengan penjual (belum bayar) → 2 Bayar (QRIS rekber/penjual, nominal terkunci, muncul SETELAH penjual konfirmasi item ada) → 3 Penjual kirim item + bukti (**maks 30 menit setelah bayar**) → 4 Pembeli konfirmasi diterima (maks 1 hari, auto-selesai) → 5 Selesai (rekber: admin cairkan dana ke penjual). Alasan ngobrol dulu di tahap 1: pembeli perlu nego/tanya sebelum bayar, dan ini sekaligus mencegah penjual jual item yang belum dia punya. Chat = satu ruang per order (pembeli, penjual, admin), jadi bisa jadi bukti sengketa. Di halaman pesanan ada kotak **Mode demo** (ganti tahap & cara bayar) yang HARUS dihapus saat backend jadi. Pesan yang diketik di chat cuma tersimpan di memori halaman (hilang kalau di-refresh).
- Tombol **WhatsApp admin** (detail produk & pesanan). Nomor/link diisi di `data.js` bagian `window.CONTACT` (`waAdmin` format 628xxx, atau `waGroup`). **Sekarang kosong**, jadi tombolnya cuma nampilin pesan "belum diisi".
- Header sudah dikecilin (tinggi ±62px desktop, ±56px HP).
- Urutan beranda: hero (1 layar penuh) → "Mau cari apa?" (4 kategori) → "Item populer" (6 item terlaris, otomatis dari `data.js`) → "Tiga langkah doang" (latar pola biru) → banner "Punya item buat dijual?". Elemen lama `.mhero__pic` masih ada di `index.html` tapi selalu disembunyiin (nggak dipakai).
- **Gaya stiker** (permintaan user, "anti mainstream"): garis ungu tua 2,5px + bayangan keras di semua kartu (kategori, item, langkah belanja, detail, pesanan, chat). Kategori beranda = 4 kartu warna-warni dengan ikon SVG, kartu item & langkah miring tipis, ketuk = kepencet. Label kecil "Kategori"/"Paling laku" dihapus. Semua gaya kartu ada di blok `GAYA STIKER` (paling bawah `market.css`).
- **Animasi masuk**: elemen (kartu, judul section, kotak hero, dll) muncul sambil mantul begitu kelihatan di layar (IntersectionObserver), pakai properti `translate`/`scale` supaya nggak bentrok sama miring & efek kepencet. Mati otomatis kalau pengguna pilih "kurangi gerakan"; kalau `motion.js` gagal dimuat, elemen tetap tampil setelah 3 detik (script kecil di `<head>` tiap halaman). Urutan script tiap halaman sekarang: `main.js` → `data.js` → `market.js` → `motion.js`.
- Bug yang sudah diperbaiki: di `market.js`, penanda urutan kartu bernama `data-order` bentrok dengan penampung halaman pesanan (`[data-order]`), jadi isi pesanan nyasar ke kartu pertama di `items.html`. Penanda urutan diganti nama jadi `data-pos`. Jangan pakai nama atribut `data-order` untuk hal lain.

- **Aturan dari obrolan user + Yikaz (3/11)**: (1) kirim item maks **30 menit** setelah bayar; telat = peringatan, **2x pelanggaran = blacklist jualan** (tampilan contoh: "telat kirim X/2" di daftar penjual, `late` di `window.SELLERS`, `MAX_LATE` di `data.js`). (2) **High tier = total bayar mulai Rp100.000** (`window.HIGH_TIER` di `data.js`, helper `window.isHigh`): muncul kotak kuning "disarankan rekber admin" (class `.hialert`) dan Cara bayar otomatis ke Rekber; di bawah itu default **Langsung ke penjual** (user masih bisa ganti manual). (3) Admin maks 3 orang, khusus nangani rekber high tier. (4) QRIS tetap per penjual karena QRIS statis resmi butuh KTP + NPWP. Grup WhatsApp (umum + JB/trade anggota) diurus di luar web, link ke `CONTACT.waGroup`.

### Belum jalan / masih contoh (jujur)
- **Rekber, tahap pesanan, QRIS, dan chat per order cuma tampilan.** Belum ada order sungguhan, uang, status, atau penyimpanan pesan. Chat sungguhan butuh backend + login + database pesan (polling dulu, WebSocket belum tentu didukung hosting). Biaya rekber belum ditentukan user.
- **Tombol Beli, Chat penjual, Masuk, Jual item** cuma nampilin pesan "belum dibuat" (`data-soon` di HTML + handler di `market.js`).
- **Data 12 item itu palsu** (`data.js`). Gambar kartu item = placeholder gradasi + inisial huruf (dibikin JS), belum foto asli.
- **Belum ada backend sama sekali di folder ini.** Backend lama user (Node.js: login, admin, upload item, order, QRIS per penjual) **sudah terhapus**, harus dibikin ulang dan disambungin.
- Font dari Google Fonts (butuh internet).
- Footer: kontak masih tulisan "Isi kontak lu di sini".
- Halaman login, daftar, penjual, order, sengketa belum ada.
- Gambar hero (desktop `hero.jpg` dan HP `hero-hp.jpg`) adalah **gambar resmi dari game Adopt Me! lengkap dengan logonya**. `hero-hp.jpg` sudah diganti user ke versi baru, tapi masih ada logo Adopt Me!. Bisa dianggap berhubungan resmi dan pemilik game bisa minta dicopot. **Saran: ganti pakai gambar buatan sendiri sebelum web dipublikasi.** User sudah dikasih tau.

## 6. Hal teknis yang gampang bikin salah
- `market.css` urutannya: komponen umum → tema warna → header (`--hh`) → **HERO BERANDA** (satu blok bersih, sudah digabung; ubah di situ, jangan nambah timpaan) → katalog → penjual/rekber/chat → **GAYA STIKER (semua kartu)** → menu HP. Blok yang paling bawah menang kalau selektornya sama kuat.
- Tinggi hero = tinggi layar dikurangi tinggi header, lewat variabel `--hh` (63px desktop, 56px HP). Kalau header diubah ukurannya, **ukur ulang dan update `--hh`**, kalau nggak hero nggak pas 1 layar.
- Ganti warna tema: blok `TEMA PINK + BIRU LANGIT` (variabel `--pink`, `--pink-deep`, `--glacier`, dll).
- Posisi kotak cari: desktop kanan-bawah, HP agak naik dari dasar. Baris "Bayar QRIS penjual..." (`.mtrust`) disembunyikan di HP. Atap logo di gambar 16:9 gampang ketutup kalau kotaknya terlalu tinggi.
- **Menu burger HP**: header pakai `backdrop-filter` (blur). Efek sampingnya, elemen `position: fixed` di dalam header (menu `.nav`) ikut ukuran header, bukan layar. Makanya blok `MENU HP (burger)` di paling bawah `market.css` mematikan blur saat `.menu-open`. Jangan dihapus. Menu sekarang berbentuk kartu kecil di bawah header (bukan layar penuh), posisinya pakai `--hh`.
- Gambar item (`itemArt` di `data.js`) dibikin JS. Kalau JS nggak jalan, gambar kartu hilang.
- Tablet / layar tegak yang lebar: gambar 9:16 kepotong atas-bawah. Belum dirapihin.

## 7. Keputusan sistem dari user (buat backend nanti)
- Pakai **Node.js** (bukan Laravel/PHP). Mulai dari HTML dulu, dibangun lokal, baru di-upload ke hosting/VPS setelah matang. Hosting baru belum diputuskan.
- **Bayar langsung per order lewat QRIS**. Koin web ditunda.
- **Tiap penjual pakai QRIS sendiri**: uang langsung ke penjual, web nggak pegang uang. Penjual cuma yang user kenal dan percaya. Kalau penjual nggak bayar biaya, user yang putuskan, penjual dicabut.
- Penjual kirim item maks **30 menit** setelah bayar. Konfirmasi pembeli batas **1 hari**, auto-selesai kalau lewat.
- Konfirmasi lunas/topup **manual lewat panel admin** dulu. Payment gateway (Duitku/iPaymu) dan notif otomatis ditunda. User belum punya NPWP.
- Alur target: pembeli pilih item → scan QRIS penjual (nominal terkunci) → penjual kirim item + bukti → pembeli konfirmasi diterima → selesai. Ada jalur sengketa.
- Nama project: **adopt.mart**. Domain belum pasti (kemungkinan dakzz.web.id, belum dikonfirmasi). Hosting/panel yang user punya sekarang itu buat web lain (dakzz.store), bukan buat ini.

## 7b. Login Google (Firebase) — cara nyambungin
Gratis (paket Spark). Satu langkah per giliran sama user, tunggu screenshot:
1. console.firebase.google.com > Add project (nama bebas, Analytics boleh dimatiin).
2. Build > Authentication > Get started > tab Sign-in method > Google > Enable, isi email dukungan, Save.
3. Authentication > Settings > Authorized domains: tambah domain web (mis. `adoptmes.netlify.app`). `localhost` sudah ada.
4. Project settings (ikon roda gigi) > Your apps > ikon web `</>` > daftarin app > salin `firebaseConfig`.
5. Tempel ke `window.FIREBASE_CONFIG` di `assets/js/data.js` (cuma isi apiKey, authDomain, projectId, appId). Kode ini memang publik, itu normal buat Firebase.
6. Tes di `login.html`. Nanti backend Node wajib cek ID token (Firebase Admin SDK) sebelum percaya user; login di sisi tampilan doang belum aman buat order/uang.

## 8. Lagi dibahas (belum diputuskan user)
**Sistem keranjang.** User mau nambahin keranjang. Dia sempat nanya apakah "Item populer" di beranda masih perlu; jawaban yang dikasih: **tetap diadain** (itu etalase beranda; keranjang beda fungsi dan nanti nyambung lewat tombol "+ Keranjang" di kartu item).

Masalah yang harus diputuskan dulu: sistem ini **QRIS per penjual, chat per order, konfirmasi diterima per order**. Kalau pembeli masukin item dari 2 penjual berbeda, keranjang nggak bisa dibayar sekali jalan. Usulan yang sudah ditawarkan (user belum jawab): **keranjang dikelompokin per penjual**, tiap kelompok punya tombol "Pesan" sendiri, jadi 1 kelompok = 1 order = 1 QRIS = 1 chat. Alternatifnya: tanpa keranjang, tetap beli satu-satu.

Pertanyaan terbuka buat user (tanya **satu** dulu): mau keranjang dikelompokin per penjual, atau tetap beli satu-satu? Kalau setuju yang pertama, mulai dari **tampilan contoh dulu** (belum ada backend), data keranjang cukup di memori halaman / `localStorage`. Hal yang perlu dipikirin sekalian: stok per penawaran (jangan lewat batas), cara bayar (rekber/langsung) dipilih per kelompok, dan ikon keranjang + jumlah di header.

## 9. Langkah berikutnya (usulan, tanya user dulu mau yang mana)
1. Bikin backend Node.js minimal: daftar/login, daftar item dari database, `data.js` diganti `fetch('/api/items')`.
2. Halaman penjual: upload item, simpan QRIS sendiri.
3. Order + QRIS per penjual (nominal terkunci), tombol "Tandai lunas" manual di admin.
4. Kirim bukti, konfirmasi diterima, sengketa, auto-selesai 1 hari.
5. Ganti gambar hero (punya sendiri) dan foto asli per item.
6. ~~Rapihin `market.css` (gabungin timpaan hero)~~ — SUDAH, hero sekarang satu blok.
7. Aturan "terjual" & stok (USULAN, belum diputuskan user): web nggak pegang uang, jadi `sold` naik saat order berstatus **selesai** (pembeli klik konfirmasi diterima, atau auto-selesai 1 hari). Stok per penawaran dikurangi saat order dibuat (ditahan), dikembalikan kalau order dibatalkan/kedaluwarsa. Rating toko dari nilai pembeli setelah order selesai. Semua dihitung di backend dari tabel order, bukan diketik manual.

## 10. Riwayat singkat (sesi terakhir)
- adopt-mart-32/33: **tab bawah di HP** (≤760px): Beranda · Chat · Transaksi · Akun, ikon SVG. Dibikin otomatis oleh `market.js` (bagian "Tab bawah", daftar `TABS`), gayanya di blok `TAB BAWAH` paling bawah `market.css`. Tab biasa timbul, tab halaman yang lagi dibuka "nonjok" (pink, masuk ke dalam); pindah halaman = balik ke semula dan tab halaman baru yang nonjok. Chat & Transaksi belum ada halamannya (cuma pesan "belum dibuat", `data-soon`). Di **beranda**, tab disembunyiin selagi di bagian hero (paling atas, scroll < 40px) dan muncul geser dari bawah begitu di-scroll (kelas `is-away`); halaman lain tab selalu ada. Footer dan toast sudah disesuaikan tinggi bar (`--tb`). Tab bawah itu `position: fixed`, jadi aman buat aturan "jangan nambah elemen di bawah body".
- adopt-mart-31: `body` dibikin flex kolom + `main` melar, supaya footer nempel di dasar layar walau isi halaman pendek (sebelumnya footer "ngambang" di tengah dengan latar kosong di bawahnya). Jangan nambah elemen langsung di bawah `body` selain header, main, footer.
- adopt-mart-30: footer diringkas di HP (≤640px): tulisan raksasa "adopt.mart" disembunyiin, tinggi ±390px. Desktop tetap.
- adopt-mart-29: login.html sekarang ada tab **Masuk / Daftar** (email + password) + Google. Pesan salah per kasus (kolom kosong, format email, password < 6, password beda, email sudah terdaftar, "Email atau password salah"). **MODE CONTOH**: akun manual disimpan di `localStorage` (`am-users`, password di-hash PBKDF2 + salt) dan sesi di `am-session` supaya nggak login terus; header nampilin nama depan user. Ini cuma di browser itu, nggak aman buat uang/order. Saat backend Node jadi: ganti bagian "akun manual" di `auth.js` dengan fetch ke server (hash password di server, pakai cookie httpOnly), hapus `am-users`.
- adopt-mart-28: halaman `login.html` + `auth.js` (tombol Masuk dengan Google, tampilan "udah masuk" + Keluar). Tombol "Masuk" di header semua halaman sekarang ke `login.html`. **Belum disambungin**: `FIREBASE_CONFIG` masih kosong, jadi tombol cuma nampilin catatan. Kode Firebase (SDK 10.12.2 dari gstatic) BELUM dites karena belum ada proyek Firebase. Header belum nampilin nama user yang login, dan belum ada backend yang cek token.
- adopt-mart-27: garis pinggir kartu pakai `--edge` (ungu tua di terang, ungu redup `#5B4580` di gelap), bukan `--pine` lagi, supaya tema gelap nggak penuh garis putih. Toast di tema gelap juga digelapin. Jangan pakai `var(--pine)` buat border kartu.
- adopt-mart-26: default tema terang + bayangan kartu di tema gelap jadi gelap (`--sh`).
- adopt-mart-25: **tema terang & gelap**. Tombol bulan/matahari di header (`[data-theme-toggle]`), pilihan disimpan di `localStorage` kunci `am-theme`; default **terang** (nggak ikut pengaturan HP, permintaan user). Bayangan keras kartu pakai `--sh` (ungu tua di terang, hampir hitam di gelap), jangan dibalik jadi putih. Script kecil di `<head>` tiap halaman pasang `data-theme="dark"` di `<html>` sebelum tampil (anti kedip). Warna gelap ada di blok `TEMA TERANG / GELAP` (paling bawah `market.css`, selektor `html[data-theme="dark"]`). Aturan penting: `--pine` itu warna TEKS/garis (terang di tema gelap), jadi teks di atas latar `--pine` pakai `--on-pine`, bukan `--snow`. Jangan nulis `background: #fff` untuk kartu, pakai `var(--paper)`. Hero & item tetap sama di dua tema.
- adopt-mart-24: halaman profil penjual `seller.html` + saran pas ngetik di kotak cari `items.html` (item & penjual yang salah satu katanya diawali huruf yang diketik, bisa panah atas/bawah + Enter, Esc nutup). Detail item punya link "Lihat profil toko". Kartu item di profil nampilin harga penjual itu, bukan harga termurah. Catatan: nama penjual harus ada di `window.SELLERS`, kalau nggak ada halaman profil bilang "Penjual nggak ketemu".
- adopt-mart-23: kotak cari di daftar item sekarang juga cari nama penjual (`data-name` di kartu = nama item + semua penjualnya).
- adopt-mart-22: batas kirim 30 menit + hitung pelanggaran (contoh), alert high tier Rp100.000+, default cara bayar ikut high tier.
- Blok hero di `market.css` yang numpuk 8 lapis digabung jadi satu blok bersih (dites: tampilan persis sama di 11 ukuran layar).
- Bug `data-order` bentrok diperbaiki (jadi `data-pos`), lihat bagian 5.
- Latar pola biru dipasang di "Cara belanja" (gambar 1,4 MB dikecilin jadi 60 KB).
- Menu burger HP diganti dari layar penuh jadi kartu kecil di bawah header.
- Kategori beranda + semua kartu dijadiin gaya stiker. Label kecil "Kategori" dan "Paling laku" dihapus.
- Animasi masuk (muncul + mantul, per elemen saat kelihatan di layar) ditambah lewat `motion.js`.

## 11. Kredit
Template dasar: Fjelvik, html.design (gratis, boleh dipakai komersial). Font: SUSE, Golos Text, Ubuntu Sans Mono (Google Fonts).
