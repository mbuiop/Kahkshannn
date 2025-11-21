// m2.js - سیستم دوربین و پشتیبانی
console.log('m2.js loaded - سیستم دوربین و پشتیبانی');

// سیستم مدیریت بازی
class GameManager {
    constructor() {
        this.gameState = 'menu';
        this.isInitialized = false;
    }
    
    init() {
        console.log('مدیریت بازی راه‌اندازی شد');
        this.isInitialized = true;
        
        // راه‌اندازی سیستم‌های مختلف
        this.setupEventListeners();
        this.setupErrorHandling();
    }
    
    setupEventListeners() {
        // مدیریت کلیک‌ها و تاچ‌ها
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('touchstart', this.handleTouch.bind(this));
        
        // مدیریت صفحه‌کلید
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    handleClick(e) {
        // مدیریت کلیک‌های عمومی
    }
    
    handleTouch(e) {
        // مدیریت تاچ‌های عمومی
    }
    
    handleKeyDown(e) {
        if (!gameRunning) return;
        
        const speed = 15;
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                player.y = Math.max(player.size/2, player.y - speed);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                player.y = Math.min(4000 - player.size/2, player.y + speed);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                player.x = Math.max(player.size/2, player.x - speed);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                player.x = Math.min(4000 - player.size/2, player.x + speed);
                break;
        }
        
        if (e.key === ' ') {
            useBomb();
        }
        
        updatePlayerPosition();
        updateCamera();
    }
    
    handleKeyUp(e) {
        // مدیریت رها کردن کلیدها
    }
    
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('خطا در بازی:', e.error);
            this.handleGameError(e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise رد شده:', e.reason);
        });
    }
    
    handleGameError(error) {
        // بازیابی از خطا
        try {
            if (gameRunning) {
                console.log('تلاش برای بازیابی از خطا...');
                // ذخیره وضعیت فعلی
                if (typeof saveGameData === 'function') {
                    saveGameData();
                }
            }
        } catch (e) {
            console.error('خطا در بازیابی:', e);
        }
    }
}

// سیستم بهینه‌سازی عملکرد
class PerformanceManager {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.performanceMode = 'high';
        this.isMonitoring = false;
    }
    
    startMonitoring() {
        this.isMonitoring = true;
        this.lastFpsUpdate = performance.now();
        this.updateFPS();
        
        console.log('مانیتورینگ عملکرد فعال شد');
    }
    
    updateFPS() {
        if (!this.isMonitoring) return;
        
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            this.adjustPerformance();
        }
        
        requestAnimationFrame(() => this.updateFPS());
    }
    
    adjustPerformance() {
        const oldMode = this.performanceMode;
        
        if (this.fps < 30) {
            this.performanceMode = 'low';
        } else if (this.fps < 45) {
            this.performanceMode = 'medium';
        } else {
            this.performanceMode = 'high';
        }
        
        if (oldMode !== this.performanceMode) {
            console.log(`حالت عملکرد تغییر کرد به: ${this.performanceMode} (FPS: ${this.fps})`);
            this.applyPerformanceSettings();
        }
    }
    
    applyPerformanceSettings() {
        switch(this.performanceMode) {
            case 'low':
                this.reduceParticles();
                this.simplifyEffects();
                break;
            case 'medium':
                this.moderateParticles();
                this.standardEffects();
                break;
            case 'high':
                this.fullParticles();
                this.enhancedEffects();
                break;
        }
    }
    
    reduceParticles() {
        // کاهش ذرات و افکت‌ها
        if (window.simple3D) {
            // تنظیمات برای عملکرد پایین
        }
    }
    
    moderateParticles() {
        // تنظیمات متوسط
    }
    
    fullParticles() {
        // تمام افکت‌ها فعال
    }
    
    simplifyEffects() {
        // ساده‌سازی افکت‌ها
    }
    
    standardEffects() {
        // افکت‌های استاندارد
    }
    
    enhancedEffects() {
        // افکت‌های پیشرفته
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
    }
}

// سیستم مدیریت حافظه
class MemoryManager {
    constructor() {
        this.cleanupInterval = null;
        this.objectPool = new Map();
    }
    
    startCleanup() {
        // پاک‌سازی هر 30 ثانیه
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 30000);
        
        console.log('مدیریت حافظه فعال شد');
    }
    
    cleanup() {
        let cleanedCount = 0;
        const now = Date.now();
        
        // پاک‌سازی المان‌های قدیمی
        for (const [key, item] of this.objectPool) {
            if (now - item.lastUsed > 60000) { // 1 دقیقه
                this.disposeObject(item.object);
                this.objectPool.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`حافظه پاک‌سازی شد: ${cleanedCount} المان حذف شد`);
        }
        
        // فراخوانی GC اگر در دسترس باشد
        if (window.gc) {
            window.gc();
        }
    }
    
    addToPool(key, object) {
        this.objectPool.set(key, {
            object: object,
            lastUsed: Date.now()
        });
    }
    
    getFromPool(key) {
        const item = this.objectPool.get(key);
        if (item) {
            item.lastUsed = Date.now();
            return item.object;
        }
        return null;
    }
    
    disposeObject(object) {
        if (object && typeof object.remove === 'function') {
            object.remove();
        } else if (object && object.parentNode) {
            object.parentNode.removeChild(object);
        }
    }
    
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

// سیستم دوربین پیشرفته
class CameraSystem {
    constructor() {
        this.isActive = false;
        this.currentMode = 'follow';
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
    }
    
    activate() {
        this.isActive = true;
        console.log('سیستم دوربین فعال شد');
    }
    
    update() {
        if (!this.isActive || !gameRunning) return;
        
        this.applyCameraShake();
        this.updateCameraSmoothness();
    }
    
    applyCameraShake() {
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            
            const cameraContainer = document.getElementById('cameraContainer');
            if (cameraContainer) {
                const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
                const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
                
                const currentTransform = cameraContainer.style.transform;
                const translateMatch = currentTransform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
                
                if (translateMatch) {
                    const baseX = parseFloat(translateMatch[1]);
                    const baseY = parseFloat(translateMatch[2]);
                    
                    cameraContainer.style.transform = `translate(${baseX + shakeX}px, ${baseY + shakeY}px)`;
                }
            }
            
            if (this.shakeDuration <= 0) {
                this.shakeIntensity = 0;
            }
        }
    }
    
    updateCameraSmoothness() {
        // تنظیم نرمی حرکت دوربین بر اساس سرعت بازیکن
        // این بخش می‌تواند برای تجربه بهتر کاربر تنظیم شود
    }
    
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
    
    setMode(mode) {
        this.currentMode = mode;
        console.log(`حالت دوربین تغییر کرد به: ${mode}`);
    }
    
    deactivate() {
        this.isActive = false;
    }
}

// سیستم فیزیک ساده
class PhysicsSystem {
    constructor() {
        this.gravity = 0;
        this.friction = 0.95;
    }
    
    applyMovement(object, deltaTime) {
        // اعمال حرکت و فیزیک پایه
        if (object.velocity) {
            object.x += object.velocity.x * deltaTime;
            object.y += object.velocity.y * deltaTime;
            
            // اعمال اصطکاک
            object.velocity.x *= this.friction;
            object.velocity.y *= this.friction;
            
            // توقف وقتی سرعت خیلی کم شود
            if (Math.abs(object.velocity.x) < 0.1) object.velocity.x = 0;
            if (Math.abs(object.velocity.y) < 0.1) object.velocity.y = 0;
        }
    }
    
    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (obj1.size || 20) + (obj2.size || 20);
        
        return distance < minDistance;
    }
    
    handleCollision(obj1, obj2) {
        // مدیریت برخورد پایه
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const overlap = ((obj1.size || 20) + (obj2.size || 20) - distance) / 2;
        
        // جدا کردن اجسام
        obj1.x += (dx / distance) * overlap;
        obj1.y += (dy / distance) * overlap;
        obj2.x -= (dx / distance) * overlap;
        obj2.y -= (dy / distance) * overlap;
    }
}

// سیستم صوتی پیشرفته
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.music = null;
        this.isMuted = false;
        this.volume = 0.7;
    }
    
    async loadSound(key, url) {
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            this.sounds.set(key, audio);
            console.log(`صدا بارگذاری شد: ${key}`);
        } catch (error) {
            console.error(`خطا در بارگذاری صدا ${key}:`, error);
        }
    }
    
    playSound(key, volume = 1.0) {
        if (this.isMuted || !this.sounds.has(key)) return;
        
        try {
            const sound = this.sounds.get(key).cloneNode();
            sound.volume = this.volume * volume;
            sound.play().catch(e => {
                console.log(`پخش صدا ${key} ناموفق بود:`, e);
            });
        } catch (error) {
            console.error(`خطا در پخش صدا ${key}:`, error);
        }
    }
    
    playMusic(url, volume = 0.5) {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
        
        this.music = new Audio(url);
        this.music.loop = true;
        this.music.volume = this.volume * volume;
        
        this.music.play().catch(e => {
            console.log('پخش موسیقی ناموفق بود:', e);
        });
    }
    
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            this.music.volume = this.volume * 0.5;
        }
    }
    
    mute() {
        this.isMuted = true;
        if (this.music) {
            this.music.volume = 0;
        }
    }
    
    unmute() {
        this.isMuted = false;
        if (this.music) {
            this.music.volume = this.volume * 0.5;
        }
    }
}

// سیستم ذخیره‌سازی
class SaveSystem {
    constructor() {
        this.saveKey = 'galacticGame_save';
    }
    
    saveGame(data) {
        try {
            const saveData = {
                ...data,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            console.log('بازی ذخیره شد');
            return true;
        } catch (error) {
            console.error('خطا در ذخیره بازی:', error);
            return false;
        }
    }
    
    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (saveData) {
                const data = JSON.parse(saveData);
                console.log('بازی بارگذاری شد');
                return data;
            }
        } catch (error) {
            console.error('خطا در بارگذاری بازی:', error);
        }
        return null;
    }
    
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('ذخیره بازی حذف شد');
        } catch (error) {
            console.error('خطا در حذف ذخیره بازی:', error);
        }
    }
    
    autoSave(data) {
        // ذخیره خودکار هر 30 ثانیه
        if (gameRunning && typeof data !== 'undefined') {
            this.saveGame(data);
        }
    }
}

// ایجاد نمونه‌های جهانی
window.gameManager = new GameManager();
window.performanceManager = new PerformanceManager();
window.memoryManager = new MemoryManager();
window.cameraSystem = new CameraSystem();
window.physicsSystem = new PhysicsSystem();
window.audioManager = new AudioManager();
window.saveSystem = new SaveSystem();

// راه‌اندازی سیستم‌ها
function initializeGameSystems() {
    console.log('راه‌اندازی سیستم‌های بازی...');
    
    // راه‌اندازی مدیریت بازی
    window.gameManager.init();
    
    // راه‌اندازی مدیریت عملکرد
    window.performanceManager.startMonitoring();
    
    // راه‌اندازی مدیریت حافظه
    window.memoryManager.startCleanup();
    
    // راه‌اندازی سیستم دوربین
    window.cameraSystem.activate();
    
    // راه‌اندازی سیستم صوتی
    window.audioManager.setVolume(0.7);
    
    console.log('تمام سیستم‌های بازی راه‌اندازی شدند');
}

// مدیریت خطاهای جهانی
window.addEventListener('error', (event) => {
    console.error('خطای جهانی:', event.error);
    
    // نمایش پیام خطا به کاربر
    try {
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            max-width: 80%;
        `;
        errorMessage.innerHTML = `
            <h3>خطا در بازی</h3>
            <p>متأسفانه خطایی رخ داده است. بازی تلاش می‌کند به حالت عادی بازگردد.</p>
            <button onclick="this.parentElement.remove()" style="
                background: white;
                color: red;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">باشه</button>
        `;
        document.body.appendChild(errorMessage);
    } catch (e) {
        console.error('خطا در نمایش پیام خطا:', e);
    }
});

// مدیریت هنگ بازی
let lastActivity = Date.now();
setInterval(() => {
    const now = Date.now();
    if (gameRunning && now - lastActivity > 5000) {
        console.warn('هشدار: ممکن است بازی هنگ کرده باشد');
        // اقدامات بازیابی
        if (typeof updateCamera === 'function') {
            updateCamera();
        }
    }
    lastActivity = now;
}, 1000);

// مدیریت تغییر اندازه پنجره
window.addEventListener('resize', () => {
    if (typeof setupGame === 'function') {
        setupGame();
    }
    if (typeof updateCamera === 'function') {
        updateCamera();
    }
});

// مدیریت visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // بازی در پس‌زمینه است
        console.log('بازی به پس‌زمینه رفت');
        if (gameRunning) {
            // ذخیره وضعیت فعلی
            if (typeof saveGameData === 'function') {
                saveGameData();
            }
        }
    } else {
        // بازی به پیش‌زمینه بازگشته
        console.log('بازی به پیش‌زمینه بازگشت');
    }
});

// مدیریت قبل از بسته شدن صفحه
window.addEventListener('beforeunload', (event) => {
    if (gameRunning) {
        // ذخیره نهایی
        if (typeof saveGameData === 'function') {
            saveGameData();
        }
        
        // نمایش هشدار
        event.preventDefault();
        event.returnValue = 'آیا مطمئن هستید که می‌خواهید صفحه را ترک کنید؟ پیشرفت بازی شما ذخیره خواهد شد.';
        return event.returnValue;
    }
});

// راه‌اندازی اولیه
window.addEventListener('load', () => {
    console.log('صفحه کاملاً بارگذاری شد');
    
    // تأخیر برای اطمینان از بارگذاری کامل
    setTimeout(() => {
        initializeGameSystems();
        
        // راه‌اندازی سیستم سه‌بعدی ساده
        if (window.simple3D) {
            window.simple3D.init();
        }
        
        console.log('بازی کاملاً آماده است!');
    }, 1000);
});

// تابع کمکی برای دیباگ
window.debugGame = function() {
    console.log('=== وضعیت بازی ===');
    console.log('بازی در حال اجرا:', gameRunning);
    console.log('موقعیت بازیکن:', player ? {x: player.x, y: player.y} : 'null');
    console.log('تعداد سکه‌ها:', coins ? coins.length : 'null');
    console.log('تعداد دشمنان:', enemies ? enemies.length : 'null');
    console.log('امتیاز:', score);
    console.log('سوخت:', player ? player.fuel : 'null');
    console.log('مرحله:', currentLevel);
    console.log('================');
};

// تابع برای ریستارت بازی
window.restartGame = function() {
    if (confirm('آیا مطمئن هستید که می‌خواهید بازی را از نو شروع کنید؟')) {
        if (gameRunning) {
            gameOver();
        }
        setTimeout(() => {
            startGame();
        }, 1000);
    }
};

console.log('m2.js بارگذاری کامل شد');
