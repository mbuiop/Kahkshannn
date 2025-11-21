// m2.js - سیستم دوربین پویا و بهینه‌سازی پیشرفته
class CameraSystem {
    constructor() {
        this.position = [0, 0, 10];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.fov = 60;
        this.aspect = 1;
        this.near = 0.1;
        this.far = 1000;
        this.viewMatrix = new Float32Array(16);
        this.projectionMatrix = new Float32Array(16);
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeTimer = 0;
        this.offset = [0, 0, 0];
    }

    initialize() {
        this.aspect = window.innerWidth / window.innerHeight;
        this.updateProjectionMatrix();
        this.updateViewMatrix();
        
        console.log('✅ سیستم دوربین راه‌اندازی شد');
    }

    updateProjectionMatrix() {
        const fovRad = this.fov * Math.PI / 180;
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fovRad);
        const rangeInv = 1.0 / (this.near - this.far);

        this.projectionMatrix[0] = f / this.aspect;
        this.projectionMatrix[5] = f;
        this.projectionMatrix[10] = (this.near + this.far) * rangeInv;
        this.projectionMatrix[11] = -1;
        this.projectionMatrix[14] = this.near * this.far * rangeInv * 2;
        this.projectionMatrix[15] = 0;
    }

    updateViewMatrix() {
        const z = [
            this.position[0] - this.target[0],
            this.position[1] - this.target[1],
            this.position[2] - this.target[2]
        ];
        const zLength = Math.sqrt(z[0] * z[0] + z[1] * z[1] + z[2] * z[2]);
        
        if (zLength > 0) {
            z[0] /= zLength;
            z[1] /= zLength;
            z[2] /= zLength;
        }

        const x = [
            this.up[1] * z[2] - this.up[2] * z[1],
            this.up[2] * z[0] - this.up[0] * z[2],
            this.up[0] * z[1] - this.up[1] * z[0]
        ];
        const xLength = Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
        
        if (xLength > 0) {
            x[0] /= xLength;
            x[1] /= xLength;
            x[2] /= xLength;
        }

        const y = [
            z[1] * x[2] - z[2] * x[1],
            z[2] * x[0] - z[0] * x[2],
            z[0] * x[1] - z[1] * x[0]
        ];

        this.viewMatrix[0] = x[0];
        this.viewMatrix[1] = y[0];
        this.viewMatrix[2] = z[0];
        this.viewMatrix[3] = 0;
        
        this.viewMatrix[4] = x[1];
        this.viewMatrix[5] = y[1];
        this.viewMatrix[6] = z[1];
        this.viewMatrix[7] = 0;
        
        this.viewMatrix[8] = x[2];
        this.viewMatrix[9] = y[2];
        this.viewMatrix[10] = z[2];
        this.viewMatrix[11] = 0;
        
        this.viewMatrix[12] = -(x[0] * this.position[0] + x[1] * this.position[1] + x[2] * this.position[2]);
        this.viewMatrix[13] = -(y[0] * this.position[0] + y[1] * this.position[1] + y[2] * this.position[2]);
        this.viewMatrix[14] = -(z[0] * this.position[0] + z[1] * this.position[1] + z[2] * this.position[2]);
        this.viewMatrix[15] = 1;
    }

    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.updateViewMatrix();
    }

    setTarget(x, y, z) {
        this.target[0] = x;
        this.target[1] = y;
        this.target[2] = z;
        this.updateViewMatrix();
    }

    follow(target, offset = [0, 0, 10]) {
        this.position[0] = target[0] + offset[0];
        this.position[1] = target[1] + offset[1];
        this.position[2] = target[2] + offset[2];
        this.target[0] = target[0];
        this.target[1] = target[1];
        this.target[2] = target[2];
        
        // اعمال لرزش اگر فعال باشد
        if (this.shakeTimer > 0) {
            this.applyShake();
        }
        
        this.updateViewMatrix();
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeTimer = duration;
    }

    applyShake() {
        if (this.shakeTimer > 0) {
            const progress = this.shakeTimer / this.shakeDuration;
            const currentIntensity = this.shakeIntensity * progress;
            
            this.offset[0] = (Math.random() - 0.5) * 2 * currentIntensity;
            this.offset[1] = (Math.random() - 0.5) * 2 * currentIntensity;
            this.offset[2] = (Math.random() - 0.5) * 2 * currentIntensity;
            
            this.position[0] += this.offset[0];
            this.position[1] += this.offset[1];
            this.position[2] += this.offset[2];
            
            this.shakeTimer -= 0.016; // کاهش بر اساس زمان فریم
        }
    }

    resize(width, height) {
        this.aspect = width / height;
        this.updateProjectionMatrix();
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }
}

class PerformanceOptimizer {
    constructor() {
        this.frameTime = 0;
        this.lastFrameTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.performanceMetrics = {
            fps: 0,
            frameTime: 0,
            memory: 0,
            drawCalls: 0,
            triangleCount: 0
        };
        this.optimizationLevel = 'high';
        this.lodDistances = [50, 100, 200];
        this.cullingEnabled = true;
        this.occlusionEnabled = true;
    }

    initialize() {
        this.lastFrameTime = performance.now();
        this.lastFpsUpdate = this.lastFrameTime;
        console.log('✅ بهینه‌ساز عملکرد راه‌اندازی شد');
    }

    beginFrame() {
        const currentTime = performance.now();
        this.frameTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.frameCount++;
        
        // به‌روزرسانی FPS هر ثانیه
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.performanceMetrics.fps = this.fps;
            this.performanceMetrics.frameTime = this.frameTime;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            this.updateMemoryUsage();
        }
    }

    updateMemoryUsage() {
        if (performance.memory) {
            this.performanceMetrics.memory = performance.memory.usedJSHeapSize / 1048576; // MB
        }
    }

    optimizeScene(scene, camera) {
        if (!this.cullingEnabled) return scene;
        
        const optimizedScene = [];
        const frustum = this.extractFrustum(camera);
        
        scene.forEach(object => {
            if (this.isInFrustum(object, frustum)) {
                // اعمال LOD
                const distance = this.calculateDistance(object, camera);
                const lodLevel = this.calculateLOD(distance);
                
                if (lodLevel <= this.optimizationLevel) {
                    optimizedScene.push({
                        ...object,
                        lodLevel: lodLevel
                    });
                }
            }
        });
        
        this.performanceMetrics.drawCalls = optimizedScene.length;
        
        return optimizedScene;
    }

    extractFrustum(camera) {
        // استخراج صفحات frustum از ماتریس view-projection
        const matrix = this.multiplyMatrices(camera.projectionMatrix, camera.viewMatrix);
        const frustum = [];
        
        // صفحات frustum
        for (let i = 0; i < 6; i++) {
            frustum.push({
                normal: [0, 0, 0],
                constant: 0
            });
        }
        
        // محاسبات صفحات frustum
        // (پیاده‌سازی کامل نیاز به محاسبات پیچیده‌تر دارد)
        
        return frustum;
    }

    multiplyMatrices(a, b) {
        const result = new Float32Array(16);
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] = 0;
                for (let k = 0; k < 4; k++) {
                    result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
                }
            }
        }
        
        return result;
    }

    isInFrustum(object, frustum) {
        if (!this.cullingEnabled) return true;
        
        // بررسی ساده (در پیاده‌سازی واقعی از bounding volumes استفاده می‌شود)
        const distance = Math.sqrt(
            Math.pow(object.position[0], 2) +
            Math.pow(object.position[1], 2) +
            Math.pow(object.position[2], 2)
        );
        
        return distance < 500; // فاصله حداکثر رندر
    }

    calculateDistance(object, camera) {
        const dx = object.position[0] - camera.position[0];
        const dy = object.position[1] - camera.position[1];
        const dz = object.position[2] - camera.position[2];
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    calculateLOD(distance) {
        if (distance < this.lodDistances[0]) return 'high';
        if (distance < this.lodDistances[1]) return 'medium';
        if (distance < this.lodDistances[2]) return 'low';
        return 'very_low';
    }

    adjustOptimization(targetFPS = 60) {
        const currentFPS = this.fps;
        
        if (currentFPS < targetFPS - 10) {
            // کاهش کیفیت برای افزایش عملکرد
            this.optimizationLevel = 'medium';
            this.cullingEnabled = true;
        } else if (currentFPS > targetFPS + 10) {
            // افزایش کیفیت اگر عملکرد خوب است
            this.optimizationLevel = 'high';
            this.cullingEnabled = true;
        }
    }

    getMetrics() {
        return this.performanceMetrics;
    }

    logMetrics() {
        console.group('📊 معیارهای عملکرد');
        console.log(`FPS: ${this.performanceMetrics.fps}`);
        console.log(`زمان فریم: ${this.performanceMetrics.frameTime.toFixed(2)}ms`);
        console.log(`حافظه: ${this.performanceMetrics.memory.toFixed(2)}MB`);
        console.log(`فراخوانی‌های رندر: ${this.performanceMetrics.drawCalls}`);
        console.groupEnd();
    }
}

class MemoryManager {
    constructor() {
        this.pools = new Map();
        this.allocated = new Set();
        this.memoryLimit = 100 * 1024 * 1024; // 100MB
        this.currentUsage = 0;
        this.cleanupInterval = null;
    }

    initialize() {
        // شروع نظافت دوره‌ای حافظه
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 30000); // هر 30 ثانیه
        
        console.log('✅ مدیر حافظه راه‌اندازی شد');
    }

    createPool(name, objectConstructor, initialSize = 100) {
        const pool = {
            objects: [],
            available: [],
            constructor: objectConstructor,
            size: initialSize
        };
        
        // ایجاد اشیاء اولیه
        for (let i = 0; i < initialSize; i++) {
            const obj = objectConstructor();
            pool.objects.push(obj);
            pool.available.push(obj);
        }
        
        this.pools.set(name, pool);
        return pool;
    }

    allocate(poolName) {
        const pool = this.pools.get(poolName);
        if (!pool) {
            console.error('استخر یافت نشد:', poolName);
            return null;
        }
        
        if (pool.available.length === 0) {
            // گسترش استخر
            this.expandPool(poolName, Math.ceil(pool.size * 0.5));
        }
        
        const obj = pool.available.pop();
        this.allocated.add(obj);
        return obj;
    }

    free(poolName, obj) {
        const pool = this.pools.get(poolName);
        if (pool && this.allocated.has(obj)) {
            pool.available.push(obj);
            this.allocated.delete(obj);
            
            // بازنشانی وضعیت شیء
            if (obj.reset) {
                obj.reset();
            }
        }
    }

    expandPool(poolName, additionalSize) {
        const pool = this.pools.get(poolName);
        if (pool) {
            for (let i = 0; i < additionalSize; i++) {
                const obj = pool.constructor();
                pool.objects.push(obj);
                pool.available.push(obj);
            }
            pool.size += additionalSize;
            console.log(`استخر ${poolName} به ${pool.size} شیء گسترش یافت`);
        }
    }

    cleanup() {
        const before = this.currentUsage;
        
        // پاکسازی منابع استفاده نشده
        this.pools.forEach((pool, name) => {
            if (pool.available.length > pool.size * 0.7) {
                // کاهش اندازه استخر اگر بیش از 70% آزاد است
                this.shrinkPool(name);
            }
        });
        
        // فراخوانی جمع‌آوری زباله (اگر در دسترس باشد)
        if (window.gc) {
            window.gc();
        }
        
        const after = this.currentUsage;
        console.log(`🧹 نظافت حافظه: ${(before - after).toFixed(2)}MB آزاد شد`);
    }

    shrinkPool(poolName) {
        const pool = this.pools.get(poolName);
        if (pool && pool.available.length > 10) {
            const targetSize = Math.max(10, Math.floor(pool.size * 0.7));
            const toRemove = pool.size - targetSize;
            
            if (toRemove > 0) {
                // حذف اشیاء اضافی از انتهای استخر
                for (let i = 0; i < toRemove; i++) {
                    if (pool.available.length > 0) {
                        const obj = pool.available.pop();
                        const index = pool.objects.indexOf(obj);
                        if (index > -1) {
                            pool.objects.splice(index, 1);
                        }
                    }
                }
                
                pool.size = targetSize;
                console.log(`استخر ${poolName} به ${pool.size} شیء کاهش یافت`);
            }
        }
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.pools.clear();
        this.allocated.clear();
    }
}

class GameInstance {
    constructor() {
        this.graphicsEngine = null;
        this.cameraSystem = null;
        this.performanceOptimizer = null;
        this.memoryManager = null;
        this.gameObjects = [];
        this.running = false;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.scene = [];
        this.player = null;
    }

    initialize() {
        try {
            console.log('🎮 شروع راه‌اندازی بازی...');
            
            // راه‌اندازی سیستم‌ها
            this.graphicsEngine = new GraphicsEngine();
            this.cameraSystem = new CameraSystem();
            this.performanceOptimizer = new PerformanceOptimizer();
            this.memoryManager = new MemoryManager();
            
            this.graphicsEngine.initialize();
            this.cameraSystem.initialize();
            this.performanceOptimizer.initialize();
            this.memoryManager.initialize();
            
            // ایجاد صحنه اولیه
            this.createInitialScene();
            
            // شروع حلقه بازی
            this.running = true;
            this.lastUpdateTime = performance.now();
            this.gameLoop();
            
            console.log('✅ بازی با موفقیت راه‌اندازی شد');
            
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی بازی:', error);
            this.handleInitializationError(error);
        }
    }

    createInitialScene() {
        // ایجاد سفینه بازیکن
        this.player = new GameObject('spaceship', 'spaceship');
        this.player.transform.setPosition(0, 0, 0);
        this.player.velocity = [0, 0, 0];
        this.player.collider = { radius: 1.0 };
        this.gameObjects.push(this.player);
        
        // ایجاد سیارات
        for (let i = 0; i < 5; i++) {
            const planet = new GameObject('planet', 'planet');
            planet.transform.setPosition(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
            planet.transform.setScale(2 + Math.random() * 3);
            planet.collider = { radius: 2.0 };
            this.gameObjects.push(planet);
        }
        
        // ایجاد دشمنان
        for (let i = 0; i < 3; i++) {
            const enemy = new GameObject('missile', 'missile');
            enemy.transform.setPosition(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            enemy.aiBehavior = 'patrol';
            enemy.collider = { radius: 0.5 };
            this.gameObjects.push(enemy);
        }
    }

    gameLoop() {
        if (!this.running) return;
        
        this.performanceOptimizer.beginFrame();
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        this.gameTime += this.deltaTime;
        
        // به‌روزرسانی منطق بازی
        this.update(this.deltaTime);
        
        // رندر صحنه
        this.render();
        
        // درخواست فریم بعدی
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // به‌روزرسانی موقعیت دوربین
        if (this.player) {
            this.cameraSystem.follow(this.player.transform.position, [0, 5, 15]);
        }
        
        // به‌روزرسانی اشیاء بازی
        this.gameObjects.forEach(object => {
            if (object.update) {
                object.update(deltaTime);
            }
        });
        
        // بهینه‌سازی صحنه
        this.scene = this.performanceOptimizer.optimizeScene(this.gameObjects, this.cameraSystem);
        
        // تنظیم خودکار بهینه‌سازی
        this.performanceOptimizer.adjustOptimization(60);
        
        // به‌روزرسانی HUD
        this.updateHUD();
    }

    render() {
        if (this.graphicsEngine && this.cameraSystem) {
            this.graphicsEngine.render(this.cameraSystem, this.scene);
        }
    }

    updateHUD() {
        const score = Math.floor(this.gameTime * 10);
        const fuel = 100; // مقدار واقعی سوخت
        const level = 1; // مرحله فعلی
        
        if (typeof updateHUD === 'function') {
            updateHUD(score, fuel, level);
        }
    }

    handleInput(movement) {
        if (this.player && this.player.velocity) {
            this.player.velocity[0] = movement.x * 10;
            this.player.velocity[1] = movement.y * 10;
            this.player.velocity[2] = movement.z * 10;
        }
    }

    handleInitializationError(error) {
        // نمایش پیام خطا به کاربر
        const errorMessage = `
            متأسفانه بازی قابل راه‌اندازی نیست.
            
            علت احتمالی:
            • مرورگر شما از WebGL پشتیبانی نمی‌کند
            • سخت‌افزار گرافیکی به اندازه کافی قدرتمند نیست
            • حافظه کافی در دسترس نیست
            
            خطای فنی: ${error.message}
        `;
        
        alert(errorMessage);
        
        // بازگشت به منوی اصلی
        if (typeof returnToMainMenu === 'function') {
            returnToMainMenu();
        }
    }

    cleanup() {
        console.log('🧹 پاکسازی منابع بازی...');
        
        this.running = false;
        
        if (this.graphicsEngine) {
            this.graphicsEngine.cleanup();
        }
        
        if (this.memoryManager) {
            this.memoryManager.destroy();
        }
        
        this.gameObjects = [];
        this.scene = [];
        
        console.log('✅ منابع بازی پاکسازی شدند');
    }
}

// مدیریت رویدادهای صفحه
class InputManager {
    constructor() {
        this.keys = new Set();
        this.mouse = { x: 0, y: 0, down: false };
        this.touch = { x: 0, y: 0, active: false };
        this.gamepad = null;
        this.sensitivity = 1.0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // صفحه‌کلید
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // موس
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('mousedown', () => {
            this.mouse.down = true;
        });
        
        document.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });
        
        // لمسی
        document.addEventListener('touchstart', (e) => {
            this.touch.active = true;
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
            e.preventDefault();
        });
        
        document.addEventListener('touchmove', (e) => {
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
            e.preventDefault();
        });
        
        document.addEventListener('touchend', () => {
            this.touch.active = false;
        });
        
        // گیم‌پد
        window.addEventListener('gamepadconnected', (e) => {
            this.gamepad = e.gamepad;
            console.log('گیم‌پد متصل شد:', e.gamepad.id);
        });
        
        window.addEventListener('gamepaddisconnected', () => {
            this.gamepad = null;
            console.log('گیم‌پد قطع شد');
        });
    }

    getMovement() {
        const movement = { x: 0, y: 0, z: 0 };
        
        // کنترل با صفحه‌کلید
        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) movement.x += 1;
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) movement.x -= 1;
        if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) movement.y += 1;
        if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) movement.y -= 1;
        
        // کنترل با گیم‌پد
        if (this.gamepad) {
            movement.x += this.gamepad.axes[0];
            movement.y += this.gamepad.axes[1];
        }
        
        // نرمال‌سازی حرکت
        const length = Math.sqrt(movement.x * movement.x + movement.y * movement.y);
        if (length > 1) {
            movement.x /= length;
            movement.y /= length;
        }
        
        return movement;
    }

    isKeyPressed(key) {
        return this.keys.has(key);
    }

    updateGamepad() {
        if (navigator.getGamepads) {
            const gamepads = navigator.getGamepads();
            if (gamepads[0]) {
                this.gamepad = gamepads[0];
            }
        }
    }
}

// سیستم مدیریت صدا
class AdvancedAudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.music = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            this.setMasterVolume(0.8);
            this.setMusicVolume(0.6);
            this.setSFXVolume(0.8);
            
            this.initialized = true;
            console.log('✅ سیستم صوتی پیشرفته راه‌اندازی شد');
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی سیستم صوتی:', error);
        }
    }

    async loadSound(name, url) {
        if (!this.initialized) return;
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, audioBuffer);
        } catch (error) {
            console.error(`خطا در بارگذاری صدا ${name}:`, error);
        }
    }

    playSound(name, options = {}) {
        if (!this.initialized || !this.sounds.has(name)) return null;
        
        const {
            volume = 1.0,
            pitch = 1.0,
            loop = false,
            pan = 0
        } = options;
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();
        
        source.buffer = this.sounds.get(name);
        source.loop = loop;
        source.playbackRate.value = pitch;
        
        gainNode.gain.value = volume;
        panner.pan.value = pan;
        
        source.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.sfxGain);
        
        source.start();
        return source;
    }

    playMusic(url, loop = true) {
        if (!this.initialized) return;
        
        this.stopMusic();
        
        const audio = new Audio(url);
        audio.loop = loop;
        audio.volume = 0.6;
        
        const source = this.audioContext.createMediaElementSource(audio);
        source.connect(this.musicGain);
        
        audio.play().catch(e => console.log('خطا در پخش موسیقی:', e));
        
        this.music = { audio, source };
        return this.music;
    }

    stopMusic() {
        if (this.music) {
            this.music.audio.pause();
            this.music.source.disconnect();
            this.music = null;
        }
    }

    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }

    setMusicVolume(volume) {
        if (this.musicGain) {
            this.musicGain.gain.value = volume;
        }
    }

    setSFXVolume(volume) {
        if (this.sfxGain) {
            this.sfxGain.gain.value = volume;
        }
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// سیستم شبکه پیشرفته
class AdvancedNetworkManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.players = new Map();
        this.latency = 0;
        this.packetLoss = 0;
        this.messageHandlers = new Map();
    }

    async connect(serverUrl) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(serverUrl);
                
                this.socket.onopen = () => {
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    console.log('اتصال شبکه برقرار شد');
                    resolve();
                };
                
                this.socket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                
                this.socket.onclose = () => {
                    this.connected = false;
                    console.log('اتصال شبکه قطع شد');
                    this.handleDisconnection();
                };
                
                this.socket.onerror = (error) => {
                    console.error('خطای شبکه:', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }

    handleDisconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`تلاش برای اتصال مجدد در ${delay}ms...`);
            
            setTimeout(() => {
                this.connect(this.socket.url).catch(() => {
                    this.handleDisconnection();
                });
            }, delay);
        } else {
            console.error('تلاش‌های اتصال مجدد ناموفق بود');
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            if (this.messageHandlers.has(message.type)) {
                this.messageHandlers.get(message.type).forEach(handler => {
                    handler(message);
                });
            }
            
            switch (message.type) {
                case 'ping':
                    this.handlePing(message);
                    break;
                case 'player_snapshot':
                    this.handlePlayerSnapshot(message);
                    break;
                case 'game_state':
                    this.handleGameState(message);
                    break;
                default:
                    console.log('پیام ناشناخته:', message);
            }
        } catch (error) {
            console.error('خطا در پردازش پیام:', error);
        }
    }

    handlePing(message) {
        const now = Date.now();
        this.latency = now - message.timestamp;
        
        // پاسخ به ping
        this.sendMessage('pong', { timestamp: now });
    }

    handlePlayerSnapshot(message) {
        message.players.forEach(playerData => {
            this.players.set(playerData.id, playerData);
        });
    }

    handleGameState(message) {
        // به‌روزرسانی وضعیت بازی
        if (this.onGameStateUpdate) {
            this.onGameStateUpdate(message.state);
        }
    }

    sendMessage(type, data) {
        if (this.connected && this.socket) {
            const message = {
                type,
                data,
                timestamp: Date.now(),
                sequence: this.generateSequence()
            };
            
            this.socket.send(JSON.stringify(message));
        }
    }

    generateSequence() {
        return Date.now() + Math.random();
    }

    registerMessageHandler(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);
    }

    updatePlayerState(position, rotation, state) {
        this.sendMessage('player_update', {
            position,
            rotation,
            state,
            timestamp: Date.now()
        });
    }

    getNetworkMetrics() {
        return {
            connected: this.connected,
            latency: this.latency,
            packetLoss: this.packetLoss,
            players: this.players.size
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

// سیستم ذخیره‌سازی ابری
class CloudSaveSystem {
    constructor() {
        this.apiUrl = 'https://api.yourgame.com/saves';
        this.userId = null;
        this.token = null;
        this.autoSave = true;
        this.autoSaveInterval = 30000; // 30 ثانیه
        this.lastSave = null;
    }

    async initialize(userId, token) {
        this.userId = userId;
        this.token = token;
        
        if (this.autoSave) {
            setInterval(() => {
                this.autoSaveGame();
            }, this.autoSaveInterval);
        }
    }

    async saveGame(saveData) {
        try {
            const response = await fetch(`${this.apiUrl}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    userId: this.userId,
                    data: saveData,
                    timestamp: Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`خطای سرور: ${response.status}`);
            }
            
            const result = await response.json();
            this.lastSave = Date.now();
            
            console.log('بازی در ابر ذخیره شد');
            return result;
        } catch (error) {
            console.error('خطا در ذخیره ابری:', error);
            throw error;
        }
    }

    async loadGame() {
        try {
            const response = await fetch(`${this.apiUrl}/load/${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`خطای سرور: ${response.status}`);
            }
            
            const saveData = await response.json();
            console.log('بازی از ابر بارگذاری شد');
            return saveData;
        } catch (error) {
            console.error('خطا در بارگذاری ابری:', error);
            throw error;
        }
    }

    async listSaves() {
        try {
            const response = await fetch(`${this.apiUrl}/list/${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`خطای سرور: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('خطا در دریافت لیست ذخیره‌ها:', error);
            throw error;
        }
    }

    async autoSaveGame() {
        if (this.userId && this.token) {
            const gameData = this.getCurrentGameState();
            try {
                await this.saveGame(gameData);
            } catch (error) {
                console.error('خطا در ذخیره خودکار:', error);
            }
        }
    }

    getCurrentGameState() {
        // جمع‌آوری وضعیت فعلی بازی
        return {
            score: 0, // مقدار واقعی
            level: 1, // مقدار واقعی
            playerPosition: [0, 0, 0], // مقدار واقعی
            inventory: [], // آیتم‌های بازیکن
            settings: {}, // تنظیمات بازی
            timestamp: Date.now()
        };
    }

    isCloudEnabled() {
        return this.userId !== null && this.token !== null;
    }
}

// سیستم گزارش خطا
class ErrorReportingSystem {
    constructor() {
        this.apiUrl = 'https://api.yourgame.com/errors';
        this.enabled = true;
        this.userId = null;
        this.version = '1.0.0';
    }

    initialize(userId) {
        this.userId = userId;
        
        // ثبت هندلر全局 برای خطاهای catch نشده
        window.addEventListener('error', (event) => {
            this.reportError({
                message: event.error?.message || event.message,
                stack: event.error?.stack,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.reportError({
                message: 'Unhandled Promise Rejection',
                reason: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
        });
        
        console.log('✅ سیستم گزارش خطا راه‌اندازی شد');
    }

    async reportError(errorData) {
        if (!this.enabled) return;
        
        try {
            const report = {
                userId: this.userId,
                version: this.version,
                userAgent: navigator.userAgent,
                timestamp: Date.now(),
                ...errorData
            };
            
            // ارسال به سرور (در محیط production)
            if (process.env.NODE_ENV === 'production') {
                await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(report)
                });
            }
            
            // همچنین در کنسول نمایش داده شود
            console.error('🚨 خطای گزارش شده:', report);
        } catch (error) {
            console.error('خطا در ارسال گزارش خطا:', error);
        }
    }

    captureBreadcrumb(message, data) {
        if (!this.enabled) return;
        
        console.log(`🍞 ${message}`, data);
    }

    setUser(userId) {
        this.userId = userId;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}

// سیستم آنالیتیکس
class AnalyticsSystem {
    constructor() {
        this.apiUrl = 'https://api.yourgame.com/analytics';
        this.enabled = true;
        this.userId = null;
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.flushInterval = null;
    }

    initialize(userId) {
        this.userId = userId;
        
        // شروع فلاش دوره‌ای رویدادها
        this.flushInterval = setInterval(() => {
            this.flushEvents();
        }, 10000); // هر 10 ثانیه
        
        this.trackEvent('session_start');
        console.log('✅ سیستم آنالیتیکس راه‌اندازی شد');
    }

    trackEvent(eventName, properties = {}) {
        if (!this.enabled) return;
        
        const event = {
            eventName,
            properties,
            userId: this.userId,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            resolution: `${window.screen.width}x${window.screen.height}`
        };
        
        this.events.push(event);
        console.log(`📊 رویداد: ${eventName}`, properties);
        
        // اگر تعداد رویدادها به حدی رسید، فوراً ارسال شود
        if (this.events.length >= 10) {
            this.flushEvents();
        }
    }

    trackGameEvent(eventName, gameState) {
        this.trackEvent(eventName, {
            score: gameState.score,
            level: gameState.level,
            playTime: gameState.playTime,
            // سایر معیارهای بازی
        });
    }

    async flushEvents() {
        if (this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        try {
            if (process.env.NODE_ENV === 'production') {
                await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ events: eventsToSend })
                });
            }
            
            console.log(`📤 ${eventsToSend.length} رویداد ارسال شد`);
        } catch (error) {
            console.error('خطا در ارسال رویدادها:', error);
            // بازگرداندن رویدادها به صف در صورت خطا
            this.events.unshift(...eventsToSend);
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setUser(userId) {
        this.userId = userId;
    }

    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        
        // ارسال رویدادهای باقی‌مانده
        this.flushEvents();
        this.trackEvent('session_end');
    }
}

// صادر کردن کلاس‌ها
window.CameraSystem = CameraSystem;
window.PerformanceOptimizer = PerformanceOptimizer;
window.MemoryManager = MemoryManager;
window.GameInstance = GameInstance;
window.InputManager = InputManager;
window.AdvancedAudioSystem = AdvancedAudioSystem;
window.AdvancedNetworkManager = AdvancedNetworkManager;
window.CloudSaveSystem = CloudSaveSystem;
window.ErrorReportingSystem = ErrorReportingSystem;
window.AnalyticsSystem = AnalyticsSystem;

console.log('🚀 تمام سیستم‌های بازی بارگذاری شدند و آماده هستند!');
