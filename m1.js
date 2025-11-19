// m5.js - موتور بازی اصلی
class GameEngine {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.isRunning = false;
        this.systems = {};
        this.lastTime = 0;
        this.currentLevel = 1;
        this.enemiesSpawned = 0;
        this.maxEnemies = 10;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error(`❌ کانتینر با شناسه ${this.containerId} یافت نشد`);
            return;
        }
        
        try {
            // راه‌اندازی سیستم‌ها
            this.setupSystems();
            console.log("✅ موتور بازی راه‌اندازی شد");
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی موتور بازی:", error);
        }
    }
    
    setupSystems() {
        // راه‌اندازی سیستم گرافیک
        this.systems.graphics = new GraphicsSystem(this.containerId);
        
        // راه‌اندازی سیستم دوربین
        this.systems.camera = new CinematicCamera(
            this.systems.graphics.getCamera(),
            this.systems.graphics.getRenderer()
        );
        
        // راه‌اندازی سیستم مدیریت موجودیت‌ها
        this.systems.entity = new EntityManager(
            this.systems.graphics.getScene()
        );
        
        // راه‌اندازی سیستم جنگنده
        this.systems.fighter = new FighterSystem(
            this.systems.graphics.getScene(),
            this.systems.graphics.getCamera()
        );
        
        // راه‌اندازی سیستم امتیازدهی
        this.systems.score = new ScoreSystem();
        
        // راه‌اندازی سیستم ورودی
        this.systems.input = new InputSystem();
        
        // تنظیم هدف دوربین
        const player = this.systems.fighter.getPlayer();
        if (player) {
            this.systems.camera.setTarget(player);
        }
        
        // ذخیره ارجاع‌های جهانی
        window.gameEngine = this;
        window.gameGraphics = this.systems.graphics;
        window.gameCamera = this.systems.camera;
        window.gameFighter = this.systems.fighter;
        window.scoreSystem = this.systems.score;
        window.currentLevel = this.currentLevel;
        window.EntityManager = this.systems.entity;
        
        console.log("🎮 تمام سیستم‌ها راه‌اندازی شدند");
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        
        // شروع سطح اول
        this.startLevel(1);
        
        // شروع حلقه بازی
        this.gameLoop();
        
        console.log("🚀 بازی شروع شد");
    }
    
    startLevel(levelId) {
        this.currentLevel = levelId;
        this.enemiesSpawned = 0;
        this.maxEnemies = 8 + levelId * 2;
        
        console.log(`🎯 شروع سطح ${levelId} - دشمنان: ${this.maxEnemies}`);
        
        // ایجاد دشمنان اولیه
        this.spawnInitialEnemies();
        
        // شروع اسپاون دشمنان
        this.startEnemySpawning();
    }
    
    spawnInitialEnemies() {
        const initialEnemies = Math.min(3 + this.currentLevel, 5);
        
        for (let i = 0; i < initialEnemies; i++) {
            this.spawnEnemy();
        }
    }
    
    startEnemySpawning() {
        // اسپاون دوره‌ای دشمنان
        this.spawnInterval = setInterval(() => {
            if (this.enemiesSpawned < this.maxEnemies && this.isRunning) {
                this.spawnEnemy();
            }
        }, 2000 - this.currentLevel * 100); // با افزایش سطح، اسپاون سریع‌تر می‌شود
    }
    
    spawnEnemy() {
        if (this.enemiesSpawned >= this.maxEnemies) return;
        
        const enemyTypes = ['scout', 'fighter'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        // موقعیت تصادفی در اطراف بازیکن
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        const height = (Math.random() - 0.5) * 20;
        
        const position = new THREE.Vector3(
            Math.cos(angle) * distance,
            height,
            -30 - Math.random() * 20
        );
        
        // ایجاد دشمن
        this.systems.entity.createEnemy(type, position, this.currentLevel);
        this.enemiesSpawned++;
        
        console.log(`🎯 دشمن ${type} ایجاد شد (${this.enemiesSpawned}/${this.maxEnemies})`);
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;
        
        try {
            // به‌روزرسانی سیستم‌ها
            this.updateSystems(deltaTime);
            
            // بررسی برخوردها
            this.checkCollisions();
            
            // بررسی پایان سطح
            this.checkLevelComplete();
            
        } catch (error) {
            console.error("❌ خطا در حلقه بازی:", error);
        }
        
        // ادامه حلقه بازی
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateSystems(deltaTime) {
        // به‌روزرسانی سیستم دوربین
        if (this.systems.camera) {
            this.systems.camera.update(deltaTime);
        }
        
        // به‌روزرسانی سیستم جنگنده
        if (this.systems.fighter) {
            this.systems.fighter.update(deltaTime);
            
            // حرکت بازیکن بر اساس ورودی
            const direction = this.systems.input.getMovementDirection();
            this.systems.fighter.movePlayer(direction, deltaTime);
            
            // شلیک اگر دکمه فشرده است
            if (this.systems.input.firing) {
                this.systems.fighter.fireWeapon();
            }
        }
        
        // به‌روزرسانی سیستم موجودیت‌ها
        if (this.systems.entity) {
            this.systems.entity.update(deltaTime);
        }
        
        // به‌روزرسانی سیستم امتیازدهی
        if (this.systems.score) {
            this.systems.score.update(deltaTime);
        }
    }
    
    checkCollisions() {
        // بررسی برخورد پرتابه‌های بازیکن با دشمنان
        const playerProjectiles = this.systems.fighter.getProjectiles();
        const enemies = this.systems.entity.getEnemies();
        
        for (const projectile of playerProjectiles) {
            for (const enemy of enemies) {
                if (this.checkCollision(projectile, enemy.mesh)) {
                    this.onProjectileHit(projectile, enemy);
                }
            }
        }
        
        // بررسی برخورد پرتابه‌های دشمن با بازیکن
        const enemyProjectiles = this.systems.entity.getProjectiles();
        const player = this.systems.fighter.getPlayer();
        
        for (const projectile of enemyProjectiles) {
            if (this.checkCollision(projectile.mesh, player)) {
                this.onPlayerHit(projectile);
            }
        }
        
        // بررسی برخورد بازیکن با دشمنان
        for (const enemy of enemies) {
            if (this.checkCollision(player, enemy.mesh)) {
                this.systems.fighter.damagePlayer(5);
            }
        }
        
        // بررسی برخورد با power-up‌ها
        const powerUps = this.systems.entity.getPowerUps();
        for (const powerUp of powerUps) {
            if (this.checkCollision(player, powerUp.mesh)) {
                this.onPowerUpCollect(powerUp);
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        if (!obj1 || !obj2) return false;
        
        try {
            const box1 = new THREE.Box3().setFromObject(obj1);
            const box2 = new THREE.Box3().setFromObject(obj2);
            
            return box1.intersectsBox(box2);
        } catch (error) {
            return false;
        }
    }
    
    onProjectileHit(projectile, enemy) {
        // آسیب به دشمن
        const userData = projectile.userData;
        if (!userData) return;
        
        enemy.health -= userData.damage;
        
        // افکت برخورد
        if (window.gameGraphics) {
            window.gameGraphics.createHitEffect(
                enemy.position.clone(),
                new THREE.Color(1, 1, 0),
                10
            );
        }
        
        // افزایش امتیاز
        this.systems.score.addScore(10);
        
        // بررسی مرگ دشمن
        if (enemy.health <= 0) {
            this.onEnemyDestroyed(enemy);
        }
        
        // حذف پرتابه
        projectile.userData.life = 0;
    }
    
    onPlayerHit(projectile) {
        // آسیب به بازیکن
        this.systems.fighter.damagePlayer(projectile.damage);
        
        // حذف پرتابه
        projectile.dead = true;
    }
    
    onEnemyDestroyed(enemy) {
        // نابودی دشمن
        enemy.dead = true;
        
        // ایجاد افکت انفجار
        if (window.gameGraphics) {
            window.gameGraphics.createExplosionEffect(
                enemy.position.clone(),
                new THREE.Color(1, 0.5, 0),
                30
            );
        }
        
        // افزایش امتیاز
        this.systems.score.addScore(100);
        
        // احتمال افتادن power-up
        if (Math.random() < 0.3) {
            this.spawnPowerUp(enemy.position);
        }
        
        console.log(`💥 دشمن نابود شد - امتیاز: ${this.systems.score.getCurrentScore()}`);
    }
    
    spawnPowerUp(position) {
        const powerUpTypes = ['health', 'energy', 'weapon'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        this.systems.entity.createPowerUp(type, position.clone());
        console.log(`🎁 Power-up ${type} ایجاد شد`);
    }
    
    onPowerUpCollect(powerUp) {
        powerUp.collected = true;
        powerUp.dead = true;
        
        switch(powerUp.type) {
            case 'health':
                this.systems.fighter.healPlayer(25);
                break;
            case 'energy':
                this.systems.fighter.rechargeEnergy(30);
                break;
            case 'weapon':
                this.systems.fighter.switchWeapon(1);
                break;
        }
        
        console.log(`🎁 Power-up ${powerUp.type} جمع‌آوری شد`);
    }
    
    checkLevelComplete() {
        const enemies = this.systems.entity.getEnemies();
        const allEnemiesSpawned = this.enemiesSpawned >= this.maxEnemies;
        const allEnemiesDestroyed = enemies.length === 0;
        
        if (allEnemiesSpawned && allEnemiesDestroyed) {
            this.completeLevel();
        }
    }
    
    completeLevel() {
        this.isRunning = false;
        clearInterval(this.spawnInterval);
        
        console.log(`🎉 سطح ${this.currentLevel} تکمیل شد!`);
        
        // نمایش صفحه تکمیل سطح
        if (window.GameUI) {
            window.GameUI.showLevelComplete(this.currentLevel);
        }
    }
    
    nextLevel() {
        this.currentLevel++;
        window.currentLevel = this.currentLevel;
        
        console.log(`🚀 رفتن به سطح ${this.currentLevel}`);
        
        // پاک‌سازی موجودیت‌ها
        this.systems.entity.clearAll();
        this.systems.fighter.projectiles = [];
        
        // شروع سطح جدید
        this.startLevel(this.currentLevel);
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    onResize() {
        if (this.systems.graphics) {
            this.systems.graphics.onResize();
        }
    }
    
    destroy() {
        this.isRunning = false;
        clearInterval(this.spawnInterval);
        
        // پاک‌سازی سیستم‌ها
        if (this.systems.graphics) {
            this.systems.graphics.dispose();
        }
        
        // پاک‌سازی ارجاع‌های جهانی
        delete window.gameEngine;
        delete window.gameGraphics;
        delete window.gameCamera;
        delete window.gameFighter;
        delete window.scoreSystem;
        delete window.currentLevel;
        delete window.EntityManager;
        
        console.log("🛑 بازی متوقف شد");
    }
}

// سیستم امتیازدهی
class ScoreSystem {
    constructor() {
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.multiplier = 1;
        this.combo = 0;
        this.comboTimer = 0;
        
        this.init();
    }
    
    init() {
        console.log("✅ سیستم امتیازدهی راه‌اندازی شد");
    }
    
    addScore(points) {
        const actualPoints = Math.floor(points * this.multiplier);
        this.currentScore += actualPoints;
        this.combo++;
        this.comboTimer = 3.0;
        
        this.updateMultiplier();
        
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        return actualPoints;
    }
    
    updateMultiplier() {
        if (this.combo >= 15) {
            this.multiplier = 3;
        } else if (this.combo >= 10) {
            this.multiplier = 2.5;
        } else if (this.combo >= 5) {
            this.multiplier = 2;
        } else {
            this.multiplier = 1;
        }
    }
    
    update(deltaTime) {
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            
            if (this.comboTimer <= 0) {
                this.combo = 0;
                this.multiplier = 1;
            }
        }
    }
    
    getCurrentScore() {
        return this.currentScore;
    }
    
    getHighScore() {
        return this.highScore;
    }
    
    loadHighScore() {
        try {
            const saved = localStorage.getItem('galacticWarsHighScore');
            return saved ? parseInt(saved) : 0;
        } catch {
            return 0;
        }
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('galacticWarsHighScore', this.highScore.toString());
        } catch (error) {
            console.error("❌ خطا در ذخیره امتیاز:", error);
        }
    }
    
    reset() {
        this.currentScore = 0;
        this.multiplier = 1;
        this.combo = 0;
        this.comboTimer = 0;
    }
}

// سیستم ورودی
class InputSystem {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.joystick = { active: false, x: 0, y: 0 };
        this.firing = false;
        
        this.init();
    }
    
    init() {
        this.setupKeyboardListeners();
        this.setupMouseListeners();
        console.log("✅ سیستم ورودی راه‌اندازی شد");
    }
    
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    setupMouseListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.firing = true;
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.firing = false;
            }
        });
    }
    
    setJoystickActive(active) {
        this.joystick.active = active;
        if (!active) {
            this.joystick.x = 0;
            this.joystick.y = 0;
        }
    }
    
    setJoystickDirection(x, y) {
        this.joystick.x = x;
        this.joystick.y = y;
    }
    
    setFiring(firing) {
        this.firing = firing;
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    getMovementDirection() {
        let x = 0, y = 0;
        
        if (this.joystick.active) {
            x = this.joystick.x;
            y = this.joystick.y;
        } else {
            if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('d')) x += 1;
            if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a')) x -= 1;
            if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('s')) y += 1;
            if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('w')) y -= 1;
        }
        
        if (x !== 0 || y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }
        
        return new THREE.Vector3(x, y, 0);
    }
}

// صادر کردن کلاس‌ها
window.GameEngine = GameEngine;
window.ScoreSystem = ScoreSystem;
window.InputSystem = InputSystem;
console.log("📁 m5.js با موفقیت بارگذاری شد");
