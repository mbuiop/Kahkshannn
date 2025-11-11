// سیستم دوربین هوشمند
class CameraSystem {
    constructor() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.smoothness = 0.1;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
    }

    followPlayer(playerX, playerY) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // محاسبه افست برای قرار دادن بازیکن در مرکز
        this.targetOffsetX = centerX - playerX;
        this.targetOffsetY = centerY - playerY;
        
        // اعمال حرکت نرم دوربین
        this.offsetX += (this.targetOffsetX - this.offsetX) * this.smoothness;
        this.offsetY += (this.targetOffsetY - this.offsetY) * this.smoothness;
        
        // اعمال لرزش دوربین (اگر فعال باشد)
        if (this.shakeDuration > 0) {
            this.applyScreenShake();
            this.shakeDuration--;
        }
        
        // اعمال ترانسفورمیشن به المان‌های بازی
        this.applyCameraTransform();
    }

    applyCameraTransform() {
        const gameElements = document.getElementById('gameElements');
        if (gameElements) {
            // حرکت المان‌های بازی در جهت مخالف دوربین (ایجاد حس حرکت)
            gameElements.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px)`;
        }
        
        // حرکت کهکشان با سرعت کمتر (اثر پارالاکس)
        const universe = document.getElementById('universeBackground');
        if (universe) {
            const parallaxFactor = 0.5;
            universe.style.transform = `translate(${this.offsetX * parallaxFactor}px, ${this.offsetY * parallaxFactor}px)`;
        }
    }

    applyScreenShake() {
        if (this.shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            
            this.offsetX += shakeX;
            this.offsetY += shakeY;
        }
    }

    // ایجاد لرزش صفحه (برای برخوردها یا انفجارها)
    shake(intensity = 10, duration = 20) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    // تنظیم زوم دوربین
    setZoom(zoomLevel) {
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.transform = `scale(${zoomLevel})`;
        }
    }

    // ریست دوربین به حالت اولیه
    reset() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        
        this.applyCameraTransform();
    }

    // حرکت به موقعیت خاص
    moveTo(x, y, duration = 1000) {
        this.targetOffsetX = x;
        this.targetOffsetY = y;
        
        // انیمیشن حرکت نرم
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.offsetX = this.offsetX + (this.targetOffsetX - this.offsetX) * easeProgress;
            this.offsetY = this.offsetY + (this.targetOffsetY - this.offsetY) * easeProgress;
            
            this.applyCameraTransform();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // گرفتن موقعیت فعلی دوربین
    getPosition() {
        return {
            x: -this.offsetX,
            y: -this.offsetY
        };
    }

    // بررسی آیا المان در دید دوربین است
    isElementInView(x, y, width, height) {
        const cameraX = -this.offsetX;
        const cameraY = -this.offsetY;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        return (
            x + width > cameraX &&
            x < cameraX + screenWidth &&
            y + height > cameraY &&
            y < cameraY + screenHeight
        );
    }
}

// ایجاد نمونه دوربین
const Camera = new CameraSystem();
