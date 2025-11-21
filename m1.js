// m1.js - سیستم گرافیک سه‌بعدی با Babylon.js
class Spacecraft3D {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.canvas = null;
        this.playerMesh = null;
        this.enemyMeshes = [];
        this.coinMeshes = [];
        this.isInitialized = false;
    }

    // مقداردهی اولیه موتور گرافیکی
    async init(canvasElement) {
        try {
            // بارگذاری Babylon.js
            if (typeof BABYLON === 'undefined') {
                await this.loadBabylonJS();
            }

            this.canvas = canvasElement;
            this.engine = new BABYLON.Engine(this.canvas, true);
            this.scene = new BABYLON.Scene(this.engine);
            
            // تنظیم دوربین
            this.setupCamera();
            
            // تنظیم نورپردازی
            this.setupLighting();
            
            // ایجاد سفینه بازیکن
            this.createPlayerSpacecraft();
            
            // رندر حلقه
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
            
            // مدیریت تغییر اندازه پنجره
            window.addEventListener('resize', () => {
                this.engine.resize();
            });
            
            this.isInitialized = true;
            console.log('سیستم گرافیک سه‌بعدی با موفقیت راه‌اندازی شد');
            
        } catch (error) {
            console.error('خطا در راه‌اندازی سیستم گرافیک:', error);
            this.fallbackTo2D();
        }
    }

    // بارگذاری Babylon.js
    loadBabylonJS() {
        return new Promise((resolve, reject) => {
            if (typeof BABYLON !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.babylonjs.com/babylon.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // تنظیم دوربین
    setupCamera() {
        // دوربین اصلی
        this.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            Math.PI / 2.5,
            50,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        
        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 200;
        
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

    // تنظیم نورپردازی
    setupLighting() {
        // نور محیطی
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        
        // نور جهت‌دار
        const directionalLight = new BABYLON.DirectionalLight(
            "directionalLight",
            new BABYLON.Vector3(0, -1, 1),
            this.scene
        );
        directionalLight.intensity = 0.8;
        directionalLight.position = new BABYLON.Vector3(0, 50, 0);
        
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
    }

    // ایجاد سفینه بازیکن
    createPlayerSpacecraft() {
        // بدنه اصلی سفینه
        const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", {
            height: 8,
            diameterTop: 0,
            diameterBottom: 4,
            tessellation: 32
        }, this.scene);
        
        // کابین خلبان
        const cockpit = BABYLON.MeshBuilder.CreateSphere("cockpit", {
            diameter: 3,
            segments: 16
        }, this.scene);
        cockpit.position.y = 1.5;
        
        // بال‌ها
        const wingLeft = BABYLON.MeshBuilder.CreateBox("wingLeft", {
            width: 8,
            height: 0.5,
            depth: 3
        }, this.scene);
        wingLeft.position.x = -3;
        wingLeft.position.y = -1;
        
        const wingRight = BABYLON.MeshBuilder.CreateBox("wingRight", {
            width: 8,
            height: 0.5,
            depth: 3
        }, this.scene);
        wingRight.position.x = 3;
        wingRight.position.y = -1;
        
        // موتورها
        this.createEngine(fuselage, -2, -3);
        this.createEngine(fuselage, 2, -3);
        
        // ترکیب تمام بخش‌ها
        this.playerMesh = BABYLON.Mesh.MergeMeshes([
            fuselage, cockpit, wingLeft, wingRight
        ], true, false, null, false, true);
        
        this.playerMesh.name = "playerSpacecraft";
        
        // مواد و بافت
        const playerMaterial = new BABYLON.StandardMaterial("playerMaterial", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 1.0);
        playerMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 1.0);
        playerMaterial.emissiveColor = new BABYLON.Color3(0, 0.2, 0.5);
        
        this.playerMesh.material = playerMaterial;
        
        // جلوه‌های ذره‌ای برای موتور
        this.createEngineParticles();
        
        // انیمیشن شناور
        this.createFloatAnimation();
    }

    // ایجاد موتور سفینه
    createEngine(parent, x, z) {
        const engine = BABYLON.MeshBuilder.CreateCylinder("engine", {
            height: 2,
            diameter: 1,
            tessellation: 16
        }, this.scene);
        
        engine.position.x = x;
        engine.position.z = z;
        engine.position.y = -2;
        
        const engineMaterial = new BABYLON.StandardMaterial("engineMaterial", this.scene);
        engineMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        engineMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        
        engine.material = engineMaterial;
        engine.parent = parent;
        
        return engine;
    }

    // ایجاد جلوه‌های ذره‌ای موتور
    createEngineParticles() {
        const particleSystem = new BABYLON.ParticleSystem("engineParticles", 2000, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        particleSystem.emitter = this.playerMesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -2, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, -2, 0.5);
        
        particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;
        
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.8;
        
        particleSystem.emitRate = 1000;
        
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        particleSystem.gravity = new BABYLON.Vector3(0, -5, 0);
        
        particleSystem.direction1 = new BABYLON.Vector3(-1, -3, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, -5, 1);
        
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        
        particleSystem.minEmitPower = 5;
        particleSystem.maxEmitPower = 10;
        particleSystem.updateSpeed = 0.005;
        
        particleSystem.start();
        
        this.engineParticles = particleSystem;
    }

    // ایجاد انیمیشن شناور
    createFloatAnimation() {
        const floatAnimation = new BABYLON.Animation(
            "floatAnimation",
            "position.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 30, value: 0.5 });
        keys.push({ frame: 60, value: 0 });
        
        floatAnimation.setKeys(keys);
        
        this.playerMesh.animations = [];
        this.playerMesh.animations.push(floatAnimation);
        
        this.scene.beginAnimation(this.playerMesh, 0, 60, true);
    }

    // ایجاد دشمن سه‌بعدی
    createEnemy(type, position) {
        let enemyMesh;
        
        switch(type) {
            case 'volcano':
                enemyMesh = this.createVolcanoEnemy(position);
                break;
            case 'meteor':
                enemyMesh = this.createMeteorEnemy(position);
                break;
            case 'alien':
                enemyMesh = this.createAlienEnemy(position);
                break;
            default:
                enemyMesh = this.createVolcanoEnemy(position);
        }
        
        this.enemyMeshes.push({
            mesh: enemyMesh,
            type: type,
            position: position,
            health: 100
        });
        
        return enemyMesh;
    }

    // ایجاد دشمن آتشفشانی
    createVolcanoEnemy(position) {
        const base = BABYLON.MeshBuilder.CreateCylinder("volcanoBase", {
            diameterTop: 3,
            diameterBottom: 6,
            height: 4,
            tessellation: 32
        }, this.scene);
        
        const crater = BABYLON.MeshBuilder.CreateSphere("volcanoCrater", {
            diameter: 2,
            segments: 16
        }, this.scene);
        crater.position.y = 2;
        crater.scaling.x = 1.5;
        crater.scaling.z = 1.5;
        
        const volcanoMesh = BABYLON.Mesh.MergeMeshes([base, crater], true, false, null, false, true);
        volcanoMesh.position = position;
        
        const volcanoMaterial = new BABYLON.StandardMaterial("volcanoMaterial", this.scene);
        volcanoMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        volcanoMaterial.specularColor = new BABYLON.Color3(0.2, 0.1, 0.05);
        volcanoMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0);
        
        volcanoMesh.material = volcanoMaterial;
        
        // جلوه‌های ذره‌ای برای آتشفشان
        this.createVolcanoParticles(volcanoMesh);
        
        return volcanoMesh;
    }

    // ایجاد جلوه‌های ذره‌ای آتشفشان
    createVolcanoParticles(volcanoMesh) {
        const particleSystem = new BABYLON.ParticleSystem("volcanoParticles", 1000, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        particleSystem.emitter = volcanoMesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(0, 2, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0, 2, 0);
        
        particleSystem.color1 = new BABYLON.Color4(1, 0.3, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0.6, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.2, 0, 0, 0.0);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.5;
        
        particleSystem.emitRate = 200;
        
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        particleSystem.direction1 = new BABYLON.Vector3(-0.5, 3, -0.5);
        particleSystem.direction2 = new BABYLON.Vector3(0.5, 5, 0.5);
        
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        
        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 4;
        particleSystem.updateSpeed = 0.01;
        
        particleSystem.start();
        
        return particleSystem;
    }

    // ایجاد دشمن شهاب‌سنگ
    createMeteorEnemy(position) {
        const meteor = BABYLON.MeshBuilder.CreateSphere("meteor", {
            diameter: 4,
            segments: 8
        }, this.scene);
        meteor.position = position;
        
        // ایجاد سطح ناهموار شهاب‌سنگ
        const positions = meteor.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        for (let i = 0; i < positions.length; i += 3) {
            const noise = Math.random() * 0.5;
            positions[i] *= 1 + noise;
            positions[i + 1] *= 1 + noise;
            positions[i + 2] *= 1 + noise;
        }
        meteor.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        
        const meteorMaterial = new BABYLON.StandardMaterial("meteorMaterial", this.scene);
        meteorMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        meteorMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        meteorMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0);
        
        meteor.material = meteorMaterial;
        
        // ایجاد دنباله برای شهاب‌سنگ
        this.createMeteorTrail(meteor);
        
        return meteor;
    }

    // ایجاد دنباله شهاب‌سنگ
    createMeteorTrail(meteorMesh) {
        const trail = new BABYLON.TrailMesh("meteorTrail", meteorMesh, this.scene, 0.5, 100, true);
        
        const trailMaterial = new BABYLON.StandardMaterial("trailMaterial", this.scene);
        trailMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        trailMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.2, 0);
        trailMaterial.alpha = 0.6;
        
        trail.material = trailMaterial;
        
        return trail;
    }

    // ایجاد دشمن بیگانه
    createAlienEnemy(position) {
        const body = BABYLON.MeshBuilder.CreateSphere("alienBody", {
            diameter: 3,
            segments: 16
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("alienHead", {
            diameter: 1.5,
            segments: 12
        }, this.scene);
        head.position.y = 1.5;
        
        const eye1 = BABYLON.MeshBuilder.CreateSphere("alienEye1", {
            diameter: 0.5,
            segments: 8
        }, this.scene);
        eye1.position.x = 0.5;
        eye1.position.y = 1.7;
        eye1.position.z = 0.7;
        
        const eye2 = BABYLON.MeshBuilder.CreateSphere("alienEye2", {
            diameter: 0.5,
            segments: 8
        }, this.scene);
        eye2.position.x = -0.5;
        eye2.position.y = 1.7;
        eye2.position.z = 0.7;
        
        const alienMesh = BABYLON.Mesh.MergeMeshes([body, head, eye1, eye2], true, false, null, false, true);
        alienMesh.position = position;
        
        const alienMaterial = new BABYLON.StandardMaterial("alienMaterial", this.scene);
        alienMaterial.diffuseColor = new BABYLON.Color3(0, 0.8, 0);
        alienMaterial.specularColor = new BABYLON.Color3(0.2, 1, 0.2);
        alienMaterial.emissiveColor = new BABYLON.Color3(0, 0.3, 0);
        
        alienMesh.material = alienMaterial;
        
        // مواد چشم‌ها
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        eyeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        eye1.material = eyeMaterial;
        eye2.material = eyeMaterial;
        
        return alienMesh;
    }

    // ایجاد سکه سه‌بعدی
    createCoin(type, position) {
        let coinMesh;
        
        switch(type) {
            case 1: // سیاره
                coinMesh = this.createPlanetCoin(position);
                break;
            case 2: // یخ
                coinMesh = this.createIceCoin(position);
                break;
            case 3: // الماس
                coinMesh = this.createDiamondCoin(position);
                break;
            default:
                coinMesh = this.createPlanetCoin(position);
        }
        
        this.coinMeshes.push({
            mesh: coinMesh,
            type: type,
            position: position,
            collected: false
        });
        
        return coinMesh;
    }

    // ایجاد سکه سیاره
    createPlanetCoin(position) {
        const planet = BABYLON.MeshBuilder.CreateSphere("planetCoin", {
            diameter: 2,
            segments: 32
        }, this.scene);
        planet.position = position;
        
        const planetMaterial = new BABYLON.StandardMaterial("planetMaterial", this.scene);
        planetMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
        planetMaterial.specularColor = new BABYLON.Color3(0.5, 0.7, 1.0);
        
        // ایجاد بافت سیاره
        planetMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/3ZQ7Z9C.png", this.scene);
        
        planet.material = planetMaterial;
        
        // انیمیشن چرخش
        this.createRotationAnimation(planet);
        
        // هاله نور
        this.createGlowEffect(planet, new BABYLON.Color3(0, 0.5, 1));
        
        return planet;
    }

    // ایجاد سکه یخ
    createIceCoin(position) {
        const ice = BABYLON.MeshBuilder.CreateSphere("iceCoin", {
            diameter: 2.5,
            segments: 16
        }, this.scene);
        ice.position = position;
        
        const iceMaterial = new BABYLON.StandardMaterial("iceMaterial", this.scene);
        iceMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.9, 1.0);
        iceMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        iceMaterial.alpha = 0.8;
        iceMaterial.reflectionTexture = new BABYLON.CubeTexture("https://assets.babylonjs.com/textures/skybox/TropicalSunnyDay", this.scene);
        
        ice.material = iceMaterial;
        
        // انیمیشن چرخش
        this.createRotationAnimation(ice);
        
        // جلوه درخشش
        this.createGlowEffect(ice, new BABYLON.Color3(0.5, 0.8, 1));
        
        return ice;
    }

    // ایجاد سکه الماس
    createDiamondCoin(position) {
        const diamond = BABYLON.MeshBuilder.CreateCylinder("diamondCoin", {
            height: 3,
            diameterTop: 0,
            diameterBottom: 2,
            tessellation: 4
        }, this.scene);
        diamond.position = position;
        diamond.rotation.x = Math.PI;
        
        const diamondMaterial = new BABYLON.StandardMaterial("diamondMaterial", this.scene);
        diamondMaterial.diffuseColor = new BABYLON.Color3(1, 0.4, 1);
        diamondMaterial.specularColor = new BABYLON.Color3(1, 0.8, 1);
        diamondMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0.3);
        
        diamond.material = diamondMaterial;
        
        // انیمیشن چرخش
        this.createRotationAnimation(diamond);
        
        // جلوه درخشش
        this.createGlowEffect(diamond, new BABYLON.Color3(1, 0, 1));
        
        return diamond;
    }

    // ایجاد انیمیشن چرخش
    createRotationAnimation(mesh) {
        const rotationAnimation = new BABYLON.Animation(
            "rotationAnimation",
            "rotation.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 60, value: 2 * Math.PI });
        
        rotationAnimation.setKeys(keys);
        
        mesh.animations = [];
        mesh.animations.push(rotationAnimation);
        
        this.scene.beginAnimation(mesh, 0, 60, true);
    }

    // ایجاد جلوه درخشش
    createGlowEffect(mesh, color) {
        const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
        glowLayer.intensity = 0.5;
        glowLayer.referenceMeshToUseItsOwnMaterial(mesh);
    }

    // به‌روزرسانی موقعیت سفینه
    updatePlayerPosition(x, y, z) {
        if (this.playerMesh) {
            this.playerMesh.position.x = x;
            this.playerMesh.position.y = y;
            this.playerMesh.position.z = z || 0;
            
            // به‌روزرسانی نور نقطه‌ای
            this.spotLight.position = this.playerMesh.position;
        }
    }

    // به‌روزرسانی چرخش سفینه
    updatePlayerRotation(rotation) {
        if (this.playerMesh) {
            this.playerMesh.rotation.y = rotation;
        }
    }

    // به‌روزرسانی موقعیت دشمن
    updateEnemyPosition(index, x, y, z) {
        if (this.enemyMeshes[index]) {
            this.enemyMeshes[index].mesh.position.x = x;
            this.enemyMeshes[index].mesh.position.y = y;
            this.enemyMeshes[index].mesh.position.z = z || 0;
        }
    }

    // به‌روزرسانی موقعیت سکه
    updateCoinPosition(index, x, y, z) {
        if (this.coinMeshes[index]) {
            this.coinMeshes[index].mesh.position.x = x;
            this.coinMeshes[index].mesh.position.y = y;
            this.coinMeshes[index].mesh.position.z = z || 0;
        }
    }

    // حذف دشمن
    removeEnemy(index) {
        if (this.enemyMeshes[index]) {
            this.enemyMeshes[index].mesh.dispose();
            this.enemyMeshes.splice(index, 1);
        }
    }

    // حذف سکه
    removeCoin(index) {
        if (this.coinMeshes[index]) {
            this.coinMeshes[index].mesh.dispose();
            this.coinMeshes.splice(index, 1);
        }
    }

    // ایجاد انفجار
    createExplosion(position, scale = 1) {
        const explosion = BABYLON.MeshBuilder.CreateSphere("explosion", {
            diameter: 2 * scale,
            segments: 16
        }, this.scene);
        explosion.position = position;
        
        const explosionMaterial = new BABYLON.StandardMaterial("explosionMaterial", this.scene);
        explosionMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        explosionMaterial.alpha = 0.8;
        
        explosion.material = explosionMaterial;
        
        // انیمیشن انفجار
        const scaleAnimation = new BABYLON.Animation(
            "explosionScale",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const scaleKeys = [];
        scaleKeys.push({ frame: 0, value: new BABYLON.Vector3(0.1, 0.1, 0.1) });
        scaleKeys.push({ frame: 15, value: new BABYLON.Vector3(3 * scale, 3 * scale, 3 * scale) });
        scaleKeys.push({ frame: 30, value: new BABYLON.Vector3(0.1, 0.1, 0.1) });
        
        scaleAnimation.setKeys(scaleKeys);
        
        const alphaAnimation = new BABYLON.Animation(
            "explosionAlpha",
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const alphaKeys = [];
        alphaKeys.push({ frame: 0, value: 0 });
        alphaKeys.push({ frame: 10, value: 0.9 });
        alphaKeys.push({ frame: 30, value: 0 });
        
        alphaAnimation.setKeys(alphaKeys);
        
        explosion.animations = [scaleAnimation, alphaAnimation];
        
        this.scene.beginAnimation(explosion, 0, 30, false, () => {
            explosion.dispose();
        });
        
        return explosion;
    }

    // فعال کردن حالت اضطراری سفینه
    setEmergencyMode(active) {
        if (this.playerMesh && this.playerMesh.material) {
            if (active) {
                this.playerMesh.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
                this.engineParticles.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
                this.engineParticles.color2 = new BABYLON.Color4(1, 0.2, 0, 1.0);
            } else {
                this.playerMesh.material.emissiveColor = new BABYLON.Color3(0, 0.2, 0.5);
                this.engineParticles.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
                this.engineParticles.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
            }
        }
    }

    // پاک‌سازی حافظه
    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
        if (this.scene) {
            this.scene.dispose();
        }
    }

    // حالت بازگشت به دو بعدی در صورت خطا
    fallbackTo2D() {
        console.warn('سیستم سه‌بعدی غیرفعال شد. استفاده از حالت دو بعدی');
        this.isInitialized = false;
    }
}

// صادر کردن کلاس برای استفاده در فایل‌های دیگر
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Spacecraft3D;
          }
