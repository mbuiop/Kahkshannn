// m6.js - سیستم فیزیک و تشخیص برخورد
class PhysicsSystem {
    constructor() {
        this.gravity = new THREE.Vector3(0, 0, 0);
        this.colliders = [];
        this.raycaster = new THREE.Raycaster();
        this.collisionLayers = {
            DEFAULT: 1,
            PLAYER: 2,
            ENEMY: 4,
            PROJECTILE: 8,
            POWERUP: 16
        };
        
        this.init();
    }
    
    init() {
        console.log("سیستم فیزیک راه‌اندازی شد");
    }
    
    update(deltaTime) {
        // به‌روزرسانی فیزیک
        this.updateColliders();
    }
    
    updateColliders() {
        // به‌روزرسانی موقعیت کالیدرها
        for (const collider of this.colliders) {
            if (collider.object && collider.object.position) {
                collider.boundingBox.setFromObject(collider.object);
            }
        }
    }
    
    registerCollider(object, layer = this.collisionLayers.DEFAULT) {
        // ثبت کالیدر برای یک شیء
        const collider = {
            object: object,
            boundingBox: new THREE.Box3().setFromObject(object),
            layer: layer
        };
        
        this.colliders.push(collider);
        return collider;
    }
    
    unregisterCollider(collider) {
        // حذف کالیدر
        const index = this.colliders.indexOf(collider);
        if (index !== -1) {
            this.colliders.splice(index, 1);
        }
    }
    
    checkCollision(objectA, objectB) {
        // بررسی برخورد بین دو شیء
        const colliderA = this.getCollider(objectA);
        const colliderB = this.getCollider(objectB);
        
        if (!colliderA || !colliderB) {
            return false;
        }
        
        // بررسی لایه‌های برخورد
        if (!(colliderA.layer & colliderB.layer)) {
            return false;
        }
        
        // بررسی برخورد جعبه محدود
        return colliderA.boundingBox.intersectsBox(colliderB.boundingBox);
    }
    
    getCollider(object) {
        // پیدا کردن کالیدر مربوط به یک شیء
        return this.colliders.find(collider => collider.object === object);
    }
    
    raycast(origin, direction, distance = 100, layerMask = this.collisionLayers.DEFAULT) {
        // پرتاب پرتو و تشخیص برخورد
        this.raycaster.set(origin, direction);
        this.raycaster.far = distance;
        
        const collidableObjects = this.colliders
            .filter(collider => collider.layer & layerMask)
            .map(collider => collider.object);
        
        const intersects = this.raycaster.intersectObjects(collidableObjects);
        return intersects;
    }
    
    sphereCast(origin, radius, direction, distance = 100, layerMask = this.collisionLayers.DEFAULT) {
        // پرتاب کره و تشخیص برخورد
        const sphere = new THREE.Sphere(origin, radius);
        const collisions = [];
        
        const collidableObjects = this.colliders
            .filter(collider => collider.layer & layerMask)
            .map(collider => collider.object);
        
        for (const object of collidableObjects) {
            const collider = this.getCollider(object);
            if (collider && sphere.intersectsBox(collider.boundingBox)) {
                collisions.push({
                    object: object,
                    point: this.getClosestPointOnBox(sphere.center, collider.boundingBox),
                    distance: sphere.center.distanceTo(object.position)
                });
            }
        }
        
        // مرتب‌سازی بر اساس فاصله
        collisions.sort((a, b) => a.distance - b.distance);
        return collisions;
    }
    
    getClosestPointOnBox(point, box) {
        // پیدا کردن نزدیک‌ترین نقطه روی جعبه به نقطه داده شده
        const clampedPoint = point.clone();
        
        clampedPoint.x = THREE.MathUtils.clamp(clampedPoint.x, box.min.x, box.max.x);
        clampedPoint.y = THREE.MathUtils.clamp(clampedPoint.y, box.min.y, box.max.y);
        clampedPoint.z = THREE.MathUtils.clamp(clampedPoint.z, box.min.z, box.max.z);
        
        return clampedPoint;
    }
    
    checkPointInBox(point, box) {
        // بررسی اینکه آیا نقطه داخل جعبه است
        return point.x >= box.min.x && point.x <= box.max.x &&
               point.y >= box.min.y && point.y <= box.max.y &&
               point.z >= box.min.z && point.z <= box.max.z;
    }
    
    applyForce(object, force, deltaTime) {
        // اعمال نیرو به یک شیء
        if (!object.velocity) {
            object.velocity = new THREE.Vector3();
        }
        
        // F = ma (با فرض جرم 1)
        object.velocity.add(force.clone().multiplyScalar(deltaTime));
    }
    
    updatePosition(object, deltaTime) {
        // به‌روزرسانی موقعیت بر اساس سرعت
        if (object.velocity && object.position) {
            object.position.add(object.velocity.clone().multiplyScalar(deltaTime));
            
            // کاهش تدریجی سرعت (اصطکاک)
            object.velocity.multiplyScalar(0.98);
        }
    }
    
    resolveCollision(objectA, objectB, response = 'bounce') {
        // حل برخورد بین دو شیء
        const colliderA = this.getCollider(objectA);
        const colliderB = this.getCollider(objectB);
        
        if (!colliderA || !colliderB) {
            return;
        }
        
        switch(response) {
            case 'bounce':
                this.bounceCollision(objectA, objectB);
                break;
            case 'stop':
                this.stopCollision(objectA, objectB);
                break;
            case 'overlap':
                // هیچ کاری نکن - برای مواردی مثل power-up
                break;
        }
    }
    
    bounceCollision(objectA, objectB) {
        // برخورد ارتجاعی
        if (objectA.velocity && objectB.velocity) {
            // محاسبه جهت نرمال
            const normal = objectA.position.clone().sub(objectB.position).normalize();
            
            // سرعت نسبی
            const relativeVelocity = objectA.velocity.clone().sub(objectB.velocity);
            
            // سرعت در جهت نرمال
            const velocityAlongNormal = relativeVelocity.dot(normal);
            
            // اگر در حال دور شدن هستند، کاری نکن
            if (velocityAlongNormal > 0) return;
            
            // ضریب بازگشت
            const restitution = 0.8;
            
            // ضربه
            const j = -(1 + restitution) * velocityAlongNormal;
            
            // جرم (ساده‌شده)
            const invMassA = 1; // objectA.mass || 1;
            const invMassB = 1; // objectB.mass || 1;
            
            // اعمال ضربه
            const impulse = j / (invMassA + invMassB);
            const impulseVector = normal.multiplyScalar(impulse);
            
            objectA.velocity.add(impulseVector.clone().multiplyScalar(invMassA));
            objectB.velocity.sub(impulseVector.clone().multiplyScalar(invMassB));
        }
    }
    
    stopCollision(objectA, objectB) {
        // توقف در برخورد
        if (objectA.velocity) {
            objectA.velocity.set(0, 0, 0);
        }
        
        if (objectB.velocity) {
            objectB.velocity.set(0, 0, 0);
        }
    }
    
    // فیزیک پیشرفته برای افکت‌های خاص
    createExplosionForce(center, radius, power, falloff = 'linear') {
        // ایجاد نیروی انفجار
        const affectedObjects = [];
        
        for (const collider of this.colliders) {
            const object = collider.object;
            const distance = object.position.distanceTo(center);
            
            if (distance <= radius) {
                // محاسبه نیرو بر اساس فاصله
                let forceMultiplier;
                
                switch(falloff) {
                    case 'linear':
                        forceMultiplier = 1 - (distance / radius);
                        break;
                    case 'quadratic':
                        forceMultiplier = Math.pow(1 - (distance / radius), 2);
                        break;
                    case 'inverse':
                        forceMultiplier = 1 / (distance + 1);
                        break;
                    default:
                        forceMultiplier = 1 - (distance / radius);
                }
                
                const direction = object.position.clone().sub(center).normalize();
                const force = direction.multiplyScalar(power * forceMultiplier);
                
                affectedObjects.push({
                    object: object,
                    force: force
                });
            }
        }
        
        return affectedObjects;
    }
    
    applyExplosionForce(center, radius, power, deltaTime, falloff = 'linear') {
        // اعمال نیروی انفجار به اشیاء
        const affectedObjects = this.createExplosionForce(center, radius, power, falloff);
        
        for (const affected of affectedObjects) {
            this.applyForce(affected.object, affected.force, deltaTime);
        }
        
        return affectedObjects.length;
    }
    
    // فیزیک ذرات
    createParticleSystem(position, count, options = {}) {
        const particles = [];
        const {
            velocityMin = new THREE.Vector3(-10, -10, -10),
            velocityMax = new THREE.Vector3(10, 10, 10),
            lifeMin = 1,
            lifeMax = 3,
            sizeMin = 0.1,
            sizeMax = 0.5,
            color = new THREE.Color(1, 1, 1)
        } = options;
        
        for (let i = 0; i < count; i++) {
            const particle = {
                position: position.clone(),
                velocity: new THREE.Vector3(
                    THREE.MathUtils.lerp(velocityMin.x, velocityMax.x, Math.random()),
                    THREE.MathUtils.lerp(velocityMin.y, velocityMax.y, Math.random()),
                    THREE.MathUtils.lerp(velocityMin.z, velocityMax.z, Math.random())
                ),
                life: THREE.MathUtils.lerp(lifeMin, lifeMax, Math.random()),
                maxLife: 1,
                size: THREE.MathUtils.lerp(sizeMin, sizeMax, Math.random()),
                color: color.clone()
            };
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    updateParticles(particles, deltaTime, forces = []) {
        // به‌روزرسانی ذرات
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // کاهش عمر
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            // اعمال نیروها
            for (const force of forces) {
                particle.velocity.add(force.clone().multiplyScalar(deltaTime));
            }
            
            // اعمال گرانش
            particle.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
            
            // به‌روزرسانی موقعیت
            particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
        }
    }
    
    // بهینه‌سازی‌های پیشرفته
    spatialPartitioning = {
        grid: {},
        cellSize: 50,
        
        update(objects) {
            this.grid = {};
            
            for (const object of objects) {
                const cellX = Math.floor(object.position.x / this.cellSize);
                const cellY = Math.floor(object.position.y / this.cellSize);
                const cellZ = Math.floor(object.position.z / this.cellSize);
                
                const cellKey = `${cellX},${cellY},${cellZ}`;
                
                if (!this.grid[cellKey]) {
                    this.grid[cellKey] = [];
                }
                
                this.grid[cellKey].push(object);
            }
        },
        
        getNearbyObjects(position, radius) {
            const nearby = [];
            const cellX = Math.floor(position.x / this.cellSize);
            const cellY = Math.floor(position.y / this.cellSize);
            const cellZ = Math.floor(position.z / this.cellSize);
            
            // بررسی سلول‌های مجاور
            for (let x = cellX - 1; x <= cellX + 1; x++) {
                for (let y = cellY - 1; y <= cellY + 1; y++) {
                    for (let z = cellZ - 1; z <= cellZ + 1; z++) {
                        const cellKey = `${x},${y},${z}`;
                        if (this.grid[cellKey]) {
                            nearby.push(...this.grid[cellKey]);
                        }
                    }
                }
            }
            
            // فیلتر کردن بر اساس فاصله واقعی
            return nearby.filter(obj => 
                obj.position.distanceTo(position) <= radius
            );
        }
    }
}

// صادر کردن کلاس
window.PhysicsSystem = PhysicsSystem;
