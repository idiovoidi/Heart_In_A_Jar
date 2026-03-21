import { Scene, TransformNode, Vector3, Color3, Scalar, Mesh, MeshBuilder, VertexBuffer, VertexData, StandardMaterial, PBRMaterial } from '@babylonjs/core';
import { EntityBase } from './core/EntityBase.js';
import { MaterialComponent } from './components/MaterialComponent.js';
import { ErrorDecorator, RenderError } from './core/ErrorDecorator.js';

export interface FleshClumpConfig {
    numClumps?: number;
    minSize?: number;
    maxSize?: number;
    baseScale?: number;
    maxScaleChange?: number;
    jarRadius?: number;
    concentricRings?: number;
    subdivisions?: number;
    distribution?: 'rings' | 'random';
    animationStyle?: 'pulse' | 'noise';
    minPosition?: Vector3;
    maxPosition?: Vector3;
}

interface AnimParams {
    pulseSpeed: number;
    pulseAmount: number;
    rotationSpeed: { x: number; y: number; z: number };
    noiseScale: { x: number; y: number; z: number };
}

export class FleshClumps extends EntityBase {
    materialComponent: MaterialComponent;
    config: Required<FleshClumpConfig>;
    clumps: (Mesh & { animParams?: AnimParams; baseScale?: number })[];

    constructor(scene: Scene, config: FleshClumpConfig = {}) {
        super(scene, "fleshClumpGroup");

        this.materialComponent = this.addComponent(new MaterialComponent(scene));

        // Merge and default configurations
        this.config = {
            numClumps: 25,
            minSize: 0.05,
            maxSize: 0.12,
            baseScale: 0.3,
            maxScaleChange: 0.1,
            jarRadius: 1.8,
            concentricRings: 3,
            subdivisions: 3,
            distribution: 'rings',
            animationStyle: 'pulse',
            minPosition: new Vector3(-5, 0, -5),
            maxPosition: new Vector3(5, 0.3, 5),
            ...config
        } as Required<FleshClumpConfig>;

        this.clumps = [];
        this.init();
    }

    init(): void {
        try {
            this.createFleshClumps();
        } catch (error) {
            console.error("Error initializing FleshClumps:", error);
            ErrorDecorator.logError(error as Error, "FleshClumps.init");
        }
    }

    createFleshClumps(): void {
        if (this.config.distribution === 'rings') {
            this.createClumpsInRings();
        } else {
            this.createClumpsRandomly();
        }
    }

    createClumpsInRings(): void {
        try {
            const { numClumps, jarRadius, concentricRings } = this.config;
            const clumpsPerRing = Math.floor(numClumps / concentricRings);

            for (let ring = 0; ring < concentricRings; ring++) {
                const ringRadius = (ring + 1) * (jarRadius * 0.7 / concentricRings);
                const numInThisRing = (ring === concentricRings - 1)
                    ? numClumps - (clumpsPerRing * (concentricRings - 1))
                    : clumpsPerRing;

                for (let i = 0; i < numInThisRing; i++) {
                    const angle = (i / numInThisRing) * Math.PI * 2;
                    const distance = ringRadius * (0.8 + Math.random() * 0.4);
                    const maxRingSize = this.config.maxSize * (1 - ring * 0.2);
                    const size = this.config.minSize + Math.random() * (maxRingSize - this.config.minSize);
                    const position = new Vector3(
                        Math.cos(angle) * distance,
                        -2.0 + Math.random() * 0.1,
                        Math.sin(angle) * distance
                    );

                    this.createFleshClump(size, position, ring, i);
                }
            }
        } catch (error) {
            console.error("Error creating flesh clumps in rings:", error);
            ErrorDecorator.logError(error as Error, "FleshClumps.createClumpsInRings");
        }
    }

    createClumpsRandomly(): void {
        try {
            const { numClumps, minSize, maxSize, minPosition, maxPosition } = this.config;
            for (let i = 0; i < numClumps; i++) {
                const size = Math.random() * (maxSize - minSize) + minSize;
                const position = new Vector3(
                    Scalar.Lerp(minPosition.x, maxPosition.x, Math.random()),
                    Scalar.Lerp(minPosition.y, maxPosition.y, Math.random()),
                    Scalar.Lerp(minPosition.z, maxPosition.z, Math.random())
                );
                this.createFleshClump(size, position, 0, i);
            }
        } catch (error) {
            console.error("Error creating flesh clumps randomly:", error);
            ErrorDecorator.logError(error as Error, "FleshClumps.createClumpsRandomly");
        }
    }

    createFleshClump(size: number, position: Vector3, ring: number, index: number): Mesh | null {
        try {
            const material = this.materialComponent.createFleshMaterial(`fleshMaterial${ring}${index}`, {
                albedoColor: new Color3(0.8, 0.2, 0.2),
                subsurfaceIntensity: 1.0,
                roughness: 0.4
            });

            if (!material) {
                throw new RenderError(`Failed to create material for flesh clump ${ring}${index}`);
            }

            const clump = MeshBuilder.CreateIcoSphere("fleshClump", {
                radius: size,
                subdivisions: this.config.subdivisions,
                updatable: true
            }, this.scene);

            this.deformMesh(clump);

            clump.position = position;
            clump.rotation = new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

            const scaleVar = 0.9 + Math.random() * 0.2;
            clump.scaling = new Vector3(scaleVar, scaleVar * 0.7, scaleVar);
            (clump as typeof clump & { baseScale: number }).baseScale = this.config.baseScale;

            (clump as typeof clump & { animParams: AnimParams }).animParams = {
                pulseSpeed: 0.5 + Math.random() * 0.2,
                pulseAmount: 0.01 + Math.random() * 0.01,
                rotationSpeed: {
                    x: 0.01 * (Math.random() - 0.5),
                    y: 0.01 * (Math.random() - 0.5),
                    z: 0.01 * (Math.random() - 0.5)
                },
                noiseScale: { x: 0.5 + Math.random() * 0.3, y: 0.3 + Math.random() * 0.3, z: 0.1 + Math.random() * 0.3 }
            };

            clump.material = material;
            clump.parent = this.entityNode;
            this.clumps.push(clump as typeof clump & { animParams: AnimParams; baseScale: number });

            return clump;
        } catch (error) {
            console.error(`Error creating flesh clump ${ring}${index}:`, error);
            ErrorDecorator.logError(error as Error, "FleshClumps.createFleshClump");
            return null;
        }
    }

    deformMesh(mesh: Mesh): void {
        try {
            const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
            const normals = mesh.getVerticesData(VertexBuffer.NormalKind);

            if (!positions || !normals) {
                throw new RenderError("Mesh vertex data not available");
            }

            for (let i = 0; i < positions.length; i += 3) {
                const noise = this.noise3D(positions[i] * 4, positions[i + 1] * 4, positions[i + 2] * 4) * 0.3;
                positions[i] *= (1 + noise);
                positions[i + 1] *= (1 + noise);
                positions[i + 2] *= (1 + noise);
            }

            mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
            const indices = mesh.getIndices();
            if (indices) {
                const vertexData = new VertexData();
                vertexData.positions = positions;
                vertexData.indices = indices;
                vertexData.normals = normals;
                VertexData.ComputeNormals(positions, indices, normals);
                mesh.updateVerticesData(VertexBuffer.NormalKind, normals);
            }
        } catch (error) {
            console.error("Error deforming mesh:", error);
            ErrorDecorator.logError(error as Error, "FleshClumps.deformMesh");
        }
    }

    noise3D(x: number, y: number, z: number): number {
        return (Math.sin(x) * Math.cos(y) + Math.cos(z) * Math.sin(y) + Math.sin(z) * Math.cos(x)) * 0.5;
    }

    update(deltaTime: number): void {
        if (this.config.animationStyle === 'pulse') {
            this.updatePulseAnimation(deltaTime);
        } else {
            this.updateNoiseAnimation(deltaTime);
        }
    }

    updatePulseAnimation(deltaTime: number): void {
        try {
            const time = performance.now() * 0.001;
            this.clumps.forEach((clump, index) => {
                if (!clump.animParams) return;
                const params = clump.animParams;
                const baseScale = clump.baseScale || this.config.baseScale;
                const scaleChange = Math.sin(time * params.pulseSpeed + index) * params.pulseAmount;
                const limitedScale = baseScale * (1 + Math.max(-this.config.maxScaleChange, Math.min(this.config.maxScaleChange, scaleChange)));

                clump.scaling.set(limitedScale, limitedScale * 0.7, limitedScale);
                clump.rotation.x += deltaTime * params.rotationSpeed.x;
                clump.rotation.y += deltaTime * params.rotationSpeed.y;
                clump.rotation.z += deltaTime * params.rotationSpeed.z;
            });
        } catch (error) {
            console.error("Error updating pulse animation:", error);
            ErrorDecorator.logError(error as Error, "FleshClumps.updatePulseAnimation");
        }
    }

    updateNoiseAnimation(deltaTime: number): void {
        try {
            const time = performance.now() * 0.0001;
            this.clumps.forEach(clump => {
                if (!clump.animParams) return;
                const params = clump.animParams;
                const noiseX = 1 + this.noise3D(clump.position.x * 0.5, clump.position.y * 0.5, time * 0.5) * 0.2;
                const noiseY = 1 + this.noise3D(clump.position.x * 0.3, clump.position.y * 0.3, time * 0.7) * 0.2;
                const noiseZ = 1 + this.noise3D(clump.position.x * 0.1, clump.position.y * 0.1, time * 0.9) * 0.2;

                clump.scaling.set(noiseX, noiseY, noiseZ);
                clump.rotation.x += deltaTime * (params.rotationSpeed.x + (noiseX - 1) * 0.05);
                clump.rotation.y += deltaTime * (params.rotationSpeed.y + (noiseY - 1) * 0.05);
                clump.rotation.z += deltaTime * (params.rotationSpeed.z + (noiseZ - 1) * 0.05);
            });
        } catch (error) {
            console.error("Error updating noise animation:", error);
            ErrorDecorator.logError(error as Error, "FleshClumps.updateNoiseAnimation");
        }
    }

    getMesh(): TransformNode {
        return this.entityNode;
    }

    dispose(): void {
        try {
            this.clumps.forEach(clump => {
                if (clump.material) clump.material.dispose();
                clump.dispose();
            });
            this.clumps = [];
            super.dispose();
        } catch (error) {
            console.error("Error disposing flesh clumps:", error);
            ErrorDecorator.logError(error as Error, "FleshClumps.dispose");
        }
    }
}
