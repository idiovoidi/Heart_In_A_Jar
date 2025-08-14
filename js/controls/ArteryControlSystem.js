import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Specialized artery growth control system with real-time monitoring
 * and advanced vascular development management
 */
export class ArteryControlSystem {
    constructor(sceneManager, parameterController, eventSystem) {
        this.sceneManager = sceneManager;
        this.parameterController = parameterController;
        this.eventSystem = eventSystem;
        
        // Artery monitoring state
        this.arteryMonitor = {
            totalBranches: 0,
            activeBranches: 0,
            growthRate: 0, // branches per second
            lastGrowthTime: 0,
            growthHistory: [],
            isGrowthActive: false,
            queueSize: 0
        };
        
        // Growth patterns
        this.growthPatterns = {
            slow: { speed: 200, branchingFactor: 1.2, maxBranches: 30 },
            normal: { speed: 50, branchingFactor: 1.5, maxBranches: 50 },
            fast: { speed: 25, branchingFactor: 1.8, maxBranches: 80 },
            rapid: { speed: 10, branchingFactor: 2.0, maxBranches: 120 }
        };
        
        this.currentPattern = 'normal';
        this.growthStats = {
            startTime: 0,
            totalGrowthTime: 0,
            averageGrowthRate: 0
        };
        
        this.init();
    }

    /**
     * Initialize the artery control system
     */
    init() {
        try {
            this.setupArteryMonitoring();
            this.setupParameterCallbacks();
            this.setupRealTimeDisplay();
            this.startArteryMonitoring();
            this.debugArterySystem();
            
            console.log('ArteryControlSystem initialized successfully');
        } catch (error) {
            console.error('Error initializing ArteryControlSystem:', error);
            ErrorDecorator.logError(error, 'ArteryControlSystem.init');
        }
    }

    /**
     * Debug the artery system to understand current state
     */
    debugArterySystem() {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            console.log('Artery System Debug Info:');
            console.log('- Is Growing:', arterySim.isGrowing);
            console.log('- Branch Count:', arterySim.branchCount);
            console.log('- Max Branches:', arterySim.maxBranches);
            console.log('- Growth Speed:', arterySim.growthSpeed);
            console.log('- Queue Size:', arterySim.growthQueue.length);
            console.log('- Total Arteries:', arterySim.arteries.length);
            
            // Check if arteries are visible
            if (arterySim.arteries.length > 0) {
                const firstArtery = arterySim.arteries[0];
                console.log('- First Artery Visible:', firstArtery.mesh.isVisible);
                console.log('- First Artery Position:', firstArtery.mesh.position);
                console.log('- First Artery Scaling:', firstArtery.mesh.scaling);
            }
            
            // Force restart growth if it's stuck
            if (!arterySim.isGrowing && arterySim.branchCount < arterySim.maxBranches) {
                console.log('Restarting stuck artery growth...');
                arterySim.isGrowing = true;
                if (arterySim.growthQueue.length === 0) {
                    arterySim.createArterySystem();
                } else {
                    arterySim.processGrowthQueue();
                }
            }
        } else {
            console.warn('ArterySimulation not found in scene manager');
        }
    }

    /**
     * Setup artery monitoring system
     */
    setupArteryMonitoring() {
        // Initialize monitoring with current state
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            this.arteryMonitor.totalBranches = arterySim.branchCount;
            this.arteryMonitor.isGrowthActive = arterySim.isGrowing;
            this.arteryMonitor.queueSize = arterySim.growthQueue.length;
        }
        
        // Setup growth tracking
        this.setupGrowthTracking();
    }

    /**
     * Setup growth tracking system
     */
    setupGrowthTracking() {
        this.lastBranchCount = this.arteryMonitor.totalBranches;
        this.growthCheckInterval = setInterval(() => {
            this.updateGrowthStats();
        }, 1000); // Check every second
    }

    /**
     * Update growth statistics
     */
    updateGrowthStats() {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (!arterySim) return;

        const currentBranches = arterySim.branchCount;
        const currentTime = performance.now();
        
        // Update basic stats
        this.arteryMonitor.totalBranches = currentBranches;
        this.arteryMonitor.queueSize = arterySim.growthQueue.length;
        this.arteryMonitor.isGrowthActive = arterySim.isGrowing && arterySim.growthQueue.length > 0;
        
        // Calculate growth rate
        if (this.arteryMonitor.lastGrowthTime > 0) {
            const timeDiff = (currentTime - this.arteryMonitor.lastGrowthTime) / 1000;
            const branchDiff = currentBranches - this.lastBranchCount;
            
            if (branchDiff > 0) {
                this.arteryMonitor.growthRate = branchDiff / timeDiff;
                this.arteryMonitor.growthHistory.push({
                    time: currentTime,
                    branches: currentBranches,
                    rate: this.arteryMonitor.growthRate
                });
                
                // Keep only last 20 readings
                if (this.arteryMonitor.growthHistory.length > 20) {
                    this.arteryMonitor.growthHistory.shift();
                }
                
                // Calculate average growth rate
                if (this.arteryMonitor.growthHistory.length > 0) {
                    const totalRate = this.arteryMonitor.growthHistory.reduce((sum, entry) => sum + entry.rate, 0);
                    this.growthStats.averageGrowthRate = totalRate / this.arteryMonitor.growthHistory.length;
                }
            }
        }
        
        this.arteryMonitor.lastGrowthTime = currentTime;
        this.lastBranchCount = currentBranches;
        
        // Update display
        this.updateArteryDisplay();
        
        // Trigger growth event
        this.eventSystem.emit('arteryGrowth', 'arteries', {
            totalBranches: currentBranches,
            growthRate: this.arteryMonitor.growthRate,
            isActive: this.arteryMonitor.isGrowthActive,
            queueSize: this.arteryMonitor.queueSize
        });
    }

    /**
     * Setup parameter change callbacks
     */
    setupParameterCallbacks() {
        // Growth speed callback
        this.parameterController.registerCallback('arteryGrowthSpeed', (value) => {
            this.onGrowthSpeedChange(value);
        });

        // Max branches callback
        this.parameterController.registerCallback('arteryMaxBranches', (value) => {
            this.onMaxBranchesChange(value);
        });

        // Artery thickness callback
        this.parameterController.registerCallback('arteryThickness', (value) => {
            this.onArteryThicknessChange(value);
        });

        // Growth toggle callback
        this.parameterController.registerCallback('arteryGrowth', (value) => {
            this.onGrowthToggle(value);
        });
    }

    /**
     * Handle growth speed changes
     * @param {number} speed - New growth speed (milliseconds)
     */
    onGrowthSpeedChange(speed) {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            arterySim.growthSpeed = speed;
            
            // Update growth pattern based on speed
            if (speed <= 25) {
                this.currentPattern = 'rapid';
            } else if (speed <= 50) {
                this.currentPattern = 'fast';
            } else if (speed <= 100) {
                this.currentPattern = 'normal';
            } else {
                this.currentPattern = 'slow';
            }
            
            // Restart growth if it was active
            if (arterySim.isGrowing && arterySim.growthQueue.length > 0) {
                arterySim.processGrowthQueue();
            }
        }
        
        this.showGrowthSpeedChange(speed);
    }

    /**
     * Handle max branches changes
     * @param {number} maxBranches - New maximum branches
     */
    onMaxBranchesChange(maxBranches) {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            arterySim.maxBranches = maxBranches;
            
            // Resume growth if we're under the new limit
            if (arterySim.branchCount < maxBranches && !arterySim.isGrowing) {
                arterySim.isGrowing = true;
                if (arterySim.growthQueue.length > 0) {
                    arterySim.processGrowthQueue();
                }
            }
        }
        
        this.showMaxBranchesChange(maxBranches);
    }

    /**
     * Handle artery thickness changes
     * @param {number} thickness - New default radius
     */
    onArteryThicknessChange(thickness) {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            arterySim.defaultRadius = thickness;
        }
        
        this.showThicknessChange(thickness);
    }

    /**
     * Handle growth toggle
     * @param {boolean} isGrowing - Whether growth is enabled
     */
    onGrowthToggle(isGrowing) {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            arterySim.isGrowing = isGrowing;
            
            if (isGrowing) {
                // Resume growth
                if (arterySim.growthQueue.length > 0) {
                    arterySim.processGrowthQueue();
                } else if (arterySim.branchCount < arterySim.maxBranches) {
                    // Restart growth system if queue is empty but we can still grow
                    arterySim.createArterySystem();
                }
                this.growthStats.startTime = performance.now();
            }
        }
        
        this.arteryMonitor.isGrowthActive = isGrowing;
        this.updateGrowthStatusDisplay(isGrowing);
    }

    /**
     * Setup real-time artery display
     */
    setupRealTimeDisplay() {
        this.createArteryDisplay();
        this.createGrowthVisualization();
        this.createArteryStatusIndicators();
    }

    /**
     * Create artery monitoring display
     */
    createArteryDisplay() {
        const arterySection = document.querySelector('[data-section-id="arteries"]');
        if (!arterySection) return;

        const arteryDisplay = document.createElement('div');
        arteryDisplay.className = 'artery-display';
        arteryDisplay.innerHTML = `
            <div class="artery-monitor">
                <div class="artery-header">
                    <span class="artery-icon">🩸</span>
                    <span class="artery-label">Vascular Growth</span>
                </div>
                <div class="artery-stats">
                    <div class="artery-count">
                        <span class="count-number" id="arteryCount">0</span>
                        <span class="count-unit">branches</span>
                    </div>
                    <div class="artery-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="arteryProgress"></div>
                        </div>
                        <span class="progress-text" id="arteryProgressText">0%</span>
                    </div>
                </div>
                <div class="growth-info">
                    <div class="growth-rate">
                        <span class="rate-label">Growth Rate:</span>
                        <span class="rate-value" id="growthRate">0.0</span>
                        <span class="rate-unit">branches/sec</span>
                    </div>
                    <div class="queue-size">
                        <span class="queue-label">Queue:</span>
                        <span class="queue-value" id="queueSize">0</span>
                    </div>
                </div>
                <div class="artery-status">
                    <span class="growth-status" id="growthStatus">Stopped</span>
                    <div class="growth-indicator" id="growthIndicator"></div>
                </div>
            </div>
        `;

        // Insert after the section header
        const sectionContent = arterySection.querySelector('.section-content');
        if (sectionContent) {
            sectionContent.insertBefore(arteryDisplay, sectionContent.firstChild);
        }
    }

    /**
     * Create growth visualization
     */
    createGrowthVisualization() {
        const arteryDisplay = document.querySelector('.artery-display');
        if (!arteryDisplay) return;

        const growthViz = document.createElement('div');
        growthViz.className = 'growth-visualization';
        growthViz.innerHTML = `
            <div class="growth-header">
                <span class="growth-label">Growth Pattern</span>
                <span class="pattern-name" id="patternName">Normal</span>
            </div>
            <div class="growth-graph">
                <canvas id="growthCanvas" width="200" height="60"></canvas>
            </div>
        `;

        arteryDisplay.appendChild(growthViz);
        
        // Initialize growth canvas
        this.initializeGrowthCanvas();
    }

    /**
     * Initialize growth visualization canvas
     */
    initializeGrowthCanvas() {
        this.growthCanvas = document.getElementById('growthCanvas');
        if (!this.growthCanvas) return;

        this.growthCtx = this.growthCanvas.getContext('2d');
        this.growthData = new Array(50).fill(0);
        
        // Start growth animation
        this.startGrowthAnimation();
    }

    /**
     * Start growth visualization animation
     */
    startGrowthAnimation() {
        const animate = () => {
            this.updateGrowthVisualization();
            requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Update growth visualization
     */
    updateGrowthVisualization() {
        if (!this.growthCtx) return;

        const canvas = this.growthCanvas;
        const ctx = this.growthCtx;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Shift data and add new point
        this.growthData.shift();
        this.growthData.push(this.arteryMonitor.totalBranches);
        
        // Find max value for scaling
        const maxValue = Math.max(...this.growthData, 1);
        
        // Draw growth line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.growthData.forEach((value, index) => {
            const x = (index / (this.growthData.length - 1)) * canvas.width;
            const y = canvas.height - (value / maxValue) * (canvas.height - 10) - 5;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 1; i < 4; i++) {
            const y = (i / 4) * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw current value indicator
        if (this.growthData.length > 0) {
            const lastValue = this.growthData[this.growthData.length - 1];
            const y = canvas.height - (lastValue / maxValue) * (canvas.height - 10) - 5;
            
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(canvas.width - 5, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Create artery status indicators
     */
    createArteryStatusIndicators() {
        // Status indicators are created as part of the artery display
        this.updateGrowthStatusDisplay(this.arteryMonitor.isGrowthActive);
    }

    /**
     * Update artery display
     */
    updateArteryDisplay() {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (!arterySim) return;

        // Update branch count
        const countElement = document.getElementById('arteryCount');
        if (countElement) {
            countElement.textContent = this.arteryMonitor.totalBranches;
        }

        // Update progress bar
        const progressFill = document.getElementById('arteryProgress');
        const progressText = document.getElementById('arteryProgressText');
        if (progressFill && progressText) {
            const progress = (this.arteryMonitor.totalBranches / arterySim.maxBranches) * 100;
            progressFill.style.width = `${Math.min(100, progress)}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }

        // Update growth rate
        const rateElement = document.getElementById('growthRate');
        if (rateElement) {
            rateElement.textContent = this.arteryMonitor.growthRate.toFixed(1);
        }

        // Update queue size
        const queueElement = document.getElementById('queueSize');
        if (queueElement) {
            queueElement.textContent = this.arteryMonitor.queueSize;
        }

        // Update pattern name
        const patternElement = document.getElementById('patternName');
        if (patternElement) {
            patternElement.textContent = this.currentPattern.charAt(0).toUpperCase() + this.currentPattern.slice(1);
        }
    }

    /**
     * Update growth status display
     * @param {boolean} isGrowing - Whether growth is active
     */
    updateGrowthStatusDisplay(isGrowing) {
        const statusElement = document.getElementById('growthStatus');
        const indicatorElement = document.getElementById('growthIndicator');
        
        if (statusElement) {
            statusElement.textContent = isGrowing ? 'Growing' : 'Stopped';
            statusElement.className = `growth-status ${isGrowing ? 'active' : 'stopped'}`;
        }
        
        if (indicatorElement) {
            indicatorElement.className = `growth-indicator ${isGrowing ? 'active' : 'stopped'}`;
        }
    }

    /**
     * Show visual feedback for growth speed changes
     * @param {number} speed - New speed value
     */
    showGrowthSpeedChange(speed) {
        const arterySection = document.querySelector('[data-section-id="arteries"]');
        if (!arterySection) return;

        arterySection.classList.add('speed-changing');
        
        setTimeout(() => {
            arterySection.classList.remove('speed-changing');
        }, 1000);
    }

    /**
     * Show visual feedback for max branches changes
     * @param {number} maxBranches - New max branches value
     */
    showMaxBranchesChange(maxBranches) {
        this.showParameterChange('branches', maxBranches);
    }

    /**
     * Show visual feedback for thickness changes
     * @param {number} thickness - New thickness value
     */
    showThicknessChange(thickness) {
        this.showParameterChange('thickness', thickness);
    }

    /**
     * Generic parameter change feedback
     * @param {string} paramType - Type of parameter
     * @param {number} value - New value
     */
    showParameterChange(paramType, value) {
        const arteryDisplay = document.querySelector('.artery-display');
        if (!arteryDisplay) return;

        arteryDisplay.classList.add(`${paramType}-changing`);
        
        setTimeout(() => {
            arteryDisplay.classList.remove(`${paramType}-changing`);
        }, 500);
    }

    /**
     * Reset artery system
     */
    resetArterySystem() {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            arterySim.reset();
            
            // Reset monitoring
            this.arteryMonitor.totalBranches = 0;
            this.arteryMonitor.growthHistory = [];
            this.arteryMonitor.growthRate = 0;
            this.growthStats.startTime = performance.now();
            
            // Update display
            this.updateArteryDisplay();
            this.updateGrowthStatusDisplay(true);
        }
    }

    /**
     * Force growth restart (for debugging stuck growth)
     */
    forceGrowthRestart() {
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim) {
            console.log('Forcing artery growth restart...');
            
            // Enable growth
            arterySim.isGrowing = true;
            
            // If queue is empty, recreate growth points
            if (arterySim.growthQueue.length === 0 && arterySim.branchCount < arterySim.maxBranches) {
                arterySim.createArterySystem();
            } else {
                arterySim.processGrowthQueue();
            }
            
            this.updateGrowthStatusDisplay(true);
        }
    }

    /**
     * Start artery monitoring
     */
    startArteryMonitoring() {
        this.arteryMonitor.isGrowthActive = true;
        this.growthStats.startTime = performance.now();
    }

    /**
     * Stop artery monitoring
     */
    stopArteryMonitoring() {
        if (this.growthCheckInterval) {
            clearInterval(this.growthCheckInterval);
        }
    }

    /**
     * Get current artery statistics
     * @returns {Object} Artery statistics
     */
    getArteryStatistics() {
        const arterySim = this.sceneManager.getEntity('arterySim');
        return {
            totalBranches: this.arteryMonitor.totalBranches,
            maxBranches: arterySim ? arterySim.maxBranches : 0,
            growthRate: this.arteryMonitor.growthRate,
            averageGrowthRate: this.growthStats.averageGrowthRate,
            isGrowing: this.arteryMonitor.isGrowthActive,
            queueSize: this.arteryMonitor.queueSize,
            pattern: this.currentPattern,
            growthHistory: [...this.arteryMonitor.growthHistory]
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopArteryMonitoring();
        
        // Remove artery display elements
        const arteryDisplay = document.querySelector('.artery-display');
        if (arteryDisplay) {
            arteryDisplay.remove();
        }
        
        // Clear intervals
        if (this.growthCheckInterval) {
            clearInterval(this.growthCheckInterval);
        }
    }
}