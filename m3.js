// m3.js - سیستم جنگنده و تیربار
class FighterSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.player = null;
        this.weapons = [];
        this.projectiles = [];
        this.currentWeaponIndex = 0;
        this.lastFireTime = 0;
        
        this.init();
    }
    
    init() {
        this.setupWeapons();
        this.createPlayer();
        console.log("✅ سیستم جنگنده راه‌اندازی شد");
    }
    
    setupWeapons() {
        // تعریف انواع سلاح‌ها
        this.weapons = [
            {
                id: 'laser',
                name: 'لیزر پایه',
                damage: 10,
                fireRate: 5,
                speed: 50,
                color: 0x00ffff,
                size: 0.3,
                energyCost: 1,
                spread: 0.1
            },
            {
                id: 'plasma',
                name: 'پلاسما',
                damage: 25,
                fireRate: 3,
                speed: 40,
                color: 0xff00ff,
                size: 0.5,
                energyCost: 2,
                spread: 0.05
            },
            {
                id: 'missile',
                name: 'موشک هدایت شونده',
                damage: 50,
                fireRate: 1,
                speed: 30,
                color: 0xffff00,
                size: 0.8,
                energyCost: 5,
                homing: true
            }
        ];
    }
    
    createPlayer() {
        // ایجاد جنگنده بازیکن
        const geometry = new THREE.ConeGeometry(2, 5, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            shininess: 100,
            emissive: 0x002266,
            specular: 0x0088ff
        });
        
        this.player = new THREE.Mesh(geometry, material);
        this.player.rotation.x = Math.PI;
        this.player.position.set(0, 0, 0);
        
        // اضافه کردن موتورها
        this.addEngines();
        
        this.scene.add(this.player);
        
        // ویژگی‌های بازیکن
        this.player.health = 100;
        this.player.maxHealth = 100;
        this.player.energy = 100;
        this.player.maxEnergy = 100;
        this.player.speed = 25;
        this.player.invulnerable = false;
        this.player.invulnerableTimer = 0;
        
        // bounding box برای تشخیص برخورد
        this.player.boundingBox = new THREE.Box3().setFromObject(this.player);
        
        console.log("🎮 جنگنده بازیکن ایجاد شد");
        return this.player;
    }
    
    addEngines() {
        // اضافه کردن موتورها به جنگنده
        const engineGeometry = new THREE.CylinderGeometry(0.3, 0.8, 1, 8);
        const engineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8
        });
        
        // موتور چپ
        const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        leftEngine.position.set(-1.5, -2, 0);
        leftEngine.rotation.x = Math.PI / 2;
        this.player.add(leftEngine);
        
        // موتور راست
        const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        rightEngine.position.set(1.5, -2, 0);
        rightEngine.rotation.x = Math.PI / 2;
        this.player.add(rightEngine);
    }
    
    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }
    
    switchWeapon(direction = 1) {
        this.currentWeaponIndex = (this.currentWeaponIndex + direction) % this.weapons.length;
        if (this.currentWeaponIndex < 0) {
            this.currentWeaponIndex = this.weapons.length - 1;
        }
        
        console.log(`🔫 سلاح تغییر کرد به: ${this.getCurrentWeapon().name}`);
        return this.getCurrentWeapon();
    }
    
    fireWeapon(targetPosition = null) {
        const currentTime = Date.now();
        const weapon = this.getCurrentWeapon();
        
        // بررسی نرخ شلیک
        if (currentTime - this.lastFireTime < 1000 / weapon.fireRate) {
            return null;
        }
        
        // بررسی انرژی کافی
        if (this.player.energy < weapon.energyCost) {
            console.log("⚠️ انرژی کافی نیست");
            return null;
        }
        
        // مصرف انرژی
        this.player.energy -= weapon.energyCost;
        this.lastFireTime = currentTime;
        
        // ایجاد پرتابه
        const projectile = this.createProjectile(weapon, targetPosition);
        this.projectiles.push(projectile);
        
        // افکت شلیک
        this.createMuzzleFlash();
        
        console.log(`🔫 شلیک با ${weapon.name}`);
        return projectile;
    }
    
    createProjectile(weapon, targetPosition) {
        const geometry = new THREE.SphereGeometry(weapon.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: weapon.color,
            emissive: weapon.color
        });
        
        const projectile = new THREE.Mesh(geometry, material);
        
        // موقعیت شروع (جلوی جنگنده)
        const startPosition = this.player.position.clone();
        startPosition.z -= 4;
        projectile.position.copy(startPosition);
        
        // جهت شلیک
        let direction = new THREE.Vector3(0, 0, -1);
        
        // اضافه کردن پراکندگی
        if (weapon.spread) {
            direction.x += (Math.random() - 0.5) * weapon.spread;
            direction.y += (Math.random() - 0.5) * weapon.spread;
            direction.normalize();
        }
        
        // ویژگی‌های پرتابه
        projectile.userData = {
            velocity: direction.multiplyScalar(weapon.speed),
            damage: weapon.damage,
            weaponType: weapon.id,
            owner: 'player',
            life: 5.0,
            homing: weapon.homing || false,
            target: targetPosition
        };
        
        this.scene.add(projectile);
        return projectile;
    }
    
    createMuzzleFlash() {
        const flashGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        
        // موقعیت (جلوی جنگنده)
        const flashPosition = this.player.position.clone();
        flashPosition.z -= 3.5;
        flash.position.copy(flashPosition);
        
        this.scene.add(flash);
        
        // انیمیشن محو شدن
        gsap.to(flash.scale, {
            x: 2,
            y: 2,
            z: 2,
            duration: 0.1,
            ease: "power2.out"
        });
        
        gsap.to(flashMaterial, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
            onComplete: () => {
                this.scene.remove(flash);
            }
        });
    }
    
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const userData = projectile.userData;
            
            if (!userData) continue;
            
            // به‌روزرسانی موقعیت
            projectile.position.add(userData.velocity.clone().multiplyScalar(deltaTime));
            
            // به‌روزرسانی هدف برای سلاح‌های هدایت شونده
            if (userData.homing && userData.target) {
                this.updateHomingProjectile(projectile, deltaTime);
            }
            
            // کاهش عمر
            userData.life -= deltaTime;
            
            // حذف پرتابه‌های قدیمی یا خارج از صفحه
            if (userData.life <= 0 || 
                Math.abs(projectile.position.x) > 200 || 
                Math.abs(projectile.position.y) > 200 || 
                Math.abs(projectile.position.z) > 200) {
                
                this.scene.remove(projectile);
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateHomingProjectile(projectile, deltaTime) {
        const userData = projectile.userData;
        const directionToTarget = userData.target.clone().sub(projectile.position).normalize();
        const currentDirection = userData.velocity.clone().normalize();
        
        // محاسبه چرخش به سمت هدف
        const rotationSpeed = 3.0;
        const newDirection = currentDirection.lerp(directionToTarget, rotationSpeed * deltaTime).normalize();
        
        // به‌روزرسانی سرعت
        const speed = userData.velocity.length();
        userData.velocity.copy(newDirection.multiplyScalar(speed));
    }
    
    movePlayer(direction, deltaTime) {
        if (!this.player) return;
        
        // حرکت بازیکن
        const moveSpeed = this.player.speed * deltaTime;
        this.player.position.add(direction.clone().multiplyScalar(moveSpeed));
        
        // محدود کردن به مرزهای بازی
        const bounds = 80;
        this.player.position.x = THREE.MathUtils.clamp(this.player.position.x, -bounds, bounds);
        this.player.position.y = THREE.MathUtils.clamp(this.player.position.y, -bounds / 2, bounds / 2);
        
        // چرخش بر اساس حرکت
        this.updatePlayerRotation(direction);
        
        // به‌روزرسانی bounding box
        this.player.boundingBox.setFromObject(this.player);
    }
    
    updatePlayerRotation(direction) {
        // چرخش جنگنده بر اساس جهت حرکت
        const targetRotationX = direction.y * 0.3;
        const targetRotationZ = -direction.x * 0.3;
        
        // انیمیشن نرم چرخش
        this.player.rotation.x += (targetRotationX - this.player.rotation.x) * 0.2;
        this.player.rotation.z += (targetRotationZ - this.player.rotation.z) * 0.2;
    }
    
    damagePlayer(amount) {
        if (this.player.invulnerable) return this.player.health;
        
        // آسیب به بازیکن
        this.player.health = Math.max(0, this.player.health - amount);
        
        // افکت آسیب
        this.createDamageEffect();
        
        // حالت آسیب‌پذیر موقت
        this.player.invulnerable = true;
        this.player.invulnerableTimer = 1.5;
        
        // لرزش دوربین
        if (window.gameCamera && window.gameCamera.shakeCamera) {
            window.gameCamera.shakeCamera(amount / 20);
        }
        
        console.log(`💥 آسیب به بازیکن: ${amount} - سلامت باقی‌مانده: ${this.player.health}`);
        
        // بررسی مرگ بازیکن
        if (this.player.health <= 0) {
            this.onPlayerDeath();
        }
        
        return this.player.health;
    }
    
    createDamageEffect() {
        // ایجاد افکت آسیب
        if (window.gameGraphics) {
            window.gameGraphics.createParticleEffect(
                this.player.position.clone(),
                new THREE.Color(1, 0, 0),
                15
            );
        }
        
        // فلاش قرمز روی صفحه
        const damageOverlay = document.createElement('div');
        damageOverlay.style.position = 'fixed';
        damageOverlay.style.top = '0';
        damageOverlay.style.left = '0';
        damageOverlay.style.width = '100%';
        damageOverlay.style.height = '100%';
        damageOverlay.style.background = 'rgba(255, 0, 0, 0.3)';
        damageOverlay.style.pointerEvents = 'none';
        damageOverlay.style.zIndex = '20';
        
        document.body.appendChild(damageOverlay);
        
        // انیمیشن محو شدن
        gsap.to(damageOverlay, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                document.body.removeChild(damageOverlay);
            }
        });
    }
    
    onPlayerDeath() {
        console.log("💀 بازیکن مرد");
        
        // ایجاد افکت انفجار بزرگ
        this.createExplosionEffect(this.player.position, 100);
        
        // نمایش بازی تمام شده
        if (window.GameUI) {
            const score = window.scoreSystem ? window.scoreSystem.getCurrentScore() : 0;
            window.GameUI.showGameOver(score);
        }
    }
    
    createExplosionEffect(position, count = 50) {
        // ایجاد افکت انفجار
        if (window.gameGraphics) {
            window.gameGraphics.createParticleEffect(
                position.clone(),
                new THREE.Color(1, 0.5, 0),
                count
            );
        }
    }
    
    healPlayer(amount) {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
        console.log(`❤️ درمان بازیکن: ${amount} - سلامت جدید: ${this.player.health}`);
        return this.player.health;
    }
    
    rechargeEnergy(amount) {
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + amount);
        return this.player.energy;
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
        // به‌روزرسانی پرتابه‌ها
        this.updateProjectiles(deltaTime);
        
        // به‌روزرسانی تایمر آسیب‌پذیری
        if (this.player.invulnerable) {
            this.player.invulnerableTimer -= deltaTime;
            if (this.player.invulnerableTimer <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // بازیابی انرژی
        this.player.energy = Math.min(
            this.player.maxEnergy,
            this.player.energy + deltaTime * 8
        );
        
        // به‌روزرسانی HUD
        if (window.GameUI) {
            const weapon = this.getCurrentWeapon();
            const score = window.scoreSystem ? window.scoreSystem.getCurrentScore() : 0;
            const level = window.currentLevel || 1;
            window.GameUI.updateHUD(
                this.player.health,
                score,
                level,
                weapon.name
            );
        }
    }
    
    getPlayer() {
        return this.player;
    }
    
    getProjectiles() {
        return this.projectiles;
    }
    
    getPlayerPosition() {
        return this.player ? this.player.position.clone() : new THREE.Vector3();
    }
}

// صادر کردن کلاس
window.FighterSystem = FighterSystem;
