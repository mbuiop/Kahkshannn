// m.js - سیستم پس‌زمینه کهکشان
class GalaxyBackground {
    constructor() {
        this.container = null;
        this.stars = [];
        this.nebulas = [];
        this.planets = [];
        this.animationId = null;
    }

    init() {
        this.createContainer();
        this.createStars(5000);
        this.createNebulas(20);
        this.createPlanets(50);
        this.createGalaxyArms(8);
        this.startAnimation();
        
        console.log('سیستم پس‌زمینه کهکشان راه‌اندازی شد');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'galaxyBackground';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 30%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.25) 0%, transparent 50%),
                linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a2a 100%);
            z-index: 1;
            overflow: hidden;
        `;
        document.getElementById('gameContainer').appendChild(this.container);
    }

    createStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 0.5;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 10 + 5;
            const brightness = Math.random() * 0.8 + 0.2;
            const delay = Math.random() * 5;

            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                opacity: ${brightness};
                animation: starTwinkle ${duration}s ease-in-out ${delay}s infinite;
                box-shadow: 0 0 ${size * 2}px white;
            `;

            this.container.appendChild(star);
            this.stars.push(star);
        }

        // اضافه کردن استایل انیمیشن ستاره‌ها
        const style = document.createElement('style');
        style.textContent = `
            @keyframes starTwinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }

    createNebulas(count) {
        const colors = [
            'rgba(138, 43, 226, 0.1)',    // بنفش
            'rgba(255, 105, 180, 0.1)',   // صورتی
            'rgba(30, 144, 255, 0.1)',    // آبی
            'rgba(50, 205, 50, 0.1)',     // سبز
            'rgba(255, 165, 0, 0.1)',     // نارنجی
            'rgba(255, 215, 0, 0.1)'      // طلایی
        ];

        for (let i = 0; i < count; i++) {
            const nebula = document.createElement('div');
            const width = Math.random() * 300 + 100;
            const height = Math.random() * 200 + 50;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const duration = Math.random() * 30 + 15;
            const rotation = Math.random() * 360;

            nebula.style.cssText = `
                position: absolute;
                width: ${width}px;
                height: ${height}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}%;
                top: ${y}%;
                filter: blur(40px);
                opacity: 0.1;
                animation: nebulaFloat ${duration}s ease-in-out infinite;
                transform: rotate(${rotation}deg);
            `;

            this.container.appendChild(nebula);
            this.nebulas.push(nebula);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes nebulaFloat {
                0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
                25% { transform: translate(10px, -5px) rotate(1deg); opacity: 0.15; }
                50% { transform: translate(-5px, 10px) rotate(-1deg); opacity: 0.08; }
                75% { transform: translate(-10px, -5px) rotate(2deg); opacity: 0.12; }
            }
        `;
        document.head.appendChild(style);
    }

    createPlanets(count) {
        const planetTypes = ['🪐', '🌍', '🌕', '🌑', '🔥', '💧', '🌫️', '⭐', '🌟', '☄️'];

        for (let i = 0; i < count; i++) {
            const planet = document.createElement('div');
            const size = Math.random() * 80 + 20;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const duration = Math.random() * 40 + 20;
            const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
            const rotation = Math.random() * 360;

            planet.style.cssText = `
                position: absolute;
                font-size: ${size}px;
                left: ${x}%;
                top: ${y}%;
                animation: planetOrbit ${duration}s linear infinite;
                transform: rotate(${rotation}deg);
                filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
            `;
            planet.textContent = type;

            this.container.appendChild(planet);
            this.planets.push(planet);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes planetOrbit {
                0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
                100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    createGalaxyArms(count) {
        for (let i = 0; i < count; i++) {
            const arm = document.createElement('div');
            const width = Math.random() * 400 + 200;
            const height = Math.random() * 100 + 50;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const rotation = Math.random() * 360;
            const duration = Math.random() * 50 + 25;

            arm.style.cssText = `
                position: absolute;
                width: ${width}px;
                height: ${height}px;
                background: radial-gradient(ellipse, rgba(100, 100, 255, 0.05) 0%, transparent 70%);
                left: ${x}%;
                top: ${y}%;
                border-radius: 50% / 10%;
                transform: rotate(${rotation}deg);
                animation: armRotate ${duration}s linear infinite;
                filter: blur(10px);
            `;

            this.container.appendChild(arm);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes armRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    startAnimation() {
        let lastTime = 0;
        const animate = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // به‌روزرسانی موقعیت اجرام آسمانی
            this.updateCelestialBodies(deltaTime);

            this.animationId = requestAnimationFrame(animate);
        };
        this.animationId = requestAnimationFrame(animate);
    }

    updateCelestialBodies(deltaTime) {
        // حرکت آرام کهکشان
        const speed = 0.0001;
        this.stars.forEach((star, index) => {
            const currentLeft = parseFloat(star.style.left);
            star.style.left = (currentLeft - speed * deltaTime * (index % 3 + 1)) + '%';
            
            // اگر ستاره از صفحه خارج شد، به ابتدا بازگرداندن
            if (currentLeft < -5) {
                star.style.left = '105%';
                star.style.top = Math.random() * 100 + '%';
            }
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.container) {
            this.container.remove();
        }
    }
}

// ایجاد نمونه از کلاس برای استفاده جهانی
window.GalaxyBackground = GalaxyBackground;
