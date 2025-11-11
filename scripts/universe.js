// فایل جهان بازی - مدیریت پس‌زمینه و محیط

class Universe {
    constructor() {
        this.background = null;
        this.stars = [];
        this.planets = [];
        this.spaceObjects = [];
        this.isCreated = false;
        
        this.init();
    }

    init() {
        console.log('🌌 سیستم کهکشان راه‌اندازی شد');
        this.setupBackground();
    }

    setupBackground() {
        this.background = document.getElementById('universeBackground');
        if (!this.background) {
            console.error('❌ المان پس‌زمینه پیدا نشد');
            return;
        }
    }

    // ایجاد جهان
    create() {
        if (this.isCreated) {
            this.destroy();
        }
        
        console.log('✨ ایجاد جهان جدید');
        
        this.createStars();
        this.createPlanets();
        this.createSpaceObjects();
        
        this.isCreated = true;
    }

    // ایجاد ستاره‌ها
    createStars() {
        const starCount = 2000;
        
        for (let i = 0; i < starCount; i++) {
            const star = this.createStar();
            this.stars.push(star);
            this.background.appendChild(star.element);
        }
        
        console.log(`⭐ ${starCount} ستاره ایجاد شد`);
    }

    createStar() {
        const star = document.createElement('div');
        const size = Math.random();
        
        // تعیین اندازه ستاره
        if (size < 0.7) {
            star.className = 'star small';
        } else if (size < 0.9) {
            star.className = 'star medium';
        } else {
            star.className = 'star large';
        }
        
        // موقعیت تصادفی در جهان پهناور
        star.style.left = Math.random() * 1000 + 'vw';
        star.style.top = Math.random() * 1000 + 'vh';
        
        // انیمیشن چشمک زدن
        star.style.animationDelay = Math.random() * 5 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        return {
            element: star,
            x: parseFloat(star.style.left),
            y: parseFloat(star.style.top),
            size: size
        };
    }

    // ایجاد سیارات
    createPlanets() {
        const planetCount = 500;
        const planetTypes = ['🪐', '🌝', '🌗', '🌘', '🌑', '🌒', '🌓'];
        
        for (let i = 0; i < planetCount; i++) {
            const planet = this.createPlanet(planetTypes);
            this.planets.push(planet);
            this.background.appendChild(planet.element);
        }
        
        console.log(`🪐 ${planetCount} سیاره ایجاد شد`);
    }

    createPlanet(types) {
        const planet = document.createElement('div');
        planet.className = 'tiny-planet';
        planet.innerHTML = types[Math.floor(Math.random() * types.length)];
        
        // موقعیت تصادفی
        planet.style.left = Math.random() * 1000 + 'vw';
        planet.style.top = Math.random() * 1000 + 'vh';
        
        // انیمیشن شناور
        const animationDelay = Math.random() * 60;
        const animationDuration = 40 + Math.random() * 40;
        
        planet.style.animationDelay = animationDelay + 's';
        planet.style.animationDuration = animationDuration + 's';
        
        return {
            element: planet,
            x: parseFloat(planet.style.left),
            y: parseFloat(planet.style.top),
            type: planet.innerHTML,
            size: 12
        };
    }

    // ایجاد اجرام فضایی
    createSpaceObjects() {
        const objectCount = 150;
        const objectTypes = ['🛎', '🛰', '🚟', '⭐', '🌟', '✨'];
        
        for (let i = 0; i < objectCount; i++) {
            const spaceObject = this.createSpaceObject(objectTypes);
            this.spaceObjects.push(spaceObject);
            this.background.appendChild(spaceObject.element);
        }
        
        console.log(`🚀 ${objectCount} جرم فضایی ایجاد شد`);
    }

    createSpaceObject(types) {
        const spaceObject = document.createElement('div');
        spaceObject.className = 'space-object';
        spaceObject.innerHTML = types[Math.floor(Math.random() * types.length)];
        
        // موقعیت تصادفی
        spaceObject.style.left = Math.random() * 1000 + 'vw';
        spaceObject.style.top = Math.random() * 1000 + 'vh';
        
        // انیمیشن
        const animationDelay = Math.random() * 8;
        const animationDuration = 6 + Math.random() * 4;
        
        spaceObject.style.animationDelay = animationDelay + 's';
        spaceObject.style.animationDuration = animationDuration + 's';
        
        // اندازه تصادفی
        const size = 15 + Math.random() * 15;
        spaceObject.style.fontSize = size + 'px';
        
        return {
            element: spaceObject,
            x: parseFloat(spaceObject.style.left),
            y: parseFloat(spaceObject.style.top),
            type: spaceObject.innerHTML,
            size: size
        };
    }

    // به‌روزرسانی پس‌زمینه بر اساس موقعیت بازیکن
    updateBackground(playerX, playerY) {
        if (!this.background) return;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // محاسبه موقعیت جدید پس‌زمینه
        const bgX = -((playerX - centerX) / centerX) * 50;
        const bgY = -((playerY - centerY) / centerY) * 50;
        
        this.background.style.left = bgX + 'vw';
        this.background.style.top = bgY + 'vh';
    }

    // ایجاد افکت‌های ویژه
    createNebula(x, y, color = '#ff00ff', size = 200) {
        const nebula = document.createElement('div');
        nebula.style.position = 'absolute';
        nebula.style.left = x + 'px';
        nebula.style.top = y + 'px';
        nebula.style.width = size + 'px';
        nebula.style.height = size + 'px';
        nebula.style.background = `radial-gradient(circle, ${color}40, transparent 70%)`;
        nebula.style.borderRadius = '50%';
        nebula.style.filter = 'blur(20px)';
        nebula.style.zIndex = '1';
        nebula.style.pointerEvents = 'none';
        
        this.background.appendChild(nebula);
        
        // حذف خودکار پس از مدتی
        setTimeout(() => {
            nebula.remove();
        }, 5000);
        
        return nebula;
    }

    createBlackHole(x, y) {
        const blackHole = document.createElement('div');
        blackHole.style.position = 'absolute';
        blackHole.style.left = x + 'px';
        blackHole.style.top = y + 'px';
        blackHole.style.width = '100px';
        blackHole.style.height = '100px';
        blackHole.style.background = 'radial-gradient(circle, #000000, #330066, #000000)';
        blackHole.style.borderRadius = '50%';
        blackHole.style.boxShadow = '0 0 50px #6600ff, inset 0 0 20px #000000';
        blackHole.style.zIndex = '2';
        blackHole.style.animation = 'blackHoleSpin 10s infinite linear';
        
        // تعریف انیمیشن چرخش
        if (!document.querySelector('#blackHoleAnimation')) {
            const style = document.createElement('style');
            style.id = 'blackHoleAnimation';
            style.textContent = `
                @keyframes blackHoleSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.background.appendChild(blackHole);
        return blackHole;
    }

    createAsteroidField(x, y, count = 20) {
        const asteroids = [];
        
        for (let i = 0; i < count; i++) {
            const asteroid = document.createElement('div');
            asteroid.innerHTML = '🪨';
            asteroid.style.position = 'absolute';
            asteroid.style.left = (x + (Math.random() - 0.5) * 300) + 'px';
            asteroid.style.top = (y + (Math.random() - 0.5) * 300) + 'px';
            asteroid.style.fontSize = (10 + Math.random() * 20) + 'px';
            asteroid.style.zIndex = '1';
            asteroid.style.animation = `asteroidFloat ${3 + Math.random() * 4}s infinite ease-in-out`;
            asteroid.style.filter = 'drop-shadow(0 0 3px #888888)';
            
            // تعریف انیمیشن شناور
            if (!document.querySelector('#asteroidAnimation')) {
                const style = document.createElement('style');
                style.id = 'asteroidAnimation';
                style.textContent = `
                    @keyframes asteroidFloat {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-5px) rotate(10deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            this.background.appendChild(asteroid);
            asteroids.push(asteroid);
        }
        
        return asteroids;
    }

    // ایجاد منظومه ستاره‌ای
    createStarSystem(x, y) {
        const system = {
            stars: [],
            planets: []
        };
        
        // ستاره مرکزی
        const centralStar = this.createCentralStar(x, y);
        system.stars.push(centralStar);
        
        // سیارات
        const planetCount = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < planetCount; i++) {
            const planet = this.createOrbitingPlanet(x, y, i + 1);
            system.planets.push(planet);
        }
        
        return system;
    }

    createCentralStar(x, y) {
        const star = document.createElement('div');
        star.innerHTML = '☀️';
        star.style.position = 'absolute';
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        star.style.fontSize = '40px';
        star.style.zIndex = '3';
        star.style.filter = 'drop-shadow(0 0 20px #ffd700)';
        star.style.animation = 'starPulse 2s infinite alternate';
        
        // تعریف انیمیشن تپش
        if (!document.querySelector('#starPulseAnimation')) {
            const style = document.createElement('style');
            style.id = 'starPulseAnimation';
            style.textContent = `
                @keyframes starPulse {
                    from { transform: scale(1); opacity: 0.8; }
                    to { transform: scale(1.2); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.background.appendChild(star);
        return star;
    }

    createOrbitingPlanet(centerX, centerY, orbitNumber) {
        const planet = document.createElement('div');
        const planetTypes = ['🪐', '🌍', '🌕', '🛸'];
        planet.innerHTML = planetTypes[Math.floor(Math.random() * planetTypes.length)];
        
        planet.style.position = 'absolute';
        planet.style.fontSize = '20px';
        planet.style.zIndex = '2';
        planet.style.filter = 'drop-shadow(0 0 5px #ffffff)';
        
        const orbitRadius = 80 + orbitNumber * 40;
        const animationDuration = 10 + orbitNumber * 5;
        
        planet.style.animation = `orbit${orbitNumber} ${animationDuration}s infinite linear`;
        
        // تعریف انیمیشن مدار
        const style = document.createElement('style');
        style.textContent = `
            @keyframes orbit${orbitNumber} {
                from { 
                    transform: rotate(0deg) translateX(${orbitRadius}px) rotate(0deg); 
                }
                to { 
                    transform: rotate(360deg) translateX(${orbitRadius}px) rotate(-360deg); 
                }
            }
        `;
        document.head.appendChild(style);
        
        // موقعیت اولیه
        planet.style.left = (centerX + orbitRadius) + 'px';
        planet.style.top = centerY + 'px';
        
        this.background.appendChild(planet);
        return planet;
    }

    // پاک کردن جهان
    destroy() {
        console.log('🗑️ پاک کردن جهان قبلی');
        
        // پاک کردن ستاره‌ها
        this.stars.forEach(star => {
            star.element.remove();
        });
        this.stars = [];
        
        // پاک کردن سیارات
        this.planets.forEach(planet => {
            planet.element.remove();
        });
        this.planets = [];
        
        // پاک کردن اجرام فضایی
        this.spaceObjects.forEach(obj => {
            obj.element.remove();
        });
        this.spaceObjects = [];
        
        this.isCreated = false;
    }

    // به‌روزرسانی موقعیت المان‌های ویژه
    updateSpecialElements(playerX, playerY) {
        // این تابع می‌تواند برای به‌روزرسانی موقعیت المان‌های متحرک استفاده شود
    }

    // ایجاد افکت‌های محیطی
    createEnvironmentalEffect(type, x, y) {
        switch (type) {
            case 'nebula':
                return this.createNebula(x, y);
            case 'blackHole':
                return this.createBlackHole(x, y);
            case 'asteroidField':
                return this.createAsteroidField(x, y);
            case 'starSystem':
                return this.createStarSystem(x, y);
            default:
                console.warn('⚠️ نوع افکت محیطی ناشناخته:', type);
                return null;
        }
    }
}

// ایجاد نمونه از جهان
const universe = new Universe();

// صادر کردن برای استفاده global
window.universe = universe;
