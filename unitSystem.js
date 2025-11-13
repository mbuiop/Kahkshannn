class UnitSystem {
    constructor(scene, resourceManager, buildingSystem) {
        this.scene = scene;
        this.resourceManager = resourceManager;
        this.buildingSystem = buildingSystem;
        
        this.units = new Map();
        this.unitQueue = [];
        this.selectedUnits = new Set();
        this.unitGroups = new Map();
        
        this.unitConfig = {
            soldier: {
                name: "سرباز",
                hp: 100,
                damage: 15,
                attackSpeed: 1.0,
                range: 1.5,
                speed: 2.0,
                trainingTime: 30,
                cost: { gold: 0, elixir: 50, gem: 0 },
                mesh: "soldier",
                type: "melee",
                targetPriority: ["defensive", "resource", "military", "core"]
            },
            archer: {
                name: "کماندار",
                hp: 60,
                damage: 25,
                attackSpeed: 1.5,
                range: 8.0,
                speed: 1.8,
                trainingTime: 45,
                cost: { gold: 0, elixir: 100, gem: 0 },
                mesh: "archer",
                type: "ranged",
                targetPriority: ["defensive", "resource", "military", "core"]
            },
            giant: {
                name: "غول",
                hp: 500,
                damage: 40,
                attackSpeed: 2.0,
                range: 1.0,
                speed: 1.0,
                trainingTime: 120,
                cost: { gold: 0, elixir: 500, gem: 0 },
                mesh: "giant",
                type: "tank",
                targetPriority: ["defensive", "core", "military", "resource"]
            },
            healer: {
                name: "درمانگر",
                hp: 80,
                damage: 0,
                healing: 20,
                attackSpeed: 1.0,
                range: 5.0,
                speed: 1.5,
                trainingTime: 60,
                cost: { gold: 0, elixir: 150, gem: 0 },
                mesh: "healer",
                type: "support",
                targetPriority: ["friendly"]
            }
        };

        this.initializeUnitSystem();
    }

    initializeUnitSystem() {
        // Set up unit update loop
        setInterval(() => {
            this.updateUnits();
            this.updateTrainingQueue();
        }, 100); // Update 10 times per second

        // Set up selection system
        this.setupUnitSelection();
    }

    trainUnit(unitType, barracksId) {
        const barracks = this.buildingSystem.buildings.get(barracksId);
        if (!barracks || barracks.type !== 'barracks') {
            this.showErrorMessage("سربازخانه معتبر پیدا نشد!");
            return false;
        }

        const unitConfig = this.unitConfig[unitType];
        if (!unitConfig) {
            this.showErrorMessage("نوع واحد نامعتبر است!");
            return false;
        }

        // Check training capacity
        const currentTraining = this.unitQueue.filter(unit => 
            unit.barracksId === barracksId
        ).length;

        if (currentTraining >= barracks.levelConfig.trainingCapacity) {
            this.showErrorMessage("ظرفیت آموزش این سربازخانه پر است!");
            return false;
        }

        // Check resources
        if (!this.resourceManager.canAfford(unitConfig.cost)) {
            this.showErrorMessage("منابع کافی برای آموزش واحد ندارید!");
            return false;
        }

        // Spend resources
        this.resourceManager.spendResources(unitConfig.cost);

        // Add to training queue
        const trainingUnit = {
            id: this.generateUnitId(),
            type: unitType,
            barracksId: barracksId,
            trainingTime: unitConfig.trainingTime,
            trainingProgress: 0,
            startTime: Date.now(),
            config: unitConfig
        };

        this.unitQueue.push(trainingUnit);
        this.onUnitTrainingStarted(trainingUnit);

        return true;
    }

    spawnUnit(unitType, position, isEnemy = false) {
        const unitConfig = this.unitConfig[unitType];
        if (!unitConfig) return null;

        const unitId = this.generateUnitId();
        const unit = {
            id: unitId,
            type: unitType,
            position: position.clone(),
            rotation: new BABYLON.Vector3(0, 0, 0),
            hp: unitConfig.hp,
            maxHp: unitConfig.hp,
            damage: unitConfig.damage,
            attackSpeed: unitConfig.attackSpeed,
            range: unitConfig.range,
            speed: unitConfig.speed,
            target: null,
            state: 'idle', // idle, moving, attacking, dead
            lastAttackTime: 0,
            path: [],
            currentPathIndex: 0,
            isEnemy: isEnemy,
            mesh: null,
            config: unitConfig
        };

        this.createUnitMesh(unit);
        this.units.set(unitId, unit);

        this.onUnitSpawned(unit);
        return unitId;
    }

    createUnitMesh(unit) {
        let mesh;
        const color = unit.isEnemy ? new BABYLON.Color3(1, 0, 0) : new BABYLON.Color3(0, 0, 1);

        switch(unit.type) {
            case 'soldier':
                mesh = BABYLON.MeshBuilder.CreateCylinder("soldier", {
                    height: 2,
                    diameter: 0.5
                }, this.scene);
                break;
            case 'archer':
                mesh = BABYLON.MeshBuilder.CreateCylinder("archer", {
                    height: 1.8,
                    diameter: 0.4
                }, this.scene);
                break;
            case 'giant':
                mesh = BABYLON.MeshBuilder.CreateCylinder("giant", {
                    height: 3,
                    diameter: 1.0
                }, this.scene);
                break;
            case 'healer':
                mesh = BABYLON.MeshBuilder.CreateCylinder("healer", {
                    height: 1.7,
                    diameter: 0.4
                }, this.scene);
                break;
        }

        if (mesh) {
            const material = new BABYLON.StandardMaterial("unitMat", this.scene);
            material.diffuseColor = color;
            mesh.material = material;

            mesh.position = unit.position.clone();
            mesh.position.y = 1; // Raise above ground
            unit.mesh = mesh;

            // Add selection highlight
            this.createSelectionHighlight(unit);

            // Enable shadows
            if (window.gameEngine && window.gameEngine.shadowGenerator) {
                window.gameEngine.shadowGenerator.addShadowCaster(mesh);
            }

            // Add click event for selection
            mesh.actionManager = new BABYLON.ActionManager(this.scene);
            mesh.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    (evt) => this.onUnitClicked(unit, evt)
                )
            );
        }
    }

    createSelectionHighlight(unit) {
        // Create a ring around the unit for selection
        const highlight = BABYLON.MeshBuilder.CreateTorus("highlight", {
            diameter: 1,
            thickness: 0.1,
            tessellation: 16
        }, this.scene);

        const highlightMat = new BABYLON.StandardMaterial("highlightMat", this.scene);
        highlightMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
        highlightMat.alpha = 0;
        highlight.material = highlightMat;

        highlight.position = unit.position.clone();
        highlight.position.y = 0.1;
        highlight.scaling.set(1.5, 1.5, 1.5);
        highlight.isVisible = false;

        unit.selectionHighlight = highlight;
    }

    updateUnits() {
        this.units.forEach(unit => {
            if (unit.state === 'dead') return;

            this.updateUnitState(unit);
            this.updateUnitMovement(unit);
            this.updateUnitCombat(unit);
            this.updateUnitMesh(unit);
        });
    }

    updateUnitState(unit) {
        switch(unit.state) {
            case 'idle':
                this.findTarget(unit);
                break;
            case 'moving':
                if (this.hasReachedTarget(unit)) {
                    unit.state = 'idle';
                    this.findTarget(unit);
                }
                break;
            case 'attacking':
                if (!unit.target || unit.target.state === 'dead') {
                    unit.state = 'idle';
                    unit.target = null;
                }
                break;
        }
    }

    updateUnitMovement(unit) {
        if (unit.state !== 'moving' || unit.path.length === 0) return;

        const targetPoint = unit.path[unit.currentPathIndex];
        const direction = targetPoint.subtract(unit.position);
        direction.y = 0; // Keep movement horizontal

        if (direction.length() < 0.1) {
            // Reached waypoint, move to next
            unit.currentPathIndex++;
            if (unit.currentPathIndex >= unit.path.length) {
                unit.path = [];
                unit.currentPathIndex = 0;
                unit.state = 'idle';
                return;
            }
        } else {
            // Move toward waypoint
            direction.normalize();
            const movement = direction.scale(unit.speed * 0.1); // Adjust for frame rate
            unit.position.addInPlace(movement);

            // Update rotation to face movement direction
            if (movement.length() > 0) {
                const targetRotation = Math.atan2(-direction.x, -direction.z);
                unit.rotation.y = targetRotation;
            }
        }
    }

    updateUnitCombat(unit) {
        if (unit.state !== 'attacking' || !unit.target) return;

        const now = Date.now();
        if (now - unit.lastAttackTime >= (1000 / unit.attackSpeed)) {
            this.performAttack(unit, unit.target);
            unit.lastAttackTime = now;
        }
    }

    updateUnitMesh(unit) {
        if (!unit.mesh) return;

        // Update position
        unit.mesh.position.copyFrom(unit.position);
        unit.mesh.position.y = 1;

        // Update rotation
        unit.mesh.rotation.y = unit.rotation.y;

        // Update selection highlight
        if (unit.selectionHighlight) {
            unit.selectionHighlight.position.copyFrom(unit.position);
            unit.selectionHighlight.position.y = 0.1;
            unit.selectionHighlight.isVisible = this.selectedUnits.has(unit.id);
        }

        // Animation based on state
        this.updateUnitAnimation(unit);
    }

    updateUnitAnimation(unit) {
        // Simple scale animation for different states
        switch(unit.state) {
            case 'moving':
                unit.mesh.scaling.y = 1 + Math.sin(Date.now() * 0.01) * 0.1;
                break;
            case 'attacking':
                unit.mesh.scaling.x = 1 + Math.sin(Date.now() * 0.02) * 0.2;
                break;
            default:
                unit.mesh.scaling.set(1, 1, 1);
        }
    }

    findTarget(unit) {
        let targets = [];

        if (unit.isEnemy) {
            // Enemy units target player buildings
            targets = Array.from(this.buildingSystem.buildings.values())
                .filter(building => !building.isConstructing);
        } else {
            // Player units target enemy units and buildings
            targets = Array.from(this.units.values())
                .filter(targetUnit => targetUnit.isEnemy && targetUnit.state !== 'dead');
        }

        if (targets.length === 0) return;

        // Sort by distance and priority
        const sortedTargets = targets.sort((a, b) => {
            const distA = BABYLON.Vector3.Distance(unit.position, a.position);
            const distB = BABYLON.Vector3.Distance(unit.position, b.position);
            return distA - distB;
        });

        unit.target = sortedTargets[0];
        
        // Move toward target if out of range
        const distance = BABYLON.Vector3.Distance(unit.position, unit.target.position);
        if (distance > unit.range) {
            this.moveUnitTo(unit.id, unit.target.position);
        } else {
            unit.state = 'attacking';
        }
    }

    performAttack(attacker, target) {
        if (attacker.type === 'healer') {
            // Healer units heal instead of damage
            target.hp = Math.min(target.maxHp, target.hp + attacker.config.healing);
            this.showHealingEffect(target.position);
        } else {
            // Normal attack
            const isBuilding = target.hp !== undefined && target.maxHp !== undefined; // Simple check
            
            if (isBuilding) {
                this.buildingSystem.damageBuilding(target.id, attacker.damage);
            } else {
                this.damageUnit(target.id, attacker.damage);
            }
            
            this.showAttackEffect(attacker, target);
        }

        this.playSound('attack');
    }

    moveUnitTo(unitId, targetPosition) {
        const unit = this.units.get(unitId);
        if (!unit) return false;

        unit.path = this.calculatePath(unit.position, targetPosition);
        unit.currentPathIndex = 0;
        unit.state = 'moving';
        unit.target = null;

        return true;
    }

    calculatePath(start, end) {
        // Simple straight-line pathfinding
        // In a real game, you would use A* with obstacle avoidance
        const path = [];
        const steps = 10;
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = new BABYLON.Vector3(
                start.x + (end.x - start.x) * t,
                0,
                start.z + (end.z - start.z) * t
            );
            path.push(point);
        }
        
        return path;
    }

    hasReachedTarget(unit) {
        if (!unit.target) return true;
        
        const distance = BABYLON.Vector3.Distance(unit.position, unit.target.position);
        return distance <= unit.range;
    }

    damageUnit(unitId, damage) {
        const unit = this.units.get(unitId);
        if (!unit) return false;

        unit.hp = Math.max(0, unit.hp - damage);
        
        // Show damage effect
        this.showDamageEffect(unit.position);
        
        if (unit.hp <= 0) {
            this.killUnit(unitId);
            return true; // Unit killed
        }
        
        return false; // Unit still alive
    }

    killUnit(unitId) {
        const unit = this.units.get(unitId);
        if (!unit) return;

        unit.state = 'dead';
        unit.hp = 0;

        // Show death effect
        this.showDeathEffect(unit.position);
        
        // Remove mesh after delay
        setTimeout(() => {
            if (unit.mesh) {
                unit.mesh.dispose();
            }
            if (unit.selectionHighlight) {
                unit.selectionHighlight.dispose();
            }
            this.units.delete(unitId);
        }, 2000);

        this.onUnitKilled(unit);
    }

    showAttackEffect(attacker, target) {
        if (attacker.type === 'archer') {
            // Archer projectile
            this.createArrowProjectile(attacker.position, target.position);
        } else {
            // Melee attack effect
            this.createMeleeEffect(attacker.position, target.position);
        }
    }

    createArrowProjectile(start, end) {
        const arrow = BABYLON.MeshBuilder.CreateCylinder("arrow", {
            height: 1,
            diameterTop: 0,
            diameterBottom: 0.1
        }, this.scene);

        const material = new BABYLON.StandardMaterial("arrowMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
        arrow.material = material;

        arrow.position = start.clone();
        arrow.position.y = 1.5;

        // Animate arrow
        const startTime = Date.now();
        const duration = 500; // ms
        
        this.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                arrow.dispose();
                return;
            }

            const progress = elapsed / duration;
            arrow.position = BABYLON.Vector3.Lerp(start, end, progress);
            arrow.position.y = 1.5 + Math.sin(progress * Math.PI) * 2; // Arc motion
        });
    }

    createMeleeEffect(attackerPos, targetPos) {
        // Create slash effect
        const slash = BABYLON.MeshBuilder.CreateBox("slash", {
            width: 0.1,
            height: 2,
            depth: 1
        }, this.scene);

        const material = new BABYLON.StandardMaterial("slashMat", this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        material.alpha = 0.7;
        slash.material = material;

        const midpoint = BABYLON.Vector3.Lerp(attackerPos, targetPos, 0.5);
        slash.position = midpoint;
        slash.position.y = 1;

        // Quick fade out
        const startTime = Date.now();
        this.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 200) {
                slash.dispose();
                return;
            }
            material.alpha = 0.7 * (1 - elapsed / 200);
        });
    }

    showHealingEffect(position) {
        if (window.gameEngine) {
            window.gameEngine.createParticleSystem('magic', position);
        }
    }

    showDamageEffect(position) {
        // Create hit particles
        const particleSystem = new BABYLON.ParticleSystem("damageParticles", 10, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture("https://assets.babylonjs.com/textures/flare.png", this.scene);
        particleSystem.emitter = position;
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.3;
        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 0.5;
        particleSystem.emitRate = 20;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 2, 1);
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;
        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
        particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        
        particleSystem.start();
        setTimeout(() => particleSystem.stop(), 100);
    }

    showDeathEffect(position) {
        if (window.gameEngine) {
            window.gameEngine.createExplosion(position, 0.3);
        }
    }

    setupUnitSelection() {
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
                
                if (pickResult.hit && pickResult.pickedMesh.name.includes("unit")) {
                    // Unit clicked - select/deselect
                    if (pointerInfo.event.ctrlKey) {
                        // Add to selection
                        this.selectUnit(pickResult.pickedMesh.unitId, true);
                    } else {
                        // Replace selection
                        this.clearSelection();
                        this.selectUnit(pickResult.pickedMesh.unitId, false);
                    }
                } else {
                    // Ground clicked - move selected units or clear selection
                    if (this.selectedUnits.size > 0 && pickResult.hit) {
                        this.moveSelectedUnitsTo(pickResult.pickedPoint);
                    } else {
                        this.clearSelection();
                    }
                }
            }
        });
    }

    selectUnit(unitId, addToSelection = false) {
        if (!addToSelection) {
            this.clearSelection();
        }

        const unit = this.units.get(unitId);
        if (unit && !unit.isEnemy) {
            this.selectedUnits.add(unitId);
            this.onUnitSelected(unit);
        }
    }

    clearSelection() {
        this.selectedUnits.clear();
        this.onSelectionCleared();
    }

    moveSelectedUnitsTo(position) {
        this.selectedUnits.forEach(unitId => {
            this.moveUnitTo(unitId, position);
        });

        // Show move order effect
        this.showMoveOrderEffect(position);
    }

    showMoveOrderEffect(position) {
        const ring = BABYLON.MeshBuilder.CreateTorus("moveOrder", {
            diameter: 1,
            thickness: 0.1,
            tessellation: 16
        }, this.scene);

        const material = new BABYLON.StandardMaterial("moveOrderMat", this.scene);
        material.emissiveColor = new BABYLON.Color3(0, 1, 0);
        material.alpha = 0.8;
        ring.material = material;

        ring.position = position.clone();
        ring.position.y = 0.1;

        // Animate and fade out
        const startTime = Date.now();
        this.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 1000) {
                ring.dispose();
                return;
            }

            const progress = elapsed / 1000;
            ring.scaling.set(1 + progress * 2, 1 + progress * 2, 1 + progress * 2);
            material.alpha = 0.8 * (1 - progress);
        });
    }

    updateTrainingQueue() {
        const now = Date.now();
        
        for (let i = this.unitQueue.length - 1; i >= 0; i--) {
            const trainingUnit = this.unitQueue[i];
            const elapsed = (now - trainingUnit.startTime) / 1000;
            trainingUnit.trainingProgress = elapsed / trainingUnit.trainingTime;
            
            if (elapsed >= trainingUnit.trainingTime) {
                this.completeTraining(trainingUnit);
                this.unitQueue.splice(i, 1);
            }
        }
    }

    completeTraining(trainingUnit) {
        const barracks = this.buildingSystem.buildings.get(trainingUnit.barracksId);
        if (!barracks) return;

        // Spawn unit near barracks
        const spawnPosition = barracks.position.clone();
        spawnPosition.x += (Math.random() - 0.5) * 5;
        spawnPosition.z += (Math.random() - 0.5) * 5;

        this.spawnUnit(trainingUnit.type, spawnPosition);
        this.onUnitTrainingCompleted(trainingUnit);
    }

    // Utility methods
    generateUnitId() {
        return 'unit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showErrorMessage(message) {
        console.error(message);
        // You can integrate with the notification system from BuildingSystem
    }

    playSound(soundName) {
        console.log(`Playing sound: ${soundName}`);
    }

    // Event handlers
    onUnitTrainingStarted(trainingUnit) {
        console.log(`Training started: ${trainingUnit.type}`);
    }

    onUnitTrainingCompleted(trainingUnit) {
        console.log(`Training completed: ${trainingUnit.type}`);
    }

    onUnitSpawned(unit) {
        console.log(`Unit spawned: ${unit.type} at ${unit.position}`);
        
        // Store unit ID in mesh for selection
        if (unit.mesh) {
            unit.mesh.unitId = unit.id;
        }
    }

    onUnitSelected(unit) {
        console.log(`Unit selected: ${unit.type}`);
    }

    onSelectionCleared() {
        console.log("Selection cleared");
    }

    onUnitKilled(unit) {
        console.log(`Unit killed: ${unit.type}`);
    }

    // Group management
    createGroup(groupNumber) {
        const selectedUnits = Array.from(this.selectedUnits);
        if (selectedUnits.length === 0) return;

        this.unitGroups.set(groupNumber, new Set(selectedUnits));
        this.showSuccessMessage(`گروه ${groupNumber} ایجاد شد با ${selectedUnits.length} واحد`);
    }

    selectGroup(groupNumber) {
        const group = this.unitGroups.get(groupNumber);
        if (!group) return;

        this.clearSelection();
        group.forEach(unitId => {
            if (this.units.has(unitId)) {
                this.selectedUnits.add(unitId);
            }
        });

        this.showSuccessMessage(`گروه ${groupNumber} انتخاب شد`);
    }

    // Save/load system
    save() {
        const saveData = {
            units: Array.from(this.units.entries()),
            unitQueue: this.unitQueue,
            selectedUnits: Array.from(this.selectedUnits),
            unitGroups: Array.from(this.unitGroups.entries()).map(([key, value]) => 
                [key, Array.from(value)]
            )
        };
        
        localStorage.setItem('unitSystem', JSON.stringify(saveData));
        return saveData;
    }

    load() {
        const saved = localStorage.getItem('unitSystem');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                
                // Rebuild units
                saveData.units.forEach(([id, unitData]) => {
                    this.units.set(id, unitData);
                    this.createUnitMesh(unitData);
                });
                
                this.unitQueue = saveData.unitQueue || [];
                this.selectedUnits = new Set(saveData.selectedUnits || []);
                
                // Rebuild groups
                this.unitGroups = new Map();
                (saveData.unitGroups || []).forEach(([key, unitArray]) => {
                    this.unitGroups.set(key, new Set(unitArray));
                });
                
                return true;
            } catch (e) {
                console.error('Error loading unit data:', e);
            }
        }
        return false;
    }

    getUnitStatistics() {
        const stats = {
            total: this.units.size,
            byType: {},
            alive: 0,
            dead: 0,
            totalHP: 0,
            totalDamage: 0
        };

        this.units.forEach(unit => {
            if (!stats.byType[unit.type]) {
                stats.byType[unit.type] = {
                    count: 0,
                    totalHP: 0,
                    totalDamage: 0
                };
            }
            
            stats.byType[unit.type].count++;
            stats.byType[unit.type].totalHP += unit.hp;
            stats.byType[unit.type].totalDamage += unit.damage;
            
            stats.totalHP += unit.hp;
            stats.totalDamage += unit.damage;
            
            if (unit.state === 'dead') {
                stats.dead++;
            } else {
                stats.alive++;
            }
        });

        return stats;
    }

    // Advanced unit commands
    setUnitFormation(formationType) {
        const selectedUnits = Array.from(this.selectedUnits).map(id => this.units.get(id));
        if (selectedUnits.length === 0) return;

        const center = this.calculateUnitsCenter(selectedUnits);
        
        switch(formationType) {
            case 'line':
                this.arrangeUnitsInLine(selectedUnits, center);
                break;
            case 'circle':
                this.arrangeUnitsInCircle(selectedUnits, center);
                break;
            case 'wedge':
                this.arrangeUnitsInWedge(selectedUnits, center);
                break;
        }

        this.showSuccessMessage(`تشکیل ${formationType} اعمال شد`);
    }

    calculateUnitsCenter(units) {
        const center = new BABYLON.Vector3(0, 0, 0);
        units.forEach(unit => center.addInPlace(unit.position));
        return center.scale(1 / units.length);
    }

    arrangeUnitsInLine(units, center) {
        const spacing = 2;
        units.forEach((unit, index) => {
            const offset = (index - (units.length - 1) / 2) * spacing;
            const targetPos = new BABYLON.Vector3(
                center.x + offset,
                0,
                center.z
            );
            this.moveUnitTo(unit.id, targetPos);
        });
    }

    arrangeUnitsInCircle(units, center) {
        const radius = Math.max(3, units.length);
        units.forEach((unit, index) => {
            const angle = (index / units.length) * Math.PI * 2;
            const targetPos = new BABYLON.Vector3(
                center.x + Math.cos(angle) * radius,
                0,
                center.z + Math.sin(angle) * radius
            );
            this.moveUnitTo(unit.id, targetPos);
        });
    }

    arrangeUnitsInWedge(units, center) {
        // V-shaped formation
        const rows = Math.ceil(Math.sqrt(units.length));
        let unitIndex = 0;
        
        for (let row = 0; row < rows; row++) {
            const unitsInRow = row + 1;
            for (let col = 0; col < unitsInRow && unitIndex < units.length; col++) {
                const unit = units[unitIndex];
                const xOffset = (col - row / 2) * 2;
                const zOffset = row * 2;
                
                const targetPos = new BABYLON.Vector3(
                    center.x + xOffset,
                    0,
                    center.z + zOffset
                );
                
                this.moveUnitTo(unit.id, targetPos);
                unitIndex++;
            }
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnitSystem;
            }
