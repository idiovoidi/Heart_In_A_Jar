import { ArteryControlSystem } from './ArteryControlSystem.js';
import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';

/**
 * Test suite for ArteryControlSystem
 * Verifies artery growth monitoring, parameter control, and UI integration
 */
export class ArteryControlTest {
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
                if (name === 'arterySim') {
                    return {
                        branchCount: 10,
                        maxBranches: 50,
                        growthSpeed: 50,
                        defaultRadius: 0.12,
                        isGrowing: true,
                        growthQueue: [1, 2, 3], // Mock queue with 3 items
                        arteries: [
                            { mesh: { isVisible: true, position: { x: 0, y: 0, z: 0 }, scaling: { x: 1, y: 1, z: 1 } } },
                            { mesh: { isVisible: true, position: { x: 1, y: 0, z: 0 }, scaling: { x: 1, y: 1, z: 1 } } }
                        ],
                        processGrowthQueue: () => {
                            // Simulate growth
                            this.branchCount++;
                            this.growthQueue.pop();
                        },
                        createArterySystem: () => {
                            this.growthQueue = [1, 2, 3, 4, 5];
                        },
                        reset: () => {
                            this.branchCount = 0;
                            this.growthQueue = [];
                            this.isGrowing = true;
                            this.createArterySystem();
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
        console.log('Starting ArteryControlSystem tests...');
        
        // Create a mock DOM environment for testing
        this.setupMockDOM();
        
        this.testArteryControlSystemCreation();
        this.testGrowthMonitoring();
        this.testParameterCallbacks();
        this.testGrowthPatterns();
        this.testUIElements();
        this.testDebugFunctionality();
        
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
            
            const arterySection = document.createElement('div');
            arterySection.setAttribute('data-section-id', 'arteries');
            
            const sectionContent = document.createElement('div');
            sectionContent.className = 'section-content';
            
            arterySection.appendChild(sectionContent);
            panel.appendChild(arterySection);
            document.body.appendChild(panel);
        }
    }

    /**
     * Test artery control system creation
     */
    testArteryControlSystemCreation() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const arteryControl = new ArteryControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        this.assert(arteryControl !== null, 'ArteryControlSystem should be created successfully');
        this.assert(arteryControl.arteryMonitor !== undefined, 'Artery monitor should be initialized');
        this.assert(arteryControl.growthPatterns !== undefined, 'Growth patterns should be defined');
        
        // Test initial state
        this.assert(arteryControl.arteryMonitor.totalBranches >= 0, 'Initial branch count should be non-negative');
        this.assert(arteryControl.currentPattern === 'normal', 'Initial pattern should be normal');
        
        arteryControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test growth monitoring functionality
     */
    testGrowthMonitoring() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const arteryControl = new ArteryControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test growth stats update
        const initialBranches = arteryControl.arteryMonitor.totalBranches;
        
        // Simulate growth by updating the mock artery sim
        const arterySim = this.mockSceneManager.getEntity('arterySim');
        arterySim.branchCount = initialBranches + 5;
        
        arteryControl.updateGrowthStats();
        
        this.assert(
            arteryControl.arteryMonitor.totalBranches === arterySim.branchCount,
            'Branch count should be updated correctly'
        );
        
        // Test queue size monitoring
        this.assert(
            arteryControl.arteryMonitor.queueSize === arterySim.growthQueue.length,
            'Queue size should be monitored correctly'
        );
        
        arteryControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test parameter callbacks
     */
    testParameterCallbacks() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const arteryControl = new ArteryControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        const arterySim = this.mockSceneManager.getEntity('arterySim');
        
        // Test growth speed callback
        const originalSpeed = arterySim.growthSpeed;
        arteryControl.onGrowthSpeedChange(25); // Fast speed
        
        this.assert(
            arterySim.growthSpeed === 25,
            'Growth speed should be updated correctly'
        );
        
        this.assert(
            arteryControl.currentPattern === 'fast',
            'Growth pattern should change based on speed'
        );
        
        // Test max branches callback
        const originalMaxBranches = arterySim.maxBranches;
        arteryControl.onMaxBranchesChange(100);
        
        this.assert(
            arterySim.maxBranches === 100,
            'Max branches should be updated correctly'
        );
        
        // Test thickness callback
        const originalRadius = arterySim.defaultRadius;
        arteryControl.onArteryThicknessChange(0.2);
        
        this.assert(
            arterySim.defaultRadius === 0.2,
            'Default radius should be updated correctly'
        );
        
        // Test growth toggle callback
        arteryControl.onGrowthToggle(false);
        this.assert(
            !arterySim.isGrowing,
            'Growth toggle should stop growth'
        );
        
        arteryControl.onGrowthToggle(true);
        this.assert(
            arterySim.isGrowing,
            'Growth toggle should start growth'
        );
        
        arteryControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test growth patterns
     */
    testGrowthPatterns() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const arteryControl = new ArteryControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test different speed patterns
        const testCases = [
            { speed: 10, expectedPattern: 'rapid' },
            { speed: 25, expectedPattern: 'fast' },
            { speed: 75, expectedPattern: 'normal' },
            { speed: 150, expectedPattern: 'slow' }
        ];
        
        testCases.forEach(testCase => {
            arteryControl.onGrowthSpeedChange(testCase.speed);
            this.assert(
                arteryControl.currentPattern === testCase.expectedPattern,
                `Speed ${testCase.speed} should set pattern to ${testCase.expectedPattern}`
            );
        });
        
        arteryControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test UI elements creation
     */
    testUIElements() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const arteryControl = new ArteryControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Test artery display creation
        const arteryDisplay = document.querySelector('.artery-display');
        this.assert(arteryDisplay !== null, 'Artery display should be created');
        
        // Test artery monitor elements
        const arteryCount = document.getElementById('arteryCount');
        const arteryProgress = document.getElementById('arteryProgress');
        const growthRate = document.getElementById('growthRate');
        const queueSize = document.getElementById('queueSize');
        const growthStatus = document.getElementById('growthStatus');
        
        this.assert(arteryCount !== null, 'Artery count element should exist');
        this.assert(arteryProgress !== null, 'Artery progress element should exist');
        this.assert(growthRate !== null, 'Growth rate element should exist');
        this.assert(queueSize !== null, 'Queue size element should exist');
        this.assert(growthStatus !== null, 'Growth status element should exist');
        
        // Test growth visualization
        const growthCanvas = document.getElementById('growthCanvas');
        this.assert(growthCanvas !== null, 'Growth canvas should be created');
        
        // Test display update
        arteryControl.arteryMonitor.totalBranches = 25;
        arteryControl.arteryMonitor.growthRate = 1.5;
        arteryControl.arteryMonitor.queueSize = 8;
        arteryControl.updateArteryDisplay();
        
        this.assert(
            arteryCount.textContent === '25',
            'Artery count display should update correctly'
        );
        
        this.assert(
            growthRate.textContent === '1.5',
            'Growth rate display should update correctly'
        );
        
        this.assert(
            queueSize.textContent === '8',
            'Queue size display should update correctly'
        );
        
        arteryControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test debug functionality
     */
    testDebugFunctionality() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const arteryControl = new ArteryControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        const arterySim = this.mockSceneManager.getEntity('arterySim');
        
        // Test reset functionality
        const originalBranchCount = arterySim.branchCount;
        arteryControl.resetArterySystem();
        
        this.assert(
            arterySim.branchCount === 0,
            'Reset should clear branch count'
        );
        
        this.assert(
            arteryControl.arteryMonitor.totalBranches === 0,
            'Reset should clear monitor branch count'
        );
        
        // Test force growth restart
        arterySim.isGrowing = false;
        arterySim.growthQueue = [];
        
        arteryControl.forceGrowthRestart();
        
        this.assert(
            arterySim.isGrowing === true,
            'Force restart should enable growth'
        );
        
        this.assert(
            arterySim.growthQueue.length > 0,
            'Force restart should populate growth queue'
        );
        
        arteryControl.dispose();
        parameterController.dispose();
        eventSystem.dispose();
    }

    /**
     * Test artery statistics
     */
    testArteryStatistics() {
        const parameterController = new ParameterController(this.mockSceneManager);
        const eventSystem = new ParameterEventSystem();
        const arteryControl = new ArteryControlSystem(this.mockSceneManager, parameterController, eventSystem);
        
        // Update some values
        arteryControl.arteryMonitor.totalBranches = 30;
        arteryControl.arteryMonitor.growthRate = 2.0;
        arteryControl.currentPattern = 'fast';
        
        const stats = arteryControl.getArteryStatistics();
        
        this.assert(stats.totalBranches === 30, 'Statistics should include total branches');
        this.assert(stats.growthRate === 2.0, 'Statistics should include growth rate');
        this.assert(stats.pattern === 'fast', 'Statistics should include pattern');
        this.assert(Array.isArray(stats.growthHistory), 'Statistics should include growth history');
        
        arteryControl.dispose();
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
        
        console.log(`\nArteryControl Test Results: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All artery control tests passed!');
        } else {
            console.log('❌ Some artery control tests failed. Check the output above for details.');
        }
    }
}

// Export a function to run tests easily
export function runArteryControlTests() {
    const tester = new ArteryControlTest();
    return tester.runAllTests();
}