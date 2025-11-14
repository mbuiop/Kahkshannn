// m2.js - سیستم دکمه‌ها و صفحات بازی
// ===============================================

class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        this.currentPage = "main";
        this.pages = {};
        this.buttons = {};
        this.modals = {};
        this.notifications = [];
        this.tooltips = [];
        this.contextMenus = [];
        this.advancedGUI = null;
        
        this.init();
    }
    
    init() {
        this.createAdvancedGUI();
        this.createMainPage();
        this.createBuildMenu();
        this.createShopPage();
        this.createSettingsPage();
        this.createStatsPage();
        this.createClanPage();
        this.createBattlePage();
        this.createContextMenus();
        this.createTooltips();
        this.createNotificationSystem();
        this.createTutorialSystem();
        this.createAchievementSystem();
        this.createEventSystem();
        
        this.setupEventListeners();
        this.showPage("main");
        
        console.log("سیستم رابط کاربری با موفقیت راه‌اندازی شد");
    }
    
    createAdvancedGUI() {
        // ایجاد سیستم پیشرفته GUI
        this.advancedGUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.advancedGUI.idealWidth = 1920;
        this.advancedGUI.idealHeight = 1080;
        this.advancedGUI.useSmallestIdeal = true;
        this.advancedGUI.renderAtIdealSize = true;
        
        // ایجاد استایل کلی برای المان‌های UI
        this.createGlobalStyles();
    }
    
    createGlobalStyles() {
        // تعریف استایل‌های全局 برای المان‌های UI
        this.styles = {
            primaryColor: "#ffd700",
            secondaryColor: "#8B4513",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            textColor: "#ffffff",
            dangerColor: "#ff4444",
            successColor: "#44ff44",
            warningColor: "#ffaa00"
        };
    }
    
    createMainPage() {
        const mainPage = new BABYLON.GUI.StackPanel();
        mainPage.width = "100%";
        mainPage.height = "100%";
        mainPage.isVisible = false;
        mainPage.name = "mainPage";
        this.advancedGUI.addControl(mainPage);
        
        // هدر اصلی
        const header = this.createHeader();
        mainPage.addControl(header);
        
        // بخش مرکزی
        const content = this.createMainContent();
        mainPage.addControl(content);
        
        // فوتر
        const footer = this.createFooter();
        mainPage.addControl(footer);
        
        this.pages.main = mainPage;
    }
    
    createHeader() {
        const header = new BABYLON.GUI.StackPanel();
        header.height = "80px";
        header.width = "100%";
        header.isVertical = false;
        header.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        header.paddingTop = "10px";
        header.paddingLeft = "10px";
        header.paddingRight = "10px";
        
        // لوگو بازی
        const logo = new BABYLON.GUI.Image("logo");
        logo.width = "200px";
        logo.height = "60px";
        logo.source = "https://i.imgur.com/8N3y7c2.png";
        logo.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
        header.addControl(logo);
        
        // بخش منابع
        const resourcesPanel = this.createResourcesPanel();
        header.addControl(resourcesPanel);
        
        // بخش دکمه‌های کنترلی
        const controlsPanel = this.createControlsPanel();
        header.addControl(controlsPanel);
        
        return header;
    }
    
    createResourcesPanel() {
        const panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = false;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panel.width = "400px";
        panel.height = "60px";
        panel.paddingLeft = "20px";
        
        // طلا
        const goldPanel = this.createResourceItem("gold", "طلا", "#FFD700");
        panel.addControl(goldPanel);
        
        // اکسیر
        const elixirPanel = this.createResourceItem("elixir", "اکسیر", "#8A2BE2");
        panel.addControl(elixirPanel);
        
        // الماس
        const gemPanel = this.createResourceItem("gem", "الماس", "#00BFFF");
        panel.addControl(gemPanel);
        
        // ظرفیت طلا
        const goldCapacity = this.createCapacityItem("goldCapacity", "ظرفیت طلا");
        panel.addControl(goldCapacity);
        
        // ظرفیت اکسیر
        const elixirCapacity = this.createCapacityItem("elixirCapacity", "ظرفیت اکسیر");
        panel.addControl(elixirCapacity);
        
        return panel;
    }
    
    createResourceItem(type, name, color) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = true;
        container.width = "80px";
        container.height = "50px";
        container.paddingLeft = "5px";
        
        // آیکون و مقدار
        const valuePanel = new BABYLON.GUI.StackPanel();
        valuePanel.isVertical = false;
        valuePanel.height = "30px";
        
        const icon = new BABYLON.GUI.Ellipse();
        icon.width = "20px";
        icon.height = "20px";
        icon.background = color;
        icon.thickness = 2;
        icon.color = "white";
        valuePanel.addControl(icon);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = "0";
        valueText.color = "white";
        valueText.fontSize = 16;
        valueText.fontWeight = "bold";
        valueText.paddingLeft = "5px";
        valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        valueText.name = `${type}Value`;
        valuePanel.addControl(valueText);
        
        // نام منبع
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = name;
        nameText.color = "white";
        nameText.fontSize = 12;
        nameText.height = "20px";
        nameText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        
        container.addControl(valuePanel);
        container.addControl(nameText);
        
        return container;
    }
    
    createCapacityItem(type, name) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = true;
        container.width = "60px";
        container.height = "40px";
        
        const capacityBar = new BABYLON.GUI.Rectangle();
        capacityBar.width = "50px";
        capacityBar.height = "8px";
        capacityBar.cornerRadius = 4;
        capacityBar.background = "#333333";
        capacityBar.thickness = 1;
        capacityBar.color = "#666666";
        
        const progress = new BABYLON.GUI.Rectangle();
        progress.width = "50%";
        progress.height = "8px";
        progress.cornerRadius = 4;
        progress.background = "#FFD700";
        progress.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        progress.name = `${type}Progress`;
        capacityBar.addControl(progress);
        
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = name;
        nameText.color = "white";
        nameText.fontSize = 10;
        nameText.height = "15px";
        
        container.addControl(capacityBar);
        container.addControl(nameText);
        
        return container;
    }
    
    createControlsPanel() {
        const panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = false;
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        panel.width = "300px";
        panel.height = "60px";
        
        // دکمه فروشگاه
        const shopBtn = this.createIconButton("فروشگاه", "🛒", () => this.showPage("shop"));
        panel.addControl(shopBtn);
        
        // دکمه آمار
        const statsBtn = this.createIconButton("آمار", "📊", () => this.showPage("stats"));
        panel.addControl(statsBtn);
        
        // دکمه قبیله
        const clanBtn = this.createIconButton("قبیله", "👥", () => this.showPage("clan"));
        panel.addControl(clanBtn);
        
        // دکمه تنظیمات
        const settingsBtn = this.createIconButton("تنظیمات", "⚙️", () => this.showPage("settings"));
        panel.addControl(settingsBtn);
        
        return panel;
    }
    
    createIconButton(text, icon, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "60px";
        button.height = "60px";
        button.cornerRadius = 10;
        button.background = "rgba(255, 255, 255, 0.1)";
        button.thickness = 2;
        button.color = "gold";
        
        // آیکون
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 24;
        iconText.color = "white";
        iconText.paddingTop = "5px";
        button.addControl(iconText);
        
        // متن
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = 10;
        textBlock.color = "white";
        textBlock.paddingTop = "30px";
        button.addControl(textBlock);
        
        // رویدادها
        button.onPointerClickObservable.add(onClick);
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
        });
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
        });
        
        return button;
    }
    
    createMainContent() {
        const content = new BABYLON.GUI.Grid();
        content.width = "100%";
        content.height = "calc(100% - 160px)";
        content.addColumnDefinition(0.2); // سایدبار چپ
        content.addColumnDefinition(0.6); // محتوای اصلی
        content.addColumnDefinition(0.2); // سایدبار راست
        
        // سایدبار چپ
        const leftSidebar = this.createLeftSidebar();
        content.addControl(leftSidebar, 0, 0);
        
        // محتوای اصلی
        const mainContent = this.createCenterContent();
        content.addControl(mainContent, 0, 1);
        
        // سایدبار راست
        const rightSidebar = this.createRightSidebar();
        content.addControl(rightSidebar, 0, 2);
        
        return content;
    }
    
    createLeftSidebar() {
        const sidebar = new BABYLON.GUI.StackPanel();
        sidebar.width = "100%";
        sidebar.height = "100%";
        sidebar.paddingLeft = "10px";
        sidebar.paddingTop = "20px";
        
        // دکمه‌های کنترلی دوربین
        const cameraTitle = new BABYLON.GUI.TextBlock();
        cameraTitle.text = "کنترل‌های دوربین";
        cameraTitle.color = "gold";
        cameraTitle.fontSize = 16;
        cameraTitle.fontWeight = "bold";
        cameraTitle.height = "30px";
        cameraTitle.paddingBottom = "10px";
        sidebar.addControl(cameraTitle);
        
        const zoomInBtn = this.createControlButton("بزرگنمایی", "+", () => {
            this.gameEngine.camera.radius -= 2;
        });
        sidebar.addControl(zoomInBtn);
        
        const zoomOutBtn = this.createControlButton("کوچکنمایی", "-", () => {
            this.gameEngine.camera.radius += 2;
        });
        sidebar.addControl(zoomOutBtn);
        
        const rotateLeftBtn = this.createControlButton("چرخش چپ", "↶", () => {
            this.gameEngine.camera.alpha -= 0.1;
        });
        sidebar.addControl(rotateLeftBtn);
        
        const rotateRightBtn = this.createControlButton("چرخش راست", "↷", () => {
            this.gameEngine.camera.alpha += 0.1;
        });
        sidebar.addControl(rotateRightBtn);
        
        const resetCameraBtn = this.createControlButton("بازنشانی", "⟲", () => {
            this.gameEngine.camera.radius = 50;
            this.gameEngine.camera.alpha = -Math.PI / 2;
            this.gameEngine.camera.beta = Math.PI / 3;
        });
        sidebar.addControl(resetCameraBtn);
        
        // جداکننده
        const separator = this.createSeparator();
        sidebar.addControl(separator);
        
        // دکمه‌های حالت‌های بازی
        const modeTitle = new BABYLON.GUI.TextBlock();
        modeTitle.text = "حالت‌های بازی";
        modeTitle.color = "gold";
        modeTitle.fontSize = 16;
        modeTitle.fontWeight = "bold";
        modeTitle.height = "30px";
        modeTitle.paddingBottom = "10px";
        sidebar.addControl(modeTitle);
        
        const buildModeBtn = this.createControlButton("حالت ساخت", "🏗️", () => {
            this.toggleBuildMode();
        });
        sidebar.addControl(buildModeBtn);
        
        const editModeBtn = this.createControlButton("حالت ویرایش", "✏️", () => {
            this.toggleEditMode();
        });
        sidebar.addControl(editModeBtn);
        
        const battleModeBtn = this.createControlButton("حالت نبرد", "⚔️", () => {
            this.toggleBattleMode();
        });
        sidebar.addControl(battleModeBtn);
        
        return sidebar;
    }
    
    createControlButton(text, icon, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "100%";
        button.height = "40px";
        button.cornerRadius = 5;
        button.background = "rgba(255, 255, 255, 0.1)";
        button.thickness = 1;
        button.color = "#666666";
        button.paddingBottom = "5px";
        
        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = false;
        stack.width = "100%";
        stack.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 18;
        iconText.color = "white";
        iconText.width = "30px";
        iconText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stack.addControl(iconText);
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = 12;
        textBlock.color = "white";
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.paddingLeft = "5px";
        stack.addControl(textBlock);
        
        button.addControl(stack);
        
        button.onPointerClickObservable.add(onClick);
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
        });
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
        });
        
        return button;
    }
    
    createSeparator() {
        const separator = new BABYLON.GUI.Rectangle();
        separator.width = "100%";
        separator.height = "1px";
        separator.background = "rgba(255, 255, 255, 0.3)";
        separator.thickness = 0;
        separator.paddingTop = "10px";
        separator.paddingBottom = "10px";
        return separator;
    }
    
    createCenterContent() {
        const content = new BABYLON.GUI.StackPanel();
        content.width = "100%";
        content.height = "100%";
        content.paddingTop = "20px";
        
        // اطلاعات پایگاه
        const baseInfo = this.createBaseInfoPanel();
        content.addControl(baseInfo);
        
        // آمار سریع
        const quickStats = this.createQuickStatsPanel();
        content.addControl(quickStats);
        
        // فعالیت‌های اخیر
        const recentActivity = this.createRecentActivityPanel();
        content.addControl(recentActivity);
        
        // مینی‌مپ
        const minimap = this.createMinimapPanel();
        content.addControl(minimap);
        
        return content;
    }
    
    createBaseInfoPanel() {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "90%";
        panel.height = "100px";
        panel.cornerRadius = 10;
        panel.background = "rgba(0, 0, 0, 0.6)";
        panel.thickness = 2;
        panel.color = "gold";
        panel.padding = "10px";
        
        const grid = new BABYLON.GUI.Grid();
        grid.width = "100%";
        grid.height = "100%";
        grid.addColumnDefinition(0.33);
        grid.addColumnDefinition(0.33);
        grid.addColumnDefinition(0.34);
        
        // سطح پایگاه
        const levelPanel = this.createInfoItem("سطح پایگاه", "15", "🏰");
        grid.addControl(levelPanel, 0, 0);
        
        // قدرت پایگاه
        const powerPanel = this.createInfoItem("قدرت پایگاه", "2,450", "⚡");
        grid.addControl(powerPanel, 0, 1);
        
        // رتبه
        const rankPanel = this.createInfoItem("رتبه", "1,234", "🥇");
        grid.addControl(rankPanel, 0, 2);
        
        panel.addControl(grid);
        return panel;
    }
    
    createInfoItem(title, value, icon) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = true;
        container.width = "100%";
        container.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 24;
        iconText.color = "gold";
        iconText.height = "30px";
        container.addControl(iconText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.fontSize = 20;
        valueText.color = "white";
        valueText.fontWeight = "bold";
        valueText.height = "30px";
        container.addControl(valueText);
        
        const titleText = new BABYLON.GUI.TextBlock();
        titleText.text = title;
        titleText.fontSize = 12;
        titleText.color = "#cccccc";
        titleText.height = "20px";
        container.addControl(titleText);
        
        return container;
    }
    
    createQuickStatsPanel() {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "90%";
        panel.height = "120px";
        panel.cornerRadius = 10;
        panel.background = "rgba(0, 0, 0, 0.6)";
        panel.thickness = 2;
        panel.color = "#8A2BE2";
        panel.padding = "10px";
        panel.paddingTop = "20px";
        
        const grid = new BABYLON.GUI.Grid();
        grid.width = "100%";
        grid.height = "100%";
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        
        const stats = [
            { title: "سربازان", value: "45", icon: "⚔️" },
            { title: "ساختمان‌ها", value: "28", icon: "🏠" },
            { title: "پیروزی‌ها", value: "156", icon: "🏆" },
            { title: "مدال‌ها", value: "12", icon: "🎖️" }
        ];
        
        stats.forEach((stat, index) => {
            const statPanel = this.createStatItem(stat.title, stat.value, stat.icon);
            grid.addControl(statPanel, 0, index);
        });
        
        panel.addControl(grid);
        return panel;
    }
    
    createStatItem(title, value, icon) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = true;
        container.width = "100%";
        container.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 20;
        iconText.color = "white";
        iconText.height = "25px";
        container.addControl(iconText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.fontSize = 18;
        valueText.color = "white";
        valueText.fontWeight = "bold";
        valueText.height = "25px";
        container.addControl(valueText);
        
        const titleText = new BABYLON.GUI.TextBlock();
        titleText.text = title;
        titleText.fontSize = 10;
        titleText.color = "#cccccc";
        titleText.height = "20px";
        container.addControl(titleText);
        
        return container;
    }
    
    createRecentActivityPanel() {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "90%";
        panel.height = "150px";
        panel.cornerRadius = 10;
        panel.background = "rgba(0, 0, 0, 0.6)";
        panel.thickness = 2;
        panel.color = "#00BFFF";
        panel.padding = "10px";
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "فعالیت‌های اخیر";
        title.color = "gold";
        title.fontSize = 16;
        title.fontWeight = "bold";
        title.height = "30px";
        title.paddingBottom = "10px";
        panel.addControl(title);
        
        const activityList = new BABYLON.GUI.StackPanel();
        activityList.width = "100%";
        activityList.height = "calc(100% - 40px)";
        
        const activities = [
            { text: "معدن طلا سطح ۵ تکمیل شد", time: "۲ دقیقه پیش", type: "upgrade" },
            { text: "سرباز جدید آموزش داده شد", time: "۵ دقیقه پیش", type: "training" },
            { text: "حمله موفق به پایگاه دشمن", time: "۱۵ دقیقه پیش", type: "battle" },
            { text: "به قبیله 'شیران' پیوستید", time: "۱ ساعت پیش", type: "clan" }
        ];
        
        activities.forEach(activity => {
            const activityItem = this.createActivityItem(activity.text, activity.time, activity.type);
            activityList.addControl(activityItem);
        });
        
        panel.addControl(activityList);
        return panel;
    }
    
    createActivityItem(text, time, type) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "25px";
        container.paddingBottom = "5px";
        
        const iconMap = {
            upgrade: "⬆️",
            training: "⚔️",
            battle: "🔥",
            clan: "👥"
        };
        
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = iconMap[type] || "●";
        icon.fontSize = 12;
        icon.color = "white";
        icon.width = "20px";
        icon.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(icon);
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = 12;
        textBlock.color = "white";
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.paddingLeft = "5px";
        textBlock.textWrapping = true;
        container.addControl(textBlock);
        
        const timeText = new BABYLON.GUI.TextBlock();
        timeText.text = time;
        timeText.fontSize = 10;
        timeText.color = "#cccccc";
        timeText.width = "60px";
        timeText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        container.addControl(timeText);
        
        return container;
    }
    
    createMinimapPanel() {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "200px";
        panel.height = "200px";
        panel.cornerRadius = 10;
        panel.background = "rgba(0, 0, 0, 0.8)";
        panel.thickness = 2;
        panel.color = "gold";
        panel.padding = "5px";
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "نقشه پایگاه";
        title.color = "gold";
        title.fontSize = 14;
        title.fontWeight = "bold";
        title.height = "20px";
        panel.addControl(title);
        
        // ایجاد مینی‌مپ ساده
        const minimap = new BABYLON.GUI.Rectangle();
        minimap.width = "190px";
        minimap.height = "170px";
        minimap.background = "rgba(50, 50, 50, 0.8)";
        minimap.thickness = 1;
        minimap.color = "#666666";
        minimap.paddingTop = "5px";
        panel.addControl(minimap);
        
        return panel;
    }
    
    createRightSidebar() {
        const sidebar = new BABYLON.GUI.StackPanel();
        sidebar.width = "100%";
        sidebar.height = "100%";
        sidebar.paddingRight = "10px";
        sidebar.paddingTop = "20px";
        
        // دکمه‌های سریع اقدام
        const actionTitle = new BABYLON.GUI.TextBlock();
        actionTitle.text = "اقدامات سریع";
        actionTitle.color = "gold";
        actionTitle.fontSize = 16;
        actionTitle.fontWeight = "bold";
        actionTitle.height = "30px";
        actionTitle.paddingBottom = "10px";
        sidebar.addControl(actionTitle);
        
        const quickActions = [
            { text: "ساخت سریع", icon: "⚒️", action: () => this.showQuickBuildMenu() },
            { text: "آموزش سرباز", icon: "⚔️", action: () => this.showQuickTrainingMenu() },
            { text: "ارتقاء ساختمان", icon: "⬆️", action: () => this.showQuickUpgradeMenu() },
            { text: "حمله فوری", icon: "🔥", action: () => this.startQuickBattle() },
            { text: "اهداف روزانه", icon: "🎯", action: () => this.showDailyGoals() }
        ];
        
        quickActions.forEach(action => {
            const btn = this.createQuickActionButton(action.text, action.icon, action.action);
            sidebar.addControl(btn);
        });
        
        // جداکننده
        const separator = this.createSeparator();
        sidebar.addControl(separator);
        
        // وضعیت آنلاین
        const onlineStatus = this.createOnlineStatusPanel();
        sidebar.addControl(onlineStatus);
        
        // چت سریع
        const quickChat = this.createQuickChatPanel();
        sidebar.addControl(quickChat);
        
        return sidebar;
    }
    
    createQuickActionButton(text, icon, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "100%";
        button.height = "45px";
        button.cornerRadius = 8;
        button.background = "rgba(255, 215, 0, 0.2)";
        button.thickness = 1;
        button.color = "gold";
        button.paddingBottom = "5px";
        
        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = false;
        stack.width = "100%";
        stack.height = "100%";
        stack.padding = "5px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 20;
        iconText.color = "white";
        iconText.width = "30px";
        iconText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        stack.addControl(iconText);
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = 12;
        textBlock.color = "white";
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.paddingLeft = "5px";
        textBlock.textWrapping = true;
        stack.addControl(textBlock);
        
        button.addControl(stack);
        
        button.onPointerClickObservable.add(onClick);
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 215, 0, 0.3)";
        });
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 215, 0, 0.2)";
        });
        
        return button;
    }
    
    createOnlineStatusPanel() {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "100%";
        panel.height = "80px";
        panel.cornerRadius = 8;
        panel.background = "rgba(0, 0, 0, 0.6)";
        panel.thickness = 1;
        panel.color = "#666666";
        panel.padding = "8px";
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "وضعیت آنلاین";
        title.color = "gold";
        title.fontSize = 14;
        title.fontWeight = "bold";
        title.height = "20px";
        panel.addControl(title);
        
        const statusGrid = new BABYLON.GUI.Grid();
        statusGrid.width = "100%";
        statusGrid.height = "50px";
        statusGrid.addColumnDefinition(0.5);
        statusGrid.addColumnDefinition(0.5);
        
        const playersOnline = this.createStatusItem("بازیکنان آنلاین", "1,234", "🟢");
        statusGrid.addControl(playersOnline, 0, 0);
        
        const friendsOnline = this.createStatusItem("دوستان آنلاین", "12", "👥");
        statusGrid.addControl(friendsOnline, 0, 1);
        
        panel.addControl(statusGrid);
        return panel;
    }
    
    createStatusItem(title, value, icon) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = true;
        container.width = "100%";
        container.height = "100%";
        
        const valuePanel = new BABYLON.GUI.StackPanel();
        valuePanel.isVertical = false;
        valuePanel.height = "20px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 12;
        iconText.color = "white";
        iconText.width = "15px";
        valuePanel.addControl(iconText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.fontSize = 14;
        valueText.color = "white";
        valueText.fontWeight = "bold";
        valuePanel.addControl(valueText);
        
        const titleText = new BABYLON.GUI.TextBlock();
        titleText.text = title;
        titleText.fontSize = 10;
        titleText.color = "#cccccc";
        titleText.height = "15px";
        
        container.addControl(valuePanel);
        container.addControl(titleText);
        
        return container;
    }
    
    createQuickChatPanel() {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "100%";
        panel.height = "120px";
        panel.cornerRadius = 8;
        panel.background = "rgba(0, 0, 0, 0.6)";
        panel.thickness = 1;
        panel.color = "#666666";
        panel.padding = "8px";
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "چت سریع";
        title.color = "gold";
        title.fontSize = 14;
        title.fontWeight = "bold";
        title.height = "20px";
        panel.addControl(title);
        
        const chatMessages = new BABYLON.GUI.StackPanel();
        chatMessages.width = "100%";
        chatMessages.height = "70px";
        chatMessages.background = "rgba(255, 255, 255, 0.1)";
        chatMessages.padding = "5px";
        
        const messages = [
            { sender: "نبردجو", text: "کمک نیاز دارم!", time: "2m" },
            { sender: "پادشاه", text: "حمله هماهنگ کنیم", time: "5m" }
        ];
        
        messages.forEach(msg => {
            const messageItem = this.createChatMessage(msg.sender, msg.text, msg.time);
            chatMessages.addControl(messageItem);
        });
        
        const inputPanel = new BABYLON.GUI.StackPanel();
        inputPanel.isVertical = false;
        inputPanel.width = "100%";
        inputPanel.height = "25px";
        inputPanel.paddingTop = "5px";
        
        const input = new BABYLON.GUI.InputText();
        input.width = "70%";
        input.height = "25px";
        input.background = "rgba(255, 255, 255, 0.2)";
        input.color = "white";
        input.placeholderText = "پیام...";
        input.placeholderColor = "#cccccc";
        input.thickness = 0;
        input.cornerRadius = 3;
        inputPanel.addControl(input);
        
        const sendBtn = new BABYLON.GUI.Button();
        sendBtn.width = "30%";
        sendBtn.height = "25px";
        sendBtn.background = "rgba(255, 215, 0, 0.5)";
        sendBtn.cornerRadius = 3;
        sendBtn.thickness = 0;
        sendBtn.paddingLeft = "5px";
        
        const sendText = new BABYLON.GUI.TextBlock();
        sendText.text = "ارسال";
        sendText.color = "white";
        sendText.fontSize = 12;
        sendBtn.addControl(sendText);
        
        sendBtn.onPointerClickObservable.add(() => {
            if (input.text) {
                this.sendChatMessage(input.text);
                input.text = "";
            }
        });
        
        inputPanel.addControl(sendBtn);
        
        panel.addControl(chatMessages);
        panel.addControl(inputPanel);
        
        return panel;
    }
    
    createChatMessage(sender, text, time) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "20px";
        container.paddingBottom = "2px";
        
        const senderText = new BABYLON.GUI.TextBlock();
        senderText.text = sender + ":";
        senderText.fontSize = 10;
        senderText.color = "gold";
        senderText.width = "40px";
        senderText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(senderText);
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = 10;
        textBlock.color = "white";
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.paddingLeft = "2px";
        textBlock.textWrapping = true;
        container.addControl(textBlock);
        
        const timeText = new BABYLON.GUI.TextBlock();
        timeText.text = time;
        timeText.fontSize = 8;
        timeText.color = "#cccccc";
        timeText.width = "20px";
        timeText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        container.addControl(timeText);
        
        return container;
    }
    
    createFooter() {
        const footer = new BABYLON.GUI.StackPanel();
        footer.height = "60px";
        footer.width = "100%";
        footer.isVertical = false;
        footer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        footer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        footer.paddingBottom = "10px";
        
        // نوار وضعیت
        const statusBar = this.createStatusBar();
        footer.addControl(statusBar);
        
        return footer;
    }
    
    createStatusBar() {
        const statusBar = new BABYLON.GUI.Rectangle();
        statusBar.width = "80%";
        statusBar.height = "40px";
        statusBar.cornerRadius = 20;
        statusBar.background = "rgba(0, 0, 0, 0.7)";
        statusBar.thickness = 2;
        statusBar.color = "gold";
        statusBar.padding = "5px";
        
        const grid = new BABYLON.GUI.Grid();
        grid.width = "100%";
        grid.height = "100%";
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        
        const statusItems = [
            { text: "پایگاه: امن", color: "#44ff44", icon: "🛡️" },
            { text: "سربازان: آماده", color: "#44ff44", icon: "⚔️" },
            { text: "ساختمان‌ها: فعال", color: "#44ff44", icon: "🏠" },
            { text: "اتصال: پایدار", color: "#44ff44", icon: "📶" }
        ];
        
        statusItems.forEach((item, index) => {
            const statusItem = this.createStatusBarItem(item.text, item.color, item.icon);
            grid.addControl(statusItem, 0, index);
        });
        
        statusBar.addControl(grid);
        return statusBar;
    }
    
    createStatusBarItem(text, color, icon) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "100%";
        container.padding = "2px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 14;
        iconText.color = color;
        iconText.width = "20px";
        container.addControl(iconText);
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.fontSize = 10;
        textBlock.color = color;
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.paddingLeft = "2px";
        container.addControl(textBlock);
        
        return container;
    }
    
    createBuildMenu() {
        const buildMenu = new BABYLON.GUI.Rectangle();
        buildMenu.width = "600px";
        buildMenu.height = "120px";
        buildMenu.cornerRadius = 15;
        buildMenu.background = "rgba(0, 0, 0, 0.9)";
        buildMenu.thickness = 3;
        buildMenu.color = "gold";
        buildMenu.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        buildMenu.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        buildMenu.padding = "10px";
        buildMenu.paddingBottom = "80px";
        buildMenu.isVisible = false;
        buildMenu.name = "buildMenu";
        this.advancedGUI.addControl(buildMenu);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "منوی ساخت ساختمان";
        title.color = "gold";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingBottom = "10px";
        buildMenu.addControl(title);
        
        const buildGrid = new BABYLON.GUI.Grid();
        buildGrid.width = "100%";
        buildGrid.height = "70px";
        buildGrid.addColumnDefinition(0.166);
        buildGrid.addColumnDefinition(0.166);
        buildGrid.addColumnDefinition(0.166);
        buildGrid.addColumnDefinition(0.166);
        buildGrid.addColumnDefinition(0.166);
        buildGrid.addColumnDefinition(0.166);
        
        const buildingTypes = [
            { type: "townhall", name: "سالن شهر", icon: "🏛️", cost: "500 طلا" },
            { type: "goldmine", name: "معدن طلا", icon: "💰", cost: "100 طلا" },
            { type: "elixirmine", name: "کارخانه اکسیر", icon: "⚗️", cost: "100 اکسیر" },
            { type: "barracks", name: "سربازخانه", icon: "⚔️", cost: "200 طلا" },
            { type: "wall", name: "دیوار", icon: "🧱", cost: "50 طلا" },
            { type: "cannon", name: "توپخانه", icon: "💣", cost: "300 طلا" }
        ];
        
        buildingTypes.forEach((building, index) => {
            const buildItem = this.createBuildMenuItem(building.type, building.name, building.icon, building.cost);
            buildGrid.addControl(buildItem, 0, index);
        });
        
        buildMenu.addControl(buildGrid);
        this.modals.buildMenu = buildMenu;
    }
    
    createBuildMenuItem(type, name, icon, cost) {
        const container = new BABYLON.GUI.Button();
        container.width = "90px";
        container.height = "70px";
        container.cornerRadius = 8;
        container.background = "rgba(255, 255, 255, 0.1)";
        container.thickness = 1;
        container.color = "#666666";
        container.padding = "5px";
        
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
        nameText.fontSize = 10;
        nameText.color = "white";
        nameText.height = "15px";
        nameText.textWrapping = true;
        stack.addControl(nameText);
        
        const costText = new BABYLON.GUI.TextBlock();
        costText.text = cost;
        costText.fontSize = 8;
        costText.color = "gold";
        costText.height = "10px";
        stack.addControl(costText);
        
        container.addControl(stack);
        
        container.onPointerClickObservable.add(() => {
            this.gameEngine.setBuildMode(type);
            this.hideBuildMenu();
        });
        
        container.onPointerEnterObservable.add(() => {
            container.background = "rgba(255, 255, 255, 0.2)";
        });
        
        container.onPointerOutObservable.add(() => {
            container.background = "rgba(255, 255, 255, 0.1)";
        });
        
        return container;
    }
    
    createShopPage() {
        const shopPage = new BABYLON.GUI.Rectangle();
        shopPage.width = "80%";
        shopPage.height = "80%";
        shopPage.cornerRadius = 20;
        shopPage.background = "rgba(0, 0, 0, 0.95)";
        shopPage.thickness = 4;
        shopPage.color = "gold";
        shopPage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        shopPage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        shopPage.padding = "20px";
        shopPage.isVisible = false;
        shopPage.name = "shopPage";
        this.advancedGUI.addControl(shopPage);
        
        const header = new BABYLON.GUI.StackPanel();
        header.isVertical = false;
        header.width = "100%";
        header.height = "50px";
        header.paddingBottom = "20px";
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "فروشگاه سربازان";
        title.color = "gold";
        title.fontSize = 24;
        title.fontWeight = "bold";
        title.width = "80%";
        title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.addControl(title);
        
        const closeBtn = this.createCloseButton(() => this.hideShopPage());
        closeBtn.width = "20%";
        header.addControl(closeBtn);
        
        shopPage.addControl(header);
        
        const content = this.createShopContent();
        shopPage.addControl(content);
        
        this.pages.shop = shopPage;
    }
    
    createShopContent() {
        const container = new BABYLON.GUI.Grid();
        container.width = "100%";
        container.height = "calc(100% - 70px)";
        container.addRowDefinition(0.7); // لیست سربازان
        container.addRowDefinition(0.3); // اطلاعات انتخاب شده
        
        const unitsGrid = this.createUnitsGrid();
        container.addControl(unitsGrid, 0, 0);
        
        const unitDetails = this.createUnitDetailsPanel();
        container.addControl(unitDetails, 1, 0);
        
        return container;
    }
    
    createUnitsGrid() {
        const grid = new BABYLON.GUI.Grid();
        grid.width = "100%";
        grid.height = "100%";
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        grid.addColumnDefinition(0.25);
        grid.addRowDefinition(0.5);
        grid.addRowDefinition(0.5);
        
        const units = [
            { type: "soldier", name: "سرباز", icon: "⚔️", cost: "50 اکسیر", damage: "20", health: "100", speed: "1.5" },
            { type: "archer", name: "کماندار", icon: "🏹", cost: "100 اکسیر", damage: "35", health: "80", speed: "1.2" },
            { type: "giant", name: "غول", icon: "👹", cost: "200 اکسیر", damage: "50", health: "300", speed: "0.8" },
            { type: "dragon", name: "اژدها", icon: "🐲", cost: "300 اکسیر", damage: "80", health: "200", speed: "2.0" },
            { type: "wizard", name: "جادوگر", icon: "🧙", cost: "150 اکسیر", damage: "45", health: "90", speed: "1.0" },
            { type: "healer", name: "درمانگر", icon: "💖", cost: "250 اکسیر", damage: "0", health: "120", speed: "1.3" },
            { type: "miner", name: "معدنچی", icon: "⛏️", cost: "80 اکسیر", damage: "15", health: "70", speed: "1.8" },
            { type: "hog", name: "خوک جنگی", icon: "🐗", cost: "180 اکسیر", damage: "40", health: "150", speed: "2.2" }
        ];
        
        units.forEach((unit, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const unitCard = this.createUnitCard(unit);
            grid.addControl(unitCard, row, col);
        });
        
        return grid;
    }
    
    createUnitCard(unit) {
        const card = new BABYLON.GUI.Button();
        card.width = "95%";
        card.height = "95%";
        card.cornerRadius = 10;
        card.background = "rgba(255, 255, 255, 0.1)";
        card.thickness = 2;
        card.color = "#666666";
        card.padding = "10px";
        
        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = true;
        stack.width = "100%";
        stack.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = unit.icon;
        iconText.fontSize = 30;
        iconText.color = "white";
        iconText.height = "40px";
        stack.addControl(iconText);
        
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = unit.name;
        nameText.fontSize = 16;
        nameText.color = "gold";
        nameText.fontWeight = "bold";
        nameText.height = "25px";
        stack.addControl(nameText);
        
        const costText = new BABYLON.GUI.TextBlock();
        costText.text = unit.cost;
        costText.fontSize = 12;
        costText.color = "#8A2BE2";
        costText.height = "20px";
        stack.addControl(costText);
        
        const statsPanel = new BABYLON.GUI.StackPanel();
        statsPanel.isVertical = false;
        statsPanel.width = "100%";
        statsPanel.height = "40px";
        
        const damageStat = this.createUnitStat("⚔️", unit.damage);
        statsPanel.addControl(damageStat);
        
        const healthStat = this.createUnitStat("❤️", unit.health);
        statsPanel.addControl(healthStat);
        
        const speedStat = this.createUnitStat("⚡", unit.speed);
        statsPanel.addControl(speedStat);
        
        stack.addControl(statsPanel);
        
        const buyBtn = new BABYLON.GUI.Button();
        buyBtn.width = "100%";
        buyBtn.height = "25px";
        buyBtn.cornerRadius = 5;
        buyBtn.background = "rgba(138, 43, 226, 0.7)";
        buyBtn.thickness = 0;
        
        const buyText = new BABYLON.GUI.TextBlock();
        buyText.text = "آموزش";
        buyText.color = "white";
        buyText.fontSize = 12;
        buyText.fontWeight = "bold";
        buyBtn.addControl(buyText);
        
        buyBtn.onPointerClickObservable.add(() => {
            this.gameEngine.buyUnit(unit.type);
        });
        
        stack.addControl(buyBtn);
        
        card.addControl(stack);
        
        card.onPointerEnterObservable.add(() => {
            card.background = "rgba(255, 255, 255, 0.2)";
            this.showUnitDetails(unit);
        });
        
        card.onPointerOutObservable.add(() => {
            card.background = "rgba(255, 255, 255, 0.1)";
        });
        
        return card;
    }
    
    createUnitStat(icon, value) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "33%";
        container.height = "100%";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 10;
        iconText.color = "white";
        iconText.width = "15px";
        container.addControl(iconText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.fontSize = 10;
        valueText.color = "white";
        container.addControl(valueText);
        
        return container;
    }
    
    createUnitDetailsPanel() {
        const panel = new BABYLON.GUI.Rectangle();
        panel.width = "100%";
        panel.height = "100%";
        panel.cornerRadius = 10;
        panel.background = "rgba(255, 255, 255, 0.1)";
        panel.thickness = 1;
        panel.color = "#666666";
        panel.padding = "15px";
        panel.name = "unitDetailsPanel";
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "اطلاعات سرباز";
        title.color = "gold";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingBottom = "10px";
        panel.addControl(title);
        
        const detailsStack = new BABYLON.GUI.StackPanel();
        detailsStack.width = "100%";
        detailsStack.height = "calc(100% - 35px)";
        
        const description = new BABYLON.GUI.TextBlock();
        description.text = "یک سرباز را برای مشاهده اطلاعات انتخاب کنید";
        description.color = "white";
        description.fontSize = 14;
        description.textWrapping = true;
        description.height = "100%";
        description.name = "unitDescription";
        detailsStack.addControl(description);
        
        panel.addControl(detailsStack);
        
        return panel;
    }
    
    showUnitDetails(unit) {
        const descriptionMap = {
            soldier: "سرباز پایه‌ای که برای حمله‌های اولیه مناسب است. هزینه کم و سرعت مناسب دارد.",
            archer: "کمانداری که از راه دور به دشمنان حمله می‌کند. آسیب خوبی دارد اما مقاومت کمی دارد.",
            giant: "غول با مقاومت بسیار بالا که می‌تواند آسیب زیادی را تحمل کند. برای از بین بردن دفاع‌ها عالی است.",
            dragon: "اژدهای قدرتمند که از آتش برای نابودی دشمنان استفاده می‌کند. سریع و مرگبار است.",
            wizard: "جادوگر که با انرژی جادویی به دشمنان حمله می‌کند. آسیب منطقه‌ای خوبی دارد.",
            healer: "درمانگری که واحدهای دیگر را درمان می‌کند. برای حمله‌های طولانی مدت ضروری است.",
            miner: "معدنچی که می‌تواند زیر زمین حرکت کند و از دفاع‌ها عبور کند. برای غافلگیری مناسب است.",
            hog: "خوک جنگی سریع که به سرعت به ساختمان‌های دفاعی حمله می‌کند. برای نابودی سریع دفاع‌ها عالی است."
        };
        
        const description = this.advancedGUI.getControlByName("unitDescription");
        if (description) {
            description.text = descriptionMap[unit.type] || "توضیحاتی برای این سرباز موجود نیست.";
        }
    }
    
    createCloseButton(onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "50px";
        button.height = "50px";
        button.cornerRadius = 25;
        button.background = "rgba(255, 0, 0, 0.7)";
        button.thickness = 0;
        
        const closeText = new BABYLON.GUI.TextBlock();
        closeText.text = "×";
        closeText.color = "white";
        closeText.fontSize = 30;
        closeText.fontWeight = "bold";
        button.addControl(closeText);
        
        button.onPointerClickObservable.add(onClick);
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 0, 0, 0.9)";
        });
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 0, 0, 0.7)";
        });
        
        return button;
    }
    
    createSettingsPage() {
        // ایجاد صفحه تنظیمات (ساده‌شده)
        const settingsPage = new BABYLON.GUI.Rectangle();
        settingsPage.width = "60%";
        settingsPage.height = "70%";
        settingsPage.cornerRadius = 20;
        settingsPage.background = "rgba(0, 0, 0, 0.95)";
        settingsPage.thickness = 4;
        settingsPage.color = "gold";
        settingsPage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        settingsPage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        settingsPage.padding = "20px";
        settingsPage.isVisible = false;
        settingsPage.name = "settingsPage";
        this.advancedGUI.addControl(settingsPage);
        
        this.pages.settings = settingsPage;
    }
    
    createStatsPage() {
        // ایجاد صفحه آمار (ساده‌شده)
        const statsPage = new BABYLON.GUI.Rectangle();
        statsPage.width = "70%";
        statsPage.height = "80%";
        statsPage.cornerRadius = 20;
        statsPage.background = "rgba(0, 0, 0, 0.95)";
        statsPage.thickness = 4;
        statsPage.color = "gold";
        statsPage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        statsPage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        statsPage.padding = "20px";
        statsPage.isVisible = false;
        statsPage.name = "statsPage";
        this.advancedGUI.addControl(statsPage);
        
        this.pages.stats = statsPage;
    }
    
    createClanPage() {
        // ایجاد صفحه قبیله (ساده‌شده)
        const clanPage = new BABYLON.GUI.Rectangle();
        clanPage.width = "80%";
        clanPage.height = "85%";
        clanPage.cornerRadius = 20;
        clanPage.background = "rgba(0, 0, 0, 0.95)";
        clanPage.thickness = 4;
        clanPage.color = "gold";
        clanPage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        clanPage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        clanPage.padding = "20px";
        clanPage.isVisible = false;
        clanPage.name = "clanPage";
        this.advancedGUI.addControl(clanPage);
        
        this.pages.clan = clanPage;
    }
    
    createBattlePage() {
        // ایجاد صفحه نبرد (ساده‌شده)
        const battlePage = new BABYLON.GUI.Rectangle();
        battlePage.width = "90%";
        battlePage.height = "90%";
        battlePage.cornerRadius = 20;
        battlePage.background = "rgba(0, 0, 0, 0.95)";
        battlePage.thickness = 4;
        battlePage.color = "red";
        battlePage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        battlePage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        battlePage.padding = "20px";
        battlePage.isVisible = false;
        battlePage.name = "battlePage";
        this.advancedGUI.addControl(battlePage);
        
        this.pages.battle = battlePage;
    }
    
    createContextMenus() {
        // ایجاد منوهای راست کلیک
        this.createBuildingContextMenu();
        this.createUnitContextMenu();
        this.createGroundContextMenu();
    }
    
    createBuildingContextMenu() {
        const contextMenu = new BABYLON.GUI.Rectangle();
        contextMenu.width = "200px";
        contextMenu.height = "150px";
        contextMenu.cornerRadius = 10;
        contextMenu.background = "rgba(0, 0, 0, 0.9)";
        contextMenu.thickness = 2;
        contextMenu.color = "gold";
        contextMenu.padding = "5px";
        contextMenu.isVisible = false;
        contextMenu.name = "buildingContextMenu";
        this.advancedGUI.addControl(contextMenu);
        
        this.contextMenus.building = contextMenu;
    }
    
    createUnitContextMenu() {
        const contextMenu = new BABYLON.GUI.Rectangle();
        contextMenu.width = "180px";
        contextMenu.height = "120px";
        contextMenu.cornerRadius = 10;
        contextMenu.background = "rgba(0, 0, 0, 0.9)";
        contextMenu.thickness = 2;
        contextMenu.color = "#8A2BE2";
        contextMenu.padding = "5px";
        contextMenu.isVisible = false;
        contextMenu.name = "unitContextMenu";
        this.advancedGUI.addControl(contextMenu);
        
        this.contextMenus.unit = contextMenu;
    }
    
    createGroundContextMenu() {
        const contextMenu = new BABYLON.GUI.Rectangle();
        contextMenu.width = "160px";
        contextMenu.height = "100px";
        contextMenu.cornerRadius = 10;
        contextMenu.background = "rgba(0, 0, 0, 0.9)";
        contextMenu.thickness = 2;
        contextMenu.color = "#00BFFF";
        contextMenu.padding = "5px";
        contextMenu.isVisible = false;
        contextMenu.name = "groundContextMenu";
        this.advancedGUI.addControl(contextMenu);
        
        this.contextMenus.ground = contextMenu;
    }
    
    createTooltips() {
        // ایجاد سیستم راهنما
        this.createBuildingTooltip();
        this.createUnitTooltip();
        this.createResourceTooltip();
    }
    
    createBuildingTooltip() {
        const tooltip = new BABYLON.GUI.Rectangle();
        tooltip.width = "250px";
        tooltip.height = "100px";
        tooltip.cornerRadius = 8;
        tooltip.background = "rgba(0, 0, 0, 0.8)";
        tooltip.thickness = 1;
        tooltip.color = "gold";
        tooltip.padding = "10px";
        tooltip.isVisible = false;
        tooltip.name = "buildingTooltip";
        this.advancedGUI.addControl(tooltip);
        
        this.tooltips.building = tooltip;
    }
    
    createUnitTooltip() {
        const tooltip = new BABYLON.GUI.Rectangle();
        tooltip.width = "220px";
        tooltip.height = "80px";
        tooltip.cornerRadius = 8;
        tooltip.background = "rgba(0, 0, 0, 0.8)";
        tooltip.thickness = 1;
        tooltip.color = "#8A2BE2";
        tooltip.padding = "8px";
        tooltip.isVisible = false;
        tooltip.name = "unitTooltip";
        this.advancedGUI.addControl(tooltip);
        
        this.tooltips.unit = tooltip;
    }
    
    createResourceTooltip() {
        const tooltip = new BABYLON.GUI.Rectangle();
        tooltip.width = "180px";
        tooltip.height = "60px";
        tooltip.cornerRadius = 8;
        tooltip.background = "rgba(0, 0, 0, 0.8)";
        tooltip.thickness = 1;
        tooltip.color = "#00BFFF";
        tooltip.padding = "5px";
        tooltip.isVisible = false;
        tooltip.name = "resourceTooltip";
        this.advancedGUI.addControl(tooltip);
        
        this.tooltips.resource = tooltip;
    }
    
    createNotificationSystem() {
        // ایجاد سیستم اعلان‌ها
        const notificationContainer = new BABYLON.GUI.StackPanel();
        notificationContainer.width = "300px";
        notificationContainer.height = "400px";
        notificationContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        notificationContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        notificationContainer.paddingTop = "100px";
        notificationContainer.paddingRight = "10px";
        notificationContainer.isVisible = true;
        notificationContainer.name = "notificationContainer";
        this.advancedGUI.addControl(notificationContainer);
        
        this.notifications.container = notificationContainer;
    }
    
    createTutorialSystem() {
        // ایجاد سیستم آموزش
        const tutorialOverlay = new BABYLON.GUI.Rectangle();
        tutorialOverlay.width = "100%";
        tutorialOverlay.height = "100%";
        tutorialOverlay.background = "rgba(0, 0, 0, 0.7)";
        tutorialOverlay.thickness = 0;
        tutorialOverlay.isVisible = false;
        tutorialOverlay.name = "tutorialOverlay";
        this.advancedGUI.addControl(tutorialOverlay);
        
        this.tutorial = {
            overlay: tutorialOverlay,
            currentStep: 0,
            steps: []
        };
    }
    
    createAchievementSystem() {
        // ایجاد سیستم دستاوردها
        const achievementPanel = new BABYLON.GUI.Rectangle();
        achievementPanel.width = "300px";
        achievementPanel.height = "200px";
        achievementPanel.cornerRadius = 10;
        achievementPanel.background = "rgba(0, 0, 0, 0.9)";
        achievementPanel.thickness = 2;
        achievementPanel.color = "gold";
        achievementPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        achievementPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        achievementPanel.padding = "10px";
        achievementPanel.paddingTop = "100px";
        achievementPanel.paddingLeft = "10px";
        achievementPanel.isVisible = false;
        achievementPanel.name = "achievementPanel";
        this.advancedGUI.addControl(achievementPanel);
        
        this.achievements = {
            panel: achievementPanel,
            unlocked: [],
            pending: []
        };
    }
    
    createEventSystem() {
        // ایجاد سیستم رویدادها
        this.events = {
            active: [],
            upcoming: [],
            completed: []
        };
    }
    
    setupEventListeners() {
        // مدیریت رویدادهای صفحه
        this.scene.onPointerObservable.add((pointerInfo) => {
            this.handlePointerEvents(pointerInfo);
        });
        
        // مدیریت رویدادهای کیبورد
        this.scene.onKeyboardObservable.add((kbInfo) => {
            this.handleKeyboardEvents(kbInfo);
        });
    }
    
    handlePointerEvents(pointerInfo) {
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
    }
    
    handlePointerDown(pointerInfo) {
        // مدیریت کلیک‌ها
        if (pointerInfo.event.button === 2) { // کلیک راست
            this.showContextMenu(pointerInfo);
        }
    }
    
    handlePointerUp(pointerInfo) {
        // مدیریت رها کردن کلیک
    }
    
    handlePointerMove(pointerInfo) {
        // مدیریت حرکت موس
        this.updateTooltips(pointerInfo);
    }
    
    handleKeyboardEvents(kbInfo) {
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            const key = kbInfo.event.key;
            
            switch (key) {
                case "Escape":
                    this.handleEscapeKey();
                    break;
                case "b":
                    this.toggleBuildMenu();
                    break;
                case "s":
                    this.toggleShopPage();
                    break;
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                    this.quickSelectBuilding(parseInt(key) - 1);
                    break;
            }
        }
    }
    
    handleEscapeKey() {
        // بستن منوها و مودال‌ها با کلید Escape
        if (this.currentPage !== "main") {
            this.showPage("main");
        } else if (this.modals.buildMenu && this.modals.buildMenu.isVisible) {
            this.hideBuildMenu();
        } else {
            this.gameEngine.cancelBuildMode();
            this.gameEngine.deselectBuilding();
        }
    }
    
    showContextMenu(pointerInfo) {
        // نمایش منوی راست کلیک
        const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
        
        if (pickResult.hit) {
            if (pickResult.pickedMesh) {
                const building = this.gameEngine.buildings.find(b => b.mesh === pickResult.pickedMesh);
                const unit = this.gameEngine.units.find(u => u.mesh === pickResult.pickedMesh);
                
                if (building) {
                    this.showBuildingContextMenu(building, pointerInfo.event.clientX, pointerInfo.event.clientY);
                } else if (unit) {
                    this.showUnitContextMenu(unit, pointerInfo.event.clientX, pointerInfo.event.clientY);
                } else {
                    this.showGroundContextMenu(pointerInfo.event.clientX, pointerInfo.event.clientY);
                }
            }
        }
    }
    
    showBuildingContextMenu(building, x, y) {
        const contextMenu = this.contextMenus.building;
        if (!contextMenu) return;
        
        // پاک کردن محتوای قبلی
        contextMenu.children.forEach(child => child.dispose());
        contextMenu.children = [];
        
        // ایجاد آیتم‌های منو
        const menuItems = [
            { text: "اطلاعات ساختمان", action: () => this.showBuildingInfo(building) },
            { text: "ارتقاء ساختمان", action: () => this.upgradeBuilding(building) },
            { text: "جابجایی ساختمان", action: () => this.moveBuilding(building) },
            { text: "فروش ساختمان", action: () => this.sellBuilding(building) }
        ];
        
        menuItems.forEach((item, index) => {
            const menuItem = this.createContextMenuItem(item.text, item.action);
            menuItem.top = index * 30 + "px";
            contextMenu.addControl(menuItem);
        });
        
        // موقعیت‌دهی منو
        contextMenu.left = x + "px";
        contextMenu.top = y + "px";
        contextMenu.isVisible = true;
    }
    
    createContextMenuItem(text, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "100%";
        button.height = "30px";
        button.background = "rgba(255, 255, 255, 0.1)";
        button.thickness = 0;
        button.cornerRadius = 5;
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = text;
        textBlock.color = "white";
        textBlock.fontSize = 12;
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        textBlock.paddingLeft = "10px";
        button.addControl(textBlock);
        
        button.onPointerClickObservable.add(() => {
            onClick();
            this.hideAllContextMenus();
        });
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.2)";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(255, 255, 255, 0.1)";
        });
        
        return button;
    }
    
    showUnitContextMenu(unit, x, y) {
        // مشابه showBuildingContextMenu
    }
    
    showGroundContextMenu(x, y) {
        // مشابه showBuildingContextMenu
    }
    
    hideAllContextMenus() {
        Object.values(this.contextMenus).forEach(menu => {
            if (menu) menu.isVisible = false;
        });
    }
    
    updateTooltips(pointerInfo) {
        // به‌روزرسانی راهنماها بر اساس موقعیت موس
        const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
        
        if (pickResult.hit && pickResult.pickedMesh) {
            const building = this.gameEngine.buildings.find(b => b.mesh === pickResult.pickedMesh);
            const unit = this.gameEngine.units.find(u => u.mesh === pickResult.pickedMesh);
            
            if (building) {
                this.showBuildingTooltip(building, pointerInfo.event.clientX, pointerInfo.event.clientY);
            } else if (unit) {
                this.showUnitTooltip(unit, pointerInfo.event.clientX, pointerInfo.event.clientY);
            } else {
                this.hideAllTooltips();
            }
        } else {
            this.hideAllTooltips();
        }
    }
    
    showBuildingTooltip(building, x, y) {
        const tooltip = this.tooltips.building;
        if (!tooltip) return;
        
        // پاک کردن محتوای قبلی
        tooltip.children.forEach(child => child.dispose());
        tooltip.children = [];
        
        // ایجاد محتوای راهنما
        const title = new BABYLON.GUI.TextBlock();
        title.text = this.gameEngine.getBuildingName(building.type);
        title.color = "gold";
        title.fontSize = 16;
        title.fontWeight = "bold";
        title.height = "25px";
        tooltip.addControl(title);
        
        const level = new BABYLON.GUI.TextBlock();
        level.text = `سطح: ${building.level}`;
        level.color = "white";
        level.fontSize = 12;
        level.height = "20px";
        tooltip.addControl(level);
        
        const production = new BABYLON.GUI.TextBlock();
        if (building.type === "goldmine") {
            production.text = "تولید: ۵ طلا در ثانیه";
        } else if (building.type === "elixirmine") {
            production.text = "تولید: ۳ اکسیر در ثانیه";
        } else {
            production.text = "ساختمان دفاعی";
        }
        production.color = "white";
        production.fontSize = 12;
        production.height = "20px";
        tooltip.addControl(production);
        
        // موقعیت‌دهی راهنما
        tooltip.left = x + 15 + "px";
        tooltip.top = y + 15 + "px";
        tooltip.isVisible = true;
    }
    
    showUnitTooltip(unit, x, y) {
        // مشابه showBuildingTooltip
    }
    
    hideAllTooltips() {
        Object.values(this.tooltips).forEach(tooltip => {
            if (tooltip) tooltip.isVisible = false;
        });
    }
    
    showBuildingInfo(building) {
        // نمایش اطلاعات کامل ساختمان
        this.showNotification(`اطلاعات ${this.gameEngine.getBuildingName(building.type)} سطح ${building.level}`);
    }
    
    upgradeBuilding(building) {
        // ارتقاء ساختمان
        if (this.gameEngine.hasEnoughResources({ gold: 200, elixir: 100 })) {
            this.gameEngine.deductResources({ gold: 200, elixir: 100 });
            building.level++;
            this.showNotification(`${this.gameEngine.getBuildingName(building.type)} به سطح ${building.level} ارتقاء یافت`);
        } else {
            this.showNotification("منابع کافی برای ارتقاء ندارید!");
        }
    }
    
    moveBuilding(building) {
        // فعال کردن حالت جابجایی ساختمان
        this.gameEngine.setMoveMode(building);
        this.showNotification("حالت جابجایی ساختمان فعال شد");
    }
    
    sellBuilding(building) {
        // فروش ساختمان
        const refund = Math.floor(building.data.cost.gold * 0.7);
        this.gameEngine.addResources({ gold: refund });
        this.gameEngine.demolishBuilding(building);
        this.showNotification(`ساختمان فروخته شد. ${refund} طلا دریافت کردید`);
    }
    
    showPage(pageName) {
        // مخفی کردن همه صفحات
        Object.values(this.pages).forEach(page => {
            if (page) page.isVisible = false;
        });
        
        // نمایش صفحه درخواستی
        if (this.pages[pageName]) {
            this.pages[pageName].isVisible = true;
            this.currentPage = pageName;
        }
    }
    
    hideShopPage() {
        this.showPage("main");
    }
    
    toggleBuildMenu() {
        const buildMenu = this.modals.buildMenu;
        if (buildMenu) {
            buildMenu.isVisible = !buildMenu.isVisible;
        }
    }
    
    hideBuildMenu() {
        const buildMenu = this.modals.buildMenu;
        if (buildMenu) {
            buildMenu.isVisible = false;
        }
    }
    
    toggleShopPage() {
        if (this.currentPage === "shop") {
            this.showPage("main");
        } else {
            this.showPage("shop");
        }
    }
    
    quickSelectBuilding(index) {
        const buildingTypes = ["townhall", "goldmine", "elixirmine", "barracks", "wall", "cannon"];
        if (index < buildingTypes.length) {
            this.gameEngine.setBuildMode(buildingTypes[index]);
        }
    }
    
    toggleBuildMode() {
        if (this.gameEngine.buildMode) {
            this.gameEngine.cancelBuildMode();
        } else {
            this.toggleBuildMenu();
        }
    }
    
    toggleEditMode() {
        this.showNotification("حالت ویرایش فعال شد");
    }
    
    toggleBattleMode() {
        this.showPage("battle");
        this.showNotification("حالت نبرد فعال شد");
    }
    
    showQuickBuildMenu() {
        this.toggleBuildMenu();
    }
    
    showQuickTrainingMenu() {
        this.showPage("shop");
    }
    
    showQuickUpgradeMenu() {
        this.showNotification("منوی ارتقاء سریع باز شد");
    }
    
    startQuickBattle() {
        this.showPage("battle");
        this.showNotification("جستجوی حریف آغاز شد...");
    }
    
    showDailyGoals() {
        this.showNotification("اهداف روزانه نمایش داده شد");
    }
    
    sendChatMessage(message) {
        // شبیه‌سازی ارسال پیام چت
        this.showNotification(`پیام ارسال شد: ${message}`);
    }
    
    showNotification(message, type = "info") {
        // ایجاد اعلان جدید
        const notification = new BABYLON.GUI.Rectangle();
        notification.width = "280px";
        notification.height = "60px";
        notification.cornerRadius = 8;
        notification.background = this.getNotificationColor(type);
        notification.thickness = 2;
        notification.color = "white";
        notification.padding = "10px";
        notification.paddingBottom = "30px";
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = message;
        textBlock.color = "white";
        textBlock.fontSize = 14;
        textBlock.textWrapping = true;
        notification.addControl(textBlock);
        
        const container = this.notifications.container;
        container.addControl(notification);
        
        // حذف خودکار پس از 3 ثانیه
        setTimeout(() => {
            notification.dispose();
        }, 3000);
        
        // محدود کردن تعداد اعلان‌ها
        if (container.children.length > 5) {
            container.children[0].dispose();
        }
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
    
    update() {
        // به‌روزرسانی UI در هر فریم
        this.updateResourceDisplays();
        this.updateNotificationPositions();
    }
    
    updateResourceDisplays() {
        // به‌روزرسانی نمایش مقادیر منابع
        const goldValue = this.advancedGUI.getControlByName("goldValue");
        const elixirValue = this.advancedGUI.getControlByName("elixirValue");
        const gemValue = this.advancedGUI.getControlByName("gemValue");
        
        if (goldValue) {
            goldValue.text = Math.floor(this.gameEngine.resources.gold).toString();
        }
        if (elixirValue) {
            elixirValue.text = Math.floor(this.gameEngine.resources.elixir).toString();
        }
        if (gemValue) {
            gemValue.text = "0"; // در صورت اضافه کردن الماس
        }
    }
    
    updateNotificationPositions() {
        // به‌روزرسانی موقعیت اعلان‌ها
        const container = this.notifications.container;
        if (!container) return;
        
        container.children.forEach((notification, index) => {
            notification.top = (index * 70) + "px";
        });
    }
}

// اضافه کردن UIManager به GameEngine
if (typeof GameEngine !== 'undefined') {
    GameEngine.prototype.initUI = function() {
        this.uiManager = new UIManager(this);
    };
    
    // گسترش متد init اصلی
    const originalInit = GameEngine.prototype.init;
    GameEngine.prototype.init = function() {
        originalInit.call(this);
        this.initUI();
    };
          }
