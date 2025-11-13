// scene-manager.js - مدیریت صحنه‌ها و محیط بازی
class SceneManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        this.currentScene = 'main';
        
        this.materials = new Map();
        this.textures = new Map();
        this.meshes = new Map();
        
        this.init();
    }

    async init() {
        await this.loadAssets();
        this.createMainScene();
        this.setupPostProcessing();
    }

    async loadAssets() {
        // بارگذاری تکسچرها
        await this.loadTextures();
        
        // بارگذاری متریال‌ها
        await this.createMaterials();
        
        // بارگذاری مدل‌ها
        await this.loadModels();
    }

    async loadTextures() {
        const textureList = [
            { name: 'wood', url: 'assets/textures/wood.jpg' },
            { name: 'metal', url: 'assets/textures/metal.jpg' },
            { name: 'glass', url: 'assets/textures/glass.png' },
            { name: 'particle', url: 'assets/textures/particle.png' }
        ];

        for (const textureInfo of textureList) {
            try {
                const texture = new BABYLON.Texture(textureInfo.url, this.scene);
                this.textures.set(textureInfo.name, texture);
            } catch (error) {
                console.warn(`Failed to load texture: ${textureInfo.name}`, error);
                // استفاده از تکسچرهای پیش‌فرض
                this.createFallbackTexture(textureInfo.name);
            }
        }
    }

    createFallbackTexture(name) {
        let color;
        switch (name) {
            case 'wood':
                color = new BABYLON.Color3(0.65, 0.5, 0.2);
                break;
            case 'metal':
                color = new BABYLON.Color3(0.7, 0.7, 0.8);
                break;
            case 'glass':
                color = new BABYLON.Color3(0.9, 0.9, 1.0);
                break;
            default:
                color = new BABYLON.Color3(1, 1, 1);
        }

        const material = new BABYLON.StandardMaterial(`${name}_fallback`, this.scene);
        material.diffuseColor = color;
        this.materials.set(name, material);
    }

    async createMaterials() {
        // متریال میوه‌ها
        this.createFruitMaterials();
        
        // متریال محیط
        this.createEnvironmentMaterials();
        
        // متریال ویژه
        this.createSpecialMaterials();
    }

    createFruitMaterials() {
        const fruits = {
            apple: new BABYLON.Color3(1, 0, 0),
            banana: new BABYLON.Color3(1, 1, 0),
            orange: new BABYLON.Color3(1, 0.5, 0),
            grape: new BABYLON.Color3(0.5, 0, 0.5),
            strawberry: new BABYLON.Color3(1, 0.2, 0.2),
            watermelon: new BABYLON.Color3(0, 0.8, 0)
        };

        Object.entries(fruits).forEach(([fruit, color]) => {
            const material = new BABYLON.StandardMaterial(`fruit_${fruit}`, this.scene);
            material.diffuseColor = color;
            material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            material.emissiveColor = color.scale(0.1);
            material.alpha = 1.0;
            
            this.materials.set(`fruit_${fruit}`, material);
        });
    }

    createEnvironmentMaterials() {
        // متریال زمین
        const groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        groundMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.1);
        this.materials.set("ground", groundMaterial);

        // متریال آسمان
        const skyMaterial = new BABYLON.StandardMaterial("sky", this.scene);
        skyMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyMaterial.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.05);
        this.materials.set("sky", skyMaterial);
    }

    createSpecialMaterials() {
        // متریال هایلایت
        const highlightMaterial = new BABYLON.StandardMaterial("highlight", this.scene);
        highlightMaterial.diffuseColor = new BABYLON.Color3(1, 0.84, 0);
        highlightMaterial.emissiveColor = new BABYLON.Color3(1, 0.84, 0);
        highlightMaterial.alpha = 0.3;
        this.materials.set("highlight", highlightMaterial);

        // متریال شیشه‌ای
        const glassMaterial = new BABYLON.StandardMaterial("glass", this.scene);
        glassMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 1.0);
        glassMaterial.alpha = 0.3;
        glassMaterial.specularPower = 128;
        this.materials.set("glass", glassMaterial);
    }

    async loadModels() {
        // در این نسخه از مدل‌های ساده استفاده می‌کنیم
        console.log('Models loaded successfully');
    }

    createMainScene() {
        // ایجاد شبکه بازی
        this.createGameGrid();
        
        // ایجاد عناصر محیطی
        this.createEnvironmentElements();
        
        // ایجاد افکت‌های ویژه
        this.createSpecialEffects();
    }

    createGameGrid() {
        const gridSize = 8;
        const cellSize = 2.5;
        
        // ایجاد خطوط شبکه
        this.createGridLines(gridSize, cellSize);
        
        // ایجاد پایه‌های شبکه
        this.createGridPillars(gridSize, cellSize);
    }

    createGridLines(gridSize, cellSize) {
        const gridLines = [];
        const halfSize = (gridSize * cellSize) / 2;

        // خطوط افقی
        for (let i = 0; i <= gridSize; i++) {
            const y = i * cellSize - halfSize;
            const points = [
                new BABYLON.Vector3(-halfSize, 0, y),
                new BABYLON.Vector3(halfSize, 0, y)
            ];
            
            const line = BABYLON.MeshBuilder.CreateLines(`grid_h_${i}`, { points: points }, this.scene);
            line.color = new BABYLON.Color3(1, 1, 1);
            line.alpha = 0.1;
            gridLines.push(line);
        }

        // خطوط عمودی
        for (let i = 0; i <= gridSize; i++) {
            const x = i * cellSize - halfSize;
            const points = [
                new BABYLON.Vector3(x, 0, -halfSize),
                new BABYLON.Vector3(x, 0, halfSize)
            ];
            
            const line = BABYLON.MeshBuilder.CreateLines(`grid_v_${i}`, { points: points }, this.scene);
            line.color = new BABYLON.Color3(1, 1, 1);
            line.alpha = 0.1;
            gridLines.push(line);
        }

        this.meshes.set('gridLines', gridLines);
    }

    createGridPillars(gridSize, cellSize) {
        const pillars = [];
        const halfSize = (gridSize * cellSize) / 2;

        for (let row = 0; row <= gridSize; row++) {
            for (let col = 0; col <= gridSize; col++) {
                const x = col * cellSize - halfSize;
                const z = row * cellSize - halfSize;
                
                const pillar = BABYLON.MeshBuilder.CreateCylinder(
                    `pillar_${row}_${col}`,
                    { height: 2, diameter: 0.1 },
                    this.scene
                );
                
                pillar.position = new BABYLON.Vector3(x, 1, z);
                
                const material = this.materials.get('glass') || new BABYLON.StandardMaterial(`pillar_mat_${row}_${col}`, this.scene);
                pillar.material = material;
                
                pillars.push(pillar);
            }
        }

        this.meshes.set('pillars', pillars);
    }

    createEnvironmentElements() {
        // ایجاد درختان
        this.createTrees();
        
        // ایجاد سنگ‌ها
        this.createRocks();
        
        // ایجاد آب
        this.createWater();
    }

    createTrees() {
        const trees = [];
        const treeCount = 8;
        const radius = 20;

        for (let i = 0; i < treeCount; i++) {
            const angle = (i / treeCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const tree = this.createTree(x, z);
            trees.push(tree);
        }

        this.meshes.set('trees', trees);
    }

    createTree(x, z) {
        // تنه درخت
        const trunk = BABYLON.MeshBuilder.CreateCylinder(
            `tree_trunk_${x}_${z}`,
            { height: 3, diameter: 0.3 },
            this.scene
        );
        trunk.position = new BABYLON.Vector3(x, 1.5, z);
        
        const trunkMaterial = new BABYLON.StandardMaterial(`tree_trunk_mat_${x}_${z}`, this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        trunk.material = trunkMaterial;

        // برگ‌ها
        const leaves = BABYLON.MeshBuilder.CreateSphere(
            `tree_leaves_${x}_${z}`,
            { diameter: 2 },
            this.scene
        );
        leaves.position = new BABYLON.Vector3(x, 3.5, z);
        
        const leavesMaterial = new BABYLON.StandardMaterial(`tree_leaves_mat_${x}_${z}`, this.scene);
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
        leaves.material = leavesMaterial;

        return { trunk, leaves };
    }

    createRocks() {
        const rocks = [];
        const rockCount = 12;
        const radius = 15;

        for (let i = 0; i < rockCount; i++) {
            const angle = (i / rockCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const variation = Math.random() * 0.5 + 0.5;
            
            const rock = BABYLON.MeshBuilder.CreateSphere(
                `rock_${i}`,
                { diameter: variation },
                this.scene
            );
            
            rock.position = new BABYLON.Vector3(x, 0.5, z);
            
            const rockMaterial = new BABYLON.StandardMaterial(`rock_mat_${i}`, this.scene);
            rockMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            rock.material = rockMaterial;
            
            rocks.push(rock);
        }

        this.meshes.set('rocks', rocks);
    }

    createWater() {
        const water = BABYLON.MeshBuilder.CreateGround(
            "water",
            { width: 100, height: 100 },
            this.scene
        );
        
        water.position.y = -0.5;
        
        const waterMaterial = new BABYLON.StandardMaterial("water", this.scene);
        waterMaterial.diffuseColor = new BABYLON.Color3(0, 0.2, 0.4);
        waterMaterial.alpha = 0.3;
        water.material = waterMaterial;

        this.meshes.set('water', water);
    }

    createSpecialEffects() {
        // ایجاد نورهای نقطه‌ای
        this.createPointLights();
        
        // ایجاد ذرات معلق
        this.createFloatingParticles();
        
        // ایجاد افکت‌های محیطی
        this.createEnvironmentEffects();
    }

    createPointLights() {
        const lights = [];
        const lightCount = 4;
        const radius = 12;

        for (let i = 0; i < lightCount; i++) {
            const angle = (i / lightCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const light = new BABYLON.PointLight(
                `pointLight_${i}`,
                new BABYLON.Vector3(x, 5, z),
                this.scene
            );
            
            light.diffuse = new BABYLON.Color3(
                Math.random() * 0.3 + 0.7,
                Math.random() * 0.3 + 0.7,
                Math.random() * 0.3 + 0.7
            );
            
            light.intensity = 0.4;
            lights.push(light);
        }

        this.meshes.set('pointLights', lights);
    }

    createFloatingParticles() {
        const particles = [];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = BABYLON.MeshBuilder.CreateSphere(
                `particle_${i}`,
                { diameter: 0.1 },
                this.scene
            );
            
            // موقعیت تصادفی
            particle.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 30,
                Math.random() * 10 + 2,
                (Math.random() - 0.5) * 30
            );
            
            const particleMaterial = new BABYLON.StandardMaterial(`particle_mat_${i}`, this.scene);
            particleMaterial.diffuseColor = new BABYLON.Color3(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            );
            particleMaterial.emissiveColor = particleMaterial.diffuseColor;
            particle.material = particleMaterial;
            
            // انیمیشن شناور
            this.addParticleAnimation(particle);
            particles.push(particle);
        }

        this.meshes.set('floatingParticles', particles);
    }

    addParticleAnimation(particle) {
        const startPos = particle.position.clone();
        const amplitude = 2;
        const speed = Math.random() * 0.5 + 0.5;

        this.scene.registerBeforeRender(() => {
            const time = Date.now() * 0.001 * speed;
            particle.position.x = startPos.x + Math.sin(time) * amplitude;
            particle.position.z = startPos.z + Math.cos(time * 0.7) * amplitude;
            particle.position.y = startPos.y + Math.sin(time * 1.3) * amplitude * 0.5;
        });
    }

    createEnvironmentEffects() {
        // ایجاد مه
        this.createFog();
        
        // ایجاد باد
        this.createWindEffect();
    }

    createFog() {
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    }

    createWindEffect() {
        // ایجاد افکت باد با حرکت دادن درختان و ذرات
        this.scene.registerBeforeRender(() => {
            const time = Date.now() * 0.001;
            const windStrength = Math.sin(time * 0.5) * 0.1;
            
            // حرکت درختان
            const trees = this.meshes.get('trees') || [];
            trees.forEach(tree => {
                if (tree.leaves) {
                    tree.leaves.rotation.x = windStrength * 0.1;
                    tree.leaves.rotation.z = windStrength * 0.05;
                }
            });
        });
    }

    setupPostProcessing() {
        // ایجاد افکت bloom برای درخشندگی
        this.createBloomEffect();
        
        // ایجاد افکت color grading
        this.createColorGrading();
    }

    createBloomEffect() {
        try {
            const bloomEffect = new BABYLON.BloomEffect("bloom", 1.0, 1.0);
            bloomEffect.threshold = 0.8;
            
            this.bloomPostProcess = new BABYLON.PostProcessRenderEffect(
                this.core.engine,
                "bloom",
                bloomEffect
            );
            
            this.scene.postProcessRenderEffectsManager.attachCamerasToRenderEffect(
                "bloom",
                [this.core.camera]
            );
        } catch (error) {
            console.warn('Bloom effect not available:', error);
        }
    }

    createColorGrading() {
        // تنظیم رنگ کلی صحنه
        if (this.scene.imageProcessingConfiguration) {
            this.scene.imageProcessingConfiguration.contrast = 1.2;
            this.scene.imageProcessingConfiguration.exposure = 1.1;
        }
    }

    // متدهای تغییر صحنه
    switchToScene(sceneName) {
        this.currentScene = sceneName;
        
        switch (sceneName) {
            case 'main':
                this.showMainScene();
                break;
            case 'menu':
                this.showMenuScene();
                break;
            case 'gameOver':
                this.showGameOverScene();
                break;
        }
    }

    showMainScene() {
        // نمایش تمام عناصر صحنه اصلی
        this.setMeshVisibility('gridLines', true);
        this.setMeshVisibility('pillars', true);
        this.setMeshVisibility('trees', true);
        this.setMeshVisibility('rocks', true);
        this.setMeshVisibility('floatingParticles', true);
    }

    showMenuScene() {
        // مخفی کردن عناصر بازی
        this.setMeshVisibility('gridLines', false);
        this.setMeshVisibility('pillars', false);
    }

    showGameOverScene() {
        // تغییر نورپردازی برای صحنه پایان بازی
        this.adjustLightingForGameOver();
    }

    setMeshVisibility(meshGroup, visible) {
        const meshes = this.meshes.get(meshGroup);
        if (meshes) {
            meshes.forEach(mesh => {
                if (mesh.setEnabled) {
                    mesh.setEnabled(visible);
                }
            });
        }
    }

    adjustLightingForGameOver() {
        // کاهش نور محیطی
        const ambientLight = this.scene.getLightByName("ambientLight");
        if (ambientLight) {
            ambientLight.intensity = 0.3;
        }

        // تغییر رنگ نور اصلی
        const mainLight = this.scene.getLightByName("mainLight");
        if (mainLight) {
            mainLight.diffuse = new BABYLON.Color3(0.8, 0.2, 0.2);
        }
    }

    // متدهای مدیریت منابع
    getMaterial(name) {
        return this.materials.get(name);
    }

    getTexture(name) {
        return this.textures.get(name);
    }

    createParticleSystem(type, position) {
        try {
            const particleSystem = new BABYLON.ParticleSystem(`particles_${type}`, 2000, this.scene);
            
            switch (type) {
                case 'explosion':
                    this.setupExplosionParticles(particleSystem);
                    break;
                case 'sparkle':
                    this.setupSparkleParticles(particleSystem);
                    break;
                case 'smoke':
                    this.setupSmokeParticles(particleSystem);
                    break;
            }
            
            particleSystem.emitter = position;
            particleSystem.start();
            
            return particleSystem;
        } catch (error) {
            console.warn('Particle system creation failed:', error);
            return null;
        }
    }

    setupExplosionParticles(particleSystem) {
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.0;
        particleSystem.emitRate = 1000;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;
    }

    setupSparkleParticles(particleSystem) {
        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.15;
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.5;
        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        particleSystem.minEmitPower = 0.5;
        particleSystem.maxEmitPower = 1.5;
    }

    setupSmokeParticles(particleSystem) {
        particleSystem.minSize = 0.2;
        particleSystem.maxSize = 0.5;
        particleSystem.minLifeTime = 1.0;
        particleSystem.maxLifeTime = 2.0;
        particleSystem.emitRate = 50;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.3;
    }

    // متدهای تمیزکاری
    dispose() {
        // پاک کردن متریال‌ها
        this.materials.forEach(material => {
            material.dispose();
        });
        
        // پاک کردن تکسچرها
        this.textures.forEach(texture => {
            texture.dispose();
        });
        
        // پاک کردن مِش‌ها
        this.meshes.forEach(meshGroup => {
            meshGroup.forEach(mesh => {
                if (mesh.dispose) {
                    mesh.dispose();
                }
            });
        });
        
        this.materials.clear();
        this.textures.clear();
        this.meshes.clear();
    }
}

window.SceneManager = SceneManager;
