// m2.js - سیستم‌های پیشرفته و امکانات اضافی
// =============================================

class AdvancedGameSystems {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.weatherSystem = new WeatherSystem(gameEngine);
        this.dayNightCycle = new DayNightCycle(gameEngine);
        this.economySystem = new EconomySystem(gameEngine);
        this.researchSystem = new ResearchSystem(gameEngine);
        this.questSystem = new QuestSystem(gameEngine);
        this.multiplayerSystem = new MultiplayerSystem(gameEngine);
        this.soundSystem = new SoundSystem(gameEngine);
        this.particleSystem = new ParticleSystem(gameEngine);
        
        this.init();
    }

    async init() {
        console.log("🚀 راه‌اندازی سیستم‌های پیشرفته...");
        
        await this.weatherSystem.init();
        await this.dayNightCycle.init();
        await this.economySystem.init();
        await this.researchSystem.init();
        await this.questSystem.init();
        await this.soundSystem.init();
        await this.particleSystem.init();
        
        // سیستم چندنفره اختیاری است
        this.multiplayerSystem.init().catch(error => {
            console.warn("⚠️ سیستم چندنفره غیرفعال:", error);
        });

        console.log("✅ سیستم‌های پیشرفته راه‌اندازی شدند");
    }
}

// سیستم آب و هوا
class WeatherSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentWeather = 'sunny';
        this.weatherIntensity = 0;
        this.weatherParticles = [];
        this.weatherMaterials = {};
    }

    async init() {
        console.log("🌤️ راه‌اندازی سیستم آب و هوا...");
        
        this.setupWeatherMaterials();
        this.startWeatherCycle();
        
        return this;
    }

    setupWeatherMaterials() {
        // متریال باران
        this.weatherMaterials.rain = new BABYLON.StandardMaterial("rainMaterial", this.gameEngine.scene);
        this.weatherMaterials.rain.diffuseColor = new BABYLON.Color3(0.7, 0.7, 1);
        this.weatherMaterials.rain.alpha = 0.6;

        // متریال برف
        this.weatherMaterials.snow = new BABYLON.StandardMaterial("snowMaterial", this.gameEngine.scene);
        this.weatherMaterials.snow.diffuseColor = new BABYLON.Color3(1, 1, 1);
        this.weatherMaterials.snow.emissiveColor = new BABYLON.Color3(0.8, 0.8, 1);

        // متریال طوفان
        this.weatherMaterials.storm = new BABYLON.StandardMaterial("stormMaterial", this.gameEngine.scene);
        this.weatherMaterials.storm.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
        this.weatherMaterials.storm.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    }

    startWeatherCycle() {
        // تغییر آب و هوا هر 2-5 دقیقه
        setInterval(() => {
            this.changeWeather();
        }, 120000 + Math.random() * 180000);
    }

    changeWeather() {
        const weatherTypes = ['sunny', 'rainy', 'stormy', 'snowy'];
        const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        
        this.transitionToWeather(newWeather);
    }

    transitionToWeather(weatherType) {
        console.log(`🌤️ تغییر آب و هوا به: ${weatherType}`);
        
        // پاک کردن آب و هوای قبلی
        this.clearWeatherEffects();

        this.currentWeather = weatherType;
        this.weatherIntensity = Math.random() * 0.8 + 0.2;

        switch (weatherType) {
            case 'rainy':
                this.createRainEffect();
                break;
            case 'stormy':
                this.createStormEffect();
                break;
            case 'snowy':
                this.createSnowEffect();
                break;
            case 'sunny':
            default:
                this.createSunnyEffect();
                break;
        }

        this.gameEngine.showNotification(`آب و هوا: ${this.getWeatherName(weatherType)}`);
        this.gameEngine.soundSystem.playWeatherSound(weatherType);
    }

    createRainEffect() {
        const rainCount = Math.floor(500 * this.weatherIntensity);
        
        for (let i = 0; i < rainCount; i++) {
            const rainDrop = BABYLON.MeshBuilder.CreateCylinder("rainDrop", {
                height: 0.5,
                diameter: 0.02
            }, this.gameEngine.scene);

            rainDrop.position.x = (Math.random() - 0.5) * 200;
            rainDrop.position.z = (Math.random() - 0.5) * 200;
            rainDrop.position.y = 50 + Math.random() * 20;
            
            rainDrop.material = this.weatherMaterials.rain;
            
            // فیزیک برای قطره باران
            rainDrop.physicsImpostor = new BABYLON.PhysicsImpostor(
                rainDrop,
                BABYLON.PhysicsImpostor.CylinderImpostor,
                { mass: 0.1, restitution: 0.1 },
                this.gameEngine.scene
            );

            this.weatherParticles.push(rainDrop);
        }
    }

    createStormEffect() {
        this.createRainEffect();
        
        // اضافه کردن رعد و برق
        this.startLightningEffect();
        
        // افزایش شدت باد
        this.applyWindEffect(2.0);
    }

    createSnowEffect() {
        const snowCount = Math.floor(300 * this.weatherIntensity);
        
        for (let i = 0; i < snowCount; i++) {
            const snowFlake = BABYLON.MeshBuilder.CreateSphere("snowFlake", {
                diameter: 0.1
            }, this.gameEngine.scene);

            snowFlake.position.x = (Math.random() - 0.5) * 200;
            snowFlake.position.z = (Math.random() - 0.5) * 200;
            snowFlake.position.y = 40 + Math.random() * 15;
            
            snowFlake.material = this.weatherMaterials.snow;
            
            // حرکت آرام برف
            snowFlake.physicsImpostor = new BABYLON.PhysicsImpostor(
                snowFlake,
                BABYLON.PhysicsImpostor.SphereImpostor,
                { mass: 0.01, restitution: 0.05 },
                this.gameEngine.scene
            );

            this.weatherParticles.push(snowFlake);
        }
    }

    createSunnyEffect() {
        // پاک کردن تمام اثرات آب و هوایی
        this.clearWeatherEffects();
        
        // بازیابی نور طبیعی
        if (this.gameEngine.mainLight) {
            this.gameEngine.mainLight.intensity = 1.2;
        }
    }

    startLightningEffect() {
        const lightningInterval = setInterval(() => {
            if (this.currentWeather !== 'stormy') {
                clearInterval(lightningInterval);
                return;
            }
            
            this.createLightningFlash();
            
        }, 3000 + Math.random() * 5000);
    }

    createLightningFlash() {
        // فلش نور
        const flash = new BABYLON.HemisphericLight("lightningFlash", 
            new BABYLON.Vector3(0, 1, 0), this.gameEngine.scene);
        flash.intensity = 5;
        flash.diffuse = new BABYLON.Color3(1, 1, 0.8);
        
        // صدا رعد و برق
        this.gameEngine.soundSystem.playSound('thunder');
        
        // حذف فلش پس از مدت کوتاه
        setTimeout(() => {
            flash.dispose();
        }, 200);
    }

    applyWindEffect(intensity) {
        // اعمال نیروی باد به اشیاء
        this.weatherParticles.forEach(particle => {
            if (particle.physicsImpostor) {
                const windForce = new BABYLON.Vector3(
                    (Math.random() - 0.5) * intensity,
                    -0.1,
                    (Math.random() - 0.5) * intensity
                );
                particle.physicsImpostor.applyForce(windForce, particle.getAbsolutePosition());
            }
        });
    }

    clearWeatherEffects() {
        this.weatherParticles.forEach(particle => {
            if (particle && !particle.isDisposed()) {
                particle.dispose();
            }
        });
        this.weatherParticles = [];
    }

    getWeatherName(weatherType) {
        const names = {
            'sunny': 'آفتابی',
            'rainy': 'بارانی', 
            'stormy': 'طوفانی',
            'snowy': 'برفی'
        };
        return names[weatherType] || weatherType;
    }

    update() {
        // به‌روزرسانی ذرات آب و هوا
        this.weatherParticles.forEach((particle, index) => {
            if (particle.position.y < 0) {
                // بازسازی ذره
                particle.position.y = 50 + Math.random() * 20;
                particle.position.x = (Math.random() - 0.5) * 200;
                particle.position.z = (Math.random() - 0.5) * 200;
            }
        });
    }
}

// سیستم چرخه روز و شب
class DayNightCycle {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.timeOfDay = 12; // ساعت 12 ظهر
        this.timeSpeed = 60; // 1 ساعت بازی = 60 ثانیه واقعی
        this.isNight = false;
        this.nightLights = [];
    }

    async init() {
        console.log("🌙 راه‌اندازی سیستم روز و شب...");
        
        this.setupNightLighting();
        this.startTimeCycle();
        
        return this;
    }

    setupNightLighting() {
        // نورهای شب برای ساختمان‌ها
        this.createBuildingNightLights();
    }

    createBuildingNightLights() {
        // ایجاد نور برای ساختمان‌ها در شب
        const buildings = [
            ...this.gameEngine.tribeLayout.buildings,
            ...this.gameEngine.tribeLayout.barracks
        ];

        buildings.forEach(building => {
            if (building.mesh) {
                const nightLight = new BABYLON.PointLight(
                    `nightLight_${building.type}`,
                    building.mesh.position.add(new BABYLON.Vector3(0, 3, 0)),
                    this.gameEngine.scene
                );
                nightLight.intensity = 0;
                nightLight.range = 8;
                nightLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
                
                this.nightLights.push({
                    light: nightLight,
                    building: building
                });
            }
        });
    }

    startTimeCycle() {
        // به‌روزرسانی زمان هر ثانیه
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    updateTime() {
        // پیشرفت زمان
        this.timeOfDay += (1 / this.timeSpeed);
        if (this.timeOfDay >= 24) {
            this.timeOfDay = 0;
        }

        this.updateLighting();
        this.updateNightLights();
        this.checkTimeBasedEvents();
    }

    updateLighting() {
        if (!this.gameEngine.mainLight) return;

        const hour = this.timeOfDay;
        let lightIntensity = 0;
        let lightColor = new BABYLON.Color3(1, 1, 1);

        if (hour >= 6 && hour <= 18) {
            // روز
            const progress = (hour - 6) / 12;
            lightIntensity = 0.3 + 0.9 * Math.sin(progress * Math.PI);
            lightColor = new BABYLON.Color3(1, 0.9 + 0.1 * Math.sin(progress * Math.PI), 0.8);
            this.isNight = false;
        } else {
            // شب
            lightIntensity = 0.1;
            lightColor = new BABYLON.Color3(0.3, 0.4, 0.8);
            this.isNight = true;
        }

        this.gameEngine.mainLight.intensity = lightIntensity;
        this.gameEngine.mainLight.diffuse = lightColor;

        // به‌روزرسانی نور محیطی
        if (this.gameEngine.ambientLight) {
            this.gameEngine.ambientLight.intensity = lightIntensity * 0.3;
        }
    }

    updateNightLights() {
        const nightLightIntensity = this.isNight ? 0.8 : 0;
        
        this.nightLights.forEach(nightLight => {
            if (nightLight.light) {
                nightLight.light.intensity = nightLightIntensity;
            }
        });
    }

    checkTimeBasedEvents() {
        const hour = Math.floor(this.timeOfDay);
        
        // رویدادهای خاص در ساعات مشخص
        switch (hour) {
            case 6: // طلوع آفتاب
                if (!this.isNight) {
                    this.gameEngine.showNotification("☀️ طلوع آفتاب - روز جدید آغاز شد!");
                }
                break;
            case 18: // غروب آفتاب
                if (this.isNight) {
                    this.gameEngine.showNotification("🌙 غروب آفتاب - شب شد، مراقب باشید!");
                }
                break;
            case 0: // نیمه شب
                this.gameEngine.showNotification("🌚 نیمه شب - موجودات شبانه فعال شدند!");
                this.spawnNightCreatures();
                break;
        }
    }

    spawnNightCreatures() {
        if (this.isNight) {
            // ایجاد موجودات شبانه
            const creatureCount = 2 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < creatureCount; i++) {
                this.spawnNightCreature();
            }
        }
    }

    spawnNightCreature() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 70;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        const creatureTypes = ['bat', 'wolf', 'ghost'];
        const creatureType = creatureTypes[Math.floor(Math.random() * creatureTypes.length)];
        
        const creature = this.createNightCreature(creatureType, x, z);
        if (creature) {
            this.gameEngine.enemies.push(creature);
        }
    }

    createNightCreature(type, x, z) {
        if (!this.gameEngine.scene) return null;

        try {
            let creatureMesh;
            const position = new BABYLON.Vector3(x, 2, z);

            switch (type) {
                case 'bat':
                    creatureMesh = this.createBat(position);
                    break;
                case 'wolf':
                    creatureMesh = this.createWolf(position);
                    break;
                case 'ghost':
                    creatureMesh = this.createGhost(position);
                    break;
            }

            if (!creatureMesh) return null;

            return {
                mesh: creatureMesh,
                type: type,
                health: this.getNightCreatureHealth(type),
                maxHealth: this.getNightCreatureHealth(type),
                damage: this.getNightCreatureDamage(type),
                speed: this.getNightCreatureSpeed(type),
                range: this.getNightCreatureRange(type),
                attackSpeed: 1500,
                lastAttack: 0,
                state: 'moving',
                target: null,
                isNightCreature: true
            };
        } catch (error) {
            console.error("❌ خطا در ایجاد موجود شبانه:", error);
            return null;
        }
    }

    createBat(position) {
        const body = BABYLON.MeshBuilder.CreateSphere("batBody", {
            diameter: 0.8,
            segments: 8
        }, this.gameEngine.scene);

        const wing1 = BABYLON.MeshBuilder.CreateBox("batWing1", {
            width: 0.1,
            height: 0.8,
            depth: 1.5
        }, this.gameEngine.scene);
        wing1.position.x = 0.5;
        wing1.rotation.z = Math.PI / 4;

        const wing2 = BABYLON.MeshBuilder.CreateBox("batWing2", {
            width: 0.1,
            height: 0.8,
            depth: 1.5
        }, this.gameEngine.scene);
        wing2.position.x = -0.5;
        wing2.rotation.z = -Math.PI / 4;

        const bat = BABYLON.Mesh.MergeMeshes([body, wing1, wing2], true);
        if (!bat) return null;

        bat.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("batMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        bat.material = material;

        return bat;
    }

    createWolf(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder("wolfBody", {
            diameter: 0.6,
            height: 1.2,
            tessellation: 8
        }, this.gameEngine.scene);

        const head = BABYLON.MeshBuilder.CreateSphere("wolfHead", {
            diameter: 0.5,
            segments: 8
        }, this.gameEngine.scene);
        head.position.y = 0.8;
        head.position.z = 0.3;

        const wolf = BABYLON.Mesh.MergeMeshes([body, head], true);
        if (!wolf) return null;

        wolf.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("wolfMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
        wolf.material = material;

        return wolf;
    }

    createGhost(position) {
        const ghost = BABYLON.MeshBuilder.CreateSphere("ghost", {
            diameter: 1.2,
            segments: 8
        }, this.gameEngine.scene);

        ghost.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("ghostMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1);
        material.alpha = 0.6;
        material.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.5);
        ghost.material = material;

        return ghost;
    }

    getNightCreatureHealth(type) {
        const health = {
            'bat': 40,
            'wolf': 80,
            'ghost': 60
        };
        return health[type] || 50;
    }

    getNightCreatureDamage(type) {
        const damage = {
            'bat': 15,
            'wolf': 25,
            'ghost': 20
        };
        return damage[type] || 15;
    }

    getNightCreatureSpeed(type) {
        const speed = {
            'bat': 2.0,
            'wolf': 1.5,
            'ghost': 1.2
        };
        return speed[type] || 1.0;
    }

    getNightCreatureRange(type) {
        const range = {
            'bat': 2.0,
            'wolf': 1.8,
            'ghost': 2.2
        };
        return range[type] || 2.0;
    }

    getCurrentTimeString() {
        const hour = Math.floor(this.timeOfDay);
        const minute = Math.floor((this.timeOfDay - hour) * 60);
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
}

// سیستم اقتصاد پیشرفته
class EconomySystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.marketPrices = {};
        this.tradeRoutes = [];
        this.taxRate = 0.1; // 10% tax
        this.inflation = 0;
    }

    async init() {
        console.log("💰 راه‌اندازی سیستم اقتصاد...");
        
        this.setupMarketPrices();
        this.startMarketFluctuation();
        
        return this;
    }

    setupMarketPrices() {
        this.marketPrices = {
            gold: { base: 1, current: 1, fluctuation: 0.1 },
            elixir: { base: 2, current: 2, fluctuation: 0.15 },
            wood: { base: 0.5, current: 0.5, fluctuation: 0.2 },
            stone: { base: 0.8, current: 0.8, fluctuation: 0.18 }
        };
    }

    startMarketFluctuation() {
        // نوسان قیمت‌ها هر 30 ثانیه
        setInterval(() => {
            this.fluctuatePrices();
        }, 30000);
    }

    fluctuatePrices() {
        Object.keys(this.marketPrices).forEach(resource => {
            const priceData = this.marketPrices[resource];
            const change = (Math.random() - 0.5) * 2 * priceData.fluctuation;
            priceData.current = Math.max(0.1, priceData.base + change);
        });

        console.log("📈 نوسان قیمت‌های بازار:", this.marketPrices);
    }

    calculateBuildingCost(buildingType) {
        const baseCost = this.gameEngine.getBuildingData(buildingType).cost;
        const adjustedCost = {
            gold: Math.floor(baseCost.gold * this.marketPrices.gold.current),
            elixir: Math.floor(baseCost.elixir * this.marketPrices.elixir.current)
        };

        return adjustedCost;
    }

    calculateTax(amount) {
        return Math.floor(amount * this.taxRate);
    }

    applyTax() {
        const taxAmount = this.calculateTax(this.gameEngine.resources.gold);
        this.gameEngine.resources.gold -= taxAmount;
        
        this.gameEngine.showNotification(`💰 مالیات: ${taxAmount} طلا کسر شد`);
        return taxAmount;
    }

    // سیستم تجارت بین قبیله‌ها
    createTradeRoute(targetTribe, resourceType, amount, price) {
        const tradeRoute = {
            id: Date.now(),
            targetTribe: targetTribe,
            resourceType: resourceType,
            amount: amount,
            price: price,
            progress: 0,
            completed: false
        };

        this.tradeRoutes.push(tradeRoute);
        return tradeRoute;
    }

    updateTradeRoutes() {
        this.tradeRoutes.forEach((route, index) => {
            if (!route.completed) {
                route.progress += 0.01;
                
                if (route.progress >= 1) {
                    this.completeTradeRoute(route);
                    this.tradeRoutes.splice(index, 1);
                }
            }
        });
    }

    completeTradeRoute(route) {
        const totalValue = route.amount * route.price;
        
        // کسر منابع و اضافه کردن سود
        this.gameEngine.resources[route.resourceType] -= route.amount;
        this.gameEngine.resources.gold += totalValue;
        
        this.gameEngine.showNotification(
            `💰 تجارت با ${route.targetTribe} تکمیل شد: +${totalValue} طلا`
        );
    }

    // سیستم وام و بانک
    offerLoan(amount, interestRate, duration) {
        const totalRepayment = amount * (1 + interestRate);
        
        return {
            amount: amount,
            interestRate: interestRate,
            duration: duration,
            totalRepayment: totalRepayment,
            issuedAt: Date.now()
        };
    }
}

// سیستم تحقیقات و فناوری
class ResearchSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.researchQueue = [];
        this.completedResearch = [];
        this.availableResearch = this.initializeResearchOptions();
    }

    initializeResearchOptions() {
        return {
            // تحقیقات نظامی
            'advanced_weapons': {
                name: 'سلاح‌های پیشرفته',
                description: 'افزایش 20% آسیب واحدها',
                cost: { gold: 1000, elixir: 500 },
                duration: 60, // ثانیه
                effect: () => this.applyAdvancedWeapons()
            },
            'stronger_walls': {
                name: 'دیوارهای مستحکم',
                description: 'افزایش 50% سلامت دیوارها',
                cost: { gold: 800, elixir: 300 },
                duration: 45,
                effect: () => this.applyStrongerWalls()
            },
            
            // تحقیقات اقتصادی
            'efficient_mining': {
                name: 'استخراج کارآمد',
                description: 'افزایش 30% تولید معادن',
                cost: { gold: 1200, elixir: 400 },
                duration: 75,
                effect: () => this.applyEfficientMining()
            },
            
            // تحقیقات پیشرفته
            'magic_technology': {
                name: 'فناوری جادویی',
                description: 'قفل‌گشایی واحدهای جادویی',
                cost: { gold: 2000, elixir: 1500 },
                duration: 120,
                effect: () => this.unlockMagicUnits()
            }
        };
    }

    startResearch(researchId) {
        const research = this.availableResearch[researchId];
        
        if (!research) {
            this.gameEngine.showNotification('تحقیق یافت نشد!', 'error');
            return false;
        }

        if (this.completedResearch.includes(researchId)) {
            this.gameEngine.showNotification('این تحقیق قبلاً انجام شده!', 'error');
            return false;
        }

        // بررسی منابع
        if (!this.gameEngine.hasEnoughResources(research.cost)) {
            this.gameEngine.showNotification('منابع کافی برای تحقیق نیست!', 'error');
            return false;
        }

        // کسر منابع
        this.gameEngine.deductResources(research.cost);

        // اضافه به صف تحقیقات
        this.researchQueue.push({
            id: researchId,
            ...research,
            startTime: Date.now(),
            progress: 0
        });

        this.gameEngine.showNotification(`🔬 تحقیق "${research.name}" آغاز شد!`);
        return true;
    }

    updateResearch() {
        this.researchQueue.forEach((research, index) => {
            const elapsed = (Date.now() - research.startTime) / 1000;
            research.progress = elapsed / research.duration;

            if (research.progress >= 1) {
                this.completeResearch(research);
                this.researchQueue.splice(index, 1);
            }
        });
    }

    completeResearch(research) {
        // اعمال اثر تحقیق
        research.effect();
        
        // اضافه به تحقیقات تکمیل شده
        this.completedResearch.push(research.id);
        
        this.gameEngine.showNotification(
            `🎓 تحقیق "${research.name}" تکمیل شد!`,
            'success'
        );
    }

    applyAdvancedWeapons() {
        // افزایش آسیب تمام واحدها
        this.gameEngine.units.forEach(unit => {
            unit.damage = Math.floor(unit.damage * 1.2);
        });
    }

    applyStrongerWalls() {
        // افزایش سلامت دیوارها
        this.gameEngine.tribeLayout.walls.forEach(wall => {
            wall.maxHealth = Math.floor(wall.maxHealth * 1.5);
            wall.health = wall.maxHealth;
        });
    }

    applyEfficientMining() {
        // افزایش تولید معادن
        this.gameEngine.tribeLayout.resources.forEach(resource => {
            if (resource.productionRate) {
                resource.productionRate = Math.floor(resource.productionRate * 1.3);
            }
        });
    }

    unlockMagicUnits() {
        // قفل‌گشایی واحدهای جادویی
        this.gameEngine.showNotification('🧙 واحدهای جادویی قفل‌گشایی شدند!');
    }

    getResearchProgress(researchId) {
        const research = this.researchQueue.find(r => r.id === researchId);
        return research ? research.progress : 0;
    }
}

// سیستم مأموریت‌ها و چالش‌ها
class QuestSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.activeQuests = [];
        this.completedQuests = [];
        this.dailyQuests = [];
        this.achievementQuests = [];
        
        this.initializeQuests();
    }

    initializeQuests() {
        // مأموریت‌های روزانه
        this.dailyQuests = [
            {
                id: 'daily_build',
                title: 'سازنده روز',
                description: '3 ساختمان جدید بساز',
                reward: { gold: 200, elixir: 100 },
                condition: (game) => game.stats.buildingsBuilt >= 3,
                progress: (game) => game.stats.buildingsBuilt
            },
            {
                id: 'daily_train',
                title: 'فرمانده واحدها',
                description: '5 واحد آموزش بده',
                reward: { gold: 150, elixir: 200 },
                condition: (game) => game.stats.unitsTrained >= 5,
                progress: (game) => game.stats.unitsTrained
            },
            {
                id: 'daily_battle',
                title: 'مدافع قبیله',
                description: '3 نبرد برنده شو',
                reward: { gold: 300, elixir: 150 },
                condition: (game) => game.stats.battlesWon >= 3,
                progress: (game) => game.stats.battlesWon
            }
        ];

        // مأموریت‌های پیشرفت
        this.achievementQuests = [
            {
                id: 'achieve_builder',
                title: 'استاد سازنده',
                description: '20 ساختمان بساز',
                reward: { gold: 1000, elixir: 500 },
                condition: (game) => game.stats.buildingsBuilt >= 20
            },
            {
                id: 'achieve_commander', 
                title: 'فرمانده بزرگ',
                description: '50 واحد آموزش بده',
                reward: { gold: 1500, elixir: 800 },
                condition: (game) => game.stats.unitsTrained >= 50
            },
            {
                id: 'achieve_defender',
                title: 'مدافع بی‌همتا',
                description: '25 نبرد برنده شو',
                reward: { gold: 2000, elixir: 1000 },
                condition: (game) => game.stats.battlesWon >= 25
            }
        ];

        this.generateDailyQuests();
    }

    generateDailyQuests() {
        this.activeQuests = [...this.dailyQuests];
        console.log("📋 مأموریت‌های روزانه تولید شدند");
    }

    updateQuests() {
        // بررسی مأموریت‌های فعال
        this.activeQuests.forEach((quest, index) => {
            if (quest.condition(this.gameEngine)) {
                this.completeQuest(quest);
                this.activeQuests.splice(index, 1);
            }
        });

        // بررسی مأموریت‌های پیشرفت
        this.achievementQuests.forEach((quest, index) => {
            if (!this.completedQuests.includes(quest.id) && 
                quest.condition(this.gameEngine)) {
                this.completeQuest(quest);
                this.achievementQuests.splice(index, 1);
            }
        });
    }

    completeQuest(quest) {
        // اعمال پاداش
        this.gameEngine.resources.gold += quest.reward.gold;
        this.gameEngine.resources.elixir += quest.reward.elixir;

        // اضافه به مأموریت‌های تکمیل شده
        this.completedQuests.push(quest.id);

        this.gameEngine.showNotification(
            `🏆 مأموریت "${quest.title}" تکمیل شد! پاداش: ${quest.reward.gold} طلا، ${quest.reward.elixir} اکسیر`,
            'success'
        );

        this.gameEngine.updateResourceUI();
    }

    getQuestProgress(questId) {
        const quest = this.activeQuests.find(q => q.id === questId);
        if (quest && quest.progress) {
            return quest.progress(this.gameEngine);
        }
        return 0;
    }

    getActiveQuests() {
        return this.activeQuests.map(quest => ({
            ...quest,
            progress: this.getQuestProgress(quest.id)
        }));
    }
}

// سیستم چندنفره (پایه)
class MultiplayerSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isConnected = false;
        this.players = [];
        this.chatMessages = [];
    }

    async init() {
        console.log("🌐 راه‌اندازی سیستم چندنفره...");
        
        // این سیستم می‌تواند به سرور واقعی متصل شود
        this.simulateMultiplayer();
        
        return this;
    }

    simulateMultiplayer() {
        // شبیه‌سازی بازیکنان آنلاین
        setInterval(() => {
            this.updateOnlinePlayers();
        }, 30000);
    }

    updateOnlinePlayers() {
        // شبیه‌سازی بازیکنان آنلاین تصادفی
        const onlineCount = 50 + Math.floor(Math.random() * 150);
        this.players = Array.from({ length: onlineCount }, (_, i) => ({
            id: i + 1,
            name: `بازیکن${i + 1}`,
            level: Math.floor(Math.random() * 50) + 1,
            tribe: `قبیله${Math.floor(Math.random() * 100) + 1}`,
            isOnline: true
        }));

        console.log(`👥 ${onlineCount} بازیکن آنلاین`);
    }

    sendChatMessage(message) {
        const chatMessage = {
            player: 'شما',
            message: message,
            timestamp: Date.now()
        };

        this.chatMessages.push(chatMessage);
        
        // شبیه‌سازی پاسخ دیگر بازیکنان
        setTimeout(() => {
            this.receiveChatMessage();
        }, 2000 + Math.random() * 3000);
    }

    receiveChatMessage() {
        const randomPlayers = ['فرمانده', 'پهلوان', 'سردار', 'راهبر'];
        const randomMessages = [
            'سلام! قبیله قوی‌ای داری!',
            'می‌خوای با هم متحد بشیم؟',
            'حمله‌ات عالی بود!',
            'منابع اضافه داری؟ مبادله کنیم؟',
            'چه ساختمان‌های جالبی ساخته‌ای!'
        ];

        const randomPlayer = randomPlayers[Math.floor(Math.random() * randomPlayers.length)];
        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];

        this.chatMessages.push({
            player: randomPlayer,
            message: randomMessage,
            timestamp: Date.now()
        });

        // نمایش نوتیفیکیشن چت
        this.gameEngine.showNotification(`💬 ${randomPlayer}: ${randomMessage}`);
    }

    getOnlinePlayers() {
        return this.players.filter(player => player.isOnline);
    }

    // سیستم اتحاد و قبیله‌ها
    createAlliance(allianceName, players) {
        const alliance = {
            name: allianceName,
            members: players,
            created: Date.now(),
            level: 1
        };

        console.log(`🤝 اتحاد "${allianceName}" ایجاد شد`);
        return alliance;
    }
}

// سیستم صدا و موسیقی
class SoundSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.sounds = {};
        this.music = {};
        this.isMuted = false;
        this.currentMusic = null;
    }

    async init() {
        console.log("🔊 راه‌اندازی سیستم صدا...");
        
        this.setupSounds();
        this.playBackgroundMusic();
        
        return this;
    }

    setupSounds() {
        // اینجا می‌توان فایل‌های صوتی واقعی بارگذاری کرد
        this.sounds = {
            'click': { volume: 0.3 },
            'build': { volume: 0.5 },
            'attack': { volume: 0.7 },
            'explosion': { volume: 0.8 },
            'notification': { volume: 0.4 },
            'thunder': { volume: 0.9 }
        };

        this.music = {
            'background': { volume: 0.3, loop: true },
            'battle': { volume: 0.4, loop: true },
            'peaceful': { volume: 0.3, loop: true }
        };
    }

    playSound(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;

        console.log(`🔊 پخش صدا: ${soundName}`);
        
        // در نسخه واقعی، اینجا فایل صوتی پخش می‌شود
        // new Audio(`sounds/${soundName}.mp3`).play();
    }

    playWeatherSound(weatherType) {
        const weatherSounds = {
            'rainy': 'rain',
            'stormy': 'thunder',
            'snowy': 'wind'
        };

        if (weatherSounds[weatherType]) {
            this.playSound(weatherSounds[weatherType]);
        }
    }

    playBackgroundMusic() {
        if (this.isMuted) return;

        console.log("🎵 پخش موسیقی زمینه...");
        this.currentMusic = 'background';
        
        // در نسخه واقعی:
        // this.backgroundAudio = new Audio('music/background.mp3');
        // this.backgroundAudio.loop = true;
        // this.backgroundAudio.volume = 0.3;
        // this.backgroundAudio.play();
    }

    playBattleMusic() {
        if (this.isMuted) return;

        console.log("🎵 پخش موسیقی نبرد...");
        this.currentMusic = 'battle';
    }

    playPeacefulMusic() {
        if (this.isMuted) return;

        console.log("🎵 پخش موسیقی آرام...");
        this.currentMusic = 'peaceful';
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            console.log("🔇 صدا خاموش شد");
        } else {
            console.log("🔊 صدا روشن شد");
            this.playBackgroundMusic();
        }

        return this.isMuted;
    }

    setVolume(volume) {
        // تنظیم حجم صدا
        Object.keys(this.sounds).forEach(sound => {
            this.sounds[sound].volume = volume;
        });

        Object.keys(this.music).forEach(music => {
            this.music[music].volume = volume;
        });
    }
}

// سیستم ذرات و جلوه‌های بصری
class ParticleSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.particleEmitters = [];
        this.specialEffects = {};
    }

    async init() {
        console.log("✨ راه‌اندازی سیستم ذرات...");
        
        this.setupSpecialEffects();
        
        return this;
    }

    setupSpecialEffects() {
        // ایجاد متریال‌های ویژه برای جلوه‌ها
        this.specialEffects.materials = {
            fire: this.createFireMaterial(),
            magic: this.createMagicMaterial(),
            smoke: this.createSmokeMaterial(),
            glow: this.createGlowMaterial()
        };
    }

    createFireMaterial() {
        const material = new BABYLON.StandardMaterial("fireMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.3, 0);
        material.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        material.alpha = 0.8;
        return material;
    }

    createMagicMaterial() {
        const material = new BABYLON.StandardMaterial("magicMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0, 1);
        material.emissiveColor = new BABYLON.Color3(0.7, 0.3, 1);
        material.alpha = 0.7;
        return material;
    }

    createSmokeMaterial() {
        const material = new BABYLON.StandardMaterial("smokeMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        material.alpha = 0.5;
        return material;
    }

    createGlowMaterial() {
        const material = new BABYLON.StandardMaterial("glowMaterial", this.gameEngine.scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 0.8);
        material.emissiveColor = new BABYLON.Color3(1, 1, 0.3);
        material.alpha = 0.9;
        return material;
    }

    createFireEffect(position, intensity = 1) {
        const particleCount = Math.floor(20 * intensity);
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = BABYLON.MeshBuilder.CreateSphere("fireParticle", {
                diameter: 0.1 + Math.random() * 0.2
            }, this.gameEngine.scene);

            particle.position.copyFrom(position);
            particle.position.y += Math.random() * 2;
            particle.material = this.specialEffects.materials.fire;

            particles.push(particle);
        }

        const emitter = {
            type: 'fire',
            particles: particles,
            position: position,
            intensity: intensity,
            startTime: Date.now()
        };

        this.particleEmitters.push(emitter);
        return emitter;
    }

    createMagicEffect(position, color = 'purple') {
        const particles = [];
        const ringCount = 3;

        for (let ring = 0; ring < ringCount; ring++) {
            const ringParticles = 8;
            const radius = 0.5 + ring * 0.3;

            for (let i = 0; i < ringParticles; i++) {
                const angle = (i / ringParticles) * Math.PI * 2;
                const particle = BABYLON.MeshBuilder.CreateSphere("magicParticle", {
                    diameter: 0.1
                }, this.gameEngine.scene);

                particle.position.x = position.x + Math.cos(angle) * radius;
                particle.position.y = position.y + 0.5;
                particle.position.z = position.z + Math.sin(angle) * radius;
                particle.material = this.specialEffects.materials.magic;

                particles.push(particle);
            }
        }

        const emitter = {
            type: 'magic',
            particles: particles,
            position: position,
            startTime: Date.now()
        };

        this.particleEmitters.push(emitter);
        return emitter;
    }

    updateParticles() {
        const currentTime = Date.now();

        this.particleEmitters.forEach((emitter, index) => {
            const age = (currentTime - emitter.startTime) / 1000;

            switch (emitter.type) {
                case 'fire':
                    this.updateFireParticles(emitter, age);
                    break;
                case 'magic':
                    this.updateMagicParticles(emitter, age);
                    break;
            }

            // حذف emitterهای قدیمی
            if (age > 5) { // 5 ثانیه
                this.removeEmitter(index);
            }
        });
    }

    updateFireParticles(emitter, age) {
        emitter.particles.forEach((particle, pIndex) => {
            if (particle.isDisposed()) return;

            // حرکت ذرات آتش به بالا
            particle.position.y += 0.02;
            
            // نوسان جانبی
            particle.position.x += (Math.random() - 0.5) * 0.01;
            particle.position.z += (Math.random() - 0.5) * 0.01;

            // محو شدن
            const life = 1 - (age / 5);
            if (particle.material) {
                particle.material.alpha = life * 0.8;
            }

            // حذف ذرات قدیمی
            if (life <= 0) {
                particle.dispose();
                emitter.particles.splice(pIndex, 1);
            }
        });
    }

    updateMagicParticles(emitter, age) {
        emitter.particles.forEach((particle, pIndex) => {
            if (particle.isDisposed()) return;

            // چرخش ذرات جادویی
            const angle = age * 2 + (pIndex / emitter.particles.length) * Math.PI * 2;
            const radius = 0.5 + Math.sin(age * 3) * 0.2;

            particle.position.x = emitter.position.x + Math.cos(angle) * radius;
            particle.position.z = emitter.position.z + Math.sin(angle) * radius;
            particle.position.y = emitter.position.y + 0.5 + Math.sin(age * 4) * 0.1;

            // درخشش
            const glow = 0.5 + Math.sin(age * 5) * 0.3;
            if (particle.material) {
                particle.material.alpha = glow * 0.7;
            }
        });
    }

    removeEmitter(index) {
        const emitter = this.particleEmitters[index];
        if (emitter) {
            emitter.particles.forEach(particle => {
                if (!particle.isDisposed()) {
                    particle.dispose();
                }
            });
            this.particleEmitters.splice(index, 1);
        }
    }

    createBuildingConstructionEffect(position, buildingType) {
        // جلوه ویژه هنگام ساخت ساختمان
        this.createMagicEffect(position);
        this.createFireEffect(position, 0.5);
        
        this.gameEngine.soundSystem.playSound('build');
    }

    createUnitTrainingEffect(position, unitType) {
        // جلوه ویژه هنگام آموزش واحد
        this.createMagicEffect(position);
        
        this.gameEngine.soundSystem.playSound('build');
    }
}

// راه‌اندازی سیستم‌های پیشرفته
if (window.gameEngine) {
    window.advancedSystems = new AdvancedGameSystems(window.gameEngine);
    
    // اضافه کردن متدهای جدید به موتور اصلی
    window.gameEngine.advancedSystems = window.advancedSystems;
    
    // گسترش متد update اصلی برای شامل کردن سیستم‌های جدید
    const originalUpdate = window.gameEngine.update;
    window.gameEngine.update = function() {
        if (originalUpdate) {
            originalUpdate.call(this);
        }
        
        // به‌روزرسانی سیستم‌های پیشرفته
        if (this.advancedSystems) {
            this.advancedSystems.weatherSystem.update();
            this.advancedSystems.dayNightCycle.updateTime();
            this.advancedSystems.economySystem.updateTradeRoutes();
            this.advancedSystems.researchSystem.updateResearch();
            this.advancedSystems.questSystem.updateQuests();
            this.advancedSystems.particleSystem.updateParticles();
        }
    };
}

console.log("✅ m2.js - سیستم‌های پیشرفته بارگذاری شد");

// صادر کردن کلاس‌ها برای استفاده در فایل‌های دیگر
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdvancedGameSystems,
        WeatherSystem,
        DayNightCycle,
        EconomySystem,
        ResearchSystem,
        QuestSystem,
        MultiplayerSystem,
        SoundSystem,
        ParticleSystem
    };
  }
