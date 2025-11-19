// m6.js - سیستم فیزیک
class PhysicsSystem {
    constructor() {
        this.colliders = [];
        this.gravity = new THREE.Vector3(0, -5, 0);
        
        this.init();
    }
    
    init() {
        console.log("✅ سیستم فیزیک راه‌اندازی شد");
    }
    
    registerCollider(object) {
        const collider = {
            object: object,
            boundingBox: new THREE.Box3().setFromObject(object)
        };
        
        this.colliders.push(collider);
        return collider;
    }
    
    checkCollision(obj1, obj2) {
        try {
            const box1 = new THREE.Box3().setFromObject(obj1);
            const box2 = new THREE.Box3().setFromObject(obj2);
            
            return box1.intersectsBox(box2);
        } catch (error) {
            return false;
        }
    }
    
    checkSphereCollision(pos1, radius1, pos2, radius2) {
        const distance = pos1.distanceTo(pos2);
        return distance < (radius1 + radius2);
    }
    
    update() {
        // به‌روزرسانی bounding box‌ها
        for (const collider of this.colliders) {
            if (collider.object) {
                collider.boundingBox.setFromObject(collider.object);
            }
        }
    }
}

window.PhysicsSystem = PhysicsSystem;
console.log("📁 m6.js با موفقیت بارگذاری شد");
