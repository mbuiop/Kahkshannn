class ModernUIManager {
    constructor(scene, gameEngine, resourceManager, buildingSystem, unitSystem, combatSystem) {
        this.scene = scene;
        this.gameEngine = gameEngine;
        this.resourceManager = resourceManager;
        this.buildingSystem = buildingSystem;
        this.unitSystem = unitSystem;
        this.combatSystem = combatSystem;
        
        this.guiTextures = new Map();
        this.activePanels = new Map();
        this.notifications = [];
        
        this.initializeModernUI();
    }

    initializeModernUI() {
        this.createModernHUD();
        this.createBottomActionBar();
        this.createBuildingPalette();
        this.createUnitDeploymentBar();
        
        console.log('🎨 رابط کاربری مدرن راه‌اندازی شد');
    }

    createModernHUD() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("modernHUD");
        this.guiTextures.set("modernHUD", advancedTexture);

        // نوار منابع شفاف در بالای صفحه
        this.createTransparentResourceBar(advancedTexture);
        
        // مینی‌مپ در گوشه
        this.createMiniMap(advancedTexture);
        
        // اطلاعات بازی
        this.createGameInfo(advancedTexture);
    }

    createTransparentResourceBar(advancedTexture) {
        const resourceContainer = new BABYLON.GUI.Rectangle();
        resourceContainer.width = "400px";
        resourceContainer.height = "70px";
        resourceContainer.cornerRadius = 20;
        resourceContainer.background = "rgba(0, 0, 0, 0.3)";
        resourceContainer.thickness = 0;
        resourceContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        resourceContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        resourceContainer.top = "20px";
        resourceContainer.shadowColor = "rgba(0, 0, 0, 0.5)";
        resourceContainer.shadowBlur = 10;
        advancedTexture.addControl(resourceContainer);

        // شبکه برای نمایش منابع
        const resourceGrid = new BABYLON.GUI.Grid();
        resourceGrid.addColumnDefinition(0.33);
        resourceGrid.addColumnDefinition(0.33);
        resourceGrid.addColumnDefinition(0.33);
        resourceGrid.addRowDefinition(1);
        resourceContainer.addControl(resourceGrid);

        // طلا
        const goldPanel = this.createResourcePanel("gold", "💰", "#FFD700");
        resourceGrid.addControl(goldPanel, 0, 0);

        // اکسیر
        const elixirPanel = this.createResourcePanel("elixir", "⚗️", "#E52E71");
        resourceGrid.addControl(elixirPanel, 0, 1);

        // الماس
        const gemPanel = this.createResourcePanel("gem", "💎", "#00FF88");
        resourceGrid.addControl(gemPanel, 0, 2);
    }

    createResourcePanel(resourceType, icon, color) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.height = "60px";
        container.paddingLeft = "15px";
        container.paddingRight = "15px";

        // آیکون
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 24;
        iconText.color = color;
        iconText.width = "40px";
        iconText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(iconText);

        // مقدار
        const amountText = new BABYLON.GUI.TextBlock();
        amountText.text = "0";
        amountText.fontSize = 20;
        amountText.color = "white";
        amountText.width = "80px";
        amountText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        amountText.fontWeight = "bold";
        amountText.id = `${resourceType}Amount`;
        container.addControl(amountText);

        // ذخیره مقدار برای به‌روزرسانی
        this.resourceElements = this.resourceElements || {};
        this.resourceElements[resourceType] = amountText;

        return container;
    }

    createBottomActionBar() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("actionBar");
        this.guiTextures.set("actionBar", advancedTexture);

        const actionContainer = new BABYLON.GUI.Rectangle();
        actionContainer.width = "500px";
        actionContainer.height = "80px";
        actionContainer.cornerRadius = 25;
        actionContainer.background = "rgba(0, 0, 0, 0.25)";
        actionContainer.thickness = 0;
        actionContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        actionContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        actionContainer.top = "-30px";
        actionContainer.shadowColor = "rgba(0, 0, 0, 0.4)";
        actionContainer.shadowBlur = 15;
        advancedTexture.addControl(actionContainer);

        // دکمه‌های اصلی اقدام
        const mainActions = [
            { id: "build", icon: "🏗️", text: "ساخت", action: () => this.toggleBuildingPalette() },
            { id: "attack", icon: "⚔️", text: "حمله", action: () => this.startAttackMode() },
            { id: "units", icon: "👥", text: "نیروها", action: () => this.toggleUnitDeployment() },
            { id: "map", icon: "🗺️", text: "نقشه", action: () => this.showWorldMap() },
            { id: "menu", icon: "⚙️", text: "منو", action: () => this.showGameMenu() }
        ];

        const actionGrid = new BABYLON.GUI.Grid();
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addColumnDefinition(0.2);
        actionGrid.addRowDefinition(1);
        actionContainer.addControl(actionGrid);

        mainActions.forEach((action, index) => {
            const actionButton = this.createModernActionButton(action);
            actionGrid.addControl(actionButton, 0, index);
        });
    }

    createModernActionButton(config) {
        const button = new BABYLON.GUI.Button();
        button.width = "70px";
        button.height = "70px";
        button.background = "rgba(255, 255, 255, 0.1)";
        button.cornerRadius = 35;
        button.thickness = 0;
        
        const buttonContent = new BABYLON.GUI.StackPanel();
        button.addControl(buttonContent);

        // آیکون
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = config.icon;
        icon.fontSize = 24;
        icon.color = "white";
        icon.height = "40px";
        buttonContent.addControl(icon);

        // متن
        const text = new BABYLON.GUI.TextBlock();
        text.text = config.text;
        text.fontSize = 12;
        text.color = "rgba(255, 255, 255, 0.8)";
        text.height = "20px";
        buttonContent.addControl(text);

        // افکت‌های hover
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
            button.scaleX = 1.1;
            button.scaleY = 1.1;
        });

        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
            button.scaleX = 1.0;
            button.scaleY = 1.0;
        });

        button.onPointerClickObservable.add(() => {
            config.action();
            this.createRippleEffect(button);
        });

        return button;
    }

    createRippleEffect(button) {
        const ripple = new BABYLON.GUI.Ellipse();
        ripple.width = "10px";
        ripple.height = "10px";
        ripple.color = "white";
        ripple.background = "rgba(255, 255, 255, 0.3)";
        ripple.thickness = 0;
        
        button.addControl(ripple);

        // انیمیشن ripple
        let scale = 1;
        const animation = () => {
            scale += 0.3;
            ripple.scaleX = scale;
            ripple.scaleY = scale;
            ripple.alpha = 1 - (scale - 1) / 3;
            
            if (scale < 4) {
                requestAnimationFrame(animation);
            } else {
                button.removeControl(ripple);
            }
        };
        
        animation();
    }

    createBuildingPalette() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("buildingPalette");
        advancedTexture.isVisible = false;
        this.guiTextures.set("buildingPalette", advancedTexture);

        const paletteContainer = new BABYLON.GUI.Rectangle();
        paletteContainer.width = "600px";
        paletteContainer.height = "120px";
        paletteContainer.cornerRadius = 30;
        paletteContainer.background = "rgba(0, 0, 0, 0.4)";
        paletteContainer.thickness = 0;
        paletteContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        paletteContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        paletteContainer.top = "-130px";
        paletteContainer.shadowColor = "rgba(0, 0, 0, 0.6)";
        paletteContainer.shadowBlur = 20;
        advancedTexture.addControl(paletteContainer);

        // ساختمان‌های قابل ساخت
        const buildings = [
            { type: "mine", icon: "💰", name: "معدن", cost: "150 طلا" },
            { type: "barracks", icon: "⚔️", name: "سربازخانه", cost: "200 طلا" },
            { type: "wall", icon: "🧱", name: "دیوار", cost: "50 طلا" },
            { type: "cannon", icon: "🔫", name: "توپخانه", cost: "250 طلا" },
            { type: "archertower", icon: "🏹", name: "برج کماندار", cost: "300 طلا" }
        ];

        const buildingGrid = new BABYLON.GUI.Grid();
        buildingGrid.addColumnDefinition(0.2);
        buildingGrid.addColumnDefinition(0.2);
        buildingGrid.addColumnDefinition(0.2);
        buildingGrid.addColumnDefinition(0.2);
        buildingGrid.addColumnDefinition(0.2);
        buildingGrid.addRowDefinition(1);
        paletteContainer.addControl(buildingGrid);

        buildings.forEach((building, index) => {
            const buildingButton = this.createBuildingButton(building);
            buildingGrid.addControl(buildingButton, 0, index);
        });
    }

    createBuildingButton(buildingConfig) {
        const button = new BABYLON.GUI.Button();
        button.width = "80px";
        button.height = "80px";
        button.background = "rgba(255, 255, 255, 0.15)";
        button.cornerRadius = 20;
        button.thickness = 0;

        const buttonContent = new BABYLON.GUI.StackPanel();
        button.addControl(buttonContent);

        // آیکون
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = buildingConfig.icon;
        icon.fontSize = 28;
        icon.color = "white";
        icon.height = "40px";
        buttonContent.addControl(icon);

        // نام
        const name = new BABYLON.GUI.TextBlock();
        name.text = buildingConfig.name;
        name.fontSize = 11;
        name.color = "rgba(255, 255, 255, 0.9)";
        name.height = "20px";
        buttonContent.addControl(name);

        // هزینه
        const cost = new BABYLON.GUI.TextBlock();
        cost.text = buildingConfig.cost;
        cost.fontSize = 9;
        cost.color = "gold";
        cost.height = "15px";
        buttonContent.addControl(cost);

        // رویدادها
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.25)";
        });

        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.15)";
        });

        button.onPointerClickObservable.add(() => {
            this.selectBuilding(buildingConfig.type);
            this.toggleBuildingPalette();
        });

        return button;
    }

    createUnitDeploymentBar() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("unitDeployment");
        advancedTexture.isVisible = false;
        this.guiTextures.set("unitDeployment", advancedTexture);

        const deploymentContainer = new BABYLON.GUI.Rectangle();
        deploymentContainer.width = "500px";
        deploymentContainer.height = "100px";
        deploymentContainer.cornerRadius = 25;
        deploymentContainer.background = "rgba(0, 0, 0, 0.4)";
        deploymentContainer.thickness = 0;
        deploymentContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        deploymentContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        deploymentContainer.top = "-130px";
        advancedTexture.addControl(deploymentContainer);

        // واحدهای قابل استقرار
        const units = [
            { type: "soldier", icon: "⚔️", name: "سرباز", cost: "50 اکسیر" },
            { type: "archer", icon: "🏹", name: "کماندار", cost: "100 اکسیر" },
            { type: "giant", icon: "🛡️", name: "غول", cost: "500 اکسیر" },
            { type: "healer", icon: "❤️", name: "درمانگر", cost: "150 اکسیر" }
        ];

        const unitGrid = new BABYLON.GUI.Grid();
        unitGrid.addColumnDefinition(0.25);
        unitGrid.addColumnDefinition(0.25);
        unitGrid.addColumnDefinition(0.25);
        unitGrid.addColumnDefinition(0.25);
        unitGrid.addRowDefinition(1);
        deploymentContainer.addControl(unitGrid);

        units.forEach((unit, index) => {
            const unitButton = this.createUnitButton(unit);
            unitGrid.addControl(unitButton, 0, index);
        });
    }

    createUnitButton(unitConfig) {
        const button = new BABYLON.GUI.Button();
        button.width = "90px";
        button.height = "90px";
        button.background = "rgba(255, 255, 255, 0.1)";
        button.cornerRadius = 20;
        button.thickness = 0;

        const buttonContent = new BABYLON.GUI.StackPanel();
        button.addControl(buttonContent);

        // آیکون
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = unitConfig.icon;
        icon.fontSize = 32;
        icon.color = "#E52E71";
        icon.height = "45px";
        buttonContent.addControl(icon);

        // نام
        const name = new BABYLON.GUI.TextBlock();
        name.text = unitConfig.name;
        name.fontSize = 12;
        name.color = "white";
        name.height = "20px";
        buttonContent.addControl(name);

        // هزینه
        const cost = new BABYLON.GUI.TextBlock();
        cost.text = unitConfig.cost;
        cost.fontSize = 10;
        cost.color = "#E52E71";
        cost.height = "15px";
        buttonContent.addControl(cost);

        // رویدادها
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
        });

        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
        });

        button.onPointerClickObservable.add(() => {
            this.deployUnit(unitConfig.type);
        });

        return button;
    }

    createMiniMap(advancedTexture) {
        const miniMapContainer = new BABYLON.GUI.Rectangle();
        miniMapContainer.width = "120px";
        miniMapContainer.height = "120px";
        miniMapContainer.cornerRadius = 15;
        miniMapContainer.background = "rgba(0, 0, 0, 0.3)";
        miniMapContainer.thickness = 2;
        miniMapContainer.color = "rgba(255, 255, 255, 0.5)";
        miniMapContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        miniMapContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        miniMapContainer.left = "-20px";
        miniMapContainer.top = "20px";
        advancedTexture.addControl(miniMapContainer);

        const mapText = new BABYLON.GUI.TextBlock();
        mapText.text = "🗺️";
        mapText.fontSize = 24;
        mapText.color = "white";
        miniMapContainer.addControl(mapText);
    }

    createGameInfo(advancedTexture) {
        const infoContainer = new BABYLON.GUI.Rectangle();
        infoContainer.width = "150px";
        infoContainer.height = "80px";
        infoContainer.cornerRadius = 15;
        infoContainer.background = "rgba(0, 0, 0, 0.2)";
        infoContainer.thickness = 0;
        infoContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        infoContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        infoContainer.left = "20px";
        infoContainer.top = "-20px";
        advancedTexture.addControl(infoContainer);

        const infoStack = new BABYLON.GUI.StackPanel();
        infoContainer.addControl(infoStack);

        // FPS
        const fpsText = new BABYLON.GUI.TextBlock();
        fpsText.text = "FPS: 60";
        fpsText.fontSize = 12;
        fpsText.color = "lime";
        fpsText.id = "fpsCounter";
        infoStack.addControl(fpsText);

        // سطح بازیکن
        const levelText = new BABYLON.GUI.TextBlock();
        levelText.text = "سطح: 1";
        levelText.fontSize = 12;
        levelText.color = "gold";
        infoStack.addControl(levelText);
    }

    // متدهای کنترل رابط کاربری
    toggleBuildingPalette() {
        const palette = this.guiTextures.get("buildingPalette");
        const deployment = this.guiTextures.get("unitDeployment");
        
        if (palette) {
            palette.isVisible = !palette.isVisible;
        }
        if (deployment) {
            deployment.isVisible = false;
        }
    }

    toggleUnitDeployment() {
        const deployment = this.guiTextures.get("unitDeployment");
        const palette = this.guiTextures.get("buildingPalette");
        
        if (deployment) {
            deployment.isVisible = !deployment.isVisible;
        }
        if (palette) {
            palette.isVisible = false;
        }
    }

    selectBuilding(buildingType) {
        if (this.buildingSystem) {
            this.buildingSystem.startBuildingPlacement(buildingType);
            this.showNotification(`ساخت ${this.getBuildingName(buildingType)} انتخاب شد`);
        }
    }

    deployUnit(unitType) {
        if (this.combatSystem && this.combatSystem.attackMode) {
            // در حالت حمله، واحد مستقر می‌شود
            this.showNotification(`آماده استقرار ${this.getUnitName(unitType)}`);
        } else {
            // در حالت عادی، واحد آموزش داده می‌شود
            this.trainUnit(unitType);
        }
    }

    trainUnit(unitType) {
        if (this.unitSystem) {
            const barracks = this.buildingSystem.getBuildingsByType('barracks');
            if (barracks.length > 0) {
                this.unitSystem.trainUnit(unitType, barracks[0].id);
                this.showNotification(`آموزش ${this.getUnitName(unitType)} آغاز شد`);
            } else {
                this.showNotification("هیچ سربازخانه‌ای ندارید!");
            }
        }
    }

    startAttackMode() {
        if (this.combatSystem) {
            this.combatSystem.startAttackMode({
                name: "پایگاه دشمن سطح ۱",
                difficulty: "آسان"
            });
            this.toggleUnitDeployment();
        }
    }

    showWorldMap() {
        this.showNotification("نقشه جهان به زودی در دسترس خواهد بود");
    }

    showGameMenu() {
        this.showNotification("منوی بازی به زودی در دسترس خواهد بود");
    }

    // متدهای ابزاری
    getBuildingName(type) {
        const names = {
            'mine': 'معدن طلا',
            'barracks': 'سربازخانه',
            'wall': 'دیوار دفاعی',
            'cannon': 'توپخانه',
            'archertower': 'برج کماندار'
        };
        return names[type] || type;
    }

    getUnitName(type) {
        const names = {
            'soldier': 'سرباز',
            'archer': 'کماندار',
            'giant': 'غول',
            'healer': 'درمانگر'
        };
        return names[type] || type;
    }

    showNotification(message, duration = 3000) {
        console.log('📢 ' + message);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            border: 2px solid gold;
            backdrop-filter: blur(10px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
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
        this.updateFPS();
    }

    updateResourceDisplay() {
        if (this.resourceManager && this.resourceElements) {
            Object.keys(this.resourceElements).forEach(resourceType => {
                const element = this.resourceElements[resourceType];
                if (element && this.resourceManager.resources[resourceType] !== undefined) {
                    element.text = Math.floor(this.resourceManager.resources[resourceType]).toString();
                }
            });
        }
    }

    updateFPS() {
        const fpsElement = document.getElementById('fpsCounter');
        if (fpsElement && this.gameEngine && this.gameEngine.engine) {
            const fps = this.gameEngine.engine.getFps().toFixed(1);
            fpsElement.textContent = `FPS: ${fps}`;
            
            // رنگ بر اساس عملکرد
            if (fps < 30) {
                fpsElement.color = "red";
            } else if (fps < 50) {
                fpsElement.color = "yellow";
            } else {
                fpsElement.color = "lime";
            }
        }
    }

    dispose() {
        this.guiTextures.forEach(texture => {
            texture.dispose();
        });
        this.guiTextures.clear();
    }
}

// صادر کردن برای استفاده در ماژول‌های دیگر
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernUIManager;
  }
