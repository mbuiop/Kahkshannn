// m2.js - سیستم دوربین پیشرفته و بهینه‌سازی عملکرد
class AdvancedCameraSystem {
    constructor() {
        this.cameraModes = {
            FOLLOW: 'follow',
            ORBIT: 'orbit',
            FIRST_PERSON: 'first_person',
            STRATEGIC: 'strategic'
        };
        
        this.currentMode = this.cameraModes.FOLLOW;
        this.camera = null;
        this.target = null;
        this.offset = new THREE.Vector3(0, 10, 20);
        this.smoothness = 0.1;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.originalPosition = new THREE.Vector3();
        this.performanceMode = 'high';
        this.frameRate = 60;
        this.lastFrameTime = 0;
        this.fpsCounter = 0;
        this.currentFPS = 0;
        this.renderScale = 1.0;
        this.adaptiveQuality = true;
    }

    // مقداردهی اولیه سیستم دوربین
    init(camera, target) {
        this.camera = camera;
        this.target = target;
        this.originalPosition.copy(camera.position);
        
        this.setupPerformanceMonitoring();
        this.applyInitialSettings();
        
        console.log('سیستم دوربین پیشرفته راه‌اندازی شد');
    }

    // تنظیمات اولیه
    applyInitialSettings() {
        // تنظیمات پیشرفته دوربین
        this.camera.fov = 75;
        this.camera.near = 0.1;
        this.camera.far = 1000;
        this.camera.updateProjectionMatrix();
        
        // فعال کردن ضد لرزش
        this.enableAntiAliasing();
        
        // تنظیم حالت دوربین اولیه
        this.setCameraMode(this.cameraModes.FOLLOW);
    }

    // تنظیم حالت دوربین
    setCameraMode(mode) {
        this.currentMode = mode;
        
        switch(mode) {
            case this.cameraModes.FOLLOW:
                this.setupFollowCamera();
                break;
            case this.cameraModes.ORBIT:
                this.setupOrbitCamera();
                break;
            case this.cameraModes.FIRST_PERSON:
                this.setupFirstPersonCamera();
                break;
            case this.cameraModes.STRATEGIC:
                this.setupStrategicCamera();
                break;
        }
        
        console.log(`حالت دوربین تغییر کرد به: ${mode}`);
    }

    // تنظیم دوربین تعقیبی
    setupFollowCamera() {
        this.offset.set(0, 8, 15);
        this.smoothness = 0.08;
        this.camera.lookAt(this.target.position);
    }

    // تنظیم دوربین مداری
    setupOrbitCamera() {
        this.offset.set(0, 5, 12);
        this.smoothness = 0.05;
    }

    // تنظیم دوربین اول شخص
    setupFirstPersonCamera() {
        this.offset.set(0, 2, 0);
        this.smoothness = 0.02;
    }

    // تنظیم دوربین استراتژیک
    setupStrategicCamera() {
        this.offset.set(0, 25, 0);
        this.smoothness = 0.15;
        this.camera.rotation.x = -Math.PI / 2;
    }

    // به‌روزرسانی دوربین در هر فریم
    update(deltaTime) {
        if (!this.camera || !this.target) return;
        
        this.updateCameraPosition(deltaTime);
        this.updateCameraEffects(deltaTime);
        this.adaptiveQualityControl();
    }

    // به‌روزرسانی موقعیت دوربین
    updateCameraPosition(deltaTime) {
        const targetPosition = new THREE.Vector3();
        
        switch(this.currentMode) {
            case this.cameraModes.FOLLOW:
                targetPosition.copy(this.target.position)
                    .add(this.offset);
                break;
                
            case this.cameraModes.ORBIT:
                const time = Date.now() * 0.001;
                const orbitRadius = 15;
                targetPosition.set(
                    Math.cos(time) * orbitRadius,
                    this.offset.y,
                    Math.sin(time) * orbitRadius
                ).add(this.target.position);
                break;
                
            case this.cameraModes.FIRST_PERSON:
                targetPosition.copy(this.target.position)
                    .add(this.offset);
                break;
                
            case this.cameraModes.STRATEGIC:
                targetPosition.copy(this.target.position)
                    .add(this.offset);
                break;
        }
        
        // اعمال لرزش اگر فعال باشد
        if (this.shakeDuration > 0) {
            targetPosition.x += (Math.random() - 0.5) * this.shakeIntensity;
            targetPosition.y += (Math.random() - 0.5) * this.shakeIntensity;
            targetPosition.z += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeDuration -= deltaTime;
        }
        
        // اعمال حرکت نرم
        this.camera.position.lerp(targetPosition, this.smoothness);
        
        // تنظیم جهت نگاه دوربین
        if (this.currentMode !== this.cameraModes.STRATEGIC) {
            this.camera.lookAt(this.target.position);
        }
    }

    // به‌روزرسانی جلوه‌های دوربین
    updateCameraEffects(deltaTime) {
        // تنظیم خودکار میدان دید بر اساس سرعت
        if (this.target.velocity) {
            const speed = this.target.velocity.length();
            const targetFOV = 75 + speed * 0.5;
            this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFOV, 0.1);
            this.camera.updateProjectionMatrix();
        }
    }

    // فعال کردن لرزش دوربین
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.originalPosition.copy(this.camera.position);
    }

    // تغییر نرم زوم دوربین
    zoom(targetZoom, duration = 1.0) {
        const startZoom = this.camera.zoom;
        const startTime = Date.now();
        
        const animateZoom = () => {
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            this.camera.zoom = THREE.MathUtils.lerp(startZoom, targetZoom, progress);
            this.camera.updateProjectionMatrix();
            
            if (progress < 1) {
                requestAnimationFrame(animateZoom);
            }
        };
        
        animateZoom();
    }

    // تنظیمات مانیتورینگ عملکرد
    setupPerformanceMonitoring() {
        this.fpsCounter = 0;
        this.currentFPS = 0;
        this.lastFrameTime = performance.now();
        
        // مانیتورینگ FPS
        setInterval(() => {
            this.currentFPS = this.fpsCounter;
            this.fpsCounter = 0;
            
            this.updatePerformanceMode();
        }, 1000);
    }

    // به‌روزرسانی حالت عملکرد بر اساس FPS
    updatePerformanceMode() {
        if (this.adaptiveQuality) {
            if (this.currentFPS < 30) {
                this.setPerformanceMode('low');
            } else if (this.currentFPS < 45) {
                this.setPerformanceMode('medium');
            } else {
                this.setPerformanceMode('high');
            }
        }
    }

    // تنظیم حالت عملکرد
    setPerformanceMode(mode) {
        if (this.performanceMode === mode) return;
        
        this.performanceMode = mode;
        
        switch(mode) {
            case 'low':
                this.renderScale = 0.5;
                this.disableShadows();
                this.reduceParticles();
                break;
                
            case 'medium':
                this.renderScale = 0.75;
                this.enableBasicShadows();
                this.reduceParticles();
                break;
                
            case 'high':
                this.renderScale = 1.0;
                this.enableAdvancedShadows();
                this.enableFullParticles();
                break;
        }
        
        console.log(`حالت عملکرد تغییر کرد به: ${mode} (FPS: ${this.currentFPS})`);
    }

    // کنترل کیفیت تطبیقی
    adaptiveQualityControl() {
        this.fpsCounter++;
        
        const currentTime = performance.now();
        const delta = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // تنظیم نرخ فریم در دستگاه‌های ضعیف
        if (this.performanceMode === 'low' && delta < 32) {
            // محدود کردن به 30 FPS
            return;
        }
    }

    // غیرفعال کردن سایه‌ها
    disableShadows() {
        if (this.camera && this.camera.parent) {
            this.camera.parent.traverse((child) => {
                if (child.isLight) {
                    child.castShadow = false;
                }
            });
        }
    }

    // فعال کردن سایه‌های پایه
    enableBasicShadows() {
        if (this.camera && this.camera.parent) {
            this.camera.parent.traverse((child) => {
                if (child.isLight && child !== this.camera) {
                    child.castShadow = true;
                    child.shadow.mapSize.width = 1024;
                    child.shadow.mapSize.height = 1024;
                }
            });
        }
    }

    // فعال کردن سایه‌های پیشرفته
    enableAdvancedShadows() {
        if (this.camera && this.camera.parent) {
            this.camera.parent.traverse((child) => {
                if (child.isLight && child !== this.camera) {
                    child.castShadow = true;
                    child.shadow.mapSize.width = 2048;
                    child.shadow.mapSize.height = 2048;
                    child.shadow.bias = -0.0001;
                }
            });
        }
    }

    // کاهش ذرات
    reduceParticles() {
        // کاهش تعداد ذرات در سیستم‌های ذره‌ای
        // این بخش باید با سیستم ذره‌ای بازی یکپارچه شود
    }

    // فعال کردن تمام ذرات
    enableFullParticles() {
        // بازگرداندن تعداد ذرات به حالت عادی
    }

    // فعال کردن ضد لرزش
    enableAntiAliasing() {
        // فعال کردن MSAA یا دیگر تکنیک‌های ضد لرزش
        // این بخش باید با رندرر بازی یکپارچه شود
    }

    // ایجاد برش سینماتیک
    createCinematicCut(targetPosition, targetRotation, duration = 2.0) {
        const startPosition = this.camera.position.clone();
        const startRotation = this.camera.rotation.clone();
        const startTime = Date.now();
        
        const animateCut = () => {
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // محاسبه منحنی حرکت نرم
            const smoothProgress = this.easeInOutCubic(progress);
            
            // حرکت دوربین
            this.camera.position.lerpVectors(startPosition, targetPosition, smoothProgress);
            
            // چرخش دوربین
            this.camera.rotation.x = THREE.MathUtils.lerp(
                startRotation.x, targetRotation.x, smoothProgress
            );
            this.camera.rotation.y = THREE.MathUtils.lerp(
                startRotation.y, targetRotation.y, smoothProgress
            );
            this.camera.rotation.z = THREE.MathUtils.lerp(
                startRotation.z, targetRotation.z, smoothProgress
            );
            
            if (progress < 1) {
                requestAnimationFrame(animateCut);
            }
        };
        
        animateCut();
    }

    // تابع انیمیشن نرم
    easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    // تنظیم عمق میدان
    setDepthOfField(focusDistance, aperture = 0.1, focalLength = 50) {
        // پیاده‌سازی عمق میدان
        // این بخش نیاز به شیدرهای پیشرفته دارد
    }

    // فعال کردن حرکت اینرسی
    enableInertia(enabled = true) {
        this.smoothness = enabled ? 0.1 : 0.02;
    }

    // گرفتن عکس از صحنه
    captureScreenshot(quality = 0.9) {
        const renderer = this.camera.parent?.renderer;
        if (renderer) {
            return renderer.domElement.toDataURL('image/jpeg', quality);
        }
        return null;
    }

    // تنظیم محدودیت‌های حرکت دوربین
    setCameraBounds(minX, maxX, minY, maxY, minZ, maxZ) {
        this.cameraBounds = {
            min: new THREE.Vector3(minX, minY, minZ),
            max: new THREE.Vector3(maxX, maxY, maxZ)
        };
    }

    // اعمال محدودیت‌های دوربین
    applyCameraBounds() {
        if (!this.cameraBounds) return;
        
        this.camera.position.clamp(this.cameraBounds.min, this.cameraBounds.max);
    }

    // پاک‌سازی حافظه
    dispose() {
        this.camera = null;
        this.target = null;
    }
}

// سیستم مدیریت حافظه و جلوگیری از هنگ
class MemoryManager {
    constructor() {
        this.objectPool = new Map();
        this.memoryLimit = 100 * 1024 * 1024; // 100MB
        this.cleanupInterval = 30000; // 30 ثانیه
        this.performanceMonitor = null;
        this.leakDetection = false;
    }

    init() {
        this.startCleanupCycle();
        this.setupPerformanceMonitor();
        console.log('سیستم مدیریت حافظه راه‌اندازی شد');
    }

    // شروع چرخه پاک‌سازی
    startCleanupCycle() {
        setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }

    // تنظیم مانیتورینگ عملکرد
    setupPerformanceMonitor() {
        this.performanceMonitor = {
            frameTimes: [],
            memoryUsage: [],
            objectCounts: new Map()
        };
        
        setInterval(() => {
            this.monitorPerformance();
        }, 5000);
    }

    // مانیتورینگ عملکرد
    monitorPerformance() {
        // مانیتورینگ استفاده از حافظه
        if (performance.memory) {
            const usedMemory = performance.memory.usedJSHeapSize;
            this.performanceMonitor.memoryUsage.push(usedMemory);
            
            // حفظ فقط 60 نمونه آخر
            if (this.performanceMonitor.memoryUsage.length > 60) {
                this.performanceMonitor.memoryUsage.shift();
            }
            
            // بررسی نشت حافظه
            if (this.leakDetection) {
                this.detectMemoryLeaks();
            }
        }
        
        // مانیتورینگ تعداد آبجکت‌ها
        this.performanceMonitor.objectCounts.set(
            Date.now(),
            this.objectPool.size
        );
        
        // حفظ فقط 60 نمونه آخر
        if (this.performanceMonitor.objectCounts.size > 60) {
            const firstKey = this.performanceMonitor.objectCounts.keys().next().value;
            this.performanceMonitor.objectCounts.delete(firstKey);
        }
    }

    // تشخیص نشت حافظه
    detectMemoryLeaks() {
        const memoryUsage = this.performanceMonitor.memoryUsage;
        if (memoryUsage.length < 10) return;
        
        const recent = memoryUsage.slice(-10);
        const older = memoryUsage.slice(-20, -10);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        // اگر استفاده از حافظه بیش از 20% افزایش یابد
        if (recentAvg > olderAvg * 1.2) {
            console.warn('هشدار: احتمال نشت حافظه وجود دارد');
            this.forceCleanup();
        }
    }

    // اضافه کردن آبجکت به پول
    addToPool(key, object, type = 'generic') {
        if (!this.objectPool.has(type)) {
            this.objectPool.set(type, new Map());
        }
        
        this.objectPool.get(type).set(key, {
            object: object,
            lastUsed: Date.now(),
            useCount: 0
        });
    }

    // گرفتن آبجکت از پول
    getFromPool(key, type = 'generic') {
        const typePool = this.objectPool.get(type);
        if (!typePool || !typePool.has(key)) {
            return null;
        }
        
        const poolItem = typePool.get(key);
        poolItem.lastUsed = Date.now();
        poolItem.useCount++;
        
        return poolItem.object;
    }

    // پاک‌سازی حافظه
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [type, typePool] of this.objectPool) {
            for (const [key, poolItem] of typePool) {
                // اگر آبجکت بیش از 5 دقیقه استفاده نشده باشد
                if (now - poolItem.lastUsed > 300000) {
                    this.disposeObject(poolItem.object);
                    typePool.delete(key);
                    cleanedCount++;
                }
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`پاک‌سازی حافظه: ${cleanedCount} آبجکت حذف شد`);
        }
        
        // فراخوانی جمع‌آوری زباله اگر در دسترس باشد
        if (global.gc) {
            global.gc();
        }
    }

    // پاک‌سازی اجباری
    forceCleanup() {
        let totalCleaned = 0;
        
        for (const [type, typePool] of this.objectPool) {
            for (const [key, poolItem] of typePool) {
                this.disposeObject(poolItem.object);
                totalCleaned++;
            }
            typePool.clear();
        }
        
        this.objectPool.clear();
        
        console.log(`پاک‌سازی اجباری: ${totalCleaned} آبجکت حذف شد`);
        
        // فراخوانی جمع‌آوری زباله
        if (global.gc) {
            global.gc();
        }
    }

    // دفع آبجکت
    disposeObject(object) {
        if (object && typeof object.dispose === 'function') {
            object.dispose();
        } else if (object && object.geometry && object.material) {
            // برای آبجکت‌های Three.js
            if (object.geometry.dispose) object.geometry.dispose();
            if (object.material.dispose) object.material.dispose();
            if (object.texture && object.texture.dispose) object.texture.dispose();
        }
    }

    // گرفتن آمار حافظه
    getMemoryStats() {
        const stats = {
            totalObjects: 0,
            objectsByType: {},
            memoryUsage: 0
        };
        
        for (const [type, typePool] of this.objectPool) {
            stats.objectsByType[type] = typePool.size;
            stats.totalObjects += typePool.size;
        }
        
        if (performance.memory) {
            stats.memoryUsage = performance.memory.usedJSHeapSize;
        }
        
        return stats;
    }

    // تنظیم حد حافظه
    setMemoryLimit(limitMB) {
        this.memoryLimit = limitMB * 1024 * 1024;
    }

    // فعال کردن تشخیص نشت
    enableLeakDetection(enabled = true) {
        this.leakDetection = enabled;
    }

    // پاک‌سازی حافظه
    dispose() {
        this.forceCleanup();
        this.performanceMonitor = null;
    }
}

// سیستم مدیریت صدا
class AdvancedAudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.music = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.6;
        this.spatialAudio = true;
        this.audioCache = new Map();
    }

    // مقداردهی اولیه سیستم صدا
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // بارگذاری صداهای پیش‌فرض
            await this.loadDefaultSounds();
            
            console.log('سیستم صدا راه‌اندازی شد');
        } catch (error) {
            console.error('خطا در راه‌اندازی سیستم صدا:', error);
        }
    }

    // بارگذاری صداهای پیش‌فرض
    async loadDefaultSounds() {
        const soundFiles = {
            engine: 'sounds/engine.mp3',
            explosion: 'sounds/explosion.mp3',
            coin: 'sounds/coin.mp3',
            laser: 'sounds/laser.mp3',
            background: 'sounds/background.mp3'
        };
        
        for (const [key, url] of Object.entries(soundFiles)) {
            try {
                await this.loadSound(key, url);
            } catch (error) {
                console.warn(`خطا در بارگذاری صدا ${key}:`, error);
            }
        }
    }

    // بارگذاری صدا
    async loadSound(key, url) {
        if (this.audioCache.has(url)) {
            this.sounds.set(key, this.audioCache.get(url));
            return;
        }
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.sounds.set(key, audioBuffer);
            this.audioCache.set(url, audioBuffer);
        } catch (error) {
            console.error(`خطا در بارگذاری صدا از ${url}:`, error);
            throw error;
        }
    }

    // پخش صدا
    playSound(key, options = {}) {
        if (!this.sounds.has(key) || !this.audioContext) return null;
        
        const {
            volume = 1,
            loop = false,
            playbackRate = 1,
            spatial = false,
            position = null
        } = options;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds.get(key);
        source.loop = loop;
        source.playbackRate.value = playbackRate;
        
        gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;
        
        source.connect(gainNode);
        
        if (spatial && this.spatialAudio && position) {
            const panner = this.audioContext.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'inverse';
            panner.refDistance = 1;
            panner.maxDistance = 100;
            panner.rolloffFactor = 1;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;
            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z || 0;
            
            gainNode.connect(panner);
            panner.connect(this.audioContext.destination);
        } else {
            gainNode.connect(this.audioContext.destination);
        }
        
        source.start();
        
        return {
            source: source,
            gainNode: gainNode,
            stop: () => {
                try {
                    source.stop();
                } catch (e) {
                    // صدا قبلاً متوقف شده
                }
            },
            setVolume: (newVolume) => {
                gainNode.gain.value = newVolume * this.sfxVolume * this.masterVolume;
            }
        };
    }

    // پخش موسیقی پس‌زمینه
    playBackgroundMusic(key, volume = 1) {
        if (this.music) {
            this.music.stop();
        }
        
        this.music = this.playSound(key, {
            volume: volume,
            loop: true
        });
        
        if (this.music) {
            this.music.setVolume(volume * this.musicVolume * this.masterVolume);
        }
        
        return this.music;
    }

    // توقف موسیقی
    stopBackgroundMusic() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }

    // تنظیم حجم اصلی
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    // تنظیم حجم افکت‌ها
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    // تنظیم حجم موسیقی
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.setVolume(volume * this.masterVolume);
        }
    }

    // به‌روزرسانی تمام حجم‌ها
    updateAllVolumes() {
        // این تابع باید تمام صداهای در حال پخش را به‌روزرسانی کند
        // پیاده‌سازی کامل نیاز به ردیابی تمام صداهای فعال دارد
    }

    // فعال کردن صداهای فضایی
    enableSpatialAudio(enabled = true) {
        this.spatialAudio = enabled;
    }

    // به‌روزرسانی موقعیت شنونده
    updateListenerPosition(position, forward, up) {
        if (!this.audioContext || !this.spatialAudio) return;
        
        const listener = this.audioContext.listener;
        
        if (listener.positionX) {
            // مرورگرهای جدید
            listener.positionX.value = position.x;
            listener.positionY.value = position.y;
            listener.positionZ.value = position.z || 0;
            
            if (forward && up) {
                listener.forwardX.value = forward.x;
                listener.forwardY.value = forward.y;
                listener.forwardZ.value = forward.z || 0;
                
                listener.upX.value = up.x;
                listener.upY.value = up.y;
                listener.upZ.value = up.z || 0;
            }
        } else {
            // مرورگرهای قدیمی
            listener.setPosition(position.x, position.y, position.z || 0);
            
            if (forward && up) {
                listener.setOrientation(
                    forward.x, forward.y, forward.z || 0,
                    up.x, up.y, up.z || 0
                );
            }
        }
    }

    // ایجاد افکت اکو
    createEchoEffect(delayTime = 0.3, feedback = 0.5) {
        const convolver = this.audioContext.createConvolver();
        const delay = this.audioContext.createDelay();
        const feedbackGain = this.audioContext.createGain();
        
        delay.delayTime.value = delayTime;
        feedbackGain.gain.value = feedback;
        
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        
        return {
            input: delay,
            output: delay,
            convolver: convolver,
            setDelay: (time) => {
                delay.delayTime.value = time;
            },
            setFeedback: (amount) => {
                feedbackGain.gain.value = amount;
            }
        };
    }

    // ایجاد افکت فیلتر
    createFilterEffect(type = 'lowpass', frequency = 1000) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = frequency;
        
        return {
            input: filter,
            output: filter,
            setFrequency: (freq) => {
                filter.frequency.value = freq;
            },
            setType: (filterType) => {
                filter.type = filterType;
            }
        };
    }

    // پاک‌سازی حافظه
    dispose() {
        this.stopBackgroundMusic();
        this.sounds.clear();
        this.audioCache.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// سیستم اصلی بازی
class GalacticGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.spacecraft3D = null;
        this.cameraSystem = null;
        this.memoryManager = null;
        this.audioSystem = null;
        this.gameState = 'menu';
        this.currentLevel = 1;
        this.score = 0;
        this.player = null;
        this.enemies = [];
        this.coins = [];
        this.isInitialized = false;
    }

    // مقداردهی اولیه بازی
    async init() {
        try {
            // راه‌اندازی سیستم‌های مختلف
            this.memoryManager = new MemoryManager();
            this.memoryManager.init();
            
            this.audioSystem = new AdvancedAudioSystem();
            await this.audioSystem.init();
            
            // راه‌اندازی گرافیک سه‌بعدی
            await this.setup3DGraphics();
            
            // راه‌اندازی سیستم دوربین
            this.setupCameraSystem();
            
            // ایجاد صحنه بازی
            this.createGameScene();
            
            this.isInitialized = true;
            console.log('بازی کهکشانی با موفقیت راه‌اندازی شد');
            
            // شروع حلقه بازی
            this.gameLoop();
            
        } catch (error) {
            console.error('خطا در راه‌اندازی بازی:', error);
        }
    }

    // راه‌اندازی گرافیک سه‌بعدی
    async setup3DGraphics() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('کانواس بازی پیدا نشد');
        }
        
        this.spacecraft3D = new Spacecraft3D();
        await this.spacecraft3D.init(canvas);
    }

    // راه‌اندازی سیستم دوربین
    setupCameraSystem() {
        if (!this.spacecraft3D.camera) {
            console.warn('دوربین سه‌بعدی در دسترس نیست');
            return;
        }
        
        this.cameraSystem = new AdvancedCameraSystem();
        this.cameraSystem.init(
            this.spacecraft3D.camera,
            this.spacecraft3D.playerMesh
        );
    }

    // ایجاد صحنه بازی
    createGameScene() {
        // ایجاد محیط فضا
        this.createSpaceEnvironment();
        
        // ایجاد بازیکن
        this.createPlayer();
        
        // ایجاد دشمنان اولیه
        this.createInitialEnemies();
        
        // ایجاد سکه‌ها
        this.createInitialCoins();
    }

    // ایجاد محیط فضا
    createSpaceEnvironment() {
        // ایجاد پس‌زمینه ستاره‌ای
        this.createStarfield();
        
        // ایجاد سیارات دوردست
        this.createDistantPlanets();
        
        // ایجاد سحابی‌ها
        this.createNebulas();
    }

    // ایجاد پس‌زمینه ستاره‌ای
    createStarfield() {
        // پیاده‌سازی میدان ستاره‌ای
        // این بخش نیاز به ایجاد هزاران ستاره دارد
    }

    // ایجاد بازیکن
    createPlayer() {
        this.player = {
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            velocity: { x: 0, y: 0, z: 0 },
            health: 100,
            fuel: 100,
            score: 0
        };
    }

    // حلقه اصلی بازی
    gameLoop() {
        if (!this.isInitialized) return;
        
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = currentTime;
        
        // به‌روزرسانی سیستم‌ها
        this.updateGame(deltaTime);
        this.updateCamera(deltaTime);
        this.updateAudio(deltaTime);
        
        // درخواست فریم بعدی
        requestAnimationFrame(() => this.gameLoop());
    }

    // به‌روزرسانی وضعیت بازی
    updateGame(deltaTime) {
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.checkCollisions();
        this.updateHUD();
    }

    // به‌روزرسانی بازیکن
    updatePlayer(deltaTime) {
        // به‌روزرسانی موقعیت بازیکن
        if (this.spacecraft3D && this.spacecraft3D.isInitialized) {
            this.spacecraft3D.updatePlayerPosition(
                this.player.position.x,
                this.player.position.y,
                this.player.position.z
            );
            this.spacecraft3D.updatePlayerRotation(this.player.rotation);
        }
    }

    // به‌روزرسانی دوربین
    updateCamera(deltaTime) {
        if (this.cameraSystem) {
            this.cameraSystem.update(deltaTime);
        }
    }

    // به‌روزرسانی صدا
    updateAudio(deltaTime) {
        if (this.audioSystem && this.player) {
            this.audioSystem.updateListenerPosition(
                this.player.position,
                { x: Math.cos(this.player.rotation), y: 0, z: Math.sin(this.player.rotation) },
                { x: 0, y: 1, z: 0 }
            );
        }
    }

    // شروع بازی
    startGame() {
        if (!this.isInitialized) {
            console.warn('بازی هنوز راه‌اندازی نشده است');
            return;
        }
        
        this.gameState = 'playing';
        this.currentLevel = 1;
        this.score = 0;
        
        // پخش موسیقی پس‌زمینه
        this.audioSystem.playBackgroundMusic('background', 0.5);
        
        console.log('بازی شروع شد');
    }

    // توقف بازی
    stopGame() {
        this.gameState = 'menu';
        this.audioSystem.stopBackgroundMusic();
        
        console.log('بازی متوقف شد');
    }

    // پاک‌سازی حافظه
    dispose() {
        if (this.spacecraft3D) {
            this.spacecraft3D.dispose();
        }
        
        if (this.cameraSystem) {
            this.cameraSystem.dispose();
        }
        
        if (this.memoryManager) {
            this.memoryManager.dispose();
        }
        
        if (this.audioSystem) {
            this.audioSystem.dispose();
        }
        
        this.isInitialized = false;
        console.log('بازی پاک‌سازی شد');
    }
}

// صادر کردن کلاس‌ها برای استفاده جهانی
window.GalacticGame = GalacticGame;
window.Spacecraft3D = Spacecraft3D;
window.AdvancedCameraSystem = AdvancedCameraSystem;
window.MemoryManager = MemoryManager;
window.AdvancedAudioSystem = AdvancedAudioSystem;
