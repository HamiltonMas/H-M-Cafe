/* ============================================
   PRODUCT DETAIL MODAL
   Opens when a dish image is clicked
   ============================================ */

(function () {
  "use strict";

  const DISH_DESC = {
    Sjokolade:
      "Rich, moist chocolate cake made with real butter and Belgian cocoa.",
    Vanilla: "Classic vanilla sponge with fresh cream and vanilla essence.",
    Hertzoggies: "Traditional South African coconut-topped jam tartlets.",
    Melktert: "Creamy cinnamon-dusted milk tart — a true SA classic.",
    Samoosas: "Crispy pastry triangles filled with spiced savoury mince.",
    "Red Velvet": "Velvety red sponge with tangy cream cheese frosting.",
    "Soet Platter":
      "A generous selection of our best sweet treats — perfect for sharing.",
    Karringmelkbeskuit:
      "Crunchy buttermilk rusks — perfect with coffee or tea.",
    Worsrolletjies: "Savoury sausage rolls wrapped in golden pastry.",
    Spek: "Crispy bacon and cheese baked to golden perfection.",
    default:
      "Handcrafted fresh daily at H&M Cafe using traditional recipes and quality local ingredients.",
  };

  function getDesc(name) {
    for (const key in DISH_DESC) {
      if (name.toLowerCase().includes(key.toLowerCase())) return DISH_DESC[key];
    }
    return DISH_DESC.default;
  }

  function openProductModal(dishBox) {
    const name =
      dishBox.querySelector(".h3-title")?.textContent.trim() || "Item";
    const price =
      dishBox.querySelector(".dist-bottom-row b")?.textContent.trim() || "R 0";
    const img =
      dishBox.querySelector(".dist-img img")?.getAttribute("src") || "";
    const rating =
      dishBox.querySelector(".dish-rating")?.textContent.trim() || "5";

    const modal = document.createElement("div");
    modal.className = "product-modal-overlay";
    modal.innerHTML = `
            <div class="product-modal">
                <button class="product-modal-close" aria-label="Close">✕</button>
                <div class="pm-body">
                    <div class="pm-img">
                        <img src="${img}" alt="${name}">
                    </div>
                    <div class="pm-info">
                        <h2 class="pm-name">${name}</h2>
                        <div class="pm-rating">${rating} <i class="uil uil-star"></i></div>
                        <p class="pm-desc">${getDesc(name)}</p>
                        <div class="pm-price">${price}</div>
                        <div class="pm-actions">
                            <div class="pm-qty">
                                <button class="pm-minus">−</button>
                                <span class="pm-qty-num">1</span>
                                <button class="pm-plus">+</button>
                            </div>
                            <button class="pm-add">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add("active");
      modal.querySelector(".product-modal").classList.add("active");
    });

    function close() {
      modal.classList.remove("active");
      modal.querySelector(".product-modal").classList.remove("active");
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
      }, 300);
    }

    modal
      .querySelector(".product-modal-close")
      .addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener("keydown", function handler(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", handler);
      }
    });

    // Qty controls
    let qty = 1;
    const qtyNum = modal.querySelector(".pm-qty-num");
    modal.querySelector(".pm-plus").addEventListener("click", () => {
      qty++;
      qtyNum.textContent = qty;
    });
    modal.querySelector(".pm-minus").addEventListener("click", () => {
      if (qty > 1) {
        qty--;
        qtyNum.textContent = qty;
      }
    });

    // Add to cart
    modal.querySelector(".pm-add").addEventListener("click", () => {
      const priceNum = parseFloat(price.replace(/[^\d.]/g, "")) || 0;
      if (window.HMCart) {
        for (let i = 0; i < qty; i++) {
          window.HMCart.add(name, priceNum, img);
        }
      }
      close();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".dish-box").forEach((box) => {
      const img = box.querySelector(".dist-img img");
      if (!img) return;
      img.style.cursor = "pointer";
      img.addEventListener("click", () => openProductModal(box));
    });
  });

  window.HMProductModal = { open: openProductModal };
})();
