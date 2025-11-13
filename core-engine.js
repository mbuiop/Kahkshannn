// core-engine.js - موتور اصلی بازی با مدل‌های واقعی میوه
class CoreEngine {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.light = null;
        
        this.isInitialized = false;
        this.gameState = 'loading';
        this.selectedFruits = [];
        this.isDrawing = false;
        this.connectionLine = null;
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.connectionsMade = 0;
        this.connectionsNeeded = 10;
        this.timerInterval = null;
        this.fruitGrid = {};
        this.gridPositions = [];
        
        this.managers = new Map();
        
        this.init();
    }

    async init() {
        try {
            await this.initializeEngine();
            await this.initializeManagers();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Core Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Core Engine:', error);
        }
    }

    async initializeEngine() {
        this.canvas = document.getElementById('renderCanvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        this.engine = new BABYLON.Engine(this.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true
        });

        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1.0);

        this.createCamera();
        this.createLighting();
        this.createEnvironment();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        return this.engine;
    }

    async initializeManagers() {
        // ایجاد مدیران
        this.managers.set('scene', new SceneManager(this));
        this.managers.set('fruit', new FruitManager(this));
        this.managers.set('audio', new AudioManager(this));
        this.managers.set('animation', new AnimationManager(this));
        this.managers.set('particle', new ParticleManager(this));
        
        // راه‌اندازی مدیران
        for (const [name, manager] of this.managers) {
            if (manager.init) {
                await manager.init();
            }
        }
    }

    createCamera() {
        this.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            Math.PI / 2.5,
            20,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );

        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 30;
        this.camera.wheelPrecision = 50;
        this.camera.panningSensibility = 0;

        return this.camera;
    }

    createLighting() {
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        ambientLight.diffuse = new BABYLON.Color3(0.8, 0.8, 0.9);

        const mainLight = new BABYLON.DirectionalLight(
            "mainLight",
            new BABYLON.Vector3(-1, -2, -1),
            this.scene
        );
        mainLight.intensity = 0.8;
        mainLight.position = new BABYLON.Vector3(10, 20, 10);

        this.light = mainLight;
        return mainLight;
    }

    createEnvironment() {
        const ground = BABYLON.MeshBuilder.CreateGround(
            "ground",
            { width: 50, height: 50 },
            this.scene
        );

        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this.scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        groundMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.3);
        ground.material = groundMaterial;

        const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.1);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;

        this.createFruitGrid();

        return ground;
    }

    createFruitGrid() {
        this.fruitGrid = {};
        this.gridPositions = [];

        const rows = 5;
        const cols = 8;
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

        this.scene.onKeyboardObservable.add((kbInfo) => {
            this.handleKeyboardInput(kbInfo);
        });

        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }

    update() {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        
        const fruitManager = this.managers.get('fruit');
        if (fruitManager && fruitManager.update) {
            fruitManager.update(deltaTime);
        }
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
        this.onFruitDeselected();
    }

    handlePointerMove(pointerInfo) {
        if (this.gameState !== 'playing') return;
        
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

    onFruitSelected(fruitMesh) {
        if (!fruitMesh.userData || !fruitMesh.userData.isFruit) return;

        const fruitData = fruitMesh.userData;
        
        if (this.selectedFruits.length < 2 && !this.isFruitSelected(fruitData.index)) {
            this.selectedFruits.push(fruitData);
            
            this.highlightFruit(fruitMesh, true);
            
            if (this.selectedFruits.length === 1) {
                this.startConnectionLine(fruitMesh);
            } else if (this.selectedFruits.length === 2) {
                this.completeConnection();
            }
        }
    }

    onFruitDeselected() {
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
        const endPoint = pickResult.ray ? pickResult.pickedPoint : this.selectedFruits[0].position;

        const points = [
            this.selectedFruits[0].position,
            endPoint
        ];

        this.updateLinePoints(this.connectionLine, points);
    }

    completeConnection() {
        if (this.selectedFruits.length !== 2) return;

        const [fruit1, fruit2] = this.selectedFruits;
        
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
        this.selectedFruits.forEach(fruit => {
            const mesh = this.getFruitMeshByIndex(fruit.index);
            if (mesh) {
                this.highlightFruit(mesh, false);
            }
        });
        
        this.selectedFruits = [];
    }

    getFruitMeshByIndex(index) {
        const fruitData = this.fruitGrid[index];
        return fruitData ? fruitData.mesh : null;
    }

    checkFruitMatch(fruit1, fruit2) {
        return fruit1.type === fruit2.type && fruit1.index !== fruit2.index;
    }

    handleSuccessfulMatch(fruit1, fruit2) {
        const audioManager = this.managers.get('audio');
        if (audioManager) {
            audioManager.playSound('match');
        }

        const particleManager = this.managers.get('particle');
        if (particleManager) {
            particleManager.createMatchEffect(fruit1.position);
            particleManager.createMatchEffect(fruit2.position);
        }

        this.updateScore(50);

        this.removeFruit(fruit1.index);
        this.removeFruit(fruit2.index);

        this.spawnNewFruits(2);
    }

    handleFailedMatch(fruit1, fruit2) {
        const audioManager = this.managers.get('audio');
        if (audioManager) {
            audioManager.playSound('error');
        }

        this.updateScore(-10);
    }

    createLine(points, scene) {
        const lines = BABYLON.MeshBuilder.CreateLines("connectionLine", {
            points: points,
            updatable: true
        }, scene);

        lines.color = new BABYLON.Color3(1, 0.84, 0);
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
            mesh.outlineColor = new BABYLON.Color3(1, 0.84, 0);
            mesh.outlineWidth = 0.1;
        } else {
            mesh.renderOutline = false;
        }
    }

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
        this.clearAllFruits();
        this.spawnInitialFruits();
        this.updateUI();
    }

    spawnInitialFruits() {
        const fruitCount = 15;
        
        for (let i = 0; i < fruitCount; i++) {
            this.spawnRandomFruit();
        }
    }

    spawnRandomFruit() {
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            return fruitManager.spawnRandomFruit();
        }
        return null;
    }

    spawnNewFruits(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.spawnRandomFruit();
            }, i * 300);
        }
    }

    removeFruit(index) {
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            fruitManager.removeFruit(index);
        }
        
        delete this.fruitGrid[index];
    }

    clearAllFruits() {
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            fruitManager.clearAllFruits();
        }
        
        this.fruitGrid = {};
        this.gridPositions.forEach(pos => {
            pos.occupied = false;
        });
    }

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

    updateScore(points) {
        this.score = Math.max(0, this.score + points);
        this.connectionsMade++;
        this.updateScoreDisplay();
        this.updateConnectionsDisplay();
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timerValue');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
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
        console.log('Showing game hint');
        alert('میوه‌های همرنگ را به هم وصل کنید!');
    }

    toggleSound() {
        const audioManager = this.managers.get('audio');
        if (audioManager) {
            audioManager.toggleMute();
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.timerInterval);
        
        console.log('Game Over! Final Score:', this.score);
        alert(`بازی تمام شد! امتیاز نهایی: ${this.score}`);
    }

    isFruitSelected(index) {
        return this.selectedFruits.some(fruit => fruit.index === index);
    }

    dispose() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.managers.forEach(manager => {
            if (manager.dispose) {
                manager.dispose();
            }
        });
        
        if (this.engine) {
            this.engine.dispose();
        }
    }
}

window.CoreEngine = CoreEngine;
