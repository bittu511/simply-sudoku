self.addEventListener('install', e => {
  e.waitUntil(                                 // Wait until the cache is ready
    caches.open('pwa-assets').then(cache => {
      return cache.addAll([                    // and cache all the files you want available offline.
        'index.html',
        'index.css',
        'index.js',
        'webcomponents/simply-sudoku-cell.css',
        'webcomponents/simply-sudoku-cell.js',
        'libs/xstream.min.js',
        'libs/cycle-run.min.js',
        'libs/cycle-dom.min.js',
        'libs/webcomponents-lite.js',
      ].map(r => r+'?'+Math.random()))         //DEBUG: Cache invalidation.
    })
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(                               // Respond to every fetch quest
    caches.match(e.request).then(response => { // with cached file, or the the fetch itself.
      return response || fetch(e.request);
    })
  )
})
