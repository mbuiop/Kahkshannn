// مدیریت اصلی بازی
class GameEngine {
    constructor() {
        this.gameRunning = false;
        this.currentLevel = 1;
        this.score = 0;
        this.coinsCollected = 0;
        this.totalCoinsNeeded = 15;
        this.player = {
            x: 0, y: 0, size: 80, rotation: 0, fuel: 100,
            element: null, speed: 8
        };
        
        this.init();
    }

    init() {
        this.setupGameElements();
    }

    setupGameElements() {
        this.gameScreen = document.getElementById('gameScreen');
        this.gameElements = document.getElementById('gameElements');
        this.fuelIndicator = document.querySelector('.fuel-indicator');
        this.bombButton = document.getElementById('bombButton');
        this.bombTimer = document.getElementById('bombTimer');
        this.safeTimeIndicator = document.getElementById('safeTimeIndicator');
    }

    start() {
        // پاکسازی بازی قبلی
        this.cleanup();
        
        // تنظیم حالت بازی
        this.gameRunning = true;
        this.currentLevel = parseInt(localStorage.getItem('highLevel')) || 1;
        this.totalCoinsNeeded = Math.min(20, 6 + this.currentLevel);
        
        // نمایش صفحه بازی
        gameManager.showScreen('gameScreen');
        
        // ایجاد عناصر بازی
        Universe.create();
        this.createPlayer();
        Coins.create(this.totalCoinsNeeded, this.currentLevel);
        
        // فعال کردن رابط کاربری
        UI.showGameUI();
        
        // فعال کردن کنترل‌ها
        Controls.setup();
        
        // نشانگر بازیکن
        UI.showPlayerIndicator();
        
        // شروع حلقه بازی
        this.gameLoop();
        
        console.log(`🎮 بازی شروع شد - مرحله ${this.currentLevel}`);
    }

    createPlayer() {
        this.player.element = document.createElement('div');
        this.player.element.className = 'player pulse';
        this.player.element.innerHTML = '🛸';
        
        // موقعیت اولیه بازیکن
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        
        this.updatePlayerPosition();
        this.gameElements.appendChild(this.player.element);
    }

    gameLoop() {
        if (!this.gameRunning) return;
        
        // به‌روزرسانی سیستم‌ها
        this.updateGameSystems();
        
        // بررسی برخوردها
        this.checkCollisions();
        
        // ادامه حلقه بازی
        requestAnimationFrame(() => this.gameLoop());
    }

    updateGameSystems() {
        // به‌روزرسانی موقعیت بازیکن
        this.updatePlayerPosition();
        
        // به‌روزرسانی کهکشان
        Universe.update(this.player.x, this.player.y);
        
        // به‌روزرسانی دوربین
        Camera.followPlayer(this.player.x, this.player.y);
        
        // به‌روزرسانی دشمنان
        Enemies.update(this.player.x, this.player.y);
        
        // به‌روزرسانی رابط کاربری
        UI.updateGameUI(this.player.fuel, Enemies.bombCooldown, Enemies.safeTime);
        
        // به‌روزرسانی مینی مپ
        UI.updateMiniMap(this.player, Enemies.list, Coins.list);
        
        // مصرف سوخت
        this.updateFuel();
    }

    updatePlayerPosition() {
        if (!this.player.element) return;
        
        this.player.element.style.left = (this.player.x - this.player.size/2) + 'px';
        this.player.element.style.top = (this.player.y - this.player.size/2) + 'px';
        
        // چرخش بازیکن بر اساس حرکت
        if (Controls.movement.dx !== 0 || Controls.movement.dy !== 0) {
            this.player.rotation = Math.atan2(Controls.movement.dy, Controls.movement.dx) * 180 / Math.PI;
            this.player.element.style.transform = `rotate(${this.player.rotation}deg)`;
        }
    }

    updateFuel() {
        // کاهش تدریجی سوخت
        this.player.fuel = Math.max(0, this.player.fuel - 0.008);
        
        // به‌روزرسانی نشانگر سوخت
        this.fuelIndicator.textContent = `⛽ سوخت: ${Math.round(this.player.fuel)}%`;
        
        // تغییر رنگ در سوخت کم
        if (this.player.fuel < 20) {
            this.fuelIndicator.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
        } else if (this.player.fuel < 50) {
            this.fuelIndicator.style.background = 'linear-gradient(45deg, #ffaa00, #ff5500)';
        }
        
        // پایان بازی در صورت اتمام سوخت
        if (this.player.fuel <= 0) {
            this.gameOver();
        }
    }

    checkCollisions() {
        // برخورد با سکه‌ها
        Coins.checkCollisions(this.player, (coin) => {
            this.coinCollected(coin);
        });
        
        // برخورد با دشمنان (فقط در زمان غیرامن)
        if (!Enemies.isSafeTime) {
            Enemies.checkCollisions(this.player, () => {
                this.restartLevel();
            });
        }
    }

    coinCollected(coin) {
        this.coinsCollected++;
        this.score += 10 * this.currentLevel;
        
        // افزایش سوخت
        this.player.fuel = Math.min(100, this.player.fuel + 8);
        
        // بررسی پایان مرحله
        if (this.coinsCollected >= this.totalCoinsNeeded) {
            this.completeLevel();
        }
    }

    completeLevel() {
        this.gameRunning = false;
        
        // ذخیره اطلاعات
        Storage.saveGameData(this.score, this.currentLevel, this.coinsCollected);
        
        // نمایش صفحه تکمیل مرحله
        UI.showLevelComplete(this.currentLevel);
    }

    restartLevel() {
        this.gameRunning = false;
        
        setTimeout(() => {
            this.coinsCollected = 0;
            this.player.fuel = 100;
            
            // بازنشانی سکه‌ها
            Coins.reset();
            
            // پاکسازی دشمنان
            Enemies.clear();
            
            // بازنشانی موقعیت بازیکن
            this.player.x = window.innerWidth / 2;
            this.player.y = window.innerHeight / 2;
            this.updatePlayerPosition();
            
            // ادامه بازی
            this.gameRunning = true;
            this.gameLoop();
        }, 1000);
    }

    gameOver() {
        this.gameRunning = false;
        
        // ذخیره اطلاعات
        Storage.saveGameData(this.score, this.currentLevel, this.coinsCollected);
        
        // بازگشت به صفحه اصلی
        setTimeout(() => {
            this.cleanup();
            gameManager.showScreen('mainScreen');
            UI.updateMainStats();
        }, 2000);
    }

    nextLevel() {
        this.currentLevel++;
        this.coinsCollected = 0;
        this.totalCoinsNeeded = Math.min(20, 6 + this.currentLevel);
        
        // پاکسازی و ایجاد مجدد
        Coins.create(this.totalCoinsNeeded, this.currentLevel);
        Enemies.clear();
        
        // ادامه بازی
        this.gameRunning = true;
        this.gameLoop();
    }

    useBomb() {
        Enemies.useBomb();
    }

    handleResize() {
        if (this.player.element) {
            this.updatePlayerPosition();
        }
    }

    cleanup() {
        // پاکسازی تمام عناصر بازی
        this.gameElements.innerHTML = '';
        Enemies.clear();
        Coins.clear();
        
        // مخفی کردن رابط کاربری بازی
        UI.hideGameUI();
    }
}

// ایجاد نمونه بازی
const Game = new GameEngine();
