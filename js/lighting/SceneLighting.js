export class SceneLighting {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.setupLighting();
    }

    setupLighting() {
        // Create ambient light
        const ambientLight = new BABYLON.HemisphericLight(
            "ambientLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );
        ambientLight.intensity = 0.6;
        ambientLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        this.lights.push(ambientLight);

        // Create directional light
        const directionalLight = new BABYLON.DirectionalLight(
            "directionalLight",
            new BABYLON.Vector3(5, 5, 5),
            this.scene
        );
        directionalLight.intensity = 0.8;
        this.lights.push(directionalLight);
    }

    updateLighting(deltaTime) {
        // Add any dynamic lighting updates here
        const time = performance.now() * 0.001;
        
        this.lights.forEach((light, index) => {
            // Subtle intensity variations
            if (light.intensity) {
                const baseIntensity = index === 0 ? 0.6 : 0.8;
                light.intensity = baseIntensity + Math.sin(time * 0.5) * 0.05;
            }
        });
    }

    dispose() {
        this.lights.forEach(light => {
            light.dispose();
        });
        this.lights = [];
    }
} 