import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';

/**
 * Test suite for ParameterController
 * Run this to verify parameter management functionality
 */
export class ParameterControllerTest {
    constructor() {
        this.testResults = [];
        this.mockSceneManager = this.createMockSceneManager();
    }

    /**
     * Create a mock scene manager for testing
     */
    createMockSceneManager() {
        return {
            scene: {
                fogDensity: 0.05
            },
            getEntity: (name) => {
                const entities = {
                    heartSim: {
                        beatSpeed: 2.0,
                        isBeating: true,
                        contractionIntensity: 1.0,
                        setBeatSpeed: (speed) => { this.beatSpeed = speed; },
                        setBeating: (beating) => { this.isBeating = beating; },
                        setContractionIntensity: (intensity) => { this.contractionIntensity = intensity; },
                        getMesh: () => ({
                            scaling: new BABYLON.Vector3(1, 1, 1)
                        })
                    },
                    arterySim: {
                        growthSpeed: 50,
                        maxBranches: 50,
                        defaultRadius: 0.12,
                        isGrowing: true,
                        processGrowthQueue: () => {}
                    },
                    fluidSim: {
                        fillSpeed: 0.0001,
                        targetLevel: 0.8,
                        isFlowing: false,
                        shaderMaterial: {
                            setFloat: (name, value) => {}
                        },
                        startFilling: (level) => { this.isFlowing = true; },
                        stopFilling: () => { this.isFlowing = false; }
                    },
                    labEnvironment: {
                        isOverheadLightOn: true,
                        toggleOverheadLight: () => { this.isOverheadLightOn = !this.isOverheadLightOn; }
                    }
                };
                return entities[name] || null;
            }
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('Starting ParameterController tests...');
        
        this.testParameterDefinitions();
        this.testParameterValidation();
        this.testParameterApplication();
        this.testEventSystem();
        this.testErrorHandling();
        
        this.printResults();
        return this.testResults;
    }

    /**
     * Test parameter definitions
     */
    testParameterDefinitions() {
        const controller = new ParameterController(this.mockSceneManager);
        
        // Test parameter exists
        this.assert(
            controller.getParameter('heartBeatSpeed') !== undefined,
            'Heart beat speed parameter should be defined'
        );
        
        // Test parameter properties
        const heartBeatParam = controller.getParameter('heartBeatSpeed');
        this.assert(
            heartBeatParam.min === 0.5 && heartBeatParam.max === 5.0,
            'Heart beat speed should have correct min/max values'
        );
        
        // Test all required parameters exist
        const requiredParams = [
            'heartBeatSpeed', 'heartBeating', 'heartSize', 'heartContractionIntensity',
            'arteryGrowthSpeed', 'arteryMaxBranches', 'arteryThickness', 'arteryGrowth',
            'bloodFlowRate', 'bloodViscosity', 'bloodLevel', 'bloodFlow',
            'overheadLight', 'fogDensity', 'postProcessing', 'cameraSensitivity'
        ];
        
        requiredParams.forEach(param => {
            this.assert(
                controller.getParameter(param) !== undefined,
                `Parameter ${param} should be defined`
            );
        });
        
        controller.dispose();
    }

    /**
     * Test parameter validation
     */
    testParameterValidation() {
        const controller = new ParameterController(this.mockSceneManager);
        
        // Test valid values
        this.assert(
            controller.validateParameter('heartBeatSpeed', 2.0),
            'Valid heart beat speed should pass validation'
        );
        
        // Test invalid values
        this.assert(
            !controller.validateParameter('heartBeatSpeed', 10.0),
            'Invalid heart beat speed should fail validation'
        );
        
        this.assert(
            !controller.validateParameter('heartBeatSpeed', -1.0),
            'Negative heart beat speed should fail validation'
        );
        
        // Test boolean validation
        this.assert(
            controller.validateParameter('heartBeating', true),
            'Boolean true should pass validation'
        );
        
        this.assert(
            !controller.validateParameter('heartBeating', 'invalid'),
            'Non-boolean value should fail validation'
        );
        
        controller.dispose();
    }

    /**
     * Test parameter application
     */
    testParameterApplication() {
        const controller = new ParameterController(this.mockSceneManager);
        
        // Test heart parameter application
        const success = controller.applyParameter('heartBeatSpeed', 3.0);
        this.assert(success, 'Heart beat speed parameter should apply successfully');
        
        const currentValue = controller.getCurrentValue('heartBeatSpeed');
        this.assert(currentValue === 3.0, 'Current value should be updated after application');
        
        // Test toggle parameter
        const toggleSuccess = controller.applyParameter('heartBeating', false);
        this.assert(toggleSuccess, 'Heart beating toggle should apply successfully');
        
        // Test invalid parameter application
        const invalidSuccess = controller.applyParameter('nonexistent', 1.0);
        this.assert(!invalidSuccess, 'Non-existent parameter should fail to apply');
        
        controller.dispose();
    }

    /**
     * Test event system
     */
    testEventSystem() {
        const eventSystem = new ParameterEventSystem();
        let eventReceived = false;
        let eventData = null;
        
        // Add event listener
        eventSystem.addEventListener('change', 'testParam', (event) => {
            eventReceived = true;
            eventData = event.data;
        });
        
        // Emit event
        eventSystem.emitParameterChange('testParam', 1.0, 2.0, 'test');
        
        // Process events
        setTimeout(() => {
            this.assert(eventReceived, 'Event should be received by listener');
            this.assert(eventData.oldValue === 1.0, 'Event should contain correct old value');
            this.assert(eventData.newValue === 2.0, 'Event should contain correct new value');
        }, 10);
        
        eventSystem.dispose();
    }

    /**
     * Test error handling
     */
    testErrorHandling() {
        const controller = new ParameterController(this.mockSceneManager);
        
        // Test graceful handling of missing components
        const mockSceneManagerMissing = {
            scene: {},
            getEntity: () => null
        };
        
        const controllerMissing = new ParameterController(mockSceneManagerMissing);
        const success = controllerMissing.applyParameter('heartBeatSpeed', 2.0);
        
        // Should not crash, but should return false
        this.assert(!success, 'Should handle missing components gracefully');
        
        controller.dispose();
        controllerMissing.dispose();
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
        
        console.log(`\nTest Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('❌ Some tests failed. Check the output above for details.');
        }
    }
}

// Export a function to run tests easily
export function runParameterTests() {
    const tester = new ParameterControllerTest();
    return tester.runAllTests();
}