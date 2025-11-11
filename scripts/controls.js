// سیستم کنترل بازی
class ControlSystem {
    constructor() {
        this.movement = { dx: 0, dy: 0 };
        this.isTouching = false;
        this.touchId = null;
        this.joystickBaseX = 0;
        this.joystickBaseY = 0;
        this.joystickRadius = 35;
        this.currentJoystickX = 0;
        this.currentJoystickY = 0;
        
        this.init();
    }

    init() {
        this.setupMouseControls();
        this.setupTouchControls();
    }

    setup() {
        if (this.isTouchDevice()) {
            this.enableTouchControls();
        } else {
            this.enableMouseControls();
        }
    }

    setupMouseControls() {
        document.addEventListener('mousemove', (e) => {
            if (Game.gameRunning && !this.isTouching) {
                Game.player.x = e.clientX;
                Game.player.y = e.clientY;
                
                // محاسبه جهت حرکت برای چرخش
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                this.movement.dx = e.clientX - centerX;
                this.movement.dy = e.clientY - centerY;
            }
        });

        // جلوگیری از کلیک راست
        document.addEventListener('contextmenu', (e) => {
            if (Game.gameRunning) e.preventDefault();
        });
    }

    setupTouchControls() {
        const touchControls = document.querySelector('.touch-controls');
        const joystickBase = document.querySelector('.joystick-base');
        
        if (!touchControls || !joystickBase) return;

        touchControls.addEventListener('touchstart', this.handleTouchStart.bind(this));
        touchControls.addEventListener('touchmove', this.handleTouchMove.bind(this));
        touchControls.addEventListener('touchend', this.handleTouchEnd.bind(this));
        touchControls.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (this.isTouching || !Game.gameRunning) return;
        
        const touch = e.touches[0];
        this.touchId = touch.identifier;
        this.isTouching = true;
        
        // محاسبه موقعیت پایه جویستیک
        const joystickBase = document.querySelector('.joystick-base');
        const joystickRect = joystickBase.getBoundingClientRect();
        this.joystickBaseX = joystickRect.left + joystickRect.width / 2;
        this.joystickBaseY = joystickRect.top + joystickRect.height / 2;
        this.joystickRadius = joystickRect.width / 2 - 25;
    }

    handleTouchMove(e) {
        if (!this.isTouching || !Game.gameRunning) return;
        
        e.preventDefault();
        
        // پیدا کردن لمسی که روی جویستیک است
        let touch = null;
        const touchControls = document.querySelector('.touch-controls');
        const rect = touchControls.getBoundingClientRect();
        
        for (let i = 0; i < e.touches.length; i++) {
            const touchX = e.touches[i].clientX;
            const touchY = e.touches[i].clientY;
            
            if (touchX >= rect.left && touchX <= rect.right &&
                touchY >= rect.top && touchY <= rect.bottom) {
                touch = e.touches[i];
                break;
            }
        }
        
        if (!touch) return;
        
        const deltaX = touch.clientX - this.joystickBaseX;
        const deltaY = touch.clientY - this.joystickBaseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);
        
        // محدود کردن به شعاع جویستیک
        const limitedDistance = Math.min(distance, this.joystickRadius);
        
        // موقعیت جدید هندل
        this.currentJoystickX = limitedDistance * Math.cos(angle);
        this.currentJoystickY = limitedDistance * Math.sin(angle);
        
        // حرکت هندل
        const joystickHandle = document.querySelector('.joystick-handle');
        joystickHandle.style.transform = `translate(calc(-50% + ${this.currentJoystickX}px), calc(-50% + ${this.currentJoystickY}px))`;
        
        // حرکت بازیکن
        if (distance > 10) {
            const speed = Game.player.speed;
            Game.player.x += Math.cos(angle) * speed;
            Game.player.y += Math.sin(angle) * speed;
            
            // محدود کردن به مرزهای صفحه
            Game.player.x = Math.max(-200, Math.min(window.innerWidth + 200, Game.player.x));
            Game.player.y = Math.max(-200, Math.min(window.innerHeight + 200, Game.player.y));
            
            // تنظیم جهت حرکت برای چرخش
            this.movement.dx = Math.cos(angle) * speed;
            this.movement.dy = Math.sin(angle) * speed;
        }
    }

    handleTouchEnd(e) {
        this.isTouching = false;
        this.touchId = null;
        this.movement.dx = 0;
        this.movement.dy = 0;
        
        // بازگشت هندل به مرکز
        this.currentJoystickX = 0;
        this.currentJoystickY = 0;
        const joystickHandle = document.querySelector('.joystick-handle');
        joystickHandle.style.transform = 'translate(-50%, -50%)';
    }

    enableTouchControls() {
        const touchControls = document.querySelector('.touch-controls');
        if (touchControls) {
            touchControls.style.display = 'block';
        }
    }

    enableMouseControls() {
        const touchControls = document.querySelector('.touch-controls');
        if (touchControls) {
            touchControls.style.display = 'none';
        }
    }

    isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    handleResize() {
        // تنظیم مجدد موقعیت جویستیک در صورت تغییر سایز
        if (this.isTouchDevice()) {
            const joystickBase = document.querySelector('.joystick-base');
            if (joystickBase) {
                const joystickRect = joystickBase.getBoundingClientRect();
                this.joystickBaseX = joystickRect.left + joystickRect.width / 2;
                this.joystickBaseY = joystickRect.top + joystickRect.height / 2;
            }
        }
    }

    disable() {
        this.isTouching = false;
        this.movement.dx = 0;
        this.movement.dy = 0;
        
        // بازگشت هندل به مرکز
        const joystickHandle = document.querySelector('.joystick-handle');
        if (joystickHandle) {
            joystickHandle.style.transform = 'translate(-50%, -50%)';
        }
    }
}

// ایجاد نمونه کنترل‌ها
const Controls = new ControlSystem();
