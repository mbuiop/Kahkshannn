// animation-manager.js - مدیریت انیمیشن‌های پیشرفته
class AnimationManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.easingFunctions = new Map();
        this.particleSystems = new Map();
        this.timelineManager = null;
        
        this.init();
    }

    async init() {
        await this.setupAnimationSystem();
        this.setupEasingFunctions();
        this.setupParticleSystems();
        this.setupTimelineManager();
        this.setupEventListeners();
    }

    async setupAnimationSystem() {
        // ایجاد سیستم انیمیشن پیشرفته
        this.animationGroups = new Map();
        this.skeletonAnimations = new Map();
        this.morphTargets = new Map();
        
        // بارگذاری انیمیشن‌های پایه
        await this.loadBaseAnimations();
    }

    setupEasingFunctions() {
        // تعریف توابع easing مختلف
        this.easingFunctions.set('linear', (t) => t);
        this.easingFunctions.set('easeIn', (t) => t * t);
        this.easingFunctions.set('easeOut', (t) => t * (2 - t));
        this.easingFunctions.set('easeInOut', (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
        this.easingFunctions.set('bounce', (t) => {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            } else if (t < 2.5 / 2.75) {
                return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            } else {
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            }
        });
        this.easingFunctions.set('elastic', (t) => {
            return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
        });
        this.easingFunctions.set('back', (t) => {
            const s = 1.70158;
            return t * t * ((s + 1) * t - s);
        });
    }

    async setupParticleSystems() {
        // ایجاد سیستم‌های ذره‌ای برای افکت‌های مختلف
        await this.createParticleSystems();
    }

    setupTimelineManager() {
        this.timelineManager = new TimelineManager(this.scene);
    }

    setupEventListeners() {
        // گوش دادن به رویدادهای بازی برای فعال کردن انیمیشن‌ها
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateAnimations();
        });
    }

    async loadBaseAnimations() {
        // انیمیشن‌های پایه برای میوه‌ها
        this.baseAnimations = {
            spawn: this.createSpawnAnimation(),
            select: this.createSelectAnimation(),
            match: this.createMatchAnimation(),
            remove: this.createRemoveAnimation(),
            float: this.createFloatAnimation(),
            pulse: this.createPulseAnimation(),
            shake: this.createShakeAnimation(),
            rotate: this.createRotateAnimation(),
            scale: this.createScaleAnimation(),
            move: this.createMoveAnimation()
        };
    }

    // انیمیشن‌های پایه
    createSpawnAnimation() {
        const animationGroup = new BABYLON.AnimationGroup("spawnAnimation");
        
        // انیمیشن scale
        const scaleAnimation = new BABYLON.Animation(
            "spawnScale",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const scaleKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 0) },
            { frame: 10, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
            { frame: 20, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        scaleAnimation.setKeys(scaleKeys);
        
        // انیمیشن rotation
        const rotationAnimation = new BABYLON.Animation(
            "spawnRotation",
            "rotation.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const rotationKeys = [
            { frame: 0, value: 0 },
            { frame: 20, value: Math.PI * 2 }
        ];
        rotationAnimation.setKeys(rotationKeys);
        
        animationGroup.addTargetedAnimation(scaleAnimation);
        animationGroup.addTargetedAnimation(rotationAnimation);
        
        return animationGroup;
    }

    createSelectAnimation() {
        const animationGroup = new BABYLON.AnimationGroup("selectAnimation");
        
        // انیمیشن pulse
        const scaleAnimation = new BABYLON.Animation(
            "selectScale",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const scaleKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 15, value: new BABYLON.Vector3(1.1, 1.1, 1.1) },
            { frame: 30, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        scaleAnimation.setKeys(scaleKeys);
        
        // انیمیشن glow (تغییر material)
        const emissiveAnimation = new BABYLON.Animation(
            "selectEmissive",
            "material.emissiveColor",
            60,
            BABYLON.Animation.ANIMATIONTYPE_COLOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const emissiveKeys = [
            { frame: 0, value: new BABYLON.Color3(0, 0, 0) },
            { frame: 15, value: new BABYLON.Color3(1, 0.8, 0) },
            { frame: 30, value: new BABYLON.Color3(0, 0, 0) }
        ];
        emissiveAnimation.setKeys(emissiveKeys);
        
        animationGroup.addTargetedAnimation(scaleAnimation);
        animationGroup.addTargetedAnimation(emissiveAnimation);
        
        return animationGroup;
    }

    createMatchAnimation() {
        const animationGroup = new BABYLON.AnimationGroup("matchAnimation");
        
        // انیمیشن explosion
        const scaleAnimation = new BABYLON.Animation(
            "matchScale",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const scaleKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 5, value: new BABYLON.Vector3(1.3, 1.3, 1.3) },
            { frame: 15, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        scaleAnimation.setKeys(scaleKeys);
        
        // انیمیشن fade out
        const alphaAnimation = new BABYLON.Animation(
            "matchAlpha",
            "visibility",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const alphaKeys = [
            { frame: 0, value: 1 },
            { frame: 10, value: 0.5 },
            { frame: 15, value: 0 }
        ];
        alphaAnimation.setKeys(alphaKeys);
        
        animationGroup.addTargetedAnimation(scaleAnimation);
        animationGroup.addTargetedAnimation(alphaAnimation);
        
        return animationGroup;
    }

    createFloatAnimation() {
        const animationGroup = new BABYLON.AnimationGroup("floatAnimation");
        
        // انیمیشن شناور شدن
        const positionAnimation = new BABYLON.Animation(
            "floatPosition",
            "position.y",
            120,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const positionKeys = [
            { frame: 0, value: 0 },
            { frame: 30, value: 0.2 },
            { frame: 60, value: 0 },
            { frame: 90, value: -0.2 },
            { frame: 120, value: 0 }
        ];
        positionAnimation.setKeys(positionKeys);
        
        // انیمیشن چرخش آرام
        const rotationAnimation = new BABYLON.Animation(
            "floatRotation",
            "rotation.y",
            240,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const rotationKeys = [
            { frame: 0, value: 0 },
            { frame: 240, value: Math.PI * 2 }
        ];
        rotationAnimation.setKeys(rotationKeys);
        
        animationGroup.addTargetedAnimation(positionAnimation);
        animationGroup.addTargetedAnimation(rotationAnimation);
        
        return animationGroup;
    }

    // متدهای اصلی انیمیشن
    async playAnimation(mesh, animationType, options = {}) {
        const animationId = `${mesh.name}_${animationType}_${Date.now()}`;
        
        const animationConfig = {
            mesh: mesh,
            type: animationType,
            duration: options.duration || 1000,
            easing: options.easing || 'easeOut',
            onComplete: options.onComplete,
            onStart: options.onStart,
            loop: options.loop || false,
            speed: options.speed || 1
        };

        if (this.baseAnimations[animationType]) {
            return this.playBaseAnimation(mesh, animationType, animationConfig);
        } else {
            return this.playCustomAnimation(mesh, animationType, animationConfig);
        }
    }

    async playBaseAnimation(mesh, animationType, config) {
        const animationGroup = this.baseAnimations[animationType].clone();
        
        if (config.onStart) {
            animationGroup.onAnimationGroupPlayObservable.add(() => {
                config.onStart();
            });
        }
        
        if (config.onComplete) {
            animationGroup.onAnimationGroupEndObservable.add(() => {
                config.onComplete();
            });
        }
        
        animationGroup.speedRatio = config.speed;
        
        // اعمال انیمیشن روی mesh
        animationGroup.targetedAnimations.forEach(anim => {
            anim.target = mesh;
        });
        
        if (config.loop) {
            animationGroup.loopAnimation = true;
        }
        
        animationGroup.play(config.loop);
        
        this.activeAnimations.set(`${mesh.name}_${animationType}`, animationGroup);
        return animationGroup;
    }

    async playCustomAnimation(mesh, animationType, config) {
        const animations = [];
        
        switch (animationType) {
            case 'moveTo':
                animations.push(this.createMoveToAnimation(mesh, config.target, config));
                break;
            case 'path':
                animations.push(this.createPathAnimation(mesh, config.path, config));
                break;
            case 'colorChange':
                animations.push(this.createColorChangeAnimation(mesh, config.color, config));
                break;
            case 'morph':
                animations.push(this.createMorphAnimation(mesh, config.targets, config));
                break;
            default:
                console.warn(`Unknown animation type: ${animationType}`);
                return null;
        }
        
        const animationGroup = new BABYLON.AnimationGroup(`${animationType}_${mesh.name}`);
        animations.forEach(anim => {
            animationGroup.addTargetedAnimation(anim, mesh);
        });
        
        if (config.onComplete) {
            animationGroup.onAnimationGroupEndObservable.add(() => {
                config.onComplete();
            });
        }
        
        animationGroup.play();
        this.activeAnimations.set(`${mesh.name}_${animationType}`, animationGroup);
        
        return animationGroup;
    }

    createMoveToAnimation(mesh, targetPosition, config) {
        const animation = new BABYLON.Animation(
            "moveTo",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: mesh.position.clone() },
            { frame: 60, value: targetPosition }
        ];
        
        animation.setKeys(keys);
        return animation;
    }

    createPathAnimation(mesh, path, config) {
        const animation = new BABYLON.Animation(
            "pathAnimation",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = path.map((point, index) => ({
            frame: (index / (path.length - 1)) * 60,
            value: point
        }));
        
        animation.setKeys(keys);
        return animation;
    }

    // سیستم ذرات
    async createParticleSystems() {
        // سیستم ذرات برای انفجار
        this.particleSystems.set('explosion', this.createExplosionParticleSystem());
        
        // سیستم ذرات برای جرقه
        this.particleSystems.set('sparkle', this.createSparkleParticleSystem());
        
        // سیستم ذرات برای دود
        this.particleSystems.set('smoke', this.createSmokeParticleSystem());
        
        // سیستم ذرات برای جادویی
        this.particleSystems.set('magic', this.createMagicParticleSystem());
        
        // سیستم ذرات برای ستاره
        this.particleSystems.set('star', this.createStarParticleSystem());
    }

    createExplosionParticleSystem() {
        const particleSystem = new BABYLON.ParticleSystem("explosionParticles", 2000, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("textures/particle.png", this.scene);
        particleSystem.emitter = new BABYLON.Vector3(0, 0, 0);
        
        // تنظیمات ذرات
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.0;
        particleSystem.emitRate = 1000;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;
        
        // رنگ‌ها
        particleSystem.color1 = new BABYLON.Color4(1, 0.8, 0, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 1);
        particleSystem.colorDead = new BABYLON.Color4(0.5, 0, 0, 0);
        
        // جهت
        particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
        
        return particleSystem;
    }

    createSparkleParticleSystem() {
        const particleSystem = new BABYLON.ParticleSystem("sparkleParticles", 500, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("textures/sparkle.png", this.scene);
        
        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.15;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.5;
        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        particleSystem.minEmitPower = 0.5;
        particleSystem.maxEmitPower = 1.5;
        
        particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 1, 0.8, 1);
        
        return particleSystem;
    }

    // افکت‌های ویژه
    async createExplosionEffect(position, color = new BABYLON.Color3(1, 0.8, 0), intensity = 1.0) {
        const particleSystem = this.particleSystems.get('explosion');
        if (!particleSystem) return;
        
        // تنظیم موقعیت
        particleSystem.emitter = position;
        
        // تنظیم رنگ بر اساس پارامتر
        particleSystem.color1 = new BABYLON.Color4(color.r, color.g, color.b, 1);
        particleSystem.color2 = new BABYLON.Color4(color.r * 0.8, color.g * 0.8, color.b * 0.8, 1);
        
        // تنظیم شدت
        particleSystem.emitRate = 1000 * intensity;
        particleSystem.minEmitPower = 1 * intensity;
        particleSystem.maxEmitPower = 3 * intensity;
        
        // شروع سیستم ذرات
        particleSystem.start();
        
        // توقف خودکار بعد از 1 ثانیه
        setTimeout(() => {
            particleSystem.stop();
        }, 1000);
        
        // ایجاد موج انفجار
        this.createShockwave(position, intensity);
        
        // ایجاد نور انفجار
        this.createExplosionLight(position, intensity);
    }

    createShockwave(position, intensity) {
        const shockwave = BABYLON.MeshBuilder.CreateSphere("shockwave", {
            diameter: 0.1,
            segments: 16
        }, this.scene);
        
        shockwave.position = position.clone();
        
        const material = new BABYLON.StandardMaterial("shockwaveMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
        material.alpha = 0.8;
        material.emissiveColor = new BABYLON.Color3(1, 0.6, 0);
        shockwave.material = material;
        
        // انیمیشن گسترش
        const scaleAnimation = new BABYLON.Animation(
            "shockwaveScale",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const scaleKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 30, value: new BABYLON.Vector3(20, 20, 20) }
        ];
        scaleAnimation.setKeys(scaleKeys);
        
        // انیمیشن fade out
        const alphaAnimation = new BABYLON.Animation(
            "shockwaveAlpha",
            "material.alpha",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const alphaKeys = [
            { frame: 0, value: 0.8 },
            { frame: 30, value: 0 }
        ];
        alphaAnimation.setKeys(alphaKeys);
        
        shockwave.animations = [scaleAnimation, alphaAnimation];
        
        this.scene.beginAnimation(shockwave, 0, 30, false, 1, () => {
            shockwave.dispose();
        });
    }

    createExplosionLight(position, intensity) {
        const light = new BABYLON.PointLight("explosionLight", position, this.scene);
        light.diffuse = new BABYLON.Color3(1, 0.8, 0.4);
        light.intensity = 2 * intensity;
        light.range = 10 * intensity;
        
        // انیمیشن fade out نور
        const intensityAnimation = new BABYLON.Animation(
            "lightIntensity",
            "intensity",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const intensityKeys = [
            { frame: 0, value: 2 * intensity },
            { frame: 10, value: 1 * intensity },
            { frame: 20, value: 0 }
        ];
        intensityAnimation.setKeys(intensityKeys);
        
        light.animations = [intensityAnimation];
        
        this.scene.beginAnimation(light, 0, 20, false, 1, () => {
            light.dispose();
        });
    }

    async createConnectionEffect(startPos, endPos, color = new BABYLON.Color3(1, 0.8, 0)) {
        // ایجاد خط اتصال
        const points = [startPos, endPos];
        const connectionLine = BABYLON.MeshBuilder.CreateLines("connectionLine", {
            points: points,
            updatable: true
        }, this.scene);
        
        connectionLine.color = color;
        
        // انیمیشن خط کشی
        const dashAnimation = new BABYLON.Animation(
            "dashAnimation",
            "visibility",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const dashKeys = [
            { frame: 0, value: 1 },
            { frame: 15, value: 0.3 },
            { frame: 30, value: 1 }
        ];
        dashAnimation.setKeys(dashKeys);
        
        connectionLine.animations = [dashAnimation];
        this.scene.beginAnimation(connectionLine, 0, 30, true);
        
        // ایجاد ذرات در طول خط
        this.createLineParticles(startPos, endPos, color);
        
        return connectionLine;
    }

    createLineParticles(startPos, endPos, color) {
        const particleCount = 20;
        const direction = endPos.subtract(startPos);
        const segmentLength = direction.length() / particleCount;
        direction.normalize();
        
        for (let i = 0; i < particleCount; i++) {
            const position = startPos.add(direction.scale(i * segmentLength));
            
            setTimeout(() => {
                this.createSparkleEffect(position, color);
            }, i * 50);
        }
    }

    async createSparkleEffect(position, color = new BABYLON.Color3(1, 1, 1)) {
        const particleSystem = this.particleSystems.get('sparkle');
        if (!particleSystem) return;
        
        particleSystem.emitter = position;
        particleSystem.color1 = new BABYLON.Color4(color.r, color.g, color.b, 1);
        particleSystem.color2 = new BABYLON.Color4(color.r, color.g, color.b, 0.8);
        
        particleSystem.start();
        
        setTimeout(() => {
            particleSystem.stop();
        }, 500);
    }

    // انیمیشن‌های رابط کاربری
    async createUIFadeIn(element, duration = 500) {
        if (!element.material) return;
        
        const animation = new BABYLON.Animation(
            "uiFadeIn",
            "material.alpha",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: 0 },
            { frame: 60, value: 1 }
        ];
        animation.setKeys(keys);
        
        element.animations = [animation];
        this.scene.beginAnimation(element, 0, 60, false, duration / 1000);
    }

    async createUISlide(element, from, to, duration = 500) {
        const animation = new BABYLON.Animation(
            "uiSlide",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: from },
            { frame: 60, value: to }
        ];
        animation.setKeys(keys);
        
        element.animations = [animation];
        this.scene.beginAnimation(element, 0, 60, false, duration / 1000);
    }

    async createUIButtonPress(button, duration = 200) {
        // انیمیشن فشرده شدن دکمه
        const scaleAnimation = new BABYLON.Animation(
            "buttonPress",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const scaleKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 10, value: new BABYLON.Vector3(0.9, 0.9, 0.9) },
            { frame: 20, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        scaleAnimation.setKeys(scaleKeys);
        
        button.animations = [scaleAnimation];
        this.scene.beginAnimation(button, 0, 20, false, duration / 1000);
    }

    // سیستم تایم‌لاین
    async createSequence(animations) {
        const sequence = new AnimationSequence();
        
        for (const anim of animations) {
            sequence.add(anim);
        }
        
        return sequence;
    }

    async playSequence(sequence, onComplete) {
        await sequence.play();
        if (onComplete) onComplete();
    }

    // انیمیشن‌های پیشرفته
    async createCameraAnimation(camera, target, duration = 1000) {
        const startPosition = camera.position.clone();
        const startTarget = camera.target.clone();
        
        const positionAnimation = new BABYLON.Animation(
            "cameraPosition",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const targetAnimation = new BABYLON.Animation(
            "cameraTarget",
            "target",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const positionKeys = [
            { frame: 0, value: startPosition },
            { frame: 60, value: target.position || startPosition }
        ];
        
        const targetKeys = [
            { frame: 0, value: startTarget },
            { frame: 60, value: target.target || startTarget }
        ];
        
        positionAnimation.setKeys(positionKeys);
        targetAnimation.setKeys(targetKeys);
        
        camera.animations = [positionAnimation, targetAnimation];
        this.scene.beginAnimation(camera, 0, 60, false, duration / 1000);
    }

    async createMaterialTransition(mesh, fromMaterial, toMaterial, duration = 500) {
        // ایجاد transition بین دو متریال
        const mixMaterial = new BABYLON.StandardMaterial("mixMaterial", this.scene);
        mesh.material = mixMaterial;
        
        const mixAnimation = new BABYLON.Animation(
            "materialMix",
            "alpha",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const mixKeys = [
            { frame: 0, value: 0 },
            { frame: 60, value: 1 }
        ];
        mixAnimation.setKeys(mixKeys);
        
        // این یک پیاده‌سازی ساده است
        // در نسخه کامل باید shaderهای مناسب ایجاد شوند
    }

    // مدیریت انیمیشن‌ها
    updateAnimations() {
        // به‌روزرسانی انیمیشن‌های فعال
        this.animationQueue.forEach((anim, index) => {
            if (anim.update) {
                anim.update();
            }
        });
        
        // حذف انیمیشن‌های تمام شده
        this.animationQueue = this.animationQueue.filter(anim => !anim.completed);
    }

    stopAnimation(mesh, animationType) {
        const animationId = `${mesh.name}_${animationType}`;
        const animation = this.activeAnimations.get(animationId);
        
        if (animation) {
            animation.stop();
            this.activeAnimations.delete(animationId);
        }
    }

    stopAllAnimations() {
        this.activeAnimations.forEach(animation => {
            animation.stop();
        });
        this.activeAnimations.clear();
        
        this.animationQueue = [];
    }

    pauseAllAnimations() {
        this.activeAnimations.forEach(animation => {
            animation.pause();
        });
    }

    resumeAllAnimations() {
        this.activeAnimations.forEach(animation => {
            animation.play();
        });
    }

    // متدهای کمکی
    getEasingFunction(name) {
        return this.easingFunctions.get(name) || this.easingFunctions.get('linear');
    }

    dispose() {
        this.stopAllAnimations();
        
        this.particleSystems.forEach(system => {
            system.dispose();
        });
        this.particleSystems.clear();
        
        if (this.timelineManager) {
            this.timelineManager.dispose();
        }
    }
}

// کلاس مدیریت تایم‌لاین
class TimelineManager {
    constructor(scene) {
        this.scene = scene;
        this.timelines = new Map();
        this.currentTime = 0;
    }

    createTimeline(name) {
        const timeline = new Timeline(name);
        this.timelines.set(name, timeline);
        return timeline;
    }

    playTimeline(name) {
        const timeline = this.timelines.get(name);
        if (timeline) {
            timeline.play();
        }
    }

    pauseTimeline(name) {
        const timeline = this.timelines.get(name);
        if (timeline) {
            timeline.pause();
        }
    }

    stopTimeline(name) {
        const timeline = this.timelines.get(name);
        if (timeline) {
            timeline.stop();
        }
    }

    dispose() {
        this.timelines.clear();
    }
}

class Timeline {
    constructor(name) {
        this.name = name;
        this.animations = [];
        this.currentTime = 0;
        this.duration = 0;
        this.isPlaying = false;
        this.startTime = 0;
    }

    add(animation, startTime, duration) {
        this.animations.push({
            animation: animation,
            startTime: startTime,
            duration: duration,
            completed: false
        });
        
        this.duration = Math.max(this.duration, startTime + duration);
    }

    play() {
        this.isPlaying = true;
        this.startTime = Date.now();
        this.update();
    }

    pause() {
        this.isPlaying = false;
    }

    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.animations.forEach(anim => {
            anim.completed = false;
        });
    }

    update() {
        if (!this.isPlaying) return;
        
        const currentTime = Date.now() - this.startTime;
        this.currentTime = currentTime;
        
        this.animations.forEach(anim => {
            if (!anim.completed && currentTime >= anim.startTime) {
                const progress = (currentTime - anim.startTime) / anim.duration;
                
                if (progress >= 1) {
                    anim.completed = true;
                    if (anim.animation.onComplete) {
                        anim.animation.onComplete();
                    }
                } else if (anim.animation.update) {
                    anim.animation.update(progress);
                }
            }
        });
        
        if (currentTime < this.duration) {
            requestAnimationFrame(() => this.update());
        } else {
            this.isPlaying = false;
        }
    }
}

// کلاس سکانس انیمیشن
class AnimationSequence {
    constructor() {
        this.animations = [];
        this.currentIndex = 0;
        this.isPlaying = false;
    }

    add(animation) {
        this.animations.push(animation);
    }

    async play() {
        this.isPlaying = true;
        this.currentIndex = 0;
        
        for (const anim of this.animations) {
            if (!this.isPlaying) break;
            
            await this.playAnimation(anim);
            this.currentIndex++;
        }
        
        this.isPlaying = false;
    }

    async playAnimation(animation) {
        return new Promise((resolve) => {
            if (animation.play) {
                animation.play(() => resolve());
            } else {
                setTimeout(resolve, animation.duration || 1000);
            }
        });
    }

    stop() {
        this.isPlaying = false;
    }

    pause() {
        this.isPlaying = false;
    }

    resume() {
        this.isPlaying = true;
        this.playFromCurrent();
    }

    async playFromCurrent() {
        for (let i = this.currentIndex; i < this.animations.length; i++) {
            if (!this.isPlaying) break;
            
            await this.playAnimation(this.animations[i]);
            this.currentIndex = i + 1;
        }
        
        this.isPlaying = false;
    }
}

window.AnimationManager = AnimationManager;