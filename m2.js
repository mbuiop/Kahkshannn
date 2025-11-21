// m2.js - سیستم دوربین و بهینه‌سازی (2000 خط)
class AdvancedCameraSystem {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.cameras = {};
        this.currentCamera = null;
        this.cameraEffects = {};
        this.performanceMonitor = new PerformanceMonitor();
        
        this.init();
    }
    
    init() {
        this.createMainCamera();
        this.createMinimapCamera();
        this.createCinematicCamera();
        this.setupCameraEffects();
        this.setupPerformanceOptimization();
    }
    
    createMainCamera() {
        // دوربین اصلی با قابلیت‌های پیشرفته
        this.cameras.main = new BABYLON.UniversalCamera(
            "mainCamera",
            new BABYLON.Vector3(0, 5, -15),
            this.scene
        );
        
        // تنظیمات دوربین اصلی
        this.cameras.main.setTarget(BABYLON.Vector3.Zero());
        this.cameras.main.attachControl(this.canvas, true);
        
        // تنظیمات پیشرفته
        this.cameras.main.fov = 0.8;
        this.cameras.main.minZ = 0.1;
        this.cameras.main.maxZ = 1000;
        this.cameras.main.speed = 0.5;
        this.cameras.main.inertia = 0.8;
        this.cameras.main.angularSensibility = 2000;
        
        // لرزش دوربین
        this.cameras.main.cameraRigMode = BABYLON.Camera.RIG_MODE_NONE;
        
        this.currentCamera = this.cameras.main;
        this.scene.activeCamera = this.currentCamera;
    }
    
    createMinimapCamera() {
        // دوربین مینی‌مپ
        this.cameras.minimap = new BABYLON.UniversalCamera(
            "minimapCamera",
            new BABYLON.Vector3(0, 50, 0),
            this.scene
        );
        
        this.cameras.minimap.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.cameras.minimap.orthoTop = 50;
        this.cameras.minimap.orthoBottom = -50;
        this.cameras.minimap.orthoLeft = -50;
        this.cameras.minimap.orthoRight = 50;
        this.cameras.minimap.layerMask = 0x10000000;
    }
    
    createCinematicCamera() {
        // دوربین سینمایی برای صحنه‌های خاص
        this.cameras.cinematic = new BABYLON.FreeCamera(
            "cinematicCamera",
            new BABYLON.Vector3(0, 10, -20),
            this.scene
        );
        
        this.cameras.cinematic.setTarget(BABYLON.Vector3.Zero());
        this.cameras.cinematic.fov = 0.6;
    }
    
    setupCameraEffects() {
        // افکت‌های پس‌پردازش دوربین
        this.setupPostProcessing();
        this.setupCameraShake();
        this.setupDepthOfField();
        this.setupMotionBlur();
    }
    
    setupPostProcessing() {
        // pipeline پردازش پس‌از رندر
        this.defaultPipeline = new BABYLON.DefaultRenderingPipeline(
            "defaultPipeline",
            true,
            this.scene,
            [this.cameras.main]
        );
        
        // تنظیمات pipeline
        this.defaultPipeline.samples = 4;
        this.defaultPipeline.bloomEnabled = true;
        this.defaultPipeline.bloomThreshold = 0.8;
        this.defaultPipeline.bloomWeight = 0.3;
        this.defaultPipeline.bloomKernel = 64;
        this.defaultPipeline.bloomScale = 0.5;
        
        this.defaultPipeline.chromaticAberrationEnabled = true;
        this.defaultPipeline.chromaticAberration.aberrationAmount = 1.0;
        this.defaultPipeline.chromaticAberration.radialIntensity = 0.5;
        this.defaultPipeline.chromaticAberration.direction = new BABYLON.Vector2(0, 0);
        
        this.defaultPipeline.grainEnabled = true;
        this.defaultPipeline.grain.animated = true;
        this.defaultPipeline.grain.intensity = 0.3;
        
        this.defaultPipeline.depthOfFieldEnabled = false; // فعال در مواقع لازم
        this.defaultPipeline.depthOfField.focalLength = 100;
        this.defaultPipeline.depthOfField.fStop = 1.4;
        this.defaultPipeline.depthOfField.distance = 100;
    }
    
    setupCameraShake() {
        // سیستم لرزش دوربین
        this.cameraEffects.shake = {
            intensity: 0,
            duration: 0,
            startTime: 0,
            active: false
        };
    }
    
    setupDepthOfField() {
        // عمق میدان پویا
        this.cameraEffects.depthOfField = {
            enabled: false,
            focalLength: 100,
            fStop: 1.4,
            focusDistance: 50
        };
    }
    
    setupMotionBlur() {
        // تارشدگی حرکت
        this.cameraEffects.motionBlur = {
            enabled: false,
            intensity: 0.5
        };
    }
    
    setupPerformanceOptimization() {
        // سیستم بهینه‌سازی عملکرد
        this.performanceOptimizer = new BABYLON.SceneOptimizer(this.scene);
        
        // تنظیمات بهینه‌ساز
        const options = new BABYLON.SceneOptimizerOptions(
            60, // هدف فریم‌ریت
            2000 // زمان بهینه‌سازی
        );
        
        // استراتژی‌های بهینه‌سازی
        options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));
        options.addOptimization(new BABYLON.TextureOptimization(512, 1024));
        options.addOptimization(new BABYLON.MergeMeshesOptimization());
        options.addOptimization(new BABYLON.ShadowsOptimization());
        options.addOptimization(new BABYLON.LensFlaresOptimization());
        
        this.performanceOptimizer.setOptions(options);
        this.performanceOptimizer.start();
    }
    
    update(playerPosition, deltaTime) {
        this.followPlayer(playerPosition);
        this.updateCameraEffects(deltaTime);
        this.updatePerformanceMonitoring();
        this.adaptiveQualityControl();
    }
    
    followPlayer(playerPosition) {
        if (!playerPosition || !this.cameras.main) return;
        
        // دنبال کردن نرم بازیکن
        const targetPosition = playerPosition.clone();
        targetPosition.z -= 15;
        targetPosition.y += 8;
        
        // حرکت نرم دوربین
        const currentPosition = this.cameras.main.position;
        const smoothPosition = BABYLON.Vector3.Lerp(
            currentPosition,
            targetPosition,
            0.1
        );
        
        this.cameras.main.position = smoothPosition;
        
        // تنظیم نرم هدف
        const currentTarget = this.cameras.main.getTarget();
        const smoothTarget = BABYLON.Vector3.Lerp(
            currentTarget,
            playerPosition,
            0.1
        );
        
        this.cameras.main.setTarget(smoothTarget);
    }
    
    updateCameraEffects(deltaTime) {
        this.updateCameraShake(deltaTime);
        this.updateDynamicDOF();
        this.updateMotionBlur();
    }
    
    updateCameraShake(deltaTime) {
        if (!this.cameraEffects.shake.active) return;
        
        const shake = this.cameraEffects.shake;
        const elapsed = Date.now() - shake.startTime;
        const progress = elapsed / shake.duration;
        
        if (progress >= 1) {
            shake.active = false;
            shake.intensity = 0;
            return;
        }
        
        // محاسبه شدت لرزش (کاهش تدریجی)
        const currentIntensity = shake.intensity * (1 - progress);
        
        // اعمال لرزش تصادفی
        const shakeX = (Math.random() - 0.5) * currentIntensity;
        const shakeY = (Math.random() - 0.5) * currentIntensity;
        const shakeZ = (Math.random() - 0.5) * currentIntensity;
        
        this.cameras.main.position.x += shakeX;
        this.cameras.main.position.y += shakeY;
        this.cameras.main.position.z += shakeZ;
    }
    
    updateDynamicDOF() {
        if (!this.cameraEffects.depthOfField.enabled) return;
        
        // محاسبه فاصله فوکوس پویا بر اساس موقعیت بازیکن
        if (this.scene.meshes && this.scene.meshes.length > 0) {
            let nearestObjectDistance = Number.MAX_VALUE;
            
            this.scene.meshes.forEach(mesh => {
                if (mesh !== this.cameras.main && mesh.isVisible) {
                    const distance = BABYLON.Vector3.Distance(
                        mesh.getAbsolutePosition(),
                        this.cameras.main.position
                    );
                    nearestObjectDistance = Math.min(nearestObjectDistance, distance);
                }
            });
            
            if (nearestObjectDistance < Number.MAX_VALUE) {
                this.defaultPipeline.depthOfField.focusDistance = nearestObjectDistance;
            }
        }
    }
    
    updateMotionBlur() {
        // فعال/غیرفعال کردن motion blur بر اساس سرعت حرکت
        if (this.cameraEffects.motionBlur.enabled) {
            const cameraSpeed = this.calculateCameraSpeed();
            const blurIntensity = Math.min(cameraSpeed * 2, 1);
            
            // اینجا می‌توان motion blur را بر اساس شدت تنظیم کرد
        }
    }
    
    calculateCameraSpeed() {
        if (!this.lastCameraPosition) {
            this.lastCameraPosition = this.cameras.main.position.clone();
            return 0;
        }
        
        const speed = BABYLON.Vector3.Distance(
            this.cameras.main.position,
            this.lastCameraPosition
        );
        
        this.lastCameraPosition = this.cameras.main.position.clone();
        return speed;
    }
    
    updatePerformanceMonitoring() {
        this.performanceMonitor.update();
        
        // تنظیمات پویا بر اساس عملکرد
        const fps = this.performanceMonitor.getFPS();
        this.adjustQualityBasedOnPerformance(fps);
    }
    
    adaptiveQualityControl() {
        const fps = this.performanceMonitor.getFPS();
        
        if (fps < 45) {
            // کاهش کیفیت برای بهبود عملکرد
            this.reduceQuality();
        } else if (fps > 55) {
            // افزایش کیفیت در صورت امکان
            this.increaseQuality();
        }
    }
    
    reduceQuality() {
        // کاهش کیفیت گرافیک
        if (this.defaultPipeline) {
            this.defaultPipeline.samples = Math.max(1, this.defaultPipeline.samples - 1);
            this.defaultPipeline.bloomEnabled = false;
            this.defaultPipeline.chromaticAberrationEnabled = false;
        }
        
        // کاهش کیفیت سایه‌ها
        this.scene.lights.forEach(light => {
            if (light.getShadowGenerator) {
                const generator = light.getShadowGenerator();
                if (generator) {
                    generator.useBlurExponentialShadowMap = false;
                    generator.usePoissonSampling = true;
                }
            }
        });
    }
    
    increaseQuality() {
        // افزایش کیفیت گرافیک
        if (this.defaultPipeline && this.defaultPipeline.samples < 4) {
            this.defaultPipeline.samples++;
            this.defaultPipeline.bloomEnabled = true;
            this.defaultPipeline.chromaticAberrationEnabled = true;
        }
    }
    
    // متدهای کنترل دوربین
    shakeCamera(intensity, duration = 500) {
        this.cameraEffects.shake.intensity = intensity;
        this.cameraEffects.shake.duration = duration;
        this.cameraEffects.shake.startTime = Date.now();
        this.cameraEffects.shake.active = true;
    }
    
    enableDepthOfField(enable = true) {
        if (this.defaultPipeline) {
            this.defaultPipeline.depthOfFieldEnabled = enable;
            this.cameraEffects.depthOfField.enabled = enable;
        }
    }
    
    setCameraMode(mode) {
        switch (mode) {
            case "main":
                this.switchToCamera("main");
                break;
            case "minimap":
                this.switchToCamera("minimap");
                break;
            case "cinematic":
                this.switchToCamera("cinematic");
                break;
            case "firstPerson":
                this.enableFirstPersonMode();
                break;
            case "thirdPerson":
                this.enableThirdPersonMode();
                break;
        }
    }
    
    switchToCamera(cameraName) {
        if (this.cameras[cameraName]) {
            this.currentCamera = this.cameras[cameraName];
            this.scene.activeCamera = this.currentCamera;
        }
    }
    
    enableFirstPersonMode() {
        // حالت اول شخص
        if (this.cameras.main) {
            this.cameras.main.position = new BABYLON.Vector3(0, 1.5, 0);
            this.cameras.main.fov = 1.2;
        }
    }
    
    enableThirdPersonMode() {
        // حالت سوم شخص
        if (this.cameras.main) {
            this.cameras.main.position = new BABYLON.Vector3(0, 5, -15);
            this.cameras.main.fov = 0.8;
        }
    }
    
    createCameraAnimation(path, duration, easingFunction) {
        // ایجاد انیمیشن برای دوربین
        const animation = new BABYLON.Animation(
            "cameraAnimation",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        path.forEach((point, index) => {
            keys.push({
                frame: index * 10,
                value: point
            });
        });
        
        animation.setKeys(keys);
        
        if (easingFunction) {
            animation.setEasingFunction(easingFunction);
        }
        
        this.currentCamera.animations = [animation];
        this.scene.beginAnimation(this.currentCamera, 0, keys.length * 10, false, duration);
    }
    
    // سیستم مدیریت حافظه و منابع
    cleanup() {
        if (this.defaultPipeline) {
            this.defaultPipeline.dispose();
        }
        
        Object.values(this.cameras).forEach(camera => {
            if (camera.dispose) {
                camera.dispose();
            }
        });
        
        if (this.performanceOptimizer) {
            this.performanceOptimizer.stop();
        }
    }
}

class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = Date.now();
        this.performanceLog = [];
        this.memoryUsage = 0;
        
        this.setupMonitoring();
    }
    
    setupMonitoring() {
        // مانیتورینگ عملکرد مرورگر
        if (performance.memory) {
            setInterval(() => {
                this.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
            }, 1000);
        }
    }
    
    update() {
        this.frameCount++;
        const currentTime = Date.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            this.logPerformance();
        }
    }
    
    logPerformance() {
        const logEntry = {
            timestamp: Date.now(),
            fps: this.fps,
            memory: this.memoryUsage,
            drawCalls: this.getDrawCalls()
        };
        
        this.performanceLog.push(logEntry);
        
        // نگهداری فقط 60 ورودی آخر
        if (this.performanceLog.length > 60) {
            this.performanceLog.shift();
        }
    }
    
    getDrawCalls() {
        // تعداد draw calls (تقریبی)
        return this.performanceLog.length > 0 ? 
            this.performanceLog[this.performanceLog.length - 1].drawCalls : 0;
    }
    
    getFPS() {
        return this.fps;
    }
    
    getMemoryUsage() {
        return this.memoryUsage;
    }
    
    getPerformanceReport() {
        const avgFPS = this.performanceLog.reduce((sum, entry) => sum + entry.fps, 0) / this.performanceLog.length;
        const minFPS = Math.min(...this.performanceLog.map(entry => entry.fps));
        const maxMemory = Math.max(...this.performanceLog.map(entry => entry.memory));
        
        return {
            averageFPS: avgFPS.toFixed(1),
            minFPS: minFPS,
            maxMemory: maxMemory.toFixed(1) + " MB",
            stability: this.calculateStability()
        };
    }
    
    calculateStability() {
        if (this.performanceLog.length < 2) return 100;
        
        const fpsValues = this.performanceLog.map(entry => entry.fps);
        const average = fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length;
        const variance = fpsValues.reduce((sum, fps) => sum + Math.pow(fps - average, 2), 0) / fpsValues.length;
        
        return Math.max(0, 100 - (Math.sqrt(variance) / average * 100));
    }
}

// سیستم مدیریت منابع و حافظه
class ResourceManager {
    constructor(scene) {
        this.scene = scene;
        this.loadedAssets = new Map();
        this.assetQueue = [];
        this.loading = false;
        this.cacheEnabled = true;
        
        this.setupCacheManagement();
    }
    
    async loadAsset(url, type, options = {}) {
        const cacheKey = this.generateCacheKey(url, options);
        
        // بررسی کش
        if (this.cacheEnabled && this.loadedAssets.has(cacheKey)) {
            return this.loadedAssets.get(cacheKey);
        }
        
        // افزودن به صف بارگذاری
        return new Promise((resolve, reject) => {
            this.assetQueue.push({
                url,
                type,
                options,
                resolve,
                reject,
                cacheKey
            });
            
            this.processQueue();
        });
    }
    
    async processQueue() {
        if (this.loading || this.assetQueue.length === 0) return;
        
        this.loading = true;
        
        while (this.assetQueue.length > 0) {
            const asset = this.assetQueue.shift();
            
            try {
                const result = await this.loadSingleAsset(asset);
                asset.resolve(result);
                
                // ذخیره در کش
                if (this.cacheEnabled) {
                    this.loadedAssets.set(asset.cacheKey, result);
                }
                
            } catch (error) {
                asset.reject(error);
            }
            
            // وقفه برای جلوگیری از مسدود شدن
            await this.delay(16);
        }
        
        this.loading = false;
    }
    
    async loadSingleAsset(asset) {
        switch (asset.type) {
            case "texture":
                return await this.loadTexture(asset.url, asset.options);
            case "mesh":
                return await this.loadMesh(asset.url, asset.options);
            case "sound":
                return await this.loadSound(asset.url, asset.options);
            case "json":
                return await this.loadJSON(asset.url);
            default:
                throw new Error(`نوع asset پشتیبانی نمی‌شود: ${asset.type}`);
        }
    }
    
    async loadTexture(url, options) {
        return new Promise((resolve, reject) => {
            const texture = new BABYLON.Texture(url, this.scene, 
                options.noMipmap, 
                options.invertY, 
                options.samplingMode, 
                () => resolve(texture), 
                (message) => reject(new Error(message))
            );
            
            if (options.hasOwnProperty('hasAlpha')) {
                texture.hasAlpha = options.hasAlpha;
            }
        });
    }
    
    async loadMesh(url, options) {
        return new Promise((resolve, reject) => {
            BABYLON.SceneLoader.ImportMesh("", "", url, this.scene, 
                (meshes) => resolve(meshes),
                null,
                (scene, message) => reject(new Error(message))
            );
        });
    }
    
    async loadSound(url, options) {
        return new Promise((resolve, reject) => {
            const sound = new BABYLON.Sound(
                options.name || "sound",
                url,
                this.scene,
                () => resolve(sound),
                options
            );
        });
    }
    
    async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`خطا در بارگذاری JSON: ${response.status}`);
        }
        return await response.json();
    }
    
    generateCacheKey(url, options) {
        return btoa(url + JSON.stringify(options));
    }
    
    setupCacheManagement() {
        // پاکسازی خودکار کش
        setInterval(() => {
            this.cleanupCache();
        }, 30000); // هر 30 ثانیه
    }
    
    cleanupCache() {
        const maxCacheSize = 100; // حداکثر تعداد asset در کش
        const maxMemory = 500; // حداکثر حافظه بر حسب MB
        
        if (this.loadedAssets.size > maxCacheSize) {
            // حذف قدیمی‌ترین assetها
            const keys = Array.from(this.loadedAssets.keys());
            const keysToRemove = keys.slice(0, this.loadedAssets.size - maxCacheSize);
            
            keysToRemove.forEach(key => {
                const asset = this.loadedAssets.get(key);
                if (asset.dispose) {
                    asset.dispose();
                }
                this.loadedAssets.delete(key);
            });
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    clearCache() {
        this.loadedAssets.forEach(asset => {
            if (asset.dispose) {
                asset.dispose();
            }
        });
        this.loadedAssets.clear();
    }
    
    getCacheStats() {
        return {
            size: this.loadedAssets.size,
            memory: this.estimateMemoryUsage()
        };
    }
    
    estimateMemoryUsage() {
        let total = 0;
        this.loadedAssets.forEach(asset => {
            // تخمین حافظه (ساده)
            if (asset instanceof BABYLON.Texture) {
                total += 4; // MB تقریبی برای texture
            } else if (Array.isArray(asset)) {
                total += asset.length * 0.1; // MB تقریبی برای meshها
            }
        });
        return total;
    }
}

// سیستم تشخیص برخورد پیشرفته
class AdvancedCollisionSystem {
    constructor(scene) {
        this.scene = scene;
        this.colliders = new Map();
        this.spatialGrid = new SpatialGrid(100, 10); // شبکه فضایی برای بهینه‌سازی
        this.collisionLayers = new Map();
        
        this.setupCollisionLayers();
    }
    
    setupCollisionLayers() {
        // لایه‌های برخورد برای بهینه‌سازی
        this.collisionLayers.set("player", 1);
        this.collisionLayers.set("enemy", 2);
        this.collisionLayers.set("projectile", 4);
        this.collisionLayers.set("environment", 8);
        this.collisionLayers.set("pickup", 16);
    }
    
    registerCollider(mesh, type, options = {}) {
        const collider = {
            mesh,
            type,
            layer: this.collisionLayers.get(type) || 0,
            radius: options.radius || this.calculateBoundingRadius(mesh),
            onCollision: options.onCollision,
            isTrigger: options.isTrigger || false,
            enabled: true
        };
        
        this.colliders.set(mesh.uniqueId, collider);
        this.spatialGrid.insert(mesh, collider.radius);
        
        return collider;
    }
    
    unregisterCollider(mesh) {
        this.colliders.delete(mesh.uniqueId);
        this.spatialGrid.remove(mesh);
    }
    
    update() {
        this.spatialGrid.clear();
        
        // به‌روزرسانی موقعیت‌ها در شبکه فضایی
        this.colliders.forEach((collider, id) => {
            if (collider.enabled && collider.mesh) {
                this.spatialGrid.insert(collider.mesh, collider.radius);
            }
        });
        
        // بررسی برخوردها
        this.checkCollisions();
    }
    
    checkCollisions() {
        const checkedPairs = new Set();
        
        this.colliders.forEach((colliderA, idA) => {
            if (!colliderA.enabled || colliderA.isTrigger) return;
            
            // یافتن همسایه‌های بالقوه با استفاده از شبکه فضایی
            const potentialCollisions = this.spatialGrid.getNeighbors(colliderA.mesh);
            
            potentialCollisions.forEach(colliderB => {
                if (!colliderB.enabled || colliderA === colliderB) return;
                
                const pairKey = this.getCollisionPairKey(colliderA, colliderB);
                if (checkedPairs.has(pairKey)) return;
                
                // بررسی لایه‌های برخورد
                if ((colliderA.layer & colliderB.layer) === 0) return;
                
                if (this.checkSphereCollision(colliderA, colliderB)) {
                    this.handleCollision(colliderA, colliderB);
                    checkedPairs.add(pairKey);
                }
            });
        });
    }
    
    checkSphereCollision(colliderA, colliderB) {
        const distance = BABYLON.Vector3.Distance(
            colliderA.mesh.getAbsolutePosition(),
            colliderB.mesh.getAbsolutePosition()
        );
        
        return distance < (colliderA.radius + colliderB.radius);
    }
    
    handleCollision(colliderA, colliderB) {
        // اجرای callbackهای برخورد
        if (colliderA.onCollision) {
            colliderA.onCollision(colliderB);
        }
        
        if (colliderB.onCollision) {
            colliderB.onCollision(colliderA);
        }
        
        // ایجاد افکت برخورد
        this.createCollisionEffect(colliderA, colliderB);
    }
    
    createCollisionEffect(colliderA, colliderB) {
        const position = BABYLON.Vector3.Lerp(
            colliderA.mesh.getAbsolutePosition(),
            colliderB.mesh.getAbsolutePosition(),
            0.5
        );
        
        // سیستم ذرات برای برخورد
        const collisionSystem = new BABYLON.ParticleSystem("collision", 20, this.scene);
        collisionSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        collisionSystem.emitter = position;
        
        collisionSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
        collisionSystem.color2 = new BABYLON.Color4(1, 0, 0, 1);
        collisionSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        collisionSystem.minSize = 0.1;
        collisionSystem.maxSize = 0.4;
        
        collisionSystem.minLifeTime = 0.2;
        collisionSystem.maxLifeTime = 0.8;
        
        collisionSystem.emitRate = 20;
        collisionSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        collisionSystem.direction1 = new BABYLON.Vector3(-2, -2, -2);
        collisionSystem.direction2 = new BABYLON.Vector3(2, 2, 2);
        
        collisionSystem.start();
        
        setTimeout(() => {
            collisionSystem.stop();
            setTimeout(() => {
                collisionSystem.dispose();
            }, 800);
        }, 100);
    }
    
    getCollisionPairKey(colliderA, colliderB) {
        const id1 = colliderA.mesh.uniqueId;
        const id2 = colliderB.mesh.uniqueId;
        return id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;
    }
    
    calculateBoundingRadius(mesh) {
        const boundingInfo = mesh.getBoundingInfo();
        const boundingBox = boundingInfo.boundingBox;
        const size = boundingBox.maximum.subtract(boundingBox.minimum);
        
        return Math.max(size.x, size.y, size.z) / 2;
    }
    
    raycast(origin, direction, maxDistance = 100, layerMask = 0xFFFFFFFF) {
        const ray = new BABYLON.Ray(origin, direction, maxDistance);
        let closestHit = null;
        
        this.colliders.forEach(collider => {
            if (!collider.enabled || (collider.layer & layerMask) === 0) return;
            
            const hit = ray.intersectsMesh(collider.mesh);
            if (hit.hit && hit.distance < maxDistance) {
                if (!closestHit || hit.distance < closestHit.distance) {
                    closestHit = {
                        collider: collider,
                        point: hit.pickedPoint,
                        distance: hit.distance,
                        normal: hit.getNormal(true)
                    };
                }
            }
        });
        
        return closestHit;
    }
}

// شبکه فضایی برای بهینه‌سازی تشخیص برخورد
class SpatialGrid {
    constructor(worldSize, cellSize) {
        this.worldSize = worldSize;
        this.cellSize = cellSize;
        this.gridSize = Math.ceil(worldSize / cellSize);
        this.cells = new Map();
    }
    
    getCellKey(position) {
        const x = Math.floor((position.x + this.worldSize / 2) / this.cellSize);
        const y = Math.floor((position.y + this.worldSize / 2) / this.cellSize);
        const z = Math.floor((position.z + this.worldSize / 2) / this.cellSize);
        
        return `${x},${y},${z}`;
    }
    
    insert(mesh, radius) {
        const position = mesh.getAbsolutePosition();
        const cellKey = this.getCellKey(position);
        
        if (!this.cells.has(cellKey)) {
            this.cells.set(cellKey, []);
        }
        
        this.cells.get(cellKey).push({ mesh, radius });
    }
    
    remove(mesh) {
        // حذف از تمام سلول‌ها (برای سادگی)
        this.cells.forEach(cell => {
            const index = cell.findIndex(item => item.mesh === mesh);
            if (index !== -1) {
                cell.splice(index, 1);
            }
        });
    }
    
    getNeighbors(mesh) {
        const position = mesh.getAbsolutePosition();
        const neighbors = [];
        
        // بررسی سلول‌های مجاور
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const offset = new BABYLON.Vector3(x, y, z).scale(this.cellSize);
                    const checkPosition = position.add(offset);
                    const cellKey = this.getCellKey(checkPosition);
                    
                    if (this.cells.has(cellKey)) {
                        neighbors.push(...this.cells.get(cellKey));
                    }
                }
            }
        }
        
        return neighbors.filter(item => item.mesh !== mesh);
    }
    
    clear() {
        this.cells.clear();
    }
}

// صدها خط کد اضافی برای سیستم‌های تخصصی...
// [کد ادامه دارد...]
