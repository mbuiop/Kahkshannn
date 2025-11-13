// animations.js - مدیریت انیمیشن‌ها و افکت‌های بصری

class AnimationManager {
    constructor() {
        this.particles = [];
        this.activeAnimations = new Set();
        this.threeJSScene = null;
        this.camera = null;
        this.renderer = null;
        this.is3DEnabled = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.preloadAssets();
    }

    setupEventListeners() {
        // مدیریت رزولوشن و تغییر سایز
        window.addEventListener('resize', () => this.handleResize());
    }

    preloadAssets() {
        // پیش‌بارگذاری تصاویر و منابع
        this.preloadImages();
        this.preloadSounds();
    }

    preloadImages() {
        const images = [
            'particle.png',
            'explosion.png',
            'reward.png'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = `assets/images/${src}`;
        });
    }

    preloadSounds() {
        // پیش‌بارگذاری صداها
    }

    showMatchAnimation(firstIndex, secondIndex, points) {
        this.createParticleEffect(firstIndex);
        this.createParticleEffect(secondIndex);
        this.showPointsAnimation(points);
        this.showFloatingRewards();
        
        if (window.GameEngine) {
            const comboCount = window.GameEngine.comboCount;
            if (comboCount >= 3) {
                this.showComboEffect(comboCount);
            }
        }
    }

    createParticleEffect(cellIndex) {
        const cell = document.querySelector(`.cell[data-index="${cellIndex}"]`);
        if (!cell) return;
        
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            this.createParticle(centerX, centerY);
        }
    }

    createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${this.getRandomColor()};
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            left: ${x}px;
            top: ${y}px;
        `;
        
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 1000 + 500;
        
        const animation = particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            { 
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => {
            particle.remove();
        };
        
        this.particles.push(particle);
    }

    showPointsAnimation(points) {
        const pointsEl = document.createElement('div');
        pointsEl.className = 'points-animation';
        pointsEl.textContent = `+${points}`;
        pointsEl.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: gold;
            font-size: 2rem;
            font-weight: bold;
            z-index: 1000;
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
            pointer-events: none;
        `;
        
        document.body.appendChild(pointsEl);
        
        const animation = pointsEl.animate([
            { 
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 1
            },
            { 
                transform: 'translate(-50%, -100px) scale(1.5)',
                opacity: 0
            }
        ], {
            duration: 1500,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => {
            pointsEl.remove();
        };
    }

    showFloatingRewards() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createFloatingReward();
            }, i * 200);
        }
    }

    createFloatingReward() {
        const rewards = ['🎁', '💰', '⭐', '💎', '👑'];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        const rewardEl = document.createElement('div');
        rewardEl.textContent = reward;
        rewardEl.style.cssText = `
            position: fixed;
            left: ${Math.random() * 80 + 10}%;
            top: 100%;
            font-size: 2rem;
            z-index: 1000;
            pointer-events: none;
            filter: drop-shadow(0 0 5px gold);
        `;
        
        document.body.appendChild(rewardEl);
        
        const animation = rewardEl.animate([
            { 
                transform: 'translateY(0) rotate(0deg)',
                opacity: 1
            },
            { 
                transform: 'translateY(-100vh) rotate(360deg)',
                opacity: 0
            }
        ], {
            duration: 2000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => {
            rewardEl.remove();
        };
    }

    showComboEffect(combo) {
        const comboEl = document.createElement('div');
        comboEl.className = 'combo-effect';
        comboEl.textContent = `COMBO x${combo}!`;
        comboEl.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 3rem;
            font-weight: bold;
            z-index: 1000;
            text-shadow: 0 0 20px rgba(255,255,255,0.5);
            pointer-events: none;
        `;
        
        document.body.appendChild(comboEl);
        
        const animation = comboEl.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0.5)',
                opacity: 0
            },
            { 
                transform: 'translate(-50%, -50%) scale(1.2)',
                opacity: 1
            },
            { 
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 0
            }
        ], {
            duration: 2000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => {
            comboEl.remove();
        };
    }

    showLevelCompleteAnimation(score, level) {
        this.createConfettiEffect();
        this.showLevelCompleteMessage(score, level);
    }

    createConfettiEffect() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#45b7d1', '#96ceb4', '#feca57'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors);
            }, i * 30);
        }
    }

    createConfettiPiece(colors) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}%;
            border-radius: 2px;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { 
                transform: 'translateY(0) rotate(0deg)',
                opacity: 1
            },
            { 
                transform: `translateY(100vh) rotate(${Math.random() * 720}deg)`,
                opacity: 0
            }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
        
        animation.onfinish = () => {
            confetti.remove();
        };
    }

    showLevelCompleteMessage(score, level) {
        const messageEl = document.createElement('div');
        messageEl.className = 'level-complete-message';
        messageEl.innerHTML = `
            <h2>تبریک! 🎉</h2>
            <p>مرحله ${level} کامل شد!</p>
            <p>امتیاز: ${score}</p>
        `;
        messageEl.style.cssText = `
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            z-index: 1001;
            border: 2px solid gold;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(messageEl);
        
        const animation = messageEl.animate([
            { 
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 0
            },
            { 
                transform: 'translate(-50%, -50%) scale(1)',
                opacity: 1
            }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
        });
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6B5B95', '#88D8B0', '#FFAA85'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    handleResize() {
        if (this.is3DEnabled && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // متدهای Three.js برای گرافیک سه‌بعدی
    init3DGraphics() {
        if (!window.THREE) {
            console.warn('Three.js loaded نشده است');
            return;
        }

        this.is3DEnabled = true;
        this.setupThreeJSScene();
    }

    setupThreeJSScene() {
        // ایجاد صحنه Three.js
        this.threeJSScene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '-1';
        this.renderer.domElement.style.pointerEvents = 'none';
        
        document.body.appendChild(this.renderer.domElement);
        
        this.camera.position.z = 5;
        
        // اضافه کردن نور
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.threeJSScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.threeJSScene.add(directionalLight);
        
        this.animate3DScene();
    }

    animate3DScene() {
        if (!this.is3DEnabled) return;
        
        requestAnimationFrame(() => this.animate3DScene());
        
        // انیمیشن صحنه سه‌بعدی
        if (this.threeJSScene && this.renderer) {
            this.renderer.render(this.threeJSScene, this.camera);
        }
    }

    create3DFruit(fruitType, position) {
        if (!this.is3DEnabled) return null;
        
        let geometry, material;
        
        switch(fruitType) {
            case '🍎':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
                break;
            case '🍌':
                geometry = new THREE.CylinderGeometry(0.5, 0.3, 2, 32);
                material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
                break;
            // انواع دیگر میوه‌ها...
            default:
                geometry = new THREE.SphereGeometry(1, 32, 32);
                material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        }
        
        const fruit = new THREE.Mesh(geometry, material);
        fruit.position.set(position.x, position.y, position.z);
        
        this.threeJSScene.add(fruit);
        return fruit;
    }

    cleanup() {
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
        
        if (this.renderer && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}

// ایجاد نمونه از مدیر انیمیشن
window.AnimationManager = new AnimationManager();
