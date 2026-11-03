import QRCode from "qrcode";

function parseTLV(str) {
  const out = [];
  let i = 0;
  while (i < str.length) {
    const tag = str.slice(i, i + 2);
    const len = parseInt(str.slice(i + 2, i + 4), 10);
    if (isNaN(len)) break;
    const value = str.slice(i + 4, i + 4 + len);
    out.push({ tag, value });
    i += 4 + len;
  }
  return out;
}

function buildTLV(arr) {
  return arr.map(({ tag, value }) => tag + String(value.length).padStart(2, "0") + value).join("");
}

function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildDynamicQris(staticQris, amount) {
  const tlvs = parseTLV(staticQris).filter((t) => t.tag !== "63");
  const amountStr = String(Math.round(amount));
  const filtered = tlvs.filter((t) => t.tag !== "54");
  const insertAt = filtered.findIndex((t) => t.tag === "58");
  const withAmount = [...filtered];
  withAmount.splice(insertAt >= 0 ? insertAt : withAmount.length, 0, { tag: "54", value: amountStr });
  const partial = buildTLV(withAmount) + "6304";
  return partial + crc16(partial);
}

// --- EKSEKUSI ---
const qrisAsli = "00020101021126610014COM.GO-JEK.WWW01189360091436785134090210G6785134090303UMI51440014ID.CO.QRIS.WWW0215ID10243661522120303UMI5204581653033605802ID5921dakzz_store, PANONGAN6009TANGERANG61051571062070703A0163043497";
const nominal = 10000; // Ubah sesuai kebutuhan

const qrisDinamis = buildDynamicQris(qrisAsli, nominal);

console.log("--- TEXT QRIS ---");
console.log(qrisDinamis);

// Bikin gambar QR-nya langsung!
QRCode.toFile('qris.png', qrisDinamis, {
  color: { dark: '#000000', light: '#ffffff' }
}, function (err) {
  if (err) throw err;
  console.log("\n✅ SUKSES! Gambar QR sudah jadi.");
  console.log("📁 Buka file 'qris.png' di folder gopay-gateway buat scan!");
});
