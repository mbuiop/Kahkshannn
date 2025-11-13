class UiManager {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;
        this.advancedTexture = null;
        this.isMenuOpen = false;
        this.currentSelectedBuilding = null;
        
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
            
            this.createTopHUD();
            this.createBottomBuildMenu();
            this.createGameMenu();
            
        } catch (error) {
            console.error('Error initializing UI:', error);
        }
    }

    createTopHUD() {
        if (!this.advancedTexture) return;

        try {
            // پنل منابع - بالای صفحه مثل کلش
            const resourcePanel = new BABYLON.GUI.Rectangle();
            resourcePanel.width = "350px";
            resourcePanel.height = "70px";
            resourcePanel.cornerRadius = 35;
            resourcePanel.background = "rgba(0,0,0,0.7)";
            resourcePanel.thickness = 2;
            resourcePanel.color = "gold";
            resourcePanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            resourcePanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            resourcePanel.top = "20px";
            this.advancedTexture.addControl(resourcePanel);

            // کانتینر برای منابع
            const resourceContainer = new BABYLON.GUI.StackPanel();
            resourceContainer.isVertical = false;
            resourceContainer.width = "100%";
            resourceContainer.height = "100%";
            resourceContainer.paddingLeft = "20px";
            resourceContainer.paddingRight = "20px";
            resourcePanel.addControl(resourceContainer);

            // طلا
            const goldPanel = this.createResourcePanel("💰", "1000", "gold");
            resourceContainer.addControl(goldPanel);

            // اکسیر
            const elixirPanel = this.createResourcePanel("⚗️", "1000", "#e52e71");
            resourceContainer.addControl(elixirPanel);

            // جواهر
            const gemPanel = this.createResourcePanel("💎", "50", "#00ff88");
            resourceContainer.addControl(gemPanel);

        } catch (error) {
            console.error('Error creating top HUD:', error);
        }
    }

    createResourcePanel(icon, initialValue, color) {
        const panel = new BABYLON.GUI.StackPanel();
        panel.isVertical = false;
        panel.width = "100px";
        panel.height = "60px";
        panel.paddingLeft = "5px";
        panel.paddingRight = "5px";

        // آیکون
        const iconText = new BABYLON.GUI.TextBlock();
        iconText.text = icon;
        iconText.width = "30px";
        iconText.fontSize = "20px";
        iconText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.addControl(iconText);

        // مقدار
        const valueText = new BABYLON.GUI.TextBlock();
        valueText.text = initialValue;
        valueText.color = color;
        valueText.width = "60px";
        valueText.fontSize = "16px";
        valueText.fontWeight = "bold";
        valueText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(valueText);

        // ذخیره کردن رفرنس
        if (color === "gold") this.goldText = valueText;
        else if (color === "#e52e71") this.elixirText = valueText;
        else if (color === "#00ff88") this.gemText = valueText;

        return panel;
    }

    createBottomBuildMenu() {
        if (!this.advancedTexture) return;

        try {
            // منوی ساخت - پایین صفحه مثل کلش
            const buildPanel = new BABYLON.GUI.Rectangle();
            buildPanel.width = "500px";
            buildPanel.height = "80px";
            buildPanel.cornerRadius = 40;
            buildPanel.background = "rgba(0,0,0,0.8)";
            buildPanel.thickness = 2;
            buildPanel.color = "silver";
            buildPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            buildPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            buildPanel.bottom = "20px";
            this.advancedTexture.addControl(buildPanel);

            // کانتینر دکمه‌ها
            const buttonContainer = new BABYLON.GUI.StackPanel();
            buttonContainer.isVertical = false;
            buttonContainer.width = "90%";
            buttonContainer.height = "90%";
            buildPanel.addControl(buttonContainer);

            // دکمه‌های اصلی ساخت
            const mainBuildings = [
                { type: 'townhall', icon: '🏛️', name: 'سالن شهر', cost: 0 },
                { type: 'mine', icon: '⛏️', name: 'معدن طلا', cost: 150 },
                { type: 'barracks', icon: '⚔️', name: 'سربازخانه', cost: 200 },
                { type: 'wall', icon: '🧱', name: 'دیوار', cost: 50 }
            ];

            mainBuildings.forEach(building => {
                const button = this.createBuildButton(building);
                buttonContainer.addControl(button);
            });

            // دکمه بیشتر (برای ساختمان‌های دفاعی)
            const moreButton = this.createMoreButton();
            buttonContainer.addControl(moreButton);

        } catch (error) {
            console.error('Error creating build menu:', error);
        }
    }

    createBuildButton(building) {
        const button = BABYLON.GUI.Button.CreateSimpleButton(building.type, building.icon);
        button.width = "60px";
        button.height = "60px";
        button.color = "white";
        button.background = "rgba(74, 107, 172, 0.9)";
        button.cornerRadius = 30;
        button.thickness = 2;
        button.paddingTop = "5px";
        button.fontSize = "24px";
        button.marginLeft = "5px";
        button.marginRight = "5px";
        
        // افکت hover
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(94, 127, 192, 1)";
            this.showBuildingTooltip(button, building);
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(74, 107, 172, 0.9)";
            this.hideTooltip();
        });
        
        button.onPointerClickObservable.add(() => {
            if (this.game.buildingSystem) {
                this.currentSelectedBuilding = building.type;
                this.game.buildingSystem.startBuildingPlacement(building.type);
                this.showNotification(`ساخت ${building.name} انتخاب شد`, "info");
            }
        });
        
        return button;
    }

    createMoreButton() {
        const button = BABYLON.GUI.Button.CreateSimpleButton("more", "⋯");
        button.width = "60px";
        button.height = "60px";
        button.color = "white";
        button.background = "rgba(100, 100, 100, 0.9)";
        button.cornerRadius = 30;
        button.thickness = 2;
        button.fontSize = "28px";
        button.fontWeight = "bold";
        button.marginLeft = "5px";
        button.marginRight = "5px";
        
        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(120, 120, 120, 1)";
        });
        
        button.onPointerOutObservable.add(() => {
            button.background = "rgba(100, 100, 100, 0.9)";
        });
        
        button.onPointerClickObservable.add(() => {
            this.showDefenseBuildingsMenu();
        });
        
        return button;
    }

    showDefenseBuildingsMenu() {
        // منوی ساختمان‌های دفاعی
        const defenseBuildings = [
            { type: 'cannon', icon: '💣', name: 'توپخانه', cost: 250 },
            { type: 'archertower', icon: '🏹', name: 'برج کماندار', cost: 300 }
        ];

        let message = "ساختمان‌های دفاعی:\n";
        defenseBuildings.forEach(building => {
            message += `${building.icon} ${building.name} - ${building.cost} طلا\n`;
        });

        this.showNotification(message, "info");
    }

    createGameMenu() {
        if (!this.advancedTexture) return;

        try {
            // دکمه منو - گوشه بالا چپ
            const menuButton = BABYLON.GUI.Button.CreateImageOnlyButton("menu", "");
            menuButton.width = "50px";
            menuButton.height = "50px";
            menuButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            menuButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            menuButton.left = "15px";
            menuButton.top = "15px";
            menuButton.background = "rgba(0,0,0,0.7)";
            menuButton.cornerRadius = 25;
            menuButton.thickness = 2;
            menuButton.color = "white";
            
            // ایجاد آیکون منو با متن
            const menuIcon = new BABYLON.GUI.TextBlock();
            menuIcon.text = "☰";
            menuIcon.color = "white";
            menuIcon.fontSize = "20px";
            menuButton.addControl(menuIcon);
            
            this.advancedTexture.addControl(menuButton);

            // پنل منو (مخفی)
            this.menuPanel = new BABYLON.GUI.Rectangle();
            this.menuPanel.width = "280px";
            this.menuPanel.height = "350px";
            this.menuPanel.cornerRadius = 20;
            this.menuPanel.background = "rgba(0,0,0,0.95)";
            this.menuPanel.thickness = 3;
            this.menuPanel.color = "gold";
            this.menuPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            this.menuPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.menuPanel.isVisible = false;
            this.advancedTexture.addControl(this.menuPanel);

            // محتوای منو
            const menuContent = new BABYLON.GUI.StackPanel();
            menuContent.width = "90%";
            menuContent.height = "90%";
            this.menuPanel.addControl(menuContent);

            // عنوان منو
            const menuTitle = new BABYLON.GUI.TextBlock();
            menuTitle.text = "تنظیمات بازی";
            menuTitle.color = "gold";
            menuTitle.fontSize = 22;
            menuTitle.height = "50px";
            menuTitle.paddingTop = "10px";
            menuContent.addControl(menuTitle);

            // آیتم‌های منو
            const menuItems = [
                { text: "ادامه بازی", action: () => this.toggleMenu() },
                { text: "ذخیره بازی", action: () => this.saveGame() },
                { text: "بارگذاری بازی", action: () => this.loadGame() },
                { text: "دستاوردها", action: () => this.showAchievements() },
                { text: "راهنما", action: () => this.showHelp() },
                { text: "خروج از بازی", action: () => this.exitGame() }
            ];

            menuItems.forEach(item => {
                const button = BABYLON.GUI.Button.CreateSimpleButton("menu_" + item.text, item.text);
                button.width = "240px";
                button.height = "40px";
                button.color = "white";
                button.background = "rgba(255,255,255,0.1)";
                button.cornerRadius = 8;
                button.paddingTop = "5px";
                button.fontSize = "16px";
                button.marginTop = "8px";
                
                button.onPointerEnterObservable.add(() => {
                    button.background = "rgba(255,255,255,0.2)";
                });
                
                button.onPointerOutObservable.add(() => {
                    button.background = "rgba(255,255,255,0.1)";
                });
                
                button.onPointerClickObservable.add(() => {
                    item.action();
                });
                
                menuContent.addControl(button);
            });

            // دکمه بستن منو
            const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeMenu", "✕");
            closeButton.width = "30px";
            closeButton.height = "30px";
            closeButton.background = "red";
            closeButton.color = "white";
            closeButton.cornerRadius = 15;
            closeButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            closeButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
            closeButton.top = "10px";
            closeButton.right = "10px";
            this.menuPanel.addControl(closeButton);

            closeButton.onPointerClickObservable.add(() => {
                this.toggleMenu();
            });

            // باز/بسته کردن منو
            menuButton.onPointerClickObservable.add(() => {
                this.toggleMenu();
            });

        } catch (error) {
            console.error('Error creating game menu:', error);
        }
    }

    showBuildingTooltip(button, building) {
        if (!this.advancedTexture) return;

        this.hideTooltip();

        this.tooltip = new BABYLON.GUI.Rectangle();
        this.tooltip.width = "180px";
        this.tooltip.height = "80px";
        this.tooltip.cornerRadius = 10;
        this.tooltip.background = "rgba(0,0,0,0.9)";
        this.tooltip.thickness = 1;
        this.tooltip.color = "white";
        this.tooltip.linkOffsetY = -70;
        this.advancedTexture.addControl(this.tooltip);

        const tooltipContent = new BABYLON.GUI.StackPanel();
        tooltipContent.width = "90%";
        tooltipContent.height = "90%";
        this.tooltip.addControl(tooltipContent);

        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = building.name;
        nameText.color = "gold";
        nameText.fontSize = "16px";
        nameText.height = "25px";
        tooltipContent.addControl(nameText);

        const costText = new BABYLON.GUI.TextBlock();
        costText.text = `هزینه: ${building.cost} طلا`;
        costText.color = "white";
        costText.fontSize = "14px";
        costText.height = "20px";
        tooltipContent.addControl(costText);

        const descText = new BABYLON.GUI.TextBlock();
        descText.text = "برای ساخت کلیک کنید";
        descText.color = "lightgreen";
        descText.fontSize = "12px";
        descText.height = "18px";
        tooltipContent.addControl(descText);

        this.tooltip.linkWithMesh(button._linkedMesh);
    }

    hideTooltip() {
        if (this.tooltip) {
            this.advancedTexture.removeControl(this.tooltip);
            this.tooltip = null;
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.menuPanel.isVisible = this.isMenuOpen;
        
        // مکث بازی هنگام باز بودن منو
        if (this.game.engine) {
            this.game.engine.scene.pauseAnimation = this.isMenuOpen;
        }
    }

    updateResourceDisplay(resources) {
        if (this.goldText) this.goldText.text = resources.gold || "1000";
        if (this.elixirText) this.elixirText.text = resources.elixir || "1000";
        if (this.gemText) this.gemText.text = resources.gem || "50";
    }

    // عملیات منو
    saveGame() {
        this.showNotification("پیشرفت بازی ذخیره شد! 💾", "success");
        this.toggleMenu();
    }

    loadGame() {
        this.showNotification("بازی بارگذاری شد! 📂", "success");
        this.toggleMenu();
    }

    showAchievements() {
        this.showNotification("سیستم دستاوردها به زودی... 🏆", "info");
        this.toggleMenu();
    }

    showHelp() {
        this.showNotification("راهنما:\n• کلیک برای ساخت ساختمان\n• ESC برای منو\n• دوربین: ماوس + اسکرول", "info");
        this.toggleMenu();
    }

    exitGame() {
        if (confirm("آیا می‌خواهید از بازی خارج شوید؟")) {
            window.close();
        }
    }

    showNotification(message, type = 'info') {
        const colors = {
            error: '#ff6b6b',
            success: '#51cf66',
            info: '#339af0',
            warning: '#ffd43b'
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
            font-size: 14px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            border: 2px solid rgba(255,255,255,0.3);
            max-width: 300px;
            white-space: pre-line;
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
