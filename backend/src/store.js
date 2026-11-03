import fs from "node:fs";

const FILE = "data.json";
const WAKTU_UI = 15 * 60 * 1000; 
const WAKTU_BACKEND = 18 * 60 * 1000; 

if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");

export function createOrder(id, originalAmount) {
  const data = JSON.parse(fs.readFileSync(FILE));
  
  // --- PAJAK DINAMIS (Berdasarkan nominal) ---
  let maxUnique = 200; // Default buat nominal gede
  if (originalAmount <= 500) maxUnique = 9;       // Kalau murah (<=500), pajak maks 9
  else if (originalAmount <= 5000) maxUnique = 49;  // Kalau sedang (<=5000), pajak maks 49
  
  const uniqueCode = Math.floor(Math.random() * maxUnique) + 1; 
  
  const totalAmount = originalAmount + uniqueCode;

  data[id] = { 
    id, originalAmount, uniqueCode, amount: totalAmount,
    status: "pending", createdAt: new Date().toISOString() 
  };
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function getOrder(id) {
  const data = JSON.parse(fs.readFileSync(FILE));
  const order = data[id];
  
  if (order && order.status === "pending") {
    if (Date.now() - new Date(order.createdAt).getTime() > WAKTU_BACKEND) {
      order.status = "expired";
      data[id].status = "expired";
      fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    }
  }
  return order;
}

export function markPaid(id) {
  const data = JSON.parse(fs.readFileSync(FILE));
  if (data[id]) {
    data[id].status = "paid";
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  }
}
