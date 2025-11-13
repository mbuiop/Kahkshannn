class UIManager {
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
        this.currentMenu = null;
        
        this.initializeUI();
    }

    initializeUI() {
        this.createMainHUD();
        this.createBuildingMenu();
        this.createUnitTrainingMenu();
        this.createSettingsMenu();
        this.createGameMenu();
        
        this.setupEventListeners();
        this.startUITicker();
    }

    createMainHUD() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("mainHUD");
        this.guiTextures.set("mainHUD", advancedTexture);

        // Top resource bar
        this.createResourceBar(advancedTexture);
        
        // Bottom action bar
        this.createActionBar(advancedTexture);
        
        // Mini-map
        this.createMiniMap(advancedTexture);
        
        // Game info panel
        this.createGameInfoPanel(advancedTexture);
    }

    createResourceBar(advancedTexture) {
        const resourcePanel = new BABYLON.GUI.StackPanel();
        resourcePanel.width = "400px";
        resourcePanel.height = "80px";
        resourcePanel.background = "rgba(0,0,0,0.7)";
        resourcePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        resourcePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        resourcePanel.left = "20px";
        resourcePanel.top = "20px";
        resourcePanel.isPointerBlocker = true;
        advancedTexture.addControl(resourcePanel);

        // Gold
        const goldPanel = this.createResourceItem("gold", "💰", "goldAmount");
        resourcePanel.addControl(goldPanel);

        // Elixir
        const elixirPanel = this.createResourceItem("elixir", "⚗️", "elixirAmount");
        resourcePanel.addControl(elixirPanel);

        // Gem
        const gemPanel = this.createResourceItem("gem", "💎", "gemAmount");
        resourcePanel.addControl(gemPanel);

        this.activePanels.set("resourceBar", resourcePanel);
    }

    createResourceItem(resourceType, icon, elementId) {
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "120px";
        panel.height = "60px";
        panel.isVertical = false;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

        // Icon
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.width = "30px";
        iconText.fontSize = 24;
        iconText.color = "white";
        iconText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.addControl(iconText);

        // Amount
        const amountText = new BABYLON.GUI.TextBlock();
        amountText.text = "0";
        amountText.width = "80px";
        amountText.fontSize = 20;
        amountText.color = "white";
        amountText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        amountText.id = elementId;
        panel.addControl(amountText);

        // Store reference for updates
        this.resourceElements = this.resourceElements || {};
        this.resourceElements[resourceType] = amountText;

        return panel;
    }

    createActionBar(advancedTexture) {
        const actionPanel = new BABYLON.GUI.StackPanel();
        actionPanel.width = "600px";
        actionPanel.height = "80px";
        actionPanel.background = "rgba(0,0,0,0.7)";
        actionPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        actionPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        actionPanel.top = "-20px";
        actionPanel.isPointerBlocker = true;
        advancedTexture.addControl(actionPanel);

        // Action buttons
        const buttons = [
            { id: "build", text: "🏗️ ساخت", icon: "🏗️", action: () => this.showBuildingMenu() },
            { id: "attack", text: "⚔️ حمله", icon: "⚔️", action: () => this.startAttack() },
            { id: "units", text: "👥 نیروها", icon: "👥", action: () => this.showUnitTrainingMenu() },
            { id: "map", text: "🗺️ نقشه", icon: "🗺️", action: () => this.showWorldMap() },
            { id: "settings", text: "⚙️ تنظیمات", icon: "⚙️", action: () => this.showSettingsMenu() },
            { id: "menu", text: "≡ منو", icon: "≡", action: () => this.showGameMenu() }
        ];

        buttons.forEach(buttonConfig => {
            const button = this.createActionButton(buttonConfig);
            actionPanel.addControl(button);
        });

        this.activePanels.set("actionBar", actionPanel);
    }

    createActionButton(config) {
        const button = BABYLON.GUI.Button.CreateSimpleButton(config.id, config.text);
        button.width = "90px";
        button.height = "60px";
        button.color = "white";
        button.background = "rgba(50,50,50,0.8)";
        button.fontSize = 14;
        button.thickness = 2;
        button.cornerRadius = 10;
        
        // Hover effects
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(70,70,70,0.9)";
            button.color = "gold";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(50,50,50,0.8)";
            button.color = "white";
        });
        
        button.onPointerClickObservable.add(() => {
            config.action();
            this.playButtonSound();
        });

        return button;
    }

    createMiniMap(advancedTexture) {
        const miniMapPanel = new BABYLON.GUI.Rectangle();
        miniMapPanel.width = "150px";
        miniMapPanel.height = "150px";
        miniMapPanel.background = "rgba(0,0,0,0.7)";
        miniMapPanel.thickness = 2;
        miniMapPanel.color = "white";
        miniMapPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        miniMapPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        miniMapPanel.left = "-20px";
        miniMapPanel.top = "20px";
        miniMapPanel.isPointerBlocker = true;
        advancedTexture.addControl(miniMapPanel);

        // Mini-map content would go here
        const mapText = new BABYLON.GUI.TextBlock();
        mapText.text = "🗺️ نقشه";
        mapText.color = "white";
        mapText.fontSize = 16;
        miniMapPanel.addControl(mapText);

        // Click to focus on base
        miniMapPanel.onPointerClickObservable.add(() => {
            if (this.gameEngine && this.gameEngine.camera) {
                this.gameEngine.camera.position = new BABYLON.Vector3(0, 30, -20);
                this.gameEngine.camera.target = new BABYLON.Vector3(0, 0, 0);
            }
        });

        this.activePanels.set("miniMap", miniMapPanel);
    }

    createGameInfoPanel(advancedTexture) {
        const infoPanel = new BABYLON.GUI.StackPanel();
        infoPanel.width = "200px";
        infoPanel.height = "100px";
        infoPanel.background = "rgba(0,0,0,0.5)";
        infoPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        infoPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        infoPanel.left = "-20px";
        infoPanel.top = "-20px";
        advancedTexture.addControl(infoPanel);

        // FPS counter
        const fpsText = new BABYLON.GUI.TextBlock();
        fpsText.text = "FPS: 60";
        fpsText.color = "lime";
        fpsText.fontSize = 14;
        fpsText.id = "fpsCounter";
        infoPanel.addControl(fpsText);

        // Player level
        const levelText = new BABYLON.GUI.TextBlock();
        levelText.text = "سطح: 1";
        levelText.color = "gold";
        levelText.fontSize = 14;
        levelText.id = "playerLevel";
        infoPanel.addControl(levelText);

        // Game time
        const timeText = new BABYLON.GUI.TextBlock();
        timeText.text = "زمان: 00:00";
        timeText.color = "white";
        timeText.fontSize = 14;
        timeText.id = "gameTime";
        infoPanel.addControl(timeText);

        this.activePanels.set("gameInfo", infoPanel);
    }

    createBuildingMenu() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("buildingMenu");
        advancedTexture.isVisible = false;
        this.guiTextures.set("buildingMenu", advancedTexture);

        const mainPanel = new BABYLON.GUI.StackPanel();
        mainPanel.width = "800px";
        mainPanel.height = "400px";
        mainPanel.background = "rgba(0,0,0,0.9)";
        mainPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        mainPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(mainPanel);

        // Title
        const title = new BABYLON.GUI.TextBlock();
        title.text = "🏗️ منوی ساخت ساختمان";
        title.color = "gold";
        title.fontSize = 32;
        title.height = "60px";
        title.fontWeight = "bold";
        mainPanel.addControl(title);

        // Building grid
        const buildingGrid = new BABYLON.GUI.Grid();
        buildingGrid.width = "760px";
        buildingGrid.height = "280px";
        buildingGrid.addColumnDefinition(0.25);
        buildingGrid.addColumnDefinition(0.25);
        buildingGrid.addColumnDefinition(0.25);
        buildingGrid.addColumnDefinition(0.25);
        buildingGrid.addRowDefinition(0.5);
        buildingGrid.addRowDefinition(0.5);
        mainPanel.addControl(buildingGrid);

        const buildings = [
            { type: "mine", name: "معدن طلا", icon: "💰", cost: "150 طلا" },
            { type: "barracks", name: "سربازخانه", icon: "⚔️", cost: "200 طلا" },
            { type: "wall", name: "دیوار", icon: "🧱", cost: "50 طلا" },
            { type: "cannon", name: "توپخانه", icon: "🔫", cost: "250 طلا" },
            { type: "archertower", name: "برج کماندار", icon: "🏹", cost: "300 طلا" },
            { type: "townhall", name: "ارتقا سالن", icon: "🏛️", cost: "1000 طلا" }
        ];

        buildings.forEach((building, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            
            const buildingButton = this.createBuildingButton(building);
            buildingGrid.addControl(buildingButton, row, col);
        });

        // Close button
        const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeBuild", "بستن");
        closeButton.width = "200px";
        closeButton.height = "40px";
        closeButton.color = "white";
        closeButton.background = "red";
        closeButton.fontSize = 18;
        closeButton.onPointerClickObservable.add(() => {
            this.hideBuildingMenu();
        });
        mainPanel.addControl(closeButton);
    }

    createBuildingButton(buildingConfig) {
        const button = BABYLON.GUI.Button.CreateSimpleButton(buildingConfig.type, "");
        button.width = "170px";
        button.height = "120px";
        button.background = "rgba(50,50,50,0.8)";
        button.thickness = 2;
        button.cornerRadius = 10;
        
        const stackPanel = new BABYLON.GUI.StackPanel();
        button.addControl(stackPanel);

        // Icon
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = buildingConfig.icon;
        icon.fontSize = 36;
        icon.color = "gold";
        icon.height = "50px";
        stackPanel.addControl(icon);

        // Name
        const name = new BABYLON.GUI.TextBlock();
        name.text = buildingConfig.name;
        name.fontSize = 14;
        name.color = "white";
        name.height = "30px";
        stackPanel.addControl(name);

        // Cost
        const cost = new BABYLON.GUI.TextBlock();
        cost.text = buildingConfig.cost;
        cost.fontSize = 12;
        cost.color = "lime";
        cost.height = "20px";
        stackPanel.addControl(cost);

        // Hover effects
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(70,70,70,0.9)";
            this.showBuildingPreview(buildingConfig.type);
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(50,50,50,0.8)";
            this.hideBuildingPreview();
        });
        
        button.onPointerClickObservable.add(() => {
            this.selectBuildingForConstruction(buildingConfig.type);
        });

        return button;
    }

    showBuildingPreview(buildingType) {
        // Create ghost building preview
        this.buildingSystem.startBuildingPlacement(buildingType);
    }

    hideBuildingPreview() {
        // Hide ghost building
        if (this.buildingSystem.ghostMesh) {
            this.buildingSystem.ghostMesh.dispose();
            this.buildingSystem.ghostMesh = null;
            this.buildingSystem.currentBuildingType = null;
        }
    }

    selectBuildingForConstruction(buildingType) {
        this.hideBuildingMenu();
        this.buildingSystem.startBuildingPlacement(buildingType);
        this.showNotification(`ساخت ${this.buildingSystem.buildingConfig[buildingType].name} انتخاب شد`);
    }

    createUnitTrainingMenu() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("unitMenu");
        advancedTexture.isVisible = false;
        this.guiTextures.set("unitMenu", advancedTexture);

        const mainPanel = new BABYLON.GUI.StackPanel();
        mainPanel.width = "600px";
        mainPanel.height = "500px";
        mainPanel.background = "rgba(0,0,0,0.9)";
        mainPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        mainPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(mainPanel);

        // Title
        const title = new BABYLON.GUI.TextBlock();
        title.text = "👥 آموزش نیروها";
        title.color = "gold";
        title.fontSize = 32;
        title.height = "60px";
        title.fontWeight = "bold";
        mainPanel.addControl(title);

        // Unit training grid
        const unitGrid = new BABYLON.GUI.Grid();
        unitGrid.width = "560px";
        unitGrid.height = "380px";
        unitGrid.addColumnDefinition(0.5);
        unitGrid.addColumnDefinition(0.5);
        unitGrid.addRowDefinition(0.33);
        unitGrid.addRowDefinition(0.33);
        unitGrid.addRowDefinition(0.33);
        mainPanel.addControl(unitGrid);

        const units = [
            { type: "soldier", name: "سرباز", icon: "⚔️", cost: "50 اکسیر", time: "30 ثانیه" },
            { type: "archer", name: "کماندار", icon: "🏹", cost: "100 اکسیر", time: "45 ثانیه" },
            { type: "giant", name: "غول", icon: "🛡️", cost: "500 اکسیر", time: "2 دقیقه" },
            { type: "healer", name: "درمانگر", icon: "❤️", cost: "150 اکسیر", time: "1 دقیقه" }
        ];

        units.forEach((unit, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            
            const unitButton = this.createUnitTrainingButton(unit);
            unitGrid.addControl(unitButton, row, col);
        });

        // Close button
        const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeUnits", "بستن");
        closeButton.width = "200px";
        closeButton.height = "40px";
        closeButton.color = "white";
        closeButton.background = "red";
        closeButton.fontSize = 18;
        closeButton.onPointerClickObservable.add(() => {
            this.hideUnitTrainingMenu();
        });
        mainPanel.addControl(closeButton);
    }

    createUnitTrainingButton(unitConfig) {
        const button = BABYLON.GUI.Button.CreateSimpleButton(unitConfig.type, "");
        button.width = "260px";
        button.height = "110px";
        button.background = "rgba(50,50,50,0.8)";
        button.thickness = 2;
        button.cornerRadius = 10;
        
        const stackPanel = new BABYLON.GUI.StackPanel();
        button.addControl(stackPanel);

        // Top row: Icon and name
        const topRow = new BABYLON.GUI.StackPanel();
        topRow.isVertical = false;
        topRow.height = "40px";
        stackPanel.addControl(topRow);

        const icon = new BABYLON.GUI.TextBlock();
        icon.text = unitConfig.icon;
        icon.fontSize = 24;
        icon.color = "gold";
        icon.width = "40px";
        topRow.addControl(icon);

        const name = new BABYLON.GUI.TextBlock();
        name.text = unitConfig.name;
        name.fontSize = 18;
        name.color = "white";
        name.width = "180px";
        name.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        topRow.addControl(name);

        // Cost
        const cost = new BABYLON.GUI.TextBlock();
        cost.text = `هزینه: ${unitConfig.cost}`;
        cost.fontSize = 14;
        cost.color = "#E52E71";
        cost.height = "25px";
        stackPanel.addControl(cost);

        // Time
        const time = new BABYLON.GUI.TextBlock();
        time.text = `زمان: ${unitConfig.time}`;
        time.fontSize = 14;
        time.color = "lime";
        time.height = "25px";
        stackPanel.addControl(time);

        // Hover effects
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(70,70,70,0.9)";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(50,50,50,0.8)";
        });
        
        button.onPointerClickObservable.add(() => {
            this.trainUnit(unitConfig.type);
        });

        return button;
    }

    trainUnit(unitType) {
        // Find available barracks
        const barracks = this.buildingSystem.getBuildingsByType('barracks');
        if (barracks.length === 0) {
            this.showNotification("هیچ سربازخانه‌ای برای آموزش نیرو ندارید!");
            return;
        }

        const success = this.unitSystem.trainUnit(unitType, barracks[0].id);
        if (success) {
            this.showNotification(`آموزش ${this.unitSystem.unitConfig[unitType].name} آغاز شد!`);
            this.hideUnitTrainingMenu();
        }
    }

    createSettingsMenu() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("settingsMenu");
        advancedTexture.isVisible = false;
        this.guiTextures.set("settingsMenu", advancedTexture);

        const mainPanel = new BABYLON.GUI.StackPanel();
        mainPanel.width = "500px";
        mainPanel.height = "400px";
        mainPanel.background = "rgba(0,0,0,0.9)";
        mainPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        mainPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(mainPanel);

        // Title
        const title = new BABYLON.GUI.TextBlock();
        title.text = "⚙️ تنظیمات بازی";
        title.color = "gold";
        title.fontSize = 32;
        title.height = "60px";
        title.fontWeight = "bold";
        mainPanel.addControl(title);

        // Graphics quality
        const graphicsPanel = this.createSettingsSection("گرافیک");
        mainPanel.addControl(graphicsPanel);

        const qualitySlider = this.createSlider("کیفیت گرافیک", 1, 3, 2);
        graphicsPanel.addControl(qualitySlider);

        // Sound settings
        const soundPanel = this.createSettingsSection("صدا");
        mainPanel.addControl(soundPanel);

        const musicSlider = this.createSlider("موسیقی", 0, 100, 80);
        soundPanel.addControl(musicSlider);

        const sfxSlider = this.createSlider("افکت‌ها", 0, 100, 90);
        soundPanel.addControl(sfxSlider);

        // Control settings
        const controlPanel = this.createSettingsSection("کنترل");
        mainPanel.addControl(controlPanel);

        const sensitivitySlider = this.createSlider("حساسیت دوربین", 1, 10, 5);
        controlPanel.addControl(sensitivitySlider);

        // Close button
        const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeSettings", "ذخیره و بستن");
        closeButton.width = "200px";
        closeButton.height = "40px";
        closeButton.color = "white";
        closeButton.background = "green";
        closeButton.fontSize = 18;
        closeButton.onPointerClickObservable.add(() => {
            this.hideSettingsMenu();
        });
        mainPanel.addControl(closeButton);
    }

    createSettingsSection(title) {
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "460px";
        panel.height = "80px";
        panel.background = "rgba(30,30,30,0.8)";
        panel.paddingTop = "10px";
        panel.paddingBottom = "10px";

        const titleText = new BABYLON.GUI.TextBlock();
        titleText.text = title;
        titleText.color = "gold";
        titleText.fontSize = 16;
        titleText.height = "25px";
        panel.addControl(titleText);

        return panel;
    }

    createSlider(label, min, max, value) {
        const sliderPanel = new BABYLON.GUI.StackPanel();
        sliderPanel.isVertical = false;
        sliderPanel.height = "30px";

        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "white";
        labelText.fontSize = 14;
        labelText.width = "120px";
        sliderPanel.addControl(labelText);

        const slider = new BABYLON.GUI.Slider();
        slider.width = "200px";
        slider.height = "20px";
        slider.minimum = min;
        slider.maximum = max;
        slider.value = value;
        slider.color = "gray";
        slider.background = "darkgray";
        slider.thumbColor = "gold";
        slider.onValueChangedObservable.add((newValue) => {
            console.log(`${label} changed to: ${newValue}`);
        });
        sliderPanel.addControl(slider);

        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value.toString();
        valueText.color = "white";
        valueText.fontSize = 14;
        valueText.width = "40px";
        sliderPanel.addControl(valueText);

        slider.onValueChangedObservable.add((newValue) => {
            valueText.text = Math.round(newValue).toString();
        });

        return sliderPanel;
    }

    createGameMenu() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("gameMenu");
        advancedTexture.isVisible = false;
        this.guiTextures.set("gameMenu", advancedTexture);

        const mainPanel = new BABYLON.GUI.StackPanel();
        mainPanel.width = "400px";
        mainPanel.height = "500px";
        mainPanel.background = "rgba(0,0,0,0.9)";
        mainPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        mainPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(mainPanel);

        // Title
        const title = new BABYLON.GUI.TextBlock();
        title.text = "≡ منوی بازی";
        title.color = "gold";
        title.fontSize = 32;
        title.height = "60px";
        title.fontWeight = "bold";
        mainPanel.addControl(title);

        // Menu buttons
        const menuButtons = [
            { text: "ادامه بازی", action: () => this.hideGameMenu() },
            { text: "ذخیره بازی", action: () => this.saveGame() },
            { text: "بارگذاری بازی", action: () => this.loadGame() },
            { text: "دستاوردها", action: () => this.showAchievements() },
            { text: "آمار بازی", action: () => this.showGameStats() },
            { text: "راهنما", action: () => this.showHelp() },
            { text: "خروج از بازی", action: () => this.quitGame() }
        ];

        menuButtons.forEach(buttonConfig => {
            const button = BABYLON.GUI.Button.CreateSimpleButton(buttonConfig.text, buttonConfig.text);
            button.width = "300px";
            button.height = "50px";
            button.color = "white";
            button.background = "rgba(50,50,50,0.8)";
            button.fontSize = 18;
            button.cornerRadius = 5;
            
            button.onPointerClickObservable.add(() => {
                buttonConfig.action();
                this.playButtonSound();
            });
            
            mainPanel.addControl(button);
        });
    }

    // Menu visibility control
    showBuildingMenu() {
        this.hideAllMenus();
        const menu = this.guiTextures.get("buildingMenu");
        if (menu) {
            menu.isVisible = true;
            this.currentMenu = "buildingMenu";
        }
    }

    hideBuildingMenu() {
        const menu = this.guiTextures.get("buildingMenu");
        if (menu) menu.isVisible = false;
        this.currentMenu = null;
    }

    showUnitTrainingMenu() {
        this.hideAllMenus();
        const menu = this.guiTextures.get("unitMenu");
        if (menu) {
            menu.isVisible = true;
            this.currentMenu = "unitMenu";
        }
    }

    hideUnitTrainingMenu() {
        const menu = this.guiTextures.get("unitMenu");
        if (menu) menu.isVisible = false;
        this.currentMenu = null;
    }

    showSettingsMenu() {
        this.hideAllMenus();
        const menu = this.guiTextures.get("settingsMenu");
        if (menu) {
            menu.isVisible = true;
            this.currentMenu = "settingsMenu";
        }
    }

    hideSettingsMenu() {
        const menu = this.guiTextures.get("settingsMenu");
        if (menu) menu.isVisible = false;
        this.currentMenu = null;
    }

    showGameMenu() {
        this.hideAllMenus();
        const menu = this.guiTextures.get("gameMenu");
        if (menu) {
            menu.isVisible = true;
            this.currentMenu = "gameMenu";
        }
    }

    hideGameMenu() {
        const menu = this.guiTextures.get("gameMenu");
        if (menu) menu.isVisible = false;
        this.currentMenu = null;
    }

    hideAllMenus() {
        this.guiTextures.forEach((texture, key) => {
            if (key !== "mainHUD") {
                texture.isVisible = false;
            }
        });
        this.currentMenu = null;
    }

    // Game actions
    startAttack() {
        // In a real game, this would show available targets
        const sampleTarget = {
            name: "پایگاه دشمن سطح ۱",
            difficulty: "آسان",
            rewards: { gold: 500, elixir: 300 }
        };
        
        this.combatSystem.startAttackMode(sampleTarget);
        this.showNotification("حالت حمله فعال شد! نیروها را مستقر کنید.");
    }

    showWorldMap() {
        this.showNotification("نقشه جهان در حال بارگذاری...");
        // Implementation would show world map with available targets
    }

    saveGame() {
        // Save all game systems
        const saveData = {
            resources: this.resourceManager.save(),
            buildings: this.buildingSystem.save(),
            units: this.unitSystem.save(),
            combat: this.combatSystem.save(),
            timestamp: Date.now()
        };

        localStorage.setItem('gameSave', JSON.stringify(saveData));
        this.showNotification("بازی ذخیره شد! 💾", 2000);
    }

    loadGame() {
        const saved = localStorage.getItem('gameSave');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                
                this.resourceManager.load();
                this.buildingSystem.load();
                this.unitSystem.load();
                this.combatSystem.load();
                
                this.showNotification("بازی بارگذاری شد! 🎮", 2000);
            } catch (e) {
                this.showNotification("خطا در بارگذاری بازی!", 3000);
            }
        } else {
            this.showNotification("هیچ ذخیره‌ای پیدا نشد!", 3000);
        }
    }

    showAchievements() {
        this.showNotification("سیستم دستاوردها به زودی...");
    }

    showGameStats() {
        const buildingStats = this.buildingSystem.getBuildingStatistics();
        const unitStats = this.unitSystem.getUnitStatistics();
        const combatStats = this.combatSystem.getCombatReport();

        const statsMessage = `
            آمار بازی:
            ساختمان‌ها: ${buildingStats.total}
            نیروها: ${unitStats.total}
            آسیب کل: ${combatStats.stats.totalDamageDealt}
            دشمنان کشته: ${combatStats.stats.unitsKilled}
        `;

        this.showNotification(statsMessage, 5000);
    }

    showHelp() {
        this.showNotification("راهنمای بازی در حال بارگذاری...");
    }

    quitGame() {
        if (confirm("آیا مطمئنید می‌خواهید از بازی خارج شوید؟")) {
            this.saveGame();
            // In a real game, this would return to main menu
            this.showNotification("بازی ذخیره شد. خداحافظ! 👋", 3000);
        }
    }

    // Notification system
    showNotification(message, duration = 3000) {
        const notification = {
            id: Date.now(),
            message: message,
            startTime: Date.now(),
            duration: duration
        };

        this.notifications.push(notification);
        this.createNotificationElement(notification);
        
        console.log(`[UI] ${message}`);
    }

    createNotificationElement(notification) {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(`notification_${notification.id}`);
        
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "400px";
        panel.height = "60px";
        panel.background = "rgba(0,0,0,0.8)";
        panel.cornerRadius = 10;
        panel.thickness = 2;
        panel.color = "gold";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.top = "120px";
        advancedTexture.addControl(panel);

        const text = new BABYLON.GUI.TextBlock();
        text.text = notification.message;
        text.color = "white";
        text.fontSize = 16;
        text.fontWeight = "bold";
        panel.addControl(text);

        // Auto-remove after duration
        setTimeout(() => {
            advancedTexture.dispose();
            this.notifications = this.notifications.filter(n => n.id !== notification.id);
        }, notification.duration);
    }

    // UI update system
    setupEventListeners() {
        // Listen for resource changes
        this.resourceManager.onResourceChange((type, oldValue, newValue) => {
            this.updateResourceDisplay(type, newValue);
        });

        // Listen for building events
        // This would be connected to building system events
    }

    updateResourceDisplay(resourceType, value) {
        const element = this.resourceElements[resourceType];
        if (element) {
            element.text = Math.floor(value).toString();
        }
    }

    startUITicker() {
        setInterval(() => {
            this.updateUI();
        }, 1000); // Update every second
    }

    updateUI() {
        this.updateFPS();
        this.updateGameTime();
        this.updateResourceDisplays();
    }

    updateFPS() {
        const fpsElement = this.activePanels.get("gameInfo")?.getChildByID("fpsCounter");
        if (fpsElement && this.gameEngine) {
            const fps = this.gameEngine.engine.getFps().toFixed(1);
            fpsElement.text = `FPS: ${fps}`;
            
            // Color code based on performance
            if (fps < 30) {
                fpsElement.color = "red";
            } else if (fps < 50) {
                fpsElement.color = "yellow";
            } else {
                fpsElement.color = "lime";
            }
        }
    }

    updateGameTime() {
        const timeElement = this.activePanels.get("gameInfo")?.getChildByID("gameTime");
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('fa-IR');
            timeElement.text = `زمان: ${timeString}`;
        }
    }

    updateResourceDisplays() {
        // Update all resource displays from resource manager
        Object.keys(this.resourceElements).forEach(resourceType => {
            const value = this.resourceManager.resources[resourceType];
            this.updateResourceDisplay(resourceType, value);
        });
    }

    playButtonSound() {
        // Play button click sound
        console.log("🔊 Button click sound");
    }

    // Responsive UI adjustments
    handleResize() {
        // Adjust UI elements for different screen sizes
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (width < 768) {
            // Mobile layout
            this.adjustForMobile();
        } else {
            // Desktop layout
            this.adjustForDesktop();
        }
    }

    adjustForMobile() {
        // Scale down UI elements for mobile
        const actionBar = this.activePanels.get("actionBar");
        if (actionBar) {
            actionBar.width = "400px";
            actionBar.fontSize = 12;
        }
    }

    adjustForDesktop() {
        // Standard desktop layout
        const actionBar = this.activePanels.get("actionBar");
        if (actionBar) {
            actionBar.width = "600px";
            actionBar.fontSize = 14;
        }
    }

    // Cleanup
    dispose() {
        this.guiTextures.forEach(texture => {
            texture.dispose();
        });
        this.guiTextures.clear();
        this.activePanels.clear();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
             }
