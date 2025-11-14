// سیستم صوتی ساده و کارآمد
class GameAudio {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.init();
    }

    init() {
        // ایجاد صداهای ساده
        this.sounds = {
            shoot: this.createSound(800, 100, 0.2),
            explosion: this.createSound(150, 50, 0.5),
            collect: this.createSound(523, 784, 0.3),
            levelUp: this.createSound(523, 1046, 0.4)
        };
    }

    createSound(startFreq, endFreq, duration) {
        return { startFreq, endFreq, duration };
    }

    play(soundName) {
        if (this.muted || !this.sounds[soundName]) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(this.sounds[soundName].startFreq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(this.sounds[soundName].endFreq, 
                audioContext.currentTime + this.sounds[soundName].duration);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, 
                audioContext.currentTime + this.sounds[soundName].duration);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + this.sounds[soundName].duration);
        } catch (error) {
            console.log('خطا در پخش صدا:', error);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

// مدیریت بازی
class GalaxyGame {
    constructor() {
        this.audio = new GameAudio();
        this.gameState = {
            currentLevel: 1,
            score: 0,
            fuel: 100,
            running: false,
            player: { x: 0, y: 0, size: 60, rotation: 0, color: '#00aaff' },
            enemies: [],
            coins: [],
            bullets: [],
            coinTrail: [],
            playerPath: [],
            bombCooldown: 0,
            bombAvailable: true,
            safeTime: 0,
            isSafeTime: false,
            fuelConsumption: 0,
            enemySpawnTimer: 0,
            autoShoot: false,
            autoShootTimer: 0,
            background: 'space'
        };

        this.playerElement = null;
        this.joystickActive = false;
        this.setupEventListeners();
        this.initSettings();
    }

    initSettings() {
        this.shipColors = [
            '#00aaff', '#ff4444', '#00ff88', '#ffaa00', '#cc66ff',
            '#00ffff', '#ff66cc', '#66ff66', '#ff9966', '#6699ff'
        ];

        this.backgrounds = [
            'space', 'nebula', 'galaxy', 'starfield', 'cosmic'
        ];
    }

    setupEventListeners() {
        // حرکت موس
        document.addEventListener('mousemove', (e) => {
            if (this.gameState.running && !this.joystickActive) {
                this.movePlayer(e.clientX, e.clientY);
            }
        });

        // حرکت لمسی
        document.addEventListener('touchmove', (e) => {
            if (this.gameState.running) {
                e.preventDefault();
                const touch = e.touches[0];
                
                // اگر لمس روی جویستیک نیست، حرکت مستقیم
                if (!this.isTouchOnJoystick(touch.clientX, touch.clientY)) {
                    this.movePlayer(touch.clientX, touch.clientY);
                }
            }
        },
        { passive: false });
        // تنظیمات جویستیک
        this.setupJoystick();

        window.addEventListener('resize', () => {
            if (this.gameState.running) {
                this.setupGame();
            }
        });
    }

        setupJoystick() {
           const joystick = document.querySelector('.joystick');
           const joystickHandle = document.querySelector('.joystick-handle');
        let startX, startY;
        let baseX, baseY;
   joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            const rect = joystick.getBoundingClientRect();
            baseX = rect.left + rect.width / 2;
            baseY = rect.top + rect.height / 2;
            this.joystickActive = true;
    });
            document.addEventListener('touchmove', (e) => {
            if (!this.joystickActive || !this.gameState.running) return;
            e.preventDefault();
            

            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const limitedDistance = Math.min(distance, 35);
            const angle = Math.atan2(deltaY, deltaX);

            // حرکت هندل جویستیک
            joystickHandle.style.transform = 
            `translate(${limitedDistance * Math.cos(angle)}px, ${limitedDistance * Math.sin(angle)}px)`;

            if (distance > 5) {
                const speed = (limitedDistance / 35) * 8;
                const newX = this.gameState.player.x + Math.cos(angle) * speed;
                const newY = this.gameState.player.y + Math.sin(angle) * speed;

                // محدود کردن به مرزهای صفحه
                this.gameState.player.x = Math.max(this.gameState.player.size/2, 
                    Math.min(window.innerWidth - this.gameState.player.size/2, newX));
                this.gameState.player.y = Math.max(this.gameState.player.size/2, 
                    Math.min(window.innerHeight - this.gameState.player.size/2, newY));

                this.movePlayer(this.gameState.player.x, this.gameState.player.y);
            }
        });

        document.addEventListener('touchend', () => {
        this.joystickActive = false;
        joystickHandle.style.transform = 'translate(0, 0)';
    });
   } 
            
            

    isTouchOnJoystick(x, y) {
        const joystick = document.querySelector('.joystick');
        const rect = joystick.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

      movePlayer(x, y) {
        this.gameState.player.x = x;
        this.gameState.player.y = y;
        this.updatePlayerPosition();
    }

    updatePlayerPosition() {
    if (this.playerElement) {
        this.playerElement.style.left = (this.gameState.player.x - this.gameState.player.size/2) + 'px';
        this.playerElement.style.top = (this.gameState.player.y - this.gameState.player.size/2) + 'px';
        
        // فقط موقعیت به‌روز شود، چرخش غیرفعال
    }
    

         // چرخش سفینه بر اساس حرکت
            if (this.gameState.playerPath.length > 1) {
                const currentPos = this.gameState.playerPath[this.gameState.playerPath.length - 1];
                const prevPos = this.gameState.playerPath[this.gameState.playerPath.length - 2];
                const dx = currentPos.x - prevPos.x;
                const dy = currentPos.y - prevPos.y;
                
                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                    this.gameState.player.rotation = Math.atan2(dy, dx);
                    this.playerElement.style.transform = `rotate(${this.gameState.player.rotation}rad)`;
                }
            }
        }
    }

    startGame() {
        this.showLoadingScreen(() => {
            this.gameState.running = true;
            document.getElementById('mainScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.remove('hidden');
            document.querySelector('.game-hud').classList.remove('hidden');
            document.querySelector('.game-controls').classList.remove('hidden');

            this.setupGame();
            
            const playerIndicator = document.getElementById('playerIndicator');
            playerIndicator.classList.remove('hidden');
            setTimeout(() => {
                playerIndicator.classList.add('hidden');
            }, 2000);

            this.createPlayer();
            this.resetGameState();
            this.createCoins();
            this.createEnemies();

            this.gameLoop();
        });
    }

    setupGame() {
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.style.width = window.innerWidth + 'px';
        gameScreen.style.height = window.innerHeight + 'px';
    }

    showLoadingScreen(callback) {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingText = document.getElementById('loadingText');
        loadingScreen.classList.remove('hidden');
        loadingText.textContent = "در حال بارگذاری...";

        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            loadingText.textContent = `در حال بارگذاری... ${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    callback();
                }, 300);
            }
        }, 50);
    }

    createPlayer() {
        const gameWorld = document.getElementById('gameWorld');
        
        if (this.playerElement) {
            this.playerElement.remove();
        }

        this.playerElement = document.createElement('div');
        this.playerElement.className = 'player pulse';
        this.playerElement.innerHTML = '🛸';
        this.playerElement.style.color = this.gameState.player.color;

        this.gameState.player.x = window.innerWidth / 2;
        this.gameState.player.y = window.innerHeight / 2;

        gameWorld.appendChild(this.playerElement);
        this.updatePlayerPosition();
    }

    resetGameState() {
        this.gameState.score = 0;
        this.gameState.coinsCollected = 0;
        this.gameState.currentLevel = parseInt(localStorage.getItem('highLevel')) || 1;
        this.gameState.totalCoinsNeeded = Math.min(15, 5 + this.gameState.currentLevel);
        this.gameState.bombCooldown = 0;
        this.gameState.bombAvailable = true;
        this.gameState.safeTime = 0;
        this.gameState.isSafeTime = false;
        this.gameState.playerPath = [];
        this.gameState.fuel = 100;
        this.gameState.fuelConsumption = 0;
        this.gameState.enemySpawnTimer = 0;
        this.gameState.autoShoot = false;
        this.gameState.autoShootTimer = 0;

        this.updateHUD();
        document.getElementById('safeTimeIndicator').classList.add('hidden');
    }

    createCoins() {
        this.clearElements(['.coin', '.coin-number']);
        this.gameState.coins = [];

        for (let i = 0; i < this.gameState.totalCoinsNeeded; i++) {
            this.createSingleCoin();
        }
    }

    createSingleCoin() {
        const gameWorld = document.getElementById('gameWorld');
        const coinElement = document.createElement('div');
        coinElement.className = 'coin';
        coinElement.innerHTML = '🌏';
        
        const numberElement = document.createElement('div');
        numberElement.className = 'coin-number';
        const hitsRequired = this.gameState.currentLevel + 1;
        numberElement.textContent = hitsRequired;

        const x = Math.random() * (window.innerWidth - 80) + 40;
        const y = Math.random() * (window.innerHeight - 80) + 40;

        coinElement.style.left = (x - 18) + 'px';
        coinElement.style.top = (y - 18) + 'px';
        numberElement.style.left = (x - 6) + 'px';
        numberElement.style.top = (y - 6) + 'px';

        gameWorld.appendChild(coinElement);
        gameWorld.appendChild(numberElement);

        this.gameState.coins.push({
            element: coinElement,
            numberElement: numberElement,
            x: x,
            y: y,
            collected: false,
            hitsNeeded: hitsRequired,
            currentHits: 0
        });
    }

    createEnemies() {
        this.clearElements(['.enemy']);
        this.gameState.enemies = [];

        const enemyCount = Math.min(2 + this.gameState.currentLevel, 6);
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                this.createSingleEnemy();
            }, i * 800);
        }
    }

    createSingleEnemy() {
        if (this.gameState.enemies.length >= 6) return;

        const enemyElement = document.createElement('div');
        enemyElement.className = 'enemy';
        enemyElement.innerHTML = '🌋';

        const side = Math.floor(Math.random() * 4);
        let x, y, targetX, targetY;

        switch(side) {
            case 0: // بالا
                x = Math.random() * window.innerWidth;
                y = -40;
                targetX = Math.random() * window.innerWidth;
                targetY = window.innerHeight + 40;
                break;
            case 1: // راست
                x = window.innerWidth + 40;
                y = Math.random() * window.innerHeight;
                targetX = -40;
                targetY = Math.random() * window.innerHeight;
                break;
            case 2: // پایین
                x = Math.random() * window.innerWidth;
                y = window.innerHeight + 40;
                targetX = Math.random() * window.innerWidth;
                targetY = -40;
                break;
            case 3: // چپ
                x = -40;
                y = Math.random() * window.innerHeight;
                targetX = window.innerWidth + 40;
                targetY = Math.random() * window.innerHeight;
                break;
        }

        enemyElement.style.left = x + 'px';
        enemyElement.style.top = y + 'px';

        document.getElementById('gameWorld').appendChild(enemyElement);

        this.gameState.enemies.push({
            element: enemyElement,
            x: x,
            y: y,
            targetX: targetX,
            targetY: targetY,
            speed: 0.8 + this.gameState.currentLevel * 0.15
        });
    }

    shoot() {
        if (!this.gameState.running) return;
        
        this.audio.play('shoot');
        this.createBullet();
    }

    createBullet() {
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.style.left = this.gameState.player.x + 'px';
        bullet.style.top = this.gameState.player.y + 'px';

        document.getElementById('gameWorld').appendChild(bullet);

        this.gameState.bullets.push({
            element: bullet,
            x: this.gameState.player.x,
            y: this.gameState.player.y,
            speed: 12,
            angle: this.gameState.player.rotation
        });
    }

    toggleAutoShoot() {
        this.gameState.autoShoot = !this.gameState.autoShoot;
        const btn = document.querySelector('.control-btn.special-btn');
        if (this.gameState.autoShoot) {
            btn.style.background = 'linear-gradient(45deg, #00ff88, #00cc66)';
        } else {
            btn.style.background = 'linear-gradient(45deg, #00ccff, #0066ff)';
        }
    }

    useBomb() {
        if (!this.gameState.bombAvailable) return;
        
        this.gameState.bombAvailable = false;
        this.gameState.bombCooldown = 8 * 60; // 8 ثانیه
        
        this.gameState.isSafeTime = true;
        this.gameState.safeTime = 4 * 60; // 4 ثانیه زمان امن
        document.getElementById('safeTimeIndicator').classList.remove('hidden');
        
        this.createBombExplosion(this.gameState.player.x, this.gameState.player.y);
        
        // نابودی تمام دشمنان
        this.gameState.enemies.forEach(enemy => {
            this.createEnemyExplosion(enemy.x, enemy.y);
            enemy.element.remove();
        });
        this.gameState.enemies = [];
        
        this.audio.play('explosion');
    }

    createBombExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.innerHTML = '💥';
        explosion.style.position = 'absolute';
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';
        explosion.style.fontSize = '40px';
        explosion.style.zIndex = '6';

        document.getElementById('gameWorld').appendChild(explosion);

        setTimeout(() => {
            explosion.remove();
        }, 600);
    }

    createEnemyExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.background = '#ff5500';
                particle.style.borderRadius = '50%';
                particle.style.zIndex = '5';

                document.getElementById('gameWorld').appendChild(particle);

                setTimeout(() => {
                    particle.remove();
                }, 400);
            }, i * 50);
        }
    }

    gameLoop() {
        if (!this.gameState.running) return;

        this.gameState.playerPath.push({ 
            x: this.gameState.player.x, 
            y: this.gameState.player.y 
        });

        if (this.gameState.playerPath.length > 30) {
            this.gameState.playerPath.shift();
        }

        this.updateBombTimer();
        this.updateSafeTime();
        this.updateFuelConsumption();
        this.updateEnemySpawning();
        this.updateEnemies();
        this.updateBullets();
        this.updateCoinTrail();
        this.updateAutoShoot();
        this.checkCollisions();

        requestAnimationFrame(() => this.gameLoop());
    }

    updateBombTimer() {
        if (this.gameState.bombCooldown > 0) {
            this.gameState.bombCooldown--;
        } else {
            this.gameState.bombAvailable = true;
        }
    }

    updateSafeTime() {
        if (this.gameState.isSafeTime && this.gameState.safeTime > 0) {
            this.gameState.safeTime--;
            document.getElementById('safeTimeIndicator').textContent = 
                `زمان امن: ${Math.ceil(this.gameState.safeTime/60)}s`;

            if (this.gameState.safeTime <= 0) {
                this.gameState.isSafeTime = false;
                document.getElementById('safeTimeIndicator').classList.add('hidden');
            }
        }
    }

    updateFuelConsumption() {
        this.gameState.fuelConsumption++;
        if (this.gameState.fuelConsumption >= 90) { // مصرف سوخت آهسته‌تر
            this.gameState.fuelConsumption = 0;
            this.gameState.fuel = Math.max(0, this.gameState.fuel - 0.3);
            this.updateHUD();

            if (this.gameState.fuel <= 0) {
                this.gameOver();
            }
        }
    }

    updateEnemySpawning() {
        this.gameState.enemySpawnTimer++;

        const spawnInterval = Math.max(90, 240 - this.gameState.currentLevel * 3);

        if (this.gameState.enemySpawnTimer >= spawnInterval && 
            this.gameState.enemies.length < 6) {
            this.gameState.enemySpawnTimer = 0;
            this.createSingleEnemy();
        }
    }

    updateEnemies() {
        for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameState.enemies[i];

            const dx = enemy.targetX - enemy.x;
            const dy = enemy.targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;

                enemy.element.style.left = enemy.x + 'px';
                enemy.element.style.top = enemy.y + 'px';
            }

            if (distance < 5 || 
                enemy.x < -100 || enemy.x > window.innerWidth + 100 ||
                enemy.y < -100 || enemy.y > window.innerHeight + 100) {
                enemy.element.remove();
                this.gameState.enemies.splice(i, 1);
            }
        }
    }

    updateBullets() {
        for (let i = this.gameState.bullets.length - 1; i >= 0; i--) {
            const bullet = this.gameState.bullets[i];
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;

            bullet.element.style.left = bullet.x + 'px';
            bullet.element.style.top = bullet.y + 'px';

            // حذف اگر خارج از صفحه
            if (bullet.x < -10 || bullet.x > window.innerWidth + 10 ||
                bullet.y < -10 || bullet.y > window.innerHeight + 10) {
                bullet.element.remove();
                this.gameState.bullets.splice(i, 1);
            }
        }
    }

    updateAutoShoot() {
        if (this.gameState.autoShoot) {
            this.gameState.autoShootTimer++;
            if (this.gameState.autoShootTimer >= 25) { // شلیک هر 25 فریم
                this.gameState.autoShootTimer = 0;
                this.shoot();
            }
        }
    }

    updateCoinTrail() {
        this.clearElements(['.coin-trail']);

        const trailLength = Math.min(this.gameState.coinTrail.length, 10);

        for (let i = 0; i < trailLength; i++) {
            const trailElement = document.createElement('div');
            trailElement.className = 'coin';
            trailElement.style.position = 'absolute';
            trailElement.style.opacity = 0.5 - (i / trailLength) * 0.4;
            trailElement.style.transform = `scale(${0.8 - (i / trailLength) * 0.3})`;

            let targetIndex = Math.max(0, this.gameState.playerPath.length - (i + 1) * 2);
            if (targetIndex >= this.gameState.playerPath.length) targetIndex = this.gameState.playerPath.length - 1;

            const targetPos = this.gameState.playerPath[targetIndex];
            if (!targetPos) continue;

            trailElement.style.left = (targetPos.x - 18) + 'px';
            trailElement.style.top = (targetPos.y - 18) + 'px';

            document.getElementById('gameWorld').appendChild(trailElement);
        }
    }

    checkCollisions() {
        // برخورد با سکه‌ها
        this.gameState.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.gameState.player.x - coin.x, 2) + 
                    Math.pow(this.gameState.player.y - coin.y, 2)
                );

                if (distance < 35) {
                    coin.currentHits++;
                    coin.numberElement.textContent = coin.hitsNeeded - coin.currentHits;

                    this.createHitEffect(coin.x, coin.y);

                    if (coin.currentHits >= coin.hitsNeeded) {
                        coin.collected = true;
                        this.gameState.coinsCollected++;
                        this.gameState.score += 10 * this.gameState.currentLevel;

                        this.gameState.fuel = Math.min(100, this.gameState.fuel + 8);
                        this.updateHUD();

                        coin.element.style.display = 'none';
                        coin.numberElement.style.display = 'none';

                        this.createCollectEffect(coin.x, coin.y);
                        this.audio.play('collect');

                        this.gameState.coinTrail.push({
                            x: coin.x,
                            y: coin.y
                        });

                        if (this.gameState.coinsCollected >= this.gameState.totalCoinsNeeded) {
                            this.completeLevel();
                        }
                    }
                }
            }
        });

        // برخورد با آتشفشان‌ها
        if (!this.gameState.isSafeTime) {
            this.gameState.enemies.forEach(enemy => {
                const distance = Math.sqrt(
                    Math.pow(this.gameState.player.x - enemy.x, 2) + 
                    Math.pow(this.gameState.player.y - enemy.y, 2)
                );

                if (distance < 40) {
                    this.restartCurrentLevel();
                }
            });
        }

        // برخورد گلوله با دشمن
        this.gameState.bullets.forEach((bullet, bulletIndex) => {
            this.gameState.enemies.forEach((enemy, enemyIndex) => {
                const distance = Math.sqrt(
                    Math.pow(bullet.x - enemy.x, 2) + 
                    Math.pow(bullet.y - enemy.y, 2)
                );

                if (distance < 30) {
                    this.createExplosion(enemy.x, enemy.y);
                    enemy.element.remove();
                    this.gameState.enemies.splice(enemyIndex, 1);

                    bullet.element.remove();
                    this.gameState.bullets.splice(bulletIndex, 1);

                    this.gameState.score += 30;
                    this.updateHUD();
                    this.audio.play('explosion');
                }
            });
        });
    }

    createHitEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.fontSize = '16px';
        effect.style.color = '#00ff88';
        effect.style.zIndex = '5';
        effect.innerHTML = '✨';

        document.getElementById('gameWorld').appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 300);
    }

    createCollectEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'coin-collect-effect';
        effect.innerHTML = '⭐';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';

        document.getElementById('gameWorld').appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 600);
    }

    createExplosion(x, y) {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.width = '3px';
                particle.style.height = '3px';
                particle.style.background = '#ff5500';
                particle.style.borderRadius = '50%';
                particle.style.zIndex = '5';

                document.getElementById('gameWorld').appendChild(particle);

                setTimeout(() => {
                    particle.remove();
                }, 300);
            }, i * 40);
        }
    }

    completeLevel() {
        this.gameState.running = false;
        this.saveGameData();
        this.createLevelCompleteEffects();

        setTimeout(() => {
            document.getElementById('completedLevel').textContent = this.gameState.currentLevel;
            document.getElementById('levelComplete').classList.add('show');
        }, 800);

        this.audio.play('levelUp');
    }

    createLevelCompleteEffects() {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const effect = document.createElement('div');
                effect.className = 'level-complete-effect';
                effect.innerHTML = '✨';
                effect.style.left = (this.gameState.player.x + Math.random() * 80 - 40) + 'px';
                effect.style.top = (this.gameState.player.y + Math.random() * 80 - 40) + 'px';
                document.getElementById('gameWorld').appendChild(effect);

                setTimeout(() => {
                    effect.remove();
                }, 1200);
            }, i * 150);
        }
    }

    restartCurrentLevel() {
        this.gameState.running = false;

        setTimeout(() => {
            this.gameState.coinsCollected = 0;
            this.gameState.bombCooldown = 0;
            this.gameState.bombAvailable = true;
            this.gameState.safeTime = 0;
            this.gameState.isSafeTime = false;
            this.gameState.playerPath = [];
            this.gameState.fuel = 100;
            this.gameState.fuelConsumption = 0;
            this.gameState.enemySpawnTimer = 0;

            this.clearElements(['.coin', '.enemy', '.coin-number', '.bullet']);
            this.gameState.enemies = [];
            this.gameState.bullets = [];

            this.gameState.player.x = window.innerWidth / 2;
            this.gameState.player.y = window.innerHeight / 2;
            this.movePlayer(this.gameState.player.x, this.gameState.player.y);

            this.updateHUD();
            this.createCoins();
            this.createEnemies();

            this.gameState.running = true;
            this.gameLoop();
        }, 1000);
    }

    gameOver() {
        this.gameState.running = false;

        setTimeout(() => {
            document.getElementById('mainScreen').classList.remove('hidden');
            document.getElementById('gameScreen').classList.add('hidden');
            document.querySelector('.game-hud').classList.add('hidden');
            document.querySelector('.game-controls').classList.add('hidden');
            document.getElementById('levelComplete').classList.remove('show');

            this.clearElements(['.coin', '.enemy', '.coin-number', '.bullet']);
            
            this.gameState.enemies = [];
            this.gameState.bullets = [];
            this.gameState.coinTrail = [];
            this.gameState.playerPath = [];

            this.updateMainScreenStats();
        }, 1500);
    }

    updateHUD() {
        document.getElementById('currentLevel').textContent = this.gameState.currentLevel;
        document.getElementById('fuelLevel').textContent = Math.round(this.gameState.fuel);
        document.getElementById('currentScore').textContent = this.gameState.score;
    }

    clearElements(selectors) {
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => el.remove());
        });
    }

    updateMainScreenStats() {
        const highScore = localStorage.getItem('highScore') || 0;
        const highLevel = localStorage.getItem('highLevel') || 1;
        const totalCoins = localStorage.getItem('totalCoins') || 0;
        const achievements = JSON.parse(localStorage.getItem('achievements')) || {};

        document.getElementById('highScore').textContent = highScore;
        document.getElementById('highLevel').textContent = highLevel;
        document.getElementById('totalCoinsCollected').textContent = totalCoins;

        const achievedCount = Object.values(achievements).filter(a => a.achieved).length;
        document.getElementById('achievementsCount').textContent = `${achievedCount}/100`;
    }

    saveGameData() {
        try {
            const gameData = {
                highScore: Math.max(this.gameState.score, parseInt(localStorage.getItem('highScore')) || 0),
                highLevel: Math.max(this.gameState.currentLevel, parseInt(localStorage.getItem('highLevel')) || 1),
                totalCoins: (parseInt(localStorage.getItem('totalCoins')) || 0) + this.gameState.coinsCollected
            };

            localStorage.setItem('highScore', gameData.highScore);
            localStorage.setItem('highLevel', gameData.highLevel);
            localStorage.setItem('totalCoins', gameData.totalCoins);

            this.updateMainScreenStats();
        } catch (error) {
            console.log('خطا در ذخیره‌سازی داده‌ها:', error);
        }
    }

    changeShipColor(color) {
        this.gameState.player.color = color;
        if (this.playerElement) {
            this.playerElement.style.color = color;
        }
    }

    changeBackground(background) {
        this.gameState.background = background;
        const gameWorld = document.getElementById('gameWorld');
        
        const backgrounds = {
            'space': 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
            'nebula': 'linear-gradient(180deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
            'galaxy': 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            'starfield': 'linear-gradient(180deg, #000000 0%, #434343 100%)',
            'cosmic': 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)'
        };

        gameWorld.style.background = backgrounds[background] || backgrounds.space;
    }

    toggleSound() {
        const muted = this.audio.toggleMute();
        document.querySelector('.audio-btn').textContent = muted ? '🔇 بی‌صدا' : '🔊 صدا';
    }
}

// ایجاد نمونه بازی
const game = new GalaxyGame();

// توابع عمومی
function startGame() {
    game.startGame();
}

function showAchievements() {
    const achievementsModal = document.getElementById('achievementsModal');
    const achievementGrid = document.getElementById('achievementGrid');
    
    const achievements = JSON.parse(localStorage.getItem('achievements')) || {};
    
    achievementGrid.innerHTML = '';
    
    for (let i = 1; i <= 100; i++) {
        const achievementItem = document.createElement('div');
        achievementItem.className = `achievement-item ${achievements[i] ? '' : 'locked'}`;
        
        const achievementIcon = document.createElement('div');
        achievementIcon.className = 'achievement-icon';
        achievementIcon.innerHTML = achievements[i] ? '🌏' : '🔒';
        
        const achievementText = document.createElement('div');
        const coinsRequired = 100000 + (i-1) * 1000000;
        achievementText.textContent = achievements[i] ? `مدال ${i}` : `${coinsRequired.toLocaleString()} سکه`;
        
        achievementItem.appendChild(achievementIcon);
        achievementItem.appendChild(achievementText);
        achievementGrid.appendChild(achievementItem);
    }
    
    achievementsModal.classList.remove('hidden');
}

function closeAchievements() {
    document.getElementById('achievementsModal').classList.add('hidden');
}

function showInstructions() {
    document.getElementById('instructionsModal').classList.remove('hidden');
}

function closeInstructions() {
    document.getElementById('instructionsModal').classList.add('hidden');
}

function showManagement() {
    document.getElementById('managementModal').classList.remove('hidden');
}

function closeManagement() {
    document.getElementById('managementModal').classList.add('hidden');
}

function showSettings() {
    const settingsModal = document.getElementById('settingsModal');
    const colorOptions = document.getElementById('colorOptions');
    const backgroundOptions = document.getElementById('backgroundOptions');
    
    // ایجاد گزینه‌های رنگ
    colorOptions.innerHTML = '';
    game.shipColors.forEach((color) => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option ${color === game.gameState.player.color ? 'selected' : ''}`;
        colorOption.style.background = color;
        colorOption.onclick = () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            colorOption.classList.add('selected');
            game.changeShipColor(color);
        };
        colorOptions.appendChild(colorOption);
    });
    
    // ایجاد گزینه‌های پس‌زمینه
    backgroundOptions.innerHTML = '';
    game.backgrounds.forEach((bg) => {
        const bgOption = document.createElement('div');
        bgOption.className = `background-option ${bg === game.gameState.background ? 'selected' : ''}`;
        bgOption.textContent = bg === 'space' ? 'فضا' : 
                              bg === 'nebula' ? 'سحابی' :
                              bg === 'galaxy' ? 'کهکشان' :
                              bg === 'starfield' ? 'ستاره' : 'کیهانی';
        bgOption.onclick = () => {
            document.querySelectorAll('.background-option').forEach(opt => opt.classList.remove('selected'));
            bgOption.classList.add('selected');
            game.changeBackground(bg);
        };
        
        backgroundOptions.appendChild(bgOption);
    });
    
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
    game.saveGameData();
}

// مدیریت دکمه مرحله بعد
document.getElementById('nextLevelButton').addEventListener('click', () => {
    document.getElementById('levelComplete').classList.remove('show');
    
    game.showLoadingScreen(() => {
        game.gameState.currentLevel++;
        game.resetGameState();
        game.createCoins();
        game.createEnemies();
        game.gameState.running = true;
        game.gameLoop();
    });
});

// مقداردهی اولیه
window.addEventListener('load', () => {
    game.updateMainScreenStats();
});
