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
    
    // Formatar string YYYY-MM-DD considerando idioma
    static formatDateString(dateString) {
        const [year, month, day] = dateString.split('-');
        const currentLang = window.i18nManager ? window.i18nManager.currentLang : 'pt';
        
        if (currentLang === 'en') {
            // Formato americano: MM/DD/YYYY
            return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
        } else {
            // Formato brasileiro: DD/MM/YYYY  
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
    }
}

// Classe principal para gerenciar aniversários - REESCRITA COMPLETA
class BirthdayManager {
    constructor() {
        this.birthdays = this.loadBirthdays();
        this.notificationSettings = this.loadNotificationSettings();
        this.setupAdvancedNotifications();
        this.initializeEventListeners();
        this.checkNotificationPermissionStatus();
        this.displayBirthdays();
        this.updateStats();
        this.checkNotifications();
        this.checkAdvancedNotifications();
        this.startNotificationTimer();
        
        // Gerenciar botão flutuante
        this.manageFloatingButton();
        
        // Solicitar permissão após 5 segundos
        setTimeout(() => {
            this.requestNotificationPermission();
        }, 5000);
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

        // Filtros - 5 botões funcionais
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Obter o filtro do botão clicado
                const filter = btn.getAttribute('data-filter');
                
                // Atualizar botões ativos IMEDIATAMENTE
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                
                // Aplicar filtro IMEDIATAMENTE
                this.displayBirthdays(filter);
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
        const addButton = document.querySelector('.btn-add');

        if (!name || !date) {
            shakeElement(addButton);
            showFeedbackMessage(window.i18nManager.translate('required_fields'), 'error');
            return;
        }

        // Verificar se já existe aniversário para esta pessoa
        if (this.birthdays.some(b => b.name.toLowerCase() === name.toLowerCase())) {
            shakeElement(addButton);
            showFeedbackMessage(window.i18nManager.translate('birthday_exists'), 'error');
            return;
        }

        // Mostrar estado de loading
        setButtonLoading(addButton, true);

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
                this.saveBirthdayAndUpdate(birthday, addButton);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            this.saveBirthdayAndUpdate(birthday, addButton);
        }
    }

    // Salvar aniversário e atualizar interface
    saveBirthdayAndUpdate(birthday, addButton) {
        this.birthdays.push(birthday);
        this.saveBirthdays();
        
        // Voltar sempre para o filtro "Todos" após adicionar
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const allButton = document.querySelector('[data-filter="all"]');
        if (allButton) {
            allButton.classList.add('active');
        }
        
        this.displayBirthdays('all'); // Forçar exibição de todos
        this.updateStats();
        
        // Feedback visual de sucesso
        setTimeout(() => {
            setButtonLoading(addButton, false);
            pulseElement(addButton);
            showFeedbackMessage(`${birthday.name} ${window.i18nManager.translate('birthday_added')}`, 'success');
            this.resetForm();
        }, 500); // Simula tempo de processamento
        
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
        if (!window.i18nManager) {
            // Fallback sem i18n
            if (days === 0) return 'Hoje é o aniversário!';
            if (days === 1) return 'Amanhã é o aniversário!';
            if (days <= 30) return `Faltam ${days} dias`;
            
            const months = Math.floor(days / 30);
            const remainingDays = days % 30;
            
            if (months === 1) {
                return remainingDays === 0 ? 'Falta 1 mês' : `Falta 1 mês e ${remainingDays} dias`;
            }
            
            return remainingDays === 0 ? `Faltam ${months} meses` : `Faltam ${months} meses e ${remainingDays} dias`;
        }
        
        // Com i18n
        if (days === 0) return window.i18nManager.translate('birthday_today');
        if (days === 1) return window.i18nManager.translate('birthday_tomorrow');
        if (days <= 30) return `${window.i18nManager.translate('days_remaining')} ${days} ${window.i18nManager.translate('days')}`;
        
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        
        if (months === 1) {
            return remainingDays === 0 ? 
                window.i18nManager.translate('one_month_remaining') : 
                `${window.i18nManager.translate('one_month_remaining')} ${window.i18nManager.translate('and')} ${remainingDays} ${window.i18nManager.translate('days')}`;
        }
        
        return remainingDays === 0 ? 
            `${window.i18nManager.translate('months_remaining')} ${months} ${window.i18nManager.translate('months')}` : 
            `${window.i18nManager.translate('months_remaining')} ${months} ${window.i18nManager.translate('months')} ${window.i18nManager.translate('and')} ${remainingDays} ${window.i18nManager.translate('days')}`;
    }

    // Obter classe CSS baseada na urgência
    getUrgencyClass(days) {
        if (days <= 7) return 'urgent';
        if (days <= 30) return 'upcoming';
        return 'normal';
    }

    // Filtrar aniversários
    displayBirthdays(filter = 'all') {
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
            // Urgente: 0-7 dias
            filteredBirthdays = this.birthdays.filter(b => this.calculateDaysUntilBirthday(b.date) <= 7);
        } else if (filter === 'soon') {
            // Em Breve: 8-30 dias
            filteredBirthdays = this.birthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days >= 8 && days <= 30;
            });
        } else if (filter === 'upcoming') {
            // Próximos: 31-90 dias
            filteredBirthdays = this.birthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days >= 31 && days <= 90;
            });
        } else if (filter === 'distant') {
            // Distantes: 90+ dias
            filteredBirthdays = this.birthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days > 90;
            });
        }

        // Ordenar por proximidade do aniversário
        filteredBirthdays.sort((a, b) => {
            return this.calculateDaysUntilBirthday(a.date) - this.calculateDaysUntilBirthday(b.date);
        });

        if (filteredBirthdays.length === 0) {
            const emptyTitle = window.i18nManager ? 
                window.i18nManager.translate('no_birthdays_found') : 
                'Nenhum aniversário encontrado';
            const emptyDesc = window.i18nManager ? 
                window.i18nManager.translate('no_birthdays_desc') : 
                'Não há aniversários que correspondam ao filtro selecionado.';
                
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>${emptyTitle}</h3>
                    <p>${emptyDesc}</p>
                </div>
            `;
            return;
        }

        // Organizar por colunas baseado na proximidade
        // Renderizar com layout linear (linha por linha)
        container.innerHTML = this.renderLinearLayout(filteredBirthdays);
    }

    organizeBirthdaysInColumns(birthdays) {
        const columns = {
            urgent: [],   // 0-7 dias
            soon: [],     // 8-30 dias  
            upcoming: [], // 31-90 dias
            distant: []   // 90+ dias
        };

        birthdays.forEach(birthday => {
            const days = this.calculateDaysUntilBirthday(birthday.date);
            
            if (days <= 7) {
                columns.urgent.push(birthday);
            } else if (days >= 8 && days <= 30) {
                columns.soon.push(birthday);
            } else if (days >= 31 && days <= 90) {
                columns.upcoming.push(birthday);
            } else {
                columns.distant.push(birthday);
            }
        });

        return columns;
    }

    renderColumnsHTML(columns) {
        const columnConfigs = [
            {
                key: 'urgent',
                title: '🚨 Urgente',
                titleEn: '🚨 Urgent',
                subtitle: '(Próximos 7 dias)',
                subtitleEn: '(Next 7 days)',
                class: 'column-urgent'
            },
            {
                key: 'soon',
                title: '⏰ Em Breve',
                titleEn: '⏰ Soon',
                subtitle: '(8-30 dias)',
                subtitleEn: '(8-30 days)',
                class: 'column-soon'
            },
            {
                key: 'upcoming',
                title: '📅 Próximos',
                titleEn: '📅 Upcoming',
                subtitle: '(31-90 dias)',
                subtitleEn: '(31-90 days)', 
                class: 'column-upcoming'
            },
            {
                key: 'distant',
                title: '🗓️ Distantes',
                titleEn: '🗓️ Distant',
                subtitle: '(90+ dias)',
                subtitleEn: '(90+ days)',
                class: 'column-distant'
            }
        ];

        return columnConfigs
            .filter(config => columns[config.key].length > 0)
            .map(config => {
                const isEnglish = window.i18nManager && window.i18nManager.currentLang === 'en';
                const title = isEnglish ? config.titleEn : config.title;
                const subtitle = isEnglish ? config.subtitleEn : config.subtitle;
                
                return `
                    <div class="birthday-column ${config.class}">
                        <div class="column-header">
                            <h3 class="column-title">${title}</h3>
                            <p class="column-count">${columns[config.key].length} ${isEnglish ? 'birthdays' : 'aniversários'} ${subtitle}</p>
                        </div>
                        ${columns[config.key].map(birthday => this.renderBirthdayCard(birthday)).join('')}
                    </div>
                `;
            }).join('');
    }

    renderBirthdayCard(birthday) {
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
                        <span class="current-age">${currentAge} ${window.i18nManager ? window.i18nManager.translate('years_old') : 'anos'}</span>
                        <span class="next-age">Fará ${nextAge} ${window.i18nManager ? window.i18nManager.translate('years_old') : 'anos'} em ${nextBirthdayDate}</span>
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
    }

    // Renderizar layout linear (linha por linha)
    renderLinearLayout(birthdays) {
        if (birthdays.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🎉</div>
                    <h3 data-i18n="no_birthdays">Nenhum aniversário cadastrado</h3>
                    <p data-i18n="add_birthday_hint">Adicione alguns aniversários para começar!</p>
                </div>
            `;
        }

        // Ordenar aniversários por dias restantes
        const sortedBirthdays = [...birthdays].sort((a, b) => {
            const daysA = this.calculateDaysUntilBirthday(a.date);
            const daysB = this.calculateDaysUntilBirthday(b.date);
            return daysA - daysB;
        });

        return `
            <div class="linear-birthdays">
                ${sortedBirthdays.map(birthday => this.renderBirthdayCard(birthday)).join('')}
            </div>
        `;
    }

    // Filtrar aniversários (função simplificada)
    filterBirthdays(filter) {
        // Atualizar botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-filter="${filter}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Renderizar com filtro
        this.displayBirthdays(filter);
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
        const deleteButton = document.querySelector('.btn-delete');
        
        // Mostrar loading no botão de delete
        if (deleteButton) {
            setButtonLoading(deleteButton, true);
        }
        
        setTimeout(() => {
            this.birthdays = this.birthdays.filter(b => b.id !== this.deleteId);
            this.saveBirthdays();
            this.displayBirthdays();
            this.updateStats();
            this.hideModal();
            
            if (deleteButton) {
                setButtonLoading(deleteButton, false);
            }
            
            const deleteMessage = window.i18nManager ? 
                `${birthday.name} ${window.i18nManager.translate('birthday_deleted')}` :
                `Aniversário de ${birthday.name} removido com sucesso!`;
            showFeedbackMessage(deleteMessage, 'success');
            delete this.deleteId;
        }, 300); // Simula tempo de processamento
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
            const currentPermission = Notification.permission;
            
            if (currentPermission === 'default' || force) {
                if (force) {
                    // Mostrar explicação antes de solicitar permissão
                    this.showNotificationExplanation().then((userAccepted) => {
                        if (userAccepted) {
                            Notification.requestPermission().then(permission => {
                                this.handleNotificationPermissionResult(permission);
                                this.hideNotificationPermission();
                            });
                        } else {
                            this.hideNotificationPermission();
                        }
                    });
                } else {
                    // Mostrar prompt personalizado após algum tempo
                    setTimeout(() => {
                        this.showCustomNotificationPrompt();
                    }, 5000);
                }
            } else if (currentPermission === 'granted') {
                // Garantir que background notifications estejam ativas
                this.activateBackgroundNotifications();
            } else if (currentPermission === 'denied') {
                // Mostrar instruções para reativar manualmente
                this.showManualActivationInstructions();
            }
        } else {
            this.showNotification('Seu navegador não suporta notificações.', 'error');
        }
    }

    // Mostrar explicação personalizada antes de solicitar permissão
    showNotificationExplanation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'notification-explanation-modal';
            modal.innerHTML = `
                <div class="explanation-content">
                    <div class="explanation-header">
                        <h3>🔔 Ativar Notificações</h3>
                        <p>Para nunca mais esquecer um aniversário!</p>
                    </div>
                    <div class="explanation-body">
                        <div class="benefit-item">
                            <i class="fas fa-bell"></i>
                            <div>
                                <strong>Lembretes Automáticos</strong>
                                <small>Receba alertas mesmo com o site fechado</small>
                            </div>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-mobile-alt"></i>
                            <div>
                                <strong>No Seu Celular</strong>
                                <small>Notificações na tela de bloqueio</small>
                            </div>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>No Tempo Certo</strong>
                                <small>1 dia, 3 dias ou 1 semana antes</small>
                            </div>
                        </div>
                    </div>
                    <div class="explanation-actions">
                        <button class="btn-allow-detailed">
                            <i class="fas fa-check"></i> Sim, Ativar Notificações
                        </button>
                        <button class="btn-deny-detailed">
                            <i class="fas fa-times"></i> Agora Não
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.classList.add('show');

            // Event listeners
            modal.querySelector('.btn-allow-detailed').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
            modal.querySelector('.btn-deny-detailed').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
        });
    }

    // Mostrar prompt personalizado menos intrusivo
    showCustomNotificationPrompt() {
        // Detectar se é mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        const banner = document.createElement('div');
        banner.className = 'custom-notification-prompt';
        banner.innerHTML = `
            <div class="prompt-content">
                <div class="prompt-icon">🔔</div>
                <div class="prompt-text">
                    <strong>${isMobile ? 'Configure as notificações' : 'Quer receber lembretes?'}</strong>
                    <small>${isMobile ? 'Toque em "Ativar" e depois "Permitir" quando aparecer' : 'Ative as notificações para nunca esquecer um aniversário'}</small>
                </div>
                <div class="prompt-actions">
                    <button class="btn-prompt-allow">${isMobile ? 'Configurar' : 'Ativar'}</button>
                    <button class="btn-prompt-deny">×</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('show'), 100);

        // Event listeners
        banner.querySelector('.btn-prompt-allow').onclick = () => {
            // Para mobile, mostrar instruções específicas primeiro
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                this.showMobileSpecificInstructions();
            }
            this.requestNotificationPermission(true);
            document.body.removeChild(banner);
        };
        banner.querySelector('.btn-prompt-deny').onclick = () => {
            document.body.removeChild(banner);
        };

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(banner)) {
                document.body.removeChild(banner);
            }
        }, 10000);
    }

    // Tratar resultado da permissão
    handleNotificationPermissionResult(permission) {
        if (permission === 'granted') {
            this.showNotification('🎉 Notificações ativadas com sucesso! Você receberá lembretes mesmo quando não estiver no site.', 'success');
            this.activateBackgroundNotifications();
        } else if (permission === 'denied') {
            this.showNotification('❌ Notificações negadas. Você pode ativar nas configurações do navegador.', 'error');
            // Mostrar instruções para reativar
            setTimeout(() => {
                this.showManualActivationInstructions();
            }, 3000);
        } else {
            this.showNotification('⚠️ Permissão de notificação pendente.', 'info');
        }
    }

    // Mostrar instruções para ativação manual
    showManualActivationInstructions() {
        const instructionsBanner = document.createElement('div');
        instructionsBanner.className = 'manual-instructions-banner';
        instructionsBanner.innerHTML = `
            <div class="instructions-content">
                <div class="instructions-header">
                    <i class="fas fa-info-circle"></i>
                    <strong>Como Ativar Notificações Manualmente</strong>
                    <button class="close-instructions">×</button>
                </div>
                <div class="instructions-steps">
                    <div class="instruction-step">
                        <span class="step-number">1</span>
                        <span>Clique no ícone do cadeado 🔒 ao lado do endereço</span>
                    </div>
                    <div class="instruction-step">
                        <span class="step-number">2</span>
                        <span>Encontre "Notificações" e mude para "Permitir"</span>
                    </div>
                    <div class="instruction-step">
                        <span class="step-number">3</span>
                        <span>Recarregue a página</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(instructionsBanner);
        instructionsBanner.classList.add('show');

        // Event listener para fechar
        instructionsBanner.querySelector('.close-instructions').onclick = () => {
            document.body.removeChild(instructionsBanner);
        };

        // Auto remove after 15 seconds
        setTimeout(() => {
            if (document.body.contains(instructionsBanner)) {
                document.body.removeChild(instructionsBanner);
            }
        }, 15000);
    }

    // Mostrar instruções específicas para mobile
    showMobileSpecificInstructions() {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);
        
        let deviceInstructions = '';
        let deviceIcon = '📱';
        
        if (isAndroid && isChrome) {
            deviceIcon = '🤖';
            deviceInstructions = `
                <div class="mobile-instruction-step">
                    <span class="step-number">1</span>
                    <div>
                        <strong>Toque no cadeado 🔒</strong>
                        <small>Ao lado do endereço na barra superior</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">2</span>
                    <div>
                        <strong>Procure "Notificações"</strong>
                        <small>Na lista de permissões</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">3</span>
                    <div>
                        <strong>Mude para "Permitir"</strong>
                        <small>Pode aparecer um botão "Permitir" também</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">4</span>
                    <div>
                        <strong>Recarregue a página</strong>
                        <small>Puxe a tela para baixo ou toque em ↻</small>
                    </div>
                </div>
            `;
        } else if (isIOS) {
            deviceIcon = '🍎';
            deviceInstructions = `
                <div class="mobile-instruction-step">
                    <span class="step-number">1</span>
                    <div>
                        <strong>Adicione à Tela de Início</strong>
                        <small>Safari → Compartilhar → "Adicionar à Tela de Início"</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">2</span>
                    <div>
                        <strong>Abra como App</strong>
                        <small>Use o ícone criado na tela de início</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">3</span>
                    <div>
                        <strong>Vá em Configurações</strong>
                        <small>Configurações → Notificações → Safari</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">4</span>
                    <div>
                        <strong>Ative as Notificações</strong>
                        <small>Certifique-se que estão habilitadas</small>
                    </div>
                </div>
            `;
        } else {
            deviceInstructions = `
                <div class="mobile-instruction-step">
                    <span class="step-number">1</span>
                    <div>
                        <strong>Acesse as Configurações</strong>
                        <small>Menu do navegador → Configurações</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">2</span>
                    <div>
                        <strong>Procure "Notificações"</strong>
                        <small>Ou "Permissões de Site"</small>
                    </div>
                </div>
                <div class="mobile-instruction-step">
                    <span class="step-number">3</span>
                    <div>
                        <strong>Encontre este site</strong>
                        <small>E permita as notificações</small>
                    </div>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.className = 'mobile-instructions-modal';
        modal.innerHTML = `
            <div class="mobile-instructions-content">
                <div class="mobile-instructions-header">
                    <h3>${deviceIcon} Como Ativar no seu Dispositivo</h3>
                    <button class="close-mobile-instructions">×</button>
                </div>
                <div class="mobile-instructions-body">
                    <p>Siga estes passos para ativar as notificações:</p>
                    <div class="mobile-instructions-steps">
                        ${deviceInstructions}
                    </div>
                    <div class="mobile-instructions-tip">
                        <i class="fas fa-lightbulb"></i>
                        <div>
                            <strong>Dica:</strong>
                            <small>Após seguir os passos, volte aqui e teste uma notificação para confirmar que está funcionando!</small>
                        </div>
                    </div>
                </div>
                <div class="mobile-instructions-actions">
                    <button class="btn-understood">Entendi, vou configurar</button>
                    <button class="btn-test-after" disabled>Testar Notificação</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('show');

        // Event listeners
        modal.querySelector('.close-mobile-instructions').onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.querySelector('.btn-understood').onclick = () => {
            document.body.removeChild(modal);
            // Habilitar botão de teste após um tempo
            setTimeout(() => {
                const testBtn = document.querySelector('.btn-test-after');
                if (testBtn) {
                    testBtn.disabled = false;
                    testBtn.textContent = '✓ Configurei, testar agora';
                }
            }, 5000);
        };

        // Verificar permissão periodicamente e habilitar botão de teste
        const checkInterval = setInterval(() => {
            const testBtn = modal.querySelector('.btn-test-after');
            if (testBtn && Notification.permission === 'granted') {
                testBtn.disabled = false;
                testBtn.innerHTML = '<i class="fas fa-check"></i> Testar Notificação';
                testBtn.onclick = () => {
                    this.testNotification();
                    document.body.removeChild(modal);
                };
                clearInterval(checkInterval);
            }
        }, 1000);
    }

    // Gerenciar botão flutuante de notificação
    manageFloatingButton() {
        const floatingBtn = document.getElementById('floating-notification-btn');
        if (!floatingBtn) return;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        const updateButtonVisibility = () => {
            const permission = Notification.permission;
            
            if (permission === 'denied') {
                // Mostrar botão para reativar
                floatingBtn.classList.remove('hidden');
                setTimeout(() => floatingBtn.classList.add('show'), 100);
                
                // Atualizar texto do botão
                const btnElement = floatingBtn.querySelector('button');
                const icon = btnElement.querySelector('i');
                const text = btnElement.querySelector('span');
                
                icon.className = 'fas fa-bell-slash';
                text.textContent = isMobile ? 'Configurar Notificações' : 'Ativar Notificações';
                btnElement.style.background = 'linear-gradient(135deg, #ff6b6b, #ff5252)';
                
            } else if (permission === 'granted') {
                // Esconder botão quando permitido
                floatingBtn.classList.remove('show');
                setTimeout(() => floatingBtn.classList.add('hidden'), 400);
                
            } else if (permission === 'default') {
                // Mostrar botão com texto diferente
                floatingBtn.classList.remove('hidden');
                setTimeout(() => floatingBtn.classList.add('show'), 100);
                
                const btnElement = floatingBtn.querySelector('button');
                const icon = btnElement.querySelector('i');
                const text = btnElement.querySelector('span');
                
                icon.className = 'fas fa-bell';
                text.textContent = isMobile ? 'Configurar Alertas' : 'Permitir Notificações';
                btnElement.style.background = 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))';
            }
        };

        // Verificar inicialmente
        updateButtonVisibility();
        
        // Verificar periodicamente (caso usuario mude nas configurações do navegador)
        setInterval(updateButtonVisibility, 3000);
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

// === FUNÇÕES DE FEEDBACK VISUAL ===

// Função para definir estado de loading em botões
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = '<i class="fas fa-spinner"></i> Processando...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
            button.innerHTML = originalText;
            button.removeAttribute('data-original-text');
        }
    }
}

// Função para animação de feedback de sucesso
function pulseElement(element) {
    element.classList.remove('success-feedback');
    // Force reflow
    element.offsetHeight;
    element.classList.add('success-feedback');
    
    setTimeout(() => {
        element.classList.remove('success-feedback');
    }, 600);
}

// Função para animação de feedback de erro
function shakeElement(element) {
    element.classList.remove('error-feedback');
    // Force reflow
    element.offsetHeight;
    element.classList.add('error-feedback');
    
    setTimeout(() => {
        element.classList.remove('error-feedback');
    }, 600);
}

// Função para exibir mensagens de feedback temporárias
function showFeedbackMessage(message, type = 'success', duration = 3000) {
    // Remove mensagens existentes
    const existingMessages = document.querySelectorAll('.feedback-message');
    existingMessages.forEach(msg => msg.remove());
    
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = `feedback-message feedback-${type}`;
    feedbackDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar estilos inline para posicionamento
    feedbackDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
    `;
    
    document.body.appendChild(feedbackDiv);
    
    // Animar entrada
    requestAnimationFrame(() => {
        feedbackDiv.style.transform = 'translateX(0)';
    });
    
    // Remover após duração especificada
    setTimeout(() => {
        feedbackDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (feedbackDiv.parentNode) {
                feedbackDiv.parentNode.removeChild(feedbackDiv);
            }
        }, 300);
    }, duration);
}

// === SISTEMA DE TEMAS ===

class ThemeManager {
    constructor() {
        this.currentTheme = this.getSavedTheme();
        console.log('Tema salvo:', this.currentTheme);
        this.initializeTheme();
        this.setupThemeSelector();
    }

    getSavedTheme() {
        return localStorage.getItem('selectedTheme') || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem('selectedTheme', theme);
    }

    initializeTheme() {
        this.applyTheme(this.currentTheme);
        this.updateThemeSelector();
    }

    applyTheme(theme) {
        const body = document.body;
        const root = document.documentElement;
        
        console.log('Aplicando tema:', theme);
        
        // Remove todas as classes de tema anteriores
        body.removeAttribute('data-theme');
        
        // Limpar propriedades CSS personalizadas se não for tema custom
        if (theme !== 'custom') {
            console.log('Limpando propriedades personalizadas');
            this.clearCustomProperties();
        }
        
        // Aplicar novo tema
        if (theme === 'custom') {
            console.log('Carregando tema personalizado');
            // Carregar tema personalizado do localStorage
            this.loadCustomTheme();
        } else if (theme !== 'light') {
            console.log('Aplicando tema padrão:', theme);
            body.setAttribute('data-theme', theme);
        }

        this.currentTheme = theme;
        this.saveTheme(theme);

        // Atualizar meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const primaryColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--primary-color').trim();
            metaThemeColor.setAttribute('content', primaryColor || '#667eea');
        }
    }

    updateThemeSelector() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect && this.currentTheme !== 'custom') {
            themeSelect.value = this.currentTheme;
        }
    }

    setupThemeSelector() {
        const themeSelect = document.getElementById('theme-select');
        const customPanel = document.getElementById('custom-theme-panel');
        const applyCustomBtn = document.getElementById('apply-custom');
        const closeCustomBtn = document.getElementById('close-custom');

        console.log('Setup theme selector, elemento encontrado:', themeSelect);

        if (!themeSelect) {
            console.warn('Theme select element not found!');
            return;
        }

        // Set current theme in select
        themeSelect.value = this.currentTheme;

        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            console.log('Mudando para tema:', theme);
            
            if (theme === 'custom') {
                this.showCustomThemePanel();
            } else {
                this.hideCustomThemePanel();
                this.applyTheme(theme);
                
                // Feedback visual
                const themeName = window.i18nManager ? 
                    window.i18nManager.translate('theme_' + theme) : 
                    this.getThemeName(theme);
                const appliedText = window.i18nManager ? 
                    window.i18nManager.translate('theme_applied') : 
                    'aplicado!';
                showFeedbackMessage(`${themeName} ${appliedText}`, 'success', 2000);
            }
        });

        // Custom theme panel handlers
        if (applyCustomBtn) {
            applyCustomBtn.addEventListener('click', () => {
                this.applyCustomTheme();
            });
        }

        if (closeCustomBtn) {
            closeCustomBtn.addEventListener('click', () => {
                this.hideCustomThemePanel();
                themeSelect.value = this.currentTheme; // Reset to current theme
            });
        }
    }

    getThemeName(theme) {
        const names = {
            light: 'Claro',
            dark: 'Escuro',
            colorblind: 'Daltônico',
            custom: 'Personalizado'
        };
        return names[theme] || theme;
    }

    showCustomThemePanel() {
        const panel = document.getElementById('custom-theme-panel');
        if (panel) {
            panel.classList.remove('hidden');
            
            // Load current colors if custom theme is already applied
            if (this.currentTheme === 'custom') {
                this.loadCustomColors();
            }
        }
    }

    hideCustomThemePanel() {
        const panel = document.getElementById('custom-theme-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    loadCustomColors() {
        const root = document.documentElement;
        const primaryColorInput = document.getElementById('primary-color');
        const backgroundColorInput = document.getElementById('background-color');
        const textColorInput = document.getElementById('text-color');

        if (primaryColorInput) {
            const primaryColor = getComputedStyle(root).getPropertyValue('--primary-color').trim();
            if (primaryColor) primaryColorInput.value = primaryColor;
        }

        if (backgroundColorInput) {
            const bgColor = getComputedStyle(root).getPropertyValue('--background-color').trim();
            if (bgColor) backgroundColorInput.value = bgColor;
        }

        if (textColorInput) {
            const textColor = getComputedStyle(root).getPropertyValue('--text-primary').trim();
            if (textColor) textColorInput.value = textColor;
        }
    }

    clearCustomProperties() {
        const root = document.documentElement;
        const customProperties = [
            '--primary-color',
            '--primary-hover', 
            '--secondary-color',
            '--text-color',
            '--text-primary',
            '--text-secondary',
            '--bg-color',
            '--background-color',
            '--card-bg',
            '--card-background',
            '--border-color',
            '--shadow-color',
            '--gradient-start',
            '--gradient-end',
            '--input-bg',
            '--input-border',
            '--input-focus-border',
            '--button-hover-bg',
            '--accent-color',
            '--success-color',
            '--warning-color',
            '--error-color',
            '--gradient-bg',
            '--primary-gradient'
        ];
        
        console.log('Limpando propriedades personalizadas:', customProperties);
        customProperties.forEach(prop => {
            root.style.removeProperty(prop);
        });
        
        // Force browser to recalculate styles
        document.body.offsetHeight;
    }

    getCustomTheme() {
        const savedTheme = localStorage.getItem('custom-theme');
        return savedTheme ? JSON.parse(savedTheme) : null;
    }

    loadCustomTheme() {
        const customTheme = this.getCustomTheme();
        console.log('Carregando tema personalizado:', customTheme);
        if (customTheme) {
            const root = document.documentElement;
            // Load saved custom properties
            Object.entries(customTheme).forEach(([key, value]) => {
                root.style.setProperty(`--${key}`, value);
                // Also set the actual CSS variable (without custom prefix)
                const actualKey = key.replace('custom-', '');
                root.style.setProperty(`--${actualKey}`, value);
            });
        }
    }

    applyCustomTheme() {
        const primaryColor = document.getElementById('primary-color')?.value || '#805ad5';
        const backgroundColor = document.getElementById('background-color')?.value || '#ffffff';
        const textColor = document.getElementById('text-color')?.value || '#2d3748';

        const root = document.documentElement;
        
        // Primeiro limpa todas as propriedades existentes
        this.clearCustomProperties();
        
        // Apply custom colors with specific custom prefix
        root.style.setProperty('--custom-primary-color', primaryColor);
        root.style.setProperty('--custom-primary-hover', this.lightenColor(primaryColor, 10));
        root.style.setProperty('--custom-background-color', backgroundColor);
        root.style.setProperty('--custom-text-primary', textColor);
        root.style.setProperty('--custom-text-secondary', this.adjustOpacity(textColor, 0.7));
        
        // Set card background based on background color brightness
        const isLight = this.isLightColor(backgroundColor);
        const cardBg = isLight ? 
            this.adjustOpacity(backgroundColor, 0.8) : 
            this.lightenColor(backgroundColor, 5);
            
        root.style.setProperty('--custom-card-background', cardBg);
        root.style.setProperty('--custom-border-color', this.adjustOpacity(textColor, 0.2));
        root.style.setProperty('--custom-secondary-color', this.lightenColor(primaryColor, 20));
        
        // Apply to actual CSS variables
        root.style.setProperty('--primary-color', primaryColor);
        root.style.setProperty('--primary-hover', this.lightenColor(primaryColor, 10));
        root.style.setProperty('--background-color', backgroundColor);
        root.style.setProperty('--text-primary', textColor);
        root.style.setProperty('--text-secondary', this.adjustOpacity(textColor, 0.7));
        root.style.setProperty('--card-background', cardBg);
        root.style.setProperty('--border-color', this.adjustOpacity(textColor, 0.2));
        root.style.setProperty('--secondary-color', this.lightenColor(primaryColor, 20));

        // Update current theme and save
        this.currentTheme = 'custom';
        localStorage.setItem('selectedTheme', 'custom');
        
        // Save custom colors with custom prefix
        const customTheme = {
            'custom-primary-color': primaryColor,
            'custom-background-color': backgroundColor,
            'custom-text-primary': textColor,
            'custom-card-background': cardBg,
            'custom-secondary-color': this.lightenColor(primaryColor, 20)
        };
        localStorage.setItem('custom-theme', JSON.stringify(customTheme));

        // Switch theme selector to custom
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = 'custom';
        }

        this.hideCustomThemePanel();
        const message = window.i18nManager ? 
            window.i18nManager.translate('custom_theme_applied') : 
            'Tema personalizado aplicado!';
        showFeedbackMessage(message, 'success', 2000);
    }

    lightenColor(color, percent) {
        // Simple color lightening (this is a basic implementation)
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    adjustOpacity(color, opacity) {
        // Convert hex to rgba with opacity
        const num = parseInt(color.replace("#", ""), 16);
        const R = num >> 16;
        const G = num >> 8 & 0x00FF;
        const B = num & 0x0000FF;
        return `rgba(${R}, ${G}, ${B}, ${opacity})`;
    }

    isLightColor(color) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
    }

    pulseButton(button) {
        button.style.transform = 'scale(0.9)';
        button.style.transition = 'all 0.1s ease';
        
        setTimeout(() => {
            button.style.transform = 'scale(1.05)';
            button.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 100);
    }
}

// Inicializar gerenciador de temas quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.i18nManager = new I18nManager();
});

// === SISTEMA DE INTERNACIONALIZAÇÃO (i18n) ===

class I18nManager {
    constructor() {
        this.currentLang = this.getSavedLanguage();
        this.translations = {
            'pt': {
                // Header
                'app_title': 'Lembrete de Aniversários',
                'app_subtitle': 'Nunca mais esqueça um aniversário importante!',
                'menu_btn': 'Menu',
                'version_btn': 'v4.0.0',
                
                // Form
                'add_birthday_title': 'Adicionar Novo Aniversário',
                'person_name_label': 'Nome da Pessoa',
                'person_name_placeholder': 'Digite o nome...',
                'birth_date_label': 'Data de Nascimento',
                'description_label': 'Descrição (opcional)',
                'description_placeholder': 'Digite uma descrição...',
                'photo_label': 'Foto (opcional)',
                'add_btn': 'Adicionar Aniversário',
                'processing': 'Processando...',
                
                // Birthdays section
                'birthdays_title': 'Próximos Aniversários',
                'delete_btn': 'Excluir',
                'confirm_delete': 'Confirmar Exclusão',
                'confirm_delete_msg': 'Tem certeza que deseja excluir o aniversário de',
                'cancel_btn': 'Cancelar',
                'confirm_btn': 'Confirmar',
                
                // Messages
                'required_fields': 'Por favor, preencha todos os campos obrigatórios!',
                'birthday_exists': 'Já existe um aniversário cadastrado para esta pessoa!',
                'birthday_added': 'adicionado com sucesso!',
                'birthday_deleted': 'removido com sucesso!',
                'no_birthdays_found': 'Nenhum aniversário encontrado',
                'no_birthdays_desc': 'Não há aniversários que correspondam ao filtro selecionado.',
                
                // Time expressions
                'birthday_today': 'Hoje é o aniversário!',
                'birthday_tomorrow': 'Amanhã é o aniversário!',
                'days_remaining': 'Faltam',
                'days': 'dias',
                'months': 'meses',
                'one_month_remaining': 'Falta 1 mês',
                'months_remaining': 'Faltam',
                'and': 'e',
                
                // Themes
                'theme_light': '☀️ Tema Claro',
                'theme_dark': '🌙 Tema Escuro',
                'theme_colorblind': '🎯 Tema Daltônico',
                'theme_custom': '🎨 Personalizado',
                'theme_applied': 'aplicado!',
                'custom_theme_applied': 'Tema personalizado aplicado!',
                'customize_theme_title': '🎨 Personalizar Tema',
                'primary_color_label': 'Cor Principal:',
                'background_color_label': 'Cor de Fundo:',
                'text_color_label': 'Cor do Texto:',
                'apply_btn': 'Aplicar',
                'close_btn': 'Fechar',
                
                // Months
                'january': 'Janeiro',
                'february': 'Fevereiro',
                'march': 'Março',
                'april': 'Abril',
                'may': 'Maio',
                'june': 'Junho',
                'july': 'Julho',
                'august': 'Agosto',
                'september': 'Setembro',
                'october': 'Outubro',
                'november': 'Novembro',
                'december': 'Dezembro',
                
                // Days of week
                'sunday': 'Domingo',
                'monday': 'Segunda-feira',
                'tuesday': 'Terça-feira',
                'wednesday': 'Quarta-feira',
                'thursday': 'Quinta-feira',
                'friday': 'Sexta-feira',
                'saturday': 'Sábado',
                
                // Notifications
                'today': 'hoje',
                'tomorrow': 'amanhã',
                'days_until': 'dias até o aniversário',
                'years_old': 'anos'
            },
            'en': {
                // Header
                'app_title': 'Birthday Reminders',
                'app_subtitle': 'Never forget an important birthday again!',
                'menu_btn': 'Menu',
                'version_btn': 'v4.0.0',
                
                // Form
                'add_birthday_title': 'Add New Birthday',
                'person_name_label': 'Person Name',
                'person_name_placeholder': 'Enter name...',
                'birth_date_label': 'Birth Date',
                'description_label': 'Description (optional)',
                'description_placeholder': 'Enter description...',
                'photo_label': 'Photo (optional)',
                'add_btn': 'Add Birthday',
                'processing': 'Processing...',
                
                // Birthdays section
                'birthdays_title': 'Upcoming Birthdays',
                'delete_btn': 'Delete',
                'confirm_delete': 'Confirm Deletion',
                'confirm_delete_msg': 'Are you sure you want to delete the birthday of',
                'cancel_btn': 'Cancel',
                'confirm_btn': 'Confirm',
                
                // Messages
                'required_fields': 'Please fill in all required fields!',
                'birthday_exists': 'A birthday already exists for this person!',
                'birthday_added': 'added successfully!',
                'birthday_deleted': 'deleted successfully!',
                'no_birthdays_found': 'No birthdays found',
                'no_birthdays_desc': 'There are no birthdays matching the selected filter.',
                
                // Time expressions
                'birthday_today': 'Birthday today!',
                'birthday_tomorrow': 'Birthday tomorrow!',
                'days_remaining': 'Days remaining:',
                'days': 'days',
                'months': 'months',
                'one_month_remaining': '1 month remaining',
                'months_remaining': 'months remaining:',
                'and': 'and',
                
                // Themes
                'theme_light': '☀️ Light Theme',
                'theme_dark': '🌙 Dark Theme',
                'theme_colorblind': '🎯 Colorblind-Friendly',
                'theme_custom': '🎨 Custom',
                'theme_applied': 'applied!',
                'custom_theme_applied': 'Custom theme applied!',
                'customize_theme_title': '🎨 Customize Theme',
                'primary_color_label': 'Primary Color:',
                'background_color_label': 'Background Color:',
                'text_color_label': 'Text Color:',
                'apply_btn': 'Apply',
                'close_btn': 'Close',
                
                // Months
                'january': 'January',
                'february': 'February',
                'march': 'March',
                'april': 'April',
                'may': 'May',
                'june': 'June',
                'july': 'July',
                'august': 'August',
                'september': 'September',
                'october': 'October',
                'november': 'November',
                'december': 'December',
                
                // Days of week
                'sunday': 'Sunday',
                'monday': 'Monday',
                'tuesday': 'Tuesday',
                'wednesday': 'Wednesday',
                'thursday': 'Thursday',
                'friday': 'Friday',
                'saturday': 'Saturday',
                
                // Notifications
                'today': 'today',
                'tomorrow': 'tomorrow',
                'days_until': 'days until birthday',
                'years_old': 'years old',
                
                // Languages
                'language_pt': 'Portuguese',
                'language_en': 'English', 
                'language_applied': 'selected!',
                
                // Notifications bar
                'close_notification': 'Close',
                
                // Settings and filters
                'notification_settings': 'Notification Settings',
                'notification_on_day': 'On birthday',
                'notification_on_day_desc': 'Notify exactly on the day',
                'notification_1_day': '1 day before',
                'notification_1_day_desc': 'Reminder the day before',
                'notification_3_days': '3 days before',
                'notification_3_days_desc': 'Early warning',
                'notification_1_week': '1 week before',
                'notification_1_week_desc': 'Advanced planning',
                'notification_2_weeks': '2 weeks before',
                'notification_2_weeks_desc': 'Very early',
                'notification_1_month': '1 month before',
                'notification_1_month_desc': 'Long-term planning',
                'sound_notifications': 'Sound on notifications',
                'persistent_notifications': 'Persistent notifications',
                'persistent_notifications_desc': 'Stay on screen until closed',
                'background_notifications': 'Background notifications',
                'background_notifications_desc': 'Receive alerts even with site closed',
                'test_notification': 'Test Notification',
                'save_settings': 'Save Settings',
                'mobile_guide': '📱 How to Use on Mobile',
                'install_as_app': 'Install as App:',
                'install_as_app_desc': 'Chrome: Menu → "Install app". Will work as native app!',
                'system_settings': 'System Settings:',
                'system_settings_desc': 'Go to Settings → Notifications → [Browser] and enable permissions.',
                'compatibility': '🔍 Compatibility:',
                'android_chrome_label': 'Android Chrome',
                'fully_functional': '100% functional',
                'samsung_internet': 'Samsung Internet',
                'iphone_safari': 'iPhone Safari',
                'install_pwa': 'Install as PWA',
                'firefox_mobile': 'Firefox Mobile',
                'limitations': 'Limitations',
                'android_chrome_edge_label': 'Android (Chrome/Edge):',
                'android_chrome_edge_desc': 'Works automatically! Allow notifications when prompted.',
                'iphone_ipad_label': 'iPhone/iPad:',
                'safari_install_instruction': 'For better performance: Safari → Share → "Add to Home Screen"',
                'filters_all': 'All',
                'filters_urgent': 'Urgent',
                'filters_soon': 'Soon',
                'filters_upcoming': 'Upcoming',
                'filters_distant': 'Distant',
                'no_birthdays_title': 'No birthdays registered',
                'no_birthdays_desc': 'Add your first birthday reminder above!',
                'birth_date_help': 'Enter the complete birth date (day/month/year)',
                'description_help': 'Add a description to remember who this person is'
            },
            'pt': {
                // Header
                'app_title': 'Lembrete de Aniversários',
                'app_subtitle': 'Nunca mais esqueça um aniversário importante!',
                'menu_btn': 'Menu',
                'version_btn': 'v4.0.0',
                
                // Form
                'add_birthday_title': 'Adicionar Novo Aniversário',
                'person_name_label': 'Nome da Pessoa',
                'person_name_placeholder': 'Digite o nome...',
                'birth_date_label': 'Data de Nascimento',
                'description_label': 'Descrição (opcional)',
                'description_placeholder': 'Digite uma descrição...',
                'photo_label': 'Foto (opcional)',
                'add_btn': 'Adicionar Aniversário',
                'processing': 'Processando...',
                
                // Birthdays section
                'birthdays_title': 'Próximos Aniversários',
                'delete_btn': 'Excluir',
                'confirm_delete': 'Confirmar Exclusão',
                'confirm_delete_msg': 'Tem certeza que deseja excluir o aniversário de',
                'cancel_btn': 'Cancelar',
                'confirm_btn': 'Confirmar',
                
                // Messages
                'required_fields': 'Por favor, preencha todos os campos obrigatórios!',
                'birthday_exists': 'Já existe um aniversário cadastrado para esta pessoa!',
                'birthday_added': 'adicionado com sucesso!',
                'birthday_deleted': 'removido com sucesso!',
                'no_birthdays_found': 'Nenhum aniversário encontrado',
                'no_birthdays_desc': 'Não há aniversários que correspondam ao filtro selecionado.',
                
                // Time expressions
                'birthday_today': 'Hoje é o aniversário!',
                'birthday_tomorrow': 'Amanhã é o aniversário!',
                'days_remaining': 'Faltam',
                'days': 'dias',
                'months': 'meses',
                'one_month_remaining': 'Falta 1 mês',
                'months_remaining': 'Faltam',
                'and': 'e',
                
                // Themes
                'theme_light': '☀️ Tema Claro',
                'theme_dark': '🌙 Tema Escuro',
                'theme_colorblind': '🎯 Tema Daltônico',
                'theme_custom': '🎨 Personalizado',
                'theme_applied': 'aplicado!',
                'custom_theme_applied': 'Tema personalizado aplicado!',
                'customize_theme_title': '🎨 Personalizar Tema',
                'primary_color_label': 'Cor Principal:',
                'background_color_label': 'Cor de Fundo:',
                'text_color_label': 'Cor do Texto:',
                'apply_btn': 'Aplicar',
                'close_btn': 'Fechar',
                
                // Months
                'january': 'Janeiro',
                'february': 'Fevereiro',
                'march': 'Março',
                'april': 'Abril',
                'may': 'Maio',
                'june': 'Junho',
                'july': 'Julho',
                'august': 'Agosto',
                'september': 'Setembro',
                'october': 'Outubro',
                'november': 'Novembro',
                'december': 'Dezembro',
                
                // Days of week
                'sunday': 'Domingo',
                'monday': 'Segunda-feira',
                'tuesday': 'Terça-feira',
                'wednesday': 'Quarta-feira',
                'thursday': 'Quinta-feira',
                'friday': 'Sexta-feira',
                'saturday': 'Sábado',
                
                // Notifications
                'today': 'hoje',
                'tomorrow': 'amanhã',
                'days_until': 'dias até o aniversário',
                'years_old': 'anos',
                
                // Languages
                'language_pt': 'Português',
                'language_en': 'English', 
                'language_applied': 'selecionado!',
                
                // Notifications bar
                'close_notification': 'Fechar',
                
                // Settings and filters
                'notification_settings': 'Configurações de Notificação',
                'notification_on_day': 'No dia do aniversário',
                'notification_on_day_desc': 'Notificar exatamente no dia',
                'notification_1_day': '1 dia antes',
                'notification_1_day_desc': 'Lembrete no dia anterior',
                'notification_3_days': '3 dias antes',
                'notification_3_days_desc': 'Aviso antecipado',
                'notification_1_week': '1 semana antes',
                'notification_1_week_desc': 'Planejamento antecipado',
                'notification_2_weeks': '2 semanas antes',
                'notification_2_weeks_desc': 'Muito antecipado',
                'notification_1_month': '1 mês antes',
                'notification_1_month_desc': 'Planejamento longo prazo',
                'sound_notifications': 'Som nas notificações',
                'persistent_notifications': 'Notificações persistentes',
                'persistent_notifications_desc': 'Permanecem na tela até serem fechadas',
                'background_notifications': 'Notificações em segundo plano',
                'background_notifications_desc': 'Receber alertas mesmo com o site fechado',
                'test_notification': 'Testar Notificação',
                'save_settings': 'Salvar Configurações',
                'mobile_guide': '📱 Como Usar no Celular',
                'install_as_app': 'Instalar como App:',
                'install_as_app_desc': 'Chrome: Menu → "Instalar app". Funcionará como aplicativo nativo!',
                'system_settings': 'Configurações do Sistema:',
                'system_settings_desc': 'Vá em Configurações → Notificações → [Navegador] e ative as permissões.',
                'compatibility': '🔍 Compatibilidade:',
                'android_chrome_label': 'Android Chrome',
                'fully_functional': '100% funcional',
                'samsung_internet': 'Samsung Internet',
                'iphone_safari': 'iPhone Safari',
                'install_pwa': 'Instalar como PWA',
                'firefox_mobile': 'Firefox Mobile',
                'limitations': 'Limitações',
                'android_chrome_edge_label': 'Android (Chrome/Edge):',
                'android_chrome_edge_desc': 'Funciona automaticamente! Permita notificações quando solicitado.',
                'iphone_ipad_label': 'iPhone/iPad:',
                'safari_install_instruction': 'Para melhor funcionamento: Safari → Compartilhar → "Adicionar à Tela de Início"',
                'filters_all': 'Todos',
                'filters_urgent': 'Urgentes',
                'filters_soon': 'Em Breve',
                'filters_upcoming': 'Próximos',
                'filters_distant': 'Distantes',
                'no_birthdays_title': 'Nenhum aniversário cadastrado',
                'no_birthdays_desc': 'Adicione seu primeiro lembrete de aniversário acima!',
                'birth_date_help': 'Digite a data de nascimento completa (dia/mês/ano)',
                'description_help': 'Adicione uma descrição para lembrar quem é esta pessoa'
            }
        };
        this.initializeLanguage();
    }

    getSavedLanguage() {
        const saved = localStorage.getItem('selectedLanguage');
        if (saved) return saved;
        
        // Detectar idioma do navegador
        const browserLang = navigator.language || navigator.languages[0];
        return browserLang.startsWith('pt') ? 'pt' : 'en';
    }

    saveLanguage(lang) {
        localStorage.setItem('selectedLanguage', lang);
    }

    translate(key) {
        return this.translations[this.currentLang][key] || this.translations['pt'][key] || key;
    }

    setLanguage(lang) {
        this.currentLang = lang;
        this.saveLanguage(lang);
        this.updateInterface();
        this.updateLanguageSelector();
        showFeedbackMessage(`${this.translate('language_' + lang)} ${this.translate('language_applied')}`, 'success', 2000);
    }

    initializeLanguage() {
        this.updateInterface();
        this.setupLanguageSelector();
    }

    updateInterface() {
        // Atualizar título da página
        document.title = `🎂 ${this.translate('app_title')}`;
        
        // Atualizar textos com data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (element.tagName === 'INPUT' && element.type !== 'submit') {
                element.placeholder = this.translate(key);
            } else {
                element.textContent = this.translate(key);
            }
        });
        
        // Atualizar selectors
        this.updateSelectors();
        
        // Atualizar labels
        document.querySelectorAll('label[data-i18n]').forEach(label => {
            const key = label.getAttribute('data-i18n');
            label.textContent = this.translate(key);
        });
        
        // Recarregar aniversários para atualizar datas formatadas
        if (window.birthdayManager) {
            window.birthdayManager.displayBirthdays();
        }
    }

    setupLanguageSelector() {
        const languageSelect = document.getElementById('language-select');
        
        console.log('Setup language selector, elemento encontrado:', languageSelect);
        
        if (languageSelect) {
            // Set current language
            languageSelect.value = this.currentLang;
            
            // Add event listener
            languageSelect.addEventListener('change', (e) => {
                console.log('Mudando idioma para:', e.target.value);
                this.setLanguage(e.target.value);
                
                // Feedback message usando i18n
                const langKey = `language_${e.target.value}`;
                const langText = this.translate(langKey);
                const appliedText = this.translate('language_applied');
                showFeedbackMessage(`${langText} ${appliedText}`, 'success', 2000);
            });
        } else {
            console.warn('Language select element not found!');
        }
    }

    updateLanguageSelector() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.lang === this.currentLang) {
                btn.classList.add('active');
            }
        });
    }

    updateSelectors() {
        // Update theme selector options
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            const options = themeSelect.querySelectorAll('option');
            options.forEach(option => {
                const themeKey = 'theme_' + option.value;
                const translatedText = this.translate(themeKey);
                if (translatedText !== themeKey) {
                    option.textContent = translatedText;
                }
            });
        }

        // Update language selector options
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.currentLang;
        }
    }

    formatDate(dateString, format = 'long') {
        const date = new Date(dateString + 'T00:00:00');
        const options = format === 'long' ? 
            { year: 'numeric', month: 'long', day: 'numeric' } :
            { month: 'short', day: 'numeric' };
        
        return date.toLocaleDateString(this.currentLang === 'pt' ? 'pt-BR' : 'en-US', options);
    }
}