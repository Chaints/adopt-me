/* adopt.mart — animasi masuk (muncul + mantul) pas halaman dibuka & pas di-scroll.
   Cara kerja: elemen di daftar SEL disembunyiin dulu (lewat CSS, kelas "js" di <html>),
   begitu kelihatan di layar dikasih kelas "in" -> animasi "pop-in" jalan (lihat blok ANIMASI di market.css).
   Mau nambah elemen yang ikut animasi? Tambah selektornya di SEL di sini DAN di daftar :is(...) di market.css. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("js")) return;               // gerak dimatiin (atau script head nggak jalan): tampil biasa
  if (!("IntersectionObserver" in window)) { root.classList.remove("js"); return; }

  var SEL = ".mhero__text, .shead, .cat, .tcard, .stepsbg, .step3, .sellcta, .toolbar, .idetail__art, .buybox, .ocard, .chat";

  var io = new IntersectionObserver(function (entries) {
    var vis = entries.filter(function (e) { return e.isIntersecting; });
    vis.sort(function (a, b) {                              // urut atas->bawah, kiri->kanan biar munculnya berurutan
      var ra = a.boundingClientRect, rb = b.boundingClientRect;
      return ra.top - rb.top || ra.left - rb.left;
    });
    vis.forEach(function (e, n) {
      e.target.style.setProperty("--d", Math.min(n, 5) * 80 + "ms");
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  document.querySelectorAll(SEL).forEach(function (el) { io.observe(el); });
  root.classList.add("motion-ready");                       // tanda ke script di <head>: gerak aman, jangan dimatiin
})();
