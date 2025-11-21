// m1.js - سیستم اصلی بازی
console.log('m1.js loaded - سیستم اصلی بازی');

// سیستم صوتی
let backgroundMusic = null;
let spaceshipSound = null;
let coinSound = null;

function playBackgroundMusic() {
    try {
        backgroundMusic = new Audio('m2.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        backgroundMusic.play().catch(e => {
            console.log('موسیقی پس‌زمینه پخش نشد:', e);
        });
    } catch (error) {
        console.log('خطا در پخش موسیقی:', error);
    }
}

function playSpaceshipSound() {
    try {
        spaceshipSound = new Audio('m2.mp3');
        spaceshipSound.volume = 0.2;
        spaceshipSound.play().catch(e => {
            console.log('صدای سفینه پخش نشد:', e);
        });
    } catch (error) {
        console.log('خطا در پخش صدای سفینه:', error);
    }
}

function playCoinSound() {
    try {
        coinSound = new Audio('m1.mp3');
        coinSound.volume = 0.4;
        coinSound.play().catch(e => {
            console.log('صدای سکه پخش نشد:', e);
        });
    } catch (error) {
        console.log('خطا در پخش صدای سکه:', error);
    }
}

function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

// تغییر تم صفحه اصلی
function changeTheme(theme) {
    const mainScreen = document.getElementById('mainScreen');
    
    if (theme === 'theme1') {
        mainScreen.style.background = 'linear-gradient(135deg, #000428, #004e92)';
    } else if (theme === 'theme2') {
        mainScreen.style.background = 'linear-gradient(135deg, #330033, #660066)';
    }
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// سیستم دوربین پویا
function updateCamera() {
    if (!player || !gameRunning) return;
    
    const cameraContainer = document.getElementById('cameraContainer');
    const worldWidth = 4000;
    const worldHeight = 4000;
    
    const cameraX = -player.x + (window.innerWidth / 2);
    const cameraY = -player.y + (window.innerHeight / 2);
    
    const maxX = 0;
    const minX = -(worldWidth - window.innerWidth);
    const maxY = 0;
    const minY = -(worldHeight - window.innerHeight);
    
    const limitedX = Math.max(minX, Math.min(maxX, cameraX));
    const limitedY = Math.max(minY, Math.min(maxY, cameraY));
    
    cameraContainer.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
}

// به‌روزرسانی نقشه
function updateMiniMap() {
    const mapView = document.getElementById('mapView');
    if (!mapView) return;
    
    mapView.innerHTML = '';
    
    // بازیکن
    const mapPlayer = document.createElement('div');
    mapPlayer.className = 'map-player';
    mapPlayer.style.left = (player.x / 4000 * 100) + '%';
    mapPlayer.style.top = (player.y / 4000 * 100) + '%';
    mapView.appendChild(mapPlayer);
    
    // سکه‌ها
    coins.forEach(coin => {
        if (!coin.collected) {
            const mapCoin = document.createElement('div');
            mapCoin.className = 'map-coin';
            mapCoin.style.left = (coin.x / 4000 * 100) + '%';
            mapCoin.style.top = (coin.y / 4000 * 100) + '%';
            mapView.appendChild(mapCoin);
        }
    });
    
    // دشمنان
    enemies.forEach(enemy => {
        const mapEnemy = document.createElement('div');
        mapEnemy.className = 'map-enemy';
        mapEnemy.style.left = (enemy.x / 4000 * 100) + '%';
        mapEnemy.style.top = (enemy.y / 4000 * 100) + '%';
        mapView.appendChild(mapEnemy);
    });
}

// ذخیره‌سازی داده‌ها
function saveGameData() {
    try {
        const gameData = {
            highScore: Math.max(score, parseInt(localStorage.getItem('highScore')) || 0),
            highLevel: Math.max(currentLevel, parseInt(localStorage.getItem('highLevel')) || 1),
            totalCoins: (parseInt(localStorage.getItem('totalCoins')) || 0) + coinsCollected,
            achievements: JSON.parse(localStorage.getItem('achievements')) || {}
        };
        
        checkAchievements();
        
        localStorage.setItem('highScore', gameData.highScore);
        localStorage.setItem('highLevel', gameData.highLevel);
        localStorage.setItem('totalCoins', gameData.totalCoins);
        localStorage.setItem('achievements', JSON.stringify(gameData.achievements));
        
        updateMainScreenStats();
    } catch (error) {
        console.log('خطا در ذخیره‌سازی داده‌ها:', error);
    }
}

function loadGameData() {
    try {
        const highScore = localStorage.getItem('highScore') || 0;
        const highLevel = localStorage.getItem('highLevel') || 1;
        const totalCoins = localStorage.getItem('totalCoins') || 0;
        const achievements = JSON.parse(localStorage.getItem('achievements')) || {};
        
        document.getElementById('highScore').textContent = highScore;
        document.getElementById('highLevel').textContent = highLevel;
        document.getElementById('totalCoinsCollected').textContent = totalCoins;
        
        const achievedCount = Object.values(achievements).filter(a => a.achieved).length;
        document.getElementById('achievementsCount').textContent = `${achievedCount}/100`;
        
        return achievements;
    } catch (error) {
        console.log('خطا در بارگذاری داده‌ها:', error);
        return {};
    }
}

function updateMainScreenStats() {
    loadGameData();
}

function showAchievements() {
    try {
        const achievementsModal = document.getElementById('achievementsModal');
        const achievementGrid = document.getElementById('achievementGrid');
        const achievements = loadGameData();
        
        achievementGrid.innerHTML = '';
        
        for (let i = 1; i <= 100; i++) {
            const achievementItem = document.createElement('div');
            achievementItem.className = `achievement-item ${achievements[i] ? '' : 'locked'}`;
            
            const achievementIcon = document.createElement('div');
            achievementIcon.className = 'achievement-icon';
            achievementIcon.innerHTML = achievements[i] ? '🌏' : '🔒';
            
            const achievementText = document.createElement('div');
            const coinsRequired = 100000 + (i-1) * 1000000;
            achievementText.textContent = achievements[i] ? `مدال ${i}` : `${coinsRequired.toLocaleString()} سکه`;
            
            achievementItem.appendChild(achievementIcon);
            achievementItem.appendChild(achievementText);
            achievementGrid.appendChild(achievementItem);
        }
        
        achievementsModal.classList.remove('hidden');
    } catch (error) {
        console.log('خطا در نمایش مدال‌ها:', error);
        alert('خطا در نمایش مدال‌ها');
    }
}

function closeAchievements() {
    document.getElementById('achievementsModal').classList.add('hidden');
}

function showInstructions() {
    document.getElementById('instructionsModal').classList.remove('hidden');
}

function closeInstructions() {
    document.getElementById('instructionsModal').classList.add('hidden');
}

function showManagement() {
    document.getElementById('managementModal').classList.remove('hidden');
}

function closeManagement() {
    document.getElementById('managementModal').classList.add('hidden');
}

function checkAchievements() {
    try {
        const achievements = JSON.parse(localStorage.getItem('achievements')) || {};
        
        if (currentLevel > 0 && !achievements[currentLevel]) {
            achievements[currentLevel] = { achieved: true, date: new Date().toLocaleDateString('fa-IR') };
        }
        
        const scoreMilestones = [100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
        scoreMilestones.forEach(milestone => {
            if (score >= milestone && !achievements[`score_${milestone}`]) {
                achievements[`score_${milestone}`] = { achieved: true, date: new Date().toLocaleDateString('fa-IR') };
            }
        });
        
        localStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (error) {
        console.log('خطا در بررسی مدال‌ها:', error);
    }
}

function showFuelMessage(message) {
    const fuelIndicator = document.querySelector('.fuel-indicator');
    const originalText = fuelIndicator.textContent;
    
    fuelIndicator.textContent = message;
    fuelIndicator.style.background = 'linear-gradient(45deg, #00ff88, #00ccff)';
    
    setTimeout(() => {
        fuelIndicator.textContent = originalText;
        fuelIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
    }, 3000);
}

// عناصر اصلی
const mainScreen = document.getElementById('mainScreen');
const gameScreen = document.getElementById('gameScreen');
const fuelIndicator = document.querySelector('.fuel-indicator');
const playerIndicator = document.getElementById('playerIndicator');
const bombButton = document.getElementById('bombButton');
const bombTimer = document.getElementById('bombTimer');
const safeTimeIndicator = document.getElementById('safeTimeIndicator');
const nextLevelButton = document.getElementById('nextLevelButton');
const completedLevelElement = document.getElementById('completedLevel');
const levelComplete = document.getElementById('levelComplete');
const loadingScreen = document.getElementById('loadingScreen');
const loadingText = document.getElementById('loadingText');
const touchControls = document.querySelector('.touch-controls');
const joystick = document.querySelector('.joystick');
const joystickHandle = document.querySelector('.joystick-handle');
const gameElements = document.getElementById('gameElements');
const miniMap = document.getElementById('miniMap');

// تنظیم اندازه بازی
function setupGame() {
    gameScreen.style.width = window.innerWidth + 'px';
    gameScreen.style.height = window.innerHeight + 'px';
}

// متغیرهای بازی
let player = { x: 2000, y: 2000, size: 80, rotation: 0, fuel: 100 };
let playerElement = null;
let coins = [];
let enemies = [];
let coinTrail = [];
let playerPath = [];
let score = 0;
let coinsCollected = 0;
let currentLevel = 1;
let totalCoinsNeeded = 120;
let gameRunning = false;
let bombCooldown = 0;
let bombAvailable = false;
let safeTime = 0;
let isSafeTime = false;
let fuelConsumption = 0;
let enemySpawnTimer = 0;
let currentEnemyGroup = 0;
let currentStageData = null;
let lastFrameTime = 0;

// متغیرهای کنترل لمسی
let isTouching = false;
let touchStartX = 0;
let touchStartY = 0;
let joystickBaseX = 0;
let joystickBaseY = 0;
let joystickRadius = 40;

// شروع بازی
function startGame() {
    console.log('شروع بازی...');
    showLoadingScreen(() => {
        mainScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        fuelIndicator.classList.remove('hidden');
        bombButton.classList.remove('hidden');
        bombTimer.classList.remove('hidden');
        miniMap.classList.remove('hidden');
        
        // نمایش کنترل لمسی در موبایل
        if (window.innerWidth <= 480) {
            touchControls.classList.remove('hidden');
            setupTouchControls();
        }
        
        setupGame();
        
        // شروع پخش موسیقی پس‌زمینه
        playBackgroundMusic();
        
        playerIndicator.classList.remove('hidden');
        setTimeout(() => {
            playerIndicator.classList.add('hidden');
        }, 3000);
        
        createPlayer();
        
        score = 0;
        coinsCollected = 0;
        currentLevel = parseInt(localStorage.getItem('highLevel')) || 1;
        bombCooldown = 0;
        bombAvailable = true;
        safeTime = 0;
        isSafeTime = false;
        playerPath = [];
        player.fuel = 100;
        fuelConsumption = 0;
        enemySpawnTimer = 0;
        currentEnemyGroup = 0;
        bombButton.disabled = false;
        safeTimeIndicator.classList.add('hidden');
        
        updateFuel();
        createCoins();
        createEnemies();
        
        gameRunning = true;
        lastFrameTime = performance.now();
        gameLoop();
        
        console.log('بازی شروع شد! تعداد سکه‌ها:', coins.length, 'تعداد دشمنان:', enemies.length);
    });
}

// تنظیم کنترل لمسی
function setupTouchControls() {
    try {
        const joystickRect = joystick.getBoundingClientRect();
        joystickBaseX = joystickRect.left + joystickRect.width / 2;
        joystickBaseY = joystickRect.top + joystickRect.height / 2;
        
        joystick.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
    } catch (error) {
        console.log('خطا در تنظیم کنترل لمسی:', error);
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    isTouching = true;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchMove(e) {
    if (!isTouching || !gameRunning) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - joystickBaseX;
    const deltaY = touch.clientY - joystickBaseY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);
    
    const limitedDistance = Math.min(distance, joystickRadius);
    
    const newX = limitedDistance * Math.cos(angle);
    const newY = limitedDistance * Math.sin(angle);
    
    joystickHandle.style.transform = `translate(${newX}px, ${newY}px)`;
    
    if (distance > 10) {
        const speed = 12;
        player.x += Math.cos(angle) * speed;
        player.y += Math.sin(angle) * speed;
        
        player.x = Math.max(player.size/2, Math.min(4000 - player.size/2, player.x));
        player.y = Math.max(player.size/2, Math.min(4000 - player.size/2, player.y));
        
        updatePlayerPosition();
        updateCamera();
    }
}

function handleTouchEnd(e) {
    isTouching = false;
    joystickHandle.style.transform = 'translate(0, 0)';
}

function showLoadingScreen(callback) {
    loadingScreen.classList.remove('hidden');
    loadingText.textContent = "در حال بارگذاری جهان بی‌نهایت...";
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        loadingText.textContent = `در حال بارگذاری جهان بی‌نهایت... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                callback();
            }, 500);
        }
    }, 100);
}

function showLevelLoading(callback) {
    loadingScreen.classList.remove('hidden');
    loadingText.textContent = `در حال رفتن به مرحله ${currentLevel + 1}...`;
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        callback();
    }, 2000);
}

function createPlayer() {
    if (playerElement) {
        playerElement.remove();
    }
    
    playerElement = document.createElement('div');
    playerElement.className = 'player pulse';
    playerElement.innerHTML = '🛸';
    playerElement.style.position = 'absolute';
    
    player.rotation = 0;
    
    playerElement.style.left = (player.x - player.size/2) + 'px';
    playerElement.style.top = (player.y - player.size/2) + 'px';
    
    gameElements.appendChild(playerElement);
    updateCamera();
    
    console.log('بازیکن ایجاد شد در موقعیت:', player.x, player.y);
}

function createCoins() {
    document.querySelectorAll('.coin').forEach(coin => coin.remove());
    document.querySelectorAll('.coin-number').forEach(number => number.remove());
    coins = [];
    
    // ایجاد 120 سکه با انواع مختلف
    for (let i = 0; i < totalCoinsNeeded; i++) {
        createSingleCoin(i);
    }
    
    console.log('سکه‌ها ایجاد شدند. تعداد:', coins.length);
}

function createSingleCoin(index) {
    const coinElement = document.createElement('div');
    const numberElement = document.createElement('div');
    numberElement.className = 'coin-number';
    
    // تعیین نوع سکه بر اساس index
    const coinType = index % 3;
    let coinEmoji, hitsRequired, fontSize;
    
    switch(coinType) {
        case 0: // نوع اول - سیاره
            coinEmoji = '🪐';
            hitsRequired = currentLevel + 1;
            fontSize = '35px';
            coinElement.className = 'coin type1';
            break;
        case 1: // نوع دوم - یخ
            coinEmoji = '🧊';
            hitsRequired = currentLevel + 2;
            fontSize = '40px';
            coinElement.className = 'coin type2';
            break;
        case 2: // نوع سوم - الماس
            coinEmoji = '💎';
            hitsRequired = currentLevel + 3;
            fontSize = '30px';
            coinElement.className = 'coin type3';
            break;
    }
    
    coinElement.innerHTML = coinEmoji;
    coinElement.style.fontSize = fontSize;
    coinElement.style.position = 'absolute';
    
    numberElement.textContent = hitsRequired;
    numberElement.style.position = 'absolute';
    
    // موقعیت‌های تصادفی در محدوده بازی
    const x = Math.random() * 3800 + 100;
    const y = Math.random() * 3800 + 100;
    
    coinElement.style.left = (x - 22) + 'px';
    coinElement.style.top = (y - 22) + 'px';
    numberElement.style.left = (x - 8) + 'px';
    numberElement.style.top = (y - 8) + 'px';
    
    gameElements.appendChild(coinElement);
    gameElements.appendChild(numberElement);
    
    coins.push({
        element: coinElement,
        numberElement: numberElement,
        x: x,
        y: y,
        collected: false,
        hitsNeeded: hitsRequired,
        currentHits: 0,
        type: coinType
    });
}

// ایجاد 70 دشمن با دو نوع مختلف
function createEnemies() {
    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
    enemies = [];
    
    for (let i = 0; i < 70; i++) {
        createSingleEnemy(i);
    }
    
    console.log('دشمنان ایجاد شدند. تعداد:', enemies.length);
}

function createSingleEnemy(index) {
    const enemyElement = document.createElement('div');
    enemyElement.style.position = 'absolute';
    
    // تعیین نوع دشمن
    const enemyType = index % 2;
    let enemyEmoji, enemyClass, speed;
    
    if (enemyType === 0) {
        enemyEmoji = '🌋';
        enemyClass = 'enemy type1';
        speed = 1 + currentLevel * 0.1 + Math.random() * 0.3;
    } else {
        enemyEmoji = '☄️';
        enemyClass = 'enemy type2';
        speed = 1.5 + currentLevel * 0.15 + Math.random() * 0.4;
    }
    
    enemyElement.className = enemyClass;
    enemyElement.innerHTML = enemyEmoji;
    
    // موقعیت‌های تصادفی در محدوده بازی
    const x = Math.random() * 3800 + 100;
    const y = Math.random() * 3800 + 100;
    
    const targetX = Math.random() * 3800 + 100;
    const targetY = Math.random() * 3800 + 100;
    
    enemyElement.style.left = x + 'px';
    enemyElement.style.top = y + 'px';
    
    gameElements.appendChild(enemyElement);
    
    enemies.push({
        element: enemyElement,
        x: x,
        y: y,
        targetX: targetX,
        targetY: targetY,
        speed: speed,
        type: enemyType
    });
}

// حلقه اصلی بازی
function gameLoop(currentTime) {
    if (!gameRunning) return;
    
    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < 16) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastFrameTime = currentTime;
    
    playerPath.push({ x: player.x, y: player.y });
    if (playerPath.length > 30) {
        playerPath.shift();
    }
    
    updateBombTimer();
    updateSafeTime();
    updateFuelConsumption();
    
    if (!isSafeTime) {
        updateEnemies();
    }
    
    updateCoinTrail();
    checkCollisions();
    updateCamera();
    updateMiniMap();
    
    requestAnimationFrame(gameLoop);
}

function updateBombTimer() {
    if (bombCooldown > 0) {
        bombCooldown--;
        bombTimer.textContent = `بمب: ${Math.ceil(bombCooldown/60)}s`;
        bombButton.disabled = true;
    } else {
        bombTimer.textContent = `بمب: آماده!`;
        bombButton.disabled = false;
        bombAvailable = true;
    }
}

function updateSafeTime() {
    if (isSafeTime && safeTime > 0) {
        safeTime--;
        safeTimeIndicator.textContent = `زمان امن: ${Math.ceil(safeTime/60)}s`;
        
        if (safeTime <= 0) {
            isSafeTime = false;
            safeTimeIndicator.classList.add('hidden');
        }
    }
}

function updateFuelConsumption() {
    fuelConsumption++;
    if (fuelConsumption >= 60) {
        fuelConsumption = 0;
        player.fuel = Math.max(0, player.fuel - 0.5);
        updateFuel();
        
        if (player.fuel <= 0) {
            gameOver();
        }
    }
}

function updateFuel() {
    fuelIndicator.textContent = `⛽ سوخت: ${Math.round(player.fuel)}%`;
    
    if (player.fuel < 20) {
        fuelIndicator.style.background = 'linear-gradient(45deg, #ff4444, #cc0000)';
    } else if (player.fuel < 50) {
        fuelIndicator.style.background = 'linear-gradient(45deg, #ffaa00, #ff5500)';
    } else {
        fuelIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        const dx = enemy.targetX - enemy.x;
        const dy = enemy.targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
            
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.top = enemy.y + 'px';
        }
        
        if (distance < 50) {
            enemy.targetX = Math.random() * 3800 + 100;
            enemy.targetY = Math.random() * 3800 + 100;
        }
    });
}

function useBomb() {
    if (!bombAvailable) return;
    
    bombAvailable = false;
    bombCooldown = 10 * 60;
    
    isSafeTime = true;
    safeTime = 5 * 60;
    safeTimeIndicator.classList.remove('hidden');
    
    createBombExplosion(player.x, player.y);
    
    enemies.forEach(enemy => {
        const distance = Math.sqrt(
            Math.pow(player.x - enemy.x, 2) + 
            Math.pow(player.y - enemy.y, 2)
        );
        
        if (distance < 300) {
            createEnemyExplosion(enemy.x, enemy.y);
            enemy.element.remove();
        }
    });
    
    enemies = enemies.filter(enemy => enemy.element.parentNode);
}

function createBombExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.innerHTML = '💥';
    explosion.style.position = 'absolute';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    explosion.style.fontSize = '50px';
    explosion.style.zIndex = '6';
    
    gameElements.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 800);
}

function createEnemyExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.left = x + 'px';
    explosion.style.top = y + 'px';
    explosion.style.width = '0px';
    explosion.style.height = '0px';
    explosion.style.borderRadius = '50%';
    explosion.style.background = 'radial-gradient(circle, #ff3300, #ff5500, transparent)';
    explosion.style.opacity = '0.8';
    explosion.style.zIndex = '3';
    explosion.style.transition = 'all 0.5s';
    
    gameElements.appendChild(explosion);
    
    setTimeout(() => {
        explosion.style.width = '120px';
        explosion.style.height = '120px';
        explosion.style.marginLeft = '-60px';
        explosion.style.marginTop = '-60px';
        explosion.style.opacity = '0';
        
        setTimeout(() => {
            explosion.remove();
        }, 500);
    }, 10);
}

function updateCoinTrail() {
    document.querySelectorAll('.coin-trail').forEach(trail => trail.remove());
    
    const trailLength = Math.min(coinTrail.length, 10);
    
    for (let i = 0; i < trailLength; i++) {
        const trailElement = document.createElement('div');
        trailElement.className = 'coin-trail';
        trailElement.innerHTML = '🌏';
        trailElement.style.position = 'absolute';
        
        let targetIndex = Math.max(0, playerPath.length - (i + 1) * 3);
        if (targetIndex >= playerPath.length) targetIndex = playerPath.length - 1;
        
        const targetPos = playerPath[targetIndex];
        if (!targetPos) continue;
        
        const trailX = targetPos.x;
        const trailY = targetPos.y;
        
        trailElement.style.left = (trailX - 15) + 'px';
        trailElement.style.top = (trailY - 15) + 'px';
        trailElement.style.opacity = 1 - (i / trailLength) * 0.8;
        trailElement.style.transform = `scale(${1 - (i / trailLength) * 0.5})`;
        trailElement.style.zIndex = '2';
        
        gameElements.appendChild(trailElement);
    }
}

function updatePlayerPosition() {
    if (!playerElement) return;
    
    playerElement.style.left = (player.x - player.size/2) + 'px';
    playerElement.style.top = (player.y - player.size/2) + 'px';
    
    if (playerPath.length > 1) {
        const currentPos = playerPath[playerPath.length - 1];
        const prevPos = playerPath[playerPath.length - 2];
        const dx = currentPos.x - prevPos.x;
        const dy = currentPos.y - prevPos.y;
        player.rotation = Math.atan2(dy, dx) * 180 / Math.PI;
        playerElement.style.transform = `rotate(${player.rotation}deg)`;
    }
}

function checkCollisions() {
    // برخورد با سکه‌ها
    coins.forEach((coin, index) => {
        if (!coin.collected) {
            const distance = Math.sqrt(
                Math.pow(player.x - coin.x, 2) + 
                Math.pow(player.y - coin.y, 2)
            );
            
            if (distance < player.size/2 + 22) {
                coin.currentHits++;
                coin.numberElement.textContent = coin.hitsNeeded - coin.currentHits;
                
                createHitEffect(coin.x, coin.y);
                
                if (coin.currentHits >= coin.hitsNeeded) {
                    coin.collected = true;
                    coinsCollected++;
                    
                    // امتیاز بر اساس نوع سکه
                    let points = 0;
                    switch(coin.type) {
                        case 0: points = 10 * currentLevel; break;
                        case 1: points = 15 * currentLevel; break;
                        case 2: points = 20 * currentLevel; break;
                    }
                    score += points;
                    
                    player.fuel = Math.min(100, player.fuel + 10);
                    updateFuel();
                    
                    coin.element.style.display = 'none';
                    coin.numberElement.style.display = 'none';
                    
                    // پخش صدای جمع‌آوری سکه
                    playCoinSound();
                    
                    createCollectEffect(coin.x, coin.y, coin.type);
                    
                    coinTrail.push({
                        x: coin.x,
                        y: coin.y
                    });
                    
                    if (coinsCollected >= totalCoinsNeeded) {
                        completeLevel();
                    }
                }
            }
        }
    });
    
    // برخورد با آتشفشان‌ها
    if (!isSafeTime) {
        enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(player.x - enemy.x, 2) + 
                Math.pow(player.y - enemy.y, 2)
            );
            
            if (distance < 50) {
                restartCurrentLevel();
            }
        });
    }
}

function createHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.style.position = 'absolute';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    effect.style.fontSize = '20px';
    effect.style.color = '#00ff88';
    effect.style.opacity = '1';
    effect.style.transition = 'all 0.5s';
    effect.style.zIndex = '5';
    effect.innerHTML = '✨';
    effect.style.transform = 'scale(1)';
    
    gameElements.appendChild(effect);
    
    setTimeout(() => {
        effect.style.transform = 'scale(1.5)';
        effect.style.opacity = '0';
        
        setTimeout(() => {
            effect.remove();
        }, 500);
    }, 10);
}

function createCollectEffect(x, y, coinType) {
    const effect = document.createElement('div');
    effect.className = 'coin-collect-effect';
    
    switch(coinType) {
        case 0: effect.innerHTML = '⭐'; break;
        case 1: effect.innerHTML = '❄️'; break;
        case 2: effect.innerHTML = '💎'; break;
    }
    
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    
    gameElements.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 800);
}

function completeLevel() {
    gameRunning = false;
    
    saveGameData();
    
    createLevelCompleteEffects();
    
    setTimeout(() => {
        completedLevelElement.textContent = currentLevel;
        levelComplete.classList.add('show');
    }, 1000);
}

function createLevelCompleteEffects() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const effect = document.createElement('div');
            effect.className = 'level-complete-effect';
            effect.innerHTML = '✨';
            effect.style.left = (player.x + Math.random() * 100 - 50) + 'px';
            effect.style.top = (player.y + Math.random() * 100 - 50) + 'px';
            gameElements.appendChild(effect);
            
            setTimeout(() => {
                effect.remove();
            }, 1500);
        }, i * 300);
    }
}

// شروع مجدد همان مرحله
function restartCurrentLevel() {
    gameRunning = false;
    
    showFuelMessage("💥 برخورد! شروع مجدد مرحله...");
    
    setTimeout(() => {
        coinsCollected = 0;
        bombCooldown = 0;
        bombAvailable = true;
        safeTime = 0;
        isSafeTime = false;
        playerPath = [];
        player.fuel = 100;
        fuelConsumption = 0;
        bombButton.disabled = false;
        safeTimeIndicator.classList.add('hidden');
        
        player.x = 2000;
        player.y = 2000;
        
        updatePlayerPosition();
        updateCamera();
        
        updateFuel();
        createCoins();
        createEnemies();
        
        gameRunning = true;
        lastFrameTime = performance.now();
        gameLoop();
    }, 1500);
}

function gameOver() {
    gameRunning = false;
    stopBackgroundMusic();
    
    saveGameData();
    
    showFuelMessage("⛽ سوخت تمام شد! بازی تمام شد");
    
    setTimeout(() => {
        mainScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        fuelIndicator.classList.add('hidden');
        bombButton.classList.add('hidden');
        bombTimer.classList.add('hidden');
        safeTimeIndicator.classList.add('hidden');
        touchControls.classList.add('hidden');
        miniMap.classList.add('hidden');
        levelComplete.classList.remove('show');
        
        document.querySelectorAll('.coin, .enemy, .coin-trail, .coin-number').forEach(el => el.remove());
        if (playerElement) {
            playerElement.remove();
            playerElement = null;
        }
        
        coins = [];
        enemies = [];
        coinTrail = [];
        playerPath = [];
        
        updateMainScreenStats();
    }, 2000);
}

nextLevelButton.addEventListener('click', () => {
    levelComplete.classList.remove('show');
    
    showLevelLoading(() => {
        currentLevel++;
        coinsCollected = 0;
        bombCooldown = 0;
        bombAvailable = true;
        safeTime = 0;
        isSafeTime = false;
        playerPath = [];
        player.fuel = 100;
        updateFuel();
        
        document.querySelectorAll('.coin, .coin-trail, .coin-number').forEach(el => el.remove());
        enemies.forEach(enemy => enemy.element.remove());
        enemies = [];
        
        createCoins();
        createEnemies();
        
        gameRunning = true;
        lastFrameTime = performance.now();
        gameLoop();
    });
});

// کنترل‌ها
document.addEventListener('mousemove', (e) => {
    if (gameRunning && !isTouching) {
        const cameraContainer = document.getElementById('cameraContainer');
        const rect = cameraContainer.getBoundingClientRect();
        
        player.x = e.clientX - rect.left;
        player.y = e.clientY - rect.top;
        
        // محدود کردن حرکت به محدوده بازی
        player.x = Math.max(player.size/2, Math.min(4000 - player.size/2, player.x));
        player.y = Math.max(player.size/2, Math.min(4000 - player.size/2, player.y));
        
        // پخش صدای سفینه هنگام حرکت
        playSpaceshipSound();
        
        updatePlayerPosition();
        updateCamera();
    }
});

document.addEventListener('touchmove', (e) => {
    if (gameRunning && !isTouching) {
        e.preventDefault();
        const touch = e.touches[0];
        
        const cameraContainer = document.getElementById('cameraContainer');
        const rect = cameraContainer.getBoundingClientRect();
        
        player.x = touch.clientX - rect.left;
        player.y = touch.clientY - rect.top;
        
        // محدود کردن حرکت به محدوده بازی
        player.x = Math.max(player.size/2, Math.min(4000 - player.size/2, player.x));
        player.y = Math.max(player.size/2, Math.min(4000 - player.size/2, player.y));
        
        // پخش صدای سفینه هنگام حرکت
        playSpaceshipSound();
        
        updatePlayerPosition();
        updateCamera();
    }
}, { passive: false });

// راه‌اندازی اولیه
window.addEventListener('load', () => {
    setupGame();
    loadGameData();
    console.log('بازی بارگذاری شد و آماده است');
});

window.addEventListener('resize', setupGame);

// سیستم گرافیک سه‌بعدی ساده
class Simple3DSystem {
    constructor() {
        this.isInitialized = false;
    }
    
    init() {
        console.log('سیستم سه‌بعدی ساده راه‌اندازی شد');
        this.isInitialized = true;
    }
    
    createSpacecraft(x, y) {
        // ایجاد یک المان ساده برای سفینه
        const spacecraft = document.createElement('div');
        spacecraft.innerHTML = '🚀';
        spacecraft.style.position = 'absolute';
        spacecraft.style.left = x + 'px';
        spacecraft.style.top = y + 'px';
        spacecraft.style.fontSize = '60px';
        spacecraft.style.zIndex = '10';
        spacecraft.style.filter = 'drop-shadow(0 0 10px #00aaff) drop-shadow(0 0 20px #00aaff)';
        
        return spacecraft;
    }
    
    createEnemy(type, x, y) {
        const enemy = document.createElement('div');
        let emoji, size;
        
        switch(type) {
            case 'volcano':
                emoji = '🌋';
                size = '45px';
                break;
            case 'meteor':
                emoji = '☄️';
                size = '35px';
                break;
            default:
                emoji = '👾';
                size = '40px';
        }
        
        enemy.innerHTML = emoji;
        enemy.style.position = 'absolute';
        enemy.style.left = x + 'px';
        enemy.style.top = y + 'px';
        enemy.style.fontSize = size;
        enemy.style.zIndex = '5';
        enemy.style.filter = 'drop-shadow(0 0 8px #ff3300) drop-shadow(0 0 12px #ff3300)';
        
        return enemy;
    }
}

// ایجاد نمونه از سیستم سه‌بعدی
const simple3D = new Simple3DSystem();
