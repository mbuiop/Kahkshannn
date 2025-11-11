// فایل کنترل‌های بازی - مدیریت ورودی‌های کاربر

class Controls {
    constructor() {
        this.isTouchEnabled = false;
        this.isTouching = false;
        this.touchId = null;
        
        // تنظیمات جویستیک
        this.joystick = {
            baseX: 0,
            baseY: 0,
            radius: 35,
            handleX: 0,
            handleY: 0,
            isActive: false
        };
        
        this.init();
    }

    init() {
        console.log('🎮 کنترل‌ها راه‌اندازی شد');
        this.setupEventListeners();
        this.detectTouchSupport();
    }

    detectTouchSupport() {
        this.isTouchEnabled = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             navigator.msMaxTouchPoints > 0;
        
        console.log(`📱 پشتیبانی از لمسی: ${this.isTouchEnabled}`);
    }

    setupEventListeners() {
        // رویدادهای موس
        this.setupMouseEvents();
        
        // رویدادهای لمسی
        if (this.isTouchEnabled) {
            this.setupTouchEvents();
        }
        
        // رویدادهای کیبورد
        this.setupKeyboardEvents();
    }

    setupMouseEvents() {
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    setupTouchEvents() {
        const touchControls = document.querySelector('.touch-controls');
        
        if (touchControls) {
            touchControls.addEventListener('touchstart', this.handleTouchStart.bind(this));
            touchControls.addEventListener('touchmove', this.handleTouchMove.bind(this));
            touchControls.addEventListener('touchend', this.handleTouchEnd.bind(this));
            touchControls.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
        }
        
        // تنظیم موقعیت جویستیک
        this.setupJoystickPosition();
    }

    setupKeyboardEvents() {
        // رویدادهای کیبورد در main.js مدیریت می‌شوند
    }

    setupJoystickPosition() {
        const joystickBase = document.querySelector('.joystick-base');
        if (!joystickBase) return;
        
        const rect = joystickBase.getBoundingClientRect();
        this.joystick.baseX = rect.left + rect.width / 2;
        this.joystick.baseY = rect.top + rect.height / 2;
        this.joystick.radius = rect.width / 2 - 25;
    }

    // مدیریت موس
    handleMouseMove(event) {
        if (!game.isRunning || game.isPaused || this.isTouching) return;
        
        // حرکت بازیکن با موس
        game.player.x = event.clientX;
        game.player.y = event.clientY;
        game.updatePlayerPosition();
        
        // ثبت مسیر حرکت
        this.recordPlayerPath();
    }

    handleMouseDown(event) {
        // برای تعامل با المان‌های بازی
    }

    handleMouseUp(event) {
        // برای تعامل با المان‌های بازی
    }

    // مدیریت لمسی
    handleTouchStart(event) {
        if (!game.isRunning || game.isPaused || this.isTouching) return;
        
        event.preventDefault();
        
        const touch = event.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // بررسی اینکه آیا لمس روی جویستیک است
        if (this.isTouchOnJoystick(touchX, touchY)) {
            this.touchId = touch.identifier;
            this.isTouching = true;
            this.joystick.isActive = true;
            
            console.log('👆 لمس جویستیک شروع شد');
        }
    }

    handleTouchMove(event) {
        if (!this.isTouching || !game.isRunning || game.isPaused) return;
        
        event.preventDefault();
        
        // پیدا کردن لمسی که روی جویستیک است
        const touch = this.findJoystickTouch(event.touches);
        if (!touch) return;
        
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // محاسبه موقعیت نسبی
        const deltaX = touchX - this.joystick.baseX;
        const deltaY = touchY - this.joystick.baseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);
        
        // محدود کردن به شعاع جویستیک
        const limitedDistance = Math.min(distance, this.joystick.radius);
        
        // موقعیت جدید هندل
        this.joystick.handleX = limitedDistance * Math.cos(angle);
        this.joystick.handleY = limitedDistance * Math.sin(angle);
        
        // حرکت هندل
        this.updateJoystickHandle();
        
        // حرکت بازیکن
        if (distance > 10) {
            const speed = this.calculateMovementSpeed(distance);
            
            game.player.x += Math.cos(angle) * speed;
            game.player.y += Math.sin(angle) * speed;
            
            // محدود کردن به مرزهای صفحه
            this.constrainPlayerPosition();
            
            game.updatePlayerPosition();
            this.recordPlayerPath();
        }
    }

    handleTouchEnd(event) {
        if (!this.isTouching) return;
        
        this.isTouching = false;
        this.touchId = null;
        this.joystick.isActive = false;
        
        // بازگشت هندل به مرکز
        this.joystick.handleX = 0;
        this.joystick.handleY = 0;
        this.updateJoystickHandle();
        
        console.log('👆 لمس جویستیک پایان یافت');
    }

    // محاسبه سرعت حرکت بر اساس فاصله از مرکز
    calculateMovementSpeed(distance) {
        const minSpeed = 5;
        const maxSpeed = 12;
        const normalizedDistance = distance / this.joystick.radius;
        
        return minSpeed + (maxSpeed - minSpeed) * normalizedDistance;
    }

    // محدود کردن موقعیت بازیکن به مرزهای صفحه
    constrainPlayerPosition() {
        const margin = 200;
        game.player.x = Math.max(-margin, Math.min(window.innerWidth + margin, game.player.x));
        game.player.y = Math.max(-margin, Math.min(window.innerHeight + margin, game.player.y));
    }

    // بررسی اینکه آیا لمس روی جویستیک است
    isTouchOnJoystick(touchX, touchY) {
        const joystickArea = document.querySelector('.touch-controls');
        if (!joystickArea) return false;
        
        const rect = joystickArea.getBoundingClientRect();
        return touchX >= rect.left && touchX <= rect.right &&
               touchY >= rect.top && touchY <= rect.bottom;
    }

    // پیدا کردن لمسی که روی جویستیک است
    findJoystickTouch(touches) {
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            if (this.touchId === touch.identifier) {
                return touch;
            }
        }
        return null;
    }

    // به‌روزرسانی موقعیت هندل جویستیک
    updateJoystickHandle() {
        const handle = document.querySelector('.joystick-handle');
        if (!handle) return;
        
        handle.style.transform = `translate(calc(-50% + ${this.joystick.handleX}px), calc(-50% + ${this.joystick.handleY}px))`;
    }

    // ثبت مسیر حرکت بازیکن
    recordPlayerPath() {
        if (!game.collections.playerPath) {
            game.collections.playerPath = [];
        }
        
        game.collections.playerPath.push({
            x: game.player.x,
            y: game.player.y,
            timestamp: Date.now()
        });
        
        // محدود کردن طول مسیر
        if (game.collections.playerPath.length > 50) {
            game.collections.playerPath.shift();
        }
    }

    // تنظیم مجدد موقعیت جویستیک هنگام تغییر اندازه صفحه
    updateJoystickPosition() {
        if (this.isTouchEnabled) {
            this.setupJoystickPosition();
        }
    }

    // غیرفعال کردن کنترل‌ها
    disable() {
        this.isTouching = false;
        this.joystick.isActive = false;
        
        // بازگشت هندل به مرکز
        this.joystick.handleX = 0;
        this.joystick.handleY = 0;
        this.updateJoystickHandle();
    }

    // فعال کردن کنترل‌ها
    enable() {
        // کنترل‌ها به طور پیش‌فرض فعال هستند
    }
}

// ایجاد نمونه از کنترل‌ها
const controls = new Controls();

// صادر کردن برای استفاده global
window.controls = controls;
