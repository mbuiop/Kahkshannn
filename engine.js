class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas not found with id:", canvasId);
            return;
        }

        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.skybox = null;
        
        this.postProcesses = {};
        this.particleSystems = [];
        this.torchLights = [];
        this.shadowGenerator = null;
        this.dayNightCycle = null;
        
        this.init();
    }

    init() {
        this.createScene();
        this.setupCamera();
        this.setupLighting();
        this.createSkybox();
        this.setupEnvironment();
        
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
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1.0);
        this.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // Enable physics (اگر AmmoJS موجود باشد)
        if (typeof Ammo !== 'undefined') {
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), 
                new BABYLON.AmmoJSPlugin(true, BABYLON.AmmoJSPlugin));
        } else {
            console.warn("AmmoJS not loaded, physics disabled");
        }
    }

    setupCamera() {
        // Cinematic arc rotate camera
        this.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            Math.PI / 3,
            50,
            new BABYLON.Vector3(0, 5, 0),
            this.scene
        );

        this.camera.attachControl(this.canvas, true);
        this.camera.wheelPrecision = 50;
        this.camera.panningSensibility = 1000;
        this.camera.upperRadiusLimit = 100;
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperBetaLimit = Math.PI / 2 - 0.1;
        
        // Cinematic camera effects
        this.camera.fov = 0.8;
        this.camera.inertia = 0.9;
        this.camera.speed = 0.5;
    }

    setupLighting() {
        // Main directional light (sun)
        this.light = new BABYLON.DirectionalLight(
            "sunLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        this.light.intensity = 1.5;
        this.light.position = new BABYLON.Vector3(50, 100, 50);
        this.light.shadowEnabled = true;
        
        // Shadow generator for cinematic shadows
        this.shadowGenerator = new BABYLON.ShadowGenerator(2048, this.light);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 2;
        this.shadowGenerator.blurBoxOffset = 1;

        // Ambient light for fill
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.3;
        ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        
        // Point lights for atmospheric effects
        this.createAtmosphericLighting();
    }

    createAtmosphericLighting() {
        // Torch lights for buildings
        this.torchLights = [];
        for (let i = 0; i < 8; i++) {
            const torch = new BABYLON.PointLight(
                `torchLight${i}`,
                new BABYLON.Vector3(
                    Math.cos(i * Math.PI / 4) * 30,
                    3,
                    Math.sin(i * Math.PI / 4) * 30
                ),
                this.scene
            );
            torch.intensity = 2;
            torch.range = 15;
            torch.diffuse = new BABYLON.Color3(1, 0.6, 0.3);
            this.torchLights.push(torch);
        }
    }

    createSkybox() {
        // HDR Skybox for cinematic look
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        
        try {
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
                "https://assets.babylonjs.com/textures/skybox/TropicalSunnyDay",
                this.scene
            );
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        } catch (error) {
            console.warn("Skybox texture not available, using fallback");
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.4);
        }
        
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        this.skybox.material = skyboxMaterial;
    }

    setupEnvironment() {
        this.createTerrain();
        this.createWater();
        this.createVegetation();
        this.setupDayNightCycle();
    }

    createTerrain() {
        // ایجاد زمین ساده
        const ground = BABYLON.MeshBuilder.CreateGround(
            "terrain",
            { width: 200, height: 200, subdivisions: 100 },
            this.scene
        );
        
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        
        try {
            // Diffuse texture
            groundMaterial.diffuseTexture = new BABYLON.Texture(
                "https://assets.babylonjs.com/textures/grass.png",
                this.scene
            );
            groundMaterial.diffuseTexture.uScale = 20;
            groundMaterial.diffuseTexture.vScale = 20;
            
            // Normal map for surface detail
            groundMaterial.bumpTexture = new BABYLON.Texture(
                "https://assets.babylonjs.com/textures/grassn.png",
                this.scene
            );
            groundMaterial.bumpTexture.uScale = 20;
            groundMaterial.bumpTexture.vScale = 20;
            groundMaterial.invertNormalMapX = true;
            groundMaterial.invertNormalMapY = true;
        } catch (error) {
            console.warn("Ground textures not available, using fallback colors");
            groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.1);
        }
        
        // Specular for wet look
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        groundMaterial.specularPower = 64;
        
        ground.material = groundMaterial;
        ground.receiveShadows = true;
        
        // Add to shadow generator
        if (this.shadowGenerator) {
            this.shadowGenerator.addShadowCaster(ground);
        }
        
        ground.position.y = -2;
    }

    createWater() {
        try {
            // ایجاد آب ساده با StandardMaterial
            const waterMesh = BABYLON.MeshBuilder.CreateGround("water", 
                { width: 300, height: 300, subdivisions: 50 }, this.scene);
            
            const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
            
            // رنگ آبی شفاف برای آب
            waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
            waterMaterial.alpha = 0.7;
            
            // افکت بازتاب ساده
            waterMaterial.reflectionTexture = new BABYLON.MirrorTexture("waterReflection", 512, this.scene, true);
            waterMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
            waterMaterial.reflectionTexture.level = 0.5;
            
            // افکت انعکاس نور
            waterMaterial.specularColor = new BABYLON.Color3(0.8, 0.9, 1.0);
            waterMaterial.specularPower = 64;
            
            // بافت موج‌دار ساده
            try {
                waterMaterial.bumpTexture = new BABYLON.Texture(
                    "https://assets.babylonjs.com/textures/waterbump.png", this.scene);
                waterMaterial.bumpTexture.level = 0.2;
                waterMaterial.bumpTexture.uScale = 4;
                waterMaterial.bumpTexture.vScale = 4;
            } catch (error) {
                console.warn("Water bump texture not available");
            }
            
            waterMesh.material = waterMaterial;
            waterMesh.position.y = -1.5;
            
            console.log("Water created successfully with standard material");
            
        } catch (error) {
            console.error("Water creation failed:", error);
            
            // Fallback: ایجاد یک صفحه آبی بسیار ساده
            try {
                const waterMesh = BABYLON.MeshBuilder.CreateGround("waterFallback", 
                    { width: 300, height: 300 }, this.scene);
                
                const waterMaterial = new BABYLON.StandardMaterial("waterFallback", this.scene);
                waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.5);
                waterMaterial.alpha = 0.6;
                
                waterMesh.material = waterMaterial;
                waterMesh.position.y = -1.5;
                
                console.log("Fallback water created");
            } catch (fallbackError) {
                console.error("Even fallback water failed:", fallbackError);
            }
        }
    }

    createVegetation() {
        // Create trees and vegetation
        for (let i = 0; i < 15; i++) { // تعداد کمتر برای عملکرد بهتر
            this.createTree(
                Math.random() * 150 - 75,
                Math.random() * 150 - 75
            );
        }
    }

    createTree(x, z) {
        try {
            const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
                height: 3,
                diameter: 0.5,
                tessellation: 6
            }, this.scene);
            
            const leaves = BABYLON.MeshBuilder.CreateSphere("leaves", {
                diameter: 4,
                segments: 8 // کاهش segments برای عملکرد بهتر
            }, this.scene);
            
            trunk.position.set(x, 1.5, z);
            leaves.position.set(x, 4, z);
            
            // Materials
            const trunkMaterial = new BABYLON.StandardMaterial("trunkMat", this.scene);
            trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
            
            const leavesMaterial = new BABYLON.StandardMaterial("leavesMat", this.scene);
            leavesMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
            leavesMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            
            trunk.material = trunkMaterial;
            leaves.material = leavesMaterial;
            
            // Shadows
            if (this.shadowGenerator) {
                this.shadowGenerator.addShadowCaster(trunk);
                this.shadowGenerator.addShadowCaster(leaves);
            }
        } catch (error) {
            console.warn("Tree creation failed:", error);
        }
    }

    setupDayNightCycle() {
        this.dayNightCycle = {
            time: 0,
            speed: 0.001,
            isNight: false
        };
        
        // Animate lighting based on time
        this.scene.registerBeforeRender(() => {
            if (!this.dayNightCycle) return;
            
            this.dayNightCycle.time += this.dayNightCycle.speed;
            
            const sunIntensity = Math.sin(this.dayNightCycle.time) * 0.5 + 0.5;
            if (this.light) {
                this.light.intensity = sunIntensity * 1.5;
            }
            
            // Change sky color based on time
            const skyColor = new BABYLON.Color3(
                Math.max(0.1, sunIntensity * 0.5),
                Math.max(0.1, sunIntensity * 0.6),
                Math.max(0.2, sunIntensity * 0.8)
            );
            this.scene.clearColor = new BABYLON.Color4(
                skyColor.r, skyColor.g, skyColor.b, 1.0
            );
            
            // Update torch lights at night
            const torchIntensity = Math.max(0, (1 - sunIntensity) * 3);
            this.torchLights.forEach(torch => {
                if (torch) {
                    torch.intensity = torchIntensity;
                }
            });
        });
    }

    createParticleSystem(type, position) {
        if (!position) {
            console.error("Particle system position is required");
            return null;
        }

        let particleSystem;
        
        try {
            switch(type) {
                case 'fire':
                    particleSystem = new BABYLON.ParticleSystem("fireParticles", 2000, this.scene);
                    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
                    particleSystem.emitter = position;
                    particleSystem.minSize = 0.1;
                    particleSystem.maxSize = 0.5;
                    particleSystem.minLifeTime = 0.3;
                    particleSystem.maxLifeTime = 1.0;
                    particleSystem.emitRate = 300;
                    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
                    particleSystem.gravity = new BABYLON.Vector3(0, 2, 0);
                    particleSystem.direction1 = new BABYLON.Vector3(-1, 2, -1);
                    particleSystem.direction2 = new BABYLON.Vector3(1, 4, 1);
                    particleSystem.minEmitPower = 1;
                    particleSystem.maxEmitPower = 3;
                    particleSystem.updateSpeed = 0.005;
                    particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
                    particleSystem.color2 = new BABYLON.Color4(1, 0.8, 0, 1.0);
                    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
                    break;
                    
                case 'smoke':
                    particleSystem = new BABYLON.ParticleSystem("smokeParticles", 1000, this.scene);
                    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/smoke.png", this.scene);
                    particleSystem.emitter = position;
                    particleSystem.minSize = 0.5;
                    particleSystem.maxSize = 2.0;
                    particleSystem.minLifeTime = 1.0;
                    particleSystem.maxLifeTime = 3.0;
                    particleSystem.emitRate = 100;
                    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
                    particleSystem.gravity = new BABYLON.Vector3(0, 1, 0);
                    particleSystem.direction1 = new BABYLON.Vector3(-2, 3, -2);
                    particleSystem.direction2 = new BABYLON.Vector3(2, 5, 2);
                    particleSystem.minEmitPower = 0.5;
                    particleSystem.maxEmitPower = 1.5;
                    particleSystem.updateSpeed = 0.01;
                    particleSystem.color1 = new BABYLON.Color4(0.3, 0.3, 0.3, 0.5);
                    particleSystem.color2 = new BABYLON.Color4(0.1, 0.1, 0.1, 0.2);
                    break;
                    
                case 'magic':
                    particleSystem = new BABYLON.ParticleSystem("magicParticles", 500, this.scene);
                    particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
                    particleSystem.emitter = position;
                    particleSystem.minSize = 0.2;
                    particleSystem.maxSize = 0.8;
                    particleSystem.minLifeTime = 0.5;
                    particleSystem.maxLifeTime = 2.0;
                    particleSystem.emitRate = 200;
                    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
                    particleSystem.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
                    particleSystem.direction2 = new BABYLON.Vector3(0.5, 2, 0.5);
                    particleSystem.minEmitPower = 0.5;
                    particleSystem.maxEmitPower = 2.0;
                    particleSystem.updateSpeed = 0.005;
                    particleSystem.color1 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
                    particleSystem.color2 = new BABYLON.Color4(0.8, 0.9, 1.0, 1.0);
                    break;
                    
                default:
                    console.warn("Unknown particle system type:", type);
                    return null;
            }
            
            if (particleSystem) {
                particleSystem.start();
                this.particleSystems.push(particleSystem);
            }
            
        } catch (error) {
            console.error("Error creating particle system:", error);
            return null;
        }
        
        return particleSystem;
    }

    createExplosion(position, intensity = 1.0) {
        if (!position) return;

        // Main explosion
        const explosion = this.createParticleSystem('fire', position);
        if (explosion) {
            explosion.emitRate = 500 * intensity;
        }
        
        // Shockwave ring
        const ring = this.createShockwaveRing(position, intensity);
        
        // Screen shake
        this.cameraShake(0.5 * intensity);
        
        // Light flash
        this.createLightFlash(position, intensity);
        
        // Cleanup
        setTimeout(() => {
            if (explosion) {
                explosion.stop();
            }
            if (ring) {
                ring.dispose();
            }
        }, 1000);
    }

    createShockwaveRing(position, intensity) {
        try {
            const ring = BABYLON.MeshBuilder.CreateTorus("shockwave", {
                diameter: 1,
                thickness: 0.1,
                tessellation: 16 // کاهش tessellation برای عملکرد بهتر
            }, this.scene);
            
            ring.position = position.clone();
            
            const ringMaterial = new BABYLON.StandardMaterial("ringMat", this.scene);
            ringMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2);
            ringMaterial.diffuseColor = new BABYLON.Color3(1, 0.6, 0.1);
            ringMaterial.alpha = 0.8;
            ring.material = ringMaterial;
            
            // Animate expansion
            const startTime = Date.now();
            const animationCallback = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                if (elapsed > 1.0) {
                    ring.dispose();
                    this.scene.unregisterBeforeRender(animationCallback);
                    return;
                }
                
                const scale = 1 + elapsed * 20 * intensity;
                ring.scaling.set(scale, scale, scale);
                ringMaterial.alpha = 0.8 * (1 - elapsed);
            };
            
            this.scene.registerBeforeRender(animationCallback);
            
            return ring;
        } catch (error) {
            console.error("Error creating shockwave ring:", error);
            return null;
        }
    }

    cameraShake(intensity = 0.5) {
        if (!this.camera) return;

        const originalPosition = this.camera.position.clone();
        const shakeDuration = 500; // ms
        const startTime = Date.now();
        
        const shakeLoop = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > shakeDuration) {
                this.camera.position = originalPosition;
                return;
            }
            
            const progress = elapsed / shakeDuration;
            const currentIntensity = intensity * (1 - progress);
            
            this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * currentIntensity;
            this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * currentIntensity;
            this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * currentIntensity;
            
            requestAnimationFrame(shakeLoop);
        };
        
        shakeLoop();
    }

    createLightFlash(position, intensity) {
        try {
            const flashLight = new BABYLON.PointLight("flash", position, this.scene);
            flashLight.intensity = 10 * intensity;
            flashLight.diffuse = new BABYLON.Color3(1, 0.8, 0.6);
            
            // Quick fade out
            const startTime = Date.now();
            const fadeCallback = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed > 200) {
                    flashLight.dispose();
                    this.scene.unregisterBeforeRender(fadeCallback);
                    return;
                }
                
                flashLight.intensity = 10 * intensity * (1 - elapsed / 200);
            };
            
            this.scene.registerBeforeRender(fadeCallback);
        } catch (error) {
            console.error("Error creating light flash:", error);
        }
    }

    update() {
        // Update any engine-level animations or effects
        this.updateParticleSystems();
    }

    updateParticleSystems() {
        // Clean up finished particle systems
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
        }
        if (this.scene) {
            this.scene.dispose();
        }
        if (this.engine) {
            this.engine.dispose();
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
              }
