/**
 * Graceful Fallback System
 * Provides fallbacks for missing simulation components and ensures system stability
 */

export class GracefulFallbackSystem {
    constructor(sceneManager, controlPanelManager) {
        this.sceneManager = sceneManager;
        this.controlPanelManager = controlPanelManager;
        this.fallbackComponents = new Map();
        this.missingComponents = new Set();
        this.fallbackStrategies = new Map();
        this.componentChecks = new Map();
        
        this.initializeFallbackStrategies();
        this.setupComponentChecks();
    }

    /**
     * Initialize fallback strategies for different components
     */
    initializeFallbackStrategies() {
        // Heart simulation fallbacks
        this.addFallbackStrategy('heartSim', {
            check: () => this.sceneManager.getEntity('heartSim'),
            fallback: () => this.createHeartSimFallback(),
            critical: true,
            description: 'Heart simulation component'
        });

        // Artery simulation fallbacks
        this.addFallbackStrategy('arterySim', {
            check: () => this.sceneManager.getEntity('arterySim'),
            fallback: () => this.createArterySimFallback(),
            critical: true,
            description: 'Artery simulation component'
        });

        // Fluid simulation fallbacks
        this.addFallbackStrategy('fluidSim', {
            check: () => this.sceneManager.getEntity('fluidSim'),
            fallback: () => this.createFluidSimFallback(),
            critical: true,
            description: 'Fluid simulation component'
        });

        // Lab environment fallbacks
        this.addFallbackStrategy('labEnvironment', {
            check: () => this.sceneManager.getEntity('labEnvironment'),
            fallback: () => this.createLabEnvironmentFallback(),
            critical: false,
            description: 'Laboratory environment'
        });

        // Camera fallbacks
        this.addFallbackStrategy('camera', {
            check: () => this.sceneManager.camera,
            fallback: () => this.createCameraFallback(),
            critical: true,
            description: 'Camera system'
        });

        // Scene fallbacks
        this.addFallbackStrategy('scene', {
            check: () => this.sceneManager.scene,
            fallback: () => this.createSceneFallback(),
            critical: true,
            description: 'Babylon.js scene'
        });

        // Post-processing fallbacks
        this.addFallbackStrategy('postProcessing', {
            check: () => this.sceneManager.postProcessing,
            fallback: () => this.createPostProcessingFallback(),
            critical: false,
            description: 'Post-processing effects'
        });
    }

    /**
     * Add a fallback strategy
     * @param {string} componentName - Component name
     * @param {Object} strategy - Fallback strategy
     */
    addFallbackStrategy(componentName, strategy) {
        this.fallbackStrategies.set(componentName, {
            ...strategy,
            lastCheck: 0,
            fallbackActive: false,
            checkInterval: strategy.critical ? 5000 : 10000 // More frequent checks for critical components
        });
    }

    /**
     * Setup component checks
     */
    setupComponentChecks() {
        // Initial component check
        this.checkAllComponents();

        // Periodic component checks
        setInterval(() => {
            this.checkAllComponents();
        }, 5000);

        // Check components before critical operations
        this.setupPreOperationChecks();
    }

    /**
     * Setup pre-operation checks
     */
    setupPreOperationChecks() {
        // Check components before parameter application
        const originalApplyParameter = this.controlPanelManager.parameterController.applyParameter;
        this.controlPanelManager.parameterController.applyParameter = (name, value) => {
            this.checkComponentsForParameter(name);
            return originalApplyParameter.call(this.controlPanelManager.parameterController, name, value);
        };
    }

    /**
     * Check all components
     */
    checkAllComponents() {
        const now = Date.now();
        
        this.fallbackStrategies.forEach((strategy, componentName) => {
            if (now - strategy.lastCheck > strategy.checkInterval) {
                this.checkComponent(componentName);
                strategy.lastCheck = now;
            }
        });
    }

    /**
     * Check a specific component
     * @param {string} componentName - Component to check
     * @returns {boolean} Whether component is available
     */
    checkComponent(componentName) {
        const strategy = this.fallbackStrategies.get(componentName);
        if (!strategy) return true;

        try {
            const component = strategy.check();
            const isAvailable = !!component;

            if (!isAvailable && !strategy.fallbackActive) {
                // Component is missing, activate fallback
                this.activateFallback(componentName);
            } else if (isAvailable && strategy.fallbackActive) {
                // Component is back, deactivate fallback
                this.deactivateFallback(componentName);
            }

            return isAvailable || strategy.fallbackActive;

        } catch (error) {
            console.error(`Error checking component ${componentName}:`, error);
            if (!strategy.fallbackActive) {
                this.activateFallback(componentName);
            }
            return false;
        }
    }

    /**
     * Check components required for a specific parameter
     * @param {string} paramName - Parameter name
     */
    checkComponentsForParameter(paramName) {
        const param = this.controlPanelManager.parameterController.getParameter(paramName);
        if (!param) return;

        const requiredComponents = this.getRequiredComponents(param.target);
        requiredComponents.forEach(componentName => {
            this.checkComponent(componentName);
        });
    }

    /**
     * Get required components for a target
     * @param {string} target - Parameter target
     * @returns {Array} Required component names
     */
    getRequiredComponents(target) {
        const componentMap = {
            'heartSim': ['heartSim', 'scene'],
            'arterySim': ['arterySim', 'scene'],
            'fluidSim': ['fluidSim', 'scene'],
            'labEnvironment': ['labEnvironment', 'scene'],
            'scene': ['scene'],
            'camera': ['camera'],
            'postProcessing': ['postProcessing', 'scene']
        };

        return componentMap[target] || [];
    }

    /**
     * Activate fallback for a component
     * @param {string} componentName - Component name
     */
    activateFallback(componentName) {
        const strategy = this.fallbackStrategies.get(componentName);
        if (!strategy || strategy.fallbackActive) return;

        console.warn(`⚠️ Activating fallback for missing component: ${strategy.description}`);

        try {
            const fallbackComponent = strategy.fallback();
            
            if (fallbackComponent) {
                this.fallbackComponents.set(componentName, fallbackComponent);
                strategy.fallbackActive = true;
                this.missingComponents.add(componentName);

                // Notify user for critical components
                if (strategy.critical) {
                    this.notifyUserOfFallback(componentName, strategy.description);
                }

                // Emit fallback activation event
                this.controlPanelManager.eventSystem.emit('fallbackActivated', {
                    component: componentName,
                    description: strategy.description,
                    critical: strategy.critical
                });

            } else {
                console.error(`❌ Failed to create fallback for ${componentName}`);
            }

        } catch (error) {
            console.error(`❌ Error creating fallback for ${componentName}:`, error);
        }
    }

    /**
     * Deactivate fallback for a component
     * @param {string} componentName - Component name
     */
    deactivateFallback(componentName) {
        const strategy = this.fallbackStrategies.get(componentName);
        if (!strategy || !strategy.fallbackActive) return;

        console.log(`✅ Deactivating fallback for restored component: ${strategy.description}`);

        // Clean up fallback component
        const fallbackComponent = this.fallbackComponents.get(componentName);
        if (fallbackComponent && typeof fallbackComponent.dispose === 'function') {
            fallbackComponent.dispose();
        }

        this.fallbackComponents.delete(componentName);
        strategy.fallbackActive = false;
        this.missingComponents.delete(componentName);

        // Emit fallback deactivation event
        this.controlPanelManager.eventSystem.emit('fallbackDeactivated', {
            component: componentName,
            description: strategy.description
        });
    }

    /**
     * Create heart simulation fallback
     * @returns {Object} Fallback heart simulation
     */
    createHeartSimFallback() {
        return {
            setBeatSpeed: (speed) => {
                console.log(`Heart beat speed set to ${speed} (fallback mode)`);
            },
            setBeating: (beating) => {
                console.log(`Heart beating ${beating ? 'enabled' : 'disabled'} (fallback mode)`);
            },
            setHeartScale: (scale) => {
                console.log(`Heart scale set to ${scale} (fallback mode)`);
            },
            setContractionIntensity: (intensity) => {
                console.log(`Heart contraction intensity set to ${intensity} (fallback mode)`);
            },
            getMesh: () => null,
            dispose: () => {
                console.log('Heart simulation fallback disposed');
            }
        };
    }

    /**
     * Create artery simulation fallback
     * @returns {Object} Fallback artery simulation
     */
    createArterySimFallback() {
        return {
            growthSpeed: 50,
            maxBranches: 50,
            defaultRadius: 0.12,
            isGrowing: false,
            processGrowthQueue: () => {
                console.log('Artery growth queue processed (fallback mode)');
            },
            resetSystem: () => {
                console.log('Artery system reset (fallback mode)');
            },
            dispose: () => {
                console.log('Artery simulation fallback disposed');
            }
        };
    }

    /**
     * Create fluid simulation fallback
     * @returns {Object} Fallback fluid simulation
     */
    createFluidSimFallback() {
        return {
            fillSpeed: 0.0001,
            targetLevel: 0.8,
            shaderMaterial: {
                setFloat: (name, value) => {
                    console.log(`Fluid shader ${name} set to ${value} (fallback mode)`);
                }
            },
            startFilling: (level) => {
                console.log(`Fluid filling started to level ${level} (fallback mode)`);
            },
            stopFilling: () => {
                console.log('Fluid filling stopped (fallback mode)');
            },
            drainBlood: () => {
                console.log('Blood drained (fallback mode)');
            },
            dispose: () => {
                console.log('Fluid simulation fallback disposed');
            }
        };
    }

    /**
     * Create lab environment fallback
     * @returns {Object} Fallback lab environment
     */
    createLabEnvironmentFallback() {
        return {
            isOverheadLightOn: true,
            toggleOverheadLight: () => {
                this.isOverheadLightOn = !this.isOverheadLightOn;
                console.log(`Overhead light ${this.isOverheadLightOn ? 'on' : 'off'} (fallback mode)`);
            },
            dispose: () => {
                console.log('Lab environment fallback disposed');
            }
        };
    }

    /**
     * Create camera fallback
     * @returns {Object} Fallback camera
     */
    createCameraFallback() {
        return {
            setSensitivity: (sensitivity) => {
                console.log(`Camera sensitivity set to ${sensitivity} (fallback mode)`);
            },
            resetView: () => {
                console.log('Camera view reset (fallback mode)');
            },
            dispose: () => {
                console.log('Camera fallback disposed');
            }
        };
    }

    /**
     * Create scene fallback
     * @returns {Object} Fallback scene
     */
    createSceneFallback() {
        return {
            fogDensity: 0.05,
            dispose: () => {
                console.log('Scene fallback disposed');
            }
        };
    }

    /**
     * Create post-processing fallback
     * @returns {Object} Fallback post-processing
     */
    createPostProcessingFallback() {
        return {
            enabled: false,
            setEnabled: (enabled) => {
                this.enabled = enabled;
                console.log(`Post-processing ${enabled ? 'enabled' : 'disabled'} (fallback mode)`);
            },
            dispose: () => {
                console.log('Post-processing fallback disposed');
            }
        };
    }

    /**
     * Notify user of fallback activation
     * @param {string} componentName - Component name
     * @param {string} description - Component description
     */
    notifyUserOfFallback(componentName, description) {
        const message = `${description} is unavailable. Using fallback mode with limited functionality.`;
        
        if (this.controlPanelManager.showGlobalFeedback) {
            this.controlPanelManager.showGlobalFeedback(message, 'warning');
        }
    }

    /**
     * Get fallback component
     * @param {string} componentName - Component name
     * @returns {Object} Fallback component or null
     */
    getFallbackComponent(componentName) {
        return this.fallbackComponents.get(componentName) || null;
    }

    /**
     * Check if component is in fallback mode
     * @param {string} componentName - Component name
     * @returns {boolean} Whether component is in fallback mode
     */
    isInFallbackMode(componentName) {
        const strategy = this.fallbackStrategies.get(componentName);
        return strategy ? strategy.fallbackActive : false;
    }

    /**
     * Get system status
     * @returns {Object} System status
     */
    getSystemStatus() {
        const status = {
            totalComponents: this.fallbackStrategies.size,
            missingComponents: this.missingComponents.size,
            activeFallbacks: this.fallbackComponents.size,
            criticalMissing: 0,
            components: {}
        };

        this.fallbackStrategies.forEach((strategy, componentName) => {
            status.components[componentName] = {
                available: !strategy.fallbackActive,
                fallbackActive: strategy.fallbackActive,
                critical: strategy.critical,
                description: strategy.description,
                lastCheck: strategy.lastCheck
            };

            if (strategy.critical && strategy.fallbackActive) {
                status.criticalMissing++;
            }
        });

        return status;
    }

    /**
     * Force check all components
     */
    forceCheckAllComponents() {
        console.log('🔍 Forcing check of all components...');
        
        this.fallbackStrategies.forEach((strategy, componentName) => {
            strategy.lastCheck = 0; // Reset last check time
            this.checkComponent(componentName);
        });

        const status = this.getSystemStatus();
        console.log(`Component check complete: ${status.totalComponents - status.missingComponents}/${status.totalComponents} available`);
        
        if (status.missingComponents > 0) {
            console.warn(`Missing components: ${Array.from(this.missingComponents).join(', ')}`);
        }
    }

    /**
     * Attempt to restore missing components
     */
    attemptComponentRestoration() {
        console.log('🔄 Attempting to restore missing components...');
        
        let restoredCount = 0;
        
        this.missingComponents.forEach(componentName => {
            const strategy = this.fallbackStrategies.get(componentName);
            if (strategy) {
                try {
                    const component = strategy.check();
                    if (component) {
                        this.deactivateFallback(componentName);
                        restoredCount++;
                        console.log(`✅ Restored component: ${strategy.description}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to restore ${componentName}:`, error);
                }
            }
        });

        if (restoredCount > 0) {
            this.controlPanelManager.showGlobalFeedback(
                `Restored ${restoredCount} component${restoredCount > 1 ? 's' : ''}`, 
                'success'
            );
        }

        return restoredCount;
    }

    /**
     * Create diagnostic report
     * @returns {Object} Diagnostic report
     */
    createDiagnosticReport() {
        const status = this.getSystemStatus();
        const report = {
            timestamp: new Date().toISOString(),
            systemStatus: status,
            fallbackComponents: Array.from(this.fallbackComponents.keys()),
            missingComponents: Array.from(this.missingComponents),
            recommendations: []
        };

        // Add recommendations
        if (status.criticalMissing > 0) {
            report.recommendations.push('Critical components are missing. Check scene initialization.');
        }

        if (status.missingComponents > status.totalComponents / 2) {
            report.recommendations.push('Many components are missing. Consider reloading the application.');
        }

        if (this.missingComponents.has('scene')) {
            report.recommendations.push('Scene is missing. This is a critical error that requires immediate attention.');
        }

        return report;
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Dispose all fallback components
        this.fallbackComponents.forEach((component, name) => {
            if (typeof component.dispose === 'function') {
                component.dispose();
            }
        });

        this.fallbackComponents.clear();
        this.missingComponents.clear();
        this.fallbackStrategies.clear();
        this.componentChecks.clear();

        console.log('Graceful fallback system disposed');
    }
}