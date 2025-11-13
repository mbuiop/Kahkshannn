// fruit-manager.js - مدیریت میوه‌ها و سیستم اسپاون
class FruitManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        this.fruits = new Map();
        this.fruitTypes = [
            'apple', 'banana', 'orange', 
            'grape', 'strawberry', 'watermelon'
        ];
        
        this.fruitMeshes = new Map();
        this.activeAnimations = new Map();
        this.powerUps = new Map();
        
        this.fruitPool = new Map();
        this.powerUpPool = new Map();
        
        this.spawnTimer = 0;
        this.spawnInterval = 2.0;
        this.maxFruits = 40;
        
        this.init();
    }

    async init() {
        await this.createFruitPrototypes();
        this.setupFruitPool();
        console.log('Fruit Manager initialized successfully');
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
                break;
            case 'banana':
                mesh = this.createBananaMesh();
                material.diffuseColor = new BABYLON.Color3(1, 1, 0.3);
                break;
            case 'orange':
                mesh = this.createOrangeMesh();
                material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
                break;
            case 'grape':
                mesh = this.createGrapeMesh();
                material.diffuseColor = new BABYLON.Color3(0.5, 0.2, 0.8);
                break;
            case 'strawberry':
                mesh = this.createStrawberryMesh();
                material.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1);
                break;
            case 'watermelon':
                mesh = this.createWatermelonMesh();
                material.diffuseColor = new BABYLON.Color3(0.1, 0.8, 0.1);
                break;
        }

        mesh.material = material;
        mesh.setEnabled(false);
        mesh.name = `fruit_proto_${fruitType}`;
        
        this.fruitMeshes.set(fruitType, mesh);
        return mesh;
    }

    createAppleMesh() {
        const apple = BABYLON.MeshBuilder.CreateSphere("apple", { diameter: 1.8 }, this.scene);
        return apple;
    }

    createBananaMesh() {
        const banana = BABYLON.MeshBuilder.CreateCylinder("banana", {
            height: 2.2,
            diameter: 0.6
        }, this.scene);
        banana.rotation.z = Math.PI / 6;
        return banana;
    }

    createOrangeMesh() {
        return BABYLON.MeshBuilder.CreateSphere("orange", { diameter: 1.6 }, this.scene);
    }

    createGrapeMesh() {
        const grapeCluster = new BABYLON.Mesh("grape_cluster", this.scene);
        
        const grapePositions = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0.3, 0.2, 0),
            new BABYLON.Vector3(-0.3, 0.2, 0),
            new BABYLON.Vector3(0.2, 0.4, 0.2),
            new BABYLON.Vector3(-0.2, 0.4, -0.2)
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
        const strawberry = BABYLON.MeshBuilder.CreateCylinder("strawberry", {
            height: 1.5,
            diameterTop: 0.1,
            diameterBottom: 1.2
        }, this.scene);
        return strawberry;
    }

    createWatermelonMesh() {
        const watermelon = BABYLON.MeshBuilder.CreateSphere("watermelon", { 
            diameter: 2.0 
        }, this.scene);
        return watermelon;
    }

    async createPowerUpPrototypes() {
        const powerUpTypes = ['multiplier', 'time', 'shuffle', 'bomb'];
        
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
        }
        
        mesh.material = material;
        mesh.setEnabled(false);
        mesh.name = `powerup_proto_${powerUpType}`;
        
        this.powerUps.set(powerUpType, mesh);
        return mesh;
    }

    createMultiplierPowerUp() {
        const multiplier = BABYLON.MeshBuilder.CreateBox("multiplier", { 
            size: 1.0 
        }, this.scene);
        return multiplier;
    }

    createTimePowerUp() {
        const clock = BABYLON.MeshBuilder.CreateCylinder("clock", {
            diameter: 1.2,
            height: 0.2
        }, this.scene);
        return clock;
    }

    createShufflePowerUp() {
        const shuffle = new BABYLON.Mesh("shuffle", this.scene);
        return shuffle;
    }

    createBombPowerUp() {
        const bomb = BABYLON.MeshBuilder.CreateSphere("bomb", { 
            diameter: 1.2 
        }, this.scene);
        return bomb;
    }

    setupFruitPool() {
        // ایجاد پول برای هر نوع میوه
        for (const fruitType of this.fruitTypes) {
            this.fruitPool.set(fruitType, []);
        }
        
        // پول پاورآپ‌ها
        for (const powerUpType of ['multiplier', 'time', 'shuffle', 'bomb']) {
            this.powerUpPool.set(powerUpType, []);
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
        
        mesh.animations = [scaleAnimation];
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
        }
    }

    activateMultiplierPowerUp() {
        if (window.gameManager) {
            window.gameManager.setScoreMultiplier(2, 10);
        }
        this.createMultiplierEffect();
    }

    activateTimePowerUp() {
        if (window.gameManager) {
            window.gameManager.addTime(15);
        }
        this.createTimeEffect();
    }

    activateShufflePowerUp() {
        this.shuffleFruits();
        this.createShuffleEffect();
    }

    activateBombPowerUp(position) {
        this.explodeNearbyFruits(position);
        this.createExplosionEffect(position);
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

    // متدهای افکت‌های بصری
    createMultiplierEffect() {
        console.log('Multiplier effect activated');
    }

    createTimeEffect() {
        console.log('Time effect activated');
    }

    createShuffleEffect() {
        console.log('Shuffle effect activated');
    }

    createExplosionEffect(position) {
        if (window.particleManager) {
            window.particleManager.createExplosion(position, new BABYLON.Color3(1, 0, 0));
        }
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
