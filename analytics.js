// Vercel Web Analytics - Integration for static HTML sites
// Using @vercel/analytics package with inject() function

import { inject, track } from './node_modules/@vercel/analytics/dist/index.mjs';

// Initialize Vercel Web Analytics
// inject() will add the analytics script and start tracking page views automatically
inject({
    mode: 'auto', // Automatically detect environment (production/development)
    debug: true, // Enable debug logging in development mode
    beforeSend: (event) => {
        // Log events in development for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📊 Analytics Event:', event);
        }
        return event;
    }
});

// Helper function for custom event tracking
window.trackEvent = function(eventName, properties = {}) {
    track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
    });
    
    // Log for debug in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('📊 Custom Event:', eventName, properties);
    }
};

// Auto-track important user interactions
document.addEventListener('DOMContentLoaded', function() {
    // Track menu button clicks
    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            window.trackEvent('menu_button_click', {
                button: buttonText,
                url: this.href || 'no-url'
            });
        });
    });

    // Track birthday form submission
    const addForm = document.getElementById('birthday-form');
    if (addForm) {
        addForm.addEventListener('submit', function() {
            window.trackEvent('birthday_added', {
                page: 'agendar'
            });
        });
    }

    // Track notification test
    const testNotificationBtn = document.getElementById('test-notification');
    if (testNotificationBtn) {
        testNotificationBtn.addEventListener('click', function() {
            window.trackEvent('notification_test', {
                page: 'agendar'
            });
        });
    }

    // Track settings save
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            window.trackEvent('settings_saved', {
                page: 'agendar'
            });
        });
    }

    // Track filter usage
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            window.trackEvent('filter_applied', {
                filter: this.dataset.filter || 'unknown',
                page: 'agendar'
            });
        });
    });

    // Track feedback form submission
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function() {
            const feedbackType = document.getElementById('feedback-type')?.value || 'unknown';
            window.trackEvent('feedback_submitted', {
                type: feedbackType,
                page: 'feedback'
            });
        });
    }

    console.log('🎂 Vercel Web Analytics initialized for Lembrete de Aniversários');
});

// Track PWA installation events
window.addEventListener('beforeinstallprompt', (e) => {
    window.trackEvent('pwa_install_prompt_shown');
});

window.addEventListener('appinstalled', (e) => {
    window.trackEvent('pwa_installed');
});

// Track notification permission requests
if ('Notification' in window && Notification.requestPermission) {
    const originalRequestPermission = Notification.requestPermission.bind(Notification);
    Notification.requestPermission = function() {
        window.trackEvent('notification_permission_requested');
        return originalRequestPermission().then(result => {
            window.trackEvent('notification_permission_result', {
                result: result
            });
            return result;
        });
    };
}
