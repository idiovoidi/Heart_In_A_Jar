import { Scene, TransformNode, MeshBuilder, Vector3, ShaderMaterial, Effect, ParticleSystem, DynamicTexture, Color4, Color3, Mesh, Matrix } from '@babylonjs/core';
import { EntityBase } from './core/EntityBase';

export class FluidSimulation extends EntityBase {
    fluidGroup: TransformNode;
    currentLevel: number;
    targetLevel: number;
    fillSpeed: number;
    isFlowing: boolean;
    jarRadius: number;
    maxHeight: number;
    jarBottomY: number;
    fluidMesh!: Mesh;
    shaderMaterial!: ShaderMaterial;
    particleSystem!: ParticleSystem;

    constructor(scene: Scene) {
        super(scene, "fluidSim");
        this.fluidGroup = new TransformNode("fluidGroup", scene);
        this.currentLevel = 0;
        this.targetLevel = 0;
        this.fillSpeed = 0.005;
        this.isFlowing = false;
        this.jarRadius = 2.0; // Jar radius (jar has diameter 4)
        this.maxHeight = 3.5; // Max fillable height inside jar (jar height is 4)
        this.jarBottomY = -2; // Jar bottom position

        this.createFluid();
        this.createBloodParticles();
    }

    createFluid(): void {
        const fluid = MeshBuilder.CreateCylinder("fluid", {
            height: 0.1,
            diameter: this.jarRadius * 2 * 0.95, // Slightly smaller than jar diameter
            tessellation: 64,
            subdivisions: 2
        }, this.scene);
        
        // Set pivot to bottom so scaling grows upward
        fluid.setPivotMatrix(new Matrix().setTranslationFromFloats(0, -0.05, 0), false);
        fluid.position.y = this.jarBottomY + 0.05;

        const shaderMaterial = new ShaderMaterial("bloodShader", this.scene, {
            vertex: "blood",
            fragment: "blood",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "height", "cameraPosition", "viscosity", "surfaceTension", "transparency", "bloodColor"],
            defines: [],
            needAlphaBlending: true,
            needAlphaTesting: false,
        });

        // Blood-specific parameters
        shaderMaterial.setFloat("time", 0);
        shaderMaterial.setFloat("height", 0.1);
        shaderMaterial.setVector3("bloodColor", new Vector3(0.6, 0.1, 0.1));
        shaderMaterial.setFloat("viscosity", 2.0);
        shaderMaterial.setFloat("surfaceTension", 0.8);
        shaderMaterial.setFloat("transparency", 0.95);
        shaderMaterial.backFaceCulling = false;

        fluid.material = shaderMaterial;
        fluid.parent = this.fluidGroup;

        this.fluidMesh = fluid;
        this.shaderMaterial = shaderMaterial;

        // Enhanced blood shader with surface tension
        Effect.ShadersStore["bloodVertexShader"] = `
            precision highp float;

            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 normal;

            uniform mat4 worldViewProjection;
            uniform mat4 world;
            uniform vec3 cameraPosition;
            uniform float time;
            uniform float height;
            uniform float viscosity;
            uniform float surfaceTension;

            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying float vHeight;

            void main(void) {
                vUv = uv;
                vPosition = position;
                
                vec3 pos = position;
                if (pos.y > 0.45) {
                    float radius = length(pos.xz);
                    float tensionFactor = smoothstep(0.8, 1.0, radius);
                    
                    float wave1 = sin(pos.x * 2.0 + time * 0.5) * cos(pos.z * 2.0 + time * 0.3) * 0.02;
                    float wave2 = cos(pos.x * 3.0 + time * 0.3) * sin(pos.z * 2.5 + time * 0.4) * 0.015;
                    
                    float surfaceDeformation = (wave1 + wave2) * (1.0 - tensionFactor * surfaceTension);
                    pos.y += surfaceDeformation;
                }

                vec4 worldPos = world * vec4(pos, 1.0);
                vViewDir = normalize(cameraPosition - worldPos.xyz);
                vNormal = normalize(mat3(world) * normal);
                vHeight = pos.y;
                
                gl_Position = worldViewProjection * vec4(pos, 1.0);
            }
        `;

        Effect.ShadersStore["bloodFragmentShader"] = `
            precision highp float;

            uniform float time;
            uniform vec3 bloodColor;
            uniform float viscosity;
            uniform float transparency;

            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying float vHeight;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main(void) {
                float cellPattern = random(vPosition.xz * 10.0 + time * 0.1) * 0.1;
                
                float swirl1 = sin(vPosition.x * 2.0 + time * 0.3) * cos(vPosition.z * 2.0 + time * 0.2);
                float swirl2 = cos(vPosition.x * 3.0 - time * 0.2) * sin(vPosition.z * 2.5 + time * 0.3);
                float swirl = (swirl1 + swirl2) * 0.3;
                
                float depth = smoothstep(-1.0, 1.0, vHeight);
                
                float fresnelTerm = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
                
                vec3 baseColor = bloodColor * (0.8 + cellPattern);
                vec3 darkColor = bloodColor * 0.5;
                vec3 color = mix(darkColor, baseColor, depth);
                
                color += bloodColor * swirl * 0.2;
                color += vec3(0.8, 0.2, 0.2) * fresnelTerm * 0.3;
                
                float alpha = transparency * (0.9 + fresnelTerm * 0.1);
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
    }

    createBloodParticles(): void {
        this.particleSystem = new ParticleSystem("bloodParticles", 2000, this.scene);

        const particleTexture = new DynamicTexture("bloodParticle", 32, this.scene, true);
        const ctx = particleTexture.getContext() as CanvasRenderingContext2D;
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(180, 20, 20, 1.0)');
        gradient.addColorStop(0.8, 'rgba(120, 10, 10, 0.8)');
        gradient.addColorStop(1, 'rgba(80, 0, 0, 0.0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        particleTexture.update();

        this.particleSystem.particleTexture = particleTexture;

        this.particleSystem.minEmitBox = new Vector3(-0.3, 0, -0.3);
        this.particleSystem.maxEmitBox = new Vector3(0.3, 0, 0.3);
        this.particleSystem.minSize = 0.05;
        this.particleSystem.maxSize = 0.15;
        this.particleSystem.minLifeTime = 1.0;
        this.particleSystem.maxLifeTime = 2.0;
        this.particleSystem.emitRate = 50;
        this.particleSystem.gravity = new Vector3(0, -9.81, 0);
        this.particleSystem.direction1 = new Vector3(-0.2, -1, -0.2);
        this.particleSystem.direction2 = new Vector3(0.2, -1, 0.2);
        this.particleSystem.minEmitPower = 0.3;
        this.particleSystem.maxEmitPower = 0.7;

        this.particleSystem.color1 = new Color4(0.7, 0.1, 0.1, 1.0);
        this.particleSystem.color2 = new Color4(0.5, 0.05, 0.05, 1.0);
        this.particleSystem.colorDead = new Color4(0.4, 0.05, 0.05, 0.0);

        // Emitter position will be updated in update()
        this.particleSystem.emitter = new Vector3(0, this.jarBottomY, 0);
    }

    startFilling(targetLevel: number = 0.85): void {
        this.isFlowing = true;
        this.targetLevel = Math.min(targetLevel, 1.0); // Clamp to 0-1 range
        this.particleSystem.start();
    }

    stopFilling(): void {
        this.isFlowing = false;
        this.particleSystem.stop();
    }

    update(deltaTime: number): void {
        if (!this.fluidMesh || !this.shaderMaterial) return;

        const time = performance.now() * 0.001;
        this.shaderMaterial.setFloat("time", time);

        if (this.isFlowing && this.currentLevel < this.targetLevel) {
            this.currentLevel += this.fillSpeed * deltaTime;
            this.currentLevel = Math.min(this.currentLevel, this.targetLevel);

            // Update mesh height and position
            // currentLevel is 0-1 representing fill percentage
            const fluidHeight = 0.1 + this.currentLevel * this.maxHeight;
            this.fluidMesh.scaling.y = fluidHeight / 0.1; // Scale relative to base height
            
            // Update height uniform for shader (normalized 0-1)
            this.shaderMaterial.setFloat("height", this.currentLevel);

            // Emit particles at fluid surface
            const emitY = this.jarBottomY + fluidHeight;
            this.particleSystem.minEmitBox = new Vector3(-0.3, emitY, -0.3);
            this.particleSystem.maxEmitBox = new Vector3(0.3, emitY, 0.3);
        }

        if (this.currentLevel >= this.targetLevel) {
            this.stopFilling();
        }
    }

    getMesh(): TransformNode {
        return this.fluidGroup;
    }

    dispose(): void {
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
