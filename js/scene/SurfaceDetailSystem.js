/**
 * Surface Detail and Texture System
 * Generates dynamic textures for equipment wear patterns, aging effects, and realistic surface details
 */

export class SurfaceDetailSystem {
    constructor(scene, materialSystem) {
        this.scene = scene;
        this.materialSystem = materialSystem;
        this.detailTextures = new Map();
        this.proceduralTextures = new Map();
        this.wearPatterns = new Map();
        this.agingEffects = new Map();
        
        // Surface detail configuration
        this.detailConfig = {
            equipmentWear: {
                intensity: 0.3,
                patterns: ['scratches', 'fingerprints', 'scuffs', 'dents'],
                frequency: 0.1,
                scale: 1.0
            },
            floorDetails: {
                tileSize: 0.3,
                groutWidth: 0.005,
                wearAreas: ['highTraffic', 'corners', 'equipment'],
                staining: 0.2
            },
            wallFinishes: {
                paintType: 'semiGloss',
                mountingHoles: true,
                scuffMarks: 0.15,
                cleaningMarks: 0.1
            },
            agingParameters: {
                timeScale: 1.0,
                environmentalFactor: 0.5,
                usageFactor: 0.8,
                maintenanceLevel: 0.7
            }
        };
        
        this.init();
    }

    /**
     * Initialize the surface detail system
     */
    async init() {
        console.log('🎨 Initializing Surface Detail System...');
        
        try {
            // Generate equipment wear patterns
            await this.generateEquipmentWearPatterns();
            
            // Create floor detail textures
            await this.createFloorDetailTextures();
            
            // Generate wall finish textures
            await this.generateWallFinishTextures();
            
            // Create procedural aging effects
            await this.createProceduralAgingEffects();
            
            console.log('✅ Surface Detail System initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Surface Detail System:', error);
        }
    }

    /**
     * Generate equipment wear patterns
     */
    async generateEquipmentWearPatterns() {
        console.log('🔧 Generating equipment wear patterns...');
        
        // Create scratch patterns
        await this.createScratchPatterns();
        
        // Create fingerprint patterns
        await this.createFingerprintPatterns();
        
        // Create scuff patterns
        await this.createScuffPatterns();
        
        // Create dent patterns
        await this.createDentPatterns();
        
        // Create discoloration patterns
        await this.createDiscolorationPatterns();
    }

    /**
     * Create scratch patterns for equipment surfaces
     */
    async createScratchPatterns() {
        const scratchTexture = new BABYLON.DynamicTexture("scratchPattern", {width: 512, height: 512}, this.scene);
        const context = scratchTexture.getContext();
        
        // Clear background (neutral normal)
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 512, 512);
        
        // Generate random scratches
        for (let i = 0; i < 200; i++) {
            const startX = Math.random() * 512;
            const startY = Math.random() * 512;
            const length = Math.random() * 100 + 20;
            const angle = Math.random() * Math.PI * 2;
            const width = Math.random() * 2 + 0.5;
            const intensity = Math.random() * 0.3 + 0.1;
            
            context.strokeStyle = `rgba(120, 120, 200, ${intensity})`;
            context.lineWidth = width;
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(
                startX + Math.cos(angle) * length,
                startY + Math.sin(angle) * length
            );
            context.stroke();
        }
        
        // Add micro-scratches
        for (let i = 0; i < 500; i++) {
            const startX = Math.random() * 512;
            const startY = Math.random() * 512;
            const length = Math.random() * 20 + 5;
            const angle = Math.random() * Math.PI * 2;
            const intensity = Math.random() * 0.15 + 0.05;
            
            context.strokeStyle = `rgba(130, 130, 220, ${intensity})`;
            context.lineWidth = 0.5;
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(
                startX + Math.cos(angle) * length,
                startY + Math.sin(angle) * length
            );
            context.stroke();
        }
        
        scratchTexture.update();
        this.detailTextures.set('scratchPattern', scratchTexture);
    }

    /**
     * Create fingerprint patterns
     */
    async createFingerprintPatterns() {
        const fingerprintTexture = new BABYLON.DynamicTexture("fingerprintPattern", {width: 256, height: 256}, this.scene);
        const context = fingerprintTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 256, 256);
        
        // Generate fingerprint-like patterns
        for (let i = 0; i < 50; i++) {
            const centerX = Math.random() * 256;
            const centerY = Math.random() * 256;
            const radius = Math.random() * 30 + 10;
            const opacity = Math.random() * 0.1 + 0.05;
            
            // Create elliptical fingerprint pattern
            context.strokeStyle = `rgba(200, 200, 200, ${opacity})`;
            context.lineWidth = 1;
            
            for (let r = 5; r < radius; r += 3) {
                context.beginPath();
                context.ellipse(centerX, centerY, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
                context.stroke();
            }
        }
        
        // Add smudge effects
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 20 + 10;
            const opacity = Math.random() * 0.08 + 0.02;
            
            context.fillStyle = `rgba(180, 180, 180, ${opacity})`;
            context.beginPath();
            context.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
            context.fill();
        }
        
        fingerprintTexture.update();
        this.detailTextures.set('fingerprintPattern', fingerprintTexture);
    }

    /**
     * Create scuff patterns
     */
    async createScuffPatterns() {
        const scuffTexture = new BABYLON.DynamicTexture("scuffPattern", {width: 256, height: 256}, this.scene);
        const context = scuffTexture.getContext();
        
        // Clear background
        context.fillStyle = '#F0F0F0';
        context.fillRect(0, 0, 256, 256);
        
        // Generate scuff marks
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const width = Math.random() * 40 + 20;
            const height = Math.random() * 10 + 5;
            const opacity = Math.random() * 0.2 + 0.1;
            
            context.fillStyle = `rgba(150, 150, 150, ${opacity})`;
            context.save();
            context.translate(x, y);
            context.rotate(Math.random() * Math.PI);
            context.fillRect(-width/2, -height/2, width, height);
            context.restore();
        }
        
        // Add rubber marks
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const length = Math.random() * 60 + 30;
            const opacity = Math.random() * 0.15 + 0.05;
            
            context.strokeStyle = `rgba(100, 100, 100, ${opacity})`;
            context.lineWidth = Math.random() * 8 + 3;
            context.lineCap = 'round';
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + length, y + (Math.random() - 0.5) * 20);
            context.stroke();
        }
        
        scuffTexture.update();
        this.detailTextures.set('scuffPattern', scuffTexture);
    }

    /**
     * Create dent patterns
     */
    async createDentPatterns() {
        const dentTexture = new BABYLON.DynamicTexture("dentPattern", {width: 256, height: 256}, this.scene);
        const context = dentTexture.getContext();
        
        // Clear background (neutral normal)
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 256, 256);
        
        // Generate dent normal patterns
        for (let i = 0; i < 20; i++) {
            const centerX = Math.random() * 256;
            const centerY = Math.random() * 256;
            const radius = Math.random() * 15 + 5;
            const depth = Math.random() * 0.3 + 0.1;
            
            // Create radial gradient for dent normal
            const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, `rgba(128, 128, ${255 - depth * 100}, 1)`);
            gradient.addColorStop(0.7, `rgba(128, 128, ${255 - depth * 50}, 1)`);
            gradient.addColorStop(1, '#8080FF');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2);
            context.fill();
        }
        
        dentTexture.update();
        this.detailTextures.set('dentPattern', dentTexture);
    }

    /**
     * Create discoloration patterns
     */
    async createDiscolorationPatterns() {
        const discolorationTexture = new BABYLON.DynamicTexture("discolorationPattern", {width: 512, height: 512}, this.scene);
        const context = discolorationTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 512, 512);
        
        // Generate yellowing/browning patterns
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 80 + 40;
            const intensity = Math.random() * 0.15 + 0.05;
            
            const gradient = context.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(255, 240, 200, ${intensity})`);
            gradient.addColorStop(0.6, `rgba(255, 245, 220, ${intensity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Add staining patterns
        for (let i = 0; i < 25; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const width = Math.random() * 60 + 20;
            const height = Math.random() * 30 + 10;
            const opacity = Math.random() * 0.1 + 0.03;
            
            context.fillStyle = `rgba(220, 200, 180, ${opacity})`;
            context.save();
            context.translate(x, y);
            context.rotate(Math.random() * Math.PI);
            context.fillRect(-width/2, -height/2, width, height);
            context.restore();
        }
        
        discolorationTexture.update();
        this.detailTextures.set('discolorationPattern', discolorationTexture);
    }

    /**
     * Create floor detail textures
     */
    async createFloorDetailTextures() {
        console.log('🏗️ Creating floor detail textures...');
        
        // Create realistic tile patterns
        await this.createRealisticTilePattern();
        
        // Create high-traffic wear patterns
        await this.createHighTrafficWear();
        
        // Create floor staining patterns
        await this.createFloorStaining();
    }

    /**
     * Create realistic tile pattern with variations
     */
    async createRealisticTilePattern() {
        const config = this.detailConfig.floorDetails;
        const tileTexture = new BABYLON.DynamicTexture("realisticTilePattern", {width: 1024, height: 1024}, this.scene);
        const context = tileTexture.getContext();
        
        const tileSizePx = config.tileSize * 1024;
        const groutWidthPx = config.groutWidth * 1024;
        
        // Base tile color
        context.fillStyle = '#EBEBF0';
        context.fillRect(0, 0, 1024, 1024);
        
        // Draw grout lines with realistic color
        context.fillStyle = '#C8C8CD';
        
        // Vertical grout lines
        for (let x = 0; x < 1024; x += tileSizePx) {
            context.fillRect(x, 0, groutWidthPx, 1024);
        }
        
        // Horizontal grout lines
        for (let y = 0; y < 1024; y += tileSizePx) {
            context.fillRect(0, y, 1024, groutWidthPx);
        }
        
        // Add individual tile variations
        for (let x = 0; x < 1024; x += tileSizePx) {
            for (let y = 0; y < 1024; y += tileSizePx) {
                // Color variation
                const colorVar = (Math.random() - 0.5) * 30;
                const r = Math.max(0, Math.min(255, 235 + colorVar));
                const g = Math.max(0, Math.min(255, 235 + colorVar));
                const b = Math.max(0, Math.min(255, 240 + colorVar));
                
                context.fillStyle = `rgb(${r}, ${g}, ${b})`;
                context.fillRect(
                    x + groutWidthPx,
                    y + groutWidthPx,
                    tileSizePx - groutWidthPx * 2,
                    tileSizePx - groutWidthPx * 2
                );
                
                // Add subtle tile texture
                for (let i = 0; i < 20; i++) {
                    const tileX = x + groutWidthPx + Math.random() * (tileSizePx - groutWidthPx * 2);
                    const tileY = y + groutWidthPx + Math.random() * (tileSizePx - groutWidthPx * 2);
                    const size = Math.random() * 3 + 1;
                    const opacity = Math.random() * 0.1 + 0.05;
                    
                    context.fillStyle = `rgba(220, 220, 225, ${opacity})`;
                    context.fillRect(tileX, tileY, size, size);
                }
            }
        }
        
        // Add grout darkening and wear
        context.fillStyle = 'rgba(180, 180, 185, 0.3)';
        for (let x = 0; x < 1024; x += tileSizePx) {
            for (let y = 0; y < 1024; y += tileSizePx) {
                if (Math.random() < 0.3) {
                    // Darken some grout intersections
                    context.fillRect(x, y, groutWidthPx * 2, groutWidthPx * 2);
                }
            }
        }
        
        tileTexture.update();
        this.detailTextures.set('realisticTilePattern', tileTexture);
    }

    /**
     * Create high-traffic wear patterns
     */
    async createHighTrafficWear() {
        const wearTexture = new BABYLON.DynamicTexture("highTrafficWear", {width: 512, height: 512}, this.scene);
        const context = wearTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 512, 512);
        
        // Create wear paths
        const wearPaths = [
            { startX: 0, startY: 256, endX: 512, endY: 256, width: 80 }, // Horizontal path
            { startX: 256, startY: 0, endX: 256, endY: 512, width: 60 }, // Vertical path
            { startX: 100, startY: 100, endX: 400, endY: 400, width: 50 } // Diagonal path
        ];
        
        wearPaths.forEach(path => {
            const gradient = context.createLinearGradient(
                path.startX, path.startY - path.width/2,
                path.startX, path.startY + path.width/2
            );
            gradient.addColorStop(0, 'rgba(200, 200, 200, 0)');
            gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.2)');
            gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
            
            context.strokeStyle = gradient;
            context.lineWidth = path.width;
            context.lineCap = 'round';
            context.beginPath();
            context.moveTo(path.startX, path.startY);
            context.lineTo(path.endX, path.endY);
            context.stroke();
        });
        
        // Add equipment wear spots
        const equipmentSpots = [
            { x: 150, y: 150, radius: 40 },
            { x: 350, y: 200, radius: 35 },
            { x: 200, y: 350, radius: 45 }
        ];
        
        equipmentSpots.forEach(spot => {
            const gradient = context.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.radius);
            gradient.addColorStop(0, 'rgba(180, 180, 180, 0.3)');
            gradient.addColorStop(0.7, 'rgba(190, 190, 190, 0.15)');
            gradient.addColorStop(1, 'rgba(200, 200, 200, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(spot.x, spot.y, spot.radius, 0, Math.PI * 2);
            context.fill();
        });
        
        wearTexture.update();
        this.detailTextures.set('highTrafficWear', wearTexture);
    }

    /**
     * Create floor staining patterns
     */
    async createFloorStaining() {
        const stainTexture = new BABYLON.DynamicTexture("floorStaining", {width: 512, height: 512}, this.scene);
        const context = stainTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 512, 512);
        
        // Add various stain types
        const stainTypes = [
            { color: 'rgba(220, 200, 180, 0.15)', count: 15, sizeRange: [20, 60] }, // General staining
            { color: 'rgba(200, 180, 160, 0.1)', count: 25, sizeRange: [10, 30] }, // Light stains
            { color: 'rgba(180, 160, 140, 0.08)', count: 40, sizeRange: [5, 20] }  // Micro stains
        ];
        
        stainTypes.forEach(stainType => {
            for (let i = 0; i < stainType.count; i++) {
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const size = Math.random() * (stainType.sizeRange[1] - stainType.sizeRange[0]) + stainType.sizeRange[0];
                
                const gradient = context.createRadialGradient(x, y, 0, x, y, size);
                gradient.addColorStop(0, stainType.color);
                gradient.addColorStop(0.6, stainType.color.replace(/[\d\.]+\)$/g, (opacity) => (parseFloat(opacity) * 0.5) + ')'));
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                context.fillStyle = gradient;
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }
        });
        
        stainTexture.update();
        this.detailTextures.set('floorStaining', stainTexture);
    }

    /**
     * Generate wall finish textures
     */
    async generateWallFinishTextures() {
        console.log('🏠 Generating wall finish textures...');
        
        // Create paint finish texture
        await this.createPaintFinishTexture();
        
        // Create mounting hole patterns
        await this.createMountingHolePatterns();
        
        // Create wall scuff marks
        await this.createWallScuffMarks();
    }

    /**
     * Create paint finish texture
     */
    async createPaintFinishTexture() {
        const paintTexture = new BABYLON.DynamicTexture("paintFinish", {width: 512, height: 512}, this.scene);
        const context = paintTexture.getContext();
        
        // Base paint color
        context.fillStyle = '#F2F2F5';
        context.fillRect(0, 0, 512, 512);
        
        // Add paint texture (semi-gloss finish)
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2 + 0.5;
            const opacity = Math.random() * 0.05 + 0.02;
            
            context.fillStyle = `rgba(240, 240, 245, ${opacity})`;
            context.fillRect(x, y, size, size);
        }
        
        // Add subtle brush marks
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const length = Math.random() * 30 + 10;
            const angle = Math.random() * Math.PI / 4; // Mostly horizontal
            const opacity = Math.random() * 0.03 + 0.01;
            
            context.strokeStyle = `rgba(235, 235, 240, ${opacity})`;
            context.lineWidth = Math.random() * 2 + 1;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            context.stroke();
        }
        
        paintTexture.update();
        this.detailTextures.set('paintFinish', paintTexture);
    }

    /**
     * Create mounting hole patterns
     */
    async createMountingHolePatterns() {
        const holeTexture = new BABYLON.DynamicTexture("mountingHoles", {width: 512, height: 512}, this.scene);
        const context = holeTexture.getContext();
        
        // Clear background (neutral normal)
        context.fillStyle = '#8080FF';
        context.fillRect(0, 0, 512, 512);
        
        // Add mounting holes
        const holes = [
            { x: 100, y: 150, size: 3 },
            { x: 400, y: 150, size: 3 },
            { x: 250, y: 300, size: 4 },
            { x: 150, y: 400, size: 2 },
            { x: 350, y: 380, size: 2 }
        ];
        
        holes.forEach(hole => {
            // Create hole depression
            const gradient = context.createRadialGradient(hole.x, hole.y, 0, hole.x, hole.y, hole.size * 2);
            gradient.addColorStop(0, 'rgba(100, 100, 200, 1)');
            gradient.addColorStop(0.5, 'rgba(120, 120, 220, 1)');
            gradient.addColorStop(1, '#8080FF');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(hole.x, hole.y, hole.size * 2, 0, Math.PI * 2);
            context.fill();
            
            // Add hole center
            context.fillStyle = 'rgba(80, 80, 180, 1)';
            context.beginPath();
            context.arc(hole.x, hole.y, hole.size, 0, Math.PI * 2);
            context.fill();
        });
        
        holeTexture.update();
        this.detailTextures.set('mountingHoles', holeTexture);
    }

    /**
     * Create wall scuff marks
     */
    async createWallScuffMarks() {
        const scuffTexture = new BABYLON.DynamicTexture("wallScuffs", {width: 512, height: 512}, this.scene);
        const context = scuffTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 512, 512);
        
        // Add scuff marks at typical heights
        const scuffHeights = [100, 200, 300]; // Different heights for different causes
        
        scuffHeights.forEach((height, index) => {
            const scuffCount = 8 - index * 2; // Fewer scuffs at higher levels
            
            for (let i = 0; i < scuffCount; i++) {
                const x = Math.random() * 512;
                const y = height + (Math.random() - 0.5) * 40;
                const width = Math.random() * 50 + 20;
                const heightVar = Math.random() * 15 + 5;
                const opacity = Math.random() * 0.1 + 0.05;
                
                context.fillStyle = `rgba(200, 200, 200, ${opacity})`;
                context.save();
                context.translate(x, y);
                context.rotate((Math.random() - 0.5) * 0.3);
                context.fillRect(-width/2, -heightVar/2, width, heightVar);
                context.restore();
            }
        });
        
        // Add cleaning marks (vertical streaks)
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 300 + 100;
            const height = Math.random() * 80 + 40;
            const opacity = Math.random() * 0.05 + 0.02;
            
            context.strokeStyle = `rgba(220, 220, 220, ${opacity})`;
            context.lineWidth = Math.random() * 8 + 3;
            context.lineCap = 'round';
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + (Math.random() - 0.5) * 10, y + height);
            context.stroke();
        }
        
        scuffTexture.update();
        this.detailTextures.set('wallScuffs', scuffTexture);
    }

    /**
     * Create procedural aging effects
     */
    async createProceduralAgingEffects() {
        console.log('⏰ Creating procedural aging effects...');
        
        // Create time-based aging
        await this.createTimeBasedAging();
        
        // Create usage-based wear
        await this.createUsageBasedWear();
        
        // Create environmental aging
        await this.createEnvironmentalAging();
    }

    /**
     * Create time-based aging effects
     */
    async createTimeBasedAging() {
        const agingTexture = new BABYLON.DynamicTexture("timeBasedAging", {width: 256, height: 256}, this.scene);
        const context = agingTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 256, 256);
        
        const ageIntensity = this.detailConfig.agingParameters.timeScale;
        
        // Add general aging discoloration
        for (let i = 0; i < 30 * ageIntensity; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 40 + 20;
            const opacity = Math.random() * 0.08 * ageIntensity + 0.02;
            
            const gradient = context.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(245, 235, 220, ${opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        agingTexture.update();
        this.agingEffects.set('timeBasedAging', agingTexture);
    }

    /**
     * Create usage-based wear effects
     */
    async createUsageBasedWear() {
        const usageTexture = new BABYLON.DynamicTexture("usageBasedWear", {width: 256, height: 256}, this.scene);
        const context = usageTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 256, 256);
        
        const usageIntensity = this.detailConfig.agingParameters.usageFactor;
        
        // Add wear patterns based on usage
        for (let i = 0; i < 20 * usageIntensity; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const width = Math.random() * 30 + 10;
            const height = Math.random() * 15 + 5;
            const opacity = Math.random() * 0.12 * usageIntensity + 0.03;
            
            context.fillStyle = `rgba(200, 200, 200, ${opacity})`;
            context.save();
            context.translate(x, y);
            context.rotate(Math.random() * Math.PI);
            context.fillRect(-width/2, -height/2, width, height);
            context.restore();
        }
        
        usageTexture.update();
        this.agingEffects.set('usageBasedWear', usageTexture);
    }

    /**
     * Create environmental aging effects
     */
    async createEnvironmentalAging() {
        const envTexture = new BABYLON.DynamicTexture("environmentalAging", {width: 256, height: 256}, this.scene);
        const context = envTexture.getContext();
        
        // Clear background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, 256, 256);
        
        const envFactor = this.detailConfig.agingParameters.environmentalFactor;
        
        // Add environmental effects (humidity, temperature, etc.)
        for (let i = 0; i < 25 * envFactor; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 25 + 15;
            const opacity = Math.random() * 0.06 * envFactor + 0.02;
            
            // Simulate oxidation/corrosion patterns
            const gradient = context.createRadialGradient(x, y, 0, x, y, size);
            gradient.addColorStop(0, `rgba(220, 200, 180, ${opacity})`);
            gradient.addColorStop(0.7, `rgba(230, 220, 200, ${opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, size, 0, Math.PI * 2);
            context.fill();
        }
        
        envTexture.update();
        this.agingEffects.set('environmentalAging', envTexture);
    }

    /**
     * Apply surface details to a material
     */
    applySurfaceDetails(material, detailTypes) {
        if (!material || !detailTypes) return;
        
        detailTypes.forEach(detailType => {
            const detailTexture = this.detailTextures.get(detailType);
            if (detailTexture) {
                // Apply detail texture based on type
                switch (detailType) {
                    case 'scratchPattern':
                    case 'dentPattern':
                        if (!material.bumpTexture) {
                            material.bumpTexture = detailTexture;
                            material.bumpTexture.level = 0.3;
                        }
                        break;
                    case 'fingerprintPattern':
                    case 'discolorationPattern':
                        if (!material.baseTexture) {
                            material.baseTexture = detailTexture;
                        }
                        break;
                    case 'realisticTilePattern':
                        material.baseTexture = detailTexture;
                        break;
                }
            }
        });
        
        console.log(`🎨 Applied surface details: ${detailTypes.join(', ')}`);
    }

    /**
     * Update aging effects over time
     */
    updateAgingEffects(deltaTime) {
        const timeScale = this.detailConfig.agingParameters.timeScale;
        const agingRate = deltaTime * timeScale * 0.001; // Very slow aging
        
        // Update aging parameters
        this.detailConfig.agingParameters.environmentalFactor = Math.min(1.0, 
            this.detailConfig.agingParameters.environmentalFactor + agingRate * 0.1);
        
        this.detailConfig.agingParameters.usageFactor = Math.min(1.0,
            this.detailConfig.agingParameters.usageFactor + agingRate * 0.05);
    }

    /**
     * Get detail texture by name
     */
    getDetailTexture(textureName) {
        return this.detailTextures.get(textureName);
    }

    /**
     * Get aging effect by name
     */
    getAgingEffect(effectName) {
        return this.agingEffects.get(effectName);
    }

    /**
     * Dispose of the surface detail system
     */
    dispose() {
        // Dispose all detail textures
        this.detailTextures.forEach((texture) => {
            if (texture.dispose) {
                texture.dispose();
            }
        });
        
        // Dispose all aging effects
        this.agingEffects.forEach((texture) => {
            if (texture.dispose) {
                texture.dispose();
            }
        });
        
        // Dispose procedural textures
        this.proceduralTextures.forEach((texture) => {
            if (texture.dispose) {
                texture.dispose();
            }
        });
        
        // Clear all maps
        this.detailTextures.clear();
        this.agingEffects.clear();
        this.proceduralTextures.clear();
        this.wearPatterns.clear();
        
        console.log('🧹 Surface Detail System disposed');
    }
}