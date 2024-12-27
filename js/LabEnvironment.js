export class LabEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.environmentGroup = new BABYLON.TransformNode("environmentGroup", scene);
        this.isOverheadLightOn = true;
        
        // Create particle texture programmatically
        this.particleTexture = this.createParticleTexture();
        
        this.setupFog();
        this.setupParticles();
        this.setupLighting();
        this.createLabDesk();
        this.createLabEquipment();
        this.createOverheadLight();
    }

    createParticleTexture() {
        const size = 38;
        const texture = new BABYLON.DynamicTexture("particleTexture", size, this.scene, true);
        const ctx = texture.getContext();
        
        // Create a radial gradient for a soft particle
        const gradient = ctx.createRadialGradient(
            size/2, size/2, 0,
            size/2, size/2, size/2
        );
        
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        texture.update();
        return texture;
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
        this.dustParticles.particleTexture = this.particleTexture;
        
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

        // Add subtle flicker to overhead light when on
        if (this.isOverheadLightOn && this.overheadLight) {
            const flicker = 0.95 + Math.random() * 0.1;
            this.overheadLight.intensity = 0.8 * flicker;
            
            // Subtle tube flicker
            this.lightTubes.forEach(tube => {
                const tubeFlicker = 0.97 + Math.random() * 0.06;
                tube.material.emissiveColor = new BABYLON.Color3(
                    0.9 * tubeFlicker,
                    0.9 * tubeFlicker,
                    1 * tubeFlicker
                );
            });
        }
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
        // Spread equipment around the jar
        // Left side of jar
        this.createBeaker(-4, -2.8, -1, 0.8);    // Large beaker
        this.createBeaker(-3, -2.8, 1, 0.6);     // Medium beaker
        this.createBeaker(-4, -2.8, 2, 0.5);     // Small beaker

        // Right side of jar
        this.createBunsenBurner(3.5, -2.8, -1);  // Bunsen burner
        this.createTestTubeRack(4, -2.8, 1);     // Test tube rack

        // Behind jar
        this.createBeaker(0, -2.8, 2, 0.7);      // Another beaker
        this.createBeaker(1.5, -2.8, 2.5, 0.5);  // Small beaker

        // Front of jar
        this.createBeaker(-2, -2.8, -2, 0.6);    // Medium beaker
        this.createTestTubeRack(2, -2.8, -2);    // Another test tube rack
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

        // Add random colored liquid with more controlled colors
        if (Math.random() > 0.3) {
            const liquidHeight = 0.2 + Math.random() * 0.7;
            const liquid = BABYLON.MeshBuilder.CreateCylinder("liquid", {
                height: liquidHeight,
                diameter: 0.75,
                tessellation: 32
            }, this.scene);

            const liquidMaterial = new BABYLON.StandardMaterial("liquidMaterial", this.scene);
            
            // Use a set of predefined laboratory-like colors
            const labColors = [
                new BABYLON.Color3(0.2, 0.6, 0.8),  // Blue solution
                new BABYLON.Color3(0.8, 0.2, 0.2),  // Red solution
                new BABYLON.Color3(0.2, 0.8, 0.2),  // Green solution
                new BABYLON.Color3(0.8, 0.6, 0.2),  // Amber solution
                new BABYLON.Color3(0.6, 0.2, 0.8),  // Purple solution
                new BABYLON.Color3(0.8, 0.4, 0.0)   // Orange solution
            ];
            
            liquidMaterial.diffuseColor = labColors[Math.floor(Math.random() * labColors.length)];
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
        flameSystem.particleTexture = this.particleTexture;
        
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

        // Create test tubes in a slight arc
        const numTubes = 5;
        for (let i = 0; i < numTubes; i++) {
            const angle = (i - (numTubes-1)/2) * 0.1;
            const xPos = -0.5 + i * 0.25;
            const zPos = Math.sin(angle) * 0.1;
            this.createTestTube(xPos, 0.3, zPos, rackGroup);
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

        // Add random colored liquid with lab-appropriate colors
        if (Math.random() > 0.2) {
            const liquidHeight = 0.1 + Math.random() * 0.4;
            const liquid = BABYLON.MeshBuilder.CreateCylinder("liquid", {
                height: liquidHeight,
                diameter: 0.08,
                tessellation: 16
            }, this.scene);

            const liquidMaterial = new BABYLON.StandardMaterial("liquidMaterial", this.scene);
            const labColors = [
                new BABYLON.Color3(0.2, 0.6, 0.8),  // Blue solution
                new BABYLON.Color3(0.8, 0.2, 0.2),  // Red solution
                new BABYLON.Color3(0.2, 0.8, 0.2),  // Green solution
                new BABYLON.Color3(0.8, 0.6, 0.2),  // Amber solution
                new BABYLON.Color3(0.6, 0.2, 0.8),  // Purple solution
                new BABYLON.Color3(0.8, 0.4, 0.0)   // Orange solution
            ];
            
            liquidMaterial.diffuseColor = labColors[Math.floor(Math.random() * labColors.length)];
            liquidMaterial.alpha = 0.8;
            liquid.material = liquidMaterial;
            liquid.position.y = -0.3 + liquidHeight/2;
            liquid.parent = tubeGroup;
        }
    }

    createOverheadLight() {
        // Create light fixture group
        const fixtureGroup = new BABYLON.TransformNode("overheadFixture", this.scene);
        fixtureGroup.position = new BABYLON.Vector3(0, 4, 0);
        fixtureGroup.parent = this.environmentGroup;

        // Create metal housing
        const housing = BABYLON.MeshBuilder.CreateBox("lightHousing", {
            width: 2,
            height: 0.2,
            depth: 0.6
        }, this.scene);
        
        const metalMaterial = new BABYLON.PBRMaterial("fixtureMetal", this.scene);
        metalMaterial.metallic = 0.8;
        metalMaterial.roughness = 0.3;
        metalMaterial.albedoColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        housing.material = metalMaterial;
        housing.parent = fixtureGroup;

        // Create light tubes
        const createTube = (offset) => {
            const tube = BABYLON.MeshBuilder.CreateCylinder("lightTube", {
                height: 1.8,
                diameter: 0.15,
                tessellation: 16
            }, this.scene);
            tube.position.x = offset;
            tube.rotation.z = Math.PI / 2;

            // Create glowing material for the tube
            const tubeMaterial = new BABYLON.StandardMaterial("tubeMaterial", this.scene);
            tubeMaterial.emissiveColor = new BABYLON.Color3(0.9, 0.9, 1);
            tubeMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
            tubeMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            tube.material = tubeMaterial;
            tube.parent = fixtureGroup;
            return { mesh: tube, material: tubeMaterial };
        };

        // Create two fluorescent tubes
        this.lightTubes = [
            createTube(-0.4),
            createTube(0.4)
        ];

        // Create the actual light source
        this.overheadLight = new BABYLON.PointLight(
            "overheadLight",
            new BABYLON.Vector3(0, -0.5, 0),
            this.scene
        );
        this.overheadLight.intensity = 0.8;
        this.overheadLight.radius = 10;
        this.overheadLight.diffuse = new BABYLON.Color3(0.9, 0.95, 1.0);
        this.overheadLight.parent = fixtureGroup;

        // Add chains to suspend the light
        this.createSuspensionChains(fixtureGroup);
    }

    createSuspensionChains(fixtureGroup) {
        const createChain = (x, z) => {
            const chain = BABYLON.MeshBuilder.CreateCylinder("chain", {
                height: 2,
                diameter: 0.05,
                tessellation: 8
            }, this.scene);
            chain.position = new BABYLON.Vector3(x, 1, z);
            
            const chainMaterial = new BABYLON.PBRMaterial("chainMetal", this.scene);
            chainMaterial.metallic = 0.9;
            chainMaterial.roughness = 0.4;
            chainMaterial.albedoColor = new BABYLON.Color3(0.6, 0.6, 0.6);
            chain.material = chainMaterial;
            chain.parent = fixtureGroup;
        };

        // Create four suspension chains
        createChain(-0.8, 0.2);
        createChain(0.8, 0.2);
        createChain(-0.8, -0.2);
        createChain(0.8, -0.2);
    }

    toggleOverheadLight() {
        this.isOverheadLightOn = !this.isOverheadLightOn;
        
        // Toggle light intensity
        this.overheadLight.intensity = this.isOverheadLightOn ? 0.8 : 0;
        
        // Toggle tube glow
        this.lightTubes.forEach(tube => {
            if (this.isOverheadLightOn) {
                tube.material.emissiveColor = new BABYLON.Color3(0.9, 0.9, 1);
                tube.material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
            } else {
                tube.material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
                tube.material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            }
        });
    }
} 