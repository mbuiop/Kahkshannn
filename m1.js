// m1.js - سیستم گرافیک سه‌بعدی پیشرفته
class GraphicsEngine {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.programs = new Map();
        this.meshes = new Map();
        this.textures = new Map();
        this.materials = new Map();
        this.lights = [];
        this.particles = [];
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fps = 0;
    }

    initialize() {
        try {
            this.canvas = document.getElementById('gameCanvas');
            this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
            
            if (!this.gl) {
                throw new Error('WebGL پشتیبانی نمی‌شود');
            }

            this.setupCanvas();
            this.compileShaders();
            this.createBasicMeshes();
            this.loadTextures();
            this.setupLighting();
            
            console.log('✅ موتور گرافیک سه‌بعدی راه‌اندازی شد');
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی موتور گرافیک:', error);
        }
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.clearColor(0.0, 0.0, 0.1, 1.0);
    }

    compileShaders() {
        const vertexShaderSource = `
            #version 300 es
            in vec4 aPosition;
            in vec3 aNormal;
            in vec2 aTexCoord;
            
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            out vec3 vNormal;
            out vec2 vTexCoord;
            out vec3 vFragPos;
            
            void main() {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
                vNormal = mat3(transpose(inverse(uModelMatrix))) * aNormal;
                vTexCoord = aTexCoord;
                vFragPos = vec3(uModelMatrix * aPosition);
            }
        `;

        const fragmentShaderSource = `
            #version 300 es
            precision highp float;
            
            in vec3 vNormal;
            in vec2 vTexCoord;
            in vec3 vFragPos;
            
            uniform vec3 uLightColor;
            uniform vec3 uLightPosition;
            uniform vec3 uViewPosition;
            uniform sampler2D uTexture;
            
            out vec4 fragColor;
            
            void main() {
                // نورپردازی فونگ
                vec3 norm = normalize(vNormal);
                vec3 lightDir = normalize(uLightPosition - vFragPos);
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 diffuse = diff * uLightColor;
                
                // درخشندگی
                vec3 viewDir = normalize(uViewPosition - vFragPos);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
                vec3 specular = spec * uLightColor;
                
                // نور محیطی
                vec3 ambient = 0.1 * uLightColor;
                
                vec4 textureColor = texture(uTexture, vTexCoord);
                vec3 result = (ambient + diffuse + specular) * textureColor.rgb;
                fragColor = vec4(result, textureColor.a);
            }
        `;

        const program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.programs.set('main', program);
    }

    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('خطا در لینک برنامه:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('خطا در کامپایل شیدر:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createBasicMeshes() {
        // ایجاد مکعب برای سفینه
        this.createCubeMesh('spaceship');
        // ایجاد کره برای سیارات
        this.createSphereMesh('planet', 1, 32, 16);
        // ایجاد مخروط برای موشک‌ها
        this.createConeMesh('missile', 1, 2, 16);
    }

    createCubeMesh(name) {
        const vertices = new Float32Array([
            // موقعیت‌ها، نرمال‌ها، مختصات بافت
            -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0,
             0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 0.0,
             0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0,
            -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 1.0,
            // اضافه کردن سایر وجه‌ها...
        ]);

        const indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
            // اضافه کردن سایر مثلث‌ها...
        ]);

        this.createMesh(name, vertices, indices);
    }

    createSphereMesh(name, radius, widthSegments, heightSegments) {
        const vertices = [];
        const indices = [];
        
        for (let y = 0; y <= heightSegments; y++) {
            for (let x = 0; x <= widthSegments; x++) {
                const u = x / widthSegments;
                const v = y / heightSegments;
                
                const theta = u * Math.PI * 2;
                const phi = v * Math.PI;
                
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                const xPos = radius * sinPhi * cosTheta;
                const yPos = radius * cosPhi;
                const zPos = radius * sinPhi * sinTheta;
                
                // موقعیت، نرمال، مختصات بافت
                vertices.push(xPos, yPos, zPos, xPos, yPos, zPos, u, v);
            }
        }
        
        for (let y = 0; y < heightSegments; y++) {
            for (let x = 0; x < widthSegments; x++) {
                const a = y * (widthSegments + 1) + x;
                const b = a + 1;
                const c = a + (widthSegments + 1);
                const d = c + 1;
                
                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }
        
        this.createMesh(name, new Float32Array(vertices), new Uint16Array(indices));
    }

    createConeMesh(name, radius, height, segments) {
        const vertices = [];
        const indices = [];
        
        // رأس مخروط
        vertices.push(0, height/2, 0, 0, 1, 0, 0.5, 1.0);
        
        // پایه مخروط
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = radius * Math.cos(theta);
            const z = radius * Math.sin(theta);
            
            vertices.push(x, -height/2, z, 0, -1, 0, (x/radius + 1)/2, 0);
        }
        
        // اضافه کردن مثلث‌ها
        for (let i = 1; i <= segments; i++) {
            indices.push(0, i, i + 1);
        }
        
        this.createMesh(name, new Float32Array(vertices), new Uint16Array(indices));
    }

    createMesh(name, vertices, indices) {
        const gl = this.gl;
        
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        
        // بافر موقعیت
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        // بافر اندیس
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
        // تنظیم ویژگی‌ها
        const stride = 8 * 4; // 8 عدد float در هر رأس
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(0);
        
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);
        gl.enableVertexAttribArray(1);
        
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 6 * 4);
        gl.enableVertexAttribArray(2);
        
        this.meshes.set(name, {
            vao: vao,
            vertexCount: indices.length,
            vertexBuffer: vertexBuffer,
            indexBuffer: indexBuffer
        });
    }

    loadTextures() {
        // ایجاد بافت‌های پیش‌فرض
        this.createDefaultTexture('spaceship', [255, 0, 0, 255]); // قرمز
        this.createDefaultTexture('planet', [0, 0, 255, 255]); // آبی
        this.createDefaultTexture('missile', [255, 255, 0, 255]); // زرد
    }

    createDefaultTexture(name, color) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        const pixel = new Uint8Array(color);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        
        this.textures.set(name, texture);
    }

    setupLighting() {
        this.lights.push({
            position: [10, 10, 10],
            color: [1, 1, 1],
            intensity: 1.0
        });
    }

    render(camera, objects) {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.fps = Math.round(1000 / deltaTime);
        this.frameCount++;
        
        // پاک کردن بافرها
        this.gl.clear(this.gl.COLOR_BUFFER_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        const program = this.programs.get('main');
        this.gl.useProgram(program);
        
        // تنظیم ماتریس‌ها
        this.setMatrixUniforms(program, camera);
        
        // تنظیم نور
        this.setLightUniforms(program);
        
        // رندر اشیاء
        objects.forEach(object => {
            this.renderObject(program, object);
        });
        
        // رندر ذرات
        this.renderParticles(program);
    }

    setMatrixUniforms(program, camera) {
        const gl = this.gl;
        
        const modelMatrixLocation = gl.getUniformLocation(program, 'uModelMatrix');
        const viewMatrixLocation = gl.getUniformLocation(program, 'uViewMatrix');
        const projectionMatrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');
        const viewPositionLocation = gl.getUniformLocation(program, 'uViewPosition');
        
        // ماتریس مدل (می‌تواند برای هر شیء متفاوت باشد)
        const modelMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        
        gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, camera.viewMatrix);
        gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.projectionMatrix);
        gl.uniform3fv(viewPositionLocation, camera.position);
    }

    setLightUniforms(program) {
        const gl = this.gl;
        
        const lightPositionLocation = gl.getUniformLocation(program, 'uLightPosition');
        const lightColorLocation = gl.getUniformLocation(program, 'uLightColor');
        
        if (this.lights.length > 0) {
            const light = this.lights[0];
            gl.uniform3fv(lightPositionLocation, light.position);
            gl.uniform3fv(lightColorLocation, light.color);
        }
    }

    renderObject(program, object) {
        const gl = this.gl;
        const mesh = this.meshes.get(object.meshName);
        
        if (!mesh) return;
        
        // تنظیم ماتریس مدل برای این شیء
        const modelMatrixLocation = gl.getUniformLocation(program, 'uModelMatrix');
        gl.uniformMatrix4fv(modelMatrixLocation, false, object.transform.getMatrix());
        
        // بایند بافت
        const texture = this.textures.get(object.textureName);
        if (texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            const textureLocation = gl.getUniformLocation(program, 'uTexture');
            gl.uniform1i(textureLocation, 0);
        }
        
        // رندر مش
        gl.bindVertexArray(mesh.vao);
        gl.drawElements(gl.TRIANGLES, mesh.vertexCount, gl.UNSIGNED_SHORT, 0);
    }

    renderParticles(program) {
        // پیاده‌سازی سیستم ذرات
        this.particles = this.particles.filter(particle => {
            particle.life -= 0.01;
            return particle.life > 0;
        });
        
        // رندر ذرات باقی‌مانده
        this.particles.forEach(particle => {
            // رندر هر ذره
        });
    }

    createParticle(position, velocity, color, size, life) {
        this.particles.push({
            position: [...position],
            velocity: [...velocity],
            color: [...color],
            size: size,
            life: life,
            maxLife: life
        });
    }

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    cleanup() {
        // پاکسازی منابع
        this.programs.forEach(program => this.gl.deleteProgram(program));
        this.meshes.forEach(mesh => {
            this.gl.deleteVertexArray(mesh.vao);
            this.gl.deleteBuffer(mesh.vertexBuffer);
            this.gl.deleteBuffer(mesh.indexBuffer);
        });
        this.textures.forEach(texture => this.gl.deleteTexture(texture));
        
        console.log('🧹 منابع گرافیکی پاکسازی شدند');
    }
}

// کلاس تبدیل برای مدیریت موقعیت، چرخش و مقیاس
class Transform {
    constructor() {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.matrix = new Float32Array(16);
        this.updateMatrix();
    }

    setPosition(x, y, z) {
        this.position = [x, y, z];
        this.updateMatrix();
    }

    setRotation(x, y, z) {
        this.rotation = [x, y, z];
        this.updateMatrix();
    }

    setScale(x, y, z) {
        this.scale = [x, y, z];
        this.updateMatrix();
    }

    updateMatrix() {
        // ایجاد ماتریس تبدیل از موقعیت، چرخش و مقیاس
        const [px, py, pz] = this.position;
        const [rx, ry, rz] = this.rotation;
        const [sx, sy, sz] = this.scale;
        
        // ماتریس شناسایی
        this.matrix = new Float32Array([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            px, py, pz, 1
        ]);
        
        // اعمال چرخش (ساده‌شده)
        // در پیاده‌سازی واقعی باید ماتریس چرخش کامل اعمال شود
    }

    getMatrix() {
        return this.matrix;
    }
}

// کلاس شیء بازی
class GameObject {
    constructor(meshName, textureName) {
        this.transform = new Transform();
        this.meshName = meshName;
        this.textureName = textureName;
        this.visible = true;
        this.collider = null;
    }

    update(deltaTime) {
        // به‌روزرسانی منطق شیء
    }
}

// سیستم تشخیص برخورد
class CollisionSystem {
    constructor() {
        this.objects = [];
    }

    addObject(object) {
        this.objects.push(object);
    }

    checkCollisions() {
        const collisions = [];
        
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const obj1 = this.objects[i];
                const obj2 = this.objects[j];
                
                if (this.sphereSphereCollision(obj1, obj2)) {
                    collisions.push({ obj1, obj2 });
                }
            }
        }
        
        return collisions;
    }

    sphereSphereCollision(obj1, obj2) {
        if (!obj1.collider || !obj2.collider) return false;
        
        const dx = obj1.transform.position[0] - obj2.transform.position[0];
        const dy = obj1.transform.position[1] - obj2.transform.position[1];
        const dz = obj1.transform.position[2] - obj2.transform.position[2];
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDistance = obj1.collider.radius + obj2.collider.radius;
        
        return distance < minDistance;
    }
}

// سیستم صوتی
class AudioSystem {
    constructor() {
        this.sounds = new Map();
        this.music = null;
        this.masterVolume = 0.5;
        this.soundEnabled = true;
    }

    loadSound(name, url) {
        const audio = new Audio(url);
        this.sounds.set(name, audio);
    }

    playSound(name, volume = 1.0) {
        if (!this.soundEnabled) return;
        
        const sound = this.sounds.get(name);
        if (sound) {
            sound.volume = this.masterVolume * volume;
            sound.currentTime = 0;
            sound.play().catch(e => console.log('خطا در پخش صدا:', e));
        }
    }

    playMusic(url, loop = true) {
        if (this.music) {
            this.music.pause();
        }
        
        this.music = new Audio(url);
        this.music.volume = this.masterVolume * 0.3;
        this.music.loop = loop;
        this.music.play().catch(e => console.log('خطا در پخش موسیقی:', e));
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
    }
}

// سیستم فیزیک
class PhysicsEngine {
    constructor() {
        this.gravity = [0, -9.8, 0];
        this.objects = [];
        this.collisionSystem = new CollisionSystem();
    }

    addObject(object) {
        this.objects.push(object);
        this.collisionSystem.addObject(object);
    }

    update(deltaTime) {
        // به‌روزرسانی موقعیت اشیاء بر اساس سرعت و شتاب
        this.objects.forEach(object => {
            if (object.velocity) {
                object.transform.position[0] += object.velocity[0] * deltaTime;
                object.transform.position[1] += object.velocity[1] * deltaTime;
                object.transform.position[2] += object.velocity[2] * deltaTime;
                
                // اعمال گرانش
                if (object.applyGravity) {
                    object.velocity[0] += this.gravity[0] * deltaTime;
                    object.velocity[1] += this.gravity[1] * deltaTime;
                    object.velocity[2] += this.gravity[2] * deltaTime;
                }
                
                object.transform.updateMatrix();
            }
        });
        
        // بررسی برخوردها
        const collisions = this.collisionSystem.checkCollisions();
        collisions.forEach(collision => {
            this.handleCollision(collision.obj1, collision.obj2);
        });
    }

    handleCollision(obj1, obj2) {
        // مدیریت برخورد بین دو شیء
        console.log('برخورد تشخیص داده شد:', obj1, obj2);
    }
}

// سیستم ذرات
class ParticleSystem {
    constructor(graphicsEngine) {
        this.graphicsEngine = graphicsEngine;
        this.emitters = [];
    }

    createEmitter(position, config) {
        const emitter = {
            position: [...position],
            particles: [],
            config: config,
            lastEmission: 0
        };
        
        this.emitters.push(emitter);
        return emitter;
    }

    update(deltaTime) {
        this.emitters.forEach(emitter => {
            emitter.lastEmission += deltaTime;
            
            // انتشار ذرات جدید
            if (emitter.lastEmission >= emitter.config.emitRate) {
                this.emitParticles(emitter);
                emitter.lastEmission = 0;
            }
            
            // به‌روزرسانی ذرات موجود
            emitter.particles = emitter.particles.filter(particle => {
                particle.life -= deltaTime;
                
                if (particle.life > 0) {
                    // به‌روزرسانی موقعیت
                    particle.position[0] += particle.velocity[0] * deltaTime;
                    particle.position[1] += particle.velocity[1] * deltaTime;
                    particle.position[2] += particle.velocity[2] * deltaTime;
                    
                    // اعمال نیروها
                    particle.velocity[0] += particle.acceleration[0] * deltaTime;
                    particle.velocity[1] += particle.acceleration[1] * deltaTime;
                    particle.velocity[2] += particle.acceleration[2] * deltaTime;
                    
                    return true;
                }
                return false;
            });
        });
    }

    emitParticles(emitter) {
        for (let i = 0; i < emitter.config.particlesPerEmission; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = emitter.config.minSpeed + Math.random() * (emitter.config.maxSpeed - emitter.config.minSpeed);
            
            const particle = {
                position: [...emitter.position],
                velocity: [
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    (Math.random() - 0.5) * speed
                ],
                acceleration: [0, emitter.config.gravity, 0],
                color: [...emitter.config.color],
                size: emitter.config.minSize + Math.random() * (emitter.config.maxSize - emitter.config.minSize),
                life: emitter.config.lifetime,
                maxLife: emitter.config.lifetime
            };
            
            emitter.particles.push(particle);
            this.graphicsEngine.createParticle(
                particle.position,
                particle.velocity,
                particle.color,
                particle.size,
                particle.life
            );
        }
    }
}

// سیستم انیمیشن
class AnimationSystem {
    constructor() {
        this.animations = new Map();
        this.activeAnimations = [];
    }

    createAnimation(name, keyframes, duration, loop = false) {
        this.animations.set(name, {
            keyframes: keyframes,
            duration: duration,
            loop: loop
        });
    }

    playAnimation(object, animationName) {
        const animation = this.animations.get(animationName);
        if (animation) {
            this.activeAnimations.push({
                object: object,
                animation: animation,
                startTime: performance.now(),
                currentTime: 0
            });
        }
    }

    update() {
        const currentTime = performance.now();
        
        this.activeAnimations = this.activeAnimations.filter(activeAnim => {
            const elapsed = currentTime - activeAnim.startTime;
            activeAnim.currentTime = elapsed;
            
            if (elapsed >= activeAnim.animation.duration) {
                if (activeAnim.animation.loop) {
                    activeAnim.startTime = currentTime;
                } else {
                    return false;
                }
            }
            
            this.applyAnimation(activeAnim);
            return true;
        });
    }

    applyAnimation(activeAnim) {
        const progress = activeAnim.currentTime / activeAnim.animation.duration;
        const keyframes = activeAnim.animation.keyframes;
        
        // پیدا کردن فریم‌های کنونی و بعدی
        let currentFrame = null;
        let nextFrame = null;
        let frameProgress = 0;
        
        for (let i = 0; i < keyframes.length - 1; i++) {
            if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
                currentFrame = keyframes[i];
                nextFrame = keyframes[i + 1];
                frameProgress = (progress - currentFrame.time) / (nextFrame.time - currentFrame.time);
                break;
            }
        }
        
        if (currentFrame && nextFrame) {
            // درون‌یابی بین فریم‌ها
            const object = activeAnim.object;
            
            // درون‌یابی موقعیت
            object.transform.position[0] = this.lerp(currentFrame.position[0], nextFrame.position[0], frameProgress);
            object.transform.position[1] = this.lerp(currentFrame.position[1], nextFrame.position[1], frameProgress);
            object.transform.position[2] = this.lerp(currentFrame.position[2], nextFrame.position[2], frameProgress);
            
            // درون‌یابی چرخش
            object.transform.rotation[0] = this.lerp(currentFrame.rotation[0], nextFrame.rotation[0], frameProgress);
            object.transform.rotation[1] = this.lerp(currentFrame.rotation[1], nextFrame.rotation[1], frameProgress);
            object.transform.rotation[2] = this.lerp(currentFrame.rotation[2], nextFrame.rotation[2], frameProgress);
            
            object.transform.updateMatrix();
        }
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}

// سیستم AI برای دشمنان
class AISystem {
    constructor() {
        this.entities = [];
        this.behaviors = new Map();
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    registerBehavior(name, behavior) {
        this.behaviors.set(name, behavior);
    }

    update(deltaTime, playerPosition) {
        this.entities.forEach(entity => {
            if (entity.aiBehavior && this.behaviors.has(entity.aiBehavior)) {
                const behavior = this.behaviors.get(entity.aiBehavior);
                behavior.update(entity, deltaTime, playerPosition);
            }
        });
    }
}

// رفتارهای AI
const AIBehaviors = {
    followPlayer: {
        update: (entity, deltaTime, playerPosition) => {
            if (!playerPosition) return;
            
            const dx = playerPosition[0] - entity.transform.position[0];
            const dy = playerPosition[1] - entity.transform.position[1];
            const dz = playerPosition[2] - entity.transform.position[2];
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance > 5) { // فاصله تعقیب
                const speed = 2 * deltaTime;
                entity.transform.position[0] += (dx / distance) * speed;
                entity.transform.position[1] += (dy / distance) * speed;
                entity.transform.position[2] += (dz / distance) * speed;
                entity.transform.updateMatrix();
            }
        }
    },
    
    patrol: {
        update: (entity, deltaTime) => {
            if (!entity.patrolPoints) {
                entity.patrolPoints = [
                    [entity.transform.position[0] - 10, entity.transform.position[1], entity.transform.position[2]],
                    [entity.transform.position[0] + 10, entity.transform.position[1], entity.transform.position[2]]
                ];
                entity.currentPatrolPoint = 0;
            }
            
            const target = entity.patrolPoints[entity.currentPatrolPoint];
            const dx = target[0] - entity.transform.position[0];
            const dy = target[1] - entity.transform.position[1];
            const dz = target[2] - entity.transform.position[2];
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const speed = 1 * deltaTime;
            
            if (distance < 1) {
                entity.currentPatrolPoint = (entity.currentPatrolPoint + 1) % entity.patrolPoints.length;
            } else {
                entity.transform.position[0] += (dx / distance) * speed;
                entity.transform.position[1] += (dy / distance) * speed;
                entity.transform.position[2] += (dz / distance) * speed;
                entity.transform.updateMatrix();
            }
        }
    }
};

// سیستم مدیریت وضعیت بازی
class GameStateManager {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.previousState = null;
    }

    registerState(name, state) {
        this.states.set(name, state);
    }

    changeState(name) {
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }
        
        this.previousState = this.currentState;
        this.currentState = this.states.get(name);
        
        if (this.currentState && this.currentState.enter) {
            this.currentState.enter();
        }
    }

    update(deltaTime) {
        if (this.currentState && this.currentState.update) {
            this.currentState.update(deltaTime);
        }
    }

    render() {
        if (this.currentState && this.currentState.render) {
            this.currentState.render();
        }
    }
}

// سیستم ذخیره‌سازی
class SaveSystem {
    constructor() {
        this.saveKey = 'spaceGameSave';
    }

    saveGame(data) {
        try {
            const saveData = {
                timestamp: Date.now(),
                version: '1.0',
                data: data
            };
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('خطا در ذخیره بازی:', error);
            return false;
        }
    }

    loadGame() {
        try {
            const saveData = localStorage.getItem(this.saveKey);
            if (saveData) {
                return JSON.parse(saveData);
            }
            return null;
        } catch (error) {
            console.error('خطا در بارگذاری بازی:', error);
            return null;
        }
    }

    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (error) {
            console.error('خطا در حذف ذخیره:', error);
            return false;
        }
    }

    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }
}

// سیستم مدیریت منابع
class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    loadResources(resourceList) {
        this.totalCount = resourceList.length;
        this.loadedCount = 0;
        
        resourceList.forEach(resource => {
            this.loadResource(resource);
        });
    }

    loadResource(resource) {
        const { type, name, url } = resource;
        
        switch (type) {
            case 'texture':
                this.loadTexture(name, url);
                break;
            case 'sound':
                this.loadSound(name, url);
                break;
            case 'model':
                this.loadModel(name, url);
                break;
            default:
                console.warn('نوع منبع ناشناخته:', type);
                this.resourceLoaded();
        }
    }

    loadTexture(name, url) {
        const img = new Image();
        img.onload = () => {
            this.resources.set(name, img);
            this.resourceLoaded();
        };
        img.onerror = () => {
            console.error('خطا در بارگذاری بافت:', url);
            this.resourceLoaded();
        };
        img.src = url;
    }

    loadSound(name, url) {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            this.resources.set(name, audio);
            this.resourceLoaded();
        };
        audio.onerror = () => {
            console.error('خطا در بارگذاری صدا:', url);
            this.resourceLoaded();
        };
        audio.src = url;
    }

    loadModel(name, url) {
        // بارگذاری مدل سه‌بعدی
        fetch(url)
            .then(response => response.json())
            .then(modelData => {
                this.resources.set(name, modelData);
                this.resourceLoaded();
            })
            .catch(error => {
                console.error('خطا در بارگذاری مدل:', url, error);
                this.resourceLoaded();
            });
    }

    resourceLoaded() {
        this.loadedCount++;
        
        if (this.onProgress) {
            const progress = this.loadedCount / this.totalCount;
            this.onProgress(progress);
        }
        
        if (this.loadedCount === this.totalCount && this.onComplete) {
            this.onComplete();
        }
    }

    getResource(name) {
        return this.resources.get(name);
    }

    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    setCompleteCallback(callback) {
        this.onComplete = callback;
    }
}

// سیستم شبکه برای بازی چندنفره
class NetworkManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.players = new Map();
        this.onMessage = null;
    }

    connect(serverUrl) {
        return new Promise((resolve, reject) => {
            try {
                this.socket = new WebSocket(serverUrl);
                
                this.socket.onopen = () => {
                    this.connected = true;
                    console.log('اتصال شبکه برقرار شد');
                    resolve();
                };
                
                this.socket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                
                this.socket.onclose = () => {
                    this.connected = false;
                    console.log('اتصال شبکه قطع شد');
                };
                
                this.socket.onerror = (error) => {
                    console.error('خطای شبکه:', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            if (this.onMessage) {
                this.onMessage(message);
            }
            
            switch (message.type) {
                case 'player_joined':
                    this.handlePlayerJoined(message);
                    break;
                case 'player_left':
                    this.handlePlayerLeft(message);
                    break;
                case 'player_update':
                    this.handlePlayerUpdate(message);
                    break;
                default:
                    console.log('پیام ناشناخته:', message);
            }
        } catch (error) {
            console.error('خطا در پردازش پیام:', error);
        }
    }

    handlePlayerJoined(message) {
        this.players.set(message.playerId, message.playerData);
        console.log('بازیکن جدید متصل شد:', message.playerId);
    }

    handlePlayerLeft(message) {
        this.players.delete(message.playerId);
        console.log('بازیکن خارج شد:', message.playerId);
    }

    handlePlayerUpdate(message) {
        const player = this.players.get(message.playerId);
        if (player) {
            Object.assign(player, message.playerData);
        }
    }

    sendMessage(type, data) {
        if (this.connected && this.socket) {
            const message = { type, data, timestamp: Date.now() };
            this.socket.send(JSON.stringify(message));
        }
    }

    updatePlayerPosition(position, rotation) {
        this.sendMessage('player_update', {
            position: position,
            rotation: rotation
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }

    setMessageHandler(handler) {
        this.onMessage = handler;
    }
}

// سیستم دیباگ و پروفایلینگ
class DebugSystem {
    constructor() {
        this.metrics = new Map();
        this.enabled = true;
        this.fpsHistory = [];
        this.memoryHistory = [];
        this.maxHistoryLength = 100;
    }

    startTimer(name) {
        if (!this.enabled) return;
        this.metrics.set(name, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
    }

    endTimer(name) {
        if (!this.enabled) return;
        const metric = this.metrics.get(name);
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;
        }
    }

    getMetric(name) {
        return this.metrics.get(name);
    }

    updateFPS(fps) {
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistoryLength) {
            this.fpsHistory.shift();
        }
    }

    updateMemory() {
        if (performance.memory) {
            const memory = performance.memory.usedJSHeapSize / 1048576; // تبدیل به MB
            this.memoryHistory.push(memory);
            if (this.memoryHistory.length > this.maxHistoryLength) {
                this.memoryHistory.shift();
            }
        }
    }

    logPerformance() {
        if (!this.enabled) return;
        
        console.group('📊 معیارهای عملکرد');
        this.metrics.forEach((metric, name) => {
            if (metric.duration !== null) {
                console.log(`${name}: ${metric.duration.toFixed(2)}ms`);
            }
        });
        
        if (this.fpsHistory.length > 0) {
            const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
            console.log(`FPS متوسط: ${avgFPS.toFixed(1)}`);
        }
        
        if (this.memoryHistory.length > 0) {
            const currentMemory = this.memoryHistory[this.memoryHistory.length - 1];
            console.log(`حافظه استفاده شده: ${currentMemory.toFixed(2)}MB`);
        }
        console.groupEnd();
    }

    toggle() {
        this.enabled = !this.enabled;
    }
}

// سیستم تنظیمات
class SettingsManager {
    constructor() {
        this.settings = {
            graphics: {
                quality: 'high',
                shadows: true,
                antiAliasing: true,
                textureQuality: 'high'
            },
            audio: {
                masterVolume: 0.8,
                musicVolume: 0.6,
                sfxVolume: 0.8,
                enabled: true
            },
            controls: {
                sensitivity: 0.5,
                invertY: false,
                keybinds: {}
            },
            gameplay: {
                difficulty: 'normal',
                showTutorial: true,
                language: 'fa'
            }
        };
        
        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('gameSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
            }
        } catch (error) {
            console.error('خطا در بارگذاری تنظیمات:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('خطا در ذخیره تنظیمات:', error);
        }
    }

    get(settingPath) {
        const path = settingPath.split('.');
        let value = this.settings;
        
        for (const key of path) {
            if (value[key] === undefined) {
                return undefined;
            }
            value = value[key];
        }
        
        return value;
    }

    set(settingPath, value) {
        const path = settingPath.split('.');
        let obj = this.settings;
        
        for (let i = 0; i < path.length - 1; i++) {
            if (obj[path[i]] === undefined) {
                obj[path[i]] = {};
            }
            obj = obj[path[i]];
        }
        
        obj[path[path.length - 1]] = value;
        this.saveSettings();
    }

    resetToDefaults() {
        this.settings = new SettingsManager().settings;
        this.saveSettings();
    }
}

// سیستم دستاوردها
class AchievementSystem {
    constructor() {
        this.achievements = new Map();
        this.unlocked = new Set();
        this.onUnlock = null;
    }

    registerAchievement(id, name, description, condition) {
        this.achievements.set(id, {
            id: id,
            name: name,
            description: description,
            condition: condition,
            unlocked: false,
            unlockDate: null
        });
    }

    checkAchievements(gameState) {
        this.achievements.forEach((achievement, id) => {
            if (!achievement.unlocked && achievement.condition(gameState)) {
                this.unlockAchievement(id);
            }
        });
    }

    unlockAchievement(id) {
        const achievement = this.achievements.get(id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockDate = new Date();
            this.unlocked.add(id);
            
            console.log(`🏆 دستاورد باز شد: ${achievement.name}`);
            
            if (this.onUnlock) {
                this.onUnlock(achievement);
            }
        }
    }

    getUnlockedAchievements() {
        return Array.from(this.unlocked).map(id => this.achievements.get(id));
    }

    getProgress() {
        const total = this.achievements.size;
        const unlocked = this.unlocked.size;
        return {
            unlocked: unlocked,
            total: total,
            percentage: total > 0 ? (unlocked / total) * 100 : 0
        };
    }

    setUnlockHandler(handler) {
        this.onUnlock = handler;
    }
}

// صادر کردن کلاس‌ها برای استفاده در سایر فایل‌ها
window.GraphicsEngine = GraphicsEngine;
window.Transform = Transform;
window.GameObject = GameObject;
window.CollisionSystem = CollisionSystem;
window.AudioSystem = AudioSystem;
window.PhysicsEngine = PhysicsEngine;
window.ParticleSystem = ParticleSystem;
window.AnimationSystem = AnimationSystem;
window.AISystem = AISystem;
window.AIBehaviors = AIBehaviors;
window.GameStateManager = GameStateManager;
window.SaveSystem = SaveSystem;
window.ResourceManager = ResourceManager;
window.NetworkManager = NetworkManager;
window.DebugSystem = DebugSystem;
window.SettingsManager = SettingsManager;
window.AchievementSystem = AchievementSystem;
