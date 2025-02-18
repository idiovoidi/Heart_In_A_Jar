import { LabJar } from './LabJar.js';
import { HeartSimulation } from './HeartSimulation.js';
import { ButtonHandler } from './inputs/ButtonHandler.js';
import { ArterySimulation } from './ArterySimulation.js';
import { FleshClumps } from './FleshClumps.js';
import { FluidSimulation } from './FluidSimulation.js';
import { LabEnvironment } from './LabEnvironment.js';
import { FleshGoblin } from './FleshGoblin.js';
import { SceneCamera } from './camera/SceneCamera.js';

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
        
        this.scene = this.createScene();
        this.camera = new SceneCamera(this.scene, canvas);
        this.setupEnvironment();
        
        // Add ButtonHandler initialization
        this.buttonHandler = new ButtonHandler(this);
        
        // Start the render loop with optimized settings
        engine.runRenderLoop(() => {
            const deltaTime = engine.getDeltaTime();
            
            if (this.heartSim) {
                this.heartSim.update(deltaTime / 1000);
            }
            if (this.arterySim) {
                this.arterySim.update(deltaTime / 1000);
            }
            if (this.fleshClumps) {
                this.fleshClumps.update(deltaTime / 1000);
            }
            if (this.fluidSim) {
                this.fluidSim.update(deltaTime);
            }
            if (this.labEnvironment) {
                this.labEnvironment.update(deltaTime);
            }
            if (this.fleshGoblin) {
                this.fleshGoblin.update(deltaTime);
            }
            
            // Only render if the scene is ready
            if (this.scene.activeCamera) {
                this.scene.render();
            }
        });

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
        
        // Setup lighting
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);

        const directionalLight = new BABYLON.DirectionalLight(
            "directionalLight",
            new BABYLON.Vector3(5, 5, 5),
            scene
        );
        directionalLight.intensity = 0.8;
        
        // Enable engine optimizations
        scene.autoClear = false;
        scene.autoClearDepthAndStencil = false;
        scene.skipPointerMovePicking = true;
        scene.useRightHandedSystem = true;
        scene.useCameraFrustumCulling = true;
        
        return scene;
    }

    setupEnvironment() {
        console.log('Setting up environment...');
        
        // Initialize components in correct order
        this.labJar = new LabJar(this.scene);
        this.heartSim = new HeartSimulation(this.scene);
        this.arterySim = new ArterySimulation(this.scene);
        this.fleshClumps = new FleshClumps(this.scene);
        this.fluidSim = new FluidSimulation(this.scene);
        this.labEnvironment = new LabEnvironment(this.scene);
        
        // Position and scale components
        this.positionComponents();
        
        // Setup post-processing
        this.setupPostProcessing();
        
        // Add flesh goblin
        this.fleshGoblin = new FleshGoblin(this.scene);
        const goblinMesh = this.fleshGoblin.getMesh();
        goblinMesh.position = new BABYLON.Vector3(0, -1.5, 0);
    }

    positionComponents() {
        // Position jar higher on the table
        this.labJar.getMesh().scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
        this.labJar.getMesh().position.y = -1.4;

        // Position heart
        const heartMesh = this.heartSim.getMesh();
        heartMesh.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
        heartMesh.position = new BABYLON.Vector3(0, -1.9, 0);
        heartMesh.rotation = new BABYLON.Vector3(Math.PI * 0.15, 0, 0);

        // Position artery system relative to heart
        const arteryMesh = this.arterySim.getMesh();
        arteryMesh.scaling = new BABYLON.Vector3(1, 1, 1);
        arteryMesh.position = heartMesh.position.clone();
        
        // Make sure arteries are visible by adding them to the scene properly
        this.arterySim.arteries.forEach(artery => {
            if (artery.mesh && !artery.mesh.parent) {
                this.scene.addMesh(artery.mesh);
            }
        });

        // Position flesh clumps
        const fleshMesh = this.fleshClumps.getMesh();
        fleshMesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
        fleshMesh.position = new BABYLON.Vector3(0, -2.35, 0);

        // Position fluid
        const fluidMesh = this.fluidSim.getMesh();
        fluidMesh.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
        fluidMesh.position = new BABYLON.Vector3(0, -2.2, 0);
    }

    setupPostProcessing() {
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
    }

    dispose() {
        if (this.buttonHandler) {
            this.buttonHandler.dispose();
        }
        if (this.heartSim) {
            this.heartSim.dispose();
        }
        if (this.labJar) {
            this.labJar.dispose();
        }
        if (this.labEnvironment) {
            this.labEnvironment.dispose();
        }
        if (this.camera) {
            this.camera.dispose();
        }
        this.scene.dispose();
    }
}

// Initialize the scene
const sceneManager = new SceneManager(); 