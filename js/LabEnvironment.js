export class LabEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.environmentGroup = new BABYLON.TransformNode("environmentGroup", scene);
        
        this.setupFog();
        this.setupParticles();
        this.setupLighting();
    }

    setupFog() {
        // Add volumetric fog
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.05;
        this.scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.15);
    }

    setupParticles() {
        // Create dust particles
        this.dustParticles = new BABYLON.ParticleSystem("dustParticles", 1000, this.scene);
        this.dustParticles.particleTexture = new BABYLON.Texture("textures/dust.png", this.scene);
        
        // Particle behavior
        this.dustParticles.minEmitBox = new BABYLON.Vector3(-2, -2, -2);
        this.dustParticles.maxEmitBox = new BABYLON.Vector3(2, 2, 2);
        this.dustParticles.minSize = 0.02;
        this.dustParticles.maxSize = 0.05;
        this.dustParticles.minLifeTime = 5;
        this.dustParticles.maxLifeTime = 8;
        this.dustParticles.emitRate = 50;
        
        // Slow upward drift
        this.dustParticles.gravity = new BABYLON.Vector3(0, 0.02, 0);
        this.dustParticles.direction1 = new BABYLON.Vector3(-0.1, 0.1, -0.1);
        this.dustParticles.direction2 = new BABYLON.Vector3(0.1, 0.1, 0.1);
        this.dustParticles.minEmitPower = 0.1;
        this.dustParticles.maxEmitPower = 0.3;
        
        // Particle color
        this.dustParticles.color1 = new BABYLON.Color4(0.8, 0.8, 0.9, 0.1);
        this.dustParticles.color2 = new BABYLON.Color4(0.9, 0.9, 1.0, 0.15);
        this.dustParticles.colorDead = new BABYLON.Color4(0.9, 0.9, 1.0, 0);

        this.dustParticles.parent = this.environmentGroup;
        this.dustParticles.start();
    }

    setupLighting() {
        // Add point lights for atmosphere
        const createPointLight = (name, position, intensity, radius) => {
            const light = new BABYLON.PointLight(
                name,
                position,
                this.scene
            );
            light.intensity = intensity;
            light.radius = radius;
            return light;
        };

        // Create multiple point lights for depth
        this.lights = [
            createPointLight("topLight", 
                new BABYLON.Vector3(0, 3, 0), 
                0.4, 
                5
            ),
            createPointLight("backLight", 
                new BABYLON.Vector3(0, 0, -3), 
                0.3, 
                4
            ),
            createPointLight("frontLight", 
                new BABYLON.Vector3(0, 0, 3), 
                0.2, 
                4
            )
        ];

        // Add subtle color variations to lights
        this.lights[0].diffuse = new BABYLON.Color3(0.9, 0.95, 1.0);
        this.lights[1].diffuse = new BABYLON.Color3(0.8, 0.9, 1.0);
        this.lights[2].diffuse = new BABYLON.Color3(1.0, 0.95, 0.9);
    }

    update(deltaTime) {
        // Animate lights subtly
        const time = performance.now() * 0.001;
        
        this.lights.forEach((light, index) => {
            const offset = index * Math.PI * 0.5;
            const intensity = 0.2 + Math.sin(time * 0.5 + offset) * 0.1;
            light.intensity = intensity;
        });

        // Update fog density with subtle variation
        this.scene.fogDensity = 0.05 + Math.sin(time * 0.2) * 0.01;
    }

    dispose() {
        if (this.dustParticles) {
            this.dustParticles.dispose();
        }
        this.lights.forEach(light => {
            light.dispose();
        });
        this.environmentGroup.dispose();
    }
} 