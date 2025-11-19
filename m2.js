// m2.js - سیستم مدیریت موجودیت‌ها و انیمیشن
class EntityManager {
    constructor(scene) {
        this.scene = scene;
        this.entities = [];
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        
        this.init();
    }
    
    init() {
        console.log("✅ سیستم مدیریت موجودیت‌ها راه‌اندازی شد");
    }
    
    createEnemy(type, position, difficulty = 1) {
        console.log(`🎯 ایجاد دشمن نوع: ${type} در موقعیت:`, position);
        
        let geometry, material;
        
        switch(type) {
            case 'scout':
                geometry = new THREE.ConeGeometry(1.5, 3, 8);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xff0000,
                    shininess: 100
                });
                break;
            case 'fighter':
                geometry = new THREE.OctahedronGeometry(2);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xaa0000,
                    shininess: 100
                });
                break;
            case 'bomber':
                geometry = new THREE.DodecahedronGeometry(2.5);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0x880000,
                    shininess: 100
                });
                break;
            default:
                geometry = new THREE.SphereGeometry(1.5, 8, 8);
                material = new THREE.MeshPhongMaterial({ color: 0xff4444 });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        const enemy = {
            type: type,
            mesh: mesh,
            position: position.clone(),
            health: 20 * difficulty,
            maxHealth: 20 * difficulty,
            speed: 5 + difficulty * 0.5,
            damage: 10 * difficulty,
            fireRate: 2,
            lastFire: 0,
            dead: false,
            boundingBox: new THREE.Box3().setFromObject(mesh)
        };
        
        this.scene.add(mesh);
        this.entities.push(enemy);
        this.enemies.push(enemy);
        
        // انیمیشن ظهور
        mesh.scale.set(0.1, 0.1, 0.1);
        gsap.to(mesh.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
        
        return enemy;
    }
    
    createProjectile(position, velocity, damage, owner, color = 0xffffff) {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            emissive: color
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        const projectile = {
            mesh: mesh,
            position: position.clone(),
            velocity: velocity.clone(),
            damage: damage,
            owner: owner,
            life: 3.0,
            dead: false,
            boundingBox: new THREE.Box3().setFromObject(mesh)
        };
        
        this.scene.add(mesh);
        this.entities.push(projectile);
        this.projectiles.push(projectile);
        
        return projectile;
    }
    
    createPowerUp(type, position) {
        let geometry, material, color;
        
        switch(type) {
            case 'health':
                geometry = new THREE.OctahedronGeometry(1.5);
                color = 0xff0000;
                break;
            case 'energy':
                geometry = new THREE.DodecahedronGeometry(1.5);
                color = 0x00ff00;
                break;
            case 'weapon':
                geometry = new THREE.IcosahedronGeometry(1.5);
                color = 0x0000ff;
                break;
            default:
                geometry = new THREE.SphereGeometry(1.5);
                color = 0xffff00;
        }
        
        material = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        
        const powerUp = {
            type: type,
            mesh: mesh,
            position: position.clone(),
            collected: false,
            dead: false,
            boundingBox: new THREE.Box3().setFromObject(mesh)
        };
        
        this.scene.add(mesh);
        this.entities.push(powerUp);
        this.powerUps.push(powerUp);
        
        // انیمیشن شناور
        this.animatePowerUp(powerUp);
        
        return powerUp;
    }
    
    animatePowerUp(powerUp) {
        // انیمیشن شناور
        gsap.to(powerUp.mesh.position, {
            y: powerUp.position.y + 2,
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
        
        // انیمیشن چرخش
        gsap.to(powerUp.mesh.rotation, {
            x: Math.PI * 2,
            y: Math.PI * 2,
            duration: 5,
            ease: "none",
            repeat: -1
        });
        
        // انیمیشن پالس
        gsap.to(powerUp.mesh.scale, {
            x: 1.3,
            y: 1.3,
            z: 1.3,
            duration: 1,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    }
    
    update(deltaTime) {
        // به‌روزرسانی تمام موجودیت‌ها
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            
            if (entity.dead) {
                this.removeEntity(entity);
                continue;
            }
            
            // به‌روزرسانی موقعیت بصری
            if (entity.mesh && entity.position) {
                entity.mesh.position.copy(entity.position);
            }
            
            // به‌روزرسانی bounding box
            if (entity.boundingBox && entity.mesh) {
                entity.boundingBox.setFromObject(entity.mesh);
            }
            
            // به‌روزرسانی دشمنان
            if (this.enemies.includes(entity)) {
                this.updateEnemy(entity, deltaTime);
            }
            
            // به‌روزرسانی پرتابه‌ها
            if (this.projectiles.includes(entity)) {
                this.updateProjectile(entity, deltaTime);
            }
            
            // به‌روزرسانی power-up‌ها
            if (this.powerUps.includes(entity)) {
                this.updatePowerUp(entity, deltaTime);
            }
        }
    }
    
    updateEnemy(enemy, deltaTime) {
        // به‌روزرسانی رفتار دشمن
        const player = window.gameFighter ? window.gameFighter.getPlayer() : null;
        
        if (player && player.position) {
            // حرکت به سمت بازیکن
            const direction = player.position.clone().sub(enemy.position).normalize();
            enemy.position.add(direction.multiplyScalar(enemy.speed * deltaTime));
            
            // چرخش به سمت بازیکن
            if (enemy.mesh) {
                enemy.mesh.lookAt(player.position);
            }
            
            // شلیک به بازیکن
            enemy.lastFire += deltaTime;
            if (enemy.lastFire >= enemy.fireRate) {
                this.enemyFire(enemy, player.position);
                enemy.lastFire = 0;
            }
        }
        
        // بررسی خروج از مرزها
        if (enemy.position.length() > 200) {
            enemy.dead = true;
        }
    }
    
    enemyFire(enemy, targetPosition) {
        if (!enemy.position || !targetPosition) return;
        
        const direction = targetPosition.clone().sub(enemy.position).normalize();
        const startPosition = enemy.position.clone().add(direction.clone().multiplyScalar(2));
        
        this.createProjectile(
            startPosition,
            direction.multiplyScalar(15),
            enemy.damage,
            'enemy',
            0xff4444
        );
        
        // افکت شلیک
        if (window.gameGraphics) {
            window.gameGraphics.createParticleEffect(
                startPosition,
                new THREE.Color(1, 0, 0),
                10
            );
        }
    }
    
    updateProjectile(projectile, deltaTime) {
        // به‌روزرسانی موقعیت پرتابه
        projectile.position.add(projectile.velocity.clone().multiplyScalar(deltaTime));
        
        // کاهش عمر
        projectile.life -= deltaTime;
        if (projectile.life <= 0) {
            projectile.dead = true;
        }
        
        // بررسی خروج از مرزها
        if (projectile.position.length() > 300) {
            projectile.dead = true;
        }
    }
    
    updatePowerUp(powerUp, deltaTime) {
        // چرخش آرام
        if (powerUp.mesh) {
            powerUp.mesh.rotation.y += deltaTime;
        }
    }
    
    removeEntity(entity) {
        // حذف موجودیت از تمام لیست‌ها
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
        
        const enemyIndex = this.enemies.indexOf(entity);
        if (enemyIndex !== -1) {
            this.enemies.splice(enemyIndex, 1);
        }
        
        const projectileIndex = this.projectiles.indexOf(entity);
        if (projectileIndex !== -1) {
            this.projectiles.splice(projectileIndex, 1);
        }
        
        const powerUpIndex = this.powerUps.indexOf(entity);
        if (powerUpIndex !== -1) {
            this.powerUps.splice(powerUpIndex, 1);
        }
        
        // حذف از صحنه
        if (entity.mesh) {
            this.scene.remove(entity.mesh);
        }
        
        // افکت نابودی
        if (!entity.collected && (entity.health <= 0 || entity.life <= 0)) {
            this.createDestructionEffect(entity.position);
        }
    }
    
    createDestructionEffect(position) {
        // ایجاد افکت نابودی
        if (window.gameGraphics) {
            window.gameGraphics.createParticleEffect(
                position,
                new THREE.Color(1, 0.5, 0),
                20
            );
        }
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    getProjectiles() {
        return this.projectiles;
    }
    
    getPowerUps() {
        return this.powerUps;
    }
    
    getEnemiesDestroyed() {
        // این تابع باید در کلاس اصلی بازی پیاده‌سازی شود
        return Math.max(0, 10 - this.enemies.length);
    }
    
    clearAll() {
        // حذف تمام موجودیت‌ها
        while (this.entities.length > 0) {
            this.removeEntity(this.entities[0]);
        }
    }
}

// سیستم انیمیشن
class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.particleSystems = [];
        
        this.init();
    }
    
    init() {
        console.log("✅ سیستم انیمیشن راه‌اندازی شد");
    }
    
    createFloatAnimation(object, options = {}) {
        const {
            amplitude = 1,
            duration = 2,
            ease = "sine.inOut"
        } = options;
        
        const originalY = object.position.y;
        
        const animation = gsap.to(object.position, {
            y: originalY + amplitude,
            duration: duration,
            ease: ease,
            yoyo: true,
            repeat: -1
        });
        
        return animation;
    }
    
    createPulseAnimation(object, options = {}) {
        const {
            scale = 1.2,
            duration = 1,
            ease = "sine.inOut"
        } = options;
        
        const animation = gsap.to(object.scale, {
            x: scale,
            y: scale,
            z: scale,
            duration: duration,
            ease: ease,
            yoyo: true,
            repeat: -1
        });
        
        return animation;
    }
    
    createShakeAnimation(object, intensity = 1, duration = 0.5) {
        const originalPosition = object.position.clone();
        
        const animation = gsap.to(object.position, {
            x: `+=${(Math.random() - 0.5) * intensity}`,
            y: `+=${(Math.random() - 0.5) * intensity}`,
            z: `+=${(Math.random() - 0.5) * intensity}`,
            duration: duration / 10,
            repeat: Math.floor(duration / 0.1),
            yoyo: true,
            onComplete: () => {
                object.position.copy(originalPosition);
            }
        });
        
        return animation;
    }
    
    stopAllAnimations() {
        for (const animation of this.animations.values()) {
            animation.kill();
        }
        this.animations.clear();
    }
}

// صادر کردن کلاس‌ها
window.EntityManager = EntityManager;
window.AnimationSystem = AnimationSystem;
