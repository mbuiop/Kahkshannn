// m3.js - سیستم انیمیشن و افکت‌های پیشرفته
// ===============================================

class AdvancedAnimationManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        
        // سیستم‌های انیمیشن پیشرفته
        this.animations = new Map();
        this.particleSystems = new Map();
        this.soundSystem = new SoundSystem();
        this.lightEffects = new Map();
        this.specialEffects = new Map();
        
        // انیمیشن‌های فعال
        this.activeAnimations = new Set();
        this.animationGroups = new Map();
        
        // سیستم زمان‌بندی
        this.timelineManager = new TimelineManager();
        this.transitionManager = new TransitionManager();
        
        this.init();
    }
    
    async init() {
        try {
            await this.setupAnimationSystems();
            await this.createBuildingAnimations();
            await this.createUnitAnimations();
            await this.createBattleAnimations();
            await this.createEnvironmentAnimations();
            await this.createParticleSystems();
            await this.createLightEffects();
            await this.createSpecialEffects();
            await this.setupEventListeners();
            
            console.log("✅ سیستم انیمیشن و افکت‌های پیشرفته راه‌اندازی شد");
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی سیستم انیمیشن:", error);
        }
    }
    
    async setupAnimationSystems() {
        // راه‌اندازی سیستم‌های پیشرفته انیمیشن
        this.animationMixer = new BABYLON.AnimationGroupMixer(this.scene);
        this.skeletonManager = new BABYLON.SkeletonManager(this.scene);
        
        // تنظیمات بهینه‌سازی
        this.setupPerformanceOptimization();
    }
    
    setupPerformanceOptimization() {
        // بهینه‌سازی عملکرد برای موبایل
        this.scene.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
        this.scene.animationPropertiesOverride.enableBlending = true;
        this.scene.animationPropertiesOverride.blendingSpeed = 0.05;
        
        console.log("✅ بهینه‌سازی انیمیشن برای موبایل فعال شد");
    }
    
    async createBuildingAnimations() {
        // انیمیشن ساخت ساختمان‌های جدید
        await this.createTownHallAnimations();
        await this.createBarracksAnimations();
        await this.createDefenseAnimations();
        await this.createResourceAnimations();
        await this.createWallAnimations();
    }
    
    async createTownHallAnimations() {
        const buildAnimation = new BABYLON.Animation(
            "townHallBuild",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const buildKeys = [
            { frame: 0, value: new BABYLON.Vector3(0.1, 0.1, 0.1) },
            { frame: 20, value: new BABYLON.Vector3(1.3, 1.3, 1.3) },
            { frame: 40, value: new BABYLON.Vector3(0.9, 0.9, 0.9) },
            { frame: 60, value: new BABYLON.Vector3(1.0, 1.0, 1.0) }
        ];
        
        buildAnimation.setKeys(buildKeys);
        this.animations.set("townhall_build", buildAnimation);
        
        // انیمیشن تولید منابع
        const productionAnimation = new BABYLON.Animation(
            "townHallProduction",
            "rotation.y",
            120,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const productionKeys = [
            { frame: 0, value: 0 },
            { frame: 120, value: Math.PI * 2 }
        ];
        
        productionAnimation.setKeys(productionKeys);
        this.animations.set("townhall_production", productionAnimation);
    }
    
    async createBarracksAnimations() {
        const buildAnimation = new BABYLON.Animation(
            "barracksBuild",
            "position.y",
            45,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const buildKeys = [
            { frame: 0, value: -5 },
            { frame: 15, value: 1 },
            { frame: 30, value: -0.5 },
            { frame: 45, value: 0 }
        ];
        
        buildAnimation.setKeys(buildKeys);
        this.animations.set("barracks_build", buildAnimation);
        
        // انیمیشن پرچم
        const flagAnimation = new BABYLON.Animation(
            "flagWave",
            "rotation.z",
            90,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const flagKeys = [
            { frame: 0, value: -0.1 },
            { frame: 45, value: 0.1 },
            { frame: 90, value: -0.1 }
        ];
        
        flagAnimation.setKeys(flagKeys);
        this.animations.set("flag_wave", flagAnimation);
    }
    
    async createDefenseAnimations() {
        // انیمیشن توپخانه
        const cannonRotate = new BABYLON.Animation(
            "cannonRotate",
            "rotation.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const cannonKeys = [
            { frame: 0, value: 0 },
            { frame: 15, value: 0.5 },
            { frame: 30, value: 0 }
        ];
        
        cannonRotate.setKeys(cannonKeys);
        this.animations.set("cannon_rotate", cannonRotate);
        
        // انیمیشن شلیک
        const cannonRecoil = new BABYLON.Animation(
            "cannonRecoil",
            "position.z",
            10,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const recoilKeys = [
            { frame: 0, value: 0 },
            { frame: 5, value: -0.3 },
            { frame: 10, value: 0 }
        ];
        
        cannonRecoil.setKeys(recoilKeys);
        this.animations.set("cannon_recoil", cannonRecoil);
    }
    
    async createResourceAnimations() {
        // انیمیشن معدن طلا
        const mineProduction = new BABYLON.Animation(
            "mineProduction",
            "rotation.y",
            180,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const mineKeys = [
            { frame: 0, value: 0 },
            { frame: 180, value: Math.PI * 2 }
        ];
        
        mineProduction.setKeys(mineKeys);
        this.animations.set("mine_production", mineProduction);
        
        // انیمیشن کارخانه اکسیر
        const factoryPulse = new BABYLON.Animation(
            "factoryPulse",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const factoryKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 30, value: new BABYLON.Vector3(1.05, 1.05, 1.05) },
            { frame: 60, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        
        factoryPulse.setKeys(factoryKeys);
        this.animations.set("factory_pulse", factoryPulse);
    }
    
    async createWallAnimations() {
        const wallBuild = new BABYLON.Animation(
            "wallBuild",
            "scaling.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const wallKeys = [
            { frame: 0, value: 0.1 },
            { frame: 15, value: 1.2 },
            { frame: 30, value: 1.0 }
        ];
        
        wallBuild.setKeys(wallKeys);
        this.animations.set("wall_build", wallBuild);
        
        // انیمیشن آسیب دیوار
        const wallDamage = new BABYLON.Animation(
            "wallDamage",
            "position",
            20,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const damageKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 5, value: new BABYLON.Vector3(0.2, 0, 0) },
            { frame: 10, value: new BABYLON.Vector3(-0.1, 0, 0) },
            { frame: 15, value: new BABYLON.Vector3(0.1, 0, 0) },
            { frame: 20, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        
        wallDamage.setKeys(damageKeys);
        this.animations.set("wall_damage", wallDamage);
    }
    
    async createUnitAnimations() {
        await this.createSoldierAnimations();
        await this.createArcherAnimations();
        await this.createGiantAnimations();
        await this.createDragonAnimations();
        await this.createEnemyAnimations();
    }
    
    async createSoldierAnimations() {
        // انیمیشن راه رفتن
        const walkAnimation = new BABYLON.Animation(
            "soldierWalk",
            "position.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const walkKeys = [
            { frame: 0, value: 0 },
            { frame: 15, value: 0.2 },
            { frame: 30, value: 0 }
        ];
        
        walkAnimation.setKeys(walkKeys);
        this.animations.set("soldier_walk", walkAnimation);
        
        // انیمیشن حمله
        const attackAnimation = new BABYLON.Animation(
            "soldierAttack",
            "rotation.x",
            20,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const attackKeys = [
            { frame: 0, value: 0 },
            { frame: 10, value: -0.3 },
            { frame: 20, value: 0 }
        ];
        
        attackAnimation.setKeys(attackKeys);
        this.animations.set("soldier_attack", attackAnimation);
    }
    
    async createArcherAnimations() {
        const walkAnimation = new BABYLON.Animation(
            "archerWalk",
            "position.y",
            25,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const walkKeys = [
            { frame: 0, value: 0 },
            { frame: 12, value: 0.15 },
            { frame: 25, value: 0 }
        ];
        
        walkAnimation.setKeys(walkKeys);
        this.animations.set("archer_walk", walkAnimation);
    }
    
    async createGiantAnimations() {
        const walkAnimation = new BABYLON.Animation(
            "giantWalk",
            "position.y",
            40,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const walkKeys = [
            { frame: 0, value: 0 },
            { frame: 20, value: 0.3 },
            { frame: 40, value: 0 }
        ];
        
        walkAnimation.setKeys(walkKeys);
        this.animations.set("giant_walk", walkAnimation);
        
        // انیمیشن حمله غول
        const giantAttack = new BABYLON.Animation(
            "giantAttack",
            "scaling",
            25,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const giantAttackKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 12, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
            { frame: 25, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        
        giantAttack.setKeys(giantAttackKeys);
        this.animations.set("giant_attack", giantAttack);
    }
    
    async createDragonAnimations() {
        // انیمیشن پرواز
        const flyAnimation = new BABYLON.Animation(
            "dragonFly",
            "position.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const flyKeys = [
            { frame: 0, value: 2.0 },
            { frame: 20, value: 2.3 },
            { frame: 40, value: 2.0 },
            { frame: 60, value: 1.8 }
        ];
        
        flyAnimation.setKeys(flyKeys);
        this.animations.set("dragon_fly", flyAnimation);
        
        // انیمیشن بال زدن
        const wingAnimation = new BABYLON.Animation(
            "dragonWing",
            "rotation.z",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const wingKeys = [
            { frame: 0, value: 0 },
            { frame: 15, value: 0.4 },
            { frame: 30, value: 0 }
        ];
        
        wingAnimation.setKeys(wingKeys);
        this.animations.set("dragon_wing", wingAnimation);
        
        // انیمیشن حمله اژدها
        const dragonAttack = new BABYLON.Animation(
            "dragonAttack",
            "position",
            20,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const dragonAttackKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 10, value: new BABYLON.Vector3(0, 0.5, 0) },
            { frame: 20, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        
        dragonAttack.setKeys(dragonAttackKeys);
        this.animations.set("dragon_attack", dragonAttack);
    }
    
    async createEnemyAnimations() {
        // انیمیشن گابلین
        const goblinWalk = new BABYLON.Animation(
            "goblinWalk",
            "position.y",
            25,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const goblinKeys = [
            { frame: 0, value: 0 },
            { frame: 12, value: 0.15 },
            { frame: 25, value: 0 }
        ];
        
        goblinWalk.setKeys(goblinKeys);
        this.animations.set("goblin_walk", goblinWalk);
        
        // انیمیشن اورک
        const orcWalk = new BABYLON.Animation(
            "orcWalk",
            "position.y",
            35,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const orcKeys = [
            { frame: 0, value: 0 },
            { frame: 17, value: 0.25 },
            { frame: 35, value: 0 }
        ];
        
        orcWalk.setKeys(orcKeys);
        this.animations.set("orc_walk", orcWalk);
        
        // انیمیشن ترول
        const trollWalk = new BABYLON.Animation(
            "trollWalk",
            "position.y",
            50,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const trollKeys = [
            { frame: 0, value: 0 },
            { frame: 25, value: 0.4 },
            { frame: 50, value: 0 }
        ];
        
        trollWalk.setKeys(trollKeys);
        this.animations.set("troll_walk", trollWalk);
    }
    
    async createBattleAnimations() {
        await this.createProjectileAnimations();
        await this.createExplosionAnimations();
        await this.createDamageAnimations();
        await this.createDeathAnimations();
    }
    
    async createProjectileAnimations() {
        // انیمیشن پرتابه توپخانه
        const projectileFly = new BABYLON.Animation(
            "projectileFly",
            "rotation",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const projectileKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 15, value: new BABYLON.Vector3(Math.PI, Math.PI, 0) },
            { frame: 30, value: new BABYLON.Vector3(Math.PI * 2, Math.PI * 2, 0) }
        ];
        
        projectileFly.setKeys(projectileKeys);
        this.animations.set("projectile_fly", projectileFly);
        
        // انیمیشن شعله پرتابه
        const projectileGlow = new BABYLON.Animation(
            "projectileGlow",
            "scaling",
            15,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const glowKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 7, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
            { frame: 15, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        
        projectileGlow.setKeys(glowKeys);
        this.animations.set("projectile_glow", projectileGlow);
    }
    
    async createExplosionAnimations() {
        // انیمیشن انفجار
        const explosionScale = new BABYLON.Animation(
            "explosionScale",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const explosionKeys = [
            { frame: 0, value: new BABYLON.Vector3(0.1, 0.1, 0.1) },
            { frame: 10, value: new BABYLON.Vector3(2, 2, 2) },
            { frame: 20, value: new BABYLON.Vector3(1.5, 1.5, 1.5) },
            { frame: 30, value: new BABYLON.Vector3(0.1, 0.1, 0.1) }
        ];
        
        explosionScale.setKeys(explosionKeys);
        this.animations.set("explosion_scale", explosionScale);
        
        // انیمیشن درخشش انفجار
        const explosionGlow = new BABYLON.Animation(
            "explosionGlow",
            "visibility",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const glowKeys = [
            { frame: 0, value: 0 },
            { frame: 5, value: 1 },
            { frame: 25, value: 0.3 },
            { frame: 30, value: 0 }
        ];
        
        explosionGlow.setKeys(glowKeys);
        this.animations.set("explosion_glow", explosionGlow);
    }
    
    async createDamageAnimations() {
        // انیمیشن آسیب‌دیدگی
        const damageFlash = new BABYLON.Animation(
            "damageFlash",
            "material.emissiveColor",
            15,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const damageKeys = [
            { frame: 0, value: new BABYLON.Color3(0, 0, 0) },
            { frame: 5, value: new BABYLON.Color3(1, 0, 0) },
            { frame: 10, value: new BABYLON.Color3(0, 0, 0) },
            { frame: 15, value: new BABYLON.Color3(1, 0, 0) }
        ];
        
        damageFlash.setKeys(damageKeys);
        this.animations.set("damage_flash", damageFlash);
    }
    
    async createDeathAnimations() {
        // انیمیشن مرگ
        const deathAnimation = new BABYLON.Animation(
            "deathAnimation",
            "rotation.x",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const deathKeys = [
            { frame: 0, value: 0 },
            { frame: 60, value: Math.PI / 2 }
        ];
        
        deathAnimation.setKeys(deathKeys);
        this.animations.set("death", deathAnimation);
        
        // انیمیشن ناپدید شدن
        const fadeAnimation = new BABYLON.Animation(
            "fadeAnimation",
            "visibility",
            45,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const fadeKeys = [
            { frame: 0, value: 1 },
            { frame: 30, value: 0.5 },
            { frame: 45, value: 0 }
        ];
        
        fadeAnimation.setKeys(fadeKeys);
        this.animations.set("fade", fadeAnimation);
    }
    
    async createEnvironmentAnimations() {
        await this.createTreeAnimations();
        await this.createWaterAnimations();
        await this.createCloudAnimations();
        await this.createDayNightCycle();
    }
    
    async createTreeAnimations() {
        // انیمیشن تاب خوردن درختان
        const treeSway = new BABYLON.Animation(
            "treeSway",
            "rotation.z",
            180,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const swayKeys = [
            { frame: 0, value: -0.05 },
            { frame: 90, value: 0.05 },
            { frame: 180, value: -0.05 }
        ];
        
        treeSway.setKeys(swayKeys);
        this.animations.set("tree_sway", treeSway);
        
        // انیمیشن برگ‌ها
        const leafMovement = new BABYLON.Animation(
            "leafMovement",
            "position.y",
            120,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const leafKeys = [
            { frame: 0, value: 0 },
            { frame: 60, value: 0.1 },
            { frame: 120, value: 0 }
        ];
        
        leafMovement.setKeys(leafKeys);
        this.animations.set("leaf_movement", leafMovement);
    }
    
    async createWaterAnimations() {
        // انیمیشن موج آب
        const waterWave = new BABYLON.Animation(
            "waterWave",
            "position.y",
            90,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const waveKeys = [
            { frame: 0, value: 0 },
            { frame: 45, value: 0.05 },
            { frame: 90, value: 0 }
        ];
        
        waterWave.setKeys(waveKeys);
        this.animations.set("water_wave", waterWave);
    }
    
    async createCloudAnimations() {
        // انیمیشن حرکت ابرها
        const cloudMove = new BABYLON.Animation(
            "cloudMove",
            "position.x",
            600,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const cloudKeys = [
            { frame: 0, value: -100 },
            { frame: 600, value: 100 }
        ];
        
        cloudMove.setKeys(cloudKeys);
        this.animations.set("cloud_move", cloudMove);
    }
    
    async createDayNightCycle() {
        // چرخه روز و شب
        const dayNightCycle = new BABYLON.Animation(
            "dayNightCycle",
            "intensity",
            1200, // 20 دقیقه
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const cycleKeys = [
            { frame: 0, value: 1.2 },    // روز
            { frame: 300, value: 0.8 },  // عصر
            { frame: 600, value: 0.3 },  // شب
            { frame: 900, value: 0.8 },  // صبح
            { frame: 1200, value: 1.2 }  // روز
        ];
        
        dayNightCycle.setKeys(cycleKeys);
        this.animations.set("day_night_cycle", dayNightCycle);
    }
    
    async createParticleSystems() {
        await this.createBuildParticles();
        await this.createAttackParticles();
        await this.createExplosionParticles();
        await this.createMagicParticles();
        await this.createEnvironmentParticles();
    }
    
    async createBuildParticles() {
        // ذرات ساخت ساختمان
        const buildParticles = new BABYLON.ParticleSystem("buildParticles", 2000, this.scene);
        
        buildParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        buildParticles.minEmitBox = new BABYLON.Vector3(-2, 0, -2);
        buildParticles.maxEmitBox = new BABYLON.Vector3(2, 0, 2);
        
        buildParticles.color1 = new BABYLON.Color4(1, 0.8, 0, 1);
        buildParticles.color2 = new BABYLON.Color4(1, 1, 1, 1);
        buildParticles.colorDead = new BABYLON.Color4(0.5, 0.5, 0, 0);
        
        buildParticles.minSize = 0.1;
        buildParticles.maxSize = 0.3;
        buildParticles.minLifeTime = 0.8;
        buildParticles.maxLifeTime = 2;
        buildParticles.emitRate = 1000;
        
        buildParticles.direction1 = new BABYLON.Vector3(-1, 5, -1);
        buildParticles.direction2 = new BABYLON.Vector3(1, 8, 1);
        buildParticles.minEmitPower = 1;
        buildParticles.maxEmitPower = 3;
        buildParticles.updateSpeed = 0.01;
        
        this.particleSystems.set("build", buildParticles);
    }
    
    async createAttackParticles() {
        // ذرات حمله
        const attackParticles = new BABYLON.ParticleSystem("attackParticles", 500, this.scene);
        
        attackParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        
        attackParticles.color1 = new BABYLON.Color4(1, 0, 0, 1);
        attackParticles.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        attackParticles.colorDead = new BABYLON.Color4(0.3, 0, 0, 0);
        
        attackParticles.minSize = 0.05;
        attackParticles.maxSize = 0.2;
        attackParticles.minLifeTime = 0.2;
        attackParticles.maxLifeTime = 0.5;
        attackParticles.emitRate = 2000;
        
        attackParticles.direction1 = new BABYLON.Vector3(-2, 2, -2);
        attackParticles.direction2 = new BABYLON.Vector3(2, 4, 2);
        attackParticles.minEmitPower = 2;
        attackParticles.maxEmitPower = 5;
        
        this.particleSystems.set("attack", attackParticles);
    }
    
    async createExplosionParticles() {
        // ذرات انفجار
        const explosionParticles = new BABYLON.ParticleSystem("explosionParticles", 1000, this.scene);
        
        explosionParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        
        explosionParticles.color1 = new BABYLON.Color4(1, 1, 0, 1);
        explosionParticles.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        explosionParticles.colorDead = new BABYLON.Color4(0.5, 0.2, 0, 0);
        
        explosionParticles.minSize = 0.1;
        explosionParticles.maxSize = 0.8;
        explosionParticles.minLifeTime = 0.3;
        explosionParticles.maxLifeTime = 1.0;
        explosionParticles.emitRate = 5000;
        
        explosionParticles.direction1 = new BABYLON.Vector3(-8, -8, -8);
        explosionParticles.direction2 = new BABYLON.Vector3(8, 8, 8);
        explosionParticles.minEmitPower = 5;
        explosionParticles.maxEmitPower = 15;
        
        this.particleSystems.set("explosion", explosionParticles);
    }
    
    async createMagicParticles() {
        // ذرات جادو برای کارخانه اکسیر
        const magicParticles = new BABYLON.ParticleSystem("magicParticles", 800, this.scene);
        
        magicParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        
        magicParticles.color1 = new BABYLON.Color4(0.6, 0, 0.8, 1);
        magicParticles.color2 = new BABYLON.Color4(0.8, 0.4, 1, 1);
        magicParticles.colorDead = new BABYLON.Color4(0.2, 0, 0.4, 0);
        
        magicParticles.minSize = 0.05;
        buildParticles.maxSize = 0.25;
        magicParticles.minLifeTime = 1;
        magicParticles.maxLifeTime = 2;
        magicParticles.emitRate = 300;
        
        // ایجاد حلقه جادویی
        magicParticles.createSphereEmitter(1);
        
        this.particleSystems.set("magic", magicParticles);
    }
    
    async createEnvironmentParticles() {
        // ذرات محیطی - دود
        const smokeParticles = new BABYLON.ParticleSystem("smokeParticles", 400, this.scene);
        
        smokeParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        
        smokeParticles.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.2);
        smokeParticles.color2 = new BABYLON.Color4(0.5, 0.5, 0.5, 0.4);
        smokeParticles.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0);
        
        smokeParticles.minSize = 0.1;
        smokeParticles.maxSize = 0.4;
        smokeParticles.minLifeTime = 3;
        smokeParticles.maxLifeTime = 6;
        smokeParticles.emitRate = 50;
        
        smokeParticles.direction1 = new BABYLON.Vector3(-0.3, 1, -0.3);
        smokeParticles.direction2 = new BABYLON.Vector3(0.3, 2, 0.3);
        smokeParticles.minEmitPower = 0.3;
        smokeParticles.maxEmitPower = 0.8;
        
        this.particleSystems.set("smoke", smokeParticles);
    }
    
    async createLightEffects() {
        // افکت‌های نوری
        await this.createBuildLight();
        await this.createAttackLight();
        await this.createMagicLight();
        await this.createAmbientLight();
    }
    
    async createBuildLight() {
        const buildLight = new BABYLON.PointLight("buildLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        buildLight.intensity = 0;
        buildLight.diffuse = new BABYLON.Color3(1, 0.8, 0);
        buildLight.range = 12;
        
        this.lightEffects.set("build", buildLight);
    }
    
    async createAttackLight() {
        const attackLight = new BABYLON.PointLight("attackLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        attackLight.intensity = 0;
        attackLight.diffuse = new BABYLON.Color3(1, 0.2, 0);
        attackLight.range = 10;
        
        this.lightEffects.set("attack", attackLight);
    }
    
    async createMagicLight() {
        const magicLight = new BABYLON.PointLight("magicLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        magicLight.intensity = 0;
        magicLight.diffuse = new BABYLON.Color3(0.6, 0, 0.8);
        magicLight.range = 15;
        
        this.lightEffects.set("magic", magicLight);
    }
    
    async createAmbientLight() {
        // نور محیطی پویا
        const ambientLight = this.gameEngine.ambientLight;
        if (ambientLight) {
            this.lightEffects.set("ambient", ambientLight);
        }
    }
    
    async createSpecialEffects() {
        // افکت‌های ویژه
        await this.createGlowEffect();
        await this.createLensFlare();
        await this.createPostProcessing();
    }
    
    async createGlowEffect() {
        // افکت درخشش برای ساختمان‌های خاص
        const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
        glowLayer.intensity = 0.4;
        
        this.specialEffects.set("glow", glowLayer);
    }
    
    async createLensFlare() {
        // افکت نور لنز
        const lensFlareSystem = new BABYLON.LensFlareSystem("lensFlare", this.gameEngine.mainLight, this.scene);
        
        const flare1 = new BABYLON.LensFlare(0.2, 0, new BABYLON.Color3(1, 1, 1), "https://i.imgur.com/8N3y7c2.png", lensFlareSystem);
        const flare2 = new BABYLON.LensFlare(0.5, 0.2, new BABYLON.Color3(0.5, 0.5, 1), "https://i.imgur.com/8N3y7c2.png", lensFlareSystem);
        
        this.specialEffects.set("lensFlare", lensFlareSystem);
    }
    
    async createPostProcessing() {
        // افکت‌های پس‌پردازش
        try {
            const bloomEffect = new BABYLON.BloomEffect("bloom", 1.0, 1.0);
            bloomEffect.threshold = 0.8;
            this.specialEffects.set("bloom", bloomEffect);
        } catch (error) {
            console.log("افکت Bloom در دسترس نیست");
        }
    }
    
    async setupEventListeners() {
        // رویدادهای بازی برای انیمیشن‌ها
        this.setupBuildingEventListeners();
        this.setupUnitEventListeners();
        this.setupBattleEventListeners();
        this.setupEnvironmentEventListeners();
    }
    
    setupBuildingEventListeners() {
        // رویدادهای مربوط به ساختمان‌ها
        this.gameEngine.onBuildingBuilt = (building) => {
            this.playBuildAnimation(building);
        };
        
        this.gameEngine.onBuildingDamaged = (building) => {
            this.playDamageAnimation(building);
        };
        
        this.gameEngine.onBuildingDestroyed = (building) => {
            this.playDestructionAnimation(building);
        };
    }
    
    setupUnitEventListeners() {
        // رویدادهای مربوط به واحدها
        this.gameEngine.onUnitTrained = (unit) => {
            this.playUnitSpawnAnimation(unit);
        };
        
        this.gameEngine.onUnitMoved = (unit) => {
            this.playUnitMoveAnimation(unit);
        };
        
        this.gameEngine.onUnitAttacked = (unit) => {
            this.playUnitAttackAnimation(unit);
        };
        
        this.gameEngine.onUnitDamaged = (unit) => {
            this.playUnitDamageAnimation(unit);
        };
        
        this.gameEngine.onUnitDied = (unit) => {
            this.playUnitDeathAnimation(unit);
        };
    }
    
    setupBattleEventListeners() {
        // رویدادهای مربوط به نبرد
        this.gameEngine.onProjectileFired = (projectile) => {
            this.playProjectileAnimation(projectile);
        };
        
        this.gameEngine.onProjectileHit = (projectile) => {
            this.playExplosionAnimation(projectile);
        };
        
        this.gameEngine.onBattleStarted = () => {
            this.playBattleStartEffects();
        };
    }
    
    setupEnvironmentEventListeners() {
        // رویدادهای محیطی
        console.log("✅ رویدادهای محیطی برای انیمیشن‌ها راه‌اندازی شد");
    }
    
    // متدهای پخش انیمیشن
    playBuildAnimation(building) {
        const position = building.mesh ? building.mesh.position : 
                        building.position ? new BABYLON.Vector3(building.position.x, 0, building.position.z) : 
                        new BABYLON.Vector3(0, 0, 0);
        
        // انیمیشن ساخت
        this.playAnimation(building.mesh, `${building.type}_build`);
        
        // ذرات ساخت
        this.playParticles("build", position);
        
        // افکت نوری
        this.playLightEffect("build", position);
        
        // صدا
        this.soundSystem.play("building_built");
    }
    
    playDamageAnimation(building) {
        this.playAnimation(building.mesh, "damage_flash");
        this.soundSystem.play("building_damage");
    }
    
    playDestructionAnimation(building) {
        const position = building.mesh.position;
        
        this.playAnimation(building.mesh, "death");
        this.playParticles("explosion", position);
        this.playLightEffect("attack", position);
        this.soundSystem.play("building_destroyed");
    }
    
    playUnitSpawnAnimation(unit) {
        this.playAnimation(unit.mesh, "spawn");
        this.soundSystem.play("unit_trained");
    }
    
    playUnitMoveAnimation(unit) {
        if (unit.state === 'moving') {
            this.playLoopingAnimation(unit.mesh, `${unit.type}_walk`);
        }
    }
    
    playUnitAttackAnimation(unit) {
        this.playAnimation(unit.mesh, `${unit.type}_attack`);
        this.playParticles("attack", unit.mesh.position);
        this.soundSystem.play("unit_attack");
    }
    
    playUnitDamageAnimation(unit) {
        this.playAnimation(unit.mesh, "damage_flash");
        this.soundSystem.play("unit_damage");
    }
    
    playUnitDeathAnimation(unit) {
        this.playAnimation(unit.mesh, "death");
        this.playParticles("smoke", unit.mesh.position);
        this.soundSystem.play("unit_died");
    }
    
    playProjectileAnimation(projectile) {
        this.playLoopingAnimation(projectile.mesh, "projectile_fly");
        this.playParticles("attack", projectile.mesh.position);
        this.soundSystem.play("cannon_fire");
    }
    
    playExplosionAnimation(projectile) {
        const position = projectile.mesh.position;
        
        this.playAnimation(projectile.mesh, "explosion_scale");
        this.playParticles("explosion", position);
        this.playLightEffect("attack", position);
        this.soundSystem.play("explosion");
    }
    
    playBattleStartEffects() {
        this.soundSystem.play("battle_start");
        // افکت‌های بصری شروع نبرد
    }
    
    // متدهای کمکی انیمیشن
    playAnimation(mesh, animationName, onComplete = null) {
        const animation = this.animations.get(animationName);
        if (animation && mesh) {
            mesh.animations = [animation];
            const animatable = this.scene.beginAnimation(mesh, 0, animation.getKeys()[animation.getKeys().length - 1].frame, false);
            
            if (onComplete) {
                animatable.onAnimationEnd = onComplete;
            }
            
            return animatable;
        }
        return null;
    }
    
    playLoopingAnimation(mesh, animationName) {
        const animation = this.animations.get(animationName);
        if (animation && mesh) {
            mesh.animations = [animation];
            this.scene.beginAnimation(mesh, 0, animation.getKeys()[animation.getKeys().length - 1].frame, true);
        }
    }
    
    playParticles(particleName, position) {
        const particles = this.particleSystems.get(particleName);
        if (particles) {
            particles.emitter = position;
            particles.start();
            
            setTimeout(() => {
                particles.stop();
            }, 1000);
        }
    }
    
    playLightEffect(lightName, position) {
        const light = this.lightEffects.get(lightName);
        if (light) {
            light.position = position.clone();
            light.intensity = 2;
            
            const fadeOut = setInterval(() => {
                light.intensity -= 0.1;
                if (light.intensity <= 0) {
                    light.intensity = 0;
                    clearInterval(fadeOut);
                }
            }, 50);
        }
    }
    
    // به‌روزرسانی انیمیشن‌های مداوم
    update() {
        this.updateUnitAnimations();
        this.updateEnvironmentAnimations();
        this.updateParticleSystems();
        this.timelineManager.update();
        this.transitionManager.update();
    }
    
    updateUnitAnimations() {
        // به‌روزرسانی انیمیشن‌های واحدهای متحرک
        this.gameEngine.units.forEach(unit => {
            if (unit.state === 'moving' && !this.isAnimationPlaying(unit.mesh, `${unit.type}_walk`)) {
                this.playUnitMoveAnimation(unit);
            }
        });
        
        // به‌روزرسانی انیمیشن‌های دشمنان
        this.gameEngine.enemies.forEach(enemy => {
            if (enemy.state === 'moving' && !this.isAnimationPlaying(enemy.mesh, `${enemy.type}_walk`)) {
                this.playLoopingAnimation(enemy.mesh, `${enemy.type}_walk`);
            }
        });
    }
    
    updateEnvironmentAnimations() {
        // به‌روزرسانی انیمیشن‌های محیطی
        const time = this.gameEngine.gameTime;
        
        // درختان
        this.gameEngine.trees.forEach(tree => {
            if (tree.leaves && !this.isAnimationPlaying(tree.leaves, "leaf_movement")) {
                this.playLoopingAnimation(tree.leaves, "leaf_movement");
            }
        });
        
        // آب
        if (this.gameEngine.water && !this.isAnimationPlaying(this.gameEngine.water, "water_wave")) {
            this.playLoopingAnimation(this.gameEngine.water, "water_wave");
        }
    }
    
    updateParticleSystems() {
        // به‌روزرسانی سیستم‌های ذرات
        this.particleSystems.forEach((particles, name) => {
            if (particles && particles.isStarted()) {
                // به‌روزرسانی موقعیت ذرات
            }
        });
    }
    
    isAnimationPlaying(mesh, animationName) {
        if (!mesh || !mesh.animations) return false;
        
        return mesh.animations.some(anim => 
            anim.name === animationName && 
            this.scene.getAnimatableByTarget(mesh)
        );
    }
    
    // متدهای مدیریت پیشرفته
    createComplexAnimation(target, animations, onComplete = null) {
        const animationGroup = new BABYLON.AnimationGroup("complexAnimation");
        
        animations.forEach(animConfig => {
            const animation = new BABYLON.Animation(
                animConfig.name,
                animConfig.property,
                animConfig.fps,
                animConfig.type,
                animConfig.loopMode
            );
            
            animation.setKeys(animConfig.keys);
            animationGroup.addTargetedAnimation(animation, target);
        });
        
        if (onComplete) {
            animationGroup.onAnimationEndObservable.add(onComplete);
        }
        
        animationGroup.play();
        return animationGroup;
    }
}

// سیستم‌های کمکی
class TimelineManager {
    constructor() {
        this.timelines = new Map();
        this.activeTimelines = new Set();
    }
    
    createTimeline(name) {
        const timeline = {
            name: name,
            keyframes: [],
            duration: 0,
            isPlaying: false,
            currentTime: 0
        };
        
        this.timelines.set(name, timeline);
        return timeline;
    }
    
    addKeyframe(timelineName, time, callback) {
        const timeline = this.timelines.get(timelineName);
        if (timeline) {
            timeline.keyframes.push({ time, callback });
            timeline.duration = Math.max(timeline.duration, time);
        }
    }
    
    playTimeline(timelineName) {
        const timeline = this.timelines.get(timelineName);
        if (timeline && !timeline.isPlaying) {
            timeline.isPlaying = true;
            timeline.currentTime = 0;
            this.activeTimelines.add(timelineName);
        }
    }
    
    update() {
        const deltaTime = 1/60; // فرض 60 FPS
        
        this.activeTimelines.forEach(timelineName => {
            const timeline = this.timelines.get(timelineName);
            if (timeline) {
                timeline.currentTime += deltaTime;
                
                timeline.keyframes.forEach(keyframe => {
                    if (keyframe.time <= timeline.currentTime && keyframe.time > timeline.currentTime - deltaTime) {
                        keyframe.callback();
                    }
                });
                
                if (timeline.currentTime >= timeline.duration) {
                    this.stopTimeline(timelineName);
                }
            }
        });
    }
    
    stopTimeline(timelineName) {
        const timeline = this.timelines.get(timelineName);
        if (timeline) {
            timeline.isPlaying = false;
            this.activeTimelines.delete(timelineName);
        }
    }
}

class TransitionManager {
    constructor() {
        this.transitions = new Map();
        this.activeTransitions = new Set();
    }
    
    createTransition(target, property, startValue, endValue, duration, easing = "linear") {
        const transition = {
            target: target,
            property: property,
            startValue: startValue,
            endValue: endValue,
            duration: duration,
            easing: easing,
            startTime: Date.now(),
            isComplete: false
        };
        
        const id = Math.random().toString(36).substr(2, 9);
        this.transitions.set(id, transition);
        this.activeTransitions.add(id);
        
        return id;
    }
    
    update() {
        const currentTime = Date.now();
        const completedTransitions = [];
        
        this.activeTransitions.forEach(id => {
            const transition = this.transitions.get(id);
            if (transition && !transition.isComplete) {
                const elapsed = currentTime - transition.startTime;
                const progress = Math.min(elapsed / transition.duration, 1);
                
                const easedProgress = this.applyEasing(progress, transition.easing);
                const currentValue = this.interpolate(transition.startValue, transition.endValue, easedProgress);
                
                this.setProperty(transition.target, transition.property, currentValue);
                
                if (progress >= 1) {
                    transition.isComplete = true;
                    completedTransitions.push(id);
                }
            }
        });
        
        completedTransitions.forEach(id => {
            this.activeTransitions.delete(id);
            this.transitions.delete(id);
        });
    }
    
    applyEasing(progress, easing) {
        switch (easing) {
            case "easeIn": return progress * progress;
            case "easeOut": return 1 - (1 - progress) * (1 - progress);
            case "easeInOut": return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            default: return progress;
        }
    }
    
    interpolate(start, end, progress) {
        if (typeof start === "number" && typeof end === "number") {
            return start + (end - start) * progress;
        } else if (start instanceof BABYLON.Vector3 && end instanceof BABYLON.Vector3) {
            return BABYLON.Vector3.Lerp(start, end, progress);
        }
        return end;
    }
    
    setProperty(target, property, value) {
        const parts = property.split('.');
        let obj = target;
        
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }
        
        obj[parts[parts.length - 1]] = value;
    }
}

// اضافه کردن AdvancedAnimationManager به AdvancedGameEngine
if (typeof AdvancedGameEngine !== 'undefined') {
    AdvancedGameEngine.prototype.initAnimations = function() {
        this.animationManager = new AdvancedAnimationManager(this);
    };
    
    const originalInit = AdvancedGameEngine.prototype.init;
    AdvancedGameEngine.prototype.init = async function() {
        await originalInit.call(this);
        await this.initAnimations();
    };
    
    // گسترش متدهای اطلاع‌رسانی انیمیشن
    AdvancedGameEngine.prototype.playBuildAnimation = function(building) {
        if (this.animationManager) {
            this.animationManager.playBuildAnimation(building);
        }
    };
}

console.log("🚀 فایل m3.js - انیمیشن‌های پیشرفته بارگذاری شد");
