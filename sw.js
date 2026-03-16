const CACHE_NAME = 'ksattt-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/building.html',
    '/style.css',
    '/building.css',
    '/script.js',
    '/building.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
