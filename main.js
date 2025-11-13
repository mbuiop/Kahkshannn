class StrategicGame {
    constructor() {
        this.gameEngine = null;
        this.resourceManager = null;
        this.buildingSystem = null;
        this.unitSystem = null;
        this.combatSystem = null;
        this.uiManager = null;
        this.inputManager = null;
        this.gameState = null;
        
        this.isInitialized = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        this.initializeGame();
    }

    async initializeGame() {
        try {
            this.showLoadingScreen();
            
            // Initialize core systems in sequence
            await this.initializeCoreSystems();
            await this.initializeGameSystems();
            await this.initializeManagers();
            await this.finalizeInitialization();
            
        } catch (error) {
            console.error('Game initialization failed:', error);
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
            loadingScreen.style.display = 'none';
        }
    }

    async initializeCoreSystems() {
        this.updateLoadingProgress(10, 'در حال راه‌اندازی موتور گرافیکی...');
        
        // Initialize game engine
        this.gameEngine = new GameEngine('gameCanvas');
        await this.waitForSceneReady();
        
        this.updateLoadingProgress(30, 'در حال راه‌اندازی سیستم منابع...');
        
        // Initialize resource manager
        this.resourceManager = new AdvancedResourceManager();
        
        this.updateLoadingProgress(50, 'در حال راه‌اندازی سیستم ساختمان‌ها...');
        
        // Initialize building system
        this.buildingSystem = new BuildingSystem(
            this.gameEngine.scene, 
            this.resourceManager
        );
    }

    waitForSceneReady() {
        return new Promise((resolve) => {
            const checkScene = () => {
                if (this.gameEngine.scene.isReady()) {
                    resolve();
                } else {
                    setTimeout(checkScene, 100);
                }
            };
            checkScene();
        });
    }

    async initializeGameSystems() {
        this.updateLoadingProgress(60, 'در حال راه‌اندازی سیستم نیروها...');
        
        // Initialize unit system
        this.unitSystem = new UnitSystem(
            this.gameEngine.scene,
            this.resourceManager,
            this.buildingSystem
        );
        
        this.updateLoadingProgress(70, 'در حال راه‌اندازی سیستم نبرد...');
        
        // Initialize combat system
        this.combatSystem = new CombatSystem(
            this.gameEngine.scene,
            this.buildingSystem,
            this.unitSystem,
            this.resourceManager
        );
        
        this.updateLoadingProgress(80, 'در حال راه‌اندازی مدیریت حالت بازی...');
        
        // Initialize game state
        this.gameState = new GameState();
    }

    async initializeManagers() {
        this.updateLoadingProgress(85, 'در حال راه‌اندازی مدیریت ورودی...');
        
        // Initialize input manager
        this.inputManager = new InputManager(
            this.gameEngine.scene,
            this.gameEngine.camera,
            this.gameEngine
        );
        
        this.updateLoadingProgress(90, 'در حال راه‌اندازی رابط کاربری...');
        
        // Initialize UI manager
        this.uiManager = new UIManager(
            this.gameEngine.scene,
            this.gameEngine,
            this.resourceManager,
            this.buildingSystem,
            this.unitSystem,
            this.combatSystem
        );
        
        this.updateLoadingProgress(95, 'در حال اتصال سیستم‌ها...');
        
        // Connect systems to global scope for debugging
        this.connectToGlobalScope();
    }

    connectToGlobalScope() {
        // Make systems available globally for debugging
        window.game = this;
        window.gameEngine = this.gameEngine;
        window.resourceManager = this.resourceManager;
        window.buildingSystem = this.buildingSystem;
        window.unitSystem = this.unitSystem;
        window.combatSystem = this.combatSystem;
        window.uiManager = this.uiManager;
        window.inputManager = this.inputManager;
        window.gameState = this.gameState;
    }

    async finalizeInitialization() {
        this.updateLoadingProgress(98, 'در حال راه‌اندازی نهایی...');
        
        // Start game loop
        this.startGameLoop();
        
        // Set up event listeners
        this.setupGlobalEventListeners();
        
        // Validate game state
        this.gameState.validateGameState();
        
        this.updateLoadingProgress(100, 'آماده!');
        
        await this.delay(1000);
        
        this.hideLoadingScreen();
        this.isInitialized = true;
        
        // Show welcome message
        this.showWelcomeMessage();
        
        console.log('🎮 Strategic Game initialized successfully!');
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            if (!this.isPaused) {
                this.update();
            }
        }, 16); // ~60 FPS
    }

    update() {
        const startTime = performance.now();
        
        try {
            // Update game state
            this.gameState.sessionData.framesRendered++;
            this.gameState.sessionData.currentTime = Date.now();
            
            // Update game systems
            this.updateGameSystems();
            
            // Update performance metrics
            const frameTime = performance.now() - startTime;
            this.trackPerformance(frameTime);
            
        } catch (error) {
            console.error('Error in game loop:', error);
            this.gameState.trackError('game_loop', error);
        }
    }

    updateGameSystems() {
        // Update resource production
        if (this.resourceManager.updateAutoProduction) {
            this.resourceManager.updateAutoProduction();
        }
        
        // Update building construction
        if (this.buildingSystem.updateConstructionQueue) {
            this.buildingSystem.updateConstructionQueue();
            this.buildingSystem.updateUpgradeQueue();
        }
        
        // Update unit training
        if (this.unitSystem.updateTrainingQueue) {
            this.unitSystem.updateTrainingQueue();
        }
        
        // Update combat
        if (this.combatSystem.updateCombat) {
            this.combatSystem.updateCombat();
        }
        
        // Update UI
        if (this.uiManager.updateUI) {
            this.uiManager.updateUI();
        }
    }

    trackPerformance(frameTime) {
        // Track FPS and performance
        const fps = 1000 / frameTime;
        
        if (fps < 30) {
            // Performance warning
            this.gameState.trackPerformance('low_fps', fps, {
                frameTime: frameTime,
                buildings: this.buildingSystem.buildings.size,
                units: this.unitSystem.units.size
            });
        }
        
        // Update FPS counter in UI
        if (this.uiManager.updateFPS) {
            this.uiManager.updateFPS();
        }
    }

    setupGlobalEventListeners() {
        // Pause game when tab is hidden
        document.addEventListener('visibilitychange', () => {
            this.isPaused = document.hidden;
            
            if (this.isPaused) {
                this.onGamePaused();
            } else {
                this.onGameResumed();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (evt) => {
            this.handleGlobalKeyDown(evt);
        });
        
        // Prevent context menu on game elements
        document.addEventListener('contextmenu', (evt) => {
            if (evt.target.id === 'gameCanvas') {
                evt.preventDefault();
            }
        });
    }

    onGamePaused() {
        console.log('Game paused');
        this.gameState.trackEvent('game_paused');
        
        // Auto-save when pausing
        if (this.gameState.gameData.settings.game.autoSave) {
            this.gameState.saveGameData();
        }
    }

    onGameResumed() {
        console.log('Game resumed');
        this.gameState.trackEvent('game_resumed');
        
        // Check for offline progress
        this.gameState.calculateOfflineProgress(
            this.gameState.playerData.lastLogin
        );
    }

    handleResize() {
        // Resize game engine
        if (this.gameEngine && this.gameEngine.engine) {
            this.gameEngine.engine.resize();
        }
        
        // Update UI for new size
        if (this.uiManager && this.uiManager.handleResize) {
            this.uiManager.handleResize();
        }
    }

    handleGlobalKeyDown(evt) {
        // Debug shortcuts
        if (evt.ctrlKey && evt.shiftKey) {
            switch(evt.key) {
                case 'D':
                    // Toggle debug mode
                    if (this.gameState.debug && this.gameState.debug.enabled) {
                        this.gameState.disableDebugMode();
                    } else {
                        this.gameState.enableDebugMode();
                    }
                    evt.preventDefault();
                    break;
                    
                case 'S':
                    // Quick save
                    this.gameState.saveGameData();
                    evt.preventDefault();
                    break;
                    
                case 'L':
                    // Quick load
                    this.gameState.loadGameData();
                    evt.preventDefault();
                    break;
                    
                case 'R':
                    // Add resources (debug)
                    if (this.resourceManager) {
                        this.resourceManager.addResource('gold', 1000);
                        this.resourceManager.addResource('elixir', 1000);
                        this.resourceManager.addResource('gem', 100);
                    }
                    evt.preventDefault();
                    break;
            }
        }
        
        // Fullscreen toggle
        if (evt.key === 'F11') {
            this.toggleFullscreen();
            evt.preventDefault();
        }
    }

    toggleFullscreen() {
        const canvas = document.getElementById('gameCanvas');
        
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    showWelcomeMessage() {
        const message = `🎮 به استراتژی سینمایی خوش آمدید، ${this.gameState.playerData.playerName}!\n\n` +
                       `سطح: ${this.gameState.playerData.level}\n` +
                       `تجربه: ${this.gameState.playerData.experience}\n` +
                       `زمان بازی: ${this.gameState.formatPlayTime(this.gameState.playerData.playTime)}`;
        
        if (this.uiManager) {
            this.uiManager.showNotification(message, 6000);
        }
        
        // Start initial tutorial if needed
        if (this.gameState.gameData.settings.game.showTutorial) {
            this.startTutorial();
        }
    }

    startTutorial() {
        console.log('Starting tutorial...');
        
        // Simple tutorial sequence
        const tutorialSteps = [
            {
                message: "برای شروع، یک معدن طلا بسازید! 🏗️",
                action: () => this.uiManager.showBuildingMenu(),
                condition: () => this.buildingSystem.buildings.size > 1
            },
            {
                message: "عالی! حالا یک سربازخانه بسازید تا نیرو آموزش دهید. ⚔️",
                action: () => this.uiManager.showBuildingMenu(),
                condition: () => this.buildingSystem.getBuildingsByType('barracks').length > 0
            },
            {
                message: "حالا چند سرباز آموزش دهید! 👥",
                action: () => this.uiManager.showUnitTrainingMenu(),
                condition: () => this.unitSystem.units.size > 0
            },
            {
                message: "تبریک! حالا آماده حمله هستید! 🚀",
                action: () => this.uiManager.startAttack(),
                condition: () => true
            }
        ];
        
        this.currentTutorialStep = 0;
        this.runTutorialStep(tutorialSteps[0]);
    }

    runTutorialStep(step) {
        if (!step) return;
        
        // Show tutorial message
        if (this.uiManager) {
            this.uiManager.showNotification(step.message, 10000);
        }
        
        // Perform tutorial action
        if (step.action) {
            step.action();
        }
        
        // Check for step completion
        const checkCompletion = setInterval(() => {
            if (step.condition && step.condition()) {
                clearInterval(checkCompletion);
                this.currentTutorialStep++;
                this.runTutorialStep(tutorialSteps[this.currentTutorialStep]);
            }
        }, 1000);
    }

    showErrorScreen(error) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div style="text-align: center; color: white;">
                    <h1 style="color: #ff4444;">❌ خطا در راه‌اندازی بازی</h1>
                    <p>${error.message}</p>
                    <p style="font-size: 14px; opacity: 0.8;">${error.stack}</p>
                    <button onclick="location.reload()" style="
                        background: #ff4444;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        margin-top: 20px;
                        cursor: pointer;
                    ">بارگذاری مجدد</button>
                </div>
            `;
        }
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Game control methods
    pauseGame() {
        this.isPaused = true;
        this.gameState.trackEvent('game_paused_manual');
    }

    resumeGame() {
        this.isPaused = false;
        this.gameState.trackEvent('game_resumed_manual');
    }

    restartGame() {
        if (confirm('آیا مطمئنید می‌خواهید بازی را از نو شروع کنید؟ تمام پیشرفت‌های شما از بین خواهد رفت.')) {
            localStorage.removeItem('gameState');
            localStorage.removeItem('gameState_backup');
            location.reload();
        }
    }

    exportSave() {
        this.gameState.exportGameData();
    }

    importSave(event) {
        const file = event.target.files[0];
        if (file) {
            this.gameState.importGameData(file);
        }
    }

    // Game statistics
    getGameStatistics() {
        return {
            performance: {
                fps: this.getCurrentFPS(),
                frameTime: this.getAverageFrameTime(),
                memory: this.getMemoryUsage()
            },
            game: this.gameState.getGameSummary(),
            systems: {
                buildings: this.buildingSystem.getBuildingStatistics(),
                units: this.unitSystem.getUnitStatistics(),
                combat: this.combatSystem.getCombatReport()
            }
        };
    }

    getCurrentFPS() {
        return this.gameEngine ? this.gameEngine.engine.getFps() : 0;
    }

    getAverageFrameTime() {
        // Calculate average frame time from recent frames
        return 16; // Placeholder
    }

    getMemoryUsage() {
        // Get memory usage if available
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        return null;
    }

    // Cleanup
    dispose() {
        // Stop game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // Save game state
        if (this.gameState) {
            this.gameState.saveGameData();
        }
        
        // Dispose systems
        if (this.gameEngine) {
            this.gameEngine.dispose();
        }
        if (this.uiManager) {
            this.uiManager.dispose();
        }
        
        console.log('Game disposed successfully');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the game
    window.strategicGame = new StrategicGame();
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
        if (window.strategicGame) {
            window.strategicGame.dispose();
        }
    });
    
    // Handle errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (window.strategicGame && window.strategicGame.gameState) {
            window.strategicGame.gameState.trackError('global_error', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        }
    });
});

// Service Worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrategicGame;
}
