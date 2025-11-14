// m1.js - موتور اصلی بازی پیشرفته - نسخه تصحیح شده
// ===============================================

class AdvancedGameEngine {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        if (!this.canvas) {
            console.error("❌ Canvas element not found!");
            this.showFatalError("عنصر Canvas یافت نشد!");
            return;
        }
        
        try {
            this.engine = new BABYLON.Engine(this.canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                antialias: true
            });
        } catch (error) {
            console.error("❌ خطا در ایجاد موتور Babylon:", error);
            this.showFatalError("موتور گرافیکی قابل راه‌اندازی نیست");
            return;
        }
        
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.ground = null;
        this.skybox = null;
        this.buildings = [];
        this.units = [];
        this.enemies = [];
        this.projectiles = [];
        this.selectedObject = null;
        this.buildMode = false;
        this.currentBuildType = null;
        this.battleMode = false;
        this.isUnderAttack = false;
        
        // سیستم‌های پیشرفته
        this.resources = {
            gold: 5000,
            elixir: 3000,
            goldCapacity: 10000,
            elixirCapacity: 8000
        };
        
        this.tribeLayout = {
            walls: [],
            defenses: [],
            resources: [],
            barracks: [],
            buildings: []
        };
        
        this.gameTime = 0;
        this.lastAttackTime = 0;
        this.attackInterval = 300;
        
        this.gridSize = 2;
        this.grid = [];
        this.initialized = false;
        
        // آمار بازی
        this.stats = {
            buildingsBuilt: 0,
            unitsTrained: 0,
            battlesWon: 0,
            battlesLost: 0,
            resourcesCollected: 0,
            totalPlayTime: 0
        };
        
        // متغیرهای جدید
        this.selectionHighlight = null;
        this.buildPreview = null;
        this.gridMesh = null;
        this.trees = [];
        this.water = null;
        this.tacticalCamera = null;
        this.mainLight = null;
        this.ambientLight = null;
        this.buildingLights = [];
        this.aiSystem = null;
        
        this.init();
    }
    
    showFatalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 30px;
            border-radius: 15px;
            z-index: 10000;
            text-align: center;
            font-family: Tahoma;
            max-width: 80%;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;
        errorDiv.innerHTML = `
            <h2>⚠️ خطا در راه‌اندازی بازی</h2>
            <p style="margin: 15px 0; font-size: 16px;">${message}</p>
            <div style="margin: 20px 0;">
                <button onclick="location.reload()" style="
                    padding: 12px 24px;
                    background: white;
                    color: #ff4444;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 5px;
                ">تلاش مجدد</button>
                <button onclick="showDebugInfo()" style="
                    padding: 12px 24px;
                    background: #ff8844;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    margin: 5px;
                ">اطلاعات خطا</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
    
    async init() {
        try {
            console.log("🚀 شروع راه‌اندازی موتور بازی...");
            
            // بررسی وجود BabylonJS
            if (typeof BABYLON === 'undefined') {
                throw new Error("BabylonJS بارگذاری نشده است!");
            }
            
            await this.createScene();
            await this.createAdvancedCamera();
            await this.createAdvancedLighting();
            await this.createEnvironment();
            await this.createDefaultTribe();
            await this.setupAdvancedEventListeners();
            await this.setupAISystem();
            
            // راه‌اندازی حلقه رندر
            this.engine.runRenderLoop(() => {
                if (this.scene) {
                    this.update();
                    this.scene.render();
                }
            });
            
            window.addEventListener("resize", () => {
                this.engine.resize();
            });
            
            this.initialized = true;
            console.log("✅ موتور بازی پیشرفته با موفقیت راه‌اندازی شد");
            
            // مخفی کردن صفحه بارگذاری
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی موتور بازی:", error);
            this.showFatalError(`خطای فنی: ${error.message}`);
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // نمایش رابط کاربری اصلی بازی
        this.showGameUI();
    }
    
    showGameUI() {
        // ایجاد رابط کاربری اصلی بازی
        this.createGameInterface();
    }
    
    createGameInterface() {
        // ایجاد نوار منابع
        this.createResourceBar();
        
        // ایجاد منوی ساخت‌وساز
        this.createBuildMenu();
        
        // ایجاد پنل اطلاعات
        this.createInfoPanel();
    }
    
    createResourceBar() {
        const resourceBar = document.createElement('div');
        resourceBar.id = 'resourceBar';
        resourceBar.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 10px;
            display: flex;
            gap: 20px;
            font-family: Tahoma;
            z-index: 1000;
        `;
        
        resourceBar.innerHTML = `
            <div class="resource">
                <span style="color: gold;">●</span>
                طلا: <span id="goldAmount">${this.resources.gold}</span>
            </div>
            <div class="resource">
                <span style="color: purple;">●</span>
                اکسیر: <span id="elixirAmount">${this.resources.elixir}</span>
            </div>
        `;
        
        document.body.appendChild(resourceBar);
    }
    
    createBuildMenu() {
        const buildMenu = document.createElement('div');
        buildMenu.id = 'buildMenu';
        buildMenu.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            padding: 15px;
            border-radius: 15px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        `;
        
        const buildings = [
            { type: 'wall', name: 'دیوار', cost: '50 طلا', icon: '🧱' },
            { type: 'barracks', name: 'سربازخانه', cost: '200 طلا', icon: '🏠' },
            { type: 'goldmine', name: 'معدن طلا', cost: '100 طلا', icon: '⛏️' },
            { type: 'cannon', name: 'توپخانه', cost: '300 طلا', icon: '💣' }
        ];
        
        buildings.forEach(building => {
            const button = document.createElement('button');
            button.style.cssText = `
                padding: 10px 15px;
                background: #2d5a27;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-family: Tahoma;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            `;
            button.innerHTML = `
                <span style="font-size: 20px">${building.icon}</span>
                <div>${building.name}</div>
                <small>${building.cost}</small>
            `;
            button.onclick = () => {
                this.setBuildMode(building.type);
                this.showNotification(`حالت ساخت: ${building.name} فعال شد`);
            };
            buildMenu.appendChild(button);
        });
        
        document.body.appendChild(buildMenu);
    }
    
    createInfoPanel() {
        const infoPanel = document.createElement('div');
        infoPanel.id = 'infoPanel';
        infoPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: Tahoma;
            max-width: 300px;
            display: none;
            z-index: 1000;
        `;
        document.body.appendChild(infoPanel);
    }
    
    async createScene() {
        try {
            this.scene = new BABYLON.Scene(this.engine);
            
            // تنظیمات صحنه
            this.scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.3, 1.0);
            this.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            
            console.log("✅ صحنه بازی ایجاد شد");
            return this.scene;
            
        } catch (error) {
            console.error("❌ خطا در ایجاد صحنه:", error);
            throw error;
        }
    }
    
    async createAdvancedCamera() {
        try {
            this.camera = new BABYLON.ArcRotateCamera(
                "advancedCamera",
                -Math.PI / 2,
                Math.PI / 2.5,
                50,
                new BABYLON.Vector3(0, 10, 0),
                this.scene
            );
            
            // تنظیمات دوربین
            this.camera.lowerBetaLimit = Math.PI / 6;
            this.camera.upperBetaLimit = Math.PI / 2;
            this.camera.lowerRadiusLimit = 15;
            this.camera.upperRadiusLimit = 200;
            this.camera.wheelPrecision = 30;
            
            this.camera.attachControl(this.canvas, true);
            console.log("✅ دوربین ایجاد شد");
            
        } catch (error) {
            console.error("❌ خطا در ایجاد دوربین:", error);
            throw error;
        }
    }
    
    async createAdvancedLighting() {
        try {
            // نور اصلی
            this.mainLight = new BABYLON.DirectionalLight(
                "mainLight",
                new BABYLON.Vector3(-1, -2, -1),
                this.scene
            );
            this.mainLight.position = new BABYLON.Vector3(50, 100, 50);
            this.mainLight.intensity = 1.2;
            
            // نور محیطی
            this.ambientLight = new BABYLON.HemisphericLight(
                "ambientLight",
                new BABYLON.Vector3(0, 1, 0),
                this.scene
            );
            this.ambientLight.intensity = 0.4;
            
            console.log("✅ سیستم نورپردازی ایجاد شد");
            
        } catch (error) {
            console.error("❌ خطا در ایجاد نورپردازی:", error);
            throw error;
        }
    }
    
    async createEnvironment() {
        try {
            await this.createAdvancedGround();
            await this.createSkybox();
            await this.createForest();
            await this.createWater();
            
            console.log("✅ محیط بازی ایجاد شد");
            
        } catch (error) {
            console.error("❌ خطا در ایجاد محیط:", error);
            throw error;
        }
    }
    
    async createAdvancedGround() {
        // زمین اصلی
        this.ground = BABYLON.MeshBuilder.CreateGround(
            "mainGround",
            {
                width: 200,
                height: 200,
                subdivisions: 50
            },
            this.scene
        );
        
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.2);
        this.ground.material = groundMaterial;
        
        // شبکه ساخت‌وساز
        this.createConstructionGrid();
        
        console.log("✅ زمین بازی ایجاد شد");
    }
    
    createConstructionGrid() {
        this.gridMesh = BABYLON.MeshBuilder.CreateGround(
            "gridMesh",
            {
                width: 100,
                height: 100,
                subdivisions: 50
            },
            this.scene
        );
        
        const gridMaterial = new BABYLON.StandardMaterial("gridMaterial", this.scene);
        gridMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.1);
        gridMaterial.alpha = 0.1;
        gridMaterial.wireframe = true;
        
        this.gridMesh.material = gridMaterial;
        this.gridMesh.isVisible = false;
        this.gridMesh.position.y = 0.01;
        
        console.log("✅ شبکه ساخت‌وساز ایجاد شد");
    }
    
    async createSkybox() {
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.2, 0.4);
        skyboxMaterial.disableLighting = true;
        
        this.skybox.material = skyboxMaterial;
        console.log("✅ آسمان ایجاد شد");
    }
    
    async createForest() {
        this.trees = [];
        const treeCount = 30;
        
        for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;
            
            // بررسی فاصله از مرکز
            const distance = Math.sqrt(x * x + z * z);
            if (distance > 40) {
                const tree = this.createTree(x, z);
                this.trees.push(tree);
            }
        }
        
        console.log("✅ جنگل ایجاد شد");
    }
    
    createTree(x, z) {
        const tree = BABYLON.MeshBuilder.CreateCylinder("tree", {
            height: 8 + Math.random() * 4,
            diameterTop: 0,
            diameterBottom: 2 + Math.random() * 1,
            tessellation: 8
        }, this.scene);
        
        tree.position.x = x;
        tree.position.z = z;
        tree.position.y = 4;
        
        const trunkMaterial = new BABYLON.StandardMaterial("trunkMaterial", this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        tree.material = trunkMaterial;
        
        return tree;
    }
    
    async createWater() {
        this.water = BABYLON.MeshBuilder.CreateGround("water", {
            width: 30,
            height: 20,
            subdivisions: 20
        }, this.scene);
        
        this.water.position.x = -40;
        this.water.position.z = 30;
        this.water.position.y = 0.1;
        
        const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
        waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
        waterMaterial.alpha = 0.7;
        this.water.material = waterMaterial;
        
        console.log("✅ دریاچه ایجاد شد");
    }
    
    async createDefaultTribe() {
        console.log("🏗️ در حال ایجاد قبیله پیش‌فرض...");
        
        // سالن شهر اصلی
        const townHall = this.createTownHall(0, 0);
        this.tribeLayout.buildings.push(townHall);
        
        // سربازخانه
        const barracks = this.createBarracks(-15, -10);
        this.tribeLayout.barracks.push(barracks);
        
        // معدن طلا
        const goldMine = this.createGoldMine(-12, -5);
        this.tribeLayout.resources.push(goldMine);
        
        // کارخانه اکسیر
        const elixirFactory = this.createElixirFactory(12, -5);
        this.tribeLayout.resources.push(elixirFactory);
        
        // دیوارهای دفاعی
        this.createStarterWalls();
        
        console.log("✅ قبیله پیش‌فرض ایجاد شد");
    }
    
    createStarterWalls() {
        const wallPositions = [
            { x: -8, z: -8, rotation: 0 },
            { x: 8, z: -8, rotation: 0 },
            { x: -8, z: 8, rotation: Math.PI/2 },
            { x: 8, z: 8, rotation: Math.PI/2 }
        ];
        
        wallPositions.forEach(pos => {
            const wall = this.createWall(pos.x, pos.z, pos.rotation);
            this.tribeLayout.walls.push(wall);
        });
    }
    
    createTownHall(x, z) {
        const townHall = BABYLON.MeshBuilder.CreateCylinder("townHall", {
            diameter: 8,
            height: 12,
            tessellation: 16
        }, this.scene);
        
        townHall.position.x = x;
        townHall.position.z = z;
        townHall.position.y = 6;
        
        const material = new BABYLON.StandardMaterial("townHallMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
        townHall.material = material;
        
        return {
            mesh: townHall,
            type: 'townhall',
            level: 1,
            health: 500,
            maxHealth: 500,
            position: { x: x, z: z }
        };
    }
    
    createBarracks(x, z) {
        const barracks = BABYLON.MeshBuilder.CreateBox("barracks", {
            width: 6,
            height: 4,
            depth: 8
        }, this.scene);
        
        barracks.position.x = x;
        barracks.position.z = z;
        barracks.position.y = 2;
        
        const material = new BABYLON.StandardMaterial("barracksMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.4, 0.8);
        barracks.material = material;
        
        return {
            mesh: barracks,
            type: 'barracks',
            level: 1,
            health: 300,
            maxHealth: 300,
            position: { x: x, z: z }
        };
    }
    
    createGoldMine(x, z) {
        const mine = BABYLON.MeshBuilder.CreateCylinder("goldMine", {
            diameter: 4,
            height: 2,
            tessellation: 12
        }, this.scene);
        
        mine.position.x = x;
        mine.position.z = z;
        mine.position.y = 1;
        
        const material = new BABYLON.StandardMaterial("goldMineMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
        mine.material = material;
        
        return {
            mine: mine,
            type: 'goldmine',
            level: 1,
            health: 150,
            maxHealth: 150,
            productionRate: 5,
            position: { x: x, z: z }
        };
    }
    
    createElixirFactory(x, z) {
        const factory = BABYLON.MeshBuilder.CreateBox("elixirFactory", {
            width: 5,
            height: 3,
            depth: 5
        }, this.scene);
        
        factory.position.x = x;
        factory.position.z = z;
        factory.position.y = 1.5;
        
        const material = new BABYLON.StandardMaterial("elixirFactoryMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.6, 0, 0.8);
        factory.material = material;
        
        return {
            factory: factory,
            type: 'elixirfactory',
            level: 1,
            health: 150,
            maxHealth: 150,
            productionRate: 3,
            position: { x: x, z: z }
        };
    }
    
    createWall(x, z, rotation) {
        const wall = BABYLON.MeshBuilder.CreateBox("wall", {
            width: 4,
            height: 3,
            depth: 1
        }, this.scene);
        
        wall.position.x = x;
        wall.position.z = z;
        wall.position.y = 1.5;
        wall.rotation.y = rotation;
        
        const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", this.scene);
        wallMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        wall.material = wallMaterial;
        
        return {
            mesh: wall,
            type: 'wall',
            health: 100,
            maxHealth: 100,
            position: { x: x, z: z },
            rotation: rotation
        };
    }
    
    async setupAdvancedEventListeners() {
        this.setupInputHandling();
        console.log("✅ سیستم رویدادها راه‌اندازی شد");
    }
    
    setupInputHandling() {
        this.scene.onPointerDown = (evt, pickResult) => {
            if (evt.button === 0) {
                if (this.buildMode && this.currentBuildType) {
                    this.handleBuildModeClick(pickResult);
                } else {
                    this.handleObjectSelection(pickResult);
                }
            }
        };
        
        this.scene.onPointerMove = () => {
            if (this.buildMode && this.currentBuildType) {
                this.updateBuildPreview();
            }
        };
        
        // مدیریت زوم
        this.scene.onMouseWheelObservable.add((event) => {
            const delta = event.event.deltaY;
            this.camera.radius += delta * 0.1;
            this.camera.radius = Math.max(15, Math.min(200, this.camera.radius));
        });
    }
    
    handleBuildModeClick(pickResult) {
        if (pickResult.hit) {
            const position = this.snapToGrid(pickResult.pickedPoint);
            
            if (this.canBuildAt(position)) {
                this.placeBuilding(this.currentBuildType, position);
            } else {
                this.showNotification("امکان ساخت در این موقعیت وجود ندارد!");
            }
        }
    }
    
    handleObjectSelection(pickResult) {
        if (pickResult.hit && pickResult.pickedMesh) {
            const selectedObject = this.findObjectByMesh(pickResult.pickedMesh);
            if (selectedObject) {
                this.selectObject(selectedObject);
            }
        }
    }
    
    findObjectByMesh(mesh) {
        const allObjects = [
            ...this.tribeLayout.buildings,
            ...this.tribeLayout.walls,
            ...this.tribeLayout.barracks,
            ...this.tribeLayout.resources
        ];
        
        return allObjects.find(obj => obj.mesh === mesh);
    }
    
    selectObject(object) {
        this.deselectObject();
        this.selectedObject = object;
        this.showObjectInfo(object);
    }
    
    deselectObject() {
        if (this.selectionHighlight) {
            this.selectionHighlight.dispose();
            this.selectionHighlight = null;
        }
        this.selectedObject = null;
    }
    
    showObjectInfo(object) {
        const info = this.getObjectInfo(object);
        this.showNotification(info);
    }
    
    getObjectInfo(object) {
        switch (object.type) {
            case 'townhall':
                return `سالن شهر - سطح ${object.level}`;
            case 'barracks':
                return `سربازخانه - سطح ${object.level}`;
            case 'wall':
                return `دیوار دفاعی`;
            case 'goldmine':
                return `معدن طلا - تولید: ${object.productionRate}`;
            case 'elixirfactory':
                return `کارخانه اکسیر - تولید: ${object.productionRate}`;
            default:
                return object.type;
        }
    }
    
    updateBuildPreview() {
        const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        
        if (pickResult.hit) {
            const position = this.snapToGrid(pickResult.pickedPoint);
            
            if (!this.buildPreview) {
                this.createBuildPreview(position);
            } else {
                this.buildPreview.position.x = position.x;
                this.buildPreview.position.z = position.z;
            }
            
            const canBuild = this.canBuildAt(position);
            this.buildPreview.material.emissiveColor = canBuild ? 
                new BABYLON.Color3(0, 0.5, 0) : 
                new BABYLON.Color3(0.5, 0, 0);
        }
    }
    
    createBuildPreview(position) {
        const buildingData = this.getBuildingData(this.currentBuildType);
        
        this.buildPreview = BABYLON.MeshBuilder.CreateBox(
            "buildPreview",
            {
                width: buildingData.width,
                height: 0.1,
                depth: buildingData.depth
            },
            this.scene
        );
        
        this.buildPreview.position.copyFrom(position);
        this.buildPreview.position.y = 0.05;
        
        const material = new BABYLON.StandardMaterial("previewMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        material.alpha = 0.5;
        this.buildPreview.material = material;
    }
    
    snapToGrid(point) {
        const x = Math.round(point.x / this.gridSize) * this.gridSize;
        const z = Math.round(point.z / this.gridSize) * this.gridSize;
        return new BABYLON.Vector3(x, 0, z);
    }
    
    canBuildAt(position) {
        if (Math.abs(position.x) > 45 || Math.abs(position.z) > 45) {
            return false;
        }
        
        const allBuildings = [
            ...this.tribeLayout.buildings,
            ...this.tribeLayout.walls,
            ...this.tribeLayout.barracks,
            ...this.tribeLayout.resources
        ];
        
        const buildingData = this.getBuildingData(this.currentBuildType);
        const halfWidth = buildingData.width / 2;
        const halfDepth = buildingData.depth / 2;
        
        for (const building of allBuildings) {
            let buildingPos;
            
            if (building.position) {
                buildingPos = new BABYLON.Vector3(building.position.x, 0, building.position.z);
            } else if (building.mesh) {
                buildingPos = building.mesh.position;
            } else {
                continue;
            }
            
            const dx = Math.abs(position.x - buildingPos.x);
            const dz = Math.abs(position.z - buildingPos.z);
            
            if (dx < (halfWidth + 2) && dz < (halfDepth + 2)) {
                return false;
            }
        }
        
        return true;
    }
    
    setBuildMode(buildingType) {
        this.buildMode = true;
        this.currentBuildType = buildingType;
        this.gridMesh.isVisible = true;
    }
    
    cancelBuildMode() {
        this.buildMode = false;
        this.currentBuildType = null;
        this.gridMesh.isVisible = false;
        
        if (this.buildPreview) {
            this.buildPreview.dispose();
            this.buildPreview = null;
        }
    }
    
    placeBuilding(buildingType, position) {
        const buildingData = this.getBuildingData(buildingType);
        
        if (!this.hasEnoughResources(buildingData.cost)) {
            this.showNotification("منابع کافی ندارید!");
            return;
        }
        
        this.deductResources(buildingData.cost);
        
        let newBuilding;
        
        switch (buildingType) {
            case 'wall':
                newBuilding = this.createWall(position.x, position.z, 0);
                this.tribeLayout.walls.push(newBuilding);
                break;
            case 'goldmine':
                newBuilding = this.createGoldMine(position.x, position.z);
                this.tribeLayout.resources.push(newBuilding);
                break;
            case 'barracks':
                newBuilding = this.createBarracks(position.x, position.z);
                this.tribeLayout.barracks.push(newBuilding);
                break;
        }
        
        if (newBuilding) {
            this.stats.buildingsBuilt++;
            this.showNotification("ساختمان ساخته شد!");
        }
        
        this.cancelBuildMode();
    }
    
    getBuildingData(type) {
        const buildingData = {
            wall: { width: 4, height: 3, depth: 1, cost: { gold: 50, elixir: 0 } },
            goldmine: { width: 4, height: 2, depth: 4, cost: { gold: 100, elixir: 0 } },
            barracks: { width: 6, height: 4, depth: 8, cost: { gold: 200, elixir: 100 } }
        };
        
        return buildingData[type] || { width: 2, height: 2, depth: 2, cost: { gold: 100, elixir: 100 } };
    }
    
    hasEnoughResources(cost) {
        return this.resources.gold >= cost.gold && this.resources.elixir >= cost.elixir;
    }
    
    deductResources(cost) {
        this.resources.gold -= cost.gold;
        this.resources.elixir -= cost.elixir;
        this.updateResourceUI();
    }
    
    updateResourceUI() {
        const goldAmount = document.getElementById('goldAmount');
        const elixirAmount = document.getElementById('elixirAmount');
        
        if (goldAmount) goldAmount.textContent = Math.floor(this.resources.gold);
        if (elixirAmount) elixirAmount.textContent = Math.floor(this.resources.elixir);
    }
    
    async setupAISystem() {
        this.aiSystem = {
            difficulty: 1,
            lastAttack: 0,
            attackCooldown: this.attackInterval
        };
        console.log("✅ سیستم هوش مصنوعی راه‌اندازی شد");
    }
    
    update() {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        this.gameTime += deltaTime;
        
        // به‌روزرسانی منابع
        this.updateResourceProduction(deltaTime);
    }
    
    updateResourceProduction(deltaTime) {
        for (const resource of this.tribeLayout.resources) {
            if (resource.type === 'goldmine') {
                this.resources.gold += resource.productionRate * deltaTime;
                this.resources.gold = Math.min(this.resources.gold, this.resources.goldCapacity);
            } else if (resource.type === 'elixirfactory') {
                this.resources.elixir += resource.productionRate * deltaTime;
                this.resources.elixir = Math.min(this.resources.elixir, this.resources.elixirCapacity);
            }
        }
        
        // به‌روزرسانی UI
        this.updateResourceUI();
    }
    
    showNotification(message, type = "info") {
        console.log(`📢 ${message}`);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-family: Tahoma;
            animation: slideIn 0.3s ease;
        `;
        
        // اضافه کردن انیمیشن
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

// تابع دیباگ برای نمایش اطلاعات
window.showDebugInfo = function() {
    const debugInfo = `
        BabylonJS: ${typeof BABYLON !== 'undefined' ? '✅ بارگذاری شده' : '❌ بارگذاری نشده'}
        Canvas: ${document.getElementById('gameCanvas') ? '✅ موجود' : '❌ یافت نشد'}
        موتور بازی: ${window.gameEngine ? '✅ ایجاد شده' : '❌ ایجاد نشده'}
    `;
    alert(debugInfo);
};

// راه‌اندازی بازی
window.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 شروع راه‌اندازی بازی...");
    
    try {
        // نمایش صفحه بارگذاری
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingProgress = document.getElementById('loadingProgress');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingScreen && loadingProgress && loadingText) {
            loadingScreen.style.display = 'flex';
            
            // شبیه‌سازی پیشرفت بارگذاری
            let progress = 0;
            const interval = setInterval(() => {
                progress += 2;
                if (loadingProgress) loadingProgress.style.width = `${progress}%`;
                if (loadingText) loadingText.textContent = `در حال بارگذاری... ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 50);
        }
        
        // ایجاد موتور بازی
        window.gameEngine = new AdvancedGameEngine();
        
    } catch (error) {
        console.error("💥 خطای شدید در راه‌اندازی بازی:", error);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 30px;
            border-radius: 15px;
            z-index: 10000;
            text-align: center;
            font-family: Tahoma;
            max-width: 80%;
        `;
        errorDiv.innerHTML = `
            <h2>خطا در بارگذاری بازی!</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()" style="
                padding: 10px 20px;
                margin-top: 15px;
                background: white;
                color: #ff4444;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">تلاش مجدد</button>
        `;
        document.body.appendChild(errorDiv);
    }
});

console.log("🎮 فایل بازی بارگذاری شد");
