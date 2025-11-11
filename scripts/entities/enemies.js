class EnemyManager {
    constructor() {
        this.enemies = new Map();
        this.spawnZones = [];
        this.behaviors = new Map();
        this.spawnTimer = 0;
        this.maxEnemies = 8;
        
        this.init();
    }

    init() {
        this.defineBehaviors();
        this.createSpawnZones();
        console.log('👾 سیستم دشمنان هوشمند راه‌اندازی شد');
    }

    defineBehaviors() {
        // رفتارهای مختلف برای دشمنان
        this.behaviors.set('patrol', this.patrolBehavior.bind(this));
        this.behaviors.set('orbit', this.orbitBehavior.bind(this));
        this.behaviors.set('avoid', this.avoidBehavior.bind(this));
        this.behaviors.set('idle', this.idleBehavior.bind(this));
    }

    createSpawnZones() {
        // مناطق مختلف برای اسپان دشمنان
        this.spawnZones = [
            { x: -100, y: 0, z: -100, radius: 50 },
            { x: 100, y: 0, z: -100, radius: 50 },
            { x: -100, y: 0, z: 100, radius: 50 },
            { x: 100, y: 0, z: 100, radius: 50 },
            { x: 0, y: 50, z: 0, radius: 30 },
            { x: 0, y: -50, z: 0, radius: 30 }
        ];
    }

    update(deltaTime, playerPosition) {
        this.spawnTimer += deltaTime;
        
        // اسپان دشمنان جدید
        if (this.spawnTimer >= 3 && this.enemies.size < this.maxEnemies) {
            this.spawnEnemy(playerPosition);
            this.spawnTimer = 0;
        }
        
        // به‌روزرسانی دشمنان موجود
        for (const [id, enemy] of this.enemies) {
            this.updateEnemy(enemy, deltaTime, playerPosition);
        }
    }

    spawnEnemy(playerPosition) {
        const enemyId = 'enemy_' + Date.now() + '_' + Math.random();
        const spawnZone = this.spawnZones[Math.floor(Math.random() * this.spawnZones.length)];
        
        // موقعیت تصادفی در منطقه اسپان
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spawnZone.radius;
        
        const enemy = {
            id: enemyId,
            position: {
                x: spawnZone.x + Math.cos(angle) * distance,
                y: spawnZone.y + (Math.random() - 0.5) * 20,
                z: spawnZone.z + Math.sin(angle) * distance
            },
            rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            speed: 2 + Math.random() * 2,
            health: 100,
            behavior: this.getRandomBehavior(),
            state: 'patrol',
            target: this.getRandomPoint(),
            lastStateChange: 0,
            color: this.getRandomColor(),
            size: 1 + Math.random() * 0.5
        };
        
        this.enemies.set(enemyId, enemy);
        this.createEnemyVisual(enemy);
        
        return enemy;
    }

    getRandomBehavior() {
        const behaviors = ['patrol', 'orbit', 'idle'];
        return behaviors[Math.floor(Math.random() * behaviors.length)];
    }

    getRandomPoint() {
        return {
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 100,
            z: (Math.random() - 0.5) * 200
        };
    }

    getRandomColor() {
        const colors = [
            [1.0, 0.2, 0.2], // قرمز
            [0.2, 0.8, 0.2], // سبز
            [0.2, 0.5, 1.0], // آبی
            [1.0, 0.8, 0.2], // زرد
            [0.8, 0.2, 1.0]  // بنفش
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateEnemy(enemy, deltaTime, playerPosition) {
        // تغییر حالت تصادفی
        if (Math.random() < 0.01) {
            enemy.behavior = this.getRandomBehavior();
            enemy.target = this.getRandomPoint();
        }
        
        // اجرای رفتار
        const behavior = this.behaviors.get(enemy.behavior);
        if (behavior) {
            behavior(enemy, deltaTime, playerPosition);
        }
        
        // اعمال حرکت
        enemy.position.x += enemy.velocity.x * deltaTime;
        enemy.position.y += enemy.velocity.y * deltaTime;
        enemy.position.z += enemy.velocity.z * deltaTime;
        
        // به‌روزرسانی چرخش
        if (enemy.velocity.x !== 0 || enemy.velocity.z !== 0) {
            enemy.rotation.y = Math.atan2(enemy.velocity.x, enemy.velocity.z);
        }
        
        // به‌روزرسانی نمایش بصری
        this.updateEnemyVisual(enemy);
    }

    // رفتار گشت‌زنی
    patrolBehavior(enemy, deltaTime, playerPosition) {
        const toTarget = {
            x: enemy.target.x - enemy.position.x,
            y: enemy.target.y - enemy.position.y,
            z: enemy.target.z - enemy.position.z
        };
        
        const distance = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y + toTarget.z * toTarget.z);
        
        if (distance < 10) {
            // رسیده به هدف، انتخاب هدف جدید
            enemy.target = this.getRandomPoint();
        } else {
            // حرکت به سمت هدف
            const speed = enemy.speed;
            enemy.velocity.x = (toTarget.x / distance) * speed;
            enemy.velocity.y = (toTarget.y / distance) * speed;
            enemy.velocity.z = (toTarget.z / distance) * speed;
        }
        
        // حفظ فاصله از بازیکن
        this.maintainDistanceFromPlayer(enemy, playerPosition, 30);
    }

    // رفتار چرخشی
    orbitBehavior(enemy, deltaTime, playerPosition) {
        const orbitRadius = 40 + Math.random() * 20;
        const orbitSpeed = 0.5;
        
        // محاسبه موقعیت در مدار
        const angle = Date.now() * 0.001 * orbitSpeed + enemy.id.charCodeAt(0) * 0.1;
        const targetX = playerPosition.x + Math.cos(angle) * orbitRadius;
        const targetZ = playerPosition.z + Math.sin(angle) * orbitRadius;
        const targetY = playerPosition.y + (Math.random() - 0.5) * 10;
        
        const toTarget = {
            x: targetX - enemy.position.x,
            y: targetY - enemy.position.y,
            z: targetZ - enemy.position.z
        };
        
        const distance = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y + toTarget.z * toTarget.z);
        const speed = enemy.speed * 0.7;
        
        enemy.velocity.x = (toTarget.x / distance) * speed;
        enemy.velocity.y = (toTarget.y / distance) * speed;
        enemy.velocity.z = (toTarget.z / distance) * speed;
    }

    // رفتار اجتنابی
    avoidBehavior(enemy, deltaTime, playerPosition) {
        const toPlayer = {
            x: playerPosition.x - enemy.position.x,
            y: playerPosition.y - enemy.position.y,
            z: playerPosition.z - enemy.position.z
        };
        
        const distance = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y + toPlayer.z * toPlayer.z);
        
        if (distance < 50) {
            // دور شدن از بازیکن
            const avoidSpeed = enemy.speed * 1.2;
            enemy.velocity.x = (-toPlayer.x / distance) * avoidSpeed;
            enemy.velocity.y = (-toPlayer.y / distance) * avoidSpeed;
            enemy.velocity.z = (-toPlayer.z / distance) * avoidSpeed;
        } else {
            // حرکت تصادفی آرام
            enemy.velocity.x = (Math.random() - 0.5) * 0.5;
            enemy.velocity.y = (Math.random() - 0.5) * 0.3;
            enemy.velocity.z = (Math.random() - 0.5) * 0.5;
        }
    }

    // رفتار بی‌حرکت
    idleBehavior(enemy, deltaTime, playerPosition) {
        // حرکت بسیار آرام و تصادفی
        enemy.velocity.x += (Math.random() - 0.5) * 0.1;
        enemy.velocity.y += (Math.random() - 0.5) * 0.05;
        enemy.velocity.z += (Math.random() - 0.5) * 0.1;
        
        // محدود کردن سرعت
        const speed = Math.sqrt(enemy.velocity.x * enemy.velocity.x + enemy.velocity.y * enemy.velocity.y + enemy.velocity.z * enemy.velocity.z);
        if (speed > 0.5) {
            enemy.velocity.x *= 0.5 / speed;
            enemy.velocity.y *= 0.5 / speed;
            enemy.velocity.z *= 0.5 / speed;
        }
        
        // حفظ فاصله از بازیکن
        this.maintainDistanceFromPlayer(enemy, playerPosition, 40);
    }

    maintainDistanceFromPlayer(enemy, playerPosition, minDistance) {
        const toPlayer = {
            x: playerPosition.x - enemy.position.x,
            y: playerPosition.y - enemy.position.y,
            z: playerPosition.z - enemy.position.z
        };
        
        const distance = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y + toPlayer.z * toPlayer.z);
        
        if (distance < minDistance) {
            // دور شدن از بازیکن
            const pushForce = (minDistance - distance) / minDistance;
            enemy.velocity.x -= (toPlayer.x / distance) * pushForce * 2;
            enemy.velocity.y -= (toPlayer.y / distance) * pushForce * 2;
            enemy.velocity.z -= (toPlayer.z / distance) * pushForce * 2;
        }
    }

    createEnemyVisual(enemy) {
        // ایجاد نمایش بصری دشمن با WebGL
        const enemyElement = {
            type: 'enemy',
            position: enemy.position,
            rotation: enemy.rotation,
            color: enemy.color,
            size: enemy.size,
            update: (deltaTime) => {
                // به‌روزرسانی موقعیت بصری
            },
            render: () => {
                // رندر دشمن
            }
        };
        
        Engine.addEntity(enemy.id, enemyElement);
    }

    updateEnemyVisual(enemy) {
        const visual = Engine.entities.get(enemy.id);
        if (visual) {
            visual.position = { ...enemy.position };
            visual.rotation = { ...enemy.rotation };
        }
    }

    removeEnemy(enemyId) {
        this.enemies.delete(enemyId);
        Engine.removeEntity(enemyId);
    }

    getEnemies() {
        return Array.from(this.enemies.values());
    }

    getEnemyCount() {
        return this.enemies.size;
    }

    // بررسی برخورد با بازیکن
    checkCollisions(playerPosition, playerSize) {
        for (const [id, enemy] of this.enemies) {
            const dx = enemy.position.x - playerPosition.x;
            const dy = enemy.position.y - playerPosition.y;
            const dz = enemy.position.z - playerPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < playerSize + enemy.size) {
                return enemy;
            }
        }
        return null;
    }

    // پاکسازی تمام دشمنان
    clear() {
        for (const [id] of this.enemies) {
            this.removeEnemy(id);
        }
        this.enemies.clear();
    }
}

const Enemies = new EnemyManager();
