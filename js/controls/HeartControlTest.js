import { HeartControlSystem } from './HeartControlSystem.js';
import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';

/**
 * Test suite for HeartControlSystem
 * Verifies heart monitoring, BPM calculation, and UI integration
 */
export class HeartControlTest {
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
                if (name === 'heartSim') {
                    return {
                        beatSpeed: 2.0,
                        isBeating: true,
                        contractionIntensity: 1.0,
                        time: 0,
                        setBeatSpeed: (speed) => { this.beatSpeed = speed; },
                        setBeating: (beating) => { this.isBeating = beating; },
                        setContractionIntensity: (intensity) => { this.contractionIntensity = intensity; },
                        setHeartScale: (scale) => { this.scale = scale; },
                        getHeartPhase: () => Math.sin(this.time * 4),
                        getHeartStats: () => ({
                            beatSpeed: this.beatSpeed,
                            isBeating: this.isBeating,
                            contractionIntensity: this.contractionIntensity,
                            currentPhase: this.getHeartPhase(),
                            time: this.time
                        }),
                        getMesh: () => ({
                            scaling: new BABYLON.Vector3(1, 1, 1)
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
        console.log('Starting HeartControlSystem tests...');
        
        // Create a mock DOM environment for testing
        this.setupMockDOM();
        
        this.testHeartControlSystemCreation();
        this.testBPMMonitoring();
        this.testParameterCallbacks();
        this.testRhythmPatterns();
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
            
            const heartSection = document.createElement('div');
            heartSection.setAttribute('data-section-id', 'heart');
            
            const sectionContent = document.createElement('div');
            sectionContent.className = 'section-content';
            
            heartSection.appendChild(sectionContent);
            panel.appendChild(heartSection);
            document.body.appendChild(panel);
        }
    }

    /**
     * Test heart control system creation
     */
    testHeartControlSystemCreation() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const heartControl = new HeartControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        this.assert(heartControl !== null, 'HeartControlSystem should be created successfully');
        this.assert(heartControl.heartMonitor !== undefined, 'Heart monitor should be initialized');
        this.assert(heartControl.rhythmPatterns !== undefined, 'Rhythm patterns should be defined');
        
        // Test initial state
        this.assert(heartControl.heartMonitor.currentBPM === 60, 'Initial BPM should be 60');
        this.assert(heartControl.currentRhythm === 'normal', 'Initial rhythm should be normal');
        
        heartControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test BPM monitoring functionality
     */
    testBPMMonitoring() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const heartControl = new HeartControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test BPM calculation
        const testBPM = 80;
        heartControl.updateBPMHistory(testBPM);
        
        this.assert(
            heartControl.heartMonitor.currentBPM === testBPM,
            'Current BPM should be updated correctly'
        );
        
        // Test BPM history
        this.assert(
            heartControl.heartMonitor.bpmHistory.includes(testBPM),
            'BPM history should include new value'
        );
        
        // Test average calculation
        heartControl.updateBPMHistory(90);
        heartControl.updateBPMHistory(70);
        
        const avgBPM = heartControl.heartMonitor.averageBPM;
        this.assert(
            avgBPM > 70 && avgBPM < 90,
            'Average BPM should be calculated correctly'
        );
        
        heartControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test parameter callbacks
     */
    testParameterCallbacks() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const heartControl = new HeartControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test beat speed callback
        const originalRhythm = heartControl.currentRhythm;
        heartControl.onBeatSpeedChange(4.0); // Should trigger tachycardia
        
        this.assert(
            heartControl.currentRhythm === 'tachycardia',
            'High beat speed should trigger tachycardia rhythm'
        );
        
        heartControl.onBeatSpeedChange(0.5); // Should trigger bradycardia
        this.assert(
            heartControl.currentRhythm === 'bradycardia',
            'Low beat speed should trigger bradycardia rhythm'
        );
        
        // Test beating toggle callback
        heartControl.onBeatingToggle(false);
        this.assert(
            !heartControl.heartMonitor.isMonitoring,
            'Beating toggle should stop monitoring'
        );
        
        heartControl.onBeatingToggle(true);
        this.assert(
            heartControl.heartMonitor.isMonitoring,
            'Beating toggle should start monitoring'
        );
        
        heartControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test rhythm patterns
     */
    testRhythmPatterns() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const heartControl = new HeartControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test rhythm pattern setting
        heartControl.setHeartRhythm('arrhythmia');
        this.assert(
            heartControl.currentRhythm === 'arrhythmia',
            'Should be able to set arrhythmia rhythm'
        );
        
        // Test invalid rhythm pattern
        heartControl.setHeartRhythm('invalid');
        this.assert(
            heartControl.currentRhythm === 'arrhythmia',
            'Invalid rhythm should not change current rhythm'
        );
        
        // Test heart rate variability application
        const baseBPM = 80;
        const variableBPM = heartControl.applyHeartRateVariability(baseBPM);
        
        this.assert(
            variableBPM !== baseBPM,
            'Heart rate variability should modify BPM'
        );
        
        this.assert(
            variableBPM >= 30 && variableBPM <= 200,
            'Variable BPM should be within realistic range'
        );
        
        heartControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test UI elements creation
     */
    testUIElements() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const heartControl = new HeartControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test BPM display creation
        const bpmDisplay = document.querySelector('.bpm-display');
        this.assert(bpmDisplay !== null, 'BPM display should be created');
        
        // Test BPM monitor elements
        const currentBPM = document.getElementById('currentBPM');
        const averageBPM = document.getElementById('averageBPM');
        const heartStatus = document.getElementById('heartStatus');
        
        this.assert(currentBPM !== null, 'Current BPM element should exist');
        this.assert(averageBPM !== null, 'Average BPM element should exist');
        this.assert(heartStatus !== null, 'Heart status element should exist');
        
        // Test rhythm visualization
        const rhythmCanvas = document.getElementById('rhythmCanvas');
        this.assert(rhythmCanvas !== null, 'Rhythm canvas should be created');
        
        // Test BPM display update
        heartControl.heartMonitor.currentBPM = 85;
        heartControl.heartMonitor.averageBPM = 82;
        heartControl.updateBPMDisplay();
        
        this.assert(
            currentBPM.textContent === '85',
            'Current BPM display should update correctly'
        );
        
        this.assert(
            averageBPM.textContent === '82',
            'Average BPM display should update correctly'
        );
        
        heartControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test heart statistics
     */
    testHeartStatistics() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const heartControl = new HeartControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Update some values
        heartControl.heartMonitor.currentBPM = 75;
        heartControl.heartMonitor.beatCount = 100;
        heartControl.currentRhythm = 'normal';
        
        const stats = heartControl.getHeartStatistics();
        
        this.assert(stats.currentBPM === 75, 'Statistics should include current BPM');
        this.assert(stats.beatCount === 100, 'Statistics should include beat count');
        this.assert(stats.rhythm === 'normal', 'Statistics should include rhythm');
        this.assert(Array.isArray(stats.bpmHistory), 'Statistics should include BPM history');
        
        heartControl.dispose();
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
        
        console.log(`\nHeartControl Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All heart control tests passed!');
        } else {
            console.log('❌ Some heart control tests failed. Check the output above for details.');
        }
    }
}

// Export a function to run tests easily
export function runHeartControlTests() {
    const tester = new HeartControlTest();
    return tester.runAllTests();
}