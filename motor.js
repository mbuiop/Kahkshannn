// motor.js - موتور اصلی بازی با Babylon.js
console.log('🚀 موتور بازی بارگذاری شد');

class GalacticGameEngine {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.canvas = null;
        this.camera = null;
        this.light = null;
        this.player = null;
        this.enemies = [];
        this.coins = [];
        this.bullets = [];
        this.particles = [];
        this.isInitialized = false;
        this.gameState = 'menu';
        this.score = 0;
        this.playerHealth = 100;
        this.playerFuel = 100;
        this.currentWeapon = 'laser';
        this.weapons = {
            laser: { damage: 10, speed: 2, color: new BABYLON.Color3(0, 1, 1) },
            missile: { damage: 30, speed: 1, color: new BABYLON.Color3(1, 0.5, 0) },
            plasma: { damage: 50, speed: 1.5, color: new BABYLON.Color3(1, 0, 1) }
        };
    }

    async initialize() {
        try {
            console.log('🎮 در حال راه‌اندازی موتور بازی...');
            
            // ایجاد کانواس
            this.canvas = document.getElementById('renderCanvas');
            this.engine = new BABYLON.Engine(this.canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true
            });

            // ایجاد صحنه
            this.scene = new BABYLON.Scene(this.engine);
            this.scene.clearColor = new BABYLON.Color4(0, 0, 0.1, 1);

            // تنظیم دوربین
            this.setupCamera();
            
            // تنظیم نورپردازی
            this.setupLighting();
            
            // ایجاد محیط فضا
            this.createSpaceEnvironment();
            
            // ایجاد بازیکن
            this.createPlayer();
            
            // ایجاد سیستم‌های ذره‌ای
            this.setupParticleSystems();
            
            // تنظیم کنترل‌ها
            this.setupControls();
            
            // راه‌اندازی حلقه بازی
            this.setupGameLoop();
            
            this.isInitialized = true;
            console.log('✅ موتور بازی با موفقیت راه‌اندازی شد');
            
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی موتور بازی:', error);
        }
    }

    setupCamera() {
        // دوربین اصلی
        this.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            Math.PI / 2.5,
            50,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        
        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperRadiusLimit = 200;
        this.camera.wheelPrecision = 50;
        this.camera.panningSensibility = 0;
        
        // دوربین مینی‌مپ
        this.miniMapCamera = new BABYLON.FreeCamera(
            "miniMapCamera",
            new BABYLON.Vector3(0, 100, 0),
            this.scene
        );
        this.miniMapCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.miniMapCamera.orthoTop = 50;
        this.miniMapCamera.orthoBottom = -50;
        this.miniMapCamera.orthoLeft = -50;
        this.miniMapCamera.orthoRight = 50;
        this.miniMapCamera.rotation.x = Math.PI / 2;
    }

    setupLighting() {
        // نور محیطی
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.3;
        ambientLight.diffuse = new BABYLON.Color3(0.3, 0.3, 0.5);
        
        // نور جهت‌دار اصلی
        const mainLight = new BABYLON.DirectionalLight(
            "mainLight",
            new BABYLON.Vector3(0, -1, 1),
            this.scene
        );
        mainLight.intensity = 0.8;
        mainLight.position = new BABYLON.Vector3(0, 50, 0);
        mainLight.diffuse = new BABYLON.Color3(1, 1, 0.8);
        
        // نور نقطه‌ای برای جلوه‌های ویژه
        this.spotLight = new BABYLON.SpotLight(
            "spotLight",
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, -1, 0),
            Math.PI / 3,
            2,
            this.scene
        );
        this.spotLight.intensity = 0;
        this.spotLight.diffuse = new BABYLON.Color3(0, 0.5, 1);
    }

    createSpaceEnvironment() {
        // ایجاد پس‌زمینه ستاره‌ای
        this.createStarfield();
        
        // ایجاد سحابی‌ها
        this.createNebulas();
        
        // ایجاد سیارات دوردست
        this.createDistantPlanets();
        
        // ایجاد کهکشان انتهایی
        this.createGalaxyBackground();
    }

    createStarfield() {
        const starCount = 2000;
        const starData = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            starData[i * 3] = (Math.random() - 0.5) * 1000;
            starData[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            starData[i * 3 + 2] = (Math.random() - 0.5) * 1000;
        }
        
        const stars = new BABYLON.VertexData();
        stars.positions = starData;
        
        const starSystem = new BABYLON.Mesh("starSystem", this.scene);
        stars.applyToMesh(starSystem);
        
        const starMaterial = new BABYLON.StandardMaterial("starMaterial", this.scene);
        starMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        starMaterial.disableLighting = true;
        starSystem.material = starMaterial;
        
        // ایجاد نقاط برای ستاره‌ها
        starSystem = BABYLON.Mesh.CreatePoints("stars", starData, this.scene);
        starSystem.material = new BABYLON.PointsMaterial("starPoints", this.scene);
        starSystem.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        starSystem.material.pointSize = 2;
    }

    createNebulas() {
        // ایجاد سحابی‌های رنگی
        const nebulaColors = [
            new BABYLON.Color3(1, 0, 0.5), // بنفش
            new BABYLON.Color3(0, 0.5, 1), // آبی
            new BABYLON.Color3(0, 1, 0.5), // سبز
            new BABYLON.Color3(1, 0.5, 0)  // نارنجی
        ];
        
        nebulaColors.forEach((color, index) => {
            const nebula = BABYLON.Mesh.CreateSphere(`nebula${index}`, 16, 80 + Math.random() * 40, this.scene);
            nebula.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 500,
                (Math.random() - 0.5) * 500,
                (Math.random() - 0.5) * 500
            );
            
            const nebulaMaterial = new BABYLON.StandardMaterial(`nebulaMaterial${index}`, this.scene);
            nebulaMaterial.emissiveColor = color;
            nebulaMaterial.alpha = 0.1 + Math.random() * 0.1;
            nebulaMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            nebula.material = nebulaMaterial;
        });
    }

    createGalaxyBackground() {
        // ایجاد کهکشان در پس‌زمینه
        const galaxy = BABYLON.Mesh.CreateSphere("galaxy", 32, 300, this.scene);
        galaxy.position = new BABYLON.Vector3(0, 0, -400);
        
        const galaxyMaterial = new BABYLON.StandardMaterial("galaxyMaterial", this.scene);
        
        // استفاده از بافت کهکشان
        const galaxyTexture = new BABYLON.Texture("https://i.imgur.com/8Y9J9Z9.png", this.scene);
        galaxyMaterial.emissiveTexture = galaxyTexture;
        galaxyMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        galaxyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        galaxyMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.5);
        galaxy.material = galaxyMaterial;
        
        // انیمیشن چرخش کهکشان
        this.scene.registerBeforeRender(() => {
            galaxy.rotation.y += 0.0001;
        });
    }

    createDistantPlanets() {
        // ایجاد سیارات دوردست
        const planetCount = 8;
        
        for (let i = 0; i < planetCount; i++) {
            const size = 10 + Math.random() * 20;
            const planet = BABYLON.Mesh.CreateSphere(`planet${i}`, 32, size, this.scene);
            
            // موقعیت‌های دوردست
            planet.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 800,
                -200 - Math.random() * 300
            );
            
            const planetMaterial = new BABYLON.StandardMaterial(`planetMaterial${i}`, this.scene);
            
            // رنگ‌های متنوع برای سیارات
            const colors = [
                new BABYLON.Color3(1, 0.5, 0.2), // نارنجی
                new BABYLON.Color3(0.2, 0.8, 1), // آبی
                new BABYLON.Color3(1, 0.8, 0.2), // زرد
                new BABYLON.Color3(0.8, 0.2, 0.8), // بنفش
                new BABYLON.Color3(0.2, 1, 0.5), // سبز
                new BABYLON.Color3(1, 0.3, 0.3), // قرمز
                new BABYLON.Color3(0.5, 0.5, 1), // آبی روشن
                new BABYLON.Color3(1, 0.6, 0.8)  // صورتی
            ];
            
            planetMaterial.diffuseColor = colors[i % colors.length];
            planetMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            planetMaterial.emissiveColor = colors[i % colors.length].scale(0.1);
            planet.material = planetMaterial;
            
            // انیمیشن چرخش سیارات
            this.scene.registerBeforeRender(() => {
                planet.rotation.y += 0.001 * (i + 1);
                planet.rotation.x += 0.0005 * (i + 1);
            });
        }
    }

    createPlayer() {
        console.log('👨‍🚀 در حال ایجاد سفینه بازیکن...');
        
        // بدنه اصلی سفینه
        const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", {
            height: 6,
            diameterTop: 0,
            diameterBottom: 3,
            tessellation: 32
        }, this.scene);
        
        // کابین خلبان
        const cockpit = BABYLON.MeshBuilder.CreateSphere("cockpit", {
            diameter: 2,
            segments: 16
        }, this.scene);
        cockpit.position.y = 1;
        
        // بال‌ها
        const wingLeft = BABYLON.MeshBuilder.CreateBox("wingLeft", {
            width: 6,
            height: 0.3,
            depth: 2
        }, this.scene);
        wingLeft.position.x = -2;
        wingLeft.position.y = -0.5;
        
        const wingRight = BABYLON.MeshBuilder.CreateBox("wingRight", {
            width: 6,
            height: 0.3,
            depth: 2
        }, this.scene);
        wingRight.position.x = 2;
        wingRight.position.y = -0.5;
        
        // موتورها
        const engineLeft = this.createEngine(-1.5, -2);
        const engineRight = this.createEngine(1.5, -2);
        
        // ترکیب تمام بخش‌ها
        this.player = BABYLON.Mesh.MergeMeshes([
            fuselage, cockpit, wingLeft, wingRight, engineLeft, engineRight
        ], true, false, null, false, true);
        
        this.player.name = "playerSpacecraft";
        this.player.position = new BABYLON.Vector3(0, 0, 0);
        
        // مواد سفینه
        const playerMaterial = new BABYLON.StandardMaterial("playerMaterial", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 1.0);
        playerMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 1.0);
        playerMaterial.emissiveColor = new BABYLON.Color3(0, 0.2, 0.5);
        this.player.material = playerMaterial;
        
        // ایجاد سیستم ذره‌ای برای موتور
        this.createEngineParticles();
        
        console.log('✅ سفینه بازیکن ایجاد شد');
    }

    createEngine(x, z) {
        const engine = BABYLON.MeshBuilder.CreateCylinder("engine", {
            height: 2,
            diameter: 0.8,
            tessellation: 16
        }, this.scene);
        
        engine.position.x = x;
        engine.position.z = z;
        engine.position.y = -1.5;
        
        const engineMaterial = new BABYLON.StandardMaterial("engineMaterial", this.scene);
        engineMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        engineMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        
        engine.material = engineMaterial;
        return engine;
    }

    createEngineParticles() {
        this.engineParticles = new BABYLON.ParticleSystem("engineParticles", 2000, this.scene);
        
        this.engineParticles.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        this.engineParticles.emitter = this.player;
        this.engineParticles.minEmitBox = new BABYLON.Vector3(-0.3, -1.5, -0.3);
        this.engineParticles.maxEmitBox = new BABYLON.Vector3(0.3, -1.5, 0.3);
        
        this.engineParticles.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        this.engineParticles.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
        this.engineParticles.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        
        this.engineParticles.minSize = 0.1;
        this.engineParticles.maxSize = 0.3;
        
        this.engineParticles.minLifeTime = 0.3;
        this.engineParticles.maxLifeTime = 0.8;
        
        this.engineParticles.emitRate = 1000;
        
        this.engineParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        this.engineParticles.gravity = new BABYLON.Vector3(0, -8, 0);
        
        this.engineParticles.direction1 = new BABYLON.Vector3(-0.5, -3, -0.5);
        this.engineParticles.direction2 = new BABYLON.Vector3(0.5, -5, 0.5);
        
        this.engineParticles.minAngularSpeed = 0;
        this.engineParticles.maxAngularSpeed = Math.PI;
        
        this.engineParticles.minEmitPower = 8;
        this.engineParticles.maxEmitPower = 12;
        this.engineParticles.updateSpeed = 0.005;
    }

    setupParticleSystems() {
        // سیستم ذره‌ای برای انفجارها
        this.explosionParticles = new BABYLON.ParticleSystem("explosionParticles", 5000, this.scene);
        this.explosionParticles.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        this.explosionParticles.minSize = 0.1;
        this.explosionParticles.maxSize = 1.0;
        this.explosionParticles.minLifeTime = 0.3;
        this.explosionParticles.maxLifeTime = 1.5;
        this.explosionParticles.emitRate = 0;
        this.explosionParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        // سیستم ذره‌ای برای جمع‌آوری سکه
        this.coinParticles = new BABYLON.ParticleSystem("coinParticles", 1000, this.scene);
        this.coinParticles.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        this.coinParticles.minSize = 0.05;
        this.coinParticles.maxSize = 0.2;
        this.coinParticles.minLifeTime = 0.5;
        this.coinParticles.maxLifeTime = 1.5;
        this.coinParticles.emitRate = 0;
        this.coinParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    }

    setupControls() {
        // کنترل‌های صفحه‌کلید
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                this.handleKeyDown(kbInfo.event);
            }
        });
        
        // کنترل‌های موس
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
                this.handleMouseMove(pointerInfo.event);
            } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                this.handleMouseClick(pointerInfo.event);
            }
        });
        
        // کنترل لمسی
        this.canvas.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: false });
        
        // دکمه شلیک در HUD
        document.getElementById('fireButton').addEventListener('click', () => {
            this.fireWeapon();
        });
    }

    handleKeyDown(event) {
        if (!this.player) return;
        
        const speed = 0.5;
        switch(event.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.player.position.z += speed;
                break;
            case 'arrowdown':
            case 's':
                this.player.position.z -= speed;
                break;
            case 'arrowleft':
            case 'a':
                this.player.position.x -= speed;
                break;
            case 'arrowright':
            case 'd':
                this.player.position.x += speed;
                break;
            case ' ':
                this.fireWeapon();
                break;
            case '1':
                this.currentWeapon = 'laser';
                this.updateHUD();
                break;
            case '2':
                this.currentWeapon = 'missile';
                this.updateHUD();
                break;
            case '3':
                this.currentWeapon = 'plasma';
                this.updateHUD();
                break;
        }
        
        // محدود کردن حرکت بازیکن
        this.constrainPlayerMovement();
    }

    handleMouseMove(event) {
        if (!this.player) return;
        
        const sensitivity = 0.01;
        this.player.position.x += event.movementX * sensitivity;
        this.player.position.y -= event.movementY * sensitivity;
        
        this.constrainPlayerMovement();
    }

    handleMouseClick(event) {
        this.fireWeapon();
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (!this.player || event.touches.length === 0) return;
        
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (touch.clientX - centerX) * 0.02;
        const deltaY = (touch.clientY - centerY) * 0.02;
        
        this.player.position.x += deltaX;
        this.player.position.y -= deltaY;
        
        this.constrainPlayerMovement();
    }

    handleTouchStart(event) {
        event.preventDefault();
        this.fireWeapon();
    }

    constrainPlayerMovement() {
        if (!this.player) return;
        
        // محدودیت‌های حرکت
        const bounds = 15;
        this.player.position.x = Math.max(-bounds, Math.min(bounds, this.player.position.x));
        this.player.position.y = Math.max(-bounds, Math.min(bounds, this.player.position.y));
        this.player.position.z = Math.max(-bounds, Math.min(bounds, this.player.position.z));
    }

    fireWeapon() {
        if (!this.player || this.gameState !== 'playing') return;
        
        const weapon = this.weapons[this.currentWeapon];
        
        // ایجاد گلوله
        const bullet = BABYLON.Mesh.CreateSphere("bullet", 8, 0.3, this.scene);
        bullet.position = this.player.position.clone();
        bullet.position.z += 2;
        
        const bulletMaterial = new BABYLON.StandardMaterial("bulletMaterial", this.scene);
        bulletMaterial.emissiveColor = weapon.color;
        bulletMaterial.diffuseColor = weapon.color;
        bullet.material = bulletMaterial;
        
        // تنظیم فیزیک گلوله
        bullet.speed = weapon.speed;
        bullet.damage = weapon.damage;
        bullet.direction = new BABYLON.Vector3(0, 0, 1);
        
        this.bullets.push(bullet);
        
        // افکت شلیک
        this.createMuzzleFlash();
        
        // پخش صدای شلیک
        if (window.audioManager) {
            window.audioManager.playSound('laser');
        }
    }

    createMuzzleFlash() {
        const flash = BABYLON.Mesh.CreateSphere("muzzleFlash", 8, 0.8, this.scene);
        flash.position = this.player.position.clone();
        flash.position.z += 1.5;
        
        const flashMaterial = new BABYLON.StandardMaterial("flashMaterial", this.scene);
        flashMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0);
        flashMaterial.alpha = 0.8;
        flash.material = flashMaterial;
        
        // انیمیشن محو شدن
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

    setupGameLoop() {
        // راه‌اندازی حلقه رندر
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });
        
        // حلقه به‌روزرسانی بازی
        this.scene.registerBeforeRender(() => {
            this.updateGame();
        });
        
        // مدیریت تغییر اندازه پنجره
        window.addEventListener('resize', () => {
            if (this.engine) {
                this.engine.resize();
            }
        });
    }

    updateGame() {
        if (this.gameState !== 'playing') return;
        
        // به‌روزرسانی گلوله‌ها
        this.updateBullets();
        
        // به‌روزرسانی دشمنان
        this.updateEnemies();
        
        // به‌روزرسانی سکه‌ها
        this.updateCoins();
        
        // به‌روزرسانی ذرات
        this.updateParticles();
        
        // کاهش سوخت
        this.updateFuel();
        
        // به‌روزرسانی HUD
        this.updateHUD();
        
        // بررسی برخوردها
        this.checkCollisions();
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.addInPlace(bullet.direction.scale(bullet.speed));
            
            // حذف گلوله‌های دور شده
            if (bullet.position.z > 50) {
                bullet.dispose();
                this.bullets.splice(i, 1);
            }
        }
    }

    updateEnemies() {
        if (window.enemyManager) {
            window.enemyManager.update();
        }
    }

    updateCoins() {
        // چرخش سکه‌ها
        this.coins.forEach(coin => {
            if (coin.mesh) {
                coin.mesh.rotation.y += 0.05;
                coin.mesh.rotation.x += 0.02;
            }
        });
    }

    updateParticles() {
        // به‌روزرسانی سیستم‌های ذره‌ای
    }

    updateFuel() {
        // کاهش تدریجی سوخت
        if (this.gameState === 'playing') {
            this.playerFuel = Math.max(0, this.playerFuel - 0.01);
            
            if (this.playerFuel <= 0) {
                this.gameOver();
            }
        }
    }

    updateHUD() {
        // به‌روزرسانی رابط کاربری
        document.getElementById('fuelText').textContent = Math.round(this.playerFuel) + '%';
        document.getElementById('fuelFill').style.width = this.playerFuel + '%';
        
        document.getElementById('healthText').textContent = Math.round(this.playerHealth) + '%';
        document.getElementById('healthFill').style.width = this.playerHealth + '%';
        
        document.getElementById('scoreText').textContent = this.score;
        document.getElementById('weaponName').textContent = this.getWeaponName(this.currentWeapon);
    }

    getWeaponName(weaponType) {
        const names = {
            laser: 'لیزر پیشرفته',
            missile: 'موشک هدایت‌شونده',
            plasma: 'پلاسمای انرژی'
        };
        return names[weaponType] || 'سلاح ناشناخته';
    }

    checkCollisions() {
        // بررسی برخورد گلوله‌ها با دشمنان
        this.checkBulletEnemyCollisions();
        
        // بررسی برخورد بازیکن با دشمنان
        this.checkPlayerEnemyCollisions();
        
        // بررسی برخورد بازیکن با سکه‌ها
        this.checkPlayerCoinCollisions();
    }

    checkBulletEnemyCollisions() {
        if (!window.enemyManager) return;
        
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = window.enemyManager.enemies.length - 1; j >= 0; j--) {
                const enemy = window.enemyManager.enemies[j];
                
                if (enemy.mesh && bullet.intersectsMesh(enemy.mesh, false)) {
                    // برخورد detected
                    enemy.health -= bullet.damage;
                    
                    // ایجاد افکت برخورد
                    this.createHitEffect(bullet.position);
                    
                    // حذف گلوله
                    bullet.dispose();
                    this.bullets.splice(i, 1);
                    
                    // بررسی مرگ دشمن
                    if (enemy.health <= 0) {
                        window.enemyManager.destroyEnemy(j);
                        this.score += enemy.scoreValue;
                    }
                    
                    break;
                }
            }
        }
    }

    checkPlayerEnemyCollisions() {
        if (!window.enemyManager || !this.player) return;
        
        window.enemyManager.enemies.forEach(enemy => {
            if (enemy.mesh && this.player.intersectsMesh(enemy.mesh, false)) {
                // برخورد با دشمن
                this.playerHealth -= 10;
                this.createExplosionEffect(this.player.position);
                
                if (this.playerHealth <= 0) {
                    this.gameOver();
                }
            }
        });
    }

    checkPlayerCoinCollisions() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            
            if (coin.mesh && this.player.intersectsMesh(coin.mesh, false)) {
                // جمع‌آوری سکه
                this.collectCoin(coin, i);
            }
        }
    }

    createHitEffect(position) {
        // ایجاد افکت برخورد
        const hitParticles = new BABYLON.ParticleSystem("hitParticles", 500, this.scene);
        hitParticles.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        hitParticles.emitter = position;
        hitParticles.minSize = 0.1;
        hitParticles.maxSize = 0.5;
        hitParticles.minLifeTime = 0.2;
        hitParticles.maxLifeTime = 0.8;
        hitParticles.emitRate = 1000;
        hitParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        hitParticles.color1 = new BABYLON.Color4(1, 1, 0, 1);
        hitParticles.color2 = new BABYLON.Color4(1, 0, 0, 1);
        hitParticles.direction1 = new BABYLON.Vector3(-1, -1, -1);
        hitParticles.direction2 = new BABYLON.Vector3(1, 1, 1);
        
        hitParticles.start();
        setTimeout(() => {
            hitParticles.stop();
            setTimeout(() => hitParticles.dispose(), 1000);
        }, 100);
    }

    createExplosionEffect(position) {
        // ایجاد افکت انفجار
        const explosion = BABYLON.Mesh.CreateSphere("explosion", 16, 3, this.scene);
        explosion.position = position.clone();
        
        const explosionMaterial = new BABYLON.StandardMaterial("explosionMaterial", this.scene);
        explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
        explosionMaterial.alpha = 0.8;
        explosion.material = explosionMaterial;
        
        // انیمیشن انفجار
        let scale = 1;
        const growInterval = setInterval(() => {
            scale += 0.5;
            explosion.scaling = new BABYLON.Vector3(scale, scale, scale);
            explosionMaterial.alpha -= 0.1;
            
            if (explosionMaterial.alpha <= 0) {
                clearInterval(growInterval);
                explosion.dispose();
            }
        }, 50);
        
        // پخش صدای انفجار
        if (window.audioManager) {
            window.audioManager.playSound('explosion');
        }
    }

    collectCoin(coin, index) {
        // ایجاد افکت جمع‌آوری سکه (آبشار ذرات)
        this.createCoinCollectionEffect(coin.mesh.position);
        
        // افزایش امتیاز
        this.score += coin.value;
        
        // حذف سکه
        coin.mesh.dispose();
        this.coins.splice(index, 1);
        
        // پخش صدای جمع‌آوری
        if (window.audioManager) {
            window.audioManager.playSound('coin');
        }
        
        // بازیابی سوخت
        this.playerFuel = Math.min(100, this.playerFuel + 5);
    }

    createCoinCollectionEffect(position) {
        // ایجاد افکت آبشار ذرات برای جمع‌آوری سکه
        const coinParticles = new BABYLON.ParticleSystem("coinCollection", 200, this.scene);
        coinParticles.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        coinParticles.emitter = position;
        coinParticles.minSize = 0.05;
        coinParticles.maxSize = 0.2;
        coinParticles.minLifeTime = 0.5;
        coinParticles.maxLifeTime = 1.5;
        coinParticles.emitRate = 500;
        coinParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        coinParticles.color1 = new BABYLON.Color4(1, 1, 0, 1);
        coinParticles.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        coinParticles.gravity = new BABYLON.Vector3(0, -2, 0);
        coinParticles.direction1 = new BABYLON.Vector3(-2, 3, -2);
        coinParticles.direction2 = new BABYLON.Vector3(2, 5, 2);
        
        coinParticles.start();
        setTimeout(() => {
            coinParticles.stop();
            setTimeout(() => coinParticles.dispose(), 2000);
        }, 300);
    }

    start() {
        if (!this.isInitialized) {
            console.log('⏳ در حال راه‌اندازی موتور...');
            this.initialize().then(() => {
                this.startGameplay();
            });
        } else {
            this.startGameplay();
        }
    }

    startGameplay() {
        console.log('🎯 شروع گیم‌پلی...');
        this.gameState = 'playing';
        this.score = 0;
        this.playerHealth = 100;
        this.playerFuel = 100;
        
        // شروع موتورهای ذره‌ای
        this.engineParticles.start();
        
        // شروع سیستم دشمنان
        if (window.enemyManager) {
            window.enemyManager.startSpawning();
        }
        
        // ایجاد سکه‌ها
        this.createCoins();
        
        // شروع موسیقی
        if (window.audioManager) {
            window.audioManager.playMusic();
        }
        
        console.log('✅ گیم‌پلی شروع شد!');
    }

    createCoins() {
        // ایجاد 50 سکه در صحنه
        const coinCount = 50;
        
        for (let i = 0; i < coinCount; i++) {
            const coin = BABYLON.Mesh.CreateTorus("coin", {
                diameter: 1,
                thickness: 0.3,
                tessellation: 16
            }, this.scene);
            
            // موقعیت‌های تصادفی
            coin.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40 + 10
            );
            
            const coinMaterial = new BABYLON.StandardMaterial("coinMaterial", this.scene);
            coinMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
            coinMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
            coin.material = coinMaterial;
            
            this.coins.push({
                mesh: coin,
                value: 10,
                collected: false
            });
        }
    }

    gameOver() {
        console.log('💀 بازی تمام شد!');
        this.gameState = 'gameOver';
        
        // توقف سیستم‌ها
        this.engineParticles.stop();
        
        if (window.enemyManager) {
            window.enemyManager.stopSpawning();
        }
        
        // ذخیره امتیاز
        this.saveScore();
        
        // نمایش صفحه بازی تمام شده
        setTimeout(() => {
            alert(`بازی تمام شد!\nامتیاز نهایی: ${this.score}`);
            this.returnToMenu();
        }, 1000);
    }

    saveScore() {
        const highScore = localStorage.getItem('galacticHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('galacticHighScore', this.score);
        }
        
        // ذخیره سایر آمار
        const enemiesDestroyed = parseInt(localStorage.getItem('galacticEnemiesDestroyed') || 0);
        localStorage.setItem('galacticEnemiesDestroyed', enemiesDestroyed + window.enemyManager?.destroyedCount || 0);
    }

    returnToMenu() {
        this.gameState = 'menu';
        
        // پاک‌سازی صحنه
        this.clearScene();
        
        // بازگشت به منوی اصلی
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('mainScreen').classList.remove('hidden');
        
        // بارگذاری مجدد آمار
        if (typeof loadStats === 'function') {
            loadStats();
        }
    }

    clearScene() {
        // پاک‌سازی تمام المان‌های بازی
        this.bullets.forEach(bullet => bullet.dispose());
        this.bullets = [];
        
        this.coins.forEach(coin => coin.mesh.dispose());
        this.coins = [];
        
        if (window.enemyManager) {
            window.enemyManager.clearEnemies();
        }
    }
}

// ایجاد نمونه موتور بازی
window.gameEngine = new GalacticGameEngine();
console.log('🎮 موتور بازی آماده است!');
