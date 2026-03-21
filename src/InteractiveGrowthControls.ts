import { Scene, Vector3, Mesh, MeshBuilder, PBRMaterial, StandardMaterial, ParticleSystem, Texture, Animation, Color3, Color4, PointerInfo } from '@babylonjs/core';
import type { VesselGrowthSystem, GrowthNode, Attractor } from './VesselGrowthSystem.js';

interface VEGFSource {
    mesh: Mesh;
    position: Vector3;
    strength: number;
    radius: number;
    created: number;
}

export class InteractiveGrowthControls {
    scene: Scene;
    vesselGrowth: VesselGrowthSystem;
    canvas: HTMLCanvasElement;
    vegfSources: VEGFSource[];
    visualizers: Mesh[];
    isVisualizingAttractors: boolean;
    isVisualizingNodes: boolean;

    constructor(scene: Scene, vesselGrowthSystem: VesselGrowthSystem, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.vesselGrowth = vesselGrowthSystem;
        this.canvas = canvas;

        this.vegfSources = [];
        this.visualizers = [];
        this.isVisualizingAttractors = false;
        this.isVisualizingNodes = false;

        this.setupInputHandling();
        this.createUI();
    }

    setupInputHandling(): void {
        this.scene.onPointerDown = (_evt, pickInfo) => {
            if (pickInfo.hit && pickInfo.pickedMesh && pickInfo.pickedPoint) {
                const pickedPoint = pickInfo.pickedPoint;
                const heartPos = new Vector3(0, -1.9, 0);
                const distToHeart = Vector3.Distance(pickedPoint, heartPos);

                if (distToHeart < 2.0) {
                    this.spawnGrowthAt(pickedPoint).catch(console.error);
                }
            }
        };

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            switch(e.key) {
                case 'v':
                case 'V':
                    this.toggleAttractorVisualization();
                    break;
                case 'n':
                case 'N':
                    this.toggleNodeVisualization();
                    break;
                case 'c':
                case 'C':
                    this.clearVEGFSources();
                    break;
                case 'r':
                case 'R':
                    this.resetGrowth();
                    break;
            }
        });
    }

    async spawnGrowthAt(position: Vector3, direction: Vector3 | null = null): Promise<void> {
        if (!direction) {
            const heartPos = new Vector3(0, -1.9, 0);
            direction = position.subtract(heartPos).normalize();
            direction.y += 0.3;
            direction.normalize();
        }

        const { GrowthNode } = await import('./VesselGrowthSystem.js');
        const newNode = new GrowthNode(
            position,
            null,
            0.15,
            direction,
            0
        );

        this.vesselGrowth.growthNodes.push(newNode);
        this.showSpawnEffect(position);

        console.log('Spawned new growth at:', position);
    }

    addVEGFSource(position: Vector3, strength: number = 1.0, radius: number = 3.0): VEGFSource {
        const sphere = MeshBuilder.CreateSphere("vegf_source", {
            diameter: 0.2,
            segments: 16
        }, this.scene);

        sphere.position = position.clone();

        const material = new PBRMaterial("vegfMat", this.scene);
        material.albedoColor = new Color3(0.2, 1.0, 0.2);
        material.emissiveColor = new Color3(0.1, 0.5, 0.1);
        material.alpha = 0.6;
        sphere.material = material;

        const animation = new Animation(
            "vegfPulse",
            "scaling",
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keys = [
            { frame: 0, value: new Vector3(1, 1, 1) },
            { frame: 30, value: new Vector3(1.5, 1.5, 1.5) },
            { frame: 60, value: new Vector3(1, 1, 1) }
        ];

        animation.setKeys(keys);
        sphere.animations.push(animation);
        this.scene.beginAnimation(sphere, 0, 60, true);

        const vegfSource: VEGFSource = {
            mesh: sphere,
            position: position.clone(),
            strength: strength,
            radius: radius,
            created: Date.now()
        };

        this.vegfSources.push(vegfSource);
        this.addAttractorsAroundPoint(position, radius, Math.floor(strength * 5)).catch(console.error);

        return vegfSource;
    }

    async addAttractorsAroundPoint(center: Vector3, radius: number, count: number): Promise<void> {
        const { Attractor } = await import('./VesselGrowthSystem.js');

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.cbrt(Math.random()) * radius;

            const point = new Vector3(
                center.x + r * Math.sin(phi) * Math.cos(theta),
                center.y + r * Math.cos(phi),
                center.z + r * Math.sin(phi) * Math.sin(theta)
            );

            if (this.vesselGrowth.isValidAttractor(point)) {
                this.vesselGrowth.attractors.push(new Attractor(point));
            }
        }

        console.log(`Added ${count} attractors around VEGF source`);
    }

    clearVEGFSources(): void {
        this.vegfSources.forEach(source => {
            source.mesh.dispose();
        });
        this.vegfSources = [];
        console.log('Cleared all VEGF sources');
    }

    resetGrowth(): void {
        this.vesselGrowth.reset();
        this.clearVEGFSources();
        console.log('Growth system reset');
    }

    showSpawnEffect(position: Vector3): void {
        const particleSystem = new ParticleSystem("spawnEffect", 50, this.scene);

        particleSystem.particleTexture = new Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);

        particleSystem.emitter = position;
        particleSystem.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
        particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0.1);

        particleSystem.color1 = new Color4(1, 0.2, 0.2, 1);
        particleSystem.color2 = new Color4(1, 0.5, 0.2, 1);
        particleSystem.colorDead = new Color4(0, 0, 0, 0);

        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.15;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.8;
        particleSystem.emitRate = 100;
        particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.gravity = new Vector3(0, 0.5, 0);
        particleSystem.direction1 = new Vector3(-1, 1, -1);
        particleSystem.direction2 = new Vector3(1, 1, 1);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;

        particleSystem.start();

        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => particleSystem.dispose(), 1000);
        }, 200);
    }

    toggleAttractorVisualization(): void {
        this.isVisualizingAttractors = !this.isVisualizingAttractors;

        if (this.isVisualizingAttractors) {
            const material = new StandardMaterial("attractorMat", this.scene);
            material.diffuseColor = new Color3(0, 1, 0);
            material.alpha = 0.3;

            this.vesselGrowth.attractors.forEach((attractor: Attractor & { consumed?: boolean }, index: number) => {
                if (!attractor.consumed) {
                    const sphere = MeshBuilder.CreateSphere(`attractor_${index}`, {
                        diameter: 0.08
                    }, this.scene);
                    sphere.position = attractor.position.clone();
                    sphere.material = material;
                    sphere.isPickable = false;
                    this.visualizers.push(sphere);
                }
            });

            console.log(`Visualizing ${this.visualizers.length} attractors`);
        } else {
            this.visualizers.forEach(v => v.dispose());
            this.visualizers = [];
        }
    }

    toggleNodeVisualization(): void {
        this.isVisualizingNodes = !this.isVisualizingNodes;

        if (this.isVisualizingNodes) {
            const material = new StandardMaterial("nodeMat", this.scene);
            material.diffuseColor = new Color3(1, 0, 0);
            material.emissiveColor = new Color3(0.5, 0, 0);

            const activeNodes = this.vesselGrowth.growthNodes.filter((n: GrowthNode & { active?: boolean }) => n.active);

            activeNodes.forEach((node: GrowthNode, index: number) => {
                const sphere = MeshBuilder.CreateSphere(`node_${index}`, {
                    diameter: 0.12
                }, this.scene);
                sphere.position = node.position.clone();
                sphere.material = material;
                sphere.isPickable = false;
                this.visualizers.push(sphere);
            });

            console.log(`Visualizing ${activeNodes.length} growth nodes`);
        } else {
            this.visualizers.forEach(v => v.dispose());
            this.visualizers = [];
        }
    }

    createUI(): void {
        const uiContainer = document.createElement('div');
        uiContainer.id = 'growthControls';
        uiContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 1000;
            min-width: 200px;
        `;

        uiContainer.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">Growth Controls</h3>
            <div style="margin-bottom: 8px;">
                <strong>Click on heart</strong> to spawn growth
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">V</kbd> Toggle attractor view
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">N</kbd> Toggle node view
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">C</kbd> Clear VEGF sources
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">R</kbd> Reset growth
            </div>
            <div style="margin-top: 10px; font-size: 11px; color: #aaa;">
                VEGF Sources: <span id="vegfCount">0</span>
            </div>
            <div style="margin-top: 5px; font-size: 11px; color: #aaa;">
                Vessels: <span id="vesselCount">0</span>
            </div>
        `;

        document.body.appendChild(uiContainer);

        setInterval(() => {
            const vegfCount = document.getElementById('vegfCount');
            const vesselCount = document.getElementById('vesselCount');
            if (vegfCount) vegfCount.textContent = String(this.vegfSources.length);
            if (vesselCount && this.vesselGrowth) {
                vesselCount.textContent = String(this.vesselGrowth.vessels.length);
            }
        }, 500);
    }

    dispose(): void {
        this.clearVEGFSources();
        this.visualizers.forEach(v => v.dispose());

        const ui = document.getElementById('growthControls');
        if (ui) ui.remove();

        this.scene.onPointerDown = undefined;
    }
}
