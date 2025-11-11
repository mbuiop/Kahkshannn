class SmoothCamera {
    constructor() {
        this.position = { x: 0, y: 0, z: 15 };
        this.target = { x: 0, y: 0, z: 0 };
        this.offset = { x: 0, y: 2, z: -8 };
        this.rotation = { x: 0, y: 0, z: 0 };
        
        this.smoothness = 0.1;
        this.shake = {
            intensity: 0,
            duration: 0,
            frequency: 10
        };
        
        this.fov = 60;
        this.near = 0.1;
        this.far = 1000;
        
        this.init();
    }

    init() {
        console.log('📷 دوربین روان راه‌اندازی شد');
    }

    update(playerPosition, playerRotation, deltaTime) {
        // محاسبه موقعیت هدف دوربین (پشت سفینه)
        const cosY = Math.cos(playerRotation.y);
        const sinY = Math.sin(playerRotation.y);
        const cosX = Math.cos(playerRotation.x);
        const sinX = Math.sin(playerRotation.x);
        
        this.target.x = playerPosition.x + this.offset.x * cosY + this.offset.z * sinY;
        this.target.y = playerPosition.y + this.offset.y * cosX;
        this.target.z = playerPosition.z - this.offset.x * sinY + this.offset.z * cosY;
        
        // حرکت نرم دوربین به سمت هدف
        this.position.x += (this.target.x - this.position.x) * this.smoothness;
        this.position.y += (this.target.y - this.position.y) * this.smoothness;
        this.position.z += (this.target.z - this.position.z) * this.smoothness;
        
        // اعمال لرزش دوربین
        this.applyScreenShake();
        
        // به‌روزرسانی چرخش دوربین
        this.rotation.x = playerRotation.x * 0.3;
        this.rotation.y = playerRotation.y;
    }

    applyScreenShake() {
        if (this.shake.duration > 0) {
            const intensity = this.shake.intensity * (this.shake.duration / 100);
            
            this.position.x += (Math.random() - 0.5) * intensity * 2;
            this.position.y += (Math.random() - 0.5) * intensity * 2;
            this.position.z += (Math.random() - 0.5) * intensity;
            
            this.shake.duration--;
        }
    }

    getViewMatrix() {
        const viewMatrix = mat4.create();
        
        // موقعیت دوربین
        const eye = [this.position.x, this.position.y, this.position.z];
        
        // نقطه نگاه دوربین (جلوی سفینه)
        const center = [
            this.position.x + Math.sin(this.rotation.y),
            this.position.y + Math.sin(this.rotation.x),
            this.position.z - Math.cos(this.rotation.y)
        ];
        
        // جهت بالا
        const up = [0, 1, 0];
        
        mat4.lookAt(viewMatrix, eye, center, up);
        return viewMatrix;
    }

    getProjectionMatrix() {
        const aspect = window.innerWidth / window.innerHeight;
        const projectionMatrix = mat4.create();
        
        mat4.perspective(
            projectionMatrix,
            this.fov * Math.PI / 180,
            aspect,
            this.near,
            this.far
        );
        
        return projectionMatrix;
    }

    shake(intensity = 5, duration = 30) {
        this.shake.intensity = intensity;
        this.shake.duration = duration;
    }

    setOffset(x, y, z) {
        this.offset = { x, y, z };
    }

    setSmoothness(value) {
        this.smoothness = Math.max(0.01, Math.min(1, value));
    }

    // تغییر FOV برای افکت‌های سرعت
    setFOV(fov) {
        this.fov = Math.max(30, Math.min(120, fov));
    }

    // ریست دوربین
    reset() {
        this.position = { x: 0, y: 0, z: 15 };
        this.target = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.shake = { intensity: 0, duration: 0, frequency: 10 };
    }

    // گرفتن موقعیت دوربین برای سیستم‌های دیگر
    getPosition() {
        return { ...this.position };
    }

    getDirection() {
        return {
            x: Math.sin(this.rotation.y),
            y: Math.sin(this.rotation.x),
            z: -Math.cos(this.rotation.y)
        };
    }
}

const Camera = new SmoothCamera();
