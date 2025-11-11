// فایل دشمنان - مدیریت رفتار و تولید دشمنان

class Enemies {
    constructor() {
        this.enemies = [];
        this.spawnPatterns = [
            'circle',
            'line',
            'wave', 
            'random',
            'chase'
        ];
        
        this.init();
    }

    init() {
        console.log('👾 سیستم دشمنان راه‌اندازی شد');
    }

    // تولید گروه دشمن
    spawnGroup(player, level) {
        const maxEnemies = this.calculateMaxEnemies(level);
        if (this.enemies.length >= maxEnemies) return;
        
        const enemyCount = this.calculateEnemyCount(level);
        const pattern = this.selectSpawnPattern(level);
        
        console.log(`👾 تولید ${enemyCount} دشمن با الگوی ${pattern}`);
        
        switch (pattern) {
            case 'circle':
                this.spawnCirclePattern(player, enemyCount, level);
                break;
            case 'line':
                this.spawnLinePattern(player, enemyCount, level);
                break;
            case 'wave':
                this.spawnWavePattern(player, enemyCount, level);
                break;
            case 'random':
                this.spawnRandomPattern(player, enemyCount, level);
                break;
            case 'chase':
                this.spawnChasePattern(player, enemyCount, level);
                break;
        }
    }

    // محاسبه حداکثر تعداد دشمنان
    calculateMaxEnemies(level) {
        return Math.min(15, 5 + Math.floor(level / 2));
    }

    // محاسبه تعداد دشمنان برای تولید
    calculateEnemyCount(level) {
        const baseCount = 2;
        const levelBonus = Math.floor(level / 3);
        return Math.min(5, baseCount + levelBonus);
    }

    // انتخاب الگوی تولید
    selectSpawnPattern(level) {
        const patterns = this.spawnPatterns;
        const availablePatterns = patterns.slice(0, Math.min(level, patterns.length));
        return availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    }

    // الگوی دایره‌ای
    spawnCirclePattern(player, count, level) {
        const radius = 400 + (level * 20);
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = radius + (Math.random() - 0.5) * 100;
            
            this.spawnEnemy(
                player.x + Math.cos(angle) * distance,
                player.y + Math.sin(angle) * distance,
                level
            );
        }
    }

    // الگوی خطی
    spawnLinePattern(player, count, level) {
        const startX = player.x - 300;
        const startY = player.y - 200;
        
        for (let i = 0; i < count; i++) {
            this.spawnEnemy(
                startX + (i * 100),
                startY + (Math.random() - 0.5) * 100,
                level
            );
        }
    }

    // الگوی موجی
    spawnWavePattern(player, count, level) {
        const waveCount = Math.min(3, Math.ceil(count / 2));
        
        for (let wave = 0; wave < waveCount; wave++) {
            setTimeout(() => {
                const waveEnemies = Math.min(2 + wave, count);
                for (let i = 0; i < waveEnemies; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 500 + wave * 100;
                    
                    this.spawnEnemy(
                        player.x + Math.cos(angle) * distance,
                        player.y + Math.sin(angle) * distance,
                        level
                    );
                }
            }, wave * 800);
        }
    }

    // الگوی تصادفی
    spawnRandomPattern(player, count, level) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 300 + Math.random() * 400;
            
            this.spawnEnemy(
                player.x + Math.cos(angle) * distance,
                player.y + Math.sin(angle) * distance,
                level
            );
        }
    }

    // الگوی تعقیبی
    spawnChasePattern(player, count, level) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 200 + Math.random() * 200;
            
            const enemy = this.spawnEnemy(
                player.x + Math.cos(angle) * distance,
                player.y + Math.sin(angle) * distance,
                level
            );
            
            // تنظیم هدف برای تعقیب
            enemy.targetX = player.x;
            enemy.targetY = player.y;
            enemy.behavior = 'chase';
        }
    }

    // تولید تک دشمن
    spawnEnemy(x, y, level) {
        const enemyElement = document.createElement('div');
        enemyElement.className = 'enemy';
        enemyElement.innerHTML = this.selectEnemyType(level);
        enemyElement.style.left = x + 'px';
        enemyElement.style.top = y + 'px';
        
        document.getElementById('gameScreen').appendChild(enemyElement);
        
        const enemy = {
            element: enemyElement,
            x: x,
            y: y,
            type: enemyElement.innerHTML,
            speed: this.calculateSpeed(level),
            health: this.calculateHealth(level),
            behavior: this.selectBehavior(level),
            targetX: x + (Math.random() - 0.5) * 300,
            targetY: y + (Math.random() - 0.5) * 300,
            lastDirectionChange: 0
        };
        
        this.enemies.push(enemy);
        return enemy;
    }

    // انتخاب نوع دشمن
    selectEnemyType(level) {
        const basicEnemies = ['🌋', '💀', '👻'];
        const advancedEnemies = ['👾', '🤖', '🦠'];
        const bossEnemies = ['🐉', '👹', '🤡'];
        
        if (level >= 10) {
            return bossEnemies[Math.floor(Math.random() * bossEnemies.length)];
        } else if (level >= 5) {
            const pool = [...basicEnemies, ...advancedEnemies];
            return pool[Math.floor(Math.random() * pool.length)];
        } else {
            return basicEnemies[Math.floor(Math.random() * basicEnemies.length)];
        }
    }

    // محاسبه سرعت دشمن
    calculateSpeed(level) {
        const baseSpeed = 1;
        const levelBonus = level * 0.15;
        const randomVariation = Math.random() * 0.5;
        
        return baseSpeed + levelBonus + randomVariation;
    }

    // محاسبه سلامت دشمن
    calculateHealth(level) {
        return 1 + Math.floor(level / 3);
    }

    // انتخاب رفتار دشمن
    selectBehavior(level) {
        const behaviors = ['wander', 'chase', 'patrol'];
        const weights = [0.5, 0.3 + (level * 0.05), 0.2];
        
        let random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < behaviors.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return behaviors[i];
            }
        }
        
        return 'wander';
    }

    // به‌روزرسانی رفتار دشمن
    updateBehavior(enemy, player) {
        enemy.lastDirectionChange++;
        
        switch (enemy.behavior) {
            case 'wander':
                this.updateWanderBehavior(enemy, player);
                break;
            case 'chase':
                this.updateChaseBehavior(enemy, player);
                break;
            case 'patrol':
                this.updatePatrolBehavior(enemy, player);
                break;
        }
        
        // تغییر تصادفی رفتار
        if (enemy.lastDirectionChange > 180 && Math.random() < 0.02) {
            this.changeBehavior(enemy, player);
        }
    }

    // رفتار سرگردان
    updateWanderBehavior(enemy, player) {
        if (enemy.lastDirectionChange > 120 || 
            Math.sqrt(Math.pow(enemy.x - enemy.targetX, 2) + Math.pow(enemy.y - enemy.targetY, 2)) < 50) {
            
            enemy.targetX = enemy.x + (Math.random() - 0.5) * 200;
            enemy.targetY = enemy.y + (Math.random() - 0.5) * 200;
            enemy.lastDirectionChange = 0;
        }
    }

    // رفتار تعقیب
    updateChaseBehavior(enemy, player) {
        const distanceToPlayer = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
        
        if (distanceToPlayer < 400) {
            // تعقیب بازیکن
            enemy.targetX = player.x + (Math.random() - 0.5) * 50;
            enemy.targetY = player.y + (Math.random() - 0.5) * 50;
        } else {
            // بازگشت به رفتار سرگردان
            this.updateWanderBehavior(enemy, player);
        }
    }

    // رفتار گشت‌زنی
    updatePatrolBehavior(enemy, player) {
        if (enemy.lastDirectionChange > 180) {
            // انتخاب نقطه‌های گشت‌زنی در اطراف بازیکن
            const angle = Math.random() * Math.PI * 2;
            const distance = 300 + Math.random() * 200;
            
            enemy.targetX = player.x + Math.cos(angle) * distance;
            enemy.targetY = player.y + Math.sin(angle) * distance;
            enemy.lastDirectionChange = 0;
        }
    }

    // تغییر رفتار
    changeBehavior(enemy, player) {
        const behaviors = ['wander', 'chase', 'patrol'];
        const currentIndex = behaviors.indexOf(enemy.behavior);
        let newIndex;
        
        do {
            newIndex = Math.floor(Math.random() * behaviors.length);
        } while (newIndex === currentIndex && behaviors.length > 1);
        
        enemy.behavior = behaviors[newIndex];
        enemy.lastDirectionChange = 0;
        
        console.log(`🔄 دشمن رفتار خود را به ${enemy.behavior} تغییر داد`);
    }

    // به‌روزرسانی موقعیت دشمن
    updatePosition(enemy) {
        const dx = enemy.targetX - enemy.x;
        const dy = enemy.targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
            
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.top = enemy.y + 'px';
        }
    }

    // بررسی خروج دشمن از مرزها
    isOutOfBounds(enemy) {
        const margin = 250;
        return enemy.x < -margin || enemy.x > window.innerWidth + margin ||
               enemy.y < -margin || enemy.y > window.innerHeight + margin;
    }

    // حذف دشمن
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            enemy.element.remove();
            this.enemies.splice(index, 1);
        }
    }

    // پاک کردن تمام دشمنان
    clearAll() {
        this.enemies.forEach(enemy => {
            enemy.element.remove();
        });
        this.enemies = [];
    }

    // گرفتن لیست دشمنان
    getEnemies() {
        return this.enemies;
    }

    // ایجاد دشمن ویژه
    spawnSpecialEnemy(type, x, y, properties = {}) {
        const enemy = this.spawnEnemy(x, y, 1);
        
        // تنظیم ویژگی‌های ویژه
        Object.assign(enemy, properties);
        
        // تغییر ظاهر بر اساس نوع
        switch (type) {
            case 'fast':
                enemy.element.style.filter = 'drop-shadow(0 0 15px #00ff00) drop-shadow(0 0 25px #00ff00)';
                enemy.speed *= 1.5;
                enemy.behavior = 'chase';
                break;
                
            case 'tank':
                enemy.element.style.filter = 'drop-shadow(0 0 15px #ff0000) drop-shadow(0 0 25px #ff0000)';
                enemy.element.style.transform = 'scale(1.3)';
                enemy.health *= 3;
                enemy.speed *= 0.7;
                break;
                
            case 'boss':
                enemy.element.style.filter = 'drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 40px #ff00ff)';
                enemy.element.style.transform = 'scale(1.5)';
                enemy.health *= 5;
                enemy.speed *= 0.8;
                enemy.behavior = 'chase';
                break;
        }
        
        return enemy;
    }
}

// ایجاد نمونه از سیستم دشمنان
const enemies = new Enemies();

// صادر کردن برای استفاده global
window.enemies = enemies;
