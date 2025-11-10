// سیستم جهان و کهکشان
class UniverseSystem {
    constructor(scene) {
        this.scene = scene;
        this.stars = [];
        this.nebulas = [];
        this.planets = [];
        this.asteroids = [];
        
        this.createStarfield();
        this.createNebulas();
        this.createDistantGalaxies();
        this.createAsteroidBelts();
        this.createAnimatedSpace();
    }
    
    createStarfield() {
        // میدان ستارگان پویا
        this.starParticleSystem = new BABYLON.ParticleSystem("stars", 5000, this.scene);
        
        this.starParticleSystem.minEmitBox = new BABYLON.Vector3(-800, -800, -800);
        this.starParticleSystem.maxEmitBox = new BABYLON.Vector3(800, 800, 800);
        
        this.starParticleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
        this.starParticleSystem.color2 = new BABYLON.Color4(0.7, 0.8, 1, 1);
        this.starParticleSystem.color3 = new BABYLON.Color4(1, 0.9, 0.7, 1);
        this.starParticleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        this.starParticleSystem.minSize = 0.02;
        this.starParticleSystem.maxSize = 0.4;
        this.starParticleSystem.emitRate = 400;
        this.starParticleSystem.minLifeTime = Number.MAX_SAFE_INTEGER;
        this.starParticleSystem.maxLifeTime = Number.MAX_SAFE_INTEGER;
        this.starParticleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        
        this.starParticleSystem.start();
    }
    
    createNebulas() {
        // سحابی‌های رنگارنگ و پویا
        const nebulaConfigs = [
            { color: new BABYLON.Color3(0.4, 0.1, 0.8), size: 120, pos: [-200, 100, -400] },
            { color: new BABYLON.Color3(0.1, 0.3, 0.9), size: 90, pos: [300, -50, -350] },
            { color: new BABYLON.Color3(0.8, 0.1, 0.4), size: 150, pos: [-150, -150, -500] },
            { color: new BABYLON.Color3(0.1, 0.8, 0.6), size: 80, pos: [250, 200, -450] },
            { color: new BABYLON.Color3(0.9, 0.7, 0.1), size: 110, pos: [100, -200, -380] }
        ];
        
        nebulaConfigs.forEach((config, i) => {
            const nebula = BABYLON.MeshBuilder.CreateSphere(`nebula${i}`, {
                diameter: config.size,
                segments: 32
            }, this.scene);
            
            nebula.position = new BABYLON.Vector3(...config.pos);
            
            const material = new BABYLON.StandardMaterial(`nebulaMat${i}`, this.scene);
            material.emissiveColor = config.color;
            material.diffuseColor = config.color;
            material.alpha = 0.03 + Math.random() * 0.03;
            material.specularColor = new BABYLON.Color3(0, 0, 0);
            material.backFaceCulling = false;
            
            nebula.material = material;
            this.nebulas.push({ mesh: nebula, rotationSpeed: (Math.random() - 0.5) * 0.001 });
        });
    }
    
    createDistantGalaxies() {
        // کهکشان‌های دوردست
        for (let i = 0; i < 6; i++) {
            const galaxy = BABYLON.MeshBuilder.CreateSphere(`galaxy${i}`, {
                diameter: 60 + Math.random() * 80,
                segments: 24
            }, this.scene);
            
            galaxy.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 800,
                -800 - Math.random() * 400
            );
            
            const material = new BABYLON.StandardMaterial(`galaxyMat${i}`, this.scene);
            material.emissiveColor = new BABYLON.Color3(
                Math.random() * 0.5,
                Math.random() * 0.3,
                Math.random() * 0.7
            );
            material.alpha = 0.1 + Math.random() * 0.1;
            
            galaxy.material = material;
            this.planets.push({ 
                mesh: galaxy, 
                rotationSpeed: new BABYLON.Vector3(
                    (Math.random() - 0.5) * 0.0005,
                    (Math.random() - 0.5) * 0.0005,
                    (Math.random() - 0.5) * 0.0005
                )
            });
        }
    }
    
    createAsteroidBelts() {
        // کمربندهای سیارکی
        for (let belt = 0; belt < 3; belt++) {
            for (let i = 0; i < 40; i++) {
                const size = 0.3 + Math.random() * 2.5;
                const asteroid = BABYLON.MeshBuilder.CreateSphere(`asteroid${belt}_${i}`, {
                    diameter: size,
                    segments: 6 + Math.floor(Math.random() * 8)
                }, this.scene);
                
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + belt * 30 + Math.random() * 20;
                
                asteroid.position = new BABYLON.Vector3(
                    Math.cos(angle) * distance,
                    (Math.random() - 0.5) * 40,
                    -80 - belt * 50 - Math.random() * 30
                );
                
                asteroid.rotation = new BABYLON.Vector3(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                
                const material = new BABYLON.PBRMetallicRoughnessMaterial(`asteroidMat${belt}_${i}`, this.scene);
                material.baseColor = new BABYLON.Color3(
                    0.2 + Math.random() * 0.4,
                    0.1 + Math.random() * 0.3,
                    0.05 + Math.random() * 0.2
                );
                material.metallic = 0.1 + Math.random() * 0.3;
                material.roughness = 0.6 + Math.random() * 0.4;
                
                asteroid.material = material;
                
                this.asteroids.push({
                    mesh: asteroid,
                    rotationSpeed: new BABYLON.Vector3(
                        (Math.random() - 0.5) * 0.02,
                        (Math.random() - 0.5) * 0.02,
                        (Math.random() - 0.5) * 0.02
                    ),
                    orbitSpeed: (Math.random() - 0.5) * 0.001,
                    initialAngle: angle,
                    distance: distance,
                    belt: belt,
                    size: size
                });
            }
        }
    }
    
    createAnimatedSpace() {
        // اجرام متحرک در فضا
        this.spaceDebris = [];
        for (let i = 0; i < 20; i++) {
            const debris = BABYLON.MeshBuilder.CreateSphere(`debris${i}`, {
                diameter: 0.1 + Math.random() * 0.5,
                segments: 8
            }, this.scene);
            
            debris.position = new BABYLON.Vector3(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 150,
                -30 - Math.random() * 100
            );
            
            const material = new BABYLON.StandardMaterial(`debrisMat${i}`, this.scene);
            material.emissiveColor = new BABYLON.Color3(0.3, 0.5, 1);
            debris.material = material;
            
            this.spaceDebris.push({
                mesh: debris,
                velocity: new BABYLON.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.05
                )
            });
        }
    }
    
    update(deltaTime) {
        // آپدیت انیمیشن‌های جهان
        this.updateNebulas(deltaTime);
        this.updateAsteroids(deltaTime);
        this.updateSpaceDebris(deltaTime);
        this.updatePlanets(deltaTime);
    }
    
    updateNebulas(deltaTime) {
        this.nebulas.forEach(nebula => {
            nebula.mesh.rotation.y += nebula.rotationSpeed * deltaTime * 60;
        });
    }
    
    updateAsteroids(deltaTime) {
        this.asteroids.forEach(asteroid => {
            // چرخش روی خودش
            asteroid.mesh.rotation.x += asteroid.rotationSpeed.x * deltaTime * 60;
            asteroid.mesh.rotation.y += asteroid.rotationSpeed.y * deltaTime * 60;
            asteroid.mesh.rotation.z += asteroid.rotationSpeed.z * deltaTime * 60;
            
            // حرکت مداری
            asteroid.initialAngle += asteroid.orbitSpeed * deltaTime * 60;
            asteroid.mesh.position.x = Math.cos(asteroid.initialAngle) * asteroid.distance;
            asteroid.mesh.position.z = -80 - asteroid.belt * 50 + Math.sin(asteroid.initialAngle) * 20;
        });
    }
    
    updateSpaceDebris(deltaTime) {
        this.spaceDebris.forEach(debris => {
            debris.mesh.position.addInPlace(
                new BABYLON.Vector3(
                    debris.velocity.x * deltaTime * 60,
                    debris.velocity.y * deltaTime * 60,
                    debris.velocity.z * deltaTime * 60
                )
            );
            
            // بازگرداندن به صحنه اگر خارج شد
            if (debris.mesh.position.length() > 300) {
                debris.mesh.position = new BABYLON.Vector3(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 80,
                    -30 - Math.random() * 50
                );
            }
        });
    }
    
    updatePlanets(deltaTime) {
        this.planets.forEach(planet => {
            planet.mesh.rotation.x += planet.rotationSpeed.x * deltaTime * 60;
            planet.mesh.rotation.y += planet.rotationSpeed.y * deltaTime * 60;
            planet.mesh.rotation.z += planet.rotationSpeed.z * deltaTime * 60;
        });
    }
        }
