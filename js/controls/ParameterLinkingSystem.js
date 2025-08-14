/**
 * Parameter Linking System for creating realistic parameter relationships
 * Links heart rate to artery pulse speed and other physiological connections
 */

export class ParameterLinkingSystem {
    constructor(parameterController, eventSystem) {
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        this.links = new Map();
        this.linkingEnabled = true;
        this.transitionDuration = 300; // ms
        this.activeTransitions = new Map();
        
        this.initializeParameterLinks();
        this.setupEventListeners();
    }

    /**
     * Initialize parameter linking relationships
     */
    initializeParameterLinks() {
        // Heart rate affects artery pulse speed
        this.createLink('heartBeatSpeed', 'arteryPulseSpeed', {
            type: 'direct',
            multiplier: 1.0,
            description: 'Heart rate controls artery pulse speed for realistic circulation',
            enabled: true
        });

        // Heart size affects blood flow requirements
        this.createLink('heartSize', 'bloodFlowRate', {
            type: 'exponential',
            multiplier: 0.5,
            exponent: 1.5,
            description: 'Larger hearts require more blood flow',
            enabled: true
        });

        // Heart contraction intensity affects artery pressure
        this.createLink('heartContractionIntensity', 'arteryThickness', {
            type: 'logarithmic',
            multiplier: 0.1,
            offset: 0.05,
            description: 'Stronger contractions create thicker arteries',
            enabled: true
        });

        // Blood viscosity affects flow rate (inverse relationship)
        this.createLink('bloodViscosity', 'bloodFlowRate', {
            type: 'inverse',
            multiplier: 0.001,
            description: 'Higher viscosity reduces flow rate',
            enabled: true
        });

        // Artery growth affects blood level requirements
        this.createLink('arteryMaxBranches', 'bloodLevel', {
            type: 'linear',
            multiplier: 0.003,
            offset: 0.5,
            description: 'More arteries require more blood to fill',
            enabled: true
        });

        // Environment lighting affects visibility parameters
        this.createLink('overheadLight', 'fogDensity', {
            type: 'conditional',
            trueValue: 0.02,
            falseValue: 0.08,
            description: 'Overhead light reduces fog visibility',
            enabled: true
        });

        // Camera sensitivity affects post-processing intensity
        this.createLink('cameraSensitivity', 'postProcessingIntensity', {
            type: 'direct',
            multiplier: 0.5,
            description: 'Higher sensitivity may require reduced effects',
            enabled: false // Disabled by default
        });
    }

    /**
     * Create a parameter link
     * @param {string} sourceParam - Source parameter name
     * @param {string} targetParam - Target parameter name
     * @param {Object} linkConfig - Link configuration
     */
    createLink(sourceParam, targetParam, linkConfig) {
        const linkId = `${sourceParam}->${targetParam}`;
        
        this.links.set(linkId, {
            source: sourceParam,
            target: targetParam,
            config: linkConfig,
            lastAppliedValue: null,
            isActive: linkConfig.enabled
        });

        console.log(`Created parameter link: ${sourceParam} -> ${targetParam}`);
    }

    /**
     * Setup event listeners for parameter changes
     */
    setupEventListeners() {
        // Listen for parameter changes to trigger linked updates
        this.eventSystem.addEventListener('change', '*', (event) => {
            if (this.linkingEnabled) {
                this.handleParameterChange(event.data.parameter, event.data.newValue);
            }
        });

        // Listen for linking system enable/disable
        this.eventSystem.addEventListener('linking', 'toggle', (event) => {
            this.linkingEnabled = event.data.enabled;
            console.log(`Parameter linking ${this.linkingEnabled ? 'enabled' : 'disabled'}`);
        });
    }

    /**
     * Handle parameter change and update linked parameters
     * @param {string} paramName - Changed parameter name
     * @param {any} value - New value
     */
    handleParameterChange(paramName, value) {
        // Find all links where this parameter is the source
        const relevantLinks = Array.from(this.links.values()).filter(
            link => link.source === paramName && link.isActive
        );

        relevantLinks.forEach(link => {
            this.applyParameterLink(link, value);
        });
    }

    /**
     * Apply a parameter link calculation
     * @param {Object} link - Link definition
     * @param {any} sourceValue - Source parameter value
     */
    applyParameterLink(link, sourceValue) {
        const { target, config } = link;
        let targetValue;

        try {
            // Calculate target value based on link type
            switch (config.type) {
                case 'direct':
                    targetValue = sourceValue * config.multiplier;
                    break;

                case 'inverse':
                    targetValue = config.multiplier / sourceValue;
                    break;

                case 'linear':
                    targetValue = (sourceValue * config.multiplier) + (config.offset || 0);
                    break;

                case 'exponential':
                    targetValue = Math.pow(sourceValue, config.exponent || 2) * config.multiplier;
                    break;

                case 'logarithmic':
                    targetValue = Math.log(sourceValue + 1) * config.multiplier + (config.offset || 0);
                    break;

                case 'conditional':
                    targetValue = sourceValue ? config.trueValue : config.falseValue;
                    break;

                case 'custom':
                    if (config.calculator) {
                        targetValue = config.calculator(sourceValue);
                    } else {
                        console.warn(`Custom link ${link.source}->${link.target} missing calculator function`);
                        return;
                    }
                    break;

                default:
                    console.warn(`Unknown link type: ${config.type}`);
                    return;
            }

            // Validate and constrain target value
            const targetParam = this.parameterController.getParameter(target);
            if (targetParam) {
                targetValue = this.constrainValue(targetValue, targetParam);
                
                // Apply smooth transition if enabled
                if (this.transitionDuration > 0) {
                    this.applyWithTransition(target, targetValue, link);
                } else {
                    this.applyLinkedValue(target, targetValue, link);
                }
            }

        } catch (error) {
            console.error(`Error applying parameter link ${link.source}->${link.target}:`, error);
        }
    }

    /**
     * Constrain value to parameter limits
     * @param {number} value - Value to constrain
     * @param {Object} param - Parameter definition
     * @returns {number} Constrained value
     */
    constrainValue(value, param) {
        if (param.min !== undefined && value < param.min) {
            return param.min;
        }
        if (param.max !== undefined && value > param.max) {
            return param.max;
        }
        return value;
    }

    /**
     * Apply linked value with smooth transition
     * @param {string} targetParam - Target parameter name
     * @param {number} targetValue - Target value
     * @param {Object} link - Link definition
     */
    applyWithTransition(targetParam, targetValue, link) {
        // Cancel existing transition for this parameter
        if (this.activeTransitions.has(targetParam)) {
            clearInterval(this.activeTransitions.get(targetParam).intervalId);
        }

        const currentValue = this.parameterController.getCurrentValue(targetParam);
        const valueDiff = targetValue - currentValue;
        const steps = Math.max(10, Math.abs(valueDiff) * 50); // More steps for larger changes
        const stepSize = valueDiff / steps;
        const stepDuration = this.transitionDuration / steps;

        let currentStep = 0;
        const intervalId = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            
            // Use easing function for smooth transition
            const easedProgress = this.easeInOutCubic(progress);
            const newValue = currentValue + (valueDiff * easedProgress);

            // Apply the intermediate value
            this.applyLinkedValue(targetParam, newValue, link, true);

            // Complete transition
            if (currentStep >= steps) {
                clearInterval(intervalId);
                this.activeTransitions.delete(targetParam);
                this.applyLinkedValue(targetParam, targetValue, link, false);
            }
        }, stepDuration);

        this.activeTransitions.set(targetParam, {
            intervalId,
            targetValue,
            startTime: Date.now()
        });
    }

    /**
     * Cubic easing function for smooth transitions
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased progress
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Apply linked parameter value
     * @param {string} targetParam - Target parameter name
     * @param {number} value - Value to apply
     * @param {Object} link - Link definition
     * @param {boolean} isTransition - Whether this is a transition step
     */
    applyLinkedValue(targetParam, value, link, isTransition = false) {
        // Temporarily disable linking to prevent circular updates
        const wasEnabled = this.linkingEnabled;
        this.linkingEnabled = false;

        try {
            // Apply the parameter value
            const success = this.parameterController.applyParameter(targetParam, value);
            
            if (success) {
                link.lastAppliedValue = value;
                
                // Emit linked parameter change event
                if (!isTransition) {
                    this.eventSystem.emit('parameterLinked', {
                        source: link.source,
                        target: targetParam,
                        value: value,
                        linkType: link.config.type,
                        description: link.config.description
                    });
                }
            }
        } finally {
            // Re-enable linking
            this.linkingEnabled = wasEnabled;
        }
    }

    /**
     * Enable or disable a specific parameter link
     * @param {string} sourceParam - Source parameter
     * @param {string} targetParam - Target parameter
     * @param {boolean} enabled - Enable state
     */
    setLinkEnabled(sourceParam, targetParam, enabled) {
        const linkId = `${sourceParam}->${targetParam}`;
        const link = this.links.get(linkId);
        
        if (link) {
            link.isActive = enabled;
            console.log(`Parameter link ${linkId} ${enabled ? 'enabled' : 'disabled'}`);
            
            // Emit link state change event
            this.eventSystem.emit('linkStateChanged', {
                source: sourceParam,
                target: targetParam,
                enabled: enabled
            });
        }
    }

    /**
     * Get all active parameter links
     * @returns {Array} Array of active links
     */
    getActiveLinks() {
        return Array.from(this.links.values()).filter(link => link.isActive);
    }

    /**
     * Get all available parameter links
     * @returns {Array} Array of all links
     */
    getAllLinks() {
        return Array.from(this.links.values());
    }

    /**
     * Enable or disable the entire linking system
     * @param {boolean} enabled - Enable state
     */
    setLinkingEnabled(enabled) {
        this.linkingEnabled = enabled;
        
        // Cancel all active transitions
        if (!enabled) {
            this.activeTransitions.forEach(transition => {
                clearInterval(transition.intervalId);
            });
            this.activeTransitions.clear();
        }

        this.eventSystem.emit('linkingSystemToggled', { enabled });
        console.log(`Parameter linking system ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set transition duration for smooth parameter changes
     * @param {number} duration - Duration in milliseconds
     */
    setTransitionDuration(duration) {
        this.transitionDuration = Math.max(0, duration);
        console.log(`Parameter transition duration set to ${this.transitionDuration}ms`);
    }

    /**
     * Force update all linked parameters based on current values
     */
    updateAllLinkedParameters() {
        console.log('Updating all linked parameters...');
        
        const processedSources = new Set();
        
        this.links.forEach(link => {
            if (link.isActive && !processedSources.has(link.source)) {
                const sourceValue = this.parameterController.getCurrentValue(link.source);
                if (sourceValue !== undefined) {
                    this.handleParameterChange(link.source, sourceValue);
                    processedSources.add(link.source);
                }
            }
        });
    }

    /**
     * Create a custom parameter link with a calculator function
     * @param {string} sourceParam - Source parameter
     * @param {string} targetParam - Target parameter
     * @param {Function} calculator - Custom calculation function
     * @param {string} description - Link description
     */
    createCustomLink(sourceParam, targetParam, calculator, description) {
        this.createLink(sourceParam, targetParam, {
            type: 'custom',
            calculator: calculator,
            description: description,
            enabled: true
        });
    }

    /**
     * Remove a parameter link
     * @param {string} sourceParam - Source parameter
     * @param {string} targetParam - Target parameter
     */
    removeLink(sourceParam, targetParam) {
        const linkId = `${sourceParam}->${targetParam}`;
        const removed = this.links.delete(linkId);
        
        if (removed) {
            console.log(`Removed parameter link: ${linkId}`);
            this.eventSystem.emit('linkRemoved', { source: sourceParam, target: targetParam });
        }
        
        return removed;
    }

    /**
     * Get link information for debugging
     * @returns {Object} Link system status
     */
    getSystemStatus() {
        return {
            enabled: this.linkingEnabled,
            totalLinks: this.links.size,
            activeLinks: this.getActiveLinks().length,
            activeTransitions: this.activeTransitions.size,
            transitionDuration: this.transitionDuration,
            links: Array.from(this.links.entries()).map(([id, link]) => ({
                id,
                source: link.source,
                target: link.target,
                type: link.config.type,
                active: link.isActive,
                lastValue: link.lastAppliedValue,
                description: link.config.description
            }))
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Cancel all active transitions
        this.activeTransitions.forEach(transition => {
            clearInterval(transition.intervalId);
        });
        
        this.activeTransitions.clear();
        this.links.clear();
        this.linkingEnabled = false;
        
        console.log('Parameter linking system disposed');
    }
}