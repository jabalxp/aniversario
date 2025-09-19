// Service Worker para notificações em background
const CACHE_NAME = 'birthday-reminders-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativar Service Worker
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
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retornar cache se disponível, senão buscar na rede
                return response || fetch(event.request);
            })
    );
});

// Verificar notificações periodicamente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CHECK_BIRTHDAYS') {
        checkBirthdays();
    }
});

function checkBirthdays() {
    // Esta função seria chamada periodicamente para verificar aniversários
    // Por limitações do Service Worker, mantemos a lógica principal no script.js
    console.log('Verificando aniversários em background...');
}