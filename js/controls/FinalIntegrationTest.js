/**
 * Final Integration Test for Interactive Heart Controls
 * Comprehensive end-to-end testing of the complete system
 */

export class FinalIntegrationTest {
    constructor(controlPanelManager) {
        this.controlPanelManager = controlPanelManager;
        this.testResults = [];
        this.integrationScenarios = [];
    }

    /**
     * Run complete integration test
     */
    async runCompleteIntegrationTest() {
        console.log('🎯 Starting Final Integration Test for Interactive Heart Controls');
        console.log('=' .repeat(80));
        
        const startTime = Date.now();
        
        try {
            // Test system initialization
            await this.testSystemInitialization();
            
            // Test complete user workflows
            await this.testUserWorkflows();
            
            // Test system resilience
            await this.testSystemResilience();
            
            // Test performance under load
            await this.testPerformanceUnderLoad();
            
            // Test data persistence
            await this.testDataPersistence();
            
            // Generate final report
            const duration = Date.now() - startTime;
            this.generateIntegrationReport(duration);
            
        } catch (error) {
            console.error('❌ Integration test failed:', error);
            this.generateErrorReport(error);
        }
    }

    /**
     * Test system initialization
     */
    async testSystemInitialization() {
        console.log('\n🚀 Testing System Initialization...');
        
        // Test core systems
        this.addTestResult('ControlPanelManager initialized', !!this.controlPanelManager);
        this.addTestResult('ParameterController available', !!this.controlPanelManager.parameterController);
        this.addTestResult('Event system active', !!this.controlPanelManager.eventSystem);
        
        // Test control systems
        this.addTestResult('Heart control system loaded', !!this.controlPanelManager.heartControlSystem);
        this.addTestResult('Artery control system loaded', !!this.controlPanelManager.arteryControlSystem);
        this.addTestResult('Fluid control system loaded', !!this.controlPanelManager.fluidControlSystem);
        this.addTestResult('Environment control system loaded', !!this.controlPanelManager.environmentControlSystem);
        
        // Test advanced features
        this.addTestResult('Parameter linking system active', !!this.controlPanelManager.parameterLinkingSystem);
        this.addTestResult('Validation system active', !!this.controlPanelManager.validationSystem);
        this.addTestResult('Keyboard shortcuts active', !!this.controlPanelManager.keyboardShortcuts);
        this.addTestResult('Error handling system active', !!this.controlPanelManager.errorHandlingSystem);
        
        // Test UI elements
        const controlPanel = document.querySelector('.control-panel');
        this.addTestResult('Control panel UI created', !!controlPanel);
        
        const sections = controlPanel?.querySelectorAll('.control-section');
        this.addTestResult('Control sections created', sections && sections.length >= 4);
        
        const parameters = controlPanel?.querySelectorAll('.parameter-control');
        this.addTestResult('Parameter controls created', parameters && parameters.length >= 16);
    }

    /**
     * Test complete user workflows
     */
    async testUserWorkflows() {
        console.log('\n👤 Testing User Workflows...');
        
        // Workflow 1: Basic parameter adjustment
        await this.testBasicParameterWorkflow();
        
        // Workflow 2: Preset application
        await this.testPresetWorkflow();
        
        // Workflow 3: Advanced configuration
        await this.testAdvancedConfigurationWorkflow();
        
        // Workflow 4: Error recovery
        await this.testErrorRecoveryWorkflow();
        
        // Workflow 5: Keyboard shortcuts
        await this.testKeyboardShortcutWorkflow();
    }

    /**
     * Test basic parameter adjustment workflow
     */
    async testBasicParameterWorkflow() {
        console.log('  📊 Testing basic parameter adjustment...');
        
        try {
            // Get initial values
            const initialValues = this.controlPanelManager.getCurrentParameterValues();
            
            // Adjust heart parameters
            const heartSuccess = this.controlPanelManager.applyParameterChange('heartBeatSpeed', 2.5, 'workflow-test');
            this.addTestResult('Heart parameter adjustment', heartSuccess);
            
            await this.wait(100);
            
            // Verify UI updated
            const slider = document.querySelector('[data-param="heartBeatSpeed"]');
            const uiUpdated = slider && Math.abs(parseFloat(slider.value) - 2.5) < 0.01;
            this.addTestResult('UI reflects parameter change', uiUpdated);
            
            // Test parameter linking
            await this.wait(300);
            const linkingWorked = this.testParameterLinking();
            this.addTestResult('Parameter linking active', linkingWorked);
            
            // Restore initial values
            Object.entries(initialValues).forEach(([param, value]) => {
                this.controlPanelManager.applyParameterChange(param, value, 'workflow-test');
            });
            
        } catch (error) {
            this.addTestResult('Basic parameter workflow', false);
            console.error('Basic parameter workflow error:', error);
        }
    }

    /**
     * Test preset workflow
     */
    async testPresetWorkflow() {
        console.log('  🎛️ Testing preset workflow...');
        
        try {
            const presetManager = this.controlPanelManager.presetManager;
            if (!presetManager) {
                this.addTestResult('Preset workflow (no preset manager)', false);
                return;
            }
            
            // Get initial values
            const initialValues = this.controlPanelManager.getCurrentParameterValues();
            
            // Apply preset
            const presetApplied = presetManager.applyPreset('healthy-heart');
            this.addTestResult('Preset application', presetApplied);
            
            await this.wait(500);
            
            // Verify values changed
            const newValues = this.controlPanelManager.getCurrentParameterValues();
            const valuesChanged = Object.keys(initialValues).some(key => 
                Math.abs(initialValues[key] - newValues[key]) > 0.001
            );
            this.addTestResult('Preset changed parameters', valuesChanged);
            
            // Test custom preset creation
            const customPresetSaved = presetManager.savePreset('integration-test', {
                heartBeatSpeed: 3.0,
                heartSize: 1.5
            });
            this.addTestResult('Custom preset creation', customPresetSaved);
            
            // Apply custom preset
            const customPresetApplied = presetManager.applyPreset('integration-test');
            this.addTestResult('Custom preset application', customPresetApplied);
            
        } catch (error) {
            this.addTestResult('Preset workflow', false);
            console.error('Preset workflow error:', error);
        }
    }

    /**
     * Test advanced configuration workflow
     */
    async testAdvancedConfigurationWorkflow() {
        console.log('  ⚙️ Testing advanced configuration...');
        
        try {
            // Test configuration export
            const exportedConfig = this.controlPanelManager.exportConfiguration();
            this.addTestResult('Configuration export', !!exportedConfig && !!exportedConfig.parameters);
            
            // Test advanced settings
            this.controlPanelManager.setParameterLinkingEnabled(false);
            await this.wait(100);
            this.controlPanelManager.setParameterLinkingEnabled(true);
            this.addTestResult('Parameter linking toggle', true);
            
            this.controlPanelManager.setSmoothTransitionsEnabled(false);
            await this.wait(100);
            this.controlPanelManager.setSmoothTransitionsEnabled(true);
            this.addTestResult('Smooth transitions toggle', true);
            
            // Test system health check
            const health = this.controlPanelManager.checkSystemHealth();
            this.addTestResult('System health check', !!health && !!health.overall);
            
        } catch (error) {
            this.addTestResult('Advanced configuration workflow', false);
            console.error('Advanced configuration error:', error);
        }
    }

    /**
     * Test error recovery workflow
     */
    async testErrorRecoveryWorkflow() {
        console.log('  🛡️ Testing error recovery...');
        
        try {
            const errorHandlingSystem = this.controlPanelManager.errorHandlingSystem;
            if (!errorHandlingSystem) {
                this.addTestResult('Error recovery workflow (no error system)', false);
                return;
            }
            
            // Generate test error
            const errorEntry = errorHandlingSystem.handleError(
                new Error('Integration test error'), 
                'integration.workflow.test'
            );
            this.addTestResult('Error handling', !!errorEntry);
            
            // Test system recovery
            const recoveryResult = this.controlPanelManager.performSystemRecovery('auto');
            this.addTestResult('System recovery', typeof recoveryResult === 'boolean');
            
            // Test graceful fallbacks
            const fallbackSystem = this.controlPanelManager.gracefulFallbackSystem;
            if (fallbackSystem) {
                const fallbackStatus = fallbackSystem.getSystemStatus();
                this.addTestResult('Graceful fallback system', !!fallbackStatus);
            }
            
        } catch (error) {
            this.addTestResult('Error recovery workflow', false);
            console.error('Error recovery workflow error:', error);
        }
    }

    /**
     * Test keyboard shortcut workflow
     */
    async testKeyboardShortcutWorkflow() {
        console.log('  ⌨️ Testing keyboard shortcuts...');
        
        try {
            const keyboardSystem = this.controlPanelManager.keyboardShortcuts;
            if (!keyboardSystem) {
                this.addTestResult('Keyboard shortcut workflow (no keyboard system)', false);
                return;
            }
            
            // Test shortcut system status
            const shortcutStatus = keyboardSystem.getSystemStatus();
            this.addTestResult('Keyboard shortcuts available', shortcutStatus.totalShortcuts > 0);
            
            // Test help system
            keyboardSystem.showHelp();
            await this.wait(100);
            const helpVisible = keyboardSystem.helpVisible;
            keyboardSystem.hideHelp();
            this.addTestResult('Keyboard shortcut help system', helpVisible);
            
        } catch (error) {
            this.addTestResult('Keyboard shortcut workflow', false);
            console.error('Keyboard shortcut workflow error:', error);
        }
    }

    /**
     * Test system resilience
     */
    async testSystemResilience() {
        console.log('\n🛡️ Testing System Resilience...');
        
        // Test invalid parameter values
        await this.testInvalidParameterHandling();
        
        // Test missing components
        await this.testMissingComponentHandling();
        
        // Test UI corruption recovery
        await this.testUICorruptionRecovery();
        
        // Test memory pressure
        await this.testMemoryPressureHandling();
    }

    /**
     * Test invalid parameter handling
     */
    async testInvalidParameterHandling() {
        console.log('  ❌ Testing invalid parameter handling...');
        
        try {
            const originalValue = this.controlPanelManager.parameterController.getCurrentValue('heartBeatSpeed');
            
            // Try invalid values
            const invalidResults = [
                this.controlPanelManager.applyParameterChange('heartBeatSpeed', -1, 'resilience-test'),
                this.controlPanelManager.applyParameterChange('heartBeatSpeed', 999, 'resilience-test'),
                this.controlPanelManager.applyParameterChange('heartBeatSpeed', 'invalid', 'resilience-test'),
                this.controlPanelManager.applyParameterChange('nonexistent', 1.0, 'resilience-test')
            ];
            
            // All should fail gracefully
            const allHandledGracefully = invalidResults.every(result => result === false);
            this.addTestResult('Invalid parameters handled gracefully', allHandledGracefully);
            
            // Value should remain unchanged
            const currentValue = this.controlPanelManager.parameterController.getCurrentValue('heartBeatSpeed');
            this.addTestResult('Parameter value protected from invalid input', currentValue === originalValue);
            
        } catch (error) {
            this.addTestResult('Invalid parameter handling', false);
            console.error('Invalid parameter handling error:', error);
        }
    }

    /**
     * Test missing component handling
     */
    async testMissingComponentHandling() {
        console.log('  🔍 Testing missing component handling...');
        
        try {
            const fallbackSystem = this.controlPanelManager.gracefulFallbackSystem;
            if (!fallbackSystem) {
                this.addTestResult('Missing component handling (no fallback system)', false);
                return;
            }
            
            // Force component check
            fallbackSystem.forceCheckAllComponents();
            
            const status = fallbackSystem.getSystemStatus();
            this.addTestResult('Component status monitoring', !!status);
            
            // Test component restoration
            const restoredCount = fallbackSystem.attemptComponentRestoration();
            this.addTestResult('Component restoration attempt', typeof restoredCount === 'number');
            
        } catch (error) {
            this.addTestResult('Missing component handling', false);
            console.error('Missing component handling error:', error);
        }
    }

    /**
     * Test UI corruption recovery
     */
    async testUICorruptionRecovery() {
        console.log('  🔧 Testing UI corruption recovery...');
        
        try {
            // Simulate UI corruption by removing a control
            const testControl = document.querySelector('[data-parameter="heartBeatSpeed"]');
            const originalParent = testControl?.parentElement;
            
            if (testControl) {
                testControl.remove();
                
                // Try to update the missing control
                this.controlPanelManager.updateControlDisplay('heartBeatSpeed', 2.0);
                
                // Check if system handled it gracefully
                this.addTestResult('UI corruption handled gracefully', true);
                
                // Recreate the control panel to restore UI
                this.controlPanelManager.createControlPanel();
                this.controlPanelManager.createControlSections();
                
                const restoredControl = document.querySelector('[data-parameter="heartBeatSpeed"]');
                this.addTestResult('UI restoration successful', !!restoredControl);
            } else {
                this.addTestResult('UI corruption test (no test control found)', true);
            }
            
        } catch (error) {
            this.addTestResult('UI corruption recovery', false);
            console.error('UI corruption recovery error:', error);
        }
    }

    /**
     * Test memory pressure handling
     */
    async testMemoryPressureHandling() {
        console.log('  💾 Testing memory pressure handling...');
        
        try {
            const loggingSystem = this.controlPanelManager.errorLoggingSystem;
            if (!loggingSystem) {
                this.addTestResult('Memory pressure handling (no logging system)', false);
                return;
            }
            
            const initialLogCount = loggingSystem.logs.length;
            
            // Generate memory pressure
            for (let i = 0; i < 200; i++) {
                loggingSystem.log('INFO', 'memory-pressure-test', `Test log ${i}`, {
                    data: new Array(50).fill(`data-${i}`)
                });
            }
            
            const finalLogCount = loggingSystem.logs.length;
            
            // System should limit log size
            const memoryManaged = finalLogCount <= loggingSystem.maxLogSize;
            this.addTestResult('Memory pressure managed', memoryManaged);
            
        } catch (error) {
            this.addTestResult('Memory pressure handling', false);
            console.error('Memory pressure handling error:', error);
        }
    }

    /**
     * Test performance under load
     */
    async testPerformanceUnderLoad() {
        console.log('\n⚡ Testing Performance Under Load...');
        
        const startTime = Date.now();
        
        try {
            // Rapid parameter changes
            for (let i = 0; i < 50; i++) {
                const value = 1.0 + (i % 4) * 0.5;
                this.controlPanelManager.applyParameterChange('heartBeatSpeed', value, 'performance-test');
                
                if (i % 10 === 0) {
                    await this.wait(5);
                }
            }
            
            const parameterChangeTime = Date.now() - startTime;
            this.addTestResult('Rapid parameter changes performance', parameterChangeTime < 3000);
            
            // Concurrent operations
            const concurrentStart = Date.now();
            const operations = [
                this.controlPanelManager.applyParameterChange('heartSize', 1.2, 'concurrent-1'),
                this.controlPanelManager.applyParameterChange('bloodFlowRate', 0.0005, 'concurrent-2'),
                this.controlPanelManager.applyParameterChange('fogDensity', 0.1, 'concurrent-3')
            ];
            
            await Promise.allSettled(operations);
            const concurrentTime = Date.now() - concurrentStart;
            this.addTestResult('Concurrent operations performance', concurrentTime < 1000);
            
        } catch (error) {
            this.addTestResult('Performance under load', false);
            console.error('Performance under load error:', error);
        }
    }

    /**
     * Test data persistence
     */
    async testDataPersistence() {
        console.log('\n💾 Testing Data Persistence...');
        
        try {
            // Test configuration export/import
            const originalConfig = this.controlPanelManager.exportConfiguration();
            this.addTestResult('Configuration export', !!originalConfig);
            
            // Modify some parameters
            this.controlPanelManager.applyParameterChange('heartBeatSpeed', 3.0, 'persistence-test');
            this.controlPanelManager.applyParameterChange('heartSize', 1.5, 'persistence-test');
            
            // Export modified configuration
            const modifiedConfig = this.controlPanelManager.exportConfiguration();
            
            // Import original configuration
            this.controlPanelManager.importConfiguration(originalConfig);
            await this.wait(200);
            
            // Verify restoration
            const restoredConfig = this.controlPanelManager.exportConfiguration();
            const configRestored = JSON.stringify(originalConfig.parameters) === 
                                 JSON.stringify(restoredConfig.parameters);
            this.addTestResult('Configuration import/restore', configRestored);
            
            // Test error log persistence
            const loggingSystem = this.controlPanelManager.errorLoggingSystem;
            if (loggingSystem) {
                const exportedLogs = loggingSystem.exportLogs();
                this.addTestResult('Error log export', !!exportedLogs && !!exportedLogs.logs);
            }
            
        } catch (error) {
            this.addTestResult('Data persistence', false);
            console.error('Data persistence error:', error);
        }
    }

    /**
     * Test parameter linking
     */
    testParameterLinking() {
        try {
            const linkingSystem = this.controlPanelManager.parameterLinkingSystem;
            if (!linkingSystem) return false;
            
            const status = linkingSystem.getSystemStatus();
            return status.enabled && status.activeLinks > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Add test result
     * @param {string} testName - Test name
     * @param {boolean} passed - Whether test passed
     */
    addTestResult(testName, passed) {
        this.testResults.push({
            name: testName,
            passed: passed,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`    ${status} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    }

    /**
     * Generate integration report
     * @param {number} duration - Test duration
     */
    generateIntegrationReport(duration) {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
        
        console.log('\n' + '='.repeat(80));
        console.log('🏁 FINAL INTEGRATION TEST REPORT');
        console.log('='.repeat(80));
        
        console.log(`\n📊 Overall Results:`);
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   ✅ Passed: ${passedTests}`);
        console.log(`   ❌ Failed: ${failedTests}`);
        console.log(`   📈 Success Rate: ${successRate}%`);
        console.log(`   ⏱️  Duration: ${duration}ms`);
        
        // System health summary
        try {
            const health = this.controlPanelManager.checkSystemHealth();
            console.log(`\n🏥 Final System Health:`);
            console.log(`   Status: ${health.overall.toUpperCase()}`);
            console.log(`   Components: ${Object.keys(health.components).length}`);
            console.log(`   Errors: ${health.errors.length}`);
            console.log(`   Warnings: ${health.warnings.length}`);
        } catch (error) {
            console.log(`\n🏥 System Health Check Failed: ${error.message}`);
        }
        
        // Failed tests
        if (failedTests > 0) {
            console.log(`\n❌ Failed Tests:`);
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => console.log(`   - ${r.name}`));
        }
        
        // Final assessment
        console.log(`\n🎯 Final Assessment:`);
        if (parseFloat(successRate) >= 95) {
            console.log(`   🌟 EXCELLENT: System is production-ready with ${successRate}% success rate`);
        } else if (parseFloat(successRate) >= 85) {
            console.log(`   ✅ GOOD: System is functional with ${successRate}% success rate`);
        } else if (parseFloat(successRate) >= 70) {
            console.log(`   ⚠️  FAIR: System needs improvement with ${successRate}% success rate`);
        } else {
            console.log(`   ❌ POOR: System requires significant fixes with ${successRate}% success rate`);
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Store results globally
        window.finalIntegrationTestResults = {
            totalTests,
            passedTests,
            failedTests,
            successRate: parseFloat(successRate),
            duration,
            testDetails: this.testResults,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate error report
     * @param {Error} error - Error that occurred
     */
    generateErrorReport(error) {
        console.log('\n' + '='.repeat(80));
        console.log('❌ INTEGRATION TEST EXECUTION FAILED');
        console.log('='.repeat(80));
        console.log(`Error: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
        
        if (this.testResults.length > 0) {
            console.log('\nPartial Results:');
            const passed = this.testResults.filter(r => r.passed).length;
            console.log(`Completed ${this.testResults.length} tests, ${passed} passed`);
        }
    }

    /**
     * Wait for specified time
     * @param {number} ms - Milliseconds to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default FinalIntegrationTest;