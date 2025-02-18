export class FleshClumps {
    constructor(scene) {
        this.scene = scene;
        this.fleshClumpGroup = new BABYLON.TransformNode("fleshClumpGroup", scene);
        this.clumps = [];
        
        // Add size constraints
        this.minSize = 0.05;
        this.maxSize = 0.12;  // Reduced from 0.15
        this.maxScaleChange = 0.1;  // Limit scale changes
        this.baseScale = 0.3;  // Base scale for the entire group
        
        this.createFleshClumps();
    }

    createFleshClumps() {
        const numClumps = 25;
        const jarRadius = 1.8;

        // Create base material with subsurface scattering effect
        const fleshMaterial = new BABYLON.PBRMaterial("fleshMaterial", this.scene);
        fleshMaterial.albedoColor = new BABYLON.Color3(0.8, 0.2, 0.2);
        fleshMaterial.subSurface.isTranslucencyEnabled = true;
        fleshMaterial.subSurface.translucencyIntensity = 1;
        fleshMaterial.roughness = 0.4;
        
        // Distribute clumps in concentric rings with size constraints
        const rings = 3;
        const clumpsPerRing = Math.floor(numClumps / rings);
        
        for (let ring = 0; ring < rings; ring++) {
            const ringRadius = (ring + 1) * (jarRadius * 0.7 / rings);
            const numInThisRing = ring === rings - 1 ? 
                numClumps - (clumpsPerRing * (rings - 1)) : 
                clumpsPerRing;

            for (let i = 0; i < numInThisRing; i++) {
                const angle = (i / numInThisRing) * Math.PI * 2;
                const distance = ringRadius * (0.8 + Math.random() * 0.4);
                
                // Constrain size based on ring position
                const maxRingSize = this.maxSize * (1 - ring * 0.2);
                const size = this.minSize + Math.random() * (maxRingSize - this.minSize);

                const position = new BABYLON.Vector3(
                    Math.cos(angle) * distance,
                    -2.0 + Math.random() * 0.1,
                    Math.sin(angle) * distance
                );
                
                this.createFleshClump(size, position, fleshMaterial.clone(`fleshMaterial${ring}${i}`));
            }
        }
    }

    createFleshClump(size, position, material) {
        // Create more detailed base sphere
        const clump = BABYLON.MeshBuilder.CreateIcoSphere("fleshClump", {
            radius: size,
            subdivisions: 3,
            updatable: true
        }, this.scene);

        // Deform the mesh for organic look
        const positions = clump.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const normals = clump.getVerticesData(BABYLON.VertexBuffer.NormalKind);

        for (let i = 0; i < positions.length; i += 3) {
            const noise = this.simplex3D(
                positions[i] * 4,
                positions[i + 1] * 4,
                positions[i + 2] * 4
            ) * 0.3;

            positions[i] *= (1 + noise);
            positions[i + 1] *= (1 + noise);
            positions[i + 2] *= (1 + noise);

            // Update normal
            const normal = new BABYLON.Vector3(
                normals[i],
                normals[i + 1],
                normals[i + 2]
            ).normalize();
            
            normals[i] = normal.x;
            normals[i + 1] = normal.y;
            normals[i + 2] = normal.z;
        }

        clump.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        clump.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);

        clump.position = position;
        clump.rotation = new BABYLON.Vector3(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Add subtle scale variation
        const scaleVar = 0.9 + Math.random() * 0.2;
        clump.scaling = new BABYLON.Vector3(scaleVar, scaleVar * 0.7, scaleVar);

        clump.material = material;
        clump.parent = this.fleshClumpGroup;
        this.clumps.push(clump);
    }

    // Simplex noise implementation for Babylon.js
    simplex3D(x, y, z) {
        // Simple implementation of 3D noise
        return (Math.sin(x) * Math.cos(y) + Math.cos(z)) * 0.5;
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        
        this.clumps.forEach((clump, index) => {
            // Constrained pulsing animation
            const pulseSpeed = 0.5 + Math.random() * 0.2;  // Slower pulse
            const pulseAmount = 0.01 + Math.random() * 0.01;  // Smaller pulse
            
            const baseScale = clump.baseScale || this.baseScale;
            const scaleChange = Math.sin(time * pulseSpeed + index) * pulseAmount;
            
            // Limit maximum scale change
            const limitedScale = baseScale * (1 + Math.max(-this.maxScaleChange, 
                Math.min(this.maxScaleChange, scaleChange)));
            
            clump.scaling = new BABYLON.Vector3(
                limitedScale,
                limitedScale * 0.7,
                limitedScale
            );
            
            // Minimal rotation
            clump.rotation.x += deltaTime * 0.01 * Math.sin(time * 0.3 + index);
            clump.rotation.y += deltaTime * 0.01 * Math.cos(time * 0.2 + index);
            clump.rotation.z += deltaTime * 0.01 * Math.sin(time * 0.4 + index);
        });
    }

    getMesh() {
        return this.fleshClumpGroup;
    }

    dispose() {
        this.clumps.forEach(clump => {
            if (clump.material) {
                clump.material.dispose();
            }
            clump.dispose();
        });
        this.fleshClumpGroup.dispose();
    }
} 