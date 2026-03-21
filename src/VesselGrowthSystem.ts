import { Scene, TransformNode, PBRMaterial, MeshBuilder, Vector3, Color3, Mesh, Matrix } from '@babylonjs/core';
import { EntityBase } from './core/EntityBase';

export interface VesselGrowthOptions {
    segmentLength?: number;
    branchAngle?: number;
    maxBranches?: number;
    attractionRadius?: number;
    killRadius?: number;
    minRadius?: number;
    maxRadius?: number;
    growthSpeed?: number;
    branchProbability?: number;
    axiom?: string;
    rules?: Record<string, string>;
    iterations?: number;
}

export interface VesselData {
    mesh: Mesh;
    startPoint: Vector3;
    endPoint: Vector3;
    radius: number;
    parent: GrowthNode | null;
    children: VesselData[];
    generation: number;
}

export class GrowthNode {
    position: Vector3;
    parent: VesselData | null;
    radius: number;
    direction: Vector3;
    generation: number;
    active: boolean;
    children: VesselData[];
    age: number;

    constructor(position: Vector3, parent: VesselData | null, radius: number, direction: Vector3, generation: number) {
        this.position = position.clone();
        this.parent = parent;
        this.radius = radius;
        this.direction = direction.clone();
        this.generation = generation;
        this.active = true;
        this.children = [];
        this.age = 0;
    }

    getDistanceFromHeart(): number {
        const heartPos = new Vector3(0, -1.9, 0);
        return Vector3.Distance(this.position, heartPos);
    }
}

export class Attractor {
    position: Vector3;
    consumed: boolean;
    influenceRadius: number;

    constructor(position: Vector3) {
        this.position = position.clone();
        this.consumed = false;
        this.influenceRadius = 2.0;
    }
}

export class VesselGrowthSystem extends EntityBase {
    growthNodes: GrowthNode[];
    attractors: Attractor[];
    vessels: VesselData[];
    obstacles: Vector3[];
    segmentLength: number;
    branchAngle: number;
    maxBranches: number;
    attractionRadius: number;
    killRadius: number;
    minRadius: number;
    maxRadius: number;
    growthSpeed: number;
    branchProbability: number;
    axiom: string;
    rules: Record<string, string>;
    iterations: number;
    isGrowing: boolean;
    growthQueue: GrowthNode[];
    completedVessels: VesselData[];
    time: number;
    vesselMaterial: PBRMaterial;
    rootNode: TransformNode;

    constructor(scene: Scene, options: VesselGrowthOptions = {}) {
        super(scene, "vesselGrowth");
        this.growthNodes = [];
        this.attractors = [];
        this.vessels = [];
        this.obstacles = [];

        // Growth parameters
        this.segmentLength = options.segmentLength || 0.3;
        this.branchAngle = options.branchAngle || Math.PI / 6;
        this.maxBranches = options.maxBranches || 200;
        this.attractionRadius = options.attractionRadius || 2.0;
        this.killRadius = options.killRadius || 0.2;
        this.minRadius = options.minRadius || 0.02;
        this.maxRadius = options.maxRadius || 0.25;
        this.growthSpeed = options.growthSpeed || 100;
        this.branchProbability = options.branchProbability || 0.3;

        // L-system parameters
        this.axiom = options.axiom || 'A';
        this.rules = options.rules || {
            'A': 'AB',
            'B': 'A[B]A'
        };
        this.iterations = options.iterations || 4;

        // Growth state
        this.isGrowing = false;
        this.growthQueue = [];
        this.completedVessels = [];
        this.time = 0;

        // Create base material
        this.vesselMaterial = this.createVesselMaterial();

        // Root group for all vessels
        this.rootNode = new TransformNode("vesselRoot", scene);
    }

    createVesselMaterial(): PBRMaterial {
        const material = new PBRMaterial("vesselMat", this.scene);
        material.albedoColor = new Color3(0.75, 0.1, 0.05);
        material.roughness = 0.35;
        material.metallic = 0.1;
        material.subSurface.isTranslucencyEnabled = true;
        material.subSurface.translucencyIntensity = 0.6;
        return material;
    }

    initializeFromSeed(seedPoint: Vector3, initialDirection: Vector3, radius: number = 0.2): GrowthNode {
        // Create initial growth node (tip cell)
        const rootNode = new GrowthNode(seedPoint, null, radius, initialDirection, 0);
        this.growthNodes.push(rootNode);

        // Generate attractor points in the growth volume
        this.generateAttractors();

        // Start growth process
        this.isGrowing = true;
        this.processGrowth();

        return rootNode;
    }

    generateAttractors(): void {
        this.attractors = [];

        // Create attractors in a volume around the heart
        const numAttractors = 150;
        const volumeRadius = 3.0;
        const heartPosition = new Vector3(0, -1.9, 0);

        for (let i = 0; i < numAttractors; i++) {
            let point: Vector3 | null = null;
            let valid = false;
            let attempts = 0;

            while (!valid && attempts < 50) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = Math.cbrt(Math.random()) * volumeRadius;

                point = new Vector3(
                    heartPosition.x + r * Math.sin(phi) * Math.cos(theta),
                    heartPosition.y + r * Math.cos(phi) * 0.8,
                    heartPosition.z + r * Math.sin(phi) * Math.sin(theta)
                );

                valid = this.isValidAttractor(point);
                attempts++;
            }

            if (valid && point) {
                this.attractors.push(new Attractor(point));
            }
        }

        console.log(`Generated ${this.attractors.length} attractor points`);
    }

    isValidAttractor(point: Vector3): boolean {
        const heartPosition = new Vector3(0, -1.9, 0);
        const distToHeart = Vector3.Distance(point, heartPosition);

        if (distToHeart < 1.0) return false;
        if (distToHeart > 4.5) return false;

        for (const attractor of this.attractors) {
            if (Vector3.Distance(point, attractor.position) < 0.3) {
                return false;
            }
        }

        return true;
    }

    processGrowth(): void {
        if (!this.isGrowing || this.vessels.length >= this.maxBranches) {
            this.isGrowing = false;
            return;
        }

        const activeNodes = this.growthNodes.filter(n => n.active);

        if (activeNodes.length === 0) {
            this.isGrowing = false;
            console.log('Growth complete. Total vessels:', this.vessels.length);
            return;
        }

        for (const node of activeNodes) {
            this.growNodeTowardAttractors(node);
        }

        this.attractors = this.attractors.filter(a => !a.consumed);

        setTimeout(() => this.processGrowth(), this.growthSpeed);
    }

    growNodeTowardAttractors(node: GrowthNode): void {
        const nearbyAttractors = this.attractors.filter(a => {
            const dist = Vector3.Distance(node.position, a.position);
            return dist < this.attractionRadius && !a.consumed;
        });

        if (nearbyAttractors.length === 0) {
            this.applyLSystemRules(node);
            return;
        }

        const direction = new Vector3(0, 0, 0);

        for (const attractor of nearbyAttractors) {
            const toAttractor = attractor.position.subtract(node.position).normalize();
            direction.addInPlace(toAttractor);

            if (Vector3.Distance(node.position, attractor.position) < this.killRadius) {
                attractor.consumed = true;
            }
        }

        direction.normalize();

        // Add some randomness for organic growth
        direction.x += (Math.random() - 0.5) * 0.2;
        direction.y += (Math.random() - 0.5) * 0.2;
        direction.z += (Math.random() - 0.5) * 0.2;
        direction.normalize();

        this.createVesselSegment(node, direction);
    }

    applyLSystemRules(node: GrowthNode): void {
        if (Math.random() < this.branchProbability && node.generation < this.iterations) {
            const angle = this.branchAngle + (Math.random() - 0.5) * 0.2;

            const leftDir = this.rotateVector(node.direction, angle, new Vector3(0, 1, 0));
            this.createVesselSegment(node, leftDir, true);

            const rightDir = this.rotateVector(node.direction, -angle, new Vector3(0, 1, 0));
            this.createVesselSegment(node, rightDir, true);

            node.active = false;
        }
    }

    createVesselSegment(parentNode: GrowthNode, direction: Vector3, isBranch: boolean = false): VesselData | null {
        const startPoint = parentNode.position.clone();
        let endPoint = startPoint.add(direction.scale(this.segmentLength));
        endPoint = this.avoidObstacles(startPoint, endPoint);
        direction = endPoint.subtract(startPoint).normalize();

        const radius = Math.max(this.minRadius, parentNode.radius * 0.85);
        const path = this.createCurvedPath(startPoint, endPoint, direction);

        const vessel = MeshBuilder.CreateTube("vessel_" + this.vessels.length, {
            path: path,
            radius: radius,
            tessellation: 12,
            cap: Mesh.CAP_ALL,
            updatable: true
        }, this.scene);

        vessel.material = this.vesselMaterial.clone("vesselMat_" + this.vessels.length);
        vessel.parent = this.rootNode;

        const vesselData: VesselData = {
            mesh: vessel,
            startPoint: startPoint,
            endPoint: endPoint,
            radius: radius,
            parent: parentNode,
            children: [],
            generation: parentNode.generation + 1
        };

        this.vessels.push(vesselData);
        parentNode.children.push(vesselData);

        const newNode = new GrowthNode(endPoint, vesselData, radius, direction, parentNode.generation + 1);
        this.growthNodes.push(newNode);

        return vesselData;
    }

    createCurvedPath(start: Vector3, end: Vector3, _direction: Vector3): Vector3[] {
        const path: Vector3[] = [start.clone()];
        const segments = 8;

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const point = Vector3.Lerp(start, end, t);

            if (i > 0 && i < segments - 1) {
                const variation = 0.03;
                point.x += (Math.random() - 0.5) * variation;
                point.y += (Math.random() - 0.5) * variation;
                point.z += (Math.random() - 0.5) * variation;
            }

            path.push(point);
        }

        path.push(end.clone());
        return path;
    }

    avoidObstacles(_start: Vector3, end: Vector3): Vector3 {
        const heartPosition = new Vector3(0, -1.9, 0);
        const result = end.clone();

        const distToHeart = Vector3.Distance(result, heartPosition);
        if (distToHeart < 1.1) {
            const away = result.subtract(heartPosition).normalize();
            result.addInPlace(away.scale(1.1 - distToHeart + 0.1));
        }

        const distFromCenter = Math.sqrt(result.x * result.x + result.z * result.z);
        const jarRadius = 4.8;
        if (distFromCenter > jarRadius * 0.9) {
            const center = new Vector3(0, result.y, 0);
            const towardCenter = center.subtract(result).normalize();
            result.addInPlace(towardCenter.scale(distFromCenter - jarRadius * 0.9 + 0.1));
        }

        const jarBottom = -5;
        const jarTop = 3;
        if (result.y < jarBottom + 0.5) {
            result.y = jarBottom + 0.5;
        }
        if (result.y > jarTop - 0.5) {
            result.y = jarTop - 0.5;
        }

        return result;
    }

    rotateVector(vector: Vector3, angle: number, axis: Vector3): Vector3 {
        const rotationMatrix = Matrix.RotationAxis(axis, angle);
        return Vector3.TransformNormal(vector.clone(), rotationMatrix).normalize();
    }

    update(deltaTime: number): void {
        this.time += deltaTime;

        const pulseSpeed = 4;

        this.vessels.forEach((vessel) => {
            const distFromHeart = Vector3.Distance(
                vessel.startPoint,
                new Vector3(0, -1.9, 0)
            );

            const waveArrival = distFromHeart * 0.5;
            const localTime = this.time - waveArrival;

            const pulsePhase = (localTime * pulseSpeed) % (Math.PI * 2);
            const pulse = Math.max(0, Math.sin(pulsePhase));
            const pulseIntensity = 0.08 * pulse;

            vessel.mesh.scaling = new Vector3(1 + pulseIntensity, 1, 1 + pulseIntensity);

            if (vessel.mesh.material && 'emissiveColor' in vessel.mesh.material) {
                (vessel.mesh.material as PBRMaterial).emissiveColor = new Color3(0.2 * pulse, 0, 0);
            }
        });
    }

    getMesh(): TransformNode {
        return this.rootNode;
    }

    reset(): void {
        this.vessels.forEach(v => {
            if (v.mesh) v.mesh.dispose();
        });

        this.vessels = [];
        this.growthNodes = [];
        this.attractors = [];
        this.isGrowing = false;

        this.initializeFromSeed(
            new Vector3(0, -1.9, 0),
            new Vector3(0, 1, 0),
            0.2
        );
    }

    dispose(): void {
        this.vessels.forEach(v => {
            if (v.mesh) v.mesh.dispose();
        });
        this.vesselMaterial.dispose();
        this.rootNode.dispose();
    }
}
