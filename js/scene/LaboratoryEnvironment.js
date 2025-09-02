/**
 * Laboratory Environment System
 * Creates an immersive, realistic laboratory setting for the Heart in a Jar simulation
 */

export class LaboratoryEnvironment {
    constructor(scene, sceneManager) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.labObjects = new Map();
        this.lighting = null;
        this.materials = new Map();
        this.animations = new Map();
        this.ambientSounds = new Map();
        
        // Lab configuration
        this.config = {
            roomSize: { width: 20, height: 12, depth: 15 },
            lighting: {
                overhead: { intensity: 0.8, color: new BABYLON.Color3(0.95, 0.95, 1.0) },
                ambient: { intensity: 0.3, color: new BABYLON.Color3(0.4, 0.4, 0.5) },
                task: { intensity: 1.2, color: new BABYLON.Color3(1.0, 0.98, 0.95) }
            },
            atmosphere: {
                fogDensity: 0.02,
                fogColor: new BABYLON.Color3(0.9, 0.9, 0.95),
                particleDensity: 0.1
            }
        };
        
        this.init();
    }

    /**
     * Initialize the laboratory environment
     */
    async init() {
        console.log('🔬 Initializing Laboratory Environment...');
        
        try {
            // Create basic room structure
            await this.createRoomStructure();
            
            // Add laboratory furniture and equipment
            await this.createLabFurniture();
            
            // Setup advanced lighting system
            await this.setupLaboratoryLighting();
            
            // Add atmospheric effects
            await this.createAtmosphericEffects();
            
            // Add interactive elements
            await this.createInteractiveElements();
            
            // Setup ambient sounds and effects
            await this.setupAmbientEffects();
            
            console.log('✅ Laboratory Environment initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing laboratory environment:', error);
        }
    }
}    /**

     * Create the basic room structure (walls, floor, ceiling)
     */
    async createRoomStructure() {
        console.log('🏗️ Creating room structure...');
        
        const { width, height, depth } = this.config.roomSize;
        
        // Create floor
        const floor = BABYLON.MeshBuilder.CreateGround("labFloor", {
            width: width,
            height: depth
        }, this.scene);
        
        // Create lab floor material with realistic tiles
        const floorMaterial = new BABYLON.PBRMaterial("floorMaterial", this.scene);
        floorMaterial.baseColor = new BABYLON.Color3(0.85, 0.85, 0.9);
        floorMaterial.metallicFactor = 0.1;
        floorMaterial.roughnessFactor = 0.8;
        
        // Add tile pattern using UV mapping
        const floorTexture = new BABYLON.DynamicTexture("floorTexture", {width: 512, height: 512}, this.scene);
        const context = floorTexture.getContext();
        
        // Draw tile pattern
        context.fillStyle = '#D8D8DC';
        context.fillRect(0, 0, 512, 512);
        context.strokeStyle = '#C0C0C5';
        context.lineWidth = 2;
        
        // Draw grid lines for tiles
        for (let i = 0; i <= 8; i++) {
            const pos = (i / 8) * 512;
            context.beginPath();
            context.moveTo(pos, 0);
            context.lineTo(pos, 512);
            context.stroke();
            
            context.beginPath();
            context.moveTo(0, pos);
            context.lineTo(512, pos);
            context.stroke();
        }
        
        floorTexture.update();
        floorMaterial.baseTexture = floorTexture;
        floor.material = floorMaterial;
        floor.receiveShadows = true;
        
        this.labObjects.set('floor', floor);
        
        // Create walls
        await this.createWalls(width, height, depth);
        
        // Create ceiling
        await this.createCeiling(width, height, depth);
    }  
  /**
     * Create laboratory walls with realistic materials
     */
    async createWalls(width, height, depth) {
        // Wall material - clean laboratory white with slight texture
        const wallMaterial = new BABYLON.PBRMaterial("wallMaterial", this.scene);
        wallMaterial.baseColor = new BABYLON.Color3(0.95, 0.95, 0.98);
        wallMaterial.metallicFactor = 0.0;
        wallMaterial.roughnessFactor = 0.7;
        
        // Create wall texture with subtle pattern
        const wallTexture = new BABYLON.DynamicTexture("wallTexture", {width: 256, height: 256}, this.scene);
        const wallContext = wallTexture.getContext();
        wallContext.fillStyle = '#F2F2F5';
        wallContext.fillRect(0, 0, 256, 256);
        
        // Add subtle texture pattern
        wallContext.fillStyle = '#EEEEEF';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            wallContext.fillRect(x, y, 2, 2);
        }
        
        wallTexture.update();
        wallMaterial.baseTexture = wallTexture;
        
        // Back wall
        const backWall = BABYLON.MeshBuilder.CreatePlane("backWall", {
            width: width,
            height: height
        }, this.scene);
        backWall.position.z = -depth / 2;
        backWall.material = wallMaterial;
        backWall.receiveShadows = true;
        
        // Left wall
        const leftWall = BABYLON.MeshBuilder.CreatePlane("leftWall", {
            width: depth,
            height: height
        }, this.scene);
        leftWall.position.x = -width / 2;
        leftWall.rotation.y = Math.PI / 2;
        leftWall.material = wallMaterial;
        leftWall.receiveShadows = true;
        
        // Right wall
        const rightWall = BABYLON.MeshBuilder.CreatePlane("rightWall", {
            width: depth,
            height: height
        }, this.scene);
        rightWall.position.x = width / 2;
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.material = wallMaterial;
        rightWall.receiveShadows = true;
        
        this.labObjects.set('walls', [backWall, leftWall, rightWall]);
    }   
 /**
     * Create laboratory ceiling with integrated lighting
     */
    async createCeiling(width, height, depth) {
        const ceiling = BABYLON.MeshBuilder.CreateGround("ceiling", {
            width: width,
            height: depth
        }, this.scene);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI;
        
        // Ceiling material with integrated lighting panels
        const ceilingMaterial = new BABYLON.PBRMaterial("ceilingMaterial", this.scene);
        ceilingMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.92);
        ceilingMaterial.metallicFactor = 0.1;
        ceilingMaterial.roughnessFactor = 0.6;
        
        // Create ceiling texture with light panels
        const ceilingTexture = new BABYLON.DynamicTexture("ceilingTexture", {width: 512, height: 512}, this.scene);
        const ceilingContext = ceilingTexture.getContext();
        
        // Base ceiling color
        ceilingContext.fillStyle = '#E5E5E8';
        ceilingContext.fillRect(0, 0, 512, 512);
        
        // Draw light panels
        ceilingContext.fillStyle = '#F8F8FA';
        ceilingContext.fillRect(128, 128, 256, 64);
        ceilingContext.fillRect(128, 320, 256, 64);
        
        // Add panel borders
        ceilingContext.strokeStyle = '#D0D0D5';
        ceilingContext.lineWidth = 2;
        ceilingContext.strokeRect(128, 128, 256, 64);
        ceilingContext.strokeRect(128, 320, 256, 64);
        
        ceilingTexture.update();
        ceilingMaterial.baseTexture = ceilingTexture;
        ceiling.material = ceilingMaterial;
        
        this.labObjects.set('ceiling', ceiling);
    }

    /**
     * Create laboratory furniture and equipment
     */
    async createLabFurniture() {
        console.log('🪑 Creating laboratory furniture...');
        
        // Create main lab bench
        await this.createLabBench();
        
        // Create equipment cabinet
        await this.createEquipmentCabinet();
        
        // Create monitoring station
        await this.createMonitoringStation();
        
        // Create storage shelves
        await this.createStorageShelves();
        
        // Create lab stools
        await this.createLabStools();
        
        // Add laboratory equipment
        await this.createLabEquipment();
    } 
   /**
     * Create the main laboratory bench where the heart jar sits
     */
    async createLabBench() {
        // Lab bench dimensions
        const benchWidth = 8;
        const benchDepth = 3;
        const benchHeight = 0.8;
        const legHeight = 0.7;
        
        // Create bench top
        const benchTop = BABYLON.MeshBuilder.CreateBox("benchTop", {
            width: benchWidth,
            height: 0.1,
            depth: benchDepth
        }, this.scene);
        benchTop.position.y = legHeight + 0.05;
        
        // Lab bench material - stainless steel look
        const benchMaterial = new BABYLON.PBRMaterial("benchMaterial", this.scene);
        benchMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
        benchMaterial.metallicFactor = 0.9;
        benchMaterial.roughnessFactor = 0.1;
        benchTop.material = benchMaterial;
        
        // Create bench legs
        const legPositions = [
            { x: -benchWidth/2 + 0.3, z: -benchDepth/2 + 0.3 },
            { x: benchWidth/2 - 0.3, z: -benchDepth/2 + 0.3 },
            { x: -benchWidth/2 + 0.3, z: benchDepth/2 - 0.3 },
            { x: benchWidth/2 - 0.3, z: benchDepth/2 - 0.3 }
        ];
        
        const legs = [];
        legPositions.forEach((pos, index) => {
            const leg = BABYLON.MeshBuilder.CreateBox(`benchLeg${index}`, {
                width: 0.1,
                height: legHeight,
                depth: 0.1
            }, this.scene);
            leg.position.set(pos.x, legHeight/2, pos.z);
            leg.material = benchMaterial;
            legs.push(leg);
        });
        
        // Create bench storage drawers
        const drawer = BABYLON.MeshBuilder.CreateBox("benchDrawer", {
            width: 2,
            height: 0.3,
            depth: benchDepth - 0.2
        }, this.scene);
        drawer.position.set(-benchWidth/2 + 1.2, legHeight - 0.2, 0);
        
        const drawerMaterial = new BABYLON.PBRMaterial("drawerMaterial", this.scene);
        drawerMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        drawerMaterial.metallicFactor = 0.1;
        drawerMaterial.roughnessFactor = 0.8;
        drawer.material = drawerMaterial;
        
        // Add drawer handle
        const handle = BABYLON.MeshBuilder.CreateBox("drawerHandle", {
            width: 0.3,
            height: 0.05,
            depth: 0.05
        }, this.scene);
        handle.position.set(-benchWidth/2 + 2.1, legHeight - 0.2, 0);
        handle.material = benchMaterial;
        
        this.labObjects.set('labBench', {
            top: benchTop,
            legs: legs,
            drawer: drawer,
            handle: handle
        });
    }    /
**
     * Create equipment cabinet with medical devices
     */
    async createEquipmentCabinet() {
        const cabinet = BABYLON.MeshBuilder.CreateBox("equipmentCabinet", {
            width: 2,
            height: 4,
            depth: 1
        }, this.scene);
        cabinet.position.set(-8, 2, -6);
        
        // Cabinet material
        const cabinetMaterial = new BABYLON.PBRMaterial("cabinetMaterial", this.scene);
        cabinetMaterial.baseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
        cabinetMaterial.metallicFactor = 0.1;
        cabinetMaterial.roughnessFactor = 0.7;
        cabinet.material = cabinetMaterial;
        
        // Add cabinet doors
        const leftDoor = BABYLON.MeshBuilder.CreateBox("cabinetDoorLeft", {
            width: 0.95,
            height: 3.8,
            depth: 0.05
        }, this.scene);
        leftDoor.position.set(-8.5, 2, -5.45);
        leftDoor.material = cabinetMaterial;
        
        const rightDoor = BABYLON.MeshBuilder.CreateBox("cabinetDoorRight", {
            width: 0.95,
            height: 3.8,
            depth: 0.05
        }, this.scene);
        rightDoor.position.set(-7.5, 2, -5.45);
        rightDoor.material = cabinetMaterial;
        
        // Add door handles
        const leftHandle = BABYLON.MeshBuilder.CreateCylinder("leftHandle", {
            height: 0.3,
            diameter: 0.05
        }, this.scene);
        leftHandle.position.set(-8.2, 2, -5.4);
        leftHandle.rotation.x = Math.PI / 2;
        leftHandle.material = this.materials.get('metal') || cabinetMaterial;
        
        const rightHandle = BABYLON.MeshBuilder.CreateCylinder("rightHandle", {
            height: 0.3,
            diameter: 0.05
        }, this.scene);
        rightHandle.position.set(-7.8, 2, -5.4);
        rightHandle.rotation.x = Math.PI / 2;
        rightHandle.material = this.materials.get('metal') || cabinetMaterial;
        
        this.labObjects.set('equipmentCabinet', {
            main: cabinet,
            doors: [leftDoor, rightDoor],
            handles: [leftHandle, rightHandle]
        });
    }

    /**
     * Create monitoring station with screens and controls
     */
    async createMonitoringStation() {
        // Create monitor stand
        const stand = BABYLON.MeshBuilder.CreateBox("monitorStand", {
            width: 1.5,
            height: 0.1,
            depth: 0.8
        }, this.scene);
        stand.position.set(6, 1.2, -5);
        
        const standMaterial = new BABYLON.PBRMaterial("standMaterial", this.scene);
        standMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        standMaterial.metallicFactor = 0.8;
        standMaterial.roughnessFactor = 0.2;
        stand.material = standMaterial;
        
        // Create monitor screen
        const screen = BABYLON.MeshBuilder.CreateBox("monitorScreen", {
            width: 1.2,
            height: 0.8,
            depth: 0.05
        }, this.scene);
        screen.position.set(6, 1.6, -4.6);
        
        // Screen material with emissive glow
        const screenMaterial = new BABYLON.PBRMaterial("screenMaterial", this.scene);
        screenMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        screenMaterial.emissiveColor = new BABYLON.Color3(0.0, 0.2, 0.4);
        screenMaterial.metallicFactor = 0.9;
        screenMaterial.roughnessFactor = 0.1;
        screen.material = screenMaterial;
        
        this.labObjects.set('monitoringStation', {
            stand: stand,
            screen: screen
        });
    } 
   /**
     * Create storage shelves with laboratory supplies
     */
    async createStorageShelves() {
        const shelfWidth = 3;
        const shelfHeight = 0.05;
        const shelfDepth = 0.8;
        const shelfSpacing = 0.8;
        
        // Shelf material
        const shelfMaterial = new BABYLON.PBRMaterial("shelfMaterial", this.scene);
        shelfMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        shelfMaterial.metallicFactor = 0.1;
        shelfMaterial.roughnessFactor = 0.8;
        
        const shelves = [];
        for (let i = 0; i < 4; i++) {
            const shelf = BABYLON.MeshBuilder.CreateBox(`shelf${i}`, {
                width: shelfWidth,
                height: shelfHeight,
                depth: shelfDepth
            }, this.scene);
            shelf.position.set(8, 0.5 + i * shelfSpacing, -6);
            shelf.material = shelfMaterial;
            shelves.push(shelf);
            
            // Add some laboratory bottles and equipment on shelves
            if (i < 3) {
                await this.addShelfItems(shelf.position, i);
            }
        }
        
        // Create shelf supports
        const leftSupport = BABYLON.MeshBuilder.CreateBox("leftSupport", {
            width: 0.1,
            height: 3.5,
            depth: shelfDepth
        }, this.scene);
        leftSupport.position.set(8 - shelfWidth/2, 2, -6);
        leftSupport.material = shelfMaterial;
        
        const rightSupport = BABYLON.MeshBuilder.CreateBox("rightSupport", {
            width: 0.1,
            height: 3.5,
            depth: shelfDepth
        }, this.scene);
        rightSupport.position.set(8 + shelfWidth/2, 2, -6);
        rightSupport.material = shelfMaterial;
        
        this.labObjects.set('storageShelves', {
            shelves: shelves,
            supports: [leftSupport, rightSupport]
        });
    }

    /**
     * Add items to laboratory shelves
     */
    async addShelfItems(shelfPosition, shelfIndex) {
        const itemMaterial = new BABYLON.PBRMaterial(`shelfItemMaterial${shelfIndex}`, this.scene);
        itemMaterial.baseColor = new BABYLON.Color3(0.8, 0.9, 0.8);
        itemMaterial.metallicFactor = 0.1;
        itemMaterial.roughnessFactor = 0.9;
        
        // Add bottles
        for (let i = 0; i < 3; i++) {
            const bottle = BABYLON.MeshBuilder.CreateCylinder(`bottle${shelfIndex}_${i}`, {
                height: 0.3,
                diameterTop: 0.08,
                diameterBottom: 0.12
            }, this.scene);
            bottle.position.set(
                shelfPosition.x - 1 + i * 0.8,
                shelfPosition.y + 0.18,
                shelfPosition.z + 0.2
            );
            bottle.material = itemMaterial;
        }
        
        // Add equipment boxes
        const box = BABYLON.MeshBuilder.CreateBox(`equipBox${shelfIndex}`, {
            width: 0.4,
            height: 0.2,
            depth: 0.3
        }, this.scene);
        box.position.set(
            shelfPosition.x + 0.8,
            shelfPosition.y + 0.12,
            shelfPosition.z
        );
        box.material = itemMaterial;
    }    /**
  
   * Create laboratory stools
     */
    async createLabStools() {
        const stoolMaterial = new BABYLON.PBRMaterial("stoolMaterial", this.scene);
        stoolMaterial.baseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        stoolMaterial.metallicFactor = 0.8;
        stoolMaterial.roughnessFactor = 0.3;
        
        // Create two lab stools
        const stoolPositions = [
            { x: -2, z: 2 },
            { x: 2, z: 2 }
        ];
        
        const stools = [];
        stoolPositions.forEach((pos, index) => {
            // Stool seat
            const seat = BABYLON.MeshBuilder.CreateCylinder(`stoolSeat${index}`, {
                height: 0.05,
                diameter: 0.8
            }, this.scene);
            seat.position.set(pos.x, 0.6, pos.z);
            seat.material = stoolMaterial;
            
            // Stool leg (central column)
            const leg = BABYLON.MeshBuilder.CreateCylinder(`stoolLeg${index}`, {
                height: 0.6,
                diameter: 0.1
            }, this.scene);
            leg.position.set(pos.x, 0.3, pos.z);
            leg.material = stoolMaterial;
            
            // Stool base
            const base = BABYLON.MeshBuilder.CreateCylinder(`stoolBase${index}`, {
                height: 0.05,
                diameter: 0.6
            }, this.scene);
            base.position.set(pos.x, 0.025, pos.z);
            base.material = stoolMaterial;
            
            stools.push({ seat, leg, base });
        });
        
        this.labObjects.set('labStools', stools);
    }

    /**
     * Create additional laboratory equipment
     */
    async createLabEquipment() {
        // Create microscope
        await this.createMicroscope();
        
        // Create centrifuge
        await this.createCentrifuge();
        
        // Create scale
        await this.createScale();
        
        // Create computer terminal
        await this.createComputerTerminal();
    }

    /**
     * Create a laboratory microscope
     */
    async createMicroscope() {
        const microscopeBase = BABYLON.MeshBuilder.CreateCylinder("microscopeBase", {
            height: 0.1,
            diameter: 0.4
        }, this.scene);
        microscopeBase.position.set(-3, 0.75, 0);
        
        const microscopeMaterial = new BABYLON.PBRMaterial("microscopeMaterial", this.scene);
        microscopeMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        microscopeMaterial.metallicFactor = 0.9;
        microscopeMaterial.roughnessFactor = 0.1;
        microscopeBase.material = microscopeMaterial;
        
        // Microscope arm
        const arm = BABYLON.MeshBuilder.CreateCylinder("microscopeArm", {
            height: 0.6,
            diameter: 0.05
        }, this.scene);
        arm.position.set(-3, 1.1, 0);
        arm.material = microscopeMaterial;
        
        // Microscope head
        const head = BABYLON.MeshBuilder.CreateBox("microscopeHead", {
            width: 0.2,
            height: 0.15,
            depth: 0.3
        }, this.scene);
        head.position.set(-3, 1.35, 0);
        head.material = microscopeMaterial;
        
        this.labObjects.set('microscope', {
            base: microscopeBase,
            arm: arm,
            head: head
        });
    }    /**
 
    * Setup advanced laboratory lighting system
     */
    async setupLaboratoryLighting() {
        console.log('💡 Setting up laboratory lighting...');
        
        // Remove default lighting
        this.scene.lights.forEach(light => {
            if (light.name === 'default light') {
                light.dispose();
            }
        });
        
        // Create overhead fluorescent lighting
        await this.createOverheadLighting();
        
        // Create task lighting
        await this.createTaskLighting();
        
        // Create ambient lighting
        await this.createAmbientLighting();
        
        // Create emergency lighting
        await this.createEmergencyLighting();
        
        // Setup dynamic lighting effects
        await this.setupDynamicLighting();
    }

    /**
     * Create overhead fluorescent lighting
     */
    async createOverheadLighting() {
        const { intensity, color } = this.config.lighting.overhead;
        
        // Main overhead lights
        const overheadPositions = [
            { x: -4, y: 5.8, z: 0 },
            { x: 0, y: 5.8, z: 0 },
            { x: 4, y: 5.8, z: 0 }
        ];
        
        const overheadLights = [];
        overheadPositions.forEach((pos, index) => {
            const light = new BABYLON.DirectionalLight(`overheadLight${index}`, 
                new BABYLON.Vector3(0, -1, 0.1), this.scene);
            light.position = new BABYLON.Vector3(pos.x, pos.y, pos.z);
            light.intensity = intensity;
            light.diffuse = color;
            light.shadowEnabled = true;
            
            // Create shadow generator
            const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
            shadowGenerator.useBlurExponentialShadowMap = true;
            shadowGenerator.blurKernel = 32;
            
            overheadLights.push({ light, shadowGenerator });
        });
        
        this.lighting = { overhead: overheadLights };
        
        // Create light fixtures
        overheadPositions.forEach((pos, index) => {
            const fixture = BABYLON.MeshBuilder.CreateBox(`lightFixture${index}`, {
                width: 2,
                height: 0.1,
                depth: 0.5
            }, this.scene);
            fixture.position.set(pos.x, pos.y - 0.1, pos.z);
            
            const fixtureMaterial = new BABYLON.PBRMaterial(`fixtureMaterial${index}`, this.scene);
            fixtureMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
            fixtureMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.8, 1.0);
            fixtureMaterial.emissiveIntensity = 0.3;
            fixture.material = fixtureMaterial;
        });
    }

    /**
     * Create task lighting for specific work areas
     */
    async createTaskLighting() {
        const { intensity, color } = this.config.lighting.task;
        
        // Task light over main lab bench
        const taskLight = new BABYLON.SpotLight("taskLight", 
            new BABYLON.Vector3(0, 3, 0),
            new BABYLON.Vector3(0, -1, 0),
            Math.PI / 3, 2, this.scene);
        taskLight.intensity = intensity;
        taskLight.diffuse = color;
        
        // Task light fixture
        const taskFixture = BABYLON.MeshBuilder.CreateCylinder("taskFixture", {
            height: 0.3,
            diameterTop: 0.4,
            diameterBottom: 0.2
        }, this.scene);
        taskFixture.position.set(0, 2.8, 0);
        
        const taskFixtureMaterial = new BABYLON.PBRMaterial("taskFixtureMaterial", this.scene);
        taskFixtureMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        taskFixtureMaterial.metallicFactor = 0.9;
        taskFixtureMaterial.roughnessFactor = 0.1;
        taskFixture.material = taskFixtureMaterial;
        
        if (!this.lighting) this.lighting = {};
        this.lighting.task = { light: taskLight, fixture: taskFixture };
    } 
   /**
     * Create atmospheric effects (fog, particles, etc.)
     */
    async createAtmosphericEffects() {
        console.log('🌫️ Creating atmospheric effects...');
        
        // Setup fog
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = this.config.atmosphere.fogDensity;
        this.scene.fogColor = this.config.atmosphere.fogColor;
        
        // Create dust particles in the air
        await this.createDustParticles();
        
        // Create subtle air circulation effects
        await this.createAirCirculation();
    }

    /**
     * Create dust particles floating in the air
     */
    async createDustParticles() {
        const particleSystem = new BABYLON.ParticleSystem("dustParticles", 200, this.scene);
        
        // Create particle texture
        const particleTexture = new BABYLON.DynamicTexture("dustTexture", {width: 64, height: 64}, this.scene);
        const context = particleTexture.getContext();
        
        // Draw a small white dot
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.beginPath();
        context.arc(32, 32, 2, 0, 2 * Math.PI);
        context.fill();
        particleTexture.update();
        
        particleSystem.particleTexture = particleTexture;
        
        // Particle emitter
        particleSystem.emitter = new BABYLON.Vector3(0, 3, 0);
        particleSystem.minEmitBox = new BABYLON.Vector3(-8, 0, -6);
        particleSystem.maxEmitBox = new BABYLON.Vector3(8, 0, 6);
        
        // Particle properties
        particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.1);
        particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.05);
        particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0);
        
        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.03;
        particleSystem.minLifeTime = 10;
        particleSystem.maxLifeTime = 20;
        particleSystem.emitRate = 10;
        
        // Particle movement
        particleSystem.direction1 = new BABYLON.Vector3(-0.1, 0.1, -0.1);
        particleSystem.direction2 = new BABYLON.Vector3(0.1, 0.3, 0.1);
        particleSystem.minEmitPower = 0.1;
        particleSystem.maxEmitPower = 0.3;
        
        particleSystem.gravity = new BABYLON.Vector3(0, -0.01, 0);
        
        particleSystem.start();
        
        this.labObjects.set('dustParticles', particleSystem);
    }

    /**
     * Create interactive elements in the laboratory
     */
    async createInteractiveElements() {
        console.log('🖱️ Creating interactive elements...');
        
        // Create light switches
        await this.createLightSwitches();
        
        // Create emergency button
        await this.createEmergencyButton();
        
        // Create information displays
        await this.createInformationDisplays();
    }

    /**
     * Create light switches on the wall
     */
    async createLightSwitches() {
        const switchMaterial = new BABYLON.PBRMaterial("switchMaterial", this.scene);
        switchMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        switchMaterial.metallicFactor = 0.1;
        switchMaterial.roughnessFactor = 0.8;
        
        // Main light switch
        const lightSwitch = BABYLON.MeshBuilder.CreateBox("lightSwitch", {
            width: 0.2,
            height: 0.3,
            depth: 0.05
        }, this.scene);
        lightSwitch.position.set(-9.9, 1.5, 0);
        lightSwitch.material = switchMaterial;
        
        // Switch toggle
        const toggle = BABYLON.MeshBuilder.CreateBox("switchToggle", {
            width: 0.15,
            height: 0.1,
            depth: 0.02
        }, this.scene);
        toggle.position.set(-9.88, 1.5, 0);
        toggle.material = switchMaterial;
        
        // Make switch interactive
        lightSwitch.actionManager = new BABYLON.ActionManager(this.scene);
        lightSwitch.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger, 
            () => this.toggleLighting()
        ));
        
        this.labObjects.set('lightSwitch', { switch: lightSwitch, toggle: toggle });
    }

    /**
     * Toggle laboratory lighting
     */
    toggleLighting() {
        if (this.lighting && this.lighting.overhead) {
            this.lighting.overhead.forEach(lightObj => {
                lightObj.light.intensity = lightObj.light.intensity > 0 ? 0 : this.config.lighting.overhead.intensity;
            });
        }
    }

    /**
     * Setup ambient effects like sounds and subtle animations
     */
    async setupAmbientEffects() {
        console.log('🔊 Setting up ambient effects...');
        
        // Create subtle equipment humming animations
        await this.createEquipmentAnimations();
        
        // Setup environmental sounds (if audio is available)
        await this.setupAmbientSounds();
    }

    /**
     * Create subtle animations for equipment
     */
    async createEquipmentAnimations() {
        // Animate monitor screen glow
        const monitoringStation = this.labObjects.get('monitoringStation');
        if (monitoringStation && monitoringStation.screen) {
            const glowAnimation = BABYLON.Animation.CreateAndStartAnimation(
                "screenGlow",
                monitoringStation.screen.material,
                "emissiveIntensity",
                30, // fps
                120, // total frames
                0.1, // from
                0.3, // to
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            
            this.animations.set('screenGlow', glowAnimation);
        }
        
        // Animate dust particles with air currents
        const dustParticles = this.labObjects.get('dustParticles');
        if (dustParticles) {
            // Add subtle wind effect
            setInterval(() => {
                const windStrength = 0.05 + Math.random() * 0.1;
                dustParticles.direction1.x = -windStrength + Math.random() * windStrength * 2;
                dustParticles.direction2.x = -windStrength + Math.random() * windStrength * 2;
            }, 5000);
        }
    }

    /**
     * Get laboratory object by name
     */
    getLabObject(name) {
        return this.labObjects.get(name);
    }

    /**
     * Update laboratory environment
     */
    update(deltaTime) {
        // Update any time-based effects here
        if (this.animations.size > 0) {
            // Handle animation updates if needed
        }
    }

    /**
     * Dispose of laboratory environment
     */
    dispose() {
        // Dispose of all lab objects
        this.labObjects.forEach((obj, name) => {
            if (obj.dispose) {
                obj.dispose();
            } else if (Array.isArray(obj)) {
                obj.forEach(item => item.dispose && item.dispose());
            } else if (typeof obj === 'object') {
                Object.values(obj).forEach(item => {
                    if (item.dispose) item.dispose();
                    else if (Array.isArray(item)) {
                        item.forEach(subItem => subItem.dispose && subItem.dispose());
                    }
                });
            }
        });
        
        // Dispose of animations
        this.animations.forEach(animation => animation.dispose());
        
        // Clear collections
        this.labObjects.clear();
        this.materials.clear();
        this.animations.clear();
        
        console.log('🧹 Laboratory environment disposed');
    }
}