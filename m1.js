// m1.js - موتور اصلی بازی پیشرفته
// ===============================================

class AdvancedGameEngine {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true
        });
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
            barracks: []
        };
        
        this.gameTime = 0;
        this.lastAttackTime = 0;
        this.attackInterval = 300; // 5 دقیقه
        
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
        
        this.init();
    }
    
    async init() {
        try {
            await this.createScene();
            await this.createAdvancedCamera();
            await this.createAdvancedLighting();
            await this.createEnvironment();
            await this.createDefaultTribe();
            await this.setupAdvancedEventListeners();
            await this.setupAISystem();
            
            this.engine.runRenderLoop(() => {
                this.update();
                this.scene.render();
            });
            
            window.addEventListener("resize", () => {
                this.engine.resize();
            });
            
            this.initialized = true;
            console.log("✅ موتور بازی پیشرفته با موفقیت راه‌اندازی شد");
            
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی موتور بازی:", error);
        }
    }
    
    async createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        
        // تنظیمات پیشرفته صحنه
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.3, 1.0);
        this.scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
        this.scene.collisionsEnabled = true;
        
        // فعال کردن فیزیک پیشرفته
        await this.enableAdvancedPhysics();
        
        // ایجاد افکت‌های پس‌پردازش
        await this.setupPostProcessing();
        
        return this.scene;
    }
    
    async enableAdvancedPhysics() {
        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        const physicsPlugin = new BABYLON.AmmoJSPlugin(true);
        this.scene.enablePhysics(gravityVector, physicsPlugin);
        
        console.log("✅ سیستم فیزیک پیشرفته فعال شد");
    }
    
    async setupPostProcessing() {
        // Bloom Effect برای درخشندگی
        const bloomEffect = new BABYLON.BloomEffect("bloom", 2, 1);
        bloomEffect.threshold = 0.8;
        
        // Depth of Field برای عمق‌نمایی
        const depthOfField = new BABYLON.DepthOfFieldEffect("dof", this.scene, {
            blurLevel: 0.5,
            focalLength: 10,
            fStop: 1.4
        });
        
        console.log("✅ افکت‌های پس‌پردازش فعال شدند");
    }
    
    async createAdvancedCamera() {
        // ایجاد دوربین پیشرفته ArcRotate
        this.camera = new BABYLON.ArcRotateCamera(
            "advancedCamera",
            -Math.PI / 2,
            Math.PI / 2.5,
            50,
            new BABYLON.Vector3(0, 10, 0),
            this.scene
        );
        
        // تنظیمات پیشرفته دوربین
        this.camera.lowerBetaLimit = Math.PI / 6;
        this.camera.upperBetaLimit = Math.PI / 2;
        this.camera.lowerRadiusLimit = 15;
        this.camera.upperRadiusLimit = 200;
        this.camera.wheelPrecision = 30;
        this.camera.panningSensibility = 1000;
        this.camera.angularSensibilityX = 1000;
        this.camera.angularSensibilityY = 1000;
        
        // فعال کردن کنترل‌های لمسی برای موبایل
        this.camera.inputs.attached.pointers.touchEnabled = true;
        
        // دوربین دوم برای نمای تاکتیکی
        this.tacticalCamera = new BABYLON.FreeCamera("tacticalCamera", new BABYLON.Vector3(0, 100, 0), this.scene);
        this.tacticalCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.tacticalCamera.orthoTop = 50;
        this.tacticalCamera.orthoBottom = -50;
        this.tacticalCamera.orthoLeft = -50;
        this.tacticalCamera.orthoRight = 50;
        this.tacticalCamera.rotation.x = Math.PI / 2;
        
        this.camera.attachControl(this.canvas, true);
        
        console.log("✅ دوربین پیشرفته ایجاد شد");
    }
    
    async createAdvancedLighting() {
        // نور اصلی (خورشید)
        this.mainLight = new BABYLON.DirectionalLight(
            "mainLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        this.mainLight.position = new BABYLON.Vector3(50, 100, 50);
        this.mainLight.intensity = 1.2;
        this.mainLight.shadowEnabled = true;
        
        // تنظیمات سایه پیشرفته
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, this.mainLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.blurBoxOffset = 1;
        shadowGenerator.darkness = 0.4;
        
        // نور محیطی
        this.ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        this.ambientLight.intensity = 0.4;
        this.ambientLight.groundColor = new BABYLON.Color3(0.2, 0.3, 0.1);
        
        // نورهای نقطه‌ای برای جلوه‌های ویژه
        this.createPointLights();
        
        console.log("✅ سیستم نورپردازی پیشرفته ایجاد شد");
    }
    
    createPointLights() {
        // نور برای ساختمان‌های خاص
        this.buildingLights = [];
        
        const lightPositions = [
            new BABYLON.Vector3(-15, 8, -15),
            new BABYLON.Vector3(15, 8, -15),
            new BABYLON.Vector3(-15, 8, 15),
            new BABYLON.Vector3(15, 8, 15)
        ];
        
        lightPositions.forEach((position, index) => {
            const pointLight = new BABYLON.PointLight(
                `pointLight${index}`,
                position,
                this.scene
            );
            pointLight.intensity = 0.3;
            pointLight.range = 20;
            pointLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
            this.buildingLights.push(pointLight);
        });
    }
    
    async createEnvironment() {
        await this.createAdvancedGround();
        await this.createSkybox();
        await this.createForest();
        await this.createWater();
        await this.createDetails();
    }
    
    async createAdvancedGround() {
        // ایجاد زمین اصلی با متریال پیشرفته
        this.ground = BABYLON.MeshBuilder.CreateGround(
            "mainGround",
            {
                width: 200,
                height: 200,
                subdivisions: 100
            },
            this.scene
        );
        
        // ایجاد متریال پیشرفته برای زمین
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        
        // اضافه کردن تکسچرهای مختلف
        const diffuseTexture = new BABYLON.Texture("https://i.imgur.com/p5yZp9J.jpg", this.scene);
        diffuseTexture.uScale = 20;
        diffuseTexture.vScale = 20;
        groundMaterial.diffuseTexture = diffuseTexture;
        
        const normalTexture = new BABYLON.Texture("https://i.imgur.com/8N3y7c2.png", this.scene);
        normalTexture.uScale = 20;
        normalTexture.vScale = 20;
        groundMaterial.bumpTexture = normalTexture;
        
        groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        groundMaterial.specularPower = 64;
        
        this.ground.material = groundMaterial;
        
        // فیزیک برای زمین
        this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            this.ground,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, friction: 0.5, restitution: 0.3 },
            this.scene
        );
        
        // ایجاد شبکه برای ساخت‌وساز
        this.createConstructionGrid();
        
        console.log("✅ زمین پیشرفته ایجاد شد");
    }
    
    createConstructionGrid() {
        // ایجاد شبکه شفاف برای راهنمایی ساخت‌وساز
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
        gridMaterial.backFaceCulling = false;
        
        this.gridMesh.material = gridMaterial;
        this.gridMesh.isVisible = false;
        this.gridMesh.position.y = 0.01;
        
        // ایجاد شبکه منطقی
        this.createLogicalGrid();
    }
    
    createLogicalGrid() {
        const gridSize = 100;
        const cellSize = this.gridSize;
        const cellCount = Math.floor(gridSize / cellSize);
        
        for (let i = -cellCount/2; i < cellCount/2; i++) {
            for (let j = -cellCount/2; j < cellCount/2; j++) {
                this.grid.push({
                    x: i * cellSize,
                    z: j * cellSize,
                    occupied: false,
                    building: null,
                    type: 'empty'
                });
            }
        }
        
        console.log(`✅ شبکه ${this.grid.length} خانه‌ای ایجاد شد`);
    }
    
    async createSkybox() {
        // ایجاد آسمان پیشرفته
        this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 5000 }, this.scene);
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
        
        this.skybox.material = skyboxMaterial;
        
        console.log("✅ آسمان ایجاد شد");
    }
    
    async createForest() {
        // ایجاد جنگل در اطراف زمین
        this.trees = [];
        const treeCount = 200;
        
        for (let i = 0; i < treeCount; i++) {
            const angle = (i / treeCount) * Math.PI * 2;
            const radius = 80 + Math.random() * 20;
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const tree = await this.createTree(x, z);
            this.trees.push(tree);
        }
        
        // ایجاد درختان تصادفی در نقاط دیگر
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 180;
            const z = (Math.random() - 0.5) * 180;
            
            // بررسی فاصله از مرکز
            const distance = Math.sqrt(x * x + z * z);
            if (distance > 40) {
                const tree = await this.createTree(x, z);
                this.trees.push(tree);
            }
        }
        
        console.log("✅ جنگل ایجاد شد");
    }
    
    async createTree(x, z) {
        const tree = BABYLON.MeshBuilder.CreateCylinder("tree", {
            height: 8 + Math.random() * 4,
            diameterTop: 0,
            diameterBottom: 2 + Math.random() * 1,
            tessellation: 8
        }, this.scene);
        
        tree.position.x = x;
        tree.position.z = z;
        tree.position.y = 4;
        
        // متریال تنه درخت
        const trunkMaterial = new BABYLON.StandardMaterial("trunkMaterial", this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        tree.material = trunkMaterial;
        
        // ایجاد برگ‌ها
        const leaves = BABYLON.MeshBuilder.CreateSphere("leaves", {
            diameter: 5 + Math.random() * 3,
            segments: 8
        }, this.scene);
        
        leaves.position.x = x;
        leaves.position.z = z;
        leaves.position.y = 8 + Math.random() * 2;
        
        const leavesMaterial = new BABYLON.StandardMaterial("leavesMaterial", this.scene);
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
        leaves.material = leavesMaterial;
        
        return { trunk: tree, leaves: leaves };
    }
    
    async createWater() {
        // ایجاد دریاچه
        this.water = BABYLON.MeshBuilder.CreateGround("water", {
            width: 30,
            height: 20,
            subdivisions: 50
        }, this.scene);
        
        this.water.position.x = -40;
        this.water.position.z = 30;
        this.water.position.y = 0.1;
        
        const waterMaterial = new BABYLON.StandardMaterial("waterMaterial", this.scene);
        waterMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
        waterMaterial.alpha = 0.7;
        waterMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        waterMaterial.specularPower = 64;
        
        this.water.material = waterMaterial;
        
        console.log("✅ دریاچه ایجاد شد");
    }
    
    async createDetails() {
        // ایجاد جزئیات محیطی
        this.createRocks();
        this.createFlowers();
        this.createPaths();
    }
    
    createRocks() {
        // ایجاد سنگ‌های تصادفی
        for (let i = 0; i < 30; i++) {
            const rock = BABYLON.MeshBuilder.CreateSphere("rock", {
                diameter: 0.5 + Math.random() * 1,
                segments: 6
            }, this.scene);
            
            rock.position.x = (Math.random() - 0.5) * 180;
            rock.position.z = (Math.random() - 0.5) * 180;
            rock.position.y = 0.3;
            
            const rockMaterial = new BABYLON.StandardMaterial("rockMaterial", this.scene);
            rockMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            rock.material = rockMaterial;
            
            // چرخش تصادفی
            rock.rotation.x = Math.random() * Math.PI;
            rock.rotation.z = Math.random() * Math.PI;
        }
    }
    
    createFlowers() {
        // ایجاد گل‌های رنگارنگ
        const flowerColors = [
            new BABYLON.Color3(1, 0, 0),    // قرمز
            new BABYLON.Color3(1, 1, 0),    // زرد
            new BABYLON.Color3(0, 1, 0),    // سبز
            new BABYLON.Color3(0, 0, 1),    // آبی
            new BABYLON.Color3(1, 0, 1)     // بنفش
        ];
        
        for (let i = 0; i < 100; i++) {
            const flower = BABYLON.MeshBuilder.CreateCylinder("flower", {
                height: 0.3,
                diameter: 0.1,
                tessellation: 6
            }, this.scene);
            
            flower.position.x = (Math.random() - 0.5) * 180;
            flower.position.z = (Math.random() - 0.5) * 180;
            flower.position.y = 0.15;
            
            const flowerMaterial = new BABYLON.StandardMaterial("flowerMaterial", this.scene);
            flowerMaterial.diffuseColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            flower.material = flowerMaterial;
        }
    }
    
    createPaths() {
        // ایجاد مسیرهای خاکی
        const path = BABYLON.MeshBuilder.CreateGround("path", {
            width: 5,
            height: 60,
            subdivisions: 10
        }, this.scene);
        
        path.position.x = -20;
        path.position.z = 0;
        path.position.y = 0.05;
        
        const pathMaterial = new BABYLON.StandardMaterial("pathMaterial", this.scene);
        pathMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.5, 0.3);
        path.material = pathMaterial;
        
        // مسیر دوم
        const path2 = BABYLON.MeshBuilder.CreateGround("path2", {
            width: 5,
            height: 40,
            subdivisions: 10
        }, this.scene);
        
        path2.position.x = 0;
        path2.position.z = -25;
        path2.position.y = 0.05;
        path2.rotation.y = Math.PI / 2;
        path2.material = pathMaterial;
    }
    
    async createDefaultTribe() {
        console.log("🏗️ در حال ایجاد قبیله پیش‌فرض...");
        
        // ایجاد دیوارهای دفاعی دورتادور
        await this.createDefensiveWalls();
        
        // ایجاد ساختمان‌های اصلی
        await this.createMainBuildings();
        
        // ایجاد سیستم دفاعی
        await this.createDefenseSystems();
        
        // ایجاد معادن و کارخانه‌ها
        await this.createResourceBuildings();
        
        console.log("✅ قبیله پیش‌فرض با موفقیت ایجاد شد");
    }
    
    async createDefensiveWalls() {
        const wallLength = 40;
        const wallPositions = [
            // دیوارهای شمالی و جنوبی
            { x: -wallLength/2, z: -wallLength/2, rotation: 0 },
            { x: wallLength/2, z: -wallLength/2, rotation: 0 },
            { x: -wallLength/2, z: wallLength/2, rotation: 0 },
            { x: wallLength/2, z: wallLength/2, rotation: 0 },
            
            // دیوارهای شرقی و غربی
            { x: -wallLength/2, z: -wallLength/2, rotation: Math.PI/2 },
            { x: -wallLength/2, z: wallLength/2, rotation: Math.PI/2 },
            { x: wallLength/2, z: -wallLength/2, rotation: Math.PI/2 },
            { x: wallLength/2, z: wallLength/2, rotation: Math.PI/2 }
        ];
        
        for (let i = 0; i < wallPositions.length; i++) {
            const wall = this.createWall(
                wallPositions[i].x,
                wallPositions[i].z,
                wallPositions[i].rotation
            );
            this.tribeLayout.walls.push(wall);
        }
        
        console.log("✅ دیوارهای دفاعی ایجاد شدند");
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
        wallMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        wall.material = wallMaterial;
        
        // فیزیک برای دیوار
        wall.physicsImpostor = new BABYLON.PhysicsImpostor(
            wall,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, friction: 0.5, restitution: 0.1 },
            this.scene
        );
        
        return {
            mesh: wall,
            type: 'wall',
            health: 100,
            maxHealth: 100,
            position: { x: x, z: z },
            rotation: rotation
        };
    }
    
    async createMainBuildings() {
        // سالن شهر اصلی
        const townHall = this.createTownHall(0, 0);
        this.tribeLayout.buildings.push(townHall);
        
        // سربازخانه
        const barracks = this.createBarracks(-15, -10);
        this.tribeLayout.barracks.push(barracks);
        
        // انبار منابع
        const storage = this.createStorage(15, -10);
        this.tribeLayout.buildings.push(storage);
        
        // آزمایشگاه
        const lab = this.createLaboratory(-10, 12);
        this.tribeLayout.buildings.push(lab);
        
        console.log("✅ ساختمان‌های اصلی ایجاد شدند");
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
        material.specularColor = new BABYLON.Color3(0.4, 0.3, 0.1);
        material.specularPower = 64;
        townHall.material = material;
        
        // ایجاد برج‌های کوچک
        this.createTower(x - 2, z - 2, 2);
        this.createTower(x + 2, z - 2, 2);
        this.createTower(x - 2, z + 2, 2);
        this.createTower(x + 2, z + 2, 2);
        
        return {
            mesh: townHall,
            type: 'townhall',
            level: 1,
            health: 500,
            maxHealth: 500,
            position: { x: x, z: z }
        };
    }
    
    createTower(x, z, height) {
        const tower = BABYLON.MeshBuilder.CreateCylinder("tower", {
            diameter: 2,
            height: height,
            tessellation: 8
        }, this.scene);
        
        tower.position.x = x;
        tower.position.z = z;
        tower.position.y = height / 2;
        
        const material = new BABYLON.StandardMaterial("towerMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.7, 0.5, 0.3);
        tower.material = material;
        
        return tower;
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
        material.specularColor = new BABYLON.Color3(0.15, 0.2, 0.4);
        barracks.material = material;
        
        // ایجاد پرچم
        const flag = this.createFlag(x, z + 3, 6);
        
        return {
            mesh: barracks,
            type: 'barracks',
            level: 1,
            health: 300,
            maxHealth: 300,
            position: { x: x, z: z },
            flag: flag
        };
    }
    
    createFlag(x, z, height) {
        // میله پرچم
        const pole = BABYLON.MeshBuilder.CreateCylinder("flagPole", {
            height: height,
            diameter: 0.2,
            tessellation: 8
        }, this.scene);
        
        pole.position.x = x;
        pole.position.z = z;
        pole.position.y = height / 2;
        
        const poleMaterial = new BABYLON.StandardMaterial("poleMaterial", this.scene);
        poleMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        pole.material = poleMaterial;
        
        // پارچه پرچم
        const flag = BABYLON.MeshBuilder.CreatePlane("flag", {
            width: 2,
            height: 1
        }, this.scene);
        
        flag.position.x = x + 1;
        flag.position.z = z;
        flag.position.y = height - 0.5;
        flag.rotation.y = -Math.PI / 2;
        
        const flagMaterial = new BABYLON.StandardMaterial("flagMaterial", this.scene);
        flagMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        flag.material = flagMaterial;
        
        return { pole: pole, flag: flag };
    }
    
    createStorage(x, z) {
        const storage = BABYLON.MeshBuilder.CreateBox("storage", {
            width: 8,
            height: 5,
            depth: 6
        }, this.scene);
        
        storage.position.x = x;
        storage.position.z = z;
        storage.position.y = 2.5;
        
        const material = new BABYLON.StandardMaterial("storageMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.9, 0);
        material.specularColor = new BABYLON.Color3(0.5, 0.45, 0);
        storage.material = material;
        
        return {
            mesh: storage,
            type: 'storage',
            level: 1,
            health: 400,
            maxHealth: 400,
            position: { x: x, z: z }
        };
    }
    
    createLaboratory(x, z) {
        const lab = BABYLON.MeshBuilder.CreateBox("laboratory", {
            width: 6,
            height: 5,
            depth: 6
        }, this.scene);
        
        lab.position.x = x;
        lab.position.z = z;
        lab.position.y = 2.5;
        
        const material = new BABYLON.StandardMaterial("labMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0, 0.8);
        material.specularColor = new BABYLON.Color3(0.25, 0, 0.4);
        lab.material = material;
        
        // ایجاد دودکش
        const chimney = BABYLON.MeshBuilder.CreateCylinder("chimney", {
            height: 3,
            diameter: 0.5,
            tessellation: 8
        }, this.scene);
        
        chimney.position.x = x + 1;
        chimney.position.z = z;
        chimney.position.y = 5.5;
        
        const chimneyMaterial = new BABYLON.StandardMaterial("chimneyMaterial", this.scene);
        chimneyMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        chimney.material = chimneyMaterial;
        
        return {
            mesh: lab,
            type: 'laboratory',
            level: 1,
            health: 350,
            maxHealth: 350,
            position: { x: x, z: z },
            chimney: chimney
        };
    }
    
    async createDefenseSystems() {
        // توپخانه‌ها
        const cannon1 = this.createCannon(-18, -18);
        const cannon2 = this.createCannon(18, -18);
        const cannon3 = this.createCannon(-18, 18);
        const cannon4 = this.createCannon(18, 18);
        
        this.tribeLayout.defenses.push(cannon1, cannon2, cannon3, cannon4);
        
        // برج‌های دیده‌بانی
        const watchtower1 = this.createWatchtower(-20, 0);
        const watchtower2 = this.createWatchtower(20, 0);
        const watchtower3 = this.createWatchtower(0, -20);
        const watchtower4 = this.createWatchtower(0, 20);
        
        this.tribeLayout.defenses.push(watchtower1, watchtower2, watchtower3, watchtower4);
        
        console.log("✅ سیستم دفاعی ایجاد شد");
    }
    
    createCannon(x, z) {
        const base = BABYLON.MeshBuilder.CreateCylinder("cannonBase", {
            diameter: 3,
            height: 1,
            tessellation: 16
        }, this.scene);
        
        base.position.x = x;
        base.position.z = z;
        base.position.y = 0.5;
        
        const barrel = BABYLON.MeshBuilder.CreateCylinder("cannonBarrel", {
            diameter: 0.8,
            height: 4,
            tessellation: 8
        }, this.scene);
        
        barrel.position.x = x;
        barrel.position.z = z;
        barrel.position.y = 2;
        barrel.rotation.z = Math.PI / 2;
        
        const material = new BABYLON.StandardMaterial("cannonMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        base.material = material;
        barrel.material = material;
        
        return {
            base: base,
            barrel: barrel,
            type: 'cannon',
            level: 1,
            health: 200,
            maxHealth: 200,
            damage: 50,
            range: 20,
            position: { x: x, z: z },
            rotation: 0,
            lastShot: 0,
            cooldown: 2000 // 2 ثانیه
        };
    }
    
    createWatchtower(x, z) {
        const tower = BABYLON.MeshBuilder.CreateCylinder("watchtower", {
            diameter: 4,
            height: 8,
            tessellation: 12
        }, this.scene);
        
        tower.position.x = x;
        tower.position.z = z;
        tower.position.y = 4;
        
        const material = new BABYLON.StandardMaterial("watchtowerMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0.4, 0.2);
        tower.material = material;
        
        // سکوی بالایی
        const platform = BABYLON.MeshBuilder.CreateCylinder("platform", {
            diameter: 5,
            height: 0.5,
            tessellation: 12
        }, this.scene);
        
        platform.position.x = x;
        platform.position.z = z;
        platform.position.y = 7.75;
        platform.material = material;
        
        return {
            tower: tower,
            platform: platform,
            type: 'watchtower',
            level: 1,
            health: 250,
            maxHealth: 250,
            range: 25,
            position: { x: x, z: z }
        };
    }
    
    async createResourceBuildings() {
        // معدن طلا
        const goldMine1 = this.createGoldMine(-12, -5);
        const goldMine2 = this.createGoldMine(12, -5);
        
        // کارخانه اکسیر
        const elixirFactory1 = this.createElixirFactory(-5, 15);
        const elixirFactory2 = this.createElixirFactory(5, 15);
        
        this.tribeLayout.resources.push(goldMine1, goldMine2, elixirFactory1, elixirFactory2);
        
        console.log("✅ ساختمان‌های منابع ایجاد شدند");
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
        material.specularColor = new BABYLON.Color3(0.5, 0.4, 0);
        mine.material = material;
        
        // ایجاد سازه استخراج
        const structure = BABYLON.MeshBuilder.CreateBox("mineStructure", {
            width: 2,
            height: 3,
            depth: 2
        }, this.scene);
        
        structure.position.x = x;
        structure.position.z = z;
        structure.position.y = 2.5;
        
        const structureMaterial = new BABYLON.StandardMaterial("structureMaterial", this.scene);
        structureMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        structure.material = structureMaterial;
        
        return {
            mine: mine,
            structure: structure,
            type: 'goldmine',
            level: 1,
            health: 150,
            maxHealth: 150,
            productionRate: 5, // طلا در ثانیه
            position: { x: x, z: z },
            lastCollection: Date.now()
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
        material.specularColor = new BABYLON.Color3(0.3, 0, 0.4);
        factory.material = material;
        
        // مخازن اکسیر
        const tank1 = this.createElixirTank(x - 1, z - 1, 2);
        const tank2 = this.createElixirTank(x + 1, z + 1, 2);
        
        return {
            factory: factory,
            tanks: [tank1, tank2],
            type: 'elixirfactory',
            level: 1,
            health: 150,
            maxHealth: 150,
            productionRate: 3, // اکسیر در ثانیه
            position: { x: x, z: z },
            lastCollection: Date.now()
        };
    }
    
    createElixirTank(x, z, height) {
        const tank = BABYLON.MeshBuilder.CreateCylinder("elixirTank", {
            diameter: 1.5,
            height: height,
            tessellation: 12
        }, this.scene);
        
        tank.position.x = x;
        tank.position.z = z;
        tank.position.y = height / 2;
        
        const material = new BABYLON.StandardMaterial("tankMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.4, 0, 0.6);
        material.alpha = 0.7;
        tank.material = material;
        
        return tank;
    }
    
    async setupAdvancedEventListeners() {
        // مدیریت رویدادهای لمسی و موس
        this.setupInputHandling();
        
        // مدیریت رویدادهای ساختمان‌ها
        this.setupBuildingEvents();
        
        // مدیریت رویدادهای نبرد
        this.setupBattleEvents();
        
        console.log("✅ سیستم رویدادهای پیشرفته راه‌اندازی شد");
    }
    
    setupInputHandling() {
        let isDragging = false;
        let lastPointerX = 0;
        let lastPointerY = 0;
        
        this.scene.onPointerDown = (evt, pickResult) => {
            if (evt.button === 0) { // کلیک چپ
                if (this.buildMode && this.currentBuildType) {
                    this.handleBuildModeClick(pickResult);
                } else {
                    this.handleObjectSelection(pickResult);
                }
            } else if (evt.button === 2) { // کلیک راست
                this.handleRightClick(pickResult);
            }
            
            // شروع درگ برای دوربین
            isDragging = true;
            lastPointerX = this.scene.pointerX;
            lastPointerY = this.scene.pointerY;
        };
        
        this.scene.onPointerUp = () => {
            isDragging = false;
        };
        
        this.scene.onPointerMove = () => {
            if (isDragging) {
                const deltaX = this.scene.pointerX - lastPointerX;
                const deltaY = this.scene.pointerY - lastPointerY;
                
                // حرکت دوربین
                this.camera.alpha -= deltaX * 0.01;
                this.camera.beta -= deltaY * 0.01;
                
                lastPointerX = this.scene.pointerX;
                lastPointerY = this.scene.pointerY;
            }
            
            if (this.buildMode && this.currentBuildType) {
                this.updateBuildPreview();
            }
        };
        
        // مدیریت زوم با اسکرول
        this.scene.onMouseWheelObservable.add((event) => {
            const delta = event.event.deltaY;
            this.camera.radius += delta * 0.1;
            this.camera.radius = Math.max(15, Math.min(200, this.camera.radius));
        });
        
        // مدیریت زوم لمسی
        this.setupTouchZoom();
    }
    
    setupTouchZoom() {
        let initialDistance = 0;
        
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if (pointerInfo.event.pointerType === "touch" && pointerInfo.event.pointers.length === 2) {
                    const touch1 = pointerInfo.event.pointers[0];
                    const touch2 = pointerInfo.event.pointers[1];
                    
                    initialDistance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) +
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                }
            }
            
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
                if (pointerInfo.event.pointerType === "touch" && pointerInfo.event.pointers.length === 2) {
                    const touch1 = pointerInfo.event.pointers[0];
                    const touch2 = pointerInfo.event.pointers[1];
                    
                    const currentDistance = Math.sqrt(
                        Math.pow(touch2.clientX - touch1.clientX, 2) +
                        Math.pow(touch2.clientY - touch1.clientY, 2)
                    );
                    
                    const zoomDelta = (currentDistance - initialDistance) * 0.01;
                    this.camera.radius -= zoomDelta;
                    this.camera.radius = Math.max(15, Math.min(200, this.camera.radius));
                    
                    initialDistance = currentDistance;
                }
            }
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
            } else {
                this.deselectObject();
            }
        } else {
            this.deselectObject();
        }
    }
    
    handleRightClick(pickResult) {
        if (this.selectedObject) {
            // انجام عمل بر روی object انتخاب شده
            this.performActionOnSelected(pickResult);
        }
    }
    
    findObjectByMesh(mesh) {
        // جستجو در ساختمان‌ها
        for (const building of this.tribeLayout.buildings) {
            if (building.mesh === mesh) return building;
        }
        
        // جستجو در دیوارها
        for (const wall of this.tribeLayout.walls) {
            if (wall.mesh === mesh) return wall;
        }
        
        // جستجو در سربازخانه‌ها
        for (const barracks of this.tribeLayout.barracks) {
            if (barracks.mesh === mesh) return barracks;
        }
        
        // جستجو در دفاع‌ها
        for (const defense of this.tribeLayout.defenses) {
            if (defense.base === mesh || defense.barrel === mesh || 
                defense.tower === mesh || defense.platform === mesh) return defense;
        }
        
        // جستجو در منابع
        for (const resource of this.tribeLayout.resources) {
            if (resource.mine === mesh || resource.factory === mesh || 
                resource.structure === mesh) return resource;
        }
        
        return null;
    }
    
    selectObject(object) {
        this.deselectObject();
        this.selectedObject = object;
        
        // ایجاد هایلایت
        this.createSelectionHighlight(object);
        
        // نمایش اطلاعات object
        this.showObjectInfo(object);
    }
    
    deselectObject() {
        if (this.selectionHighlight) {
            this.selectionHighlight.dispose();
            this.selectionHighlight = null;
        }
        this.selectedObject = null;
        this.hideObjectInfo();
    }
    
    createSelectionHighlight(object) {
        let boundingBox;
        
        if (object.mesh) {
            boundingBox = object.mesh.getBoundingInfo().boundingBox;
        } else if (object.base) {
            boundingBox = object.base.getBoundingInfo().boundingBox;
        } else {
            return;
        }
        
        const size = boundingBox.maximum.subtract(boundingBox.minimum);
        const center = boundingBox.minimum.add(size.scale(0.5));
        
        this.selectionHighlight = BABYLON.MeshBuilder.CreateBox("selectionHighlight", {
            width: size.x + 0.5,
            height: 0.1,
            depth: size.z + 0.5
        }, this.scene);
        
        this.selectionHighlight.position.copyFrom(center);
        this.selectionHighlight.position.y = 0.05;
        
        const material = new BABYLON.StandardMaterial("highlightMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        material.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0);
        material.alpha = 0.5;
        this.selectionHighlight.material = material;
    }
    
    showObjectInfo(object) {
        const info = this.getObjectInfo(object);
        this.showNotification(info);
    }
    
    getObjectInfo(object) {
        switch (object.type) {
            case 'townhall':
                return `سالن شهر - سطح ${object.level} - سلامت: ${object.health}/${object.maxHealth}`;
            case 'barracks':
                return `سربازخانه - سطح ${object.level} - سلامت: ${object.health}/${object.maxHealth}`;
            case 'wall':
                return `دیوار - سلامت: ${object.health}/${object.maxHealth}`;
            case 'cannon':
                return `توپخانه - سطح ${object.level} - آسیب: ${object.damage} - برد: ${object.range}`;
            case 'goldmine':
                return `معدن طلا - سطح ${object.level} - تولید: ${object.productionRate} طلا/ثانیه`;
            case 'elixirfactory':
                return `کارخانه اکسیر - سطح ${object.level} - تولید: ${object.productionRate} اکسیر/ثانیه`;
            default:
                return `${object.type} - سطح ${object.level}`;
        }
    }
    
    hideObjectInfo() {
        // پنهان کردن اطلاعات object
    }
    
    performActionOnSelected(pickResult) {
        if (!this.selectedObject) return;
        
        // بسته به نوع object انتخاب شده، عمل مختلف انجام شود
        switch (this.selectedObject.type) {
            case 'barracks':
                this.trainUnit(this.selectedObject, 'soldier');
                break;
            case 'cannon':
                this.aimCannon(this.selectedObject, pickResult.pickedPoint);
                break;
            default:
                // عمل پیش‌فرض
                break;
        }
    }
    
    setupBuildingEvents() {
        // رویدادهای مربوط به ساختمان‌ها
        console.log("✅ رویدادهای ساختمان‌ها راه‌اندازی شد");
    }
    
    setupBattleEvents() {
        // رویدادهای مربوط به نبرد
        console.log("✅ رویدادهای نبرد راه‌اندازی شد");
    }
    
    async setupAISystem() {
        // راه‌اندازی سیستم هوش مصنوعی برای حملات
        this.aiSystem = {
            difficulty: 1,
            lastAttack: 0,
            attackCooldown: this.attackInterval,
            units: []
        };
        
        console.log("✅ سیستم هوش مصنوعی راه‌اندازی شد");
    }
    
    // سیستم ساخت‌وساز
    setBuildMode(buildingType) {
        this.buildMode = true;
        this.currentBuildType = buildingType;
        this.gridMesh.isVisible = true;
        
        this.showNotification(`حالت ساخت: ${this.getBuildingName(buildingType)} فعال شد`);
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
            
            // تغییر رنگ بر اساس امکان ساخت
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
        // بررسی مرزهای زمین
        if (Math.abs(position.x) > 45 || Math.abs(position.z) > 45) {
            return false;
        }
        
        // بررسی برخورد با ساختمان‌های موجود
        const allBuildings = [
            ...this.tribeLayout.buildings,
            ...this.tribeLayout.walls,
            ...this.tribeLayout.barracks,
            ...this.tribeLayout.defenses,
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
    
    placeBuilding(buildingType, position) {
        const buildingData = this.getBuildingData(buildingType);
        
        // بررسی منابع کافی
        if (!this.hasEnoughResources(buildingData.cost)) {
            this.showNotification("منابع کافی ندارید!");
            return;
        }
        
        // کسر منابع
        this.deductResources(buildingData.cost);
        
        // ایجاد ساختمان
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
            case 'elixirfactory':
                newBuilding = this.createElixirFactory(position.x, position.z);
                this.tribeLayout.resources.push(newBuilding);
                break;
            case 'cannon':
                newBuilding = this.createCannon(position.x, position.z);
                this.tribeLayout.defenses.push(newBuilding);
                break;
            case 'barracks':
                newBuilding = this.createBarracks(position.x, position.z);
                this.tribeLayout.barracks.push(newBuilding);
                break;
        }
        
        if (newBuilding) {
            this.stats.buildingsBuilt++;
            this.showNotification(`${this.getBuildingName(buildingType)} ساخته شد!`);
        }
        
        this.cancelBuildMode();
    }
    
    getBuildingData(type) {
        const buildingData = {
            wall: { width: 4, height: 3, depth: 1, cost: { gold: 50, elixir: 0 } },
            goldmine: { width: 4, height: 2, depth: 4, cost: { gold: 100, elixir: 0 } },
            elixirfactory: { width: 5, height: 3, depth: 5, cost: { gold: 0, elixir: 100 } },
            cannon: { width: 3, height: 2, depth: 3, cost: { gold: 300, elixir: 100 } },
            barracks: { width: 6, height: 4, depth: 8, cost: { gold: 200, elixir: 100 } }
        };
        
        return buildingData[type] || { width: 2, height: 2, depth: 2, cost: { gold: 100, elixir: 100 } };
    }
    
    getBuildingName(type) {
        const names = {
            wall: "دیوار",
            goldmine: "معدن طلا",
            elixirfactory: "کارخانه اکسیر",
            cannon: "توپخانه",
            barracks: "سربازخانه"
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
    
    // سیستم آموزش سرباز
    trainUnit(barracks, unitType) {
        const unitCost = this.getUnitCost(unitType);
        
        if (!this.hasEnoughResources(unitCost)) {
            this.showNotification("منابع کافی برای آموزش سرباز ندارید!");
            return;
        }
        
        this.deductResources(unitCost);
        
        const unit = this.createUnit(unitType, barracks.position.x, barracks.position.z);
        this.units.push(unit);
        this.stats.unitsTrained++;
        
        this.showNotification(`${this.getUnitName(unitType)} آموزش داده شد!`);
    }
    
    getUnitCost(unitType) {
        const costs = {
            soldier: { gold: 0, elixir: 50 },
            archer: { gold: 0, elixir: 100 },
            giant: { gold: 0, elixir: 200 },
            dragon: { gold: 0, elixir: 300 }
        };
        
        return costs[unitType] || { gold: 0, elixir: 100 };
    }
    
    getUnitName(unitType) {
        const names = {
            soldier: "سرباز",
            archer: "کماندار",
            giant: "غول",
            dragon: "اژدها"
        };
        
        return names[unitType] || "سرباز";
    }
    
    createUnit(unitType, x, z) {
        let unitMesh;
        const offset = new BABYLON.Vector3(
            (Math.random() - 0.5) * 3,
            0,
            (Math.random() - 0.5) * 3
        );
        
        const position = new BABYLON.Vector3(x, 0, z).add(offset);
        
        switch (unitType) {
            case 'soldier':
                unitMesh = this.createSoldier(position);
                break;
            case 'archer':
                unitMesh = this.createArcher(position);
                break;
            case 'giant':
                unitMesh = this.createGiant(position);
                break;
            case 'dragon':
                unitMesh = this.createDragon(position);
                break;
        }
        
        return {
            mesh: unitMesh,
            type: unitType,
            health: 100,
            maxHealth: 100,
            damage: this.getUnitDamage(unitType),
            speed: this.getUnitSpeed(unitType),
            position: position,
            target: null,
            state: 'idle'
        };
    }
    
    createSoldier(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder("soldierBody", {
            diameter: 0.5,
            height: 1.5,
            tessellation: 8
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("soldierHead", {
            diameter: 0.6,
            segments: 8
        }, this.scene);
        
        head.position.y = 1.2;
        
        const soldier = BABYLON.Mesh.MergeMeshes([body, head], true);
        soldier.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("soldierMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.8);
        soldier.material = material;
        
        return soldier;
    }
    
    createArcher(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder("archerBody", {
            diameter: 0.5,
            height: 1.5,
            tessellation: 8
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("archerHead", {
            diameter: 0.6,
            segments: 8
        }, this.scene);
        
        head.position.y = 1.2;
        
        const archer = BABYLON.Mesh.MergeMeshes([body, head], true);
        archer.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("archerMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 0.5, 0);
        archer.material = material;
        
        return archer;
    }
    
    createGiant(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder("giantBody", {
            diameter: 1,
            height: 2.5,
            tessellation: 8
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("giantHead", {
            diameter: 1,
            segments: 8
        }, this.scene);
        
        head.position.y = 2;
        
        const giant = BABYLON.Mesh.MergeMeshes([body, head], true);
        giant.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("giantMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
        giant.material = material;
        
        return giant;
    }
    
    createDragon(position) {
        const body = BABYLON.MeshBuilder.CreateSphere("dragonBody", {
            diameter: 1.5,
            segments: 8
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("dragonHead", {
            diameter: 0.8,
            segments: 8
        }, this.scene);
        
        head.position.y = 0.5;
        head.position.z = 0.8;
        
        const wing1 = BABYLON.MeshBuilder.CreateBox("dragonWing1", {
            width: 0.1,
            height: 1,
            depth: 2
        }, this.scene);
        
        wing1.position.x = 0.8;
        wing1.rotation.z = Math.PI / 4;
        
        const wing2 = BABYLON.MeshBuilder.CreateBox("dragonWing2", {
            width: 0.1,
            height: 1,
            depth: 2
        }, this.scene);
        
        wing2.position.x = -0.8;
        wing2.rotation.z = -Math.PI / 4;
        
        const dragon = BABYLON.Mesh.MergeMeshes([body, head, wing1, wing2], true);
        dragon.position.copyFrom(position);
        dragon.position.y = 2;
        
        const material = new BABYLON.StandardMaterial("dragonMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
        dragon.material = material;
        
        return dragon;
    }
    
    getUnitDamage(unitType) {
        const damages = {
            soldier: 20,
            archer: 35,
            giant: 50,
            dragon: 80
        };
        
        return damages[unitType] || 10;
    }
    
    getUnitSpeed(unitType) {
        const speeds = {
            soldier: 1.5,
            archer: 1.2,
            giant: 0.8,
            dragon: 2.0
        };
        
        return speeds[unitType] || 1.0;
    }
    
    // سیستم نبرد و هوش مصنوعی
    update() {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        this.gameTime += deltaTime;
        this.stats.totalPlayTime += deltaTime;
        
        // به‌روزرسانی منابع
        this.updateResourceProduction(deltaTime);
        
        // به‌روزرسانی واحدها
        this.updateUnits(deltaTime);
        
        // به‌روزرسانی دفاع‌ها
        this.updateDefenses(deltaTime);
        
        // به‌روزرسانی هوش مصنوعی
        this.updateAI(deltaTime);
        
        // به‌روزرسانی حملات
        this.updateAttacks();
        
        // بررسی حمله هر 5 دقیقه
        this.checkForAttack();
    }
    
    updateResourceProduction(deltaTime) {
        // تولید منابع از ساختمان‌ها
        for (const resource of this.tribeLayout.resources) {
            if (resource.type === 'goldmine') {
                this.resources.gold += resource.productionRate * deltaTime;
                this.resources.gold = Math.min(this.resources.gold, this.resources.goldCapacity);
            } else if (resource.type === 'elixirfactory') {
                this.resources.elixir += resource.productionRate * deltaTime;
                this.resources.elixir = Math.min(this.resources.elixir, this.resources.elixirCapacity);
            }
        }
        
        // به‌روزرسانی UI هر ثانیه
        if (Math.floor(this.gameTime) > Math.floor(this.gameTime - deltaTime)) {
            this.updateResourceUI();
        }
    }
    
    updateUnits(deltaTime) {
        for (const unit of this.units) {
            if (unit.state === 'idle') {
                // حرکت تصادفی در حالت بی‌کاری
                if (Math.random() < 0.01) {
                    this.moveUnitToRandomPosition(unit);
                }
            } else if (unit.state === 'moving') {
                this.updateUnitMovement(unit, deltaTime);
            } else if (unit.state === 'attacking') {
                this.updateUnitAttack(unit, deltaTime);
            }
            
            // به‌روزرسانی انیمیشن‌ها
            this.updateUnitAnimation(unit, deltaTime);
        }
    }
    
    moveUnitToRandomPosition(unit) {
        const randomPos = new BABYLON.Vector3(
            (Math.random() - 0.5) * 30,
            0,
            (Math.random() - 0.5) * 30
        );
        
        unit.target = randomPos;
        unit.state = 'moving';
    }
    
    updateUnitMovement(unit, deltaTime) {
        if (!unit.target) return;
        
        const direction = unit.target.subtract(unit.position);
        const distance = direction.length();
        
        if (distance < 0.5) {
            unit.state = 'idle';
            unit.target = null;
            return;
        }
        
        direction.normalize();
        const movement = direction.scale(unit.speed * deltaTime);
        
        unit.position = unit.position.add(movement);
        unit.mesh.position.copyFrom(unit.position);
        
        // چرخش به سمت هدف
        unit.mesh.lookAt(unit.target);
    }
    
    updateUnitAttack(unit, deltaTime) {
        // منطق حمله واحد
        // (پیاده‌سازی کامل در نسخه نهایی)
    }
    
    updateUnitAnimation(unit, deltaTime) {
        // انیمیشن‌های پایه
        if (unit.type === 'dragon') {
            unit.mesh.position.y = 2 + Math.sin(this.gameTime * 2) * 0.3;
        } else {
            unit.mesh.position.y = 0.1 + Math.sin(this.gameTime * 4) * 0.05;
        }
    }
    
    updateDefenses(deltaTime) {
        const currentTime = Date.now();
        
        for (const defense of this.tribeLayout.defenses) {
            if (defense.type === 'cannon' && this.enemies.length > 0) {
                // یافتن نزدیک‌ترین دشمن
                const nearestEnemy = this.findNearestEnemy(defense);
                
                if (nearestEnemy && this.getDistance(defense, nearestEnemy) <= defense.range) {
                    // هدف‌گیری
                    this.aimCannon(defense, nearestEnemy.mesh.position);
                    
                    // شلیک
                    if (currentTime - defense.lastShot > defense.cooldown) {
                        this.fireCannon(defense, nearestEnemy);
                        defense.lastShot = currentTime;
                    }
                }
            }
        }
    }
    
    findNearestEnemy(defense) {
        let nearestEnemy = null;
        let minDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const distance = this.getDistance(defense, enemy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        return nearestEnemy;
    }
    
    getDistance(obj1, obj2) {
        const pos1 = obj1.position ? 
            new BABYLON.Vector3(obj1.position.x, 0, obj1.position.z) : 
            obj1.mesh.position;
            
        const pos2 = obj2.mesh ? obj2.mesh.position : obj2.position;
        
        return BABYLON.Vector3.Distance(pos1, pos2);
    }
    
    aimCannon(cannon, targetPosition) {
        const direction = targetPosition.subtract(cannon.barrel.position);
        cannon.barrel.lookAt(targetPosition);
        
        // محدود کردن چرخش
        const rotation = cannon.barrel.rotation;
        rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, rotation.x));
        cannon.barrel.rotation = rotation;
    }
    
    fireCannon(cannon, target) {
        // ایجاد پرتابه
        const projectile = this.createProjectile(cannon, target);
        this.projectiles.push(projectile);
        
        // افکت انفجار و صدا
        this.createMuzzleFlash(cannon);
        this.playSound('cannon_fire');
    }
    
    createProjectile(cannon, target) {
        const projectile = BABYLON.MeshBuilder.CreateSphere("projectile", {
            diameter: 0.3,
            segments: 6
        }, this.scene);
        
        projectile.position.copyFrom(cannon.barrel.position);
        
        const material = new BABYLON.StandardMaterial("projectileMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        material.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        projectile.material = material;
        
        return {
            mesh: projectile,
            startPosition: projectile.position.clone(),
            targetPosition: target.mesh.position.clone(),
            speed: 10,
            damage: cannon.damage,
            progress: 0
        };
    }
    
    createMuzzleFlash(cannon) {
        // ایجاد افکت شعله دهانه توپ
        const flash = BABYLON.MeshBuilder.CreateSphere("muzzleFlash", {
            diameter: 1,
            segments: 8
        }, this.scene);
        
        flash.position.copyFrom(cannon.barrel.position);
        flash.position = flash.position.add(cannon.barrel.forward.scale(2));
        
        const material = new BABYLON.StandardMaterial("flashMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
        material.emissiveColor = new BABYLON.Color3(1, 0.6, 0);
        material.alpha = 0.8;
        flash.material = material;
        
        // ناپدید شدن تدریجی
        setTimeout(() => {
            flash.dispose();
        }, 100);
    }
    
    updateAttacks() {
        const currentTime = Date.now();
        
        // به‌روزرسانی پرتابه‌ها
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.progress += 0.02;
            
            if (projectile.progress >= 1) {
                // برخورد پرتابه
                this.handleProjectileHit(projectile);
                projectile.mesh.dispose();
                this.projectiles.splice(i, 1);
            } else {
                // حرکت پرتابه
                const newPosition = BABYLON.Vector3.Lerp(
                    projectile.startPosition,
                    projectile.targetPosition,
                    projectile.progress
                );
                projectile.mesh.position.copyFrom(newPosition);
            }
        }
    }
    
    handleProjectileHit(projectile) {
        // یافتن دشمنان در منطقه انفجار
        const explosionRadius = 3;
        
        for (const enemy of this.enemies) {
            const distance = BABYLON.Vector3.Distance(projectile.mesh.position, enemy.mesh.position);
            
            if (distance <= explosionRadius) {
                // اعمال آسیب
                enemy.health -= projectile.damage;
                
                if (enemy.health <= 0) {
                    this.destroyEnemy(enemy);
                }
            }
        }
        
        // ایجاد افکت انفجار
        this.createExplosionEffect(projectile.mesh.position);
    }
    
    createExplosionEffect(position) {
        // ایجاد افکت انفجار
        const explosion = BABYLON.MeshBuilder.CreateSphere("explosion", {
            diameter: 2,
            segments: 8
        }, this.scene);
        
        explosion.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("explosionMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        material.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        material.alpha = 0.7;
        explosion.material = material;
        
        // انیمیشن انفجار
        const scaleAnimation = new BABYLON.Animation(
            "explosionScale",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const keys = [
            { frame: 0, value: new BABYLON.Vector3(0.1, 0.1, 0.1) },
            { frame: 15, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 30, value: new BABYLON.Vector3(0.1, 0.1, 0.1) }
        ];
        
        scaleAnimation.setKeys(keys);
        explosion.animations = [scaleAnimation];
        this.scene.beginAnimation(explosion, 0, 30, false);
        
        // حذف پس از انیمیشن
        setTimeout(() => {
            explosion.dispose();
        }, 1000);
        
        this.playSound('explosion');
    }
    
    destroyEnemy(enemy) {
        enemy.mesh.dispose();
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        this.stats.battlesWon++;
        this.showNotification("دشمن نابود شد!");
    }
    
    updateAI(deltaTime) {
        // به‌روزرسانی هوش مصنوعی دشمنان
        for (const enemy of this.enemies) {
            this.updateEnemyBehavior(enemy, deltaTime);
        }
    }
    
    updateEnemyBehavior(enemy, deltaTime) {
        // منطق حرکت و حمله دشمنان
        if (enemy.state === 'moving') {
            this.updateEnemyMovement(enemy, deltaTime);
        } else if (enemy.state === 'attacking') {
            this.updateEnemyAttack(enemy, deltaTime);
        }
    }
    
    updateEnemyMovement(enemy, deltaTime) {
        // حرکت به سمت نزدیک‌ترین ساختمان
        const nearestBuilding = this.findNearestBuilding(enemy);
        
        if (nearestBuilding) {
            const direction = nearestBuilding.mesh.position.subtract(enemy.mesh.position);
            const distance = direction.length();
            
            if (distance <= enemy.range) {
                enemy.state = 'attacking';
                enemy.target = nearestBuilding;
            } else {
                direction.normalize();
                const movement = direction.scale(enemy.speed * deltaTime);
                enemy.mesh.position = enemy.mesh.position.add(movement);
                enemy.mesh.lookAt(nearestBuilding.mesh.position);
            }
        }
    }
    
    updateEnemyAttack(enemy, deltaTime) {
        if (!enemy.target) return;
        
        const currentTime = Date.now();
        
        if (currentTime - enemy.lastAttack > enemy.attackSpeed) {
            // حمله به ساختمان
            enemy.target.health -= enemy.damage;
            enemy.lastAttack = currentTime;
            
            if (enemy.target.health <= 0) {
                this.destroyBuilding(enemy.target);
                enemy.state = 'moving';
                enemy.target = null;
            }
        }
    }
    
    findNearestBuilding(enemy) {
        let nearestBuilding = null;
        let minDistance = Infinity;
        
        const allBuildings = [
            ...this.tribeLayout.buildings,
            ...this.tribeLayout.barracks,
            ...this.tribeLayout.resources
        ];
        
        for (const building of allBuildings) {
            const distance = BABYLON.Vector3.Distance(enemy.mesh.position, building.mesh.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestBuilding = building;
            }
        }
        
        return nearestBuilding;
    }
    
    destroyBuilding(building) {
        // انیمیشن تخریب
        building.mesh.dispose();
        
        // حذف از لیست مربوطه
        let list;
        if (this.tribeLayout.buildings.includes(building)) {
            list = this.tribeLayout.buildings;
        } else if (this.tribeLayout.barracks.includes(building)) {
            list = this.tribeLayout.barracks;
        } else if (this.tribeLayout.resources.includes(building)) {
            list = this.tribeLayout.resources;
        }
        
        if (list) {
            const index = list.indexOf(building);
            if (index > -1) {
                list.splice(index, 1);
            }
        }
        
        this.showNotification("یک ساختمان نابود شد!");
    }
    
    checkForAttack() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastAttackTime > this.attackInterval * 1000) {
            this.launchAIAttack();
            this.lastAttackTime = currentTime;
            
            // کاهش زمان حمله بعدی بر اساس سطح دشواری
            this.attackInterval = Math.max(60, this.attackInterval * 0.95); // حداقل 1 دقیقه
        }
    }
    
    launchAIAttack() {
        this.isUnderAttack = true;
        
        // ایجاد دشمنان بر اساس سطح دشواری
        const enemyCount = 3 + Math.floor(this.aiSystem.difficulty);
        
        for (let i = 0; i < enemyCount; i++) {
            this.spawnEnemy();
        }
        
        this.aiSystem.difficulty += 0.1;
        this.showNotification(`🚨 حمله دشمن! ${enemyCount} دشمن به قبیله حمله کردند!`);
        
        this.playSound('attack_warning');
    }
    
    spawnEnemy() {
        const enemyTypes = ['goblin', 'orc', 'troll'];
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 60;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        const enemy = this.createEnemy(enemyType, x, z);
        this.enemies.push(enemy);
    }
    
    createEnemy(type, x, z) {
        let enemyMesh;
        const position = new BABYLON.Vector3(x, 0, z);
        
        switch (type) {
            case 'goblin':
                enemyMesh = this.createGoblin(position);
                break;
            case 'orc':
                enemyMesh = this.createOrc(position);
                break;
            case 'troll':
                enemyMesh = this.createTroll(position);
                break;
        }
        
        return {
            mesh: enemyMesh,
            type: type,
            health: this.getEnemyHealth(type),
            maxHealth: this.getEnemyHealth(type),
            damage: this.getEnemyDamage(type),
            speed: this.getEnemySpeed(type),
            range: this.getEnemyRange(type),
            attackSpeed: 2000, // 2 ثانیه
            lastAttack: 0,
            state: 'moving',
            target: null
        };
    }
    
    createGoblin(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder("goblinBody", {
            diameter: 0.4,
            height: 1.2,
            tessellation: 8
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("goblinHead", {
            diameter: 0.5,
            segments: 8
        }, this.scene);
        
        head.position.y = 0.9;
        
        const goblin = BABYLON.Mesh.MergeMeshes([body, head], true);
        goblin.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("goblinMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 0.6, 0);
        goblin.material = material;
        
        return goblin;
    }
    
    createOrc(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder("orcBody", {
            diameter: 0.6,
            height: 1.8,
            tessellation: 8
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("orcHead", {
            diameter: 0.7,
            segments: 8
        }, this.scene);
        
        head.position.y = 1.5;
        
        const orc = BABYLON.Mesh.MergeMeshes([body, head], true);
        orc.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("orcMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.1);
        orc.material = material;
        
        return orc;
    }
    
    createTroll(position) {
        const body = BABYLON.MeshBuilder.CreateCylinder("trollBody", {
            diameter: 0.8,
            height: 2.5,
            tessellation: 8
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("trollHead", {
            diameter: 0.9,
            segments: 8
        }, this.scene);
        
        head.position.y = 2;
        
        const troll = BABYLON.Mesh.MergeMeshes([body, head], true);
        troll.position.copyFrom(position);
        
        const material = new BABYLON.StandardMaterial("trollMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.1, 0.4, 0.1);
        troll.material = material;
        
        return troll;
    }
    
    getEnemyHealth(type) {
        const health = {
            goblin: 80,
            orc: 150,
            troll: 300
        };
        
        return health[type] || 100;
    }
    
    getEnemyDamage(type) {
        const damage = {
            goblin: 15,
            orc: 25,
            troll: 40
        };
        
        return damage[type] || 20;
    }
    
    getEnemySpeed(type) {
        const speed = {
            goblin: 1.2,
            orc: 0.9,
            troll: 0.6
        };
        
        return speed[type] || 1.0;
    }
    
    getEnemyRange(type) {
        const range = {
            goblin: 1.5,
            orc: 2,
            troll: 2.5
        };
        
        return range[type] || 2;
    }
    
    // سیستم صدا
    playSound(soundName) {
        // پیاده‌سازی سیستم صدا
        console.log(`پخش صدا: ${soundName}`);
    }
    
    // سیستم اطلاع‌رسانی
    showNotification(message) {
        // ایجاد اطلاع‌رسانی در بازی
        console.log(`📢 ${message}`);
        
        // در نسخه کامل، این پیام در رابط کاربری نمایش داده می‌شود
        if (typeof this.displayNotification === 'function') {
            this.displayNotification(message);
        }
    }
    
    // به‌روزرسانی رابط کاربری
    updateResourceUI() {
        // به‌روزرسانی نمایش منابع در رابط کاربری
        if (typeof this.updateUI === 'function') {
            this.updateUI();
        }
    }
    
    // متدهای کمکی
    getTribeStrength() {
        let strength = 0;
        
        // محاسبه قدرت قبیله بر اساس ساختمان‌ها و واحدها
        strength += this.tribeLayout.buildings.length * 10;
        strength += this.tribeLayout.defenses.length * 15;
        strength += this.tribeLayout.walls.length * 5;
        strength += this.units.length * 8;
        
        return strength;
    }
    
    getGameStats() {
        return {
            ...this.stats,
            tribeStrength: this.getTribeStrength(),
            resources: { ...this.resources },
            buildingsCount: this.tribeLayout.buildings.length + 
                          this.tribeLayout.barracks.length + 
                          this.tribeLayout.resources.length,
            defensesCount: this.tribeLayout.defenses.length + 
                          this.tribeLayout.walls.length,
            unitsCount: this.units.length
        };
    }
}

// ایجاد نمونه بازی پس از بارگذاری صفحه
window.addEventListener('DOMContentLoaded', async () => {
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
                loadingProgress.style.width = `${progress}%`;
                loadingText.textContent = `در حال بارگذاری... ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        
                        // راه‌اندازی موتور بازی
                        window.gameEngine = new AdvancedGameEngine();
                    }, 500);
                }
            }, 50);
        } else {
            // راه‌اندازی مستقیم اگر المان‌های بارگذاری وجود نداشتند
            window.gameEngine = new AdvancedGameEngine();
        }
    } catch (error) {
        console.error('خطا در راه‌اندازی بازی:', error);
        alert('متأسفانه خطایی در راه‌اندازی بازی رخ داده است. لطفاً صفحه را رفرش کنید.');
    }
});

console.log("🚀 فایل m1.js - موتور اصلی بازی بارگذاری شد");
