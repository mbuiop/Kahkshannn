class BuildingSystem {
    constructor(scene, resourceManager) {
        this.scene = scene;
        this.resourceManager = resourceManager;
        this.buildings = new Map();
        this.ghostMesh = null;
        this.currentBuildingType = null;
        this.buildGrid = this.initializeBuildGrid();
        this.constructionQueue = [];
        this.upgradeQueue = [];
        
        this.buildingConfig = {
            townhall: {
                name: "سالن شهر",
                levels: [
                    { hp: 1500, cost: { gold: 0, elixir: 0, gem: 0 }, buildTime: 0, size: 4 },
                    { hp: 2000, cost: { gold: 1000, elixir: 800, gem: 0 }, buildTime: 300, size: 4 },
                    { hp: 2500, cost: { gold: 2000, elixir: 1500, gem: 0 }, buildTime: 600, size: 4 }
                ],
                mesh: "townhall",
                type: "core",
                unlock: ["mine", "barracks", "wall"]
            },
            mine: {
                name: "معدن طلا",
                levels: [
                    { hp: 400, cost: { gold: 150, elixir: 0, gem: 0 }, buildTime: 60, production: 200, storage: 1000, size: 3 },
                    { hp: 600, cost: { gold: 300, elixir: 0, gem: 0 }, buildTime: 120, production: 400, storage: 2000, size: 3 },
                    { hp: 800, cost: { gold: 600, elixir: 0, gem: 0 }, buildTime: 240, production: 800, storage: 4000, size: 3 }
                ],
                mesh: "mine",
                type: "resource"
            },
            barracks: {
                name: "سربازخانه",
                levels: [
                    { hp: 500, cost: { gold: 200, elixir: 100, gem: 0 }, buildTime: 90, trainingCapacity: 1, size: 3 },
                    { hp: 700, cost: { gold: 400, elixir: 200, gem: 0 }, buildTime: 180, trainingCapacity: 2, size: 3 },
                    { hp: 900, cost: { gold: 800, elixir: 400, gem: 0 }, buildTime: 360, trainingCapacity: 3, size: 3 }
                ],
                mesh: "barracks",
                type: "military",
                unlock: ["soldier", "archer"]
            },
            wall: {
                name: "دیوار دفاعی",
                levels: [
                    { hp: 300, cost: { gold: 50, elixir: 0, gem: 0 }, buildTime: 30, size: 1 },
                    { hp: 500, cost: { gold: 100, elixir: 0, gem: 0 }, buildTime: 60, size: 1 },
                    { hp: 800, cost: { gold: 200, elixir: 0, gem: 0 }, buildTime: 120, size: 1 }
                ],
                mesh: "wall",
                type: "defense"
            },
            cannon: {
                name: "توپخانه",
                levels: [
                    { hp: 600, cost: { gold: 250, elixir: 100, gem: 0 }, buildTime: 120, damage: 50, range: 10, attackSpeed: 2, size: 2 },
                    { hp: 900, cost: { gold: 500, elixir: 200, gem: 0 }, buildTime: 240, damage: 75, range: 12, attackSpeed: 1.8, size: 2 },
                    { hp: 1200, cost: { gold: 1000, elixir: 400, gem: 0 }, buildTime: 480, damage: 100, range: 14, attackSpeed: 1.6, size: 2 }
                ],
                mesh: "cannon",
                type: "defense"
            },
            archertower: {
                name: "برج کماندار",
                levels: [
                    { hp: 500, cost: { gold: 300, elixir: 200, gem: 0 }, buildTime: 150, damage: 30, range: 12, attackSpeed: 1, size: 2 },
                    { hp: 750, cost: { gold: 600, elixir: 400, gem: 0 }, buildTime: 300, damage: 45, range: 14, attackSpeed: 0.9, size: 2 },
                    { hp: 1000, cost: { gold: 1200, elixir: 800, gem: 0 }, buildTime: 600, damage: 60, range: 16, attackSpeed: 0.8, size: 2 }
                ],
                mesh: "archertower",
                type: "defense"
            }
        };

        this.initializeBuildingSystem();
    }

    initializeBuildGrid() {
        const grid = {};
        const gridSize = 100;
        
        for (let x = -gridSize; x <= gridSize; x += 2) {
            for (let z = -gridSize; z <= gridSize; z += 2) {
                const key = `${x},${z}`;
                grid[key] = {
                    occupied: false,
                    buildingId: null,
                    type: 'ground',
                    position: new BABYLON.Vector3(x, 0, z)
                };
            }
        }
        return grid;
    }

    initializeBuildingSystem() {
        // Create initial town hall using placeBuilding instead
           const initialPos = new BABYLON.Vector3(0, 0, 0);
           this.placeBuilding('townhall', initialPos);
        
        // Set up construction timer
        setInterval(() => {
            this.updateConstructionQueue();
            this.updateUpgradeQueue();
        }, 1000);
    }

    startBuildingPlacement(buildingType) {
        this.currentBuildingType = buildingType;
        this.createGhostBuilding(buildingType);
        
        // Add event listener for placement
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && this.currentBuildingType) {
                const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
                if (pickResult.hit) {
                    this.placeBuilding(this.currentBuildingType, pickResult.pickedPoint);
                }
            }
        });
    }

    createGhostBuilding(buildingType) {
        if (this.ghostMesh) {
            this.ghostMesh.dispose();
        }

        const config = this.buildingConfig[buildingType];
        const levelConfig = config.levels[0];
        
        // Create transparent ghost mesh
        this.ghostMesh = BABYLON.MeshBuilder.CreateBox("ghostBuilding", {
            width: levelConfig.size,
            height: 2,
            depth: levelConfig.size
        }, this.scene);

        const ghostMaterial = new BABYLON.StandardMaterial("ghostMat", this.scene);
        ghostMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        ghostMaterial.alpha = 0.5;
        this.ghostMesh.material = ghostMaterial;

        // Follow mouse position
        this.scene.onPointerMove = (evt) => {
            if (this.ghostMesh && this.currentBuildingType) {
                const pickResult = this.scene.pick(evt.clientX, evt.clientY);
                if (pickResult.hit) {
                    const snappedPos = this.snapToGrid(pickResult.pickedPoint);
                    this.ghostMesh.position = snappedPos;
                    
                    // Check if position is valid
                    const isValid = this.isValidBuildingPosition(snappedPos, buildingType);
                    ghostMaterial.diffuseColor = isValid ? 
                        new BABYLON.Color3(0, 1, 0) : 
                        new BABYLON.Color3(1, 0, 0);
                }
            }
        };
    }

    snapToGrid(position) {
        const gridSize = 2;
        const x = Math.round(position.x / gridSize) * gridSize;
        const z = Math.round(position.z / gridSize) * gridSize;
        return new BABYLON.Vector3(x, 0.5, z);
    }

    isValidBuildingPosition(position, buildingType) {
        const config = this.buildingConfig[buildingType];
        const levelConfig = config.levels[0];
        const size = levelConfig.size;
        
        // Check grid boundaries
        for (let x = position.x - size/2; x <= position.x + size/2; x += 2) {
            for (let z = position.z - size/2; z <= position.z + size/2; z += 2) {
                const key = `${x},${z}`;
                if (!this.buildGrid[key] || this.buildGrid[key].occupied) {
                    return false;
                }
            }
        }
        
        return true;
    }

    placeBuilding(buildingType, position) {
        const snappedPos = this.snapToGrid(position);
        
        if (!this.isValidBuildingPosition(snappedPos, buildingType)) {
            this.showErrorMessage("مکان انتخاب شده نامعتبر است!");
            return false;
        }

        const config = this.buildingConfig[buildingType];
        const levelConfig = config.levels[0];
        
        if (!this.resourceManager.canAfford(levelConfig.cost)) {
            this.showErrorMessage("منابع کافی ندارید!");
            return false;
        }

        // Create building
        const buildingId = this.generateBuildingId();
        const building = {
            id: buildingId,
            type: buildingType,
            level: 1,
            position: snappedPos,
            hp: levelConfig.hp,
            maxHp: levelConfig.hp,
            constructionTime: levelConfig.buildTime,
            constructionProgress: 0,
            isConstructing: levelConfig.buildTime > 0,
            config: config,
            levelConfig: levelConfig,
            mesh: null
        };

        // Spend resources
        this.resourceManager.spendResources(levelConfig.cost);

        // Add to construction queue
        if (building.isConstructing) {
            this.constructionQueue.push(building);
            this.createConstructionSite(building);
        } else {
            this.finalizeBuilding(building);
        }

        // Update grid
        this.updateBuildGrid(building, true);

        this.buildings.set(buildingId, building);
        this.onBuildingPlaced(building);
        
        return true;
    }

    createConstructionSite(building) {
        const size = building.levelConfig.size;
        
        // Create construction scaffold
        const scaffold = BABYLON.MeshBuilder.CreateBox("scaffold", {
            width: size,
            height: 0.5,
            depth: size
        }, this.scene);
        
        scaffold.position = building.position.clone();
        scaffold.position.y = 0.25;
        
        const scaffoldMat = new BABYLON.StandardMaterial("scaffoldMat", this.scene);
        scaffoldMat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
        scaffold.material = scaffoldMat;

        // Create construction workers
        this.createConstructionWorkers(building.position, size);
        
        building.scaffoldMesh = scaffold;
        building.constructionStartTime = Date.now();
    }

    createConstructionWorkers(position, size) {
        // Create animated worker meshes
        for (let i = 0; i < 3; i++) {
            const worker = BABYLON.MeshBuilder.CreateCylinder("worker", {
                height: 1.5,
                diameter: 0.3
            }, this.scene);
            
            worker.position = position.clone();
            worker.position.x += (Math.random() - 0.5) * (size - 1);
            worker.position.z += (Math.random() - 0.5) * (size - 1);
            worker.position.y = 0.75;
            
            const workerMat = new BABYLON.StandardMaterial("workerMat", this.scene);
            workerMat.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.8);
            worker.material = workerMat;

            // Simple animation
            this.animateConstructionWorker(worker, position, size);
        }
    }

    animateConstructionWorker(worker, center, areaSize) {
        const startPos = worker.position.clone();
        const animation = new BABYLON.Animation(
            "workerAnimation",
            "position",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keys = [];
        keys.push({ frame: 0, value: startPos });
        keys.push({ 
            frame: 30, 
            value: new BABYLON.Vector3(
                center.x + (Math.random() - 0.5) * (areaSize - 1),
                0.75,
                center.z + (Math.random() - 0.5) * (areaSize - 1)
            )
        });

        animation.setKeys(keys);
        worker.animations = [animation];
        this.scene.beginAnimation(worker, 0, 30, true);
    }

    updateConstructionQueue() {
        const now = Date.now();
        
        for (let i = this.constructionQueue.length - 1; i >= 0; i--) {
            const building = this.constructionQueue[i];
            const elapsed = (now - building.constructionStartTime) / 1000;
            building.constructionProgress = elapsed / building.constructionTime;
            
            if (elapsed >= building.constructionTime) {
                this.finalizeBuilding(building);
                this.constructionQueue.splice(i, 1);
            }
        }
    }

    finalizeBuilding(building) {
        // Remove scaffold
        if (building.scaffoldMesh) {
            building.scaffoldMesh.dispose();
        }

        // Create final building mesh
        this.createBuildingMesh(building);
        
        building.isConstructing = false;
        building.constructionProgress = 1;
        
        // Show completion effect
        this.showConstructionCompleteEffect(building.position);
        
        // Update production if resource building
        if (building.type === 'mine') {
            this.resourceManager.setProductionRate('gold', 
                building.levelConfig.production / 60); // Convert to per second
        }
        
        this.onBuildingCompleted(building);
    }

    createBuildingMesh(building) {
        const config = building.config;
        const meshName = `${config.mesh}_l${building.level}`;
        
        // In a real game, you would load GLB/GLTF models here
        // For now, we'll create primitive meshes
        
        let mesh;
        const size = building.levelConfig.size;
        
        switch(building.type) {
            case 'townhall':
                mesh = BABYLON.MeshBuilder.CreateBox(meshName, {
                    width: size,
                    height: 3,
                    depth: size
                }, this.scene);
                const townhallMat = new BABYLON.StandardMaterial("townhallMat", this.scene);
                townhallMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0.2);
                mesh.material = townhallMat;
                break;
                
            case 'mine':
                mesh = BABYLON.MeshBuilder.CreateCylinder(meshName, {
                    height: 2,
                    diameter: size
                }, this.scene);
                const mineMat = new BABYLON.StandardMaterial("mineMat", this.scene);
                mineMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
                mesh.material = mineMat;
                break;
                
            case 'barracks':
                mesh = BABYLON.MeshBuilder.CreateBox(meshName, {
                    width: size,
                    height: 2,
                    depth: size
                }, this.scene);
                const barracksMat = new BABYLON.StandardMaterial("barracksMat", this.scene);
                barracksMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1);
                mesh.material = barracksMat;
                break;
                
            case 'wall':
                mesh = BABYLON.MeshBuilder.CreateBox(meshName, {
                    width: size,
                    height: 1,
                    depth: 0.5
                }, this.scene);
                const wallMat = new BABYLON.StandardMaterial("wallMat", this.scene);
                wallMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
                mesh.material = wallMat;
                break;
                
            case 'cannon':
                mesh = BABYLON.MeshBuilder.CreateCylinder(meshName, {
                    height: 1.5,
                    diameter: size
                }, this.scene);
                const cannonMat = new BABYLON.StandardMaterial("cannonMat", this.scene);
                cannonMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                mesh.material = cannonMat;
                break;
                
            case 'archertower':
                mesh = BABYLON.MeshBuilder.CreateCylinder(meshName, {
                    height: 3,
                    diameter: size
                }, this.scene);
                const towerMat = new BABYLON.StandardMaterial("towerMat", this.scene);
                towerMat.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
                mesh.material = towerMat;
                break;
        }
        
        if (mesh) {
            mesh.position = building.position.clone();
            mesh.position.y = mesh.getBoundingInfo().boundingBox.extendSize.y;
            building.mesh = mesh;
            
            // Enable shadows
            if (window.gameEngine && window.gameEngine.shadowGenerator) {
                window.gameEngine.shadowGenerator.addShadowCaster(mesh);
            }
            
            // Add click event
            mesh.actionManager = new BABYLON.ActionManager(this.scene);
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    () => this.onBuildingClicked(building)
                )
            );
        }
    }

    showConstructionCompleteEffect(position) {
        // Create celebration particles
        if (window.gameEngine) {
            window.gameEngine.createParticleSystem('magic', position);
        }
        
        // Show completion message
        this.showSuccessMessage("ساختمان با موفقیت ساخته شد! 🎉");
        
        // Play sound effect
        this.playSound('construction_complete');
    }

    onBuildingClicked(building) {
        this.showBuildingInfoPanel(building);
    }

    showBuildingInfoPanel(building) {
        // Create info panel UI
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "300px";
        panel.height = "200px";
        panel.background = "rgba(0,0,0,0.8)";
        panel.color = "white";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.left = "20px";
        panel.top = "100px";
        advancedTexture.addControl(panel);

        // Building name
        const nameText = new BABYLON.GUI.TextBlock();
        nameText.text = building.config.name + " سطح " + building.level;
        nameText.color = "gold";
        nameText.fontSize = 24;
        nameText.height = "40px";
        panel.addControl(nameText);

        // HP
        const hpText = new BABYLON.GUI.TextBlock();
        hpText.text = `سلامت: ${building.hp}/${building.maxHp}`;
        hpText.color = "lime";
        hpText.height = "30px";
        panel.addControl(hpText);

        // Upgrade button
        if (building.level < building.config.levels.length) {
            const nextLevel = building.level + 1;
            const nextLevelConfig = building.config.levels[nextLevel - 1];
            
            const upgradeButton = BABYLON.GUI.Button.CreateSimpleButton("upgrade", "ارتقا به سطح " + nextLevel);
            upgradeButton.width = "200px";
            upgradeButton.height = "40px";
            upgradeButton.color = "white";
            upgradeButton.background = "green";
            upgradeButton.onPointerClickObservable.add(() => {
                this.upgradeBuilding(building.id);
                advancedTexture.removeControl(panel);
            });
            panel.addControl(upgradeButton);

            // Cost
            const costText = new BABYLON.GUI.TextBlock();
            costText.text = `هزینه: ${nextLevelConfig.cost.gold} طلا`;
            costText.color = "gold";
            costText.height = "25px";
            panel.addControl(costText);
        }

        // Close button
        const closeButton = BABYLON.GUI.Button.CreateSimpleButton("close", "بستن");
        closeButton.width = "100px";
        closeButton.height = "30px";
        closeButton.color = "white";
        closeButton.background = "red";
        closeButton.onPointerClickObservable.add(() => {
            advancedTexture.removeControl(panel);
        });
        panel.addControl(closeButton);

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (advancedTexture.containsControl(panel)) {
                advancedTexture.removeControl(panel);
            }
        }, 10000);
    }

    upgradeBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return false;

        const nextLevel = building.level + 1;
        if (nextLevel > building.config.levels.length) {
            this.showErrorMessage("ساختمان در حداکثر سطح است!");
            return false;
        }

        const nextLevelConfig = building.config.levels[nextLevel - 1];
        
        if (!this.resourceManager.canAfford(nextLevelConfig.cost)) {
            this.showErrorMessage("منابع کافی برای ارتقا ندارید!");
            return false;
        }

        // Spend resources
        this.resourceManager.spendResources(nextLevelConfig.cost);

        // Add to upgrade queue
        building.upgradeTime = nextLevelConfig.buildTime;
        building.upgradeProgress = 0;
        building.isUpgrading = true;
        building.upgradeStartTime = Date.now();
        
        this.upgradeQueue.push(building);
        
        this.showSuccessMessage(`ارتقای ${building.config.name} آغاز شد!`);
        return true;
    }

    updateUpgradeQueue() {
        const now = Date.now();
        
        for (let i = this.upgradeQueue.length - 1; i >= 0; i--) {
            const building = this.upgradeQueue[i];
            const elapsed = (now - building.upgradeStartTime) / 1000;
            building.upgradeProgress = elapsed / building.upgradeTime;
            
            if (elapsed >= building.upgradeTime) {
                this.finalizeUpgrade(building);
                this.upgradeQueue.splice(i, 1);
            }
        }
    }

    finalizeUpgrade(building) {
        const nextLevel = building.level + 1;
        const nextLevelConfig = building.config.levels[nextLevel - 1];
        
        // Update building properties
        building.level = nextLevel;
        building.levelConfig = nextLevelConfig;
        building.hp = nextLevelConfig.hp;
        building.maxHp = nextLevelConfig.hp;
        building.isUpgrading = false;
        
        // Update mesh
        if (building.mesh) {
            building.mesh.dispose();
        }
        this.createBuildingMesh(building);
        
        // Show upgrade effect
        this.showUpgradeCompleteEffect(building.position);
        
        this.onBuildingUpgraded(building);
    }

    showUpgradeCompleteEffect(position) {
        if (window.gameEngine) {
            window.gameEngine.createExplosion(position, 0.5);
        }
        
        this.showSuccessMessage("ارتقا با موفقیت تکمیل شد! ⭐");
        this.playSound('upgrade_complete');
    }

    damageBuilding(buildingId, damage) {
        const building = this.buildings.get(buildingId);
        if (!building) return false;

        building.hp = Math.max(0, building.hp - damage);
        
        // Show damage effect
        this.showDamageEffect(building.position);
        
        if (building.hp <= 0) {
            this.destroyBuilding(buildingId);
            return true; // Building destroyed
        }
        
        return false; // Building still standing
    }

    destroyBuilding(buildingId) {
        const building = this.buildings.get(buildingId);
        if (!building) return;

        // Show destruction effect
        this.showDestructionEffect(building.position);
        
        // Remove from grid
        this.updateBuildGrid(building, false);
        
        // Remove mesh
        if (building.mesh) {
            building.mesh.dispose();
        }
        
        // Remove from queues
        this.constructionQueue = this.constructionQueue.filter(b => b.id !== buildingId);
        this.upgradeQueue = this.upgradeQueue.filter(b => b.id !== buildingId);
        
        // Remove from buildings map
        this.buildings.delete(buildingId);
        
        this.onBuildingDestroyed(building);
    }

    showDamageEffect(position) {
        // Create hit particles
        if (window.gameEngine) {
            window.gameEngine.createParticleSystem('fire', position);
        }
        
        // Screen shake for large damage
        if (window.gameEngine) {
            window.gameEngine.cameraShake(0.1);
        }
    }

    showDestructionEffect(position) {
        // Large explosion
        if (window.gameEngine) {
            window.gameEngine.createExplosion(position, 1.0);
        }
        
        // Smoke
        if (window.gameEngine) {
            window.gameEngine.createParticleSystem('smoke', position);
        }
        
        this.playSound('building_destroyed');
    }

    // Utility methods
    generateBuildingId() {
        return 'building_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateBuildGrid(building, occupied) {
        const size = building.levelConfig.size;
        const position = building.position;
        
        for (let x = position.x - size/2; x <= position.x + size/2; x += 2) {
            for (let z = position.z - size/2; z <= position.z + size/2; z += 2) {
                const key = `${x},${z}`;
                if (this.buildGrid[key]) {
                    this.buildGrid[key].occupied = occupied;
                    this.buildGrid[key].buildingId = occupied ? building.id : null;
                }
            }
        }
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const colors = {
            error: '#ff4444',
            success: '#44ff44',
            info: '#4444ff'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${colors[type]};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            text-align: center;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }

    playSound(soundName) {
        // In a real game, you would play actual sound files
        console.log(`Playing sound: ${soundName}`);
    }

    // Event handlers
    onBuildingPlaced(building) {
        console.log(`Building placed: ${building.type} at ${building.position}`);
    }

    onBuildingCompleted(building) {
        console.log(`Building completed: ${building.type}`);
    }

    onBuildingUpgraded(building) {
        console.log(`Building upgraded: ${building.type} to level ${building.level}`);
    }

    onBuildingDestroyed(building) {
        console.log(`Building destroyed: ${building.type}`);
    }

    // Save/load system
    save() {
        const saveData = {
            buildings: Array.from(this.buildings.entries()),
            constructionQueue: this.constructionQueue,
            upgradeQueue: this.upgradeQueue,
            buildGrid: this.buildGrid
        };
        
        localStorage.setItem('buildingSystem', JSON.stringify(saveData));
        return saveData;
    }

    load() {
        const saved = localStorage.getItem('buildingSystem');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                
                // Rebuild buildings
                saveData.buildings.forEach(([id, buildingData]) => {
                    this.buildings.set(id, buildingData);
                    if (buildingData.mesh) {
                        this.createBuildingMesh(buildingData);
                    }
                });
                
                this.constructionQueue = saveData.constructionQueue || [];
                this.upgradeQueue = saveData.upgradeQueue || [];
                this.buildGrid = saveData.buildGrid || this.buildGrid;
                
                return true;
            } catch (e) {
                console.error('Error loading building data:', e);
            }
        }
        return false;
    }

    getBuildingAtPosition(position) {
        const key = `${Math.round(position.x)},${Math.round(position.z)}`;
        const gridCell = this.buildGrid[key];
        
        if (gridCell && gridCell.buildingId) {
            return this.buildings.get(gridCell.buildingId);
        }
        
        return null;
    }

    getBuildingsByType(type) {
        return Array.from(this.buildings.values()).filter(building => 
            building.type === type && !building.isConstructing
        );
    }

    getDefensiveBuildings() {
        return this.getBuildingsByType('cannon')
            .concat(this.getBuildingsByType('archertower'))
            .concat(this.getBuildingsByType('wall'));
    }

    getResourceBuildings() {
        return this.getBuildingsByType('mine');
    }

    getMilitaryBuildings() {
        return this.getBuildingsByType('barracks');
    }

    // Advanced building analytics
    getBuildingStatistics() {
        const stats = {
            total: this.buildings.size,
            byType: {},
            underConstruction: this.constructionQueue.length,
            upgrading: this.upgradeQueue.length,
            totalHP: 0,
            averageLevel: 0
        };

        let totalLevel = 0;
        
        this.buildings.forEach(building => {
            if (!stats.byType[building.type]) {
                stats.byType[building.type] = {
                    count: 0,
                    totalHP: 0,
                    averageLevel: 0
                };
            }
            
            stats.byType[building.type].count++;
            stats.byType[building.type].totalHP += building.hp;
            stats.totalHP += building.hp;
            totalLevel += building.level;
        });

        // Calculate averages
        Object.keys(stats.byType).forEach(type => {
            const typeStats = stats.byType[type];
            typeStats.averageLevel = typeStats.totalLevel / typeStats.count;
        });

        stats.averageLevel = totalLevel / stats.total;

        return stats;
    }

    // Auto-arrangement system
    autoArrangeBuildings() {
        const center = new BABYLON.Vector3(0, 0, 0);
        const defensiveBuildings = this.getDefensiveBuildings();
        const resourceBuildings = this.getResourceBuildings();
        const militaryBuildings = this.getMilitaryBuildings();

        // Arrange defensive buildings in a circle
        const defenseRadius = 20;
        defensiveBuildings.forEach((building, index) => {
            const angle = (index / defensiveBuildings.length) * Math.PI * 2;
            const newPos = new BABYLON.Vector3(
                center.x + Math.cos(angle) * defenseRadius,
                0,
                center.z + Math.sin(angle) * defenseRadius
            );
            this.moveBuilding(building.id, newPos);
        });

        // Arrange resource buildings in inner ring
        const resourceRadius = 12;
        resourceBuildings.forEach((building, index) => {
            const angle = (index / resourceBuildings.length) * Math.PI * 2;
            const newPos = new BABYLON.Vector3(
                center.x + Math.cos(angle) * resourceRadius,
                0,
                center.z + Math.sin(angle) * resourceRadius
            );
            this.moveBuilding(building.id, newPos);
        });

        this.showSuccessMessage("چیدمان خودکار ساختمان‌ها انجام شد! 🏗️");
    }

    moveBuilding(buildingId, newPosition) {
        const building = this.buildings.get(buildingId);
        if (!building) return false;

        const snappedPos = this.snapToGrid(newPosition);
        
        // Free old grid positions
        this.updateBuildGrid(building, false);
        
        // Check if new position is valid
        if (!this.isValidBuildingPosition(snappedPos, building.type)) {
            this.updateBuildGrid(building, true); // Re-occupy old position
            return false;
        }

        // Update position
        building.position = snappedPos;
        if (building.mesh) {
            building.mesh.position = snappedPos.clone();
            building.mesh.position.y = building.mesh.getBoundingInfo().boundingBox.extendSize.y;
        }

        // Occupy new grid positions
        this.updateBuildGrid(building, true);

        return true;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuildingSystem;
    }
