export class ArterySimulation {
    constructor(scene) {
        if (!scene) {
            console.error('Scene is required for ArterySimulation');
            return;
        }
        
        console.log('Initializing ArterySimulation');
        this.scene = scene;
        this.arteryGroup = new BABYLON.TransformNode("arteryGroup", scene);
        this.arteries = [];
        this.growthQueue = [];
        this.isGrowing = true;
        this.growthSpeed = 50; // milliseconds delay
        this.maxBranches = 50;
        this.branchCount = 0;  // Start from 0
        this.defaultRadius = 0.12;
        this.pulseSpeed = 4;
        this.pulseIntensity = 0.05;
        this.jarRadius = 4.8;
        this.jarHeight = 7;

        // Create PBR material for better visual quality
        this.arteryMaterial = new BABYLON.PBRMaterial("arteryMaterial", scene);
        this.arteryMaterial.albedoColor = new BABYLON.Color3(0.8, 0.1, 0.1);
        this.arteryMaterial.roughness = 0.3;
        this.arteryMaterial.metallic = 0.0;
        this.arteryMaterial.subSurface.isTranslucencyEnabled = true;
        this.arteryMaterial.subSurface.translucencyIntensity = 0.8;
        this.arteryMaterial.emissiveColor = new BABYLON.Color3(0.3, 0, 0);

        // Start growing immediately
        this.createArterySystem();
    }

    createArterySystem() {
        console.log('Creating artery system...');
        const heartPosition = new BABYLON.Vector3(0, -1.9, 0);
        
        // Create initial growth points from heart surface
        this.createInitialGrowthPoints(heartPosition);
        
        console.log(`Initial growth queue size: ${this.growthQueue.length}`);
        this.processGrowthQueue();
    }

    createInitialGrowthPoints(heartPosition) {
        console.log('Creating initial growth points at:', heartPosition);
        
        // Create main arteries first (aorta and pulmonary artery)
        const mainArteryPoints = [
            {
                point: new BABYLON.Vector3(
                    heartPosition.x - 0.2,
                    heartPosition.y + 0.3,
                    heartPosition.z
                ),
                direction: new BABYLON.Vector3(0, 1, 0).normalize(),
                radius: 0.2,
                isMain: true
            },
            {
                point: new BABYLON.Vector3(
                    heartPosition.x + 0.2,
                    heartPosition.y + 0.3,
                    heartPosition.z
                ),
                direction: new BABYLON.Vector3(0.2, 1, 0).normalize(),
                radius: 0.18,
                isMain: true
            }
        ];

        // Add main arteries to growth queue
        mainArteryPoints.forEach(point => {
            this.growthQueue.push({
                point: point.point,
                direction: point.direction,
                radius: point.radius,
                parent: null,
                isMain: point.isMain
            });
        });

        // Add secondary growth points
        const numSecondaryPoints = 4;
        for (let i = 0; i < numSecondaryPoints; i++) {
            const angle = (i / numSecondaryPoints) * Math.PI * 2;
            const startPoint = new BABYLON.Vector3(
                heartPosition.x + Math.cos(angle) * 0.3,
                heartPosition.y + 0.2,
                heartPosition.z + Math.sin(angle) * 0.3
            );

            const directionToWall = new BABYLON.Vector3(
                Math.cos(angle),
                0.5,
                Math.sin(angle)
            ).normalize();

            this.growthQueue.push({
                point: startPoint,
                direction: directionToWall,
                radius: 0.12,
                parent: null,
                isMain: false
            });
        }

        console.log(`Created ${this.growthQueue.length} initial growth points`);
    }

    addArtery(startPoint, direction, radius, parent = null, isMain = false) {
        console.log('Adding artery:', { startPoint, radius, isMain });
        
        // Adjust length based on whether it's a main artery
        const length = isMain ? 0.5 + Math.random() * 0.2 : 0.3 + Math.random() * 0.2;
        let endPoint = startPoint.add(direction.scale(length));

        // Create smoother path with more points for main arteries
        const numPoints = isMain ? 15 : 10;
        const path = [];
        
        for (let i = 0; i < numPoints; i++) {
            const t = i / (numPoints - 1);
            const point = BABYLON.Vector3.Lerp(startPoint, endPoint, t);
            
            // Add slight curve for more organic look
            if (i > 0 && i < numPoints - 1) {
                const curveAmount = isMain ? 0.03 : 0.05;
                point.x += (Math.random() - 0.5) * curveAmount;
                point.y += (Math.random() - 0.5) * curveAmount;
                point.z += (Math.random() - 0.5) * curveAmount;
            }
            path.push(point);
        }

        // Create artery mesh with higher tessellation for main arteries
        const artery = BABYLON.MeshBuilder.CreateTube("artery", {
            path: path,
            radius: radius,
            tessellation: isMain ? 16 : 12,
            cap: BABYLON.Mesh.CAP_ALL,
            updatable: true
        }, this.scene);

        // Clone and customize material
        const material = this.arteryMaterial.clone(`arteryMaterial_${this.branchCount}`);
        material.alpha = 1.0;
        
        // Make main arteries slightly darker
        if (isMain) {
            material.albedoColor = new BABYLON.Color3(0.7, 0.05, 0.05);
        }
        
        artery.material = material;
        artery.parent = this.arteryGroup;

        // Ensure the mesh is properly added to the scene
        this.scene.addMesh(artery);

        const arteryData = {
            mesh: artery,
            startPoint: startPoint,
            endPoint: endPoint,
            direction: direction,
            radius: radius,
            children: [],
            parent: parent,
            isMain: isMain
        };

        this.arteries.push(arteryData);
        this.branchCount++;

        if (parent) {
            parent.children.push(arteryData);
        }

        // Add new growth points if not at max branches
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
                radius: Math.max(0.05, artery.radius * 0.9, this.defaultRadius * 0.8),
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

        // Use configurable growth speed
        setTimeout(() => {
            this.processGrowthQueue();
        }, this.growthSpeed);
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