// m1.js - سیستم تنظیمات و ارتقاء سفینه

class SpaceshipUpgradeSystem {
    constructor() {
        this.upgrades = {
            speed: { level: 1, maxLevel: 10, cost: 100, value: 1 },
            fuelCapacity: { level: 1, maxLevel: 10, cost: 150, value: 100 },
            bombPower: { level: 1, maxLevel: 5, cost: 200, value: 1 },
            shield: { level: 1, maxLevel: 8, cost: 180, value: 0 }
        };
        
        this.spaceshipColors = [
            '#00ccff', '#ff4444', '#00ff88', '#ffaa00', 
            '#aa00ff', '#ff00aa', '#00aaff', '#ffff00'
        ];
        
        this.currentColorIndex = 0;
        this.totalCoins = 0;
        this.unlockedColors = [0]; // رنگ اولیه باز است
    }
    
    // بارگذاری تنظیمات از localStorage
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('spaceshipSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.upgrades = settings.upgrades || this.upgrades;
                this.currentColorIndex = settings.currentColorIndex || 0;
                this.unlockedColors = settings.unlockedColors || [0];
                this.totalCoins = settings.totalCoins || 0;
            }
        } catch (error) {
            console.error('خطا در بارگذاری تنظیمات:', error);
        }
    }
    
    // ذخیره تنظیمات در localStorage
    saveSettings() {
        try {
            const settings = {
                upgrades: this.upgrades,
                currentColorIndex: this.currentColorIndex,
                unlockedColors: this.unlockedColors,
                totalCoins: this.totalCoins
            };
            localStorage.setItem('spaceshipSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('خطا در ذخیره تنظیمات:', error);
        }
    }
    
    // ارتقاء ویژگی سفینه
    upgrade(feature) {
        const upgrade = this.upgrades[feature];
        if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;
        
        const cost = upgrade.cost * upgrade.level;
        if (this.totalCoins < cost) return false;
        
        this.totalCoins -= cost;
        upgrade.level++;
        upgrade.value = this.calculateUpgradeValue(feature, upgrade.level);
        
        this.saveSettings();
        return true;
    }
    
    // محاسبه مقدار ارتقاء
    calculateUpgradeValue(feature, level) {
        switch(feature) {
            case 'speed':
                return 1 + (level - 1) * 0.5;
            case 'fuelCapacity':
                return 100 + (level - 1) * 20;
            case 'bombPower':
                return 1 + (level - 1) * 0.25;
            case 'shield':
                return (level - 1) * 10;
            default:
                return level;
        }
    }
    
    // باز کردن رنگ جدید
    unlockColor(colorIndex) {
        if (this.unlockedColors.includes(colorIndex)) return true;
        
        const cost = (colorIndex + 1) * 500;
        if (this.totalCoins < cost) return false;
        
        this.totalCoins -= cost;
        this.unlockedColors.push(colorIndex);
        this.saveSettings();
        return true;
    }
    
    // تغییر رنگ سفینه
    changeColor(colorIndex) {
        if (this.unlockedColors.includes(colorIndex)) {
            this.currentColorIndex = colorIndex;
            this.saveSettings();
            return true;
        }
        return false;
    }
    
    // اضافه کردن سکه
    addCoins(amount) {
        this.totalCoins += amount;
        this.saveSettings();
    }
    
    // گرفتن اطلاعات ارتقاء
    getUpgradeInfo(feature) {
        const upgrade = this.upgrades[feature];
        if (!upgrade) return null;
        
        return {
            level: upgrade.level,
            maxLevel: upgrade.maxLevel,
            cost: upgrade.cost * upgrade.level,
            value: upgrade.value,
            nextValue: this.calculateUpgradeValue(feature, upgrade.level + 1)
        };
    }
    
    // گرفتن اطلاعات رنگ‌ها
    getColorInfo() {
        return {
            currentColor: this.spaceshipColors[this.currentColorIndex],
            currentColorIndex: this.currentColorIndex,
            unlockedColors: this.unlockedColors,
            allColors: this.spaceshipColors
        };
    }
    
    // گرفتن اطلاعات کلی
    getStats() {
        return {
            totalCoins: this.totalCoins,
            upgrades: this.upgrades,
            colorInfo: this.getColorInfo()
        };
    }
}

// سیستم هوش مصنوعی برای دشمنان
class AIEnemySystem {
    constructor() {
        this.difficultyLevel = 1;
        this.enemyBehaviors = ['chase', 'patrol', 'ambush', 'evade'];
        this.currentBehavior = 'chase';
    }
    
    // به‌روزرسانی رفتار دشمنان بر اساس سطح دشواری
    updateEnemyBehavior(enemies, player, currentLevel) {
        this.difficultyLevel = Math.min(10, Math.floor(currentLevel / 3) + 1);
        
        // تغییر رفتار هر 10 ثانیه
        if (Math.random() < 0.01) {
            this.currentBehavior = this.enemyBehaviors[
                Math.floor(Math.random() * this.enemyBehaviors.length)
            ];
        }
        
        enemies.forEach((enemy, index) => {
            this.applyBehavior(enemy, player, index);
        });
    }
    
    // اعمال رفتار بر روی دشمن
    applyBehavior(enemy, player, index) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let speedMultiplier = 1;
        let targetX = enemy.targetX;
        let targetY = enemy.targetY;
        
        switch(this.currentBehavior) {
            case 'chase':
                // تعقیب مستقیم بازیکن
                if (distance < 800) {
                    targetX = player.x;
                    targetY = player.y;
                    speedMultiplier = 1.2;
                }
                break;
                
            case 'patrol':
                // گشت‌زنی در مناطق خاص
                if (distance < 300 || Math.random() < 0.02) {
                    targetX = player.x + (Math.random() - 0.5) * 600;
                    targetY = player.y + (Math.random() - 0.5) * 600;
                }
                break;
                
            case 'ambush':
                // کمین در مسیر حرکت بازیکن
                if (index % 3 === 0 && distance < 500) {
                    const predictX = player.x + (player.x - enemy.x) * 0.5;
                    const predictY = player.y + (player.y - enemy.y) * 0.5;
                    targetX = predictX;
                    targetY = predictY;
                }
                break;
                
            case 'evade':
                // فرار از بازیکن وقتی نزدیک است
                if (distance < 400) {
                    targetX = enemy.x - dx * 2;
                    targetY = enemy.y - dy * 2;
                }
                break;
        }
        
        // اعمال ضریب سرعت بر اساس سطح دشواری
        enemy.speed = (1 + this.difficultyLevel * 0.1) * speedMultiplier;
        enemy.targetX = targetX;
        enemy.targetY = targetY;
        
        // محدود کردن مقاصد به داخل جهان بازی
        enemy.targetX = Math.max(100, Math.min(3900, enemy.targetX));
        enemy.targetY = Math.max(100, Math.min(3900, enemy.targetY));
    }
    
    // تنظیم سطح دشواری
    setDifficulty(level) {
        this.difficultyLevel = Math.max(1, Math.min(10, level));
    }
}

// سیستم تنظیمات بازی
class GameSettings {
    constructor() {
        this.settings = {
            graphics: {
                quality: 'high', // low, medium, high
                particles: true,
                shadows: true,
                antiAliasing: true
            },
            audio: {
                musicVolume: 0.7,
                sfxVolume: 0.8,
                mute: false
            },
            controls: {
                sensitivity: 1.0,
                invertY: false,
                touchControls: true
            },
            gameplay: {
                difficulty: 'normal', // easy, normal, hard
                autoSave: true,
                showTutorial: true
            }
        };
    }
    
    // بارگذاری تنظیمات
    load() {
        try {
            const saved = localStorage.getItem('gameSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('خطا در بارگذاری تنظیمات:', error);
        }
    }
    
    // ذخیره تنظیمات
    save() {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('خطا در ذخیره تنظیمات:', error);
        }
    }
    
    // تغییر تنظیمات
    set(settingPath, value) {
        const path = settingPath.split('.');
        let current = this.settings;
        
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        
        current[path[path.length - 1]] = value;
        this.save();
    }
    
    // گرفتن تنظیمات
    get(settingPath) {
        const path = settingPath.split('.');
        let current = this.settings;
        
        for (const key of path) {
            if (current[key] === undefined) return undefined;
            current = current[key];
        }
        
        return current;
    }
    
    // بازنشانی به حالت پیش‌فرض
    reset() {
        this.settings = new GameSettings().settings;
        this.save();
    }
}

// ایجاد نمونه‌های جهانی
const spaceshipUpgrades = new SpaceshipUpgradeSystem();
const aiEnemySystem = new AIEnemySystem();
const gameSettings = new GameSettings();

// بارگذاری اولیه تنظیمات
spaceshipUpgrades.loadSettings();
gameSettings.load();

// صادر کردن برای استفاده در فایل اصلی
window.SpaceshipUpgradeSystem = SpaceshipUpgradeSystem;
window.AIEnemySystem = AIEnemySystem;
window.GameSettings = GameSettings;
window.spaceshipUpgrades = spaceshipUpgrades;
window.aiEnemySystem = aiEnemySystem;
window.gameSettings = gameSettings;
