// سیستم رابط کاربری
class UISystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupUIElements();
    }

    setupUIElements() {
        // هیچ setup خاصی نیاز نیست - المان‌ها در HTML تعریف شده‌اند
    }

    showGameUI() {
        // نمایش المان‌های رابط کاربری بازی
        document.querySelector('.fuel-indicator').style.display = 'block';
        document.getElementById('bombButton').style.display = 'block';
        document.getElementById('bombTimer').style.display = 'block';
        document.getElementById('miniMap').style.display = 'block';
        document.querySelector('.touch-controls').style.display = 'block';
    }

    hideGameUI() {
        // مخفی کردن المان‌های رابط کاربری بازی
        document.querySelector('.fuel-indicator').style.display = 'none';
        document.getElementById('bombButton').style.display = 'none';
        document.getElementById('bombTimer').style.display = 'none';
        document.getElementById('safeTimeIndicator').style.display = 'none';
        document.getElementById('miniMap').style.display = 'none';
        document.querySelector('.touch-controls').style.display = 'none';
    }

    updateGameUI(fuel, bombCooldown, safeTime) {
        // به‌روزرسانی نشانگر سوخت
        this.updateFuelIndicator(fuel);
        
        // به‌روزرسانی تایمر بمب
        this.updateBombTimer(bombCooldown);
        
        // به‌روزرسانی زمان امن
        this.updateSafeTimeIndicator(safeTime);
    }

    updateFuelIndicator(fuel) {
        const indicator = document.querySelector('.fuel-indicator');
        if (indicator) {
            indicator.textContent = `⛽ سوخت: ${Math.round(fuel)}%`;
            
            // تغییر رنگ بر اساس سطح سوخت
            if (fuel < 20) {
                indicator.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
                indicator.style.animation = 'fuelCritical 0.5s infinite alternate';
            } else if (fuel < 50) {
                indicator.style.background = 'linear-gradient(45deg, #ffaa00, #ff5500)';
                indicator.style.animation = 'fuelWarning 1s infinite alternate';
            } else {
                indicator.style.background = 'rgba(0, 0, 0, 0.8)';
                indicator.style.animation = 'fuelPulse 2s infinite';
            }
        }
    }

    updateBombTimer(bombCooldown) {
        const timer = document.getElementById('bombTimer');
        const button = document.getElementById('bombButton');
        
        if (timer && button) {
            if (bombCooldown > 0) {
                const seconds = Math.ceil(bombCooldown / 60);
                timer.textContent = `بمب: ${seconds}s`;
                button.disabled = true;
                button.style.opacity = '0.5';
            } else {
                timer.textContent = `بمب: آماده!`;
                button.disabled = false;
                button.style.opacity = '1';
                button.style.animation = 'bombReady 1s infinite alternate';
            }
        }
    }

    updateSafeTimeIndicator(safeTime) {
        const indicator = document.getElementById('safeTimeIndicator');
        if (indicator) {
            if (safeTime > 0) {
                const seconds = Math.ceil(safeTime / 60);
                indicator.textContent = `زمان امن: ${seconds}s`;
                indicator.style.display = 'block';
                indicator.style.animation = 'safeTimeGlow 1s infinite alternate';
            } else {
                indicator.style.display = 'none';
            }
        }
    }

    updateMiniMap(player, enemies, coins) {
        const mapContent = document.querySelector('.map-content');
        if (!mapContent) return;
        
        // پاکسازی نقشه
        mapContent.innerHTML = '';
        
        // اضافه کردن بازیکن
        const playerMap = document.createElement('div');
        playerMap.className = 'map-player';
        playerMap.style.left = '50%';
        playerMap.style.top = '50%';
        mapContent.appendChild(playerMap);
        
        // اضافه کردن دشمنان
        enemies.forEach(enemy => {
            const enemyMap = this.createMapElement(enemy, player, 'map-enemy');
            if (enemyMap) {
                mapContent.appendChild(enemyMap);
            }
        });
        
        // اضافه کردن سکه‌ها
        coins.forEach(coin => {
            if (!coin.collected) {
                const coinMap = this.createMapElement(coin, player, 'map-coin');
                if (coinMap) {
                    mapContent.appendChild(coinMap);
                }
            }
        });
    }

    createMapElement(entity, player, className) {
        const relX = ((entity.x - player.x) / 1500) * 50 + 50;
        const relY = ((entity.y - player.y) / 1500) * 50 + 50;
        
        // فقط اگر در محدوده نقشه باشد
        if (relX >= 0 && relX <= 100 && relY >= 0 && relY <= 100) {
            const element = document.createElement('div');
            element.className = className;
            element.style.left = relX + '%';
            element.style.top = relY + '%';
            return element;
        }
        return null;
    }

    showPlayerIndicator() {
        const indicator = document.getElementById('playerIndicator');
        if (indicator) {
            indicator.style.display = 'block';
            indicator.style.animation = 'fadeOut 3s forwards';
            
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 3000);
        }
    }

    showLevelComplete(level) {
        const levelComplete = document.getElementById('levelComplete');
        const completedLevel = document.getElementById('completedLevel');
        
        if (levelComplete && completedLevel) {
            completedLevel.textContent = level;
            levelComplete.classList.add('active');
            
            // پخش صدا
            if (Audio.enabled) {
                Audio.play('levelComplete');
            }
        }
    }

    hideLevelComplete() {
        const levelComplete = document.getElementById('levelComplete');
        if (levelComplete) {
            levelComplete.classList.remove('active');
        }
    }

    showMessage(text, duration = 3000) {
        const message = document.createElement('div');
        message.className = 'game-message';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            border: 2px solid #00ccff;
            font-size: 1.2rem;
            z-index: 100;
            text-align: center;
            animation: messageFade 3s forwards;
        `;
        
        document.getElementById('gameContainer').appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, duration);
    }

    updateMainStats() {
        // به‌روزرسانی آمار صفحه اصلی
        document.getElementById('highScore').textContent = localStorage.getItem('highScore') || '0';
        document.getElementById('highLevel').textContent = localStorage.getItem('highLevel') || '1';
        document.getElementById('totalCoinsCollected').textContent = localStorage.getItem('totalCoins') || '0';
        document.getElementById('achievementsCount').textContent = '0/100';
    }

    // توابع نمایش مودال
    showAchievements() {
        this.showMessage('سیستم مدال‌ها به زودی اضافه می‌شود! 🏆');
    }
    
    showInstructions() {
        const instructions = `
            راهنمای بازی کهکشان بی‌نهایت:
            
            🎯 هدف: جمع‌آوری تمام سکه‌های هر مرحله
            
            🕹️ کنترل‌ها:
            • موس: حرکت سفینه
            • لمسی: استفاده از جویستیک
            • بمب: نابودی دشمنان (cooldown: 10s)
            
            ⚡ قدرت‌ها:
            • سکه‌ها: +8% سوخت
            • سکه‌های ویژه: پاداش‌های خاص
            
            🌋 خطرات:
            • برخورد با آتشفشان = از دست دادن مرحله
            • اتمام سوخت = پایان بازی
            
            موفق باشید! 🚀
        `;
        alert(instructions);
    }
    
    showManagement() {
        this.showMessage('مدیریت بازی کهکشان بی‌نهایت\n\nنسخه 2.0 - طراحی ماژولار\n\nتوسعه داده شده با معماری مدرن بازی‌های فضایی ✨');
    }

    // نمایش نوار پیشرفت
    showProgressBar(duration, text = 'در حال بارگذاری...') {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress-text">${text}</div>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        
        progressContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #00ccff;
            z-index: 1000;
            text-align: center;
            min-width: 300px;
        `;
        
        document.getElementById('gameContainer').appendChild(progressContainer);
        
        const progressFill = progressContainer.querySelector('.progress-fill');
        let startTime = null;
        
        const animateProgress = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            progressFill.style.width = (progress * 100) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animateProgress);
            } else {
                setTimeout(() => {
                    if (progressContainer.parentNode) {
                        progressContainer.remove();
                    }
                }, 500);
            }
        };
        
        requestAnimationFrame(animateProgress);
    }
}

// ایجاد نمونه رابط کاربری
const UI = new UISystem();
