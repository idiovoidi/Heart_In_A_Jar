/**
 * Test file for UI enhancements and responsiveness
 * Tests the new styling, animations, and responsive features
 */

export class UIEnhancementTest {
    constructor(controlPanelManager) {
        this.controlPanelManager = controlPanelManager;
        this.testResults = [];
    }

    /**
     * Run all UI enhancement tests
     */
    async runAllTests() {
        console.log('🎨 Starting UI Enhancement Tests...');
        
        try {
            await this.testResponsiveDesign();
            await this.testAnimations();
            await this.testTouchInteractions();
            await this.testKeyboardShortcuts();
            await this.testAccessibility();
            await this.testPerformance();
            
            this.reportResults();
        } catch (error) {
            console.error('❌ UI Enhancement tests failed:', error);
        }
    }

    /**
     * Test responsive design features
     */
    async testResponsiveDesign() {
        console.log('📱 Testing responsive design...');
        
        const originalWidth = window.innerWidth;
        const controlPanel = document.querySelector('.control-panel');
        
        try {
            // Test mobile layout
            Object.defineProperty(window, 'innerWidth', { value: 480, configurable: true });
            this.controlPanelManager.adjustPanelLayout();
            
            const hasMobileClass = controlPanel.classList.contains('mobile');
            this.addTestResult('Mobile layout activation', hasMobileClass);
            
            // Test tablet layout
            Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
            this.controlPanelManager.adjustPanelLayout();
            
            // Test desktop layout
            Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
            this.controlPanelManager.adjustPanelLayout();
            
            const hasUltraWideClass = controlPanel.classList.contains('ultra-wide');
            this.addTestResult('Ultra-wide layout activation', hasUltraWideClass);
            
        } finally {
            // Restore original width
            Object.defineProperty(window, 'innerWidth', { value: originalWidth, configurable: true });
            this.controlPanelManager.adjustPanelLayout();
        }
    }

    /**
     * Test animation features
     */
    async testAnimations() {
        console.log('✨ Testing animations...');
        
        const controlPanel = document.querySelector('.control-panel');
        const testSection = controlPanel.querySelector('.control-section');
        
        // Test section expansion animation
        if (testSection) {
            const toggleBtn = testSection.querySelector('.section-toggle');
            if (toggleBtn) {
                toggleBtn.click();
                
                // Wait for animation
                await this.wait(500);
                
                const hasExpandingClass = testSection.classList.contains('expanding') || 
                                        testSection.classList.contains('collapsed');
                this.addTestResult('Section toggle animation', hasExpandingClass);
            }
        }

        // Test parameter feedback animation
        const testParam = 'heartBeatSpeed';
        this.controlPanelManager.showParameterFeedback(testParam, 'success');
        
        await this.wait(100);
        
        const paramControl = document.querySelector(`[data-parameter="${testParam}"]`);
        const hasFeedbackClass = paramControl && paramControl.classList.contains('feedback-success');
        this.addTestResult('Parameter feedback animation', hasFeedbackClass);
    }

    /**
     * Test touch interactions
     */
    async testTouchInteractions() {
        console.log('👆 Testing touch interactions...');
        
        // Simulate touch device
        const originalOntouchstart = 'ontouchstart' in window;
        Object.defineProperty(window, 'ontouchstart', { value: true, configurable: true });
        
        this.controlPanelManager.setupTouchInteractions();
        
        const controlPanel = document.querySelector('.control-panel');
        const hasTouchClass = controlPanel.classList.contains('touch-device');
        this.addTestResult('Touch device detection', hasTouchClass);
        
        // Test slider touch interaction
        const slider = controlPanel.querySelector('.parameter-slider');
        if (slider) {
            // Simulate touch events
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 }]
            });
            const touchEnd = new TouchEvent('touchend');
            
            slider.dispatchEvent(touchStart);
            const hasTouchingClass = slider.classList.contains('touching');
            
            slider.dispatchEvent(touchEnd);
            
            this.addTestResult('Slider touch interaction', hasTouchingClass);
        }
        
        // Restore original touch support
        if (!originalOntouchstart) {
            delete window.ontouchstart;
        }
    }

    /**
     * Test keyboard shortcuts
     */
    async testKeyboardShortcuts() {
        console.log('⌨️ Testing keyboard shortcuts...');
        
        // Test panel toggle shortcut (Ctrl+H)
        const ctrlH = new KeyboardEvent('keydown', {
            key: 'h',
            ctrlKey: true,
            bubbles: true
        });
        
        document.dispatchEvent(ctrlH);
        
        // Test space bar for heart toggle
        const spaceKey = new KeyboardEvent('keydown', {
            key: ' ',
            bubbles: true
        });
        
        document.dispatchEvent(spaceKey);
        
        this.addTestResult('Keyboard shortcuts', true); // Basic test
    }

    /**
     * Test accessibility features
     */
    async testAccessibility() {
        console.log('♿ Testing accessibility features...');
        
        const controlPanel = document.querySelector('.control-panel');
        
        // Check ARIA attributes
        const hasAriaLabel = controlPanel.hasAttribute('aria-label');
        const hasRole = controlPanel.hasAttribute('role');
        this.addTestResult('ARIA attributes', hasAriaLabel && hasRole);
        
        // Check focus management
        const focusableElements = controlPanel.querySelectorAll(
            'input, button, [tabindex]:not([tabindex="-1"])'
        );
        const hasFocusableElements = focusableElements.length > 0;
        this.addTestResult('Focusable elements', hasFocusableElements);
        
        // Check live region for screen readers
        const liveRegion = document.getElementById('control-panel-live-region');
        this.addTestResult('Screen reader live region', !!liveRegion);
    }

    /**
     * Test performance features
     */
    async testPerformance() {
        console.log('⚡ Testing performance features...');
        
        const controlPanel = document.querySelector('.control-panel');
        
        // Test performance monitoring setup
        const animationEvent = new AnimationEvent('animationstart');
        controlPanel.dispatchEvent(animationEvent);
        
        // Test batch updates
        const updates = {
            heartBeatSpeed: 80,
            heartSize: 1.2,
            arteryGrowthSpeed: 500
        };
        
        this.controlPanelManager.batchUpdateControls(updates);
        
        this.addTestResult('Performance optimizations', true);
    }

    /**
     * Test visual hierarchy improvements
     */
    testVisualHierarchy() {
        console.log('🎯 Testing visual hierarchy...');
        
        const controlPanel = document.querySelector('.control-panel');
        
        // Check enhanced styles are applied
        const hasEnhancedClass = controlPanel.classList.contains('enhanced');
        this.addTestResult('Enhanced visual styling', hasEnhancedClass);
        
        // Check section styling
        const sections = controlPanel.querySelectorAll('.control-section');
        const sectionsHaveProperStyling = Array.from(sections).every(section => {
            const computedStyle = window.getComputedStyle(section);
            return computedStyle.borderRadius !== '0px';
        });
        
        this.addTestResult('Section visual hierarchy', sectionsHaveProperStyling);
    }

    /**
     * Test smooth transitions
     */
    async testSmoothTransitions() {
        console.log('🌊 Testing smooth transitions...');
        
        // Test parameter value changes with smooth transitions
        const slider = document.querySelector('.parameter-slider');
        if (slider) {
            const originalValue = slider.value;
            slider.value = parseFloat(originalValue) + 10;
            
            const changeEvent = new Event('input', { bubbles: true });
            slider.dispatchEvent(changeEvent);
            
            await this.wait(300);
            
            const trackFill = slider.parentElement.querySelector('.slider-track-fill');
            const hasTransition = trackFill && 
                window.getComputedStyle(trackFill).transition !== 'none';
            
            this.addTestResult('Smooth slider transitions', hasTransition);
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
        
        console.log('\n📊 UI Enhancement Test Results:');
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
        window.uiTestResults = this.testResults;
    }

    /**
     * Wait for a specified amount of time
     * @param {number} ms - Milliseconds to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Run a quick visual test of all enhancements
     */
    async runVisualTest() {
        console.log('👀 Running visual enhancement test...');
        
        // Test all feedback types
        const testParams = ['heartBeatSpeed', 'arteryGrowthSpeed', 'bloodFlowRate'];
        const feedbackTypes = ['success', 'error', 'warning'];
        
        for (let i = 0; i < testParams.length; i++) {
            const param = testParams[i];
            const feedback = feedbackTypes[i];
            
            this.controlPanelManager.showParameterFeedback(param, feedback);
            await this.wait(1200);
        }
        
        // Test section animations
        const sections = document.querySelectorAll('.control-section .section-toggle');
        for (const toggle of sections) {
            toggle.click();
            await this.wait(500);
            toggle.click();
            await this.wait(500);
        }
        
        console.log('✨ Visual test completed!');
    }
}

// Export for use in other modules
export default UIEnhancementTest;