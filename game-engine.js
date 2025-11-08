// موتور اصلی بازی - Game Engine
class CosmicGameEngine {
    static init() {
        this.gameState = {
            running: false,
            score: 0,
            level: 1,
            fuel: 100,
            coinsCollected: 0,
            coinsNeeded: 20,
            bombCooldown: 0,
            bombAvailable: true,
            safeTime: 0,
            isSafeTime: false,
            player: {
                x: 0,
                y: 0,
                size: 80,
                rotation: 0
            },
            coins: [],
            enemies: [],
            playerPath: [],
            fuelConsumption: 0,
            enemySpawnTimer: 0
        };
        
        this.uiElements = {
            scoreDisplay: document.getElementById('scoreDisplay'),
            levelDisplay: document.getElementById('levelDisplay'),
            fuelDisplay: document.getElementById('fuelDisplay'),
            bombDisplay: document.getElementById('bombDisplay'),
            safeTimeDisplay: document.getElementById('safeTimeDisplay'),
            bombButton: document.getElementById('bombButton'),
            playerIndicator: document.getElementById('playerIndicator'),
            levelComplete: document.getElementById('levelComplete'),
            completedLevel: document.getElementById('completedLevel')
        };
        
        this.loadGameData();
        this.setupControls();
    }
    
    static start() {
        this.gameState.running = true;
        this.resetGameState();
        CosmicRenderer.initScene();
        AudioManager.playBackgroundMusic();
        
        this.gameLoop();
    }
    
    static resetGameState() {
        this.gameState.score = 0;
        this.gameState.level = parseInt(localStorage.getItem('highLevel')) || 1;
        this.gameState.fuel = 100;
        this.gameState.coinsCollected = 0;
        this.gameState.coinsNeeded = Math.min(20, 5 + this.gameState.level);
        this.gameState.bombCooldown = 0;
        this.gameState.bombAvailable = true;
        this.gameState.safeTime = 0;
        this.gameState.isSafeTime = false;
        this.gameState.playerPath = [];
        this.gameState.fuelConsumption = 0;
        this.gameState.enemySpawnTimer = 0;
        
        this.gameState.player.x = window.innerWidth / 2;
        this.gameState.player.y = window.innerHeight / 2;
        
        this.uiElements.bombButton.disabled = false;
        
        this.updateUI();
        CosmicRenderer.createPlayer();
        this.createCoins();
    }
    
    static gameLoop() {
        if (!this.gameState.running) return;
        
        this.gameState.playerPath.push({ 
            x: this.gameState.player.x, 
            y: this.gameState.player.y 
        });
        
        if (this.gameState.playerPath.length > 50) {
            this.gameState.playerPath.shift();
        }
        
        this.updateBombTimer();
        this.updateSafeTime();
        this.updateFuelConsumption();
        this.updateEnemySpawning();
        
        if (!this.gameState.isSafeTime) {
            this.updateEnemies();
        }
        
        this.checkCollisions();
        CosmicRenderer.renderFrame(this.gameState);
        
        this.updateUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    static updateBombTimer() {
        if (this.gameState.bombCooldown > 0) {
            this.gameState.bombCooldown--;
            this.uiElements.bombDisplay.textContent = `💣 بمب کیهانی: ${Math.ceil(this.gameState.bombCooldown/60)}s`;
            this.uiElements.bombButton.disabled = true;
        } else {
            this.uiElements.bombDisplay.textContent = `💣 بمب کیهانی: آماده!`;
            this.uiElements.bombButton.disabled = false;
            this.gameState.bombAvailable = true;
        }
    }
    
    static updateSafeTime() {
        if (this.gameState.isSafeTime && this.gameState.safeTime > 0) {
            this.gameState.safeTime--;
            this.uiElements.safeTimeDisplay.textContent = `🛡️ میدان محافظ: ${Math.ceil(this.gameState.safeTime/60)}s`;
            
            if (this.gameState.safeTime <= 0) {
                this.gameState.isSafeTime = false;
                this.uiElements.safeTimeDisplay.textContent = `🛡️ میدان محافظ: غیرفعال`;
            }
        }
    }
    
    static updateFuelConsumption() {
        this.gameState.fuelConsumption++;
        if (this.gameState.fuelConsumption >= 60) {
            this.gameState.fuelConsumption = 0;
            this.gameState.fuel = Math.max(0, this.gameState.fuel - 0.5);
            
            if (this.gameState.fuel <= 0) {
                this.gameOver();
            }
        }
    }
    
    static updateEnemySpawning() {
        this.gameState.enemySpawnTimer++;
        
        const spawnInterval = Math.max(60, 180 - this.gameState.level * 2);
        
        if (this.gameState.enemySpawnTimer >= spawnInterval + Math.random() * 60) {
            this.gameState.enemySpawnTimer = 0;
            this.spawnEnemyGroup();
        }
    }
    
    static spawnEnemyGroup() {
        const maxEnemies = 7;
        if (this.gameState.enemies.length >= maxEnemies) return;
        
        let enemyCount;
        if (this.gameState.level >= 70) {
            enemyCount = 7;
        } else if (this.gameState.level >= 50) {
            enemyCount = Math.min(5 + Math.floor(Math.random() * 3), maxEnemies - this.gameState.enemies.length);
        } else if (this.gameState.level >= 30) {
            enemyCount = Math.min(3 + Math.floor(Math.random() * 3), maxEnemies - this.gameState.enemies.length);
        } else {
            enemyCount = Math.min(1 + Math.floor(Math.random() * 4), maxEnemies - this.gameState.enemies.length);
        }
        
        const attackTypes = ['horizontal', 'vertical', 'diagonal', 'surround', 'wave'];
        const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
        
        switch(attackType) {
            case 'horizontal':
                this.spawnHorizontalAttack(enemyCount);
                break;
            case 'vertical':
                this.spawnVerticalAttack(enemyCount);
                break;
            case 'diagonal':
                this.spawnDiagonalAttack(enemyCount);
                break;
            case 'surround':
                this.spawnSurroundAttack(enemyCount);
                break;
            case 'wave':
                this.spawnWaveAttack(enemyCount);
                break;
        }
    }
    
    static spawnHorizontalAttack(count) {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.spawnSingleEnemy(side, i, count);
            }, i * 200);
        }
    }
    
    static spawnVerticalAttack(count) {
        const side = Math.random() > 0.5 ? 'top' : 'bottom';
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.spawnSingleEnemy(side, i, count);
            }, i * 200);
        }
    }
    
    static spawnDiagonalAttack(count) {
        const sides = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        for (let i = 0; i < count; i++) {
            const side = sides[Math.floor(Math.random() * sides.length)];
            setTimeout(() => {
                this.spawnSingleEnemy(side, i, count);
            }, i * 150);
        }
    }
    
    static spawnSurroundAttack(count) {
        const sides = ['top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
        for (let i = 0; i < count; i++) {
            const side = sides[Math.floor(Math.random() * sides.length)];
            setTimeout(() => {
                this.spawnSingleEnemy(side, i, count);
            }, i * 100);
        }
    }
    
    static spawnWaveAttack(count) {
        const waveCount = Math.min(3, count);
        for (let wave = 0; wave < waveCount; wave++) {
            setTimeout(() => {
                const waveEnemies = Math.min(2 + wave, count);
                for (let i = 0; i < waveEnemies; i++) {
                    const sides = ['top', 'right', 'bottom', 'left'];
                    const side = sides[Math.floor(Math.random() * sides.length)];
                    this.spawnSingleEnemy(side, i, waveEnemies);
                }
            }, wave * 500);
        }
    }
    
    static spawnSingleEnemy(direction, index, groupSize) {
        if (this.gameState.enemies.length >= 7) return;
        
        let startX, startY, targetX, targetY;
        const baseSpeed = 1 + this.gameState.level * 0.15;
        
        switch(direction) {
            case 'top':
                startX = Math.random() * window.innerWidth;
                startY = -50;
                targetX = Math.random() * window.innerWidth;
                targetY = window.innerHeight + 50;
                break;
            case 'bottom':
                startX = Math.random() * window.innerWidth;
                startY = window.innerHeight + 50;
                targetX = Math.random() * window.innerWidth;
                targetY = -50;
                break;
            case 'left':
                startX = -50;
                startY = Math.random() * window.innerHeight;
                targetX = window.innerWidth + 50;
                targetY = Math.random() * window.innerHeight;
                break;
            case 'right':
                startX = window.innerWidth + 50;
                startY = Math.random() * window.innerHeight;
                targetX = -50;
                targetY = Math.random() * window.innerHeight;
                break;
            case 'top-left':
                startX = -50;
                startY = -50;
                targetX = window.innerWidth + 50;
                targetY = window.innerHeight + 50;
                break;
            case 'top-right':
                startX = window.innerWidth + 50;
                startY = -50;
                targetX = -50;
                targetY = window.innerHeight + 50;
                break;
            case 'bottom-left':
                startX = -50;
                startY = window.innerHeight + 50;
                targetX = window.innerWidth + 50;
                targetY = -50;
                break;
            case 'bottom-right':
                startX = window.innerWidth + 50;
                startY = window.innerHeight + 50;
                targetX = -50;
                targetY = -50;
                break;
        }
        
        const enemy = {
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: targetY,
            speed: baseSpeed + Math.random() * 0.5,
            direction: direction,
            type: 'volcano'
        };
        
        this.gameState.enemies.push(enemy);
        CosmicRenderer.createEnemy(enemy);
    }
    
    static updateEnemies() {
        for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameState.enemies[i];
            
            const dx = enemy.targetX - enemy.x;
            const dy = enemy.targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            if (distance < 10 || 
                enemy.x < -100 || enemy.x > window.innerWidth + 100 ||
                enemy.y < -100 || enemy.y > window.innerHeight + 100) {
                this.gameState.enemies.splice(i, 1);
                CosmicRenderer.removeEnemy(enemy);
            }
        }
    }
    
    static createCoins() {
        this.gameState.coins = [];
        
        for (let i = 0; i < this.gameState.coinsNeeded; i++) {
            this.createSingleCoin();
        }
    }
    
    static createSingleCoin() {
        const x = Math.random() * (window.innerWidth - 80) + 40;
        const y = Math.random() * (window.innerHeight - 80) + 40;
        const hitsRequired = this.gameState.level + 2;
        
        const coin = {
            x: x,
            y: y,
            collected: false,
            hitsNeeded: hitsRequired,
            currentHits: 0,
            type: 'planet'
        };
        
        this.gameState.coins.push(coin);
        CosmicRenderer.createCoin(coin);
    }
    
    static checkCollisions() {
        // برخورد با سکه‌ها
        this.gameState.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(this.gameState.player.x - coin.x, 2) + 
                    Math.pow(this.gameState.player.y - coin.y, 2)
                );
                
                if (distance < this.gameState.player.size/2 + 22) {
                    coin.currentHits++;
                    
                    CosmicRenderer.createHitEffect(coin.x, coin.y);
                    
                    if (coin.currentHits >= coin.hitsNeeded) {
                        coin.collected = true;
                        this.gameState.coinsCollected++;
                        this.gameState.score += 10 * this.gameState.level;
                        
                        this.gameState.fuel = Math.min(100, this.gameState.fuel + 10);
                        
                        CosmicRenderer.createCollectEffect(coin.x, coin.y);
                        AudioManager.playCoinSound();
                        
                        if (this.gameState.coinsCollected >= this.gameState.coinsNeeded) {
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
                
                if (distance < 50) {
                    this.restartCurrentLevel();
                }
            });
        }
    }
    
    static useBomb() {
        if (!this.gameState.bombAvailable) return;
        
        this.gameState.bombAvailable = false;
        this.gameState.bombCooldown = 10 * 60;
        
        this.gameState.isSafeTime = true;
        this.gameState.safeTime = 5 * 60;
        
        CosmicRenderer.createBombExplosion(this.gameState.player.x, this.gameState.player.y);
        AudioManager.playBombSound();
        
        this.gameState.enemies.forEach(enemy => {
            CosmicRenderer.createEnemyExplosion(enemy.x, enemy.y);
        });
        
        this.gameState.enemies = [];
        CosmicRenderer.clearEnemies();
    }
    
    static completeLevel() {
        this.gameState.running = false;
        
        this.saveGameData();
        
        CosmicRenderer.createLevelCompleteEffects(this.gameState.player.x, this.gameState.player.y);
        AudioManager.playLevelCompleteSound();
        
        setTimeout(() => {
            this.uiElements.completedLevel.textContent = this.gameState.level;
            this.uiElements.levelComplete.classList.add('show');
        }, 1000);
    }
    
    static restartCurrentLevel() {
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
            this.uiElements.bombButton.disabled = false;
            
            this.gameState.player.x = window.innerWidth / 2;
            this.gameState.player.y = window.innerHeight / 2;
            
            this.gameState.coins = [];
            this.gameState.enemies = [];
            
            CosmicRenderer.clearScene();
            this.createCoins();
            
            this.gameState.running = true;
            this.gameLoop();
        }, 1500);
    }
    
    static gameOver() {
        this.gameState.running = false;
        AudioManager.stopBackgroundMusic();
        
        this.saveGameData();
        
        setTimeout(() => {
            document.getElementById('mainScreen').classList.remove('hidden');
            document.getElementById('hud').classList.add('hidden');
            document.getElementById('bombButton').classList.add('hidden');
            document.querySelector('.touch-controls').classList.add('hidden');
            this.uiElements.levelComplete.classList.remove('show');
            
            this.gameState.coins = [];
            this.gameState.enemies = [];
            this.gameState.playerPath = [];
            
            CosmicRenderer.clearScene();
            this.updateMainScreenStats();
        }, 2000);
    }
    
    static nextLevel() {
        this.gameState.level++;
        this.gameState.coinsCollected = 0;
        this.gameState.coinsNeeded = Math.min(20, 5 + this.gameState.level);
        this.gameState.playerPath = [];
        this.gameState.fuel = 100;
        
        this.gameState.coins = [];
        this.gameState.enemies = [];
        
        CosmicRenderer.clearScene();
        this.createCoins();
        
        this.gameState.running = true;
        this.gameLoop();
    }
    
    static updateUI() {
        this.uiElements.scoreDisplay.textContent = `امتیاز: ${this.gameState.score}`;
        this.uiElements.levelDisplay.textContent = `مرحله: ${this.gameState.level}`;
        
        this.uiElements.fuelDisplay.textContent = `⛽ انرژی: ${Math.round(this.gameState.fuel)}%`;
        
        if (this.gameState.fuel < 20) {
            this.uiElements.fuelDisplay.style.color = '#ff4444';
        } else if (this.gameState.fuel < 50) {
            this.uiElements.fuelDisplay.style.color = '#ffaa00';
        } else {
            this.uiElements.fuelDisplay.style.color = '#00ff88';
        }
    }
    
    static setupControls() {
        // کنترل موس
        document.addEventListener('mousemove', (e) => {
            if (this.gameState.running && !this.isTouching) {
                this.gameState.player.x = e.clientX;
                this.gameState.player.y = e.clientY;
            }
        });
        
        // کنترل لمسی
        document.addEventListener('touchmove', (e) => {
            if (this.gameState.running && !this.isTouching) {
                e.preventDefault();
                const touch = e.touches[0];
                this.gameState.player.x = touch.clientX;
                this.gameState.player.y = touch.clientY;
            }
        }, { passive: false });
        
        // کنترل جویستیک لمسی
        this.setupTouchJoystick();
    }
    
    static setupTouchJoystick() {
        const joystick = document.querySelector('.joystick');
        const joystickHandle = document.querySelector('.joystick-handle');
        
        let isTouching = false;
        let joystickBaseX = 0;
        let joystickBaseY = 0;
        const joystickRadius = 40;
        
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isTouching = true;
            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();
            joystickBaseX = rect.left + rect.width / 2;
            joystickBaseY = rect.top + rect.height / 2;
            this.isTouching = true;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isTouching || !this.gameState.running) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - joystickBaseX;
            const deltaY = touch.clientY - joystickBaseY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);
            
            const limitedDistance = Math.min(distance, joystickRadius);
            const newX = limitedDistance * Math.cos(angle);
            const newY = limitedDistance * Math.sin(angle);
            
            joystickHandle.style.transform = `translate(${newX}px, ${newY}px)`;
            
            if (distance > 10) {
                const speed = 12;
                this.gameState.player.x += Math.cos(angle) * speed;
                this.gameState.player.y += Math.sin(angle) * speed;
                
                this.gameState.player.x = Math.max(this.gameState.player.size/2, Math.min(window.innerWidth - this.gameState.player.size/2, this.gameState.player.x));
                this.gameState.player.y = Math.max(this.gameState.player.size/2, Math.min(window.innerHeight - this.gameState.player.size/2, this.gameState.player.y));
            }
        });
        
        document.addEventListener('touchend', () => {
            isTouching = false;
            this.isTouching = false;
            joystickHandle.style.transform = 'translate(0, 0)';
        });
    }
    
    static loadGameData() {
        try {
            const highScore = localStorage.getItem('highScore') || 0;
            const highLevel = localStorage.getItem('highLevel') || 1;
            const totalCoins = localStorage.getItem('totalCoins') || 0;
            const achievements = JSON.parse(localStorage.getItem('achievements')) || {};
            
            document.getElementById('highScore').textContent = highScore;
            document.getElementById('highLevel').textContent = highLevel;
            document.getElementById('totalCoinsCollected').textContent = totalCoins;
            
            const achievedCount = Object.values(achievements).filter(a => a.achieved).length;
            document.getElementById('achievementsCount').textContent = `${achievedCount}/100`;
        } catch (error) {
            console.log('خطا در بارگذاری داده‌ها:', error);
        }
    }
    
    static saveGameData() {
        try {
            const gameData = {
                highScore: Math.max(this.gameState.score, parseInt(localStorage.getItem('highScore')) || 0),
                highLevel: Math.max(this.gameState.level, parseInt(localStorage.getItem('highLevel')) || 1),
                totalCoins: (parseInt(localStorage.getItem('totalCoins')) || 0) + this.gameState.coinsCollected,
                achievements: JSON.parse(localStorage.getItem('achievements')) || {}
            };
            
            this.checkAchievements();
            
            localStorage.setItem('highScore', gameData.highScore);
            localStorage.setItem('highLevel', gameData.highLevel);
            localStorage.setItem('totalCoins', gameData.totalCoins);
            localStorage.setItem('achievements', JSON.stringify(gameData.achievements));
            
            this.updateMainScreenStats();
        } catch (error) {
            console.log('خطا در ذخیره‌سازی داده‌ها:', error);
        }
    }
    
    static checkAchievements() {
        try {
            const achievements = JSON.parse(localStorage.getItem('achievements')) || {};
            
            if (this.gameState.level > 0 && !achievements[this.gameState.level]) {
                achievements[this.gameState.level] = { 
                    achieved: true, 
                    date: new Date().toLocaleDateString('fa-IR') 
                };
            }
            
            const scoreMilestones = [100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
            scoreMilestones.forEach(milestone => {
                if (this.gameState.score >= milestone && !achievements[`score_${milestone}`]) {
                    achievements[`score_${milestone}`] = { 
                        achieved: true, 
                        date: new Date().toLocaleDateString('fa-IR') 
                    };
                }
            });
            
            localStorage.setItem('achievements', JSON.stringify(achievements));
        } catch (error) {
            console.log('خطا در بررسی مدال‌ها:', error);
        }
    }
    
    static updateMainScreenStats() {
        this.loadGameData();
    }
}

// ایجاد نمونه جهانی از موتور بازی
window.CosmicGameEngine = CosmicGameEngine;
