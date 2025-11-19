// m1.js - سیستم دوربین سینماتیک
class CameraSystem {
    constructor() {
        this.modes = ['CINEMATIC', 'FOLLOW', 'ORBIT', 'DYNAMIC'];
        this.currentMode = 0;
        this.position = { x: 0, y: 0, z: 1000 };
        this.target = { x: 0, y: 0, z: 0 };
        this.up = { x: 0, y: 1, z: 0 };
        this.zoom = 1;
        this.shake = { intensity: 0, duration: 0 };
        this.animationId = null;
        this.cameraElement = null;
        this.cameraPaths = [];
        this.currentPathIndex = 0;
        this.pathProgress = 0;
    }

    init() {
        this.createCameraElement();
        this.generateCameraPaths();
        this.setupEventListeners();
        this.startCameraAnimation();
        
        console.log('سیستم دوربین سینماتیک راه‌اندازی شد');
    }

    createCameraElement() {
        this.cameraElement = document.createElement('div');
        this.cameraElement.id = 'cameraSystem';
        this.cameraElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            perspective: 1000px;
            transform-style: preserve-3d;
        `;
        document.getElementById('gameContainer').appendChild(this.cameraElement);
    }

    generateCameraPaths() {
        // مسیرهای مختلف دوربین برای فیلم‌برداری سینماتیک
        this.cameraPaths = [
            // مسیر 1: حرکت دایره‌ای بزرگ
            (progress) => {
                const radius = 800;
                const angle = progress * Math.PI * 2;
                return {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle * 0.5) * 200 + 300,
                    z: Math.sin(angle) * radius
                };
            },
            // مسیر 2: حرکت مارپیچ
            (progress) => {
                const radius = 600;
                const angle = progress * Math.PI * 4;
                const height = progress * 1000 - 500;
                return {
                    x: Math.cos(angle) * radius,
                    y: height,
                    z: Math.sin(angle) * radius
                };
            },
            // مسیر 3: حرکت زیگزاگ
            (progress) => {
                return {
                    x: Math.sin(progress * Math.PI * 8) * 400,
                    y: Math.cos(progress * Math.PI * 4) * 200 + 400,
                    z: progress * 1000 - 500
                };
            },
            // مسیر 4: حرکت تصادفی کنترل شده
            (progress) => {
                return {
                    x: Math.sin(progress * Math.PI * 6) * 300 + Math.cos(progress * Math.PI * 2) * 200,
                    y: Math.sin(progress * Math.PI * 3) * 150 + 350,
                    z: Math.cos(progress * Math.PI * 4) * 400
                };
            }
        ];
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'c':
                case 'C':
                    this.cycleCameraMode();
                    break;
                case 'ArrowUp':
                    this.zoomIn();
                    break;
                case 'ArrowDown':
                    this.zoomOut();
                    break;
                case ' ':
                    this.toggleCameraMovement();
                    break;
            }
        });

        // کنترل‌های لمسی برای موبایل
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                this.zoomIn();
            }
        });
    }

    cycleCameraMode() {
        this.currentMode = (this.currentMode + 1) % this.modes.length;
        this.showNotification(`حالت دوربین: ${this.getModeName()}`);
    }

    getModeName() {
        const names = {
            'CINEMATIC': 'سینماتیک',
            'FOLLOW': 'تعقیب‌کننده',
            'ORBIT': 'چرخنده',
            'DYNAMIC': 'پویا'
        };
        return names[this.modes[this.currentMode]];
    }

    zoomIn() {
        this.zoom = Math.min(2, this.zoom + 0.1);
        this.applyCameraTransform();
    }

    zoomOut() {
        this.zoom = Math.max(0.5, this.zoom - 0.1);
        this.applyCameraTransform();
    }

    toggleCameraMovement() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        } else {
            this.startCameraAnimation();
        }
    }

    startCameraAnimation() {
        let lastTime = performance.now();
        
        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            this.updateCamera(deltaTime);
            this.applyCameraTransform();

            this.animationId = requestAnimationFrame(animate);
        };

        this.animationId = requestAnimationFrame(animate);
    }

    updateCamera(deltaTime) {
        const speed = 0.0005;

        switch(this.modes[this.currentMode]) {
            case 'CINEMATIC':
                this.updateCinematicMode(deltaTime, speed);
                break;
            case 'FOLLOW':
                this.updateFollowMode(deltaTime);
                break;
            case 'ORBIT':
                this.updateOrbitMode(deltaTime, speed);
                break;
            case 'DYNAMIC':
                this.updateDynamicMode(deltaTime, speed);
                break;
        }

        // اعمال لرزش دوربین
        this.applyCameraShake(deltaTime);
    }

    updateCinematicMode(deltaTime, speed) {
        this.pathProgress += speed * deltaTime;
        if (this.pathProgress >= 1) {
            this.pathProgress = 0;
            this.currentPathIndex = (this.currentPathIndex + 1) % this.cameraPaths.length;
        }

        const pathFunction = this.cameraPaths[this.currentPathIndex];
        const newPosition = pathFunction(this.pathProgress);
        
        this.position.x = newPosition.x;
        this.position.y = newPosition.y;
        this.position.z = newPosition.z;

        // هدف دوربین به مرکز صفحه
        this.target.x = 0;
        this.target.y = 0;
        this.target.z = 0;
    }

    updateFollowMode(deltaTime) {
        // در این حالت دوربین بازیکن را دنبال می‌کند
        const followDistance = 500;
        this.position.x = -followDistance;
        this.position.y = 200;
        this.position.z = followDistance;
    }

    updateOrbitMode(deltaTime, speed) {
        const radius = 600;
        const angle = performance.now() * 0.001 * speed * 10;
        
        this.position.x = Math.cos(angle) * radius;
        this.position.y = 300;
        this.position.z = Math.sin(angle) * radius;
        
        this.target.x = 0;
        this.target.y = 0;
        this.target.z = 0;
    }

    updateDynamicMode(deltaTime, speed) {
        // حرکت پویا و تصادفی
        const time = performance.now() * 0.001;
        
        this.position.x = Math.sin(time * 0.5) * 400 + Math.cos(time * 0.3) * 200;
        this.position.y = Math.sin(time * 0.7) * 150 + 350;
        this.position.z = Math.cos(time * 0.4) * 300 + Math.sin(time * 0.2) * 100;
        
        this.target.x = Math.cos(time * 0.6) * 100;
        this.target.y = Math.sin(time * 0.8) * 50;
        this.target.z = 0;
    }

    applyCameraTransform() {
        // اعمال تبدیل‌های دوربین با در نظر گرفتن بزرگنمایی و لرزش
        let shakeX = 0, shakeY = 0, shakeZ = 0;
        
        if (this.shake.duration > 0) {
            shakeX = (Math.random() - 0.5) * this.shake.intensity * 2;
            shakeY = (Math.random() - 0.5) * this.shake.intensity * 2;
            shakeZ = (Math.random() - 0.5) * this.shake.intensity;
        }

        const transform = `
            translate3d(${this.position.x + shakeX}px, ${this.position.y + shakeY}px, ${this.position.z + shakeZ}px)
            scale(${this.zoom})
            rotateX(${this.calculateTilt()}deg)
        `;

        this.cameraElement.style.transform = transform;
    }

    applyCameraShake(deltaTime) {
        if (this.shake.duration > 0) {
            this.shake.duration -= deltaTime;
            if (this.shake.duration <= 0) {
                this.shake.intensity = 0;
            }
        }
    }

    calculateTilt() {
        // محاسبه شیب دوربین بر اساس موقعیت
        const distanceToTarget = Math.sqrt(
            Math.pow(this.position.x - this.target.x, 2) +
            Math.pow(this.position.y - this.target.y, 2) +
            Math.pow(this.position.z - this.target.z, 2)
        );
        
        return Math.max(-30, Math.min(30, (this.position.y - this.target.y) / distanceToTarget * 50));
    }

    setShake(intensity, duration) {
        this.shake.intensity = intensity;
        this.shake.duration = duration;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 10px;
            z-index: 1000;
            font-family: inherit;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.cameraElement) {
            this.cameraElement.remove();
        }
    }
}

// ایجاد نمونه از کلاس برای استفاده جهانی
window.CameraSystem = CameraSystem;
