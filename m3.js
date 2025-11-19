// m3.js - سیستم جنگنده و تیربار
class CombatSystem {
    constructor() {
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.combatMode = false;
        this.weaponLevel = 1;
        this.specialWeapons = new Map();
        this.animationId = null;
    }

    init() {
        this.createPlayer();
        this.setupControls();
        this.startCombatLoop();
        this.createWeaponSystem();
        
        console.log('سیستم جنگنده راه‌اندازی شد');
    }

    createPlayer() {
        this.player = document.createElement('div');
        this.player.id = 'playerShip';
        this.player.style.cssText = `
            position: absolute;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, #00aaff 0%, #0066ff 100%);
            border-radius: 50%;
            left: 50%;
            top: 80%;
            transform: translate(-50%, -50%);
            z-index: 10;
            box-shadow: 
                0 0 20px #00aaff,
                0 0 40px #0066ff,
                inset 0 0 20px rgba(255,255,255,0.5);
            border: 2px solid rgba(255,255,255,0.8);
            animation: playerGlow 2s ease-in-out infinite;
        `;

        // اضافه کردن موتورها
        this.createEngines();
        
        document.getElementById('gameContainer').appendChild(this.player);

        // استایل انیمیشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes playerGlow {
                0%, 100% { 
                    box-shadow: 
                        0 0 20px #00aaff,
                        0 0 40px #0066ff,
                        inset 0 0 20px rgba(255,255,255,0.5);
                }
                50% { 
                    box-shadow: 
                        0 0 30px #00aaff,
                        0 0 60px #0066ff,
                        inset 0 0 30px rgba(255,255,255,0.7);
                }
            }
            
            .engine-flame {
                position: absolute;
                width: 20px;
                height: 40px;
                background: linear-gradient(to top, #ff4400 0%, #ffaa00 50%, transparent 100%);
                border-radius: 50% 50% 0 0;
                animation: engineBurn 0.2s ease-in-out infinite;
            }
            
            @keyframes engineBurn {
                0%, 100% { transform: scaleY(1); opacity: 0.8; }
                50% { transform: scaleY(1.3); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    createEngines() {
        const leftEngine = document.createElement('div');
        const rightEngine = document.createElement('div');
        
        leftEngine.className = rightEngine.className = 'engine-flame';
        
        leftEngine.style.cssText = `
            left: 10px;
            bottom: -20px;
            transform-origin: bottom center;
        `;
        
        rightEngine.style.cssText = `
            right: 10px;
            bottom: -20px;
            transform-origin: bottom center;
        `;
        
        this.player.appendChild(leftEngine);
        this.player.appendChild(rightEngine);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.combatMode) return;
            
            switch(e.key) {
                case ' ':
                    this.fireWeapon();
                    break;
                case 'Shift':
                    this.activateSpecialWeapon();
                    break;
                case 'ArrowLeft':
                    this.movePlayer(-20);
                    break;
                case 'ArrowRight':
                    this.movePlayer(20);
                    break;
                case 'ArrowUp':
                    this.movePlayer(0, -20);
                    break;
                case 'ArrowDown':
                    this.movePlayer(0, 20);
                    break;
            }
        });

        // کنترل‌های لمسی
        document.addEventListener('touchstart', (e) => {
            if (this.combatMode) {
                this.fireWeapon();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.combatMode) {
                this.movePlayerTo(e.clientX, e.clientY);
            }
        });
    }

    createWeaponSystem() {
        // تعریف انواع سلاح‌ها
        this.specialWeapons.set('laser', {
            name: 'لیزر پلاسما',
            damage: 50,
            cooldown: 1000,
            lastUsed: 0,
            color: '#00ffff',
            effect: this.createLaserBeam.bind(this)
        });

        this.specialWeapons.set('missile', {
            name: 'موشک هدایت شونده',
            damage: 100,
            cooldown: 2000,
            lastUsed: 0,
            color: '#ff4444',
            effect: this.createMissile.bind(this)
        });

        this.specialWeapons.set('shield', {
            name: 'میدان محافظ',
            damage: 0,
            cooldown: 5000,
            lastUsed: 0,
            color: '#44ff44',
            effect: this.activateShield.bind(this)
        });
    }

    fireWeapon() {
        const playerRect = this.player.getBoundingClientRect();
        const x = playerRect.left + playerRect.width / 2;
        const y = playerRect.top;

        switch(this.weaponLevel) {
            case 1:
                this.createBullet(x, y);
                break;
            case 2:
                this.createBullet(x - 15, y);
                this.createBullet(x + 15, y);
                break;
            case 3:
                this.createBullet(x - 25, y);
                this.createBullet(x, y);
                this.createBullet(x + 25, y);
                break;
            case 4:
                this.createBullet(x - 20, y, -5);
                this.createBullet(x - 10, y, -2);
                this.createBullet(x + 10, y, 2);
                this.createBullet(x + 20, y, 5);
                break;
        }

        // افکت شلیک
        this.createMuzzleFlash(x, y);
    }

    createBullet(x, y, spread = 0) {
        const bullet = document.createElement('div');
        bullet.style.cssText = `
            position: absolute;
            width: 6px;
            height: 20px;
            background: linear-gradient(to top, #ffff00 0%, #ffaa00 50%, #ff4400 100%);
            border-radius: 3px;
            left: ${x - 3}px;
            top: ${y}px;
            z-index: 9;
            box-shadow: 0 0 10px #ffaa00;
            animation: bulletTrail 0.1s linear infinite;
        `;

        document.getElementById('gameContainer').appendChild(bullet);

        this.bullets.push({
            element: bullet,
            x: x - 3,
            y: y,
            vx: spread,
            vy: -15,
            damage: 10 * this.weaponLevel,
            type: 'normal'
        });

        // صدا و افکت
        this.createBulletSound();
    }

    createMuzzleFlash(x, y) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            width: 30px;
            height: 40px;
            background: radial-gradient(ellipse, #ffff00 0%, #ff4400 50%, transparent 100%);
            border-radius: 50%;
            left: ${x - 15}px;
            top: ${y - 20}px;
            z-index: 8;
            animation: muzzleFlash 0.1s ease-out forwards;
        `;

        document.getElementById('gameContainer').appendChild(flash);

        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 100);

        // استایل انیمیشن
        if (!document.getElementById('muzzleFlashStyle')) {
            const style = document.createElement('style');
            style.id = 'muzzleFlashStyle';
            style.textContent = `
                @keyframes muzzleFlash {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
                
                @keyframes bulletTrail {
                    0% { box-shadow: 0 0 5px #ffaa00; }
                    100% { box-shadow: 0 0 15px #ffff00, 0 0 30px #ffaa00; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createBulletSound() {
        // ایجاد صدای شلیک (می‌تواند با Web Audio API پیاده‌سازی شود)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Web Audio API پشتیبانی نمی‌شود');
        }
    }

    activateSpecialWeapon() {
        const currentTime = Date.now();
        const laser = this.specialWeapons.get('laser');
        
        if (currentTime - laser.lastUsed > laser.cooldown) {
            laser.effect();
            laser.lastUsed = currentTime;
        }
    }

    createLaserBeam() {
        const playerRect = this.player.getBoundingClientRect();
        const x = playerRect.left + playerRect.width / 2;
        
        const laser = document.createElement('div');
        laser.style.cssText = `
            position: absolute;
            width: 10px;
            height: 100vh;
            background: linear-gradient(to top, 
                transparent 0%, 
                #00ffff 20%, 
                #0088ff 50%, 
                transparent 100%);
            left: ${x - 5}px;
            top: 0;
            z-index: 7;
            animation: laserBeam 0.5s ease-out forwards;
            box-shadow: 0 0 20px #00ffff;
        `;

        document.getElementById('gameContainer').appendChild(laser);

        setTimeout(() => {
            if (laser.parentNode) {
                laser.parentNode.removeChild(laser);
            }
        }, 500);

        // استایل انیمیشن لیزر
        if (!document.getElementById('laserStyle')) {
            const style = document.createElement('style');
            style.id = 'laserStyle';
            style.textContent = `
                @keyframes laserBeam {
                    0% { height: 0; opacity: 0; }
                    50% { height: 100vh; opacity: 1; }
                    100% { height: 100vh; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // آسیب به دشمنان در مسیر لیزر
        this.damageEnemiesInLaserPath(x);
    }

    damageEnemiesInLaserPath(x) {
        this.enemies.forEach(enemy => {
            const enemyRect = enemy.element.getBoundingClientRect();
            if (Math.abs(enemyRect.left + enemyRect.width / 2 - x) < 50) {
                this.destroyEnemy(enemy);
            }
        });
    }

    movePlayer(dx = 0, dy = 0) {
        const playerRect = this.player.getBoundingClientRect();
        const newX = playerRect.left + dx;
        const newY = playerRect.top + dy;

        // محدود کردن حرکت به مرزهای صفحه
        const boundedX = Math.max(0, Math.min(window.innerWidth - playerRect.width, newX));
        const boundedY = Math.max(0, Math.min(window.innerHeight - playerRect.height, newY));

        this.player.style.left = boundedX + 'px';
        this.player.style.top = boundedY + 'px';
    }

    movePlayerTo(x, y) {
        const playerRect = this.player.getBoundingClientRect();
        const boundedX = Math.max(0, Math.min(window.innerWidth - playerRect.width, x - playerRect.width / 2));
        const boundedY = Math.max(0, Math.min(window.innerHeight - playerRect.height, y - playerRect.height / 2));

        this.player.style.left = boundedX + 'px';
        this.player.style.top = boundedY + 'px';
    }

    startCombatLoop() {
        const animate = () => {
            this.updateBullets();
            this.updateEnemies();
            this.spawnEnemies();
            this.checkCollisions();
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            bullet.element.style.left = bullet.x + 'px';
            bullet.element.style.top = bullet.y + 'px';
            
            // اگر تیر از صفحه خارج شد، حذف شود
            if (bullet.y < -50 || bullet.x < -50 || bullet.x > window.innerWidth + 50) {
                if (bullet.element.parentNode) {
                    bullet.element.parentNode.removeChild(bullet.element);
                }
                this.bullets.splice(i, 1);
            }
        }
    }

    spawnEnemies() {
        if (this.enemies.length < 10 && Math.random() < 0.02) {
            this.createEnemy();
        }
    }

    createEnemy() {
        const enemy = document.createElement('div');
        const x = Math.random() * (window.innerWidth - 60) + 30;
        
        enemy.style.cssText = `
            position: absolute;
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, #ff4444 0%, #aa0000 100%);
            border-radius: 50% 50% 0 0;
            left: ${x}px;
            top: -60px;
            z-index: 9;
            box-shadow: 0 0 20px #ff4444;
            animation: enemyFloat 3s ease-in-out infinite;
        `;

        document.getElementById('gameContainer').appendChild(enemy);

        const enemyData = {
            element: enemy,
            x: x,
            y: -60,
            health: 30,
            speed: Math.random() * 2 + 1,
            type: 'basic'
        };

        this.enemies.push(enemyData);

        // استایل انیمیشن دشمن
        if (!document.getElementById('enemyStyle')) {
            const style = document.createElement('style');
            style.id = 'enemyStyle';
            style.textContent = `
                @keyframes enemyFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            enemy.y += enemy.speed;
            enemy.element.style.top = enemy.y + 'px';
            
            // اگر دشمن از صفحه خارج شد، حذف شود
            if (enemy.y > window.innerHeight + 100) {
                if (enemy.element.parentNode) {
                    enemy.element.parentNode.removeChild(enemy.element);
                }
                this.enemies.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // بررسی برخورد تیرها با دشمنان
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const bulletRect = bullet.element.getBoundingClientRect();
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const enemyRect = enemy.element.getBoundingClientRect();
                
                if (this.checkRectCollision(bulletRect, enemyRect)) {
                    enemy.health -= bullet.damage;
                    
                    // افکت برخورد
                    this.createHitEffect(bullet.x + 3, bullet.y + 10);
                    
                    // حذف تیر
                    if (bullet.element.parentNode) {
                        bullet.element.parentNode.removeChild(bullet.element);
                    }
                    this.bullets.splice(i, 1);
                    
                    // اگر سلامت دشمن تمام شد
                    if (enemy.health <= 0) {
                        this.destroyEnemy(enemy);
                        this.enemies.splice(j, 1);
                    }
                    
                    break;
                }
            }
        }
    }

    checkRectCollision(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    createHitEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            background: radial-gradient(circle, #ffff00 0%, #ff4400 50%, transparent 100%);
            border-radius: 50%;
            left: ${x - 15}px;
            top: ${y - 15}px;
            z-index: 8;
            animation: hitEffect 0.3s ease-out forwards;
        `;

        document.getElementById('gameContainer').appendChild(effect);

        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 300);

        // استایل انیمیشن
        if (!document.getElementById('hitEffectStyle')) {
            const style = document.createElement('style');
            style.id = 'hitEffectStyle';
            style.textContent = `
                @keyframes hitEffect {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    destroyEnemy(enemy) {
        // افکت انفجار
        this.createExplosion(enemy.x + 30, enemy.y + 30);
        
        // حذف المان
        if (enemy.element.parentNode) {
            enemy.element.parentNode.removeChild(enemy.element);
        }
        
        // افزایش امتیاز
        this.increaseScore(100);
    }

    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 10 + 5;
            const color = `hsl(${Math.random() * 60}, 100%, 50%)`;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                z-index: 8;
                animation: explosionParticle 1s ease-out forwards;
            `;

            document.getElementById('gameContainer').appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }

        // استایل انیمیشن ذرات انفجار
        if (!document.getElementById('explosionStyle')) {
            const style = document.createElement('style');
            style.id = 'explosionStyle';
            style.textContent = `
                @keyframes explosionParticle {
                    0% { 
                        transform: translate(0, 0) scale(1); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    increaseScore(points) {
        // افزایش امتیاز بازی
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) {
            const currentScore = parseInt(scoreElement.textContent) || 0;
            scoreElement.textContent = currentScore + points;
        }
    }

    startCombat() {
        this.combatMode = true;
        this.player.style.display = 'block';
    }

    stopCombat() {
        this.combatMode = false;
        this.player.style.display = 'none';
    }

    upgradeWeapon() {
        this.weaponLevel = Math.min(4, this.weaponLevel + 1);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // پاکسازی تمام المان‌ها
        if (this.player && this.player.parentNode) {
            this.player.parentNode.removeChild(this.player);
        }
        
        this.bullets.forEach(bullet => {
            if (bullet.element.parentNode) {
                bullet.element.parentNode.removeChild(bullet.element);
            }
        });
        
        this.enemies.forEach(enemy => {
            if (enemy.element.parentNode) {
                enemy.element.parentNode.removeChild(enemy.element);
            }
        });
        
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
    }
}

// ایجاد نمونه از کلاس برای استفاده جهانی
window.CombatSystem = CombatSystem;
