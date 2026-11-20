"use strict";
// Offline: app shell precacheada; páginas del manual y PDF se cachean al usarlas.
const VERSION = "aula-dele-a2-v3";
const SHELL = ["./", "index.html", "app.js", "curso.js", "estilos.css", "manifest.webmanifest", "marca/la-casa-grande-sello.png", "marca/la-casa-grande-horizontal.png", "marca/la-casa-grande-cuadrado.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.headers.has("range")) return; // PDF parcial: dejar pasar a la red
  const heavy = /\.(jpg|jpeg|png|pdf)$/i.test(new URL(req.url).pathname);
  if (heavy) {
    // Imágenes y PDF: caché primero (no cambian)
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      })).catch(() => caches.match("index.html"))
    );
    return;
  }
  // HTML, JS, CSS: red primero (siempre la última versión), caché solo sin conexión
  event.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("index.html")))
  );
});
