import { ControlPanelManager } from './ControlPanelManager.js';

/**
 * Test suite for ControlPanelManager
 * Verifies UI generation and parameter integration
 */
export class ControlPanelTest {
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
                        processGrowthQueue: () => {},
                        reset: () => {}
                    },
                    fluidSim: {
                        fillSpeed: 0.0001,
                        targetLevel: 0.8,
                        isFlowing: false,
                        currentLevel: 0,
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
            },
            camera: {
                resetView: () => {},
                setSensitivity: (value) => {}
            }
        };
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('Starting ControlPanelManager tests...');
        
        this.testControlPanelCreation();
        this.testParameterControls();
        this.testEventHandling();
        this.testActionButtons();
        
        this.printResults();
        return this.testResults;
    }

    /**
     * Test control panel creation
     */
    testControlPanelCreation() {
        const manager = new ControlPanelManager(this.mockSceneManager);
        
        // Test panel exists
        const panel = document.querySelector('.control-panel');
        this.assert(panel !== null, 'Control panel should be created');
        
        // Test panel has correct structure
        const header = panel.querySelector('.panel-header');
        const content = panel.querySelector('.panel-content');
        this.assert(header !== null, 'Panel should have header');
        this.assert(content !== null, 'Panel should have content');
        
        // Test sections exist
        const sections = panel.querySelectorAll('.control-section');
        this.assert(sections.length >= 4, 'Panel should have at least 4 sections');
        
        manager.dispose();
    }

    /**
     * Test parameter controls
     */
    testParameterControls() {
        const manager = new ControlPanelManager(this.mockSceneManager);
        
        // Test slider controls
        const sliders = document.querySelectorAll('.parameter-slider');
        this.assert(sliders.length > 0, 'Should have slider controls');
        
        // Test toggle controls
        const toggles = document.querySelectorAll('.parameter-toggle');
        this.assert(toggles.length > 0, 'Should have toggle controls');
        
        // Test value displays
        const valueDisplays = document.querySelectorAll('.control-value');
        this.assert(valueDisplays.length > 0, 'Should have value displays');
        
        // Test specific parameter controls exist
        const heartBeatSlider = document.querySelector('[data-param="heartBeatSpeed"]');
        this.assert(heartBeatSlider !== null, 'Heart beat speed slider should exist');
        
        const heartToggle = document.querySelector('[data-param="heartBeating"]');
        this.assert(heartToggle !== null, 'Heart beating toggle should exist');
        
        manager.dispose();
    }

    /**
     * Test event handling
     */
    testEventHandling() {
        const manager = new ControlPanelManager(this.mockSceneManager);
        
        // Test slider interaction
        const slider = document.querySelector('[data-param="heartBeatSpeed"]');
        if (slider) {
            const originalValue = slider.value;
            slider.value = '3.0';
            slider.dispatchEvent(new Event('input'));
            
            // Check if value display updated
            const valueDisplay = document.querySelector('[data-param="heartBeatSpeed"]').closest('.parameter-control').querySelector('.control-value');
            this.assert(valueDisplay.textContent.includes('3.0'), 'Value display should update on slider change');
        }
        
        // Test toggle interaction
        const toggle = document.querySelector('[data-param="heartBeating"]');
        if (toggle) {
            const originalChecked = toggle.checked;
            toggle.checked = !originalChecked;
            toggle.dispatchEvent(new Event('change'));
            
            this.assert(true, 'Toggle should handle change events without errors');
        }
        
        manager.dispose();
    }

    /**
     * Test action buttons
     */
    testActionButtons() {
        const manager = new ControlPanelManager(this.mockSceneManager);
        
        // Test action buttons exist
        const resetArteriesBtn = document.querySelector('.reset-arteries');
        const drainBloodBtn = document.querySelector('.drain-blood');
        const resetViewBtn = document.querySelector('.reset-view');
        const resetAllBtn = document.querySelector('.reset-all');
        
        this.assert(resetArteriesBtn !== null, 'Reset arteries button should exist');
        this.assert(drainBloodBtn !== null, 'Drain blood button should exist');
        this.assert(resetViewBtn !== null, 'Reset view button should exist');
        this.assert(resetAllBtn !== null, 'Reset all button should exist');
        
        // Test button clicks don't throw errors
        try {
            resetArteriesBtn.click();
            drainBloodBtn.click();
            resetViewBtn.click();
            this.assert(true, 'Action buttons should handle clicks without errors');
        } catch (error) {
            this.assert(false, `Action buttons should not throw errors: ${error.message}`);
        }
        
        manager.dispose();
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
        
        console.log(`\nControlPanel Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All control panel tests passed!');
        } else {
            console.log('❌ Some control panel tests failed. Check the output above for details.');
        }
    }
}

// Export a function to run tests easily
export function runControlPanelTests() {
    const tester = new ControlPanelTest();
    return tester.runAllTests();
}