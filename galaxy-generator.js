// galaxy-generator.js
class GalaxyGenerator {
    constructor() {
        this.galaxyContainer = document.getElementById('galaxyBackground');
        this.stars = [];
        this.planets = [];
        this.nebulas = [];
    }
    
    createGalaxy() {
        this.createStars(2000);
        this.createPlanets(50);
        this.createNebulas(20);
        this.createAsteroids(100);
        this.createBlackHoles(5);
        this.createComets(15);
        this.createSpaceDust(500);
        this.createGalaxyArms(4);
        this.createSupernovas(3);
        this.createPulsars(8);
    }
    
    createStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 5 + 2;
            const brightness = Math.random() * 0.7 + 0.3;
            
            star.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, ${brightness});
                --duration: ${duration}s;
            `;
            
            this.galaxyContainer.appendChild(star);
            this.stars.push(star);
        }
    }
    
    createPlanets(count) {
        const planetTypes = ['🪐', '🌍', '🌕', '🌑', '🔥', '💧', '🌫️'];
        
        for (let i = 0; i < count; i++) {
            const planet = document.createElement('div');
            planet.className = 'celestial-body';
            
            const size = Math.random() * 100 + 50;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 20 + 10;
            const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
            
            planet.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                font-size: ${size}px;
                --duration: ${duration}s;
            `;
            
            planet.innerHTML = type;
            this.galaxyContainer.appendChild(planet);
            this.planets.push(planet);
        }
    }
    
    createNebulas(count) {
        const nebulaColors = [
            'rgba(138, 43, 226, 0.1)',  // بنفش
            'rgba(255, 105, 180, 0.1)', // صورتی
            'rgba(30, 144, 255, 0.1)',  // آبی
            'rgba(50, 205, 50, 0.1)',   // سبز
            'rgba(255, 165, 0, 0.1)'    // نارنجی
        ];
        
        for (let i = 0; i < count; i++) {
            const nebula = document.createElement('div');
            nebula.className = 'nebula';
            
            const size = Math.random() * 500 + 200;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 30 + 15;
            const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
            
            nebula.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: ${color};
                --duration: ${duration}s;
            `;
            
            this.galaxyContainer.appendChild(nebula);
            this.nebulas.push(nebula);
        }
    }
    
    createAsteroids(count) {
        for (let i = 0; i < count; i++) {
            const asteroid = document.createElement('div');
            asteroid.className = 'celestial-body';
            
            const size = Math.random() * 20 + 5;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 15 + 5;
            
            asteroid.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: linear-gradient(45deg, #666, #999);
                --duration: ${duration}s;
            `;
            
            this.galaxyContainer.appendChild(asteroid);
        }
    }
    
    createBlackHoles(count) {
        for (let i = 0; i < count; i++) {
            const blackHole = document.createElement('div');
            blackHole.className = 'celestial-body';
            
            const size = Math.random() * 80 + 40;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            
            blackHole.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, #000 0%, #222 70%, #444 100%);
                box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
                animation: blackHoleSpin 20s linear infinite;
            `;
            
            this.galaxyContainer.appendChild(blackHole);
        }
    }
    
    createComets(count) {
        for (let i = 0; i < count; i++) {
            const comet = document.createElement('div');
            comet.className = 'celestial-body';
            
            const size = Math.random() * 15 + 5;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 25 + 10;
            
            comet.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: linear-gradient(90deg, #fff 0%, #aaf 50%, transparent 100%);
                --duration: ${duration}s;
                animation: cometMove ${duration}s linear infinite;
            `;
            
            this.galaxyContainer.appendChild(comet);
        }
    }
    
    createSpaceDust(count) {
        for (let i = 0; i < count; i++) {
            const dust = document.createElement('div');
            dust.className = 'star';
            
            const size = Math.random() * 2 + 0.5;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 10 + 5;
            
            dust.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(200, 200, 255, 0.3);
                --duration: ${duration}s;
            `;
            
            this.galaxyContainer.appendChild(dust);
        }
    }
    
    createGalaxyArms(count) {
        for (let i = 0; i < count; i++) {
            const arm = document.createElement('div');
            arm.className = 'nebula';
            
            const width = Math.random() * 300 + 200;
            const height = Math.random() * 800 + 400;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            const rotation = Math.random() * 360;
            
            arm.style.cssText = `
                width: ${width}px;
                height: ${height}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(ellipse, rgba(100, 100, 255, 0.1) 0%, transparent 70%);
                transform: rotate(${rotation}deg);
                border-radius: 50% / 10%;
            `;
            
            this.galaxyContainer.appendChild(arm);
        }
    }
    
    createSupernovas(count) {
        for (let i = 0; i < count; i++) {
            const supernova = document.createElement('div');
            supernova.className = 'celestial-body';
            
            const size = Math.random() * 150 + 100;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            
            supernova.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, #ff0 0%, #f90 30%, #f00 70%, transparent 100%);
                animation: supernovaPulse 5s ease-in-out infinite;
                filter: blur(5px);
            `;
            
            this.galaxyContainer.appendChild(supernova);
        }
    }
    
    createPulsars(count) {
        for (let i = 0; i < count; i++) {
            const pulsar = document.createElement('div');
            pulsar.className = 'star';
            
            const size = Math.random() * 8 + 4;
            const x = Math.random() * 500000;
            const y = Math.random() * window.innerHeight;
            
            pulsar.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: #fff;
                animation: pulsarFlash 0.5s ease-in-out infinite;
                box-shadow: 0 0 20px #0ff;
            `;
            
            this.galaxyContainer.appendChild(pulsar);
        }
    }
              }
