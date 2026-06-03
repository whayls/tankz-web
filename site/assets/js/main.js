/* TANKZ — shared interactions (null-safe, multi-page) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var body = document.body;
  var header = document.getElementById("header");
  var scrim = document.getElementById("scrim");

  /* ---------- Sticky header: solid after hero, or always on inner pages ---------- */
  if (header) {
    if (header.getAttribute("data-solid") === "always") {
      header.classList.add("is-solid");
    } else {
      var onScroll = function () {
        if (window.scrollY > 60) header.classList.add("is-solid");
        else header.classList.remove("is-solid");
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---------- Off-canvas (cart + mobile menu) ---------- */
  var openPanel = null;
  function open(panel) {
    if (!panel || !panel.el) return;
    if (openPanel) openPanel.el.classList.remove("is-open");
    panel.el.classList.add("is-open");
    panel.el.setAttribute("aria-hidden", "false");
    if (scrim) scrim.classList.add("is-open");
    body.classList.add("is-locked");
    openPanel = panel;
    var f = panel.el.querySelector("button, a, input");
    if (f) f.focus();
  }
  function close() {
    if (!openPanel) return;
    openPanel.el.classList.remove("is-open");
    openPanel.el.setAttribute("aria-hidden", "true");
    if (scrim) scrim.classList.remove("is-open");
    body.classList.remove("is-locked");
    if (openPanel.trigger) openPanel.trigger.focus();
    openPanel = null;
  }
  var cart = { el: document.getElementById("cart-drawer"), trigger: document.getElementById("open-cart") };
  var menu = { el: document.getElementById("mobile-menu"), trigger: document.getElementById("open-menu") };

  function on(id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); }
  on("open-cart", "click", function () { open(cart); });
  on("close-cart", "click", close);
  on("open-menu", "click", function () { open(menu); });
  on("close-menu", "click", close);
  if (scrim) scrim.addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  $$("#mobile-menu a").forEach(function (a) { a.addEventListener("click", close); });
  on("cart-shop", "click", close);
  if (location.hash === "#cart") open(cart);
  if (location.hash === "#menu") open(menu);

  /* ---------- Scroll reveals ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = $$(".reveal, .reveal-stagger");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Newsletter (homepage only) ---------- */
  var form = document.getElementById("news-form");
  if (form) {
    var email = document.getElementById("news-email");
    var msg = document.getElementById("news-msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        msg.textContent = "Please enter a valid email address.";
        msg.style.color = "var(--charcoal)";
        email.focus(); return;
      }
      form.innerHTML = '<p style="font-family:var(--font-display);text-transform:uppercase;font-size:1.4rem">You’re on the list.</p><p class="news-fine">Watch your inbox for first access to the drop.</p>';
    });
  }

  /* ---------- PDP: gallery thumbnails ---------- */
  var mainImg = document.getElementById("pdp-main-img");
  if (mainImg) {
    var thumbs = $$(".pdp-thumb");
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        var full = t.getAttribute("data-full");
        if (full) { mainImg.src = full; mainImg.alt = t.getAttribute("data-alt") || ""; }
        thumbs.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-current", "false"); });
        t.classList.add("is-active"); t.setAttribute("aria-current", "true");
      });
    });
  }

  /* ---------- PDP: option selectors (colour, size) ---------- */
  $$("[data-select-group]").forEach(function (group) {
    var opts = $$("[data-option]", group);
    opts.forEach(function (opt) {
      opt.addEventListener("click", function () {
        if (opt.hasAttribute("disabled")) return;
        opts.forEach(function (o) { o.classList.remove("is-selected"); o.setAttribute("aria-pressed", "false"); });
        opt.classList.add("is-selected"); opt.setAttribute("aria-pressed", "true");
        var targetId = group.getAttribute("data-label-target");
        if (targetId) { var t = document.getElementById(targetId); if (t) t.textContent = opt.getAttribute("data-value") || opt.textContent.trim(); }
      });
    });
  });

  /* ---------- PDP: quantity ---------- */
  var qty = document.getElementById("pdp-qty");
  if (qty) {
    on("qty-dec", "click", function () { qty.textContent = Math.max(1, (parseInt(qty.textContent, 10) || 1) - 1); });
    on("qty-inc", "click", function () { qty.textContent = Math.min(9, (parseInt(qty.textContent, 10) || 1) + 1); });
  }

  /* ---------- Accordions (PDP details) ---------- */
  $$(".acc-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".acc-item");
      var isOpen = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  /* ---------- PDP: add to cart ---------- */
  var addBtn = document.getElementById("pdp-add");
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      var n = parseInt(qty ? qty.textContent : "1", 10) || 1;
      var name = addBtn.getAttribute("data-name") || "Tank";
      var price = addBtn.getAttribute("data-price") || "";
      var img = addBtn.getAttribute("data-img") || "";
      var color = (document.getElementById("sel-color") || {}).textContent || "";
      var size = (document.getElementById("sel-size") || {}).textContent || "";
      $$(".cart-count").forEach(function (c) { c.textContent = n; c.style.display = "grid"; });
      var bodyEl = document.querySelector("#cart-drawer .drawer-body");
      if (bodyEl) {
        bodyEl.innerHTML =
          '<div class="cart-line">' +
            '<span class="cart-line__media"><img src="' + img + '" alt=""></span>' +
            '<div class="cart-line__info">' +
              '<span class="cart-line__name">' + name + '</span>' +
              '<span class="cart-line__meta">' + color + (size ? ' &middot; Size ' + size : '') + '</span>' +
              '<span class="cart-line__meta">Qty ' + n + '</span>' +
            '</div>' +
            '<span class="cart-line__price">' + price + '</span>' +
          '</div>' +
          '<p class="cart-note">Complimentary shipping unlocked. Taxes calculated at checkout.</p>';
      }
      var checkout = document.querySelector("#cart-drawer .drawer-foot .btn");
      if (checkout) { checkout.removeAttribute("disabled"); checkout.textContent = "Checkout · " + price; }
      open(cart);
    });
  }

  /* ---------- Shop: filter chips + sort (prototype-level) ---------- */
  on("filter-toggle", "click", function () {
    var panel = document.getElementById("filter-panel");
    var t = document.getElementById("filter-toggle");
    if (panel) {
      var openNow = panel.classList.toggle("is-open");
      if (t) t.setAttribute("aria-expanded", openNow ? "true" : "false");
    }
  });
  $$(".filter-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      chip.classList.toggle("is-on");
      chip.setAttribute("aria-pressed", chip.classList.contains("is-on") ? "true" : "false");
    });
  });

  /* ---------- Contact form (contact page only) ---------- */
  var cform = document.getElementById("contact-form");
  if (cform) {
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cf-name");
      var email = document.getElementById("cf-email");
      var message = document.getElementById("cf-msg");
      var status = document.getElementById("cf-status");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email.value || "").trim());
      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        if (status) status.textContent = "Please add your name, a valid email, and a message.";
        (!name.value.trim() ? name : (!emailOk ? email : message)).focus();
        return;
      }
      var safeName = name.value.trim().replace(/[<>&"]/g, "");
      cform.innerHTML = '<div class="cf-success"><h2>Message sent.</h2><p>Thanks for reaching out, ' +
        safeName + '. We’ll get back to you within one business day.</p></div>';
    });
  }
})();
