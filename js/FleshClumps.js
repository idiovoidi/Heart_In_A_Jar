export class FleshClumps {
    constructor(scene) {
        this.scene = scene;
        this.fleshClumpGroup = new BABYLON.TransformNode("fleshClumpGroup", scene);
        this.createFleshClumps();
    }

    createFleshClumps() {
        const numClumps = 25;
        const minSize = 0.05;   // Reduced from 0.1 to 0.05
        const maxSize = 0.15;   // Reduced from 0.3 to 0.15
        const jarRadius = 1.8;

        // Create base material for flesh with more organic look
        const fleshMaterial = new BABYLON.StandardMaterial("fleshMaterial", this.scene);
        fleshMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
        fleshMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        fleshMaterial.emissiveColor = new BABYLON.Color3(0.1, 0, 0);
        fleshMaterial.roughness = 0.9;
        fleshMaterial.specularPower = 32;

        // Create clumps in concentric rings for better distribution
        const rings = 3;
        const clumpsPerRing = Math.floor(numClumps / rings);
        
        for (let ring = 0; ring < rings; ring++) {
            const ringRadius = (ring + 1) * (jarRadius * 0.7 / rings); // Reduced from 0.8 to 0.7
            const numInThisRing = ring === rings - 1 ? 
                numClumps - (clumpsPerRing * (rings - 1)) : 
                clumpsPerRing;

            for (let i = 0; i < numInThisRing; i++) {
                const angle = (i / numInThisRing) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
                const distance = ringRadius * (0.8 + Math.random() * 0.4);
                const size = Math.random() * (maxSize - minSize) + minSize;

                // Add some randomness to position
                const position = new BABYLON.Vector3(
                    Math.cos(angle) * distance + (Math.random() * 0.1 - 0.05), // Reduced position randomness
                    -2.0 + Math.random() * 0.1,  // Reduced height variation
                    Math.sin(angle) * distance + (Math.random() * 0.1 - 0.05)
                );
                
                const clump = this.createFleshClump(size, position);
                const material = fleshMaterial.clone(`fleshMaterial${ring}${i}`);
                
                // More varied color for organic look
                const hueVar = Math.random() * 0.2 - 0.1;
                const satVar = Math.random() * 0.3;
                material.diffuseColor = new BABYLON.Color3(
                    0.8 + hueVar,
                    0.2 - satVar,
                    0.2 - satVar
                );
                material.emissiveColor = new BABYLON.Color3(
                    0.1 + hueVar * 0.5,
                    0,
                    0
                );
                
                clump.material = material;
            }
        }
    }

    createFleshClump(size, position) {
        // Create more detailed base sphere
        const clump = BABYLON.MeshBuilder.CreateIcoSphere("fleshClump", {
            radius: size,
            subdivisions: 3,
            updatable: true
        }, this.scene);

        // More aggressive deformation for organic look
        const positions = clump.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const normals = clump.getVerticesData(BABYLON.VertexBuffer.NormalKind);
        
        for (let i = 0; i < positions.length; i += 3) {
            // More varied displacement
            const displacement = new BABYLON.Vector3(
                (Math.random() - 0.5) * size * 0.4, // Reduced from 0.6 to 0.4
                (Math.random() - 0.5) * size * 0.3, // Reduced from 0.4 to 0.3
                (Math.random() - 0.5) * size * 0.4
            );

            // Add bulges and dents
            const y = positions[i + 1];
            const bulgeAmount = Math.sin(y * 10) * 0.05; // Reduced from 0.1 to 0.05
            
            positions[i] += displacement.x + bulgeAmount;
            positions[i + 1] += displacement.y * 0.7;
            positions[i + 2] += displacement.z + bulgeAmount;

            // Update normals
            const normal = new BABYLON.Vector3(
                normals[i],
                normals[i + 1],
                normals[i + 2]
            );
            normal.normalize();
            
            normals[i] = normal.x;
            normals[i + 1] = normal.y;
            normals[i + 2] = normal.z;
        }

        clump.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        clump.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);

        // Position and rotate
        clump.position = position;
        clump.rotation = new BABYLON.Vector3(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Reduced scaling variation
        const scaleVar = 0.9 + Math.random() * 0.2; // Reduced from 0.8 + 0.4 to 0.9 + 0.2
        clump.scaling = new BABYLON.Vector3(scaleVar, scaleVar * 0.7, scaleVar);

        clump.parent = this.fleshClumpGroup;
        return clump;
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        
        this.fleshClumpGroup.getChildMeshes().forEach((clump, index) => {
            // Even slower, more subtle pulsing
            const pulseSpeed = 0.1 + Math.random() * 0.2; // Reduced from 0.2 + 0.3
            const pulseAmount = 0.02 + Math.random() * 0.02; // Reduced from 0.03 + 0.03
            
            const baseScale = clump.scaling.x;
            const scale = baseScale * (1 + Math.sin(time * pulseSpeed + index) * pulseAmount);
            clump.scaling = new BABYLON.Vector3(
                scale,
                scale * 0.7, // Reduced vertical scale
                scale
            );
            
            // Minimal rotation
            clump.rotation.x += deltaTime * 0.02 * Math.sin(time * 0.3 + index);
            clump.rotation.y += deltaTime * 0.02 * Math.cos(time * 0.2 + index);
            clump.rotation.z += deltaTime * 0.02 * Math.sin(time * 0.4 + index);
        });
    }

    getMesh() {
        return this.fleshClumpGroup;
    }

    dispose() {
        this.fleshClumpGroup.getChildMeshes().forEach(mesh => {
            if (mesh.material) {
                mesh.material.dispose();
            }
            mesh.dispose();
        });
        this.fleshClumpGroup.dispose();
    }
} 