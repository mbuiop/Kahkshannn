class ResourceManager {
    constructor() {
        this.resources = {
            gold: 1000,
            elixir: 1000,
            gem: 50,
            darkElixir: 0
        };

        this.storage = {
            gold: 5000,
            elixir: 5000,
            gem: 1000,
            darkElixir: 1000
        };

        this.productionRates = {
            gold: 10,    // per minute
            elixir: 8,   // per minute
            gem: 0.1,    // per minute
            darkElixir: 0
        };

        this.lastUpdateTime = Date.now();
        this.initializeAutoProduction();
    }

    initializeAutoProduction() {
        setInterval(() => {
            this.updateAutoProduction();
        }, 1000); // Update every second
    }

    updateAutoProduction() {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000 / 60; // Convert to minutes
        
        Object.keys(this.productionRates).forEach(resource => {
            if (this.productionRates[resource] > 0) {
                const production = this.productionRates[resource] * deltaTime;
                this.addResource(resource, production);
            }
        });

        this.lastUpdateTime = now;
    }

    addResource(type, amount) {
        if (this.resources.hasOwnProperty(type)) {
            const newAmount = this.resources[type] + amount;
            this.resources[type] = Math.min(newAmount, this.storage[type]);
            this.updateUI();
            return true;
        }
        return false;
    }

    spendResource(type, amount) {
        if (this.hasEnough(type, amount)) {
            this.resources[type] -= amount;
            this.updateUI();
            
            // Visual feedback
            this.createResourceSpendEffect(type, amount);
            return true;
        }
        return false;
    }

    hasEnough(type, amount) {
        return this.resources[type] >= amount;
    }

    canAfford(costs) {
        for (const [resource, amount] of Object.entries(costs)) {
            if (!this.hasEnough(resource, amount)) {
                return false;
            }
        }
        return true;
    }

    spendResources(costs) {
        if (!this.canAfford(costs)) {
            return false;
        }

        for (const [resource, amount] of Object.entries(costs)) {
            this.spendResource(resource, amount);
        }
        
        return true;
    }

    setProductionRate(resource, rate) {
        if (this.productionRates.hasOwnProperty(resource)) {
            this.productionRates[resource] = rate;
        }
    }

    upgradeStorage(resource, newCapacity) {
        if (this.storage.hasOwnProperty(resource)) {
            this.storage[resource] = newCapacity;
            this.updateUI();
        }
    }

    getStoragePercentage(resource) {
        return (this.resources[resource] / this.storage[resource]) * 100;
    }

    isStorageFull(resource) {
        return this.resources[resource] >= this.storage[resource];
    }

    updateUI() {
        // Update HTML elements
        const goldElement = document.getElementById('goldAmount');
        const elixirElement = document.getElementById('elixirAmount');
        const gemElement = document.getElementById('gemAmount');

        if (goldElement) goldElement.textContent = Math.floor(this.resources.gold);
        if (elixirElement) elixirElement.textContent = Math.floor(this.resources.elixir);
        if (gemElement) gemElement.textContent = Math.floor(this.resources.gem);

        // Visual feedback for resource changes
        this.animateResourceChange();
    }

    animateResourceChange() {
        const elements = {
            gold: document.getElementById('goldAmount'),
            elixir: document.getElementById('elixirAmount'),
            gem: document.getElementById('gemAmount')
        };

        Object.values(elements).forEach(element => {
            if (element) {
                element.style.transform = 'scale(1.2)';
                element.style.color = '#ffd700';
                
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    element.style.color = 'white';
                }, 300);
            }
        });
    }

    createResourceSpendEffect(type, amount) {
        const resourceConfig = {
            gold: { color: '#FFD700', emoji: '💰' },
            elixir: { color: '#E52E71', emoji: '⚗️' },
            gem: { color: '#00FF88', emoji: '💎' },
            darkElixir: { color: '#8A2BE2', emoji: '⚫' }
        };

        const config = resourceConfig[type];
        if (!config) return;

        // Create floating text effect
        this.createFloatingText(`-${Math.floor(amount)}`, config.color, config.emoji);
    }

    createFloatingText(text, color, emoji) {
        const floatingText = document.createElement('div');
        floatingText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${color};
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            z-index: 1000;
            pointer-events: none;
            opacity: 1;
            transition: all 1s ease-out;
        `;
        floatingText.innerHTML = `${emoji} ${text}`;
        
        document.body.appendChild(floatingText);

        // Animate
        setTimeout(() => {
            floatingText.style.transform = 'translate(-50%, -100px)';
            floatingText.style.opacity = '0';
        }, 100);

        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(floatingText);
        }, 1100);
    }

    collectAllResources() {
        let totalCollected = 0;
        
        Object.keys(this.resources).forEach(resource => {
            if (resource !== 'gem') { // Don't collect gems automatically
                const collectionAmount = this.resources[resource] * 0.1; // Collect 10%
                this.addResource(resource, collectionAmount);
                totalCollected += collectionAmount;
            }
        });

        if (totalCollected > 0) {
            this.createCollectionEffect();
        }
        
        return totalCollected;
    }

    createCollectionEffect() {
        // Create particle-like collection effect
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createFloatingText('+', '#00FF00', '⭐');
            }, i * 100);
        }
    }

    // Save/load system
    save() {
        const saveData = {
            resources: this.resources,
            storage: this.storage,
            productionRates: this.productionRates,
            timestamp: Date.now()
        };
        
        localStorage.setItem('resourceManager', JSON.stringify(saveData));
        return saveData;
    }

    load() {
        const saved = localStorage.getItem('resourceManager');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                this.resources = saveData.resources || this.resources;
                this.storage = saveData.storage || this.storage;
                this.productionRates = saveData.productionRates || this.productionRates;
                
                // Calculate offline production
                if (saveData.timestamp) {
                    const offlineTime = (Date.now() - saveData.timestamp) / 1000 / 60; // minutes
                    this.calculateOfflineProduction(offlineTime);
                }
                
                this.updateUI();
                return true;
            } catch (e) {
                console.error('Error loading resource data:', e);
            }
        }
        return false;
    }

    calculateOfflineProduction(offlineMinutes) {
        Object.keys(this.productionRates).forEach(resource => {
            if (this.productionRates[resource] > 0) {
                const production = this.productionRates[resource] * offlineMinutes;
                this.addResource(resource, production);
            }
        });
    }

    // Advanced resource trading system
    tradeResources(fromResource, toResource, amount) {
        if (!this.hasEnough(fromResource, amount)) {
            return false;
        }

        const exchangeRates = {
            gold: { elixir: 1.0, gem: 0.01 },
            elixir: { gold: 1.0, gem: 0.01 },
            gem: { gold: 100, elixir: 100 }
        };

        const rate = exchangeRates[fromResource]?.[toResource];
        if (!rate) {
            return false;
        }

        const receivedAmount = amount * rate;
        
        this.spendResource(fromResource, amount);
        this.addResource(toResource, receivedAmount);

        // Trade effect
        this.createTradeEffect(fromResource, toResource, amount, receivedAmount);
        
        return receivedAmount;
    }

    createTradeEffect(fromResource, toResource, sent, received) {
        const resourceConfig = {
            gold: { color: '#FFD700', emoji: '💰' },
            elixir: { color: '#E52E71', emoji: '⚗️' },
            gem: { color: '#00FF88', emoji: '💎' }
        };

        const fromConfig = resourceConfig[fromResource];
        const toConfig = resourceConfig[toResource];

        if (fromConfig && toConfig) {
            this.createFloatingText(`-${sent}`, fromConfig.color, fromConfig.emoji);
            
            setTimeout(() => {
                this.createFloatingText(`+${received.toFixed(1)}`, toConfig.color, toConfig.emoji);
            }, 500);
        }
    }

    // Resource prediction and analytics
    getTimeToFull(resource) {
        if (this.productionRates[resource] <= 0) return Infinity;
        
        const remaining = this.storage[resource] - this.resources[resource];
        return remaining / this.productionRates[resource]; // in minutes
    }

    getProductionEfficiency() {
        let totalProduction = 0;
        let totalStorage = 0;
        
        Object.keys(this.productionRates).forEach(resource => {
            totalProduction += this.productionRates[resource];
            totalStorage += this.storage[resource];
        });

        return {
            totalProduction,
            totalStorage,
            efficiency: totalProduction / totalStorage
        };
    }

    // Event system for resource changes
    onResourceChange(callback) {
        this.resourceChangeCallbacks = this.resourceChangeCallbacks || [];
        this.resourceChangeCallbacks.push(callback);
    }

    notifyResourceChange(type, oldValue, newValue) {
        if (this.resourceChangeCallbacks) {
            this.resourceChangeCallbacks.forEach(callback => {
                callback(type, oldValue, newValue);
            });
        }
    }
}

// Enhanced resource manager with additional features
class AdvancedResourceManager extends ResourceManager {
    constructor() {
        super();
        this.resourceEvents = [];
        this.achievements = new Set();
        this.initializeAchievements();
    }

    initializeAchievements() {
        // Track resource-related achievements
        this.achievementThresholds = {
            gold: [1000, 5000, 10000, 50000, 100000],
            elixir: [1000, 5000, 10000, 50000, 100000],
            gem: [100, 500, 1000, 5000, 10000]
        };
    }

    addResource(type, amount) {
        const oldValue = this.resources[type];
        const success = super.addResource(type, amount);
        
        if (success) {
            this.recordResourceEvent(type, 'gain', amount);
            this.checkAchievements(type, this.resources[type]);
            this.notifyResourceChange(type, oldValue, this.resources[type]);
        }
        
        return success;
    }

    spendResource(type, amount) {
        const oldValue = this.resources[type];
        const success = super.spendResource(type, amount);
        
        if (success) {
            this.recordResourceEvent(type, 'spend', amount);
            this.notifyResourceChange(type, oldValue, this.resources[type]);
        }
        
        return success;
    }

    recordResourceEvent(type, action, amount) {
        this.resourceEvents.push({
            type,
            action,
            amount,
            timestamp: Date.now(),
            balance: this.resources[type]
        });

        // Keep only last 100 events
        if (this.resourceEvents.length > 100) {
            this.resourceEvents.shift();
        }
    }

    checkAchievements(type, currentAmount) {
        const thresholds = this.achievementThresholds[type];
        if (!thresholds) return;

        thresholds.forEach(threshold => {
            if (currentAmount >= threshold) {
                const achievementKey = `${type}_${threshold}`;
                if (!this.achievements.has(achievementKey)) {
                    this.achievements.add(achievementKey);
                    this.unlockAchievement(`جمع‌آوری ${threshold} ${type}`);
                }
            }
        });
    }

    unlockAchievement(achievementName) {
        // Show achievement notification
        this.showAchievementNotification(achievementName);
        
        // Award bonus
        this.addResource('gem', 10);
    }

    showAchievementNotification(achievementName) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.5s ease;
            border-right: 4px solid gold;
        `;
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">🏆 دستاورد جدید!</div>
            <div>${achievementName}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">+10 💎 پاداش</div>
        `;
        
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    getResourceHistory(type, timeRange = 'day') {
        const now = Date.now();
        let rangeMillis;

        switch (timeRange) {
            case 'hour': rangeMillis = 60 * 60 * 1000; break;
            case 'day': rangeMillis = 24 * 60 * 60 * 1000; break;
            case 'week': rangeMillis = 7 * 24 * 60 * 60 * 1000; break;
            default: rangeMillis = 24 * 60 * 60 * 1000;
        }

        return this.resourceEvents
            .filter(event => 
                event.type === type && 
                event.timestamp > now - rangeMillis
            )
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    getResourceStatistics(type) {
        const history = this.getResourceHistory(type, 'day');
        const gains = history.filter(e => e.action === 'gain').reduce((sum, e) => sum + e.amount, 0);
        const spends = history.filter(e => e.action === 'spend').reduce((sum, e) => sum + e.amount, 0);
        
        return {
            totalGains: gains,
            totalSpends: spends,
            netChange: gains - spends,
            transactions: history.length,
            averageGain: gains / (history.filter(e => e.action === 'gain').length || 1),
            averageSpend: spends / (history.filter(e => e.action === 'spend').length || 1)
        };
    }

    predictFutureResource(type, hours = 24) {
        const stats = this.getResourceStatistics(type);
        const current = this.resources[type];
        const production = this.productionRates[type] * 60 * hours; // Convert to target hours
        
        return {
            current,
            predicted: current + production + stats.netChange,
            productionGain: production,
            transactionNet: stats.netChange
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResourceManager, AdvancedResourceManager };
            }
