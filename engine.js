class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
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
        
        this.init();
    }

    init() {
        this.createScene();
        this.setupCamera();
        this.setupLighting();
        this.createSkybox();
        this.setupPostProcessing();
        this.setupEnvironment();
        
        this.engine.runRenderLoop(() => {
            this.scene.render();
            this.update();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1.0);
        this.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        // Enable physics
        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), 
            new BABYLON.AmmoJSPlugin(true, BABYLON.AmmoJSPlugin));
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
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, this.light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.blurBoxOffset = 1;
        this.shadowGenerator = shadowGenerator;

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
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
            "https://assets.babylonjs.com/textures/skybox/TropicalSunnyDay",
            this.scene
        ); 
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        this.skybox.material = skyboxMaterial;
    }

    setupPostProcessing() {
        // Bloom effect for glowing elements
        const bloomEffect = new BABYLON.BloomEffect("bloom", 
            2.0, // bloom scale
            1.0, // blur scale
            1.0  // bloom weight
        );
        bloomEffect.threshold = 0.8;
        
        this.postProcesses.bloom = new BABYLON.PostProcessRenderEffect(
            this.engine, "bloom", () => bloomEffect
        );
        
        // Depth of field for cinematic focus
        const dofEffect = new BABYLON.DepthOfFieldEffect(
            this.scene,
            {
                blendMode: BABYLON.DepthOfFieldEffect.BLENDMODE_STANDARD,
                focalLength: 100,
                fStop: 1.4,
                focusDistance: 100,
                lensSize: 50
            }
        );
        
        // Color grading
        const colorGrading = new BABYLON.ColorCorrectionPostProcess(
            "colorGrading",
            "https://assets.babylonjs.com/textures/colorGrading.png",
            1.0,
            this.camera
        );
        
        // Apply all post processes
        this.scene.postProcessRenderEffectsManager = new BABYLON.PostProcessRenderEffectsManager(this.scene);
        this.scene.postProcessRenderEffectsManager.addEffect(this.postProcesses.bloom);
    }

    setupEnvironment() {
        this.createTerrain();
        this.createWater();
        this.createVegetation();
        this.setupDayNightCycle();
    }

    createTerrain() {
        // Advanced terrain with multiple material layers
        const ground = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
            "terrain",
            "https://assets.babylonjs.com/textures/heightMap.png",
            {
                width: 200,
                height: 200,
                subdivisions: 100,
                minHeight: 0,
                maxHeight: 10,
                onReady: (mesh) => {
                    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
                    
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
                    
                    // Specular for wet look
                    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
                    groundMaterial.specularPower = 64;
                    
                    mesh.material = groundMaterial;
                    mesh.receiveShadows = true;
                    
                    // Add to shadow generator
                    this.shadowGenerator.addShadowCaster(mesh);
                }
            },
            this.scene
        );
        
        ground.position.y = -2;
    }

    createWater() {
        // Reflective water surface
        const waterMesh = BABYLON.MeshBuilder.CreateGround("water", 
            { width: 300, height: 300 }, this.scene);
        
        const waterMaterial = new BABYLON.WaterMaterial("waterMaterial", this.scene, 
            new BABYLON.Vector2(1024, 1024));
        
        waterMaterial.backFaceCulling = true;
        waterMaterial.bumpTexture = new BABYLON.Texture(
            "https://assets.babylonjs.com/textures/waterbump.png", this.scene);
        waterMaterial.windForce = -5;
        waterMaterial.waveHeight = 0.5;
        waterMaterial.bumpHeight = 0.2;
        waterMaterial.waveLength = 0.1;
        waterMaterial.waveSpeed = 50;
        waterMaterial.colorBlendFactor = 0.3;
        waterMaterial.addToRenderList(this.skybox);
        
        waterMesh.material = waterMaterial;
        waterMesh.position.y = -1.5;
    }

    createVegetation() {
        // Create trees and vegetation
        for (let i = 0; i < 50; i++) {
            this.createTree(
                Math.random() * 180 - 90,
                Math.random() * 180 - 90
            );
        }
    }

    createTree(x, z) {
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", {
            height: 3,
            diameter: 0.5
        }, this.scene);
        
        const leaves = BABYLON.MeshBuilder.CreateSphere("leaves", {
            diameter: 4
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
        this.shadowGenerator.addShadowCaster(trunk);
        this.shadowGenerator.addShadowCaster(leaves);
    }

    setupDayNightCycle() {
        this.dayNightCycle = {
            time: 0,
            speed: 0.001,
            isNight: false
        };
        
        // Animate lighting based on time
        this.scene.registerBeforeRender(() => {
            this.dayNightCycle.time += this.dayNightCycle.speed;
            
            const sunIntensity = Math.sin(this.dayNightCycle.time) * 0.5 + 0.5;
            this.light.intensity = sunIntensity * 1.5;
            
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
                torch.intensity = torchIntensity;
            });
        });
    }

    createParticleSystem(type, position) {
        let particleSystem;
        
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
        }
        
        if (particleSystem) {
            particleSystem.start();
            this.particleSystems.push(particleSystem);
        }
        
        return particleSystem;
    }

    createExplosion(position, intensity = 1.0) {
        // Main explosion
        const explosion = this.createParticleSystem('fire', position);
        explosion.emitRate = 500 * intensity;
        
        // Shockwave ring
        const ring = this.createShockwaveRing(position, intensity);
        
        // Screen shake
        this.cameraShake(0.5 * intensity);
        
        // Light flash
        this.createLightFlash(position, intensity);
        
        // Cleanup
        setTimeout(() => {
            explosion.stop();
            ring.dispose();
        }, 1000);
    }

    createShockwaveRing(position, intensity) {
        const ring = BABYLON.MeshBuilder.CreateTorus("shockwave", {
            diameter: 1,
            thickness: 0.1,
            tessellation: 32
        }, this.scene);
        
        ring.position = position.clone();
        
        const ringMaterial = new BABYLON.StandardMaterial("ringMat", this.scene);
        ringMaterial.emissiveColor = new BABYLON.Color3(1, 0.8, 0.2);
        ringMaterial.diffuseColor = new BABYLON.Color3(1, 0.6, 0.1);
        ringMaterial.alpha = 0.8;
        ring.material = ringMaterial;
        
        // Animate expansion
        const startTime = Date.now();
        this.scene.registerBeforeRender(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed > 1.0) {
                ring.dispose();
                return;
            }
            
            const scale = 1 + elapsed * 20 * intensity;
            ring.scaling.set(scale, scale, scale);
            ringMaterial.alpha = 0.8 * (1 - elapsed);
        });
        
        return ring;
    }

    cameraShake(intensity = 0.5) {
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
        const flashLight = new BABYLON.PointLight("flash", position, this.scene);
        flashLight.intensity = 10 * intensity;
        flashLight.diffuse = new BABYLON.Color3(1, 0.8, 0.6);
        
        // Quick fade out
        const startTime = Date.now();
        this.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 200) {
                flashLight.dispose();
                return;
            }
            
            flashLight.intensity = 10 * intensity * (1 - elapsed / 200);
        });
    }

    update() {
        // Update any engine-level animations or effects
        this.updateParticleSystems();
    }

    updateParticleSystems() {
        // Clean up finished particle systems
        this.particleSystems = this.particleSystems.filter(ps => {
            if (ps.isAlive() === false) {
                ps.dispose();
                return false;
            }
            return true;
        });
    }

    dispose() {
        this.engine.stopRenderLoop();
        this.scene.dispose();
        this.engine.dispose();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
          }
