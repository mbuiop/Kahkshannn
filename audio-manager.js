// audio-manager.js - مدیریت صدا و موسیقی بازی
class AudioManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.activeSounds = new Map();
        
        this.masterVolume = 0.8;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;
        this.isMuted = false;
        
        this.currentMusic = null;
        
        this.init();
    }

    async init() {
        await this.setupAudioContext();
        this.createSoundBank();
        this.loadMusicTracks();
        this.setupEventListeners();
        
        console.log('Audio Manager initialized successfully');
    }

    async setupAudioContext() {
        try {
            // ایجاد AudioContext
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // ایجاد نودهای Gain
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // اتصال نودها
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // تنظیم حجم اولیه
            this.updateVolumes();
            
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.createFallbackAudioSystem();
        }
    }

    createFallbackAudioSystem() {
        console.log('Using fallback audio system');
        this.fallbackAudio = true;
    }

    updateVolumes() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, now);
        this.musicGain.gain.setValueAtTime(this.musicVolume, now);
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
    }

    createSoundBank() {
        // ایجاد صداهای مصنوعی برای بازی
        this.sounds.set('click', this.createClickSound());
        this.sounds.set('select', this.createSelectSound());
        this.sounds.set('match', this.createMatchSound());
        this.sounds.set('success', this.createSuccessSound());
        this.sounds.set('error', this.createErrorSound());
        this.sounds.set('powerup', this.createPowerUpSound());
        this.sounds.set('explosion', this.createExplosionSound());
    }

    // تولید صداهای مصنوعی
    createClickSound() {
        return () => {
            this.playTone(800, 0.1, 'sine', 0.1);
        };
    }

    createSelectSound() {
        return () => {
            this.playTone(600, 0.2, 'sine', 0.15);
            setTimeout(() => {
                this.playTone(800, 0.1, 'sine', 0.2);
            }, 100);
        };
    }

    createMatchSound() {
        return () => {
            // آرپژ موفقیت
            const notes = [523.25, 659.25, 783.99];
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.15, 'sine', 0.2);
                }, index * 80);
            });
        };
    }

    createSuccessSound() {
        return () => {
            const fanfare = [
                {freq: 523.25, duration: 0.3},
                {freq: 659.25, duration: 0.2},
                {freq: 783.99, duration: 0.2},
                {freq: 1046.50, duration: 0.5}
            ];
            
            fanfare.forEach((note, index) => {
                setTimeout(() => {
                    this.playTone(note.freq, note.duration, 'sine', 0.25);
                }, index * 200);
            });
        };
    }

    createErrorSound() {
        return () => {
            this.playTone(200, 0.3, 'sawtooth', 0.3);
            setTimeout(() => {
                this.playTone(150, 0.2, 'sawtooth', 0.4);
            }, 200);
        };
    }

    createPowerUpSound() {
        return () => {
            // افکت سوییپ بالا رونده
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const freq = 200 + (i * 100);
                    this.playTone(freq, 0.1, 'sine', 0.1);
                }, i * 50);
            }
        };
    }

    createExplosionSound() {
        return () => {
            // نویز انفجار
            this.playNoise(0.3, 0.5);
            
            // تن پایین برای بم
            this.playTone(80, 0.4, 'sine', 0.3);
        };
    }

    // موسیقی‌های بازی
    loadMusicTracks() {
        this.musicTracks.set('menu', this.createMenuMusic());
        this.musicTracks.set('game', this.createGameMusic());
        this.musicTracks.set('gameover', this.createGameOverMusic());
    }

    createMenuMusic() {
        return {
            play: () => this.playMenuMusic(),
            stop: () => this.stopCurrentMusic()
        };
    }

    createGameMusic() {
        return {
            play: () => this.playGameMusic(),
            stop: () => this.stopCurrentMusic()
        };
    }

    createGameOverMusic() {
        return {
            play: () => this.playGameOverMusic(),
            stop: () => this.stopCurrentMusic()
        };
    }

    // اجرای موسیقی‌ها
    async playMenuMusic() {
        if (this.currentMusic === 'menu') return;
        
        await this.crossfadeToMusic('menu', () => {
            // ملودی آرام برای منو
            this.playChordProgression([
                [261.63, 329.63, 392.00],
                [293.66, 369.99, 440.00],
                [329.63, 415.30, 493.88],
                [349.23, 440.00, 523.25]
            ], 2, 0.2);
        });
    }

    async playGameMusic() {
        if (this.currentMusic === 'game') return;
        
        await this.crossfadeToMusic('game', () => {
            // موسیقی ریتمیک برای بازی
            this.playBassline([65.41, 73.42, 82.41, 87.31], 0.5);
            this.playMelody([523.25, 587.33, 659.25, 698.46, 783.99, 880.00], 2, 0.15);
        });
    }

    async playGameOverMusic() {
        await this.crossfadeToMusic('gameover', () => {
            // موسیقی غمگین برای پایان بازی
            const sadProgression = [
                [261.63, 311.13, 392.00],
                [277.18, 329.63, 415.30],
                [293.66, 349.23, 440.00],
                [311.13, 369.99, 466.16]
            ];

            this.playChordProgression(sadProgression, 3, 0.25);
        });
    }

    // سیستم پخش موسیقی
    async crossfadeToMusic(trackName, playFunction) {
        const oldMusic = this.currentMusic;
        this.currentMusic = trackName;
        
        // fade out موسیقی قبلی
        if (oldMusic) {
            await this.fadeOutMusic();
        }
        
        // fade in موسیقی جدید
        await this.fadeInMusic(playFunction);
    }

    async fadeOutMusic() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        this.musicGain.gain.exponentialRampToValueAtTime(0.001, now + 1);
        
        await new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
        
        // توقف تمام نوت‌های فعال
        this.stopAllMusicNotes();
    }

    async fadeInMusic(playFunction) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        this.musicGain.gain.setValueAtTime(0.001, now);
        this.musicGain.gain.exponentialRampToValueAtTime(this.musicVolume, now + 1);
        
        // شروع پخش موسیقی جدید
        if (playFunction) {
            playFunction();
        }
    }

    stopCurrentMusic() {
        this.stopAllMusicNotes();
        this.currentMusic = null;
    }

    stopAllMusicNotes() {
        // توقف تمام نوت‌های موسیقی فعال
        this.activeSounds.forEach((sound, id) => {
            if (id.startsWith('music_')) {
                if (sound.stop) {
                    sound.stop();
                }
                this.activeSounds.delete(id);
            }
        });
    }

    // سیستم تولید موسیقی
    playChordProgression(chords, durationPerChord, volume) {
        if (!this.audioContext || this.isMuted) return;
        
        const chordInterval = setInterval(() => {
            if (this.currentMusic !== 'menu' && this.currentMusic !== 'game') {
                clearInterval(chordInterval);
                return;
            }
            
            chords.forEach((chord, chordIndex) => {
                setTimeout(() => {
                    chord.forEach(freq => {
                        this.playMusicNote(freq, durationPerChord, 'sine', volume / chord.length);
                    });
                }, chordIndex * durationPerChord * 1000);
            });
            
        }, chords.length * durationPerChord * 1000);
        
        this.activeSounds.set('chord_progression', { stop: () => clearInterval(chordInterval) });
    }

    playBassline(notes, duration) {
        if (!this.audioContext || this.isMuted) return;
        
        const bassInterval = setInterval(() => {
            if (this.currentMusic !== 'game') {
                clearInterval(bassInterval);
                return;
            }
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playMusicNote(freq, duration, 'sine', 0.3);
                }, index * duration * 1000);
            });
            
        }, notes.length * duration * 1000);
        
        this.activeSounds.set('bassline', { stop: () => clearInterval(bassInterval) });
    }

    playMelody(notes, duration, volume) {
        if (!this.audioContext || this.isMuted) return;
        
        const melodyInterval = setInterval(() => {
            if (this.currentMusic !== 'game') {
                clearInterval(melodyInterval);
                return;
            }
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playMusicNote(freq, duration * 0.8, 'sine', volume);
                }, index * duration * 1000);
            });
            
        }, notes.length * duration * 1000);
        
        this.activeSounds.set('melody', { stop: () => clearInterval(melodyInterval) });
    }

    // متدهای اصلی پخش صدا
    playSound(soundName, params = {}) {
        if (this.isMuted || !this.sounds.has(soundName)) return;
        
        const sound = this.sounds.get(soundName);
        if (typeof sound === 'function') {
            sound(params);
        }
    }

    playMusicNote(frequency, duration, type = 'sine', volume = 1.0) {
        if (!this.audioContext || this.isMuted) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.value = volume * this.musicVolume;
        
        // انvelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.musicVolume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        const soundId = `music_note_${Date.now()}`;
        this.activeSounds.set(soundId, {
            stop: () => {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            }
        });
        
        // تمیز کردن خودکار
        oscillator.onended = () => {
            this.activeSounds.delete(soundId);
            oscillator.disconnect();
            gainNode.disconnect();
        };
        
        return soundId;
    }

    playTone(frequency, duration, type = 'sine', volume = 1.0) {
        if (!this.audioContext || this.isMuted) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.value = volume * this.sfxVolume;
        
        // انvelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        const soundId = `tone_${Date.now()}`;
        this.activeSounds.set(soundId, {
            stop: () => {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            }
        });
        
        // تمیز کردن خودکار
        oscillator.onended = () => {
            this.activeSounds.delete(soundId);
            oscillator.disconnect();
            gainNode.disconnect();
        };
        
        return soundId;
    }

    playNoise(duration, volume = 1.0) {
        if (!this.audioContext || this.isMuted) return null;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // تولید نویز سفید
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        // فیلتر برای نویز
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        
        gainNode.gain.value = volume * this.sfxVolume;
        
        // انvelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        source.start(now);
        source.stop(now + duration);
        
        const soundId = `noise_${Date.now()}`;
        this.activeSounds.set(soundId, {
            stop: () => {
                source.stop();
                source.disconnect();
                gainNode.disconnect();
                filter.disconnect();
            }
        });
        
        // تمیز کردن خودکار
        source.onended = () => {
            this.activeSounds.delete(soundId);
            source.disconnect();
            gainNode.disconnect();
            filter.disconnect();
        };
        
        return soundId;
    }

    // مدیریت صدا
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setSoundVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    mute() {
        this.isMuted = true;
        this.updateVolumes();
    }

    unmute() {
        this.isMuted = false;
        this.updateVolumes();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateVolumes();
        return this.isMuted;
    }

    // رویدادها
    setupEventListeners() {
        // بازیابی AudioContext پس از تعامل کاربر
        document.addEventListener('click', async () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
        });
    }

    // متدهای کمکی
    stopSound(soundId) {
        const sound = this.activeSounds.get(soundId);
        if (sound && sound.stop) {
            sound.stop();
            this.activeSounds.delete(soundId);
        }
    }

    stopAllSounds() {
        this.activeSounds.forEach((sound, id) => {
            if (sound.stop) {
                sound.stop();
            }
        });
        this.activeSounds.clear();
    }

    getAudioState() {
        return {
            muted: this.isMuted,
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            soundVolume: this.sfxVolume,
            currentMusic: this.currentMusic,
            contextState: this.audioContext ? this.audioContext.state : 'unsupported'
        };
    }

    dispose() {
        this.stopAllSounds();
        this.stopCurrentMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.sounds.clear();
        this.musicTracks.clear();
        this.activeSounds.clear();
    }
}

window.AudioManager = AudioManager;
