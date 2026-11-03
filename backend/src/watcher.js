import "dotenv/config";
import { GoPayMerchant } from "gobiz-pay";
import { markPaid } from "./store.js";
import fs from "node:fs";

async function startWatcher() {
  console.log("🕵️‍♂️ Menghubungkan ke GoBiz API...");
  const merchant = new GoPayMerchant();
  
  try {
    await merchant.init();
    console.log("✅ Berhasil login! Menunggu transaksi...\n");

    setInterval(async () => {
      try {
        const result = await merchant.getHistory({ days: 1, size: 50 });
        
        if (result && result.data && result.data.histories) {
            const histories = result.data.histories;
            const data = JSON.parse(fs.readFileSync("data.json", "utf8"));
            
            // Ambil order yang PENDING (dan toleransi kalau udah EXPIRED < 20 menit)
            const targetOrders = Object.values(data).filter(o => {
                if (o.status === "pending") return true;
                if (o.status === "expired") {
                    const umur = Date.now() - new Date(o.createdAt).getTime();
                    if (umur < 20 * 60 * 1000) return true; // Cek yg expired baru
                }
                return false;
            });

            if (targetOrders.length === 0) return;

            for (const order of targetOrders) {
              const isPaid = histories.some(tx => {
                  if (tx.type !== "payin" || tx.raw?.transaction_status !== "SETTLEMENT") return false;
                  const nominalGojek = Number(tx.raw?.gross_amount) / 100;
                  const waktuTransaksi = new Date(tx.raw?.transaction_time).getTime();
                  const waktuOrderDibuat = new Date(order.createdAt).getTime();
                  
                  return nominalGojek === order.amount && waktuTransaksi >= (waktuOrderDibuat - 5000);
              });

              if (isPaid) {
                markPaid(order.id); // Kalau expired tapi ada duit masuk, tetap ubah jadi paid!
                const jam = new Date().toLocaleTimeString('id-ID');
                const statusAwal = order.status === 'expired' ? '(TELAT/GRACE PERIOD)' : '';
                console.log(`[${jam}] ✅ OTOMATIS LUNAS ${statusAwal}: Order ${order.id} (Rp${order.amount})`);
              }
            }
        }
      } catch (err) {
        console.error("Gagal cek transaksi:", err.message);
      }
    }, 10000);

  } catch (error) {
    console.error("❌ Gagal login:", error.message);
  }
}
startWatcher();
