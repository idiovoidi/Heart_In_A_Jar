import * as THREE from 'three';

export class LabEnvironment {
    constructor() {
        this.labGroup = new THREE.Group();
        this.createLaboratory();
    }

    createLaboratory() {
        // Create lab floor - smaller room size
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        this.labGroup.add(floor);

        this.addLabEquipment();
        this.createWallPanels();
        this.addLabProps();
    }

    createWallPanels() {
        // Smaller walls for cozier lab
        const wallGeometry = new THREE.PlaneGeometry(10, 6);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.9,
            metalness: 0.1
        });

        // Back wall
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.z = -3;
        backWall.position.y = 1;
        this.labGroup.add(backWall);

        // Side walls
        const sideWall1 = backWall.clone();
        sideWall1.rotation.y = Math.PI / 2;
        sideWall1.position.x = -5;
        sideWall1.position.z = 0;
        this.labGroup.add(sideWall1);

        const sideWall2 = backWall.clone();
        sideWall2.rotation.y = -Math.PI / 2;
        sideWall2.position.x = 5;
        sideWall2.position.z = 0;
        this.labGroup.add(sideWall2);
    }

    addLabEquipment() {
        // Microscope
        const microscopeBase = new THREE.CylinderGeometry(0.15, 0.2, 0.1);
        const microscopeMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.2,
            metalness: 0.8
        });
        const microscope = new THREE.Mesh(microscopeBase, microscopeMaterial);
        microscope.position.set(-1.5, -1.3, 0.5);
        this.labGroup.add(microscope);

        // Test tubes
        const tubeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.2);
        const tubeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            roughness: 0,
            metalness: 0,
            clearcoat: 1.0
        });

        // Reposition test tubes
        for (let i = 0; i < 5; i++) {
            const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            tube.position.set(1.2 + i * 0.1, -1.3, 0.7);
            this.labGroup.add(tube);
        }
    }

    addLabProps() {
        // Ceiling lights - fewer for smaller room
        const lightGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.3);
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1
        });

        // Adjust light positions for smaller room
        for (let i = -3; i <= 3; i += 3) {
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(i, 3, 0);
            this.labGroup.add(light);

            const pointLight = new THREE.PointLight(0xffffff, 0.5);
            pointLight.position.copy(light.position);
            this.labGroup.add(pointLight);
        }

        // Single shelf unit on the back wall
        const shelfGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.7,
            metalness: 0.3
        });

        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(-3, 0.5, -2.7);
        this.labGroup.add(shelf);
    }

    getMesh() {
        return this.labGroup;
    }
} 