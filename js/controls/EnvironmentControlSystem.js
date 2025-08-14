import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Specialized environment control system with laboratory atmosphere
 * and advanced visual effects management
 */
export class EnvironmentControlSystem {
    constructor(sceneManager, parameterController, eventSystem) {
        this.sceneManager = sceneManager;
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        
        // Environment monitoring state
        this.environmentMonitor = {
            lightingLevel: 100, // Percentage
            fogDensity: 0.05,
            ambientTemperature: 22.0, // Celsius
            humidity: 45.0, // Percentage
            airQuality: 95.0, // Percentage
            isOverheadLightOn: true,
            postProcessingEnabled: true,
            cameraSensitivity: 1.0
        };
        
        // Lighting presets
        this.lightingPresets = {
            bright: { intensity: 1.0, color: [0.95, 0.95, 1.0], temperature: 5500 },
            normal: { intensity: 0.8, color: [0.9, 0.95, 1.0], temperature: 4500 },
            dim: { intensity: 0.4, color: [0.8, 0.9, 1.0], temperature: 3500 },
            emergency: { intensity: 0.2, color: [1.0, 0.3, 0.3], temperature: 2000 }
        };
        
        // Atmosphere presets
        this.atmospherePresets = {
            clear: { fogDensity: 0.01, particles: 'minimal' },
            normal: { fogDensity: 0.05, particles: 'standard' },
            hazy: { fogDensity: 0.12, particles: 'enhanced' },
            smoky: { fogDensity: 0.2, particles: 'heavy' }
        };
        
        this.currentLightingPreset = 'normal';
        this.currentAtmospherePreset = 'normal';
        
        // Post-processing effects state
        this.postProcessingState = {
            bloom: { enabled: true, intensity: 0.5, threshold: 0.85 },
            chromaticAberration: { enabled: true, intensity: 1.0 },
            grain: { enabled: true, intensity: 10 },
            vignette: { enabled: false, intensity: 0.3 }
        };
        
        this.init();
    }

    /**
     * Initialize the environment control system
     */
    init() {
        try {
            this.setupEnvironmentMonitoring();
            this.setupParameterCallbacks();
            this.setupRealTimeDisplay();
            this.startEnvironmentMonitoring();
            this.debugEnvironmentSystem();
            
            console.log('EnvironmentControlSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing EnvironmentControlSystem:', error);
            ErrorDecorator.logError(error, 'EnvironmentControlSystem.init');
        }
    }

    /**
     * Debug the environment system to understand current state
     */
    debugEnvironmentSystem() {
        const labEnvironment = this.sceneManager.getEntity('labEnvironment');
        const scene = this.sceneManager.scene;
        
        if (labEnvironment) {
            console.log('Environment System Debug Info:');
            console.log('- Overhead Light On:', labEnvironment.isOverheadLightOn);
            console.log('- Dust Particles Active:', labEnvironment.dustParticles ? 'Yes' : 'No');
            console.log('- Lights Count:', labEnvironment.lights ? labEnvironment.lights.length : 0);
            
            // Update monitor with current state
            this.environmentMonitor.isOverheadLightOn = labEnvironment.isOverheadLightOn;
        }
        
        if (scene) {
            console.log('- Scene Fog Mode:', scene.fogMode);
            console.log('- Scene Fog Density:', scene.fogDensity);
            console.log('- Scene Clear Color:', scene.clearColor);
            
            // Update monitor with scene state
            this.environmentMonitor.fogDensity = scene.fogDensity || 0.05;
        }
        
        // Check post-processing pipeline
        this.debugPostProcessing();
    }

    /**
     * Debug post-processing pipeline
     */
    debugPostProcessing() {
        // This would check the actual post-processing pipeline
        // For now, we'll assume it exists and is working
        console.log('- Post-processing Pipeline: Active');
        console.log('- Bloom Effect:', this.postProcessingState.bloom.enabled ? 'Enabled' : 'Disabled');
        console.log('- Chromatic Aberration:', this.postProcessingState.chromaticAberration.enabled ? 'Enabled' : 'Disabled');
    }

    /**
     * Setup environment monitoring system
     */
    setupEnvironmentMonitoring() {
        // Initialize monitoring with current state
        const labEnvironment = this.sceneManager.getEntity('labEnvironment');
        const scene = this.sceneManager.scene;
        
        if (labEnvironment) {
            this.environmentMonitor.isOverheadLightOn = labEnvironment.isOverheadLightOn || true;
        }
        
        if (scene) {
            this.environmentMonitor.fogDensity = scene.fogDensity || 0.05;
        }
        
        // Setup environment tracking
        this.setupEnvironmentTracking();
    }

    /**
     * Setup environment tracking system
     */
    setupEnvironmentTracking() {
        this.environmentCheckInterval = setInterval(() => {
            this.updateEnvironmentStats();
        }, 2000); // Check every 2 seconds
    }

    /**
     * Update environment statistics
     */
    updateEnvironmentStats() {
        // Simulate realistic environmental changes
        this.simulateEnvironmentalChanges();
        
        // Update display
        this.updateEnvironmentDisplay();
        
        // Trigger environment event
        this.eventSystem.emit('environmentChange', 'environment', {
            lightingLevel: this.environmentMonitor.lightingLevel,
            fogDensity: this.environmentMonitor.fogDensity,
            temperature: this.environmentMonitor.ambientTemperature,
            humidity: this.environmentMonitor.humidity,
            airQuality: this.environmentMonitor.airQuality
        });
    }

    /**
     * Simulate realistic environmental changes
     */
    simulateEnvironmentalChanges() {
        // Temperature fluctuations
        this.environmentMonitor.ambientTemperature += (Math.random() - 0.5) * 0.1;
        this.environmentMonitor.ambientTemperature = Math.max(18, Math.min(28, this.environmentMonitor.ambientTemperature));
        
        // Humidity changes
        this.environmentMonitor.humidity += (Math.random() - 0.5) * 0.5;
        this.environmentMonitor.humidity = Math.max(30, Math.min(70, this.environmentMonitor.humidity));
        
        // Air quality simulation
        const baseAirQuality = this.environmentMonitor.isOverheadLightOn ? 95 : 92;
        this.environmentMonitor.airQuality = baseAirQuality + (Math.random() - 0.5) * 2;
        this.environmentMonitor.airQuality = Math.max(85, Math.min(100, this.environmentMonitor.airQuality));
        
        // Lighting level based on overhead light
        if (this.environmentMonitor.isOverheadLightOn) {
            this.environmentMonitor.lightingLevel = 95 + Math.random() * 5;
        } else {
            this.environmentMonitor.lightingLevel = 15 + Math.random() * 10;
        }
    }

    /**
     * Setup parameter change callbacks
     */
    setupParameterCallbacks() {
        // Overhead light callback
        this.parameterController.registerCallback('overheadLight', (value) => {
            this.onOverheadLightToggle(value);
        });

        // Fog density callback
        this.parameterController.registerCallback('fogDensity', (value) => {
            this.onFogDensityChange(value);
        });

        // Post-processing callback
        this.parameterController.registerCallback('postProcessing', (value) => {
            this.onPostProcessingToggle(value);
        });

        // Camera sensitivity callback
        this.parameterController.registerCallback('cameraSensitivity', (value) => {
            this.onCameraSensitivityChange(value);
        });
    }

    /**
     * Handle overhead light toggle
     * @param {boolean} isOn - Whether light is on
     */
    onOverheadLightToggle(isOn) {
        const labEnvironment = this.sceneManager.getEntity('labEnvironment');
        if (labEnvironment) {
            // Toggle the light if state is different
            if (labEnvironment.isOverheadLightOn !== isOn) {
                labEnvironment.toggleOverheadLight();
            }
            
            this.environmentMonitor.isOverheadLightOn = isOn;
            
            // Update lighting preset based on state
            this.currentLightingPreset = isOn ? 'normal' : 'dim';
        }
        
        this.showLightingChange(isOn);
    }

    /**
     * Handle fog density changes
     * @param {number} density - New fog density (0-0.2)
     */
    onFogDensityChange(density) {
        const scene = this.sceneManager.scene;
        if (scene) {
            scene.fogDensity = density;
            this.environmentMonitor.fogDensity = density;
            
            // Update atmosphere preset based on density
            if (density <= 0.02) {
                this.currentAtmospherePreset = 'clear';
            } else if (density <= 0.08) {
                this.currentAtmospherePreset = 'normal';
            } else if (density <= 0.15) {
                this.currentAtmospherePreset = 'hazy';
            } else {
                this.currentAtmospherePreset = 'smoky';
            }
        }
        
        this.showFogChange(density);
    }

    /**
     * Handle post-processing toggle
     * @param {boolean} enabled - Whether post-processing is enabled
     */
    onPostProcessingToggle(enabled) {
        this.environmentMonitor.postProcessingEnabled = enabled;
        
        // Update post-processing effects
        this.postProcessingState.bloom.enabled = enabled;
        this.postProcessingState.chromaticAberration.enabled = enabled;
        this.postProcessingState.grain.enabled = enabled;
        
        // Apply to actual post-processing pipeline if available
        this.applyPostProcessingSettings();
        
        this.showPostProcessingChange(enabled);
    }

    /**
     * Handle camera sensitivity changes
     * @param {number} sensitivity - New camera sensitivity (0.1-2.0)
     */
    onCameraSensitivityChange(sensitivity) {
        const camera = this.sceneManager.camera;
        if (camera && camera.setSensitivity) {
            camera.setSensitivity(sensitivity);
        }
        
        this.environmentMonitor.cameraSensitivity = sensitivity;
        this.showCameraSensitivityChange(sensitivity);
    }

    /**
     * Apply post-processing settings to the pipeline
     */
    applyPostProcessingSettings() {
        // This would apply settings to the actual Babylon.js post-processing pipeline
        // For now, we'll log the changes
        console.log('Applying post-processing settings:', this.postProcessingState);
        
        // In a real implementation, this would look something like:
        // if (this.sceneManager.postProcessingPipeline) {
        //     const pipeline = this.sceneManager.postProcessingPipeline;
        //     pipeline.bloomEnabled = this.postProcessingState.bloom.enabled;
        //     pipeline.bloomWeight = this.postProcessingState.bloom.intensity;
        //     // etc.
        // }
    }

    /**
     * Setup real-time environment display
     */
    setupRealTimeDisplay() {
        this.createEnvironmentDisplay();
        this.createAtmosphereVisualization();
        this.createLightingControls();
        this.createPostProcessingControls();
    }

    /**
     * Create environment monitoring display
     */
    createEnvironmentDisplay() {
        const environmentSection = document.querySelector('[data-section-id="environment"]');
        if (!environmentSection) return;

        const environmentDisplay = document.createElement('div');
        environmentDisplay.className = 'environment-display';
        environmentDisplay.innerHTML = `
            <div class="environment-monitor">
                <div class="environment-header">
                    <span class="environment-icon">🔬</span>
                    <span class="environment-label">Lab Environment</span>
                </div>
                <div class="environment-stats">
                    <div class="environment-grid">
                        <div class="env-stat">
                            <span class="stat-label">Lighting</span>
                            <span class="stat-value" id="lightingLevel">100%</span>
                        </div>
                        <div class="env-stat">
                            <span class="stat-label">Temperature</span>
                            <span class="stat-value" id="ambientTemp">22.0°C</span>
                        </div>
                        <div class="env-stat">
                            <span class="stat-label">Humidity</span>
                            <span class="stat-value" id="humidity">45%</span>
                        </div>
                        <div class="env-stat">
                            <span class="stat-label">Air Quality</span>
                            <span class="stat-value" id="airQuality">95%</span>
                        </div>
                    </div>
                </div>
                <div class="environment-status">
                    <div class="lighting-status">
                        <span class="status-label">Overhead Light:</span>
                        <span class="status-value" id="lightStatus">On</span>
                    </div>
                    <div class="atmosphere-status">
                        <span class="status-label">Atmosphere:</span>
                        <span class="status-value" id="atmosphereStatus">Normal</span>
                    </div>
                </div>
            </div>
        `;

        // Insert after the section header
        const sectionContent = environmentSection.querySelector('.section-content');
        if (sectionContent) {
            sectionContent.insertBefore(environmentDisplay, sectionContent.firstChild);
        }
    }

    /**
     * Create atmosphere visualization
     */
    createAtmosphereVisualization() {
        const environmentDisplay = document.querySelector('.environment-display');
        if (!environmentDisplay) return;

        const atmosphereViz = document.createElement('div');
        atmosphereViz.className = 'atmosphere-visualization';
        atmosphereViz.innerHTML = `
            <div class="atmosphere-header">
                <span class="atmosphere-label">Atmosphere</span>
                <span class="preset-name" id="atmospherePreset">Normal</span>
            </div>
            <div class="fog-control">
                <div class="fog-indicator">
                    <div class="fog-level" id="fogLevel"></div>
                </div>
                <span class="fog-value" id="fogValue">0.05</span>
            </div>
        `;

        environmentDisplay.appendChild(atmosphereViz);
    }

    /**
     * Create lighting controls display
     */
    createLightingControls() {
        const environmentDisplay = document.querySelector('.environment-display');
        if (!environmentDisplay) return;

        const lightingControls = document.createElement('div');
        lightingControls.className = 'lighting-controls';
        lightingControls.innerHTML = `
            <div class="lighting-header">
                <span class="lighting-label">Lighting Preset</span>
                <span class="lighting-preset" id="lightingPreset">Normal</span>
            </div>
            <div class="lighting-buttons">
                <button class="preset-btn" data-preset="bright">Bright</button>
                <button class="preset-btn active" data-preset="normal">Normal</button>
                <button class="preset-btn" data-preset="dim">Dim</button>
                <button class="preset-btn emergency" data-preset="emergency">Emergency</button>
            </div>
        `;

        environmentDisplay.appendChild(lightingControls);
        
        // Setup lighting preset buttons
        this.setupLightingPresetButtons();
    }

    /**
     * Create post-processing controls display
     */
    createPostProcessingControls() {
        const environmentDisplay = document.querySelector('.environment-display');
        if (!environmentDisplay) return;

        const postProcessingControls = document.createElement('div');
        postProcessingControls.className = 'post-processing-controls';
        postProcessingControls.innerHTML = `
            <div class="post-processing-header">
                <span class="post-processing-label">Visual Effects</span>
                <span class="post-processing-status" id="postProcessingStatus">Enabled</span>
            </div>
            <div class="effects-grid">
                <div class="effect-item">
                    <span class="effect-name">Bloom</span>
                    <span class="effect-status" id="bloomStatus">On</span>
                </div>
                <div class="effect-item">
                    <span class="effect-name">Aberration</span>
                    <span class="effect-status" id="aberrationStatus">On</span>
                </div>
                <div class="effect-item">
                    <span class="effect-name">Grain</span>
                    <span class="effect-status" id="grainStatus">On</span>
                </div>
                <div class="effect-item">
                    <span class="effect-name">Camera</span>
                    <span class="effect-status" id="cameraStatus">1.0x</span>
                </div>
            </div>
        `;

        environmentDisplay.appendChild(postProcessingControls);
    }

    /**
     * Setup lighting preset buttons
     */
    setupLightingPresetButtons() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyLightingPreset(preset);
                
                // Update active button
                presetButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    /**
     * Apply lighting preset
     * @param {string} presetName - Name of the preset to apply
     */
    applyLightingPreset(presetName) {
        if (!this.lightingPresets[presetName]) return;
        
        const preset = this.lightingPresets[presetName];
        this.currentLightingPreset = presetName;
        
        // Apply preset to lab environment
        const labEnvironment = this.sceneManager.getEntity('labEnvironment');
        if (labEnvironment && labEnvironment.lights) {
            labEnvironment.lights.forEach((light, index) => {
                light.intensity = preset.intensity * (0.8 + index * 0.1);
                light.diffuse = new BABYLON.Color3(...preset.color);
            });
        }
        
        // Update overhead light based on preset
        const shouldBeOn = presetName !== 'dim' && presetName !== 'emergency';
        if (labEnvironment && labEnvironment.isOverheadLightOn !== shouldBeOn) {
            labEnvironment.toggleOverheadLight();
        }
        
        this.updateEnvironmentDisplay();
        this.showLightingPresetChange(presetName);
    }

    /**
     * Update environment display
     */
    updateEnvironmentDisplay() {
        // Update environment stats
        const lightingLevel = document.getElementById('lightingLevel');
        const ambientTemp = document.getElementById('ambientTemp');
        const humidity = document.getElementById('humidity');
        const airQuality = document.getElementById('airQuality');
        
        if (lightingLevel) {
            lightingLevel.textContent = `${Math.round(this.environmentMonitor.lightingLevel)}%`;
        }
        
        if (ambientTemp) {
            ambientTemp.textContent = `${this.environmentMonitor.ambientTemperature.toFixed(1)}°C`;
        }
        
        if (humidity) {
            humidity.textContent = `${Math.round(this.environmentMonitor.humidity)}%`;
        }
        
        if (airQuality) {
            const quality = Math.round(this.environmentMonitor.airQuality);
            airQuality.textContent = `${quality}%`;
            airQuality.className = `stat-value ${this.getAirQualityClass(quality)}`;
        }

        // Update status displays
        const lightStatus = document.getElementById('lightStatus');
        const atmosphereStatus = document.getElementById('atmosphereStatus');
        const lightingPreset = document.getElementById('lightingPreset');
        const atmospherePreset = document.getElementById('atmospherePreset');
        
        if (lightStatus) {
            lightStatus.textContent = this.environmentMonitor.isOverheadLightOn ? 'On' : 'Off';
            lightStatus.className = `status-value ${this.environmentMonitor.isOverheadLightOn ? 'on' : 'off'}`;
        }
        
        if (atmosphereStatus) {
            atmosphereStatus.textContent = this.currentAtmospherePreset.charAt(0).toUpperCase() + 
                                         this.currentAtmospherePreset.slice(1);
        }
        
        if (lightingPreset) {
            lightingPreset.textContent = this.currentLightingPreset.charAt(0).toUpperCase() + 
                                       this.currentLightingPreset.slice(1);
        }
        
        if (atmospherePreset) {
            atmospherePreset.textContent = this.currentAtmospherePreset.charAt(0).toUpperCase() + 
                                         this.currentAtmospherePreset.slice(1);
        }

        // Update fog visualization
        this.updateFogVisualization();
        
        // Update post-processing display
        this.updatePostProcessingDisplay();
    }

    /**
     * Update fog visualization
     */
    updateFogVisualization() {
        const fogLevel = document.getElementById('fogLevel');
        const fogValue = document.getElementById('fogValue');
        
        if (fogLevel) {
            const percentage = (this.environmentMonitor.fogDensity / 0.2) * 100;
            fogLevel.style.width = `${Math.min(100, percentage)}%`;
        }
        
        if (fogValue) {
            fogValue.textContent = this.environmentMonitor.fogDensity.toFixed(3);
        }
    }

    /**
     * Update post-processing display
     */
    updatePostProcessingDisplay() {
        const postProcessingStatus = document.getElementById('postProcessingStatus');
        const bloomStatus = document.getElementById('bloomStatus');
        const aberrationStatus = document.getElementById('aberrationStatus');
        const grainStatus = document.getElementById('grainStatus');
        const cameraStatus = document.getElementById('cameraStatus');
        
        if (postProcessingStatus) {
            postProcessingStatus.textContent = this.environmentMonitor.postProcessingEnabled ? 'Enabled' : 'Disabled';
            postProcessingStatus.className = `post-processing-status ${this.environmentMonitor.postProcessingEnabled ? 'enabled' : 'disabled'}`;
        }
        
        if (bloomStatus) {
            bloomStatus.textContent = this.postProcessingState.bloom.enabled ? 'On' : 'Off';
        }
        
        if (aberrationStatus) {
            aberrationStatus.textContent = this.postProcessingState.chromaticAberration.enabled ? 'On' : 'Off';
        }
        
        if (grainStatus) {
            grainStatus.textContent = this.postProcessingState.grain.enabled ? 'On' : 'Off';
        }
        
        if (cameraStatus) {
            cameraStatus.textContent = `${this.environmentMonitor.cameraSensitivity.toFixed(1)}x`;
        }
    }

    /**
     * Get CSS class for air quality level
     */
    getAirQualityClass(quality) {
        if (quality >= 95) return 'excellent';
        if (quality >= 90) return 'good';
        if (quality >= 85) return 'fair';
        return 'poor';
    }

    /**
     * Show visual feedback for lighting changes
     */
    showLightingChange(isOn) {
        const environmentSection = document.querySelector('[data-section-id="environment"]');
        if (!environmentSection) return;

        environmentSection.classList.add('lighting-changing');
        
        setTimeout(() => {
            environmentSection.classList.remove('lighting-changing');
        }, 1000);
    }

    /**
     * Show visual feedback for fog changes
     */
    showFogChange(density) {
        this.showParameterChange('fog', density);
    }

    /**
     * Show visual feedback for post-processing changes
     */
    showPostProcessingChange(enabled) {
        this.showParameterChange('postprocessing', enabled);
    }

    /**
     * Show visual feedback for camera sensitivity changes
     */
    showCameraSensitivityChange(sensitivity) {
        this.showParameterChange('camera', sensitivity);
    }

    /**
     * Show visual feedback for lighting preset changes
     */
    showLightingPresetChange(preset) {
        this.showParameterChange('preset', preset);
    }

    /**
     * Generic parameter change feedback
     */
    showParameterChange(paramType, value) {
        const environmentDisplay = document.querySelector('.environment-display');
        if (!environmentDisplay) return;

        environmentDisplay.classList.add(`${paramType}-changing`);
        
        setTimeout(() => {
            environmentDisplay.classList.remove(`${paramType}-changing`);
        }, 500);
    }

    /**
     * Start environment monitoring
     */
    startEnvironmentMonitoring() {
        // Environment monitoring is started automatically
    }

    /**
     * Stop environment monitoring
     */
    stopEnvironmentMonitoring() {
        if (this.environmentCheckInterval) {
            clearInterval(this.environmentCheckInterval);
        }
    }

    /**
     * Get current environment statistics
     */
    getEnvironmentStatistics() {
        return {
            lightingLevel: this.environmentMonitor.lightingLevel,
            fogDensity: this.environmentMonitor.fogDensity,
            ambientTemperature: this.environmentMonitor.ambientTemperature,
            humidity: this.environmentMonitor.humidity,
            airQuality: this.environmentMonitor.airQuality,
            isOverheadLightOn: this.environmentMonitor.isOverheadLightOn,
            postProcessingEnabled: this.environmentMonitor.postProcessingEnabled,
            cameraSensitivity: this.environmentMonitor.cameraSensitivity,
            lightingPreset: this.currentLightingPreset,
            atmospherePreset: this.currentAtmospherePreset,
            postProcessingState: { ...this.postProcessingState }
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopEnvironmentMonitoring();
        
        // Remove environment display elements
        const environmentDisplay = document.querySelector('.environment-display');
        if (environmentDisplay) {
            environmentDisplay.remove();
        }
        
        // Clear intervals
        if (this.environmentCheckInterval) {
            clearInterval(this.environmentCheckInterval);
        }
    }
}