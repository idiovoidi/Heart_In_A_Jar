/**
 * Advanced Keyboard Shortcut System
 * Provides comprehensive keyboard shortcuts for common actions and parameter adjustments
 */

export class KeyboardShortcutSystem {
    constructor(controlPanelManager, parameterController, eventSystem) {
        this.controlPanelManager = controlPanelManager;
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        this.shortcuts = new Map();
        this.enabled = true;
        this.helpVisible = false;
        
        this.initializeShortcuts();
        this.setupEventListeners();
        this.createHelpOverlay();
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeShortcuts() {
        // Panel control shortcuts
        this.addShortcut('ctrl+h', {
            action: 'togglePanel',
            description: 'Toggle control panel visibility',
            category: 'Panel',
            handler: () => this.controlPanelManager.togglePanelVisibility()
        });

        this.addShortcut('ctrl+shift+r', {
            action: 'resetAll',
            description: 'Reset all parameters to defaults',
            category: 'Panel',
            handler: () => this.controlPanelManager.resetAllParameters()
        });

        this.addShortcut('f1', {
            action: 'showHelp',
            description: 'Show keyboard shortcuts help',
            category: 'Help',
            handler: () => this.toggleHelp()
        });

        // Heart control shortcuts
        this.addShortcut('space', {
            action: 'toggleHeartBeating',
            description: 'Toggle heart beating on/off',
            category: 'Heart',
            handler: () => this.toggleParameter('heartBeating')
        });

        this.addShortcut('h', {
            action: 'heartSpeedUp',
            description: 'Increase heart beat speed',
            category: 'Heart',
            handler: () => this.adjustParameter('heartBeatSpeed', 0.1)
        });

        this.addShortcut('shift+h', {
            action: 'heartSpeedDown',
            description: 'Decrease heart beat speed',
            category: 'Heart',
            handler: () => this.adjustParameter('heartBeatSpeed', -0.1)
        });

        this.addShortcut('ctrl+h', {
            action: 'resetHeart',
            description: 'Reset heart parameters',
            category: 'Heart',
            handler: () => this.resetParameterGroup(['heartBeating', 'heartBeatSpeed', 'heartSize', 'heartContractionIntensity'])
        });

        // Artery control shortcuts
        this.addShortcut('a', {
            action: 'toggleArteryGrowth',
            description: 'Toggle artery growth on/off',
            category: 'Arteries',
            handler: () => this.toggleParameter('arteryGrowth')
        });

        this.addShortcut('ctrl+a', {
            action: 'resetArteries',
            description: 'Reset and restart artery growth',
            category: 'Arteries',
            handler: () => this.controlPanelManager.resetArteries()
        });

        this.addShortcut('shift+a', {
            action: 'forceGrowth',
            description: 'Force restart artery growth',
            category: 'Arteries',
            handler: () => this.controlPanelManager.forceGrowthRestart()
        });

        // Blood flow shortcuts
        this.addShortcut('b', {
            action: 'toggleBloodFlow',
            description: 'Toggle blood flow on/off',
            category: 'Blood',
            handler: () => this.toggleParameter('bloodFlow')
        });

        this.addShortcut('d', {
            action: 'drainBlood',
            description: 'Drain all blood from jar',
            category: 'Blood',
            handler: () => this.controlPanelManager.drainBlood()
        });

        this.addShortcut('shift+b', {
            action: 'increaseBloodFlow',
            description: 'Increase blood flow rate',
            category: 'Blood',
            handler: () => this.adjustParameter('bloodFlowRate', 0.0001)
        });

        this.addShortcut('ctrl+b', {
            action: 'decreaseBloodFlow',
            description: 'Decrease blood flow rate',
            category: 'Blood',
            handler: () => this.adjustParameter('bloodFlowRate', -0.0001)
        });

        // Environment shortcuts
        this.addShortcut('l', {
            action: 'toggleLight',
            description: 'Toggle overhead light',
            category: 'Environment',
            handler: () => this.toggleParameter('overheadLight')
        });

        this.addShortcut('f', {
            action: 'increaseFog',
            description: 'Increase fog density',
            category: 'Environment',
            handler: () => this.adjustParameter('fogDensity', 0.01)
        });

        this.addShortcut('shift+f', {
            action: 'decreaseFog',
            description: 'Decrease fog density',
            category: 'Environment',
            handler: () => this.adjustParameter('fogDensity', -0.01)
        });

        this.addShortcut('p', {
            action: 'togglePostProcessing',
            description: 'Toggle post-processing effects',
            category: 'Environment',
            handler: () => this.toggleParameter('postProcessing')
        });

        // Camera shortcuts
        this.addShortcut('r', {
            action: 'resetView',
            description: 'Reset camera to default position',
            category: 'Camera',
            handler: () => this.controlPanelManager.resetView()
        });

        this.addShortcut('ctrl+plus', {
            action: 'increaseSensitivity',
            description: 'Increase camera sensitivity',
            category: 'Camera',
            handler: () => this.adjustParameter('cameraSensitivity', 0.1)
        });

        this.addShortcut('ctrl+minus', {
            action: 'decreaseSensitivity',
            description: 'Decrease camera sensitivity',
            category: 'Camera',
            handler: () => this.adjustParameter('cameraSensitivity', -0.1)
        });

        // Quick preset shortcuts
        this.addShortcut('1', {
            action: 'preset1',
            description: 'Apply Healthy Heart preset',
            category: 'Presets',
            handler: () => this.applyPreset('healthy-heart')
        });

        this.addShortcut('2', {
            action: 'preset2',
            description: 'Apply Rapid Growth preset',
            category: 'Presets',
            handler: () => this.applyPreset('rapid-growth')
        });

        this.addShortcut('3', {
            action: 'preset3',
            description: 'Apply Laboratory Demo preset',
            category: 'Presets',
            handler: () => this.applyPreset('laboratory-demo')
        });

        // Advanced shortcuts
        this.addShortcut('ctrl+shift+d', {
            action: 'debugMode',
            description: 'Toggle debug information display',
            category: 'Debug',
            handler: () => this.toggleDebugMode()
        });

        this.addShortcut('ctrl+shift+p', {
            action: 'performanceMode',
            description: 'Toggle performance optimization mode',
            category: 'Debug',
            handler: () => this.togglePerformanceMode()
        });

        this.addShortcut('escape', {
            action: 'cancelAction',
            description: 'Cancel current action or close help',
            category: 'General',
            handler: () => this.handleEscape()
        });
    }

    /**
     * Add a keyboard shortcut
     * @param {string} key - Key combination
     * @param {Object} config - Shortcut configuration
     */
    addShortcut(key, config) {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.set(normalizedKey, {
            ...config,
            key: normalizedKey,
            originalKey: key
        });
    }

    /**
     * Normalize key combination for consistent matching
     * @param {string} key - Key combination
     * @returns {string} Normalized key
     */
    normalizeKey(key) {
        return key.toLowerCase()
            .replace(/\s+/g, '')
            .replace('cmd', 'ctrl') // Normalize Mac cmd to ctrl
            .split('+')
            .sort()
            .join('+');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.enabled) {
                this.handleKeyDown(e);
            }
        });

        // Listen for focus changes to enable/disable shortcuts appropriately
        document.addEventListener('focusin', (e) => {
            this.handleFocusChange(e.target);
        });

        document.addEventListener('focusout', (e) => {
            this.handleFocusChange(null);
        });
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // Don't handle shortcuts when typing in inputs
        if (this.isTypingContext(e.target)) {
            return;
        }

        const keyCombo = this.getKeyCombo(e);
        const shortcut = this.shortcuts.get(keyCombo);

        if (shortcut) {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                shortcut.handler();
                this.logShortcutUsage(shortcut);
                
                // Show brief feedback
                this.showShortcutFeedback(shortcut);
                
            } catch (error) {
                console.error(`Error executing shortcut ${keyCombo}:`, error);
                this.showShortcutError(shortcut, error);
            }
        }
    }

    /**
     * Check if the current context is for typing
     * @param {Element} target - Event target
     * @returns {boolean} Whether user is typing
     */
    isTypingContext(target) {
        if (!target) return false;
        
        const tagName = target.tagName.toLowerCase();
        const inputTypes = ['input', 'textarea', 'select'];
        const contentEditable = target.contentEditable === 'true';
        
        return inputTypes.includes(tagName) || contentEditable;
    }

    /**
     * Get key combination from keyboard event
     * @param {KeyboardEvent} e - Keyboard event
     * @returns {string} Key combination
     */
    getKeyCombo(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        let key = e.key.toLowerCase();
        
        // Handle special keys
        switch (key) {
            case ' ':
                key = 'space';
                break;
            case '+':
                key = 'plus';
                break;
            case '-':
                key = 'minus';
                break;
            case 'arrowup':
                key = 'up';
                break;
            case 'arrowdown':
                key = 'down';
                break;
            case 'arrowleft':
                key = 'left';
                break;
            case 'arrowright':
                key = 'right';
                break;
        }
        
        parts.push(key);
        
        return parts.sort().join('+');
    }

    /**
     * Handle focus changes to manage shortcut context
     * @param {Element} target - Focused element
     */
    handleFocusChange(target) {
        // Could implement context-sensitive shortcuts here
        // For now, just log for debugging
        if (target && this.isTypingContext(target)) {
            console.log('Shortcuts disabled: typing context');
        }
    }

    /**
     * Toggle a boolean parameter
     * @param {string} paramName - Parameter name
     */
    toggleParameter(paramName) {
        const currentValue = this.parameterController.getCurrentValue(paramName);
        const newValue = !currentValue;
        
        this.controlPanelManager.applyParameterChange(paramName, newValue, 'keyboard');
    }

    /**
     * Adjust a numeric parameter by a delta
     * @param {string} paramName - Parameter name
     * @param {number} delta - Amount to adjust
     */
    adjustParameter(paramName, delta) {
        const currentValue = this.parameterController.getCurrentValue(paramName);
        const param = this.parameterController.getParameter(paramName);
        
        if (!param) return;
        
        let newValue = currentValue + delta;
        
        // Constrain to parameter limits
        if (param.min !== undefined) {
            newValue = Math.max(param.min, newValue);
        }
        if (param.max !== undefined) {
            newValue = Math.min(param.max, newValue);
        }
        
        // Round to step if specified
        if (param.step) {
            newValue = Math.round(newValue / param.step) * param.step;
        }
        
        this.controlPanelManager.applyParameterChange(paramName, newValue, 'keyboard');
    }

    /**
     * Reset a group of parameters
     * @param {Array} paramNames - Parameter names to reset
     */
    resetParameterGroup(paramNames) {
        paramNames.forEach(paramName => {
            this.parameterController.resetParameter(paramName);
        });
        
        this.controlPanelManager.showGlobalFeedback(
            `Reset ${paramNames.length} parameters`, 
            'success'
        );
    }

    /**
     * Apply a preset by name
     * @param {string} presetName - Preset name
     */
    applyPreset(presetName) {
        if (this.controlPanelManager.presetManager) {
            const success = this.controlPanelManager.presetManager.applyPreset(presetName);
            if (success) {
                this.controlPanelManager.showGlobalFeedback(
                    `Applied ${presetName} preset`, 
                    'success'
                );
            } else {
                this.controlPanelManager.showGlobalFeedback(
                    `Preset ${presetName} not found`, 
                    'error'
                );
            }
        }
    }

    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        // This would toggle debug information display
        const debugPanel = document.querySelector('.debug-panel');
        if (debugPanel) {
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        }
        
        this.controlPanelManager.showGlobalFeedback('Debug mode toggled', 'info');
    }

    /**
     * Toggle performance mode
     */
    togglePerformanceMode() {
        // This would toggle performance optimizations
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            controlPanel.classList.toggle('high-performance');
        }
        
        this.controlPanelManager.showGlobalFeedback('Performance mode toggled', 'info');
    }

    /**
     * Handle escape key
     */
    handleEscape() {
        if (this.helpVisible) {
            this.hideHelp();
        } else {
            // Cancel any active operations
            this.controlPanelManager.showGlobalFeedback('Action cancelled', 'info');
        }
    }

    /**
     * Show shortcut feedback
     * @param {Object} shortcut - Shortcut that was executed
     */
    showShortcutFeedback(shortcut) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'shortcut-feedback';
        feedback.textContent = shortcut.description;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(96, 165, 250, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
            pointer-events: none;
            animation: shortcutFeedbackSlide 2s ease-out forwards;
        `;
        
        // Add animation styles if not already present
        if (!document.querySelector('#shortcut-feedback-styles')) {
            const styles = document.createElement('style');
            styles.id = 'shortcut-feedback-styles';
            styles.textContent = `
                @keyframes shortcutFeedbackSlide {
                    0% {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    10%, 90% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    /**
     * Show shortcut error
     * @param {Object} shortcut - Shortcut that failed
     * @param {Error} error - Error that occurred
     */
    showShortcutError(shortcut, error) {
        this.controlPanelManager.showGlobalFeedback(
            `Shortcut error: ${shortcut.description}`, 
            'error'
        );
    }

    /**
     * Log shortcut usage for analytics
     * @param {Object} shortcut - Shortcut that was used
     */
    logShortcutUsage(shortcut) {
        // Could implement usage analytics here
        console.log(`Shortcut used: ${shortcut.key} (${shortcut.description})`);
    }

    /**
     * Create help overlay
     */
    createHelpOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'keyboard-shortcuts-help';
        overlay.className = 'shortcuts-help-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        const content = document.createElement('div');
        content.className = 'shortcuts-help-content';
        content.style.cssText = `
            background: rgba(15, 15, 20, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            padding: 24px;
            font-family: 'Segoe UI', sans-serif;
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Close on click outside or escape
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.hideHelp();
            }
        });
    }

    /**
     * Toggle help overlay
     */
    toggleHelp() {
        if (this.helpVisible) {
            this.hideHelp();
        } else {
            this.showHelp();
        }
    }

    /**
     * Show help overlay
     */
    showHelp() {
        const overlay = document.getElementById('keyboard-shortcuts-help');
        const content = overlay.querySelector('.shortcuts-help-content');
        
        // Generate help content
        content.innerHTML = this.generateHelpContent();
        
        overlay.style.display = 'flex';
        this.helpVisible = true;
        
        // Focus management
        overlay.focus();
    }

    /**
     * Hide help overlay
     */
    hideHelp() {
        const overlay = document.getElementById('keyboard-shortcuts-help');
        overlay.style.display = 'none';
        this.helpVisible = false;
    }

    /**
     * Generate help content HTML
     * @returns {string} Help content HTML
     */
    generateHelpContent() {
        const categories = this.groupShortcutsByCategory();
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #60a5fa;">Keyboard Shortcuts</h2>
                <button onclick="document.getElementById('keyboard-shortcuts-help').style.display='none'" 
                        style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); 
                               color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    Close (Esc)
                </button>
            </div>
        `;
        
        Object.entries(categories).forEach(([category, shortcuts]) => {
            html += `
                <div style="margin-bottom: 24px;">
                    <h3 style="color: #fbbf24; margin-bottom: 12px; font-size: 16px;">${category}</h3>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px;">
            `;
            
            shortcuts.forEach(shortcut => {
                html += `
                    <div style="display: contents;">
                        <div style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; 
                                    font-family: monospace; font-size: 12px; text-align: center;">
                            ${this.formatKeyForDisplay(shortcut.originalKey)}
                        </div>
                        <div style="padding: 4px 8px; font-size: 13px; color: rgba(255,255,255,0.9);">
                            ${shortcut.description}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); 
                        font-size: 12px; color: rgba(255,255,255,0.6); text-align: center;">
                Press F1 to toggle this help • Press Esc to close
            </div>
        `;
        
        return html;
    }

    /**
     * Group shortcuts by category
     * @returns {Object} Shortcuts grouped by category
     */
    groupShortcutsByCategory() {
        const categories = {};
        
        this.shortcuts.forEach(shortcut => {
            const category = shortcut.category || 'General';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(shortcut);
        });
        
        // Sort categories and shortcuts within categories
        const sortedCategories = {};
        const categoryOrder = ['General', 'Panel', 'Heart', 'Arteries', 'Blood', 'Environment', 'Camera', 'Presets', 'Debug', 'Help'];
        
        categoryOrder.forEach(category => {
            if (categories[category]) {
                sortedCategories[category] = categories[category].sort((a, b) => 
                    a.description.localeCompare(b.description)
                );
            }
        });
        
        // Add any remaining categories
        Object.keys(categories).forEach(category => {
            if (!sortedCategories[category]) {
                sortedCategories[category] = categories[category];
            }
        });
        
        return sortedCategories;
    }

    /**
     * Format key combination for display
     * @param {string} key - Key combination
     * @returns {string} Formatted key
     */
    formatKeyForDisplay(key) {
        return key
            .replace(/ctrl/gi, '⌃')
            .replace(/shift/gi, '⇧')
            .replace(/alt/gi, '⌥')
            .replace(/cmd/gi, '⌘')
            .replace(/space/gi, 'Space')
            .replace(/plus/gi, '+')
            .replace(/minus/gi, '-')
            .replace(/\+/g, ' + ')
            .toUpperCase();
    }

    /**
     * Enable or disable keyboard shortcuts
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`Keyboard shortcuts ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get all shortcuts for a category
     * @param {string} category - Category name
     * @returns {Array} Shortcuts in category
     */
    getShortcutsForCategory(category) {
        return Array.from(this.shortcuts.values()).filter(
            shortcut => shortcut.category === category
        );
    }

    /**
     * Remove a shortcut
     * @param {string} key - Key combination to remove
     */
    removeShortcut(key) {
        const normalizedKey = this.normalizeKey(key);
        return this.shortcuts.delete(normalizedKey);
    }

    /**
     * Get system status
     * @returns {Object} System status
     */
    getSystemStatus() {
        return {
            enabled: this.enabled,
            totalShortcuts: this.shortcuts.size,
            helpVisible: this.helpVisible,
            categories: Object.keys(this.groupShortcutsByCategory()),
            shortcuts: Array.from(this.shortcuts.entries()).map(([key, shortcut]) => ({
                key,
                description: shortcut.description,
                category: shortcut.category
            }))
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Remove help overlay
        const overlay = document.getElementById('keyboard-shortcuts-help');
        if (overlay) {
            overlay.remove();
        }
        
        // Remove styles
        const styles = document.getElementById('shortcut-feedback-styles');
        if (styles) {
            styles.remove();
        }
        
        this.shortcuts.clear();
        this.enabled = false;
        
        console.log('Keyboard shortcut system disposed');
    }
}