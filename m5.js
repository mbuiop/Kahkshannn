// m5.js - موتور بازی اصلی
class GameEngine {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.isRunning = false;
        this.systems = {};
        this.entities = [];
        this.lastTime = 0;
        
        this.init();
    }
    
    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`کانتینر با شناسه ${this.containerId} یافت نشد`);
            return;
        }
        
        // راه‌اندازی سیستم‌ها
        this.setupSystems();
        
        // راه‌اندازی رویدادها
        this.setupEventListeners();
        
        console.log("موتور بازی راه‌اندازی شد");
    }
    
    setupSystems() {
        // راه‌اندازی سیستم گرافیک
        this.systems.graphics = new GraphicsSystem(this.containerId);
        
        // راه‌اندازی سیستم دوربین
        this.systems.camera = new CinematicCamera(
            this.systems.graphics.getCamera(),
            this.systems.graphics.getRenderer()
        );
        
        // راه‌اندازی سیستم انیمیشن
        this.systems.animation = new AnimationSystem();
        
        // راه‌اندازی سیستم جنگنده
        this.systems.fighter = new FighterSystem(
            this.systems.graphics.getScene(),
            this.systems.graphics.getCamera()
        );
        
        // راه‌اندازی سیستم فیزیک
        this.systems.physics = new PhysicsSystem();
        
        // راه‌اندازی سیستم صوتی
        this.systems.audio = new AudioSystem();
        
        // راه‌اندازی سیستم ورودی
        this.systems.input = new InputSystem();
        
        // راه‌اندازی سیستم مدیریت مراحل
        this.systems.level = new LevelManager();
        
        // راه‌اندازی سیستم امتیازدهی
        this.systems.score = new ScoreSystem();
        
        // راه‌اندازی سیستم موجودیت‌ها
        this.systems.entity = new EntityManager(
            this.systems.graphics.getScene()
        );
        
        // تنظیم هدف دوربین
        const player = this.systems.fighter.getPlayer();
        if (player) {
            this.systems.camera.setTarget(player);
        }
        
        // ذخیره ارجاع‌های جهانی برای دسترسی آسان
        window.gameEngine = this;
        window.gameGraphics = this.systems.graphics;
        window.gameCamera = this.systems.camera;
        window.gameFighter = this.systems.fighter;
    }
    
    setupEventListeners() {
        // رویدادهای پنجره
        window.addEventListener('resize', () => this.onResize());
        
        // رویدادهای سیستم ورودی
        if (this.systems.input) {
            this.systems.input.on('move', (data) => this.onPlayerMove(data));
            this.systems.input.on('fire', (data) => this.onPlayerFire(data));
            this.systems.input.on('weaponSwitch', (data) => this.onWeaponSwitch(data));
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        
        // شروع سطح اول
        this.systems.level.startLevel(1);
        
        // شروع حلقه بازی
        this.gameLoop();
        
        console.log("بازی شروع شد");
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = Math.min(0.1, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;
        
        // به‌روزرسانی سیستم‌ها
        this.updateSystems(deltaTime);
        
        // به‌روزرسانی موجودیت‌ها
        this.updateEntities(deltaTime);
        
        // بررسی برخوردها
        this.checkCollisions();
        
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
        }
        
        // به‌روزرسانی سیستم انیمیشن
        if (this.systems.animation) {
            this.systems.animation.updateParticleSystems(deltaTime);
        }
        
        // به‌روزرسانی سیستم فیزیک
        if (this.systems.physics) {
            this.systems.physics.update(deltaTime);
        }
        
        // به‌روزرسانی سیستم موجودیت‌ها
        if (this.systems.entity) {
            this.systems.entity.update(deltaTime);
        }
    }
    
    updateEntities(deltaTime) {
        // به‌روزرسانی تمام موجودیت‌های بازی
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.update) {
                entity.update(deltaTime);
            }
            
            // حذف موجودیت‌های مرده
            if (entity.dead) {
                this.removeEntity(entity);
            }
        }
    }
    
    checkCollisions() {
        // بررسی برخورد بین موجودیت‌ها
        for (let i = 0; i < this.entities.length; i++) {
            const entityA = this.entities[i];
            
            for (let j = i + 1; j < this.entities.length; j++) {
                const entityB = this.entities[j];
                
                if (this.systems.physics.checkCollision(entityA, entityB)) {
                    this.onCollision(entityA, entityB);
                }
            }
        }
        
        // بررسی برخورد پرتابه‌ها با دشمنان
        const projectiles = this.systems.fighter.getProjectiles();
        const enemies = this.systems.entity.getEnemies();
        
        for (const projectile of projectiles) {
            for (const enemy of enemies) {
                if (this.systems.physics.checkCollision(projectile, enemy)) {
                    this.onProjectileHit(projectile, enemy);
                }
            }
        }
    }
    
    onCollision(entityA, entityB) {
        // مدیریت برخورد بین دو موجودیت
        console.log(`برخورد بین ${entityA.type} و ${entityB.type}`);
        
        // آسیب به موجودیت‌ها بر اساس نوع
        if (entityA.type === 'player' && entityB.type === 'enemy') {
            this.systems.fighter.damagePlayer(10);
        }
        
        if (entityA.type === 'enemy' && entityB.type === 'player') {
            this.systems.fighter.damagePlayer(10);
        }
        
        // افکت برخورد
        this.createCollisionEffect(entityA.position, entityB.position);
    }
    
    onProjectileHit(projectile, target) {
        // مدیریت برخورد پرتابه با هدف
        if (projectile.owner === 'player' && target.type === 'enemy') {
            // آسیب به دشمن
            target.health -= projectile.damage;
            
            // افکت برخورد
            this.createHitEffect(target.position);
            
            // بررسی مرگ دشمن
            if (target.health <= 0) {
                this.onEnemyDestroyed(target);
            }
            
            // حذف پرتابه (مگر اینکه قابلیت نفوذ داشته باشد)
            if (!projectile.pierce) {
                projectile.life = 0;
            }
        }
    }
    
    onEnemyDestroyed(enemy) {
        // نابودی دشمن
        enemy.dead = true;
        
        // ایجاد افکت انفجار
        this.createExplosionEffect(enemy.position);
        
        // افزایش امتیاز
        if (this.systems.score) {
            this.systems.score.addScore(100);
        }
        
        // پخش صدای انفجار
        if (this.systems.audio) {
            this.systems.audio.playSound('explosion');
        }
        
        // احتمال افتادن power-up
        if (Math.random() < 0.3) {
            this.createPowerUp(enemy.position);
        }
    }
    
    createCollisionEffect(posA, posB) {
        // ایجاد افکت برخورد
        const collisionPos = posA.clone().lerp(posB, 0.5);
        
        if (this.systems.animation) {
            this.systems.animation.createParticleSystem('explosion', collisionPos, {
                particleCount: 20,
                color: new THREE.Color(1, 1, 0)
            });
        }
    }
    
    createHitEffect(position) {
        // ایجاد افکت برخورد
        if (this.systems.animation) {
            this.systems.animation.createParticleSystem('damage', position, {
                particleCount: 10,
                color: new THREE.Color(1, 0, 0)
            });
        }
    }
    
    createExplosionEffect(position) {
        // ایجاد افکت انفجار
        if (this.systems.animation) {
            this.systems.animation.createParticleSystem('explosion', position, {
                particleCount: 50,
                color: new THREE.Color(1, 0.5, 0)
            });
        }
    }
    
    createPowerUp(position) {
        // ایجاد power-up
        const powerUpTypes = ['health', 'energy', 'weapon'];
        const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        const powerUp = {
            type: type,
            position: position.clone(),
            mesh: this.createPowerUpMesh(type),
            collected: false
        };
        
        this.entities.push(powerUp);
        this.systems.graphics.getScene().add(powerUp.mesh);
    }
    
    createPowerUpMesh(type) {
        // ایجاد مدل بصری power-up
        let geometry, material;
        
        switch(type) {
            case 'health':
                geometry = new THREE.OctahedronGeometry(2);
                material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
                break;
            case 'energy':
                geometry = new THREE.DodecahedronGeometry(2);
                material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                break;
            case 'weapon':
                geometry = new THREE.IcosahedronGeometry(2);
                material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
                break;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // انیمیشن شناور
        if (this.systems.animation) {
            this.systems.animation.animateObject(mesh, 'float', {
                amplitude: 1,
                duration: 2
            });
            
            this.systems.animation.animateObject(mesh, 'rotate', {
                rotation: { y: Math.PI * 2 },
                duration: 5,
                repeat: -1
            });
        }
        
        return mesh;
    }
    
    onPlayerMove(direction) {
        // حرکت بازیکن
        if (this.systems.fighter) {
            this.systems.fighter.movePlayer(direction, 0.016); // فرض deltaTime ثابت
        }
    }
    
    onPlayerFire(targetPosition) {
        // شلیک بازیکن
        if (this.systems.fighter) {
            this.systems.fighter.fireWeapon(targetPosition);
        }
    }
    
    onWeaponSwitch(direction) {
        // تغییر سلاح
        if (this.systems.fighter) {
            this.systems.fighter.switchWeapon(direction);
        }
    }
    
    onResize() {
        // تغییر اندازه پنجره
        if (this.systems.graphics) {
            this.systems.graphics.onResize();
        }
        
        if (this.systems.camera) {
            // به‌روزرسانی دوربین در صورت نیاز
        }
    }
    
    addEntity(entity) {
        // اضافه کردن موجودیت جدید
        this.entities.push(entity);
    }
    
    removeEntity(entity) {
        // حذف موجودیت
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
        
        // حذف از صحنه
        if (entity.mesh && this.systems.graphics) {
            this.systems.graphics.getScene().remove(entity.mesh);
        }
    }
    
    pause() {
        // مکث بازی
        this.isRunning = false;
        
        // مکث صداها
        if (this.systems.audio) {
            this.systems.audio.pauseAll();
        }
    }
    
    resume() {
        // ادامه بازی
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop();
            
            // ادامه صداها
            if (this.systems.audio) {
                this.systems.audio.resumeAll();
            }
        }
    }
    
    nextLevel() {
        // رفتن به سطح بعدی
        this.systems.level.nextLevel();
    }
    
    getScore() {
        // دریافت امتیاز فعلی
        if (this.systems.score) {
            return this.systems.score.getCurrentScore();
        }
        return 0;
    }
    
    destroy() {
        // نابودی بازی و آزادسازی منابع
        this.isRunning = false;
        
        // توقف تمام انیمیشن‌ها
        if (this.systems.animation) {
            this.systems.animation.stopAllAnimations();
        }
        
        // پاک کردن صحنه
        if (this.systems.graphics) {
            const scene = this.systems.graphics.getScene();
            while(scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        }
        
        // حذف رویدادها
        window.removeEventListener('resize', () => this.onResize());
        
        // پاک کردن ارجاع‌های جهانی
        delete window.gameEngine;
        delete window.gameGraphics;
        delete window.gameCamera;
        delete window.gameFighter;
        
        console.log("بازی متوقف شد");
    }
}

// سیستم امتیازدهی
class ScoreSystem {
    constructor() {
        this.currentScore = 0;
        this.highScore = this.loadHighScore();
        this.multiplier = 1;
        this.multiplierTimer = 0;
        this.combo = 0;
        
        this.init();
    }
    
    init() {
        console.log("سیستم امتیازدهی راه‌اندازی شد");
    }
    
    addScore(points) {
        // اضافه کردن امتیاز با در نظر گرفتن مضرب
        const actualPoints = Math.floor(points * this.multiplier);
        this.currentScore += actualPoints;
        
        // افزایش کامبو
        this.combo++;
        this.updateMultiplier();
        
        // به‌روزرسانی high score در صورت نیاز
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        return actualPoints;
    }
    
    updateMultiplier() {
        // به‌روزرسانی مضرب امتیاز بر اساس کامبو
        if (this.combo >= 20) {
            this.multiplier = 5;
        } else if (this.combo >= 15) {
            this.multiplier = 4;
        } else if (this.combo >= 10) {
            this.multiplier = 3;
        } else if (this.combo >= 5) {
            this.multiplier = 2;
        } else {
            this.multiplier = 1;
        }
        
        // ریست تایمر مضرب
        this.multiplierTimer = 5.0;
    }
    
    update(deltaTime) {
        // به‌روزرسانی تایمر مضرب
        if (this.multiplierTimer > 0) {
            this.multiplierTimer -= deltaTime;
            
            if (this.multiplierTimer <= 0) {
                // ریست کامبو و مضرب
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
    
    getMultiplier() {
        return this.multiplier;
    }
    
    getCombo() {
        return this.combo;
    }
    
    loadHighScore() {
        // بارگذاری high score از localStorage
        const saved = localStorage.getItem('galacticWarsHighScore');
        return saved ? parseInt(saved) : 0;
    }
    
    saveHighScore() {
        // ذخیره high score در localStorage
        localStorage.setItem('galacticWarsHighScore', this.highScore.toString());
    }
    
    reset() {
        // ریست امتیاز فعلی
        this.currentScore = 0;
        this.multiplier = 1;
        this.multiplierTimer = 0;
        this.combo = 0;
    }
}

// سیستم ورودی
class InputSystem {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.joystick = { active: false, x: 0, y: 0 };
        this.firing = false;
        this.listeners = {};
        
        this.init();
    }
    
    init() {
        this.setupKeyboardListeners();
        this.setupMouseListeners();
        console.log("سیستم ورودی راه‌اندازی شد");
    }
    
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // تغییر سلاح با کلیدهای عددی
            if (e.key >= '1' && e.key <= '4') {
                const weaponIndex = parseInt(e.key) - 1;
                this.emit('weaponSwitch', { direction: weaponIndex });
            }
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
                this.emit('fire', { 
                    x: this.mouse.x, 
                    y: this.mouse.y 
                });
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
        
        if (this.joystick.active) {
            this.emit('move', { x, y });
        }
    }
    
    setFiring(firing) {
        this.firing = firing;
        
        if (firing) {
            this.emit('fire', { 
                x: this.mouse.x, 
                y: this.mouse.y 
            });
        }
    }
    
    setMousePosition(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    getMovementDirection() {
        // محاسبه جهت حرکت بر اساس ورودی
        let x = 0, y = 0;
        
        // اولویت با جویستیک
        if (this.joystick.active) {
            x = this.joystick.x;
            y = this.joystick.y;
        } else {
            // استفاده از کیبورد
            if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('d')) x += 1;
            if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a')) x -= 1;
            if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('s')) y += 1;
            if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('w')) y -= 1;
        }
        
        // نرمال‌سازی اگر جهت مورب باشد
        if (x !== 0 || y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }
        
        return new THREE.Vector3(x, y, 0);
    }
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

// سیستم صوتی
class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
        
        this.init();
    }
    
    init() {
        this.loadSounds();
        console.log("سیستم صوتی راه‌اندازی شد");
    }
    
    loadSounds() {
        // بارگذاری صداها
        // در نسخه واقعی، این صداها از فایل‌های واقعی بارگذاری می‌شوند
        this.sounds = {
            'laser': new Howl({ src: ['sounds/laser.mp3'], volume: this.sfxVolume }),
            'explosion': new Howl({ src: ['sounds/explosion.mp3'], volume: this.sfxVolume }),
            'explosion_large': new Howl({ src: ['sounds/explosion_large.mp3'], volume: this.sfxVolume }),
            'powerup': new Howl({ src: ['sounds/powerup.mp3'], volume: this.sfxVolume }),
            'weapon_switch': new Howl({ src: ['sounds/weapon_switch.mp3'], volume: this.sfxVolume })
        };
        
        // بارگذاری موسیقی
        this.music = new Howl({
            src: ['music/background.mp3'],
            volume: this.musicVolume,
            loop: true
        });
    }
    
    playSound(soundId) {
        if (this.muted || !this.sounds[soundId]) return;
        
        this.sounds[soundId].play();
    }
    
    playMusic() {
        if (this.muted) return;
        
        this.music.play();
    }
    
    stopMusic() {
        this.music.stop();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        this.music.volume(volume);
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = volume;
        Object.values(this.sounds).forEach(sound => {
            sound.volume(volume);
        });
    }
    
    mute() {
        this.muted = true;
        this.music.mute(true);
        Object.values(this.sounds).forEach(sound => {
            sound.mute(true);
        });
    }
    
    unmute() {
        this.muted = false;
        this.music.mute(false);
        Object.values(this.sounds).forEach(sound => {
            sound.mute(false);
        });
    }
    
    pauseAll() {
        this.music.pause();
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
        });
    }
    
    resumeAll() {
        if (!this.muted) {
            this.music.play();
        }
    }
}

// سیستم مدیریت موجودیت‌ها
class EntityManager {
    constructor(scene) {
        this.scene = scene;
        this.entities = [];
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        
        this.init();
    }
    
    init() {
        console.log("سیستم مدیریت موجودیت‌ها راه‌اندازی شد");
    }
    
    createEnemy(type, position, difficulty = 1) {
        // ایجاد دشمن جدید
        let geometry, material;
        
        switch(type) {
            case 'scout':
                geometry = new THREE.ConeGeometry(1.5, 3, 8);
                material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
                break;
            case 'fighter':
                geometry = new THREE.OctahedronGeometry(2);
                material = new THREE.MeshPhongMaterial({ color: 0xaa0000 });
                break;
            case 'bomber':
                geometry = new THREE.DodecahedronGeometry(2.5);
                material = new THREE.MeshPhongMaterial({ color: 0x880000 });
                break;
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        const enemy = {
            type: type,
            mesh: mesh,
            position: position,
            health: 20 * difficulty,
            maxHealth: 20 * difficulty,
            speed: 5 + difficulty,
            damage: 10 * difficulty,
            fireRate: 1,
            lastFire: 0,
            dead: false
        };
        
        this.scene.add(mesh);
        this.entities.push(enemy);
        this.enemies.push(enemy);
        
        return enemy;
    }
    
    update(deltaTime) {
        // به‌روزرسانی تمام موجودیت‌ها
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.dead) {
                this.removeEntity(entity);
                continue;
            }
            
            // به‌روزرسانی موقعیت بصری
            if (entity.mesh && entity.position) {
                entity.mesh.position.copy(entity.position);
            }
            
            // به‌روزرسانی دشمنان
            if (this.enemies.includes(entity)) {
                this.updateEnemy(entity, deltaTime);
            }
        }
    }
    
    updateEnemy(enemy, deltaTime) {
        // به‌روزرسانی رفتار دشمن
        const player = window.gameFighter ? window.gameFighter.getPlayer() : null;
        
        if (player) {
            // حرکت به سمت بازیکن
            const direction = player.position.clone().sub(enemy.position).normalize();
            enemy.position.add(direction.multiplyScalar(enemy.speed * deltaTime));
            
            // چرخش به سمت بازیکن
            enemy.mesh.lookAt(player.position);
            
            // شلیک به بازیکن
            enemy.lastFire += deltaTime;
            if (enemy.lastFire >= enemy.fireRate) {
                this.enemyFire(enemy, player.position);
                enemy.lastFire = 0;
            }
        }
    }
    
    enemyFire(enemy, targetPosition) {
        // شلیک دشمن
        const geometry = new THREE.SphereGeometry(0.5, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        const projectile = new THREE.Mesh(geometry, material);
        projectile.position.copy(enemy.position);
        
        const direction = targetPosition.clone().sub(enemy.position).normalize();
        
        const enemyProjectile = {
            mesh: projectile,
            position: enemy.position.clone(),
            velocity: direction.multiplyScalar(20),
            damage: enemy.damage,
            owner: 'enemy',
            life: 3.0
        };
        
        this.scene.add(projectile);
        this.entities.push(enemyProjectile);
        this.projectiles.push(enemyProjectile);
    }
    
    removeEntity(entity) {
        // حذف موجودیت
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
        
        const enemyIndex = this.enemies.indexOf(entity);
        if (enemyIndex !== -1) {
            this.enemies.splice(enemyIndex, 1);
        }
        
        const projectileIndex = this.projectiles.indexOf(entity);
        if (projectileIndex !== -1) {
            this.projectiles.splice(projectileIndex, 1);
        }
        
        const powerUpIndex = this.powerUps.indexOf(entity);
        if (powerUpIndex !== -1) {
            this.powerUps.splice(powerUpIndex, 1);
        }
        
        // حذف از صحنه
        if (entity.mesh) {
            this.scene.remove(entity.mesh);
        }
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    getProjectiles() {
        return this.projectiles;
    }
    
    getEnemiesDestroyed() {
        // تعداد دشمنان نابود شده در این سطح
        // این یک مقدار ساده‌شده است - در نسخه واقعی باید دقیق‌تر پیاده‌سازی شود
        return Math.max(0, 10 - this.enemies.length);
    }
    
    clearAll() {
        // حذف تمام موجودیت‌ها
        while (this.entities.length > 0) {
            this.removeEntity(this.entities[0]);
        }
    }
}

// صادر کردن کلاس‌های اصلی
window.GameEngine = GameEngine;
window.ScoreSystem = ScoreSystem;
window.InputSystem = InputSystem;
window.AudioSystem = AudioSystem;
window.EntityManager = EntityManager;
