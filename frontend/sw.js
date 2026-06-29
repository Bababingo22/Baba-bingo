// We change the version to v2 so the phone knows to update it!
const CACHE_NAME = 'baba-bingo-v2';

// 1. Save the basic website files
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/v-logo.svg'
];

// 2. A smart script to automatically list all 75 Bingo Audio files!
const voiceFolders = ['male', 'male2', 'male3'];
const soundEffects = ['game_start.mp3', 'game_end.mp3', 'shuffle.mp3', 'good.mp3', 'bad.mp3'];

voiceFolders.forEach(folder => {
  // Add basic sound effects
  soundEffects.forEach(fx => {
    ASSETS_TO_CACHE.push(`/audio/${folder}/${fx}`);
  });
  
  // Add B (1-15) - Remember we used 01, 02 for single digits!
  for(let i = 1; i <= 15; i++) {
    let num = i < 10 ? '0' + i : i;
    ASSETS_TO_CACHE.push(`/audio/${folder}/B${num}.mp3`);
  }
  // Add I (16-30)
  for(let i = 16; i <= 30; i++) ASSETS_TO_CACHE.push(`/audio/${folder}/I${i}.mp3`);
  // Add N (31-45)
  for(let i = 31; i <= 45; i++) ASSETS_TO_CACHE.push(`/audio/${folder}/N${i}.mp3`);
  // Add G (46-60)
  for(let i = 46; i <= 60; i++) ASSETS_TO_CACHE.push(`/audio/${folder}/G${i}.mp3`);
  // Add O (61-75)
  for(let i = 61; i <= 75; i++) ASSETS_TO_CACHE.push(`/audio/${folder}/O${i}.mp3`);
});

// Install Event: Download EVERYTHING to the phone
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Bingo App: Downloading all audio files for offline use...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force the new service worker to take over immediately
  self.skipWaiting();
});

// Fetch Event: Play from phone memory if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return the cached audio, or try internet if not found
      return response || fetch(event.request);
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});