// m2.js - سیستم کهکشان متحرک و افکت‌های ویژه

class GalaxyBackgroundSystem {
    constructor() {
        this.stars = [];
        this.nebulas = [];
        this.planets = [];
        this.asteroids = [];
        this.spaceStations = [];
        this.blackHoles = [];
        this.init();
    }
    
    init() {
        this.createStars(1500);
        this.createNebulas(8);
        this.createPlanets(12);
        this.createAsteroids(50);
        this.createSpaceStations(3);
        this.createBlackHoles(2);
    }
    
    createStars(count) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                size: Math.random() * 3 + 0.5,
                brightness: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                color: this.getRandomStarColor()
            });
        }
    }
    
    getRandomStarColor() {
        const colors = ['#ffffff', '#ffeb3b', '#4fc3f7', '#f06292', '#aed581'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createNebulas(count) {
        const colors = [
            'rgba(100, 50, 150, 0.15)', 'rgba(50, 100, 200, 0.15)',
            'rgba(200, 50, 100, 0.15)', 'rgba(50, 200, 150, 0.15)',
            'rgba(200, 150, 50, 0.15)', 'rgba(150, 50, 200, 0.15)'
        ];
        
        for (let i = 0; i < count; i++) {
            this.nebulas.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                width: Math.random() * 1000 + 500,
                height: Math.random() * 1000 + 500,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
    }
    
    createPlanets(count) {
        const planetTypes = ['🪐', '🌍', '🌕', '🔥', '💧', '❄️', '🌑', '🟠'];
        
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 80 + 40;
            this.planets.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                size: size,
                type: planetTypes[Math.floor(Math.random() * planetTypes.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 0.5,
                orbitRadius: Math.random() * 200 + 100,
                orbitSpeed: (Math.random() - 0.5) * 0.1,
                orbitAngle: Math.random() * Math.PI * 2
            });
        }
    }
    
    createAsteroids(count) {
        for (let i = 0; i < count; i++) {
            this.asteroids.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                size: Math.random() * 25 + 10,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 2,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5
            });
        }
    }
    
    createSpaceStations(count) {
        for (let i = 0; i < count; i++) {
            this.spaceStations.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                size: Math.random() * 60 + 40,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                lightPhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    createBlackHoles(count) {
        for (let i = 0; i < count; i++) {
            this.blackHoles.push({
                x: Math.random() * 4000,
                y: Math.random() * 4000,
                size: Math.random() * 100 + 50,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 0.8,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    update() {
        this.updateNebulas();
        this.updatePlanets();
        this.updateAsteroids();
        this.updateSpaceStations();
        this.updateBlackHoles();
    }
    
    updateNebulas() {
        this.nebulas.forEach(nebula => {
            nebula.rotation += nebula.rotationSpeed;
        });
    }
    
    updatePlanets() {
        const time = performance.now() * 0.001;
        this.planets.forEach(planet => {
            planet.rotation += planet.rotationSpeed;
            planet.orbitAngle += planet.orbitSpeed;
            
            // حرکت مداری
            if (planet.orbitRadius > 0) {
                planet.x = planet.originalX + Math.cos(planet.orbitAngle) * planet.orbitRadius;
                planet.y = planet.originalY + Math.sin(planet.orbitAngle) * planet.orbitRadius;
            }
        });
    }
    
    updateAsteroids() {
        this.asteroids.forEach(asteroid => {
            asteroid.rotation += asteroid.rotationSpeed;
            asteroid.x += asteroid.speedX;
            asteroid.y += asteroid.speedY;
            
            // برگشت از لبه‌ها
            if (asteroid.x < -50) asteroid.x = 4050;
            if (asteroid.x > 4050) asteroid.x = -50;
            if (asteroid.y < -50) asteroid.y = 4050;
            if (asteroid.y > 4050) asteroid.y = -50;
        });
    }
    
    updateSpaceStations() {
        const time = performance.now() * 0.001;
        this.spaceStations.forEach(station => {
            station.rotation += station.rotationSpeed;
            station.lightPhase += 0.1;
        });
    }
    
    updateBlackHoles() {
        const time = performance.now() * 0.001;
        this.blackHoles.forEach(hole => {
            hole.rotation += hole.rotationSpeed;
            hole.pulsePhase += 0.05;
        });
    }
    
    render(context, cameraX, cameraY) {
        this.renderStars(context, cameraX, cameraY);
        this.renderNebulas(context, cameraX, cameraY);
        this.renderAsteroids(context, cameraX, cameraY);
        this.renderPlanets(context, cameraX, cameraY);
        this.renderSpaceStations(context, cameraX, cameraY);
        this.renderBlackHoles(context, cameraX, cameraY);
    }
    
    renderStars(context, cameraX, cameraY) {
        const time = performance.now() * 0.001;
        
        this.stars.forEach(star => {
            const screenX = star.x + cameraX;
            const screenY = star.y + cameraY;
            
            if (this.isVisible(screenX, screenY, 10)) {
                const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
                const brightness = star.brightness * twinkle;
                
                context.fillStyle = star.color;
                context.globalAlpha = brightness;
                context.beginPath();
                context.arc(screenX, screenY, star.size, 0, Math.PI * 2);
                context.fill();
            }
        });
        
        context.globalAlpha = 1;
    }
    
    renderNebulas(context, cameraX, cameraY) {
        this.nebulas.forEach(nebula => {
            const screenX = nebula.x + cameraX;
            const screenY = nebula.y + cameraY;
            
            if (this.isVisible(screenX, screenY, nebula.width)) {
                context.save();
                context.translate(screenX, screenY);
                context.rotate(nebula.rotation * Math.PI / 180);
                
                const gradient = context.createRadialGradient(0, 0, 0, 0, 0, nebula.width / 2);
                gradient.addColorStop(0, nebula.color);
                gradient.addColorStop(1, 'transparent');
                
                context.fillStyle = gradient;
                context.globalAlpha = 0.2;
                context.fillRect(-nebula.width / 2, -nebula.height / 2, nebula.width, nebula.height);
                
                context.restore();
            }
        });
        
        context.globalAlpha = 1;
    }
    
    renderPlanets(context, cameraX, cameraY) {
        const time = performance.now() * 0.001;
        
        this.planets.forEach(planet => {
            const screenX = planet.x + cameraX;
            const screenY = planet.y + cameraY;
            
            if (this.isVisible(screenX, screenY, planet.size)) {
                context.save();
                context.translate(screenX, screenY);
                context.rotate((planet.rotation + time * planet.rotationSpeed) * Math.PI / 180);
                
                // هاله نور
                const glow = context.createRadialGradient(0, 0, 0, 0, 0, planet.size * 1.5);
                glow.addColorStop(0, 'rgba(255,255,255,0.3)');
                glow.addColorStop(1, 'transparent');
                
                context.fillStyle = glow;
                context.globalAlpha = 0.4;
                context.beginPath();
                context.arc(0, 0, planet.size * 1.5, 0, Math.PI * 2);
                context.fill();
                
                // خود سیاره
                context.font = `${planet.size}px Arial`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.globalAlpha = 1;
                context.fillText(planet.type, 0, 0);
                
                context.restore();
            }
        });
    }
    
    renderAsteroids(context, cameraX, cameraY) {
        this.asteroids.forEach(asteroid => {
            const screenX = asteroid.x + cameraX;
            const screenY = asteroid.y + cameraY;
            
            if (this.isVisible(screenX, screenY, asteroid.size)) {
                context.save();
                context.translate(screenX, screenY);
                context.rotate(asteroid.rotation * Math.PI / 180);
                
                context.fillStyle = '#888';
                context.globalAlpha = 0.8;
                context.beginPath();
                context.arc(0, 0, asteroid.size, 0, Math.PI * 2);
                context.fill();
                
                // جزئیات سطح
                context.fillStyle = '#666';
                context.beginPath();
                context.arc(-asteroid.size * 0.3, -asteroid.size * 0.2, asteroid.size * 0.2, 0, Math.PI * 2);
                context.fill();
                
                context.beginPath();
                context.arc(asteroid.size * 0.4, asteroid.size * 0.3, asteroid.size * 0.15, 0, Math.PI * 2);
                context.fill();
                
                context.restore();
            }
        });
    }
    
    renderSpaceStations(context, cameraX, cameraY) {
        const time = performance.now() * 0.001;
        
        this.spaceStations.forEach(station => {
            const screenX = station.x + cameraX;
            const screenY = station.y + cameraY;
            
            if (this.isVisible(screenX, screenY, station.size)) {
                context.save();
                context.translate(screenX, screenY);
                context.rotate(station.rotation * Math.PI / 180);
                
                // بدنه اصلی
                context.fillStyle = '#4fc3f7';
                context.globalAlpha = 0.9;
                context.beginPath();
                context.arc(0, 0, station.size * 0.6, 0, Math.PI * 2);
                context.fill();
                
                // حلقه
                context.strokeStyle = '#ffeb3b';
                context.lineWidth = 3;
                context.globalAlpha = 0.7;
                context.beginPath();
                context.arc(0, 0, station.size * 0.8, 0, Math.PI * 2);
                context.stroke();
                
                // نورهای چشمک‌زن
                const lightIntensity = (Math.sin(station.lightPhase) + 1) * 0.5;
                context.fillStyle = `rgba(255, 255, 255, ${lightIntensity})`;
                context.beginPath();
                context.arc(station.size * 0.4, 0, station.size * 0.1, 0, Math.PI * 2);
                context.fill();
                
                context.restore();
            }
        });
    }
    
    renderBlackHoles(context, cameraX, cameraY) {
        const time = performance.now() * 0.001;
        
        this.blackHoles.forEach(hole => {
            const screenX = hole.x + cameraX;
            const screenY = hole.y + cameraY;
            
            if (this.isVisible(screenX, screenY, hole.size)) {
                context.save();
                context.translate(screenX, screenY);
                context.rotate(hole.rotation * Math.PI / 180);
                
                const pulse = (Math.sin(hole.pulsePhase) + 1) * 0.5;
                
                // هاله بیرونی
                const outerGlow = context.createRadialGradient(0, 0, hole.size * 0.8, 0, 0, hole.size * 2);
                outerGlow.addColorStop(0, `rgba(100, 0, 150, ${0.3 + pulse * 0.2})`);
                outerGlow.addColorStop(1, 'transparent');
                
                context.fillStyle = outerGlow;
                context.globalAlpha = 0.6;
                context.beginPath();
                context.arc(0, 0, hole.size * 2, 0, Math.PI * 2);
                context.fill();
                
                // حلقه چرخان
                context.strokeStyle = `rgba(200, 0, 255, ${0.8 + pulse * 0.2})`;
                context.lineWidth = 8;
                context.globalAlpha = 0.9;
                context.beginPath();
                context.arc(0, 0, hole.size * 1.2, 0, Math.PI * 2);
                context.stroke();
                
                // مرکز سیاهچاله
                context.fillStyle = '#000';
                context.beginPath();
                context.arc(0, 0, hole.size * 0.6, 0, Math.PI * 2);
                context.fill();
                
                context.restore();
            }
        });
    }
    
    isVisible(x, y, size) {
        return x >= -size && x <= window.innerWidth + size && 
               y >= -size && y <= window.innerHeight + size;
    }
}

// سیستم افکت‌های ویژه
class SpecialEffectsSystem {
    constructor() {
        this.particles = [];
        this.lightEffects = [];
        this.screenShake = { intensity: 0, duration: 0 };
    }
    
    createExplosion(x, y, type = 'normal') {
        const particleCount = type === 'big' ? 50 : type === 'huge' ? 100 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                maxLife: 1,
                size: Math.random() * 8 + 4,
                color: this.getExplosionColor(type),
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
        
        // ایجاد لرزش صفحه
        this.screenShake = {
            intensity: type === 'huge' ? 20 : type === 'big' ? 10 : 5,
            duration: type === 'huge' ? 30 : type === 'big' ? 20 : 10
        };
        
        // افکت نور
        this.createLightEffect(x, y, type);
    }
    
    getExplosionColor(type) {
        switch(type) {
            case 'plasma': return ['#ff00ff', '#00ffff', '#ffffff'];
            case 'laser': return ['#00aaff', '#0088ff', '#ffffff'];
            case 'missile': return ['#ff4444', '#ffaa00', '#ffff00'];
            default: return ['#ff4444', '#ffaa00', '#ffffff'];
        }
    }
    
    createLightEffect(x, y, type) {
        const colors = {
            normal: { primary: '#ffaa00', secondary: '#ff4444' },
            plasma: { primary: '#ff00ff', secondary: '#00ffff' },
            laser: { primary: '#00aaff', secondary: '#0088ff' },
            missile: { primary: '#ff4444', secondary: '#ffff00' }
        };
        
        const color = colors[type] || colors.normal;
        
        this.lightEffects.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: type === 'huge' ? 300 : type === 'big' ? 200 : 100,
            color: color.primary,
            secondaryColor: color.secondary,
            life: 1,
            maxLife: 1
        });
    }
    
    update() {
        this.updateParticles();
        this.updateLightEffects();
        this.updateScreenShake();
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life -= 0.02;
            particle.rotation += particle.rotationSpeed;
            
            return particle.life > 0;
        });
    }
    
    updateLightEffects() {
        this.lightEffects = this.lightEffects.filter(effect => {
            effect.radius += (effect.maxRadius - effect.radius) * 0.1;
            effect.life -= 0.03;
            
            return effect.life > 0;
        });
    }
    
    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration--;
            this.screenShake.intensity *= 0.9;
        }
    }
    
    getScreenShake() {
        if (this.screenShake.duration <= 0) return { x: 0, y: 0 };
        
        return {
            x: (Math.random() - 0.5) * this.screenShake.intensity,
            y: (Math.random() - 0.5) * this.screenShake.intensity
        };
    }
    
    render(context, cameraX, cameraY) {
        this.renderLightEffects(context, cameraX, cameraY);
        this.renderParticles(context, cameraX, cameraY);
    }
    
    renderLightEffects(context, cameraX, cameraY) {
        this.lightEffects.forEach(effect => {
            const screenX = effect.x + cameraX;
            const screenY = effect.y + cameraY;
            
            const gradient = context.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, effect.radius
            );
            gradient.addColorStop(0, effect.color);
            gradient.addColorStop(0.5, effect.secondaryColor);
            gradient.addColorStop(1, 'transparent');
            
            context.fillStyle = gradient;
            context.globalAlpha = effect.life * 0.3;
            context.beginPath();
            context.arc(screenX, screenY, effect.radius, 0, Math.PI * 2);
            context.fill();
        });
        
        context.globalAlpha = 1;
    }
    
    renderParticles(context, cameraX, cameraY) {
        this.particles.forEach(particle => {
            const screenX = particle.x + cameraX;
            const screenY = particle.y + cameraY;
            
            const alpha = particle.life;
            const size = particle.size * particle.life;
            
            context.save();
            context.translate(screenX, screenY);
            context.rotate(particle.rotation * Math.PI / 180);
            context.globalAlpha = alpha;
            
            // ذره
            context.fillStyle = Array.isArray(particle.color) ? 
                particle.color[Math.floor(Math.random() * particle.color.length)] : particle.color;
            
            context.beginPath();
            context.rect(-size/2, -size/2, size, size);
            context.fill();
            
            context.restore();
        });
        
        context.globalAlpha = 1;
    }
}

// سیستم رندر واکنشی
class ReactiveRenderSystem {
    constructor() {
        this.postProcessingEffects = [];
        this.time = 0;
    }
    
    applyPostProcessing(context, canvas) {
        this.time += 0.01;
        
        // افکت Chromatic Aberration
        this.applyChromaticAberration(context, canvas);
        
        // افکت Bloom سبک
        this.applyBloom(context, canvas);
        
        // افکت Vignette
        this.applyVignette(context, canvas);
    }
    
    applyChromaticAberration(context, canvas) {
        const intensity = Math.sin(this.time) * 0.5 + 0.5;
        const amount = intensity * 2;
        
        // این افکت نیاز به WebGL دارد، بنابراین یک نسخه ساده پیاده‌سازی می‌کنیم
        context.globalAlpha = 0.1;
        context.fillStyle = '#ff0000';
        context.fillRect(-amount, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#00ff00';
        context.fillRect(0, -amount, canvas.width, canvas.height);
        
        context.fillStyle = '#0000ff';
        context.fillRect(amount, 0, canvas.width, canvas.height);
        
        context.globalAlpha = 1;
    }
    
    applyBloom(context, canvas) {
        context.globalAlpha = 0.05;
        context.fillStyle = '#ffffff';
        
        // ایجاد افکت نور ملایم
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(this.time + i) * 2;
            context.fillRect(offset, offset, canvas.width, canvas.height);
        }
        
        context.globalAlpha = 1;
    }
    
    applyVignette(context, canvas) {
        const gradient = context.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        );
        
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.7, 'transparent');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    onPlayerMove(playerX, playerY, speed) {
        // افکت Motion Blur بر اساس سرعت
        const motionIntensity = Math.min(speed * 0.1, 0.3);
        
        if (motionIntensity > 0.1) {
            this.postProcessingEffects.push({
                type: 'motionBlur',
                intensity: motionIntensity,
                duration: 5
            });
        }
    }
    
    onEnemyDestroyed(x, y) {
        // افکت ضربه هنگام نابودی دشمن
        this.postProcessingEffects.push({
            type: 'impact',
            x: x,
            y: y,
            intensity: 1,
            duration: 10
        });
    }
    
    update() {
        this.time += 0.016;
        
        this.postProcessingEffects = this.postProcessingEffects.filter(effect => {
            effect.duration--;
            effect.intensity *= 0.9;
            return effect.duration > 0 && effect.intensity > 0.01;
        });
    }
}

// سیستم مدیریت عملکرد
class PerformanceManager {
    constructor() {
        this.frameRate = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.performanceStats = {
            frames: 0,
            averageFps: 0,
            minFps: 999,
            maxFps: 0
        };
        
        this.qualitySettings = {
            stars: true,
            nebulas: true,
            planets: true,
            asteroids: true,
            stations: true,
            blackHoles: true,
            particles: true,
            postProcessing: true
        };
    }
    
    update() {
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.frameRate = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.performanceStats.frames = this.frameCount;
            this.performanceStats.averageFps = this.frameRate;
            this.performanceStats.minFps = Math.min(this.performanceStats.minFps, this.frameRate);
            this.performanceStats.maxFps = Math.max(this.performanceStats.maxFps, this.frameRate);
            
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            this.adaptiveQuality();
        }
        
        this.lastFrameTime = now;
    }
    
    adaptiveQuality() {
        if (this.frameRate < 45) {
            this.reduceQuality();
        } else if (this.frameRate > 55) {
            this.increaseQuality();
        }
    }
    
    reduceQuality() {
        if (this.qualitySettings.particles) {
            this.qualitySettings.particles = false;
        } else if (this.qualitySettings.postProcessing) {
            this.qualitySettings.postProcessing = false;
        } else if (this.qualitySettings.asteroids) {
            this.qualitySettings.asteroids = false;
        } else if (this.qualitySettings.nebulas) {
            this.qualitySettings.nebulas = false;
        }
    }
    
    increaseQuality() {
        if (!this.qualitySettings.nebulas) {
            this.qualitySettings.nebulas = true;
        } else if (!this.qualitySettings.asteroids) {
            this.qualitySettings.asteroids = true;
        } else if (!this.qualitySettings.postProcessing) {
            this.qualitySettings.postProcessing = true;
        } else if (!this.qualitySettings.particles) {
            this.qualitySettings.particles = true;
        }
    }
    
    getStats() {
        return {
            ...this.performanceStats,
            qualitySettings: this.qualitySettings
        };
    }
}

// ایجاد نمونه‌های جهانی
const galaxyBackground = new GalaxyBackgroundSystem();
const specialEffects = new SpecialEffectsSystem();
const reactiveRender = new ReactiveRenderSystem();
const performanceManager = new PerformanceManager();

// اضافه کردن به محیط جهانی
window.GalaxyBackgroundSystem = GalaxyBackgroundSystem;
window.SpecialEffectsSystem = SpecialEffectsSystem;
window.ReactiveRenderSystem = ReactiveRenderSystem;
window.PerformanceManager = PerformanceManager;
window.galaxyBackground = galaxyBackground;
window.specialEffects = specialEffects;
window.reactiveRender = reactiveRender;
window.performanceManager = performanceManager;

console.log('✅ سیستم کهکشان و افکت‌های ویژه بارگذاری شد!');

// راهنمای استفاده:
// 1. galaxyBackground.render(context, cameraX, cameraY) - رندر کهکشان
// 2. specialEffects.createExplosion(x, y, type) - ایجاد انفجار
// 3. reactiveRender.applyPostProcessing(context, canvas) - افکت‌های پست-پراسسینگ
// 4. performanceManager.update() - به روزرسانی مدیریت عملکرد
