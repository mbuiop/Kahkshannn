// m.js - سیستم گرافیک و پس‌زمینه
class GraphicsSystem {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.stars = [];
        this.nebulas = [];
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        try {
            // ایجاد صحنه
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000011);
            this.scene.fog = new THREE.Fog(0x000022, 50, 300);
            
            // ایجاد دوربین
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
            this.camera.position.set(0, 30, 80);
            this.camera.lookAt(0, 0, 0);
            
            // ایجاد رندرر
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: false,
                powerPreference: "high-performance"
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            
            this.container.appendChild(this.renderer.domElement);
            
            // اضافه کردن نورها
            this.setupLighting();
            
            // ایجاد پس‌زمینه کهکشانی
            this.createGalaxyBackground();
            
            // ایجاد میدان ستاره‌ای
            this.createStarField();
            
            // ایجاد سحابی‌ها
            this.createNebulas();
            
            console.log("✅ سیستم گرافیک راه‌اندازی شد");
            
            // شروع انیمیشن
            this.animate();
            
        } catch (error) {
            console.error("❌ خطا در راه‌اندازی سیستم گرافیک:", error);
        }
    }
    
    setupLighting() {
        // نور محیطی
        const ambientLight = new THREE.AmbientLight(0x333333, 0.6);
        this.scene.add(ambientLight);
        
        // نور جهت‌دار اصلی
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // نور نقطه‌ای برای افکت‌های ویژه
        const pointLight = new THREE.PointLight(0x00aaff, 0.5, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
        
        // نور پس‌زمینه
        const backLight = new THREE.HemisphereLight(0x001133, 0x000011, 0.3);
        this.scene.add(backLight);
    }
    
    createGalaxyBackground() {
        // ایجاد کهکشان پس‌زمینه با تکسچر داینامیک
        const galaxyGeometry = new THREE.SphereGeometry(800, 32, 32);
        const galaxyMaterial = new THREE.MeshBasicMaterial({
            map: this.createGalaxyTexture(),
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.8
        });
        
        const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
        this.scene.add(galaxy);
        
        // انیمیشن چرخش کهکشان
        this.animateGalaxy(galaxy);
    }
    
    createGalaxyTexture() {
        // ایجاد بافت کهکشان به صورت برنامه‌نویسی
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const context = canvas.getContext('2d');
        
        // گرادیان کهکشان
        const gradient = context.createRadialGradient(512, 512, 0, 512, 512, 512);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(0.2, '#003366');
        gradient.addColorStop(0.4, '#0055aa');
        gradient.addColorStop(0.6, '#0077cc');
        gradient.addColorStop(0.8, '#0099ee');
        gradient.addColorStop(1, '#000011');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1024, 1024);
        
        // اضافه کردن ستاره‌های بزرگ
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const radius = Math.random() * 3 + 1;
            const brightness = Math.random() * 155 + 100;
            
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 55})`;
            context.fill();
        }
        
        // اضافه کردن سحابی‌های رنگی
        this.addNebulaToTexture(context, 200, 200, 150, 'rgba(100, 50, 200, 0.3)');
        this.addNebulaToTexture(context, 800, 300, 120, 'rgba(200, 100, 50, 0.2)');
        this.addNebulaToTexture(context, 400, 700, 180, 'rgba(50, 150, 200, 0.25)');
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }
    
    addNebulaToTexture(context, x, y, size, color) {
        const gradient = context.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        context.fillStyle = gradient;
        context.fillRect(x - size, y - size, size * 2, size * 2);
    }
    
    createStarField() {
        // ایجاد میدان ستاره‌ای سه‌بعدی
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // موقعیت تصادفی در کره
            const radius = 500 + Math.random() * 300;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // رنگ ستاره
            const colorType = Math.random();
            let r, g, b;
            
            if (colorType < 0.7) {
                // ستاره سفید-آبی
                r = 0.8 + Math.random() * 0.2;
                g = 0.8 + Math.random() * 0.2;
                b = 1.0;
            } else if (colorType < 0.9) {
                // ستاره زرد-نارنجی
                r = 1.0;
                g = 0.7 + Math.random() * 0.3;
                b = 0.5 + Math.random() * 0.2;
            } else {
                // ستاره قرمز
                r = 1.0;
                g = 0.5 + Math.random() * 0.2;
                b = 0.5 + Math.random() * 0.2;
            }
            
            colors[i3] = r;
            colors[i3 + 1] = g;
            colors[i3 + 2] = b;
            
            // اندازه ستاره
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        const starField = new THREE.Points(geometry, material);
        this.scene.add(starField);
        this.stars = starField;
    }
    
    createNebulas() {
        // ایجاد سحابی‌های رنگی
        const nebulaCount = 4;
        
        for (let i = 0; i < nebulaCount; i++) {
            const size = 80 + Math.random() * 70;
            const geometry = new THREE.SphereGeometry(size, 16, 16);
            
            // رنگ‌های مختلف سحابی
            const colors = [
                new THREE.Color(0.3, 0.1, 0.5), // بنفش
                new THREE.Color(0.1, 0.3, 0.6), // آبی
                new THREE.Color(0.6, 0.1, 0.2), // قرمز
                new THREE.Color(0.1, 0.5, 0.3)  // سبز
            ];
            
            const color = colors[i % colors.length];
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.08,
                side: THREE.DoubleSide
            });
            
            const nebula = new THREE.Mesh(geometry, material);
            
            // موقعیت تصادفی
            const angle = (i / nebulaCount) * Math.PI * 2;
            const radius = 200 + Math.random() * 150;
            nebula.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.3,
                Math.sin(angle) * radius * 0.7
            );
            
            // چرخش تصادفی
            nebula.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.scene.add(nebula);
            this.nebulas.push(nebula);
            
            // انیمیشن سحابی
            this.animateNebula(nebula);
        }
    }
    
    animateGalaxy(galaxy) {
        // انیمیشن چرخش کهکشان
        const animate = () => {
            if (galaxy) {
                galaxy.rotation.y += 0.0005;
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    animateNebula(nebula) {
        // انیمیشن سحابی
        const speed = 0.1 + Math.random() * 0.2;
        const animate = () => {
            if (nebula) {
                nebula.rotation.x += speed * 0.01;
                nebula.rotation.y += speed * 0.015;
                nebula.rotation.z += speed * 0.008;
                
                // پالس‌های ملایم
                const scale = 1 + Math.sin(Date.now() * 0.001 * speed) * 0.1;
                nebula.scale.set(scale, scale, scale);
            }
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    createParticleEffect(position, color, count = 30, size = 2) {
        try {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            
            const velocities = [];
            
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                
                // موقعیت اولیه
                positions[i3] = position.x;
                positions[i3 + 1] = position.y;
                positions[i3 + 2] = position.z;
                
                // رنگ
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;
                
                // اندازه
                sizes[i] = Math.random() * size + size * 0.5;
                
                // سرعت تصادفی
                velocities.push({
                    x: (Math.random() - 0.5) * 15,
                    y: (Math.random() - 0.5) * 15,
                    z: (Math.random() - 0.5) * 15,
                    life: 1.0
                });
            }
            
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            
            const material = new THREE.PointsMaterial({
                size: 3,
                vertexColors: true,
                transparent: true,
                opacity: 1,
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
                life: 1.0,
                maxLife: 1.0
            };
            
            this.particles.push(particleSystem);
            return particleSystem;
            
        } catch (error) {
            console.error("❌ خطا در ایجاد افکت ذرات:", error);
            return null;
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particleSystem = this.particles[i];
            particleSystem.life -= deltaTime * 0.8;
            
            if (particleSystem.life <= 0) {
                this.scene.remove(particleSystem.mesh);
                this.particles.splice(i, 1);
                continue;
            }
            
            const positions = particleSystem.geometry.attributes.position.array;
            const colors = particleSystem.geometry.attributes.color.array;
            
            for (let j = 0; j < particleSystem.velocities.length; j++) {
                const j3 = j * 3;
                const velocity = particleSystem.velocities[j];
                
                // به‌روزرسانی موقعیت
                positions[j3] += velocity.x * deltaTime;
                positions[j3 + 1] += velocity.y * deltaTime;
                positions[j3 + 2] += velocity.z * deltaTime;
                
                // کاهش سرعت
                velocity.x *= 0.95;
                velocity.y *= 0.95;
                velocity.z *= 0.95;
                
                // کاهش عمر
                velocity.life -= deltaTime;
                
                // به‌روزرسانی شفافیت بر اساس عمر
                const alpha = Math.max(0, velocity.life);
                if (j3 + 2 < colors.length) {
                    colors[j3 + 2] = alpha; // استفاده از کانال آبی برای آلفا
                }
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            particleSystem.geometry.attributes.color.needsUpdate = true;
            
            // به‌روزرسانی اندازه و شفافیت بر اساس عمر کلی
            particleSystem.material.opacity = particleSystem.life;
            particleSystem.material.size = particleSystem.life * 2;
        }
    }
    
    createExplosionEffect(position, color = new THREE.Color(1, 0.5, 0), count = 50) {
        return this.createParticleEffect(position, color, count, 3);
    }
    
    createHitEffect(position, color = new THREE.Color(1, 1, 0), count = 20) {
        return this.createParticleEffect(position, color, count, 1.5);
    }
    
    createTrailEffect(position, color = new THREE.Color(0, 1, 1), count = 10) {
        return this.createParticleEffect(position, color, count, 1);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        try {
            const deltaTime = Math.min(0.05, this.clock.getDelta());
            
            // به‌روزرسانی ذرات
            this.updateParticles(deltaTime);
            
            // رندر صحنه
            this.renderer.render(this.scene, this.camera);
            
        } catch (error) {
            console.error("❌ خطا در انیمیشن:", error);
        }
    }
    
    onResize() {
        try {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
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
    
    // پاک‌سازی منابع
    dispose() {
        try {
            if (this.renderer) {
                this.renderer.dispose();
            }
            this.particles.forEach(particleSystem => {
                if (particleSystem.mesh) {
                    this.scene.remove(particleSystem.mesh);
                    particleSystem.geometry.dispose();
                    particleSystem.material.dispose();
                }
            });
            this.particles = [];
        } catch (error) {
            console.error("❌ خطا در پاک‌سازی منابع:", error);
        }
    }
}

// صادر کردن کلاس
window.GraphicsSystem = GraphicsSystem;
console.log("📁 m.js با موفقیت بارگذاری شد");
