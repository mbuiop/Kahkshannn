class InputManager {
    constructor(scene, camera, gameEngine) {
        this.scene = scene;
        this.camera = camera;
        this.gameEngine = gameEngine;
        
        this.pointerState = {
            isDown: false,
            startPosition: null,
            currentPosition: null,
            isDragging: false,
            dragStartTime: 0,
            lastClickTime: 0
        };

        this.touchState = {
            isTouching: false,
            touchCount: 0,
            pinchStartDistance: 0,
            currentPinchDistance: 0,
            isPinching: false,
            touchStartTime: 0
        };

        this.keyboardState = new Set();
        this.gestures = new Map();
        this.eventListeners = new Map();
        
        this.cameraControls = {
            rotationSpeed: 0.005,
            zoomSpeed: 0.8,
            panSpeed: 0.8,
            minZoom: 10,
            maxZoom: 100,
            zoomInertia: 0.8,
            rotationInertia: 0.9,
            panInertia: 0.85
        };

        this.selectionState = {
            isSelecting: false,
            selectionStart: null,
            selectionEnd: null,
            selectionBox: null
        };

        this.controlModes = {
            NORMAL: 'normal',
            BUILDING_PLACEMENT: 'building_placement',
            UNIT_DEPLOYMENT: 'unit_deployment',
            COMBAT: 'combat'
        };

        this.currentControlMode = this.controlModes.NORMAL;

        this.initializeInputSystem();
    }

    initializeInputSystem() {
        this.setupMouseInput();
        this.setupTouchInput();
        this.setupKeyboardInput();
        this.setupGestures();
        this.setupContextMenu();
        
        // Input update loop
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateInput();
        });

        console.log('✅ سیستم ورودی راه‌اندازی شد');
    }

    setupMouseInput() {
        // Mouse down event
        this.scene.onPointerDown = (evt) => {
            this.pointerState.isDown = true;
            this.pointerState.startPosition = new BABYLON.Vector2(evt.clientX, evt.clientY);
            this.pointerState.currentPosition = this.pointerState.startPosition.clone();
            this.pointerState.dragStartTime = Date.now();
            this.pointerState.isDragging = false;

            // Start selection box for unit selection
            if (evt.button === 0) { // Left click
                this.startSelection(evt);
            }

            this.onPointerDown(evt);
        };

        // Mouse move event
        this.scene.onPointerMove = (evt) => {
            this.pointerState.currentPosition = new BABYLON.Vector2(evt.clientX, evt.clientY);

            if (this.pointerState.isDown) {
                const dragDistance = BABYLON.Vector2.Distance(
                    this.pointerState.startPosition,
                    this.pointerState.currentPosition
                );

                if (dragDistance > 5) { // Minimum drag threshold
                    this.pointerState.isDragging = true;
                    
                    if (this.selectionState.isSelecting) {
                        this.updateSelection(evt);
                    } else {
                        this.onDrag(evt);
                    }
                }
            }

            this.onPointerMove(evt);
        };

        // Mouse up event
        this.scene.onPointerUp = (evt) => {
            const clickDuration = Date.now() - this.pointerState.dragStartTime;
            
            if (this.selectionState.isSelecting) {
                this.finishSelection(evt);
            } else if (!this.pointerState.isDragging && clickDuration < 300) {
                this.onClick(evt);
            }

            this.pointerState.isDown = false;
            this.pointerState.isDragging = false;
            this.onPointerUp(evt);
        };

        // Mouse wheel for zoom
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
                this.onMouseWheel(pointerInfo.event);
            }
        });

        // Double click detection
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
                this.onDoubleClick(pointerInfo.event);
            }
        });
    }

    setupTouchInput() {
        this.scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.event.pointerType === "touch") {
                        this.onTouchStart(pointerInfo.event);
                    }
                    break;

                case BABYLON.PointerEventTypes.POINTERMOVE:
                    if (pointerInfo.event.pointerType === "touch") {
                        this.onTouchMove(pointerInfo.event);
                    }
                    break;

                case BABYLON.PointerEventTypes.POINTERUP:
                    if (pointerInfo.event.pointerType === "touch") {
                        this.onTouchEnd(pointerInfo.event);
                    }
                    break;
            }
        });
    }

    setupKeyboardInput() {
        // Keyboard down events
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    this.keyboardState.add(kbInfo.event.code);
                    this.onKeyDown(kbInfo.event);
                    break;

                case BABYLON.KeyboardEventTypes.KEYUP:
                    this.keyboardState.delete(kbInfo.event.code);
                    this.onKeyUp(kbInfo.event);
                    break;
            }
        });

        // Setup hotkeys
        this.setupHotkeys();
    }

    setupHotkeys() {
        this.hotkeys = new Map([
            ['KeyB', { action: () => this.onBuildHotkey(), description: 'منوی ساخت' }],
            ['KeyA', { action: () => this.onAttackHotkey(), description: 'حالت حمله' }],
            ['KeyU', { action: () => this.onUnitsHotkey(), description: 'منوی نیروها' }],
            ['KeyM', { action: () => this.onMapHotkey(), description: 'نقشه جهان' }],
            ['KeyS', { action: () => this.onSettingsHotkey(), description: 'تنظیمات' }],
            ['Escape', { action: () => this.onEscapeHotkey(), description: 'بستن منوها' }],
            ['KeyR', { action: () => this.onRotateCamera(), description: 'چرخش دوربین' }],
            ['KeyZ', { action: () => this.onZoomIn(), description: 'زوم این' }],
            ['KeyX', { action: () => this.onZoomOut(), description: 'زوم اوت' }],
            ['Space', { action: () => this.onCenterCamera(), description: 'مرکز پایگاه' }],
            ['KeyQ', { action: () => this.onQuickSave(), description: 'ذخیره سریع' }],
            ['KeyL', { action: () => this.onQuickLoad(), description: 'بارگذاری سریع' }],
            ['KeyP', { action: () => this.onPauseGame(), description: 'توقف بازی' }],
            ['Digit1', { action: () => this.onSelectGroup(1), description: 'انتخاب گروه ۱' }],
            ['Digit2', { action: () => this.onSelectGroup(2), description: 'انتخاب گروه ۲' }],
            ['Digit3', { action: () => this.onSelectGroup(3), description: 'انتخاب گروه ۳' }],
            ['ControlLeft', { action: () => this.onAddToSelection(), description: 'افزودن به انتخاب' }],
            ['ShiftLeft', { action: () => this.onPanMode(), description: 'حالت جابجایی' }]
        ]);
    }

    setupGestures() {
        this.gestures.set('doubleTap', {
            lastTapTime: 0,
            tapCount: 0,
            timeout: null
        });

        this.gestures.set('longPress', {
            timeout: null,
            duration: 800
        });

        this.gestures.set('pinch', {
            initialDistance: 0,
            currentDistance: 0
        });
    }

    setupContextMenu() {
        // Prevent default right-click menu
        const canvas = this.scene.getEngine().getRenderingCanvas();
        if (canvas) {
            canvas.addEventListener('contextmenu', (evt) => {
                evt.preventDefault();
                this.onRightClick(evt);
            });
        }
    }

    // Control mode management
    setControlMode(mode) {
        if (this.controlModes[mode]) {
            this.currentControlMode = this.controlModes[mode];
            this.onControlModeChanged(mode);
        }
    }

    onControlModeChanged(newMode) {
        console.log(`Control mode changed to: ${newMode}`);
        
        // Reset input states when changing modes
        this.pointerState.isDown = false;
        this.pointerState.isDragging = false;
        this.selectionState.isSelecting = false;
        
        // Clean up any temporary meshes
        if (this.selectionState.selectionBox) {
            this.selectionState.selectionBox.dispose();
            this.selectionState.selectionBox = null;
        }

        this.emit('controlModeChanged', { mode: newMode });
    }

    // Selection system for unit groups
    startSelection(evt) {
        // Don't start selection in building placement mode
        if (this.currentControlMode === this.controlModes.BUILDING_PLACEMENT) {
            return;
        }

        this.selectionState.isSelecting = true;
        this.selectionState.selectionStart = new BABYLON.Vector2(evt.clientX, evt.clientY);
        this.selectionState.selectionEnd = this.selectionState.selectionStart.clone();
        
        this.createSelectionBox();
    }

    updateSelection(evt) {
        this.selectionState.selectionEnd = new BABYLON.Vector2(evt.clientX, evt.clientY);
        this.updateSelectionBox();
    }

    finishSelection(evt) {
        this.selectionState.isSelecting = false;
        
        // Select units in selection box
        this.selectUnitsInBox();
        
        // Remove selection box
        if (this.selectionState.selectionBox) {
            this.selectionState.selectionBox.dispose();
            this.selectionState.selectionBox = null;
        }
    }

    createSelectionBox() {
        // Create a transparent box for selection visualization
        const selectionBox = BABYLON.MeshBuilder.CreatePlane("selectionBox", {
            width: 1,
            height: 1
        }, this.scene);

        const material = new BABYLON.StandardMaterial("selectionMat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
        material.alpha = 0.3;
        material.emissiveColor = new BABYLON.Color3(0, 0.2, 0.5);
        material.sideOrientation = BABYLON.Mesh.DOUBLESIDE;
        selectionBox.material = material;

        selectionBox.isPickable = false;
        selectionBox.rotation.x = Math.PI / 2; // Make it horizontal
        this.selectionState.selectionBox = selectionBox;
    }

    updateSelectionBox() {
        if (!this.selectionState.selectionBox) return;

        const start = this.selectionState.selectionStart;
        const end = this.selectionState.selectionEnd;
        
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        
        if (width < 5 || height < 5) return; // Minimum size

        const centerX = (start.x + end.x) / 2;
        const centerY = (start.y + end.y) / 2;

        // Convert screen coordinates to world position (on ground plane)
        const pickResult = this.scene.pick(centerX, centerY);
        if (pickResult.hit) {
            this.selectionState.selectionBox.position = pickResult.pickedPoint;
            this.selectionState.selectionBox.position.y = 0.1; // Slightly above ground
            this.selectionState.selectionBox.scaling.x = width * 0.01;
            this.selectionState.selectionBox.scaling.y = height * 0.01;
        }
    }

    selectUnitsInBox() {
        if (!window.unitSystem) return;

        const start = this.selectionState.selectionStart;
        const end = this.selectionState.selectionEnd;
        
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        const selectedUnits = new Set();

        // Check each unit if it's within selection bounds
        window.unitSystem.units.forEach((unit, unitId) => {
            if (!unit.isEnemy && unit.state !== 'dead' && unit.mesh) {
                const unitScreenPos = this.worldToScreen(unit.position);
                
                if (unitScreenPos &&
                    unitScreenPos.x >= minX && unitScreenPos.x <= maxX &&
                    unitScreenPos.y >= minY && unitScreenPos.y <= maxY) {
                    selectedUnits.add(unitId);
                }
            }
        });

        if (selectedUnits.size > 0) {
            // Check if we should add to existing selection or replace
            const addToSelection = this.keyboardState.has('ControlLeft') || 
                                 this.keyboardState.has('ControlRight');
            
            if (!addToSelection) {
                window.unitSystem.clearSelection();
            }
            
            selectedUnits.forEach(unitId => {
                window.unitSystem.selectUnit(unitId, true);
            });
            
            this.showSelectionFeedback(selectedUnits.size);
        }
    }

    worldToScreen(worldPos) {
        try {
            const vector = BABYLON.Vector3.Project(
                worldPos,
                BABYLON.Matrix.Identity(),
                this.scene.getTransformMatrix(),
                this.camera.viewport.toGlobal(
                    this.scene.getEngine().getRenderWidth(),
                    this.scene.getEngine().getRenderHeight()
                )
            );
            
            return new BABYLON.Vector2(vector.x, vector.y);
        } catch (error) {
            return null;
        }
    }

    showSelectionFeedback(unitCount) {
        const message = `${unitCount} واحد انتخاب شد`;
        if (window.uiManager) {
            window.uiManager.showNotification(message, 2000);
        }
    }

    // Mouse event handlers
    onPointerDown(evt) {
        // Start long press detection
        const longPressGesture = this.gestures.get('longPress');
        longPressGesture.timeout = setTimeout(() => {
            this.onLongPress(evt);
        }, longPressGesture.duration);

        this.emit('pointerDown', { 
            event: evt, 
            position: this.pointerState.currentPosition,
            button: evt.button 
        });
    }

    onPointerMove(evt) {
        // Update camera if dragging
        if (this.pointerState.isDragging && !this.selectionState.isSelecting) {
            if (this.keyboardState.has('ShiftLeft') || this.keyboardState.has('ShiftRight')) {
                this.handleCameraPan(evt);
            } else {
                this.handleCameraRotation(evt);
            }
        }

        this.emit('pointerMove', { 
            event: evt, 
            position: this.pointerState.currentPosition 
        });
    }

    onPointerUp(evt) {
        // Clear long press timeout
        clearTimeout(this.gestures.get('longPress').timeout);

        this.emit('pointerUp', { 
            event: evt, 
            position: this.pointerState.currentPosition 
        });
    }

    onClick(evt) {
        // Handle click based on current control mode
        switch (this.currentControlMode) {
            case this.controlModes.BUILDING_PLACEMENT:
                this.handleBuildingPlacementClick(evt);
                break;
            case this.controlModes.UNIT_DEPLOYMENT:
                this.handleUnitDeploymentClick(evt);
                break;
            case this.controlModes.COMBAT:
                this.handleCombatClick(evt);
                break;
            default:
                this.handleNormalClick(evt);
        }

        this.emit('click', { 
            event: evt, 
            position: this.pointerState.currentPosition,
            controlMode: this.currentControlMode
        });
    }

    onDoubleClick(evt) {
        const pickResult = this.scene.pick(evt.clientX, evt.clientY);
        
        if (pickResult.hit) {
            this.handleObjectDoubleClick(pickResult, evt);
        } else if (pickResult.pickedPoint) {
            this.handleGroundDoubleClick(pickResult.pickedPoint, evt);
        }

        this.emit('doubleClick', { 
            event: evt, 
            position: this.pointerState.currentPosition,
            pickResult: pickResult 
        });
    }

    onRightClick(evt) {
        const pickResult = this.scene.pick(evt.clientX, evt.clientY);
        
        if (pickResult.hit) {
            this.showContextMenu(pickResult, evt);
        } else if (pickResult.pickedPoint) {
            this.handleGroundRightClick(pickResult.pickedPoint, evt);
        }

        this.emit('rightClick', { 
            event: evt, 
            position: this.pointerState.currentPosition,
            pickResult: pickResult 
        });
    }

    onMouseWheel(evt) {
        const delta = evt.deltaY > 0 ? -1 : 1;
        this.handleCameraZoom(delta);
        
        this.emit('mouseWheel', { 
            event: evt, 
            delta: delta 
        });
    }

    onLongPress(evt) {
        const pickResult = this.scene.pick(evt.clientX, evt.clientY);
        
        if (pickResult.hit) {
            this.handleObjectLongPress(pickResult, evt);
        }

        this.emit('longPress', { 
            event: evt, 
            position: this.pointerState.currentPosition,
            pickResult: pickResult 
        });
    }

    onDrag(evt) {
        // Handle drag operations based on control mode
        this.emit('drag', {
            event: evt,
            startPosition: this.pointerState.startPosition,
            currentPosition: this.pointerState.currentPosition,
            controlMode: this.currentControlMode
        });
    }

    // Touch event handlers
    onTouchStart(evt) {
        this.touchState.isTouching = true;
        this.touchState.touchCount = evt.touches.length;
        this.touchState.touchStartTime = Date.now();

        if (evt.touches.length === 2) {
            this.startPinchGesture(evt);
        } else if (evt.touches.length === 1) {
            this.pointerState.startPosition = new BABYLON.Vector2(
                evt.touches[0].clientX, 
                evt.touches[0].clientY
            );
        }

        this.emit('touchStart', { 
            event: evt, 
            touchCount: this.touchState.touchCount 
        });
    }

    onTouchMove(evt) {
        if (evt.touches.length === 2 && this.touchState.isPinching) {
            this.handlePinchGesture(evt);
        } else if (evt.touches.length === 1 && this.touchState.isTouching) {
            this.handleTouchPan(evt);
        }

        this.emit('touchMove', { 
            event: evt, 
            touchCount: evt.touches.length 
        });
    }

    onTouchEnd(evt) {
        const touchDuration = Date.now() - this.touchState.touchStartTime;
        
        // Handle tap (quick touch)
        if (touchDuration < 300 && evt.touches.length === 0) {
            this.onTouchTap(evt);
        }

        this.touchState.isTouching = false;
        this.touchState.isPinching = false;
        this.touchState.touchCount = 0;

        this.emit('touchEnd', { 
            event: evt 
        });
    }

    onTouchTap(evt) {
        const touch = evt.changedTouches[0];
        const pickResult = this.scene.pick(touch.clientX, touch.clientY);
        
        if (pickResult.hit) {
            this.handleObjectClick(pickResult, evt);
        } else if (pickResult.pickedPoint) {
            this.handleGroundClick(pickResult.pickedPoint, evt);
        }

        this.emit('touchTap', { 
            event: evt, 
            position: new BABYLON.Vector2(touch.clientX, touch.clientY),
            pickResult: pickResult 
        });
    }

    // Keyboard event handlers
    onKeyDown(evt) {
        const hotkey = this.hotkeys.get(evt.code);
        if (hotkey && !evt.repeat) {
            hotkey.action();
            evt.preventDefault();
        }

        // Handle camera movement keys
        this.handleCameraMovementKeys();

        this.emit('keyDown', { 
            event: evt, 
            key: evt.key, 
            code: evt.code 
        });
    }

    onKeyUp(evt) {
        this.emit('keyUp', { 
            event: evt, 
            key: evt.key, 
            code: evt.code 
        });
    }

    // Control mode specific click handlers
    handleNormalClick(evt) {
        const pickResult = this.scene.pick(evt.clientX, evt.clientY);
        
        if (pickResult.hit) {
            this.handleObjectClick(pickResult, evt);
        } else if (pickResult.pickedPoint) {
            this.handleGroundClick(pickResult.pickedPoint, evt);
        }
    }

    handleBuildingPlacementClick(evt) {
        const pickResult = this.scene.pick(evt.clientX, evt.clientY);
        
        if (pickResult.hit && pickResult.pickedPoint) {
            if (window.buildingSystem && window.buildingSystem.currentBuildingType) {
                window.buildingSystem.placeBuilding(
                    window.buildingSystem.currentBuildingType, 
                    pickResult.pickedPoint
                );
            }
        }
    }

    handleUnitDeploymentClick(evt) {
        const pickResult = this.scene.pick(evt.clientX, evt.clientY);
        
        if (pickResult.hit && pickResult.pickedPoint) {
            if (window.combatSystem) {
                window.combatSystem.deployUnitsAtPosition(pickResult.pickedPoint);
            }
        }
    }

    handleCombatClick(evt) {
        const pickResult = this.scene.pick(evt.clientX, evt.clientY);
        
        if (pickResult.hit) {
            this.handleObjectClick(pickResult, evt);
        } else if (pickResult.pickedPoint) {
            this.handleGroundClick(pickResult.pickedPoint, evt);
        }
    }

    // Camera control methods
    handleCameraRotation(evt) {
        if (!this.camera || !this.pointerState.isDragging) return;

        const deltaX = this.pointerState.currentPosition.x - this.pointerState.startPosition.x;
        const deltaY = this.pointerState.currentPosition.y - this.pointerState.startPosition.y;

        // Rotate camera around target
        this.camera.alpha -= deltaX * this.cameraControls.rotationSpeed;
        this.camera.beta -= deltaY * this.cameraControls.rotationSpeed;

        // Clamp vertical rotation
        this.camera.beta = Math.max(
            Math.PI / 6, // 30 degrees minimum
            Math.min(this.camera.beta, Math.PI / 2 - 0.1) // 90 degrees maximum
        );

        // Update start position for smooth dragging
        this.pointerState.startPosition = this.pointerState.currentPosition.clone();
    }

    handleCameraPan(evt) {
        if (!this.camera || !this.pointerState.isDragging) return;

        const deltaX = this.pointerState.currentPosition.x - this.pointerState.startPosition.x;
        const deltaY = this.pointerState.currentPosition.y - this.pointerState.startPosition.y;

        // Calculate pan direction in world space
        const right = BABYLON.Vector3.Cross(this.camera.upVector, this.camera.getDirection(BABYLON.Vector3.Forward()));
        const up = this.camera.upVector.clone();

        right.normalize();
        up.normalize();

        // Apply pan movement
        const panAmount = this.cameraControls.panSpeed * (this.camera.radius / this.cameraControls.maxZoom);
        this.camera.target.addInPlace(right.scale(-deltaX * panAmount));
        this.camera.target.addInPlace(up.scale(deltaY * panAmount));

        // Update start position
        this.pointerState.startPosition = this.pointerState.currentPosition.clone();
    }

    handleCameraZoom(delta) {
        if (!this.camera) return;

        const zoomAmount = delta * this.cameraControls.zoomSpeed;
        let newRadius = this.camera.radius * (1 - zoomAmount);

        // Clamp zoom level
        newRadius = Math.max(
            this.cameraControls.minZoom,
            Math.min(newRadius, this.cameraControls.maxZoom)
        );

        // Smooth zoom with inertia
        this.camera.radius = BABYLON.Scalar.Lerp(
            this.camera.radius,
            newRadius,
            1 - this.cameraControls.zoomInertia
        );
    }

    handleCameraMovementKeys() {
        if (!this.camera) return;

        const moveSpeed = 0.5 * (this.camera.radius / this.cameraControls.maxZoom);
        const right = BABYLON.Vector3.Cross(this.camera.upVector, this.camera.getDirection(BABYLON.Vector3.Forward()));
        const forward = this.camera.getDirection(BABYLON.Vector3.Forward());

        right.normalize();
        forward.normalize();

        // WASD movement
        if (this.keyboardState.has('KeyW')) {
            this.camera.target.addInPlace(forward.scale(moveSpeed));
        }
        if (this.keyboardState.has('KeyS')) {
            this.camera.target.addInPlace(forward.scale(-moveSpeed));
        }
        if (this.keyboardState.has('KeyA')) {
            this.camera.target.addInPlace(right.scale(-moveSpeed));
        }
        if (this.keyboardState.has('KeyD')) {
            this.camera.target.addInPlace(right.scale(moveSpeed));
        }
    }

    handleTouchPan(evt) {
        if (!this.camera || evt.touches.length !== 1) return;

        const touch = evt.touches[0];
        const currentPosition = new BABYLON.Vector2(touch.clientX, touch.clientY);

        if (!this.pointerState.startPosition) {
            this.pointerState.startPosition = currentPosition.clone();
        }

        const deltaX = currentPosition.x - this.pointerState.startPosition.x;
        const deltaY = currentPosition.y - this.pointerState.startPosition.y;

        // Pan camera
        const right = BABYLON.Vector3.Cross(this.camera.upVector, this.camera.getDirection(BABYLON.Vector3.Forward()));
        const up = this.camera.upVector.clone();

        right.normalize();
        up.normalize();

        const panAmount = this.cameraControls.panSpeed * 2 * (this.camera.radius / this.cameraControls.maxZoom);
        this.camera.target.addInPlace(right.scale(-deltaX * panAmount));
        this.camera.target.addInPlace(up.scale(deltaY * panAmount));

        this.pointerState.startPosition = currentPosition.clone();
    }

    startPinchGesture(evt) {
        if (evt.touches.length !== 2) return;

        const touch1 = evt.touches[0];
        const touch2 = evt.touches[1];

        this.touchState.pinchStartDistance = this.calculateTouchDistance(touch1, touch2);
        this.touchState.currentPinchDistance = this.touchState.pinchStartDistance;
        this.touchState.isPinching = true;
    }

    handlePinchGesture(evt) {
        if (evt.touches.length !== 2 || !this.touchState.isPinching) return;

        const touch1 = evt.touches[0];
        const touch2 = evt.touches[1];

        this.touchState.currentPinchDistance = this.calculateTouchDistance(touch1, touch2);
        
        const pinchDelta = this.touchState.currentPinchDistance - this.touchState.pinchStartDistance;
        const zoomDelta = -pinchDelta * 0.01; // Convert to zoom amount

        this.handleCameraZoom(zoomDelta);

        this.touchState.pinchStartDistance = this.touchState.currentPinchDistance;
    }

    calculateTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Object interaction handlers
    handleObjectClick(pickResult, evt) {
        const pickedMesh = pickResult.pickedMesh;
        
        if (!pickedMesh) return;

        // Check what type of object was clicked
        if (pickedMesh.name.includes('building') || pickedMesh.buildingId) {
            this.onBuildingClick(pickedMesh, evt);
        } else if (pickedMesh.name.includes('unit') || pickedMesh.unitId) {
            this.onUnitClick(pickedMesh, evt);
        } else if (pickedMesh.name.includes('resource')) {
            this.onResourceClick(pickedMesh, evt);
        } else {
            this.onEnvironmentClick(pickedMesh, evt);
        }
    }

    handleGroundClick(position, evt) {
        // Ground click - move selected units or clear selection
        if (window.unitSystem && window.unitSystem.selectedUnits.size > 0) {
            window.unitSystem.moveSelectedUnitsTo(position);
            this.showMoveIndicator(position);
        } else {
            // Clear selection if clicking empty ground
            if (window.unitSystem) {
                window.unitSystem.clearSelection();
            }
        }

        this.emit('groundClick', { 
            position: position, 
            event: evt 
        });
    }

    handleObjectDoubleClick(pickResult, evt) {
        const pickedMesh = pickResult.pickedMesh;
        
        if (pickedMesh.name.includes('building') || pickedMesh.buildingId) {
            // Focus camera on building and show info
            this.focusCameraOnObject(pickedMesh);
            
            if (window.buildingSystem) {
                const building = this.findBuildingByMesh(pickedMesh);
                if (building) {
                    window.buildingSystem.showBuildingInfoPanel(building);
                }
            }
        } else if (pickedMesh.name.includes('unit') || pickedMesh.unitId) {
            // Select all units of same type
            this.selectAllUnitsOfType(pickedMesh.unitId);
        }

        this.emit('objectDoubleClick', { 
            mesh: pickedMesh, 
            event: evt,
            pickResult: pickResult 
        });
    }

    handleGroundDoubleClick(position, evt) {
        // Quick select all nearby units
        if (window.unitSystem) {
            this.quickSelectUnits(position);
        }

        this.emit('groundDoubleClick', { 
            position: position, 
            event: evt 
        });
    }

    handleGroundRightClick(position, evt) {
        // Right click on ground - set rally point or show context menu
        if (window.unitSystem && window.unitSystem.selectedUnits.size > 0) {
            window.unitSystem.moveSelectedUnitsTo(position);
            this.showMoveIndicator(position);
        }

        this.emit('groundRightClick', { 
            position: position, 
            event: evt 
        });
    }

    handleObjectLongPress(pickResult, evt) {
        const pickedMesh = pickResult.pickedMesh;
        
        if (pickedMesh.name.includes('building') || pickedMesh.buildingId) {
            // Enter building edit mode
            this.enterBuildingEditMode(pickedMesh);
        }

        this.emit('objectLongPress', { 
            mesh: pickedMesh, 
            event: evt,
            pickResult: pickResult 
        });
    }

    // Object-specific click handlers
    onBuildingClick(mesh, evt) {
        const building = this.findBuildingByMesh(mesh);
        if (!building) return;

        if (window.buildingSystem) {
            window.buildingSystem.onBuildingClicked(building);
        }

        this.emit('buildingClick', { 
            building: building, 
            mesh: mesh, 
            event: evt 
        });
    }

    onUnitClick(mesh, evt) {
        const unitId = mesh.unitId;
        if (!unitId || !window.unitSystem) return;

        const unit = window.unitSystem.units.get(unitId);
        if (!unit) return;

        const addToSelection = evt.ctrlKey || evt.metaKey || evt.shiftKey;
        window.unitSystem.selectUnit(unitId, addToSelection);

        this.emit('unitClick', { 
            unit: unit, 
            mesh: mesh, 
            event: evt 
        });
    }

    onResourceClick(mesh, evt) {
        // Collect resource
        if (window.resourceManager) {
            if (mesh.name.includes('gold')) {
                window.resourceManager.addResource('gold', 100);
            } else if (mesh.name.includes('elixir')) {
                window.resourceManager.addResource('elixir', 50);
            }
            
            // Show collection effect
            if (window.gameEngine) {
                window.gameEngine.createParticleSystem('magic', mesh.position);
            }
        }

        this.emit('resourceClick', { 
            mesh: mesh, 
            event: evt 
        });
    }

    onEnvironmentClick(mesh, evt) {
        // Handle environment objects (trees, rocks, etc.)
        if (mesh.name.includes('tree')) {
            this.onTreeClick(mesh, evt);
        }

        this.emit('environmentClick', { 
            mesh: mesh, 
            event: evt 
        });
    }

    onTreeClick(mesh, evt) {
        // Remove tree and give resources
        if (window.resourceManager) {
            window.resourceManager.addResource('gold', 10);
            window.resourceManager.addResource('elixir', 5);
        }

        // Show collection effect
        if (window.gameEngine) {
            window.gameEngine.createParticleSystem('magic', mesh.position);
        }

        // Remove tree after delay
        setTimeout(() => {
            mesh.dispose();
        }, 1000);

        this.emit('treeClick', { 
            mesh: mesh, 
            event: evt 
        });
    }

    // Utility methods
    findBuildingByMesh(mesh) {
        if (!window.buildingSystem) return null;

        for (let [id, building] of window.buildingSystem.buildings) {
            if (building.mesh === mesh) {
                return building;
            }
        }
        return null;
    }

    quickSelectUnits(centerPosition) {
        if (!window.unitSystem) return;

        const selectionRadius = 15;
        const nearbyUnits = [];

        window.unitSystem.units.forEach(unit => {
            if (!unit.isEnemy && unit.state !== 'dead') {
                const distance = BABYLON.Vector3.Distance(unit.position, centerPosition);
                if (distance <= selectionRadius) {
                    nearbyUnits.push(unit.id);
                }
            }
        });

        if (nearbyUnits.length > 0) {
            window.unitSystem.clearSelection();
            nearbyUnits.forEach(unitId => {
                window.unitSystem.selectUnit(unitId, true);
            });

            this.showSelectionFeedback(nearbyUnits.length);
        }
    }

    selectAllUnitsOfType(unitId) {
        if (!window.unitSystem) return;

        const targetUnit = window.unitSystem.units.get(unitId);
        if (!targetUnit) return;

        const sameTypeUnits = [];
        window.unitSystem.units.forEach((unit, id) => {
            if (!unit.isEnemy && unit.state !== 'dead' && unit.type === targetUnit.type) {
                sameTypeUnits.push(id);
            }
        });

        if (sameTypeUnits.length > 0) {
            window.unitSystem.clearSelection();
            sameTypeUnits.forEach(id => {
                window.unitSystem.selectUnit(id, true);
            });

            this.showSelectionFeedback(sameTypeUnits.length);
        }
    }

    showMoveIndicator(position) {
        // Create move order effect
        const ring = BABYLON.MeshBuilder.CreateTorus("moveIndicator", {
            diameter: 2,
            thickness: 0.2,
            tessellation: 16
        }, this.scene);

        const material = new BABYLON.StandardMaterial("moveIndicatorMat", this.scene);
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
            ring.scaling.set(1 + progress, 1 + progress, 1 + progress);
            material.alpha = 0.8 * (1 - progress);
        });
    }

    focusCameraOnObject(mesh) {
        if (!this.camera || !mesh) return;

        const boundingBox = mesh.getBoundingInfo().boundingBox;
        const center = boundingBox.centerWorld;
        const size = boundingBox.extendSizeWorld.length();

        // Calculate camera position to fit object in view
        const distance = size * 3;
        
        this.animateCameraToTarget(center, distance);
    }

    animateCameraToTarget(target, distance) {
        const startTarget = this.camera.target.clone();
        const startRadius = this.camera.radius;
        const duration = 1000; // ms
        const startTime = Date.now();

        this.scene.registerBeforeRender(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                this.camera.target = target;
                this.camera.radius = distance;
                return;
            }

            const progress = elapsed / duration;
            const smoothProgress = this.easeInOutCubic(progress);

            this.camera.target = BABYLON.Vector3.Lerp(startTarget, target, smoothProgress);
            this.camera.radius = BABYLON.Scalar.Lerp(startRadius, distance, smoothProgress);
        });
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    enterBuildingEditMode(mesh) {
        const building = this.findBuildingByMesh(mesh);
        if (!building || !window.buildingSystem) return;

        // Show edit mode UI
        this.showEditModeUI(building);

        this.emit('editModeEnter', { 
            building: building, 
            mesh: mesh 
        });
    }

    showEditModeUI(building) {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("editModeUI");
        
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "300px";
        panel.height = "200px";
        panel.background = "rgba(0,0,50,0.9)";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        panel.top = "100px";
        advancedTexture.addControl(panel);

        const title = new BABYLON.GUI.TextBlock();
        title.text = "حالت ویرایش ساختمان";
        title.color = "gold";
        title.fontSize = 24;
        title.height = "40px";
        panel.addControl(title);

        const moveButton = BABYLON.GUI.Button.CreateSimpleButton("move", "جابجایی ساختمان");
        moveButton.width = "200px";
        moveButton.height = "40px";
        moveButton.color = "white";
        moveButton.background = "blue";
        moveButton.onPointerClickObservable.add(() => {
            this.startBuildingMove(building);
            advancedTexture.dispose();
        });
        panel.addControl(moveButton);

        const deleteButton = BABYLON.GUI.Button.CreateSimpleButton("delete", "حذف ساختمان");
        deleteButton.width = "200px";
        deleteButton.height = "40px";
        deleteButton.color = "white";
        deleteButton.background = "red";
        deleteButton.onPointerClickObservable.add(() => {
            if (confirm("آیا مطمئنید می‌خواهید این ساختمان را حذف کنید؟")) {
                window.buildingSystem.destroyBuilding(building.id);
            }
            advancedTexture.dispose();
        });
        panel.addControl(deleteButton);

        const cancelButton = BABYLON.GUI.Button.CreateSimpleButton("cancel", "انصراف");
        cancelButton.width = "200px";
        cancelButton.height = "40px";
        cancelButton.color = "white";
        cancelButton.background = "gray";
        cancelButton.onPointerClickObservable.add(() => {
            advancedTexture.dispose();
        });
        panel.addControl(cancelButton);
    }

    startBuildingMove(building) {
        if (!window.buildingSystem) return;

        // Create ghost building for movement
        window.buildingSystem.createGhostBuilding(building.type);
        window.buildingSystem.ghostMesh.position = building.position.clone();

        // Set up movement mode
        const originalPointerMove = this.scene.onPointerMove;
        const originalPointerDown = this.scene.onPointerDown;

        this.scene.onPointerMove = (evt) => {
            if (window.buildingSystem.ghostMesh) {
                const pickResult = this.scene.pick(evt.clientX, evt.clientY);
                if (pickResult.hit) {
                    const snappedPos = window.buildingSystem.snapToGrid(pickResult.pickedPoint);
                    window.buildingSystem.ghostMesh.position = snappedPos;
                    
                    const isValid = window.buildingSystem.isValidBuildingPosition(snappedPos, building.type);
                    window.buildingSystem.ghostMesh.material.diffuseColor = isValid ? 
                        new BABYLON.Color3(0, 1, 0) : 
                        new BABYLON.Color3(1, 0, 0);
                }
            }
        };

        this.scene.onPointerDown = (evt) => {
            const pickResult = this.scene.pick(evt.clientX, evt.clientY);
            if (pickResult.hit && window.buildingSystem.ghostMesh) {
                const snappedPos = window.buildingSystem.snapToGrid(pickResult.pickedPoint);
                
                if (window.buildingSystem.isValidBuildingPosition(snappedPos, building.type)) {
                    window.buildingSystem.moveBuilding(building.id, snappedPos);
                }
                
                // Exit move mode
                window.buildingSystem.ghostMesh.dispose();
                window.buildingSystem.ghostMesh = null;
                
                // Restore original input handlers
                this.scene.onPointerMove = originalPointerMove;
                this.scene.onPointerDown = originalPointerDown;
            }
        };
    }

    showContextMenu(pickResult, evt) {
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("contextMenu");
        
        const panel = new BABYLON.GUI.StackPanel();
        panel.width = "200px";
        panel.height = "150px";
        panel.background = "rgba(0,0,0,0.9)";
        panel.left = evt.clientX + "px";
        panel.top = evt.clientY + "px";
        panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        advancedTexture.addControl(panel);

        const menuItems = [
            { text: "اطلاعات", action: () => this.showObjectInfo(pickResult) },
            { text: "انتخاب همه", action: () => this.selectAllUnits() },
            { text: "تنظیمات سریع", action: () => this.showQuickSettings() }
        ];

        menuItems.forEach(item => {
            const button = BABYLON.GUI.Button.CreateSimpleButton("ctx_" + item.text, item.text);
            button.width = "180px";
            button.height = "40px";
            button.color = "white";
            button.background = "rgba(50,50,50,0.8)";
            button.onPointerClickObservable.add(() => {
                item.action();
                advancedTexture.dispose();
            });
            panel.addControl(button);
        });

        // Auto-close when clicking elsewhere
        setTimeout(() => {
            const closeHandler = () => {
                advancedTexture.dispose();
                this.scene.onPointerDown = this.scene.onPointerDown; // Restore original
            };
            this.scene.onPointerDown = closeHandler;
        }, 100);
    }

    showObjectInfo(pickResult) {
        // Show information about clicked object
        console.log("Object info:", pickResult.pickedMesh);
        
        if (window.uiManager) {
            window.uiManager.showNotification("اطلاعات شیء نمایش داده شد", 2000);
        }
    }

    selectAllUnits() {
        if (window.unitSystem) {
            window.unitSystem.clearSelection();
            window.unitSystem.units.forEach((unit, id) => {
                if (!unit.isEnemy && unit.state !== 'dead') {
                    window.unitSystem.selectUnit(id, true);
                }
            });
            
            this.showSelectionFeedback(window.unitSystem.selectedUnits.size);
        }
    }

    showQuickSettings() {
        if (window.uiManager) {
            window.uiManager.showSettingsMenu();
        }
    }

    // Hotkey actions
    onBuildHotkey() {
        if (window.uiManager) {
            window.uiManager.showBuildingMenu();
        }
    }

    onAttackHotkey() {
        if (window.uiManager) {
            window.uiManager.startAttack();
        }
    }

    onUnitsHotkey() {
        if (window.uiManager) {
            window.uiManager.showUnitTrainingMenu();
        }
    }

    onMapHotkey() {
        if (window.uiManager) {
            window.uiManager.showWorldMap();
        }
    }

    onSettingsHotkey() {
        if (window.uiManager) {
            window.uiManager.showSettingsMenu();
        }
    }

    onEscapeHotkey() {
        if (window.uiManager) {
            window.uiManager.hideAllMenus();
        }
        
        // Clear unit selection
        if (window.unitSystem) {
            window.unitSystem.clearSelection();
        }

        // Exit building placement mode
        if (this.currentControlMode === this.controlModes.BUILDING_PLACEMENT) {
            this.setControlMode(this.controlModes.NORMAL);
        }
    }

    onRotateCamera() {
        // Rotate camera 90 degrees
        if (this.camera) {
            this.camera.alpha += Math.PI / 2;
        }
    }

    onZoomIn() {
        this.handleCameraZoom(-1);
    }

    onZoomOut() {
        this.handleCameraZoom(1);
    }

    onCenterCamera() {
        if (this.camera) {
            this.animateCameraToTarget(new BABYLON.Vector3(0, 0, 0), 30);
        }
    }

    onQuickSave() {
        if (window.gameState) {
            window.gameState.saveGameData();
        }
    }

    onQuickLoad() {
        if (window.gameState) {
            window.gameState.loadGameData();
        }
    }

    onPauseGame() {
        if (window.game) {
            window.game.pauseGame();
        }
    }

    onSelectGroup(groupNumber) {
        if (window.unitSystem) {
            window.unitSystem.selectGroup(groupNumber);
        }
    }

    onAddToSelection() {
        // This is handled in the selection logic
        // The Ctrl key state is checked during selection
    }

    onPanMode() {
        // This is handled in the drag logic
        // The Shift key state is checked during dragging
    }

    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    // Update loop
    updateInput() {
        this.updateCameraInertia();
        this.updateInputState();
    }

    updateCameraInertia() {
        // Apply inertia to camera movements for smooth stopping
        if (this.camera) {
            this.camera.inertialAlphaOffset *= this.cameraControls.rotationInertia;
            this.camera.inertialBetaOffset *= this.cameraControls.rotationInertia;
            this.camera.inertialRadiusOffset *= this.cameraControls.zoomInertia;
        }
    }

    updateInputState() {
        // Update any ongoing input states
        const currentTime = Date.now();
        
        // Clear drag state if no movement for a while
        if (this.pointerState.isDragging && 
            currentTime - this.pointerState.dragStartTime > 10000) {
            this.pointerState.isDragging = false;
        }

        // Update continuous key states
        this.handleContinuousInput();
    }

    handleContinuousInput() {
        // Handle continuous keyboard input for camera movement
        if (this.keyboardState.size > 0) {
            this.handleCameraMovementKeys();
        }
    }

    // Public methods for external control
    enableCameraControls() {
        if (this.camera && this.camera.inputs) {
            this.camera.inputs.attached.pointers = true;
            this.camera.inputs.attached.keyboard = true;
            this.camera.inputs.attached.mousewheel = true;
        }
    }

    disableCameraControls() {
        if (this.camera && this.camera.inputs) {
            this.camera.inputs.attached.pointers = false;
            this.camera.inputs.attached.keyboard = false;
            this.camera.inputs.attached.mousewheel = false;
        }
    }

    setCameraSensitivity(sensitivity) {
        this.cameraControls.rotationSpeed = sensitivity * 0.005;
        this.cameraControls.panSpeed = sensitivity * 0.8;
    }

    // Debug methods
    enableDebugMode() {
        this.debugMode = true;
        console.log('Debug mode enabled for InputManager');
    }

    disableDebugMode() {
        this.debugMode = false;
        console.log('Debug mode disabled for InputManager');
    }

    printInputState() {
        console.log('Input State:', {
            pointerState: this.pointerState,
            touchState: this.touchState,
            keyboardState: Array.from(this.keyboardState),
            controlMode: this.currentControlMode,
            selectionState: this.selectionState
        });
    }

    // Cleanup method
    dispose() {
        // Clear all event listeners
        this.eventListeners.clear();
        
        // Clear intervals and timeouts
        clearTimeout(this.gestures.get('longPress').timeout);
        
        // Remove selection box if exists
        if (this.selectionState.selectionBox) {
            this.selectionState.selectionBox.dispose();
        }
        
        // Reset input states
        this.pointerState.isDown = false;
        this.pointerState.isDragging = false;
        this.touchState.isTouching = false;
        this.touchState.isPinching = false;
        this.selectionState.isSelecting = false;
        
        console.log('InputManager disposed');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputManager;
          }
