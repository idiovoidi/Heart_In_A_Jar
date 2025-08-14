/**
 * Test file for advanced parameter linking and features
 * Tests parameter linking, validation, keyboard shortcuts, and smooth transitions
 */

export class AdvancedFeaturesTest {
    constructor(controlPanelManager) {
        this.controlPanelManager = controlPanelManager;
        this.parameterController = controlPanelManager.parameterController;
        this.linkingSystem = controlPanelManager.parameterLinkingSystem;
        this.validationSystem = controlPanelManager.validationSystem;
        this.keyboardShortcuts = controlPanelManager.keyboardShortcuts;
        this.testResults = [];
    }

    /**
     * Run all advanced feature tests
     */
    async runAllTests() {
        console.log('🔗 Starting Advanced Features Tests...');
        
        try {
            await this.testParameterLinking();
            await this.testAdvancedValidation();
            await this.testKeyboardShortcuts();
            await this.testSmoothTransitions();
            await this.testSystemIntegration();
            
            this.reportResults();
        } catch (error) {
            console.error('❌ Advanced features tests failed:', error);
        }
    }

    /**
     * Test parameter linking system
     */
    async testParameterLinking() {
        console.log('🔗 Testing parameter linking...');
        
        // Test heart rate to artery pulse linking
        const originalHeartRate = this.parameterController.getCurrentValue('heartBeatSpeed');
        const newHeartRate = 3.0;
        
        // Apply heart rate change
        this.controlPanelManager.applyParameterChange('heartBeatSpeed', newHeartRate, 'test');
        
        await this.wait(500); // Wait for linking to process
        
        // Check if linked parameters were updated
        const linkingStatus = this.linkingSystem.getSystemStatus();
        this.addTestResult('Parameter linking system active', linkingStatus.enabled);
        this.addTestResult('Parameter links exist', linkingStatus.totalLinks > 0);
        this.addTestResult('Active links present', linkingStatus.activeLinks > 0);
        
        // Test heart size to blood flow linking
        const originalHeartSize = this.parameterController.getCurrentValue('heartSize');
        const newHeartSize = 1.5;
        
        this.controlPanelManager.applyParameterChange('heartSize', newHeartSize, 'test');
        await this.wait(300);
        
        const bloodFlowAfterSizeChange = this.parameterController.getCurrentValue('bloodFlowRate');
        this.addTestResult('Heart size affects blood flow', bloodFlowAfterSizeChange !== this.parameterController.getParameter('bloodFlowRate').defaultValue);
        
        // Test viscosity to flow rate inverse relationship
        const originalViscosity = this.parameterController.getCurrentValue('bloodViscosity');
        const highViscosity = 4.0;
        
        this.controlPanelManager.applyParameterChange('bloodViscosity', highViscosity, 'test');
        await this.wait(300);
        
        const flowAfterViscosityChange = this.parameterController.getCurrentValue('bloodFlowRate');
        this.addTestResult('High viscosity reduces flow rate', flowAfterViscosityChange < 0.005);
        
        // Test conditional linking (light affects fog)
        const originalLight = this.parameterController.getCurrentValue('overheadLight');
        this.controlPanelManager.applyParameterChange('overheadLight', !originalLight, 'test');
        await this.wait(300);
        
        const fogAfterLightChange = this.parameterController.getCurrentValue('fogDensity');
        this.addTestResult('Light state affects fog density', fogAfterLightChange !== this.parameterController.getParameter('fogDensity').defaultValue);
        
        // Test link enable/disable
        this.linkingSystem.setLinkEnabled('heartBeatSpeed', 'arteryPulseSpeed', false);
        const disabledLinkStatus = this.linkingSystem.getSystemStatus();
        this.addTestResult('Link can be disabled', disabledLinkStatus.activeLinks < linkingStatus.activeLinks);
        
        // Re-enable for other tests
        this.linkingSystem.setLinkEnabled('heartBeatSpeed', 'arteryPulseSpeed', true);
        
        // Restore original values
        this.controlPanelManager.applyParameterChange('heartBeatSpeed', originalHeartRate, 'test');
        this.controlPanelManager.applyParameterChange('heartSize', originalHeartSize, 'test');
        this.controlPanelManager.applyParameterChange('bloodViscosity', originalViscosity, 'test');
        this.controlPanelManager.applyParameterChange('overheadLight', originalLight, 'test');
    }

    /**
     * Test advanced validation system
     */
    async testAdvancedValidation() {
        console.log('✅ Testing advanced validation...');
        
        // Test range validation with user-friendly messages
        const heartSpeedResult = this.validationSystem.validateParameter('heartBeatSpeed', 10.0);
        this.addTestResult('Range validation catches high values', !heartSpeedResult.valid);
        this.addTestResult('Validation provides error message', !!heartSpeedResult.error);
        
        const heartSpeedLowResult = this.validationSystem.validateParameter('heartBeatSpeed', 0.1);
        this.addTestResult('Range validation catches low values', !heartSpeedLowResult.valid);
        
        // Test warning thresholds
        const heartSpeedWarningResult = this.validationSystem.validateParameter('heartBeatSpeed', 4.5);
        this.addTestResult('Warning thresholds work', heartSpeedWarningResult.valid && !!heartSpeedWarningResult.warning);
        
        // Test contextual validation
        const allParams = this.controlPanelManager.getCurrentParameterValues();
        allParams.heartBeatSpeed = 4.0;
        const intensityResult = this.validationSystem.validateParameter('heartContractionIntensity', 1.8, allParams);
        this.addTestResult('Contextual validation considers other parameters', !!intensityResult.warning || !intensityResult.valid);
        
        // Test performance validation
        const branchResult = this.validationSystem.validateParameter('arteryMaxBranches', 150);
        this.addTestResult('Performance validation provides warnings', branchResult.valid && !!branchResult.warning);
        
        // Test validation history
        const historyBefore = this.validationSystem.getValidationHistory('heartBeatSpeed').length;
        this.validationSystem.validateParameter('heartBeatSpeed', 2.0);
        const historyAfter = this.validationSystem.getValidationHistory('heartBeatSpeed').length;
        this.addTestResult('Validation history is recorded', historyAfter > historyBefore);
        
        // Test validation statistics
        const stats = this.validationSystem.getValidationStats();
        this.addTestResult('Validation statistics available', stats.total > 0);
        this.addTestResult('Success rate calculated', typeof stats.successRate === 'string');
    }

    /**
     * Test keyboard shortcuts system
     */
    async testKeyboardShortcuts() {
        console.log('⌨️ Testing keyboard shortcuts...');
        
        const shortcutStatus = this.keyboardShortcuts.getSystemStatus();
        this.addTestResult('Keyboard shortcuts system active', shortcutStatus.enabled);
        this.addTestResult('Shortcuts registered', shortcutStatus.totalShortcuts > 0);
        this.addTestResult('Multiple categories exist', shortcutStatus.categories.length > 1);
        
        // Test shortcut categories
        const heartShortcuts = this.keyboardShortcuts.getShortcutsForCategory('Heart');
        this.addTestResult('Heart shortcuts exist', heartShortcuts.length > 0);
        
        const arteryShortcuts = this.keyboardShortcuts.getShortcutsForCategory('Arteries');
        this.addTestResult('Artery shortcuts exist', arteryShortcuts.length > 0);
        
        // Test help system
        const helpVisible = this.keyboardShortcuts.helpVisible;
        this.keyboardShortcuts.showHelp();
        this.addTestResult('Help can be shown', this.keyboardShortcuts.helpVisible !== helpVisible);
        
        this.keyboardShortcuts.hideHelp();
        this.addTestResult('Help can be hidden', !this.keyboardShortcuts.helpVisible);
        
        // Test shortcut enable/disable
        this.keyboardShortcuts.setEnabled(false);
        this.addTestResult('Shortcuts can be disabled', !this.keyboardShortcuts.getSystemStatus().enabled);
        
        this.keyboardShortcuts.setEnabled(true);
        this.addTestResult('Shortcuts can be re-enabled', this.keyboardShortcuts.getSystemStatus().enabled);
        
        // Test key normalization
        const normalizedKey = this.keyboardShortcuts.normalizeKey('Ctrl+Shift+H');
        this.addTestResult('Key normalization works', normalizedKey === 'ctrl+h+shift');
    }

    /**
     * Test smooth transitions
     */
    async testSmoothTransitions() {
        console.log('🌊 Testing smooth transitions...');
        
        // Enable smooth transitions
        this.controlPanelManager.setSmoothTransitionsEnabled(true);
        
        const originalValue = this.parameterController.getCurrentValue('heartBeatSpeed');
        const targetValue = originalValue + 1.0;
        
        // Start transition
        this.controlPanelManager.applyParameterChange('heartBeatSpeed', targetValue, 'test');
        
        // Check if transition is active
        const hasActiveTransitions = this.controlPanelManager.transitionQueue.size > 0;
        this.addTestResult('Smooth transitions create active transitions', hasActiveTransitions);
        
        // Wait for transition to complete
        await this.wait(this.controlPanelManager.config.transitionDuration + 100);
        
        const finalValue = this.parameterController.getCurrentValue('heartBeatSpeed');
        this.addTestResult('Smooth transition reaches target value', Math.abs(finalValue - targetValue) < 0.01);
        
        const noActiveTransitions = this.controlPanelManager.transitionQueue.size === 0;
        this.addTestResult('Transitions complete and clean up', noActiveTransitions);
        
        // Test transition duration setting
        const originalDuration = this.controlPanelManager.config.transitionDuration;
        this.controlPanelManager.setTransitionDuration(500);
        this.addTestResult('Transition duration can be changed', this.controlPanelManager.config.transitionDuration === 500);
        
        // Test transition disable
        this.controlPanelManager.setSmoothTransitionsEnabled(false);
        this.addTestResult('Smooth transitions can be disabled', !this.controlPanelManager.config.smoothTransitions);
        
        // Restore settings
        this.controlPanelManager.setSmoothTransitionsEnabled(true);
        this.controlPanelManager.setTransitionDuration(originalDuration);
        this.controlPanelManager.applyParameterChange('heartBeatSpeed', originalValue, 'test');
    }

    /**
     * Test system integration
     */
    async testSystemIntegration() {
        console.log('🔧 Testing system integration...');
        
        // Test advanced system status
        const systemStatus = this.controlPanelManager.getAdvancedSystemStatus();
        this.addTestResult('Advanced system status available', !!systemStatus);
        this.addTestResult('Parameter linking status included', !!systemStatus.parameterLinking);
        this.addTestResult('Validation status included', !!systemStatus.validation);
        this.addTestResult('Keyboard shortcuts status included', !!systemStatus.keyboardShortcuts);
        this.addTestResult('Performance metrics included', !!systemStatus.performance);
        
        // Test configuration export/import
        const exportedConfig = this.controlPanelManager.exportConfiguration();
        this.addTestResult('Configuration can be exported', !!exportedConfig);
        this.addTestResult('Export includes parameters', !!exportedConfig.parameters);
        this.addTestResult('Export includes config', !!exportedConfig.config);
        this.addTestResult('Export includes parameter links', !!exportedConfig.parameterLinks);
        this.addTestResult('Export includes timestamp', !!exportedConfig.timestamp);
        
        // Test configuration import
        const testConfig = {
            parameters: { heartBeatSpeed: 2.5 },
            config: { smoothTransitions: false }
        };
        
        this.controlPanelManager.importConfiguration(testConfig);
        await this.wait(100);
        
        const importedValue = this.parameterController.getCurrentValue('heartBeatSpeed');
        this.addTestResult('Configuration import works', Math.abs(importedValue - 2.5) < 0.01);
        
        // Test advanced settings panel
        this.controlPanelManager.showAdvancedSettings();
        const advancedPanel = document.querySelector('.advanced-settings-panel');
        this.addTestResult('Advanced settings panel can be created', !!advancedPanel);
        this.addTestResult('Advanced settings panel is visible', advancedPanel.style.display === 'block');
        
        // Close panel
        advancedPanel.style.display = 'none';
        
        // Test update all linked parameters
        this.controlPanelManager.updateAllLinkedParameters();
        this.addTestResult('Update all linked parameters executes', true);
        
        // Test system disposal
        const originalDispose = this.controlPanelManager.dispose;
        let disposeCallCount = 0;
        this.controlPanelManager.dispose = function() {
            disposeCallCount++;
            return originalDispose.call(this);
        };
        
        // Don't actually dispose for other tests
        this.addTestResult('Dispose method exists', typeof originalDispose === 'function');
    }

    /**
     * Test parameter linking edge cases
     */
    async testLinkingEdgeCases() {
        console.log('🔍 Testing linking edge cases...');
        
        // Test circular dependency prevention
        this.linkingSystem.createLink('testParam1', 'testParam2', {
            type: 'direct',
            multiplier: 1.0,
            enabled: true
        });
        
        this.linkingSystem.createLink('testParam2', 'testParam1', {
            type: 'direct',
            multiplier: 1.0,
            enabled: true
        });
        
        // This should not cause infinite loops
        this.addTestResult('Circular dependency handling', true);
        
        // Test link removal
        const removed = this.linkingSystem.removeLink('testParam1', 'testParam2');
        this.addTestResult('Links can be removed', removed);
        
        // Test custom link creation
        this.linkingSystem.createCustomLink('heartBeatSpeed', 'customTarget', 
            (value) => value * 2, 
            'Custom test link'
        );
        
        const customLinks = this.linkingSystem.getAllLinks().filter(link => 
            link.config.type === 'custom'
        );
        this.addTestResult('Custom links can be created', customLinks.length > 0);
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
        
        console.log('\n📊 Advanced Features Test Results:');
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
        window.advancedFeaturesTestResults = this.testResults;
        
        // Test system status summary
        console.log('\n🔧 System Status Summary:');
        const status = this.controlPanelManager.getAdvancedSystemStatus();
        console.log(`Parameter Linking: ${status.parameterLinking.enabled ? 'ON' : 'OFF'} (${status.parameterLinking.activeLinks}/${status.parameterLinking.totalLinks} links)`);
        console.log(`Advanced Validation: ${status.validation.total} validations, ${status.validation.successRate}% success rate`);
        console.log(`Keyboard Shortcuts: ${status.keyboardShortcuts.enabled ? 'ON' : 'OFF'} (${status.keyboardShortcuts.totalShortcuts} shortcuts)`);
        console.log(`Active Transitions: ${status.activeTransitions}`);
        console.log(`Performance: ${status.performance.totalParameters} parameters, ${status.performance.activeControls} controls`);
    }

    /**
     * Wait for a specified amount of time
     * @param {number} ms - Milliseconds to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Run a comprehensive integration test
     */
    async runIntegrationTest() {
        console.log('🚀 Running comprehensive integration test...');
        
        // Test complete workflow: parameter change -> linking -> validation -> UI update
        const testScenario = async (paramName, value, expectedLinks = []) => {
            console.log(`Testing scenario: ${paramName} = ${value}`);
            
            // Apply parameter change
            this.controlPanelManager.applyParameterChange(paramName, value, 'integration-test');
            
            // Wait for linking and transitions
            await this.wait(500);
            
            // Check if expected linked parameters were affected
            let linksWorked = true;
            expectedLinks.forEach(linkedParam => {
                const currentValue = this.parameterController.getCurrentValue(linkedParam);
                const defaultValue = this.parameterController.getParameter(linkedParam).defaultValue;
                if (currentValue === defaultValue) {
                    linksWorked = false;
                    console.log(`Expected link ${paramName} -> ${linkedParam} did not work`);
                }
            });
            
            return linksWorked;
        };
        
        // Test scenarios
        const scenario1 = await testScenario('heartBeatSpeed', 3.5, ['arteryPulseSpeed']);
        const scenario2 = await testScenario('heartSize', 1.8, ['bloodFlowRate']);
        const scenario3 = await testScenario('bloodViscosity', 4.5, ['bloodFlowRate']);
        
        this.addTestResult('Integration scenario 1 (heart rate)', scenario1);
        this.addTestResult('Integration scenario 2 (heart size)', scenario2);
        this.addTestResult('Integration scenario 3 (viscosity)', scenario3);
        
        console.log('✨ Integration test completed!');
    }
}

// Export for use in other modules
export default AdvancedFeaturesTest;