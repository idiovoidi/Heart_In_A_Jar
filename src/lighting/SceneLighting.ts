import { Scene, HemisphericLight, DirectionalLight, Vector3, Color3, Light } from '@babylonjs/core';

export class SceneLighting {
    scene: Scene;
    lights: Light[];

    constructor(scene: Scene) {
        this.scene = scene;
        this.lights = [];
        this.setupLighting();
    }

    setupLighting(): void {
        // Create ambient light
        const ambientLight = new HemisphericLight(
            "ambientLight",
            new Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.groundColor = new Color3(0.1, 0.1, 0.1);
        this.lights.push(ambientLight);

        // Create directional light
        const directionalLight = new DirectionalLight(
            "directionalLight",
            new Vector3(5, 5, 5),
            this.scene
        );
        directionalLight.intensity = 0.8;
        this.lights.push(directionalLight);
    }

    updateLighting(_deltaTime: number): void {
        // Add any dynamic lighting updates here
        const time = performance.now() * 0.001;

        this.lights.forEach((light, index) => {
            // Subtle intensity variations
            if (light.intensity !== undefined) {
                const baseIntensity = index === 0 ? 0.6 : 0.8;
                light.intensity = baseIntensity + Math.sin(time * 0.5) * 0.05;
            }
        });
    }

    dispose(): void {
        this.lights.forEach(light => {
            light.dispose();
        });
        this.lights = [];
    }
}
