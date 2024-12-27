export class ArterySimulation {
    constructor(scene) {
        this.scene = scene;
        this.arteryGroup = new BABYLON.TransformNode("arteryGroup", scene);
        this.branches = [];
        this.isGrowing = false;
        this.growthQueue = [];
        this.growthSpeed = 100;
        this.jarRadius = 1.0;
        this.jarHeight = 3.0;
        this.maxBranches = 200;
    }

    createSmoothBranch(startPoint, endPoint, radius, tension = 0.5) {
        try {
            // Create control points for natural curve
            const direction = endPoint.subtract(startPoint);
            const midPoint = BABYLON.Vector3.Lerp(startPoint, endPoint, 0.5);
            
            // Add random offset to midpoint for more organic look
            midPoint.addInPlace(new BABYLON.Vector3(
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.2
            ));

            const points = [startPoint, midPoint, endPoint];
            const curve = BABYLON.Curve3.CreateCatmullRomSpline(points, 8);
            
            const tube = BABYLON.MeshBuilder.CreateTube("branch", {
                path: curve.getPoints(),
                radius: radius,
                tessellation: 8,
                updatable: false
            }, this.scene);

            return tube;
        } catch (error) {
            console.error('Error creating branch:', error);
            return null;
        }
    }

    checkJarCollision(point) {
        const distanceFromCenter = Math.sqrt(point.x * point.x + point.z * point.z);
        const heightInJar = point.y + 1.8; // Adjust based on jar position
        return distanceFromCenter > this.jarRadius * 0.8 || heightInJar > this.jarHeight * 0.8;
    }

    getRandomGrowthDirection(currentPos, parentDir) {
        const dir = new BABYLON.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 0.5 + 0.5, // Upward bias
            (Math.random() - 0.5) * 2
        );
        
        // Add some influence from parent direction
        if (parentDir) {
            BABYLON.Vector3.LerpToRef(dir.normalize(), parentDir, 0.3, dir);
        }
        
        // If near jar wall, try to grow along it
        const distanceFromCenter = Math.sqrt(currentPos.x * currentPos.x + currentPos.z * currentPos.z);
        if (distanceFromCenter > this.jarRadius * 0.7) {
            const normalToWall = new BABYLON.Vector3(currentPos.x, 0, currentPos.z).normalize();
            dir.subtractInPlace(normalToWall.scale(0.5));
        }

        return dir.normalize();
    }

    createArterySystem() {
        // Clear existing branches
        this.branches.forEach(branch => {
            if (branch.material) {
                branch.material.dispose();
            }
            branch.dispose();
        });
        this.branches = [];
        this.growthQueue = [];

        // Create materials
        const arteryMaterial = new BABYLON.StandardMaterial("arteryMaterial", this.scene);
        arteryMaterial.diffuseColor = new BABYLON.Color3(1, 0.133, 0.133);
        arteryMaterial.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
        arteryMaterial.alpha = 0.9;

        // Initialize growth queue with starting points from the heart position
        const startPoints = [
            { dir: new BABYLON.Vector3(0.5, 1, 0.5), isArtery: true },
            { dir: new BABYLON.Vector3(-0.5, 1, 0.5), isArtery: true },
            { dir: new BABYLON.Vector3(0, 1, 0.5), isArtery: true },
            { dir: new BABYLON.Vector3(0.5, 1, -0.5), isArtery: false },
            { dir: new BABYLON.Vector3(-0.5, 1, -0.5), isArtery: false }
        ];

        // Use the heart position as the starting point
        const heartPosition = this.arteryGroup.position;

        startPoints.forEach(({ dir, isArtery }) => {
            this.growthQueue.push({
                position: heartPosition.clone(),
                direction: dir.normalize(),
                radius: 0.05,  // Start with thinner arteries
                isArtery: isArtery,
                generation: 0
            });
        });

        // Start growth process if enabled
        if (this.isGrowing) {
            this.processGrowthQueue();
        }
    }

    processGrowthQueue() {
        if (!this.isGrowing || this.growthQueue.length === 0 || this.branches.length >= this.maxBranches) {
            return;
        }

        const branch = this.growthQueue.shift();
        const length = 0.2 - branch.generation * 0.02;  // Shorter segments for more control
        const direction = this.getRandomGrowthDirection(branch.position, branch.direction);
        const endPoint = branch.position.add(direction.scale(length));

        // Check if endpoint is within jar bounds
        if (!this.checkJarCollision(endPoint)) {
            const branchMesh = this.createSmoothBranch(
                branch.position,
                endPoint,
                branch.radius,
                0.5
            );

            if (branchMesh) {
                const material = new BABYLON.StandardMaterial("branchMat", this.scene);
                material.diffuseColor = branch.isArtery ? 
                    new BABYLON.Color3(1, 0.133, 0.133) :
                    new BABYLON.Color3(0.133, 0.133, 1);
                material.emissiveColor = branch.isArtery ?
                    new BABYLON.Color3(0.2, 0, 0) :
                    new BABYLON.Color3(0, 0, 0.2);
                material.alpha = 0.9;

                branchMesh.material = material;
                branchMesh.parent = this.arteryGroup;
                this.branches.push(branchMesh);

                // Add new growth points with more variation
                if (branch.generation < 8) {
                    const numBranches = Math.random() < 0.3 ? 2 : 1;  // Reduce branching probability
                    for (let i = 0; i < numBranches; i++) {
                        this.growthQueue.push({
                            position: endPoint.clone(),
                            direction: direction.clone(),
                            radius: branch.radius * 0.95,  // Slower radius reduction
                            isArtery: branch.isArtery,
                            generation: branch.generation + 1
                        });
                    }
                }
            }
        }

        // Continue growth process
        setTimeout(() => this.processGrowthQueue(), this.growthSpeed);
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        this.branches.forEach((branch, index) => {
            if (branch instanceof BABYLON.Mesh) {
                const offset = index * 0.1;
                const scale = 1 + Math.sin(time * 2 + offset) * 0.1;
                branch.scaling = new BABYLON.Vector3(scale, 1, scale);
            }
        });
    }

    getMesh() {
        return this.arteryGroup;
    }

    dispose() {
        this.isGrowing = false;
        this.growthQueue = [];
        this.branches.forEach(branch => {
            if (branch.material) {
                branch.material.dispose();
            }
            branch.dispose();
        });
        this.branches = [];
        this.arteryGroup.dispose();
    }
} 