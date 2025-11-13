// ai-engine.js - موتور هوش مصنوعی پیشرفته
class AIEngine {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        
        this.difficultyLevels = {
            easy: { thinkingTime: 3000, accuracy: 0.6, strategy: 'defensive' },
            medium: { thinkingTime: 2000, accuracy: 0.8, strategy: 'balanced' },
            hard: { thinkingTime: 1500, accuracy: 0.9, strategy: 'aggressive' }
        };
        
        this.currentDifficulty = 'medium';
        this.isActive = false;
        this.thinkingTimeout = null;
        this.gameState = null;
        
        this.moveHistory = [];
        this.patternDatabase = new Map();
        this.predictionModel = null;
        this.learningRate = 0.1;
        
        this.init();
    }

    async init() {
        await this.initializeAI();
        this.setupEventListeners();
        console.log('AI Engine initialized successfully');
    }

    async initializeAI() {
        // ایجاد مدل پیش‌بینی اولیه
        this.predictionModel = {
            weights: this.initializeWeights(),
            bias: 0.1,
            learningRate: this.learningRate
        };

        // بارگذاری داده‌های آموزشی
        await this.loadTrainingData();
        
        // راه‌اندازی سیستم تصمیم‌گیری
        this.decisionEngine = new DecisionEngine(this);
    }

    initializeWeights() {
        // وزن‌های اولیه برای ویژگی‌های مختلف
        return {
            fruitSimilarity: 0.8,
            distance: -0.3,
            specialFruit: 1.2,
            boardPosition: 0.2,
            riskFactor: -0.7,
            comboPotential: 0.9
        };
    }

    async loadTrainingData() {
        // داده‌های آموزشی از بازی‌های قبلی
        const trainingData = [
            // الگوهای موفق
            { features: [1, 0.8, 0, 0.5, 0.3, 0.7], success: 1 },
            { features: [0.9, 0.6, 1, 0.3, 0.2, 0.8], success: 1 },
            { features: [0.7, 0.9, 0, 0.4, 0.4, 0.6], success: 1 },
            
            // الگوهای ناموفق
            { features: [0.3, 0.2, 0, 0.1, 0.9, 0.1], success: 0 },
            { features: [0.4, 0.7, 0, 0.6, 0.7, 0.3], success: 0 }
        ];

        this.trainingData = trainingData;
    }

    setupEventListeners() {
        // گوش دادن به تغییرات وضعیت بازی
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateGameState();
        });
    }

    updateGameState() {
        if (!this.core.fruitGrid) return;

        this.gameState = {
            timestamp: Date.now(),
            fruits: this.getFruitState(),
            playerScore: this.core.score || 0,
            timeLeft: this.core.timeLeft || 60,
            connectionsMade: this.core.connectionsMade || 0,
            difficulty: this.currentDifficulty
        };
    }

    getFruitState() {
        const fruitState = [];
        
        Object.values(this.core.fruitGrid).forEach(fruitData => {
            if (fruitData && fruitData.mesh) {
                fruitState.push({
                    type: fruitData.type,
                    position: fruitData.mesh.position.clone(),
                    gridIndex: fruitData.index,
                    isMatched: false
                });
            }
        });
        
        return fruitState;
    }

    setDifficulty(level) {
        if (this.difficultyLevels[level]) {
            this.currentDifficulty = level;
            console.log(`AI difficulty set to: ${level}`);
        }
    }

    async makeMove() {
        if (!this.isActive || !this.gameState) return null;

        const config = this.difficultyLevels[this.currentDifficulty];
        
        return new Promise((resolve) => {
            this.thinkingTimeout = setTimeout(async () => {
                const move = await this.calculateBestMove();
                resolve(move);
            }, config.thinkingTime);
        });
    }

    async calculateBestMove() {
        const possibleMoves = this.findAllPossibleMoves();
        
        if (possibleMoves.length === 0) {
            return null;
        }

        // ارزیابی تمام حرکات ممکن
        const evaluatedMoves = await this.evaluateMoves(possibleMoves);
        
        // انتخاب بهترین حرکت بر اساس استراتژی
        const bestMove = this.selectBestMove(evaluatedMoves);
        
        // ذخیره حرکت در تاریخچه
        this.recordMove(bestMove);
        
        return bestMove;
    }

    findAllPossibleMoves() {
        const moves = [];
        const fruits = this.gameState.fruits.filter(fruit => !fruit.isMatched);
        
        // پیدا کردن تمام جفت‌های ممکن
        for (let i = 0; i < fruits.length; i++) {
            for (let j = i + 1; j < fruits.length; j++) {
                if (this.isValidMatch(fruits[i], fruits[j])) {
                    moves.push({
                        type: 'match',
                        fruits: [fruits[i], fruits[j]],
                        priority: this.calculateMovePriority(fruits[i], fruits[j])
                    });
                }
            }
        }
        
        return moves.sort((a, b) => b.priority - a.priority);
    }

    isValidMatch(fruit1, fruit2) {
        // بررسی تطابق نوع میوه
        if (fruit1.type !== fruit2.type) return false;
        
        // بررسی فاصله
        const distance = BABYLON.Vector3.Distance(fruit1.position, fruit2.position);
        const maxDistance = 15;
        
        return distance <= maxDistance;
    }

    calculateMovePriority(fruit1, fruit2) {
        let priority = 0;
        
        // اولویت بر اساس فاصله (حرکات نزدیک‌تر بهترند)
        const distance = BABYLON.Vector3.Distance(fruit1.position, fruit2.position);
        priority += (100 - distance * 10);
        
        // اولویت استراتژیک
        priority += this.calculateStrategicValue(fruit1, fruit2);
        
        return priority;
    }

    calculateStrategicValue(fruit1, fruit2) {
        let value = 0;
        
        // موقعیت در صفحه (مرکز مهم‌تر است)
        const center = new BABYLON.Vector3(0, 0, 0);
        const pos1 = fruit1.position;
        const pos2 = fruit2.position;
        
        const distFromCenter1 = BABYLON.Vector3.Distance(pos1, center);
        const distFromCenter2 = BABYLON.Vector3.Distance(pos2, center);
        
        value += (20 - distFromCenter1) + (20 - distFromCenter2);
        
        return value;
    }

    async evaluateMoves(moves) {
        const evaluatedMoves = [];
        const config = this.difficultyLevels[this.currentDifficulty];
        
        for (const move of moves) {
            const features = this.extractFeatures(move);
            const score = await this.predictMoveSuccess(features);
            
            // اعمال دقت بر اساس سطح سختی
            const adjustedScore = score * config.accuracy;
            
            evaluatedMoves.push({
                ...move,
                score: adjustedScore,
                confidence: score,
                features: features
            });
        }
        
        return evaluatedMoves.sort((a, b) => b.score - a.score);
    }

    extractFeatures(move) {
        const features = [];
        
        if (move.type === 'match') {
            const [fruit1, fruit2] = move.fruits;
            
            // 1. شباهت میوه‌ها
            features.push(1);
            
            // 2. فاصله
            const distance = BABYLON.Vector3.Distance(fruit1.position, fruit2.position);
            features.push(1 - (distance / 20));
            
            // 3. موقعیت در صفحه
            const center = new BABYLON.Vector3(0, 0, 0);
            const avgPos = BABYLON.Vector3.Center(fruit1.position, fruit2.position);
            const distFromCenter = BABYLON.Vector3.Distance(avgPos, center);
            features.push(1 - (distFromCenter / 15));
            
            // 4. فاکتور ریسک
            features.push(this.calculateRiskFactor(move));
            
            // 5. پتانسیل کامبو
            features.push(this.calculateComboPotential(fruit1, fruit2) / 10);
        }
        
        return features;
    }

    calculateRiskFactor(move) {
        let risk = 0;
        
        if (move.type === 'match') {
            const [fruit1, fruit2] = move.fruits;
            
            // ریسک بر اساس موقعیت‌های حساس
            risk += this.getPositionRisk(fruit1.position);
            risk += this.getPositionRisk(fruit2.position);
        }
        
        return Math.min(risk, 1);
    }

    getPositionRisk(position) {
        // موقعیت‌های مرکزی ریسک کمتری دارند
        const center = new BABYLON.Vector3(0, 0, 0);
        const distance = BABYLON.Vector3.Distance(position, center);
        
        return distance / 15;
    }

    calculateComboPotential(fruit1, fruit2) {
        // بررسی پتانسیل ایجاد combo
        let comboPotential = 0;
        const fruitType = fruit1.type;
        const allFruits = this.gameState.fruits.filter(f => !f.isMatched);
        
        // شمارش میوه‌های مشابه دیگر
        const similarFruits = allFruits.filter(f => 
            f.type === fruitType && 
            f.gridIndex !== fruit1.gridIndex && 
            f.gridIndex !== fruit2.gridIndex
        ).length;
        
        comboPotential += similarFruits * 5;
        
        return comboPotential;
    }

    async predictMoveSuccess(features) {
        if (!this.predictionModel) return 0.5;
        
        // محاسبه امتیاز با استفاده از مدل خطی ساده
        let score = this.predictionModel.bias;
        
        features.forEach((feature, index) => {
            const weightKey = Object.keys(this.predictionModel.weights)[index];
            if (weightKey) {
                score += feature * this.predictionModel.weights[weightKey];
            }
        });
        
        // اعمال تابع فعال‌سازی sigmoid
        return this.sigmoid(score);
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    selectBestMove(evaluatedMoves) {
        const config = this.difficultyLevels[this.currentDifficulty];
        
        switch (config.strategy) {
            case 'defensive':
                return this.defensiveStrategy(evaluatedMoves);
            case 'aggressive':
                return this.aggressiveStrategy(evaluatedMoves);
            case 'balanced':
            default:
                return this.balancedStrategy(evaluatedMoves);
        }
    }

    defensiveStrategy(moves) {
        // استراتژی دفاعی: جلوگیری از حرکات پرریسک
        const safeMoves = moves.filter(move => move.features[3] < 0.3);
        return safeMoves.length > 0 ? safeMoves[0] : moves[0];
    }

    aggressiveStrategy(moves) {
        // استراتژی تهاجمی: حرکات با امتیاز بالا
        return moves[0];
    }

    balancedStrategy(moves) {
        // استراتژی متعادل: ترکیب امتیاز و ریسک
        const balancedMoves = moves.map(move => ({
            ...move,
            balancedScore: move.score * (1 - move.features[3] * 0.5)
        })).sort((a, b) => b.balancedScore - a.balancedScore);
        
        return balancedMoves[0];
    }

    recordMove(move) {
        const moveRecord = {
            move: move,
            gameState: { ...this.gameState },
            timestamp: Date.now(),
            difficulty: this.currentDifficulty,
            success: null
        };
        
        this.moveHistory.push(moveRecord);
        
        // محدود کردن اندازه تاریخچه
        if (this.moveHistory.length > 1000) {
            this.moveHistory.shift();
        }
    }

    // متدهای اجرای حرکت
    async executeMove(move) {
        if (!move) return false;
        
        if (move.type === 'match') {
            return await this.executeMatchMove(move);
        }
        
        return false;
    }

    async executeMatchMove(move) {
        const [fruit1, fruit2] = move.fruits;
        
        // شبیه‌سازی کلیک روی میوه‌ها
        await this.simulateFruitClick(fruit1);
        await this.delay(200);
        await this.simulateFruitClick(fruit2);
        
        // ثبت موفقیت حرکت
        this.recordMoveSuccess(move, true);
        
        return true;
    }

    async simulateFruitClick(fruit) {
        // شبیه‌سازی کلیک روی میوه
        const fruitMesh = this.scene.getMeshByName(`fruit_${fruit.gridIndex}`);
        if (fruitMesh && this.core.onFruitSelected) {
            this.core.onFruitSelected(fruitMesh);
        }
    }

    recordMoveSuccess(move, success) {
        // پیدا کردن آخرین حرکت در تاریخچه و ثبت موفقیت آن
        const lastMove = this.moveHistory[this.moveHistory.length - 1];
        if (lastMove && lastMove.move === move) {
            lastMove.success = success;
        }
    }

    // متدهای مدیریت بازی
    start() {
        this.isActive = true;
        console.log('AI started');
    }

    stop() {
        this.isActive = false;
        if (this.thinkingTimeout) {
            clearTimeout(this.thinkingTimeout);
            this.thinkingTimeout = null;
        }
        console.log('AI stopped');
    }

    pause() {
        this.isActive = false;
        if (this.thinkingTimeout) {
            clearTimeout(this.thinkingTimeout);
            this.thinkingTimeout = null;
        }
    }

    resume() {
        this.isActive = true;
    }

    // متدهای آنالیز و گزارش
    getPerformanceStats() {
        const totalMoves = this.moveHistory.length;
        const successfulMoves = this.moveHistory.filter(move => move.success === true).length;
        
        return {
            totalMoves: totalMoves,
            successRate: totalMoves > 0 ? successfulMoves / totalMoves : 0,
            currentDifficulty: this.currentDifficulty
        };
    }

    // متدهای کمکی
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    dispose() {
        this.stop();
        this.moveHistory = [];
        this.patternDatabase.clear();
        this.predictionModel = null;
    }
}

// کلاس موتور تصمیم‌گیری
class DecisionEngine {
    constructor(aiEngine) {
        this.aiEngine = aiEngine;
        this.strategies = new Map();
        this.currentStrategy = 'balanced';
        
        this.initializeStrategies();
    }

    initializeStrategies() {
        this.strategies.set('defensive', {
            evaluate: (move) => this.evaluateDefensive(move),
            weight: 1.0
        });
        
        this.strategies.set('aggressive', {
            evaluate: (move) => this.evaluateAggressive(move),
            weight: 1.2
        });
        
        this.strategies.set('balanced', {
            evaluate: (move) => this.evaluateBalanced(move),
            weight: 1.0
        });
    }

    evaluateDefensive(move) {
        let score = move.score;
        // جریمه برای حرکات پرریسک
        score -= move.features[3] * 0.3;
        return score;
    }

    evaluateAggressive(move) {
        let score = move.score;
        // پاداش برای حرکات با امتیاز بالا
        score += move.features[4] * 0.2;
        return score;
    }

    evaluateBalanced(move) {
        // میانگین وزنی از تمام فاکتورها
        let score = move.score;
        score -= move.features[3] * 0.15;
        score += move.features[4] * 0.1;
        return score;
    }

    setStrategy(strategy) {
        if (this.strategies.has(strategy)) {
            this.currentStrategy = strategy;
        }
    }

    evaluateMove(move) {
        const strategy = this.strategies.get(this.currentStrategy);
        return strategy ? strategy.evaluate(move) : move.score;
    }
}

window.AIEngine = AIEngine;
