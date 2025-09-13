
const CACHE_NAME = 'thomas-racer-v1';
const ASSETS = [
  '.',
  'index.html',
  'style.css',
  'main.js',
  'manifest.json',
  'assets/player.png',
  'assets/bg-music.wav',
  'assets/bump.wav',
  'assets/power.wav',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(res => res || fetch(evt.request)));
});
