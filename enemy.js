// enemy.js - سیستم دشمنان هوشمند و AI
console.log('👾 سیستم دشمنان بارگذاری شد');

class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnInterval = null;
        this.spawnRate = 2000; // میلی‌ثانیه
        this.destroyedCount = 0;
        this.difficultyLevel = 1;
        this.maxEnemies = 15;
    }

    initialize(scene) {
        this.scene = scene;
        console.log('✅ سیستم دشمنان راه‌اندازی شد');
    }

    startSpawning() {
        console.log('👾 شروع تولید دشمنان...');
        this.spawnInterval = setInterval(() => {
            if (this.enemies.length < this.maxEnemies) {
                this.spawnEnemy();
            }
        }, this.spawnRate);
        
        // افزایش تدریجی سختی
        setInterval(() => {
            this.increaseDifficulty();
        }, 30000); // هر 30 ثانیه
    }

    stopSpawning() {
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
    }

    increaseDifficulty() {
        this.difficultyLevel++;
        this.spawnRate = Math.max(500, 2000 - (this.difficultyLevel * 100));
        console.log(`📈 افزایش سطح سختی به: ${this.difficultyLevel}`);
    }

    spawnEnemy() {
        const enemyTypes = ['fighter', 'bomber', 'interceptor', 'boss'];
        const weights = [0.4, 0.3, 0.2, 0.1]; // احتمال انواع مختلف
        
        let random = Math.random();
        let typeIndex = 0;
        let weightSum = 0;
        
        for (let i = 0; i < weights.length; i++) {
            weightSum += weights[i];
            if (random <= weightSum) {
                typeIndex = i;
                break;
            }
        }
        
        const enemyType = enemyTypes[typeIndex];
        this.createEnemy(enemyType);
    }

    createEnemy(type) {
        let enemyMesh, health, speed, damage, scoreValue, size;
        
        switch(type) {
            case 'fighter':
                enemyMesh = this.createFighter();
                health = 30 * this.difficultyLevel;
                speed = 0.1 + (this.difficultyLevel * 0.02);
                damage = 5;
                scoreValue = 10;
                size = 2;
                break;
                
            case 'bomber':
                enemyMesh = this.createBomber();
                health = 50 * this.difficultyLevel;
                speed = 0.08 + (this.difficultyLevel * 0.015);
                damage = 10;
                scoreValue = 20;
                size = 3;
                break;
                
            case 'interceptor':
                enemyMesh = this.createInterceptor();
                health = 20 * this.difficultyLevel;
                speed = 0.15 + (this.difficultyLevel * 0.03);
                damage = 8;
                scoreValue = 15;
                size = 1.5;
                break;
                
            case 'boss':
                enemyMesh = this.createBoss();
                health = 200 * this.difficultyLevel;
                speed = 0.05 + (this.difficultyLevel * 0.01);
                damage = 20;
                scoreValue = 100;
                size = 5;
                break;
        }
        
        // موقعیت تصادفی در اطراف بازیکن
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const y = (Math.random() - 0.5) * 10;
        const z = Math.sin(angle) * distance;
        
        enemyMesh.position = new BABYLON.Vector3(x, y, z);
        
        const enemy = {
            mesh: enemyMesh,
            type: type,
            health: health,
            maxHealth: health,
            speed: speed,
            damage: damage,
            scoreValue: scoreValue,
            size: size,
            lastShot: 0,
            shootCooldown: 1000 + Math.random() * 1000 // میلی‌ثانیه
        };
        
        this.enemies.push(enemy);
        
        console.log(`👾 دشمن ${type} ایجاد شد - سلامت: ${health}`);
        return enemy;
    }

    createFighter() {
        const fuselage = BABYLON.MeshBuilder.CreateCylinder("enemyFighter", {
            height: 3,
            diameterTop: 0.5,
            diameterBottom: 1.5,
            tessellation: 16
        }, this.scene);
        
        const wings = BABYLON.MeshBuilder.CreateBox("enemyWings", {
            width: 4,
            height: 0.2,
            depth: 1
        }, this.scene);
        wings.position.y = -0.5;
        
        const enemy = BABYLON.Mesh.MergeMeshes([fuselage, wings], true, false, null, false, true);
        
        const material = new BABYLON.StandardMaterial("enemyFighterMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
        material.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
        enemy.material = material;
        
        return enemy;
    }

    createBomber() {
        const body = BABYLON.MeshBuilder.CreateSphere("enemyBomber", {
            diameter: 3,
            segments: 16
        }, this.scene);
        
        const wing = BABYLON.MeshBuilder.CreateBox("enemyBomberWing", {
            width: 6,
            height: 0.3,
            depth: 1.5
        }, this.scene);
        wing.position.y = 0;
        
        const enemy = BABYLON.Mesh.MergeMeshes([body, wing], true, false, null, false, true);
        
        const material = new BABYLON.StandardMaterial("enemyBomberMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.8);
        material.emissiveColor = new BABYLON.Color3(0.2, 0, 0.2);
        enemy.material = material;
        
        return enemy;
    }

    createInterceptor() {
        const body = BABYLON.MeshBuilder.CreateCylinder("enemyInterceptor", {
            height: 2,
            diameterTop: 0.3,
            diameterBottom: 1,
            tessellation: 12
        }, this.scene);
        
        const wing = BABYLON.MeshBuilder.CreateBox("enemyInterceptorWing", {
            width: 3,
            height: 0.1,
            depth: 0.5
        }, this.scene);
        wing.position.y = 0.2;
        
        const enemy = BABYLON.Mesh.MergeMeshes([body, wing], true, false, null, false, true);
        
        const material = new BABYLON.StandardMaterial("enemyInterceptorMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.8, 1);
        material.emissiveColor = new BABYLON.Color3(0, 0.2, 0.3);
        enemy.material = material;
        
        return enemy;
    }

    createBoss() {
        const mainBody = BABYLON.MeshBuilder.CreateSphere("enemyBoss", {
            diameter: 5,
            segments: 32
        }, this.scene);
        
        const ring1 = BABYLON.MeshBuilder.CreateTorus("bossRing1", {
            diameter: 8,
            thickness: 0.5,
            tessellation: 32
        }, this.scene);
        ring1.rotation.x = Math.PI / 2;
        
        const ring2 = BABYLON.MeshBuilder.CreateTorus("bossRing2", {
            diameter: 6,
            thickness: 0.3,
            tessellation: 32
        }, this.scene);
        ring2.rotation.z = Math.PI / 2;
        
        const enemy = BABYLON.Mesh.MergeMeshes([mainBody, ring1, ring2], true, false, null, false, true);
        
        const material = new BABYLON.StandardMaterial("enemyBossMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        material.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        material.specularColor = new BABYLON.Color3(1, 1, 1);
        enemy.material = material;
        
        // نور برای باس
        const bossLight = new BABYLON.PointLight("bossLight", BABYLON.Vector3.Zero(), this.scene);
        bossLight.intensity = 0.5;
        bossLight.diffuse = new BABYLON.Color3(1, 0, 0);
        bossLight.parent = enemy;
        
        return enemy;
    }

    update() {
        if (!window.gameEngine || !window.gameEngine.player) return;
        
        const player = window.gameEngine.player;
        
        this.enemies.forEach((enemy, index) => {
            if (!enemy.mesh) return;
            
            // AI حرکت به سمت بازیکن
            this.updateEnemyMovement(enemy, player);
            
            // AI شلیک به بازیکن
            this.updateEnemyShooting(enemy, player);
            
            // انیمیشن‌ها
            this.updateEnemyAnimations(enemy);
            
            // بررسی مرگ
            if (enemy.health <= 0) {
                this.destroyEnemy(index);
            }
        });
    }

    updateEnemyMovement(enemy, player) {
        const direction = player.position.subtract(enemy.mesh.position);
        direction.normalize();
        
        // حرکت به سمت بازیکن
        enemy.mesh.position.addInPlace(direction.scale(enemy.speed));
        
        // چرخش به سمت بازیکن
        enemy.mesh.lookAt(player.position);
        
        // حرکت جانبی برای پویایی بیشتر
        const time = Date.now() * 0.001;
        enemy.mesh.position.x += Math.sin(time + enemy.mesh.uniqueId) * 0.02;
        enemy.mesh.position.y += Math.cos(time * 1.3 + enemy.mesh.uniqueId) * 0.02;
    }

    updateEnemyShooting(enemy, player) {
        const now = Date.now();
        const distance = BABYLON.Vector3.Distance(enemy.mesh.position, player.position);
        
        // شلیک اگر در محدوده باشد و کولدون تمام شده باشد
        if (distance < 15 && now - enemy.lastShot > enemy.shootCooldown) {
            this.enemyShoot(enemy, player);
            enemy.lastShot = now;
        }
    }

    enemyShoot(enemy, player) {
        const bullet = BABYLON.Mesh.CreateSphere("enemyBullet", 8, 0.2, this.scene);
        bullet.position = enemy.mesh.position.clone();
        
        const direction = player.position.subtract(enemy.mesh.position);
        direction.normalize();
        
        const bulletMaterial = new BABYLON.StandardMaterial("enemyBulletMaterial", this.scene);
        bulletMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
        bullet.material = bulletMaterial;
        
        bullet.speed = 0.2;
        bullet.damage = enemy.damage;
        bullet.direction = direction;
        bullet.isEnemyBullet = true;
        
        // اضافه کردن به لیست گلوله‌های دشمن
        if (!window.gameEngine.enemyBullets) {
            window.gameEngine.enemyBullets = [];
        }
        window.gameEngine.enemyBullets.push(bullet);
        
        // افکت شلیک
        this.createEnemyMuzzleFlash(enemy.mesh.position);
        
        // پخش صدای شلیک دشمن
        if (window.audioManager) {
            window.audioManager.playSound('enemyLaser');
        }
    }

    createEnemyMuzzleFlash(position) {
        const flash = BABYLON.Mesh.CreateSphere("enemyMuzzleFlash", 8, 0.5, this.scene);
        flash.position = position.clone();
        
        const flashMaterial = new BABYLON.StandardMaterial("enemyFlashMaterial", this.scene);
        flashMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
        flashMaterial.alpha = 0.8;
        flash.material = flashMaterial;
        
        let alpha = 0.8;
        const fadeInterval = setInterval(() => {
            alpha -= 0.1;
            flashMaterial.alpha = alpha;
            
            if (alpha <= 0) {
                clearInterval(fadeInterval);
                flash.dispose();
            }
        }, 50);
    }

    updateEnemyAnimations(enemy) {
        // انیمیشن‌های مختلف برای انواع دشمنان
        switch(enemy.type) {
            case 'fighter':
                enemy.mesh.rotation.z += 0.01;
                break;
            case 'bomber':
                enemy.mesh.rotation.x += 0.005;
                break;
            case 'interceptor':
                enemy.mesh.rotation.y += 0.02;
                break;
            case 'boss':
                enemy.mesh.rotation.y += 0.01;
                enemy.mesh.rotation.x += 0.005;
                break;
        }
        
        // پالس نور برای دشمنان آسیب دیده
        if (enemy.health < enemy.maxHealth * 0.5) {
            const intensity = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
            enemy.mesh.material.emissiveColor.scaleToRef(intensity, enemy.mesh.material.emissiveColor);
        }
    }

    destroyEnemy(index) {
        const enemy = this.enemies[index];
        
        if (enemy.mesh) {
            // ایجاد افکت انفجار بزرگ
            this.createEnemyExplosion(enemy.mesh.position, enemy.size);
            
            // حذف مش
            enemy.mesh.dispose();
        }
        
        // افزایش شمارنده
        this.destroyedCount++;
        
        // حذف از لیست
        this.enemies.splice(index, 1);
        
        console.log(`💥 دشمن نابود شد! تعداد کل: ${this.destroyedCount}`);
    }

    createEnemyExplosion(position, size) {
        // انفجار اصلی
        const explosion = BABYLON.Mesh.CreateSphere("explosion", 16, size * 2, this.scene);
        explosion.position = position.clone();
        
        const explosionMaterial = new BABYLON.StandardMaterial("explosionMaterial", this.scene);
        explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        explosionMaterial.alpha = 0.9;
        explosion.material = explosionMaterial;
        
        // سیستم ذره‌ای برای انفجار
        const particleSystem = new BABYLON.ParticleSystem("enemyExplosionParticles", 2000, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        particleSystem.emitter = position;
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.8;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.5;
        particleSystem.emitRate = 2000;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.color1 = new BABYLON.Color4(1, 1, 0, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1);
        particleSystem.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-3, -3, -3);
        particleSystem.direction2 = new BABYLON.Vector3(3, 3, 3);
        
        particleSystem.start();
        
        // انیمیشن انفجار
        let scale = 1;
        const growInterval = setInterval(() => {
            scale += 0.3;
            explosion.scaling = new BABYLON.Vector3(scale, scale, scale);
            explosionMaterial.alpha -= 0.1;
            
            if (explosionMaterial.alpha <= 0) {
                clearInterval(growInterval);
                explosion.dispose();
                particleSystem.stop();
                setTimeout(() => particleSystem.dispose(), 1000);
            }
        }, 50);
        
        // پخش صدای انفجار
        if (window.audioManager) {
            window.audioManager.playSound('explosion');
        }
        
        // ایجاد سکه‌های پاداش
        this.createRewardCoins(position, size);
    }

    createRewardCoins(position, size) {
        const coinCount = Math.floor(size * 3);
        
        for (let i = 0; i < coinCount; i++) {
            setTimeout(() => {
                this.createRewardCoin(position);
            }, i * 100);
        }
    }

    createRewardCoin(position) {
        const coin = BABYLON.Mesh.CreateTorus("rewardCoin", {
            diameter: 0.5,
            thickness: 0.1,
            tessellation: 12
        }, this.scene);
        
        coin.position = position.clone();
        
        // سرعت تصادفی
        const velocity = new BABYLON.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
        );
        
        const coinMaterial = new BABYLON.StandardMaterial("rewardCoinMaterial", this.scene);
        coinMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
        coin.material = coinMaterial;
        
        // اضافه کردن به لیست سکه‌های بازی
        if (window.gameEngine && window.gameEngine.coins) {
            window.gameEngine.coins.push({
                mesh: coin,
                value: 5,
                velocity: velocity,
                collected: false
            });
        }
    }

    clearEnemies() {
        this.stopSpawning();
        this.enemies.forEach(enemy => {
            if (enemy.mesh) {
                enemy.mesh.dispose();
            }
        });
        this.enemies = [];
        this.destroyedCount = 0;
        this.difficultyLevel = 1;
    }

    updateEnemyBullets() {
        if (!window.gameEngine || !window.gameEngine.enemyBullets) return;
        
        for (let i = window.gameEngine.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = window.gameEngine.enemyBullets[i];
            bullet.position.addInPlace(bullet.direction.scale(bullet.speed));
            
            // بررسی برخورد با بازیکن
            if (window.gameEngine.player && bullet.intersectsMesh(window.gameEngine.player, false)) {
                // آسیب به بازیکن
                window.gameEngine.playerHealth -= bullet.damage;
                window.gameEngine.createHitEffect(bullet.position);
                
                // حذف گلوله
                bullet.dispose();
                window.gameEngine.enemyBullets.splice(i, 1);
                
                if (window.gameEngine.playerHealth <= 0) {
                    window.gameEngine.gameOver();
                }
            }
            
            // حذف گلوله‌های دور شده
            if (bullet.position.length() > 100) {
                bullet.dispose();
                window.gameEngine.enemyBullets.splice(i, 1);
            }
        }
    }
}

// ایجاد نمونه مدیر دشمنان
window.enemyManager = new EnemyManager();

// اضافه کردن به حلقه به‌روزرسانی بازی
if (window.gameEngine) {
    window.gameEngine.scene.registerBeforeRender(() => {
        if (window.enemyManager) {
            window.enemyManager.updateEnemyBullets();
        }
    });
}

console.log('✅ سیستم دشمنان آماده است!');
