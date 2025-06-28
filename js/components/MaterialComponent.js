import { ErrorDecorator, ResourceError } from '../core/ErrorDecorator.js';

/**
 * Component for managing and creating materials
 */
export class MaterialComponent {
    constructor(scene) {
        this.scene = scene;
        this.materials = new Map();
        this.type = 'material';
        
        // Wrap methods with error handling
        this.createMaterial = ErrorDecorator.wrapWithErrorHandler(
            this.createMaterial.bind(this),
            "MaterialComponent.createMaterial",
            { fallback: null }
        );
        
        this.createFleshMaterial = ErrorDecorator.wrapWithErrorHandler(
            this.createFleshMaterial.bind(this),
            "MaterialComponent.createFleshMaterial",
            { fallback: null }
        );
    }
    
    /**
     * Create a basic PBR material with default parameters
     * @param {string} name - Material name
     * @param {Object} options - Material configuration options
     * @returns {BABYLON.PBRMaterial} The created material
     */
    createMaterial(name, options = {}) {
        if (this.materials.has(name)) {
            return this.materials.get(name);
        }
        
        const material = new BABYLON.PBRMaterial(name, this.scene);
        
        // Apply options
        if (options.albedoColor) material.albedoColor = options.albedoColor;
        if (options.metallic !== undefined) material.metallic = options.metallic;
        if (options.roughness !== undefined) material.roughness = options.roughness;
        if (options.alpha !== undefined) material.alpha = options.alpha;
        
        if (options.alpha && options.alpha < 1.0) {
            material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
            material.backFaceCulling = false;
        }
        
        this.materials.set(name, material);
        return material;
    }
    
    /**
     * Create a specialized flesh material with subsurface scattering
     * @param {string} name - Material name
     * @param {Object} options - Configuration options
     * @returns {BABYLON.PBRMaterial} The created flesh material
     */
    createFleshMaterial(name, options = {}) {
        if (this.materials.has(name)) {
            return this.materials.get(name);
        }
        
        const material = new BABYLON.PBRMaterial(name, this.scene);
        
        // Default flesh options
        const defaults = {
            albedoColor: new BABYLON.Color3(0.8, 0.2, 0.2),
            roughness: 0.3,
            metallic: 0.0,
            subsurfaceIntensity: 0.8,
            subsurfaceRadius: 0.5,
            emissiveIntensity: 0.1
        };
        
        // Merge defaults with provided options
        const config = { ...defaults, ...options };
        
        // Apply basic properties
        material.albedoColor = config.albedoColor;
        material.roughness = config.roughness;
        material.metallic = config.metallic;
        material.alpha = config.alpha !== undefined ? config.alpha : 1.0;
        
        // Setup subsurface scattering if available in this version of Babylon.js
        if (material.subSurface) {
            material.subSurface.isTranslucencyEnabled = true;
            material.subSurface.translucencyIntensity = config.subsurfaceIntensity;
            
            if (config.subsurfaceRadius !== undefined) {
                material.subSurface.translucencyThickness = config.subsurfaceRadius;
            }
            
            if (config.subsurfaceColor) {
                material.subSurface.translucencyColor = config.subsurfaceColor;
            } else {
                // Default to a reddish color for flesh
                material.subSurface.translucencyColor = new BABYLON.Color3(1.0, 0.3, 0.3);
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
    }
    
    /**
     * Get a material by name
     * @param {string} name - Material name
     * @returns {BABYLON.Material} The material, or null if not found
     */
    getMaterial(name) {
        return this.materials.get(name) || null;
    }
    
    /**
     * Clean up all created materials
     */
    dispose() {
        this.materials.forEach(material => {
            material.dispose();
        });
        this.materials.clear();
    }
} 