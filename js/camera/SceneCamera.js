export class SceneCamera {
    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;
        this.setupCamera();
    }

    setupCamera() {
        // Create and configure camera
        const camera = new BABYLON.ArcRotateCamera(
            "mainCamera", 
            0, Math.PI / 3, 12,
            BABYLON.Vector3.Zero(),
            this.scene
        );
        
        // Attach camera controls
        camera.attachControl(this.canvas, true);
        
        // Set initial position and target
        camera.setPosition(new BABYLON.Vector3(0, 0, 10));
        camera.setTarget(new BABYLON.Vector3(0, -1, 0));
        
        // Configure camera constraints
        camera.minZ = 0.1;
        camera.maxZ = 100;
        camera.wheelPrecision = 50;
        camera.pinchPrecision = 50;
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 20;
        
        // Store camera reference
        this.camera = camera;
    }

    resetView() {
        this.camera.setPosition(new BABYLON.Vector3(0, 0, 10));
        this.camera.setTarget(new BABYLON.Vector3(0, -1, 0));
    }

    getCamera() {
        return this.camera;
    }

    dispose() {
        if (this.camera) {
            this.camera.dispose();
        }
    }
} 