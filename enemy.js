// support.js - سیستم پشتیبانی و بهینه‌سازی
console.log('🛠️ سیستم پشتیبانی بارگذاری شد');

class GameSupportSystem {
    constructor() {
        this.performanceMonitor = null;
        this.memoryManager = null;
        this.errorHandler = null;
        this.audioManager = null;
        this.isInitialized = false;
    }

    initialize() {
        console.log('🛠️ راه‌اندازی سیستم پشتیبانی...');
        
        this.setupPerformanceMonitor();
        this.setupMemoryManager();
        this.setupErrorHandler();
        this.setupAudioManager();
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ سیستم پشتیبانی راه‌اندازی شد');
    }

    setupPerformanceMonitor() {
        this.performanceMonitor = {
            fps: 0,
            frameCount: 0,
            lastFpsUpdate: performance.now(),
            performanceMode: 'high',
            isMonitoring: false,
            
            start: () => {
                this.performanceMonitor.isMonitoring = true;
                this.performanceMonitor.lastFpsUpdate = performance.now();
                this.updateFPS();
                console.log('📊 مانیتورینگ عملکرد فعال شد');
            },
            
            updateFPS: () => {
                if (!this.performanceMonitor.isMonitoring) return;
                
                this.performanceMonitor.frameCount++;
                const now = performance.now();
                
                if (now - this.performanceMonitor.lastFpsUpdate >= 1000) {
                    this.performanceMonitor.fps = Math.round(
                        (this.performanceMonitor.frameCount * 1000) / 
                        (now - this.performanceMonitor.lastFpsUpdate)
                    );
                    this.performanceMonitor.frameCount = 0;
                    this.performanceMonitor.lastFpsUpdate = now;
                    
                    this.adjustPerformance();
                }
                
                requestAnimationFrame(() => this.performanceMonitor.updateFPS());
            },
            
            adjustPerformance: () => {
                const oldMode = this.performanceMonitor.performanceMode;
                const fps = this.performanceMonitor.fps;
                
                if (fps < 30) {
                    this.performanceMonitor.performanceMode = 'low';
                } else if (fps < 45) {
                    this.performanceMonitor.performanceMode = 'medium';
                } else {
                    this.performanceMonitor.performanceMode = 'high';
                }
                
                if (oldMode !== this.performanceMonitor.performanceMode) {
                    console.log(`🎯 حالت عملکرد: ${this.performanceMonitor.performanceMode} (FPS: ${fps})`);
                    this.applyPerformanceSettings();
                }
            },
            
            applyPerformanceSettings: () => {
                const mode = this.performanceMonitor.performanceMode;
                
                switch(mode) {
                    case 'low':
                        this.reduceGraphicsQuality();
                        break;
                    case 'medium':
                        this.setMediumGraphicsQuality();
                        break;
                    case 'high':
                        this.setHighGraphicsQuality();
                        break;
                }
            },
            
            stop: () => {
                this.performanceMonitor.isMonitoring = false;
            }
        };
    }

    reduceGraphicsQuality() {
        // کاهش کیفیت گرافیک برای عملکرد بهتر
        if (window.gameEngine && window.gameEngine.scene) {
            const scene = window.gameEngine.scene;
            
            // کاهش کیفیت سایه‌ها
            scene.shadowsEnabled = false;
            
            // کاهش کیفیت ذرات
            if (window.gameEngine.engineParticles) {
                window.gameEngine.engineParticles.emitRate = 500;
            }
            
            console.log('🔻 کیفیت گرافیک کاهش یافت');
        }
    }

    setMediumGraphicsQuality() {
        // تنظیمات گرافیک متوسط
        if (window.gameEngine && window.gameEngine.scene) {
            const scene = window.gameEngine.scene;
            
            scene.shadowsEnabled = true;
            
            if (window.gameEngine.engineParticles) {
                window.gameEngine.engineParticles.emitRate = 800;
            }
            
            console.log('🔸 کیفیت گرافیک متوسط');
        }
    }

    setHighGraphicsQuality() {
        // تنظیمات گرافیک بالا
        if (window.gameEngine && window.gameEngine.scene) {
            const scene = window.gameEngine.scene;
            
            scene.shadowsEnabled = true;
            
            if (window.gameEngine.engineParticles) {
                window.gameEngine.engineParticles.emitRate = 1000;
            }
            
            console.log('🔹 کیفیت گرافیک بالا');
        }
    }

    setupMemoryManager() {
        this.memoryManager = {
            cleanupInterval: null,
            objectPool: new Map(),
            
            start: () => {
                this.memoryManager.cleanupInterval = setInterval(() => {
                    this.memoryManager.cleanup();
                }, 30000); // هر 30 ثانیه
                
                console.log('🧹 مدیریت حافظه فعال شد');
            },
            
            cleanup: () => {
                let cleanedCount = 0;
                const now = Date.now();
                
                // پاک‌سازی المان‌های قدیمی
                for (const [key, item] of this.memoryManager.objectPool) {
                    if (now - item.lastUsed > 60000) { // 1 دقیقه
                        this.memoryManager.disposeObject(item.object);
                        this.memoryManager.objectPool.delete(key);
                        cleanedCount++;
                    }
                }
                
                if (cleanedCount > 0) {
                    console.log(`🧹 حافظه پاک‌سازی شد: ${cleanedCount} المان`);
                }
                
                // پاک‌سازی گلوله‌های قدیمی
                this.cleanupOldBullets();
            },
            
            disposeObject: (object) => {
                if (object && typeof object.dispose === 'function') {
                    object.dispose();
                }
            },
            
            addToPool: (key, object) => {
                this.memoryManager.objectPool.set(key, {
                    object: object,
                    lastUsed: Date.now()
                });
            },
            
            stop: () => {
                if (this.memoryManager.cleanupInterval) {
                    clearInterval(this.memoryManager.cleanupInterval);
                }
            }
        };
    }

    cleanupOldBullets() {
        // پاک‌سازی گلوله‌های قدیمی
        if (window.gameEngine && window.gameEngine.bullets) {
            const now = Date.now();
            for (let i = window.gameEngine.bullets.length - 1; i >= 0; i--) {
                const bullet = window.gameEngine.bullets[i];
                if (bullet.createTime && now - bullet.createTime > 10000) { // 10 ثانیه
                    bullet.dispose();
                    window.gameEngine.bullets.splice(i, 1);
                }
            }
        }
    }

    setupErrorHandler() {
        this.errorHandler = {
            setup: () => {
                // مدیریت خطاهای جهانی
                window.addEventListener('error', (event) => {
                    this.handleGlobalError(event.error);
                });
                
                // مدیریت Promiseهای رد شده
                window.addEventListener('unhandledrejection', (event) => {
                    console.error('❌ Promise رد شده:', event.reason);
                    this.handlePromiseRejection(event.reason);
                });
                
                console.log('🚨 سیستم مدیریت خطا فعال شد');
            },
            
            handleGlobalError: (error) => {
                console.error('💥 خطای جهانی:', error);
                
                // نمایش پیام خطا به کاربر
                this.showErrorMessage('خطایی در بازی رخ داده است. بازی تلاش می‌کند به حالت عادی بازگردد.');
                
                // بازیابی از خطا
                this.recoverFromError();
            },
            
            handlePromiseRejection: (reason) => {
                console.error('🔻 Promise رد شده:', reason);
                // می‌توانید اقدامات خاصی برای بازیابی انجام دهید
            },
            
            showErrorMessage: (message) => {
                // ایجاد المان پیام خطا
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(255, 0, 0, 0.9);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 10px;
                    z-index: 10000;
                    text-align: center;
                    max-width: 80%;
                    box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
                    animation: slideIn 0.3s ease-out;
                `;
                
                errorDiv.innerHTML = `
                    <h3 style="margin: 0 0 8px 0;">⚠️ خطا</h3>
                    <p style="margin: 0;">${message}</p>
                `;
                
                document.body.appendChild(errorDiv);
                
                // حذف خودکار پس از 5 ثانیه
                setTimeout(() => {
                    if (errorDiv.parentNode) {
                        errorDiv.parentNode.removeChild(errorDiv);
                    }
                }, 5000);
            },
            
            recoverFromError: () => {
                // بازیابی از خطا
                try {
                    if (window.gameEngine && window.gameEngine.gameState === 'playing') {
                        // ذخیره وضعیت فعلی
                        this.autoSave();
                        
                        // راه‌اندازی مجدد سیستم‌ها
                        setTimeout(() => {
                            this.restartGameSystems();
                        }, 1000);
                    }
                } catch (e) {
                    console.error('❌ خطا در بازیابی:', e);
                }
            }
        };
    }

    setupAudioManager() {
        this.audioManager = {
            sounds: new Map(),
            music: null,
            isMuted: false,
            volume: 0.7,
            
            initialize: () => {
                // پیش‌بارگذاری صداها
                this.preloadSounds();
                console.log('🎵 سیستم صوتی راه‌اندازی شد');
            },
            
            preloadSounds: () => {
                const soundFiles = {
                    laser: 'sounds/laser.mp3',
                    explosion: 'sounds/explosion.mp3',
                    coin: 'sounds/coin.mp3',
                    enemyLaser: 'sounds/enemy-laser.mp3',
                    powerup: 'sounds/powerup.mp3'
                };
                
                Object.entries(soundFiles).forEach(([key, url]) => {
                    this.loadSound(key, url);
                });
            },
            
            loadSound: async (key, url) => {
                try {
                    const audio = new Audio();
                    audio.preload = 'auto';
                    audio.src = url;
                    
                    this.audioManager.sounds.set(key, audio);
                    console.log(`🔊 صدا بارگذاری شد: ${key}`);
                } catch (error) {
                    console.warn(`⚠️ خطا در بارگذاری صدا ${key}:`, error);
                }
            },
            
            playSound: (key, volume = 1.0) => {
                if (this.audioManager.isMuted || !this.audioManager.sounds.has(key)) return;
                
                try {
                    const sound = this.audioManager.sounds.get(key).cloneNode();
                    sound.volume = this.audioManager.volume * volume;
                    sound.play().catch(e => {
                        console.log(`🔇 پخش صدا ${key} ناموفق:`, e);
                    });
                } catch (error) {
                    console.error(`❌ خطا در پخش صدا ${key}:`, error);
                }
            },
            
            playMusic: (url, volume = 0.5) => {
                if (this.audioManager.music) {
                    this.audioManager.music.pause();
                    this.audioManager.music.currentTime = 0;
                }
                
                this.audioManager.music = new Audio(url);
                this.audioManager.music.loop = true;
                this.audioManager.music.volume = this.audioManager.volume * volume;
                
                this.audioManager.music.play().catch(e => {
                    console.log('🔇 پخش موسیقی ناموفق:', e);
                });
            },
            
            stopMusic: () => {
                if (this.audioManager.music) {
                    this.audioManager.music.pause();
                    this.audioManager.music.currentTime = 0;
                }
            },
            
            setVolume: (volume) => {
                this.audioManager.volume = Math.max(0, Math.min(1, volume));
                
                if (this.audioManager.music) {
                    this.audioManager.music.volume = this.audioManager.volume * 0.5;
                }
            },
            
            mute: () => {
                this.audioManager.isMuted = true;
                if (this.audioManager.music) {
                    this.audioManager.music.volume = 0;
                }
            },
            
            unmute: () => {
                this.audioManager.isMuted = false;
                if (this.audioManager.music) {
                    this.audioManager.music.volume = this.audioManager.volume * 0.5;
                }
            }
        };
    }

    setupEventListeners() {
        // مدیریت تغییر اندازه پنجره
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // مدیریت visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // مدیریت قبل از بسته شدن صفحه
        window.addEventListener('beforeunload', (event) => {
            this.handleBeforeUnload(event);
        });
        
        // مدیریت خطاهای شبکه
        window.addEventListener('online', () => {
            console.log('🌐 اتصال اینترنت برقرار شد');
        });
        
        window.addEventListener('offline', () => {
            console.warn('🔌 اتصال اینترنت قطع شد');
            this.showErrorMessage('اتصال اینترنت قطع شده است. برخی ویژگی‌ها ممکن است کار نکنند.');
        });
    }

    handleResize() {
        // بهینه‌سازی برای اندازه‌های مختلف صفحه
        if (window.gameEngine && window.gameEngine.engine) {
            window.gameEngine.engine.resize();
        }
        
        // تنظیم مجدد HUD برای اندازه جدید
        this.adjustHUDForScreenSize();
    }

    adjustHUDForScreenSize() {
        const width = window.innerWidth;
        const hudItems = document.querySelectorAll('.hud-item');
        
        if (width < 768) {
            // تنظیمات برای موبایل
            hudItems.forEach(item => {
                item.style.fontSize = '0.9rem';
                item.style.padding = '8px 15px';
            });
        } else {
            // تنظیمات برای دسکتاپ
            hudItems.forEach(item => {
                item.style.fontSize = '1.1rem';
                item.style.padding = '12px 20px';
            });
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // بازی در پس‌زمینه است
            console.log('⚫ بازی به پس‌زمینه رفت');
            this.pauseGame();
        } else {
            // بازی به پیش‌زمینه بازگشته
            console.log('🟢 بازی به پیش‌زمینه بازگشت');
            this.resumeGame();
        }
    }

    pauseGame() {
        if (window.gameEngine && window.gameEngine.gameState === 'playing') {
            // ذخیره وضعیت فعلی
            this.autoSave();
            
            // توقف موسیقی
            if (this.audioManager) {
                this.audioManager.stopMusic();
            }
            
            // توقف انیمیشن‌ها
            if (window.gameEngine.engineParticles) {
                window.gameEngine.engineParticles.stop();
            }
            
            console.log('⏸️ بازی مکث شد');
        }
    }

    resumeGame() {
        if (window.gameEngine && window.gameEngine.gameState === 'playing') {
            // ادامه موسیقی
            if (this.audioManager) {
                this.audioManager.playMusic();
            }
            
            // ادامه انیمیشن‌ها
            if (window.gameEngine.engineParticles) {
                window.gameEngine.engineParticles.start();
            }
            
            console.log('▶️ بازی ادامه یافت');
        }
    }

    handleBeforeUnload(event) {
        if (window.gameEngine && window.gameEngine.gameState === 'playing') {
            // ذخیره نهایی
            this.autoSave();
            
            // نمایش هشدار
            event.preventDefault();
            event.returnValue = 'آیا مطمئن هستید که می‌خواهید صفحه را ترک کنید؟ پیشرفت بازی شما ذخیره خواهد شد.';
            return event.returnValue;
        }
    }

    autoSave() {
        // ذخیره خودکار وضعیت بازی
        try {
            const saveData = {
                score: window.gameEngine?.score || 0,
                playerHealth: window.gameEngine?.playerHealth || 100,
                playerFuel: window.gameEngine?.playerFuel || 100,
                difficulty: window.enemyManager?.difficultyLevel || 1,
                timestamp: Date.now()
            };
            
            localStorage.setItem('galacticAutoSave', JSON.stringify(saveData));
            console.log('💾 ذخیره خودکار انجام شد');
        } catch (error) {
            console.error('❌ خطا در ذخیره خودکار:', error);
        }
    }

    restartGameSystems() {
        // راه‌اندازی مجدد سیستم‌های بازی پس از خطا
        console.log('🔄 راه‌اندازی مجدد سیستم‌ها...');
        
        if (window.gameEngine) {
            window.gameEngine.clearScene();
        }
        
        if (window.enemyManager) {
            window.enemyManager.clearEnemies();
        }
        
        // راه‌اندازی مجدد
        setTimeout(() => {
            if (window.gameEngine) {
                window.gameEngine.startGameplay();
            }
        }, 1000);
    }

    showPerformanceStats() {
        // نمایش آمار عملکرد (برای دیباگ)
        const stats = `
        🎮 آمار عملکرد:
        • FPS: ${this.performanceMonitor?.fps || 0}
        • حالت: ${this.performanceMonitor?.performanceMode || 'unknown'}
        • تعداد دشمنان: ${window.enemyManager?.enemies.length || 0}
        • تعداد گلوله‌ها: ${window.gameEngine?.bullets.length || 0}
        • تعداد سکه‌ها: ${window.gameEngine?.coins.length || 0}
        `;
        
        console.log(stats);
    }

    start() {
        if (!this.isInitialized) {
            this.initialize();
        }
        
        // شروع مانیتورینگ
        this.performanceMonitor.start();
        this.memoryManager.start();
        this.errorHandler.setup();
        this.audioManager.initialize();
        
        // نمایش آمار هر 10 ثانیه
        setInterval(() => {
            this.showPerformanceStats();
        }, 10000);
    }

    stop() {
        // توقف تمام سیستم‌ها
        this.performanceMonitor.stop();
        this.memoryManager.stop();
        
        if (this.audioManager.music) {
            this.audioManager.stopMusic();
        }
    }
}

// ایجاد نمونه سیستم پشتیبانی
window.gameSupport = new GameSupportSystem();

// راه‌اندازی خودکار
window.addEventListener('load', () => {
    setTimeout(() => {
        window.gameSupport.start();
    }, 2000);
});

console.log('✅ سیستم پشتیبانی آماده است!');

// تابع‌های کمکی جهانی
window.debugGame = function() {
    console.log('🐛 حالت دیباگ فعال شد');
    
    if (window.gameEngine) {
        console.log('=== وضعیت بازی ===');
        console.log('حالت بازی:', window.gameEngine.gameState);
        console.log('امتیاز:', window.gameEngine.score);
        console.log('سلامت:', window.gameEngine.playerHealth);
        console.log('سوخت:', window.gameEngine.playerFuel);
        console.log('سلاح:', window.gameEngine.currentWeapon);
    }
    
    if (window.enemyManager) {
        console.log('=== وضعیت دشمنان ===');
        console.log('تعداد دشمنان:', window.enemyManager.enemies.length);
        console.log('سطح سختی:', window.enemyManager.difficultyLevel);
        console.log('نابود شده:', window.enemyManager.destroyedCount);
    }
    
    if (window.gameSupport) {
        window.gameSupport.showPerformanceStats();
    }
};

window.addScore = function(points) {
    if (window.gameEngine) {
        window.gameEngine.score += points;
        console.log(`⭐ ${points} امتیاز اضافه شد!`);
    }
};

window.godMode = function() {
    if (window.gameEngine) {
        window.gameEngine.playerHealth = 9999;
        window.gameEngine.playerFuel = 9999;
        console.log('🦸 حالت خدا فعال شد!');
    }
};
