// فایل m.js - قابلیت‌های اضافی برای بازی Clash 3D

// سیستم دستاوردها
const achievements = {
    firstUpgrade: { name: "اولین ارتقاء", description: "اولین ساختمان خود را ارتقاء دهید", completed: false, reward: 1000 },
    masterBuilder: { name: "استاد سازنده", description: "10 ساختمان بسازید", completed: false, reward: 5000 },
    defenseExpert: { name: "متخصص دفاع", description: "5 تیربار بسازید", completed: false, reward: 3000 },
    resourceMaster: { name: "استاد منابع", description: "همه مخازن را به سطح 5 برسانید", completed: false, reward: 10000 },
    waveSurvivor: { name: "نجات‌یافته از موج", description: "10 موج را پشت سر بگذارید", completed: false, reward: 8000 }
};

// سیستم چالش‌های روزانه
const dailyChallenges = {
    collectGold: { name: "جمع‌آوری طلا", description: "10000 طلا جمع‌آوری کنید", target: 10000, progress: 0, reward: 2000 },
    defeatEnemies: { name: "شکست دشمنان", description: "50 دشمن را شکست دهید", target: 50, progress: 0, reward: 3000 },
    upgradeBuildings: { name: "ارتقاء ساختمان‌ها", description: "5 ساختمان را ارتقاء دهید", target: 5, progress: 0, reward: 4000 }
};

// سیستم رویدادهای فصلی
const seasonalEvents = {
    springFestival: { name: "جشنواره بهار", active: true, startDate: "2024-03-20", endDate: "2024-04-20", bonuses: { production: 1.2, training: 0.8 } },
    summerBattle: { name: "نبرد تابستانی", active: false, startDate: "2024-06-21", endDate: "2024-07-21", bonuses: { attack: 1.15, defense: 1.1 } }
};

// سیستم رهبران
const leaderboard = {
    players: [],
    addPlayer: function(name, score) {
        this.players.push({ name, score, date: new Date() });
        this.players.sort((a, b) => b.score - a.score);
        this.players = this.players.slice(0, 10); // فقط 10 رکورد برتر
    },
    getTopPlayers: function() {
        return this.players.slice(0, 5);
    }
};

// سیستم معاملات و بازار
const marketplace = {
    items: [
        { id: 1, name: "بسته طلای کوچک", type: "gold", amount: 5000, price: 100, gemCost: 10 },
        { id: 2, name: "بسته اکسیر کوچک", type: "elixir", amount: 3000, price: 80, gemCost: 8 },
        { id: 3, name: "بسته نفت کوچک", type: "oil", amount: 2000, price: 60, gemCost: 6 },
        { id: 4, name: "سرباز ویژه", type: "troop", amount: 5, price: 150, gemCost: 15 },
        { id: 5, name: "تیربار پیشرفته", type: "defense", amount: 1, price: 500, gemCost: 50 }
    ],
    purchase: function(itemId, playerResources) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return false;
        
        if (playerResources.gems >= item.gemCost) {
            playerResources.gems -= item.gemCost;
            
            switch(item.type) {
                case "gold":
                    playerResources.gold += item.amount;
                    break;
                case "elixir":
                    playerResources.elixir += item.amount;
                    break;
                case "oil":
                    playerResources.oil += item.amount;
                    break;
                case "troop":
                    // اضافه کردن سرباز ویژه
                    break;
                case "defense":
                    // اضافه کردن تیربار پیشرفته
                    break;
            }
            
            return true;
        }
        return false;
    }
};

// سیستم کمک‌های دوستان
const friendSystem = {
    friends: [],
    requests: [],
    sendResources: function(friendId, resourceType, amount) {
        // ارسال منابع به دوست
        console.log(`ارسال ${amount} ${resourceType} به دوست`);
    },
    requestHelp: function(buildingType) {
        // درخواست کمک برای ساختمان
        console.log(`درخواست کمک برای ${buildingType}`);
    },
    addFriend: function(playerId) {
        this.requests.push({ from: playerId, timestamp: Date.now() });
    }
};

// سیستم آمار پیشرفته
const advancedStatistics = {
    combatStats: {
        totalAttacks: 0,
        successfulAttacks: 0,
        defenses: 0,
        successfulDefenses: 0,
        troopsLost: 0,
        enemiesKilled: 0
    },
    resourceStats: {
        goldCollected: 0,
        elixirCollected: 0,
        oilCollected: 0,
        goldSpent: 0,
        elixirSpent: 0,
        oilSpent: 0
    },
    buildingStats: {
        totalBuildings: 0,
        buildingsDestroyed: 0,
        upgradesCompleted: 0,
        constructionTime: 0
    },
    updateCombatStats: function(type, success = false) {
        this.combatStats[type]++;
        if (success) {
            this.combatStats[`successful${type.charAt(0).toUpperCase() + type.slice(1)}`]++;
        }
    },
    updateResourceStats: function(type, amount, collected = true) {
        if (collected) {
            this.resourceStats[`${type}Collected`] += amount;
        } else {
            this.resourceStats[`${type}Spent`] += amount;
        }
    }
};

// سیستم نوتیفیکیشن
const notificationSystem = {
    notifications: [],
    addNotification: function(title, message, type = "info") {
        this.notifications.push({
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date(),
            read: false
        });
        
        this.showToast(title, message, type);
    },
    showToast: function(title, message, type) {
        // ایجاد نوتیفیکیشن موقت در صفحه
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <strong>${title}</strong>
            <p>${message}</p>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    },
    markAsRead: function(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }
    }
};

// سیستم ذخیره‌سازی پیشرفته
const advancedStorage = {
    saveGame: function() {
        const gameData = {
            resources: resourceState,
            base: baseState,
            defense: defenseState,
            troops: troopsState,
            buildings: buildingsState,
            statistics: statisticsState,
            achievements: achievements,
            timestamp: Date.now()
        };
        
        localStorage.setItem('clash3d_save', JSON.stringify(gameData));
        console.log('بازی ذخیره شد');
    },
    loadGame: function() {
        const savedData = localStorage.getItem('clash3d_save');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            
            // بارگذاری داده‌ها
            Object.assign(resourceState, gameData.resources);
            Object.assign(baseState, gameData.base);
            Object.assign(defenseState, gameData.defense);
            Object.assign(troopsState, gameData.troops);
            Object.assign(buildingsState, gameData.buildings);
            Object.assign(statisticsState, gameData.statistics);
            Object.assign(achievements, gameData.achievements);
            
            console.log('بازی بارگذاری شد');
            return true;
        }
        return false;
    },
    autoSave: function() {
        setInterval(() => {
            this.saveGame();
        }, 30000); // هر 30 ثانیه
    }
};

// سیستم موسیقی و صدا
const audioManager = {
    backgroundMusic: null,
    soundEffects: {},
    playBackgroundMusic: function(track) {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
        this.backgroundMusic = new Audio(track);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3;
        this.backgroundMusic.play();
    },
    playSoundEffect: function(effect, volume = 0.7) {
        if (this.soundEffects[effect]) {
            const sound = new Audio(this.soundEffects[effect]);
            sound.volume = volume;
            sound.play();
        }
    },
    loadSounds: function() {
        this.soundEffects = {
            build: 'sounds/build.mp3',
            upgrade: 'sounds/upgrade.mp3',
            attack: 'sounds/attack.mp3',
            explosion: 'sounds/explosion.mp3',
            victory: 'sounds/victory.mp3',
            defeat: 'sounds/defeat.mp3'
        };
    }
};

// سیستم چت
const chatSystem = {
    messages: [],
    sendMessage: function(player, message) {
        this.messages.push({
            player: player,
            message: message,
            timestamp: new Date()
        });
        
        // فقط 50 پیام آخر را نگه دار
        if (this.messages.length > 50) {
            this.messages.shift();
        }
    },
    getRecentMessages: function(count = 10) {
        return this.messages.slice(-count);
    }
};

// صادر کردن توابع برای استفاده در فایل اصلی
window.mjs = {
    achievements,
    dailyChallenges,
    seasonalEvents,
    leaderboard,
    marketplace,
    friendSystem,
    advancedStatistics,
    notificationSystem,
    advancedStorage,
    audioManager,
    chatSystem
};
