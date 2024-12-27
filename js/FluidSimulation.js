export class FluidSimulation {
    constructor(scene) {
        this.scene = scene;
        this.fluidGroup = new BABYLON.TransformNode("fluidGroup", scene);
        this.currentLevel = 0;
        this.targetLevel = 0;
        this.fillSpeed = 0.0001;
        this.isFlowing = false;
        this.jarRadius = 1.8;
        this.maxHeight = 3.5;
        
        this.createFluid();
        this.createParticleSystem();
    }

    createFluid() {
        // Create fluid mesh (cylinder that will grow)
        const fluid = BABYLON.MeshBuilder.CreateCylinder("fluid", {
            height: 0.1,
            diameter: this.jarRadius * 2 * 0.95, // Slightly smaller than jar
            tessellation: 32,
            subdivisions: 1
        }, this.scene);

        // Create custom shader material for fluid
        const shaderMaterial = new BABYLON.ShaderMaterial("fluidShader", this.scene, {
            vertex: "fluid",
            fragment: "fluid",
        },
        {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "height"],
            defines: [],
            needAlphaBlending: true,
            needAlphaTesting: true,
        });

        // Set shader parameters
        shaderMaterial.setFloat("time", 0);
        shaderMaterial.setFloat("height", 0.1);
        shaderMaterial.setVector3("baseColor", new BABYLON.Vector3(0.7, 0.1, 0.1));
        shaderMaterial.setFloat("transparency", 0.85);
        shaderMaterial.setFloat("waveHeight", 0.05);
        shaderMaterial.setFloat("waveFrequency", 2.0);
        shaderMaterial.backFaceCulling = false;

        fluid.material = shaderMaterial;
        fluid.position.y = -2; // Start at bottom of jar
        fluid.parent = this.fluidGroup;

        this.fluidMesh = fluid;
        this.shaderMaterial = shaderMaterial;

        // Add custom shader code to the scene
        BABYLON.Effect.ShadersStore["fluidVertexShader"] = `
            precision highp float;

            // Attributes
            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 normal;

            // Uniforms
            uniform mat4 worldViewProjection;
            uniform float time;
            uniform float height;
            uniform float waveHeight;
            uniform float waveFrequency;

            // Varying
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;

            void main(void) {
                vUv = uv;
                vPosition = position;
                vNormal = normal;

                // Add waves to the surface
                vec3 pos = position;
                if (pos.y > 0.45) {
                    pos.y += sin(pos.x * waveFrequency + time) * cos(pos.z * waveFrequency + time) * waveHeight;
                }

                gl_Position = worldViewProjection * vec4(pos, 1.0);
            }
        `;

        BABYLON.Effect.ShadersStore["fluidFragmentShader"] = `
            precision highp float;

            // Uniforms
            uniform float time;
            uniform vec3 baseColor;
            uniform float transparency;

            // Varying
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;

            void main(void) {
                // Create swirling patterns
                float swirl = sin(vPosition.x * 4.0 + time) * cos(vPosition.z * 4.0 + time * 0.5) * 0.5 + 0.5;
                
                // Add depth-based color variation
                float depth = vPosition.y * 0.5 + 0.5;
                
                // Combine effects
                vec3 color = baseColor * (0.8 + swirl * 0.4) * (0.7 + depth * 0.6);
                
                // Add edge highlighting
                float edge = 1.0 - pow(abs(dot(vNormal, vec3(0.0, 1.0, 0.0))), 2.0);
                color += edge * 0.2;

                gl_FragColor = vec4(color, transparency);
            }
        `;
    }

    createParticleSystem() {
        // Create particle system for drips and splashes
        this.particleSystem = new BABYLON.ParticleSystem("fluidParticles", 2000, this.scene);
        this.particleSystem.particleTexture = new BABYLON.Texture("textures/fluidParticle.png", this.scene);
        
        // Particle behavior
        this.particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
        this.particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);
        this.particleSystem.minSize = 0.03;
        this.particleSystem.maxSize = 0.08;
        this.particleSystem.minLifeTime = 0.5;
        this.particleSystem.maxLifeTime = 1.5;
        this.particleSystem.emitRate = 100;
        this.particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
        this.particleSystem.direction1 = new BABYLON.Vector3(-0.2, -1, -0.2);
        this.particleSystem.direction2 = new BABYLON.Vector3(0.2, -1, 0.2);
        this.particleSystem.minEmitPower = 0.5;
        this.particleSystem.maxEmitPower = 1;
        
        // Particle color
        this.particleSystem.color1 = new BABYLON.Color4(0.7, 0.1, 0.1, 1.0);
        this.particleSystem.color2 = new BABYLON.Color4(0.5, 0.1, 0.1, 1.0);
        this.particleSystem.colorDead = new BABYLON.Color4(0.4, 0.1, 0.1, 0.0);
        
        this.particleSystem.parent = this.fluidGroup;
    }

    startFilling(targetLevel = 0.8) {
        this.isFlowing = true;
        this.targetLevel = Math.min(targetLevel, this.maxHeight);
        this.particleSystem.start();
    }

    stopFilling() {
        this.isFlowing = false;
        this.particleSystem.stop();
    }

    update(deltaTime) {
        if (!this.fluidMesh || !this.shaderMaterial) return;

        const time = performance.now() * 0.001;
        this.shaderMaterial.setFloat("time", time);

        if (this.isFlowing && this.currentLevel < this.targetLevel) {
            this.currentLevel += this.fillSpeed * deltaTime;
            
            // Update fluid mesh
            this.fluidMesh.scaling.y = this.currentLevel;
            this.shaderMaterial.setFloat("height", this.currentLevel);

            // Update particle emission position
            const emitHeight = -2 + (this.currentLevel * this.maxHeight);
            this.particleSystem.minEmitBox.y = emitHeight;
            this.particleSystem.maxEmitBox.y = emitHeight;
        }

        if (this.currentLevel >= this.targetLevel) {
            this.stopFilling();
        }
    }

    getMesh() {
        return this.fluidGroup;
    }

    dispose() {
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
        if (this.shaderMaterial) {
            this.shaderMaterial.dispose();
        }
        if (this.fluidMesh) {
            this.fluidMesh.dispose();
        }
        this.fluidGroup.dispose();
    }
} 