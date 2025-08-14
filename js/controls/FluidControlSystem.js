import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Specialized fluid control system with real-time blood flow monitoring
 * and advanced hemodynamic simulation management
 */
export class FluidControlSystem {
    constructor(sceneManager, parameterController, eventSystem) {
        this.sceneManager = sceneManager;
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        
        // Fluid monitoring state
        this.fluidMonitor = {
            currentLevel: 0,
            targetLevel: 0,
            fillRate: 0, // ml/sec equivalent
            drainRate: 0,
            viscosity: 2.0,
            temperature: 37.0, // Celsius
            oxygenation: 98.0, // Percentage
            isFlowing: false,
            flowDirection: 'filling', // 'filling', 'draining', 'static'
            totalVolume: 0 // Total volume in jar
        };
        
        // Blood properties simulation
        this.bloodProperties = {
            hematocrit: 45.0, // Percentage of red blood cells
            hemoglobin: 14.0, // g/dL
            platelets: 250000, // per microliter
            whiteBloodCells: 7000, // per microliter
            pH: 7.4,
            pressure: 120 // mmHg systolic equivalent
        };
        
        // Flow patterns
        this.flowPatterns = {
            laminar: { turbulence: 0.1, efficiency: 0.95 },
            transitional: { turbulence: 0.3, efficiency: 0.85 },
            turbulent: { turbulence: 0.6, efficiency: 0.75 }
        };
        
        this.currentFlowPattern = 'laminar';
        this.jarCapacity = 1000; // ml equivalent
        
        this.init();
    }

    /**
     * Initialize the fluid control system
     */
    init() {
        try {
            this.setupFluidMonitoring();
            this.setupParameterCallbacks();
            this.setupRealTimeDisplay();
            this.startFluidMonitoring();
            this.debugFluidSystem();
            
            console.log('FluidControlSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing FluidControlSystem:', error);
            ErrorDecorator.logError(error, 'FluidControlSystem.init');
        }
    }

    /**
     * Debug the fluid system to understand current state
     */
    debugFluidSystem() {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            console.log('Fluid System Debug Info:');
            console.log('- Is Flowing:', fluidSim.isFlowing);
            console.log('- Current Level:', fluidSim.currentLevel);
            console.log('- Target Level:', fluidSim.targetLevel);
            console.log('- Fill Speed:', fluidSim.fillSpeed);
            console.log('- Viscosity:', fluidSim.viscosity || 'Not set');
            
            // Check if fluid mesh is visible
            const fluidMesh = fluidSim.getMesh();
            if (fluidMesh) {
                console.log('- Fluid Mesh Visible:', fluidMesh.isVisible);
                console.log('- Fluid Mesh Position:', fluidMesh.position);
                console.log('- Fluid Mesh Scaling:', fluidMesh.scaling);
            }
            
            // Update monitor with current state
            this.fluidMonitor.currentLevel = fluidSim.currentLevel || 0;
            this.fluidMonitor.targetLevel = fluidSim.targetLevel || 0;
            this.fluidMonitor.isFlowing = fluidSim.isFlowing || false;
        } else {
            console.warn('FluidSimulation not found in scene manager');
        }
    }

    /**
     * Setup fluid monitoring system
     */
    setupFluidMonitoring() {
        // Initialize monitoring with current state
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            this.fluidMonitor.currentLevel = fluidSim.currentLevel || 0;
            this.fluidMonitor.targetLevel = fluidSim.targetLevel || 0;
            this.fluidMonitor.isFlowing = fluidSim.isFlowing || false;
            this.fluidMonitor.viscosity = fluidSim.viscosity || 2.0;
        }
        
        // Setup flow tracking
        this.setupFlowTracking();
    }

    /**
     * Setup flow tracking system
     */
    setupFlowTracking() {
        this.lastLevel = this.fluidMonitor.currentLevel;
        this.flowCheckInterval = setInterval(() => {
            this.updateFlowStats();
        }, 500); // Check every 500ms for smooth updates
    }

    /**
     * Update flow statistics
     */
    updateFlowStats() {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (!fluidSim) return;

        const currentLevel = fluidSim.currentLevel || 0;
        const currentTime = performance.now();
        
        // Update basic stats
        this.fluidMonitor.currentLevel = currentLevel;
        this.fluidMonitor.targetLevel = fluidSim.targetLevel || 0;
        this.fluidMonitor.isFlowing = fluidSim.isFlowing || false;
        
        // Calculate flow rate
        if (this.lastFlowTime > 0) {
            const timeDiff = (currentTime - this.lastFlowTime) / 1000;
            const levelDiff = currentLevel - this.lastLevel;
            
            if (Math.abs(levelDiff) > 0.001) { // Only update if significant change
                this.fluidMonitor.fillRate = levelDiff / timeDiff;
                
                // Determine flow direction
                if (levelDiff > 0) {
                    this.fluidMonitor.flowDirection = 'filling';
                } else if (levelDiff < 0) {
                    this.fluidMonitor.flowDirection = 'draining';
                } else {
                    this.fluidMonitor.flowDirection = 'static';
                }
                
                // Update flow pattern based on rate
                this.updateFlowPattern();
            }
        }
        
        this.lastFlowTime = currentTime;
        this.lastLevel = currentLevel;
        
        // Calculate total volume (assuming cylindrical jar)
        this.fluidMonitor.totalVolume = (currentLevel * this.jarCapacity).toFixed(1);
        
        // Simulate blood properties changes
        this.updateBloodProperties();
        
        // Update display
        this.updateFluidDisplay();
        
        // Trigger flow event
        this.eventSystem.emit('fluidFlow', 'blood', {
            level: currentLevel,
            fillRate: this.fluidMonitor.fillRate,
            isFlowing: this.fluidMonitor.isFlowing,
            direction: this.fluidMonitor.flowDirection,
            volume: this.fluidMonitor.totalVolume
        });
    }

    /**
     * Update flow pattern based on current flow rate
     */
    updateFlowPattern() {
        const rate = Math.abs(this.fluidMonitor.fillRate);
        
        if (rate < 0.1) {
            this.currentFlowPattern = 'laminar';
        } else if (rate < 0.3) {
            this.currentFlowPattern = 'transitional';
        } else {
            this.currentFlowPattern = 'turbulent';
        }
    }

    /**
     * Update blood properties simulation
     */
    updateBloodProperties() {
        // Simulate realistic blood property changes
        const level = this.fluidMonitor.currentLevel;
        const isFlowing = this.fluidMonitor.isFlowing;
        
        // Oxygenation decreases slightly over time when static
        if (!isFlowing && level > 0) {
            this.bloodProperties.oxygenation = Math.max(85, 
                this.bloodProperties.oxygenation - 0.01);
        } else if (isFlowing) {
            this.bloodProperties.oxygenation = Math.min(98, 
                this.bloodProperties.oxygenation + 0.05);
        }
        
        // Temperature regulation
        this.bloodProperties.temperature = 37.0 + (Math.random() - 0.5) * 0.2;
        
        // Pressure simulation based on flow
        if (isFlowing) {
            const baseP = 120;
            const variation = this.fluidMonitor.fillRate * 10;
            this.bloodProperties.pressure = Math.max(80, Math.min(140, baseP + variation));
        }
    }

    /**
     * Setup parameter change callbacks
     */
    setupParameterCallbacks() {
        // Flow rate callback
        this.parameterController.registerCallback('bloodFlowRate', (value) => {
            this.onFlowRateChange(value);
        });

        // Viscosity callback
        this.parameterController.registerCallback('bloodViscosity', (value) => {
            this.onViscosityChange(value);
        });

        // Blood level callback
        this.parameterController.registerCallback('bloodLevel', (value) => {
            this.onBloodLevelChange(value);
        });

        // Flow toggle callback
        this.parameterController.registerCallback('bloodFlow', (value) => {
            this.onFlowToggle(value);
        });
    }

    /**
     * Handle flow rate changes
     * @param {number} rate - New flow rate
     */
    onFlowRateChange(rate) {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            fluidSim.fillSpeed = rate;
            
            // Update flow pattern based on new rate
            this.updateFlowPattern();
        }
        
        this.showFlowRateChange(rate);
    }

    /**
     * Handle viscosity changes
     * @param {number} viscosity - New viscosity value
     */
    onViscosityChange(viscosity) {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            this.fluidMonitor.viscosity = viscosity;
            
            // Update shader material if available
            if (fluidSim.shaderMaterial) {
                fluidSim.shaderMaterial.setFloat('viscosity', viscosity);
            }
            
            // Viscosity affects flow efficiency
            const efficiency = 1.0 / (1.0 + (viscosity - 1.0) * 0.2);
            if (fluidSim.fillSpeed) {
                fluidSim.fillSpeed *= efficiency;
            }
        }
        
        this.showViscosityChange(viscosity);
    }

    /**
     * Handle blood level target changes
     * @param {number} level - New target level (0-1)
     */
    onBloodLevelChange(level) {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            fluidSim.targetLevel = level;
            this.fluidMonitor.targetLevel = level;
            
            // If currently flowing, adjust to new target
            if (fluidSim.isFlowing) {
                fluidSim.startFilling(level);
            }
        }
        
        this.showBloodLevelChange(level);
    }

    /**
     * Handle flow toggle
     * @param {boolean} isFlowing - Whether flow is enabled
     */
    onFlowToggle(isFlowing) {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            if (isFlowing) {
                fluidSim.startFilling(this.fluidMonitor.targetLevel);
            } else {
                fluidSim.stopFilling();
            }
            
            this.fluidMonitor.isFlowing = isFlowing;
        }
        
        this.updateFlowStatusDisplay(isFlowing);
    }

    /**
     * Setup real-time fluid display
     */
    setupRealTimeDisplay() {
        this.createFluidDisplay();
        this.createFlowVisualization();
        this.createBloodAnalysisDisplay();
    }

    /**
     * Create fluid monitoring display
     */
    createFluidDisplay() {
        const bloodSection = document.querySelector('[data-section-id="blood"]');
        if (!bloodSection) return;

        const fluidDisplay = document.createElement('div');
        fluidDisplay.className = 'fluid-display';
        fluidDisplay.innerHTML = `
            <div class="fluid-monitor">
                <div class="fluid-header">
                    <span class="fluid-icon">💧</span>
                    <span class="fluid-label">Blood Flow</span>
                </div>
                <div class="fluid-stats">
                    <div class="fluid-level">
                        <div class="level-container">
                            <div class="level-bar">
                                <div class="level-fill" id="fluidLevelFill"></div>
                                <div class="level-target" id="fluidLevelTarget"></div>
                            </div>
                            <div class="level-labels">
                                <span class="level-current" id="fluidLevelCurrent">0%</span>
                                <span class="level-volume" id="fluidVolume">0 ml</span>
                            </div>
                        </div>
                    </div>
                    <div class="flow-info">
                        <div class="flow-rate">
                            <span class="rate-label">Flow Rate:</span>
                            <span class="rate-value" id="flowRate">0.0</span>
                            <span class="rate-unit">ml/s</span>
                        </div>
                        <div class="flow-direction">
                            <span class="direction-label">Direction:</span>
                            <span class="direction-value" id="flowDirection">Static</span>
                        </div>
                    </div>
                </div>
                <div class="fluid-status">
                    <span class="flow-status" id="flowStatus">Stopped</span>
                    <div class="flow-indicator" id="flowIndicator"></div>
                </div>
            </div>
        `;

        // Insert after the section header
        const sectionContent = bloodSection.querySelector('.section-content');
        if (sectionContent) {
            sectionContent.insertBefore(fluidDisplay, sectionContent.firstChild);
        }
    }

    /**
     * Create flow visualization
     */
    createFlowVisualization() {
        const fluidDisplay = document.querySelector('.fluid-display');
        if (!fluidDisplay) return;

        const flowViz = document.createElement('div');
        flowViz.className = 'flow-visualization';
        flowViz.innerHTML = `
            <div class="flow-header">
                <span class="flow-label">Flow Pattern</span>
                <span class="pattern-name" id="flowPatternName">Laminar</span>
            </div>
            <div class="flow-graph">
                <canvas id="flowCanvas" width="200" height="50"></canvas>
            </div>
        `;

        fluidDisplay.appendChild(flowViz);
        
        // Initialize flow canvas
        this.initializeFlowCanvas();
    }

    /**
     * Create blood analysis display
     */
    createBloodAnalysisDisplay() {
        const fluidDisplay = document.querySelector('.fluid-display');
        if (!fluidDisplay) return;

        const analysisDisplay = document.createElement('div');
        analysisDisplay.className = 'blood-analysis';
        analysisDisplay.innerHTML = `
            <div class="analysis-header">
                <span class="analysis-label">Blood Analysis</span>
            </div>
            <div class="analysis-grid">
                <div class="analysis-item">
                    <span class="analysis-name">O₂ Sat</span>
                    <span class="analysis-value" id="oxygenation">98%</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-name">Temp</span>
                    <span class="analysis-value" id="temperature">37.0°C</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-name">Viscosity</span>
                    <span class="analysis-value" id="viscosityDisplay">2.0x</span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-name">Pressure</span>
                    <span class="analysis-value" id="pressure">120 mmHg</span>
                </div>
            </div>
        `;

        fluidDisplay.appendChild(analysisDisplay);
    }

    /**
     * Initialize flow visualization canvas
     */
    initializeFlowCanvas() {
        this.flowCanvas = document.getElementById('flowCanvas');
        if (!this.flowCanvas) return;

        this.flowCtx = this.flowCanvas.getContext('2d');
        this.flowData = new Array(40).fill(0);
        
        // Start flow animation
        this.startFlowAnimation();
    }

    /**
     * Start flow visualization animation
     */
    startFlowAnimation() {
        const animate = () => {
            this.updateFlowVisualization();
            requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Update flow visualization
     */
    updateFlowVisualization() {
        if (!this.flowCtx) return;

        const canvas = this.flowCanvas;
        const ctx = this.flowCtx;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Shift data and add new point
        this.flowData.shift();
        const newValue = this.fluidMonitor.isFlowing ? 
            25 + Math.sin(performance.now() * 0.005) * 15 + 
            (Math.random() - 0.5) * this.flowPatterns[this.currentFlowPattern].turbulence * 20 : 25;
        this.flowData.push(newValue);
        
        // Draw flow line
        const color = this.fluidMonitor.isFlowing ? '#3b82f6' : '#6b7280';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.flowData.forEach((value, index) => {
            const x = (index / (this.flowData.length - 1)) * canvas.width;
            const y = canvas.height - value;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw baseline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 25);
        ctx.lineTo(canvas.width, canvas.height - 25);
        ctx.stroke();
        
        // Add flow particles for active flow
        if (this.fluidMonitor.isFlowing) {
            this.drawFlowParticles(ctx, canvas);
        }
    }

    /**
     * Draw flow particles for visual effect
     */
    drawFlowParticles(ctx, canvas) {
        const time = performance.now() * 0.001;
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const x = ((time * 50 + i * 40) % (canvas.width + 20)) - 10;
            const y = canvas.height - 25 + Math.sin(time * 2 + i) * 5;
            
            ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + Math.sin(time * 3 + i) * 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Update fluid display
     */
    updateFluidDisplay() {
        // Update level fill
        const levelFill = document.getElementById('fluidLevelFill');
        const levelTarget = document.getElementById('fluidLevelTarget');
        const levelCurrent = document.getElementById('fluidLevelCurrent');
        const fluidVolume = document.getElementById('fluidVolume');
        
        if (levelFill) {
            const percentage = this.fluidMonitor.currentLevel * 100;
            levelFill.style.height = `${percentage}%`;
        }
        
        if (levelTarget) {
            const targetPercentage = this.fluidMonitor.targetLevel * 100;
            levelTarget.style.bottom = `${targetPercentage}%`;
        }
        
        if (levelCurrent) {
            levelCurrent.textContent = `${(this.fluidMonitor.currentLevel * 100).toFixed(1)}%`;
        }
        
        if (fluidVolume) {
            fluidVolume.textContent = `${this.fluidMonitor.totalVolume} ml`;
        }

        // Update flow rate
        const flowRate = document.getElementById('flowRate');
        if (flowRate) {
            const rate = Math.abs(this.fluidMonitor.fillRate * 1000); // Convert to ml/s
            flowRate.textContent = rate.toFixed(1);
        }

        // Update flow direction
        const flowDirection = document.getElementById('flowDirection');
        if (flowDirection) {
            const direction = this.fluidMonitor.flowDirection;
            flowDirection.textContent = direction.charAt(0).toUpperCase() + direction.slice(1);
            flowDirection.className = `direction-value ${direction}`;
        }

        // Update flow pattern
        const patternElement = document.getElementById('flowPatternName');
        if (patternElement) {
            patternElement.textContent = this.currentFlowPattern.charAt(0).toUpperCase() + 
                                       this.currentFlowPattern.slice(1);
        }

        // Update blood analysis
        this.updateBloodAnalysisDisplay();
    }

    /**
     * Update blood analysis display
     */
    updateBloodAnalysisDisplay() {
        const oxygenation = document.getElementById('oxygenation');
        const temperature = document.getElementById('temperature');
        const viscosityDisplay = document.getElementById('viscosityDisplay');
        const pressure = document.getElementById('pressure');
        
        if (oxygenation) {
            oxygenation.textContent = `${this.bloodProperties.oxygenation.toFixed(1)}%`;
            oxygenation.className = `analysis-value ${this.getOxygenationClass()}`;
        }
        
        if (temperature) {
            temperature.textContent = `${this.bloodProperties.temperature.toFixed(1)}°C`;
        }
        
        if (viscosityDisplay) {
            viscosityDisplay.textContent = `${this.fluidMonitor.viscosity.toFixed(1)}x`;
        }
        
        if (pressure) {
            pressure.textContent = `${this.bloodProperties.pressure.toFixed(0)} mmHg`;
            pressure.className = `analysis-value ${this.getPressureClass()}`;
        }
    }

    /**
     * Get CSS class for oxygenation level
     */
    getOxygenationClass() {
        const o2 = this.bloodProperties.oxygenation;
        if (o2 >= 95) return 'normal';
        if (o2 >= 90) return 'warning';
        return 'critical';
    }

    /**
     * Get CSS class for pressure level
     */
    getPressureClass() {
        const pressure = this.bloodProperties.pressure;
        if (pressure >= 140) return 'high';
        if (pressure <= 90) return 'low';
        return 'normal';
    }

    /**
     * Update flow status display
     * @param {boolean} isFlowing - Whether flow is active
     */
    updateFlowStatusDisplay(isFlowing) {
        const statusElement = document.getElementById('flowStatus');
        const indicatorElement = document.getElementById('flowIndicator');
        
        if (statusElement) {
            statusElement.textContent = isFlowing ? 'Flowing' : 'Stopped';
            statusElement.className = `flow-status ${isFlowing ? 'active' : 'stopped'}`;
        }
        
        if (indicatorElement) {
            indicatorElement.className = `flow-indicator ${isFlowing ? 'active' : 'stopped'}`;
        }
    }

    /**
     * Show visual feedback for flow rate changes
     */
    showFlowRateChange(rate) {
        const bloodSection = document.querySelector('[data-section-id="blood"]');
        if (!bloodSection) return;

        bloodSection.classList.add('rate-changing');
        
        setTimeout(() => {
            bloodSection.classList.remove('rate-changing');
        }, 1000);
    }

    /**
     * Show visual feedback for viscosity changes
     */
    showViscosityChange(viscosity) {
        this.showParameterChange('viscosity', viscosity);
    }

    /**
     * Show visual feedback for blood level changes
     */
    showBloodLevelChange(level) {
        this.showParameterChange('level', level);
    }

    /**
     * Generic parameter change feedback
     */
    showParameterChange(paramType, value) {
        const fluidDisplay = document.querySelector('.fluid-display');
        if (!fluidDisplay) return;

        fluidDisplay.classList.add(`${paramType}-changing`);
        
        setTimeout(() => {
            fluidDisplay.classList.remove(`${paramType}-changing`);
        }, 500);
    }

    /**
     * Drain all blood from the jar
     */
    drainBlood() {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            fluidSim.currentLevel = 0;
            fluidSim.targetLevel = 0;
            fluidSim.stopFilling();
            
            // Reset monitoring
            this.fluidMonitor.currentLevel = 0;
            this.fluidMonitor.targetLevel = 0;
            this.fluidMonitor.isFlowing = false;
            this.fluidMonitor.flowDirection = 'static';
            
            // Update display
            this.updateFluidDisplay();
            this.updateFlowStatusDisplay(false);
        }
    }

    /**
     * Start fluid monitoring
     */
    startFluidMonitoring() {
        this.fluidMonitor.isFlowing = false;
    }

    /**
     * Stop fluid monitoring
     */
    stopFluidMonitoring() {
        if (this.flowCheckInterval) {
            clearInterval(this.flowCheckInterval);
        }
    }

    /**
     * Get current fluid statistics
     */
    getFluidStatistics() {
        return {
            currentLevel: this.fluidMonitor.currentLevel,
            targetLevel: this.fluidMonitor.targetLevel,
            fillRate: this.fluidMonitor.fillRate,
            totalVolume: this.fluidMonitor.totalVolume,
            isFlowing: this.fluidMonitor.isFlowing,
            flowDirection: this.fluidMonitor.flowDirection,
            flowPattern: this.currentFlowPattern,
            viscosity: this.fluidMonitor.viscosity,
            bloodProperties: { ...this.bloodProperties }
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopFluidMonitoring();
        
        // Remove fluid display elements
        const fluidDisplay = document.querySelector('.fluid-display');
        if (fluidDisplay) {
            fluidDisplay.remove();
        }
        
        // Clear intervals
        if (this.flowCheckInterval) {
            clearInterval(this.flowCheckInterval);
        }
    }
}