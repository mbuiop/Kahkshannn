class CinematicGameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true
        });
        
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.skybox = null;
        this.ground = null;
        
        this.postProcesses = {};
        this.particleSystems = [];
        this.materials = new Map();
        
        this.init();
    }

    async init() {
        await this.createScene();
        this.setupCamera();
        this.setupLighting();
        await this.createSkybox();
        await this.createTerrain();
        this.setupPostProcessing();
        this.setupEnvironment();
        this.setupRenderLoop();
        
        console.log('🎮 موتور سینمایی راه‌اندازی شد');
    }

    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        
        // تنظیمات پیشرفته صحنه
        this.scene.clearColor = new BABYLON.Color4(0.47, 0.75, 1.0, 1.0); // آبی آسمانی
        this.scene.ambientColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        this.scene.fogColor = new BABYLON.Color3(0.47, 0.75, 1.0);
        this.scene.fogStart = 50.0;
        this.scene.fogEnd = 150.0;
        
        // بهینه‌سازی
        this.scene.autoClear = true;
        this.scene.autoClearDepthAndStencil = true;
    }

    setupCamera() {
        // دوربین سینمایی ArcRotate
        this.camera = new BABYLON.ArcRotateCamera(
            "cinematicCamera",
            -Math.PI / 2, // alpha
            Math.PI / 2.5, // beta
            60, // radius
            new BABYLON.Vector3(0, 10, 0), // target
            this.scene
        );

        // تنظیمات پیشرفته دوربین
        this.camera.attachControl(this.canvas, true);
        this.camera.wheelPrecision = 80;
        this.camera.panningSensibility = 1000;
        this.camera.upperRadiusLimit = 120;
        this.camera.lowerRadiusLimit = 20;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        this.camera.lowerBetaLimit = Math.PI / 6;
        this.camera.fov = 0.9;
        this.camera.inertia = 0.85;
        this.camera.speed = 1.2;
        
        // محدودیت‌های پان
        this.camera.panningAxis = new BABYLON.Vector3(1, 0, 1);
        this.camera.panningInertia = 0.9;
    }

    setupLighting() {
        // نور اصلی (خورشید)
        this.light = new BABYLON.DirectionalLight(
            "sunLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        this.light.intensity = 1.8;
        this.light.position = new BABYLON.Vector3(50, 100, 50);
        this.light.shadowEnabled = true;
        
        // سایه‌های پیشرفته
        const shadowGenerator = new BABYLON.ShadowGenerator(4096, this.light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 4;
        shadowGenerator.blurBoxOffset = 2;
        shadowGenerator.darkness = 0.4;
        this.shadowGenerator = shadowGenerator;

        // نور محیطی
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.groundColor = new BABYLON.Color3(0.3, 0.4, 0.5);
        ambientLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);
    }

    async createSkybox() {
        // ایجاد آسمان پویا
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000 }, this.scene);
        
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        
        // تکسچر آسمان آبی با ابر
        const skyTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/skybox/skybox2.png", this.scene);
        skyboxMaterial.diffuseTexture = skyTexture;
        skyboxMaterial.diffuseTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        
        this.skybox.material = skyboxMaterial;
        this.skybox.infiniteDistance = true;
    }

    async createTerrain() {
        // زمین اصلی با ارتفاع‌مپ
        this.ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            "terrain",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // ارتفاع‌مپ ساده
            {
                width: 200,
                height: 200,
                subdivisions: 200,
                minHeight: 0,
                maxHeight: 8,
                onReady: (mesh) => {
                    this.setupGroundMaterial(mesh);
                }
            },
            this.scene
        );

        this.ground.receiveShadows = true;
        this.shadowGenerator.addShadowCaster(this.ground);
    }

    setupGroundMaterial(mesh) {
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        
        // تکسچر چمن با جزئیات بالا
        groundMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.png", this.scene);
        groundMaterial.diffuseTexture.uScale = 40;
        groundMaterial.diffuseTexture.vScale = 40;
        
        // نرمال مپ برای برجستگی
        groundMaterial.bumpTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grassn.png", this.scene);
        groundMaterial.bumpTexture.uScale = 40;
        groundMaterial.bumpTexture.vScale = 40;
        groundMaterial.bumpTexture.level = 0.3;
        
        // انعکاس محیطی
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        groundMaterial.specularPower = 64;
        
        mesh.material = groundMaterial;
    }

    setupPostProcessing() {
        // افکت Bloom برای درخشندگی
        const bloomEffect = new BABYLON.BloomEffect("bloom", 
            1.5, // bloom scale
            0.8, // blur scale
            1.0  // bloom weight
        );
        bloomEffect.threshold = 0.6;
        
        this.postProcesses.bloom = new BABYLON.PostProcessRenderEffect(
            this.engine, "bloom", () => bloomEffect
        );

        // افکت رنگ‌آمیزی
        const colorCurves = new BABYLON.ColorCurves();
        colorCurves.globalHue = 200;
        colorCurves.globalDensity = 20;
        colorCurves.globalSaturation = 10;
        
        // اعمال پست-پروسس‌ها
        this.scene.imageProcessingConfiguration.contrast = 1.2;
        this.scene.imageProcessingConfiguration.exposure = 1.1;
        this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
        this.scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    }

    setupEnvironment() {
        this.createTrees();
        this.createRocks();
        this.createWater();
        this.createAtmosphericEffects();
    }

    createTrees() {
        // ایجاد درختان تصادفی
        const treePositions = [
            new BABYLON.Vector3(-30, 0, -30),
            new BABYLON.Vector3(25, 0, -35),
            new BABYLON.Vector3(-20, 0, 40),
            new BABYLON.Vector3(35, 0, 25),
            new BABYLON.Vector3(-40, 0, 15),
            new BABYLON.Vector3(15, 0, -45)
        ];

        treePositions.forEach((position, index) => {
            this.createTree(position, index);
        });
    }

    createTree(position, index) {
        // تنه درخت
        const trunk = BABYLON.MeshBuilder.CreateCylinder(`treeTrunk${index}`, {
            height: 4 + Math.random() * 2,
            diameter: 0.8 + Math.random() * 0.4
        }, this.scene);

        // برگ‌ها
        const leaves = BABYLON.MeshBuilder.CreateSphere(`treeLeaves${index}`, {
            diameter: 5 + Math.random() * 3,
            segments: 8
        }, this.scene);

        trunk.position = position.clone();
        leaves.position = position.clone();
        leaves.position.y += 3;

        // متریال‌ها
        const trunkMaterial = new BABYLON.StandardMaterial(`trunkMat${index}`, this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.35, 0.2, 0.1);
        trunkMaterial.specularColor = new BABYLON.Color3(0.1, 0.05, 0.02);
        
        const leavesMaterial = new BABYLON.StandardMaterial(`leavesMat${index}`, this.scene);
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.4 + Math.random() * 0.2, 0.1);
        leavesMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        trunk.material = trunkMaterial;
        leaves.material = leavesMaterial;

        // سایه
        this.shadowGenerator.addShadowCaster(trunk);
        this.shadowGenerator.addShadowCaster(leaves);
    }

    createRocks() {
        // ایجاد سنگ‌های تصادفی
        for (let i = 0; i < 15; i++) {
            const rock = BABYLON.MeshBuilder.CreateSphere(`rock${i}`, {
                diameter: 1 + Math.random() * 2,
                segments: 6
            }, this.scene);

            rock.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 150,
                0,
                (Math.random() - 0.5) * 150
            );
            rock.scaling.y = 0.3 + Math.random() * 0.4;
            rock.rotation.y = Math.random() * Math.PI * 2;

            const rockMaterial = new BABYLON.StandardMaterial(`rockMat${i}`, this.scene);
            rockMaterial.diffuseColor = new BABYLON.Color3(0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2);
            rock.material = rockMaterial;

            this.shadowGenerator.addShadowCaster(rock);
        }
    }

    createWater() {
        // ایجاد دریاچه
        const waterMesh = BABYLON.MeshBuilder.CreateGround("water", {
            width: 60,
            height: 40
        }, this.scene);

        waterMesh.position = new BABYLON.Vector3(-50, 0.5, 30);
        waterMesh.rotation.y = Math.PI / 6;

        const waterMaterial = new BABYLON.StandardMaterial("waterMat", this.scene);
        waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
        waterMaterial.alpha = 0.7;
        waterMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        waterMaterial.specularPower = 64;
        
        waterMesh.material = waterMaterial;
    }

    createAtmosphericEffects() {
        // ایجاد ذرات گرد و غبار
        this.createDustParticles();
        
        // ایجاد نورهای محیطی پویا
        this.createDynamicLights();
    }

    createDustParticles() {
        const particleSystem = new BABYLON.ParticleSystem("dustParticles", 2000, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
        particleSystem.emitter = new BABYLON.Vector3(0, 5, 0);
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        particleSystem.minLifeTime = 2.0;
        particleSystem.maxLifeTime = 4.0;
        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-20, 2, -20);
        particleSystem.direction2 = new BABYLON.Vector3(20, 5, 20);
        particleSystem.minEmitPower = 0.5;
        particleSystem.maxEmitPower = 1.5;
        particleSystem.updateSpeed = 0.01;
        particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.1);
        particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.2);
        
        particleSystem.start();
        this.particleSystems.push(particleSystem);
    }

    createDynamicLights() {
        // نورهای نقطه‌ای برای جلوه‌های ویژه
        for (let i = 0; i < 4; i++) {
            const pointLight = new BABYLON.PointLight(
                `envLight${i}`,
                new BABYLON.Vector3(
                    Math.cos(i * Math.PI / 2) * 60,
                    10,
                    Math.sin(i * Math.PI / 2) * 60
                ),
                this.scene
            );
            pointLight.intensity = 0.3;
            pointLight.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);
        }
    }

    setupRenderLoop() {
        this.engine.runRenderLoop(() => {
            // به‌روزرسانی انیمیشن‌ها
            this.update();
            
            // رندر صحنه
            this.scene.render();
        });

        // مدیریت تغییر سایز
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    update() {
        // به‌روزرسانی پویای نورها
        this.updateDynamicLighting();
        
        // به‌روزرسانی ذرات
        this.updateParticles();
    }

    updateDynamicLighting() {
        // تغییر پویای نور محیط بر اساس زمان
        const time = Date.now() * 0.001;
        const lightIntensity = 0.6 + Math.sin(time * 0.5) * 0.1;
        
        if (this.light) {
            this.light.intensity = lightIntensity;
        }
    }

    updateParticles() {
        // به‌روزرسانی موقعیت ذرات
        this.particleSystems.forEach(ps => {
            // منطق به‌روزرسانی ذرات
        });
    }

    // متدهای کاربردی برای ایجاد افکت‌های ویژه
    createExplosionEffect(position, intensity = 1.0) {
        const explosionParticles = new BABYLON.ParticleSystem("explosion", 500, this.scene);
        
        explosionParticles.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
        explosionParticles.emitter = position;
        explosionParticles.minSize = 0.5 * intensity;
        explosionParticles.maxSize = 2.0 * intensity;
        explosionParticles.minLifeTime = 0.3;
        explosionParticles.maxLifeTime = 1.0;
        explosionParticles.emitRate = 1000 * intensity;
        explosionParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        explosionParticles.direction1 = new BABYLON.Vector3(-1, 1, -1);
        explosionParticles.direction2 = new BABYLON.Vector3(1, 3, 1);
        explosionParticles.minEmitPower = 2 * intensity;
        explosionParticles.maxEmitPower = 6 * intensity;
        explosionParticles.updateSpeed = 0.01;
        explosionParticles.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        explosionParticles.color2 = new BABYLON.Color4(1, 0.8, 0, 1.0);
        
        explosionParticles.start();
        
        // توقف خودکار پس از مدت زمان
        setTimeout(() => {
            explosionParticles.stop();
        }, 500);
    }

    createMagicEffect(position, color = new BABYLON.Color3(0.2, 0.5, 1.0)) {
        const magicParticles = new BABYLON.ParticleSystem("magic", 300, this.scene);
        
        magicParticles.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
        magicParticles.emitter = position;
        magicParticles.minSize = 0.2;
        magicParticles.maxSize = 0.8;
        magicParticles.minLifeTime = 0.5;
        magicParticles.maxLifeTime = 2.0;
        magicParticles.emitRate = 200;
        magicParticles.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        magicParticles.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
        magicParticles.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
        magicParticles.minEmitPower = 0.5;
        magicParticles.maxEmitPower = 2.0;
        magicParticles.updateSpeed = 0.005;
        magicParticles.color1 = new BABYLON.Color4(color.r, color.g, color.b, 1.0);
        magicParticles.color2 = new BABYLON.Color4(0.8, 0.9, 1.0, 1.0);
        
        magicParticles.start();
        this.particleSystems.push(magicParticles);
        
        return magicParticles;
    }

    // متد برای ایجاد ساختمان‌های پایه
    createBasicBuilding(type, position, level = 1) {
        let buildingMesh;
        let material;

        switch(type) {
            case 'townhall':
                buildingMesh = BABYLON.MeshBuilder.CreateCylinder("townhall", {
                    height: 6,
                    diameterTop: 0,
                    diameterBottom: 8,
                    tessellation: 6
                }, this.scene);
                material = this.createBuildingMaterial(new BABYLON.Color3(1, 0.8, 0.2), 0.9);
                break;
                
            case 'mine':
                buildingMesh = BABYLON.MeshBuilder.CreateCylinder("mine", {
                    height: 4,
                    diameter: 6,
                    tessellation: 8
                }, this.scene);
                material = this.createBuildingMaterial(new BABYLON.Color3(1, 0.8, 0), 0.8);
                break;
                
            case 'barracks':
                buildingMesh = BABYLON.MeshBuilder.CreateBox("barracks", {
                    width: 6,
                    height: 4,
                    depth: 6
                }, this.scene);
                material = this.createBuildingMaterial(new BABYLON.Color3(0.2, 0.6, 1), 0.8);
                break;
                
            default:
                buildingMesh = BABYLON.MeshBuilder.CreateBox("building", {
                    width: 4,
                    height: 3,
                    depth: 4
                }, this.scene);
                material = this.createBuildingMaterial(new BABYLON.Color3(0.5, 0.5, 0.5), 0.8);
        }

        buildingMesh.position = position;
        buildingMesh.material = material;
        this.shadowGenerator.addShadowCaster(buildingMesh);

        return buildingMesh;
    }

    createBuildingMaterial(color, alpha = 1.0) {
        const material = new BABYLON.StandardMaterial("buildingMat", this.scene);
        material.diffuseColor = color;
        material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        material.specularPower = 64;
        material.alpha = alpha;
        
        return material;
    }

    // متد برای پاک‌سازی
    dispose() {
        this.engine.stopRenderLoop();
        this.particleSystems.forEach(ps => ps.dispose());
        this.scene.dispose();
        this.engine.dispose();
    }
}

// صادر کردن برای استفاده در ماژول‌های دیگر
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CinematicGameEngine;
                                               }
