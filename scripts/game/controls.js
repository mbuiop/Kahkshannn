class AdvancedControls {
    constructor() {
        this.joystick = {
            active: false,
            position: { x: 0, y: 0 },
            basePosition: { x: 0, y: 0 },
            radius: 40,
            sensitivity: 2.0,
            smoothness: 0.2
        };
        
        this.input = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        };
        
        this.keys = new Set();
        this.touch = {
            active: false,
            identifier: null,
            startX: 0,
            startY: 0
        };
        
        this.init();
    }

    init() {
        this.setupJoystick();
        this.setupKeyboard();
        this.setupTouch();
        this.setupGamepad();
        
        console.log('🎮 سیستم کنترل پیشرفته راه‌اندازی شد');
    }

    setupJoystick() {
        const base = document.querySelector('.joystick-base');
        const handle = document.querySelector('.joystick-handle');
        
        if (!base || !handle) return;
        
        const rect = base.getBoundingClientRect();
        this.joystick.basePosition = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    setupTouch() {
        const joystickArea = document.querySelector('.touch-controls');
        
        joystickArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.touch.active) return;
            
            const touch = e.touches[0];
            this.touch.active = true;
            this.touch.identifier = touch.identifier;
            this.touch.startX = touch.clientX;
            this.touch.startY = touch.clientY;
            
            this.joystick.active = true;
        });

        joystickArea.addEventListener('touchmove', (e) => {
            if (!this.touch.active) return;
            
            e.preventDefault();
            
            // پیدا کردن لمس فعال
            let touch = null;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === this.touch.identifier) {
                    touch = e.touches[i];
                    break;
                }
            }
            
            if (!touch) return;
            
            const deltaX = touch.clientX - this.touch.startX;
            const deltaY = touch.clientY - this.touch.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);
            
            // محدود کردن به شعاع جویستیک
            const limitedDistance = Math.min(distance, this.joystick.radius);
            
            // موقعیت جدید هندل
            this.joystick.position.x = limitedDistance * Math.cos(angle);
            this.joystick.position.y = limitedDistance * Math.sin(angle);
            
            // حرکت هندل
            this.updateJoystickHandle();
            
            // تنظیم ورودی
            if (distance > 5) {
                this.input.targetX = Math.cos(angle) * (limitedDistance / this.joystick.radius);
                this.input.targetY = Math.sin(angle) * (limitedDistance / this.joystick.radius);
            } else {
                this.input.targetX = 0;
                this.input.targetY = 0;
            }
        });

        joystickArea.addEventListener('touchend', (e) => {
            this.resetJoystick();
        });

        joystickArea.addEventListener('touchcancel', (e) => {
            this.resetJoystick();
        });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            
            // جلوگیری از اسکرول با کلیدهای جهت‌دار
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    setupGamepad() {
        // پشتیبانی از گیم‌پد
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 گیم‌پد متصل شد:', e.gamepad);
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('🎮 گیم‌پد قطع شد:', e.gamepad);
        });
    }

    updateJoystickHandle() {
        const handle = document.querySelector('.joystick-handle');
        if (handle) {
            handle.style.transform = `translate(calc(-50% + ${this.joystick.position.x}px), calc(-50% + ${this.joystick.position.y}px))`;
        }
    }

    resetJoystick() {
        this.touch.active = false;
        this.touch.identifier = null;
        this.joystick.active = false;
        this.joystick.position = { x: 0, y: 0 };
        this.input.targetX = 0;
        this.input.targetY = 0;
        
        this.updateJoystickHandle();
    }

    update() {
        this.processKeyboard();
        this.processGamepad();
        this.smoothInput();
    }

    processKeyboard() {
        let x = 0, y = 0;
        
        if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) x += 1;
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) x -= 1;
        if (this.keys.has('ArrowDown') || this.keys.has('KeyS')) y += 1;
        if (this.keys.has('ArrowUp') || this.keys.has('KeyW')) y -= 1;
        
        // نرمال کردن حرکت مورب
        if (x !== 0 && y !== 0) {
            x *= 0.707;
            y *= 0.707;
        }
        
        if (x !== 0 || y !== 0) {
            this.input.targetX = x;
            this.input.targetY = y;
        }
    }

    processGamepad() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[0];
        
        if (!gamepad) return;
        
        // استفاده از استیک چپ
        const stickX = gamepad.axes[0];
        const stickY = gamepad.axes[1];
        
        // فیلتر کردن نویز
        const deadZone = 0.15;
        if (Math.abs(stickX) > deadZone || Math.abs(stickY) > deadZone) {
            this.input.targetX = stickX;
            this.input.targetY = stickY;
        }
    }

    smoothInput() {
        // اعمال حرکت نرم
        this.input.x += (this.input.targetX - this.input.x) * this.joystick.smoothness;
        this.input.y += (this.input.targetY - this.input.y) * this.joystick.smoothness;
        
        // کاهش مقادیر بسیار کوچک به صفر
        if (Math.abs(this.input.x) < 0.01) this.input.x = 0;
        if (Math.abs(this.input.y) < 0.01) this.input.y = 0;
    }

    getMovement() {
        return {
            x: this.input.x * this.joystick.sensitivity,
            y: this.input.y * this.joystick.sensitivity
        };
    }

    isMoving() {
        return Math.abs(this.input.x) > 0.1 || Math.abs(this.input.y) > 0.1;
    }

    getDirection() {
        return Math.atan2(this.input.y, this.input.x);
    }

    // برای دسکتاپ - حرکت با موس
    setupMouseFollow() {
        if (this.joystick.active) return; // اگر جویستیک فعال است، موس کار نکند
        
        document.addEventListener('mousemove', (e) => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 200;
            
            if (distance > 10) {
                const angle = Math.atan2(deltaY, deltaX);
                const normalizedDistance = Math.min(distance / maxDistance, 1);
                
                this.input.targetX = Math.cos(angle) * normalizedDistance;
                this.input.targetY = Math.sin(angle) * normalizedDistance;
            } else {
                this.input.targetX = 0;
                this.input.targetY = 0;
            }
        });
    }
}

const Controls = new AdvancedControls();
