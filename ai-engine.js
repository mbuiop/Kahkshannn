// ai-engine.js - موتور هوش مصنوعی پیشرفته
class AIEngine {
    constructor(coreEngine) {
        this.core = coreEngine;
        this.scene = coreEngine.scene;
        
        this.difficultyLevels = {
            easy: { thinkingTime: 3000, accuracy: 0.6, strategy: 'defensive' },
            medium: { thinkingTime: 2000, accuracy: 0.8, strategy: 'balanced' },
            hard: { thinkingTime: 1500, accuracy: 0.9, strategy: 'aggressive' },
            expert: { thinkingTime: 1000, accuracy: 0.95, strategy: 'adaptive' }
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
        this.trainPredictionModel();
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
        
        console.log('AI Engine initialized successfully');
    }

    initializeWeights() {
        // وزن‌های اولیه برای ویژگی‌های مختلف
        return {
            fruitSimilarity: 0.8,
            distance: -0.3,
            specialFruit: 1.2,
            powerUp: 1.5,
            boardPosition: 0.2,
            playerAdvantage: -0.5,
            riskFactor: -0.7,
            comboPotential: 0.9,
            timePressure: 0.4,
            strategicValue: 1.1
        };
    }

    async loadTrainingData() {
        // داده‌های آموزشی از بازی‌های قبلی
        const trainingData = [
            // الگوهای موفق
            { features: [1, 0.8, 0, 0, 0.5, -0.2, 0.3, 0.7, 0.1, 0.9], success: 1 },
            { features: [0.9, 0.6, 1, 0, 0.3, 0.1, 0.2, 0.8, 0.2, 0.8], success: 1 },
            { features: [0.7, 0.9, 0, 1, 0.4, -0.3, 0.4, 0.6, 0.3, 0.7], success: 1 },
            
            // الگوهای ناموفق
            { features: [0.3, 0.2, 0, 0, 0.1, 0.8, 0.9, 0.1, 0.8, 0.2], success: 0 },
            { features: [0.4, 0.7, 0, 0, 0.6, 0.5, 0.7, 0.3, 0.6, 0.3], success: 0 },
            { features: [0.2, 0.4, 1, 0, 0.2, 0.9, 0.8, 0.2, 0.7, 0.1], success: 0 }
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
            connectionsNeeded: this.core.connectionsNeeded || 10,
            selectedFruits: this.core.selectedFruits || [],
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
                    isSpecial: fruitData.special || false,
                    isPowerUp: fruitData.powerUp || false,
                    isMatched: fruitData.matched || false
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
            return this.createObstacleMove();
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
        
        // بررسی فاصله (برای ساده‌سازی)
        const distance = BABYLON.Vector3.Distance(fruit1.position, fruit2.position);
        const maxDistance = 15; // حداکثر فاصله مجاز
        
        return distance <= maxDistance;
    }

    calculateMovePriority(fruit1, fruit2) {
        let priority = 0;
        
        // اولویت برای میوه‌های ویژه
        if (fruit1.isSpecial || fruit2.isSpecial) {
            priority += 50;
        }
        
        // اولویت برای پاورآپ‌ها
        if (fruit1.isPowerUp || fruit2.isPowerUp) {
            priority += 30;
        }
        
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
        
        // ارزش combo potential
        value += this.calculateComboPotential(fruit1, fruit2);
        
        // در نظر گرفتن مزیت بازیکن
        value -= this.calculatePlayerAdvantage() * 10;
        
        return value;
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

    calculatePlayerAdvantage() {
        const playerScore = this.gameState.playerScore;
        const aiScore = this.estimateAIScore();
        const timeLeft = this.gameState.timeLeft;
        
        // محاسبه مزیت بازیکن
        let advantage = (playerScore - aiScore) / 100;
        
        // در نظر گرفتن زمان (اگر زمان کم است، بازیکن تحت فشار است)
        if (timeLeft < 30) {
            advantage -= 0.5;
        }
        
        return advantage;
    }

    estimateAIScore() {
        // تخمین امتیاز AI بر اساس حرکات ممکن
        const possibleMoves = this.findAllPossibleMoves();
        let estimatedScore = 0;
        
        possibleMoves.forEach(move => {
            if (move.type === 'match') {
                estimatedScore += 50; // امتیاز پایه برای هر تطابق
                
                if (move.fruits[0].isSpecial || move.fruits[1].isSpecial) {
                    estimatedScore += 30;
                }
            }
        });
        
        return estimatedScore;
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
            
            // 1. شباهت میوه‌ها (همیشه 1 برای تطابق)
            features.push(1);
            
            // 2. فاصله (نرمالایز شده)
            const distance = BABYLON.Vector3.Distance(fruit1.position, fruit2.position);
            features.push(1 - (distance / 20));
            
            // 3. میوه ویژه
            features.push((fruit1.isSpecial || fruit2.isSpecial) ? 1 : 0);
            
            // 4. پاورآپ
            features.push((fruit1.isPowerUp || fruit2.isPowerUp) ? 1 : 0);
            
            // 5. موقعیت در صفحه
            const center = new BABYLON.Vector3(0, 0, 0);
            const avgPos = BABYLON.Vector3.Center(fruit1.position, fruit2.position);
            const distFromCenter = BABYLON.Vector3.Distance(avgPos, center);
            features.push(1 - (distFromCenter / 15));
            
            // 6. مزیت بازیکن
            features.push(this.calculatePlayerAdvantage());
            
            // 7. فاکتور ریسک
            features.push(this.calculateRiskFactor(move));
            
            // 8. پتانسیل کامبو
            features.push(this.calculateComboPotential(fruit1, fruit2) / 10);
            
            // 9. فشار زمانی
            features.push(1 - (this.gameState.timeLeft / 60));
            
            // 10. ارزش استراتژیک
            features.push(this.calculateStrategicValue(fruit1, fruit2) / 50);
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
            
            // ریسک بر اساس تعداد حرکات ممکن بعدی
            const remainingMoves = this.estimateRemainingMovesAfterMove(move);
            risk += (1 - remainingMoves / 10) * 0.5;
        }
        
        return Math.min(risk, 1);
    }

    getPositionRisk(position) {
        // موقعیت‌های مرکزی ریسک کمتری دارند
        const center = new BABYLON.Vector3(0, 0, 0);
        const distance = BABYLON.Vector3.Distance(position, center);
        
        return distance / 15; // نرمالایز شده
    }

    estimateRemainingMovesAfterMove(move) {
        // تخمین تعداد حرکات ممکن پس از این حرکت
        // این یک تخمین ساده است
        const currentMoves = this.findAllPossibleMoves().length;
        return Math.max(0, currentMoves - 3);
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
            case 'adaptive':
                return this.adaptiveStrategy(evaluatedMoves);
            case 'balanced':
            default:
                return this.balancedStrategy(evaluatedMoves);
        }
    }

    defensiveStrategy(moves) {
        // استراتژی دفاعی: جلوگیری از حرکات پرریسک
        const safeMoves = moves.filter(move => move.features[6] < 0.3); // ریسک کم
        return safeMoves.length > 0 ? safeMoves[0] : moves[0];
    }

    aggressiveStrategy(moves) {
        // استراتژی تهاجمی: حرکات با امتیاز بالا بدون در نظر گرفتن ریسک
        return moves[0];
    }

    balancedStrategy(moves) {
        // استراتژی متعادل: ترکیب امتیاز و ریسک
        const balancedMoves = moves.map(move => ({
            ...move,
            balancedScore: move.score * (1 - move.features[6] * 0.5) // کاهش امتیاز بر اساس ریسک
        })).sort((a, b) => b.balancedScore - a.balancedScore);
        
        return balancedMoves[0];
    }

    adaptiveStrategy(moves) {
        // استراتژی انطباقی: تغییر استراتژی بر اساس وضعیت بازی
        const playerAdvantage = this.calculatePlayerAdvantage();
        const timeLeft = this.gameState.timeLeft;
        
        if (playerAdvantage > 0.5) {
            // اگر بازیکن مزیت دارد، تهاجمی بازی کن
            return this.aggressiveStrategy(moves);
        } else if (timeLeft < 20) {
            // اگر زمان کم است، دفاعی بازی کن
            return this.defensiveStrategy(moves);
        } else {
            // در حالت عادی، متعادل بازی کن
            return this.balancedStrategy(moves);
        }
    }

    createObstacleMove() {
        // ایجاد مانع وقتی هیچ حرکتی ممکن نیست
        const availablePositions = this.core.gridPositions.filter(pos => !pos.occupied);
        
        if (availablePositions.length === 0) return null;
        
        // انتخاب موقعیتی که بیشترین تأثیر را در محدود کردن بازیکن دارد
        const bestPosition = this.findBestObstaclePosition(availablePositions);
        
        return {
            type: 'obstacle',
            position: bestPosition,
            priority: 100,
            score: 0.8
        };
    }

    findBestObstaclePosition(availablePositions) {
        let bestPosition = availablePositions[0];
        let bestScore = -1;
        
        availablePositions.forEach(position => {
            const score = this.evaluateObstaclePosition(position);
            if (score > bestScore) {
                bestScore = score;
                bestPosition = position;
            }
        });
        
        return bestPosition;
    }

    evaluateObstaclePosition(position) {
        let score = 0;
        
        // موقعیت مرکزی ارزش بیشتری دارد
        const center = new BABYLON.Vector3(0, 0, 0);
        const distanceFromCenter = BABYLON.Vector3.Distance(position.position, center);
        score += (10 - distanceFromCenter);
        
        // بررسی تأثیر بر حرکات ممکن بازیکن
        score += this.calculatePlayerMoveDisruption(position) * 20;
        
        // موقعیت‌های نزدیک به میوه‌های ویژه ارزش بیشتری دارند
        score += this.calculateSpecialFruitProximity(position) * 15;
        
        return score;
    }

    calculatePlayerMoveDisruption(position) {
        // تخمین تعداد حرکات بازیکن که با این مانع مسدود می‌شوند
        const playerMoves = this.estimatePlayerMoves();
        let disruptedMoves = 0;
        
        // این یک تخمین ساده است
        playerMoves.forEach(move => {
            const movePositions = move.fruits.map(fruit => fruit.gridIndex);
            if (movePositions.includes(position.index)) {
                disruptedMoves++;
            }
        });
        
        return disruptedMoves / playerMoves.length;
    }

    estimatePlayerMoves() {
        // تخمین حرکات ممکن بازیکن
        // این می‌تواند بر اساس الگوهای بازی بازیکن باشد
        return this.findAllPossibleMoves().slice(0, 5); // 5 حرکت اول
    }

    calculateSpecialFruitProximity(position) {
        // محاسبه نزدیکی به میوه‌های ویژه
        const specialFruits = this.gameState.fruits.filter(fruit => fruit.isSpecial);
        let proximityScore = 0;
        
        specialFruits.forEach(fruit => {
            const distance = BABYLON.Vector3.Distance(position.position, fruit.position);
            proximityScore += Math.max(0, 1 - distance / 5);
        });
        
        return proximityScore / Math.max(1, specialFruits.length);
    }

    recordMove(move) {
        const moveRecord = {
            move: move,
            gameState: { ...this.gameState },
            timestamp: Date.now(),
            difficulty: this.currentDifficulty,
            success: null // بعداً پر می‌شود
        };
        
        this.moveHistory.push(moveRecord);
        
        // محدود کردن اندازه تاریخچه
        if (this.moveHistory.length > 1000) {
            this.moveHistory.shift();
        }
        
        // به‌روزرسانی مدل یادگیری
        this.updateLearningModel(moveRecord);
    }

    updateLearningModel(moveRecord) {
        if (!this.predictionModel) return;
        
        // این یک پیاده‌سازی ساده از gradient descent است
        const features = moveRecord.move.features;
        const predicted = moveRecord.move.confidence;
        const actual = moveRecord.success !== null ? moveRecord.success : 0.5;
        
        // محاسبه error
        const error = actual - predicted;
        
        // به‌روزرسانی وزن‌ها
        Object.keys(this.predictionModel.weights).forEach((key, index) => {
            if (features[index] !== undefined) {
                this.predictionModel.weights[key] += 
                    this.learningRate * error * features[index];
            }
        });
        
        // به‌روزرسانی bias
        this.predictionModel.bias += this.learningRate * error;
    }

    async trainPredictionModel() {
        if (!this.trainingData || !this.predictionModel) return;
        
        console.log('Training AI prediction model...');
        
        // آموزش مدل با داده‌های آموزشی
        const epochs = 100;
        
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalError = 0;
            
            this.trainingData.forEach(data => {
                const predicted = this.predictMoveSuccess(data.features);
                const error = data.success - predicted;
                totalError += Math.abs(error);
                
                // به‌روزرسانی وزن‌ها
                Object.keys(this.predictionModel.weights).forEach((key, index) => {
                    if (data.features[index] !== undefined) {
                        this.predictionModel.weights[key] += 
                            this.learningRate * error * data.features[index];
                    }
                });
                
                this.predictionModel.bias += this.learningRate * error;
            });
            
            if (epoch % 20 === 0) {
                console.log(`Epoch ${epoch}, Average Error: ${totalError / this.trainingData.length}`);
            }
        }
        
        console.log('AI model training completed');
    }

    // متدهای اجرای حرکت
    async executeMove(move) {
        if (!move) return false;
        
        switch (move.type) {
            case 'match':
                return await this.executeMatchMove(move);
            case 'obstacle':
                return await this.executeObstacleMove(move);
            default:
                return false;
        }
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

    async executeObstacleMove(move) {
        // ایجاد مانع در موقعیت مشخص شده
        if (window.fruitManager) {
            window.fruitManager.createObstacleAtPosition(move.position);
        }
        
        // ثبت حرکت
        this.recordMoveSuccess(move, true);
        
        return true;
    }

    async simulateFruitClick(fruit) {
        // شبیه‌سازی کلیک روی میوه
        const fruitMesh = this.scene.getMeshByName(`fruit_${fruit.gridIndex}`);
        if (fruitMesh) {
            // trigger event کلیک
            if (this.core.onFruitSelected) {
                this.core.onFruitSelected(fruitMesh);
            }
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
        const failedMoves = this.moveHistory.filter(move => move.success === false).length;
        
        return {
            totalMoves: totalMoves,
            successRate: totalMoves > 0 ? successfulMoves / totalMoves : 0,
            failedMoves: failedMoves,
            currentDifficulty: this.currentDifficulty,
            learningRate: this.learningRate,
            modelAccuracy: this.calculateModelAccuracy()
        };
    }

    calculateModelAccuracy() {
        if (this.moveHistory.length < 10) return 0;
        
        const recentMoves = this.moveHistory.slice(-20);
        const correctPredictions = recentMoves.filter(move => {
            if (move.success === null) return false;
            const predictedSuccess = move.move.confidence > 0.5;
            return predictedSuccess === move.success;
        }).length;
        
        return correctPredictions / recentMoves.length;
    }

    generateGameAnalysis() {
        const stats = this.getPerformanceStats();
        const analysis = {
            summary: `AI Performance Analysis - Difficulty: ${this.currentDifficulty}`,
            stats: stats,
            strengths: this.identifyStrengths(),
            weaknesses: this.identifyWeaknesses(),
            recommendations: this.generateRecommendations()
        };
        
        return analysis;
    }

    identifyStrengths() {
        const strengths = [];
        const stats = this.getPerformanceStats();
        
        if (stats.successRate > 0.7) {
            strengths.push("دقت بالا در تشخیص تطابق‌ها");
        }
        
        if (this.moveHistory.length > 50) {
            strengths.push("یادگیری تطبیقی از تجربیات گذشته");
        }
        
        if (this.calculateModelAccuracy() > 0.6) {
            strengths.push("پیش‌بینی دقیق موفقیت حرکات");
        }
        
        return strengths.length > 0 ? strengths : ["در حال یادگیری و بهبود"];
    }

    identifyWeaknesses() {
        const weaknesses = [];
        
        if (this.moveHistory.some(move => move.move.features[6] > 0.7 && move.success === false)) {
            weaknesses.push("گاهی اوقات ریسک‌های غیرضروری می‌کند");
        }
        
        if (this.calculatePlayerAdvantage() > 0.3) {
            weaknesses.push("واکنش کند به مزیت بازیکن");
        }
        
        return weaknesses.length > 0 ? weaknesses : ["هیچ ضعف عمده‌ای شناسایی نشد"];
    }

    generateRecommendations() {
        const recommendations = [];
        const stats = this.getPerformanceStats();
        
        if (stats.successRate < 0.6) {
            recommendations.push("کاهش سطح سختی برای بهبود عملکرد");
        }
        
        if (this.moveHistory.length < 30) {
            recommendations.push("ادامه بازی برای جمع‌آوری داده‌های بیشتر");
        }
        
        if (this.calculateModelAccuracy() < 0.5) {
            recommendations.push("بازآموزی مدل پیش‌بینی");
        }
        
        return recommendations.length > 0 ? recommendations : ["ادامه بازی با تنظیمات فعلی"];
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
        
        this.strategies.set('adaptive', {
            evaluate: (move) => this.evaluateAdaptive(move),
            weight: 1.1
        });
    }

    evaluateDefensive(move) {
        let score = move.score;
        // جریمه برای حرکات پرریسک
        score -= move.features[6] * 0.3;
        // پاداش برای حرکات امن
        score += (1 - move.features[6]) * 0.2;
        return score;
    }

    evaluateAggressive(move) {
        let score = move.score;
        // پاداش برای حرکات با امتیاز بالا
        score += move.features[8] * 0.2; // فشار زمانی
        score += move.features[9] * 0.3; // ارزش استراتژیک
        return score;
    }

    evaluateBalanced(move) {
        // میانگین وزنی از تمام فاکتورها
        let score = move.score;
        score -= move.features[6] * 0.15; // ریسک متوسط
        score += move.features[7] * 0.1;  // پتانسیل کامبو
        return score;
    }

    evaluateAdaptive(move) {
        const gameState = this.aiEngine.gameState;
        const timeLeft = gameState.timeLeft;
        const playerAdvantage = this.aiEngine.calculatePlayerAdvantage();
        
        let score = move.score;
        
        if (timeLeft < 20) {
            // در زمان کم، دفاعی‌تر بازی کن
            score -= move.features[6] * 0.25;
        }
        
        if (playerAdvantage > 0.5) {
            // اگر بازیکن پیش است، تهاجمی‌تر بازی کن
            score += move.features[9] * 0.2;
        }
        
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