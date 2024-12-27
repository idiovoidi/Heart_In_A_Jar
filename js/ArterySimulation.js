import * as THREE from 'three';

export class ArterySimulation {
    constructor() {
        console.log('Initializing ArterySimulation');
        this.arteryGroup = new THREE.Group();
        this.branches = [];
        this.isGrowing = true;
        this.growthQueue = [];
        this.growthSpeed = 100;
        this.jarRadius = 1.0;  // Will be scaled with jar
        this.jarHeight = 3.0;
        this.maxBranches = 200;
    }

    getMesh() {
        return this.arteryGroup;
    }

    createSmoothBranch(startPoint, endPoint, radius, tension = 0.5) {
        try {
            // Create control points for natural curve
            const direction = endPoint.clone().sub(startPoint);
            const midPoint = startPoint.clone().lerp(endPoint, 0.5);
            
            // Add random offset to midpoint for more organic look
            midPoint.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.2
            ));

            const curve = new THREE.CatmullRomCurve3([
                startPoint,
                midPoint,
                endPoint
            ], false, 'catmullrom', tension);

            return new THREE.TubeGeometry(curve, 8, radius, 8, false);
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
        const dir = new THREE.Vector3();
        
        // Tendency to grow upward and outward
        dir.y = Math.random() * 0.5 + 0.5; // Upward bias
        dir.x = (Math.random() - 0.5) * 2;
        dir.z = (Math.random() - 0.5) * 2;
        
        // Add some influence from parent direction
        if (parentDir) {
            dir.lerp(parentDir, 0.3);
        }
        
        // If near jar wall, try to grow along it
        const distanceFromCenter = Math.sqrt(currentPos.x * currentPos.x + currentPos.z * currentPos.z);
        if (distanceFromCenter > this.jarRadius * 0.7) {
            const normalToWall = new THREE.Vector3(currentPos.x, 0, currentPos.z).normalize();
            dir.sub(normalToWall.multiplyScalar(0.5));
        }

        return dir.normalize();
    }

    createArterySystem() {
        console.log('Creating artery system...');
        
        const arteryMaterial = new THREE.MeshPhongMaterial({
            color: 0xff2222,
            transparent: true,
            opacity: 0.9,
            emissive: 0x330000,
            shininess: 50
        });

        const veinMaterial = new THREE.MeshPhongMaterial({
            color: 0x2222ff,
            transparent: true,
            opacity: 0.9,
            emissive: 0x000033,
            shininess: 50
        });

        // Initialize growth queue with starting points
        const startPoints = [
            { pos: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(0.5, 1, 0.5), isArtery: true },
            { pos: new THREE.Vector3(0.2, 0, 0), dir: new THREE.Vector3(0, 1, 0.5), isArtery: true },
            { pos: new THREE.Vector3(-0.2, 0, 0), dir: new THREE.Vector3(-0.5, 1, 0), isArtery: true },
            { pos: new THREE.Vector3(0, 0, 0.2), dir: new THREE.Vector3(0.5, 1, 0), isArtery: false },
            { pos: new THREE.Vector3(0, 0, -0.2), dir: new THREE.Vector3(-0.5, 1, 0), isArtery: false }
        ];

        startPoints.forEach(({ pos, dir, isArtery }) => {
            this.growthQueue.push({
                position: pos,
                direction: dir.normalize(),
                radius: 0.1,
                isArtery: isArtery,
                generation: 0
            });
        });

        // Start growth process
        this.processGrowthQueue();
    }

    processGrowthQueue() {
        if (!this.isGrowing || this.growthQueue.length === 0 || this.branches.length >= this.maxBranches) {
            return;
        }

        const branch = this.growthQueue.shift();
        const length = 0.3 - branch.generation * 0.02;
        const direction = this.getRandomGrowthDirection(branch.position, branch.direction);
        const endPoint = branch.position.clone().add(direction.multiplyScalar(length));

        // Check if endpoint is within jar bounds
        if (!this.checkJarCollision(endPoint)) {
            const geometry = this.createSmoothBranch(
                branch.position,
                endPoint,
                branch.radius,
                0.5
            );

            if (geometry) {
                const material = branch.isArtery ? 
                    new THREE.MeshPhongMaterial({
                        color: 0xff2222,
                        transparent: true,
                        opacity: 0.9,
                        emissive: 0x330000,
                        shininess: 50
                    }) :
                    new THREE.MeshPhongMaterial({
                        color: 0x2222ff,
                        transparent: true,
                        opacity: 0.9,
                        emissive: 0x000033,
                        shininess: 50
                    });

                const mesh = new THREE.Mesh(geometry, material);
                this.arteryGroup.add(mesh);
                this.branches.push(mesh);

                // Add new growth points
                if (branch.generation < 8) {
                    const numBranches = Math.random() < 0.5 ? 2 : 1;
                    for (let i = 0; i < numBranches; i++) {
                        this.growthQueue.push({
                            position: endPoint.clone(),
                            direction: direction.clone(),
                            radius: branch.radius * 0.9,
                            isArtery: branch.isArtery,
                            generation: branch.generation + 1
                        });
                    }
                }
            }
        }

        setTimeout(() => this.processGrowthQueue(), this.growthSpeed);
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        this.branches.forEach((branch, index) => {
            if (branch.isMesh) {
                const offset = index * 0.1;
                const scale = 1 + Math.sin(time * 2 + offset) * 0.1;
                branch.scale.setScalar(scale);
            }
        });
    }

    dispose() {
        this.isGrowing = false;
        this.growthQueue = [];
        this.branches.forEach(branch => {
            if (branch.geometry) branch.geometry.dispose();
            if (branch.material) branch.material.dispose();
        });
        this.branches = [];
    }
} 