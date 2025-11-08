// منطق بازی کهکشانی سینمایی
class GalacticGameLogic {
    constructor() {
        this.gameState = 'loading';
        this.currentScreen = 'loading';
        
        // آمار بازی
        this.score = 0;
        this.highScore = 0;
        this.currentLevel = 1;
        this.playTime = 0;
        this.planetsDiscovered = 0;
        
        // وضعیت بازی
        this.isPaused = false;
        this.isGameOver = false;
        this.levelComplete = false;
        
        // دستاوردها
        this.achievements = {};
        this.unlockedAchievements = [];
        
        // تنظیمات
        this.settings = {
            musicVolume: 70,
            sfxVolume: 80,
            ambientVolume: 60,
            graphicsQuality: 'medium',
            cinematicMode: true,
            particleEffects: true,
            shadowsEnabled: true,
            mouseSensitivity: 5,
            touchControls: true,
            vibrationEnabled: false,
            language: 'fa'
        };
        
        // منابع
        this.audioElements = {};
        
        this.init();
    }
    
    init() {
        // بارگذاری داده‌های ذخیره شده
        this.loadGameData();
        
        // راه‌اندازی رابط کاربری
        this.setupUI();
        
        // راه‌اندازی رویدادها
        this.setupEventListeners();
        
        // شروع لودینگ
        this.startLoading();
    }
    
    loadGameData() {
        try {
            // بارگذاری از localStorage
            const savedData = localStorage.getItem('galacticOdysseySave');
            
            if (savedData) {
                const data = JSON.parse(savedData);
                
                this.highScore = data.highScore || 0;
                this.currentLevel = data.currentLevel || 1;
                this.playTime = data.playTime || 0;
                this.planetsDiscovered = data.planetsDiscovered || 0;
                this.achievements = data.achievements || {};
                this.unlockedAchievements = data.unlockedAchievements || [];
                this.settings = { ...this.settings, ...data.settings };
            }
        } catch (error) {
            console.error('خطا در بارگذاری داده‌های بازی:', error);
        }
    }
    
    saveGameData() {
        try {
            const gameData = {
                highScore: this.highScore,
                currentLevel: this.currentLevel,
                playTime: this.playTime,
                planetsDiscovered: this.planetsDiscovered,
                achievements: this.achievements,
                unlockedAchievements: this.unlockedAchievements,
                settings: this.settings,
                lastSave: Date.now()
            };
            
            localStorage.setItem('galacticOdysseySave', JSON.stringify(gameData));
        } catch (error) {
            console.error('خطا در ذخیره داده‌های بازی:', error);
        }
    }
    
    setupUI() {
        // به‌روزرسانی آمار در منوی اصلی
        this.updateMainMenuStats();
        
        // راه‌اندازی اسلایدرهای تنظیمات
        this.setupSettingsSliders();
        
        // راه‌اندازی دستاوردها
        this.setupAchievements();
    }
    
    updateMainMenuStats() {
        const highScoreElement = document.getElementById('highScoreStat');
        const highLevelElement = document.getElementById('highLevelStat');
        const playTimeElement = document.getElementById('playTimeStat');
        
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore.toLocaleString();
        }
        
        if (highLevelElement) {
            highLevelElement.textContent = this.currentLevel;
        }
        
        if (playTimeElement) {
            const hours = Math.floor(this.playTime / 3600);
            playTimeElement.textContent = `${hours}h`;
        }
    }
    
    setupSettingsSliders() {
        // تنظیم اسلایدرهای صدا
        const musicSlider = document.getElementById('musicVolume');
        const sfxSlider = document.getElementById('sfxVolume');
        const ambientSlider = document.getElementById('ambientVolume');
        
        if (musicSlider) {
            musicSlider.value = this.settings.musicVolume;
            musicSlider.addEventListener('input', (e) => {
                this.settings.musicVolume = e.target.value;
                this.updateVolumeDisplay('musicVolumeValue', e.target.value);
                this.updateAudioVolumes();
            });
        }
        
        if (sfxSlider) {
            sfxSlider.value = this.settings.sfxVolume;
            sfxSlider.addEventListener('input', (e) => {
                this.settings.sfxVolume = e.target.value;
                this.updateVolumeDisplay('sfxVolumeValue', e.target.value);
                this.updateAudioVolumes();
            });
        }
        
        if (ambientSlider) {
            ambientSlider.value = this.settings.ambientVolume;
            ambientSlider.addEventListener('input', (e) => {
                this.settings.ambientVolume = e.target.value;
                this.updateVolumeDisplay('ambientVolumeValue', e.target.value);
                this.updateAudioVolumes();
            });
        }
        
        // تنظیم اسلایدر حساسیت موس
        const sensitivitySlider = document.getElementById('mouseSensitivity');
        if (sensitivitySlider) {
            sensitivitySlider.value = this.settings.mouseSensitivity;
            sensitivitySlider.addEventListener('input', (e) => {
                this.settings.mouseSensitivity = e.target.value;
                this.updateSensitivityDisplay('mouseSensitivityValue', e.target.value);
            });
        }
        
        // به‌روزرسانی نمایش مقادیر
        this.updateVolumeDisplay('musicVolumeValue', this.settings.musicVolume);
        this.updateVolumeDisplay('sfxVolumeValue', this.settings.sfxVolume);
        this.updateVolumeDisplay('ambientVolumeValue', this.settings.ambientVolume);
        this.updateSensitivityDisplay('mouseSensitivityValue', this.settings.mouseSensitivity);
    }
    
    updateVolumeDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value + '%';
        }
    }
    
    updateSensitivityDisplay(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
    
    updateAudioVolumes() {
        // به‌روزرسانی حجم صداها در موتور بازی
        if (gameEngine) {
            gameEngine.musicVolume = this.settings.musicVolume / 100;
            gameEngine.sfxVolume = this.settings.sfxVolume / 100;
            gameEngine.ambientVolume = this.settings.ambientVolume / 100;
            gameEngine.updateAudioVolumes();
        }
    }
    
    setupAchievements() {
        // تعریف دستاوردهای بازی
        this.achievements = {
            firstFlight: {
                name: 'اولین پرواز',
                description: 'اولین سفر فضایی خود را انجام دهید',
                icon: '🚀',
                points: 10,
                unlocked: false,
                condition: (game) => game.score > 0
            },
            planetExplorer: {
                name: 'کاشف سیارات',
                description: '۵ سیاره مختلف را کشف کنید',
                icon: '🌍',
                points: 25,
                unlocked: false,
                condition: (game) => game.planetsDiscovered >= 5
            },
            speedDemon: {
                name: 'شیطان سرعت',
                description: 'به سرعت ۱۵ واحد بر ثانیه برسید',
                icon: '⚡',
                points: 20,
                unlocked: false,
                condition: (game) => {
                    const speed = Math.sqrt(gameEngine.player.vx ** 2 + gameEngine.player.vy ** 2);
                    return speed >= 15;
                }
            },
            masterPilot: {
                name: 'خلبان استاد',
                description: '۱۰ مرحله را کامل کنید',
                icon: '👨‍🚀',
                points: 50,
                unlocked: false,
                condition: (game) => game.currentLevel >= 10
            },
            collector: {
                name: 'کلکسیونر',
                description: '۱۰۰۰ امتیاز جمع‌آوری کنید',
                icon: '⭐',
                points: 30,
                unlocked: false,
                condition: (game) => game.score >= 1000
            },
            survivor: {
                name: 'نجات یافته',
                description: '۵ دقیقه بدون آسیب دیدن بازی کنید',
                icon: '🛡️',
                points: 40,
                unlocked: false,
                condition: (game) => game.playTime >= 300
            },
            cosmicWarrior: {
                name: 'جنگجوی کیهانی',
                description: '۲۰ دشمن را نابود کنید',
                icon: '💥',
                points: 35,
                unlocked: false,
                condition: (game) => game.enemiesDefeated >= 20
            },
            fuelManager: {
                name: 'مدیر سوخت',
                description: 'یک مرحله را با کمتر از ۱۰٪ سوخت کامل کنید',
                icon: '⛽',
                points: 25,
                unlocked: false,
                condition: (game) => game.fuelRemaining <= 10
            },
            precisionPilot: {
                name: 'خلبان دقیق',
                description: '۱۰ سیاره را بدون برخورد کشف کنید',
                icon: '🎯',
                points: 45,
                unlocked: false,
                condition: (game) => game.planetsDiscovered >= 10 && game.collisions === 0
            },
            galaxyMaster: {
                name: 'استاد کهکشان',
                description: 'تمام دستاوردها را باز کنید',
                icon: '🏆',
                points: 100,
                unlocked: false,
                condition: (game) => Object.keys(game.achievements).filter(a => a.unlocked).length === Object.keys(game.achievements).length
            }
        };
        
        // بارگذاری وضعیت دستاوردها
        this.loadAchievementsState();
    }
    
    loadAchievementsState() {
        try {
            const savedAchievements = localStorage.getItem('galacticOdysseyAchievements');
            if (savedAchievements) {
                const achievementsData = JSON.parse(savedAchievements);
                
                for (const key in achievementsData) {
                    if (this.achievements[key]) {
                        this.achievements[key].unlocked = achievementsData[key].unlocked;
                        if (achievementsData[key].unlocked && !this.unlockedAchievements.includes(key)) {
                            this.unlockedAchievements.push(key);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('خطا در بارگذاری دستاوردها:', error);
        }
    }
    
    saveAchievementsState() {
        try {
            const achievementsData = {};
            for (const key in this.achievements) {
                achievementsData[key] = {
                    unlocked: this.achievements[key].unlocked,
                    unlockedAt: this.achievements[key].unlockedAt
                };
            }
            
            localStorage.setItem('galacticOdysseyAchievements', JSON.stringify(achievementsData));
        } catch (error) {
            console.error('خطا در ذخیره دستاوردها:', error);
        }
    }
    
    setupEventListeners() {
        // دکمه‌های منوی اصلی
        document.getElementById('startGameBtn')?.addEventListener('click', () => this.startNewGame());
        document.getElementById('continueBtn')?.addEventListener('click', () => this.continueGame());
        document.getElementById('achievementsBtn')?.addEventListener('click', () => this.showAchievements());
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('creditsBtn')?.addEventListener('click', () => this.showCredits());
        
        // دکمه‌های منوی توقف
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuBtn')?.addEventListener('click', () => this.showMainMenu());
        document.getElementById('settingsBtn2')?.addEventListener('click', () => this.showSettings());
        
        // دکمه‌های پایان بازی
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.playAgain());
        document.getElementById('gameOverMenuBtn')?.addEventListener('click', () => this.showMainMenu());
        
        // دکمه‌های تکمیل مرحله
        document.getElementById('nextLevelBtn')?.addEventListener('click', () => this.nextLevel());
        document.getElementById('levelCompleteMenuBtn')?.addEventListener('click', () => this.showMainMenu());
        
        // دکمه‌های تنظیمات
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('closeSettingsBtn')?.addEventListener('click', () => this.closeSettings());
        document.getElementById('showTutorialBtn')?.addEventListener('click', () => this.showTutorial());
        document.getElementById('resetProgressBtn')?.addEventListener('click', () => this.resetProgress());
        
        // دکمه‌های دستاوردها
        document.getElementById('closeAchievementsBtn')?.addEventListener('click', () => this.closeAchievements());
        
        // دکمه‌های سازندگان
        document.getElementById('closeCreditsBtn')?.addEventListener('click', () => this.closeCredits());
        
        // کنترل‌های سینمایی
        document.getElementById('musicToggle')?.addEventListener('click', () => this.toggleMusic());
        document.getElementById('fullscreenToggle')?.addEventListener('click', () => this.toggleFullscreen());
        
        // توانایی‌های بازی
        document.getElementById('warpDriveBtn')?.addEventListener('click', () => this.activateWarpDrive());
        document.getElementById('shieldBtn')?.addEventListener('click', () => this.activateShield());
        document.getElementById('scannerBtn')?.addEventListener('click', () => this.activateScanner());
        document.getElementById('bombBtn')?.addEventListener('click', () => this.activateBomb());
        
        // رویدادهای کیبورد
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // رویدادهای موس
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // رویدادهای لمسی
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // رویداد تغییر اندازه پنجره
        window.addEventListener('resize', () => this.handleResize());
    }
    
    startLoading() {
        this.showScreen('loading');
        
        // شبیه‌سازی فرآیند لودینگ
        setTimeout(() => {
            this.hideScreen('loading');
            this.showScreen('mainMenu');
        }, 3000);
    }
    
    startNewGame() {
        this.score = 0;
        this.currentLevel = 1;
        this.planetsDiscovered = 0;
        this.playTime = 0;
        this.isGameOver = false;
        this.levelComplete = false;
        
        this.hideScreen('mainMenu');
        this.showScreen('gameScreen');
        
        // راه‌اندازی موتور بازی
        if (gameEngine) {
            gameEngine.startGame();
        }
        
        // شروع تایمر بازی
        this.startGameTimer();
        
        // پخش صدای کلیک
        this.playSound('click');
    }
    
    continueGame() {
        // ادامه بازی از آخرین ذخیره
        this.hideScreen('mainMenu');
        this.showScreen('gameScreen');
        
        if (gameEngine) {
            gameEngine.resumeGame();
        }
        
        this.startGameTimer();
        this.playSound('click');
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.playTime++;
            this.updateGameTimer();
        }, 1000);
    }
    
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }
    
    updateGameTimer() {
        const timeElement = document.getElementById('timeValue');
        if (timeElement) {
            const minutes = Math.floor(this.playTime / 60);
            const seconds = this.playTime % 60;
            timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    togglePause() {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
    
    pauseGame() {
        if (this.currentScreen === 'gameScreen' && !this.isGameOver) {
            this.isPaused = true;
            
            if (gameEngine) {
                gameEngine.pauseGame();
            }
            
            this.stopGameTimer();
            this.showScreen('pauseMenu');
            
            // به‌روزرسانی آمار در منوی توقف
            this.updatePauseMenuStats();
        }
    }
    
    resumeGame() {
        if (this.isPaused) {
            this.isPaused = false;
            
            if (gameEngine) {
                gameEngine.resumeGame();
            }
            
            this.startGameTimer();
            this.hideScreen('pauseMenu');
        }
    }
    
    restartGame() {
        this.hideScreen('pauseMenu');
        this.startNewGame();
    }
    
    gameOver() {
        this.isGameOver = true;
        this.stopGameTimer();
        
        if (gameEngine) {
            gameEngine.gameOver();
        }
        
        // به‌روزرسانی رکوردها
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        
        // نمایش صفحه پایان بازی
        this.showGameOverScreen();
        
        // بررسی دستاوردها
        this.checkAchievements();
        
        // ذخیره بازی
        this.saveGameData();
    }
    
    showGameOverScreen() {
        this.hideScreen('gameScreen');
        this.showScreen('gameOverScreen');
        
        // به‌روزرسانی آمار پایان بازی
        this.updateGameOverStats();
        
        // بررسی و نمایش دستاوردهای جدید
        this.showNewAchievements();
    }
    
    updateGameOverStats() {
        document.getElementById('finalScore').textContent = this.score.toLocaleString();
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('finalTime').textContent = this.formatTime(this.playTime);
        document.getElementById('finalPlanets').textContent = this.planetsDiscovered;
    }
    
    updatePauseMenuStats() {
        document.getElementById('currentScore').textContent = this.score.toLocaleString();
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('currentTime').textContent = this.formatTime(this.playTime);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    playAgain() {
        this.hideScreen('gameOverScreen');
        this.startNewGame();
    }
    
    completeLevel() {
        this.levelComplete = true;
        this.stopGameTimer();
        
        if (gameEngine) {
            // متوقف کردن موتور بازی
        }
        
        // افزایش سطح
        this.currentLevel++;
        
        // نمایش صفحه تکمیل مرحله
        this.showLevelCompleteScreen();
        
        // ذخیره بازی
        this.saveGameData();
    }
    
    showLevelCompleteScreen() {
        this.hideScreen('gameScreen');
        this.showScreen('levelCompleteScreen');
        
        // به‌روزرسانی آمار مرحله
        this.updateLevelCompleteStats();
    }
    
    updateLevelCompleteStats() {
        document.getElementById('completedLevel').textContent = this.currentLevel - 1;
        document.getElementById('levelScore').textContent = this.calculateLevelScore().toLocaleString();
        document.getElementById('levelPlanets').textContent = this.planetsDiscoveredThisLevel;
        document.getElementById('levelTime').textContent = this.formatTime(this.levelTime);
    }
    
    calculateLevelScore() {
        // محاسبه امتیاز مرحله بر اساس زمان، سیارات کشف شده و ...
        const baseScore = 500;
        const planetBonus = this.planetsDiscoveredThisLevel * 100;
        const timeBonus = Math.max(0, 300 - this.levelTime) * 10; // پاداش برای تکمیل سریع
        
        return baseScore + planetBonus + timeBonus;
    }
    
    nextLevel() {
        this.hideScreen('levelCompleteScreen');
        this.showScreen('gameScreen');
        
        // راه‌اندازی مرحله جدید
        this.levelComplete = false;
        this.planetsDiscoveredThisLevel = 0;
        this.levelTime = 0;
        
        if (gameEngine) {
            // راه‌اندازی مجدد موتور بازی برای مرحله جدید
        }
        
        this.startGameTimer();
    }
    
    showAchievements() {
        this.showScreen('achievementsScreen');
        this.populateAchievementsGrid();
        this.updateAchievementsStats();
    }
    
    populateAchievementsGrid() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        for (const key in this.achievements) {
            const achievement = this.achievements[key];
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? '' : 'locked'}`;
            
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">${achievement.points} امتیاز</div>
            `;
            
            grid.appendChild(achievementElement);
        }
    }
    
    updateAchievementsStats() {
        const achievedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        const totalCount = Object.keys(this.achievements).length;
        const totalPoints = Object.values(this.achievements)
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + a.points, 0);
        
        document.getElementById('achievedCount').textContent = `${achievedCount}/${totalCount}`;
        document.getElementById('achievementPoints').textContent = totalPoints.toLocaleString();
    }
    
    closeAchievements() {
        this.hideScreen('achievementsScreen');
        this.showScreen('mainMenu');
    }
    
    showSettings() {
        this.showScreen('settingsScreen');
        
        // به‌روزرسانی تنظیمات فعلی در رابط
        this.updateSettingsUI();
    }
    
    updateSettingsUI() {
        // به‌روزرسانی مقادیر اسلایدرها
        document.getElementById('musicVolume').value = this.settings.musicVolume;
        document.getElementById('sfxVolume').value = this.settings.sfxVolume;
        document.getElementById('ambientVolume').value = this.settings.ambientVolume;
        document.getElementById('mouseSensitivity').value = this.settings.mouseSensitivity;
        
        // به‌روزرسانی نمایش مقادیر
        this.updateVolumeDisplay('musicVolumeValue', this.settings.musicVolume);
        this.updateVolumeDisplay('sfxVolumeValue', this.settings.sfxVolume);
        this.updateVolumeDisplay('ambientVolumeValue', this.settings.ambientVolume);
        this.updateSensitivityDisplay('mouseSensitivityValue', this.settings.mouseSensitivity);
        
        // به‌روزرسانی انتخاب‌ها
        document.getElementById('graphicsQuality').value = this.settings.graphicsQuality;
        document.getElementById('cinematicMode').checked = this.settings.cinematicMode;
        document.getElementById('particleEffects').checked = this.settings.particleEffects;
        document.getElementById('shadowsEnabled').checked = this.settings.shadowsEnabled;
        document.getElementById('touchControls').checked = this.settings.touchControls;
        document.getElementById('vibrationEnabled').checked = this.settings.vibrationEnabled;
        document.getElementById('languageSelect').value = this.settings.language;
    }
    
    saveSettings() {
        // ذخیره تنظیمات از رابط کاربری
        this.settings.musicVolume = document.getElementById('musicVolume').value;
        this.settings.sfxVolume = document.getElementById('sfxVolume').value;
        this.settings.ambientVolume = document.getElementById('ambientVolume').value;
        this.settings.mouseSensitivity = document.getElementById('mouseSensitivity').value;
        this.settings.graphicsQuality = document.getElementById('graphicsQuality').value;
        this.settings.cinematicMode = document.getElementById('cinematicMode').checked;
        this.settings.particleEffects = document.getElementById('particleEffects').checked;
        this.settings.shadowsEnabled = document.getElementById('shadowsEnabled').checked;
        this.settings.touchControls = document.getElementById('touchControls').checked;
        this.settings.vibrationEnabled = document.getElementById('vibrationEnabled').checked;
        this.settings.language = document.getElementById('languageSelect').value;
        
        // اعمال تنظیمات در موتور بازی
        if (gameEngine) {
            gameEngine.graphicsQuality = this.settings.graphicsQuality;
            gameEngine.cinematicMode = this.settings.cinematicMode;
            gameEngine.particleEffects = this.settings.particleEffects;
            gameEngine.shadowsEnabled = this.settings.shadowsEnabled;
        }
        
        // به‌روزرسانی حجم صداها
        this.updateAudioVolumes();
        
        // ذخیره تنظیمات
        this.saveGameData();
        
        // بستن صفحه تنظیمات
        this.closeSettings();
        
        // نمایش پیغام تأیید
        this.showNotification('تنظیمات ذخیره شد');
    }
    
    closeSettings() {
        this.hideScreen('settingsScreen');
        this.showScreen('mainMenu');
    }
    
    showTutorial() {
        // نمایش آموزش بازی
        this.showNotification('آموزش در حال توسعه است');
    }
    
    resetProgress() {
        if (confirm('آیا مطمئن هستید که می‌خواهید تمام پیشرفت بازی بازنشانی شود؟ این عمل غیرقابل بازگشت است.')) {
            // بازنشانی تمام داده‌ها
            this.score = 0;
            this.highScore = 0;
            this.currentLevel = 1;
            this.playTime = 0;
            this.planetsDiscovered = 0;
            this.unlockedAchievements = [];
            
            // بازنشانی دستاوردها
            for (const key in this.achievements) {
                this.achievements[key].unlocked = false;
            }
            
            // حذف داده‌های ذخیره شده
            localStorage.removeItem('galacticOdysseySave');
            localStorage.removeItem('galacticOdysseyAchievements');
            
            // به‌روزرسانی رابط کاربری
            this.updateMainMenuStats();
            
            this.showNotification('همه داده‌ها بازنشانی شدند');
        }
    }
    
    showCredits() {
        this.showScreen('creditsScreen');
    }
    
    closeCredits() {
        this.hideScreen('creditsScreen');
        this.showScreen('mainMenu');
    }
    
    showMainMenu() {
        // توقف بازی اگر در حال اجراست
        if (gameEngine && this.currentScreen === 'gameScreen') {
            gameEngine.pauseGame();
        }
        
        this.stopGameTimer();
        this.hideAllScreens();
        this.showScreen('mainMenu');
        
        // به‌روزرسانی آمار منوی اصلی
        this.updateMainMenuStats();
    }
    
    toggleMusic() {
        if (gameEngine) {
            if (gameEngine.sounds.background.paused) {
                gameEngine.sounds.background.play();
                document.getElementById('musicToggle').textContent = '🔊';
            } else {
                gameEngine.sounds.background.pause();
                document.getElementById('musicToggle').textContent = '🔇';
            }
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('خطا در ورود به حالت تمام صفحه:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    activateWarpDrive() {
        if (gameEngine && gameEngine.player.energy >= 30) {
            gameEngine.player.energy -= 30;
            gameEngine.player.vx *= 3;
            gameEngine.player.vy *= 3;
            
            // ایجاد افکت warp
            this.createWarpEffect();
            
            // پخش صدا
            this.playSound('warp');
            
            // فعال کردن کولداون
            this.startAbilityCooldown('warpDriveBtn', 30);
        }
    }
    
    activateShield() {
        if (gameEngine && gameEngine.player.energy >= 20) {
            gameEngine.player.energy -= 20;
            gameEngine.player.shield = Math.min(100, gameEngine.player.shield + 50);
            
            // ایجاد افکت محافظ
            this.createShieldEffect();
            
            // پخش صدا
            this.playSound('shield');
            
            // فعال کردن کولداون
            this.startAbilityCooldown('shieldBtn', 20);
        }
    }
    
    activateScanner() {
        if (gameEngine && gameEngine.player.energy >= 15) {
            gameEngine.player.energy -= 15;
            
            // نشان دادن موقعیت سیارات و دشمنان
            this.activatePlanetScanner();
            
            // پخش صدا
            this.playSound('scanner');
            
            // فعال کردن کولداون
            this.startAbilityCooldown('scannerBtn', 15);
        }
    }
    
    activateBomb() {
        if (gameEngine && gameEngine.player.energy >= 45) {
            gameEngine.player.energy -= 45;
            
            // نابودی تمام دشمنان نزدیک
            this.destroyNearbyEnemies();
            
            // پخش صدا
            this.playSound('explosion');
            
            // فعال کردن کولداون
            this.startAbilityCooldown('bombBtn', 45);
        }
    }
    
    startAbilityCooldown(buttonId, cooldownTime) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        button.disabled = true;
        const cooldownOverlay = button.querySelector('.cooldown-overlay');
        
        let timeLeft = cooldownTime;
        const countdown = setInterval(() => {
            timeLeft--;
            cooldownOverlay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                button.disabled = false;
                cooldownOverlay.textContent = '';
            }
        }, 1000);
    }
    
    createWarpEffect() {
        if (gameEngine) {
            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 10 + Math.random() * 30;
                
                gameEngine.particles.push({
                    x: gameEngine.player.x,
                    y: gameEngine.player.y,
                    z: 0,
                    vx: Math.cos(angle) * (5 + Math.random() * 5),
                    vy: Math.sin(angle) * (5 + Math.random() * 5),
                    vz: (Math.random() - 0.5) * 3,
                    size: 2 + Math.random() * 4,
                    life: 0.5 + Math.random() * 0.5,
                    color: [0.2, 0.6, 1.0, 1.0]
                });
            }
        }
    }
    
    createShieldEffect() {
        if (gameEngine) {
            // ایجاد افکت محافظ دور سفینه
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                
                gameEngine.particles.push({
                    x: gameEngine.player.x + Math.cos(angle) * 25,
                    y: gameEngine.player.y + Math.sin(angle) * 25,
                    z: 0,
                    vx: 0,
                    vy: 0,
                    vz: 0,
                    size: 3,
                    life: 2,
                    color: [0.2, 0.8, 0.2, 0.7]
                });
            }
        }
    }
    
    activatePlanetScanner() {
        if (gameEngine) {
            // نشان دادن موقعیت تمام سیارات برای مدت کوتاهی
            this.scannerActive = true;
            
            setTimeout(() => {
                this.scannerActive = false;
            }, 5000);
        }
    }
    
    destroyNearbyEnemies() {
        if (gameEngine) {
            const explosionRadius = 150;
            
            for (let i = gameEngine.enemies.length - 1; i >= 0; i--) {
                const enemy = gameEngine.enemies[i];
                const dx = enemy.x - gameEngine.player.x;
                const dy = enemy.y - gameEngine.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < explosionRadius) {
                    // ایجاد افکت انفجار برای هر دشمن
                    gameEngine.createExplosion(enemy.x, enemy.y);
                    
                    // حذف دشمن
                    gameEngine.enemies.splice(i, 1);
                    
                    // افزایش امتیاز
                    this.addScore(50);
                }
            }
            
            // لرزش دوربین
            gameEngine.camera.cinematic.shake = 15;
        }
    }
    
    addScore(points) {
        this.score += points;
        
        // به‌روزرسانی نمایش امتیاز
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.textContent = this.score.toLocaleString();
        }
        
        // بررسی دستاوردهای مرتبط با امتیاز
        this.checkAchievements();
    }
    
    addDiscoveredPlanet() {
        this.planetsDiscovered++;
        this.planetsDiscoveredThisLevel++;
        
        // به‌روزرسانی نمایش هدف
        this.updateObjectiveDisplay();
        
        // بررسی دستاوردهای مرتبط با کشف سیارات
        this.checkAchievements();
    }
    
    updateObjectiveDisplay() {
        const objectiveText = document.getElementById('objectiveText');
        if (objectiveText) {
            const planetsNeeded = Math.min(5, 2 + this.currentLevel);
            objectiveText.textContent = `سیارات را کشف کنید: ${this.planetsDiscoveredThisLevel}/${planetsNeeded}`;
        }
    }
    
    checkAchievements() {
        const newlyUnlocked = [];
        
        for (const key in this.achievements) {
            const achievement = this.achievements[key];
            
            if (!achievement.unlocked && achievement.condition(this)) {
                achievement.unlocked = true;
                achievement.unlockedAt = Date.now();
                newlyUnlocked.push(achievement);
                
                this.unlockedAchievements.push(key);
            }
        }
        
        if (newlyUnlocked.length > 0) {
            this.showNewAchievements(newlyUnlocked);
            this.saveAchievementsState();
        }
    }
    
    showNewAchievements(achievements = null) {
        const achievementElement = document.getElementById('achievementUnlocked');
        const achievementDesc = document.getElementById('achievementDesc');
        
        if (!achievementElement || !achievementDesc) return;
        
        if (achievements && achievements.length > 0) {
            // نمایش دستاوردهای جدید
            const achievement = achievements[0]; // نمایش اولین دستاورد
            achievementDesc.textContent = achievement.name;
            achievementElement.style.display = 'flex';
            
            // پخش صدا
            this.playSound('achievement');
            
            // پنهان کردن پس از چند ثانیه
            setTimeout(() => {
                achievementElement.style.display = 'none';
                
                // اگر دستاوردهای بیشتری وجود دارد، آن‌ها را نیز نمایش دهید
                if (achievements.length > 1) {
                    setTimeout(() => {
                        this.showNewAchievements(achievements.slice(1));
                    }, 500);
                }
            }, 3000);
        } else {
            // پنهان کردن عنصر دستاورد
            achievementElement.style.display = 'none';
        }
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
            this.currentScreen = screenId;
        }
    }
    
    hideScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('hidden');
        }
    }
    
    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.add('hidden');
        });
    }
    
    showNotification(message) {
        // ایجاد یک نوتیفیکیشن موقت
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-family: inherit;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    playSound(soundName) {
        if (gameEngine) {
            gameEngine.playSound(soundName);
        }
    }
    
    // مدیریت رویدادهای ورودی
    handleKeyDown(event) {
        if (gameEngine) {
            gameEngine.handleKeyDown(event);
        }
        
        // کلید ESC برای توقف بازی
        if (event.code === 'Escape') {
            if (this.currentScreen === 'gameScreen') {
                this.togglePause();
            } else if (this.currentScreen === 'pauseMenu') {
                this.resumeGame();
            }
        }
    }
    
    handleKeyUp(event) {
        if (gameEngine) {
            gameEngine.handleKeyUp(event);
        }
    }
    
    handleMouseMove(event) {
        if (gameEngine) {
            gameEngine.handleMouseMove(event);
        }
    }
    
    handleMouseDown(event) {
        if (gameEngine) {
            gameEngine.handleMouseDown(event);
        }
    }
    
    handleMouseUp(event) {
        if (gameEngine) {
            gameEngine.handleMouseUp(event);
        }
    }
    
    handleTouchStart(event) {
        if (gameEngine && this.settings.touchControls) {
            gameEngine.handleTouchStart(event);
        }
    }
    
    handleTouchMove(event) {
        if (gameEngine && this.settings.touchControls) {
            gameEngine.handleTouchMove(event);
        }
    }
    
    handleTouchEnd(event) {
        if (gameEngine && this.settings.touchControls) {
            gameEngine.handleTouchEnd(event);
        }
    }
    
    handleResize() {
        // به‌روزرسانی رابط کاربری در صورت تغییر اندازه پنجره
        if (gameEngine) {
            gameEngine.resizeCanvas();
        }
    }
}

// ایجاد نمونه منطق بازی
const gameLogic = new GalacticGameLogic();

// راه‌اندازی بازی پس از بارگذاری صفحه
window.addEventListener('load', () => {
    console.log('بازی کهکشانی سینمایی بارگذاری شد!');
});
