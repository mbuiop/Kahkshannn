// سیستم منطق بازی، دشمنان و امتیاز
class GameSystem {
    constructor(scene, ship) {
        this.scene = scene;
        this.ship = ship;
        
        this.enemies = [];
        this.coins = [];
        this.bullets = ship.bullets || [];
        this.enemyBullets = [];
        
        this.score = 0;
        this.health = 100;
        this.level = 1;
        
        this.createEnemies();
        this.createCoins();
        this.setupUI();
    }
    
    createEnemies() {
        // ایجاد انواع دشمنان
        const enemyTypes = [
            { type: "scout", count: 8, health: 30, speed: 0.02, color: new BABYLON.Color3(1, 0.6, 0.2) },
            { type: "fighter", count: 6, health: 60, speed: 0.015, color: new BABYLON.Color3(1, 0.3, 0.3) },
            { type: "bomber", count: 4, health: 100, speed: 0.01, color: new BABYLON.Color3(0.8, 0.2, 0.8) }
        ];
        
        enemyTypes.forEach(config => {
            for (let i = 0; i < config.count; i++) {
                this.spawnEnemy(config);
            }
        });
    }
    
    spawnEnemy(config) {
        const enemy = BABYLON.MeshBuilder.CreateSphere(`enemy_${config.type}`, {
            diameter: config.type === "scout" ? 1 : config.type === "fighter" ? 1.5 : 2,
            segments: 12
        }, this.scene);
        
        // موقعیت‌های مختلف برای دشمنان
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        
        enemy.position = new BABYLON.Vector3(
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 25,
            -50 - Math.random() * 40
        );
        
        const material = new BABYLON.PBRMetallicRoughnessMaterial(`enemyMat_${config.type}`, this.scene);
        material.baseColor = config.color;
        material.metallic = 0.7;
        material.roughness = 0.3;
        material.emissiveColor = config.color;
        enemy.material = material;
        
        // نور دشمن
        const light = new BABYLON.PointLight(`enemyLight_${config.type}`, enemy.position, this.scene);
        light.diffuse = config.color;
        light.intensity = 1;
        light.parent = enemy;
        
        this.enemies.push({
            mesh: enemy,
            light: light,
            type: config.type,
            health: config.health,
            maxHealth: config.health,
            speed: config.speed,
            lastShotTime: 0,
            shotDelay: 2000 + Math.random() * 1000,
            behavior: this.getEnemyBehavior(config.type)
        });
    }
    
    getEnemyBehavior(type) {
        const behaviors = {
            scout: { aggression: 0.3, accuracy: 0.4, evasion: 0.8 },
            fighter: { aggression: 0.7, accuracy: 0.6, evasion: 0.5 },
            bomber: { aggression: 0.9, accuracy: 0.8, evasion: 0.2 }
        };
        return behaviors[type];
    }
    
    createCoins() {
        // ایجاد سکه‌های جمع‌آوری
        for (let i = 0; i < 25; i++) {
            const coin = BABYLON.MeshBuilder.CreateSphere(`coin${i}`, {
                diameter: 0.6,
                segments: 16
            }, this.scene);
            
            coin.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 60,
                -20 - Math.random() * 100
            );
            
            const material = new BABYLON.PBRMetallicRoughnessMaterial(`coinMat${i}`, this.scene);
            material.baseColor = new BABYLON.Color3(1, 0.84, 0);
            material.metallic = 1.0;
            material.roughness = 0.1;
            material.emissiveColor = new BABYLON.Color3(1, 0.9, 0.3);
            coin.material = material;
            
            // نور سکه
            const light = new BABYLON.PointLight(`coinLight${i}`, coin.position, this.scene);
            light.diffuse = new BABYLON.Color3(1, 0.9, 0.3);
            light.intensity = 2;
            light.parent = coin;
            
            this.coins.push({
                mesh: coin,
                light: light,
                rotationSpeed: 0.04,
                value: 10
            });
        }
    }
    
    setupUI() {
        // ایجاد UI پویا
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            color: white;
            font-family: system-ui;
            font-size: 18px;
            z-index: 1000;
        `;
        
        this.scoreElement = document.createElement('div');
        this.healthElement = document.createElement('div');
        this.levelElement = document.createElement('div');
        
        this.uiContainer.appendChild(this.scoreElement);
        this.uiContainer.appendChild(this.healthElement);
        this.uiContainer.appendChild(this.levelElement);
        
        document.body.appendChild(this.uiContainer);
        this.updateUI();
    }
    
    updateUI() {
        this.scoreElement.textContent = `🏆 امتیاز: ${this.score}`;
        this.healthElement.textContent = `❤️ سلامتی: ${this.health}%`;
        this.levelElement.textContent = `🚀 مرحله: ${this.level}`;
        
        // تغییر رنگ بر اساس سلامتی
        if (this.health < 30) {
            this.healthElement.style.color = '#ff4444';
        } else if (this.health < 60) {
            this.healthElement.style.color = '#ffaa00';
        } else {
            this.healthElement.style.color = '#44ff44';
        }
    }
    
    update(deltaTime) {
        this.updateEnemies(deltaTime);
        this.updateCoins(deltaTime);
        this.updateEnemyBullets(deltaTime);
        this.checkCollisions();
        this.checkLevelProgress();
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            // حرکت به سمت بازیکن
            const direction = this.ship.ship.position.subtract(enemy.mesh.position);
            direction.normalize();
            
            // رفتارهای مختلف بر اساس نوع دشمن
            const distanceToPlayer = BABYLON.Vector3.Distance(enemy.mesh.position, this.ship.ship.position);
            
            if (distanceToPlayer > 20) {
                // تعقیب
                direction.scaleInPlace(enemy.speed * deltaTime * 60);
                enemy.mesh.position.addInPlace(direction);
            } else if (distanceToPlayer < 15 && Math.random() < enemy.behavior.evasion) {
                // فرار
                direction.scaleInPlace(-enemy.speed * 0.5 * deltaTime * 60);
                enemy.mesh.position.addInPlace(direction);
            }
            
            // چرخش به سمت بازیکن
            enemy.mesh.lookAt(this.ship.ship.position);
            
            // شلیک
            enemy.lastShotTime += deltaTime * 1000;
            if (enemy.lastShotTime > enemy.shotDelay && distanceToPlayer < 40) {
                if (Math.random() < enemy.behavior.aggression) {
                    this.enemyShoot(enemy);
                }
                enemy.lastShotTime = 0;
            }
            
            // انیمیشن چرخش
            enemy.mesh.rotation.y += 0.02 * deltaTime * 60;
        });
    }
    
    enemyShoot(enemy) {
        const bullet = BABYLON.MeshBuilder.CreateSphere("enemyBullet", {
            diameter: 0.25,
            segments: 8
        }, this.scene);
        
        bullet.position = enemy.mesh.position.clone();
        
        const material = new BABYLON.StandardMaterial("enemyBulletMat", this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 0.2, 0.2);
        bullet.material = material;
        
        const direction = this.ship.ship.position.subtract(enemy.mesh.position);
        direction.normalize();
        
        // دقت شلیک بر اساس نوع دشمن
        const accuracy = enemy.behavior.accuracy;
        direction.x += (Math.random() - 0.5) * (1 - accuracy) * 0.3;
        direction.y += (Math.random() - 0.5) * (1 - accuracy) * 0.3;
        direction.normalize();
        
        direction.scaleInPlace(0.8);
        
        this.enemyBullets.push({
            mesh: bullet,
            velocity: direction,
            lifeTime: 4000,
            damage: enemy.type === "bomber" ? 20 : 10
        });
    }
    
    updateCoins(deltaTime) {
        this.coins.forEach(coin => {
            coin.mesh.rotation.y += coin.rotationSpeed * deltaTime * 60;
            
            // حرکت شناور
            coin.mesh.position.y += Math.sin(Date.now() * 0.001 + coin.mesh.position.x) * 0.01 * deltaTime * 60;
        });
    }
    
    updateEnemyBullets(deltaTime) {
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            bullet.mesh.position.addInPlace(
                new BABYLON.Vector3(
                    bullet.velocity.x * deltaTime * 60,
                    bullet.velocity.y * deltaTime * 60,
                    bullet.velocity.z * deltaTime * 60
                )
            );
            
            bullet.lifeTime -= deltaTime * 1000;
            
            if (bullet.lifeTime <= 0) {
                bullet.mesh.dispose();
                this.enemyBullets.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        this.checkBulletCollisions();
        this.checkEnemyBulletCollisions();
        this.checkCoinCollisions();
        this.checkShipCollisions();
    }
    
    checkBulletCollisions() {
        // برخورد گلوله‌های بازیکن با دشمنان
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (BABYLON.Vector3.Distance(bullet.mesh.position, enemy.mesh.position) < 1.5) {
                    // برخورد تشخیص داده شد
                    enemy.health -= 25;
                    
                    // ایجاد انفجار
                    this.createExplosion(bullet.mesh.position, 0.5, new BABYLON.Color3(1, 0.2, 0.2));
                    
                    // حذف گلوله
                    bullet.mesh.dispose();
                    bullet.light.dispose();
                    this.bullets.splice(i, 1);
                    
                    // بررسی نابودی دشمن
                    if (enemy.health <= 0) {
                        this.createExplosion(enemy.mesh.position, 1, new BABYLON.Color3(1, 0, 0));
                        
                        // افزایش امتیاز
                        this.score += enemy.type === "scout" ? 50 : enemy.type === "fighter" ? 100 : 200;
                        this.updateUI();
                        
                        // حذف دشمن
                        enemy.mesh.dispose();
                        enemy.light.dispose();
                        this.enemies.splice(j, 1);
                        
                        // ایجاد دشمن جدید
                        setTimeout(() => {
                            this.spawnEnemy({
                                type: enemy.type,
                                health: enemy.maxHealth,
                                speed: enemy.speed,
                                color: enemy.mesh.material.emissiveColor
                            });
                        }, 3000);
                    }
                    
                    break;
                }
            }
        }
    }
    
    checkEnemyBulletCollisions() {
        // برخورد گلوله‌های دشمن با بازیکن
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            
            if (BABYLON.Vector3.Distance(bullet.mesh.position, this.ship.ship.position) < 2) {
                // آسیب به بازیکن
                this.health -= bullet.damage;
                this.updateUI();
                
                this.createExplosion(bullet.mesh.position, 0.3, new BABYLON.Color3(1, 0.8, 0));
                
                bullet.mesh.dispose();
                this.enemyBullets.splice(i, 1);
                
                // لرزش دوربین
                this.ship.cameraShake(0.2);
                
                // بررسی پایان بازی
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    checkCoinCollisions() {
        // جمع‌آوری سکه‌ها
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            
            if (BABYLON.Vector3.Distance(coin.mesh.position, this.ship.ship.position) < 1.5) {
                // جمع‌آوری سکه
                this.score += coin.value;
                this.health = Math.min(100, this.health + 5);
                this.updateUI();
                
                this.createExplosion(coin.mesh.position, 0.4, new BABYLON.Color3(1, 0.9, 0));
                
                coin.mesh.dispose();
                coin.light.dispose();
                this.coins.splice(i, 1);
                
                // ایجاد سکه جدید
                setTimeout(() => {
                    this.createNewCoin();
                }, 2000);
            }
        }
    }
    
    checkShipCollisions() {
        // برخورد مستقیم با دشمنان
        this.enemies.forEach(enemy => {
            if (BABYLON.Vector3.Distance(enemy.mesh.position, this.ship.ship.position) < 2.5) {
                this.health -= 15;
                this.updateUI();
                
                this.createExplosion(enemy.mesh.position, 0.8, new BABYLON.Color3(1, 0.5, 0));
                
                // پس‌زدن دشمن
                const direction = enemy.mesh.position.subtract(this.ship.ship.position);
                direction.normalize();
                direction.scaleInPlace(3);
                enemy.mesh.position.addInPlace(direction);
                
                this.ship.cameraShake(0.3);
                
                if (this.health <= 0) {
                    this.gameOver();
                }
            }
        });
    }
    
    createNewCoin() {
        const i = this.coins.length;
        const coin = BABYLON.MeshBuilder.CreateSphere(`coin${i}`, {
            diameter: 0.6,
            segments: 16
        }, this.scene);
        
        coin.position = new BABYLON.Vector3(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 60,
            -20 - Math.random() * 100
        );
        
        const material = new BABYLON.PBRMetallicRoughnessMaterial(`coinMat${i}`, this.scene);
        material.baseColor = new BABYLON.Color3(1, 0.84, 0);
        material.metallic = 1.0;
        material.roughness = 0.1;
        material.emissiveColor = new BABYLON.Color3(1, 0.9, 0.3);
        coin.material = material;
        
        const light = new BABYLON.PointLight(`coinLight${i}`, coin.position, this.scene);
        light.diffuse = new BABYLON.Color3(1, 0.9, 0.3);
        light.intensity = 2;
        light.parent = coin;
        
        this.coins.push({
            mesh: coin,
            light: light,
            rotationSpeed: 0.04,
            value: 10
        });
    }
    
    createExplosion(position, scale, color) {
        // استفاده از سیستم گرافیک برای ایجاد انفجار
        if (window.graphicsSystem) {
            window.graphicsSystem.createExplosion(position, scale, color);
        }
    }
    
    checkLevelProgress() {
        // پیشرفت مرحله
        if (this.score >= this.level * 1000) {
            this.level++;
            this.updateUI();
            this.increaseDifficulty();
        }
    }
    
    increaseDifficulty() {
        // افزایش سختی بازی
        this.enemies.forEach(enemy => {
            enemy.speed *= 1.1;
            enemy.shotDelay *= 0.9;
        });
    }
    
    gameOver() {
        // پایان بازی
        this.createExplosion(this.ship.ship.position, 3, new BABYLON.Color3(1, 0, 0));
        
        // نمایش پیام پایان بازی
        const gameOverDiv = document.createElement('div');
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff4444;
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            z-index: 1001;
            text-shadow: 0 0 10px #ff0000;
        `;
        gameOverDiv.textContent = '💀 بازی پایان یافت!';
        
        const restartDiv = document.createElement('div');
        restartDiv.style.cssText = `
            color: white;
            font-size: 24px;
            margin-top: 20px;
            cursor: pointer;
        `;
        restartDiv.textContent = '🔄 کلیک کن برای شروع مجدد';
        restartDiv.onclick = () => location.reload();
        
        gameOverDiv.appendChild(restartDiv);
        document.body.appendChild(gameOverDiv);
    }
          }
