// m2.js - سیستم دوربین و پشتیبانی از بازی

// سیستم مدیریت حافظه و جلوگیری از هنگ
class MemoryManager {
    constructor() {
        this.objectPool = new Map();
        this.memoryLimit = 100 * 1024 * 1024; // 100MB
        this.cleanupInterval = 30000; // 30 ثانیه
        this.performanceMonitor = null;
        this.leakDetection = false;
        this.frameTimes = [];
        this.memoryUsage = [];
        this.objectCounts = new Map();
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
        } else if (object && object.remove) {
            // برای المان‌های DOM
            object.remove();
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
        this.activeSounds = new Set();
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
        
        const soundObject = {
            source: source,
            gainNode: gainNode,
            stop: () => {
                try {
                    source.stop();
                    this.activeSounds.delete(soundObject);
                } catch (e) {
                    // صدا قبلاً متوقف شده
                }
            },
            setVolume: (newVolume) => {
                gainNode.gain.value = newVolume * this.sfxVolume * this.masterVolume;
            }
        };
        
        this.activeSounds.add(soundObject);
        
        // حذف خودکار پس از اتمام (اگر لوپ نباشد)
        if (!loop) {
            source.onended = () => {
                this.activeSounds.delete(soundObject);
            };
        }
        
        return soundObject;
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
        // به‌روزرسانی تمام صداهای فعال
        this.activeSounds.forEach(sound => {
            if (sound !== this.music) {
                sound.setVolume(1); // مقدار پیش‌فرض، تنظیمات حجم اعمال می‌شود
            }
        });
        
        // به‌روزرسانی موسیقی
        if (this.music) {
            this.music.setVolume(1);
        }
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

    // توقف تمام صداها
    stopAllSounds() {
        this.activeSounds.forEach(sound => {
            sound.stop();
        });
        this.activeSounds.clear();
        
        this.stopBackgroundMusic();
    }

    // پاک‌سازی حافظه
    dispose() {
        this.stopAllSounds();
        this.sounds.clear();
        this.audioCache.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// سیستم دوربین پیشرفته
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
        this.offset = { x: 0, y: 10, z: 20 };
        this.smoothness = 0.1;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.originalPosition = { x: 0, y: 0, z: 0 };
        this.performanceMode = 'high';
        this.frameRate = 60;
        this.lastFrameTime = 0;
        this.fpsCounter = 0;
        this.currentFPS = 0;
        this.renderScale = 1.0;
        this.adaptiveQuality = true;
        this.cameraBounds = null;
    }

    // مقداردهی اولیه سیستم دوربین
    init(camera, target) {
        this.camera = camera;
        this.target = target;
        this.originalPosition = { ...camera.position };
        
        this.setupPerformanceMonitoring();
        this.applyInitialSettings();
        
        console.log('سیستم دوربین پیشرفته راه‌اندازی شد');
    }

    // تنظیمات اولیه
    applyInitialSettings() {
        // تنظیمات پیشرفته دوربین
        if (this.camera.fov !== undefined) {
            this.camera.fov = 75;
        }
        
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
        this.offset = { x: 0, y: 8, z: 15 };
        this.smoothness = 0.08;
    }

    // تنظیم دوربین مداری
    setupOrbitCamera() {
        this.offset = { x: 0, y: 5, z: 12 };
        this.smoothness = 0.05;
    }

    // تنظیم دوربین اول شخص
    setupFirstPersonCamera() {
        this.offset = { x: 0, y: 2, z: 0 };
        this.smoothness = 0.02;
    }

    // تنظیم دوربین استراتژیک
    setupStrategicCamera() {
        this.offset = { x: 0, y: 25, z: 0 };
        this.smoothness = 0.15;
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
        let targetPosition = { x: 0, y: 0, z: 0 };
        
        switch(this.currentMode) {
            case this.cameraModes.FOLLOW:
                targetPosition = {
                    x: this.target.x + this.offset.x,
                    y: this.target.y + this.offset.y,
                    z: this.target.z + this.offset.z
                };
                break;
                
            case this.cameraModes.ORBIT:
                const time = Date.now() * 0.001;
                const orbitRadius = 15;
                targetPosition = {
                    x: Math.cos(time) * orbitRadius + this.target.x,
                    y: this.offset.y + this.target.y,
                    z: Math.sin(time) * orbitRadius + this.target.z
                };
                break;
                
            case this.cameraModes.FIRST_PERSON:
                targetPosition = {
                    x: this.target.x + this.offset.x,
                    y: this.target.y + this.offset.y,
                    z: this.target.z + this.offset.z
                };
                break;
                
            case this.cameraModes.STRATEGIC:
                targetPosition = {
                    x: this.target.x + this.offset.x,
                    y: this.target.y + this.offset.y,
                    z: this.target.z + this.offset.z
                };
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
        this.camera.position.x += (targetPosition.x - this.camera.position.x) * this.smoothness;
        this.camera.position.y += (targetPosition.y - this.camera.position.y) * this.smoothness;
        this.camera.position.z += (targetPosition.z - this.camera.position.z) * this.smoothness;
        
        // تنظیم جهت نگاه دوربین
        if (this.currentMode !== this.cameraModes.STRATEGIC) {
            // نگاه کردن به هدف
            const dx = this.target.x - this.camera.position.x;
            const dy = this.target.y - this.camera.position.y;
            const dz = this.target.z - this.camera.position.z;
            
            // محاسبه زاویه‌های مناسب برای نگاه کردن به هدف
            // این بخش می‌تواند بر اساس موتور گرافیکی متفاوت باشد
        }
        
        // اعمال محدودیت‌ها
        this.applyCameraBounds();
    }

    // به‌روزرسانی جلوه‌های دوربین
    updateCameraEffects(deltaTime) {
        // تنظیم خودکار میدان دید بر اساس سرعت
        if (this.target.velocity && this.camera.fov !== undefined) {
            const speed = Math.sqrt(
                this.target.velocity.x * this.target.velocity.x +
                this.target.velocity.y * this.target.velocity.y +
                this.target.velocity.z * this.target.velocity.z
            );
            const targetFOV = 75 + speed * 0.5;
            this.camera.fov += (targetFOV - this.camera.fov) * 0.1;
        }
    }

    // فعال کردن لرزش دوربین
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.originalPosition = { ...this.camera.position };
    }

    // تغییر نرم زوم دوربین
    zoom(targetZoom, duration = 1.0) {
        const startZoom = this.camera.zoom || 1;
        const startTime = Date.now();
        
        const animateZoom = () => {
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // محاسبه منحنی حرکت نرم
            const smoothProgress = this.easeInOutCubic(progress);
            
            const currentZoom = startZoom + (targetZoom - startZoom) * smoothProgress;
            
            if (this.camera.zoom !== undefined) {
                this.camera.zoom = currentZoom;
            }
            
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
        // این بخش باید با سیستم رندرینگ بازی یکپارچه شود
        console.log('سایه‌ها غیرفعال شدند');
    }

    // فعال کردن سایه‌های پایه
    enableBasicShadows() {
        // این بخش باید با سیستم رندرینگ بازی یکپارچه شود
        console.log('سایه‌های پایه فعال شدند');
    }

    // فعال کردن سایه‌های پیشرفته
    enableAdvancedShadows() {
        // این بخش باید با سیستم رندرینگ بازی یکپارچه شود
        console.log('سایه‌های پیشرفته فعال شدند');
    }

    // کاهش ذرات
    reduceParticles() {
        // کاهش تعداد ذرات در سیستم‌های ذره‌ای
        console.log('ذرات کاهش یافتند');
    }

    // فعال کردن تمام ذرات
    enableFullParticles() {
        // بازگرداندن تعداد ذرات به حالت عادی
        console.log('تمام ذرات فعال شدند');
    }

    // فعال کردن ضد لرزش
    enableAntiAliasing() {
        // فعال کردن MSAA یا دیگر تکنیک‌های ضد لرزش
        console.log('ضد لرزش فعال شد');
    }

    // ایجاد برش سینماتیک
    createCinematicCut(targetPosition, targetRotation, duration = 2.0) {
        const startPosition = { ...this.camera.position };
        const startRotation = this.camera.rotation ? { ...this.camera.rotation } : { x: 0, y: 0, z: 0 };
        const startTime = Date.now();
        
        const animateCut = () => {
            const currentTime = Date.now();
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // محاسبه منحنی حرکت نرم
            const smoothProgress = this.easeInOutCubic(progress);
            
            // حرکت دوربین
            this.camera.position.x = startPosition.x + (targetPosition.x - startPosition.x) * smoothProgress;
            this.camera.position.y = startPosition.y + (targetPosition.y - startPosition.y) * smoothProgress;
            this.camera.position.z = startPosition.z + (targetPosition.z - startPosition.z) * smoothProgress;
            
            // چرخش دوربین
            if (this.camera.rotation) {
                this.camera.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * smoothProgress;
                this.camera.rotation.y = startRotation.y + (targetRotation.y - startRotation.y) * smoothProgress;
                this.camera.rotation.z = startRotation.z + (targetRotation.z - startRotation.z) * smoothProgress;
            }
            
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
        console.log(`عمق میدان تنظیم شد: فوکوس=${focusDistance}, دیافراگم=${aperture}`);
    }

    // فعال کردن حرکت اینرسی
    enableInertia(enabled = true) {
        this.smoothness = enabled ? 0.1 : 0.02;
    }

    // گرفتن عکس از صحنه
    captureScreenshot(quality = 0.9) {
        // این تابع باید با رندرر بازی یکپارچه شود
        console.log('عکس از صحنه گرفته شد');
        return null;
    }

    // تنظیم محدودیت‌های حرکت دوربین
    setCameraBounds(minX, maxX, minY, maxY, minZ, maxZ) {
        this.cameraBounds = {
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ }
        };
    }

    // اعمال محدودیت‌های دوربین
    applyCameraBounds() {
        if (!this.cameraBounds) return;
        
        this.camera.position.x = Math.max(this.cameraBounds.min.x, Math.min(this.cameraBounds.max.x, this.camera.position.x));
        this.camera.position.y = Math.max(this.cameraBounds.min.y, Math.min(this.cameraBounds.max.y, this.camera.position.y));
        this.camera.position.z = Math.max(this.cameraBounds.min.z, Math.min(this.cameraBounds.max.z, this.camera.position.z));
    }

    // پاک‌سازی حافظه
    dispose() {
        this.camera = null;
        this.target = null;
    }
}

// سیستم مدیریت بازی
class GameManager {
    constructor() {
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.currentLevel = 1;
        this.score = 0;
        this.highScore = 0;
        this.player = null;
        this.enemies = [];
        this.coins = [];
        this.powerUps = [];
        this.gameTime = 0;
        this.isPaused = false;
        this.difficulty = 'normal';
        this.achievements = new Map();
        this.settings = {
            sound: true,
            music: true,
            vibrations: true,
            controls: 'touch', // touch, tilt, buttons
            graphics: 'high'
        };
    }

    // شروع بازی جدید
    startNewGame() {
        this.gameState = 'playing';
        this.currentLevel = 1;
        this.score = 0;
        this.gameTime = 0;
        this.isPaused = false;
        
        // بارگذاری تنظیمات ذخیره شده
        this.loadSettings();
        
        // ایجاد بازیکن
        this.createPlayer();
        
        // ایجاد سطح
        this.generateLevel(this.currentLevel);
        
        console.log('بازی جدید شروع شد');
    }

    // ایجاد بازیکن
    createPlayer() {
        this.player = {
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            velocity: { x: 0, y: 0, z: 0 },
            health: 100,
            fuel: 100,
            score: 0,
            weapons: ['laser'],
            currentWeapon: 'laser',
            upgrades: [],
            lives: 3
        };
    }

    // ایجاد سطح
    generateLevel(level) {
        this.enemies = [];
        this.coins = [];
        this.powerUps = [];
        
        // تعداد دشمنان بر اساس سطح
        const enemyCount = 10 + level * 5;
        
        // ایجاد دشمنان
        for (let i = 0; i < enemyCount; i++) {
            this.createEnemy(level);
        }
        
        // ایجاد سکه‌ها
        const coinCount = 20 + level * 10;
        for (let i = 0; i < coinCount; i++) {
            this.createCoin();
        }
        
        // ایجاد پاورآپ‌ها
        if (level % 3 === 0) {
            this.createPowerUp();
        }
        
        console.log(`سطح ${level} ایجاد شد`);
    }

    // ایجاد دشمن
    createEnemy(level) {
        const enemyTypes = ['volcano', 'meteor', 'alien'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const enemy = {
            id: Date.now() + Math.random(),
            type: type,
            position: {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                z: (Math.random() - 0.5) * 100
            },
            health: 50 + level * 10,
            speed: 1 + level * 0.2,
            damage: 10 + level * 5,
            scoreValue: 100 * level
        };
        
        this.enemies.push(enemy);
        return enemy;
    }

    // ایجاد سکه
    createCoin() {
        const coin = {
            id: Date.now() + Math.random(),
            type: Math.floor(Math.random() * 3) + 1, // 1, 2, 3
            position: {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                z: (Math.random() - 0.5) * 100
            },
            value: 10,
            collected: false
        };
        
        this.coins.push(coin);
        return coin;
    }

    // ایجاد پاورآپ
    createPowerUp() {
        const powerUpTypes = ['health', 'fuel', 'weapon', 'shield'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        const powerUp = {
            id: Date.now() + Math.random(),
            type: type,
            position: {
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                z: (Math.random() - 0.5) * 100
            },
            duration: 10, // ثانیه
            value: type === 'health' ? 25 : 
                   type === 'fuel' ? 50 :
                   type === 'weapon' ? 'double' : 100
        };
        
        this.powerUps.push(powerUp);
        return powerUp;
    }

    // به‌روزرسانی وضعیت بازی
    update(deltaTime) {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        this.gameTime += deltaTime;
        
        // به‌روزرسانی بازیکن
        this.updatePlayer(deltaTime);
        
        // به‌روزرسانی دشمنان
        this.updateEnemies(deltaTime);
        
        // بررسی برخوردها
        this.checkCollisions();
        
        // بررسی پایان سطح
        this.checkLevelCompletion();
        
        // ذخیره خودکار
        if (Math.floor(this.gameTime) % 30 === 0) {
            this.autoSave();
        }
    }

    // به‌روزرسانی بازیکن
    updatePlayer(deltaTime) {
        if (!this.player) return;
        
        // کاهش سوخت
        this.player.fuel = Math.max(0, this.player.fuel - deltaTime * 0.1);
        
        // اگر سوخت تمام شود
        if (this.player.fuel <= 0) {
            this.player.health -= deltaTime * 5;
        }
        
        // بررسی مرگ بازیکن
        if (this.player.health <= 0) {
            this.player.lives--;
            if (this.player.lives <= 0) {
                this.gameOver();
            } else {
                this.respawnPlayer();
            }
        }
        
        // حرکت بازیکن
        this.player.position.x += this.player.velocity.x * deltaTime;
        this.player.position.y += this.player.velocity.y * deltaTime;
        this.player.position.z += this.player.velocity.z * deltaTime;
    }

    // به‌روزرسانی دشمنان
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            // حرکت به سمت بازیکن
            const dx = this.player.position.x - enemy.position.x;
            const dy = this.player.position.y - enemy.position.y;
            const dz = this.player.position.z - enemy.position.z;
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance > 0) {
                enemy.position.x += (dx / distance) * enemy.speed * deltaTime;
                enemy.position.y += (dy / distance) * enemy.speed * deltaTime;
                enemy.position.z += (dz / distance) * enemy.speed * deltaTime;
            }
        });
    }

    // بررسی برخوردها
    checkCollisions() {
        // برخورد با سکه‌ها
        this.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const distance = this.calculateDistance(this.player.position, coin.position);
                if (distance < 2) {
                    coin.collected = true;
                    this.score += coin.value;
                    this.player.score += coin.value;
                    this.coins.splice(index, 1);
                    
                    // پخش صدای جمع‌آوری سکه
                    if (window.audioSystem) {
                        window.audioSystem.playSound('coin');
                    }
                }
            }
        });
        
        // برخورد با دشمنان
        this.enemies.forEach((enemy, index) => {
            const distance = this.calculateDistance(this.player.position, enemy.position);
            if (distance < 3) {
                this.player.health -= enemy.damage;
                
                // ایجاد انفجار
                if (window.spacecraft3D) {
                    window.spacecraft3D.createExplosion(enemy.position, 0.5);
                }
                
                // پخش صدای انفجار
                if (window.audioSystem) {
                    window.audioSystem.playSound('explosion');
                }
                
                this.enemies.splice(index, 1);
            }
        });
        
        // برخورد با پاورآپ‌ها
        this.powerUps.forEach((powerUp, index) => {
            const distance = this.calculateDistance(this.player.position, powerUp.position);
            if (distance < 2) {
                this.applyPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
    }

    // محاسبه فاصله
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // اعمال پاورآپ
    applyPowerUp(powerUp) {
        switch(powerUp.type) {
            case 'health':
                this.player.health = Math.min(100, this.player.health + powerUp.value);
                break;
            case 'fuel':
                this.player.fuel = Math.min(100, this.player.fuel + powerUp.value);
                break;
            case 'weapon':
                if (!this.player.weapons.includes(powerUp.value)) {
                    this.player.weapons.push(powerUp.value);
                }
                this.player.currentWeapon = powerUp.value;
                break;
            case 'shield':
                this.player.shield = powerUp.value;
                break;
        }
        
        console.log(`پاورآپ ${powerUp.type} اعمال شد`);
    }

    // بررسی تکمیل سطح
    checkLevelCompletion() {
        if (this.coins.length === 0 && this.enemies.length === 0) {
            this.completeLevel();
        }
    }

    // تکمیل سطح
    completeLevel() {
        this.score += this.currentLevel * 1000;
        this.currentLevel++;
        
        // پاداش برای تکمیل سطح
        this.player.fuel = 100;
        this.player.health = Math.min(100, this.player.health + 25);
        
        // ایجاد سطح جدید
        this.generateLevel(this.currentLevel);
        
        console.log(`سطح ${this.currentLevel - 1} تکمیل شد! رفتن به سطح ${this.currentLevel}`);
        
        // بررسی دستاوردها
        this.checkAchievements();
    }

    // بازی تمام شد
    gameOver() {
        this.gameState = 'gameOver';
        
        // به‌روزرسانی امتیاز بالا
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        console.log('بازی تمام شد! امتیاز نهایی:', this.score);
    }

    // تولد مجدد بازیکن
    respawnPlayer() {
        this.player.position = { x: 0, y: 0, z: 0 };
        this.player.health = 100;
        this.player.fuel = 100;
        this.player.velocity = { x: 0, y: 0, z: 0 };
        
        console.log('بازیکن تولد مجدد کرد. جان‌های باقی‌مانده:', this.player.lives);
    }

    // مکث بازی
    pauseGame() {
        this.isPaused = true;
        console.log('بازی مکث شد');
    }

    // ادامه بازی
    resumeGame() {
        this.isPaused = false;
        console.log('بازی ادامه یافت');
    }

    // ذخیره بازی
    saveGame() {
        const saveData = {
            level: this.currentLevel,
            score: this.score,
            player: this.player,
            gameTime: this.gameTime,
            timestamp: Date.now()
        };
        
        localStorage.setItem('galacticGame_save', JSON.stringify(saveData));
        console.log('بازی ذخیره شد');
    }

    // بارگذاری بازی
    loadGame() {
        const saveData = localStorage.getItem('galacticGame_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            
            this.currentLevel = data.level;
            this.score = data.score;
            this.player = data.player;
            this.gameTime = data.gameTime;
            
            this.generateLevel(this.currentLevel);
            this.gameState = 'playing';
            
            console.log('بازی بارگذاری شد');
            return true;
        }
        return false;
    }

    // ذخیره خودکار
    autoSave() {
        this.saveGame();
    }

    // ذخیره امتیاز بالا
    saveHighScore() {
        localStorage.setItem('galacticGame_highScore', this.highScore);
    }

    // بارگذاری امتیاز بالا
    loadHighScore() {
        const highScore = localStorage.getItem('galacticGame_highScore');
        if (highScore) {
            this.highScore = parseInt(highScore);
        }
    }

    // بارگذاری تنظیمات
    loadSettings() {
        const settings = localStorage.getItem('galacticGame_settings');
        if (settings) {
            this.settings = { ...this.settings, ...JSON.parse(settings) };
        }
    }

    // ذخیره تنظیمات
    saveSettings() {
        localStorage.setItem('galacticGame_settings', JSON.stringify(this.settings));
    }

    // بررسی دستاوردها
    checkAchievements() {
        const achievements = [
            { id: 'first_coin', condition: () => this.player.score >= 100, unlocked: false },
            { id: 'level_5', condition: () => this.currentLevel >= 5, unlocked: false },
            { id: 'score_10000', condition: () => this.score >= 10000, unlocked: false },
            { id: 'no_damage', condition: () => this.player.health === 100 && this.currentLevel > 1, unlocked: false },
            { id: 'speedrunner', condition: () => this.gameTime < 300 && this.currentLevel >= 3, unlocked: false }
        ];
        
        achievements.forEach(achievement => {
            if (!this.achievements.has(achievement.id) && achievement.condition()) {
                this.achievements.set(achievement.id, {
                    id: achievement.id,
                    name: this.getAchievementName(achievement.id),
                    description: this.getAchievementDescription(achievement.id),
                    unlocked: true,
                    timestamp: Date.now()
                });
                
                console.log(`دستاورد باز شد: ${this.getAchievementName(achievement.id)}`);
            }
        });
    }

    // دریافت نام دستاورد
    getAchievementName(id) {
        const names = {
            'first_coin': 'اولین سکه',
            'level_5': 'قهرمان سطح 5',
            'score_10000': 'امتیاز 10000',
            'no_damage': 'بدون آسیب',
            'speedrunner': 'سرعت بالا'
        };
        return names[id] || 'دستاورد ناشناخته';
    }

    // دریافت توضیح دستاورد
    getAchievementDescription(id) {
        const descriptions = {
            'first_coin': 'اولین سکه خود را جمع‌آوری کنید',
            'level_5': 'به سطح 5 برسید',
            'score_10000': 'به امتیاز 10000 برسید',
            'no_damage': 'یک سطح را بدون دریافت آسیب کامل کنید',
            'speedrunner': 'سطح 3 را در کمتر از 5 دقیقه کامل کنید'
        };
        return descriptions[id] || 'توضیح موجود نیست';
    }

    // پاک‌سازی حافظه
    dispose() {
        this.saveGame();
        this.player = null;
        this.enemies = [];
        this.coins = [];
        this.powerUps = [];
        this.achievements.clear();
    }
}

// ایجاد نمونه‌های جهانی از سیستم‌ها
window.memoryManager = new MemoryManager();
window.audioSystem = new AdvancedAudioSystem();
window.cameraSystem = new AdvancedCameraSystem();
window.gameManager = new GameManager();

// راه‌اندازی سیستم‌ها پس از بارگذاری صفحه
window.addEventListener('load', () => {
    // راه‌اندازی سیستم مدیریت حافظه
    window.memoryManager.init();
    
    // راه‌اندازی سیستم صدا
    window.audioSystem.init();
    
    // راه‌اندازی سیستم مدیریت بازی
    window.gameManager.loadHighScore();
    window.gameManager.loadSettings();
    
    console.log('تمام سیستم‌های بازی راه‌اندازی شدند');
});

// مدیریت خطاهای جهانی
window.addEventListener('error', (event) => {
    console.error('خطای جهانی:', event.error);
    
    // بازیابی از خطا
    try {
        if (window.gameManager && window.gameManager.gameState === 'playing') {
            window.gameManager.autoSave();
        }
    } catch (e) {
        console.error('خطا در بازیابی:', e);
    }
});

// مدیریت هنگ‌های احتمالی
let lastActivity = Date.now();
setInterval(() => {
    const now = Date.now();
    if (now - lastActivity > 10000) { // 10 ثانیه بدون فعالیت
        console.warn('هشدار: ممکن است بازی هنگ کرده باشد');
        // اقدامات بازیابی
    }
    lastActivity = now;
}, 5000);

// مدیریت تغییر اندازه پنجره
window.addEventListener('resize', () => {
    if (window.cameraSystem) {
        // به‌روزرسانی تنظیمات دوربین
    }
    
    if (window.gameManager && window.gameManager.gameState === 'playing') {
        // به‌روزرسانی رابط کاربری
    }
});

// مدیریت حالت تمام‌صفحه
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        console.log('حالت تمام‌صفحه فعال شد');
    } else {
        console.log('حالت تمام‌صفحه غیرفعال شد');
    }
});

// مدیریت visibility change (تب تغییر کرده)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // بازی در پس‌زمینه است
        if (window.gameManager && window.gameManager.gameState === 'playing') {
            window.gameManager.pauseGame();
        }
        if (window.audioSystem) {
            window.audioSystem.stopBackgroundMusic();
        }
    } else {
        // بازی به پیش‌زمینه بازگشته
        if (window.gameManager && window.gameManager.isPaused) {
            window.gameManager.resumeGame();
        }
        if (window.audioSystem && window.gameManager.settings.music) {
            window.audioSystem.playBackgroundMusic('background');
        }
    }
});

// مدیریت قبل از بسته شدن صفحه
window.addEventListener('beforeunload', (event) => {
    if (window.gameManager && window.gameManager.gameState === 'playing') {
        window.gameManager.autoSave();
        
        // نمایش هشدار
        event.preventDefault();
        event.returnValue = 'آیا مطمئن هستید که می‌خواهید صفحه را ترک کنید؟ پیشرفت بازی شما ذخیره خواهد شد.';
        return event.returnValue;
    }
});

// صادر کردن کلاس‌ها برای استفاده جهانی
window.MemoryManager = MemoryManager;
window.AdvancedAudioSystem = AdvancedAudioSystem;
window.AdvancedCameraSystem = AdvancedCameraSystem;
window.GameManager = GameManager;
