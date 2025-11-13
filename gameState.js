class GameState {
    constructor() {
        this.gameVersion = "1.0.0";
        this.saveVersion = "1.0";
        
        this.playerData = {
            playerId: this.generatePlayerId(),
            playerName: "بازیکن",
            level: 1,
            experience: 0,
            totalExperience: 0,
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            playTime: 0,
            achievements: new Map(),
            statistics: this.initializeStatistics()
        };

        this.gameData = {
            resources: null,
            buildings: null,
            units: null,
            combat: null,
            research: new Map(),
            quests: this.initializeQuests(),
            events: this.initializeEvents(),
            settings: this.initializeSettings()
        };

        this.sessionData = {
            startTime: Date.now(),
            currentTime: Date.now(),
            framesRendered: 0,
            actionsPerformed: 0,
            sessionScore: 0
        };

        this.analytics = {
            events: [],
            errors: [],
            performance: [],
            userActions: []
        };

        this.initializeGameState();
    }

    initializeGameState() {
        this.setupAutoSave();
        this.setupSessionTracking();
        this.loadGameData();
        this.initializeAchievements();
        this.setupGameTickers();
    }

    initializeStatistics() {
        return {
            // Building statistics
            buildingsConstructed: 0,
            buildingsUpgraded: 0,
            buildingsDestroyed: 0,
            
            // Unit statistics
            unitsTrained: 0,
            unitsLost: 0,
            unitsKilled: 0,
            
            // Combat statistics
            attacksLaunched: 0,
            defensesWon: 0,
            totalDamageDealt: 0,
            totalDamageReceived: 0,
            
            // Resource statistics
            goldCollected: 0,
            elixirCollected: 0,
            gemCollected: 0,
            goldSpent: 0,
            elixirSpent: 0,
            gemSpent: 0,
            
            // Game progression
            daysPlayed: 1,
            totalPlayTime: 0,
            maxVillageScore: 0,
            
            // Social statistics
            friendsInvited: 0,
            clanDonations: 0,
            messagesSent: 0
        };
    }

    initializeQuests() {
        return new Map([
            ['first_building', {
                id: 'first_building',
                title: 'ساخت اولین ساختمان',
                description: 'یک ساختمان جدید در پایگاه خود بسازید',
                type: 'building',
                target: 'construct_building',
                targetCount: 1,
                currentCount: 0,
                reward: { gold: 100, elixir: 50, gem: 5 },
                completed: false,
                claimed: false
            }],
            ['upgrade_twice', {
                id: 'upgrade_twice',
                title: 'ارتقای ساختمان‌ها',
                description: 'دو ساختمان را ارتقا دهید',
                type: 'upgrade',
                target: 'upgrade_building',
                targetCount: 2,
                currentCount: 0,
                reward: { gold: 200, elixir: 100, gem: 10 },
                completed: false,
                claimed: false
            }],
            ['train_units', {
                id: 'train_units',
                title: 'آموزش نیروها',
                description: '۵ نیرو آموزش دهید',
                type: 'training',
                target: 'train_unit',
                targetCount: 5,
                currentCount: 0,
                reward: { gold: 150, elixir: 200, gem: 8 },
                completed: false,
                claimed: false
            }],
            ['win_battle', {
                id: 'win_battle',
                title: 'پیروزی در نبرد',
                description: 'در یک نبرد پیروز شوید',
                type: 'combat',
                target: 'win_attack',
                targetCount: 1,
                currentCount: 0,
                reward: { gold: 300, elixir: 250, gem: 15 },
                completed: false,
                claimed: false
            }],
            ['collect_resources', {
                id: 'collect_resources',
                title: 'جمع‌آوری منابع',
                description: '۱۰۰۰ طلا جمع‌آوری کنید',
                type: 'resource',
                target: 'collect_gold',
                targetCount: 1000,
                currentCount: 0,
                reward: { gold: 500, elixir: 300, gem: 20 },
                completed: false,
                claimed: false
            }]
        ]);
    }

    initializeEvents() {
        return {
            dailyRewards: {
                lastClaimed: null,
                streak: 0,
                nextAvailable: this.getNextDailyReset()
            },
            seasonalEvents: new Map(),
            specialOffers: new Map(),
            clanEvents: new Map()
        };
    }

    initializeSettings() {
        return {
            graphics: {
                quality: 'high',
                shadows: true,
                bloom: true,
                antiAliasing: true,
                postProcessing: true,
                textureQuality: 'high',
                resolution: 'auto'
            },
            audio: {
                masterVolume: 80,
                musicVolume: 70,
                sfxVolume: 90,
                voiceVolume: 60,
                ambientVolume: 50,
                mute: false
            },
            controls: {
                cameraSensitivity: 5,
                scrollSensitivity: 1,
                invertY: false,
                touchControls: true,
                virtualJoystick: true
            },
            game: {
                language: 'fa',
                showTutorial: true,
                combatSpeed: 'normal',
                autoSave: true,
                notifications: true,
                privacy: 'public'
            }
        };
    }

    initializeAchievements() {
        this.achievementDefinitions = new Map([
            ['builder_novice', {
                id: 'builder_novice',
                title: 'معمار تازه کار',
                description: '۱۰ ساختمان بسازید',
                icon: '🏗️',
                tier: 'bronze',
                target: 10,
                type: 'buildings_constructed',
                reward: { gold: 500, gem: 25 },
                unlocked: false
            }],
            ['veteran_warrior', {
                id: 'veteran_warrior',
                title: 'جنگجوی کهنه کار',
                description: '۱۰۰ واحد دشمن را نابود کنید',
                icon: '⚔️',
                tier: 'silver',
                target: 100,
                type: 'units_killed',
                reward: { gold: 1000, gem: 50 },
                unlocked: false
            }],
            ['resource_tycoon', {
                id: 'resource_tycoon',
                title: 'سلطان منابع',
                description: '۱۰۰۰۰۰ طلا جمع‌آوری کنید',
                icon: '💰',
                tier: 'gold',
                target: 100000,
                type: 'gold_collected',
                reward: { gold: 5000, gem: 100 },
                unlocked: false
            }],
            ['defense_expert', {
                id: 'defense_expert',
                title: 'متخصص دفاع',
                description: '۵۰ حمله را دفع کنید',
                icon: '🛡️',
                tier: 'silver',
                target: 50,
                type: 'defenses_won',
                reward: { gold: 2000, gem: 75 },
                unlocked: false
            }],
            ['legendary_commander', {
                id: 'legendary_commander',
                title: 'فرمانده افسانه‌ای',
                description: 'به سطح ۵۰ برسید',
                icon: '👑',
                tier: 'platinum',
                target: 50,
                type: 'player_level',
                reward: { gold: 10000, gem: 200 },
                unlocked: false
            }]
        ]);
    }

    // Player progression system
    addExperience(amount) {
        this.playerData.experience += amount;
        this.playerData.totalExperience += amount;
        
        const oldLevel = this.playerData.level;
        const newLevel = this.calculateLevel(this.playerData.experience);
        
        if (newLevel > oldLevel) {
            this.playerData.level = newLevel;
            this.onLevelUp(oldLevel, newLevel);
        }

        this.trackEvent('experience_gained', { amount: amount, newLevel: newLevel });
    }

    calculateLevel(experience) {
        // Exponential leveling formula
        return Math.floor(Math.sqrt(experience / 100)) + 1;
    }

    calculateExperienceForLevel(level) {
        return Math.pow(level - 1, 2) * 100;
    }

    onLevelUp(oldLevel, newLevel) {
        // Level up rewards
        const rewards = {
            gold: newLevel * 100,
            elixir: newLevel * 80,
            gem: Math.floor(newLevel / 5) + 1
        };

        // Add rewards to player resources
        if (window.resourceManager) {
            window.resourceManager.addResource('gold', rewards.gold);
            window.resourceManager.addResource('elixir', rewards.elixir);
            window.resourceManager.addResource('gem', rewards.gem);
        }

        // Show level up notification
        this.showLevelUpNotification(newLevel, rewards);

        // Check for level-based achievements
        this.checkAchievementProgress('player_level', newLevel);

        this.trackEvent('level_up', { 
            oldLevel: oldLevel, 
            newLevel: newLevel, 
            rewards: rewards 
        });
    }

    showLevelUpNotification(level, rewards) {
        const message = `🎉 تبریک! به سطح ${level} رسیدید!\n\n` +
                       `جوایز:\n` +
                       `💰 ${rewards.gold} طلا\n` +
                       `⚗️ ${rewards.elixir} اکسیر\n` +
                       `💎 ${rewards.gem} الماس`;

        if (window.uiManager) {
            window.uiManager.showNotification(message, 5000);
        }

        // Level up effects
        if (window.gameEngine) {
            window.gameEngine.createExplosion(new BABYLON.Vector3(0, 0, 0), 0.7);
            
            // Create multiple celebration particles
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const position = new BABYLON.Vector3(
                        (Math.random() - 0.5) * 20,
                        0,
                        (Math.random() - 0.5) * 20
                    );
                    window.gameEngine.createParticleSystem('magic', position);
                }, i * 200);
            }
        }
    }

    // Quest system
    updateQuestProgress(questType, amount = 1) {
        this.gameData.quests.forEach(quest => {
            if (quest.type === questType && !quest.completed) {
                quest.currentCount += amount;
                
                if (quest.currentCount >= quest.targetCount) {
                    this.completeQuest(quest.id);
                }
            }
        });
    }

    completeQuest(questId) {
        const quest = this.gameData.quests.get(questId);
        if (!quest || quest.completed) return;

        quest.completed = true;
        
        // Give quest rewards
        if (window.resourceManager) {
            window.resourceManager.addResource('gold', quest.reward.gold);
            window.resourceManager.addResource('elixir', quest.reward.elixir);
            window.resourceManager.addResource('gem', quest.reward.gem);
        }

        // Show quest completion notification
        this.showQuestCompleteNotification(quest);

        this.trackEvent('quest_completed', { 
            questId: questId, 
            rewards: quest.reward 
        });

        // Check for new quests
        this.unlockNewQuests(questId);
    }

    showQuestCompleteNotification(quest) {
        const message = `✅ ماموریت تکمیل شد: ${quest.title}\n\n` +
                       `جوایز:\n` +
                       `💰 ${quest.reward.gold} طلا\n` +
                       `⚗️ ${quest.reward.elixir} اکسیر\n` +
                       `💎 ${quest.reward.gem} الماس`;

        if (window.uiManager) {
            window.uiManager.showNotification(message, 5000);
        }
    }

    unlockNewQuests(completedQuestId) {
        // Logic to unlock new quests based on completed quests
        // This would typically be more complex with quest chains
        const nextQuests = {
            'first_building': 'upgrade_twice',
            'upgrade_twice': 'train_units',
            'train_units': 'win_battle'
        };

        const nextQuestId = nextQuests[completedQuestId];
        if (nextQuestId && !this.gameData.quests.has(nextQuestId)) {
            // Add new quest (in a real game, this would come from a quest database)
            console.log(`New quest available: ${nextQuestId}`);
        }
    }

    claimQuestReward(questId) {
        const quest = this.gameData.quests.get(questId);
        if (!quest || !quest.completed || quest.claimed) return;

        quest.claimed = true;
        
        // Additional logic for claiming rewards
        this.trackEvent('quest_reward_claimed', { questId: questId });
    }

    // Achievement system
    checkAchievementProgress(achievementType, currentValue) {
        this.achievementDefinitions.forEach(achievement => {
            if (achievement.type === achievementType && !achievement.unlocked) {
                if (currentValue >= achievement.target) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievementDefinitions.get(achievementId);
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        this.playerData.achievements.set(achievementId, {
            unlockedAt: new Date().toISOString(),
            progress: achievement.target
        });

        // Give achievement rewards
        if (window.resourceManager) {
            window.resourceManager.addResource('gold', achievement.reward.gold);
            window.resourceManager.addResource('gem', achievement.reward.gem);
        }

        // Show achievement notification
        this.showAchievementNotification(achievement);

        this.trackEvent('achievement_unlocked', { 
            achievementId: achievementId,
            achievement: achievement 
        });
    }

    showAchievementNotification(achievement) {
        const message = `🏆 دستاورد جدید!\n${achievement.title}\n\n` +
                       `${achievement.description}\n\n` +
                       `جوایز: ${achievement.reward.gold} طلا + ${achievement.reward.gem} الماس`;

        if (window.uiManager) {
            window.uiManager.showNotification(message, 5000);
        }

        // Achievement unlock effects
        if (window.gameEngine) {
            // Create special achievement particle effect
            const achievementParticles = new BABYLON.ParticleSystem("achievementParticles", 1000, this.scene);
            achievementParticles.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
            achievementParticles.emitter = new BABYLON.Vector3(0, 5, 0);
            achievementParticles.minSize = 0.1;
            achievementParticles.maxSize = 0.5;
            achievementParticles.minLifeTime = 1.0;
            achievementParticles.maxLifeTime = 2.0;
            achievementParticles.emitRate = 100;
            achievementParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
            achievementParticles.gravity = new BABYLON.Vector3(0, -2, 0);
            achievementParticles.direction1 = new BABYLON.Vector3(-2, 3, -2);
            achievementParticles.direction2 = new BABYLON.Vector3(2, 5, 2);
            achievementParticles.minEmitPower = 1;
            achievementParticles.maxEmitPower = 3;
            achievementParticles.updateSpeed = 0.01;
            achievementParticles.color1 = new BABYLON.Color4(1, 0.8, 0, 1.0);
            achievementParticles.color2 = new BABYLON.Color4(1, 1, 1, 1.0);
            achievementParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
            
            achievementParticles.start();
            setTimeout(() => achievementParticles.stop(), 3000);
        }
    }

    getAchievementProgress(achievementId) {
        const achievement = this.achievementDefinitions.get(achievementId);
        if (!achievement) return null;

        const currentValue = this.getCurrentAchievementValue(achievement.type);
        const progress = Math.min(currentValue / achievement.target, 1);
        
        return {
            achievement: achievement,
            currentValue: currentValue,
            targetValue: achievement.target,
            progress: progress,
            unlocked: achievement.unlocked
        };
    }

    getCurrentAchievementValue(achievementType) {
        switch(achievementType) {
            case 'buildings_constructed':
                return this.playerData.statistics.buildingsConstructed;
            case 'units_killed':
                return this.playerData.statistics.unitsKilled;
            case 'gold_collected':
                return this.playerData.statistics.goldCollected;
            case 'defenses_won':
                return this.playerData.statistics.defensesWon;
            case 'player_level':
                return this.playerData.level;
            default:
                return 0;
        }
    }

    // Daily rewards system
    checkDailyRewards() {
        const now = new Date();
        const lastClaimed = this.gameData.events.dailyRewards.lastClaimed ? 
            new Date(this.gameData.events.dailyRewards.lastClaimed) : null;

        // Check if player can claim daily reward
        if (!lastClaimed || this.isNewDay(lastClaimed, now)) {
            this.showDailyRewardAvailable();
        }
    }

    isNewDay(lastDate, currentDate) {
        return lastDate.getDate() !== currentDate.getDate() ||
               lastDate.getMonth() !== currentDate.getMonth() ||
               lastDate.getFullYear() !== currentDate.getFullYear();
    }

    showDailyRewardAvailable() {
        const message = "🎁 جایزه روزانه آماده دریافت است!";
        if (window.uiManager) {
            window.uiManager.showNotification(message, 5000);
        }
    }

    claimDailyReward() {
        const streak = this.gameData.events.dailyRewards.streak;
        const reward = this.calculateDailyReward(streak + 1);

        // Update streak
        this.gameData.events.dailyRewards.streak++;
        this.gameData.events.dailyRewards.lastClaimed = new Date().toISOString();
        this.gameData.events.dailyRewards.nextAvailable = this.getNextDailyReset();

        // Give rewards
        if (window.resourceManager) {
            window.resourceManager.addResource('gold', reward.gold);
            window.resourceManager.addResource('elixir', reward.elixir);
            window.resourceManager.addResource('gem', reward.gem);
        }

        // Show reward notification
        this.showDailyRewardNotification(streak + 1, reward);

        this.trackEvent('daily_reward_claimed', { 
            streak: streak + 1, 
            reward: reward 
        });
    }

    calculateDailyReward(streak) {
        // Increasing rewards based on streak
        const baseGold = 100;
        const baseElixir = 80;
        const baseGem = 1;

        return {
            gold: baseGold * streak,
            elixir: baseElixir * streak,
            gem: baseGem * Math.max(1, Math.floor(streak / 7)) // Extra gem every 7 days
        };
    }

    showDailyRewardNotification(streak, reward) {
        const message = `🎁 جایزه روزانه دریافت شد!\n\n` +
                       `روند: روز ${streak}\n\n` +
                       `جوایز:\n` +
                       `💰 ${reward.gold} طلا\n` +
                       `⚗️ ${reward.elixir} اکسیر\n` +
                       `💎 ${reward.gem} الماس`;

        if (window.uiManager) {
            window.uiManager.showNotification(message, 5000);
        }
    }

    getNextDailyReset() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toISOString();
    }

    // Statistics tracking
    updateStatistic(statName, amount = 1) {
        if (this.playerData.statistics.hasOwnProperty(statName)) {
            this.playerData.statistics[statName] += amount;
            
            // Check for achievement progress
            this.checkStatisticBasedAchievements(statName);
        }
    }

    checkStatisticBasedAchievements(statName) {
        // Map statistic names to achievement types
        const statToAchievement = {
            'buildingsConstructed': 'buildings_constructed',
            'unitsKilled': 'units_killed',
            'goldCollected': 'gold_collected',
            'defensesWon': 'defenses_won'
        };

        const achievementType = statToAchievement[statName];
        if (achievementType) {
            const currentValue = this.playerData.statistics[statName];
            this.checkAchievementProgress(achievementType, currentValue);
        }
    }

    // Game session management
    setupSessionTracking() {
        this.sessionData.startTime = Date.now();
        this.sessionData.currentTime = Date.now();
        
        // Update session time every minute
        setInterval(() => {
            this.updateSessionTime();
        }, 60000);
    }

    updateSessionTime() {
        const now = Date.now();
        const sessionDuration = now - this.sessionData.startTime;
        
        this.sessionData.currentTime = now;
        this.playerData.playTime += sessionDuration / 1000; // Convert to seconds
        this.playerData.statistics.totalPlayTime = this.playerData.playTime;
        
        // Reset session start time for next interval
        this.sessionData.startTime = now;
    }

    setupGameTickers() {
        // Update game time every second
        setInterval(() => {
            this.updateGameTime();
        }, 1000);

        // Check for daily rewards every minute
        setInterval(() => {
            this.checkDailyRewards();
        }, 60000);

        // Auto-save every 5 minutes
        setInterval(() => {
            if (this.gameData.settings.game.autoSave) {
                this.saveGameData();
            }
        }, 300000);
    }

    updateGameTime() {
        this.playerData.lastLogin = new Date().toISOString();
        
        // Check for new day
        const now = new Date();
        const lastLogin = new Date(this.playerData.lastLogin);
        
        if (this.isNewDay(lastLogin, now)) {
            this.playerData.statistics.daysPlayed++;
            this.onNewDay();
        }
    }

    onNewDay() {
        // Reset daily limits, check for streaks, etc.
        this.checkDailyRewards();
        
        this.trackEvent('new_day', { 
            daysPlayed: this.playerData.statistics.daysPlayed 
        });
    }

    // Save/load system
    setupAutoSave() {
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveGameData();
        });

        // Save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveGameData();
            }
        });
    }

    saveGameData() {
        try {
            const saveData = this.prepareSaveData();
            
            // Save to localStorage
            localStorage.setItem('gameState', JSON.stringify(saveData));
            
            // Create backup
            localStorage.setItem('gameState_backup', JSON.stringify(saveData));
            
            // Update player data
            this.playerData.lastLogin = new Date().toISOString();
            
            this.trackEvent('game_saved', { 
                timestamp: new Date().toISOString(),
                playerLevel: this.playerData.level
            });
            
            console.log('Game saved successfully');
            return true;
            
        } catch (error) {
            console.error('Error saving game:', error);
            this.trackError('save_game', error);
            return false;
        }
    }

    prepareSaveData() {
        return {
            // Metadata
            version: this.gameVersion,
            saveVersion: this.saveVersion,
            timestamp: new Date().toISOString(),
            
            // Player data
            playerData: this.playerData,
            
            // Game systems data
            gameData: {
                resources: window.resourceManager ? window.resourceManager.save() : null,
                buildings: window.buildingSystem ? window.buildingSystem.save() : null,
                units: window.unitSystem ? window.unitSystem.save() : null,
                combat: window.combatSystem ? window.combatSystem.save() : null,
                research: Array.from(this.gameData.research.entries()),
                quests: Array.from(this.gameData.quests.entries()),
                events: this.gameData.events,
                settings: this.gameData.settings
            },
            
            // Session data
            sessionData: this.sessionData
        };
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem('gameState');
            if (!savedData) {
                console.log('No saved game found, starting new game');
                this.initializeNewGame();
                return true;
            }

            const parsedData = JSON.parse(savedData);
            
            // Check save version compatibility
            if (!this.isSaveCompatible(parsedData.saveVersion)) {
                console.warn('Save version mismatch, attempting migration');
                return this.migrateSaveData(parsedData);
            }

            // Load player data
            this.playerData = { ...this.playerData, ...parsedData.playerData };
            
            // Load game systems data
            if (parsedData.gameData) {
                this.gameData.research = new Map(parsedData.gameData.research || []);
                this.gameData.quests = new Map(parsedData.gameData.quests || []);
                this.gameData.events = parsedData.gameData.events || this.gameData.events;
                this.gameData.settings = parsedData.gameData.settings || this.gameData.settings;
            }

            // Calculate offline progress
            this.calculateOfflineProgress(parsedData.timestamp);

            console.log('Game loaded successfully');
            this.trackEvent('game_loaded', { 
                playerLevel: this.playerData.level,
                offlineTime: this.getOfflineDuration(parsedData.timestamp)
            });
            
            return true;
            
        } catch (error) {
            console.error('Error loading game:', error);
            this.trackError('load_game', error);
            
            // Try to load from backup
            return this.loadBackup();
        }
    }

    loadBackup() {
        try {
            const backupData = localStorage.getItem('gameState_backup');
            if (backupData) {
                console.log('Loading from backup save');
                const parsedData = JSON.parse(backupData);
                // Similar loading logic as above
                return true;
            }
        } catch (error) {
            console.error('Error loading backup:', error);
        }
        
        // If all else fails, start new game
        console.log('Starting new game after load failure');
        this.initializeNewGame();
        return false;
    }

    isSaveCompatible(saveVersion) {
        // Basic version compatibility check
        const currentMajor = parseInt(this.saveVersion.split('.')[0]);
        const saveMajor = parseInt(saveVersion.split('.')[0]);
        return currentMajor === saveMajor;
    }

    migrateSaveData(oldData) {
        // Simple migration logic - in a real game this would be more complex
        try {
            console.log('Migrating save data from version', oldData.saveVersion);
            
            // Preserve essential data
            this.playerData.level = oldData.playerData.level || 1;
            this.playerData.experience = oldData.playerData.experience || 0;
            
            // Initialize new systems with default values
            this.initializeNewGame();
            
            // Save migrated data
            this.saveGameData();
            
            return true;
        } catch (error) {
            console.error('Migration failed:', error);
            return false;
        }
    }

    calculateOfflineProgress(lastSaveTime) {
        if (!lastSaveTime) return;

        const offlineDuration = this.getOfflineDuration(lastSaveTime);
        if (offlineDuration <= 0) return;

        // Calculate resource production during offline time
        if (window.resourceManager) {
            const minutesOffline = offlineDuration / (1000 * 60);
            
            // Simple offline production calculation
            const goldProduction = minutesOffline * 10; // 10 gold per minute
            const elixirProduction = minutesOffline * 8; // 8 elixir per minute
            
            window.resourceManager.addResource('gold', goldProduction);
            window.resourceManager.addResource('elixir', elixirProduction);
        }

        // Show offline progress notification
        this.showOfflineProgressNotification(offlineDuration);
    }

    getOfflineDuration(lastSaveTime) {
        const lastSave = new Date(lastSaveTime);
        const now = new Date();
        return now - lastSave;
    }

    showOfflineProgressNotification(offlineDuration) {
        const hours = Math.floor(offlineDuration / (1000 * 60 * 60));
        const minutes = Math.floor((offlineDuration % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0 || minutes > 10) { // Only show if significant time passed
            const message = `⏰ شما ${hours} ساعت و ${minutes} دقیقه آفلاین بودید.\n` +
                           `منابع در غیاب شما تولید شدند!`;
            
            if (window.uiManager) {
                window.uiManager.showNotification(message, 5000);
            }
        }
    }

    initializeNewGame() {
        // Set up initial game state for new players
        this.playerData = {
            ...this.playerData,
            level: 1,
            experience: 0,
            joinDate: new Date().toISOString()
        };

        // Initialize all game systems
        this.initializeQuests();
        this.initializeAchievements();
        
        // Show welcome message
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        const message = "🎮 به بازی استراتژی سینمایی خوش آمدید!\n\n" +
                       "پایگاه خود را بسازید، نیرو آموزش دهید و به دشمنان حمله کنید!";
        
        if (window.uiManager) {
            window.uiManager.showNotification(message, 6000);
        }
    }

    // Analytics and tracking
    trackEvent(eventName, properties = {}) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            playerId: this.playerData.playerId,
            sessionId: this.sessionData.startTime,
            properties: properties
        };

        this.analytics.events.push(event);
        
        // Keep only last 1000 events
        if (this.analytics.events.length > 1000) {
            this.analytics.events.shift();
        }

        // In a real game, you might send this to an analytics service
        console.log(`[Analytics] ${eventName}`, properties);
    }

    trackError(errorType, error, context = {}) {
        const errorEvent = {
            type: errorType,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            context: context
        };

        this.analytics.errors.push(errorEvent);
        
        // Keep only last 100 errors
        if (this.analytics.errors.length > 100) {
            this.analytics.errors.shift();
        }
    }

    trackPerformance(metricName, value, context = {}) {
        const performanceEvent = {
            metric: metricName,
            value: value,
            timestamp: new Date().toISOString(),
            context: context
        };

        this.analytics.performance.push(performanceEvent);
    }

    // Utility methods
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getGameSummary() {
        return {
            player: {
                name: this.playerData.playerName,
                level: this.playerData.level,
                experience: this.playerData.experience,
                playTime: this.formatPlayTime(this.playerData.playTime)
            },
            statistics: this.playerData.statistics,
            achievements: {
                total: this.achievementDefinitions.size,
                unlocked: Array.from(this.achievementDefinitions.values())
                    .filter(a => a.unlocked).length
            },
            quests: {
                total: this.gameData.quests.size,
                completed: Array.from(this.gameData.quests.values())
                    .filter(q => q.completed).length
            }
        };
    }

    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} ساعت و ${minutes} دقیقه`;
    }

    // Settings management
    updateSetting(category, key, value) {
        if (this.gameData.settings[category] && 
            this.gameData.settings[category].hasOwnProperty(key)) {
            this.gameData.settings[category][key] = value;
            
            // Apply setting changes immediately
            this.applySettingChange(category, key, value);
            
            this.trackEvent('setting_changed', { 
                category: category, 
                key: key, 
                value: value 
            });
        }
    }

    applySettingChange(category, key, value) {
        switch(category) {
            case 'graphics':
                this.applyGraphicsSettings(key, value);
                break;
            case 'audio':
                this.applyAudioSettings(key, value);
                break;
            case 'controls':
                this.applyControlSettings(key, value);
                break;
        }
    }

    applyGraphicsSettings(key, value) {
        if (!window.gameEngine) return;

        switch(key) {
            case 'quality':
                // Adjust graphics quality presets
                this.applyGraphicsQualityPreset(value);
                break;
            case 'shadows':
                // Toggle shadows
                if (window.gameEngine.shadowGenerator) {
                    window.gameEngine.shadowGenerator.enabled = value;
                }
                break;
            case 'bloom':
                // Toggle bloom effect
                if (window.gameEngine.postProcesses.bloom) {
                    window.gameEngine.postProcesses.bloom.enabled = value;
                }
                break;
        }
    }

    applyGraphicsQualityPreset(preset) {
        if (!window.gameEngine) return;

        const presets = {
            'low': {
                shadows: false,
                bloom: false,
                antiAliasing: false,
                postProcessing: false,
                textureQuality: 'low'
            },
            'medium': {
                shadows: true,
                bloom: true,
                antiAliasing: false,
                postProcessing: true,
                textureQuality: 'medium'
            },
            'high': {
                shadows: true,
                bloom: true,
                antiAliasing: true,
                postProcessing: true,
                textureQuality: 'high'
            }
        };

        const settings = presets[preset];
        if (settings) {
            Object.keys(settings).forEach(key => {
                this.updateSetting('graphics', key, settings[key]);
            });
        }
    }

    applyAudioSettings(key, value) {
        // Audio settings would be applied to Howler.js or similar
        console.log(`Audio setting changed: ${key} = ${value}`);
    }

    applyControlSettings(key, value) {
        // Control settings would be applied to input manager
        if (window.inputManager && window.inputManager.cameraControls) {
            switch(key) {
                case 'cameraSensitivity':
                    window.inputManager.cameraControls.rotationSpeed = value * 0.002;
                    break;
                case 'scrollSensitivity':
                    window.inputManager.cameraControls.zoomSpeed = value * 0.1;
                    break;
            }
        }
    }

    // Game state validation and repair
    validateGameState() {
        const errors = [];

        // Validate player data
        if (!this.playerData.playerId) {
            errors.push('Missing player ID');
        }

        if (this.playerData.level < 1) {
            errors.push('Invalid player level');
        }

        // Validate resources
        if (window.resourceManager) {
            const resources = window.resourceManager.resources;
            for (const [resource, amount] of Object.entries(resources)) {
                if (amount < 0) {
                    errors.push(`Negative resource amount: ${resource}`);
                }
            }
        }

        // Log validation results
        if (errors.length > 0) {
            console.warn('Game state validation errors:', errors);
            this.repairGameState(errors);
        }

        return errors.length === 0;
    }

    repairGameState(errors) {
        console.log('Attempting to repair game state...');

        // Basic repairs for common issues
        errors.forEach(error => {
            if (error.includes('Negative resource amount')) {
                this.repairNegativeResources();
            } else if (error.includes('Invalid player level')) {
                this.playerData.level = Math.max(1, this.playerData.level);
            }
        });

        // Save repaired state
        this.saveGameData();
    }

    repairNegativeResources() {
        if (window.resourceManager) {
            const resources = window.resourceManager.resources;
            for (const resource in resources) {
                if (resources[resource] < 0) {
                    resources[resource] = 0;
                }
            }
        }
    }

    // Debug and development tools
    enableDebugMode() {
        this.debug = {
            enabled: true,
            godMode: false,
            unlimitedResources: false,
            instantBuild: false,
            showDebugInfo: true
        };

        console.log('Debug mode enabled');
    }

    disableDebugMode() {
        this.debug = {
            enabled: false,
            godMode: false,
            unlimitedResources: false,
            instantBuild: false,
            showDebugInfo: false
        };

        console.log('Debug mode disabled');
    }

    toggleDebugOption(option) {
        if (this.debug && this.debug.enabled) {
            this.debug[option] = !this.debug[option];
            console.log(`Debug option '${option}' set to:`, this.debug[option]);
        }
    }

    exportGameData() {
        const saveData = this.prepareSaveData();
        const dataStr = JSON.stringify(saveData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `game_save_${this.playerData.playerId}_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importGameData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                this.loadImportedData(importedData);
            } catch (error) {
                console.error('Error importing game data:', error);
                alert('خطا در بارگذاری فایل ذخیره بازی');
            }
        };
        reader.readAsText(file);
    }

    loadImportedData(importedData) {
        if (confirm('آیا مطمئنید می‌خواهید داده‌های فعلی بازی با فایل وارد شده جایگزین شود؟')) {
            localStorage.setItem('gameState', JSON.stringify(importedData));
            location.reload(); // Reload to apply new data
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
          }
