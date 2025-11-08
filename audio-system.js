// سیستم صوتی پیشرفته برای بازی کهکشانی سینمایی
class AudioSystem {
    static init() {
        console.log('🎵 راه‌اندازی سیستم صوتی پیشرفته...');
        
        // بررسی پشتیبانی مرورگر
        if (!this.checkWebAudioSupport()) {
            console.warn('❌ Web Audio API پشتیبانی نمی‌شود');
            this.audioEnabled = false;
            return;
        }
        
        // ایجاد context صوتی
        this.createAudioContext();
        
        // تنظیمات اصلی
        this.settings = {
            masterVolume: 0.7,
            musicVolume: 0.6,
            sfxVolume: 0.8,
            ambientVolume: 0.5,
            enabled: true,
            highQuality: true
        };
        
        // کش صداها
        this.sounds = new Map();
        this.music = new Map();
        this.ambient = new Map();
        
        // نودهای اصلی
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.ambientGain = null;
        this.compressor = null;
        this.reverb = null;
        
        // وضعیت پخش
        this.currentMusic = null;
        this.currentAmbient = null;
        this.isPlaying = false;
        this.audioEnabled = true;
        
        // ایجاد گراف صوتی
        this.createAudioGraph();
        
        // تولید صداهای مصنوعی
        this.generateSounds();
        
        // شروع صداهای محیطی
        this.startAmbientSounds();
        
        console.log('✅ سیستم صوتی راه‌اندازی شد');
    }
    
    static checkWebAudioSupport() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
    
    static createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎛️ Context صوتی ایجاد شد');
        } catch (error) {
            console.error('❌ خطا در ایجاد context صوتی:', error);
            this.audioEnabled = false;
        }
    }
    
    static createAudioGraph() {
        if (!this.audioEnabled) return;
        
        // ایجاد کمپرسور برای کنترل داینامیک
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        // ایجاد ریورب برای فضای کیهانی
        this.reverb = this.audioContext.createConvolver();
        this.createReverbImpulse();
        
        // ایجاد نودهای gain
        this.masterGain = this.audioContext.createGain();
        this.musicGain = this.audioContext.createGain();
        this.sfxGain = this.audioContext.createGain();
        this.ambientGain = this.audioContext.createGain();
        
        // تنظیم volume اولیه
        this.masterGain.gain.value = this.settings.masterVolume;
        this.musicGain.gain.value = this.settings.musicVolume;
        this.sfxGain.gain.value = this.settings.sfxVolume;
        this.ambientGain.gain.value = this.settings.ambientVolume;
        
        // اتصال گراف صوتی
        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.ambientGain.connect(this.masterGain);
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.reverb);
        this.reverb.connect(this.audioContext.destination);
        
        console.log('🔊 گراف صوتی ایجاد شد');
    }
    
    static createReverbImpulse() {
        // ایجاد ریورب مصنوعی برای فضای کیهانی
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 3; // 3 ثانیه
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);
        
        for (let i = 0; i < length; i++) {
            // ریورب با decay طولانی برای فضای بی‌کران
            const n = i / length;
            leftChannel[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 2);
            rightChannel[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, 2);
        }
        
        this.reverb.buffer = impulse;
    }
    
    static generateSounds() {
        console.log('🎹 تولید صداهای مصنوعی...');
        
        // تولید صداهای اصلی بازی
        this.generateMusic();
        this.generateSFX();
        this.generateAmbient();
        
        console.log('✅ صداهای مصنوعی تولید شدند');
    }
    
    static generateMusic() {
        // موسیقی اصلی بازی - تم کیهانی
        const cosmicTheme = this.createCosmicTheme();
        this.music.set('cosmic_theme', cosmicTheme);
        
        // موسیقی مبارزه
        const battleTheme = this.createBattleTheme();
        this.music.set('battle_theme', battleTheme);
        
        // موسیقی پیروزی
        const victoryTheme = this.createVictoryTheme();
        this.music.set('victory_theme', victoryTheme);
        
        // موسیقی منو
        const menuTheme = this.createMenuTheme();
        this.music.set('menu_theme', menuTheme);
    }
    
    static createCosmicTheme() {
        return {
            play: (loop = true) => {
                const now = this.audioContext.currentTime;
                const duration = 120; // 2 دقیقه
                
                // ایجاد نودهای اصلی
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                gainNode.connect(this.musicGain);
                filter.connect(gainNode);
                
                // تنظیمات فیلتر برای صدای فضایی
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.Q.setValueAtTime(1, now);
                
                // ملودی اصلی
                this.createCosmicMelody(filter, now, duration);
                
                // بیس لاین
                this.createCosmicBass(filter, now, duration);
                
                // ریتم
                this.createCosmicRhythm(filter, now, duration);
                
                // افکت‌های فضایی
                this.createSpaceEffects(filter, now, duration);
                
                if (loop) {
                    setTimeout(() => {
                        this.playMusic('cosmic_theme', true);
                    }, duration * 1000);
                }
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
                        setTimeout(() => {
                            gainNode.disconnect();
                        }, 2000);
                    }
                };
            }
        };
    }
    
    static createCosmicMelody(destination, startTime, duration) {
        const melodyNotes = [
            { note: 523.25, duration: 2 }, // C5
            { note: 587.33, duration: 2 }, // D5
            { note: 659.25, duration: 2 }, // E5
            { note: 698.46, duration: 4 }, // F5
            { note: 783.99, duration: 2 }, // G5
            { note: 880.00, duration: 2 }, // A5
            { note: 987.77, duration: 2 }, // B5
            { note: 1046.50, duration: 4 }  // C6
        ];
        
        let currentTime = startTime;
        
        melodyNotes.forEach((noteData, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(noteData.note, currentTime);
            
            // انولوپ نرم
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + noteData.duration - 0.1);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + noteData.duration);
            
            currentTime += noteData.duration;
        });
    }
    
    static createCosmicBass(destination, startTime, duration) {
        const bassNotes = [
            { note: 65.41, duration: 4 }, // C2
            { note: 73.42, duration: 4 }, // D2
            { note: 82.41, duration: 4 }, // E2
            { note: 87.31, duration: 8 }  // F2
        ];
        
        let currentTime = startTime;
        const patternLength = 16; // طول الگو
        
        for (let i = 0; i < duration; i += patternLength) {
            bassNotes.forEach(noteData => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(destination);
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(noteData.note, currentTime);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(200, currentTime);
                
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + noteData.duration - 0.1);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + noteData.duration);
                
                currentTime += noteData.duration;
            });
        }
    }
    
    static createCosmicRhythm(destination, startTime, duration) {
        const rhythmPattern = [1, 0, 1, 0, 1, 0, 1, 1]; // الگوی ریتم
        
        let currentTime = startTime;
        const stepDuration = 0.5;
        
        for (let i = 0; i < duration; i += rhythmPattern.length * stepDuration) {
            rhythmPattern.forEach((hasSound, index) => {
                if (hasSound) {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(destination);
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(200 + Math.random() * 100, currentTime);
                    
                    gainNode.gain.setValueAtTime(0, currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
                    
                    oscillator.start(currentTime);
                    oscillator.stop(currentTime + 0.1);
                }
                
                currentTime += stepDuration;
            });
        }
    }
    
    static createSpaceEffects(destination, startTime, duration) {
        // افکت‌های صوتی فضایی
        let currentTime = startTime;
        
        while (currentTime < startTime + duration) {
            // صدای ویند فضایی
            this.createSpaceWind(destination, currentTime, 4 + Math.random() * 8);
            
            // صدای انرژی کیهانی
            this.createCosmicEnergy(destination, currentTime + 2 + Math.random() * 4, 2);
            
            currentTime += 6 + Math.random() * 8;
        }
    }
    
    static createSpaceWind(destination, startTime, duration) {
        const noise = this.createPinkNoise(duration);
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(destination);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, startTime);
        filter.frequency.exponentialRampToValueAtTime(100, startTime + duration);
        filter.Q.setValueAtTime(1, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.05, startTime + 1);
        gainNode.gain.setValueAtTime(0.05, startTime + duration - 1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        noise.start(startTime);
    }
    
    static createCosmicEnergy(destination, startTime, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + duration);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(500, startTime);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
    
    static createBattleTheme() {
        return {
            play: (loop = true) => {
                const now = this.audioContext.currentTime;
                const duration = 90; // 1.5 دقیقه
                
                const gainNode = this.audioContext.createGain();
                gainNode.connect(this.musicGain);
                
                // ملودی سریع و پویا
                this.createBattleMelody(gainNode, now, duration);
                
                // ریتم شدید
                this.createBattleRhythm(gainNode, now, duration);
                
                // افکت‌های دراماتیک
                this.createDramaticEffects(gainNode, now, duration);
                
                if (loop) {
                    setTimeout(() => {
                        this.playMusic('battle_theme', true);
                    }, duration * 1000);
                }
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
                        setTimeout(() => {
                            gainNode.disconnect();
                        }, 1000);
                    }
                };
            }
        };
    }
    
    static createBattleMelody(destination, startTime, duration) {
        const fastNotes = [
            { note: 659.25, duration: 0.5 }, // E5
            { note: 783.99, duration: 0.5 }, // G5
            { note: 880.00, duration: 0.5 }, // A5
            { note: 987.77, duration: 0.5 }, // B5
            { note: 1046.50, duration: 1.0 }, // C6
            { note: 987.77, duration: 0.5 }, // B5
            { note: 880.00, duration: 0.5 }, // A5
            { note: 783.99, duration: 1.0 }  // G5
        ];
        
        let currentTime = startTime;
        const patternDuration = fastNotes.reduce((sum, note) => sum + note.duration, 0);
        
        for (let i = 0; i < duration; i += patternDuration) {
            fastNotes.forEach(noteData => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(destination);
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(noteData.note, currentTime);
                
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + noteData.duration - 0.05);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + noteData.duration);
                
                currentTime += noteData.duration;
            });
        }
    }
    
    static createBattleRhythm(destination, startTime, duration) {
        let currentTime = startTime;
        const stepDuration = 0.25;
        
        for (let i = 0; i < duration; i += stepDuration * 16) {
            // الگوی ریتم پیچیده
            for (let j = 0; j < 16; j++) {
                if (j % 4 === 0) {
                    // ضرب قوی
                    this.createDrumHit(destination, currentTime, 100, 0.3);
                } else if (j % 2 === 0) {
                    // ضرب متوسط
                    this.createDrumHit(destination, currentTime, 150, 0.15);
                } else if (Math.random() > 0.7) {
                    // ضرب‌های تصادفی
                    this.createDrumHit(destination, currentTime, 200, 0.1);
                }
                
                currentTime += stepDuration;
            }
        }
    }
    
    static createDramaticEffects(destination, startTime, duration) {
        let currentTime = startTime;
        
        while (currentTime < startTime + duration) {
            // افکت‌های دراماتیک تصادفی
            if (Math.random() > 0.8) {
                this.createSweepEffect(destination, currentTime, 1);
                currentTime += 2;
            } else {
                currentTime += 0.5;
            }
        }
    }
    
    static createSweepEffect(destination, startTime, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, startTime + duration);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, startTime);
        filter.frequency.exponentialRampToValueAtTime(2000, startTime + duration);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
    
    static createVictoryTheme() {
        return {
            play: (loop = false) => {
                const now = this.audioContext.currentTime;
                const duration = 30; // 30 ثانیه
                
                const gainNode = this.audioContext.createGain();
                gainNode.connect(this.musicGain);
                
                // ملودی شاد و پیروزمندانه
                this.createVictoryMelody(gainNode, now, duration);
                
                // هارمونی غنی
                this.createVictoryHarmony(gainNode, now, duration);
                
                // افکت‌های جشن
                this.createCelebrationEffects(gainNode, now, duration);
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
                        setTimeout(() => {
                            gainNode.disconnect();
                        }, 2000);
                    }
                };
            }
        };
    }
    
    static createVictoryMelody(destination, startTime, duration) {
        const victoryNotes = [
            { note: 523.25, duration: 1 }, // C5
            { note: 659.25, duration: 1 }, // E5
            { note: 783.99, duration: 1 }, // G5
            { note: 1046.50, duration: 2 }, // C6
            { note: 987.77, duration: 1 }, // B5
            { note: 880.00, duration: 1 }, // A5
            { note: 783.99, duration: 2 }, // G5
            { note: 659.25, duration: 4 }  // E5
        ];
        
        let currentTime = startTime;
        
        victoryNotes.forEach(noteData => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(noteData.note, currentTime);
            
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, currentTime + 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + noteData.duration - 0.1);
            
            oscillator.start(currentTime);
            oscillator.stop(currentTime + noteData.duration);
            
            currentTime += noteData.duration;
        });
    }
    
    static createVictoryHarmony(destination, startTime, duration) {
        const chords = [
            { notes: [261.63, 329.63, 392.00], duration: 4 }, // C Major
            { notes: [293.66, 369.99, 440.00], duration: 4 }, // D Major
            { notes: [329.63, 415.30, 493.88], duration: 4 }, // E Major
            { notes: [349.23, 440.00, 523.25], duration: 4 }  // F Major
        ];
        
        let currentTime = startTime;
        
        chords.forEach(chord => {
            chord.notes.forEach(note => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(note, currentTime);
                
                gainNode.gain.setValueAtTime(0, currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.2, currentTime + chord.duration - 0.5);
                gainNode.gain.linearRampToValueAtTime(0, currentTime + chord.duration);
                
                oscillator.start(currentTime);
                oscillator.stop(currentTime + chord.duration);
            });
            
            currentTime += chord.duration;
        });
    }
    
    static createCelebrationEffects(destination, startTime, duration) {
        // افکت‌های سینمایی برای پیروزی
        for (let i = 0; i < 5; i++) {
            const time = startTime + i * 2;
            this.createFanfare(destination, time, 1);
        }
    }
    
    static createFanfare(destination, startTime, duration) {
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(destination);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(freq, startTime + index * 0.1);
            
            gainNode.gain.setValueAtTime(0, startTime + index * 0.1);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + index * 0.1 + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.1 + duration);
            
            oscillator.start(startTime + index * 0.1);
            oscillator.stop(startTime + index * 0.1 + duration);
        });
    }
    
    static createMenuTheme() {
        return {
            play: (loop = true) => {
                const now = this.audioContext.currentTime;
                const duration = 60; // 1 دقیقه
                
                const gainNode = this.audioContext.createGain();
                gainNode.connect(this.musicGain);
                
                // ملودی آرام برای منو
                this.createMenuMelody(gainNode, now, duration);
                
                // پس‌زمینه ملایم
                this.createMenuBackground(gainNode, now, duration);
                
                if (loop) {
                    setTimeout(() => {
                        this.playMusic('menu_theme', true);
                    }, duration * 1000);
                }
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 3);
                        setTimeout(() => {
                            gainNode.disconnect();
                        }, 3000);
                    }
                };
            }
        };
    }
    
    static generateSFX() {
        console.log('🎮 تولید صداهای ویژه...');
        
        // صداهای بازی
        this.sounds.set('engine', this.createEngineSound());
        this.sounds.set('thrust', this.createThrustSound());
        this.sounds.set('hit', this.createHitSound());
        this.sounds.set('collect', this.createCollectSound());
        this.sounds.set('explosion', this.createExplosionSound());
        this.sounds.set('bomb', this.createBombSound());
        this.sounds.set('level_complete', this.createLevelCompleteSound());
        this.sounds.set('game_over', this.createGameOverSound());
        this.sounds.set('ui_click', this.createUIClickSound());
        this.sounds.set('ui_hover', this.createUIHoverSound());
        this.sounds.set('warning', this.createWarningSound());
        this.sounds.set('shield', this.createShieldSound());
        
        console.log('✅ صداهای ویژه تولید شدند');
    }
    
    static createEngineSound() {
        return {
            play: (intensity = 1) => {
                const now = this.audioContext.currentTime;
                const duration = 0.5;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(80 * intensity, now);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(400, now);
                
                gainNode.gain.setValueAtTime(0.1 * intensity, now);
                
                oscillator.start(now);
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                        setTimeout(() => {
                            oscillator.stop();
                            oscillator.disconnect();
                        }, 100);
                    },
                    update: (newIntensity) => {
                        oscillator.frequency.setValueAtTime(80 * newIntensity, this.audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.1 * newIntensity, this.audioContext.currentTime);
                    }
                };
            }
        };
    }
    
    static createThrustSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                const duration = 0.3;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(200, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + duration);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                
                oscillator.start(now);
                oscillator.stop(now + duration);
            }
        };
    }
    
    static createHitSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                
                // ترکیب چند oscillator برای صدای برخورد
                for (let i = 0; i < 3; i++) {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.sfxGain);
                    
                    oscillator.type = i === 0 ? 'sine' : 'square';
                    const freq = 300 + i * 100;
                    oscillator.frequency.setValueAtTime(freq, now);
                    oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.2);
                    
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.05);
                    
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                }
            }
        };
    }
    
    static createCollectSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                
                oscillator.start(now);
                oscillator.stop(now + 0.2);
            }
        };
    }
    
    static createExplosionSound() {
        return {
            play: (intensity = 1) => {
                const now = this.audioContext.currentTime;
                const duration = 1.0;
                
                // نویز برای صدای انفجار
                const noise = this.createWhiteNoise(duration);
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                noise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, now);
                filter.frequency.exponentialRampToValueAtTime(100, now + duration);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.5 * intensity, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                
                noise.start(now);
                
                // فرکانس پایین برای ضربه
                const oscillator = this.audioContext.createOscillator();
                const oscGain = this.audioContext.createGain();
                
                oscillator.connect(oscGain);
                oscGain.connect(this.sfxGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(80, now);
                oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                
                oscGain.gain.setValueAtTime(0, now);
                oscGain.gain.linearRampToValueAtTime(0.3 * intensity, now + 0.01);
                oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                
                oscillator.start(now);
                oscillator.stop(now + 0.3);
            }
        };
    }
    
    static createBombSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                const duration = 2.0;
                
                // سوییپ فرکانسی برای بمب
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(50, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.5);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);
                filter.frequency.exponentialRampToValueAtTime(100, now + duration);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.8, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                
                oscillator.start(now);
                oscillator.stop(now + duration);
            }
        };
    }
    
    static createLevelCompleteSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                
                // آکورد پیروزی
                const victoryChord = [523.25, 659.25, 783.99, 1046.50]; // C Major
                
                victoryChord.forEach((freq, index) => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.sfxGain);
                    
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
                    
                    gainNode.gain.setValueAtTime(0, now + index * 0.1);
                    gainNode.gain.linearRampToValueAtTime(0.4, now + index * 0.1 + 0.2);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 1.0);
                    
                    oscillator.start(now + index * 0.1);
                    oscillator.stop(now + index * 0.1 + 1.0);
                });
            }
        };
    }
    
    static createGameOverSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                
                // سقوط فرکانسی برای بازی تمام شده
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, now);
                oscillator.frequency.exponentialRampToValueAtTime(100, now + 1.0);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
                
                oscillator.start(now);
                oscillator.stop(now + 1.0);
            }
        };
    }
    
    static createUIClickSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, now);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                
                oscillator.start(now);
                oscillator.stop(now + 0.05);
            }
        };
    }
    
    static createUIHoverSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                
                oscillator.start(now);
                oscillator.stop(now + 0.1);
            }
        };
    }
    
    static createWarningSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                
                // صدای هشدار با پالس
                for (let i = 0; i < 3; i++) {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.sfxGain);
                    
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(400, now + i * 0.3);
                    
                    gainNode.gain.setValueAtTime(0, now + i * 0.3);
                    gainNode.gain.linearRampToValueAtTime(0.3, now + i * 0.3 + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 0.2);
                    
                    oscillator.start(now + i * 0.3);
                    oscillator.stop(now + i * 0.3 + 0.2);
                }
            }
        };
    }
    
    static createShieldSound() {
        return {
            play: () => {
                const now = this.audioContext.currentTime;
                const duration = 0.5;
                
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.sfxGain);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + duration);
                
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(200, now);
                
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                
                oscillator.start(now);
                oscillator.stop(now + duration);
            }
        };
    }
    
    static generateAmbient() {
        console.log('🌌 تولید صداهای محیطی...');
        
        this.ambient.set('space_ambience', this.createSpaceAmbience());
        this.ambient.set('cosmic_wind', this.createCosmicWind());
        this.ambient.set('energy_field', this.createEnergyField());
        this.ambient.set('distant_stars', this.createDistantStars());
        
        console.log('✅ صداهای محیطی تولید شدند');
    }
    
    static createSpaceAmbience() {
        return {
            play: (loop = true) => {
                const noise = this.createPinkNoise(9999); // صداهای طولانی
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                noise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.ambientGain);
                
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
                filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                
                noise.start(this.audioContext.currentTime);
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
                        setTimeout(() => {
                            noise.stop();
                        }, 2000);
                    }
                };
            }
        };
    }
    
    static createCosmicWind() {
        return {
            play: (loop = true) => {
                const noise = this.createBrownNoise(9999);
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();
                
                noise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.ambientGain);
                
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);
                
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
                filter.Q.setValueAtTime(2, this.audioContext.currentTime);
                
                lfo.type = 'sine';
                lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
                lfoGain.gain.setValueAtTime(50, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
                
                noise.start(this.audioContext.currentTime);
                lfo.start(this.audioContext.currentTime);
                
                return {
                    stop: () => {
                        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 3);
                        setTimeout(() => {
                            noise.stop();
                            lfo.stop();
                        }, 3000);
                    }
                };
            }
        };
    }
    
    static createPinkNoise(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11; // scale
            b6 = white * 0.115926;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        return source;
    }
    
    static createBrownNoise(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // scale
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        return source;
    }
    
    static createWhiteNoise(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        return source;
    }
    
    static startAmbientSounds() {
        if (!this.audioEnabled) return;
        
        this.currentAmbient = this.ambient.get('space_ambience').play(true);
        console.log('🔊 صداهای محیطی شروع شدند');
    }
    
    static playMusic(trackName, loop = true) {
        if (!this.audioEnabled || !this.settings.enabled) return;
        
        // توقف موسیقی قبلی
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
        
        const track = this.music.get(trackName);
        if (track) {
            this.currentMusic = track.play(loop);
            console.log(`🎵 پخش موسیقی: ${trackName}`);
        }
    }
    
    static stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
            console.log('⏹️ موسیقی متوقف شد');
        }
    }
    
    static playSound(soundName, options = {}) {
        if (!this.audioEnabled || !this.settings.enabled) return null;
        
        const sound = this.sounds.get(soundName);
        if (sound) {
            return sound.play(options.intensity);
        }
        
        return null;
    }
    
    static stopSound(soundInstance) {
        if (soundInstance && soundInstance.stop) {
            soundInstance.stop();
        }
    }
    
    static setMasterVolume(volume) {
        if (!this.audioEnabled) return;
        
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.masterGain.gain.setValueAtTime(this.settings.masterVolume, this.audioContext.currentTime);
    }
    
    static setMusicVolume(volume) {
        if (!this.audioEnabled) return;
        
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.musicGain.gain.setValueAtTime(this.settings.musicVolume, this.audioContext.currentTime);
    }
    
    static setSFXVolume(volume) {
        if (!this.audioEnabled) return;
        
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, this.audioContext.currentTime);
    }
    
    static setAmbientVolume(volume) {
        if (!this.audioEnabled) return;
        
        this.settings.ambientVolume = Math.max(0, Math.min(1, volume));
        this.ambientGain.gain.setValueAtTime(this.settings.ambientVolume, this.audioContext.currentTime);
    }
    
    static toggleMute() {
        this.settings.enabled = !this.settings.enabled;
        
        if (this.settings.enabled) {
            this.setMasterVolume(this.settings.masterVolume);
            console.log('🔊 صداها فعال شدند');
        } else {
            this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            console.log('🔇 صداها غیرفعال شدند');
        }
        
        return this.settings.enabled;
    }
    
    static pause() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
            console.log('⏸️ صداها متوقف شدند');
        }
    }
    
    static resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            console.log('▶️ صداها ادامه یافتند');
        }
    }
    
    // متدهای کمکی برای بازی
    static playBackgroundMusic() {
        this.playMusic('cosmic_theme', true);
    }
    
    static playBattleMusic() {
        this.playMusic('battle_theme', true);
    }
    
    static playVictoryMusic() {
        this.playMusic('victory_theme', false);
    }
    
    static playMenuMusic() {
        this.playMusic('menu_theme', true);
    }
    
    static playEngineSound() {
        return this.playSound('engine');
    }
    
    static playThrustSound() {
        this.playSound('thrust');
    }
    
    static playHitSound() {
        this.playSound('hit');
    }
    
    static playCollectSound() {
        this.playSound('collect');
    }
    
    static playExplosionSound(intensity = 1) {
        this.playSound('explosion', { intensity });
    }
    
    static playBombSound() {
        this.playSound('bomb');
    }
    
    static playLevelCompleteSound() {
        this.playSound('level_complete');
    }
    
    static playGameOverSound() {
        this.playSound('game_over');
    }
    
    static playUIClickSound() {
        this.playSound('ui_click');
    }
    
    static playUIHoverSound() {
        this.playSound('ui_hover');
    }
    
    static playWarningSound() {
        this.playSound('warning');
    }
    
    static playShieldSound() {
        this.playSound('shield');
    }
}

// ایجاد نمونه جهانی
window.AudioSystem = AudioSystem;

// مدیریت حالت sleep مرورگر
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        AudioSystem.pause();
    } else {
        AudioSystem.resume();
    }
});

// راه‌اندازی خودکار وقتی صفحه بارگذاری شد
window.addEventListener('load', () => {
    // تأخیر برای اجازه دادن به تعامل کاربر
    setTimeout(() => {
        AudioSystem.init();
    }, 1000);
});

console.log('🎵 سیستم صوتی پیشرفته بارگذاری شد');
