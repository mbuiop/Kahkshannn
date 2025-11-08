// موتور بازی کهکشانی سینمایی - Galactic Odyssey
class GalacticGameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        
        this.gameState = 'loading';
        this.currentScreen = 'loading';
        
        // تنظیمات گرافیکی
        this.graphicsQuality = 'medium';
        this.cinematicMode = true;
        this.particleEffects = true;
        this.shadowsEnabled = true;
        
        // تنظیمات صدا
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.ambientVolume = 0.6;
        
        // عناصر بازی
        this.player = null;
        this.camera = null;
        this.scene = null;
        this.particles = [];
        this.planets = [];
        this.asteroids = [];
        this.enemies = [];
        this.pickups = [];
        this.projectiles = [];
        this.nebulas = [];
        this.stars = [];
        
        // زمان و انیمیشن
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.animationId = null;
        
        // ورودی‌ها
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.touch = { active: false, x: 0, y: 0 };
        
        // فیزیک
        this.gravity = 0.1;
        this.friction = 0.98;
        
        // منابع
        this.textures = {};
        this.models = {};
        this.sounds = {};
        this.shaders = {};
        
        this.init();
    }
    
    async init() {
        try {
            // تنظیم اندازه کانواس
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // بارگذاری منابع
            await this.loadResources();
            
            // راه‌اندازی WebGL
            if (this.gl) {
                this.setupWebGL();
            }
            
            // راه‌اندازی سیستم صوتی
            this.setupAudio();
            
            // راه‌اندازی صحنه
            this.setupScene();
            
            // راه‌اندازی دوربین
            this.setupCamera();
            
            // راه‌اندازی بازیکن
            this.setupPlayer();
            
            // شروع بازی
            this.startGame();
            
        } catch (error) {
            console.error('خطا در راه‌اندازی موتور بازی:', error);
            this.showError('خطا در راه‌اندازی سیستم گرافیکی');
        }
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    async loadResources() {
        // شبیه‌سازی بارگذاری منابع
        const loadingSteps = [
            'بارگذاری مدل‌های سه‌بعدی...',
            'بارگذاری بافت‌های کهکشانی...',
            'راه‌اندازی سیستم ذرات...',
            'بارگذاری شیدرهای گرافیکی...',
            'راه‌اندازی سیستم فیزیک...',
            'آماده‌سازی محیط بازی...'
        ];
        
        for (let i = 0; i < loadingSteps.length; i++) {
            await this.simulateLoading(loadingSteps[i], (i + 1) / loadingSteps.length);
        }
    }
    
    simulateLoading(message, progress) {
        return new Promise(resolve => {
            setTimeout(() => {
                const loadingText = document.getElementById('loadingTip');
                const loadingBar = document.querySelector('.loading-progress');
                
                if (loadingText) loadingText.textContent = message;
                if (loadingBar) loadingBar.style.width = `${progress * 100}%`;
                
                resolve();
            }, 500);
        });
    }
    
    setupWebGL() {
        if (!this.gl) return;
        
        // تنظیمات پایه WebGL
        this.gl.clearColor(0.05, 0.05, 0.1, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // ایجاد شیدرهای پایه
        this.createBasicShaders();
        
        // ایجاد بافرها
        this.setupBuffers();
    }
    
    createBasicShaders() {
        // شیدر ورتکس ساده
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            varying highp vec2 vTextureCoord;
            
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;
            }
        `;
        
        // شیدر فرگمنت ساده
        const fsSource = `
            varying highp vec2 vTextureCoord;
            uniform sampler2D uSampler;
            
            void main(void) {
                gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `;
        
        this.shaders.basic = this.compileShaderProgram(vsSource, fsSource);
    }
    
    compileShaderProgram(vsSource, fsSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);
        
        const shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);
        
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.error('خطا در لینک شیدر:', this.gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        
        return shaderProgram;
    }
    
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('خطا در کامپایل شیدر:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    setupBuffers() {
        // ایجاد بافرهای هندسی پایه
        this.buffers = {
            square: this.createSquareBuffer(),
            cube: this.createCubeBuffer(),
            sphere: this.createSphereBuffer(16, 16)
        };
    }
    
    createSquareBuffer() {
        const positions = new Float32Array([
            -1.0, -1.0, 0.0,
             1.0, -1.0, 0.0,
             1.0,  1.0, 0.0,
            -1.0,  1.0, 0.0,
        ]);
        
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        
        const textureCoords = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ]);
        
        return { positions, indices, textureCoords };
    }
    
    createCubeBuffer() {
        // پیاده‌سازی ایجاد بافر مکعب
        return {};
    }
    
    createSphereBuffer(latBands, longBands) {
        // پیاده‌سازی ایجاد بافر کره
        return {};
    }
    
    setupAudio() {
        // تنظیمات سیستم صوتی
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {
            background: document.getElementById('backgroundMusic'),
            click: document.getElementById('clickSound'),
            collect: document.getElementById('collectSound'),
            explosion: document.getElementById('explosionSound')
        };
        
        // تنظیم حجم صداها
        this.updateAudioVolumes();
    }
    
    updateAudioVolumes() {
        if (this.sounds.background) {
            this.sounds.background.volume = this.musicVolume;
        }
        if (this.sounds.click) {
            this.sounds.click.volume = this.sfxVolume;
        }
        if (this.sounds.collect) {
            this.sounds.collect.volume = this.sfxVolume;
        }
        if (this.sounds.explosion) {
            this.sounds.explosion.volume = this.sfxVolume;
        }
    }
    
    setupScene() {
        this.scene = {
            objects: [],
            lights: [],
            camera: null,
            background: null
        };
        
        // ایجاد نورهای صحنه
        this.setupLights();
        
        // ایجاد پس‌زمینه کهکشانی
        this.setupBackground();
    }
    
    setupLights() {
        this.scene.lights = [
            {
                type: 'directional',
                position: [10, 10, 10],
                color: [1.0, 1.0, 0.9],
                intensity: 1.0
            },
            {
                type: 'ambient',
                color: [0.1, 0.1, 0.2],
                intensity: 0.3
            }
        ];
    }
    
    setupBackground() {
        // ایجاد کهکشان‌های دوردست
        this.createDistantGalaxies();
        
        // ایجاد سحابی‌ها
        this.createNebulas();
        
        // ایجاد ستارگان
        this.createStars();
    }
    
    createDistantGalaxies() {
        for (let i = 0; i < 5; i++) {
            this.nebulas.push({
                x: Math.random() * 2000 - 1000,
                y: Math.random() * 2000 - 1000,
                z: -500 - Math.random() * 1000,
                size: 100 + Math.random() * 200,
                color: this.getRandomNebulaColor(),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.001
            });
        }
    }
    
    createNebulas() {
        for (let i = 0; i < 3; i++) {
            this.nebulas.push({
                x: Math.random() * 800 - 400,
                y: Math.random() * 800 - 400,
                z: -200 - Math.random() * 300,
                size: 50 + Math.random() * 150,
                color: this.getRandomNebulaColor(),
                opacity: 0.3 + Math.random() * 0.4,
                pulseSpeed: 0.5 + Math.random() * 1.0
            });
        }
    }
    
    createStars() {
        for (let i = 0; i < 1000; i++) {
            this.stars.push({
                x: Math.random() * 2000 - 1000,
                y: Math.random() * 2000 - 1000,
                z: Math.random() * 1000 - 500,
                size: 0.5 + Math.random() * 2,
                brightness: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.5 + Math.random() * 2.0
            });
        }
    }
    
    getRandomNebulaColor() {
        const colors = [
            [0.4, 0.2, 0.8], // بنفش
            [0.2, 0.4, 1.0], // آبی
            [0.8, 0.2, 0.6], // صورتی
            [0.1, 0.8, 0.6], // فیروزه‌ای
            [0.9, 0.3, 0.1]  // نارنجی
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    setupCamera() {
        this.camera = {
            x: 0,
            y: 0,
            z: 300,
            targetX: 0,
            targetY: 0,
            targetZ: 0,
            fov: 60,
            aspect: this.canvas.width / this.canvas.height,
            near: 0.1,
            far: 2000,
            
            // تنظیمات سینمایی
            cinematic: {
                active: true,
                shake: 0,
                zoom: 1,
                rotation: 0,
                currentShot: 'default',
                shotTimer: 0
            }
        };
        
        this.updateCameraProjection();
    }
    
    updateCameraProjection() {
        this.camera.aspect = this.canvas.width / this.canvas.height;
    }
    
    setupPlayer() {
        this.player = {
            x: 0,
            y: 0,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            rotation: 0,
            tilt: 0,
            roll: 0,
            
            // مشخصات فنی
            speed: 5,
            maxSpeed: 15,
            acceleration: 0.2,
            deceleration: 0.1,
            maneuverability: 0.05,
            
            // وضعیت
            health: 100,
            shield: 100,
            fuel: 100,
            energy: 100,
            
            // ارتقاها
            upgrades: {
                engine: 1,
                shield: 1,
                weapons: 1,
                scanner: 1
            },
            
            // ظاهر
            model: 'spaceship',
            scale: 1.0,
            trail: []
        };
    }
    
    startGame() {
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
        
        // پخش موسیقی پس‌زمینه
        this.playBackgroundMusic();
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;
        
        // به‌روزرسانی بازی
        this.update();
        
        // رندر بازی
        this.render();
        
        // درخواست فریم بعدی
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // به‌روزرسانی ورودی‌ها
        this.processInput();
        
        // به‌روزرسانی فیزیک
        this.updatePhysics();
        
        // به‌روزرسانی بازیکن
        this.updatePlayer();
        
        // به‌روزرسانی دوربین
        this.updateCamera();
        
        // به‌روزرسانی دشمنان
        this.updateEnemies();
        
        // به‌روزرسانی سیارات
        this.updatePlanets();
        
        // به‌روزرسانی ذرات
        this.updateParticles();
        
        // به‌روزرسانی برخوردها
        this.updateCollisions();
        
        // به‌روزرسانی رابط کاربری
        this.updateUI();
    }
    
    processInput() {
        // پردازش ورودی‌های کیبورد
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.player.vy -= this.player.acceleration;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.player.vy += this.player.acceleration;
        }
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.vx -= this.player.acceleration;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.vx += this.player.acceleration;
        }
        
        // پردازش ورودی‌های موس
        if (this.mouse.down) {
            const dx = (this.mouse.x - this.canvas.width / 2) * 0.001;
            const dy = (this.mouse.y - this.canvas.height / 2) * 0.001;
            
            this.player.vx += dx * this.player.acceleration * 10;
            this.player.vy += dy * this.player.acceleration * 10;
        }
        
        // پردازش ورودی‌های لمسی
        if (this.touch.active) {
            const dx = (this.touch.x - this.canvas.width / 2) * 0.001;
            const dy = (this.touch.y - this.canvas.height / 2) * 0.001;
            
            this.player.vx += dx * this.player.acceleration * 8;
            this.player.vy += dy * this.player.acceleration * 8;
        }
    }
    
    updatePhysics() {
        // اعمال اصطکاک
        this.player.vx *= this.friction;
        this.player.vy *= this.friction;
        
        // محدود کردن سرعت
        const speed = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
        if (speed > this.player.maxSpeed) {
            this.player.vx = (this.player.vx / speed) * this.player.maxSpeed;
            this.player.vy = (this.player.vy / speed) * this.player.maxSpeed;
        }
        
        // به‌روزرسانی موقعیت
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // به‌روزرسانی چرخش بر اساس سرعت
        if (speed > 0.1) {
            this.player.rotation = Math.atan2(this.player.vy, this.player.vx);
            this.player.tilt = Math.min(Math.max(this.player.vy * 0.1, -0.3), 0.3);
            this.player.roll = -this.player.vx * 0.05;
        }
        
        // به‌روزرسانی مسیر
        this.updatePlayerTrail();
    }
    
    updatePlayerTrail() {
        // اضافه کردن نقطه جدید به مسیر
        this.player.trail.push({
            x: this.player.x,
            y: this.player.y,
            z: this.player.z,
            size: 2,
            opacity: 1
        });
        
        // محدود کردن طول مسیر
        if (this.player.trail.length > 20) {
            this.player.trail.shift();
        }
        
        // به‌روزرسانی مسیر
        for (let i = 0; i < this.player.trail.length; i++) {
            const point = this.player.trail[i];
            point.opacity = i / this.player.trail.length;
            point.size = 2 * (i / this.player.trail.length);
        }
    }
    
    updatePlayer() {
        // کاهش سوخت
        const speed = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
        this.player.fuel = Math.max(0, this.player.fuel - speed * 0.01 * this.deltaTime);
        
        // بازیابی انرژی
        this.player.energy = Math.min(100, this.player.energy + 5 * this.deltaTime);
        
        // بررسی تمام شدن سوخت
        if (this.player.fuel <= 0) {
            this.player.vx *= 0.95;
            this.player.vy *= 0.95;
        }
    }
    
    updateCamera() {
        if (!this.camera.cinematic.active) {
            // حالت معمولی - دنبال کردن بازیکن
            this.camera.targetX = this.player.x;
            this.camera.targetY = this.player.y;
            this.camera.targetZ = this.player.z;
            
            this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
            this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;
            this.camera.z = 300; // فاصله ثابت
        } else {
            // حالت سینمایی
            this.updateCinematicCamera();
        }
        
        // اعمال لرزش دوربین
        if (this.camera.cinematic.shake > 0) {
            this.camera.x += (Math.random() - 0.5) * this.camera.cinematic.shake;
            this.camera.y += (Math.random() - 0.5) * this.camera.cinematic.shake;
            this.camera.cinematic.shake *= 0.9;
        }
    }
    
    updateCinematicCamera() {
        this.camera.cinematic.shotTimer += this.deltaTime;
        
        // تعویض نماهای سینمایی
        if (this.camera.cinematic.shotTimer > 8) {
            this.camera.cinematic.shotTimer = 0;
            this.nextCinematicShot();
        }
        
        // اجرای نمای فعلی
        switch (this.camera.cinematic.currentShot) {
            case 'follow':
                this.followShot();
                break;
            case 'side':
                this.sideShot();
                break;
            case 'top':
                this.topShot();
                break;
            case 'dynamic':
                this.dynamicShot();
                break;
            default:
                this.followShot();
        }
    }
    
    followShot() {
        // نمای دنبال‌کننده از پشت
        const distance = 200;
        const height = 50;
        
        this.camera.targetX = this.player.x;
        this.camera.targetY = this.player.y;
        this.camera.targetZ = this.player.z;
        
        const behindX = this.player.x - Math.cos(this.player.rotation) * distance;
        const behindY = this.player.y - Math.sin(this.player.rotation) * distance;
        
        this.camera.x += (behindX - this.camera.x) * 0.05;
        this.camera.y += (behindY - this.camera.y) * 0.05;
        this.camera.z = height;
        
        this.camera.cinematic.rotation = this.player.rotation + Math.PI;
    }
    
    sideShot() {
        // نمای جانبی
        const sideDistance = 150;
        
        this.camera.targetX = this.player.x;
        this.camera.targetY = this.player.y;
        
        const sideX = this.player.x + Math.cos(this.player.rotation + Math.PI / 2) * sideDistance;
        const sideY = this.player.y + Math.sin(this.player.rotation + Math.PI / 2) * sideDistance;
        
        this.camera.x += (sideX - this.camera.x) * 0.05;
        this.camera.y += (sideY - this.camera.y) * 0.05;
        this.camera.z = 100;
        
        this.camera.cinematic.rotation = this.player.rotation;
    }
    
    topShot() {
        // نمای از بالا
        this.camera.targetX = this.player.x;
        this.camera.targetY = this.player.y;
        
        this.camera.x += (this.player.x - this.camera.x) * 0.05;
        this.camera.y += (this.player.y - this.camera.y) * 0.05;
        this.camera.z = 400;
        
        this.camera.cinematic.rotation = 0;
    }
    
    dynamicShot() {
        // نمای پویا با حرکت‌های سینمایی
        const time = this.gameTime;
        const orbitRadius = 250;
        const orbitSpeed = 0.3;
        
        this.camera.targetX = this.player.x;
        this.camera.targetY = this.player.y;
        
        const orbitX = Math.cos(time * orbitSpeed) * orbitRadius;
        const orbitY = Math.sin(time * orbitSpeed) * orbitRadius;
        
        this.camera.x += (this.player.x + orbitX - this.camera.x) * 0.03;
        this.camera.y += (this.player.y + orbitY - this.camera.y) * 0.03;
        this.camera.z = 150 + Math.sin(time * 0.5) * 50;
        
        this.camera.cinematic.rotation = time * 0.1;
    }
    
    nextCinematicShot() {
        const shots = ['follow', 'side', 'top', 'dynamic'];
        let currentIndex = shots.indexOf(this.camera.cinematic.currentShot);
        currentIndex = (currentIndex + 1) % shots.length;
        this.camera.cinematic.currentShot = shots[currentIndex];
    }
    
    updateEnemies() {
        // به‌روزرسانی دشمنان موجود
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // حرکت به سمت بازیکن
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.vx += (dx / distance) * enemy.speed * this.deltaTime;
                enemy.vy += (dy / distance) * enemy.speed * this.deltaTime;
            }
            
            // اعمال اصطکاک
            enemy.vx *= 0.95;
            enemy.vy *= 0.95;
            
            // به‌روزرسانی موقعیت
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
            enemy.rotation = Math.atan2(enemy.vy, enemy.vx);
            
            // حذف دشمنان دور
            if (distance > 1000) {
                this.enemies.splice(i, 1);
            }
        }
        
        // تولید دشمنان جدید
        if (this.enemies.length < 5 && Math.random() < 0.02) {
            this.spawnEnemy();
        }
    }
    
    spawnEnemy() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 400 + Math.random() * 200;
        
        const enemy = {
            x: this.player.x + Math.cos(angle) * distance,
            y: this.player.y + Math.sin(angle) * distance,
            z: 0,
            vx: 0,
            vy: 0,
            rotation: 0,
            speed: 2 + Math.random() * 2,
            health: 30,
            type: 'asteroid',
            size: 20 + Math.random() * 30
        };
        
        this.enemies.push(enemy);
    }
    
    updatePlanets() {
        // به‌روزرسانی سیارات
        for (const planet of this.planets) {
            planet.rotation += planet.rotationSpeed * this.deltaTime;
        }
        
        // تولید سیارات جدید
        if (this.planets.length < 3 && Math.random() < 0.01) {
            this.spawnPlanet();
        }
    }
    
    spawnPlanet() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 400;
        
        const planet = {
            x: this.player.x + Math.cos(angle) * distance,
            y: this.player.y + Math.sin(angle) * distance,
            z: 0,
            size: 40 + Math.random() * 60,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            color: this.getRandomPlanetColor(),
            type: 'planet',
            discovered: false
        };
        
        this.planets.push(planet);
    }
    
    getRandomPlanetColor() {
        const colors = [
            [0.8, 0.6, 0.2], // طلایی
            [0.2, 0.8, 0.4], // سبز
            [0.3, 0.5, 0.9], // آبی
            [0.9, 0.3, 0.2], // قرمز
            [0.7, 0.7, 0.9]  // بنفش روشن
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateParticles() {
        // به‌روزرسانی ذرات
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;
            
            particle.life -= this.deltaTime;
            particle.size *= 0.98;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // تولید ذرات برای مسیر بازیکن
        if (Math.random() < 0.5) {
            this.createEngineParticles();
        }
    }
    
    createEngineParticles() {
        const speed = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
        if (speed < 0.1) return;
        
        const particleCount = Math.floor(speed * 2);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = this.player.rotation + Math.PI + (Math.random() - 0.5) * 0.5;
            const distance = 15;
            
            this.particles.push({
                x: this.player.x - Math.cos(this.player.rotation) * distance,
                y: this.player.y - Math.sin(this.player.rotation) * distance,
                z: 0,
                vx: -Math.cos(angle) * (2 + Math.random() * 3),
                vy: -Math.sin(angle) * (2 + Math.random() * 3),
                vz: (Math.random() - 0.5) * 1,
                size: 2 + Math.random() * 4,
                life: 0.5 + Math.random() * 0.5,
                color: [1.0, 0.8, 0.2, 1.0]
            });
        }
    }
    
    updateCollisions() {
        // بررسی برخورد با سیارات
        for (const planet of this.planets) {
            const dx = this.player.x - planet.x;
            const dy = this.player.y - planet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + planet.size) {
                this.handlePlanetCollision(planet);
            }
        }
        
        // بررسی برخورد با دشمنان
        for (const enemy of this.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + enemy.size) {
                this.handleEnemyCollision(enemy);
            }
        }
    }
    
    handlePlanetCollision(planet) {
        if (!planet.discovered) {
            planet.discovered = true;
            this.createDiscoveryEffect(planet.x, planet.y);
            this.playSound('collect');
            
            // افزایش امتیاز
            gameLogic.addScore(100);
        }
        
        // دفع فیزیکی
        const dx = this.player.x - planet.x;
        const dy = this.player.y - planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = (this.player.size + planet.size) - distance;
        
        if (overlap > 0) {
            const angle = Math.atan2(dy, dx);
            this.player.x += Math.cos(angle) * overlap * 1.1;
            this.player.y += Math.sin(angle) * overlap * 1.1;
            
            // کاهش سرعت
            this.player.vx *= 0.5;
            this.player.vy *= 0.5;
        }
    }
    
    handleEnemyCollision(enemy) {
        // ایجاد افکت انفجار
        this.createExplosion(enemy.x, enemy.y);
        this.playSound('explosion');
        
        // آسیب به بازیکن
        this.player.health -= 10;
        this.player.shield -= 20;
        
        // لرزش دوربین
        this.camera.cinematic.shake = 10;
        
        // حذف دشمن
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        // بررسی پایان بازی
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }
    
    createDiscoveryEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            this.particles.push({
                x: x,
                y: y,
                z: 0,
                vx: Math.cos(angle) * (3 + Math.random() * 2),
                vy: Math.sin(angle) * (3 + Math.random() * 2),
                vz: (Math.random() - 0.5) * 2,
                size: 3 + Math.random() * 4,
                life: 1 + Math.random() * 0.5,
                color: [0.2, 0.8, 1.0, 1.0]
            });
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            
            this.particles.push({
                x: x,
                y: y,
                z: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: (Math.random() - 0.5) * 3,
                size: 4 + Math.random() * 6,
                life: 1 + Math.random() * 0.5,
                color: [1.0, 0.6, 0.1, 1.0]
            });
        }
    }
    
    updateUI() {
        // به‌روزرسانی رابط کاربری بازی
        this.updateHUD();
    }
    
    updateHUD() {
        // به‌روزرسانی مقادیر HUD
        const scoreElement = document.getElementById('scoreValue');
        const fuelElement = document.getElementById('fuelValue');
        const fuelFill = document.getElementById('fuelFill');
        
        if (scoreElement) {
            scoreElement.textContent = gameLogic.score.toLocaleString();
        }
        
        if (fuelElement) {
            fuelElement.textContent = Math.round(this.player.fuel) + '%';
        }
        
        if (fuelFill) {
            fuelFill.style.width = this.player.fuel + '%';
        }
    }
    
    render() {
        if (this.gl) {
            this.renderWebGL();
        } else {
            this.render2D();
        }
    }
    
    renderWebGL() {
        // پاک کردن بافر
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // تنظیم ماتریس projection
        this.setProjectionMatrix();
        
        // رندر پس‌زمینه
        this.renderBackground();
        
        // رندر کهکشان‌های دوردست
        this.renderDistantGalaxies();
        
        // رندر سحابی‌ها
        this.renderNebulas();
        
        // رندر ستارگان
        this.renderStars();
        
        // رندر سیارات
        this.renderPlanets();
        
        // رندر دشمنان
        this.renderEnemies();
        
        // رندر بازیکن
        this.renderPlayer();
        
        // رندر ذرات
        this.renderParticles();
        
        // رندر مسیر
        this.renderTrail();
    }
    
    setProjectionMatrix() {
        // پیاده‌سازی ماتریس projection برای WebGL
    }
    
    renderBackground() {
        // رندر پس‌زمینه کهکشانی
    }
    
    renderDistantGalaxies() {
        // رندر کهکشان‌های دوردست
    }
    
    renderNebulas() {
        // رندر سحابی‌ها
    }
    
    renderStars() {
        // رندر ستارگان
    }
    
    renderPlanets() {
        // رندر سیارات
    }
    
    renderEnemies() {
        // رندر دشمنان
    }
    
    renderPlayer() {
        // رندر بازیکن
    }
    
    renderParticles() {
        // رندر ذرات
    }
    
    renderTrail() {
        // رندر مسیر بازیکن
    }
    
    render2D() {
        // پاک کردن کانواس
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رندر ستارگان
        this.renderStars2D();
        
        // رندر کهکشان‌های دوردست
        this.renderDistantGalaxies2D();
        
        // رندر سحابی‌ها
        this.renderNebulas2D();
        
        // رندر سیارات
        this.renderPlanets2D();
        
        // رندر دشمنان
        this.renderEnemies2D();
        
        // رندر بازیکن
        this.renderPlayer2D();
        
        // رندر ذرات
        this.renderParticles2D();
        
        // رندر مسیر
        this.renderTrail2D();
    }
    
    renderStars2D() {
        this.ctx.save();
        
        for (const star of this.stars) {
            // محاسبه موقعیت بر اساس دوربین
            const screenX = (star.x - this.camera.x) * 0.1 + this.canvas.width / 2;
            const screenY = (star.y - this.camera.y) * 0.1 + this.canvas.height / 2;
            
            // فیلتر کردن ستارگان خارج از صفحه
            if (screenX < -10 || screenX > this.canvas.width + 10 || 
                screenY < -10 || screenY > this.canvas.height + 10) {
                continue;
            }
            
            // محاسبه درخشش
            const brightness = star.brightness * (0.7 + 0.3 * Math.sin(this.gameTime * star.twinkleSpeed));
            
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    renderDistantGalaxies2D() {
        this.ctx.save();
        
        for (const galaxy of this.nebulas.filter(n => n.z < -400)) {
            const screenX = (galaxy.x - this.camera.x) * 0.05 + this.canvas.width / 2;
            const screenY = (galaxy.y - this.camera.y) * 0.05 + this.canvas.height / 2;
            const size = galaxy.size * 0.1;
            
            // ایجاد گرادیان برای کهکشان
            const gradient = this.ctx.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, size
            );
            
            gradient.addColorStop(0, `rgba(${galaxy.color[0] * 255}, ${galaxy.color[1] * 255}, ${galaxy.color[2] * 255}, 0.8)`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    renderNebulas2D() {
        this.ctx.save();
        
        for (const nebula of this.nebulas.filter(n => n.z >= -400)) {
            const screenX = (nebula.x - this.camera.x) * 0.2 + this.canvas.width / 2;
            const screenY = (nebula.y - this.camera.y) * 0.2 + this.canvas.height / 2;
            const size = nebula.size * 0.3;
            const pulse = 1 + 0.2 * Math.sin(this.gameTime * nebula.pulseSpeed);
            
            // ایجاد گرادیان برای سحابی
            const gradient = this.ctx.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, size * pulse
            );
            
            gradient.addColorStop(0, `rgba(${nebula.color[0] * 255}, ${nebula.color[1] * 255}, ${nebula.color[2] * 255}, ${nebula.opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    renderPlanets2D() {
        this.ctx.save();
        
        for (const planet of this.planets) {
            const screenX = (planet.x - this.camera.x) + this.canvas.width / 2;
            const screenY = (planet.y - this.camera.y) + this.canvas.height / 2;
            
            // فیلتر کردن سیارات خارج از صفحه
            if (screenX < -planet.size || screenX > this.canvas.width + planet.size || 
                screenY < -planet.size || screenY > this.canvas.height + planet.size) {
                continue;
            }
            
            // رسم سیاره
            this.ctx.save();
            this.ctx.translate(screenX, screenY);
            this.ctx.rotate(planet.rotation);
            
            // بدنه اصلی
            this.ctx.beginPath();
            this.ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
            
            const gradient = this.ctx.createRadialGradient(
                -planet.size * 0.3, -planet.size * 0.3, 0,
                0, 0, planet.size
            );
            
            gradient.addColorStop(0, `rgba(${planet.color[0] * 255}, ${planet.color[1] * 255}, ${planet.color[2] * 255}, 1)`);
            gradient.addColorStop(1, `rgba(${planet.color[0] * 128}, ${planet.color[1] * 128}, ${planet.color[2] * 128}, 1)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // هایلایت
            this.ctx.beginPath();
            this.ctx.arc(planet.size * 0.3, -planet.size * 0.3, planet.size * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
            this.ctx.fill();
            
            this.ctx.restore();
            
            // نشانگر کشف شده
            if (planet.discovered) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY - planet.size - 10, 5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#00ff88';
                this.ctx.fill();
                
                this.ctx.strokeStyle = '#00ff88';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY - planet.size - 10, 8, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    renderEnemies2D() {
        this.ctx.save();
        
        for (const enemy of this.enemies) {
            const screenX = (enemy.x - this.camera.x) + this.canvas.width / 2;
            const screenY = (enemy.y - this.camera.y) + this.canvas.height / 2;
            
            this.ctx.save();
            this.ctx.translate(screenX, screenY);
            this.ctx.rotate(enemy.rotation);
            
            // رسم دشمن (سیارک)
            this.ctx.fillStyle = '#8B4513';
            this.ctx.beginPath();
            
            // شکل نامنظم سیارک
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const radius = enemy.size * (0.7 + Math.random() * 0.3);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            
            // جزئیات سطح
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
    
    renderPlayer2D() {
        const screenX = this.canvas.width / 2;
        const screenY = this.canvas.height / 2;
        
        this.ctx.save();
        this.ctx.translate(screenX, screenY);
        this.ctx.rotate(this.player.rotation);
        
        // بدنه اصلی سفینه
        this.ctx.fillStyle = '#1E90FF';
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-15, -10);
        this.ctx.lineTo(-15, 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // کابین خلبان
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.beginPath();
        this.ctx.arc(5, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // موتورها
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.rect(-18, -6, 4, 12);
        this.ctx.fill();
        
        // باله‌ها
        this.ctx.fillStyle = '#1C86EE';
        this.ctx.beginPath();
        this.ctx.moveTo(-10, -10);
        this.ctx.lineTo(-15, -20);
        this.ctx.lineTo(-10, -15);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(-10, 10);
        this.ctx.lineTo(-15, 20);
        this.ctx.lineTo(-10, 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    renderParticles2D() {
        this.ctx.save();
        
        for (const particle of this.particles) {
            const screenX = (particle.x - this.camera.x) + this.canvas.width / 2;
            const screenY = (particle.y - this.camera.y) + this.canvas.height / 2;
            
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = `rgb(${particle.color[0] * 255}, ${particle.color[1] * 255}, ${particle.color[2] * 255})`;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    renderTrail2D() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        
        for (const point of this.player.trail) {
            const screenX = (point.x - this.camera.x) + this.canvas.width / 2;
            const screenY = (point.y - this.camera.y) + this.canvas.height / 2;
            
            this.ctx.globalAlpha = point.opacity * 0.5;
            this.ctx.fillStyle = '#00ccff';
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, point.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    playBackgroundMusic() {
        if (this.sounds.background) {
            this.sounds.background.currentTime = 0;
            this.sounds.background.play().catch(e => {
                console.log('موسیقی پس‌زمینه پخش نشد:', e);
            });
        }
    }
    
    playSound(soundName) {
        if (this.sounds[soundName]) {
            const sound = this.sounds[soundName].cloneNode();
            sound.volume = this.sfxVolume;
            sound.play().catch(e => {
                console.log(`صدا پخش نشد: ${soundName}`, e);
            });
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        cancelAnimationFrame(this.animationId);
        
        // نمایش صفحه پایان بازی
        gameLogic.showGameOverScreen();
    }
    
    showError(message) {
        console.error(message);
        // در اینجا می‌توانید یک پیغام خطا به کاربر نمایش دهید
    }
    
    // متدهای مدیریت وضعیت بازی
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            cancelAnimationFrame(this.animationId);
            
            if (this.sounds.background) {
                this.sounds.background.pause();
            }
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastTime = performance.now();
            this.gameLoop();
            
            if (this.sounds.background) {
                this.sounds.background.play().catch(e => {
                    console.log('موسیقی پس‌زمینه پخش نشد:', e);
                });
            }
        }
    }
    
    // مدیریت رویدادها
    handleKeyDown(event) {
        this.keys[event.code] = true;
        
        // مدیریت کلیدهای خاص
        switch (event.code) {
            case 'Escape':
                gameLogic.togglePause();
                break;
            case 'KeyP':
                gameLogic.togglePause();
                break;
            case 'Space':
                event.preventDefault();
                // استفاده از توانایی خاص
                break;
        }
    }
    
    handleKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    handleMouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    
    handleMouseDown(event) {
        this.mouse.down = true;
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    
    handleMouseUp(event) {
        this.mouse.down = false;
    }
    
    handleTouchStart(event) {
        this.touch.active = true;
        const touch = event.touches[0];
        this.touch.x = touch.clientX;
        this.touch.y = touch.clientY;
        event.preventDefault();
    }
    
    handleTouchMove(event) {
        if (this.touch.active) {
            const touch = event.touches[0];
            this.touch.x = touch.clientX;
            this.touch.y = touch.clientY;
            event.preventDefault();
        }
    }
    
    handleTouchEnd(event) {
        this.touch.active = false;
        event.preventDefault();
    }
}

// ایجاد نمونه موتور بازی
const gameEngine = new GalacticGameEngine();
