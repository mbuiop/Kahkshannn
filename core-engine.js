// core-engine.js - موتور اصلی بازی با Babylon.js
class CoreEngine {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.light = null;
        
        this.isInitialized = false;
        this.gameState = 'loading'; // loading, menu, playing, paused, gameOver
        
        this.init();
    }

    async init() {
        try {
            await this.initializeEngine();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Core Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Core Engine:', error);
        }
    }

    async initializeEngine() {
        // ایجاد موتور Babylon.js
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });

        // ایجاد صحنه
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        // ایجاد دوربین
        this.createCamera();

        // ایجاد نورپردازی
        this.createLighting();

        // ایجاد محیط
        this.createEnvironment();

        // راه‌اندازی رندر
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // مدیریت تغییر سایز
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        return this.engine;
    }

    createCamera() {
        // ایجاد دوربین آرک-روتیت
        this.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            Math.PI / 2.5,
            15,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );

        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 8;
        this.camera.upperRadiusLimit = 25;
        this.camera.wheelPrecision = 50;
        this.camera.panningSensibility = 0;

        // ایجاد دوربین UI برای عناصر رابط کاربری
        this.uiCamera = new BABYLON.FreeCamera("uiCamera", new BABYLON.Vector3(0, 0, -10), this.scene);
        this.uiCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.uiCamera.layerMask = 0x10000000;

        return this.camera;
    }

    createLighting() {
        // نور محیطی
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        ambientLight.diffuse = new BABYLON.Color3(0.8, 0.8, 0.9);

        // نور جهت‌دار اصلی
        const mainLight = new BABYLON.DirectionalLight(
            "mainLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        mainLight.intensity = 0.8;
        mainLight.position = new BABYLON.Vector3(10, 20, 10);
        mainLight.shadowEnabled = true;

        // نور نقطه‌ای برای جلوه‌های ویژه
        const pointLight = new BABYLON.PointLight(
            "pointLight",
            new BABYLON.Vector3(0, 5, 0),
            this.scene
        );
        pointLight.intensity = 0.3;
        pointLight.diffuse = new BABYLON.Color3(1, 0.8, 0.6);

        this.light = mainLight;
        return mainLight;
    }

    createEnvironment() {
        // ایجاد زمین
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 50, height: 50 },
            this.scene
        );

        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        ground.material = groundMaterial;
        ground.receiveShadows = true;

        // ایجاد آسمان
        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;

        // ایجاد شبکه میوه‌ها
        this.createFruitGrid();

        return ground;
    }

    createFruitGrid() {
        // ایجاد شبکه 5x8 برای میوه‌ها
        this.fruitGrid = [];
        this.gridPositions = [];

        const rows = 8;
        const cols = 5;
        const spacing = 2.5;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col - (cols - 1) / 2) * spacing;
                const y = 1.5;
                const z = (row - (rows - 1) / 2) * spacing;

                this.gridPositions.push({
                    row: row,
                    col: col,
                    index: row * cols + col,
                    position: new BABYLON.Vector3(x, y, z),
                    occupied: false
                });
            }
        }

        console.log(`Grid created with ${this.gridPositions.length} positions`);
        return this.gridPositions;
    }

    setupEventListeners() {
        // مدیریت کلیک‌ها
        this.scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    this.handlePointerDown(pointerInfo);
                    break;
                case BABYLON.PointerEventTypes.POINTERUP:
                    this.handlePointerUp(pointerInfo);
                    break;
                case BABYLON.PointerEventTypes.POINTERMOVE:
                    this.handlePointerMove(pointerInfo);
                    break;
            }
        });

        // مدیریت صفحه‌کلید
        this.scene.onKeyboardObservable.add((kbInfo) => {
            this.handleKeyboardInput(kbInfo);
        });

        // مدیریت لمس برای موبایل
        this.setupTouchControls();
    }

    handlePointerDown(pointerInfo) {
        if (this.gameState !== 'playing') return;

        const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
        
        if (pickResult.hit && pickResult.pickedMesh) {
            const fruitMesh = pickResult.pickedMesh;
            this.onFruitSelected(fruitMesh);
        }
    }

    handlePointerUp(pointerInfo) {
        if (this.gameState !== 'playing') return;
        
        // مدیریت رها کردن میوه
        this.onFruitDeselected();
    }

    handlePointerMove(pointerInfo) {
        if (this.gameState !== 'playing') return;
        
        // مدیریت کشیدن خط
        if (this.isDrawing) {
            this.updateConnectionLine(pointerInfo);
        }
    }

    handleKeyboardInput(kbInfo) {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            switch (kbInfo.event.key) {
                case ' ':
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.restartGame();
                    break;
                case 'h':
                case 'H':
                    this.showHint();
                    break;
                case 'm':
                case 'M':
                    this.toggleSound();
                    break;
            }
        }
    }

    setupTouchControls() {
        let touchStart = null;
        let currentFruit = null;

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStart = { x: touch.clientX, y: touch.clientY };
            
            const pickResult = this.scene.pick(touch.clientX, touch.clientY);
            if (pickResult.hit && pickResult.pickedMesh) {
                currentFruit = pickResult.pickedMesh;
                this.onFruitSelected(currentFruit);
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (currentFruit) {
                this.onFruitDeselected();
                currentFruit = null;
            }
            touchStart = null;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (touchStart && currentFruit) {
                // مدیریت کشیدن برای موبایل
            }
        });
    }

    // متدهای اصلی بازی
    onFruitSelected(fruitMesh) {
        if (!fruitMesh.userData || !fruitMesh.userData.isFruit) return;

        const fruitData = fruitMesh.userData;
        
        if (this.selectedFruits.length < 2 && !this.isFruitSelected(fruitData.index)) {
            this.selectedFruits.push(fruitData);
            
            // هایلایت میوه انتخاب شده
            this.highlightFruit(fruitMesh, true);
            
            // ایجاد خط اتصال
            if (this.selectedFruits.length === 1) {
                this.startConnectionLine(fruitMesh);
            } else if (this.selectedFruits.length === 2) {
                this.completeConnection();
            }
        }
    }

    onFruitDeselected() {
        // مدیریت رها کردن
        if (this.selectedFruits.length === 1) {
            this.cancelConnection();
        }
    }

    startConnectionLine(startFruit) {
        this.isDrawing = true;
        this.connectionLine = this.createLine([startFruit.position], this.scene);
    }

    updateConnectionLine(pointerInfo) {
        if (!this.connectionLine || this.selectedFruits.length !== 1) return;

        const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
        const endPoint = pickResult.ray?.origin || this.selectedFruits[0].position;

        const points = [
            this.selectedFruits[0].position,
            endPoint
        ];

        this.updateLinePoints(this.connectionLine, points);
    }

    completeConnection() {
        if (this.selectedFruits.length !== 2) return;

        const [fruit1, fruit2] = this.selectedFruits;
        
        // بررسی تطابق
        if (this.checkFruitMatch(fruit1, fruit2)) {
            this.handleSuccessfulMatch(fruit1, fruit2);
        } else {
            this.handleFailedMatch(fruit1, fruit2);
        }

        this.clearSelection();
        this.isDrawing = false;
    }

    cancelConnection() {
        this.clearSelection();
        this.isDrawing = false;
        
        if (this.connectionLine) {
            this.connectionLine.dispose();
            this.connectionLine = null;
        }
    }

    clearSelection() {
        // حذف هایلایت از همه میوه‌های انتخاب شده
        this.selectedFruits.forEach(fruit => {
            const mesh = this.scene.getMeshByName(`fruit_${fruit.index}`);
            if (mesh) {
                this.highlightFruit(mesh, false);
            }
        });
        
        this.selectedFruits = [];
    }

    checkFruitMatch(fruit1, fruit2) {
        return fruit1.type === fruit2.type && fruit1.index !== fruit2.index;
    }

    handleSuccessfulMatch(fruit1, fruit2) {
        // پخش صدا
        if (window.audioManager) {
            window.audioManager.playMatchSound();
        }

        // نمایش افکت
        if (window.particleManager) {
            window.particleManager.createMatchEffect(fruit1.position);
            window.particleManager.createMatchEffect(fruit2.position);
        }

        // به‌روزرسانی امتیاز
        this.updateScore(50);

        // حذف میوه‌ها
        this.removeFruit(fruit1.index);
        this.removeFruit(fruit2.index);

        // ایجاد میوه‌های جدید
        this.spawnNewFruits(2);
    }

    handleFailedMatch(fruit1, fruit2) {
        // پخش صدا
        if (window.audioManager) {
            window.audioManager.playErrorSound();
        }

        // کاهش امتیاز
        this.updateScore(-10);
    }

    // متدهای گرافیکی
    createLine(points, scene) {
        const lines = BABYLON.MeshBuilder.CreateLines("connectionLine", {
            points: points,
            updatable: true
        }, scene);

        lines.color = new BABYLON.Color3(1, 0.84, 0); // طلایی
        lines.alpha = 0.8;

        return lines;
    }

    updateLinePoints(line, points) {
        BABYLON.MeshBuilder.CreateLines("connectionLine", {
            points: points,
            instance: line
        });
    }

    highlightFruit(mesh, highlight) {
        if (highlight) {
            mesh.renderOutline = true;
            mesh.outlineColor = new BABYLON.Color3(1, 0.84, 0); // طلایی
            mesh.outlineWidth = 0.1;
        } else {
            mesh.renderOutline = false;
        }
    }

    // متدهای مدیریت بازی
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.connectionsMade = 0;
        this.connectionsNeeded = 10;
        this.selectedFruits = [];
        this.isDrawing = false;

        this.initializeGame();
        this.startTimer();
    }

    initializeGame() {
        // پاک کردن میوه‌های موجود
        this.clearAllFruits();

        // ایجاد میوه‌های اولیه
        this.spawnInitialFruits();

        // به‌روزرسانی رابط کاربری
        this.updateUI();
    }

    spawnInitialFruits() {
        const fruitCount = 20; // 8x5 = 40 موقعیت، اما شروع با 20 میوه
        
        for (let i = 0; i < fruitCount; i++) {
            this.spawnRandomFruit();
        }
    }

    spawnRandomFruit() {
        const availablePositions = this.gridPositions.filter(pos => !pos.occupied);
        if (availablePositions.length === 0) return null;

        const randomPos = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        const fruitType = this.getRandomFruitType();

        const fruit = this.createFruitMesh(fruitType, randomPos.position, randomPos.index);
        
        if (fruit) {
            randomPos.occupied = true;
            this.fruitGrid[randomPos.index] = {
                mesh: fruit,
                type: fruitType,
                index: randomPos.index,
                position: randomPos.position
            };
        }

        return fruit;
    }

    spawnNewFruits(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.spawnRandomFruit();
            }, i * 200);
        }
    }

    removeFruit(index) {
        const fruitData = this.fruitGrid[index];
        if (fruitData && fruitData.mesh) {
            // انیمیشن محو شدن
            this.animateFruitRemoval(fruitData.mesh);
            
            // آزاد کردن موقعیت
            const gridPos = this.gridPositions.find(pos => pos.index === index);
            if (gridPos) {
                gridPos.occupied = false;
            }
            
            // حذف از آرایه
            delete this.fruitGrid[index];
        }
    }

    animateFruitRemoval(mesh) {
        const frames = [
            { frame: 0, scaling: new BABYLON.Vector3(1, 1, 1) },
            { frame: 10, scaling: new BABYLON.Vector3(1.2, 1.2, 1.2) },
            { frame: 20, scaling: new BABYLON.Vector3(0, 0, 0) }
        ];

        const animation = new BABYLON.Animation(
            "removalAnimation",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        animation.setKeys(frames);
        mesh.animations = [animation];
        
        this.scene.beginAnimation(mesh, 0, 20, false, 1, () => {
            mesh.dispose();
        });
    }

    clearAllFruits() {
        Object.values(this.fruitGrid).forEach(fruitData => {
            if (fruitData.mesh) {
                fruitData.mesh.dispose();
            }
        });
        
        this.fruitGrid = {};
        this.gridPositions.forEach(pos => {
            pos.occupied = false;
        });
    }

    // متدهای کاربردی
    getRandomFruitType() {
        const fruits = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon'];
        return fruits[Math.floor(Math.random() * fruits.length)];
    }

    createFruitMesh(type, position, index) {
        let mesh;
        let material;

        switch (type) {
            case 'apple':
                mesh = BABYLON.MeshBuilder.CreateSphere(`fruit_${index}`, { diameter: 1 }, this.scene);
                material = new BABYLON.StandardMaterial(`fruit_mat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(1, 0, 0); // قرمز
                break;
            case 'banana':
                mesh = BABYLON.MeshBuilder.CreateCylinder(`fruit_${index}`, { height: 1.5, diameter: 0.5 }, this.scene);
                material = new BABYLON.StandardMaterial(`fruit_mat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(1, 1, 0); // زرد
                break;
            case 'orange':
                mesh = BABYLON.MeshBuilder.CreateSphere(`fruit_${index}`, { diameter: 1 }, this.scene);
                material = new BABYLON.StandardMaterial(`fruit_mat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(1, 0.5, 0); // نارنجی
                break;
            case 'grape':
                mesh = BABYLON.MeshBuilder.CreateSphere(`fruit_${index}`, { diameter: 0.7 }, this.scene);
                material = new BABYLON.StandardMaterial(`fruit_mat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(0.5, 0, 0.5); // بنفش
                break;
            case 'strawberry':
                mesh = BABYLON.MeshBuilder.CreateSphere(`fruit_${index}`, { diameter: 0.9 }, this.scene);
                material = new BABYLON.StandardMaterial(`fruit_mat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2); // قرمز تیره
                break;
            case 'watermelon':
                mesh = BABYLON.MeshBuilder.CreateSphere(`fruit_${index}`, { diameter: 1.2 }, this.scene);
                material = new BABYLON.StandardMaterial(`fruit_mat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(0, 0.8, 0); // سبز
                break;
            default:
                mesh = BABYLON.MeshBuilder.CreateSphere(`fruit_${index}`, { diameter: 1 }, this.scene);
                material = new BABYLON.StandardMaterial(`fruit_mat_${index}`, this.scene);
                material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        }

        mesh.material = material;
        mesh.position = position;
        mesh.userData = {
            isFruit: true,
            type: type,
            index: index
        };

        // اضافه کردن انیمیشن شناور
        this.addFloatingAnimation(mesh);

        return mesh;
    }

    addFloatingAnimation(mesh) {
        const amplitude = 0.1;
        const frequency = 2;

        this.scene.registerBeforeRender(() => {
            mesh.position.y = mesh.userData.originalY + Math.sin(Date.now() * 0.001 * frequency) * amplitude;
        });

        mesh.userData.originalY = mesh.position.y;
    }

    // متدهای تایمر و امتیاز
    startTimer() {
        this.timeLeft = 60;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timerValue');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
        }
    }

    updateScore(points) {
        this.score = Math.max(0, this.score + points);
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    updateConnectionsDisplay() {
        const connElement = document.getElementById('connectionValue');
        if (connElement) {
            connElement.textContent = `${this.connectionsMade}/${this.connectionsNeeded}`;
        }
    }

    updateUI() {
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.updateConnectionsDisplay();
        
        const levelElement = document.getElementById('levelValue');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }

    // متدهای کنترل بازی
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.timerInterval);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimer();
        }
    }

    restartGame() {
        clearInterval(this.timerInterval);
        this.startGame();
    }

    showHint() {
        // نمایش راهنمای بازی
        console.log('Showing game hint');
    }

    toggleSound() {
        if (window.audioManager) {
            window.audioManager.toggleMute();
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.timerInterval);
        
        // نمایش صفحه پایان بازی
        console.log('Game Over! Final Score:', this.score);
    }

    // متدهای کمکی
    isFruitSelected(index) {
        return this.selectedFruits.some(fruit => fruit.index === index);
    }

    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
        if (this.scene) {
            this.scene.dispose();
        }
    }
}

// ایجاد نمونه جهانی
window.CoreEngine = CoreEngine;