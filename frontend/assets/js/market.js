/* adopt.mart — logika halaman (render dari data.js). Bergantung pada data.js. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const items = window.ITEMS || [];
  const rp = window.fmtRp;
  const toast = (m) => {
    const t = $(".toast"); if (!t) return;
    t.textContent = m; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 3600);
  };
  const shopRating = (name) => { const s = (window.SELLERS || {})[name]; return s ? s.rating.toFixed(1) : "-"; };
  const catName = (id) => (window.CATS.find((c) => c.id === id) || {}).name || id;

  const cardFor = (it, seller) => {
    const f = window.prodInfo(seller ? { ...it, offers: it.offers.filter((o) => o.seller === seller) } : it), many = f.offers.length > 1, o = f.offers[0];
    return `
    <article class="tcard" data-cat="${it.cat}" data-price="${f.minPrice}" data-sold="${f.sold}" data-name="${(it.name + " " + f.offers.map((o) => o.seller).join(" ")).toLowerCase()}">
      <div class="tcard__media tcard__media--art">
        <div class="art">${window.itemArt(it)}</div>
        <span class="tcard__kind">${catName(it.cat)}</span>
      </div>
      <div class="tcard__body">
        <h3 class="tcard__name"><a href="item.html?id=${it.id}">${it.name}</a></h3>
        <p class="tcard__stock ${f.stock <= 3 ? "tcard__stock--low" : ""}">stok ${f.stock}</p>
        <p class="tcard__foot">
          <span class="tcard__price">${many ? "<small>mulai</small>" : ""}${rp(f.minPrice)}</span>
          <span class="tcard__go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg></span>
        </p>
        <p class="tcard__seller">${many ? `${f.offers.length} penjual` : `oleh ${o.seller}`}</p>
        <p class="tcard__facts">
          ${many ? "" : `<span class="tcard__shop">Rating toko ${shopRating(o.seller)}</span>`}
          <span>${f.sold} terjual</span>
        </p>
      </div>
    </article>`;
  };
  const card = (it) => cardFor(it);

  /* Kalau udah login (sesi disimpan auth.js di localStorage "am-session"), tombol Masuk di header jadi nama user */
  try {
    const u = JSON.parse(localStorage.getItem("am-session") || "null");
    if (u && u.name) $$(".header__signin, .nav__signin-mobile").forEach((a) => { a.textContent = u.name.split(" ")[0]; a.title = "Akun: " + u.name; });
  } catch (e) {}

  /* Ganti tema terang/gelap (atribut awal dipasang script kecil di <head>) */
  const themeBtn = $("[data-theme-toggle]");
  if (themeBtn) {
    const root = document.documentElement;
    const sync = () => themeBtn.setAttribute("aria-pressed", String(root.getAttribute("data-theme") === "dark"));
    sync();
    themeBtn.addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") !== "dark";
      if (dark) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
      try { localStorage.setItem("am-theme", dark ? "dark" : "light"); } catch (e) {}
      sync();
    });
  }

  /* Link yang belum dibuat */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-soon]"); if (!a) return;
    e.preventDefault(); toast(a.dataset.soon);
  });

  /* Tab bawah (HP): Beranda · Chat · Transaksi · Akun. CSS-nya di blok "TAB BAWAH" market.css.
     Tab yang nonjok (aria-current) ditentuin dari nama halaman yang lagi dibuka. Halaman Chat & Transaksi belum ada,
     jadi cuma nampilin pesan "belum dibuat" (data-soon). Kalau halamannya udah jadi: ganti href, hapus soon. */
  {
    const ic = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const TABS = [
      { id: "home", label: "Beranda", href: "index.html", pages: ["index", "items", "item", "seller"],
        svg: ic('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5a1 1 0 0 0 1 1H10v-5.5h4v5.5h3.5a1 1 0 0 0 1-1V10"/>') },
      { id: "chat", label: "Chat", soon: "Halaman chat belum dibuat.", pages: [],
        svg: ic('<path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1h-8l-4.5 3.5V17H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1Z"/><path d="M8 10h8M8 13h5"/>') },
      { id: "trx", label: "Transaksi", soon: "Halaman daftar transaksi belum dibuat.", pages: ["order"],
        svg: ic('<path d="M6 3.5h12a1 1 0 0 1 1 1V21l-3-2-3 2-3-2-3 2V4.5a1 1 0 0 1 1-1Z" transform="translate(-.5 0)"/><path d="M8.5 8.5h7M8.5 12h7"/>') },
      { id: "acc", label: "Akun", href: "login.html", pages: ["login"],
        svg: ic('<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>') },
    ];
    const page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
    const bar = document.createElement("nav");
    bar.className = "tabbar"; bar.setAttribute("aria-label", "Menu bawah");
    bar.innerHTML = TABS.map((t) => {
      const cur = t.pages.includes(page) ? ' aria-current="page"' : "";
      const go = t.soon ? ` href="#" data-soon="${t.soon}"` : ` href="${t.href}"`;
      return `<a class="tabbar__btn"${go}${cur}>${t.svg}<span>${t.label}</span></a>`;
    }).join("");
    document.body.appendChild(bar);
    /* Di beranda, bagian hero (paling atas) tab disembunyiin; muncul begitu halaman di-scroll */
    if (page === "index") {
      const sync = () => {
        const away = window.scrollY < 40;
        bar.classList.toggle("is-away", away);
        document.documentElement.classList.toggle("tb-off", away);
      };
      sync();
      window.addEventListener("scroll", sync, { passive: true });
    }
  }

  /* Tombol WhatsApp admin (isi nomor/link di data.js bagian CONTACT) */
  const waLink = (text) => {
    const c = window.CONTACT || {};
    if (c.waAdmin) return `https://wa.me/${c.waAdmin}?text=${encodeURIComponent(text)}`;
    return c.waGroup || "";
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-wa]"); if (!a) return;
    e.preventDefault();
    const url = waLink(a.dataset.wa || "Halo admin adopt.mart");
    if (!url) { toast("Nomor/link WhatsApp admin belum diisi (data.js, bagian CONTACT)."); return; }
    window.open(url, "_blank", "noopener");
  });

  /* ---- Beranda ---- */
  const home = $("[data-home-grid]");
  if (home) home.innerHTML = items.slice().sort((a, b) => window.prodInfo(b).sold - window.prodInfo(a).sold).slice(0, 6).map(card).join("");
  $$("[data-cat-count]").forEach((el) => {
    const n = items.filter((i) => i.cat === el.dataset.catCount).length;
    el.textContent = `${n} item`;
  });

  /* ---- Daftar item ---- */
  const grid = $("[data-item-grid]");
  if (grid) {
    grid.innerHTML = items.map(card).join("");
    const cards = $$(".tcard", grid);
    cards.forEach((c, i) => { c.dataset.pos = i; });
    const chips = $$("[data-cat-chip]");
    const q = $("[data-q]");
    const cap = $("[data-price-cap]");
    const capOut = $("[data-price-out]");
    const sort = $("[data-sort]");
    const count = $("[data-count]");
    const empty = $("[data-empty]");

    const params = new URLSearchParams(location.search);
    if (params.get("q") && q) q.value = params.get("q");
    const pc = params.get("cat");
    if (pc) chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.catChip === pc)));
    if (!chips.some((c) => c.getAttribute("aria-pressed") === "true") && chips[0]) chips[0].setAttribute("aria-pressed", "true");

    const apply = () => {
      const cat = (chips.find((c) => c.getAttribute("aria-pressed") === "true") || {}).dataset?.catChip || "all";
      const max = Number(cap.value);
      const term = (q.value || "").trim().toLowerCase();
      capOut.textContent = rp(max);
      let shown = 0;
      cards.forEach((c) => {
        const ok = (cat === "all" || c.dataset.cat === cat) && Number(c.dataset.price) <= max && (!term || c.dataset.name.includes(term));
        c.hidden = !ok; if (ok) shown++;
      });
      const by = {
        populer: (a, b) => b.dataset.sold - a.dataset.sold,
        "murah": (a, b) => a.dataset.price - b.dataset.price,
        "mahal": (a, b) => b.dataset.price - a.dataset.price,
        terbaru: (a, b) => a.dataset.pos - b.dataset.pos,
      }[sort.value];
      cards.slice().sort(by).forEach((c) => grid.appendChild(c));
      count.textContent = `${shown} item`;
      empty.hidden = shown > 0;
    };
    chips.forEach((chip) => chip.addEventListener("click", () => {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip))); apply();
    }));
    [q, cap, sort].forEach((el) => el.addEventListener("input", apply));

    /* Saran pas ngetik di kotak cari: item + penjual yang salah satu katanya diawali huruf yang diketik */
    const sg = $("[data-sugg]");
    if (sg) {
      const words = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const hit = (s, t) => words(s).some((w) => w.startsWith(t));
      let act = -1;
      const rows = () => $$(".sugg__row", sg);
      const closeS = () => { sg.hidden = true; act = -1; };
      const mark = () => rows().forEach((r, i) => r.classList.toggle("is-act", i === act));
      const openS = () => {
        const t = q.value.trim().toLowerCase();
        if (!t) return closeS();
        const its = items.filter((i) => hit(i.name, t)).slice(0, 5);
        const sel = Object.keys(window.SELLERS || {}).filter((s) => hit(s, t)).slice(0, 3);
        if (!its.length && !sel.length) return closeS();
        sg.innerHTML = its.map((i) => `<a class="sugg__row" href="item.html?id=${i.id}"><span class="sugg__tag">Item</span><span class="sugg__name">${i.name}</span><small>mulai ${rp(window.prodInfo(i).minPrice)}</small></a>`).join("")
          + sel.map((s) => `<a class="sugg__row" href="seller.html?s=${encodeURIComponent(s)}"><span class="sugg__tag sugg__tag--s">Penjual</span><span class="sugg__name">${s}</span><small>Rating toko ${shopRating(s)} · ${items.filter((i) => i.offers.some((o) => o.seller === s)).length} item</small></a>`).join("");
        act = -1; sg.hidden = false;
      };
      q.addEventListener("input", openS);
      q.addEventListener("focus", openS);
      q.addEventListener("keydown", (e) => {
        const r = rows();
        if (e.key === "Escape") { closeS(); return; }
        if (sg.hidden || !r.length) return;
        if (e.key === "ArrowDown") { e.preventDefault(); act = (act + 1) % r.length; mark(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); act = (act - 1 + r.length) % r.length; mark(); }
        else if (e.key === "Enter" && act >= 0) { e.preventDefault(); location.href = r[act].href; }
      });
      document.addEventListener("click", (e) => { if (!e.target.closest("[data-sugg-wrap]")) closeS(); });
    }
    $("[data-reset]")?.addEventListener("click", () => {
      chips.forEach((c, i) => c.setAttribute("aria-pressed", String(i === 0)));
      q.value = ""; cap.value = cap.max; sort.value = "populer"; apply();
    });
    apply();
  }

  /* ---- Profil penjual (seller.html?s=Nama) ---- */
  const sellerEl = $("[data-seller]");
  if (sellerEl) {
    const name = new URLSearchParams(location.search).get("s") || "";
    const info = (window.SELLERS || {})[name];
    if (!info) {
      sellerEl.innerHTML = `<div class="empty"><h2>Penjual nggak ketemu</h2><p>Namanya salah atau toko ini udah nggak jualan.</p><a class="btn btn--dark" href="items.html">Balik ke daftar item</a></div>`;
    } else {
      document.title = `${name} — adopt.mart`;
      $("[data-crumb]").textContent = name;
      const mine = items.filter((i) => i.offers.some((o) => o.seller === name));
      const sold = mine.reduce((n, i) => n + i.offers.filter((o) => o.seller === name).reduce((m, o) => m + o.sold, 0), 0);
      sellerEl.innerHTML = `
        <div class="sprof">
          <span class="sprof__av" aria-hidden="true">${name[0]}</span>
          <div class="sprof__main">
            <p class="label">Penjual</p>
            <h1>${name}</h1>
            <p>${info.bio || ""}</p>
            <p class="sprof__stats"><span>Rating toko ${shopRating(name)}</span><span>${sold} terjual</span><span>${mine.length} item</span><span>Telat kirim ${info.late || 0}/${window.MAX_LATE}</span></p>
          </div>
        </div>
        <p class="note">Penjual wajib kirim item maksimal 30 menit setelah bayar. Telat = peringatan, ${window.MAX_LATE}x melanggar = di-blacklist dari jualan. Rating dan angka di sini masih contoh.</p>
        <div class="shead" style="margin-top:2rem"><h2>Item dari ${name}</h2></div>
        <div class="tgrid">${mine.map((i) => cardFor(i, name)).join("")}</div>`;
    }
  }

  /* ---- Detail item ---- */
  const detail = $("[data-detail]");
  if (detail) {
    const id = Number(new URLSearchParams(location.search).get("id"));
    const it = items.find((i) => i.id === id);
    if (!it) {
      detail.innerHTML = `<div class="empty"><h2>Item nggak ketemu</h2><p>Mungkin udah terjual atau dihapus penjual.</p><a class="btn btn--dark" href="items.html">Balik ke daftar item</a></div>`;
    } else {
      document.title = `${it.name} — adopt.mart`;
      $("[data-crumb]").textContent = it.name;
      const f = window.prodInfo(it);
      let cur = Math.max(0, f.offers.findIndex((o) => o.stock > 0));
      let qty = 1;
      const offerRow = (o, i) => `
        <button type="button" class="offer" data-offer="${i}" aria-pressed="${i === cur}" ${o.stock < 1 ? "disabled" : ""}>
          <span class="sellerbox__av" aria-hidden="true">${o.seller[0]}</span>
          <span class="offer__info"><strong>${o.seller}</strong><small>Rating toko ${shopRating(o.seller)} · ${o.sold} terjual · stok ${o.stock} · telat kirim ${(window.SELLERS[o.seller] || {}).late || 0}/${window.MAX_LATE}</small></span>
          <span class="offer__price">${rp(o.price)}</span>
        </button>`;
      detail.innerHTML = `
        <div class="idetail__art"><div class="art">${window.itemArt(it)}</div></div>
        <div>
          <p class="label">${catName(it.cat)}</p>
          <h1>${it.name}</h1>
          <p class="idetail__price" data-price>${rp(f.offers[cur].price)}</p>
          <p class="idetail__desc">${it.desc}</p>
          <p class="label offers__title">${f.offers.length > 1 ? `Pilih penjual (${f.offers.length})` : "Penjual"}</p>
          <div class="offers">${f.offers.map(offerRow).join("")}</div>
          <p class="sellerlink"><a data-sellerlink href="#">Lihat profil toko</a></p>
          <p class="label offers__title">Cara bayar</p>
          <p class="hialert" data-hi hidden><strong>Item high tier (mulai ${rp(window.HIGH_TIER)}).</strong> Disarankan beli lewat rekber admin biar lebih aman dari scam.</p>
          <div class="paymode">
            <button type="button" class="paymode__opt" data-mode="rekber" aria-pressed="false"><strong>Rekber admin<span data-rtag></span></strong><small>Uang ditahan admin sampai item lu terima</small></button>
            <button type="button" class="paymode__opt" data-mode="langsung" aria-pressed="true"><strong>Langsung ke penjual</strong><small>Bayar ke QRIS penjual, web nggak pegang uang</small></button>
          </div>
          <div class="buybox">
            <div class="qty">
              <span>Jumlah <small style="color:var(--pine-mute)">(stok <span data-stock>${f.offers[cur].stock}</span>)</small></span>
              <span class="qty__ctrl">
                <button type="button" data-q-step="-1" aria-label="Kurangi">−</button>
                <output data-qty>1</output>
                <button type="button" data-q-step="1" aria-label="Tambah">+</button>
              </span>
            </div>
            <div class="total"><span>Total bayar</span><strong data-total>${rp(f.offers[cur].price)}</strong></div>
            <button class="btn btn--dark btn--block" type="button" data-buy>Pesan &amp; ngobrol dulu</button>
            <button class="btn btn--ghost btn--block" type="button" data-wa="Halo admin adopt.mart, gue mau tanya soal item ${it.name}.">Tanya admin lewat WhatsApp</button>
          </div>
          <p class="note">Habis pesan, lu ngobrol dulu sama penjual. Bayar baru dibuka setelah penjual konfirmasi item ada. Penjual wajib kirim item maks 30 menit setelah bayar (telat = peringatan, 2x = blacklist jualan). Setelah item masuk, lu konfirmasi diterima (maks 1 hari). Bayar &amp; konfirmasi masih tampilan contoh.</p>
        </div>`;
      const out = $("[data-qty]"), total = $("[data-total]"), priceEl = $("[data-price]"), stockEl = $("[data-stock]");
      const refresh = () => {
        const o = f.offers[cur];
        priceEl.textContent = rp(o.price); stockEl.textContent = o.stock;
        const sl = $("[data-sellerlink]"); sl.href = `seller.html?s=${encodeURIComponent(o.seller)}`; sl.textContent = `Lihat profil toko ${o.seller}`;
        out.textContent = qty; total.textContent = rp(qty * o.price);
        const hi = window.isHigh(qty * o.price);
        $("[data-hi]").hidden = !hi;
        $("[data-rtag]").textContent = hi ? " (disarankan)" : "";
        if (!manual) setMode(hi ? "rekber" : "langsung");
      };
      let mode = "langsung", manual = false;
      const setMode = (m) => {
        mode = m;
        $$("[data-mode]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.mode === m)));
      };
      $$("[data-offer]").forEach((b) => b.addEventListener("click", () => {
        cur = Number(b.dataset.offer); qty = 1;
        $$("[data-offer]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        refresh();
      }));
      $$("[data-q-step]").forEach((b) => b.addEventListener("click", () => {
        qty = Math.min(f.offers[cur].stock, Math.max(1, qty + Number(b.dataset.qStep)));
        refresh();
      }));
      $$("[data-mode]").forEach((b) => b.addEventListener("click", () => { manual = true; setMode(b.dataset.mode); }));
      refresh();
      $("[data-buy]").addEventListener("click", () => {
        location.href = `order.html?id=${it.id}&s=${encodeURIComponent(f.offers[cur].seller)}&q=${qty}&m=${mode}`;
      });
      const rel = $("[data-related]");
      if (rel) rel.innerHTML = items.filter((i) => i.id !== it.id && i.cat === it.cat).slice(0, 3).map(card).join("")
        || items.filter((i) => i.id !== it.id).slice(0, 3).map(card).join("");
    }
  }
  /* ---- Pesanan: rekber + chat per order (TAMPILAN CONTOH, belum ada backend) ---- */
  const orderEl = $("[data-order]");
  if (orderEl) {
    const sp = new URLSearchParams(location.search);
    const it = items.find((i) => i.id === Number(sp.get("id"))) || items[0];
    const f = window.prodInfo(it);
    const off = f.offers.find((o) => o.seller === sp.get("s")) || f.offers[0];
    const qty = Math.min(Math.max(off.stock, 1), Math.max(1, Number(sp.get("q")) || 1));
    const total = qty * off.price;
    let rekber = sp.get("m") ? sp.get("m") === "rekber" : window.isHigh(total);
    let stage = Math.min(5, Math.max(1, Number(sp.get("t")) || 1));
    const mine = [];
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    orderEl.innerHTML = `
      <div class="order__col">
        <div class="ocard">
          <div class="osum">
            <div class="osum__art"><div class="art">${window.itemArt(it)}</div></div>
            <div class="osum__info">
              <strong><a href="item.html?id=${it.id}">${it.name}</a></strong>
              <small>oleh ${off.seller} · Rating toko ${shopRating(off.seller)}</small>
              <small data-omode></small>
            </div>
          </div>
          <div class="osum__row"><span>${qty} × ${rp(off.price)}</span><strong>${rp(total)}</strong></div>
        </div>
        <div class="ocard"><p class="label">Pesanan #AM-1024 (contoh)</p><ol class="steps5" data-steps></ol></div>
        <div class="ocard" data-panel></div>
        <a class="btn btn--ghost btn--block" href="#" data-wa="Halo admin adopt.mart, gue butuh bantuan soal pesanan #AM-1024.">Butuh admin? Chat WhatsApp</a>
        <div class="demo">
          <strong>Mode demo (nanti dihapus)</strong>
          <div class="demo__row"><span>Tahap:</span>${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="chip" data-stage="${n}">${n}</button>`).join("")}</div>
          <div class="demo__row"><span>Cara bayar:</span><button type="button" class="chip" data-rk="1">Rekber</button><button type="button" class="chip" data-rk="0">Langsung</button></div>
        </div>
      </div>
      <div class="chat">
        <div class="chat__head"><strong>Chat pesanan #AM-1024</strong><small>Cuma pembeli, penjual, dan admin yang bisa baca</small></div>
        <div class="chat__list" data-msgs></div>
        <div class="chat__in"><input type="text" data-msg placeholder="Tulis pesan ke ${esc(off.seller)}..." maxlength="300" /><button class="btn btn--dark" type="button" data-send>Kirim</button></div>
        <p class="chat__safe">Admin nggak pernah minta password atau kode OTP. Jangan transaksi di luar web.</p>
      </div>`;

    /* ---- Bayar beneran lewat backend gopay-kirim (tahap 2) ----
       Versi TES: nominal masih dikirim dari halaman ini (backend belum ngitung harga sendiri),
       dan QR yang muncul selalu QRIS dakzz_store. Alamat backend: window.API_BASE di data.js. */
    const API = String(window.API_BASE || "").replace(/\/$/, "");
    const PAY_KEY = "am-pay-" + it.id + "-" + off.seller + "-" + qty;
    let pay = null, payBusy = false, payPoll = null, payTick = null;
    const mmss = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)); return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
    const getJSON = async (path, opt) => {
      const r = await fetch(API + path, opt);
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Server balas error " + r.status);
      return d;
    };
    const stopPay = () => { clearInterval(payPoll); clearInterval(payTick); payPoll = payTick = null; };
    const startPay = async (fresh) => {
      if (payBusy || (pay && !fresh)) return;
      payBusy = true; pay = null; stopPay(); paintPanel();
      try {
        let id = null;
        try { id = fresh ? null : sessionStorage.getItem(PAY_KEY); } catch (e) {}
        let d = null;
        if (id) { try { d = await getJSON("/api/order/" + id); } catch (e) { d = null; } }
        if (!d || d.status === "expired" || new Date(d.expiresAt).getTime() <= Date.now()) {
          const c = await getJSON("/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: total }) });
          try { sessionStorage.setItem(PAY_KEY, c.orderId); } catch (e) {}
          d = await getJSON("/api/order/" + c.orderId);
        }
        pay = d;
      } catch (e) {
        pay = { err: "Nggak bisa nyambung ke backend (" + API + "). Pastiin jalan.sh masih nyala. Detail: " + e.message };
      }
      payBusy = false;
      if (pay && pay.status === "paid") { stage = 3; paint(); return; }
      paintPanel();
      if (pay && pay.status === "pending") {
        payTick = setInterval(() => {
          const left = new Date(pay.expiresAt).getTime() - Date.now();
          if (left <= 0) { pay.status = "expired"; stopPay(); if (stage === 2) paintPanel(); return; }
          const el = $("[data-timer]"); if (el) el.textContent = mmss(left);
        }, 1000);
        payPoll = setInterval(async () => {
          try {
            const s2 = await getJSON("/status/" + pay.id);
            if (s2.status === "paid") { pay.status = "paid"; stopPay(); stage = 3; paint(); toast("Pembayaran masuk!"); }
            else if (s2.status === "expired") { pay.status = "expired"; stopPay(); if (stage === 2) paintPanel(); }
          } catch (e) { /* koneksi putus sebentar: coba lagi di putaran berikutnya */ }
        }, 3000);
      }
    };
    const payBody = () => {
      if (payBusy || !pay) return `<p>Bikin tagihan...</p>`;
      if (pay.err) return `<p class="note">${esc(pay.err)}</p><button class="btn btn--dark btn--block" type="button" data-pay-new>Coba lagi</button>`;
      if (pay.status === "paid") return `<p><b>Sudah dibayar.</b> Pembayaran lu udah masuk.</p>`;
      if (pay.status === "expired") return `<p><b>Waktu bayar habis.</b> Tagihan ini udah kedaluwarsa, jangan dibayar.</p><button class="btn btn--dark btn--block" type="button" data-pay-new>Bikin tagihan baru</button>`;
      return `<div class="qrisbox"><img class="qrisbox__qr qrisbox__qr--img" src="${pay.qr}" alt="Kode QRIS pembayaran" /><div><p>QRIS dakzz_store (tes)</p><p class="qrisbox__amt">${rp(pay.amount)}</p><small>Harga ${rp(pay.originalAmount)} + kode unik ${pay.uniqueCode}. Bayar pas segini.</small><p class="qrisbox__amt">Sisa <span data-timer>${mmss(new Date(pay.expiresAt).getTime() - Date.now())}</span></p></div></div>
        <p>Halaman ini ngecek otomatis tiap 3 detik. Begitu uang masuk, pindah ke tahap 3 sendiri.</p>`;
    };

    const steps = () => ["Ngobrol dengan penjual", rekber ? "Bayar ke rekber" : "Bayar ke penjual", "Penjual kirim item", "Lu konfirmasi diterima", "Selesai"];
    const script = () => [
      { at: 1, w: "a", t: "Pesanan dibuat. Ngobrol dulu sama penjual sebelum bayar." },
      { at: 1, w: "b", t: "Kak, ini ready? Bisa trade malam ini?" },
      { at: 1, w: "s", t: "Ready kak, bisa. Trade lewat private server ya." },
      { at: 1, w: "b", t: rekber ? "Oke, pakai rekber ya." : "Oke, gue bayar langsung ke QRIS lu." },
      { at: 1, w: "s", t: "Siap. Gue pastiin item ada dulu." },
      { at: 2, w: "a", t: "Penjual konfirmasi item ada. Silakan bayar sesuai nominal." },
      { at: 3, w: "a", t: rekber ? "Admin udah terima pembayaran (ditahan). Penjual diminta kirim item + bukti dalam 30 menit." : "Penjual konfirmasi pembayaran masuk. Penjual diminta kirim item + bukti dalam 30 menit." },
      { at: 3, w: "s", t: "Udah gue kirim kak. [bukti trade: foto]" },
      { at: 4, w: "a", t: "Penjual udah kirim. Cek item lu, lalu konfirmasi diterima." },
      { at: 4, w: "b", t: "Udah masuk kak, makasih!" },
      { at: 5, w: "a", t: rekber ? "Selesai. Admin mencairkan dana ke penjual." : "Selesai. Pesanan ditutup." },
    ];
    const who = { s: off.seller, b: "Lu", a: "Sistem" };

    const paintSteps = () => {
      $("[data-steps]").innerHTML = steps().map((t, i) => `<li data-n="${i + 1}" data-state="${i + 1 < stage ? "done" : i + 1 === stage ? "now" : "next"}">${t}</li>`).join("");
      $("[data-omode]").textContent = rekber ? "Cara bayar: Rekber (uang ditahan admin)" : "Cara bayar: langsung ke QRIS penjual";
      $$("[data-stage]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.stage) === stage)));
      $$("[data-rk]").forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.rk === "1") === rekber)));
    };
    const panel = {
      1: () => `<p class="label">Tahap 1 dari 5</p><h3>Ngobrol dulu sama penjual</h3><p>Tanya stok, waktu trade, atau apa pun di chat. Kalau udah sepakat, penjual klik <b>Item ada, siap kirim</b>. Bayar baru dibuka setelah itu, jadi sekarang lu belum bayar apa pun.</p>`,
      2: () => `<p class="label">Tahap 2 dari 5</p><h3>${rekber ? "Bayar ke rekber" : "Bayar ke penjual"}</h3>
        ${payBody()}
        <p>${rekber ? "Uang ditahan admin sampai lu konfirmasi item diterima. Penjual belum dapat uang." : "Uang langsung ke penjual. Web nggak pegang uang."}</p>`,
      3: () => `<p class="label">Tahap 3 dari 5</p><h3>Nunggu penjual kirim item</h3><p>${rekber ? "Admin udah terima pembayaran (ditahan)." : "Penjual konfirmasi pembayaran masuk."} Penjual wajib kirim item + bukti trade maksimal <b>30 menit</b> setelah bayar.</p><p class="qrisbox__amt">Sisa 29:59 <small>(contoh)</small></p>
        <p class="note">Kalau lewat 30 menit, penjual diperingatkan. Sudah ${window.MAX_LATE}x melanggar, penjual di-blacklist dari jualan.</p>
        <button class="btn btn--ghost btn--block" type="button" data-act="Contoh: nanti buka sengketa kalau penjual telat.">Lewat 30 menit belum dikirim? Lapor / buka sengketa</button>`,
      4: () => `<p class="label">Tahap 4 dari 5</p><h3>Cek item, lalu konfirmasi</h3><p>Penjual udah kirim item + bukti. Konfirmasi dalam <b>1 hari</b>. Kalau lewat, otomatis dianggap selesai.</p>
        <button class="btn btn--dark btn--block" type="button" data-act="Contoh: nanti ini nutup pesanan${rekber ? " dan admin cairin dana ke penjual" : ""}.">Item udah diterima</button>
        <button class="btn btn--ghost btn--block" type="button" data-act="Contoh: nanti buka sengketa, admin ikut baca chat ini.">Ada masalah (sengketa)</button>`,
      5: () => `<p class="label">Tahap 5 dari 5</p><h3>Pesanan selesai</h3><p>${rekber ? "Admin mencairkan dana ke penjual. " : ""}Angka terjual penjual ini ikut nambah, dan rating toko bisa diisi (kalau backend jadi).</p>`,
    };
    const hiNote = () => (window.isHigh(total) && !rekber && stage < 3)
      ? `<p class="hialert"><strong>Item high tier.</strong> Disarankan pakai rekber admin biar lebih aman dari scam.</p>` : "";
    const paintPanel = () => { $("[data-panel]").innerHTML = hiNote() + panel[stage](); if (stage === 2 && !pay && !payBusy) startPay(); };
    const paintChat = () => {
      const list = script().filter((m) => m.at <= stage).concat(mine.filter((m) => m.at <= stage));
      const box = $("[data-msgs]");
      box.innerHTML = list.map((m) => `<div class="msg msg--${m.w}"><small>${esc(who[m.w])}</small>${esc(m.t)}</div>`).join("");
      box.scrollTop = box.scrollHeight;
    };
    const paint = () => { paintSteps(); paintPanel(); paintChat(); };

    orderEl.addEventListener("click", (e) => {
      const st = e.target.closest("[data-stage]"); if (st) { stage = Number(st.dataset.stage); paint(); return; }
      const rk = e.target.closest("[data-rk]"); if (rk) { rekber = rk.dataset.rk === "1"; paint(); return; }
      if (e.target.closest("[data-pay-new]")) { startPay(true); return; }
      const act = e.target.closest("[data-act]"); if (act) toast(act.dataset.act);
    });
    const send = () => {
      const inp = $("[data-msg]"), t = inp.value.trim(); if (!t) return;
      mine.push({ at: stage, w: "b", t }); inp.value = ""; paintChat();
    };
    $("[data-send]").addEventListener("click", send);
    $("[data-msg]").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); send(); } });
    paint();
  }
})();
