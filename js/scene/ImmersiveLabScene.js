/**
 * Immersive Laboratory Scene
 * Creates a highly detailed, realistic laboratory environment with advanced features
 */

export class ImmersiveLabScene {
    constructor(scene, sceneManager) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.labElements = new Map();
        this.materialLibrary = new Map();
        this.soundEffects = new Map();
        this.interactiveElements = new Map();
        
        // Advanced lab configuration
        this.config = {
            realism: 'high', // low, medium, high, ultra
            interactivity: true,
            soundEffects: true,
            dynamicLighting: true,
            weatherEffects: false,
            timeOfDay: 'day', // day, night, evening
            labType: 'research', // research, clinical, educational
            cleanliness: 'sterile' // messy, clean, sterile
        };
        
        this.init();
    }

    /**
     * Initialize the immersive laboratory scene
     */
    async init() {
        console.log('🔬 Creating Immersive Laboratory Scene...');
        
        try {
            // Create material library first
            await this.createMaterialLibrary();
            
            // Create detailed room with proper proportions
            await this.createDetailedRoom();
            
            // Add professional laboratory equipment
            await this.createProfessionalEquipment();
            
            // Create realistic lighting setup
            await this.createRealisticLighting();
            
            // Add safety equipment and signage
            await this.createSafetyEquipment();
            
            // Create atmospheric details
            await this.createAtmosphericDetails();
            
            // Add interactive laboratory features
            await this.createInteractiveLab();
            
            // Setup dynamic effects
            await this.setupDynamicEffects();
            
            console.log('✅ Immersive Laboratory Scene created successfully');
            
        } catch (error) {
            console.error('❌ Error creating immersive lab scene:', error);
        }
    }

    /**
     * Create comprehensive material library for realistic surfaces
     */
    async createMaterialLibrary() {
        console.log('🎨 Creating material library...');
        
        // Stainless steel material
        const stainlessSteel = new BABYLON.PBRMaterial("stainlessSteel", this.scene);
        stainlessSteel.baseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
        stainlessSteel.metallicFactor = 0.9;
        stainlessSteel.roughnessFactor = 0.1;
        stainlessSteel.clearCoat.isEnabled = true;
        stainlessSteel.clearCoat.intensity = 0.5;
        this.materialLibrary.set('stainlessSteel', stainlessSteel);
        
        // Laboratory glass material
        const labGlass = new BABYLON.PBRMaterial("labGlass", this.scene);
        labGlass.baseColor = new BABYLON.Color3(0.9, 0.95, 1.0);
        labGlass.metallicFactor = 0.0;
        labGlass.roughnessFactor = 0.0;
        labGlass.alpha = 0.15;
        labGlass.indexOfRefraction = 1.52;
        this.materialLibrary.set('labGlass', labGlass);
        
        // Ceramic tile material
        const ceramicTile = new BABYLON.PBRMaterial("ceramicTile", this.scene);
        ceramicTile.baseColor = new BABYLON.Color3(0.92, 0.92, 0.95);
        ceramicTile.metallicFactor = 0.0;
        ceramicTile.roughnessFactor = 0.3;
        ceramicTile.clearCoat.isEnabled = true;
        ceramicTile.clearCoat.intensity = 0.8;
        this.materialLibrary.set('ceramicTile', ceramicTile);
        
        // Rubber material for equipment feet
        const rubber = new BABYLON.PBRMaterial("rubber", this.scene);
        rubber.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        rubber.metallicFactor = 0.0;
        rubber.roughnessFactor = 0.9;
        this.materialLibrary.set('rubber', rubber);
        
        // Plastic material for equipment housings
        const plastic = new BABYLON.PBRMaterial("plastic", this.scene);
        plastic.baseColor = new BABYLON.Color3(0.85, 0.85, 0.85);
        plastic.metallicFactor = 0.0;
        plastic.roughnessFactor = 0.4;
        this.materialLibrary.set('plastic', plastic);
        
        // LED material for indicators
        const ledMaterial = new BABYLON.PBRMaterial("ledMaterial", this.scene);
        ledMaterial.baseColor = new BABYLON.Color3(0.2, 1.0, 0.2);
        ledMaterial.emissiveColor = new BABYLON.Color3(0.0, 0.8, 0.0);
        ledMaterial.emissiveIntensity = 2.0;
        this.materialLibrary.set('led', ledMaterial);
    } 
   /**
     * Create detailed room with proper laboratory proportions
     */
    async createDetailedRoom() {
        console.log('🏗️ Creating detailed laboratory room...');
        
        const roomWidth = 25;
        const roomHeight = 12;
        const roomDepth = 20;
        
        // Create floor with proper laboratory flooring
        const floor = BABYLON.MeshBuilder.CreateGround("labFloor", {
            width: roomWidth,
            height: roomDepth,
            subdivisions: 20
        }, this.scene);
        floor.material = this.materialLibrary.get('ceramicTile');
        floor.receiveShadows = true;
        
        // Add floor drain (common in labs)
        const drain = BABYLON.MeshBuilder.CreateCylinder("floorDrain", {
            height: 0.02,
            diameter: 0.3
        }, this.scene);
        drain.position.set(-8, 0.01, 6);
        drain.material = this.materialLibrary.get('stainlessSteel');
        
        // Create walls with proper laboratory finish
        await this.createDetailedWalls(roomWidth, roomHeight, roomDepth);
        
        // Create ceiling with integrated systems
        await this.createDetailedCeiling(roomWidth, roomHeight, roomDepth);
        
        // Add baseboards and trim
        await this.createRoomTrim(roomWidth, roomHeight, roomDepth);
        
        this.labElements.set('room', { floor, drain });
    }

    /**
     * Create detailed walls with laboratory features
     */
    async createDetailedWalls(width, height, depth) {
        const wallMaterial = this.materialLibrary.get('ceramicTile');
        
        // Back wall with windows
        const backWall = BABYLON.MeshBuilder.CreatePlane("backWall", {
            width: width,
            height: height
        }, this.scene);
        backWall.position.z = -depth / 2;
        backWall.material = wallMaterial;
        backWall.receiveShadows = true;
        
        // Add windows to back wall
        await this.createLabWindows(backWall);
        
        // Left wall with electrical panels
        const leftWall = BABYLON.MeshBuilder.CreatePlane("leftWall", {
            width: depth,
            height: height
        }, this.scene);
        leftWall.position.x = -width / 2;
        leftWall.rotation.y = Math.PI / 2;
        leftWall.material = wallMaterial;
        leftWall.receiveShadows = true;
        
        // Add electrical panel
        await this.createElectricalPanel(leftWall);
        
        // Right wall with emergency equipment
        const rightWall = BABYLON.MeshBuilder.CreatePlane("rightWall", {
            width: depth,
            height: height
        }, this.scene);
        rightWall.position.x = width / 2;
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.material = wallMaterial;
        rightWall.receiveShadows = true;
        
        // Add emergency shower and eyewash station
        await this.createEmergencyEquipment(rightWall);
        
        this.labElements.set('walls', [backWall, leftWall, rightWall]);
    }

    /**
     * Create laboratory windows with realistic glass and frames
     */
    async createLabWindows(wall) {
        const windowWidth = 3;
        const windowHeight = 2;
        const windowCount = 3;
        const spacing = 6;
        
        for (let i = 0; i < windowCount; i++) {
            const xOffset = -6 + i * spacing;
            
            // Window frame
            const frame = BABYLON.MeshBuilder.CreateBox(`windowFrame${i}`, {
                width: windowWidth + 0.2,
                height: windowHeight + 0.2,
                depth: 0.1
            }, this.scene);
            frame.position.set(xOffset, 3, -9.95);
            frame.material = this.materialLibrary.get('plastic');
            
            // Window glass
            const glass = BABYLON.MeshBuilder.CreatePlane(`windowGlass${i}`, {
                width: windowWidth,
                height: windowHeight
            }, this.scene);
            glass.position.set(xOffset, 3, -9.9);
            glass.material = this.materialLibrary.get('labGlass');
            
            // Window blinds (partially closed)
            const blinds = BABYLON.MeshBuilder.CreatePlane(`windowBlinds${i}`, {
                width: windowWidth,
                height: windowHeight * 0.7
            }, this.scene);
            blinds.position.set(xOffset, 3.15, -9.85);
            
            const blindsMaterial = new BABYLON.PBRMaterial(`blindsMaterial${i}`, this.scene);
            blindsMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.85);
            blindsMaterial.metallicFactor = 0.1;
            blindsMaterial.roughnessFactor = 0.8;
            blinds.material = blindsMaterial;
        }
    }

    /**
     * Create professional laboratory equipment
     */
    async createProfessionalEquipment() {
        console.log('⚗️ Creating professional laboratory equipment...');
        
        // Create autoclave
        await this.createAutoclave();
        
        // Create fume hood
        await this.createFumeHood();
        
        // Create centrifuge
        await this.createCentrifuge();
        
        // Create analytical balance
        await this.createAnalyticalBalance();
        
        // Create incubator
        await this.createIncubator();
        
        // Create pH meter
        await this.createPHMeter();
        
        // Create pipette station
        await this.createPipetteStation();
    }