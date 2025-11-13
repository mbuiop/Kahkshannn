// particle-manager.js - مدیریت سیستم ذرات و افکت‌های بصری
class ParticleManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        this.particleSystems = new Map();
        this.activeEffects = new Map();
        
        this.init();
    }

    async init() {
        await this.createParticleSystems();
        this.setupEventListeners();
        console.log('Particle Manager initialized successfully');
    }

    async createParticleSystems() {
        // ایجاد سیستم‌های ذره‌ای برای افکت‌های مختلف
        this.particleSystems.set('explosion', this.createExplosionSystem());
        this.particleSystems.set('sparkle', this.createSparkleSystem());
        this.particleSystems.set('smoke', this.createSmokeSystem());
        this.particleSystems.set('magic', this.createMagicSystem());
    }

    createExplosionSystem() {
        const particleSystem = new BABYLON.ParticleSystem("explosionParticles", 2000, this.scene);
        
        // تنظیمات پایه
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

    createSparkleSystem() {
        const particleSystem = new BABYLON.ParticleSystem("sparkleParticles", 500, this.scene);
        
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

    createSmokeSystem() {
        const particleSystem = new BABYLON.ParticleSystem("smokeParticles", 1000, this.scene);
        
        particleSystem.minSize = 0.2;
        particleSystem.maxSize = 0.5;
        particleSystem.minLifeTime = 1.0;
        particleSystem.maxLifeTime = 2.0;
        particleSystem.emitRate = 50;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.3;
        
        particleSystem.color1 = new BABYLON.Color4(0.5, 0.5, 0.5, 0.3);
        particleSystem.color2 = new BABYLON.Color4(0.3, 0.3, 0.3, 0.1);
        
        return particleSystem;
    }

    createMagicSystem() {
        const particleSystem = new BABYLON.ParticleSystem("magicParticles", 800, this.scene);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.25;
        particleSystem.minLifeTime = 0.8;
        particleSystem.maxLifeTime = 1.8;
        particleSystem.emitRate = 200;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        particleSystem.minEmitPower = 0.3;
        particleSystem.maxEmitPower = 0.8;
        
        particleSystem.color1 = new BABYLON.Color4(0.5, 0.8, 1, 0.8);
        particleSystem.color2 = new BABYLON.Color4(0.8, 0.5, 1, 0.6);
        
        return particleSystem;
    }

    setupEventListeners() {
        // گوش دادن به رویدادهای بازی
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateEffects();
        });
    }

    // متدهای اصلی افکت‌ها
    createExplosion(position, color = new BABYLON.Color3(1, 0.8, 0), intensity = 1.0) {
        const particleSystem = this.particleSystems.get('explosion');
        if (!particleSystem) return;
        
        // تنظیم موقعیت و پارامترها
        particleSystem.emitter = position;
        particleSystem.color1 = new BABYLON.Color4(color.r, color.g, color.b, 1);
        particleSystem.color2 = new BABYLON.Color4(color.r * 0.8, color.g * 0.8, color.b * 0.8, 1);
        
        // تنظیم شدت
        particleSystem.emitRate = 1000 * intensity;
        particleSystem.minEmitPower = 1 * intensity;
        particleSystem.maxEmitPower = 3 * intensity;
        
        // شروع سیستم
        particleSystem.start();
        
        // توقف خودکار
        const effectId = `explosion_${Date.now()}`;
        this.activeEffects.set(effectId, {
            stop: () => particleSystem.stop(),
            autoStop: setTimeout(() => {
                particleSystem.stop();
                this.activeEffects.delete(effectId);
            }, 1000)
        });
        
        // ایجاد افکت‌های مکمل
        this.createShockwave(position, intensity);
        this.createExplosionLight(position, intensity);
        
        return effectId;
    }

    createMatchEffect(position) {
        // ایجاد افکت تطابق موفق
        this.createSparkleEffect(position, new BABYLON.Color3(1, 1, 0));
        this.createMagicEffect(position);
    }

    createSparkleEffect(position, color = new BABYLON.Color3(1, 1, 1)) {
        const particleSystem = this.particleSystems.get('sparkle');
        if (!particleSystem) return;
        
        particleSystem.emitter = position;
        particleSystem.color1 = new BABYLON.Color4(color.r, color.g, color.b, 1);
        particleSystem.color2 = new BABYLON.Color4(color.r, color.g, color.b, 0.8);
        
        particleSystem.start();
        
        const effectId = `sparkle_${Date.now()}`;
        this.activeEffects.set(effectId, {
            stop: () => particleSystem.stop(),
            autoStop: setTimeout(() => {
                particleSystem.stop();
                this.activeEffects.delete(effectId);
            }, 500)
        });
        
        return effectId;
    }

    createMagicEffect(position) {
        const particleSystem = this.particleSystems.get('magic');
        if (!particleSystem) return;
        
        particleSystem.emitter = position;
        particleSystem.start();
        
        const effectId = `magic_${Date.now()}`;
        this.activeEffects.set(effectId, {
            stop: () => particleSystem.stop(),
            autoStop: setTimeout(() => {
                particleSystem.stop();
                this.activeEffects.delete(effectId);
            }, 1000)
        });
        
        return effectId;
    }

    createSmokeEffect(position, duration = 2000) {
        const particleSystem = this.particleSystems.get('smoke');
        if (!particleSystem) return;
        
        particleSystem.emitter = position;
        particleSystem.start();
        
        const effectId = `smoke_${Date.now()}`;
        this.activeEffects.set(effectId, {
            stop: () => particleSystem.stop(),
            autoStop: setTimeout(() => {
                particleSystem.stop();
                this.activeEffects.delete(effectId);
            }, duration)
        });
        
        return effectId;
    }

    // افکت‌های ویژه
    createShockwave(position, intensity = 1.0) {
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
            { frame: 30, value: new BABYLON.Vector3(20 * intensity, 20 * intensity, 20 * intensity) }
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

    createExplosionLight(position, intensity = 1.0) {
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

    createConnectionEffect(startPos, endPos, color = new BABYLON.Color3(1, 0.8, 0)) {
        // ایجاد خط اتصال متحرک
        const points = [startPos, endPos];
        const connectionLine = BABYLON.MeshBuilder.CreateLines("connectionLine", {
            points: points,
            updatable: true
        }, this.scene);
        
        connectionLine.color = color;
        
        // انیمیشن پالس
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
        
        const effectId = `connection_${Date.now()}`;
        this.activeEffects.set(effectId, {
            stop: () => {
                connectionLine.dispose();
            },
            line: connectionLine
        });
        
        return effectId;
    }

    createLineParticles(startPos, endPos, color) {
        const particleCount = 20;
        const direction = endPos.subtract(startPos);
        const segmentLength = direction.length() / particleCount;
        direction.normalize();
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const position = startPos.add(direction.scale(i * segmentLength));
                this.createSparkleEffect(position, color);
            }, i * 50);
        }
    }

    // افکت‌های محیطی
    createAmbientParticles(count = 50) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = BABYLON.MeshBuilder.CreateSphere(
                `ambient_particle_${i}`,
                { diameter: 0.1 },
                this.scene
            );
            
            // موقعیت تصادفی
            particle.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 30,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 30
            );
            
            const particleMaterial = new BABYLON.StandardMaterial(`ambient_particle_mat_${i}`, this.scene);
            particleMaterial.diffuseColor = new BABYLON.Color3(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            );
            particleMaterial.emissiveColor = particleMaterial.diffuseColor;
            particle.material = particleMaterial;
            
            // انیمیشن شناور
            this.addFloatingAnimation(particle);
            particles.push(particle);
        }
        
        return particles;
    }

    addFloatingAnimation(particle) {
        const startPos = particle.position.clone();
        const amplitude = 2;
        const speed = Math.random() * 0.5 + 0.5;

        this.scene.registerBeforeRender(() => {
            const time = Date.now() * 0.001 * speed;
            particle.position.x = startPos.x + Math.sin(time) * amplitude;
            particle.position.z = startPos.z + Math.cos(time * 0.7) * amplitude;
            particle.position.y = startPos.y + Math.sin(time * 1.3) * amplitude * 0.5;
        });
    }

    // مدیریت افکت‌ها
    updateEffects() {
        // به‌روزرسانی افکت‌های فعال
        // (می‌توان برای افکت‌های پیچیده‌تر استفاده شود)
    }

    stopEffect(effectId) {
        const effect = this.activeEffects.get(effectId);
        if (effect) {
            if (effect.stop) {
                effect.stop();
            }
            if (effect.autoStop) {
                clearTimeout(effect.autoStop);
            }
            this.activeEffects.delete(effectId);
        }
    }

    stopAllEffects() {
        this.activeEffects.forEach((effect, id) => {
            if (effect.stop) {
                effect.stop();
            }
            if (effect.autoStop) {
                clearTimeout(effect.autoStop);
            }
        });
        this.activeEffects.clear();
        
        // توقف تمام سیستم‌های ذرات
        this.particleSystems.forEach(system => {
            system.stop();
        });
    }

    setEnabled(enabled) {
        if (!enabled) {
            this.stopAllEffects();
        }
    }

    // متدهای تمیزکاری
    dispose() {
        this.stopAllEffects();
        
        this.particleSystems.forEach(system => {
            system.dispose();
        });
        this.particleSystems.clear();
    }
}

window.ParticleManager = ParticleManager;
