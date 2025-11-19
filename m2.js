// m2.js - سیستم انیمیشن و مدیریت مراحل
class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.timelines = new Map();
        this.particleSystems = [];
        this.transitionInProgress = false;
        
        this.init();
    }
    
    init() {
        // راه‌اندازی سیستم انیمیشن
        console.log("سیستم انیمیشن راه‌اندازی شد");
    }
    
    // سیستم مدیریت مراحل
    setupLevels() {
        const levels = [
            {
                id: 1,
                name: "آغاز کهکشانی",
                description: "اولین مأموریت در مرزهای کهکشان",
                enemyCount: 5,
                enemyTypes: ["scout"],
                background: "nebula_blue",
                music: "mission_1",
                objectives: ["نجات 3 سفینه دوست", "نابودی 5 دشمن"],
                timeLimit: 300
            },
            {
                id: 2,
                name: "حمله ناوگان",
                description: "ناوگان دشمن به منظومه شمسی حمله کرده است",
                enemyCount: 8,
                enemyTypes: ["scout", "fighter"],
                background: "nebula_red",
                music: "mission_2",
                objectives: ["محافظت از پایگاه زمین", "نابودی 8 دشمن"],
                timeLimit: 400
            },
            {
                id: 3,
                name: "پایگاه مخفی",
                description: "کشف و نابودی پایگاه مخفی دشمن",
                enemyCount: 12,
                enemyTypes: ["scout", "fighter", "bomber"],
                background: "nebula_purple",
                music: "mission_3",
                objectives: ["نابودی پایگاه دشمن", "نابودی 12 دشمن"],
                timeLimit: 500
            }
            // سطوح بیشتر...
        ];
        
        return levels;
    }
    
    createLevelTransition(levelFrom, levelTo, duration = 2) {
        if (this.transitionInProgress) return;
        
        this.transitionInProgress = true;
        
        // ایجاد افکت انتقال
        const transitionTimeline = gsap.timeline({
            onComplete: () => {
                this.transitionInProgress = false;
                if (typeof window.LevelManager !== 'undefined') {
                    window.LevelManager.onTransitionComplete(levelTo);
                }
            }
        });
        
        // افکت محو شدن
        transitionTimeline.to('.hud', {
            opacity: 0,
            duration: duration * 0.3,
            ease: "power2.in"
        });
        
        // افکت بزرگنمایی و چرخش
        transitionTimeline.to('canvas', {
            scale: 1.5,
            rotation: 0.1,
            duration: duration * 0.4,
            ease: "power2.inOut"
        }, "-=0.2");
        
        // بازگشت به حالت عادی
        transitionTimeline.to('canvas', {
            scale: 1,
            rotation: 0,
            duration: duration * 0.3,
            ease: "power2.out"
        });
        
        transitionTimeline.to('.hud', {
            opacity: 1,
            duration: duration * 0.3,
            ease: "power2.out"
        }, "-=0.2");
        
        return transitionTimeline;
    }
    
    // سیستم انیمیشن اشیاء
    animateObject(object, animationType, options = {}) {
        const animationId = `${object.uuid}_${animationType}`;
        
        if (this.animations.has(animationId)) {
            this.animations.get(animationId).kill();
        }
        
        let animation;
        
        switch(animationType) {
            case 'float':
                animation = this.createFloatAnimation(object, options);
                break;
            case 'pulse':
                animation = this.createPulseAnimation(object, options);
                break;
            case 'rotate':
                animation = this.createRotateAnimation(object, options);
                break;
            case 'shake':
                animation = this.createShakeAnimation(object, options);
                break;
            case 'moveTo':
                animation = this.createMoveToAnimation(object, options);
                break;
            default:
                console.warn(`انیمیشن ناشناخته: ${animationType}`);
                return null;
        }
        
        this.animations.set(animationId, animation);
        return animation;
    }
    
    createFloatAnimation(object, options) {
        const {
            amplitude = 2,
            duration = 2,
            ease = "sine.inOut"
        } = options;
        
        const originalY = object.position.y;
        
        return gsap.to(object.position, {
            y: originalY + amplitude,
            duration: duration,
            ease: ease,
            yoyo: true,
            repeat: -1
        });
    }
    
    createPulseAnimation(object, options) {
        const {
            scale = 1.2,
            duration = 1,
            ease = "sine.inOut"
        } = options;
        
        const originalScale = object.scale.clone();
        
        return gsap.to(object.scale, {
            x: originalScale.x * scale,
            y: originalScale.y * scale,
            z: originalScale.z * scale,
            duration: duration,
            ease: ease,
            yoyo: true,
            repeat: -1
        });
    }
    
    createRotateAnimation(object, options) {
        const {
            rotation = { x: 0, y: Math.PI * 2, z: 0 },
            duration = 5,
            ease = "none",
            repeat = -1
        } = options;
        
        return gsap.to(object.rotation, {
            x: rotation.x,
            y: rotation.y,
            z: rotation.z,
            duration: duration,
            ease: ease,
            repeat: repeat
        });
    }
    
    createShakeAnimation(object, options) {
        const {
            intensity = 0.5,
            duration = 0.5
        } = options;
        
        const originalPosition = object.position.clone();
        
        return gsap.to(object.position, {
            x: `+=${(Math.random() - 0.5) * intensity}`,
            y: `+=${(Math.random() - 0.5) * intensity}`,
            z: `+=${(Math.random() - 0.5) * intensity}`,
            duration: duration / 10,
            repeat: Math.floor(duration / 0.1),
            yoyo: true,
            onComplete: () => {
                object.position.copy(originalPosition);
            }
        });
    }
    
    createMoveToAnimation(object, options) {
        const {
            target,
            duration = 1,
            ease = "power2.out"
        } = options;
        
        return gsap.to(object.position, {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: duration,
            ease: ease
        });
    }
    
    // سیستم ذرات پیشرفته
    createParticleSystem(type, position, options = {}) {
        const particleSystem = {
            type: type,
            position: position.clone(),
            particles: [],
            life: 1.0,
            ...options
        };
        
        switch(type) {
            case 'explosion':
                this.createExplosionParticles(particleSystem);
                break;
            case 'engine':
                this.createEngineParticles(particleSystem);
                break;
            case 'damage':
                this.createDamageParticles(particleSystem);
                break;
            case 'collect':
                this.createCollectParticles(particleSystem);
                break;
        }
        
        this.particleSystems.push(particleSystem);
        return particleSystem;
    }
    
    createExplosionParticles(system) {
        const particleCount = system.particleCount || 100;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: system.position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                ),
                life: 1.0,
                maxLife: 1.0,
                size: Math.random() * 3 + 1,
                color: new THREE.Color().setHSL(
                    Math.random() * 0.1,
                    0.8 + Math.random() * 0.2,
                    0.5 + Math.random() * 0.5
                )
            };
            
            system.particles.push(particle);
        }
    }
    
    createEngineParticles(system) {
        const particleCount = system.particleCount || 50;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 2;
            
            const particle = {
                position: system.position.clone(),
                velocity: new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    -10 - Math.random() * 10
                ),
                life: 0.5 + Math.random() * 0.5,
                maxLife: 1.0,
                size: Math.random() * 2 + 0.5,
                color: new THREE.Color().setHSL(
                    0.1 + Math.random() * 0.1,
                    0.8 + Math.random() * 0.2,
                    0.7 + Math.random() * 0.3
                )
            };
            
            system.particles.push(particle);
        }
    }
    
    updateParticleSystems(deltaTime) {
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const system = this.particleSystems[i];
            system.life -= deltaTime * 0.5;
            
            if (system.life <= 0) {
                this.particleSystems.splice(i, 1);
                continue;
            }
            
            // به‌روزرسانی ذرات
            for (let j = system.particles.length - 1; j >= 0; j--) {
                const particle = system.particles[j];
                particle.life -= deltaTime;
                
                if (particle.life <= 0) {
                    system.particles.splice(j, 1);
                    continue;
                }
                
                // به‌روزرسانی موقعیت
                particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
                
                // کاهش سرعت
                particle.velocity.multiplyScalar(0.98);
            }
            
            // اگر سیستم ذرات خالی شد، حذف شود
            if (system.particles.length === 0) {
                this.particleSystems.splice(i, 1);
            }
        }
    }
    
    // مدیریت حافظه و بهینه‌سازی
    cleanup() {
        // حذف انیمیشن‌های کامل شده
        for (const [id, animation] of this.animations) {
            if (!animation.isActive()) {
                this.animations.delete(id);
            }
        }
        
        // حذف تایم‌لاین‌های کامل شده
        for (const [id, timeline] of this.timelines) {
            if (timeline.progress() === 1) {
                this.timelines.delete(id);
            }
        }
        
        // کاهش تعداد ذرات اگر زیاد باشد
        if (this.particleSystems.length > 100) {
            this.particleSystems.splice(0, this.particleSystems.length - 100);
        }
    }
    
    // توقف تمام انیمیشن‌ها
    stopAllAnimations() {
        for (const animation of this.animations.values()) {
            animation.kill();
        }
        this.animations.clear();
        
        for (const timeline of this.timelines.values()) {
            timeline.kill();
        }
        this.timelines.clear();
        
        this.particleSystems = [];
    }
}

// سیستم مدیریت مراحل
class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.levelProgress = {};
        
        this.init();
    }
    
    init() {
        this.levels = this.setupLevels();
        this.loadProgress();
    }
    
    setupLevels() {
        // تعریف سطوح بازی
        return [
            {
                id: 1,
                name: "آغاز کهکشانی",
                difficulty: 1,
                enemyWaves: 3,
                objectives: ["نابودی 5 کشتی دشمن", "جمع‌آوری 3 منبع انرژی"],
                background: "blue_nebula",
                music: "level1",
                timeLimit: 300
            },
            {
                id: 2,
                name: "حمله ناوگان",
                difficulty: 2,
                enemyWaves: 5,
                objectives: ["محافظت از پایگاه", "نابودی 10 کشتی دشمن"],
                background: "red_nebula",
                music: "level2",
                timeLimit: 400
            },
            // سطوح بیشتر...
        ];
    }
    
    loadProgress() {
        // بارگذاری پیشرفت از localStorage
        const savedProgress = localStorage.getItem('galacticWarsProgress');
        if (savedProgress) {
            this.levelProgress = JSON.parse(savedProgress);
        } else {
            // پیشرفت پیش‌فرض
            this.levelProgress = {
                unlockedLevel: 1,
                levelScores: {},
                achievements: []
            };
        }
    }
    
    saveProgress() {
        // ذخیره پیشرفت در localStorage
        localStorage.setItem('galacticWarsProgress', JSON.stringify(this.levelProgress));
    }
    
    startLevel(levelId) {
        const level = this.levels.find(l => l.id === levelId);
        if (!level) {
            console.error(`سطح ${levelId} یافت نشد`);
            return null;
        }
        
        this.currentLevel = level;
        this.currentLevelIndex = levelId - 1;
        
        // راه‌اندازی سطح
        this.setupLevel(level);
        
        return level;
    }
    
    setupLevel(level) {
        // راه‌اندازی محیط سطح
        console.log(`شروع سطح: ${level.name}`);
        
        // بارگذاری پس‌زمینه
        this.loadBackground(level.background);
        
        // بارگذاری موسیقی
        this.loadMusic(level.music);
        
        // ایجاد دشمنان
        this.spawnEnemies(level);
        
        // راه‌اندازی اهداف
        this.setupObjectives(level.objectives);
        
        // شروع تایمر
        this.startTimer(level.timeLimit);
    }
    
    loadBackground(backgroundType) {
        // بارگذاری پس‌زمینه بر اساس نوع
        // این تابع با سیستم گرافیکی ارتباط برقرار می‌کند
        if (typeof window.GraphicsSystem !== 'undefined') {
            // تغییر پارامترهای پس‌زمینه
        }
    }
    
    loadMusic(musicTrack) {
        // بارگذاری موسیقی سطح
        // این تابع با سیستم صوتی ارتباط برقرار می‌کند
    }
    
    spawnEnemies(level) {
        // ایجاد دشمنان بر اساس سطح
        const enemyCount = level.difficulty * 5;
        
        for (let i = 0; i < enemyCount; i++) {
            this.spawnEnemy(level.difficulty);
        }
    }
    
    spawnEnemy(difficulty) {
        // ایجاد یک دشمن
        // این تابع با سیستم موجودیت‌ها ارتباط برقرار می‌کند
        const enemyTypes = ['scout', 'fighter', 'bomber'];
        const type = enemyTypes[Math.floor(Math.random() * Math.min(difficulty, enemyTypes.length))];
        
        // موقعیت تصادفی
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 100
        );
        
        // ایجاد دشمن
        if (typeof window.EntityManager !== 'undefined') {
            window.EntityManager.createEnemy(type, position, difficulty);
        }
    }
    
    setupObjectives(objectives) {
        // راه‌اندازی اهداف سطح
        this.currentObjectives = objectives.map((objective, index) => ({
            id: index,
            text: objective,
            completed: false
        }));
    }
    
    startTimer(duration) {
        // شروع تایمر سطح
        this.levelTimer = duration;
        this.timerInterval = setInterval(() => {
            this.levelTimer--;
            
            if (this.levelTimer <= 0) {
                this.onTimeUp();
            }
        }, 1000);
    }
    
    onTimeUp() {
        // زمان سطح به پایان رسیده
        clearInterval(this.timerInterval);
        
        if (typeof window.GameUI !== 'undefined') {
            window.GameUI.showGameOver(0, "زمان به پایان رسید!");
        }
    }
    
    completeObjective(objectiveId) {
        // تکمیل یک هدف
        const objective = this.currentObjectives.find(obj => obj.id === objectiveId);
        if (objective) {
            objective.completed = true;
            
            // بررسی آیا تمام اهداف تکمیل شده‌اند
            const allCompleted = this.currentObjectives.every(obj => obj.completed);
            if (allCompleted) {
                this.completeLevel();
            }
        }
    }
    
    completeLevel() {
        // تکمیل سطح فعلی
        clearInterval(this.timerInterval);
        
        // محاسبه امتیاز
        const score = this.calculateLevelScore();
        
        // ذخیره پیشرفت
        this.levelProgress.unlockedLevel = Math.max(
            this.levelProgress.unlockedLevel,
            this.currentLevel.id + 1
        );
        
        this.levelProgress.levelScores[this.currentLevel.id] = Math.max(
            this.levelProgress.levelScores[this.currentLevel.id] || 0,
            score
        );
        
        this.saveProgress();
        
        // نمایش صفحه تکمیل سطح
        if (typeof window.GameUI !== 'undefined') {
            window.GameUI.showLevelComplete(this.currentLevel.id, score);
        }
    }
    
    calculateLevelScore() {
        // محاسبه امتیاز سطح
        let score = 1000; // امتیاز پایه
        
        // اضافه کردن امتیاز بر اساس زمان باقی‌مانده
        score += this.levelTimer * 10;
        
        // اضافه کردن امتیاز بر اساس دشمنان نابود شده
        if (typeof window.EntityManager !== 'undefined') {
            const enemiesDestroyed = window.EntityManager.getEnemiesDestroyed();
            score += enemiesDestroyed * 100;
        }
        
        return Math.floor(score);
    }
    
    nextLevel() {
        // رفتن به سطح بعدی
        const nextLevelId = this.currentLevel.id + 1;
        
        if (nextLevelId <= this.levels.length) {
            this.startLevel(nextLevelId);
        } else {
            // بازی به پایان رسیده
            if (typeof window.GameUI !== 'undefined') {
                window.GameUI.showGameComplete();
            }
        }
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getLevelProgress() {
        return this.levelProgress;
    }
}

// صادر کردن کلاس‌ها
window.AnimationSystem = AnimationSystem;
window.LevelManager = LevelManager;
