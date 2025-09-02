/**
 * Advanced Materials System
 * Creates physically-based materials with realistic surface details and aging effects
 */

export class AdvancedMaterialsSystem {
    constructor(scene) {
        this.scene = scene;
        this.materials = new Map();
        this.textures = new Map();
        this.proceduralTextures = new Map();
        
        // Material configuration
        this.materialConfig = {
            stainlessSteel: {
                baseColor: [0.8, 0.8, 0.85],
                metallicFactor: 0.9,
                roughnessFactor: 0.1,
                clearCoat: { enabled: true, intensity: 0.5 },
                wearPatterns: ['fingerprints', 'scratches', 'waterSpots'],
                reflectance: 0.95
            },
            laboratoryGlass: {
                baseColor: [0.9, 0.95, 1.0],
                metallicFactor: 0.0,
                roughnessFactor: 0.0,
                alpha: 0.15,
                indexOfRefraction: 1.52,
                thickness: 0.005,
                wearPatterns: ['fingerprints', 'etching']
            },
            ceramicTile: {
                baseColor: [0.92, 0.92, 0.95],
                metallicFactor: 0.0,
                roughnessFactor: 0.3,
                clearCoat: { enabled: true, intensity: 0.8 },
                wearPatterns: ['grout', 'staining', 'chips'],
                tileSize: 0.3
            },
            plasticEquipment: {
                baseColor: [0.85, 0.85, 0.85],
                metallicFactor: 0.0,
                roughnessFactor: 0.4,
                wearPatterns: ['scratches', 'discoloration', 'wear'],
                flexibility: 0.2
            },
            rubber: {
                baseColor: [0.1, 0.1, 0.1],
                metallicFactor: 0.0,
                roughnessFactor: 0.9,
                wearPatterns: ['wear', 'cracking'],
                flexibility: 0.8
            },
            fabric: {
                baseColor: [0.6, 0.6, 0.65],
                metallicFactor: 0.0,
                roughnessFactor: 0.8,
                wearPatterns: ['pilling', 'staining', 'fading'],
                weavePattern: 'plain'
            },
            electronics: {
                baseColor: [0.1, 0.1, 0.1],
                metallicFactor: 0.3,
                roughnessFactor: 0.6,
                emissive: true,
                wearPatterns: ['dust', 'fingerprints']
            }
        };
        
        this.init();
    }

    /**
     * Initialize the advanced materials system
     */
    async init() {
        console.log('🎨 Initializing Advanced Materials System...');
        
        try {
            // Create all PBR materials
            await this.createPBRMaterials();
            
            // Generate surface textures
            await this.generateSurfaceTextures();
            
            // Apply wear patterns
            await this.applyWearPatterns();
            
            console.log('✅ Advanced Materials System initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Advanced Materials System:', error);
        }
    }

    /**
     * Create physically-based materials
     */
    async createPBRMaterials() {
        console.log('🔬 Creating PBR materials...');
        
        // Create stainless steel material
        await this.createStainlessSteelMaterial();
        
        // Create laboratory glass material
        await this.createLaboratoryGlassMaterial();
        
        // Create ceramic tile material
        await this.createCeramicTileMaterial();
        
        // Create plastic equipment material
        await this.createPlasticEquipmentMaterial();
        
        // Create rubber material
        await this.createRubberMaterial();
        
        // Create fabric material
        await this.createFabricMaterial();
        
        // Create electronics material
        await this.createElectronicsMaterial();
    }

    /**
     * Create stainless steel material with realistic properties
     */
    async createStainlessSteelMaterial() {
        const config = this.materialConfig.stainlessSteel;
        
        const material = new BABYLON.PBRMaterial("stainlessSteel", this.scene);
        material.baseColor = new BABYLON.Color3(...config.baseColor);
        material.metallicFactor = config.metallicFactor;
        material.roughnessFactor = config.roughnessFactor;
        
        // Enable clear coat for realistic finish
        material.clearCoat.isEnabled = config.clearCoat.enabled;
        material.clearCoat.intensity = config.clearCoat.intensity;
        
        // Create base texture with subtle grain
        const baseTexture = this.createMetalGrainTexture();
        material.baseTexture = baseTexture;
        
        // Create normal map for surface detail
        const normalTexture = this.createMetalNormalTexture();
        material.bumpTexture = normalTexture;
        
        // Create roughness map for wear patterns
        const roughnessTexture = this.createMetalRoughnessTexture();
        material.metallicTexture = roughnessTexture;
        
        this.materials.set('stainlessSteel', material);
        console.log('🔩 Stainless steel material created');
    }

    /**
     * Create laboratory glass material
     */
    async createLaboratoryGlassMaterial() {
        const config = this.materialConfig.laboratoryGlass;
        
        const material = new BABYLON.PBRMaterial("laboratoryGlass", this.scene);
        material.baseColor = new BABYLON.Color3(...config.baseColor);
        material.metallicFactor = config.metallicFactor;
        material.roughnessFactor = config.roughnessFactor;
        material.alpha = config.alpha;
        material.indexOfRefraction = config.indexOfRefraction;
        
        // Enable transmission for realistic glass
        material.subSurface.isTranslucencyEnabled = true;
        material.subSurface.translucencyIntensity = 0.8;
        material.subSurface.thickness = config.thickness;
        
        // Create subtle surface imperfections
        const glassTexture = this.createGlassTexture();
        material.bumpTexture = glassTexture;
        material.bumpTexture.level = 0.1;
        
        this.materials.set('laboratoryGlass', material);
        console.log('🧪 Laboratory glass material created');
    }

    /**
     * Create ceramic tile material
     */
    async createCeramicTileMaterial() {
        const config = this.materialConfig.ceramicTile;
        
        const material = new BABYLON.PBRMaterial("ceramicTile", this.scene);
        material.baseColor = new BABYLON.Color3(...config.baseColor);
        material.metallicFactor = config.metallicFactor;
        material.roughnessFactor = config.roughnessFactor;
        
        // Enable clear coat for glossy finish
        material.clearCoat.isEnabled = config.clearCoat.enabled;
        material.clearCoat.intensity = config.clearCoat.intensity;
        
        // Create tile pattern texture
        const tileTexture = this.createTilePatternTexture(config.tileSize);
        material.baseTexture = tileTexture;
        
        // Create grout normal map
        const groutNormal = this.createGroutNormalTexture(config.tileSize);
        material.bumpTexture = groutNormal;
        
        this.materials.set('ceramicTile', material);
        console.log('🏗️ Ceramic tile material created');
    }

    /**
     * Create plastic equipment material
     */
    async createPlasticEquipmentMaterial() {
        const config = this.materialConfig.plasticEquipment;
        
        const material = new BABYLON.PBRMaterial("plasticEquipment", this.scene);
        material.baseColor = new BABYLON.Color3(...config.baseColor);
        material.metallicFactor = config.metallicFactor;
        material.roughnessFactor = config.roughnessFactor;
        
        // Create plastic surface texture
        const plasticTexture = this.createPlasticTexture();
        material.baseTexture = plasticTexture;
        
        // Create wear pattern normal map
        const wearNormal = this.createPlasticWearTexture();
        material.bumpTexture = wearNormal;
        material.bumpTexture.level = 0.3;
        
        this.materials.set('plasticEquipment', material);
        console.log('🔧 Plastic equipment material created');
    }

    /**
     * Create rubber material
     */
    async createRubberMaterial() {
        const config = this.materialConfig.rubber;
        
        const material = new BABYLON.PBRMaterial("rubber", this.scene);
        material.baseColor = new BABYLON.Color3(...config.baseColor);
        material.metallicFactor = config.metallicFactor;
        material.roughnessFactor = config.roughnessFactor;
        
        // Create rubber texture with surface detail
        const rubberTexture = this.createRubberTexture();
        material.baseTexture = rubberTexture;
        
        // Create rubber normal map
        const rubberNormal = this.createRubberNormalTexture();
        material.bumpTexture = rubberNormal;
        material.bumpTexture.level = 0.5;
        
        this.materials.set('rubber', material);
        console.log('⚫ Rubber material created');
    }

    /**
     * Create fabric material
     */
    async createFabricMaterial() {
        const config = this.materialConfig.fabric;
        
        const material = new BABYLON.PBRMaterial("fabric", this.scene);
        material.baseColor = new BABYLON.Color3(...config.baseColor);
        material.metallicFactor = config.metallicFactor;
        material.roughnessFactor = config.roughnessFactor;
        
        // Create fabric weave texture
        const fabricTexture = this.createFabricWeaveTexture(config.weavePattern);
        material.baseTexture = fabricTexture;
        
        // Create fabric normal map
        const fabricNormal = this.createFabricNormalTexture(config.weavePattern);
        material.bumpTexture = fabricNormal;
        material.bumpTexture.level = 0.4;
        
        this.materials.set('fabric', material);
        console.log('🧵 Fabric material created');
    }

    /**
     * Create electronics material
     */
    async createElectronicsMaterial() {
        const config = this.materialConfig.electronics;
        
        const material = new BABYLON.PBRMaterial("electronics", this.scene);
        material.baseColor = new BABYLON.Color3(...config.baseColor);
        material.metallicFactor = config.metallicFactor;
        material.roughnessFactor = config.roughnessFactor;
        
        if (config.emissive) {
            material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
            material.emissiveIntensity = 0.2;
        }
        
        // Create electronics surface texture
        const electronicsTexture = this.createElectronicsTexture();
        material.baseTexture = electronicsTexture;
        
        this.materials.set('electronics', material);
        console.log('💻 Electronics material created');
    }

    /**
     * Generate surface textures procedurally
     */
    async generateSurfaceTextures() {
        console.log('🖼️ Generating surface textures...');
        
        // Generate textures for each material type
        await this.generateMetalTextures();
        await this.generateGlassTextures();
        await this.generateCeramicTextures();
        await this.generatePlasticTextures();
        await this.generateRubberTextures();
        await this.generateFabricTextures();
        await this.generateElectronicsTextures();
    }

    /**
     * Create metal grain texture
     */
    createMetalGrainTexture() {
        const texture = new BABYLON.DynamicTexture("metalGrain", {width: 512, height: 512}, this.scene);
        const context = texture.getContext();
        
        // Base metal color
        context.fillStyle = '#CCCCDD';
        context.fillRect(0, 0, 512, 512);
        
        // Add grain pattern
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3 + 1;
            const opacity = Math.random() * 0.3 + 0.1;
            
            context.fillStyle = `rgba(200, 200, 210, ${opacity})`;
            context.fillRect(x, y, size, size);
        }
        
        texture.update();
        this.textures.set('metalGrain', texture);
        return texture;
    }

    /**
     * Create metal normal texture
     */
    createMetalNormalTexture() {
        const texture = new BABYLON.DynamicTexture("metalNormal", {width: 512, height: 512}, this.scene);
        const context = texture.getContext();
        
        // Base normal color (neutral)
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 512, 512);
        
        // Add surface variations
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2 + 1;
            
            context.fillStyle = `rgb(${120 + Math.random() * 20}, ${120 + Math.random() * 20}, ${240 + Math.random() * 15})`;
            context.fillRect(x, y, size, size);
        }
        
        texture.update();
        this.textures.set('metalNormal', texture);
        return texture;
    }

    /**
     * Create metal roughness texture
     */
    createMetalRoughnessTexture() {
        const texture = new BABYLON.DynamicTexture("metalRoughness", {width: 512, height: 512}, this.scene);
        const context = texture.getContext();
        
        // Base roughness (low for metal)
        context.fillStyle = '#202020';
        context.fillRect(0, 0, 512, 512);
        
        // Add wear patterns
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const width = Math.random() * 20 + 5;
            const height = Math.random() * 3 + 1;
            const opacity = Math.random() * 0.5 + 0.2;
            
            context.fillStyle = `rgba(100, 100, 100, ${opacity})`;
            context.fillRect(x, y, width, height);
        }
        
        texture.update();
        this.textures.set('metalRoughness', texture);
        return texture;
    }

    /**
     * Create glass texture
     */
    createGlassTexture() {
        const texture = new BABYLON.DynamicTexture("glassTexture", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base glass normal
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 256, 256);
        
        // Add subtle imperfections
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 2 + 1;
            
            context.fillStyle = `rgb(${125 + Math.random() * 10}, ${125 + Math.random() * 10}, ${250 + Math.random() * 5})`;
            context.fillRect(x, y, size, size);
        }
        
        texture.update();
        this.textures.set('glassTexture', texture);
        return texture;
    }

    /**
     * Create tile pattern texture
     */
    createTilePatternTexture(tileSize) {
        const texture = new BABYLON.DynamicTexture("tilePattern", {width: 512, height: 512}, this.scene);
        const context = texture.getContext();
        
        const tileSizePx = tileSize * 512;
        const groutWidth = 4;
        
        // Base tile color
        context.fillStyle = '#EBEBF0';
        context.fillRect(0, 0, 512, 512);
        
        // Draw grout lines
        context.fillStyle = '#D0D0D5';
        context.lineWidth = groutWidth;
        
        // Vertical grout lines
        for (let x = 0; x < 512; x += tileSizePx) {
            context.fillRect(x, 0, groutWidth, 512);
        }
        
        // Horizontal grout lines
        for (let y = 0; y < 512; y += tileSizePx) {
            context.fillRect(0, y, 512, groutWidth);
        }
        
        // Add tile variations
        for (let x = 0; x < 512; x += tileSizePx) {
            for (let y = 0; y < 512; y += tileSizePx) {
                const variation = Math.random() * 20 - 10;
                const r = 235 + variation;
                const g = 235 + variation;
                const b = 240 + variation;
                
                context.fillStyle = `rgb(${Math.max(0, Math.min(255, r))}, ${Math.max(0, Math.min(255, g))}, ${Math.max(0, Math.min(255, b))})`;
                context.fillRect(x + groutWidth, y + groutWidth, tileSizePx - groutWidth * 2, tileSizePx - groutWidth * 2);
            }
        }
        
        texture.update();
        this.textures.set('tilePattern', texture);
        return texture;
    }

    /**
     * Create grout normal texture
     */
    createGroutNormalTexture(tileSize) {
        const texture = new BABYLON.DynamicTexture("groutNormal", {width: 512, height: 512}, this.scene);
        const context = texture.getContext();
        
        const tileSizePx = tileSize * 512;
        const groutWidth = 4;
        
        // Base normal color
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 512, 512);
        
        // Draw recessed grout lines
        context.fillStyle = '#6060DD';
        
        // Vertical grout lines
        for (let x = 0; x < 512; x += tileSizePx) {
            context.fillRect(x, 0, groutWidth, 512);
        }
        
        // Horizontal grout lines
        for (let y = 0; y < 512; y += tileSizePx) {
            context.fillRect(0, y, 512, groutWidth);
        }
        
        texture.update();
        this.textures.set('groutNormal', texture);
        return texture;
    }

    /**
     * Create plastic texture
     */
    createPlasticTexture() {
        const texture = new BABYLON.DynamicTexture("plasticTexture", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base plastic color
        context.fillStyle = '#D8D8D8';
        context.fillRect(0, 0, 256, 256);
        
        // Add subtle texture
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 2 + 1;
            const opacity = Math.random() * 0.1 + 0.05;
            
            context.fillStyle = `rgba(200, 200, 200, ${opacity})`;
            context.fillRect(x, y, size, size);
        }
        
        texture.update();
        this.textures.set('plasticTexture', texture);
        return texture;
    }

    /**
     * Create plastic wear texture
     */
    createPlasticWearTexture() {
        const texture = new BABYLON.DynamicTexture("plasticWear", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base normal
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 256, 256);
        
        // Add wear scratches
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const length = Math.random() * 20 + 5;
            const angle = Math.random() * Math.PI * 2;
            
            context.strokeStyle = `rgba(120, 120, 240, ${Math.random() * 0.3 + 0.1})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            context.stroke();
        }
        
        texture.update();
        this.textures.set('plasticWear', texture);
        return texture;
    }

    /**
     * Create rubber texture
     */
    createRubberTexture() {
        const texture = new BABYLON.DynamicTexture("rubberTexture", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base rubber color
        context.fillStyle = '#1A1A1A';
        context.fillRect(0, 0, 256, 256);
        
        // Add rubber texture pattern
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 1 + 0.5;
            const opacity = Math.random() * 0.2 + 0.1;
            
            context.fillStyle = `rgba(40, 40, 40, ${opacity})`;
            context.fillRect(x, y, size, size);
        }
        
        texture.update();
        this.textures.set('rubberTexture', texture);
        return texture;
    }

    /**
     * Create rubber normal texture
     */
    createRubberNormalTexture() {
        const texture = new BABYLON.DynamicTexture("rubberNormal", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base normal
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 256, 256);
        
        // Add rubber surface bumps
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 3 + 1;
            
            context.fillStyle = `rgb(${100 + Math.random() * 40}, ${100 + Math.random() * 40}, ${220 + Math.random() * 35})`;
            context.fillRect(x, y, size, size);
        }
        
        texture.update();
        this.textures.set('rubberNormal', texture);
        return texture;
    }

    /**
     * Create fabric weave texture
     */
    createFabricWeaveTexture(weavePattern) {
        const texture = new BABYLON.DynamicTexture("fabricWeave", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base fabric color
        context.fillStyle = '#999999';
        context.fillRect(0, 0, 256, 256);
        
        // Create weave pattern
        const threadSize = 4;
        for (let x = 0; x < 256; x += threadSize) {
            for (let y = 0; y < 256; y += threadSize) {
                const isWarp = (Math.floor(x / threadSize) + Math.floor(y / threadSize)) % 2 === 0;
                const color = isWarp ? '#AAAAAA' : '#888888';
                
                context.fillStyle = color;
                context.fillRect(x, y, threadSize, threadSize);
            }
        }
        
        texture.update();
        this.textures.set('fabricWeave', texture);
        return texture;
    }

    /**
     * Create fabric normal texture
     */
    createFabricNormalTexture(weavePattern) {
        const texture = new BABYLON.DynamicTexture("fabricNormal", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base normal
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 256, 256);
        
        // Create weave normal pattern
        const threadSize = 4;
        for (let x = 0; x < 256; x += threadSize) {
            for (let y = 0; y < 256; y += threadSize) {
                const isWarp = (Math.floor(x / threadSize) + Math.floor(y / threadSize)) % 2 === 0;
                const normalColor = isWarp ? '#9090FF' : '#7070EE';
                
                context.fillStyle = normalColor;
                context.fillRect(x, y, threadSize, threadSize);
            }
        }
        
        texture.update();
        this.textures.set('fabricNormal', texture);
        return texture;
    }

    /**
     * Create electronics texture
     */
    createElectronicsTexture() {
        const texture = new BABYLON.DynamicTexture("electronicsTexture", {width: 256, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Base electronics color
        context.fillStyle = '#1A1A1A';
        context.fillRect(0, 0, 256, 256);
        
        // Add circuit-like patterns
        context.strokeStyle = '#333333';
        context.lineWidth = 1;
        
        // Draw grid pattern
        for (let x = 0; x < 256; x += 16) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, 256);
            context.stroke();
        }
        
        for (let y = 0; y < 256; y += 16) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(256, y);
            context.stroke();
        }
        
        // Add component-like rectangles
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 200 + 28;
            const y = Math.random() * 200 + 28;
            const width = Math.random() * 20 + 10;
            const height = Math.random() * 10 + 5;
            
            context.fillStyle = '#2A2A2A';
            context.fillRect(x, y, width, height);
        }
        
        texture.update();
        this.textures.set('electronicsTexture', texture);
        return texture;
    }

    /**
     * Apply wear patterns to materials
     */
    async applyWearPatterns() {
        console.log('👴 Applying wear patterns...');
        
        // Apply wear patterns to each material type
        this.materials.forEach((material, materialName) => {
            const config = this.materialConfig[materialName];
            if (config && config.wearPatterns) {
                this.applyWearToMaterial(material, config.wearPatterns);
            }
        });
    }

    /**
     * Apply wear patterns to a specific material
     */
    applyWearToMaterial(material, wearPatterns) {
        wearPatterns.forEach(pattern => {
            switch (pattern) {
                case 'fingerprints':
                    this.addFingerprintWear(material);
                    break;
                case 'scratches':
                    this.addScratchWear(material);
                    break;
                case 'waterSpots':
                    this.addWaterSpotWear(material);
                    break;
                case 'staining':
                    this.addStainingWear(material);
                    break;
                case 'chips':
                    this.addChipWear(material);
                    break;
                case 'discoloration':
                    this.addDiscolorationWear(material);
                    break;
                case 'wear':
                    this.addGeneralWear(material);
                    break;
                case 'cracking':
                    this.addCrackingWear(material);
                    break;
                case 'pilling':
                    this.addPillingWear(material);
                    break;
                case 'fading':
                    this.addFadingWear(material);
                    break;
                case 'dust':
                    this.addDustWear(material);
                    break;
                case 'etching':
                    this.addEtchingWear(material);
                    break;
                case 'grout':
                    this.addGroutWear(material);
                    break;
            }
        });
    }

    /**
     * Add fingerprint wear patterns
     */
    addFingerprintWear(material) {
        // Slightly increase roughness in random spots to simulate fingerprints
        if (material.roughnessFactor !== undefined) {
            material.roughnessFactor = Math.min(1.0, material.roughnessFactor + 0.05);
        }
    }

    /**
     * Add scratch wear patterns
     */
    addScratchWear(material) {
        // Increase roughness slightly to simulate micro-scratches
        if (material.roughnessFactor !== undefined) {
            material.roughnessFactor = Math.min(1.0, material.roughnessFactor + 0.1);
        }
    }

    /**
     * Add water spot wear patterns
     */
    addWaterSpotWear(material) {
        // Create subtle variations in the base color
        if (material.baseColor) {
            const variation = 0.02;
            material.baseColor.r = Math.max(0, Math.min(1, material.baseColor.r - variation));
            material.baseColor.g = Math.max(0, Math.min(1, material.baseColor.g - variation));
            material.baseColor.b = Math.max(0, Math.min(1, material.baseColor.b - variation));
        }
    }

    /**
     * Add general wear patterns
     */
    addGeneralWear(material) {
        // General aging effect
        if (material.roughnessFactor !== undefined) {
            material.roughnessFactor = Math.min(1.0, material.roughnessFactor + 0.05);
        }
        
        if (material.baseColor) {
            const aging = 0.05;
            material.baseColor.r = Math.max(0, material.baseColor.r - aging);
            material.baseColor.g = Math.max(0, material.baseColor.g - aging);
            material.baseColor.b = Math.max(0, material.baseColor.b - aging);
        }
    }

    /**
     * Add staining wear patterns
     */
    addStainingWear(material) {
        if (material.baseColor) {
            const staining = 0.03;
            material.baseColor.r = Math.max(0, material.baseColor.r - staining);
            material.baseColor.g = Math.max(0, material.baseColor.g - staining * 0.5);
            material.baseColor.b = Math.max(0, material.baseColor.b - staining * 0.3);
        }
    }

    /**
     * Add chip wear patterns
     */
    addChipWear(material) {
        if (material.roughnessFactor !== undefined) {
            material.roughnessFactor = Math.min(1.0, material.roughnessFactor + 0.15);
        }
    }

    /**
     * Add discoloration wear patterns
     */
    addDiscolorationWear(material) {
        if (material.baseColor) {
            const yellowing = 0.02;
            material.baseColor.r = Math.min(1, material.baseColor.r + yellowing);
            material.baseColor.g = Math.min(1, material.baseColor.g + yellowing * 0.8);
        }
    }

    /**
     * Add cracking wear patterns
     */
    addCrackingWear(material) {
        if (material.roughnessFactor !== undefined) {
            material.roughnessFactor = Math.min(1.0, material.roughnessFactor + 0.2);
        }
    }

    /**
     * Add pilling wear patterns
     */
    addPillingWear(material) {
        if (material.roughnessFactor !== undefined) {
            material.roughnessFactor = Math.min(1.0, material.roughnessFactor + 0.1);
        }
    }

    /**
     * Add fading wear patterns
     */
    addFadingWear(material) {
        if (material.baseColor) {
            const fading = 0.1;
            material.baseColor.r = Math.max(0.3, material.baseColor.r - fading);
            material.baseColor.g = Math.max(0.3, material.baseColor.g - fading);
            material.baseColor.b = Math.max(0.3, material.baseColor.b - fading);
        }
    }

    /**
     * Add dust wear patterns
     */
    addDustWear(material) {
        if (material.baseColor) {
            const dust = 0.05;
            material.baseColor.r = Math.max(0, material.baseColor.r - dust);
            material.baseColor.g = Math.max(0, material.baseColor.g - dust);
            material.baseColor.b = Math.max(0, material.baseColor.b - dust);
        }
    }

    /**
     * Add etching wear patterns
     */
    addEtchingWear(material) {
        if (material.roughnessFactor !== undefined) {
            material.roughnessFactor = Math.min(1.0, material.roughnessFactor + 0.08);
        }
    }

    /**
     * Add grout wear patterns
     */
    addGroutWear(material) {
        if (material.baseColor) {
            const groutDarkening = 0.1;
            material.baseColor.r = Math.max(0, material.baseColor.r - groutDarkening);
            material.baseColor.g = Math.max(0, material.baseColor.g - groutDarkening);
            material.baseColor.b = Math.max(0, material.baseColor.b - groutDarkening);
        }
    }

    /**
     * Generate placeholder texture methods
     */
    async generateMetalTextures() {
        // Metal textures already created in createStainlessSteelMaterial
    }

    async generateGlassTextures() {
        // Glass textures already created in createLaboratoryGlassMaterial
    }

    async generateCeramicTextures() {
        // Ceramic textures already created in createCeramicTileMaterial
    }

    async generatePlasticTextures() {
        // Plastic textures already created in createPlasticEquipmentMaterial
    }

    async generateRubberTextures() {
        // Rubber textures already created in createRubberMaterial
    }

    async generateFabricTextures() {
        // Fabric textures already created in createFabricMaterial
    }

    async generateElectronicsTextures() {
        // Electronics textures already created in createElectronicsMaterial
    }

    /**
     * Get material by name
     */
    getMaterial(materialName) {
        return this.materials.get(materialName);
    }

    /**
     * Get texture by name
     */
    getTexture(textureName) {
        return this.textures.get(textureName);
    }

    /**
     * Update material properties dynamically
     */
    updateMaterialProperties(materialName, properties) {
        const material = this.materials.get(materialName);
        if (!material) return;
        
        Object.keys(properties).forEach(property => {
            if (material[property] !== undefined) {
                material[property] = properties[property];
            }
        });
        
        console.log(`🔄 Material ${materialName} properties updated`);
    }

    /**
     * Apply environmental effects to materials
     */
    applyEnvironmentalEffects() {
        // Apply humidity effects
        this.materials.forEach((material, name) => {
            if (name.includes('metal')) {
                // Slight oxidation effect
                if (material.baseColor) {
                    material.baseColor.r = Math.max(0, material.baseColor.r - 0.01);
                }
            }
        });
    }

    /**
     * Manage material level of detail
     */
    manageMaterialLOD() {
        // Simplified materials for distant objects
        // This would be implemented based on camera distance
        console.log('🔍 Managing material LOD...');
    }

    /**
     * Dispose of the materials system
     */
    dispose() {
        // Dispose all materials
        this.materials.forEach((material) => {
            if (material.dispose) {
                material.dispose();
            }
        });
        
        // Dispose all textures
        this.textures.forEach((texture) => {
            if (texture.dispose) {
                texture.dispose();
            }
        });
        
        // Clear all maps
        this.materials.clear();
        this.textures.clear();
        this.proceduralTextures.clear();
        
        console.log('🧹 Advanced Materials System disposed');
    }
}