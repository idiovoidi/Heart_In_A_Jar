/**
 * Advanced Parameter Validation System
 * Provides comprehensive validation with user-friendly error messages and recovery suggestions
 */

export class AdvancedValidationSystem {
    constructor(parameterController, eventSystem) {
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        this.validationRules = new Map();
        this.validationHistory = [];
        this.maxHistorySize = 100;
        
        this.initializeValidationRules();
        this.setupEventListeners();
    }

    /**
     * Initialize comprehensive validation rules
     */
    initializeValidationRules() {
        // Heart parameter validations
        this.addValidationRule('heartBeatSpeed', {
            type: 'range',
            min: 0.5,
            max: 5.0,
            errorMessages: {
                tooLow: 'Heart beat speed too slow. Minimum is 0.5x for realistic simulation.',
                tooHigh: 'Heart beat speed too fast. Maximum is 5.0x to prevent visual artifacts.',
                invalid: 'Heart beat speed must be a number between 0.5x and 5.0x.'
            },
            warnings: {
                veryLow: { threshold: 0.8, message: 'Very slow heart rate may appear unrealistic.' },
                veryHigh: { threshold: 4.0, message: 'Very fast heart rate may cause visual strain.' }
            },
            suggestions: {
                normal: 'Try 1.0x - 2.0x for realistic heart rates.',
                performance: 'Lower values improve performance on slower devices.'
            }
        });

        this.addValidationRule('heartSize', {
            type: 'range',
            min: 0.3,
            max: 2.0,
            errorMessages: {
                tooLow: 'Heart too small. Minimum size is 0.3x for visibility.',
                tooHigh: 'Heart too large. Maximum size is 2.0x to fit in the jar.',
                invalid: 'Heart size must be a number between 0.3x and 2.0x.'
            },
            warnings: {
                verySmall: { threshold: 0.4, message: 'Very small heart may be hard to see.' },
                veryLarge: { threshold: 1.5, message: 'Large heart may crowd the jar.' }
            },
            contextualValidation: (value, allParams) => {
                const bloodLevel = allParams.bloodLevel || 0.8;
                if (value > 1.0 && bloodLevel > 0.7) {
                    return {
                        valid: true,
                        warning: 'Large heart with high blood level may cause overflow effects.'
                    };
                }
                return { valid: true };
            }
        });

        this.addValidationRule('heartContractionIntensity', {
            type: 'range',
            min: 0.1,
            max: 2.0,
            errorMessages: {
                tooLow: 'Contraction too weak. Minimum is 0.1x for visible effect.',
                tooHigh: 'Contraction too intense. Maximum is 2.0x to prevent distortion.',
                invalid: 'Contraction intensity must be between 0.1x and 2.0x.'
            },
            dependencies: ['heartBeatSpeed'],
            contextualValidation: (value, allParams) => {
                const beatSpeed = allParams.heartBeatSpeed || 2.0;
                if (value > 1.5 && beatSpeed > 3.0) {
                    return {
                        valid: false,
                        error: 'High contraction intensity with fast beat speed may cause visual artifacts.'
                    };
                }
                return { valid: true };
            }
        });

        // Artery parameter validations
        this.addValidationRule('arteryGrowthSpeed', {
            type: 'range',
            min: 25,
            max: 500,
            errorMessages: {
                tooLow: 'Growth too fast. Minimum delay is 25ms for system stability.',
                tooHigh: 'Growth too slow. Maximum delay is 500ms for reasonable wait times.',
                invalid: 'Growth speed must be between 25ms and 500ms.'
            },
            warnings: {
                veryFast: { threshold: 50, message: 'Very fast growth may impact performance.' },
                verySlow: { threshold: 300, message: 'Slow growth may feel unresponsive.' }
            },
            performanceValidation: (value) => {
                if (value < 50) {
                    return {
                        valid: true,
                        warning: 'Fast growth may reduce frame rate on slower devices.',
                        suggestion: 'Consider 50ms or higher for better performance.'
                    };
                }
                return { valid: true };
            }
        });

        this.addValidationRule('arteryMaxBranches', {
            type: 'range',
            min: 10,
            max: 200,
            errorMessages: {
                tooLow: 'Too few branches. Minimum is 10 for realistic artery system.',
                tooHigh: 'Too many branches. Maximum is 200 for performance reasons.',
                invalid: 'Branch count must be between 10 and 200.'
            },
            performanceValidation: (value) => {
                if (value > 100) {
                    return {
                        valid: true,
                        warning: 'High branch count may impact performance.',
                        suggestion: 'Try 50-80 branches for optimal balance.'
                    };
                }
                return { valid: true };
            },
            dependencies: ['arteryGrowthSpeed'],
            contextualValidation: (value, allParams) => {
                const growthSpeed = allParams.arteryGrowthSpeed || 50;
                const estimatedTime = (value * growthSpeed) / 1000; // seconds
                if (estimatedTime > 30) {
                    return {
                        valid: true,
                        warning: `With current growth speed, full growth will take ~${estimatedTime.toFixed(1)} seconds.`
                    };
                }
                return { valid: true };
            }
        });

        // Blood parameter validations
        this.addValidationRule('bloodFlowRate', {
            type: 'range',
            min: 0.0001,
            max: 0.01,
            errorMessages: {
                tooLow: 'Flow rate too slow. Minimum is 0.0001 for visible filling.',
                tooHigh: 'Flow rate too fast. Maximum is 0.01 to prevent overflow.',
                invalid: 'Flow rate must be between 0.0001 and 0.01.'
            },
            dependencies: ['bloodLevel', 'bloodViscosity'],
            contextualValidation: (value, allParams) => {
                const viscosity = allParams.bloodViscosity || 2.0;
                const adjustedRate = value / viscosity;
                
                if (adjustedRate < 0.00005) {
                    return {
                        valid: true,
                        warning: 'High viscosity significantly reduces effective flow rate.'
                    };
                }
                return { valid: true };
            }
        });

        this.addValidationRule('bloodViscosity', {
            type: 'range',
            min: 0.5,
            max: 5.0,
            errorMessages: {
                tooLow: 'Viscosity too low. Minimum is 0.5x for realistic blood behavior.',
                tooHigh: 'Viscosity too high. Maximum is 5.0x for reasonable flow.',
                invalid: 'Blood viscosity must be between 0.5x and 5.0x.'
            },
            warnings: {
                veryLow: { threshold: 1.0, message: 'Low viscosity creates water-like appearance.' },
                veryHigh: { threshold: 4.0, message: 'High viscosity may slow filling significantly.' }
            }
        });

        // Environment parameter validations
        this.addValidationRule('fogDensity', {
            type: 'range',
            min: 0.0,
            max: 0.2,
            errorMessages: {
                tooLow: 'Fog density cannot be negative.',
                tooHigh: 'Fog too dense. Maximum is 0.2 for visibility.',
                invalid: 'Fog density must be between 0.0 and 0.2.'
            },
            warnings: {
                veryHigh: { threshold: 0.15, message: 'Dense fog may obscure important details.' }
            },
            dependencies: ['overheadLight'],
            contextualValidation: (value, allParams) => {
                const lightOn = allParams.overheadLight;
                if (value > 0.1 && !lightOn) {
                    return {
                        valid: true,
                        warning: 'Dense fog with overhead light off may make scene very dark.'
                    };
                }
                return { valid: true };
            }
        });

        this.addValidationRule('cameraSensitivity', {
            type: 'range',
            min: 0.1,
            max: 2.0,
            errorMessages: {
                tooLow: 'Sensitivity too low. Minimum is 0.1x for usable controls.',
                tooHigh: 'Sensitivity too high. Maximum is 2.0x to prevent erratic movement.',
                invalid: 'Camera sensitivity must be between 0.1x and 2.0x.'
            },
            warnings: {
                veryLow: { threshold: 0.3, message: 'Low sensitivity may feel sluggish.' },
                veryHigh: { threshold: 1.5, message: 'High sensitivity may be hard to control.' }
            }
        });
    }

    /**
     * Add a validation rule for a parameter
     * @param {string} paramName - Parameter name
     * @param {Object} rule - Validation rule configuration
     */
    addValidationRule(paramName, rule) {
        this.validationRules.set(paramName, {
            ...rule,
            paramName: paramName
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for parameter changes to validate
        this.eventSystem.addEventListener('beforeChange', '*', (event) => {
            const result = this.validateParameter(
                event.data.parameter, 
                event.data.newValue, 
                event.data.allParameters
            );
            
            // Store validation result in event data
            event.data.validationResult = result;
            
            // Cancel change if validation fails
            if (!result.valid) {
                event.preventDefault();
            }
        });
    }

    /**
     * Validate a parameter value
     * @param {string} paramName - Parameter name
     * @param {any} value - Value to validate
     * @param {Object} allParameters - All current parameter values
     * @returns {Object} Validation result
     */
    validateParameter(paramName, value, allParameters = {}) {
        const rule = this.validationRules.get(paramName);
        if (!rule) {
            return { valid: true, message: 'No validation rule found' };
        }

        const result = {
            valid: true,
            error: null,
            warning: null,
            suggestion: null,
            paramName: paramName,
            value: value,
            timestamp: Date.now()
        };

        try {
            // Basic type and range validation
            const basicResult = this.performBasicValidation(value, rule);
            if (!basicResult.valid) {
                result.valid = false;
                result.error = basicResult.error;
                this.recordValidation(result);
                return result;
            }

            // Warning checks
            if (rule.warnings) {
                const warningResult = this.checkWarnings(value, rule.warnings);
                if (warningResult.warning) {
                    result.warning = warningResult.warning;
                }
            }

            // Performance validation
            if (rule.performanceValidation) {
                const perfResult = rule.performanceValidation(value);
                if (perfResult.warning) {
                    result.warning = result.warning || perfResult.warning;
                }
                if (perfResult.suggestion) {
                    result.suggestion = perfResult.suggestion;
                }
            }

            // Contextual validation with dependencies
            if (rule.contextualValidation && rule.dependencies) {
                const contextResult = rule.contextualValidation(value, allParameters);
                if (!contextResult.valid) {
                    result.valid = false;
                    result.error = contextResult.error;
                } else if (contextResult.warning) {
                    result.warning = result.warning || contextResult.warning;
                }
            }

            // Add suggestions
            if (rule.suggestions && !result.suggestion) {
                result.suggestion = this.selectSuggestion(value, rule.suggestions);
            }

        } catch (error) {
            result.valid = false;
            result.error = `Validation error: ${error.message}`;
            console.error(`Validation error for ${paramName}:`, error);
        }

        this.recordValidation(result);
        return result;
    }

    /**
     * Perform basic type and range validation
     * @param {any} value - Value to validate
     * @param {Object} rule - Validation rule
     * @returns {Object} Basic validation result
     */
    performBasicValidation(value, rule) {
        // Type validation
        if (typeof value !== 'number' && rule.type === 'range') {
            return {
                valid: false,
                error: rule.errorMessages.invalid || 'Invalid value type'
            };
        }

        // Range validation
        if (rule.type === 'range') {
            if (value < rule.min) {
                return {
                    valid: false,
                    error: rule.errorMessages.tooLow || `Value too low (minimum: ${rule.min})`
                };
            }
            if (value > rule.max) {
                return {
                    valid: false,
                    error: rule.errorMessages.tooHigh || `Value too high (maximum: ${rule.max})`
                };
            }
        }

        // Boolean validation
        if (rule.type === 'boolean' && typeof value !== 'boolean') {
            return {
                valid: false,
                error: rule.errorMessages.invalid || 'Value must be true or false'
            };
        }

        return { valid: true };
    }

    /**
     * Check for warning conditions
     * @param {any} value - Value to check
     * @param {Object} warnings - Warning definitions
     * @returns {Object} Warning result
     */
    checkWarnings(value, warnings) {
        for (const [warningType, warningConfig] of Object.entries(warnings)) {
            if (this.shouldShowWarning(value, warningType, warningConfig)) {
                return { warning: warningConfig.message };
            }
        }
        return {};
    }

    /**
     * Determine if a warning should be shown
     * @param {any} value - Current value
     * @param {string} warningType - Type of warning
     * @param {Object} warningConfig - Warning configuration
     * @returns {boolean} Whether to show warning
     */
    shouldShowWarning(value, warningType, warningConfig) {
        switch (warningType) {
            case 'veryLow':
            case 'verySmall':
            case 'verySlow':
                return value <= warningConfig.threshold;
            case 'veryHigh':
            case 'veryLarge':
            case 'veryFast':
                return value >= warningConfig.threshold;
            default:
                return false;
        }
    }

    /**
     * Select appropriate suggestion based on value
     * @param {any} value - Current value
     * @param {Object} suggestions - Available suggestions
     * @returns {string} Selected suggestion
     */
    selectSuggestion(value, suggestions) {
        // Simple heuristic for suggestion selection
        if (suggestions.performance && value > 0.8) {
            return suggestions.performance;
        }
        return suggestions.normal || Object.values(suggestions)[0];
    }

    /**
     * Record validation result in history
     * @param {Object} result - Validation result
     */
    recordValidation(result) {
        this.validationHistory.push(result);
        
        // Limit history size
        if (this.validationHistory.length > this.maxHistorySize) {
            this.validationHistory.shift();
        }

        // Emit validation event
        this.eventSystem.emit('validationComplete', result);
    }

    /**
     * Get validation history for a parameter
     * @param {string} paramName - Parameter name
     * @returns {Array} Validation history
     */
    getValidationHistory(paramName) {
        return this.validationHistory.filter(result => result.paramName === paramName);
    }

    /**
     * Get recent validation errors
     * @param {number} minutes - Minutes to look back
     * @returns {Array} Recent errors
     */
    getRecentErrors(minutes = 5) {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return this.validationHistory.filter(
            result => !result.valid && result.timestamp > cutoff
        );
    }

    /**
     * Get validation statistics
     * @returns {Object} Validation statistics
     */
    getValidationStats() {
        const total = this.validationHistory.length;
        const errors = this.validationHistory.filter(r => !r.valid).length;
        const warnings = this.validationHistory.filter(r => r.warning).length;
        
        return {
            total: total,
            errors: errors,
            warnings: warnings,
            successRate: total > 0 ? ((total - errors) / total * 100).toFixed(1) : 100,
            mostCommonErrors: this.getMostCommonErrors(),
            recentActivity: this.getRecentActivity()
        };
    }

    /**
     * Get most common validation errors
     * @returns {Array} Common errors
     */
    getMostCommonErrors() {
        const errorCounts = {};
        
        this.validationHistory
            .filter(result => !result.valid)
            .forEach(result => {
                const key = `${result.paramName}: ${result.error}`;
                errorCounts[key] = (errorCounts[key] || 0) + 1;
            });

        return Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([error, count]) => ({ error, count }));
    }

    /**
     * Get recent validation activity
     * @returns {Object} Recent activity summary
     */
    getRecentActivity() {
        const recent = this.validationHistory.slice(-10);
        return {
            count: recent.length,
            errors: recent.filter(r => !r.valid).length,
            warnings: recent.filter(r => r.warning).length,
            parameters: [...new Set(recent.map(r => r.paramName))]
        };
    }

    /**
     * Clear validation history
     */
    clearHistory() {
        this.validationHistory = [];
        console.log('Validation history cleared');
    }

    /**
     * Export validation rules for debugging
     * @returns {Object} Validation rules export
     */
    exportRules() {
        const rules = {};
        this.validationRules.forEach((rule, paramName) => {
            rules[paramName] = {
                type: rule.type,
                min: rule.min,
                max: rule.max,
                dependencies: rule.dependencies,
                hasContextualValidation: !!rule.contextualValidation,
                hasPerformanceValidation: !!rule.performanceValidation,
                warningCount: rule.warnings ? Object.keys(rule.warnings).length : 0,
                suggestionCount: rule.suggestions ? Object.keys(rule.suggestions).length : 0
            };
        });
        return rules;
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.validationRules.clear();
        this.validationHistory = [];
        console.log('Advanced validation system disposed');
    }
}