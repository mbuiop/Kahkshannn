class CombatSystem {
    constructor(scene, buildingSystem, unitSystem, resourceManager) {
        this.scene = scene;
        this.buildingSystem = buildingSystem;
        this.unitSystem = unitSystem;
        this.resourceManager = resourceManager;
        
        this.projectiles = new Map();
        this.effects = new Map();
        this.battleLog = [];
        this.combatStats = {
            totalDamageDealt: 0,
            totalDamageReceived: 0,
            unitsKilled: 0,
            unitsLost: 0,
            buildingsDestroyed: 0,
            buildingsLost: 0
        };

        this.attackMode = false;
        this.currentTargetBase = null;
        this.defenseSystems = new Map();
        
        this.initializeCombatSystem();
    }

    initializeCombatSystem() {
        // Set up combat update loop
        setInterval(() => {
            this.updateCombat();
            this.updateProjectiles();
            this.updateDefenseSystems();
        }, 50); // Update 20 times per second for smooth combat

        // Initialize defense systems for existing buildings
        this.initializeDefenseSystems();
    }

    initializeDefenseSystems() {
        // Set up defense systems for defensive buildings
        const defensiveBuildings = this.buildingSystem.getDefensiveBuildings();
        defensiveBuildings.forEach(building => {
            this.setupDefenseSystem(building);
        });
    }

    setupDefenseSystem(building) {
        if (building.type !== 'cannon' && building.type !== 'archertower') return;

        const defenseSystem = {
            building: building,
            cooldown: 0,
            currentTarget: null,
            attackRange: building.levelConfig.range,
            attackSpeed: building.levelConfig.attackSpeed,
            damage: building.levelConfig.damage
        };

        this.defenseSystems.set(building.id, defenseSystem);
    }

    startAttackMode(targetBaseData) {
        this.attackMode = true;
        this.currentTargetBase = targetBaseData;
        this.combatStats = {
            totalDamageDealt: 0,
            totalDamageReceived: 0,
            unitsKilled: 0,
            unitsLost: 0,
            buildingsDestroyed: 0,
            buildingsLost: 0
        };

        this.battleLog = [];
        this.logBattleEvent("حالت حمله فعال شد! 🚀");

        // Cinematic camera transition to enemy base
        this.startCinematicAttackSequence();

        // Enable unit deployment
        this.setupUnitDeployment();
    }

    startCinematicAttackSequence() {
        if (!window.gameEngine || !window.gameEngine.camera) return;

        const camera = window.gameEngine.camera;
        const originalPosition = camera.position.clone();
        const originalTarget = camera.target.clone();

        // Calculate enemy base position (in a real game, this would come from targetBaseData)
        const enemyBasePosition = new BABYLON.Vector3(50, 0, 50);

        // Animate camera to enemy base
        const attackAnimation = new BABYLON.Animation(
            "attackCamera",
            "position",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [];
        keys.push({ frame: 0, value: originalPosition });
        keys.push({ frame: 60, value: enemyBasePosition.add(new BABYLON.Vector3(0, 30, -20)) });
        
        attackAnimation.setKeys(keys);
        camera.animations = [attackAnimation];
        
        this.scene.beginAnimation(camera, 0, 60, false, 1.0, () => {
            this.onAttackSequenceComplete();
        });

        // Screen effects for attack mode
        this.applyAttackModeEffects();
    }

    applyAttackModeEffects() {
        // Add red tint and vignette for combat
        if (window.gameEngine && window.gameEngine.postProcesses) {
            // This would require custom post-processing shaders
            // For now, we'll use a simple color grading
            this.scene.clearColor = new BABYLON.Color4(0.15, 0.1, 0.1, 1.0);
        }

        // Combat music and sounds
        this.playCombatMusic();
    }

    playCombatMusic() {
        // In a real game, you would play combat music
        console.log("🎵 Combat music started");
    }

    onAttackSequenceComplete() {
        this.logBattleEvent("آماده استقرار نیروها! ⚔️");
        this.showDeploymentInstructions();
    }

    showDeploymentInstructions() {
        const message = "برای استقرار نیروها روی زمین کلیک کنید. نیروها به صورت خودکار به دشمنان حمله می‌کنند.";
        this.showCombatMessage(message, 5000);
    }

    setupUnitDeployment() {
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN && this.attackMode) {
                const pickResult = this.scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
                
                if (pickResult.hit) {
                    this.deployUnitsAtPosition(pickResult.pickedPoint);
                }
            }
        });
    }

    deployUnitsAtPosition(position) {
        // Get available units from barracks
        const availableUnits = this.getAvailableUnitsForDeployment();
        
        if (availableUnits.length === 0) {
            this.showCombatMessage("هیچ نیروی آماده‌ای برای استقرار ندارید!", 3000);
            return;
        }

        // Deploy units in a formation around the click position
        const deploymentCount = Math.min(availableUnits.length, 5); // Deploy up to 5 units at once
        
        for (let i = 0; i < deploymentCount; i++) {
            const unitType = availableUnits[i];
            const offset = this.calculateDeploymentOffset(i, deploymentCount);
            const deployPos = position.add(offset);
            
            this.unitSystem.spawnUnit(unitType, deployPos);
            this.logBattleEvent(`${this.unitSystem.unitConfig[unitType].name} مستقر شد!`);
        }

        // Show deployment effect
        this.showDeploymentEffect(position);
    }

    getAvailableUnitsForDeployment() {
        // In a real game, this would check trained units in barracks
        // For now, return some sample units
        return ['soldier', 'archer', 'soldier', 'giant', 'healer'];
    }

    calculateDeploymentOffset(index, total) {
        const radius = 2;
        const angle = (index / total) * Math.PI * 2;
        
        return new BABYLON.Vector3(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
    }

    showDeploymentEffect(position) {
        if (window.gameEngine) {
            window.gameEngine.createParticleSystem('magic', position);
        }
        
        // Create deployment ring
        const ring = BABYLON.MeshBuilder.CreateTorus("deployRing", {
            diameter: 3,
            thickness: 0.2,
            tessellation: 32
        }, this.scene);

        const ringMat = new BABYLON.StandardMaterial("deployRingMat", this.scene);
        ringMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
        ringMat.alpha = 0.7;
        ring.material = ringMat;

        ring.position = position.clone();
        ring.position.y = 0.1;

        // Animate and remove
        const startTime = Date.now();
        this.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 1000) {
                ring.dispose();
                return;
            }
            
            ring.scaling.set(1 + elapsed / 500, 1 + elapsed / 500, 1 + elapsed / 500);
            ringMat.alpha = 0.7 * (1 - elapsed / 1000);
        });
    }

    updateCombat() {
        // Update unit combat
        this.unitSystem.units.forEach(unit => {
            if (unit.isEnemy) {
                this.updateEnemyUnitCombat(unit);
            } else {
                this.updatePlayerUnitCombat(unit);
            }
        });

        // Check battle end conditions
        this.checkBattleEndConditions();
    }

    updateEnemyUnitCombat(unit) {
        if (unit.state === 'dead') return;

        // Enemy units target player buildings
        if (!unit.target || unit.target.state === 'dead') {
            this.findTargetForEnemy(unit);
        }

        if (unit.target && unit.state === 'attacking') {
            this.performUnitAttack(unit, unit.target);
        }
    }

    updatePlayerUnitCombat(unit) {
        if (unit.state === 'dead') return;

        // Player units target enemy units and buildings
        if (!unit.target || unit.target.state === 'dead') {
            this.findTargetForPlayer(unit);
        }

        if (unit.target && unit.state === 'attacking') {
            this.performUnitAttack(unit, unit.target);
        }
    }

    findTargetForEnemy(unit) {
        // Find closest player building
        const playerBuildings = Array.from(this.buildingSystem.buildings.values())
            .filter(building => !building.isConstructing);
        
        if (playerBuildings.length === 0) return;

        const closestBuilding = playerBuildings.reduce((closest, building) => {
            const distance = BABYLON.Vector3.Distance(unit.position, building.position);
            const closestDistance = closest ? BABYLON.Vector3.Distance(unit.position, closest.position) : Infinity;
            return distance < closestDistance ? building : closest;
        }, null);

        unit.target = closestBuilding;
        this.unitSystem.moveUnitTo(unit.id, closestBuilding.position);
    }

    findTargetForPlayer(unit) {
        // Find closest enemy unit or building
        const enemyUnits = Array.from(this.unitSystem.units.values())
            .filter(enemy => enemy.isEnemy && enemy.state !== 'dead');
        
        // In a real game, you would also have enemy buildings
        const targets = enemyUnits; // Add enemy buildings here
        
        if (targets.length === 0) return;

        const closestTarget = targets.reduce((closest, target) => {
            const distance = BABYLON.Vector3.Distance(unit.position, target.position);
            const closestDistance = closest ? BABYLON.Vector3.Distance(unit.position, closest.position) : Infinity;
            return distance < closestDistance ? target : closest;
        }, null);

        unit.target = closestTarget;
        
        const distance = BABYLON.Vector3.Distance(unit.position, closestTarget.position);
        if (distance > unit.range) {
            this.unitSystem.moveUnitTo(unit.id, closestTarget.position);
        } else {
            unit.state = 'attacking';
        }
    }

    performUnitAttack(attacker, target) {
        const now = Date.now();
        if (now - attacker.lastAttackTime < (1000 / attacker.attackSpeed)) return;

        let damageDealt = 0;
        let targetDestroyed = false;

        if (target.hp !== undefined) {
            // Target is a building
            targetDestroyed = this.buildingSystem.damageBuilding(target.id, attacker.damage);
            damageDealt = attacker.damage;
        } else {
            // Target is a unit
            targetDestroyed = this.unitSystem.damageUnit(target.id, attacker.damage);
            damageDealt = attacker.damage;
        }

        // Update combat stats
        this.combatStats.totalDamageDealt += damageDealt;
        
        if (targetDestroyed) {
            if (target.hp !== undefined) {
                this.combatStats.buildingsDestroyed++;
                this.logBattleEvent(`ساختمان دشمن نابود شد! 🎯`);
            } else {
                this.combatStats.unitsKilled++;
                this.logBattleEvent(`واحد دشمن منهدم شد! 💥`);
            }
        }

        // Create attack effect
        this.createAttackEffect(attacker, target);

        attacker.lastAttackTime = now;
    }

    createAttackEffect(attacker, target) {
        const effectType = attacker.type === 'archer' ? 'projectile' : 'melee';
        
        switch(effectType) {
            case 'projectile':
                this.createProjectile(attacker.position, target.position, attacker.type);
                break;
            case 'melee':
                this.createMeleeEffect(attacker.position, target.position);
                break;
        }

        // Screen shake for heavy attacks
        if (attacker.type === 'giant') {
            if (window.gameEngine) {
                window.gameEngine.cameraShake(0.2);
            }
        }
    }

    createProjectile(start, end, unitType) {
        const projectileId = this.generateId();
        const projectile = {
            id: projectileId,
            start: start.clone(),
            end: end.clone(),
            position: start.clone(),
            speed: 20,
            progress: 0,
            type: unitType,
            mesh: null
        };

        this.createProjectileMesh(projectile);
        this.projectiles.set(projectileId, projectile);

        return projectileId;
    }

    createProjectileMesh(projectile) {
        let mesh;
        
        switch(projectile.type) {
            case 'archer':
                mesh = BABYLON.MeshBuilder.CreateCylinder("arrow", {
                    height: 1,
                    diameterTop: 0,
                    diameterBottom: 0.05
                }, this.scene);
                const arrowMat = new BABYLON.StandardMaterial("arrowMat", this.scene);
                arrowMat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.2);
                mesh.material = arrowMat;
                break;
                
            case 'cannon':
                mesh = BABYLON.MeshBuilder.CreateSphere("cannonball", {
                    diameter: 0.3
                }, this.scene);
                const cannonMat = new BABYLON.StandardMaterial("cannonMat", this.scene);
                cannonMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
                mesh.material = cannonMat;
                break;
        }

        if (mesh) {
            mesh.position = projectile.position;
            projectile.mesh = mesh;
        }
    }

    createMeleeEffect(attackerPos, targetPos) {
        // Create a quick flash at the target position
        const flash = BABYLON.MeshBuilder.CreateSphere("meleeFlash", {
            diameter: 1
        }, this.scene);

        const flashMat = new BABYLON.StandardMaterial("flashMat", this.scene);
        flashMat.emissiveColor = new BABYLON.Color3(1, 1, 0);
        flashMat.alpha = 0.7;
        flash.material = flashMat;

        flash.position = targetPos.clone();
        flash.position.y = 1;

        // Quick fade out
        const startTime = Date.now();
        this.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 200) {
                flash.dispose();
                return;
            }
            flashMat.alpha = 0.7 * (1 - elapsed / 200);
        });
    }

    updateProjectiles() {
        this.projectiles.forEach((projectile, id) => {
            projectile.progress += projectile.speed * 0.016; // Assuming 60 FPS
            
            if (projectile.progress >= 1) {
                // Projectile reached target
                this.onProjectileHit(projectile);
                this.projectiles.delete(id);
            } else {
                // Update projectile position
                projectile.position = BABYLON.Vector3.Lerp(
                    projectile.start, 
                    projectile.end, 
                    projectile.progress
                );
                
                // Add arc to trajectory
                const arcHeight = 3;
                projectile.position.y += Math.sin(projectile.progress * Math.PI) * arcHeight;
                
                if (projectile.mesh) {
                    projectile.mesh.position.copyFrom(projectile.position);
                    
                    // Rotate to face direction
                    const direction = projectile.end.subtract(projectile.start).normalize();
                    projectile.mesh.rotation.y = Math.atan2(-direction.x, -direction.z);
                }
            }
        });
    }

    onProjectileHit(projectile) {
        // Create hit effect
        this.createHitEffect(projectile.end, projectile.type);
        
        // Remove projectile mesh
        if (projectile.mesh) {
            projectile.mesh.dispose();
        }
    }

    createHitEffect(position, type) {
        switch(type) {
            case 'archer':
                if (window.gameEngine) {
                    window.gameEngine.createParticleSystem('fire', position);
                }
                break;
            case 'cannon':
                if (window.gameEngine) {
                    window.gameEngine.createExplosion(position, 0.5);
                }
                break;
        }
    }

    updateDefenseSystems() {
        this.defenseSystems.forEach((defense, buildingId) => {
            if (defense.cooldown > 0) {
                defense.cooldown -= 0.05; // Assuming 20 updates per second
                return;
            }

            if (!defense.currentTarget || defense.currentTarget.state === 'dead') {
                this.findTargetForDefense(defense);
            }

            if (defense.currentTarget) {
                this.defenseSystemAttack(defense);
                defense.cooldown = 1 / defense.attackSpeed; // Reset cooldown
            }
        });
    }

    findTargetForDefense(defense) {
        const enemyUnits = Array.from(this.unitSystem.units.values())
            .filter(unit => unit.isEnemy && unit.state !== 'dead');
        
        if (enemyUnits.length === 0) return;

        // Find closest enemy in range
        const closestEnemy = enemyUnits.reduce((closest, unit) => {
            const distance = BABYLON.Vector3.Distance(defense.building.position, unit.position);
            if (distance > defense.attackRange) return closest;
            
            const closestDistance = closest ? 
                BABYLON.Vector3.Distance(defense.building.position, closest.position) : Infinity;
            
            return distance < closestDistance ? unit : closest;
        }, null);

        defense.currentTarget = closestEnemy;
    }

    defenseSystemAttack(defense) {
        if (!defense.currentTarget) return;

        // Create projectile from defense building to target
        this.createProjectile(
            defense.building.position,
            defense.currentTarget.position,
            defense.building.type
        );

        // Apply damage to target
        const targetDestroyed = this.unitSystem.damageUnit(
            defense.currentTarget.id, 
            defense.damage
        );

        // Update combat stats
        this.combatStats.totalDamageDealt += defense.damage;
        
        if (targetDestroyed) {
            this.combatStats.unitsKilled++;
            defense.currentTarget = null;
        }

        // Play attack sound
        this.playSound('defense_attack');
    }

    checkBattleEndConditions() {
        if (!this.attackMode) return;

        const playerUnits = Array.from(this.unitSystem.units.values())
            .filter(unit => !unit.isEnemy && unit.state !== 'dead');
        
        const enemyUnits = Array.from(this.unitSystem.units.values())
            .filter(unit => unit.isEnemy && unit.state !== 'dead');

        // Check for victory (no enemy units left)
        if (enemyUnits.length === 0) {
            this.endBattle(true);
            return;
        }

        // Check for defeat (no player units left and no units to deploy)
        if (playerUnits.length === 0 && this.getAvailableUnitsForDeployment().length === 0) {
            this.endBattle(false);
            return;
        }
    }

    endBattle(victory) {
        this.attackMode = false;
        
        if (victory) {
            this.onVictory();
        } else {
            this.onDefeat();
        }

        // Clean up combat effects
        this.cleanupCombat();
    }

    onVictory() {
        this.logBattleEvent("پیروزی! 🏆 نیروهای شما برنده نبرد شدند!");
        
        // Calculate rewards
        const rewards = this.calculateVictoryRewards();
        
        // Show victory screen
        this.showVictoryScreen(rewards);
        
        // Celebration effects
        this.startVictoryCelebration();
    }

    onDefeat() {
        this.logBattleEvent("شکست! 💔 همه نیروهای شما نابود شدند.");
        
        // Show defeat screen
        this.showDefeatScreen();
        
        // Defeat effects
        this.startDefeatSequence();
    }

    calculateVictoryRewards() {
        const baseReward = {
            gold: 500,
            elixir: 300,
            gem: 5
        };

        // Bonus based on performance
        const performanceBonus = {
            gold: this.combatStats.unitsKilled * 10,
            elixir: this.combatStats.buildingsDestroyed * 20,
            gem: Math.floor(this.combatStats.unitsKilled / 10)
        };

        const totalReward = {
            gold: baseReward.gold + performanceBonus.gold,
            elixir: baseReward.elixir + performanceBonus.elixir,
            gem: baseReward.gem + performanceBonus.gem
        };

        // Add rewards to player resources
        this.resourceManager.addResource('gold', totalReward.gold);
        this.resourceManager.addResource('elixir', totalReward.elixir);
        this.resourceManager.addResource('gem', totalReward.gem);

        return totalReward;
    }

    showVictoryScreen(rewards) {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("victoryUI");
        
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "400px";
        panel.height = "300px";
        panel.background = "rgba(0,50,0,0.9)";
        panel.color = "gold";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(panel);

        // Victory title
        const title = new BABYLON.GUI.TextBlock();
        title.text = "🎉 پیروزی! 🎉";
        title.color = "gold";
        title.fontSize = 36;
        title.height = "60px";
        title.fontWeight = "bold";
        panel.addControl(title);

        // Rewards
        const rewardsText = new BABYLON.GUI.TextBlock();
        rewardsText.text = `جوایز شما:\n\n💰 طلا: ${rewards.gold}\n⚗️ اکسیر: ${rewards.elixir}\n💎 الماس: ${rewards.gem}`;
        rewardsText.color = "white";
        rewardsText.fontSize = 24;
        rewardsText.height = "120px";
        rewardsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.addControl(rewardsText);

        // Continue button
        const continueButton = BABYLON.GUI.Button.CreateSimpleButton("continue", "ادامه");
        continueButton.width = "200px";
        continueButton.height = "50px";
        continueButton.color = "white";
        continueButton.background = "green";
        continueButton.fontSize = 20;
        continueButton.onPointerClickObservable.add(() => {
            advancedTexture.dispose();
            this.returnToBase();
        });
        panel.addControl(continueButton);
    }

    showDefeatScreen() {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("defeatUI");
        
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "400px";
        panel.height = "250px";
        panel.background = "rgba(50,0,0,0.9)";
        panel.color = "silver";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        advancedTexture.addControl(panel);

        // Defeat title
        const title = new BABYLON.GUI.TextBlock();
        title.text = "💔 شکست";
        title.color = "silver";
        title.fontSize = 36;
        title.height = "60px";
        title.fontWeight = "bold";
        panel.addControl(title);

        // Message
        const message = new BABYLON.GUI.TextBlock();
        message.text = "نیروهای شما شکست خوردند.\n بهتر آماده شوید و دوباره تلاش کنید!";
        message.color = "white";
        message.fontSize = 20;
        message.height = "80px";
        panel.addControl(message);

        // Retry button
        const retryButton = BABYLON.GUI.Button.CreateSimpleButton("retry", "تلاش مجدد");
        retryButton.width = "200px";
        retryButton.height = "50px";
        retryButton.color = "white";
        retryButton.background = "red";
        retryButton.fontSize = 20;
        retryButton.onPointerClickObservable.add(() => {
            advancedTexture.dispose();
            this.returnToBase();
        });
        panel.addControl(retryButton);
    }

    startVictoryCelebration() {
        // Fireworks
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const position = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 50,
                    0,
                    (Math.random() - 0.5) * 50
                );
                if (window.gameEngine) {
                    window.gameEngine.createExplosion(position, 0.3);
                }
            }, i * 500);
        }

        // Confetti effect
        this.createConfettiEffect();

        // Victory music
        this.playVictoryMusic();
    }

    startDefeatSequence() {
        // Dark screen effect
        this.scene.clearColor = new BABYLON.Color4(0.1, 0, 0, 1.0);
        
        // Smoke effects
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const position = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 30,
                    0,
                    (Math.random() - 0.5) * 30
                );
                if (window.gameEngine) {
                    window.gameEngine.createParticleSystem('smoke', position);
                }
            }, i * 1000);
        }
    }

    createConfettiEffect() {
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = BABYLON.MeshBuilder.CreateBox("confetti", {
                    size: 0.1
                }, this.scene);

                const colors = [
                    new BABYLON.Color3(1, 0, 0),
                    new BABYLON.Color3(0, 1, 0),
                    new BABYLON.Color3(0, 0, 1),
                    new BABYLON.Color3(1, 1, 0),
                    new BABYLON.Color3(1, 0, 1)
                ];

                const material = new BABYLON.StandardMaterial("confettiMat", this.scene);
                material.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.material = material;

                confetti.position = new BABYLON.Vector3(0, 20, 0);
                
                // Physics for falling
                const gravity = new BABYLON.Vector3(0, -0.01, 0);
                const velocity = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    -0.05,
                    (Math.random() - 0.5) * 0.1
                );

                const startTime = Date.now();
                this.scene.registerBeforeRender(() => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed > 5000) {
                        confetti.dispose();
                        return;
                    }

                    velocity.addInPlace(gravity);
                    confetti.position.addInPlace(velocity);
                    confetti.rotation.x += 0.1;
                    confetti.rotation.y += 0.1;
                });
            }, i * 50);
        }
    }

    returnToBase() {
        // Reset camera to player base
        if (window.gameEngine && window.gameEngine.camera) {
            window.gameEngine.camera.position = new BABYLON.Vector3(0, 30, -20);
            window.gameEngine.camera.target = new BABYLON.Vector3(0, 0, 0);
        }

        // Reset visual effects
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.15, 1.0);

        // Stop combat music
        this.stopCombatMusic();
    }

    stopCombatMusic() {
        console.log("🎵 Combat music stopped");
    }

    playVictoryMusic() {
        console.log("🎵 Victory music playing");
    }

    // Utility methods
    generateId() {
        return 'combat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    logBattleEvent(message) {
        const event = {
            timestamp: Date.now(),
            message: message
        };
        
        this.battleLog.push(event);
        console.log(`[COMBAT] ${message}`);

        // Show in-game message for important events
        if (message.includes('پیروزی') || message.includes('شکست') || message.includes('مستقر شد')) {
            this.showCombatMessage(message, 3000);
        }
    }

    showCombatMessage(message, duration = 3000) {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("combatMessage");
        
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = message;
        textBlock.color = "white";
        textBlock.fontSize = 24;
        textBlock.fontWeight = "bold";
        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        textBlock.top = "100px";
        textBlock.background = "rgba(0,0,0,0.7)";
        textBlock.paddingTop = "10px";
        textBlock.paddingBottom = "10px";
        textBlock.paddingLeft = "20px";
        textBlock.paddingRight = "20px";
        advancedTexture.addControl(textBlock);

        setTimeout(() => {
            advancedTexture.removeControl(textBlock);
            advancedTexture.dispose();
        }, duration);
    }

    playSound(soundName) {
        console.log(`Playing sound: ${soundName}`);
    }

    cleanupCombat() {
        // Clean up projectiles
        this.projectiles.forEach(projectile => {
            if (projectile.mesh) {
                projectile.mesh.dispose();
            }
        });
        this.projectiles.clear();

        // Clean up effects
        this.effects.forEach(effect => {
            if (effect.mesh) {
                effect.mesh.dispose();
            }
        });
        this.effects.clear();
    }

    getCombatReport() {
        return {
            stats: this.combatStats,
            log: this.battleLog,
            duration: this.battleLog.length > 0 ? 
                (this.battleLog[this.battleLog.length - 1].timestamp - this.battleLog[0].timestamp) / 1000 : 0
        };
    }

    // Defense building management
    addDefenseBuilding(building) {
        this.setupDefenseSystem(building);
    }

    removeDefenseBuilding(buildingId) {
        this.defenseSystems.delete(buildingId);
    }

    // Save/load system
    save() {
        const saveData = {
            combatStats: this.combatStats,
            battleLog: this.battleLog,
            defenseSystems: Array.from(this.defenseSystems.keys())
        };
        
        localStorage.setItem('combatSystem', JSON.stringify(saveData));
        return saveData;
    }

    load() {
        const saved = localStorage.getItem('combatSystem');
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                
                this.combatStats = saveData.combatStats || this.combatStats;
                this.battleLog = saveData.battleLog || this.battleLog;
                
                // Rebuild defense systems
                (saveData.defenseSystems || []).forEach(buildingId => {
                    const building = this.buildingSystem.buildings.get(buildingId);
                    if (building) {
                        this.setupDefenseSystem(building);
                    }
                });
                
                return true;
            } catch (e) {
                console.error('Error loading combat data:', e);
            }
        }
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatSystem;
}
