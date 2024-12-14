import * as THREE from 'three';

export class LabJar {
    constructor() {
        this.jarGroup = new THREE.Group();
        this.createJar();
    }

    createJar() {
        // Create the main components
        this.createMainBody();
        this.createRim();
        this.createBottom();
        this.createInnerGlow();
        this.createOpeningBevel();
    }

    createMainBody() {
        // Main jar body - cylinder with no top cap
        const jarGeometry = new THREE.CylinderGeometry(
            2,    // top radius
            2,    // bottom radius
            4,    // height
            32,   // radial segments
            1,    // height segments
            true  // open ended
        );

        const glassMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            shininess: 100,
            side: THREE.DoubleSide,
            specular: 0x444444,
            refractionRatio: 0.98
        });

        const jarMesh = new THREE.Mesh(jarGeometry, glassMaterial);
        this.jarGroup.add(jarMesh);
    }

    createRim() {
        // Outer rim
        const outerRimGeometry = new THREE.TorusGeometry(
            2.1,  // radius
            0.2,  // tube radius
            16,   // radial segments
            48    // tubular segments
        );

        // Inner rim (creates the opening)
        const innerRimGeometry = new THREE.TorusGeometry(
            1.8,  // slightly smaller radius for inner rim
            0.15, // smaller tube radius
            16,   // radial segments
            48    // tubular segments
        );

        const rimMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            shininess: 100,
            side: THREE.DoubleSide,
            specular: 0x444444
        });

        const outerRimMesh = new THREE.Mesh(outerRimGeometry, rimMaterial);
        const innerRimMesh = new THREE.Mesh(innerRimGeometry, rimMaterial);

        // Position rims
        outerRimMesh.position.y = 2;
        innerRimMesh.position.y = 2;
        outerRimMesh.rotation.x = Math.PI / 2;
        innerRimMesh.rotation.x = Math.PI / 2;

        this.jarGroup.add(outerRimMesh, innerRimMesh);
    }

    createBottom() {
        const bottomGeometry = new THREE.CircleGeometry(2, 32);
        const bottomMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            shininess: 100,
            side: THREE.DoubleSide,
            specular: 0x444444
        });

        const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottomMesh.rotation.x = Math.PI / 2;
        bottomMesh.position.y = -2;

        this.jarGroup.add(bottomMesh);
    }

    createInnerGlow() {
        const glowGeometry = new THREE.CylinderGeometry(
            1.95,  // slightly smaller for inner glow
            1.95,
            3.9,   // slightly shorter
            32,
            1,
            true
        );

        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });

        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.jarGroup.add(glowMesh);
    }

    createOpeningBevel() {
        // Create a beveled edge for the opening
        const bevelGeometry = new THREE.RingGeometry(
            1.8,   // inner radius
            2.0,   // outer radius
            32,    // segments
            1      // rings
        );

        const bevelMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            shininess: 100,
            side: THREE.DoubleSide,
            specular: 0x444444
        });

        const bevelMesh = new THREE.Mesh(bevelGeometry, bevelMaterial);
        bevelMesh.rotation.x = -Math.PI / 2;
        bevelMesh.position.y = 2;

        this.jarGroup.add(bevelMesh);
    }

    getMesh() {
        return this.jarGroup;
    }

    dispose() {
        this.jarGroup.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                child.material.dispose();
            }
        });
    }
} 