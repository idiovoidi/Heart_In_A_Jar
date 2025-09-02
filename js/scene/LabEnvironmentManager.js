/**
 * Laboratory Environment Manager
 * Integrates with the existing scene manager to create an immersive lab environment
 */

import { LaboratoryEnvironment } from './LaboratoryEnvironment.js';

export class LabEnvironmentManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        this.laboratoryEnvironment = null;
        this.isInitialized = false;
        
        // Environment state
        this.environmentState = {
            lightingEnabled: true,
            fogEnabled: true,
            particlesEnabled: true,
            ambientSoundsEnabled: true,
            interactiveElementsEnabled: true
        };
        
        this.init();
    }

    /**
     * Initialize the laboratory environment manager
     */
    async init() {
        try {
            console.log('🔬 Initializing Laboratory Environment Manager...');
            
            // Create the laboratory environment
            this.laboratoryEnvironment = new LaboratoryEnvironment(this.scene, this.sceneManager);
            
            // Wait for initialization to complete
            await this.waitForInitialization();
            
            // Setup environment controls integration
            this.setupEnvironmentControls();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            this.isInitialized = true;
            console.log('✅ Laboratory Environment Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Laboratory Environment Manager:', error);
        }
    }

    /**
     * Wait for laboratory environment initialization
     */
    async waitForInitialization() {
        return new Promise((resolve) => {
            const checkInitialization = () => {
                if (this.laboratoryEnvironment && this.laboratoryEnvironment.labObjects.size > 0) {
                    resolve();
                } else {
                    setTimeout(checkInitialization, 100);
                }
            };
            checkInitialization();
        });
    }

    /**
     * Setup integration with environment controls
     */
    setupEnvironmentControls() {
        // Check if control panel manager exists
        if (this.sceneManager.controlPanelManager) {
            const controlPanel = this.sceneManager.controlPanelManager;
            
            // Register callbacks for environment parameters
            this.registerEnvironmentCallbacks(controlPanel);
            
            console.log('🔗 Environment controls integrated');
        }
    }

    /**
     * Register callbacks for environment parameter changes
     */
    registerEnvironmentCallbacks(controlPanel) {
        const paramController = controlPanel.parameterController;
        
        // Overhead light control
        paramController.registerCallback('overheadLight', (enabled) => {
            this.setOverheadLighting(enabled);
        });
        
        // Fog density control
        paramController.registerCallback('fogDensity', (density) => {
            this.setFogDensity(density);
        });
        
        // Post-processing effects
        paramController.registerCallback('postProcessing', (enabled) => {
            this.setPostProcessingEffects(enabled);
        });
        
        // Camera sensitivity (affects environment interaction)
        paramController.registerCallback('cameraSensitivity', (sensitivity) => {
            this.setCameraInteractionSensitivity(sensitivity);
        });
    }

    /**
     * Control overhead lighting
     */
    setOverheadLighting(enabled) {
        if (!this.laboratoryEnvironment || !this.laboratoryEnvironment.lighting) return;
        
        const { overhead } = this.laboratoryEnvironment.lighting;
        if (overhead) {
            overhead.forEach(lightObj => {
                if (lightObj.light) {
                    lightObj.light.intensity = enabled ? 
                        this.laboratoryEnvironment.config.lighting.overhead.intensity : 0.1;
                }
            });
        }
        
        this.environmentState.lightingEnabled = enabled;
        console.log(`💡 Overhead lighting ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Control fog density
     */
    setFogDensity(density) {
        if (!this.scene) return;
        
        this.scene.fogDensity = density;
        this.environmentState.fogEnabled = density > 0;
        
        console.log(`🌫️ Fog density set to ${density}`);
    }

    /**
     * Control post-processing effects
     */
    setPostProcessingEffects(enabled) {
        // This would integrate with the post-processing pipeline
        // For now, we'll adjust the overall scene brightness and contrast
        
        if (this.scene) {
            // Adjust ambient light based on post-processing state
            const ambientIntensity = enabled ? 0.3 : 0.2;
            
            this.scene.lights.forEach(light => {
                if (light.name && light.name.includes('ambient')) {
                    light.intensity = ambientIntensity;
                }
            });
        }
        
        this.environmentState.postProcessingEnabled = enabled;
        console.log(`✨ Post-processing effects ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set camera interaction sensitivity
     */
    setCameraInteractionSensitivity(sensitivity) {
        if (this.sceneManager.camera) {
            // Adjust camera controls based on sensitivity
            const camera = this.sceneManager.camera;
            
            if (camera.setTarget) {
                // Adjust camera movement speed
                camera.speed = sensitivity;
            }
            
            if (camera.attachControls) {
                // Update control sensitivity
                camera.angularSensibilityX = 1000 / sensitivity;
                camera.angularSensibilityY = 1000 / sensitivity;
            }
        }
        
        console.log(`📷 Camera sensitivity set to ${sensitivity}`);
    }

    /**
     * Setup performance monitoring for the environment
     */
    setupPerformanceMonitoring() {
        // Monitor frame rate and adjust quality accordingly
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitorPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) { // Every second
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust quality based on performance
                this.adjustQualityBasedOnPerformance(fps);
            }
            
            requestAnimationFrame(monitorPerformance);
        };
        
        requestAnimationFrame(monitorPerformance);
    }

    /**
     * Adjust environment quality based on performance
     */
    adjustQualityBasedOnPerformance(fps) {
        if (fps < 30) {
            // Reduce particle count
            const dustParticles = this.laboratoryEnvironment?.labObjects.get('dustParticles');
            if (dustParticles && dustParticles.emitRate > 5) {
                dustParticles.emitRate = Math.max(5, dustParticles.emitRate - 2);
            }
            
            // Reduce fog density slightly
            if (this.scene.fogDensity > 0.01) {
                this.scene.fogDensity = Math.max(0.01, this.scene.fogDensity - 0.005);
            }
        } else if (fps > 50) {
            // Increase quality if performance allows
            const dustParticles = this.laboratoryEnvironment?.labObjects.get('dustParticles');
            if (dustParticles && dustParticles.emitRate < 15) {
                dustParticles.emitRate = Math.min(15, dustParticles.emitRate + 1);
            }
        }
    }

    /**
     * Get environment statistics
     */
    getEnvironmentStats() {
        return {
            isInitialized: this.isInitialized,
            objectCount: this.laboratoryEnvironment?.labObjects.size || 0,
            lightingEnabled: this.environmentState.lightingEnabled,
            fogEnabled: this.environmentState.fogEnabled,
            particlesEnabled: this.environmentState.particlesEnabled,
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * Get memory usage statistics
     */
    getMemoryUsage() {
        if (window.performance && window.performance.memory) {
            return {
                used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    /**
     * Update the environment (called from render loop)
     */
    update(deltaTime) {
        if (this.laboratoryEnvironment) {
            this.laboratoryEnvironment.update(deltaTime);
        }
    }

    /**
     * Dispose of the environment manager
     */
    dispose() {
        if (this.laboratoryEnvironment) {
            this.laboratoryEnvironment.dispose();
            this.laboratoryEnvironment = null;
        }
        
        this.isInitialized = false;
        console.log('🧹 Laboratory Environment Manager disposed');
    }
}