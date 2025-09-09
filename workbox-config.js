module.exports = {
  globDirectory: "./",
  globPatterns: [
    "index.html",
    "index.css",
    "index.js",
    "manifest.json",
    "assets/**/*.{png,svg,webp,ico,json}"
  ],
  swDest: "sw.js",

  runtimeCaching: [
    {
      // Dexie CDN
      urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/dexie\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cdn-dexie",
        expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 * 30 }
      }
    },
    {
      // Todos los assets locales (íconos/imágenes)
      urlPattern: ({ url }) => url.pathname.startsWith("/assets/"),
      handler: "CacheFirst",
      options: {
        cacheName: "assets-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 }
      }
    }
  ],

  navigateFallback: "index.html",
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true
};
