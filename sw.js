// Service Worker para notificações em background
const CACHE_NAME = 'birthday-reminders-v4.1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/agendar.html',
    '/changelog.html',
    '/feedback.html',
    '/style.css',
    '/script.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker instalado com sucesso');
                // Configurar alarme para verificações periódicas
                setupPeriodicNotificationCheck();
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativando...');
    event.waitUntil(
        Promise.all([
            // Limpar caches antigos
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Configurar verificações periódicas
            setupPeriodicNotificationCheck(),
            // Tomar controle imediato
            self.clients.claim()
        ])
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

// Configurar verificações periódicas
function setupPeriodicNotificationCheck() {
    // Verificar a cada 15 minutos
    setInterval(() => {
        checkBirthdaysInBackground();
    }, 15 * 60 * 1000);
    
    // Verificação especial à meia-noite
    scheduleNextMidnightCheck();
    
    console.log('Verificações periódicas configuradas');
}

// Agendar próxima verificação à meia-noite
function scheduleNextMidnightCheck() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        checkBirthdaysInBackground();
        // Reagendar para o próximo dia
        scheduleNextMidnightCheck();
    }, msUntilMidnight);
}

// Função para detectar se é dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Função para criar notificação otimizada para mobile
function createMobileOptimizedNotification(title, options) {
    const mobileOptions = {
        ...options,
        requireInteraction: isMobileDevice(), // No mobile, manter visível até interação
        vibrate: isMobileDevice() ? [200, 100, 200] : undefined, // Vibração apenas no mobile
        badge: '/icon-192.png', // Ícone menor para badge
        image: isMobileDevice() ? undefined : options.image, // Remover imagem no mobile para economizar espaço
        actions: isMobileDevice() ? undefined : options.actions, // Simplificar ações no mobile
        silent: false, // Sempre com som
        timestamp: Date.now(),
        renotify: true, // Permitir re-notificação
        tag: `birthday-${Date.now()}` // Tag única para evitar agrupamento
    };

    return self.registration.showNotification(title, mobileOptions);
}

// Função principal para verificar aniversários
async function checkBirthdaysInBackground() {
    try {
        console.log('Verificando aniversários em background...');
        
        // Obter dados do localStorage através do IndexedDB
        const birthdays = await getBirthdaysFromStorage();
        const notificationSettings = await getNotificationSettingsFromStorage();
        
        if (!birthdays || birthdays.length === 0) {
            console.log('Nenhum aniversário cadastrado');
            return;
        }
        
        const today = getCurrentDate();
        const todayStr = `${today.year}-${today.month}-${today.day}`;
        
        for (const birthday of birthdays) {
            const days = calculateDaysUntilBirthday(birthday.date);
            const notificationKey = `${birthday.id}_${todayStr}`;
            
            // Verificar se já notificou hoje
            if (notificationSettings && notificationSettings[notificationKey]) {
                continue;
            }
            
            let shouldNotify = false;
            let title = 'Lembrete de Aniversário';
            let message = '';
            let tag = `birthday-${birthday.id}-${days}`;
            
            // Regras de notificação
            if (days === 0) {
                shouldNotify = true;
                message = `🎉 Hoje é aniversário de ${birthday.name}! 🎂`;
                tag = `birthday-today-${birthday.id}`;
            } else if (days === 1) {
                shouldNotify = true;
                message = `🎈 Amanhã é aniversário de ${birthday.name}!`;
            } else if (days === 3) {
                shouldNotify = true;
                message = `⏰ Faltam 3 dias para o aniversário de ${birthday.name}!`;
            } else if (days === 7) {
                shouldNotify = true;
                message = `📅 Falta uma semana para o aniversário de ${birthday.name}!`;
            } else if (days === 14) {
                shouldNotify = true;
                message = `🗓️ Faltam 14 dias para o aniversário de ${birthday.name}!`;
            } else if (days === 30) {
                shouldNotify = true;
                message = `📆 Falta um mês para o aniversário de ${birthday.name}!`;
            }
            
            if (shouldNotify) {
                // Configurações específicas para mobile
                const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const notificationOptions = {
                    body: message,
                    icon: '/android-chrome-192x192.png',
                    badge: '/android-chrome-192x192.png',
                    tag: tag,
                    requireInteraction: days <= 1, // Interação obrigatória para hoje/amanhã
                    silent: false,
                    timestamp: Date.now(),
                    vibrate: isMobile ? [200, 100, 200] : undefined, // Vibração apenas no mobile
                    data: {
                        birthdayId: birthday.id,
                        birthdayName: birthday.name,
                        daysUntil: days,
                        url: '/agendar.html'
                    },
                    actions: [
                        {
                            action: 'view',
                            title: '👀 Ver Detalhes',
                            icon: '/android-chrome-192x192.png'
                        },
                        {
                            action: 'dismiss',
                            title: '✖️ Dispensar',
                            icon: '/android-chrome-192x192.png'
                        }
                    ]
                };

                // Configurações específicas para iOS PWA
                if (isMobile && navigator.standalone) {
                    notificationOptions.icon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>';
                    notificationOptions.badge = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>';
                }
                
                // Mostrar notificação
                await self.registration.showNotification(title, notificationOptions);
                
                // Marcar como notificado
                const updatedSettings = notificationSettings || {};
                updatedSettings[notificationKey] = true;
                await saveNotificationSettingsToStorage(updatedSettings);
                
                console.log(`Notificação enviada para ${birthday.name} (${days} dias)`);
            }
        }
    } catch (error) {
        console.error('Erro ao verificar aniversários:', error);
    }
}

// Funções auxiliares para trabalhar com dados
async function getBirthdaysFromStorage() {
    try {
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            return new Promise((resolve) => {
                clients[0].postMessage({ type: 'GET_BIRTHDAYS' });
                // Timeout para evitar espera infinita
                setTimeout(() => resolve([]), 5000);
            });
        }
        return [];
    } catch (error) {
        console.error('Erro ao obter aniversários:', error);
        return [];
    }
}

async function getNotificationSettingsFromStorage() {
    try {
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            return new Promise((resolve) => {
                clients[0].postMessage({ type: 'GET_NOTIFICATION_SETTINGS' });
                setTimeout(() => resolve({}), 5000);
            });
        }
        return {};
    } catch (error) {
        console.error('Erro ao obter configurações:', error);
        return {};
    }
}

async function saveNotificationSettingsToStorage(settings) {
    try {
        const clients = await self.clients.matchAll();
        if (clients.length > 0) {
            clients[0].postMessage({ 
                type: 'SAVE_NOTIFICATION_SETTINGS', 
                data: settings 
            });
        }
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
    }
}

// Utilitários de data
function getCurrentDate() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
    };
}

function calculateDaysUntilBirthday(dateString) {
    const today = getCurrentDate();
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Criar data do aniversário para este ano
    let birthdayThisYear = new Date(today.year, month - 1, day);
    const todayDate = new Date(today.year, today.month - 1, today.day);
    
    // Se já passou este ano, calcular para o próximo
    if (birthdayThisYear < todayDate) {
        birthdayThisYear = new Date(today.year + 1, month - 1, day);
    }
    
    // Calcular diferença em dias
    const diffTime = birthdayThisYear.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Lidar com cliques em notificações
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const data = event.notification.data || {};
    
    if (event.action === 'view' || !event.action) {
        // Abrir/focar na página
        event.waitUntil(
            clients.matchAll({ type: 'window' })
                .then((clientList) => {
                    // Se já tem uma janela aberta, focar nela
                    for (let client of clientList) {
                        if (client.url.includes('/agendar.html') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // Senão, abrir nova janela
                    if (clients.openWindow) {
                        return clients.openWindow('/agendar.html');
                    }
                })
        );
    } else if (event.action === 'dismiss') {
        // Apenas fechar a notificação
        console.log('Notificação dispensada pelo usuário');
    }
});

// Receber mensagens do script principal
self.addEventListener('message', (event) => {
    if (event.data) {
        switch (event.data.type) {
            case 'CHECK_BIRTHDAYS':
                checkBirthdaysInBackground();
                break;
            case 'GET_BIRTHDAYS_RESPONSE':
                // Resposta para getBirthdaysFromStorage
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage(event.data.data);
                }
                break;
            case 'GET_NOTIFICATION_SETTINGS_RESPONSE':
                // Resposta para getNotificationSettingsFromStorage
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage(event.data.data);
                }
                break;
        }
    }
});

console.log('Service Worker carregado e configurado para notificações em background');