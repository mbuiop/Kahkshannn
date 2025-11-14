// m4.js - سیستم مدیریت بازی پیشرفته
// ===============================================

class AdvancedGameManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        
        // سیستم‌های مدیریتی پیشرفته
        this.storageManager = new AdvancedStorageManager();
        this.scoreManager = new AdvancedScoreManager();
        this.stageManager = new AdvancedStageManager();
        this.achievementManager = new AdvancedAchievementManager();
        this.economyManager = new AdvancedEconomyManager();
        this.battleManager = new AdvancedBattleManager();
        this.tribeManager = new AdvancedTribeManager();
        this.eventManager = new AdvancedEventManager();
        this.analyticsManager = new AdvancedAnalyticsManager();
        
        // وضعیت بازی
        this.gameState = {
            isPaused: false,
            isInitialized: false,
            currentDifficulty: 1,
            gameVersion: "1.0.0"
        };
        
        // آمار پیشرفته
        this.advancedStats = new Map();
        
        this.init();
    }
    
    async init() {
        try {
            await this.setupGameSystems();
            await this.loadGameData();
            await this.setupEventListeners();
            await this.startGameLoop();
            await this.setupPeriodicTasks();
            
            this.gameState.isInitialized = true;
            console.log("✅ سیستم مدیریت بازی پیشرفته راه‌اندازی شد");
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی مدیریت بازی:", error);
        }
    }
    
    async setupGameSystems() {
        // راه‌اندازی تمام سیستم‌های مدیریتی
        await this.storageManager.init();
        await this.scoreManager.init();
        await this.stageManager.init();
        await this.achievementManager.init();
        await this.economyManager.init();
        await this.battleManager.init();
        await this.tribeManager.init();
        await this.eventManager.init();
        await this.analyticsManager.init();
        
        // ایجاد رابط کاربری مدیریت
        await this.createManagementUI();
    }
    
    async createManagementUI() {
        // ایجاد پنل‌های مدیریت پیشرفته
        await this.createProgressDashboard();
        await this.createTribeManagementPanel();
        await this.createBattleStatisticsPanel();
        await this.createAchievementGallery();
        await this.createEconomyMonitor();
        await this.createEventTracker();
    }
    
    async createProgressDashboard() {
        // داشبورد پیشرفت پیشرفته
        this.progressDashboard = new BABYLON.GUI.Rectangle();
        this.progressDashboard.width = "350px";
        this.progressDashboard.height = "250px";
        this.progressDashboard.cornerRadius = 15;
        this.progressDashboard.background = "rgba(0, 0, 0, 0.95)";
        this.progressDashboard.thickness = 3;
        this.progressDashboard.color = "gold";
        this.progressDashboard.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.progressDashboard.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.progressDashboard.padding = "20px";
        this.progressDashboard.paddingTop = "100px";
        this.progressDashboard.paddingLeft = "10px";
        this.progressDashboard.isVisible = false;
        this.gameEngine.uiManager.advancedGUI.addControl(this.progressDashboard);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "داشبورد پیشرفت";
        title.color = "gold";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingBottom = "15px";
        this.progressDashboard.addControl(title);
        
        // شبکه اطلاعات
        const infoGrid = new BABYLON.GUI.Grid();
        infoGrid.width = "100%";
        infoGrid.height = "200px";
        infoGrid.addRowDefinition(0.25);
        infoGrid.addRowDefinition(0.25);
        infoGrid.addRowDefinition(0.25);
        infoGrid.addRowDefinition(0.25);
        this.progressDashboard.addControl(infoGrid);
        
        // سطح بازیکن
        const levelPanel = this.createDashboardItem("سطح بازیکن", "1", "⭐", "playerLevel");
        infoGrid.addControl(levelPanel, 0, 0);
        
        // قدرت قبیله
        const powerPanel = this.createDashboardItem("قدرت قبیله", "0", "⚡", "tribePower");
        infoGrid.addControl(powerPanel, 1, 0);
        
        // رتبه جهانی
        const rankPanel = this.createDashboardItem("رتبه جهانی", "-", "🏆", "globalRank");
        infoGrid.addControl(rankPanel, 2, 0);
        
        // زمان بازی
        const timePanel = this.createDashboardItem("زمان بازی", "00:00", "⏰", "playTime");
        infoGrid.addControl(timePanel, 3, 0);
        
        // نوار پیشرفت سطح
        this.levelProgressBar = this.createProgressBar("تجربه سطح", 0, 100, "levelProgress");
        this.levelProgressBar.top = "180px";
        this.progressDashboard.addControl(this.levelProgressBar);
    }
    
    createDashboardItem(label, value, icon, id) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "40px";
        
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.fontSize = 16;
        iconText.color = "gold";
        iconText.width = "25px";
        container.addControl(iconText);
        
        const textStack = new BABYLON.GUI.StackPanel();
        textStack.isVertical = true;
        textStack.width = "calc(100% - 30px)";
        textStack.height = "100%";
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "#cccccc";
        labelText.fontSize = 11;
        labelText.height = "15px";
        textStack.addControl(labelText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.color = "white";
        valueText.fontSize = 14;
        valueText.fontWeight = "bold";
        valueText.height = "20px";
        valueText.name = id;
        textStack.addControl(valueText);
        
        container.addControl(textStack);
        
        return container;
    }
    
    createProgressBar(label, current, max, name) {
        const container = new BABYLON.GUI.StackPanel();
        container.width = "100%";
        container.height = "40px";
        container.name = name;
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "white";
        labelText.fontSize = 12;
        labelText.height = "15px";
        container.addControl(labelText);
        
        const barBackground = new BABYLON.GUI.Rectangle();
        barBackground.width = "100%";
        barBackground.height = "12px";
        barBackground.cornerRadius = 6;
        barBackground.background = "#333333";
        barBackground.thickness = 1;
        barBackground.color = "#666666";
        
        const barProgress = new BABYLON.GUI.Rectangle();
        barProgress.width = ((current / max) * 100) + "%";
        barProgress.height = "12px";
        barProgress.cornerRadius = 6;
        barProgress.background = "linear-gradient(90deg, #ff8a00, #e52e71)";
        barProgress.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        barProgress.name = name + "Bar";
        
        barBackground.addControl(barProgress);
        container.addControl(barBackground);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = current + "/" + max;
        valueText.color = "white";
        valueText.fontSize = 10;
        valueText.height = "12px";
        valueText.paddingTop = "2px";
        container.addControl(valueText);
        
        return container;
    }
    
    async createTribeManagementPanel() {
        // پنل مدیریت قبیله
        this.tribePanel = new BABYLON.GUI.Rectangle();
        this.tribePanel.width = "400px";
        this.tribePanel.height = "500px";
        this.tribePanel.cornerRadius = 15;
        this.tribePanel.background = "rgba(0, 0, 0, 0.95)";
        this.tribePanel.thickness = 3;
        this.tribePanel.color = "#00BFFF";
        this.tribePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.tribePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.tribePanel.padding = "25px";
        this.tribePanel.isVisible = false;
        this.gameEngine.uiManager.advancedGUI.addControl(this.tribePanel);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "مدیریت قبیله";
        title.color = "#00BFFF";
        title.fontSize = 20;
        title.fontWeight = "bold";
        title.height = "30px";
        title.paddingBottom = "20px";
        this.tribePanel.addControl(title);
        
        // آمار قبیله
        const tribeStats = this.createTribeStats();
        this.tribePanel.addControl(tribeStats);
        
        // دکمه‌های مدیریت
        const managementButtons = this.createManagementButtons();
        managementButtons.top = "350px";
        this.tribePanel.addControl(managementButtons);
    }
    
    createTribeStats() {
        const container = new BABYLON.GUI.StackPanel();
        container.width = "100%";
        container.height = "300px";
        
        const stats = [
            { label: "ساختمان‌ها", value: "0", id: "tribeBuildings" },
            { label: "واحدهای نظامی", value: "0", id: "tribeUnits" },
            { label: "سطح دفاع", value: "1", id: "defenseLevel" },
            { label: "ظرفیت منابع", value: "0/0", id: "resourceCapacity" },
            { label: "حمله‌های دفع شده", value: "0", id: "defendedAttacks" },
            { label: "پیروزی‌های متوالی", value: "0", id: "winStreak" }
        ];
        
        stats.forEach(stat => {
            const statItem = this.createTribeStatItem(stat.label, stat.value, stat.id);
            container.addControl(statItem);
        });
        
        return container;
    }
    
    createTribeStatItem(label, value, id) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "40px";
        container.paddingBottom = "5px";
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "#cccccc";
        labelText.fontSize = 12;
        labelText.width = "60%";
        labelText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(labelText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.color = "white";
        valueText.fontSize = 12;
        valueText.fontWeight = "bold";
        valueText.width = "40%";
        valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        valueText.name = id;
        container.addControl(valueText);
        
        return container;
    }
    
    createManagementButtons() {
        const container = new BABYLON.GUI.Grid();
        container.width = "100%";
        container.height = "120px";
        container.addColumnDefinition(0.5);
        container.addColumnDefinition(0.5);
        container.addRowDefinition(0.5);
        container.addRowDefinition(0.5);
        
        const buttons = [
            { text: "ارتقاء قبیله", action: () => this.upgradeTribe(), row: 0, col: 0 },
            { text: "تعمیرات", action: () => this.repairBuildings(), row: 0, col: 1 },
            { text: "مدیریت منابع", action: () => this.manageResources(), row: 1, col: 0 },
            { text: "تنظیمات دفاع", action: () => this.defenseSettings(), row: 1, col: 1 }
        ];
        
        buttons.forEach(btn => {
            const button = this.createManagementButton(btn.text, btn.action);
            container.addControl(button, btn.row, btn.col);
        });
        
        return container;
    }
    
    createManagementButton(text, onClick) {
        const button = new BABYLON.GUI.Button();
        button.width = "90%";
        button.height = "50px";
        button.cornerRadius = 8;
        button.background = "rgba(0, 191, 255, 0.3)";
        button.thickness = 1;
        button.color = "#00BFFF";
        button.padding = "5px";
        
        const buttonText = new BABYLON.GUI.TextBlock();
        buttonText.text = text;
        buttonText.color = "white";
        buttonText.fontSize = 11;
        buttonText.textWrapping = true;
        button.addControl(buttonText);
        
        button.onPointerClickObservable.add(onClick);
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(0, 191, 255, 0.5)";
        });
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(0, 191, 255, 0.3)";
        });
        
        return button;
    }
    
    async createBattleStatisticsPanel() {
        // پنل آمار نبرد
        this.battleStatsPanel = new BABYLON.GUI.Rectangle();
        this.battleStatsPanel.width = "320px";
        this.battleStatsPanel.height = "400px";
        this.battleStatsPanel.cornerRadius = 15;
        this.battleStatsPanel.background = "rgba(0, 0, 0, 0.95)";
        this.battleStatsPanel.thickness = 3;
        this.battleStatsPanel.color = "#FF6B6B";
        this.battleStatsPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.battleStatsPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.battleStatsPanel.padding = "20px";
        this.battleStatsPanel.paddingBottom = "100px";
        this.battleStatsPanel.paddingLeft = "10px";
        this.battleStatsPanel.isVisible = false;
        this.gameEngine.uiManager.advancedGUI.addControl(this.battleStatsPanel);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "آمار نبرد";
        title.color = "#FF6B6B";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingBottom = "15px";
        this.battleStatsPanel.addControl(title);
        
        // آمار نبرد
        const battleStats = this.createBattleStats();
        this.battleStatsPanel.addControl(battleStats);
    }
    
    createBattleStats() {
        const container = new BABYLON.GUI.StackPanel();
        container.width = "100%";
        container.height = "350px";
        
        const stats = [
            { label: "کل نبردها", value: "0", id: "totalBattles" },
            { label: "پیروزی‌ها", value: "0", id: "battlesWon" },
            { label: "شکست‌ها", value: "0", id: "battlesLost" },
            { label: "نرخ پیروزی", value: "0%", id: "winRate" },
            { label: "واحدهای از دست رفته", value: "0", id: "unitsLost" },
            { label: "واحدهای کشته شده", value: "0", id: "unitsKilled" },
            { label: "ساختمان‌های نابود شده", value: "0", id: "buildingsDestroyed" },
            { label: "بیشترین آسیب در یک نبرد", value: "0", id: "maxDamage" }
        ];
        
        stats.forEach(stat => {
            const statItem = this.createBattleStatItem(stat.label, stat.value, stat.id);
            container.addControl(statItem);
        });
        
        return container;
    }
    
    createBattleStatItem(label, value, id) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "35px";
        container.paddingBottom = "3px";
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "#cccccc";
        labelText.fontSize = 11;
        labelText.width = "70%";
        labelText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(labelText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.color = "white";
        valueText.fontSize = 11;
        valueText.fontWeight = "bold";
        valueText.width = "30%";
        valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        valueText.name = id;
        container.addControl(valueText);
        
        return container;
    }
    
    async createAchievementGallery() {
        // گالری دستاوردها
        this.achievementGallery = new BABYLON.GUI.Rectangle();
        this.achievementGallery.width = "500px";
        this.achievementGallery.height = "600px";
        this.achievementGallery.cornerRadius = 15;
        this.achievementGallery.background = "rgba(0, 0, 0, 0.95)";
        this.achievementGallery.thickness = 3;
        this.achievementGallery.color = "#8A2BE2";
        this.achievementGallery.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.achievementGallery.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        this.achievementGallery.padding = "25px";
        this.achievementGallery.isVisible = false;
        this.gameEngine.uiManager.advancedGUI.addControl(this.achievementGallery);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "گالری دستاوردها";
        title.color = "#8A2BE2";
        title.fontSize = 22;
        title.fontWeight = "bold";
        title.height = "30px";
        title.paddingBottom = "20px";
        this.achievementGallery.addControl(title);
        
        // لیست دستاوردها
        this.achievementList = new BABYLON.GUI.ScrollViewer();
        this.achievementList.width = "100%";
        this.achievementList.height = "520px";
        this.achievementList.background = "rgba(255, 255, 255, 0.1)";
        this.achievementList.thickness = 0;
        this.achievementGallery.addControl(this.achievementList);
    }
    
    async createEconomyMonitor() {
        // مانیتور اقتصاد
        this.economyMonitor = new BABYLON.GUI.Rectangle();
        this.economyMonitor.width = "380px";
        this.economyMonitor.height = "450px";
        this.economyMonitor.cornerRadius = 15;
        this.economyMonitor.background = "rgba(0, 0, 0, 0.95)";
        this.economyMonitor.thickness = 3;
        this.economyMonitor.color = "#FFD700";
        this.economyMonitor.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.economyMonitor.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.economyMonitor.padding = "20px";
        this.economyMonitor.paddingBottom = "100px";
        this.economyMonitor.paddingRight = "10px";
        this.economyMonitor.isVisible = false;
        this.gameEngine.uiManager.advancedGUI.addControl(this.economyMonitor);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "مانیتور اقتصاد";
        title.color = "#FFD700";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingBottom = "15px";
        this.economyMonitor.addControl(title);
        
        // آمار اقتصادی
        const economyStats = this.createEconomyStats();
        this.economyMonitor.addControl(economyStats);
    }
    
    createEconomyStats() {
        const container = new BABYLON.GUI.StackPanel();
        container.width = "100%";
        container.height = "400px";
        
        const stats = [
            { label: "درآمد کل طلا", value: "0", id: "totalGoldIncome" },
            { label: "هزینه کل طلا", value: "0", id: "totalGoldSpent" },
            { label: "درآمد کل اکسیر", value: "0", id: "totalElixirIncome" },
            { label: "هزینه کل اکسیر", value: "0", id: "totalElixirSpent" },
            { label: "تولید طلا/ساعت", value: "0", id: "goldPerHour" },
            { label: "تولید اکسیر/ساعت", value: "0", id: "elixirPerHour" },
            { label: "سود خالص", value: "0", id: "netProfit" },
            { label: "کارآمدی اقتصاد", value: "0%", id: "economyEfficiency" }
        ];
        
        stats.forEach(stat => {
            const statItem = this.createEconomyStatItem(stat.label, stat.value, stat.id);
            container.addControl(statItem);
        });
        
        return container;
    }
    
    createEconomyStatItem(label, value, id) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "40px";
        container.paddingBottom = "5px";
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "#cccccc";
        labelText.fontSize = 12;
        labelText.width = "70%";
        labelText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(labelText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.color = "white";
        valueText.fontSize = 12;
        valueText.fontWeight = "bold";
        valueText.width = "30%";
        valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        valueText.name = id;
        container.addControl(valueText);
        
        return container;
    }
    
    async createEventTracker() {
        // ردیف رویدادها
        this.eventTracker = new BABYLON.GUI.Rectangle();
        this.eventTracker.width = "300px";
        this.eventTracker.height = "200px";
        this.eventTracker.cornerRadius = 15;
        this.eventTracker.background = "rgba(0, 0, 0, 0.9)";
        this.eventTracker.thickness = 2;
        this.eventTracker.color = "#32CD32";
        this.eventTracker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this.eventTracker.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.eventTracker.padding = "15px";
        this.eventTracker.paddingTop = "300px";
        this.eventTracker.paddingRight = "10px";
        this.eventTracker.isVisible = false;
        this.gameEngine.uiManager.advancedGUI.addControl(this.eventTracker);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "رویدادهای فعال";
        title.color = "#32CD32";
        title.fontSize = 16;
        title.fontWeight = "bold";
        title.height = "20px";
        title.paddingBottom = "10px";
        this.eventTracker.addControl(title);
        
        this.eventList = new BABYLON.GUI.StackPanel();
        this.eventList.width = "100%";
        this.eventList.height = "150px";
        this.eventTracker.addControl(this.eventList);
    }
    
    async loadGameData() {
        try {
            const savedData = await this.storageManager.loadGameData();
            
            if (savedData) {
                await this.applySavedData(savedData);
                console.log("✅ داده‌های بازی با موفقیت بارگذاری شد");
            } else {
                await this.initializeNewGame();
                console.log("🎮 بازی جدید شروع شد");
            }
        } catch (error) {
            console.error("❌ خطا در بارگذاری داده‌های بازی:", error);
            await this.initializeNewGame();
        }
    }
    
    async applySavedData(data) {
        // اعمال داده‌های ذخیره‌شده
        await this.scoreManager.loadData(data.scores);
        await this.stageManager.loadData(data.stages);
        await this.achievementManager.loadData(data.achievements);
        await this.economyManager.loadData(data.economy);
        await this.battleManager.loadData(data.battles);
        await this.tribeManager.loadData(data.tribe);
        
        // بازیابی منابع
        this.gameEngine.resources = data.resources || {
            gold: 5000,
            elixir: 3000,
            goldCapacity: 10000,
            elixirCapacity: 8000
        };
        
        // بازیابی ساختمان‌ها
        if (data.buildings) {
            // ساختمان‌ها در موتور اصلی ایجاد می‌شوند
        }
        
        // بازیابی وضعیت بازی
        if (data.gameState) {
            this.gameState = { ...this.gameState, ...data.gameState };
        }
        
        // به‌روزرسانی رابط کاربری
        this.updateAllUI();
    }
    
    async initializeNewGame() {
        // مقداردهی اولیه بازی جدید
        await this.scoreManager.initialize();
        await this.stageManager.initialize();
        await this.achievementManager.initialize();
        await this.economyManager.initialize();
        await this.battleManager.initialize();
        await this.tribeManager.initialize();
        
        // شروع آموزش
        await this.startTutorial();
        
        // ثبت رویداد شروع بازی
        this.analyticsManager.trackGameStart();
    }
    
    async startTutorial() {
        // سیستم آموزش پیشرفته
        console.log("📚 شروع آموزش بازی...");
        
        // نمایش راهنمای اولیه
        this.showTutorialMessage("به جنگ قبیله‌ای خوش آمدید! اولین ساختمان خود را بسازید.");
        
        // فعال کردن حالت آموزش
        this.gameState.isInTutorial = true;
    }
    
    async setupEventListeners() {
        // رویدادهای پیشرفته بازی
        await this.setupBuildingEventListeners();
        await this.setupUnitEventListeners();
        await this.setupBattleEventListeners();
        await this.setupEconomyEventListeners();
        await this.setupSystemEventListeners();
    }
    
    async setupBuildingEventListeners() {
        this.gameEngine.onBuildingBuilt = (building) => {
            this.scoreManager.addScore('buildings_built', 1);
            this.achievementManager.checkBuildingAchievements(building);
            this.stageManager.checkStageProgress();
            this.tribeManager.updateTribeStats();
            this.analyticsManager.trackBuildingBuilt(building);
        };
        
        this.gameEngine.onBuildingUpgraded = (building) => {
            this.scoreManager.addScore('buildings_upgraded', 1);
            this.achievementManager.checkUpgradeAchievements(building);
            this.economyManager.updateProductionRates();
            this.tribeManager.updateTribePower();
        };
        
        this.gameEngine.onBuildingDestroyed = (building) => {
            this.scoreManager.addScore('buildings_destroyed', 1);
            this.battleManager.recordBuildingLoss(building);
            this.analyticsManager.trackBuildingDestroyed(building);
        };
    }
    
    async setupUnitEventListeners() {
        this.gameEngine.onUnitTrained = (unit) => {
            this.scoreManager.addScore('units_trained', 1);
            this.achievementManager.checkUnitAchievements(unit);
            this.tribeManager.updateMilitaryPower();
            this.analyticsManager.trackUnitTrained(unit);
        };
        
        this.gameEngine.onUnitKilled = (unit) => {
            this.scoreManager.addScore('units_killed', 1);
            this.battleManager.recordUnitKill(unit);
            this.analyticsManager.trackUnitKilled(unit);
        };
    }
    
    async setupBattleEventListeners() {
        this.gameEngine.onBattleStarted = (battle) => {
            this.scoreManager.addScore('battles_started', 1);
            this.battleManager.startBattle(battle);
            this.analyticsManager.trackBattleStarted(battle);
        };
        
        this.gameEngine.onBattleWon = (battle) => {
            this.scoreManager.addScore('battles_won', 1);
            this.scoreManager.addScore('battle_points', battle.points);
            this.achievementManager.checkBattleAchievements(battle);
            this.stageManager.checkStageProgress();
            this.battleManager.recordVictory(battle);
            this.analyticsManager.trackBattleWon(battle);
        };
        
        this.gameEngine.onBattleLost = (battle) => {
            this.scoreManager.addScore('battles_lost', 1);
            this.battleManager.recordDefeat(battle);
            this.analyticsManager.trackBattleLost(battle);
        };
        
        this.gameEngine.onAttackDefended = (attack) => {
            this.battleManager.recordDefendedAttack(attack);
            this.achievementManager.checkDefenseAchievements(attack);
        };
    }
    
    async setupEconomyEventListeners() {
        this.gameEngine.onResourceCollected = (type, amount) => {
            this.scoreManager.addScore('resources_collected', amount);
            this.scoreManager.addResource(type, amount);
            this.achievementManager.checkResourceAchievements(type, amount);
            this.economyManager.recordIncome(type, amount);
            this.analyticsManager.trackResourceCollection(type, amount);
        };
        
        this.gameEngine.onResourceSpent = (type, amount) => {
            this.scoreManager.addResourceSpent(type, amount);
            this.economyManager.recordExpense(type, amount);
            this.analyticsManager.trackResourceSpending(type, amount);
        };
    }
    
    async setupSystemEventListeners() {
        // رویدادهای سیستم
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onGamePaused();
            } else {
                this.onGameResumed();
            }
        });
    }
    
    async startGameLoop() {
        // شروع حلقه مدیریت بازی
        this.scene.onBeforeRenderObservable.add(() => {
            if (!this.gameState.isPaused) {
                this.update();
            }
        });
    }
    
    async setupPeriodicTasks() {
        // وظایف دوره‌ای
        setInterval(() => {
            this.performPeriodicTasks();
        }, 60000); // هر دقیقه
        
        // ذخیره‌سازی خودکار
        setInterval(() => {
            this.saveGame();
        }, 300000); // هر 5 دقیقه
    }
    
    update() {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        
        // به‌روزرسانی تمام سیستم‌های مدیریتی
        this.scoreManager.update(deltaTime);
        this.stageManager.update(deltaTime);
        this.achievementManager.update(deltaTime);
        this.economyManager.update(deltaTime);
        this.battleManager.update(deltaTime);
        this.tribeManager.update(deltaTime);
        this.eventManager.update(deltaTime);
        this.analyticsManager.update(deltaTime);
        
        // به‌روزرسانی رابط کاربری
        this.updateAllUI();
        
        // بررسی رویدادهای دوره‌ای
        this.checkPeriodicEvents();
    }
    
    updateAllUI() {
        this.updateProgressDashboard();
        this.updateTribePanel();
        this.updateBattleStats();
        this.updateEconomyMonitor();
        this.updateEventTracker();
        this.updateAchievementGallery();
    }
    
    updateProgressDashboard() {
        if (!this.progressDashboard.isVisible) return;
        
        const scores = this.scoreManager.getScores();
        const tribePower = this.tribeManager.getTribePower();
        
        // به‌روزرسانی مقادیر
        this.updateUIValue("playerLevel", scores.level.toString());
        this.updateUIValue("tribePower", tribePower.toString());
        this.updateUIValue("globalRank", this.scoreManager.getGlobalRank());
        this.updateUIValue("playTime", this.formatPlayTime(scores.totalPlayTime));
        
        // نوار پیشرفت سطح
        const xpInfo = this.scoreManager.getXPInfo();
        const progressBar = this.progressDashboard.getControlByName("levelProgressBar");
        if (progressBar) {
            progressBar.width = ((xpInfo.current / xpInfo.max) * 100) + "%";
        }
    }
    
    updateTribePanel() {
        if (!this.tribePanel.isVisible) return;
        
        const tribeStats = this.tribeManager.getTribeStats();
        
        Object.keys(tribeStats).forEach(statId => {
            this.updateUIValue(statId, tribeStats[statId]);
        });
    }
    
    updateBattleStats() {
        if (!this.battleStatsPanel.isVisible) return;
        
        const battleStats = this.battleManager.getBattleStats();
        
        Object.keys(battleStats).forEach(statId => {
            this.updateUIValue(statId, battleStats[statId]);
        });
    }
    
    updateEconomyMonitor() {
        if (!this.economyMonitor.isVisible) return;
        
        const economyStats = this.economyManager.getEconomyStats();
        
        Object.keys(economyStats).forEach(statId => {
            this.updateUIValue(statId, economyStats[statId]);
        });
    }
    
    updateEventTracker() {
        if (!this.eventTracker.isVisible) return;
        
        const activeEvents = this.eventManager.getActiveEvents();
        
        // پاک کردن لیست قبلی
        this.eventList.children.forEach(child => child.dispose());
        this.eventList.children = [];
        
        // اضافه کردن رویدادهای جدید
        activeEvents.forEach(event => {
            const eventItem = this.createEventItem(event);
            this.eventList.addControl(eventItem);
        });
    }
    
    updateAchievementGallery() {
        if (!this.achievementGallery.isVisible) return;
        
        const achievements = this.achievementManager.getAchievements();
        
        // پاک کردن لیست قبلی
        this.achievementList.children.forEach(child => child.dispose());
        this.achievementList.children = [];
        
        // اضافه کردن دستاوردها
        achievements.forEach(achievement => {
            const achievementItem = this.createAchievementItem(achievement);
            this.achievementList.addControl(achievementItem);
        });
    }
    
    createEventItem(event) {
        const container = new BABYLON.GUI.Rectangle();
        container.width = "100%";
        container.height = "40px";
        container.cornerRadius = 5;
        container.background = event.background || "rgba(50, 205, 50, 0.3)";
        container.thickness = 1;
        container.color = event.color || "#32CD32";
        container.padding = "5px";
        container.marginBottom = "2px";
        
        const stack = new BABYLON.GUI.StackPanel();
        stack.isVertical = false;
        stack.width = "100%";
        stack.height = "100%";
        
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = event.icon || "⚡";
        icon.fontSize = 14;
        icon.color = "white";
        icon.width = "20px";
        stack.addControl(icon);
        
        const text = new BABYLON.GUI.TextBlock();
        text.text = event.name;
        text.color = "white";
        text.fontSize = 10;
        text.textWrapping = true;
        text.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        text.paddingLeft = "5px";
        stack.addControl(text);
        
        const time = new BABYLON.GUI.TextBlock();
        time.text = event.remainingTime || "";
        time.color = "#cccccc";
        time.fontSize = 8;
        time.width = "30px";
        time.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        stack.addControl(time);
        
        container.addControl(stack);
        return container;
    }
    
    createAchievementItem(achievement) {
        const container = new BABYLON.GUI.Rectangle();
        container.width = "100%";
        container.height = "70px";
        container.cornerRadius = 8;
        container.background = achievement.unlocked ? 
            "rgba(138, 43, 226, 0.3)" : "rgba(255, 255, 255, 0.1)";
        container.thickness = 2;
        container.color = achievement.unlocked ? "#8A2BE2" : "#666666";
        container.padding = "8px";
        container.marginBottom = "5px";
        
        const grid = new BABYLON.GUI.Grid();
        grid.width = "100%";
        grid.height = "100%";
        grid.addColumnDefinition(0.15); // آیکون
        grid.addColumnDefinition(0.65); // اطلاعات
        grid.addColumnDefinition(0.2);  // پاداش
        
        // آیکون
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = achievement.icon;
        icon.fontSize = 20;
        icon.color = achievement.unlocked ? "#8A2BE2" : "#666666";
        grid.addControl(icon, 0, 0);
        
        // اطلاعات
        const infoStack = new BABYLON.GUI.StackPanel();
        infoStack.isVertical = true;
        infoStack.width = "100%";
        infoStack.height = "100%";
        
        const name = new BABYLON.GUI.TextBlock();
        name.text = achievement.name;
        name.color = "white";
        name.fontSize = 12;
        name.fontWeight = "bold";
        name.height = "20px";
        infoStack.addControl(name);
        
        const description = new BABYLON.GUI.TextBlock();
        description.text = achievement.description;
        description.color = "#cccccc";
        description.fontSize = 10;
        description.height = "15px";
        description.textWrapping = true;
        infoStack.addControl(description);
        
        const progress = new BABYLON.GUI.TextBlock();
        progress.text = achievement.progressText || "";
        progress.color = "gold";
        progress.fontSize = 9;
        progress.height = "12px";
        infoStack.addControl(progress);
        
        grid.addControl(infoStack, 0, 1);
        
        // پاداش
        const reward = new BABYLON.GUI.TextBlock();
        reward.text = achievement.unlocked ? "✅" : `+${achievement.reward}`;
        reward.color = achievement.unlocked ? "#32CD32" : "gold";
        reward.fontSize = 12;
        reward.fontWeight = "bold";
        grid.addControl(reward, 0, 2);
        
        container.addControl(grid);
        return container;
    }
    
    updateUIValue(elementName, value) {
        const element = this.gameEngine.uiManager.advancedGUI.getControlByName(elementName);
        if (element) {
            element.text = value;
        }
    }
    
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    performPeriodicTasks() {
        // وظایف دوره‌ای
        this.economyManager.calculateHourlyRates();
        this.eventManager.checkTimedEvents();
        this.analyticsManager.sendPeriodicData();
        this.storageManager.cleanOldData();
    }
    
    checkPeriodicEvents() {
        // بررسی رویدادهای دوره‌ای
        const currentTime = Date.now();
        
        // هر 5 دقیقه حمله دشمن
        if (currentTime - this.battleManager.lastAttackTime > 300000) {
            this.battleManager.scheduleAIAttack();
        }
        
        // هر ساعت رویداد ویژه
        if (currentTime - this.eventManager.lastSpecialEvent > 3600000) {
            this.eventManager.triggerSpecialEvent();
        }
    }
    
    async saveGame() {
        try {
            const gameData = {
                resources: this.gameEngine.resources,
                buildings: this.gameEngine.tribeLayout,
                units: this.gameEngine.units,
                scores: this.scoreManager.getSaveData(),
                stages: this.stageManager.getSaveData(),
                achievements: this.achievementManager.getSaveData(),
                economy: this.economyManager.getSaveData(),
                battles: this.battleManager.getSaveData(),
                tribe: this.tribeManager.getSaveData(),
                gameState: this.gameState,
                timestamp: Date.now(),
                version: this.gameState.gameVersion
            };
            
            await this.storageManager.saveGameData(gameData);
            console.log("💾 بازی ذخیره شد");
        } catch (error) {
            console.error("❌ خطا در ذخیره‌سازی بازی:", error);
        }
    }
    
    // متدهای مدیریت بازی
    showProgressDashboard() {
        this.hideAllPanels();
        this.progressDashboard.isVisible = true;
    }
    
    showTribeManagement() {
        this.hideAllPanels();
        this.tribePanel.isVisible = true;
    }
    
    showBattleStatistics() {
        this.hideAllPanels();
        this.battleStatsPanel.isVisible = true;
    }
    
    showAchievementGallery() {
        this.hideAllPanels();
        this.achievementGallery.isVisible = true;
    }
    
    showEconomyMonitor() {
        this.hideAllPanels();
        this.economyMonitor.isVisible = true;
    }
    
    showEventTracker() {
        this.hideAllPanels();
        this.eventTracker.isVisible = true;
    }
    
    hideAllPanels() {
        const panels = [
            this.progressDashboard,
            this.tribePanel,
            this.battleStatsPanel,
            this.achievementGallery,
            this.economyMonitor,
            this.eventTracker
        ];
        
        panels.forEach(panel => {
            if (panel) panel.isVisible = false;
        });
    }
    
    // متدهای مدیریت وضعیت بازی
    pauseGame() {
        this.gameState.isPaused = true;
        this.gameEngine.engine.stopRenderLoop();
        this.showNotification("بازی متوقف شد", "info");
    }
    
    resumeGame() {
        this.gameState.isPaused = false;
        this.gameEngine.engine.runRenderLoop(() => {
            this.gameEngine.update();
            this.scene.render();
        });
        this.showNotification("بازی ادامه یافت", "info");
    }
    
    resetGame() {
        if (confirm("آیا از بازنشانی بازی اطمینان دارید؟ تمام پیشرفت‌های شما از بین خواهد رفت.")) {
            this.storageManager.clearGameData();
            location.reload();
        }
    }
    
    // متدهای مدیریت قبیله
    async upgradeTribe() {
        const cost = this.tribeManager.getUpgradeCost();
        
        if (this.gameEngine.hasEnoughResources(cost)) {
            this.gameEngine.deductResources(cost);
            await this.tribeManager.upgradeTribe();
            this.showNotification("قبیله ارتقاء یافت!", "success");
        } else {
            this.showNotification("منابع کافی برای ارتقاء قبیله ندارید!", "error");
        }
    }
    
    async repairBuildings() {
        const damagedBuildings = this.tribeManager.getDamagedBuildings();
        
        if (damagedBuildings.length > 0) {
            const repairCost = this.tribeManager.getRepairCost(damagedBuildings);
            
            if (this.gameEngine.hasEnoughResources(repairCost)) {
                this.gameEngine.deductResources(repairCost);
                await this.tribeManager.repairBuildings(damagedBuildings);
                this.showNotification("ساختمان‌ها تعمیر شدند!", "success");
            } else {
                this.showNotification("منابع کافی برای تعمیرات ندارید!", "error");
            }
        } else {
            this.showNotification("هیچ ساختمان آسیب‌دیده‌ای وجود ندارد", "info");
        }
    }
    
    async manageResources() {
        this.showNotification("مدیریت منابع در دست توسعه", "info");
    }
    
    async defenseSettings() {
        this.showNotification("تنظیمات دفاع در دست توسعه", "info");
    }
    
    // متدهای کمکی
    showNotification(message, type = "info") {
        this.gameEngine.showNotification(message, type);
    }
    
    showTutorialMessage(message) {
        this.showNotification(`📚 ${message}`, "info");
    }
    
    onGamePaused() {
        if (!this.gameState.isPaused) {
            this.pauseGame();
        }
    }
    
    onGameResumed() {
        if (this.gameState.isPaused) {
            this.resumeGame();
        }
    }
    
    getGameReport() {
        return {
            scores: this.scoreManager.getScores(),
            tribe: this.tribeManager.getTribeStats(),
            economy: this.economyManager.getEconomyStats(),
            battles: this.battleManager.getBattleStats(),
            achievements: this.achievementManager.getAchievements()
        };
    }
}

// سیستم مدیریت ذخیره‌سازی پیشرفته
class AdvancedStorageManager {
    constructor() {
        this.storageKey = "advanced_clash_game_save";
        this.backupKey = "advanced_clash_game_backup";
        this.version = "1.0.0";
    }
    
    async init() {
        console.log("✅ سیستم ذخیره‌سازی پیشرفته راه‌اندازی شد");
    }
    
    async saveGameData(data) {
        try {
            const compressedData = this.compressData(data);
            localStorage.setItem(this.storageKey, compressedData);
            
            // ایجاد پشتیبان
            await this.createBackup(data);
            
            return true;
        } catch (error) {
            console.error("❌ خطا در ذخیره‌سازی:", error);
            return false;
        }
    }
    
    async loadGameData() {
        try {
            let savedData = localStorage.getItem(this.storageKey);
            
            if (savedData) {
                return this.decompressData(savedData);
            }
            
            // تلاش برای بارگذاری از پشتیبان
            return await this.loadFromBackup();
        } catch (error) {
            console.error("❌ خطا در بارگذاری:", error);
            return null;
        }
    }
    
    async createBackup(data) {
        try {
            const backupData = {
                ...data,
                backupTimestamp: Date.now()
            };
            
            const compressedBackup = this.compressData(backupData);
            localStorage.setItem(this.backupKey, compressedBackup);
        } catch (error) {
            console.error("❌ خطا در ایجاد پشتیبان:", error);
        }
    }
    
    async loadFromBackup() {
        try {
            const backupData = localStorage.getItem(this.backupKey);
            if (backupData) {
                console.log("🔄 بارگذاری از پشتیبان...");
                return this.decompressData(backupData);
            }
        } catch (error) {
            console.error("❌ خطا در بارگذاری پشتیبان:", error);
        }
        return null;
    }
    
    async clearGameData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            return true;
        } catch (error) {
            console.error("❌ خطا در پاک کردن داده‌ها:", error);
            return false;
        }
    }
    
    compressData(data) {
        // فشرده‌سازی پیشرفته داده‌ها
        return JSON.stringify({
            data: data,
            version: this.version,
            timestamp: Date.now()
        });
    }
    
    decompressData(data) {
        const parsed = JSON.parse(data);
        
        // بررسی نسخه
        if (parsed.version !== this.version) {
            console.warn("⚠️ نسخه داده‌ها متفاوت است");
        }
        
        return parsed.data;
    }
    
    async cleanOldData() {
        // پاک کردن داده‌های قدیمی
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        try {
            const backupData = localStorage.getItem(this.backupKey);
            if (backupData) {
                const parsed = JSON.parse(backupData);
                if (parsed.timestamp < oneWeekAgo) {
                    localStorage.removeItem(this.backupKey);
                }
            }
        } catch (error) {
            console.error("❌ خطا در پاک کردن داده‌های قدیمی:", error);
        }
    }
}

// سیستم امتیاز و رتبه‌بندی پیشرفته
class AdvancedScoreManager {
    constructor() {
        this.scores = new Map();
        this.resources = new Map();
        this.level = 1;
        this.experience = 0;
        this.totalPlayTime = 0;
        this.startTime = Date.now();
    }
    
    async init() {
        this.initializeDefaultScores();
    }
    
    initializeDefaultScores() {
        // امتیازهای پایه پیشرفته
        const scoreTypes = [
            'buildings_built', 'buildings_upgraded', 'buildings_destroyed',
            'units_trained', 'units_killed', 'units_lost',
            'resources_collected', 'resources_spent',
            'battles_started', 'battles_won', 'battles_lost',
            'battle_points', 'achievement_points',
            'defended_attacks', 'perfect_victories'
        ];
        
        scoreTypes.forEach(type => {
            this.scores.set(type, 0);
        });
        
        // منابع
        const resourceTypes = [
            'gold_collected', 'elixir_collected',
            'gold_spent', 'elixir_spent',
            'total_collected', 'total_spent'
        ];
        
        resourceTypes.forEach(type => {
            this.resources.set(type, 0);
        });
    }
    
    addScore(type, amount = 1) {
        const current = this.scores.get(type) || 0;
        this.scores.set(type, current + amount);
        
        // اضافه کردن تجربه
        if (this.shouldGiveXP(type)) {
            this.addExperience(amount * this.getXPMultiplier(type));
        }
    }
    
    addResource(type, amount) {
        const current = this.resources.get(type) || 0;
        this.resources.set(type, current + amount);
    }
    
    addResourceSpent(type, amount) {
        const spentType = type + '_spent';
        const current = this.resources.get(spentType) || 0;
        this.resources.set(spentType, current + amount);
    }
    
    shouldGiveXP(type) {
        const xpTypes = [
            'buildings_built', 'buildings_upgraded', 'battles_won',
            'resources_collected', 'units_trained', 'defended_attacks'
        ];
        return xpTypes.includes(type);
    }
    
    getXPMultiplier(type) {
        const multipliers = {
            'buildings_built': 10,
            'buildings_upgraded': 25,
            'battles_won': 50,
            'resources_collected': 1,
            'units_trained': 5,
            'defended_attacks': 30
        };
        return multipliers[type] || 1;
    }
    
    addExperience(amount) {
        this.experience += amount;
        
        while (this.experience >= this.getRequiredXP()) {
            this.experience -= this.getRequiredXP();
            this.levelUp();
        }
    }
    
    getRequiredXP() {
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }
    
    levelUp() {
        this.level++;
        
        // پاداش سطح
        const rewards = {
            gold: this.level * 200,
            elixir: this.level * 100
        };
        
        // اطلاع‌رسانی
        if (window.gameEngine) {
            window.gameEngine.addResources(rewards);
            window.gameEngine.showNotification(
                `🎉 سطح ${this.level}!
                 پاداش: ${rewards.gold} طلا و ${rewards.elixir} اکسیر`,
                "success"
            );
        }
    }
    
    getScores() {
        return {
            level: this.level,
            experience: this.experience,
            totalPlayTime: this.totalPlayTime + (Date.now() - this.startTime),
            totalScore: this.getTotalScore()
        };
    }
    
    getTotalScore() {
        let total = 0;
        this.scores.forEach(score => {
            total += score;
        });
        return total;
    }
    
    getGlobalRank() {
        // شبیه‌سازی رتبه جهانی
        const baseRank = 1000000;
        const score = this.getTotalScore();
        return Math.max(1, baseRank - Math.floor(score / 100)).toLocaleString();
    }
    
    getXPInfo() {
        return {
            current: this.experience,
            max: this.getRequiredXP(),
            level: this.level
        };
    }
    
    getSaveData() {
        return {
            scores: Object.fromEntries(this.scores),
            resources: Object.fromEntries(this.resources),
            level: this.level,
            experience: this.experience,
            totalPlayTime: this.totalPlayTime + (Date.now() - this.startTime)
        };
    }
    
    async loadData(data) {
        if (data.scores) {
            this.scores = new Map(Object.entries(data.scores));
        }
        if (data.resources) {
            this.resources = new Map(Object.entries(data.resources));
        }
        this.level = data.level || 1;
        this.experience = data.experience || 0;
        this.totalPlayTime = data.totalPlayTime || 0;
        this.startTime = Date.now();
    }
    
    update(deltaTime) {
        this.totalPlayTime += deltaTime;
    }
}

// سیستم‌های دیگر (پیاده‌سازی خلاصه)
class AdvancedStageManager {
    async init() { console.log("✅ سیستم مرحله‌بندی راه‌اندازی شد"); }
    async loadData() { }
    async checkStageProgress() { }
    getSaveData() { return {}; }
}

class AdvancedAchievementManager {
    async init() { console.log("✅ سیستم دستاوردها راه‌اندازی شد"); }
    async loadData() { }
    checkBuildingAchievements() { }
    checkBattleAchievements() { }
    getAchievements() { return []; }
    getSaveData() { return {}; }
}

class AdvancedEconomyManager {
    async init() { console.log("✅ سیستم اقتصاد راه‌اندازی شد"); }
    async loadData() { }
    recordIncome() { }
    recordExpense() { }
    updateProductionRates() { }
    getEconomyStats() { return {}; }
    getSaveData() { return {}; }
}

class AdvancedBattleManager {
    async init() { console.log("✅ سیستم نبرد راه‌اندازی شد"); }
    async loadData() { }
    startBattle() { }
    recordVictory() { }
    recordDefeat() { }
    scheduleAIAttack() { }
    getBattleStats() { return {}; }
    getSaveData() { return {}; }
}

class AdvancedTribeManager {
    async init() { console.log("✅ سیستم قبیله راه‌اندازی شد"); }
    async loadData() { }
    updateTribeStats() { }
    updateTribePower() { }
    updateMilitaryPower() { }
    getTribeStats() { return {}; }
    getTribePower() { return 0; }
    getSaveData() { return {}; }
}

class AdvancedEventManager {
    async init() { console.log("✅ سیستم رویدادها راه‌اندازی شد"); }
    getActiveEvents() { return []; }
    triggerSpecialEvent() { }
    checkTimedEvents() { }
}

class AdvancedAnalyticsManager {
    async init() { console.log("✅ سیستم آمار راه‌اندازی شد"); }
    trackGameStart() { }
    trackBuildingBuilt() { }
    trackBattleStarted() { }
    sendPeriodicData() { }
}

// اضافه کردن AdvancedGameManager به AdvancedGameEngine
if (typeof AdvancedGameEngine !== 'undefined') {
    AdvancedGameEngine.prototype.initGameManager = function() {
        this.gameManager = new AdvancedGameManager(this);
    };
    
    const originalInit = AdvancedGameEngine.prototype.init;
    AdvancedGameEngine.prototype.init = async function() {
        await originalInit.call(this);
        await this.initGameManager();
    };
}

console.log("🚀 فایل m4.js - مدیریت بازی پیشرفته بارگذاری شد");
