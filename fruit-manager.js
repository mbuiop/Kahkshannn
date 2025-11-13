// fruit-manager.js - مدیریت میوه‌ها با مدل‌های واقعی
class FruitManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        this.fruits = new Map();
        this.fruitTypes = [
            'apple', 'banana', 'orange', 
            'grape', 'strawberry', 'watermelon',
            'pineapple', 'pear', 'cherry', 'lemon'
        ];
        
        this.fruitMeshes = new Map();
        this.activeAnimations = new Map();
        
        this.fruitPool = new Map();
        this.spawnTimer = 0;
        this.spawnInterval = 2.0;
        this.maxFruits = 40;
        
        this.init();
    }

    async init() {
        await this.createFruitPrototypes();
        this.setupFruitPool();
        console.log('Fruit Manager initialized with realistic models');
    }

    async createFruitPrototypes() {
        for (const fruitType of this.fruitTypes) {
            await this.createFruitPrototype(fruitType);
        }
    }

    async createFruitPrototype(fruitType) {
        let mesh;
        const material = new BABYLON.StandardMaterial(`fruit_proto_${fruitType}`, this.scene);
        
        switch (fruitType) {
            case 'apple':
                mesh = this.createRealisticApple();
                material.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
                material.specularColor = new BABYLON.Color3(0.3, 0.1, 0.1);
                break;
                
            case 'banana':
                mesh = this.createRealisticBanana();
                material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.2);
                material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.1);
                break;
                
            case 'orange':
                mesh = this.createRealisticOrange();
                material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
                material.specularColor = new BABYLON.Color3(0.3, 0.2, 0.1);
                break;
                
            case 'grape':
                mesh = this.createRealisticGrape();
                material.diffuseColor = new BABYLON.Color3(0.5, 0.2, 0.7);
                material.specularColor = new BABYLON.Color3(0.2, 0.1, 0.3);
                break;
                
            case 'strawberry':
                mesh = this.createRealisticStrawberry();
                material.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
                material.specularColor = new BABYLON.Color3(0.3, 0.05, 0.05);
                break;
                
            case 'watermelon':
                mesh = this.createRealisticWatermelon();
                material.diffuseColor = new BABYLON.Color3(0.1, 0.6, 0.1);
                material.specularColor = new BABYLON.Color3(0.1, 0.3, 0.1);
                break;
                
            case 'pineapple':
                mesh = this.createRealisticPineapple();
                material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.3);
                break;
                
            case 'pear':
                mesh = this.createRealisticPear();
                material.diffuseColor = new BABYLON.Color3(0.8, 0.9, 0.3);
                break;
                
            case 'cherry':
                mesh = this.createRealisticCherry();
                material.diffuseColor = new BABYLON.Color3(0.7, 0.1, 0.1);
                break;
                
            case 'lemon':
                mesh = this.createRealisticLemon();
                material.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.3);
                break;
        }

        material.specularPower = 32;
        mesh.material = material;
        mesh.setEnabled(false);
        mesh.name = `fruit_proto_${fruitType}`;
        
        this.fruitMeshes.set(fruitType, mesh);
        return mesh;
    }

    createRealisticApple() {
        // سیب واقعی
        const apple = BABYLON.MeshBuilder.CreateSphere("apple", { 
            diameter: 1.8, 
            segments: 16 
        }, this.scene);
        
        // ایجاد فرورفتگی برای سیب
        const indent = BABYLON.MeshBuilder.CreateSphere("apple_indent", { 
            diameter: 0.4 
        }, this.scene);
        indent.position.y = 0.8;
        indent.scaling.y = 0.3;
        indent.parent = apple;
        
        // ساقه
        const stem = BABYLON.MeshBuilder.CreateCylinder("stem", { 
            height: 0.3, 
            diameter: 0.08 
        }, this.scene);
        stem.position.y = 1.0;
        stem.material = new BABYLON.StandardMaterial("stem_mat", this.scene);
        stem.material.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        stem.parent = apple;
        
        return apple;
    }

    createRealisticBanana() {
        // موز واقعی - خمیده
        const banana = BABYLON.MeshBuilder.CreateCylinder("banana", {
            height: 2.2,
            diameter: 0.5,
            tessellation: 8
        }, this.scene);
        
        // ایجاد انحنا برای موز
        banana.rotation.z = Math.PI / 6;
        banana.scaling.x = 0.8;
        
        return banana;
    }

    createRealisticOrange() {
        // پرتقال با بافت
        const orange = BABYLON.MeshBuilder.CreateSphere("orange", { 
            diameter: 1.6, 
            segments: 12 
        }, this.scene);
        
        // ایجاد بافت پوست پرتقال
        const orangeMaterial = new BABYLON.StandardMaterial("orange_mat", this.scene);
        orangeMaterial.diffuseColor = new BABYLON.Color3(1, 0.4, 0);
        orangeMaterial.specularColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        
        return orange;
    }

    createRealisticGrape() {
        // خوشه انگور
        const grapeCluster = new BABYLON.Mesh("grape_cluster", this.scene);
        
        // ایجاد چندین حبه انگور
        const grapePositions = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0.4, 0.3, 0),
            new BABYLON.Vector3(-0.4, 0.3, 0),
            new BABYLON.Vector3(0.3, 0.6, 0.3),
            new BABYLON.Vector3(-0.3, 0.6, -0.3),
            new BABYLON.Vector3(0, 0.9, 0),
            new BABYLON.Vector3(0.2, 0.9, 0.2),
            new BABYLON.Vector3(-0.2, 0.9, -0.2)
        ];
        
        grapePositions.forEach((pos, index) => {
            const grape = BABYLON.MeshBuilder.CreateSphere(`grape_${index}`, { 
                diameter: 0.6 
            }, this.scene);
            grape.position = pos;
            grape.parent = grapeCluster;
        });
        
        return grapeCluster;
    }

    createRealisticStrawberry() {
        // توت فرنگی واقعی
        const strawberry = BABYLON.MeshBuilder.CreateCylinder("strawberry", {
            height: 1.8,
            diameterTop: 0.3,
            diameterBottom: 1.4,
            tessellation: 8
        }, this.scene);
        
        // اضافه کردن دانه‌ها
        for (let i = 0; i < 15; i++) {
            const seed = BABYLON.MeshBuilder.CreateSphere(`seed_${i}`, { 
                diameter: 0.08 
            }, this.scene);
            
            const angle = (i / 15) * Math.PI * 2;
            const radius = 0.5 + Math.random() * 0.2;
            const height = (Math.random() - 0.5) * 0.8;
            
            seed.position = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            const seedMaterial = new BABYLON.StandardMaterial(`seed_mat_${i}`, this.scene);
            seedMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0.9);
            seed.material = seedMaterial;
            seed.parent = strawberry;
        }
        
        return strawberry;
    }

    createRealisticWatermelon() {
        // هندوانه با خطوط
        const watermelon = BABYLON.MeshBuilder.CreateSphere("watermelon", { 
            diameter: 2.2,
            segments: 12
        }, this.scene);
        
        // ایجاد خطوط هندوانه
        for (let i = 0; i < 8; i++) {
            const stripe = BABYLON.MeshBuilder.CreateCylinder(`stripe_${i}`, {
                height: 2.4,
                diameter: 0.08
            }, this.scene);
            
            stripe.rotation.x = Math.PI / 2;
            stripe.rotation.z = (i / 8) * Math.PI;
            stripe.parent = watermelon;
            
            const stripeMaterial = new BABYLON.StandardMaterial(`stripe_mat_${i}`, this.scene);
            stripeMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.1);
            stripe.material = stripeMaterial;
        }
        
        return watermelon;
    }

    createRealisticPineapple() {
        // آناناس
        const pineapple = BABYLON.MeshBuilder.CreateCylinder("pineapple", {
            height: 2.8,
            diameter: 1.3,
            tessellation: 8
        }, this.scene);
        
        // الگوی الماسی آناناس
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 4; j++) {
                const diamond = BABYLON.MeshBuilder.CreateBox(`diamond_${i}_${j}`, {
                    height: 0.2,
                    width: 0.15,
                    depth: 0.15
                }, this.scene);
                
                const angle = (i / 12) * Math.PI * 2;
                const y = (j - 1.5) * 0.6;
                diamond.position = new BABYLON.Vector3(
                    Math.cos(angle) * 0.6,
                    y,
                    Math.sin(angle) * 0.6
                );
                diamond.parent = pineapple;
                
                const diamondMaterial = new BABYLON.StandardMaterial(`diamond_mat_${i}_${j}`, this.scene);
                diamondMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.2);
                diamond.material = diamondMaterial;
            }
        }
        
        return pineapple;
    }

    createRealisticPear() {
        // گلابی
        const pear = BABYLON.MeshBuilder.CreateSphere("pear_body", { 
            diameter: 1.6 
        }, this.scene);
        
        const pearTop = BABYLON.MeshBuilder.CreateCylinder("pear_top", {
            height: 0.9,
            diameterTop: 0.4,
            diameterBottom: 0.9
        }, this.scene);
        pearTop.position.y = 0.8;
        pearTop.parent = pear;
        
        return pear;
    }

    createRealisticCherry() {
        // گیلاس - دو عدد با ساقه
        const cherryPair = new BABYLON.Mesh("cherry_pair", this.scene);
        
        // گیلاس اول
        const cherry1 = BABYLON.MeshBuilder.CreateSphere("cherry_1", { 
            diameter: 0.9 
        }, this.scene);
        cherry1.position = new BABYLON.Vector3(0.5, 0, 0);
        cherry1.parent = cherryPair;
        
        // گیلاس دوم
        const cherry2 = BABYLON.MeshBuilder.CreateSphere("cherry_2", { 
            diameter: 0.9 
        }, this.scene);
        cherry2.position = new BABYLON.Vector3(-0.5, 0, 0);
        cherry2.parent = cherryPair;
        
        // ساقه
        const stem = BABYLON.MeshBuilder.CreateCylinder("cherry_stem", {
            height: 1.2,
            diameter: 0.04
        }, this.scene);
        stem.position.y = 0.8;
        stem.rotation.z = Math.PI / 6;
        stem.parent = cherryPair;
        
        const stemMaterial = new BABYLON.StandardMaterial("cherry_stem_mat", this.scene);
        stemMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        stem.material = stemMaterial;
        
        return cherryPair;
    }

    createRealisticLemon() {
        // لیمو - بیضی شکل
        const lemon = BABYLON.MeshBuilder.CreateSphere("lemon", { 
            diameter: 1.5,
            segments: 10
        }, this.scene);
        
        // تغییر شکل به بیضی
        lemon.scaling = new BABYLON.Vector3(1.3, 0.7, 1.1);
        
        return lemon;
    }

    setupFruitPool() {
        for (const fruitType of this.fruitTypes) {
            this.fruitPool.set(fruitType, []);
        }
    }

    update(deltaTime) {
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval && this.getTotalFruits() < this.maxFruits) {
            this.spawnRandomFruit();
            this.spawnTimer = 0;
        }
        
        this.updateAnimations(deltaTime);
    }

    spawnRandomFruit() {
        const availablePositions = this.core.gridPositions.filter(pos => !pos.occupied);
        if (availablePositions.length === 0) return null;

        const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        const fruitType = this.getRandomFruitType();
        
        return this.spawnFruit(fruitType, randomPos);
    }

    spawnFruit(fruitType, gridPosition) {
        const fruit = this.getFruitFromPool(fruitType);
        if (!fruit) return null;

        fruit.position = gridPosition.position.clone();
        fruit.setEnabled(true);
        fruit.userData = {
            type: fruitType,
            gridIndex: gridPosition.index,
            isFruit: true
        };

        // انیمیشن ظهور
        this.animateSpawn(fruit);

        gridPosition.occupied = true;
        this.fruits.set(gridPosition.index, fruit);

        return fruit;
    }

    getFruitFromPool(fruitType) {
        const pool = this.fruitPool.get(fruitType);
        
        // پیدا کردن میوه غیرفعال در پول
        for (const fruit of pool) {
            if (!fruit.isEnabled()) {
                return fruit;
            }
        }
        
        // ایجاد میوه جدید اگر پول خالی است
        const prototype = this.fruitMeshes.get(fruitType);
        if (!prototype) return null;
        
        const newFruit = prototype.clone(`fruit_${fruitType}_${Date.now()}`);
        newFruit.setEnabled(false);
        pool.push(newFruit);
        
        return newFruit;
    }

    animateSpawn(mesh) {
        const startScale = new BABYLON.Vector3(0, 0, 0);
        const endScale = new BABYLON.Vector3(1, 1, 1);
        
        mesh.scaling = startScale;
        
        const animation = new BABYLON.Animation(
            "spawnAnimation",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: startScale },
            { frame: 10, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
            { frame: 20, value: endScale }
        ];
        
        animation.setKeys(keys);
        mesh.animations = [animation];
        
        this.scene.beginAnimation(mesh, 0, 20, false);
    }

    removeFruit(gridIndex) {
        const fruit = this.fruits.get(gridIndex);
        if (!fruit) return;

        this.animateRemoval(fruit, () => {
            fruit.setEnabled(false);
            this.fruits.delete(gridIndex);
            
            const gridPos = this.core.gridPositions.find(pos => pos.index === gridIndex);
            if (gridPos) {
                gridPos.occupied = false;
            }
        });
    }

    animateRemoval(mesh, onComplete) {
        const startScale = mesh.scaling.clone();
        const endScale = new BABYLON.Vector3(0, 0, 0);
        
        const animation = new BABYLON.Animation(
            "removalAnimation",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: startScale },
            { frame: 10, value: new BABYLON.Vector3(1.3, 1.3, 1.3) },
            { frame: 20, value: endScale }
        ];
        
        animation.setKeys(keys);
        mesh.animations = [animation];
        
        this.scene.beginAnimation(mesh, 0, 20, false, 1, () => {
            if (onComplete) onComplete();
        });
    }

    updateAnimations(deltaTime) {
        this.fruits.forEach((fruit, index) => {
            this.animateFruit(fruit, deltaTime);
        });
    }

    animateFruit(fruit, deltaTime) {
        const floatSpeed = 2;
        const floatAmplitude = 0.1;
        
        const time = Date.now() * 0.001 * floatSpeed;
        const originalY = fruit.userData.originalY || fruit.position.y;
        fruit.userData.originalY = originalY;
        
        fruit.position.y = originalY + Math.sin(time) * floatAmplitude;
        
        fruit.rotation.y += deltaTime * 0.5;
    }

    getRandomFruitType() {
        return this.fruitTypes[Math.floor(Math.random() * this.fruitTypes.length)];
    }

    getTotalFruits() {
        return this.fruits.size;
    }

    getFruitAtPosition(gridIndex) {
        return this.fruits.get(gridIndex);
    }

    getAllFruits() {
        return Array.from(this.fruits.values());
    }

    clearAllFruits() {
        this.fruits.forEach((fruit, index) => {
            fruit.setEnabled(false);
        });
        this.fruits.clear();
        
        this.core.gridPositions.forEach(pos => {
            pos.occupied = false;
        });
    }

    dispose() {
        this.clearAllFruits();
        
        this.fruitPool.forEach(pool => {
            pool.forEach(fruit => fruit.dispose());
        });
        this.fruitPool.clear();
        
        this.fruitMeshes.forEach(mesh => mesh.dispose());
        this.fruitMeshes.clear();
    }
}

window.FruitManager = FruitManager;
