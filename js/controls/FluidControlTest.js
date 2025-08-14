import { FluidControlSystem } from './FluidControlSystem.js';
import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';

/**
 * Test suite for FluidControlSystem
 * Verifies fluid flow monitoring, blood analysis, and UI integration
 */
export class FluidControlTest {
    constructor() {
        this.testResults = [];
        this.mockSceneManager = this.createMockSceneManager();
    }

    /**
     * Create a mock scene manager for testing
     */
    createMockSceneManager() {
        return {
            scene: { fogDensity: 0.05 },
            getEntity: (name) => {
                if (name === 'fluidSim') {
                    return {
                        currentLevel: 0.3,
                        targetLevel: 0.8,
                        fillSpeed: 0.0001,
                        viscosity: 2.0,
                        isFlowing: false,
                        shaderMaterial: {
                            setFloat: (name, value) => {
                                this[name] = value;
                            }
                        },
                        startFilling: (level) => {
                            this.isFlowing = true;
                            this.targetLevel = level;
                        },
                        stopFilling: () => {
                            this.isFlowing = false;
                        },
                        getMesh: () => ({
                            isVisible: true,
                            position: { x: 0, y: -2.2, z: 0 },
                            scaling: { x: 0.4, y: 0.4, z: 0.4 }
                        })
                    };
                }
                return null;
            }
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('Starting FluidControlSystem tests...');
        
        // Create a mock DOM environment for testing
        this.setupMockDOM();
        
        this.testFluidControlSystemCreation();
        this.testFlowMonitoring();
        this.testParameterCallbacks();
        this.testBloodAnalysis();
        this.testUIElements();
        this.testFlowPatterns();
        
        this.printResults();
        return this.testResults;
    }

    /**
     * Setup mock DOM elements for testing
     */
    setupMockDOM() {
        // Create mock control panel structure
        if (!document.querySelector('.control-panel')) {
            const panel = document.createElement('div');
            panel.className = 'control-panel';
            
            const bloodSection = document.createElement('div');
            bloodSection.setAttribute('data-section-id', 'blood');
            
            const sectionContent = document.createElement('div');
            sectionContent.className = 'section-content';
            
            bloodSection.appendChild(sectionContent);
            panel.appendChild(bloodSection);
            document.body.appendChild(panel);
        }
    }

    /**
     * Test fluid control system creation
     */
    testFluidControlSystemCreation() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        this.assert(fluidControl !== null, 'FluidControlSystem should be created successfully');
        this.assert(fluidControl.fluidMonitor !== undefined, 'Fluid monitor should be initialized');
        this.assert(fluidControl.bloodProperties !== undefined, 'Blood properties should be defined');
        this.assert(fluidControl.flowPatterns !== undefined, 'Flow patterns should be defined');
        
        // Test initial state
        this.assert(fluidControl.fluidMonitor.currentLevel >= 0, 'Initial level should be non-negative');
        this.assert(fluidControl.currentFlowPattern === 'laminar', 'Initial flow pattern should be laminar');
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test flow monitoring functionality
     */
    testFlowMonitoring() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        const fluidSim = this.mockSceneManager.getEntity('fluidSim');
        
        // Test flow stats update
        const initialLevel = fluidControl.fluidMonitor.currentLevel;
        
        // Simulate level change
        fluidSim.currentLevel = initialLevel + 0.1;
        fluidControl.updateFlowStats();
        
        this.assert(
            fluidControl.fluidMonitor.currentLevel === fluidSim.currentLevel,
            'Current level should be updated correctly'
        );
        
        // Test volume calculation
        const expectedVolume = (fluidSim.currentLevel * 1000).toFixed(1);
        this.assert(
            fluidControl.fluidMonitor.totalVolume === expectedVolume,
            'Total volume should be calculated correctly'
        );
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test parameter callbacks
     */
    testParameterCallbacks() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        const fluidSim = this.mockSceneManager.getEntity('fluidSim');
        
        // Test flow rate callback
        const originalFillSpeed = fluidSim.fillSpeed;
        fluidControl.onFlowRateChange(0.005);
        
        this.assert(
            fluidSim.fillSpeed === 0.005,
            'Fill speed should be updated correctly'
        );
        
        // Test viscosity callback
        const originalViscosity = fluidControl.fluidMonitor.viscosity;
        fluidControl.onViscosityChange(3.0);
        
        this.assert(
            fluidControl.fluidMonitor.viscosity === 3.0,
            'Viscosity should be updated correctly'
        );
        
        // Test blood level callback
        const originalTargetLevel = fluidSim.targetLevel;
        fluidControl.onBloodLevelChange(0.9);
        
        this.assert(
            fluidSim.targetLevel === 0.9,
            'Target level should be updated correctly'
        );
        
        // Test flow toggle callback
        fluidControl.onFlowToggle(true);
        this.assert(
            fluidSim.isFlowing === true,
            'Flow toggle should start flow'
        );
        
        fluidControl.onFlowToggle(false);
        this.assert(
            fluidSim.isFlowing === false,
            'Flow toggle should stop flow'
        );
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test blood analysis functionality
     */
    testBloodAnalysis() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test initial blood properties
        this.assert(
            fluidControl.bloodProperties.oxygenation >= 85 && 
            fluidControl.bloodProperties.oxygenation <= 100,
            'Oxygenation should be within realistic range'
        );
        
        this.assert(
            fluidControl.bloodProperties.temperature >= 36 && 
            fluidControl.bloodProperties.temperature <= 38,
            'Temperature should be within realistic range'
        );
        
        this.assert(
            fluidControl.bloodProperties.pressure >= 80 && 
            fluidControl.bloodProperties.pressure <= 180,
            'Pressure should be within realistic range'
        );
        
        // Test blood properties update
        fluidControl.fluidMonitor.isFlowing = false;
        const initialOxygenation = fluidControl.bloodProperties.oxygenation;
        
        fluidControl.updateBloodProperties();
        
        // Oxygenation should decrease when not flowing
        this.assert(
            fluidControl.bloodProperties.oxygenation <= initialOxygenation,
            'Oxygenation should decrease when not flowing'
        );
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test flow patterns
     */
    testFlowPatterns() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test different flow rates and patterns
        const testCases = [
            { rate: 0.05, expectedPattern: 'laminar' },
            { rate: 0.2, expectedPattern: 'transitional' },
            { rate: 0.5, expectedPattern: 'turbulent' }
        ];
        
        testCases.forEach(testCase => {
            fluidControl.fluidMonitor.fillRate = testCase.rate;
            fluidControl.updateFlowPattern();
            
            this.assert(
                fluidControl.currentFlowPattern === testCase.expectedPattern,
                `Flow rate ${testCase.rate} should set pattern to ${testCase.expectedPattern}`
            );
        });
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test UI elements creation
     */
    testUIElements() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test fluid display creation
        const fluidDisplay = document.querySelector('.fluid-display');
        this.assert(fluidDisplay !== null, 'Fluid display should be created');
        
        // Test fluid monitor elements
        const fluidLevelFill = document.getElementById('fluidLevelFill');
        const fluidLevelCurrent = document.getElementById('fluidLevelCurrent');
        const fluidVolume = document.getElementById('fluidVolume');
        const flowRate = document.getElementById('flowRate');
        const flowDirection = document.getElementById('flowDirection');
        const flowStatus = document.getElementById('flowStatus');
        
        this.assert(fluidLevelFill !== null, 'Fluid level fill element should exist');
        this.assert(fluidLevelCurrent !== null, 'Fluid level current element should exist');
        this.assert(fluidVolume !== null, 'Fluid volume element should exist');
        this.assert(flowRate !== null, 'Flow rate element should exist');
        this.assert(flowDirection !== null, 'Flow direction element should exist');
        this.assert(flowStatus !== null, 'Flow status element should exist');
        
        // Test flow visualization
        const flowCanvas = document.getElementById('flowCanvas');
        this.assert(flowCanvas !== null, 'Flow canvas should be created');
        
        // Test blood analysis elements
        const oxygenation = document.getElementById('oxygenation');
        const temperature = document.getElementById('temperature');
        const viscosityDisplay = document.getElementById('viscosityDisplay');
        const pressure = document.getElementById('pressure');
        
        this.assert(oxygenation !== null, 'Oxygenation element should exist');
        this.assert(temperature !== null, 'Temperature element should exist');
        this.assert(viscosityDisplay !== null, 'Viscosity display element should exist');
        this.assert(pressure !== null, 'Pressure element should exist');
        
        // Test display update
        fluidControl.fluidMonitor.currentLevel = 0.6;
        fluidControl.fluidMonitor.totalVolume = '600.0';
        fluidControl.fluidMonitor.fillRate = 0.002;
        fluidControl.fluidMonitor.flowDirection = 'filling';
        fluidControl.updateFluidDisplay();
        
        this.assert(
            fluidLevelCurrent.textContent === '60.0%',
            'Fluid level display should update correctly'
        );
        
        this.assert(
            fluidVolume.textContent === '600.0 ml',
            'Fluid volume display should update correctly'
        );
        
        this.assert(
            flowRate.textContent === '2.0',
            'Flow rate display should update correctly'
        );
        
        this.assert(
            flowDirection.textContent === 'Filling',
            'Flow direction display should update correctly'
        );
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test drain functionality
     */
    testDrainFunctionality() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        const fluidSim = this.mockSceneManager.getEntity('fluidSim');
        
        // Set initial state
        fluidSim.currentLevel = 0.8;
        fluidSim.targetLevel = 0.8;
        fluidSim.isFlowing = true;
        
        // Test drain functionality
        fluidControl.drainBlood();
        
        this.assert(
            fluidSim.currentLevel === 0,
            'Drain should set current level to 0'
        );
        
        this.assert(
            fluidSim.targetLevel === 0,
            'Drain should set target level to 0'
        );
        
        this.assert(
            fluidSim.isFlowing === false,
            'Drain should stop flow'
        );
        
        this.assert(
            fluidControl.fluidMonitor.currentLevel === 0,
            'Drain should reset monitor level'
        );
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test fluid statistics
     */
    testFluidStatistics() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const fluidControl = new FluidControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Update some values
        fluidControl.fluidMonitor.currentLevel = 0.7;
        fluidControl.fluidMonitor.fillRate = 0.003;
        fluidControl.fluidMonitor.flowDirection = 'filling';
        fluidControl.currentFlowPattern = 'transitional';
        
        const stats = fluidControl.getFluidStatistics();
        
        this.assert(stats.currentLevel === 0.7, 'Statistics should include current level');
        this.assert(stats.fillRate === 0.003, 'Statistics should include fill rate');
        this.assert(stats.flowDirection === 'filling', 'Statistics should include flow direction');
        this.assert(stats.flowPattern === 'transitional', 'Statistics should include flow pattern');
        this.assert(typeof stats.bloodProperties === 'object', 'Statistics should include blood properties');
        
        fluidControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Assert a condition and record the result
     */
    assert(condition, message) {
        const result = {
            passed: !!condition,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (result.passed) {
            console.log(`✓ ${message}`);
        } else {
            console.error(`✗ ${message}`);
        }
    }

    /**
     * Print test results summary
     */
    printResults() {
        const passed = this.testResults.filter(r => r.passed).length;
        const total = this.testResults.length;
        
        console.log(`\nFluidControl Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All fluid control tests passed!');
        } else {
            console.log('❌ Some fluid control tests failed. Check the output above for details.');
        }
    }
}

// Export a function to run tests easily
export function runFluidControlTests() {
    const tester = new FluidControlTest();
    return tester.runAllTests();
}