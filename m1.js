// m1.js - سیستم گرافیک سه‌بعدی سفینه و دشمنان با Babylon.js

// سیستم صوتی - موسیقی پس‌زمینه
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
    
    // به‌روزرسانی وضعیت فعال دکمه‌ها
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
    
    // پاک کردن نقشه قبلی
    mapView.innerHTML = '';
    
    // اضافه کردن بازیکن به نقشه (آبی)
    const mapPlayer = document.createElement('div');
    mapPlayer.className = 'map-player';
    mapPlayer.style.left = (player.x / 4000 * 100) + '%';
    mapPlayer.style.top = (player.y / 4000 * 100) + '%';
    mapView.appendChild(mapPlayer);
    
    // اضافه کردن سکه‌ها به نقشه (سبز)
    coins.forEach(coin => {
        if (!coin.collected) {
            const mapCoin = document.createElement('div');
            mapCoin.className = 'map-coin';
            mapCoin.style.left = (coin.x / 4000 * 100) + '%';
            mapCoin.style.top = (coin.y / 4000 * 100) + '%';
            mapView.appendChild(mapCoin);
        }
    });
    
    // اضافه کردن دشمنان به نقشه (قرمز)
    enemies.forEach(enemy => {
        const mapEnemy = document.createElement('div');
        mapEnemy.className = 'map-enemy';
        mapEnemy.style.left = (enemy.x / 4000 * 100) + '%';
        mapEnemy.style.top = (enemy.y / 4000 * 100) + '%';
        mapView.appendChild(mapEnemy);
    });
}

// ذخیره‌سازی داده‌ها در localStorage
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
let totalCoinsNeeded = 120; // 120 سکه
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
}

function createCoins() {
    document.querySelectorAll('.coin').forEach(coin => coin.remove());
    document.querySelectorAll('.coin-number').forEach(number => number.remove());
    coins = [];
    
    // ایجاد 120 سکه با انواع مختلف
    for (let i = 0; i < totalCoinsNeeded; i++) {
        createSingleCoin(i);
    }
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
            hitsRequired = currentLevel + 1; // آسان‌تر
            fontSize = '35px';
            coinElement.className = 'coin type1';
            break;
        case 1: // نوع دوم - یخ
            coinEmoji = '🧊';
            hitsRequired = currentLevel + 2; // متوسط
            fontSize = '40px';
            coinElement.className = 'coin type2';
            break;
        case 2: // نوع سوم - الماس
            coinEmoji = '💎';
            hitsRequired = currentLevel + 3; // سخت‌تر
            fontSize = '30px';
            coinElement.className = 'coin type3';
            break;
    }
    
    coinElement.innerHTML = coinEmoji;
    coinElement.style.fontSize = fontSize;
    coinElement.style.position = 'absolute';
    
    numberElement.textContent = hitsRequired;
    numberElement.style.position = 'absolute';
    
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
        speed = 1.5 + currentLevel * 0.15 + Math.random() * 0.4; // سریع‌تر
    }
    
    enemyElement.className = enemyClass;
    enemyElement.innerHTML = enemyEmoji;
    
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
    updateMiniMap(); // به‌روزرسانی نقشه
    
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
            
            if (distance < 5) {
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
    
    // افکت مختلف بر اساس نوع سکه
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
        
        // پخش صدای سفینه هنگام حرکت
        playSpaceshipSound();
        
        updatePlayerPosition();
        updateCamera();
    }
}, { passive: false });

window.addEventListener('load', () => {
    setupGame();
    loadGameData();
});
window.addEventListener('resize', setupGame);

// ============ بخش Babylon.js برای گرافیک سه‌بعدی ============

// کلاس سیستم گرافیک سه‌بعدی
class Spacecraft3D {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.canvas = null;
        this.playerMesh = null;
        this.enemyMeshes = [];
        this.coinMeshes = [];
        this.isInitialized = false;
    }

    // مقداردهی اولیه موتور گرافیکی
    async init(canvasElement) {
        try {
            // بارگذاری Babylon.js
            if (typeof BABYLON === 'undefined') {
                await this.loadBabylonJS();
            }

            this.canvas = canvasElement;
            this.engine = new BABYLON.Engine(this.canvas, true);
            this.scene = new BABYLON.Scene(this.engine);
            
            // تنظیم دوربین
            this.setupCamera();
            
            // تنظیم نورپردازی
            this.setupLighting();
            
            // ایجاد سفینه بازیکن
            this.createPlayerSpacecraft();
            
            // رندر حلقه
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
            
            // مدیریت تغییر اندازه پنجره
            window.addEventListener('resize', () => {
                this.engine.resize();
            });
            
            this.isInitialized = true;
            console.log('سیستم گرافیک سه‌بعدی با موفقیت راه‌اندازی شد');
            
        } catch (error) {
            console.error('خطا در راه‌اندازی سیستم گرافیک:', error);
            this.fallbackTo2D();
        }
    }

    // بارگذاری Babylon.js
    loadBabylonJS() {
        return new Promise((resolve, reject) => {
            if (typeof BABYLON !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.babylonjs.com/babylon.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // تنظیم دوربین
    setupCamera() {
        // دوربین اصلی
        this.camera = new BABYLON.ArcRotateCamera(
            "mainCamera",
            -Math.PI / 2,
            Math.PI / 2.5,
            50,
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );
        
        this.camera.attachControl(this.canvas, true);
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 200;
        
        // دوربین مینی‌مپ
        this.miniMapCamera = new BABYLON.FreeCamera(
            "miniMapCamera",
            new BABYLON.Vector3(0, 100, 0),
            this.scene
        );
        this.miniMapCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        this.miniMapCamera.orthoTop = 50;
        this.miniMapCamera.orthoBottom = -50;
        this.miniMapCamera.orthoLeft = -50;
        this.miniMapCamera.orthoRight = 50;
        this.miniMapCamera.rotation.x = Math.PI / 2;
    }

    // تنظیم نورپردازی
    setupLighting() {
        // نور محیطی
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        
        // نور جهت‌دار
        const directionalLight = new BABYLON.DirectionalLight(
            "directionalLight",
            new BABYLON.Vector3(0, -1, 1),
            this.scene
        );
        directionalLight.intensity = 0.8;
        directionalLight.position = new BABYLON.Vector3(0, 50, 0);
        
        // نور نقطه‌ای برای جلوه‌های ویژه
        this.spotLight = new BABYLON.SpotLight(
            "spotLight",
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(0, -1, 0),
            Math.PI / 3,
            2,
            this.scene
        );
        this.spotLight.intensity = 0;
    }

    // ایجاد سفینه بازیکن
    createPlayerSpacecraft() {
        // بدنه اصلی سفینه
        const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", {
            height: 8,
            diameterTop: 0,
            diameterBottom: 4,
            tessellation: 32
        }, this.scene);
        
        // کابین خلبان
        const cockpit = BABYLON.MeshBuilder.CreateSphere("cockpit", {
            diameter: 3,
            segments: 16
        }, this.scene);
        cockpit.position.y = 1.5;
        
        // بال‌ها
        const wingLeft = BABYLON.MeshBuilder.CreateBox("wingLeft", {
            width: 8,
            height: 0.5,
            depth: 3
        }, this.scene);
        wingLeft.position.x = -3;
        wingLeft.position.y = -1;
        
        const wingRight = BABYLON.MeshBuilder.CreateBox("wingRight", {
            width: 8,
            height: 0.5,
            depth: 3
        }, this.scene);
        wingRight.position.x = 3;
        wingRight.position.y = -1;
        
        // موتورها
        this.createEngine(fuselage, -2, -3);
        this.createEngine(fuselage, 2, -3);
        
        // ترکیب تمام بخش‌ها
        this.playerMesh = BABYLON.Mesh.MergeMeshes([
            fuselage, cockpit, wingLeft, wingRight
        ], true, false, null, false, true);
        
        this.playerMesh.name = "playerSpacecraft";
        
        // مواد و بافت
        const playerMaterial = new BABYLON.StandardMaterial("playerMaterial", this.scene);
        playerMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.5, 1.0);
        playerMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 1.0);
        playerMaterial.emissiveColor = new BABYLON.Color3(0, 0.2, 0.5);
        
        this.playerMesh.material = playerMaterial;
        
        // جلوه‌های ذره‌ای برای موتور
        this.createEngineParticles();
        
        // انیمیشن شناور
        this.createFloatAnimation();
    }

    // ایجاد موتور سفینه
    createEngine(parent, x, z) {
        const engine = BABYLON.MeshBuilder.CreateCylinder("engine", {
            height: 2,
            diameter: 1,
            tessellation: 16
        }, this.scene);
        
        engine.position.x = x;
        engine.position.z = z;
        engine.position.y = -2;
        
        const engineMaterial = new BABYLON.StandardMaterial("engineMaterial", this.scene);
        engineMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        engineMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        
        engine.material = engineMaterial;
        engine.parent = parent;
        
        return engine;
    }

    // ایجاد جلوه‌های ذره‌ای موتور
    createEngineParticles() {
        const particleSystem = new BABYLON.ParticleSystem("engineParticles", 2000, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        particleSystem.emitter = this.playerMesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, -2, -0.5);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, -2, 0.5);
        
        particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;
        
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.8;
        
        particleSystem.emitRate = 1000;
        
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        particleSystem.gravity = new BABYLON.Vector3(0, -5, 0);
        
        particleSystem.direction1 = new BABYLON.Vector3(-1, -3, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, -5, 1);
        
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        
        particleSystem.minEmitPower = 5;
        particleSystem.maxEmitPower = 10;
        particleSystem.updateSpeed = 0.005;
        
        particleSystem.start();
        
        this.engineParticles = particleSystem;
    }

    // ایجاد انیمیشن شناور
    createFloatAnimation() {
        const floatAnimation = new BABYLON.Animation(
            "floatAnimation",
            "position.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 30, value: 0.5 });
        keys.push({ frame: 60, value: 0 });
        
        floatAnimation.setKeys(keys);
        
        this.playerMesh.animations = [];
        this.playerMesh.animations.push(floatAnimation);
        
        this.scene.beginAnimation(this.playerMesh, 0, 60, true);
    }

    // ایجاد دشمن سه‌بعدی
    createEnemy(type, position) {
        let enemyMesh;
        
        switch(type) {
            case 'volcano':
                enemyMesh = this.createVolcanoEnemy(position);
                break;
            case 'meteor':
                enemyMesh = this.createMeteorEnemy(position);
                break;
            case 'alien':
                enemyMesh = this.createAlienEnemy(position);
                break;
            default:
                enemyMesh = this.createVolcanoEnemy(position);
        }
        
        this.enemyMeshes.push({
            mesh: enemyMesh,
            type: type,
            position: position,
            health: 100
        });
        
        return enemyMesh;
    }

    // ایجاد دشمن آتشفشانی
    createVolcanoEnemy(position) {
        const base = BABYLON.MeshBuilder.CreateCylinder("volcanoBase", {
            diameterTop: 3,
            diameterBottom: 6,
            height: 4,
            tessellation: 32
        }, this.scene);
        
        const crater = BABYLON.MeshBuilder.CreateSphere("volcanoCrater", {
            diameter: 2,
            segments: 16
        }, this.scene);
        crater.position.y = 2;
        crater.scaling.x = 1.5;
        crater.scaling.z = 1.5;
        
        const volcanoMesh = BABYLON.Mesh.MergeMeshes([base, crater], true, false, null, false, true);
        volcanoMesh.position = position;
        
        const volcanoMaterial = new BABYLON.StandardMaterial("volcanoMaterial", this.scene);
        volcanoMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        volcanoMaterial.specularColor = new BABYLON.Color3(0.2, 0.1, 0.05);
        volcanoMaterial.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0);
        
        volcanoMesh.material = volcanoMaterial;
        
        // جلوه‌های ذره‌ای برای آتشفشان
        this.createVolcanoParticles(volcanoMesh);
        
        return volcanoMesh;
    }

    // ایجاد جلوه‌های ذره‌ای آتشفشان
    createVolcanoParticles(volcanoMesh) {
        const particleSystem = new BABYLON.ParticleSystem("volcanoParticles", 1000, this.scene);
        
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs.com/assets/Flare.png", this.scene);
        particleSystem.emitter = volcanoMesh;
        particleSystem.minEmitBox = new BABYLON.Vector3(0, 2, 0);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0, 2, 0);
        
        particleSystem.color1 = new BABYLON.Color4(1, 0.3, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0.6, 0, 1.0);
        particleSystem.colorDead = new BABYLON.Color4(0.2, 0, 0, 0.0);
        
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        
        particleSystem.minLifeTime = 0.5;
        particleSystem.maxLifeTime = 1.5;
        
        particleSystem.emitRate = 200;
        
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        
        particleSystem.direction1 = new BABYLON.Vector3(-0.5, 3, -0.5);
        particleSystem.direction2 = new BABYLON.Vector3(0.5, 5, 0.5);
        
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        
        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 4;
        particleSystem.updateSpeed = 0.01;
        
        particleSystem.start();
        
        return particleSystem;
    }

    // ایجاد دشمن شهاب‌سنگ
    createMeteorEnemy(position) {
        const meteor = BABYLON.MeshBuilder.CreateSphere("meteor", {
            diameter: 4,
            segments: 8
        }, this.scene);
        meteor.position = position;
        
        // ایجاد سطح ناهموار شهاب‌سنگ
        const positions = meteor.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        for (let i = 0; i < positions.length; i += 3) {
            const noise = Math.random() * 0.5;
            positions[i] *= 1 + noise;
            positions[i + 1] *= 1 + noise;
            positions[i + 2] *= 1 + noise;
        }
        meteor.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        
        const meteorMaterial = new BABYLON.StandardMaterial("meteorMaterial", this.scene);
        meteorMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        meteorMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        meteorMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0);
        
        meteor.material = meteorMaterial;
        
        // ایجاد دنباله برای شهاب‌سنگ
        this.createMeteorTrail(meteor);
        
        return meteor;
    }

    // ایجاد دنباله شهاب‌سنگ
    createMeteorTrail(meteorMesh) {
        const trail = new BABYLON.TrailMesh("meteorTrail", meteorMesh, this.scene, 0.5, 100, true);
        
        const trailMaterial = new BABYLON.StandardMaterial("trailMaterial", this.scene);
        trailMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        trailMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.2, 0);
        trailMaterial.alpha = 0.6;
        
        trail.material = trailMaterial;
        
        return trail;
    }

    // ایجاد دشمن بیگانه
    createAlienEnemy(position) {
        const body = BABYLON.MeshBuilder.CreateSphere("alienBody", {
            diameter: 3,
            segments: 16
        }, this.scene);
        
        const head = BABYLON.MeshBuilder.CreateSphere("alienHead", {
            diameter: 1.5,
            segments: 12
        }, this.scene);
        head.position.y = 1.5;
        
        const eye1 = BABYLON.MeshBuilder.CreateSphere("alienEye1", {
            diameter: 0.5,
            segments: 8
        }, this.scene);
        eye1.position.x = 0.5;
        eye1.position.y = 1.7;
        eye1.position.z = 0.7;
        
        const eye2 = BABYLON.MeshBuilder.CreateSphere("alienEye2", {
            diameter: 0.5,
            segments: 8
        }, this.scene);
        eye2.position.x = -0.5;
        eye2.position.y = 1.7;
        eye2.position.z = 0.7;
        
        const alienMesh = BABYLON.Mesh.MergeMeshes([body, head, eye1, eye2], true, false, null, false, true);
        alienMesh.position = position;
        
        const alienMaterial = new BABYLON.StandardMaterial("alienMaterial", this.scene);
        alienMaterial.diffuseColor = new BABYLON.Color3(0, 0.8, 0);
        alienMaterial.specularColor = new BABYLON.Color3(0.2, 1, 0.2);
        alienMaterial.emissiveColor = new BABYLON.Color3(0, 0.3, 0);
        
        alienMesh.material = alienMaterial;
        
        // مواد چشم‌ها
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.scene);
        eyeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        eyeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        eye1.material = eyeMaterial;
        eye2.material = eyeMaterial;
        
        return alienMesh;
    }

    // ایجاد سکه سه‌بعدی
    createCoin(type, position) {
        let coinMesh;
        
        switch(type) {
            case 1: // سیاره
                coinMesh = this.createPlanetCoin(position);
                break;
            case 2: // یخ
                coinMesh = this.createIceCoin(position);
                break;
            case 3: // الماس
                coinMesh = this.createDiamondCoin(position);
                break;
            default:
                coinMesh = this.createPlanetCoin(position);
        }
        
        this.coinMeshes.push({
            mesh: coinMesh,
            type: type,
            position: position,
            collected: false
        });
        
        return coinMesh;
    }

    // ایجاد سکه سیاره
    createPlanetCoin(position) {
        const planet = BABYLON.MeshBuilder.CreateSphere("planetCoin", {
            diameter: 2,
            segments: 32
        }, this.scene);
        planet.position = position;
        
        const planetMaterial = new BABYLON.StandardMaterial("planetMaterial", this.scene);
        planetMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
        planetMaterial.specularColor = new BABYLON.Color3(0.5, 0.7, 1.0);
        
        // ایجاد بافت سیاره
        planetMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/3ZQ7Z9C.png", this.scene);
        
        planet.material = planetMaterial;
        
        // انیمیشن چرخش
        this.createRotationAnimation(planet);
        
        // هاله نور
        this.createGlowEffect(planet, new BABYLON.Color3(0, 0.5, 1));
        
        return planet;
    }

    // ایجاد سکه یخ
    createIceCoin(position) {
        const ice = BABYLON.MeshBuilder.CreateSphere("iceCoin", {
            diameter: 2.5,
            segments: 16
        }, this.scene);
        ice.position = position;
        
        const iceMaterial = new BABYLON.StandardMaterial("iceMaterial", this.scene);
        iceMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.9, 1.0);
        iceMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
        iceMaterial.alpha = 0.8;
        iceMaterial.reflectionTexture = new BABYLON.CubeTexture("https://assets.babylonjs.com/textures/skybox/TropicalSunnyDay", this.scene);
        
        ice.material = iceMaterial;
        
        // انیمیشن چرخش
        this.createRotationAnimation(ice);
        
        // جلوه درخشش
        this.createGlowEffect(ice, new BABYLON.Color3(0.5, 0.8, 1));
        
        return ice;
    }

    // ایجاد سکه الماس
    createDiamondCoin(position) {
        const diamond = BABYLON.MeshBuilder.CreateCylinder("diamondCoin", {
            height: 3,
            diameterTop: 0,
            diameterBottom: 2,
            tessellation: 4
        }, this.scene);
        diamond.position = position;
        diamond.rotation.x = Math.PI;
        
        const diamondMaterial = new BABYLON.StandardMaterial("diamondMaterial", this.scene);
        diamondMaterial.diffuseColor = new BABYLON.Color3(1, 0.4, 1);
        diamondMaterial.specularColor = new BABYLON.Color3(1, 0.8, 1);
        diamondMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0.3);
        
        diamond.material = diamondMaterial;
        
        // انیمیشن چرخش
        this.createRotationAnimation(diamond);
        
        // جلوه درخشش
        this.createGlowEffect(diamond, new BABYLON.Color3(1, 0, 1));
        
        return diamond;
    }

    // ایجاد انیمیشن چرخش
    createRotationAnimation(mesh) {
        const rotationAnimation = new BABYLON.Animation(
            "rotationAnimation",
            "rotation.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [];
        keys.push({ frame: 0, value: 0 });
        keys.push({ frame: 60, value: 2 * Math.PI });
        
        rotationAnimation.setKeys(keys);
        
        mesh.animations = [];
        mesh.animations.push(rotationAnimation);
        
        this.scene.beginAnimation(mesh, 0, 60, true);
    }

    // ایجاد جلوه درخشش
    createGlowEffect(mesh, color) {
        const glowLayer = new BABYLON.GlowLayer("glow", this.scene);
        glowLayer.intensity = 0.5;
        glowLayer.referenceMeshToUseItsOwnMaterial(mesh);
    }

    // به‌روزرسانی موقعیت سفینه
    updatePlayerPosition(x, y, z) {
        if (this.playerMesh) {
            this.playerMesh.position.x = x;
            this.playerMesh.position.y = y;
            this.playerMesh.position.z = z || 0;
            
            // به‌روزرسانی نور نقطه‌ای
            this.spotLight.position = this.playerMesh.position;
        }
    }

    // به‌روزرسانی چرخش سفینه
    updatePlayerRotation(rotation) {
        if (this.playerMesh) {
            this.playerMesh.rotation.y = rotation;
        }
    }

    // به‌روزرسانی موقعیت دشمن
    updateEnemyPosition(index, x, y, z) {
        if (this.enemyMeshes[index]) {
            this.enemyMeshes[index].mesh.position.x = x;
            this.enemyMeshes[index].mesh.position.y = y;
            this.enemyMeshes[index].mesh.position.z = z || 0;
        }
    }

    // به‌روزرسانی موقعیت سکه
    updateCoinPosition(index, x, y, z) {
        if (this.coinMeshes[index]) {
            this.coinMeshes[index].mesh.position.x = x;
            this.coinMeshes[index].mesh.position.y = y;
            this.coinMeshes[index].mesh.position.z = z || 0;
        }
    }

    // حذف دشمن
    removeEnemy(index) {
        if (this.enemyMeshes[index]) {
            this.enemyMeshes[index].mesh.dispose();
            this.enemyMeshes.splice(index, 1);
        }
    }

    // حذف سکه
    removeCoin(index) {
        if (this.coinMeshes[index]) {
            this.coinMeshes[index].mesh.dispose();
            this.coinMeshes.splice(index, 1);
        }
    }

    // ایجاد انفجار
    createExplosion(position, scale = 1) {
        const explosion = BABYLON.MeshBuilder.CreateSphere("explosion", {
            diameter: 2 * scale,
            segments: 16
        }, this.scene);
        explosion.position = position;
        
        const explosionMaterial = new BABYLON.StandardMaterial("explosionMaterial", this.scene);
        explosionMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
        explosionMaterial.emissiveColor = new BABYLON.Color3(1, 0.3, 0);
        explosionMaterial.alpha = 0.8;
        
        explosion.material = explosionMaterial;
        
        // انیمیشن انفجار
        const scaleAnimation = new BABYLON.Animation(
            "explosionScale",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const scaleKeys = [];
        scaleKeys.push({ frame: 0, value: new BABYLON.Vector3(0.1, 0.1, 0.1) });
        scaleKeys.push({ frame: 15, value: new BABYLON.Vector3(3 * scale, 3 * scale, 3 * scale) });
        scaleKeys.push({ frame: 30, value: new BABYLON.Vector3(0.1, 0.1, 0.1) });
        
        scaleAnimation.setKeys(scaleKeys);
        
        const alphaAnimation = new BABYLON.Animation(
            "explosionAlpha",
            "material.alpha",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        
        const alphaKeys = [];
        alphaKeys.push({ frame: 0, value: 0 });
        alphaKeys.push({ frame: 10, value: 0.9 });
        alphaKeys.push({ frame: 30, value: 0 });
        
        alphaAnimation.setKeys(alphaKeys);
        
        explosion.animations = [scaleAnimation, alphaAnimation];
        
        this.scene.beginAnimation(explosion, 0, 30, false, () => {
            explosion.dispose();
        });
        
        return explosion;
    }

    // فعال کردن حالت اضطراری سفینه
    setEmergencyMode(active) {
        if (this.playerMesh && this.playerMesh.material) {
            if (active) {
                this.playerMesh.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
                this.engineParticles.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
                this.engineParticles.color2 = new BABYLON.Color4(1, 0.2, 0, 1.0);
            } else {
                this.playerMesh.material.emissiveColor = new BABYLON.Color3(0, 0.2, 0.5);
                this.engineParticles.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
                this.engineParticles.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
            }
        }
    }

    // پاک‌سازی حافظه
    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
        if (this.scene) {
            this.scene.dispose();
        }
    }

    // حالت بازگشت به دو بعدی در صورت خطا
    fallbackTo2D() {
        console.warn('سیستم سه‌بعدی غیرفعال شد. استفاده از حالت دو بعدی');
        this.isInitialized = false;
    }
}

// ایجاد نمونه از سیستم گرافیک سه‌بعدی
const spacecraft3D = new Spacecraft3D();

// تابع برای راه‌اندازی سیستم سه‌بعدی
function init3DGraphics() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas3D';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '4';
    
    document.getElementById('gameScreen').appendChild(canvas);
    
    spacecraft3D.init(canvas);
}

// راه‌اندازی سیستم سه‌بعدی پس از بارگذاری صفحه
window.addEventListener('load', () => {
    setTimeout(() => {
        init3DGraphics();
    }, 1000);
});
