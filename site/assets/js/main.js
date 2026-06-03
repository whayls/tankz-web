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

  /* ---------- Cart (shared by PDP add + quick add) ---------- */
  var cartItems = [];
  function parsePrice(s) { var m = (s || "").replace(/[^0-9.]/g, ""); return parseFloat(m) || 0; }
  function money(n) { return "$" + (n % 1 ? n.toFixed(2) : n.toFixed(0)); }
  function esc(s) { return (s || "").replace(/[<>&"]/g, ""); }

  function renderCart() {
    var totalQty = cartItems.reduce(function (s, i) { return s + i.qty; }, 0);
    var subtotal = cartItems.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
    $$(".cart-count").forEach(function (c) { c.textContent = totalQty; });
    var drawerBody = document.querySelector("#cart-drawer .drawer-body");
    var checkout = document.querySelector("#cart-drawer .drawer-foot .btn");
    if (!drawerBody || !cartItems.length) return;
    var rows = cartItems.map(function (i) {
      return '<div class="cart-line">' +
        '<span class="cart-line__media"><img src="' + i.img + '" alt=""></span>' +
        '<div class="cart-line__info">' +
          '<span class="cart-line__name">' + esc(i.name) + '</span>' +
          (i.meta ? '<span class="cart-line__meta">' + esc(i.meta) + '</span>' : '') +
          '<span class="cart-line__meta">Qty ' + i.qty + '</span>' +
        '</div>' +
        '<span class="cart-line__price">' + money(i.price * i.qty) + '</span>' +
      '</div>';
    }).join("");
    drawerBody.innerHTML = rows + '<p class="cart-note">Complimentary shipping unlocked. Taxes calculated at checkout.</p>';
    if (checkout) { checkout.removeAttribute("disabled"); checkout.textContent = "Checkout · " + money(subtotal); }
  }

  function addToCart(item) {
    var match = cartItems.filter(function (i) { return i.name === item.name && i.meta === item.meta; })[0];
    if (match) match.qty += item.qty; else cartItems.push(item);
    renderCart();
    open(cart);
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

  /* ---------- Accordions (PDP details + contact FAQ) ---------- */
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
      var color = (document.getElementById("sel-color") || {}).textContent || "";
      var size = (document.getElementById("sel-size") || {}).textContent || "";
      addToCart({
        name: addBtn.getAttribute("data-name") || "Tank",
        price: parsePrice(addBtn.getAttribute("data-price")),
        img: addBtn.getAttribute("data-img") || "",
        meta: color + (size ? " · Size " + size : ""),
        qty: n
      });
    });
  }

  /* ---------- Quick add (product cards on home + shop) ---------- */
  $$(".product-quickadd").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      var c = btn.closest(".product-card");
      if (!c) return;
      var name = ((c.querySelector(".product-card__name") || {}).textContent || "Tank").trim();
      var price = parsePrice((c.querySelector(".product-card__price") || {}).textContent);
      var imgEl = c.querySelector(".product-card__media img");
      var img = imgEl ? imgEl.getAttribute("src") : "";
      var parts = name.split("—");
      var meta = (parts.length > 1 ? parts[1].trim() + " · " : "") + "Size M";
      addToCart({ name: name, price: price, img: img, meta: meta, qty: 1 });
      var orig = btn.textContent;
      btn.textContent = "Added ✓";
      setTimeout(function () { btn.textContent = orig; }, 1200);
    });
  });

  /* ---------- Shop: filter panel toggle + style chips (visual) ---------- */
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

  /* ---------- Shop: gender filter + pagination ---------- */
  var grid = document.querySelector(".product-grid");
  if (grid) {
    var PAGE = 8;
    var productCards = $$(".product-card", grid);
    var feature = grid.querySelector(".grid-feature");
    var genderBtns = $$(".gender-btn");
    var loadWrap = document.querySelector(".load-more");
    var loadBtn = document.getElementById("load-more-btn");
    var metaEl = document.querySelector(".load-more__meta");
    var countEl = document.querySelector(".shop-head__count");
    var heading = document.querySelector(".shop-head h1");
    var gender = "all", shown = PAGE;

    function matched() {
      return productCards.filter(function (c) {
        return gender === "all" || c.getAttribute("data-gender") === gender;
      });
    }
    function render() {
      var list = matched();
      productCards.forEach(function (c) { c.style.display = "none"; });
      list.slice(0, shown).forEach(function (c) { c.style.display = ""; });
      if (feature) feature.style.display = (gender === "all") ? "" : "none";
      var total = list.length, visible = Math.min(shown, total);
      if (metaEl) metaEl.textContent = "Showing " + visible + " of " + total;
      if (countEl) countEl.textContent = total + (total === 1 ? " Product" : " Products");
      if (loadWrap) loadWrap.style.display = (visible < total) ? "" : "none";
    }
    function setGender(g, updateUrl) {
      gender = (g === "men" || g === "women") ? g : "all";
      shown = PAGE;
      genderBtns.forEach(function (b) {
        var act = b.getAttribute("data-gender") === gender;
        b.classList.toggle("is-active", act);
        b.setAttribute("aria-pressed", act ? "true" : "false");
      });
      if (heading) heading.textContent = gender === "men" ? "Men’s Tanks" : gender === "women" ? "Women’s Tanks" : "All Tanks";
      $$(".nav-link").forEach(function (a) {
        var href = a.getAttribute("href") || "";
        if (gender !== "all" && href.indexOf("gender=" + gender) > -1) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      if (updateUrl) {
        var u = gender === "all" ? location.pathname : location.pathname + "?gender=" + gender;
        try { history.replaceState(null, "", u); } catch (err) {}
      }
      render();
    }
    genderBtns.forEach(function (b) {
      b.addEventListener("click", function () { setGender(b.getAttribute("data-gender"), true); });
    });
    if (loadBtn) loadBtn.addEventListener("click", function () { shown += PAGE; render(); });
    var g0 = null;
    try { g0 = new URLSearchParams(location.search).get("gender"); } catch (e) {}
    setGender(g0, false);
  }

  /* ---------- Contact form (contact page only) ---------- */
  var cform = document.getElementById("contact-form");
  if (cform) {
    cform.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("cf-name");
      var email2 = document.getElementById("cf-email");
      var message = document.getElementById("cf-msg");
      var status = document.getElementById("cf-status");
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email2.value || "").trim());
      if (!name.value.trim() || !emailOk || !message.value.trim()) {
        if (status) status.textContent = "Please add your name, a valid email, and a message.";
        (!name.value.trim() ? name : (!emailOk ? email2 : message)).focus();
        return;
      }
      var safeName = name.value.trim().replace(/[<>&"]/g, "");
      cform.innerHTML = '<div class="cf-success"><h2>Message sent.</h2><p>Thanks for reaching out, ' +
        safeName + '. We’ll get back to you within one business day.</p></div>';
    });
  }
})();
