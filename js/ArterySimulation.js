export class ArterySimulation {
    constructor(scene) {
        console.log('Initializing ArterySimulation');
        this.scene = scene;
        this.arteryGroup = new BABYLON.TransformNode("arteryGroup", scene);
        this.arteries = [];
        this.growthQueue = [];
        this.isGrowing = true;
        this.growthSpeed = 1;
        this.maxBranches = 50;
        this.branchCount = 2;
        this.pulseSpeed = 4;
        this.pulseIntensity = 0.05;
        this.jarRadius = 4.8;
        this.jarHeight = 7;

        // Start growing immediately
        this.createArterySystem();
    }

    createArterySystem() {
        console.log('Creating artery system...');
        // Start positions relative to heart position
        const heartPosition = new BABYLON.Vector3(0, -1.9, 0);
        
        // Create initial growth points from heart surface
        this.createInitialGrowthPoints(heartPosition);
        
        console.log(`Initial growth queue size: ${this.growthQueue.length}`);
        this.processGrowthQueue();
    }

    createInitialGrowthPoints(heartPosition) {
        // Create multiple starting points around the heart
        const numStartPoints = 6;
        for (let i = 0; i < numStartPoints; i++) {
            const angle = (i / numStartPoints) * Math.PI * 2;
            const startPoint = new BABYLON.Vector3(
                heartPosition.x + Math.cos(angle) * 0.3,
                heartPosition.y + 0.2,
                heartPosition.z + Math.sin(angle) * 0.3
            );

            // Calculate direction towards jar wall and up
            const directionToWall = new BABYLON.Vector3(
                Math.cos(angle),
                0.5, // Upward tendency
                Math.sin(angle)
            ).normalize();

            this.growthQueue.push({
                point: startPoint,
                direction: directionToWall,
                radius: 0.15,
                parent: null
            });
        }
    }

    addArtery(startPoint, direction, radius, parent = null) {
        console.log('Adding artery:', { startPoint, radius });
        const length = 0.3 + Math.random() * 0.2;
        let endPoint = startPoint.add(direction.scale(length));

        // Create artery mesh
        const points = [startPoint, endPoint];
        const artery = BABYLON.MeshBuilder.CreateTube("artery", {
            path: points,
            radius: radius,
            tessellation: 12,
            cap: BABYLON.Mesh.CAP_ALL,
            updatable: true
        }, this.scene);

        // Create bright, visible material
        const material = new BABYLON.StandardMaterial("arteryMaterial", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
        material.emissiveColor = new BABYLON.Color3(0.4, 0, 0);
        material.specularColor = new BABYLON.Color3(1, 1, 1);
        material.specularPower = 32;
        material.alpha = 1.0;
        
        artery.material = material;
        artery.parent = this.arteryGroup;

        const arteryData = {
            mesh: artery,
            startPoint: startPoint,
            endPoint: endPoint,
            direction: direction,
            radius: radius,
            children: [],
            parent: parent
        };

        this.arteries.push(arteryData);
        this.branchCount++;

        if (parent) {
            parent.children.push(arteryData);
        }

        // Add new growth points
        if (this.branchCount < this.maxBranches) {
            this.addGrowthPoints(arteryData);
        }

        return arteryData;
    }

    addGrowthPoints(artery) {
        const numPoints = 1 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < numPoints; i++) {
            const t = 0.3 + Math.random() * 0.4;
            const point = BABYLON.Vector3.Lerp(artery.startPoint, artery.endPoint, t);
            
            // Calculate direction with upward tendency and wall awareness
            let direction = artery.direction.clone();
            
            // Add upward bias
            direction.y += 0.3;
            
            // Add tendency to grow towards jar wall if not already near it
            const distanceFromCenter = new BABYLON.Vector3(point.x, 0, point.z).length();
            if (distanceFromCenter < this.jarRadius * 0.6) {
                const towardWall = new BABYLON.Vector3(point.x, 0, point.z).normalize();
                direction.addInPlace(towardWall.scale(0.3));
            }
            
            direction.normalize();
            
            // Add random variation
            const randomAngle = (Math.random() - 0.5) * Math.PI * 0.4;
            direction = this.rotateVector(direction, randomAngle);
            
            this.growthQueue.push({
                point: point,
                direction: direction,
                radius: artery.radius * 0.9,
                parent: artery
            });
        }
    }

    rotateVector(vector, angle) {
        // Create rotation matrix around random axis perpendicular to growth direction
        const randomPerpendicular = BABYLON.Vector3.Cross(
            vector, 
            new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        ).normalize();
        
        const rotationMatrix = BABYLON.Matrix.RotationAxis(randomPerpendicular, angle);
        return BABYLON.Vector3.TransformNormal(vector.clone(), rotationMatrix).normalize();
    }

    processGrowthQueue() {
        console.log(`Processing growth queue. Size: ${this.growthQueue.length}, Growing: ${this.isGrowing}, Branches: ${this.branchCount}`);
        
        if (!this.isGrowing || this.growthQueue.length === 0 || this.branchCount >= this.maxBranches) {
            return;
        }

        const growth = this.growthQueue.shift();
        const artery = this.addArtery(growth.point, growth.direction, growth.radius, growth.parent);
        console.log(`Added artery. Total count: ${this.arteries.length}`);

        // Shorter delay for faster growth
        setTimeout(() => {
            this.processGrowthQueue();
        }, 100); // 100ms delay between growths
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        
        // Create realistic heartbeat pulse pattern
        const pulse = Math.pow(Math.sin(time * this.pulseSpeed), 2) * this.pulseIntensity;
        
        this.arteries.forEach((artery, index) => {
            // Add delay based on distance from heart for wave-like effect
            const distanceDelay = index * 0.1;
            const delayedPulse = Math.pow(Math.sin((time - distanceDelay) * this.pulseSpeed), 2) * this.pulseIntensity;
            
            // Scale more on x/z axes for realistic vessel expansion
            const scale = 1 + delayedPulse;
            artery.mesh.scaling = new BABYLON.Vector3(scale, 1, scale);
        });
    }

    getMesh() {
        return this.arteryGroup;
    }

    dispose() {
        this.arteries.forEach(artery => {
            artery.mesh.dispose();
        });
        this.arteryGroup.dispose();
    }

    reset() {
        // Clear existing arteries
        this.arteries.forEach(artery => {
            if (artery.mesh) {
                artery.mesh.dispose();
            }
        });
        this.arteries = [];
        this.growthQueue = [];
        this.branchCount = 0;
        
        // Restart growth
        this.isGrowing = true;
        this.createArterySystem();
    }
} 