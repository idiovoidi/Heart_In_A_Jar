/**
 * Test file for comprehensive error handling and recovery systems
 * Tests error handling, graceful fallbacks, logging, and recovery mechanisms
 */

export class ErrorHandlingTest {
    constructor(controlPanelManager) {
        this.controlPanelManager = controlPanelManager;
        this.errorHandlingSystem = controlPanelManager.errorHandlingSystem;
        this.gracefulFallbackSystem = controlPanelManager.gracefulFallbackSystem;
        this.errorLoggingSystem = controlPanelManager.errorLoggingSystem;
        this.testResults = [];
    }

    /**
     * Run all error handling tests
     */
    async runAllTests() {
        console.log('🛡️ Starting Error Handling Tests...');
        
        try {
            await this.testErrorHandlingSystem();
            await this.testGracefulFallbacks();
            await this.testErrorLogging();
            await this.testSystemRecovery();
            await this.testErrorPrevention();
            await this.testSystemDiagnostics();
            
            this.reportResults();
        } catch (error) {
            console.error('❌ Error handling tests failed:', error);
        }
    }

    /**
     * Test error handling system
     */
    async testErrorHandlingSystem() {
        console.log('🔧 Testing error handling system...');
        
        // Test error handling system initialization
        this.addTestResult('Error handling system exists', !!this.errorHandlingSystem);
        
        if (!this.errorHandlingSystem) return;
        
        // Test error handling
        const testError = new Error('Test error for handling');
        const errorEntry = this.errorHandlingSystem.handleError(testError, 'test.errorHandling', { testData: 'test' });
        
        this.addTestResult('Error handling returns entry', !!errorEntry);
        this.addTestResult('Error entry has ID', !!errorEntry?.id);
        this.addTestResult('Error entry has timestamp', !!errorEntry?.timestamp);
        this.addTestResult('Error severity determined', !!errorEntry?.severity);
        
        // Test error severity determination
        const criticalError = new Error('Critical test error');
        const criticalEntry = this.errorHandlingSystem.handleError(criticalError, 'parameterController.applyParameter');
        this.addTestResult('Critical error severity correct', criticalEntry?.severity === 'critical');
        
        const lowError = new Error('Low priority test error');
        const lowEntry = this.errorHandlingSystem.handleError(lowError, 'ui.tooltip');
        this.addTestResult('Low error severity correct', lowEntry?.severity === 'low');
        
        // Test system health monitoring
        const healthBefore = this.errorHandlingSystem.getSystemHealth();
        this.addTestResult('System health available', !!healthBefore);
        this.addTestResult('Health has status', !!healthBefore.status);
        
        // Generate some errors to test health degradation
        for (let i = 0; i < 3; i++) {
            this.errorHandlingSystem.handleError(new Error(`Test error ${i}`), 'test.healthDegradation');
        }
        
        const healthAfter = this.errorHandlingSystem.getSystemHealth();
        this.addTestResult('Health degrades with errors', healthAfter.errors > healthBefore.errors);
        
        // Test error callbacks
        let callbackTriggered = false;
        this.errorHandlingSystem.registerErrorCallback('test.callback', () => {
            callbackTriggered = true;
        });
        
        this.errorHandlingSystem.handleError(new Error('Callback test'), 'test.callback');
        this.addTestResult('Error callbacks work', callbackTriggered);
    }

    /**
     * Test graceful fallback system
     */
    async testGracefulFallbacks() {
        console.log('🔄 Testing graceful fallback system...');
        
        this.addTestResult('Graceful fallback system exists', !!this.gracefulFallbackSystem);
        
        if (!this.gracefulFallbackSystem) return;
        
        // Test component checking
        const componentStatus = this.gracefulFallbackSystem.getSystemStatus();
        this.addTestResult('Component status available', !!componentStatus);
        this.addTestResult('Component status has totals', typeof componentStatus.totalComponents === 'number');
        
        // Test fallback strategies
        const hasHeartFallback = this.gracefulFallbackSystem.fallbackStrategies.has('heartSim');
        this.addTestResult('Heart simulation fallback strategy exists', hasHeartFallback);
        
        const hasArteryFallback = this.gracefulFallbackSystem.fallbackStrategies.has('arterySim');
        this.addTestResult('Artery simulation fallback strategy exists', hasArteryFallback);
        
        const hasFluidFallback = this.gracefulFallbackSystem.fallbackStrategies.has('fluidSim');
        this.addTestResult('Fluid simulation fallback strategy exists', hasFluidFallback);
        
        // Test component checking
        const heartAvailable = this.gracefulFallbackSystem.checkComponent('heartSim');
        this.addTestResult('Component checking works', typeof heartAvailable === 'boolean');
        
        // Test fallback creation (if component is missing)
        if (!heartAvailable) {
            const fallbackComponent = this.gracefulFallbackSystem.getFallbackComponent('heartSim');
            this.addTestResult('Fallback component created when needed', !!fallbackComponent);
            
            if (fallbackComponent) {
                this.addTestResult('Fallback has required methods', typeof fallbackComponent.setBeatSpeed === 'function');
            }
        }
        
        // Test diagnostic report
        const diagnosticReport = this.gracefulFallbackSystem.createDiagnosticReport();
        this.addTestResult('Diagnostic report available', !!diagnosticReport);
        this.addTestResult('Diagnostic has timestamp', !!diagnosticReport.timestamp);
        this.addTestResult('Diagnostic has system status', !!diagnosticReport.systemStatus);
        
        // Test component restoration
        const restoredCount = this.gracefulFallbackSystem.attemptComponentRestoration();
        this.addTestResult('Component restoration executes', typeof restoredCount === 'number');
    }

    /**
     * Test error logging system
     */
    async testErrorLogging() {
        console.log('📝 Testing error logging system...');
        
        this.addTestResult('Error logging system exists', !!this.errorLoggingSystem);
        
        if (!this.errorLoggingSystem) return;
        
        // Test basic logging
        const logCountBefore = this.errorLoggingSystem.logs.length;
        this.errorLoggingSystem.log('INFO', 'test', 'Test log message', { testData: true });
        const logCountAfter = this.errorLoggingSystem.logs.length;
        
        this.addTestResult('Logging adds entries', logCountAfter > logCountBefore);
        
        // Test log levels
        this.errorLoggingSystem.log('DEBUG', 'test', 'Debug message');
        this.errorLoggingSystem.log('WARN', 'test', 'Warning message');
        this.errorLoggingSystem.log('ERROR', 'test', 'Error message');
        this.errorLoggingSystem.log('CRITICAL', 'test', 'Critical message');
        
        const logs = this.errorLoggingSystem.getLogs();
        const hasDebug = logs.some(log => log.level === 'DEBUG');
        const hasWarn = logs.some(log => log.level === 'WARN');
        const hasError = logs.some(log => log.level === 'ERROR');
        const hasCritical = logs.some(log => log.level === 'CRITICAL');
        
        this.addTestResult('Debug logs recorded', hasDebug);
        this.addTestResult('Warning logs recorded', hasWarn);
        this.addTestResult('Error logs recorded', hasError);
        this.addTestResult('Critical logs recorded', hasCritical);
        
        // Test log filtering
        const errorLogs = this.errorLoggingSystem.getLogs({ level: 'ERROR' });
        const allErrorsOrHigher = errorLogs.every(log => 
            this.errorLoggingSystem.logLevels[log.level] >= this.errorLoggingSystem.logLevels.ERROR
        );
        this.addTestResult('Log filtering by level works', allErrorsOrHigher);
        
        // Test log statistics
        const stats = this.errorLoggingSystem.getLogStatistics();
        this.addTestResult('Log statistics available', !!stats);
        this.addTestResult('Statistics have totals', typeof stats.total === 'number');
        this.addTestResult('Statistics have session info', !!stats.sessionId);
        
        // Test log export
        const exportData = this.errorLoggingSystem.exportLogs({ level: 'INFO', limit: 10 });
        this.addTestResult('Log export works', !!exportData);
        this.addTestResult('Export has logs array', Array.isArray(exportData.logs));
        this.addTestResult('Export has browser info', !!exportData.browserInfo);
        
        // Test log listeners
        let listenerTriggered = false;
        this.errorLoggingSystem.addLogListener('test', () => {
            listenerTriggered = true;
        });
        
        this.errorLoggingSystem.log('INFO', 'test', 'Listener test message');
        this.addTestResult('Log listeners work', listenerTriggered);
    }

    /**
     * Test system recovery mechanisms
     */
    async testSystemRecovery() {
        console.log('🔄 Testing system recovery...');
        
        // Test health checking
        const health = this.controlPanelManager.checkSystemHealth();
        this.addTestResult('System health check works', !!health);
        this.addTestResult('Health has overall status', !!health.overall);
        this.addTestResult('Health has components', !!health.components);
        this.addTestResult('Health has timestamp', !!health.timestamp);
        
        // Test recovery mechanisms
        const parameterRecovery = this.controlPanelManager.performSystemRecovery('parameters');
        this.addTestResult('Parameter recovery executes', typeof parameterRecovery === 'boolean');
        
        const componentRecovery = this.controlPanelManager.performSystemRecovery('components');
        this.addTestResult('Component recovery executes', typeof componentRecovery === 'boolean');
        
        const autoRecovery = this.controlPanelManager.performSystemRecovery('auto');
        this.addTestResult('Auto recovery executes', typeof autoRecovery === 'boolean');
        
        // Test advanced system status
        const advancedStatus = this.controlPanelManager.getAdvancedSystemStatus();
        this.addTestResult('Advanced system status available', !!advancedStatus);
        this.addTestResult('Status includes parameter linking', !!advancedStatus.parameterLinking);
        this.addTestResult('Status includes validation', !!advancedStatus.validation);
        this.addTestResult('Status includes performance', !!advancedStatus.performance);
    }

    /**
     * Test error prevention mechanisms
     */
    async testErrorPrevention() {
        console.log('🛡️ Testing error prevention...');
        
        // Test parameter validation preventing errors
        const originalValue = this.controlPanelManager.parameterController.getCurrentValue('heartBeatSpeed');
        
        // Try to set an invalid value
        const invalidResult = this.controlPanelManager.applyParameterChange('heartBeatSpeed', 999, 'test');
        const valueAfterInvalid = this.controlPanelManager.parameterController.getCurrentValue('heartBeatSpeed');
        
        this.addTestResult('Invalid parameter rejected', valueAfterInvalid === originalValue);
        
        // Test graceful handling of missing components
        const missingComponentTest = () => {
            try {
                // This should not crash even if components are missing
                this.controlPanelManager.parameterController.applyParameter('heartBeatSpeed', 2.0);
                return true;
            } catch (error) {
                return false;
            }
        };
        
        this.addTestResult('Missing components handled gracefully', missingComponentTest());
        
        // Test UI state corruption recovery
        const uiRecoveryTest = () => {
            try {
                // Simulate UI corruption by removing a control
                const testControl = document.querySelector('[data-parameter="heartBeatSpeed"]');
                if (testControl) {
                    testControl.remove();
                }
                
                // This should recreate the control if needed
                this.controlPanelManager.updateControlDisplay('heartBeatSpeed', 2.0);
                return true;
            } catch (error) {
                return false;
            }
        };
        
        this.addTestResult('UI corruption handled', uiRecoveryTest());
    }

    /**
     * Test system diagnostics
     */
    async testSystemDiagnostics() {
        console.log('🔍 Testing system diagnostics...');
        
        // Test diagnostics panel creation
        const diagnosticsPanel = this.controlPanelManager.createSystemDiagnosticsPanel();
        this.addTestResult('Diagnostics panel created', !!diagnosticsPanel);
        this.addTestResult('Panel has correct class', diagnosticsPanel.classList.contains('system-diagnostics-panel'));
        
        // Test diagnostics content update
        this.controlPanelManager.updateDiagnosticsContent(diagnosticsPanel);
        const content = diagnosticsPanel.querySelector('#diagnostics-content');
        this.addTestResult('Diagnostics content updated', content.innerHTML.length > 50);
        
        // Test diagnostics data export
        const exportTest = () => {
            try {
                // Don't actually download, just test the data preparation
                const health = this.controlPanelManager.checkSystemHealth();
                const diagnostics = {
                    systemHealth: health,
                    errorLogs: this.errorLoggingSystem ? this.errorLoggingSystem.exportLogs() : null,
                    fallbackReport: this.gracefulFallbackSystem ? this.gracefulFallbackSystem.createDiagnosticReport() : null,
                    advancedSystemStatus: this.controlPanelManager.getAdvancedSystemStatus(),
                    timestamp: new Date().toISOString()
                };
                
                return !!diagnostics && !!diagnostics.systemHealth;
            } catch (error) {
                return false;
            }
        };
        
        this.addTestResult('Diagnostics export data prepared', exportTest());
        
        // Clean up test panel
        diagnosticsPanel.remove();
    }

    /**
     * Test error scenarios and recovery
     */
    async testErrorScenarios() {
        console.log('⚠️ Testing error scenarios...');
        
        // Scenario 1: Parameter controller error
        const scenario1 = await this.testParameterControllerError();
        this.addTestResult('Parameter controller error scenario', scenario1);
        
        // Scenario 2: Missing simulation component
        const scenario2 = await this.testMissingComponentScenario();
        this.addTestResult('Missing component scenario', scenario2);
        
        // Scenario 3: UI corruption
        const scenario3 = await this.testUICorruptionScenario();
        this.addTestResult('UI corruption scenario', scenario3);
        
        // Scenario 4: Memory pressure
        const scenario4 = await this.testMemoryPressureScenario();
        this.addTestResult('Memory pressure scenario', scenario4);
    }

    /**
     * Test parameter controller error scenario
     */
    async testParameterControllerError() {
        try {
            // Simulate parameter controller error
            const originalApply = this.controlPanelManager.parameterController.applyParameter;
            this.controlPanelManager.parameterController.applyParameter = () => {
                throw new Error('Simulated parameter controller error');
            };
            
            // This should be handled gracefully
            const result = this.controlPanelManager.applyParameterChange('heartBeatSpeed', 2.0, 'test');
            
            // Restore original method
            this.controlPanelManager.parameterController.applyParameter = originalApply;
            
            return true; // If we get here, error was handled
        } catch (error) {
            return false; // Error was not handled properly
        }
    }

    /**
     * Test missing component scenario
     */
    async testMissingComponentScenario() {
        try {
            // Simulate missing heart simulation
            const originalGetEntity = this.controlPanelManager.sceneManager.getEntity;
            this.controlPanelManager.sceneManager.getEntity = (name) => {
                if (name === 'heartSim') return null;
                return originalGetEntity.call(this.controlPanelManager.sceneManager, name);
            };
            
            // Force component check
            this.gracefulFallbackSystem.checkComponent('heartSim');
            
            // This should activate fallback
            const isInFallback = this.gracefulFallbackSystem.isInFallbackMode('heartSim');
            
            // Restore original method
            this.controlPanelManager.sceneManager.getEntity = originalGetEntity;
            
            return isInFallback;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test UI corruption scenario
     */
    async testUICorruptionScenario() {
        try {
            // Simulate UI corruption by removing control panel
            const controlPanel = document.querySelector('.control-panel');
            if (controlPanel) {
                controlPanel.remove();
            }
            
            // This should recreate the panel
            this.controlPanelManager.createControlPanel();
            this.controlPanelManager.createControlSections();
            
            // Check if panel was recreated
            const newPanel = document.querySelector('.control-panel');
            return !!newPanel;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test memory pressure scenario
     */
    async testMemoryPressureScenario() {
        try {
            // Simulate memory pressure by creating many log entries
            for (let i = 0; i < 100; i++) {
                this.errorLoggingSystem.log('INFO', 'memoryTest', `Memory test log ${i}`, { data: new Array(1000).fill('test') });
            }
            
            // Check if logging system handled the pressure
            const stats = this.errorLoggingSystem.getLogStatistics();
            return stats.total <= this.errorLoggingSystem.maxLogSize;
        } catch (error) {
            return false;
        }
    }

    /**
     * Add a test result
     * @param {string} testName - Name of the test
     * @param {boolean} passed - Whether the test passed
     */
    addTestResult(testName, passed) {
        this.testResults.push({
            name: testName,
            passed: passed,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    }

    /**
     * Report all test results
     */
    reportResults() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log('\n📊 Error Handling Test Results:');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(result => !result.passed)
                .forEach(result => console.log(`  - ${result.name}`));
        }
        
        // Store results for debugging
        window.errorHandlingTestResults = this.testResults;
        
        // System health summary
        console.log('\n🏥 System Health Summary:');
        const health = this.controlPanelManager.checkSystemHealth();
        console.log(`Overall Status: ${health.overall.toUpperCase()}`);
        console.log(`Components: ${Object.keys(health.components).length}`);
        console.log(`Errors: ${health.errors.length}`);
        console.log(`Warnings: ${health.warnings.length}`);
        
        if (health.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            health.recommendations.forEach(rec => console.log(`  - ${rec}`));
        }
    }

    /**
     * Wait for a specified amount of time
     * @param {number} ms - Milliseconds to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Run stress test for error handling
     */
    async runStressTest() {
        console.log('🔥 Running error handling stress test...');
        
        const startTime = Date.now();
        let errorsGenerated = 0;
        let errorsHandled = 0;
        
        // Generate many errors rapidly
        for (let i = 0; i < 50; i++) {
            try {
                const error = new Error(`Stress test error ${i}`);
                const handled = this.errorHandlingSystem.handleError(error, `stressTest.batch${Math.floor(i/10)}`, { iteration: i });
                errorsGenerated++;
                if (handled) errorsHandled++;
            } catch (error) {
                console.error('Error during stress test:', error);
            }
            
            // Small delay to prevent blocking
            if (i % 10 === 0) {
                await this.wait(10);
            }
        }
        
        const duration = Date.now() - startTime;
        const health = this.errorHandlingSystem.getSystemHealth();
        
        console.log(`\n🔥 Stress Test Results:`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Errors Generated: ${errorsGenerated}`);
        console.log(`Errors Handled: ${errorsHandled}`);
        console.log(`System Health: ${health.status}`);
        console.log(`Recovery Rate: ${this.errorHandlingSystem.calculateRecoveryRate()}%`);
        
        this.addTestResult('Stress test completed', errorsHandled === errorsGenerated);
        this.addTestResult('System survived stress test', health.status !== 'critical');
    }
}

// Export for use in other modules
export default ErrorHandlingTest;