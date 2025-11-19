// m1.js - سیستم دوربین سینمایی پیشرفته
class CinematicCamera {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.target = null;
        this.offset = new THREE.Vector3(0, 20, 50);
        this.currentMode = 'dynamic';
        this.previousMode = 'dynamic';
        
        // سیستم لرزش
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeFrequency = 1.0;
        this.basePosition = new THREE.Vector3();
        
        // سیستم انیمیشن
        this.animation = {
            active: false,
            startPosition: new THREE.Vector3(),
            targetPosition: new THREE.Vector3(),
            startTime: 0,
            duration: 0,
            easing: 'power2.out'
        };
        
        // حالت‌های مختلف دوربین
        this.modes = {
            dynamic: {
                offset: new THREE.Vector3(0, 20, 50),
                fov: 75,
                lerpSpeed: 0.1,
                lookAhead: 10
            },
            close: {
                offset: new THREE.Vector3(0, 10, 25),
                fov: 80,
                lerpSpeed: 0.15,
                lookAhead: 5
            },
            far: {
                offset: new THREE.Vector3(0, 30, 80),
                fov: 70,
                lerpSpeed: 0.08,
                lookAhead: 15
            },
            tactical: {
                offset: new THREE.Vector3(20, 25, 45),
                fov: 65,
                lerpSpeed: 0.12,
                lookAhead: 8
            },
            orbit: {
                offset: new THREE.Vector3(40, 15, 0),
                fov: 75,
                lerpSpeed: 0.05,
                lookAhead: 0
            },
            firstPerson: {
                offset: new THREE.Vector3(0, 5, 3),
                fov: 90,
                lerpSpeed: 0.2,
                lookAhead: 0
            }
        };
        
        // تنظیمات حرکتی
        this.movement = {
            smoothness: 0.1,
            responsiveness: 0.8,
            prediction: 0.3,
            inertia: 0.95
        };
        
        // تاریخچه موقعیت‌ها برای پیش‌بینی حرکت
        this.positionHistory = [];
        this.maxHistoryLength = 10;
        
        // افکت‌های ویژه
        this.effects = {
            hit: { active: false, intensity: 0, duration: 0 },
            dodge: { active: false, direction: new THREE.Vector3(), duration: 0 },
            zoom: { active: false, targetFov: 75, duration: 0 },
            focus: { active: false, target: null, duration: 0 }
        };
        
        // محدودیت‌های حرکتی
        this.bounds = {
            min: new THREE.Vector3(-200, -100, -300),
            max: new THREE.Vector3(200, 100, 100),
            enabled: true
        };
        
        // سیستم صدا (برای افکت‌های صوتی)
        this.audio = {
            enabled: true,
            volume: 0.5
        };
        
        // متغیرهای زمان
        this.time = 0;
        this.deltaTime = 0;
        this.lastUpdate = performance.now();
        
        this.init();
    }
    
    init() {
        console.log("🎬 شروع راه‌اندازی سیستم دوربین سینمایی...");
        
        // ذخیره موقعیت اولیه
        this.basePosition.copy(this.camera.position);
        
        // راه‌اندازی سیستم ورودی برای کنترل‌های دستی
        this.setupInputListeners();
        
        // راه‌اندازی سیستم دیباگ
        this.setupDebugSystem();
        
        console.log("✅ سیستم دوربین سینمایی با موفقیت راه‌اندازی شد");
    }
    
    setupInputListeners() {
        // گوش دادن به رویدادهای صفحه‌کلید برای تغییر حالت‌های دوربین
        document.addEventListener('keydown', (e) => {
            if (!this.target) return;
            
            switch(e.key) {
                case '1':
                    this.setMode('dynamic');
                    break;
                case '2':
                    this.setMode('close');
                    break;
                case '3':
                    this.setMode('far');
                    break;
                case '4':
                    this.setMode('tactical');
                    break;
                case '5':
                    this.setMode('orbit');
                    break;
                case '6':
                    this.setMode('firstPerson');
                    break;
                case 'r':
                    this.resetCamera();
                    break;
                case 'd':
                    this.toggleDebug();
                    break;
            }
        });
    }
    
    setupDebugSystem() {
        // ایجاد پنل دیباگ
        this.debug = {
            enabled: false,
            panel: null,
            info: {
                mode: '',
                position: '',
                target: '',
                shake: '',
                effects: ''
            }
        };
        
        this.createDebugPanel();
    }
    
    createDebugPanel() {
        // ایجاد پنل دیباگ
        this.debug.panel = document.createElement('div');
        this.debug.panel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            border: 1px solid #333;
            display: none;
        `;
        
        this.debug.panel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #00ccff;">🎬 دوربین سینمایی</div>
            <div>حالت: <span id="cam-mode">-</span></div>
            <div>موقعیت: <span id="cam-pos">-</span></div>
            <div>هدف: <span id="cam-target">-</span></div>
            <div>لرزش: <span id="cam-shake">-</span></div>
            <div>افکت‌ها: <span id="cam-effects">-</span></div>
            <div style="margin-top: 10px; font-size: 10px; color: #888;">
                کلیدها: 1-6 حالت‌ها | R بازنشانی | D دیباگ
            </div>
        `;
        
        document.body.appendChild(this.debug.panel);
    }
    
    setTarget(target) {
        this.target = target;
        console.log(`🎯 هدف دوربین تنظیم شد:`, target.position);
    }
    
    setMode(mode, instant = false) {
        if (!this.modes[mode]) {
            console.warn(`⚠️ حالت دوربین '${mode}' شناخته شده نیست`);
            return;
        }
        
        this.previousMode = this.currentMode;
        this.currentMode = mode;
        
        const modeConfig = this.modes[mode];
        
        if (instant) {
            this.offset.copy(modeConfig.offset);
            this.camera.fov = modeConfig.fov;
            this.camera.updateProjectionMatrix();
        } else {
            // انیمیشن انتقال به حالت جدید
            this.animateTransition(modeConfig);
        }
        
        console.log(`📷 حالت دوربین تغییر کرد به: ${mode}`);
        
        if (this.debug.enabled) {
            this.updateDebugInfo();
        }
    }
    
    animateTransition(targetConfig) {
        // انیمیشن انتقال بین حالت‌های دوربین
        const startOffset = this.offset.clone();
        const startFov = this.camera.fov;
        
        const transition = {
            startTime: this.time,
            duration: 1.0,
            startOffset: startOffset,
            targetOffset: targetConfig.offset.clone(),
            startFov: startFov,
            targetFov: targetConfig.fov
        };
        
        gsap.to(this.offset, {
            x: targetConfig.offset.x,
            y: targetConfig.offset.y,
            z: targetConfig.offset.z,
            duration: transition.duration,
            ease: "power2.inOut"
        });
        
        gsap.to(this.camera, {
            fov: targetConfig.fov,
            duration: transition.duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.updateProjectionMatrix();
            }
        });
    }
    
    update(deltaTime) {
        if (!deltaTime) {
            const currentTime = performance.now();
            this.deltaTime = Math.min(0.1, (currentTime - this.lastUpdate) / 1000);
            this.time += this.deltaTime;
            this.lastUpdate = currentTime;
        } else {
            this.deltaTime = deltaTime;
            this.time += deltaTime;
        }
        
        if (!this.target) return;
        
        try {
            // به‌روزرسانی تاریخچه موقعیت
            this.updatePositionHistory();
            
            // محاسبه موقعیت هدف با پیش‌بینی حرکت
            const targetPosition = this.calculateTargetPosition();
            
            // اعمال حالت فعلی دوربین
            this.applyCameraMode(targetPosition);
            
            // اعمال افکت‌های ویژه
            this.applySpecialEffects();
            
            // اعمال لرزش
            this.applyCameraShake();
            
            // اعمال محدودیت‌های حرکتی
            this.applyMovementBounds();
            
            // به‌روزرسانی اطلاعات دیباگ
            if (this.debug.enabled) {
                this.updateDebugInfo();
            }
            
        } catch (error) {
            console.error("❌ خطا در به‌روزرسانی دوربین:", error);
        }
    }
    
    updatePositionHistory() {
        // ذخیره تاریخچه موقعیت‌ها برای پیش‌بینی حرکت
        this.positionHistory.unshift(this.target.position.clone());
        
        if (this.positionHistory.length > this.maxHistoryLength) {
            this.positionHistory.pop();
        }
    }
    
    calculateTargetPosition() {
        const modeConfig = this.modes[this.currentMode];
        let targetPosition = this.target.position.clone();
        
        // پیش‌بینی حرکت بر اساس تاریخچه
        if (this.positionHistory.length >= 3) {
            const velocity = new THREE.Vector3();
            const recentPositions = this.positionHistory.slice(0, 3);
            
            // محاسبه سرعت متوسط
            for (let i = 1; i < recentPositions.length; i++) {
                velocity.add(
                    recentPositions[i - 1].clone().sub(recentPositions[i])
                );
            }
            velocity.divideScalar(recentPositions.length - 1);
            
            // اعمال پیش‌بینی
            const prediction = velocity.multiplyScalar(modeConfig.lookAhead * this.movement.prediction);
            targetPosition.add(prediction);
        }
        
        return targetPosition;
    }
    
    applyCameraMode(targetPosition) {
        const modeConfig = this.modes[this.currentMode];
        
        switch(this.currentMode) {
            case 'dynamic':
                this.applyDynamicMode(targetPosition, modeConfig);
                break;
            case 'close':
                this.applyCloseMode(targetPosition, modeConfig);
                break;
            case 'far':
                this.applyFarMode(targetPosition, modeConfig);
                break;
            case 'tactical':
                this.applyTacticalMode(targetPosition, modeConfig);
                break;
            case 'orbit':
                this.applyOrbitMode(targetPosition, modeConfig);
                break;
            case 'firstPerson':
                this.applyFirstPersonMode(targetPosition, modeConfig);
                break;
        }
    }
    
    applyDynamicMode(targetPosition, config) {
        // حالت پویا - تطبیق خودکار با شرایط بازی
        const playerVelocity = this.getTargetVelocity();
        const speedFactor = Math.min(1.0, playerVelocity.length() / 50);
        
        // تنظیم خودکار فاصله بر اساس سرعت
        const dynamicOffset = config.offset.clone();
        dynamicOffset.z += speedFactor * 20;
        dynamicOffset.y += speedFactor * 5;
        
        // محاسبه موقعیت دوربین
        const desiredPosition = targetPosition.clone().add(dynamicOffset);
        
        // حرکت نرم دوربین
        this.camera.position.lerp(desiredPosition, config.lerpSpeed * this.movement.smoothness);
        
        // نگاه کردن به جلوتر از هدف برای پیش‌بینی
        const lookAhead = targetPosition.clone();
        lookAhead.z -= config.lookAhead * (1 + speedFactor);
        this.camera.lookAt(lookAhead);
    }
    
    applyCloseMode(targetPosition, config) {
        // حالت نزدیک - برای نبردهای تنگاتنگ
        const desiredPosition = targetPosition.clone().add(config.offset);
        
        // حرکت سریع‌تر برای واکنش بهتر
        this.camera.position.lerp(desiredPosition, config.lerpSpeed * this.movement.responsiveness);
        
        // نگاه کردن مستقیم به هدف
        this.camera.lookAt(targetPosition);
    }
    
    applyFarMode(targetPosition, config) {
        // حالت دور - برای دید کلی و استراتژیک
        const desiredPosition = targetPosition.clone().add(config.offset);
        
        // حرکت آرام برای ثبات
        this.camera.position.lerp(desiredPosition, config.lerpSpeed * this.movement.smoothness);
        
        // نگاه کردن به هدف با دید گسترده
        const lookAhead = targetPosition.clone();
        lookAhead.z -= config.lookAhead;
        this.camera.lookAt(lookAhead);
    }
    
    applyTacticalMode(targetPosition, config) {
        // حالت تاکتیکی - زاویه مورب برای دید بهتر
        const desiredPosition = targetPosition.clone().add(config.offset);
        
        // حرکت متعادل
        this.camera.position.lerp(desiredPosition, config.lerpSpeed);
        
        // نگاه کردن به هدف با زاویه تاکتیکی
        const tacticalLook = targetPosition.clone();
        tacticalLook.x += 5;
        tacticalLook.z -= config.lookAhead;
        this.camera.lookAt(tacticalLook);
    }
    
    applyOrbitMode(targetPosition, config) {
        // حالت مداری - چرخش دور هدف
        const orbitTime = this.time * 0.3;
        const orbitRadius = 40;
        
        const orbitOffset = new THREE.Vector3(
            Math.cos(orbitTime) * orbitRadius,
            config.offset.y,
            Math.sin(orbitTime) * orbitRadius
        );
        
        const desiredPosition = targetPosition.clone().add(orbitOffset);
        this.camera.position.lerp(desiredPosition, config.lerpSpeed);
        
        // همیشه نگاه کردن به هدف
        this.camera.lookAt(targetPosition);
    }
    
    applyFirstPersonMode(targetPosition, config) {
        // حالت اول شخص - از دید بازیکن
        if (this.target.rotation) {
            // کپی کردن موقعیت و چرخش هدف
            this.camera.position.copy(targetPosition).add(config.offset);
            this.camera.rotation.copy(this.target.rotation);
        } else {
            // حالت ساده‌تر اگر چرخش موجود نباشد
            const desiredPosition = targetPosition.clone().add(config.offset);
            this.camera.position.lerp(desiredPosition, config.lerpSpeed * this.movement.responsiveness);
            this.camera.lookAt(targetPosition);
        }
    }
    
    getTargetVelocity() {
        // محاسبه سرعت هدف بر اساس تاریخچه موقعیت
        if (this.positionHistory.length < 2) {
            return new THREE.Vector3();
        }
        
        const currentPos = this.positionHistory[0];
        const previousPos = this.positionHistory[1];
        
        return currentPos.clone().sub(previousPos).divideScalar(this.deltaTime);
    }
    
    applySpecialEffects() {
        // اعمال افکت‌های ویژه دوربین
        this.applyHitEffect();
        this.applyDodgeEffect();
        this.applyZoomEffect();
        this.applyFocusEffect();
    }
    
    applyHitEffect() {
        if (!this.effects.hit.active) return;
        
        this.effects.hit.duration -= this.deltaTime;
        
        if (this.effects.hit.duration <= 0) {
            this.effects.hit.active = false;
            this.effects.hit.intensity = 0;
            return;
        }
        
        // اعمال لرزش ناشی از آسیب
        const progress = this.effects.hit.duration / 0.5; // مدت کل 0.5 ثانیه
        const intensity = this.effects.hit.intensity * progress;
        
        this.shakeCamera(intensity * 2, 0.1);
        
        // تغییر میدان دید لحظه‌ای
        const fovChange = Math.sin(this.time * 30) * intensity * 5;
        this.camera.fov = this.modes[this.currentMode].fov + fovChange;
        this.camera.updateProjectionMatrix();
    }
    
    applyDodgeEffect() {
        if (!this.effects.dodge.active) return;
        
        this.effects.dodge.duration -= this.deltaTime;
        
        if (this.effects.dodge.duration <= 0) {
            this.effects.dodge.active = false;
            return;
        }
        
        // اعمال حرکت دوربین برای افکت فرار
        const progress = this.effects.dodge.duration / 0.3;
        const intensity = 1 - progress;
        
        const dodgeOffset = this.effects.dodge.direction.clone()
            .multiplyScalar(intensity * 8);
        
        this.camera.position.add(dodgeOffset);
    }
    
    applyZoomEffect() {
        if (!this.effects.zoom.active) return;
        
        this.effects.zoom.duration -= this.deltaTime;
        
        if (this.effects.zoom.duration <= 0) {
            this.effects.zoom.active = false;
            // بازگشت به فوی عادی
            gsap.to(this.camera, {
                fov: this.modes[this.currentMode].fov,
                duration: 0.3,
                ease: "power2.out",
                onUpdate: () => this.camera.updateProjectionMatrix()
            });
            return;
        }
        
        // اعمال زوم تدریجی
        const progress = this.effects.zoom.duration / 1.0;
        const currentFov = this.modes[this.currentMode].fov + 
                          (this.effects.zoom.targetFov - this.modes[this.currentMode].fov) * (1 - progress);
        
        this.camera.fov = currentFov;
        this.camera.updateProjectionMatrix();
    }
    
    applyFocusEffect() {
        if (!this.effects.focus.active || !this.effects.focus.target) return;
        
        this.effects.focus.duration -= this.deltaTime;
        
        if (this.effects.focus.duration <= 0) {
            this.effects.focus.active = false;
            this.effects.focus.target = null;
            return;
        }
        
        // تمرکز روی هدف خاص
        const focusTarget = this.effects.focus.target.position || this.effects.focus.target;
        const progress = this.effects.focus.duration / 2.0;
        
        // حرکت نرم به سمت هدف تمرکز
        const focusPosition = focusTarget.clone().add(this.offset);
        this.camera.position.lerp(focusPosition, 0.1 * (1 - progress));
        
        // نگاه کردن به هدف تمرکز
        this.camera.lookAt(focusTarget);
    }
    
    applyCameraShake() {
        if (this.shakeDuration <= 0) {
            this.shakeIntensity = 0;
            return;
        }
        
        this.shakeDuration -= this.deltaTime;
        
        // محاسبه لرزش با نویز پرلین برای حرکت طبیعی‌تر
        const shakeX = this.perlinNoise(this.time * this.shakeFrequency, 0) * this.shakeIntensity;
        const shakeY = this.perlinNoise(0, this.time * this.shakeFrequency) * this.shakeIntensity;
        const shakeZ = this.perlinNoise(this.time * this.shakeFrequency, this.time * this.shakeFrequency) * this.shakeIntensity * 0.5;
        
        // اعمال لرزش به موقعیت دوربین
        this.camera.position.x += shakeX;
        this.camera.position.y += shakeY;
        this.camera.position.z += shakeZ;
        
        // کاهش تدریجی شدت لرزش
        this.shakeIntensity *= 0.95;
    }
    
    perlinNoise(x, y) {
        // نویز پرلین ساده برای لرزش طبیعی
        return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
    }
    
    applyMovementBounds() {
        if (!this.bounds.enabled) return;
        
        // محدود کردن موقعیت دوربین به مرزهای تعریف شده
        this.camera.position.x = THREE.MathUtils.clamp(
            this.camera.position.x, 
            this.bounds.min.x, 
            this.bounds.max.x
        );
        this.camera.position.y = THREE.MathUtils.clamp(
            this.camera.position.y, 
            this.bounds.min.y, 
            this.bounds.max.y
        );
        this.camera.position.z = THREE.MathUtils.clamp(
            this.camera.position.z, 
            this.bounds.min.z, 
            this.bounds.max.z
        );
    }
    
    // متدهای عمومی برای کنترل دوربین
    shakeCamera(intensity = 1.0, duration = 0.5, frequency = 1.0) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
        this.shakeFrequency = frequency;
    }
    
    hitEffect(intensity = 1.0) {
        this.effects.hit.active = true;
        this.effects.hit.intensity = Math.max(this.effects.hit.intensity, intensity);
        this.effects.hit.duration = 0.5;
        
        // پخش صدای ضربه (اگر سیستم صوتی فعال باشد)
        if (this.audio.enabled) {
            this.playSound('hit', intensity);
        }
    }
    
    dodgeEffect(direction, intensity = 1.0) {
        this.effects.dodge.active = true;
        this.effects.dodge.direction.copy(direction).normalize();
        this.effects.dodge.duration = 0.3 * intensity;
    }
    
    zoomEffect(targetFov = 40, duration = 1.0) {
        this.effects.zoom.active = true;
        this.effects.zoom.targetFov = targetFov;
        this.effects.zoom.duration = duration;
    }
    
    focusEffect(target, duration = 2.0) {
        this.effects.focus.active = true;
        this.effects.focus.target = target;
        this.effects.focus.duration = duration;
    }
    
    playSound(soundType, intensity = 1.0) {
        // شبیه‌سازی سیستم صوتی ساده
        if (!this.audio.enabled) return;
        
        const volume = Math.min(1.0, intensity * this.audio.volume);
        
        switch(soundType) {
            case 'hit':
                // پخش صدای ضربه
                console.log(`🔊 پخش صدای ضربه با شدت ${volume}`);
                break;
            case 'explosion':
                // پخش صدای انفجار
                console.log(`🔊 پخش صدای انفجار با شدت ${volume}`);
                break;
            case 'transition':
                // پخش صدای انتقال
                console.log(`🔊 پخش صدای انتقال دوربین`);
                break;
        }
    }
    
    // متدهای کمکی
    resetCamera() {
        // بازنشانی دوربین به حالت اولیه
        this.setMode('dynamic', true);
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        
        // غیرفعال کردن تمام افکت‌ها
        Object.keys(this.effects).forEach(key => {
            this.effects[key].active = false;
        });
        
        console.log("🔄 دوربین بازنشانی شد");
    }
    
    setBounds(min, max, enabled = true) {
        this.bounds.min.copy(min);
        this.bounds.max.copy(max);
        this.bounds.enabled = enabled;
    }
    
    setSmoothness(value) {
        this.movement.smoothness = THREE.MathUtils.clamp(value, 0.01, 1.0);
    }
    
    setResponsiveness(value) {
        this.movement.responsiveness = THREE.MathUtils.clamp(value, 0.01, 1.0);
    }
    
    // متدهای دیباگ
    toggleDebug() {
        this.debug.enabled = !this.debug.enabled;
        this.debug.panel.style.display = this.debug.enabled ? 'block' : 'none';
        
        if (this.debug.enabled) {
            this.updateDebugInfo();
        }
        
        console.log(`🐛 حالت دیباگ دوربین: ${this.debug.enabled ? 'فعال' : 'غیرفعال'}`);
    }
    
    updateDebugInfo() {
        if (!this.debug.enabled) return;
        
        this.debug.info.mode = this.currentMode;
        this.debug.info.position = `X: ${this.camera.position.x.toFixed(1)}, Y: ${this.camera.position.y.toFixed(1)}, Z: ${this.camera.position.z.toFixed(1)}`;
        this.debug.info.target = this.target ? `مشخص` : `نامشخص`;
        this.debug.info.shake = `شدت: ${this.shakeIntensity.toFixed(2)}, مدت: ${this.shakeDuration.toFixed(2)}`;
        
        const activeEffects = Object.keys(this.effects)
            .filter(key => this.effects[key].active)
            .join(', ');
        this.debug.info.effects = activeEffects || 'هیچ';
        
        // به‌روزرسانی پنل دیباگ
        document.getElementById('cam-mode').textContent = this.debug.info.mode;
        document.getElementById('cam-pos').textContent = this.debug.info.position;
        document.getElementById('cam-target').textContent = this.debug.info.target;
        document.getElementById('cam-shake').textContent = this.debug.info.shake;
        document.getElementById('cam-effects').textContent = this.debug.info.effects;
    }
    
    // متدهای پیشرفته برای سکانس‌های سینمایی
    createCinematicSequence(sequence) {
        /*
        sequence = [
            {
                duration: 3.0,
                cameraPosition: { x: 0, y: 20, z: 50 },
                lookAt: { x: 0, y: 0, z: 0 },
                fov: 75,
                easing: 'power2.inOut'
            },
            // ...
        ]
        */
        
        console.log("🎥 شروع سکانس سینمایی...");
        this.playCinematicSequence(sequence);
    }
    
    playCinematicSequence(sequence) {
        let timeline = gsap.timeline();
        
        sequence.forEach((shot, index) => {
            timeline.to(this.camera.position, {
                x: shot.cameraPosition.x,
                y: shot.cameraPosition.y,
                z: shot.cameraPosition.z,
                duration: shot.duration,
                ease: shot.easing || "power2.inOut"
            }, `shot-${index}`);
            
            timeline.to(this.camera, {
                fov: shot.fov || 75,
                duration: shot.duration,
                ease: shot.easing || "power2.inOut",
                onUpdate: () => this.camera.updateProjectionMatrix()
            }, `shot-${index}`);
            
            // کنترل lookAt
            if (shot.lookAt) {
                this.animateLookAt(shot.lookAt, shot.duration, timeline, `shot-${index}`);
            }
        });
        
        timeline.eventCallback("onComplete", () => {
            console.log("🎬 سکانس سینمایی به پایان رسید");
            this.setMode(this.previousMode);
        });
    }
    
    animateLookAt(target, duration, timeline, position) {
        const lookAtControl = {
            target: new THREE.Vector3(target.x, target.y, target.z)
        };
        
        timeline.to(lookAtControl, {
            duration: duration,
            onUpdate: () => {
                this.camera.lookAt(lookAtControl.target);
            }
        }, position);
    }
    
    // متدهای کمکی برای موقعیت‌یابی
    screenToWorld(screenX, screenY, distance = 100) {
        // تبدیل مختصات صفحه به مختصات جهانی
        const vector = new THREE.Vector3(
            (screenX / window.innerWidth) * 2 - 1,
            -(screenY / window.innerHeight) * 2 + 1,
            0.5
        );
        
        vector.unproject(this.camera);
        const dir = vector.sub(this.camera.position).normalize();
        return this.camera.position.clone().add(dir.multiplyScalar(distance));
    }
    
    worldToScreen(worldPosition) {
        // تبدیل مختصات جهانی به مختصات صفحه
        const vector = worldPosition.clone();
        vector.project(this.camera);
        
        return {
            x: (vector.x + 1) / 2 * window.innerWidth,
            y: (-vector.y + 1) / 2 * window.innerHeight
        };
    }
    
    isInView(worldPosition, margin = 0.1) {
        // بررسی آیا نقطه در دید دوربین است
        const screenPos = this.worldToScreen(worldPosition);
        
        return screenPos.x >= -margin && 
               screenPos.x <= window.innerWidth + margin &&
               screenPos.y >= -margin && 
               screenPos.y <= window.innerHeight + margin &&
               screenPos.z >= 0 && screenPos.z <= 1;
    }
    
    getFrustum() {
        // محاسبه frustum دوربین برای تست برخورد
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4().multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        frustum.setFromProjectionMatrix(matrix);
        return frustum;
    }
    
    // متدهای مدیریت حالت
    saveCameraState() {
        // ذخیره حالت فعلی دوربین
        return {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            fov: this.camera.fov,
            mode: this.currentMode,
            offset: this.offset.clone()
        };
    }
    
    restoreCameraState(state) {
        // بازیابی حالت ذخیره شده دوربین
        this.camera.position.copy(state.position);
        this.camera.rotation.copy(state.rotation);
        this.camera.fov = state.fov;
        this.camera.updateProjectionMatrix();
        this.currentMode = state.mode;
        this.offset.copy(state.offset);
    }
    
    // متدهای پاک‌سازی
    dispose() {
        console.log("🧹 پاک‌سازی سیستم دوربین...");
        
        // حذف event listeners
        document.removeEventListener('keydown', this.setupInputListeners);
        
        // حذف پنل دیباگ
        if (this.debug.panel && this.debug.panel.parentNode) {
            this.debug.panel.parentNode.removeChild(this.debug.panel);
        }
        
        console.log("✅ سیستم دوربین پاک‌سازی شد");
    }
    
    // گزارش وضعیت
    getStatusReport() {
        return {
            mode: this.currentMode,
            position: this.camera.position,
            target: this.target ? this.target.position : null,
            effects: Object.keys(this.effects).filter(key => this.effects[key].active),
            shake: {
                intensity: this.shakeIntensity,
                duration: this.shakeDuration
            },
            bounds: {
                enabled: this.bounds.enabled,
                min: this.bounds.min,
                max: this.bounds.max
            }
        };
    }
}

// صادر کردن کلاس
window.CinematicCamera = CinematicCamera;
console.log("📁 m1.js با موفقیت بارگذاری شد - سیستم دوربین سینمایی پیشرفته");
