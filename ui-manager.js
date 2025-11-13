// ui-manager.js - مدیریت رابط کاربری و صفحات

class UIManager {
    constructor() {
        this.currentScreen = 'start';
        this.screens = new Map();
        this.modals = new Map();
        this.notifications = [];
        this.settings = {
            sound: true,
            music: true,
            effects: true,
            graphics: 'high',
            language: 'fa'
        };
        
        this.init();
    }

    init() {
        this.setupScreens();
        this.setupEventListeners();
        this.loadSettings();
        this.applySettings();
    }

    setupScreens() {
        // تعریف تمام صفحه‌های بازی
        this.screens.set('start', {
            element: document.getElementById('start-screen'),
            show: () => this.showStartScreen(),
            hide: () => this.hideStartScreen()
        });

        this.screens.set('game', {
            element: document.getElementById('game-screen'),
            show: () => this.showGameScreen(),
            hide: () => this.hideGameScreen()
        });

        this.screens.set('settings', {
            element: document.getElementById('settings-screen'),
            show: () => this.showSettingsScreen(),
            hide: () => this.hideSettingsScreen()
        });

        this.screens.set('levels', {
            element: document.getElementById('levels-screen'),
            show: () => this.showLevelsScreen(),
            hide: () => this.hideLevelsScreen()
        });

        // اضافه کردن صفحه‌های دیگر...
    }

    setupEventListeners() {
        // دکمه شروع بازی
        document.getElementById('start-game').addEventListener('click', () => {
            this.showScreen('game');
            if (window.GameEngine) {
                window.GameEngine.resetGame();
            }
        });

        // دکمه‌های نوار بالایی
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.showScreen('settings');
        });

        document.getElementById('btn-levels').addEventListener('click', () => {
            this.showScreen('levels');
        });

        // دکمه‌های نوار پایینی
        document.getElementById('btn-home').addEventListener('click', () => {
            this.showScreen('start');
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            if (window.GameEngine) {
                window.GameEngine.resetGame();
            }
        });

        // مدیریت سایر دکمه‌ها...
        this.setupTopNavButtons();
        this.setupBottomNavButtons();
    }

    setupTopNavButtons() {
        const buttons = [
            'btn-sound', 'btn-music', 'btn-effects', 'btn-stats',
            'btn-achievements', 'btn-shop', 'btn-help', 'btn-profile', 'btn-exit'
        ];

        buttons.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                button.addEventListener('click', () => this.handleTopNavButton(btnId));
            }
        });
    }

    setupBottomNavButtons() {
        const buttons = [
            'btn-home', 'btn-levels', 'btn-ai', 'btn-powerups', 'btn-restart'
        ];

        buttons.forEach(btnId => {
            const button = document.getElementById(btnId);
            if (button) {
                button.addEventListener('click', () => this.handleBottomNavButton(btnId));
            }
        });
    }

    handleTopNavButton(buttonId) {
        switch(buttonId) {
            case 'btn-sound':
                this.toggleSound();
                break;
            case 'btn-music':
                this.toggleMusic();
                break;
            case 'btn-effects':
                this.toggleEffects();
                break;
            case 'btn-stats':
                this.showStats();
                break;
            case 'btn-achievements':
                this.showAchievements();
                break;
            case 'btn-shop':
                this.showShop();
                break;
            case 'btn-help':
                this.showHelp();
                break;
            case 'btn-profile':
                this.showProfile();
                break;
            case 'btn-exit':
                this.exitGame();
                break;
        }
    }

    handleBottomNavButton(buttonId) {
        switch(buttonId) {
            case 'btn-home':
                this.showScreen('start');
                break;
            case 'btn-levels':
                this.showScreen('levels');
                break;
            case 'btn-ai':
                this.showAISettings();
                break;
            case 'btn-powerups':
                this.showPowerups();
                break;
            case 'btn-restart':
                if (window.GameEngine) {
                    window.GameEngine.resetGame();
                }
                break;
        }
    }

    showScreen(screenName) {
        // مخفی کردن صفحه فعلی
        const currentScreen = this.screens.get(this.currentScreen);
        if (currentScreen && currentScreen.hide) {
            currentScreen.hide();
        }

        // نمایش صفحه جدید
        const newScreen = this.screens.get(screenName);
        if (newScreen && newScreen.show) {
            newScreen.show();
            this.currentScreen = screenName;
        }
    }

    showStartScreen() {
        const screen = this.screens.get('start');
        if (screen && screen.element) {
            screen.element.style.display = 'flex';
        }
        
        // مخفی کردن سایر صفحه‌ها
        this.hideAllScreensExcept('start');
    }

    showGameScreen() {
        const screen = this.screens.get('game');
        if (screen && screen.element) {
            screen.element.style.display = 'flex';
        }
        
        this.hideAllScreensExcept('game');
    }

    showSettingsScreen() {
        const screen = this.screens.get('settings');
        if (screen && screen.element) {
            screen.element.classList.add('active');
            this.populateSettings();
        }
    }

    showLevelsScreen() {
        const screen = this.screens.get('levels');
        if (screen && screen.element) {
            screen.element.classList.add('active');
            this.populateLevels();
        }
    }

    hideAllScreensExcept(exceptScreen) {
        this.screens.forEach((screen, name) => {
            if (name !== exceptScreen && screen.element) {
                screen.element.style.display = 'none';
                screen.element.classList.remove('active');
            }
        });
    }

    populateSettings() {
        const settingsContent = document.querySelector('#settings-screen .screen-content');
        if (!settingsContent) return;

        settingsContent.innerHTML = `
            <h2>تنظیمات بازی</h2>
            <div class="setting-group">
                <div class="setting-item">
                    <span>صدا</span>
                    <label class="switch">
                        <input type="checkbox" id="setting-sound" ${this.settings.sound ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span>موسیقی</span>
                    <label class="switch">
                        <input type="checkbox" id="setting-music" ${this.settings.music ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span>افکت‌ها</span>
                    <label class="switch">
                        <input type="checkbox" id="setting-effects" ${this.settings.effects ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span>گرافیک</span>
                    <select id="setting-graphics">
                        <option value="low" ${this.settings.graphics === 'low' ? 'selected' : ''}>پایین</option>
                        <option value="medium" ${this.settings.graphics === 'medium' ? 'selected' : ''}>متوسط</option>
                        <option value="high" ${this.settings.graphics === 'high' ? 'selected' : ''}>بالا</option>
                    </select>
                </div>
            </div>
            <button class="save-settings-btn">ذخیره تنظیمات</button>
        `;

        // اضافه کردن event listeners برای تنظیمات
        this.setupSettingsEventListeners();
    }

    setupSettingsEventListeners() {
        document.getElementById('setting-sound').addEventListener('change', (e) => {
            this.settings.sound = e.target.checked;
        });

        document.getElementById('setting-music').addEventListener('change', (e) => {
            this.settings.music = e.target.checked;
        });

        document.getElementById('setting-effects').addEventListener('change', (e) => {
            this.settings.effects = e.target.checked;
        });

        document.getElementById('setting-graphics').addEventListener('change', (e) => {
            this.settings.graphics = e.target.value;
        });

        document.querySelector('.save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            this.showNotification('تنظیمات ذخیره شد');
        });
    }

    populateLevels() {
        const levelsContent = document.querySelector('#levels-screen .screen-content');
        if (!levelsContent) return;

        let levelsHTML = '<h2>انتخاب مرحله</h2><div class="levels-grid">';
        
        for (let i = 1; i <= 20; i++) {
            const isUnlocked = i <= 5; // فقط 5 مرحله اول باز هستند
            levelsHTML += `
                <div class="level-card ${isUnlocked ? 'unlocked' : 'locked'}" data-level="${i}">
                    <div class="level-number">${i}</div>
                    <div class="level-info">
                        <div class="level-stars">⭐️⭐️⭐️</div>
                        <div class="level-score">امتیاز: 0</div>
                    </div>
                    ${!isUnlocked ? '<div class="lock-icon">🔒</div>' : ''}
                </div>
            `;
        }
        
        levelsHTML += '</div>';

        levelsContent.innerHTML = levelsHTML;

        // اضافه کردن event listeners برای مراحل
        this.setupLevelsEventListeners();
    }

    setupLevelsEventListeners() {
        const levelCards = document.querySelectorAll('.level-card.unlocked');
        levelCards.forEach(card => {
            card.addEventListener('click', () => {
                const level = parseInt(card.dataset.level);
                this.startLevel(level);
            });
        });
    }

    startLevel(level) {
        this.showScreen('game');
        if (window.GameEngine) {
            window.GameEngine.level = level;
            window.GameEngine.resetGame();
        }
        this.hideScreen('levels');
    }

    showLevelComplete(score, level) {
        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>تبریک! 🎉</h2>
                <p>شما مرحله ${level} را کامل کردید!</p>
                <p class="score">امتیاز: ${score}</p>
                <div class="modal-buttons">
                    <button class="btn-next-level">مرحله بعدی</button>
                    <button class="btn-retry">تلاش مجدد</button>
                    <button class="btn-levels">انتخاب مرحله</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            backdrop-filter: blur(10px);
        `;

        document.body.appendChild(modal);

        // event listeners برای دکمه‌ها
        modal.querySelector('.btn-next-level').addEventListener('click', () => {
            if (window.GameEngine) {
                window.GameEngine.nextLevel();
            }
            modal.remove();
        });

        modal.querySelector('.btn-retry').addEventListener('click', () => {
            if (window.GameEngine) {
                window.GameEngine.resetGame();
            }
            modal.remove();
        });

        modal.querySelector('.btn-levels').addEventListener('click', () => {
            this.showScreen('levels');
            modal.remove();
        });
    }

    showGameOver(score) {
        const modal = document.createElement('div');
        modal.className = 'gameover-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>زمان تمام شد! ⏰</h2>
                <p class="score">امتیاز نهایی: ${score}</p>
                <div class="modal-buttons">
                    <button class="btn-retry">تلاش مجدد</button>
                    <button class="btn-levels">انتخاب مرحله</button>
                    <button class="btn-home">صفحه اصلی</button>
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            backdrop-filter: blur(10px);
        `;

        document.body.appendChild(modal);

        // event listeners برای دکمه‌ها
        modal.querySelector('.btn-retry').addEventListener('click', () => {
            if (window.GameEngine) {
                window.GameEngine.resetGame();
            }
            modal.remove();
        });

        modal.querySelector('.btn-levels').addEventListener('click', () => {
            this.showScreen('levels');
            modal.remove();
        });

        modal.querySelector('.btn-home').addEventListener('click', () => {
            this.showScreen('start');
            modal.remove();
        });
    }

    showStats() {
        // نمایش آمار بازی
        const stats = this.loadStats();
        
        const modal = this.createModal('آمار بازی', `
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">بازی‌های انجام شده</span>
                    <span class="stat-value">${stats.gamesPlayed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">امتیاز کل</span>
                    <span class="stat-value">${stats.totalScore}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">بالاترین کامبو</span>
                    <span class="stat-value">${stats.highestCombo}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">مراحل کامل شده</span>
                    <span class="stat-value">${stats.levelsCompleted}</span>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showAchievements() {
        // نمایش دستاوردها
        const achievements = this.loadAchievements();
        
        let achievementsHTML = '<div class="achievements-grid">';
        achievements.forEach(achievement => {
            achievementsHTML += `
                <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc">${achievement.description}</div>
                        ${achievement.unlocked ? 
                            `<div class="achievement-date">کسب شده در: ${achievement.date}</div>` :
                            `<div class="achievement-progress">${achievement.progress}%</div>`
                        }
                    </div>
                </div>
            `;
        });
        achievementsHTML += '</div>';
        
        const modal = this.createModal('دستاوردها', achievementsHTML);
        document.body.appendChild(modal);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
        
        return modal;
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 3000;
            backdrop-filter: blur(10px);
            border-left: 4px solid ${this.getNotificationColor(type)};
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // انیمیشن ورود
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // حذف خودکار
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    getNotificationColor(type) {
        const colors = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f39c12',
            error: '#e74c3c'
        };
        return colors[type] || colors.info;
    }

    toggleSound() {
        this.settings.sound = !this.settings.sound;
        this.updateButtonState('btn-sound', this.settings.sound);
        this.saveSettings();
    }

    toggleMusic() {
        this.settings.music = !this.settings.music;
        this.updateButtonState('btn-music', this.settings.music);
        this.saveSettings();
    }

    toggleEffects() {
        this.settings.effects = !this.settings.effects;
        this.updateButtonState('btn-effects', this.settings.effects);
        this.saveSettings();
    }

    updateButtonState(buttonId, isActive) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (isActive) {
                button.classList.remove('inactive');
            } else {
                button.classList.add('inactive');
            }
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        // اعمال تنظیمات صدا
        this.updateButtonState('btn-sound', this.settings.sound);
        this.updateButtonState('btn-music', this.settings.music);
        this.updateButtonState('btn-effects', this.settings.effects);
        
        // اعمال تنظیمات گرافیک
        if (window.AnimationManager) {
            if (this.settings.graphics === 'high') {
                window.AnimationManager.init3DGraphics();
            }
        }
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('gameStats') || '{}');
    }

    loadAchievements() {
        return JSON.parse(localStorage.getItem('achievements') || '[]');
    }

    exitGame() {
        if (confirm('آیا می‌خواهید از بازی خارج شوید؟')) {
            // در مرورگر وب، نمی‌توانیم برنامه را ببندیم
            this.showNotification('برای خروج، پنجره مرورگر را ببندید');
        }
    }
}

// ایجاد نمونه از مدیر رابط کاربری
window.UIManager = new UIManager();
