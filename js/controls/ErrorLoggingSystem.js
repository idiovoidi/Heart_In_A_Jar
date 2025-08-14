/**
 * Comprehensive Error Logging System
 * Provides detailed error logging, categorization, and debugging information
 */

export class ErrorLoggingSystem {
    constructor() {
        this.logs = [];
        this.maxLogSize = 1000;
        this.logLevels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            CRITICAL: 4
        };
        this.currentLogLevel = this.logLevels.INFO;
        this.logCategories = new Set();
        this.logFilters = new Map();
        this.logListeners = new Map();
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        
        this.initializeLogging();
    }

    /**
     * Initialize logging system
     */
    initializeLogging() {
        // Setup console integration
        this.setupConsoleIntegration();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup browser-specific logging
        this.setupBrowserLogging();
    }

    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Setup console integration
     */
    setupConsoleIntegration() {
        // Store original console methods
        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
            info: console.info
        };

        // Override console methods to capture logs
        console.log = (...args) => {
            this.log('INFO', 'console', this.formatConsoleMessage(args));
            this.originalConsole.log(...args);
        };

        console.warn = (...args) => {
            this.log('WARN', 'console', this.formatConsoleMessage(args));
            this.originalConsole.warn(...args);
        };

        console.error = (...args) => {
            this.log('ERROR', 'console', this.formatConsoleMessage(args));
            this.originalConsole.error(...args);
        };

        console.debug = (...args) => {
            this.log('DEBUG', 'console', this.formatConsoleMessage(args));
            this.originalConsole.debug(...args);
        };

        console.info = (...args) => {
            this.log('INFO', 'console', this.formatConsoleMessage(args));
            this.originalConsole.info(...args);
        };
    }

    /**
     * Format console message
     * @param {Array} args - Console arguments
     * @returns {string} Formatted message
     */
    formatConsoleMessage(args) {
        return args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (error) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor performance entries
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (entry.duration > 100) { // Log slow operations
                            this.log('WARN', 'performance', `Slow operation: ${entry.name} took ${entry.duration.toFixed(2)}ms`, {
                                entryType: entry.entryType,
                                startTime: entry.startTime,
                                duration: entry.duration
                            });
                        }
                    });
                });

                observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
            } catch (error) {
                this.log('WARN', 'logging', 'Performance monitoring not available', { error: error.message });
            }
        }

        // Monitor memory usage
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
                const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

                if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
                    this.log('WARN', 'memory', `High memory usage: ${usedMB}MB / ${limitMB}MB`, {
                        used: memory.usedJSHeapSize,
                        total: memory.totalJSHeapSize,
                        limit: memory.jsHeapSizeLimit
                    });
                }
            }, 30000); // Check every 30 seconds
        }
    }

    /**
     * Setup browser-specific logging
     */
    setupBrowserLogging() {
        // Log browser information
        this.log('INFO', 'browser', 'Browser information', {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });

        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.log('INFO', 'network', 'Connection restored');
        });

        window.addEventListener('offline', () => {
            this.log('WARN', 'network', 'Connection lost');
        });

        // Monitor visibility changes
        document.addEventListener('visibilitychange', () => {
            this.log('INFO', 'visibility', `Page ${document.hidden ? 'hidden' : 'visible'}`);
        });
    }

    /**
     * Log a message
     * @param {string} level - Log level
     * @param {string} category - Log category
     * @param {string} message - Log message
     * @param {Object} metadata - Additional metadata
     * @param {Error} error - Error object (optional)
     */
    log(level, category, message, metadata = {}, error = null) {
        const levelValue = this.logLevels[level] || this.logLevels.INFO;
        
        // Check if we should log this level
        if (levelValue < this.currentLogLevel) {
            return;
        }

        // Check category filters
        if (this.logFilters.has(category) && !this.logFilters.get(category)) {
            return;
        }

        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            level: level,
            category: category,
            message: message,
            metadata: metadata,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : null,
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionTime: Date.now() - this.startTime
        };

        // Add to logs
        this.logs.push(logEntry);
        this.logCategories.add(category);

        // Limit log size
        if (this.logs.length > this.maxLogSize) {
            this.logs.shift();
        }

        // Trigger listeners
        this.triggerLogListeners(logEntry);

        // Store in browser storage for persistence
        this.persistLog(logEntry);
    }

    /**
     * Generate unique log ID
     * @returns {string} Log ID
     */
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Trigger log listeners
     * @param {Object} logEntry - Log entry
     */
    triggerLogListeners(logEntry) {
        const categoryListeners = this.logListeners.get(logEntry.category) || [];
        const globalListeners = this.logListeners.get('*') || [];
        
        [...categoryListeners, ...globalListeners].forEach(listener => {
            try {
                listener(logEntry);
            } catch (error) {
                // Use original console to avoid infinite loop
                this.originalConsole.error('Error in log listener:', error);
            }
        });
    }

    /**
     * Persist log to browser storage
     * @param {Object} logEntry - Log entry
     */
    persistLog(logEntry) {
        try {
            // Only persist important logs to avoid storage bloat
            if (this.logLevels[logEntry.level] >= this.logLevels.WARN) {
                const storageKey = `heartSim_logs_${this.sessionId}`;
                const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                existingLogs.push(logEntry);
                
                // Limit stored logs
                if (existingLogs.length > 100) {
                    existingLogs.shift();
                }
                
                localStorage.setItem(storageKey, JSON.stringify(existingLogs));
            }
        } catch (error) {
            // Storage might be full or unavailable
            this.originalConsole.warn('Failed to persist log:', error);
        }
    }

    /**
     * Set log level
     * @param {string} level - Log level
     */
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLogLevel = this.logLevels[level];
            this.log('INFO', 'logging', `Log level set to ${level}`);
        }
    }

    /**
     * Add log listener
     * @param {string} category - Category to listen for ('*' for all)
     * @param {Function} listener - Listener function
     */
    addLogListener(category, listener) {
        if (!this.logListeners.has(category)) {
            this.logListeners.set(category, []);
        }
        this.logListeners.get(category).push(listener);
    }

    /**
     * Remove log listener
     * @param {string} category - Category
     * @param {Function} listener - Listener function
     */
    removeLogListener(category, listener) {
        const listeners = this.logListeners.get(category);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Set category filter
     * @param {string} category - Category name
     * @param {boolean} enabled - Whether to log this category
     */
    setCategoryFilter(category, enabled) {
        this.logFilters.set(category, enabled);
        this.log('INFO', 'logging', `Category filter ${category}: ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Get logs by criteria
     * @param {Object} criteria - Search criteria
     * @returns {Array} Matching logs
     */
    getLogs(criteria = {}) {
        let filteredLogs = [...this.logs];

        // Filter by level
        if (criteria.level) {
            const levelValue = this.logLevels[criteria.level];
            filteredLogs = filteredLogs.filter(log => this.logLevels[log.level] >= levelValue);
        }

        // Filter by category
        if (criteria.category) {
            filteredLogs = filteredLogs.filter(log => log.category === criteria.category);
        }

        // Filter by time range
        if (criteria.since) {
            const sinceTime = new Date(criteria.since).getTime();
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= sinceTime);
        }

        if (criteria.until) {
            const untilTime = new Date(criteria.until).getTime();
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= untilTime);
        }

        // Filter by message content
        if (criteria.message) {
            const searchTerm = criteria.message.toLowerCase();
            filteredLogs = filteredLogs.filter(log => 
                log.message.toLowerCase().includes(searchTerm)
            );
        }

        // Limit results
        if (criteria.limit) {
            filteredLogs = filteredLogs.slice(-criteria.limit);
        }

        return filteredLogs;
    }

    /**
     * Get log statistics
     * @returns {Object} Log statistics
     */
    getLogStatistics() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byCategory: {},
            sessionDuration: Date.now() - this.startTime,
            sessionId: this.sessionId,
            errorRate: 0,
            warningRate: 0
        };

        // Count by level
        Object.keys(this.logLevels).forEach(level => {
            stats.byLevel[level] = this.logs.filter(log => log.level === level).length;
        });

        // Count by category
        this.logCategories.forEach(category => {
            stats.byCategory[category] = this.logs.filter(log => log.category === category).length;
        });

        // Calculate rates (per minute)
        const sessionMinutes = stats.sessionDuration / 60000;
        if (sessionMinutes > 0) {
            stats.errorRate = (stats.byLevel.ERROR + stats.byLevel.CRITICAL) / sessionMinutes;
            stats.warningRate = stats.byLevel.WARN / sessionMinutes;
        }

        return stats;
    }

    /**
     * Export logs
     * @param {Object} options - Export options
     * @returns {Object} Exported logs
     */
    exportLogs(options = {}) {
        const criteria = {
            level: options.level || 'DEBUG',
            since: options.since,
            until: options.until,
            category: options.category,
            limit: options.limit
        };

        const logs = this.getLogs(criteria);
        
        return {
            exportTime: new Date().toISOString(),
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            criteria: criteria,
            statistics: this.getLogStatistics(),
            logs: logs,
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                url: window.location.href
            }
        };
    }

    /**
     * Download logs as JSON file
     * @param {Object} options - Export options
     */
    downloadLogs(options = {}) {
        const exportData = this.exportLogs(options);
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `heart-sim-logs-${this.sessionId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('INFO', 'logging', 'Logs downloaded', { filename: a.download });
    }

    /**
     * Clear logs
     * @param {Object} criteria - Clear criteria (optional)
     */
    clearLogs(criteria = {}) {
        if (Object.keys(criteria).length === 0) {
            // Clear all logs
            const clearedCount = this.logs.length;
            this.logs = [];
            this.log('INFO', 'logging', `Cleared ${clearedCount} logs`);
        } else {
            // Clear logs matching criteria
            const originalCount = this.logs.length;
            const logsToKeep = this.logs.filter(log => !this.matchesCriteria(log, criteria));
            this.logs = logsToKeep;
            const clearedCount = originalCount - this.logs.length;
            this.log('INFO', 'logging', `Cleared ${clearedCount} logs matching criteria`);
        }
    }

    /**
     * Check if log matches criteria
     * @param {Object} log - Log entry
     * @param {Object} criteria - Criteria to match
     * @returns {boolean} Whether log matches
     */
    matchesCriteria(log, criteria) {
        if (criteria.level && this.logLevels[log.level] < this.logLevels[criteria.level]) {
            return false;
        }
        
        if (criteria.category && log.category !== criteria.category) {
            return false;
        }
        
        if (criteria.since && new Date(log.timestamp).getTime() < new Date(criteria.since).getTime()) {
            return false;
        }
        
        if (criteria.until && new Date(log.timestamp).getTime() > new Date(criteria.until).getTime()) {
            return false;
        }
        
        return true;
    }

    /**
     * Create debug report
     * @returns {Object} Debug report
     */
    createDebugReport() {
        const recentErrors = this.getLogs({ level: 'ERROR', limit: 10 });
        const recentWarnings = this.getLogs({ level: 'WARN', limit: 10 });
        const stats = this.getLogStatistics();
        
        return {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            statistics: stats,
            recentErrors: recentErrors,
            recentWarnings: recentWarnings,
            categories: Array.from(this.logCategories),
            logLevel: Object.keys(this.logLevels).find(key => this.logLevels[key] === this.currentLogLevel),
            browserInfo: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                url: window.location.href,
                memory: window.performance && window.performance.memory ? {
                    used: window.performance.memory.usedJSHeapSize,
                    total: window.performance.memory.totalJSHeapSize,
                    limit: window.performance.memory.jsHeapSizeLimit
                } : null
            }
        };
    }

    /**
     * Restore console methods
     */
    restoreConsole() {
        Object.assign(console, this.originalConsole);
        this.log('INFO', 'logging', 'Console methods restored');
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Restore original console methods
        this.restoreConsole();
        
        // Clear listeners
        this.logListeners.clear();
        this.logFilters.clear();
        this.logCategories.clear();
        
        // Clear logs
        this.logs = [];
        
        this.originalConsole.log('Error logging system disposed');
    }
}