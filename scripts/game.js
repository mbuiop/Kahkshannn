// فایل اصلی بازی - مدیریت لاگیک و وضعیت بازی

class GameEngine {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoopId = null;
        this.lastTimestamp = 0;
        
        // وضعیت بازی
        this.state = {
            score: 0,
            level: 1,
            coinsCollected: 0,
            totalCoinsNeeded: 15,
            fuel: 100,
            bombCooldown: 0,
            bombAvailable: true,
            safeTime: 0,
            isSafeTime: false
        };
        
        // المان‌های بازی
        this.player = {
            x: 0,
            y: 0,
            size: 80,
            rotation: 0,
            element: null
        };
        
        this.collections = {
            coins: [],
            enemies: [],
            particles: []
        };
        
        this.timers = {
            fuelConsumption: 0,
            enemySpawn: 0,
            gameTime: 0
        };
        
        this.init();
    }

    init() {
        console.log('🎮 موتور بازی راه‌اندازی شد');
        this.setupGameElements();
    }

    setupGameElements() {
        // ایجاد المان‌های DOM بازی
        this.createPlayerElement();
        this.setupEventListeners();
    }

    createPlayerElement() {
        if (this.player.element) {
            this.player.element.remove();
        }
        
        this.player.element = document.createElement('div');
        this.player.element.className = 'player pulse';
        this.player.element.innerHTML = '🛸';
        this.player.element.style.position = 'absolute';
        
        // موقعیت اولیه در مرکز صفحه
        this.player.x = window.innerWidth / 2;
        this.player.y = window.innerHeight / 2;
        
        this.updatePlayerPosition();
        document.getElementById('gameScreen').appendChild(this.player.element);
    }

    setupEventListeners() {
        // رویدادهای تاچ از controls.js
        // رویدادهای کیبورد از main.js
    }

    // شروع بازی
    start() {
        if (this.isRunning) return;
        
        console.log('🚀 شروع بازی جدید');
        
        this.resetGameState();
        this.isRunning = true;
        this.isPaused = false;
        
        // ایجاد جهان
        universe.create();
        
        // ایجاد سکه‌ها
        coins.create();
        
        // پخش موسیقی پس‌زمینه
        audio.playBackgroundMusic();
        
        // نمایش رابط کاربری
        ui.showGameUI();
        
        // شروع حلقه بازی
        this.startGameLoop();
        
        // نمایش راهنمای شروع
        this.showStartGuide();
    }

    resetGameState() {
        this.state = {
            score: 0,
            level: parseInt(localStorage.getItem('highLevel')) || 1,
            coinsCollected: 0,
            totalCoinsNeeded: Math.min(20, 6 + (parseInt(localStorage.getItem('highLevel')) || 1)),
            fuel: 100,
            bombCooldown: 0,
            bombAvailable: true,
            safeTime: 0,
            isSafeTime: false
        };
        
        this.timers = {
            fuelConsumption: 0,
            enemySpawn: 0,
            gameTime: 0
        };
        
        // پاک کردن المان‌های قبلی
        this.clearGameElements();
        
        // ایجاد المان‌های جدید
        this.createPlayerElement();
        
        // به‌روزرسانی رابط کاربری
        this.updateUI();
    }

    clearGameElements() {
        // پاک کردن سکه‌ها
        this.collections.coins.forEach(coin => {
            coin.element?.remove();
            coin.numberElement?.remove();
        });
        this.collections.coins = [];
        
        // پاک کردن دشمنان
        this.collections.enemies.forEach(enemy => {
            enemy.element?.remove();
        });
        this.collections.enemies = [];
        
        // پاک کردن ذرات
        this.collections.particles.forEach(particle => {
            particle.element?.remove();
        });
        this.collections.particles = [];
    }

    // حلقه اصلی بازی
    startGameLoop() {
        this.lastTimestamp = performance.now();
        this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // به‌روزرسانی سیستم‌های بازی
        this.updateGameSystems(deltaTime);
        
        // بررسی برخوردها
        this.checkCollisions();
        
        // ادامه حلقه بازی
        this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    updateGameSystems(deltaTime) {
        // به‌روزرسانی موقعیت کهکشان
        universe.updateBackground(this.player.x, this.player.y);
        
        // به‌روزرسانی مینی مپ
        ui.updateMiniMap(this.player, this.collections.enemies, this.collections.coins);
        
        // به‌روزرسانی تایمر بمب
        this.updateBombTimer();
        
        // به‌روزرسانی زمان امن
        this.updateSafeTime();
        
        // به‌روزرسانی سوخت
        this.updateFuelConsumption();
        
        // به‌روزرسانی تولید دشمن
        this.updateEnemySpawning();
        
        // به‌روزرسانی دشمنان
        if (!this.state.isSafeTime) {
            this.updateEnemies();
        }
        
        // به‌روزرسانی ذرات
        this.updateParticles();
        
        // به‌روزرسانی رابط کاربری
        this.updateUI();
    }

    updateBombTimer() {
        if (this.state.bombCooldown > 0) {
            this.state.bombCooldown--;
            
            if (this.state.bombCooldown <= 0) {
                this.state.bombAvailable = true;
                audio.playSound('bombReady');
            }
        }
    }

    updateSafeTime() {
        if (this.state.isSafeTime && this.state.safeTime > 0) {
            this.state.safeTime--;
            
            if (this.state.safeTime <= 0) {
                this.state.isSafeTime = false;
                audio.playSound('safeTimeEnd');
            }
        }
    }

    updateFuelConsumption() {
        this.timers.fuelConsumption++;
        
        if (this.timers.fuelConsumption >= 60) { // هر ثانیه
            this.timers.fuelConsumption = 0;
            this.state.fuel = Math.max(0, this.state.fuel - 0.5);
            
            if (this.state.fuel <= 0) {
                this.gameOver();
            }
        }
    }

    updateEnemySpawning() {
        this.timers.enemySpawn++;
        
        const spawnInterval = Math.max(60, 200 - this.state.level * 3);
        
        if (this.timers.enemySpawn >= spawnInterval) {
            this.timers.enemySpawn = 0;
            enemies.spawnGroup(this.player, this.state.level);
        }
    }

    updateEnemies() {
        this.collections.enemies.forEach((enemy, index) => {
            // به‌روزرسانی AI دشمن
            enemies.updateBehavior(enemy, this.player);
            
            // به‌روزرسانی موقعیت
            enemies.updatePosition(enemy);
            
            // حذف دشمنان خارج از صفحه
            if (this.isEnemyOutOfBounds(enemy)) {
                enemy.element.remove();
                this.collections.enemies.splice(index, 1);
            }
        });
    }

    updateParticles() {
        this.collections.particles.forEach((particle, index) => {
            particle.lifetime--;
            
            if (particle.lifetime <= 0) {
                particle.element.remove();
                this.collections.particles.splice(index, 1);
            } else {
                // به‌روزرسانی موقعیت ذره
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
                particle.element.style.opacity = particle.lifetime / particle.maxLifetime;
            }
        });
    }

    isEnemyOutOfBounds(enemy) {
        const margin = 200;
        return enemy.x < -margin || enemy.x > window.innerWidth + margin ||
               enemy.y < -margin || enemy.y > window.innerHeight + margin;
    }

    checkCollisions() {
        // برخورد با سکه‌ها
        this.checkCoinCollisions();
        
        // برخورد با دشمنان
        if (!this.state.isSafeTime) {
            this.checkEnemyCollisions();
        }
    }

    checkCoinCollisions() {
        this.collections.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.player.x - coin.x, 2) + 
                    Math.pow(this.player.y - coin.y, 2)
                );
                
                if (distance < this.player.size / 2 + 20) {
                    this.handleCoinCollision(coin, index);
                }
            }
        });
    }

    handleCoinCollision(coin, index) {
        coin.currentHits++;
        coin.numberElement.textContent = coin.hitsNeeded - coin.currentHits;
        
        // ایجاد افکت برخورد
        this.createHitEffect(coin.x, coin.y);
        
        if (coin.currentHits >= coin.hitsNeeded) {
            this.collectCoin(coin, index);
        }
    }

    collectCoin(coin, index) {
        coin.collected = true;
        this.state.coinsCollected++;
        this.state.score += 10 * this.state.level;
        
        // افزایش سوخت
        this.state.fuel = Math.min(100, this.state.fuel + 8);
        
        // پخش صدا
        audio.playSound('coinCollect');
        
        // ایجاد افکت جمع‌آوری
        this.createCollectEffect(coin.x, coin.y);
        
        // مخفی کردن سکه
        coin.element.style.display = 'none';
        coin.numberElement.style.display = 'none';
        
        // بررسی پایان مرحله
        if (this.state.coinsCollected >= this.state.totalCoinsNeeded) {
            this.completeLevel();
        }
    }

    checkEnemyCollisions() {
        this.collections.enemies.forEach((enemy, index) => {
            const distance = Math.sqrt(
                Math.pow(this.player.x - enemy.x, 2) + 
                Math.pow(this.player.y - enemy.y, 2)
            );
            
            if (distance < 50) {
                this.handleEnemyCollision();
                return;
            }
        });
    }

    handleEnemyCollision() {
        // ایجاد افکت انفجار
        this.createExplosionEffect(this.player.x, this.player.y);
        
        // پخش صدا
        audio.playSound('playerHit');
        
        // شروع مجدد مرحله
        this.restartLevel();
    }

    // استفاده از بمب
    useBomb() {
        if (!this.state.bombAvailable || !this.isRunning) return;
        
        console.log('💣 استفاده از بمب');
        
        this.state.bombAvailable = false;
        this.state.bombCooldown = 10 * 60; // 10 ثانیه
        
        this.state.isSafeTime = true;
        this.state.safeTime = 5 * 60; // 5 ثانیه
        
        // ایجاد افکت انفجار بمب
        this.createBombExplosion(this.player.x, this.player.y);
        
        // نابودی تمام دشمنان
        this.destroyAllEnemies();
        
        // پخش صدا
        audio.playSound('bombExplosion');
    }

    destroyAllEnemies() {
        this.collections.enemies.forEach(enemy => {
            // ایجاد افکت انفجار برای هر دشمن
            this.createEnemyExplosion(enemy.x, enemy.y);
            enemy.element.remove();
        });
        
        this.collections.enemies = [];
    }

    // ایجاد افکت‌ها
    createHitEffect(x, y) {
        this.createParticle(x, y, '✨', '#00ff88', 30);
    }

    createCollectEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createParticle(x, y, '⭐', '#ffd700', 60);
            }, i * 100);
        }
    }

    createExplosionEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.createParticle(
                x + (Math.random() - 0.5) * 50,
                y + (Math.random() - 0.5) * 50,
                '💥',
                '#ff4444',
                45
            );
        }
    }

    createBombExplosion(x, y) {
        // انفجار اصلی
        for (let i = 0; i < 12; i++) {
            this.createParticle(
                x + (Math.random() - 0.5) * 100,
                y + (Math.random() - 0.5) * 100,
                '💥',
                '#ff4444',
                60
            );
        }
        
        // حلقه انفجار
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const distance = 80;
            setTimeout(() => {
                this.createParticle(
                    x + Math.cos(angle) * distance,
                    y + Math.sin(angle) * distance,
                    '🔥',
                    '#ff6b00',
                    45
                );
            }, i * 50);
        }
    }

    createEnemyExplosion(x, y) {
        for (let i = 0; i < 6; i++) {
            this.createParticle(
                x + (Math.random() - 0.5) * 40,
                y + (Math.random() - 0.5) * 40,
                '🌋',
                '#ff3300',
                40
            );
        }
    }

    createParticle(x, y, emoji, color, lifetime) {
        const particle = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            lifetime: lifetime,
            maxLifetime: lifetime,
            element: document.createElement('div')
        };
        
        particle.element.innerHTML = emoji;
        particle.element.style.position = 'absolute';
        particle.element.style.left = x + 'px';
        particle.element.style.top = y + 'px';
        particle.element.style.fontSize = '20px';
        particle.element.style.zIndex = '6';
        particle.element.style.pointerEvents = 'none';
        particle.element.style.filter = `drop-shadow(0 0 5px ${color})`;
        particle.element.style.transition = 'all 0.3s ease';
        
        document.getElementById('gameScreen').appendChild(particle.element);
        this.collections.particles.push(particle);
    }

    // مدیریت موقعیت بازیکن
    updatePlayerPosition() {
        if (!this.player.element) return;
        
        this.player.element.style.left = (this.player.x - this.player.size / 2) + 'px';
        this.player.element.style.top = (this.player.y - this.player.size / 2) + 'px';
        
        // به‌روزرسانی چرخش بر اساس حرکت
        this.updatePlayerRotation();
    }

    updatePlayerRotation() {
        if (this.collections.playerPath && this.collections.playerPath.length > 1) {
            const currentPos = this.collections.playerPath[this.collections.playerPath.length - 1];
            const prevPos = this.collections.playerPath[this.collections.playerPath.length - 2];
            const dx = currentPos.x - prevPos.x;
            const dy = currentPos.y - prevPos.y;
            this.player.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
            this.player.element.style.transform = `rotate(${this.player.rotation}deg)`;
        }
    }

    // مدیریت مراحل
    completeLevel() {
        console.log('🎉 تکمیل مرحله', this.state.level);
        
        this.isRunning = false;
        
        // ذخیره اطلاعات
        this.saveGame();
        
        // پخش صدا
        audio.playSound('levelComplete');
        
        // نمایش صفحه تکمیل مرحله
        ui.showLevelComplete(this.state);
    }

    restartLevel() {
        console.log('🔄 شروع مجدد مرحله');
        
        this.isRunning = false;
        
        setTimeout(() => {
            this.state.coinsCollected = 0;
            this.state.fuel = 100;
            
            // بازنشانی سکه‌ها
            this.collections.coins.forEach(coin => {
                coin.element.style.display = 'block';
                coin.numberElement.style.display = 'block';
                coin.collected = false;
                coin.currentHits = 0;
                coin.numberElement.textContent = coin.hitsNeeded;
            });
            
            // پاک کردن دشمنان
            this.destroyAllEnemies();
            
            // بازنشانی موقعیت بازیکن
            this.player.x = window.innerWidth / 2;
            this.player.y = window.innerHeight / 2;
            this.updatePlayerPosition();
            
            // به‌روزرسانی رابط کاربری
            this.updateUI();
            
            // ادامه بازی
            this.isRunning = true;
            this.startGameLoop();
        }, 1000);
    }

    nextLevel() {
        this.state.level++;
        this.state.coinsCollected = 0;
        this.state.totalCoinsNeeded = Math.min(20, 6 + this.state.level);
        this.state.fuel = 100;
        
        // پاک کردن المان‌های قبلی
        this.clearGameElements();
        
        // ایجاد سکه‌های جدید
        coins.create();
        
        // ادامه بازی
        this.isRunning = true;
        this.startGameLoop();
    }

    gameOver() {
        console.log('💀 پایان بازی');
        
        this.isRunning = false;
        
        // ذخیره اطلاعات
        this.saveGame();
        
        // پخش صدا
        audio.playSound('gameOver');
        
        // نمایش پیغام
        setTimeout(() => {
            alert('سوخت شما تمام شد! بازی به پایان رسید.');
            gameManager.returnToMenu();
        }, 1000);
    }

    // مدیریت مکث
    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pause();
        } else {
            this.resume();
        }
    }

    pause() {
        console.log('⏸️ بازی متوقف شد');
        cancelAnimationFrame(this.gameLoopId);
        ui.showPauseScreen();
        audio.pauseBackgroundMusic();
    }

    resume() {
        console.log('▶️ بازی ادامه یافت');
        this.lastTimestamp = performance.now();
        this.startGameLoop();
        ui.hidePauseScreen();
        audio.resumeBackgroundMusic();
    }

    stop() {
        console.log('🛑 توقف بازی');
        this.isRunning = false;
        this.isPaused = false;
        cancelAnimationFrame(this.gameLoopId);
        audio.stopBackgroundMusic();
        this.clearGameElements();
    }

    // ذخیره‌سازی
    saveGame() {
        storage.saveGameData(this.state);
    }

    // به‌روزرسانی رابط کاربری
    updateUI() {
        ui.updateGameUI(this.state);
    }

    // راهنمای شروع
    showStartGuide() {
        setTimeout(() => {
            ui.showMessage('🛸 به کهکشان خوش آمدید!', 'شما خلبان این سفینه هستید. مراقب آتشفشان‌های فضایی باشید!');
        }, 500);
    }
}

// ایجاد نمونه از موتور بازی
const game = new GameEngine();

// صادر کردن برای استفاده global
window.game = game;
