class MissionSystem {
    constructor() {
        this.currentMission = null;
        this.missions = new Map();
        this.objectives = new Map();
        this.storyProgress = 0;
        this.cutscenes = new Map();
        this.dialogs = new Map();
        this.players = new Map();
        
        this.init();
    }

    init() {
        this.createMissions();
        this.createStoryline();
        this.setupEventListeners();
        console.log('📖 سیستم ماموریت و داستان راه‌اندازی شد');
    }

    createMissions() {
        // ماموریت اصلی - نجات کهکشان
        this.missions.set('tutorial', {
            id: 'tutorial',
            title: 'آموزش پرواز',
            description: 'با کنترل‌های سفینه آشنا شوید',
            objectives: ['move_around', 'collect_coins', 'avoid_asteroids'],
            reward: { coins: 100, fuel: 50, unlock: 'basic_weapons' },
            nextMission: 'rescue_scientists',
            cutscene: 'tutorial_intro'
        });

        this.missions.set('rescue_scientists', {
            id: 'rescue_scientists',
            title: 'نجات دانشمندان',
            description: 'گروه دانشمندان در سیاره زحل گیر افتاده‌اند',
            objectives: ['find_scientists', 'defend_against_pirates', 'escape_planet'],
            reward: { coins: 500, fuel: 100, unlock: 'shield_generator' },
            nextMission: 'alien_artifact',
            cutscene: 'scientists_rescue'
        });

        this.missions.set('alien_artifact', {
            id: 'alien_artifact',
            title: 'دستگاه بیگانه',
            description: 'یک تکنولوژی مرموز در کمربند سیارک‌ها کشف شده',
            objectives: ['locate_artifact', 'decrypt_signals', 'defend_artifact'],
            reward: { coins: 1000, fuel: 200, unlock: 'warp_drive' },
            nextMission: 'final_battle',
            cutscene: 'artifact_discovery'
        });

        this.missions.set('final_battle', {
            id: 'final_battle',
            title: 'نبرد نهایی',
            description: 'با فرمانده دشمن در قلب کهکشان روبرو شوید',
            objectives: ['infiltrate_base', 'destroy_shields', 'defeat_boss'],
            reward: { coins: 5000, fuel: 500, unlock: 'galaxy_hero' },
            nextMission: null,
            cutscene: 'final_showdown'
        });
    }

    createStoryline() {
        // داستان اصلی بازی
        this.storyline = {
            chapters: [
                {
                    id: 'chapter1',
                    title: 'شروع سفر',
                    description: 'شما به عنوان یک کاوشگر فضایی انتخاب شده‌اید',
                    missions: ['tutorial'],
                    cutscene: 'chapter1_intro'
                },
                {
                    id: 'chapter2', 
                    title: 'تهدید جدید',
                    description: 'یک نیروی شرور کهکشان را تهدید می‌کند',
                    missions: ['rescue_scientists', 'alien_artifact'],
                    cutscene: 'chapter2_intro'
                },
                {
                    id: 'chapter3',
                    title: 'نبرد برای صلح',
                    description: 'سرنوشت کهکشان در دستان شماست',
                    missions: ['final_battle'],
                    cutscene: 'chapter3_intro'
                }
            ],
            currentChapter: 0,
            completed: false
        };

        // دیالوگ‌های شخصیت‌ها
        this.dialogs.set('captain_intro', [
            {
                character: 'کاپیتان',
                text: 'خوش آمدید کاوشگر! کهکشان به کمک شما نیاز دارد.',
                emotion: 'friendly',
                duration: 4000
            },
            {
                character: 'کاپیتان',
                text: 'گروهی از دانشمندان در سیاره زحل گیر افتاده‌اند.',
                emotion: 'serious', 
                duration: 3500
            },
            {
                character: 'کاپیتان',
                text: 'ماموریت شما نجات آن‌ها و کشف راز این حمله است.',
                emotion: 'determined',
                duration: 4000
            }
        ]);

        this.dialogs.set('scientist_rescue', [
            {
                character: 'دانشمند',
                text: 'بالاخره رسیدی! ما فکر کردیم هیچکس نمی‌آید.',
                emotion: 'relieved',
                duration: 3500
            },
            {
                character: 'دانشمند',
                text: 'آنها یک تکنولوژی عجیب در کمربند سیارک‌ها پیدا کرده‌اند.',
                emotion: 'excited',
                duration: 4000
            },
            {
                character: 'دانشمند', 
                text: 'اگر به دست دشمن بیفتد، کل کهکشان در خطر خواهد بود!',
                emotion: 'worried',
                duration: 4000
            }
        ]);
    }

    startMission(missionId) {
        const mission = this.missions.get(missionId);
        if (!mission) return;

        this.currentMission = mission;
        this.createObjectives(mission.objectives);
        
        // نمایش کات‌سین شروع ماموریت
        this.playCutscene(mission.cutscene);
        
        // نمایش دیالوگ شروع
        this.showMissionDialog(mission);
        
        console.log(`🚀 ماموریت شروع شد: ${mission.title}`);
    }

    createObjectives(objectiveIds) {
        this.objectives.clear();
        
        objectiveIds.forEach((objectiveId, index) => {
            this.objectives.set(objectiveId, {
                id: objectiveId,
                description: this.getObjectiveDescription(objectiveId),
                completed: false,
                order: index
            });
        });
    }

    getObjectiveDescription(objectiveId) {
        const descriptions = {
            'move_around': 'با سفینه در فضا حرکت کنید',
            'collect_coins': '۱۰ سکه جمع‌آوری کنید',
            'avoid_asteroids': 'از برخورد با سیارک‌ها اجتناب کنید',
            'find_scientists': 'دانشمندان گمشده را پیدا کنید',
            'defend_against_pirates': 'با دزدان دریایی فضایی مبارزه کنید',
            'escape_planet': 'از سیاره فرار کنید',
            'locate_artifact': 'دستگاه بیگانه را پیدا کنید',
            'decrypt_signals': 'سیگنال‌های مرموز را رمزگشایی کنید',
            'defend_artifact': 'از دستگاه در برابر حمله دفاع کنید',
            'infiltrate_base': 'به پایگاه دشمن نفوذ کنید',
            'destroy_shields': 'میدان‌های محافظتی را نابود کنید',
            'defeat_boss': 'فرمانده دشمن را شکست دهید'
        };
        
        return descriptions[objectiveId] || 'هدف ناشناخته';
    }

    completeObjective(objectiveId) {
        const objective = this.objectives.get(objectiveId);
        if (objective && !objective.completed) {
            objective.completed = true;
            
            // پخش صدا
            Audio.play('objective_complete');
            
            // نمایش نوتیفیکیشن
            UI.showNotification(`✅ هدف تکمیل شد: ${objective.description}`);
            
            // بررسی اتمام ماموریت
            this.checkMissionCompletion();
            
            return true;
        }
        return false;
    }

    checkMissionCompletion() {
        if (!this.currentMission) return;
        
        const allCompleted = Array.from(this.objectives.values())
            .every(obj => obj.completed);
            
        if (allCompleted) {
            this.completeMission();
        }
    }

    completeMission() {
        if (!this.currentMission) return;
        
        const reward = this.currentMission.reward;
        
        // اعمال پاداش
        Game.player.coins += reward.coins;
        Game.player.fuel = Math.min(Game.player.maxFuel, Game.player.fuel + reward.fuel);
        
        // آنلاک آیتم جدید
        this.unlockItem(reward.unlock);
        
        // نمایش صفحه تکمیل ماموریت
        UI.showMissionComplete(this.currentMission, reward);
        
        // پخش کات‌سین
        this.playCutscene(this.currentMission.cutscene + '_complete');
        
        // رفتن به ماموریت بعدی
        if (this.currentMission.nextMission) {
            setTimeout(() => {
                this.startMission(this.currentMission.nextMission);
            }, 5000);
        } else {
            // اتمام بازی
            this.completeGame();
        }
        
        console.log(`🎉 ماموریت تکمیل شد: ${this.currentMission.title}`);
        this.currentMission = null;
    }

    unlockItem(itemId) {
        const unlocks = {
            'basic_weapons': 'سلاح پایه فعال شد',
            'shield_generator': 'ژنراتور محافظ فعال شد', 
            'warp_drive': 'درایو وارپ فعال شد',
            'galaxy_hero': 'مدال قهرمان کهکشان دریافت شد'
        };
        
        if (unlocks[itemId]) {
            Storage.unlockAchievement(itemId, unlocks[itemId]);
            UI.showNotification(`🔓 ${unlocks[itemId]}`);
        }
    }

    playCutscene(cutsceneId) {
        const cutscene = this.cutscenes.get(cutsceneId);
        if (cutscene) {
            UI.showCutscene(cutscene);
        }
    }

    showMissionDialog(mission) {
        const dialogKey = mission.id + '_start';
        const dialog = this.dialogs.get(dialogKey);
        
        if (dialog) {
            UI.showDialog(dialog, () => {
                // پس از اتمام دیالوگ
                UI.showNotification(`🎯 ماموریت: ${mission.title}`);
            });
        }
    }

    completeGame() {
        this.storyline.completed = true;
        
        // نمایش پایان بازی
        UI.showGameComplete();
        
        // پخش موسیقی پایانی
        Audio.playMusic('ending_theme');
        
        // آنلاک مدال نهایی
        Storage.unlockAchievement('game_complete', 'تکمیل کهکشان بی‌نهایت');
        
        console.log('🏆 بازی به پایان رسید!');
    }

    // رویدادهای بازی
    setupEventListeners() {
        // ردیابی پیشرفت بازیکن
        Game.events.on('coin_collected', (count) => {
            if (this.currentMission && this.objectives.has('collect_coins')) {
                if (count >= 10) {
                    this.completeObjective('collect_coins');
                }
            }
        });

        Game.events.on('enemy_defeated', (enemyType) => {
            if (this.currentMission) {
                if (enemyType === 'pirate' && this.objectives.has('defend_against_pirates')) {
                    this.completeObjective('defend_against_pirates');
                } else if (enemyType === 'boss' && this.objectives.has('defeat_boss')) {
                    this.completeObjective('defeat_boss');
                }
            }
        });

        Game.events.on('distance_traveled', (distance) => {
            if (this.currentMission && this.objectives.has('move_around')) {
                if (distance > 100) {
                    this.completeObjective('move_around');
                }
            }
        });
    }

    getCurrentObjectives() {
        return Array.from(this.objectives.values())
            .sort((a, b) => a.order - b.order);
    }

    getMissionProgress() {
        if (!this.currentMission) return 0;
        
        const objectives = Array.from(this.objectives.values());
        const completed = objectives.filter(obj => obj.completed).length;
        
        return (completed / objectives.length) * 100;
    }

    // ذخیره و بارگذاری پیشرفت
    saveProgress() {
        const progress = {
            currentMission: this.currentMission ? this.currentMission.id : null,
            completedMissions: Array.from(this.missions.values())
                .filter(mission => this.isMissionCompleted(mission.id))
                .map(mission => mission.id),
            storyProgress: this.storyProgress,
            objectives: Array.from(this.objectives.entries())
        };
        
        Storage.saveMissionProgress(progress);
    }

    loadProgress() {
        const progress = Storage.loadMissionProgress();
        if (progress) {
            this.storyProgress = progress.storyProgress;
            
            if (progress.currentMission) {
                this.startMission(progress.currentMission);
                
                // بارگذاری اهداف
                progress.objectives.forEach(([id, objective]) => {
                    if (this.objectives.has(id)) {
                        this.objectives.get(id).completed = objective.completed;
                    }
                });
            }
        }
    }

    isMissionCompleted(missionId) {
        // منطق بررسی اتمام ماموریت
        return Storage.getCompletedMissions().includes(missionId);
    }

    // سیستم کوئست‌های جانبی
    createSideQuest(type, target, reward) {
        const quest = {
            id: 'side_quest_' + Date.now(),
            type: type,
            target: target,
            reward: reward,
            completed: false,
            timeLimit: type === 'timed' ? 300 : null // 5 دقیقه برای کوئست‌های زمانی
        };
        
        this.sideQuests.set(quest.id, quest);
        return quest;
    }

    updateSideQuests(deltaTime) {
        for (const [id, quest] of this.sideQuests) {
            if (quest.timeLimit) {
                quest.timeLimit -= deltaTime;
                if (quest.timeLimit <= 0) {
                    this.failSideQuest(id);
                }
            }
        }
    }
}

const MissionSystem = new MissionSystem();
