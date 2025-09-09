/* sw.js - Workbox legible y completo (para estructura con /assets/*) */
if (!self.define) {
  let e, i = {};
  const n = (n, r) => (
    n = new URL(n + ".js", r).href,
    i[n] || new Promise(i => {
      if ("document" in self) {
        const e = document.createElement("script");
        e.src = n; e.onload = i; document.head.appendChild(e);
      } else {
        importScripts(n); i();
      }
    }).then(() => {
      let e = i[n];
      if (!e) throw new Error(`Module ${n} didn’t register its module`);
      return e;
    })
  );
  self.define = (r, s) => {
    const t = e || ("document" in self ? document.currentScript.src : "") || location.href;
    if (i[t]) return;
    let o = {};
    const d = e => n(e, t),
      c = { module: { uri: t }, exports: o, require: d };
    i[t] = Promise.all(r.map(e => c[e] || d(e))).then(e => (s(...e), o));
  };
}

define(["./workbox-1c674fbd"], function (workbox) {
  "use strict";

  /* ------------------------------
   * Ciclo de vida
   * ------------------------------ */
  self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
  });

  workbox.core.skipWaiting();
  workbox.core.clientsClaim();
  workbox.precaching.cleanupOutdatedCaches();

  /* ------------------------------
   * Precache (app shell + básicos)
   * ------------------------------ */
  workbox.precaching.precacheAndRoute(
    [
      { url: "./", revision: null },
      { url: "index.html", revision: null },
      { url: "index.css",  revision: null },
      { url: "index.js",   revision: null },
      { url: "manifest.json", revision: null },

      // Iconos mínimos para instalabilidad
      { url: "assets/favicon.png", revision: null },
      { url: "assets/android/android-launchericon-192-192.png", revision: null },
      { url: "assets/android/android-launchericon-512-512.png", revision: null }
    ],
    {
      ignoreURLParametersMatching: [/^utm_/, /^fbclid$/]
    }
  );

  /* ------------------------------
   * Fallback de navegación (SPA)
   * ------------------------------ */
  const appShellHandler = workbox.precaching.createHandlerBoundToURL("index.html");
  const navigationRoute = new workbox.routing.NavigationRoute(appShellHandler, {
    // Evita archivos estáticos (terminan con extensión)
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
  });
  workbox.routing.registerRoute(navigationRoute);

  /* ------------------------------
   * Runtime caching
   * ------------------------------ */

  // Dexie desde CDN (cdnjs)
  workbox.routing.registerRoute(
    ({ url }) => url.origin === "https://cdnjs.cloudflare.com",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "cdn-dexie",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 6,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
        })
      ]
    })
  );

  // Assets locales: /assets/*
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith("/assets/"),
    new workbox.strategies.CacheFirst({
      cacheName: "assets-cache",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
        })
      ]
    })
  );

  /* ------------------------------
   * Listener fetch (requisito de instalabilidad)
   * Workbox ya maneja las rutas registradas; este listener
   * asegura la presencia de 'fetch' para Chrome.
   * ------------------------------ */
  self.addEventListener("fetch", () => {
    // Deja que Workbox maneje precache/runtime según reglas arriba.
  });
});
