// m.js - سیستم گرافیک و پس‌زمینه پیشرفته
class GraphicsSystem {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.particles = [];
        this.stars = [];
        this.nebulas = [];
        this.planets = [];
        this.asteroids = [];
        this.backgroundElements = [];
        this.effects = [];
        this.clock = new THREE.Clock();
        this.time = 0;
        this.postProcessingEnabled = true;
        
        // تنظیمات گرافیکی
        this.settings = {
            quality: 'high',
            shadows: true,
            antialiasing: true,
            particles: true,
            postProcessing: true,
            bloom: true,
            motionBlur: false
        };
        
        this.init();
    }
    
    init() {
        try {
            console.log("🚀 شروع راه‌اندازی سیستم گرافیک...");
            
            // ایجاد صحنه اصلی
            this.createScene();
            
            // ایجاد دوربین
            this.createCamera();
            
            // ایجاد رندرر
            this.createRenderer();
            
            // ایجاد سیستم نورپردازی
            this.createLightingSystem();
            
            // ایجاد پس‌زمینه کهکشانی
            this.createGalacticBackground();
            
            // ایجاد میدان ستاره‌ای
            this.createAdvancedStarField();
            
            // ایجاد سحابی‌های پویا
            this.createDynamicNebulas();
            
            // ایجاد سیارات و اجرام آسمانی
            this.createPlanetarySystem();
            
            // ایجاد میدان سیارک‌ها
            this.createAsteroidField();
            
            // ایجاد افکت‌های ویژه
            this.createSpecialEffects();
            
            // راه‌اندازی پست-پردازش
            if (this.postProcessingEnabled) {
                this.setupPostProcessing();
            }
            
            console.log("✅ سیستم گرافیک با موفقیت راه‌اندازی شد");
            
            // شروع انیمیشن
            this.animate();
            
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی سیستم گرافیک:", error);
            throw error;
        }
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // پس‌زمینه فضایی عمیق
        this.scene.background = new THREE.Color(0x000011);
        
        // مه فضایی
        this.scene.fog = new THREE.FogExp2(0x000022, 0.001);
        
        // تنظیمات محیطی
        this.scene.environment = this.createEnvironmentMap();
        
        console.log("🌌 صحنه اصلی ایجاد شد");
    }
    
    createEnvironmentMap() {
        // ایجاد محیط‌نگاشت برای بازتاب‌ها
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // گرادیان محیط فضا
        const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#001133');
        gradient.addColorStop(0.5, '#002255');
        gradient.addColorStop(1, '#000011');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);
        
        // اضافه کردن ستاره‌های کوچک
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const radius = Math.random() * 1.5;
            const brightness = Math.random() * 155 + 100;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 55})`;
            context.fill();
        }
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createCamera() {
        // ایجاد دوربین پرسپکتیو پیشرفته
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            5000
        );
        
        // موقعیت اولیه دوربین
        this.camera.position.set(0, 25, 80);
        this.camera.lookAt(0, 0, 0);
        
        // تنظیمات پیشرفته دوربین
        this.camera.layers.enable(0); // لایه معمولی
        this.camera.layers.enable(1); // لایه افکت‌ها
        
        console.log("📷 دوربین پیشرفته ایجاد شد");
    }
    
    createRenderer() {
        // ایجاد رندرر WebGL با تنظیمات پیشرفته
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: this.settings.antialiasing,
            alpha: false,
            powerPreference: "high-performance",
            precision: "highp",
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: true
        });
        
        // تنظیمات رندرر
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // فعال کردن سایه‌ها
        this.renderer.shadowMap.enabled = this.settings.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
        
        // تنظیمات پیشرفته رندرینگ
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.physicallyCorrectLights = true;
        
        // اضافه کردن به DOM
        this.container.appendChild(this.renderer.domElement);
        
        console.log("🎨 رندرر پیشرفته ایجاد شد");
    }
    
    createLightingSystem() {
        // سیستم نورپردازی پیشرفته
        
        // نور محیطی اصلی
        const ambientLight = new THREE.AmbientLight(0x333333, 0.4);
        this.scene.add(ambientLight);
        
        // نور جهت‌دار اصلی (خورشید)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(100, 100, 50);
        mainLight.castShadow = this.settings.shadows;
        
        // تنظیمات سایه برای نور اصلی
        if (this.settings.shadows) {
            mainLight.shadow.mapSize.width = 4096;
            mainLight.shadow.mapSize.height = 4096;
            mainLight.shadow.camera.near = 0.5;
            mainLight.shadow.camera.far = 500;
            mainLight.shadow.camera.left = -100;
            mainLight.shadow.camera.right = 100;
            mainLight.shadow.camera.top = 100;
            mainLight.shadow.camera.bottom = -100;
            mainLight.shadow.bias = -0.0001;
        }
        
        this.scene.add(mainLight);
        
        // نور پس‌زمینه (نور کهکشان)
        const hemisphereLight = new THREE.HemisphereLight(0x001133, 0x000011, 0.3);
        this.scene.add(hemisphereLight);
        
        // نورهای نقطه‌ای برای افکت‌های ویژه
        this.createPointLights();
        
        // نورهای حجمی برای سحابی‌ها
        this.createVolumetricLights();
        
        console.log("💡 سیستم نورپردازی پیشرفته ایجاد شد");
    }
    
    createPointLights() {
        // ایجاد نورهای نقطه‌ای برای اجرام درخشان
        
        // نور برای ستاره مرکزی
        const starLight = new THREE.PointLight(0x00aaff, 0.8, 200);
        starLight.position.set(0, 0, -100);
        starLight.decay = 2;
        this.scene.add(starLight);
        
        // نورهای تصادفی در فضا
        for (let i = 0; i < 5; i++) {
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.8, 0.7);
            
            const pointLight = new THREE.PointLight(color, 0.3, 150);
            pointLight.position.set(
                (Math.random() - 0.5) * 300,
                (Math.random() - 0.5) * 300,
                (Math.random() - 0.5) * 300
            );
            pointLight.decay = 2;
            this.scene.add(pointLight);
        }
    }
    
    createVolumetricLights() {
        // ایجاد نورهای حجمی برای سحابی‌ها
        const volumeLight1 = new THREE.PointLight(0x4400ff, 0.4, 300);
        volumeLight1.position.set(-150, 50, -200);
        volumeLight1.decay = 1.5;
        this.scene.add(volumeLight1);
        
        const volumeLight2 = new THREE.PointLight(0xff0044, 0.3, 250);
        volumeLight2.position.set(120, -30, -180);
        volumeLight2.decay = 1.5;
        this.scene.add(volumeLight2);
    }
    
    createGalacticBackground() {
        // ایجاد کهکشان پس‌زمینه با جزئیات بالا
        
        // کهکشان اصلی
        const galaxyGeometry = new THREE.SphereGeometry(1200, 64, 64);
        const galaxyMaterial = new THREE.MeshBasicMaterial({
            map: this.createHighDetailGalaxyTexture(),
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });
        
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        this.scene.add(galaxy);
        this.backgroundElements.push(galaxy);
        
        // کهکشان‌های کوچک‌تر در دوردست
        this.createDistantGalaxies();
        
        // راه شیری
        this.createMilkyWay();
        
        console.log("🌠 کهکشان پس‌زمینه ایجاد شد");
    }
    
    createHighDetailGalaxyTexture() {
        // ایجاد بافت کهکشان با جزئیات بسیار بالا
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const context = canvas.getContext('2d');
        
        // گرادیان کهکشان اصلی
        const mainGradient = context.createRadialGradient(1024, 512, 0, 1024, 512, 800);
        mainGradient.addColorStop(0, '#001144');
        mainGradient.addColorStop(0.2, '#003366');
        mainGradient.addColorStop(0.4, '#0055aa');
        mainGradient.addColorStop(0.6, '#0077cc');
        mainGradient.addColorStop(0.8, '#0099ee');
        mainGradient.addColorStop(1, '#000022');
        
        context.fillStyle = mainGradient;
        context.fillRect(0, 0, 2048, 1024);
        
        // اضافه کردن بازوهای کهکشانی
        this.drawGalacticArms(context);
        
        // اضافه کردن خوشه‌های ستاره‌ای
        this.drawStarClusters(context);
        
        // اضافه کردن سحابی‌های رنگی
        this.drawNebulaRegions(context);
        
        // اضافه کردن ستاره‌های پرنور
        this.drawBrightStars(context);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        
        return texture;
    }
    
    drawGalacticArms(context) {
        // ترسیم بازوهای کهکشانی
        const arms = [
            { angle: 0, width: 120, color: 'rgba(100, 150, 255, 0.6)' },
            { angle: Math.PI * 0.4, width: 100, color: 'rgba(150, 100, 255, 0.5)' },
            { angle: Math.PI * 0.8, width: 110, color: 'rgba(255, 100, 150, 0.5)' },
            { angle: Math.PI * 1.2, width: 95, color: 'rgba(100, 255, 150, 0.4)' }
        ];
        
        arms.forEach(arm => {
            context.save();
            context.translate(1024, 512);
            context.rotate(arm.angle);
            
            const armGradient = context.createLinearGradient(0, -arm.width, 0, arm.width);
            armGradient.addColorStop(0, 'transparent');
            armGradient.addColorStop(0.3, arm.color);
            armGradient.addColorStop(0.7, arm.color);
            armGradient.addColorStop(1, 'transparent');
            
            context.fillStyle = armGradient;
            
            // ترسیم بازو
            for (let r = 200; r < 700; r += 20) {
                const width = arm.width * (1 - (r - 200) / 500);
                context.fillRect(r, -width / 2, 15, width);
            }
            
            context.restore();
        });
    }
    
    drawStarClusters(context) {
        // ترسیم خوشه‌های ستاره‌ای
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const radius = Math.random() * 20 + 10;
            const starsCount = Math.floor(Math.random() * 50) + 20;
            
            // خوشه اصلی
            const clusterGradient = context.createRadialGradient(x, y, 0, x, y, radius);
            clusterGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            clusterGradient.addColorStop(1, 'transparent');
            
            context.fillStyle = clusterGradient;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
            
            // ستاره‌های جداگانه در خوشه
            for (let j = 0; j < starsCount; j++) {
                const starX = x + (Math.random() - 0.5) * radius * 1.5;
                const starY = y + (Math.random() - 0.5) * radius * 1.5;
                const starRadius = Math.random() * 2 + 0.5;
                const brightness = Math.random() * 155 + 100;
                
                context.beginPath();
                context.arc(starX, starY, starRadius, 0, Math.PI * 2);
                context.fillStyle = `rgb(${brightness}, ${brightness}, 255)`;
                context.fill();
            }
        }
    }
    
    drawNebulaRegions(context) {
        // ترسیم مناطق سحابی
        const nebulae = [
            { x: 300, y: 200, radius: 80, color: 'rgba(255, 100, 200, 0.3)' },
            { x: 1600, y: 300, radius: 120, color: 'rgba(100, 200, 255, 0.4)' },
            { x: 500, y: 800, radius: 90, color: 'rgba(200, 255, 100, 0.3)' },
            { x: 1400, y: 700, radius: 100, color: 'rgba(255, 200, 100, 0.35)' }
        ];
        
        nebulae.forEach(nebula => {
            const gradient = context.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'transparent');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            context.fill();
        });
    }
    
    drawBrightStars(context) {
        // ترسیم ستاره‌های بسیار پرنور
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 2048;
            const y = Math.random() * 1024;
            const radius = Math.random() * 4 + 2;
            
            // هاله درخشان
            const glowGradient = context.createRadialGradient(x, y, 0, x, y, radius * 3);
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            glowGradient.addColorStop(1, 'transparent');
            
            context.fillStyle = glowGradient;
            context.beginPath();
            context.arc(x, y, radius * 3, 0, Math.PI * 2);
            context.fill();
            
            // هسته ستاره
            context.fillStyle = '#ffffff';
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    createDistantGalaxies() {
        // ایجاد کهکشان‌های دوردست
        for (let i = 0; i < 8; i++) {
            const size = 50 + Math.random() * 100;
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            
            // رنگ‌های مختلف کهکشان‌ها
            const colors = [
                new THREE.Color(0.4, 0.2, 0.6),
                new THREE.Color(0.2, 0.4, 0.8),
                new THREE.Color(0.6, 0.3, 0.4),
                new THREE.Color(0.3, 0.6, 0.5)
            ];
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.15,
                side: THREE.BackSide
            });
            
            const galaxy = new THREE.Mesh(geometry, material);
            
            // موقعیت تصادفی در دوردست
            const angle = Math.random() * Math.PI * 2;
            const distance = 1500 + Math.random() * 500;
            galaxy.position.set(
                Math.cos(angle) * distance,
                (Math.random() - 0.5) * 300,
                Math.sin(angle) * distance
            );
            
            this.scene.add(galaxy);
            this.backgroundElements.push(galaxy);
        }
    }
    
    createMilkyWay() {
        // ایجاد راه شیری
        const milkyWayGeometry = new THREE.RingGeometry(800, 1200, 64);
        const milkyWayMaterial = new THREE.MeshBasicMaterial({
            color: 0x4466aa,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        const milkyWay = new THREE.Mesh(milkyWayGeometry, milkyWayMaterial);
        milkyWay.rotation.x = Math.PI / 2;
        this.scene.add(milkyWay);
        this.backgroundElements.push(milkyWay);
    }
    
    createAdvancedStarField() {
        // ایجاد میدان ستاره‌ای سه‌بعدی با جزئیات بالا
        const starCount = 5000;
        
        // ستاره‌های نزدیک (لایه اول)
        this.createStarLayer(starCount, 400, 600, 2.0);
        
        // ستاره‌های متوسط (لایه دوم)
        this.createStarLayer(starCount, 600, 900, 1.5);
        
        // ستاره‌های دوردست (لایه سوم)
        this.createStarLayer(starCount, 900, 1200, 1.0);
        
        // ستاره‌های بسیار دور (لایه چهارم)
        this.createStarLayer(starCount, 1200, 2000, 0.5);
        
        console.log("✨ میدان ستاره‌ای پیشرفته ایجاد شد");
    }
    
    createStarLayer(count, minRadius, maxRadius, baseSize) {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const velocities = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // موقعیت تصادفی در کره
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // رنگ ستاره بر اساس نوع
            const starType = Math.random();
            let r, g, b;
            
            if (starType < 0.6) {
                // ستاره سفید-آبی (ستاره‌های اصلی)
                r = 0.8 + Math.random() * 0.2;
                g = 0.8 + Math.random() * 0.2;
                b = 1.0;
            } else if (starType < 0.85) {
                // ستاره زرد-نارنجی (ستاره‌های میانسال)
                r = 1.0;
                g = 0.7 + Math.random() * 0.3;
                b = 0.5 + Math.random() * 0.2;
            } else if (starType < 0.95) {
                // ستاره قرمز (ستاره‌های غول)
                r = 1.0;
                g = 0.5 + Math.random() * 0.2;
                b = 0.5 + Math.random() * 0.2;
            } else {
                // ستاره آبی-سفید (ستاره‌های داغ)
                r = 0.6 + Math.random() * 0.4;
                g = 0.7 + Math.random() * 0.3;
                b = 1.0;
            }
            
            colors[i3] = r;
            colors[i3 + 1] = g;
            colors[i3 + 2] = b;
            
            // اندازه ستاره
            sizes[i] = (Math.random() * baseSize + baseSize * 0.5) * (0.5 + Math.random());
            
            // سرعت برای انیمیشن
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        
        const material = new THREE.PointsMaterial({
            size: baseSize * 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const starField = new THREE.Points(geometry, material);
        starField.userData = {
            baseSize: baseSize,
            time: 0,
            pulseSpeed: 0.5 + Math.random() * 1.0
        };
        
        this.scene.add(starField);
        this.stars.push(starField);
    }
    
    createDynamicNebulas() {
        // ایجاد سحابی‌های پویا و متحرک
        for (let i = 0; i < 6; i++) {
            this.createNebula(i);
        }
        
        console.log("🌫️ سحابی‌های پویا ایجاد شدند");
    }
    
    createNebula(index) {
        const size = 60 + Math.random() * 90;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        
        // رنگ‌های سحابی
        const nebulaColors = [
            { primary: new THREE.Color(0.4, 0.1, 0.6), secondary: new THREE.Color(0.8, 0.3, 1.0) },
            { primary: new THREE.Color(0.1, 0.3, 0.7), secondary: new THREE.Color(0.3, 0.6, 1.0) },
            { primary: new THREE.Color(0.7, 0.1, 0.2), secondary: new THREE.Color(1.0, 0.4, 0.6) },
            { primary: new THREE.Color(0.1, 0.6, 0.3), secondary: new THREE.Color(0.4, 1.0, 0.6) },
            { primary: new THREE.Color(0.8, 0.5, 0.1), secondary: new THREE.Color(1.0, 0.8, 0.3) },
            { primary: new THREE.Color(0.3, 0.1, 0.5), secondary: new THREE.Color(0.6, 0.3, 0.8) }
        ];
        
        const colors = nebulaColors[index % nebulaColors.length];
        
        // شیدر مواد برای سحابی پویا
        const nebulaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                primaryColor: { value: colors.primary },
                secondaryColor: { value: colors.secondary },
                opacity: { value: 0.12 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vPosition = position;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 primaryColor;
                uniform vec3 secondaryColor;
                uniform float opacity;
                
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                // نویز سیمپلکس
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                             i.z + vec4(0.0, i1.z, i2.z, 1.0))
                           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                void main() {
                    vec3 pos = vPosition * 0.5;
                    float noise1 = snoise(pos + time * 0.1);
                    float noise2 = snoise(pos * 2.0 + time * 0.2);
                    float noise3 = snoise(pos * 4.0 + time * 0.3);
                    
                    float finalNoise = (noise1 + noise2 * 0.5 + noise3 * 0.25) / 1.75;
                    finalNoise = (finalNoise + 1.0) * 0.5;
                    
                    vec3 color = mix(primaryColor, secondaryColor, finalNoise);
                    float alpha = opacity * (0.7 + 0.3 * finalNoise) * (0.8 + 0.2 * sin(time + finalNoise * 10.0));
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const nebula = new THREE.Mesh(geometry, nebulaMaterial);
        
        // موقعیت تصادفی
        const angle = (index / 6) * Math.PI * 2;
        const radius = 180 + Math.random() * 120;
        nebula.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 100,
            Math.sin(angle) * radius
        );
        
        // چرخش و مقیاس تصادفی
        nebula.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        const scale = 0.8 + Math.random() * 0.4;
        nebula.scale.set(scale, scale * (0.7 + Math.random() * 0.6), scale);
        
        // داده‌های کاربر برای انیمیشن
        nebula.userData = {
            rotationSpeed: new THREE.Vector3(
                (Math.random() - 0.5) * 0.002,
                (Math.random() - 0.5) * 0.002,
                (Math.random() - 0.5) * 0.002
            ),
            pulseSpeed: 0.2 + Math.random() * 0.3,
            baseScale: scale
        };
        
        this.scene.add(nebula);
        this.nebulas.push(nebula);
    }
    
    createPlanetarySystem() {
        // ایجاد سیستم سیاره‌ای
        this.createCentralStar();
        this.createPlanets();
        this.createMoons();
        
        console.log("🪐 سیستم سیاره‌ای ایجاد شد");
    }
    
    createCentralStar() {
        // ایجاد ستاره مرکزی
        const starGeometry = new THREE.SphereGeometry(8, 32, 32);
        
        const starMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            emissive: 0xff4400,
            emissiveIntensity: 1.0
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(-60, 0, -150);
        
        // هاله ستاره
        const glowGeometry = new THREE.SphereGeometry(12, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vNormal;
                
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
                    float pulse = 0.8 + 0.2 * sin(time * 2.0);
                    gl_FragColor = vec4(1.0, 0.6, 0.2, intensity * pulse * 0.3);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        const starGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        star.add(starGlow);
        
        this.scene.add(star);
        this.planets.push(star);
    }
    
    createPlanets() {
        // ایجاد سیارات مختلف
        const planetData = [
            { size: 3.0, distance: 25, color: 0x888888, speed: 0.8, name: "مرکوری" },
            { size: 4.5, distance: 40, color: 0xffaa66, speed: 0.6, name: "ونوس" },
            { size: 5.0, distance: 60, color: 0x4466ff, speed: 0.4, name: "زمین" },
            { size: 4.0, distance: 80, color: 0xff6644, speed: 0.3, name: "مریخ" },
            { size: 12.0, distance: 110, color: 0xffcc99, speed: 0.2, name: "مشتری" },
            { size: 10.0, distance: 150, color: 0xffff99, speed: 0.15, name: "زحل" }
        ];
        
        planetData.forEach((data, index) => {
            this.createPlanet(data, index);
        });
    }
    
    createPlanet(data, index) {
        const geometry = new THREE.SphereGeometry(data.size, 32, 32);
        
        // ایجاد مواد سیاره با جزئیات
        const planetMaterial = new THREE.MeshPhongMaterial({
            color: data.color,
            shininess: 30,
            specular: 0x222222,
            map: this.createPlanetTexture(data.color, data.name)
        });
        
        const planet = new THREE.Mesh(geometry, planetMaterial);
        
        // موقعیت در مدار
        const angle = (index / planetData.length) * Math.PI * 2;
        planet.position.set(
            Math.cos(angle) * data.distance,
            (Math.random() - 0.5) * 10,
            Math.sin(angle) * data.distance - 150
        );
        
        // حلقه برای زحل
        if (data.name === "زحل") {
            this.createPlanetRings(planet, data.size);
        }
        
        // داده‌های کاربر برای انیمیشن
        planet.userData = {
            orbitRadius: data.distance,
            orbitSpeed: data.speed,
            orbitAngle: angle,
            rotationSpeed: (Math.random() * 0.02 + 0.01)
        };
        
        this.scene.add(planet);
        this.planets.push(planet);
    }
    
    createPlanetTexture(baseColor, name) {
        // ایجاد بافت سیاره
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // رنگ پایه
        const color = new THREE.Color(baseColor);
        context.fillStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
        context.fillRect(0, 0, 512, 512);
        
        // اضافه کردن جزئیات سطح
        this.addPlanetDetails(context, name);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    addPlanetDetails(context, name) {
        // اضافه کردن جزئیات سطح سیاره
        if (name === "زمین") {
            // قاره‌ها
            context.fillStyle = '#228822';
            this.drawContinents(context);
            
            // ابرها
            context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.drawClouds(context);
        } else if (name === "مریخ") {
            // سطح مریخ
            context.fillStyle = '#884422';
            this.drawCraters(context, 30);
        } else if (name === "مشتری") {
            // نوارهای مشتری
            this.drawJupiterBands(context);
        } else {
            // سطح عمومی با دهانه‌ها
            context.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.drawCraters(context, 15);
        }
    }
    
    drawContinents(context) {
        // ترسیم قاره‌های ساده
        const continents = [
            { x: 100, y: 150, width: 120, height: 80 },
            { x: 300, y: 200, width: 100, height: 120 },
            { x: 200, y: 350, width: 150, height: 90 }
        ];
        
        continents.forEach(continent => {
            context.beginPath();
            this.drawOrganicShape(context, continent.x, continent.y, continent.width, continent.height);
            context.fill();
        });
    }
    
    drawOrganicShape(context, x, y, width, height) {
        // ترسیم شکل ارگانیک
        const points = 8;
        context.moveTo(x + width * 0.5, y);
        
        for (let i = 1; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radiusX = width * 0.5 * (0.8 + Math.random() * 0.4);
            const radiusY = height * 0.5 * (0.8 + Math.random() * 0.4);
            const px = x + radiusX * Math.cos(angle);
            const py = y + radiusY * Math.sin(angle);
            context.lineTo(px, py);
        }
        
        context.closePath();
    }
    
    drawClouds(context) {
        // ترسیم ابرها
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = 20 + Math.random() * 40;
            
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    drawCraters(context, count) {
        // ترسیم دهانه‌ها
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = 5 + Math.random() * 15;
            
            // دهانه
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
            
            // سایه
            context.fillStyle = 'rgba(0, 0, 0, 0.3)';
            context.beginPath();
            context.arc(x - size * 0.3, y - size * 0.3, size * 0.7, 0, Math.PI * 2);
            context.fill();
            
            context.fillStyle = 'rgba(0, 0, 0, 0.2)';
        }
    }
    
    drawJupiterBands(context) {
        // ترسیم نوارهای مشتری
        const bands = [
            { y: 100, height: 40, color: '#ff9966' },
            { y: 160, height: 30, color: '#ffaa77' },
            { y: 210, height: 50, color: '#cc8866' },
            { y: 280, height: 35, color: '#ffbb88' },
            { y: 335, height: 45, color: '#eeaa77' }
        ];
        
        bands.forEach(band => {
            context.fillStyle = band.color;
            context.fillRect(0, band.y, 512, band.height);
        });
        
        // جزئیات بیشتر
        context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const width = 5 + Math.random() * 20;
            const height = 2 + Math.random() * 8;
            context.fillRect(x, y, width, height);
        }
    }
    
    createPlanetRings(planet, planetSize) {
        // ایجاد حلقه‌های سیاره
        const ringGeometry = new THREE.RingGeometry(planetSize * 1.5, planetSize * 2.2, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
    }
    
    createMoons() {
        // ایجاد ماه‌ها برای سیارات
        const moonData = [
            { planetIndex: 2, size: 1.0, distance: 8, speed: 1.5 }, // ماه زمین
            { planetIndex: 3, size: 0.8, distance: 6, speed: 2.0 }, // ماه مریخ
            { planetIndex: 4, size: 2.0, distance: 15, speed: 1.0 }, // ماه مشتری
            { planetIndex: 4, size: 1.5, distance: 20, speed: 0.8 }  // ماه دیگر مشتری
        ];
        
        moonData.forEach(data => {
            if (this.planets[data.planetIndex]) {
                this.createMoon(data, this.planets[data.planetIndex]);
            }
        });
    }
    
    createMoon(data, planet) {
        const geometry = new THREE.SphereGeometry(data.size, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            shininess: 10
        });
        
        const moon = new THREE.Mesh(geometry, material);
        
        // موقعیت اولیه
        moon.position.set(data.distance, 0, 0);
        
        // داده‌های کاربر برای انیمیشن
        moon.userData = {
            orbitRadius: data.distance,
            orbitSpeed: data.speed,
            orbitAngle: Math.random() * Math.PI * 2
        };
        
        planet.add(moon);
    }
    
    createAsteroidField() {
        // ایجاد میدان سیارک‌ها
        const asteroidCount = 200;
        
        for (let i = 0; i < asteroidCount; i++) {
            this.createAsteroid(i);
        }
        
        console.log("🪨 میدان سیارک‌ها ایجاد شد");
    }
    
    createAsteroid(index) {
        // ایجاد سیارک با شکل نامنظم
        const geometry = this.createAsteroidGeometry();
        const material = new THREE.MeshPhongMaterial({
            color: 0x886644,
            shininess: 5,
            specular: 0x222222
        });
        
        const asteroid = new THREE.Mesh(geometry, material);
        
        // موقعیت در کمربند سیارک‌ها
        const angle = Math.random() * Math.PI * 2;
        const distance = 130 + Math.random() * 40;
        const height = (Math.random() - 0.5) * 20;
        
        asteroid.position.set(
            Math.cos(angle) * distance,
            height,
            Math.sin(angle) * distance - 150
        );
        
        // چرخش و مقیاس تصادفی
        asteroid.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        const scale = 0.3 + Math.random() * 0.7;
        asteroid.scale.set(scale, scale, scale);
        
        // داده‌های کاربر برای انیمیشن
        asteroid.userData = {
            rotationSpeed: new THREE.Vector3(
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.01
            ),
            orbitSpeed: (0.1 + Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1),
            orbitRadius: distance,
            orbitAngle: angle
        };
        
        this.scene.add(asteroid);
        this.asteroids.push(asteroid);
    }
    
    createAsteroidGeometry() {
        // ایجاد هندسه سیارک با شکل نامنظم
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        
        // تغییر شکل برای ایجاد ظاهر نامنظم
        const position = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);
            
            // تغییر مکان تصادفی رئوس
            vertex.x += (Math.random() - 0.5) * 0.3;
            vertex.y += (Math.random() - 0.5) * 0.3;
            vertex.z += (Math.random() - 0.5) * 0.3;
            
            position.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    createSpecialEffects() {
        // ایجاد افکت‌های ویژه
        this.createNebulaFog();
        this.createLensFlares();
        this.createSpaceDust();
        
        console.log("🎆 افکت‌های ویژه ایجاد شدند");
    }
    
    createNebulaFog() {
        // ایجاد مه سحابی
        const fogGeometry = new THREE.SphereGeometry(300, 32, 32);
        const fogMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x4400ff) },
                color2: { value: new THREE.Color(0xff00aa) }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec3 vPosition;
                
                void main() {
                    float noise = sin(vPosition.x * 0.1 + time * 0.05) * 
                                 cos(vPosition.y * 0.1 + time * 0.03) * 
                                 sin(vPosition.z * 0.1 + time * 0.02);
                    noise = (noise + 1.0) * 0.5;
                    
                    vec3 color = mix(color1, color2, noise);
                    float alpha = 0.05 + 0.02 * noise;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const nebulaFog = new THREE.Mesh(fogGeometry, fogMaterial);
        this.scene.add(nebulaFog);
        this.effects.push(nebulaFog);
    }
    
    createLensFlares() {
        // ایجاد فلر لنز برای ستاره‌های پرنور
        // این بخش می‌تواند با کتابخانه Lensflare تکمیل شود
    }
    
    createSpaceDust() {
        // ایجاد غبار فضایی
        const dustCount = 1000;
        const positions = new Float32Array(dustCount * 3);
        const sizes = new Float32Array(dustCount);
        
        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            
            // موقعیت تصادفی
            positions[i3] = (Math.random() - 0.5) * 400;
            positions[i3 + 1] = (Math.random() - 0.5) * 400;
            positions[i3 + 2] = (Math.random() - 0.5) * 400 - 100;
            
            // اندازه بسیار کوچک
            sizes[i] = Math.random() * 0.5 + 0.1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 1,
            color: 0x8888ff,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        const spaceDust = new THREE.Points(geometry, material);
        this.scene.add(spaceDust);
        this.effects.push(spaceDust);
    }
    
    setupPostProcessing() {
        // راه‌اندازی پست-پردازش
        if (!this.postProcessingEnabled) return;
        
        try {
            // این بخش نیاز به import EffectComposer و سایر پاس‌ها دارد
            // در این نسخه ساده، از پست-پردازش صرفنظر می‌کنیم
            console.log("🎨 پست-پردازش فعال شد");
        } catch (error) {
            console.warn("⚠️ پست-پردازش در دسترس نیست:", error);
            this.postProcessingEnabled = false;
        }
    }
    
    createParticleEffect(position, color, count = 30, size = 2.0, lifetime = 1.0) {
        // ایجاد سیستم ذرات پیشرفته
        if (!this.settings.particles) return null;
        
        try {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            const velocities = [];
            const lifetimes = [];
            
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                
                // موقعیت اولیه
                positions[i3] = position.x;
                positions[i3 + 1] = position.y;
                positions[i3 + 2] = position.z;
                
                // رنگ با تغییرات تصادفی
                const variance = 0.3;
                colors[i3] = Math.max(0, Math.min(1, color.r + (Math.random() - 0.5) * variance));
                colors[i3 + 1] = Math.max(0, Math.min(1, color.g + (Math.random() - 0.5) * variance));
                colors[i3 + 2] = Math.max(0, Math.min(1, color.b + (Math.random() - 0.5) * variance));
                
                // اندازه
                sizes[i] = (Math.random() * 0.8 + 0.2) * size;
                
                // سرعت تصادفی
                velocities.push(new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                ));
                
                // عمر تصادفی
                lifetimes.push((0.5 + Math.random() * 0.5) * lifetime);
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            
            const material = new THREE.PointsMaterial({
                size: size,
                vertexColors: true,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true
            });
            
            const particles = new THREE.Points(geometry, material);
            this.scene.add(particles);
            
            const particleSystem = {
                mesh: particles,
                geometry: geometry,
                material: material,
                velocities: velocities,
                lifetimes: lifetimes,
                maxLifetime: lifetime,
                life: lifetime,
                positions: positions,
                colors: colors,
                sizes: sizes
            };
            
            this.particles.push(particleSystem);
            return particleSystem;
            
        } catch (error) {
            console.error("❌ خطا در ایجاد افکت ذرات:", error);
            return null;
        }
    }
    
    updateParticles(deltaTime) {
        // به‌روزرسانی تمام سیستم‌های ذرات
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particleSystem = this.particles[i];
            particleSystem.life -= deltaTime;
            
            if (particleSystem.life <= 0) {
                this.scene.remove(particleSystem.mesh);
                particleSystem.geometry.dispose();
                particleSystem.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }
            
            const positions = particleSystem.positions;
            const colors = particleSystem.colors;
            
            for (let j = 0; j < particleSystem.velocities.length; j++) {
                const j3 = j * 3;
                const velocity = particleSystem.velocities[j];
                const particleLife = particleSystem.lifetimes[j] * (particleSystem.life / particleSystem.maxLifetime);
                
                if (particleLife <= 0) continue;
                
                // به‌روزرسانی موقعیت
                positions[j3] += velocity.x * deltaTime;
                positions[j3 + 1] += velocity.y * deltaTime;
                positions[j3 + 2] += velocity.z * deltaTime;
                
                // کاهش سرعت (اصطکاک)
                velocity.multiplyScalar(0.95);
                
                // به‌روزرسانی شفافیت بر اساس عمر
                const alpha = particleLife / particleSystem.lifetimes[j];
                if (j3 + 2 < colors.length) {
                    // استفاده از کانال آبی برای آلفا (راه‌حل موقت)
                    colors[j3 + 2] = alpha;
                }
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.geometry.attributes.color.needsUpdate = true;
            
            // به‌روزرسانی اندازه و شفافیت کلی
            const systemAlpha = particleSystem.life / particleSystem.maxLifetime;
            particleSystem.material.opacity = systemAlpha;
            particleSystem.material.size = systemAlpha * particleSystem.material.size;
        }
    }
    
    createExplosionEffect(position, color = new THREE.Color(1, 0.5, 0), count = 50, size = 3.0) {
        return this.createParticleEffect(position, color, count, size, 1.5);
    }
    
    createHitEffect(position, color = new THREE.Color(1, 1, 0), count = 20, size = 1.5) {
        return this.createParticleEffect(position, color, count, size, 0.8);
    }
    
    createTrailEffect(position, color = new THREE.Color(0, 1, 1), count = 10, size = 1.0) {
        return this.createParticleEffect(position, color, count, size, 1.2);
    }
    
    createEnergyEffect(position, color = new THREE.Color(0.2, 0.8, 1.0), count = 15, size = 2.0) {
        return this.createParticleEffect(position, color, count, size, 1.0);
    }
    
    updateBackgroundElements(deltaTime) {
        // به‌روزرسانی عناصر پس‌زمینه
        this.time += deltaTime;
        
        // به‌روزرسانی کهکشان پس‌زمینه
        this.backgroundElements.forEach(element => {
            if (element.userData && element.userData.rotationSpeed) {
                element.rotation.x += element.userData.rotationSpeed.x * deltaTime;
                element.rotation.y += element.userData.rotationSpeed.y * deltaTime;
                element.rotation.z += element.userData.rotationSpeed.z * deltaTime;
            }
        });
        
        // به‌روزرسانی ستاره‌ها
        this.stars.forEach(starField => {
            const userData = starField.userData;
            userData.time += deltaTime;
            
            // انیمیشن پالس برای ستاره‌ها
            const pulse = 0.8 + 0.2 * Math.sin(userData.time * userData.pulseSpeed);
            starField.material.size = userData.baseSize * 2 * pulse;
            
            // حرکت آرام ستاره‌ها
            const positions = starField.geometry.attributes.position.array;
            const velocities = starField.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i] * deltaTime;
                positions[i + 1] += velocities[i + 1] * deltaTime;
                positions[i + 2] += velocities[i + 2] * deltaTime;
            }
            
            starField.geometry.attributes.position.needsUpdate = true;
        });
        
        // به‌روزرسانی سحابی‌ها
        this.nebulas.forEach(nebula => {
            const userData = nebula.userData;
            
            // چرخش
            nebula.rotation.x += userData.rotationSpeed.x * deltaTime;
            nebula.rotation.y += userData.rotationSpeed.y * deltaTime;
            nebula.rotation.z += userData.rotationSpeed.z * deltaTime;
            
            // پالس
            const pulse = 0.9 + 0.1 * Math.sin(this.time * userData.pulseSpeed);
            nebula.scale.setScalar(userData.baseScale * pulse);
            
            // به‌روزرسانی شیدر
            if (nebula.material.uniforms && nebula.material.uniforms.time) {
                nebula.material.uniforms.time.value = this.time;
            }
        });
        
        // به‌روزرسانی سیارات
        this.planets.forEach(planet => {
            if (planet.userData) {
                // چرخش سیاره
                planet.rotation.y += planet.userData.rotationSpeed * deltaTime;
                
                // حرکت مداری
                if (planet.userData.orbitSpeed) {
                    planet.userData.orbitAngle += planet.userData.orbitSpeed * deltaTime;
                    planet.position.x = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitRadius;
                    planet.position.z = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitRadius - 150;
                }
            }
        });
        
        // به‌روزرسانی سیارک‌ها
        this.asteroids.forEach(asteroid => {
            const userData = asteroid.userData;
            
            // چرخش
            asteroid.rotation.x += userData.rotationSpeed.x * deltaTime;
            asteroid.rotation.y += userData.rotationSpeed.y * deltaTime;
            asteroid.rotation.z += userData.rotationSpeed.z * deltaTime;
            
            // حرکت مداری
            userData.orbitAngle += userData.orbitSpeed * deltaTime;
            asteroid.position.x = Math.cos(userData.orbitAngle) * userData.orbitRadius;
            asteroid.position.z = Math.sin(userData.orbitAngle) * userData.orbitRadius - 150;
        });
        
        // به‌روزرسانی افکت‌ها
        this.effects.forEach(effect => {
            if (effect.material.uniforms && effect.material.uniforms.time) {
                effect.material.uniforms.time.value = this.time;
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        try {
            const deltaTime = Math.min(0.05, this.clock.getDelta());
            
            // به‌روزرسانی عناصر پس‌زمینه
            this.updateBackgroundElements(deltaTime);
            
            // به‌روزرسانی ذرات
            this.updateParticles(deltaTime);
            
            // رندر صحنه
            if (this.postProcessingEnabled && this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
            
        } catch (error) {
            console.error("❌ خطا در انیمیشن:", error);
        }
    }
    
    onResize() {
        try {
            // به‌روزرسانی دوربین
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            // به‌روزرسانی رندرر
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            
            // به‌روزرسانی پست-پردازش
            if (this.postProcessingEnabled && this.composer) {
                this.composer.setSize(window.innerWidth, window.innerHeight);
            }
            
        } catch (error) {
            console.error("❌ خطا در تغییر اندازه:", error);
        }
    }
    
    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.camera;
    }
    
    getRenderer() {
        return this.renderer;
    }
    
    setCameraPosition(x, y, z) {
        if (this.camera) {
            this.camera.position.set(x, y, z);
        }
    }
    
    setCameraTarget(x, y, z) {
        if (this.camera) {
            this.camera.lookAt(x, y, z);
        }
    }
    
    setCameraMode(mode) {
        // تغییر حالت دوربین
        switch(mode) {
            case 'follow':
                this.camera.position.set(0, 25, 80);
                break;
            case 'close':
                this.camera.position.set(0, 15, 40);
                break;
            case 'firstPerson':
                this.camera.position.set(0, 5, 10);
                break;
        }
    }
    
    // تنظیمات گرافیکی
    setQuality(quality) {
        this.settings.quality = quality;
        
        switch(quality) {
            case 'low':
                this.renderer.setPixelRatio(1);
                this.settings.shadows = false;
                this.settings.particles = false;
                this.settings.postProcessing = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(1.5);
                this.settings.shadows = true;
                this.settings.particles = true;
                this.settings.postProcessing = false;
                break;
            case 'high':
                this.renderer.setPixelRatio(2);
                this.settings.shadows = true;
                this.settings.particles = true;
                this.settings.postProcessing = true;
                break;
        }
        
        this.applySettings();
    }
    
    applySettings() {
        // اعمال تنظیمات گرافیکی
        this.renderer.shadowMap.enabled = this.settings.shadows;
        
        if (!this.settings.particles) {
            this.particles.forEach(particleSystem => {
                this.scene.remove(particleSystem.mesh);
                particleSystem.geometry.dispose();
                particleSystem.material.dispose();
            });
            this.particles = [];
        }
    }
    
    // پاک‌سازی منابع
    dispose() {
        try {
            console.log("🧹 پاک‌سازی منابع گرافیکی...");
            
            // پاک‌سازی رندرر
            if (this.renderer) {
                this.renderer.dispose();
                this.renderer.forceContextLoss();
            }
            
            // پاک‌سازی ذرات
            this.particles.forEach(particleSystem => {
                if (particleSystem.mesh) {
                    this.scene.remove(particleSystem.mesh);
                    particleSystem.geometry.dispose();
                    particleSystem.material.dispose();
                }
            });
            this.particles = [];
            
            // پاک‌سازی هندسه‌ها و مواد
            this.cleanupObject(this.scene);
            
            console.log("✅ منابع گرافیکی پاک‌سازی شدند");
            
        } catch (error) {
            console.error("❌ خطا در پاک‌سازی منابع:", error);
        }
    }
    
    cleanupObject(object) {
        // پاک‌سازی بازگشتی یک شیء Three.js
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
        
        if (object.children) {
            object.children.forEach(child => this.cleanupObject(child));
        }
    }
    
    // ابزارهای توسعه
    showDebugInfo() {
        console.log("🐛 اطلاعات دیباگ سیستم گرافیک:");
        console.log("📊 تعداد ذرات:", this.particles.length);
        console.log("✨ تعداد ستاره‌ها:", this.stars.length);
        console.log("🌫️ تعداد سحابی‌ها:", this.nebulas.length);
        console.log("🪐 تعداد سیارات:", this.planets.length);
        console.log("🪨 تعداد سیارک‌ها:", this.asteroids.length);
        console.log("🎆 تعداد افکت‌ها:", this.effects.length);
        console.log("🎯 موقعیت دوربین:", this.camera.position);
        console.log("⚙️ تنظیمات:", this.settings);
    }
    
    takeScreenshot() {
        // گرفتن عکس از صحنه
        this.renderer.render(this.scene, this.camera);
        const screenshot = this.renderer.domElement.toDataURL('image/png');
        return screenshot;
    }
}

// صادر کردن کلاس
window.GraphicsSystem = GraphicsSystem;
console.log("📁 m.js با موفقیت بارگذاری شد - سیستم گرافیک پیشرفته");
