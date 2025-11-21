// m1.js - سیستم ارتقاء سفینه و هوش مصنوعی پیشرفته

class SpaceshipUpgradeSystem {
    constructor() {
        this.upgrades = {
            speed: { level: 1, maxLevel: 10, cost: 100, value: 1 },
            fuelCapacity: { level: 1, maxLevel: 10, cost: 150, value: 100 },
            bombPower: { level: 1, maxLevel: 5, cost: 200, value: 1 },
            shield: { level: 1, maxLevel: 8, cost: 180, value: 0 },
            weapon: { level: 1, maxLevel: 6, cost: 250, value: 1 }
        };
        
        this.spaceshipColors = [
            '#00ccff', '#ff4444', '#00ff88', '#ffaa00', 
            '#aa00ff', '#ff00aa', '#00aaff', '#ffff00'
        ];
        
        this.currentColorIndex = 0;
        this.totalCoins = 0;
        this.unlockedColors = [0];
        this.weapons = ['laser', 'missile', 'plasma'];
        this.currentWeapon = 'laser';
    }
    
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('spaceshipSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.upgrades = settings.upgrades || this.upgrades;
                this.currentColorIndex = settings.currentColorIndex || 0;
                this.unlockedColors = settings.unlockedColors || [0];
                this.totalCoins = settings.totalCoins || 0;
                this.currentWeapon = settings.currentWeapon || 'laser';
            }
        } catch (error) {
            console.error('خطا در بارگذاری تنظیمات:', error);
        }
    }
    
    saveSettings() {
        try {
            const settings = {
                upgrades: this.upgrades,
                currentColorIndex: this.currentColorIndex,
                unlockedColors: this.unlockedColors,
                totalCoins: this.totalCoins,
                currentWeapon: this.currentWeapon
            };
            localStorage.setItem('spaceshipSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('خطا در ذخیره تنظیمات:', error);
        }
    }
    
    upgrade(feature) {
        const upgrade = this.upgrades[feature];
        if (!upgrade || upgrade.level >= upgrade.maxLevel) return false;
        
        const cost = upgrade.cost * upgrade.level;
        if (this.totalCoins < cost) return false;
        
        this.totalCoins -= cost;
        upgrade.level++;
        upgrade.value = this.calculateUpgradeValue(feature, upgrade.level);
        
        this.saveSettings();
        return true;
    }
    
    calculateUpgradeValue(feature, level) {
        switch(feature) {
            case 'speed':
                return 1 + (level - 1) * 0.5;
            case 'fuelCapacity':
                return 100 + (level - 1) * 20;
            case 'bombPower':
                return 1 + (level - 1) * 0.25;
            case 'shield':
                return (level - 1) * 15;
            case 'weapon':
                return 1 + (level - 1) * 0.3;
            default:
                return level;
        }
    }
    
    unlockColor(colorIndex) {
        if (this.unlockedColors.includes(colorIndex)) return true;
        
        const cost = (colorIndex + 1) * 500;
        if (this.totalCoins < cost) return false;
        
        this.totalCoins -= cost;
        this.unlockedColors.push(colorIndex);
        this.saveSettings();
        return true;
    }
    
    changeColor(colorIndex) {
        if (this.unlockedColors.includes(colorIndex)) {
            this.currentColorIndex = colorIndex;
            this.saveSettings();
            return true;
        }
        return false;
    }
    
    changeWeapon(weaponType) {
        if (this.weapons.includes(weaponType)) {
            this.currentWeapon = weaponType;
            this.saveSettings();
            return true;
        }
        return false;
    }
    
    addCoins(amount) {
        this.totalCoins += amount;
        this.saveSettings();
    }
    
    getUpgradeInfo(feature) {
        const upgrade = this.upgrades[feature];
        if (!upgrade) return null;
        
        return {
            level: upgrade.level,
            maxLevel: upgrade.maxLevel,
            cost: upgrade.cost * upgrade.level,
            value: upgrade.value,
            nextValue: this.calculateUpgradeValue(feature, upgrade.level + 1)
        };
    }
    
    getColorInfo() {
        return {
            currentColor: this.spaceshipColors[this.currentColorIndex],
            currentColorIndex: this.currentColorIndex,
            unlockedColors: this.unlockedColors,
            allColors: this.spaceshipColors
        };
    }
    
    getStats() {
        return {
            totalCoins: this.totalCoins,
            upgrades: this.upgrades,
            colorInfo: this.getColorInfo(),
            currentWeapon: this.currentWeapon
        };
    }
}

// سیستم جنگ و مبارزه پیشرفته
class CombatSystem {
    constructor() {
        this.projectiles = [];
        this.enemyProjectiles = [];
        this.combatEffects = [];
        this.lastShotTime = 0;
        this.shotCooldown = 300;
    }
    
    fireWeapon(playerX, playerY, targetX, targetY, weaponType) {
        const now = Date.now();
        if (now - this.lastShotTime < this.shotCooldown) return null;
        
        this.lastShotTime = now;
        
        const projectile = {
            x: playerX,
            y: playerY,
            targetX: targetX,
            targetY: targetY,
            type: weaponType,
            speed: 8,
            damage: this.getWeaponDamage(weaponType),
            element: null
        };
        
        this.createProjectileEffect(projectile);
        this.projectiles.push(projectile);
        return projectile;
    }
    
    getWeaponDamage(weaponType) {
        switch(weaponType) {
            case 'laser': return 10;
            case 'missile': return 25;
            case 'plasma': return 40;
            default: return 10;
        }
    }
    
    createProjectileEffect(projectile) {
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.left = projectile.x + 'px';
        effect.style.top = projectile.y + 'px';
        effect.style.zIndex = '5';
        
        switch(projectile.type) {
            case 'laser':
                effect.innerHTML = '🔹';
                effect.style.fontSize = '20px';
                effect.style.filter = 'drop-shadow(0 0 10px #00aaff)';
                break;
            case 'missile':
                effect.innerHTML = '🚀';
                effect.style.fontSize = '25px';
                effect.style.filter = 'drop-shadow(0 0 10px #ff4444)';
                break;
            case 'plasma':
                effect.innerHTML = '🔴';
                effect.style.fontSize = '30px';
                effect.style.filter = 'drop-shadow(0 0 15px #ff00ff)';
                break;
        }
        
        document.getElementById('gameElements').appendChild(effect);
        projectile.element = effect;
    }
    
    updateProjectiles() {
        // به روزرسانی پرتابه‌های بازیکن
        this.projectiles = this.projectiles.filter(projectile => {
            const dx = projectile.targetX - projectile.x;
            const dy = projectile.targetY - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 10) {
                projectile.element.remove();
                this.createExplosionEffect(projectile.x, projectile.y, projectile.type);
                return false;
            }
            
            projectile.x += (dx / distance) * projectile.speed;
            projectile.y += (dy / distance) * projectile.speed;
            
            if (projectile.element) {
                projectile.element.style.left = projectile.x + 'px';
                projectile.element.style.top = projectile.y + 'px';
            }
            
            return true;
        });
        
        // به روزرسانی پرتابه‌های دشمن
        this.updateEnemyProjectiles();
    }
    
    updateEnemyProjectiles() {
        this.enemyProjectiles = this.enemyProjectiles.filter(projectile => {
            projectile.x += projectile.vx;
            projectile.y += projectile.vy;
            
            if (projectile.element) {
                projectile.element.style.left = projectile.x + 'px';
                projectile.element.style.top = projectile.y + 'px';
            }
            
            // حذف پرتابه اگر از صفحه خارج شود
            if (projectile.x < -50 || projectile.x > 4050 || projectile.y < -50 || projectile.y > 4050) {
                projectile.element.remove();
                return false;
            }
            
            return true;
        });
    }
    
    createExplosionEffect(x, y, type) {
        const explosion = document.createElement('div');
        explosion.style.position = 'absolute';
        explosion.style.left = x + 'px';
        explosion.style.top = y + 'px';
        explosion.style.zIndex = '4';
        
        let emoji = '💥';
        let fontSize = '40px';
        
        switch(type) {
            case 'laser':
                emoji = '💙';
                fontSize = '30px';
                break;
            case 'missile':
                emoji = '💥';
                fontSize = '50px';
                break;
            case 'plasma':
                emoji = '🟣';
                fontSize = '45px';
                break;
        }
        
        explosion.innerHTML = emoji;
        explosion.style.fontSize = fontSize;
        explosion.style.opacity = '1';
        explosion.style.transition = 'all 0.5s';
        
        document.getElementById('gameElements').appendChild(explosion);
        
        setTimeout(() => {
            explosion.style.transform = 'scale(1.5)';
            explosion.style.opacity = '0';
            
            setTimeout(() => {
                explosion.remove();
            }, 500);
        }, 10);
    }
    
    checkCollisions(player, enemies) {
        // بررسی برخورد پرتابه‌های بازیکن با دشمنان
        this.projectiles = this.projectiles.filter(projectile => {
            let hit = false;
            
            enemies.forEach(enemy => {
                const distance = Math.sqrt(
                    Math.pow(projectile.x - enemy.x, 2) + 
                    Math.pow(projectile.y - enemy.y, 2)
                );
                
                if (distance < 30) {
                    hit = true;
                    this.onEnemyHit(enemy, projectile.damage);
                }
            });
            
            if (hit) {
                projectile.element.remove();
                this.createExplosionEffect(projectile.x, projectile.y, projectile.type);
                return false;
            }
            
            return true;
        });
        
        // بررسی برخورد پرتابه‌های دشمن با بازیکن
        this.checkPlayerHit(player);
    }
    
    onEnemyHit(enemy, damage) {
        if (!enemy.health) enemy.health = 100;
        enemy.health -= damage;
        
        if (enemy.health <= 0) {
            this.createDeathEffect(enemy.x, enemy.y);
            enemy.element.remove();
        } else {
            this.createHitEffect(enemy.x, enemy.y);
        }
    }
    
    checkPlayerHit(player) {
        this.enemyProjectiles.forEach(projectile => {
            const distance = Math.sqrt(
                Math.pow(projectile.x - player.x, 2) + 
                Math.pow(projectile.y - player.y, 2)
            );
            
            if (distance < 40) {
                this.onPlayerHit(player, projectile.damage);
                projectile.element.remove();
            }
        });
        
        this.enemyProjectiles = this.enemyProjectiles.filter(p => p.element.parentNode);
    }
    
    onPlayerHit(player, damage) {
        if (!player.health) player.health = 100;
        player.health -= damage;
        
        this.createHitEffect(player.x, player.y);
        
        if (player.health <= 0) {
            // بازی تمام شد
            if (window.gameOver) window.gameOver();
        }
    }
    
    createDeathEffect(x, y) {
        const effect = document.createElement('div');
        effect.innerHTML = '💀';
        effect.style.position = 'absolute';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.fontSize = '50px';
        effect.style.zIndex = '4';
        effect.style.opacity = '1';
        effect.style.transition = 'all 1s';
        
        document.getElementById('gameElements').appendChild(effect);
        
        setTimeout(() => {
            effect.style.transform = 'scale(1.5) rotate(360deg)';
            effect.style.opacity = '0';
            
            setTimeout(() => {
                effect.remove();
            }, 1000);
        }, 10);
    }
    
    createHitEffect(x, y) {
        const effect = document.createElement('div');
        effect.innerHTML = '💢';
        effect.style.position = 'absolute';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.fontSize = '30px';
        effect.style.zIndex = '4';
        effect.style.opacity = '1';
        effect.style.transition = 'all 0.3s';
        
        document.getElementById('gameElements').appendChild(effect);
        
        setTimeout(() => {
            effect.style.transform = 'scale(1.3)';
            effect.style.opacity = '0';
            
            setTimeout(() => {
                effect.remove();
            }, 300);
        }, 10);
    }
}

// سیستم دشمنان پیشرفته
class AdvancedEnemySystem {
    constructor() {
        this.enemyTypes = {
            fighter: { health: 50, speed: 2, damage: 10, color: '#ff4444', emoji: '🛸' },
            bomber: { health: 100, speed: 1.5, damage: 25, color: '#ffaa00', emoji: '💣' },
            boss: { health: 500, speed: 1, damage: 50, color: '#ff00ff', emoji: '👾' },
            hunter: { health: 75, speed: 2.5, damage: 15, color: '#00ff88', emoji: '🎯' }
        };
        
        this.bossSpawned = false;
    }
    
    createAdvancedEnemy(type, x, y) {
        const enemyData = this.enemyTypes[type];
        const enemyElement = document.createElement('div');
        
        enemyElement.className = 'enemy advanced';
        enemyElement.innerHTML = enemyData.emoji;
        enemyElement.style.position = 'absolute';
        enemyElement.style.left = x + 'px';
        enemyElement.style.top = y + 'px';
        enemyElement.style.fontSize = '45px';
        enemyElement.style.filter = `drop-shadow(0 0 10px ${enemyData.color}) drop-shadow(0 0 20px ${enemyData.color})`;
        
        document.getElementById('gameElements').appendChild(enemyElement);
        
        return {
            element: enemyElement,
            x: x,
            y: y,
            type: type,
            health: enemyData.health,
            maxHealth: enemyData.health,
            speed: enemyData.speed,
            damage: enemyData.damage,
            targetX: Math.random() * 3800 + 100,
            targetY: Math.random() * 3800 + 100,
            lastShot: 0,
            shotCooldown: 2000 + Math.random() * 1000
        };
    }
    
    updateAdvancedEnemies(enemies, player, combatSystem) {
        enemies.forEach(enemy => {
            if (enemy.type && this.enemyTypes[enemy.type]) {
                this.updateEnemyBehavior(enemy, player, combatSystem);
            }
        });
    }
    
    updateEnemyBehavior(enemy, player, combatSystem) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // رفتارهای مختلف بر اساس نوع دشمن
        switch(enemy.type) {
            case 'fighter':
                this.fighterBehavior(enemy, player, distance, dx, dy);
                break;
            case 'bomber':
                this.bomberBehavior(enemy, player, distance, dx, dy);
                break;
            case 'hunter':
                this.hunterBehavior(enemy, player, distance, dx, dy);
                break;
            case 'boss':
                this.bossBehavior(enemy, player, distance, dx, dy);
                break;
        }
        
        // شلیک به بازیکن
        this.enemyShooting(enemy, player, combatSystem, distance);
        
        // به روزرسانی موقعیت
        enemy.element.style.left = enemy.x + 'px';
        enemy.element.style.top = enemy.y + 'px';
        
        // نمایش سلامت
        this.updateHealthBar(enemy);
    }
    
    fighterBehavior(enemy, player, distance, dx, dy) {
        if (distance < 400) {
            // تعقیب بازیکن
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        } else {
            // حرکت تصادفی
            this.randomMovement(enemy);
        }
    }
    
    bomberBehavior(enemy, player, distance, dx, dy) {
        if (distance < 300) {
            // فرار از بازیکن
            enemy.x -= (dx / distance) * enemy.speed;
            enemy.y -= (dy / distance) * enemy.speed;
        } else {
            this.randomMovement(enemy);
        }
    }
    
    hunterBehavior(enemy, player, distance, dx, dy) {
        if (distance < 500) {
            // حرکت به سمت نقطه پیش‌بینی شده
            const predictX = player.x + (player.x - enemy.x) * 0.3;
            const predictY = player.y + (player.y - enemy.y) * 0.3;
            const predictDx = predictX - enemy.x;
            const predictDy = predictY - enemy.y;
            const predictDist = Math.sqrt(predictDx * predictDx + predictDy * predictDy);
            
            enemy.x += (predictDx / predictDist) * enemy.speed;
            enemy.y += (predictDy / predictDist) * enemy.speed;
        } else {
            this.randomMovement(enemy);
        }
    }
    
    bossBehavior(enemy, player, distance, dx, dy) {
        if (distance < 600) {
            // حرکت دایره‌ای دور بازیکن
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;
        } else {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
    }
    
    randomMovement(enemy) {
        const dx = enemy.targetX - enemy.x;
        const dy = enemy.targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
        
        if (distance < 50 || Math.random() < 0.01) {
            enemy.targetX = Math.random() * 3800 + 100;
            enemy.targetY = Math.random() * 3800 + 100;
        }
    }
    
    enemyShooting(enemy, player, combatSystem, distance) {
        const now = Date.now();
        if (now - enemy.lastShot < enemy.shotCooldown) return;
        
        if (distance < 400) {
            enemy.lastShot = now;
            this.createEnemyProjectile(enemy, player, combatSystem);
        }
    }
    
    createEnemyProjectile(enemy, player, combatSystem) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const projectile = {
            x: enemy.x,
            y: enemy.y,
            vx: (dx / distance) * 6,
            vy: (dy / distance) * 6,
            damage: enemy.damage,
            element: null
        };
        
        const effect = document.createElement('div');
        effect.innerHTML = '🔻';
        effect.style.position = 'absolute';
        effect.style.left = projectile.x + 'px';
        effect.style.top = projectile.y + 'px';
        effect.style.fontSize = '20px';
        effect.style.filter = 'drop-shadow(0 0 5px #ff0000)';
        effect.style.zIndex = '4';
        
        document.getElementById('gameElements').appendChild(effect);
        projectile.element = effect;
        
        combatSystem.enemyProjectiles.push(projectile);
    }
    
    updateHealthBar(enemy) {
        // حذف health bar قبلی
        const oldBar = enemy.element.querySelector('.health-bar');
        if (oldBar) oldBar.remove();
        
        // ایجاد health bar جدید
        const healthPercent = (enemy.health / enemy.maxHealth) * 100;
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBar.style.position = 'absolute';
        healthBar.style.bottom = '-10px';
        healthBar.style.left = '0';
        healthBar.style.width = '100%';
        healthBar.style.height = '4px';
        healthBar.style.background = `linear-gradient(90deg, #ff4444 ${healthPercent}%, #333 ${healthPercent}%)`;
        healthBar.style.borderRadius = '2px';
        
        enemy.element.appendChild(healthBar);
    }
    
    spawnBossIfNeeded(level, enemies) {
        if (level >= 3 && !this.bossSpawned && enemies.length < 5) {
            this.bossSpawned = true;
            const boss = this.createAdvancedEnemy('boss', 2000, 500);
            enemies.push(boss);
            return boss;
        }
        return null;
    }
}

// ایجاد نمونه‌های جهانی
const spaceshipUpgrades = new SpaceshipUpgradeSystem();
const combatSystem = new CombatSystem();
const advancedEnemySystem = new AdvancedEnemySystem();

// بارگذاری تنظیمات
spaceshipUpgrades.loadSettings();

// اضافه کردن به محیط جهانی
window.SpaceshipUpgradeSystem = SpaceshipUpgradeSystem;
window.CombatSystem = CombatSystem;
window.AdvancedEnemySystem = AdvancedEnemySystem;
window.spaceshipUpgrades = spaceshipUpgrades;
window.combatSystem = combatSystem;
window.advancedEnemySystem = advancedEnemySystem;

console.log('✅ سیستم جنگ و ارتقاء سفینه بارگذاری شد!');
