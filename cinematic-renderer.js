// رندرر سینمایی سه بعدی برای بازی کهکشانی
class CinematicRenderer {
    static init() {
        console.log('🎬 راه‌اندازی رندرر سینمایی...');
        
        // ایجاد کانواس اصلی
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameContainer = document.getElementById('gameContainer');
        
        // تنظیم اندازه کانواس
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '2';
        
        // اضافه کردن کانواس به صفحه
        this.gameContainer.appendChild(this.canvas);
        
        // تنظیمات رندر
        this.renderSettings = {
            quality: 'high',
            antiAliasing: true,
            shadows: true,
            glowEffects: true,
            particleEffects: true,
            motionBlur: false,
            depthOfField: false
        };
        
        // کش برای بهینه‌سازی
        this.cache = {
            gradients: {},
            patterns: {},
            shadows: {}
        };
        
        // زمان برای انیمیشن‌ها
        this.time = 0;
        
        // دوربین سینمایی
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            targetZoom: 1,
            shake: 0,
            shakeIntensity: 0,
            rotation: 0,
            followPlayer: true,
            cinematicMode: true
        };
        
        // افکت‌های پس‌زمینه
        this.backgroundEffects = {
            nebulas: [],
            starClusters: [],
            dustClouds: [],
            lensFlares: []
        };
        
        // ایجاد افکت‌های پس‌زمینه
        this.createBackgroundEffects();
        
        console.log('✅ رندرر سینمایی راه‌اندازی شد');
    }
    
    static createBackgroundEffects() {
        console.log('🌠 ایجاد افکت‌های پس‌زمینه سینمایی...');
        
        // ایجاد سحابی‌ها
        this.createNebulas();
        
        // ایجاد خوشه‌های ستاره‌ای
        this.createStarClusters();
        
        // ایجاد ابرهای غبار کیهانی
        this.createDustClouds();
        
        // ایجاد فلر لنز
        this.createLensFlares();
        
        console.log('✅ افکت‌های پس‌زمینه ایجاد شدند');
    }
    
    static createNebulas() {
        const nebulaCount = 8;
        
        for (let i = 0; i < nebulaCount; i++) {
            const nebula = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: 300 + Math.random() * 400,
                height: 300 + Math.random() * 400,
                rotation: Math.random() * Math.PI * 2,
                color: this.getRandomNebulaColor(),
                opacity: 0.03 + Math.random() * 0.04,
                speed: 0.1 + Math.random() * 0.2,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.01 + Math.random() * 0.02
            };
            
            this.backgroundEffects.nebulas.push(nebula);
        }
    }
    
    static getRandomNebulaColor() {
        const colors = [
            { r: 100, g: 50, b: 200 },   // بنفش
            { r: 200, g: 50, b: 100 },   // قرمز-بنفش
            { r: 50, g: 100, b: 200 },   // آبی
            { r: 50, g: 200, b: 100 },   // سبز-آبی
            { r: 200, g: 100, b: 50 },   // نارنجی
            { r: 100, g: 200, b: 50 },   // سبز
            { r: 200, g: 50, b: 200 },   // ارغوانی
            { r: 50, g: 200, b: 200 }    // فیروزه‌ای
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    static createStarClusters() {
        const clusterCount = 5;
        
        for (let i = 0; i < clusterCount; i++) {
            const cluster = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 80 + Math.random() * 120,
                starCount: 30 + Math.floor(Math.random() * 50),
                brightness: 0.3 + Math.random() * 0.4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.002,
                stars: []
            };
            
            // ایجاد ستاره‌های داخل خوشه
            for (let j = 0; j < cluster.starCount; j++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * cluster.radius;
                
                cluster.stars.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    size: 1 + Math.random() * 2,
                    brightness: 0.5 + Math.random() * 0.5,
                    twinkleSpeed: 0.02 + Math.random() * 0.03,
                    twinkleOffset: Math.random() * Math.PI * 2
                });
            }
            
            this.backgroundEffects.starClusters.push(cluster);
        }
    }
    
    static createDustClouds() {
        const cloudCount = 6;
        
        for (let i = 0; i < cloudCount; i++) {
            const cloud = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: 200 + Math.random() * 300,
                height: 200 + Math.random() * 300,
                density: 0.1 + Math.random() * 0.2,
                speed: 0.05 + Math.random() * 0.1,
                rotation: Math.random() * Math.PI * 2,
                color: { r: 150, g: 150, b: 200 },
                opacity: 0.02 + Math.random() * 0.03
            };
            
            this.backgroundEffects.dustClouds.push(cloud);
        }
    }
    
    static createLensFlares() {
        const flareCount = 3;
        
        for (let i = 0; i < flareCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 200;
            
            const flare = {
                x: this.canvas.width / 2 + Math.cos(angle) * distance,
                y: this.canvas.height / 2 + Math.sin(angle) * distance,
                size: 20 + Math.random() * 30,
                brightness: 0.1 + Math.random() * 0.2,
                color: { r: 255, g: 255, b: 200 },
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: 0.01 + Math.random() * 0.02
            };
            
            this.backgroundEffects.lensFlares.push(flare);
        }
    }
    
    static render(gameState) {
        // به روز رسانی زمان
        this.time += 0.016;
        
        // به روز رسانی دوربین
        this.updateCamera(gameState);
        
        // پاک کردن کانواس
        this.clearCanvas();
        
        // ذخیره وضعیت کانواس
        this.ctx.save();
        
        // اعمال تبدیلات دوربین
        this.applyCameraTransform();
        
        // رندر لایه‌های مختلف
        this.renderBackground(gameState);
        this.renderGalaxy(gameState);
        this.renderCentralPlanets(gameState);
        this.renderEnemies(gameState);
        this.renderPlayerTrail(gameState);
        this.renderPlayer(gameState);
        this.renderCollectedPlanets(gameState);
        this.renderEffects(gameState);
        this.renderParticles(gameState);
        
        // بازگردانی وضعیت کانواس
        this.ctx.restore();
        
        // رندر افکت‌های جلویی
        this.renderForegroundEffects();
        this.renderCameraEffects();
    }
    
    static updateCamera(gameState) {
        const player = gameState.player;
        
        if (this.camera.followPlayer) {
            // دنبال کردن بازیکن با تاخیر نرم
            const targetX = player.x;
            const targetY = player.y;
            
            this.camera.x += (targetX - this.camera.x) * 0.05;
            this.camera.y += (targetY - this.camera.y) * 0.05;
            
            // زوم دوربین بر اساس سرعت بازیکن
            const speed = Math.sqrt(player.velocityX * player.velocityX + player.velocityY * player.velocityY);
            this.camera.targetZoom = 1 - Math.min(0.3, speed / 50);
            this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.1;
            
            // لرزش دوربین در اثر سرعت
            this.camera.shakeIntensity = Math.min(5, speed / 3);
        }
        
        // اعمال لرزش دوربین
        if (this.camera.shakeIntensity > 0) {
            this.camera.shake = Math.sin(this.time * 30) * this.camera.shakeIntensity;
            this.camera.shakeIntensity *= 0.9;
        } else {
            this.camera.shake = 0;
        }
        
        // چرخش سینمایی ملایم
        if (this.camera.cinematicMode) {
            this.camera.rotation = Math.sin(this.time * 0.1) * 0.02;
        }
    }
    
    static applyCameraTransform() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // انتقال به مرکز
        this.ctx.translate(centerX, centerY);
        
        // اعمال زوم
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        
        // اعمال چرخش
        this.ctx.rotate(this.camera.rotation);
        
        // اعمال لرزش
        this.ctx.translate(this.camera.shake, this.camera.shake);
        
        // انتقال بر اساس موقعیت دوربین
        this.ctx.translate(-this.camera.x, -this.camera.y);
    }
    
    static clearCanvas() {
        // پاک کردن با گرادیانت فضایی
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(0.3, '#000022');
        gradient.addColorStop(1, '#000033');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    static renderBackground(gameState) {
        // رندر سحابی‌ها
        this.renderNebulas();
        
        // رندر خوشه‌های ستاره‌ای
        this.renderStarClusters();
        
        // رندر ابرهای غبار
        this.renderDustClouds();
        
        // رندر فلرهای لنز
        this.renderLensFlares();
        
        // رندر ستاره‌های کهکشان
        this.renderGalaxyStars(gameState);
    }
    
    static renderNebulas() {
        this.backgroundEffects.nebulas.forEach(nebula => {
            nebula.pulse += nebula.pulseSpeed;
            const pulseEffect = Math.sin(nebula.pulse) * 0.3 + 0.7;
            
            this.ctx.save();
            this.ctx.translate(nebula.x, nebula.y);
            this.ctx.rotate(nebula.rotation);
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.width / 2);
            gradient.addColorStop(0, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, ${nebula.opacity * pulseEffect})`);
            gradient.addColorStop(1, `rgba(${nebula.color.r}, ${nebula.color.g}, ${nebula.color.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, nebula.width / 2, nebula.height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    static renderStarClusters() {
        this.backgroundEffects.starClusters.forEach(cluster => {
            cluster.rotation += cluster.rotationSpeed;
            
            this.ctx.save();
            this.ctx.translate(cluster.x, cluster.y);
            this.ctx.rotate(cluster.rotation);
            
            // رندر ستاره‌های خوشه
            cluster.stars.forEach(star => {
                star.twinkleOffset += star.twinkleSpeed;
                const brightness = star.brightness * (0.7 + Math.sin(star.twinkleOffset) * 0.3);
                
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * cluster.brightness})`;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            this.ctx.restore();
        });
    }
    
    static renderDustClouds() {
        this.backgroundEffects.dustClouds.forEach(cloud => {
            this.ctx.save();
            this.ctx.translate(cloud.x, cloud.y);
            this.ctx.rotate(cloud.rotation);
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.width / 2);
            gradient.addColorStop(0, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, ${cloud.opacity})`);
            gradient.addColorStop(1, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    static renderLensFlares() {
        this.backgroundEffects.lensFlares.forEach(flare => {
            flare.rotation += flare.rotationSpeed;
            
            this.ctx.save();
            this.ctx.translate(flare.x, flare.y);
            this.ctx.rotate(flare.rotation);
            
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, flare.size);
            gradient.addColorStop(0, `rgba(${flare.color.r}, ${flare.color.g}, ${flare.color.b}, ${flare.brightness})`);
            gradient.addColorStop(0.7, `rgba(${flare.color.r}, ${flare.color.g}, ${flare.color.b}, ${flare.brightness * 0.3})`);
            gradient.addColorStop(1, `rgba(${flare.color.r}, ${flare.color.g}, ${flare.color.b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, flare.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    static renderGalaxyStars(gameState) {
        gameState.galaxy.stars.forEach(star => {
            const brightness = star.brightness * (0.7 + Math.sin(star.twinkleOffset) * 0.3);
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // هاله نور برای ستاره‌های درخشان
            if (star.size > 1.5) {
                const glowGradient = this.ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, star.size * 3
                );
                glowGradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.3})`);
                glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = glowGradient;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    static renderGalaxy(gameState) {
        const galaxy = gameState.galaxy;
        const centerX = galaxy.centerX;
        const centerY = galaxy.centerY;
        
        // رندر هسته کهکشان
        this.renderGalaxyCore(centerX, centerY);
        
        // رندر بازوهای مارپیچ
        this.renderSpiralArms(galaxy);
    }
    
    static renderGalaxyCore(centerX, centerY) {
        // هسته درخشان
        const coreGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 80
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        coreGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.5)');
        coreGradient.addColorStop(1, 'rgba(100, 100, 200, 0)');
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        this.ctx.fill();
        
        // حلقه داخلی
        const ringGradient = this.ctx.createRadialGradient(
            centerX, centerY, 60,
            centerX, centerY, 120
        );
        ringGradient.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
        ringGradient.addColorStop(1, 'rgba(50, 100, 200, 0)');
        
        this.ctx.fillStyle = ringGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    static renderSpiralArms(galaxy) {
        const centerX = galaxy.centerX;
        const centerY = galaxy.centerY;
        
        for (let arm = 0; arm < galaxy.spiralArms; arm++) {
            const armAngle = (arm / galaxy.spiralArms) * Math.PI * 2 + galaxy.rotation;
            
            // رندر بازوی مارپیچ
            this.ctx.strokeStyle = `rgba(100, 150, 255, 0.1)`;
            this.ctx.lineWidth = galaxy.armWidth;
            
            this.ctx.beginPath();
            
            for (let distance = 100; distance < 800; distance += 20) {
                const angle = armAngle + (distance / 200) * Math.PI;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                if (distance === 100) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }
    }
    
    static renderCentralPlanets(gameState) {
        gameState.centralPlanets.forEach(planet => {
            if (!planet.collected) {
                this.renderPlanet(planet);
            }
        });
    }
    
    static renderPlanet(planet) {
        this.ctx.save();
        this.ctx.translate(planet.x, planet.y);
        this.ctx.rotate(planet.rotation);
        
        // هاله نورانی
        const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, planet.size * 2);
        glowGradient.addColorStop(0, `rgba(${planet.color.r}, ${planet.color.g}, ${planet.color.b}, ${planet.glowIntensity * 0.3})`);
        glowGradient.addColorStop(1, `rgba(${planet.color.r}, ${planet.color.g}, ${planet.color.b}, 0)`);
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, planet.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // بدنه اصلی سیاره
        const planetGradient = this.ctx.createRadialGradient(
            -planet.size * 0.3, -planet.size * 0.3, 0,
            0, 0, planet.size
        );
        planetGradient.addColorStop(0, `rgba(${planet.color.r + 50}, ${planet.color.g + 50}, ${planet.color.b + 50}, 1)`);
        planetGradient.addColorStop(0.7, `rgba(${planet.color.r}, ${planet.color.g}, ${planet.color.b}, 1)`);
        planetGradient.addColorStop(1, `rgba(${planet.color.r - 50}, ${planet.color.g - 50}, ${planet.color.b - 50}, 1)`);
        
        this.ctx.fillStyle = planetGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, planet.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // جزئیات سطح سیاره
        this.renderPlanetDetails(planet);
        
        // حلقه دور سیاره (برای برخی سیارات)
        if (planet.type === 'ringed' || planet.type === 'gas_giant') {
            this.ctx.strokeStyle = `rgba(200, 200, 255, 0.6)`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, planet.size * 1.5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // نمایش عدد مرحله
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${planet.size * 0.4}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(planet.hitsNeeded - planet.currentHits, 0, 0);
        
        this.ctx.restore();
    }
    
    static renderPlanetDetails(planet) {
        // ایجاد الگوهای سطح سیاره بر اساس نوع
        switch(planet.type) {
            case 'terrestrial':
                this.renderTerrestrialDetails(planet);
                break;
            case 'gas_giant':
                this.renderGasGiantDetails(planet);
                break;
            case 'volcanic':
                this.renderVolcanicDetails(planet);
                break;
            case 'ice_giant':
                this.renderIceGiantDetails(planet);
                break;
            case 'crystal':
                this.renderCrystalDetails(planet);
                break;
            default:
                this.renderDefaultDetails(planet);
        }
    }
    
    static renderTerrestrialDetails(planet) {
        // قاره‌ها و اقیانوس‌ها
        this.ctx.fillStyle = `rgba(${planet.color.r - 30}, ${planet.color.g - 20}, ${planet.color.b + 30}, 0.3)`;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = planet.size * 0.7;
            this.ctx.beginPath();
            this.ctx.arc(
                Math.cos(angle) * distance * 0.3,
                Math.sin(angle) * distance * 0.3,
                planet.size * 0.4,
                0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    static renderGasGiantDetails(planet) {
        // نوارهای گازی
        for (let i = 0; i < 6; i++) {
            const width = planet.size * 0.1;
            const y = -planet.size + i * width * 1.5;
            this.ctx.fillStyle = `rgba(${planet.color.r}, ${planet.color.g}, ${planet.color.b}, ${0.3 + i * 0.1})`;
            this.ctx.fillRect(-planet.size, y, planet.size * 2, width);
        }
    }
    
    static renderVolcanicDetails(planet) {
        // گدازه و آتشفشان
        this.ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = planet.size * 0.8;
            this.ctx.beginPath();
            this.ctx.arc(
                Math.cos(angle) * distance * 0.2,
                Math.sin(angle) * distance * 0.2,
                planet.size * 0.2,
                0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    static renderIceGiantDetails(planet) {
        // الگوهای یخی
        this.ctx.strokeStyle = `rgba(200, 230, 255, 0.5)`;
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(
                Math.cos(angle) * planet.size,
                Math.sin(angle) * planet.size
            );
            this.ctx.stroke();
        }
    }
    
    static renderCrystalDetails(planet) {
        // ساختارهای کریستالی
        this.ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
        this.ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const size = planet.size * 0.6;
            this.ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const crystalAngle = angle + (j / 6) * (Math.PI / 4);
                const x = Math.cos(crystalAngle) * size;
                const y = Math.sin(crystalAngle) * size;
                if (j === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
    }
    
    static renderDefaultDetails(planet) {
        // الگوی پیش‌فرض - نقطه‌های تصادفی
        this.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * planet.size * 0.8;
            const size = planet.size * 0.05 + Math.random() * planet.size * 0.05;
            
            this.ctx.beginPath();
            this.ctx.arc(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                size, 0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    static renderEnemies(gameState) {
        gameState.enemies.forEach(enemy => {
            this.renderEnemy(enemy);
        });
    }
    
    static renderEnemy(enemy) {
        this.ctx.save();
        this.ctx.translate(enemy.x, enemy.y);
        this.ctx.rotate(enemy.rotation);
        
        // هاله نورانی دشمن
        const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.size * 1.5);
        glowGradient.addColorStop(0, `rgba(${enemy.color.r}, ${enemy.color.g}, ${enemy.color.b}, ${enemy.glowIntensity * 0.4})`);
        glowGradient.addColorStop(1, `rgba(${enemy.color.r}, ${enemy.color.g}, ${enemy.color.b}, 0)`);
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // رندر بر اساس نوع دشمن
        switch(enemy.type) {
            case 'volcano':
                this.renderVolcanoEnemy(enemy);
                break;
            case 'asteroid':
                this.renderAsteroidEnemy(enemy);
                break;
            case 'comet':
                this.renderCometEnemy(enemy);
                break;
            case 'black_hole':
                this.renderBlackHoleEnemy(enemy);
                break;
            case 'nebula':
                this.renderNebulaEnemy(enemy);
                break;
            default:
                this.renderDefaultEnemy(enemy);
        }
        
        this.ctx.restore();
    }
    
    static renderVolcanoEnemy(enemy) {
        // بدنه آتشفشان
        const bodyGradient = this.ctx.createRadialGradient(
            -enemy.size * 0.2, -enemy.size * 0.2, 0,
            0, 0, enemy.size
        );
        bodyGradient.addColorStop(0, `rgba(255, 100, 0, 1)`);
        bodyGradient.addColorStop(0.7, `rgba(200, 50, 0, 1)`);
        bodyGradient.addColorStop(1, `rgba(150, 30, 0, 1)`);
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // گدازه
        this.ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + enemy.rotation;
            const length = enemy.size * 0.8 + Math.sin(this.time * 10 + i) * enemy.size * 0.2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
            this.ctx.lineWidth = enemy.size * 0.2;
            this.ctx.strokeStyle = `rgba(255, 150, 0, 0.8)`;
            this.ctx.stroke();
        }
    }
    
    static renderAsteroidEnemy(enemy) {
        // سطح ناهموار سیارک
        this.ctx.fillStyle = `rgba(150, 150, 150, 1)`;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // جزئیات سطح
        this.ctx.fillStyle = 'rgba(100, 100, 100, 1)';
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * enemy.size * 0.7;
            const size = enemy.size * 0.1 + Math.random() * enemy.size * 0.1;
            
            this.ctx.beginPath();
            this.ctx.arc(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                size, 0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    static renderCometEnemy(enemy) {
        // هسته ستاره دنباله دار
        const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.size);
        coreGradient.addColorStop(0, 'rgba(200, 230, 255, 1)');
        coreGradient.addColorStop(1, 'rgba(150, 200, 255, 1)');
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // دنباله
        const tailGradient = this.ctx.createLinearGradient(
            -enemy.size, 0,
            -enemy.size * 3, 0
        );
        tailGradient.addColorStop(0, 'rgba(150, 200, 255, 0.8)');
        tailGradient.addColorStop(1, 'rgba(150, 200, 255, 0)');
        
        this.ctx.fillStyle = tailGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(-enemy.size, -enemy.size * 0.5);
        this.ctx.lineTo(-enemy.size * 3, -enemy.size);
        this.ctx.lineTo(-enemy.size * 3, enemy.size);
        this.ctx.lineTo(-enemy.size, enemy.size * 0.5);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    static renderBlackHoleEnemy(enemy) {
        // افکت سیاهچاله
        const holeGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.size * 1.5);
        holeGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        holeGradient.addColorStop(0.7, 'rgba(50, 0, 100, 0.8)');
        holeGradient.addColorStop(1, 'rgba(100, 0, 200, 0)');
        
        this.ctx.fillStyle = holeGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // حلقه accretion
        this.ctx.strokeStyle = 'rgba(200, 100, 255, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    static renderNebulaEnemy(enemy) {
        // ابر سحابی
        const nebulaGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.size);
        nebulaGradient.addColorStop(0, `rgba(${enemy.color.r}, ${enemy.color.g}, ${enemy.color.b}, 0.8)`);
        nebulaGradient.addColorStop(1, `rgba(${enemy.color.r}, ${enemy.color.g}, ${enemy.color.b}, 0.3)`);
        
        this.ctx.fillStyle = nebulaGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // جزئیات درونی
        this.ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * enemy.size * 0.6;
            const size = enemy.size * 0.1 + Math.random() * enemy.size * 0.1;
            
            this.ctx.beginPath();
            this.ctx.arc(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                size, 0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    static renderDefaultEnemy(enemy) {
        // دشمن پیش‌فرض - کره ساده
        const gradient = this.ctx.createRadialGradient(
            -enemy.size * 0.2, -enemy.size * 0.2, 0,
            0, 0, enemy.size
        );
        gradient.addColorStop(0, `rgba(${enemy.color.r + 50}, ${enemy.color.g + 50}, ${enemy.color.b + 50}, 1)`);
        gradient.addColorStop(1, `rgba(${enemy.color.r}, ${enemy.color.g}, ${enemy.color.b}, 1)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    static renderPlayerTrail(gameState) {
        const player = gameState.player;
        const trail = player.trail;
        
        if (trail.length < 2) return;
        
        // رندر مسیر حرکت با گرادیانت
        this.ctx.strokeStyle = 'rgba(0, 204, 255, 0.1)';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(trail[0].x, trail[0].y);
        
        for (let i = 1; i < trail.length; i++) {
            this.ctx.lineTo(trail[i].x, trail[i].y);
        }
        
        this.ctx.stroke();
        
        // رندر نقاط درخشان در مسیر
        for (let i = 0; i < trail.length; i += 3) {
            const point = trail[i];
            const alpha = i / trail.length;
            const size = 3 + alpha * 5;
            
            const gradient = this.ctx.createRadialGradient(
                point.x, point.y, 0,
                point.x, point.y, size
            );
            gradient.addColorStop(0, `rgba(0, 204, 255, ${0.3 + alpha * 0.2})`);
            gradient.addColorStop(1, 'rgba(0, 204, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    static renderPlayer(gameState) {
        const player = gameState.player;
        
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.rotate(player.rotation);
        
        // هاله نورانی فضاپیما
        const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, player.size);
        glowGradient.addColorStop(0, 'rgba(0, 204, 255, 0.4)');
        glowGradient.addColorStop(0.7, 'rgba(0, 102, 255, 0.2)');
        glowGradient.addColorStop(1, 'rgba(0, 51, 255, 0)');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, player.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // بدنه اصلی فضاپیما
        this.renderSpaceshipBody(player);
        
        // موتورها و پیشرانه
        this.renderEngines(player);
        
        // جزئیات فضاپیما
        this.renderSpaceshipDetails(player);
        
        this.ctx.restore();
    }
    
    static renderSpaceshipBody(player) {
        // بدنه بیضی شکل
        const bodyGradient = this.ctx.createLinearGradient(
            -player.size * 0.8, 0,
            player.size * 0.8, 0
        );
        bodyGradient.addColorStop(0, '#0066ff');
        bodyGradient.addColorStop(0.5, '#00ccff');
        bodyGradient.addColorStop(1, '#0066ff');
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, player.size * 0.8, player.size * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // کابین خلبان
        const cockpitGradient = this.ctx.createRadialGradient(
            player.size * 0.3, 0, 0,
            player.size * 0.3, 0, player.size * 0.3
        );
        cockpitGradient.addColorStop(0, 'rgba(200, 240, 255, 0.9)');
        cockpitGradient.addColorStop(1, 'rgba(150, 220, 255, 0.6)');
        
        this.ctx.fillStyle = cockpitGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(player.size * 0.3, 0, player.size * 0.3, player.size * 0.2, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    static renderEngines(player) {
        const engineIntensity = 0.7 + Math.sin(this.time * 20) * 0.3;
        
        // موتور اصلی
        const engineGradient = this.ctx.createLinearGradient(
            -player.size * 0.8, 0,
            -player.size * 1.5, 0
        );
        engineGradient.addColorStop(0, `rgba(255, 200, 0, ${engineIntensity})`);
        engineGradient.addColorStop(0.5, `rgba(255, 100, 0, ${engineIntensity * 0.7})`);
        engineGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
        
        this.ctx.fillStyle = engineGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(-player.size * 0.8, -player.size * 0.2);
        this.ctx.lineTo(-player.size * 1.5, -player.size * 0.3);
        this.ctx.lineTo(-player.size * 1.5, player.size * 0.3);
        this.ctx.lineTo(-player.size * 0.8, player.size * 0.2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // موتورهای کناری
        const sideEngineGradient = this.ctx.createLinearGradient(
            -player.size * 0.6, -player.size * 0.5,
            -player.size * 1.2, -player.size * 0.6
        );
        sideEngineGradient.addColorStop(0, `rgba(255, 150, 0, ${engineIntensity * 0.8})`);
        sideEngineGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
        
        this.ctx.fillStyle = sideEngineGradient;
        
        // موتور چپ
        this.ctx.beginPath();
        this.ctx.moveTo(-player.size * 0.6, -player.size * 0.5);
        this.ctx.lineTo(-player.size * 1.2, -player.size * 0.6);
        this.ctx.lineTo(-player.size * 1.2, -player.size * 0.4);
        this.ctx.lineTo(-player.size * 0.6, -player.size * 0.45);
        this.ctx.closePath();
        this.ctx.fill();
        
        // موتور راست
        this.ctx.beginPath();
        this.ctx.moveTo(-player.size * 0.6, player.size * 0.5);
        this.ctx.lineTo(-player.size * 1.2, player.size * 0.6);
        this.ctx.lineTo(-player.size * 1.2, player.size * 0.4);
        this.ctx.lineTo(-player.size * 0.6, player.size * 0.45);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    static renderSpaceshipDetails(player) {
        // بال‌ها
        this.ctx.fillStyle = '#0044cc';
        this.ctx.beginPath();
        this.ctx.ellipse(-player.size * 0.2, -player.size * 0.6, player.size * 0.4, player.size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.ellipse(-player.size * 0.2, player.size * 0.6, player.size * 0.4, player.size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // آنتن‌ها
        this.ctx.strokeStyle = '#00ccff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(player.size * 0.5, -player.size * 0.1);
        this.ctx.lineTo(player.size * 0.8, -player.size * 0.3);
        this.ctx.moveTo(player.size * 0.5, player.size * 0.1);
        this.ctx.lineTo(player.size * 0.8, player.size * 0.3);
        this.ctx.stroke();
        
        // نورهای ناوبری
        const navLight = 0.5 + Math.sin(this.time * 10) * 0.5;
        this.ctx.fillStyle = `rgba(0, 255, 0, ${navLight})`;
        this.ctx.beginPath();
        this.ctx.arc(player.size * 0.7, -player.size * 0.25, player.size * 0.05, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = `rgba(255, 0, 0, ${navLight})`;
        this.ctx.beginPath();
        this.ctx.arc(player.size * 0.7, player.size * 0.25, player.size * 0.05, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    static renderCollectedPlanets(gameState) {
        const collectedPlanets = gameState.player.collectedPlanets;
        
        collectedPlanets.forEach(planet => {
            this.ctx.save();
            this.ctx.translate(planet.x, planet.y);
            this.ctx.rotate(planet.rotation);
            
            // رندر سیاره جمع‌آوری شده (کوچکتر)
            const scale = 0.6;
            const scaledSize = planet.size * scale;
            
            // هاله
            const glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, scaledSize * 1.5);
            glowGradient.addColorStop(0, `rgba(${planet.color.r}, ${planet.color.g}, ${planet.color.b}, 0.4)`);
            glowGradient.addColorStop(1, `rgba(${planet.color.r}, ${planet.color.g}, ${planet.color.b}, 0)`);
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, scaledSize * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // بدنه سیاره
            const planetGradient = this.ctx.createRadialGradient(
                -scaledSize * 0.2, -scaledSize * 0.2, 0,
                0, 0, scaledSize
            );
            planetGradient.addColorStop(0, `rgba(${planet.color.r + 30}, ${planet.color.g + 30}, ${planet.color.b + 30}, 1)`);
            planetGradient.addColorStop(1, `rgba(${planet.color.r}, ${planet.color.g}, ${planet.color.b}, 1)`);
            
            this.ctx.fillStyle = planetGradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, scaledSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    static renderEffects(gameState) {
        gameState.effects.forEach(effect => {
            this.renderEffect(effect);
        });
    }
    
    static renderEffect(effect) {
        this.ctx.save();
        this.ctx.translate(effect.x, effect.y);
        this.ctx.rotate(effect.rotation);
        this.ctx.scale(effect.scale, effect.scale);
        
        switch(effect.type) {
            case 'hit':
                this.renderHitEffect(effect);
                break;
            case 'collect':
                this.renderCollectEffect(effect);
                break;
            case 'explosion':
                this.renderExplosionEffect(effect);
                break;
            case 'bomb':
                this.renderBombEffect(effect);
                break;
            case 'spawn':
                this.renderSpawnEffect(effect);
                break;
        }
        
        this.ctx.restore();
    }
    
    static renderHitEffect(effect) {
        const rings = 3;
        
        for (let i = 0; i < rings; i++) {
            const radius = (i + 1) * 20 * (1 - effect.life);
            const alpha = effect.life * (1 - i / rings);
            
            this.ctx.strokeStyle = `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${alpha})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    static renderCollectEffect(effect) {
        const points = 8;
        const radius = 30 * (1 - effect.life);
        
        this.ctx.strokeStyle = `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${effect.life})`;
        this.ctx.lineWidth = 4;
        
        this.ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.stroke();
        
        // ذرات مرکزی
        const particleCount = 6;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = radius * 0.5;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${effect.life})`;
            this.ctx.beginPath();
            this.ctx.arc(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                3, 0, Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    static renderExplosionEffect(effect) {
        const radius = 50 * (1 - effect.life);
        const spikes = 12;
        
        this.ctx.fillStyle = `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${effect.life * 0.7})`;
        
        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const spikeLength = radius * (0.8 + Math.sin(this.time * 20 + i) * 0.2);
            
            if (i === 0) {
                this.ctx.moveTo(
                    Math.cos(angle) * spikeLength,
                    Math.sin(angle) * spikeLength
                );
            } else {
                this.ctx.lineTo(
                    Math.cos(angle) * spikeLength,
                    Math.sin(angle) * spikeLength
                );
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    static renderBombEffect(effect) {
        const rings = 5;
        
        for (let i = 0; i < rings; i++) {
            const progress = (i / rings) + (1 - effect.life);
            const radius = progress * 100;
            const alpha = effect.life * (1 - i / rings);
            
            this.ctx.strokeStyle = `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${alpha})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    static renderSpawnEffect(effect) {
        const radius = 40 * (1 - effect.life);
        const rotation = effect.rotation * 3;
        
        this.ctx.strokeStyle = `rgba(${effect.color.r}, ${effect.color.g}, ${effect.color.b}, ${effect.life})`;
        this.ctx.lineWidth = 3;
        
        // حلقه‌های چرخان
        for (let i = 0; i < 3; i++) {
            const ringRotation = rotation + (i / 3) * Math.PI * 2;
            const ringRadius = radius * (0.7 + i * 0.1);
            
            this.ctx.save();
            this.ctx.rotate(ringRotation);
            
            this.ctx.beginPath();
            this.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }
    
    static renderParticles(gameState) {
        gameState.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            
            this.ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.life})`;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    static renderForegroundEffects() {
        // رندر افکت‌هایی که باید روی همه چیز باشند
        this.renderScanLines();
        this.renderVignette();
    }
    
    static renderScanLines() {
        // خطوط اسکن سینمایی
        const lineSpacing = 4;
        const lineCount = Math.ceil(this.canvas.height / lineSpacing);
        const opacity = 0.05;
        
        this.ctx.strokeStyle = `rgba(0, 204, 255, ${opacity})`;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < lineCount; i++) {
            const y = i * lineSpacing;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    static renderVignette() {
        // افکت وینیت سینمایی
        const vignetteGradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        
        vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
        vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        
        this.ctx.fillStyle = vignetteGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    static renderCameraEffects() {
        // اعمال لرزش نهایی دوربین
        if (this.camera.shake !== 0) {
            this.ctx.save();
            this.ctx.translate(
                Math.random() * this.camera.shake - this.camera.shake / 2,
                Math.random() * this.camera.shake - this.camera.shake / 2
            );
            
            // بازگردانی بعد از رندر
            setTimeout(() => {
                this.ctx.restore();
            }, 0);
        }
    }
    
    static resize() {
        // تنظیم مجدد اندازه کانواس
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // بازسازی افکت‌های پس‌زمینه
        this.createBackgroundEffects();
    }
}

// ایجاد نمونه جهانی
window.CinematicRenderer = CinematicRenderer;

// مدیریت تغییر اندازه پنجره
window.addEventListener('resize', () => {
    if (CinematicRenderer.canvas) {
        CinematicRenderer.resize();
    }
});

console.log('🎬 رندرر سینمایی سه بعدی بارگذاری شد');
