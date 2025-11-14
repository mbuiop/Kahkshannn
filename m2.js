// m2.js - سیستم رابط کاربری پیشرفته
// ===============================================

class AdvancedUIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        
        // سیستم رابط کاربری پیشرفته
        this.advancedGUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("AdvancedUI");
        this.advancedGUI.idealWidth = 1920;
        this.advancedGUI.idealHeight = 1080;
        this.advancedGUI.useSmallestIdeal = true;
        this.advancedGUI.renderAtIdealSize = true;
        
        // حالت‌های مختلف UI
        this.currentMode = "normal"; // normal, build, battle, attack
        this.selectedBuilding = null;
        this.buildMenu = null;
        this.unitMenu = null;
        
        // المان‌های UI
        this.uiElements = new Map();
        this.notifications = [];
        this.contextMenus = new Map();
        
        // سیستم اطلاع‌رسانی
        this.notificationSystem = new NotificationSystem(this);
        
        // سیستم صدا
        this.soundSystem = new SoundSystem();
        
        this.init();
    }
    
    async init() {
        try {
            await this.createMainInterface();
            await this.createBuildMenu();
            await this.createUnitMenu();
            await this.createBattleInterface();
            await this.createContextMenus();
            await this.createHUD();
            await this.setupEventListeners();
            
            console.log("✅ سیستم رابط کاربری پیشرفته راه‌اندازی شد");
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی رابط کاربری:", error);
        }
    }
    
    async createMainInterface() {
        // ایجاد رابط کاربری اصلی
        await this.createTopBar();
        await this.createSidePanels();
        await this.createBottomBar();
        await this.createMinimap();
        await this.createQuickActions();
    }
    
    async createTopBar() {
        // نوار بالایی - منابع و اطلاعات اصلی
        const topBar = new BABYLON.GUI.Rectangle();
        topBar.width = "95%";
        topBar.height = "80px";
        topBar.cornerRadius = 15;
        topBar.background = "rgba(0, 0, 0, 0.85)";
        topBar.thickness = 3;
        topBar.color = "gold";
        topBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        topBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        topBar.paddingTop = "10px";
        topBar.paddingBottom = "10px";
        topBar.paddingLeft = "20px";
        topBar.paddingRight = "20px";
        this.advancedGUI.addControl(topBar);
        
        // شبکه برای چیدمان المان‌ها
        const grid = new BABYLON.GUI.Grid();
        grid.width = "100%";
        grid.height = "100%";
        grid.addColumnDefinition(0.2); // لوگو
        grid.addColumnDefinition(0.4); // منابع
        grid.addColumnDefinition(0.3); // اطلاعات
        grid.addColumnDefinition(0.1); // دکمه‌ها
        topBar.addControl(grid);
        
        // لوگو بازی
        const logoPanel = this.createLogo();
        grid.addControl(logoPanel, 0, 0);
        
        // پنل منابع
        const resourcesPanel = this.createResourcesPanel();
        grid.addControl(resourcesPanel, 0, 1);
        
        // پنل اطلاعات
        const infoPanel = this.createInfoPanel();
        grid.addControl(infoPanel, 0, 2);
        
        // دکمه‌های کنترل
        const controlsPanel = this.createControlsPanel();
        grid.addControl(controlsPanel, 0, 3);
        
        this.uiElements.set("topBar", topBar);
    }
    
    createLogo() {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "100%";
        
        // آیکون بازی
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = "🏰";
        icon.fontSize = 36;
        icon.color = "gold";
        icon.width = "50px";
        icon.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(icon);
        
        // نام بازی
        const title = new BABYLON.GUI.TextBlock();
        title.text = "جنگ قبیله‌ای";
        title.fontSize = 20;
        title.color = "white";
        title.fontWeight = "bold";
        title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        title.paddingLeft = "10px";
        container.addControl(title);
        
        return container;
    }
    
    createResourcesPanel() {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "100%";
        container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        
        // طلا
        const goldPanel = this.createResourceItem("gold", "طلا", "#FFD700", "💰");
        container.addControl(goldPanel);
        
        // اکسیر
        const elixirPanel = this.createResourceItem("elixir", "اکسیر", "#8A2BE2", "⚗️");
        container.addControl(elixirPanel);
        
        // الماس
        const gemPanel = this.createResourceItem("gem", "الماس", "#00BFFF", "💎");
        container.addControl(gemPanel);
        
        return container;
    }
    
    createResourceItem(type, name, color, icon) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = true;
        container.width = "120px";
        container.height = "100%";
        container.paddingLeft = "10px";
        container.paddingRight = "10px";
        
        // مقدار و آیکون
        const valuePanel = new BABYLON.GUI.StackPanel();
        valuePanel.isVertical = false;
        valuePanel.height = "40px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 20;
        iconText.color = color;
        iconText.width = "30px";
        valuePanel.addControl(iconText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = "0";
        valueText.color = "white";
        valueText.fontSize = 18;
        valueText.fontWeight = "bold";
        valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        valueText.name = `${type}Value`;
        valuePanel.addControl(valueText);
        
        // نوار ظرفیت
        const capacityBar = new BABYLON.GUI.Rectangle();
        capacityBar.width = "100px";
        capacityBar.height = "6px";
        capacityBar.cornerRadius = 3;
        capacityBar.background = "#333333";
        capacityBar.thickness = 1;
        capacityBar.color = "#666666";
        
        const progress = new BABYLON.GUI.Rectangle();
        progress.width = "50%";
        progress.height = "6px";
        progress.cornerRadius = 3;
        progress.background = color;
        progress.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        progress.name = `${type}Progress`;
        capacityBar.addControl(progress);
        
        // نام منبع
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = name;
        nameText.color = "#cccccc";
        nameText.fontSize = 12;
        nameText.height = "20px";
        
        container.addControl(valuePanel);
        container.addControl(capacityBar);
        container.addControl(nameText);
        
        return container;
    }
    
    createInfoPanel() {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "100%";
        
        // سطح بازیکن
        const levelPanel = this.createInfoItem("سطح", "1", "⭐");
        container.addControl(levelPanel);
        
        // قدرت قبیله
        const powerPanel = this.createInfoItem("قدرت", "0", "⚡");
        container.addControl(powerPanel);
        
        // جمعیت
        const populationPanel = this.createInfoItem("جمعیت", "0/50", "👥");
        container.addControl(populationPanel);
        
        return container;
    }
    
    createInfoItem(label, value, icon) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = true;
        container.width = "80px";
        container.height = "100%";
        container.paddingLeft = "5px";
        container.paddingRight = "5px";
        
        const valuePanel = new BABYLON.GUI.StackPanel();
        valuePanel.isVertical = false;
        valuePanel.height = "30px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 16;
        iconText.color = "gold";
        iconText.width = "20px";
        valuePanel.addControl(iconText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.color = "white";
        valueText.fontSize = 14;
        valueText.fontWeight = "bold";
        valueText.name = `${label}Value`;
        valuePanel.addControl(valueText);
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "#cccccc";
        labelText.fontSize = 10;
        labelText.height = "15px";
        
        container.addControl(valuePanel);
        container.addControl(labelText);
        
        return container;
    }
    
    createControlsPanel() {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "100%";
        
        // دکمه تنظیمات
        const settingsBtn = this.createIconButton("⚙️", "تنظیمات", () => this.showSettings());
        container.addControl(settingsBtn);
        
        // دکمه کمک
        const helpBtn = this.createIconButton("❓", "راهنما", () => this.showHelp());
        container.addControl(helpBtn);
        
        return container;
    }
    
    createIconButton(icon, tooltip, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "50px";
        button.height = "50px";
        button.cornerRadius = 10;
        button.background = "rgba(255, 255, 255, 0.1)";
        button.thickness = 2;
        button.color = "gold";
        button.padding = "5px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 20;
        iconText.color = "white";
        button.addControl(iconText);
        
        // tooltip
        button.onPointerEnterObservable.add(() => {
            this.showTooltip(button, tooltip);
        });
        
        button.onPointerOutObservable.add(() => {
            this.hideTooltip();
        });
        
        button.onPointerClickObservable.add(onClick);
        
        // افکت hover
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
        });
        
        return button;
    }
    
    async createSidePanels() {
        // پنل کناری چپ - کنترل‌های دوربین و حالت‌ها
        await this.createLeftPanel();
        
        // پنل کناری راست - اقدامات سریع
        await this.createRightPanel();
    }
    
    async createLeftPanel() {
        const leftPanel = new BABYLON.GUI.Rectangle();
        leftPanel.width = "70px";
        leftPanel.height = "300px";
        leftPanel.cornerRadius = 15;
        leftPanel.background = "rgba(0, 0, 0, 0.8)";
        leftPanel.thickness = 2;
        leftPanel.color = "#00BFFF";
        leftPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        leftPanel.paddingLeft = "10px";
        leftPanel.paddingTop = "20px";
        leftPanel.paddingBottom = "20px";
        this.advancedGUI.addControl(leftPanel);
        
        const buttonStack = new BABYLON.GUI.StackPanel();
        buttonStack.width = "100%";
        buttonStack.height = "100%";
        leftPanel.addControl(buttonStack);
        
        // دکمه‌های کنترل دوربین
        const cameraButtons = [
            { icon: "🔍", tooltip: "بزرگنمایی", action: () => this.zoomIn() },
            { icon: "🔎", tooltip: "کوچکنمایی", action: () => this.zoomOut() },
            { icon: "↻", tooltip: "چرخش راست", action: () => this.rotateRight() },
            { icon: "↺", tooltip: "چرخش چپ", action: () => this.rotateLeft() },
            { icon: "🏠", tooltip: "نمای اصلی", action: () => this.resetCamera() }
        ];
        
        cameraButtons.forEach(btn => {
            const button = this.createCameraButton(btn.icon, btn.tooltip, btn.action);
            buttonStack.addControl(button);
        });
        
        this.uiElements.set("leftPanel", leftPanel);
    }
    
    createCameraButton(icon, tooltip, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "50px";
        button.height = "50px";
        button.cornerRadius = 25;
        button.background = "rgba(255, 255, 255, 0.1)";
        button.thickness = 1;
        button.color = "#00BFFF";
        button.padding = "5px";
        button.marginBottom = "10px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 18;
        iconText.color = "white";
        button.addControl(iconText);
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
            this.showTooltip(button, tooltip);
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
            this.hideTooltip();
        });
        
        button.onPointerClickObservable.add(onClick);
        
        return button;
    }
    
    async createRightPanel() {
        const rightPanel = new BABYLON.GUI.Rectangle();
        rightPanel.width = "80px";
        rightPanel.height = "400px";
        rightPanel.cornerRadius = 15;
        rightPanel.background = "rgba(0, 0, 0, 0.8)";
        rightPanel.thickness = 2;
        rightPanel.color = "#8A2BE2";
        rightPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        rightPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        rightPanel.paddingRight = "10px";
        rightPanel.paddingTop = "20px";
        rightPanel.paddingBottom = "20px";
        this.advancedGUI.addControl(rightPanel);
        
        const buttonStack = new BABYLON.GUI.StackPanel();
        buttonStack.width = "100%";
        buttonStack.height = "100%";
        rightPanel.addControl(buttonStack);
        
        // دکمه‌های اقدام سریع
        const quickActions = [
            { icon: "🏗️", tooltip: "حالت ساخت", action: () => this.toggleBuildMode() },
            { icon: "⚔️", tooltip: "آموزش سرباز", action: () => this.showUnitMenu() },
            { icon: "🛡️", tooltip: "اطلاعات قبیله", action: () => this.showTribeInfo() },
            { icon: "📊", tooltip: "آمار بازی", action: () => this.showStats() },
            { icon: "🎯", tooltip: "اهداف", action: () => this.showObjectives() },
            { icon: "⚡", tooltip: "اقدام سریع", action: () => this.quickAction() }
        ];
        
        quickActions.forEach(action => {
            const button = this.createQuickActionButton(action.icon, action.tooltip, action.action);
            buttonStack.addControl(button);
        });
        
        this.uiElements.set("rightPanel", rightPanel);
    }
    
    createQuickActionButton(icon, tooltip, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "60px";
        button.height = "60px";
        button.cornerRadius = 30;
        button.background = "rgba(138, 43, 226, 0.3)";
        button.thickness = 2;
        button.color = "#8A2BE2";
        button.padding = "8px";
        button.marginBottom = "10px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 22;
        iconText.color = "white";
        button.addControl(iconText);
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(138, 43, 226, 0.5)";
            this.showTooltip(button, tooltip);
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(138, 43, 226, 0.3)";
            this.hideTooltip();
        });
        
        button.onPointerClickObservable.add(onClick);
        
        return button;
    }
    
    async createBottomBar() {
        // نوار پایینی - منوهای اصلی
        const bottomBar = new BABYLON.GUI.Rectangle();
        bottomBar.width = "600px";
        bottomBar.height = "90px";
        bottomBar.cornerRadius = 20;
        bottomBar.background = "rgba(0, 0, 0, 0.9)";
        bottomBar.thickness = 3;
        bottomBar.color = "gold";
        bottomBar.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        bottomBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        bottomBar.paddingBottom = "20px";
        this.advancedGUI.addControl(bottomBar);
        
        const menuGrid = new BABYLON.GUI.Grid();
        menuGrid.width = "100%";
        menuGrid.height = "100%";
        menuGrid.addColumnDefinition(0.2);
        menuGrid.addColumnDefinition(0.2);
        menuGrid.addColumnDefinition(0.2);
        menuGrid.addColumnDefinition(0.2);
        menuGrid.addColumnDefinition(0.2);
        bottomBar.addControl(menuGrid);
        
        // منوهای اصلی
        const mainMenus = [
            { icon: "🏠", label: "قبیله", action: () => this.showTribeManagement() },
            { icon: "⚔️", label: "نبرد", action: () => this.showBattleMenu() },
            { icon: "👥", label: "اجتماع", action: () => this.showSocial() },
            { icon: "🏆", label: "دستاوردها", action: () => this.showAchievements() },
            { icon: "⚙️", label: "بیشتر", action: () => this.showMoreOptions() }
        ];
        
        mainMenus.forEach((menu, index) => {
            const menuItem = this.createMainMenuItem(menu.icon, menu.label, menu.action);
            menuGrid.addControl(menuItem, 0, index);
        });
        
        this.uiElements.set("bottomBar", bottomBar);
    }
    
    createMainMenuItem(icon, label, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "100px";
        button.height = "70px";
        button.cornerRadius = 15;
        button.background = "rgba(255, 215, 0, 0.2)";
        button.thickness = 2;
        button.color = "gold";
        button.padding = "8px";
        
        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = true;
        stack.width = "100%";
        stack.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 24;
        iconText.color = "white";
        iconText.height = "30px";
        stack.addControl(iconText);
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.fontSize = 12;
        labelText.color = "white";
        labelText.height = "20px";
        stack.addControl(labelText);
        
        button.addControl(stack);
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 215, 0, 0.4)";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 215, 0, 0.2)";
        });
        
        button.onPointerClickObservable.add(onClick);
        
        return button;
    }
    
    async createMinimap() {
        // مینی‌مپ برای نمایش کلی قبیله
        const minimap = new BABYLON.GUI.Rectangle();
        minimap.width = "180px";
        minimap.height = "180px";
        minimap.cornerRadius = 20;
        minimap.background = "rgba(0, 0, 0, 0.8)";
        minimap.thickness = 3;
        minimap.color = "#FF6B6B";
        minimap.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        minimap.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        minimap.paddingTop = "100px";
        minimap.paddingRight = "20px";
        this.advancedGUI.addControl(minimap);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "نقشه قبیله";
        title.color = "#FF6B6B";
        title.fontSize = 16;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingTop = "10px";
        minimap.addControl(title);
        
        // نقشه کوچک
        const mapContainer = new BABYLON.GUI.Rectangle();
        mapContainer.width = "160px";
        mapContainer.height = "140px";
        mapContainer.background = "rgba(50, 50, 50, 0.9)";
        mapContainer.thickness = 1;
        mapContainer.color = "#666666";
        mapContainer.paddingTop = "5px";
        minimap.addControl(mapContainer);
        
        this.uiElements.set("minimap", minimap);
    }
    
    async createQuickActions() {
        // اقدامات سریع در شرایط خاص
        this.quickActionPanel = new BABYLON.GUI.Rectangle();
        this.quickActionPanel.width = "300px";
        this.quickActionPanel.height = "60px";
        this.quickActionPanel.cornerRadius = 15;
        this.quickActionPanel.background = "rgba(255, 0, 0, 0.9)";
        this.quickActionPanel.thickness = 3;
        this.quickActionPanel.color = "gold";
        this.quickActionPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.quickActionPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.quickActionPanel.paddingTop = "100px";
        this.quickActionPanel.isVisible = false;
        this.advancedGUI.addControl(this.quickActionPanel);
        
        const attackWarning = new BABYLON.GUI.TextBlock();
        attackWarning.text = "🚨 قبیله تحت حمله است! 🚨";
        attackWarning.color = "white";
        attackWarning.fontSize = 18;
        attackWarning.fontWeight = "bold";
        attackWarning.paddingTop = "15px";
        this.quickActionPanel.addControl(attackWarning);
        
        this.uiElements.set("quickActionPanel", this.quickActionPanel);
    }
    
    async createBuildMenu() {
        // منوی ساخت‌وساز پیشرفته
        this.buildMenu = new BABYLON.GUI.Rectangle();
        this.buildMenu.width = "700px";
        this.buildMenu.height = "150px";
        this.buildMenu.cornerRadius = 20;
        this.buildMenu.background = "rgba(0, 0, 0, 0.95)";
        this.buildMenu.thickness = 4;
        this.buildMenu.color = "gold";
        this.buildMenu.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.buildMenu.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.buildMenu.paddingBottom = "120px";
        this.buildMenu.paddingLeft = "20px";
        this.buildMenu.paddingRight = "20px";
        this.buildMenu.paddingTop = "15px";
        this.buildMenu.isVisible = false;
        this.advancedGUI.addControl(this.buildMenu);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "منوی ساخت ساختمان";
        title.color = "gold";
        title.fontSize = 20;
        title.fontWeight = "bold";
        title.height = "30px";
        title.paddingBottom = "10px";
        this.buildMenu.addControl(title);
        
        const buildingGrid = new BABYLON.GUI.Grid();
        buildingGrid.width = "100%";
        buildingGrid.height = "90px";
        buildingGrid.addColumnDefinition(0.166);
        buildingGrid.addColumnDefinition(0.166);
        buildingGrid.addColumnDefinition(0.166);
        buildingGrid.addColumnDefinition(0.166);
        buildingGrid.addColumnDefinition(0.166);
        buildingGrid.addColumnDefinition(0.166);
        this.buildMenu.addControl(buildingGrid);
        
        // انواع ساختمان‌های قابل ساخت
        const buildingTypes = [
            { type: "wall", name: "دیوار", icon: "🧱", cost: "50 طلا" },
            { type: "goldmine", name: "معدن طلا", icon: "💰", cost: "100 طلا" },
            { type: "elixirfactory", name: "کارخانه اکسیر", icon: "⚗️", cost: "100 اکسیر" },
            { type: "cannon", name: "توپخانه", icon: "💣", cost: "300 طلا" },
            { type: "barracks", name: "سربازخانه", icon: "⚔️", cost: "200 طلا" },
            { type: "watchtower", name: "برج دیده‌بانی", icon: "🏹", cost: "150 طلا" }
        ];
        
        buildingTypes.forEach((building, index) => {
            const buildItem = this.createBuildMenuItem(building.type, building.name, building.icon, building.cost);
            buildingGrid.addControl(buildItem, 0, index);
        });
    }
    
    createBuildMenuItem(type, name, icon, cost) {
        const button = new BABYLON.GUI.Button();
        button.width = "100px";
        button.height = "80px";
        button.cornerRadius = 10;
        button.background = "rgba(255, 255, 255, 0.1)";
        button.thickness = 2;
        button.color = "#666666";
        button.padding = "5px";
        
        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = true;
        stack.width = "100%";
        stack.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 24;
        iconText.color = "white";
        iconText.height = "30px";
        stack.addControl(iconText);
        
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = name;
        nameText.fontSize = 11;
        nameText.color = "white";
        nameText.height = "20px";
        nameText.textWrapping = true;
        stack.addControl(nameText);
        
        const costText = new BABYLON.GUI.TextBlock();
        costText.text = cost;
        costText.fontSize = 9;
        costText.color = "gold";
        costText.height = "15px";
        stack.addControl(costText);
        
        button.addControl(stack);
        
        button.onPointerClickObservable.add(() => {
            this.gameEngine.setBuildMode(type);
            this.hideBuildMenu();
            this.soundSystem.play("click");
        });
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
            this.showTooltip(button, `ساخت ${name}`);
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
            this.hideTooltip();
        });
        
        return button;
    }
    
    async createUnitMenu() {
        // منوی آموزش سرباز
        this.unitMenu = new BABYLON.GUI.Rectangle();
        this.unitMenu.width = "500px";
        this.unitMenu.height = "120px";
        this.unitMenu.cornerRadius = 15;
        this.unitMenu.background = "rgba(0, 0, 0, 0.95)";
        this.unitMenu.thickness = 3;
        this.unitMenu.color = "#8A2BE2";
        this.unitMenu.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.unitMenu.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.unitMenu.paddingBottom = "120px";
        this.unitMenu.isVisible = false;
        this.advancedGUI.addControl(this.unitMenu);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "آموزش سرباز";
        title.color = "#8A2BE2";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingTop = "10px";
        this.unitMenu.addControl(title);
        
        const unitGrid = new BABYLON.GUI.Grid();
        unitGrid.width = "100%";
        unitGrid.height = "70px";
        unitGrid.addColumnDefinition(0.25);
        unitGrid.addColumnDefinition(0.25);
        unitGrid.addColumnDefinition(0.25);
        unitGrid.addColumnDefinition(0.25);
        this.unitMenu.addControl(unitGrid);
        
        // انواع سربازان
        const unitTypes = [
            { type: "soldier", name: "سرباز", icon: "⚔️", cost: "50 اکسیر" },
            { type: "archer", name: "کماندار", icon: "🏹", cost: "100 اکسیر" },
            { type: "giant", name: "غول", icon: "👹", cost: "200 اکسیر" },
            { type: "dragon", name: "اژدها", icon: "🐲", cost: "300 اکسیر" }
        ];
        
        unitTypes.forEach((unit, index) => {
            const unitItem = this.createUnitMenuItem(unit.type, unit.name, unit.icon, unit.cost);
            unitGrid.addControl(unitItem, 0, index);
        });
    }
    
    createUnitMenuItem(type, name, icon, cost) {
        const button = new BABYLON.GUI.Button();
        button.width = "110px";
        button.height = "60px";
        button.cornerRadius = 8;
        button.background = "rgba(138, 43, 226, 0.3)";
        button.thickness = 1;
        button.color = "#8A2BE2";
        button.padding = "5px";
        
        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = true;
        stack.width = "100%";
        stack.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 20;
        iconText.color = "white";
        iconText.height = "25px";
        stack.addControl(iconText);
        
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = name;
        nameText.fontSize = 12;
        nameText.color = "white";
        nameText.height = "15px";
        stack.addControl(nameText);
        
        const costText = new BABYLON.GUI.TextBlock();
        costText.text = cost;
        costText.fontSize = 10;
        costText.color = "gold";
        costText.height = "12px";
        stack.addControl(costText);
        
        button.addControl(stack);
        
        button.onPointerClickObservable.add(() => {
            this.trainUnit(type);
            this.soundSystem.play("click");
        });
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(138, 43, 226, 0.5)";
            this.showUnitInfo(type);
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(138, 43, 226, 0.3)";
            this.hideUnitInfo();
        });
        
        return button;
    }
    
    async createBattleInterface() {
        // رابط کاربری نبرد
        this.battleUI = new BABYLON.GUI.Rectangle();
        this.battleUI.width = "400px";
        this.battleUI.height = "200px";
        this.battleUI.cornerRadius = 15;
        this.battleUI.background = "rgba(0, 0, 0, 0.9)";
        this.battleUI.thickness = 3;
        this.battleUI.color = "#FF4444";
        this.battleUI.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.battleUI.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.battleUI.paddingTop = "100px";
        this.battleUI.paddingLeft = "20px";
        this.battleUI.isVisible = false;
        this.advancedGUI.addControl(this.battleUI);
        
        const battleTitle = new BABYLON.GUI.TextBlock();
        battleTitle.text = "وضعیت نبرد";
        battleTitle.color = "#FF4444";
        battleTitle.fontSize = 18;
        battleTitle.fontWeight = "bold";
        battleTitle.height = "25px";
        battleTitle.paddingBottom = "10px";
        this.battleUI.addControl(battleTitle);
        
        // اطلاعات نبرد
        this.battleInfo = new BABYLON.GUI.TextBlock();
        this.battleInfo.text = "آماده برای نبرد";
        this.battleInfo.color = "white";
        this.battleInfo.fontSize = 14;
        this.battleInfo.textWrapping = true;
        this.battleInfo.height = "150px";
        this.battleUI.addControl(this.battleInfo);
    }
    
    async createContextMenus() {
        // منوهای راست کلیک
        this.createBuildingContextMenu();
        this.createUnitContextMenu();
        this.createGroundContextMenu();
    }
    
    createBuildingContextMenu() {
        const contextMenu = new BABYLON.GUI.Rectangle();
        contextMenu.width = "200px";
        contextMenu.height = "180px";
        contextMenu.cornerRadius = 10;
        contextMenu.background = "rgba(0, 0, 0, 0.95)";
        contextMenu.thickness = 2;
        contextMenu.color = "gold";
        contextMenu.padding = "5px";
        contextMenu.isVisible = false;
        contextMenu.name = "buildingContextMenu";
        this.advancedGUI.addControl(contextMenu);
        
        this.contextMenus.set("building", contextMenu);
    }
    
    createUnitContextMenu() {
        const contextMenu = new BABYLON.GUI.Rectangle();
        contextMenu.width = "180px";
        contextMenu.height = "150px";
        contextMenu.cornerRadius = 10;
        contextMenu.background = "rgba(0, 0, 0, 0.95)";
        contextMenu.thickness = 2;
        contextMenu.color = "#8A2BE2";
        contextMenu.padding = "5px";
        contextMenu.isVisible = false;
        contextMenu.name = "unitContextMenu";
        this.advancedGUI.addControl(contextMenu);
        
        this.contextMenus.set("unit", contextMenu);
    }
    
    createGroundContextMenu() {
        const contextMenu = new BABYLON.GUI.Rectangle();
        contextMenu.width = "160px";
        contextMenu.height = "120px";
        contextMenu.cornerRadius = 10;
        contextMenu.background = "rgba(0, 0, 0, 0.95)";
        contextMenu.thickness = 2;
        contextMenu.color = "#00BFFF";
        contextMenu.padding = "5px";
        contextMenu.isVisible = false;
        contextMenu.name = "groundContextMenu";
        this.advancedGUI.addControl(contextMenu);
        
        this.contextMenus.set("ground", contextMenu);
    }
    
    async createHUD() {
        // نمایشگر سراسری (Heads-Up Display)
        await this.createHealthBars();
        await this.createSelectionPanel();
        await this.createTooltipSystem();
    }
    
    async createHealthBars() {
        // سیستم نوارهای سلامت برای ساختمان‌ها و واحدها
        this.healthBars = new Map();
        console.log("✅ سیستم نوارهای سلامت ایجاد شد");
    }
    
    async createSelectionPanel() {
        // پنل اطلاعات هنگام انتخاب object
        this.selectionPanel = new BABYLON.GUI.Rectangle();
        this.selectionPanel.width = "250px";
        this.selectionPanel.height = "120px";
        this.selectionPanel.cornerRadius = 10;
        this.selectionPanel.background = "rgba(0, 0, 0, 0.9)";
        this.selectionPanel.thickness = 2;
        this.selectionPanel.color = "gold";
        this.selectionPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.selectionPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.selectionPanel.paddingBottom = "150px";
        this.selectionPanel.paddingLeft = "20px";
        this.selectionPanel.isVisible = false;
        this.advancedGUI.addControl(this.selectionPanel);
        
        this.selectionTitle = new BABYLON.GUI.TextBlock();
        this.selectionTitle.text = "انتخاب شده";
        this.selectionTitle.color = "gold";
        this.selectionTitle.fontSize = 16;
        this.selectionTitle.fontWeight = "bold";
        this.selectionTitle.height = "25px";
        this.selectionTitle.paddingBottom = "5px";
        this.selectionPanel.addControl(this.selectionTitle);
        
        this.selectionInfo = new BABYLON.GUI.TextBlock();
        this.selectionInfo.text = "";
        this.selectionInfo.color = "white";
        this.selectionInfo.fontSize = 12;
        this.selectionInfo.textWrapping = true;
        this.selectionInfo.height = "90px";
        this.selectionPanel.addControl(this.selectionInfo);
    }
    
    async createTooltipSystem() {
        // سیستم راهنما
        this.tooltip = new BABYLON.GUI.Rectangle();
        this.tooltip.width = "200px";
        this.tooltip.height = "60px";
        this.tooltip.cornerRadius = 8;
        this.tooltip.background = "rgba(0, 0, 0, 0.9)";
        this.tooltip.thickness = 1;
        this.tooltip.color = "gold";
        this.tooltip.padding = "8px";
        this.tooltip.isVisible = false;
        this.advancedGUI.addControl(this.tooltip);
        
        this.tooltipText = new BABYLON.GUI.TextBlock();
        this.tooltipText.text = "";
        this.tooltipText.color = "white";
        this.tooltipText.fontSize = 12;
        this.tooltipText.textWrapping = true;
        this.tooltip.addControl(this.tooltipText);
    }
    
    async setupEventListeners() {
        // رویدادهای بازی
        this.setupGameEventListeners();
        this.setupInputEventListeners();
        this.setupNotificationListeners();
    }
    
    setupGameEventListeners() {
        // رویدادهای مربوط به وضعیت بازی
        this.gameEngine.onResourceUpdate = () => this.updateResourceDisplay();
        this.gameEngine.onBuildingSelected = (building) => this.showBuildingInfo(building);
        this.gameEngine.onUnitTrained = (unit) => this.showUnitTrained(unit);
        this.gameEngine.onAttackStarted = () => this.showAttackWarning();
        this.gameEngine.onBattleEnd = (result) => this.showBattleResult(result);
    }
    
    setupInputEventListeners() {
        // مدیریت ورودی‌های کاربر
        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
                this.handleKeyPress(kbInfo.event);
            }
        });
    }
    
    setupNotificationListeners() {
        // رویدادهای اطلاع‌رسانی
        console.log("✅ سیستم اطلاع‌رسانی راه‌اندازی شد");
    }
    
    // متدهای کنترل دوربین
    zoomIn() {
        this.gameEngine.camera.radius -= 5;
        this.gameEngine.camera.radius = Math.max(15, this.gameEngine.camera.radius);
        this.soundSystem.play("click");
    }
    
    zoomOut() {
        this.gameEngine.camera.radius += 5;
        this.gameEngine.camera.radius = Math.min(200, this.gameEngine.camera.radius);
        this.soundSystem.play("click");
    }
    
    rotateRight() {
        this.gameEngine.camera.alpha += 0.2;
        this.soundSystem.play("click");
    }
    
    rotateLeft() {
        this.gameEngine.camera.alpha -= 0.2;
        this.soundSystem.play("click");
    }
    
    resetCamera() {
        this.gameEngine.camera.radius = 50;
        this.gameEngine.camera.alpha = -Math.PI / 2;
        this.gameEngine.camera.beta = Math.PI / 2.5;
        this.soundSystem.play("click");
    }
    
    // متدهای مدیریت منوها
    toggleBuildMode() {
        if (this.currentMode === "build") {
            this.hideBuildMenu();
            this.currentMode = "normal";
        } else {
            this.showBuildMenu();
            this.currentMode = "build";
        }
        this.soundSystem.play("menu_toggle");
    }
    
    showBuildMenu() {
        this.hideAllMenus();
        if (this.buildMenu) {
            this.buildMenu.isVisible = true;
        }
    }
    
    hideBuildMenu() {
        if (this.buildMenu) {
            this.buildMenu.isVisible = false;
        }
        this.currentMode = "normal";
    }
    
    showUnitMenu() {
        this.hideAllMenus();
        if (this.unitMenu) {
            this.unitMenu.isVisible = true;
        }
        this.soundSystem.play("menu_open");
    }
    
    hideUnitMenu() {
        if (this.unitMenu) {
            this.unitMenu.isVisible = false;
        }
    }
    
    showBattleMenu() {
        this.hideAllMenus();
        if (this.battleUI) {
            this.battleUI.isVisible = true;
        }
        this.updateBattleInfo();
        this.soundSystem.play("battle_menu");
    }
    
    hideBattleMenu() {
        if (this.battleUI) {
            this.battleUI.isVisible = false;
        }
    }
    
    hideAllMenus() {
        this.hideBuildMenu();
        this.hideUnitMenu();
        this.hideBattleMenu();
        this.hideContextMenus();
    }
    
    hideContextMenus() {
        this.contextMenus.forEach(menu => {
            if (menu) menu.isVisible = false;
        });
    }
    
    // متدهای آموزش واحد
    trainUnit(unitType) {
        const barracks = this.findAvailableBarracks();
        if (barracks) {
            this.gameEngine.trainUnit(barracks, unitType);
            this.hideUnitMenu();
        } else {
            this.showNotification("سربازخانه در دسترس نیست!", "error");
        }
    }
    
    findAvailableBarracks() {
        return this.gameEngine.tribeLayout.barracks[0]; // اولین سربازخانه
    }
    
    showUnitInfo(unitType) {
        const info = this.getUnitInfo(unitType);
        this.showTooltip(null, info);
    }
    
    hideUnitInfo() {
        this.hideTooltip();
    }
    
    getUnitInfo(unitType) {
        const unitInfo = {
            soldier: "سرباز پایه - هزینه: 50 اکسیر\nسلامت: 100 - آسیب: 20",
            archer: "کماندار - هزینه: 100 اکسیر\nسلامت: 80 - آسیب: 35 - برد: دور",
            giant: "غول - هزینه: 200 اکسیر\nسلامت: 300 - آسیب: 50 - سرعت: کند",
            dragon: "اژدها - هزینه: 300 اکسیر\nسلامت: 200 - آسیب: 80 - پرواز: بله"
        };
        
        return unitInfo[unitType] || "اطلاعات واحد در دسترس نیست";
    }
    
    // متدهای اطلاع‌رسانی
    showNotification(message, type = "info") {
        this.notificationSystem.show(message, type);
        this.soundSystem.play("notification");
    }
    
    showAttackWarning() {
        const quickPanel = this.uiElements.get("quickActionPanel");
        if (quickPanel) {
            quickPanel.isVisible = true;
            this.soundSystem.play("attack_warning");
            
            // پنهان کردن خودکار پس از 5 ثانیه
            setTimeout(() => {
                quickPanel.isVisible = false;
            }, 5000);
        }
    }
    
    showBuildingInfo(building) {
        if (this.selectionPanel) {
            this.selectionPanel.isVisible = true;
            this.selectionTitle.text = this.getBuildingTitle(building);
            this.selectionInfo.text = this.getBuildingInfo(building);
        }
    }
    
    hideBuildingInfo() {
        if (this.selectionPanel) {
            this.selectionPanel.isVisible = false;
        }
    }
    
    getBuildingTitle(building) {
        const titles = {
            townhall: "سالن شهر",
            barracks: "سربازخانه",
            wall: "دیوار دفاعی",
            cannon: "توپخانه",
            goldmine: "معدن طلا",
            elixirfactory: "کارخانه اکسیر",
            watchtower: "برج دیده‌بانی"
        };
        
        return titles[building.type] || "ساختمان";
    }
    
    getBuildingInfo(building) {
        let info = `سطح: ${building.level || 1}\n`;
        info += `سلامت: ${building.health}/${building.maxHealth}\n`;
        
        if (building.productionRate) {
            info += `تولید: ${building.productionRate} در ثانیه\n`;
        }
        
        if (building.damage) {
            info += `آسیب: ${building.damage}\n`;
        }
        
        if (building.range) {
            info += `برد: ${building.range}`;
        }
        
        return info;
    }
    
    showUnitTrained(unit) {
        this.showNotification(`${this.getUnitName(unit.type)} آموزش داده شد!`, "success");
    }
    
    getUnitName(unitType) {
        const names = {
            soldier: "سرباز",
            archer: "کماندار",
            giant: "غول",
            dragon: "اژدها"
        };
        
        return names[unitType] || "واحد";
    }
    
    showBattleResult(result) {
        if (result.victory) {
            this.showNotification("🎉 نبرد برده شد! پاداش دریافت کردید.", "success");
        } else {
            this.showNotification("💔 نبرد باخته شد. قبیله آسیب دید.", "error");
        }
    }
    
    // متدهای به‌روزرسانی
    update() {
        this.updateResourceDisplay();
        this.updateBattleInfo();
        this.updateMinimap();
        this.notificationSystem.update();
    }
    
    updateResourceDisplay() {
        // به‌روزرسانی نمایش منابع
        const resources = this.gameEngine.resources;
        
        // طلا
        const goldValue = this.advancedGUI.getControlByName("goldValue");
        if (goldValue) {
            goldValue.text = Math.floor(resources.gold).toString();
        }
        
        const goldProgress = this.advancedGUI.getControlByName("goldProgress");
        if (goldProgress) {
            const progress = (resources.gold / resources.goldCapacity) * 100;
            goldProgress.width = `${Math.min(progress, 100)}%`;
        }
        
        // اکسیر
        const elixirValue = this.advancedGUI.getControlByName("elixirValue");
        if (elixirValue) {
            elixirValue.text = Math.floor(resources.elixir).toString();
        }
        
        const elixirProgress = this.advancedGUI.getControlByName("elixirProgress");
        if (elixirProgress) {
            const progress = (resources.elixir / resources.elixirCapacity) * 100;
            elixirProgress.width = `${Math.min(progress, 100)}%`;
        }
        
        // الماس
        const gemValue = this.advancedGUI.getControlByName("gemValue");
        if (gemValue) {
            gemValue.text = "0"; // در صورت اضافه کردن الماس
        }
    }
    
    updateBattleInfo() {
        if (this.battleInfo && this.battleUI.isVisible) {
            const stats = this.gameEngine.getGameStats();
            let info = `قدرت قبیله: ${stats.tribeStrength}\n`;
            info += `ساختمان‌ها: ${stats.buildingsCount}\n`;
            info += `واحدها: ${stats.unitsCount}\n`;
            info += `دفاع‌ها: ${stats.defensesCount}\n`;
            info += `نبردهای برده: ${stats.battlesWon}\n`;
            
            if (this.gameEngine.isUnderAttack) {
                info += `\n🚨 تحت حمله: ${this.gameEngine.enemies.length} دشمن`;
            }
            
            this.battleInfo.text = info;
        }
    }
    
    updateMinimap() {
        // به‌روزرسانی مینی‌مپ
        // (پیاده‌سازی کامل در نسخه نهایی)
    }
    
    // متدهای tooltip
    showTooltip(element, text) {
        if (this.tooltip) {
            this.tooltipText.text = text;
            this.tooltip.isVisible = true;
            
            if (element) {
                // موقعیت‌دهی tooltip نزدیک element
                this.tooltip.left = `${this.scene.pointerX + 20}px`;
                this.tooltip.top = `${this.scene.pointerY + 20}px`;
            }
        }
    }
    
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.isVisible = false;
        }
    }
    
    // متدهای مدیریت صفحه
    handleKeyPress(event) {
        switch (event.key) {
            case "Escape":
                this.hideAllMenus();
                this.gameEngine.cancelBuildMode();
                this.hideBuildingInfo();
                break;
            case "b":
                this.toggleBuildMode();
                break;
            case "u":
                this.showUnitMenu();
                break;
            case "1":
            case "2":
            case "3":
            case "4":
                this.quickSelect(parseInt(event.key));
                break;
        }
    }
    
    quickSelect(index) {
        const buildingTypes = ["wall", "goldmine", "elixirfactory", "cannon"];
        if (index <= buildingTypes.length) {
            this.gameEngine.setBuildMode(buildingTypes[index - 1]);
            this.showBuildMenu();
        }
    }
    
    // متدهای منوهای دیگر (پیاده‌سازی ساده)
    showSettings() {
        this.showNotification("منوی تنظیمات باز شد", "info");
    }
    
    showHelp() {
        this.showNotification("راهنمای بازی در دست تهیه است", "info");
    }
    
    showTribeInfo() {
        const stats = this.gameEngine.getGameStats();
        let info = `اطلاعات قبیله:\n`;
        info += `سطح: ${stats.level || 1}\n`;
        info += `قدرت: ${stats.tribeStrength}\n`;
        info += `ساختمان‌ها: ${stats.buildingsCount}\n`;
        info += `جمعیت: ${stats.unitsCount}\n`;
        this.showNotification(info, "info");
    }
    
    showStats() {
        const stats = this.gameEngine.getGameStats();
        let info = `آمار بازی:\n`;
        info += `زمان بازی: ${Math.floor(stats.totalPlayTime / 60)} دقیقه\n`;
        info += `ساختمان ساخته: ${stats.buildingsBuilt}\n`;
        info += `سرباز آموزش: ${stats.unitsTrained}\n`;
        info += `نبرد برده: ${stats.battlesWon}\n`;
        this.showNotification(info, "info");
    }
    
    showObjectives() {
        this.showNotification("اهداف فعلی: ساخت ۵ ساختمان جدید", "info");
    }
    
    showTribeManagement() {
        this.showNotification("مدیریت قبیله در دست توسعه", "info");
    }
    
    showSocial() {
        this.showNotification("سیستم اجتماعی در دست توسعه", "info");
    }
    
    showAchievements() {
        this.showNotification("دستاوردها در دست توسعه", "info");
    }
    
    showMoreOptions() {
        this.showNotification("گزینه‌های بیشتر در دست توسعه", "info");
    }
    
    quickAction() {
        // اقدام سریع بر اساس وضعیت بازی
        if (this.gameEngine.isUnderAttack) {
            this.showBattleMenu();
        } else if (this.gameEngine.resources.gold < 100) {
            this.gameEngine.setBuildMode("goldmine");
        } else {
            this.showUnitMenu();
        }
    }
}

// سیستم اطلاع‌رسانی
class NotificationSystem {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.notifications = [];
        this.container = null;
        
        this.init();
    }
    
    init() {
        this.createContainer();
    }
    
    createContainer() {
        this.container = new BABYLON.GUI.StackPanel();
        this.container.width = "300px";
        this.container.height = "400px";
        this.container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.container.paddingTop = "100px";
        this.container.paddingLeft = "20px";
        this.uiManager.advancedGUI.addControl(this.container);
    }
    
    show(message, type = "info") {
        const notification = this.createNotification(message, type);
        this.notifications.push(notification);
        this.container.addControl(notification);
        
        // حذف خودکار پس از 5 ثانیه
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
        
        // محدود کردن تعداد اطلاعیه‌ها
        if (this.notifications.length > 5) {
            const oldNotification = this.notifications.shift();
            this.removeNotification(oldNotification);
        }
    }
    
    createNotification(message, type) {
        const notification = new BABYLON.GUI.Rectangle();
        notification.width = "280px";
        notification.height = "70px";
        notification.cornerRadius = 10;
        notification.background = this.getNotificationColor(type);
        notification.thickness = 2;
        notification.color = "white";
        notification.padding = "10px";
        notification.marginBottom = "10px";
        
        const text = new BABYLON.GUI.TextBlock();
        text.text = message;
        text.color = "white";
        text.fontSize = 12;
        text.textWrapping = true;
        notification.addControl(text);
        
        return notification;
    }
    
    getNotificationColor(type) {
        const colors = {
            info: "rgba(0, 100, 255, 0.8)",
            success: "rgba(0, 200, 0, 0.8)",
            warning: "rgba(255, 165, 0, 0.8)",
            error: "rgba(255, 0, 0, 0.8)"
        };
        
        return colors[type] || colors.info;
    }
    
    removeNotification(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
        notification.dispose();
    }
    
    update() {
        // به‌روزرسانی موقعیت اطلاعیه‌ها
        this.notifications.forEach((notification, index) => {
            notification.top = `${index * 80}px`;
        });
    }
}

// سیستم صدا
class SoundSystem {
    constructor() {
        this.sounds = new Map();
        this.muted = false;
        this.volume = 0.7;
        
        this.init();
    }
    
    init() {
        // بارگذاری صداها
        this.loadSounds();
    }
    
    loadSounds() {
        // در اینجا صداهای واقعی بارگذاری می‌شوند
        console.log("✅ سیستم صدا راه‌اندازی شد");
    }
    
    play(soundName) {
        if (this.muted) return;
        
        // شبیه‌سازی پخش صدا
        console.log(`🔊 پخش صدا: ${soundName}`);
        
        // در نسخه کامل، از Web Audio API استفاده می‌شود
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    mute() {
        this.muted = true;
    }
    
    unmute() {
        this.muted = false;
    }
}

// اضافه کردن AdvancedUIManager به AdvancedGameEngine
if (typeof AdvancedGameEngine !== 'undefined') {
    AdvancedGameEngine.prototype.initUI = function() {
        this.uiManager = new AdvancedUIManager(this);
    };
    
    // گسترش متد init اصلی
    const originalInit = AdvancedGameEngine.prototype.init;
    AdvancedGameEngine.prototype.init = async function() {
        await originalInit.call(this);
        await this.initUI();
    };
    
    // گسترش متدهای اطلاع‌رسانی
    AdvancedGameEngine.prototype.showNotification = function(message, type) {
        if (this.uiManager) {
            this.uiManager.showNotification(message, type);
        }
    };
    
    AdvancedGameEngine.prototype.updateResourceUI = function() {
        if (this.uiManager) {
            this.uiManager.updateResourceDisplay();
        }
    };
}

console.log("🚀 فایل m2.js - رابط کاربری پیشرفته بارگذاری شد");
