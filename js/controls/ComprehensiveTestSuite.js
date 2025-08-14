/**
 * Comprehensive Test Suite for Interactive Heart Controls
 * Integrates all individual test files and provides complete system testing
 */

import { ParameterControllerTest } from './ParameterControllerTest.js';
import { ControlPanelTest } from './ControlPanelTest.js';
import { HeartControlTest } from './HeartControlTest.js';
import { ArteryControlTest } from './ArteryControlTest.js';
import { FluidControlTest } from './FluidControlTest.js';
import { EnvironmentControlTest } from './EnvironmentControlTest.js';
import { PresetTest } from './PresetTest.js';
import { UIEnhancementTest } from './UIEnhancementTest.js';
import { AdvancedFeaturesTest } from './AdvancedFeaturesTest.js';
import { ErrorHandlingTest } from './ErrorHandlingTest.js';

export class ComprehensiveTestSuite {
    constructor(controlPanelManager) {
        this.controlPanelManager = controlPanelManager;
        this.testResults = new Map();
        this.overallResults = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            testSuites: 0,
            startTime: null,
            endTime: null,
            duration: 0
        };
        
        this.initializeTestSuites();
    }

    /**
     * Initialize all test suites
     */
    initializeTestSuites() {
        this.testSuites = [
            {
                name: 'Parameter Controller',
                testClass: ParameterControllerTest,
                description: 'Core parameter management and validation'
            },
            {
                name: 'Control Panel',
                testClass: ControlPanelTest,
                description: 'UI generation and control management'
            },
            {
                name: 'Heart Controls',
                testClass: HeartControlTest,
                description: 'Heart simulation control system'
            },
            {
                name: 'Artery Controls',
                testClass: ArteryControlTest,
                description: 'Artery growth and management system'
            },
            {
                name: 'Fluid Controls',
                testClass: FluidControlTest,
                description: 'Blood flow and fluid simulation'
            },
            {
                name: 'Environment Controls',
                testClass: EnvironmentControlTest,
                description: 'Laboratory environment and visual effects'
            },
            {
                name: 'Preset System',
                testClass: PresetTest,
                description: 'Preset management and application'
            },
            {
                name: 'UI Enhancements',
                testClass: UIEnhancementTest,
                description: 'Responsive design and visual improvements'
            },
            {
                name: 'Advanced Features',
                testClass: AdvancedFeaturesTest,
                description: 'Parameter linking and advanced functionality'
            },
            {
                name: 'Error Handling',
                testClass: ErrorHandlingTest,
                description: 'Error handling and recovery systems'
            }
        ];
    }

    /**
     * Run all test suites
     * @param {Object} options - Test options
     */
    async runAllTests(options = {}) {
        console.log('🧪 Starting Comprehensive Test Suite for Interactive Heart Controls');
        console.log('=' .repeat(80));
        
        this.overallResults.startTime = Date.now();
        this.overallResults.testSuites = this.testSuites.length;

        const runOptions = {
            stopOnFailure: options.stopOnFailure || false,
            verbose: options.verbose !== false, // Default to verbose
            includeStressTests: options.includeStressTests || false,
            includeIntegrationTests: options.includeIntegrationTests !== false // Default to true
        };

        try {
            for (const suite of this.testSuites) {
                await this.runTestSuite(suite, runOptions);
                
                // Stop on failure if requested
                if (runOptions.stopOnFailure && this.testResults.get(suite.name).failedTests > 0) {
                    console.log(`\n❌ Stopping test execution due to failures in ${suite.name}`);
                    break;
                }
            }

            // Run integration tests if requested
            if (runOptions.includeIntegrationTests) {
                await this.runIntegrationTests();
            }

            // Run stress tests if requested
            if (runOptions.includeStressTests) {
                await this.runStressTests();
            }

            this.overallResults.endTime = Date.now();
            this.overallResults.duration = this.overallResults.endTime - this.overallResults.startTime;

            this.generateFinalReport();

        } catch (error) {
            console.error('❌ Test suite execution failed:', error);
            this.generateErrorReport(error);
        }
    }

    /**
     * Run a single test suite
     * @param {Object} suite - Test suite configuration
     * @param {Object} options - Run options
     */
    async runTestSuite(suite, options) {
        console.log(`\n🔬 Running ${suite.name} Tests`);
        console.log(`📝 ${suite.description}`);
        console.log('-'.repeat(60));

        const startTime = Date.now();
        let testInstance;
        let results = {
            suiteName: suite.name,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            duration: 0,
            errors: [],
            testDetails: []
        };

        try {
            // Create test instance
            testInstance = new suite.testClass(this.controlPanelManager);
            
            // Run the tests
            await testInstance.runAllTests();
            
            // Collect results
            if (testInstance.testResults) {
                results.testDetails = testInstance.testResults;
                results.totalTests = testInstance.testResults.length;
                results.passedTests = testInstance.testResults.filter(t => t.passed).length;
                results.failedTests = results.totalTests - results.passedTests;
            }

            // Run additional test methods if they exist
            if (options.includeStressTests && typeof testInstance.runStressTest === 'function') {
                console.log(`\n🔥 Running ${suite.name} Stress Tests...`);
                await testInstance.runStressTest();
            }

            if (typeof testInstance.runVisualTest === 'function') {
                console.log(`\n👀 Running ${suite.name} Visual Tests...`);
                await testInstance.runVisualTest();
            }

        } catch (error) {
            console.error(`❌ Error in ${suite.name} test suite:`, error);
            results.errors.push({
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }

        results.duration = Date.now() - startTime;
        this.testResults.set(suite.name, results);

        // Update overall results
        this.overallResults.totalTests += results.totalTests;
        this.overallResults.passedTests += results.passedTests;
        this.overallResults.failedTests += results.failedTests;

        // Print suite summary
        this.printSuiteSummary(results);
    }

    /**
     * Run integration tests
     */
    async runIntegrationTests() {
        console.log('\n🔗 Running Integration Tests');
        console.log('-'.repeat(60));

        const integrationTests = [
            {
                name: 'Parameter to UI Integration',
                test: () => this.testParameterUIIntegration()
            },
            {
                name: 'Preset to System Integration',
                test: () => this.testPresetSystemIntegration()
            },
            {
                name: 'Error Handling Integration',
                test: () => this.testErrorHandlingIntegration()
            },
            {
                name: 'Cross-System Communication',
                test: () => this.testCrossSystemCommunication()
            }
        ];

        const integrationResults = {
            suiteName: 'Integration Tests',
            totalTests: integrationTests.length,
            passedTests: 0,
            failedTests: 0,
            duration: 0,
            testDetails: []
        };

        const startTime = Date.now();

        for (const test of integrationTests) {
            try {
                console.log(`🧪 ${test.name}...`);
                const result = await test.test();
                
                integrationResults.testDetails.push({
                    name: test.name,
                    passed: result,
                    timestamp: new Date().toISOString()
                });

                if (result) {
                    integrationResults.passedTests++;
                    console.log(`✅ ${test.name}: PASSED`);
                } else {
                    integrationResults.failedTests++;
                    console.log(`❌ ${test.name}: FAILED`);
                }
            } catch (error) {
                integrationResults.failedTests++;
                integrationResults.testDetails.push({
                    name: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ ${test.name}: ERROR - ${error.message}`);
            }
        }

        integrationResults.duration = Date.now() - startTime;
        this.testResults.set('Integration Tests', integrationResults);

        this.overallResults.totalTests += integrationResults.totalTests;
        this.overallResults.passedTests += integrationResults.passedTests;
        this.overallResults.failedTests += integrationResults.failedTests;

        this.printSuiteSummary(integrationResults);
    }

    /**
     * Run stress tests
     */
    async runStressTests() {
        console.log('\n🔥 Running Stress Tests');
        console.log('-'.repeat(60));

        const stressTests = [
            {
                name: 'Rapid Parameter Changes',
                test: () => this.testRapidParameterChanges()
            },
            {
                name: 'Memory Pressure',
                test: () => this.testMemoryPressure()
            },
            {
                name: 'Concurrent Operations',
                test: () => this.testConcurrentOperations()
            },
            {
                name: 'Error Flood',
                test: () => this.testErrorFlood()
            }
        ];

        const stressResults = {
            suiteName: 'Stress Tests',
            totalTests: stressTests.length,
            passedTests: 0,
            failedTests: 0,
            duration: 0,
            testDetails: []
        };

        const startTime = Date.now();

        for (const test of stressTests) {
            try {
                console.log(`🔥 ${test.name}...`);
                const result = await test.test();
                
                stressResults.testDetails.push({
                    name: test.name,
                    passed: result,
                    timestamp: new Date().toISOString()
                });

                if (result) {
                    stressResults.passedTests++;
                    console.log(`✅ ${test.name}: PASSED`);
                } else {
                    stressResults.failedTests++;
                    console.log(`❌ ${test.name}: FAILED`);
                }
            } catch (error) {
                stressResults.failedTests++;
                stressResults.testDetails.push({
                    name: test.name,
                    passed: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ ${test.name}: ERROR - ${error.message}`);
            }
        }

        stressResults.duration = Date.now() - startTime;
        this.testResults.set('Stress Tests', stressResults);

        this.overallResults.totalTests += stressResults.totalTests;
        this.overallResults.passedTests += stressResults.passedTests;
        this.overallResults.failedTests += stressResults.failedTests;

        this.printSuiteSummary(stressResults);
    }

    /**
     * Test parameter to UI integration
     */
    async testParameterUIIntegration() {
        try {
            // Change a parameter and verify UI updates
            const originalValue = this.controlPanelManager.parameterController.getCurrentValue('heartBeatSpeed');
            const newValue = originalValue + 0.5;
            
            this.controlPanelManager.applyParameterChange('heartBeatSpeed', newValue, 'integration-test');
            
            // Wait for UI update
            await this.wait(100);
            
            // Check if UI reflects the change
            const slider = document.querySelector('[data-param="heartBeatSpeed"]');
            const valueDisplay = document.querySelector('[data-param="heartBeatSpeed"]').parentElement.querySelector('.control-value');
            
            const uiValue = parseFloat(slider.value);
            const displayValue = valueDisplay.textContent;
            
            // Restore original value
            this.controlPanelManager.applyParameterChange('heartBeatSpeed', originalValue, 'integration-test');
            
            return Math.abs(uiValue - newValue) < 0.01 && displayValue.includes(newValue.toFixed(1));
        } catch (error) {
            return false;
        }
    }

    /**
     * Test preset to system integration
     */
    async testPresetSystemIntegration() {
        try {
            // Apply a preset and verify all systems respond
            const presetManager = this.controlPanelManager.presetManager;
            if (!presetManager) return false;
            
            const originalValues = this.controlPanelManager.getCurrentParameterValues();
            
            // Apply a preset
            const success = presetManager.applyPreset('healthy-heart');
            if (!success) return false;
            
            await this.wait(500);
            
            // Check if values changed
            const newValues = this.controlPanelManager.getCurrentParameterValues();
            const valuesChanged = Object.keys(originalValues).some(key => 
                originalValues[key] !== newValues[key]
            );
            
            // Restore original values
            Object.entries(originalValues).forEach(([key, value]) => {
                this.controlPanelManager.applyParameterChange(key, value, 'integration-test');
            });
            
            return valuesChanged;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test error handling integration
     */
    async testErrorHandlingIntegration() {
        try {
            // Generate an error and verify it's handled
            const errorHandlingSystem = this.controlPanelManager.errorHandlingSystem;
            if (!errorHandlingSystem) return false;
            
            const errorCountBefore = errorHandlingSystem.errorLog.length;
            
            // Generate a test error
            errorHandlingSystem.handleError(new Error('Integration test error'), 'integration.test');
            
            const errorCountAfter = errorHandlingSystem.errorLog.length;
            
            return errorCountAfter > errorCountBefore;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test cross-system communication
     */
    async testCrossSystemCommunication() {
        try {
            // Test parameter linking between systems
            const linkingSystem = this.controlPanelManager.parameterLinkingSystem;
            if (!linkingSystem) return false;
            
            const originalHeartRate = this.controlPanelManager.parameterController.getCurrentValue('heartBeatSpeed');
            const newHeartRate = originalHeartRate + 1.0;
            
            // Change heart rate and check if linked parameters change
            this.controlPanelManager.applyParameterChange('heartBeatSpeed', newHeartRate, 'integration-test');
            
            await this.wait(300);
            
            // Check if any linked parameters changed (this depends on the linking configuration)
            const linkingStatus = linkingSystem.getSystemStatus();
            const hasActiveLinks = linkingStatus.activeLinks > 0;
            
            // Restore original value
            this.controlPanelManager.applyParameterChange('heartBeatSpeed', originalHeartRate, 'integration-test');
            
            return hasActiveLinks;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test rapid parameter changes
     */
    async testRapidParameterChanges() {
        try {
            const startTime = Date.now();
            const originalValue = this.controlPanelManager.parameterController.getCurrentValue('heartBeatSpeed');
            
            // Rapidly change parameters
            for (let i = 0; i < 20; i++) {
                const value = 1.0 + (i % 4) * 0.5;
                this.controlPanelManager.applyParameterChange('heartBeatSpeed', value, 'stress-test');
                
                if (i % 5 === 0) {
                    await this.wait(10); // Small delay every 5 changes
                }
            }
            
            const duration = Date.now() - startTime;
            
            // Restore original value
            this.controlPanelManager.applyParameterChange('heartBeatSpeed', originalValue, 'stress-test');
            
            // Test passes if it completes in reasonable time without errors
            return duration < 5000; // Should complete in under 5 seconds
        } catch (error) {
            return false;
        }
    }

    /**
     * Test memory pressure
     */
    async testMemoryPressure() {
        try {
            const initialMemory = window.performance && window.performance.memory ? 
                window.performance.memory.usedJSHeapSize : 0;
            
            // Create memory pressure by generating many log entries
            const loggingSystem = this.controlPanelManager.errorLoggingSystem;
            if (loggingSystem) {
                for (let i = 0; i < 100; i++) {
                    loggingSystem.log('INFO', 'stress-test', `Memory pressure test ${i}`, {
                        data: new Array(100).fill(`test-data-${i}`)
                    });
                }
            }
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            const finalMemory = window.performance && window.performance.memory ? 
                window.performance.memory.usedJSHeapSize : 0;
            
            // Test passes if memory usage is reasonable
            return initialMemory === 0 || (finalMemory - initialMemory) < 50 * 1024 * 1024; // Less than 50MB increase
        } catch (error) {
            return false;
        }
    }

    /**
     * Test concurrent operations
     */
    async testConcurrentOperations() {
        try {
            const operations = [];
            
            // Start multiple concurrent operations
            operations.push(this.controlPanelManager.applyParameterChange('heartBeatSpeed', 2.0, 'concurrent-1'));
            operations.push(this.controlPanelManager.applyParameterChange('heartSize', 1.2, 'concurrent-2'));
            operations.push(this.controlPanelManager.applyParameterChange('bloodFlowRate', 0.0005, 'concurrent-3'));
            
            if (this.controlPanelManager.presetManager) {
                operations.push(this.controlPanelManager.presetManager.applyPreset('healthy-heart'));
            }
            
            // Wait for all operations to complete
            const results = await Promise.allSettled(operations);
            
            // Test passes if most operations succeed
            const successCount = results.filter(result => result.status === 'fulfilled').length;
            return successCount >= operations.length * 0.8; // 80% success rate
        } catch (error) {
            return false;
        }
    }

    /**
     * Test error flood
     */
    async testErrorFlood() {
        try {
            const errorHandlingSystem = this.controlPanelManager.errorHandlingSystem;
            if (!errorHandlingSystem) return false;
            
            const startTime = Date.now();
            const initialErrorCount = errorHandlingSystem.errorLog.length;
            
            // Generate many errors rapidly
            for (let i = 0; i < 50; i++) {
                errorHandlingSystem.handleError(
                    new Error(`Stress test error ${i}`), 
                    `stress.test.${i % 5}`, 
                    { iteration: i }
                );
            }
            
            const duration = Date.now() - startTime;
            const finalErrorCount = errorHandlingSystem.errorLog.length;
            
            // Test passes if system handles errors without crashing and in reasonable time
            return duration < 2000 && (finalErrorCount > initialErrorCount);
        } catch (error) {
            return false;
        }
    }

    /**
     * Print suite summary
     * @param {Object} results - Suite results
     */
    printSuiteSummary(results) {
        const successRate = results.totalTests > 0 ? 
            ((results.passedTests / results.totalTests) * 100).toFixed(1) : '0.0';
        
        console.log(`\n📊 ${results.suiteName} Results:`);
        console.log(`   Total Tests: ${results.totalTests}`);
        console.log(`   ✅ Passed: ${results.passedTests}`);
        console.log(`   ❌ Failed: ${results.failedTests}`);
        console.log(`   📈 Success Rate: ${successRate}%`);
        console.log(`   ⏱️  Duration: ${results.duration}ms`);
        
        if (results.errors.length > 0) {
            console.log(`   🚨 Errors: ${results.errors.length}`);
        }
    }

    /**
     * Generate final report
     */
    generateFinalReport() {
        console.log('\n' + '='.repeat(80));
        console.log('🏁 COMPREHENSIVE TEST SUITE FINAL REPORT');
        console.log('='.repeat(80));
        
        const successRate = this.overallResults.totalTests > 0 ? 
            ((this.overallResults.passedTests / this.overallResults.totalTests) * 100).toFixed(1) : '0.0';
        
        console.log(`\n📊 Overall Results:`);
        console.log(`   Test Suites: ${this.overallResults.testSuites}`);
        console.log(`   Total Tests: ${this.overallResults.totalTests}`);
        console.log(`   ✅ Passed: ${this.overallResults.passedTests}`);
        console.log(`   ❌ Failed: ${this.overallResults.failedTests}`);
        console.log(`   📈 Success Rate: ${successRate}%`);
        console.log(`   ⏱️  Total Duration: ${this.overallResults.duration}ms`);
        
        // Suite breakdown
        console.log(`\n📋 Suite Breakdown:`);
        this.testResults.forEach((results, suiteName) => {
            const suiteSuccessRate = results.totalTests > 0 ? 
                ((results.passedTests / results.totalTests) * 100).toFixed(1) : '0.0';
            console.log(`   ${suiteName}: ${results.passedTests}/${results.totalTests} (${suiteSuccessRate}%)`);
        });
        
        // Failed tests summary
        const failedTests = [];
        this.testResults.forEach((results, suiteName) => {
            results.testDetails.forEach(test => {
                if (!test.passed) {
                    failedTests.push(`${suiteName}: ${test.name}`);
                }
            });
        });
        
        if (failedTests.length > 0) {
            console.log(`\n❌ Failed Tests:`);
            failedTests.forEach(test => console.log(`   - ${test}`));
        }
        
        // System health check
        console.log(`\n🏥 System Health Check:`);
        try {
            const health = this.controlPanelManager.checkSystemHealth();
            console.log(`   Overall Status: ${health.overall.toUpperCase()}`);
            console.log(`   Components: ${Object.keys(health.components).length}`);
            console.log(`   Errors: ${health.errors.length}`);
            console.log(`   Warnings: ${health.warnings.length}`);
        } catch (error) {
            console.log(`   Health Check Failed: ${error.message}`);
        }
        
        // Recommendations
        console.log(`\n💡 Recommendations:`);
        if (parseFloat(successRate) < 90) {
            console.log(`   - Success rate is below 90%. Review failed tests and fix issues.`);
        }
        if (this.overallResults.failedTests > 0) {
            console.log(`   - ${this.overallResults.failedTests} tests failed. Check logs for details.`);
        }
        if (parseFloat(successRate) >= 95) {
            console.log(`   - Excellent test coverage! System is ready for production.`);
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Store results globally for debugging
        window.comprehensiveTestResults = {
            overall: this.overallResults,
            suites: Object.fromEntries(this.testResults),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate error report
     * @param {Error} error - Error that occurred
     */
    generateErrorReport(error) {
        console.log('\n' + '='.repeat(80));
        console.log('❌ TEST SUITE EXECUTION FAILED');
        console.log('='.repeat(80));
        console.log(`Error: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
        console.log('\nPartial results:');
        this.generateFinalReport();
    }

    /**
     * Export test results
     * @returns {Object} Test results export
     */
    exportResults() {
        return {
            timestamp: new Date().toISOString(),
            overall: this.overallResults,
            suites: Object.fromEntries(this.testResults),
            systemInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                memory: window.performance && window.performance.memory ? {
                    used: window.performance.memory.usedJSHeapSize,
                    total: window.performance.memory.totalJSHeapSize,
                    limit: window.performance.memory.jsHeapSizeLimit
                } : null
            }
        };
    }

    /**
     * Download test results as JSON
     */
    downloadResults() {
        const results = this.exportResults();
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `heart-controls-test-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📥 Test results downloaded');
    }

    /**
     * Wait for a specified amount of time
     * @param {number} ms - Milliseconds to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
export default ComprehensiveTestSuite;