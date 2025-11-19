// m.js - سیستم گرافیک و پس‌زمینه بازی
class GraphicsSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.stars = [];
        this.nebulas = [];
        
        this.init();
    }
    
    init() {
        // ایجاد صحنه
        this.scene = new THREE.Scene();
        
        // ایجاد دوربین
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
        
        // ایجاد رندرر
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
        
        // اضافه کردن نورها
        this.setupLighting();
        
        // ایجاد پس‌زمینه کهکشانی
        this.createGalaxyBackground();
        
        // ایجاد میدان ستاره‌ای
        this.createStarField();
        
        // ایجاد سحابی‌ها
        this.createNebulas();
        
        // شروع انیمیشن
        this.animate();
    }
    
    setupLighting() {
        // نور اصلی
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        // نور جهت‌دار
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // نور نقطه‌ای برای افکت‌های ویژه
        const pointLight = new THREE.PointLight(0x00aaff, 0.5, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    }
    
    createGalaxyBackground() {
        // ایجاد کهکشان پس‌زمینه
        const galaxyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        const galaxyMaterial = new THREE.MeshBasicMaterial({
            map: this.createGalaxyTexture(),
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });
        
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        this.scene.add(galaxy);
    }
    
    createGalaxyTexture() {
        // ایجاد بافت کهکشان به صورت برنامه‌نویسی
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // گرادیان کهکشان
        const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(0.3, '#003366');
        gradient.addColorStop(0.6, '#0055aa');
        gradient.addColorStop(1, '#000011');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        
        // اضافه کردن ستاره‌ها
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const radius = Math.random() * 1.5;
            const brightness = Math.random() * 200 + 55;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 55})`;
            context.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createStarField() {
        // ایجاد میدان ستاره‌ای سه‌بعدی
        const starCount = 2000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // موقعیت تصادفی در کره
            const radius = 800 + Math.random() * 200;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i3 + 2] = radius * Math.cos(phi);
            
            // رنگ ستاره
            const colorType = Math.random();
            if (colorType < 0.7) {
                // ستاره سفید-آبی
                starColors[i3] = 0.8 + Math.random() * 0.2;
                starColors[i3 + 1] = 0.8 + Math.random() * 0.2;
                starColors[i3 + 2] = 1.0;
            } else if (colorType < 0.9) {
                // ستاره زرد-نارنجی
                starColors[i3] = 1.0;
                starColors[i3 + 1] = 0.7 + Math.random() * 0.3;
                starColors[i3 + 2] = 0.5 + Math.random() * 0.2;
            } else {
                // ستاره قرمز
                starColors[i3] = 1.0;
                starColors[i3 + 1] = 0.5 + Math.random() * 0.2;
                starColors[i3 + 2] = 0.5 + Math.random() * 0.2;
            }
            
            // اندازه ستاره
            starSizes[i] = Math.random() * 2 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const starField = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(starField);
        this.stars = starField;
    }
    
    createNebulas() {
        // ایجاد سحابی‌های رنگی
        const nebulaCount = 5;
        
        for (let i = 0; i < nebulaCount; i++) {
            const nebulaGeometry = new THREE.SphereGeometry(150 + Math.random() * 100, 32, 32);
            
            // رنگ‌های مختلف سحابی
            const colors = [
                { r: 0.3, g: 0.1, b: 0.5 }, // بنفش
                { r: 0.1, g: 0.3, b: 0.6 }, // آبی
                { r: 0.6, g: 0.1, b: 0.2 }, // قرمز
                { r: 0.1, g: 0.5, b: 0.3 }, // سبز
                { r: 0.5, g: 0.3, b: 0.1 }  // نارنجی
            ];
            
            const color = colors[i % colors.length];
            const nebulaMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(color.r, color.g, color.b),
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });
            
            const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
            
            // موقعیت تصادفی
            const angle = (i / nebulaCount) * Math.PI * 2;
            const radius = 300 + Math.random() * 200;
            nebula.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.5,
                Math.sin(angle) * radius
            );
            
            // چرخش تصادفی
            nebula.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.scene.add(nebula);
            this.nebulas.push(nebula);
        }
    }
    
    createParticleEffect(position, color, count = 50) {
        // ایجاد افکت ذرات
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(count * 3);
        const particleColors = new Float32Array(count * 3);
        const particleVelocities = [];
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // موقعیت اولیه
            particlePositions[i3] = position.x;
            particlePositions[i3 + 1] = position.y;
            particlePositions[i3 + 2] = position.z;
            
            // رنگ
            particleColors[i3] = color.r;
            particleColors[i3 + 1] = color.g;
            particleColors[i3 + 2] = color.b;
            
            // سرعت تصادفی
            particleVelocities.push({
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
                z: (Math.random() - 0.5) * 10,
                life: 1.0
            });
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        
        const particleSystem = {
            mesh: particles,
            velocities: particleVelocities,
            life: 1.0
        };
        
        this.particles.push(particleSystem);
        return particleSystem;
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particleSystem = this.particles[i];
            particleSystem.life -= deltaTime * 0.5;
            
            if (particleSystem.life <= 0) {
                this.scene.remove(particleSystem.mesh);
                this.particles.splice(i, 1);
                continue;
            }
            
            const positions = particleSystem.mesh.geometry.attributes.position.array;
            const colors = particleSystem.mesh.geometry.attributes.color.array;
            
            for (let j = 0; j < particleSystem.velocities.length; j++) {
                const j3 = j * 3;
                const velocity = particleSystem.velocities[j];
                
                // به‌روزرسانی موقعیت
                positions[j3] += velocity.x * deltaTime;
                positions[j3 + 1] += velocity.y * deltaTime;
                positions[j3 + 2] += velocity.z * deltaTime;
                
                // کاهش سرعت
                velocity.x *= 0.98;
                velocity.y *= 0.98;
                velocity.z *= 0.98;
                
                // کاهش عمر
                velocity.life -= deltaTime;
                
                // به‌روزرسانی شفافیت بر اساس عمر
                const alpha = Math.max(0, velocity.life);
                colors[j3 + 3] = alpha;
            }
            
            particleSystem.mesh.geometry.attributes.position.needsUpdate = true;
            particleSystem.mesh.geometry.attributes.color.needsUpdate = true;
            
            // به‌روزرسانی اندازه بر اساس عمر
            particleSystem.mesh.material.opacity = particleSystem.life;
            particleSystem.mesh.material.size = particleSystem.life * 3;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const time = Date.now() * 0.001;
        const deltaTime = Math.min(0.05, this.clock ? this.clock.getDelta() : 0.016);
        
        if (!this.clock) {
            this.clock = new THREE.Clock();
        }
        
        // چرخش کهکشان
        if (this.stars) {
            this.stars.rotation.y += deltaTime * 0.01;
        }
        
        // چرخش سحابی‌ها
        this.nebulas.forEach((nebula, index) => {
            nebula.rotation.x += deltaTime * (0.01 + index * 0.005);
            nebula.rotation.y += deltaTime * (0.015 + index * 0.003);
        });
        
        // به‌روزرسانی ذرات
        this.updateParticles(deltaTime);
        
        // رندر صحنه
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
}

// صادر کردن برای استفاده در فایل‌های دیگر
window.GraphicsSystem = GraphicsSystem;
