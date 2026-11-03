# adopt.mart — README SERAH-TERIMA (untuk AI yang ngelanjutin)

> Baca bagian **1 (Cara ngomong sama user)** dan **4 (Status sekarang)** dulu. Jangan kerja sebelum baca semuanya.
> Versi paket: **adopt-mart-36**.

## 1. Cara ngomong sama user (WAJIB)
User pemula, kerja **cuma dari HP Android** (Termux + ZArchiver), **nggak punya PC**.
- Bahasa Indonesia santai (gue/lu). Istilah Inggris diartiin dulu.
- **Satu langkah per giliran.** User kerjain, kirim screenshot, lu cek, baru lanjut. Jangan 20 langkah sekaligus.
- Baca screenshot dengan teliti. Jangan ngarang menu yang nggak ada.
- Edit file: ubah **hanya yang diminta**. Kasih file lengkap / zip utuh (`adopt-mart-N.zip`, nomor naik tiap perubahan).
- Kalau ada risiko file/data hilang: **berhenti dan jelasin dulu**. **Jangan nyuruh hapus file.**
- Kalau instruksi sebelumnya kurang tepat: jelasin masalahnya dulu, kasih konfigurasi lebih aman, jangan diubah diam-diam.
- Jangan sembunyiin kekurangan. Bilang terus terang yang belum aman / belum jalan.
- Kalau permintaan nggak jelas: tanya dulu, maksimal 1 pertanyaan.
- **Jangan pernah nyaranin pindah ke Midtrans/Xendit/dll.** User sengaja bikin gateway sendiri. Tapi celah keamanan tetap harus disebut jujur.
- Selera: anti mainstream, kelihatan premium.

## 2. Isi paket
```
adopt-mart/
  README.md        file ini
  jalan.sh         nyalain semuanya sekaligus (lihat bagian 3)
  frontend/        tampilan web (HTML/CSS/JS biasa). README-nya lengkap: frontend/README.md
  backend/         payment gateway buatan user (Node.js Express). README-nya: backend/README.md
```
- **frontend**: marketplace item game, data masih contoh (dummy), belum ada backend yang nyambung.
- **backend (gopay-kirim)**: bikin order + QRIS dinamis + kode unik, dan watcher yang ngecek mutasi GoPay Merchant (library `gobiz-pay`, nggak resmi) tiap 10 detik. Detail endpoint, aturan, dan kekurangan ada di `backend/README.md`.

## 3. Cara user ngejalanin
User ngedit file lewat **ZArchiver** di `/storage/emulated/0/Download/adopt-mart/`. Backend **nggak bisa** jalan dari situ (penyimpanan HP biasa), jadi jalannya dari folder `~/gopay-gateway` di Termux (sudah ada `node_modules`, `data.json`, `.env` user di situ).

`jalan.sh` melakukan:
1. Nyalin KODE backend (`index.js`, `src`, `package.json`) dari Download ke `~/gopay-gateway`. `data.json`, `.env`, `node_modules` nggak disentuh.
2. `node index.js` (port 3000) dan `node src/watcher.js` di latar.
3. `python -m http.server 8080` buat frontend dari folder `frontend`.

Perintah user: `bash ~/storage/shared/Download/adopt-mart/jalan.sh` (pakai `bash`, jangan dieksekusi langsung dari storage). Berhenti: Ctrl+C. Buka `http://localhost:8080` (frontend) dan `http://localhost:3000` (backend).

## 4. Status sekarang (jujur)
**Dari user (screenshot, versi 35):** `jalan.sh` sukses nyalain ketiganya: frontend 8080 ("Serving HTTP"), server 3000 ("Server jalan di http://localhost:3000"), dan watcher login GoBiz ("Berhasil login! Menunggu transaksi..."). Masalah port 8080 yang dulu udah beres sendiri (port lama bebas). User juga bilang halaman tes backend (`localhost:3000`) memang bisa; yang dia mau QR muncul di **web jualan (frontend)**, bukan di halaman tes backend.

**Versi 36 (baru): QR sudah disambungin ke `frontend/order.html` tahap 2 "Bayar".**
- Backend: CORS (cuma `http://localhost:8080` dan `http://127.0.0.1:8080`) + endpoint baru `GET /api/order/:id` (ngasih status, nominal, kode unik, batas waktu, dan gambar QR kalau masih `pending`).
- Frontend: `data.js` dapat `window.API_BASE` (alamat backend). `market.js` bagian pesanan: begitu masuk tahap 2, halaman manggil `POST /checkout`, nampilin QR + total + sisa waktu 15 menit, ngecek `/status/:id` tiap 3 detik, dan pindah ke tahap 3 sendiri pas status `paid`. Id order disimpan di `sessionStorage` (`am-pay-...`) supaya refresh nggak bikin tagihan baru. Kalau backend nggak nyala atau tagihan kedaluwarsa, muncul pesan + tombol coba lagi / tagihan baru.
- Cara nyampe tahap 2 sekarang: tombol **Mode demo** di halaman pesanan (angka 2), atau tambahin `&t=2` di alamat `order.html`. Alur "penjual klik item ada" belum ada.

**Yang SUDAH dites AI (versi 36):** halaman pesanan di Chromium (lebar 390) terhadap **server tiruan** yang meniru kontrak backend: QR muncul, refresh pakai tagihan yang sama, pindah ke tahap 3 pas status `paid`, nggak melebar ke samping. Syntax `index.js` dan `market.js` dicek (`node --check`).
**BELUM dites:** `index.js` asli dengan express/qrcode (CORS + `/api/order/:id` baru dibaca, belum dijalanin, karena di lingkungan AI nggak ada library-nya); **bayar beneran** (scan QRIS, watcher ngubah jadi paid) lewat web ini.

**Versi tes, belum aman buat duit beneran:** nominal masih dikirim dari halaman (`/checkout` percaya `amount`), dan QR yang muncul selalu QRIS `dakzz_store` (bukan QRIS penjual/rekber). Lihat bagian 5 nomor 4.

## 5. Langkah berikutnya (satu per giliran, tunggu screenshot)
1. ~~Bereskan port.~~ **Beres** (lihat bagian 4).
2. **Tes backend sendiri** di `http://localhost:3000`: user bilang halaman tes bisa jalan.
3. **Tes sambungan frontend ke backend di HP user** (versi 36): minta user timpa folder dengan zip 36, `Ctrl+C` lalu `bash ~/storage/shared/Download/adopt-mart/jalan.sh` lagi, buka `http://localhost:8080/order.html?id=2&s=Rafi%20Store&q=1&m=langsung&t=2`, kirim screenshot. Pastiin QR muncul. Setelah itu baru tes bayar nominal kecil beneran (cek watcher nandain `paid` dan halaman pindah ke tahap 3). Sambungan yang belum: simpan item/penjual/pembeli di order (kekurangan nomor 7 di `backend/README.md`).
4. **Amanin (WAJIB sebelum duit beneran).** Lihat `backend/README.md` bagian 6:
   - Harga dihitung **server** dari item + penjual, bukan `amount` dari browser.
   - Validasi `amount` (minus, nol, desimal, kegedean).
   - Catat ID transaksi GoBiz supaya satu pembayaran nggak melunasi dua order bernominal sama.
   - `data.json` ditulis dua proses sekaligus tanpa kunci: pindah ke SQLite atau kasih lock.
   - Pisahin bagian "EKSEKUSI" di `src/qris.js` (jalan tiap server nyala dan nulis `qris.png`).
   - Siapin panel admin buat nandain lunas manual (jaga-jaga `gobiz-pay` mati).
5. **Keputusan user yang masih nunggu:** keranjang. Usulan: dikelompokin per penjual (1 kelompok = 1 order = 1 QRIS = 1 chat). Tanya user **satu** pertanyaan itu. Detail di `frontend/README.md` bagian 8.
6. Lain-lain (lihat `frontend/README.md` bagian 5 dan 9): ganti gambar hero (sekarang gambar resmi Adopt Me! berlogo, berisiko), nyambungin Firebase login, WhatsApp admin, foto item asli, backend login/penjual/order sungguhan.

## 6. Yang gampang bikin salah
- Backend baca/tulis `data.json` **relatif dari folder tempat node dijalankan**. Harus dijalanin dari `~/gopay-gateway` (jalan.sh sudah ngurus).
- Server dan watcher itu **dua proses terpisah**. Kalau watcher mati, order nggak pernah jadi lunas otomatis.
- `.env` (login GoBiz) **jangan pernah diminta/dikirim**. Kalau user ngirim file backend, suruh buang `.env` dulu.
- Expired: UI 15 menit, server 18 menit, watcher masih nerima duit buat order expired umur < 20 menit.
- Kode unik: ≤Rp500 → 1–9, ≤Rp5.000 → 1–49, selebihnya 1–200.
- QRIS statis toko (nama toko, kota) ditulis langsung di `backend/index.js` dan `backend/src/qris.js`.
- Aturan penting frontend (tema, hero `--hh`, `data-order` vs `data-pos`, dll) ada di `frontend/README.md` bagian 6. Jangan dilanggar.
