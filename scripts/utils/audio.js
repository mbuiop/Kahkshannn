class AdvancedAudio {
    constructor() {
        this.context = null;
        this.sounds = new Map();
        this.music = new Map();
        this.activeMusic = null;
        this.musicGain = null;
        this.soundGain = null;
        this.enabled = true;
        this.masterVolume = 0.8;
        this.musicVolume = 0.6;
        this.soundVolume = 0.7;
        
        this.init();
    }

    async init() {
        await this.createAudioContext();
        this.createSounds();
        this.createMusic();
        this.loadSettings();
        console.log('🔊 سیستم صوتی پیشرفته راه‌اندازی شد');
    }

    async createAudioContext() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // ایجاد نودهای volume
            this.masterGain = this.context.createGain();
            this.musicGain = this.context.createGain();
            this.soundGain = this.context.createGain();
            
            // اتصال نودها
            this.musicGain.connect(this.masterGain);
            this.soundGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);
            
            // تنظیم volume اولیه
            this.updateVolumes();
            
        } catch (error) {
            console.warn('Web Audio API پشتیبانی نمی‌شود:', error);
            this.enabled = false;
        }
    }

    createSounds() {
        // ایجاد صداهای بازی با Web Audio API
        this.sounds.set('engine', this.createEngineSound());
        this.sounds.set('laser', this.createLaserSound());
        this.sounds.set('explosion', this.createExplosionSound());
        this.sounds.set('coin_collect', this.createCoinSound());
        this.sounds.set('shield_hit', this.createShieldSound());
        this.sounds.set('mission_complete', this.createSuccessSound());
        this.sounds.set('warning', this.createWarningSound());
        this.sounds.set('button_click', this.createClickSound());
    }

    createEngineSound() {
        return () => {
            if (!this.enabled) return;
            
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.soundGain);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 80;
            
            gainNode.gain.value = 0.3 * this.soundVolume;
            
            // افکت low-pass برای صدای موتور
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 500;
            gainNode.connect(filter);
            filter.connect(this.soundGain);
            
            oscillator.start();
            
            // توقف تدریجی
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
            oscillator.stop(this.context.currentTime + 0.5);
        };
    }

    createLaserSound() {
        return () => {
            if (!this.enabled) return;
            
            const oscillator1 = this.context.createOscillator();
            const oscillator2 = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(this.soundGain);
            
            oscillator1.type = 'square';
            oscillator2.type = 'sawtooth';
            oscillator1.frequency.value = 800;
            oscillator2.frequency.value = 1200;
            
            gainNode.gain.value = 0.4 * this.soundVolume;
            
            // انیمیشن فرکانس
            oscillator1.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.2);
            oscillator2.frequency.exponentialRampToValueAtTime(300, this.context.currentTime + 0.2);
            
            oscillator1.start();
            oscillator2.start();
            
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);
            oscillator1.stop(this.context.currentTime + 0.3);
            oscillator2.stop(this.context.currentTime + 0.3);
        };
    }

    createExplosionSound() {
        return () => {
            if (!this.enabled) return;
            
            const bufferSize = this.context.sampleRate * 0.5;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);
            
            // تولید نویز برای انفجار
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }
            
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            const filter = this.context.createBiquadFilter();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(filter);
            filter.connect(this.soundGain);
            
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            gainNode.gain.value = 0.6 * this.soundVolume;
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 1.5);
            
            source.start();
        };
    }

    createCoinSound() {
        return () => {
            if (!this.enabled) return;
            
            const times = [0, 0.1, 0.2];
            const frequencies = [1046.50, 1318.51, 1567.98]; // C6, E6, G6
            
            times.forEach((time, index) => {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.soundGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.value = frequencies[index];
                
                gainNode.gain.setValueAtTime(0, this.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3 * this.soundVolume, this.context.currentTime + time + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + time + 0.3);
                
                oscillator.start(this.context.currentTime + time);
                oscillator.stop(this.context.currentTime + time + 0.3);
            });
        };
    }

    createMusic() {
        // ایجاد موسیقی زمینه (در نسخه واقعی با فایل‌های صوتی جایگزین شود)
        this.music.set('main_theme', this.createMainTheme());
        this.music.set('battle_theme', this.createBattleTheme());
        this.music.set('exploration_theme', this.createExplorationTheme());
        this.music.set('ending_theme', this.createEndingTheme());
    }

    createMainTheme() {
        // شبیه‌سازی موسیقی اصلی (با سینثسایزر)
        return {
            play: () => {
                if (!this.enabled) return null;
                
                // در نسخه واقعی، اینجا فایل صوتی پخش می‌شود
                console.log('🎵 در حال پخش موسیقی اصلی');
                return { stop: () => console.log('⏹️ موسیقی متوقف شد') };
            },
            duration: 180
        };
    }

    playMusic(trackName) {
        if (!this.enabled || !this.music.has(trackName)) return;
        
        // توقف موسیقی قبلی
        if (this.activeMusic) {
            this.activeMusic.stop();
        }
        
        this.activeMusic = this.music.get(trackName).play();
    }

    stopMusic() {
        if (this.activeMusic) {
            this.activeMusic.stop();
            this.activeMusic = null;
        }
    }

    play(soundName) {
        if (!this.enabled || !this.sounds.has(soundName)) return;
        
        const sound = this.sounds.get(soundName);
        sound();
    }

    playSpatial(soundName, x, y, z) {
        if (!this.enabled) return;
        
        // محاسبه volume بر اساس فاصله
        const distance = Math.sqrt(x * x + y * y + z * z);
        const maxDistance = 100;
        const volume = Math.max(0, 1 - distance / maxDistance) * this.soundVolume;
        
        if (volume > 0.1) {
            this.play(soundName);
        }
    }

    updateVolumes() {
        if (!this.context) return;
        
        this.masterGain.gain.value = this.masterVolume;
        this.musicGain.gain.value = this.musicVolume;
        this.soundGain.gain.value = this.soundVolume;
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.saveSettings();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.saveSettings();
    }

    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        this.saveSettings();
    }

    toggle() {
        this.enabled = !this.enabled;
        
        if (!this.enabled) {
            this.stopMusic();
        } else {
            this.playMusic('main_theme');
        }
        
        this.saveSettings();
        return this.enabled;
    }

    loadSettings() {
        const settings = Storage.getSettings();
        
        if (settings.audioEnabled !== undefined) {
            this.enabled = settings.audioEnabled;
        }
        if (settings.masterVolume !== undefined) {
            this.masterVolume = settings.masterVolume;
        }
        if (settings.musicVolume !== undefined) {
            this.musicVolume = settings.musicVolume;
        }
        if (settings.soundVolume !== undefined) {
            this.soundVolume = settings.soundVolume;
        }
        
        this.updateVolumes();
    }

    saveSettings() {
        Storage.saveSettings({
            audioEnabled: this.enabled,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            soundVolume: this.soundVolume
        });
    }

    // افکت‌های صوتی پیشرفته
    playEngineLoop() {
        if (!this.enabled) return;
        
        // ایجاد صدای موتور پیوسته
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        oscillator.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(this.soundGain);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 60;
        
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        gainNode.gain.value = 0.2 * this.soundVolume;
        
        oscillator.start();
        
        return {
            setSpeed: (speed) => {
                // تغییر صدا بر اساس سرعت
                oscillator.frequency.value = 60 + speed * 40;
                filter.frequency.value = 400 + speed * 200;
                gainNode.gain.value = (0.2 + speed * 0.1) * this.soundVolume;
            },
            stop: () => {
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
                setTimeout(() => oscillator.stop(), 500);
            }
        };
    }

    createReverb() {
        // ایجاد افکت reverb
        const convolver = this.context.createConvolver();
        // ... پیاده‌سازی convolution reverb
        return convolver;
    }

    createDelay() {
        // ایجاد افکت delay
        const delay = this.context.createDelay();
        const feedback = this.context.createGain();
        const wet = this.context.createGain();
        
        delay.delayTime.value = 0.3;
        feedback.gain.value = 0.5;
        wet.gain.value = 0.3;
        
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        
        return { input: delay, output: wet };
    }
}

const Audio = new AdvancedAudio();
