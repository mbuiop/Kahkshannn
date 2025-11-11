// سیستم مدیریت سکه‌ها
class CoinSystem {
    constructor() {
        this.list = [];
        this.collectedCount = 0;
        this.coinTypes = ['🏆', '🥎', '⭐', '🌟', '💫', '🔶', '🔷', '💎'];
    }

    create(totalCoins, currentLevel) {
        this.list = [];
        this.collectedCount = 0;
        
        for (let i = 0; i < totalCoins; i++) {
            this.createCoin(currentLevel);
        }
    }

    createCoin(currentLevel) {
        const coinElement = document.createElement('div');
        coinElement.className = 'coin';
        coinElement.innerHTML = this.coinTypes[Math.floor(Math.random() * this.coinTypes.length)];
        
        const numberElement = document.createElement('div');
        numberElement.className = 'coin-number';
        
        // تعداد ضربات مورد نیاز بر اساس سطح
        const hitsRequired = Math.max(1, currentLevel - 1);
        numberElement.textContent = hitsRequired;
        
        // موقعیت تصادفی در محدوده بازی
        const x = Math.random() * (window.innerWidth * 2) - window.innerWidth/2;
        const y = Math.random() * (window.innerHeight * 2) - window.innerHeight/2;
        
        coinElement.style.left = (x - 15) + 'px';
        coinElement.style.top = (y - 15) + 'px';
        numberElement.style.left = (x - 5) + 'px';
        numberElement.style.top = (y - 5) + 'px';
        
        Game.gameElements.appendChild(coinElement);
        Game.gameElements.appendChild(numberElement);
        
        const coin = {
            element: coinElement,
            numberElement: numberElement,
            x: x,
            y: y,
            collected: false,
            hitsNeeded: hitsRequired,
            currentHits: 0,
            scale: 1,
            pulseDirection: 1
        };
        
        this.list.push(coin);
        this.animateCoin(coin);
    }

    animateCoin(coin) {
        // انیمیشن ضربان برای سکه
        const animate = () => {
            if (coin.collected || !Game.gameRunning) return;
            
            coin.scale += 0.01 * coin.pulseDirection;
            
            if (coin.scale >= 1.2) {
                coin.scale = 1.2;
                coin.pulseDirection = -1;
            } else if (coin.scale <= 0.8) {
                coin.scale = 0.8;
                coin.pulseDirection = 1;
            }
            
            coin.element.style.transform = `scale(${coin.scale})`;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    checkCollisions(player, onCollect) {
        this.list.forEach(coin => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(player.x - coin.x, 2) + 
                    Math.pow(player.y - coin.y, 2)
                );
                
                if (distance < player.size/2 + 15) {
                    this.hitCoin(coin, onCollect);
                }
            }
        });
    }

    hitCoin(coin, onCollect) {
        coin.currentHits++;
        coin.numberElement.textContent = coin.hitsNeeded - coin.currentHits;
        
        // افکت بصری هنگام برخورد
        coin.element.style.animation = 'coinHit 0.3s ease-in-out';
        setTimeout(() => {
            coin.element.style.animation = '';
        }, 300);
        
        if (coin.currentHits >= coin.hitsNeeded) {
            this.collectCoin(coin, onCollect);
        }
        
        // پخش صدا
        if (Audio.enabled) {
            Audio.play('coinHit');
        }
    }

    collectCoin(coin, onCollect) {
        coin.collected = true;
        this.collectedCount++;
        
        // افکت جمع‌آوری سکه
        coin.element.style.animation = 'coinCollect 0.5s ease-out forwards';
        coin.numberElement.style.display = 'none';
        
        setTimeout(() => {
            if (coin.element.parentNode) {
                coin.element.remove();
                coin.numberElement.remove();
            }
        }, 500);
        
        // فراخوانی تابع جمع‌آوری
        onCollect(coin);
        
        // پخش صدا
        if (Audio.enabled) {
            Audio.play('coinCollect');
        }
    }

    // ایجاد سکه ویژه
    createSpecialCoin(x, y, type = 'bonus') {
        const specialCoin = document.createElement('div');
        specialCoin.className = 'coin special';
        specialCoin.innerHTML = '💎';
        specialCoin.style.left = (x - 20) + 'px';
        specialCoin.style.top = (y - 20) + 'px';
        specialCoin.style.fontSize = '40px';
        specialCoin.style.animation = 'specialCoinGlow 2s infinite alternate';
        
        Game.gameElements.appendChild(specialCoin);
        
        const coin = {
            element: specialCoin,
            x: x,
            y: y,
            collected: false,
            special: true,
            type: type
        };
        
        this.list.push(coin);
        
        // حرکت سکه ویژه به سمت بازیکن
        this.attractToPlayer(coin);
    }

    attractToPlayer(coin) {
        const attract = () => {
            if (coin.collected || !Game.gameRunning) return;
            
            const dx = Game.player.x - coin.x;
            const dy = Game.player.y - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) { // جذب وقتی نزدیک شد
                coin.x += (dx / distance) * 3;
                coin.y += (dy / distance) * 3;
                
                coin.element.style.left = (coin.x - 20) + 'px';
                coin.element.style.top = (coin.y - 20) + 'px';
            }
            
            if (distance < 30) {
                this.collectSpecialCoin(coin);
            } else {
                requestAnimationFrame(attract);
            }
        };
        
        attract();
    }

    collectSpecialCoin(coin) {
        coin.collected = true;
        
        // پاداش ویژه
        switch (coin.type) {
            case 'bonus':
                Game.score += 50;
                Game.player.fuel = Math.min(100, Game.player.fuel + 20);
                break;
            case 'shield':
                Enemies.safeTime = 10 * 60;
                Enemies.isSafeTime = true;
                break;
            case 'speed':
                Game.player.speed = 12;
                setTimeout(() => {
                    Game.player.speed = 8;
                }, 5000);
                break;
        }
        
        coin.element.style.animation = 'specialCoinCollect 0.8s ease-out forwards';
        
        setTimeout(() => {
            if (coin.element.parentNode) {
                coin.element.remove();
            }
        }, 800);
        
        // پخش صدا
        if (Audio.enabled) {
            Audio.play('specialCoin');
        }
    }

    reset() {
        this.collectedCount = 0;
        this.list.forEach(coin => {
            if (!coin.collected) {
                coin.currentHits = 0;
                coin.numberElement.textContent = coin.hitsNeeded;
                coin.element.style.display = 'block';
                coin.numberElement.style.display = 'block';
                coin.element.style.animation = '';
            }
        });
    }

    clear() {
        this.list.forEach(coin => {
            if (coin.element && coin.element.parentNode) {
                coin.element.remove();
            }
            if (coin.numberElement && coin.numberElement.parentNode) {
                coin.numberElement.remove();
            }
        });
        this.list = [];
        this.collectedCount = 0;
    }

    // گرفتن تعداد سکه‌های باقیمانده
    getRemainingCount() {
        return this.list.filter(coin => !coin.collected).length;
    }

    // گرفتن موقعیت سکه‌ها برای AI
    getCoinPositions() {
        return this.list
            .filter(coin => !coin.collected)
            .map(coin => ({ x: coin.x, y: coin.y }));
    }
}

// ایجاد نمونه سکه‌ها
const Coins = new CoinSystem();
