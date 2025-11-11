// فایل اصلی - مدیریت کلی بازی
class GameManager {
    constructor() {
        this.currentScreen = 'mainScreen';
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.init();
    }

    init() {
        // بارگذاری داده‌های ذخیره شده
        Storage.loadGameData();
        
        // تنظیم رویدادها
        this.setupEventListeners();
        
        // نمایش صفحه اصلی
        this.showScreen('mainScreen');
        
        console.log('🎮 بازی کهکشان بی‌نهایت آماده است!');
    }

    setupEventListeners() {
        // رویداد تغییر سایز پنجره
        window.addEventListener('resize', () => {
            if (this.gameState === 'playing') {
                Game.handleResize();
                Controls.handleResize();
            }
        });

        // رویداد کلیک مرحله بعد
        document.getElementById('nextLevelButton').addEventListener('click', () => {
            Game.nextLevel();
        });

        // پیشگیری از اسکرول لمسی
        document.addEventListener('touchmove', (e) => {
            if (this.gameState === 'playing') {
                e.preventDefault();
            }
        }, { passive: false });
    }

    showScreen(screenName) {
        // مخفی کردن تمام صفحات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // نمایش صفحه مورد نظر
        document.getElementById(screenName).classList.add('active');
        this.currentScreen = screenName;
    }

    showLoading(callback) {
        this.showScreen('loadingScreen');
        
        setTimeout(() => {
            callback();
        }, 1500);
    }
}

// ایجاد نمونه اصلی بازی
const gameManager = new GameManager();

// شروع بازی
function startGame() {
    gameManager.showLoading(() => {
        Game.start();
    });
}
