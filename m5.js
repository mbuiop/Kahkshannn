// m5.js - موتور بازی پیشرفته
class GameEngine {
    constructor() {
        this.isRunning = false;
        this.gameTime = 0;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.gameState = 'MENU';
        this.scene = null;
        this.entities = new Map();
        this.systems = new Map();
        this.eventQueue = [];
        this.animationFrameId = null;
        this.performanceMonitor = {
            fps: 0,
            frameCount: 0,
            lastFpsUpdate: 0
        };
    }

    init() {
        console.log('🚀 موتور بازی در حال راه‌اندازی...');
        
        this.setupEventSystem();
        this.setupSceneManagement();
        this.setupEntitySystem();
        this.setupGameSystems();
        this.setupPerformanceMonitoring();
        
        this.loadDefaultResources();
        
        console.log('✅ موتور بازی با موفقیت راه‌اندازی شد');
        return this;
    }

    setupEventSystem() {
        this.eventListeners = new Map();
        
        // رویدادهای اصلی بازی
        this.registerEvent('ENTITY_CREATED');
        this.registerEvent('ENTITY_DESTROYED');
        this.registerEvent('COLLISION_DETECTED');
        this.registerEvent('GAME_STATE_CHANGED');
        this.registerEvent('LEVEL_COMPLETED');
        this.registerEvent('PLAYER_DIED');
        this.registerEvent('SCORE_UPDATED');
    }

    setupSceneManagement() {
        this.scenes = new Map();
        this.currentScene = null;
        
        // ایجاد صحنه‌های پیش‌فرض
        this.createScene('main_menu', this.createMainMenuScene.bind(this));
        this.createScene('gameplay', this.createGameplayScene.bind(this));
        this.createScene('pause', this.createPauseScene.bind(this));
        this.createScene('game_over', this.createGameOverScene.bind(this));
    }

    setupEntitySystem() {
        this.entityComponents = new Map();
        this.componentTypes = new Map();
        
        // ثبت کامپوننت‌های پیش‌فرض
        this.registerComponent('Transform', {
            x: 0, y: 0, z: 0,
            rotation: 0, scale: 1
        });
        
        this.registerComponent('Physics', {
            velocity: { x: 0, y: 0, z: 0 },
            acceleration: { x: 0, y: 0, z: 0 },
            mass: 1,
            friction: 0.98
        });
        
        this.registerComponent('Render', {
            visible: true,
            layer: 0,
            sprite: null,
            color: '#ffffff'
        });
        
        this.registerComponent('Health', {
            current: 100,
            max: 100,
            regeneration: 0
        });
        
        this.registerComponent('Weapon', {
            damage: 10,
            fireRate: 1,
            lastFired: 0,
            bulletType: 'normal'
        });
    }

    setupGameSystems() {
        // ثبت سیستم‌های بازی
        this.registerSystem('RenderSystem', this.renderSystem.bind(this));
        this.registerSystem('PhysicsSystem', this.physicsSystem.bind(this));
        this.registerSystem('InputSystem', this.inputSystem.bind(this));
        this.registerSystem('AISystem', this.aiSystem.bind(this));
        this.registerSystem('CombatSystem', this.combatSystem.bind(this));
        this.registerSystem('ParticleSystem', this.particleSystem.bind(this));
        this.registerSystem('AudioSystem', this.audioSystem.bind(this));
    }

    setupPerformanceMonitoring() {
        this.performance = {
            frameTime: 0,
            fps: 0,
            memory: 0,
            entityCount: 0,
            drawCalls: 0
        };
        
        // مانیتورینگ عملکرد
        setInterval(() => {
            this.updatePerformanceStats();
        }, 1000);
    }

    registerEvent(eventType) {
        this.eventListeners.set(eventType, new Set());
    }

    addEventListener(eventType, callback) {
        if (this.eventListeners.has(eventType)) {
            this.eventListeners.get(eventType).add(callback);
        }
    }

    emitEvent(eventType, data) {
        if (this.eventListeners.has(eventType)) {
            this.eventListeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    registerComponent(name, defaultData) {
        this.componentTypes.set(name, defaultData);
    }

    registerSystem(name, updateFunction) {
        this.systems.set(name, {
            update: updateFunction,
            active: true,
            priority: 0
        });
    }

    createEntity(components = {}) {
        const entityId = 'entity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const entity = {
            id: entityId,
            active: true,
            components: new Map()
        };

        // اضافه کردن کامپوننت‌های پیش‌فرض
        if (!components.Transform) {
            components.Transform = { ...this.componentTypes.get('Transform') };
        }

        // اضافه کردن کامپوننت‌ها
        Object.keys(components).forEach(componentName => {
            if (this.componentTypes.has(componentName)) {
                entity.components.set(componentName, {
                    ...this.componentTypes.get(componentName),
                    ...components[componentName]
                });
            }
        });

        this.entities.set(entityId, entity);
        this.emitEvent('ENTITY_CREATED', { entityId, components });
        
        return entityId;
    }

    removeEntity(entityId) {
        if (this.entities.has(entityId)) {
            this.emitEvent('ENTITY_DESTROYED', { entityId });
            this.entities.delete(entityId);
        }
    }

    getEntity(entityId) {
        return this.entities.get(entityId);
    }

    addComponent(entityId, componentName, data = {}) {
        const entity = this.getEntity(entityId);
        if (entity && this.componentTypes.has(componentName)) {
            entity.components.set(componentName, {
                ...this.componentTypes.get(componentName),
                ...data
            });
        }
    }

    removeComponent(entityId, componentName) {
        const entity = this.getEntity(entityId);
        if (entity) {
            entity.components.delete(componentName);
        }
    }

    createScene(name, setupFunction) {
        this.scenes.set(name, {
            name: name,
            entities: new Set(),
            setup: setupFunction,
            active: false
        });
    }

    loadScene(name) {
        if (this.scenes.has(name)) {
            // پاکسازی صحنه قبلی
            if (this.currentScene) {
                this.unloadCurrentScene();
            }

            const scene = this.scenes.get(name);
            this.currentScene = scene;
            scene.active = true;

            // راه‌اندازی صحنه جدید
            scene.setup();
            
            this.emitEvent('SCENE_CHANGED', { from: this.currentScene, to: name });
            console.log(`صحنه ${name} بارگذاری شد`);
        }
    }

    unloadCurrentScene() {
        if (this.currentScene) {
            this.currentScene.entities.forEach(entityId => {
                this.removeEntity(entityId);
            });
            this.currentScene.active = false;
            this.currentScene = null;
        }
    }

    createMainMenuScene() {
        console.log('صحنه منوی اصلی ایجاد شد');
        
        // ایجاد المان‌های منوی اصلی
        const titleEntity = this.createEntity({
            Transform: { x: window.innerWidth / 2, y: 200 },
            Render: {
                type: 'text',
                text: 'بازی کهکشانی پیشرفته',
                color: '#ffffff',
                fontSize: 48,
                fontFamily: 'Arial'
            }
        });

        // اضافه کردن به صحنه
        this.currentScene.entities.add(titleEntity);
    }

    createGameplayScene() {
        console.log('صحنه گیم پلی ایجاد شد');
        
        // ایجاد بازیکن
        const playerEntity = this.createEntity({
            Transform: { x: window.innerWidth / 2, y: window.innerHeight - 100 },
            Physics: { velocity: { x: 0, y: 0 } },
            Render: { 
                type: 'sprite', 
                sprite: 'player_ship',
                color: '#00aaff'
            },
            Health: { current: 100, max: 100 },
            Weapon: { damage: 10, fireRate: 5 }
        });

        // ایجاد دشمنان اولیه
        for (let i = 0; i < 5; i++) {
            this.createEnemyEntity(100 + i * 150, 100);
        }

        // اضافه کردن به صحنه
        this.currentScene.entities.add(playerEntity);
    }

    createEnemyEntity(x, y) {
        const enemyEntity = this.createEntity({
            Transform: { x: x, y: y },
            Physics: { velocity: { x: 0, y: 1 } },
            Render: { 
                type: 'sprite', 
                sprite: 'enemy_ship',
                color: '#ff4444'
            },
            Health: { current: 30, max: 30 }
        });

        this.currentScene.entities.add(enemyEntity);
        return enemyEntity;
    }

    createPauseScene() {
        console.log('صحنه توقف ایجاد شد');
    }

    createGameOverScene() {
        console.log('صحنه پایان بازی ایجاد شد');
    }

    loadDefaultResources() {
        console.log('در حال بارگذاری منابع پیش‌فرض...');
        
        // اینجا می‌توانید منابع گرافیکی و صوتی را بارگذاری کنید
        this.resources = new Map();
        
        // منابع پیش‌فرض
        this.resources.set('player_ship', this.createDefaultSprite());
        this.resources.set('enemy_ship', this.createDefaultEnemySprite());
        
        console.log('منابع پیش‌فرض بارگذاری شدند');
    }

    createDefaultSprite() {
        // ایجاد یک sprite ساده به صورت برنامه‌ای
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // رسم سفینه بازیکن
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.moveTo(32, 10);
        ctx.lineTo(50, 54);
        ctx.lineTo(32, 44);
        ctx.lineTo(14, 54);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#0066ff';
        ctx.beginPath();
        ctx.moveTo(32, 15);
        ctx.lineTo(45, 50);
        ctx.lineTo(32, 40);
        ctx.lineTo(19, 50);
        ctx.closePath();
        ctx.fill();
        
        return canvas;
    }

    createDefaultEnemySprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // رسم سفینه دشمن
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(32, 32, 25, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#aa0000';
        ctx.beginPath();
        ctx.arc(32, 32, 20, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        
        return canvas;
    }

    start() {
        if (this.isRunning) return;
        
        console.log('شروع بازی...');
        this.isRunning = true;
        this.gameState = 'PLAYING';
        this.lastTime = performance.now();
        
        // بارگذاری صحنه گیم پلی
        this.loadScene('gameplay');
        
        // شروع حلقه بازی
        this.gameLoop();
        
        this.emitEvent('GAME_STARTED', { timestamp: Date.now() });
    }

    pause() {
        this.isRunning = false;
        this.gameState = 'PAUSED';
        this.emitEvent('GAME_PAUSED', {});
    }

    resume() {
        this.isRunning = true;
        this.gameState = 'PLAYING';
        this.lastTime = performance.now();
        this.gameLoop();
        this.emitEvent('GAME_RESUMED', {});
    }

    stop() {
        this.isRunning = false;
        this.gameState = 'MENU';
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.emitEvent('GAME_STOPPED', {});
    }

    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;

        // محاسبه deltaTime
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += this.deltaTime;

        // به‌روزرسانی آمار عملکرد
        this.updatePerformanceStats(currentTime);

        // اجرای سیستم‌های بازی
        this.updateSystems();

        // پردازش صف رویدادها
        this.processEventQueue();

        // درخواست فریم بعدی
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    updateSystems() {
        // اجرای تمام سیستم‌های فعال به ترتیب اولویت
        const systems = Array.from(this.systems.entries())
            .filter(([_, system]) => system.active)
            .sort((a, b) => b[1].priority - a[1].priority);

        systems.forEach(([name, system]) => {
            const startTime = performance.now();
            system.update(this.deltaTime, this.gameTime);
            const endTime = performance.now();
            
            // مانیتورینگ زمان اجرای سیستم
            if (endTime - startTime > 16) {
                console.warn(`سیستم ${name} زمان اجرای زیادی دارد: ${(endTime - startTime).toFixed(2)}ms`);
            }
        });
    }

    updatePerformanceStats(currentTime = performance.now()) {
        this.performanceMonitor.frameCount++;
        
        if (currentTime - this.performanceMonitor.lastFpsUpdate >= 1000) {
            this.performanceMonitor.fps = this.performanceMonitor.frameCount;
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastFpsUpdate = currentTime;
            
            // نمایش FPS در کنسول (در حالت توسعه)
            if (this.performanceMonitor.fps < 50) {
                console.warn(`FPS پایین: ${this.performanceMonitor.fps}`);
            }
        }
        
        this.performance.entityCount = this.entities.size;
    }

    processEventQueue() {
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            this.emitEvent(event.type, event.data);
        }
    }

    // سیستم‌های بازی
    renderSystem(deltaTime, gameTime) {
        // اینجا رندر کردن موجودیت‌ها انجام می‌شود
        this.entities.forEach((entity, entityId) => {
            if (entity.active && entity.components.has('Render') && entity.components.has('Transform')) {
                const render = entity.components.get('Render');
                const transform = entity.components.get('Transform');
                
                if (render.visible) {
                    this.performance.drawCalls++;
                    // رندر کردن موجودیت
                    // این قسمت باید با سیستم گرافیکی خاص پیاده‌سازی شود
                }
            }
        });
    }

    physicsSystem(deltaTime, gameTime) {
        this.entities.forEach((entity, entityId) => {
            if (entity.active && entity.components.has('Physics') && entity.components.has('Transform')) {
                const physics = entity.components.get('Physics');
                const transform = entity.components.get('Transform');
                
                // اعمال فیزیک
                physics.velocity.x += physics.acceleration.x * deltaTime;
                physics.velocity.y += physics.acceleration.y * deltaTime;
                physics.velocity.z += physics.acceleration.z * deltaTime;
                
                // اعمال اصطکاک
                physics.velocity.x *= physics.friction;
                physics.velocity.y *= physics.friction;
                physics.velocity.z *= physics.friction;
                
                // به‌روزرسانی موقعیت
                transform.x += physics.velocity.x * deltaTime;
                transform.y += physics.velocity.y * deltaTime;
                transform.z += physics.velocity.z * deltaTime;
                
                // بررسی برخورد با مرزهای صفحه
                this.handleBoundaryCollision(entityId, transform);
            }
        });
    }

    handleBoundaryCollision(entityId, transform) {
        const margin = 50;
        
        if (transform.x < -margin) transform.x = window.innerWidth + margin;
        if (transform.x > window.innerWidth + margin) transform.x = -margin;
        if (transform.y < -margin) transform.y = window.innerHeight + margin;
        if (transform.y > window.innerHeight + margin) transform.y = -margin;
    }

    inputSystem(deltaTime, gameTime) {
        // پردازش ورودی‌های کاربر
        // این سیستم باید با سیستم ورودی خاص پیاده‌سازی شود
    }

    aiSystem(deltaTime, gameTime) {
        // هوش مصنوعی دشمنان
        this.entities.forEach((entity, entityId) => {
            // منطق AI برای موجودیت‌ها
        });
    }

    combatSystem(deltaTime, gameTime) {
        // سیستم مبارزه و سلاح‌ها
        this.entities.forEach((entity, entityId) => {
            if (entity.active && entity.components.has('Weapon')) {
                const weapon = entity.components.get('Weapon');
                
                // شلیک خودکار
                if (gameTime - weapon.lastFired >= 1 / weapon.fireRate) {
                    this.fireWeapon(entityId);
                    weapon.lastFired = gameTime;
                }
            }
        });
    }

    fireWeapon(entityId) {
        const entity = this.getEntity(entityId);
        if (entity && entity.components.has('Transform')) {
            const transform = entity.components.get('Transform');
            const weapon = entity.components.get('Weapon');
            
            // ایجاد تیر
            const bulletId = this.createEntity({
                Transform: { x: transform.x, y: transform.y - 20 },
                Physics: { velocity: { x: 0, y: -10 } },
                Render: { color: '#ffff00', type: 'bullet' }
            });
            
            this.emitEvent('WEAPON_FIRED', { entityId, bulletId, weaponType: weapon.bulletType });
        }
    }

    particleSystem(deltaTime, gameTime) {
        // سیستم ذرات و افکت‌های ویژه
    }

    audioSystem(deltaTime, gameTime) {
        // سیستم صوتی
    }

    handleResize() {
        // مدیریت تغییر سایز پنجره
        this.emitEvent('WINDOW_RESIZED', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    // متدهای کمکی برای دیباگ
    getPerformanceStats() {
        return {
            fps: this.performanceMonitor.fps,
            entityCount: this.performance.entityCount,
            drawCalls: this.performance.drawCalls,
            frameTime: this.deltaTime * 1000,
            memory: performance.memory ? performance.memory.usedJSHeapSize : 0
        };
    }

    logPerformanceStats() {
        const stats = this.getPerformanceStats();
        console.log('📊 آمار عملکرد:', stats);
    }
}

// ایجاد نمونه جهانی از موتور بازی
window.GameEngine = GameEngine;
