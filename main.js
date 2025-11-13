class StrategicGame {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.buildingSystem = null;
        this.resourceSystem = null;
        this.uiManager = null;
        this.resourceManager = null;
        
        this.initializeGame();
    }

    async initializeGame() {
        try {
            await this.initializeCoreSystems();
            this.initializeManagers();
            this.setupEventListeners();
            this.startGameLoop();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Error initializing game:', error);
            this.showErrorScreen('خطا در راه‌اندازی بازی: ' + error.message);
        }
    }

    initializeCoreSystems() {
        try {
            // Initialize engine first
            this.engine = new GameEngine('renderCanvas');
            this.scene = this.engine.scene;
            
            console.log('Core systems initialized successfully');
            
        } catch (error) {
            console.error('Error in initializeCoreSystems:', error);
            throw error;
        }
    }

    initializeManagers() {
        try {
            // Initialize resource manager
            this.resourceManager = new ResourceManager(this);
            
            // Initialize building system
            if (typeof BuildingSystem !== 'undefined') {
                this.buildingSystem = new BuildingSystem(this.scene, this.resourceManager);
                console.log('Building system initialized successfully');
            }
            
            // Initialize UI manager
            if (typeof UiManager !== 'undefined') {
                this.uiManager = new UiManager(this);
                console.log('UI manager initialized successfully');
            }
            
            console.log('All managers initialized successfully');
            
        } catch (error) {
            console.error('Error initializing managers:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'Escape':
                    if (this.uiManager) {
                        this.uiManager.toggleMenu();
                    }
                    break;
                case ' ':
                    // Space bar for quick actions
                    break;
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (this.engine) {
                this.engine.engine.resize();
            }
        });
    }

    startGameLoop() {
        // Game loop will be handled by Babylon.js engine
        console.log('Game loop started');
        
        // Initial resource update
        if (this.uiManager) {
            this.uiManager.updateResourceDisplay({
                gold: 1000,
                elixir: 1000,
                gem: 50
            });
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showErrorScreen(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.9);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-size: 18px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h1 style="color: #ff4444; margin-bottom: 20px;">خطا!</h1>
            <p style="margin-bottom: 30px;">${message}</p>
            <button onclick="location.reload()" style="
                padding: 10px 20px;
                background: #ff4444;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">بارگذاری مجدد</button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new StrategicGame();
});
