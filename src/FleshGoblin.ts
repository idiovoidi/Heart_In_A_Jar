import { Scene, TransformNode, Mesh, MeshBuilder, Vector3, Color3, StandardMaterial } from '@babylonjs/core';
import { EntityBase } from './core/EntityBase.js';
import { AnimationComponent } from './components/AnimationComponent.js';
import { MaterialComponent } from './components/MaterialComponent.js';
import { MovementComponent } from './components/MovementComponent.js';
import { ErrorDecorator } from './core/ErrorDecorator.js';

interface TentacleAnimParams {
    speedX: number;
    speedZ: number;
    offset: number;
}

interface EyeAnimParams {
    blinkSpeed: number;
    moveFrequency: number;
    baseSize: number;
    offset: number;
}

export class FleshGoblin extends EntityBase {
    materialComponent: MaterialComponent;
    animationComponent: AnimationComponent;
    movementComponent: MovementComponent;
    tentacles: (Mesh & { animParams?: TentacleAnimParams })[];
    eyes: (Mesh & { animParams?: EyeAnimParams })[];
    growths: Mesh[];
    bodyCore!: Mesh;

    constructor(scene: Scene) {
        super(scene, "fleshGoblin");

        this.materialComponent = new MaterialComponent(scene);
        this.animationComponent = new AnimationComponent();
        this.movementComponent = new MovementComponent({
            baseSpeed: 0.5,
            wanderRadius: 0.5,
            updateInterval: 2000
        });

        this.tentacles = [];
        this.eyes = [];
        this.growths = [];

        this.init();
    }

    init(): void {
        try {
            this.createMainBody();
            this.createGrowths();
            this.createTentacles();
            this.createEyes();
            this.setupInitialPosition();
        } catch (error) {
            console.error("Error initializing FleshGoblin:", error);
            ErrorDecorator.logError(error as Error, "FleshGoblin.init");
        }
    }

    createMainBody(): void {
        try {
            const goblinMaterial = this.materialComponent.createFleshMaterial(
                "goblinMaterial",
                {
                    albedoColor: new Color3(0.8, 0.2, 0.2),
                    roughness: 0.3,
                    metallic: 0.0,
                    subsurfaceIntensity: 0.8,
                    emissiveColor: new Color3(0.3, 0, 0)
                }
            );

            this.bodyCore = MeshBuilder.CreateIcoSphere("goblinCore", {
                radius: 0.3,
                subdivisions: 4,
                updatable: true
            }, this.scene);
            this.bodyCore.material = goblinMaterial;
            this.bodyCore.parent = this.entityNode;
        } catch (error) {
            console.error("Error creating main body:", error);
            ErrorDecorator.logError(error as Error, "FleshGoblin.createMainBody");
        }
    }

    createGrowths(): void {
        try {
            const numGrowths = 5;
            for (let i = 0; i < numGrowths; i++) {
                const growthMaterial = this.materialComponent.createFleshMaterial(
                    `growthMaterial${i}`,
                    {
                        albedoColor: new Color3(0.85, 0.2, 0.15),
                        roughness: 0.35,
                        subsurfaceIntensity: 0.7,
                        subsurfaceRadius: 0.3 + Math.random() * 0.2
                    }
                );

                const growth = MeshBuilder.CreateIcoSphere(`growth${i}`, {
                    radius: 0.1 + Math.random() * 0.15,
                    subdivisions: 3
                }, this.scene);

                const angle = (i / numGrowths) * Math.PI * 2;
                growth.position = new Vector3(
                    Math.cos(angle) * 0.2,
                    Math.sin(angle) * 0.2 - 0.05,
                    Math.sin(angle * 2) * 0.2
                );
                growth.material = growthMaterial;
                growth.parent = this.bodyCore;
                this.growths.push(growth);
            }
        } catch (error) {
            console.error("Error creating growths:", error);
            ErrorDecorator.logError(error as Error, "FleshGoblin.createGrowths");
        }
    }

    createTentacles(): void {
        try {
            const numTentacles = 4;
            for (let i = 0; i < numTentacles; i++) {
                const tentacleMaterial = this.materialComponent.createFleshMaterial(
                    `tentacleMaterial${i}`,
                    {
                        albedoColor: new Color3(0.75, 0.15, 0.15),
                        roughness: 0.25,
                        metallic: 0.0,
                        subsurfaceIntensity: 0.9,
                        subsurfaceRadius: 0.5
                    }
                );

                const points = this.generateTentaclePath(10, 0.7 + Math.random() * 0.2);

                const tentacle = MeshBuilder.CreateTube(`tentacle${i}`, {
                    path: points,
                    radius: 0.07,
                    tessellation: 8,
                    cap: Mesh.CAP_ALL
                }, this.scene);

                tentacle.material = tentacleMaterial;
                tentacle.parent = this.bodyCore;

                const angle = (i / numTentacles) * Math.PI * 2;
                tentacle.position = new Vector3(
                    Math.cos(angle) * 0.2,
                    0.05,
                    Math.sin(angle) * 0.2
                );
                tentacle.rotation.x = Math.random() * Math.PI * 0.25;
                tentacle.rotation.z = angle;

                (tentacle as typeof tentacle & { animParams: TentacleAnimParams }).animParams = {
                    speedX: 1.5 + Math.random() * 0.5,
                    speedZ: 0.8 + Math.random() * 0.3,
                    offset: i * Math.PI * 0.5
                };

                this.tentacles.push(tentacle as typeof tentacle & { animParams: TentacleAnimParams });
            }
        } catch (error) {
            console.error("Error creating tentacles:", error);
            ErrorDecorator.logError(error as Error, "FleshGoblin.createTentacles");
        }
    }

    generateTentaclePath(segments: number, length: number): Vector3[] {
        const points: Vector3[] = [];

        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            points.push(new Vector3(
                Math.sin(t * Math.PI * 2) * 0.02,
                -t * length,
                Math.cos(t * Math.PI * 2) * 0.02
            ));
        }

        return points;
    }

    createEyes(): void {
        try {
            const eyeMaterial = new StandardMaterial("eyeMaterial", this.scene);
            eyeMaterial.emissiveColor = new Color3(0.9, 0.2, 0.0);
            eyeMaterial.specularPower = 256;
            eyeMaterial.specularColor = new Color3(1, 0.8, 0.8);

            const numEyes = 6;
            for (let i = 0; i < numEyes; i++) {
                const eyeSize = 0.04 + Math.random() * 0.03;
                const eye = MeshBuilder.CreateSphere(`eye${i}`, {
                    diameter: eyeSize,
                    segments: 16
                }, this.scene);

                const angle = (i / numEyes) * Math.PI * 1.5 - Math.PI * 0.25;
                const radius = 0.15 + Math.random() * 0.05;

                eye.position = new Vector3(
                    Math.cos(angle) * radius,
                    0.1 + Math.random() * 0.05,
                    Math.sin(angle) * radius
                );

                eye.material = eyeMaterial.clone(`eyeMaterial${i}`);
                eye.parent = this.bodyCore;

                (eye as typeof eye & { animParams: EyeAnimParams }).animParams = {
                    blinkSpeed: 1.5 + Math.random() * 1.0,
                    moveFrequency: 0.005 + Math.random() * 0.01,
                    baseSize: eyeSize,
                    offset: i * 0.5
                };

                this.eyes.push(eye as typeof eye & { animParams: EyeAnimParams });
            }
        } catch (error) {
            console.error("Error creating eyes:", error);
            ErrorDecorator.logError(error as Error, "FleshGoblin.createEyes");
        }
    }

    setupInitialPosition(): void {
        this.entityNode.position = new Vector3(0, -1.5, 0);
        this.movementComponent.setPosition(this.entityNode.position.clone());
        this.movementComponent.setTarget(this.entityNode.position.clone());
    }

    update(deltaTime: number): void {
        try {
            const time = performance.now() * 0.001;

            this.animateTentacles(time);
            this.animateEyes(time);
            this.animateGrowths(time);
            this.updateMovement(deltaTime, time);
        } catch (error) {
            console.error("Error updating FleshGoblin:", error);
            ErrorDecorator.logError(error as Error, "FleshGoblin.update");
        }
    }

    animateTentacles(time: number): void {
        this.tentacles.forEach(tentacle => {
            if (!tentacle.animParams) return;
            const params = tentacle.animParams;
            tentacle.rotation.x = Math.sin(time * params.speedX + params.offset) * 0.2;
            tentacle.rotation.z += Math.sin(time + params.offset) * 0.01;
        });
    }

    animateEyes(time: number): void {
        this.eyes.forEach(eye => {
            if (!eye.animParams || !eye.material) return;
            const params = eye.animParams;

            const blinkTime = (time + params.offset) * params.blinkSpeed;
            const blink = Math.sin(blinkTime) * 0.5 + 0.5;
            eye.scaling.y = 0.7 + blink * 0.3;

            if (Math.random() < params.moveFrequency) {
                eye.position.y += (Math.random() - 0.5) * 0.01;

                if (eye.position.y > 0.2) eye.position.y = 0.2;
                if (eye.position.y < 0.05) eye.position.y = 0.05;
            }

            if ('emissiveColor' in eye.material) {
                (eye.material as StandardMaterial).emissiveColor.r = 0.9 * (0.8 + blink * 0.2);
            }
        });
    }

    animateGrowths(time: number): void {
        this.growths.forEach((growth, index) => {
            const pulseSpeed = 0.3 + index * 0.1;
            const scale = 1.0 + Math.sin(time * pulseSpeed) * 0.05;

            growth.scaling.x = scale;
            growth.scaling.y = scale * 0.9;
            growth.scaling.z = scale * 1.1;
        });
    }

    updateMovement(deltaTime: number, time: number): void {
        this.movementComponent.update(deltaTime, time);

        const newPosition = this.movementComponent.getCurrentPosition();
        this.entityNode.position = newPosition;

        const direction = this.movementComponent.getDirection();
        if (direction.length() > 0.01) {
            const lookAt = Math.atan2(direction.z, direction.x);
            this.entityNode.rotation.y = lookAt + Math.PI / 2;
        }
    }

    getMesh(): TransformNode {
        return this.entityNode;
    }

    dispose(): void {
        try {
            this.materialComponent.dispose();

            this.eyes.forEach(eye => eye.dispose());
            this.tentacles.forEach(tentacle => tentacle.dispose());
            this.growths.forEach(growth => growth.dispose());

            if (this.bodyCore) {
                this.bodyCore.dispose();
            }

            super.dispose();
        } catch (error) {
            console.error("Error disposing FleshGoblin:", error);
            ErrorDecorator.logError(error as Error, "FleshGoblin.dispose");
        }
    }
}
