import { EnvironmentControlSystem } from './EnvironmentControlSystem.js';
import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';

/**
 * Test suite for EnvironmentControlSystem
 * Verifies environment monitoring, lighting control, and visual effects
 */
export class EnvironmentControlTest {
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
                fogMode: 1,
                fogDensity: 0.05,
                clearColor: { r: 0, g: 0, b: 0, a: 1 }
            },
            camera: {
                setSensitivity: (value) => {
                    this.sensitivity = value;
                }
            },
            getEntity: (name) => {
                if (name === 'labEnvironment') {
                    return {
                        isOverheadLightOn: true,
                        dustParticles: { active: true },
                        lights: [
                            { intensity: 0.4, diffuse: { r: 0.9, g: 0.95, b: 1.0 } },
                            { intensity: 0.3, diffuse: { r: 0.8, g: 0.9, b: 1.0 } },
                            { intensity: 0.2, diffuse: { r: 1.0, g: 0.95, b: 0.9 } }
                        ],
                        toggleOverheadLight: () => {
                            this.isOverheadLightOn = !this.isOverheadLightOn;
                        }
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
        console.log('Starting EnvironmentControlSystem tests...');
        
        // Create a mock DOM environment for testing
        this.setupMockDOM();
        
        this.testEnvironmentControlSystemCreation();
        this.testEnvironmentMonitoring();
        this.testParameterCallbacks();
        this.testLightingPresets();
        this.testPostProcessingControls();
        this.testUIElements();
        
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
            
            const environmentSection = document.createElement('div');
            environmentSection.setAttribute('data-section-id', 'environment');
            
            const sectionContent = document.createElement('div');
            sectionContent.className = 'section-content';
            
            environmentSection.appendChild(sectionContent);
            panel.appendChild(environmentSection);
            document.body.appendChild(panel);
        }
    }

    /**
     * Test environment control system creation
     */
    testEnvironmentControlSystemCreation() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const environmentControl = new EnvironmentControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        this.assert(environmentControl !== null, 'EnvironmentControlSystem should be created successfully');
        this.assert(environmentControl.environmentMonitor !== undefined, 'Environment monitor should be initialized');
        this.assert(environmentControl.lightingPresets !== undefined, 'Lighting presets should be defined');
        this.assert(environmentControl.atmospherePresets !== undefined, 'Atmosphere presets should be defined');
        this.assert(environmentControl.postProcessingState !== undefined, 'Post-processing state should be defined');
        
        // Test initial state
        this.assert(environmentControl.environmentMonitor.lightingLevel >= 0, 'Initial lighting level should be non-negative');
        this.assert(environmentControl.currentLightingPreset === 'normal', 'Initial lighting preset should be normal');
        this.assert(environmentControl.currentAtmospherePreset === 'normal', 'Initial atmosphere preset should be normal');
        
        environmentControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test environment monitoring functionality
     */
    testEnvironmentMonitoring() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const environmentControl = new EnvironmentControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test initial monitoring values
        this.assert(
            environmentControl.environmentMonitor.ambientTemperature >= 18 && 
            environmentControl.environmentMonitor.ambientTemperature <= 28,
            'Ambient temperature should be within realistic range'
        );
        
        this.assert(
            environmentControl.environmentMonitor.humidity >= 30 && 
            environmentControl.environmentMonitor.humidity <= 70,
            'Humidity should be within realistic range'
        );
        
        this.assert(
            environmentControl.environmentMonitor.airQuality >= 85 && 
            environmentControl.environmentMonitor.airQuality <= 100,
            'Air quality should be within realistic range'
        );
        
        // Test environmental changes simulation
        const initialTemp = environmentControl.environmentMonitor.ambientTemperature;
        environmentControl.simulateEnvironmentalChanges();
        
        // Temperature should change slightly
        this.assert(
            Math.abs(environmentControl.environmentMonitor.ambientTemperature - initialTemp) <= 0.2,
            'Temperature changes should be realistic'
        );
        
        environmentControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test parameter callbacks
     */
    testParameterCallbacks() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const environmentControl = new EnvironmentControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        const labEnvironment = this.mockSceneManager.getEntity('labEnvironment');
        const scene = this.mockSceneManager.scene;
        
        // Test overhead light callback
        const originalLightState = labEnvironment.isOverheadLightOn;
        environmentControl.onOverheadLightToggle(false);
        
        this.assert(
            environmentControl.environmentMonitor.isOverheadLightOn === false,
            'Overhead light state should be updated correctly'
        );
        
        this.assert(
            environmentControl.currentLightingPreset === 'dim',
            'Lighting preset should change to dim when light is off'
        );
        
        // Test fog density callback
        const originalFogDensity = scene.fogDensity;
        environmentControl.onFogDensityChange(0.15);
        
        this.assert(
            scene.fogDensity === 0.15,
            'Scene fog density should be updated correctly'
        );
        
        this.assert(
            environmentControl.currentAtmospherePreset === 'hazy',
            'Atmosphere preset should change based on fog density'
        );
        
        // Test post-processing callback
        environmentControl.onPostProcessingToggle(false);
        
        this.assert(
            environmentControl.environmentMonitor.postProcessingEnabled === false,
            'Post-processing state should be updated correctly'
        );
        
        this.assert(
            environmentControl.postProcessingState.bloom.enabled === false,
            'Bloom effect should be disabled'
        );
        
        // Test camera sensitivity callback
        const camera = this.mockSceneManager.camera;
        environmentControl.onCameraSensitivityChange(1.5);
        
        this.assert(
            environmentControl.environmentMonitor.cameraSensitivity === 1.5,
            'Camera sensitivity should be updated correctly'
        );
        
        environmentControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test lighting presets
     */
    testLightingPresets() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const environmentControl = new EnvironmentControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        const labEnvironment = this.mockSceneManager.getEntity('labEnvironment');
        
        // Test different lighting presets
        const testPresets = ['bright', 'normal', 'dim', 'emergency'];
        
        testPresets.forEach(preset => {
            environmentControl.applyLightingPreset(preset);
            
            this.assert(
                environmentControl.currentLightingPreset === preset,
                `Lighting preset should be set to ${preset}`
            );
            
            // Check if lights are updated
            if (labEnvironment.lights && labEnvironment.lights.length > 0) {
                const expectedIntensity = environmentControl.lightingPresets[preset].intensity;
                const actualIntensity = labEnvironment.lights[0].intensity;
                
                this.assert(
                    Math.abs(actualIntensity - expectedIntensity * 0.8) < 0.1,
                    `Light intensity should match preset ${preset}`
                );
            }
        });
        
        environmentControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test post-processing controls
     */
    testPostProcessingControls() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const environmentControl = new EnvironmentControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test initial post-processing state
        this.assert(
            environmentControl.postProcessingState.bloom.enabled === true,
            'Bloom should be enabled by default'
        );
        
        this.assert(
            environmentControl.postProcessingState.chromaticAberration.enabled === true,
            'Chromatic aberration should be enabled by default'
        );
        
        this.assert(
            environmentControl.postProcessingState.grain.enabled === true,
            'Grain should be enabled by default'
        );
        
        // Test disabling post-processing
        environmentControl.onPostProcessingToggle(false);
        
        this.assert(
            environmentControl.postProcessingState.bloom.enabled === false,
            'Bloom should be disabled when post-processing is off'
        );
        
        this.assert(
            environmentControl.postProcessingState.chromaticAberration.enabled === false,
            'Chromatic aberration should be disabled when post-processing is off'
        );
        
        environmentControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test UI elements creation
     */
    testUIElements() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const environmentControl = new EnvironmentControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test environment display creation
        const environmentDisplay = document.querySelector('.environment-display');
        this.assert(environmentDisplay !== null, 'Environment display should be created');
        
        // Test environment monitor elements
        const lightingLevel = document.getElementById('lightingLevel');
        const ambientTemp = document.getElementById('ambientTemp');
        const humidity = document.getElementById('humidity');
        const airQuality = document.getElementById('airQuality');
        const lightStatus = document.getElementById('lightStatus');
        const atmosphereStatus = document.getElementById('atmosphereStatus');
        
        this.assert(lightingLevel !== null, 'Lighting level element should exist');
        this.assert(ambientTemp !== null, 'Ambient temperature element should exist');
        this.assert(humidity !== null, 'Humidity element should exist');
        this.assert(airQuality !== null, 'Air quality element should exist');
        this.assert(lightStatus !== null, 'Light status element should exist');
        this.assert(atmosphereStatus !== null, 'Atmosphere status element should exist');
        
        // Test atmosphere visualization
        const fogLevel = document.getElementById('fogLevel');
        const fogValue = document.getElementById('fogValue');
        
        this.assert(fogLevel !== null, 'Fog level element should exist');
        this.assert(fogValue !== null, 'Fog value element should exist');
        
        // Test lighting controls
        const presetButtons = document.querySelectorAll('.preset-btn');
        this.assert(presetButtons.length === 4, 'Should have 4 lighting preset buttons');
        
        // Test post-processing controls
        const postProcessingStatus = document.getElementById('postProcessingStatus');
        const bloomStatus = document.getElementById('bloomStatus');
        const aberrationStatus = document.getElementById('aberrationStatus');
        const grainStatus = document.getElementById('grainStatus');
        const cameraStatus = document.getElementById('cameraStatus');
        
        this.assert(postProcessingStatus !== null, 'Post-processing status element should exist');
        this.assert(bloomStatus !== null, 'Bloom status element should exist');
        this.assert(aberrationStatus !== null, 'Aberration status element should exist');
        this.assert(grainStatus !== null, 'Grain status element should exist');
        this.assert(cameraStatus !== null, 'Camera status element should exist');
        
        // Test display update
        environmentControl.environmentMonitor.lightingLevel = 85;
        environmentControl.environmentMonitor.ambientTemperature = 23.5;
        environmentControl.environmentMonitor.humidity = 50;
        environmentControl.environmentMonitor.airQuality = 92;
        environmentControl.updateEnvironmentDisplay();
        
        this.assert(
            lightingLevel.textContent === '85%',
            'Lighting level display should update correctly'
        );
        
        this.assert(
            ambientTemp.textContent === '23.5°C',
            'Temperature display should update correctly'
        );
        
        this.assert(
            humidity.textContent === '50%',
            'Humidity display should update correctly'
        );
        
        this.assert(
            airQuality.textContent === '92%',
            'Air quality display should update correctly'
        );
        
        environmentControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test environment statistics
     */
    testEnvironmentStatistics() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const environmentControl = new EnvironmentControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Update some values
        environmentControl.environmentMonitor.lightingLevel = 90;
        environmentControl.environmentMonitor.fogDensity = 0.08;
        environmentControl.currentLightingPreset = 'bright';
        environmentControl.currentAtmospherePreset = 'hazy';
        
        const stats = environmentControl.getEnvironmentStatistics();
        
        this.assert(stats.lightingLevel === 90, 'Statistics should include lighting level');
        this.assert(stats.fogDensity === 0.08, 'Statistics should include fog density');
        this.assert(stats.lightingPreset === 'bright', 'Statistics should include lighting preset');
        this.assert(stats.atmospherePreset === 'hazy', 'Statistics should include atmosphere preset');
        this.assert(typeof stats.postProcessingState === 'object', 'Statistics should include post-processing state');
        
        environmentControl.dispose();
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
        
        console.log(`\nEnvironmentControl Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All environment control tests passed!');
        } else {
            console.log('❌ Some environment control tests failed. Check the output above for details.');
        }
    }
}

// Export a function to run tests easily
export function runEnvironmentControlTests() {
    const tester = new EnvironmentControlTest();
    return tester.runAllTests();
}