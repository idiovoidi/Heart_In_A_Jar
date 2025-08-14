/**
 * Quick System Test to verify the control system works without errors
 */

export class QuickSystemTest {
    constructor() {
        this.testResults = [];
    }

    /**
     * Run a quick test of the system initialization
     */
    async runQuickTest() {
        console.log('🚀 Running Quick System Test...');
        
        try {
            // Test 1: Check if ControlPanelManager exists
            const controlPanel = document.querySelector('.control-panel');
            this.addResult('Control panel UI exists', !!controlPanel);
            
            // Test 2: Check if parameters are defined
            if (window.sceneManager && window.sceneManager.controlPanelManager) {
                const paramController = window.sceneManager.controlPanelManager.parameterController;
                const paramCount = paramController ? paramController.getAllParameters().size : 0;
                this.addResult('Parameters loaded', paramCount >= 16);
                
                // Test 3: Check if error handling is working
                const errorSystem = window.sceneManager.controlPanelManager.errorHandlingSystem;
                this.addResult('Error handling system active', !!errorSystem);
                
                // Test 4: Try a simple parameter change
                if (paramController) {
                    const originalValue = paramController.getCurrentValue('heartBeatSpeed');
                    const testValue = originalValue + 0.1;
                    const success = window.sceneManager.controlPanelManager.applyParameterChange('heartBeatSpeed', testValue, 'quick-test');
                    this.addResult('Parameter change works', success);
                    
                    // Restore original value
                    window.sceneManager.controlPanelManager.applyParameterChange('heartBeatSpeed', originalValue, 'quick-test');
                }
            } else {
                this.addResult('ControlPanelManager not found', false);
            }
            
            this.reportResults();
            
        } catch (error) {
            console.error('❌ Quick test failed:', error);
            this.addResult('System initialization', false);
            this.reportResults();
        }
    }

    /**
     * Add test result
     * @param {string} testName - Test name
     * @param {boolean} passed - Whether test passed
     */
    addResult(testName, passed) {
        this.testResults.push({ name: testName, passed });
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    }

    /**
     * Report test results
     */
    reportResults() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;
        
        console.log('\n📊 Quick Test Results:');
        console.log(`Total: ${total}, Passed: ${passed}, Failed: ${failed}`);
        
        if (failed === 0) {
            console.log('🎉 All tests passed! System is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Check the error messages above.');
        }
    }
}

// Auto-run the test when the page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        const quickTest = new QuickSystemTest();
        quickTest.runQuickTest();
    }, 2000); // Wait 2 seconds for everything to initialize
});

export default QuickSystemTest;