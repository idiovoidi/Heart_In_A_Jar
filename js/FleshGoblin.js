export class FleshGoblin {
    constructor(scene) {
        this.scene = scene;
        this.goblinGroup = new BABYLON.TransformNode("goblinGroup", scene);
        this.tentacles = [];  // Initialize tentacles array
        this.eyes = [];      // Initialize eyes array
        this.createGoblin();
        this.setupBehavior();
    }

    createGoblin() {
        // Create custom shader material with improved flesh effects
        const goblinShader = new BABYLON.PBRMaterial("goblinMaterial", this.scene);
        goblinShader.albedoColor = new BABYLON.Color3(0.8, 0.2, 0.2);
        goblinShader.roughness = 0.3;
        goblinShader.metallic = 0.0;
        goblinShader.subSurface.isTranslucencyEnabled = true;
        goblinShader.subSurface.translucencyIntensity = 0.8;
        goblinShader.emissiveColor = new BABYLON.Color3(0.3, 0, 0);

        // Create larger core body
        const bodyCore = BABYLON.MeshBuilder.CreateIcoSphere("goblinCore", {
            radius: 0.3,  // Increased from 0.15
            subdivisions: 4,
            updatable: true
        }, this.scene);
        bodyCore.material = goblinShader;

        // Add larger asymmetric growths
        const growths = [];
        const numGrowths = 5;
        for (let i = 0; i < numGrowths; i++) {
            const growth = BABYLON.MeshBuilder.CreateIcoSphere("growth", {
                radius: 0.1 + Math.random() * 0.15,  // Increased size
                subdivisions: 3
            }, this.scene);

            const angle = (i / numGrowths) * Math.PI * 2;
            growth.position = new BABYLON.Vector3(
                Math.cos(angle) * 0.2,  // Increased offset
                Math.sin(angle) * 0.2 - 0.05,
                Math.sin(angle * 2) * 0.2
            );
            growth.material = goblinShader.clone("growthMaterial" + i);
            growth.parent = bodyCore;
            growths.push(growth);
        }

        // Store reference to main body
        this.goblinMesh = bodyCore;
        this.goblinMesh.parent = this.goblinGroup;

        // Create tentacles (existing code)
        const numTentacles = 4;
        for (let i = 0; i < numTentacles; i++) {
            const points = [];
            const segments = 10;
            const length = 0.7 + Math.random() * 0.2;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                points.push(new BABYLON.Vector3(
                    Math.sin(t * Math.PI * 2) * 0.02,
                    -t * length,
                    Math.cos(t * Math.PI * 2) * 0.02
                ));
            }

            const tentacle = BABYLON.MeshBuilder.CreateTube("tentacle", {
                path: points,
                radius: 0.07,
                tessellation: 8,
                cap: BABYLON.Mesh.CAP_ALL
            }, this.scene);

            tentacle.material = goblinShader.clone("tentacleMaterial" + i);
            tentacle.parent = this.goblinMesh;

            const angle = (i / numTentacles) * Math.PI * 2;
            tentacle.position = new BABYLON.Vector3(
                Math.cos(angle) * 0.2,  // Increased offset
                0.05,
                Math.sin(angle) * 0.2
            );
            tentacle.rotation.x = Math.random() * Math.PI * 0.25;
            tentacle.rotation.z = angle;
            this.tentacles.push(tentacle);
        }

        // Add eyes (existing code with adjusted positions)
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.scene);
        eyeMaterial.emissiveColor = new BABYLON.Color3(0.9, 0.2, 0.0);
        eyeMaterial.specularPower = 256;

        const numEyes = 6;
        for (let i = 0; i < numEyes; i++) {
            const eye = BABYLON.MeshBuilder.CreateSphere("eye", {
                diameter: 0.04 + Math.random() * 0.03,  // Increased size
                segments: 16
            }, this.scene);
            
            const angle = (i / numEyes) * Math.PI * 1.5 - Math.PI * 0.25;
            const radius = 0.15 + Math.random() * 0.05;  // Adjusted radius
            
            eye.position = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                0.1 + Math.random() * 0.05,  // Raised position
                Math.sin(angle) * radius
            );
            
            eye.material = eyeMaterial;
            eye.parent = this.goblinMesh;
            this.eyes.push(eye);
        }
    }

    setupBehavior() {
        this.targetPosition = new BABYLON.Vector3(0, -1.5, 0);
        this.currentPosition = this.goblinGroup.position.clone();
        this.moveSpeed = 0.5;
        this.wanderRadius = 0.5;
        this.lastTargetUpdate = 0;
        this.targetUpdateInterval = 2000; // ms
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        
        // Update shader time
        if (this.goblinShader) {
            this.goblinShader.setFloat("time", time);
        }

        // Animate tentacles
        if (this.tentacles) {
            this.tentacles.forEach((tentacle, index) => {
                const offset = index * Math.PI * 0.5;
                tentacle.rotation.x = Math.sin(time * 2 + offset) * 0.2;
                tentacle.rotation.z += Math.sin(time + offset) * 0.01;
            });
        }

        // Animate eyes
        if (this.eyes) {
            this.eyes.forEach((eye, index) => {
                const offset = index * 0.5;
                const blinkTime = (time + offset) * 2;
                const blink = Math.sin(blinkTime) * 0.5 + 0.5;
                eye.scaling.y = 0.7 + blink * 0.3;
                
                // Random eye movements
                if (Math.random() < 0.01) {
                    eye.position.y += (Math.random() - 0.5) * 0.01;
                }
            });
        }

        // Update target position periodically
        if (time - this.lastTargetUpdate > this.targetUpdateInterval) {
            const angle = Math.random() * Math.PI * 2;
            this.targetPosition = new BABYLON.Vector3(
                Math.cos(angle) * this.wanderRadius,
                -1.5 + Math.random() * 0.2,
                Math.sin(angle) * this.wanderRadius
            );
            this.lastTargetUpdate = time;
        }

        // Move towards target
        const direction = this.targetPosition.subtract(this.currentPosition);
        const distance = direction.length();
        
        if (distance > 0.01) {
            direction.normalize();
            this.currentPosition.addInPlace(direction.scale(this.moveSpeed * deltaTime));
            this.goblinGroup.position = this.currentPosition;
            
            // Look in movement direction
            const lookAt = Math.atan2(direction.z, direction.x);
            this.goblinGroup.rotation.y = lookAt + Math.PI / 2;
        }
    }

    getMesh() {
        return this.goblinGroup;
    }

    dispose() {
        if (this.goblinMesh) {
            this.goblinMesh.dispose();
        }
        if (this.goblinShader) {
            this.goblinShader.dispose();
        }
        if (this.eyes) {
            this.eyes.forEach(eye => {
                eye.dispose();
            });
        }
        this.goblinGroup.dispose();
    }
} 