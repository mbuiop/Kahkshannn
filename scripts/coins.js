// فایل سکه‌ها - مدیریت تولید و جمع‌آوری سکه‌ها

class Coins {
    constructor() {
        this.coins = [];
        this.collectedCoins = 0;
        this.coinTypes = ['🏆', '🥎', '⭐', '🌟', '💫', '🔶', '🔷', '💎'];
        
        this.init();
    }

    init() {
        console.log('💰 سیستم سکه‌ها راه‌اندازی شد');
    }

    // ایجاد سکه‌ها
    create() {
        this.clear(); // پاک کردن سکه‌های قبلی
        
        const coinCount = game.state.totalCoinsNeeded;
        
        for (let i = 0; i < coinCount; i++) {
            this.createCoin();
        }
        
        console.log(`💰 ${coinCount} سکه ایجاد شد`);
    }

    // ایجاد تک سکه
    createCoin() {
        const coinElement = document.createElement('div');
        coinElement.className = 'coin';
        coinElement.innerHTML = this.selectCoinType();
        
        const numberElement = document.createElement('div');
        numberElement.className = 'coin-number';
        const hitsRequired = this.calculateHitsRequired();
        numberElement.textContent = hitsRequired;
        
        // موقعیت تصادفی در فضای بازی
        const position = this.calculateSpawnPosition();
        
        coinElement.style.left = (position.x - 18) + 'px';
        coinElement.style.top = (position.y - 18) + 'px';
        numberElement.style.left = (position.x - 6) + 'px';
        numberElement.style.top = (position.y - 6) + 'px';
        
        // افزودن به صفحه
        document.getElementById('gameScreen').appendChild(coinElement);
        document.getElementById('gameScreen').appendChild(numberElement);
        
        const coin = {
            element: coinElement,
            numberElement: numberElement,
            x: position.x,
            y: position.y,
            type: coinElement.innerHTML,
            hitsNeeded: hitsRequired,
            currentHits: 0,
            collected: false,
            value: this.calculateCoinValue(),
            spawnTime: Date.now()
        };
        
        this.coins.push(coin);
        return coin;
    }

    // انتخاب نوع سکه
    selectCoinType() {
        const weights = [0.3, 0.25, 0.2, 0.1, 0.08, 0.04, 0.02, 0.01];
        let random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < this.coinTypes.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return this.coinTypes[i];
            }
        }
        
        return this.coinTypes[0];
    }

    // محاسبه تعداد ضربات مورد نیاز
    calculateHitsRequired() {
        const baseHits = 2;
        const levelBonus = Math.floor(game.state.level / 3);
        return baseHits + levelBonus;
    }

    // محاسبه موقعیت spawn
    calculateSpawnPosition() {
        const margin = 100;
        const attempts = 10;
        
        for (let i = 0; i < attempts; i++) {
            const x = Math.random() * (window.innerWidth * 1.5) - (window.innerWidth * 0.25);
            const y = Math.random() * (window.innerHeight * 1.5) - (window.innerHeight * 0.25);
            
            // بررسی فاصله از بازیکن
            const distanceToPlayer = Math.sqrt(
                Math.pow(x - game.player.x, 2) + 
                Math.pow(y - game.player.y, 2)
            );
            
            // بررسی فاصله از سکه‌های دیگر
            const distanceToOtherCoins = this.getMinDistanceToOtherCoins(x, y);
            
            if (distanceToPlayer > 300 && distanceToOtherCoins > 150) {
                return { x, y };
            }
        }
        
        // اگر موقعیت مناسب پیدا نشد، موقعیت تصادفی برگردان
        return {
            x: Math.random() * (window.innerWidth * 1.5) - (window.innerWidth * 0.25),
            y: Math.random() * (window.innerHeight * 1.5) - (window.innerHeight * 0.25)
        };
    }

    // محاسبه حداقل فاصله تا سکه‌های دیگر
    getMinDistanceToOtherCoins(x, y) {
        if (this.coins.length === 0) return Infinity;
        
        let minDistance = Infinity;
        this.coins.forEach(coin => {
            const distance = Math.sqrt(Math.pow(x - coin.x, 2) + Math.pow(y - coin.y, 2));
            minDistance = Math.min(minDistance, distance);
        });
        
        return minDistance;
    }

    // محاسبه ارزش سکه
    calculateCoinValue() {
        const baseValue = 10;
        const levelMultiplier = game.state.level;
        const typeBonus = this.getTypeBonus();
        
        return baseValue * levelMultiplier * typeBonus;
    }

    // دریافت امتیاز نوع سکه
    getTypeBonus() {
        const type = this.coins[this.coins.length - 1]?.type;
        const bonuses = {
            '🏆': 2.0, // طلایی
            '💎': 1.8, // الماس
            '🌟': 1.5, // ستاره درخشان
            '⭐': 1.3, // ستاره معمولی
            '🔶': 1.2, // نارنجی
            '🔷': 1.1, // آبی
            '💫': 1.0, // درخشان
            '🥎': 0.8  // معمولی
        };
        
        return bonuses[type] || 1.0;
    }

    // بررسی برخورد با سکه
    checkCollision(playerX, playerY, playerSize) {
        this.coins.forEach((coin, index) => {
            if (!coin.collected) {
                const distance = Math.sqrt(
                    Math.pow(playerX - coin.x, 2) + 
                    Math.pow(playerY - coin.y, 2)
                );
                
                if (distance < playerSize / 2 + 20) {
                    this.handleCollision(coin, index);
                }
            }
        });
    }

    // مدیریت برخورد
    handleCollision(coin, index) {
        coin.currentHits++;
        coin.numberElement.textContent = coin.hitsNeeded - coin.currentHits;
        
        // ایجاد افکت برخورد
        this.createHitEffect(coin.x, coin.y);
        
        if (coin.currentHits >= coin.hitsNeeded) {
            this.collectCoin(coin, index);
        } else {
            // پخش صدای برخورد
            audio.playSound('coinHit');
        }
    }

    // جمع‌آوری سکه
    collectCoin(coin, index) {
        coin.collected = true;
        this.collectedCoins++;
        
        // افزایش امتیاز
        game.state.score += coin.value;
        
        // افزایش سوخت
        game.state.fuel = Math.min(100, game.state.fuel + 8);
        
        // پخش صدا
        audio.playSound('coinCollect');
        
        // ایجاد افکت جمع‌آوری
        this.createCollectEffect(coin.x, coin.y, coin.type);
        
        // مخفی کردن سکه
        coin.element.style.display = 'none';
        coin.numberElement.style.display = 'none';
        
        // ایجاد سکه ویژه با احتمال
        if (Math.random() < 0.1) {
            this.createSpecialCoin(coin.x, coin.y);
        }
        
        console.log(`💰 سکه جمع‌آوری شد! امتیاز: +${coin.value}`);
    }

    // ایجاد افکت برخورد
    createHitEffect(x, y) {
        game.createParticle(x, y, '✨', '#00ff88', 30);
    }

    // ایجاد افکت جمع‌آوری
    createCollectEffect(x, y, coinType) {
        const effects = {
            '🏆': { emoji: '🏆', color: '#ffd700', count: 8 },
            '💎': { emoji: '💎', color: '#00ffff', count: 7 },
            '🌟': { emoji: '🌟', color: '#ffff00', count: 6 },
            '⭐': { emoji: '⭐', color: '#ffffff', count: 5 },
            '🔶': { emoji: '🔶', color: '#ff6b00', count: 4 },
            '🔷': { emoji: '🔷', color: '#0066ff', count: 4 },
            '💫': { emoji: '💫', color: '#ff00ff', count: 5 },
            '🥎': { emoji: '🥎', color: '#00ff88', count: 3 }
        };
        
        const effect = effects[coinType] || effects['🥎'];
        
        for (let i = 0; i < effect.count; i++) {
            setTimeout(() => {
                game.createParticle(x, y, effect.emoji, effect.color, 60);
            }, i * 50);
        }
    }

    // ایجاد سکه ویژه
    createSpecialCoin(x, y) {
        const specialCoins = [
            { emoji: '🚀', value: 50, hits: 1, color: '#ff4444' },
            { emoji: '💣', value: 40, hits: 1, color: '#ffaa00' },
            { emoji: '🛡️', value: 35, hits: 1, color: '#00aaff' },
            { emoji: '⚡', value: 45, hits: 1, color: '#ffff00' }
        ];
        
        const specialCoin = specialCoins[Math.floor(Math.random() * specialCoins.length)];
        
        const coinElement = document.createElement('div');
        coinElement.className = 'coin';
        coinElement.innerHTML = specialCoin.emoji;
        coinElement.style.filter = `drop-shadow(0 0 10px ${specialCoin.color}) drop-shadow(0 0 20px ${specialCoin.color})`;
        
        const numberElement = document.createElement('div');
        numberElement.className = 'coin-number';
        numberElement.textContent = specialCoin.hits;
        numberElement.style.borderColor = specialCoin.color;
        numberElement.style.boxShadow = `0 0 10px ${specialCoin.color}`;
        
        coinElement.style.left = (x - 22) + 'px';
        coinElement.style.top = (y - 22) + 'px';
        numberElement.style.left = (x - 8) + 'px';
        numberElement.style.top = (y - 8) + 'px';
        
        document.getElementById('gameScreen').appendChild(coinElement);
        document.getElementById('gameScreen').appendChild(numberElement);
        
        const coin = {
            element: coinElement,
            numberElement: numberElement,
            x: x,
            y: y,
            type: specialCoin.emoji,
            hitsNeeded: specialCoin.hits,
            currentHits: 0,
            collected: false,
            value: specialCoin.value,
            isSpecial: true,
            effect: this.getSpecialEffect(specialCoin.emoji)
        };
        
        this.coins.push(coin);
        
        // انیمیشن ویژه برای سکه خاص
        this.animateSpecialCoin(coin);
        
        console.log(`🎁 سکه ویژه ایجاد شد: ${specialCoin.emoji}`);
    }

    // دریافت اثر ویژه سکه
    getSpecialEffect(emoji) {
        const effects = {
            '🚀': 'speedBoost',
            '💣': 'instantBomb',
            '🛡️': 'invincibility',
            '⚡': 'doublePoints'
        };
        
        return effects[emoji];
    }

    // انیمیشن سکه ویژه
    animateSpecialCoin(coin) {
        let scale = 1;
        let direction = 0.02;
        
        const animate = () => {
            if (coin.collected) return;
            
            scale += direction;
            if (scale > 1.3 || scale < 0.9) {
                direction *= -1;
            }
            
            coin.element.style.transform = `scale(${scale})`;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // فعال کردن اثر سکه ویژه
    activateSpecialEffect(coin) {
        const effect = coin.effect;
        const duration = 10 * 60; // 10 ثانیه
        
        switch (effect) {
            case 'speedBoost':
                this.activateSpeedBoost(duration);
                break;
            case 'instantBomb':
                this.activateInstantBomb();
                break;
            case 'invincibility':
                this.activateInvincibility(duration);
                break;
            case 'doublePoints':
                this.activateDoublePoints(duration);
                break;
        }
        
        // نمایش پیغام اثر
        this.showEffectMessage(effect);
    }

    activateSpeedBoost(duration) {
        // افزایش سرعت بازیکن
        // این اثر می‌تواند در کنترل‌ها پیاده‌سازی شود
        console.log('⚡ اثر افزایش سرعت فعال شد');
    }

    activateInstantBomb() {
        // بمب فوری
        game.state.bombCooldown = 0;
        game.state.bombAvailable = true;
        console.log('💣 بمب فوری فعال شد');
    }

    activateInvincibility(duration) {
        // بی‌ضرری
        game.state.isSafeTime = true;
        game.state.safeTime = duration;
        console.log('🛡️ اثر بی‌ضرری فعال شد');
    }

    activateDoublePoints(duration) {
        // دوبرابر شدن امتیاز
        // این اثر می‌تواند در سیستم امتیاز پیاده‌سازی شود
        console.log('💰 اثر دوبرابر شدن امتیاز فعال شد');
    }

    // نمایش پیغام اثر
    showEffectMessage(effect) {
        const messages = {
            'speedBoost': '⚡ افزایش سرعت!',
            'instantBomb': '💣 بمب فوری!',
            'invincibility': '🛡️ بی‌ضرری!',
            'doublePoints': '💰 امتیاز دوبرابر!'
        };
        
        ui.showMessage(messages[effect], 'اثر ویژه فعال شد!');
    }

    // پاک کردن تمام سکه‌ها
    clear() {
        this.coins.forEach(coin => {
            coin.element.remove();
            coin.numberElement.remove();
        });
        this.coins = [];
        this.collectedCoins = 0;
    }

    // بازنشانی سکه‌ها
    reset() {
        this.coins.forEach(coin => {
            coin.element.style.display = 'block';
            coin.numberElement.style.display = 'block';
            coin.collected = false;
            coin.currentHits = 0;
            coin.numberElement.textContent = coin.hitsNeeded;
        });
        this.collectedCoins = 0;
    }

    // گرفتن لیست سکه‌ها
    getCoins() {
        return this.coins;
    }

    // گرفتن تعداد سکه‌های جمع
