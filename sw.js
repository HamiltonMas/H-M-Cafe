/* Simple offline service worker */
const CACHE = "hm-cafe-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./Menu.html",
  "./AboutUs.html",
  "./Profile.html",
  "./Orders.html",
  "./Reservations.html",
  "./Gallery.html",
  "./style.css",
  "./menucss.css",
  "./abt.css",
  "./new1Style.css",
  "./cart.css",
  "./features.css",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return (
        cached ||
        fetch(e.request)
          .then((res) => {
            if (res.ok && e.request.url.startsWith(self.location.origin)) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, clone));
            }
            return res;
          })
          .catch(() => caches.match("./index.html"))
      );
    }),
  );
});
