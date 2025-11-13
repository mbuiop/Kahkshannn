// fruit-manager.js - مدیریت میوه‌ها و سیستم اسپاون
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
        this.powerUps = new Map();
        
        this.init();
    }

    async init() {
        await this.createFruitPrototypes();
        this.setupFruitPool();
        this.setupSpawnSystem();
    }

    async createFruitPrototypes() {
        // ایجاد مدل‌های پایه برای هر نوع میوه
        for (const fruitType of this.fruitTypes) {
            await this.createFruitPrototype(fruitType);
        }
        
        // ایجاد مدل‌های پاورآپ
        await this.createPowerUpPrototypes();
    }

    async createFruitPrototype(fruitType) {
        let mesh;
        const material = new BABYLON.StandardMaterial(`fruit_proto_${fruitType}`, this.scene);
        
        switch (fruitType) {
            case 'apple':
                mesh = this.createAppleMesh();
                material.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
                material.specularColor = new BABYLON.Color3(0.3, 0.1, 0.1);
                break;
                
            case 'banana':
                mesh = this.createBananaMesh();
                material.diffuseColor = new BABYLON.Color3(1, 1, 0.3);
                material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.1);
                break;
                
            case 'orange':
                mesh = this.createOrangeMesh();
                material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
                material.specularColor = new BABYLON.Color3(0.3, 0.2, 0.1);
                break;
                
            case 'grape':
                mesh = this.createGrapeMesh();
                material.diffuseColor = new BABYLON.Color3(0.5, 0.2, 0.8);
                material.specularColor = new BABYLON.Color3(0.2, 0.1, 0.3);
                break;
                
            case 'strawberry':
                mesh = this.createStrawberryMesh();
                material.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1);
                material.specularColor = new BABYLON.Color3(0.3, 0.05, 0.05);
                break;
                
            case 'watermelon':
                mesh = this.createWatermelonMesh();
                material.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.1);
                material.specularColor = new BABYLON.Color3(0.1, 0.3, 0.1);
                break;
                
            case 'pineapple':
                mesh = this.createPineappleMesh();
                material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.2);
                material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.1);
                break;
                
            case 'pear':
                mesh = this.createPearMesh();
                material.diffuseColor = new BABYLON.Color3(0.8, 1, 0.3);
                material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.1);
                break;
                
            case 'cherry':
                mesh = this.createCherryMesh();
                material.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
                material.specularColor = new BABYLON.Color3(0.3, 0.05, 0.05);
                break;
                
            case 'lemon':
                mesh = this.createLemonMesh();
                material.diffuseColor = new BABYLON.Color3(1, 1, 0.5);
                material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.2);
                break;
        }

        mesh.material = material;
        mesh.setEnabled(false); // غیرفعال کردن پیش‌فرض
        mesh.name = `fruit_proto_${fruitType}`;
        
        this.fruitMeshes.set(fruitType, mesh);
        return mesh;
    }

    createAppleMesh() {
        // سیب - کره با فرورفتگی کوچک
        const apple = BABYLON.MeshBuilder.CreateSphere("apple", { diameter: 1.8 }, this.scene);
        
        // ایجاد فرورفتگی برای ساقه
        const stemIndent = BABYLON.MeshBuilder.CreateSphere("stem_indent", { diameter: 0.3 }, this.scene);
        stemIndent.position.y = 0.9;
        stemIndent.parent = apple;
        
        // ساقه
        const stem = BABYLON.MeshBuilder.CreateCylinder("stem", { 
            height: 0.4, 
            diameter: 0.05 
        }, this.scene);
        stem.position.y = 1.1;
        stem.parent = apple;
        
        const stemMaterial = new BABYLON.StandardMaterial("stem_mat", this.scene);
        stemMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        stem.material = stemMaterial;
        
        return apple;
    }

    createBananaMesh() {
        // موز - استوانه خمیده
        const banana = BABYLON.MeshBuilder.CreateCylinder("banana", {
            height: 2.2,
            diameter: 0.6
        }, this.scene);
        
        // ایجاد انحنا
        banana.rotation.z = Math.PI / 6;
        
        return banana;
    }

    createOrangeMesh() {
        // پرتقال - کره ساده
        return BABYLON.MeshBuilder.CreateSphere("orange", { diameter: 1.6 }, this.scene);
    }

    createGrapeMesh() {
        // انگور - خوشه از چند کره کوچک
        const grapeCluster = new BABYLON.Mesh("grape_cluster", this.scene);
        
        const grapePositions = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0.3, 0.2, 0),
            new BABYLON.Vector3(-0.3, 0.2, 0),
            new BABYLON.Vector3(0.2, 0.4, 0.2),
            new BABYLON.Vector3(-0.2, 0.4, -0.2),
            new BABYLON.Vector3(0, 0.6, 0)
        ];
        
        grapePositions.forEach((pos, index) => {
            const grape = BABYLON.MeshBuilder.CreateSphere(`grape_${index}`, { 
                diameter: 0.5 
            }, this.scene);
            grape.position = pos;
            grape.parent = grapeCluster;
        });
        
        return grapeCluster;
    }

    createStrawberryMesh() {
        // توت فرنگی - مخروط با دانه
        const strawberry = BABYLON.MeshBuilder.CreateCylinder("strawberry", {
            height: 1.5,
            diameterTop: 0.1,
            diameterBottom: 1.2
        }, this.scene);
        
        // اضافه کردن دانه‌ها
        for (let i = 0; i < 20; i++) {
            const seed = BABYLON.MeshBuilder.CreateSphere(`seed_${i}`, { 
                diameter: 0.1 
            }, this.scene);
            
            const angle = (i / 20) * Math.PI * 2;
            const radius = 0.4 + Math.random() * 0.2;
            seed.position = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                Math.random() * 0.8 - 0.4,
                Math.sin(angle) * radius
            );
            
            const seedMaterial = new BABYLON.StandardMaterial(`seed_mat_${i}`, this.scene);
            seedMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0.8);
            seed.material = seedMaterial;
            seed.parent = strawberry;
        }
        
        return strawberry;
    }

    createWatermelonMesh() {
        // هندوانه - کره با خطوط
        const watermelon = BABYLON.MeshBuilder.CreateSphere("watermelon", { 
            diameter: 2.0 
        }, this.scene);
        
        // ایجاد خطوط
        for (let i = 0; i < 6; i++) {
            const stripe = BABYLON.MeshBuilder.CreateCylinder(`stripe_${i}`, {
                height: 2.2,
                diameter: 0.05
            }, this.scene);
            
            stripe.rotation.x = Math.PI / 2;
            stripe.rotation.z = (i / 6) * Math.PI;
            stripe.parent = watermelon;
            
            const stripeMaterial = new BABYLON.StandardMaterial(`stripe_mat_${i}`, this.scene);
            stripeMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
            stripe.material = stripeMaterial;
        }
        
        return watermelon;
    }

    createPineappleMesh() {
        // آناناس - استوانه با بافت الماسی
        const pineapple = BABYLON.MeshBuilder.CreateCylinder("pineapple", {
            height: 2.5,
            diameter: 1.4
        }, this.scene);
        
        // ایجاد بافت الماسی
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 4; j++) {
                const diamond = BABYLON.MeshBuilder.CreateCylinder(`diamond_${i}_${j}`, {
                    height: 0.3,
                    diameter: 0.2
                }, this.scene);
                
                const angle = (i / 8) * Math.PI * 2;
                const y = (j - 1.5) * 0.6;
                diamond.position = new BABYLON.Vector3(
                    Math.cos(angle) * 0.6,
                    y,
                    Math.sin(angle) * 0.6
                );
                diamond.parent = pineapple;
                
                const diamondMaterial = new BABYLON.StandardMaterial(`diamond_mat_${i}_${j}`, this.scene);
                diamondMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.3);
                diamond.material = diamondMaterial;
            }
        }
        
        return pineapple;
    }

    createPearMesh() {
        // گلابی - ترکیب کره و مخروط
        const pearBody = BABYLON.MeshBuilder.CreateSphere("pear_body", { 
            diameter: 1.4 
        }, this.scene);
        
        const pearTop = BABYLON.MeshBuilder.CreateCylinder("pear_top", {
            height: 0.8,
            diameterTop: 0.3,
            diameterBottom: 0.8
        }, this.scene);
        pearTop.position.y = 0.9;
        pearTop.parent = pearBody;
        
        return pearBody;
    }

    createCherryMesh() {
        // گیلاس - دو کره کوچک با ساقه
        const cherryPair = new BABYLON.Mesh("cherry_pair", this.scene);
        
        // گیلاس اول
        const cherry1 = BABYLON.MeshBuilder.CreateSphere("cherry_1", { 
            diameter: 0.8 
        }, this.scene);
        cherry1.position = new BABYLON.Vector3(0.4, 0, 0);
        cherry1.parent = cherryPair;
        
        // گیلاس دوم
        const cherry2 = BABYLON.MeshBuilder.CreateSphere("cherry_2", { 
            diameter: 0.8 
        }, this.scene);
        cherry2.position = new BABYLON.Vector3(-0.4, 0, 0);
        cherry2.parent = cherryPair;
        
        // ساقه
        const stem = BABYLON.MeshBuilder.CreateCylinder("cherry_stem", {
            height: 1.0,
            diameter: 0.03
        }, this.scene);
        stem.position.y = 0.6;
        stem.rotation.z = Math.PI / 8;
        stem.parent = cherryPair;
        
        const stemMaterial = new BABYLON.StandardMaterial("cherry_stem_mat", this.scene);
        stemMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.2, 0.1);
        stem.material = stemMaterial;
        
        return cherryPair;
    }

    createLemonMesh() {
        // لیمو - بیضی شکل
        const lemon = BABYLON.MeshBuilder.CreateSphere("lemon", { 
            diameter: 1.4,
            segments: 8
        }, this.scene);
        
        // تغییر شکل به بیضی
        lemon.scaling = new BABYLON.Vector3(1.2, 0.8, 1.0);
        
        return lemon;
    }

    async createPowerUpPrototypes() {
        const powerUpTypes = ['multiplier', 'time', 'shuffle', 'bomb', 'magnet'];
        
        for (const powerUpType of powerUpTypes) {
            await this.createPowerUpPrototype(powerUpType);
        }
    }

    async createPowerUpPrototype(powerUpType) {
        let mesh;
        const material = new BABYLON.StandardMaterial(`powerup_${powerUpType}`, this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 1, 0.5);
        
        switch (powerUpType) {
            case 'multiplier':
                mesh = this.createMultiplierPowerUp();
                material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
                break;
            case 'time':
                mesh = this.createTimePowerUp();
                material.diffuseColor = new BABYLON.Color3(0, 1, 1);
                break;
            case 'shuffle':
                mesh = this.createShufflePowerUp();
                material.diffuseColor = new BABYLON.Color3(1, 0, 1);
                break;
            case 'bomb':
                mesh = this.createBombPowerUp();
                material.diffuseColor = new BABYLON.Color3(1, 0, 0);
                break;
            case 'magnet':
                mesh = this.createMagnetPowerUp();
                material.diffuseColor = new BABYLON.Color3(0, 1, 0);
                break;
        }
        
        mesh.material = material;
        mesh.setEnabled(false);
        mesh.name = `powerup_proto_${powerUpType}`;
        
        this.powerUps.set(powerUpType, mesh);
        return mesh;
    }

    createMultiplierPowerUp() {
        // ×2 - مکعب درخشان
        const multiplier = BABYLON.MeshBuilder.CreateBox("multiplier", { 
            size: 1.0 
        }, this.scene);
        
        // اضافه کردن علامت ×
        const xSign = BABYLON.MeshBuilder.CreateBox("x_sign", { 
            size: 0.1 
        }, this.scene);
        xSign.scaling = new BABYLON.Vector3(3, 0.1, 0.1);
        xSign.rotation.y = Math.PI / 4;
        xSign.parent = multiplier;
        
        const xSign2 = BABYLON.MeshBuilder.CreateBox("x_sign2", { 
            size: 0.1 
        }, this.scene);
        xSign2.scaling = new BABYLON.Vector3(3, 0.1, 0.1);
        xSign2.rotation.y = -Math.PI / 4;
        xSign2.parent = multiplier;
        
        return multiplier;
    }

    createTimePowerUp() {
        // ساعت - دایره با عقربه
        const clock = BABYLON.MeshBuilder.CreateCylinder("clock", {
            diameter: 1.2,
            height: 0.2
        }, this.scene);
        
        // عقربه‌ها
        const hourHand = BABYLON.MeshBuilder.CreateBox("hour_hand", {
            height: 0.4,
            width: 0.05,
            depth: 0.05
        }, this.scene);
        hourHand.position.y = 0.2;
        hourHand.parent = clock;
        
        const minuteHand = BABYLON.MeshBuilder.CreateBox("minute_hand", {
            height: 0.6,
            width: 0.03,
            depth: 0.03
        }, this.scene);
        minuteHand.position.y = 0.3;
        minuteHand.rotation.z = Math.PI / 2;
        minuteHand.parent = clock;
        
        return clock;
    }

    createShufflePowerUp() {
        // فلش‌های چرخان
        const shuffle = new BABYLON.Mesh("shuffle", this.scene);
        
        for (let i = 0; i < 4; i++) {
            const arrow = BABYLON.MeshBuilder.CreateCylinder(`arrow_${i}`, {
                diameterTop: 0,
                diameterBottom: 0.3,
                height: 0.6
            }, this.scene);
            
            arrow.rotation.x = Math.PI;
            arrow.position = new BABYLON.Vector3(
                Math.cos(i * Math.PI / 2) * 0.4,
                0,
                Math.sin(i * Math.PI / 2) * 0.4
            );
            arrow.parent = shuffle;
        }
        
        return shuffle;
    }

    createBombPowerUp() {
        // بمب - کره با فتیله
        const bomb = BABYLON.MeshBuilder.CreateSphere("bomb", { 
            diameter: 1.2 
        }, this.scene);
        
        // فتیله
        const fuse = BABYLON.MeshBuilder.CreateCylinder("fuse", {
            height: 0.4,
            diameter: 0.05
        }, this.scene);
        fuse.position.y = 0.8;
        fuse.parent = bomb;
        
        const fuseMaterial = new BABYLON.StandardMaterial("fuse_mat", this.scene);
        fuseMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
        fuse.material = fuseMaterial;
        
        return bomb;
    }

    createMagnetPowerUp() {
        // آهنربا - دو نیمکره
        const magnet = new BABYLON.Mesh("magnet", this.scene);
        
        const northPole = BABYLON.MeshBuilder.CreateSphere("north_pole", { 
            diameter: 0.8,
            segments: 8
        }, this.scene);
        northPole.position.y = 0.3;
        northPole.parent = magnet;
        
        const southPole = BABYLON.MeshBuilder.CreateSphere("south_pole", { 
            diameter: 0.8,
            segments: 8
        }, this.scene);
        southPole.position.y = -0.3;
        southPole.parent = magnet;
        
        const connector = BABYLON.MeshBuilder.CreateCylinder("connector", {
            height: 0.4,
            diameter: 0.2
        }, this.scene);
        connector.parent = magnet;
        
        return magnet;
    }

    setupFruitPool() {
        // ایجاد پول برای هر نوع میوه
        this.fruitPool = new Map();
        
        for (const fruitType of this.fruitTypes) {
            this.fruitPool.set(fruitType, []);
        }
        
        // پول پاورآپ‌ها
        this.powerUpPool = new Map();
        for (const powerUpType of ['multiplier', 'time', 'shuffle', 'bomb', 'magnet']) {
            this.powerUpPool.set(powerUpType, []);
        }
    }

    setupSpawnSystem() {
        this.spawnTimer = 0;
        this.spawnInterval = 2.0; // ثانیه
        this.maxFruits = 40; // 8x5 شبکه
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
        
        // شانس 10% برای اسپاون پاورآپ
        if (Math.random() < 0.1) {
            return this.spawnPowerUp(randomPos);
        } else {
            return this.spawnFruit(fruitType, randomPos);
        }
    }

    spawnFruit(fruitType, gridPosition) {
        const fruit = this.getFruitFromPool(fruitType);
        if (!fruit) return null;

        fruit.position = gridPosition.position.clone();
        fruit.setEnabled(true);
        fruit.userData = {
            type: fruitType,
            gridIndex: gridPosition.index,
            isFruit: true,
            isPowerUp: false
        };

        // انیمیشن ظهور
        this.animateSpawn(fruit);

        gridPosition.occupied = true;
        this.fruits.set(gridPosition.index, fruit);

        return fruit;
    }

    spawnPowerUp(gridPosition) {
        const powerUpTypes = Array.from(this.powerUpPool.keys());
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        const powerUp = this.getPowerUpFromPool(randomPowerUp);
        if (!powerUp) return null;

        powerUp.position = gridPosition.position.clone();
        powerUp.setEnabled(true);
        powerUp.userData = {
            type: randomPowerUp,
            gridIndex: gridPosition.index,
            isFruit: false,
            isPowerUp: true
        };

        // انیمیشن ظهور ویژه برای پاورآپ
        this.animatePowerUpSpawn(powerUp);

        gridPosition.occupied = true;
        this.fruits.set(gridPosition.index, powerUp);

        return powerUp;
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

    getPowerUpFromPool(powerUpType) {
        const pool = this.powerUpPool.get(powerUpType);
        
        for (const powerUp of pool) {
            if (!powerUp.isEnabled()) {
                return powerUp;
            }
        }
        
        const prototype = this.powerUps.get(powerUpType);
        if (!prototype) return null;
        
        const newPowerUp = prototype.clone(`powerup_${powerUpType}_${Date.now()}`);
        newPowerUp.setEnabled(false);
        pool.push(newPowerUp);
        
        return newPowerUp;
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

    animatePowerUpSpawn(mesh) {
        const startScale = new BABYLON.Vector3(0, 0, 0);
        const endScale = new BABYLON.Vector3(1, 1, 1);
        
        mesh.scaling = startScale;
        
        const scaleAnimation = new BABYLON.Animation(
            "powerUpSpawnScale",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const scaleKeys = [
            { frame: 0, value: startScale },
            { frame: 15, value: new BABYLON.Vector3(1.5, 1.5, 1.5) },
            { frame: 30, value: endScale }
        ];
        scaleAnimation.setKeys(scaleKeys);
        
        const rotationAnimation = new BABYLON.Animation(
            "powerUpSpawnRotation",
            "rotation.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const rotationKeys = [
            { frame: 0, value: 0 },
            { frame: 30, value: Math.PI * 2 }
        ];
        rotationAnimation.setKeys(rotationKeys);
        
        mesh.animations = [scaleAnimation, rotationAnimation];
        this.scene.beginAnimation(mesh, 0, 30, false);
    }

    removeFruit(gridIndex) {
        const fruit = this.fruits.get(gridIndex);
        if (!fruit) return;

        // انیمیشن حذف
        this.animateRemoval(fruit, () => {
            fruit.setEnabled(false);
            this.fruits.delete(gridIndex);
            
            // آزاد کردن موقعیت شبکه
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
        // به‌روزرسانی انیمیشن‌های فعال
        this.fruits.forEach((fruit, index) => {
            if (fruit.userData.isPowerUp) {
                this.animatePowerUp(fruit, deltaTime);
            } else {
                this.animateFruit(fruit, deltaTime);
            }
        });
    }

    animateFruit(fruit, deltaTime) {
        // انیمیشن شناور ساده
        const floatSpeed = 2;
        const floatAmplitude = 0.1;
        
        const time = Date.now() * 0.001 * floatSpeed;
        const originalY = fruit.userData.originalY || fruit.position.y;
        fruit.userData.originalY = originalY;
        
        fruit.position.y = originalY + Math.sin(time) * floatAmplitude;
        
        // چرخش آرام
        fruit.rotation.y += deltaTime * 0.5;
    }

    animatePowerUp(powerUp, deltaTime) {
        // انیمیشن ویژه پاورآپ‌ها
        const hoverSpeed = 3;
        const hoverAmplitude = 0.2;
        const rotationSpeed = 1;
        
        const time = Date.now() * 0.001 * hoverSpeed;
        const originalY = powerUp.userData.originalY || powerUp.position.y;
        powerUp.userData.originalY = originalY;
        
        powerUp.position.y = originalY + Math.sin(time) * hoverAmplitude;
        powerUp.rotation.y += deltaTime * rotationSpeed;
        
        // پالس نوری
        const pulse = Math.sin(time * 2) * 0.3 + 0.7;
        if (powerUp.material && powerUp.material.emissiveColor) {
            powerUp.material.emissiveColor.scaleToRef(pulse, powerUp.material.emissiveColor);
        }
    }

    // متدهای کاربردی
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
        
        // آزاد کردن تمام موقعیت‌های شبکه
        this.core.gridPositions.forEach(pos => {
            pos.occupied = false;
        });
    }

    // متدهای پاورآپ
    activatePowerUp(powerUpType, position) {
        switch (powerUpType) {
            case 'multiplier':
                this.activateMultiplierPowerUp();
                break;
            case 'time':
                this.activateTimePowerUp();
                break;
            case 'shuffle':
                this.activateShufflePowerUp();
                break;
            case 'bomb':
                this.activateBombPowerUp(position);
                break;
            case 'magnet':
                this.activateMagnetPowerUp();
                break;
        }
    }

    activateMultiplierPowerUp() {
        // فعال کردن ضریب امتیاز
        if (window.gameManager) {
            window.gameManager.setScoreMultiplier(2, 10); // ضریب 2 برای 10 ثانیه
        }
        
        // افکت بصری
        this.createMultiplierEffect();
    }

    activateTimePowerUp() {
        // اضافه کردن زمان
        if (window.gameManager) {
            window.gameManager.addTime(15); // 15 ثانیه زمان اضافه
        }
        
        // افکت بصری
        this.createTimeEffect();
    }

    activateShufflePowerUp() {
        // به هم زدن میوه‌ها
        this.shuffleFruits();
        
        // افکت بصری
        this.createShuffleEffect();
    }

    activateBombPowerUp(position) {
        // حذف میوه‌های اطراف
        this.explodeNearbyFruits(position);
        
        // افکت بصری
        this.createExplosionEffect(position);
    }

    activateMagnetPowerUp() {
        // جذب میوه‌های مشابه
        this.activateMagnet();
        
        // افکت بصری
        this.createMagnetEffect();
    }

    shuffleFruits() {
        const currentFruits = this.getAllFruits();
        const availablePositions = this.core.gridPositions.filter(pos => !pos.occupied);
        
        // جمع‌آوری موقعیت‌های فعلی
        const currentPositions = new Map();
        currentFruits.forEach(fruit => {
            currentPositions.set(fruit.userData.gridIndex, fruit);
        });
        
        // به هم زدن موقعیت‌ها
        const shuffledPositions = [...availablePositions].sort(() => Math.random() - 0.5);
        
        let positionIndex = 0;
        currentPositions.forEach((fruit, oldIndex) => {
            if (positionIndex < shuffledPositions.length) {
                const newPos = shuffledPositions[positionIndex];
                
                // انیمیشن حرکت به موقعیت جدید
                this.animateFruitMove(fruit, newPos.position);
                
                // به‌روزرسانی موقعیت شبکه
                const oldGridPos = this.core.gridPositions.find(pos => pos.index === oldIndex);
                if (oldGridPos) oldGridPos.occupied = false;
                
                newPos.occupied = true;
                fruit.userData.gridIndex = newPos.index;
                this.fruits.delete(oldIndex);
                this.fruits.set(newPos.index, fruit);
                
                positionIndex++;
            }
        });
    }

    animateFruitMove(fruit, targetPosition) {
        const startPosition = fruit.position.clone();
        const duration = 1000; // میلی‌ثانیه
        
        const animation = new BABYLON.Animation(
            "moveAnimation",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: startPosition },
            { frame: 30, value: targetPosition }
        ];
        
        animation.setKeys(keys);
        fruit.animations = [animation];
        
        this.scene.beginAnimation(fruit, 0, 30, false);
    }

    explodeNearbyFruits(centerPosition, radius = 3) {
        const fruitsToRemove = [];
        
        this.fruits.forEach((fruit, index) => {
            const distance = BABYLON.Vector3.Distance(fruit.position, centerPosition);
            if (distance <= radius && fruit.userData.isFruit) {
                fruitsToRemove.push(index);
            }
        });
        
        fruitsToRemove.forEach(index => {
            this.removeFruit(index);
        });
        
        return fruitsToRemove.length;
    }

    activateMagnet() {
        // پیدا کردن جفت‌های میوه‌های مشابه
        const fruitGroups = this.groupSimilarFruits();
        
        // هایلایت کردن میوه‌های مشابه
        fruitGroups.forEach(group => {
            if (group.length >= 2) {
                group.forEach(fruit => {
                    this.highlightFruit(fruit, true);
                });
            }
        });
        
        // غیرفعال کردن هایلایت بعد از 5 ثانیه
        setTimeout(() => {
            fruitGroups.forEach(group => {
                group.forEach(fruit => {
                    this.highlightFruit(fruit, false);
                });
            });
        }, 5000);
    }

    groupSimilarFruits() {
        const groups = new Map();
        
        this.fruits.forEach((fruit, index) => {
            if (!fruit.userData.isFruit) return;
            
            const fruitType = fruit.userData.type;
            if (!groups.has(fruitType)) {
                groups.set(fruitType, []);
            }
            groups.get(fruitType).push(fruit);
        });
        
        return Array.from(groups.values());
    }

    highlightFruit(fruit, highlight) {
        if (highlight) {
            if (!fruit.outline) {
                fruit.outline = fruit.clone(`outline_${fruit.name}`);
                fruit.outline.scaling.scaleInPlace(1.2);
                fruit.outline.material = fruit.material.clone(`outline_mat_${fruit.name}`);
                fruit.outline.material.alpha = 0.3;
                fruit.outline.parent = fruit;
            }
            fruit.outline.setEnabled(true);
        } else if (fruit.outline) {
            fruit.outline.setEnabled(false);
        }
    }

    // متدهای افکت‌های بصری
    createMultiplierEffect() {
        // ایجاد افکت ×2 در سراسر صفحه
        console.log('Multiplier effect activated');
    }

    createTimeEffect() {
        // ایجاد افکت ساعت
        console.log('Time effect activated');
    }

    createShuffleEffect() {
        // ایجاد افکت به هم زدن
        console.log('Shuffle effect activated');
    }

    createExplosionEffect(position) {
        // ایجاد افکت انفجار
        if (window.particleManager) {
            window.particleManager.createExplosion(position, new BABYLON.Color3(1, 0, 0));
        }
    }

    createMagnetEffect() {
        // ایجاد افکت آهنربا
        console.log('Magnet effect activated');
    }

    // متدهای تمیزکاری
    dispose() {
        this.clearAllFruits();
        
        // پاک کردن پول‌ها
        this.fruitPool.forEach(pool => {
            pool.forEach(fruit => fruit.dispose());
        });
        this.fruitPool.clear();
        
        this.powerUpPool.forEach(pool => {
            pool.forEach(powerUp => powerUp.dispose());
        });
        this.powerUpPool.clear();
        
        // پاک کردن پروتوتایپ‌ها
        this.fruitMeshes.forEach(mesh => mesh.dispose());
        this.fruitMeshes.clear();
        
        this.powerUps.forEach(mesh => mesh.dispose());
        this.powerUps.clear();
    }
}

window.FruitManager = FruitManager;