// موتور اصلی بازی کهکشانی
class CosmicEngine {
    static init() {
        console.log('🚀 راه‌اندازی موتور بازی کهکشانی...');
        
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
                x: 0, y: 0, size: 80, rotation: 0,
                velocityX: 0, velocityY: 0,
                maxSpeed: 15, acceleration: 0.8, friction: 0.92,
                trail: [], maxTrailLength: 50,
                collectedPlanets: [],
                attractionForce: 0.05, spiralRadius: 100, spiralSpeed: 0.02
            },
            centralPlanets: [],
            totalCentralPlanets: 20,
            enemies: [],
            maxEnemies: 7,
            enemySpawnTimer: 0,
            enemySpawnInterval: 180,
            fuelConsumption: 0,
            fuelConsumptionRate: 60,
            galaxy: {
                centerX: 0, centerY: 0, rotation: 0, rotationSpeed: 0.001,
                spiralArms: 4, armWidth: 100, stars: []
            },
            effects: [], particles: []
        };
        
        this.setupGameSize();
        this.setupControls();
        console.log('✅ موتور بازی راه‌اندازی شد');
    }
    
    static setupGameSize() {
        this.gameState.galaxy.centerX = window.innerWidth / 2;
        this.gameState.galaxy.centerY = window.innerHeight / 2;
        this.gameState.player.x = this.gameState.galaxy.centerX;
        this.gameState.player.y = this.gameState.galaxy.centerY;
    }
    
    static startGame() {
        console.log('🎮 شروع بازی جدید...');
        
        // پنهان کردن صفحه اصلی و نمایش لودینگ
        document.getElementById('mainScreen').classList.add('hidden');
        
        if (window.showLoadingScreen) {
            window.showLoadingScreen(() => {
                this.startGameCore();
            });
        } else {
            this.startGameCore();
        }
    }
    
    static startGameCore() {
        this.resetGameState();
        this.createCentralPlanets();
        this.createGalaxy();
        
        this.gameState.running = true;
        this.gameLoop();
        
        console.log('✅ بازی شروع شد');
    }
    
    static resetGameState() {
        this.gameState.score = 0;
        this.gameState.level = 1;
        this.gameState.fuel = 100;
        this.gameState.coinsCollected = 0;
        this.gameState.coinsNeeded = 20;
        this.gameState.bombCooldown = 0;
        this.gameState.bombAvailable = true;
        this.gameState.safeTime = 0;
        this.gameState.isSafeTime = false;
        
        this.gameState.player.x = this.gameState.galaxy.centerX;
        this.gameState.player.y = this.gameState.galaxy.centerY;
        this.gameState.player.velocityX = 0;
        this.gameState.player.velocityY = 0;
        this.gameState.player.rotation = 0;
        this.gameState.player.trail = [];
        this.gameState.player.collectedPlanets = [];
        
        this.gameState.enemies = [];
        this.gameState.enemySpawnTimer = 0;
        this.gameState.effects = [];
        this.gameState.particles = [];
        this.gameState.fuelConsumption = 0;
    }
    
    static createCentralPlanets() {
        this.gameState.centralPlanets = [];
        const centerX = this.gameState.galaxy.centerX;
        const centerY = this.gameState.galaxy.centerY;
        const radius = 200;
        
        for (let i = 0; i < this.gameState.totalCentralPlanets; i++) {
            const angle = (i / this.gameState.totalCentralPlanets) * Math.PI * 2;
            const distance = radius + Math.random() * 50 - 25;
            
            const planet = {
                id: i,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                size: 35 + Math.random() * 10,
                baseSize: 35 + Math.random() * 10,
                collected: false,
                hitsNeeded: this.gameState.level + 2,
                currentHits: 0,
                angle: angle, distance: distance,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                pulse: 0, pulseSpeed: 0.05 + Math.random() * 0.03,
                color: this.getPlanetColor(i),
                glowIntensity: 0.5 + Math.random() * 0.5
            };
            
            this.gameState.centralPlanets.push(planet);
        }
    }
    
    static getPlanetColor(index) {
        const colors = [
            { r: 255, g: 200, b: 50 }, { r: 100, g: 200, b: 255 },
            { r: 255, g: 100, b: 100 }, { r: 100, g: 255, b: 150 },
            { r: 200, g: 100, b: 255 }
        ];
        return colors[index % colors.length];
    }
    
    static createGalaxy() {
        this.gameState.galaxy.stars = [];
        const starCount = 200;
        
        for (let i = 0; i < starCount; i++) {
            const arm = Math.floor(Math.random() * this.gameState.galaxy.spiralArms);
            const distance = 50 + Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.8);
            const angle = (arm / this.gameState.galaxy.spiralArms) * Math.PI * 2 + 
                         (distance / 200) * Math.PI + Math.random() * 0.5 - 0.25;
            
            const star = {
                x: this.gameState.galaxy.centerX + Math.cos(angle) * distance,
                y: this.gameState.galaxy.centerY + Math.sin(angle) * distance,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2,
                distance: distance, angle: angle, arm: arm
            };
            
            this.gameState.galaxy.stars.push(star);
        }
    }
    
    static gameLoop() {
        if (!this.gameState.running) return;
        
        this.updateGameState();
        this.checkCollisions();
        
        if (window.CinematicRenderer) {
            CinematicRenderer.render(this.gameState);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    static updateGameState() {
        this.updatePlayer();
        this.updateCentralPlanets();
        this.updateGalaxy();
        this.updateEnemies();
        this.updateBombSystem();
        this.updateFuelSystem();
        this.spawnEnemies();
    }
    
    static updatePlayer() {
        const player = this.gameState.player;
        const centerX = this.gameState.galaxy.centerX;
        const centerY = this.gameState.galaxy.centerY;
        
        // جاذبه به مرکز
        const dx = centerX - player.x;
        const dy = centerY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 100) {
            const force = player.attractionForce * (distance / 500);
            player.velocityX += (dx / distance) * force;
            player.velocityY += (dy / distance) * force;
        }
        
        // اعمال اصطکاک و محدودیت سرعت
        player.velocityX *= player.friction;
        player.velocityY *= player.friction;
        
        const speed = Math.sqrt(player.velocityX * player.velocityX + player.velocityY * player.velocityY);
        if (speed > player.maxSpeed) {
            player.velocityX = (player.velocityX / speed) * player.maxSpeed;
            player.velocityY = (player.velocityY / speed) * player.maxSpeed;
        }
        
        // به روز رسانی موقعیت
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // چرخش
        if (speed > 0.5) {
            player.rotation = Math.atan2(player.velocityY, player.velocityX);
        }
        
        // مسیر حرکت
        player.trail.push({ x: player.x, y: player.y });
        if (player.trail.length > player.maxTrailLength) {
            player.trail.shift();
        }
        
        // سیاره‌های جمع‌آوری شده
        this.updateCollectedPlanets();
    }
    
    static updateCollectedPlanets() {
        const player = this.gameState.player;
        const collectedPlanets = player.collectedPlanets;
        
        for (let i = 0; i < collectedPlanets.length; i++) {
            const planet = collectedPlanets[i];
            const angle = player.rotation + (i / collectedPlanets.length) * Math.PI * 2;
            
            const spiralRadius = player.spiralRadius + i * 15;
            planet.targetX = player.x + Math.cos(angle) * spiralRadius;
            planet.targetY = player.y + Math.sin(angle) * spiralRadius;
            
            const dx = planet.targetX - planet.x;
            const dy = planet.targetY - planet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 5) {
                planet.x += (dx / dist) * 8;
                planet.y += (dy / dist) * 8;
            }
            
            planet.rotation += planet.rotationSpeed;
            planet.pulse += planet.pulseSpeed;
        }
    }
    
    static updateCentralPlanets() {
        this.gameState.centralPlanets.forEach(planet => {
            if (!planet.collected) {
                planet.rotation += planet.rotationSpeed;
                planet.pulse += planet.pulseSpeed;
                planet.size = planet.baseSize + Math.sin(planet.pulse) * 3;
            }
        });
    }
    
    static updateGalaxy() {
        this.gameState.galaxy.rotation += this.gameState.galaxy.rotationSpeed;
    }
    
    static updateEnemies() {
        for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameState.enemies[i];
            
            const dx = enemy.targetX - enemy.x;
            const dy = enemy.targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            if (distance < 10 || enemy.x < -100 || enemy.x > window.innerWidth + 100 ||
                enemy.y < -100 || enemy.y > window.innerHeight + 100) {
                this.gameState.enemies.splice(i, 1);
            }
        }
    }
    
    static updateBombSystem() {
        if (this.gameState.bombCooldown > 0) {
            this.gameState.bombCooldown--;
            this.gameState.bombAvailable = false;
        } else {
            this.gameState.bombAvailable = true;
        }
        
        if (this.gameState.isSafeTime) {
            this.gameState.safeTime--;
            if (this.gameState.safeTime <= 0) {
                this.gameState.isSafeTime = false;
            }
        }
    }
    
    static updateFuelSystem() {
        this.gameState.fuelConsumption++;
        if (this.gameState.fuelConsumption >= this.gameState.fuelConsumptionRate) {
            this.gameState.fuelConsumption = 0;
            this.gameState.fuel = Math.max(0, this.gameState.fuel - 1);
            
            if (this.gameState.fuel <= 0) {
                this.gameOver();
            }
        }
    }
    
    static spawnEnemies() {
        if (this.gameState.enemies.length >= this.gameState.maxEnemies) return;
        
        this.gameState.enemySpawnTimer++;
        if (this.gameState.enemySpawnTimer >= this.gameState.enemySpawnInterval) {
            this.gameState.enemySpawnTimer = 0;
            this.createEnemy();
        }
    }
    
    static createEnemy() {
        const side = Math.floor(Math.random() * 4);
        let startX, startY;
        
        const padding = 100;
        const centerX = this.gameState.galaxy.centerX;
        const centerY = this.gameState.galaxy.centerY;
        
        switch(side) {
            case 0: startX = Math.random() * window.innerWidth; startY = -padding; break;
            case 1: startX = window.innerWidth + padding; startY = Math.random() * window.innerHeight; break;
            case 2: startX = Math.random() * window.innerWidth; startY = window.innerHeight + padding; break;
            case 3: startX = -padding; startY = Math.random() * window.innerHeight; break;
        }
        
        const enemy = {
            x: startX, y: startY,
            targetX: centerX + (Math.random() - 0.5) * 400,
            targetY: centerY + (Math.random() - 0.5) * 400,
            size: 40 + Math.random() * 20,
            baseSize: 40 + Math.random() * 20,
            speed: 1 + (this.gameState.level * 0.1) + Math.random() * 0.5,
            color: { r: 255, g: 50, b: 0 }
        };
        
        this.gameState.enemies.push(enemy);
    }
    
    static checkCollisions() {
        this.checkPlayerPlanetCollisions();
        if (!this.gameState.isSafeTime) {
            this.checkPlayerEnemyCollisions();
        }
    }
    
    static checkPlayerPlanetCollisions() {
        const player = this.gameState.player;
        
        for (let i = 0; i < this.gameState.centralPlanets.length; i++) {
            const planet = this.gameState.centralPlanets[i];
            
            if (!planet.collected) {
                const dx = player.x - planet.x;
                const dy = player.y - planet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionDistance = player.size / 2 + planet.size / 2;
                
                if (distance < collisionDistance) {
                    this.handlePlanetCollision(planet);
                }
            }
        }
    }
    
    static handlePlanetCollision(planet) {
        planet.currentHits++;
        
        if (planet.currentHits >= planet.hitsNeeded) {
            planet.collected = true;
            this.gameState.coinsCollected++;
            this.gameState.score += 10 * this.gameState.level;
            this.gameState.fuel = Math.min(100, this.gameState.fuel + 15);
            
            const collectedPlanet = {...planet};
            this.gameState.player.collectedPlanets.push(collectedPlanet);
            
            if (this.gameState.coinsCollected >= this.gameState.coinsNeeded) {
                this.completeLevel();
            }
        }
    }
    
    static checkPlayerEnemyCollisions() {
        const player = this.gameState.player;
        
        for (let i = 0; i < this.gameState.enemies.length; i++) {
            const enemy = this.gameState.enemies[i];
            
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const collisionDistance = player.size / 2 + enemy.size / 2;
            
            if (distance < collisionDistance) {
                this.handleEnemyCollision(enemy);
            }
        }
    }
    
    static handleEnemyCollision(enemy) {
        const index = this.gameState.enemies.indexOf(enemy);
        if (index > -1) {
            this.gameState.enemies.splice(index, 1);
        }
        
        this.gameState.fuel = Math.max(0, this.gameState.fuel - 20);
        
        if (this.gameState.fuel <= 0) {
            this.gameOver();
        }
    }
    
    static completeLevel() {
        this.gameState.running = false;
        
        setTimeout(() => {
            alert(`تبریک! مرحله ${this.gameState.level} تکمیل شد!`);
            this.nextLevel();
        }, 1000);
    }
    
    static gameOver() {
        this.gameState.running = false;
        
        setTimeout(() => {
            alert('بازی تمام شد! انرژی شما به پایان رسید.');
            document.getElementById('mainScreen').classList.remove('hidden');
        }, 1000);
    }
    
    static nextLevel() {
        this.gameState.level++;
        this.gameState.coinsCollected = 0;
        this.gameState.player.collectedPlanets = [];
        this.gameState.fuel = 100;
        
        this.gameState.centralPlanets = [];
        this.createCentralPlanets();
        
        this.gameState.running = true;
        this.gameLoop();
    }
    
    static setupControls() {
        document.addEventListener('mousemove', (e) => {
            if (!this.gameState.running) return;
            
            const player = this.gameState.player;
            const dx = e.clientX - player.x;
            const dy = e.clientY - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                const force = Math.min(1, distance / 100) * player.acceleration;
                player.velocityX += (dx / distance) * force;
                player.velocityY += (dy / distance) * force;
            }
        });
    }
}

// ایجاد نمونه جهانی
window.CosmicEngine = CosmicEngine;
