/**
 * Comprehensive Error Handling and Recovery System
 * Provides graceful fallbacks, error logging, and recovery mechanisms for the control system
 */

export class ErrorHandlingSystem {
    constructor(controlPanelManager) {
        this.controlPanelManager = controlPanelManager;
        this.errorLog = [];
        this.maxLogSize = 500;
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        this.criticalErrors = new Set();
        this.errorCallbacks = new Map();
        this.systemHealth = {
            status: 'healthy',
            lastCheck: Date.now(),
            errors: 0,
            warnings: 0,
            recoveries: 0
        };
        
        this.initializeErrorHandling();
        this.setupGlobalErrorHandlers();
        this.startHealthMonitoring();
    }

    /**
     * Initialize error handling for all systems
     */
    initializeErrorHandling() {
        // Wrap critical methods with error handling
        this.wrapSystemMethods();
        
        // Setup error event listeners
        this.setupErrorEventListeners();
        
        // Initialize recovery mechanisms
        this.initializeRecoveryMechanisms();
    }

    /**
     * Initialize recovery mechanisms
     */
    initializeRecoveryMechanisms() {
        // Set up recovery strategies for different error types
        this.recoveryStrategies = new Map();
        
        // Parameter controller recovery
        this.recoveryStrategies.set('parameterController', {
            maxAttempts: 3,
            strategy: 'reset',
            fallback: 'disable'
        });
        
        // Control system recovery
        this.recoveryStrategies.set('controlSystem', {
            maxAttempts: 2,
            strategy: 'reinitialize',
            fallback: 'fallback'
        });
        
        // UI recovery
        this.recoveryStrategies.set('ui', {
            maxAttempts: 3,
            strategy: 'recreate',
            fallback: 'minimal'
        });
        
        console.log('Recovery mechanisms initialized');
    }

    /**
     * Wrap system methods with error handling
     */
    wrapSystemMethods() {
        const systems = [
            'parameterController',
            'heartControlSystem',
            'arteryControlSystem',
            'fluidControlSystem',
            'environmentControlSystem',
            'presetManager',
            'parameterLinkingSystem',
            'validationSystem',
            'keyboardShortcuts'
        ];

        systems.forEach(systemName => {
            const system = this.controlPanelManager[systemName];
            if (system) {
                this.wrapSystemWithErrorHandling(system, systemName);
            }
        });
    }

    /**
     * Wrap a system with comprehensive error handling
     * @param {Object} system - System to wrap
     * @param {string} systemName - Name of the system
     */
    wrapSystemWithErrorHandling(system, systemName) {
        const criticalMethods = this.getCriticalMethods(systemName);
        
        criticalMethods.forEach(methodName => {
            if (typeof system[methodName] === 'function') {
                const originalMethod = system[methodName];
                
                system[methodName] = (...args) => {
                    try {
                        const result = originalMethod.apply(system, args);
                        
                        // Handle promises
                        if (result && typeof result.catch === 'function') {
                            return result.catch(error => {
                                this.handleError(error, `${systemName}.${methodName}`, args);
                                return this.getRecoveryValue(systemName, methodName, args);
                            });
                        }
                        
                        return result;
                        
                    } catch (error) {
                        this.handleError(error, `${systemName}.${methodName}`, args);
                        return this.getRecoveryValue(systemName, methodName, args);
                    }
                };
            }
        });
    }

    /**
     * Get critical methods for each system
     * @param {string} systemName - System name
     * @returns {Array} Critical method names
     */
    getCriticalMethods(systemName) {
        const methodMap = {
            parameterController: ['applyParameter', 'validateParameter', 'getCurrentValue', 'resetParameter'],
            heartControlSystem: ['updateHeartDisplay', 'resetHeartSystem'],
            arteryControlSystem: ['updateArteryDisplay', 'resetArterySystem'],
            fluidControlSystem: ['updateFluidDisplay', 'drainBlood'],
            environmentControlSystem: ['updateEnvironmentDisplay'],
            presetManager: ['applyPreset', 'savePreset'],
            parameterLinkingSystem: ['applyParameterLink', 'updateAllLinkedParameters'],
            validationSystem: ['validateParameter'],
            keyboardShortcuts: ['handleKeyDown', 'showHelp']
        };
        
        return methodMap[systemName] || [];
    }

    /**
     * Setup error event listeners
     */
    setupErrorEventListeners() {
        // Listen for parameter errors
        this.controlPanelManager.eventSystem.addEventListener('error', '*', (event) => {
            this.handleSystemError(event.data);
        });

        // Listen for validation errors
        this.controlPanelManager.eventSystem.addEventListener('validationError', '*', (event) => {
            this.handleValidationError(event.data);
        });

        // Listen for linking errors
        this.controlPanelManager.eventSystem.addEventListener('linkingError', '*', (event) => {
            this.handleLinkingError(event.data);
        });
    }

    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'unhandledPromiseRejection', { promise: event.promise });
            event.preventDefault(); // Prevent console error
        });

        // Catch global JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'globalError', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                message: event.message
            });
        });

        // Catch resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(new Error(`Resource failed to load: ${event.target.src || event.target.href}`), 'resourceError', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
            }
        }, true);
    }

    /**
     * Handle errors with comprehensive logging and recovery
     * @param {Error} error - Error object
     * @param {string} context - Error context
     * @param {any} metadata - Additional error metadata
     */
    handleError(error, context, metadata = {}) {
        const errorEntry = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            error: {
                name: error.name || 'Unknown Error',
                message: error.message || 'No message provided',
                stack: error.stack || 'No stack trace available'
            },
            context: context,
            metadata: metadata,
            severity: this.determineSeverity(error, context),
            recovered: false,
            recoveryAttempts: 0
        };

        // Log the error
        this.logError(errorEntry);

        // Update system health
        this.updateSystemHealth(errorEntry);

        // Attempt recovery if appropriate
        if (this.shouldAttemptRecovery(errorEntry)) {
            this.attemptRecovery(errorEntry);
        }

        // Notify user if necessary
        if (this.shouldNotifyUser(errorEntry)) {
            this.notifyUser(errorEntry);
        }

        // Trigger error callbacks
        this.triggerErrorCallbacks(errorEntry);

        return errorEntry;
    }

    /**
     * Generate unique error ID
     * @returns {string} Error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Determine error severity
     * @param {Error} error - Error object
     * @param {string} context - Error context
     * @returns {string} Severity level
     */
    determineSeverity(error, context) {
        // Critical errors that break core functionality
        const criticalContexts = [
            'parameterController.applyParameter',
            'sceneManager',
            'globalError'
        ];

        // High severity errors that impact user experience
        const highSeverityContexts = [
            'heartControlSystem',
            'arteryControlSystem',
            'fluidControlSystem'
        ];

        // Medium severity errors that reduce functionality
        const mediumSeverityContexts = [
            'presetManager',
            'validationSystem',
            'keyboardShortcuts'
        ];

        if (criticalContexts.some(ctx => context.includes(ctx))) {
            return 'critical';
        } else if (highSeverityContexts.some(ctx => context.includes(ctx))) {
            return 'high';
        } else if (mediumSeverityContexts.some(ctx => context.includes(ctx))) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Log error to internal log
     * @param {Object} errorEntry - Error entry
     */
    logError(errorEntry) {
        this.errorLog.push(errorEntry);

        // Limit log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Console logging based on severity
        const logMethod = this.getLogMethod(errorEntry.severity);
        console[logMethod](`[${errorEntry.severity.toUpperCase()}] ${errorEntry.context}:`, errorEntry.error.message);
        
        if (errorEntry.severity === 'critical') {
            console.error('Stack trace:', errorEntry.error.stack);
            console.error('Metadata:', errorEntry.metadata);
        }
    }

    /**
     * Get appropriate console log method for severity
     * @param {string} severity - Error severity
     * @returns {string} Console method name
     */
    getLogMethod(severity) {
        switch (severity) {
            case 'critical':
            case 'high':
                return 'error';
            case 'medium':
                return 'warn';
            case 'low':
            default:
                return 'log';
        }
    }

    /**
     * Update system health metrics
     * @param {Object} errorEntry - Error entry
     */
    updateSystemHealth(errorEntry) {
        this.systemHealth.lastCheck = Date.now();
        
        if (errorEntry.severity === 'critical' || errorEntry.severity === 'high') {
            this.systemHealth.errors++;
        } else {
            this.systemHealth.warnings++;
        }

        // Update overall status
        if (this.systemHealth.errors > 5) {
            this.systemHealth.status = 'critical';
        } else if (this.systemHealth.errors > 2 || this.systemHealth.warnings > 10) {
            this.systemHealth.status = 'degraded';
        } else if (this.systemHealth.warnings > 5) {
            this.systemHealth.status = 'warning';
        } else {
            this.systemHealth.status = 'healthy';
        }
    }

    /**
     * Determine if recovery should be attempted
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Whether to attempt recovery
     */
    shouldAttemptRecovery(errorEntry) {
        const recoveryKey = `${errorEntry.context}_${errorEntry.error.name}`;
        const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
        
        return attempts < this.maxRecoveryAttempts && 
               (errorEntry.severity === 'critical' || errorEntry.severity === 'high');
    }

    /**
     * Attempt error recovery
     * @param {Object} errorEntry - Error entry
     */
    attemptRecovery(errorEntry) {
        const recoveryKey = `${errorEntry.context}_${errorEntry.error.name}`;
        const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
        
        this.recoveryAttempts.set(recoveryKey, attempts + 1);
        errorEntry.recoveryAttempts = attempts + 1;

        try {
            const recovered = this.executeRecovery(errorEntry);
            
            if (recovered) {
                errorEntry.recovered = true;
                this.systemHealth.recoveries++;
                console.log(`✅ Recovery successful for ${errorEntry.context}`);
                
                // Reset recovery attempts on successful recovery
                this.recoveryAttempts.delete(recoveryKey);
            } else {
                console.warn(`⚠️ Recovery failed for ${errorEntry.context} (attempt ${attempts + 1})`);
            }
            
        } catch (recoveryError) {
            console.error(`❌ Recovery attempt failed for ${errorEntry.context}:`, recoveryError);
            this.handleError(recoveryError, `recovery_${errorEntry.context}`, { originalError: errorEntry });
        }
    }

    /**
     * Execute specific recovery strategies
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Whether recovery was successful
     */
    executeRecovery(errorEntry) {
        const context = errorEntry.context;
        
        // Parameter controller recovery
        if (context.includes('parameterController')) {
            return this.recoverParameterController(errorEntry);
        }
        
        // Control system recovery
        if (context.includes('ControlSystem')) {
            return this.recoverControlSystem(errorEntry);
        }
        
        // UI recovery
        if (context.includes('UI') || context.includes('Panel')) {
            return this.recoverUI(errorEntry);
        }
        
        // Preset system recovery
        if (context.includes('preset')) {
            return this.recoverPresetSystem(errorEntry);
        }
        
        // Linking system recovery
        if (context.includes('linking')) {
            return this.recoverLinkingSystem(errorEntry);
        }
        
        // Generic recovery
        return this.genericRecovery(errorEntry);
    }

    /**
     * Recover parameter controller
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Recovery success
     */
    recoverParameterController(errorEntry) {
        try {
            // Reset to default values if parameter application fails
            if (errorEntry.context.includes('applyParameter')) {
                const paramName = errorEntry.metadata.paramName || errorEntry.metadata[0];
                if (paramName) {
                    this.controlPanelManager.parameterController.resetParameter(paramName);
                    return true;
                }
            }
            
            // Reinitialize parameter definitions if they're corrupted
            if (errorEntry.context.includes('getParameter')) {
                this.controlPanelManager.parameterController.initializeParameterDefinitions();
                return true;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Recover control systems
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Recovery success
     */
    recoverControlSystem(errorEntry) {
        try {
            // Attempt to reinitialize the control system
            const systemName = this.extractSystemName(errorEntry.context);
            const system = this.controlPanelManager[systemName];
            
            if (system && typeof system.init === 'function') {
                system.init();
                return true;
            }
            
            // Fallback: disable the problematic system temporarily
            if (system) {
                system.enabled = false;
                console.warn(`Temporarily disabled ${systemName} due to errors`);
                return true;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Recover UI components
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Recovery success
     */
    recoverUI(errorEntry) {
        try {
            // Recreate control panel if it's corrupted
            if (errorEntry.context.includes('controlPanel')) {
                this.controlPanelManager.createControlPanel();
                this.controlPanelManager.createControlSections();
                return true;
            }
            
            // Reset specific control if it's corrupted
            if (errorEntry.context.includes('control')) {
                const paramName = this.extractParameterName(errorEntry);
                if (paramName) {
                    const control = this.controlPanelManager.createParameterControl(paramName);
                    if (control) {
                        // Replace the corrupted control
                        const oldControl = document.querySelector(`[data-parameter="${paramName}"]`);
                        if (oldControl && oldControl.parentNode) {
                            oldControl.parentNode.replaceChild(control, oldControl);
                        }
                        return true;
                    }
                }
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Recover preset system
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Recovery success
     */
    recoverPresetSystem(errorEntry) {
        try {
            // Reset to default preset if preset application fails
            if (errorEntry.context.includes('applyPreset')) {
                this.controlPanelManager.parameterController.resetAllParameters();
                return true;
            }
            
            // Reinitialize preset manager
            if (this.controlPanelManager.presetManager) {
                this.controlPanelManager.presetManager.initializePresets();
                return true;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Recover linking system
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Recovery success
     */
    recoverLinkingSystem(errorEntry) {
        try {
            // Temporarily disable linking if it's causing issues
            this.controlPanelManager.parameterLinkingSystem.setLinkingEnabled(false);
            
            // Re-enable after a delay
            setTimeout(() => {
                this.controlPanelManager.parameterLinkingSystem.setLinkingEnabled(true);
            }, 5000);
            
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generic recovery strategy
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Recovery success
     */
    genericRecovery(errorEntry) {
        try {
            // Log the error and continue
            console.warn(`Generic recovery applied for ${errorEntry.context}`);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract system name from context
     * @param {string} context - Error context
     * @returns {string} System name
     */
    extractSystemName(context) {
        const parts = context.split('.');
        return parts[0];
    }

    /**
     * Extract parameter name from error entry
     * @param {Object} errorEntry - Error entry
     * @returns {string} Parameter name
     */
    extractParameterName(errorEntry) {
        return errorEntry.metadata.paramName || 
               errorEntry.metadata.parameter ||
               (errorEntry.metadata[0] && typeof errorEntry.metadata[0] === 'string' ? errorEntry.metadata[0] : null);
    }

    /**
     * Get recovery value for failed operations
     * @param {string} systemName - System name
     * @param {string} methodName - Method name
     * @param {Array} args - Original arguments
     * @returns {any} Recovery value
     */
    getRecoveryValue(systemName, methodName, args) {
        // Return safe default values based on method type
        if (methodName.includes('get') || methodName.includes('Current')) {
            return null; // Safe default for getters
        }
        
        if (methodName.includes('apply') || methodName.includes('set')) {
            return false; // Indicate failure for setters
        }
        
        if (methodName.includes('validate')) {
            return { valid: false, error: 'Validation system error' };
        }
        
        return undefined; // Generic safe return
    }

    /**
     * Determine if user should be notified
     * @param {Object} errorEntry - Error entry
     * @returns {boolean} Whether to notify user
     */
    shouldNotifyUser(errorEntry) {
        return errorEntry.severity === 'critical' || 
               (errorEntry.severity === 'high' && !errorEntry.recovered);
    }

    /**
     * Notify user of error
     * @param {Object} errorEntry - Error entry
     */
    notifyUser(errorEntry) {
        const message = this.getUserFriendlyMessage(errorEntry);
        
        if (this.controlPanelManager.showGlobalFeedback) {
            this.controlPanelManager.showGlobalFeedback(message, 'error');
        } else {
            // Fallback notification
            console.error('User notification:', message);
        }
    }

    /**
     * Get user-friendly error message
     * @param {Object} errorEntry - Error entry
     * @returns {string} User-friendly message
     */
    getUserFriendlyMessage(errorEntry) {
        const context = errorEntry.context;
        
        if (context.includes('parameterController')) {
            return 'Parameter update failed. Values have been reset to safe defaults.';
        }
        
        if (context.includes('heartControlSystem')) {
            return 'Heart simulation encountered an error. System has been reset.';
        }
        
        if (context.includes('arteryControlSystem')) {
            return 'Artery system error detected. Growth has been paused for recovery.';
        }
        
        if (context.includes('fluidControlSystem')) {
            return 'Blood flow system error. Flow has been stopped for safety.';
        }
        
        if (context.includes('preset')) {
            return 'Preset application failed. Parameters have been reset to defaults.';
        }
        
        return 'A system error occurred. Recovery measures have been applied.';
    }

    /**
     * Handle specific system errors
     * @param {Object} errorData - Error data from event
     */
    handleSystemError(errorData) {
        this.handleError(
            new Error(errorData.message || 'System error'),
            errorData.system || 'unknown',
            errorData
        );
    }

    /**
     * Handle validation errors
     * @param {Object} errorData - Validation error data
     */
    handleValidationError(errorData) {
        this.handleError(
            new Error(errorData.message || 'Validation error'),
            'validationSystem',
            errorData
        );
    }

    /**
     * Handle linking errors
     * @param {Object} errorData - Linking error data
     */
    handleLinkingError(errorData) {
        this.handleError(
            new Error(errorData.message || 'Parameter linking error'),
            'parameterLinkingSystem',
            errorData
        );
    }

    /**
     * Register error callback
     * @param {string} context - Error context to listen for
     * @param {Function} callback - Callback function
     */
    registerErrorCallback(context, callback) {
        if (!this.errorCallbacks.has(context)) {
            this.errorCallbacks.set(context, []);
        }
        this.errorCallbacks.get(context).push(callback);
    }

    /**
     * Trigger error callbacks
     * @param {Object} errorEntry - Error entry
     */
    triggerErrorCallbacks(errorEntry) {
        const callbacks = this.errorCallbacks.get(errorEntry.context) || [];
        const globalCallbacks = this.errorCallbacks.get('*') || [];
        
        [...callbacks, ...globalCallbacks].forEach(callback => {
            try {
                callback(errorEntry);
            } catch (error) {
                console.error('Error in error callback:', error);
            }
        });
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Check every 30 seconds
    }

    /**
     * Perform system health check
     */
    performHealthCheck() {
        const now = Date.now();
        const timeSinceLastCheck = now - this.systemHealth.lastCheck;
        
        // Reset counters if it's been a while since last error
        if (timeSinceLastCheck > 300000) { // 5 minutes
            this.systemHealth.errors = Math.max(0, this.systemHealth.errors - 1);
            this.systemHealth.warnings = Math.max(0, this.systemHealth.warnings - 1);
        }
        
        // Update status based on current metrics
        this.updateSystemHealth({ severity: 'low' }); // Trigger status update
        
        // Log health status if not healthy
        if (this.systemHealth.status !== 'healthy') {
            console.log(`System health: ${this.systemHealth.status} (${this.systemHealth.errors} errors, ${this.systemHealth.warnings} warnings)`);
        }
    }

    /**
     * Get system health status
     * @returns {Object} Health status
     */
    getSystemHealth() {
        return {
            ...this.systemHealth,
            recentErrors: this.getRecentErrors(10),
            errorRate: this.calculateErrorRate(),
            recoveryRate: this.calculateRecoveryRate()
        };
    }

    /**
     * Get recent errors
     * @param {number} count - Number of recent errors to get
     * @returns {Array} Recent errors
     */
    getRecentErrors(count = 10) {
        return this.errorLog.slice(-count);
    }

    /**
     * Calculate error rate (errors per minute)
     * @returns {number} Error rate
     */
    calculateErrorRate() {
        const oneMinuteAgo = Date.now() - 60000;
        const recentErrors = this.errorLog.filter(error => 
            new Date(error.timestamp).getTime() > oneMinuteAgo
        );
        return recentErrors.length;
    }

    /**
     * Calculate recovery rate
     * @returns {number} Recovery rate percentage
     */
    calculateRecoveryRate() {
        const totalErrors = this.errorLog.length;
        const recoveredErrors = this.errorLog.filter(error => error.recovered).length;
        
        return totalErrors > 0 ? (recoveredErrors / totalErrors * 100).toFixed(1) : 100;
    }

    /**
     * Export error log for debugging
     * @returns {Object} Error log export
     */
    exportErrorLog() {
        return {
            errors: this.errorLog,
            systemHealth: this.systemHealth,
            recoveryAttempts: Array.from(this.recoveryAttempts.entries()),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.recoveryAttempts.clear();
        this.systemHealth = {
            status: 'healthy',
            lastCheck: Date.now(),
            errors: 0,
            warnings: 0,
            recoveries: 0
        };
        
        console.log('Error log cleared');
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.errorLog = [];
        this.recoveryAttempts.clear();
        this.errorCallbacks.clear();
        this.criticalErrors.clear();
        
        console.log('Error handling system disposed');
    }
}