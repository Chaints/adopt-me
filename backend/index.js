import express from "express";
import QRCode from "qrcode";
import crypto from "node:crypto";
import { buildDynamicQris } from "./src/qris.js";
import { createOrder, getOrder } from "./src/store.js";

const app = express();
app.use(express.json());

// CORS: frontend (port 8080) boleh manggil backend (port 3000). Cuma alamat lokal yang diizinkan.
const ALLOWED_ORIGINS = ["http://localhost:8080", "http://127.0.0.1:8080"];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const QRIS_ASLI = "00020101021126610014COM.GO-JEK.WWW01189360091436785134090210G6785134090303UMI51440014ID.CO.QRIS.WWW0215ID10243661522120303UMI5204581653033605802ID5921dakzz_store, PANONGAN6009TANGERANG61051571062070703A0163043497";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  :root {
    --bg: #09090b; --card: #18181b; --text: #fafafa; --text-muted: #a1a1aa;
    --border: #27272a; --primary: #fafafa; --primary-text: #09090b;
    --danger: #ef4444; --success: #22c55e;
  }
  body { background-color: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
  .card { background-color: var(--card); padding: 32px; border-radius: 16px; border: 1px solid var(--border); width: 100%; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  h1, h2 { font-weight: 600; margin-top: 0; margin-bottom: 8px; font-size: 20px; }
  p { color: var(--text-muted); font-size: 14px; margin-top: 0; margin-bottom: 24px; }
  input { width: 100%; padding: 16px; background-color: var(--bg); border: 1px solid var(--border); border-radius: 10px; color: var(--text); font-size: 16px; box-sizing: border-box; margin-bottom: 16px; outline: none; transition: border-color 0.2s; font-family: 'Inter', sans-serif; }
  input:focus { border-color: var(--text-muted); }
  button { width: 100%; padding: 16px; background-color: var(--primary); color: var(--primary-text); border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; font-family: 'Inter', sans-serif; }
  button:hover { opacity: 0.8; }
  .qr-wrapper { background: #ffffff; padding: 16px; border-radius: 12px; display: inline-block; margin: 16px 0; }
  .qr-wrapper img { display: block; width: 200px; height: 200px; }
  .amount { font-size: 32px; font-weight: 700; margin: 16px 0 8px 0; color: var(--text); }
  .detail { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px;}
  .timer { font-size: 20px; font-weight: 600; color: var(--danger); margin-bottom: 8px; font-variant-numeric: tabular-nums; }
  .status { font-weight: 500; font-size: 14px; color: #eab308; }
  .status.paid { color: var(--success); }
  .status.expired { color: var(--danger); }
  a { color: var(--text-muted); text-decoration: none; font-size: 14px; display: inline-block; margin-top: 16px; }
  a:hover { color: var(--text); }
`;

app.get("/", (req, res) => {
  res.send(`
    <html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dakzz Gateway</title>
    <style>${css}</style></head>
    <body>
      <div class="card">
        <h1>Buat Tagihan</h1>
        <p>Masukkan nominal dasar pembayaran</p>
        <input type="number" id="nominal" placeholder="Contoh: 10000">
        <button onclick="buat()">Lanjut Bayar</button>
      </div>
      <script>
        async function buat() {
          const amt = document.getElementById('nominal').value;
          if(!amt) return alert('Isi nominal!');
          const res = await fetch('/checkout', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ amount: +amt }) });
          const data = await res.json();
          if(data.success) window.location.href = '/pay/' + data.orderId;
        }
      </script>
    </body></html>
  `);
});

app.post("/checkout", async (req, res) => {
  const amount = req.body.amount;
  if (!amount) return res.status(400).json({ error: "Nominal kosong" });
  const orderId = "ORD-" + crypto.randomBytes(3).toString("hex").toUpperCase();
  createOrder(orderId, amount);
  res.json({ success: true, orderId });
});

app.get("/pay/:id", async (req, res) => {
  const order = getOrder(req.params.id);
  
  if (!order) return res.status(404).send(`<html><head><style>${css}</style></head><body><div class="card"><h2>404</h2><p>Order tidak ditemukan</p><a href='/'>Kembali</a></div></body></html>`);

  if (order.status === "expired") return res.send(`<html><head><style>${css}</style></head><body><div class="card"><h2 class="status expired">Waktu Habis</h2><p>Tagihan ini sudah kedaluwarsa.</p><a href='/'>Buat Baru</a></div></body></html>`);
  
  if (order.status === "paid") return res.send(`<html><head><style>${css}</style></head><body><div class="card"><h2 class="status paid">Pembayaran Berhasil</h2><p>Terima kasih telah membayar.</p><a href='/'>Kembali</a></div></body></html>`);

  const qrisText = buildDynamicQris(QRIS_ASLI, order.amount);
  const qrImage = await QRCode.toDataURL(qrisText);

  res.send(`
    <html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pembayaran</title>
    <style>${css}</style>
    </head><body>
      <div class="card">
        <h1>Total Tagihan</h1>
        <div class="amount">Rp ${order.amount.toLocaleString('id-ID')}</div>
        
        <div class="detail">
           Tagihan: Rp ${order.originalAmount.toLocaleString('id-ID')} <br>
           Kode Unik: <b>+${order.uniqueCode}</b>
        </div>

        <div class="timer" id="timer">15:00</div>
        
        <div class="qr-wrapper">
          <img src="${qrImage}">
        </div>
        
        <div class="status" id="status">Menunggu Pembayaran</div>
        <a href="/">Batalkan</a>
      </div>
      
      <script>
        const createdAt = ${new Date(order.createdAt).getTime()};
        const limit = 15 * 60 * 1000;

        function updateTimer() {
           const sisa = (createdAt + limit) - Date.now();
           if (sisa <= 0) {
              document.getElementById('timer').innerText = "00:00";
              document.getElementById('status').className = "status expired";
              document.getElementById('status').innerText = "Waktu Habis";
              clearInterval(timerInt);
              setTimeout(() => location.reload(), 2000);
           } else {
              const m = Math.floor(sisa / 60000).toString().padStart(2, '0');
              const s = Math.floor((sisa % 60000) / 1000).toString().padStart(2, '0');
              document.getElementById('timer').innerText = m + ":" + s;
           }
        }
        const timerInt = setInterval(updateTimer, 1000);
        updateTimer();

        const checkStatus = setInterval(async () => {
           const r = await fetch('/status/${order.id}');
           const d = await r.json();
           if (d.status === 'paid') {
              clearInterval(checkStatus);
              document.getElementById('status').className = 'status paid';
              document.getElementById('status').innerText = 'Pembayaran Berhasil';
              document.getElementById('timer').innerText = '';
              setTimeout(() => location.reload(), 1500);
           } else if (d.status === 'expired') {
              clearInterval(checkStatus);
              location.reload();
           }
        }, 3000);
      </script>
    </body></html>
  `);
});

app.get("/status/:id", (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order ga ada" });
  res.json(order);
});

app.get("/api/order/:id", async (req, res) => {
  const order = getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order ga ada" });
  const out = {
    id: order.id,
    status: order.status,
    amount: order.amount,
    originalAmount: order.originalAmount,
    uniqueCode: order.uniqueCode,
    createdAt: order.createdAt,
    expiresAt: new Date(new Date(order.createdAt).getTime() + 15 * 60 * 1000).toISOString(),
  };
  if (order.status === "pending") {
    out.qr = await QRCode.toDataURL(buildDynamicQris(QRIS_ASLI, order.amount));
  }
  res.json(out);
});

app.listen(3000, () => console.log("Server jalan di http://localhost:3000"));
