import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Specialized heart control system with real-time BPM monitoring
 * and advanced cardiac parameter management
 */
export class HeartControlSystem {
    constructor(sceneManager, parameterController, eventSystem) {
        this.sceneManager = sceneManager;
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        
        // Heart monitoring state
        this.heartMonitor = {
            currentBPM: 0,
            averageBPM: 0,
            bpmHistory: [],
            lastBeatTime: 0,
            beatCount: 0,
            isMonitoring: false
        };
        
        // Heart rhythm patterns
        this.rhythmPatterns = {
            normal: { variation: 0.05, irregularity: 0.02 },
            tachycardia: { variation: 0.03, irregularity: 0.01 },
            bradycardia: { variation: 0.08, irregularity: 0.04 },
            arrhythmia: { variation: 0.15, irregularity: 0.12 }
        };
        
        this.currentRhythm = 'normal';
        this.heartRateVariability = 0.05;
        
        this.init();
    }

    /**
     * Initialize the heart control system
     */
    init() {
        try {
            this.setupHeartMonitoring();
            this.setupParameterCallbacks();
            this.setupRealTimeBPMDisplay();
            this.startHeartMonitoring();
            
            console.log('HeartControlSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing HeartControlSystem:', error);
            ErrorDecorator.logError(error, 'HeartControlSystem.init');
        }
    }

    /**
     * Setup heart monitoring system
     */
    setupHeartMonitoring() {
        // Initialize BPM history with default values
        this.heartMonitor.bpmHistory = new Array(10).fill(60);
        this.heartMonitor.averageBPM = 60;
        this.heartMonitor.currentBPM = 60;
        
        // Setup beat detection
        this.setupBeatDetection();
    }

    /**
     * Setup beat detection based on heart animation
     */
    setupBeatDetection() {
        this.lastHeartPhase = 0;
        this.beatThreshold = 0.8; // Threshold for detecting a beat
        
        // Monitor heart simulation for beat detection
        this.beatDetectionInterval = setInterval(() => {
            this.detectHeartBeat();
        }, 50); // Check every 50ms for accurate beat detection
    }

    /**
     * Detect heart beats from the simulation
     */
    detectHeartBeat() {
        const heartSim = this.sceneManager.getEntity('heartSim');
        if (!heartSim || !heartSim.isBeating) return;

        // Calculate current heart phase
        const currentPhase = Math.sin(heartSim.time * 4);
        
        // Detect beat (transition from negative to positive phase)
        if (this.lastHeartPhase < 0 && currentPhase >= this.beatThreshold) {
            this.onHeartBeat();
        }
        
        this.lastHeartPhase = currentPhase;
    }

    /**
     * Handle detected heart beat
     */
    onHeartBeat() {
        const currentTime = performance.now();
        
        if (this.heartMonitor.lastBeatTime > 0) {
            // Calculate BPM from time between beats
            const timeDiff = currentTime - this.heartMonitor.lastBeatTime;
            const instantBPM = 60000 / timeDiff; // Convert ms to BPM
            
            // Apply heart rate variability
            const variableBPM = this.applyHeartRateVariability(instantBPM);
            
            // Update BPM history
            this.updateBPMHistory(variableBPM);
            
            // Update displays
            this.updateBPMDisplay();
        }
        
        this.heartMonitor.lastBeatTime = currentTime;
        this.heartMonitor.beatCount++;
        
        // Trigger beat event
        this.eventSystem.emit('heartBeat', 'heart', {
            bpm: this.heartMonitor.currentBPM,
            beatCount: this.heartMonitor.beatCount,
            timestamp: currentTime
        });
    }

    /**
     * Apply heart rate variability to BPM
     * @param {number} baseBPM - Base BPM value
     * @returns {number} BPM with variability applied
     */
    applyHeartRateVariability(baseBPM) {
        const pattern = this.rhythmPatterns[this.currentRhythm];
        const variation = (Math.random() - 0.5) * pattern.variation * baseBPM;
        const irregularity = (Math.random() - 0.5) * pattern.irregularity * baseBPM;
        
        return Math.max(30, Math.min(200, baseBPM + variation + irregularity));
    }

    /**
     * Update BPM history and calculate averages
     * @param {number} newBPM - New BPM value
     */
    updateBPMHistory(newBPM) {
        // Add new BPM to history
        this.heartMonitor.bpmHistory.push(newBPM);
        
        // Keep only last 10 readings
        if (this.heartMonitor.bpmHistory.length > 10) {
            this.heartMonitor.bpmHistory.shift();
        }
        
        // Calculate current and average BPM
        this.heartMonitor.currentBPM = Math.round(newBPM);
        this.heartMonitor.averageBPM = Math.round(
            this.heartMonitor.bpmHistory.reduce((sum, bpm) => sum + bpm, 0) / 
            this.heartMonitor.bpmHistory.length
        );
    }

    /**
     * Setup parameter change callbacks
     */
    setupParameterCallbacks() {
        // Heart beat speed callback
        this.parameterController.registerCallback('heartBeatSpeed', (value) => {
            this.onBeatSpeedChange(value);
        });

        // Heart beating toggle callback
        this.parameterController.registerCallback('heartBeating', (value) => {
            this.onBeatingToggle(value);
        });

        // Heart size callback
        this.parameterController.registerCallback('heartSize', (value) => {
            this.onHeartSizeChange(value);
        });

        // Contraction intensity callback
        this.parameterController.registerCallback('heartContractionIntensity', (value) => {
            this.onContractionIntensityChange(value);
        });
    }

    /**
     * Handle beat speed changes
     * @param {number} speed - New beat speed multiplier
     */
    onBeatSpeedChange(speed) {
        // Update rhythm pattern based on speed
        if (speed > 3.0) {
            this.currentRhythm = 'tachycardia';
        } else if (speed < 1.0) {
            this.currentRhythm = 'bradycardia';
        } else {
            this.currentRhythm = 'normal';
        }
        
        // Update expected BPM display
        this.updateExpectedBPM(speed);
        
        // Trigger visual feedback
        this.showHeartRateChange(speed);
    }

    /**
     * Handle beating toggle
     * @param {boolean} isBeating - Whether heart is beating
     */
    onBeatingToggle(isBeating) {
        this.heartMonitor.isMonitoring = isBeating;
        
        if (!isBeating) {
            // Reset monitoring when stopped
            this.heartMonitor.currentBPM = 0;
            this.heartMonitor.lastBeatTime = 0;
            this.updateBPMDisplay();
        }
        
        // Update UI state
        this.updateHeartStatusDisplay(isBeating);
    }

    /**
     * Handle heart size changes
     * @param {number} size - New heart size multiplier
     */
    onHeartSizeChange(size) {
        // Larger hearts might have slightly different beat characteristics
        const sizeEffect = (size - 0.4) / 1.6; // Normalize to 0-1 range
        this.heartRateVariability = 0.05 + (sizeEffect * 0.03);
        
        // Visual feedback for size change
        this.showHeartSizeChange(size);
    }

    /**
     * Handle contraction intensity changes
     * @param {number} intensity - New contraction intensity
     */
    onContractionIntensityChange(intensity) {
        // Higher intensity might affect rhythm slightly
        if (intensity > 1.5) {
            this.currentRhythm = 'tachycardia';
        } else if (intensity < 0.5) {
            this.currentRhythm = 'bradycardia';
        }
        
        // Visual feedback for intensity change
        this.showContractionIntensityChange(intensity);
    }

    /**
     * Setup real-time BPM display
     */
    setupRealTimeBPMDisplay() {
        // Create BPM display element
        this.createBPMDisplay();
        
        // Create heart rhythm visualization
        this.createRhythmVisualization();
        
        // Create heart status indicators
        this.createHeartStatusIndicators();
    }

    /**
     * Create BPM display element
     */
    createBPMDisplay() {
        const heartSection = document.querySelector('[data-section-id="heart"]');
        if (!heartSection) return;

        const bpmDisplay = document.createElement('div');
        bpmDisplay.className = 'bpm-display';
        bpmDisplay.innerHTML = `
            <div class="bpm-monitor">
                <div class="bpm-header">
                    <span class="bpm-icon">💓</span>
                    <span class="bpm-label">Heart Rate</span>
                </div>
                <div class="bpm-values">
                    <div class="bpm-current">
                        <span class="bpm-number" id="currentBPM">--</span>
                        <span class="bpm-unit">BPM</span>
                    </div>
                    <div class="bpm-average">
                        <span class="bpm-avg-label">Avg:</span>
                        <span class="bpm-avg-number" id="averageBPM">--</span>
                    </div>
                </div>
                <div class="bpm-status">
                    <span class="heart-status" id="heartStatus">Normal</span>
                    <div class="heart-indicator" id="heartIndicator"></div>
                </div>
            </div>
        `;

        // Insert after the section header
        const sectionContent = heartSection.querySelector('.section-content');
        if (sectionContent) {
            sectionContent.insertBefore(bpmDisplay, sectionContent.firstChild);
        }
    }

    /**
     * Create rhythm visualization
     */
    createRhythmVisualization() {
        const bpmDisplay = document.querySelector('.bpm-display');
        if (!bpmDisplay) return;

        const rhythmViz = document.createElement('div');
        rhythmViz.className = 'rhythm-visualization';
        rhythmViz.innerHTML = `
            <div class="rhythm-header">
                <span class="rhythm-label">Rhythm</span>
            </div>
            <div class="rhythm-graph">
                <canvas id="rhythmCanvas" width="200" height="40"></canvas>
            </div>
        `;

        bpmDisplay.appendChild(rhythmViz);
        
        // Initialize rhythm canvas
        this.initializeRhythmCanvas();
    }

    /**
     * Initialize rhythm visualization canvas
     */
    initializeRhythmCanvas() {
        this.rhythmCanvas = document.getElementById('rhythmCanvas');
        if (!this.rhythmCanvas) return;

        this.rhythmCtx = this.rhythmCanvas.getContext('2d');
        this.rhythmData = new Array(100).fill(0);
        
        // Start rhythm animation
        this.startRhythmAnimation();
    }

    /**
     * Start rhythm visualization animation
     */
    startRhythmAnimation() {
        const animate = () => {
            this.updateRhythmVisualization();
            requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Update rhythm visualization
     */
    updateRhythmVisualization() {
        if (!this.rhythmCtx || !this.heartMonitor.isMonitoring) return;

        const canvas = this.rhythmCanvas;
        const ctx = this.rhythmCtx;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Shift data and add new point
        this.rhythmData.shift();
        const heartSim = this.sceneManager.getEntity('heartSim');
        const newValue = heartSim && heartSim.isBeating ? 
            Math.sin(heartSim.time * 4) * 20 + 20 : 20;
        this.rhythmData.push(newValue);
        
        // Draw rhythm line
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.rhythmData.forEach((value, index) => {
            const x = (index / this.rhythmData.length) * canvas.width;
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
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width, canvas.height - 20);
        ctx.stroke();
    }

    /**
     * Create heart status indicators
     */
    createHeartStatusIndicators() {
        // Status indicators are created as part of the BPM display
        this.updateHeartStatusDisplay(true);
    }

    /**
     * Update BPM display
     */
    updateBPMDisplay() {
        const currentBPMElement = document.getElementById('currentBPM');
        const averageBPMElement = document.getElementById('averageBPM');
        
        if (currentBPMElement) {
            currentBPMElement.textContent = this.heartMonitor.isMonitoring ? 
                this.heartMonitor.currentBPM : '--';
        }
        
        if (averageBPMElement) {
            averageBPMElement.textContent = this.heartMonitor.isMonitoring ? 
                this.heartMonitor.averageBPM : '--';
        }
        
        // Update BPM color based on range
        this.updateBPMColor();
    }

    /**
     * Update BPM color based on heart rate range
     */
    updateBPMColor() {
        const currentBPMElement = document.getElementById('currentBPM');
        if (!currentBPMElement) return;

        const bpm = this.heartMonitor.currentBPM;
        let colorClass = 'bpm-normal';
        
        if (bpm > 100) {
            colorClass = 'bpm-high';
        } else if (bpm < 60 && bpm > 0) {
            colorClass = 'bpm-low';
        }
        
        // Remove existing color classes
        currentBPMElement.classList.remove('bpm-normal', 'bpm-high', 'bpm-low');
        currentBPMElement.classList.add(colorClass);
    }

    /**
     * Update expected BPM based on speed setting
     * @param {number} speed - Beat speed multiplier
     */
    updateExpectedBPM(speed) {
        // Base BPM is approximately 60, scaled by speed
        const expectedBPM = Math.round(60 * speed);
        
        // Update a display element if it exists
        const expectedElement = document.getElementById('expectedBPM');
        if (expectedElement) {
            expectedElement.textContent = expectedBPM;
        }
    }

    /**
     * Update heart status display
     * @param {boolean} isBeating - Whether heart is beating
     */
    updateHeartStatusDisplay(isBeating) {
        const statusElement = document.getElementById('heartStatus');
        const indicatorElement = document.getElementById('heartIndicator');
        
        if (statusElement) {
            statusElement.textContent = isBeating ? 
                this.getHeartStatusText() : 'Stopped';
            statusElement.className = `heart-status ${isBeating ? 'beating' : 'stopped'}`;
        }
        
        if (indicatorElement) {
            indicatorElement.className = `heart-indicator ${isBeating ? 'beating' : 'stopped'}`;
        }
    }

    /**
     * Get heart status text based on current rhythm
     * @returns {string} Status text
     */
    getHeartStatusText() {
        const bpm = this.heartMonitor.currentBPM;
        
        if (bpm > 100) return 'Tachycardia';
        if (bpm < 60 && bpm > 0) return 'Bradycardia';
        if (this.currentRhythm === 'arrhythmia') return 'Arrhythmia';
        return 'Normal';
    }

    /**
     * Show visual feedback for heart rate changes
     * @param {number} speed - New speed value
     */
    showHeartRateChange(speed) {
        const heartSection = document.querySelector('[data-section-id="heart"]');
        if (!heartSection) return;

        // Add visual feedback class
        heartSection.classList.add('parameter-changing');
        
        setTimeout(() => {
            heartSection.classList.remove('parameter-changing');
        }, 1000);
    }

    /**
     * Show visual feedback for heart size changes
     * @param {number} size - New size value
     */
    showHeartSizeChange(size) {
        // Could add size-specific visual feedback
        this.showParameterChange('size', size);
    }

    /**
     * Show visual feedback for contraction intensity changes
     * @param {number} intensity - New intensity value
     */
    showContractionIntensityChange(intensity) {
        // Could add intensity-specific visual feedback
        this.showParameterChange('intensity', intensity);
    }

    /**
     * Generic parameter change feedback
     * @param {string} paramType - Type of parameter
     * @param {number} value - New value
     */
    showParameterChange(paramType, value) {
        const bpmDisplay = document.querySelector('.bpm-display');
        if (!bpmDisplay) return;

        bpmDisplay.classList.add(`${paramType}-changing`);
        
        setTimeout(() => {
            bpmDisplay.classList.remove(`${paramType}-changing`);
        }, 500);
    }

    /**
     * Start heart monitoring
     */
    startHeartMonitoring() {
        this.heartMonitor.isMonitoring = true;
        
        // Start regular BPM updates
        this.bpmUpdateInterval = setInterval(() => {
            if (this.heartMonitor.isMonitoring) {
                this.updateBPMDisplay();
            }
        }, 1000);
    }

    /**
     * Stop heart monitoring
     */
    stopHeartMonitoring() {
        this.heartMonitor.isMonitoring = false;
        
        if (this.bpmUpdateInterval) {
            clearInterval(this.bpmUpdateInterval);
        }
        
        if (this.beatDetectionInterval) {
            clearInterval(this.beatDetectionInterval);
        }
    }

    /**
     * Get current heart statistics
     * @returns {Object} Heart statistics
     */
    getHeartStatistics() {
        return {
            currentBPM: this.heartMonitor.currentBPM,
            averageBPM: this.heartMonitor.averageBPM,
            beatCount: this.heartMonitor.beatCount,
            rhythm: this.currentRhythm,
            isBeating: this.heartMonitor.isMonitoring,
            bpmHistory: [...this.heartMonitor.bpmHistory]
        };
    }

    /**
     * Set heart rhythm pattern
     * @param {string} rhythm - Rhythm pattern name
     */
    setHeartRhythm(rhythm) {
        if (this.rhythmPatterns[rhythm]) {
            this.currentRhythm = rhythm;
            this.updateHeartStatusDisplay(this.heartMonitor.isMonitoring);
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopHeartMonitoring();
        
        // Remove BPM display elements
        const bpmDisplay = document.querySelector('.bpm-display');
        if (bpmDisplay) {
            bpmDisplay.remove();
        }
        
        // Clear intervals
        if (this.beatDetectionInterval) {
            clearInterval(this.beatDetectionInterval);
        }
        
        if (this.bpmUpdateInterval) {
            clearInterval(this.bpmUpdateInterval);
        }
    }
}