// سیستم جنگنده و کنترل‌ها
class ShipSystem {
    constructor(scene) {
        this.scene = scene;
        this.ship = null;
        this.engines = [];
        this.weapons = [];
        this.particles = [];
        
        this.createShip();
        this.setupControls();
        this.setupGamepad();
        
        // متغیرهای حرکت
        this.velocity = new BABYLON.Vector3(0, 0, 0);
        this.rotation = new BABYLON.Vector3(0, 0, 0);
        this.moveSpeed = 0.25;
        this.boostSpeed = 0.5;
        this.rotationSpeed = 0.15;
        this.boostActive = false;
        this.autoPilot = true;
        
        // متصل کردن دوربین به جنگنده
        scene.getCameraByName("cinematicCam").lockedTarget = this.ship;
    }
    
    createShip() {
        // ایجاد گره اصلی جنگنده
        this.ship = new BABYLON.TransformNode("playerShip");
        this.ship.position = new BABYLON.Vector3(0, 0, 0);
        
        // بدنه اصلی
        this.createFuselage();
        
        // موتورها و سیستم پیشرانه
        this.createEngines();
        
        // سلاح‌ها
        this.createWeapons();
        
        // سیستم ذرات و جلوه‌ها
        this.createParticleSystems();
        
        // نورپردازی جنگنده
        this.createShipLights();
    }
    
    createFuselage() {
        // بدنه اصلی - طراحی آیرودینامیک
        const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", {
            diameterTop: 0.6,
            diameterBottom: 1.2,
            height: 4,
            tessellation: 16
        }, this.scene);
        fuselage.parent = this.ship;
        fuselage.rotation.x = Math.PI / 2;
        
        const fuselageMat = new BABYLON.PBRMetallicRoughnessMaterial("fuselageMat", this.scene);
        fuselageMat.baseColor = new BABYLON.Color3(0.08, 0.15, 0.3);
        fuselageMat.metallic = 0.9;
        fuselageMat.roughness = 0.1;
        fuselageMat.emissiveColor = new BABYLON.Color3(0, 0.05, 0.1);
        fuselage.material = fuselageMat;
        
        // کابین خلبان
        const cockpit = BABYLON.MeshBuilder.CreateSphere("cockpit", {
            diameter: 1,
            segments: 16
        }, this.scene);
        cockpit.parent = this.ship;
        cockpit.position.z = 0.6;
        
        const cockpitMat = new BABYLON.PBRMetallicRoughnessMaterial("cockpitMat", this.scene);
        cockpitMat.baseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
        cockpitMat.metallic = 0.3;
        cockpitMat.roughness = 0.05;
        cockpitMat.alpha = 0.6;
        cockpit.material = cockpitMat;
        
        // باله‌های جانبی
        const leftWing = BABYLON.MeshBuilder.CreateBox("leftWing", {
            width: 2.5,
            height: 0.2,
            depth: 1.5
        }, this.scene);
        leftWing.parent = this.ship;
        leftWing.position.set(-1.2, 0, -0.5);
        leftWing.rotation.z = -0.3;
        
        const rightWing = leftWing.clone("rightWing");
        rightWing.position.set(1.2, 0, -0.5);
        rightWing.rotation.z = 0.3;
        
        // باله‌های عمودی
        const verticalStabilizer = BABYLON.MeshBuilder.CreateBox("vStabilizer", {
            width: 0.3,
            height: 1.2,
            depth: 0.8
        }, this.scene);
        verticalStabilizer.parent = this.ship;
        verticalStabilizer.position.set(0, 0.6, -1);
    }
    
    createEngines() {
        // موتورهای اصلی
        const engineConfigs = [
            { position: [-0.8, 0.1, -1.8], size: 0.5 },
            { position: [0.8, 0.1, -1.8], size: 0.5 },
            { position: [-0.4, -0.2, -1.8], size: 0.3 },
            { position: [0.4, -0.2, -1.8], size: 0.3 }
        ];
        
        engineConfigs.forEach((config, i) => {
            const engine = BABYLON.MeshBuilder.CreateCylinder(`engine${i}`, {
                diameter: config.size,
                height: 1.2,
                tessellation: 12
            }, this.scene);
            engine.parent = this.ship;
            engine.position = new BABYLON.Vector3(...config.position);
            engine.rotation.x = Math.PI / 2;
            
            // نور موتور
            const engineLight = new BABYLON.PointLight(`engineLight${i}`, 
                new BABYLON.Vector3(config.position[0], config.position[1], config.position[2] - 0.3), this.scene);
            engineLight.diffuse = new BABYLON.Color3(1, 0.5, 0.1);
            engineLight.intensity = 2;
            engineLight.parent = this.ship;
            
            this.engines.push({ mesh: engine, light: engineLight });
        });
    }
    
    createWeapons() {
        // نقاط شلیک
        this.weaponPoints = [
            new BABYLON.Vector3(-0.3, 0.2, 0.2),
            new BABYLON.Vector3(0.3, 0.2, 0.2),
            new BABYLON.Vector3(-0.6, -0.1, 0.1),
            new BABYLON.Vector3(0.6, -0.1, 0.1)
        ];
    }
    
    createParticleSystems() {
        // سیستم ذرات موتور
        this.engineParticles = new BABYLON.ParticleSystem("engineParticles", 400, this.scene);
        
        this.engineParticles.emitter = new BABYLON.Vector3(0, 0, -1.8);
        this.engineParticles.minEmitBox = new BABYLON.Vector3(-0.8, -0.3, -0.1);
        this.engineParticles.maxEmitBox = new BABYLON.Vector3(0.8, 0.1, 0.1);
        
        this.engineParticles.color1 = new BABYLON.Color4(1, 1, 0, 1);
        this.engineParticles.color2 = new BABYLON.Color4(1, 0.5, 0, 1);
        this.engineParticles.colorDead = new BABYLON.Color4(0.5, 0, 0, 0);
        
        this.engineParticles.minSize = 0.1;
        this.engineParticles.maxSize = 0.25;
        this.engineParticles.minLifeTime = 0.3;
        this.engineParticles.maxLifeTime = 0.8;
        this.engineParticles.emitRate = 300;
        this.engineParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        this.engineParticles.direction1 = new BABYLON.Vector3(0, 0, -1);
        this.engineParticles.direction2 = new BABYLON.Vector3(0, 0, -1);
        
        this.engineParticles.start();
        this.engineParticles.emitter = this.ship;
    }
    
    createShipLights() {
        // نورهای ناوبری
        const navLights = [
            { position: [-1.3, 0.6, 0.2], color: new BABYLON.Color3(1, 0, 0) },
            { position: [1.3, 0.6, 0.2], color: new BABYLON.Color3(0, 1, 0) },
            { position: [0, -0.8, 0.5], color: new BABYLON.Color3(1, 1, 1) }
        ];
        
        navLights.forEach((lightConfig, i) => {
            const light = new BABYLON.PointLight(`navLight${i}`, 
                new BABYLON.Vector3(...lightConfig.position), this.scene);
            light.diffuse = lightConfig.color;
            light.intensity = 0.5;
            light.parent = this.ship;
        });
    }
    
    setupControls() {
        this.keys = {};
        
        // کنترل‌های کیبورد
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key.toLowerCase();
            if (key === ' ') kbInfo.event.preventDefault();
            this.keys[key] = kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN;
        });
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    setupGamepad() {
        this.gamepad = null;
        this.gamepadConnected = false;
        this.leftStick = { x: 0, y: 0 };
        this.rightStick = { x: 0, y: 0 };
        this.buttons = { A: false, B: false, X: false, Y: false };
        
        window.addEventListener("gamepadconnected", (e) => {
            this.gamepad = e.gamepad;
            this.gamepadConnected = true;
            document.getElementById('gamepadStatus').textContent = `🎮 جوی‌استیک: ${e.gamepad.id}`;
        });
        
        window.addEventListener("gamepaddisconnected", (e) => {
            this.gamepad = null;
            this.gamepadConnected = false;
            document.getElementById('gamepadStatus').textContent = "🎮 جوی‌استیک: قطع";
        });
    }
    
    updateGamepad() {
        if (!this.gamepadConnected) return;
        
        const gamepads = navigator.getGamepads();
        this.gamepad = gamepads[this.gamepad?.index || 0];
        
        if (!this.gamepad) return;
        
        // خواندن استیک‌ها
        this.leftStick.x = Math.abs(this.gamepad.axes[0]) > 0.1 ? this.gamepad.axes[0] : 0;
        this.leftStick.y = Math.abs(this.gamepad.axes[1]) > 0.1 ? -this.gamepad.axes[1] : 0;
        this.rightStick.x = Math.abs(this.gamepad.axes[2]) > 0.1 ? this.gamepad.axes[2] : 0;
        this.rightStick.y = Math.abs(this.gamepad.axes[3]) > 0.1 ? -this.gamepad.axes[3] : 0;
        
        // خواندن دکمه‌ها
        this.buttons.A = this.gamepad.buttons[0]?.pressed || false;
        this.buttons.B = this.gamepad.buttons[1]?.pressed || false;
        this.buttons.X = this.gamepad.buttons[2]?.pressed || false;
        this.buttons.Y = this.gamepad.buttons[3]?.pressed || false;
    }
    
    shoot() {
        // شلیک از تمام نقاط سلاح
        this.weaponPoints.forEach(point => {
            const bullet = BABYLON.MeshBuilder.CreateSphere("bullet", {
                diameter: 0.15,
                segments: 6
            }, this.scene);
            
            // تبدیل موقعیت نسبی به جهانی
            const worldPoint = BABYLON.Vector3.TransformCoordinates(point, this.ship.getWorldMatrix());
            bullet.position = worldPoint;
            
            const material = new BABYLON.StandardMaterial("bulletMat", this.scene);
            material.emissiveColor = new BABYLON.Color3(0, 0.8, 1);
            material.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
            bullet.material = material;
            
            // نور گلوله
            const light = new BABYLON.PointLight("bulletLight", bullet.position, this.scene);
            light.diffuse = new BABYLON.Color3(0, 0.8, 1);
            light.intensity = 1.5;
            light.parent = bullet;
            
            // حرکت گلوله به سمت جلو
            const forward = this.ship.forward.scale(-1);
            this.bullets.push({
                mesh: bullet,
                light: light,
                velocity: forward.scale(2),
                lifeTime: 1500
            });
        });
        
        // افکت لرزش
        this.cameraShake(0.1);
    }
    
    cameraShake(intensity) {
        const camera = this.scene.getCameraByName("cinematicCam");
        const originalPos = camera.position.clone();
        
        // لرزش سینمایی
        const shakeInterval = setInterval(() => {
            camera.position.x = originalPos.x + (Math.random() - 0.5) * intensity;
            camera.position.y = originalPos.y + (Math.random() - 0.5) * intensity;
        }, 16);
        
        setTimeout(() => {
            clearInterval(shakeInterval);
            camera.position = originalPos;
        }, 100);
    }
    
    update(deltaTime) {
        this.updateGamepad();
        this.updateMovement(deltaTime);
        this.updateRotation(deltaTime);
        this.updateEngineEffects(deltaTime);
        this.updateBullets(deltaTime);
        this.autoShoot(deltaTime);
    }
    
    updateMovement(deltaTime) {
        let moveX = 0, moveY = 0;
        
        if (this.gamepadConnected) {
            moveX = this.leftStick.x;
            moveY = this.leftStick.y;
            this.boostActive = this.buttons.B;
        } else {
            if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
            if (this.keys['d'] || this.keys['arrowright']) moveX += 1;
            if (this.keys['w'] || this.keys['arrowup']) moveY += 1;
            if (this.keys['s'] || this.keys['arrowdown']) moveY -= 1;
            this.boostActive = this.keys['shift'];
        }
        
        const currentSpeed = this.boostActive ? this.boostSpeed : this.moveSpeed;
        
        // حرکت نرم
        this.velocity.x = BABYLON.Scalar.Lerp(this.velocity.x, moveX * currentSpeed, 0.2);
        this.velocity.y = BABYLON.Scalar.Lerp(this.velocity.y, moveY * currentSpeed, 0.2);
        
        this.ship.position.x += this.velocity.x * 60 * deltaTime;
        this.ship.position.y += this.velocity.y * 60 * deltaTime;
        
        // محدودیت حرکتی
        const bounds = 30;
        this.ship.position.x = Math.max(-bounds, Math.min(bounds, this.ship.position.x));
        this.ship.position.y = Math.max(-bounds, Math.min(bounds, this.ship.position.y));
    }
    
    updateRotation(deltaTime) {
        let targetRoll = 0, targetPitch = 0;
        
        if (this.gamepadConnected) {
            targetRoll = -this.leftStick.x * 0.5;
            targetPitch = this.leftStick.y * 0.3;
            
            // چرخش اضافی با استیک راست
            if (Math.abs(this.rightStick.x) > 0.1) {
                targetRoll = -this.rightStick.x;
            }
        } else {
            targetRoll = -this.velocity.x * 2;
            targetPitch = this.velocity.y * 1.5;
        }
        
        // چرخش نرم
        this.rotation.z = BABYLON.Scalar.Lerp(this.rotation.z, targetRoll, 0.1);
        this.rotation.x = BABYLON.Scalar.Lerp(this.rotation.x, targetPitch, 0.1);
        
        this.ship.rotation.z = this.rotation.z;
        this.ship.rotation.x = this.rotation.x;
    }
    
    updateEngineEffects(deltaTime) {
        // آپدیت سیستم ذرات موتور
        if (this.engineParticles) {
            this.engineParticles.emitRate = this.boostActive ? 600 : 300;
            this.engineParticles.minLifeTime = this.boostActive ? 0.1 : 0.3;
            this.engineParticles.maxLifeTime = this.boostActive ? 0.5 : 0.8;
        }
        
        // آپدیت نور موتورها
        this.engines.forEach(engine => {
            if (this.boostActive) {
                engine.light.diffuse = new BABYLON.Color3(1, 0.7, 0.1);
                engine.light.intensity = 4;
            } else {
                engine.light.diffuse = new BABYLON.Color3(1, 0.4, 0.1);
                engine.light.intensity = 2;
            }
        });
    }
    
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
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
                bullet.light.dispose();
                this.bullets.splice(i, 1);
            }
        }
    }
    
    autoShoot(deltaTime) {
        // شلیک خودکار
        this.shootCooldown = (this.shootCooldown || 0) - deltaTime * 1000;
        
        if (this.shootCooldown <= 0) {
            const shouldShoot = this.gamepadConnected ? this.buttons.A : this.keys[' '];
            
            if (shouldShoot || this.autoPilot) {
                this.shoot();
                this.shootCooldown = 150; // تاخیر بین شلیک‌ها
            }
        }
    }
  }
