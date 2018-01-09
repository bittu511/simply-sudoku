self.addEventListener('install', e => {
  e.waitUntil( // Wait until the cache is ready
    caches.open('pwa-assets').then(cache => {
      return cache.addAll([ // and cache all the files you want available offline.
        'index.html',
        'index.css',
        'index.js',
        'simply-sudoku-cell.js',
        'libs/xstream.min.js',
        'libs/cycle-run.min.js',
        'libs/cycle-dom.min.js',
        'libs/webcomponents-lite.js',
        'libs/anime.min.js',
        'assets/dog-slap.mp4',
        'assets/fw.mp4',
      ].map(r => r + '?' + 'v1.0.1')) // NOTE: Remember to update cache invalidation.
    })
  )
})

self.addEventListener('fetch', e => {
  e.respondWith( // Respond to every fetch quest
    caches.match(e.request).then(response => { // with cached file, or the the fetch itself.
      return response || fetch(e.request)
    })
  )
})
