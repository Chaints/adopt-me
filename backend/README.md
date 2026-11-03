# gopay-kirim — payment gateway buatan sendiri (backend)

Backend pembayaran QRIS buat adopt.mart / dakzz.store. Dibikin pakai Node.js (Express). Nggak pakai Midtrans/Xendit/dll. Deteksi uang masuk lewat library `gobiz-pay` yang ngecek mutasi akun GoPay Merchant (GoBiz).

## 1. Cara kerja singkat
1. Pembeli kirim nominal ke `POST /checkout` → server bikin order (`ORD-XXXXXX`) + **kode unik** (angka kecil ditambahin ke total) biar nominal tiap order beda.
2. Pembeli dibawa ke `/pay/:id` → tampil QRIS dinamis (nominal terkunci) + timer 15 menit.
3. Halaman ngecek `/status/:id` tiap 3 detik.
4. Proses **watcher** (jalan terpisah) ngecek mutasi GoBiz tiap 10 detik. Kalau ada uang masuk dengan nominal sama persis + waktunya setelah order dibuat → order jadi `paid`.

## 2. Isi folder
```
index.js        Server Express: halaman utama, /checkout, /pay/:id, /status/:id (port 3000)
src/store.js    Simpan & baca order di data.json (bikin order, cek kedaluwarsa, tandai lunas)
src/watcher.js  Pendeteksi bayar (login GoBiz, cek mutasi tiap 10 detik)
src/qris.js     Bikin QRIS dinamis dari QRIS statis (TLV + CRC16)
package.json    Daftar library (express, qrcode, gobiz-pay, dotenv)
```
File yang dibikin otomatis saat jalan: `data.json` (data order) dan `qris.png` (lihat catatan nomor 6).

## 3. Cara jalanin (Termux)
Harus **dua proses**, buka **dua sesi Termux**, dua-duanya dari folder `backend`:
```
cd backend
npm install
```
Bikin file `.env` (isi login GoBiz sesuai yang diminta library `gobiz-pay`; nama variabelnya cek di dokumentasi library itu). **Jangan pernah kirim/upload file `.env`.**

Sesi 1 (server web):
```
node index.js
```
Sesi 2 (pendeteksi bayar):
```
node src/watcher.js
```
Buka `http://localhost:3000`. Jalanin dari folder `backend`, soalnya `data.json` dibaca relatif dari folder tempat lu ngetik perintah. Kalau watcher mati, order **nggak akan pernah** jadi lunas otomatis.

## 4. Endpoint
| Method | Alamat | Fungsi |
|---|---|---|
| GET | `/` | Halaman buat tagihan (contoh/tes) |
| POST | `/checkout` | Body JSON `{ "amount": 50000 }` → `{ "success": true, "orderId": "ORD-XXXXXX" }` |
| GET | `/pay/:id` | Halaman bayar (QRIS, timer, status) |
| GET | `/status/:id` | Cek status → data order: `status` (`pending` / `paid` / `expired`), `amount`, `originalAmount`, `uniqueCode`, `createdAt` |
| GET | `/api/order/:id` | (baru, v36) Data order + `expiresAt` + `qr` (gambar QR data-URL, cuma kalau masih `pending`). Dipakai `frontend/order.html`. |

Dari frontend: panggil `/checkout`, lalu arahkan pembeli ke `/pay/<orderId>`, **atau** (v36) ambil `/api/order/<orderId>` dan gambar QR-nya sendiri di halaman. **CORS** cuma ngizinin `http://localhost:8080` dan `http://127.0.0.1:8080` (daftar `ALLOWED_ORIGINS` di `index.js`); kalau frontend dipindah ke alamat lain, tambahin di situ. `/api/order/:id` dan `/status/:id` sama-sama ngasih data order ke siapa pun yang tahu ID-nya (kekurangan nomor 5).

## 5. Aturan yang berlaku sekarang (sesuai kode)
- **Kode unik** tergantung nominal: ≤ Rp500 → 1–9, ≤ Rp5.000 → 1–49, di atas itu → 1–200. Total bayar = nominal + kode unik.
- **Timer di tampilan 15 menit.** Di server, order baru dianggap `expired` setelah **18 menit** (masa tenggang).
- Watcher masih mau nerima uang masuk buat order `expired` yang umurnya **kurang dari 20 menit**, lalu mengubahnya jadi `paid`.
- Uang dianggap cocok kalau: jenis `payin`, status `SETTLEMENT`, nominal sama persis dengan total order, dan waktu transaksi tidak lebih dari 5 detik sebelum order dibuat.
- QRIS statis ada di `index.js` dan `src/qris.js` (nama toko, kota, dll nempel di situ).

## 6. Kekurangan yang belum diberesin (jujur)
Ini cuma dicatat, belum diubah:
1. **Nominal dikirim dari browser.** `/checkout` percaya `amount` dari pembeli, dan belum dicek (angka minus, nol, desimal, atau kegedean masih lolos). Buat adopt.mart, harga harus dihitung server dari item + penjual, bukan dari kiriman halaman.
2. **Satu pembayaran bisa melunasi lebih dari satu order.** Kalau 2 order pending punya total sama persis, satu uang masuk bisa nandain dua-duanya `paid`, karena ID transaksi belum dicatat. Makin sering kejadian kalau order banyak (kode unik cuma 1–200).
3. **`data.json` dipakai dua proses sekaligus** (server + watcher), tanpa kunci. Kalau nulis barengan, data bisa saling timpa atau file rusak. Saran: pindah ke SQLite.
4. **`src/qris.js` langsung jalan pas di-import.** Tiap server nyala, dia bikin ulang `qris.png` (nominal 10000) dan nulis ke layar. Bagian "EKSEKUSI" di bawah file itu cuma buat tes dan sebaiknya dipisah.
5. **`/status/:id` ngasih semua data order** ke siapa pun yang tahu ID-nya.
6. **`gobiz-pay` bukan library resmi.** Kalau GoBiz ngubah sistemnya atau akun kena blokir, deteksi bayar mati. Siapin cara manual buat nandain lunas (panel admin).
7. **Belum ada tautan ke adopt.mart.** Order belum nyimpen item/penjual/pembeli, jadi belum bisa nyambung ke alur rekber dan order di frontend.
8. Port (3000) dan nama file data masih ditulis langsung di kode.
