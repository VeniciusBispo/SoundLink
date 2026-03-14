// SoundLink Service Worker
// This file is extended by next-pwa at build time.
// Custom offline handling logic lives here.

const CACHE_NAME = 'soundlink-v1'
const OFFLINE_PAGE = '/offline'

// Assets to pre-cache on install
const PRE_CACHE_ASSETS = [
  '/',
  '/explore',
  '/offline',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Network-first strategy with offline fallback for navigation
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_PAGE).then(
          (cachedResponse) => cachedResponse ?? new Response('Offline', { status: 503 })
        )
      )
    )
    return
  }

  // Cache-first for images
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((response) => {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
            return response
          })
      )
    )
  }
})
