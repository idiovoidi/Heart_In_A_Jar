export class LabJar {
    constructor(scene) {
        this.scene = scene;
        this.jarGroup = new BABYLON.TransformNode("jarGroup", scene);
        this.createJar();
    }

    createJar() {
        // Create glass material with improved transparency
        const glassMaterial = new BABYLON.PBRMaterial("glassMaterial", this.scene);
        glassMaterial.metallic = 0.0;
        glassMaterial.roughness = 0.15;
        glassMaterial.alpha = 0.3;
        glassMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        glassMaterial.backFaceCulling = false;
        glassMaterial.clearCoat.isEnabled = true;
        glassMaterial.clearCoat.roughness = 0.1;
        glassMaterial.indexOfRefraction = 1.5;
        glassMaterial.subSurface.isRefractionEnabled = true;

        // Create jar wall (cylinder with no caps)
        const jarWall = BABYLON.MeshBuilder.CreateCylinder("jarWall", {
            height: 4,
            diameter: 4,
            tessellation: 32,
            cap: BABYLON.Mesh.NO_CAP
        }, this.scene);
        jarWall.material = glassMaterial;
        jarWall.parent = this.jarGroup;

        // Create jar bottom (separate disc)
        const bottom = BABYLON.MeshBuilder.CreateDisc("jarBottom", {
            radius: 2,
            tessellation: 32
        }, this.scene);
        bottom.rotation.x = Math.PI/2;
        bottom.position.y = -2;
        bottom.material = glassMaterial;
        bottom.parent = this.jarGroup;

        // Create thicker rim at the top
        const rimMaterial = new BABYLON.PBRMaterial("rimMaterial", this.scene);
        Object.assign(rimMaterial, {
            metallic: 0.1,
            roughness: 0.2,
            alpha: 0.4,
            transparencyMode: BABYLON.Material.MATERIAL_ALPHABLEND,
            backFaceCulling: false
        });

        // Outer rim (thicker torus)
        const outerRim = BABYLON.MeshBuilder.CreateTorus("outerRim", {
            diameter: 4.2,
            thickness: 0.3,
            tessellation: 48
        }, this.scene);
        outerRim.position.y = 2;
        outerRim.material = rimMaterial;
        outerRim.parent = this.jarGroup;

        // Inner rim (smaller torus)
        const innerRim = BABYLON.MeshBuilder.CreateTorus("innerRim", {
            diameter: 3.8,
            thickness: 0.2,
            tessellation: 48
        }, this.scene);
        innerRim.position.y = 2;
        innerRim.material = rimMaterial;
        innerRim.parent = this.jarGroup;

        // Create subtle inner glow
        const glowMaterial = new BABYLON.StandardMaterial("glowMaterial", this.scene);
        glowMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        glowMaterial.alpha = 0.05;
        glowMaterial.backFaceCulling = false;

        const innerGlow = BABYLON.MeshBuilder.CreateCylinder("innerGlow", {
            height: 3.9,
            diameter: 3.9,
            tessellation: 32,
            cap: BABYLON.Mesh.NO_CAP
        }, this.scene);
        innerGlow.material = glowMaterial;
        innerGlow.parent = this.jarGroup;

        // Add subtle edge highlight at the top opening
        const edgeHighlight = BABYLON.MeshBuilder.CreateTorus("edgeHighlight", {
            diameter: 4.0,
            thickness: 0.05,
            tessellation: 48
        }, this.scene);
        edgeHighlight.position.y = 2;
        
        const highlightMaterial = new BABYLON.StandardMaterial("highlightMaterial", this.scene);
        highlightMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        highlightMaterial.alpha = 0.3;
        edgeHighlight.material = highlightMaterial;
        edgeHighlight.parent = this.jarGroup;
    }

    getMesh() {
        return this.jarGroup;
    }

    dispose() {
        this.jarGroup.getChildMeshes().forEach(mesh => {
            if (mesh.material) {
                mesh.material.dispose();
            }
            mesh.dispose();
        });
        this.jarGroup.dispose();
    }
} 