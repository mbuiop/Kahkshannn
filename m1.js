// m1.js - موتور اصلی بازی
// ===============================================

class GameEngine {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = null;
        this.camera = null;
        this.light = null;
        this.ground = null;
        this.buildings = [];
        this.units = [];
        this.selectedBuilding = null;
        this.buildMode = false;
        this.currentBuildType = null;
        this.resources = {
            gold: 1000,
            elixir: 500
        };
        this.gameTime = 0;
        this.lastUpdateTime = 0;
        this.gridSize = 2;
        this.grid = [];
        this.initialized = false;
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createLighting();
        this.createGround();
        this.createSkybox();
        this.createGrid();
        this.setupEventListeners();
        this.setupUI();
        
        // شروع حلقه بازی
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });
        
        // مدیریت تغییر سایز پنجره
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
        
        this.initialized = true;
        console.log("موتور بازی با موفقیت راه‌اندازی شد");
    }
    
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1.0);
        this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        this.scene.collisionsEnabled = true;
        
        // ایجاد محیط فیزیک
        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.AmmoJSPlugin());
        
        // تنظیمات fog برای عمق بیشتر
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    }
    
    createCamera() {
        // ایجاد دوربین از نمای بالا
        this.camera = new BABYLON.ArcRotateCamera(
            "camera", 
            -Math.PI / 2, 
            Math.PI / 3, 
            50, 
            new BABYLON.Vector3(0, 0, 0), 
            this.scene
        );
        
        this.camera.lowerBetaLimit = Math.PI / 6;
        this.camera.upperBetaLimit = Math.PI / 2;
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 100;
        this.camera.wheelPrecision = 50;
        this.camera.panningSensibility = 1000;
        this.camera.attachControl(this.canvas, true);
        
        // دوربین دوم برای رندر مینی‌مپ
        this.minimapCamera = new BABYLON.UniversalCamera("minimapCamera", new BABYLON.Vector3(0, 100, 0), this.scene);
        this.minimapCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.minimapCamera.orthoTop = 50;
        this.minimapCamera.orthoBottom = -50;
        this.minimapCamera.orthoLeft = -50;
        this.minimapCamera.orthoRight = 50;
        this.minimapCamera.rotation.x = Math.PI / 2;
    }
    
    createLighting() {
        // نور اصلی جهت‌دار (خورشید)
        this.light = new BABYLON.DirectionalLight(
            "sunLight", 
            new BABYLON.Vector3(-1, -2, -1), 
            this.scene
        );
        this.light.position = new BABYLON.Vector3(50, 100, 50);
        this.light.intensity = 1.0;
        this.light.shadowEnabled = true;
        
        // نور محیطی
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight", 
            new BABYLON.Vector3(0, 1, 0), 
            this.scene
        );
        ambientLight.intensity = 0.3;
        
        // نور نقطه‌ای برای جلوه‌های خاص
        const pointLight = new BABYLON.PointLight(
            "pointLight", 
            new BABYLON.Vector3(0, 10, 0), 
            this.scene
        );
        pointLight.intensity = 0.5;
        pointLight.range = 50;
    }
    
    createGround() {
        // ایجاد زمین بازی
        this.ground = BABYLON.MeshBuilder.CreateGround(
            "ground", 
            { width: 100, height: 100, subdivisions: 50 }, 
            this.scene
        );
        
        // متریال زمین
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/ZqvBdJc.jpg", this.scene);
        groundMaterial.diffuseTexture.uScale = 10;
        groundMaterial.diffuseTexture.vScale = 10;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this.ground.material = groundMaterial;
        
        // فیزیک برای زمین
        this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.ground, 
            BABYLON.PhysicsImpostor.BoxImpostor, 
            { mass: 0, restitution: 0.3 }, 
            this.scene
        );
        
        // ایجاد شبکه برای نشان‌دادن گرید
        this.createGridMesh();
    }
    
    createGridMesh() {
        const gridMaterial = new BABYLON.StandardMaterial("gridMaterial", this.scene);
        gridMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        gridMaterial.alpha = 0.1;
        gridMaterial.wireframe = true;
        
        this.gridMesh = BABYLON.MeshBuilder.CreateGround(
            "gridMesh", 
            { width: 100, height: 100, subdivisions: 50 }, 
            this.scene
        );
        this.gridMesh.material = gridMaterial;
        this.gridMesh.isVisible = false;
    }
    
    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
            "https://assets.babylonjs.com/textures/skybox/skybox", 
            this.scene
        );
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
    }
    
    createGrid() {
        // ایجاد شبکه منطقی برای قرارگیری ساختمان‌ها
        const gridSize = 100;
        const cellSize = this.gridSize;
        const cellCount = Math.floor(gridSize / cellSize);
        
        for (let i = -cellCount/2; i < cellCount/2; i++) {
            for (let j = -cellCount/2; j < cellCount/2; j++) {
                this.grid.push({
                    x: i * cellSize,
                    z: j * cellSize,
                    occupied: false,
                    building: null
                });
            }
        }
        
        console.log(`شبکه ${this.grid.length} خانه‌ای ایجاد شد`);
    }
    
    setupEventListeners() {
        // مدیریت کلیک‌ها برای انتخاب و ساخت
        this.scene.onPointerDown = (evt, pickResult) => {
            if (evt.button !== 0) return; // فقط کلیک چپ
            
            if (this.buildMode && this.currentBuildType) {
                this.placeBuilding(pickResult);
            } else {
                this.selectObject(pickResult);
            }
        };
        
        // مدیریت حرکت موس برای پیش‌نمایش ساخت
        this.scene.onPointerMove = (evt, pickResult) => {
            if (this.buildMode && this.currentBuildType) {
                this.showBuildPreview(pickResult);
            }
        };
        
        // مدیریت کلیدهای کیبورد
        window.addEventListener("keydown", (evt) => {
            this.handleKeyDown(evt);
        });
    }
    
    setupUI() {
        // اتصال دکمه‌های UI
        document.getElementById("zoomInBtn").addEventListener("click", () => {
            this.camera.radius -= 5;
        });
        
        document.getElementById("zoomOutBtn").addEventListener("click", () => {
            this.camera.radius += 5;
        });
        
        document.getElementById("rotateBtn").addEventListener("click", () => {
            this.camera.alpha += Math.PI / 4;
        });
        
        // اتصال دکمه‌های ساخت
        const buildItems = document.querySelectorAll(".build-item");
        buildItems.forEach(item => {
            item.addEventListener("click", () => {
                this.setBuildMode(item.dataset.type);
                
                // فعال کردن آیتم انتخاب شده
                buildItems.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
            });
        });
        
        // اتصال دکمه فروشگاه
        document.getElementById("shopBtn").addEventListener("click", () => {
            document.getElementById("shopModal").style.display = "block";
        });
        
        document.getElementById("closeShopBtn").addEventListener("click", () => {
            document.getElementById("shopModal").style.display = "none";
        });
        
        // اتصال آیتم‌های فروشگاه
        const shopItems = document.querySelectorAll(".shop-item");
        shopItems.forEach(item => {
            item.addEventListener("click", () => {
                this.buyUnit(item.dataset.unit);
            });
        });
    }
    
    setBuildMode(buildingType) {
        this.buildMode = true;
        this.currentBuildType = buildingType;
        this.gridMesh.isVisible = true;
        this.showNotification(`حالت ساخت: ${this.getBuildingName(buildingType)}`);
    }
    
    cancelBuildMode() {
        this.buildMode = false;
        this.currentBuildType = null;
        this.gridMesh.isVisible = false;
        
        if (this.buildPreview) {
            this.buildPreview.dispose();
            this.buildPreview = null;
        }
        
        // غیرفعال کردن همه آیتم‌های ساخت
        document.querySelectorAll(".build-item").forEach(item => {
            item.classList.remove("active");
        });
    }
    
    showBuildPreview(pickResult) {
        if (!pickResult.hit) return;
        
        const point = pickResult.pickedPoint;
        const gridPoint = this.snapToGrid(point);
        
        if (!this.buildPreview) {
            this.createBuildPreview(gridPoint);
        } else {
            this.buildPreview.position.x = gridPoint.x;
            this.buildPreview.position.z = gridPoint.z;
        }
        
        // بررسی امکان ساخت در این موقعیت
        const canBuild = this.canBuildAt(gridPoint);
        this.buildPreview.material.emissiveColor = canBuild ? 
            new BABYLON.Color3(0, 0.5, 0) : 
            new BABYLON.Color3(0.5, 0, 0);
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
        
        this.buildPreview.position = position;
        
        const material = new BABYLON.StandardMaterial("previewMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        material.alpha = 0.5;
        this.buildPreview.material = material;
    }
    
    placeBuilding(pickResult) {
        if (!pickResult.hit) return;
        
        const point = pickResult.pickedPoint;
        const gridPoint = this.snapToGrid(point);
        
        if (!this.canBuildAt(gridPoint)) {
            this.showNotification("امکان ساخت در این موقعیت وجود ندارد!");
            return;
        }
        
        const buildingData = this.getBuildingData(this.currentBuildType);
        
        // بررسی منابع کافی
        if (!this.hasEnoughResources(buildingData.cost)) {
            this.showNotification("منابع کافی ندارید!");
            return;
        }
        
        // کسر منابع
        this.deductResources(buildingData.cost);
        
        // ایجاد ساختمان
        this.createBuilding(this.currentBuildType, gridPoint);
        
        // خروج از حالت ساخت
        this.cancelBuildMode();
        
        this.showNotification(`${this.getBuildingName(this.currentBuildType)} ساخته شد!`);
    }
    
    createBuilding(type, position) {
        const buildingData = this.getBuildingData(type);
        
        // ایجاد مدل ساختمان
        let buildingMesh;
        
        if (type === "townhall") {
            buildingMesh = this.createTownHall(position);
        } else if (type === "goldmine") {
            buildingMesh = this.createGoldMine(position);
        } else if (type === "elixirmine") {
            buildingMesh = this.createElixirMine(position);
        } else if (type === "barracks") {
            buildingMesh = this.createBarracks(position);
        } else if (type === "wall") {
            buildingMesh = this.createWall(position);
        } else if (type === "cannon") {
            buildingMesh = this.createCannon(position);
        } else {
            // ساختمان پیش‌فرض
            buildingMesh = BABYLON.MeshBuilder.CreateBox(
                type, 
                { 
                    width: buildingData.width, 
                    height: buildingData.height, 
                    depth: buildingData.depth 
                }, 
                this.scene
            );
        }
        
        buildingMesh.position = position;
        
        // ایجاد متریال
        const material = new BABYLON.StandardMaterial(`${type}Material`, this.scene);
        material.diffuseColor = buildingData.color;
        buildingMesh.material = material;
        
        // اضافه کردن فیزیک
        buildingMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            buildingMesh, 
            BABYLON.PhysicsImpostor.BoxImpostor, 
            { mass: 0, restitution: 0.3 }, 
            this.scene
        );
        
        // ذخیره اطلاعات ساختمان
        const building = {
            type: type,
            mesh: buildingMesh,
            level: 1,
            data: buildingData,
            position: position,
            gridX: Math.round(position.x / this.gridSize),
            gridZ: Math.round(position.z / this.gridSize)
        };
        
        this.buildings.push(building);
        
        // علامت‌گذاری خانه‌های اشغال شده در شبکه
        this.markGridOccupied(building);
        
        return building;
    }
    
    createTownHall(position) {
        // ایجاد سالن شهر با جزئیات بیشتر
        const base = BABYLON.MeshBuilder.CreateCylinder(
            "townhallBase", 
            { diameter: 6, height: 2 }, 
            this.scene
        );
        
        const tower = BABYLON.MeshBuilder.CreateCylinder(
            "townhallTower", 
            { diameter: 3, height: 8 }, 
            this.scene
        );
        tower.position.y = 5;
        
        const roof = BABYLON.MeshBuilder.CreateCone(
            "townhallRoof", 
            { diameter: 4, height: 3 }, 
            this.scene
        );
        roof.position.y = 9.5;
        
        // ترکیب مش‌ها
        const townhall = BABYLON.Mesh.MergeMeshes([base, tower, roof], true);
        townhall.name = "townhall";
        
        return townhall;
    }
    
    createGoldMine(position) {
        // ایجاد معدن طلا
        const base = BABYLON.MeshBuilder.CreateBox(
            "goldmineBase", 
            { width: 4, height: 1, depth: 4 }, 
            this.scene
        );
        
        const structure = BABYLON.MeshBuilder.CreateCylinder(
            "goldmineStructure", 
            { diameter: 2, height: 3 }, 
            this.scene
        );
        structure.position.y = 2;
        
        const goldMine = BABYLON.Mesh.MergeMeshes([base, structure], true);
        goldMine.name = "goldmine";
        
        return goldMine;
    }
    
    createElixirMine(position) {
        // ایجاد کارخانه اکسیر
        const base = BABYLON.MeshBuilder.CreateBox(
            "elixirmineBase", 
            { width: 4, height: 1, depth: 4 }, 
            this.scene
        );
        
        const tank1 = BABYLON.MeshBuilder.CreateSphere(
            "elixirTank1", 
            { diameter: 2.5 }, 
            this.scene
        );
        tank1.position.y = 2;
        tank1.position.x = -1;
        
        const tank2 = BABYLON.MeshBuilder.CreateSphere(
            "elixirTank2", 
            { diameter: 2.5 }, 
            this.scene
        );
        tank2.position.y = 2;
        tank2.position.x = 1;
        
        const elixirMine = BABYLON.Mesh.MergeMeshes([base, tank1, tank2], true);
        elixirMine.name = "elixirmine";
        
        return elixirMine;
    }
    
    createBarracks(position) {
        // ایجاد سربازخانه
        const base = BABYLON.MeshBuilder.CreateBox(
            "barracksBase", 
            { width: 5, height: 1, depth: 5 }, 
            this.scene
        );
        
        const building = BABYLON.MeshBuilder.CreateBox(
            "barracksBuilding", 
            { width: 4, height: 3, depth: 4 }, 
            this.scene
        );
        building.position.y = 2;
        
        const flagPole = BABYLON.MeshBuilder.CreateCylinder(
            "flagPole", 
            { diameter: 0.2, height: 4 }, 
            this.scene
        );
        flagPole.position.y = 5;
        flagPole.position.x = 2;
        
        const barracks = BABYLON.Mesh.MergeMeshes([base, building, flagPole], true);
        barracks.name = "barracks";
        
        return barracks;
    }
    
    createWall(position) {
        // ایجاد دیوار
        const wall = BABYLON.MeshBuilder.CreateBox(
            "wall", 
            { width: 2, height: 2, depth: 2 }, 
            this.scene
        );
        wall.name = "wall";
        
        return wall;
    }
    
    createCannon(position) {
        // ایجاد توپخانه
        const base = BABYLON.MeshBuilder.CreateCylinder(
            "cannonBase", 
            { diameter: 2, height: 1 }, 
            this.scene
        );
        
        const barrel = BABYLON.MeshBuilder.CreateCylinder(
            "cannonBarrel", 
            { diameter: 0.5, height: 3 }, 
            this.scene
        );
        barrel.position.y = 1;
        barrel.rotation.z = Math.PI / 2;
        
        const cannon = BABYLON.Mesh.MergeMeshes([base, barrel], true);
        cannon.name = "cannon";
        
        return cannon;
    }
    
    selectObject(pickResult) {
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            
            // پیدا کردن ساختمان مربوطه
            const building = this.buildings.find(b => b.mesh === mesh);
            
            if (building) {
                this.selectBuilding(building);
            } else {
                this.deselectBuilding();
            }
        } else {
            this.deselectBuilding();
        }
    }
    
    selectBuilding(building) {
        this.deselectBuilding();
        
        this.selectedBuilding = building;
        
        // ایجاد هایلایت برای ساختمان انتخاب شده
        this.selectionHighlight = BABYLON.MeshBuilder.CreateBox(
            "selectionHighlight", 
            { 
                width: building.data.width + 0.5, 
                height: 0.1, 
                depth: building.data.depth + 0.5 
            }, 
            this.scene
        );
        
        this.selectionHighlight.position.x = building.position.x;
        this.selectionHighlight.position.z = building.position.z;
        this.selectionHighlight.position.y = 0.05;
        
        const material = new BABYLON.StandardMaterial("highlightMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        material.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0);
        this.selectionHighlight.material = material;
        
        this.showNotification(`${this.getBuildingName(building.type)} انتخاب شد (سطح ${building.level})`);
    }
    
    deselectBuilding() {
        if (this.selectionHighlight) {
            this.selectionHighlight.dispose();
            this.selectionHighlight = null;
        }
        
        this.selectedBuilding = null;
    }
    
    snapToGrid(point) {
        const x = Math.round(point.x / this.gridSize) * this.gridSize;
        const z = Math.round(point.z / this.gridSize) * this.gridSize;
        return new BABYLON.Vector3(x, 0, z);
    }
    
    canBuildAt(position) {
        const buildingData = this.getBuildingData(this.currentBuildType);
        const halfWidth = buildingData.width / 2;
        const halfDepth = buildingData.depth / 2;
        
        // بررسی مرزهای زمین
        if (Math.abs(position.x) > 45 || Math.abs(position.z) > 45) {
            return false;
        }
        
        // بررسی برخورد با ساختمان‌های موجود
        for (const building of this.buildings) {
            const dx = Math.abs(position.x - building.position.x);
            const dz = Math.abs(position.z - building.position.z);
            
            if (dx < (halfWidth + building.data.width/2) && 
                dz < (halfDepth + building.data.depth/2)) {
                return false;
            }
        }
        
        return true;
    }
    
    markGridOccupied(building) {
        const halfWidth = building.data.width / 2;
        const halfDepth = building.data.depth / 2;
        
        for (const cell of this.grid) {
            const dx = Math.abs(cell.x - building.position.x);
            const dz = Math.abs(cell.z - building.position.z);
            
            if (dx <= halfWidth && dz <= halfDepth) {
                cell.occupied = true;
                cell.building = building;
            }
        }
    }
    
    getBuildingData(type) {
        const buildingData = {
            townhall: { width: 6, height: 10, depth: 6, cost: { gold: 500, elixir: 0 }, color: new BABYLON.Color3(0.8, 0.6, 0.2) },
            goldmine: { width: 4, height: 4, depth: 4, cost: { gold: 100, elixir: 0 }, color: new BABYLON.Color3(1, 0.84, 0) },
            elixirmine: { width: 4, height: 4, depth: 4, cost: { gold: 0, elixir: 100 }, color: new BABYLON.Color3(0.5, 0, 0.5) },
            barracks: { width: 5, height: 4, depth: 5, cost: { gold: 200, elixir: 100 }, color: new BABYLON.Color3(0.2, 0.4, 0.8) },
            wall: { width: 2, height: 2, depth: 2, cost: { gold: 50, elixir: 0 }, color: new BABYLON.Color3(0.5, 0.5, 0.5) },
            cannon: { width: 3, height: 3, depth: 3, cost: { gold: 300, elixir: 100 }, color: new BABYLON.Color3(0.3, 0.3, 0.3) }
        };
        
        return buildingData[type] || { width: 2, height: 2, depth: 2, cost: { gold: 100, elixir: 100 }, color: new BABYLON.Color3(1, 1, 1) };
    }
    
    getBuildingName(type) {
        const names = {
            townhall: "سالن شهر",
            goldmine: "معدن طلا",
            elixirmine: "کارخانه اکسیر",
            barracks: "سربازخانه",
            wall: "دیوار",
            cannon: "توپخانه"
        };
        
        return names[type] || "ساختمان";
    }
    
    hasEnoughResources(cost) {
        return this.resources.gold >= cost.gold && this.resources.elixir >= cost.elixir;
    }
    
    deductResources(cost) {
        this.resources.gold -= cost.gold;
        this.resources.elixir -= cost.elixir;
        this.updateResourceUI();
    }
    
    addResources(amounts) {
        this.resources.gold += amounts.gold || 0;
        this.resources.elixir += amounts.elixir || 0;
        this.updateResourceUI();
    }
    
    updateResourceUI() {
        document.getElementById("goldCount").textContent = Math.floor(this.resources.gold);
        document.getElementById("elixirCount").textContent = Math.floor(this.resources.elixir);
    }
    
    buyUnit(unitType) {
        const unitCosts = {
            soldier: { gold: 0, elixir: 50 },
            archer: { gold: 0, elixir: 100 },
            giant: { gold: 0, elixir: 200 },
            dragon: { gold: 0, elixir: 300 }
        };
        
        const cost = unitCosts[unitType];
        
        if (!this.hasEnoughResources(cost)) {
            this.showNotification("اکسیر کافی برای خرید این سرباز ندارید!");
            return;
        }
        
        // پیدا کردن سربازخانه
        const barracks = this.buildings.find(b => b.type === "barracks");
        
        if (!barracks) {
            this.showNotification("برای آموزش سرباز نیاز به سربازخانه دارید!");
            return;
        }
        
        this.deductResources(cost);
        this.createUnit(unitType, barracks.position);
        
        this.showNotification(`${this.getUnitName(unitType)} آموزش داده شد!`);
    }
    
    createUnit(unitType, position) {
        // ایجاد واحد نظامی
        let unitMesh;
        const offset = new BABYLON.Vector3(
            (Math.random() - 0.5) * 5,
            0,
            (Math.random() - 0.5) * 5
        );
        
        const unitPosition = position.add(offset);
        
        if (unitType === "soldier") {
            unitMesh = this.createSoldier(unitPosition);
        } else if (unitType === "archer") {
            unitMesh = this.createArcher(unitPosition);
        } else if (unitType === "giant") {
            unitMesh = this.createGiant(unitPosition);
        } else if (unitType === "dragon") {
            unitMesh = this.createDragon(unitPosition);
        }
        
        const unit = {
            type: unitType,
            mesh: unitMesh,
            position: unitPosition,
            health: 100,
            attack: 10,
            speed: 1,
            target: null,
            state: "idle" // idle, moving, attacking
        };
        
        this.units.push(unit);
        
        return unit;
    }
    
    createSoldier(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder(
            "soldierBody", 
            { diameter: 0.5, height: 1.5 }, 
            this.scene
        );
        
        const head = BABYLON.MeshBuilder.CreateSphere(
            "soldierHead", 
            { diameter: 0.6 }, 
            this.scene
        );
        head.position.y = 1.2;
        
        const soldier = BABYLON.Mesh.MergeMeshes([body, head], true);
        soldier.position = position;
        soldier.name = "soldier";
        
        // متریال سرباز
        const material = new BABYLON.StandardMaterial("soldierMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.8);
        soldier.material = material;
        
        return soldier;
    }
    
    createArcher(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder(
            "archerBody", 
            { diameter: 0.5, height: 1.5 }, 
            this.scene
        );
        
        const head = BABYLON.MeshBuilder.CreateSphere(
            "archerHead", 
            { diameter: 0.6 }, 
            this.scene
        );
        head.position.y = 1.2;
        
        const archer = BABYLON.Mesh.MergeMeshes([body, head], true);
        archer.position = position;
        archer.name = "archer";
        
        const material = new BABYLON.StandardMaterial("archerMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 0.5, 0);
        archer.material = material;
        
        return archer;
    }
    
    createGiant(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder(
            "giantBody", 
            { diameter: 1, height: 2.5 }, 
            this.scene
        );
        
        const head = BABYLON.MeshBuilder.CreateSphere(
            "giantHead", 
            { diameter: 1 }, 
            this.scene
        );
        head.position.y = 2;
        
        const giant = BABYLON.Mesh.MergeMeshes([body, head], true);
        giant.position = position;
        giant.name = "giant";
        
        const material = new BABYLON.StandardMaterial("giantMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
        giant.material = material;
        
        return giant;
    }
    
    createDragon(position) {
        const body = BABYLON.MeshBuilder.CreateSphere(
            "dragonBody", 
            { diameter: 1.5 }, 
            this.scene
        );
        
        const head = BABYLON.MeshBuilder.CreateSphere(
            "dragonHead", 
            { diameter: 0.8 }, 
            this.scene
        );
        head.position.y = 0.5;
        head.position.z = 0.8;
        
        const wing1 = BABYLON.MeshBuilder.CreateBox(
            "dragonWing1", 
            { width: 0.1, height: 1, depth: 2 }, 
            this.scene
        );
        wing1.position.x = 0.8;
        wing1.rotation.z = Math.PI / 4;
        
        const wing2 = BABYLON.MeshBuilder.CreateBox(
            "dragonWing2", 
            { width: 0.1, height: 1, depth: 2 }, 
            this.scene
        );
        wing2.position.x = -0.8;
        wing2.rotation.z = -Math.PI / 4;
        
        const dragon = BABYLON.Mesh.MergeMeshes([body, head, wing1, wing2], true);
        dragon.position = position;
        dragon.name = "dragon";
        
        const material = new BABYLON.StandardMaterial("dragonMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
        dragon.material = material;
        
        return dragon;
    }
    
    getUnitName(unitType) {
        const names = {
            soldier: "سرباز",
            archer: "کماندار",
            giant: "غول",
            dragon: "اژدها"
        };
        
        return names[unitType] || "واحد";
    }
    
    handleKeyDown(evt) {
        switch (evt.key) {
            case "Escape":
                this.cancelBuildMode();
                this.deselectBuilding();
                break;
            case "Delete":
                if (this.selectedBuilding) {
                    this.demolishBuilding(this.selectedBuilding);
                }
                break;
            case "g":
                this.gridMesh.isVisible = !this.gridMesh.isVisible;
                break;
        }
    }
    
    demolishBuilding(building) {
        // حذف ساختمان
        const index = this.buildings.indexOf(building);
        if (index > -1) {
            this.buildings.splice(index, 1);
        }
        
        // آزاد کردن خانه‌های شبکه
        for (const cell of this.grid) {
            if (cell.building === building) {
                cell.occupied = false;
                cell.building = null;
            }
        }
        
        // حذف مدل
        building.mesh.dispose();
        
        this.deselectBuilding();
        this.showNotification("ساختمان تخریب شد");
    }
    
    showNotification(message) {
        const notification = document.getElementById("notification");
        notification.textContent = message;
        notification.style.display = "block";
        
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }
    
    update() {
        const now = Date.now();
        const deltaTime = this.lastUpdateTime ? (now - this.lastUpdateTime) / 1000 : 0;
        this.lastUpdateTime = now;
        
        this.gameTime += deltaTime;
        
        // به‌روزرسانی منابع
        this.updateResourceProduction(deltaTime);
        
        // به‌روزرسانی واحدها
        this.updateUnits(deltaTime);
        
        // به‌روزرسانی انیمیشن‌ها
        this.updateAnimations(deltaTime);
        
        // به‌روزرسانی دوربین
        this.updateCamera(deltaTime);
    }
    
    updateResourceProduction(deltaTime) {
        // تولید منابع از ساختمان‌ها
        for (const building of this.buildings) {
            if (building.type === "goldmine") {
                this.resources.gold += 5 * deltaTime;
            } else if (building.type === "elixirmine") {
                this.resources.elixir += 3 * deltaTime;
            }
        }
        
        // به‌روزرسانی UI هر 0.5 ثانیه
        if (this.gameTime % 0.5 < deltaTime) {
            this.updateResourceUI();
        }
    }
    
    updateUnits(deltaTime) {
        for (const unit of this.units) {
            if (unit.state === "idle") {
                // حرکت تصادفی
                if (Math.random() < 0.01) {
                    this.moveUnitToRandomPosition(unit);
                }
            } else if (unit.state === "moving") {
                this.updateUnitMovement(unit, deltaTime);
            }
        }
    }
    
    moveUnitToRandomPosition(unit) {
        const randomPos = new BABYLON.Vector3(
            (Math.random() - 0.5) * 80,
            0,
            (Math.random() - 0.5) * 80
        );
        
        unit.target = randomPos;
        unit.state = "moving";
    }
    
    updateUnitMovement(unit, deltaTime) {
        if (!unit.target) return;
        
        const direction = unit.target.subtract(unit.position);
        const distance = direction.length();
        
        if (distance < 0.5) {
            unit.state = "idle";
            unit.target = null;
            return;
        }
        
        direction.normalize();
        const movement = direction.scale(unit.speed * deltaTime);
        
        unit.position = unit.position.add(movement);
        unit.mesh.position = unit.position;
        
        // چرخش به سمت هدف
        unit.mesh.lookAt(unit.target);
    }
    
    updateAnimations(deltaTime) {
        // انیمیشن چرخش برای ساختمان‌های خاص
        for (const building of this.buildings) {
            if (building.type === "goldmine" || building.type === "elixirmine") {
                building.mesh.rotation.y += 0.5 * deltaTime;
            }
        }
        
        // انیمیشن پرواز اژدها
        for (const unit of this.units) {
            if (unit.type === "dragon") {
                unit.mesh.position.y = 2 + Math.sin(this.gameTime * 2) * 0.5;
                unit.mesh.rotation.x = Math.sin(this.gameTime) * 0.1;
            }
        }
    }
    
    updateCamera(deltaTime) {
        // حرکت نرم دوربین
        this.camera.alpha += 0.1 * deltaTime;
    }
}

// ایجاد نمونه موتور بازی پس از بارگذاری صفحه
window.addEventListener("DOMContentLoaded", () => {
    // شبیه‌سازی بارگذاری
    const loadingProgress = document.getElementById("loadingProgress");
    const loadingText = document.getElementById("loadingText");
    const loadingScreen = document.getElementById("loadingScreen");
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        loadingProgress.style.width = `${progress}%`;
        loadingText.textContent = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.display = "none";
                // راه‌اندازی موتور بازی
                window.gameEngine = new GameEngine();
            }, 500);
        }
    }, 50);
});
