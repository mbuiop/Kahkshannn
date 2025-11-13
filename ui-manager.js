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
        // ایجاد دوربین UI
        this.uiCamera = new BABYLON.FreeCamera("uiCamera", new BABYLON.Vector3(0, 0, -10), this.scene);
        this.uiCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.uiCamera.layerMask = 0x10000000;

        // تنظیم دوربین Orthographic
        this.updateResolution();
        window.addEventListener('resize', () => this.updateResolution());
    }

    updateResolution() {
        const aspectRatio = window.innerWidth / window.innerHeight;
        
        if (this.uiCamera) {
            this.uiCamera.orthoLeft = -5 * aspectRatio;
            this.uiCamera.orthoRight = 5 * aspectRatio;
            this.uiCamera.orthoTop = 5;
            this.uiCamera.orthoBottom = -5;
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

        // ویژگی‌های بازی
        this.createFeatureIcons(startScreen);

        this.screens.set('start', startScreen);
    }

    createFeatureIcons(parent) {
        const features = [
            { text: "گرافیک 3D پیشرفته", icon: "🎮", y: -0.3 },
            { text: "هوش مصنوعی قدرتمند", icon: "🤖", y: -0.8 },
            { text: "سیستم امتیازدهی پویا", icon: "⭐", y: -1.3 }
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

        textPlane.userData = { isText: true, text: text };
        return textPlane;
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

    updateSliderValue(slider, value) {
        slider.userData.value = value;
        slider.userData.thumb.position.x = (value - 0.5) * 2.5;
        
        // اعمال تنظیمات
        this.applySettings(slider.userData.id, value);
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
        }
    }

    showScreen(screenName) {
        // مخفی کردن تمام صفحه‌ها
        this.screens.forEach((screen, name) => {
            screen.setEnabled(name === screenName);
        });
        
        this.currentScreen = screenName;
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
            // در نسخه واقعی باید متن را به‌روزرسانی کنیم
        }
    }

    updateTimerDisplay() {
        const timeLeft = window.gameManager ? window.gameManager.getTimeLeft() : 60;
        
        // در نسخه واقعی باید متن را به‌روزرسانی کنیم
    }

    updateLevelDisplay() {
        const level = window.gameManager ? window.gameManager.getLevel() : 1;
        // در نسخه واقعی باید متن را به‌روزرسانی کنیم
    }

    updateConnectionsDisplay() {
        const connections = window.gameManager ? window.gameManager.getConnections() : { made: 0, needed: 10 };
        // در نسخه واقعی باید متن را به‌روزرسانی کنیم
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
            // به‌روزرسانی آیکون دکمه صدا
        }
    }

    showNotification(message, duration = 3000) {
        console.log('Notification:', message);
        // در نسخه کامل باید المان گرافیکی ایجاد شود
    }

    showGameOver(score, isNewRecord) {
        this.showScreen('gameOver');
        console.log('Game Over - Score:', score, 'New Record:', isNewRecord);
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
    }
}

window.UIManager = UIManager;
