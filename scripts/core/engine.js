// موتور بازی WebGL - بهینه‌شده برای کارایی بالا
class GameEngine {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.programs = new Map();
        this.buffers = new Map();
        this.textures = new Map();
        this.entities = new Map();
        this.particleSystems = new Map();
        this.frameCount = 0;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.fps = 0;
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.initWebGL();
        this.loadShaders();
        this.setupBuffers();
        this.startGameLoop();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        `;
        document.getElementById('gameContainer').appendChild(this.canvas);
    }

    initWebGL() {
        const gl = this.canvas.getContext('webgl2') || 
                   this.canvas.getContext('webgl') || 
                   this.canvas.getContext('experimental-webgl');
        
        if (!gl) {
            throw new Error('WebGL پشتیبانی نمی‌شود');
        }

        this.gl = gl;
        
        // تنظیمات پیشرفته WebGL
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        console.log('🚀 WebGL موتور با موفقیت راه‌اندازی شد');
    }

    loadShaders() {
        // شیدرهای پیشرفته برای گرافیک سخت‌افزاری
        this.createProgram('starfield', this.starfieldVertexShader(), this.starfieldFragmentShader());
        this.createProgram('spaceship', this.spaceshipVertexShader(), this.spaceshipFragmentShader());
        this.createProgram('planet', this.planetVertexShader(), this.planetFragmentShader());
        this.createProgram('particle', this.particleVertexShader(), this.particleFragmentShader());
        this.createProgram('nebula', this.nebulaVertexShader(), this.nebulaFragmentShader());
    }

    createProgram(name, vsSource, fsSource) {
        const gl = this.gl;
        
        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
        
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('خطا در لینک برنامه:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        this.programs.set(name, program);
        return program;
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('خطا در کامپایل شیدر:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    // شیدرهای پیشرفته
    starfieldVertexShader() {
        return `#version 300 es
            in vec4 aPosition;
            in vec3 aColor;
            in float aSize;
            in float aBrightness;
            
            uniform mat4 uProjection;
            uniform mat4 uView;
            uniform float uTime;
            
            out vec3 vColor;
            out float vBrightness;
            
            void main() {
                vec4 position = aPosition;
                
                // انیمیشن حرکت ستاره‌ها
                position.x += sin(uTime * 0.5 + aPosition.y) * 0.1;
                position.y += cos(uTime * 0.3 + aPosition.x) * 0.05;
                
                gl_Position = uProjection * uView * position;
                gl_PointSize = aSize * (1.0 + sin(uTime + aPosition.x) * 0.3);
                
                vColor = aColor;
                vBrightness = aBrightness * (0.8 + 0.2 * sin(uTime * 2.0 + aPosition.z));
            }
        `;
    }

    starfieldFragmentShader() {
        return `#version 300 es
            precision highp float;
            
            in vec3 vColor;
            in float vBrightness;
            
            out vec4 fragColor;
            
            void main() {
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                
                if (dist > 0.5) {
                    discard;
                }
                
                // افکت درخشش ستاره
                float intensity = 1.0 - smoothstep(0.3, 0.5, dist);
                intensity *= vBrightness;
                
                // رنگ‌های پویا
                vec3 finalColor = vColor * intensity;
                finalColor += vec3(0.2, 0.3, 0.8) * sin(vBrightness * 10.0) * 0.1;
                
                fragColor = vec4(finalColor, intensity);
            }
        `;
    }

    spaceshipVertexShader() {
        return `#version 300 es
            in vec4 aPosition;
            in vec3 aNormal;
            in vec2 aTexCoord;
            
            uniform mat4 uModel;
            uniform mat4 uView;
            uniform mat4 uProjection;
            uniform vec3 uLightPosition;
            uniform float uTime;
            
            out vec3 vNormal;
            out vec3 vLightDir;
            out vec2 vTexCoord;
            out vec3 vPosition;
            
            void main() {
                vec4 worldPosition = uModel * aPosition;
                
                // انیمیشن ملایم سفینه
                worldPosition.y += sin(uTime * 3.0 + worldPosition.x) * 0.01;
                
                gl_Position = uProjection * uView * worldPosition;
                
                vNormal = mat3(uModel) * aNormal;
                vLightDir = normalize(uLightPosition - worldPosition.xyz);
                vTexCoord = aTexCoord;
                vPosition = worldPosition.xyz;
            }
        `;
    }

    spaceshipFragmentShader() {
        return `#version 300 es
            precision highp float;
            
            in vec3 vNormal;
            in vec3 vLightDir;
            in vec2 vTexCoord;
            in vec3 vPosition;
            
            uniform float uTime;
            uniform vec3 uShipColor;
            
            out vec4 fragColor;
            
            void main() {
                // نورپردازی فونگ
                vec3 normal = normalize(vNormal);
                float diff = max(dot(normal, vLightDir), 0.2);
                
                // رنگ پویا سفینه
                vec3 baseColor = uShipColor;
                baseColor.r += sin(uTime * 2.0) * 0.1;
                baseColor.g += cos(uTime * 1.5) * 0.1;
                
                // درخشش موتور
                float engineGlow = sin(uTime * 10.0) * 0.3 + 0.7;
                vec3 finalColor = baseColor * diff;
                finalColor += vec3(0.8, 0.9, 1.0) * engineGlow * 0.3;
                
                // هایلایت متالیک
                vec3 reflectDir = reflect(-vLightDir, normal);
                float spec = pow(max(dot(normalize(-vPosition), reflectDir), 0.0), 32.0);
                finalColor += vec3(1.0) * spec * 0.5;
                
                fragColor = vec4(finalColor, 1.0);
            }
        `;
    }

    setupBuffers() {
        this.createStarfieldBuffer();
        this.createSpaceshipBuffer();
        this.createParticleBuffer();
    }

    createStarfieldBuffer() {
        const gl = this.gl;
        const positions = [];
        const colors = [];
        const sizes = [];
        const brightness = [];
        
        // ایجاد 5000 ستاره با موقعیت‌های تصادفی
        for (let i = 0; i < 5000; i++) {
            positions.push(
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 2000,
                1.0
            );
            
            // رنگ‌های ستاره‌ها
            const starColor = Math.random();
            if (starColor < 0.7) {
                colors.push(1.0, 1.0, 1.0); // سفید
            } else if (starColor < 0.85) {
                colors.push(0.8, 0.9, 1.0); // آبی روشن
            } else if (starColor < 0.95) {
                colors.push(1.0, 0.9, 0.8); // زرد روشن
            } else {
                colors.push(1.0, 0.7, 0.8); // قرمز روشن
            }
            
            sizes.push(Math.random() * 2.0 + 0.5);
            brightness.push(Math.random() * 0.8 + 0.2);
        }
        
        this.createBuffer('starfield', {
            position: { data: new Float32Array(positions), size: 4 },
            color: { data: new Float32Array(colors), size: 3 },
            size: { data: new Float32Array(sizes), size: 1 },
            brightness: { data: new Float32Array(brightness), size: 1 }
        });
    }

    createBuffer(name, attributes) {
        const gl = this.gl;
        const buffer = { vao: gl.createVertexArray(), attributes: {} };
        
        gl.bindVertexArray(buffer.vao);
        
        for (const [attrName, attrData] of Object.entries(attributes)) {
            const bufferObj = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferObj);
            gl.bufferData(gl.ARRAY_BUFFER, attrData.data, gl.STATIC_DRAW);
            
            buffer.attributes[attrName] = {
                buffer: bufferObj,
                size: attrData.size,
                type: attrData.type || gl.FLOAT,
                normalized: attrData.normalized || false
            };
        }
        
        gl.bindVertexArray(null);
        this.buffers.set(name, buffer);
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            this.frameCount++;
            
            // محاسبه FPS
            if (this.frameCount % 60 === 0) {
                this.fps = Math.round(1 / this.deltaTime);
            }
            
            this.update();
            this.render();
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }

    update() {
        // به‌روزرسانی تمام موجودیت‌ها
        for (const [id, entity] of this.entities) {
            if (entity.update) {
                entity.update(this.deltaTime);
            }
        }
        
        // به‌روزرسانی سیستم‌های ذرات
        for (const [id, system] of this.particleSystems) {
            system.update(this.deltaTime);
        }
    }

    render() {
        const gl = this.gl;
        
        // پاک کردن بافر
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // تنظیم ماتریس‌ها
        this.setupCamera();
        
        // رندر کهکشان
        this.renderStarfield();
        
        // رندر موجودیت‌ها
        for (const [id, entity] of this.entities) {
            if (entity.render) {
                entity.render();
            }
        }
        
        // رندر ذرات
        for (const [id, system] of this.particleSystems) {
            system.render();
        }
    }

    setupCamera() {
        // ماتریس projection
        const aspect = this.canvas.width / this.canvas.height;
        const projectionMatrix = mat4.perspective(
            mat4.create(), 
            Math.PI / 4, 
            aspect, 
            0.1, 
            1000.0
        );
        
        // ماتریس view (دوربین)
        const camera = Game.getCamera();
        const viewMatrix = camera.getViewMatrix();
        
        // ارسال به شیدرها
        this.setUniform('uProjection', projectionMatrix);
        this.setUniform('uView', viewMatrix);
        this.setUniform('uTime', performance.now() / 1000);
    }

    renderStarfield() {
        const program = this.programs.get('starfield');
        const buffer = this.buffers.get('starfield');
        
        if (!program || !buffer) return;
        
        const gl = this.gl;
        gl.useProgram(program);
        gl.bindVertexArray(buffer.vao);
        
        // تنظیم attributeها
        this.setupAttributes(program, buffer.attributes);
        
        // رسم ستاره‌ها
        gl.drawArrays(gl.POINTS, 0, 5000);
        
        gl.bindVertexArray(null);
    }

    setupAttributes(program, attributes) {
        const gl = this.gl;
        
        for (const [attrName, attrData] of Object.entries(attributes)) {
            const location = gl.getAttribLocation(program, `a${attrName.charAt(0).toUpperCase() + attrName.slice(1)}`);
            if (location !== -1) {
                gl.enableVertexAttribArray(location);
                gl.bindBuffer(gl.ARRAY_BUFFER, attrData.buffer);
                gl.vertexAttribPointer(
                    location,
                    attrData.size,
                    attrData.type,
                    attrData.normalized,
                    0,
                    0
                );
            }
        }
    }

    setUniform(name, value) {
        for (const program of this.programs.values()) {
            const gl = this.gl;
            const location = gl.getUniformLocation(program, name);
            if (location) {
                if (value instanceof Float32Array || value.length === 16) {
                    gl.uniformMatrix4fv(location, false, value);
                } else if (value.length === 3) {
                    gl.uniform3fv(location, value);
                } else if (value.length === 4) {
                    gl.uniform4fv(location, value);
                } else if (typeof value === 'number') {
                    gl.uniform1f(location, value);
                } else if (typeof value === 'boolean') {
                    gl.uniform1i(location, value);
                }
            }
        }
    }

    addEntity(id, entity) {
        this.entities.set(id, entity);
    }

    removeEntity(id) {
        this.entities.delete(id);
    }

    createParticleSystem(config) {
        const system = new ParticleSystem(this, config);
        this.particleSystems.set(config.id, system);
        return system;
    }

    // بهینه‌سازی حافظه
    cleanup() {
        const gl = this.gl;
        
        // پاکسازی بافرها
        for (const buffer of this.buffers.values()) {
            gl.deleteVertexArray(buffer.vao);
            for (const attr of Object.values(buffer.attributes)) {
                gl.deleteBuffer(attr.buffer);
            }
        }
        
        // پاکسازی برنامه‌ها
        for (const program of this.programs.values()) {
            gl.deleteProgram(program);
        }
        
        this.buffers.clear();
        this.programs.clear();
        this.entities.clear();
        this.particleSystems.clear();
    }

    // ابزارهای توسعه
    showPerformance() {
        const perfInfo = document.createElement('div');
        perfInfo.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: #00ff00;
            padding: 10px;
            font-family: monospace;
            z-index: 1000;
            border: 1px solid #00ff00;
        `;
        
        const updatePerf = () => {
            perfInfo.innerHTML = `
                FPS: ${this.fps}<br>
                Entities: ${this.entities.size}<br>
                Particles: ${Array.from(this.particleSystems.values())
                    .reduce((sum, sys) => sum + sys.getParticleCount(), 0)}<br>
                Delta: ${this.deltaTime.toFixed(4)}s
            `;
            requestAnimationFrame(updatePerf);
        };
        
        document.body.appendChild(perfInfo);
        updatePerf();
    }
}

// سیستم ذرات پیشرفته
class ParticleSystem {
    constructor(engine, config) {
        this.engine = engine;
        this.config = config;
        this.particles = [];
        this.buffer = null;
        
        this.init();
    }

    init() {
        this.createParticles();
        this.setupBuffer();
    }

    createParticles() {
        for (let i = 0; i < this.config.count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            position: [
                (Math.random() - 0.5) * this.config.spread[0],
                (Math.random() - 0.5) * this.config.spread[1],
                (Math.random() - 0.5) * this.config.spread[2]
            ],
            velocity: [
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ],
            life: 1.0,
            maxLife: 1.0,
            size: Math.random() * this.config.maxSize + this.config.minSize,
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
        };
    }

    update(deltaTime) {
        for (const particle of this.particles) {
            // به‌روزرسانی موقعیت
            particle.position[0] += particle.velocity[0] * deltaTime;
            particle.position[1] += particle.velocity[1] * deltaTime;
            particle.position[2] += particle.velocity[2] * deltaTime;
            
            // کاهش عمر
            particle.life -= deltaTime / particle.maxLife;
            
            // بازتولید ذرات مرده
            if (particle.life <= 0) {
                Object.assign(particle, this.createParticle());
            }
        }
    }

    render() {
        // رندر ذرات با WebGL
        const program = this.engine.programs.get('particle');
        if (!program || !this.buffer) return;
        
        const gl = this.engine.gl;
        gl.useProgram(program);
        gl.bindVertexArray(this.buffer.vao);
        
        // به‌روزرسانی داده‌های بافر
        this.updateBufferData();
        
        gl.drawArrays(gl.POINTS, 0, this.particles.length);
        gl.bindVertexArray(null);
    }

    setupBuffer() {
        // ایجاد بافر برای ذرات
    }

    updateBufferData() {
        // به‌روزرسانی داده‌های بافر
    }

    getParticleCount() {
        return this.particles.length;
    }
}

// ایجاد موتور بازی
const Engine = new GameEngine();
