// سیستم گرافیک و رندرینگ پیشرفته
class GraphicsSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.scene = new BABYLON.Scene(this.engine);
        this.setupScene();
        this.setupPostProcessing();
    }
    
    setupScene() {
        // تنظیمات پیشرفته صحنه
        this.scene.clearColor = new BABYLON.Color4(0.01, 0.02, 0.06, 1.0);
        this.scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.2);
        
        // نورپردازی سینمایی
        this.setupCinematicLighting();
        
        // دوربین سینمایی
        this.setupCinematicCamera();
        
        // بهینه‌سازی‌های رندرینگ
        this.optimizeRendering();
    }
    
    setupCinematicLighting() {
        // نور اصلی جهت‌دار
        const sunLight = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.5, -1, -0.3), this.scene);
        sunLight.intensity = 1.5;
        sunLight.specular = new BABYLON.Color3(0.8, 0.9, 1);
        
        // نور محیطی پویا
        const ambient = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), this.scene);
        ambient.intensity = 0.4;
        ambient.groundColor = new BABYLON.Color3(0.1, 0.1, 0.3);
        
        // نورهای نقطه‌ای برای جلوه‌های ویژه
        this.effectLights = [];
        for (let i = 0; i < 3; i++) {
            const light = new BABYLON.PointLight(`effectLight${i}`, BABYLON.Vector3.Zero(), this.scene);
            light.intensity = 0;
            this.effectLights.push(light);
        }
    }
    
    setupCinematicCamera() {
        // دوربین FollowCamera پیشرفته
        this.camera = new BABYLON.FollowCamera("cinematicCam", new BABYLON.Vector3(0, 2, -12), this.scene);
        this.camera.radius = 15;
        this.camera.heightOffset = 4;
        this.camera.rotationOffset = 0;
        this.camera.cameraAcceleration = 0.05;
        this.camera.maxCameraSpeed = 8;
        this.camera.fov = 0.8;
        this.camera.minZ = 0.1;
        this.camera.maxZ = 2000;
        this.camera.attachControl(this.canvas, true);
    }
    
    setupPostProcessing() {
        if (!BABYLON.DefaultRenderingPipeline) return;
        
        // پایپلاین رندرینگ پیشرفته
        this.pipeline = new BABYLON.DefaultRenderingPipeline("advancedPipeline", true, this.scene, [this.camera]);
        
        // Bloom سینمایی
        this.pipeline.bloomEnabled = true;
        this.pipeline.bloomThreshold = 0.6;
        this.pipeline.bloomWeight = 0.4;
        this.pipeline.bloomKernel = 64;
        this.pipeline.bloomScale = 0.5;
        
        // Depth of Field سینمایی
        this.pipeline.depthOfFieldEnabled = true;
        this.pipeline.depthOfField.focalLength = 80;
        this.pipeline.depthOfField.fStop = 1.4;
        this.pipeline.depthOfField.focusDistance = 50;
        
        // Chromatic Aberration
        this.pipeline.chromaticAberrationEnabled = true;
        this.pipeline.chromaticAberration.aberrationAmount = 1.2;
        
        // Film Grain
        this.pipeline.grainEnabled = true;
        this.pipeline.grain.animated = true;
        this.pipeline.grain.intensity = 0.1;
        
        // Motion Blur
        this.pipeline.motionBlurEnabled = true;
        this.pipeline.motionBlur.objectBased = true;
    }
    
    optimizeRendering() {
        // بهینه‌سازی‌های پیشرفته
        this.scene.performancePriority = BABYLON.ScenePerformancePriority.Aggressive;
        this.scene.autoClear = false;
        this.scene.autoClearDepthAndStencil = false;
        
        // تنظیمات سایه‌ها
        this.scene.shadowsEnabled = true;
        
        // مدیریت LOD
        this.scene.LODEnabled = true;
    }
    
    createExplosion(position, scale = 1, color = new BABYLON.Color3(1, 0.5, 0)) {
        // سیستم ذرات انفجار پیشرفته
        const particleSystem = new BABYLON.ParticleSystem("explosion", 2000, this.scene);
        
        particleSystem.emitter = position;
        particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
        
        particleSystem.color1 = new BABYLON.Color4(color.r, color.g, color.b, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 1, 0.3, 1);
        particleSystem.colorDead = new BABYLON.Color4(0.2, 0, 0, 0);
        
        particleSystem.minSize = 0.1 * scale;
        particleSystem.maxSize = 0.8 * scale;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.5;
        particleSystem.emitRate = 3000;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
        particleSystem.minEmitPower = 0.5 * scale;
        particleSystem.maxEmitPower = 2 * scale;
        particleSystem.updateSpeed = 0.01;
        
        particleSystem.start();
        
        // پاک‌سازی خودکار
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => particleSystem.dispose(), 2000);
        }, 300);
    }
          }
