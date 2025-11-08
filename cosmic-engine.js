// موتور اصلی بازی کهکشانی سینمایی
class CosmicEngine {
    static init() {
        console.log('🚀 راه‌اندازی موتور بازی کهکشانی...');
        
        // وضعیت اصلی بازی
        this.gameState = {
            // وضعیت بازی
            running: false,
            paused: false,
            gameOver: false,
            
            // آمار بازی
            score: 0,
            level: 1,
            fuel: 100,
            maxFuel: 100,
            coinsCollected: 0,
            coinsNeeded: 20,
            totalCoinsCollected: 0,
            
            // سیستم بمب
            bombCooldown: 0,
            bombAvailable: true,
            bombMaxCooldown: 600, // 10 ثانیه
            
            // سیستم امنیت
            safeTime: 0,
            isSafeTime: false,
            safeTimeDuration: 300, // 5 ثانیه
            
            // بازیکن
            player: {
                x: 0,
                y: 0,
                size: 80,
                rotation: 0,
                velocityX: 0,
                velocityY: 0,
                maxSpeed: 15,
                acceleration: 0.8,
                friction: 0.92,
                trail: [],
                maxTrailLength: 50,
                collectedPlanets: [],
                maxCollectedPlanets: 20,
                attractionForce: 0.05, // نیروی جاذبه به مرکز
                spiralRadius: 100, // شعاع مارپیچ سیاره‌ها
                spiralSpeed: 0.02 // سرعت چرخش مارپیچ
            },
            
            // سیاره‌های مرکزی
            centralPlanets: [],
            totalCentralPlanets: 20,
            
            // دشمنان
            enemies: [],
            maxEnemies: 7,
            enemySpawnTimer: 0,
            enemySpawnInterval: 180, // 3 ثانیه
            
            // مصرف سوخت
            fuelConsumption: 0,
            fuelConsumptionRate: 60, // هر 1 ثانیه
            
            // کهکشان
            galaxy: {
                centerX: 0,
                centerY: 0,
                rotation: 0,
                rotationSpeed: 0.001,
                spiralArms: 4,
                armWidth: 100,
                stars: []
            },
            
            // افکت‌ها
            effects: [],
            particles: [],
            
            // کنترل لمسی
            touchControls: {
                active: false,
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
                joystickBaseX: 0,
                joystickBaseY: 0,
                joystickRadius: 40
            }
        };
        
        // بارگذاری داده‌های ذخیره شده
        this.loadGameData();
        
        // راه‌اندازی کنترل‌ها
        this.setupControls();
        
        // تنظیم اندازه بازی
        this.setupGameSize();
        
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
        
        // پخش موسیقی پس‌زمینه
        AudioSystem.playBackgroundMusic();
        
        // پنهان کردن صفحه اصلی
        CosmicUI.hideMainScreen();
        
        // نمایش رابط بازی
        CosmicUI.showGameHUD();
        
        // بازنشانی وضعیت بازی
        this.resetGameState();
        
        // ایجاد سیاره‌های مرکزی
        this.createCentralPlanets();
        
        // ایجاد کهکشان
        this.createGalaxy();
        
        // شروع حلقه بازی
        this.gameState.running = true;
        this.gameLoop();
        
        // نمایش نشانگر بازیکن
        CosmicUI.showPlayerIndicator('🛸 کنترل فضاپیما فعال شد!');
        
        console.log('✅ بازی شروع شد');
    }
    
    static resetGameState() {
        console.log('🔄 بازنشانی وضعیت بازی...');
        
        // بازنشانی آمار
        this.gameState.score = 0;
        this.gameState.level = parseInt(localStorage.getItem('cosmicHighLevel')) || 1;
        this.gameState.fuel = 100;
        this.gameState.coinsCollected = 0;
        this.gameState.coinsNeeded = 20;
        this.gameState.gameOver = false;
        
        // بازنشانی سیستم بمب
        this.gameState.bombCooldown = 0;
        this.gameState.bombAvailable = true;
        this.gameState.safeTime = 0;
        this.gameState.isSafeTime = false;
        
        // بازنشانی بازیکن
        this.gameState.player.x = this.gameState.galaxy.centerX;
        this.gameState.player.y = this.gameState.galaxy.centerY;
        this.gameState.player.velocityX = 0;
        this.gameState.player.velocityY = 0;
        this.gameState.player.rotation = 0;
        this.gameState.player.trail = [];
        this.gameState.player.collectedPlanets = [];
        this.gameState.player.spiralRadius = 100;
        
        // بازنشانی دشمنان
        this.gameState.enemies = [];
        this.gameState.enemySpawnTimer = 0;
        
        // بازنشانی افکت‌ها
        this.gameState.effects = [];
        this.gameState.particles = [];
        
        // بازنشانی مصرف سوخت
        this.gameState.fuelConsumption = 0;
        
        console.log('✅ وضعیت بازی بازنشانی شد');
    }
    
    static createCentralPlanets() {
        console.log('🪐 ایجاد سیاره‌های مرکزی...');
        
        this.gameState.centralPlanets = [];
        const centerX = this.gameState.galaxy.centerX;
        const centerY = this.gameState.galaxy.centerY;
        const radius = 200; // شعاع دایره سیاره‌ها
        
        for (let i = 0; i < this.gameState.totalCentralPlanets; i++) {
            const angle = (i / this.gameState.totalCentralPlanets) * Math.PI * 2;
            const distance = radius + Math.random() * 50 - 25; // کمی تغییر در فاصله
            
            const planet = {
                id: i,
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                size: 35 + Math.random() * 10,
                baseSize: 35 + Math.random() * 10,
                collected: false,
                hitsNeeded: this.gameState.level + 2,
                currentHits: 0,
                angle: angle,
                distance: distance,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                pulse: 0,
                pulseSpeed: 0.05 + Math.random() * 0.03,
                color: this.getPlanetColor(i),
                glowIntensity: 0.5 + Math.random() * 0.5,
                type: this.getPlanetType(i)
            };
            
            this.gameState.centralPlanets.push(planet);
        }
        
        console.log(`✅ ${this.gameState.centralPlanets.length} سیاره مرکزی ایجاد شد`);
    }
    
    static getPlanetColor(index) {
        const colors = [
            { r: 255, g: 200, b: 50 },   // طلایی
            { r: 100, g: 200, b: 255 },   // آبی
            { r: 255, g: 100, b: 100 },   // قرمز
            { r: 100, g: 255, b: 150 },   // سبز
            { r: 200, g: 100, b: 255 },   // بنفش
            { r: 255, g: 150, b: 50 },    // نارنجی
            { r: 50, g: 255, b: 200 },    // فیروزه‌ای
            { r: 255, g: 100, b: 200 },   // صورتی
            { r: 200, g: 255, b: 100 },   // زرد-سبز
            { r: 100, g: 150, b: 255 },   // آبی روشن
            { r: 255, g: 200, b: 100 },   // زرد
            { r: 150, g: 100, b: 255 },   // بنفش تیره
            { r: 100, g: 255, b: 255 },   // آبی-سبز
            { r: 255, g: 100, b: 100 },   // قرمز روشن
            { r: 200, g: 200, b: 100 },   // زرد-خاکستری
            { r: 100, g: 200, b: 200 },   // سبز-آبی
            { r: 255, g: 150, b: 150 },   // صورتی روشن
            { r: 150, g: 255, b: 150 },   // سبز روشن
            { r: 150, g: 150, b: 255 },   // آبی خاکستری
            { r: 255, g: 255, b: 150 }    // زرد روشن
        ];
        
        return colors[index % colors.length];
    }
    
    static getPlanetType(index) {
        const types = [
            'terrestrial', 'gas_giant', 'ice_giant', 'lava', 'ocean',
            'desert', 'forest', 'arctic', 'volcanic', 'crystal',
            'metallic', 'organic', 'toxic', 'radioactive', 'paradise',
            'barren', 'ringed', 'binary', 'moon', 'artificial'
        ];
        
        return types[index % types.length];
    }
    
    static createGalaxy() {
        console.log('🌌 ایجاد کهکشان...');
        
        this.gameState.galaxy.stars = [];
        const starCount = 500;
        
        for (let i = 0; i < starCount; i++) {
            // توزیع ستاره‌ها در بازوهای مارپیچ
            const arm = Math.floor(Math.random() * this.gameState.galaxy.spiralArms);
            const distance = 50 + Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.8);
            const angle = (arm / this.gameState.galaxy.spiralArms) * Math.PI * 2 + 
                         (distance / 200) * Math.PI + 
                         Math.random() * 0.5 - 0.25;
            
            const star = {
                x: this.gameState.galaxy.centerX + Math.cos(angle) * distance,
                y: this.gameState.galaxy.centerY + Math.sin(angle) * distance,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2,
                distance: distance,
                angle: angle,
                arm: arm
            };
            
            this.gameState.galaxy.stars.push(star);
        }
        
        console.log(`✅ کهکشان با ${this.gameState.galaxy.stars.length} ستاره ایجاد شد`);
    }
    
    static gameLoop() {
        if (!this.gameState.running || this.gameState.paused) return;
        
        // به روز رسانی وضعیت بازی
        this.updateGameState();
        
        // بررسی برخوردها
        this.checkCollisions();
        
        // رندر کردن صحنه
        CinematicRenderer.render(this.gameState);
        
        // به روز رسانی رابط کاربری
        CosmicUI.updateHUD(this.gameState);
        
        // درخواست فریم بعدی
        requestAnimationFrame(() => this.gameLoop());
    }
    
    static updateGameState() {
        const deltaTime = 1; // برای سادگی
        
        // به روز رسانی موقعیت بازیکن
        this.updatePlayer(deltaTime);
        
        // به روز رسانی سیاره‌های مرکزی
        this.updateCentralPlanets(deltaTime);
        
        // به روز رسانی کهکشان
        this.updateGalaxy(deltaTime);
        
        // به روز رسانی دشمنان
        this.updateEnemies(deltaTime);
        
        // به روز رسانی افکت‌ها
        this.updateEffects(deltaTime);
        
        // به روز رسانی ذرات
        this.updateParticles(deltaTime);
        
        // به روز رسانی سیستم بمب
        this.updateBombSystem(deltaTime);
        
        // به روز رسانی سیستم سوخت
        this.updateFuelSystem(deltaTime);
        
        // تولید دشمنان جدید
        this.spawnEnemies(deltaTime);
    }
    
    static updatePlayer(deltaTime) {
        const player = this.gameState.player;
        const centerX = this.gameState.galaxy.centerX;
        const centerY = this.gameState.galaxy.centerY;
        
        // اعمال جاذبه به مرکز کهکشان
        const dx = centerX - player.x;
        const dy = centerY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 100) {
            const force = player.attractionForce * (distance / 500);
            player.velocityX += (dx / distance) * force;
            player.velocityY += (dy / distance) * force;
        }
        
        // اعمال اصطکاک
        player.velocityX *= player.friction;
        player.velocityY *= player.friction;
        
        // محدود کردن سرعت
        const speed = Math.sqrt(player.velocityX * player.velocityX + player.velocityY * player.velocityY);
        if (speed > player.maxSpeed) {
            player.velocityX = (player.velocityX / speed) * player.maxSpeed;
            player.velocityY = (player.velocityY / speed) * player.maxSpeed;
        }
        
        // به روز رسانی موقعیت
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // به روز رسانی چرخش
        if (speed > 0.5) {
            player.rotation = Math.atan2(player.velocityY, player.velocityX);
        }
        
        // اضافه کردن به مسیر حرکت
        player.trail.push({ x: player.x, y: player.y });
        if (player.trail.length > player.maxTrailLength) {
            player.trail.shift();
        }
        
        // به روز رسانی سیاره‌های جمع‌آوری شده (مارپیچ)
        this.updateCollectedPlanets(deltaTime);
    }
    
    static updateCollectedPlanets(deltaTime) {
        const player = this.gameState.player;
        const collectedPlanets = player.collectedPlanets;
        
        for (let i = 0; i < collectedPlanets.length; i++) {
            const planet = collectedPlanets[i];
            const angle = player.rotation + (i / collectedPlanets.length) * Math.PI * 2 + 
                         this.gameState.time * player.spiralSpeed;
            
            // محاسبه موقعیت در مارپیچ
            const spiralRadius = player.spiralRadius + i * 15;
            planet.targetX = player.x + Math.cos(angle) * spiralRadius;
            planet.targetY = player.y + Math.sin(angle) * spiralRadius;
            
            // حرکت نرم به سمت موقعیت هدف
            const dx = planet.targetX - planet.x;
            const dy = planet.targetY - planet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                planet.x += (dx / distance) * 8;
                planet.y += (dy / distance) * 8;
            } else {
                planet.x = planet.targetX;
                planet.y = planet.targetY;
            }
            
            // چرخش سیاره
            planet.rotation += planet.rotationSpeed;
            planet.pulse += planet.pulseSpeed;
        }
    }
    
    static updateCentralPlanets(deltaTime) {
        this.gameState.centralPlanets.forEach(planet => {
            if (!planet.collected) {
                // چرخش سیاره
                planet.rotation += planet.rotationSpeed;
                
                // پالس سیاره
                planet.pulse += planet.pulseSpeed;
                planet.size = planet.baseSize + Math.sin(planet.pulse) * 3;
                
                // حرکت جزئی در مدار
                planet.angle += 0.001;
                planet.x = this.gameState.galaxy.centerX + Math.cos(planet.angle) * planet.distance;
                planet.y = this.gameState.galaxy.centerY + Math.sin(planet.angle) * planet.distance;
            }
        });
    }
    
    static updateGalaxy(deltaTime) {
        // چرخش کهکشان
        this.gameState.galaxy.rotation += this.gameState.galaxy.rotationSpeed;
        
        // به روز رسانی ستاره‌ها
        this.gameState.galaxy.stars.forEach(star => {
            star.twinkleOffset += star.twinkleSpeed;
            star.brightness = 0.2 + Math.sin(star.twinkleOffset) * 0.3 + 0.3;
        });
    }
    
    static updateEnemies(deltaTime) {
        for (let i = this.gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = this.gameState.enemies[i];
            
            // حرکت به سمت هدف
            const dx = enemy.targetX - enemy.x;
            const dy = enemy.targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // چرخش
            enemy.rotation += enemy.rotationSpeed;
            
            // پالس
            enemy.pulse += enemy.pulseSpeed;
            enemy.size = enemy.baseSize + Math.sin(enemy.pulse) * 5;
            
            // بررسی خروج از صفحه
            if (distance < 10 || 
                enemy.x < -100 || enemy.x > window.innerWidth + 100 ||
                enemy.y < -100 || enemy.y > window.innerHeight + 100) {
                this.gameState.enemies.splice(i, 1);
            }
        }
    }
    
    static updateEffects(deltaTime) {
        for (let i = this.gameState.effects.length - 1; i >= 0; i--) {
            const effect = this.gameState.effects[i];
            effect.life -= effect.decayRate;
            
            if (effect.life <= 0) {
                this.gameState.effects.splice(i, 1);
            } else {
                // به روز رسانی موقعیت افکت
                effect.x += effect.velocityX;
                effect.y += effect.velocityY;
                effect.rotation += effect.rotationSpeed;
                effect.scale = effect.baseScale * effect.life;
            }
        }
    }
    
    static updateParticles(deltaTime) {
        for (let i = this.gameState.particles.length - 1; i >= 0; i--) {
            const particle = this.gameState.particles[i];
            particle.life -= particle.decayRate;
            
            if (particle.life <= 0) {
                this.gameState.particles.splice(i, 1);
            } else {
                // به روز رسانی موقعیت ذره
                particle.x += particle.velocityX;
                particle.y += particle.velocityY;
                particle.velocityX *= particle.friction;
                particle.velocityY *= particle.friction;
                particle.rotation += particle.rotationSpeed;
                particle.size = particle.baseSize * particle.life;
            }
        }
    }
    
    static updateBombSystem(deltaTime) {
        // به روز رسانی زمان سرد شدن بمب
        if (this.gameState.bombCooldown > 0) {
            this.gameState.bombCooldown--;
            this.gameState.bombAvailable = false;
        } else {
            this.gameState.bombAvailable = true;
        }
        
        // به روز رسانی زمان امن
        if (this.gameState.isSafeTime) {
            this.gameState.safeTime--;
            
            if (this.gameState.safeTime <= 0) {
                this.gameState.isSafeTime = false;
                CosmicUI.showMessage('🛡️ میدان محافظ غیرفعال شد', '#00ccff');
            }
        }
    }
    
    static updateFuelSystem(deltaTime) {
        // مصرف سوخت
        this.gameState.fuelConsumption++;
        
        if (this.gameState.fuelConsumption >= this.gameState.fuelConsumptionRate) {
            this.gameState.fuelConsumption = 0;
            this.gameState.fuel = Math.max(0, this.gameState.fuel - 1);
            
            // هشدار سوخت کم
            if (this.gameState.fuel <= 20 && this.gameState.fuel > 0) {
                CosmicUI.showMessage('⚠️ سوخت در حال اتمام است!', '#ffaa00');
            }
            
            // پایان بازی به دلیل اتمام سوخت
            if (this.gameState.fuel <= 0) {
                this.gameOver('⛽ سوخت شما تمام شد!');
            }
        }
    }
    
    static spawnEnemies(deltaTime) {
        if (this.gameState.enemies.length >= this.gameState.maxEnemies) return;
        
        this.gameState.enemySpawnTimer++;
        
        if (this.gameState.enemySpawnTimer >= this.gameState.enemySpawnInterval) {
            this.gameState.enemySpawnTimer = 0;
            this.createEnemy();
        }
    }
    
    static createEnemy() {
        const enemyTypes = ['volcano', 'asteroid', 'comet', 'black_hole', 'nebula'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        // انتخاب لبه تصادفی برای ظهور
        const side = Math.floor(Math.random() * 4);
        let startX, startY, targetX, targetY;
        
        const padding = 100;
        const centerX = this.gameState.galaxy.centerX;
        const centerY = this.gameState.galaxy.centerY;
        
        switch(side) {
            case 0: // بالا
                startX = Math.random() * window.innerWidth;
                startY = -padding;
                targetX = centerX + (Math.random() - 0.5) * 400;
                targetY = centerY + (Math.random() - 0.5) * 400;
                break;
            case 1: // راست
                startX = window.innerWidth + padding;
                startY = Math.random() * window.innerHeight;
                targetX = centerX + (Math.random() - 0.5) * 400;
                targetY = centerY + (Math.random() - 0.5) * 400;
                break;
            case 2: // پایین
                startX = Math.random() * window.innerWidth;
                startY = window.innerHeight + padding;
                targetX = centerX + (Math.random() - 0.5) * 400;
                targetY = centerY + (Math.random() - 0.5) * 400;
                break;
            case 3: // چپ
                startX = -padding;
                startY = Math.random() * window.innerHeight;
                targetX = centerX + (Math.random() - 0.5) * 400;
                targetY = centerY + (Math.random() - 0.5) * 400;
                break;
        }
        
        const baseSpeed = 1 + (this.gameState.level * 0.1);
        const speed = baseSpeed + Math.random() * 0.5;
        
        const enemy = {
            id: Date.now() + Math.random(),
            type: type,
            x: startX,
            y: startY,
            targetX: targetX,
            targetY: targetY,
            size: 40 + Math.random() * 20,
            baseSize: 40 + Math.random() * 20,
            speed: speed,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            pulse: 0,
            pulseSpeed: 0.03 + Math.random() * 0.02,
            color: this.getEnemyColor(type),
            glowIntensity: 0.7 + Math.random() * 0.3
        };
        
        this.gameState.enemies.push(enemy);
        
        // افکت ظهور دشمن
        this.createSpawnEffect(startX, startY, enemy.color);
    }
    
    static getEnemyColor(type) {
        switch(type) {
            case 'volcano':
                return { r: 255, g: 50, b: 0 };
            case 'asteroid':
                return { r: 150, g: 150, b: 150 };
            case 'comet':
                return { r: 200, g: 200, b: 255 };
            case 'black_hole':
                return { r: 0, g: 0, b: 0 };
            case 'nebula':
                return { r: 100, g: 50, b: 200 };
            default:
                return { r: 255, g: 0, b: 0 };
        }
    }
    
    static createSpawnEffect(x, y, color) {
        const effect = {
            type: 'spawn',
            x: x,
            y: y,
            life: 1,
            decayRate: 0.05,
            scale: 1,
            baseScale: 1,
            rotation: 0,
            rotationSpeed: 0.1,
            color: color
        };
        
        this.gameState.effects.push(effect);
        
        // ایجاد ذرات
        for (let i = 0; i < 20; i++) {
            this.createParticle(
                x, y,
                color,
                Math.random() * 4 - 2,
                Math.random() * 4 - 2,
                10 + Math.random() * 10
            );
        }
    }
    
    static createParticle(x, y, color, velocityX, velocityY, life) {
        const particle = {
            x: x,
            y: y,
            velocityX: velocityX,
            velocityY: velocityY,
            life: life,
            decayRate: 1 / (life * 2),
            size: 3 + Math.random() * 4,
            baseSize: 3 + Math.random() * 4,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            friction: 0.95,
            color: color
        };
        
        this.gameState.particles.push(particle);
    }
    
    static checkCollisions() {
        this.checkPlayerPlanetCollisions();
        this.checkPlayerEnemyCollisions();
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
        
        // افکت برخورد
        this.createHitEffect(planet.x, planet.y, planet.color);
        AudioSystem.playSound('hit');
        
        // بررسی کامل شدن سیاره
        if (planet.currentHits >= planet.hitsNeeded) {
            this.collectPlanet(planet);
        }
    }
    
    static collectPlanet(planet) {
        planet.collected = true;
        this.gameState.coinsCollected++;
        this.gameState.totalCoinsCollected++;
        this.gameState.score += 10 * this.gameState.level;
        
        // افزایش سوخت
        this.gameState.fuel = Math.min(this.gameState.maxFuel, this.gameState.fuel + 15);
        
        // اضافه کردن سیاره به دنباله بازیکن
        const collectedPlanet = {
            ...planet,
            x: planet.x,
            y: planet.y,
            targetX: planet.x,
            targetY: planet.y
        };
        
        this.gameState.player.collectedPlanets.push(collectedPlanet);
        
        // افکت جمع‌آوری
        this.createCollectEffect(planet.x, planet.y, planet.color);
        AudioSystem.playSound('collect');
        
        CosmicUI.showMessage(`🌌 سیاره ${planet.id + 1} فعال شد!`, '#00ff88');
        
        // بررسی پایان مرحله
        if (this.gameState.coinsCollected >= this.gameState.coinsNeeded) {
            this.completeLevel();
        }
    }
    
    static checkPlayerEnemyCollisions() {
        if (this.gameState.isSafeTime) return;
        
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
        // افکت برخورد
        this.createExplosionEffect(enemy.x, enemy.y, enemy.color);
        AudioSystem.playSound('explosion');
        
        // حذف دشمن
        const index = this.gameState.enemies.indexOf(enemy);
        if (index > -1) {
            this.gameState.enemies.splice(index, 1);
        }
        
        // کاهش سوخت
        this.gameState.fuel = Math.max(0, this.gameState.fuel - 20);
        
        // بررسی بازی تمام شده
        if (this.gameState.fuel <= 0) {
            this.gameOver('💥 برخورد با سیاره کیهانی!');
        } else {
            CosmicUI.showMessage('💥 برخورد! سوخت کاهش یافت', '#ff4444');
        }
    }
    
    static createHitEffect(x, y, color) {
        const effect = {
            type: 'hit',
            x: x,
            y: y,
            life: 1,
            decayRate: 0.1,
            scale: 1,
            baseScale: 1,
            rotation: 0,
            rotationSpeed: 0.2,
            color: color
        };
        
        this.gameState.effects.push(effect);
        
        // ایجاد ذرات
        for (let i = 0; i < 8; i++) {
            this.createParticle(
                x, y,
                color,
                Math.random() * 6 - 3,
                Math.random() * 6 - 3,
                15 + Math.random() * 10
            );
        }
    }
    
    static createCollectEffect(x, y, color) {
        const effect = {
            type: 'collect',
            x: x,
            y: y,
            life: 1,
            decayRate: 0.05,
            scale: 1,
            baseScale: 1,
            rotation: 0,
            rotationSpeed: 0.1,
            color: color
        };
        
        this.gameState.effects.push(effect);
        
        // ایجاد ذرات
        for (let i = 0; i < 15; i++) {
            this.createParticle(
                x, y,
                color,
                Math.random() * 8 - 4,
                Math.random() * 8 - 4,
                20 + Math.random() * 15
            );
        }
    }
    
    static createExplosionEffect(x, y, color) {
        const effect = {
            type: 'explosion',
            x: x,
            y: y,
            life: 1,
            decayRate: 0.03,
            scale: 1,
            baseScale: 1,
            rotation: 0,
            rotationSpeed: 0.15,
            color: color
        };
        
        this.gameState.effects.push(effect);
        
        // ایجاد ذرات انفجار
        for (let i = 0; i < 25; i++) {
            this.createParticle(
                x, y,
                color,
                Math.random() * 12 - 6,
                Math.random() * 12 - 6,
                25 + Math.random() * 20
            );
        }
    }
    
    static completeLevel() {
        console.log(`🎉 تکمیل مرحله ${this.gameState.level}`);
        
        this.gameState.running = false;
        
        // ذخیره داده‌ها
        this.saveGameData();
        
        // پخش صدای پیروزی
        AudioSystem.playSound('level_complete');
        
        // نمایش صفحه تکمیل مرحله
        CosmicUI.showLevelComplete(this.gameState.level, this.gameState.score);
        
        // افزایش سطح
        this.gameState.level++;
        
        console.log(`✅ مرحله ${this.gameState.level - 1} تکمیل شد، رفتن به مرحله ${this.gameState.level}`);
    }
    
    static gameOver(reason) {
        console.log(`💀 بازی تمام شد: ${reason}`);
        
        this.gameState.running = false;
        this.gameState.gameOver = true;
        
        // ذخیره داده‌ها
        this.saveGameData();
        
        // پخش صدای بازی تمام شده
        AudioSystem.playSound('game_over');
        
        // نمایش پیام
        CosmicUI.showMessage(reason, '#ff4444');
        
        // بازگشت به صفحه اصلی پس از تاخیر
        setTimeout(() => {
            CosmicUI.showMainScreen();
            CosmicUI.hideGameHUD();
            CosmicUI.updateMainStats();
        }, 3000);
        
        console.log('✅ بازی تمام شد');
    }
    
    static useBomb() {
        if (!this.gameState.bombAvailable || this.gameState.bombCooldown > 0) {
            CosmicUI.showMessage('💣 بمب آماده نیست!', '#ffaa00');
            return;
        }
        
        console.log('💣 استفاده از بمب کیهانی');
        
        // تنظیم زمان سرد شدن
        this.gameState.bombCooldown = this.gameState.bombMaxCooldown;
        this.gameState.bombAvailable = false;
        
        // فعال کردن زمان امن
        this.gameState.isSafeTime = true;
        this.gameState.safeTime = this.gameState.safeTimeDuration;
        
        // ایجاد افکت بمب
        this.createBombEffect(this.gameState.player.x, this.gameState.player.y);
        
        // نابودی تمام دشمنان
        this.destroyAllEnemies();
        
        // پخش صدا
        AudioSystem.playSound('bomb');
        
        CosmicUI.showMessage('💣 بمب کیهانی فعال شد!', '#00ccff');
        
        console.log('✅ بمب استفاده شد');
    }
    
    static createBombEffect(x, y) {
        const effect = {
            type: 'bomb',
            x: x,
            y: y,
            life: 1,
            decayRate: 0.02,
            scale: 1,
            baseScale: 1,
            rotation: 0,
            rotationSpeed: 0.05,
            color: { r: 255, g: 255, b: 0 }
        };
        
        this.gameState.effects.push(effect);
        
        // ایجاد موج انفجار
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const speed = 8 + Math.random() * 4;
            
            this.createParticle(
                x, y,
                { r: 255, g: 255, b: 0 },
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                30 + Math.random() * 20
            );
        }
    }
    
    static destroyAllEnemies() {
        // ایجاد افکت نابودی برای هر دشمن
        this.gameState.enemies.forEach(enemy => {
            this.createExplosionEffect(enemy.x, enemy.y, enemy.color);
        });
        
        // پاک کردن تمام دشمنان
        this.gameState.enemies = [];
        
        console.log(`✅ ${this.gameState.enemies.length} دشمن نابود شد`);
    }
    
    static nextLevel() {
        console.log(`🚀 رفتن به مرحله ${this.gameState.level}`);
        
        // بازنشانی وضعیت برای مرحله جدید
        this.resetGameState();
        
        // ایجاد سیاره‌های جدید
        this.createCentralPlanets();
        
        // شروع مجدد بازی
        this.gameState.running = true;
        this.gameLoop();
        
        CosmicUI.showMessage(`🌌 کهکشان ${this.gameState.level} کشف شد!`, '#00ff88');
        
        console.log(`✅ مرحله ${this.gameState.level} شروع شد`);
    }
    
    static setupControls() {
        console.log('🎮 راه‌اندازی کنترل‌ها...');
        
        // کنترل موس
        document.addEventListener('mousemove', (e) => {
            if (!this.gameState.running || this.gameState.paused) return;
            
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
        
        // کنترل لمسی
        document.addEventListener('touchmove', (e) => {
            if (!this.gameState.running || this.gameState.paused) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            
            const player = this.gameState.player;
            const dx = touch.clientX - player.x;
            const dy = touch.clientY - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                const force = Math.min(1, distance / 100) * player.acceleration;
                player.velocityX += (dx / distance) * force;
                player.velocityY += (dy / distance) * force;
            }
        }, { passive: false });
        
        // کنترل جویستیک لمسی
        this.setupTouchJoystick();
        
        // کنترل صفحه کلید (برای تست)
        document.addEventListener('keydown', (e) => {
            if (!this.gameState.running) return;
            
            const player = this.gameState.player;
            const force = player.acceleration * 2;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    player.velocityY -= force;
                    break;
                case 'ArrowDown':
                case 's':
                    player.velocityY += force;
                    break;
                case 'ArrowLeft':
                case 'a':
                    player.velocityX -= force;
                    break;
                case 'ArrowRight':
                case 'd':
                    player.velocityX += force;
                    break;
                case ' ':
                    this.useBomb();
                    break;
            }
        });
        
        console.log('✅ کنترل‌ها راه‌اندازی شدند');
    }
    
    static setupTouchJoystick() {
        const joystick = document.querySelector('.joystick');
        const joystickHandle = document.querySelector('.joystick-handle');
        
        if (!joystick || !joystickHandle) return;
        
        let isTouching = false;
        
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isTouching = true;
            this.gameState.touchControls.active = true;
            
            const touch = e.touches[0];
            const rect = joystick.getBoundingClientRect();
            
            this.gameState.touchControls.joystickBaseX = rect.left + rect.width / 2;
            this.gameState.touchControls.joystickBaseY = rect.top + rect.height / 2;
            this.gameState.touchControls.startX = touch.clientX;
            this.gameState.touchControls.startY = touch.clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isTouching || !this.gameState.running) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const controls = this.gameState.touchControls;
            
            const deltaX = touch.clientX - controls.joystickBaseX;
            const deltaY = touch.clientY - controls.joystickBaseY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);
            
            const limitedDistance = Math.min(distance, controls.joystickRadius);
            const newX = limitedDistance * Math.cos(angle);
            const newY = limitedDistance * Math.sin(angle);
            
            // حرکت هندل جویستیک
            joystickHandle.style.transform = `translate(${newX}px, ${newY}px)`;
            
            // کنترل بازیکن
            if (distance > 10) {
                const player = this.gameState.player;
                const force = (limitedDistance / controls.joystickRadius) * player.acceleration;
                
                player.velocityX += Math.cos(angle) * force;
                player.velocityY += Math.sin(angle) * force;
            }
        });
        
        document.addEventListener('touchend', () => {
            isTouching = false;
            this.gameState.touchControls.active = false;
            joystickHandle.style.transform = 'translate(0, 0)';
        });
    }
    
    static loadGameData() {
        try {
            console.log('💾 بارگذاری داده‌های ذخیره شده...');
            
            this.gameState.highScore = parseInt(localStorage.getItem('cosmicHighScore')) || 0;
            this.gameState.highLevel = parseInt(localStorage.getItem('cosmicHighLevel')) || 1;
            this.gameState.totalCoins = parseInt(localStorage.getItem('cosmicTotalCoins')) || 0;
            this.gameState.achievements = JSON.parse(localStorage.getItem('cosmicAchievements')) || {};
            
            console.log('✅ داده‌ها بارگذاری شدند');
        } catch (error) {
            console.error('❌ خطا در بارگذاری داده‌ها:', error);
        }
    }
    
    static saveGameData() {
        try {
            console.log('💾 ذخیره داده‌های بازی...');
            
            // به روز رسانی رکوردها
            this.gameState.highScore = Math.max(this.gameState.highScore, this.gameState.score);
            this.gameState.highLevel = Math.max(this.gameState.highLevel, this.gameState.level);
            this.gameState.totalCoins += this.gameState.coinsCollected;
            
            // ذخیره در localStorage
            localStorage.setItem('cosmicHighScore', this.gameState.highScore);
            localStorage.setItem('cosmicHighLevel', this.gameState.highLevel);
            localStorage.setItem('cosmicTotalCoins', this.gameState.totalCoins);
            localStorage.setItem('cosmicAchievements', JSON.stringify(this.gameState.achievements));
            
            // بررسی دستاوردها
            this.checkAchievements();
            
            console.log('✅ داده‌ها ذخیره شدند');
        } catch (error) {
            console.error('❌ خطا در ذخیره داده‌ها:', error);
        }
    }
    
    static checkAchievements() {
        const achievements = this.gameState.achievements;
        
        // دستاوردهای سطح
        if (this.gameState.level > 0 && !achievements[`level_${this.gameState.level}`]) {
            achievements[`level_${this.gameState.level}`] = {
                achieved: true,
                date: new Date().toLocaleDateString('fa-IR'),
                name: `کشف کهکشان ${this.gameState.level}`
            };
        }
        
        // دستاوردهای امتیاز
        const scoreMilestones = [100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
        scoreMilestones.forEach(milestone => {
            if (this.gameState.score >= milestone && !achievements[`score_${milestone}`]) {
                achievements[`score_${milestone}`] = {
                    achieved: true,
                    date: new Date().toLocaleDateString('fa-IR'),
                    name: `امتیاز ${milestone}`
                };
            }
        });
        
        // دستاوردهای سیاره
        if (this.gameState.totalCoins >= 100 && !achievements.planet_collector) {
            achievements.planet_collector = {
                achieved: true,
                date: new Date().toLocaleDateString('fa-IR'),
                name: 'جمع‌آوری 100 سیاره'
            };
        }
    }
    
    static pauseGame() {
        if (this.gameState.running) {
            this.gameState.paused = true;
            this.gameState.running = false;
            CosmicUI.showMessage('⏸️ بازی متوقف شد', '#ffaa00');
        }
    }
    
    static resumeGame() {
        if (this.gameState.paused) {
            this.gameState.paused = false;
            this.gameState.running = true;
            this.gameLoop();
            CosmicUI.showMessage('▶️ بازی ادامه یافت', '#00ff88');
        }
    }
    
    static togglePause() {
        if (this.gameState.paused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }
}

// ایجاد نمونه جهانی
window.CosmicEngine = CosmicEngine;

// اضافه کردن ویژگی زمان به بازی
CosmicEngine.gameState.time = 0;

// به روز رسانی زمان در هر فریم
const originalGameLoop = CosmicEngine.gameLoop;
CosmicEngine.gameLoop = function() {
    if (this.gameState.running && !this.gameState.paused) {
        this.gameState.time += 0.016; // تقریباً 60 فریم در ثانیه
    }
    return originalGameLoop.call(this);
};

console.log('🌌 موتور بازی کهکشانی سینمایی بارگذاری شد');
