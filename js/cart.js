/* ============================================
   CART SYSTEM - H&M Cafe
   Persists via localStorage across all pages
   ============================================ */

(function () {
  "use strict";

  const CART_KEY = "hm_cafe_cart";

  /* ---------- STORAGE ---------- */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function getTotalItems() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function getTotalPrice() {
    return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  /* ---------- BADGE ---------- */
  function updateCartCount() {
    const count = getTotalItems();
    let badge = document.querySelector(".cart-count");

    if (count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-count";
        const cartBtn = document.querySelector(".header-cart");
        if (cartBtn) cartBtn.appendChild(badge);
      }
      badge.textContent = count;
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
    } else if (badge) {
      badge.remove();
    }
  }

  /* ---------- DRAWER BUILD ---------- */
  function buildDrawer() {
    if (document.querySelector(".cart-drawer")) return;

    const drawerHTML = `
            <div class="cart-overlay" id="cartOverlay"></div>
            <aside class="cart-drawer" id="cartDrawer" aria-hidden="true">
                <div class="cart-header">
                    <h2>Your Cart</h2>
                    <button class="cart-close" id="cartClose" aria-label="Close cart">
                        <i class="uil uil-times"></i>
                    </button>
                </div>
                <div class="cart-items" id="cartItems"></div>
                <div class="cart-footer" id="cartFooter" style="display:none;">
                    <div class="cart-total-row">
                        <span>Subtotal</span>
                        <span id="cartSubtotal">R 0.00</span>
                    </div>
                    <div class="cart-total-row grand">
                        <span>Total</span>
                        <span id="cartGrandTotal">R 0.00</span>
                    </div>
                    <button class="btn-checkout" id="checkoutBtn">Checkout</button>
                </div>
            </aside>
            <div class="cart-toast" id="cartToast">
                <i class="uil uil-check-circle"></i>
                <span id="cartToastText">Added to cart</span>
            </div>
        `;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = drawerHTML;
    while (wrapper.firstChild) {
      document.body.appendChild(wrapper.firstChild);
    }

    document.getElementById("cartClose").addEventListener("click", closeDrawer);
    document
      .getElementById("cartOverlay")
      .addEventListener("click", closeDrawer);

    document.getElementById("checkoutBtn").addEventListener("click", () => {
      if (getTotalItems() === 0) return;
      alert(
        "Thank you! Your order has been placed.\n\nTotal: R " +
          getTotalPrice().toFixed(2) +
          "\n\n(Checkout demo — connect payment gateway here)",
      );
      saveCart([]);
      renderCart();
      closeDrawer();
    });

    renderCart();
  }

  /* ---------- RENDER ---------- */
  function renderCart() {
    const cart = getCart();
    const itemsBox = document.getElementById("cartItems");
    const footer = document.getElementById("cartFooter");
    if (!itemsBox) return;

    if (cart.length === 0) {
      itemsBox.innerHTML = `
                <div class="cart-empty">
                    <i class="uil uil-shopping-bag"></i>
                    <h3>Your cart is empty</h3>
                    <p>Browse our menu and add something delicious!</p>
                    <a href="Menu.html" class="btn-shop">View Menu</a>
                </div>
            `;
      if (footer) footer.style.display = "none";
      return;
    }

    itemsBox.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <div>
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">R ${item.price}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="cart-qty">
                            <button class="qty-minus" data-id="${item.id}" aria-label="Decrease">−</button>
                            <span>${item.qty}</span>
                            <button class="qty-plus" data-id="${item.id}" aria-label="Increase">+</button>
                        </div>
                        <button class="cart-remove" data-id="${item.id}" aria-label="Remove">
                            <i class="uil uil-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");

    if (footer) footer.style.display = "block";

    const subtotal = getTotalPrice();
    const subtotalEl = document.getElementById("cartSubtotal");
    const grandEl = document.getElementById("cartGrandTotal");
    if (subtotalEl) subtotalEl.textContent = "R " + subtotal.toFixed(2);
    if (grandEl) grandEl.textContent = "R " + subtotal.toFixed(2);

    itemsBox.querySelectorAll(".qty-plus").forEach((btn) => {
      btn.addEventListener("click", () => changeQty(btn.dataset.id, 1));
    });
    itemsBox.querySelectorAll(".qty-minus").forEach((btn) => {
      btn.addEventListener("click", () => changeQty(btn.dataset.id, -1));
    });
    itemsBox.querySelectorAll(".cart-remove").forEach((btn) => {
      btn.addEventListener("click", () => removeItem(btn.dataset.id));
    });
  }

  /* ---------- ACTIONS ---------- */
  function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeItem(id);
      return;
    }
    saveCart(cart);
    renderCart();
  }

  function removeItem(id) {
    const cart = getCart().filter((i) => i.id !== id);
    saveCart(cart);
    renderCart();
  }

  function addToCart(name, price, img, id) {
    if (!name || isNaN(price)) return;
    const cart = getCart();
    const existing = cart.find((i) => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: id || Date.now() + Math.random().toString(36).slice(2),
        name: name,
        price: parseFloat(price),
        img: img || "pictires/resized/placeholder.jpg",
        qty: 1,
      });
    }
    saveCart(cart);
    renderCart();
    showToast(name + " added to cart");
  }

  /* ---------- DRAWER ---------- */
  function openDrawer() {
    buildDrawer();
    renderCart();
    document.getElementById("cartDrawer").classList.add("active");
    document.getElementById("cartOverlay").classList.add("active");
    document.getElementById("cartDrawer").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    if (drawer) drawer.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    if (drawer) drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* ---------- TOAST ---------- */
  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById("cartToast");
    const text = document.getElementById("cartToastText");
    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  /* ---------- BIND + BUTTONS ---------- */
  function bindAddButtons() {
    document.querySelectorAll(".dish-add-btn").forEach((btn) => {
      if (btn.dataset.cartBound) return;
      btn.dataset.cartBound = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const dishBox = this.closest(".dish-box");
        if (!dishBox) return;
        const name =
          dishBox.querySelector(".h3-title")?.textContent.trim() || "";
        const priceText =
          dishBox.querySelector(".dist-bottom-row b")?.textContent.trim() || "";
        const price = parseFloat(priceText.replace(/[^\d.]/g, "")) || 0;
        const img =
          dishBox.querySelector(".dist-img img")?.getAttribute("src") || "";
        addToCart(name, price, img);
        this.classList.add("added");
        setTimeout(() => this.classList.remove("added"), 700);
      });
    });
  }

  /* ---------- INIT ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildDrawer();
    updateCartCount();
    bindAddButtons();

    document.querySelectorAll(".header-cart").forEach((cartBtn) => {
      cartBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openDrawer();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
  });

  /* ---------- PUBLIC API ---------- */
  window.HMCart = {
    add: addToCart,
    open: openDrawer,
    close: closeDrawer,
    clear: () => {
      saveCart([]);
      renderCart();
    },
    getItems: getCart,
    getCount: getTotalItems,
    getTotal: getTotalPrice,
  };
})();
