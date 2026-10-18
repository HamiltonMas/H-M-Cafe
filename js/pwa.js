/* ============================================
   PWA INSTALL PROMPT + SERVICE WORKER
   ============================================ */

(function () {
  "use strict";

  let deferredPrompt = null;
  const DISMISS_KEY = "hm_cafe_pwa_dismissed";

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (document.getElementById("pwaInstall")) return;

    const banner = document.createElement("div");
    banner.id = "pwaInstall";
    banner.className = "pwa-install show";
    banner.innerHTML = `
            <div class="pwa-install-icon">H&M</div>
            <div class="pwa-install-text">
                <h4>Install H&M Cafe</h4>
                <p>Faster ordering, works offline</p>
            </div>
            <div class="pwa-install-actions">
                <button class="pwa-install-btn">Install</button>
                <button class="pwa-install-close">✕</button>
            </div>
        `;
    document.body.appendChild(banner);

    banner
      .querySelector(".pwa-install-btn")
      .addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          banner.remove();
        }
        deferredPrompt = null;
      });

    banner.querySelector(".pwa-install-close").addEventListener("click", () => {
      localStorage.setItem(DISMISS_KEY, "1");
      banner.remove();
    });
  }

  /* Register service worker */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("sw.js")
        .then(() => console.log("✅ Service Worker registered"))
        .catch((err) => console.log("SW registration failed:", err));
    });
  }
})();
