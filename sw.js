/* Service worker: guarda TODOS os arquivos do Missão Bit no aparelho na primeira visita,
   para o jogo funcionar 100% sem internet.
   Ao mudar arquivos do site, aumente a versão abaixo para os aparelhos baixarem a nova versão. */
const CACHE = 'missao-bit-v3';
const FILES = [
  './',
  'index.html',
  'css/style.css',
  'js/data.js',
  'js/app.js',
  'fonts/fonts.css',
  'fonts/fredoka-0.woff2',
  'fonts/jetbrains-mono-1.woff2',
  'fonts/nunito-2.woff2',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  // Abrir o app (navegação): sempre responde com o index.html guardado.
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('index.html').then(hit => hit || fetch(req))
        .catch(() => caches.match('./'))
    );
    return;
  }

  // Demais arquivos: primeiro do aparelho; se não tiver, busca na internet e guarda.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
