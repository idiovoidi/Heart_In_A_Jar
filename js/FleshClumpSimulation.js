import * as THREE from 'three';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export class FleshClumpSimulation {
    constructor() {
        console.log('Initializing FleshClumpSimulation');
        this.fleshClumpGroup = new THREE.Group();
        this.noise = new SimplexNoise();
        this.createFleshClumps();
    }

    getMesh() {
        return this.fleshClumpGroup;
    }

    createFleshClumps() {
        const numClumps = 8;
        const minSize = 0.15;
        const maxSize = 0.4;
        const minPosition = new THREE.Vector3(-0.6, 0, -0.6);
        const maxPosition = new THREE.Vector3(0.6, 0.3, 0.6);

        for (let i = 0; i < numClumps; i++) {
            const size = Math.random() * (maxSize - minSize) + minSize;
            const position = new THREE.Vector3(
                Math.random() * (maxPosition.x - minPosition.x) + minPosition.x,
                Math.random() * (maxPosition.y - minPosition.y) + minPosition.y,
                Math.random() * (maxPosition.z - minPosition.z) + minPosition.z
            );
            const clump = this.createFleshClump(size, position);
            this.fleshClumpGroup.add(clump);
        }
    }

    createFleshClump(size, position) {
        const geometry = new THREE.IcosahedronGeometry(size, 4);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            shininess: 10,
            flatShading: true
        });

        // Deform the geometry for a more organic look
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);

            const noise = this.noise.noise3d(x * 2, y * 2, z * 2);
            positions.setXYZ(
                i,
                x + noise * 0.2,
                y + noise * 0.2,
                z + noise * 0.2
            );
        }
        geometry.computeVertexNormals();

        const clump = new THREE.Mesh(geometry, material);
        clump.position.copy(position);
        clump.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        return clump;
    }

    update(deltaTime) {
        this.fleshClumpGroup.traverse(child => {
            if (child.isMesh) {
                const t = performance.now() * 0.001;
                const noise1 = this.noise.noise3d(child.position.x * 0.5, child.position.y * 0.5, t * 0.5);
                const noise2 = this.noise.noise3d(child.position.x * 0.3, child.position.y * 0.3, t * 0.7);
                const noise3 = this.noise.noise3d(child.position.x * 0.1, child.position.y * 0.1, t * 0.9);

                child.scale.x = 1 + noise1 * 0.2;
                child.scale.y = 1 + noise2 * 0.2;
                child.scale.z = 1 + noise3 * 0.2;

                child.rotation.x += deltaTime * (0.1 + noise1 * 0.05);
                child.rotation.y += deltaTime * (0.1 + noise2 * 0.05);
                child.rotation.z += deltaTime * (0.1 + noise3 * 0.05);
            }
        });
    }

    dispose() {
        this.fleshClumpGroup.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
} 