import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Core parameter management system for interactive controls
 * Handles validation, application, and event management for all simulation parameters
 */
export class ParameterController {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.parameters = new Map();
        this.callbacks = new Map();
        this.eventListeners = new Map();
        
        // Initialize parameter definitions
        this.initializeParameterDefinitions();
        
        // Wrap methods with error handling
        this.applyParameter = ErrorDecorator.wrapWithErrorHandler(
            this.applyParameter.bind(this),
            "ParameterController.applyParameter",
            { fallback: false }
        );
    }

    /**
     * Initialize all parameter definitions with metadata
     */
    initializeParameterDefinitions() {
        // Heart simulation parameters
        this.defineParameter('heartBeatSpeed', {
            displayName: 'Heart Beat Speed',
            type: 'slider',
            min: 0.5,
            max: 5.0,
            step: 0.1,
            defaultValue: 2.0,
            unit: 'x',
            description: 'Controls the speed of heart beating animation',
            tooltip: 'Adjust how fast the heart beats. Higher values create faster, more intense beating.',
            target: 'heartSim',
            property: 'beatSpeed',
            validator: (value) => value >= 0.5 && value <= 5.0,
            formatter: (value) => `${value.toFixed(1)}x`
        });

        this.defineParameter('heartBeating', {
            displayName: 'Heart Beating',
            type: 'toggle',
            defaultValue: true,
            description: 'Enable or disable heart beating animation',
            tooltip: 'Toggle the heart beating animation on or off',
            target: 'heartSim',
            property: 'isBeating',
            validator: (value) => typeof value === 'boolean'
        });

        this.defineParameter('heartSize', {
            displayName: 'Heart Size',
            type: 'slider',
            min: 0.3,
            max: 2.0,
            step: 0.1,
            defaultValue: 0.4,
            unit: 'x',
            description: 'Controls the overall size of the heart',
            tooltip: 'Scale the heart size. Larger values create a bigger heart in the jar.',
            target: 'heartSim',
            property: 'scale',
            validator: (value) => value >= 0.3 && value <= 2.0,
            formatter: (value) => `${value.toFixed(1)}x`
        });

        this.defineParameter('heartContractionIntensity', {
            displayName: 'Contraction Intensity',
            type: 'slider',
            min: 0.1,
            max: 2.0,
            step: 0.1,
            defaultValue: 1.0,
            unit: 'x',
            description: 'Controls how strongly the heart chambers contract',
            tooltip: 'Adjust the intensity of heart chamber contractions during beating.',
            target: 'heartSim',
            property: 'contractionIntensity',
            validator: (value) => value >= 0.1 && value <= 2.0,
            formatter: (value) => `${value.toFixed(1)}x`
        });

        // Artery simulation parameters
        this.defineParameter('arteryGrowthSpeed', {
            displayName: 'Artery Growth Speed',
            type: 'slider',
            min: 25,
            max: 500,
            step: 25,
            defaultValue: 50,
            unit: 'ms',
            description: 'Controls how fast arteries grow',
            tooltip: 'Adjust the delay between artery growth steps. Lower values mean faster growth.',
            target: 'arterySim',
            property: 'growthDelay',
            validator: (value) => value >= 25 && value <= 500,
            formatter: (value) => `${value}ms`
        });

        this.defineParameter('arteryMaxBranches', {
            displayName: 'Maximum Branches',
            type: 'slider',
            min: 10,
            max: 200,
            step: 10,
            defaultValue: 50,
            unit: '',
            description: 'Maximum number of artery branches',
            tooltip: 'Set the limit for how many artery branches can grow from the heart.',
            target: 'arterySim',
            property: 'maxBranches',
            validator: (value) => value >= 10 && value <= 200,
            formatter: (value) => `${value}`
        });

        this.defineParameter('arteryThickness', {
            displayName: 'Artery Thickness',
            type: 'slider',
            min: 0.05,
            max: 0.3,
            step: 0.01,
            defaultValue: 0.12,
            unit: '',
            description: 'Controls the thickness of new arteries',
            tooltip: 'Adjust how thick the artery branches appear. Affects new growth only.',
            target: 'arterySim',
            property: 'defaultRadius',
            validator: (value) => value >= 0.05 && value <= 0.3,
            formatter: (value) => `${value.toFixed(2)}`
        });

        this.defineParameter('arteryGrowth', {
            displayName: 'Artery Growth',
            type: 'toggle',
            defaultValue: true,
            description: 'Enable or disable artery growth',
            tooltip: 'Toggle artery growth on or off',
            target: 'arterySim',
            property: 'isGrowing',
            validator: (value) => typeof value === 'boolean'
        });

        // Fluid simulation parameters
        this.defineParameter('bloodFlowRate', {
            displayName: 'Blood Flow Rate',
            type: 'slider',
            min: 0.0001,
            max: 0.01,
            step: 0.0001,
            defaultValue: 0.0001,
            unit: '',
            description: 'Controls how fast blood fills the jar',
            tooltip: 'Adjust the speed at which blood fills up in the jar.',
            target: 'fluidSim',
            property: 'fillSpeed',
            validator: (value) => value >= 0.0001 && value <= 0.01,
            formatter: (value) => `${(value * 10000).toFixed(1)}`
        });

        this.defineParameter('bloodViscosity', {
            displayName: 'Blood Viscosity',
            type: 'slider',
            min: 0.5,
            max: 5.0,
            step: 0.1,
            defaultValue: 2.0,
            unit: 'x',
            description: 'Controls blood thickness and flow behavior',
            tooltip: 'Adjust how thick and viscous the blood appears. Higher values create thicker blood.',
            target: 'fluidSim',
            property: 'viscosity',
            validator: (value) => value >= 0.5 && value <= 5.0,
            formatter: (value) => `${value.toFixed(1)}x`
        });

        this.defineParameter('bloodLevel', {
            displayName: 'Blood Level Target',
            type: 'slider',
            min: 0.0,
            max: 1.0,
            step: 0.1,
            defaultValue: 0.8,
            unit: '%',
            description: 'Target blood level in the jar',
            tooltip: 'Set how full the jar should be with blood.',
            target: 'fluidSim',
            property: 'targetLevel',
            validator: (value) => value >= 0.0 && value <= 1.0,
            formatter: (value) => `${(value * 100).toFixed(0)}%`
        });

        this.defineParameter('bloodFlow', {
            displayName: 'Blood Flow',
            type: 'toggle',
            defaultValue: false,
            description: 'Enable or disable blood flow',
            tooltip: 'Start or stop blood flowing into the jar',
            target: 'fluidSim',
            property: 'isFlowing',
            validator: (value) => typeof value === 'boolean'
        });

        // Environment parameters
        this.defineParameter('overheadLight', {
            displayName: 'Overhead Light',
            type: 'toggle',
            defaultValue: true,
            description: 'Toggle laboratory overhead lighting',
            tooltip: 'Turn the overhead laboratory light on or off',
            target: 'labEnvironment',
            property: 'isOverheadLightOn',
            validator: (value) => typeof value === 'boolean'
        });

        this.defineParameter('fogDensity', {
            displayName: 'Fog Density',
            type: 'slider',
            min: 0.0,
            max: 0.2,
            step: 0.01,
            defaultValue: 0.05,
            unit: '',
            description: 'Controls atmospheric fog density',
            tooltip: 'Adjust how thick the atmospheric fog appears in the scene.',
            target: 'scene',
            property: 'fogDensity',
            validator: (value) => value >= 0.0 && value <= 0.2,
            formatter: (value) => `${value.toFixed(2)}`
        });

        this.defineParameter('postProcessing', {
            displayName: 'Post Processing',
            type: 'toggle',
            defaultValue: true,
            description: 'Enable visual effects like bloom and grain',
            tooltip: 'Toggle post-processing effects including bloom, chromatic aberration, and grain',
            target: 'postProcessing',
            property: 'enabled',
            validator: (value) => typeof value === 'boolean'
        });

        this.defineParameter('cameraSensitivity', {
            displayName: 'Camera Sensitivity',
            type: 'slider',
            min: 0.1,
            max: 2.0,
            step: 0.1,
            defaultValue: 1.0,
            unit: 'x',
            description: 'Controls camera movement sensitivity',
            tooltip: 'Adjust how sensitive the camera controls are to mouse movement.',
            target: 'camera',
            property: 'sensitivity',
            validator: (value) => value >= 0.1 && value <= 2.0,
            formatter: (value) => `${value.toFixed(1)}x`
        });
    }

    /**
     * Define a parameter with its metadata
     * @param {string} name - Parameter name
     * @param {Object} definition - Parameter definition object
     */
    defineParameter(name, definition) {
        this.parameters.set(name, {
            ...definition,
            currentValue: definition.defaultValue
        });
    }

    /**
     * Get parameter definition
     * @param {string} name - Parameter name
     * @returns {Object} Parameter definition
     */
    getParameter(name) {
        return this.parameters.get(name);
    }

    /**
     * Get all parameter definitions
     * @returns {Map} All parameters
     */
    getAllParameters() {
        return this.parameters;
    }

    /**
     * Validate a parameter value
     * @param {string} name - Parameter name
     * @param {any} value - Value to validate
     * @returns {boolean} True if valid
     */
    validateParameter(name, value) {
        const param = this.parameters.get(name);
        if (!param) {
            console.warn(`Parameter ${name} not found`);
            return false;
        }

        try {
            return param.validator ? param.validator(value) : true;
        } catch (error) {
            console.error(`Error validating parameter ${name}:`, error);
            return false;
        }
    }

    /**
     * Apply a parameter value to the simulation
     * @param {string} name - Parameter name
     * @param {any} value - Value to apply
     * @returns {boolean} True if successfully applied
     */
    applyParameter(name, value) {
        const param = this.parameters.get(name);
        if (!param) {
            console.warn(`Parameter ${name} not found`);
            return false;
        }

        // Validate the value
        if (!this.validateParameter(name, value)) {
            console.warn(`Invalid value for parameter ${name}:`, value);
            return false;
        }

        // Update current value
        param.currentValue = value;

        // Apply to target component
        try {
            const success = this.applyToTarget(param, value);
            
            // Trigger callbacks
            if (success) {
                this.triggerCallbacks(name, value);
            }
            
            return success;
        } catch (error) {
            console.error(`Error applying parameter ${name}:`, error);
            ErrorDecorator.logError(error, `ParameterController.applyParameter.${name}`);
            return false;
        }
    }

    /**
     * Apply parameter value to its target component
     * @param {Object} param - Parameter definition
     * @param {any} value - Value to apply
     * @returns {boolean} Success status
     */
    applyToTarget(param, value) {
        const { target, property } = param;
        
        switch (target) {
            case 'heartSim':
                return this.applyToHeartSim(property, value);
            case 'arterySim':
                return this.applyToArterySim(property, value);
            case 'fluidSim':
                return this.applyToFluidSim(property, value);
            case 'labEnvironment':
                return this.applyToLabEnvironment(property, value);
            case 'scene':
                return this.applyToScene(property, value);
            case 'camera':
                return this.applyToCamera(property, value);
            case 'postProcessing':
                return this.applyToPostProcessing(property, value);
            default:
                console.warn(`Unknown target: ${target}`);
                return false;
        }
    }

    /**
     * Apply parameter to heart simulation
     */
    applyToHeartSim(property, value) {
        const heartSim = this.sceneManager.getEntity('heartSim');
        if (!heartSim) return false;

        switch (property) {
            case 'beatSpeed':
                heartSim.setBeatSpeed(value);
                return true;
            case 'isBeating':
                heartSim.setBeating(value);
                return true;
            case 'scale':
                if (heartSim.setHeartScale) {
                    heartSim.setHeartScale(value);
                    return true;
                } else {
                    const heartMesh = heartSim.getMesh();
                    if (heartMesh) {
                        heartMesh.scaling = new BABYLON.Vector3(value, value, value);
                        return true;
                    }
                }
                return false;
            case 'contractionIntensity':
                if (heartSim.setContractionIntensity) {
                    heartSim.setContractionIntensity(value);
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    /**
     * Apply parameter to artery simulation
     */
    applyToArterySim(property, value) {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (!arterySim) return false;

        switch (property) {
            case 'growthDelay':
                arterySim.growthSpeed = value;
                return true;
            case 'maxBranches':
                arterySim.maxBranches = value;
                return true;
            case 'defaultRadius':
                arterySim.defaultRadius = value;
                return true;
            case 'isGrowing':
                arterySim.isGrowing = value;
                if (value && arterySim.processGrowthQueue) {
                    arterySim.processGrowthQueue();
                }
                return true;
            default:
                return false;
        }
    }

    /**
     * Apply parameter to fluid simulation
     */
    applyToFluidSim(property, value) {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (!fluidSim) return false;

        switch (property) {
            case 'fillSpeed':
                fluidSim.fillSpeed = value;
                return true;
            case 'viscosity':
                if (fluidSim.shaderMaterial) {
                    fluidSim.shaderMaterial.setFloat('viscosity', value);
                }
                return true;
            case 'targetLevel':
                fluidSim.targetLevel = value;
                return true;
            case 'isFlowing':
                if (value) {
                    fluidSim.startFilling(fluidSim.targetLevel || 0.8);
                } else {
                    fluidSim.stopFilling();
                }
                return true;
            default:
                return false;
        }
    }

    /**
     * Apply parameter to lab environment
     */
    applyToLabEnvironment(property, value) {
        const labEnvironment = this.sceneManager.getEntity('labEnvironment');
        if (!labEnvironment) return false;

        switch (property) {
            case 'isOverheadLightOn':
                if (labEnvironment.isOverheadLightOn !== value) {
                    labEnvironment.toggleOverheadLight();
                }
                return true;
            default:
                return false;
        }
    }

    /**
     * Apply parameter to scene
     */
    applyToScene(property, value) {
        const scene = this.sceneManager.scene;
        if (!scene) return false;

        switch (property) {
            case 'fogDensity':
                scene.fogDensity = value;
                return true;
            default:
                return false;
        }
    }

    /**
     * Apply parameter to camera
     */
    applyToCamera(property, value) {
        const camera = this.sceneManager.camera;
        if (!camera) return false;

        switch (property) {
            case 'sensitivity':
                if (camera.setSensitivity) {
                    camera.setSensitivity(value);
                    return true;
                }
                return false;
            default:
                return false;
        }
    }

    /**
     * Apply parameter to post-processing
     */
    applyToPostProcessing(property, value) {
        // This would need to be implemented based on your post-processing setup
        // For now, return true as placeholder
        return true;
    }

    /**
     * Register a callback for parameter changes
     * @param {string} name - Parameter name
     * @param {Function} callback - Callback function
     */
    registerCallback(name, callback) {
        if (!this.callbacks.has(name)) {
            this.callbacks.set(name, []);
        }
        this.callbacks.get(name).push(callback);
    }

    /**
     * Trigger callbacks for a parameter change
     * @param {string} name - Parameter name
     * @param {any} value - New value
     */
    triggerCallbacks(name, value) {
        const callbacks = this.callbacks.get(name);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value, name);
                } catch (error) {
                    console.error(`Error in callback for parameter ${name}:`, error);
                }
            });
        }
    }

    /**
     * Get current value of a parameter
     * @param {string} name - Parameter name
     * @returns {any} Current value
     */
    getCurrentValue(name) {
        const param = this.parameters.get(name);
        return param ? param.currentValue : undefined;
    }

    /**
     * Reset parameter to default value
     * @param {string} name - Parameter name
     * @returns {boolean} Success status
     */
    resetParameter(name) {
        const param = this.parameters.get(name);
        if (!param) return false;

        return this.applyParameter(name, param.defaultValue);
    }

    /**
     * Reset all parameters to default values
     */
    resetAllParameters() {
        this.parameters.forEach((param, name) => {
            this.resetParameter(name);
        });
    }

    /**
     * Get parameter limits
     * @param {string} name - Parameter name
     * @returns {Object} Min/max limits
     */
    getParameterLimits(name) {
        const param = this.parameters.get(name);
        if (!param) return null;

        return {
            min: param.min,
            max: param.max,
            step: param.step
        };
    }

    /**
     * Format parameter value for display
     * @param {string} name - Parameter name
     * @param {any} value - Value to format
     * @returns {string} Formatted value
     */
    formatValue(name, value) {
        const param = this.parameters.get(name);
        if (!param) return String(value);

        return param.formatter ? param.formatter(value) : String(value);
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.parameters.clear();
        this.callbacks.clear();
        this.eventListeners.clear();
    }
}