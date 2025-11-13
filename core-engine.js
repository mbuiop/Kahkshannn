// core-engine.js - بازی واقعی اتصال میوه
class CoreEngine {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.light = null;
        
        this.gameState = 'menu';
        this.selectedFruits = [];
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.connectionsMade = 0;
        this.connectionsNeeded = 10;
        this.timerInterval = null;
        
        this.fruits = [];
        this.grid = [];
        
        this.init();
    }

    async init() {
        try {
            await this.initializeEngine();
            this.createGameGrid();
            this.setupEventListeners();
            console.log('بازی آماده است!');
        } catch (error) {
            console.error('خطا در بارگذاری بازی:', error);
        }
    }

    async initializeEngine() {
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.2, 0.3, 1.0);

        // دوربین ثابت از بالا
        this.camera = new BABYLON.ArcRotateCamera(
            "camera", 
            -Math.PI / 2, 
            Math.PI / 2, 
            15, 
            BABYLON.Vector3.Zero(), 
            this.scene
        );
        this.camera.attachControl(this.canvas, false);
        this.camera.inputs.attached.keyboard.detachControl();

        // نورپردازی
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;

        // زمین
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, this.scene);
        const groundMat = new BABYLON.StandardMaterial("groundMat", this.scene);
        groundMat.diffuseColor = new BABYLON.Color3(0.3, 0.6, 0.3);
        ground.material = groundMat;

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    createGameGrid() {
        this.grid = [];
        const rows = 5;
        const cols = 8;
        const spacing = 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = (col - cols/2) * spacing + 1;
                const z = (row - rows/2) * spacing + 1;
                
                this.grid.push({
                    row: row,
                    col: col,
                    position: new BABYLON.Vector3(x, 0.5, z),
                    occupied: false,
                    fruit: null
                });
            }
        }
    }

    setupEventListeners() {
        this.scene.onPointerDown = (evt, pickResult) => {
            if (this.gameState !== 'playing') return;
            
            if (pickResult.hit) {
                const mesh = pickResult.pickedMesh;
                if (mesh && mesh.userData && mesh.userData.isFruit) {
                    this.onFruitClick(mesh);
                }
            }
        };
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.connectionsMade = 0;
        this.selectedFruits = [];
        
        this.clearFruits();
        this.createInitialFruits();
        this.startTimer();
        this.updateUI();
        
        console.log('بازی شروع شد!');
    }

    createInitialFruits() {
        const fruitTypes = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon'];
        const emptySlots = this.grid.filter(cell => !cell.occupied);
        
        // ایجاد 15 میوه اولیه
        for (let i = 0; i < 15 && i < emptySlots.length; i++) {
            const cell = emptySlots[i];
            const fruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            this.createFruit(fruitType, cell);
        }
    }

    createFruit(type, cell) {
        let fruitMesh;
        const color = this.getFruitColor(type);

        switch(type) {
            case 'apple':
                fruitMesh = BABYLON.MeshBuilder.CreateSphere("apple", {diameter: 1.2}, this.scene);
                break;
            case 'banana':
                fruitMesh = BABYLON.MeshBuilder.CreateCylinder("banana", {
                    height: 1.5, 
                    diameter: 0.6
                }, this.scene);
                fruitMesh.rotation.z = Math.PI / 4;
                break;
            case 'orange':
                fruitMesh = BABYLON.MeshBuilder.CreateSphere("orange", {diameter: 1.0}, this.scene);
                break;
            case 'grape':
                fruitMesh = BABYLON.MeshBuilder.CreateSphere("grape", {diameter: 0.8}, this.scene);
                break;
            case 'strawberry':
                fruitMesh = BABYLON.MeshBuilder.CreateCylinder("strawberry", {
                    height: 1.2,
                    diameterTop: 0.3,
                    diameterBottom: 0.9
                }, this.scene);
                break;
            case 'watermelon':
                fruitMesh = BABYLON.MeshBuilder.CreateSphere("watermelon", {diameter: 1.4}, this.scene);
                break;
            default:
                fruitMesh = BABYLON.MeshBuilder.CreateSphere("fruit", {diameter: 1.0}, this.scene);
        }

        const material = new BABYLON.StandardMaterial("fruitMat", this.scene);
        material.diffuseColor = color;
        material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        fruitMesh.material = material;
        
        fruitMesh.position = cell.position.clone();
        fruitMesh.position.y = 0.5;
        
        fruitMesh.userData = {
            isFruit: true,
            type: type,
            cell: cell,
            gridPosition: {row: cell.row, col: cell.col}
        };

        cell.occupied = true;
        cell.fruit = fruitMesh;
        this.fruits.push(fruitMesh);

        return fruitMesh;
    }

    getFruitColor(type) {
        const colors = {
            'apple': new BABYLON.Color3(1, 0, 0),
            'banana': new BABYLON.Color3(1, 1, 0),
            'orange': new BABYLON.Color3(1, 0.5, 0),
            'grape': new BABYLON.Color3(0.5, 0, 0.5),
            'strawberry': new BABYLON.Color3(1, 0.2, 0.2),
            'watermelon': new BABYLON.Color3(0, 0.8, 0)
        };
        return colors[type] || new BABYLON.Color3(1, 1, 1);
    }

    onFruitClick(fruitMesh) {
        if (this.selectedFruits.includes(fruitMesh)) {
            // اگر میوه قبلاً انتخاب شده، انتخاب رو لغو کن
            this.deselectFruit(fruitMesh);
        } else if (this.selectedFruits.length < 2) {
            // انتخاب میوه جدید
            this.selectFruit(fruitMesh);
            
            if (this.selectedFruits.length === 2) {
                this.checkFruitMatch();
            }
        }
    }

    selectFruit(fruitMesh) {
        this.selectedFruits.push(fruitMesh);
        
        // هایلایت کردن میوه انتخاب شده
        fruitMesh.renderOutline = true;
        fruitMesh.outlineColor = new BABYLON.Color3(1, 1, 0);
        fruitMesh.outlineWidth = 0.1;
        
        // پخش صدا
        this.playSound('select');
    }

    deselectFruit(fruitMesh) {
        const index = this.selectedFruits.indexOf(fruitMesh);
        if (index > -1) {
            this.selectedFruits.splice(index, 1);
            fruitMesh.renderOutline = false;
        }
    }

    checkFruitMatch() {
        const [fruit1, fruit2] = this.selectedFruits;
        
        if (fruit1.userData.type === fruit2.userData.type) {
            // تطابق موفق
            this.handleSuccessfulMatch(fruit1, fruit2);
        } else {
            // تطابق ناموفق
            this.handleFailedMatch(fruit1, fruit2);
        }
        
        // پاک کردن انتخاب‌ها بعد از 1 ثانیه
        setTimeout(() => {
            this.clearSelection();
        }, 1000);
    }

    handleSuccessfulMatch(fruit1, fruit2) {
        this.playSound('match');
        this.updateScore(50);
        this.connectionsMade++;
        
        // حذف میوه‌های تطابق‌یافته
        this.removeFruit(fruit1);
        this.removeFruit(fruit2);
        
        // ایجاد میوه‌های جدید
        setTimeout(() => {
            this.spawnNewFruits(2);
        }, 500);
        
        // بررسی پایان سطح
        if (this.connectionsMade >= this.connectionsNeeded) {
            this.levelUp();
        }
    }

    handleFailedMatch(fruit1, fruit2) {
        this.playSound('error');
        this.updateScore(-10);
    }

    removeFruit(fruitMesh) {
        const cell = fruitMesh.userData.cell;
        if (cell) {
            cell.occupied = false;
            cell.fruit = null;
        }
        
        const index = this.fruits.indexOf(fruitMesh);
        if (index > -1) {
            this.fruits.splice(index, 1);
        }
        
        // انیمیشن حذف
        const animation = new BABYLON.Animation(
            "removeAnimation", 
            "scaling", 
            30, 
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3
        );
        
        const keys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 15, value: new BABYLON.Vector3(0, 0, 0) }
        ];
        animation.setKeys(keys);
        
        fruitMesh.animations = [animation];
        this.scene.beginAnimation(fruitMesh, 0, 15, false, 1, () => {
            fruitMesh.dispose();
        });
    }

    spawnNewFruits(count) {
        const fruitTypes = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon'];
        const emptySlots = this.grid.filter(cell => !cell.occupied);
        
        for (let i = 0; i < count && i < emptySlots.length; i++) {
            const cell = emptySlots[i];
            const fruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            
            setTimeout(() => {
                this.createFruit(fruitType, cell);
            }, i * 200);
        }
    }

    clearSelection() {
        this.selectedFruits.forEach(fruit => {
            fruit.renderOutline = false;
        });
        this.selectedFruits = [];
    }

    clearFruits() {
        this.fruits.forEach(fruit => {
            fruit.dispose();
        });
        this.fruits = [];
        
        this.grid.forEach(cell => {
            cell.occupied = false;
            cell.fruit = null;
        });
    }

    updateScore(points) {
        this.score = Math.max(0, this.score + points);
        this.updateUI();
    }

    levelUp() {
        this.level++;
        this.connectionsMade = 0;
        this.connectionsNeeded = Math.min(20, this.connectionsNeeded + 2);
        this.timeLeft += 30; // اضافه کردن زمان
        
        this.playSound('success');
        alert(`تبریک! به سطح ${this.level} رسیدید!`);
        
        this.updateUI();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }

    gameOver() {
        clearInterval(this.timerInterval);
        this.gameState = 'gameover';
        
        this.playSound('gameover');
        alert(`بازی تمام شد! امتیاز نهایی: ${this.score}`);
        
        // نمایش دکمه شروع مجدد
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('gameUI').style.display = 'none';
    }

    playSound(soundName) {
        // سیستم صدا ساده
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (soundName === 'select') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            }
            else if (soundName === 'match') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = 1200;
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
            }
            else if (soundName === 'error') {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = 300;
                gainNode.gain.value = 0.2;
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            }
        } catch (error) {
            console.log('صدا پشتیبانی نمی‌شود');
        }
    }

    updateUI() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('levelValue').textContent = this.level;
        document.getElementById('timerValue').textContent = this.timeLeft;
        document.getElementById('connectionValue').textContent = 
            `${this.connectionsMade}/${this.connectionsNeeded}`;
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

    dispose() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.engine) {
            this.engine.dispose();
        }
    }
}

window.CoreEngine = CoreEngine;
