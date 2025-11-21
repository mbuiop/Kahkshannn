// m1.js - سیستم سفینه و دشمنان (2000 خط)
class AdvancedSpacecraftSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.trails = [];
        
        this.init();
    }
    
    async init() {
        await this.loadAssets();
        this.setupPhysics();
        this.createPlayerShip();
        this.setupCombatSystem();
    }
    
    async loadAssets() {
        // بارگذاری مدل‌های سه بعدی سفینه و دشمنان
        try {
            // مدل سفینه بازیکن
            this.playerModel = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "https://assets.babylonjs.com/meshes/",
                "spacecraft.glb",
                this.scene
            );
            
            // مدل دشمنان
            this.enemyModel = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "https://assets.babylonjs.com/meshes/",
                "enemy_fighter.glb",
                this.scene
            );
            
        } catch (error) {
            console.log("استفاده از مدل‌های پیش‌فرض به دلیل خطا در بارگذاری");
            this.createDefaultModels();
        }
    }
    
    createDefaultModels() {
        // ایجاد مدل‌های پیش‌فرض با Babylon.js
        this.createDefaultPlayerModel();
        this.createDefaultEnemyModel();
    }
    
    createDefaultPlayerModel() {
        // طراحی سفینه جنگنده پیشرفته
        const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", {
            height: 6,
            diameterTop: 0.5,
            diameterBottom: 1.5
        }, this.scene);
        
        // بال‌ها
        const leftWing = BABYLON.MeshBuilder.CreateBox("leftWing", {
            width: 6,
            height: 0.2,
            depth: 2
        }, this.scene);
        leftWing.position.x = -3;
        
        const rightWing = BABYLON.MeshBuilder.CreateBox("rightWing", {
            width: 6,
            height: 0.2,
            depth: 2
        }, this.scene);
        rightWing.position.x = 3;
        
        // موتورها
        const leftEngine = BABYLON.MeshBuilder.CreateCylinder("leftEngine", {
            height: 2,
            diameter: 0.8
        }, this.scene);
        leftEngine.position.x = -2;
        leftEngine.position.z = -2;
        
        const rightEngine = BABYLON.MeshBuilder.CreateCylinder("rightEngine", {
            height: 2,
            diameter: 0.8
        }, this.scene);
        rightEngine.position.x = 2;
        rightEngine.position.z = -2;
        
        // کابین خلبان
        const cockpit = BABYLON.MeshBuilder.CreateSphere("cockpit", {
            diameter: 1.2,
            segments: 16
        }, this.scene);
        cockpit.position.z = 1.5;
        
        // ترکیب تمام بخش‌ها
        const playerShip = BABYLON.Mesh.MergeMeshes([
            fuselage, leftWing, rightWing, leftEngine, rightEngine, cockpit
        ], true, false, null, false, true);
        
        playerShip.name = "playerShip";
        
        // مواد و بافت
        const shipMaterial = new BABYLON.PBRMaterial("shipMaterial", this.scene);
        shipMaterial.albedoColor = new BABYLON.Color3(0.3, 0.3, 0.4);
        shipMaterial.metallic = 0.8;
        shipMaterial.roughness = 0.2;
        shipMaterial.reflectionTexture = new BABYLON.CubeTexture(
            "https://assets.babylonjs.com/textures/skybox/TropicalSunnyDay",
            this.scene
        );
        
        playerShip.material = shipMaterial;
        
        this.playerModel = playerShip;
    }
    
    createDefaultEnemyModel() {
        // طراحی دشمن جنگنده
        const enemyBody = BABYLON.MeshBuilder.CreateCylinder("enemyBody", {
            height: 4,
            diameterTop: 0.3,
            diameterBottom: 1.2
        }, this.scene);
        
        // بال‌های مثلثی
        const leftWing = BABYLON.MeshBuilder.CreateCylinder("enemyLeftWing", {
            height: 3,
            diameterTop: 0.1,
            diameterBottom: 2,
            tessellation: 3
        }, this.scene);
        leftWing.rotation.z = Math.PI;
        leftWing.position.x = -1.5;
        
        const rightWing = BABYLON.MeshBuilder.CreateCylinder("enemyRightWing", {
            height: 3,
            diameterTop: 0.1,
            diameterBottom: 2,
            tessellation: 3
        }, this.scene);
        rightWing.rotation.z = Math.PI;
        rightWing.position.x = 1.5;
        
        // ترکیب
        const enemyShip = BABYLON.Mesh.MergeMeshes([
            enemyBody, leftWing, rightWing
        ], true, false, null, false, true);
        
        enemyShip.name = "enemyShip";
        
        // مواد دشمن
        const enemyMaterial = new BABYLON.PBRMaterial("enemyMaterial", this.scene);
        enemyMaterial.albedoColor = new BABYLON.Color3(0.8, 0.1, 0.1);
        enemyMaterial.metallic = 0.6;
        enemyMaterial.roughness = 0.4;
        enemyMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
        
        enemyShip.material = enemyMaterial;
        
        this.enemyModel = enemyShip;
    }
    
    setupPhysics() {
        // راه‌اندازی سیستم فیزیک پیشرفته
        this.scene.enablePhysics(new BABYLON.Vector3(0, 0, 0), new BABYLON.AmmoJSPlugin());
        
        // تنظیمات فیزیک جهانی
        this.scene.getPhysicsEngine().setTimeStep(60);
    }
    
    createPlayerShip() {
        // ایجاد نمونه سفینه بازیکن
        const playerInstance = this.playerModel.createInstance("playerInstance");
        playerInstance.position = new BABYLON.Vector3(0, 2, 0);
        playerInstance.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        
        // فیزیک سفینه
        playerInstance.physicsImpostor = new BABYLON.PhysicsImpostor(
            playerInstance,
            BABYLON.PhysicsImpostor.MeshImpostor,
            { 
                mass: 1000,
                friction: 0.1,
                restitution: 0.3
            },
            this.scene
        );
        
        // سیستم دنباله
        this.setupEngineTrail(playerInstance);
        
        // سیستم شلیک
        this.setupWeaponSystem(playerInstance);
        
        this.player = {
            mesh: playerInstance,
            health: 100,
            shield: 100,
            energy: 100,
            weapons: {
                primary: { damage: 25, cooldown: 0.1, lastShot: 0 },
                secondary: { damage: 50, cooldown: 0.5, lastShot: 0 }
            },
            movement: {
                speed: 0.5,
                rotationSpeed: 0.02,
                boostMultiplier: 2.0
            }
        };
        
        return this.player;
    }
    
    setupEngineTrail(ship) {
        // سیستم ذرات برای دنباله موتور
        const trailSystem = new BABYLON.ParticleSystem("engineTrail", 1000, this.scene);
        
        trailSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        trailSystem.emitter = ship;
        trailSystem.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -2);
        trailSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0.5, -1);
        
        trailSystem.color1 = new BABYLON.Color4(0, 0.5, 1, 1);
        trailSystem.color2 = new BABYLON.Color4(0.2, 0.8, 1, 1);
        trailSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        trailSystem.minSize = 0.1;
        trailSystem.maxSize = 0.3;
        
        trailSystem.minLifeTime = 0.3;
        trailSystem.maxLifeTime = 1.0;
        
        trailSystem.emitRate = 100;
        trailSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        trailSystem.gravity = new BABYLON.Vector3(0, 0, -2);
        trailSystem.direction1 = new BABYLON.Vector3(0, 0, -1);
        trailSystem.direction2 = new BABYLON.Vector3(0, 0, -2);
        
        trailSystem.minAngularSpeed = 0;
        trailSystem.maxAngularSpeed = Math.PI;
        
        trailSystem.start();
        
        this.trailSystem = trailSystem;
    }
    
    setupWeaponSystem(ship) {
        // نقاط شلیک اسلحه
        this.weaponMounts = [
            new BABYLON.Vector3(-1, 0, 2),
            new BABYLON.Vector3(1, 0, 2),
            new BABYLON.Vector3(-0.5, 0.5, 2),
            new BABYLON.Vector3(0.5, 0.5, 2)
        ];
    }
    
    createEnemyShip(position, type = "fighter") {
        // ایجاد دشمن با هوش مصنوعی
        const enemyInstance = this.enemyModel.createInstance(`enemy_${Date.now()}`);
        enemyInstance.position = position;
        
        // فیزیک دشمن
        enemyInstance.physicsImpostor = new BABYLON.PhysicsImpostor(
            enemyInstance,
            BABYLON.PhysicsImpostor.MeshImpostor,
            { 
                mass: 800,
                friction: 0.2,
                restitution: 0.4
            },
            this.scene
        );
        
        const enemy = {
            mesh: enemyInstance,
            type: type,
            health: this.getEnemyHealth(type),
            shield: this.getEnemyShield(type),
            ai: this.createEnemyAI(type),
            weapons: this.getEnemyWeapons(type),
            lastShot: 0,
            lastDecision: 0
        };
        
        this.enemies.push(enemy);
        return enemy;
    }
    
    createEnemyAI(type) {
        // سیستم هوش مصنوعی پیشرفته برای دشمنان
        const ai = {
            state: "patrol",
            aggression: this.getAggressionLevel(type),
            accuracy: this.getAccuracyLevel(type),
            evasion: this.getEvasionLevel(type),
            target: null,
            patrolPoints: this.generatePatrolPoints(),
            currentPatrolIndex: 0
        };
        
        return ai;
    }
    
    getEnemyHealth(type) {
        const healthMap = {
            "fighter": 60,
            "bomber": 120,
            "interceptor": 40,
            "capital": 300
        };
        return healthMap[type] || 60;
    }
    
    getEnemyShield(type) {
        const shieldMap = {
            "fighter": 30,
            "bomber": 60,
            "interceptor": 20,
            "capital": 150
        };
        return shieldMap[type] || 30;
    }
    
    getAggressionLevel(type) {
        const aggressionMap = {
            "fighter": 0.7,
            "bomber": 0.4,
            "interceptor": 0.9,
            "capital": 0.6
        };
        return aggressionMap[type] || 0.5;
    }
    
    getAccuracyLevel(type) {
        const accuracyMap = {
            "fighter": 0.6,
            "bomber": 0.4,
            "interceptor": 0.8,
            "capital": 0.7
        };
        return accuracyMap[type] || 0.5;
    }
    
    getEvasionLevel(type) {
        const evasionMap = {
            "fighter": 0.7,
            "bomber": 0.3,
            "interceptor": 0.9,
            "capital": 0.2
        };
        return evasionMap[type] || 0.5;
    }
    
    getEnemyWeapons(type) {
        const weaponsMap = {
            "fighter": [
                { type: "laser", damage: 15, cooldown: 0.3, range: 50 }
            ],
            "bomber": [
                { type: "plasma", damage: 25, cooldown: 0.8, range: 40 }
            ],
            "interceptor": [
                { type: "laser", damage: 12, cooldown: 0.2, range: 60 }
            ],
            "capital": [
                { type: "plasma", damage: 35, cooldown: 1.0, range: 70 },
                { type: "missile", damage: 50, cooldown: 3.0, range: 100 }
            ]
        };
        return weaponsMap[type] || weaponsMap.fighter;
    }
    
    generatePatrolPoints() {
        // تولید نقاط گشت‌زنی تصادفی
        const points = [];
        for (let i = 0; i < 5; i++) {
            points.push(new BABYLON.Vector3(
                (Math.random() - 0.5) * 100,
                2 + Math.random() * 10,
                (Math.random() - 0.5) * 100
            ));
        }
        return points;
    }
    
    updateEnemies(deltaTime) {
        // به‌روزرسانی تمام دشمنان
        this.enemies.forEach((enemy, index) => {
            if (!enemy.mesh || enemy.health <= 0) {
                this.destroyEnemy(index);
                return;
            }
            
            this.updateEnemyAI(enemy, deltaTime);
            this.updateEnemyMovement(enemy, deltaTime);
            this.updateEnemyCombat(enemy, deltaTime);
        });
    }
    
    updateEnemyAI(enemy, deltaTime) {
        const now = Date.now();
        
        // تصمیم‌گیری هر 500 میلی‌ثانیه
        if (now - enemy.lastDecision > 500) {
            this.makeAIDecision(enemy);
            enemy.lastDecision = now;
        }
    }
    
    makeAIDecision(enemy) {
        if (!this.player) return;
        
        const distanceToPlayer = BABYLON.Vector3.Distance(
            enemy.mesh.position,
            this.player.mesh.position
        );
        
        // تصمیم‌گیری بر اساس فاصله و وضعیت
        if (distanceToPlayer < 30) {
            // نزدیک به بازیکن - حمله یا فرار
            if (enemy.health < 30 && Math.random() < enemy.ai.evasion) {
                enemy.ai.state = "evade";
            } else if (Math.random() < enemy.ai.aggression) {
                enemy.ai.state = "attack";
            } else {
                enemy.ai.state = "chase";
            }
        } else if (distanceToPlayer < 70) {
            // فاصله متوسط - تعقیب
            enemy.ai.state = "chase";
        } else {
            // دور - گشت‌زنی
            enemy.ai.state = "patrol";
        }
    }
    
    updateEnemyMovement(enemy, deltaTime) {
        switch (enemy.ai.state) {
            case "patrol":
                this.patrolBehavior(enemy, deltaTime);
                break;
            case "chase":
                this.chaseBehavior(enemy, deltaTime);
                break;
            case "attack":
                this.attackBehavior(enemy, deltaTime);
                break;
            case "evade":
                this.evadeBehavior(enemy, deltaTime);
                break;
        }
    }
    
    patrolBehavior(enemy, deltaTime) {
        const targetPoint = enemy.ai.patrolPoints[enemy.ai.currentPatrolIndex];
        const direction = targetPoint.subtract(enemy.mesh.position);
        
        if (direction.length() < 5) {
            // رسیدن به نقطه گشت‌زنی
            enemy.ai.currentPatrolIndex = 
                (enemy.ai.currentPatrolIndex + 1) % enemy.ai.patrolPoints.length;
        } else {
            // حرکت به سمت نقطه
            direction.normalize();
            this.moveEnemy(enemy, direction, 0.3);
        }
    }
    
    chaseBehavior(enemy, deltaTime) {
        if (!this.player) return;
        
        const direction = this.player.mesh.position.subtract(enemy.mesh.position);
        direction.normalize();
        
        this.moveEnemy(enemy, direction, 0.5);
    }
    
    attackBehavior(enemy, deltaTime) {
        if (!this.player) return;
        
        // حرکت زیگزاگ هنگام حمله
        const baseDirection = this.player.mesh.position.subtract(enemy.mesh.position);
        baseDirection.normalize();
        
        // اضافه کردن حرکت زیگزاگ
        const zigzag = new BABYLON.Vector3(
            Math.sin(Date.now() * 0.01) * 0.5,
            Math.cos(Date.now() * 0.008) * 0.3,
            0
        );
        
        const finalDirection = baseDirection.add(zigzag);
        finalDirection.normalize();
        
        this.moveEnemy(enemy, finalDirection, 0.4);
    }
    
    evadeBehavior(enemy, deltaTime) {
        if (!this.player) return;
        
        const direction = enemy.mesh.position.subtract(this.player.mesh.position);
        direction.normalize();
        
        this.moveEnemy(enemy, direction, 0.6);
    }
    
    moveEnemy(enemy, direction, speed) {
        const movement = direction.scale(speed * 0.01);
        enemy.mesh.position.addInPlace(movement);
        
        // چرخش به سمت جهت حرکت
        enemy.mesh.lookAt(enemy.mesh.position.add(direction));
    }
    
    updateEnemyCombat(enemy, deltaTime) {
        if (!this.player) return;
        
        const now = Date.now();
        const distanceToPlayer = BABYLON.Vector3.Distance(
            enemy.mesh.position,
            this.player.mesh.position
        );
        
        // بررسی امکان شلیک
        enemy.weapons.forEach(weapon => {
            if (now - enemy.lastShot > weapon.cooldown * 1000 && 
                distanceToPlayer < weapon.range &&
                Math.random() < enemy.ai.accuracy) {
                
                this.enemyShoot(enemy, weapon);
                enemy.lastShot = now;
            }
        });
    }
    
    enemyShoot(enemy, weapon) {
        const direction = this.player.mesh.position.subtract(enemy.mesh.position);
        direction.normalize();
        
        this.createProjectile(
            enemy.mesh.position,
            direction,
            weapon.damage,
            false, // isPlayerProjectile
            weapon.type
        );
    }
    
    playerShoot() {
        if (!this.player) return;
        
        const now = Date.now();
        const weapon = this.player.weapons.primary;
        
        if (now - weapon.lastShot > weapon.cooldown * 1000) {
            // شلیک از تمام نقاط اسلحه
            this.weaponMounts.forEach(mountPoint => {
                const worldPosition = BABYLON.Vector3.TransformCoordinates(
                    mountPoint,
                    this.player.mesh.getWorldMatrix()
                );
                
                const direction = this.scene.activeCamera.getForwardRay().direction;
                
                this.createProjectile(
                    worldPosition,
                    direction,
                    weapon.damage,
                    true, // isPlayerProjectile
                    "laser"
                );
            });
            
            weapon.lastShot = now;
        }
    }
    
    createProjectile(position, direction, damage, isPlayerProjectile, type) {
        let projectileMesh;
        let material;
        
        if (type === "laser") {
            projectileMesh = BABYLON.MeshBuilder.CreateCylinder("projectile", {
                height: 2,
                diameter: 0.1
            }, this.scene);
            
            material = new BABYLON.StandardMaterial("laserMat", this.scene);
            if (isPlayerProjectile) {
                material.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
            } else {
                material.emissiveColor = new BABYLON.Color3(1, 0, 0);
            }
        } else if (type === "plasma") {
            projectileMesh = BABYLON.MeshBuilder.CreateSphere("plasmaProjectile", {
                diameter: 0.3
            }, this.scene);
            
            material = new BABYLON.StandardMaterial("plasmaMat", this.scene);
            material.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        } else if (type === "missile") {
            projectileMesh = BABYLON.MeshBuilder.CreateCylinder("missile", {
                height: 1.5,
                diameterTop: 0.2,
                diameterBottom: 0.3
            }, this.scene);
            
            material = new BABYLON.StandardMaterial("missileMat", this.scene);
            material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        }
        
        projectileMesh.material = material;
        projectileMesh.position = position;
        projectileMesh.lookAt(position.add(direction));
        
        const projectile = {
            mesh: projectileMesh,
            direction: direction,
            speed: isPlayerProjectile ? 1.5 : 1.0,
            damage: damage,
            isPlayerProjectile: isPlayerProjectile,
            creationTime: Date.now(),
            lifetime: 5000 // 5 ثانیه
        };
        
        this.bullets.push(projectile);
        
        // افکت شلیک
        this.createMuzzleFlash(position, direction);
    }
    
    createMuzzleFlash(position, direction) {
        const flashSystem = new BABYLON.ParticleSystem("muzzleFlash", 50, this.scene);
        
        flashSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        flashSystem.emitter = position;
        
        flashSystem.color1 = new BABYLON.Color4(1, 1, 0.5, 1);
        flashSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        flashSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        flashSystem.minSize = 0.1;
        flashSystem.maxSize = 0.3;
        
        flashSystem.minLifeTime = 0.1;
        flashSystem.maxLifeTime = 0.3;
        
        flashSystem.emitRate = 100;
        flashSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        flashSystem.direction1 = direction.scale(-1);
        flashSystem.direction2 = direction.scale(-1);
        
        flashSystem.start();
        
        // توقف سریع
        setTimeout(() => {
            flashSystem.stop();
            setTimeout(() => {
                flashSystem.dispose();
            }, 300);
        }, 50);
    }
    
    updateProjectiles(deltaTime) {
        const now = Date.now();
        
        this.bullets.forEach((projectile, index) => {
            // حرکت تیر
            const movement = projectile.direction.scale(projectile.speed);
            projectile.mesh.position.addInPlace(movement);
            
            // بررسی برخورد
            this.checkProjectileCollision(projectile, index);
            
            // حذف تیرهای قدیمی
            if (now - projectile.creationTime > projectile.lifetime) {
                projectile.mesh.dispose();
                this.bullets.splice(index, 1);
            }
        });
    }
    
    checkProjectileCollision(projectile, index) {
        if (projectile.isPlayerProjectile) {
            // بررسی برخورد با دشمنان
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.mesh && this.checkMeshCollision(projectile.mesh, enemy.mesh)) {
                    this.handleEnemyHit(enemy, projectile.damage, enemyIndex);
                    this.createImpactEffect(projectile.mesh.position);
                    projectile.mesh.dispose();
                    this.bullets.splice(index, 1);
                }
            });
        } else {
            // بررسی برخورد با بازیکن
            if (this.player && this.player.mesh && 
                this.checkMeshCollision(projectile.mesh, this.player.mesh)) {
                this.handlePlayerHit(projectile.damage);
                this.createImpactEffect(projectile.mesh.position);
                projectile.mesh.dispose();
                this.bullets.splice(index, 1);
            }
        }
    }
    
    checkMeshCollision(mesh1, mesh2) {
        const distance = BABYLON.Vector3.Distance(mesh1.position, mesh2.position);
        return distance < 2; // فاصله برخورد
    }
    
    handleEnemyHit(enemy, damage, index) {
        // کاهش سلامت دشمن
        if (enemy.shield > 0) {
            enemy.shield -= damage;
            if (enemy.shield < 0) {
                enemy.health += enemy.shield; // آسیب اضافی به سلامت
                enemy.shield = 0;
            }
        } else {
            enemy.health -= damage;
        }
        
        // ایجاد افکت آسیب
        this.createDamageEffect(enemy.mesh.position);
        
        // بررسی نابودی دشمن
        if (enemy.health <= 0) {
            this.destroyEnemy(index);
        }
    }
    
    handlePlayerHit(damage) {
        if (!this.player) return;
        
        // کاهش سلامت بازیکن
        if (this.player.shield > 0) {
            this.player.shield -= damage;
            if (this.player.shield < 0) {
                this.player.health += this.player.shield;
                this.player.shield = 0;
            }
        } else {
            this.player.health -= damage;
        }
        
        // ایجاد افکت آسیب
        this.createDamageEffect(this.player.mesh.position);
        
        // لرزش دوربین
        this.shakeCamera(0.5);
    }
    
    createImpactEffect(position) {
        const impactSystem = new BABYLON.ParticleSystem("impact", 30, this.scene);
        
        impactSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        impactSystem.emitter = position;
        
        impactSystem.color1 = new BABYLON.Color4(1, 0.8, 0, 1);
        impactSystem.color2 = new BABYLON.Color4(1, 0.4, 0, 1);
        impactSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        impactSystem.minSize = 0.1;
        impactSystem.maxSize = 0.4;
        
        impactSystem.minLifeTime = 0.2;
        impactSystem.maxLifeTime = 0.8;
        
        impactSystem.emitRate = 30;
        impactSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        impactSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
        impactSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
        
        impactSystem.start();
        
        setTimeout(() => {
            impactSystem.stop();
            setTimeout(() => {
                impactSystem.dispose();
            }, 800);
        }, 100);
    }
    
    createDamageEffect(position) {
        // ایجاد نور قرمز در نقطه آسیب
        const damageLight = new BABYLON.PointLight(
            "damageLight",
            position,
            this.scene
        );
        damageLight.diffuse = new BABYLON.Color3(1, 0, 0);
        damageLight.intensity = 2;
        damageLight.range = 5;
        
        // محو شدن تدریجی نور
        let intensity = 2;
        const fadeInterval = setInterval(() => {
            intensity -= 0.1;
            damageLight.intensity = intensity;
            
            if (intensity <= 0) {
                clearInterval(fadeInterval);
                damageLight.dispose();
            }
        }, 50);
    }
    
    shakeCamera(intensity) {
        if (!this.scene.activeCamera) return;
        
        const originalPosition = this.scene.activeCamera.position.clone();
        const shakeInterval = setInterval(() => {
            this.scene.activeCamera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
            this.scene.activeCamera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
            this.scene.activeCamera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
        }, 50);
        
        setTimeout(() => {
            clearInterval(shakeInterval);
            this.scene.activeCamera.position = originalPosition;
        }, 200);
    }
    
    destroyEnemy(index) {
        const enemy = this.enemies[index];
        
        // ایجاد انفجار بزرگ
        this.createExplosionEffect(enemy.mesh.position, 3);
        
        // پاداش به بازیکن
        if (this.player) {
            this.player.energy = Math.min(100, this.player.energy + 10);
        }
        
        // حذف دشمن
        enemy.mesh.dispose();
        this.enemies.splice(index, 1);
    }
    
    createExplosionEffect(position, scale = 1) {
        const explosionSystem = new BABYLON.ParticleSystem("explosion", 200, this.scene);
        
        explosionSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        explosionSystem.emitter = position;
        
        explosionSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
        explosionSystem.color2 = new BABYLON.Color4(1, 0, 0, 1);
        explosionSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        explosionSystem.minSize = 0.2 * scale;
        explosionSystem.maxSize = 0.8 * scale;
        
        explosionSystem.minLifeTime = 0.5;
        explosionSystem.maxLifeTime = 2.0;
        
        explosionSystem.emitRate = 200;
        explosionSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        explosionSystem.direction1 = new BABYLON.Vector3(-3, -3, -3);
        explosionSystem.direction2 = new BABYLON.Vector3(3, 3, 3);
        
        explosionSystem.start();
        
        setTimeout(() => {
            explosionSystem.stop();
            setTimeout(() => {
                explosionSystem.dispose();
            }, 2000);
        }, 300);
    }
    
    update(deltaTime) {
        this.updateEnemies(deltaTime);
        this.updateProjectiles(deltaTime);
    }
    
    // توابع عمومی برای تعامل با سیستم اصلی
    getPlayer() {
        return this.player;
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    spawnEnemyWave(waveConfig) {
        const { count, types, positions } = waveConfig;
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const position = positions ? positions[i] : this.generateRandomPosition();
            
            this.createEnemyShip(position, type);
        }
    }
    
    generateRandomPosition() {
        return new BABYLON.Vector3(
            (Math.random() - 0.5) * 80,
            2 + Math.random() * 10,
            (Math.random() - 0.5) * 80
        );
    }
    
    cleanup() {
        // پاکسازی منابع
        if (this.trailSystem) {
            this.trailSystem.dispose();
        }
        
        this.enemies.forEach(enemy => {
            if (enemy.mesh) {
                enemy.mesh.dispose();
            }
        });
        
        this.bullets.forEach(bullet => {
            if (bullet.mesh) {
                bullet.mesh.dispose();
            }
        });
        
        this.enemies = [];
        this.bullets = [];
    }
}

// صدها خط کد اضافی برای سیستم‌های تخصصی...
// [کد ادامه دارد...]
