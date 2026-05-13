import { Engine, Scene, Color4, Vector3 } from '@babylonjs/core';
import { LabJar } from './LabJar';
import { HeartSimulation } from './HeartSimulation';
import { ControlPanelManager } from './controls/ControlPanelManager';
import { VesselGrowthSystem } from './VesselGrowthSystem';
import { InteractiveGrowthControls } from './InteractiveGrowthControls';
import { FleshClumps } from './FleshClumps';
import { FluidSimulation } from './FluidSimulation';
import { LabEnvironment } from './LabEnvironment';
import { FleshGoblin } from './FleshGoblin';
import { SceneCamera } from './camera/SceneCamera';
import { SceneLighting } from './lighting/SceneLighting';
import { SceneDebug } from './debug/SceneDebug';
import { ErrorDecorator } from './core/ErrorDecorator';
import { PostProcessingManager } from './postprocessing/PostProcessingManager';
import type { EntityBase } from './core/EntityBase';

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

class SceneManager {
    entities: Map<string, EntityBase>;
    scene: Scene;
    camera: SceneCamera;
    lighting: SceneLighting;
    debug: SceneDebug;
    controlPanelManager: ControlPanelManager;
    interactiveControls: InteractiveGrowthControls | null;
    postProcessingManager: PostProcessingManager | null;

    constructor() {
        this.entities = new Map();
        this.scene = this.createScene();
        this.camera = new SceneCamera(this.scene, canvas);
        this.lighting = new SceneLighting(this.scene);
        this.debug = new SceneDebug(this.scene);
        this.postProcessingManager = null;

        this.setupEnvironment();

        // Add ControlPanelManager initialization
        this.controlPanelManager = new ControlPanelManager(this.scene, canvas, this);
        this.interactiveControls = null;

        // Start the render loop with optimized settings
        this.startRenderLoop();

        // Handle window resize
        window.addEventListener("resize", () => {
            engine.resize();
        });
    }

    createScene(): Scene {
        // Create scene with optimization options
        const scene = new Scene(engine, {
            useGeometryUniqueIdsMap: true,
            useMaterialMeshMap: true,
            useClonedMeshMap: true
        });

        scene.clearColor = new Color4(0, 0, 0, 1);

        // Optimize engine settings
        engine.setHardwareScalingLevel(1.0);
        engine.enableOfflineSupport = false;

        // Enable engine optimizations
        scene.autoClear = false;
        scene.autoClearDepthAndStencil = false;
        scene.skipPointerMovePicking = true;
        (scene as unknown as { useRightHandedSystem: boolean }).useRightHandedSystem = true;
        (scene as unknown as { useCameraFrustumCulling?: boolean }).useCameraFrustumCulling = true;

        return scene;
    }

    setupEnvironment(): void {
        try {
            console.log('Setting up environment...');

            // Initialize components with proper error handling
            try {
                // Create all entities and register them
                this.registerEntity('labJar', new LabJar(this.scene));
                this.registerEntity('heartSim', new HeartSimulation(this.scene));

                // Create the new space colonization vessel growth system
                const vesselGrowth = new VesselGrowthSystem(this.scene, {
                    segmentLength: 0.25,
                    branchAngle: Math.PI / 5,
                    maxBranches: 150,
                    attractionRadius: 2.5,
                    killRadius: 0.25,
                    growthSpeed: 80,
                    branchProbability: 0.35
                });
                this.registerEntity('vesselGrowth', vesselGrowth);

                // Initialize growth from heart surface
                const heartPos = new Vector3(0, -1.9, 0);
                vesselGrowth.initializeFromSeed(
                    new Vector3(heartPos.x, heartPos.y + 0.3, heartPos.z),
                    new Vector3(0, 1, 0),
                    0.22
                );

                // Setup interactive growth controls
                this.interactiveControls = new InteractiveGrowthControls(
                    this.scene,
                    vesselGrowth,
                    canvas
                );

                // Example of using the new configurable FleshClumps
                this.registerEntity('fleshClumps', new FleshClumps(this.scene, {
                    numClumps: 10,
                    distribution: 'random',
                    animationStyle: 'noise',
                    minSize: 0.2,
                    maxSize: 0.8,
                    minPosition: new Vector3(-1.5, -2, -1.5),
                    maxPosition: new Vector3(1.5, -1.5, 1.5)
                }));

                this.registerEntity('fluidSim', new FluidSimulation(this.scene));
                this.registerEntity('labEnvironment', new LabEnvironment(this.scene));
                this.registerEntity('fleshGoblin', new FleshGoblin(this.scene));

                // Position and scale components
                this.positionComponents();

                // Setup post-processing via modular manager
                this.setupPostProcessing();
            } catch (error) {
                console.error("Error setting up environment:", error);
                ErrorDecorator.logError(error as Error, "setupEnvironment");
            }
        } catch (error) {
            console.error("Fatal error in setupEnvironment:", error);
            ErrorDecorator.logError(error as Error, "setupEnvironment");
        }
    }

    registerEntity(name: string, entity: EntityBase): EntityBase {
        this.entities.set(name, entity);
        return entity;
    }

    getEntity(name: string): EntityBase | undefined {
        return this.entities.get(name);
    }

    positionComponents(): void {
        try {
            // Position jar higher on the table
            const labJar = this.getEntity('labJar');
            if (labJar) {
                const mesh = labJar.getMesh();
                mesh.scaling = new Vector3(1.2, 1.2, 1.2);
                mesh.position.y = -1.4;
            }

            // Position heart
            const heartSim = this.getEntity('heartSim') as HeartSimulation;
            if (heartSim) {
                const heartMesh = heartSim.getMesh();
                heartMesh.scaling = new Vector3(0.4, 0.4, 0.4);
                heartMesh.position = new Vector3(0, -1.9, 0);
                heartMesh.rotation = new Vector3(Math.PI * 0.15, 0, 0);
            }

            // Position vessel growth system relative to heart
            const vesselGrowth = this.getEntity('vesselGrowth') as VesselGrowthSystem;
            if (vesselGrowth && heartSim) {
                const vesselMesh = vesselGrowth.getMesh();
                vesselMesh.scaling = new Vector3(1, 1, 1);
                vesselMesh.position = heartSim.getMesh().position.clone();
            }

            // Position flesh clumps
            const fleshClumps = this.getEntity('fleshClumps') as FleshClumps;
            if (fleshClumps) {
                const fleshMesh = fleshClumps.getMesh();
                fleshMesh.scaling = new Vector3(0.3, 0.3, 0.3);
                fleshMesh.position = new Vector3(0, -2.35, 0);
            }

            // Position fluid
            const fluidSim = this.getEntity('fluidSim') as FluidSimulation;
            if (fluidSim) {
                const fluidMesh = fluidSim.getMesh();
                fluidMesh.scaling = new Vector3(0.4, 0.4, 0.4);
                fluidMesh.position = new Vector3(0, -2.2, 0);
            }
        } catch (error) {
            console.error("Error in positionComponents:", error);
            ErrorDecorator.logError(error as Error, "positionComponents");
        }
    }

    setupPostProcessing(): void {
        try {
            if (!this.postProcessingManager) {
                this.postProcessingManager = new PostProcessingManager(this.scene);
            }
            this.postProcessingManager.initialize(this.scene.activeCamera!);
        } catch (error) {
            console.error("Error in setupPostProcessing:", error);
            ErrorDecorator.logError(error as Error, "setupPostProcessing");
        }
    }

    startRenderLoop(): void {
        engine.runRenderLoop(() => {
            const deltaTime = engine.getDeltaTime();

            // Update all registered entities
            this.entities.forEach(entity => {
                if (entity && typeof entity.update === 'function') {
                    try {
                        entity.update(deltaTime / 1000);
                    } catch (error) {
                        console.error(`Error updating entity ${entity.name}:`, error);
                    }
                }
            });

            // Only render if the scene is ready
            if (this.scene.activeCamera) {
                this.scene.render();
            }
        });
    }

    dispose(): void {
        if (this.controlPanelManager) {
            this.controlPanelManager.dispose();
        }

        if (this.postProcessingManager) {
            this.postProcessingManager.dispose();
        }

        // Dispose all entities
        this.entities.forEach(entity => {
            if (entity && typeof entity.dispose === 'function') {
                entity.dispose();
            }
        });

        this.entities.clear();

        if (this.camera) {
            this.camera.dispose();
        }
        if (this.lighting) {
            this.lighting.dispose();
        }
        if (this.debug) {
            this.debug.dispose();
        }
        this.scene.dispose();
    }

    get heartSim(): HeartSimulation | undefined {
        return this.getEntity('heartSim') as HeartSimulation;
    }

    get vesselGrowth(): VesselGrowthSystem | undefined {
        return this.getEntity('vesselGrowth') as VesselGrowthSystem;
    }

    get fluidSim(): FluidSimulation | undefined {
        return this.getEntity('fluidSim') as FluidSimulation;
    }

    get labEnvironment(): LabEnvironment | undefined {
        return this.getEntity('labEnvironment') as LabEnvironment;
    }

    get postProcessing(): PostProcessingManager | null {
        return this.postProcessingManager;
    }
}

// Initialize the scene
const sceneManager = new SceneManager();
