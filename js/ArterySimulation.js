import * as THREE from 'three';

export class ArterySimulation {
    constructor() {
        console.log('Initializing ArterySimulation');
        this.arteryGroup = new THREE.Group();
        this.branches = [];
        this.growthQueue = [];
        this.isGrowing = false;
        this.growthSpeed = 20;
    }

    getMesh() {
        return this.arteryGroup;
    }

    createArterySystem(immediate = false) {
        console.log('Creating artery system...');
        this.growthQueue = [];
        
        const arteryMaterial = new THREE.MeshPhongMaterial({
            color: 0xff2222,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            emissive: 0x330000,
            shininess: 50
        });

        const veinMaterial = new THREE.MeshPhongMaterial({
            color: 0x2222ff,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            emissive: 0x000033,
            shininess: 50
        });

        const createBranch = (parent, length, radius, direction, depth, isArtery = true) => {
            if (depth > 10) return;

            const geometry = new THREE.CylinderGeometry(
                radius,
                radius * 0.9,
                length,
                8,
                1
            );

            const branch = new THREE.Mesh(
                geometry,
                isArtery ? arteryMaterial : veinMaterial
            );

            // Position the branch
            const position = parent ? parent.position.clone() : new THREE.Vector3();
            if (parent) {
                position.add(direction.clone().multiplyScalar(length));
            }
            branch.position.copy(position);

            // Orient the branch
            branch.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction
            );

            // Add to scene
            (parent || this.arteryGroup).add(branch);
            this.branches.push(branch);

            // Create sub-branches
            if (depth < 10) {
                const numBranches = Math.floor(Math.random() * 2) + 2;
                for (let i = 0; i < numBranches; i++) {
                    const newDirection = direction.clone();
                    
                    // Add strong upward bias
                    newDirection.y += 1.0;
                    
                    // Add outward spread
                    newDirection.x += (Math.random() - 0.5) * 1.2;
                    newDirection.z += (Math.random() - 0.5) * 1.2;
                    
                    newDirection.normalize();

                    const newLength = length * 0.95;
                    const newRadius = radius * 0.9;

                    if (immediate) {
                        createBranch(branch, newLength, newRadius, newDirection, depth + 1, isArtery);
                    } else {
                        this.growthQueue.push({
                            parent: branch,
                            length: newLength,
                            radius: newRadius,
                            direction: newDirection,
                            depth: depth + 1,
                            isArtery: isArtery
                        });
                    }
                }
            }
        };

        // Create initial branches
        const startDirections = [
            // Main arteries (red)
            { dir: new THREE.Vector3(0, 1, 0.2), isArtery: true },
            { dir: new THREE.Vector3(0.2, 1, 0), isArtery: true },
            { dir: new THREE.Vector3(-0.2, 1, 0), isArtery: true },
            // Main veins (blue)
            { dir: new THREE.Vector3(0.1, 1, -0.2), isArtery: false },
            { dir: new THREE.Vector3(-0.1, 1, 0.2), isArtery: false }
        ];

        startDirections.forEach(({ dir, isArtery }) => {
            dir.normalize();
            createBranch(
                null,
                2.0,     // Longer initial branches
                0.2,     // Thicker initial branches
                dir,
                0,
                isArtery
            );
        });

        if (!immediate) {
            this.isGrowing = true;
            this.processGrowthQueue();
        }
    }

    processGrowthQueue() {
        if (!this.isGrowing || this.growthQueue.length === 0) return;

        // Process multiple branches per frame
        for (let i = 0; i < 4 && this.growthQueue.length > 0; i++) {
            const { parent, length, radius, direction, depth, isArtery } = this.growthQueue.shift();
            const geometry = new THREE.CylinderGeometry(radius, radius * 0.9, length, 8, 1);
            const material = new THREE.MeshPhongMaterial({
                color: isArtery ? 0xff2222 : 0x2222ff,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide,
                emissive: isArtery ? 0x330000 : 0x000033,
                shininess: 50
            });

            const branch = new THREE.Mesh(geometry, material);
            const position = parent.position.clone().add(direction.clone().multiplyScalar(length));
            branch.position.copy(position);
            branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

            parent.add(branch);
            this.branches.push(branch);

            // Continue branching
            if (depth < 10) {
                const numNewBranches = Math.floor(Math.random() * 2) + 2;
                for (let j = 0; j < numNewBranches; j++) {
                    const newDirection = direction.clone();
                    newDirection.y += 1.0;
                    newDirection.x += (Math.random() - 0.5) * 1.2;
                    newDirection.z += (Math.random() - 0.5) * 1.2;
                    newDirection.normalize();

                    this.growthQueue.push({
                        parent: branch,
                        length: length * 0.95,
                        radius: radius * 0.9,
                        direction: newDirection,
                        depth: depth + 1,
                        isArtery: isArtery
                    });
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