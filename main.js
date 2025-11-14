class StrategicGame {
    constructor() {
        this.isInitialized = false;
        this.loadingProgress = 0;
        
        // تعریف موتور بازی به صورت ساده
        this.GameEngine = class {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.engine = new BABYLON.Engine(this.canvas, true);
                this.scene = null;
                this.camera = null;
            }
        };

        this.initializeGame();
    }

    async initializeGame() {
        try {
            this.showLoadingScreen();
            
            // مرحله ۱: راه‌اندازی موتور گرافیکی
            await this.initializeEngine();
            
            // مرحله ۲: راه‌اندازی سیستم‌های اصلی
            await this.initializeCoreSystems();
            
            // مرحله ۳: راه‌اندازی رابط کاربری
            await this.initializeUI();
            
            // مرحله ۴: راه‌اندازی نهایی
            await this.finalizeInitialization();
            
        } catch (error) {
            console.error('خطا در راه‌اندازی بازی:', error);
            this.showErrorScreen(error);
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const progressBar = document.getElementById('progressBar');
        const loadingText = document.getElementById('loadingText');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }

        this.updateLoadingProgress = (progress, message) => {
            this.loadingProgress = progress;
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            if (loadingText) {
                loadingText.textContent = `${message} (${Math.round(progress)}%)`;
            }
        };
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    async initializeEngine() {
        this.updateLoadingProgress(10, 'در حال راه‌اندازی موتور گرافیکی...');
        
        // ایجاد موتور بازی ساده
        this.gameEngine = {
            engine: new BABYLON.Engine(document.getElementById('gameCanvas'), true),
            scene: null,
            camera: null,
            shadowGenerator: null
        };
        
        // ایجاد صحنه
        this.gameEngine.scene = new BABYLON.Scene(this.gameEngine.engine);
        this.gameEngine.scene.clearColor = new BABYLON.Color4(0.47, 0.75, 1.0, 1.0);
        
        // ایجاد دوربین
        this.gameEngine.camera = new BABYLON.ArcRotateCamera(
            "camera", 
            -Math.PI / 2, 
            Math.PI / 2.5, 
            60, 
            new BABYLON.Vector3(0, 10, 0), 
            this.gameEngine.scene
        );
        this.gameEngine.camera.attachControl(this.gameEngine.engine.getRenderingCanvas(), true);
        this.gameEngine.camera.lowerRadiusLimit = 20;
        this.gameEngine.camera.upperRadiusLimit = 100;
        
        // ایجاد نور
        const light = new BABYLON.HemisphericLight(
            "light", 
            new BABYLON.Vector3(0, 1, 0), 
            this.gameEngine.scene
        );
        light.intensity = 0.8;

        // نور جهت‌دار برای سایه
        const dirLight = new BABYLON.DirectionalLight(
            "dirLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.gameEngine.scene
        );
        dirLight.intensity = 0.5;
        dirLight.shadowEnabled = true;
        
        // سایه‌ساز
        this.gameEngine.shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        this.gameEngine.shadowGenerator.useBlurExponentialShadowMap = true;
        
        // ایجاد زمین
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground", 
            { width: 200, height: 200, subdivisions: 100 }, 
            this.gameEngine.scene
        );
        
        const groundMaterial = new BABYLON.StandardMaterial("groundMat", this.gameEngine.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.3);
        
        // اضافه کردن تکسچر چمن
        groundMaterial.diffuseTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/grass.png", this.gameEngine.scene);
        groundMaterial.diffuseTexture.uScale = 20;
        groundMaterial.diffuseTexture.vScale = 20;
        
        ground.material = groundMaterial;
        ground.receiveShadows = true;
        
        // ایجاد آسمان
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.gameEngine.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.gameEngine.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        
        // استفاده از تکسچر آسمان آبی
        const skyTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/skybox/skybox2.png", this.gameEngine.scene);
        skyboxMaterial.diffuseTexture = skyTexture;
        skyboxMaterial.diffuseTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;

        // ایجاد چند درخت برای زیبایی
        this.createSampleTrees();
        
        this.updateLoadingProgress(30, 'موتور گرافیکی آماده!');
        
        // شروع رندر حلقه
        this.gameEngine.engine.runRenderLoop(() => {
            this.gameEngine.scene.render();
        });
        
        // مدیریت تغییر سایز پنجره
        window.addEventListener('resize', () => {
            this.gameEngine.engine.resize();
        });
    }

    createSampleTrees() {
        // ایجاد چند درخت نمونه
        const treePositions = [
            new BABYLON.Vector3(-30, 0, -30),
            new BABYLON.Vector3(25, 0, -35),
            new BABYLON.Vector3(-20, 0, 40),
            new BABYLON.Vector3(35, 0, 25)
        ];

        treePositions.forEach((position, index) => {
            this.createTree(position, index);
        });
    }

    createTree(position, index) {
        // تنه درخت
        const trunk = BABYLON.MeshBuilder.CreateCylinder(`treeTrunk${index}`, {
            height: 4,
            diameter: 0.8
        }, this.gameEngine.scene);

        // برگ‌ها
        const leaves = BABYLON.MeshBuilder.CreateSphere(`treeLeaves${index}`, {
            diameter: 5,
            segments: 8
        }, this.gameEngine.scene);

        trunk.position = position.clone();
        leaves.position = position.clone();
        leaves.position.y += 3;

        // متریال‌ها
        const trunkMaterial = new BABYLON.StandardMaterial(`trunkMat${index}`, this.gameEngine.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.35, 0.2, 0.1);
        
        const leavesMaterial = new BABYLON.StandardMaterial(`leavesMat${index}`, this.gameEngine.scene);
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);

        trunk.material = trunkMaterial;
        leaves.material = leavesMaterial;

        // سایه
        this.gameEngine.shadowGenerator.addShadowCaster(trunk);
        this.gameEngine.shadowGenerator.addShadowCaster(leaves);
    }

    async initializeCoreSystems() {
        this.updateLoadingProgress(40, 'در حال راه‌اندازی سیستم منابع...');
        
        // سیستم مدیریت منابع
        this.resourceManager = new SimpleResourceManager();
        
        this.updateLoadingProgress(50, 'در حال راه‌اندازی سیستم ساختمان‌ها...');
        
        // سیستم ساختمان‌ها
        this.buildingSystem = new SimpleBuildingSystem(this.gameEngine.scene, this.resourceManager);
        
        this.updateLoadingProgress(60, 'در حال راه‌اندازی سیستم نیروها...');
        
        // سیستم نیروها
        this.unitSystem = new SimpleUnitSystem(this.gameEngine.scene, this.resourceManager, this.buildingSystem);
        
        this.updateLoadingProgress(70, 'در حال راه‌اندازی سیستم نبرد...');
        
        // سیستم نبرد
        this.combatSystem = new SimpleCombatSystem(
            this.gameEngine.scene, 
            this.buildingSystem, 
            this.unitSystem, 
            this.resourceManager
        );
        
        this.updateLoadingProgress(80, 'سیستم‌های اصلی آماده!');
    }

    async initializeUI() {
        this.updateLoadingProgress(85, 'در حال راه‌اندازی رابط کاربری...');
        
        // مدیر رابط کاربری
        this.uiManager = new SimpleUIManager(
            this.gameEngine.scene,
            this,
            this.resourceManager,
            this.buildingSystem,
            this.unitSystem,
            this.combatSystem
        );
        
        this.updateLoadingProgress(90, 'در حال راه‌اندازی مدیریت ورودی...');
        
        // مدیر ورودی
        this.inputManager = new SimpleInputManager(this.gameEngine.scene, this.gameEngine.camera, this);
        
        this.updateLoadingProgress(95, 'در حال راه‌اندازی مدیریت حالت بازی...');
        
        // مدیر حالت بازی
        this.gameState = new SimpleGameState();
    }

    async finalizeInitialization() {
        this.updateLoadingProgress(98, 'در حال راه‌اندازی نهایی...');
        
        // اتصال به فضای جهانی برای دیباگ
        this.connectToGlobalScope();
        
        // شروع بازی
        this.startGame();
        
        this.updateLoadingProgress(100, 'آماده!');
        
        await this.delay(1000);
        
        this.hideLoadingScreen();
        this.isInitialized = true;
        
        console.log('🎮 بازی استراتژیک با موفقیت راه‌اندازی شد!');
        
        // نمایش پیام خوشامدگویی
        this.showWelcomeMessage();
    }

    connectToGlobalScope() {
        window.game = this;
        window.scene = this.gameEngine.scene;
        window.engine = this.gameEngine.engine;
        window.camera = this.gameEngine.camera;
        window.gameEngine = this.gameEngine; // اضافه کردن gameEngine به global
    }

    startGame() {
        // ایجاد ساختمان اولیه
        if (this.buildingSystem && this.buildingSystem.createBuilding) {
            this.buildingSystem.createBuilding('townhall', 0, 0, 1);
        }
        
        // شروع تایمرهای بازی
        this.startGameTimers();
    }

    startGameTimers() {
        // تایمر به‌روزرسانی منابع
        setInterval(() => {
            if (this.resourceManager && this.resourceManager.updateAutoProduction) {
                this.resourceManager.updateAutoProduction();
            }
        }, 1000);
        
        // تایمر به‌روزرسانی رابط کاربری
        setInterval(() => {
            if (this.uiManager && this.uiManager.updateUI) {
                this.uiManager.updateUI();
            }
        }, 1000);
    }

    showWelcomeMessage() {
        const message = "🎮 به بازی استراتژیک سینمایی خوش آمدید!\n\n" +
                       "برای شروع بازی:\n" +
                       "• روی دکمه 🏗️ ساخت کلیک کنید\n" +
                       "• ساختمان‌های مختلف بسازید\n" +
                       "• نیرو آموزش دهید\n" +
                       "• به دشمنان حمله کنید!";
        
        if (this.uiManager) {
            this.uiManager.showNotification(message, 8000);
        }
    }

    showErrorScreen(error) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center; color: white; padding: 20px;">
                    <h1 style="color: #ff4444; margin-bottom: 20px;">❌ خطا در راه‌اندازی بازی</h1>
                    <p style="margin-bottom: 10px; font-size: 18px;">${error.message || 'خطای ناشناخته'}</p>
                    <p style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">
                        لطفاً کنسول مرورگر را بررسی کنید (F12)
                    </p>
                    <button onclick="location.reload()" style="
                        background: #ff4444;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        margin: 10px;
                    ">بارگذاری مجدد بازی</button>
                </div>
            `;
        }
    }

    // ابزارک‌های کمکی
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // مدیریت بازی
    pauseGame() {
        this.isPaused = true;
        console.log('بازی متوقف شد');
    }

    resumeGame() {
        this.isPaused = false;
        console.log('بازی ادامه یافت');
    }

    // تمیزکاری
    dispose() {
        if (this.gameEngine.engine) {
            this.gameEngine.engine.stopRenderLoop();
            this.gameEngine.engine.dispose();
        }
        console.log('بازی متوقف و تمیزکاری شد');
    }
}

// پیاده‌سازی ساده‌شده کلاس‌های اصلی
class SimpleResourceManager {
    constructor() {
        this.resources = {
            gold: 1000,
            elixir: 1000,
            gem: 50
        };
        console.log('✅ مدیر منابع ساده راه‌اندازی شد');
    }
    
    updateAutoProduction() {
        // تولید خودکار ساده
        this.resources.gold += 1;
        this.resources.elixir += 0.5;
    }

    addResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;
        }
    }
}

class SimpleBuildingSystem {
    constructor(scene, resourceManager) {
        this.scene = scene;
        this.resourceManager = resourceManager;
        this.buildings = new Map();
        this.ghostMesh = null;
        this.currentBuildingType = null;
        console.log('✅ سیستم ساختمان‌های ساده راه‌اندازی شد');
    }
    
    createBuilding(type, x, z, level) {
        const buildingId = 'building_' + Date.now();
        
        let mesh;
        let color;
        
        switch(type) {
            case 'townhall':
                mesh = BABYLON.MeshBuilder.CreateCylinder("townhall", { 
                    height: 6, 
                    diameterTop: 0, 
                    diameterBottom: 8,
                    tessellation: 6 
                }, this.scene);
                color = new BABYLON.Color3(1, 0.8, 0.2);
                break;
            case 'mine':
                mesh = BABYLON.MeshBuilder.CreateCylinder("mine", { 
                    height: 4, 
                    diameter: 6,
                    tessellation: 8 
                }, this.scene);
                color = new BABYLON.Color3(1, 0.8, 0);
                break;
            case 'barracks':
                mesh = BABYLON.MeshBuilder.CreateBox("barracks", { 
                    width: 6, 
                    height: 4, 
                    depth: 6 
                }, this.scene);
                color = new BABYLON.Color3(0.2, 0.6, 1);
                break;
            default:
                mesh = BABYLON.MeshBuilder.CreateBox("building", { 
                    width: 4, 
                    height: 3, 
                    depth: 4 
                }, this.scene);
                color = new BABYLON.Color3(0.5, 0.5, 0.5);
        }
        
        const material = new BABYLON.StandardMaterial("buildingMat", this.scene);
        material.diffuseColor = color;
        material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        
        mesh.position = new BABYLON.Vector3(x, mesh.getBoundingInfo().boundingBox.extendSize.y, z);
        mesh.material = material;
        
        const building = {
            id: buildingId,
            type: type,
            level: level,
            position: mesh.position,
            mesh: mesh
        };
        
        this.buildings.set(buildingId, building);
        console.log(`ساختمان ${type} ساخته شد`);
        
        return buildingId;
    }

    startBuildingPlacement(buildingType) {
        this.currentBuildingType = buildingType;
        this.createGhostBuilding(buildingType);
    }

    createGhostBuilding(buildingType) {
        if (this.ghostMesh) {
            this.ghostMesh.dispose();
        }

        // ایجاد مدل شفاف برای پیش‌نمایش
        this.ghostMesh = BABYLON.MeshBuilder.CreateBox("ghostBuilding", {
            width: 4,
            height: 2,
            depth: 4
        }, this.scene);

        const ghostMaterial = new BABYLON.StandardMaterial("ghostMat", this.scene);
        ghostMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        ghostMaterial.alpha = 0.5;
        this.ghostMesh.material = ghostMaterial;

        // دنبال کردن موس
        this.scene.onPointerMove = (evt) => {
            if (this.ghostMesh && this.currentBuildingType) {
                const pickResult = this.scene.pick(evt.clientX, evt.clientY);
                if (pickResult.hit) {
                    this.ghostMesh.position = pickResult.pickedPoint;
                    this.ghostMesh.position.y = 1;
                }
            }
        };

        // قرار دادن ساختمان با کلیک
        this.scene.onPointerDown = (evt) => {
            if (this.ghostMesh && this.currentBuildingType) {
                const pickResult = this.scene.pick(evt.clientX, evt.clientY);
                if (pickResult.hit) {
                    this.createBuilding(this.currentBuildingType, 
                                      pickResult.pickedPoint.x, 
                                      pickResult.pickedPoint.z, 1);
                    this.ghostMesh.dispose();
                    this.ghostMesh = null;
                    this.currentBuildingType = null;
                    
                    // بازنشانی event handlers
                    this.scene.onPointerMove = null;
                    this.scene.onPointerDown = null;
                }
            }
        };
    }
}

class SimpleUnitSystem {
    constructor(scene, resourceManager, buildingSystem) {
        this.scene = scene;
        this.resourceManager = resourceManager;
        this.buildingSystem = buildingSystem;
        this.units = new Map();
        this.selectedUnits = new Set();
        console.log('✅ سیستم نیروهای ساده راه‌اندازی شد');
    }

    trainUnit(unitType, barracksId) {
        console.log(`آموزش ${unitType} آغاز شد`);
        // اینجا می‌توانید منطق آموزش واحد را اضافه کنید
    }

    selectUnit(unitId, addToSelection = false) {
        if (!addToSelection) {
            this.selectedUnits.clear();
        }
        this.selectedUnits.add(unitId);
    }

    clearSelection() {
        this.selectedUnits.clear();
    }

    moveSelectedUnitsTo(position) {
        console.log(`حرکت ${this.selectedUnits.size} واحد به موقعیت`, position);
        // اینجا می‌توانید منطق حرکت واحدها را اضافه کنید
    }
}

class SimpleCombatSystem {
    constructor(scene, buildingSystem, unitSystem, resourceManager) {
        this.scene = scene;
        this.buildingSystem = buildingSystem;
        this.unitSystem = unitSystem;
        this.resourceManager = resourceManager;
        this.attackMode = false;
        console.log('✅ سیستم نبرد ساده راه‌اندازی شد');
    }

    startAttackMode(targetBaseData) {
        this.attackMode = true;
        console.log('حالت حمله فعال شد:', targetBaseData);
    }

    deployUnitsAtPosition(position) {
        if (this.attackMode) {
            console.log('استقرار نیرو در موقعیت:', position);
        }
    }
}

class SimpleUIManager {
    constructor(scene, game, resourceManager, buildingSystem, unitSystem, combatSystem) {
        this.scene = scene;
        this.game = game;
        this.resourceManager = resourceManager;
        this.buildingSystem = buildingSystem;
        this.unitSystem = unitSystem;
        this.combatSystem = combatSystem;
        console.log('✅ مدیر رابط کاربری ساده راه‌اندازی شد');
        
        this.createSimpleUI();
    }

    createSimpleUI() {
        // ایجاد یک UI ساده با HTML
        this.createResourceDisplay();
        this.createActionButtons();
    }

    createResourceDisplay() {
        const resourceContainer = document.createElement('div');
        resourceContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-family: Arial, sans-serif;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            gap: 30px;
            z-index: 1000;
            backdrop-filter: blur(10px);
            border: 2px solid gold;
        `;

        const goldDisplay = this.createResourceElement('💰', 'goldAmount', '1000');
        const elixirDisplay = this.createResourceElement('⚗️', 'elixirAmount', '1000');
        const gemDisplay = this.createResourceElement('💎', 'gemAmount', '50');

        resourceContainer.appendChild(goldDisplay);
        resourceContainer.appendChild(elixirDisplay);
        resourceContainer.appendChild(gemDisplay);

        document.body.appendChild(resourceContainer);
        this.resourceContainer = resourceContainer;
    }

    createResourceElement(icon, id, initialValue) {
        const element = document.createElement('div');
        element.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        element.innerHTML = `
            <span>${icon}</span>
            <span id="${id}">${initialValue}</span>
        `;
        return element;
    }

    createActionButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 15px;
            z-index: 1000;
        `;

        const buttons = [
            { icon: '🏗️', text: 'ساخت', action: () => this.showBuildingMenu() },
            { icon: '⚔️', text: 'حمله', action: () => this.startAttackMode() },
            { icon: '👥', text: 'نیروها', action: () => this.showUnitMenu() },
            { icon: '🗺️', text: 'نقشه', action: () => this.showMap() },
            { icon: '⚙️', text: 'منو', action: () => this.showMenu() }
        ];

        buttons.forEach(buttonConfig => {
            const button = this.createActionButton(buttonConfig);
            buttonContainer.appendChild(button);
        });

        document.body.appendChild(buttonContainer);
    }

    createActionButton(config) {
        const button = document.createElement('button');
        button.style.cssText = `
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            width: 70px;
            height: 70px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;
        
        button.innerHTML = `
            <div>${config.icon}</div>
            <div style="font-size: 12px; margin-top: 2px;">${config.text}</div>
        `;

        button.onmouseenter = () => {
            button.style.background = 'rgba(255, 255, 255, 0.2)';
            button.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            button.style.transform = 'scale(1.1)';
        };

        button.onmouseleave = () => {
            button.style.background = 'rgba(0, 0, 0, 0.7)';
            button.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            button.style.transform = 'scale(1.0)';
        };

        button.onclick = config.action;

        return button;
    }

    showBuildingMenu() {
        this.showNotification('منوی ساخت باز شد! ساختمان مورد نظر را انتخاب کنید.');
        
        // نمایش پالت ساختمان‌ها
        this.showBuildingPalette();
    }

    showBuildingPalette() {
        const palette = document.createElement('div');
        palette.style.cssText = `
            position: fixed;
            bottom: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 20px;
            display: flex;
            gap: 15px;
            z-index: 1001;
            backdrop-filter: blur(15px);
            border: 2px solid gold;
        `;

        const buildings = [
            { type: 'mine', icon: '💰', name: 'معدن', cost: '150 طلا' },
            { type: 'barracks', icon: '⚔️', name: 'سربازخانه', cost: '200 طلا' },
            { type: 'wall', icon: '🧱', name: 'دیوار', cost: '50 طلا' },
            { type: 'cannon', icon: '🔫', name: 'توپخانه', cost: '250 طلا' }
        ];

        buildings.forEach(building => {
            const buildingButton = document.createElement('div');
            buildingButton.style.cssText = `
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 15px;
                text-align: center;
                cursor: pointer;
                min-width: 80px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
            
            buildingButton.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">${building.icon}</div>
                <div style="font-size: 12px; margin-bottom: 4px;">${building.name}</div>
                <div style="font-size: 10px; color: gold;">${building.cost}</div>
            `;

            buildingButton.onmouseenter = () => {
                buildingButton.style.background = 'rgba(255, 255, 255, 0.2)';
                buildingButton.style.transform = 'scale(1.05)';
            };

            buildingButton.onmouseleave = () => {
                buildingButton.style.background = 'rgba(255, 255, 255, 0.1)';
                buildingButton.style.transform = 'scale(1.0)';
            };

            buildingButton.onclick = () => {
                this.selectBuilding(building.type);
                document.body.removeChild(palette);
            };

            palette.appendChild(buildingButton);
        });

        // دکمه بستن
        const closeButton = document.createElement('div');
        closeButton.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            background: red;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
        `;
        closeButton.textContent = '×';
        closeButton.onclick = () => {
            document.body.removeChild(palette);
        };
        palette.appendChild(closeButton);

        document.body.appendChild(palette);
    }

    selectBuilding(buildingType) {
        if (this.buildingSystem) {
            this.buildingSystem.startBuildingPlacement(buildingType);
            this.showNotification(`ساخت ${this.getBuildingName(buildingType)} انتخاب شد`);
        }
    }

    getBuildingName(type) {
        const names = {
            'mine': 'معدن طلا',
            'barracks': 'سربازخانه',
            'wall': 'دیوار دفاعی',
            'cannon': 'توپخانه'
        };
        return names[type] || type;
    }

    startAttackMode() {
        if (this.combatSystem) {
            this.combatSystem.startAttackMode({
                name: "پایگاه دشمن سطح ۱",
                difficulty: "آسان"
            });
            this.showNotification('حالت حمله فعال شد! نیروها را مستقر کنید.');
        }
    }

    showUnitMenu() {
        this.showNotification('منوی نیروها باز شد!');
    }

    showMap() {
        this.showNotification('نقشه جهان به زودی در دسترس خواهد بود');
    }

    showMenu() {
        this.showNotification('منوی بازی به زودی در دسترس خواهد بود');
    }

    showNotification(message, duration = 3000) {
        console.log('📢 ' + message);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            border: 3px solid gold;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }
        }, duration);
    }

    updateUI() {
        this.updateResourceDisplay();
    }

    updateResourceDisplay() {
        if (this.resourceManager) {
            const goldElement = document.getElementById('goldAmount');
            const elixirElement = document.getElementById('elixirAmount');
            const gemElement = document.getElementById('gemAmount');
            
            if (goldElement) goldElement.textContent = Math.floor(this.resourceManager.resources.gold);
            if (elixirElement) elixirElement.textContent = Math.floor(this.resourceManager.resources.elixir);
            if (gemElement) gemElement.textContent = Math.floor(this.resourceManager.resources.gem);
        }
    }
}

class SimpleInputManager {
    constructor(scene, camera, gameEngine) {
        this.scene = scene;
        this.camera = camera;
        this.gameEngine = gameEngine;
        console.log('✅ مدیر ورودی ساده راه‌اندازی شد');
    }
}

class SimpleGameState {
    constructor() {
        console.log('✅ مدیر حالت بازی ساده راه‌اندازی شد');
    }
}

// راه‌اندازی بازی وقتی DOM آماده شد
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM آماده است، شروع راه‌اندازی بازی...');
    
    // ایجاد نمونه بازی
    window.strategicGame = new StrategicGame();
    
    // مدیریت بسته شدن صفحه
    window.addEventListener('beforeunload', () => {
        if (window.strategicGame) {
            window.strategicGame.dispose();
        }
    });
    
    // مدیریت خطاهای全局
    window.addEventListener('error', (event) => {
        console.error('خطای全局:', event.error);
    });
});
