export class LabJar {
    constructor(scene) {
        this.scene = scene;
        this.jarGroup = new BABYLON.TransformNode("jarGroup", scene);
        this.createJar();
    }

    createJar() {
        // Create glass material
        const glassMaterial = new BABYLON.PBRMaterial("glassMaterial", this.scene);
        glassMaterial.metallic = 0.1;
        glassMaterial.roughness = 0.1;
        glassMaterial.alpha = 0.3;
        glassMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        glassMaterial.backFaceCulling = false;
        glassMaterial.clearCoat.isEnabled = true;
        glassMaterial.clearCoat.roughness = 0.1;

        // Main jar body
        const jarBody = BABYLON.MeshBuilder.CreateCylinder("jarBody", {
            height: 4,
            diameter: 4,
            tessellation: 32,
            cap: BABYLON.Mesh.NO_CAP
        }, this.scene);
        jarBody.material = glassMaterial;
        jarBody.parent = this.jarGroup;

        // Create jar bottom
        const bottom = BABYLON.MeshBuilder.CreateDisc("jarBottom", {
            radius: 2,
            tessellation: 32
        }, this.scene);
        bottom.rotation.x = Math.PI/2;
        bottom.position.y = -2;
        bottom.material = glassMaterial;
        bottom.parent = this.jarGroup;

        // Create outer rim
        const outerRim = BABYLON.MeshBuilder.CreateTorus("outerRim", {
            diameter: 4.2,
            thickness: 0.4,
            tessellation: 48
        }, this.scene);
        outerRim.position.y = 2;
        outerRim.material = glassMaterial;
        outerRim.parent = this.jarGroup;

        // Create inner rim
        const innerRim = BABYLON.MeshBuilder.CreateTorus("innerRim", {
            diameter: 3.6,
            thickness: 0.3,
            tessellation: 48
        }, this.scene);
        innerRim.position.y = 2;
        innerRim.material = glassMaterial;
        innerRim.parent = this.jarGroup;

        // Create opening bevel
        const bevel = BABYLON.MeshBuilder.CreateDisc("jarBevel", {
            radius: 2,
            innerRadius: 1.8,
            tessellation: 32
        }, this.scene);
        bevel.rotation.x = -Math.PI/2;
        bevel.position.y = 2;
        bevel.material = glassMaterial;
        bevel.parent = this.jarGroup;

        // Create inner glow
        const glowMaterial = new BABYLON.StandardMaterial("glowMaterial", this.scene);
        glowMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        glowMaterial.alpha = 0.1;
        glowMaterial.backFaceCulling = false;

        const innerGlow = BABYLON.MeshBuilder.CreateCylinder("innerGlow", {
            height: 3.9,
            diameter: 3.9,
            tessellation: 32,
            cap: BABYLON.Mesh.NO_CAP
        }, this.scene);
        innerGlow.material = glowMaterial;
        innerGlow.parent = this.jarGroup;
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