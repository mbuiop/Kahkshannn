// m1.js - سیستم دوربین سینمایی
class CinematicCamera {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.controls = null;
        this.cameraModes = {
            FOLLOW: 'follow',
            ORBIT: 'orbit',
            CINEMATIC: 'cinematic',
            FIRST_PERSON: 'first_person'
        };
        this.currentMode = this.cameraModes.FOLLOW;
        this.target = null;
        this.offset = new THREE.Vector3(0, 20, 50);
        this.cinematicShots = [];
        this.currentShotIndex = 0;
        this.shotTimer = 0;
        
        this.init();
    }
    
    init() {
        // ایجاد کنترل‌های دوربین (در صورت نیاز)
        // this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enableDamping = true;
        // this.controls.dampingFactor = 0.05;
        
        // تعریف شات‌های سینمایی
        this.setupCinematicShots();
    }
    
    setupCinematicShots() {
        // شات‌های سینمایی از پیش تعریف شده
        this.cinematicShots = [
            {
                position: new THREE.Vector3(0, 30, 80),
                lookAt: new THREE.Vector3(0, 0, 0),
                duration: 5,
                ease: "power2.out"
            },
            {
                position: new THREE.Vector3(50, 20, 50),
                lookAt: new THREE.Vector3(0, 10, 0),
                duration: 4,
                ease: "power2.inOut"
            },
            {
                position: new THREE.Vector3(-40, 15, 60),
                lookAt: new THREE.Vector3(0, 5, 0),
                duration: 6,
                ease: "sine.inOut"
            }
        ];
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    setMode(mode) {
        this.currentMode = mode;
        
        switch(mode) {
            case this.cameraModes.FOLLOW:
                this.setupFollowMode();
                break;
            case this.cameraModes.ORBIT:
                this.setupOrbitMode();
                break;
            case this.cameraModes.CINEMATIC:
                this.startCinematicSequence();
                break;
            case this.cameraModes.FIRST_PERSON:
                this.setupFirstPersonMode();
                break;
        }
    }
    
    setupFollowMode() {
        // حالت تعقیب هدف
        this.offset.set(0, 20, 50);
    }
    
    setupOrbitMode() {
        // حالت چرخش دور هدف
        if (this.controls) {
            this.controls.enabled = true;
        }
    }
    
    setupFirstPersonMode() {
        // حالت اول شخص
        this.offset.set(0, 5, 0);
    }
    
    startCinematicSequence() {
        // شروع توالی سینمایی
        this.currentShotIndex = 0;
        this.shotTimer = 0;
        
        if (this.controls) {
            this.controls.enabled = false;
        }
        
        this.playNextShot();
    }
    
    playNextShot() {
        if (this.currentShotIndex >= this.cinematicShots.length) {
            this.currentShotIndex = 0;
            return;
        }
        
        const shot = this.cinematicShots[this.currentShotIndex];
        
        // انیمیشن حرکت دوربین به موقعیت جدید
        gsap.to(this.camera.position, {
            x: shot.position.x,
            y: shot.position.y,
            z: shot.position.z,
            duration: shot.duration,
            ease: shot.ease,
            onComplete: () => {
                this.shotTimer = shot.duration;
            }
        });
        
        // انیمیشن نگاه کردن به نقطه هدف
        gsap.to(this.camera.lookAt, {
            x: shot.lookAt.x,
            y: shot.lookAt.y,
            z: shot.lookAt.z,
            duration: shot.duration,
            ease: shot.ease
        });
        
        this.currentShotIndex++;
    }
    
    update(deltaTime) {
        if (this.controls) {
            this.controls.update();
        }
        
        switch(this.currentMode) {
            case this.cameraModes.FOLLOW:
                this.updateFollowMode(deltaTime);
                break;
            case this.cameraModes.CINEMATIC:
                this.updateCinematicMode(deltaTime);
                break;
            case this.cameraModes.FIRST_PERSON:
                this.updateFirstPersonMode(deltaTime);
                break;
        }
    }
    
    updateFollowMode(deltaTime) {
        if (!this.target) return;
        
        // محاسبه موقعیت هدف دوربین
        const targetPosition = new THREE.Vector3();
        targetPosition.copy(this.target.position);
        targetPosition.add(this.offset);
        
        // حرکت نرم دوربین به سمت هدف
        this.camera.position.lerp(targetPosition, 0.1);
        
        // نگاه کردن به هدف
        this.camera.lookAt(this.target.position);
    }
    
    updateCinematicMode(deltaTime) {
        this.shotTimer -= deltaTime;
        
        if (this.shotTimer <= 0) {
            this.playNextShot();
        }
    }
    
    updateFirstPersonMode(deltaTime) {
        if (!this.target) return;
        
        // موقعیت دوربین برابر با موقعیت هدف
        this.camera.position.copy(this.target.position);
        this.camera.position.add(this.offset);
        
        // چرخش دوربین برابر با چرخش هدف
        this.camera.rotation.copy(this.target.rotation);
    }
    
    shakeCamera(intensity = 1, duration = 0.5) {
        // ایجاد لرزش دوربین
        const originalPosition = this.camera.position.clone();
        const shakeAmount = intensity * 0.5;
        
        const shakeAnimation = gsap.to(this.camera.position, {
            x: `+=${(Math.random() - 0.5) * shakeAmount}`,
            y: `+=${(Math.random() - 0.5) * shakeAmount}`,
            z: `+=${(Math.random() - 0.5) * shakeAmount}`,
            duration: 0.05,
            repeat: Math.floor(duration / 0.1),
            yoyo: true,
            onComplete: () => {
                this.camera.position.copy(originalPosition);
            }
        });
        
        return shakeAnimation;
    }
    
    zoomTo(target, duration = 1) {
        // زوم روی هدف خاص
        const zoomAnimation = gsap.to(this.camera.position, {
            x: target.x,
            y: target.y + 10,
            z: target.z + 20,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.lookAt(target);
            }
        });
        
        return zoomAnimation;
    }
}

window.CinematicCamera = CinematicCamera;
