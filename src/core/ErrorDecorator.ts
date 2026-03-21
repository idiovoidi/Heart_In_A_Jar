/**
 * Custom error types for the application
 */
export class SimulationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SimulationError';
    }
}

export class RenderError extends SimulationError {
    constructor(message: string) {
        super(message);
        this.name = 'RenderError';
    }
}

export class ResourceError extends SimulationError {
    constructor(message: string) {
        super(message);
        this.name = 'ResourceError';
    }
}

export class PhysicsError extends SimulationError {
    constructor(message: string) {
        super(message);
        this.name = 'PhysicsError';
    }
}

export interface ErrorHandlerOptions {
    fallback?: unknown;
}

/**
 * Error handling utility
 * Provides functions for standardized error handling
 */
export class ErrorDecorator {
    /**
     * Wraps a function with error handling
     * @param fn - The function to wrap
     * @param context - The context for error reporting
     * @param options - Options for error handling
     * @returns Wrapped function with error handling
     */
    static wrapWithErrorHandler<T extends (...args: unknown[]) => unknown>(
        fn: T,
        context: string,
        options: ErrorHandlerOptions = {}
    ): (...args: Parameters<T>) => ReturnType<T> | undefined {
        return function(...args: Parameters<T>): ReturnType<T> | undefined {
            try {
                return fn(...args) as ReturnType<T>;
            } catch (error) {
                // Get a clean stack trace
                console.error(`Error in ${context}:`, (error as Error).message);
                console.error((error as Error).stack);

                // Log error to application monitoring
                ErrorDecorator.logError(error as Error, context);

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
                    return options.fallback as ReturnType<T>;
                }
                return undefined;
            }
        };
    }

    /**
     * Legacy decorator function - not used in this version but kept for reference
     * @param options - Options for error handling
     * @returns Method decorator
     */
    static logAndHandle(options: ErrorHandlerOptions = {}): (
        target: unknown,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) => PropertyDescriptor {
        console.warn("Decorator syntax is not supported in this environment. Use wrapWithErrorHandler instead.");
        return function(target: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
            return descriptor;
        };
    }

    /**
     * Logs error to console and potentially to a remote service
     * @param error - The error to log
     * @param context - The context where the error occurred
     */
    static logError(error: Error, context: string): void {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] Error in ${context}: ${error.message}`;

        console.error(message);

        // Here we could send errors to a remote logging service
        // For now, just store in localStorage for demo purposes
        try {
            const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]') as Array<{
                timestamp: string;
                context: string;
                message: string;
                stack: string | undefined;
            }>;
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
