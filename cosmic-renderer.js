// رندرر گرافیکی سه‌بعدی و کهکشانی
class CosmicRenderer {
    static init() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameContainer = document.getElementById('gameContainer');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1';
        
        this.gameContainer.appendChild(this.canvas);
        
        this.scene = {
            stars: [],
            nebulae: [],
            planets: [],
            effects: []
        };
        
        this.initCosmicScene();
        this.setupResizeHandler();
    }
    
    static initScene() {
        this.clearScene();
        this.createPlayer();
    }
    
    static initCosmicScene() {
        // ایجاد ستاره‌های پس‌زمینه
        this.createBackgroundStars();
        
        // ایجاد سحابی‌ها
        this.createNebulae();
        
        // ایجاد کهکشان‌های دور
        this.createDistantGalaxies();
    }
    
    static createBackgroundStars() {
        this.scene.stars = [];
        const starCount = 500;
        
        for (let i = 0; i < starCount; i++) {
            this.scene.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.05 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    static createNebulae() {
        this.scene.nebulae = [];
        const nebulaCount = 8;
        
        for (let i = 0; i < nebulaCount; i++) {
            this.scene.nebulae.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 100 + Math.random() * 300,
                color: this.getRandomNebulaColor(),
                opacity: 0.05 + Math.random() * 0.1,
                pulseSpeed: Math.random() * 0.002 + 0.001,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    static createDistantGalaxies() {
        this.scene.galaxies = [];
        const galaxyCount = 5;
        
        for (let i = 0; i < galaxyCount; i++) {
            this.scene.galaxies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 20 + Math.random() * 50,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.002,
                brightness: 0.3 + Math.random() * 0.4
            });
        }
    }
    
    static getRandomNebulaColor() {
        const colors = [
            {r: 100, g: 50, b: 255},   // بنفش
            {r: 255, g: 50, b: 100},   // قرمز
            {r: 50, g: 150, b: 255},   // آبی
            {r: 50, g: 255, b: 150},   // سبز
            {r: 255, g: 200, b: 50},   // زرد
            {r: 255, g: 100, b: 255},  // صورتی
            {r: 100, g: 255, b: 255},  // فیروزه‌ای
            {r: 255, g: 150, b: 50}    // نارنجی
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    static createPlayer() {
        this.player = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            size: 80,
            rotation: 0,
            trail: []
        };
    }
    
    static createCoin(coin) {
        // سکه‌ها در رندر اصلی ایجاد می‌شوند
    }
    
    static createEnemy(enemy) {
        // دشمنان در رندر اصلی ایجاد می‌شوند
    }
    
    static removeEnemy(enemy) {
        // حذف دشمن از رندر
    }
    
    static clearScene() {
        this.scene.effects = [];
    }
    
    static clearEnemies() {
        // پاک کردن تمام دشمنان
    }
    
    static renderFrame(gameState) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderCosmicBackground();
        this.renderPlayer(gameState.player, gameState.playerPath);
        this.renderCoins(gameState.coins);
        this.renderEnemies(gameState.enemies);
        this.renderEffects();
    }
    
    static renderCosmicBackground() {
        const time = Date.now() * 0.001;
        
        // رندر سحابی‌ها
        this.scene.nebulae.forEach(nebula => {
            const pulse = Math.sin(time * nebula.pulseSpeed + nebula.pulseOffset) * 0.5 + 0.5;
            const currentOpacity = nebula.opacity * (0.7 + pulse * 0.3);
            
            const gradient = this.ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            
            gradient.addColorStop(0, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${currentOpacity})`);
            gradient.addColorStop(1, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // رندر کهکشان‌های دور
        this.scene.galaxies.forEach(galaxy => {
            galaxy.rotation += galaxy.rotationSpeed;
            
            this.ctx.save();
            this.ctx.translate(galaxy.x, galaxy.y);
            this.ctx.rotate(galaxy.rotation);
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${galaxy.brightness})`);
            gradient.addColorStop(0.7, `rgba(200, 200, 255, ${galaxy.brightness * 0.5})`);
            gradient.addColorStop(1, 'rgba(100, 100, 200, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, galaxy.size, galaxy.size * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // بازوهای کهکشان
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(
                    Math.cos(angle) * galaxy.size * 1.5,
                    Math.sin(angle) * galaxy.size * 1.5 * 0.3
                );
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${galaxy.brightness * 0.7})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
        
        // رندر ستاره‌ها
        this.scene.stars.forEach(star => {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
            const brightness = star.brightness * twinkle;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    static renderPlayer(player, playerPath) {
        // رندر مسیر حرکت
        if (playerPath.length > 1) {
            this.ctx.strokeStyle = 'rgba(0, 204, 255, 0.3)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(playerPath[0].x, playerPath[0].y);
            
            for (let i = 1; i < playerPath.length; i++) {
                this.ctx.lineTo(playerPath[i].x, playerPath[i].y);
            }
            
            this.ctx.stroke();
        }
        
        // رندر خود بازیکن
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        
        // محاسبه چرخش بر اساس مسیر حرکت
        if (playerPath.length > 1) {
            const currentPos = playerPath[playerPath.length - 1];
            const prevPos = playerPath[playerPath.length - 2] || currentPos;
            const dx = currentPos.x - prevPos.x;
            const dy = currentPos.y - prevPos.y;
            player.rotation = Math.atan2(dy, dx);
            this.ctx.rotate(player.rotation);
        }
        
        // بدنه اصلی فضاپیما
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, player.size/2);
        gradient.addColorStop(0, '#00ccff');
        gradient.addColorStop(0.7, '#0066ff');
        gradient.addColorStop(1, '#003366');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, player.size/2, player.size/3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // کابین خلبان
        this.ctx.fillStyle = 'rgba(200, 240, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, player.size/4, player.size/6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // بال‌ها
        this.ctx.fillStyle = '#0066ff';
        this.ctx.beginPath();
        this.ctx.ellipse(-player.size/3, 0, player.size/6, player.size/4, 0, 0, Math.PI * 2);
        this.ctx.ellipse(player.size/3, 0, player.size/6, player.size/4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // موتورها و افکت‌های نور
        const time = Date.now() * 0.01;
        const pulse = Math.sin(time) * 0.5 + 0.5;
        
        const engineGradient = this.ctx.createLinearGradient(-player.size/2, 0, -player.size, 0);
        engineGradient.addColorStop(0, `rgba(255, 100, 0, ${0.3 + pulse * 0.3})`);
        engineGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
        
        this.ctx.fillStyle = engineGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(-player.size/2, -player.size/6);
        this.ctx.lineTo(-player.size, -player.size/8);
        this.ctx.lineTo(-player.size, player.size/8);
        this.ctx.lineTo(-player.size/2, player.size/6);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
        
        // هاله نورانی دور فضاپیما
        const glowGradient = this.ctx.createRadialGradient(
            player.x, player.y, 0,
            player.x, player.y, player.size
        );
        glowGradient.addColorStop(0, 'rgba(0, 204, 255, 0.5)');
        glowGradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    static renderCoins(coins) {
        coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.save();
                this.ctx.translate(coin.x, coin.y);
                
                // سیاره اصلی
                const planetGradient = this.ctx.createRadialGradient(-10, -10, 0, 0, 0, 22);
                planetGradient.addColorStop(0, '#ffcc00');
                planetGradient.addColorStop(0.7, '#ff9900');
                planetGradient.addColorStop(1, '#cc6600');
                
                this.ctx.fillStyle = planetGradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 22, 0, Math.PI * 2);
                this.ctx.fill();
                
                // حلقه دور سیاره
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // هاله نورانی
                const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
                glowGradient.addColorStop(0, 'rgba(255, 204, 0, 0.3)');
                glowGradient.addColorStop(1, 'rgba(255, 153, 0, 0)');
                
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 40, 0, Math.PI * 2);
                this.ctx.fill();
                
                // نمایش تعداد ضربه‌های لازم
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(coin.hitsNeeded - coin.currentHits, 0, 0);
                
                this.ctx.restore();
            }
        });
    }
    
    static renderEnemies(enemies) {
        enemies.forEach(enemy => {
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            
            // آتشفشان اصلی
            const volcanoGradient = this.ctx.createRadialGradient(-5, -5, 0, 0, 0, 25);
            volcanoGradient.addColorStop(0, '#ff3300');
            volcanoGradient.addColorStop(0.7, '#cc2200');
            volcanoGradient.addColorStop(1, '#991100');
            
            this.ctx.fillStyle = volcanoGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
            this.ctx.fill();
            
            // گدازه‌ها
            const time = Date.now() * 0.01;
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2 + time * 0.1;
                const length = 15 + Math.sin(time + i) * 5;
                
                this.ctx.strokeStyle = `rgba(255, 100, 0, 0.8)`;
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
                this.ctx.stroke();
            }
            
            // هاله نورانی قرمز
            const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
            glowGradient.addColorStop(0, 'rgba(255, 50, 0, 0.4)');
            glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 40, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    static renderEffects() {
        // رندر تمام افکت‌های فعال
        for (let i = this.scene.effects.length - 1; i >= 0; i--) {
            const effect = this.scene.effects[i];
            effect.update();
            effect.render(this.ctx);
            
            if (effect.isFinished) {
                this.scene.effects.splice(i, 1);
            }
        }
    }
    
    static createHitEffect(x, y) {
        this.scene.effects.push(new HitEffect(x, y));
    }
    
    static createCollectEffect(x, y) {
        this.scene.effects.push(new CollectEffect(x, y));
    }
    
    static createBombExplosion(x, y) {
        this.scene.effects.push(new BombExplosionEffect(x, y));
    }
    
    static createEnemyExplosion(x, y) {
        this.scene.effects.push(new EnemyExplosionEffect(x, y));
    }
    
    static createLevelCompleteEffects(x, y) {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.scene.effects.push(new LevelCompleteEffect(
                    x + Math.random() * 100 - 50,
                    y + Math.random() * 100 - 50
                ));
            }, i * 100);
        }
    }
    
    static setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.initCosmicScene();
        });
    }
}

// کلاس‌های افکت‌های مختلف
class HitEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.maxLife = 1;
        this.size = 10;
        this.color = '#00ff88';
    }
    
    update() {
        this.life -= 0.05;
        this.size += 2;
        
        if (this.life <= 0) {
            this.isFinished = true;
        }
    }
    
    render(ctx) {
        const alpha = this.life;
        const size = this.size;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

class CollectEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.maxLife = 1;
        this.size = 20;
        this.particles = [];
        
        // ایجاد ذرات
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                angle: (i / 8) * Math.PI * 2,
                distance: 0,
                speed: 2 + Math.random() * 2,
                size: 5 + Math.random() * 10
            });
        }
    }
    
    update() {
        this.life -= 0.02;
        this.size += 3;
        
        this.particles.forEach(particle => {
            particle.distance += particle.speed;
        });
        
        if (this.life <= 0) {
            this.isFinished = true;
        }
    }
    
    render(ctx) {
        const alpha = this.life;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // ذرات
        this.particles.forEach(particle => {
            const x = Math.cos(particle.angle) * particle.distance;
            const y = Math.sin(particle.angle) * particle.distance;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.size);
            gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 200, 0, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // مرکز اثر
        const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        centerGradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
        centerGradient.addColorStop(1, `rgba(255, 200, 0, 0)`);
        
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class BombExplosionEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.maxLife = 1;
        this.radius = 0;
        this.maxRadius = 300;
    }
    
    update() {
        this.life -= 0.03;
        this.radius = this.maxRadius * (1 - this.life);
        
        if (this.life <= 0) {
            this.isFinished = true;
        }
    }
    
    render(ctx) {
        const alpha = this.life * 0.7;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class EnemyExplosionEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.maxLife = 1;
        this.radius = 0;
        this.maxRadius = 100;
    }
    
    update() {
        this.life -= 0.05;
        this.radius = this.maxRadius * (1 - this.life);
        
        if (this.life <= 0) {
            this.isFinished = true;
        }
    }
    
    render(ctx) {
        const alpha = this.life * 0.8;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `rgba(255, 100, 0, ${alpha})`);
        gradient.addColorStop(0.7, `rgba(255, 50, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class LevelCompleteEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 1;
        this.maxLife = 1;
        this.size = 10;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
    }
    
    update() {
        this.life -= 0.02;
        this.size += 2;
        this.rotation += this.rotationSpeed;
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.life <= 0) {
            this.isFinished = true;
        }
    }
    
    render(ctx) {
        const alpha = this.life;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(0, 255, 136, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 200, 100, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// ایجاد نمونه جهانی از رندرر
window.CosmicRenderer = CosmicRenderer;
