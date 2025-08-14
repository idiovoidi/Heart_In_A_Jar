import { PresetManager } from './PresetManager.js';
import { PresetUI } from './PresetUI.js';
import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';

/**
 * Test suite for Preset Management System
 * Verifies preset creation, application, and UI functionality
 */
export class PresetTest {
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
            camera: { setSensitivity: (value) => { this.sensitivity = value; } },
            getEntity: (name) => {
                const entities = {
                    heartSim: {
                        beatSpeed: 2.0,
                        isBeating: true,
                        contractionIntensity: 1.0,
                        setBeatSpeed: (speed) => { this.beatSpeed = speed; },
                        setBeating: (beating) => { this.isBeating = beating; },
                        setContractionIntensity: (intensity) => { this.contractionIntensity = intensity; },
                        setHeartScale: (scale) => { this.scale = scale; },
                        getMesh: () => ({ scaling: new BABYLON.Vector3(1, 1, 1) })
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
                        shaderMaterial: { setFloat: (name, value) => {} },
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
        console.log('Starting Preset Management System tests...');
        
        // Create a mock DOM environment for testing
        this.setupMockDOM();
        
        this.testPresetManagerCreation();
        this.testBuiltInPresets();
        this.testPresetValidation();
        await this.testPresetApplication();
        this.testCustomPresets();
        this.testPresetUI();
        
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
            
            const panelContent = document.createElement('div');
            panelContent.className = 'panel-content';
            
            panel.appendChild(panelContent);
            document.body.appendChild(panel);
        }
    }

    /**
     * Test preset manager creation
     */
    testPresetManagerCreation() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const presetManager = new PresetManager(parameterController, eventSystem);
        
        this.assert(presetManager !== null, 'PresetManager should be created successfully');
        this.assert(presetManager.presets !== undefined, 'Presets map should be initialized');
        this.assert(presetManager.customPresets !== undefined, 'Custom presets map should be initialized');
        
        // Test built-in presets are loaded
        const allPresets = presetManager.getAllPresets();
        this.assert(allPresets.length > 0, 'Built-in presets should be loaded');
        
        // Test specific built-in presets exist
        const healthyHeart = presetManager.getPreset('healthyHeart');
        const rapidGrowth = presetManager.getPreset('rapidGrowth');
        const labDemo = presetManager.getPreset('laboratoryDemo');
        
        this.assert(healthyHeart !== null, 'Healthy Heart preset should exist');
        this.assert(rapidGrowth !== null, 'Rapid Growth preset should exist');
        this.assert(labDemo !== null, 'Laboratory Demo preset should exist');
        
        presetManager.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test built-in presets
     */
    testBuiltInPresets() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const presetManager = new PresetManager(parameterController, eventSystem);
        
        const builtInPresets = presetManager.getAllPresets().filter(p => p.isBuiltIn);
        
        this.assert(builtInPresets.length >= 6, 'Should have at least 6 built-in presets');
        
        // Test preset structure
        builtInPresets.forEach(preset => {
            this.assert(preset.name !== undefined, `Preset ${preset.id} should have a name`);
            this.assert(preset.description !== undefined, `Preset ${preset.id} should have a description`);
            this.assert(preset.parameters !== undefined, `Preset ${preset.id} should have parameters`);
            this.assert(preset.category !== undefined, `Preset ${preset.id} should have a category`);
            
            // Test parameter count
            const paramCount = Object.keys(preset.parameters).length;
            this.assert(paramCount > 0, `Preset ${preset.id} should have parameters`);
        });
        
        // Test categories
        const categories = [...new Set(builtInPresets.map(p => p.category))];
        this.assert(categories.includes('medical'), 'Should have medical category presets');
        this.assert(categories.includes('demonstration'), 'Should have demonstration category presets');
        this.assert(categories.includes('educational'), 'Should have educational category presets');
        
        presetManager.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test preset validation
     */
    testPresetValidation() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const presetManager = new PresetManager(parameterController, eventSystem);
        
        // Test valid preset configuration
        const validConfig = {
            name: 'Test Preset',
            description: 'Test description',
            parameters: {
                heartBeatSpeed: 1.5,
                heartBeating: true,
                arteryGrowthSpeed: 75
            }
        };
        
        this.assert(
            presetManager.validatePresetConfig(validConfig),
            'Valid preset configuration should pass validation'
        );
        
        // Test invalid preset configuration - missing name
        const invalidConfig1 = {
            description: 'Test description',
            parameters: { heartBeatSpeed: 1.5 }
        };
        
        this.assert(
            !presetManager.validatePresetConfig(invalidConfig1),
            'Preset configuration without name should fail validation'
        );
        
        // Test invalid preset configuration - invalid parameter value
        const invalidConfig2 = {
            name: 'Test Preset',
            description: 'Test description',
            parameters: {
                heartBeatSpeed: 10.0 // Invalid value (too high)
            }
        };
        
        this.assert(
            !presetManager.validatePresetConfig(invalidConfig2),
            'Preset configuration with invalid parameter should fail validation'
        );
        
        presetManager.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test preset application
     */
    async testPresetApplication() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const presetManager = new PresetManager(parameterController, eventSystem);
        
        // Test immediate application
        const success1 = await presetManager.applyPreset('healthyHeart', { smooth: false });
        this.assert(success1, 'Healthy Heart preset should apply successfully (immediate)');
        
        // Verify parameters were applied
        const heartBeatSpeed = parameterController.getCurrentValue('heartBeatSpeed');
        this.assert(heartBeatSpeed === 1.2, 'Heart beat speed should be set to preset value');
        
        // Test smooth application
        const success2 = await presetManager.applyPreset('rapidGrowth', { 
            smooth: true, 
            duration: 100 // Short duration for testing
        });
        this.assert(success2, 'Rapid Growth preset should apply successfully (smooth)');
        
        // Test current preset tracking
        this.assert(
            presetManager.getCurrentPreset() === 'rapidGrowth',
            'Current preset should be tracked correctly'
        );
        
        // Test invalid preset application
        const success3 = await presetManager.applyPreset('nonexistentPreset');
        this.assert(!success3, 'Non-existent preset should fail to apply');
        
        presetManager.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test custom presets
     */
    testCustomPresets() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const presetManager = new PresetManager(parameterController, eventSystem);
        
        // Test saving custom preset
        const presetId = presetManager.saveCurrentAsPreset(
            'My Custom Preset',
            'A test custom preset',
            { icon: '🧪', category: 'custom' }
        );
        
        this.assert(presetId !== null, 'Custom preset should be saved successfully');
        
        // Test retrieving custom preset
        const customPreset = presetManager.getPreset(presetId);
        this.assert(customPreset !== null, 'Custom preset should be retrievable');
        this.assert(customPreset.name === 'My Custom Preset', 'Custom preset name should match');
        this.assert(!customPreset.isBuiltIn, 'Custom preset should not be marked as built-in');
        
        // Test custom presets count
        const customPresets = presetManager.getAllPresets().filter(p => !p.isBuiltIn);
        this.assert(customPresets.length >= 1, 'Should have at least one custom preset');
        
        // Test deleting custom preset
        const deleteSuccess = presetManager.deleteCustomPreset(presetId);
        this.assert(deleteSuccess, 'Custom preset should be deleted successfully');
        
        // Verify deletion
        const deletedPreset = presetManager.getPreset(presetId);
        this.assert(deletedPreset === null, 'Deleted preset should not be retrievable');
        
        // Test deleting built-in preset (should fail)
        const deleteBuiltInSuccess = presetManager.deleteCustomPreset('healthyHeart');
        this.assert(!deleteBuiltInSuccess, 'Built-in preset should not be deletable');
        
        presetManager.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test preset UI
     */
    testPresetUI() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const presetManager = new PresetManager(parameterController, eventSystem);
        const presetUI = new PresetUI(presetManager, eventSystem);
        
        // Test UI creation
        const presetSection = document.querySelector('.preset-section');
        this.assert(presetSection !== null, 'Preset section should be created');
        
        // Test preset grid
        const presetGrid = document.getElementById('presetGrid');
        this.assert(presetGrid !== null, 'Preset grid should be created');
        
        // Test category buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        this.assert(categoryButtons.length >= 4, 'Should have category filter buttons');
        
        // Test preset buttons
        const presetButtons = document.querySelectorAll('.preset-btn');
        this.assert(presetButtons.length > 0, 'Should have preset buttons');
        
        // Test action buttons
        const saveBtn = document.querySelector('.save-preset');
        const manageBtn = document.querySelector('.manage-presets');
        this.assert(saveBtn !== null, 'Save preset button should exist');
        this.assert(manageBtn !== null, 'Manage presets button should exist');
        
        // Test preset info
        const presetInfo = document.getElementById('presetInfo');
        this.assert(presetInfo !== null, 'Preset info section should exist');
        
        presetUI.dispose();
        presetManager.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test preset statistics
     */
    testPresetStatistics() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const presetManager = new PresetManager(parameterController, eventSystem);
        
        const stats = presetManager.getPresetStatistics();
        
        this.assert(stats.totalPresets > 0, 'Should have total presets count');
        this.assert(stats.builtInPresets > 0, 'Should have built-in presets count');
        this.assert(typeof stats.categories === 'object', 'Should have categories breakdown');
        this.assert(stats.currentPreset === null, 'Should track current preset');
        
        presetManager.dispose();
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
        
        console.log(`\nPreset System Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All preset system tests passed!');
        } else {
            console.log('❌ Some preset system tests failed. Check the output above for details.');
        }
    }
}

// Export a function to run tests easily
export function runPresetTests() {
    const tester = new PresetTest();
    return tester.runAllTests();
}