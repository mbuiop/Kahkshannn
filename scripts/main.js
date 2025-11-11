// فایل اصلی - مدیریت کلی بازی

class GameManager {
    constructor() {
        this.isInitialized = false;
        this.currentScreen = 'main';
        this.gameState = 'menu';
        this.init();
    }

    init() {
        // بارگذاری داده‌های بازی
        storage.loadGameData();
        
        // راه‌اندازی سیستم صوتی
        audio.init();
        
        // راه‌اندازی رابط کاربری
        ui.init();
        
        // تنظیم رویدادها
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ بازی با موفقیت راه‌اندازی شد');
    }

    setupEventListeners() {
        // رویداد resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // رویداد visibility change (وقتی کاربر از تب خارج می‌شود)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // رویداد قبل از بسته شدن صفحه
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // رویدادهای کیبورد
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleResize() {
        if (this.gameState === 'playing') {
            // به‌روزرسانی موقعیت بازیکن
            if (game.playerElement) {
                game.updatePlayerPosition();
            }
            
            // به‌روزرسانی کنترل لمسی
            if (controls.isTouchEnabled) {
                controls.setupTouchControls();
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden && this.gameState === 'playing') {
            // اگر کاربر از تب خارج شد، بازی را متوقف کن
            game.togglePause();
        }
    }

    handleBeforeUnload(event) {
        if (this.gameState === 'playing') {
            // ذخیره بازی قبل از بسته شدن
            game.saveGame();
        }
    }

    handleKeyDown(event) {
        // کلید ESC برای مکث
        if (event.key === 'Escape' && this.gameState === 'playing') {
            game.togglePause();
            event.preventDefault();
        }
        
        // کلید Space برای بمب
        if (event.key === ' ' && this.gameState === 'playing' && game.bombAvailable) {
            game.useBomb();
            event.preventDefault();
        }
        
        // کلیدهای جهت‌دار برای حرکت (در حالت توسعه)
        if (this.gameState === 'playing' && !controls.isTouching) {
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                    game.player.y -= 15;
                    break;
                case 'ArrowDown':
                case 's':
                    game.player.y += 15;
                    break;
                case 'ArrowLeft':
                case 'a':
                    game.player.x -= 15;
                    break;
                case 'ArrowRight':
                case 'd':
                    game.player.x += 15;
                    break;
            }
            game.updatePlayerPosition();
        }
    }

    // تغییر صفحه
    changeScreen(screenName) {
        this.currentScreen = screenName;
        
        // مخفی کردن تمام صفحات
        const screens = ['mainScreen', 'gameScreen', 'levelComplete', 'pauseScreen'];
        screens.forEach(screen => {
            document.getElementById(screen)?.classList.add('hidden');
        });
        
        // نمایش صفحه مورد نظر
        switch(screenName) {
            case 'main':
                document.getElementById('mainScreen').classList.remove('hidden');
                this.gameState = 'menu';
                break;
                
            case 'game':
                document.getElementById('gameScreen').classList.remove('hidden');
                document.querySelector('.game-ui').classList.remove('hidden');
                document.querySelector('.game-controls').classList.remove('hidden');
                this.gameState = 'playing';
                break;
                
            case 'levelComplete':
                document.getElementById('levelComplete').classList.remove('hidden');
                this.gameState = 'completed';
                break;
                
            case 'pause':
                document.getElementById('pauseScreen').classList.remove('hidden');
                this.gameState = 'paused';
                break;
        }
    }

    // شروع بازی جدید
    startNewGame() {
        if (this.gameState === 'playing') return;
        
        // پخش صدای شروع بازی
        audio.playSound('start');
        
        // تغییر به صفحه بازی
        this.changeScreen('game');
        
        // راه‌اندازی بازی
        game.start();
    }

    // بازگشت به منوی اصلی
    returnToMenu() {
        if (this.gameState === 'playing') {
            game.stop();
        }
        
        this.changeScreen('main');
        audio.playSound('menu');
    }

    // ادامه بازی
    resumeGame() {
        if (this.gameState === 'paused') {
            this.changeScreen('game');
            game.resume();
        }
    }

    // راه‌اندازی بازی
    setupGame() {
        if (!this.isInitialized) {
            this.init();
        }
    }
}

// ایجاد نمونه از مدیریت بازی
const gameManager = new GameManager();

// راه‌اندازی زمانی که DOM بارگذاری شد
document.addEventListener('DOMContentLoaded', function() {
    gameManager.setupGame();
    
    // نمایش انیمیشن ورود
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// مدیریت خطاهای全局
window.addEventListener('error', function(event) {
    console.error('❌ خطا در بازی:', event.error);
    
    // نمایش پیغام خطا به کاربر
    if (gameManager.gameState === 'playing') {
        alert('خطایی در بازی رخ داده است. بازی مجدداً راه‌اندازی می‌شود.');
        gameManager.returnToMenu();
    }
});

// مدیریت Promiseهای رد شده
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Promise رد شده:', event.reason);
});

// صادر کردن برای استفاده global
window.gameManager = gameManager;
