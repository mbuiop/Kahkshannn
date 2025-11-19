// m3.js - سیستم جنگنده و تیربار
class FighterSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.player = null;
        this.weapons = [];
        this.bullets = [];
        this.enemies = [];
        this.projectiles = [];
        
        this.init();
    }
    
    init() {
        this.setupWeapons();
        this.createPlayer();
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
                size: 0.5,
                energyCost: 1
            },
            {
                id: 'plasma',
                name: 'پلاسما',
                damage: 25,
                fireRate: 3,
                speed: 40,
                color: 0xff00ff,
                size: 0.8,
                energyCost: 2
            },
            {
                id: 'missile',
                name: 'موشک هدایت شونده',
                damage: 50,
                fireRate: 1,
                speed: 30,
                color: 0xffff00,
                size: 1.5,
                energyCost: 5,
                homing: true
            },
            {
                id: 'railgun',
                name: 'ریلگان',
                damage: 100,
                fireRate: 0.5,
                speed: 100,
                color: 0xffffff,
                size: 0.3,
                energyCost: 10,
                pierce: true
            }
        ];
        
        this.currentWeaponIndex = 0;
    }
    
    createPlayer() {
        // ایجاد جنگنده بازیکن
        const geometry = new THREE.ConeGeometry(2, 5, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            shininess: 100,
            emissive: 0x002266
        });
        
        this.player = new THREE.Mesh(geometry, material);
        this.player.rotation.x = Math.PI;
        this.player.position.set(0, 0, 0);
        
        // اضافه کردن موتورها
        this.addEngines();
        
        this.scene.add(this.player);
        
        // ایجاد محدوده برخورد
        this.player.boundingBox = new THREE.Box3().setFromObject(this.player);
        
        // ویژگی‌های بازیکن
        this.player.health = 100;
        this.player.maxHealth = 100;
        this.player.energy = 100;
        this.player.maxEnergy = 100;
        this.player.speed = 20;
        this.player.invulnerable = false;
        this.player.invulnerableTimer = 0;
        
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
        
        // ذرات موتور
        this.engineParticles = {
            left: this.createEngineParticles(-1.5, -2.5, 0),
            right: this.createEngineParticles(1.5, -2.5, 0)
        };
    }
    
    createEngineParticles(x, y, z) {
        // ایجاد سیستم ذرات برای موتورها
        const particles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: new THREE.Vector3(x, y, z),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    -2 - Math.random() * 2,
                    (Math.random() - 0.5) * 0.5
                ),
                life: Math.random() * 0.5,
                maxLife: 1.0,
                size: Math.random() * 0.5 + 0.3
            };
            particles.push(particle);
        }
        
        return particles;
    }
    
    updateEngineParticles(deltaTime) {
        // به‌روزرسانی ذرات موتور
        if (!this.engineParticles) return;
        
        ['left', 'right'].forEach(side => {
            const particles = this.engineParticles[side];
            
            for (let i = particles.length - 1; i >= 0; i--) {
                const particle = particles[i];
                particle.life -= deltaTime;
                
                if (particle.life <= 0) {
                    // بازسازی ذره
                    particle.position.set(
                        side === 'left' ? -1.5 : 1.5,
                        -2.5,
                        0
                    );
                    particle.life = 0.5 + Math.random() * 0.5;
                    particle.velocity.set(
                        (Math.random() - 0.5) * 0.5,
                        -2 - Math.random() * 2,
                        (Math.random() - 0.5) * 0.5
                    );
                } else {
                    // به‌روزرسانی موقعیت
                    particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
                }
            }
        });
    }
    
    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }
    
    switchWeapon(direction = 1) {
        // تغییر سلاح
        this.currentWeaponIndex = (this.currentWeaponIndex + direction) % this.weapons.length;
        if (this.currentWeaponIndex < 0) {
            this.currentWeaponIndex = this.weapons.length - 1;
        }
        
        return this.getCurrentWeapon();
    }
    
    fireWeapon(targetPosition = null) {
        const weapon = this.getCurrentWeapon();
        
        // بررسی انرژی کافی
        if (this.player.energy < weapon.energyCost) {
            return null;
        }
        
        // مصرف انرژی
        this.player.energy -= weapon.energyCost;
        
        // ایجاد پرتابه
        const projectile = this.createProjectile(weapon, targetPosition);
        this.projectiles.push(projectile);
        
        // افکت شلیک
        this.createMuzzleFlash();
        
        // صدا
        this.playWeaponSound(weapon.id);
        
        return projectile;
    }
    
    createProjectile(weapon, targetPosition) {
        // ایجاد پرتابه
        const geometry = new THREE.SphereGeometry(weapon.size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: weapon.color,
            emissive: weapon.color
        });
        
        const projectile = new THREE.Mesh(geometry, material);
        
        // موقعیت شروع (جلوی جنگنده)
        const startPosition = this.player.position.clone();
        startPosition.z -= 5;
        projectile.position.copy(startPosition);
        
        // جهت شلیک
        let direction;
        if (targetPosition && weapon.homing) {
            // سلاح هدایت شونده
            direction = targetPosition.clone().sub(projectile.position).normalize();
        } else {
            // شلیک به سمت جلو
            direction = new THREE.Vector3(0, 0, -1);
        }
        
        // ویژگی‌های پرتابه
        projectile.velocity = direction.multiplyScalar(weapon.speed);
        projectile.damage = weapon.damage;
        projectile.weaponType = weapon.id;
        projectile.owner = 'player';
        projectile.pierce = weapon.pierce || false;
        projectile.homing = weapon.homing || false;
        projectile.target = targetPosition;
        projectile.life = 5.0; // زمان زندگی پرتابه
        
        this.scene.add(projectile);
        return projectile;
    }
    
    createMuzzleFlash() {
        // ایجاد افکت فلاش شلیک
        const flashGeometry = new THREE.SphereGeometry(1, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        
        // موقعیت (جلوی جنگنده)
        const flashPosition = this.player.position.clone();
        flashPosition.z -= 4;
        flash.position.copy(flashPosition);
        
        this.scene.add(flash);
        
        // انیمیشن محو شدن
        gsap.to(flash.scale, {
            x: 3,
            y: 3,
            z: 3,
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
    
    playWeaponSound(weaponId) {
        // پخش صدای سلاح
        // این تابع با سیستم صوتی ارتباط برقرار می‌کند
        if (typeof window.AudioSystem !== 'undefined') {
            window.AudioSystem.playSound(`weapon_${weaponId}`);
        }
    }
    
    updateProjectiles(deltaTime) {
        // به‌روزرسانی پرتابه‌ها
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // به‌روزرسانی موقعیت
            projectile.position.add(projectile.velocity.clone().multiplyScalar(deltaTime));
            
            // به‌روزرسانی هدف برای سلاح‌های هدایت شونده
            if (projectile.homing && projectile.target) {
                this.updateHomingProjectile(projectile, deltaTime);
            }
            
            // کاهش عمر
            projectile.life -= deltaTime;
            
            // حذف پرتابه‌های قدیمی یا خارج از صفحه
            if (projectile.life <= 0 || 
                Math.abs(projectile.position.x) > 200 || 
                Math.abs(projectile.position.y) > 200 || 
                Math.abs(projectile.position.z) > 200) {
                
                this.scene.remove(projectile);
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateHomingProjectile(projectile, deltaTime) {
        // به‌روزرسانی پرتابه هدایت شونده
        const directionToTarget = projectile.target.clone().sub(projectile.position).normalize();
        const currentDirection = projectile.velocity.clone().normalize();
        
        // محاسبه چرخش به سمت هدف
        const rotationSpeed = 5.0;
        const newDirection = currentDirection.lerp(directionToTarget, rotationSpeed * deltaTime).normalize();
        
        // به‌روزرسانی سرعت
        const speed = projectile.velocity.length();
        projectile.velocity.copy(newDirection.multiplyScalar(speed));
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
        
        // به‌روزرسانی محدوده برخورد
        this.player.boundingBox.setFromObject(this.player);
    }
    
    updatePlayerRotation(direction) {
        // چرخش جنگنده بر اساس جهت حرکت
        const targetRotationX = direction.y * 0.5;
        const targetRotationZ = -direction.x * 0.5;
        
        // انیمیشن نرم چرخش
        this.player.rotation.x += (targetRotationX - this.player.rotation.x) * 0.1;
        this.player.rotation.z += (targetRotationZ - this.player.rotation.z) * 0.1;
    }
    
    damagePlayer(amount) {
        if (this.player.invulnerable) return;
        
        // آسیب به بازیکن
        this.player.health = Math.max(0, this.player.health - amount);
        
        // افکت آسیب
        this.createDamageEffect();
        
        // حالت آسیب‌پذیر موقت
        this.player.invulnerable = true;
        this.player.invulnerableTimer = 2.0;
        
        // لرزش دوربین
        if (typeof window.CinematicCamera !== 'undefined' && window.gameCamera) {
            window.gameCamera.shakeCamera(amount / 20);
        }
        
        // بررسی مرگ بازیکن
        if (this.player.health <= 0) {
            this.onPlayerDeath();
        }
        
        return this.player.health;
    }
    
    createDamageEffect() {
        // ایجاد افکت آسیب
        if (typeof window.GraphicsSystem !== 'undefined') {
            window.GraphicsSystem.createParticleEffect(
                this.player.position.clone(),
                new THREE.Color(1, 0, 0),
                30
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
        // مرگ بازیکن
        this.createExplosionEffect(this.player.position);
        
        // پخش صدای انفجار
        if (typeof window.AudioSystem !== 'undefined') {
            window.AudioSystem.playSound('explosion_large');
        }
        
        // نمایش بازی تمام شده
        if (typeof window.GameUI !== 'undefined') {
            window.GameUI.showGameOver(this.getScore());
        }
    }
    
    createExplosionEffect(position) {
        // ایجاد افکت انفجار
        if (typeof window.GraphicsSystem !== 'undefined') {
            window.GraphicsSystem.createParticleEffect(
                position.clone(),
                new THREE.Color(1, 0.5, 0),
                100
            );
        }
        
        // ایجاد انفجار بصری
        const explosionGeometry = new THREE.SphereGeometry(5, 16, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8
        });
        
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(position);
        this.scene.add(explosion);
        
        // انیمیشن انفجار
        gsap.to(explosion.scale, {
            x: 10,
            y: 10,
            z: 10,
            duration: 0.3,
            ease: "power2.out"
        });
        
        gsap.to(explosionMaterial, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                this.scene.remove(explosion);
            }
        });
    }
    
    healPlayer(amount) {
        // درمان بازیکن
        this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
        return this.player.health;
    }
    
    rechargeEnergy(amount) {
        // شارژ انرژی
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + amount);
        return this.player.energy;
    }
    
    update(deltaTime) {
        if (!this.player) return;
        
        // به‌روزرسانی پرتابه‌ها
        this.updateProjectiles(deltaTime);
        
        // به‌روزرسانی ذرات موتور
        this.updateEngineParticles(deltaTime);
        
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
            this.player.energy + deltaTime * 5
        );
        
        // به‌روزرسانی HUD
        if (typeof window.GameUI !== 'undefined') {
            const weapon = this.getCurrentWeapon();
            window.GameUI.updateHUD(
                this.player.health,
                this.getScore(),
                this.getLevel(),
                weapon.name
            );
        }
    }
    
    getScore() {
        // محاسبه امتیاز
        // این تابع با سیستم امتیازدهی ارتباط برقرار می‌کند
        if (typeof window.ScoreSystem !== 'undefined') {
            return window.ScoreSystem.getCurrentScore();
        }
        return 0;
    }
    
    getLevel() {
        // دریافت سطح فعلی
        if (typeof window.LevelManager !== 'undefined') {
            const level = window.LevelManager.getCurrentLevel();
            return level ? level.id : 1;
        }
        return 1;
    }
    
    getPlayer() {
        return this.player;
    }
    
    getProjectiles() {
        return this.projectiles;
    }
}

// صادر کردن کلاس
window.FighterSystem = FighterSystem;
