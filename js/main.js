import { LabJar } from './LabJar.js';
import { HeartSimulation } from './HeartSimulation.js';
import { ButtonHandler } from './inputs/ButtonHandler.js';

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

class SceneManager {
    constructor() {
        this.scene = this.createScene();
        this.setupEnvironment();
        
        // Add ButtonHandler initialization
        this.buttonHandler = new ButtonHandler(this);
        
        // Start the render loop
        engine.runRenderLoop(() => {
            // Add heart update
            if (this.heartSim) {
                this.heartSim.update(engine.getDeltaTime() / 1000);
            }
            this.scene.render();
        });

        // Handle window resize
        window.addEventListener("resize", () => {
            engine.resize();
        });
    }

    createScene() {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
        
        // Camera setup
        const camera = new BABYLON.ArcRotateCamera("camera", 
            0, Math.PI / 3, 10,
            BABYLON.Vector3.Zero(),
            scene
        );
        camera.attachControl(canvas, true);
        camera.setPosition(new BABYLON.Vector3(0, 0, 8));
        camera.setTarget(new BABYLON.Vector3(0, -1, 0));
        
        // Lighting setup
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            scene
        );
        ambientLight.intensity = 0.6;

        const directionalLight = new BABYLON.DirectionalLight(
            "directionalLight",
            new BABYLON.Vector3(5, 5, 5),
            scene
        );
        directionalLight.intensity = 0.8;

        return scene;
    }

    setupEnvironment() {
        // Initialize components
        this.labJar = new LabJar(this.scene);
        this.heartSim = new HeartSimulation(this.scene);
        
        // Position and scale components
        this.positionComponents();
        
        // Setup post-processing
        this.setupPostProcessing();
    }

    positionComponents() {
        // Position jar
        this.labJar.getMesh().scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
        this.labJar.getMesh().position.y = -1;

        // Position heart
        const heartMesh = this.heartSim.getMesh();
        heartMesh.scaling = new BABYLON.Vector3(0.25, 0.25, 0.25);
        heartMesh.position = new BABYLON.Vector3(0, -1.8, 0);
        heartMesh.rotation = new BABYLON.Vector3(Math.PI * 0.15, 0, 0);
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
        this.scene.dispose();
    }
}

// Initialize the scene
const sceneManager = new SceneManager(); 