/* adopt.mart — login/daftar. Cuma jalan di login.html.
   MODE CONTOH (belum ada server): akun manual disimpan di localStorage browser ini.
     am-users   = { "email": { name, salt, hash } }   (password di-hash PBKDF2, bukan teks polos)
     am-session = { name, email, provider }            (biar nggak login terus; hapus pas "Keluar")
   Google lewat Firebase aktif kalau window.FIREBASE_CONFIG (data.js) diisi. Saat backend jadi, ganti bagian
   "akun manual" dengan fetch ke server dan hapus am-users. */
(() => {
  "use strict";
  const box = document.querySelector("[data-auth]");
  if (!box) return;
  const $ = (s, r = box) => r.querySelector(s);
  const $$ = (s, r = box) => [...r.querySelectorAll(s)];

  const toast = (m) => {
    const t = document.querySelector(".toast"); if (!t) return;
    t.textContent = m; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 4200);
  };

  /* ---- penyimpanan (localStorage bisa gagal di mode privat, jadi selalu try/catch) ---- */
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const drop = (k) => { try { localStorage.removeItem(k); } catch (e) {} };

  /* ---- hash password ---- */
  const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const hashPw = async (pw, saltHex) => {
    const enc = new TextEncoder();
    const salt = Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16)));
    const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
    return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256));
  };
  const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)));

  /* ---- tampilan ---- */
  const show = (u) => {
    $("[data-login]").hidden = !!u;
    $("[data-who]").hidden = !u;
    if (!u) return;
    $("[data-name]").textContent = u.name;
    $("[data-mail]").textContent = u.email || "";
    $("[data-av]").textContent = (u.name[0] || "?").toUpperCase();
  };
  const setSession = (u) => { save("am-session", u); show(u); };

  const setErr = (form, msg, field) => {
    const el = $("[data-err]", form);
    $$("input", form).forEach((i) => i.classList.remove("is-invalid"));
    if (!msg) { el.hidden = true; el.textContent = ""; return; }
    el.textContent = msg; el.hidden = false;
    const inp = field && $(`[name="${field}"]`, form);
    if (inp) { inp.classList.add("is-invalid"); inp.focus(); }
  };

  /* ---- tab Masuk / Daftar ---- */
  const forms = { login: $('[data-form="login"]'), register: $('[data-form="register"]') };
  const copy = {
    login: ["Masuk ke adopt.mart", "Masukin email dan password akun lu."],
    register: ["Bikin akun adopt.mart", "Isi data di bawah. Cuma butuh semenit."],
  };
  const tab = (t) => {
    $$("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === t)));
    Object.keys(forms).forEach((k) => { forms[k].hidden = k !== t; setErr(forms[k]); });
    $("[data-title]").textContent = copy[t][0]; $("[data-sub]").textContent = copy[t][1];
  };
  $$("[data-tab]").forEach((b) => b.addEventListener("click", () => tab(b.dataset.tab)));

  const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  const val = (f, n) => (f.elements[n].value || "").trim();
  const busy = (f, on) => { const b = $('[type="submit"]', f); b.disabled = on; };
  const needCrypto = () => {
    if (window.crypto && crypto.subtle) return true;
    toast("Browser ini nggak mendukung penyimpanan aman. Buka lewat https atau localhost.");
    return false;
  };

  /* ---- Daftar ---- */
  forms.register.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = forms.register, name = val(f, "name"), email = val(f, "email").toLowerCase();
    const pw = f.elements.password.value, pw2 = f.elements.password2.value;
    if (!name) return setErr(f, "Nama belum diisi.", "name");
    if (!email) return setErr(f, "Email belum diisi.", "email");
    if (!emailOk(email)) return setErr(f, "Format email nggak bener. Contoh: nama@email.com", "email");
    if (!pw) return setErr(f, "Password belum diisi.", "password");
    if (pw.length < 6) return setErr(f, "Password minimal 6 karakter.", "password");
    if (pw !== pw2) return setErr(f, "Password dan ulangannya nggak sama.", "password2");
    const users = load("am-users", {});
    if (users[email]) return setErr(f, "Email ini udah terdaftar. Coba masuk aja.", "email");
    if (!needCrypto()) return;
    busy(f, true);
    try {
      const salt = newSalt();
      users[email] = { name, salt, hash: await hashPw(pw, salt) };
      if (!save("am-users", users)) return setErr(f, "Gagal nyimpen akun (penyimpanan browser diblokir).");
      setErr(f);
      f.reset();
      setSession({ name, email, provider: "email" });
      toast("Akun dibuat. Selamat datang, " + name.split(" ")[0] + "!");
    } finally { busy(f, false); }
  });

  /* ---- Masuk ---- */
  forms.login.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = forms.login, email = val(f, "email").toLowerCase(), pw = f.elements.password.value;
    if (!email) return setErr(f, "Email belum diisi.", "email");
    if (!emailOk(email)) return setErr(f, "Format email nggak bener. Contoh: nama@email.com", "email");
    if (!pw) return setErr(f, "Password belum diisi.", "password");
    if (!needCrypto()) return;
    busy(f, true);
    try {
      const u = load("am-users", {})[email];
      const ok = u && (await hashPw(pw, u.salt)) === u.hash;
      if (!ok) return setErr(f, "Email atau password salah.", "password");
      setErr(f);
      f.reset();
      setSession({ name: u.name, email, provider: "email" });
      toast("Berhasil masuk.");
    } finally { busy(f, false); }
  });

  /* ---- Keluar ---- */
  let fb;
  $("[data-signout]").addEventListener("click", async () => {
    drop("am-session");
    show(null); tab("login");
    if (fb) { try { await fb.signOut(fb.auth); } catch (e) {} }
  });

  /* ---- Google (Firebase) ---- */
  const cfg = window.FIREBASE_CONFIG || {};
  if (!cfg.apiKey) {
    $("[data-authsoon]").hidden = false;
    $("[data-google]").addEventListener("click", () => toast("Login Google belum disambungin ke Firebase (isi FIREBASE_CONFIG di data.js)."));
  } else {
    const loadFb = async () => {
      if (fb) return fb;
      const base = "https://www.gstatic.com/firebasejs/10.12.2/";
      const [app, auth] = await Promise.all([import(base + "firebase-app.js"), import(base + "firebase-auth.js")]);
      fb = { auth: auth.getAuth(app.initializeApp(cfg)), ...auth };
      return fb;
    };
    const fromFb = (user) => ({ name: user.displayName || (user.email || "").split("@")[0] || "Pengguna", email: user.email || "", provider: "google" });
    /* cuma nyimpen kalau ada user; kalau null jangan hapus sesi (bisa jadi sesi akun manual) */
    loadFb().then((f) => f.onAuthStateChanged(f.auth, (user) => { if (user) setSession(fromFb(user)); })).catch(() => {});
    $("[data-google]").addEventListener("click", async () => {
      try {
        const f = await loadFb(), provider = new f.GoogleAuthProvider();
        try { await f.signInWithPopup(f.auth, provider); }
        catch (e) {
          if (e.code === "auth/popup-blocked") { await f.signInWithRedirect(f.auth, provider); return; }
          if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") return;
          throw e;
        }
      } catch (e) { toast("Login Google gagal: " + (e.code || e.message)); }
    });
  }

  /* ---- awal: kalau udah pernah masuk, langsung tampil "udah masuk" ---- */
  const ses = load("am-session", null);
  show(ses && ses.name ? ses : null);
})();
