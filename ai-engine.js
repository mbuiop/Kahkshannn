// ai-engine.js - موتور هوش مصنوعی و الگوریتم‌های بازی

class AIEngine {
    constructor() {
        this.difficulty = 'medium'; // easy, medium, hard, expert
        this.thinkingTime = 2000; // زمان فکر کردن به میلی‌ثانیه
        this.matchProbability = 0.8; // احتمال پیدا کردن جفت
        this.obstacleProbability = 0.3; // احتمال ایجاد مانع
        this.strategy = 'balanced'; // aggressive, defensive, balanced
        
        this.moveHistory = [];
        this.playerPatterns = new Map();
        this.predictionModel = null;
        
        this.init();
    }

    init() {
        this.setupDifficultyLevels();
        this.trainPredictionModel();
    }

    setupDifficultyLevels() {
        this.difficultyLevels = {
            easy: {
                thinkingTime: 3000,
                matchProbability: 0.6,
                obstacleProbability: 0.1,
                strategy: 'defensive'
            },
            medium: {
                thinkingTime: 2000,
                matchProbability: 0.8,
                obstacleProbability: 0.3,
                strategy: 'balanced'
            },
            hard: {
                thinkingTime: 1500,
                matchProbability: 0.9,
                obstacleProbability: 0.5,
                strategy: 'aggressive'
            },
            expert: {
                thinkingTime: 1000,
                matchProbability: 0.95,
                obstacleProbability: 0.7,
                strategy: 'aggressive'
            }
        };
    }

    setDifficulty(level) {
        if (this.difficultyLevels[level]) {
            this.difficulty = level;
            const config = this.difficultyLevels[level];
            this.thinkingTime = config.thinkingTime;
            this.matchProbability = config.matchProbability;
            this.obstacleProbability = config.obstacleProbability;
            this.strategy = config.strategy;
        }
    }

    async makeMove(board) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const move = this.calculateBestMove(board);
                resolve(move);
            }, this.thinkingTime);
        });
    }

    calculateBestMove(board) {
        // تحلیل وضعیت فعلی بازی
        const gameState = this.analyzeGameState(board);
        
        // پیدا کردن بهترین حرکت بر اساس استراتژی
        let bestMove;
        
        switch(this.strategy) {
            case 'aggressive':
                bestMove = this.aggressiveStrategy(board, gameState);
                break;
            case 'defensive':
                bestMove = this.defensiveStrategy(board, gameState);
                break;
            case 'balanced':
            default:
                bestMove = this.balancedStrategy(board, gameState);
                break;
        }
        
        // ذخیره تاریخچه حرکت
        this.recordMove(bestMove, gameState);
        
        return bestMove;
    }

    analyzeGameState(board) {
        const state = {
            totalCells: board.length,
            matchedCells: board.filter(cell => cell.matched).length,
            blockedCells: board.filter(cell => cell.blocked).length,
            availableMoves: this.countAvailableMoves(board),
            possibleMatches: this.findAllPossibleMatches(board),
            playerAdvantage: this.calculatePlayerAdvantage(board),
            riskLevel: this.calculateRiskLevel(board),
            specialFruits: board.filter(cell => cell.special && !cell.matched).length
        };
        
        return state;
    }

    countAvailableMoves(board) {
        return this.findAllPossibleMatches(board).length;
    }

    findAllPossibleMatches(board) {
        const matches = [];
        const checkedPairs = new Set();
        
        for (let i = 0; i < board.length; i++) {
            if (board[i].matched || board[i].blocked) continue;
            
            for (let j = i + 1; j < board.length; j++) {
                if (board[j].matched || board[j].blocked) continue;
                
                const pairKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
                if (!checkedPairs.has(pairKey) && board[i].fruit === board[j].fruit) {
                    matches.push({
                        cells: [i, j],
                        distance: this.calculateDistance(board[i], board[j]),
                        priority: this.calculateMatchPriority(board[i], board[j])
                    });
                    checkedPairs.add(pairKey);
                }
            }
        }
        
        // مرتب کردن بر اساس اولویت
        matches.sort((a, b) => b.priority - a.priority);
        
        return matches;
    }

    calculateDistance(cell1, cell2) {
        // محاسبه فاصله بین دو سلول
        const pos1 = this.getCellPosition(cell1.index);
        const pos2 = this.getCellPosition(cell2.index);
        
        return Math.sqrt(
            Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
        );
    }

    getCellPosition(index) {
        const cols = 5;
        return {
            x: index % cols,
            y: Math.floor(index / cols)
        };
    }

    calculateMatchPriority(cell1, cell2) {
        let priority = 0;
        
        // اولویت برای میوه‌های ویژه
        if (cell1.special || cell2.special) {
            priority += 50;
        }
        
        // اولویت برای پاورآپ‌ها
        if (cell1.powerUp || cell2.powerUp) {
            priority += 30;
        }
        
        // اولویت برای جفت‌های نزدیک
        const distance = this.calculateDistance(cell1, cell2);
        priority += (100 - distance * 10);
        
        return priority;
    }

    calculatePlayerAdvantage(board) {
        // محاسبه مزیت بازیکن نسبت به AI
        const playerMatches = this.estimatePlayerMatches(board);
        const aiMatches = this.findAllPossibleMatches(board).length;
        
        return playerMatches - aiMatches;
    }

    estimatePlayerMatches(board) {
        // تخمین تعداد جفت‌هایی که بازیکن می‌تواند پیدا کند
        // این یک تخمین ساده است - در نسخه پیشرفته‌تر از یادگیری ماشین استفاده می‌شود
        return Math.floor(this.findAllPossibleMatches(board).length * 0.7);
    }

    calculateRiskLevel(board) {
        // محاسبه سطح ریسک در وضعیت فعلی
        const availableMoves = this.countAvailableMoves(board);
        const totalPossible = (board.length - board.filter(c => c.matched).length) / 2;
        
        return (totalPossible - availableMoves) / totalPossible;
    }

    aggressiveStrategy(board, gameState) {
        // استراتژی تهاجمی - تمرکز بر کسب امتیاز سریع
        const possibleMoves = gameState.possibleMatches;
        
        if (possibleMoves.length > 0) {
            // انتخاب بهترین حرکت از نظر امتیاز
            return possibleMoves[0];
        }
        
        // اگر حرکتی پیدا نکرد، مانع ایجاد کند
        return this.createObstacleMove(board);
    }

    defensiveStrategy(board, gameState) {
        // استراتژی دفاعی - تمرکز بر محدود کردن بازیکن
        if (Math.random() < this.obstacleProbability && gameState.riskLevel < 0.5) {
            const obstacleMove = this.createObstacleMove(board);
            if (obstacleMove) return obstacleMove;
        }
        
        // در غیر این صورت یک حرکت معمولی انجام دهد
        const possibleMoves = gameState.possibleMatches;
        if (possibleMoves.length > 0) {
            // انتخاب حرکتی که کمترین مزیت را به بازیکن بدهد
            return this.findLeastAdvantageousMove(possibleMoves, board);
        }
        
        return null;
    }

    balancedStrategy(board, gameState) {
        // استراتژی متعادل - ترکیبی از تهاجم و دفاع
        const shouldCreateObstacle = 
            Math.random() < this.obstacleProbability && 
            gameState.playerAdvantage > 2;
        
        if (shouldCreateObstacle) {
            const obstacleMove = this.createObstacleMove(board);
            if (obstacleMove) return obstacleMove;
        }
        
        const possibleMoves = gameState.possibleMatches;
        if (possibleMoves.length > 0) {
            if (gameState.playerAdvantage > 0) {
                // اگر بازیکن مزیت دارد، حرکت تهاجمی
                return possibleMoves[0];
            } else {
                // در غیر این صورت حرکت متعادل
                const midIndex = Math.floor(possibleMoves.length / 2);
                return possibleMoves[midIndex];
            }
        }
        
        return null;
    }

    createObstacleMove(board) {
        // پیدا کردن بهترین مکان برای ایجاد مانع
        const availableCells = board
            .map((cell, index) => ({cell, index}))
            .filter(item => !item.cell.matched && !item.cell.blocked && !item.cell.special)
            .map(item => item.index);
        
        if (availableCells.length === 0) return null;
        
        // انتخاب سلولی که بیشترین تأثیر را در محدود کردن بازیکن دارد
        const bestObstacle = this.findBestObstaclePosition(availableCells, board);
        
        return {
            type: 'obstacle',
            cellIndex: bestObstacle,
            priority: 100
        };
    }

    findBestObstaclePosition(availableCells, board) {
        // ارزیابی هر سلول برای تعیین بهترین مکان مانع
        let bestCell = availableCells[0];
        let bestScore = -1;
        
        for (const cellIndex of availableCells) {
            const score = this.evaluateObstaclePosition(cellIndex, board);
            if (score > bestScore) {
                bestScore = score;
                bestCell = cellIndex;
            }
        }
        
        return bestCell;
    }

    evaluateObstaclePosition(cellIndex, board) {
        // ارزیابی تأثیر ایجاد مانع در یک سلول خاص
        let score = 0;
        
        // موقعیت سلول
        const position = this.getCellPosition(cellIndex);
        
        // سلول‌های مرکزی ارزش بیشتری دارند
        const centerX = 2, centerY = 3.5; // مرکز صفحه 5x8
        const distanceFromCenter = Math.sqrt(
            Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
        );
        score += (10 - distanceFromCenter) * 5;
        
        // بررسی تأثیر بر جفت‌های ممکن
        const affectedMatches = this.countAffectedMatches(cellIndex, board);
        score += affectedMatches * 20;
        
        // بررسی میوه‌های همسایه
        const neighborValue = this.evaluateNeighbors(cellIndex, board);
        score += neighborValue;
        
        return score;
    }

    countAffectedMatches(cellIndex, board) {
        // شمارش تعداد جفت‌هایی که با مسدود کردن این سلول غیرممکن می‌شوند
        let count = 0;
        const cellFruit = board[cellIndex].fruit;
        
        for (let i = 0; i < board.length; i++) {
            if (i === cellIndex || board[i].matched || board[i].blocked) continue;
            
            if (board[i].fruit === cellFruit) {
                count++;
            }
        }
        
        return count;
    }

    evaluateNeighbors(cellIndex, board) {
        // ارزیابی همسایه‌های یک سلول
        const position = this.getCellPosition(cellIndex);
        let value = 0;
        
        // همسایه‌های مجاور
        const neighbors = [
            {x: position.x - 1, y: position.y}, // چپ
            {x: position.x + 1, y: position.y}, // راست
            {x: position.x, y: position.y - 1}, // بالا
            {x: position.x, y: position.y + 1}  // پایین
        ];
        
        for (const neighbor of neighbors) {
            if (neighbor.x >= 0 && neighbor.x < 5 && neighbor.y >= 0 && neighbor.y < 8) {
                const neighborIndex = neighbor.y * 5 + neighbor.x;
                if (!board[neighborIndex].matched && !board[neighborIndex].blocked) {
                    // همسایه‌های ویژه ارزش بیشتری دارند
                    if (board[neighborIndex].special) {
                        value += 10;
                    }
                    // همسایه‌هایی که جفت‌های زیادی دارند
                    const matchPotential = this.countPotentialMatches(neighborIndex, board);
                    value += matchPotential * 5;
                }
            }
        }
        
        return value;
    }

    countPotentialMatches(cellIndex, board) {
        // شمارش تعداد جفت‌های ممکن برای یک سلول
        const cellFruit = board[cellIndex].fruit;
        let count = 0;
        
        for (let i = 0; i < board.length; i++) {
            if (i === cellIndex || board[i].matched || board[i].blocked) continue;
            
            if (board[i].fruit === cellFruit) {
                count++;
            }
        }
        
        return count;
    }

    findLeastAdvantageousMove(moves, board) {
        // پیدا کردن حرکتی که کمترین مزیت را به بازیکن می‌دهد
        let bestMove = moves[0];
        let bestScore = Infinity;
        
        for (const move of moves) {
            const score = this.evaluateMoveAdvantage(move, board);
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    evaluateMoveAdvantage(move, board) {
        // ارزیابی میزان مزیتی که یک حرکت به بازیکن می‌دهد
        let advantage = 0;
        
        // شبیه‌سازی حرکت
        const simulatedBoard = this.simulateMove(move, board);
        
        // محاسبه مزیت بازیکن پس از این حرکت
        const newGameState = this.analyzeGameState(simulatedBoard);
        advantage = newGameState.playerAdvantage;
        
        return advantage;
    }

    simulateMove(move, board) {
        // شبیه‌سازی یک حرکت روی صفحه
        const newBoard = JSON.parse(JSON.stringify(board));
        
        if (move.type === 'match') {
            newBoard[move.cells[0]].matched = true;
            newBoard[move.cells[1]].matched = true;
        } else if (move.type === 'obstacle') {
            newBoard[move.cellIndex].blocked = true;
        }
        
        return newBoard;
    }

    recordMove(move, gameState) {
        // ذخیره تاریخچه حرکت برای آموزش مدل
        this.moveHistory.push({
            move: move,
            gameState: gameState,
            timestamp: Date.now(),
            difficulty: this.difficulty
        });
        
        // محدود کردن اندازه تاریخچه
        if (this.moveHistory.length > 1000) {
            this.moveHistory.shift();
        }
    }

    trainPredictionModel() {
        // آموزش مدل پیش‌بینی حرکات بازیکن
        // این یک پیاده‌سازی ساده است - در نسخه واقعی از TensorFlow.js استفاده می‌شود
        
        this.predictionModel = {
            predict: (gameState) => {
                // پیش‌بینی ساده بر اساس الگوهای تاریخی
                const similarStates = this.findSimilarStates(gameState);
                
                if (similarStates.length === 0) {
                    return this.getRandomPrediction();
                }
                
                return this.aggregatePredictions(similarStates);
            },
            
            update: (playerMove, gameState) => {
                // به‌روزرسانی مدل بر اساس حرکت بازیکن
                this.learnFromPlayerMove(playerMove, gameState);
            }
        };
    }

    findSimilarStates(currentState) {
        // پیدا کردن وضعیت‌های مشابه در تاریخچه
        return this.moveHistory
            .filter(record => {
                const similarity = this.calculateStateSimilarity(record.gameState, currentState);
                return similarity > 0.7; // آستانه تشابه
            })
            .slice(0, 10); // فقط 10 مورد مشابه
    }

    calculateStateSimilarity(state1, state2) {
        // محاسبه تشابه بین دو وضعیت بازی
        let similarity = 0;
        const totalFactors = 5;
        
        // تشابه در تعداد حرکت‌های available
        const movesSimilarity = 1 - Math.abs(state1.availableMoves - state2.availableMoves) / Math.max(state1.availableMoves, state2.availableMoves);
        similarity += movesSimilarity / totalFactors;
        
        // تشابه در سطح ریسک
        const riskSimilarity = 1 - Math.abs(state1.riskLevel - state2.riskLevel);
        similarity += riskSimilarity / totalFactors;
        
        // تشابه در مزیت بازیکن
        const advantageSimilarity = 1 - Math.abs(state1.playerAdvantage - state2.playerAdvantage) / 10;
        similarity += advantageSimilarity / totalFactors;
        
        // تشابه در میوه‌های ویژه
        const specialSimilarity = 1 - Math.abs(state1.specialFruits - state2.specialFruits) / Math.max(state1.specialFruits, state2.specialFruits, 1);
        similarity += specialSimilarity / totalFactors;
        
        // تشابه در سلول‌های مسدود شده
        const blockedSimilarity = 1 - Math.abs(state1.blockedCells - state2.blockedCells) / Math.max(state1.blockedCells, state2.blockedCells, 1);
        similarity += blockedSimilarity / totalFactors;
        
        return similarity;
    }

    learnFromPlayerMove(playerMove, gameState) {
        // یادگیری از حرکات بازیکن
        const playerPattern = {
            move: playerMove,
            gameState: gameState,
            frequency: 1
        };
        
        const patternKey = this.generatePatternKey(gameState);
        
        if (this.playerPatterns.has(patternKey)) {
            const existingPattern = this.playerPatterns.get(patternKey);
            existingPattern.frequency++;
        } else {
            this.playerPatterns.set(patternKey, playerPattern);
        }
    }

    generatePatternKey(gameState) {
        // تولید کلید برای الگوهای بازیکن
        return `${gameState.availableMoves}_${gameState.riskLevel.toFixed(1)}_${gameState.playerAdvantage}`;
    }

    predictPlayerMove(gameState) {
        if (this.predictionModel) {
            return this.predictionModel.predict(gameState);
        }
        return this.getRandomPrediction();
    }

    getRandomPrediction() {
        // پیش‌بینی تصادفی (وقتی داده کافی نداریم)
        return {
            confidence: 0.1,
            predictedMoves: []
        };
    }

    aggregatePredictions(similarStates) {
        // تجمیع پیش‌بینی‌ها از وضعیت‌های مشابه
        const moveCounts = new Map();
        
        similarStates.forEach(record => {
            const moveKey = JSON.stringify(record.move);
            moveCounts.set(moveKey, (moveCounts.get(moveKey) || 0) + 1);
        });
        
        const total = similarStates.length;
        const predictions = [];
        
        moveCounts.forEach((count, moveKey) => {
            predictions.push({
                move: JSON.parse(moveKey),
                confidence: count / total
            });
        });
        
        // مرتب کردن بر اساس اطمینان
        predictions.sort((a, b) => b.confidence - a.confidence);
        
        return {
            confidence: predictions[0]?.confidence || 0,
            predictedMoves: predictions
        };
    }

    adjustDifficulty(performance) {
        // تنظیم خودکار سختی بر اساس عملکرد بازیکن
        if (performance.winRate > 0.7) {
            this.setDifficulty('hard');
        } else if (performance.winRate > 0.5) {
            this.setDifficulty('medium');
        } else {
            this.setDifficulty('easy');
        }
    }

    getPerformanceStats() {
        // آمار عملکرد AI
        const totalMoves = this.moveHistory.length;
        const successfulMoves = this.moveHistory.filter(record => 
            record.move && record.move.type === 'match'
        ).length;
        
        return {
            totalMoves: totalMoves,
            successRate: totalMoves > 0 ? successfulMoves / totalMoves : 0,
            averageThinkingTime: this.thinkingTime,
            currentDifficulty: this.difficulty
        };
    }

    reset() {
        // بازنشانی وضعیت AI
        this.moveHistory = [];
        this.playerPatterns.clear();
    }
}

// ایجاد نمونه از موتور هوش مصنوعی
window.AIEngine = new AIEngine();
