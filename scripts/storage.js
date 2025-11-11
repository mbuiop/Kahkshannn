// سیستم ذخیره‌سازی و مدیریت داده‌ها
class StorageSystem {
    constructor() {
        this.gameData = {
            highScore: 0,
            highLevel: 1,
            totalCoins: 0,
            achievements: [],
            settings: {},
            gameStats: {}
        };
        
        this.init();
    }

    init() {
        this.loadGameData();
        this.setupAutoSave();
    }

    loadGameData() {
        try {
            // بارگذاری داده‌ها از localStorage
            const savedData = localStorage.getItem('infiniteGalaxySave');
            
            if (savedData) {
                this.gameData = { ...this.gameData, ...JSON.parse(savedData) };
                this.applyLoadedData();
            }
            
            console.log('📁 داده‌های بازی بارگذاری شد:', this.gameData);
        } catch (error) {
            console.error('❌ خطا در بارگذاری داده‌ها:', error);
            this.resetToDefaults();
        }
    }

    applyLoadedData() {
        // اعمال داده‌های بارگذاری شده به UI
        document.getElementById('highScore').textContent = this.gameData.highScore;
        document.getElementById('highLevel').textContent = this.gameData.highLevel;
        document.getElementById('totalCoinsCollected').textContent = this.gameData.totalCoins;
        document.getElementById('achievementsCount').textContent = `${this.gameData.achievements.length}/100`;
    }

    saveGameData(score, level, coinsCollected) {
        try {
            // به‌روزرسانی داده‌ها
            this.gameData.highScore = Math.max(score, this.gameData.highScore);
            this.gameData.highLevel = Math.max(level, this.gameData.highLevel);
            this.gameData.totalCoins += coinsCollected;
            
            // ذخیره‌سازی
            localStorage.setItem('infiniteGalaxySave', JSON.stringify(this.gameData));
            
            console.log('💾 داده‌های بازی ذخیره شد:', {
                score,
                level,
                coinsCollected,
                newHighScore: this.gameData.highScore
            });
            
            // به‌روزرسانی UI
            this.applyLoadedData();
            
        } catch (error) {
            console.error('❌ خطا در ذخیره‌سازی داده‌ها:', error);
        }
    }

    saveSettings(settings) {
        try {
            this.gameData.settings = { ...this.gameData.settings, ...settings };
            localStorage.setItem('infiniteGalaxySave', JSON.stringify(this.gameData));
            console.log('⚙️ تنظیمات ذخیره شد:', settings);
        } catch (error) {
            console.error('❌ خطا در ذخیره‌سازی تنظیمات:', error);
        }
    }

    unlockAchievement(achievementId, achievementName) {
        try {
            if (!this.gameData.achievements.includes(achievementId)) {
                this.gameData.achievements.push(achievementId);
                
                // ذخیره‌سازی
                localStorage.setItem('infiniteGalaxySave', JSON.stringify(this.gameData));
                
                // نمایش نوتیفیکیشن
                UI.showMessage(`مدال جدید! 🏆 ${achievementName}`);
                
                console.log('🎖️ مدال جدید باز شد:', achievementName);
                
                // پخش صدا
                if (Audio.enabled) {
                    Audio.play('achievement');
                }
            }
        } catch (error) {
            console.error('❌ خطا در باز کردن مدال:', error);
        }
    }

    updateGameStats(stats) {
        try {
            this.gameData.gameStats = { ...this.gameData.gameStats, ...stats };
            
            // ذخیره‌سازی خودکار هر 30 ثانیه
            if (this.autoSaveTimer) {
                clearTimeout(this.autoSaveTimer);
            }
            
            this.autoSaveTimer = setTimeout(() => {
                this.saveCurrentData();
            }, 30000);
            
        } catch (error) {
            console.error('❌ خطا در به‌روزرسانی آمار:', error);
        }
    }

    saveCurrentData() {
        try {
            localStorage.setItem('infiniteGalaxySave', JSON.stringify(this.gameData));
            console.log('💾 ذخیره‌سازی خودکار انجام شد');
        } catch (error) {
            console.error('❌ خطا در ذخیره‌سازی خودکار:', error);
        }
    }

    setupAutoSave() {
        // ذخیره‌سازی خودکار هنگام بسته شدن صفحه
        window.addEventListener('beforeunload', () => {
            this.saveCurrentData();
        });
        
        // ذخیره‌سازی دورهیی هر 2 دقیقه
        setInterval(() => {
            if (Game.gameRunning) {
                this.saveCurrentData();
            }
        }, 120000);
    }

    exportSaveData() {
        try {
            const dataStr = JSON.stringify(this.gameData);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportLink = document.createElement('a');
            exportLink.setAttribute('href', dataUri);
            exportLink.setAttribute('download', 'infinite_galaxy_save.json');
            exportLink.click();
            
            UI.showMessage('💾 داده‌های بازی با موفقیت export شدند');
            
        } catch (error) {
            console.error('❌ خطا در export داده‌ها:', error);
            UI.showMessage('❌ خطا در export داده‌ها');
        }
    }

    importSaveData(file) {
        try {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const importedData = JSON.parse(e.target.result);
                
                // اعتبارسنجی داده‌های وارد شده
                if (this.validateSaveData(importedData)) {
                    this.gameData = { ...this.gameData, ...importedData };
                    localStorage.setItem('infiniteGalaxySave', JSON.stringify(this.gameData));
                    this.applyLoadedData();
                    
                    UI.showMessage('📂 داده‌های بازی با موفقیت import شدند');
                    console.log('📂 داده‌های import شده:', importedData);
                } else {
                    UI.showMessage('❌ فایل ذخیره نامعتبر است');
                }
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            console.error('❌ خطا در import داده‌ها:', error);
            UI.showMessage('❌ خطا در import داده‌ها');
        }
    }

    validateSaveData(data) {
        // اعتبارسنجی ساختار داده‌های ذخیره شده
        return (
            data &&
            typeof data.highScore === 'number' &&
            typeof data.highLevel === 'number' &&
            typeof data.totalCoins === 'number' &&
            Array.isArray(data.achievements)
        );
    }

    resetToDefaults() {
        try {
            this.gameData = {
                highScore: 0,
                highLevel: 1,
                totalCoins: 0,
                achievements: [],
                settings: {},
                gameStats: {}
            };
            
            localStorage.setItem('infiniteGalaxySave', JSON.stringify(this.gameData));
            this.applyLoadedData();
            
            UI.showMessage('🔄 داده‌های بازی بازنشانی شدند');
            console.log('🔄 داده‌های بازی به حالت پیش‌فرض بازگشتند');
            
        } catch (error) {
            console.error('❌ خطا در بازنشانی داده‌ها:', error);
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem('infiniteGalaxySave');
            this.resetToDefaults();
            
            UI.showMessage('🗑️ تمام داده‌های بازی پاک شدند');
            console.log('🗑️ تمام داده‌های بازی پاک شدند');
            
        } catch (error) {
            console.error('❌ خطا در پاک کردن داده‌ها:', error);
        }
    }

    getGameData() {
        return { ...this.gameData };
    }

    getAchievements() {
        return [...this.gameData.achievements];
    }

    getSettings() {
        return { ...this.gameData.settings };
    }

    // مدیریت فضای ذخیره‌سازی
    getStorageUsage() {
        try {
            const data = localStorage.getItem('infiniteGalaxySave');
            if (data) {
                return {
                    size: new Blob([data]).size,
                    sizeKB: (new Blob([data]).size / 1024).toFixed(2)
                };
            }
            return { size: 0, sizeKB: '0.00' };
        } catch (error) {
            return { size: 0, sizeKB: '0.00' };
        }
    }
}

// ایجاد نمونه سیستم ذخیره‌سازی
const Storage = new StorageSystem();
