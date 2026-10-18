/* ============================================
   FEATURES: search, favourites, ratings,
   loyalty points, dark mode, WhatsApp
   ============================================ */

(function () {
  "use strict";

  const KEYS = {
    FAVS: "hm_cafe_favs",
    RATINGS: "hm_cafe_ratings",
    POINTS: "hm_cafe_points",
    THEME: "hm_cafe_theme",
    COOKIES: "hm_cafe_cookies",
    ORDERS: "hm_cafe_orders",
    RESERVATIONS: "hm_cafe_reservations",
  };

  /* ---------- STORAGE HELPERS ---------- */
  function read(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage failed", e);
    }
  }

  /* ============================================
       DARK MODE
       ============================================ */
  function initTheme() {
    const saved = read(KEYS.THEME, "light");
    if (saved === "dark") document.body.classList.add("dark-mode");

    const header = document.querySelector(".header-right");
    if (!header) return;

    let toggle = header.querySelector(".theme-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "theme-toggle";
      toggle.setAttribute("aria-label", "Toggle theme");
      toggle.innerHTML = '<i class="uil uil-moon"></i>';
      const cartBtn = header.querySelector(".header-cart");
      if (cartBtn) header.insertBefore(toggle, cartBtn);
      else header.appendChild(toggle);
    }

    updateIcon(toggle);
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      write(KEYS.THEME, isDark ? "dark" : "light");
      updateIcon(toggle);
    });
  }

  function updateIcon(btn) {
    const isDark = document.body.classList.contains("dark-mode");
    btn.innerHTML = isDark
      ? '<i class="uil uil-sun"></i>'
      : '<i class="uil uil-moon"></i>';
  }

  /* ============================================
       FAVOURITES
       ============================================ */
  function getFavs() {
    return read(KEYS.FAVS, []);
  }

  function saveFavs(arr) {
    write(KEYS.FAVS, arr);
  }

  function toggleFav(name) {
    const favs = getFavs();
    const idx = favs.indexOf(name);
    if (idx > -1) {
      favs.splice(idx, 1);
      saveFavs(favs);
      return false;
    }
    favs.push(name);
    saveFavs(favs);
    return true;
  }

  function bindFavourites() {
    document.querySelectorAll(".dish-box").forEach((box) => {
      if (box.querySelector(".fav-btn")) return;
      const name = box.querySelector(".h3-title")?.textContent.trim();
      if (!name) return;

      const btn = document.createElement("button");
      btn.className = "fav-btn";
      btn.setAttribute("aria-label", "Save to favourites");
      btn.innerHTML = '<i class="uil uil-heart"></i>';

      if (getFavs().includes(name)) {
        btn.classList.add("active");
        btn.querySelector("i").className = "uil uil-heart-alt";
      }

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const added = toggleFav(name);
        this.classList.toggle("active", added);
        this.querySelector("i").className = added
          ? "uil uil-heart-alt"
          : "uil uil-heart";
      });

      box.appendChild(btn);
    });
  }

  /* ============================================
       STAR RATINGS
       ============================================ */
  function getRatings() {
    return read(KEYS.RATINGS, {});
  }

  function bindRatings() {
    document.querySelectorAll(".dish-box").forEach((box) => {
      if (box.querySelector(".user-rating-wrap")) return;
      const name = box.querySelector(".h3-title")?.textContent.trim();
      if (!name) return;

      const ratings = getRatings();
      const current = ratings[name] || 0;

      const wrap = document.createElement("div");
      wrap.className = "user-rating-wrap";

      const stars = document.createElement("div");
      stars.className = "user-rating";
      stars.innerHTML = "";

      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("i");
        star.className =
          i <= current ? "uil uil-star selected" : "uil uil-star";
        star.dataset.value = i;
        star.addEventListener("click", function () {
          const value = parseInt(this.dataset.value, 10);
          const all = getRatings();
          all[name] = value;
          write(KEYS.RATINGS, all);
          wrap.querySelectorAll("i").forEach((s, idx) => {
            s.className =
              idx < value ? "uil uil-star selected" : "uil uil-star";
          });
          const label = wrap.querySelector(".user-rating-label");
          if (label) label.textContent = "Your rating: " + value + "/5";
        });
        stars.appendChild(star);
      }

      const label = document.createElement("span");
      label.className = "user-rating-label";
      label.textContent = current
        ? "Your rating: " + current + "/5"
        : "Tap to rate";

      wrap.appendChild(stars);
      wrap.appendChild(label);

      const titleEl = box.querySelector(".dish-title");
      if (titleEl && titleEl.nextSibling) {
        box.insertBefore(wrap, titleEl.nextSibling);
      } else if (titleEl) {
        titleEl.after(wrap);
      }
    });
  }

  /* ============================================
       LOYALTY POINTS
       ============================================ */
  function getPoints() {
    return read(KEYS.POINTS, 0);
  }

  function addPoints(n) {
    const total = getPoints() + n;
    write(KEYS.POINTS, total);
    renderLoyaltyWidget();
  }

  function renderLoyaltyWidget() {
    let widget = document.getElementById("loyaltyWidget");
    let toggle = document.getElementById("loyaltyToggle");

    const points = getPoints();
    const goal = 100;
    const pct = Math.min((points / goal) * 100, 100);
    const remaining = Math.max(goal - points, 0);

    if (!toggle) {
      toggle = document.createElement("button");
      toggle.id = "loyaltyToggle";
      toggle.className = "loyalty-toggle";
      toggle.setAttribute("aria-label", "Loyalty points");
      toggle.innerHTML = '<i class="uil uil-award"></i>';
      document.body.appendChild(toggle);
      toggle.addEventListener("click", () => {
        document.getElementById("loyaltyWidget")?.classList.toggle("show");
      });
    }

    if (!widget) {
      widget = document.createElement("div");
      widget.id = "loyaltyWidget";
      widget.className = "loyalty-widget";
      document.body.appendChild(widget);
    }

    widget.innerHTML = `
            <div class="loyalty-header">
                <h4>🏆 Loyalty Points</h4>
                <button class="loyalty-close" aria-label="Close">✕</button>
            </div>
            <div class="loyalty-points">
                <span class="pts-num">${points}</span>
                <span class="pts-label">points</span>
            </div>
            <div class="loyalty-bar"><div class="loyalty-bar-fill" style="width:${pct}%"></div></div>
            <p class="loyalty-msg">${
              remaining > 0
                ? `Earn <strong>${remaining}</strong> more points for a <strong>free koek!</strong>`
                : `🎉 You've unlocked a free koek! Show this at checkout.`
            }
            </p>
        `;

    widget.querySelector(".loyalty-close").addEventListener("click", () => {
      widget.classList.remove("show");
    });
  }

  /* ============================================
       LIVE SEARCH
       ============================================ */
  function initSearch() {
    const form = document.querySelector(".header-search-form.for-des");
    if (!form) return;

    const input = form.querySelector("input[type='search']");
    if (!input) return;

    form.addEventListener("submit", (e) => e.preventDefault());

    let dropdown = form.querySelector(".search-results");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-results";
      form.appendChild(dropdown);
    }

    const dishes = [];
    document.querySelectorAll(".dish-box").forEach((box) => {
      const name = box.querySelector(".h3-title")?.textContent.trim();
      const price = box.querySelector(".dist-bottom-row b")?.textContent.trim();
      const img = box.querySelector(".dist-img img")?.getAttribute("src");
      if (name && price) {
        dishes.push({ name, price, img, el: box });
      }
    });

    const fallbackDishes = [
      {
        name: "Sjokolade Koek",
        price: "R 125",
        img: "pictires/cakes/sjokolade.jpg",
      },
      {
        name: "Vanilla Koek",
        price: "R 115",
        img: "pictires/cakes/vanilla.jpg",
      },
      {
        name: "Hertzoggies",
        price: "R 72",
        img: "pictires/last3/Hertzoggies.jpg",
      },
      { name: "Melktert", price: "R 50", img: "pictires/terte/melk.jpg" },
      { name: "Samoosas", price: "R 72", img: "pictires/resized/samoosas.jpg" },
      {
        name: "Red Velvet Koek",
        price: "R 220",
        img: "pictires/cakes/red velvet.jpg",
      },
      {
        name: "Karringmelkbeskuit",
        price: "R 50",
        img: "pictires/beskuit/karring.jpg",
      },
      {
        name: "Soet Platter",
        price: "R 360",
        img: "pictires/platters/soet platter.jpg",
      },
    ];

    const searchPool = dishes.length > 3 ? dishes : fallbackDishes;

    let timer;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      const q = this.value.trim().toLowerCase();

      if (q.length < 2) {
        dropdown.classList.remove("active");
        return;
      }

      timer = setTimeout(() => {
        const matches = searchPool
          .filter((d) => d.name.toLowerCase().includes(q))
          .slice(0, 6);

        if (matches.length === 0) {
          dropdown.innerHTML = `<div class="search-no-results">No results for "${q}"</div>`;
        } else {
          dropdown.innerHTML = matches
            .map(
              (m) => `
                        <a href="Menu.html" class="search-result-item" data-name="${m.name}">
                            <img src="${m.img}" alt="${m.name}" loading="lazy">
                            <div class="sr-info">
                                <p class="sr-name">${m.name}</p>
                                <span class="sr-price">${m.price}</span>
                            </div>
                        </a>
                    `,
            )
            .join("");
        }
        dropdown.classList.add("active");
      }, 200);
    });

    document.addEventListener("click", (e) => {
      if (!form.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") dropdown.classList.remove("active");
    });
  }

  /* ============================================
       MENU FILTER FROM ?q= PARAM
       ============================================ */
  function filterMenuFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (!q) return;

    const searchInput = document.querySelector(".header-search-form input");
    if (searchInput) searchInput.value = q;

    setTimeout(() => {
      document.querySelectorAll(".dish-box-wp").forEach((box) => {
        const name =
          box.querySelector(".h3-title")?.textContent.toLowerCase() || "";
        const match = name.includes(q.toLowerCase());
        box.style.display = match ? "" : "none";
      });
    }, 400);
  }

  /* ============================================
       WHATSAPP BUTTON  ✅ NUMBER UPDATED
       ============================================ */
  function initWhatsApp() {
    if (document.querySelector(".whatsapp-btn")) return;
    const a = document.createElement("a");
    a.href =
      "https://wa.me/27729242639?text=Hi%20H%26M%20Cafe!%20I'd%20like%20to%20place%20an%20order.";
    a.className = "whatsapp-btn";
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("aria-label", "Order on WhatsApp");
    a.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    document.body.appendChild(a);
  }

  /* ============================================
       COOKIE BANNER
       ============================================ */
  function initCookieBanner() {
    if (read(KEYS.COOKIES, null) !== null) return;

    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.innerHTML = `
            <p>🍪 We use cookies to improve your experience. 
               <a href="#">Learn more</a></p>
            <div class="cookie-actions">
                <button class="cookie-btn cookie-decline">Decline</button>
                <button class="cookie-btn cookie-accept">Accept</button>
            </div>
        `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add("show"), 1000);

    banner.querySelector(".cookie-accept").addEventListener("click", () => {
      write(KEYS.COOKIES, "accepted");
      banner.classList.remove("show");
    });
    banner.querySelector(".cookie-decline").addEventListener("click", () => {
      write(KEYS.COOKIES, "declined");
      banner.classList.remove("show");
    });
  }

  /* ============================================
       HOOK ADD-TO-CART → LOYALTY POINTS
       ============================================ */
  function hookAddToCart() {
    document.addEventListener(
      "click",
      function (e) {
        const btn = e.target.closest(".dish-add-btn");
        if (!btn) return;
        const dishBox = btn.closest(".dish-box");
        if (!dishBox) return;
        const priceText =
          dishBox.querySelector(".dist-bottom-row b")?.textContent || "0";
        const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;
        addPoints(Math.max(1, Math.floor(price / 10)));
      },
      true,
    );
  }

  /* ============================================
       INIT
       ============================================ */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    bindFavourites();
    bindRatings();
    renderLoyaltyWidget();
    initSearch();
    initWhatsApp();
    initCookieBanner();
    hookAddToCart();
    filterMenuFromUrl();
  });

  window.HMFeatures = {
    getFavs,
    getRatings,
    getPoints,
    addPoints,
  };
})();
