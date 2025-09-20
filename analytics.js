// Vercel Analytics - Configuração para projeto vanilla JavaScript
import { analytics } from '@vercel/analytics';

// Inicializar o analytics
analytics.track('page_view', {
    page: window.location.pathname,
    title: document.title,
    timestamp: new Date().toISOString()
});

// Função para rastrear eventos personalizados
window.trackEvent = function(eventName, properties = {}) {
    analytics.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
    });
};

// Auto-rastrear cliques em botões importantes
document.addEventListener('DOMContentLoaded', function() {
    // Rastrear cliques nos botões principais
    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            window.trackEvent('menu_button_click', {
                button: buttonText,
                url: this.href
            });
        });
    });

    // Rastrear adição de aniversários
    const addForm = document.getElementById('birthday-form');
    if (addForm) {
        addForm.addEventListener('submit', function() {
            window.trackEvent('birthday_added', {
                page: 'agendar'
            });
        });
    }

    // Rastrear teste de notificações
    const testNotificationBtn = document.getElementById('test-notification');
    if (testNotificationBtn) {
        testNotificationBtn.addEventListener('click', function() {
            window.trackEvent('notification_test', {
                page: 'agendar'
            });
        });
    }

    // Rastrear salvamento de configurações
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            window.trackEvent('settings_saved', {
                page: 'agendar'
            });
        });
    }

    // Rastrear filtros de aniversários
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            window.trackEvent('filter_applied', {
                filter: this.dataset.filter,
                page: 'agendar'
            });
        });
    });
});

// Rastrear instalação como PWA
window.addEventListener('beforeinstallprompt', (e) => {
    window.trackEvent('pwa_install_prompt_shown');
});

window.addEventListener('appinstalled', (e) => {
    window.trackEvent('pwa_installed');
});

// Rastrear permissões de notificação
const originalRequestPermission = Notification.requestPermission;
if (originalRequestPermission) {
    Notification.requestPermission = function() {
        window.trackEvent('notification_permission_requested');
        return originalRequestPermission.apply(this, arguments).then(result => {
            window.trackEvent('notification_permission_result', {
                result: result
            });
            return result;
        });
    };
}

console.log('🎂 Vercel Analytics inicializado para Lembrete de Aniversários');