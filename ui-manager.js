// ui-manager.js - مدیریت رابط کاربری و صفحات
class UIManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        this.currentScreen = 'start';
        this.screens = new Map();
        this.buttons = new Map();
        this.animations = new Map();
        this.notifications = [];
        
        this.uiTexture = null;
        this.advancedTexture = null;
        this.uiLayer = null;
        
        this.init();
    }

    async init() {
        await this.setupUIEnvironment();
        this.createStartScreen();
        this.createGameUI();
        this.createPauseScreen();
        this.createGameOverScreen();
        this.createSettingsScreen();
        this.setupEventListeners();
        
        this.showScreen('start');
    }

    async setupUIEnvironment() {
        // ایجاد لایه UI برای عناصر رابط کاربری
        this.uiLayer = new BABYLON.Layer("UI", null, this.scene, true);
        
        // ایجاد دوربین UI
        this.uiCamera = new BABYLON.FreeCamera("uiCamera", new BABYLON.Vector3(0, 0, -10), this.scene);
        this.uiCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.uiCamera.layerMask = 0x10000000;
        this.uiLayer.mask = 0x10000000;

        // تنظیم دوربین Orthographic
        this.uiCamera.orthoTop = 5;
        this.uiCamera.orthoBottom = -5;
        this.uiCamera.orthoLeft = -5 * (window.innerWidth / window.innerHeight);
        this.uiCamera.orthoRight = 5 * (window.innerWidth / window.innerHeight);

        // ایجاد تکسچر برای UI
        this.uiTexture = new BABYLON.DynamicTexture("uiTexture", {
            width: 1024,
            height: 1024
        }, this.scene);

        // ایجاد متریال برای UI
        this.uiMaterial = new BABYLON.StandardMaterial("uiMaterial", this.scene);
        this.uiMaterial.diffuseTexture = this.uiTexture;
        this.uiMaterial.emissiveTexture = this.uiTexture;
        this.uiMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this.uiMaterial.useAlphaFromDiffuseTexture = true;

        // تنظیم رزولوشن
        this.updateResolution();
        window.addEventListener('resize', () => this.updateResolution());
    }

    updateResolution() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        
        if (this.uiCamera) {
            this.uiCamera.orthoLeft = -5 * aspectRatio;
            this.uiCamera.orthoRight = 5 * aspectRatio;
        }
    }

    createStartScreen() {
        const startScreen = new BABYLON.Mesh("startScreen", this.scene);
        startScreen.layerMask = 0x10000000;

        // ایجاد پس‌زمینه صفحه شروع
        const background = BABYLON.MeshBuilder.CreatePlane("startBackground", {
            width: 10,
            height: 8
        }, this.scene);
        background.parent = startScreen;
        background.layerMask = 0x10000000;

        const bgMaterial = new BABYLON.StandardMaterial("startBgMaterial", this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        bgMaterial.alpha = 0.9;
        background.material = bgMaterial;

        // عنوان بازی
        this.createTextElement("gameTitle", "اتصال میوه‌ها", new BABYLON.Vector3(0, 2.5, 0), 1.5, startScreen);

        // زیرعنوان
        this.createTextElement("gameSubtitle", "میوه‌های مشابه را به هم وصل کنید", 
            new BABYLON.Vector3(0, 1.5, 0), 0.4, startScreen);

        // دکمه شروع بازی
        const startButton = this.createButton("startButton", "شروع بازی", 
            new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector2(3, 0.8), startScreen);
        
        // دکمه تنظیمات
        const settingsButton = this.createButton("settingsButton", "تنظیمات", 
            new BABYLON.Vector3(0, -1.2, 0), new BABYLON.Vector2(2, 0.6), startScreen);

        // دکمه خروج
        const exitButton = this.createButton("exitButton", "خروج", 
            new BABYLON.Vector3(0, -2.2, 0), new BABYLON.Vector2(1.5, 0.5), startScreen);

        // ویژگی‌های بازی
        this.createFeatureIcons(startScreen);

        this.screens.set('start', startScreen);
    }

    createFeatureIcons(parent) {
        const features = [
            { text: "گرافیک 3D پیشرفته", icon: "🎮", y: -0.3 },
            { text: "هوش مصنوعی قدرتمند", icon: "🤖", y: -0.8 },
            { text: "سیستم امتیازدهی پویا", icon: "⭐", y: -1.3 },
            { text: "انیمیشن‌های روان", icon: "✨", y: -1.8 }
        ];

        features.forEach((feature, index) => {
            const featureGroup = new BABYLON.Mesh(`feature_${index}`, this.scene);
            featureGroup.parent = parent;
            featureGroup.layerMask = 0x10000000;

            // آیکون
            this.createTextElement(`featureIcon_${index}`, feature.icon, 
                new BABYLON.Vector3(-1.5, feature.y, 0), 0.5, featureGroup);

            // متن
            this.createTextElement(`featureText_${index}`, feature.text, 
                new BABYLON.Vector3(0, feature.y, 0), 0.2, featureGroup);
        });
    }

    createGameUI() {
        const gameUI = new BABYLON.Mesh("gameUI", this.scene);
        gameUI.layerMask = 0x10000000;

        // پنل اطلاعات بازی
        this.createInfoPanel(gameUI);

        // دکمه‌های کنترل
        this.createControlButtons(gameUI);

        // نشانگر زمان
        this.createTimerDisplay(gameUI);

        // نشانگر امتیاز
        this.createScoreDisplay(gameUI);

        // نشانگر مرحله
        this.createLevelDisplay(gameUI);

        this.screens.set('game', gameUI);
    }

    createInfoPanel(parent) {
        const panel = BABYLON.MeshBuilder.CreatePlane("infoPanel", {
            width: 8,
            height: 1
        }, this.scene);
        panel.parent = parent;
        panel.position = new BABYLON.Vector3(0, 4, 0);
        panel.layerMask = 0x10000000;

        const panelMaterial = new BABYLON.StandardMaterial("infoPanelMaterial", this.scene);
        panelMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        panelMaterial.alpha = 0.7;
        panel.material = panelMaterial;

        // آیتم‌های اطلاعات
        const infoItems = [
            { id: "score", text: "امتیاز: 0", x: -3, size: 0.2 },
            { id: "level", text: "مرحله: 1", x: -1, size: 0.2 },
            { id: "connections", text: "اتصال: 0/10", x: 1, size: 0.2 },
            { id: "timer", text: "زمان: 60", x: 3, size: 0.2 }
        ];

        infoItems.forEach(item => {
            this.createTextElement(item.id, item.text, 
                new BABYLON.Vector3(item.x, 0, -0.1), item.size, panel);
        });
    }

    createControlButtons(parent) {
        const buttons = [
            { id: "hintBtn", text: "💡", tooltip: "راهنما", x: -3.5, y: -4 },
            { id: "pauseBtn", text: "⏸️", tooltip: "توقف", x: -1.5, y: -4 },
            { id: "soundBtn", text: "🔊", tooltip: "صدا", x: 0.5, y: -4 },
            { id: "restartBtn", text: "🔄", tooltip: "شروع مجدد", x: 2.5, y: -4 }
        ];

        buttons.forEach(btn => {
            const button = this.createButton(btn.id, btn.text, 
                new BABYLON.Vector3(btn.x, btn.y, 0), new BABYLON.Vector2(0.8, 0.8), parent);
            
            // اضافه کردن tooltip
            this.createTooltip(button, btn.tooltip, parent);
        });
    }

    createTimerDisplay(parent) {
        const timerGroup = new BABYLON.Mesh("timerGroup", this.scene);
        timerGroup.parent = parent;
        timerGroup.position = new BABYLON.Vector3(4, 3, 0);
        timerGroup.layerMask = 0x10000000;

        // دایره تایمر
        const timerCircle = BABYLON.MeshBuilder.CreateCylinder("timerCircle", {
            diameter: 1,
            height: 0.1
        }, this.scene);
        timerCircle.parent = timerGroup;
        timerCircle.rotation.x = Math.PI / 2;

        const circleMaterial = new BABYLON.StandardMaterial("timerCircleMaterial", this.scene);
        circleMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.4);
        timerCircle.material = circleMaterial;

        // نشانگر تایمر
        this.timerHand = BABYLON.MeshBuilder.CreateBox("timerHand", {
            width: 0.05,
            height: 0.4,
            depth: 0.05
        }, this.scene);
        this.timerHand.parent = timerGroup;
        this.timerHand.position.y = 0.2;

        const handMaterial = new BABYLON.StandardMaterial("timerHandMaterial", this.scene);
        handMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        this.timerHand.material = handMaterial;
    }

    createScoreDisplay(parent) {
        const scoreGroup = new BABYLON.Mesh("scoreGroup", this.scene);
        scoreGroup.parent = parent;
        scoreGroup.position = new BABYLON.Vector3(-4, 3, 0);
        scoreGroup.layerMask = 0x10000000;

        // پس‌زمینه امتیاز
        const scoreBg = BABYLON.MeshBuilder.CreatePlane("scoreBg", {
            width: 1.5,
            height: 1
        }, this.scene);
        scoreBg.parent = scoreGroup;

        const bgMaterial = new BABYLON.StandardMaterial("scoreBgMaterial", this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.3);
        bgMaterial.alpha = 0.8;
        scoreBg.material = bgMaterial;

        // متن امتیاز
        this.createTextElement("scoreDisplay", "0", 
            new BABYLON.Vector3(0, 0, -0.1), 0.4, scoreGroup);

        // عنوان
        this.createTextElement("scoreLabel", "امتیاز", 
            new BABYLON.Vector3(0, 0.6, -0.1), 0.15, scoreGroup);
    }

    createLevelDisplay(parent) {
        const levelGroup = new BABYLON.Mesh("levelGroup", this.scene);
        levelGroup.parent = parent;
        levelGroup.position = new BABYLON.Vector3(0, 3, 0);
        levelGroup.layerMask = 0x10000000;

        // حلقه مرحله
        const levelRing = BABYLON.MeshBuilder.CreateTorus("levelRing", {
            diameter: 1,
            thickness: 0.1
        }, this.scene);
        levelRing.parent = levelGroup;

        const ringMaterial = new BABYLON.StandardMaterial("levelRingMaterial", this.scene);
        ringMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        levelRing.material = ringMaterial;

        // شماره مرحله
        this.createTextElement("levelDisplay", "1", 
            new BABYLON.Vector3(0, 0, -0.1), 0.5, levelGroup);
    }

    createPauseScreen() {
        const pauseScreen = new BABYLON.Mesh("pauseScreen", this.scene);
        pauseScreen.layerMask = 0x10000000;

        // پس‌زمینه محو
        const overlay = BABYLON.MeshBuilder.CreatePlane("pauseOverlay", {
            width: 12,
            height: 8
        }, this.scene);
        overlay.parent = pauseScreen;
        overlay.layerMask = 0x10000000;

        const overlayMaterial = new BABYLON.StandardMaterial("pauseOverlayMaterial", this.scene);
        overlayMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        overlayMaterial.alpha = 0.8;
        overlay.material = overlayMaterial;

        // عنوان توقف
        this.createTextElement("pauseTitle", "بازی متوقف شد", 
            new BABYLON.Vector3(0, 2, 0), 0.6, pauseScreen);

        // دکمه ادامه
        const resumeButton = this.createButton("resumeButton", "ادامه بازی", 
            new BABYLON.Vector3(0, 0.5, 0), new BABYLON.Vector2(3, 0.8), pauseScreen);

        // دکمه تنظیمات
        const settingsButton = this.createButton("pauseSettingsButton", "تنظیمات", 
            new BABYLON.Vector3(0, -0.8, 0), new BABYLON.Vector2(2.5, 0.7), pauseScreen);

        // دکمه خروج به منو
        const menuButton = this.createButton("menuButton", "خروج به منو", 
            new BABYLON.Vector3(0, -2, 0), new BABYLON.Vector2(2.5, 0.7), pauseScreen);

        this.screens.set('pause', pauseScreen);
    }

    createGameOverScreen() {
        const gameOverScreen = new BABYLON.Mesh("gameOverScreen", this.scene);
        gameOverScreen.layerMask = 0x10000000;

        // پس‌زمینه
        const background = BABYLON.MeshBuilder.CreatePlane("gameOverBg", {
            width: 10,
            height: 8
        }, this.scene);
        background.parent = gameOverScreen;
        background.layerMask = 0x10000000;

        const bgMaterial = new BABYLON.StandardMaterial("gameOverBgMaterial", this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0.2, 0, 0);
        bgMaterial.alpha = 0.9;
        background.material = bgMaterial;

        // عنوان بازی تمام شد
        this.createTextElement("gameOverTitle", "بازی تمام شد!", 
            new BABYLON.Vector3(0, 2, 0), 0.7, gameOverScreen);

        // امتیاز نهایی
        this.createTextElement("finalScore", "امتیاز: 0", 
            new BABYLON.Vector3(0, 1, 0), 0.4, gameOverScreen);

        // رکورد جدید
        this.createTextElement("newRecord", "رکورد جدید! 🎉", 
            new BABYLON.Vector3(0, 0.3, 0), 0.3, gameOverScreen);

        // دکمه بازی مجدد
        const retryButton = this.createButton("retryButton", "بازی مجدد", 
            new BABYLON.Vector3(0, -1, 0), new BABYLON.Vector2(3, 0.8), gameOverScreen);

        // دکمه منو
        const menuButton = this.createButton("gameOverMenuButton", "منوی اصلی", 
            new BABYLON.Vector3(0, -2.2, 0), new BABYLON.Vector2(2.5, 0.7), gameOverScreen);

        this.screens.set('gameOver', gameOverScreen);
    }

    createSettingsScreen() {
        const settingsScreen = new BABYLON.Mesh("settingsScreen", this.scene);
        settingsScreen.layerMask = 0x10000000;

        // پس‌زمینه
        const background = BABYLON.MeshBuilder.CreatePlane("settingsBg", {
            width: 9,
            height: 7
        }, this.scene);
        background.parent = settingsScreen;
        background.layerMask = 0x10000000;

        const bgMaterial = new BABYLON.StandardMaterial("settingsBgMaterial", this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        bgMaterial.alpha = 0.95;
        background.material = bgMaterial;

        // عنوان تنظیمات
        this.createTextElement("settingsTitle", "تنظیمات بازی", 
            new BABYLON.Vector3(0, 2.5, 0), 0.5, settingsScreen);

        // تنظیمات صدا
        this.createSoundSettings(settingsScreen);

        // تنظیمات گرافیک
        this.createGraphicsSettings(settingsScreen);

        // تنظیمات کنترل
        this.createControlSettings(settingsScreen);

        // دکمه بازگشت
        const backButton = this.createButton("settingsBackButton", "بازگشت", 
            new BABYLON.Vector3(0, -2.8, 0), new BABYLON.Vector2(2, 0.6), settingsScreen);

        this.screens.set('settings', settingsScreen);
    }

    createSoundSettings(parent) {
        const soundGroup = new BABYLON.Mesh("soundSettings", this.scene);
        soundGroup.parent = parent;
        soundGroup.position = new BABYLON.Vector3(0, 1.2, 0);
        soundGroup.layerMask = 0x10000000;

        this.createTextElement("soundTitle", "تنظیمات صدا", 
            new BABYLON.Vector3(0, 0.6, 0), 0.25, soundGroup);

        // حجم کلی
        this.createSlider("masterVolume", "صدا", 0.8, new BABYLON.Vector3(0, 0.2, 0), soundGroup);

        // موسیقی
        this.createSlider("musicVolume", "موسیقی", 0.6, new BABYLON.Vector3(0, -0.3, 0), soundGroup);

        // افکت‌ها
        this.createSlider("effectsVolume", "افکت‌ها", 0.8, new BABYLON.Vector3(0, -0.8, 0), soundGroup);
    }

    createGraphicsSettings(parent) {
        const graphicsGroup = new BABYLON.Mesh("graphicsSettings", this.scene);
        graphicsGroup.parent = parent;
        graphicsGroup.position = new BABYLON.Vector3(0, -1, 0);
        graphicsGroup.layerMask = 0x10000000;

        this.createTextElement("graphicsTitle", "تنظیمات گرافیک", 
            new BABYLON.Vector3(0, 0.6, 0), 0.25, graphicsGroup);

        // کیفیت گرافیک
        this.createDropdown("graphicsQuality", "کیفیت گرافیک", 
            ["پایین", "متوسط", "بالا"], 1, new BABYLON.Vector3(0, 0.2, 0), graphicsGroup);

        // سایه‌ها
        this.createToggle("shadows", "سایه‌ها", true, new BABYLON.Vector3(0, -0.3, 0), graphicsGroup);

        // ذرات
        this.createToggle("particles", "افکت ذرات", true, new BABYLON.Vector3(0, -0.8, 0), graphicsGroup);
    }

    createControlSettings(parent) {
        const controlGroup = new BABYLON.Mesh("controlSettings", this.scene);
        controlGroup.parent = parent;
        controlGroup.position = new BABYLON.Vector3(0, -2.2, 0);
        controlGroup.layerMask = 0x10000000;

        this.createTextElement("controlTitle", "تنظیمات کنترل", 
            new BABYLON.Vector3(0, 0.6, 0), 0.25, controlGroup);

        // حساسیت
        this.createSlider("sensitivity", "حساسیت کنترل", 1.0, 
            new BABYLON.Vector3(0, 0.2, 0), controlGroup);

        // ویبره
        this.createToggle("vibration", "لرزش", true, 
            new BABYLON.Vector3(0, -0.3, 0), controlGroup);
    }

    createButton(id, text, position, size, parent) {
        const buttonGroup = new BABYLON.Mesh(`button_${id}`, this.scene);
        buttonGroup.parent = parent;
        buttonGroup.position = position;
        buttonGroup.layerMask = 0x10000000;

        // بدنه دکمه
        const button = BABYLON.MeshBuilder.CreatePlane(`btn_${id}`, {
            width: size.x,
            height: size.y
        }, this.scene);
        button.parent = buttonGroup;
        button.userData = { isButton: true, id: id };

        const buttonMaterial = new BABYLON.StandardMaterial(`btn_mat_${id}`, this.scene);
        buttonMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
        buttonMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.4);
        button.material = buttonMaterial;

        // متن دکمه
        this.createTextElement(`btn_text_${id}`, text, 
            new BABYLON.Vector3(0, 0, -0.1), Math.min(size.x, size.y) * 0.3, buttonGroup);

        // اضافه کردن انیمیشن hover
        this.addButtonAnimations(button);

        this.buttons.set(id, buttonGroup);
        return buttonGroup;
    }

    createTextElement(id, text, position, size, parent) {
        const textPlane = BABYLON.MeshBuilder.CreatePlane(`text_${id}`, {
            width: text.length * size * 0.6,
            height: size
        }, this.scene);
        textPlane.parent = parent;
        textPlane.position = position;
        textPlane.layerMask = 0x10000000;

        const textMaterial = new BABYLON.StandardMaterial(`text_mat_${id}`, this.scene);
        textMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        textMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
        textPlane.material = textMaterial;

        // رندر متن روی تکسچر
        this.renderTextOnPlane(textPlane, text, size);

        textPlane.userData = { isText: true, text: text };
        return textPlane;
    }

    renderTextOnPlane(plane, text, fontSize) {
        const context = this.uiTexture.getContext();
        const size = plane.getBoundingInfo().boundingBox.extendSize.scale(2);
        
        // پاک کردن زمینه
        context.clearRect(0, 0, this.uiTexture.getSize().width, this.uiTexture.getSize().height);
        
        // تنظیمات متن
        context.font = `${fontSize * 100}px Arial`;
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        
        // رسم متن
        context.fillText(text, 
            this.uiTexture.getSize().width / 2, 
            this.uiTexture.getSize().height / 2
        );
        
        this.uiTexture.update();
    }

    createSlider(id, label, value, position, parent) {
        const sliderGroup = new BABYLON.Mesh(`slider_${id}`, this.scene);
        sliderGroup.parent = parent;
        sliderGroup.position = position;
        sliderGroup.layerMask = 0x10000000;

        // خط زمینه
        const track = BABYLON.MeshBuilder.CreatePlane(`track_${id}`, {
            width: 3,
            height: 0.1
        }, this.scene);
        track.parent = sliderGroup;
        track.position.y = 0;

        const trackMaterial = new BABYLON.StandardMaterial(`track_mat_${id}`, this.scene);
        trackMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
        track.material = trackMaterial;

        // نشانگر
        const thumb = BABYLON.MeshBuilder.CreateSphere(`thumb_${id}`, {
            diameter: 0.2
        }, this.scene);
        thumb.parent = sliderGroup;
        thumb.position.x = (value - 0.5) * 2.5;

        const thumbMaterial = new BABYLON.StandardMaterial(`thumb_mat_${id}`, this.scene);
        thumbMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1);
        thumb.material = thumbMaterial;

        // برچسب
        this.createTextElement(`label_${id}`, label, 
            new BABYLON.Vector3(-1.8, 0.3, 0), 0.15, sliderGroup);

        // مقدار
        this.createTextElement(`value_${id}`, Math.round(value * 100) + "%", 
            new BABYLON.Vector3(1.8, 0.3, 0), 0.15, sliderGroup);

        sliderGroup.userData = {
            isSlider: true,
            id: id,
            value: value,
            thumb: thumb,
            track: track,
            valueText: `value_${id}`
        };

        return sliderGroup;
    }

    createToggle(id, label, isOn, position, parent) {
        const toggleGroup = new BABYLON.Mesh(`toggle_${id}`, this.scene);
        toggleGroup.parent = parent;
        toggleGroup.position = position;
        toggleGroup.layerMask = 0x10000000;

        // زمینه
        const background = BABYLON.MeshBuilder.CreatePlane(`toggle_bg_${id}`, {
            width: 0.8,
            height: 0.4
        }, this.scene);
        background.parent = toggleGroup;
        background.position.x = 1.2;

        const bgMaterial = new BABYLON.StandardMaterial(`toggle_bg_mat_${id}`, this.scene);
        bgMaterial.diffuseColor = isOn ? new BABYLON.Color3(0.2, 0.6, 0.2) : new BABYLON.Color3(0.4, 0.4, 0.4);
        background.material = bgMaterial;

        // نشانگر
        const thumb = BABYLON.MeshBuilder.CreateSphere(`toggle_thumb_${id}`, {
            diameter: 0.3
        }, this.scene);
        thumb.parent = toggleGroup;
        thumb.position.x = 1.2 + (isOn ? 0.2 : -0.2);

        const thumbMaterial = new BABYLON.StandardMaterial(`toggle_thumb_mat_${id}`, this.scene);
        thumbMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        thumb.material = thumbMaterial;

        // برچسب
        this.createTextElement(`toggle_label_${id}`, label, 
            new BABYLON.Vector3(-1, 0, 0), 0.2, toggleGroup);

        toggleGroup.userData = {
            isToggle: true,
            id: id,
            value: isOn,
            background: background,
            thumb: thumb
        };

        return toggleGroup;
    }

    createDropdown(id, label, options, selectedIndex, position, parent) {
        const dropdownGroup = new BABYLON.Mesh(`dropdown_${id}`, this.scene);
        dropdownGroup.parent = parent;
        dropdownGroup.position = position;
        dropdownGroup.layerMask = 0x10000000;

        // زمینه
        const background = BABYLON.MeshBuilder.CreatePlane(`dropdown_bg_${id}`, {
            width: 2.5,
            height: 0.6
        }, this.scene);
        background.parent = dropdownGroup;
        background.position.x = 1;

        const bgMaterial = new BABYLON.StandardMaterial(`dropdown_bg_mat_${id}`, this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
        background.material = bgMaterial;

        // متن انتخاب شده
        this.createTextElement(`dropdown_text_${id}`, options[selectedIndex], 
            new BABYLON.Vector3(1, 0, -0.1), 0.2, dropdownGroup);

        // برچسب
        this.createTextElement(`dropdown_label_${id}`, label, 
            new BABYLON.Vector3(-1.2, 0, 0), 0.2, dropdownGroup);

        dropdownGroup.userData = {
            isDropdown: true,
            id: id,
            options: options,
            selectedIndex: selectedIndex,
            background: background
        };

        return dropdownGroup;
    }

    createTooltip(button, text, parent) {
        const tooltip = new BABYLON.Mesh(`tooltip_${button.name}`, this.scene);
        tooltip.parent = parent;
        tooltip.position.copyFrom(button.position);
        tooltip.position.y += 0.6;
        tooltip.setEnabled(false);
        tooltip.layerMask = 0x10000000;

        const tooltipBg = BABYLON.MeshBuilder.CreatePlane(`tooltip_bg_${button.name}`, {
            width: text.length * 0.15 + 0.2,
            height: 0.3
        }, this.scene);
        tooltipBg.parent = tooltip;

        const bgMaterial = new BABYLON.StandardMaterial(`tooltip_bg_mat_${button.name}`, this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        bgMaterial.alpha = 0.8;
        tooltipBg.material = bgMaterial;

        this.createTextElement(`tooltip_text_${button.name}`, text, 
            new BABYLON.Vector3(0, 0, -0.1), 0.15, tooltip);

        button.userData.tooltip = tooltip;
        return tooltip;
    }

    addButtonAnimations(button) {
        // انیمیشن hover
        const hoverAnimation = new BABYLON.Animation(
            "hoverAnimation",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const hoverKeys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 10, value: new BABYLON.Vector3(1.1, 1.1, 1) }
        ];
        hoverAnimation.setKeys(hoverKeys);

        button.animations = [hoverAnimation];
    }

    setupEventListeners() {
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
                this.handleClick(pointerInfo);
            } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
                this.handleHover(pointerInfo);
            }
        });
    }

    handleClick(pointerInfo) {
        const pickedMesh = pointerInfo.pickInfo.pickedMesh;
        if (!pickedMesh) return;

        // بررسی کلیک روی دکمه
        if (pickedMesh.userData && pickedMesh.userData.isButton) {
            this.onButtonClick(pickedMesh.userData.id);
        }

        // بررسی کلیک روی اسلایدر
        let parent = pickedMesh.parent;
        while (parent) {
            if (parent.userData) {
                if (parent.userData.isSlider) {
                    this.onSliderClick(parent, pointerInfo);
                    break;
                } else if (parent.userData.isToggle) {
                    this.onToggleClick(parent);
                    break;
                } else if (parent.userData.isDropdown) {
                    this.onDropdownClick(parent);
                    break;
                }
            }
            parent = parent.parent;
        }
    }

    handleHover(pointerInfo) {
        const pickedMesh = pointerInfo.pickInfo.pickedMesh;
        
        // مدیریت hover روی دکمه‌ها
        this.buttons.forEach((button, id) => {
            const tooltip = button.userData.tooltip;
            if (tooltip) {
                const isHovering = pickedMesh && pickedMesh.parent === button;
                tooltip.setEnabled(isHovering);
                
                // انیمیشن hover
                const buttonMesh = button.getChildren()[0];
                if (buttonMesh) {
                    if (isHovering && !buttonMesh.userData.isAnimating) {
                        this.scene.beginAnimation(buttonMesh, 0, 10, false);
                        buttonMesh.userData.isAnimating = true;
                    } else if (!isHovering && buttonMesh.userData.isAnimating) {
                        this.scene.beginAnimation(buttonMesh, 10, 0, false);
                        buttonMesh.userData.isAnimating = false;
                    }
                }
            }
        });
    }

    onButtonClick(buttonId) {
        console.log(`Button clicked: ${buttonId}`);
        
        switch (buttonId) {
            case 'startButton':
                this.showScreen('game');
                if (window.gameManager) {
                    window.gameManager.startGame();
                }
                break;
                
            case 'settingsButton':
            case 'pauseSettingsButton':
                this.showScreen('settings');
                break;
                
            case 'resumeButton':
                this.showScreen('game');
                if (window.gameManager) {
                    window.gameManager.resumeGame();
                }
                break;
                
            case 'pauseBtn':
                this.showScreen('pause');
                if (window.gameManager) {
                    window.gameManager.pauseGame();
                }
                break;
                
            case 'restartButton':
            case 'retryButton':
                this.showScreen('game');
                if (window.gameManager) {
                    window.gameManager.restartGame();
                }
                break;
                
            case 'menuButton':
            case 'gameOverMenuButton':
            case 'settingsBackButton':
                this.showScreen('start');
                break;
                
            case 'hintBtn':
                this.showHint();
                break;
                
            case 'soundBtn':
                this.toggleSound();
                break;
                
            case 'exitButton':
                this.exitGame();
                break;
        }
    }

    onSliderClick(slider, pointerInfo) {
        const localPoint = BABYLON.Vector3.TransformCoordinates(
            pointerInfo.pickInfo.pickedPoint,
            BABYLON.Matrix.Invert(slider.getWorldMatrix())
        );

        // محاسبه مقدار جدید بر اساس موقعیت کلیک
        const newValue = BABYLON.Scalar.Clamp((localPoint.x + 1.5) / 3, 0, 1);
        this.updateSliderValue(slider, newValue);
    }

    onToggleClick(toggle) {
        const newValue = !toggle.userData.value;
        this.updateToggleValue(toggle, newValue);
    }

    onDropdownClick(dropdown) {
        // چرخش بین گزینه‌ها
        const options = dropdown.userData.options;
        const currentIndex = dropdown.userData.selectedIndex;
        const newIndex = (currentIndex + 1) % options.length;
        
        this.updateDropdownValue(dropdown, newIndex);
    }

    updateSliderValue(slider, value) {
        slider.userData.value = value;
        slider.userData.thumb.position.x = (value - 0.5) * 2.5;
        
        // به‌روزرسانی متن مقدار
        const valueText = slider.getChildren().find(child => 
            child.name === `text_value_${slider.userData.id}`
        );
        if (valueText) {
            this.renderTextOnPlane(valueText, Math.round(value * 100) + "%", 0.15);
        }
        
        // اعمال تنظیمات
        this.applySettings(slider.userData.id, value);
    }

    updateToggleValue(toggle, value) {
        toggle.userData.value = value;
        
        // به‌روزرسانی رنگ زمینه
        const bgMaterial = toggle.userData.background.material;
        bgMaterial.diffuseColor = value ? 
            new BABYLON.Color3(0.2, 0.6, 0.2) : 
            new BABYLON.Color3(0.4, 0.4, 0.4);
        
        // حرکت نشانگر
        toggle.userData.thumb.position.x = 1.2 + (value ? 0.2 : -0.2);
        
        // اعمال تنظیمات
        this.applySettings(toggle.userData.id, value);
    }

    updateDropdownValue(dropdown, selectedIndex) {
        dropdown.userData.selectedIndex = selectedIndex;
        const selectedValue = dropdown.userData.options[selectedIndex];
        
        // به‌روزرسانی متن
        const textElement = dropdown.getChildren().find(child => 
            child.name === `text_dropdown_text_${dropdown.userData.id}`
        );
        if (textElement) {
            this.renderTextOnPlane(textElement, selectedValue, 0.2);
        }
        
        // اعمال تنظیمات
        this.applySettings(dropdown.userData.id, selectedValue);
    }

    applySettings(settingId, value) {
        switch (settingId) {
            case 'masterVolume':
                if (window.audioManager) {
                    window.audioManager.setMasterVolume(value);
                }
                break;
            case 'musicVolume':
                if (window.audioManager) {
                    window.audioManager.setMusicVolume(value);
                }
                break;
            case 'effectsVolume':
                if (window.audioManager) {
                    window.audioManager.setSoundVolume(value);
                }
                break;
            case 'graphicsQuality':
                this.applyGraphicsQuality(value);
                break;
            case 'shadows':
                this.applyShadowsSetting(value);
                break;
            case 'particles':
                this.applyParticlesSetting(value);
                break;
            case 'sensitivity':
                this.applySensitivitySetting(value);
                break;
            case 'vibration':
                this.applyVibrationSetting(value);
                break;
        }
    }

    applyGraphicsQuality(quality) {
        console.log(`Graphics quality set to: ${quality}`);
        // اعمال تنظیمات کیفیت گرافیک
    }

    applyShadowsSetting(enabled) {
        console.log(`Shadows ${enabled ? 'enabled' : 'disabled'}`);
        // اعمال تنظیمات سایه‌ها
    }

    applyParticlesSetting(enabled) {
        console.log(`Particles ${enabled ? 'enabled' : 'disabled'}`);
        if (window.particleManager) {
            window.particleManager.setEnabled(enabled);
        }
    }

    applySensitivitySetting(sensitivity) {
        console.log(`Sensitivity set to: ${sensitivity}`);
        // اعمال تنظیمات حساسیت
    }

    applyVibrationSetting(enabled) {
        console.log(`Vibration ${enabled ? 'enabled' : 'disabled'}`);
        // اعمال تنظیمات لرزش
    }

    showScreen(screenName) {
        // مخفی کردن تمام صفحه‌ها
        this.screens.forEach((screen, name) => {
            screen.setEnabled(name === screenName);
        });
        
        this.currentScreen = screenName;
        
        // مدیریت وضعیت بازی
        if (screenName === 'game') {
            this.onGameScreenShown();
        } else if (screenName === 'pause') {
            this.onPauseScreenShown();
        }
    }

    onGameScreenShown() {
        // به‌روزرسانی عناصر UI بازی
        this.updateGameUI();
    }

    onPauseScreenShown() {
        // به‌روزرسانی اطلاعات در صفحه توقف
        this.updatePauseScreen();
    }

    updateGameUI() {
        // به‌روزرسانی امتیاز، زمان و سایر اطلاعات
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.updateLevelDisplay();
        this.updateConnectionsDisplay();
    }

    updateScoreDisplay() {
        const score = window.gameManager ? window.gameManager.getScore() : 0;
        const scoreElement = this.screens.get('game').getChildren().find(child => 
            child.name === 'text_score'
        );
        if (scoreElement) {
            this.renderTextOnPlane(scoreElement, `امتیاز: ${score}`, 0.2);
        }
    }

    updateTimerDisplay() {
        const timeLeft = window.gameManager ? window.gameManager.getTimeLeft() : 60;
        
        // به‌روزرسانی متن تایمر
        const timerElement = this.screens.get('game').getChildren().find(child => 
            child.name === 'text_timer'
        );
        if (timerElement) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            this.renderTextOnPlane(timerElement, 
                `زمان: ${minutes}:${seconds.toString().padStart(2, '0')}`, 0.2);
        }
        
        // به‌روزرسانی نشانگر تایمر
        if (this.timerHand) {
            const progress = timeLeft / 60; // فرض بر 60 ثانیه زمان کل
            this.timerHand.rotation.z = -progress * Math.PI * 2;
            
            // تغییر رنگ بر اساس زمان باقیمانده
            const handMaterial = this.timerHand.material;
            if (timeLeft < 10) {
                handMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // قرمز
            } else if (timeLeft < 30) {
                handMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0); // نارنجی
            } else {
                handMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // زرد
            }
        }
    }

    updateLevelDisplay() {
        const level = window.gameManager ? window.gameManager.getLevel() : 1;
        const levelElement = this.screens.get('game').getChildren().find(child => 
            child.name === 'text_level'
        );
        if (levelElement) {
            this.renderTextOnPlane(levelElement, `مرحله: ${level}`, 0.2);
        }
        
        // به‌روزرسانی نمایشگر مرحله
        const levelDisplay = this.screens.get('game').getChildren().find(child => 
            child.name === 'text_levelDisplay'
        );
        if (levelDisplay) {
            this.renderTextOnPlane(levelDisplay, level.toString(), 0.5);
        }
    }

    updateConnectionsDisplay() {
        const connections = window.gameManager ? window.gameManager.getConnections() : { made: 0, needed: 10 };
        const connElement = this.screens.get('game').getChildren().find(child => 
            child.name === 'text_connections'
        );
        if (connElement) {
            this.renderTextOnPlane(connElement, 
                `اتصال: ${connections.made}/${connections.needed}`, 0.2);
        }
    }

    updatePauseScreen() {
        // به‌روزرسانی اطلاعات در صفحه توقف
        const score = window.gameManager ? window.gameManager.getScore() : 0;
        const level = window.gameManager ? window.gameManager.getLevel() : 1;
        
        // می‌توان اطلاعات بیشتری را در صفحه توقف نمایش داد
    }

    showHint() {
        // نمایش راهنمای بازی
        this.showNotification("راهنما: میوه‌های مشابه را به هم وصل کنید!", 3000);
        
        // هایلایت کردن یک جفت میوه قابل اتصال
        if (window.gameManager) {
            window.gameManager.showHint();
        }
    }

    toggleSound() {
        if (window.audioManager) {
            const isMuted = window.audioManager.toggleMute();
            const soundButton = this.buttons.get('soundBtn');
            if (soundButton) {
                const textElement = soundButton.getChildren().find(child => 
                    child.name.includes('btn_text_soundBtn')
                );
                if (textElement) {
                    this.renderTextOnPlane(textElement, isMuted ? "🔇" : "🔊", 0.3);
                }
            }
        }
    }

    showNotification(message, duration = 3000) {
        const notification = new BABYLON.Mesh(`notification_${Date.now()}`, this.scene);
        notification.layerMask = 0x10000000;
        
        // زمینه نوتیفیکیشن
        const bg = BABYLON.MeshBuilder.CreatePlane("notification_bg", {
            width: message.length * 0.15 + 1,
            height: 0.6
        }, this.scene);
        bg.parent = notification;
        
        const bgMaterial = new BABYLON.StandardMaterial("notification_bg_mat", this.scene);
        bgMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.3);
        bgMaterial.alpha = 0.9;
        bg.material = bgMaterial;
        
        // متن نوتیفیکیشن
        this.createTextElement("notification_text", message, 
            new BABYLON.Vector3(0, 0, -0.1), 0.2, notification);
        
        // انیمیشن نمایش
        notification.position.y = -2;
        notification.scaling = new BABYLON.Vector3(0, 0, 1);
        
        const showAnimation = new BABYLON.Animation(
            "showNotification",
            "scaling",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const showKeys = [
            { frame: 0, value: new BABYLON.Vector3(0, 0, 1) },
            { frame: 10, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        showAnimation.setKeys(showKeys);
        
        notification.animations = [showAnimation];
        this.scene.beginAnimation(notification, 0, 10, false);
        
        // حذف خودکار
        setTimeout(() => {
            const hideAnimation = new BABYLON.Animation(
                "hideNotification",
                "scaling",
                60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );
            
            const hideKeys = [
                { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
                { frame: 10, value: new BABYLON.Vector3(0, 0, 1) }
            ];
            hideAnimation.setKeys(hideKeys);
            
            notification.animations = [hideAnimation];
            this.scene.beginAnimation(notification, 0, 10, false, 1, () => {
                notification.dispose();
            });
        }, duration);
        
        this.notifications.push(notification);
    }

    exitGame() {
        if (confirm("آیا می‌خواهید از بازی خارج شوید؟")) {
            // در محیط مرورگر، نمی‌توانیم برنامه را کاملاً ببندیم
            this.showNotification("برای خروج، پنجره مرورگر را ببندید", 3000);
        }
    }

    showGameOver(score, isNewRecord) {
        this.showScreen('gameOver');
        
        // به‌روزرسانی امتیاز نهایی
        const scoreElement = this.screens.get('gameOver').getChildren().find(child => 
            child.name === 'text_finalScore'
        );
        if (scoreElement) {
            this.renderTextOnPlane(scoreElement, `امتیاز: ${score}`, 0.4);
        }
        
        // نمایش/مخفی کردن رکورد جدید
        const recordElement = this.screens.get('gameOver').getChildren().find(child => 
            child.name === 'text_newRecord'
        );
        if (recordElement) {
            recordElement.setEnabled(isNewRecord);
        }
    }

    // متدهای کمکی
    getCurrentScreen() {
        return this.currentScreen;
    }

    isGameScreenActive() {
        return this.currentScreen === 'game';
    }

    dispose() {
        // پاک کردن تمام عناصر UI
        this.screens.forEach(screen => {
            screen.dispose();
        });
        this.screens.clear();
        
        this.buttons.clear();
        this.animations.clear();
        
        if (this.uiTexture) {
            this.uiTexture.dispose();
        }
        
        if (this.uiMaterial) {
            this.uiMaterial.dispose();
        }
        
        if (this.uiLayer) {
            this.uiLayer.dispose();
        }
    }
}

window.UIManager = UIManager;