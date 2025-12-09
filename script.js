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
        this.currentSort = 'proximity'; // proximity | alphabetical
        this.currentSearch = '';
        this.currentFilter = 'all'; // Rastrear filtro ativo
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
        
        // Verificar confetti para aniversariantes do dia
        setTimeout(() => this.checkAndShowConfetti(), 500);
        
        // Inicializar swipe para mobile
        this.initializeSwipeGestures();
        
        // Inicializar indicador offline
        this.initializeOfflineIndicator();
        
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

        // Pesquisa
        const searchInput = document.getElementById('search-input');
        const clearSearchBtn = document.getElementById('clear-search');
        
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentSearch = e.target.value;
                    this.displayBirthdays(this.currentFilter);
                    
                    // Mostrar/ocultar botão de limpar
                    if (clearSearchBtn) {
                        clearSearchBtn.classList.toggle('hidden', !e.target.value);
                    }
                }, 300);
            });
        }
        
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.currentSearch = '';
                this.displayBirthdays(this.currentFilter);
                clearSearchBtn.classList.add('hidden');
            });
        }

        // Toggle de ordenação
        const sortToggle = document.getElementById('sort-toggle');
        if (sortToggle) {
            sortToggle.addEventListener('click', () => {
                this.currentSort = this.currentSort === 'proximity' ? 'alphabetical' : 'proximity';
                const icon = sortToggle.querySelector('i');
                const text = sortToggle.querySelector('span');
                
                if (this.currentSort === 'alphabetical') {
                    icon.className = 'fas fa-sort-alpha-down';
                    text.textContent = 'A-Z';
                } else {
                    icon.className = 'fas fa-sort-amount-down';
                    text.textContent = 'Proximidade';
                }
                
                this.displayBirthdays(this.currentFilter);
            });
        }

        // Menu de ações (dropdown)
        const actionsToggle = document.getElementById('actions-toggle');
        const actionsMenu = document.getElementById('actions-menu');
        
        if (actionsToggle && actionsMenu) {
            actionsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                actionsMenu.classList.toggle('hidden');
            });
            
            document.addEventListener('click', () => {
                actionsMenu.classList.add('hidden');
            });
        }

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
        
        // Toggle do painel de notas
        const notesToggle = document.getElementById('notes-toggle');
        const notesPanel = document.getElementById('notes-panel');
        
        if (notesToggle && notesPanel) {
            notesToggle.addEventListener('click', () => {
                notesPanel.classList.toggle('show');
                notesToggle.classList.toggle('active');
                const chevron = notesToggle.querySelector('.fa-chevron-down');
                if (chevron) {
                    chevron.style.transform = notesPanel.classList.contains('show') ? 'rotate(180deg)' : '';
                }
            });
        }
    }

    // Adicionar novo aniversário
    addBirthday() {
        const name = document.getElementById('person-name').value.trim();
        const date = document.getElementById('birth-date').value;
        const description = document.getElementById('person-description').value.trim();
        const phone = document.getElementById('person-phone')?.value.trim() || null;
        const photoInput = document.getElementById('person-photo');
        const addButton = document.querySelector('.btn-add');
        
        // Coletar notas e preferências
        const preferences = {
            likes: document.getElementById('person-likes')?.value.trim() || null,
            dislikes: document.getElementById('person-dislikes')?.value.trim() || null,
            clothingSize: document.getElementById('person-clothing-size')?.value.trim() || null,
            shoeSize: document.getElementById('person-shoe-size')?.value.trim() || null,
            favoriteColor: document.getElementById('person-favorite-color')?.value.trim() || null,
            giftIdeas: document.getElementById('person-gift-ideas')?.value.trim() || null,
            notes: document.getElementById('person-notes')?.value.trim() || null
        };
        
        // Verificar se tem alguma preferência preenchida
        const hasPreferences = Object.values(preferences).some(v => v !== null);

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
            phone: phone,
            photo: null,
            priority: 0, // 0-3 estrelas de prioridade
            preferences: hasPreferences ? preferences : null,
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
        
        // Feedback visual de sucesso com toast
        setTimeout(() => {
            setButtonLoading(addButton, false);
            pulseElement(addButton);
            this.showToast(`🎉 ${birthday.name} foi adicionado com sucesso!`, 'success');
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
        
        // Fechar painel de notas se estiver aberto
        const notesPanel = document.getElementById('notes-panel');
        const notesToggle = document.getElementById('notes-toggle');
        if (notesPanel) {
            notesPanel.classList.remove('show');
        }
        if (notesToggle) {
            notesToggle.classList.remove('active');
            const chevron = notesToggle.querySelector('.fa-chevron-down');
            if (chevron) {
                chevron.style.transform = '';
            }
        }
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

        // Aplicar pesquisa
        let filteredBirthdays = this.currentSearch ? 
            this.searchBirthdays(this.currentSearch) : 
            this.birthdays;

        // Filtrar por categoria
        if (filter === 'urgent') {
            filteredBirthdays = filteredBirthdays.filter(b => this.calculateDaysUntilBirthday(b.date) <= 7);
        } else if (filter === 'soon') {
            filteredBirthdays = filteredBirthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days >= 8 && days <= 30;
            });
        } else if (filter === 'upcoming') {
            filteredBirthdays = filteredBirthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days >= 31 && days <= 90;
            });
        } else if (filter === 'distant') {
            filteredBirthdays = filteredBirthdays.filter(b => {
                const days = this.calculateDaysUntilBirthday(b.date);
                return days > 90;
            });
        }

        // Aplicar ordenação
        filteredBirthdays = this.sortBirthdays(filteredBirthdays, this.currentSort);

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
        
        // Reinicializar swipe para novos cards
        this.initializeSwipeGestures();
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
        
        // Verificar se tem telefone para mostrar botão WhatsApp
        const whatsappButton = birthday.phone ? `
            <button class="btn-whatsapp" onclick="birthdayManager.showWhatsAppModal(birthdayManager.birthdays.find(b => b.id === ${birthday.id}))" title="Enviar Parabéns">
                <i class="fab fa-whatsapp"></i>
            </button>
        ` : '';
        
        // Indicador de "Hoje é aniversário"
        const todayBadge = days === 0 ? '<span class="today-badge">🎉 HOJE!</span>' : '';
        
        // Sistema de Prioridade (Estrelas)
        const priority = birthday.priority || 0;
        const stars = ['☆', '☆', '☆'];
        for (let i = 0; i < priority; i++) {
            stars[i] = '⭐';
        }
        const priorityHTML = `
            <div class="priority-stars" onclick="birthdayManager.togglePriority(${birthday.id})" title="Definir prioridade">
                ${stars.join('')}
            </div>
        `;
        
        // Renderizar notas/preferências se existirem
        const notesPreview = this.renderNotesPreview(birthday.preferences);

        return `
            <div class="birthday-card ${urgencyClass}" data-id="${birthday.id}">
                ${todayBadge}
                ${priorityHTML}
                <div class="swipe-container">
                    <div class="card-main-content">
                        <div class="card-left-section">
                            ${birthday.photo ? 
                                `<img src="${birthday.photo}" alt="${birthday.name}" class="birthday-photo">` :
                                `<div class="default-avatar">${birthday.name.charAt(0).toUpperCase()}</div>`
                            }
                        </div>
                        <div class="card-center-section">
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
                            ${notesPreview}
                        </div>
                        <div class="card-right-section">
                            <div class="birthday-actions">
                                ${whatsappButton}
                                <button class="btn-edit" onclick="birthdayManager.editBirthday(${birthday.id})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-delete" onclick="birthdayManager.deleteBirthday(${birthday.id})" title="Excluir">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="swipe-actions">
                        <button class="swipe-edit" onclick="birthdayManager.editBirthday(${birthday.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="swipe-delete" onclick="birthdayManager.deleteBirthday(${birthday.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Renderizar preview das notas/preferências no card
    renderNotesPreview(preferences) {
        if (!preferences) return '';
        
        const items = [];
        
        if (preferences.likes) {
            items.push(`<span class="note-item"><i class="fas fa-heart"></i> ${preferences.likes}</span>`);
        }
        if (preferences.dislikes) {
            items.push(`<span class="note-item"><i class="fas fa-ban"></i> ${preferences.dislikes}</span>`);
        }
        if (preferences.clothingSize) {
            items.push(`<span class="note-item"><i class="fas fa-tshirt"></i> ${preferences.clothingSize}</span>`);
        }
        if (preferences.shoeSize) {
            items.push(`<span class="note-item"><i class="fas fa-shoe-prints"></i> ${preferences.shoeSize}</span>`);
        }
        if (preferences.favoriteColor) {
            items.push(`<span class="note-item"><i class="fas fa-palette"></i> ${preferences.favoriteColor}</span>`);
        }
        if (preferences.giftIdeas) {
            items.push(`<span class="note-item"><i class="fas fa-gift"></i> ${preferences.giftIdeas}</span>`);
        }
        if (preferences.notes) {
            items.push(`<span class="note-item"><i class="fas fa-clipboard"></i> ${preferences.notes.substring(0, 50)}${preferences.notes.length > 50 ? '...' : ''}</span>`);
        }
        
        if (items.length === 0) return '';
        
        return `
            <div class="birthday-notes-preview">
                <h5><i class="fas fa-sticky-note"></i> Notas e Preferências</h5>
                <div class="notes-content">
                    ${items.slice(0, 4).join('')}
                    ${items.length > 4 ? `<span class="note-item">+${items.length - 4} mais</span>` : ''}
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

        // Salvar filtro atual
        this.currentFilter = filter;

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
            this.displayBirthdays(this.currentFilter);
            this.updateStats();
            this.hideModal();
            
            if (deleteButton) {
                setButtonLoading(deleteButton, false);
            }
            
            // Toast notification ao deletar
            this.showToast(`🗑️ ${birthday.name} foi removido com sucesso!`, 'info');
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

    // ==========================================
    // IMPORTAÇÃO E EXPORTAÇÃO DE DADOS
    // ==========================================

    // Exportar backup completo (JSON)
    exportBackup() {
        const backup = {
            version: '4.0.0',
            exportDate: new Date().toISOString(),
            birthdays: this.birthdays,
            settings: this.advancedNotificationSettings
        };
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aniversarios-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showFeedbackMessage(window.i18nManager?.translate('backup_exported') || 'Backup exportado com sucesso!', 'success');
    }

    // Importar backup (JSON)
    importBackup(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                if (backup.birthdays && Array.isArray(backup.birthdays)) {
                    // Merge ou substituir
                    const existingIds = new Set(this.birthdays.map(b => b.id));
                    let imported = 0;
                    
                    backup.birthdays.forEach(birthday => {
                        // Garantir que tem os campos necessários
                        if (birthday.name && birthday.date) {
                            if (!existingIds.has(birthday.id)) {
                                birthday.id = birthday.id || Date.now() + Math.random();
                                birthday.phone = birthday.phone || null;
                                this.birthdays.push(birthday);
                                imported++;
                            }
                        }
                    });
                    
                    this.saveBirthdays();
                    this.displayBirthdays(this.currentFilter);
                    this.updateStats();
                    
                    showFeedbackMessage(
                        `${imported} ${window.i18nManager?.translate('birthdays_imported') || 'aniversários importados com sucesso!'}`,
                        'success'
                    );
                } else {
                    throw new Error('Formato inválido');
                }
            } catch (error) {
                showFeedbackMessage(
                    window.i18nManager?.translate('import_error') || 'Erro ao importar arquivo. Verifique o formato.',
                    'error'
                );
            }
        };
        reader.readAsText(file);
    }

    // Exportar para CSV
    exportToCSV() {
        const headers = ['Nome', 'Data de Nascimento', 'Descrição', 'Telefone'];
        const rows = this.birthdays.map(b => [
            `"${b.name}"`,
            b.date,
            `"${b.description || ''}"`,
            `"${b.phone || ''}"`
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aniversarios-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showFeedbackMessage('CSV exportado com sucesso!', 'success');
    }

    // Importar de CSV
    importFromCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const lines = e.target.result.split('\n').filter(line => line.trim());
                const hasHeader = lines[0].toLowerCase().includes('nome') || lines[0].toLowerCase().includes('name');
                const startIndex = hasHeader ? 1 : 0;
                
                let imported = 0;
                const existingNames = new Set(this.birthdays.map(b => b.name.toLowerCase()));
                
                for (let i = startIndex; i < lines.length; i++) {
                    const values = this.parseCSVLine(lines[i]);
                    if (values.length >= 2) {
                        const name = values[0].replace(/"/g, '').trim();
                        const dateStr = values[1].replace(/"/g, '').trim();
                        const description = values[2]?.replace(/"/g, '').trim() || null;
                        const phone = values[3]?.replace(/"/g, '').trim() || null;
                        
                        // Converter data se necessário (DD/MM/YYYY para YYYY-MM-DD)
                        let date = dateStr;
                        if (dateStr.includes('/')) {
                            const parts = dateStr.split('/');
                            if (parts.length === 3) {
                                if (parts[2].length === 4) {
                                    date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                                }
                            }
                        }
                        
                        if (name && date && !existingNames.has(name.toLowerCase())) {
                            this.birthdays.push({
                                id: Date.now() + Math.random(),
                                name,
                                date,
                                description,
                                phone,
                                photo: null,
                                createdAt: new Date().toISOString()
                            });
                            existingNames.add(name.toLowerCase());
                            imported++;
                        }
                    }
                }
                
                this.saveBirthdays();
                this.displayBirthdays(this.currentFilter);
                this.updateStats();
                
                showFeedbackMessage(`${imported} aniversários importados do CSV!`, 'success');
            } catch (error) {
                showFeedbackMessage('Erro ao importar CSV. Verifique o formato.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Auxiliar para parse de linha CSV
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    // Importar de VCF (Google Contacts)
    importFromVCF(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const vcards = content.split('BEGIN:VCARD').filter(v => v.trim());
                
                let imported = 0;
                const existingNames = new Set(this.birthdays.map(b => b.name.toLowerCase()));
                
                vcards.forEach(vcard => {
                    // Extrair nome
                    const fnMatch = vcard.match(/FN[;:](.+)/i);
                    const bdayMatch = vcard.match(/BDAY[;:](\d{4})-?(\d{2})-?(\d{2})/i) || 
                                     vcard.match(/BDAY[;:](\d{4})(\d{2})(\d{2})/i);
                    const telMatch = vcard.match(/TEL[;:].*?:?(\+?[\d\s-]+)/i);
                    
                    if (fnMatch && bdayMatch) {
                        const name = fnMatch[1].trim();
                        const date = `${bdayMatch[1]}-${bdayMatch[2]}-${bdayMatch[3]}`;
                        const phone = telMatch ? telMatch[1].replace(/[\s-]/g, '') : null;
                        
                        if (!existingNames.has(name.toLowerCase())) {
                            this.birthdays.push({
                                id: Date.now() + Math.random(),
                                name,
                                date,
                                description: null,
                                phone,
                                photo: null,
                                createdAt: new Date().toISOString()
                            });
                            existingNames.add(name.toLowerCase());
                            imported++;
                        }
                    }
                });
                
                this.saveBirthdays();
                this.displayBirthdays(this.currentFilter);
                this.updateStats();
                
                showFeedbackMessage(`${imported} contactos importados do VCF!`, 'success');
            } catch (error) {
                showFeedbackMessage('Erro ao importar VCF. Verifique o formato.', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Exportar para ICS (Calendário)
    exportToICS() {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Lembrete de Aniversários//PT',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];
        
        this.birthdays.forEach(birthday => {
            const birthDate = DateUtils.parseDate(birthday.date);
            const currentYear = DateUtils.getToday().year;
            
            // Criar evento recorrente anual
            const dtstart = `${currentYear}${String(birthDate.month).padStart(2, '0')}${String(birthDate.day).padStart(2, '0')}`;
            
            icsContent.push(
                'BEGIN:VEVENT',
                `UID:birthday-${birthday.id}@aniversarios`,
                `DTSTART;VALUE=DATE:${dtstart}`,
                `DTEND;VALUE=DATE:${dtstart}`,
                `SUMMARY:🎂 Aniversário de ${birthday.name}`,
                `DESCRIPTION:${birthday.description || `Aniversário de ${birthday.name}`}`,
                'RRULE:FREQ=YEARLY',
                `CREATED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                'END:VEVENT'
            );
        });
        
        icsContent.push('END:VCALENDAR');
        
        const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aniversarios-${new Date().toISOString().split('T')[0]}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showFeedbackMessage('Calendário ICS exportado com sucesso!', 'success');
    }

    // ==========================================
    // INTEGRAÇÃO WHATSAPP + TEMPLATES
    // ==========================================

    // Templates de mensagens de parabéns
    getMessageTemplates() {
        return {
            formal: [
                'Desejo-lhe um feliz aniversário! Que este novo ciclo seja repleto de realizações e momentos especiais. Parabéns!',
                'Feliz aniversário! Que a vida lhe reserve o melhor sempre. Muitas felicidades!',
                'Parabéns pelo seu aniversário! Desejo-lhe muita saúde, paz e prosperidade neste novo ano de vida.',
                'É com grande alegria que lhe desejo um feliz aniversário. Que todos os seus sonhos se realizem!'
            ],
            divertida: [
                'Eeeee parabéns! 🎉🎂 Mais um ano de pura diversão pela frente! Aproveita muito!',
                'Feliz aniversário! 🎈🥳 Que a festa seja épica e a ressaca leve! Haha',
                'Parabéééns! 🎊 Hoje é seu dia de brilhar! Bora comemorar como se não houvesse amanhã! 🎉',
                'Hey! Feliz aniversário! 🎂 Espero que ganhe muitos presentes e coma muito bolo! 🍰'
            ],
            curta: [
                'Feliz aniversário! 🎂',
                'Parabéns! 🎉',
                'Tudo de bom! 🎈',
                'Muitas felicidades! 🎊',
                'Felicidades! 🥳'
            ]
        };
    }

    // Obter mensagem aleatória por tipo
    getRandomMessage(type = 'divertida') {
        const templates = this.getMessageTemplates();
        const messages = templates[type] || templates.divertida;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    // Gerar link do WhatsApp
    generateWhatsAppLink(phone, message) {
        // Limpar número de telefone
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }

    // Abrir modal de mensagem WhatsApp
    showWhatsAppModal(birthday) {
        const templates = this.getMessageTemplates();
        
        const modal = document.createElement('div');
        modal.className = 'whatsapp-modal';
        modal.innerHTML = `
            <div class="whatsapp-modal-content">
                <div class="whatsapp-modal-header">
                    <h3><i class="fab fa-whatsapp"></i> Enviar Parabéns para ${birthday.name}</h3>
                    <button class="close-whatsapp-modal">×</button>
                </div>
                <div class="whatsapp-modal-body">
                    <p>Escolha o tipo de mensagem:</p>
                    <div class="message-types">
                        <button class="message-type-btn active" data-type="formal">
                            <i class="fas fa-user-tie"></i> Formal
                        </button>
                        <button class="message-type-btn" data-type="divertida">
                            <i class="fas fa-laugh"></i> Divertida
                        </button>
                        <button class="message-type-btn" data-type="curta">
                            <i class="fas fa-bolt"></i> Curta
                        </button>
                    </div>
                    <div class="message-preview">
                        <label>Prévia da mensagem:</label>
                        <textarea id="whatsapp-message" rows="4">${this.getRandomMessage('formal')}</textarea>
                    </div>
                    <button class="btn-shuffle-message">
                        <i class="fas fa-random"></i> Outra mensagem
                    </button>
                </div>
                <div class="whatsapp-modal-footer">
                    <button class="btn-copy-message">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <a href="${this.generateWhatsAppLink(birthday.phone, this.getRandomMessage('formal'))}" 
                       target="_blank" class="btn-send-whatsapp" id="whatsapp-link">
                        <i class="fab fa-whatsapp"></i> Enviar no WhatsApp
                    </a>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Event listeners
        let currentType = 'formal';
        
        modal.querySelector('.close-whatsapp-modal').onclick = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.querySelectorAll('.message-type-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.message-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentType = btn.dataset.type;
                const message = this.getRandomMessage(currentType);
                modal.querySelector('#whatsapp-message').value = message;
                modal.querySelector('#whatsapp-link').href = this.generateWhatsAppLink(birthday.phone, message);
            };
        });
        
        modal.querySelector('.btn-shuffle-message').onclick = () => {
            const message = this.getRandomMessage(currentType);
            modal.querySelector('#whatsapp-message').value = message;
            modal.querySelector('#whatsapp-link').href = this.generateWhatsAppLink(birthday.phone, message);
        };
        
        modal.querySelector('.btn-copy-message').onclick = () => {
            const message = modal.querySelector('#whatsapp-message').value;
            navigator.clipboard.writeText(message);
            showFeedbackMessage('Mensagem copiada!', 'success');
        };
        
        // Atualizar link quando a mensagem for editada manualmente
        modal.querySelector('#whatsapp-message').oninput = (e) => {
            modal.querySelector('#whatsapp-link').href = this.generateWhatsAppLink(birthday.phone, e.target.value);
        };
    }

    // ==========================================
    // PESQUISA E ORDENAÇÃO
    // ==========================================

    // Pesquisar aniversários por nome
    searchBirthdays(query) {
        if (!query || query.trim() === '') {
            return this.birthdays;
        }
        const lowerQuery = query.toLowerCase().trim();
        return this.birthdays.filter(b => 
            b.name.toLowerCase().includes(lowerQuery) ||
            (b.description && b.description.toLowerCase().includes(lowerQuery))
        );
    }

    // Ordenar aniversários
    sortBirthdays(birthdays, sortType = 'proximity') {
        const sorted = [...birthdays];
        
        console.log('Ordenando por:', sortType);
        
        switch (sortType) {
            case 'alphabetical':
                sorted.sort((a, b) => {
                    const nameA = a.name.toLowerCase().trim();
                    const nameB = b.name.toLowerCase().trim();
                    const result = nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
                    console.log(`Comparando: "${nameA}" vs "${nameB}" = ${result}`);
                    return result;
                });
                console.log('Resultado ordenado:', sorted.map(b => b.name));
                break;
            case 'alphabetical-desc':
                sorted.sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    return nameB.localeCompare(nameA, 'pt-BR');
                });
                break;
            case 'proximity':
            default:
                sorted.sort((a, b) => 
                    this.calculateDaysUntilBirthday(a.date) - this.calculateDaysUntilBirthday(b.date)
                );
                break;
        }
        
        return sorted;
    }

    // ==========================================
    // ESTATÍSTICAS (DASHBOARD)
    // ==========================================

    getStatistics() {
        if (this.birthdays.length === 0) {
            return null;
        }

        // Contagem por mês
        const monthCounts = {};
        const monthNames = {
            1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
            5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
            9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
        };
        
        let totalAge = 0;
        let ageCount = 0;
        const signCounts = {};

        this.birthdays.forEach(birthday => {
            const date = DateUtils.parseDate(birthday.date);
            
            // Contar por mês
            monthCounts[date.month] = (monthCounts[date.month] || 0) + 1;
            
            // Calcular idade
            const age = this.calculateCurrentAge(birthday.date);
            if (age > 0 && age < 120) {
                totalAge += age;
                ageCount++;
            }
            
            // Determinar signo
            const sign = this.getZodiacSign(date.month, date.day);
            signCounts[sign] = (signCounts[sign] || 0) + 1;
        });

        // Encontrar mês com mais aniversários
        let maxMonth = 1;
        let maxCount = 0;
        for (const [month, count] of Object.entries(monthCounts)) {
            if (count > maxCount) {
                maxCount = count;
                maxMonth = parseInt(month);
            }
        }

        // Encontrar signo mais comum
        let topSign = '';
        let topSignCount = 0;
        for (const [sign, count] of Object.entries(signCounts)) {
            if (count > topSignCount) {
                topSignCount = count;
                topSign = sign;
            }
        }

        // Próximos aniversários (7 dias)
        const upcomingCount = this.birthdays.filter(b => 
            this.calculateDaysUntilBirthday(b.date) <= 7
        ).length;

        return {
            total: this.birthdays.length,
            busiestMonth: monthNames[maxMonth],
            busiestMonthCount: maxCount,
            averageAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0,
            topSign,
            topSignCount,
            upcomingCount,
            monthDistribution: monthCounts
        };
    }

    getZodiacSign(month, day) {
        const signs = [
            { sign: '♑ Capricórnio', start: [1, 1], end: [1, 19] },
            { sign: '♒ Aquário', start: [1, 20], end: [2, 18] },
            { sign: '♓ Peixes', start: [2, 19], end: [3, 20] },
            { sign: '♈ Áries', start: [3, 21], end: [4, 19] },
            { sign: '♉ Touro', start: [4, 20], end: [5, 20] },
            { sign: '♊ Gêmeos', start: [5, 21], end: [6, 20] },
            { sign: '♋ Câncer', start: [6, 21], end: [7, 22] },
            { sign: '♌ Leão', start: [7, 23], end: [8, 22] },
            { sign: '♍ Virgem', start: [8, 23], end: [9, 22] },
            { sign: '♎ Libra', start: [9, 23], end: [10, 22] },
            { sign: '♏ Escorpião', start: [10, 23], end: [11, 21] },
            { sign: '♐ Sagitário', start: [11, 22], end: [12, 21] },
            { sign: '♑ Capricórnio', start: [12, 22], end: [12, 31] }
        ];

        for (const { sign, start, end } of signs) {
            if ((month === start[0] && day >= start[1]) || (month === end[0] && day <= end[1])) {
                return sign;
            }
        }
        return '♑ Capricórnio';
    }

    showStatisticsModal() {
        const stats = this.getStatistics();
        
        if (!stats) {
            showFeedbackMessage('Adicione alguns aniversários para ver estatísticas!', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'statistics-modal';
        modal.innerHTML = `
            <div class="statistics-modal-content">
                <div class="statistics-modal-header">
                    <h3><i class="fas fa-chart-pie"></i> Estatísticas Curiosas</h3>
                    <button class="close-statistics-modal">×</button>
                </div>
                <div class="statistics-modal-body">
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-value">${stats.total}</div>
                            <div class="stat-label">Aniversários Cadastrados</div>
                        </div>
                        <div class="stat-card highlight">
                            <div class="stat-icon">📅</div>
                            <div class="stat-value">${stats.busiestMonth}</div>
                            <div class="stat-label">Mês com Mais Aniversários (${stats.busiestMonthCount})</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🎂</div>
                            <div class="stat-value">${stats.averageAge} anos</div>
                            <div class="stat-label">Idade Média</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">${stats.topSign.split(' ')[0]}</div>
                            <div class="stat-value">${stats.topSign.split(' ')[1]}</div>
                            <div class="stat-label">Signo Mais Comum (${stats.topSignCount})</div>
                        </div>
                        <div class="stat-card ${stats.upcomingCount > 0 ? 'urgent' : ''}">
                            <div class="stat-icon">⏰</div>
                            <div class="stat-value">${stats.upcomingCount}</div>
                            <div class="stat-label">Aniversários nos Próximos 7 Dias</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        modal.querySelector('.close-statistics-modal').onclick = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            }
        };
    }

    // ==========================================
    // EDITAR ANIVERSÁRIO
    // ==========================================

    editBirthday(id) {
        const birthday = this.birthdays.find(b => b.id === id);
        if (!birthday) return;

        // Extrair preferências existentes
        const prefs = birthday.preferences || {};

        const modal = document.createElement('div');
        modal.className = 'edit-birthday-modal';
        modal.innerHTML = `
            <div class="edit-modal-content">
                <div class="edit-modal-header">
                    <h3><i class="fas fa-edit"></i> Editar Aniversário</h3>
                    <button class="close-edit-modal">×</button>
                </div>
                <div class="edit-modal-body">
                    <form id="edit-birthday-form">
                        <div class="form-group">
                            <label>Nome *</label>
                            <input type="text" id="edit-name" value="${birthday.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Data de Nascimento *</label>
                            <input type="date" id="edit-date" value="${birthday.date}" required>
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea id="edit-description" rows="3">${birthday.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Telefone (WhatsApp)</label>
                            <input type="tel" id="edit-phone" value="${birthday.phone || ''}" placeholder="+55 11 99999-9999">
                        </div>
                        
                        <!-- Seção de Notas e Preferências -->
                        <div class="notes-preferences-section edit-notes-section">
                            <button type="button" class="notes-toggle-btn edit-notes-toggle">
                                <i class="fas fa-sticky-note"></i>
                                Notas e Preferências
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </button>
                            <div class="notes-form-grid edit-notes-panel" style="display: ${Object.keys(prefs).length > 0 ? 'grid' : 'none'};">
                                <div class="form-group">
                                    <label><i class="fas fa-heart"></i> O que gosta</label>
                                    <input type="text" id="edit-likes" value="${prefs.likes || ''}" placeholder="Chocolate, flores, livros...">
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-ban"></i> O que não gosta</label>
                                    <input type="text" id="edit-dislikes" value="${prefs.dislikes || ''}" placeholder="Perfumes fortes...">
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-tshirt"></i> Tamanho de roupa</label>
                                    <input type="text" id="edit-clothing-size" value="${prefs.clothingSize || ''}" placeholder="M, G, 42...">
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-shoe-prints"></i> Tamanho de calçado</label>
                                    <input type="text" id="edit-shoe-size" value="${prefs.shoeSize || ''}" placeholder="38, 40...">
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-palette"></i> Cor favorita</label>
                                    <input type="text" id="edit-favorite-color" value="${prefs.favoriteColor || ''}" placeholder="Azul, verde...">
                                </div>
                                <div class="form-group">
                                    <label><i class="fas fa-gift"></i> Ideias de presente</label>
                                    <input type="text" id="edit-gift-ideas" value="${prefs.giftIdeas || ''}" placeholder="Livro X, jogo Y...">
                                </div>
                                <div class="form-group full-width">
                                    <label><i class="fas fa-clipboard"></i> Outras notas</label>
                                    <textarea id="edit-notes" rows="2" placeholder="Informações adicionais...">${prefs.notes || ''}</textarea>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="edit-modal-footer">
                    <button class="btn-cancel-edit">Cancelar</button>
                    <button class="btn-save-edit">
                        <i class="fas fa-save"></i> Salvar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Toggle notas
        const notesToggle = modal.querySelector('.edit-notes-toggle');
        const notesPanel = modal.querySelector('.edit-notes-panel');
        notesToggle.onclick = () => {
            const isVisible = notesPanel.style.display === 'grid';
            notesPanel.style.display = isVisible ? 'none' : 'grid';
            notesToggle.classList.toggle('active', !isVisible);
        };
        if (Object.keys(prefs).length > 0) {
            notesToggle.classList.add('active');
        }
        
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.querySelector('.close-edit-modal').onclick = closeModal;
        modal.querySelector('.btn-cancel-edit').onclick = closeModal;
        
        modal.querySelector('.btn-save-edit').onclick = () => {
            const newName = modal.querySelector('#edit-name').value.trim();
            const newDate = modal.querySelector('#edit-date').value;
            const newDescription = modal.querySelector('#edit-description').value.trim();
            const newPhone = modal.querySelector('#edit-phone').value.trim();
            
            if (!newName || !newDate) {
                showFeedbackMessage('Nome e data são obrigatórios!', 'error');
                return;
            }
            
            birthday.name = newName;
            birthday.date = newDate;
            birthday.description = newDescription || null;
            birthday.phone = newPhone || null;
            
            // Salvar preferências
            const likes = modal.querySelector('#edit-likes').value.trim();
            const dislikes = modal.querySelector('#edit-dislikes').value.trim();
            const clothingSize = modal.querySelector('#edit-clothing-size').value.trim();
            const shoeSize = modal.querySelector('#edit-shoe-size').value.trim();
            const favoriteColor = modal.querySelector('#edit-favorite-color').value.trim();
            const giftIdeas = modal.querySelector('#edit-gift-ideas').value.trim();
            const notes = modal.querySelector('#edit-notes').value.trim();
            
            if (likes || dislikes || clothingSize || shoeSize || favoriteColor || giftIdeas || notes) {
                birthday.preferences = {
                    likes: likes || null,
                    dislikes: dislikes || null,
                    clothingSize: clothingSize || null,
                    shoeSize: shoeSize || null,
                    favoriteColor: favoriteColor || null,
                    giftIdeas: giftIdeas || null,
                    notes: notes || null
                };
            } else {
                birthday.preferences = null;
            }
            
            this.saveBirthdays();
            this.displayBirthdays(this.currentFilter);
            this.updateStats();
            
            closeModal();
            showFeedbackMessage('Aniversário atualizado com sucesso!', 'success');
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
    }

    // ==========================================
    // CONFETTI (Efeito de Celebração)
    // ==========================================

    checkAndShowConfetti() {
        const todayBirthdays = this.birthdays.filter(b => 
            this.calculateDaysUntilBirthday(b.date) === 0
        );
        
        if (todayBirthdays.length > 0 && !sessionStorage.getItem('confettiShown')) {
            this.showConfetti();
            sessionStorage.setItem('confettiShown', 'true');
            
            // Mostrar banner especial
            const names = todayBirthdays.map(b => b.name).join(', ');
            this.showNotificationBanner(`🎉 Hoje é aniversário de: ${names}! 🎂`);
        }
    }

    showConfetti() {
        // Criar canvas para confetti
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99999;
        `;
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'];
        
        // Criar partículas
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * 360,
                spin: Math.random() * 10 - 5
            });
        }
        
        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let allDone = true;
            particles.forEach(p => {
                if (p.y < canvas.height) {
                    allDone = false;
                    p.y += p.speed;
                    p.x += Math.sin(p.angle * Math.PI / 180) * 2;
                    p.angle += p.spin;
                    
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle * Math.PI / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            });
            
            if (!allDone) {
                animationId = requestAnimationFrame(animate);
            } else {
                canvas.remove();
            }
        };
        
        animate();
        
        // Remover após 5 segundos
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            canvas.remove();
        }, 5000);
    }

    // ==========================================
    // SWIPE GESTURES (Mobile Only)
    // ==========================================

    initializeSwipeGestures() {
        // Detectar se é mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) return;
        
        // Observar novos cards adicionados
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList?.contains('birthday-card')) {
                        this.setupSwipeForCard(node);
                    }
                    if (node.nodeType === 1) {
                        node.querySelectorAll?.('.birthday-card').forEach(card => {
                            this.setupSwipeForCard(card);
                        });
                    }
                });
            });
        });
        
        const birthdaysList = document.getElementById('birthdays-list');
        if (birthdaysList) {
            observer.observe(birthdaysList, { childList: true, subtree: true });
        }
        
        // Setup para cards existentes
        document.querySelectorAll('.birthday-card').forEach(card => {
            this.setupSwipeForCard(card);
        });
    }

    setupSwipeForCard(card) {
        if (card.dataset.swipeInitialized) return;
        card.dataset.swipeInitialized = 'true';
        
        const swipeContainer = card.querySelector('.swipe-container');
        if (!swipeContainer) return;
        
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const threshold = 80;
        
        const cardContent = swipeContainer.querySelector('.card-main-content');
        
        swipeContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            cardContent.style.transition = 'none';
        }, { passive: true });
        
        swipeContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            
            // Só permitir swipe para esquerda
            if (diff < 0) {
                const translateX = Math.max(diff, -150);
                cardContent.style.transform = `translateX(${translateX}px)`;
            }
        }, { passive: true });
        
        swipeContainer.addEventListener('touchend', () => {
            isDragging = false;
            cardContent.style.transition = 'transform 0.3s ease';
            
            const diff = currentX - startX;
            
            if (diff < -threshold) {
                // Mostrar ações
                cardContent.style.transform = 'translateX(-120px)';
                card.classList.add('swiped');
            } else {
                // Voltar ao normal
                cardContent.style.transform = 'translateX(0)';
                card.classList.remove('swiped');
            }
        });
        
        // Fechar ao clicar fora
        document.addEventListener('touchstart', (e) => {
            if (!card.contains(e.target) && card.classList.contains('swiped')) {
                cardContent.style.transform = 'translateX(0)';
                card.classList.remove('swiped');
            }
        });
    }

    // ==========================================
    // INDICADOR OFFLINE
    // ==========================================

    initializeOfflineIndicator() {
        // Criar indicador
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.className = 'offline-indicator hidden';
        indicator.innerHTML = `
            <i class="fas fa-cloud-slash"></i>
            <span>Você está offline</span>
        `;
        document.body.appendChild(indicator);
        
        // Verificar status inicial
        this.updateOfflineStatus();
        
        // Listeners para mudança de status
        window.addEventListener('online', () => this.updateOfflineStatus());
        window.addEventListener('offline', () => this.updateOfflineStatus());
    }

    updateOfflineStatus() {
        const indicator = document.getElementById('offline-indicator');
        const header = document.querySelector('.header');
        
        if (!navigator.onLine) {
            indicator?.classList.remove('hidden');
            indicator?.classList.add('show');
            header?.classList.add('offline');
            
            showFeedbackMessage('Você está offline. As alterações serão salvas localmente.', 'info');
        } else {
            indicator?.classList.remove('show');
            setTimeout(() => indicator?.classList.add('hidden'), 300);
            header?.classList.remove('offline');
        }
    }

    // ==========================================
    // MÁSCARA DE INPUT PARA DATA
    // ==========================================

    static setupDateInputMask(input) {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 8) value = value.slice(0, 8);
            
            if (value.length >= 4) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
            } else if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            
            e.target.value = value;
        });
        
        input.addEventListener('blur', (e) => {
            const value = e.target.value;
            const parts = value.split('/');
            
            if (parts.length === 3 && parts[2].length === 4) {
                // Converter para formato YYYY-MM-DD para o input date hidden
                const dateInput = document.getElementById('birth-date');
                if (dateInput) {
                    dateInput.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
        });
    }

    // Sistema de Toast Notifications
    showToast(message, type = 'success') {
        // Criar container de toasts se não existir
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Criar toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Ícone baseado no tipo
        let icon = '✓';
        if (type === 'error') icon = '✕';
        if (type === 'warning') icon = '⚠';
        if (type === 'info') icon = 'ℹ';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Animação de entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remover após 4 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Toggle de Prioridade (Estrelas)
    togglePriority(id) {
        const birthday = this.birthdays.find(b => b.id === id);
        if (!birthday) return;
        
        // Ciclo: 0 → 1 → 2 → 3 → 0
        birthday.priority = (birthday.priority + 1) % 4;
        
        this.saveBirthdays();
        this.displayBirthdays(this.currentFilter);
        
        const priorityLabels = ['Nenhuma', 'Baixa', 'Média', 'Alta'];
        this.showToast(`⭐ Prioridade: ${priorityLabels[birthday.priority]}`, 'info');
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

// === SISTEMA DE TEMAS APRIMORADO ===

class ThemeManager {
    constructor() {
        // Lista de temas disponíveis
        this.themes = {
            light: {
                name: 'Claro',
                nameEn: 'Light',
                icon: '☀️',
                description: 'Tema claro padrão',
                colors: ['#667eea', '#764ba2', '#f7fafc', '#ffffff']
            },
            dark: {
                name: 'Escuro',
                nameEn: 'Dark', 
                icon: '🌙',
                description: 'Escuro para uso noturno',
                colors: ['#805ad5', '#553c9a', '#0d1117', '#161b22']
            },
            ocean: {
                name: 'Oceano',
                nameEn: 'Ocean',
                icon: '🌊',
                description: 'Azul profundo marítimo',
                colors: ['#0ea5e9', '#06b6d4', '#0c1929', '#164e63']
            },
            sunset: {
                name: 'Pôr do Sol',
                nameEn: 'Sunset',
                icon: '🌅',
                description: 'Laranja e rosa quente',
                colors: ['#f97316', '#ec4899', '#1f1523', '#7c2d12']
            },
            forest: {
                name: 'Floresta',
                nameEn: 'Forest',
                icon: '🌲',
                description: 'Verde natural relaxante',
                colors: ['#22c55e', '#84cc16', '#0f1f14', '#166534']
            },
            rose: {
                name: 'Rosa',
                nameEn: 'Rose',
                icon: '🌸',
                description: 'Rosa elegante e suave',
                colors: ['#ec4899', '#f472b6', '#1f1318', '#9d174d']
            },
            lavender: {
                name: 'Lavanda',
                nameEn: 'Lavender',
                icon: '💜',
                description: 'Lilás claro e delicado',
                colors: ['#a78bfa', '#8b5cf6', '#faf5ff', '#ede9fe']
            },
            midnight: {
                name: 'Meia-noite',
                nameEn: 'Midnight',
                icon: '🌌',
                description: 'Azul escuro profundo',
                colors: ['#6366f1', '#818cf8', '#020617', '#1e1b4b']
            },
            candy: {
                name: 'Doce',
                nameEn: 'Candy',
                icon: '🍬',
                description: 'Rosa doce e alegre',
                colors: ['#f472b6', '#c084fc', '#fdf4ff', '#fae8ff']
            },
            nord: {
                name: 'Nórdico',
                nameEn: 'Nord',
                icon: '❄️',
                description: 'Inspirado no ártico',
                colors: ['#88c0d0', '#5e81ac', '#2e3440', '#3b4252']
            },
            dracula: {
                name: 'Drácula',
                nameEn: 'Dracula',
                icon: '🧛',
                description: 'Tema de programação popular',
                colors: ['#bd93f9', '#ff79c6', '#282a36', '#44475a']
            },
            colorblind: {
                name: 'Daltônico',
                nameEn: 'Colorblind',
                icon: '🎯',
                description: 'Acessível para todos',
                colors: ['#0173b2', '#de8f05', '#ffffff', '#f8f9fa']
            },
            custom: {
                name: 'Personalizado',
                nameEn: 'Custom',
                icon: '🎨',
                description: 'Crie seu próprio tema',
                colors: ['#805ad5', '#553c9a', '#ffffff', '#f7fafc']
            }
        };
        
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
        this.updateThemeCards();
        this.detectSystemTheme();
    }

    detectSystemTheme() {
        // Detectar preferência do sistema
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Se nunca foi configurado, usar preferência do sistema
            if (!localStorage.getItem('selectedTheme')) {
                if (darkModeQuery.matches) {
                    this.applyTheme('dark');
                }
            }
            
            // Escutar mudanças na preferência do sistema
            darkModeQuery.addEventListener('change', (e) => {
                const autoTheme = localStorage.getItem('autoTheme');
                if (autoTheme === 'true') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
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
            this.loadCustomTheme();
        } else if (theme !== 'light') {
            console.log('Aplicando tema padrão:', theme);
            body.setAttribute('data-theme', theme);
        }

        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateThemeCards();

        // Atualizar meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const primaryColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--primary-color').trim();
            metaThemeColor.setAttribute('content', primaryColor || '#667eea');
        }
    }

    updateThemeCards() {
        // Atualizar visual dos cards de tema
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.theme === this.currentTheme) {
                card.classList.add('active');
            }
        });
    }

    updateThemeSelector() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect && this.currentTheme !== 'custom') {
            themeSelect.value = this.currentTheme;
        }
    }

    setupThemeSelector() {
        // Setup para o novo grid de temas
        this.renderThemeGrid();
        this.setupCustomThemePanel();
        
        // Manter compatibilidade com o select antigo
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = this.currentTheme;
            themeSelect.addEventListener('change', (e) => {
                const theme = e.target.value;
                if (theme === 'custom') {
                    this.showCustomThemePanel();
                } else {
                    this.hideCustomThemePanel();
                    this.applyTheme(theme);
                    this.showThemeToast(theme);
                }
            });
        }
    }

    renderThemeGrid() {
        const container = document.getElementById('theme-grid');
        if (!container) return;

        container.innerHTML = '';

        Object.entries(this.themes).forEach(([themeKey, themeData]) => {
            const card = document.createElement('div');
            card.className = `theme-card ${this.currentTheme === themeKey ? 'active' : ''}`;
            card.dataset.theme = themeKey;
            
            // Criar preview com cores
            const colorsHtml = themeData.colors.map((color, i) => 
                `<div class="color-strip" style="background: ${color}"></div>`
            ).join('');

            card.innerHTML = `
                <div class="theme-preview">
                    <div class="theme-preview-colors">
                        ${colorsHtml}
                    </div>
                </div>
                <div class="theme-name">${themeData.icon} ${themeData.name}</div>
                <div class="theme-description">${themeData.description}</div>
            `;

            card.addEventListener('click', () => {
                if (themeKey === 'custom') {
                    this.toggleCustomThemePanel();
                } else {
                    this.applyTheme(themeKey);
                    this.showThemeToast(themeKey);
                }
            });

            container.appendChild(card);
        });
    }

    showThemeToast(theme) {
        const themeData = this.themes[theme];
        if (themeData) {
            const message = window.i18nManager ? 
                `${themeData.icon} ${window.i18nManager.translate('theme_applied').replace('{theme}', themeData.name)}` : 
                `${themeData.icon} ${themeData.name} aplicado!`;
            showFeedbackMessage(message, 'success', 2000);
        }
    }

    setupCustomThemePanel() {
        const toggle = document.getElementById('custom-theme-toggle');
        const panel = document.getElementById('custom-colors-panel');
        const applyBtn = document.getElementById('btn-apply-custom');
        const resetBtn = document.getElementById('btn-reset-custom');
        const colorInputs = document.querySelectorAll('.color-input-wrapper input[type="color"]');

        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                this.toggleCustomThemePanel();
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyCustomTheme();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetCustomTheme();
            });
        }

        // Atualizar preview em tempo real ao mudar cores
        colorInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateLivePreview();
                this.syncHexInput(input);
            });
        });

        // Sincronizar inputs de hex com color pickers
        document.querySelectorAll('.color-hex-input').forEach(hexInput => {
            hexInput.addEventListener('input', () => {
                this.syncColorPicker(hexInput);
            });
        });
    }

    syncHexInput(colorInput) {
        const hexInput = colorInput.parentElement.querySelector('.color-hex-input');
        if (hexInput) {
            hexInput.value = colorInput.value.toUpperCase();
        }
    }

    syncColorPicker(hexInput) {
        const colorInput = hexInput.parentElement.querySelector('input[type="color"]');
        let value = hexInput.value.trim();
        
        // Adicionar # se não tiver
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        
        // Validar formato hex
        if (/^#[0-9A-Fa-f]{6}$/.test(value) && colorInput) {
            colorInput.value = value;
            this.updateLivePreview();
        }
    }

    toggleCustomThemePanel() {
        const panel = document.getElementById('custom-colors-panel');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (panel) {
            panel.classList.toggle('show');
            if (toggleIcon) {
                toggleIcon.classList.toggle('open');
            }
            
            // Carregar cores atuais se estiver abrindo
            if (panel.classList.contains('show')) {
                this.loadCurrentColorsToPanel();
            }
        }
    }

    showCustomThemePanel() {
        const panel = document.getElementById('custom-colors-panel');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (panel) {
            panel.classList.add('show');
            if (toggleIcon) {
                toggleIcon.classList.add('open');
            }
            this.loadCurrentColorsToPanel();
        }
    }

    hideCustomThemePanel() {
        const panel = document.getElementById('custom-colors-panel');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (panel) {
            panel.classList.remove('show');
            if (toggleIcon) {
                toggleIcon.classList.remove('open');
            }
        }
    }

    loadCurrentColorsToPanel() {
        const root = document.documentElement;
        const style = getComputedStyle(root);
        
        const colorMappings = {
            'custom-primary': '--primary-color',
            'custom-secondary': '--secondary-color',
            'custom-background': '--background-color',
            'custom-card': '--card-background',
            'custom-text': '--text-primary',
            'custom-border': '--border-color'
        };

        Object.entries(colorMappings).forEach(([inputId, cssVar]) => {
            const colorInput = document.getElementById(inputId);
            const hexInput = colorInput?.parentElement?.querySelector('.color-hex-input');
            
            if (colorInput) {
                let value = style.getPropertyValue(cssVar).trim();
                
                // Converter rgba para hex se necessário
                if (value.startsWith('rgba') || value.startsWith('rgb')) {
                    value = this.rgbaToHex(value);
                }
                
                if (value && value.startsWith('#')) {
                    colorInput.value = value;
                    if (hexInput) {
                        hexInput.value = value.toUpperCase();
                    }
                }
            }
        });
    }

    updateLivePreview() {
        const primaryColor = document.getElementById('custom-primary')?.value;
        const backgroundColor = document.getElementById('custom-background')?.value;
        const textColor = document.getElementById('custom-text')?.value;
        
        const previewSection = document.querySelector('.live-preview-section');
        if (previewSection && primaryColor && backgroundColor && textColor) {
            // Atualizar preview elements
            const primaryBtn = previewSection.querySelector('.preview-btn.primary');
            const secondaryBtn = previewSection.querySelector('.preview-btn.secondary');
            const primaryText = previewSection.querySelector('.preview-text.primary-text');
            const secondaryText = previewSection.querySelector('.preview-text.secondary-text');
            
            if (primaryBtn) primaryBtn.style.background = primaryColor;
            if (secondaryBtn) {
                secondaryBtn.style.background = backgroundColor;
                secondaryBtn.style.color = textColor;
            }
            if (primaryText) primaryText.style.color = textColor;
            if (secondaryText) secondaryText.style.color = this.adjustOpacity(textColor, 0.7);
        }
    }

    getThemeName(theme) {
        const themeData = this.themes[theme];
        return themeData ? themeData.name : theme;
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
        const primaryColor = document.getElementById('custom-primary')?.value || '#805ad5';
        const secondaryColor = document.getElementById('custom-secondary')?.value || '#553c9a';
        const backgroundColor = document.getElementById('custom-background')?.value || '#ffffff';
        const cardColor = document.getElementById('custom-card')?.value || '#ffffff';
        const textColor = document.getElementById('custom-text')?.value || '#2d3748';
        const borderColor = document.getElementById('custom-border')?.value || '#e2e8f0';

        const root = document.documentElement;
        
        // Primeiro limpa todas as propriedades existentes
        this.clearCustomProperties();
        
        // Apply custom colors
        root.style.setProperty('--primary-color', primaryColor);
        root.style.setProperty('--primary-hover', this.lightenColor(primaryColor, 10));
        root.style.setProperty('--secondary-color', secondaryColor);
        root.style.setProperty('--background-color', backgroundColor);
        root.style.setProperty('--card-background', cardColor);
        root.style.setProperty('--text-primary', textColor);
        root.style.setProperty('--text-secondary', this.adjustOpacity(textColor, 0.7));
        root.style.setProperty('--border-color', borderColor);
        root.style.setProperty('--gradient-bg', `linear-gradient(135deg, ${backgroundColor} 0%, ${this.lightenColor(backgroundColor, 5)} 100%)`);
        root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`);

        // Update current theme and save
        this.currentTheme = 'custom';
        localStorage.setItem('selectedTheme', 'custom');
        
        // Save custom colors
        const customTheme = {
            'primary-color': primaryColor,
            'primary-hover': this.lightenColor(primaryColor, 10),
            'secondary-color': secondaryColor,
            'background-color': backgroundColor,
            'card-background': cardColor,
            'text-primary': textColor,
            'text-secondary': this.adjustOpacity(textColor, 0.7),
            'border-color': borderColor
        };
        localStorage.setItem('custom-theme', JSON.stringify(customTheme));

        this.updateThemeCards();
        this.hideCustomThemePanel();
        
        const message = window.i18nManager ? 
            window.i18nManager.translate('custom_theme_applied') : 
            '🎨 Tema personalizado aplicado!';
        showFeedbackMessage(message, 'success', 2000);
    }

    resetCustomTheme() {
        // Resetar para tema claro
        this.applyTheme('light');
        
        // Limpar tema salvo
        localStorage.removeItem('custom-theme');
        
        // Recarregar cores padrão no painel
        this.loadCurrentColorsToPanel();
        
        showFeedbackMessage('🔄 Cores resetadas!', 'info', 2000);
    }

    rgbaToHex(rgba) {
        // Converter rgba(r, g, b, a) ou rgb(r, g, b) para hex
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        return '#000000';
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

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
            (G > 0 ? G : 0) * 0x100 +
            (B > 0 ? B : 0)).toString(16).slice(1);
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
                'theme_light': '☀️ Claro',
                'theme_dark': '🌙 Escuro',
                'theme_ocean': '🌊 Oceano',
                'theme_sunset': '🌅 Pôr do Sol',
                'theme_forest': '🌲 Floresta',
                'theme_rose': '🌸 Rosa',
                'theme_lavender': '💜 Lavanda',
                'theme_midnight': '🌌 Meia-noite',
                'theme_candy': '🍬 Doce',
                'theme_nord': '❄️ Nórdico',
                'theme_dracula': '🧛 Drácula',
                'theme_colorblind': '🎯 Daltônico',
                'theme_custom': '🎨 Personalizado',
                'theme_applied': '{theme} aplicado!',
                'custom_theme_applied': '🎨 Tema personalizado aplicado!',
                'customize_theme_title': '🎨 Personalizar Tema',
                'primary_color_label': 'Cor Principal:',
                'secondary_color_label': 'Cor Secundária:',
                'background_color_label': 'Cor de Fundo:',
                'card_color_label': 'Cor dos Cards:',
                'text_color_label': 'Cor do Texto:',
                'border_color_label': 'Cor das Bordas:',
                'apply_btn': 'Aplicar Tema',
                'reset_btn': 'Resetar',
                'close_btn': 'Fechar',
                'choose_theme': 'Escolha seu Tema',
                'create_custom_theme': 'Criar Tema Personalizado',
                'live_preview': 'Preview em Tempo Real',
                
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
                'theme_light': '☀️ Light',
                'theme_dark': '🌙 Dark',
                'theme_ocean': '🌊 Ocean',
                'theme_sunset': '🌅 Sunset',
                'theme_forest': '🌲 Forest',
                'theme_rose': '🌸 Rose',
                'theme_lavender': '💜 Lavender',
                'theme_midnight': '🌌 Midnight',
                'theme_candy': '🍬 Candy',
                'theme_nord': '❄️ Nord',
                'theme_dracula': '🧛 Dracula',
                'theme_colorblind': '🎯 Colorblind',
                'theme_custom': '🎨 Custom',
                'theme_applied': '{theme} applied!',
                'custom_theme_applied': '🎨 Custom theme applied!',
                'customize_theme_title': '🎨 Customize Theme',
                'primary_color_label': 'Primary Color:',
                'secondary_color_label': 'Secondary Color:',
                'background_color_label': 'Background Color:',
                'card_color_label': 'Card Color:',
                'text_color_label': 'Text Color:',
                'border_color_label': 'Border Color:',
                'apply_btn': 'Apply Theme',
                'reset_btn': 'Reset',
                'close_btn': 'Close',
                'choose_theme': 'Choose your Theme',
                'create_custom_theme': 'Create Custom Theme',
                'live_preview': 'Live Preview',
                
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
                'theme_light': '☀️ Claro',
                'theme_dark': '🌙 Escuro',
                'theme_ocean': '🌊 Oceano',
                'theme_sunset': '🌅 Pôr do Sol',
                'theme_forest': '🌲 Floresta',
                'theme_rose': '🌸 Rosa',
                'theme_lavender': '💜 Lavanda',
                'theme_midnight': '🌌 Meia-noite',
                'theme_candy': '🍬 Doce',
                'theme_nord': '❄️ Nórdico',
                'theme_dracula': '🧛 Drácula',
                'theme_colorblind': '🎯 Daltônico',
                'theme_custom': '🎨 Personalizado',
                'theme_applied': '{theme} aplicado!',
                'custom_theme_applied': '🎨 Tema personalizado aplicado!',
                'customize_theme_title': '🎨 Personalizar Tema',
                'primary_color_label': 'Cor Principal:',
                'secondary_color_label': 'Cor Secundária:',
                'background_color_label': 'Cor de Fundo:',
                'card_color_label': 'Cor dos Cards:',
                'text_color_label': 'Cor do Texto:',
                'border_color_label': 'Cor das Bordas:',
                'apply_btn': 'Aplicar Tema',
                'reset_btn': 'Resetar',
                'close_btn': 'Fechar',
                'choose_theme': 'Escolha seu Tema',
                'create_custom_theme': 'Criar Tema Personalizado',
                'live_preview': 'Preview em Tempo Real',
                
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