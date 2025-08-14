/**
 * Event system for parameter changes
 * Provides real-time event handling for parameter updates
 */
export class ParameterEventSystem {
    constructor() {
        this.listeners = new Map();
        this.eventQueue = [];
        this.isProcessing = false;
    }

    /**
     * Add event listener for parameter changes
     * @param {string} eventType - Type of event ('change', 'validate', 'apply')
     * @param {string} parameterName - Name of parameter (or '*' for all)
     * @param {Function} callback - Callback function
     */
    addEventListener(eventType, parameterName, callback) {
        const key = `${eventType}:${parameterName}`;
        
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} eventType - Type of event
     * @param {string} parameterName - Name of parameter
     * @param {Function} callback - Callback function to remove
     */
    removeEventListener(eventType, parameterName, callback) {
        const key = `${eventType}:${parameterName}`;
        const listeners = this.listeners.get(key);
        
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event
     * @param {string} eventType - Type of event
     * @param {string} parameterName - Name of parameter
     * @param {Object} eventData - Event data
     */
    emit(eventType, parameterName, eventData) {
        const event = {
            type: eventType,
            parameter: parameterName,
            data: eventData,
            timestamp: performance.now()
        };

        // Add to queue for processing
        this.eventQueue.push(event);
        
        // Process immediately if not already processing
        if (!this.isProcessing) {
            this.processEventQueue();
        }
    }

    /**
     * Process the event queue
     */
    async processEventQueue() {
        this.isProcessing = true;

        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            await this.processEvent(event);
        }

        this.isProcessing = false;
    }

    /**
     * Process a single event
     * @param {Object} event - Event to process
     */
    async processEvent(event) {
        const { type, parameter, data } = event;
        
        // Get specific listeners
        const specificKey = `${type}:${parameter}`;
        const specificListeners = this.listeners.get(specificKey) || [];
        
        // Get wildcard listeners
        const wildcardKey = `${type}:*`;
        const wildcardListeners = this.listeners.get(wildcardKey) || [];
        
        // Combine all listeners
        const allListeners = [...specificListeners, ...wildcardListeners];
        
        // Execute all listeners
        for (const listener of allListeners) {
            try {
                await listener(event);
            } catch (error) {
                console.error(`Error in event listener for ${type}:${parameter}:`, error);
            }
        }
    }

    /**
     * Create a parameter change event
     * @param {string} parameterName - Name of parameter
     * @param {any} oldValue - Previous value
     * @param {any} newValue - New value
     * @param {string} source - Source of change (e.g., 'ui', 'preset', 'api')
     */
    emitParameterChange(parameterName, oldValue, newValue, source = 'unknown') {
        this.emit('change', parameterName, {
            oldValue,
            newValue,
            source,
            parameter: parameterName
        });
    }

    /**
     * Create a parameter validation event
     * @param {string} parameterName - Name of parameter
     * @param {any} value - Value being validated
     * @param {boolean} isValid - Validation result
     * @param {string} error - Error message if invalid
     */
    emitParameterValidation(parameterName, value, isValid, error = null) {
        this.emit('validate', parameterName, {
            value,
            isValid,
            error,
            parameter: parameterName
        });
    }

    /**
     * Create a parameter application event
     * @param {string} parameterName - Name of parameter
     * @param {any} value - Value being applied
     * @param {boolean} success - Application result
     * @param {string} error - Error message if failed
     */
    emitParameterApplication(parameterName, value, success, error = null) {
        this.emit('apply', parameterName, {
            value,
            success,
            error,
            parameter: parameterName
        });
    }

    /**
     * Create a batch parameter change event
     * @param {Object} changes - Object with parameter names as keys and new values as values
     * @param {string} source - Source of changes
     */
    emitBatchParameterChange(changes, source = 'batch') {
        this.emit('batchChange', '*', {
            changes,
            source,
            count: Object.keys(changes).length
        });
    }

    /**
     * Get event statistics
     * @returns {Object} Event statistics
     */
    getEventStats() {
        const stats = {
            totalListeners: 0,
            listenersByType: {},
            queueLength: this.eventQueue.length,
            isProcessing: this.isProcessing
        };

        this.listeners.forEach((listeners, key) => {
            const [type] = key.split(':');
            stats.totalListeners += listeners.length;
            
            if (!stats.listenersByType[type]) {
                stats.listenersByType[type] = 0;
            }
            stats.listenersByType[type] += listeners.length;
        });

        return stats;
    }

    /**
     * Clear all event listeners
     */
    clearAllListeners() {
        this.listeners.clear();
    }

    /**
     * Clear event queue
     */
    clearEventQueue() {
        this.eventQueue.length = 0;
    }

    /**
     * Dispose of the event system
     */
    dispose() {
        this.clearAllListeners();
        this.clearEventQueue();
        this.isProcessing = false;
    }
}