import { Scene, TransformNode, PBRMaterial, MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core';
import { EntityBase, Component } from './core/EntityBase';
import { MaterialComponent } from './components/MaterialComponent';
import { AnimationComponent } from './components/AnimationComponent';
import { ErrorDecorator } from './core/ErrorDecorator';

export class LabJar extends EntityBase {
    jarGroup: TransformNode;

    constructor(scene: Scene) {
        super(scene, "labJar");
        this.jarGroup = new TransformNode("jarGroup", scene);
        this.createJar();
    }

    createJar(): void {
        // Create glass material with improved transparency
        const glassMaterial = new PBRMaterial("glassMaterial", this.scene);
        glassMaterial.metallic = 0.0;
        glassMaterial.roughness = 0.15;
        glassMaterial.alpha = 0.3;
        glassMaterial.transparencyMode = PBRMaterial.MATERIAL_ALPHABLEND;
        glassMaterial.backFaceCulling = false;
        glassMaterial.clearCoat.isEnabled = true;
        glassMaterial.clearCoat.roughness = 0.1;
        glassMaterial.indexOfRefraction = 1.5;
        glassMaterial.subSurface.isRefractionEnabled = true;

        // Create jar wall (cylinder with no caps)
        const jarWall = MeshBuilder.CreateCylinder("jarWall", {
            height: 4,
            diameter: 4,
            tessellation: 32,
            cap: Mesh.NO_CAP
        }, this.scene);
        jarWall.material = glassMaterial;
        jarWall.parent = this.jarGroup;

        // Create jar bottom (separate disc)
        const bottom = MeshBuilder.CreateDisc("jarBottom", {
            radius: 2,
            tessellation: 32
        }, this.scene);
        bottom.rotation.x = Math.PI/2;
        bottom.position.y = -2;
        bottom.material = glassMaterial;
        bottom.parent = this.jarGroup;

        // Create thicker rim at the top
        const rimMaterial = new PBRMaterial("rimMaterial", this.scene);
        Object.assign(rimMaterial, {
            metallic: 0.1,
            roughness: 0.2,
            alpha: 0.4,
            transparencyMode: PBRMaterial.MATERIAL_ALPHABLEND,
            backFaceCulling: false
        });

        // Outer rim (thicker torus)
        const outerRim = MeshBuilder.CreateTorus("outerRim", {
            diameter: 4.2,
            thickness: 0.3,
            tessellation: 48
        }, this.scene);
        outerRim.position.y = 2;
        outerRim.material = rimMaterial;
        outerRim.parent = this.jarGroup;

        // Inner rim (smaller torus)
        const innerRim = MeshBuilder.CreateTorus("innerRim", {
            diameter: 3.8,
            thickness: 0.2,
            tessellation: 48
        }, this.scene);
        innerRim.position.y = 2;
        innerRim.material = rimMaterial;
        innerRim.parent = this.jarGroup;

        // Create subtle inner glow
        const glowMaterial = new StandardMaterial("glowMaterial", this.scene);
        glowMaterial.emissiveColor = new Color3(0.1, 0.1, 0.1);
        glowMaterial.alpha = 0.05;
        glowMaterial.backFaceCulling = false;

        const innerGlow = MeshBuilder.CreateCylinder("innerGlow", {
            height: 3.9,
            diameter: 3.9,
            tessellation: 32,
            cap: Mesh.NO_CAP
        }, this.scene);
        innerGlow.material = glowMaterial;
        innerGlow.parent = this.jarGroup;

        // Add subtle edge highlight at the top opening
        const edgeHighlight = MeshBuilder.CreateTorus("edgeHighlight", {
            diameter: 4.0,
            thickness: 0.05,
            tessellation: 48
        }, this.scene);
        edgeHighlight.position.y = 2;

        const highlightMaterial = new StandardMaterial("highlightMaterial", this.scene);
        highlightMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5);
        highlightMaterial.alpha = 0.3;
        edgeHighlight.material = highlightMaterial;
        edgeHighlight.parent = this.jarGroup;
    }

    getMesh(): TransformNode {
        return this.jarGroup;
    }

    dispose(): void {
        this.jarGroup.getChildMeshes().forEach(mesh => {
            if (mesh.material) {
                mesh.material.dispose();
            }
            mesh.dispose();
        });
        this.jarGroup.dispose();
    }
}
