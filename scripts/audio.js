// سیستم مدیریت صدا و موسیقی
class AudioSystem {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.music = null;
        this.currentMusic = null;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        
        this.init();
    }

    init() {
        this.createSounds();
        this.loadSettings();
        this.setupEventListeners();
    }

    createSounds() {
        // ایجاد صداهای پایه (با Web Audio API)
        this.sounds = {
            coinHit: this.createSound(800, 'square', 0.1, 0.2),
            coinCollect: this.createSound(1200, 'sine', 0.3, 0.3),
            specialCoin: this.createSound(1500, 'sine', 0.5, 0.5),
            bomb: this.createExplosionSound(),
            levelComplete: this.createSuccessSound(),
            achievement: this.createAchievementSound(),
            enemySpawn: this.createSound(400, 'sawtooth', 0.2, 0.2),
            playerMove: this.createSound(300, 'triangle', 0.1, 0.1),
            fuelLow: this.createSound(200, 'sine', 0.3, 1.0)
        };
    }

    createSound(frequency, type, duration, volume = 1.0) {
        return () => {
            if (!this.enabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = type;
                oscillator.frequency.value = frequency;
                
                gainNode.gain.value = volume * this.volume;
                
                oscillator.start();
                
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                oscillator.stop(audioContext.currentTime + duration);
                
            } catch (error) {
                console.warn('⚠️ Web Audio API پشتیبانی نمی‌شود:', error);
            }
        };
    }

    createExplosionSound() {
        return () => {
            if (!this.enabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
                
                gainNode.gain.setValueAtTime(0.8 * this.volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.8);
                
            } catch (error) {
                console.warn('⚠️ Web Audio API پشتیبانی نمی‌شود:', error);
            }
        };
    }

    createSuccessSound() {
        return () => {
            if (!this.enabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const times = [0, 0.1, 0.2, 0.3];
                const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                
                times.forEach((time, index) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.value = frequencies[index];
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.3 * this.volume, audioContext.currentTime + time + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + time + 0.3);
                    
                    oscillator.start(audioContext.currentTime + time);
                    oscillator.stop(audioContext.currentTime + time + 0.3);
                });
                
            } catch (error) {
                console.warn('⚠️ Web Audio API پشتیبانی نمی‌شود:', error);
            }
        };
    }

    createAchievementSound() {
        return () => {
            if (!this.enabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator1 = audioContext.createOscillator();
                const oscillator2 = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator1.type = 'sine';
                oscillator2.type = 'sine';
                oscillator1.frequency.value = 1000;
                oscillator2.frequency.value = 1500;
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.4 * this.volume, audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
                
                oscillator1.start();
                oscillator2.start();
                oscillator1.stop(audioContext.currentTime + 0.5);
                oscillator2.stop(audioContext.currentTime + 0.5);
                
            } catch (error) {
                console.warn('⚠️ Web Audio API پشتیبانی نمی‌شود:', error);
            }
        };
    }

    play(soundName) {
        if (this.sounds[soundName] && this.enabled) {
            this.sounds[soundName]();
        }
    }

    playMusic() {
        if (!this.enabled || !this.music) return;
        
        // اگر موسیقی در حال پخش است، متوقف کن
        if (this.currentMusic) {
            this.stopMusic();
        }
        
        // پخش موسیقی تصادفی از لیست
        const musicTracks = this.getMusicTracks();
        const randomTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)];
        this.currentMusic = randomTrack;
        
        // شبیه‌سازی پخش موسیقی (در نسخه واقعی با فایل‌های صوتی واقعی جایگزین شود)
        console.log('🎵 در حال پخش موسیقی:', randomTrack.name);
        
        // پخش موسیقی پس از 2 ثانیه
        setTimeout(() => {
            if (this.enabled && this.currentMusic === randomTrack) {
                this.playMusic(); // پخش ترک بعدی
            }
        }, randomTrack.duration * 1000);
    }

    stopMusic() {
        this.currentMusic = null;
        console.log('🎵 موسیقی متوقف شد');
    }

    getMusicTracks() {
        return [
            { name: "Space Odyssey", duration: 180 },
            { name: "Galactic Dreams", duration: 210 },
            { name: "Cosmic Journey", duration: 195 },
            { name: "Stellar Exploration", duration: 200 }
        ];
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        
        if (this.currentMusic) {
            // به‌روزرسانی حجم موسیقی در حال پخش
        }
    }

    toggleSound() {
        this.enabled = !this.enabled;
        this.saveSettings();
        
        if (!this.enabled) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
        
        UI.showMessage(this.enabled ? '🔊 صداها فعال شد' : '🔇 صداها غیرفعال شد');
        return this.enabled;
    }

    loadSettings() {
        const settings = Storage.getSettings();
        
        if (settings.audio !== undefined) {
            this.enabled = settings.audio;
        }
        if (settings.volume !== undefined) {
            this.volume = settings.volume;
        }
        if (settings.musicVolume !== undefined) {
            this.musicVolume = settings.musicVolume;
        }
    }

    saveSettings() {
        Storage.saveSettings({
            audio: this.enabled,
            volume: this.volume,
            musicVolume: this.musicVolume
        });
    }

    setupEventListeners() {
        // فعال کردن صدا پس از اولین تعامل کاربر
        document.addEventListener('click', this.enableAudio.bind(this), { once: true });
        document.addEventListener('touchstart', this.enableAudio.bind(this), { once: true });
    }

    enableAudio() {
        // این تابع برای رفع محدودیت اتوپلی مرورگرها است
        if (!this.enabled) return;
        
        // ایجاد یک صدا کوتاه برای فعال کردن context صدا
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 220;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.001, audioContext.currentTime + 0.001);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.002);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.002);
            
            console.log('🔊 سیستم صدا فعال شد');
            
        } catch (error) {
            console.warn('⚠️ فعال کردن سیستم صدا با خطا مواجه شد:', error);
        }
    }

    // افکت‌های صوتی پیشرفته
    playSpatialSound(soundName, x, y) {
        // پخش صدا با توجه به موقعیت در بازی (افکت استریو)
        if (!this.enabled) return;
        
        const playerX = Game.player.x;
        const playerY = Game.player.y;
        
        // محاسبه فاصله و جهت
        const dx = x - playerX;
        const dy = y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 1000;
        
        // تنظیم حجم بر اساس فاصله
        const distanceVolume = Math.max(0, 1 - (distance / maxDistance));
        
        if (distanceVolume > 0.1) {
            const pan = Math.max(-1, Math.min(1, dx / 500)); // -1 (چپ) تا 1 (راست)
            
            this.playSpatial(soundName, pan, distanceVolume);
        }
    }

    playSpatial(soundName, pan, volume) {
        // پیاده‌سازی پخش استریو (ساده شده)
        this.play(soundName);
    }

    // هشدار سوخت کم
    playLowFuelWarning() {
        if (this.enabled && Game.player.fuel < 20) {
            this.play('fuelLow');
        }
    }
}

// ایجاد نمونه سیستم صدا
const Audio = new AudioSystem();
