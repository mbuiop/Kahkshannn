// audio-manager.js - مدیریت صدا و موسیقی بازی
class AudioManager {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.ambienceGain = null;
        
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.activeSounds = new Map();
        this.audioBuffers = new Map();
        
        this.masterVolume = 0.8;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;
        this.ambienceVolume = 0.4;
        this.isMuted = false;
        
        this.currentMusic = null;
        this.musicLoop = true;
        this.crossfadeDuration = 2000;
        
        this.audioAnalyser = null;
        this.audioData = null;
        
        this.init();
    }

    async init() {
        await this.setupAudioContext();
        this.createSoundBank();
        this.loadMusicTracks();
        this.setupAudioAnalyser();
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
            this.ambienceGain = this.audioContext.createGain();
            
            // اتصال نودها
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.ambienceGain.connect(this.masterGain);
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
        // سیستم ساده برای مرورگرهایی که Web Audio API را پشتیبانی نمی‌کنند
        this.fallbackAudio = true;
    }

    updateVolumes() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, now);
        this.musicGain.gain.setValueAtTime(this.musicVolume, now);
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
        this.ambienceGain.gain.setValueAtTime(this.ambienceVolume, now);
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
        this.sounds.set('combo', this.createComboSound());
        this.sounds.set('levelup', this.createLevelUpSound());
        this.sounds.set('gameover', this.createGameOverSound());
        this.sounds.set('hint', this.createHintSound());
        this.sounds.set('shuffle', this.createShuffleSound());
        this.sounds.set('countdown', this.createCountdownSound());
        this.sounds.set('victory', this.createVictorySound());
        
        // صداهای محیطی
        this.sounds.set('ambient1', this.createAmbientSound1());
        this.sounds.set('ambient2', this.createAmbientSound2());
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
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
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
                {freq: 523.25, duration: 0.3}, // C5
                {freq: 659.25, duration: 0.2}, // E5
                {freq: 783.99, duration: 0.2}, // G5
                {freq: 1046.50, duration: 0.5}  // C6
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

    createComboSound() {
        return (comboCount) => {
            const baseFreq = 400;
            for (let i = 0; i < comboCount; i++) {
                setTimeout(() => {
                    const freq = baseFreq + (i * 100);
                    this.playTone(freq, 0.2, 'sine', 0.15);
                }, i * 80);
            }
        };
    }

    createLevelUpSound() {
        return () => {
            const levelUpNotes = [
                523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
                987.77, 880.00, 783.99, 659.25    // B5, A5, G5, E5
            ];

            levelUpNotes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.3, 'sine', 0.2);
                }, index * 150);
            });
        };
    }

    createGameOverSound() {
        return () => {
            const sadNotes = [523.25, 493.88, 440.00, 392.00]; // C5, B4, A4, G4
            sadNotes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.4, 'sine', 0.2);
                }, index * 300);
            });
        };
    }

    createHintSound() {
        return () => {
            this.playTone(1000, 0.2, 'sine', 0.15);
            setTimeout(() => {
                this.playTone(1200, 0.3, 'sine', 0.2);
            }, 200);
        };
    }

    createShuffleSound() {
        return () => {
            // صدای به هم زدن کارت
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    this.playNoise(0.1, 0.1);
                }, i * 100);
            }
        };
    }

    createCountdownSound() {
        return () => {
            this.playTone(800, 0.1, 'sine', 0.3);
        };
    }

    createVictorySound() {
        return () => {
            const victoryNotes = [
                523.25, 659.25, 783.99, 1046.50, 1318.51, // C5, E5, G5, C6, E6
                1174.66, 1046.50, 987.77, 880.00          // D6, C6, B5, A5
            ];

            victoryNotes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.4, 'sine', 0.25);
                }, index * 200);
            });
        };
    }

    createAmbientSound1() {
        return () => {
            // صدای محیطی آرام
            this.playAmbientPad(150, 0.3, 'sine', 0.1);
        };
    }

    createAmbientSound2() {
        return () => {
            // صدای محیطی پویا
            this.playAmbientPad(120, 0.4, 'triangle', 0.08);
        };
    }

    // موسیقی‌های بازی
    loadMusicTracks() {
        this.musicTracks.set('menu', this.createMenuMusic());
        this.musicTracks.set('game', this.createGameMusic());
        this.musicTracks.set('boss', this.createBossMusic());
        this.musicTracks.set('victory', this.createVictoryMusic());
        this.musicTracks.set('gameover', this.createGameOverMusic());
    }

    createMenuMusic() {
        return {
            play: () => this.playMenuMusic(),
            stop: () => this.stopCurrentMusic(),
            duration: 0, // لوپ
            bpm: 90
        };
    }

    createGameMusic() {
        return {
            play: () => this.playGameMusic(),
            stop: () => this.stopCurrentMusic(),
            duration: 0,
            bpm: 120
        };
    }

    createBossMusic() {
        return {
            play: () => this.playBossMusic(),
            stop: () => this.stopCurrentMusic(),
            duration: 0,
            bpm: 140
        };
    }

    createVictoryMusic() {
        return {
            play: () => this.playVictoryMusic(),
            stop: () => this.stopCurrentMusic(),
            duration: 30000, // 30 ثانیه
            bpm: 100
        };
    }

    createGameOverMusic() {
        return {
            play: () => this.playGameOverMusic(),
            stop: () => this.stopCurrentMusic(),
            duration: 20000, // 20 ثانیه
            bpm: 60
        };
    }

    // اجرای موسیقی‌ها
    async playMenuMusic() {
        if (this.currentMusic === 'menu') return;
        
        await this.crossfadeToMusic('menu', () => {
            // ملودی آرام برای منو
            this.playChordProgression([
                [261.63, 329.63, 392.00], // C, E, G
                [293.66, 369.99, 440.00], // D, F#, A
                [329.63, 415.30, 493.88], // E, G#, B
                [349.23, 440.00, 523.25]  // F, A, C
            ], 2, 0.2);
        });
    }

    async playGameMusic() {
        if (this.currentMusic === 'game') return;
        
        await this.crossfadeToMusic('game', () => {
            // موسیقی ریتمیک برای بازی
            this.playBassline([65.41, 73.42, 82.41, 87.31], 0.5); // C2, D2, G2, F2
            this.playMelody([523.25, 587.33, 659.25, 698.46, 783.99, 880.00], 2, 0.15);
        });
    }

    async playBossMusic() {
        if (this.currentMusic === 'boss') return;
        
        await this.crossfadeToMusic('boss', () => {
            // موسیقی دراماتیک برای مرحله باس
            this.playDarkChordProgression([
                [130.81, 164.81, 196.00], // C3, E3, G3
                [146.83, 185.00, 220.00], // D3, F#3, A3
                [164.81, 207.65, 246.94], // E3, G#3, B3
                [174.61, 220.00, 261.63]  // F3, A3, C4
            ], 1.5, 0.3);
        });
    }

    async playVictoryMusic() {
        await this.crossfadeToMusic('victory', () => {
            // موسیقی پیروزی شاد
            const victoryNotes = [
                523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
                987.77, 880.00, 783.99, 659.25    // B5, A5, G5, E5
            ];

            victoryNotes.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.5, 'sine', 0.2);
                }, index * 300);
            });
        });
    }

    async playGameOverMusic() {
        await this.crossfadeToMusic('gameover', () => {
            // موسیقی غمگین برای پایان بازی
            const sadProgression = [
                [261.63, 311.13, 392.00], // C, D#, G
                [277.18, 329.63, 415.30], // C#, E, G#
                [293.66, 349.23, 440.00], // D, F, A
                [311.13, 369.99, 466.16]  // D#, F#, A#
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
        this.musicGain.gain.exponentialRampToValueAtTime(0.001, now + this.crossfadeDuration / 1000);
        
        await new Promise(resolve => {
            setTimeout(resolve, this.crossfadeDuration);
        });
        
        // توقف تمام نوت‌های فعال
        this.stopAllMusicNotes();
    }

    async fadeInMusic(playFunction) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        this.musicGain.gain.setValueAtTime(0.001, now);
        this.musicGain.gain.exponentialRampToValueAtTime(this.musicVolume, now + this.crossfadeDuration / 1000);
        
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

    playDarkChordProgression(chords, durationPerChord, volume) {
        if (!this.audioContext || this.isMuted) return;
        
        const darkChordInterval = setInterval(() => {
            if (this.currentMusic !== 'boss') {
                clearInterval(darkChordInterval);
                return;
            }
            
            chords.forEach((chord, chordIndex) => {
                setTimeout(() => {
                    chord.forEach(freq => {
                        this.playMusicNote(freq, durationPerChord, 'sawtooth', volume / chord.length);
                    });
                }, chordIndex * durationPerChord * 1000);
            });
            
        }, chords.length * durationPerChord * 1000);
        
        this.activeSounds.set('dark_chords', { stop: () => clearInterval(darkChordInterval) });
    }

    playAmbientPad(baseFreq, duration, type, volume) {
        if (!this.audioContext || this.isMuted) return;
        
        // ایجاد صدای محیطی پیوسته
        const playPad = () => {
            if (this.currentMusic !== 'menu') return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ambienceGain);
            
            oscillator.frequency.value = baseFreq;
            oscillator.type = type;
            
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            gainNode.gain.value = volume;
            
            // انvelope نرم
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 1);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
            // تکرار
            setTimeout(playPad, (duration - 1) * 1000);
        };
        
        playPad();
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

    // آنالایزر صدا
    setupAudioAnalyser() {
        if (!this.audioContext) return;
        
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.masterGain.connect(this.audioAnalyser);
        
        this.audioAnalyser.fftSize = 2048;
        this.audioData = {
            frequency: new Uint8Array(this.audioAnalyser.frequencyBinCount),
            waveform: new Uint8Array(this.audioAnalyser.frequencyBinCount)
        };
    }

    getAudioData() {
        if (!this.audioAnalyser) return null;
        
        this.audioAnalyser.getByteFrequencyData(this.audioData.frequency);
        this.audioAnalyser.getByteTimeDomainData(this.audioData.waveform);
        
        return this.audioData;
    }

    getAudioLevel() {
        const data = this.getAudioData();
        if (!data) return 0;
        
        // محاسبه سطح صدا
        let sum = 0;
        for (let i = 0; i < data.waveform.length; i++) {
            const value = (data.waveform[i] - 128) / 128;
            sum += value * value;
        }
        
        const rms = Math.sqrt(sum / data.waveform.length);
        return Math.min(rms * 2, 1); // نرمالایز به 0-1
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

    setAmbienceVolume(volume) {
        this.ambienceVolume = Math.max(0, Math.min(1, volume));
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

        // مدیریت visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAll();
            } else {
                this.resumeAll();
            }
        });
    }

    pauseAll() {
        if (this.audioContext) {
            this.audioContext.suspend();
        }
    }

    resumeAll() {
        if (this.audioContext) {
            this.audioContext.resume();
        }
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
            ambienceVolume: this.ambienceVolume,
            currentMusic: this.currentMusic,
            contextState: this.audioContext ? this.audioContext.state : 'unsupported'
        };
    }

    // افکت‌های صوتی پیشرفته
    createFilteredSound(frequency, duration, filterType, cutoff, resonance = 1) {
        if (!this.audioContext || this.isMuted) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        filter.type = filterType;
        filter.frequency.value = cutoff;
        filter.Q.value = resonance;
        
        gainNode.gain.value = this.sfxVolume;
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        const soundId = `filtered_${Date.now()}`;
        this.activeSounds.set(soundId, {
            stop: () => {
                oscillator.stop();
                oscillator.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }
        });
        
        oscillator.onended = () => {
            this.activeSounds.delete(soundId);
            oscillator.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        };
        
        return soundId;
    }

    createSweepSound(startFreq, endFreq, duration, volume = 1.0) {
        if (!this.audioContext || this.isMuted) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sine';
        
        gainNode.gain.value = volume * this.sfxVolume;
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.sfxVolume, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        const soundId = `sweep_${Date.now()}`;
        this.activeSounds.set(soundId, {
            stop: () => {
                oscillator.stop();
                oscillator.disconnect();
                gainNode.disconnect();
            }
        });
        
        oscillator.onended = () => {
            this.activeSounds.delete(soundId);
            oscillator.disconnect();
            gainNode.disconnect();
        };
        
        return soundId;
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
        this.audioBuffers.clear();
    }
}

window.AudioManager = AudioManager;