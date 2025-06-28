/**
 * Custom error types for the application
 */
export class SimulationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SimulationError';
    }
}

export class RenderError extends SimulationError {
    constructor(message) {
        super(message);
        this.name = 'RenderError';
    }
}

export class ResourceError extends SimulationError {
    constructor(message) {
        super(message);
        this.name = 'ResourceError';
    }
}

export class PhysicsError extends SimulationError {
    constructor(message) {
        super(message);
        this.name = 'PhysicsError';
    }
}

/**
 * Error handling utility
 * Provides functions for standardized error handling
 */
export class ErrorDecorator {
    /**
     * Wraps a function with error handling
     * @param {Function} fn - The function to wrap
     * @param {string} context - The context for error reporting
     * @param {Object} options - Options for error handling
     * @returns {Function} - Wrapped function with error handling
     */
    static wrapWithErrorHandler(fn, context, options = {}) {
        return function(...args) {
            try {
                return fn.apply(this, args);
            } catch (error) {
                // Get a clean stack trace
                console.error(`Error in ${context}:`, error.message);
                console.error(error.stack);
                
                // Log error to application monitoring
                ErrorDecorator.logError(error, context);
                
                // Handle error based on type
                if (error instanceof RenderError) {
                    console.warn(`Render error in ${context}. Attempting recovery...`);
                } else if (error instanceof ResourceError) {
                    console.warn(`Resource error in ${context}. Check resource availability.`);
                } else if (error instanceof PhysicsError) {
                    console.warn(`Physics error in ${context}. Simulation may be unstable.`);
                }
                
                // Return fallback value if provided
                if (options.fallback !== undefined) {
                    return options.fallback;
                }
            }
        };
    }
    
    /**
     * Legacy decorator function - not used in this version but kept for reference
     * @param {Object} options - Options for error handling
     * @returns {Function} - Method decorator
     */
    static logAndHandle(options = {}) {
        console.warn("Decorator syntax is not supported in this environment. Use wrapWithErrorHandler instead.");
        return function(target, propertyKey, descriptor) {
            return descriptor;
        };
    }
    
    /**
     * Logs error to console and potentially to a remote service
     * @param {Error} error - The error to log
     * @param {string} context - The context where the error occurred
     */
    static logError(error, context) {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] Error in ${context}: ${error.message}`;
        
        console.error(message);
        
        // Here we could send errors to a remote logging service
        // For now, just store in localStorage for demo purposes
        try {
            const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errorLog.push({
                timestamp,
                context,
                message: error.message,
                stack: error.stack
            });
            localStorage.setItem('errorLog', JSON.stringify(errorLog.slice(-20))); // Keep last 20 errors
        } catch (e) {
            console.error('Failed to store error in localStorage:', e);
        }
    }
} 