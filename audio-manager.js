// مدیر صوتی پیشرفته
class AudioManager {
    static init() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.masterVolume = 0.7;
        this.soundEnabled = true;
        
        this.createAudioContext();
        this.loadSounds();
    }
    
    static createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('مرورگر شما از Web Audio API پشتیبانی نمی‌کند:', error);
            this.soundEnabled = false;
        }
    }
    
    static loadSounds() {
        if (!this.soundEnabled) return;
        
        // ایجاد صداهای مصنوعی با Web Audio API
        this.sounds.coin = this.createCoinSound();
        this.sounds.bomb = this.createBombSound();
        this.sounds.levelComplete = this.createLevelCompleteSound();
        this.sounds.engine = this.createEngineSound();
    }
    
    static createCoinSound() {
        return {
            play: () => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }
        };
    }
    
    static createBombSound() {
        return {
            play: () => {
                // ایجاد نویز برای انفجار
                const bufferSize = this.audioContext.sampleRate * 0.5;
                const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                const output = buffer.getChannelData(0);
                
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                
                const noise = this.audioContext.createBufferSource();
                noise.buffer = buffer;
                
                const filter = this.audioContext.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
                
                const gainNode = this.audioContext.createGain();
                gainNode.gain.setValueAtTime(0.5 * this.masterVolume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                
                noise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                noise.start(this.audioContext.currentTime);
                noise.stop(this.audioContext.currentTime + 0.5);
            }
        };
    }
    
    static createLevelCompleteSound() {
        return {
            play: () => {
                // ایجاد آکورد شاد برای اتمام مرحله
                const frequencies = [523.25, 659.25, 783.99]; // C, E, G
                
                frequencies.forEach((freq, index) => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 0.1 + index * 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1 + index * 0.1);
                    
                    oscillator.start(this.audioContext.currentTime + index * 0.05);
                    oscillator.stop(this.audioContext.currentTime + 1 + index * 0.1);
                });
            }
        };
    }
    
    static createEngineSound() {
        return {
            play: () => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime);
                
                oscillator.start(this.audioContext.currentTime);
                
                // برگرداندن کنترل برای توقف صدا
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                        oscillator.stop(this.audioContext.currentTime + 0.5);
                    }
                };
            }
        };
    }
    
    static createBackgroundMusic() {
        // ایجاد موسیقی پس‌زمینه با Web Audio API
        return {
            play: () => {
                // ایجاد یک ملودی فضایی ساده
                const sequence = [
                    { note: 523.25, duration: 0.5 }, // C
                    { note: 587.33, duration: 0.5 }, // D
                    { note: 659.25, duration: 0.5 }, // E
                    { note: 698.46, duration: 0.5 }, // F
                    { note: 783.99, duration: 0.5 }, // G
                    { note: 880.00, duration: 0.5 }, // A
                    { note: 987.77, duration: 0.5 }, // B
                    { note: 1046.50, duration: 0.5 } // C
                ];
                
                let currentTime = this.audioContext.currentTime;
                
                sequence.forEach((step, index) => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(step.note, currentTime);
                    
                    gainNode.gain.setValueAtTime(0, currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1 * this.masterVolume, currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + step.duration);
                    
                    oscillator.start(currentTime);
                    oscillator.stop(currentTime + step.duration);
                    
                    currentTime += step.duration;
                });
                
                // تکرار موسیقی پس از اتمام
                setTimeout(() => {
                    if (this.backgroundMusic) {
                        this.createBackgroundMusic().play();
                    }
                }, currentTime - this.audioContext.currentTime);
            },
            
            stop: () => {
                // توقف موسیقی
            }
        };
    }
    
    static playBackgroundMusic() {
        if (!this.soundEnabled) return;
        
        this.backgroundMusic = this.createBackgroundMusic();
        this.backgroundMusic.play();
    }
    
    static stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.stop();
            this.backgroundMusic = null;
        }
    }
    
    static playCoinSound() {
        if (!this.soundEnabled) return;
        this.sounds.coin.play();
    }
    
    static playBombSound() {
        if (!this.soundEnabled) return;
        this.sounds.bomb.play();
    }
    
    static playLevelCompleteSound() {
        if (!this.soundEnabled) return;
        this.sounds.levelComplete.play();
    }
    
    static setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    static toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        if (!this.soundEnabled) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        
        return this.soundEnabled;
    }
}

// ایجاد نمونه جهانی از مدیر صوتی
window.AudioManager = AudioManager;
