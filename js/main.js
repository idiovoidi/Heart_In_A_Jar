import { LabJar } from './LabJar.js';
import { HeartSimulation } from './HeartSimulation.js';
import { ControlPanelManager } from './controls/ControlPanelManager.js';
import { VesselGrowthSystem } from './VesselGrowthSystem.js';
import { InteractiveGrowthControls } from './InteractiveGrowthControls.js';
import { FleshClumps } from './FleshClumps.js';
import { FluidSimulation } from './FluidSimulation.js';
import { LabEnvironment } from './LabEnvironment.js';
import { FleshGoblin } from './FleshGoblin.js';
import { SceneCamera } from './camera/SceneCamera.js';
import { SceneLighting } from './lighting/SceneLighting.js';
import { SceneDebug } from './debug/SceneDebug.js';
import { ErrorDecorator } from './core/ErrorDecorator.js';

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

class SceneManager {
    constructor() {
        // Initialize engine with optimized settings
        const engineOptions = {
            preserveDrawingBuffer: true,
            stencil: true,
            disableWebGL2Support: false,
            antialias: true
        };
        
        this.entities = new Map();
        this.scene = this.createScene();
        this.camera = new SceneCamera(this.scene, canvas);
        this.lighting = new SceneLighting(this.scene);
        this.debug = new SceneDebug(this.scene);
        
        this.setupEnvironment();
        
        // Add ControlPanelManager initialization
        this.controlPanelManager = new ControlPanelManager(this);
        
        // Start the render loop with optimized settings
        this.startRenderLoop();
        
        // Handle window resize
        window.addEventListener("resize", () => {
            engine.resize();
        });
    }

    createScene() {
        // Create scene with optimization options
        const scene = new BABYLON.Scene(engine, {
            useGeometryUniqueIdsMap: true,
            useMaterialMeshMap: true,
            useClonedMeshMap: true
        });
        
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        
        // Optimize engine settings
        engine.setHardwareScalingLevel(1.0);
        engine.enableOfflineSupport = false;
        
        // Enable engine optimizations
        scene.autoClear = false;
        scene.autoClearDepthAndStencil = false;
        scene.skipPointerMovePicking = true;
        scene.useRightHandedSystem = true;
        scene.useCameraFrustumCulling = true;
        
        return scene;
    }

    setupEnvironment() {
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
                const heartPos = new BABYLON.Vector3(0, -1.9, 0);
                vesselGrowth.initializeFromSeed(
                    new BABYLON.Vector3(heartPos.x, heartPos.y + 0.3, heartPos.z),
                    new BABYLON.Vector3(0, 1, 0),
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
                    distribution: 'random', // 'rings' or 'random'
                    animationStyle: 'noise', // 'pulse' or 'noise'
                    minSize: 0.2,
                    maxSize: 0.8,
                    minPosition: new BABYLON.Vector3(-1.5, -2, -1.5),
                    maxPosition: new BABYLON.Vector3(1.5, -1.5, 1.5)
                }));
                
                this.registerEntity('fluidSim', new FluidSimulation(this.scene));
                this.registerEntity('labEnvironment', new LabEnvironment(this.scene));
                this.registerEntity('fleshGoblin', new FleshGoblin(this.scene));
                
                // Position and scale components
                this.positionComponents();
                
                // Setup post-processing
                this.setupPostProcessing();
            } catch (error) {
                console.error("Error setting up environment:", error);
                // Implement fallback or recovery mechanism
                ErrorDecorator.logError(error, "setupEnvironment");
            }
        } catch (error) {
            console.error("Fatal error in setupEnvironment:", error);
            ErrorDecorator.logError(error, "setupEnvironment");
        }
    }
    
    registerEntity(name, entity) {
        this.entities.set(name, entity);
        return entity;
    }
    
    getEntity(name) {
        return this.entities.get(name);
    }

    positionComponents() {
        try {
            // Position jar higher on the table
            const labJar = this.getEntity('labJar');
            if (labJar) {
                labJar.getMesh().scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
                labJar.getMesh().position.y = -1.4;
            }

            // Position heart
            const heartSim = this.getEntity('heartSim');
            if (heartSim) {
                const heartMesh = heartSim.getMesh();
                heartMesh.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
                heartMesh.position = new BABYLON.Vector3(0, -1.9, 0);
                heartMesh.rotation = new BABYLON.Vector3(Math.PI * 0.15, 0, 0);
            }

            // Position vessel growth system relative to heart
            const vesselGrowth = this.getEntity('vesselGrowth');
            if (vesselGrowth && heartSim) {
                const vesselMesh = vesselGrowth.getMesh();
                vesselMesh.scaling = new BABYLON.Vector3(1, 1, 1);
                vesselMesh.position = heartSim.getMesh().position.clone();
            }

            // Position flesh clumps
            const fleshClumps = this.getEntity('fleshClumps');
            if (fleshClumps) {
                const fleshMesh = fleshClumps.getMesh();
                fleshMesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                fleshMesh.position = new BABYLON.Vector3(0, -2.35, 0);
            }

            // Position fluid
            const fluidSim = this.getEntity('fluidSim');
            if (fluidSim) {
                const fluidMesh = fluidSim.getMesh();
                fluidMesh.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
                fluidMesh.position = new BABYLON.Vector3(0, -2.2, 0);
            }
        } catch (error) {
            console.error("Error in positionComponents:", error);
            ErrorDecorator.logError(error, "positionComponents");
        }
    }

    setupPostProcessing() {
        try {
            const pipeline = new BABYLON.DefaultRenderingPipeline(
                "defaultPipeline", 
                true, 
                this.scene,
                [this.scene.activeCamera]
            );

            // Configure bloom effect
            pipeline.bloomEnabled = true;
            pipeline.bloomThreshold = 0.85;
            pipeline.bloomWeight = 0.5;
            pipeline.bloomKernel = 64;
            pipeline.bloomScale = 0.5;
            
            // Add chromatic aberration for a more cinematic look
            pipeline.chromaticAberrationEnabled = true;
            pipeline.chromaticAberration.aberrationAmount = 1.0;
            pipeline.chromaticAberration.radialIntensity = 0.5;
            
            // Add slight grain for texture
            pipeline.grainEnabled = true;
            pipeline.grain.intensity = 10;
            pipeline.grain.animated = true;
        } catch (error) {
            console.error("Error in setupPostProcessing:", error);
            ErrorDecorator.logError(error, "setupPostProcessing");
        }
    }
    
    startRenderLoop() {
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

    dispose() {
        if (this.controlPanelManager) {
            this.controlPanelManager.dispose();
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

    get heartSim() {
        return this.getEntity('heartSim');
    }

    get vesselGrowth() {
        return this.getEntity('vesselGrowth');
    }

    get fluidSim() {
        return this.getEntity('fluidSim');
    }

    get labEnvironment() {
        return this.getEntity('labEnvironment');
    }
}

// Initialize the scene
const sceneManager = new SceneManager(); 