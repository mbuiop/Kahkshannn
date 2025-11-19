// camera-system.js
class CameraSystem {
    constructor() {
        this.modes = ['FOLLOW', 'ORBIT', 'CINEMATIC', 'FREE'];
        this.currentMode = 0;
        this.position = { x: 0, y: 0, z: 500 };
        this.target = { x: 0, y: 0, z: 0 };
        this.up = { x: 0, y: 1, z: 0 };
        this.shake = { intensity: 0, duration: 0 };
        this.zoom = 1;
    }
    
    init() {
        this.setupEventListeners();
        this.createCameraControls();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'c':
                case 'C':
                    this.cycleMode();
                    break;
                case '+':
                    this.zoomIn();
                    break;
                case '-':
                    this.zoomOut();
                    break;
            }
        });
    }
    
    createCameraControls() {
        const controls = document.createElement('div');
        controls.className = 'camera-controls';
        controls.innerHTML = `
            <button onclick="cameraSystem.cycleMode()">دوربین: ${this.getModeName()}</button>
            <button onclick="cameraSystem.zoomIn()">+ بزرگنمایی</button>
            <button onclick="cameraSystem.zoomOut()">- کوچکنمایی</button>
        `;
        controls.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        `;
        
        document.body.appendChild(controls);
    }
    
    cycleMode() {
        this.currentMode = (this.currentMode + 1) % this.modes.length;
        this.showNotification(`حالت دوربین: ${this.getModeName()}`);
        this.updateCameraControls();
    }
    
    getModeName() {
        const names = {
            'FOLLOW': 'تعقیب‌کننده',
            'ORBIT': 'چرخنده', 
            'CINEMATIC': 'سینماتیک',
            'FREE': 'آزاد'
        };
        return names[this.modes[this.currentMode]] || this.modes[this.currentMode];
    }
    
    updateCameraControls() {
        const button = document.querySelector('.camera-controls button');
        if (button) {
            button.textContent = `دوربین: ${this.getModeName()}`;
        }
    }
    
    update(playerPosition, deltaTime) {
        this.applyShake(deltaTime);
        
        switch(this.modes[this.currentMode]) {
            case 'FOLLOW':
                this.followPlayer(playerPosition);
                break;
            case 'ORBIT':
                this.orbitPlayer(playerPosition, deltaTime);
                break;
            case 'CINEMATIC':
                this.cinematicMovement(playerPosition, deltaTime);
                break;
            case 'FREE':
                this.freeMovement(deltaTime);
                break;
        }
        
        this.applyZoom();
    }
    
    followPlayer(playerPosition) {
        const followDistance = 300 * this.zoom;
        const height = 100 * this.zoom;
        
        this.position.x = playerPosition.x - followDistance;
        this.position.y = playerPosition.y + height;
        this.position.z = playerPosition.z + followDistance;
        
        this.target.x = playerPosition.x;
        this.target.y = playerPosition.y;
        this.target.z = playerPosition.z;
    }
    
    orbitPlayer(playerPosition, deltaTime) {
        const orbitRadius = 400 * this.zoom;
        const orbitSpeed = 0.5;
        
        const time = Date.now() * 0.001 * orbitSpeed;
        this.position.x = playerPosition.x + Math.cos(time) * orbitRadius;
        this.position.y = playerPosition.y + 150 * this.zoom;
        this.position.z = playerPosition.z + Math.sin(time) * orbitRadius;
        
        this.target.x = playerPosition.x;
        this.target.y = playerPosition.y;
        this.target.z = playerPosition.z;
    }
    
    cinematicMovement(playerPosition, deltaTime) {
        const cinematicTime = Date.now() * 0.001 * 0.3;
        const radius = 600 * this.zoom;
        
        this.position.x = Math.cos(cinematicTime) * radius;
        this.position.y = 200 * this.zoom + Math.sin(cinematicTime * 0.7) * 100;
        this.position.z = Math.sin(cinematicTime) * radius;
        
        this.target.x = playerPosition.x;
        this.target.y = playerPosition.y;
        this.target.z = playerPosition.z;
    }
    
    freeMovement(deltaTime) {
        // حرکت آزاد دوربین - می‌تواند با ماوس/صفحه‌کلید کنترل شود
        this.position.x += Math.sin(Date.now() * 0.001) * 2;
        this.position.z += Math.cos(Date.now() * 0.001) * 2;
    }
    
    applyShake(deltaTime) {
        if (this.shake.duration > 0) {
            const intensity = this.shake.intensity;
            this.position.x += (Math.random() - 0.5) * intensity;
            this.position.y += (Math.random() - 0.5) * intensity;
            this.position.z += (Math.random() - 0.5) * intensity;
            
            this.shake.duration -= deltaTime;
        }
    }
    
    applyZoom() {
        // اعمال بزرگنمایی بر روی موقعیت دوربین
        this.position.x *= this.zoom;
        this.position.y *= this.zoom;
        this.position.z *= this.zoom;
    }
    
    setShake(intensity, duration) {
        this.shake.intensity = intensity;
        this.shake.duration = duration;
    }
    
    zoomIn() {
        this.zoom = Math.min(2, this.zoom + 0.1);
        this.showNotification(`بزرگنمایی: ${Math.round(this.zoom * 100)}%`);
    }
    
    zoomOut() {
        this.zoom = Math.max(0.5, this.zoom - 0.1);
        this.showNotification(`بزرگنمایی: ${Math.round(this.zoom * 100)}%`);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 10px;
            z-index: 1000;
            font-family: inherit;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    // توابع کمکی برای تبدیل مختصات
    worldToScreen(worldPos) {
        // تبدیل مختصات سه‌بعدی جهان به مختصات دو‌بعدی صفحه
        return {
            x: (worldPos.x - this.position.x) * this.zoom + window.innerWidth / 2,
            y: (worldPos.y - this.position.y) * this.zoom + window.innerHeight / 2
        };
    }
    
    screenToWorld(screenPos) {
        // تبدیل مختصات دو‌بعدی صفحه به مختصات سه‌بعدی جهان
        return {
            x: (screenPos.x - window.innerWidth / 2) / this.zoom + this.position.x,
            y: (screenPos.y - window.innerHeight / 2) / this.zoom + this.position.y,
            z: 0
        };
    }
}

// اضافه کردن استایل‌های انیمیشن دوربین
const cameraStyles = document.createElement('style');
cameraStyles.textContent = `
    @keyframes blackHoleSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes cometMove {
        0% { transform: translateX(0) translateY(0); opacity: 1; }
        50% { transform: translateX(100px) translateY(50px); opacity: 0.8; }
        100% { transform: translateX(200px) translateY(100px); opacity: 0; }
    }
    
    @keyframes supernovaPulse {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.2); opacity: 1; }
    }
    
    @keyframes pulsarFlash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
    
    .camera-controls button {
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-family: inherit;
        backdrop-filter: blur(5px);
    }
    
    .camera-controls button:hover {
        background: rgba(0, 100, 255, 0.7);
    }
`;
document.head.appendChild(cameraStyles);
