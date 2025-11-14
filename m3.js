// m3.js - سیستم‌های حرفه‌ای و مدیریت پیشرفته
// =============================================

class ProfessionalGameSystems {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.battleSystem = new AdvancedBattleSystem(gameEngine);
        this.diplomacySystem = new DiplomacySystem(gameEngine);
        this.eventSystem = new DynamicEventSystem(gameEngine);
        this.achievementSystem = new AdvancedAchievementSystem(gameEngine);
        this.statisticsSystem = new StatisticsSystem(gameEngine);
        this.tutorialSystem = new TutorialSystem(gameEngine);
        this.automationSystem = new AutomationSystem(gameEngine);
        this.cinematicSystem = new CinematicSystem(gameEngine);
        
        this.init();
    }

    async init() {
        console.log("🎯 راه‌اندازی سیستم‌های حرفه‌ای...");
        
        await this.battleSystem.init();
        await this.diplomacySystem.init();
        await this.eventSystem.init();
        await this.achievementSystem.init();
        await this.statisticsSystem.init();
        await this.tutorialSystem.init();
        await this.automationSystem.init();
        await this.cinematicSystem.init();

        console.log("✅ سیستم‌های حرفه‌ای راه‌اندازی شدند");
    }
}

// سیستم نبرد پیشرفته
class AdvancedBattleSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.battleHistory = [];
        this.formationTypes = {};
        this.specialAbilities = {};
        this.battleStrategies = {};
    }

    async init() {
        console.log("⚔️ راه‌اندازی سیستم نبرد پیشرفته...");
        
        this.setupFormations();
        this.setupSpecialAbilities();
        this.setupBattleStrategies();
        
        return this;
    }

    setupFormations() {
        this.formationTypes = {
            'line': {
                name: 'خطی',
                description: 'حمله مستقیم و قدرتمند',
                attackBonus: 1.2,
                defenseBonus: 0.8,
                speedBonus: 1.0
            },
            'phalanx': {
                name: 'فالانژ', 
                description: 'دفاع قوی اما حرکت کند',
                attackBonus: 0.9,
                defenseBonus: 1.5,
                speedBonus: 0.7
            },
            'flanking': {
                name: 'محاصره',
                description: 'حمله از جناحین',
                attackBonus: 1.3,
                defenseBonus: 0.9,
                speedBonus: 1.1
            },
            'skirmish': {
                name: 'درگیری',
                description: 'حمله سریع و عقب‌نشینی',
                attackBonus: 1.1,
                defenseBonus: 0.8,
                speedBonus: 1.4
            }
        };
    }

    setupSpecialAbilities() {
        this.specialAbilities = {
            'charge': {
                name: 'شارژ',
                description: 'حمله سریع به دشمن',
                cost: 20,
                cooldown: 30,
                effect: (units, target) => this.executeCharge(units, target)
            },
            'shield_wall': {
                name: 'دیوار سپر',
                description: 'دفاع قوی برای مدت محدود',
                cost: 15,
                cooldown: 45,
                effect: (units) => this.executeShieldWall(units)
            },
            'arrow_volley': {
                name: 'تیرباران',
                description: 'شلیک دسته‌جمعی تیر',
                cost: 25,
                cooldown: 40,
                effect: (units, target) => this.executeArrowVolley(units, target)
            },
            'heal': {
                name: 'درمان',
                description: 'بازیابی سلامت واحدها',
                cost: 30,
                cooldown: 60,
                effect: (units) => this.executeHeal(units)
            }
        };
    }

    setupBattleStrategies() {
        this.battleStrategies = {
            'aggressive': {
                name: 'تهاجمی',
                focus: 'attack',
                behavior: 'always_advance',
                targetPriority: 'nearest'
            },
            'defensive': {
                name: 'دفاعی',
                focus: 'defense', 
                behavior: 'hold_position',
                targetPriority: 'strongest'
            },
            'balanced': {
                name: 'متوازن',
                focus: 'balanced',
                behavior: 'adaptive',
                targetPriority: 'weakest'
            },
            'guerrilla': {
                name: 'چریکی',
                focus: 'mobility',
                behavior: 'hit_and_run',
                targetPriority: 'ranged'
            }
        };
    }

    executeFormation(units, formationType) {
        const formation = this.formationTypes[formationType];
        if (!formation) return;

        units.forEach(unit => {
            unit.attackBonus = formation.attackBonus;
            unit.defenseBonus = formation.defenseBonus;
            unit.speedBonus = formation.speedBonus;
        });

        this.gameEngine.showNotification(`⚔️ تشکیل ${formation.name} برای ${units.length} واحد`);
    }

    executeCharge(units, target) {
        units.forEach(unit => {
            unit.speedBonus *= 1.5;
            unit.attackBonus *= 1.3;
            unit.state = 'charging';
            unit.target = target;
        });

        // افکت بصری شارژ
        if (this.gameEngine.advancedSystems) {
            units.forEach(unit => {
                this.gameEngine.advancedSystems.particleSystem.createMagicEffect(
                    unit.mesh.position, 'yellow'
                );
            });
        }

        this.gameEngine.showNotification(`⚡ شارژ ${units.length} واحد به سمت دشمن!`);
    }

    executeShieldWall(units) {
        units.forEach(unit => {
            unit.defenseBonus *= 2.0;
            unit.speedBonus *= 0.5;
        });

        // تایمر برای پایان اثر
        setTimeout(() => {
            units.forEach(unit => {
                unit.defenseBonus /= 2.0;
                unit.speedBonus /= 0.5;
            });
        }, 10000);

        this.gameEngine.showNotification(`🛡️ دیوار سپر برای ${units.length} واحد فعال شد`);
    }

    executeArrowVolley(units, target) {
        const archers = units.filter(unit => unit.type === 'archer');
        
        archers.forEach(archer => {
            // شلیک چندین تیر
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.createProjectile(archer, target);
                }, i * 200);
            }
        });

        this.gameEngine.showNotification(`🏹 تیرباران ${archers.length} کماندار!`);
    }

    executeHeal(units) {
        units.forEach(unit => {
            const healAmount = unit.maxHealth * 0.3;
            unit.health = Math.min(unit.maxHealth, unit.health + healAmount);
            
            // افکت درمان
            if (this.gameEngine.advancedSystems) {
                this.gameEngine.advancedSystems.particleSystem.createMagicEffect(
                    unit.mesh.position, 'green'
                );
            }
        });

        this.gameEngine.showNotification(`💚 درمان ${units.length} واحد`);
    }

    createProjectile(shooter, target) {
        if (!shooter.mesh || !target.mesh) return;

        const projectile = BABYLON.MeshBuilder.CreateSphere("arrow", {
            diameter: 0.1
        }, this.gameEngine.scene);

        projectile.position.copyFrom(shooter.mesh.position);
        projectile.position.y += 1;

        const material = new BABYLON.StandardMaterial("arrowMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
        projectile.material = material;

        const projectileData = {
            mesh: projectile,
            startPosition: projectile.position.clone(),
            targetPosition: target.mesh.position.clone(),
            damage: shooter.damage * 0.8,
            progress: 0,
            shooter: shooter
        };

        this.gameEngine.projectiles.push(projectileData);
    }

    recordBattle(battleData) {
        this.battleHistory.push({
            ...battleData,
            timestamp: Date.now(),
            id: this.battleHistory.length + 1
        });

        // نگه داشتن فقط 50 نبرد آخر
        if (this.battleHistory.length > 50) {
            this.battleHistory.shift();
        }
    }

    getBattleStatistics() {
        const totalBattles = this.battleHistory.length;
        const victories = this.battleHistory.filter(battle => battle.victory).length;
        const winRate = totalBattles > 0 ? (victories / totalBattles * 100).toFixed(1) : 0;

        return {
            totalBattles,
            victories,
            defeats: totalBattles - victories,
            winRate: winRate + '%',
            favoriteFormation: this.getFavoriteFormation(),
            mostUsedAbility: this.getMostUsedAbility()
        };
    }

    getFavoriteFormation() {
        // تحلیل فرمیشن‌های استفاده شده
        const formationCount = {};
        this.battleHistory.forEach(battle => {
            if (battle.formation) {
                formationCount[battle.formation] = (formationCount[battle.formation] || 0) + 1;
            }
        });

        return Object.keys(formationCount).reduce((a, b) => 
            formationCount[a] > formationCount[b] ? a : b, 'line');
    }

    getMostUsedAbility() {
        // تحلیل توانایی‌های استفاده شده
        const abilityCount = {};
        this.battleHistory.forEach(battle => {
            if (battle.abilities) {
                battle.abilities.forEach(ability => {
                    abilityCount[ability] = (abilityCount[ability] || 0) + 1;
                });
            }
        });

        return Object.keys(abilityCount).reduce((a, b) => 
            abilityCount[a] > abilityCount[b] ? a : b, 'charge');
    }
}

// سیستم دیپلماسی و روابط
class DiplomacySystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.tribes = {};
        this.diplomaticRelations = {};
        this.tradeAgreements = {};
        this.alliances = {};
    }

    async init() {
        console.log("🤝 راه‌اندازی سیستم دیپلماسی...");
        
        this.generateTribes();
        this.setupInitialRelations();
        
        return this;
    }

    generateTribes() {
        const tribeNames = [
            'قبیله اژدها', 'قبیله عقاب', 'قبیله شیر', 'قبیله گرگ',
            'قبیله خورشید', 'قبیله ماه', 'قبیله کوه', 'قبیله دریا'
        ];

        tribeNames.forEach((name, index) => {
            this.tribes[index + 1] = {
                id: index + 1,
                name: name,
                strength: Math.floor(Math.random() * 1000) + 500,
                resources: {
                    gold: Math.floor(Math.random() * 5000) + 2000,
                    elixir: Math.floor(Math.random() * 3000) + 1000
                },
                personality: this.getRandomPersonality(),
                lastInteraction: Date.now() - Math.random() * 86400000 // 1 روز گذشته
            };
        });
    }

    getRandomPersonality() {
        const personalities = ['aggressive', 'friendly', 'neutral', 'greedy', 'honorable'];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }

    setupInitialRelations() {
        Object.keys(this.tribes).forEach(tribeId => {
            this.diplomaticRelations[tribeId] = {
                relation: Math.floor(Math.random() * 100) - 50, // بین -50 تا +50
                trust: Math.floor(Math.random() * 100),
                lastInteraction: Date.now(),
                attitude: this.calculateAttitude(tribeId)
            };
        });
    }

    calculateAttitude(tribeId) {
        const relation = this.diplomaticRelations[tribeId].relation;
        
        if (relation >= 70) return 'ally';
        if (relation >= 30) return 'friendly';
        if (relation >= -30) return 'neutral';
        if (relation >= -70) return 'unfriendly';
        return 'hostile';
    }

    sendDiplomaticOffer(targetTribeId, offerType, terms) {
        const targetTribe = this.tribes[targetTribeId];
        if (!targetTribe) return false;

        const response = this.calculateDiplomaticResponse(targetTribeId, offerType, terms);
        
        if (response.accepted) {
            this.executeDiplomaticAgreement(targetTribeId, offerType, terms);
        }

        this.gameEngine.showNotification(
            `🤝 پیشنهاد به ${targetTribe.name}: ${response.accepted ? 'پذیرفته شد' : 'رد شد'}`
        );

        return response.accepted;
    }

    calculateDiplomaticResponse(tribeId, offerType, terms) {
        const tribe = this.tribes[tribeId];
        const relation = this.diplomaticRelations[tribeId].relation;
        
        let acceptanceChance = 50; // پایه 50%

        // تأثیر رابطه
        acceptanceChance += relation * 0.5;

        // تأثیر شخصیت
        switch (tribe.personality) {
            case 'friendly':
                acceptanceChance += 20;
                break;
            case 'aggressive':
                acceptanceChance -= 15;
                break;
            case 'greedy':
                acceptanceChance += terms.resourceOffer ? 25 : -10;
                break;
            case 'honorable':
                acceptanceChance += relation > 0 ? 15 : -15;
                break;
        }

        // تأثیر نوع پیشنهاد
        switch (offerType) {
            case 'trade_agreement':
                acceptanceChance += 10;
                break;
            case 'non_aggression_pact':
                acceptanceChance += 5;
                break;
            case 'alliance':
                acceptanceChance -= 10;
                break;
        }

        const accepted = Math.random() * 100 <= Math.max(0, Math.min(100, acceptanceChance));
        
        return {
            accepted,
            message: accepted ? 'پیشنهاد شما پذیرفته شد' : 'پیشنهاد شما رد شد',
            counterOffer: !accepted ? this.generateCounterOffer(tribeId, offerType) : null
        };
    }

    generateCounterOffer(tribeId, originalOfferType) {
        // تولید پیشنهاد متقابل
        return {
            type: originalOfferType,
            modifiedTerms: {
                duration: Math.floor(Math.random() * 24) + 12, // ساعت
                resourceExchange: Math.floor(Math.random() * 1000) + 500
            }
        };
    }

    executeDiplomaticAgreement(tribeId, offerType, terms) {
        switch (offerType) {
            case 'trade_agreement':
                this.createTradeAgreement(tribeId, terms);
                break;
            case 'non_aggression_pact':
                this.createNonAggressionPact(tribeId, terms);
                break;
            case 'alliance':
                this.createAlliance(tribeId, terms);
                break;
        }

        // بهبود رابطه
        this.diplomaticRelations[tribeId].relation += 10;
        this.diplomaticRelations[tribeId].trust += 5;
    }

    createTradeAgreement(tribeId, terms) {
        this.tradeAgreements[tribeId] = {
            startTime: Date.now(),
            duration: terms.duration || 24, // ساعت
            resourceRate: terms.resourceRate || 100,
            active: true
        };

        console.log(`📊 قرارداد تجاری با ${this.tribes[tribeId].name} امضا شد`);
    }

    createNonAggressionPact(tribeId, terms) {
        this.diplomaticRelations[tribeId].nonAggressionPact = {
            startTime: Date.now(),
            duration: terms.duration || 48, // ساعت
            active: true
        };

        console.log(`🕊️ پیمان عدم تجاوز با ${this.tribes[tribeId].name} امضا شد`);
    }

    createAlliance(tribeId, terms) {
        this.alliances[tribeId] = {
            startTime: Date.now(),
            mutualDefense: terms.mutualDefense || true,
            sharedVision: terms.sharedVision || false,
            active: true
        };

        console.log(`🤝 اتحاد با ${this.tribes[tribeId].name} تشکیل شد`);
    }

    updateDiplomaticRelations() {
        Object.keys(this.tribes).forEach(tribeId => {
            // کاهش تدریجی رابطه اگر تعامل نباشد
            const daysSinceInteraction = (Date.now() - this.diplomaticRelations[tribeId].lastInteraction) / 86400000;
            if (daysSinceInteraction > 7) { // بعد از 7 روز
                this.diplomaticRelations[tribeId].relation -= 1;
            }

            // به‌روزرسانی نگرش
            this.diplomaticRelations[tribeId].attitude = this.calculateAttitude(tribeId);
        });
    }

    getDiplomaticStatus() {
        const status = {
            allies: 0,
            friendly: 0,
            neutral: 0,
            unfriendly: 0,
            hostile: 0
        };

        Object.keys(this.diplomaticRelations).forEach(tribeId => {
            const attitude = this.diplomaticRelations[tribeId].attitude;
            status[attitude]++;
        });

        return status;
    }
}

// سیستم رویدادهای پویا
class DynamicEventSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.activeEvents = [];
        this.eventHistory = [];
        this.eventTemplates = {};
    }

    async init() {
        console.log("🎪 راه‌اندازی سیستم رویدادهای پویا...");
        
        this.setupEventTemplates();
        this.startEventScheduler();
        
        return this;
    }

    setupEventTemplates() {
        this.eventTemplates = {
            'resource_discovery': {
                name: 'کشف معدن جدید',
                description: 'یک معدن طلای غنی کشف شده است!',
                rarity: 'common',
                trigger: () => Math.random() < 0.1, // 10% شانس
                effect: () => this.resourceDiscoveryEvent()
            },
            'merchant_visit': {
                name: 'بازدید تاجر',
                description: 'یک تاجر دوره‌گرد به قبیله شما آمده است',
                rarity: 'common',
                trigger: () => Math.random() < 0.08, // 8% شانس
                effect: () => this.merchantVisitEvent()
            },
            'natural_disaster': {
                name: 'بلای طبیعی',
                description: 'یک طوفان شدید به قبیله شما آسیب زده است',
                rarity: 'rare',
                trigger: () => Math.random() < 0.03, // 3% شانس
                effect: () => this.naturalDisasterEvent()
            },
            'ancient_artifact': {
                name: 'مصنوعات باستانی',
                description: 'یک شیء باستانی مرموز کشف شده است',
                rarity: 'epic',
                trigger: () => Math.random() < 0.01, // 1% شانس
                effect: () => this.ancientArtifactEvent()
            },
            'rebellion': {
                name: 'شورش',
                description: 'برخی از واحدها شورش کرده‌اند!',
                rarity: 'uncommon',
                trigger: () => Math.random() < 0.05 && this.gameEngine.units.length > 10,
                effect: () => this.rebellionEvent()
            }
        };
    }

    startEventScheduler() {
        // بررسی رویدادها هر 2 دقیقه
        setInterval(() => {
            this.checkForEvents();
        }, 120000);
    }

    checkForEvents() {
        Object.keys(this.eventTemplates).forEach(eventId => {
            const eventTemplate = this.eventTemplates[eventId];
            
            if (eventTemplate.trigger() && !this.isEventActive(eventId)) {
                this.triggerEvent(eventId);
            }
        });
    }

    isEventActive(eventId) {
        return this.activeEvents.some(event => event.id === eventId && event.active);
    }

    triggerEvent(eventId) {
        const eventTemplate = this.eventTemplates[eventId];
        if (!eventTemplate) return;

        const event = {
            id: eventId,
            name: eventTemplate.name,
            description: eventTemplate.description,
            startTime: Date.now(),
            active: true,
            template: eventTemplate
        };

        this.activeEvents.push(event);
        this.eventHistory.push({...event});

        // اجرای اثر رویداد
        eventTemplate.effect();

        // نمایش نوتیفیکیشن
        this.gameEngine.showNotification(`🎪 رویداد: ${event.name}`, 'info');

        console.log(`🎪 رویداد "${event.name}" فعال شد`);
    }

    resourceDiscoveryEvent() {
        const goldAmount = 500 + Math.floor(Math.random() * 1000);
        this.gameEngine.resources.gold += goldAmount;
        
        this.gameEngine.showNotification(
            `💰 کشف معدن طلا! ${goldAmount} طلا به منابع شما اضافه شد`,
            'success'
        );

        // افکت بصری
        if (this.gameEngine.advancedSystems) {
            this.gameEngine.advancedSystems.particleSystem.createMagicEffect(
                new BABYLON.Vector3(0, 0, 0), 'gold'
            );
        }
    }

    merchantVisitEvent() {
        const offers = [
            { resource: 'gold', amount: 1000, price: 500 },
            { resource: 'elixir', amount: 800, price: 400 },
            { resource: 'both', amount: 500, price: 600 }
        ];

        const offer = offers[Math.floor(Math.random() * offers.length)];
        
        this.gameEngine.showNotification(
            `🛒 تاجر: ${offer.amount} ${offer.resource} به قیمت ${offer.price}`,
            'info'
        );

        // در نسخه کامل، اینجا می‌توان یک دیالوگ با تاجر نشان داد
    }

    naturalDisasterEvent() {
        // آسیب به ساختمان‌های تصادفی
        const allBuildings = [
            ...this.gameEngine.tribeLayout.buildings,
            ...this.gameEngine.tribeLayout.barracks,
            ...this.gameEngine.tribeLayout.resources
        ];

        const damagedBuildings = allBuildings
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(allBuildings.length * 0.3)); // 30% ساختمان‌ها

        damagedBuildings.forEach(building => {
            building.health = Math.max(1, building.health * 0.7); // 30% آسیب
        });

        this.gameEngine.showNotification(
            `🌪️ طوفان! ${damagedBuildings.length} ساختمان آسیب دید`,
            'error'
        );
    }

    ancientArtifactEvent() {
        // اعمال بونوس ویژه
        const bonuses = [
            { type: 'production', amount: 0.5, duration: 300 }, // 5 دقیقه
            { type: 'attack', amount: 0.3, duration: 600 }, // 10 دقیقه
            { type: 'defense', amount: 0.4, duration: 450 } // 7.5 دقیقه
        ];

        const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
        
        this.applyArtifactBonus(bonus);
        
        this.gameEngine.showNotification(
            `🔮 مصنوعات باستانی! ${this.getBonusName(bonus.type)} +${bonus.amount * 100}%`,
            'success'
        );
    }

    applyArtifactBonus(bonus) {
        // اعمال بونوس به بازی
        switch (bonus.type) {
            case 'production':
                this.gameEngine.tribeLayout.resources.forEach(resource => {
                    resource.productionRate *= (1 + bonus.amount);
                });
                break;
            case 'attack':
                this.gameEngine.units.forEach(unit => {
                    unit.damage *= (1 + bonus.amount);
                });
                break;
            case 'defense':
                this.gameEngine.tribeLayout.buildings.forEach(building => {
                    building.health *= (1 + bonus.amount);
                });
                break;
        }

        // بازگشت به حالت عادی پس از مدت زمان
        setTimeout(() => {
            this.removeArtifactBonus(bonus);
        }, bonus.duration * 1000);
    }

    removeArtifactBonus(bonus) {
        // حذف بونوس
        switch (bonus.type) {
            case 'production':
                this.gameEngine.tribeLayout.resources.forEach(resource => {
                    resource.productionRate /= (1 + bonus.amount);
                });
                break;
            case 'attack':
                this.gameEngine.units.forEach(unit => {
                    unit.damage /= (1 + bonus.amount);
                });
                break;
            case 'defense':
                this.gameEngine.tribeLayout.buildings.forEach(building => {
                    building.health /= (1 + bonus.amount);
                });
                break;
        }

        this.gameEngine.showNotification(`🔮 اثر مصنوعات باستانی به پایان رسید`);
    }

    getBonusName(bonusType) {
        const names = {
            'production': 'تولید منابع',
            'attack': 'قدرت حمله',
            'defense': 'استحکام دفاع'
        };
        return names[bonusType] || bonusType;
    }

    rebellionEvent() {
        const rebelCount = Math.min(3, Math.floor(this.gameEngine.units.length * 0.2));
        const rebels = this.gameEngine.units
            .sort(() => Math.random() - 0.5)
            .slice(0, rebelCount);

        rebels.forEach(unit => {
            // تبدیل واحد به دشمن
            this.gameEngine.enemies.push({
                ...unit,
                isRebel: true,
                originalOwner: 'player'
            });
            
            // حذف از واحدهای player
            const index = this.gameEngine.units.indexOf(unit);
            if (index > -1) {
                this.gameEngine.units.splice(index, 1);
            }
        });

        this.gameEngine.showNotification(
            `⚡ شورش! ${rebels.length} واحد به دشمن پیوستند`,
            'error'
        );
    }

    completeEvent(eventId) {
        const eventIndex = this.activeEvents.findIndex(event => event.id === eventId);
        if (eventIndex > -1) {
            this.activeEvents[eventIndex].active = false;
            this.activeEvents[eventIndex].endTime = Date.now();
        }
    }

    getActiveEvents() {
        return this.activeEvents.filter(event => event.active);
    }
}

// سیستم دستاوردهای پیشرفته
class AdvancedAchievementSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.achievements = {};
        this.completedAchievements = [];
        this.achievementPoints = 0;
    }

    async init() {
        console.log("🏆 راه‌اندازی سیستم دستاوردهای پیشرفته...");
        
        this.setupAchievements();
        this.startAchievementTracker();
        
        return this;
    }

    setupAchievements() {
        this.achievements = {
            // دستاوردهای منابع
            'gold_hoarder': {
                name: 'ذخیره‌دار طلا',
                description: '۱۰۰۰۰ طلا جمع‌آوری کن',
                tier: 'bronze',
                points: 10,
                condition: (game) => game.resources.gold >= 10000,
                reward: { gold: 2000 }
            },
            'elixir_master': {
                name: 'استاد اکسیر',
                description: '۵۰۰۰ اکسیر جمع‌آوری کن',
                tier: 'bronze',
                points: 10,
                condition: (game) => game.resources.elixir >= 5000,
                reward: { elixir: 1000 }
            },

            // دستاوردهای ساختمان
            'master_builder': {
                name: 'استاد سازنده',
                description: '۵۰ ساختمان بساز',
                tier: 'silver',
                points: 25,
                condition: (game) => game.stats.buildingsBuilt >= 50,
                reward: { gold: 5000, elixir: 3000 }
            },
            'fortress_king': {
                name: 'پادشاه قلعه',
                description: '۲۰ دیوار دفاعی بساز',
                tier: 'silver',
                points: 20,
                condition: (game) => game.tribeLayout.walls.length >= 20,
                reward: { gold: 3000 }
            },

            // دستاوردهای نظامی
            'war_veteran': {
                name: 'کهنه‌سرباز',
                description: '۱۰۰ نبرد برنده شو',
                tier: 'gold',
                points: 50,
                condition: (game) => game.stats.battlesWon >= 100,
                reward: { gold: 10000, elixir: 5000 }
            },
            'unit_commander': {
                name: 'فرمانده واحدها',
                description: '۱۰۰ واحد آموزش بده',
                tier: 'gold',
                points: 40,
                condition: (game) => game.stats.unitsTrained >= 100,
                reward: { gold: 8000, elixir: 4000 }
            },

            // دستاوردهای پیشرفته
            'perfect_defense': {
                name: 'دفاع بی‌نقص',
                description: 'یک حمله را بدون از دست دادن هیچ ساختمانی دفع کن',
                tier: 'platinum',
                points: 75,
                condition: (game) => this.checkPerfectDefense(game),
                reward: { gold: 15000, elixir: 8000 }
            },
            'economic_power': {
                name: 'قدرت اقتصادی',
                description: 'همزمان ۵ معدن فعال داشته باش',
                tier: 'diamond',
                points: 100,
                condition: (game) => game.tribeLayout.resources.length >= 5,
                reward: { gold: 20000, elixir: 10000 }
            }
        };
    }

    startAchievementTracker() {
        // بررسی دستاوردها هر 10 ثانیه
        setInterval(() => {
            this.checkAchievements();
        }, 10000);
    }

    checkAchievements() {
        Object.keys(this.achievements).forEach(achievementId => {
            if (!this.completedAchievements.includes(achievementId)) {
                const achievement = this.achievements[achievementId];
                
                if (achievement.condition(this.gameEngine)) {
                    this.unlockAchievement(achievementId);
                }
            }
        });
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return;

        this.completedAchievements.push(achievementId);
        this.achievementPoints += achievement.points;

        // اعمال پاداش
        if (achievement.reward.gold) {
            this.gameEngine.resources.gold += achievement.reward.gold;
        }
        if (achievement.reward.elixir) {
            this.gameEngine.resources.elixir += achievement.reward.elixir;
        }

        // نمایش نوتیفیکیشن ویژه
        this.showAchievementNotification(achievement);

        console.log(`🏆 دستاورد "${achievement.name}" باز شد!`);
    }

    showAchievementNotification(achievement) {
        const tierColors = {
            'bronze': '#cd7f32',
            'silver': '#c0c0c0', 
            'gold': '#ffd700',
            'platinum': '#e5e4e2',
            'diamond': '#b9f2ff'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, ${tierColors[achievement.tier] || '#4444ff'}, #000);
            color: white;
            padding: 30px;
            border-radius: 15px;
            z-index: 10000;
            text-align: center;
            font-family: Tahoma;
            border: 3px solid gold;
            box-shadow: 0 0 30px ${tierColors[achievement.tier] || '#4444ff'};
            animation: achievementPop 2s ease-in-out;
        `;

        // اضافه کردن انیمیشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes achievementPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        notification.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
            <h2 style="margin: 10px 0; color: gold;">${achievement.name}</h2>
            <p style="margin: 10px 0;">${achievement.description}</p>
            <div style="margin: 15px 0;">
                <strong>رده: ${this.getTierName(achievement.tier)}</strong><br>
                <strong>امتیاز: +${achievement.points}</strong>
            </div>
            <div style="margin: 15px 0;">
                ${achievement.reward.gold ? `💰 +${achievement.reward.gold} طلا<br>` : ''}
                ${achievement.reward.elixir ? `⚗️ +${achievement.reward.elixir} اکسیر` : ''}
            </div>
        `;

        document.body.appendChild(notification);

        // حذف پس از 5 ثانیه
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    getTierName(tier) {
        const names = {
            'bronze': 'برنزی',
            'silver': 'نقره‌ای',
            'gold': 'طلایی',
            'platinum': 'پلاتینی',
            'diamond': 'الماسی'
        };
        return names[tier] || tier;
    }

    checkPerfectDefense(game) {
        // بررسی اینکه آیا حمله‌ای بدون آسیب به ساختمان‌ها دفع شده
        // این نیاز به پیاده‌سازی دقیق‌تر دارد
        return game.stats.battlesWon > 50 && Math.random() < 0.1; // شبیه‌سازی
    }

    getAchievementProgress(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return 0;

        // محاسبه پیشرفت برای نمایش در UI
        if (achievement.condition) {
            return achievement.condition(this.gameEngine) ? 100 : 0;
        }

        return 0;
    }

    getAchievementStats() {
        const total = Object.keys(this.achievements).length;
        const completed = this.completedAchievements.length;
        const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

        return {
            totalAchievements: total,
            completed: completed,
            completionRate: completionRate + '%',
            totalPoints: this.achievementPoints,
            nextAchievement: this.getNextAchievement()
        };
    }

    getNextAchievement() {
        const incomplete = Object.keys(this.achievements)
            .filter(id => !this.completedAchievements.includes(id))
            .map(id => this.achievements[id]);

        return incomplete.sort((a, b) => a.points - b.points)[0];
    }
}

// سیستم آمار و آنالیز
class StatisticsSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gameStats = {};
        this.sessionStats = {};
        this.hourlyStats = {};
        this.startSession();
    }

    startSession() {
        this.sessionStats = {
            startTime: Date.now(),
            buildingsBuilt: 0,
            unitsTrained: 0,
            battlesFought: 0,
            resourcesCollected: 0,
            timePlayed: 0
        };
    }

    recordStat(statType, value = 1) {
        if (!this.gameStats[statType]) {
            this.gameStats[statType] = 0;
        }
        this.gameStats[statType] += value;

        // ثبت در آمار سشن
        if (this.sessionStats[statType] !== undefined) {
            this.sessionStats[statType] += value;
        }

        // ثبت ساعتی
        const hour = new Date().getHours();
        if (!this.hourlyStats[hour]) {
            this.hourlyStats[hour] = {};
        }
        if (!this.hourlyStats[hour][statType]) {
            this.hourlyStats[hour][statType] = 0;
        }
        this.hourlyStats[hour][statType] += value;
    }

    getComprehensiveStats() {
        const sessionDuration = (Date.now() - this.sessionStats.startTime) / 1000;
        
        return {
            // آمار کلی
            totalPlayTime: this.gameEngine.stats.totalPlayTime,
            totalBuildings: this.gameEngine.stats.buildingsBuilt,
            totalUnits: this.gameEngine.stats.unitsTrained,
            totalBattles: this.gameEngine.stats.battlesWon + this.gameEngine.stats.battlesLost,
            
            // آمار سشن
            sessionTime: sessionDuration,
            sessionBuildings: this.sessionStats.buildingsBuilt,
            sessionUnits: this.sessionStats.unitsTrained,
            sessionBattles: this.sessionStats.battlesFought,
            
            // نرخ‌ها
            buildingsPerHour: this.calculateRate(this.sessionStats.buildingsBuilt, sessionDuration),
            unitsPerHour: this.calculateRate(this.sessionStats.unitsTrained, sessionDuration),
            battlesPerHour: this.calculateRate(this.sessionStats.battlesFought, sessionDuration),
            
            // منابع
            currentResources: { ...this.gameEngine.resources },
            tribeStrength: this.gameEngine.getTribeStrength(),
            
            // آنالیز پیشرفت
            progressScore: this.calculateProgressScore(),
            efficiencyRating: this.calculateEfficiencyRating()
        };
    }

    calculateRate(count, duration) {
        const hours = duration / 3600;
        return hours > 0 ? (count / hours).toFixed(2) : 0;
    }

    calculateProgressScore() {
        let score = 0;
        
        score += this.gameEngine.stats.buildingsBuilt * 10;
        score += this.gameEngine.stats.unitsTrained * 5;
        score += this.gameEngine.stats.battlesWon * 15;
        score += this.gameEngine.resources.gold / 100;
        score += this.gameEngine.resources.elixir / 50;
        
        return Math.floor(score);
    }

    calculateEfficiencyRating() {
        const totalTime = this.gameEngine.stats.totalPlayTime;
        if (totalTime === 0) return 0;

        const progress = this.calculateProgressScore();
        return (progress / totalTime).toFixed(2);
    }

    getPerformanceTips() {
        const stats = this.getComprehensiveStats();
        const tips = [];

        if (stats.buildingsPerHour < 2) {
            tips.push('💡 می‌توانی سریع‌تر ساختمان بسازی!');
        }

        if (stats.unitsPerHour < 1) {
            tips.push('💡 ارتش قوی‌تری نیاز داری!');
        }

        if (stats.battlesPerHour < 0.5) {
            tips.push('💡 بیشتر با دشمنان بجنگ!');
        }

        if (this.gameEngine.resources.gold > 5000) {
            tips.push('💡 از طلای اضافه برای بهبود قبیله استفاده کن!');
        }

        return tips.length > 0 ? tips : ['🎯 عملکرد تو عالی است! ادامه بده!'];
    }

    generateReport() {
        const stats = this.getComprehensiveStats();
        
        return {
            summary: `گزارش عملکرد - امتیاز: ${stats.progressScore}`,
            details: stats,
            tips: this.getPerformanceTips(),
            timestamp: new Date().toLocaleString('fa-IR')
        };
    }
}

// سیستم آموزش و راهنمایی
class TutorialSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.completedTutorials = [];
        this.activeTutorial = null;
        this.tutorialSteps = {};
    }

    async init() {
        console.log("📚 راه‌اندازی سیستم آموزش...");
        
        this.setupTutorials();
        
        return this;
    }

    setupTutorials() {
        this.tutorialSteps = {
            'welcome': {
                title: 'خوش آمدید به جنگ قبیله‌ای!',
                steps: [
                    {
                        message: 'به جنگ قبیله‌ای خوش آمدید! اینجا تو رهبر یک قبیله باستانی هستی.',
                        action: 'show_ui',
                        target: 'resource_bar'
                    },
                    {
                        message: 'این نوار منابع تو هست. طلا و اکسیر برای ساخت‌وساز نیاز داری.',
                        action: 'highlight',
                        target: 'resource_bar'
                    },
                    {
                        message: 'حالا اولین ساختمانتو بساز! روی دکمه "دیوار" کلیک کن.',
                        action: 'wait_for_build',
                        building: 'wall'
                    }
                ]
            },
            'building': {
                title: 'ساخت‌وساز پیشرفته',
                steps: [
                    {
                        message: 'آفرین! حالا یک سربازخانه بساز تا واحد آموزش بدی.',
                        action: 'wait_for_build',
                        building: 'barracks'
                    },
                    {
                        message: 'عالیه! حالا برو به مرحله بعد: آموزش واحدها.',
                        action: 'complete'
                    }
                ]
            },
            'combat': {
                title: 'هنر نبرد',
                steps: [
                    {
                        message: 'حالا که واحد داری، وقت نبرد فرا رسیده!',
                        action: 'show_combat_tips'
                    },
                    {
                        message: 'واحدها رو انتخاب کن و به دشمن حمله کن!',
                        action: 'wait_for_combat'
                    }
                ]
            }
        };
    }

    startTutorial(tutorialId) {
        if (this.completedTutorials.includes(tutorialId)) {
            return false;
        }

        const tutorial = this.tutorialSteps[tutorialId];
        if (!tutorial) return false;

        this.activeTutorial = {
            id: tutorialId,
            currentStep: 0,
            steps: tutorial.steps,
            title: tutorial.title
        };

        this.showCurrentStep();
        return true;
    }

    showCurrentStep() {
        if (!this.activeTutorial) return;

        const step = this.activeTutorial.steps[this.activeTutorial.currentStep];
        if (!step) {
            this.completeTutorial();
            return;
        }

        this.showTutorialMessage(step.message);
        this.executeStepAction(step);
    }

    showTutorialMessage(message) {
        const tutorialMsg = document.createElement('div');
        tutorialMsg.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            font-family: Tahoma;
            max-width: 500px;
            border: 2px solid gold;
        `;

        tutorialMsg.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: gold;">${this.activeTutorial.title}</h3>
            <p style="margin: 0;">${message}</p>
            <button onclick="window.tutorialSystem.nextStep()" style="
                margin-top: 10px;
                padding: 8px 16px;
                background: gold;
                color: black;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">ادامه</button>
        `;

        tutorialMsg.id = 'tutorialMessage';
        
        // حذف پیام قبلی اگر وجود دارد
        const existingMsg = document.getElementById('tutorialMessage');
        if (existingMsg) {
            existingMsg.remove();
        }

        document.body.appendChild(tutorialMsg);
    }

    executeStepAction(step) {
        switch (step.action) {
            case 'highlight':
                this.highlightUIElement(step.target);
                break;
            case 'wait_for_build':
                this.waitForBuildingConstruction(step.building);
                break;
            case 'wait_for_combat':
                this.waitForCombat();
                break;
        }
    }

    highlightUIElement(elementId) {
        // هایلایت المان UI
        const element = document.getElementById(elementId);
        if (element) {
            element.style.boxShadow = '0 0 20px gold';
            element.style.transition = 'box-shadow 0.3s ease';
        }
    }

    waitForBuildingConstruction(buildingType) {
        // منتظر ساخت ساختمان می‌ماند
        const checkInterval = setInterval(() => {
            const hasBuilding = this.gameEngine.tribeLayout.buildings.some(
                b => b.type === buildingType
            ) || this.gameEngine.tribeLayout.barracks.some(
                b => b.type === buildingType
            ) || this.gameEngine.tribeLayout.resources.some(
                b => b.type === buildingType
            );

            if (hasBuilding) {
                clearInterval(checkInterval);
                this.nextStep();
            }
        }, 1000);
    }

    waitForCombat() {
        // منتظر درگیری با دشمن می‌ماند
        const originalEnemyCount = this.gameEngine.enemies.length;
        
        const checkInterval = setInterval(() => {
            if (this.gameEngine.enemies.length < originalEnemyCount) {
                clearInterval(checkInterval);
                this.nextStep();
            }
        }, 1000);
    }

    nextStep() {
        if (!this.activeTutorial) return;

        this.activeTutorial.currentStep++;
        
        // حذف پیام فعلی
        const tutorialMsg = document.getElementById('tutorialMessage');
        if (tutorialMsg) {
            tutorialMsg.remove();
        }

        this.showCurrentStep();
    }

    completeTutorial() {
        if (!this.activeTutorial) return;

        this.completedTutorials.push(this.activeTutorial.id);
        
        this.gameEngine.showNotification(
            `🎓 آموزش "${this.activeTutorial.title}" تکمیل شد!`,
            'success'
        );

        this.activeTutorial = null;

        // حذف پیام
        const tutorialMsg = document.getElementById('tutorialMessage');
        if (tutorialMsg) {
            tutorialMsg.remove();
        }
    }

    getTutorialProgress() {
        const total = Object.keys(this.tutorialSteps).length;
        const completed = this.completedTutorials.length;
        
        return {
            total: total,
            completed: completed,
            progress: (completed / total * 100).toFixed(1) + '%',
            nextTutorial: this.getNextTutorial()
        };
    }

    getNextTutorial() {
        const incomplete = Object.keys(this.tutorialSteps)
            .filter(id => !this.completedTutorials.includes(id))[0];
            
        return incomplete ? this.tutorialSteps[incomplete].title : 'همه آموزش‌ها تکمیل شد!';
    }
}

// سیستم اتوماسیون
class AutomationSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.autoBuild = false;
        this.autoTrain = false;
        this.autoRepair = false;
        this.autoCollect = false;
        this.autoSettings = {};
    }

    async init() {
        console.log("🤖 راه‌اندازی سیستم اتوماسیون...");
        
        this.setupDefaultSettings();
        
        return this;
    }

    setupDefaultSettings() {
        this.autoSettings = {
            buildPriority: ['wall', 'goldmine', 'barracks', 'cannon'],
            trainPriority: ['soldier', 'archer', 'giant'],
            repairThreshold: 0.5, // تعمیر وقتی سلامت زیر 50% باشد
            collectInterval: 30000 // جمع‌آوری هر 30 ثانیه
        };
    }

    enableAutoBuild() {
        this.autoBuild = true;
        this.startAutoBuild();
        this.gameEngine.showNotification('🤖 ساخت‌وساز خودکار فعال شد');
    }

    enableAutoTrain() {
        this.autoTrain = true;
        this.startAutoTrain();
        this.gameEngine.showNotification('🤖 آموزش خودکار فعال شد');
    }

    enableAutoRepair() {
        this.autoRepair = true;
        this.startAutoRepair();
        this.gameEngine.showNotification('🤖 تعمیر خودکار فعال شد');
    }

    enableAutoCollect() {
        this.autoCollect = true;
        this.startAutoCollect();
        this.gameEngine.showNotification('🤖 جمع‌آوری خودکار فعال شد');
    }

    startAutoBuild() {
        if (!this.autoBuild) return;

        setInterval(() => {
            this.autoBuildProcess();
        }, 60000); // هر 1 دقیقه
    }

    startAutoTrain() {
        if (!this.autoTrain) return;

        setInterval(() => {
            this.autoTrainProcess();
        }, 45000); // هر 45 ثانیه
    }

    startAutoRepair() {
        if (!this.autoRepair) return;

        setInterval(() => {
            this.autoRepairProcess();
        }, 30000); // هر 30 ثانیه
    }

    startAutoCollect() {
        if (!this.autoCollect) return;

        setInterval(() => {
            this.autoCollectProcess();
        }, this.autoSettings.collectInterval);
    }

    autoBuildProcess() {
        const availableResources = this.gameEngine.resources;
        
        for (const buildingType of this.autoSettings.buildPriority) {
            const buildingData = this.gameEngine.getBuildingData(buildingType);
            
            if (this.gameEngine.hasEnoughResources(buildingData.cost)) {
                // پیدا کردن موقعیت مناسب برای ساخت
                const position = this.findBuildPosition();
                if (position) {
                    this.gameEngine.placeBuilding(buildingType, position);
                    break; // فقط یک ساختمان در هر cycle
                }
            }
        }
    }

    autoTrainProcess() {
        const barracks = this.gameEngine.tribeLayout.barracks;
        if (barracks.length === 0) return;

        for (const unitType of this.autoSettings.trainPriority) {
            const unitCost = this.gameEngine.getUnitCost(unitType);
            
            if (this.gameEngine.hasEnoughResources(unitCost)) {
                // آموزش از اولین سربازخانه موجود
                this.gameEngine.trainUnit(barracks[0], unitType);
                break; // فقط یک واحد در هر cycle
            }
        }
    }

    autoRepairProcess() {
        const allBuildings = [
            ...this.gameEngine.tribeLayout.buildings,
            ...this.gameEngine.tribeLayout.barracks,
            ...this.gameEngine.tribeLayout.resources,
            ...this.gameEngine.tribeLayout.defenses,
            ...this.gameEngine.tribeLayout.walls
        ];

        const damagedBuildings = allBuildings.filter(building => 
            building.health < building.maxHealth * this.autoSettings.repairThreshold
        );

        if (damagedBuildings.length > 0) {
            this.gameEngine.showNotification(`🔧 تعمیر خودکار ${damagedBuildings.length} ساختمان`);
            
            // در نسخه کامل، اینجا ساختمان‌ها تعمیر می‌شوند
        }
    }

    autoCollectProcess() {
        // جمع‌آوری خودکار منابع
        let totalCollected = 0;
        
        this.gameEngine.tribeLayout.resources.forEach(resource => {
            if (resource.lastCollection) {
                const timeSinceCollection = Date.now() - resource.lastCollection;
                const collections = Math.floor(timeSinceCollection / 10000); // هر 10 ثانیه
                
                if (collections > 0) {
                    totalCollected += collections * resource.productionRate;
                    resource.lastCollection = Date.now();
                }
            }
        });

        if (totalCollected > 0) {
            this.gameEngine.resources.gold += totalCollected * 0.6; // 60% طلا
            this.gameEngine.resources.elixir += totalCollected * 0.4; // 40% اکسیر
            
            this.gameEngine.showNotification(
                `🤖 جمع‌آوری خودکار: +${Math.floor(totalCollected * 0.6)} طلا, +${Math.floor(totalCollected * 0.4)} اکسیر`
            );
        }
    }

    findBuildPosition() {
        // پیدا کردن موقعیت مناسب برای ساخت
        // این یک پیاده‌سازی ساده است
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 20;
        
        return new BABYLON.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        );
    }

    disableAllAutomation() {
        this.autoBuild = false;
        this.autoTrain = false;
        this.autoRepair = false;
        this.autoCollect = false;
        
        this.gameEngine.showNotification('🤖 همه اتوماسیون‌ها غیرفعال شدند');
    }

    getAutomationStatus() {
        return {
            autoBuild: this.autoBuild,
            autoTrain: this.autoTrain,
            autoRepair: this.autoRepair,
            autoCollect: this.autoCollect,
            settings: this.autoSettings
        };
    }
}

// سیستم سینماتیک و داستان
class CinematicSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.cutscenes = {};
        this.activeCutscene = null;
        this.storyProgress = 0;
    }

    async init() {
        console.log("🎬 راه‌اندازی سیستم سینماتیک...");
        
        this.setupCutscenes();
        
        return this;
    }

    setupCutscenes() {
        this.cutscenes = {
            'intro': {
                title: 'آغاز سفر',
                scenes: [
                    {
                        cameraPosition: new BABYLON.Vector3(0, 50, -30),
                        cameraTarget: new BABYLON.Vector3(0, 0, 0),
                        duration: 3000,
                        dialogue: 'در سرزمینی فراموش شده، قبیله‌ای باستانی نیاز به رهبر دارد...'
                    },
                    {
                        cameraPosition: new BABYLON.Vector3(-20, 30, -20),
                        cameraTarget: new BABYLON.Vector3(0, 10, 0),
                        duration: 4000,
                        dialogue: 'تو برگزیده‌ای تا این قبیله را به عظمت برسانی!'
                    },
                    {
                        cameraPosition: new BABYLON.Vector3(0, 20, 0),
                        cameraTarget: new BABYLON.Vector3(0, 10, 10),
                        duration: 3000,
                        dialogue: 'ساختمان بساز، واحد آموزش بده، و از قبیله در برابر دشمنان دفاع کن!'
                    }
                ]
            },
            'first_battle': {
                title: 'نخستین نبرد',
                trigger: () => this.gameEngine.stats.battlesWon >= 1,
                scenes: [
                    {
                        cameraPosition: new BABYLON.Vector3(0, 40, 0),
                        cameraTarget: new BABYLON.Vector3(10, 0, 10),
                        duration: 5000,
                        dialogue: 'آفرین! نخستین پیروزی تو تنها آغاز راه است...'
                    }
                ]
            }
        };
    }

    playCutscene(cutsceneId) {
        const cutscene = this.cutscenes[cutsceneId];
        if (!cutscene) return false;

        this.activeCutscene = {
            id: cutsceneId,
            currentScene: 0,
            scenes: cutscene.scenes,
            title: cutscene.title
        };

        this.playCurrentScene();
        return true;
    }

    playCurrentScene() {
        if (!this.activeCutscene) return;

        const scene = this.activeCutscene.scenes[this.activeCutscene.currentScene];
        if (!scene) {
            this.endCutscene();
            return;
        }

        // حرکت دوربین
        if (this.gameEngine.camera) {
            this.gameEngine.camera.position = scene.cameraPosition;
            this.gameEngine.camera.setTarget(scene.cameraTarget);
        }

        // نمایش دیالوگ
        this.showDialogue(scene.dialogue);

        // رفتن به صحنه بعدی پس از مدت زمان
        setTimeout(() => {
            this.nextScene();
        }, scene.duration);
    }

    showDialogue(text) {
        const dialogueBox = document.createElement('div');
        dialogueBox.style.cssText = `
            position: fixed;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            font-family: Tahoma;
            max-width: 600px;
            border: 2px solid gold;
            animation: fadeIn 0.5s ease-in;
        `;

        // اضافه کردن انیمیشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);

        dialogueBox.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: gold;">${this.activeCutscene.title}</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.5;">${text}</p>
        `;

        dialogueBox.id = 'cinematicDialogue';
        
        // حذف دیالوگ قبلی
        const existingDialogue = document.getElementById('cinematicDialogue');
        if (existingDialogue) {
            existingDialogue.remove();
        }

        document.body.appendChild(dialogueBox);
    }

    nextScene() {
        if (!this.activeCutscene) return;

        this.activeCutscene.currentScene++;
        
        // حذف دیالوگ فعلی
        const dialogueBox = document.getElementById('cinematicDialogue');
        if (dialogueBox) {
            dialogueBox.remove();
        }

        this.playCurrentScene();
    }

    endCutscene() {
        if (!this.activeCutscene) return;

        this.storyProgress++;
        
        this.gameEngine.showNotification(
            `🎬 سینماتیک "${this.activeCutscene.title}" به پایان رسید`,
            'success'
        );

        // بازگشت دوربین به حالت عادی
        if (this.gameEngine.camera) {
            this.gameEngine.camera.position = new BABYLON.Vector3(0, 50, -50);
            this.gameEngine.camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        }

        this.activeCutscene = null;

        // حذف دیالوگ
        const dialogueBox = document.getElementById('cinematicDialogue');
        if (dialogueBox) {
            dialogueBox.remove();
        }
    }

    checkCutsceneTriggers() {
        Object.keys(this.cutscenes).forEach(cutsceneId => {
            const cutscene = this.cutscenes[cutsceneId];
            
            if (cutscene.trigger && cutscene.trigger() && !this.hasPlayedCutscene(cutsceneId)) {
                this.playCutscene(cutsceneId);
            }
        });
    }

    hasPlayedCutscene(cutsceneId) {
        // بررسی اینکه آیا سینماتیک قبلاً پخش شده
        return this.storyProgress > Object.keys(this.cutscenes).indexOf(cutsceneId);
    }

    getStoryProgress() {
        const totalCutscenes = Object.keys(this.cutscenes).length;
        
        return {
            currentProgress: this.storyProgress,
            totalCutscenes: totalCutscenes,
            completion: totalCutscenes > 0 ? (this.storyProgress / totalCutscenes * 100).toFixed(1) + '%' : '0%',
            nextCutscene: this.getNextCutscene()
        };
    }

    getNextCutscene() {
        const nextId = Object.keys(this.cutscenes)[this.storyProgress];
        return nextId ? this.cutscenes[nextId].title : 'داستان تکمیل شد!';
    }
}

// راه‌اندازی سیستم‌های حرفه‌ای
if (window.gameEngine) {
    window.professionalSystems = new ProfessionalGameSystems(window.gameEngine);
    window.gameEngine.professionalSystems = window.professionalSystems;

    // گسترش بیشتر متد update
    const currentUpdate = window.gameEngine.update;
    window.gameEngine.update = function() {
        if (currentUpdate) {
            currentUpdate.call(this);
        }
        
        // به‌روزرسانی سیستم‌های حرفه‌ای
        if (this.professionalSystems) {
            this.professionalSystems.diplomacySystem.updateDiplomaticRelations();
            this.professionalSystems.eventSystem.checkForEvents();
            this.professionalSystems.cinematicSystem.checkCutsceneTriggers();
            this.professionalSystems.statisticsSystem.recordStat('timePlayed', this.scene.getEngine().getDeltaTime() / 1000);
        }
    };

    // ثبت global برای دسترسی از کنسول
    window.tutorialSystem = window.professionalSystems.tutorialSystem;
}

console.log("✅ m3.js - سیستم‌های حرفه‌ای بارگذاری شد");

// صادر کردن کلاس‌ها
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProfessionalGameSystems,
        AdvancedBattleSystem,
        DiplomacySystem,
        DynamicEventSystem,
        AdvancedAchievementSystem,
        StatisticsSystem,
        TutorialSystem,
        AutomationSystem,
        CinematicSystem
    };
    }
