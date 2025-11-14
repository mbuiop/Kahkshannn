// m2.js - سیستم‌های پیشرفته - نسخه تطبیق‌پذیر
// =============================================

class AdvancedGameSystems {
    constructor(gameEngine) {
        console.log("🔗 اتصال سیستم‌های پیشرفته به موتور بازی...");
        
        if (!gameEngine || !gameEngine.scene) {
            console.error("❌ موتور بازی در دسترس نیست!");
            return;
        }
        
        this.gameEngine = gameEngine;
        this.isConnected = false;
        
        this.connectToGameEngine();
    }

    async connectToGameEngine() {
        try {
            // صبر کن تا موتور بازی کاملاً راه‌اندازی بشه
            await this.waitForGameEngine();
            
            // راه‌اندازی سیستم‌ها
            await this.initializeSystems();
            
            this.isConnected = true;
            console.log("✅ سیستم‌های پیشرفته با موفقیت به موتور بازی وصل شدند");
            
        } catch (error) {
            console.error("❌ خطا در اتصال به موتور بازی:", error);
        }
    }

    async waitForGameEngine() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 ثانیه
            
            const checkInterval = setInterval(() => {
                attempts++;
                
                if (this.gameEngine && this.gameEngine.scene && this.gameEngine.initialized) {
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    reject(new Error("موتور بازی در دسترس نیست"));
                    return;
                }
                
                console.log(`⏳ منتظر موتور بازی... (${attempts}/${maxAttempts})`);
            }, 100);
        });
    }

    async initializeSystems() {
        // فقط سیستم‌های ساده‌تر رو راه‌اندازی کن
        this.weatherSystem = new SimpleWeatherSystem(this.gameEngine);
        this.dayNightCycle = new SimpleDayNightCycle(this.gameEngine);
        this.soundSystem = new SimpleSoundSystem(this.gameEngine);
        
        await this.weatherSystem.init();
        await this.dayNightCycle.init();
        await this.soundSystem.init();
        
        // سیستم‌های پیچیده‌تر رو بعداً راه‌اندازی کن
        setTimeout(() => {
            this.initializeAdvancedSystems();
        }, 2000);
    }

    async initializeAdvancedSystems() {
        try {
            this.economySystem = new SimpleEconomySystem(this.gameEngine);
            this.questSystem = new SimpleQuestSystem(this.gameEngine);
            this.particleSystem = new SimpleParticleSystem(this.gameEngine);
            
            await this.economySystem.init();
            await this.questSystem.init();
            await this.particleSystem.init();
            
            console.log("✅ همه سیستم‌های پیشرفته راه‌اندازی شدند");
            
        } catch (error) {
            console.warn("⚠️ برخی سیستم‌های پیشرفته راه‌اندازی نشدند:", error);
        }
    }
}

// سیستم آب و هوای ساده‌شده
class SimpleWeatherSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentWeather = 'sunny';
    }

    async init() {
        console.log("🌤️ راه‌اندازی سیستم آب و هوای ساده...");
        this.startWeatherChanges();
        return this;
    }

    startWeatherChanges() {
        // تغییر آب و هوا هر 3 دقیقه
        setInterval(() => {
            this.changeWeather();
        }, 180000);
    }

    changeWeather() {
        const weatherTypes = ['sunny', 'rainy', 'cloudy'];
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        
        this.currentWeather = newWeather;
        
        if (this.gameEngine.showNotification) {
            this.gameEngine.showNotification(`🌤️ آب و هوا: ${this.getWeatherName(newWeather)}`);
        }
        
        console.log(`🌤️ آب و هوا تغییر کرد به: ${newWeather}`);
    }

    getWeatherName(weatherType) {
        const names = {
            'sunny': 'آفتابی',
            'rainy': 'بارانی', 
            'cloudy': 'ابری'
        };
        return names[weatherType] || weatherType;
    }
}

// سیستم روز و شب ساده‌شده
class SimpleDayNightCycle {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isNight = false;
    }

    async init() {
        console.log("🌙 راه‌اندازی سیستم روز و شب ساده...");
        this.startTimeCycle();
        return this;
    }

    startTimeCycle() {
        // تغییر روز و شب هر 2 دقیقه
        setInterval(() => {
            this.toggleDayNight();
        }, 120000);
    }

    toggleDayNight() {
        this.isNight = !this.isNight;
        
        if (this.gameEngine.showNotification) {
            this.gameEngine.showNotification(this.isNight ? "🌙 شب شد" : "☀️ روز شد");
        }
        
        // تغییر نور ساده
        if (this.gameEngine.mainLight) {
            this.gameEngine.mainLight.intensity = this.isNight ? 0.3 : 1.0;
        }
        
        console.log(this.isNight ? "🌙 شب شد" : "☀️ روز شد");
    }
}

// سیستم صوتی ساده‌شده
class SimpleSoundSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isMuted = false;
    }

    async init() {
        console.log("🔊 راه‌اندازی سیستم صوتی ساده...");
        return this;
    }

    playSound(soundName) {
        if (this.isMuted) return;
        console.log(`🔊 پخش صدا: ${soundName}`);
    }

    playNotificationSound() {
        this.playSound('notification');
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(this.isMuted ? "🔇 صدا خاموش شد" : "🔊 صدا روشن شد");
        return this.isMuted;
    }
}

// سیستم اقتصادی ساده‌شده
class SimpleEconomySystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }

    async init() {
        console.log("💰 راه‌اندازی سیستم اقتصادی ساده...");
        this.startMarketChanges();
        return this;
    }

    startMarketChanges() {
        // تغییر قیمت‌ها هر 1 دقیقه
        setInterval(() => {
            this.fluctuatePrices();
        }, 60000);
    }

    fluctuatePrices() {
        console.log("💰 نوسان قیمت‌های بازار");
        
        if (this.gameEngine.showNotification) {
            this.gameEngine.showNotification("💰 نوسان قیمت در بازار");
        }
    }
}

// سیستم مأموریت‌های ساده‌شده
class SimpleQuestSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.activeQuests = [];
    }

    async init() {
        console.log("📋 راه‌اندازی سیستم مأموریت‌های ساده...");
        this.generateDailyQuests();
        this.startQuestChecker();
        return this;
    }

    generateDailyQuests() {
        this.activeQuests = [
            {
                id: 'build_3',
                title: 'سازنده مبتدی',
                description: '3 ساختمان بساز',
                reward: { gold: 200 },
                completed: false
            },
            {
                id: 'train_5', 
                title: 'آموزش واحدها',
                description: '5 واحد آموزش بده',
                reward: { gold: 300 },
                completed: false
            }
        ];
        
        console.log("📋 مأموریت‌های روزانه تولید شدند");
    }

    startQuestChecker() {
        // بررسی مأموریت‌ها هر 30 ثانیه
        setInterval(() => {
            this.checkQuests();
        }, 30000);
    }

    checkQuests() {
        this.activeQuests.forEach(quest => {
            if (!quest.completed) {
                if (this.isQuestCompleted(quest)) {
                    this.completeQuest(quest);
                }
            }
        });
    }

    isQuestCompleted(quest) {
        if (!this.gameEngine.stats) return false;
        
        switch (quest.id) {
            case 'build_3':
                return this.gameEngine.stats.buildingsBuilt >= 3;
            case 'train_5':
                return this.gameEngine.stats.unitsTrained >= 5;
            default:
                return false;
        }
    }

    completeQuest(quest) {
        quest.completed = true;
        
        // اعمال پاداش
        if (quest.reward.gold && this.gameEngine.resources) {
            this.gameEngine.resources.gold += quest.reward.gold;
        }
        
        if (this.gameEngine.showNotification) {
            this.gameEngine.showNotification(
                `🏆 مأموریت "${quest.title}" تکمیل شد! پاداش: ${quest.reward.gold} طلا`,
                'success'
            );
        }
        
        if (this.gameEngine.updateResourceUI) {
            this.gameEngine.updateResourceUI();
        }
        
        console.log(`🏆 مأموریت "${quest.title}" تکمیل شد`);
    }
}

// سیستم ذرات ساده‌شده
class SimpleParticleSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }

    async init() {
        console.log("✨ راه‌اندازی سیستم ذرات ساده...");
        return this;
    }

    createSimpleEffect(position, type) {
        if (!this.gameEngine.scene) return;
        
        try {
            let particle;
            
            switch (type) {
                case 'build':
                    particle = BABYLON.MeshBuilder.CreateSphere("buildEffect", {
                        diameter: 0.5
                    }, this.gameEngine.scene);
                    break;
                case 'attack':
                    particle = BABYLON.MeshBuilder.CreateSphere("attackEffect", {
                        diameter: 0.3
                    }, this.gameEngine.scene);
                    break;
                default:
                    return;
            }
            
            particle.position.copyFrom(position);
            particle.position.y += 2;
            
            const material = new BABYLON.StandardMaterial("effectMaterial", this.gameEngine.scene);
            material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
            material.alpha = 0.7;
            particle.material = material;
            
            // حذف پس از 1 ثانیه
            setTimeout(() => {
                if (particle && !particle.isDisposed()) {
                    particle.dispose();
                }
            }, 1000);
            
        } catch (error) {
            console.warn("⚠️ خطا در ایجاد اثر ذره:", error);
        }
    }
}

// =============================================
// 🎯 اتصال خودکار به موتور بازی
// =============================================

function connectToGameEngine() {
    console.log("🚀 شروع اتصال m2.js به موتور بازی...");
    
    // روش 1: اگر gameEngine از قبل وجود داره
    if (window.gameEngine) {
        console.log("✅ موتور بازی پیدا شد، در حال اتصال...");
        window.advancedSystems = new AdvancedGameSystems(window.gameEngine);
        return true;
    }
    
    // روش 2: منتظر بارگذاری بازی بمون
    let attempts = 0;
    const maxAttempts = 100; // 10 ثانیه
    
    const connectionAttempt = setInterval(() => {
        attempts++;
        
        if (window.gameEngine && window.gameEngine.scene) {
            clearInterval(connectionAttempt);
            console.log("✅ موتور بازی بعد از " + attempts + " تلاش پیدا شد!");
            window.advancedSystems = new AdvancedGameSystems(window.gameEngine);
            return true;
        }
        
        if (attempts >= maxAttempts) {
            clearInterval(connectionAttempt);
            console.error("❌ موتور بازی بعد از 10 ثانیه پیدا نشد!");
            return false;
        }
        
        if (attempts % 10 === 0) {
            console.log(`⏳ در انتظار موتور بازی... (${attempts}/${maxAttempts})`);
        }
    }, 100);
    
    return false;
}

// =============================================
// 🔧 گسترش موتور بازی اصلی
// =============================================

// گسترش متدهای بازی اصلی اگر وجود دارند
function extendGameEngine() {
    if (!window.gameEngine) return;
    
    console.log("🔧 گسترش موتور بازی اصلی...");
    
    // ذخیره متد اصلی update
    const originalUpdate = window.gameEngine.update;
    
    // گسترش متد update
    window.gameEngine.update = function() {
        // فراخوانی متد اصلی
        if (originalUpdate) {
            originalUpdate.call(this);
        }
        
        // اضافه کردن به‌روزرسانی سیستم‌های پیشرفته
        if (window.advancedSystems && window.advancedSystems.isConnected) {
            // اینجا می‌تونیم سیستم‌های پیشرفته رو به‌روزرسانی کنیم
        }
    };
    
    // گسترش متد placeBuilding برای اضافه کردن افکت
    const originalPlaceBuilding = window.gameEngine.placeBuilding;
    if (originalPlaceBuilding) {
        window.gameEngine.placeBuilding = function(buildingType, position) {
            // فراخوانی متد اصلی
            const result = originalPlaceBuilding.call(this, buildingType, position);
            
            // اضافه کردن افکت
            if (window.advancedSystems && window.advancedSystems.particleSystem) {
                window.advancedSystems.particleSystem.createSimpleEffect(position, 'build');
            }
            
            if (window.advancedSystems && window.advancedSystems.soundSystem) {
                window.advancedSystems.soundSystem.playSound('build');
            }
            
            return result;
        };
    }
    
    // گسترش متد trainUnit برای اضافه کردن افکت
    const originalTrainUnit = window.gameEngine.trainUnit;
    if (originalTrainUnit) {
        window.gameEngine.trainUnit = function(barracks, unitType) {
            // فراخوانی متد اصلی
            const result = originalTrainUnit.call(this, barracks, unitType);
            
            // اضافه کردن افکت
            if (window.advancedSystems && window.advancedSystems.soundSystem) {
                window.advancedSystems.soundSystem.playSound('train');
            }
            
            return result;
        };
    }
    
    console.log("✅ موتور بازی با موفقیت گسترش یافت");
}

// =============================================
// 🚀 راه‌اندازی اصلی
// =============================================

// وقتی صفحه کاملاً بارگذاری شد
window.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM آماده است، شروع اتصال...");
    
    // کمی صبر کن سپس اتصال رو شروع کن
    setTimeout(() => {
        const connected = connectToGameEngine();
        
        if (connected) {
            // بعد از اتصال موفق، موتور رو گسترش بده
            setTimeout(extendGameEngine, 1000);
        }
    }, 1000);
});

// همچنین وقتی window بارگذاری شد
window.addEventListener('load', function() {
    console.log("🎮 بازی بارگذاری شد، بررسی اتصال...");
});

// راه‌اندازی تأخیری برای مواردی که بازی دیر بارگذاری میشه
setTimeout(() => {
    if (!window.advancedSystems && window.gameEngine) {
        console.log("🔄 راه‌اندازی تأخیری سیستم‌های پیشرفته...");
        window.advancedSystems = new AdvancedGameSystems(window.gameEngine);
    }
}, 5000);

// =============================================
// 🎮 متدهای دیباگ و تست
// =============================================

window.debugAdvancedSystems = {
    status: () => {
        return {
            gameEngine: !!window.gameEngine,
            advancedSystems: !!window.advancedSystems,
            connected: window.advancedSystems ? window.advancedSystems.isConnected : false,
            systems: window.advancedSystems ? Object.keys(window.advancedSystems) : []
        };
    },
    
    testConnection: () => {
        if (!window.gameEngine) {
            console.error("❌ gameEngine یافت نشد");
            return false;
        }
        
        if (!window.advancedSystems) {
            console.error("❌ advancedSystems یافت نشد");
            return false;
        }
        
        console.log("✅ تست اتصال موفق:");
        console.log("- موتور بازی:", window.gameEngine);
        console.log("- سیستم‌های پیشرفته:", window.advancedSystems);
        console.log("- وضعیت اتصال:", window.advancedSystems.isConnected);
        
        return true;
    },
    
    forceConnect: () => {
        if (window.gameEngine) {
            window.advancedSystems = new AdvancedGameSystems(window.gameEngine);
            console.log("🔧 اتصال اجباری انجام شد");
            return true;
        } else {
            console.error("❌ gameEngine برای اتصال اجباری یافت نشد");
            return false;
        }
    }
};

console.log("✅ m2.js - سیستم‌های پیشرفته بارگذاری شد");
console.log("🔗 در حال انتظار برای اتصال به موتور بازی...");
