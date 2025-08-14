import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Preset management system for quick configuration switching
 * Provides predefined parameter sets for different demonstration scenarios
 */
export class PresetManager {
    constructor(parameterController, eventSystem) {
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        
        // Preset storage
        this.presets = new Map();
        this.customPresets = new Map();
        this.currentPreset = null;
        this.isApplyingPreset = false;
        
        // Transition settings
        this.transitionSettings = {
            duration: 2000, // 2 seconds
            steps: 20,
            easing: 'easeInOutCubic'
        };
        
        this.init();
    }

    /**
     * Initialize the preset manager
     */
    init() {
        try {
            this.defineBuiltInPresets();
            this.loadCustomPresets();
            
            console.log('PresetManager initialized successfully');
        } catch (error) {
            console.error('Error initializing PresetManager:', error);
            ErrorDecorator.logError(error, 'PresetManager.init');
        }
    }

    /**
     * Define built-in preset configurations
     */
    defineBuiltInPresets() {
        // Healthy Heart - Normal cardiac function demonstration
        this.definePreset('healthyHeart', {
            name: 'Healthy Heart',
            description: 'Demonstrates normal cardiac function with optimal parameters',
            icon: '❤️',
            category: 'medical',
            parameters: {
                // Heart parameters - normal healthy values
                heartBeatSpeed: 1.2, // ~72 BPM
                heartBeating: true,
                heartSize: 0.4,
                heartContractionIntensity: 1.0,
                
                // Artery parameters - moderate growth
                arteryGrowthSpeed: 75,
                arteryMaxBranches: 40,
                arteryThickness: 0.12,
                arteryGrowth: true,
                
                // Blood parameters - normal flow
                bloodFlowRate: 0.0003,
                bloodViscosity: 2.0,
                bloodLevel: 0.6,
                bloodFlow: true,
                
                // Environment - optimal lab conditions
                overheadLight: true,
                fogDensity: 0.03,
                postProcessing: true,
                cameraSensitivity: 1.0
            }
        });

        // Rapid Growth - Accelerated development demonstration
        this.definePreset('rapidGrowth', {
            name: 'Rapid Growth',
            description: 'Accelerated artery development with enhanced visualization',
            icon: '🚀',
            category: 'demonstration',
            parameters: {
                // Heart parameters - elevated for growth
                heartBeatSpeed: 2.0, // ~120 BPM
                heartBeating: true,
                heartSize: 0.5,
                heartContractionIntensity: 1.3,
                
                // Artery parameters - rapid growth
                arteryGrowthSpeed: 25,
                arteryMaxBranches: 80,
                arteryThickness: 0.15,
                arteryGrowth: true,
                
                // Blood parameters - increased flow
                bloodFlowRate: 0.0008,
                bloodViscosity: 1.8,
                bloodLevel: 0.8,
                bloodFlow: true,
                
                // Environment - enhanced visibility
                overheadLight: true,
                fogDensity: 0.02,
                postProcessing: true,
                cameraSensitivity: 1.2
            }
        });

        // Laboratory Demo - Educational presentation mode
        this.definePreset('laboratoryDemo', {
            name: 'Laboratory Demo',
            description: 'Optimized for educational presentations and demonstrations',
            icon: '🔬',
            category: 'educational',
            parameters: {
                // Heart parameters - clear visibility
                heartBeatSpeed: 1.5, // ~90 BPM
                heartBeating: true,
                heartSize: 0.6,
                heartContractionIntensity: 1.2,
                
                // Artery parameters - moderate controlled growth
                arteryGrowthSpeed: 50,
                arteryMaxBranches: 60,
                arteryThickness: 0.14,
                arteryGrowth: true,
                
                // Blood parameters - visible flow
                bloodFlowRate: 0.0005,
                bloodViscosity: 2.2,
                bloodLevel: 0.7,
                bloodFlow: true,
                
                // Environment - presentation lighting
                overheadLight: true,
                fogDensity: 0.04,
                postProcessing: true,
                cameraSensitivity: 0.8
            }
        });

        // Pathological Heart - Abnormal cardiac function
        this.definePreset('pathologicalHeart', {
            name: 'Pathological Heart',
            description: 'Demonstrates abnormal cardiac function and arrhythmias',
            icon: '⚠️',
            category: 'medical',
            parameters: {
                // Heart parameters - pathological values
                heartBeatSpeed: 0.8, // ~48 BPM (bradycardia)
                heartBeating: true,
                heartSize: 0.7, // Enlarged heart
                heartContractionIntensity: 0.6, // Weak contractions
                
                // Artery parameters - impaired growth
                arteryGrowthSpeed: 150,
                arteryMaxBranches: 25,
                arteryThickness: 0.08,
                arteryGrowth: true,
                
                // Blood parameters - reduced flow
                bloodFlowRate: 0.0002,
                bloodViscosity: 3.5, // Increased viscosity
                bloodLevel: 0.4,
                bloodFlow: true,
                
                // Environment - clinical conditions
                overheadLight: true,
                fogDensity: 0.06,
                postProcessing: true,
                cameraSensitivity: 1.0
            }
        });

        // High Performance - Maximum activity simulation
        this.definePreset('highPerformance', {
            name: 'High Performance',
            description: 'Simulates high-activity cardiac state with enhanced parameters',
            icon: '💪',
            category: 'demonstration',
            parameters: {
                // Heart parameters - high performance
                heartBeatSpeed: 3.0, // ~180 BPM
                heartBeating: true,
                heartSize: 0.45,
                heartContractionIntensity: 1.8,
                
                // Artery parameters - enhanced vascularization
                arteryGrowthSpeed: 30,
                arteryMaxBranches: 100,
                arteryThickness: 0.18,
                arteryGrowth: true,
                
                // Blood parameters - high flow
                bloodFlowRate: 0.001,
                bloodViscosity: 1.5,
                bloodLevel: 0.9,
                bloodFlow: true,
                
                // Environment - bright conditions
                overheadLight: true,
                fogDensity: 0.01,
                postProcessing: true,
                cameraSensitivity: 1.5
            }
        });

        // Minimal Setup - Basic demonstration
        this.definePreset('minimalSetup', {
            name: 'Minimal Setup',
            description: 'Basic setup with minimal parameters for simple demonstrations',
            icon: '🔹',
            category: 'basic',
            parameters: {
                // Heart parameters - basic
                heartBeatSpeed: 1.0, // ~60 BPM
                heartBeating: true,
                heartSize: 0.3,
                heartContractionIntensity: 0.8,
                
                // Artery parameters - limited growth
                arteryGrowthSpeed: 100,
                arteryMaxBranches: 20,
                arteryThickness: 0.10,
                arteryGrowth: true,
                
                // Blood parameters - minimal flow
                bloodFlowRate: 0.0001,
                bloodViscosity: 2.0,
                bloodLevel: 0.3,
                bloodFlow: false,
                
                // Environment - basic lighting
                overheadLight: true,
                fogDensity: 0.05,
                postProcessing: false,
                cameraSensitivity: 1.0
            }
        });
    }

    /**
     * Define a preset configuration
     * @param {string} id - Preset identifier
     * @param {Object} config - Preset configuration
     */
    definePreset(id, config) {
        // Validate preset configuration
        if (!this.validatePresetConfig(config)) {
            console.error(`Invalid preset configuration for ${id}`);
            return false;
        }

        // Add metadata
        config.id = id;
        config.createdAt = new Date().toISOString();
        config.isBuiltIn = true;

        this.presets.set(id, config);
        return true;
    }

    /**
     * Validate preset configuration
     * @param {Object} config - Configuration to validate
     * @returns {boolean} True if valid
     */
    validatePresetConfig(config) {
        // Check required fields
        const requiredFields = ['name', 'description', 'parameters'];
        for (const field of requiredFields) {
            if (!config[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validate parameters
        const parameters = config.parameters;
        for (const [paramName, value] of Object.entries(parameters)) {
            if (!this.parameterController.validateParameter(paramName, value)) {
                console.error(`Invalid parameter value: ${paramName} = ${value}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Apply a preset configuration
     * @param {string} presetId - ID of preset to apply
     * @param {Object} options - Application options
     * @returns {Promise<boolean>} Success status
     */
    async applyPreset(presetId, options = {}) {
        const preset = this.getPreset(presetId);
        if (!preset) {
            console.error(`Preset not found: ${presetId}`);
            return false;
        }

        try {
            this.isApplyingPreset = true;
            
            // Get current parameter values for transition
            const currentValues = this.getCurrentParameterValues();
            const targetValues = preset.parameters;
            
            // Apply transition options
            const transitionOptions = {
                smooth: options.smooth !== false,
                duration: options.duration || this.transitionSettings.duration,
                ...options
            };

            // Emit preset application start event
            this.eventSystem.emit('presetApplicationStart', 'presets', {
                presetId,
                presetName: preset.name,
                smooth: transitionOptions.smooth
            });

            let success = false;
            
            if (transitionOptions.smooth) {
                success = await this.applyPresetWithTransition(currentValues, targetValues, transitionOptions);
            } else {
                success = this.applyPresetImmediate(targetValues);
            }

            if (success) {
                this.currentPreset = presetId;
                
                // Emit preset application complete event
                this.eventSystem.emit('presetApplicationComplete', 'presets', {
                    presetId,
                    presetName: preset.name,
                    success: true
                });
                
                console.log(`Applied preset: ${preset.name}`);
            }

            return success;
            
        } catch (error) {
            console.error(`Error applying preset ${presetId}:`, error);
            ErrorDecorator.logError(error, `PresetManager.applyPreset.${presetId}`);
            
            // Emit error event
            this.eventSystem.emit('presetApplicationComplete', 'presets', {
                presetId,
                presetName: preset.name,
                success: false,
                error: error.message
            });
            
            return false;
        } finally {
            this.isApplyingPreset = false;
        }
    }

    /**
     * Apply preset with smooth transitions
     * @param {Object} currentValues - Current parameter values
     * @param {Object} targetValues - Target parameter values
     * @param {Object} options - Transition options
     * @returns {Promise<boolean>} Success status
     */
    async applyPresetWithTransition(currentValues, targetValues, options) {
        const { duration, steps } = options;
        const stepDuration = duration / steps;
        
        // Calculate parameter deltas
        const parameterDeltas = {};
        for (const [paramName, targetValue] of Object.entries(targetValues)) {
            const currentValue = currentValues[paramName];
            if (currentValue !== undefined) {
                parameterDeltas[paramName] = {
                    start: currentValue,
                    end: targetValue,
                    delta: (targetValue - currentValue) / steps
                };
            }
        }

        // Apply transition steps
        for (let step = 1; step <= steps; step++) {
            const progress = step / steps;
            const easedProgress = this.easeInOutCubic(progress);
            
            // Calculate intermediate values
            const intermediateValues = {};
            for (const [paramName, delta] of Object.entries(parameterDeltas)) {
                if (typeof delta.start === 'boolean') {
                    // Handle boolean parameters - switch at 50% progress
                    intermediateValues[paramName] = progress >= 0.5 ? delta.end : delta.start;
                } else {
                    // Handle numeric parameters with easing
                    intermediateValues[paramName] = delta.start + (delta.end - delta.start) * easedProgress;
                }
            }
            
            // Apply intermediate values
            for (const [paramName, value] of Object.entries(intermediateValues)) {
                this.parameterController.applyParameter(paramName, value);
            }
            
            // Wait for next step
            if (step < steps) {
                await this.sleep(stepDuration);
            }
        }

        // Ensure final values are exact
        for (const [paramName, targetValue] of Object.entries(targetValues)) {
            this.parameterController.applyParameter(paramName, targetValue);
        }

        return true;
    }

    /**
     * Apply preset immediately without transitions
     * @param {Object} targetValues - Target parameter values
     * @returns {boolean} Success status
     */
    applyPresetImmediate(targetValues) {
        let allSuccess = true;
        
        for (const [paramName, value] of Object.entries(targetValues)) {
            const success = this.parameterController.applyParameter(paramName, value);
            if (!success) {
                console.error(`Failed to apply parameter: ${paramName} = ${value}`);
                allSuccess = false;
            }
        }
        
        return allSuccess;
    }

    /**
     * Get current parameter values
     * @returns {Object} Current parameter values
     */
    getCurrentParameterValues() {
        const values = {};
        this.parameterController.getAllParameters().forEach((param, name) => {
            values[name] = this.parameterController.getCurrentValue(name);
        });
        return values;
    }

    /**
     * Get preset by ID
     * @param {string} presetId - Preset ID
     * @returns {Object|null} Preset configuration
     */
    getPreset(presetId) {
        return this.presets.get(presetId) || this.customPresets.get(presetId) || null;
    }

    /**
     * Get all presets
     * @returns {Array} Array of preset configurations
     */
    getAllPresets() {
        const allPresets = [];
        
        // Add built-in presets
        this.presets.forEach(preset => allPresets.push(preset));
        
        // Add custom presets
        this.customPresets.forEach(preset => allPresets.push(preset));
        
        return allPresets;
    }

    /**
     * Get presets by category
     * @param {string} category - Category name
     * @returns {Array} Array of preset configurations
     */
    getPresetsByCategory(category) {
        return this.getAllPresets().filter(preset => preset.category === category);
    }

    /**
     * Save current configuration as custom preset
     * @param {string} name - Preset name
     * @param {string} description - Preset description
     * @param {Object} options - Additional options
     * @returns {string|null} Preset ID if successful
     */
    saveCurrentAsPreset(name, description, options = {}) {
        try {
            const presetId = this.generatePresetId(name);
            const currentValues = this.getCurrentParameterValues();
            
            const presetConfig = {
                id: presetId,
                name: name,
                description: description,
                icon: options.icon || '⭐',
                category: options.category || 'custom',
                parameters: currentValues,
                createdAt: new Date().toISOString(),
                isBuiltIn: false
            };

            if (this.validatePresetConfig(presetConfig)) {
                this.customPresets.set(presetId, presetConfig);
                this.saveCustomPresets();
                
                console.log(`Saved custom preset: ${name}`);
                return presetId;
            }
            
            return null;
        } catch (error) {
            console.error('Error saving custom preset:', error);
            ErrorDecorator.logError(error, 'PresetManager.saveCurrentAsPreset');
            return null;
        }
    }

    /**
     * Delete custom preset
     * @param {string} presetId - Preset ID to delete
     * @returns {boolean} Success status
     */
    deleteCustomPreset(presetId) {
        const preset = this.customPresets.get(presetId);
        if (!preset) {
            console.error(`Custom preset not found: ${presetId}`);
            return false;
        }

        if (preset.isBuiltIn) {
            console.error(`Cannot delete built-in preset: ${presetId}`);
            return false;
        }

        this.customPresets.delete(presetId);
        this.saveCustomPresets();
        
        console.log(`Deleted custom preset: ${preset.name}`);
        return true;
    }

    /**
     * Generate unique preset ID
     * @param {string} name - Preset name
     * @returns {string} Unique preset ID
     */
    generatePresetId(name) {
        const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        let id = baseId;
        let counter = 1;
        
        while (this.presets.has(id) || this.customPresets.has(id)) {
            id = `${baseId}_${counter}`;
            counter++;
        }
        
        return id;
    }

    /**
     * Load custom presets from storage
     */
    loadCustomPresets() {
        try {
            const stored = localStorage.getItem('heartSimulation_customPresets');
            if (stored) {
                const customPresets = JSON.parse(stored);
                for (const [id, preset] of Object.entries(customPresets)) {
                    if (this.validatePresetConfig(preset)) {
                        this.customPresets.set(id, preset);
                    }
                }
                console.log(`Loaded ${this.customPresets.size} custom presets`);
            }
        } catch (error) {
            console.error('Error loading custom presets:', error);
            ErrorDecorator.logError(error, 'PresetManager.loadCustomPresets');
        }
    }

    /**
     * Save custom presets to storage
     */
    saveCustomPresets() {
        try {
            const customPresetsObj = {};
            this.customPresets.forEach((preset, id) => {
                customPresetsObj[id] = preset;
            });
            
            localStorage.setItem('heartSimulation_customPresets', JSON.stringify(customPresetsObj));
        } catch (error) {
            console.error('Error saving custom presets:', error);
            ErrorDecorator.logError(error, 'PresetManager.saveCustomPresets');
        }
    }

    /**
     * Easing function for smooth transitions
     * @param {number} t - Progress (0-1)
     * @returns {number} Eased progress
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Sleep utility for transitions
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current preset ID
     * @returns {string|null} Current preset ID
     */
    getCurrentPreset() {
        return this.currentPreset;
    }

    /**
     * Check if currently applying a preset
     * @returns {boolean} True if applying preset
     */
    isApplyingPresetTransition() {
        return this.isApplyingPreset;
    }

    /**
     * Get preset statistics
     * @returns {Object} Preset statistics
     */
    getPresetStatistics() {
        const categories = {};
        const allPresets = this.getAllPresets();
        
        allPresets.forEach(preset => {
            const category = preset.category || 'uncategorized';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category]++;
        });

        return {
            totalPresets: allPresets.length,
            builtInPresets: this.presets.size,
            customPresets: this.customPresets.size,
            categories: categories,
            currentPreset: this.currentPreset
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Save any pending custom presets
        this.saveCustomPresets();
        
        // Clear preset data
        this.presets.clear();
        this.customPresets.clear();
        this.currentPreset = null;
        this.isApplyingPreset = false;
    }
}