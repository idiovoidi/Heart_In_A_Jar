import { Scene, ArcRotateCamera, Vector3 } from '@babylonjs/core';

export class SceneCamera {
    scene: Scene;
    canvas: HTMLCanvasElement;
    camera: ArcRotateCamera;

    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        this.scene = scene;
        this.canvas = canvas;
        this.camera = this.setupCamera();
    }

    setupCamera(): ArcRotateCamera {
        // Create and configure camera
        const camera = new ArcRotateCamera(
            "mainCamera",
            0, Math.PI / 3, 12,
            Vector3.Zero(),
            this.scene
        );

        // Attach camera controls
        camera.attachControl(this.canvas, true);

        // Set initial position and target
        camera.setPosition(new Vector3(0, 0, 10));
        camera.setTarget(new Vector3(0, -1, 0));

        // Configure camera constraints
        camera.minZ = 0.1;
        camera.maxZ = 100;
        camera.wheelPrecision = 50;
        camera.pinchPrecision = 50;
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 20;

        return camera;
    }

    resetView(): void {
        this.camera.setPosition(new Vector3(0, 0, 10));
        this.camera.setTarget(new Vector3(0, -1, 0));
    }

    getCamera(): ArcRotateCamera {
        return this.camera;
    }

    dispose(): void {
        if (this.camera) {
            this.camera.dispose();
        }
    }
}
