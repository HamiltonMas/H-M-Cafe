/* ============================================
   ORDERS: checkout flow + order history
   FIXED: checkout modal now appears above
   the cart drawer and cart closes first
   ============================================ */

(function () {
  "use strict";

  const ORDERS_KEY = "hm_cafe_orders";

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function generateOrderId() {
    const d = new Date();
    const stamp =
      d.getFullYear().toString().slice(2) +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return "HM" + stamp + "-" + rand;
  }

  /* ---------- HOOK CHECKOUT BUTTON ---------- */
  function hookCheckout() {
    const observer = new MutationObserver(() => {
      const checkoutBtn = document.getElementById("checkoutBtn");
      if (checkoutBtn && !checkoutBtn.dataset.ordersHooked) {
        checkoutBtn.dataset.ordersHooked = "1";
        const newBtn = checkoutBtn.cloneNode(true);
        checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
        newBtn.addEventListener("click", handleCheckout);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- MAIN CHECKOUT FLOW ---------- */
  function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem("hm_cafe_cart") || "[]");
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    /* ✅ STEP 1: Close the cart drawer FIRST so the checkout card is visible */
    if (window.HMCart && typeof window.HMCart.close === "function") {
      window.HMCart.close();
    } else {
      const drawer = document.getElementById("cartDrawer");
      const overlay = document.getElementById("cartOverlay");
      if (drawer) drawer.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
    }
    // Restore body scroll briefly so the modal can lock it again cleanly
    document.body.style.overflow = "";

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    /* ✅ STEP 2: Delay so drawer slide-out animation finishes */
    setTimeout(() => {
      const modal = document.createElement("div");
      modal.className = "product-modal-overlay active";
      modal.style.zIndex = "10001"; // ✅ above cart drawer (9999)
      modal.innerHTML = `
                <div class="product-modal active" style="max-width:520px;z-index:10002;">
                    <button class="product-modal-close" id="coClose" aria-label="Close">✕</button>
                    <div style="padding:40px;">
                        <h2 style="font-family:'Playfair Display',serif;font-size:26px;margin:0 0 10px;color:#0d0d25;">
                            Complete Your Order
                        </h2>
                        <p style="color:#666;font-size:14px;margin-bottom:25px;">
                            Choose pickup or delivery.
                        </p>
                        <div style="display:grid;gap:15px;">
                            <div>
                                <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#0d0d25;display:block;margin-bottom:6px;">
                                    Full Name
                                </label>
                                <input id="coName" type="text" placeholder="Your name"
                                    style="width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:14px;">
                            </div>
                            <div>
                                <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#0d0d25;display:block;margin-bottom:6px;">
                                    Phone
                                </label>
                                <input id="coPhone" type="tel" placeholder="072 924 2639"
                                    style="width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:14px;">
                            </div>
                            <div>
                                <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#0d0d25;display:block;margin-bottom:6px;">
                                    Pickup or Delivery
                                </label>
                                <select id="coType"
                                    style="width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:14px;background:#fff;">
                                    <option value="pickup">Pickup (Free)</option>
                                    <option value="delivery">Delivery (R 40)</option>
                                </select>
                            </div>
                            <div id="coAddrWrap" style="display:none;">
                                <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#0d0d25;display:block;margin-bottom:6px;">
                                    Delivery Address
                                </label>
                                <textarea id="coAddr" placeholder="Street, area, landmark"
                                    style="width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:14px;min-height:70px;resize:none;"></textarea>
                            </div>
                            <div style="background:#f8f8f8;padding:16px;border-radius:12px;margin-top:5px;">
                                <div style="display:flex;justify-content:space-between;font-size:14px;color:#666;margin-bottom:6px;">
                                    <span>Subtotal</span>
                                    <span>R ${total.toFixed(2)}</span>
                                </div>
                                <div id="coDeliveryRow" style="display:none;justify-content:space-between;font-size:14px;color:#666;margin-bottom:6px;">
                                    <span>Delivery</span>
                                    <span>R 40.00</span>
                                </div>
                                <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#0d0d25;padding-top:10px;border-top:1px dashed #ddd;">
                                    <span>Total</span>
                                    <span id="coTotal" style="color:#ff8243;font-family:'Playfair Display',serif;font-size:22px;">R ${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <button id="coSubmit"
                                style="padding:16px;border:none;border-radius:30px;background:linear-gradient(145deg,#ffc954,#ffbc00);color:#fff;font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;box-shadow:0 10px 25px rgba(255,188,0,.35);">
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(modal);
      document.body.style.overflow = "hidden";

      // ✅ Autofocus name field
      setTimeout(() => modal.querySelector("#coName")?.focus(), 100);

      const closeBtn = modal.querySelector("#coClose");
      const typeSel = modal.querySelector("#coType");
      const addrWrap = modal.querySelector("#coAddrWrap");
      const deliveryRow = modal.querySelector("#coDeliveryRow");
      const totalEl = modal.querySelector("#coTotal");

      function closeModal() {
        modal.remove();
        document.body.style.overflow = "";
      }

      closeBtn.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });

      typeSel.addEventListener("change", function () {
        const isDelivery = this.value === "delivery";
        addrWrap.style.display = isDelivery ? "block" : "none";
        deliveryRow.style.display = isDelivery ? "flex" : "none";
        const newTotal = total + (isDelivery ? 40 : 0);
        totalEl.textContent = "R " + newTotal.toFixed(2);
      });

      modal.querySelector("#coSubmit").addEventListener("click", function () {
        const name = modal.querySelector("#coName").value.trim();
        const phone = modal.querySelector("#coPhone").value.trim();
        const type = typeSel.value;
        const address = modal.querySelector("#coAddr").value.trim();

        if (!name || !phone) {
          alert("Please enter your name and phone number.");
          return;
        }
        if (type === "delivery" && !address) {
          alert("Please enter your delivery address.");
          return;
        }

        const deliveryFee = type === "delivery" ? 40 : 0;
        const grandTotal = total + deliveryFee;

        const order = {
          id: generateOrderId(),
          date: new Date().toISOString(),
          customer: { name, phone, type, address },
          items: cart,
          subtotal: total,
          delivery: deliveryFee,
          total: grandTotal,
          status: "pending",
        };

        const orders = getOrders();
        orders.unshift(order);
        saveOrders(orders);

        localStorage.setItem("hm_cafe_cart", "[]");
        if (window.HMCart) window.HMCart.clear();

        closeModal();
        showSuccess(order);
      });
    }, 250);
  }

  /* ---------- SUCCESS MODAL ---------- */
  function showSuccess(order) {
    const overlay = document.createElement("div");
    overlay.className = "product-modal-overlay active";
    overlay.style.zIndex = "10005"; // ✅ above everything
    overlay.innerHTML = `
            <div class="product-modal active" style="max-width:480px;text-align:center;z-index:10006;">
                <div style="padding:50px 35px;">
                    <div style="font-size:70px;margin-bottom:15px;">🎉</div>
                    <h2 style="font-family:'Playfair Display',serif;font-size:26px;margin:0 0 10px;color:#0d0d25;">
                        Order Received!
                    </h2>
                    <p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:20px;">
                        Thanks <strong>${order.customer.name}</strong>! Your order
                        <strong>${order.id}</strong> has been placed.
                        We'll call you on <strong>${order.customer.phone}</strong> when it's ready.
                    </p>
                    <div style="background:#f8f8f8;padding:15px;border-radius:12px;margin-bottom:20px;font-size:14px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                            <span>Total</span>
                            <strong style="color:#ff8243;">R ${order.total.toFixed(2)}</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span>Type</span>
                            <strong style="text-transform:capitalize;">${order.customer.type}</strong>
                        </div>
                    </div>
                    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                        <a href="Orders.html" style="padding:12px 24px;background:linear-gradient(145deg,#ffc954,#ffbc00);color:#fff;border-radius:30px;text-decoration:none;font-weight:700;font-size:14px;">
                            View My Orders
                        </a>
                        <button onclick="this.closest('.product-modal-overlay').remove();document.body.style.overflow='';"
                            style="padding:12px 24px;background:#fff;color:#0d0d25;border:2px solid #eee;border-radius:30px;font-weight:700;font-size:14px;cursor:pointer;">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        `;
    document.body.appendChild(overlay);
  }

  /* ---------- ORDERS PAGE RENDERING ---------- */
  function renderOrdersPage() {
    const list = document.getElementById("ordersList");
    if (!list) return;

    const orders = getOrders();

    if (orders.length === 0) {
      list.innerHTML = `
                <div class="orders-empty">
                    <i class="uil uil-receipt"></i>
                    <h3>No orders yet</h3>
                    <p>Your order history will appear here.</p>
                    <a href="Menu.html" class="btn-primary">Browse Menu</a>
                </div>
            `;
      return;
    }

    list.innerHTML = orders
      .map((order) => {
        const date = new Date(order.date).toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        return `
                <div class="order-card">
                    <div class="order-head">
                        <div>
                            <div class="order-id">Order #${order.id}</div>
                            <div class="order-date">${date}</div>
                        </div>
                        <span class="order-status ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-items">
                        ${order.items
                          .map(
                            (item) => `
                            <div class="order-item">
                                <img src="${item.img}" alt="${item.name}" loading="lazy">
                                <div class="order-item-info">
                                    <p class="order-item-name">${item.name}</p>
                                    <span class="order-item-qty">Qty: ${item.qty}</span>
                                </div>
                                <span class="order-item-price">R ${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    <div class="order-foot">
                        <div>
                            <div class="order-total-label">Total</div>
                            <div class="order-total-amount">R ${order.total.toFixed(2)}</div>
                        </div>
                        <div class="order-actions">
                            <button class="order-btn" onclick="window.print()">Print</button>
                            <button class="order-btn" data-reorder="${order.id}">Reorder</button>
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");

    list.querySelectorAll("[data-reorder]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.reorder;
        const order = orders.find((o) => o.id === id);
        if (!order) return;
        const cart = order.items.map((i) => ({
          ...i,
          id: Date.now() + Math.random(),
        }));
        localStorage.setItem("hm_cafe_cart", JSON.stringify(cart));
        window.location.href = "Menu.html";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    hookCheckout();
    renderOrdersPage();
  });

  window.HMOrders = { getOrders };
})();
