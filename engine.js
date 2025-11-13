class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas not found with id:", canvasId);
            return;
        }

        // ایجاد موتور با تنظیمات پیشرفته
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            disableWebGL2Support: false
        });

        this.scene = null;
        this.camera = null;
        this.light = null;
        this.skybox = null;
        this.shadowGenerator = null;
        
        this.postProcesses = {};
        this.particleSystems = [];
        this.torchLights = [];
        this.dayNightCycle = null;
        
        this.init();
    }

    init() {
        this.createScene();
        this.setupCamera();
        this.setupLighting();
        this.createSkybox();
        this.setupEnvironment();
        this.setupPostProcessing();
        
        // رندر لوپ
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
                this.update();
            }
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        
        // رنگ آسمان سینمایی
        this.scene.clearColor = new BABYLON.Color4(0.05, 0.1, 0.2, 1.0);
        this.scene.ambientColor = new BABYLON.Color3(0.4, 0.4, 0.5);
        
        // افکت مه برای عمق بیشتر
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = new BABYLON.Color3(0.1, 0.2, 0.3);
        
        // انعکاس و محیط
        this.scene.imageProcessingConfiguration.contrast = 1.2;
        this.scene.imageProcessingConfiguration.exposure = 0.8;
        this.scene.imageProcessingConfiguration.toneMappingEnabled = true;
        this.scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    }

    setupCamera() {
        // دوربین سینمایی با کنترل روان
        this.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            Math.PI / 2.5,
            35,
            new BABYLON.Vector3(0, 8, 0),
            this.scene
        );

        this.camera.attachControl(this.canvas, true);
        
        // تنظیمات سینمایی دوربین
        this.camera.wheelPrecision = 80;
        this.camera.panningSensibility = 2000;
        this.camera.upperRadiusLimit = 80;
        this.camera.lowerRadiusLimit = 15;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        this.camera.lowerBetaLimit = 0.1;
        
        // افکت‌های سینمایی
        this.camera.fov = 0.9;
        this.camera.inertia = 0.85;
        this.camera.speed = 0.7;
        this.camera.minZ = 1;
        this.camera.maxZ = 1000;
        
        // لرزش دوربین هنگام حرکت
        this.camera.cameraRigMode = BABYLON.Camera.RIG_MODE_NONE;
    }

    setupLighting() {
        // نور اصلی (خورشید)
        this.light = new BABYLON.DirectionalLight(
            "sunLight",
            new BABYLON.Vector3(-1, -3, -1),
            this.scene
        );
        this.light.intensity = 1.8;
        this.light.position = new BABYLON.Vector3(50, 120, 50);
        this.light.shadowEnabled = true;
        this.light.shadowMinZ = 1;
        this.light.shadowMaxZ = 250;
        
        // سایه‌های سینمایی
        this.shadowGenerator = new BABYLON.ShadowGenerator(4096, this.light);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 4;
        this.shadowGenerator.blurBoxOffset = 2;
        this.shadowGenerator.depthScale = 50;
        this.shadowGenerator.setDarkness(0.4);

        // نور محیطی
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.4;
        ambientLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        ambientLight.diffuse = new BABYLON.Color3(0.6, 0.6, 0.8);
        
        // نورهای نقطه‌ای برای افکت‌های جوی
        this.createAtmosphericLighting();
        
        // نورهای اضافی برای عمق بخشی
        this.createFillLights();
    }

    createAtmosphericLighting() {
        // نورهای مشعل برای ساختمان‌ها
        this.torchLights = [];
        const torchPositions = [
            new BABYLON.Vector3(25, 4, 25),
            new BABYLON.Vector3(-25, 4, 25),
            new BABYLON.Vector3(25, 4, -25),
            new BABYLON.Vector3(-25, 4, -25),
            new BABYLON.Vector3(40, 4, 0),
            new BABYLON.Vector3(-40, 4, 0),
            new BABYLON.Vector3(0, 4, 40),
            new BABYLON.Vector3(0, 4, -40)
        ];

        torchPositions.forEach((pos, i) => {
            const torch = new BABYLON.PointLight(
                `torchLight${i}`,
                pos,
                this.scene
            );
            torch.intensity = 3;
            torch.range = 20;
            torch.diffuse = new BABYLON.Color3(1, 0.6, 0.3);
            torch.specular = new BABYLON.Color3(1, 0.8, 0.5);
            
            // افکت نورپردازی پویا
            this.animateTorchLight(torch);
            
            this.torchLights.push(torch);
        });
    }

    createFillLights() {
        // نورهای پرکننده برای کاهش سایه‌های تیره
        const fillLight1 = new BABYLON.PointLight(
            "fillLight1",
            new BABYLON.Vector3(30, 20, 30),
            this.scene
        );
        fillLight1.intensity = 0.3;
        fillLight1.diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);

        const fillLight2 = new BABYLON.PointLight(
            "fillLight2",
            new BABYLON.Vector3(-30, 20, -30),
            this.scene
        );
        fillLight2.intensity = 0.2;
        fillLight2.diffuse = new BABYLON.Color3(1.0, 0.9, 0.8);
    }

    createSkybox() {
        // آسمان‌پوش سینمایی
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000 }, this.scene);
        
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        
        try {
            // استفاده از تکسچر HDR برای آسمان واقعی
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
                "https://assets.babylonjs.com/textures/skybox/TropicalSunnyDay",
                this.scene
            );
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        } catch (error) {
            // فال‌بک در صورت خطا
            console.warn("Skybox texture not available, using procedural sky");
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.4);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        }
        
        skyboxMaterial.disableLighting = true;
        this.skybox.material = skyboxMaterial;
        this.skybox.infiniteDistance = true;
    }

    setupPostProcessing() {
        try {
            // استفاده از Default Rendering Pipeline برای افکت‌های سینمایی
            const defaultPipeline = new BABYLON.DefaultRenderingPipeline(
                "defaultPipeline",
                true, // HDR
                this.scene,
                [this.camera]
            );
            
            // Bloom برای نورهای درخشان
            defaultPipeline.bloomEnabled = true;
            defaultPipeline.bloomThreshold = 0.6;
            defaultPipeline.bloomWeight = 0.4;
            defaultPipeline.bloomKernel = 128;
            defaultPipeline.bloomScale = 0.5;
            
            // Depth of Field برای فوکوس سینمایی
            defaultPipeline.depthOfFieldEnabled = true;
            defaultPipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Low;
            defaultPipeline.depthOfField.focalLength = 100;
            defaultPipeline.depthOfField.fStop = 1.4;
            defaultPipeline.depthOfField.focusDistance = 50;
            
            // Sharpen برای وضوح بیشتر
            defaultPipeline.sharpenEnabled = true;
            defaultPipeline.sharpen.edgeAmount = 0.5;
            defaultPipeline.sharpen.colorAmount = 0.8;
            
            // Chromatic Aberration برای افکت سینمایی
            defaultPipeline.chromaticAberrationEnabled = true;
            defaultPipeline.chromaticAberration.aberrationAmount = 1.0;
            defaultPipeline.chromaticAberration.radialIntensity = 0.5;
            defaultPipeline.chromaticAberration.direction = new BABYLON.Vector2(0, 0);
            
            // Grain برای حس فیلم
            defaultPipeline.grainEnabled = true;
            defaultPipeline.grain.animated = true;
            defaultPipeline.grain.intensity = 0.2;
            
            // Image Processing
            defaultPipeline.imageProcessingEnabled = true;
            defaultPipeline.imageProcessing.contrast = 1.3;
            defaultPipeline.imageProcessing.exposure = 0.9;
            defaultPipeline.imageProcessing.toneMappingEnabled = true;
            defaultPipeline.imageProcessing.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;

            this.postProcesses.defaultPipeline = defaultPipeline;
            
            console.log("Cinematic post-processing setup completed");
            
        } catch (error) {
            console.warn("Advanced post-processing not available:", error);
        }
    }

    setupEnvironment() {
        this.createTerrain();
        this.createWater();
        this.createVegetation();
        this.createRocks();
        this.createDetails();
        this.setupDayNightCycle();
    }

    createTerrain() {
        // زمین اصلی با متریال پیشرفته
        const ground = BABYLON.MeshBuilder.CreateGround(
            "terrain",
            { width: 200, height: 200, subdivisions: 200 },
            this.scene
        );
        
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        
        try {
            // تکسچر پیشرفته زمین
            groundMaterial.diffuseTexture = new BABYLON.Texture(
                "https://assets.babylonjs.com/textures/grass.png",
                this.scene
            );
            groundMaterial.diffuseTexture.uScale = 40;
            groundMaterial.diffuseTexture.vScale = 40;
            
            groundMaterial.bumpTexture = new BABYLON.Texture(
                "https://assets.babylonjs.com/textures/grassn.png",
                this.scene
            );
            groundMaterial.bumpTexture.uScale = 40;
            groundMaterial.bumpTexture.vScale = 40;
            groundMaterial.bumpTexture.level = 0.3;
            
            // انعکاس محیطی
            groundMaterial.reflectionTexture = new BABYLON.MirrorTexture("groundReflection", 512, this.scene, true);
            groundMaterial.reflectionTexture.level = 0.2;
            
            // تنظیمات پیشرف متریال
            groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            groundMaterial.specularPower = 32;
            groundMaterial.ambientColor = new BABYLON.Color3(0.4, 0.4, 0.4);
            
        } catch (error) {
            console.warn("Ground textures not available, using procedural material");
            groundMaterial.diffuseColor = new BABYLON.Color3(0.15, 0.25, 0.1);
            groundMaterial.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        }
        
        ground.material = groundMaterial;
        ground.receiveShadows = true;
        ground.position.y = -1;
        
        // اضافه کردن به سایه‌زن
        if (this.shadowGenerator) {
            this.shadowGenerator.addShadowCaster(ground);
        }
        
        // ایجاد ناهمواری‌های طبیعی
        this.createTerrainDetails(ground);
    }

    createTerrainDetails(ground) {
        // ایجاد تپه‌های کوچک برای طبیعی‌تر شدن زمین
        const noiseTexture = new BABYLON.NoiseProceduralTexture("noise", 256, this.scene);
        noiseTexture.animationSpeedFactor = 0;
        noiseTexture.octaves = 3;
        noiseTexture.persistence = 0.8;
        
        // این بخش رو بعداً برای ناهمواری واقعی می‌تونیم اضافه کنیم
    }

    createWater() {
        try {
            // ایجاد دریاچه سینمایی
            const waterMesh = BABYLON.MeshBuilder.CreateGround("water", 
                { width: 120, height: 120, subdivisions: 100 }, this.scene);
            
            const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
            
            // متریال پیشرفته آب
            waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
            waterMaterial.alpha = 0.85;
            waterMaterial.specularColor = new BABYLON.Color3(0.8, 0.9, 1.0);
            waterMaterial.specularPower = 128;
            waterMaterial.emissiveColor = new BABYLON.Color3(0, 0.1, 0.2);
            
            // انعکاس
            waterMaterial.reflectionTexture = new BABYLON.MirrorTexture("waterReflection", 1024, this.scene, true);
            waterMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, -1.5);
            waterMaterial.reflectionTexture.level = 0.6;
            
            // انکسار
            waterMaterial.refractionTexture = new BABYLON.MirrorTexture("waterRefraction", 1024, this.scene, true);
            waterMaterial.refractionTexture.level = 0.2;
            
            try {
                waterMaterial.bumpTexture = new BABYLON.Texture(
                    "https://assets.babylonjs.com/textures/waterbump.png", this.scene);
                waterMaterial.bumpTexture.level = 0.3;
                waterMaterial.bumpTexture.uScale = 8;
                waterMaterial.bumpTexture.vScale = 8;
            } catch (error) {
                console.warn("Water bump texture not available");
            }
            
            waterMesh.material = waterMaterial;
            waterMesh.position.y = -0.8;
            
            // انیمیشن آب
            this.animateWater(waterMesh);
            
        } catch (error) {
            console.error("Water creation failed:", error);
        }
    }

    createVegetation() {
        // ایجاد جنگل و گیاهان
        const treeCount = 30;
        const flowerCount = 50;
        
        for (let i = 0; i < treeCount; i++) {
            this.createTree(
                Math.random() * 160 - 80,
                Math.random() * 160 - 80
            );
        }
        
        for (let i = 0; i < flowerCount; i++) {
            this.createFlower(
                Math.random() * 180 - 90,
                Math.random() * 180 - 90
            );
        }
    }

    createTree(x, z) {
        try {
            // تنه درخت
            const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
                height: 4 + Math.random() * 2,
                diameterTop: 0.3,
                diameterBottom: 0.6,
                tessellation: 8
            }, this.scene);
            
            // برگ‌ها
            const leaves = BABYLON.MeshBuilder.CreateSphere("leaves", {
                diameter: 3 + Math.random() * 2,
                segments: 6
            }, this.scene);
            
            trunk.position.set(x, 2, z);
            leaves.position.set(x, 5 + Math.random(), z);
            
            // متریال طبیعی
            const trunkMaterial = new BABYLON.StandardMaterial("trunkMat", this.scene);
            trunkMaterial.diffuseColor = new BABYLON.Color3(0.3 + Math.random() * 0.1, 0.2 + Math.random() * 0.1, 0.1 + Math.random() * 0.1);
            trunkMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            const leavesMaterial = new BABYLON.StandardMaterial("leavesMat", this.scene);
            leavesMaterial.diffuseColor = new BABYLON.Color3(
                0.1 + Math.random() * 0.2, 
                0.4 + Math.random() * 0.3, 
                0.1 + Math.random() * 0.2
            );
            leavesMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            trunk.material = trunkMaterial;
            leaves.material = leavesMaterial;
            
            // سایه
            if (this.shadowGenerator) {
                this.shadowGenerator.addShadowCaster(trunk);
                this.shadowGenerator.addShadowCaster(leaves);
            }
            
        } catch (error) {
            console.warn("Tree creation failed:", error);
        }
    }

    createFlower(x, z) {
        try {
            const stem = BABYLON.MeshBuilder.CreateCylinder("stem", {
                height: 0.3,
                diameter: 0.05
            }, this.scene);
            
            const flower = BABYLON.MeshBuilder.CreateSphere("flower", {
                diameter: 0.4,
                segments: 4
            }, this.scene);
            
            stem.position.set(x, 0.15, z);
            flower.position.set(x, 0.3, z);
            
            const flowerMaterial = new BABYLON.StandardMaterial("flowerMat", this.scene);
            flowerMaterial.diffuseColor = new BABYLON.Color3(
                Math.random(), 
                Math.random(), 
                Math.random()
            );
            flower.material = flowerMaterial;
            
        } catch (error) {
            // ignore flower errors
        }
    }

    createRocks() {
        // ایجاد سنگ‌های طبیعی
        for (let i = 0; i < 20; i++) {
            this.createRock(
                Math.random() * 180 - 90,
                Math.random() * 180 - 90
            );
        }
    }

    createRock(x, z) {
        try {
            const rock = BABYLON.MeshBuilder.CreateSphere("rock", {
                diameter: 0.5 + Math.random() * 1,
                segments: 3
            }, this.scene);
            
            rock.position.set(x, 0.25, z);
            rock.scaling.y = 0.3 + Math.random() * 0.4;
            rock.rotation.y = Math.random() * Math.PI * 2;
            
            const rockMaterial = new BABYLON.StandardMaterial("rockMat", this.scene);
            rockMaterial.diffuseColor = new BABYLON.Color3(
                0.3 + Math.random() * 0.2,
                0.3 + Math.random() * 0.2,
                0.3 + Math.random() * 0.2
            );
            rockMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            rock.material = rockMaterial;
            
            if (this.shadowGenerator) {
                this.shadowGenerator.addShadowCaster(rock);
            }
            
        } catch (error) {
            console.warn("Rock creation failed:", error);
        }
    }

    createDetails() {
        // ایجاد جزئیات محیطی بیشتر
        this.createButterflies();
        this.createFloatingParticles();
    }

    createButterflies() {
        // پروانه‌های متحرک
        for (let i = 0; i < 5; i++) {
            this.createButterfly();
        }
    }

    createButterfly() {
        // ساخت پروانه (می‌تونیم بعداً کاملش کنیم)
        const butterfly = BABYLON.MeshBuilder.CreateBox("butterfly", {
            size: 0.1
        }, this.scene);
        
        butterfly.position.set(
            Math.random() * 100 - 50,
            3 + Math.random() * 5,
            Math.random() * 100 - 50
        );
        
        const butterflyMat = new BABYLON.StandardMaterial("butterflyMat", this.scene);
        butterflyMat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        butterfly.material = butterflyMat;
        
        this.animateButterfly(butterfly);
    }

    setupDayNightCycle() {
        this.dayNightCycle = {
            time: 0,
            speed: 0.0005,
            isNight: false
        };
        
        // انیمیشن چرخه روز و شب
        this.scene.registerBeforeRender(() => {
            if (!this.dayNightCycle) return;
            
            this.dayNightCycle.time += this.dayNightCycle.speed;
            
            const sunIntensity = Math.sin(this.dayNightCycle.time) * 0.5 + 0.5;
            
            // به‌روزرسانی نور خورشید
            if (this.light) {
                this.light.intensity = sunIntensity * 1.8;
                
                // تغییر رنگ نور بر اساس زمان روز
                const lightColor = new BABYLON.Color3(
                    Math.max(0.6, sunIntensity),
                    Math.max(0.7, sunIntensity * 0.9),
                    Math.max(0.8, sunIntensity * 0.8)
                );
                this.light.diffuse = lightColor;
            }
            
            // تغییر رنگ آسمان
            const skyColor = new BABYLON.Color3(
                Math.max(0.05, sunIntensity * 0.3),
                Math.max(0.1, sunIntensity * 0.4),
                Math.max(0.2, sunIntensity * 0.6)
            );
            this.scene.clearColor = new BABYLON.Color4(skyColor.r, skyColor.g, skyColor.b, 1.0);
            
            // به‌روزرسانی نورهای مشعل
            const torchIntensity = Math.max(0, (1 - sunIntensity) * 4);
            this.torchLights.forEach(torch => {
                if (torch) {
                    torch.intensity = torchIntensity;
                }
            });
            
            // تغییر مه بر اساس زمان
            this.scene.fogDensity = 0.005 + (1 - sunIntensity) * 0.015;
        });
    }

    // انیمیشن‌ها
    animateTorchLight(light) {
        let time = 0;
        this.scene.registerBeforeRender(() => {
            time += 0.1;
            light.intensity = light.intensity + Math.sin(time) * 0.1;
        });
    }

    animateWater(waterMesh) {
        let time = 0;
        this.scene.registerBeforeRender(() => {
            time += 0.01;
            if (waterMesh.material.bumpTexture) {
                waterMesh.material.bumpTexture.uOffset = time * 0.02;
                waterMesh.material.bumpTexture.vOffset = time * 0.01;
            }
        });
    }

    animateButterfly(butterfly) {
        let time = 0;
        const startPos = butterfly.position.clone();
        
        this.scene.registerBeforeRender(() => {
            time += 0.02;
            butterfly.position.x = startPos.x + Math.sin(time) * 5;
            butterfly.position.z = startPos.z + Math.cos(time * 0.7) * 5;
            butterfly.position.y = startPos.y + Math.sin(time * 1.3) * 2;
            butterfly.rotation.y = time;
        });
    }

    createFloatingParticles() {
        // ذرات شناور در هوا برای افکت جوی
        for (let i = 0; i < 10; i++) {
            this.createFloatingParticle();
        }
    }

    createFloatingParticle() {
        const particle = BABYLON.MeshBuilder.CreateSphere("particle", {
            diameter: 0.05
        }, this.scene);
        
        particle.position.set(
            Math.random() * 100 - 50,
            10 + Math.random() * 20,
            Math.random() * 100 - 50
        );
        
        const particleMat = new BABYLON.StandardMaterial("particleMat", this.scene);
        particleMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        particleMat.alpha = 0.3;
        particle.material = particleMat;
        
        this.animateFloatingParticle(particle);
    }

    animateFloatingParticle(particle) {
        let time = Math.random() * Math.PI * 2;
        const startPos = particle.position.clone();
        
        this.scene.registerBeforeRender(() => {
            time += 0.005;
            particle.position.y = startPos.y + Math.sin(time) * 2;
            particle.position.x = startPos.x + Math.cos(time * 0.3) * 1;
            particle.rotation.y = time;
        });
    }

    // بقیه متدها (createParticleSystem, createExplosion, etc.) مانند قبل...
    createParticleSystem(type, position) {
        // پیاده‌سازی سیستم ذرات مانند قبل...
    }

    createExplosion(position, intensity = 1.0) {
        // پیاده‌سازی انفجار مانند قبل...
    }

    cameraShake(intensity = 0.5) {
        // پیاده‌سازی لرزش دوربین مانند قبل...
    }

    update() {
        this.updateParticleSystems();
    }

    updateParticleSystems() {
        this.particleSystems = this.particleSystems.filter(ps => {
            if (!ps) return false;
            if (ps.isAlive && ps.isAlive() === false) {
                try {
                    ps.dispose();
                } catch (error) {
                    console.warn("Error disposing particle system:", error);
                }
                return false;
            }
            return true;
        });
    }

    dispose() {
        if (this.engine) {
            this.engine.stopRenderLoop();
            this.engine.dispose();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
  }
