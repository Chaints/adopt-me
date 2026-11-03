#!/data/data/com.termux/files/usr/bin/bash
# jalan.sh — nyalain backend (server + watcher) dan frontend sekaligus.
# Jalanin pakai:  bash ~/storage/shared/Download/adopt-mart/jalan.sh
# Berhenti: tekan Ctrl+C (semua ikut mati).

SRC="$HOME/storage/shared/Download/adopt-mart"   # folder yang lu edit di ZArchiver
WORK="$HOME/gopay-gateway"                       # folder backend lama lu di Termux

if [ ! -d "$SRC/backend" ] || [ ! -d "$SRC/frontend" ]; then
  echo "Folder $SRC/backend atau /frontend nggak ketemu."
  exit 1
fi

if [ ! -d "$WORK" ]; then
  echo "Folder $WORK nggak ada. Berhenti dulu, jangan lanjut."
  exit 1
fi

# Salin KODE backend aja (index.js, src, package.json).
# data.json, .env, dan node_modules di $WORK nggak disentuh.
cp "$SRC/backend/index.js" "$SRC/backend/package.json" "$WORK/"
cp -r "$SRC/backend/src" "$WORK/"

trap 'kill 0' INT TERM EXIT

cd "$WORK" || exit 1
node index.js &
node src/watcher.js &

cd "$SRC/frontend" || exit 1
echo "Frontend : http://localhost:8080"
echo "Backend  : http://localhost:3000"
python -m http.server 8080
