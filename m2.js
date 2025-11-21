// m2.js - مدیریت و بهینه‌سازی بازی

class GamePerformanceManager {
    constructor() {
        this.frameRate = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.performanceStats = {
            frames: 0,
            averageFps: 0,
            minFps: 999,
            maxFps: 0
        };
        
        this.memoryManager = new MemoryManager();
        this.renderOptimizer = new RenderOptimizer();
    }
    
    // به‌روزرسانی آمار عملکرد
    update() {
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.frameRate = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.performanceStats.frames = this.frameCount;
            this.performanceStats.averageFps = this.frameRate;
            this.performanceStats.minFps = Math.min(this.performanceStats.minFps, this.frameRate);
            this.performanceStats.maxFps = Math.max(this.performanceStats.maxFps, this.frameRate);
            
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // بهینه‌سازی پویا بر اساس FPS
            this.dynamicOptimization();
        }
        
        this.lastFrameTime = now;
    }
    
    // بهینه‌سازی پویا بر اساس عملکرد
    dynamicOptimization() {
        if (this.frameRate < 45) {
            // کاهش کیفیت گرافیک وقتی FPS پایین است
            this.renderOptimizer.reduceQuality();
        } else if (this.frameRate > 55) {
            // افزایش کیفیت گرافیک وقتی FPS خوب است
            this.renderOptimizer.increaseQuality();
        }
        
        // پاکسازی حافظه اگر لازم باشد
        if (this.frameRate < 30) {
            this.memoryManager.forceCleanup();
        }
    }
    
    // گرفتن آمار عملکرد
    getStats() {
        return {
            ...this.performanceStats,
            memory: this.memoryManager.getStats(),
            render: this.renderOptimizer.getStats()
        };
    }
}

class MemoryManager {
    constructor() {
        this.objectPool = new Map();
        this.cleanupInterval = null;
        this.stats = {
            totalObjects: 0,
            pooledObjects: 0,
            memoryUsage: 0
        };
    }
    
    // شروع مدیریت حافظه
    start() {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5000); // پاکسازی هر 5 ثانیه
    }
    
    // توقف مدیریت حافظه
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    
    // پاکسازی اشیاء غیرضروری
    cleanup() {
        let removedCount = 0;
        
        // پاکسازی المان‌های DOM که استفاده نمی‌شوند
        document.querySelectorAll('.coin, .enemy, .coin-trail').forEach(el => {
            if (!el.isConnected || el.style.display === 'none') {
                el.remove();
                removedCount++;
            }
        });
        
        // پاکسازی اشیاء از object pool که قدیمی هستند
        const now = Date.now();
        for (const [key, obj] of this.objectPool) {
            if (now - obj.lastUsed > 30000) { // 30 ثانیه
                this.objectPool.delete(key);
                removedCount++;
            }
        }
        
        this.updateStats();
        return removedCount;
    }
    
    // پاکسازی اجباری
    forceCleanup() {
        let totalRemoved = 0;
        
        // پاکسازی تمام المان‌های غیرضروری
        document.querySelectorAll('.coin, .enemy, .coin-trail, .coin-number').forEach(el => {
            if (!el.isConnected) {
                el.remove();
                totalRemoved++;
            }
        });
        
        // پاکسازی object pool
        this.objectPool.clear();
        
        // فراخوانی garbage collector اگر در دسترس باشد
        if (window.gc) {
            window.gc();
        }
        
        this.updateStats();
        return totalRemoved;
    }
    
    // گرفتن شی از pool یا ایجاد جدید
    getObject(type, createFn) {
        if (this.objectPool.has(type)) {
            const obj = this.objectPool.get(type);
            obj.lastUsed = Date.now();
            return obj;
        }
        
        const newObj = createFn();
        newObj.lastUsed = Date.now();
        this.objectPool.set(type, newObj);
        return newObj;
    }
    
    // به‌روزرسانی آمار
    updateStats() {
        this.stats.totalObjects = document.querySelectorAll('*').length;
        this.stats.pooledObjects = this.objectPool.size;
        
        // تخمین استفاده از حافظه
        if (performance.memory) {
            this.stats.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
        }
    }
    
    // گرفتن آمار
    getStats() {
        this.updateStats();
        return this.stats;
    }
}

class RenderOptimizer {
    constructor() {
        this.qualityLevel = 'high'; // low, medium, high
        this.enabledFeatures = {
            particles: true,
            shadows: true,
            antiAliasing: true,
            postProcessing: true
        };
        
        this.stats = {
            drawCalls: 0,
            triangles: 0,
            textures: 0
        };
    }
    
    // کاهش کیفیت رندر
    reduceQuality() {
        if (this.qualityLevel === 'high') {
            this.qualityLevel = 'medium';
            this.enabledFeatures.shadows = false;
            this.enabledFeatures.antiAliasing = false;
        } else if (this.qualityLevel === 'medium') {
            this.qualityLevel = 'low';
            this.enabledFeatures.particles = false;
            this.enabledFeatures.postProcessing = false;
        }
        
        this.applyQualitySettings();
    }
    
    // افزایش کیفیت رندر
    increaseQuality() {
        if (this.qualityLevel === 'low') {
            this.qualityLevel = 'medium';
            this.enabledFeatures.particles = true;
        } else if (this.qualityLevel === 'medium') {
            this.qualityLevel = 'high';
            this.enabledFeatures.shadows = true;
            this.enabledFeatures.antiAliasing = true;
            this.enabledFeatures.postProcessing = true;
        }
        
        this.applyQualitySettings();
    }
    
    // اعمال تنظیمات کیفیت
    applyQualitySettings() {
        // اعمال تنظیمات بر اساس سطح کیفیت
        const root = document.documentElement;
        
        switch(this.qualityLevel) {
            case 'low':
                root.style.setProperty('--particle-density', '0.5');
                root.style.setProperty('--shadow-intensity', '0');
                break;
            case 'medium':
                root.style.setProperty('--particle-density', '0.8');
                root.style.setProperty('--shadow-intensity', '0.3');
                break;
            case 'high':
                root.style.setProperty('--particle-density', '1');
                root.style.setProperty('--shadow-intensity', '0.6');
                break;
        }
    }
    
    // بهینه‌سازی رندر المان‌ها
    optimizeElementRender(element) {
        if (this.qualityLevel === 'low') {
            // غیرفعال کردن انیمیشن‌های غیرضروری
            element.style.willChange = 'auto';
        } else {
            element.style.willChange = 'transform, opacity';
        }
    }
    
    // گرفتن آمار
    getStats() {
        return {
            qualityLevel: this.qualityLevel,
            enabledFeatures: this.enabledFeatures,
            ...this.stats
        };
    }
}

// سیستم مدیریت 100 میلیارد انیمیشن
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.animationId = 0;
        this.activeAnimations = 0;
        this.maxAnimations = 1000; // حداکثر انیمیشن همزمان
    }
    
    // ایجاد انیمیشن جدید
    createAnimation(target, properties, duration, easing = 'linear') {
        if (this.activeAnimations >= this.maxAnimations) {
            this.cleanupOldAnimations();
        }
        
        const id = this.animationId++;
        const startTime = performance.now();
        const startValues = {};
        
        // ذخیره مقادیر اولیه
        for (const prop in properties) {
            startValues[prop] = this.getCurrentValue(target, prop);
        }
        
        const animation = {
            id,
            target,
            properties,
            duration,
            easing,
            startTime,
            startValues,
            active: true
        };
        
        this.animations.set(id, animation);
        this.activeAnimations++;
        
        return id;
    }
    
    // به‌روزرسانی تمام انیمیشن‌ها
    update() {
        const now = performance.now();
        let completed = 0;
        
        for (const [id, animation] of this.animations) {
            if (!animation.active) continue;
            
            const elapsed = now - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            const easedProgress = this.applyEasing(progress, animation.easing);
            
            // اعمال مقادیر جدید
            for (const prop in animation.properties) {
                const startValue = animation.startValues[prop];
                const endValue = animation.properties[prop];
                const currentValue = this.interpolate(startValue, endValue, easedProgress);
                
                this.setValue(animation.target, prop, currentValue);
            }
            
            // بررسی پایان انیمیشن
            if (progress >= 1) {
                animation.active = false;
                completed++;
            }
        }
        
        // پاکسازی انیمیشن‌های تمام شده
        if (completed > 0) {
            this.cleanupCompletedAnimations();
        }
    }
    
    // اعمال تابع easing
    applyEasing(progress, easing) {
        switch(easing) {
            case 'easeIn':
                return progress * progress;
            case 'easeOut':
                return 1 - (1 - progress) * (1 - progress);
            case 'easeInOut':
                return progress < 0.5 ? 
                    2 * progress * progress : 
                    1 - Math.pow(-2 * progress + 2, 2) / 2;
            default:
                return progress;
        }
    }
    
    // درون‌یابی بین دو مقدار
    interpolate(start, end, progress) {
        if (typeof start === 'number' && typeof end === 'number') {
            return start + (end - start) * progress;
        }
        return end; // برای مقادیر غیرعددی
    }
    
    // گرفتن مقدار فعلی
    getCurrentValue(target, property) {
        if (target.style) {
            return parseFloat(target.style[property]) || 0;
        }
        return target[property] || 0;
    }
    
    // تنظیم مقدار جدید
    setValue(target, property, value) {
        if (target.style) {
            if (typeof value === 'number') {
                target.style[property] = value + 'px';
            } else {
                target.style[property] = value;
            }
        } else {
            target[property] = value;
        }
    }
    
    // پاکسازی انیمیشن‌های قدیمی
    cleanupOldAnimations() {
        let removed = 0;
        const now = Date.now();
        
        for (const [id, animation] of this.animations) {
            if (now - animation.startTime > 10000) { // قدیمی‌تر از 10 ثانیه
                this.animations.delete(id);
                removed++;
            }
        }
        
        this.activeAnimations -= removed;
        return removed;
    }
    
    // پاکسازی انیمیشن‌های تمام شده
    cleanupCompletedAnimations() {
        let removed = 0;
        
        for (const [id, animation] of this.animations) {
            if (!animation.active) {
                this.animations.delete(id);
                removed++;
            }
        }
        
        this.activeAnimations -= removed;
        return removed;
    }
    
    // توقف انیمیشن
    stopAnimation(id) {
        if (this.animations.has(id)) {
            this.animations.delete(id);
            this.activeAnimations--;
            return true;
        }
        return false;
    }
    
    // گرفتن آمار
    getStats() {
        return {
            totalAnimations: this.animations.size,
            activeAnimations: this.activeAnimations,
            maxAnimations: this.maxAnimations
        };
    }
}

// سیستم مدیریت کهکشان و پس‌زمینه
class GalaxyBackgroundSystem {
    constructor() {
        this.stars = [];
        this.nebulas = [];
        this.planets = [];
        this.init();
    }
    
    // مقداردهی اولیه کهکشان
    init() {
        this.createStars(2000);
        this.createNebulas(5);
        this.createPlanets(10);
    }
    
    // ایجاد ستاره‌ها
    createStars(count) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    // ایجاد سحابی‌ها
    createNebulas(count) {
        const colors = [
            'rgba(100, 50, 150, 0.1)',  // بنفش
            'rgba(50, 100, 200, 0.1)',  // آبی
            'rgba(200, 50, 100, 0.1)',  // قرمز
            'rgba(50, 200, 150, 0.1)',  // سبز
            'rgba(200, 150, 50, 0.1)'   // نارنجی
        ];
        
        for (let i = 0; i < count; i++) {
            this.nebulas.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                width: Math.random() * 800 + 400,
                height: Math.random() * 800 + 400,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360
            });
        }
    }
    
    // ایجاد سیارات
    createPlanets(count) {
        const planetTypes = ['🌍', '🪐', '🌕', '🔥', '💧'];
        
        for (let i = 0; i < count; i++) {
            this.planets.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                size: Math.random() * 60 + 40,
                type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 0.5 - 0.25
            });
        }
    }
    
    // رندر کهکشان
    render(context, cameraX, cameraY) {
        this.renderStars(context, cameraX, cameraY);
        this.renderNebulas(context, cameraX, cameraY);
        this.renderPlanets(context, cameraX, cameraY);
    }
    
    // رندر ستاره‌ها
    renderStars(context, cameraX, cameraY) {
        const time = performance.now() * 0.001;
        
        context.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            const screenX = star.x + cameraX;
            const screenY = star.y + cameraY;
            
            if (screenX >= -10 && screenX <= window.innerWidth + 10 && 
                screenY >= -10 && screenY <= window.innerHeight + 10) {
                
                const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
                const brightness = star.brightness * twinkle;
                
                context.globalAlpha = brightness;
                context.beginPath();
                context.arc(screenX, screenY, star.size, 0, Math.PI * 2);
                context.fill();
            }
        });
        
        context.globalAlpha = 1;
    }
    
    // رندر سحابی‌ها
    renderNebulas(context, cameraX, cameraY) {
        this.nebulas.forEach(nebula => {
            const screenX = nebula.x + cameraX;
            const screenY = nebula.y + cameraY;
            
            if (screenX >= -nebula.width && screenX <= window.innerWidth + nebula.width && 
                screenY >= -nebula.height && screenY <= window.innerHeight + nebula.height) {
                
                context.save();
                context.translate(screenX, screenY);
                context.rotate(nebula.rotation * Math.PI / 180);
                
                const gradient = context.createRadialGradient(0, 0, 0, 0, 0, nebula.width / 2);
                gradient.addColorStop(0, nebula.color);
                gradient.addColorStop(1, 'transparent');
                
                context.fillStyle = gradient;
                context.globalAlpha = 0.3;
                context.fillRect(-nebula.width / 2, -nebula.height / 2, nebula.width, nebula.height);
                
                context.restore();
            }
        });
        
        context.globalAlpha = 1;
    }
    
    // رندر سیارات
    renderPlanets(context, cameraX, cameraY) {
        const time = performance.now() * 0.001;
        
        this.planets.forEach(planet => {
            const screenX = planet.x + cameraX;
            const screenY = planet.y + cameraY;
            
            if (screenX >= -planet.size && screenX <= window.innerWidth + planet.size && 
                screenY >= -planet.size && screenY <= window.innerHeight + planet.size) {
                
                context.save();
                context.translate(screenX, screenY);
                context.rotate((planet.rotation + time * planet.rotationSpeed) * Math.PI / 180);
                
                context.font = `${planet.size}px Arial`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(planet.type, 0, 0);
                
                context.restore();
            }
        });
    }
}

// ایجاد نمونه‌های جهانی
const gamePerformanceManager = new GamePerformanceManager();
const memoryManager = new MemoryManager();
const animationManager = new AnimationManager();
const galaxyBackground = new GalaxyBackgroundSystem();

// شروع سیستم‌ها
memoryManager.start();

// صادر کردن برای استفاده در فایل اصلی
window.GamePerformanceManager = GamePerformanceManager;
window.MemoryManager = MemoryManager;
window.AnimationManager = AnimationManager;
window.GalaxyBackgroundSystem = GalaxyBackgroundSystem;
window.gamePerformanceManager = gamePerformanceManager;
window.memoryManager = memoryManager;
window.animationManager = animationManager;
window.galaxyBackground = galaxyBackground;
