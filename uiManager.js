class UiManager {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.advancedTexture = null;
        this.isMenuOpen = false;
        
        this.initializeUI();
    }

    initializeUI() {
        try {
            if (typeof BABYLON.GUI === 'undefined') {
                console.error('BABYLON.GUI is not defined');
                return;
            }
            
            this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            console.log('GUI system initialized successfully');
            
            this.createMainHUD();
            this.createBuildMenu();
            this.createGameMenu();
            
        } catch (error) {
            console.error('Error initializing UI:', error);
        }
    }

    createMainHUD() {
        if (!this.advancedTexture) return;

        try {
            // Resource Panel - سمت راست بالا
            const resourcePanel = new BABYLON.GUI.StackPanel();
            resourcePanel.width = "300px";
            resourcePanel.height = "120px";
            resourcePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            resourcePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            resourcePanel.right = "20px";
            resourcePanel.top = "20px";
            resourcePanel.background = "rgba(0,0,0,0.8)";
            resourcePanel.paddingTop = "10px";
            resourcePanel.paddingBottom = "10px";
            resourcePanel.cornerRadius = 15;
            this.advancedTexture.addControl(resourcePanel);

            // Gold
            const goldPanel = new BABYLON.GUI.StackPanel();
            goldPanel.isVertical = false;
            goldPanel.height = "35px";
            goldPanel.paddingLeft = "15px";
            goldPanel.paddingRight = "15px";
            resourcePanel.addControl(goldPanel);

            const goldIcon = new BABYLON.GUI.TextBlock();
            goldIcon.text = "💰";
            goldIcon.width = "30px";
            goldIcon.fontSize = "20px";
            goldIcon.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            goldPanel.addControl(goldIcon);

            this.goldText = new BABYLON.GUI.TextBlock();
            this.goldText.text = "1000";
            this.goldText.color = "gold";
            this.goldText.width = "100px";
            this.goldText.fontSize = "18px";
            this.goldText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            goldPanel.addControl(this.goldText);

            // Elixir
            const elixirPanel = new BABYLON.GUI.StackPanel();
            elixirPanel.isVertical = false;
            elixirPanel.height = "35px";
            elixirPanel.paddingLeft = "15px";
            elixirPanel.paddingRight = "15px";
            resourcePanel.addControl(elixirPanel);

            const elixirIcon = new BABYLON.GUI.TextBlock();
            elixirIcon.text = "⚗️";
            elixirIcon.width = "30px";
            elixirIcon.fontSize = "20px";
            elixirPanel.addControl(elixirIcon);

            this.elixirText = new BABYLON.GUI.TextBlock();
            this.elixirText.text = "1000";
            this.elixirText.color = "#e52e71";
            this.elixirText.width = "100px";
            this.elixirText.fontSize = "18px";
            elixirPanel.addControl(this.elixirText);

            // Gem
            const gemPanel = new BABYLON.GUI.StackPanel();
            gemPanel.isVertical = false;
            gemPanel.height = "35px";
            gemPanel.paddingLeft = "15px";
            gemPanel.paddingRight = "15px";
            resourcePanel.addControl(gemPanel);

            const gemIcon = new BABYLON.GUI.TextBlock();
            gemIcon.text = "💎";
            gemIcon.width = "30px";
            gemIcon.fontSize = "20px";
            gemPanel.addControl(gemIcon);

            this.gemText = new BABYLON.GUI.TextBlock();
            this.gemText.text = "50";
            this.gemText.color = "#00ff88";
            this.gemText.width = "100px";
            this.gemText.fontSize = "18px";
            gemPanel.addControl(this.gemText);

        } catch (error) {
            console.error('Error creating HUD:', error);
        }
    }

    createBuildMenu() {
        if (!this.advancedTexture) return;

        try {
            // Build Menu - پایین صفحه
            const buildPanel = new BABYLON.GUI.StackPanel();
            buildPanel.isVertical = false;
            buildPanel.width = "600px";
            buildPanel.height = "80px";
            buildPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            buildPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            buildPanel.bottom = "20px";
            buildPanel.background = "rgba(0,0,0,0.7)";
            buildPanel.cornerRadius = 20;
            buildPanel.padding = 10;
            this.advancedTexture.addControl(buildPanel);

            // Building buttons
            const buildings = [
                { type: 'townhall', name: 'سالن شهر', icon: '🏛️', cost: 0 },
                { type: 'mine', name: 'معدن طلا', icon: '⛏️', cost: 150 },
                { type: 'barracks', name: 'سربازخانه', icon: '⚔️', cost: 200 },
                { type: 'wall', name: 'دیوار', icon: '🧱', cost: 50 },
                { type: 'cannon', name: 'توپخانه', icon: '💣', cost: 250 },
                { type: 'archertower', name: 'برج کماندار', icon: '🏹', cost: 300 }
            ];

            buildings.forEach(building => {
                const button = BABYLON.GUI.Button.CreateSimpleButton(building.type, building.icon);
                button.width = "60px";
                button.height = "60px";
                button.color = "white";
                button.background = "rgba(255,255,255,0.1)";
                button.cornerRadius = 10;
                button.thickness = 2;
                button.paddingTop = "5px";
                button.fontSize = "20px";
                
                // Tooltip
                button.onPointerEnterObservable.add(() => {
                    this.showTooltip(button, `${building.name}\nهزینه: ${building.cost} طلا`);
                });
                
                button.onPointerOutObservable.add(() => {
                    this.hideTooltip();
                });
                
                button.onPointerClickObservable.add(() => {
                    if (this.game.buildingSystem) {
                        this.game.buildingSystem.startBuildingPlacement(building.type);
                    }
                });
                
                buildPanel.addControl(button);
            });

        } catch (error) {
            console.error('Error creating build menu:', error);
        }
    }

    createGameMenu() {
        if (!this.advancedTexture) return;

        try {
            // Menu Button - چپ بالا
            const menuButton = BABYLON.GUI.Button.CreateSimpleButton("menu", "☰");
            menuButton.width = "60px";
            menuButton.height = "60px";
            menuButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            menuButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            menuButton.left = "20px";
            menuButton.top = "20px";
            menuButton.color = "white";
            menuButton.background = "rgba(0,0,0,0.7)";
            menuButton.cornerRadius = 10;
            menuButton.fontSize = "24px";
            this.advancedTexture.addControl(menuButton);

            // Menu Panel (initially hidden)
            this.menuPanel = new BABYLON.GUI.StackPanel();
            this.menuPanel.width = "300px";
            this.menuPanel.height = "400px";
            this.menuPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.menuPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.menuPanel.background = "rgba(0,0,0,0.95)";
            this.menuPanel.cornerRadius = 20;
            this.menuPanel.padding = 20;
            this.menuPanel.isVisible = false;
            this.advancedTexture.addControl(this.menuPanel);

            // Menu Title
            const menuTitle = new BABYLON.GUI.TextBlock();
            menuTitle.text = "منوی بازی";
            menuTitle.color = "gold";
            menuTitle.fontSize = 28;
            menuTitle.height = "50px";
            menuTitle.paddingBottom = "20px";
            this.menuPanel.addControl(menuTitle);

            // Menu Items
            const menuItems = [
                { text: "ادامه بازی", action: () => this.toggleMenu() },
                { text: "ذخیره بازی", action: () => this.saveGame() },
                { text: "بارگذاری بازی", action: () => this.loadGame() },
                { text: "دستاوردها", action: () => this.showAchievements() },
                { text: "آمار بازی", action: () => this.showStatistics() },
                { text: "راهنما", action: () => this.showHelp() },
                { text: "خروج از بازی", action: () => this.exitGame() }
            ];

            menuItems.forEach(item => {
                const button = BABYLON.GUI.Button.CreateSimpleButton("menu_" + item.text, item.text);
                button.width = "250px";
                button.height = "45px";
                button.color = "white";
                button.background = "rgba(255,255,255,0.1)";
                button.cornerRadius = 8;
                button.paddingTop = "5px";
                button.fontSize = "18px";
                button.marginTop = "5px";
                
                button.onPointerClickObservable.add(() => {
                    item.action();
                });
                
                this.menuPanel.addControl(button);
            });

            // Menu toggle
            menuButton.onPointerClickObservable.add(() => {
                this.toggleMenu();
            });

        } catch (error) {
            console.error('Error creating game menu:', error);
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.menuPanel.isVisible = this.isMenuOpen;
        
        // Pause game when menu is open
        if (this.game.engine) {
            this.game.engine.scene.pauseAnimation = this.isMenuOpen;
        }
    }

    showTooltip(button, text) {
        if (!this.advancedTexture) return;

        this.hideTooltip();

        this.tooltip = new BABYLON.GUI.Rectangle();
        this.tooltip.width = "200px";
        this.tooltip.height = "60px";
        this.tooltip.background = "rgba(0,0,0,0.9)";
        this.tooltip.cornerRadius = 8;
        this.tooltip.thickness = 1;
        this.tooltip.color = "white";
        this.tooltip.linkOffsetY = -70;
        this.tooltip.linkOffsetX = -100;
        this.advancedTexture.addControl(this.tooltip);

        const tooltipText = new BABYLON.GUI.TextBlock();
        tooltipText.text = text;
        tooltipText.color = "white";
        tooltipText.fontSize = "14px";
        tooltipText.textWrapping = true;
        tooltipText.paddingTop = "5px";
        this.tooltip.addControl(tooltipText);

        this.tooltip.linkWithMesh(button._linkedMesh);
    }

    hideTooltip() {
        if (this.tooltip) {
            this.advancedTexture.removeControl(this.tooltip);
            this.tooltip = null;
        }
    }

    updateResourceDisplay(resources) {
        if (this.goldText) {
            this.goldText.text = resources.gold || "1000";
        }
        if (this.elixirText) {
            this.elixirText.text = resources.elixir || "1000";
        }
        if (this.gemText) {
            this.gemText.text = resources.gem || "50";
        }
    }

    // Menu actions
    saveGame() {
        this.showNotification("بازی ذخیره شد! 💾", "success");
        // Implement save logic here
    }

    loadGame() {
        this.showNotification("بازی بارگذاری شد! 📂", "success");
        // Implement load logic here
    }

    showAchievements() {
        this.showNotification("دستاوردها در حال توسعه... 🏆", "info");
    }

    showStatistics() {
        this.showNotification("آمار بازی در حال توسعه... 📊", "info");
    }

    showHelp() {
        this.showNotification("راهنما در حال توسعه... ❓", "info");
    }

    exitGame() {
        if (confirm("آیا مطمئن هستید که می‌خواهید از بازی خارج شوید؟")) {
            window.close();
        }
    }

    showNotification(message, type = 'info') {
        const colors = {
            error: '#ff4444',
            success: '#44ff44',
            info: '#4444ff'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
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
        }, 3000);
    }
        }
