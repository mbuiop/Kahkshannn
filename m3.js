// m3.js - سیستم انیمیشن و افکت‌های بازی
// ===============================================

class AnimationManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.animations = new Map();
        this.particleSystems = new Map();
        this.soundEffects = new Map();
        this.lightEffects = new Map();
        this.specialEffects = new Map();
        this.animationGroups = new Map();
        this.morphTargetManagers = new Map();
        this.boneControllers = new Map();
        this.timelineManager = new TimelineManager();
        this.transitionManager = new TransitionManager();
        
        this.init();
    }
    
    init() {
        this.setupAnimationSystem();
        this.createParticleSystems();
        this.setupSoundSystem();
        this.createLightEffects();
        this.createSpecialEffects();
        this.setupEventListeners();
        
        console.log("سیستم انیمیشن و افکت‌ها با موفقیت راه‌اندازی شد");
    }
    
    setupAnimationSystem() {
        // ایجاد سیستم انیمیشن پیشرفته
        this.animationMixer = new BABYLON.AnimationGroupMixer(this.scene);
        this.skeletonManager = new BABYLON.SkeletonManager(this.scene);
        
        // ایجاد انیمیشن‌های پایه برای ساختمان‌ها
        this.createBuildingAnimations();
        
        // ایجاد انیمیشن‌های پایه برای واحدها
        this.createUnitAnimations();
        
        // ایجاد انیمیشن‌های محیطی
        this.createEnvironmentAnimations();
        
        // ایجاد انیمیشن‌های رابط کاربری
        this.createUIAnimations();
    }
    
    createBuildingAnimations() {
        // انیمیشن ساخت ساختمان
        const buildAnimation = new BABYLON.Animation(
            "buildAnimation",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const buildKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 30, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
            { frame: 60, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        
        buildAnimation.setKeys(buildKeys);
        this.animations.set("build", buildAnimation);
        
        // انیمیشن ارتقاء ساختمان
        const upgradeAnimation = new BABYLON.Animation(
            "upgradeAnimation",
            "position.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const upgradeKeys = [
            { frame: 0, value: 0 },
            { frame: 15, value: 0.5 },
            { frame: 30, value: 0 },
            { frame: 45, value: 0.3 },
            { frame: 60, value: 0 }
        ];
        
        upgradeAnimation.setKeys(upgradeKeys);
        this.animations.set("upgrade", upgradeAnimation);
        
        // انیمیشن تولید منابع
        const productionAnimation = new BABYLON.Animation(
            "productionAnimation",
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
        this.animations.set("production", productionAnimation);
        
        // انیمیشن تخریب ساختمان
        const destroyAnimation = new BABYLON.Animation(
            "destroyAnimation",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const destroyKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 15, value: new BABYLON.Vector3(1.3, 1.3, 1.3) },
            { frame: 30, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        
        destroyAnimation.setKeys(destroyKeys);
        this.animations.set("destroy", destroyAnimation);
    }
    
    createUnitAnimations() {
        // انیمیشن راه رفتن
        const walkAnimation = new BABYLON.Animation(
            "walkAnimation",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const walkKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 15, value: new BABYLON.Vector3(0, 0.2, 0) },
            { frame: 30, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 45, value: new BABYLON.Vector3(0, -0.1, 0) },
            { frame: 60, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        
        walkAnimation.setKeys(walkKeys);
        this.animations.set("walk", walkAnimation);
        
        // انیمیشن حمله
        const attackAnimation = new BABYLON.Animation(
            "attackAnimation",
            "rotation.x",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const attackKeys = [
            { frame: 0, value: 0 },
            { frame: 10, value: -0.5 },
            { frame: 20, value: 0.3 },
            { frame: 30, value: 0 }
        ];
        
        attackAnimation.setKeys(attackKeys);
        this.animations.set("attack", attackAnimation);
        
        // انیمیشن آسیب دیدن
        const damageAnimation = new BABYLON.Animation(
            "damageAnimation",
            "position",
            20,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const damageKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 5, value: new BABYLON.Vector3(0.3, 0, 0) },
            { frame: 10, value: new BABYLON.Vector3(-0.2, 0, 0) },
            { frame: 15, value: new BABYLON.Vector3(0.1, 0, 0) },
            { frame: 20, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        
        damageAnimation.setKeys(damageKeys);
        this.animations.set("damage", damageAnimation);
        
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
        
        // انیمیشن پرواز اژدها
        const dragonFlyAnimation = new BABYLON.Animation(
            "dragonFlyAnimation",
            "position.y",
            90,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const dragonFlyKeys = [
            { frame: 0, value: 2 },
            { frame: 30, value: 2.5 },
            { frame: 60, value: 2 },
            { frame: 90, value: 1.8 }
        ];
        
        dragonFlyAnimation.setKeys(dragonFlyKeys);
        this.animations.set("dragonFly", dragonFlyAnimation);
        
        // انیمیشن بال زدن اژدها
        const dragonWingAnimation = new BABYLON.Animation(
            "dragonWingAnimation",
            "rotation.z",
            45,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const dragonWingKeys = [
            { frame: 0, value: 0 },
            { frame: 15, value: 0.3 },
            { frame: 30, value: -0.2 },
            { frame: 45, value: 0 }
        ];
        
        dragonWingAnimation.setKeys(dragonWingKeys);
        this.animations.set("dragonWing", dragonWingAnimation);
    }
    
    createEnvironmentAnimations() {
        // انیمیشن آب
        const waterAnimation = new BABYLON.Animation(
            "waterAnimation",
            "position.y",
            120,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const waterKeys = [
            { frame: 0, value: 0 },
            { frame: 60, value: 0.1 },
            { frame: 120, value: 0 }
        ];
        
        waterAnimation.setKeys(waterKeys);
        this.animations.set("water", waterAnimation);
        
        // انیمیشن درختان
        const treeSwayAnimation = new BABYLON.Animation(
            "treeSwayAnimation",
            "rotation.z",
            180,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const treeSwayKeys = [
            { frame: 0, value: -0.05 },
            { frame: 90, value: 0.05 },
            { frame: 180, value: -0.05 }
        ];
        
        treeSwayAnimation.setKeys(treeSwayKeys);
        this.animations.set("treeSway", treeSwayAnimation);
        
        // انیمیشن ابرها
        const cloudAnimation = new BABYLON.Animation(
            "cloudAnimation",
            "position.x",
            600,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const cloudKeys = [
            { frame: 0, value: -100 },
            { frame: 600, value: 100 }
        ];
        
        cloudAnimation.setKeys(cloudKeys);
        this.animations.set("cloud", cloudAnimation);
    }
    
    createUIAnimations() {
        // انیمیشن نمایش UI
        const uiFadeInAnimation = new BABYLON.Animation(
            "uiFadeInAnimation",
            "alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const uiFadeInKeys = [
            { frame: 0, value: 0 },
            { frame: 30, value: 1 }
        ];
        
        uiFadeInAnimation.setKeys(uiFadeInKeys);
        this.animations.set("uiFadeIn", uiFadeInAnimation);
        
        // انیمیشن پرش دکمه
        const buttonBounceAnimation = new BABYLON.Animation(
            "buttonBounceAnimation",
            "scaleX",
            20,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const buttonBounceKeys = [
            { frame: 0, value: 1 },
            { frame: 10, value: 1.2 },
            { frame: 20, value: 1 }
        ];
        
        buttonBounceAnimation.setKeys(buttonBounceKeys);
        this.animations.set("buttonBounce", buttonBounceAnimation);
        
        // انیمیشن لرزش notification
        const notificationShakeAnimation = new BABYLON.Animation(
            "notificationShakeAnimation",
            "left",
            15,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const notificationShakeKeys = [
            { frame: 0, value: 0 },
            { frame: 5, value: 5 },
            { frame: 10, value: -5 },
            { frame: 15, value: 0 }
        ];
        
        notificationShakeAnimation.setKeys(notificationShakeKeys);
        this.animations.set("notificationShake", notificationShakeAnimation);
    }
    
    createParticleSystems() {
        // سیستم ذرات برای ساخت ساختمان
        this.createBuildParticles();
        
        // سیستم ذرات برای حمله
        this.createAttackParticles();
        
        // سیستم ذرات برای انفجار
        this.createExplosionParticles();
        
        // سیستم ذرات برای منابع
        this.createResourceParticles();
        
        // سیستم ذرات برای جادو
        this.createMagicParticles();
        
        // سیستم ذرات برای محیط
        this.createEnvironmentParticles();
    }
    
    createBuildParticles() {
        const buildParticles = new BABYLON.ParticleSystem("buildParticles", 2000, this.scene);
        
        buildParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        buildParticles.emitter = new BABYLON.Vector3(0, -10, 0);
        buildParticles.minEmitBox = new BABYLON.Vector3(-1, 0, -1);
        buildParticles.maxEmitBox = new BABYLON.Vector3(1, 0, 1);
        
        buildParticles.color1 = new BABYLON.Color4(1, 0.8, 0, 1);
        buildParticles.color2 = new BABYLON.Color4(1, 1, 1, 1);
        buildParticles.colorDead = new BABYLON.Color4(0.5, 0.5, 0, 0);
        
        buildParticles.minSize = 0.1;
        buildParticles.maxSize = 0.5;
        
        buildParticles.minLifeTime = 0.5;
        buildParticles.maxLifeTime = 2;
        
        buildParticles.emitRate = 1000;
        buildParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        buildParticles.gravity = new BABYLON.Vector3(0, 5, 0);
        buildParticles.direction1 = new BABYLON.Vector3(-2, 8, -2);
        buildParticles.direction2 = new BABYLON.Vector3(2, 8, 2);
        
        buildParticles.minAngularSpeed = 0;
        buildParticles.maxAngularSpeed = Math.PI;
        
        buildParticles.minEmitPower = 1;
        buildParticles.maxEmitPower = 3;
        buildParticles.updateSpeed = 0.005;
        
        this.particleSystems.set("build", buildParticles);
    }
    
    createAttackParticles() {
        const attackParticles = new BABYLON.ParticleSystem("attackParticles", 500, this.scene);
        
        attackParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/ZqvBdJc.jpg", this.scene);
        attackParticles.emitter = new BABYLON.Vector3(0, 0, 0);
        
        attackParticles.color1 = new BABYLON.Color4(1, 0, 0, 1);
        attackParticles.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        attackParticles.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);
        
        attackParticles.minSize = 0.1;
        attackParticles.maxSize = 0.3;
        
        attackParticles.minLifeTime = 0.2;
        attackParticles.maxLifeTime = 0.5;
        
        attackParticles.emitRate = 1000;
        buildParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        attackParticles.direction1 = new BABYLON.Vector3(-1, 1, -1);
        attackParticles.direction2 = new BABYLON.Vector3(1, 1, 1);
        
        attackParticles.minEmitPower = 2;
        attackParticles.maxEmitPower = 5;
        attackParticles.updateSpeed = 0.01;
        
        this.particleSystems.set("attack", attackParticles);
    }
    
    createExplosionParticles() {
        const explosionParticles = new BABYLON.ParticleSystem("explosionParticles", 1000, this.scene);
        
        explosionParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        explosionParticles.emitter = new BABYLON.Vector3(0, 0, 0);
        
        explosionParticles.color1 = new BABYLON.Color4(1, 1, 0, 1);
        explosionParticles.color2 = new BABYLON.Color4(1, 0, 0, 1);
        explosionParticles.colorDead = new BABYLON.Color4(0.5, 0, 0, 0);
        
        explosionParticles.minSize = 0.2;
        explosionParticles.maxSize = 1;
        
        explosionParticles.minLifeTime = 0.3;
        explosionParticles.maxLifeTime = 1;
        
        explosionParticles.emitRate = 3000;
        explosionParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        explosionParticles.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        explosionParticles.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        
        explosionParticles.direction1 = new BABYLON.Vector3(-5, -5, -5);
        explosionParticles.direction2 = new BABYLON.Vector3(5, 5, 5);
        
        explosionParticles.minEmitPower = 5;
        explosionParticles.maxEmitPower = 10;
        explosionParticles.updateSpeed = 0.01;
        
        this.particleSystems.set("explosion", explosionParticles);
    }
    
    createResourceParticles() {
        const goldParticles = new BABYLON.ParticleSystem("goldParticles", 200, this.scene);
        
        goldParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        goldParticles.emitter = new BABYLON.Vector3(0, 0, 0);
        
        goldParticles.color1 = new BABYLON.Color4(1, 0.84, 0, 1);
        goldParticles.color2 = new BABYLON.Color4(1, 1, 0.5, 1);
        goldParticles.colorDead = new BABYLON.Color4(0.5, 0.4, 0, 0);
        
        goldParticles.minSize = 0.1;
        goldParticles.maxSize = 0.3;
        
        goldParticles.minLifeTime = 1;
        goldParticles.maxLifeTime = 2;
        
        goldParticles.emitRate = 50;
        goldParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        goldParticles.gravity = new BABYLON.Vector3(0, -2, 0);
        goldParticles.direction1 = new BABYLON.Vector3(-0.5, 2, -0.5);
        goldParticles.direction2 = new BABYLON.Vector3(0.5, 3, 0.5);
        
        goldParticles.minEmitPower = 1;
        goldParticles.maxEmitPower = 2;
        goldParticles.updateSpeed = 0.005;
        
        this.particleSystems.set("gold", goldParticles);
        
        // سیستم ذرات اکسیر
        const elixirParticles = new BABYLON.ParticleSystem("elixirParticles", 200, this.scene);
        
        elixirParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        elixirParticles.emitter = new BABYLON.Vector3(0, 0, 0);
        
        elixirParticles.color1 = new BABYLON.Color4(0.5, 0, 1, 1);
        elixirParticles.color2 = new BABYLON.Color4(0.8, 0.4, 1, 1);
        elixirParticles.colorDead = new BABYLON.Color4(0.2, 0, 0.5, 0);
        
        elixirParticles.minSize = 0.1;
        elixirParticles.maxSize = 0.3;
        
        elixirParticles.minLifeTime = 1;
        elixirParticles.maxLifeTime = 2;
        
        elixirParticles.emitRate = 50;
        elixirParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        elixirParticles.gravity = new BABYLON.Vector3(0, -2, 0);
        elixirParticles.direction1 = new BABYLON.Vector3(-0.5, 2, -0.5);
        elixirParticles.direction2 = new BABYLON.Vector3(0.5, 3, 0.5);
        
        elixirParticles.minEmitPower = 1;
        elixirParticles.maxEmitPower = 2;
        elixirParticles.updateSpeed = 0.005;
        
        this.particleSystems.set("elixir", elixirParticles);
    }
    
    createMagicParticles() {
        const magicParticles = new BABYLON.ParticleSystem("magicParticles", 1000, this.scene);
        
        magicParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        magicParticles.emitter = new BABYLON.Vector3(0, 0, 0);
        
        magicParticles.color1 = new BABYLON.Color4(0, 0.8, 1, 1);
        magicParticles.color2 = new BABYLON.Color4(0.4, 0, 1, 1);
        magicParticles.colorDead = new BABYLON.Color4(0, 0.2, 0.5, 0);
        
        magicParticles.minSize = 0.1;
        magicParticles.maxSize = 0.5;
        
        magicParticles.minLifeTime = 0.5;
        magicParticles.maxLifeTime = 1.5;
        
        magicParticles.emitRate = 500;
        magicParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        magicParticles.direction1 = new BABYLON.Vector3(-2, 2, -2);
        magicParticles.direction2 = new BABYLON.Vector3(2, 4, 2);
        
        magicParticles.minEmitPower = 1;
        magicParticles.maxEmitPower = 3;
        magicParticles.updateSpeed = 0.005;
        
        // ایجاد حلقه جادویی
        magicParticles.createCylinderEmitter(2, 1, 0, 0);
        
        this.particleSystems.set("magic", magicParticles);
    }
    
    createEnvironmentParticles() {
        // سیستم ذرات آب
        const waterParticles = new BABYLON.ParticleSystem("waterParticles", 100, this.scene);
        
        waterParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        waterParticles.emitter = new BABYLON.Vector3(0, 0, 0);
        
        waterParticles.color1 = new BABYLON.Color4(0, 0.5, 1, 0.3);
        waterParticles.color2 = new BABYLON.Color4(0.2, 0.7, 1, 0.5);
        waterParticles.colorDead = new BABYLON.Color4(0, 0.2, 0.5, 0);
        
        waterParticles.minSize = 0.05;
        waterParticles.maxSize = 0.2;
        
        waterParticles.minLifeTime = 1;
        waterParticles.maxLifeTime = 3;
        
        waterParticles.emitRate = 20;
        waterParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        waterParticles.gravity = new BABYLON.Vector3(0, -0.5, 0);
        waterParticles.direction1 = new BABYLON.Vector3(-0.1, 0.5, -0.1);
        waterParticles.direction2 = new BABYLON.Vector3(0.1, 1, 0.1);
        
        waterParticles.minEmitPower = 0.1;
        waterParticles.maxEmitPower = 0.3;
        waterParticles.updateSpeed = 0.01;
        
        this.particleSystems.set("water", waterParticles);
        
        // سیستم ذرات دود
        const smokeParticles = new BABYLON.ParticleSystem("smokeParticles", 200, this.scene);
        
        smokeParticles.particleTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        smokeParticles.emitter = new BABYLON.Vector3(0, 0, 0);
        
        smokeParticles.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.1);
        smokeParticles.color2 = new BABYLON.Color4(0.5, 0.5, 0.5, 0.3);
        smokeParticles.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0);
        
        smokeParticles.minSize = 0.1;
        smokeParticles.maxSize = 0.5;
        
        smokeParticles.minLifeTime = 2;
        smokeParticles.maxLifeTime = 5;
        
        smokeParticles.emitRate = 10;
        smokeParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        smokeParticles.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
        smokeParticles.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
        
        smokeParticles.minEmitPower = 0.5;
        smokeParticles.maxEmitPower = 1;
        smokeParticles.updateSpeed = 0.005;
        
        this.particleSystems.set("smoke", smokeParticles);
    }
    
    setupSoundSystem() {
        // ایجاد سیستم صدا (شبیه‌سازی)
        this.soundEffects.set("build", this.createSoundEffect("build"));
        this.soundEffects.set("attack", this.createSoundEffect("attack"));
        this.soundEffects.set("explosion", this.createSoundEffect("explosion"));
        this.soundEffects.set("upgrade", this.createSoundEffect("upgrade"));
        this.soundEffects.set("click", this.createSoundEffect("click"));
        this.soundEffects.set("notification", this.createSoundEffect("notification"));
        this.soundEffects.set("magic", this.createSoundEffect("magic"));
        this.soundEffects.set("walk", this.createSoundEffect("walk"));
    }
    
    createSoundEffect(type) {
        // شبیه‌سازی سیستم صدا - در حالت واقعی از Web Audio API استفاده می‌شود
        return {
            play: (volume = 1) => {
                console.log(`پخش صدا: ${type} با حجم ${volume}`);
                // در اینجا کد واقعی پخش صدا قرار می‌گیرد
            },
            stop: () => {
                console.log(`توقف صدا: ${type}`);
            },
            setVolume: (volume) => {
                console.log(`تنظیم حجم صدا ${type} به ${volume}`);
            }
        };
    }
    
    createLightEffects() {
        // ایجاد افکت‌های نوری
        this.createBuildLight();
        this.createAttackLight();
        this.createMagicLight();
        this.createAmbientLight();
    }
    
    createBuildLight() {
        const buildLight = new BABYLON.PointLight("buildLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        buildLight.intensity = 0;
        buildLight.diffuse = new BABYLON.Color3(1, 0.8, 0);
        buildLight.specular = new BABYLON.Color3(1, 1, 0.5);
        buildLight.range = 10;
        
        this.lightEffects.set("build", buildLight);
    }
    
    createAttackLight() {
        const attackLight = new BABYLON.PointLight("attackLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        attackLight.intensity = 0;
        attackLight.diffuse = new BABYLON.Color3(1, 0, 0);
        attackLight.specular = new BABYLON.Color3(1, 0.5, 0);
        attackLight.range = 8;
        
        this.lightEffects.set("attack", attackLight);
    }
    
    createMagicLight() {
        const magicLight = new BABYLON.PointLight("magicLight", new BABYLON.Vector3(0, 0, 0), this.scene);
        magicLight.intensity = 0;
        magicLight.diffuse = new BABYLON.Color3(0, 0.8, 1);
        magicLight.specular = new BABYLON.Color3(0.4, 0, 1);
        magicLight.range = 12;
        
        this.lightEffects.set("magic", magicLight);
    }
    
    createAmbientLight() {
        const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        ambientLight.intensity = 0.3;
        ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
        ambientLight.specular = new BABYLON.Color3(0.2, 0.2, 0.2);
        
        this.lightEffects.set("ambient", ambientLight);
    }
    
    createSpecialEffects() {
        // ایجاد افکت‌های ویژه
        this.createLensFlare();
        this.createGlowEffect();
        this.createShadowEffect();
        this.createReflectionEffect();
        this.createPostProcessEffects();
    }
    
    createLensFlare() {
        const lensFlareSystem = new BABYLON.LensFlareSystem("lensFlare", this.gameEngine.light, this.scene);
        
        // اضافه کردن flare های مختلف
        const flare1 = new BABYLON.LensFlare(0.2, 0, new BABYLON.Color3(1, 1, 1), "https://i.imgur.com/8N3y7c2.png", lensFlareSystem);
        const flare2 = new BABYLON.LensFlare(0.5, 0.2, new BABYLON.Color3(0.5, 0.5, 1), "https://i.imgur.com/8N3y7c2.png", lensFlareSystem);
        const flare3 = new BABYLON.LensFlare(0.2, 1.0, new BABYLON.Color3(1, 1, 0.5), "https://i.imgur.com/8N3y7c2.png", lensFlareSystem);
        
        this.specialEffects.set("lensFlare", lensFlareSystem);
    }
    
    createGlowEffect() {
        // ایجاد افکت درخشش برای ساختمان‌های خاص
        const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
        glowLayer.intensity = 0.5;
        
        this.specialEffects.set("glow", glowLayer);
    }
    
    createShadowEffect() {
        // ایجاد سایه‌های پیشرفته
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, this.gameEngine.light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.5);
        
        this.specialEffects.set("shadow", shadowGenerator);
    }
    
    createReflectionEffect() {
        // ایجاد افکت انعکاس
        const reflectionProbe = new BABYLON.ReflectionProbe("reflection", 512, this.scene);
        this.specialEffects.set("reflection", reflectionProbe);
    }
    
    createPostProcessEffects() {
        // ایجاد افکت‌های پس‌پردازش
        this.createBloomEffect();
        this.createDepthOfFieldEffect();
        this.createColorGradingEffect();
        this.createMotionBlurEffect();
    }
    
    createBloomEffect() {
        const bloomEffect = new BABYLON.BloomEffect("bloom", this.scene, 1.0, 256);
        bloomEffect.threshold = 0.8;
        bloomEffect.weight = 0.5;
        bloomEffect.kernel = 64;
        
        this.specialEffects.set("bloom", bloomEffect);
    }
    
    createDepthOfFieldEffect() {
        const depthOfField = new BABYLON.DepthOfFieldEffect(this.scene, this.gameEngine.camera, {
            blurLevel: 0.5,
            focalLength: 10,
            fStop: 1.4,
            distance: 100
        });
        
        this.specialEffects.set("depthOfField", depthOfField);
    }
    
    createColorGradingEffect() {
        const colorGrading = new BABYLON.ColorGradingEffect("colorGrading", this.scene);
        colorGrading.setColorGradingTexture("https://i.imgur.com/8N3y7c2.png");
        
        this.specialEffects.set("colorGrading", colorGrading);
    }
    
    createMotionBlurEffect() {
        const motionBlur = new BABYLON.MotionBlurEffect(this.scene, this.gameEngine.camera, {
            motionStrength: 0.5,
            motionBlurEnabled: true
        });
        
        this.specialEffects.set("motionBlur", motionBlur);
    }
    
    setupEventListeners() {
        // ثبت رویدادها برای انیمیشن‌های مختلف
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateAnimations();
        });
    }
    
    // متدهای عمومی برای پخش انیمیشن‌ها
    playBuildAnimation(mesh, position) {
        this.playAnimation(mesh, "build", position);
        this.playParticles("build", position);
        this.playLightEffect("build", position);
        this.playSound("build");
    }
    
    playUpgradeAnimation(mesh, position) {
        this.playAnimation(mesh, "upgrade", position);
        this.playParticles("magic", position);
        this.playLightEffect("magic", position);
        this.playSound("upgrade");
    }
    
    playAttackAnimation(mesh, position) {
        this.playAnimation(mesh, "attack", position);
        this.playParticles("attack", position);
        this.playLightEffect("attack", position);
        this.playSound("attack");
    }
    
    playExplosionAnimation(position) {
        this.playParticles("explosion", position);
        this.playLightEffect("attack", position);
        this.playSound("explosion");
    }
    
    playDeathAnimation(mesh, position) {
        this.playAnimation(mesh, "death", position);
        this.playParticles("smoke", position);
        this.playSound("explosion");
    }
    
    playResourceCollectionAnimation(type, position) {
        this.playParticles(type, position);
        this.playSound("click");
    }
    
    // متدهای کمکی
    playAnimation(mesh, animationName, position) {
        const animation = this.animations.get(animationName);
        if (animation && mesh) {
            mesh.animations = [];
            mesh.animations.push(animation);
            this.scene.beginAnimation(mesh, 0, animation.getKeys()[animation.getKeys().length - 1].frame, false);
        }
    }
    
    playParticles(particleName, position) {
        const particles = this.particleSystems.get(particleName);
        if (particles) {
            particles.emitter = position;
            particles.start();
            
            // توقف خودکار پس از مدت زمان مشخص
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
            
            // کاهش تدریجی شدت نور
            const fadeOut = setInterval(() => {
                light.intensity -= 0.1;
                if (light.intensity <= 0) {
                    light.intensity = 0;
                    clearInterval(fadeOut);
                }
            }, 50);
        }
    }
    
    playSound(soundName, volume = 1) {
        const sound = this.soundEffects.get(soundName);
        if (sound) {
            sound.play(volume);
        }
    }
    
    updateAnimations() {
        // به‌روزرسانی انیمیشن‌های مداوم
        this.updateUnitAnimations();
        this.updateEnvironmentAnimations();
        this.updateParticleSystems();
    }
    
    updateUnitAnimations() {
        // به‌روزرسانی انیمیشن‌های واحدهای متحرک
        this.gameEngine.units.forEach(unit => {
            if (unit.state === "moving") {
                this.applyWalkAnimation(unit.mesh);
            }
            
            if (unit.type === "dragon") {
                this.applyDragonAnimations(unit.mesh);
            }
        });
    }
    
    applyWalkAnimation(mesh) {
        if (!mesh) return;
        
        // انیمیشن راه رفتن ساده
        mesh.position.y = 0.1 + Math.sin(Date.now() * 0.01) * 0.05;
    }
    
    applyDragonAnimations(mesh) {
        if (!mesh) return;
        
        // انیمیشن پرواز اژدها
        mesh.position.y = 2 + Math.sin(Date.now() * 0.005) * 0.3;
        
        // انیمیشن بال زدن
        const wings = mesh.getChildren ? mesh.getChildren() : [];
        wings.forEach(wing => {
            if (wing.name && wing.name.includes("Wing")) {
                wing.rotation.z = Math.sin(Date.now() * 0.01) * 0.2;
            }
        });
    }
    
    updateEnvironmentAnimations() {
        // به‌روزرسانی انیمیشن‌های محیطی
        const time = Date.now() * 0.001;
        
        // انیمیشن آب
        const waterMeshes = this.scene.meshes.filter(mesh => mesh.name && mesh.name.includes("Water"));
        waterMeshes.forEach(water => {
            water.position.y = Math.sin(time) * 0.05;
        });
        
        // انیمیشن درختان
        const treeMeshes = this.scene.meshes.filter(mesh => mesh.name && mesh.name.includes("Tree"));
        treeMeshes.forEach(tree => {
            tree.rotation.z = Math.sin(time + tree.position.x * 0.1) * 0.02;
        });
    }
    
    updateParticleSystems() {
        // به‌روزرسانی سیستم‌های ذرات فعال
        this.particleSystems.forEach((particles, name) => {
            if (particles && particles.isStarted()) {
                // به‌روزرسانی موقعیت ذرات بر اساس موقعیت emitter
                // (در صورت نیاز به دنبال کردن یک mesh خاص)
            }
        });
    }
    
    // متدهای پیشرفته برای انیمیشن‌های پیچیده
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
    
    createSequenceAnimation(animations, delays) {
        // ایجاد انیمیشن‌های متوالی با تاخیرهای مشخص
        animations.forEach((animation, index) => {
            setTimeout(() => {
                animation.play();
            }, delays[index] || 0);
        });
    }
    
    createLoopedAnimation(mesh, animationName, speed = 1) {
        // ایجاد انیمیشن حلقه‌ای
        const animation = this.animations.get(animationName);
        if (animation && mesh) {
            mesh.animations = [animation];
            this.scene.beginAnimation(mesh, 0, animation.getKeys()[animation.getKeys().length - 1].frame, true, speed);
        }
    }
    
    stopAllAnimations(mesh) {
        // توقف همه انیمیشن‌های یک mesh
        if (mesh) {
            this.scene.stopAnimation(mesh);
        }
    }
    
    // متدهای مدیریت افکت‌های ویژه
    enableGlowEffect(mesh) {
        const glowLayer = this.specialEffects.get("glow");
        if (glowLayer && mesh) {
            glowLayer.referenceMeshToUseItsOwnMaterial(mesh);
        }
    }
    
    disableGlowEffect(mesh) {
        const glowLayer = this.specialEffects.get("glow");
        if (glowLayer && mesh) {
            glowLayer.removeIncludedOnlyMesh(mesh);
        }
    }
    
    enableBloomEffect() {
        const bloom = this.specialEffects.get("bloom");
        if (bloom) {
            bloom.isEnabled = true;
        }
    }
    
    disableBloomEffect() {
        const bloom = this.specialEffects.get("bloom");
        if (bloom) {
            bloom.isEnabled = false;
        }
    }
    
    // متدهای مدیریت صدا
    setMasterVolume(volume) {
        this.soundEffects.forEach(sound => {
            sound.setVolume(volume);
        });
    }
    
    stopAllSounds() {
        this.soundEffects.forEach(sound => {
            sound.stop();
        });
    }
}

// کلاس‌های کمکی برای مدیریت timeline و transition
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
    
    stopTimeline(timelineName) {
        const timeline = this.timelines.get(timelineName);
        if (timeline) {
            timeline.isPlaying = false;
            this.activeTimelines.delete(timelineName);
        }
    }
    
    update(deltaTime) {
        this.activeTimelines.forEach(timelineName => {
            const timeline = this.timelines.get(timelineName);
            if (timeline) {
                timeline.currentTime += deltaTime;
                
                // اجرای keyframe‌های مربوطه
                timeline.keyframes.forEach(keyframe => {
                    if (keyframe.time <= timeline.currentTime && keyframe.time > timeline.currentTime - deltaTime) {
                        keyframe.callback();
                    }
                });
                
                // پایان timeline
                if (timeline.currentTime >= timeline.duration) {
                    this.stopTimeline(timelineName);
                }
            }
        });
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
                
                // اعمال تابع easing
                const easedProgress = this.applyEasing(progress, transition.easing);
                
                // محاسبه مقدار فعلی
                const currentValue = this.interpolate(
                    transition.startValue,
                    transition.endValue,
                    easedProgress
                );
                
                // اعمال مقدار به target
                this.setProperty(transition.target, transition.property, currentValue);
                
                // بررسی پایان transition
                if (progress >= 1) {
                    transition.isComplete = true;
                    completedTransitions.push(id);
                }
            }
        });
        
        // حذف transition های کامل شده
        completedTransitions.forEach(id => {
            this.activeTransitions.delete(id);
            this.transitions.delete(id);
        });
    }
    
    applyEasing(progress, easing) {
        switch (easing) {
            case "easeIn":
                return progress * progress;
            case "easeOut":
                return 1 - (1 - progress) * (1 - progress);
            case "easeInOut":
                return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            case "bounce":
                return this.bounceEasing(progress);
            default: // linear
                return progress;
        }
    }
    
    bounceEasing(progress) {
        if (progress < 1 / 2.75) {
            return 7.5625 * progress * progress;
        } else if (progress < 2 / 2.75) {
            return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
        } else if (progress < 2.5 / 2.75) {
            return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
        } else {
            return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
        }
    }
    
    interpolate(start, end, progress) {
        if (typeof start === "number" && typeof end === "number") {
            return start + (end - start) * progress;
        } else if (start instanceof BABYLON.Vector3 && end instanceof BABYLON.Vector3) {
            return BABYLON.Vector3.Lerp(start, end, progress);
        } else if (start instanceof BABYLON.Color3 && end instanceof BABYLON.Color3) {
            return BABYLON.Color3.Lerp(start, end, progress);
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
    
    cancelTransition(id) {
        this.activeTransitions.delete(id);
        this.transitions.delete(id);
    }
    
    cancelAllTransitions() {
        this.activeTransitions.clear();
        this.transitions.clear();
    }
}

// اضافه کردن AnimationManager به GameEngine
if (typeof GameEngine !== 'undefined') {
    GameEngine.prototype.initAnimations = function() {
        this.animationManager = new AnimationManager(this);
    };
    
    // گسترش متد init اصلی
    const originalInit = GameEngine.prototype.init;
    GameEngine.prototype.init = function() {
        originalInit.call(this);
        this.initAnimations();
    };
    
    // گسترش متدهای موجود برای پشتیبانی از انیمیشن
    const originalCreateBuilding = GameEngine.prototype.createBuilding;
    GameEngine.prototype.createBuilding = function(type, position) {
        const building = originalCreateBuilding.call(this, type, position);
        
        // پخش انیمیشن ساخت
        if (this.animationManager) {
            this.animationManager.playBuildAnimation(building.mesh, position);
        }
        
        return building;
    };
    
    const originalBuyUnit = GameEngine.prototype.buyUnit;
    GameEngine.prototype.buyUnit = function(unitType) {
        originalBuyUnit.call(this, unitType);
        
        // پخش انیمیشن آموزش سرباز
        if (this.animationManager) {
            const barracks = this.buildings.find(b => b.type === "barracks");
            if (barracks) {
                this.animationManager.playMagicAnimation(barracks.mesh, barracks.position);
            }
        }
    };
}

console.log("فایل m3.js - سیستم انیمیشن و افکت‌ها بارگذاری شد");
