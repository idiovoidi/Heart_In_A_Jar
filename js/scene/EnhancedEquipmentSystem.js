/**
 * Enhanced Equipment System
 * Manages realistic medical and laboratory equipment with interactive capabilities
 */

export class EnhancedEquipmentSystem {
    constructor(scene, materialLibrary) {
        this.scene = scene;
        this.materialLibrary = materialLibrary;
        this.equipment = new Map();
        this.equipmentStates = new Map();
        this.interactiveElements = new Map();
        this.animations = new Map();
        
        // Equipment configuration system
        this.equipmentConfig = {
            medicalDevices: {
                ecgMonitor: {
                    position: { x: 6, y: 1.2, z: -5 },
                    scale: { x: 1, y: 1, z: 1 },
                    materials: ['plastic', 'glass', 'metal'],
                    interactive: true,
                    powerState: 'on',
                    displayContent: 'heartRhythm',
                    indicators: ['power', 'alarm', 'battery']
                },
                defibrillator: {
                    position: { x: 8, y: 0.8, z: -3 },
                    scale: { x: 1, y: 1, z: 1 },
                    materials: ['plastic', 'metal', 'rubber'],
                    interactive: true,
                    powerState: 'standby',
                    chargeLevels: [50, 100, 150, 200],
                    currentCharge: 0
                },
                cardiacMonitor: {
                    position: { x: 4, y: 1.5, z: -6 },
                    scale: { x: 0.8, y: 0.8, z: 0.8 },
                    materials: ['plastic', 'glass'],
                    interactive: true,
                    powerState: 'on',
                    displayContent: 'vitalSigns',
                    alarmThresholds: { hr: [60, 100], bp: [90, 140] }
                }
            },
            laboratoryInstruments: {
                analyticalBalance: {
                    position: { x: -6, y: 0.8, z: 2 },
                    scale: { x: 1, y: 1, z: 1 },
                    precision: 0.0001,
                    maxWeight: 200,
                    calibrationStatus: 'calibrated',
                    currentWeight: 0,
                    interactive: true
                },
                centrifuge: {
                    position: { x: -4, y: 0.8, z: -2 },
                    scale: { x: 1, y: 1, z: 1 },
                    maxRPM: 15000,
                    currentRPM: 0,
                    animationState: 'stopped',
                    timer: 0,
                    interactive: true
                },
                microscope: {
                    position: { x: -3, y: 0.8, z: 0 },
                    scale: { x: 1, y: 1, z: 1 },
                    magnification: 100,
                    focusLevel: 0.5,
                    lightIntensity: 0.8,
                    interactive: true
                },
                phMeter: {
                    position: { x: -2, y: 0.8, z: 3 },
                    scale: { x: 0.6, y: 0.6, z: 0.6 },
                    currentPH: 7.0,
                    calibrated: true,
                    temperature: 25.0,
                    interactive: true
                }
            },
            computerWorkstations: {
                mainWorkstation: {
                    position: { x: 7, y: 0.8, z: 4 },
                    scale: { x: 1, y: 1, z: 1 },
                    monitors: 2,
                    powerState: 'on',
                    displayContent: ['dataAnalysis', 'patientRecords'],
                    interactive: true
                },
                analysisStation: {
                    position: { x: -7, y: 0.8, z: 4 },
                    scale: { x: 1, y: 1, z: 1 },
                    monitors: 3,
                    powerState: 'on',
                    displayContent: ['heartData', 'simulation', 'controls'],
                    interactive: true
                }
            },
            storageSystems: {
                medicalCabinet: {
                    position: { x: -8, y: 2, z: -6 },
                    scale: { x: 1, y: 1, z: 1 },
                    doors: 2,
                    locked: false,
                    contents: ['supplies', 'instruments', 'medications'],
                    interactive: true
                },
                refrigerationUnit: {
                    position: { x: 9, y: 1, z: -7 },
                    scale: { x: 1, y: 1, z: 1 },
                    temperature: 4.0,
                    powerState: 'on',
                    contents: ['specimens', 'reagents'],
                    interactive: true
                },
                specimenStorage: {
                    position: { x: 8, y: 2, z: -6 },
                    scale: { x: 1, y: 1, z: 1 },
                    shelves: 4,
                    contents: ['samples', 'cultures', 'slides'],
                    interactive: true
                }
            }
        };
        
        this.init();
    }

    /**
     * Initialize the enhanced equipment system
     */
    async init() {
        console.log('🔬 Initializing Enhanced Equipment System...');
        
        try {
            // Initialize equipment state tracking
            this.initializeEquipmentStates();
            
            // Create all equipment categories
            await this.createAllEquipment();
            
            // Setup equipment interactions
            this.setupEquipmentInteractions();
            
            // Start equipment animations and updates
            this.startEquipmentAnimations();
            
            console.log('✅ Enhanced Equipment System initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Enhanced Equipment System:', error);
        }
    }

    /**
     * Initialize equipment state tracking
     */
    initializeEquipmentStates() {
        // Initialize states for all equipment
        Object.keys(this.equipmentConfig).forEach(category => {
            Object.keys(this.equipmentConfig[category]).forEach(equipmentId => {
                const config = this.equipmentConfig[category][equipmentId];
                this.equipmentStates.set(equipmentId, {
                    powerState: config.powerState || 'off',
                    operationalState: 'idle',
                    lastUpdate: Date.now(),
                    interactive: config.interactive || false,
                    category: category,
                    config: config
                });
            });
        });
    }

    /**
     * Create all equipment categories
     */
    async createAllEquipment() {
        // Create medical devices
        await this.createMedicalEquipment();
        
        // Create laboratory instruments
        await this.createLaboratoryInstruments();
        
        // Create computer workstations
        await this.createComputerWorkstations();
        
        // Create storage systems
        await this.createStorageSystems();
    }

    /**
     * Create medical equipment
     */
    async createMedicalEquipment() {
        console.log('🏥 Creating medical equipment...');
        
        const medicalDevices = this.equipmentConfig.medicalDevices;
        
        // Create ECG Monitor
        if (medicalDevices.ecgMonitor) {
            const ecgMonitor = await this.createECGMonitor(medicalDevices.ecgMonitor);
            this.equipment.set('ecgMonitor', ecgMonitor);
        }
        
        // Create Defibrillator
        if (medicalDevices.defibrillator) {
            const defibrillator = await this.createDefibrillator(medicalDevices.defibrillator);
            this.equipment.set('defibrillator', defibrillator);
        }
        
        // Create Cardiac Monitor
        if (medicalDevices.cardiacMonitor) {
            const cardiacMonitor = await this.createCardiacMonitor(medicalDevices.cardiacMonitor);
            this.equipment.set('cardiacMonitor', cardiacMonitor);
        }
    }

    /**
     * Create laboratory instruments
     */
    async createLaboratoryInstruments() {
        console.log('⚗️ Creating laboratory instruments...');
        
        const instruments = this.equipmentConfig.laboratoryInstruments;
        
        // Create Analytical Balance
        if (instruments.analyticalBalance) {
            const balance = await this.createAnalyticalBalance(instruments.analyticalBalance);
            this.equipment.set('analyticalBalance', balance);
        }
        
        // Create Centrifuge
        if (instruments.centrifuge) {
            const centrifuge = await this.createCentrifuge(instruments.centrifuge);
            this.equipment.set('centrifuge', centrifuge);
        }
        
        // Create Microscope
        if (instruments.microscope) {
            const microscope = await this.createMicroscope(instruments.microscope);
            this.equipment.set('microscope', microscope);
        }
        
        // Create pH Meter
        if (instruments.phMeter) {
            const phMeter = await this.createPHMeter(instruments.phMeter);
            this.equipment.set('phMeter', phMeter);
        }
    }

    /**
     * Create computer workstations
     */
    async createComputerWorkstations() {
        console.log('💻 Creating computer workstations...');
        
        const workstations = this.equipmentConfig.computerWorkstations;
        
        Object.keys(workstations).forEach(async (stationId) => {
            const config = workstations[stationId];
            const workstation = await this.createWorkstation(stationId, config);
            this.equipment.set(stationId, workstation);
        });
    }

    /**
     * Create storage systems
     */
    async createStorageSystems() {
        console.log('🗄️ Creating storage systems...');
        
        const storage = this.equipmentConfig.storageSystems;
        
        Object.keys(storage).forEach(async (storageId) => {
            const config = storage[storageId];
            const storageSystem = await this.createStorageSystem(storageId, config);
            this.equipment.set(storageId, storageSystem);
        });
    }

    /**
     * Update equipment status
     */
    updateEquipmentStatus(equipmentId, status) {
        if (this.equipmentStates.has(equipmentId)) {
            const currentState = this.equipmentStates.get(equipmentId);
            const updatedState = { ...currentState, ...status, lastUpdate: Date.now() };
            this.equipmentStates.set(equipmentId, updatedState);
            
            // Update visual representation
            this.updateEquipmentVisuals(equipmentId, updatedState);
            
            console.log(`📊 Equipment ${equipmentId} status updated:`, status);
        }
    }

    /**
     * Toggle equipment power
     */
    toggleEquipmentPower(equipmentId) {
        const state = this.equipmentStates.get(equipmentId);
        if (state) {
            const newPowerState = state.powerState === 'on' ? 'off' : 'on';
            this.updateEquipmentStatus(equipmentId, { powerState: newPowerState });
            
            // Handle power state changes
            this.handlePowerStateChange(equipmentId, newPowerState);
        }
    }

    /**
     * Get equipment information
     */
    getEquipmentInfo(equipmentId) {
        const state = this.equipmentStates.get(equipmentId);
        const equipment = this.equipment.get(equipmentId);
        
        if (state && equipment) {
            return {
                id: equipmentId,
                state: state,
                equipment: equipment,
                config: state.config
            };
        }
        
        return null;
    }

    /**
     * Setup equipment interactions
     */
    setupEquipmentInteractions() {
        this.equipmentStates.forEach((state, equipmentId) => {
            if (state.interactive) {
                const equipment = this.equipment.get(equipmentId);
                if (equipment && equipment.mainBody) {
                    // Make equipment clickable
                    equipment.mainBody.actionManager = new BABYLON.ActionManager(this.scene);
                    
                    // Add click interaction
                    equipment.mainBody.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPickTrigger,
                            () => this.handleEquipmentInteraction(equipmentId)
                        )
                    );
                    
                    // Add hover effects
                    equipment.mainBody.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPointerOverTrigger,
                            () => this.handleEquipmentHover(equipmentId, true)
                        )
                    );
                    
                    equipment.mainBody.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            BABYLON.ActionManager.OnPointerOutTrigger,
                            () => this.handleEquipmentHover(equipmentId, false)
                        )
                    );
                }
            }
        });
    }

    /**
     * Handle equipment interaction
     */
    handleEquipmentInteraction(equipmentId) {
        console.log(`🖱️ Equipment interaction: ${equipmentId}`);
        
        const state = this.equipmentStates.get(equipmentId);
        if (state) {
            // Different interactions based on equipment type
            switch (state.category) {
                case 'medicalDevices':
                    this.handleMedicalDeviceInteraction(equipmentId);
                    break;
                case 'laboratoryInstruments':
                    this.handleInstrumentInteraction(equipmentId);
                    break;
                case 'computerWorkstations':
                    this.handleWorkstationInteraction(equipmentId);
                    break;
                case 'storageSystems':
                    this.handleStorageInteraction(equipmentId);
                    break;
            }
        }
    }

    /**
     * Handle equipment hover effects
     */
    handleEquipmentHover(equipmentId, isHovering) {
        const equipment = this.equipment.get(equipmentId);
        if (equipment && equipment.mainBody) {
            if (isHovering) {
                // Add subtle glow effect
                equipment.mainBody.renderOutline = true;
                equipment.mainBody.outlineColor = new BABYLON.Color3(0.3, 0.6, 1.0);
                equipment.mainBody.outlineWidth = 0.02;
            } else {
                // Remove glow effect
                equipment.mainBody.renderOutline = false;
            }
        }
    }

    /**
     * Start equipment animations and updates
     */
    startEquipmentAnimations() {
        // Start update loop for equipment states
        this.updateLoop();
        
        // Start specific equipment animations
        this.startIndicatorAnimations();
        this.startDisplayAnimations();
    }

    /**
     * Main update loop for equipment
     */
    updateLoop() {
        const update = () => {
            this.equipmentStates.forEach((state, equipmentId) => {
                if (state.powerState === 'on') {
                    this.updateEquipmentBehavior(equipmentId, state);
                }
            });
            
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    }

    /**
     * Update equipment behavior based on state
     */
    updateEquipmentBehavior(equipmentId, state) {
        const equipment = this.equipment.get(equipmentId);
        if (!equipment) return;
        
        // Update based on equipment type
        switch (state.category) {
            case 'medicalDevices':
                this.updateMedicalDeviceBehavior(equipmentId, state, equipment);
                break;
            case 'laboratoryInstruments':
                this.updateInstrumentBehavior(equipmentId, state, equipment);
                break;
        }
    }

    /**
     * Dispose of the equipment system
     */
    dispose() {
        // Dispose all equipment meshes
        this.equipment.forEach((equipment) => {
            if (equipment.mainBody) {
                equipment.mainBody.dispose();
            }
            if (equipment.components) {
                equipment.components.forEach(component => {
                    if (component.dispose) component.dispose();
                });
            }
        });
        
        // Clear all maps
        this.equipment.clear();
        this.equipmentStates.clear();
        this.interactiveElements.clear();
        this.animations.clear();
        
        console.log('🧹 Enhanced Equipment System disposed');
    }

    /**
     * Create ECG Monitor with realistic display and controls
     */
    async createECGMonitor(config) {
        console.log('📈 Creating ECG Monitor...');
        
        const { position, scale } = config;
        
        // Main monitor body
        const mainBody = BABYLON.MeshBuilder.CreateBox("ecgMonitorBody", {
            width: 1.2,
            height: 0.8,
            depth: 0.4
        }, this.scene);
        mainBody.position.set(position.x, position.y, position.z);
        mainBody.scaling.set(scale.x, scale.y, scale.z);
        
        // Monitor material - medical equipment plastic
        const monitorMaterial = new BABYLON.PBRMaterial("ecgMonitorMaterial", this.scene);
        monitorMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.92);
        monitorMaterial.metallicFactor = 0.1;
        monitorMaterial.roughnessFactor = 0.8;
        mainBody.material = monitorMaterial;
        
        // Create display screen
        const screen = BABYLON.MeshBuilder.CreatePlane("ecgScreen", {
            width: 0.8,
            height: 0.5
        }, this.scene);
        screen.position.set(position.x, position.y + 0.1, position.z + 0.21);
        
        // Screen material with ECG waveform
        const screenMaterial = new BABYLON.PBRMaterial("ecgScreenMaterial", this.scene);
        screenMaterial.baseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        screenMaterial.emissiveColor = new BABYLON.Color3(0.0, 0.8, 0.2);
        screenMaterial.emissiveIntensity = 0.5;
        
        // Create ECG waveform texture
        const waveformTexture = this.createECGWaveformTexture();
        screenMaterial.emissiveTexture = waveformTexture;
        screen.material = screenMaterial;
        
        // Create control buttons
        const buttons = [];
        const buttonPositions = [
            { x: -0.4, y: -0.2, label: 'POWER' },
            { x: -0.2, y: -0.2, label: 'ALARM' },
            { x: 0.0, y: -0.2, label: 'PRINT' },
            { x: 0.2, y: -0.2, label: 'MENU' },
            { x: 0.4, y: -0.2, label: 'SELECT' }
        ];
        
        buttonPositions.forEach((btnPos, index) => {
            const button = BABYLON.MeshBuilder.CreateCylinder(`ecgButton${index}`, {
                height: 0.02,
                diameter: 0.08
            }, this.scene);
            button.position.set(
                position.x + btnPos.x,
                position.y + btnPos.y,
                position.z + 0.21
            );
            
            const buttonMaterial = new BABYLON.PBRMaterial(`ecgButtonMaterial${index}`, this.scene);
            buttonMaterial.baseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            buttonMaterial.metallicFactor = 0.8;
            buttonMaterial.roughnessFactor = 0.2;
            button.material = buttonMaterial;
            
            buttons.push({ mesh: button, label: btnPos.label });
        });
        
        // Create LED indicators
        const indicators = [];
        const indicatorPositions = [
            { x: -0.5, y: 0.3, color: [0, 1, 0], label: 'POWER' },
            { x: -0.3, y: 0.3, color: [1, 1, 0], label: 'ALARM' },
            { x: -0.1, y: 0.3, color: [0, 0, 1], label: 'BATTERY' }
        ];
        
        indicatorPositions.forEach((indPos, index) => {
            const indicator = BABYLON.MeshBuilder.CreateSphere(`ecgIndicator${index}`, {
                diameter: 0.04
            }, this.scene);
            indicator.position.set(
                position.x + indPos.x,
                position.y + indPos.y,
                position.z + 0.21
            );
            
            const indicatorMaterial = new BABYLON.PBRMaterial(`ecgIndicatorMaterial${index}`, this.scene);
            indicatorMaterial.baseColor = new BABYLON.Color3(...indPos.color);
            indicatorMaterial.emissiveColor = new BABYLON.Color3(...indPos.color);
            indicatorMaterial.emissiveIntensity = 1.0;
            indicator.material = indicatorMaterial;
            
            indicators.push({ mesh: indicator, label: indPos.label, color: indPos.color });
        });
        
        // Create heart rate display
        const hrDisplay = BABYLON.MeshBuilder.CreatePlane("hrDisplay", {
            width: 0.3,
            height: 0.15
        }, this.scene);
        hrDisplay.position.set(position.x + 0.4, position.y + 0.1, position.z + 0.21);
        
        const hrDisplayMaterial = new BABYLON.PBRMaterial("hrDisplayMaterial", this.scene);
        hrDisplayMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        hrDisplayMaterial.emissiveColor = new BABYLON.Color3(1.0, 0.3, 0.0);
        hrDisplayMaterial.emissiveIntensity = 0.8;
        
        // Create heart rate number texture
        const hrTexture = this.createHeartRateTexture(72);
        hrDisplayMaterial.emissiveTexture = hrTexture;
        hrDisplay.material = hrDisplayMaterial;
        
        return {
            mainBody: mainBody,
            components: [screen, hrDisplay, ...buttons.map(b => b.mesh), ...indicators.map(i => i.mesh)],
            screen: screen,
            buttons: buttons,
            indicators: indicators,
            hrDisplay: hrDisplay,
            waveformTexture: waveformTexture,
            hrTexture: hrTexture
        };
    }

    /**
     * Create Defibrillator with charge controls and paddles
     */
    async createDefibrillator(config) {
        console.log('⚡ Creating Defibrillator...');
        
        const { position, scale } = config;
        
        // Main defibrillator body
        const mainBody = BABYLON.MeshBuilder.CreateBox("defibrillatorBody", {
            width: 1.5,
            height: 1.2,
            depth: 0.8
        }, this.scene);
        mainBody.position.set(position.x, position.y, position.z);
        mainBody.scaling.set(scale.x, scale.y, scale.z);
        
        // Defibrillator material
        const defibMaterial = new BABYLON.PBRMaterial("defibrillatorMaterial", this.scene);
        defibMaterial.baseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
        defibMaterial.metallicFactor = 0.1;
        defibMaterial.roughnessFactor = 0.7;
        mainBody.material = defibMaterial;
        
        // Create control panel
        const controlPanel = BABYLON.MeshBuilder.CreatePlane("defibControlPanel", {
            width: 1.2,
            height: 0.8
        }, this.scene);
        controlPanel.position.set(position.x, position.y + 0.2, position.z + 0.41);
        
        const panelMaterial = new BABYLON.PBRMaterial("defibPanelMaterial", this.scene);
        panelMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        panelMaterial.metallicFactor = 0.8;
        panelMaterial.roughnessFactor = 0.3;
        controlPanel.material = panelMaterial;
        
        // Create charge level display
        const chargeDisplay = BABYLON.MeshBuilder.CreatePlane("chargeDisplay", {
            width: 0.4,
            height: 0.2
        }, this.scene);
        chargeDisplay.position.set(position.x, position.y + 0.3, position.z + 0.42);
        
        const chargeMaterial = new BABYLON.PBRMaterial("chargeDisplayMaterial", this.scene);
        chargeMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        chargeMaterial.emissiveColor = new BABYLON.Color3(1.0, 0.5, 0.0);
        chargeMaterial.emissiveIntensity = 0.8;
        
        const chargeTexture = this.createChargeDisplayTexture(0);
        chargeMaterial.emissiveTexture = chargeTexture;
        chargeDisplay.material = chargeMaterial;
        
        // Create charge buttons
        const chargeButtons = [];
        const chargeLevels = [50, 100, 150, 200];
        chargeLevels.forEach((level, index) => {
            const button = BABYLON.MeshBuilder.CreateCylinder(`chargeButton${level}`, {
                height: 0.03,
                diameter: 0.12
            }, this.scene);
            button.position.set(
                position.x - 0.4 + index * 0.25,
                position.y - 0.1,
                position.z + 0.42
            );
            
            const buttonMaterial = new BABYLON.PBRMaterial(`chargeButtonMaterial${level}`, this.scene);
            buttonMaterial.baseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
            buttonMaterial.metallicFactor = 0.3;
            buttonMaterial.roughnessFactor = 0.6;
            button.material = buttonMaterial;
            
            chargeButtons.push({ mesh: button, level: level });
        });
        
        // Create charge button
        const chargeButton = BABYLON.MeshBuilder.CreateCylinder("defibChargeButton", {
            height: 0.05,
            diameter: 0.2
        }, this.scene);
        chargeButton.position.set(position.x + 0.3, position.y - 0.3, position.z + 0.42);
        
        const chargeBtnMaterial = new BABYLON.PBRMaterial("chargeBtnMaterial", this.scene);
        chargeBtnMaterial.baseColor = new BABYLON.Color3(1.0, 0.8, 0.0);
        chargeBtnMaterial.emissiveColor = new BABYLON.Color3(1.0, 0.8, 0.0);
        chargeBtnMaterial.emissiveIntensity = 0.3;
        chargeButton.material = chargeBtnMaterial;
        
        // Create shock button
        const shockButton = BABYLON.MeshBuilder.CreateCylinder("defibShockButton", {
            height: 0.05,
            diameter: 0.25
        }, this.scene);
        shockButton.position.set(position.x - 0.3, position.y - 0.3, position.z + 0.42);
        
        const shockBtnMaterial = new BABYLON.PBRMaterial("shockBtnMaterial", this.scene);
        shockBtnMaterial.baseColor = new BABYLON.Color3(1.0, 0.2, 0.2);
        shockBtnMaterial.emissiveColor = new BABYLON.Color3(1.0, 0.2, 0.2);
        shockBtnMaterial.emissiveIntensity = 0.5;
        shockButton.material = shockBtnMaterial;
        
        // Create paddles
        const paddles = [];
        const paddlePositions = [
            { x: position.x - 0.6, y: position.y - 0.4, z: position.z + 0.2 },
            { x: position.x + 0.6, y: position.y - 0.4, z: position.z + 0.2 }
        ];
        
        paddlePositions.forEach((paddlePos, index) => {
            const paddle = BABYLON.MeshBuilder.CreateCylinder(`defibPaddle${index}`, {
                height: 0.3,
                diameterTop: 0.15,
                diameterBottom: 0.08
            }, this.scene);
            paddle.position.set(paddlePos.x, paddlePos.y, paddlePos.z);
            paddle.rotation.x = Math.PI / 2;
            
            const paddleMaterial = new BABYLON.PBRMaterial(`paddleMaterial${index}`, this.scene);
            paddleMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            paddleMaterial.metallicFactor = 0.9;
            paddleMaterial.roughnessFactor = 0.1;
            paddle.material = paddleMaterial;
            
            paddles.push(paddle);
        });
        
        return {
            mainBody: mainBody,
            components: [controlPanel, chargeDisplay, chargeButton, shockButton, ...chargeButtons.map(b => b.mesh), ...paddles],
            controlPanel: controlPanel,
            chargeDisplay: chargeDisplay,
            chargeButtons: chargeButtons,
            chargeButton: chargeButton,
            shockButton: shockButton,
            paddles: paddles,
            chargeTexture: chargeTexture
        };
    }

    /**
     * Create Cardiac Monitor with vital signs display
     */
    async createCardiacMonitor(config) {
        console.log('💓 Creating Cardiac Monitor...');
        
        const { position, scale } = config;
        
        // Main monitor body
        const mainBody = BABYLON.MeshBuilder.CreateBox("cardiacMonitorBody", {
            width: 1.0,
            height: 0.7,
            depth: 0.3
        }, this.scene);
        mainBody.position.set(position.x, position.y, position.z);
        mainBody.scaling.set(scale.x, scale.y, scale.z);
        
        // Monitor material
        const monitorMaterial = new BABYLON.PBRMaterial("cardiacMonitorMaterial", this.scene);
        monitorMaterial.baseColor = new BABYLON.Color3(0.85, 0.85, 0.9);
        monitorMaterial.metallicFactor = 0.2;
        monitorMaterial.roughnessFactor = 0.7;
        mainBody.material = monitorMaterial;
        
        // Create main display
        const mainDisplay = BABYLON.MeshBuilder.CreatePlane("cardiacMainDisplay", {
            width: 0.7,
            height: 0.4
        }, this.scene);
        mainDisplay.position.set(position.x, position.y + 0.05, position.z + 0.16);
        
        const displayMaterial = new BABYLON.PBRMaterial("cardiacDisplayMaterial", this.scene);
        displayMaterial.baseColor = new BABYLON.Color3(0.05, 0.05, 0.1);
        displayMaterial.emissiveColor = new BABYLON.Color3(0.0, 0.6, 1.0);
        displayMaterial.emissiveIntensity = 0.6;
        
        const vitalSignsTexture = this.createVitalSignsTexture();
        displayMaterial.emissiveTexture = vitalSignsTexture;
        mainDisplay.material = displayMaterial;
        
        // Create parameter displays
        const parameterDisplays = [];
        const parameters = [
            { label: 'HR', value: '72', unit: 'bpm', x: -0.3, y: -0.2 },
            { label: 'BP', value: '120/80', unit: 'mmHg', x: 0.0, y: -0.2 },
            { label: 'SpO2', value: '98', unit: '%', x: 0.3, y: -0.2 }
        ];
        
        parameters.forEach((param, index) => {
            const paramDisplay = BABYLON.MeshBuilder.CreatePlane(`paramDisplay${index}`, {
                width: 0.18,
                height: 0.08
            }, this.scene);
            paramDisplay.position.set(
                position.x + param.x,
                position.y + param.y,
                position.z + 0.16
            );
            
            const paramMaterial = new BABYLON.PBRMaterial(`paramMaterial${index}`, this.scene);
            paramMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            paramMaterial.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.0);
            paramMaterial.emissiveIntensity = 0.7;
            
            const paramTexture = this.createParameterTexture(param.label, param.value, param.unit);
            paramMaterial.emissiveTexture = paramTexture;
            paramDisplay.material = paramMaterial;
            
            parameterDisplays.push({
                mesh: paramDisplay,
                parameter: param,
                texture: paramTexture
            });
        });
        
        // Create alarm indicators
        const alarmIndicators = [];
        const alarmPositions = [
            { x: -0.4, y: 0.25, color: [1, 0, 0], label: 'HIGH' },
            { x: -0.2, y: 0.25, color: [1, 1, 0], label: 'LOW' },
            { x: 0.0, y: 0.25, color: [0, 1, 0], label: 'NORMAL' }
        ];
        
        alarmPositions.forEach((alarmPos, index) => {
            const indicator = BABYLON.MeshBuilder.CreateSphere(`alarmIndicator${index}`, {
                diameter: 0.03
            }, this.scene);
            indicator.position.set(
                position.x + alarmPos.x,
                position.y + alarmPos.y,
                position.z + 0.16
            );
            
            const indicatorMaterial = new BABYLON.PBRMaterial(`alarmIndicatorMaterial${index}`, this.scene);
            indicatorMaterial.baseColor = new BABYLON.Color3(...alarmPos.color);
            indicatorMaterial.emissiveColor = new BABYLON.Color3(...alarmPos.color);
            indicatorMaterial.emissiveIntensity = 0.8;
            indicator.material = indicatorMaterial;
            
            alarmIndicators.push({
                mesh: indicator,
                label: alarmPos.label,
                color: alarmPos.color
            });
        });
        
        return {
            mainBody: mainBody,
            components: [mainDisplay, ...parameterDisplays.map(p => p.mesh), ...alarmIndicators.map(a => a.mesh)],
            mainDisplay: mainDisplay,
            parameterDisplays: parameterDisplays,
            alarmIndicators: alarmIndicators,
            vitalSignsTexture: vitalSignsTexture
        };
    }
    /**
     * Create Analytical Balance with precision display
     */
    async createAnalyticalBalance(config) {
        console.log('⚖️ Creating Analytical Balance...');
        
        const { position, scale } = config;
        
        // Main balance body
        const mainBody = BABYLON.MeshBuilder.CreateBox("balanceBody", {
            width: 0.8,
            height: 0.6,
            depth: 0.6
        }, this.scene);
        mainBody.position.set(position.x, position.y, position.z);
        mainBody.scaling.set(scale.x, scale.y, scale.z);
        
        // Balance material - laboratory equipment
        const balanceMaterial = new BABYLON.PBRMaterial("balanceMaterial", this.scene);
        balanceMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.92);
        balanceMaterial.metallicFactor = 0.2;
        balanceMaterial.roughnessFactor = 0.7;
        mainBody.material = balanceMaterial;
        
        // Create weighing chamber (glass enclosure)
        const chamber = BABYLON.MeshBuilder.CreateBox("weighingChamber", {
            width: 0.4,
            height: 0.4,
            depth: 0.4
        }, this.scene);
        chamber.position.set(position.x, position.y + 0.3, position.z);
        
        const glassMaterial = new BABYLON.PBRMaterial("balanceGlassMaterial", this.scene);
        glassMaterial.baseColor = new BABYLON.Color3(0.9, 0.95, 1.0);
        glassMaterial.metallicFactor = 0.0;
        glassMaterial.roughnessFactor = 0.0;
        glassMaterial.alpha = 0.2;
        glassMaterial.indexOfRefraction = 1.52;
        chamber.material = glassMaterial;
        
        // Create weighing pan
        const pan = BABYLON.MeshBuilder.CreateCylinder("weighingPan", {
            height: 0.01,
            diameter: 0.15
        }, this.scene);
        pan.position.set(position.x, position.y + 0.11, position.z);
        
        const panMaterial = new BABYLON.PBRMaterial("panMaterial", this.scene);
        panMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
        panMaterial.metallicFactor = 0.9;
        panMaterial.roughnessFactor = 0.1;
        pan.material = panMaterial;
        
        // Create display screen
        const display = BABYLON.MeshBuilder.CreatePlane("balanceDisplay", {
            width: 0.3,
            height: 0.15
        }, this.scene);
        display.position.set(position.x, position.y - 0.1, position.z + 0.31);
        
        const displayMaterial = new BABYLON.PBRMaterial("balanceDisplayMaterial", this.scene);
        displayMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        displayMaterial.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.0);
        displayMaterial.emissiveIntensity = 0.7;
        
        const weightTexture = this.createWeightDisplayTexture(0.0000, config.precision);
        displayMaterial.emissiveTexture = weightTexture;
        display.material = displayMaterial;
        
        // Create control buttons
        const buttons = [];
        const buttonLabels = ['TARE', 'CAL', 'PRINT', 'MENU'];
        buttonLabels.forEach((label, index) => {
            const button = BABYLON.MeshBuilder.CreateCylinder(`balanceButton${index}`, {
                height: 0.02,
                diameter: 0.06
            }, this.scene);
            button.position.set(
                position.x - 0.15 + index * 0.1,
                position.y - 0.2,
                position.z + 0.31
            );
            
            const buttonMaterial = new BABYLON.PBRMaterial(`balanceButtonMaterial${index}`, this.scene);
            buttonMaterial.baseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            buttonMaterial.metallicFactor = 0.8;
            buttonMaterial.roughnessFactor = 0.3;
            button.material = buttonMaterial;
            
            buttons.push({ mesh: button, label: label });
        });
        
        // Create calibration weight (removable)
        const calWeight = BABYLON.MeshBuilder.CreateCylinder("calibrationWeight", {
            height: 0.02,
            diameter: 0.08
        }, this.scene);
        calWeight.position.set(position.x + 0.3, position.y + 0.01, position.z + 0.2);
        
        const weightMaterial = new BABYLON.PBRMaterial("calWeightMaterial", this.scene);
        weightMaterial.baseColor = new BABYLON.Color3(0.7, 0.7, 0.2);
        weightMaterial.metallicFactor = 0.9;
        weightMaterial.roughnessFactor = 0.1;
        calWeight.material = weightMaterial;
        
        return {
            mainBody: mainBody,
            components: [chamber, pan, display, calWeight, ...buttons.map(b => b.mesh)],
            chamber: chamber,
            pan: pan,
            display: display,
            buttons: buttons,
            calWeight: calWeight,
            weightTexture: weightTexture
        };
    }

    /**
     * Create Centrifuge with spinning animation
     */
    async createCentrifuge(config) {
        console.log('🌀 Creating Centrifuge...');
        
        const { position, scale } = config;
        
        // Main centrifuge body
        const mainBody = BABYLON.MeshBuilder.CreateCylinder("centrifugeBody", {
            height: 0.8,
            diameter: 1.2
        }, this.scene);
        mainBody.position.set(position.x, position.y, position.z);
        mainBody.scaling.set(scale.x, scale.y, scale.z);
        
        // Centrifuge material
        const centrifugeMaterial = new BABYLON.PBRMaterial("centrifugeMaterial", this.scene);
        centrifugeMaterial.baseColor = new BABYLON.Color3(0.85, 0.85, 0.9);
        centrifugeMaterial.metallicFactor = 0.3;
        centrifugeMaterial.roughnessFactor = 0.6;
        mainBody.material = centrifugeMaterial;
        
        // Create lid
        const lid = BABYLON.MeshBuilder.CreateCylinder("centrifugeLid", {
            height: 0.05,
            diameter: 1.15
        }, this.scene);
        lid.position.set(position.x, position.y + 0.4, position.z);
        lid.material = centrifugeMaterial;
        
        // Create rotor (spinning part)
        const rotor = BABYLON.MeshBuilder.CreateCylinder("centrifugeRotor", {
            height: 0.1,
            diameter: 0.8
        }, this.scene);
        rotor.position.set(position.x, position.y + 0.05, position.z);
        
        const rotorMaterial = new BABYLON.PBRMaterial("rotorMaterial", this.scene);
        rotorMaterial.baseColor = new BABYLON.Color3(0.7, 0.7, 0.75);
        rotorMaterial.metallicFactor = 0.8;
        rotorMaterial.roughnessFactor = 0.2;
        rotor.material = rotorMaterial;
        
        // Create sample tubes
        const tubes = [];
        const tubeCount = 8;
        for (let i = 0; i < tubeCount; i++) {
            const angle = (i / tubeCount) * Math.PI * 2;
            const tubeRadius = 0.3;
            
            const tube = BABYLON.MeshBuilder.CreateCylinder(`tube${i}`, {
                height: 0.15,
                diameter: 0.04
            }, this.scene);
            tube.position.set(
                position.x + Math.cos(angle) * tubeRadius,
                position.y + 0.125,
                position.z + Math.sin(angle) * tubeRadius
            );
            
            const tubeMaterial = new BABYLON.PBRMaterial(`tubeMaterial${i}`, this.scene);
            tubeMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.95);
            tubeMaterial.metallicFactor = 0.1;
            tubeMaterial.roughnessFactor = 0.8;
            tube.material = tubeMaterial;
            
            tubes.push(tube);
        }
        
        // Create control panel
        const controlPanel = BABYLON.MeshBuilder.CreatePlane("centrifugePanel", {
            width: 0.6,
            height: 0.4
        }, this.scene);
        controlPanel.position.set(position.x, position.y - 0.1, position.z + 0.61);
        
        const panelMaterial = new BABYLON.PBRMaterial("centrifugePanelMaterial", this.scene);
        panelMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        panelMaterial.metallicFactor = 0.7;
        panelMaterial.roughnessFactor = 0.4;
        controlPanel.material = panelMaterial;
        
        // Create RPM display
        const rpmDisplay = BABYLON.MeshBuilder.CreatePlane("rpmDisplay", {
            width: 0.25,
            height: 0.12
        }, this.scene);
        rpmDisplay.position.set(position.x, position.y + 0.05, position.z + 0.62);
        
        const rpmDisplayMaterial = new BABYLON.PBRMaterial("rpmDisplayMaterial", this.scene);
        rpmDisplayMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        rpmDisplayMaterial.emissiveColor = new BABYLON.Color3(1.0, 0.3, 0.0);
        rpmDisplayMaterial.emissiveIntensity = 0.8;
        
        const rpmTexture = this.createRPMDisplayTexture(0);
        rpmDisplayMaterial.emissiveTexture = rpmTexture;
        rpmDisplay.material = rpmDisplayMaterial;
        
        // Create control buttons
        const controlButtons = [];
        const buttonLabels = ['START', 'STOP', 'SPEED+', 'SPEED-'];
        buttonLabels.forEach((label, index) => {
            const button = BABYLON.MeshBuilder.CreateCylinder(`centrifugeButton${index}`, {
                height: 0.03,
                diameter: 0.08
            }, this.scene);
            button.position.set(
                position.x - 0.15 + (index % 2) * 0.3,
                position.y - 0.15 + Math.floor(index / 2) * 0.1,
                position.z + 0.62
            );
            
            const buttonColor = label === 'START' ? [0.2, 0.8, 0.2] : 
                               label === 'STOP' ? [0.8, 0.2, 0.2] : [0.3, 0.3, 0.3];
            
            const buttonMaterial = new BABYLON.PBRMaterial(`centrifugeButtonMaterial${index}`, this.scene);
            buttonMaterial.baseColor = new BABYLON.Color3(...buttonColor);
            buttonMaterial.metallicFactor = 0.6;
            buttonMaterial.roughnessFactor = 0.4;
            button.material = buttonMaterial;
            
            controlButtons.push({ mesh: button, label: label });
        });
        
        return {
            mainBody: mainBody,
            components: [lid, rotor, controlPanel, rpmDisplay, ...tubes, ...controlButtons.map(b => b.mesh)],
            lid: lid,
            rotor: rotor,
            tubes: tubes,
            controlPanel: controlPanel,
            rpmDisplay: rpmDisplay,
            controlButtons: controlButtons,
            rpmTexture: rpmTexture
        };
    }

    /**
     * Create Microscope with adjustable components
     */
    async createMicroscope(config) {
        console.log('🔬 Creating Microscope...');
        
        const { position, scale } = config;
        
        // Microscope base
        const base = BABYLON.MeshBuilder.CreateCylinder("microscopeBase", {
            height: 0.15,
            diameter: 0.5
        }, this.scene);
        base.position.set(position.x, position.y - 0.325, position.z);
        base.scaling.set(scale.x, scale.y, scale.z);
        
        const microscopeMaterial = new BABYLON.PBRMaterial("microscopeMaterial", this.scene);
        microscopeMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
        microscopeMaterial.metallicFactor = 0.8;
        microscopeMaterial.roughnessFactor = 0.2;
        base.material = microscopeMaterial;
        
        // Microscope arm/column
        const arm = BABYLON.MeshBuilder.CreateCylinder("microscopeArm", {
            height: 0.8,
            diameter: 0.08
        }, this.scene);
        arm.position.set(position.x, position.y, position.z - 0.1);
        arm.material = microscopeMaterial;
        
        // Stage (sample platform)
        const stage = BABYLON.MeshBuilder.CreateCylinder("microscopeStage", {
            height: 0.02,
            diameter: 0.3
        }, this.scene);
        stage.position.set(position.x, position.y - 0.1, position.z);
        stage.material = microscopeMaterial;
        
        // Stage clips
        const clips = [];
        for (let i = 0; i < 2; i++) {
            const clip = BABYLON.MeshBuilder.CreateBox(`stageClip${i}`, {
                width: 0.02,
                height: 0.01,
                depth: 0.08
            }, this.scene);
            clip.position.set(
                position.x + (i === 0 ? -0.1 : 0.1),
                position.y - 0.09,
                position.z
            );
            clip.material = microscopeMaterial;
            clips.push(clip);
        }
        
        // Objective lenses
        const objectives = [];
        const objectiveMagnifications = [4, 10, 40, 100];
        objectiveMagnifications.forEach((mag, index) => {
            const objective = BABYLON.MeshBuilder.CreateCylinder(`objective${mag}x`, {
                height: 0.12,
                diameterTop: 0.03,
                diameterBottom: 0.04
            }, this.scene);
            
            const angle = (index / objectiveMagnifications.length) * Math.PI * 2;
            const radius = 0.08;
            objective.position.set(
                position.x + Math.cos(angle) * radius,
                position.y + 0.15,
                position.z + Math.sin(angle) * radius
            );
            objective.material = microscopeMaterial;
            objectives.push({ mesh: objective, magnification: mag });
        });
        
        // Eyepiece
        const eyepiece = BABYLON.MeshBuilder.CreateCylinder("eyepiece", {
            height: 0.15,
            diameterTop: 0.06,
            diameterBottom: 0.04
        }, this.scene);
        eyepiece.position.set(position.x, position.y + 0.45, position.z - 0.1);
        eyepiece.material = microscopeMaterial;
        
        // Light source
        const lightSource = BABYLON.MeshBuilder.CreateSphere("microscopeLight", {
            diameter: 0.08
        }, this.scene);
        lightSource.position.set(position.x, position.y - 0.3, position.z);
        
        const lightMaterial = new BABYLON.PBRMaterial("microscopeLightMaterial", this.scene);
        lightMaterial.baseColor = new BABYLON.Color3(1.0, 1.0, 0.9);
        lightMaterial.emissiveColor = new BABYLON.Color3(1.0, 1.0, 0.8);
        lightMaterial.emissiveIntensity = 0.5;
        lightSource.material = lightMaterial;
        
        // Focus knobs
        const focusKnobs = [];
        const knobPositions = [
            { x: position.x + 0.15, y: position.y + 0.1, z: position.z - 0.1, type: 'coarse' },
            { x: position.x + 0.15, y: position.y - 0.05, z: position.z - 0.1, type: 'fine' }
        ];
        
        knobPositions.forEach((knobPos, index) => {
            const knob = BABYLON.MeshBuilder.CreateCylinder(`focusKnob${index}`, {
                height: 0.02,
                diameter: 0.08
            }, this.scene);
            knob.position.set(knobPos.x, knobPos.y, knobPos.z);
            knob.rotation.z = Math.PI / 2;
            
            const knobMaterial = new BABYLON.PBRMaterial(`knobMaterial${index}`, this.scene);
            knobMaterial.baseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            knobMaterial.metallicFactor = 0.7;
            knobMaterial.roughnessFactor = 0.3;
            knob.material = knobMaterial;
            
            focusKnobs.push({ mesh: knob, type: knobPos.type });
        });
        
        // Sample slide (optional)
        const slide = BABYLON.MeshBuilder.CreateBox("microscopeSlide", {
            width: 0.15,
            height: 0.002,
            depth: 0.05
        }, this.scene);
        slide.position.set(position.x, position.y - 0.089, position.z);
        
        const slideMaterial = new BABYLON.PBRMaterial("slideMaterial", this.scene);
        slideMaterial.baseColor = new BABYLON.Color3(0.9, 0.95, 1.0);
        slideMaterial.metallicFactor = 0.0;
        slideMaterial.roughnessFactor = 0.1;
        slideMaterial.alpha = 0.8;
        slide.material = slideMaterial;
        
        return {
            mainBody: base,
            components: [arm, stage, eyepiece, lightSource, slide, ...clips, ...objectives.map(o => o.mesh), ...focusKnobs.map(k => k.mesh)],
            arm: arm,
            stage: stage,
            eyepiece: eyepiece,
            lightSource: lightSource,
            objectives: objectives,
            focusKnobs: focusKnobs,
            slide: slide,
            clips: clips
        };
    }

    /**
     * Create pH Meter with digital display
     */
    async createPHMeter(config) {
        console.log('🧪 Creating pH Meter...');
        
        const { position, scale } = config;
        
        // Main pH meter body
        const mainBody = BABYLON.MeshBuilder.CreateBox("phMeterBody", {
            width: 0.4,
            height: 0.3,
            depth: 0.25
        }, this.scene);
        mainBody.position.set(position.x, position.y, position.z);
        mainBody.scaling.set(scale.x, scale.y, scale.z);
        
        // pH meter material
        const phMeterMaterial = new BABYLON.PBRMaterial("phMeterMaterial", this.scene);
        phMeterMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.95);
        phMeterMaterial.metallicFactor = 0.1;
        phMeterMaterial.roughnessFactor = 0.8;
        mainBody.material = phMeterMaterial;
        
        // Create display screen
        const display = BABYLON.MeshBuilder.CreatePlane("phDisplay", {
            width: 0.25,
            height: 0.15
        }, this.scene);
        display.position.set(position.x, position.y + 0.05, position.z + 0.126);
        
        const displayMaterial = new BABYLON.PBRMaterial("phDisplayMaterial", this.scene);
        displayMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        displayMaterial.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.0);
        displayMaterial.emissiveIntensity = 0.8;
        
        const phTexture = this.createPHDisplayTexture(config.currentPH, config.temperature);
        displayMaterial.emissiveTexture = phTexture;
        display.material = displayMaterial;
        
        // Create control buttons
        const buttons = [];
        const buttonLabels = ['CAL', 'MODE', 'HOLD'];
        buttonLabels.forEach((label, index) => {
            const button = BABYLON.MeshBuilder.CreateCylinder(`phButton${index}`, {
                height: 0.02,
                diameter: 0.05
            }, this.scene);
            button.position.set(
                position.x - 0.1 + index * 0.1,
                position.y - 0.08,
                position.z + 0.126
            );
            
            const buttonMaterial = new BABYLON.PBRMaterial(`phButtonMaterial${index}`, this.scene);
            buttonMaterial.baseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
            buttonMaterial.metallicFactor = 0.8;
            buttonMaterial.roughnessFactor = 0.3;
            button.material = buttonMaterial;
            
            buttons.push({ mesh: button, label: label });
        });
        
        // Create pH probe
        const probeHandle = BABYLON.MeshBuilder.CreateCylinder("probeHandle", {
            height: 0.15,
            diameter: 0.02
        }, this.scene);
        probeHandle.position.set(position.x + 0.3, position.y + 0.075, position.z);
        
        const probeHandleMaterial = new BABYLON.PBRMaterial("probeHandleMaterial", this.scene);
        probeHandleMaterial.baseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        probeHandleMaterial.metallicFactor = 0.8;
        probeHandleMaterial.roughnessFactor = 0.2;
        probeHandle.material = probeHandleMaterial;
        
        // Probe tip
        const probeTip = BABYLON.MeshBuilder.CreateCylinder("probeTip", {
            height: 0.08,
            diameterTop: 0.015,
            diameterBottom: 0.008
        }, this.scene);
        probeTip.position.set(position.x + 0.3, position.y - 0.04, position.z);
        
        const probeTipMaterial = new BABYLON.PBRMaterial("probeTipMaterial", this.scene);
        probeTipMaterial.baseColor = new BABYLON.Color3(0.9, 0.9, 0.95);
        probeTipMaterial.metallicFactor = 0.1;
        probeTipMaterial.roughnessFactor = 0.9;
        probeTip.material = probeTipMaterial;
        
        // Probe cable
        const cable = BABYLON.MeshBuilder.CreateCylinder("probeCable", {
            height: 0.4,
            diameter: 0.008
        }, this.scene);
        cable.position.set(position.x + 0.15, position.y + 0.075, position.z);
        cable.rotation.z = -Math.PI / 4;
        
        const cableMaterial = new BABYLON.PBRMaterial("cableMaterial", this.scene);
        cableMaterial.baseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        cableMaterial.metallicFactor = 0.0;
        cableMaterial.roughnessFactor = 0.9;
        cable.material = cableMaterial;
        
        // Calibration solutions (small bottles)
        const calSolutions = [];
        const phValues = [4.0, 7.0, 10.0];
        phValues.forEach((ph, index) => {
            const bottle = BABYLON.MeshBuilder.CreateCylinder(`calSolution${ph}`, {
                height: 0.08,
                diameter: 0.04
            }, this.scene);
            bottle.position.set(
                position.x - 0.15 + index * 0.08,
                position.y - 0.11,
                position.z - 0.1
            );
            
            const bottleMaterial = new BABYLON.PBRMaterial(`calSolutionMaterial${index}`, this.scene);
            const colors = [[1.0, 0.8, 0.8], [0.8, 1.0, 0.8], [0.8, 0.8, 1.0]];
            bottleMaterial.baseColor = new BABYLON.Color3(...colors[index]);
            bottleMaterial.metallicFactor = 0.0;
            bottleMaterial.roughnessFactor = 0.9;
            bottleMaterial.alpha = 0.7;
            bottle.material = bottleMaterial;
            
            calSolutions.push({ mesh: bottle, ph: ph });
        });
        
        return {
            mainBody: mainBody,
            components: [display, probeHandle, probeTip, cable, ...buttons.map(b => b.mesh), ...calSolutions.map(s => s.mesh)],
            display: display,
            probe: { handle: probeHandle, tip: probeTip, cable: cable },
            buttons: buttons,
            calSolutions: calSolutions,
            phTexture: phTexture
        };
    }
    async createWorkstation(id, config) { return { mainBody: null, components: [] }; }
    async createStorageSystem(id, config) { return { mainBody: null, components: [] }; }
    
    /**
     * Create ECG waveform texture
     */
    createECGWaveformTexture() {
        const texture = new BABYLON.DynamicTexture("ecgWaveform", {width: 512, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#001100';
        context.fillRect(0, 0, 512, 256);
        
        // Draw ECG waveform
        context.strokeStyle = '#00FF00';
        context.lineWidth = 2;
        context.beginPath();
        
        // Generate ECG pattern
        const centerY = 128;
        const amplitude = 60;
        let x = 0;
        
        while (x < 512) {
            // P wave
            context.moveTo(x, centerY);
            context.quadraticCurveTo(x + 10, centerY - 15, x + 20, centerY);
            x += 25;
            
            // QRS complex
            context.lineTo(x, centerY);
            context.lineTo(x + 5, centerY + 10);
            context.lineTo(x + 10, centerY - amplitude);
            context.lineTo(x + 15, centerY + amplitude * 0.3);
            context.lineTo(x + 20, centerY);
            x += 25;
            
            // T wave
            context.quadraticCurveTo(x + 15, centerY - 25, x + 30, centerY);
            x += 40;
            
            // Baseline
            context.lineTo(x + 20, centerY);
            x += 25;
        }
        
        context.stroke();
        texture.update();
        
        return texture;
    }

    /**
     * Create heart rate display texture
     */
    createHeartRateTexture(heartRate) {
        const texture = new BABYLON.DynamicTexture("heartRateDisplay", {width: 128, height: 64}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 128, 64);
        
        // Draw heart rate
        context.fillStyle = '#FF6600';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(heartRate.toString(), 64, 35);
        
        // Draw BPM label
        context.font = '12px Arial';
        context.fillText('BPM', 64, 55);
        
        texture.update();
        return texture;
    }

    /**
     * Create charge display texture for defibrillator
     */
    createChargeDisplayTexture(chargeLevel) {
        const texture = new BABYLON.DynamicTexture("chargeDisplay", {width: 256, height: 128}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 256, 128);
        
        // Draw charge level
        context.fillStyle = '#FF8800';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.fillText(chargeLevel.toString(), 128, 60);
        
        // Draw joules label
        context.font = '16px Arial';
        context.fillText('JOULES', 128, 85);
        
        // Draw charge bar
        const barWidth = 200;
        const barHeight = 20;
        const barX = 28;
        const barY = 100;
        
        context.strokeStyle = '#FFFFFF';
        context.strokeRect(barX, barY, barWidth, barHeight);
        
        if (chargeLevel > 0) {
            const fillWidth = (chargeLevel / 200) * barWidth;
            context.fillStyle = chargeLevel < 100 ? '#FFFF00' : '#FF0000';
            context.fillRect(barX, barY, fillWidth, barHeight);
        }
        
        texture.update();
        return texture;
    }

    /**
     * Create vital signs texture for cardiac monitor
     */
    createVitalSignsTexture() {
        const texture = new BABYLON.DynamicTexture("vitalSigns", {width: 512, height: 256}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#000033';
        context.fillRect(0, 0, 512, 256);
        
        // Draw grid
        context.strokeStyle = '#003366';
        context.lineWidth = 1;
        
        // Vertical grid lines
        for (let x = 0; x < 512; x += 25) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, 256);
            context.stroke();
        }
        
        // Horizontal grid lines
        for (let y = 0; y < 256; y += 25) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(512, y);
            context.stroke();
        }
        
        // Draw ECG trace
        context.strokeStyle = '#00CCFF';
        context.lineWidth = 2;
        context.beginPath();
        
        const centerY = 128;
        for (let x = 0; x < 512; x += 2) {
            const heartbeat = Math.sin((x / 512) * Math.PI * 8) * 40;
            const noise = (Math.random() - 0.5) * 5;
            const y = centerY + heartbeat + noise;
            
            if (x === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.stroke();
        
        texture.update();
        return texture;
    }

    /**
     * Create parameter display texture
     */
    createParameterTexture(label, value, unit) {
        const texture = new BABYLON.DynamicTexture(`param_${label}`, {width: 128, height: 64}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 128, 64);
        
        // Draw label
        context.fillStyle = '#00FF00';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillText(label, 5, 15);
        
        // Draw value
        context.font = 'bold 18px Arial';
        context.textAlign = 'center';
        context.fillText(value, 64, 35);
        
        // Draw unit
        context.font = '10px Arial';
        context.fillText(unit, 64, 55);
        
        texture.update();
        return texture;
    }

    /**
     * Handle medical device interactions
     */
    handleMedicalDeviceInteraction(equipmentId) {
        const state = this.equipmentStates.get(equipmentId);
        const equipment = this.equipment.get(equipmentId);
        
        if (!state || !equipment) return;
        
        switch (equipmentId) {
            case 'ecgMonitor':
                this.handleECGMonitorInteraction(equipment, state);
                break;
            case 'defibrillator':
                this.handleDefibrillatorInteraction(equipment, state);
                break;
            case 'cardiacMonitor':
                this.handleCardiacMonitorInteraction(equipment, state);
                break;
        }
    }

    /**
     * Handle ECG monitor interaction
     */
    handleECGMonitorInteraction(equipment, state) {
        // Toggle power or cycle through display modes
        if (state.powerState === 'off') {
            this.updateEquipmentStatus('ecgMonitor', { powerState: 'on' });
            console.log('📈 ECG Monitor powered on');
        } else {
            // Cycle through different heart rates for demonstration
            const heartRates = [60, 72, 85, 100, 120];
            const currentIndex = heartRates.indexOf(state.currentHeartRate || 72);
            const nextIndex = (currentIndex + 1) % heartRates.length;
            const newHeartRate = heartRates[nextIndex];
            
            this.updateEquipmentStatus('ecgMonitor', { currentHeartRate: newHeartRate });
            
            // Update heart rate display
            if (equipment.hrTexture) {
                equipment.hrTexture.dispose();
                equipment.hrTexture = this.createHeartRateTexture(newHeartRate);
                equipment.hrDisplay.material.emissiveTexture = equipment.hrTexture;
            }
            
            console.log(`📈 ECG Monitor heart rate set to ${newHeartRate} BPM`);
        }
    }

    /**
     * Handle defibrillator interaction
     */
    handleDefibrillatorInteraction(equipment, state) {
        // Cycle through charge levels
        const chargeLevels = [0, 50, 100, 150, 200];
        const currentIndex = chargeLevels.indexOf(state.currentCharge || 0);
        const nextIndex = (currentIndex + 1) % chargeLevels.length;
        const newCharge = chargeLevels[nextIndex];
        
        this.updateEquipmentStatus('defibrillator', { currentCharge: newCharge });
        
        // Update charge display
        if (equipment.chargeTexture) {
            equipment.chargeTexture.dispose();
            equipment.chargeTexture = this.createChargeDisplayTexture(newCharge);
            equipment.chargeDisplay.material.emissiveTexture = equipment.chargeTexture;
        }
        
        // Update button glow based on charge level
        if (equipment.shockButton && newCharge > 0) {
            equipment.shockButton.material.emissiveIntensity = 0.8;
        } else if (equipment.shockButton) {
            equipment.shockButton.material.emissiveIntensity = 0.2;
        }
        
        console.log(`⚡ Defibrillator charge set to ${newCharge} joules`);
    }

    /**
     * Handle cardiac monitor interaction
     */
    handleCardiacMonitorInteraction(equipment, state) {
        // Simulate alarm state changes
        const alarmStates = ['normal', 'warning', 'critical'];
        const currentAlarm = state.alarmState || 'normal';
        const currentIndex = alarmStates.indexOf(currentAlarm);
        const nextIndex = (currentIndex + 1) % alarmStates.length;
        const newAlarmState = alarmStates[nextIndex];
        
        this.updateEquipmentStatus('cardiacMonitor', { alarmState: newAlarmState });
        
        // Update alarm indicators
        if (equipment.alarmIndicators) {
            equipment.alarmIndicators.forEach((indicator, index) => {
                if (newAlarmState === 'normal' && indicator.label === 'NORMAL') {
                    indicator.mesh.material.emissiveIntensity = 1.0;
                } else if (newAlarmState === 'warning' && indicator.label === 'LOW') {
                    indicator.mesh.material.emissiveIntensity = 1.0;
                } else if (newAlarmState === 'critical' && indicator.label === 'HIGH') {
                    indicator.mesh.material.emissiveIntensity = 1.0;
                } else {
                    indicator.mesh.material.emissiveIntensity = 0.2;
                }
            });
        }
        
        console.log(`💓 Cardiac Monitor alarm state: ${newAlarmState}`);
    }

    /**
     * Update equipment visuals based on state
     */
    updateEquipmentVisuals(equipmentId, state) {
        const equipment = this.equipment.get(equipmentId);
        if (!equipment) return;
        
        // Update power indicators
        if (equipment.indicators) {
            equipment.indicators.forEach(indicator => {
                if (indicator.label === 'POWER') {
                    indicator.mesh.material.emissiveIntensity = state.powerState === 'on' ? 1.0 : 0.1;
                }
            });
        }
        
        // Update displays based on power state
        if (state.powerState === 'off') {
            if (equipment.screen) {
                equipment.screen.material.emissiveIntensity = 0.0;
            }
            if (equipment.mainDisplay) {
                equipment.mainDisplay.material.emissiveIntensity = 0.0;
            }
        } else {
            if (equipment.screen) {
                equipment.screen.material.emissiveIntensity = 0.5;
            }
            if (equipment.mainDisplay) {
                equipment.mainDisplay.material.emissiveIntensity = 0.6;
            }
        }
    }

    /**
     * Handle power state changes
     */
    handlePowerStateChange(equipmentId, powerState) {
        console.log(`🔌 ${equipmentId} power state changed to: ${powerState}`);
        
        const equipment = this.equipment.get(equipmentId);
        if (!equipment) return;
        
        if (powerState === 'on') {
            // Power on sequence
            this.animatePowerOn(equipment);
        } else {
            // Power off sequence
            this.animatePowerOff(equipment);
        }
    }

    /**
     * Animate power on sequence
     */
    animatePowerOn(equipment) {
        // Gradually increase display brightness
        if (equipment.screen || equipment.mainDisplay) {
            const display = equipment.screen || equipment.mainDisplay;
            let intensity = 0;
            
            const fadeIn = () => {
                intensity += 0.05;
                display.material.emissiveIntensity = intensity;
                
                if (intensity < 0.6) {
                    setTimeout(fadeIn, 50);
                }
            };
            
            fadeIn();
        }
    }

    /**
     * Animate power off sequence
     */
    animatePowerOff(equipment) {
        // Gradually decrease display brightness
        if (equipment.screen || equipment.mainDisplay) {
            const display = equipment.screen || equipment.mainDisplay;
            let intensity = display.material.emissiveIntensity;
            
            const fadeOut = () => {
                intensity -= 0.1;
                display.material.emissiveIntensity = Math.max(0, intensity);
                
                if (intensity > 0) {
                    setTimeout(fadeOut, 50);
                }
            };
            
            fadeOut();
        }
    }

    /**
     * Start indicator animations
     */
    startIndicatorAnimations() {
        // Animate blinking indicators
        setInterval(() => {
            this.equipmentStates.forEach((state, equipmentId) => {
                if (state.powerState === 'on') {
                    const equipment = this.equipment.get(equipmentId);
                    if (equipment && equipment.indicators) {
                        equipment.indicators.forEach(indicator => {
                            if (indicator.label === 'ALARM' && state.alarmState === 'critical') {
                                // Blink alarm indicator
                                const currentIntensity = indicator.mesh.material.emissiveIntensity;
                                indicator.mesh.material.emissiveIntensity = currentIntensity > 0.5 ? 0.2 : 1.0;
                            }
                        });
                    }
                }
            });
        }, 1000);
    }

    /**
     * Start display animations
     */
    startDisplayAnimations() {
        // Animate ECG waveforms
        setInterval(() => {
            this.equipmentStates.forEach((state, equipmentId) => {
                if (state.powerState === 'on' && equipmentId === 'ecgMonitor') {
                    const equipment = this.equipment.get(equipmentId);
                    if (equipment && equipment.waveformTexture) {
                        // Regenerate waveform for animation effect
                        equipment.waveformTexture.dispose();
                        equipment.waveformTexture = this.createECGWaveformTexture();
                        equipment.screen.material.emissiveTexture = equipment.waveformTexture;
                    }
                }
            });
        }, 2000);
    }

    /**
     * Update medical device behavior
     */
    updateMedicalDeviceBehavior(equipmentId, state, equipment) {
        // Continuous updates for medical devices
        if (state.powerState === 'on') {
            switch (equipmentId) {
                case 'ecgMonitor':
                    // Update heart rate variations
                    if (Math.random() < 0.01) { // 1% chance per frame
                        const currentHR = state.currentHeartRate || 72;
                        const variation = (Math.random() - 0.5) * 4; // ±2 BPM variation
                        const newHR = Math.max(50, Math.min(150, currentHR + variation));
                        
                        if (Math.abs(newHR - currentHR) > 1) {
                            this.updateEquipmentStatus(equipmentId, { currentHeartRate: Math.round(newHR) });
                        }
                    }
                    break;
                    
                case 'cardiacMonitor':
                    // Update vital signs
                    if (Math.random() < 0.005) { // 0.5% chance per frame
                        // Simulate realistic vital sign variations
                        this.updateVitalSigns(equipmentId, equipment);
                    }
                    break;
            }
        }
    }

    /**
     * Update vital signs for cardiac monitor
     */
    updateVitalSigns(equipmentId, equipment) {
        const state = this.equipmentStates.get(equipmentId);
        if (!state || !equipment.parameterDisplays) return;
        
        // Update each parameter display
        equipment.parameterDisplays.forEach((paramDisplay, index) => {
            const param = paramDisplay.parameter;
            let newValue = param.value;
            
            switch (param.label) {
                case 'HR':
                    const currentHR = parseInt(param.value) || 72;
                    const hrVariation = (Math.random() - 0.5) * 6;
                    newValue = Math.max(50, Math.min(150, currentHR + hrVariation)).toString();
                    break;
                    
                case 'SpO2':
                    const currentSpO2 = parseInt(param.value) || 98;
                    const spo2Variation = (Math.random() - 0.5) * 2;
                    newValue = Math.max(90, Math.min(100, currentSpO2 + spo2Variation)).toString();
                    break;
            }
            
            if (newValue !== param.value) {
                param.value = newValue;
                
                // Update texture
                paramDisplay.texture.dispose();
                paramDisplay.texture = this.createParameterTexture(param.label, param.value, param.unit);
                paramDisplay.mesh.material.emissiveTexture = paramDisplay.texture;
            }
        });
    }

    /**
     * Create weight display texture for analytical balance
     */
    createWeightDisplayTexture(weight, precision) {
        const texture = new BABYLON.DynamicTexture("weightDisplay", {width: 256, height: 128}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 256, 128);
        
        // Draw weight value
        context.fillStyle = '#00FF00';
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.fillText(weight.toFixed(4), 128, 60);
        
        // Draw unit
        context.font = '16px Arial';
        context.fillText('g', 128, 85);
        
        // Draw precision indicator
        context.font = '12px Arial';
        context.fillText(`±${precision}g`, 128, 105);
        
        texture.update();
        return texture;
    }

    /**
     * Create RPM display texture for centrifuge
     */
    createRPMDisplayTexture(rpm) {
        const texture = new BABYLON.DynamicTexture("rpmDisplay", {width: 256, height: 128}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 256, 128);
        
        // Draw RPM value
        context.fillStyle = '#FF6600';
        context.font = 'bold 28px Arial';
        context.textAlign = 'center';
        context.fillText(rpm.toString(), 128, 55);
        
        // Draw RPM label
        context.font = '14px Arial';
        context.fillText('RPM', 128, 80);
        
        // Draw status
        const status = rpm > 0 ? 'RUNNING' : 'STOPPED';
        context.fillStyle = rpm > 0 ? '#00FF00' : '#FF0000';
        context.font = '12px Arial';
        context.fillText(status, 128, 105);
        
        texture.update();
        return texture;
    }

    /**
     * Create pH display texture
     */
    createPHDisplayTexture(ph, temperature) {
        const texture = new BABYLON.DynamicTexture("phDisplay", {width: 256, height: 128}, this.scene);
        const context = texture.getContext();
        
        // Clear background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, 256, 128);
        
        // Draw pH value
        context.fillStyle = '#00FF00';
        context.font = 'bold 36px Arial';
        context.textAlign = 'center';
        context.fillText(ph.toFixed(2), 128, 50);
        
        // Draw pH label
        context.font = '16px Arial';
        context.fillText('pH', 128, 75);
        
        // Draw temperature
        context.font = '14px Arial';
        context.fillText(`${temperature.toFixed(1)}°C`, 128, 100);
        
        // Draw pH scale indicator
        const scaleY = 115;
        const scaleWidth = 200;
        const scaleX = 28;
        
        // Draw pH scale background
        context.fillStyle = '#333333';
        context.fillRect(scaleX, scaleY, scaleWidth, 8);
        
        // Draw pH indicator position
        const indicatorX = scaleX + (ph / 14) * scaleWidth;
        context.fillStyle = '#FFFF00';
        context.fillRect(indicatorX - 2, scaleY - 2, 4, 12);
        
        texture.update();
        return texture;
    }

    /**
     * Handle laboratory instrument interactions
     */
    handleInstrumentInteraction(equipmentId) {
        const state = this.equipmentStates.get(equipmentId);
        const equipment = this.equipment.get(equipmentId);
        
        if (!state || !equipment) return;
        
        switch (equipmentId) {
            case 'analyticalBalance':
                this.handleBalanceInteraction(equipment, state);
                break;
            case 'centrifuge':
                this.handleCentrifugeInteraction(equipment, state);
                break;
            case 'microscope':
                this.handleMicroscopeInteraction(equipment, state);
                break;
            case 'phMeter':
                this.handlePHMeterInteraction(equipment, state);
                break;
        }
    }

    /**
     * Handle analytical balance interaction
     */
    handleBalanceInteraction(equipment, state) {
        // Simulate weighing different samples
        const sampleWeights = [0.0000, 0.0125, 0.0567, 0.1234, 0.2891, 0.5678];
        const currentIndex = sampleWeights.indexOf(state.currentWeight || 0.0000);
        const nextIndex = (currentIndex + 1) % sampleWeights.length;
        const newWeight = sampleWeights[nextIndex];
        
        this.updateEquipmentStatus('analyticalBalance', { currentWeight: newWeight });
        
        // Update weight display
        if (equipment.weightTexture) {
            equipment.weightTexture.dispose();
            equipment.weightTexture = this.createWeightDisplayTexture(newWeight, state.config.precision);
            equipment.display.material.emissiveTexture = equipment.weightTexture;
        }
        
        // Animate weighing pan slightly
        if (equipment.pan && newWeight > 0) {
            const originalY = equipment.pan.position.y;
            equipment.pan.position.y = originalY - 0.002;
            setTimeout(() => {
                equipment.pan.position.y = originalY;
            }, 200);
        }
        
        console.log(`⚖️ Balance weight: ${newWeight.toFixed(4)}g`);
    }

    /**
     * Handle centrifuge interaction
     */
    handleCentrifugeInteraction(equipment, state) {
        // Toggle centrifuge operation
        const isRunning = state.operationalState === 'running';
        const newState = isRunning ? 'stopped' : 'running';
        const newRPM = isRunning ? 0 : 3000;
        
        this.updateEquipmentStatus('centrifuge', { 
            operationalState: newState,
            currentRPM: newRPM
        });
        
        // Update RPM display
        if (equipment.rpmTexture) {
            equipment.rpmTexture.dispose();
            equipment.rpmTexture = this.createRPMDisplayTexture(newRPM);
            equipment.rpmDisplay.material.emissiveTexture = equipment.rpmTexture;
        }
        
        // Start/stop rotor animation
        if (newState === 'running') {
            this.startCentrifugeAnimation(equipment);
        } else {
            this.stopCentrifugeAnimation(equipment);
        }
        
        console.log(`🌀 Centrifuge ${newState} at ${newRPM} RPM`);
    }

    /**
     * Handle microscope interaction
     */
    handleMicroscopeInteraction(equipment, state) {
        // Cycle through objective magnifications
        const magnifications = [4, 10, 40, 100];
        const currentMag = state.currentMagnification || 4;
        const currentIndex = magnifications.indexOf(currentMag);
        const nextIndex = (currentIndex + 1) % magnifications.length;
        const newMagnification = magnifications[nextIndex];
        
        this.updateEquipmentStatus('microscope', { currentMagnification: newMagnification });
        
        // Rotate objective turret to new position
        if (equipment.objectives) {
            const targetObjective = equipment.objectives.find(obj => obj.magnification === newMagnification);
            if (targetObjective) {
                // Animate objective rotation (simplified)
                const rotationAngle = (nextIndex / magnifications.length) * Math.PI * 2;
                equipment.objectives.forEach((obj, index) => {
                    const angle = rotationAngle + (index / magnifications.length) * Math.PI * 2;
                    const radius = 0.08;
                    obj.mesh.position.x = equipment.mainBody.position.x + Math.cos(angle) * radius;
                    obj.mesh.position.z = equipment.mainBody.position.z + Math.sin(angle) * radius;
                });
            }
        }
        
        // Adjust light intensity based on magnification
        if (equipment.lightSource) {
            const intensity = 0.3 + (newMagnification / 100) * 0.5;
            equipment.lightSource.material.emissiveIntensity = intensity;
        }
        
        console.log(`🔬 Microscope magnification: ${newMagnification}x`);
    }

    /**
     * Handle pH meter interaction
     */
    handlePHMeterInteraction(equipment, state) {
        // Simulate different pH readings
        const phReadings = [1.5, 4.0, 7.0, 9.2, 12.8];
        const currentPH = state.currentPH || 7.0;
        const currentIndex = phReadings.findIndex(ph => Math.abs(ph - currentPH) < 0.1);
        const nextIndex = (currentIndex + 1) % phReadings.length;
        const newPH = phReadings[nextIndex];
        
        // Simulate temperature variation
        const newTemp = 25.0 + (Math.random() - 0.5) * 4; // 23-27°C
        
        this.updateEquipmentStatus('phMeter', { 
            currentPH: newPH,
            temperature: newTemp
        });
        
        // Update pH display
        if (equipment.phTexture) {
            equipment.phTexture.dispose();
            equipment.phTexture = this.createPHDisplayTexture(newPH, newTemp);
            equipment.display.material.emissiveTexture = equipment.phTexture;
        }
        
        console.log(`🧪 pH: ${newPH.toFixed(2)}, Temp: ${newTemp.toFixed(1)}°C`);
    }

    /**
     * Start centrifuge rotor animation
     */
    startCentrifugeAnimation(equipment) {
        if (!equipment.rotor) return;
        
        const animationKeys = [];
        animationKeys.push({
            frame: 0,
            value: 0
        });
        animationKeys.push({
            frame: 60,
            value: Math.PI * 2
        });
        
        const rotationAnimation = new BABYLON.Animation(
            "centrifugeRotation",
            "rotation.y",
            60,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        rotationAnimation.setKeys(animationKeys);
        equipment.rotor.animations = [rotationAnimation];
        
        this.scene.beginAnimation(equipment.rotor, 0, 60, true);
        
        // Also animate tubes
        if (equipment.tubes) {
            equipment.tubes.forEach(tube => {
                tube.animations = [rotationAnimation];
                this.scene.beginAnimation(tube, 0, 60, true);
            });
        }
    }

    /**
     * Stop centrifuge rotor animation
     */
    stopCentrifugeAnimation(equipment) {
        if (equipment.rotor) {
            this.scene.stopAnimation(equipment.rotor);
        }
        
        if (equipment.tubes) {
            equipment.tubes.forEach(tube => {
                this.scene.stopAnimation(tube);
            });
        }
    }

    /**
     * Update laboratory instrument behavior
     */
    updateInstrumentBehavior(equipmentId, state, equipment) {
        // Continuous updates for laboratory instruments
        if (state.powerState === 'on') {
            switch (equipmentId) {
                case 'analyticalBalance':
                    // Simulate environmental vibrations affecting readings
                    if (Math.random() < 0.001 && state.currentWeight > 0) { // Very rare fluctuations
                        const fluctuation = (Math.random() - 0.5) * 0.0002; // ±0.0001g
                        const newWeight = Math.max(0, state.currentWeight + fluctuation);
                        this.updateEquipmentStatus(equipmentId, { currentWeight: newWeight });
                    }
                    break;
                    
                case 'centrifuge':
                    // Update RPM during operation
                    if (state.operationalState === 'running' && Math.random() < 0.01) {
                        const rpmVariation = (Math.random() - 0.5) * 50; // ±25 RPM variation
                        const newRPM = Math.max(0, state.currentRPM + rpmVariation);
                        this.updateEquipmentStatus(equipmentId, { currentRPM: Math.round(newRPM) });
                    }
                    break;
                    
                case 'phMeter':
                    // Simulate pH drift over time
                    if (Math.random() < 0.002) { // 0.2% chance per frame
                        const drift = (Math.random() - 0.5) * 0.02; // ±0.01 pH units
                        const newPH = Math.max(0, Math.min(14, state.currentPH + drift));
                        this.updateEquipmentStatus(equipmentId, { currentPH: newPH });
                    }
                    break;
            }
        }
    }

    // Placeholder methods for other equipment types (to be implemented in subsequent tasks)
    handleWorkstationInteraction(equipmentId) {}
    handleStorageInteraction(equipmentId) {}
}