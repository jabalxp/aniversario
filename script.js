// Biblioteca de utilitários de data (100% manual - SEM JavaScript Date)
class DateUtils {
    // Verificar se um ano é bissexto
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    
    // Obter dias no mês
    static getDaysInMonth(year, month) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month === 2 && this.isLeapYear(year)) {
            return 29;
        }
        return daysInMonth[month - 1];
    }
    
    // Converter data para dias desde uma época (1 de janeiro de 2000)
    static dateToDays(year, month, day) {
        let totalDays = 0;
        // Somar anos desde 2000
        for (let y = 2000; y < year; y++) {
            totalDays += this.isLeapYear(y) ? 366 : 365;
        }
        // Somar meses do ano atual
        for (let m = 1; m < month; m++) {
            totalDays += this.getDaysInMonth(year, m);
        }
        // Somar dias (NÃO subtrai 1)
        totalDays += day;
        return totalDays;
    }
    
    // Parse de string YYYY-MM-DD para componentes
    static parseDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return { year, month, day };
    }
    
    // Obter data atual
    static getToday() {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
    }
    
    // Calcular diferença em dias entre duas datas
    static daysDifference(date1, date2) {
        const days1 = this.dateToDays(date1.year, date1.month, date1.day);
        const days2 = this.dateToDays(date2.year, date2.month, date2.day);
        return days2 - days1;
    }
    
    // Formatar componentes de data para DD/MM/YYYY
    static formatDate(dateComponents) {
        const day = String(dateComponents.day).padStart(2, '0');
        const month = String(dateComponents.month).padStart(2, '0');
        return `${day}/${month}/${dateComponents.year}`;
    }
    
    // Formatar string YYYY-MM-DD para DD/MM/YYYY (SEM CONVERSÃO DE DATA)
    static formatDateString(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
}

// Classe principal para gerenciar aniversários - REESCRITA COMPLETA
class BirthdayManager {
    constructor() {
        this.birthdays = this.loadBirthdays();
        this.notificationSettings = this.loadNotificationSettings();
        this.setupAdvancedNotifications();
        this.initializeEventListeners();
        this.requestNotificationPermission();
        this.checkNotificationPermissionStatus();
        this.renderBirthdays();
        this.updateStats();
        this.checkNotifications();
        this.checkAdvancedNotifications();
        this.startNotificationTimer();
    }

    // Carregar aniversários do localStorage
    loadBirthdays() {
        const stored = localStorage.getItem('birthdays');
        return stored ? JSON.parse(stored) : [];
    }

    // Salvar aniversários no localStorage
    saveBirthdays() {
        localStorage.setItem('birthdays', JSON.stringify(this.birthdays));
    }

    // Carregar configurações de notificação
    loadNotificationSettings() {
        const stored = localStorage.getItem('notificationSettings');
        return stored ? JSON.parse(stored) : {};
    }

    // Salvar configurações de notificação
    saveNotificationSettings() {
        localStorage.setItem('notificationSettings', JSON.stringify(this.notificationSettings));
    }

    // NOVA FUNÇÃO: Calcular dias até aniversário no ANO QUE VEM (2026)
    calculateDaysUntilBirthday(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        // Verifica se o aniversário deste ano já passou
        let targetYear = today.year;
        if (
            today.month > birthDate.month ||
            (today.month === birthDate.month && today.day > birthDate.day)
        ) {
            targetYear = today.year + 1;
        }
        const targetBirthday = {
            year: targetYear,
            month: birthDate.month,
            day: birthDate.day
        };
        return DateUtils.daysDifference(today, targetBirthday);
    }
    
    // NOVA FUNÇÃO: Calcular idade atual (em 2025)
    calculateCurrentAge(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        
        let age = today.year - birthDate.year;
        
        // Verificar se ainda não fez aniversário este ano (2025)
        if (today.month < birthDate.month || 
            (today.month === birthDate.month && today.day < birthDate.day)) {
            age--;
        }
        
        return Math.max(0, age);
    }
    
    // NOVA FUNÇÃO: Calcular idade no próximo aniversário
    calculateNextAge(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        
        // Determinar o ano do próximo aniversário
        let targetYear = today.year;
        if (
            today.month > birthDate.month ||
            (today.month === birthDate.month && today.day > birthDate.day)
        ) {
            targetYear = today.year + 1;
        }
        
        return targetYear - birthDate.year;
    }
    
    // NOVA FUNÇÃO: Ano do próximo aniversário
    calculateNextBirthdayYear(birthDateString) {
        const today = DateUtils.getToday();
        const birthDate = DateUtils.parseDate(birthDateString);
        
        // Determinar o ano do próximo aniversário
        let targetYear = today.year;
        if (
            today.month > birthDate.month ||
            (today.month === birthDate.month && today.day > birthDate.day)
        ) {
            targetYear = today.year + 1;
        }
        
        return targetYear;
    }

    // NOVA FUNÇÃO: Obter data completa do próximo aniversário
    getNextBirthdayDate(birthDateString) {
        const birthDate = DateUtils.parseDate(birthDateString);
        const nextYear = this.calculateNextBirthdayYear(birthDateString);
        
        return DateUtils.formatDate({
            year: nextYear,
            month: birthDate.month,
            day: birthDate.day
        });
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Formulário de adicionar aniversário
        document.getElementById('birthday-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBirthday();
        });

        // Preview da foto
        document.getElementById('person-photo').addEventListener('change', this.previewPhoto);

        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBirthdays(e.target.dataset.filter);
            });
        });

        // Modal de confirmação
        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.hideModal();
        });

        // Notificação banner
        document.getElementById('close-notification').addEventListener('click', () => {
            this.hideNotificationBanner();
        });

        // Permissão de notificações
        document.getElementById('allow-notifications').addEventListener('click', () => {
            this.requestNotificationPermission(true);
        });

        document.getElementById('deny-notifications').addEventListener('click', () => {
            this.hideNotificationPermission();
        });

        // Configurações de notificação
        document.getElementById('toggle-settings')?.addEventListener('click', () => {
            this.toggleNotificationSettings();
        });

        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveNotificationSettings();
        });

        document.getElementById('test-notification')?.addEventListener('click', () => {
            this.testNotification();
        });

        // Event listeners para checkboxes de configuração
        const settingCheckboxes = [
            'notify-on-day', 'notify-day-before', 'notify-3-days',
            'notify-1-week', 'notify-2-weeks', 'notify-1-month',
            'sound-enabled', 'persistent-notifications', 'background-notifications'
        ];

        settingCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.updateNotificationSetting(id, checkbox.checked);
                });
            }
        });

        // Carregar configurações na interface
        this.loadSettingsToInterface();
    }

    // Adicionar novo aniversário
    addBirthday() {
        const name = document.getElementById('person-name').value.trim();
        const date = document.getElementById('birth-date').value;
        const description = document.getElementById('person-description').value.trim();
        const photoInput = document.getElementById('person-photo');

        if (!name || !date) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }

        // Verificar se já existe aniversário para esta pessoa
        if (this.birthdays.some(b => b.name.toLowerCase() === name.toLowerCase())) {
            this.showNotification('Já existe um aniversário cadastrado para esta pessoa!', 'error');
            return;
        }

        const birthday = {
            id: Date.now(),
            name: name,
            date: date,
            description: description || null,
            photo: null,
            createdAt: new Date().toISOString()
        };

        // Processar foto se fornecida
        if (photoInput.files && photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                birthday.photo = e.target.result;
                this.saveBirthdayAndUpdate(birthday);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            this.saveBirthdayAndUpdate(birthday);
        }
    }

    // Salvar aniversário e atualizar interface
    saveBirthdayAndUpdate(birthday) {
        this.birthdays.push(birthday);
        this.saveBirthdays();
        this.renderBirthdays();
        this.updateStats();
        this.resetForm();
        this.showNotification(`Aniversário de ${birthday.name} adicionado com sucesso!`, 'success');
        this.checkNotifications();
        this.checkAdvancedNotifications();
        this.requestServiceWorkerCheck();
    }

    // Preview da foto
    previewPhoto(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('photo-preview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('hidden');
        }
    }

    // Resetar formulário
    resetForm() {
        document.getElementById('birthday-form').reset();
        document.getElementById('photo-preview').classList.add('hidden');
    }

    // Obter texto dos dias restantes
    getDaysLeftText(days) {
        if (days === 0) return 'Hoje é o aniversário!';
        if (days === 1) return 'Amanhã é o aniversário!';
        if (days <= 3) return `Faltam ${days} dias`;
        if (days <= 7) return `Faltam ${days} dias`;
        if (days <= 14) return `Faltam ${days} dias`;
        if (days <= 30) return `Faltam ${days} dias`;
        if (days <= 60) return `Faltam ${days} dias`;
        
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        
        if (months === 1) {
            return remainingDays === 0 ? 'Falta 1 mês' : `Falta 1 mês e ${remainingDays} dias`;
        }
        
        return remainingDays === 0 ? `Faltam ${months} meses` : `Faltam ${months} meses e ${remainingDays} dias`;
    }

    // Obter classe CSS baseada na urgência
    getUrgencyClass(days) {
        if (days <= 7) return 'urgent';
        if (days <= 30) return 'upcoming';
        return 'normal';
    }

    // Renderizar lista de aniversários
    renderBirthdays(filter = 'all') {
        const container = document.getElementById('birthdays-list');
        
        if (this.birthdays.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-birthday-cake"></i>
                    <h3>Nenhum aniversário cadastrado</h3>
                    <p>Adicione seu primeiro lembrete de aniversário acima!</p>
                </div>
            `;
            return;
        }

        // Filtrar aniversários
        let filteredBirthdays = this.birthdays;
        if (filter === 'urgent') {
            filteredBirthdays = this.birthdays.filter(b => this.calculateDaysUntilBirthday(b.date) <= 7);
        } else if (filter === 'upcoming') {
            filteredBirthdays = this.birthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days > 7 && days <= 30;
            });
        }

        // Ordenar por proximidade do aniversário
        filteredBirthdays.sort((a, b) => {
            return this.calculateDaysUntilBirthday(a.date) - this.calculateDaysUntilBirthday(b.date);
        });

        if (filteredBirthdays.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum aniversário encontrado</h3>
                    <p>Não há aniversários que correspondam ao filtro selecionado.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredBirthdays.map(birthday => {
            const days = this.calculateDaysUntilBirthday(birthday.date);
            const currentAge = this.calculateCurrentAge(birthday.date);
            const nextAge = this.calculateNextAge(birthday.date);
            const nextBirthdayDate = this.getNextBirthdayDate(birthday.date);
            const urgencyClass = this.getUrgencyClass(days);
            const daysText = this.getDaysLeftText(days);

            return `
                <div class="birthday-card ${urgencyClass}" data-id="${birthday.id}">
                    ${birthday.photo ? 
                        `<img src="${birthday.photo}" alt="${birthday.name}" class="birthday-photo">` :
                        `<div class="default-avatar">${birthday.name.charAt(0).toUpperCase()}</div>`
                    }
                    <div class="birthday-info">
                        <h3>${birthday.name}</h3>
                        ${birthday.description ? `<p class="birthday-description">${birthday.description}</p>` : ''}
                        <p class="birthday-date">🎂 ${DateUtils.formatDateString(birthday.date)}</p>
                        <div class="age-info">
                            <span class="current-age">${currentAge} anos</span>
                            <span class="next-age">Fará ${nextAge} anos em ${nextBirthdayDate}</span>
                        </div>
                        <span class="days-left ${urgencyClass}">${daysText}</span>
                    </div>
                    <div class="birthday-actions">
                        <button class="btn-delete" onclick="birthdayManager.deleteBirthday(${birthday.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Filtrar aniversários
    filterBirthdays(filter) {
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Renderizar com filtro
        this.renderBirthdays(filter);
    }

    // Excluir aniversário
    deleteBirthday(id) {
        const birthday = this.birthdays.find(b => b.id === id);
        if (!birthday) return;

        // Mostrar modal de confirmação
        document.getElementById('delete-person-name').textContent = birthday.name;
        this.showModal();
        this.deleteId = id;
    }

    // Confirmar exclusão
    confirmDelete() {
        if (!this.deleteId) return;

        const birthday = this.birthdays.find(b => b.id === this.deleteId);
        this.birthdays = this.birthdays.filter(b => b.id !== this.deleteId);
        this.saveBirthdays();
        this.renderBirthdays();
        this.updateStats();
        this.hideModal();
        this.showNotification(`Aniversário de ${birthday.name} removido com sucesso!`, 'success');
        delete this.deleteId;
    }

    // Mostrar modal
    showModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // Esconder modal
    hideModal() {
        const modal = document.getElementById('confirm-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    // Atualizar estatísticas
    updateStats() {
        const total = this.birthdays.length;
        const urgentCount = this.birthdays.filter(b => this.calculateDaysUntilBirthday(b.date) <= 7).length;
        
        let statsText = `${total} aniversário${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''}`;
        if (urgentCount > 0) {
            statsText += ` • ${urgentCount} urgente${urgentCount !== 1 ? 's' : ''}`;
        }
        
        document.getElementById('total-birthdays').textContent = statsText;
    }

    // Verificar e exibir notificações
    checkNotifications() {
        const today = DateUtils.getToday();
        const todayStr = `${today.year}-${today.month}-${today.day}`;

        this.birthdays.forEach(birthday => {
            const days = this.calculateDaysUntilBirthday(birthday.date);
            const notificationKey = `${birthday.id}_${todayStr}`;

            // Verificar se já notificou hoje para esta pessoa
            if (this.notificationSettings[notificationKey]) return;

            let shouldNotify = false;
            let message = '';

            // Regras de notificação
            if (days === 0) {
                shouldNotify = true;
                message = `🎉 Hoje é aniversário de ${birthday.name}! 🎂`;
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
                this.showNotificationBanner(message);
                this.sendBrowserNotification(`Lembrete de Aniversário`, message);
                
                // Marcar como notificado
                this.notificationSettings[notificationKey] = true;
                this.saveNotificationSettings();
            }
        });
    }

    // Mostrar banner de notificação
    showNotificationBanner(message) {
        const banner = document.getElementById('notification-banner');
        const text = document.getElementById('notification-text');
        
        text.textContent = message;
        banner.classList.remove('hidden');
    }

    // Esconder banner de notificação
    hideNotificationBanner() {
        document.getElementById('notification-banner').classList.add('hidden');
    }

    // Solicitar permissão para notificações
    requestNotificationPermission(force = false) {
        if ('Notification' in window) {
            if (Notification.permission === 'default' || force) {
                if (force) {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            this.showNotification('Notificações ativadas com sucesso! Você receberá lembretes mesmo quando não estiver no site.', 'success');
                            // Ativar Service Worker para notificações em background
                            this.activateBackgroundNotifications();
                        } else {
                            this.showNotification('Notificações negadas. Você pode ativar nas configurações do navegador.', 'error');
                        }
                        this.hideNotificationPermission();
                    });
                } else {
                    // Mostrar pedido personalizado primeiro
                    setTimeout(() => {
                        document.getElementById('notification-permission').classList.add('show');
                    }, 3000);
                }
            } else if (Notification.permission === 'granted') {
                // Garantir que background notifications estejam ativas
                this.activateBackgroundNotifications();
            }
        } else {
            this.showNotification('Seu navegador não suporta notificações.', 'error');
        }
    }

    // Ativar notificações em background
    activateBackgroundNotifications() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                console.log('Notificações em background ativadas');
                // Informar ao service worker que as notificações estão ativas
                if (registration.active) {
                    registration.active.postMessage({
                        type: 'NOTIFICATIONS_ENABLED',
                        settings: this.advancedNotificationSettings
                    });
                }
            });
        }
    }

    // Verificar status das permissões periodicamente
    checkNotificationPermissionStatus() {
        if ('Notification' in window) {
            const permission = Notification.permission;
            
            if (permission === 'denied') {
                this.showNotificationBanner(
                    '⚠️ Notificações bloqueadas. Para receber lembretes, ative as notificações nas configurações do navegador.'
                );
            } else if (permission === 'default') {
                // Mostrar prompt após algum tempo de uso
                setTimeout(() => {
                    this.requestNotificationPermission();
                }, 10000); // 10 segundos
            }
        }
    }

    // Esconder pedido de permissão
    hideNotificationPermission() {
        document.getElementById('notification-permission').classList.remove('show');
    }

    // Enviar notificação do navegador
    sendBrowserNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>',
                tag: 'birthday-reminder',
                requireInteraction: false,
                silent: false
            });

            // Fechar automaticamente após 5 segundos
            setTimeout(() => notification.close(), 5000);
        }
    }

    // Mostrar notificação temporária
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `toast-notification ${type}`;
        notification.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Adicionar estilos se não existirem
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 10px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                    word-wrap: break-word;
                }
                .toast-notification.success { background: #4ecdc4; }
                .toast-notification.error { background: #ff6b6b; }
                .toast-notification.info { background: #667eea; }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .toast-notification.show {
                    transform: translateX(0);
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remover após 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Iniciar timer para verificar notificações periodicamente
    startNotificationTimer() {
        // Verificar imediatamente
        this.checkNotifications();
        
        // Verificar a cada 30 minutos quando a página está ativa
        setInterval(() => {
            this.checkNotifications();
        }, 30 * 60 * 1000);

        // Verificar à meia-noite usando timeout calculado manualmente
        const now = new Date();
        const msUntilMidnight = (24 * 60 * 60 * 1000) - 
            (now.getHours() * 60 * 60 * 1000) - 
            (now.getMinutes() * 60 * 1000) - 
            (now.getSeconds() * 1000) - 
            now.getMilliseconds();
        
        setTimeout(() => {
            this.checkNotifications();
            // Depois configurar para verificar diariamente
            setInterval(() => {
                this.checkNotifications();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);

        // Configurar comunicação com Service Worker
        this.setupServiceWorkerCommunication();
    }

    // Configurar comunicação com Service Worker
    setupServiceWorkerCommunication() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data) {
                    switch (event.data.type) {
                        case 'GET_BIRTHDAYS':
                            event.ports[0].postMessage({
                                type: 'GET_BIRTHDAYS_RESPONSE',
                                data: this.birthdays
                            });
                            break;
                        case 'GET_NOTIFICATION_SETTINGS':
                            event.ports[0].postMessage({
                                type: 'GET_NOTIFICATION_SETTINGS_RESPONSE',
                                data: this.notificationSettings
                            });
                            break;
                        case 'SAVE_NOTIFICATION_SETTINGS':
                            this.notificationSettings = { ...this.notificationSettings, ...event.data.data };
                            this.saveNotificationSettings();
                            break;
                    }
                }
            });
        }
    }

    // Solicitar verificação no Service Worker
    requestServiceWorkerCheck() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'CHECK_BIRTHDAYS'
            });
        }
    }

    // Melhorar sistema de notificações com configurações personalizadas
    setupAdvancedNotifications() {
        // Configurações padrão de notificação
        const defaultSettings = {
            enabled: true,
            notifyOnDay: true,
            notifyDayBefore: true,
            notify3DaysBefore: true,
            notify1WeekBefore: true,
            notify2WeeksBefore: false,
            notify1MonthBefore: false,
            soundEnabled: true,
            persistentNotifications: true
        };

        // Carregar ou definir configurações
        const savedSettings = localStorage.getItem('advancedNotificationSettings');
        this.advancedNotificationSettings = savedSettings ? 
            { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
    }

    // Salvar configurações avançadas
    saveAdvancedNotificationSettings() {
        localStorage.setItem('advancedNotificationSettings', 
            JSON.stringify(this.advancedNotificationSettings));
    }

    // Verificar notificações com configurações avançadas
    checkAdvancedNotifications() {
        if (!this.advancedNotificationSettings.enabled) return;

        const today = DateUtils.getToday();
        const todayStr = `${today.year}-${today.month}-${today.day}`;

        this.birthdays.forEach(birthday => {
            const days = this.calculateDaysUntilBirthday(birthday.date);
            const notificationKey = `${birthday.id}_${todayStr}`;

            // Verificar se já notificou hoje para esta pessoa
            if (this.notificationSettings[notificationKey]) return;

            let shouldNotify = false;
            let message = '';
            let priority = 'normal';

            // Regras de notificação baseadas nas configurações
            if (days === 0 && this.advancedNotificationSettings.notifyOnDay) {
                shouldNotify = true;
                message = `🎉 Hoje é aniversário de ${birthday.name}! 🎂`;
                priority = 'high';
            } else if (days === 1 && this.advancedNotificationSettings.notifyDayBefore) {
                shouldNotify = true;
                message = `🎈 Amanhã é aniversário de ${birthday.name}!`;
                priority = 'high';
            } else if (days === 3 && this.advancedNotificationSettings.notify3DaysBefore) {
                shouldNotify = true;
                message = `⏰ Faltam 3 dias para o aniversário de ${birthday.name}!`;
            } else if (days === 7 && this.advancedNotificationSettings.notify1WeekBefore) {
                shouldNotify = true;
                message = `📅 Falta uma semana para o aniversário de ${birthday.name}!`;
            } else if (days === 14 && this.advancedNotificationSettings.notify2WeeksBefore) {
                shouldNotify = true;
                message = `🗓️ Faltam 14 dias para o aniversário de ${birthday.name}!`;
            } else if (days === 30 && this.advancedNotificationSettings.notify1MonthBefore) {
                shouldNotify = true;
                message = `📆 Falta um mês para o aniversário de ${birthday.name}!`;
            }

            if (shouldNotify) {
                this.showNotificationBanner(message);
                this.sendAdvancedBrowserNotification(`Lembrete de Aniversário`, message, {
                    priority: priority,
                    birthday: birthday,
                    daysUntil: days
                });
                
                // Marcar como notificado
                this.notificationSettings[notificationKey] = true;
                this.saveNotificationSettings();
            }
        });
    }

    // Enviar notificação avançada do navegador
    sendAdvancedBrowserNotification(title, body, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎂</text></svg>',
                tag: `birthday-reminder-${options.birthday?.id || Date.now()}`,
                requireInteraction: options.priority === 'high' && this.advancedNotificationSettings.persistentNotifications,
                silent: !this.advancedNotificationSettings.soundEnabled,
                timestamp: Date.now(),
                data: {
                    birthdayId: options.birthday?.id,
                    birthdayName: options.birthday?.name,
                    daysUntil: options.daysUntil,
                    url: window.location.href
                }
            });

            // Adicionar event listeners
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                notification.close();
            };

            // Fechar automaticamente se não for persistente
            if (!this.advancedNotificationSettings.persistentNotifications || options.priority !== 'high') {
                setTimeout(() => notification.close(), 8000);
            }

            return notification;
        }
    }

    // Alternar configurações de notificação
    toggleNotificationSettings() {
        const content = document.getElementById('settings-content');
        const toggleBtn = document.getElementById('toggle-settings');
        
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            toggleBtn.classList.add('rotated');
        } else {
            content.classList.add('collapsed');
            toggleBtn.classList.remove('rotated');
        }
    }

    // Carregar configurações para a interface
    loadSettingsToInterface() {
        const settings = this.advancedNotificationSettings;
        
        if (document.getElementById('notify-on-day')) {
            document.getElementById('notify-on-day').checked = settings.notifyOnDay;
            document.getElementById('notify-day-before').checked = settings.notifyDayBefore;
            document.getElementById('notify-3-days').checked = settings.notify3DaysBefore;
            document.getElementById('notify-1-week').checked = settings.notify1WeekBefore;
            document.getElementById('notify-2-weeks').checked = settings.notify2WeeksBefore;
            document.getElementById('notify-1-month').checked = settings.notify1MonthBefore;
            document.getElementById('sound-enabled').checked = settings.soundEnabled;
            document.getElementById('persistent-notifications').checked = settings.persistentNotifications;
            document.getElementById('background-notifications').checked = settings.enabled;
        }
    }

    // Atualizar configuração individual
    updateNotificationSetting(settingId, value) {
        const settingMap = {
            'notify-on-day': 'notifyOnDay',
            'notify-day-before': 'notifyDayBefore',
            'notify-3-days': 'notify3DaysBefore',
            'notify-1-week': 'notify1WeekBefore',
            'notify-2-weeks': 'notify2WeeksBefore',
            'notify-1-month': 'notify1MonthBefore',
            'sound-enabled': 'soundEnabled',
            'persistent-notifications': 'persistentNotifications',
            'background-notifications': 'enabled'
        };

        const settingKey = settingMap[settingId];
        if (settingKey) {
            this.advancedNotificationSettings[settingKey] = value;
            console.log(`Configuração ${settingKey} alterada para:`, value);
        }
    }

    // Salvar configurações de notificação
    saveNotificationSettings() {
        this.saveAdvancedNotificationSettings();
        
        // Atualizar Service Worker com novas configurações
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_SETTINGS',
                settings: this.advancedNotificationSettings
            });
        }

        this.showNotification('Configurações de notificação salvas com sucesso!', 'success');
        
        // Reativar notificações em background se necessário
        if (this.advancedNotificationSettings.enabled) {
            this.activateBackgroundNotifications();
        }
    }

    // Testar notificação
    testNotification() {
        const testMessages = [
            '🎉 Esta é uma notificação de teste! 🎂',
            '🎈 Testando o sistema de lembretes!',
            '⏰ Notificação funcionando perfeitamente!',
            '🎁 Seu sistema de aniversários está ativo!'
        ];

        const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
        
        this.showNotificationBanner(randomMessage);
        this.sendAdvancedBrowserNotification('Teste de Notificação', randomMessage, {
            priority: 'normal',
            birthday: { name: 'Sistema de Teste', id: 'test' },
            daysUntil: 0
        });

        console.log('Notificação de teste enviada');
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.birthdayManager = new BirthdayManager();
});

// Service Worker para notificações em background
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('Service Worker registrado com sucesso:', registration);
        
        // Verificar quando o Service Worker está pronto
        navigator.serviceWorker.ready.then(() => {
            console.log('Service Worker pronto para notificações em background');
        });
    }).catch(err => {
        console.log('Falha no registro do Service Worker:', err);
    });

    // Lidar com mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data) {
            switch (event.data.type) {
                case 'BIRTHDAY_NOTIFICATION':
                    if (window.birthdayManager) {
                        window.birthdayManager.showNotificationBanner(event.data.message);
                    }
                    break;
                case 'UPDATE_NOTIFICATION_SETTINGS':
                    if (window.birthdayManager) {
                        window.birthdayManager.notificationSettings = {
                            ...window.birthdayManager.notificationSettings,
                            ...event.data.settings
                        };
                        window.birthdayManager.saveNotificationSettings();
                    }
                    break;
            }
        }
    });
}

// Detectar quando a página fica visível novamente
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.birthdayManager) {
        // Verificar notificações quando a página volta a ficar visível
        window.birthdayManager.checkNotifications();
        window.birthdayManager.checkAdvancedNotifications();
    }
});

// Verificar notificações quando a página ganha foco
window.addEventListener('focus', () => {
    if (window.birthdayManager) {
        window.birthdayManager.checkNotifications();
        window.birthdayManager.checkAdvancedNotifications();
    }
});