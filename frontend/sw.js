const CACHE_NAME = 'baba-bingo-v1';

// List all the files you want to work offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/css/main.css', 
  '/static/js/main.js',
  // Add your number audio files here so the voice works offline!
  '/static/audio/1.mp3',
  '/static/audio/2.mp3'
];

// Install Event: This downloads the files to the phone
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Bingo App: Downloading files for offline use...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event: This opens the files from the phone memory if there is no internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached file, or try to get it from internet if signal exists
      return response || fetch(event.request);
    })
  );
});