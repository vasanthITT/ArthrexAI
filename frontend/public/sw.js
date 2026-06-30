// No caching — service worker disabled
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.clients.claim();
  // Clear all caches
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
});
