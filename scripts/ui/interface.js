class AdvancedInterface {
    constructor() {
        this.elements = new Map();
        this.animations = new Map();
        this.notifications = [];
        this.currentDialog = null;
        this.hudElements = new Map();
        
        this.init();
    }

    init() {
        this.createHUD();
        this.createMissionUI();
        this.createDialogSystem();
        this.setupAnimations();
        console.log('🎨 رابط کاربری پیشرفته راه‌اندازی شد');
    }

    createHUD() {
        // HUD اصلی بازی
        this.hudElements.set('fuelBar', this.createFuelBar());
        this.hudElements.set('shieldBar', this.createShieldBar());
        this.hudElements.set('speedometer', this.createSpeedometer());
        this.hudElements.set('radar', this.createRadar());
        this.hudElements.set('weaponStatus', this.createWeaponStatus());
        this.hudElements.set('missionTracker', this.createMissionTracker());
    }

    createFuelBar() {
        const container = document.createElement('div');
        container.className = 'hud-element fuel-bar';
        container.innerHTML = `
            <div class="hud-label">⛽ سوخت</div>
            <div class="bar-container">
                <div class="bar-background"></div>
                <div class="bar-fill" style="width: 100%"></div>
                <div class="bar-text">100%</div>
            </div>
        `;
        
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px 15px;
            border-radius: 10px;
            border: 2px solid #00ccff;
            color: white;
            font-family: Arial;
            min-width: 150px;
            backdrop-filter: blur(10px);
        `;
        
        document.getElementById('gameContainer').appendChild(container);
        return container;
    }

    createShieldBar() {
        const container = document.createElement('div');
        container.className = 'hud-element shield-bar';
        container.innerHTML = `
            <div class="hud-label">🛡️ محافظ</div>
            <div class="bar-container">
                <div class="bar-background"></div>
                <div class="bar-fill" style="width: 100%"></div>
                <div class="bar-text">100%</div>
            </div>
        `;
        
        container.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px 15px;
            border-radius: 10px;
            border: 2px solid #00ff88;
            color: white;
            font-family: Arial;
            min-width: 150px;
            backdrop-filter: blur(10px);
        `;
        
        document.getElementById('gameContainer').appendChild(container);
        return container;
    }

    createSpeedometer() {
        const container = document.createElement('div');
        container.className = 'hud-element speedometer';
        container.innerHTML = `
            <div class="hud-label">🚀 سرعت</div>
            <div class="speed-value">0 km/s</div>
            <div class="speed-gauge">
                <div class="gauge-fill" style="width: 0%"></div>
            </div>
        `;
        
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border-radius: 10px;
            border: 2px solid #ffaa00;
            color: white;
            font-family: Arial;
            text-align: center;
            min-width: 120px;
            backdrop-filter: blur(10px);
        `;
        
        document.getElementById('gameContainer').appendChild(container);
        return container;
    }

    createRadar() {
        const container = document.createElement('div');
        container.className = 'hud-element radar';
        container.innerHTML = `
            <div class="radar-title">📡 رادار</div>
            <div class="radar-display">
                <canvas class="radar-canvas" width="120" height="120"></canvas>
            </div>
        `;
        
        container.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 10px;
            border: 2px solid #ff4444;
            color: white;
            font-family: Arial;
            text-align: center;
            backdrop-filter: blur(10px);
        `;
        
        document.getElementById('gameContainer').appendChild(container);
        return container;
    }

    createMissionTracker() {
        const container = document.createElement('div');
        container.className = 'hud-element mission-tracker';
        container.innerHTML = `
            <div class="mission-title">🎯 ماموریت فعال</div>
            <div class="mission-name">-</div>
            <div class="objectives-list"></div>
            <div class="mission-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <div class="progress-text">0%</div>
            </div>
        `;
        
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            padding: 15px;
            border-radius: 10px;
            border: 2px solid #00ff88;
            color: white;
            font-family: Arial;
            min-width: 250px;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;
        
        document.getElementById('gameContainer').appendChild(container);
        return container;
    }

    updateHUD(playerData) {
        this.updateFuelBar(playerData.fuel, playerData.maxFuel);
        this.updateShieldBar(playerData.shield, playerData.maxShield);
        this.updateSpeedometer(playerData.speed);
        this.updateRadar(playerData.position, playerData.enemies, playerData.coins);
        this.updateMissionTracker();
    }

    updateFuelBar(current, max) {
        const element = this.hudElements.get('fuelBar');
        if (!element) return;
        
        const percent = (current / max) * 100;
        const fill = element.querySelector('.bar-fill');
        const text = element.querySelector('.bar-text');
        
        fill.style.width = percent + '%';
        text.textContent = Math.round(percent) + '%';
        
        // تغییر رنگ بر اساس سطح سوخت
        if (percent < 20) {
            fill.style.background = 'linear-gradient(90deg, #ff4444, #cc0000)';
            fill.style.animation = 'pulseWarning 0.5s infinite alternate';
        } else if (percent < 50) {
            fill.style.background = 'linear-gradient(90deg, #ffaa00, #ff5500)';
            fill.style.animation = 'none';
        } else {
            fill.style.background = 'linear-gradient(90deg, #00ccff, #0066ff)';
            fill.style.animation = 'none';
        }
    }

    updateShieldBar(current, max) {
        const element = this.hudElements.get('shieldBar');
        if (!element) return;
        
        const percent = (current / max) * 100;
        const fill = element.querySelector('.bar-fill');
        const text = element.querySelector('.bar-text');
        
        fill.style.width = percent + '%';
        text.textContent = Math.round(percent) + '%';
        
        // افکت محافظ
        if (percent < 30) {
            fill.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';
            element.style.borderColor = '#ff4444';
        } else {
            fill.style.background = 'linear-gradient(90deg, #00ff88, #00cc66)';
            element.style.borderColor = '#00ff88';
        }
    }

    updateSpeedometer(speed) {
        const element = this.hudElements.get('speedometer');
        if (!element) return;
        
        const valueElement = element.querySelector('.speed-value');
        const gaugeElement = element.querySelector('.gauge-fill');
        
        const kmh = Math.round(speed * 3600);
        valueElement.textContent = kmh + ' km/h';
        
        const gaugePercent = Math.min(speed / 50 * 100, 100);
        gaugeElement.style.width = gaugePercent + '%';
        
        // تغییر رنگ بر اساس سرعت
        if (speed > 40) {
            gaugeElement.style.background = 'linear-gradient(90deg, #ff4444, #cc0000)';
            valueElement.style.color = '#ff4444';
        } else if (speed > 20) {
            gaugeElement.style.background = 'linear-gradient(90deg, #ffaa00, #ff5500)';
            valueElement.style.color = '#ffaa00';
        } else {
            gaugeElement.style.background = 'linear-gradient(90deg, #00ccff, #0066ff)';
            valueElement.style.color = '#00ccff';
        }
    }

    updateRadar(playerPos, enemies, coins) {
        const element = this.hudElements.get('radar');
        if (!element) return;
        
        const canvas = element.querySelector('.radar-canvas');
        const ctx = canvas.getContext('2d');
        
        // پاک کردن کانواس
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // رسم دایره رادار
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(60, 60, 50, 0, Math.PI * 2);
        ctx.stroke();
        
        // رسم خطوط راهنما
        ctx.strokeStyle = '#00ff88';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(60, 10);
        ctx.lineTo(60, 110);
        ctx.moveTo(10, 60);
        ctx.lineTo(110, 60);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // رسم دشمنان
        enemies.forEach(enemy => {
            const dx = enemy.position.x - playerPos.x;
            const dz = enemy.position.z - playerPos.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 100) {
                const angle = Math.atan2(dx, dz);
                const radarX = 60 + Math.sin(angle) * (distance / 100 * 50);
                const radarY = 60 + Math.cos(angle) * (distance / 100 * 50);
                
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.arc(radarX, radarY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // رسم سکه‌ها
        coins.forEach(coin => {
            if (!coin.collected) {
                const dx = coin.position.x - playerPos.x;
                const dz = coin.position.z - playerPos.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < 100) {
                    const angle = Math.atan2(dx, dz);
                    const radarX = 60 + Math.sin(angle) * (distance / 100 * 50);
                    const radarY = 60 + Math.cos(angle) * (distance / 100 * 50);
                    
                    ctx.fillStyle = '#ffd700';
                    ctx.beginPath();
                    ctx.arc(radarX, radarY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
        
        // رسم موقعیت بازیکن (مرکز)
        ctx.fillStyle = '#00ccff';
        ctx.beginPath();
        ctx.arc(60, 60, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    updateMissionTracker() {
        const element = this.hudElements.get('missionTracker');
        if (!element) return;
        
        const mission = MissionSystem.currentMission;
        if (!mission) {
            element.style.display = 'none';
            return;
        }
        
        element.style.display = 'block';
        
        const missionName = element.querySelector('.mission-name');
        const objectivesList = element.querySelector('.objectives-list');
        const progressFill = element.querySelector('.progress-fill');
        const progressText = element.querySelector('.progress-text');
        
        missionName.textContent = mission.title;
        
        // به‌روزرسانی اهداف
        objectivesList.innerHTML = '';
        const objectives = MissionSystem.getCurrentObjectives();
        
        objectives.forEach(objective => {
            const objectiveElement = document.createElement('div');
            objectiveElement.className = `objective ${objective.completed ? 'completed' : ''}`;
            objectiveElement.innerHTML = `
                <span class="objective-status">${objective.completed ? '✅' : '⏳'}</span>
                <span class="objective-text">${objective.description}</span>
            `;
            
            objectiveElement.style.cssText = `
                margin: 5px 0;
                padding: 5px;
                border-radius: 5px;
                background: ${objective.completed ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                font-size: 12px;
                display: flex;
                align-items: center;
            `;
            
            objectivesList.appendChild(objectiveElement);
        });
        
        // به‌روزرسانی پیشرفت
        const progress = MissionSystem.getMissionProgress();
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }

    showNotification(text, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.textContent = text;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            border: 2px solid #00ccff;
            font-size: 16px;
            z-index: 1000;
            text-align: center;
            animation: notificationSlideIn 0.3s ease-out;
            backdrop-filter: blur(10px);
        `;
        
        document.getElementById('gameContainer').appendChild(notification);
        
        // حذف خودکار
        setTimeout(() => {
            notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    showDialog(dialogData, onComplete) {
        if (this.currentDialog) return;
        
        const dialog = document.createElement('div');
        dialog.className = 'game-dialog';
        
        let currentLine = 0;
        
        const showNextLine = () => {
            if (currentLine >= dialogData.length) {
                // اتمام دیالوگ
                dialog.style.animation = 'dialogSlideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (dialog.parentNode) {
                        dialog.remove();
                    }
                    this.currentDialog = null;
                    if (onComplete) onComplete();
                }, 300);
                return;
            }
            
            const line = dialogData[currentLine];
            
            dialog.innerHTML = `
                <div class="dialog-character">${line.character}</div>
                <div class="dialog-text">${line.text}</div>
                <div class="dialog-emotion">${this.getEmotionIcon(line.emotion)}</div>
                <div class="dialog-next">▶️ ادامه</div>
            `;
            
            dialog.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 20px;
                border-radius: 15px;
                border: 2px solid #00ccff;
                font-size: 16px;
                z-index: 1000;
                text-align: center;
                min-width: 400px;
                max-width: 600px;
                animation: dialogSlideIn 0.3s ease-out;
                backdrop-filter: blur(10px);
            `;
            
            document.getElementById('gameContainer').appendChild(dialog);
            
            // کلیک برای ادامه
            const nextButton = dialog.querySelector('.dialog-next');
            const autoAdvance = setTimeout(() => {
                currentLine++;
                showNextLine();
            }, line.duration);
            
            nextButton.addEventListener('click', () => {
                clearTimeout(autoAdvance);
                currentLine++;
                showNextLine();
            });
        };
        
        this.currentDialog = dialog;
        showNextLine();
    }

    getEmotionIcon(emotion) {
        const icons = {
            'friendly': '😊',
            'serious': '😐', 
            'determined': '💪',
            'relieved': '😅',
            'excited': '😃',
            'worried': '😟'
        };
        
        return icons[emotion] || '🗣️';
    }

    showCutscene(cutsceneData) {
        const cutscene = document.createElement('div');
        cutscene.className = 'game-cutscene';
        
        cutscene.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: Arial;
        `;
        
        let currentScene = 0;
        
        const showScene = () => {
            if (currentScene >= cutsceneData.scenes.length) {
                // اتمام کات‌سین
                cutscene.style.animation = 'fadeOut 0.5s ease-in forwards';
                setTimeout(() => {
                    if (cutscene.parentNode) {
                        cutscene.remove();
                    }
                }, 500);
                return;
            }
            
            const scene = cutsceneData.scenes[currentScene];
            
            cutscene.innerHTML = `
                <div class="cutscene-background" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: ${scene.background};
                    opacity: 0.3;
                "></div>
                <div class="cutscene-content" style="
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    max-width: 800px;
                    padding: 20px;
                ">
                    <h2 style="font-size: 2.5rem; margin-bottom: 20px; color: #00ccff;">
                        ${scene.title}
                    </h2>
                    <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 30px;">
                        ${scene.text}
                    </p>
                    <div style="font-size: 3rem; margin-bottom: 20px;">
                        ${scene.icon}
                    </div>
                    <button class="cutscene-next" style="
                        background: linear-gradient(45deg, #00ccff, #0066ff);
                        border: none;
                        padding: 12px 25px;
                        font-size: 1.1rem;
                        border-radius: 25px;
                        color: white;
                        cursor: pointer;
                        margin-top: 20px;
                    ">ادامه</button>
                </div>
            `;
            
            document.getElementById('gameContainer').appendChild(cutscene);
            
            const nextButton = cutscene.querySelector('.cutscene-next');
            nextButton.addEventListener('click', () => {
                currentScene++;
                showScene();
            });
        };
        
        showScene();
    }

    showMissionComplete(mission, reward) {
        const completeScreen = document.createElement('div');
        completeScreen.className = 'mission-complete';
        
        completeScreen.innerHTML = `
            <div class="completion-content" style="
                background: rgba(0, 0, 0, 0.95);
                padding: 40px;
                border-radius: 20px;
                border: 3px solid #00ff88;
                text-align: center;
                color: white;
                max-width: 500px;
                backdrop-filter: blur(20px);
            ">
                <h2 style="font-size: 2rem; color: #00ff88; margin-bottom: 20px;">
                    🎉 ماموریت تکمیل شد!
                </h2>
                <h3 style="font-size: 1.5rem; margin-bottom: 15px;">
                    ${mission.title}
                </h3>
                <p style="font-size: 1.1rem; margin-bottom: 25px; line-height: 1.5;">
                    ${mission.description}
                </p>
                
                <div class="rewards" style="
                    background: rgba(0, 255, 136, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                ">
                    <h4 style="color: #00ff88; margin-bottom: 15px;">🏆 پاداش‌ها</h4>
                    <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                        <div class="reward-item">
                            <div>💰</div>
                            <div>${reward.coins} سکه</div>
                        </div>
                        <div class="reward-item">
                            <div>⛽</div>
                            <div>${reward.fuel} سوخت</div>
                        </div>
                        <div class="reward-item">
                            <div>🔓</div>
                            <div>${this.getUnlockName(reward.unlock)}</div>
                        </div>
                    </div>
                </div>
                
                <button class="continue-button" style="
                    background: linear-gradient(45deg, #00ccff, #0066ff);
                    border: none;
                    padding: 15px 30px;
                    font-size: 1.2rem;
                    border-radius: 25px;
                    color: white;
                    cursor: pointer;
                    margin-top: 20px;
                ">ادامه ماجرا</button>
            </div>
        `;
        
        completeScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1500;
            animation: fadeIn 0.5s ease-out;
        `;
        
        document.getElementById('gameContainer').appendChild(completeScreen);
        
        const continueButton = completeScreen.querySelector('.continue-button');
        continueButton.addEventListener('click', () => {
            completeScreen.style.animation = 'fadeOut 0.5s ease-in forwards';
            setTimeout(() => {
                if (completeScreen.parentNode) {
                    completeScreen.remove();
                }
            }, 500);
        });
    }

    getUnlockName(unlockId) {
        const names = {
            'basic_weapons': 'سلاح پایه',
            'shield_generator': 'ژنراتور محافظ',
            'warp_drive': 'درایو وارپ', 
            'galaxy_hero': 'قهرمان کهکشان'
        };
        
        return names[unlockId] || 'آیتم جدید';
    }

    setupAnimations() {
        // تعریف انیمیشن‌های CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -40%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
            
            @keyframes notificationSlideOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
            }
            
            @keyframes dialogSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            @keyframes dialogSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
            }
            
            @keyframes pulseWarning {
                from { opacity: 1; }
                to { opacity: 0.5; }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        
        document.head.appendChild(style);
    }
}

const UI = new AdvancedInterface();
