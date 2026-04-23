import { Scene, TransformNode, DynamicTexture, ParticleSystem, PointLight, Vector3, Color4, Color3, MeshBuilder, PBRMaterial, StandardMaterial, Mesh } from '@babylonjs/core';
import { EntityBase } from './core/EntityBase';

export class LabEnvironment extends EntityBase {
    environmentGroup: TransformNode;
    isOverheadLightOn: boolean;
    particleTexture: DynamicTexture;
    dustParticles!: ParticleSystem;
    lights: PointLight[] = [];
    overheadLight!: PointLight;
    lightTubes: { mesh: Mesh; material: StandardMaterial }[] = [];

    constructor(scene: Scene) {
        super(scene, "labEnvironment");
        this.environmentGroup = new TransformNode("environmentGroup", scene);
        this.isOverheadLightOn = true;
        this.particleTexture = this.createParticleTexture();

        this.setupFog();
        this.setupParticles();
        this.setupLighting();
        this.createLabDesk();
        this.createLabEquipment();
        this.createOverheadLight();
    }

    createParticleTexture(): DynamicTexture {
        const size = 38;
        const texture = new DynamicTexture("particleTexture", size, this.scene, true);
        const ctx = texture.getContext() as CanvasRenderingContext2D;

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

    setupFog(): void {
        this.scene.fogMode = Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.05;
        this.scene.fogColor = new Color3(0.1, 0.1, 0.15);
    }

    setupParticles(): void {
        this.dustParticles = new ParticleSystem("dustParticles", 1000, this.scene);
        this.dustParticles.particleTexture = this.particleTexture;

        this.dustParticles.minEmitBox = new Vector3(-2, -2, -2);
        this.dustParticles.maxEmitBox = new Vector3(2, 2, 2);
        this.dustParticles.minSize = 0.02;
        this.dustParticles.maxSize = 0.05;
        this.dustParticles.minLifeTime = 5;
        this.dustParticles.maxLifeTime = 8;
        this.dustParticles.emitRate = 50;

        this.dustParticles.gravity = new Vector3(0, 0.02, 0);
        this.dustParticles.direction1 = new Vector3(-0.1, 0.1, -0.1);
        this.dustParticles.direction2 = new Vector3(0.1, 0.1, 0.1);
        this.dustParticles.minEmitPower = 0.1;
        this.dustParticles.maxEmitPower = 0.3;

        this.dustParticles.color1 = new Color4(0.8, 0.8, 0.9, 0.1);
        this.dustParticles.color2 = new Color4(0.9, 0.9, 1.0, 0.15);
        this.dustParticles.colorDead = new Color4(0.9, 0.9, 1.0, 0);

        this.dustParticles.emitter = this.environmentGroup.position;
        this.dustParticles.start();
    }

    setupLighting(): void {
        const createPointLight = (name: string, position: Vector3, intensity: number, radius: number) => {
            const light = new PointLight(
                name,
                position,
                this.scene
            );
            light.intensity = intensity;
            light.radius = radius;
            return light;
        };

        this.lights = [
            createPointLight("topLight",
                new Vector3(0, 3, 0),
                0.4,
                5
            ),
            createPointLight("backLight",
                new Vector3(0, 0, -3),
                0.3,
                4
            ),
            createPointLight("frontLight",
                new Vector3(0, 0, 3),
                0.2,
                4
            )
        ];

        this.lights[0].diffuse = new Color3(0.9, 0.95, 1.0);
        this.lights[1].diffuse = new Color3(0.8, 0.9, 1.0);
        this.lights[2].diffuse = new Color3(1.0, 0.95, 0.9);
    }

    update(_deltaTime: number): void {
        const time = performance.now() * 0.001;

        this.lights.forEach((light, index) => {
            const offset = index * Math.PI * 0.5;
            const intensity = 0.2 + Math.sin(time * 0.5 + offset) * 0.1;
            light.intensity = intensity;
        });

        this.scene.fogDensity = 0.05 + Math.sin(time * 0.2) * 0.01;

        if (this.isOverheadLightOn && this.overheadLight) {
            const flicker = 0.95 + Math.random() * 0.1;
            this.overheadLight.intensity = 0.8 * flicker;

            this.lightTubes.forEach(tube => {
                const tubeFlicker = 0.97 + Math.random() * 0.06;
                tube.material.emissiveColor = new Color3(
                    0.9 * tubeFlicker,
                    0.9 * tubeFlicker,
                    1 * tubeFlicker
                );
            });
        }
    }

    dispose(): void {
        if (this.dustParticles) {
            this.dustParticles.dispose();
        }
        this.lights.forEach(light => {
            light.dispose();
        });
        this.environmentGroup.dispose();
    }

    createLabDesk(): void {
        const desk = MeshBuilder.CreateBox("desk", {
            width: 12,
            height: 0.4,
            depth: 6
        }, this.scene);

        const deskMaterial = new PBRMaterial("deskMaterial", this.scene);
        deskMaterial.albedoColor = new Color3(0.4, 0.2, 0.1);
        deskMaterial.metallic = 0.1;
        deskMaterial.roughness = 0.8;
        desk.material = deskMaterial;
        desk.position.y = -3.2;
        desk.parent = this.environmentGroup;

        const createLeg = (x: number, z: number) => {
            const leg = MeshBuilder.CreateBox("deskLeg", {
                width: 0.3,
                height: 2.8,
                depth: 0.3
            }, this.scene);
            leg.material = deskMaterial;
            leg.position = new Vector3(x, -4.5, z);
            leg.parent = this.environmentGroup;
        };

        createLeg(5.5, 2.5);
        createLeg(-5.5, 2.5);
        createLeg(5.5, -2.5);
        createLeg(-5.5, -2.5);
    }

    createLabEquipment(): void {
        this.createBeaker(-4, -2.8, -1, 0.8);
        this.createBeaker(-3, -2.8, 1, 0.6);
        this.createBeaker(-4, -2.8, 2, 0.5);
        this.createBunsenBurner(3.5, -2.8, -1);
        this.createTestTubeRack(4, -2.8, 1);
        this.createBeaker(0, -2.8, 2, 0.7);
        this.createBeaker(1.5, -2.8, 2.5, 0.5);
        this.createBeaker(-2, -2.8, -2, 0.6);
        this.createTestTubeRack(2, -2.8, -2);
    }

    createBeaker(x: number, y: number, z: number, scale: number = 1.0): void {
        const beakerGroup = new TransformNode("beakerGroup", this.scene);
        beakerGroup.position = new Vector3(x, y, z);
        beakerGroup.scaling = new Vector3(scale, scale, scale);
        beakerGroup.parent = this.environmentGroup;

        const glassMaterial = new PBRMaterial("beakerGlass", this.scene);
        glassMaterial.metallic = 0.0;
        glassMaterial.roughness = 0.2;
        glassMaterial.alpha = 0.3;
        glassMaterial.transparencyMode = PBRMaterial.MATERIAL_ALPHABLEND;
        glassMaterial.backFaceCulling = false;
        glassMaterial.indexOfRefraction = 1.5;

        const body = MeshBuilder.CreateCylinder("beakerBody", {
            height: 1.2,
            diameter: 0.8,
            tessellation: 32
        }, this.scene);
        body.material = glassMaterial;
        body.parent = beakerGroup;

        const rim = MeshBuilder.CreateTorus("beakerRim", {
            diameter: 0.8,
            thickness: 0.05,
            tessellation: 32
        }, this.scene);
        rim.position.y = 0.6;
        rim.material = glassMaterial;
        rim.parent = beakerGroup;

        this.createLabLiquid(beakerGroup, 0.3, 0.2, 0.9, 0.75, 32, -0.6);
    }

    createBunsenBurner(x: number, y: number, z: number): void {
        const burnerGroup = new TransformNode("burnerGroup", this.scene);
        burnerGroup.position = new Vector3(x, y, z);
        burnerGroup.parent = this.environmentGroup;

        const base = MeshBuilder.CreateCylinder("burnerBase", {
            height: 0.1,
            diameter: 0.4,
            tessellation: 32
        }, this.scene);

        const metalMaterial = new PBRMaterial("metalMaterial", this.scene);
        metalMaterial.metallic = 0.8;
        metalMaterial.roughness = 0.4;
        base.material = metalMaterial;
        base.parent = burnerGroup;

        const tube = MeshBuilder.CreateCylinder("burnerTube", {
            height: 0.8,
            diameter: 0.1,
            tessellation: 16
        }, this.scene);
        tube.position.y = 0.4;
        tube.material = metalMaterial;
        tube.parent = burnerGroup;

        this.createFlame(burnerGroup);
    }

    createFlame(burnerGroup: TransformNode): void {
        const flameSystem = new ParticleSystem("flame", 200, this.scene);
        flameSystem.particleTexture = this.particleTexture;

        flameSystem.emitter = burnerGroup.position.add(new Vector3(0, 0.8, 0));
        flameSystem.minEmitBox = new Vector3(-0.1, 0, -0.1);
        flameSystem.maxEmitBox = new Vector3(0.1, 0.1, 0.1);

        flameSystem.color1 = new Color4(1, 0.5, 0, 1.0);
        flameSystem.color2 = new Color4(1, 0.5, 0, 1.0);
        flameSystem.colorDead = new Color4(0, 0, 0, 0.0);

        flameSystem.minSize = 0.1;
        flameSystem.maxSize = 0.3;
        flameSystem.minLifeTime = 0.1;
        flameSystem.maxLifeTime = 0.3;
        flameSystem.emitRate = 100;
        flameSystem.gravity = new Vector3(0, 2, 0);
        flameSystem.direction1 = new Vector3(0, 1, 0);
        flameSystem.direction2 = new Vector3(0, 1, 0);

        flameSystem.start();
    }

    createTestTubeRack(x: number, y: number, z: number): void {
        const rackGroup = new TransformNode("rackGroup", this.scene);
        rackGroup.position = new Vector3(x, y, z);
        rackGroup.parent = this.environmentGroup;

        const base = MeshBuilder.CreateBox("rackBase", {
            width: 1.2,
            height: 0.1,
            depth: 0.4
        }, this.scene);

        const woodMaterial = new PBRMaterial("woodMaterial", this.scene);
        woodMaterial.albedoColor = new Color3(0.4, 0.2, 0.1);
        woodMaterial.metallic = 0.1;
        woodMaterial.roughness = 0.8;
        base.material = woodMaterial;
        base.parent = rackGroup;

        const numTubes = 5;
        for (let i = 0; i < numTubes; i++) {
            const angle = (i - (numTubes-1)/2) * 0.1;
            const xPos = -0.5 + i * 0.25;
            const zPos = Math.sin(angle) * 0.1;
            this.createTestTube(xPos, 0.3, zPos, rackGroup);
        }
    }

    private createLabLiquid(
        parent: TransformNode,
        fillProbability: number,
        minHeight: number,
        maxHeight: number,
        diameter: number,
        tessellation: number,
        baseY: number
    ): void {
        if (Math.random() > fillProbability) return;

        const liquidHeight = minHeight + Math.random() * (maxHeight - minHeight);
        const liquid = MeshBuilder.CreateCylinder("liquid", {
            height: liquidHeight,
            diameter,
            tessellation
        }, this.scene);

        const liquidMaterial = new StandardMaterial("liquidMaterial", this.scene);
        const labColors = [
            new Color3(0.2, 0.6, 0.8),
            new Color3(0.8, 0.2, 0.2),
            new Color3(0.2, 0.8, 0.2),
            new Color3(0.8, 0.6, 0.2),
            new Color3(0.6, 0.2, 0.8),
            new Color3(0.8, 0.4, 0.0)
        ];

        liquidMaterial.diffuseColor = labColors[Math.floor(Math.random() * labColors.length)];
        liquidMaterial.alpha = 0.8;
        liquid.material = liquidMaterial;
        liquid.position.y = baseY + liquidHeight / 2;
        liquid.parent = parent;
    }

    createTestTube(x: number, y: number, z: number, parent: TransformNode): void {
        const tubeGroup = new TransformNode("tubeGroup", this.scene);
        tubeGroup.position = new Vector3(x, y, z);
        tubeGroup.parent = parent;

        const glassMaterial = new PBRMaterial("tubeGlass", this.scene);
        glassMaterial.metallic = 0.0;
        glassMaterial.roughness = 0.2;
        glassMaterial.alpha = 0.3;
        glassMaterial.transparencyMode = PBRMaterial.MATERIAL_ALPHABLEND;
        glassMaterial.backFaceCulling = false;

        const tube = MeshBuilder.CreateCylinder("testTube", {
            height: 0.6,
            diameter: 0.1,
            tessellation: 16
        }, this.scene);
        tube.material = glassMaterial;
        tube.parent = tubeGroup;

        this.createLabLiquid(tubeGroup, 0.2, 0.1, 0.4, 0.08, 16, -0.3);
    }

    createOverheadLight(): void {
        const fixtureGroup = new TransformNode("overheadFixture", this.scene);
        fixtureGroup.position = new Vector3(0, 4, 0);
        fixtureGroup.parent = this.environmentGroup;

        const housing = MeshBuilder.CreateBox("lightHousing", {
            width: 2,
            height: 0.2,
            depth: 0.6
        }, this.scene);

        const metalMaterial = new PBRMaterial("fixtureMetal", this.scene);
        metalMaterial.metallic = 0.8;
        metalMaterial.roughness = 0.3;
        metalMaterial.albedoColor = new Color3(0.7, 0.7, 0.7);
        housing.material = metalMaterial;
        housing.parent = fixtureGroup;

        const createTube = (offset: number) => {
            const tube = MeshBuilder.CreateCylinder("lightTube", {
                height: 1.8,
                diameter: 0.15,
                tessellation: 16
            }, this.scene);
            tube.position.x = offset;
            tube.rotation.z = Math.PI / 2;

            const tubeMaterial = new StandardMaterial("tubeMaterial", this.scene);
            tubeMaterial.emissiveColor = new Color3(0.9, 0.9, 1);
            tubeMaterial.diffuseColor = new Color3(0.8, 0.8, 0.9);
            tubeMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
            tube.material = tubeMaterial;
            tube.parent = fixtureGroup;
            return { mesh: tube, material: tubeMaterial };
        };

        this.lightTubes = [
            createTube(-0.4),
            createTube(0.4)
        ];

        this.overheadLight = new PointLight(
            "overheadLight",
            new Vector3(0, -0.5, 0),
            this.scene
        );
        this.overheadLight.intensity = 0.8;
        this.overheadLight.radius = 10;
        this.overheadLight.diffuse = new Color3(0.9, 0.95, 1.0);

        this.createSuspensionChains(fixtureGroup);
    }

    createSuspensionChains(fixtureGroup: TransformNode): void {
        const createChain = (x: number, z: number) => {
            const chain = MeshBuilder.CreateCylinder("chain", {
                height: 2,
                diameter: 0.05,
                tessellation: 8
            }, this.scene);
            chain.position = new Vector3(x, 1, z);

            const chainMaterial = new PBRMaterial("chainMetal", this.scene);
            chainMaterial.metallic = 0.9;
            chainMaterial.roughness = 0.4;
            chainMaterial.albedoColor = new Color3(0.6, 0.6, 0.6);
            chain.material = chainMaterial;
            chain.parent = fixtureGroup;
        };

        createChain(-0.8, 0.2);
        createChain(0.8, 0.2);
        createChain(-0.8, -0.2);
        createChain(0.8, -0.2);
    }

    toggleOverheadLight(): void {
        this.isOverheadLightOn = !this.isOverheadLightOn;

        this.overheadLight.intensity = this.isOverheadLightOn ? 0.8 : 0;

        this.lightTubes.forEach(tube => {
            if (this.isOverheadLightOn) {
                tube.material.emissiveColor = new Color3(0.9, 0.9, 1);
                tube.material.diffuseColor = new Color3(0.8, 0.8, 0.9);
            } else {
                tube.material.emissiveColor = new Color3(0.2, 0.2, 0.2);
                tube.material.diffuseColor = new Color3(0.3, 0.3, 0.3);
            }
        });
    }
}
