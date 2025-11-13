// game-manager.js - مدیریت اصلی بازی و هماهنگی بین سیستم‌ها
class GameManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.connectionsMade = 0;
        this.connectionsNeeded = 10;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.managers = new Map();
        this.gameState = 'initializing';
        
        this.init();
    }

    async init() {
        await this.initializeManagers();
        this.setupEventListeners();
        this.gameState = 'ready';
        
        console.log('Game Manager initialized successfully');
    }

    async initializeManagers() {
        try {
            // ایجاد و راه‌اندازی تمام مدیران
            this.managers.set('scene', new SceneManager(this.core));
            this.managers.set('fruit', new FruitManager(this.core));
            this.managers.set('ui', new UIManager(this.core));
            this.managers.set('audio', new AudioManager(this.core));
            this.managers.set('animation', new AnimationManager(this.core));
            this.managers.set('particle', new ParticleManager(this.core));
            this.managers.set('physics', new PhysicsManager(this.core));
            this.managers.set('ai', new AIEngine(this.core));
            
            // راه‌اندازی مدیران
            for (const [name, manager] of this.managers) {
                if (manager.init) {
                    await manager.init();
                }
            }
            
        } catch (error) {
            console.error('Failed to initialize managers:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // گوش دادن به رویدادهای بازی
        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });

        // مدیریت تغییر وضعیت بازی
        this.setupGameStateListeners();
    }

    setupGameStateListeners() {
        // رویدادهای تغییر وضعیت بازی
        document.addEventListener('gameStateChange', (event) => {
            this.handleGameStateChange(event.detail);
        });
    }

    // متدهای اصلی بازی
    async startGame() {
        if (this.gameState === 'playing') return;
        
        this.gameState = 'playing';
        this.isPaused = false;
        this.isGameOver = false;
        
        // ریست وضعیت بازی
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.connectionsMade = 0;
        this.connectionsNeeded = 10;
        
        // شروع سیستم‌ها
        this.startGameSystems();
        
        // پخش موسیقی بازی
        if (this.managers.get('audio')) {
            this.managers.get('audio').playMusic('game');
        }
        
        // به‌روزرسانی رابط کاربری
        this.updateUI();
        
        console.log('Game started');
    }

    startGameSystems() {
        // شروع تایمر بازی
        this.startTimer();
        
        // شروع هوش مصنوعی
        const aiManager = this.managers.get('ai');
        if (aiManager) {
            aiManager.start();
        }
        
        // ایجاد میوه‌های اولیه
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            fruitManager.spawnInitialFruits();
        }
    }

    pauseGame() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'paused';
        this.isPaused = true;
        
        // توقف تایمر
        this.stopTimer();
        
        // توقف هوش مصنوعی
        const aiManager = this.managers.get('ai');
        if (aiManager) {
            aiManager.pause();
        }
        
        // توقف انیمیشن‌ها
        const animationManager = this.managers.get('animation');
        if (animationManager) {
            animationManager.pauseAllAnimations();
        }
        
        console.log('Game paused');
    }

    resumeGame() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'playing';
        this.isPaused = false;
        
        // شروع مجدد تایمر
        this.startTimer();
        
        // شروع مجدد هوش مصنوعی
        const aiManager = this.managers.get('ai');
        if (aiManager) {
            aiManager.resume();
        }
        
        // شروع مجدد انیمیشن‌ها
        const animationManager = this.managers.get('animation');
        if (animationManager) {
            animationManager.resumeAllAnimations();
        }
        
        console.log('Game resumed');
    }

    restartGame() {
        // توقف کامل بازی
        this.stopGame();
        
        // شروع مجدد
        setTimeout(() => {
            this.startGame();
        }, 500);
    }

    stopGame() {
        this.gameState = 'stopped';
        this.isPaused = false;
        
        // توقف تمام سیستم‌ها
        this.stopTimer();
        
        // توقف هوش مصنوعی
        const aiManager = this.managers.get('ai');
        if (aiManager) {
            aiManager.stop();
        }
        
        // توقف انیمیشن‌ها
        const animationManager = this.managers.get('animation');
        if (animationManager) {
            animationManager.stopAllAnimations();
        }
        
        // توقف افکت‌ها
        const particleManager = this.managers.get('particle');
        if (particleManager) {
            particleManager.stopAllEffects();
        }
        
        // پاک کردن میوه‌ها
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            fruitManager.clearAllFruits();
        }
        
        console.log('Game stopped');
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.isGameOver = true;
        
        // توقف سیستم‌ها
        this.stopTimer();
        
        // توقف هوش مصنوعی
        const aiManager = this.managers.get('ai');
        if (aiManager) {
            aiManager.stop();
        }
        
        // پخش موسیقی پایان بازی
        const audioManager = this.managers.get('audio');
        if (audioManager) {
            audioManager.playMusic('gameover');
        }
        
        // نمایش صفحه پایان بازی
        const uiManager = this.managers.get('ui');
        if (uiManager) {
            const isNewRecord = this.checkNewRecord();
            uiManager.showGameOver(this.score, isNewRecord);
        }
        
        console.log('Game over - Final score:', this.score);
    }

    // متدهای تایمر
    startTimer() {
        this.stopTimer(); // اطمینان از توقف تایمر قبلی
        
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // متدهای امتیاز و پیشرفت
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
        
        // بررسی ارتقاء سطح
        this.checkLevelUp();
    }

    checkLevelUp() {
        const nextLevelThreshold = this.level * 100;
        
        if (this.score >= nextLevelThreshold) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.connectionsMade = 0;
        this.connectionsNeeded = Math.min(20, this.connectionsNeeded + 2);
        
        // پخش افکت ارتقاء سطح
        this.playLevelUpEffect();
        
        // افزایش سختی
        this.increaseDifficulty();
        
        console.log('Level up! New level:', this.level);
    }

    increaseDifficulty() {
        // افزایش سختی بازی با ارتقاء سطح
        const aiManager = this.managers.get('ai');
        if (aiManager) {
            if (this.level >= 5) {
                aiManager.setDifficulty('hard');
            } else if (this.level >= 3) {
                aiManager.setDifficulty('medium');
            }
        }
        
        // افزایش سرعت اسپاون میوه‌ها
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            fruitManager.spawnInterval = Math.max(0.5, 2.0 - this.level * 0.2);
        }
    }

    addConnection() {
        this.connectionsMade++;
        this.updateConnectionsDisplay();
        
        if (this.connectionsMade >= this.connectionsNeeded) {
            this.completeLevelConnections();
        }
    }

    completeLevelConnections() {
        // پاداش برای تکمیل اتصالات سطح
        const bonus = this.level * 50;
        this.addScore(bonus);
        
        // ریست شمارنده اتصالات
        this.connectionsMade = 0;
        
        // پخش افکت موفقیت
        this.playSuccessEffect();
    }

    // متدهای افکت و صدا
    playLevelUpEffect() {
        // پخش صدا
        const audioManager = this.managers.get('audio');
        if (audioManager) {
            audioManager.playSound('success');
        }
        
        // ایجاد افکت بصری
        const particleManager = this.managers.get('particle');
        if (particleManager) {
            particleManager.createMagicEffect(new BABYLON.Vector3(0, 5, 0));
        }
    }

    playSuccessEffect() {
        const audioManager = this.managers.get('audio');
        if (audioManager) {
            audioManager.playSound('success');
        }
    }

    playMatchEffect(position) {
        const particleManager = this.managers.get('particle');
        if (particleManager) {
            particleManager.createMatchEffect(position);
        }
    }

    // متدهای به‌روزرسانی
    update() {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        
        // به‌روزرسانی مدیران
        this.updateManagers(deltaTime);
        
        // بررسی وضعیت بازی
        this.checkGameConditions();
    }

    updateManagers(deltaTime) {
        // به‌روزرسانی مدیران فعال
        const fruitManager = this.managers.get('fruit');
        if (fruitManager && fruitManager.update) {
            fruitManager.update(deltaTime);
        }
        
        const aiManager = this.managers.get('ai');
        if (aiManager) {
            this.updateAI(aiManager);
        }
    }

    async updateAI(aiManager) {
        if (!aiManager.isActive) return;
        
        // هوش مصنوعی حرکت می‌کند
        const move = await aiManager.makeMove();
        if (move) {
            await aiManager.executeMove(move);
        }
    }

    checkGameConditions() {
        // بررسی شرایط مختلف بازی
        this.checkFruitLimit();
        this.checkPlayerPerformance();
    }

    checkFruitLimit() {
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            const totalFruits = fruitManager.getTotalFruits();
            
            if (totalFruits >= 35) {
                // هشدار برای تعداد زیاد میوه‌ها
                this.showWarning('تعداد میوه‌ها در حال زیاد شدن است!');
            }
        }
    }

    checkPlayerPerformance() {
        // بررسی عملکرد بازیکن
        if (this.connectionsMade === 0 && this.timeLeft < 45) {
            this.showHint();
        }
    }

    // متدهای رابط کاربری
    updateUI() {
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.updateLevelDisplay();
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
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateLevelDisplay() {
        const levelElement = document.getElementById('levelValue');
        if (levelElement) {
            levelElement.textContent = this.level;
        }
    }

    updateConnectionsDisplay() {
        const connElement = document.getElementById('connectionValue');
        if (connElement) {
            connElement.textContent = `${this.connectionsMade}/${this.connectionsNeeded}`;
        }
    }

    // متدهای کمکی
    showHint() {
        const uiManager = this.managers.get('ui');
        if (uiManager) {
            uiManager.showHint();
        }
    }

    showWarning(message) {
        const uiManager = this.managers.get('ui');
        if (uiManager) {
            uiManager.showNotification(message, 3000);
        }
    }

    checkNewRecord() {
        const previousRecord = localStorage.getItem('fruitGameRecord') || 0;
        if (this.score > previousRecord) {
            localStorage.setItem('fruitGameRecord', this.score);
            return true;
        }
        return false;
    }

    handleGameStateChange(event) {
        // مدیریت تغییر وضعیت بازی
        switch (event.state) {
            case 'fruitMatched':
                this.handleFruitMatch(event.data);
                break;
            case 'powerUpActivated':
                this.handlePowerUp(event.data);
                break;
            case 'timeAdded':
                this.handleTimeAdded(event.data);
                break;
        }
    }

    handleFruitMatch(matchData) {
        this.addScore(50);
        this.addConnection();
        this.playMatchEffect(matchData.position);
    }

    handlePowerUp(powerUpData) {
        // فعال‌سازی پاورآپ
        const fruitManager = this.managers.get('fruit');
        if (fruitManager) {
            fruitManager.activatePowerUp(powerUpData.type, powerUpData.position);
        }
    }

    handleTimeAdded(seconds) {
        this.timeLeft += seconds;
        this.updateTimerDisplay();
    }

    // متدهای دسترسی
    getScore() {
        return this.score;
    }

    getLevel() {
        return this.level;
    }

    getTimeLeft() {
        return this.timeLeft;
    }

    getConnections() {
        return {
            made: this.connectionsMade,
            needed: this.connectionsNeeded
        };
    }

    setScoreMultiplier(multiplier, duration) {
        // تنظیم ضریب امتیاز موقت
        console.log(`Score multiplier: ${multiplier} for ${duration} seconds`);
        // پیاده‌سازی کامل نیاز به سیستم مدیریت پاورآپ دارد
    }

    addTime(seconds) {
        this.timeLeft += seconds;
        this.updateTimerDisplay();
    }

    // متدهای تمیزکاری
    dispose() {
        this.stopGame();
        
        // پاک کردن تمام مدیران
        this.managers.forEach((manager, name) => {
            if (manager.dispose) {
                manager.dispose();
            }
        });
        this.managers.clear();
    }
}

window.GameManager = GameManager;
