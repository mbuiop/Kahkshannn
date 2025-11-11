// مدیریت دشمنان
class EnemyManager {
    constructor() {
        this.list = [];
        this.spawnTimer = 0;
        this.bombCooldown = 0;
        this.safeTime = 0;
        this.isSafeTime = false;
        this.maxEnemies = 8;
    }

    update(playerX, playerY) {
        this.updateTimers();
        
        if (!this.isSafeTime) {
            this.spawnEnemies(playerX, playerY);
            this.moveEnemies(playerX, playerY);
        }
    }

    updateTimers() {
        // تایمر بمب
        if (this.bombCooldown > 0) {
            this.bombCooldown--;
        }
        
        // زمان امن
        if (this.isSafeTime && this.safeTime > 0) {
            this.safeTime--;
            
            if (this.safeTime <= 0) {
                this.isSafeTime = false;
            }
        }
    }

    spawnEnemies(playerX, playerY) {
        this.spawnTimer++;
        
        const spawnInterval = Math.max(60, 200 - Game.currentLevel * 3);
        
        if (this.spawnTimer >= spawnInterval && this.list.length < this.maxEnemies + Game.currentLevel) {
            this.spawnTimer = 0;
            this.createEnemyGroup(playerX, playerY);
        }
    }

    createEnemyGroup(playerX, playerY) {
        const enemyCount = Math.min(2 + Math.floor(Game.currentLevel / 3), 
                                  (this.maxEnemies + Game.currentLevel) - this.list.length);
        
        for (let i = 0; i < enemyCount; i++) {
            this.createEnemy(playerX, playerY);
        }
    }

    createEnemy(playerX, playerY) {
        // موقعیت شروع دور از بازیکن
        const angle = Math.random() * Math.PI * 2;
        const distance = 600 + Math.random() * 800;
        const startX = playerX + Math.cos(angle) * distance;
        const startY = playerY + Math.sin(angle) * distance;
        
        const enemyElement = document.createElement('div');
        enemyElement.className = 'enemy';
        enemyElement.innerHTML = '🌋';
        enemyElement.style.left = startX + 'px';
        enemyElement.style.top = startY + 'px';
        
        Game.gameElements.appendChild(enemyElement);
        
        const enemy = {
            element: enemyElement,
            x: startX,
            y: startY,
            targetX: playerX + (Math.random() - 0.5) * 300,
            targetY: playerY + (Math.random() - 0.5) * 300,
            speed: 1 + Game.currentLevel * 0.15 + Math.random() * 0.3,
            minDistance: 150 + Math.random() * 100 // فاصله حداقلی از بازیکن
        };
        
        this.list.push(enemy);
    }

    moveEnemies(playerX, playerY) {
        this.list.forEach(enemy => {
            // تغییر هدف تصادفی
            if (Math.random() < 0.01) {
                enemy.targetX = playerX + (Math.random() - 0.5) * 200;
                enemy.targetY = playerY + (Math.random() - 0.5) * 200;
            }
            
            // حرکت به سمت هدف
            const dx = enemy.targetX - enemy.x;
            const dy = enemy.targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
                
                // محدود کردن فاصله از بازیکن
                const playerDx = playerX - enemy.x;
                const playerDy = playerY - enemy.y;
                const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
                
                if (playerDistance < enemy.minDistance) {
                    // دور شدن از بازیکن
                    enemy.x -= (playerDx / playerDistance) * enemy.speed;
                    enemy.y -= (playerDy / playerDistance) * enemy.speed;
                }
                
                enemy.element.style.left = enemy.x + 'px';
                enemy.element.style.top = enemy.y + 'px';
            }
        });
    }

    checkCollisions(player, onCollision) {
        this.list.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(player.x - enemy.x, 2) + 
                Math.pow(player.y - enemy.y, 2)
            );
            
            if (distance < 50) {
                onCollision();
            }
        });
    }

    useBomb() {
        if (this.bombCooldown > 0 || !Game.gameRunning) return;
        
        this.bombCooldown = 10 * 60; // 10 ثانیه
        this.isSafeTime = true;
        this.safeTime = 5 * 60; // 5 ثانیه
        
        // نابودی تمام دشمنان
        this.clear();
        
        // پخش صدا (اگر فعال باشد)
        if (Audio.enabled) {
            Audio.play('bomb');
        }
    }

    clear() {
        this.list.forEach(enemy => {
            if (enemy.element && enemy.element.parentNode) {
                enemy.element.remove();
            }
        });
        this.list = [];
    }
}

// ایجاد نمونه دشمنان
const Enemies = new EnemyManager();
