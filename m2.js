// m2.js - سیستم انیمیشن و پشتیبانی
class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.particles = [];
        this.effects = [];
        this.animationId = null;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fps = 60;
        this.isPaused = false;
    }

    init() {
        this.setupAnimationLoop();
        this.createBaseAnimations();
        this.setupPerformanceMonitor();
        
        console.log('سیستم انیمیشن راه‌اندازی شد');
    }

    setupAnimationLoop() {
        const animate = (currentTime) => {
            if (!this.isPaused) {
                const deltaTime = currentTime - this.lastFrameTime;
                this.lastFrameTime = currentTime;
                
                this.updateAnimations(deltaTime);
                this.updateParticles(deltaTime);
                this.updateEffects(deltaTime);
                this.frameCount++;
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    createBaseAnimations() {
        // ایجاد استایل‌های پایه برای انیمیشن‌ها
        const style = document.createElement('style');
        style.textContent = `
            /* انیمیشن‌های پایه */
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @keyframes glow {
                0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
                50% { filter: drop-shadow(0 0 15px currentColor); }
            }
            
            /* انیمیشن‌های پیشرفته */
            @keyframes quantumFloat {
                0%, 100% { 
                    transform: translate3d(0, 0, 0) rotate(0deg) scale(1); 
                    opacity: 1;
                }
                25% { 
                    transform: translate3d(10px, -15px, 5px) rotate(5deg) scale(1.05);
                    opacity: 0.9;
                }
                50% { 
                    transform: translate3d(-5px, -25px, 10px) rotate(-3deg) scale(1.1);
                    opacity: 0.8;
                }
                75% { 
                    transform: translate3d(-10px, -15px, 5px) rotate(2deg) scale(1.05);
                    opacity: 0.9;
                }
            }
            
            @keyframes hologram {
                0%, 100% { 
                    filter: hue-rotate(0deg) brightness(1) contrast(1);
                    opacity: 0.8;
                }
                50% { 
                    filter: hue-rotate(180deg) brightness(1.2) contrast(1.1);
                    opacity: 1;
                }
            }
            
            @keyframes warp {
                0%, 100% { 
                    transform: scale(1) rotate(0deg);
                    filter: blur(0px);
                }
                50% { 
                    transform: scale(1.5) rotate(180deg);
                    filter: blur(2px);
                }
            }
            
            /* کلاس‌های انیمیشن آماده */
            .anim-float { animation: float 3s ease-in-out infinite; }
            .anim-pulse { animation: pulse 2s ease-in-out infinite; }
            .anim-shake { animation: shake 0.5s ease-in-out infinite; }
            .anim-spin { animation: spin 2s linear infinite; }
            .anim-glow { animation: glow 1.5s ease-in-out infinite; }
            .anim-quantum { animation: quantumFloat 4s ease-in-out infinite; }
            .anim-hologram { animation: hologram 3s ease-in-out infinite; }
            .anim-warp { animation: warp 5s ease-in-out infinite; }
        `;
        document.head.appendChild(style);
    }

    setupPerformanceMonitor() {
        // مانیتورینگ عملکرد برای جلوگیری از هنگ
        setInterval(() => {
            this.monitorPerformance();
        }, 1000);
    }

    monitorPerformance() {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrameTime;
        
        // اگر فریم‌ریت خیلی پایین آمد، اقدامات بهینه‌سازی انجام شود
        if (elapsed > 32) { // کمتر از 30 فریم بر ثانیه
            console.warn('کاهش عملکرد تشخیص داده شد. اقدامات بهینه‌سازی فعال شدند.');
            this.optimizePerformance();
        }
        
        // اگر تعداد المان‌ها خیلی زیاد شد، پاکسازی انجام شود
        if (this.particles.length > 1000) {
            this.cleanupExcessParticles();
        }
    }

    optimizePerformance() {
        // کاهش کیفیت انیمیشن‌ها برای بهبود عملکرد
        this.particles = this.particles.filter(particle => {
            if (particle.life < particle.maxLife * 0.5) {
                particle.element.style.willChange = 'auto';
                return true;
            }
            return true;
        });
        
        // غیرفعال کردن انیمیشن‌های غیرضروری
        this.effects = this.effects.filter(effect => {
            return effect.priority > 0.5;
        });
    }

    cleanupExcessParticles() {
        // پاکسازی ذرات قدیمی
        const particlesToRemove = this.particles.length - 800;
        if (particlesToRemove > 0) {
            this.particles.splice(0, particlesToRemove).forEach(particle => {
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
            });
        }
    }

    createAnimation(name, keyframes, options = {}) {
        const animation = {
            keyframes,
            options: {
                duration: 1000,
                iterations: Infinity,
                easing: 'ease-in-out',
                ...options
            },
            elements: new Set()
        };
        
        this.animations.set(name, animation);
        return animation;
    }

    addAnimationToElement(element, animationName) {
        const animation = this.animations.get(animationName);
        if (animation) {
            animation.elements.add(element);
            this.applyAnimationToElement(element, animation);
        }
    }

    applyAnimationToElement(element, animation) {
        element.style.animation = `
            ${animation.keyframes}
            ${animation.options.duration}ms
            ${animation.options.easing}
            ${animation.options.iterations}
        `;
    }

    createParticle(x, y, options = {}) {
        const particle = document.createElement('div');
        const size = options.size || Math.random() * 10 + 5;
        const color = options.color || this.getRandomColor();
        const life = options.life || Math.random() * 2000 + 1000;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 10;
            will-change: transform, opacity;
        `;
        
        document.getElementById('gameContainer').appendChild(particle);
        
        const particleData = {
            element: particle,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: life,
            maxLife: life,
            size: size,
            color: color
        };
        
        this.particles.push(particleData);
        return particleData;
    }

    createExplosion(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            this.createParticle(x, y, {
                color: this.getRandomExplosionColor(),
                size: Math.random() * 8 + 2,
                life: Math.random() * 1000 + 500
            });
        }
        
        // افکت نور
        this.createLightEffect(x, y, 100, 'radial-gradient(circle, rgba(255,100,0,0.8) 0%, transparent 70%)');
    }

    createLightEffect(x, y, size, gradient) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${gradient};
            border-radius: 50%;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            pointer-events: none;
            z-index: 5;
            animation: pulse 500ms ease-out forwards;
        `;
        
        document.getElementById('gameContainer').appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 500);
    }

    getRandomColor() {
        const colors = [
            '#ff4444', '#44ff44', '#4444ff', '#ffff44',
            '#ff44ff', '#44ffff', '#ff8844', '#8844ff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomExplosionColor() {
        const colors = [
            '#ff4400', '#ff8800', '#ffaa00', '#ffff00',
            '#ff0044', '#ff0088', '#ff00aa', '#ff00ff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateAnimations(deltaTime) {
        // به‌روزرسانی انیمیشن‌های سفارشی
        this.animations.forEach((animation, name) => {
            // منطق به‌روزرسانی انیمیشن‌های پیچیده
        });
    }

    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                if (particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
                this.particles.splice(i, 1);
                continue;
            }
            
            // به‌روزرسانی موقعیت
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // اعمال گرانش
            particle.vy += 0.1;
            
            // کاهش سرعت
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // به‌روزرسانی المان
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = particle.life / particle.maxLife;
            particle.element.style.transform = `scale(${particle.life / particle.maxLife})`;
        }
    }

    updateEffects(deltaTime) {
        // به‌روزرسانی افکت‌های ویژه
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.update(deltaTime);
            
            if (effect.isComplete) {
                this.effects.splice(i, 1);
            }
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.lastFrameTime = performance.now();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // پاکسازی تمام المان‌ها
        this.particles.forEach(particle => {
            if (particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        this.particles = [];
        this.effects = [];
        this.animations.clear();
    }
}

// ایجاد نمونه از کلاس برای استفاده جهانی
window.AnimationSystem = AnimationSystem;
