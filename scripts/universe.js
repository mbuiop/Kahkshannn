// سیستم کهکشان پهناور
class UniverseSystem {
    constructor() {
        this.background = null;
        this.stars = [];
        this.planets = [];
        this.spaceObjects = [];
        this.parallaxLayers = [];
    }

    create() {
        this.background = document.getElementById('universeBackground');
        this.createStars();
        this.createPlanets();
        this.createSpaceObjects();
        this.createParallaxLayers();
    }

    createStars() {
        // ایجاد ستاره‌های زمینه
        for (let i = 0; i < 1500; i++) {
            const star = document.createElement('div');
            const size = Math.random();
            
            if (size < 0.7) {
                star.className = 'star small';
            } else if (size < 0.9) {
                star.className = 'star medium';
            } else {
                star.className = 'star large';
            }
            
            star.style.left = Math.random() * 1000 + 'vw';
            star.style.top = Math.random() * 1000 + 'vh';
            star.style.animationDelay = Math.random() * 5 + 's';
            
            this.background.appendChild(star);
            this.stars.push(star);
        }
    }

    createPlanets() {
        const tinyPlanets = ['🪐', '🌝', '🌗', '🌘', '🌑', '🌒', '🌓'];
        
        for (let i = 0; i < 300; i++) {
            const planet = document.createElement('div');
            planet.className = 'tiny-planet';
            planet.innerHTML = tinyPlanets[Math.floor(Math.random() * tinyPlanets.length)];
            planet.style.left = Math.random() * 1000 + 'vw';
            planet.style.top = Math.random() * 1000 + 'vh';
            planet.style.animationDelay = Math.random() * 60 + 's';
            planet.style.animationDuration = (40 + Math.random() * 40) + 's';
            
            this.background.appendChild(planet);
            this.planets.push(planet);
        }
    }

    createSpaceObjects() {
        const spaceObjects = ['🛎', '🛰', '🚟', '⭐', '🌟', '✨', '☄️', '💫'];
        
        for (let i = 0; i < 100; i++) {
            const obj = document.createElement('div');
            obj.className = 'space-object';
            obj.innerHTML = spaceObjects[Math.floor(Math.random() * spaceObjects.length)];
            obj.style.left = Math.random() * 1000 + 'vw';
            obj.style.top = Math.random() * 1000 + 'vh';
            obj.style.animationDelay = Math.random() * 8 + 's';
            obj.style.animationDuration = (6 + Math.random() * 6) + 's';
            
            this.background.appendChild(obj);
            this.spaceObjects.push(obj);
        }
    }

    createParallaxLayers() {
        // ایجاد لایه‌های پارالاکس برای عمق بیشتر
        for (let i = 0; i < 3; i++) {
            const layer = document.createElement('div');
            layer.className = `parallax-layer layer-${i + 1}`;
            layer.style.zIndex = i;
            
            // اضافه کردن ستاره‌های بیشتر به لایه‌ها
            for (let j = 0; j < 200; j++) {
                const star = document.createElement('div');
                star.className = 'parallax-star';
                star.style.left = Math.random() * 100 + 'vw';
                star.style.top = Math.random() * 100 + 'vh';
                star.style.animationDelay = Math.random() * 10 + 's';
                layer.appendChild(star);
            }
            
            this.background.appendChild(layer);
            this.parallaxLayers.push(layer);
        }
    }

    update(playerX, playerY) {
        if (!this.background) return;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // حرکت کهکشان بر اساس موقعیت بازیکن (اثر پارالاکس)
        const bgX = -((playerX - centerX) / centerX) * 30;
        const bgY = -((playerY - centerY) / centerY) * 30;
        
        this.background.style.transform = `translate(${bgX}vw, ${bgY}vh)`;
        
        // به‌روزرسانی لایه‌های پارالاکس با سرعت‌های مختلف
        this.parallaxLayers.forEach((layer, index) => {
            const speed = 0.3 + (index * 0.2);
            const layerX = bgX * speed;
            const layerY = bgY * speed;
            layer.style.transform = `translate(${layerX}vw, ${layerY}vh)`;
        });
    }

    // ایجاد سحابی‌های رنگی
    createNebulas() {
        const colors = [
            'rgba(138, 43, 226, 0.1)',  // بنفش
            'rgba(255, 105, 180, 0.1)', // صورتی
            'rgba(30, 144, 255, 0.1)',  // آبی
            'rgba(50, 205, 50, 0.1)'    // سبز
        ];
        
        for (let i = 0; i < 8; i++) {
            const nebula = document.createElement('div');
            nebula.className = 'nebula';
            nebula.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]} 0%, transparent 70%)`;
            nebula.style.width = (200 + Math.random() * 300) + 'vw';
            nebula.style.height = (200 + Math.random() * 300) + 'vh';
            nebula.style.left = Math.random() * 100 + 'vw';
            nebula.style.top = Math.random() * 100 + 'vh';
            nebula.style.animation = `nebulaFloat ${60 + Math.random() * 120}s infinite ease-in-out`;
            nebula.style.animationDelay = Math.random() * 60 + 's';
            
            this.background.appendChild(nebula);
        }
    }

    clear() {
        if (this.background) {
            this.background.innerHTML = '';
        }
        this.stars = [];
        this.planets = [];
        this.spaceObjects = [];
        this.parallaxLayers = [];
    }
}

// ایجاد نمونه کهکشان
const Universe = new UniverseSystem();
