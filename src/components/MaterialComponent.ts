import { Scene, PBRMaterial, Material, Color3 } from '@babylonjs/core';
import { ErrorDecorator } from '../core/ErrorDecorator.js';

export interface MaterialOptions {
    albedoColor?: Color3;
    metallic?: number;
    roughness?: number;
    alpha?: number;
}

export interface FleshMaterialOptions extends MaterialOptions {
    subsurfaceIntensity?: number;
    subsurfaceRadius?: number;
    subsurfaceColor?: Color3;
    emissiveIntensity?: number;
    emissiveColor?: Color3;
}

/**
 * Component for managing and creating materials
 */
export class MaterialComponent {
    scene: Scene;
    materials: Map<string, PBRMaterial>;
    type: string;

    constructor(scene: Scene) {
        this.scene = scene;
        this.materials = new Map();
        this.type = 'material';
    }

    /**
     * Create a basic PBR material with default parameters
     * @param name - Material name
     * @param options - Material configuration options
     * @returns The created material
     */
    createMaterial(name: string, options: MaterialOptions = {}): PBRMaterial | null {
        try {
            if (this.materials.has(name)) {
                return this.materials.get(name)!;
            }

            const material = new PBRMaterial(name, this.scene);

            // Apply options
            if (options.albedoColor) material.albedoColor = options.albedoColor;
            if (options.metallic !== undefined) material.metallic = options.metallic;
            if (options.roughness !== undefined) material.roughness = options.roughness;
            if (options.alpha !== undefined) material.alpha = options.alpha;

            if (options.alpha && options.alpha < 1.0) {
                material.transparencyMode = Material.MATERIAL_ALPHABLEND;
                material.backFaceCulling = false;
            }

            this.materials.set(name, material);
            return material;
        } catch (error) {
            console.error(`Error in MaterialComponent.createMaterial:`, (error as Error).message);
            ErrorDecorator.logError(error as Error, "MaterialComponent.createMaterial");
            return null;
        }
    }

    /**
     * Create a specialized flesh material with subsurface scattering
     * @param name - Material name
     * @param options - Configuration options
     * @returns The created flesh material
     */
    createFleshMaterial(name: string, options: FleshMaterialOptions = {}): PBRMaterial | null {
        try {
            if (this.materials.has(name)) {
                return this.materials.get(name)!;
            }

            const material = new PBRMaterial(name, this.scene);

            // Default flesh options
            const defaults: FleshMaterialOptions = {
                albedoColor: new Color3(0.8, 0.2, 0.2),
                roughness: 0.3,
                metallic: 0.0,
                subsurfaceIntensity: 0.8,
                subsurfaceRadius: 0.5,
                emissiveIntensity: 0.1
            };

            // Merge defaults with provided options
            const config = { ...defaults, ...options };

            // Apply basic properties
            material.albedoColor = config.albedoColor!;
            material.roughness = config.roughness!;
            material.metallic = config.metallic!;
            material.alpha = config.alpha !== undefined ? config.alpha : 1.0;

            // Setup subsurface scattering if available in this version of Babylon.js
            if (material.subSurface) {
                material.subSurface.isTranslucencyEnabled = true;
                material.subSurface.translucencyIntensity = config.subsurfaceIntensity!;

                if (config.subsurfaceColor) {
                    material.subSurface.translucencyColor = config.subsurfaceColor;
                } else {
                    // Default to a reddish color for flesh
                    material.subSurface.translucencyColor = new Color3(1.0, 0.3, 0.3);
                }
            }

            // Setup emissive properties for glow effect
            if (config.emissiveColor) {
                material.emissiveColor = config.emissiveColor;
                material.emissiveIntensity = config.emissiveIntensity || 0.1;
            }

            // Store the material
            this.materials.set(name, material);
            return material;
        } catch (error) {
            console.error(`Error in MaterialComponent.createFleshMaterial:`, (error as Error).message);
            ErrorDecorator.logError(error as Error, "MaterialComponent.createFleshMaterial");
            return null;
        }
    }

    /**
     * Get a material by name
     * @param name - Material name
     * @returns The material, or null if not found
     */
    getMaterial(name: string): PBRMaterial | null {
        return this.materials.get(name) || null;
    }

    /**
     * Clean up all created materials
     */
    dispose(): void {
        this.materials.forEach(material => {
            material.dispose();
        });
        this.materials.clear();
    }
}
