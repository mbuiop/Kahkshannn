// game-engine.js - موتور اصلی بازی

class GameEngine {
    constructor() {
        this.board = [];
        this.selectedCells = [];
        this.score = 0;
        this.level = 1;
        this.connectionsMade = 0;
        this.connectionsNeeded = 10;
        this.isDrawing = false;
        this.gameState = 'idle'; // idle, playing, paused, completed, gameOver
        this.timer = 60;
        this.timerInterval = null;
        this.comboCount = 0;
        this.playerStreak = 0;
        this.powerUps = [];
        this.obstacles = [];
        this.specialFruits = [];
        
        this.fruits = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍑', '🍒', '🥭', '🍐', '🥥'];
        this.powerUpTypes = ['🚀', '⭐', '🔮', '💎', '🌟', '⚡'];
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.startTimer();
    }

    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        this.board = [];

        for (let i = 0; i < 40; i++) {
            const cell = this.createCell(i);
            this.board.push(cell);
            gameBoard.appendChild(cell.element);
        }

        this.ensureMinimumMatches(5);
        this.animateBoardEntrance();
    }

    createCell(index) {
        const cellElement = document.createElement('div');
        cellElement.className = 'cell';
        cellElement.dataset.index = index;

        const fruit = this.getWeightedRandomFruit();
        const fruitElement = document.createElement('span');
        fruitElement.className = 'fruit';
        fruitElement.textContent = fruit;
        cellElement.appendChild(fruitElement);

        // اضافه کردن افکت‌های ویژه
        if (Math.random() < 0.1) {
            this.addSpecialEffect(cellElement, index);
        }

        return {
            element: cellElement,
            fruit: fruit,
            matched: false,
            blocked: false,
            special: false,
            powerUp: null,
            index: index
        };
    }

    getWeightedRandomFruit() {
        const weights = [0.15, 0.12, 0.1, 0.1, 0.09, 0.09, 0.08, 0.08, 0.07, 0.06];
        const random = Math.random();
        let sum = 0;
        
        for (let i = 0; i < weights.length; i++) {
            sum += weights[i];
            if (random <= sum) {
                return this.fruits[i];
            }
        }
        
        return this.fruits[0];
    }

    addSpecialEffect(cell, index) {
        const effects = ['rainbow', 'glowing', 'spinning'];
        const effect = effects[Math.floor(Math.random() * effects.length)];
        
        switch(effect) {
            case 'rainbow':
                cell.style.background = 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)';
                cell.classList.add('rainbow');
                break;
            case 'glowing':
                cell.classList.add('glowing');
                cell.style.boxShadow = '0 0 20px gold';
                break;
            case 'spinning':
                cell.classList.add('spinning');
                break;
        }
        
        this.board[index].special = true;
        this.specialFruits.push(index);
    }

    ensureMinimumMatches(minMatches) {
        let matchCount = 0;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (matchCount < minMatches && attempts < maxAttempts) {
            matchCount = this.countPossibleMatches();
            attempts++;
            
            if (matchCount < minMatches) {
                this.reshuffleSomeFruits();
            }
        }
    }

    countPossibleMatches() {
        let count = 0;
        const checkedPairs = new Set();
        
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].matched || this.board[i].blocked) continue;
            
            for (let j = i + 1; j < this.board.length; j++) {
                if (this.board[j].matched || this.board[j].blocked) continue;
                
                const pairKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
                if (!checkedPairs.has(pairKey) && this.board[i].fruit === this.board[j].fruit) {
                    count++;
                    checkedPairs.add(pairKey);
                }
            }
        }
        
        return count;
    }

    reshuffleSomeFruits() {
        const unmatchedIndices = this.board
            .map((cell, index) => ({cell, index}))
            .filter(item => !item.cell.matched && !item.cell.blocked)
            .map(item => item.index);
        
        if (unmatchedIndices.length < 2) return;
        
        const index1 = unmatchedIndices[Math.floor(Math.random() * unmatchedIndices.length)];
        let index2;
        
        do {
            index2 = unmatchedIndices[Math.floor(Math.random() * unmatchedIndices.length)];
        } while (index1 === index2 || this.board[index1].fruit === this.board[index2].fruit);
        
        const tempFruit = this.board[index1].fruit;
        this.board[index1].fruit = this.board[index2].fruit;
        this.board[index2].fruit = tempFruit;
        
        this.board[index1].element.querySelector('.fruit').textContent = this.board[index1].fruit;
        this.board[index2].element.querySelector('.fruit').textContent = this.board[index2].fruit;
    }

    animateBoardEntrance() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.style.opacity = '0';
            cell.style.transform = 'translateY(100px) scale(0.5)';
            
            setTimeout(() => {
                cell.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                cell.style.opacity = '1';
                cell.style.transform = 'translateY(0) scale(1)';
            }, index * 50);
        });
    }

    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        
        gameBoard.addEventListener('click', (e) => {
            if (this.gameState !== 'playing') return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const index = parseInt(cell.dataset.index);
            this.handleCellClick(index);
        });

        // مدیریت کشیدن و رها کردن
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        let currentLine = null;
        let startCell = null;

        document.addEventListener('mousedown', (e) => {
            if (this.gameState !== 'playing') return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const index = parseInt(cell.dataset.index);
            if (this.board[index].matched || this.board[index].blocked) return;
            
            startCell = index;
            this.selectedCells = [index];
            this.board[index].element.classList.add('selected');
            this.isDrawing = true;
            
            // ایجاد خط
            currentLine = document.createElement('div');
            currentLine.className = 'connection-line';
            currentLine.style.position = 'absolute';
            currentLine.style.pointerEvents = 'none';
            currentLine.style.zIndex = '100';
            document.getElementById('game-board').appendChild(currentLine);
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDrawing || !currentLine) return;
            
            // به‌روزرسانی موقعیت خط
            // این قسمت نیاز به محاسبات دقیق‌تر دارد
        });

        document.addEventListener('mouseup', (e) => {
            if (!this.isDrawing) return;
            
            this.isDrawing = false;
            const elements = document.elementsFromPoint(e.clientX, e.clientY);
            const cell = elements.find(el => el.classList.contains('.cell'));
            
            if (cell && startCell !== null) {
                const endIndex = parseInt(cell.dataset.index);
                if (!this.selectedCells.includes(endIndex) && 
                    !this.board[endIndex].matched && 
                    !this.board[endIndex].blocked) {
                    
                    this.selectedCells.push(endIndex);
                    this.connectCells();
                }
            }
            
            if (currentLine) {
                currentLine.remove();
                currentLine = null;
            }
            
            if (this.selectedCells.length === 1) {
                this.selectedCells.forEach(idx => {
                    this.board[idx].element.classList.remove('selected');
                });
                this.selectedCells = [];
            }
        });
    }

    handleCellClick(index) {
        if (this.board[index].matched || this.board[index].blocked) return;
        
        if (this.selectedCells.includes(index)) {
            this.selectedCells = this.selectedCells.filter(i => i !== index);
            this.board[index].element.classList.remove('selected');
            return;
        }
        
        if (this.selectedCells.length < 2) {
            this.selectedCells.push(index);
            this.board[index].element.classList.add('selected');
            
            if (this.selectedCells.length === 2) {
                this.connectCells();
            }
        }
    }

    connectCells() {
        if (this.selectedCells.length !== 2) return;
        
        const [first, second] = this.selectedCells;
        
        if (this.board[first].fruit === this.board[second].fruit) {
            this.handleSuccessfulConnection(first, second);
        } else {
            this.handleFailedConnection();
        }
        
        this.selectedCells.forEach(index => {
            this.board[index].element.classList.remove('selected');
        });
        this.selectedCells = [];
    }

    handleSuccessfulConnection(first, second) {
        this.board[first].matched = true;
        this.board[second].matched = true;
        
        this.board[first].element.classList.add('matched');
        this.board[second].element.classList.add('matched');
        
        // محاسبه امتیاز
        const baseScore = 50;
        const comboBonus = this.comboCount * 10;
        const totalScore = baseScore + comboBonus;
        
        this.score += totalScore;
        this.connectionsMade++;
        this.comboCount++;
        this.playerStreak++;
        
        // نمایش انیمیشن
        if (window.AnimationManager) {
            window.AnimationManager.showMatchAnimation(first, second, totalScore);
        }
        
        this.updateUI();
        
        if (this.connectionsMade >= this.connectionsNeeded) {
            this.completeLevel();
        }
        
        setTimeout(() => {
            this.replaceMatchedCells([first, second]);
        }, 500);
    }

    handleFailedConnection() {
        this.score = Math.max(0, this.score - 10);
        this.comboCount = 0;
        this.playerStreak = 0;
        this.updateUI();
    }

    replaceMatchedCells(indices) {
        indices.forEach(index => {
            if (this.board[index].matched) {
                this.board[index].element.style.transition = 'all 0.5s ease';
                this.board[index].element.style.opacity = '0';
                this.board[index].element.style.transform = 'scale(0)';
                
                setTimeout(() => {
                    const newFruit = this.getWeightedRandomFruit();
                    this.board[index].fruit = newFruit;
                    this.board[index].matched = false;
                    this.board[index].element.querySelector('.fruit').textContent = newFruit;
                    
                    this.board[index].element.style.opacity = '0';
                    this.board[index].element.style.transform = 'translateY(100px) scale(0.5)';
                    this.board[index].element.classList.remove('matched');
                    
                    setTimeout(() => {
                        this.board[index].element.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        this.board[index].element.style.opacity = '1';
                        this.board[index].element.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                }, 500);
            }
        });
    }

    startTimer() {
        this.timer = 60 + (this.level * 10);
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();
            
            if (this.timer <= 0) {
                this.gameOver();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }

    updateUI() {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) scoreElement.textContent = this.score;
        if (levelElement) levelElement.textContent = this.level;
    }

    completeLevel() {
        this.gameState = 'completed';
        clearInterval(this.timerInterval);
        
        if (window.UIManager) {
            window.UIManager.showLevelComplete(this.score, this.level);
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.timerInterval);
        
        if (window.UIManager) {
            window.UIManager.showGameOver(this.score);
        }
    }

    nextLevel() {
        this.level++;
        this.connectionsMade = 0;
        this.connectionsNeeded = Math.min(20, this.connectionsNeeded + 2);
        this.gameState = 'playing';
        this.createBoard();
        this.updateUI();
        this.startTimer();
    }

    resetGame() {
        this.score = 0;
        this.level = 1;
        this.connectionsMade = 0;
        this.connectionsNeeded = 10;
        this.selectedCells = [];
        this.gameState = 'playing';
        this.comboCount = 0;
        this.playerStreak = 0;
        
        clearInterval(this.timerInterval);
        this.createBoard();
        this.updateUI();
        this.startTimer();
    }
}

// ایجاد نمونه از موتور بازی
window.GameEngine = GameEngine;
