// utils.js - ابزارهای کمکی و توابع عمومی

class GameUtils {
    constructor() {
        this.assets = new Map();
        this.cache = new Map();
        this.config = {};
        
        this.init();
    }

    init() {
        this.loadConfig();
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
    }

    // مدیریت پیکربندی
    loadConfig() {
        this.config = {
            game: {
                version: '1.0.0',
                maxLevel: 20,
                timePerLevel: 60,
                startingLives: 3
            },
            graphics: {
                enabled: true,
                quality: 'high',
                particleCount: 100,
                maxFPS: 60
            },
            audio: {
                enabled: true,
                volume: 0.8,
                musicVolume: 0.6,
                soundEffects: true
            },
            controls: {
                touchEnabled: true,
                keyboardEnabled: true,
                swipeSensitivity: 1.0
            }
        };

        // بارگذاری تنظیمات از localStorage
        const savedConfig = localStorage.getItem('gameConfig');
        if (savedConfig) {
            this.config = this.deepMerge(this.config, JSON.parse(savedConfig));
        }
    }

    saveConfig() {
        localStorage.setItem('gameConfig', JSON.stringify(this.config));
    }

    deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // مدیریت خطاها
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError('Global Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });

        // اضافه کردن هندلر برای خطاهای بازی
        this.overrideConsoleMethods();
    }

    handleError(type, error) {
        const errorInfo = {
            type: type,
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('Game Error:', errorInfo);
        
        // ذخیره خطا برای گزارش‌دهی
        this.saveError(errorInfo);
        
        // نمایش خطا به کاربر (در حالت توسعه)
        if (this.isDevelopment()) {
            this.showErrorToUser(errorInfo);
        }
    }

    saveError(errorInfo) {
        const errors = JSON.parse(localStorage.getItem('gameErrors') || '[]');
        errors.push(errorInfo);
        
        // محدود کردن تعداد خطاهای ذخیره شده
        if (errors.length > 50) {
            errors.shift();
        }
        
        localStorage.setItem('gameErrors', JSON.stringify(errors));
    }

    showErrorToUser(errorInfo) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        errorDiv.innerHTML = `
            <strong>خطای بازی</strong>
            <p>${errorInfo.message}</p>
            <button onclick="this.parentNode.remove()" style="
                background: #c0392b;
                border: none;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
            ">بستن</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // حذف خودکار بعد از 10 ثانیه
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 10000);
    }

    overrideConsoleMethods() {
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
        };

        console.error = (...args) => {
            originalConsole.error.apply(console, args);
            this.handleError('Console Error', new Error(args.join(' ')));
        };

        console.warn = (...args) => {
            originalConsole.warn.apply(console, args);
            // برای هشدارها فقط لاگ می‌کنیم
            this.logWarning(args.join(' '));
        };
    }

    logWarning(message) {
        const warnings = JSON.parse(localStorage.getItem('gameWarnings') || '[]');
        warnings.push({
            message: message,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('gameWarnings', JSON.stringify(warnings));
    }

    // مانیتورینگ عملکرد
    setupPerformanceMonitoring() {
        this.performance = {
            fps: 0,
            frameCount: 0,
            lastTime: performance.now(),
            measurements: []
        };

        this.startFPSCounter();
        this.startMemoryMonitoring();
    }

    startFPSCounter() {
        const measureFPS = (currentTime) => {
            this.performance.frameCount++;
            
            if (currentTime >= this.performance.lastTime + 1000) {
                this.performance.fps = Math.round(
                    (this.performance.frameCount * 1000) / (currentTime - this.performance.lastTime)
                );
                
                this.performance.frameCount = 0;
                this.performance.lastTime = currentTime;
                
                // ذخیره اندازه‌گیری FPS
                this.recordPerformanceMeasurement('fps', this.performance.fps);
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    startMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.recordPerformanceMeasurement('memory', {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                });
            }, 5000);
        }
    }

    recordPerformanceMeasurement(type, value) {
        this.performance.measurements.push({
            type: type,
            value: value,
            timestamp: Date.now()
        });
        
        // محدود کردن تعداد اندازه‌گیری‌ها
        if (this.performance.measurements.length > 1000) {
            this.performance.measurements = this.performance.measurements.slice(-500);
        }
    }

    getPerformanceReport() {
        const fpsMeasurements = this.performance.measurements
            .filter(m => m.type === 'fps')
            .map(m => m.value);
        
        const avgFPS = fpsMeasurements.length > 0 ? 
            fpsMeasurements.reduce((a, b) => a + b) / fpsMeasurements.length : 0;
        
        const minFPS = Math.min(...fpsMeasurements);
        const maxFPS = Math.max(...fpsMeasurements);
        
        return {
            fps: {
                current: this.performance.fps,
                average: Math.round(avgFPS),
                min: minFPS,
                max: maxFPS
            },
            memory: this.getMemoryUsage(),
            measurements: this.performance.measurements.length
        };
    }

    getMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            return {
                used: this.formatBytes(memory.usedJSHeapSize),
                total: this.formatBytes(memory.totalJSHeapSize),
                limit: this.formatBytes(memory.jsHeapSizeLimit)
            };
        }
        return null;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // مدیریت دارایی‌ها
    async loadAssets(assetList) {
        const loadPromises = assetList.map(asset => this.loadAsset(asset));
        
        try {
            await Promise.all(loadPromises);
            return true;
        } catch (error) {
            this.handleError('Asset Loading Error', error);
            return false;
        }
    }

    async loadAsset(asset) {
        if (this.assets.has(asset.url)) {
            return this.assets.get(asset.url);
        }

        return new Promise((resolve, reject) => {
            const loader = this.getAssetLoader(asset.type);
            
            if (!loader) {
                reject(new Error(`Unsupported asset type: ${asset.type}`));
                return;
            }

            loader(asset.url)
                .then(data => {
                    this.assets.set(asset.url, data);
                    resolve(data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    getAssetLoader(type) {
        const loaders = {
            image: (url) => this.loadImage(url),
            audio: (url) => this.loadAudio(url),
            json: (url) => this.loadJSON(url),
            text: (url) => this.loadText(url)
        };
        
        return loaders[type];
    }

    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
            audio.src = url;
        });
    }

    loadJSON(url) {
        return fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    }

    loadText(url) {
        return fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        });
    }

    getAsset(url) {
        return this.assets.get(url);
    }

    // توابع ریاضی و ابزارهای محاسباتی
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    // مدیریت زمان و تایمر
    createTimer(duration, callback, onComplete = null) {
        let startTime = Date.now();
        let remaining = duration;
        let timerId = null;
        
        const pause = () => {
            clearTimeout(timerId);
            remaining -= Date.now() - startTime;
        };
        
        const resume = () => {
            startTime = Date.now();
            timerId = setTimeout(complete, remaining);
        };
        
        const complete = () => {
            if (onComplete) onComplete();
        };
        
        const stop = () => {
            clearTimeout(timerId);
        };
        
        resume();
        
        return { pause, resume, stop };
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // مدیریت localStorage با قابلیت انقضا
    setWithExpiry(key, value, ttl) {
        const item = {
            value: value,
            expiry: Date.now() + ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    getWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
        
        if (!itemStr) {
            return null;
        }
        
        const item = JSON.parse(itemStr);
        
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        
        return item.value;
    }

    // مدیریت صدا
    playSound(url, volume = 1.0, loop = false) {
        if (!this.config.audio.enabled || !this.config.audio.soundEffects) {
            return null;
        }
        
        const audio = this.getAsset(url);
        if (!audio) {
            console.warn(`Sound not found: ${url}`);
            return null;
        }
        
        audio.volume = volume * this.config.audio.volume;
        audio.loop = loop;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Audio play failed:', error);
            });
        }
        
        return audio;
    }

    stopSound(audio) {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // تشخیص دستگاه و قابلیت‌ها
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';
        
        // تشخیص مرورگر
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser = 'Safari';
            version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edg')) {
            browser = 'Edge';
            version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
        }
        
        return { browser, version, userAgent: ua };
    }

    // انیمیشن‌های پیشرفته
    animateValue(element, start, end, duration, easing = 'linear', onUpdate = null) {
        const startTime = performance.now();
        const change = end - start;
        
        const easingFunctions = {
            linear: t => t,
            easeIn: t => t * t,
            easeOut: t => t * (2 - t),
            easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        };
        
        const ease = easingFunctions[easing] || easingFunctions.linear;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = ease(progress);
            const currentValue = start + change * easedProgress;
            
            if (typeof element === 'function') {
                element(currentValue);
            } else if (typeof element === 'object' && element !== null) {
                element.textContent = Math.round(currentValue);
            }
            
            if (onUpdate) {
                onUpdate(currentValue);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // ایجاد افکت‌های بصری
    createRipple(x, y, color = 'rgba(255, 255, 255, 0.7)') {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${color};
            pointer-events: none;
            z-index: 1000;
            left: ${x - 10}px;
            top: ${y - 10}px;
            transform: scale(0);
        `;
        
        document.body.appendChild(ripple);
        
        const animation = ripple.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(4)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => {
            ripple.remove();
        };
    }

    // مدیریت کش (Cache)
    setCache(key, value, ttl = 5 * 60 * 1000) { // 5 minutes default
        this.cache.set(key, {
            value: value,
            expiry: Date.now() + ttl
        });
    }

    getCache(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    clearCache() {
        this.cache.clear();
    }

    // ابزارهای دیباگ و توسعه
    enableDebugMode() {
        window.debug = {
            utils: this,
            performance: this.getPerformanceReport(),
            config: this.config,
            assets: this.assets,
            clearStorage: () => {
                localStorage.clear();
                sessionStorage.clear();
                this.clearCache();
                console.log('Storage cleared');
            }
        };
        
        console.log('Debug mode enabled. Use window.debug to access utilities.');
    }

    // تابع کمکی برای ایجاد تاخیر
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // تولید شناسه منحصر به فرد
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// ایجاد نمونه از ابزارهای بازی
window.GameUtils = new GameUtils();

// صادر کردن توابع کمکی全局
window.utils = {
    // ریاضیات
    randomInt: (min, max) => window.GameUtils.randomInt(min, max),
    randomFloat: (min, max) => window.GameUtils.randomFloat(min, max),
    clamp: (value, min, max) => window.GameUtils.clamp(value, min, max),
    lerp: (start, end, factor) => window.GameUtils.lerp(start, end, factor),
    
    // زمان
    formatTime: (seconds) => window.GameUtils.formatTime(seconds),
    delay: (ms) => window.GameUtils.delay(ms),
    
    // تشخیص
    isMobile: () => window.GameUtils.isMobile(),
    isTouchDevice: () => window.GameUtils.isTouchDevice(),
    
    // انیمیشن
    animateValue: (element, start, end, duration, easing, onUpdate) => 
        window.GameUtils.animateValue(element, start, end, duration, easing, onUpdate),
    
    // افکت‌ها
    createRipple: (x, y, color) => window.GameUtils.createRipple(x, y, color),
    
    // صدا
    playSound: (url, volume, loop) => window.GameUtils.playSound(url, volume, loop),
    
    // تولید شناسه
    generateId: () => window.GameUtils.generateId()
};
