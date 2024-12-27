export class LabEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.environmentGroup = new BABYLON.TransformNode("environmentGroup", scene);
        
        this.setupFog();
        this.setupParticles();
        this.setupLighting();
        this.createLabDesk();
        this.createLabEquipment();
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

    createLabDesk() {
        // Create wooden desk surface - make it larger
        const desk = BABYLON.MeshBuilder.CreateBox("desk", {
            width: 12,    // Increased from 8 to 12
            height: 0.4,  // Increased from 0.2 to 0.4
            depth: 6      // Increased from 4 to 6
        }, this.scene);

        const deskMaterial = new BABYLON.PBRMaterial("deskMaterial", this.scene);
        deskMaterial.albedoColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        deskMaterial.metallic = 0.1;
        deskMaterial.roughness = 0.8;
        desk.material = deskMaterial;
        desk.position.y = -3.2;  // Lowered from -2.5 to -3.2
        desk.parent = this.environmentGroup;

        // Add desk legs - adjust positions for larger desk
        const createLeg = (x, z) => {
            const leg = BABYLON.MeshBuilder.CreateBox("deskLeg", {
                width: 0.3,    // Slightly thicker legs
                height: 2.8,   // Adjusted height
                depth: 0.3     // Slightly thicker legs
            }, this.scene);
            leg.material = deskMaterial;
            leg.position = new BABYLON.Vector3(x, -4.5, z);  // Adjusted Y position
            leg.parent = this.environmentGroup;
        };

        // Adjust leg positions for larger table
        createLeg(5.5, 2.5);
        createLeg(-5.5, 2.5);
        createLeg(5.5, -2.5);
        createLeg(-5.5, -2.5);
    }

    createLabEquipment() {
        // Adjust positions for higher table
        // Create beakers
        this.createBeaker(-2, -2.8, 0, 0.8);    // Raised Y position
        this.createBeaker(-1, -2.8, 1, 0.6);    // Raised Y position
        this.createBeaker(2, -2.8, -1, 0.5);    // Raised Y position

        // Create Bunsen burner
        this.createBunsenBurner(1.5, -2.8, 0.5); // Raised Y position

        // Create test tube rack with tubes
        this.createTestTubeRack(0.5, -2.8, -0.5); // Raised Y position
    }

    createBeaker(x, y, z, scale = 1.0) {
        const beakerGroup = new BABYLON.TransformNode("beakerGroup", this.scene);
        beakerGroup.position = new BABYLON.Vector3(x, y, z);
        beakerGroup.scaling = new BABYLON.Vector3(scale, scale, scale);
        beakerGroup.parent = this.environmentGroup;

        // Create glass material
        const glassMaterial = new BABYLON.PBRMaterial("beakerGlass", this.scene);
        glassMaterial.metallic = 0.0;
        glassMaterial.roughness = 0.2;
        glassMaterial.alpha = 0.3;
        glassMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        glassMaterial.backFaceCulling = false;
        glassMaterial.indexOfRefraction = 1.5;

        // Create beaker body
        const body = BABYLON.MeshBuilder.CreateCylinder("beakerBody", {
            height: 1.2,
            diameter: 0.8,
            tessellation: 32
        }, this.scene);
        body.material = glassMaterial;
        body.parent = beakerGroup;

        // Create beaker rim
        const rim = BABYLON.MeshBuilder.CreateTorus("beakerRim", {
            diameter: 0.8,
            thickness: 0.05,
            tessellation: 32
        }, this.scene);
        rim.position.y = 0.6;
        rim.material = glassMaterial;
        rim.parent = beakerGroup;

        // Add random colored liquid
        if (Math.random() > 0.3) {
            const liquidHeight = 0.2 + Math.random() * 0.7;
            const liquid = BABYLON.MeshBuilder.CreateCylinder("liquid", {
                height: liquidHeight,
                diameter: 0.75,
                tessellation: 32
            }, this.scene);

            const liquidMaterial = new BABYLON.StandardMaterial("liquidMaterial", this.scene);
            liquidMaterial.diffuseColor = new BABYLON.Color3(
                Math.random(),
                Math.random(),
                Math.random()
            );
            liquidMaterial.alpha = 0.8;
            liquid.material = liquidMaterial;
            liquid.position.y = -0.6 + liquidHeight/2;
            liquid.parent = beakerGroup;
        }
    }

    createBunsenBurner(x, y, z) {
        const burnerGroup = new BABYLON.TransformNode("burnerGroup", this.scene);
        burnerGroup.position = new BABYLON.Vector3(x, y, z);
        burnerGroup.parent = this.environmentGroup;

        // Create base
        const base = BABYLON.MeshBuilder.CreateCylinder("burnerBase", {
            height: 0.1,
            diameter: 0.4,
            tessellation: 32
        }, this.scene);
        
        const metalMaterial = new BABYLON.PBRMaterial("metalMaterial", this.scene);
        metalMaterial.metallic = 0.8;
        metalMaterial.roughness = 0.4;
        base.material = metalMaterial;
        base.parent = burnerGroup;

        // Create tube
        const tube = BABYLON.MeshBuilder.CreateCylinder("burnerTube", {
            height: 0.8,
            diameter: 0.1,
            tessellation: 16
        }, this.scene);
        tube.position.y = 0.4;
        tube.material = metalMaterial;
        tube.parent = burnerGroup;

        // Create flame (when active)
        this.createFlame(burnerGroup);
    }

    createFlame(burnerGroup) {
        const flameSystem = new BABYLON.ParticleSystem("flame", 200, this.scene);
        flameSystem.particleTexture = new BABYLON.Texture("textures/flame.png", this.scene);
        
        flameSystem.emitter = new BABYLON.Vector3(0, 0.8, 0);
        flameSystem.minEmitBox = new BABYLON.Vector3(-0.1, 0, -0.1);
        flameSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);
        
        flameSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        flameSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0);
        flameSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
        
        flameSystem.minSize = 0.1;
        flameSystem.maxSize = 0.3;
        flameSystem.minLifeTime = 0.1;
        flameSystem.maxLifeTime = 0.3;
        flameSystem.emitRate = 100;
        flameSystem.gravity = new BABYLON.Vector3(0, 2, 0);
        flameSystem.direction1 = new BABYLON.Vector3(0, 1, 0);
        flameSystem.direction2 = new BABYLON.Vector3(0, 1, 0);
        
        flameSystem.parent = burnerGroup;
        flameSystem.start();
    }

    createTestTubeRack(x, y, z) {
        const rackGroup = new BABYLON.TransformNode("rackGroup", this.scene);
        rackGroup.position = new BABYLON.Vector3(x, y, z);
        rackGroup.parent = this.environmentGroup;

        // Create rack base
        const base = BABYLON.MeshBuilder.CreateBox("rackBase", {
            width: 1.2,
            height: 0.1,
            depth: 0.4
        }, this.scene);
        
        const woodMaterial = new BABYLON.PBRMaterial("woodMaterial", this.scene);
        woodMaterial.albedoColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        woodMaterial.metallic = 0.1;
        woodMaterial.roughness = 0.8;
        base.material = woodMaterial;
        base.parent = rackGroup;

        // Create test tubes
        for (let i = 0; i < 5; i++) {
            this.createTestTube(
                -0.5 + i * 0.25,
                0.3,
                0,
                rackGroup
            );
        }
    }

    createTestTube(x, y, z, parent) {
        const tubeGroup = new BABYLON.TransformNode("tubeGroup", this.scene);
        tubeGroup.position = new BABYLON.Vector3(x, y, z);
        tubeGroup.parent = parent;

        // Create glass material
        const glassMaterial = new BABYLON.PBRMaterial("tubeGlass", this.scene);
        glassMaterial.metallic = 0.0;
        glassMaterial.roughness = 0.2;
        glassMaterial.alpha = 0.3;
        glassMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        glassMaterial.backFaceCulling = false;

        // Create tube
        const tube = BABYLON.MeshBuilder.CreateCylinder("testTube", {
            height: 0.6,
            diameter: 0.1,
            tessellation: 16
        }, this.scene);
        tube.material = glassMaterial;
        tube.parent = tubeGroup;

        // Add random colored liquid
        if (Math.random() > 0.2) {
            const liquidHeight = 0.1 + Math.random() * 0.4;
            const liquid = BABYLON.MeshBuilder.CreateCylinder("liquid", {
                height: liquidHeight,
                diameter: 0.08,
                tessellation: 16
            }, this.scene);

            const liquidMaterial = new BABYLON.StandardMaterial("liquidMaterial", this.scene);
            liquidMaterial.diffuseColor = new BABYLON.Color3(
                Math.random(),
                Math.random(),
                Math.random()
            );
            liquidMaterial.alpha = 0.8;
            liquid.material = liquidMaterial;
            liquid.position.y = -0.3 + liquidHeight/2;
            liquid.parent = tubeGroup;
        }
    }
} 