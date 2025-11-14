// m4.js - سیستم مرحله، امتیاز و مدیریت بازی
// ===============================================

class GameManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scene = gameEngine.scene;
        
        // سیستم ذخیره‌سازی و بازیابی
        this.storageManager = new StorageManager();
        
        // سیستم امتیاز و رتبه‌بندی
        this.scoreManager = new ScoreManager();
        
        // سیستم مرحله و پیشرفت
        this.stageManager = new StageManager();
        
        // سیستم دستاوردها
        this.achievementManager = new AchievementManager();
        
        // سیستم رویدادهای ویژه
        this.eventManager = new EventManager();
        
        // سیستم اقتصاد و تعادل بازی
        this.economyManager = new EconomyManager();
        
        // سیستم قبیله و چندنفره
        this.clanManager = new ClanManager();
        
        // سیستم نبرد و PvP
        this.battleManager = new BattleManager();
        
        // سیستم آموزش و راهنمایی
        this.tutorialManager = new TutorialManager();
        
        // سیستم آمار و گزارش‌گیری
        this.analyticsManager = new AnalyticsManager();
        
        this.init();
    }
    
    init() {
        this.setupGameSystems();
        this.loadGameData();
        this.setupEventListeners();
        this.startGameLoop();
        
        console.log("سیستم مدیریت بازی با موفقیت راه‌اندازی شد");
    }
    
    setupGameSystems() {
        // راه‌اندازی تمام سیستم‌های مدیریتی
        this.storageManager.init();
        this.scoreManager.init();
        this.stageManager.init();
        this.achievementManager.init();
        this.eventManager.init();
        this.economyManager.init();
        this.clanManager.init();
        this.battleManager.init();
        this.tutorialManager.init();
        this.analyticsManager.init();
        
        // ایجاد رابط کاربری مدیریت
        this.createManagementUI();
    }
    
    createManagementUI() {
        // ایجاد پنل مدیریت پیشرفت
        this.createProgressPanel();
        
        // ایجاد پنل دستاوردها
        this.createAchievementPanel();
        
        // ایجاد پنل آمار
        this.createStatsPanel();
        
        // ایجاد پنل قبیله
        this.createClanPanel();
        
        // ایجاد پنل نبرد
        this.createBattlePanel();
    }
    
    createProgressPanel() {
        const progressPanel = new BABYLON.GUI.Rectangle();
        progressPanel.width = "300px";
        progressPanel.height = "200px";
        progressPanel.cornerRadius = 15;
        progressPanel.background = "rgba(0, 0, 0, 0.9)";
        progressPanel.thickness = 3;
        progressPanel.color = "gold";
        progressPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        progressPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        progressPanel.padding = "15px";
        progressPanel.paddingTop = "100px";
        progressPanel.paddingLeft = "10px";
        progressPanel.isVisible = false;
        progressPanel.name = "progressPanel";
        this.gameEngine.uiManager.advancedGUI.addControl(progressPanel);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "پیشرفت بازی";
        title.color = "gold";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingBottom = "10px";
        progressPanel.addControl(title);
        
        const levelInfo = new BABYLON.GUI.TextBlock();
        levelInfo.text = "سطح: 1";
        levelInfo.color = "white";
        levelInfo.fontSize = 14;
        levelInfo.height = "20px";
        levelInfo.name = "levelInfo";
        progressPanel.addControl(levelInfo);
        
        const xpBar = this.createProgressBar("نوار تجربه", 0, 100, "xpBar");
        xpBar.top = "50px";
        progressPanel.addControl(xpBar);
        
        const stageInfo = new BABYLON.GUI.TextBlock();
        stageInfo.text = "مرحله: 1/10";
        stageInfo.color = "white";
        stageInfo.fontSize = 12;
        stageInfo.height = "15px";
        stageInfo.top = "80px";
        stageInfo.name = "stageInfo";
        progressPanel.addControl(stageInfo);
        
        this.uiElements = {
            progressPanel: progressPanel,
            levelInfo: levelInfo,
            xpBar: xpBar,
            stageInfo: stageInfo
        };
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
        barBackground.height = "15px";
        barBackground.background = "#333333";
        barBackground.cornerRadius = 7;
        barBackground.thickness = 1;
        barBackground.color = "#666666";
        
        const barProgress = new BABYLON.GUI.Rectangle();
        barProgress.width = ((current / max) * 100) + "%";
        barProgress.height = "15px";
        barProgress.cornerRadius = 7;
        barProgress.background = "linear-gradient(90deg, #ff8a00, #e52e71)";
        barProgress.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        barProgress.name = name + "Progress";
        
        barBackground.addControl(barProgress);
        container.addControl(barBackground);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = current + "/" + max;
        valueText.color = "white";
        valueText.fontSize = 10;
        valueText.height = "10px";
        valueText.paddingTop = "2px";
        container.addControl(valueText);
        
        return container;
    }
    
    createAchievementPanel() {
        const achievementPanel = new BABYLON.GUI.Rectangle();
        achievementPanel.width = "350px";
        achievementPanel.height = "400px";
        achievementPanel.cornerRadius = 15;
        achievementPanel.background = "rgba(0, 0, 0, 0.95)";
        achievementPanel.thickness = 3;
        achievementPanel.color = "#8A2BE2";
        achievementPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        achievementPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        achievementPanel.padding = "20px";
        achievementPanel.paddingTop = "100px";
        achievementPanel.paddingRight = "10px";
        achievementPanel.isVisible = false;
        achievementPanel.name = "achievementPanel";
        this.gameEngine.uiManager.advancedGUI.addControl(achievementPanel);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "دستاوردها";
        title.color = "#8A2BE2";
        title.fontSize = 20;
        title.fontWeight = "bold";
        title.height = "30px";
        title.paddingBottom = "15px";
        achievementPanel.addControl(title);
        
        const achievementList = new BABYLON.GUI.StackPanel();
        achievementList.width = "100%";
        achievementList.height = "340px";
        achievementList.background = "rgba(255, 255, 255, 0.1)";
        achievementList.padding = "10px";
        achievementList.name = "achievementList";
        achievementPanel.addControl(achievementList);
        
        this.uiElements.achievementPanel = achievementPanel;
        this.uiElements.achievementList = achievementList;
    }
    
    createStatsPanel() {
        const statsPanel = new BABYLON.GUI.Rectangle();
        statsPanel.width = "280px";
        statsPanel.height = "300px";
        statsPanel.cornerRadius = 15;
        statsPanel.background = "rgba(0, 0, 0, 0.9)";
        statsPanel.thickness = 3;
        statsPanel.color = "#00BFFF";
        statsPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        statsPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        statsPanel.padding = "15px";
        statsPanel.paddingBottom = "100px";
        statsPanel.paddingLeft = "10px";
        statsPanel.isVisible = false;
        statsPanel.name = "statsPanel";
        this.gameEngine.uiManager.advancedGUI.addControl(statsPanel);
        
        const title = new BABYLON.GUI.TextBlock();
        title.text = "آمار بازی";
        title.color = "#00BFFF";
        title.fontSize = 18;
        title.fontWeight = "bold";
        title.height = "25px";
        title.paddingBottom = "10px";
        statsPanel.addControl(title);
        
        const statsGrid = new BABYLON.GUI.Grid();
        statsGrid.width = "100%";
        statsGrid.height = "250px";
        statsGrid.addRowDefinition(0.2);
        statsGrid.addRowDefinition(0.2);
        statsGrid.addRowDefinition(0.2);
        statsGrid.addRowDefinition(0.2);
        statsGrid.addRowDefinition(0.2);
        
        const stats = [
            { label: "زمان بازی", value: "00:00:00", id: "playTime" },
            { label: "ساختمان‌ها ساخته‌شده", value: "0", id: "buildingsBuilt" },
            { label: "سربازان آموزش‌دیده", value: "0", id: "unitsTrained" },
            { label: "نبردهای انجام‌شده", value: "0", id: "battlesFought" },
            { label: "منابع جمع‌آوری‌شده", value: "0", id: "resourcesCollected" }
        ];
        
        stats.forEach((stat, index) => {
            const statItem = this.createStatItem(stat.label, stat.value, stat.id);
            statsGrid.addControl(statItem, index, 0);
        });
        
        statsPanel.addControl(statsGrid);
        this.uiElements.statsPanel = statsPanel;
    }
    
    createStatItem(label, value, id) {
        const container = new BABYLON.GUI.StackPanel();
        container.isVertical = false;
        container.width = "100%";
        container.height = "40px";
        
        const labelText = new BABYLON.GUI.TextBlock();
        labelText.text = label;
        labelText.color = "white";
        labelText.fontSize = 12;
        labelText.width = "60%";
        labelText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        container.addControl(labelText);
        
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = value;
        valueText.color = "gold";
        valueText.fontSize = 12;
        valueText.fontWeight = "bold";
        valueText.width = "40%";
        valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        valueText.name = id;
        container.addControl(valueText);
        
        return container;
    }
    
    createClanPanel() {
        const clanPanel = new BABYLON.GUI.Rectangle();
        clanPanel.width = "320px";
        clanPanel.height = "350px";
        clanPanel.cornerRadius = 15;
        clanPanel.background = "rgba(0, 0, 0, 0.95)";
        clanPanel.thickness = 3;
        clanPanel.color = "#FF6B6B";
        clanPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        clanPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        clanPanel.padding = "20px";
        clanPanel.paddingBottom = "100px";
        clanPanel.paddingRight = "10px";
        clanPanel.isVisible = false;
        clanPanel.name = "clanPanel";
        this.gameEngine.uiManager.advancedGUI.addControl(clanPanel);
        
        this.uiElements.clanPanel = clanPanel;
    }
    
    createBattlePanel() {
        const battlePanel = new BABYLON.GUI.Rectangle();
        battlePanel.width = "400px";
        battlePanel.height = "500px";
        battlePanel.cornerRadius = 15;
        battlePanel.background = "rgba(0, 0, 0, 0.95)";
        battlePanel.thickness = 3;
        battlePanel.color = "#FF4444";
        battlePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        battlePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        battlePanel.padding = "25px";
        battlePanel.isVisible = false;
        battlePanel.name = "battlePanel";
        this.gameEngine.uiManager.advancedGUI.addControl(battlePanel);
        
        this.uiElements.battlePanel = battlePanel;
    }
    
    loadGameData() {
        // بارگذاری داده‌های ذخیره‌شده بازی
        const savedData = this.storageManager.loadGameData();
        
        if (savedData) {
            this.applySavedData(savedData);
            console.log("داده‌های بازی با موفقیت بارگذاری شد");
        } else {
            this.initializeNewGame();
            console.log("بازی جدید شروع شد");
        }
    }
    
    applySavedData(data) {
        // اعمال داده‌های ذخیره‌شده به بازی
        this.scoreManager.loadData(data.scores);
        this.stageManager.loadData(data.stages);
        this.achievementManager.loadData(data.achievements);
        this.economyManager.loadData(data.economy);
        
        // بازیابی منابع
        this.gameEngine.resources = data.resources || { gold: 1000, elixir: 500 };
        
        // بازیابی ساختمان‌ها
        if (data.buildings) {
            data.buildings.forEach(buildingData => {
                this.gameEngine.createBuilding(buildingData.type, buildingData.position);
            });
        }
        
        // بازیابی واحدها
        if (data.units) {
            data.units.forEach(unitData => {
                this.gameEngine.createUnit(unitData.type, unitData.position);
            });
        }
    }
    
    initializeNewGame() {
        // مقداردهی اولیه بازی جدید
        this.scoreManager.initialize();
        this.stageManager.initialize();
        this.achievementManager.initialize();
        this.economyManager.initialize();
        
        // شروع آموزش
        this.tutorialManager.startTutorial();
    }
    
    setupEventListeners() {
        // ثبت رویدادهای بازی
        this.setupBuildingEventListeners();
        this.setupUnitEventListeners();
        this.setupResourceEventListeners();
        this.setupBattleEventListeners();
        
        // رویدادهای ذخیره‌سازی خودکار
        setInterval(() => {
            this.saveGame();
        }, 30000); // ذخیره‌سازی خودکار هر 30 ثانیه
    }
    
    setupBuildingEventListeners() {
        // رویدادهای مربوط به ساختمان‌ها
        this.gameEngine.onBuildingBuilt = (building) => {
            this.scoreManager.addScore('buildings_built', 1);
            this.achievementManager.checkBuildingAchievements(building);
            this.stageManager.checkStageProgress();
            this.analyticsManager.trackBuildingBuilt(building);
        };
        
        this.gameEngine.onBuildingUpgraded = (building) => {
            this.scoreManager.addScore('buildings_upgraded', 1);
            this.achievementManager.checkUpgradeAchievements(building);
            this.economyManager.updateProductionRates();
        };
        
        this.gameEngine.onBuildingDestroyed = (building) => {
            this.scoreManager.addScore('buildings_destroyed', 1);
            this.analyticsManager.trackBuildingDestroyed(building);
        };
    }
    
    setupUnitEventListeners() {
        // رویدادهای مربوط به واحدها
        this.gameEngine.onUnitTrained = (unit) => {
            this.scoreManager.addScore('units_trained', 1);
            this.achievementManager.checkUnitAchievements(unit);
            this.analyticsManager.trackUnitTrained(unit);
        };
        
        this.gameEngine.onUnitKilled = (unit) => {
            this.scoreManager.addScore('units_killed', 1);
            this.analyticsManager.trackUnitKilled(unit);
        };
    }
    
    setupResourceEventListeners() {
        // رویدادهای مربوط به منابع
        this.gameEngine.onResourceCollected = (type, amount) => {
            this.scoreManager.addScore('resources_collected', amount);
            this.scoreManager.addResource(type, amount);
            this.achievementManager.checkResourceAchievements(type, amount);
            this.analyticsManager.trackResourceCollection(type, amount);
        };
        
        this.gameEngine.onResourceSpent = (type, amount) => {
            this.scoreManager.addResourceSpent(type, amount);
            this.analyticsManager.trackResourceSpending(type, amount);
        };
    }
    
    setupBattleEventListeners() {
        // رویدادهای مربوط به نبردها
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
            this.analyticsManager.trackBattleWon(battle);
        };
        
        this.gameEngine.onBattleLost = (battle) => {
            this.scoreManager.addScore('battles_lost', 1);
            this.analyticsManager.trackBattleLost(battle);
        };
    }
    
    startGameLoop() {
        // شروع حلقه مدیریت بازی
        this.scene.onBeforeRenderObservable.add(() => {
            this.update();
        });
    }
    
    update() {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        
        // به‌روزرسانی تمام سیستم‌های مدیریتی
        this.scoreManager.update(deltaTime);
        this.stageManager.update(deltaTime);
        this.achievementManager.update(deltaTime);
        this.eventManager.update(deltaTime);
        this.economyManager.update(deltaTime);
        this.battleManager.update(deltaTime);
        this.tutorialManager.update(deltaTime);
        this.analyticsManager.update(deltaTime);
        
        // به‌روزرسانی رابط کاربری
        this.updateUI();
    }
    
    updateUI() {
        // به‌روزرسانی پنل پیشرفت
        if (this.uiElements.levelInfo) {
            this.uiElements.levelInfo.text = "سطح: " + this.scoreManager.getLevel();
        }
        
        if (this.uiElements.xpBar) {
            const progressBar = this.uiElements.xpBar.getControlByName("xpBarProgress");
            if (progressBar) {
                const xpInfo = this.scoreManager.getXPInfo();
                progressBar.width = ((xpInfo.current / xpInfo.max) * 100) + "%";
            }
        }
        
        if (this.uiElements.stageInfo) {
            this.uiElements.stageInfo.text = "مرحله: " + this.stageManager.getCurrentStageInfo();
        }
        
        // به‌روزرسانی آمار
        this.updateStatsUI();
        
        // به‌روزرسانی دستاوردها
        this.updateAchievementsUI();
    }
    
    updateStatsUI() {
        const stats = this.scoreManager.getGameStats();
        
        Object.keys(stats).forEach(statId => {
            const element = this.gameEngine.uiManager.advancedGUI.getControlByName(statId);
            if (element) {
                element.text = stats[statId];
            }
        });
    }
    
    updateAchievementsUI() {
        const achievements = this.achievementManager.getRecentAchievements();
        const achievementList = this.uiElements.achievementList;
        
        if (achievementList && achievements.length > 0) {
            // پاک کردن لیست قبلی
            achievementList.children.forEach(child => child.dispose());
            achievementList.children = [];
            
            // اضافه کردن دستاوردهای جدید
            achievements.forEach(achievement => {
                const achievementItem = this.createAchievementItem(achievement);
                achievementList.addControl(achievementItem);
            });
        }
    }
    
    createAchievementItem(achievement) {
        const container = new BABYLON.GUI.Rectangle();
        container.width = "100%";
        container.height = "60px";
        container.cornerRadius = 8;
        container.background = achievement.unlocked ? 
            "rgba(255, 215, 0, 0.2)" : "rgba(255, 255, 255, 0.1)";
        container.thickness = 1;
        container.color = achievement.unlocked ? "gold" : "#666666";
        container.padding = "8px";
        container.paddingBottom = "12px";
        
        const grid = new BABYLON.GUI.Grid();
        grid.width = "100%";
        grid.height = "100%";
        grid.addColumnDefinition(0.2); // آیکون
        grid.addColumnDefinition(0.6); // متن
        grid.addColumnDefinition(0.2); // پاداش
        
        // آیکون
        const icon = new BABYLON.GUI.TextBlock();
        icon.text = achievement.icon;
        icon.fontSize = 20;
        icon.color = achievement.unlocked ? "gold" : "white";
        grid.addControl(icon, 0, 0);
        
        // اطلاعات
        const infoStack = new BABYLON.GUI.StackPanel();
        infoStack.isVertical = true;
        infoStack.width = "100%";
        infoStack.height = "100%";
        
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = achievement.name;
        nameText.color = "white";
        nameText.fontSize = 12;
        nameText.fontWeight = "bold";
        nameText.height = "20px";
        infoStack.addControl(nameText);
        
        const descText = new BABYLON.GUI.TextBlock();
        descText.text = achievement.description;
        descText.color = "#cccccc";
        descText.fontSize = 10;
        descText.height = "15px";
        descText.textWrapping = true;
        infoStack.addControl(descText);
        
        const progressText = new BABYLON.GUI.TextBlock();
        progressText.text = achievement.progress;
        progressText.color = "gold";
        progressText.fontSize = 9;
        progressText.height = "10px";
        infoStack.addControl(progressText);
        
        grid.addControl(infoStack, 0, 1);
        
        // پاداش
        const rewardText = new BABYLON.GUI.TextBlock();
        rewardText.text = "+" + achievement.reward;
        rewardText.color = "#44ff44";
        rewardText.fontSize = 11;
        rewardText.fontWeight = "bold";
        grid.addControl(rewardText, 0, 2);
        
        container.addControl(grid);
        return container;
    }
    
    saveGame() {
        const gameData = {
            resources: this.gameEngine.resources,
            buildings: this.gameEngine.buildings.map(building => ({
                type: building.type,
                position: building.position,
                level: building.level
            })),
            units: this.gameEngine.units.map(unit => ({
                type: unit.type,
                position: unit.position,
                health: unit.health
            })),
            scores: this.scoreManager.getSaveData(),
            stages: this.stageManager.getSaveData(),
            achievements: this.achievementManager.getSaveData(),
            economy: this.economyManager.getSaveData(),
            timestamp: Date.now()
        };
        
        this.storageManager.saveGameData(gameData);
        console.log("بازی ذخیره شد");
    }
    
    // متدهای عمومی برای مدیریت بازی
    showProgressPanel() {
        this.hideAllPanels();
        if (this.uiElements.progressPanel) {
            this.uiElements.progressPanel.isVisible = true;
        }
    }
    
    showAchievementPanel() {
        this.hideAllPanels();
        if (this.uiElements.achievementPanel) {
            this.uiElements.achievementPanel.isVisible = true;
        }
    }
    
    showStatsPanel() {
        this.hideAllPanels();
        if (this.uiElements.statsPanel) {
            this.uiElements.statsPanel.isVisible = true;
        }
    }
    
    showClanPanel() {
        this.hideAllPanels();
        if (this.uiElements.clanPanel) {
            this.uiElements.clanPanel.isVisible = true;
        }
    }
    
    showBattlePanel() {
        this.hideAllPanels();
        if (this.uiElements.battlePanel) {
            this.uiElements.battlePanel.isVisible = true;
        }
    }
    
    hideAllPanels() {
        Object.values(this.uiElements).forEach(panel => {
            if (panel && typeof panel.isVisible !== 'undefined') {
                panel.isVisible = false;
            }
        });
    }
    
    // متدهای مدیریت وضعیت بازی
    pauseGame() {
        this.scene.getEngine().stopRenderLoop();
        this.gameEngine.engine.stopRenderLoop();
    }
    
    resumeGame() {
        this.gameEngine.engine.runRenderLoop(() => {
            this.gameEngine.update();
            this.scene.render();
        });
    }
    
    resetGame() {
        if (confirm("آیا از بازنشانی بازی اطمینان دارید؟ تمام پیشرفت‌های شما از بین خواهد رفت.")) {
            this.storageManager.clearGameData();
            location.reload();
        }
    }
    
    // متدهای مدیریت اقتصاد
    addResources(amounts) {
        this.gameEngine.addResources(amounts);
        this.scoreManager.addResource('total_collected', amounts.gold + amounts.elixir);
    }
    
    spendResources(amounts) {
        if (this.gameEngine.hasEnoughResources(amounts)) {
            this.gameEngine.deductResources(amounts);
            this.scoreManager.addResource('total_spent', amounts.gold + amounts.elixir);
            return true;
        }
        return false;
    }
}

// سیستم مدیریت ذخیره‌سازی
class StorageManager {
    constructor() {
        this.storageKey = "clash_style_game_save";
    }
    
    init() {
        console.log("سیستم ذخیره‌سازی راه‌اندازی شد");
    }
    
    saveGameData(data) {
        try {
            const compressedData = this.compressData(data);
            localStorage.setItem(this.storageKey, compressedData);
            return true;
        } catch (error) {
            console.error("خطا در ذخیره‌سازی بازی:", error);
            return false;
        }
    }
    
    loadGameData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (savedData) {
                return this.decompressData(savedData);
            }
        } catch (error) {
            console.error("خطا در بارگذاری بازی:", error);
        }
        return null;
    }
    
    clearGameData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error("خطا در پاک کردن داده‌های بازی:", error);
            return false;
        }
    }
    
    compressData(data) {
        // فشرده‌سازی ساده داده‌ها
        return JSON.stringify(data);
    }
    
    decompressData(data) {
        // بازکردن فشرده‌سازی داده‌ها
        return JSON.parse(data);
    }
}

// سیستم مدیریت امتیاز و رتبه‌بندی
class ScoreManager {
    constructor() {
        this.scores = new Map();
        this.resources = new Map();
        this.level = 1;
        this.experience = 0;
        this.totalPlayTime = 0;
        this.startTime = Date.now();
    }
    
    init() {
        this.initializeDefaultScores();
    }
    
    initializeDefaultScores() {
        // امتیازهای پایه
        this.scores.set('buildings_built', 0);
        this.scores.set('buildings_upgraded', 0);
        this.scores.set('buildings_destroyed', 0);
        this.scores.set('units_trained', 0);
        this.scores.set('units_killed', 0);
        this.scores.set('resources_collected', 0);
        this.scores.set('battles_started', 0);
        this.scores.set('battles_won', 0);
        this.scores.set('battles_lost', 0);
        this.scores.set('battle_points', 0);
        
        // منابع جمع‌آوری‌شده
        this.resources.set('gold_collected', 0);
        this.resources.set('elixir_collected', 0);
        this.resources.set('gold_spent', 0);
        this.resources.set('elixir_spent', 0);
        this.resources.set('total_collected', 0);
        this.resources.set('total_spent', 0);
    }
    
    addScore(type, amount = 1) {
        const current = this.scores.get(type) || 0;
        this.scores.set(type, current + amount);
        
        // اضافه کردن تجربه برای برخی امتیازها
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
            'resources_collected', 'units_trained'
        ];
        return xpTypes.includes(type);
    }
    
    getXPMultiplier(type) {
        const multipliers = {
            'buildings_built': 10,
            'buildings_upgraded': 25,
            'battles_won': 50,
            'resources_collected': 1,
            'units_trained': 5
        };
        return multipliers[type] || 1;
    }
    
    addExperience(amount) {
        this.experience += amount;
        
        // بررسی ارتقاء سطح
        while (this.experience >= this.getRequiredXP()) {
            this.experience -= this.getRequiredXP();
            this.levelUp();
        }
    }
    
    getRequiredXP() {
        // فرمول محاسبه XP مورد نیاز برای هر سطح
        return Math.floor(100 * Math.pow(1.5, this.level - 1));
    }
    
    levelUp() {
        this.level++;
        console.log(`تبریک! شما به سطح ${this.level} ارتقاء یافتید!`);
        
        // پاداش سطح
        this.giveLevelReward();
    }
    
    giveLevelReward() {
        const rewards = {
            gold: this.level * 100,
            elixir: this.level * 50
        };
        
        // اطلاع‌رسانی به بازی
        if (window.gameEngine) {
            window.gameEngine.addResources(rewards);
            window.gameEngine.uiManager.showNotification(
                `سطح ${this.level}!
                 پاداش: ${rewards.gold} طلا و ${rewards.elixir} اکسیر`
            );
        }
    }
    
    getLevel() {
        return this.level;
    }
    
    getXPInfo() {
        return {
            current: this.experience,
            max: this.getRequiredXP(),
            level: this.level
        };
    }
    
    getGameStats() {
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(currentTime / 3600);
        const minutes = Math.floor((currentTime % 3600) / 60);
        const seconds = currentTime % 60;
        
        return {
            'playTime': `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
            'buildingsBuilt': this.scores.get('buildings_built') || 0,
            'unitsTrained': this.scores.get('units_trained') || 0,
            'battlesFought': (this.scores.get('battles_started') || 0) + 
                           (this.scores.get('battles_won') || 0) + 
                           (this.scores.get('battles_lost') || 0),
            'resourcesCollected': this.resources.get('total_collected') || 0
        };
    }
    
    getTotalScore() {
        let total = 0;
        this.scores.forEach(score => {
            total += score;
        });
        return total;
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
    
    loadData(data) {
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
        // به‌روزرسانی آمار زمان بازی
        this.totalPlayTime += deltaTime;
    }
}

// سیستم مدیریت مرحله و پیشرفت
class StageManager {
    constructor() {
        this.currentStage = 1;
        this.stages = new Map();
        this.stageProgress = new Map();
        this.completedStages = new Set();
    }
    
    init() {
        this.initializeStages();
    }
    
    initializeStages() {
        // تعریف مراحل بازی
        const stageDefinitions = [
            { id: 1, name: "شروع ماجرا", requirements: { buildings_built: 3, units_trained: 1 }, reward: { gold: 500, elixir: 250 } },
            { id: 2, name: "پایه‌گذاری", requirements: { buildings_built: 5, level: 2 }, reward: { gold: 1000, elixir: 500 } },
            { id: 3, name: "ارتش کوچک", requirements: { units_trained: 5, battles_won: 1 }, reward: { gold: 1500, elixir: 750 } },
            { id: 4, name: "شهر در حال رشد", requirements: { buildings_built: 10, buildings_upgraded: 3 }, reward: { gold: 2000, elixir: 1000 } },
            { id: 5, name: "قدرت نظامی", requirements: { units_trained: 15, battles_won: 3 }, reward: { gold: 3000, elixir: 1500 } },
            { id: 6, name: "قلعه‌ی مستحکم", requirements: { level: 5, buildings_upgraded: 10 }, reward: { gold: 5000, elixir: 2500 } },
            { id: 7, name: "فاتح جنگ‌ها", requirements: { battles_won: 10, battle_points: 500 }, reward: { gold: 7500, elixir: 4000 } },
            { id: 8, name: "امپراتوری", requirements: { level: 10, buildings_built: 25 }, reward: { gold: 10000, elixir: 6000 } },
            { id: 9, name: "افسانه‌ی زنده", requirements: { battles_won: 25, battle_points: 2000 }, reward: { gold: 15000, elixir: 9000 } },
            { id: 10, name: "سلطان جنگ", requirements: { level: 15, total_score: 100000 }, reward: { gold: 25000, elixir: 15000 } }
        ];
        
        stageDefinitions.forEach(stage => {
            this.stages.set(stage.id, stage);
            this.stageProgress.set(stage.id, 0);
        });
    }
    
    checkStageProgress() {
        const currentStage = this.stages.get(this.currentStage);
        if (!currentStage) return;
        
        const progress = this.calculateStageProgress(currentStage);
        this.stageProgress.set(this.currentStage, progress);
        
        if (progress >= 100) {
            this.completeStage(this.currentStage);
        }
    }
    
    calculateStageProgress(stage) {
        const requirements = stage.requirements;
        let totalProgress = 0;
        let requirementCount = 0;
        
        Object.keys(requirements).forEach(requirement => {
            const target = requirements[requirement];
            const current = this.getRequirementValue(requirement);
            const progress = Math.min((current / target) * 100, 100);
            totalProgress += progress;
            requirementCount++;
        });
        
        return requirementCount > 0 ? totalProgress / requirementCount : 0;
    }
    
    getRequirementValue(requirement) {
        const scoreManager = window.gameEngine?.gameManager?.scoreManager;
        if (!scoreManager) return 0;
        
        switch (requirement) {
            case 'buildings_built':
                return scoreManager.scores.get('buildings_built') || 0;
            case 'units_trained':
                return scoreManager.scores.get('units_trained') || 0;
            case 'battles_won':
                return scoreManager.scores.get('battles_won') || 0;
            case 'buildings_upgraded':
                return scoreManager.scores.get('buildings_upgraded') || 0;
            case 'level':
                return scoreManager.getLevel();
            case 'battle_points':
                return scoreManager.scores.get('battle_points') || 0;
            case 'total_score':
                return scoreManager.getTotalScore();
            default:
                return 0;
        }
    }
    
    completeStage(stageId) {
        const stage = this.stages.get(stageId);
        if (!stage || this.completedStages.has(stageId)) return;
        
        this.completedStages.add(stageId);
        this.currentStage = stageId + 1;
        
        // اعطای پاداش
        this.giveStageReward(stage);
        
        console.log(`تبریک! مرحله "${stage.name}" تکمیل شد!`);
        
        // اطلاع‌رسانی به بازیکن
        if (window.gameEngine) {
            window.gameEngine.addResources(stage.reward);
            window.gameEngine.uiManager.showNotification(
                `مرحله "${stage.name}" تکمیل شد!
                 پاداش: ${stage.reward.gold} طلا و ${stage.reward.elixir} اکسیر`,
                "success"
            );
        }
        
        // بررسی مرحله بعدی
        this.checkStageProgress();
    }
    
    giveStageReward(stage) {
        if (window.gameEngine) {
            window.gameEngine.addResources(stage.reward);
        }
    }
    
    getCurrentStageInfo() {
        const currentStage = this.stages.get(this.currentStage);
        if (!currentStage) return "پایان بازی";
        
        const progress = this.stageProgress.get(this.currentStage) || 0;
        return `${this.currentStage}/10 (${Math.round(progress)}%)`;
    }
    
    getSaveData() {
        return {
            currentStage: this.currentStage,
            completedStages: Array.from(this.completedStages),
            stageProgress: Object.fromEntries(this.stageProgress)
        };
    }
    
    loadData(data) {
        this.currentStage = data.currentStage || 1;
        this.completedStages = new Set(data.completedStages || []);
        if (data.stageProgress) {
            this.stageProgress = new Map(Object.entries(data.stageProgress));
        }
    }
    
    update(deltaTime) {
        // به‌روزرسانی دوره‌ای پیشرفت
        if (Math.random() < 0.01) { // 1% chance every frame
            this.checkStageProgress();
        }
    }
}

// سیستم مدیریت دستاوردها
class AchievementManager {
    constructor() {
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        this.recentUnlocks = [];
    }
    
    init() {
        this.initializeAchievements();
    }
    
    initializeAchievements() {
        const achievementDefinitions = [
            {
                id: "first_building",
                name: "سازنده مبتدی",
                description: "اولین ساختمان خود را بسازید",
                icon: "🏠",
                requirement: { type: "buildings_built", target: 1 },
                reward: 100
            },
            {
                id: "army_recruiter",
                name: "جذب کننده نیرو",
                description: "۱۰ سرباز آموزش دهید",
                icon: "⚔️",
                requirement: { type: "units_trained", target: 10 },
                reward: 250
            },
            {
                id: "master_builder",
                name: "استاد سازنده",
                description: "۲۰ ساختمان بسازید",
                icon: "🏗️",
                requirement: { type: "buildings_built", target: 20 },
                reward: 500
            },
            {
                id: "wealthy_ruler",
                name: "حاکم ثروتمند",
                description: "۱۰۰۰۰ طلا جمع‌آوری کنید",
                icon: "💰",
                requirement: { type: "gold_collected", target: 10000 },
                reward: 1000
            },
            {
                id: "elixir_master",
                name: "استاد اکسیر",
                description: "۵۰۰۰ اکسیر جمع‌آوری کنید",
                icon: "⚗️",
                requirement: { type: "elixir_collected", target: 5000 },
                reward: 800
            },
            {
                id: "victorious_commander",
                name: "فرمانده پیروز",
                description: "۵ نبرد را برنده شوید",
                icon: "🏆",
                requirement: { type: "battles_won", target: 5 },
                reward: 750
            },
            {
                id: "city_planner",
                name: "طراح شهر",
                description: "۱۰ ساختمان را ارتقاء دهید",
                icon: "📈",
                requirement: { type: "buildings_upgraded", target: 10 },
                reward: 600
            },
            {
                id: "legendary_warrior",
                name: "جنگجوی افسانه‌ای",
                description: "به سطح ۱۰ برسید",
                icon: "⭐",
                requirement: { type: "level", target: 10 },
                reward: 1500
            }
        ];
        
        achievementDefinitions.forEach(achievement => {
            this.achievements.set(achievement.id, {
                ...achievement,
                unlocked: false,
                progress: 0
            });
        });
    }
    
    checkBuildingAchievements(building) {
        this.checkAchievementProgress("buildings_built");
        this.checkAchievementProgress("buildings_upgraded");
    }
    
    checkUnitAchievements(unit) {
        this.checkAchievementProgress("units_trained");
    }
    
    checkResourceAchievements(type, amount) {
        this.checkAchievementProgress(type + "_collected");
    }
    
    checkBattleAchievements(battle) {
        this.checkAchievementProgress("battles_won");
        this.checkAchievementProgress("battle_points");
    }
    
    checkUpgradeAchievements(building) {
        this.checkAchievementProgress("buildings_upgraded");
    }
    
    checkAchievementProgress(requirementType) {
        this.achievements.forEach((achievement, id) => {
            if (achievement.unlocked) return;
            
            if (achievement.requirement.type === requirementType) {
                const currentValue = this.getCurrentValue(achievement.requirement.type);
                const progress = Math.min((currentValue / achievement.requirement.target) * 100, 100);
                
                achievement.progress = progress;
                
                if (currentValue >= achievement.requirement.target) {
                    this.unlockAchievement(id);
                }
            }
        });
    }
    
    getCurrentValue(requirementType) {
        const scoreManager = window.gameEngine?.gameManager?.scoreManager;
        if (!scoreManager) return 0;
        
        if (requirementType === "level") {
            return scoreManager.getLevel();
        }
        
        if (requirementType.endsWith("_collected")) {
            return scoreManager.resources.get(requirementType) || 0;
        }
        
        return scoreManager.scores.get(requirementType) || 0;
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        achievement.progress = 100;
        this.unlockedAchievements.add(achievementId);
        this.recentUnlocks.push(achievement);
        
        // اعطای پاداش
        this.giveAchievementReward(achievement);
        
        console.log(`دستاورد "${achievement.name}" باز شد!`);
        
        // اطلاع‌رسانی به بازیکن
        if (window.gameEngine) {
            window.gameEngine.uiManager.showNotification(
                `دستاورد "${achievement.name}" باز شد!
                 پاداش: ${achievement.reward} امتیاز`,
                "success"
            );
            
            // اضافه کردن امتیاز
            window.gameEngine.gameManager.scoreManager.addScore('achievement_points', achievement.reward);
        }
        
        // محدود کردن لیست دستاوردهای اخیر
        if (this.recentUnlocks.length > 5) {
            this.recentUnlocks.shift();
        }
    }
    
    giveAchievementReward(achievement) {
        // پاداش به بازی اضافه می‌شود
    }
    
    getRecentAchievements() {
        return this.recentUnlocks.slice(-3); // 3 دستاورد اخیر
    }
    
    getSaveData() {
        return {
            achievements: Object.fromEntries(this.achievements),
            unlockedAchievements: Array.from(this.unlockedAchievements),
            recentUnlocks: this.recentUnlocks
        };
    }
    
    loadData(data) {
        if (data.achievements) {
            this.achievements = new Map(Object.entries(data.achievements));
        }
        this.unlockedAchievements = new Set(data.unlockedAchievements || []);
        this.recentUnlocks = data.recentUnlocks || [];
    }
    
    update(deltaTime) {
        // بررسی دوره‌ای دستاوردها
        if (Math.random() < 0.005) { // 0.5% chance every frame
            this.checkAllAchievements();
        }
    }
    
    checkAllAchievements() {
        this.achievements.forEach((achievement, id) => {
            if (!achievement.unlocked) {
                this.checkAchievementProgress(achievement.requirement.type);
            }
        });
    }
}

// سیستم‌های دیگر (خلاصه‌شده برای حفظ طول مناسب)
class EventManager {
    init() { console.log("سیستم رویدادها راه‌اندازی شد"); }
    update() { }
}

class EconomyManager {
    init() { console.log("سیستم اقتصاد راه‌اندازی شد"); }
    update() { }
    getSaveData() { return {}; }
    loadData() { }
}

class ClanManager {
    init() { console.log("سیستم قبیله راه‌اندازی شد"); }
    update() { }
}

class BattleManager {
    init() { console.log("سیستم نبرد راه‌اندازی شد"); }
    update() { }
    startBattle() { }
}

class TutorialManager {
    init() { console.log("سیستم آموزش راه‌اندازی شد"); }
    update() { }
    startTutorial() { console.log("آموزش بازی شروع شد"); }
}

class AnalyticsManager {
    init() { console.log("سیستم آمار راه‌اندازی شد"); }
    update() { }
    trackBuildingBuilt() { }
    trackUnitTrained() { }
    trackResourceCollection() { }
    trackBattleStarted() { }
    trackBattleWon() { }
    trackBattleLost() { }
    trackBuildingDestroyed() { }
    trackUnitKilled() { }
    trackResourceSpending() { }
}

// اضافه کردن GameManager به GameEngine
if (typeof GameEngine !== 'undefined') {
    GameEngine.prototype.initGameManager = function() {
        this.gameManager = new GameManager(this);
    };
    
    // گسترش متد init اصلی
    const originalInit = GameEngine.prototype.init;
    GameEngine.prototype.init = function() {
        originalInit.call(this);
        this.initGameManager();
    };
    
    // گسترش متدهای موجود برای پشتیبانی از مدیریت بازی
    GameEngine.prototype.addResources = function(amounts) {
        this.resources.gold += amounts.gold || 0;
        this.resources.elixir += amounts.elixir || 0;
        this.uiManager.updateResourceUI();
    };
    
    GameEngine.prototype.deductResources = function(amounts) {
        this.resources.gold -= amounts.gold || 0;
        this.resources.elixir -= amounts.elixir || 0;
        this.uiManager.updateResourceUI();
    };
    
    GameEngine.prototype.hasEnoughResources = function(amounts) {
        return this.resources.gold >= (amounts.gold || 0) && 
               this.resources.elixir >= (amounts.elixir || 0);
    };
}

console.log("فایل m4.js - سیستم مدیریت بازی بارگذاری شد");
