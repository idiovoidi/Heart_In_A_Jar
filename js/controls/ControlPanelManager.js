import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';
import { HeartControlSystem } from './HeartControlSystem.js';
import { ArteryControlSystem } from './ArteryControlSystem.js';
import { FluidControlSystem } from './FluidControlSystem.js';
import { EnvironmentControlSystem } from './EnvironmentControlSystem.js';
import { PresetManager } from './PresetManager.js';
import { PresetUI } from './PresetUI.js';
import { ParameterLinkingSystem } from './ParameterLinkingSystem.js';
import { AdvancedValidationSystem } from './AdvancedValidationSystem.js';
import { KeyboardShortcutSystem } from './KeyboardShortcutSystem.js';
import { ErrorHandlingSystem } from './ErrorHandlingSystem.js';
import { GracefulFallbackSystem } from './GracefulFallbackSystem.js';
import { ErrorLoggingSystem } from './ErrorLoggingSystem.js';
import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Advanced control panel manager that extends ButtonHandler functionality
 * Provides modular, parameter-driven UI generation with real-time updates
 */
export class ControlPanelManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.parameterController = new ParameterController(sceneManager);
        this.eventSystem = new ParameterEventSystem();
        this.heartControlSystem = new HeartControlSystem(sceneManager, this.parameterController, this.eventSystem);
        this.arteryControlSystem = new ArteryControlSystem(sceneManager, this.parameterController, this.eventSystem);
        this.fluidControlSystem = new FluidControlSystem(sceneManager, this.parameterController, this.eventSystem);
        this.environmentControlSystem = new EnvironmentControlSystem(sceneManager, this.parameterController, this.eventSystem);
        this.presetManager = new PresetManager(this.parameterController, this.eventSystem);
        this.presetUI = new PresetUI(this.presetManager, this.eventSystem);
        
        // Advanced features
        this.parameterLinkingSystem = new ParameterLinkingSystem(this.parameterController, this.eventSystem);
        this.validationSystem = new AdvancedValidationSystem(this.parameterController, this.eventSystem);
        this.keyboardShortcuts = new KeyboardShortcutSystem(this, this.parameterController, this.eventSystem);
        
        // Error handling and recovery systems
        this.errorLoggingSystem = new ErrorLoggingSystem();
        this.gracefulFallbackSystem = new GracefulFallbackSystem(sceneManager, this);
        this.errorHandlingSystem = new ErrorHandlingSystem(this);
        
        this.controlPanel = null;
        this.controlSections = new Map();
        this.activeControls = new Map();
        this.updateCallbacks = new Map();
        this.transitionQueue = new Map();
        
        // Configuration
        this.config = {
            autoUpdate: true,
            showTooltips: true,
            showValues: true,
            animateChanges: true,
            collapsibleSections: true,
            enableParameterLinking: true,
            enableAdvancedValidation: true,
            enableKeyboardShortcuts: true,
            enableErrorHandling: true,
            enableGracefulFallbacks: true,
            enableErrorLogging: true,
            smoothTransitions: true,
            transitionDuration: 300
        };
        
        this.init();
    }

    /**
     * Initialize the control panel
     */
    init() {
        try {
            this.createControlPanel();
            this.createControlSections();
            this.setupEventListeners();
            this.setupParameterCallbacks();
            
            console.log('ControlPanelManager initialized successfully');
        } catch (error) {
            console.error('Error initializing ControlPanelManager:', error);
            ErrorDecorator.logError(error, 'ControlPanelManager.init');
        }
    }

    /**
     * Create the main control panel container
     */
    createControlPanel() {
        // Remove existing panel if it exists
        const existingPanel = document.querySelector('.control-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Create main panel
        this.controlPanel = document.createElement('div');
        this.controlPanel.className = 'control-panel enhanced';
        this.controlPanel.innerHTML = `
            <div class="panel-header">
                <h3>Heart Simulation Controls</h3>
                <button class="panel-toggle" title="Collapse/Expand Panel">−</button>
            </div>
            <div class="panel-content">
                <!-- Control sections will be added here -->
            </div>
        `;
        
        document.body.appendChild(this.controlPanel);
        
        // Setup panel toggle
        const toggleBtn = this.controlPanel.querySelector('.panel-toggle');
        const content = this.controlPanel.querySelector('.panel-content');
        
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = content.style.display === 'none';
            content.style.display = isCollapsed ? 'block' : 'none';
            toggleBtn.textContent = isCollapsed ? '−' : '+';
            toggleBtn.title = isCollapsed ? 'Collapse Panel' : 'Expand Panel';
        });
    }

    /**
     * Create all control sections
     */
    createControlSections() {
        const content = this.controlPanel.querySelector('.panel-content');
        
        // Define section configurations
        const sections = [
            {
                id: 'heart',
                title: 'Heart Controls',
                icon: '❤️',
                parameters: ['heartBeating', 'heartBeatSpeed', 'heartSize', 'heartContractionIntensity']
            },
            {
                id: 'arteries',
                title: 'Artery System',
                icon: '🩸',
                parameters: ['arteryGrowth', 'arteryGrowthSpeed', 'arteryMaxBranches', 'arteryThickness']
            },
            {
                id: 'blood',
                title: 'Blood Flow',
                icon: '💧',
                parameters: ['bloodFlow', 'bloodFlowRate', 'bloodViscosity', 'bloodLevel']
            },
            {
                id: 'environment',
                title: 'Environment',
                icon: '🔬',
                parameters: ['overheadLight', 'fogDensity', 'postProcessing', 'cameraSensitivity']
            }
        ];

        sections.forEach(sectionConfig => {
            const section = this.createControlSection(sectionConfig);
            content.appendChild(section);
            this.controlSections.set(sectionConfig.id, section);
        });

        // Add action buttons section
        this.createActionSection(content);
    }

    /**
     * Create a control section
     * @param {Object} config - Section configuration
     * @returns {HTMLElement} Section element
     */
    createControlSection(config) {
        const section = document.createElement('div');
        section.className = 'control-section';
        section.dataset.sectionId = config.id;
        
        // Create section header
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <span class="section-icon">${config.icon}</span>
            <span class="section-title">${config.title}</span>
            <button class="section-toggle" title="Collapse/Expand Section">−</button>
        `;
        
        // Create section content
        const content = document.createElement('div');
        content.className = 'section-content';
        
        // Add controls for each parameter
        config.parameters.forEach(paramName => {
            const control = this.createParameterControl(paramName);
            if (control) {
                content.appendChild(control);
            }
        });
        
        section.appendChild(header);
        section.appendChild(content);
        
        // Setup section toggle with enhanced animations
        const toggleBtn = header.querySelector('.section-toggle');
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = section.classList.contains('collapsed');
            
            if (isCollapsed) {
                // Expanding
                section.classList.add('expanding');
                section.classList.remove('collapsed');
                toggleBtn.textContent = '−';
                
                setTimeout(() => {
                    section.classList.remove('expanding');
                }, 400);
            } else {
                // Collapsing
                section.classList.add('collapsing');
                section.classList.add('collapsed');
                toggleBtn.textContent = '+';
                
                setTimeout(() => {
                    section.classList.remove('collapsing');
                }, 400);
            }
        });
        
        return section;
    }

    /**
     * Create a parameter control element
     * @param {string} paramName - Parameter name
     * @returns {HTMLElement} Control element
     */
    createParameterControl(paramName) {
        const param = this.parameterController.getParameter(paramName);
        if (!param) {
            console.warn(`Parameter ${paramName} not found`);
            return null;
        }

        const controlContainer = document.createElement('div');
        controlContainer.className = 'parameter-control';
        controlContainer.dataset.parameter = paramName;

        let controlElement;
        
        switch (param.type) {
            case 'slider':
                controlElement = this.createSliderControl(paramName, param);
                break;
            case 'toggle':
                controlElement = this.createToggleControl(paramName, param);
                break;
            case 'button':
                controlElement = this.createButtonControl(paramName, param);
                break;
            default:
                console.warn(`Unknown parameter type: ${param.type}`);
                return null;
        }

        if (controlElement) {
            controlContainer.appendChild(controlElement);
            this.activeControls.set(paramName, controlElement);
        }

        return controlContainer;
    }

    /**
     * Create a slider control
     * @param {string} paramName - Parameter name
     * @param {Object} param - Parameter definition
     * @returns {HTMLElement} Slider control
     */
    createSliderControl(paramName, param) {
        const container = document.createElement('div');
        container.className = 'slider-control';
        
        const currentValue = this.parameterController.getCurrentValue(paramName);
        const formattedValue = this.parameterController.formatValue(paramName, currentValue);
        
        container.innerHTML = `
            <div class="control-header">
                <label class="control-label" for="${paramName}">${param.displayName}</label>
                <span class="control-value" data-param="${paramName}">${formattedValue}</span>
            </div>
            <div class="slider-container">
                <input 
                    type="range" 
                    id="${paramName}"
                    class="parameter-slider"
                    min="${param.min}" 
                    max="${param.max}" 
                    step="${param.step}" 
                    value="${currentValue}"
                    data-param="${paramName}"
                />
                <div class="slider-track-fill" style="width: ${this.getSliderPercentage(currentValue, param)}%"></div>
            </div>
            ${this.config.showTooltips ? `<div class="control-tooltip">${param.tooltip}</div>` : ''}
        `;

        // Setup slider event listeners
        const slider = container.querySelector('.parameter-slider');
        const valueDisplay = container.querySelector('.control-value');
        const trackFill = container.querySelector('.slider-track-fill');
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const formatted = this.parameterController.formatValue(paramName, value);
            
            // Update visual feedback
            valueDisplay.textContent = formatted;
            trackFill.style.width = `${this.getSliderPercentage(value, param)}%`;
            
            // Apply parameter with debouncing
            this.debounceParameterUpdate(paramName, value);
        });

        slider.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            this.applyParameterChange(paramName, value, 'slider');
        });

        return container;
    }

    /**
     * Create a toggle control
     * @param {string} paramName - Parameter name
     * @param {Object} param - Parameter definition
     * @returns {HTMLElement} Toggle control
     */
    createToggleControl(paramName, param) {
        const container = document.createElement('div');
        container.className = 'toggle-control';
        
        const currentValue = this.parameterController.getCurrentValue(paramName);
        
        container.innerHTML = `
            <div class="control-header">
                <label class="control-label" for="${paramName}">${param.displayName}</label>
                <div class="toggle-switch">
                    <input 
                        type="checkbox" 
                        id="${paramName}"
                        class="parameter-toggle"
                        ${currentValue ? 'checked' : ''}
                        data-param="${paramName}"
                    />
                    <span class="toggle-slider"></span>
                </div>
            </div>
            ${this.config.showTooltips ? `<div class="control-tooltip">${param.tooltip}</div>` : ''}
        `;

        // Setup toggle event listener
        const toggle = container.querySelector('.parameter-toggle');
        toggle.addEventListener('change', (e) => {
            const value = e.target.checked;
            this.applyParameterChange(paramName, value, 'toggle');
        });

        return container;
    }

    /**
     * Create a button control
     * @param {string} paramName - Parameter name
     * @param {Object} param - Parameter definition
     * @returns {HTMLElement} Button control
     */
    createButtonControl(paramName, param) {
        const container = document.createElement('div');
        container.className = 'button-control';
        
        container.innerHTML = `
            <button 
                class="parameter-button"
                data-param="${paramName}"
                title="${param.tooltip || param.description}"
            >
                ${param.displayName}
            </button>
            ${this.config.showTooltips ? `<div class="control-tooltip">${param.tooltip}</div>` : ''}
        `;

        // Setup button event listener
        const button = container.querySelector('.parameter-button');
        button.addEventListener('click', () => {
            this.handleButtonAction(paramName, param);
        });

        return container;
    }

    /**
     * Create action buttons section
     * @param {HTMLElement} parentElement - Parent element to append to
     */
    createActionSection(parentElement) {
        const section = document.createElement('div');
        section.className = 'control-section action-section';
        
        section.innerHTML = `
            <div class="section-header">
                <span class="section-icon">⚡</span>
                <span class="section-title">Actions</span>
            </div>
            <div class="section-content">
                <div class="action-buttons">
                    <button class="action-button reset-arteries" title="Reset and restart artery growth">
                        🔄 Reset Arteries
                    </button>
                    <button class="action-button force-growth" title="Force restart artery growth (debug)">
                        ⚡ Force Growth
                    </button>
                    <button class="action-button drain-blood" title="Drain all blood from the jar">
                        🚰 Drain Blood
                    </button>
                    <button class="action-button reset-view" title="Reset camera to default position">
                        📷 Reset View
                    </button>
                    <button class="action-button reset-all" title="Reset all parameters to defaults">
                        🏠 Reset All
                    </button>
                    <button class="action-button advanced-settings" title="Open advanced settings">
                        ⚙️ Advanced
                    </button>
                    <button class="action-button system-diagnostics" title="Show system diagnostics">
                        🔍 Diagnostics
                    </button>
                </div>
            </div>
        `;

        // Setup action button listeners
        const resetArteriesBtn = section.querySelector('.reset-arteries');
        const forceGrowthBtn = section.querySelector('.force-growth');
        const drainBloodBtn = section.querySelector('.drain-blood');
        const resetViewBtn = section.querySelector('.reset-view');
        const resetAllBtn = section.querySelector('.reset-all');
        const advancedBtn = section.querySelector('.advanced-settings');
        const diagnosticsBtn = section.querySelector('.system-diagnostics');

        resetArteriesBtn.addEventListener('click', () => this.resetArteries());
        forceGrowthBtn.addEventListener('click', () => this.forceGrowthRestart());
        drainBloodBtn.addEventListener('click', () => this.drainBlood());
        resetViewBtn.addEventListener('click', () => this.resetView());
        resetAllBtn.addEventListener('click', () => this.resetAllParameters());
        advancedBtn.addEventListener('click', () => this.showAdvancedSettings());
        diagnosticsBtn.addEventListener('click', () => this.showSystemDiagnostics());

        parentElement.appendChild(section);
    }

    /**
     * Setup event listeners for the control panel
     */
    setupEventListeners() {
        // Global parameter change listener
        this.eventSystem.addEventListener('change', '*', (event) => {
            this.updateControlDisplay(event.data.parameter, event.data.newValue);
        });

        // Parameter validation listener
        this.eventSystem.addEventListener('validate', '*', (event) => {
            this.handleValidationFeedback(event.data.parameter, event.data.isValid, event.data.error);
        });

        // Window resize listener with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.adjustPanelLayout();
            }, 150);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Touch and mouse interaction improvements
        this.setupTouchInteractions();
        
        // Accessibility enhancements
        this.setupAccessibilityFeatures();
        
        // Performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Setup parameter change callbacks
     */
    setupParameterCallbacks() {
        // Register callbacks for parameters that need special handling
        this.parameterController.registerCallback('arteryGrowthSpeed', (value) => {
            this.updateGrowthSpeedDisplay(value);
        });

        this.parameterController.registerCallback('arteryMaxBranches', (value) => {
            this.updateBranchCountDisplay(value);
        });

        this.parameterController.registerCallback('bloodLevel', (value) => {
            this.updateBloodLevelDisplay(value);
        });
    }

    /**
     * Apply a parameter change with advanced features
     * @param {string} paramName - Parameter name
     * @param {any} value - New value
     * @param {string} source - Source of change
     */
    applyParameterChange(paramName, value, source = 'ui') {
        // Pre-validation with advanced validation system
        if (this.config.enableAdvancedValidation) {
            const allParams = this.getCurrentParameterValues();
            const validationResult = this.validationSystem.validateParameter(paramName, value, allParams);
            
            if (!validationResult.valid) {
                this.showParameterFeedback(paramName, 'error');
                this.showValidationMessage(validationResult);
                this.updateControlDisplay(paramName, this.parameterController.getCurrentValue(paramName));
                return false;
            }
            
            // Show warnings if present
            if (validationResult.warning) {
                this.showValidationMessage(validationResult, 'warning');
            }
        }

        // Apply with smooth transition if enabled
        if (this.config.smoothTransitions && source !== 'transition') {
            this.applyWithSmoothTransition(paramName, value, source);
        } else {
            this.applyParameterImmediate(paramName, value, source);
        }
        
        return true;
    }

    /**
     * Apply parameter immediately without transition
     * @param {string} paramName - Parameter name
     * @param {any} value - New value
     * @param {string} source - Source of change
     */
    applyParameterImmediate(paramName, value, source) {
        const success = this.parameterController.applyParameter(paramName, value);
        
        if (success) {
            this.eventSystem.emitParameterChange(paramName, 
                this.parameterController.getCurrentValue(paramName), 
                value, 
                source
            );
            
            // Visual feedback for successful change
            this.showParameterFeedback(paramName, 'success');
        } else {
            // Visual feedback for failed change
            this.showParameterFeedback(paramName, 'error');
            
            // Revert UI to current value
            this.updateControlDisplay(paramName, this.parameterController.getCurrentValue(paramName));
        }
    }

    /**
     * Apply parameter with smooth transition
     * @param {string} paramName - Parameter name
     * @param {any} targetValue - Target value
     * @param {string} source - Source of change
     */
    applyWithSmoothTransition(paramName, targetValue, source) {
        const param = this.parameterController.getParameter(paramName);
        if (!param || param.type !== 'slider') {
            // Non-slider parameters don't need transitions
            this.applyParameterImmediate(paramName, targetValue, source);
            return;
        }

        // Cancel existing transition for this parameter
        if (this.transitionQueue.has(paramName)) {
            clearInterval(this.transitionQueue.get(paramName).intervalId);
        }

        const currentValue = this.parameterController.getCurrentValue(paramName);
        const valueDiff = targetValue - currentValue;
        
        // Skip transition for very small changes
        if (Math.abs(valueDiff) < (param.step || 0.01)) {
            this.applyParameterImmediate(paramName, targetValue, source);
            return;
        }

        const steps = Math.max(10, Math.abs(valueDiff) * 50);
        const stepSize = valueDiff / steps;
        const stepDuration = this.config.transitionDuration / steps;

        let currentStep = 0;
        const intervalId = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            
            // Use easing function for smooth transition
            const easedProgress = this.easeInOutCubic(progress);
            const newValue = currentValue + (valueDiff * easedProgress);

            // Apply the intermediate value
            this.applyParameterImmediate(paramName, newValue, 'transition');

            // Complete transition
            if (currentStep >= steps) {
                clearInterval(intervalId);
                this.transitionQueue.delete(paramName);
                this.applyParameterImmediate(paramName, targetValue, source);
            }
        }, stepDuration);

        this.transitionQueue.set(paramName, {
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
     * Update control display for a parameter
     * @param {string} paramName - Parameter name
     * @param {any} value - New value
     */
    updateControlDisplay(paramName, value) {
        const control = this.activeControls.get(paramName);
        if (!control) return;

        const param = this.parameterController.getParameter(paramName);
        if (!param) return;

        switch (param.type) {
            case 'slider':
                const slider = control.querySelector('.parameter-slider');
                const valueDisplay = control.querySelector('.control-value');
                const trackFill = control.querySelector('.slider-track-fill');
                
                if (slider) slider.value = value;
                if (valueDisplay) valueDisplay.textContent = this.parameterController.formatValue(paramName, value);
                if (trackFill) trackFill.style.width = `${this.getSliderPercentage(value, param)}%`;
                break;
                
            case 'toggle':
                const toggle = control.querySelector('.parameter-toggle');
                if (toggle) toggle.checked = value;
                break;
        }
    }

    /**
     * Show visual feedback for parameter changes
     * @param {string} paramName - Parameter name
     * @param {string} type - Feedback type ('success', 'error', 'warning')
     */
    showParameterFeedback(paramName, type) {
        const controlContainer = document.querySelector(`[data-parameter="${paramName}"]`);
        if (!controlContainer) return;

        // Add parameter-specific feedback
        controlContainer.classList.add(`feedback-${type}`);
        
        // Add section-level feedback
        const sectionElement = controlContainer.closest('.control-section');
        if (sectionElement) {
            sectionElement.classList.add('parameter-changing');
            setTimeout(() => {
                sectionElement.classList.remove('parameter-changing');
            }, 1200);
        }
        
        // Add value updating animation
        const valueDisplay = controlContainer.querySelector('.control-value');
        if (valueDisplay) {
            valueDisplay.classList.add('updating');
            setTimeout(() => {
                valueDisplay.classList.remove('updating');
            }, 600);
        }
        
        setTimeout(() => {
            controlContainer.classList.remove(`feedback-${type}`);
        }, 1000);
    }

    /**
     * Handle validation feedback
     * @param {string} paramName - Parameter name
     * @param {boolean} isValid - Validation result
     * @param {string} error - Error message
     */
    handleValidationFeedback(paramName, isValid, error) {
        if (!isValid) {
            this.showParameterFeedback(paramName, 'error');
            console.warn(`Validation failed for ${paramName}: ${error}`);
        }
    }

    /**
     * Calculate slider percentage for visual feedback
     * @param {number} value - Current value
     * @param {Object} param - Parameter definition
     * @returns {number} Percentage (0-100)
     */
    getSliderPercentage(value, param) {
        return ((value - param.min) / (param.max - param.min)) * 100;
    }

    /**
     * Debounce parameter updates to prevent excessive calls
     * @param {string} paramName - Parameter name
     * @param {any} value - New value
     */
    debounceParameterUpdate(paramName, value) {
        if (this.updateCallbacks.has(paramName)) {
            clearTimeout(this.updateCallbacks.get(paramName));
        }

        const timeoutId = setTimeout(() => {
            // Only apply if this is still the latest value
            const control = this.activeControls.get(paramName);
            if (control) {
                const currentInputValue = this.getCurrentInputValue(paramName);
                if (currentInputValue === value) {
                    this.applyParameterChange(paramName, value, 'slider-realtime');
                }
            }
            this.updateCallbacks.delete(paramName);
        }, 100); // 100ms debounce

        this.updateCallbacks.set(paramName, timeoutId);
    }

    /**
     * Get current input value for a parameter
     * @param {string} paramName - Parameter name
     * @returns {any} Current input value
     */
    getCurrentInputValue(paramName) {
        const control = this.activeControls.get(paramName);
        if (!control) return null;

        const param = this.parameterController.getParameter(paramName);
        if (!param) return null;

        switch (param.type) {
            case 'slider':
                const slider = control.querySelector('.parameter-slider');
                return slider ? parseFloat(slider.value) : null;
            case 'toggle':
                const toggle = control.querySelector('.parameter-toggle');
                return toggle ? toggle.checked : null;
            default:
                return null;
        }
    }

    /**
     * Handle button actions
     * @param {string} paramName - Parameter name
     * @param {Object} param - Parameter definition
     */
    handleButtonAction(paramName, param) {
        // This would be implemented based on specific button actions
        console.log(`Button action: ${paramName}`);
    }

    /**
     * Action methods
     */
    resetArteries() {
        if (this.arteryControlSystem) {
            this.arteryControlSystem.resetArterySystem();
            this.showGlobalFeedback('Arteries reset successfully', 'success');
        }
    }

    forceGrowthRestart() {
        if (this.arteryControlSystem) {
            this.arteryControlSystem.forceGrowthRestart();
            this.showGlobalFeedback('Artery growth restarted', 'success');
        }
    }

    drainBlood() {
        if (this.fluidControlSystem) {
            this.fluidControlSystem.drainBlood();
            this.showGlobalFeedback('Blood drained successfully', 'success');
        }
    }

    resetView() {
        if (this.sceneManager.camera && this.sceneManager.camera.resetView) {
            this.sceneManager.camera.resetView();
            this.showGlobalFeedback('Camera view reset', 'success');
        }
    }

    resetAllParameters() {
        this.parameterController.resetAllParameters();
        this.showGlobalFeedback('All parameters reset to defaults', 'success');
    }

    /**
     * Show global feedback message
     * @param {string} message - Message to show
     * @param {string} type - Message type
     */
    showGlobalFeedback(message, type = 'info') {
        // Create or update feedback element
        let feedback = document.querySelector('.global-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'global-feedback';
            document.body.appendChild(feedback);
        }

        feedback.textContent = message;
        feedback.className = `global-feedback ${type} show`;

        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }

    /**
     * Update specialized displays
     */
    updateGrowthSpeedDisplay(value) {
        // Could add specialized display for growth speed
    }

    updateBranchCountDisplay(value) {
        // Could add real-time branch count display
    }

    updateBloodLevelDisplay(value) {
        // Could add blood level indicator
    }

    /**
     * Adjust panel layout for different screen sizes
     */
    adjustPanelLayout() {
        if (!this.controlPanel) return;

        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Mobile layout adjustments
        if (width < 768) {
            this.controlPanel.classList.add('mobile');
            
            // Adjust for landscape mobile
            if (width > height && width < 768) {
                this.controlPanel.classList.add('landscape-mobile');
            } else {
                this.controlPanel.classList.remove('landscape-mobile');
            }
        } else {
            this.controlPanel.classList.remove('mobile', 'landscape-mobile');
        }
        
        // Ultra-wide screen adjustments
        if (width >= 1920) {
            this.controlPanel.classList.add('ultra-wide');
        } else {
            this.controlPanel.classList.remove('ultra-wide');
        }
        
        // Adjust content height based on available space
        const content = this.controlPanel.querySelector('.panel-content');
        if (content) {
            const headerHeight = this.controlPanel.querySelector('.panel-header').offsetHeight;
            const maxHeight = Math.min(height * 0.7, height - headerHeight - 40);
            content.style.maxHeight = `${maxHeight}px`;
        }
    }

    /**
     * Get current parameter values as object
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
     * Apply multiple parameter values
     * @param {Object} values - Parameter values to apply
     * @param {string} source - Source of changes
     */
    applyParameterValues(values, source = 'batch') {
        Object.entries(values).forEach(([name, value]) => {
            this.applyParameterChange(name, value, source);
        });
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when control panel is focused or no input is focused
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
        
        if (isInputFocused && !this.controlPanel.contains(activeElement)) {
            return;
        }

        // Toggle panel visibility (Ctrl/Cmd + H)
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            this.togglePanelVisibility();
            return;
        }

        // Reset all parameters (Ctrl/Cmd + R)
        if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
            e.preventDefault();
            this.resetAllParameters();
            return;
        }

        // Toggle heart beating (Space)
        if (e.key === ' ' && !isInputFocused) {
            e.preventDefault();
            const heartBeating = this.parameterController.getCurrentValue('heartBeating');
            this.applyParameterChange('heartBeating', !heartBeating, 'keyboard');
            return;
        }

        // Quick parameter adjustments with arrow keys
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const focusedSlider = document.activeElement;
            if (focusedSlider && focusedSlider.classList.contains('parameter-slider')) {
                e.preventDefault();
                const paramName = focusedSlider.dataset.param;
                const param = this.parameterController.getParameter(paramName);
                const currentValue = parseFloat(focusedSlider.value);
                const step = param.step || 1;
                const newValue = e.key === 'ArrowUp' ? 
                    Math.min(param.max, currentValue + step) : 
                    Math.max(param.min, currentValue - step);
                
                focusedSlider.value = newValue;
                this.applyParameterChange(paramName, newValue, 'keyboard');
            }
        }
    }

    /**
     * Toggle panel visibility
     */
    togglePanelVisibility() {
        if (!this.controlPanel) return;
        
        const isHidden = this.controlPanel.style.display === 'none';
        this.controlPanel.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
            this.controlPanel.classList.add('enhanced');
            this.showGlobalFeedback('Control panel shown', 'success');
        } else {
            this.showGlobalFeedback('Control panel hidden (Ctrl+H to show)', 'info');
        }
    }

    /**
     * Setup touch interactions for mobile devices
     */
    setupTouchInteractions() {
        if (!('ontouchstart' in window)) return;

        // Add touch-friendly classes
        this.controlPanel.classList.add('touch-device');

        // Improve slider interactions on touch devices
        const sliders = this.controlPanel.querySelectorAll('.parameter-slider');
        sliders.forEach(slider => {
            let touchStartValue = null;
            
            slider.addEventListener('touchstart', (e) => {
                touchStartValue = parseFloat(slider.value);
                slider.classList.add('touching');
            });
            
            slider.addEventListener('touchend', () => {
                slider.classList.remove('touching');
                const currentValue = parseFloat(slider.value);
                if (touchStartValue !== currentValue) {
                    const paramName = slider.dataset.param;
                    this.applyParameterChange(paramName, currentValue, 'touch');
                }
            });
        });

        // Add haptic feedback for supported devices
        if ('vibrate' in navigator) {
            this.controlPanel.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains('parameter-button') || 
                    e.target.classList.contains('action-button')) {
                    navigator.vibrate(10); // Short vibration
                }
            });
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
        // Add ARIA labels and descriptions
        this.controlPanel.setAttribute('role', 'region');
        this.controlPanel.setAttribute('aria-label', 'Heart Simulation Controls');

        // Add keyboard navigation support
        const focusableElements = this.controlPanel.querySelectorAll(
            'input, button, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });

        // Add focus management
        this.controlPanel.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e, focusableElements);
            }
        });

        // Add screen reader announcements for parameter changes
        this.eventSystem.addEventListener('change', '*', (event) => {
            this.announceParameterChange(event.data.parameter, event.data.newValue);
        });
    }

    /**
     * Handle tab navigation within the control panel
     * @param {KeyboardEvent} e - Keyboard event
     * @param {NodeList} focusableElements - Focusable elements
     */
    handleTabNavigation(e, focusableElements) {
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        let nextIndex;

        if (e.shiftKey) {
            nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        } else {
            nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
        }

        e.preventDefault();
        focusableElements[nextIndex].focus();
    }

    /**
     * Announce parameter changes for screen readers
     * @param {string} paramName - Parameter name
     * @param {any} newValue - New value
     */
    announceParameterChange(paramName, newValue) {
        const param = this.parameterController.getParameter(paramName);
        if (!param) return;

        const formattedValue = this.parameterController.formatValue(paramName, newValue);
        const announcement = `${param.displayName} changed to ${formattedValue}`;
        
        // Create or update live region for screen readers
        let liveRegion = document.getElementById('control-panel-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'control-panel-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = announcement;
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor animation performance
        let animationFrameCount = 0;
        let lastFrameTime = performance.now();
        
        const monitorPerformance = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - lastFrameTime;
            
            if (deltaTime > 16.67) { // More than 60fps threshold
                // Reduce animations if performance is poor
                this.controlPanel.classList.add('reduced-animations');
            } else {
                this.controlPanel.classList.remove('reduced-animations');
            }
            
            lastFrameTime = currentTime;
            animationFrameCount++;
            
            if (animationFrameCount % 60 === 0) { // Check every 60 frames
                requestAnimationFrame(monitorPerformance);
            }
        };
        
        // Start monitoring when animations are active
        this.controlPanel.addEventListener('animationstart', () => {
            requestAnimationFrame(monitorPerformance);
        });
    }

    /**
     * Add loading state to the panel
     * @param {boolean} isLoading - Loading state
     */
    setLoadingState(isLoading) {
        if (!this.controlPanel) return;
        
        if (isLoading) {
            this.controlPanel.classList.add('loading');
        } else {
            this.controlPanel.classList.remove('loading');
        }
    }

    /**
     * Batch update multiple controls efficiently
     * @param {Object} updates - Parameter updates
     */
    batchUpdateControls(updates) {
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            Object.entries(updates).forEach(([paramName, value]) => {
                this.updateControlDisplay(paramName, value);
            });
        });
    }

    /**
     * Show validation message to user
     * @param {Object} validationResult - Validation result
     * @param {string} type - Message type override
     */
    showValidationMessage(validationResult, type = null) {
        const messageType = type || (validationResult.valid ? 'warning' : 'error');
        const message = validationResult.error || validationResult.warning;
        
        if (message) {
            this.showGlobalFeedback(message, messageType);
            
            // Show suggestion if available
            if (validationResult.suggestion) {
                setTimeout(() => {
                    this.showGlobalFeedback(`Tip: ${validationResult.suggestion}`, 'info');
                }, 2000);
            }
        }
    }

    /**
     * Toggle parameter linking system
     * @param {boolean} enabled - Enable state
     */
    setParameterLinkingEnabled(enabled) {
        this.config.enableParameterLinking = enabled;
        this.parameterLinkingSystem.setLinkingEnabled(enabled);
        
        this.showGlobalFeedback(
            `Parameter linking ${enabled ? 'enabled' : 'disabled'}`, 
            'info'
        );
    }

    /**
     * Toggle advanced validation
     * @param {boolean} enabled - Enable state
     */
    setAdvancedValidationEnabled(enabled) {
        this.config.enableAdvancedValidation = enabled;
        
        this.showGlobalFeedback(
            `Advanced validation ${enabled ? 'enabled' : 'disabled'}`, 
            'info'
        );
    }

    /**
     * Toggle keyboard shortcuts
     * @param {boolean} enabled - Enable state
     */
    setKeyboardShortcutsEnabled(enabled) {
        this.config.enableKeyboardShortcuts = enabled;
        this.keyboardShortcuts.setEnabled(enabled);
        
        this.showGlobalFeedback(
            `Keyboard shortcuts ${enabled ? 'enabled' : 'disabled'}`, 
            'info'
        );
    }

    /**
     * Toggle smooth transitions
     * @param {boolean} enabled - Enable state
     */
    setSmoothTransitionsEnabled(enabled) {
        this.config.smoothTransitions = enabled;
        
        // Cancel all active transitions if disabling
        if (!enabled) {
            this.transitionQueue.forEach(transition => {
                clearInterval(transition.intervalId);
            });
            this.transitionQueue.clear();
        }
        
        this.showGlobalFeedback(
            `Smooth transitions ${enabled ? 'enabled' : 'disabled'}`, 
            'info'
        );
    }

    /**
     * Set transition duration
     * @param {number} duration - Duration in milliseconds
     */
    setTransitionDuration(duration) {
        this.config.transitionDuration = Math.max(100, Math.min(1000, duration));
        this.parameterLinkingSystem.setTransitionDuration(this.config.transitionDuration);
        
        this.showGlobalFeedback(
            `Transition duration set to ${this.config.transitionDuration}ms`, 
            'info'
        );
    }

    /**
     * Get advanced system status
     * @returns {Object} System status
     */
    getAdvancedSystemStatus() {
        return {
            parameterLinking: this.parameterLinkingSystem.getSystemStatus(),
            validation: this.validationSystem.getValidationStats(),
            keyboardShortcuts: this.keyboardShortcuts.getSystemStatus(),
            config: this.config,
            activeTransitions: this.transitionQueue.size,
            performance: {
                totalParameters: this.parameterController.getAllParameters().size,
                activeControls: this.activeControls.size,
                updateCallbacks: this.updateCallbacks.size
            }
        };
    }

    /**
     * Force update all linked parameters
     */
    updateAllLinkedParameters() {
        if (this.config.enableParameterLinking) {
            this.parameterLinkingSystem.updateAllLinkedParameters();
            this.showGlobalFeedback('Updated all linked parameters', 'success');
        }
    }

    /**
     * Export current configuration
     * @returns {Object} Configuration export
     */
    exportConfiguration() {
        return {
            parameters: this.getCurrentParameterValues(),
            config: this.config,
            parameterLinks: this.parameterLinkingSystem.getAllLinks().map(link => ({
                source: link.source,
                target: link.target,
                type: link.config.type,
                enabled: link.isActive
            })),
            validationRules: this.validationSystem.exportRules(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Import configuration
     * @param {Object} configData - Configuration to import
     */
    importConfiguration(configData) {
        try {
            // Apply parameters
            if (configData.parameters) {
                this.applyParameterValues(configData.parameters, 'import');
            }
            
            // Apply config settings
            if (configData.config) {
                Object.assign(this.config, configData.config);
            }
            
            // Apply parameter link states
            if (configData.parameterLinks) {
                configData.parameterLinks.forEach(linkData => {
                    this.parameterLinkingSystem.setLinkEnabled(
                        linkData.source, 
                        linkData.target, 
                        linkData.enabled
                    );
                });
            }
            
            this.showGlobalFeedback('Configuration imported successfully', 'success');
            
        } catch (error) {
            console.error('Error importing configuration:', error);
            this.showGlobalFeedback('Error importing configuration', 'error');
        }
    }

    /**
     * Create advanced settings panel
     */
    createAdvancedSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'advanced-settings-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 15, 20, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            padding: 24px;
            min-width: 400px;
            z-index: 10001;
            display: none;
        `;
        
        panel.innerHTML = `
            <h3 style="margin-top: 0; color: #60a5fa;">Advanced Settings</h3>
            
            <div style="margin: 16px 0;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="enable-linking" ${this.config.enableParameterLinking ? 'checked' : ''}>
                    <span>Enable Parameter Linking</span>
                </label>
                <small style="color: rgba(255,255,255,0.6); margin-left: 24px;">
                    Links heart rate to artery pulse speed and other realistic connections
                </small>
            </div>
            
            <div style="margin: 16px 0;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="enable-validation" ${this.config.enableAdvancedValidation ? 'checked' : ''}>
                    <span>Enable Advanced Validation</span>
                </label>
                <small style="color: rgba(255,255,255,0.6); margin-left: 24px;">
                    Provides detailed error messages and parameter suggestions
                </small>
            </div>
            
            <div style="margin: 16px 0;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="enable-shortcuts" ${this.config.enableKeyboardShortcuts ? 'checked' : ''}>
                    <span>Enable Keyboard Shortcuts</span>
                </label>
                <small style="color: rgba(255,255,255,0.6); margin-left: 24px;">
                    Press F1 to see available shortcuts
                </small>
            </div>
            
            <div style="margin: 16px 0;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="enable-transitions" ${this.config.smoothTransitions ? 'checked' : ''}>
                    <span>Enable Smooth Transitions</span>
                </label>
                <small style="color: rgba(255,255,255,0.6); margin-left: 24px;">
                    Smooth parameter changes to prevent jarring effects
                </small>
            </div>
            
            <div style="margin: 16px 0;">
                <label style="display: block; margin-bottom: 8px;">Transition Duration: ${this.config.transitionDuration}ms</label>
                <input type="range" id="transition-duration" min="100" max="1000" step="50" 
                       value="${this.config.transitionDuration}" style="width: 100%;">
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button id="apply-settings" style="flex: 1; background: #60a5fa; border: none; color: white; 
                                                   padding: 10px; border-radius: 6px; cursor: pointer;">
                    Apply Settings
                </button>
                <button id="close-settings" style="flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); 
                                                   color: white; padding: 10px; border-radius: 6px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Setup event listeners
        panel.querySelector('#apply-settings').addEventListener('click', () => {
            this.applyAdvancedSettings(panel);
        });
        
        panel.querySelector('#close-settings').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        
        return panel;
    }

    /**
     * Apply advanced settings from panel
     * @param {HTMLElement} panel - Settings panel
     */
    applyAdvancedSettings(panel) {
        const linking = panel.querySelector('#enable-linking').checked;
        const validation = panel.querySelector('#enable-validation').checked;
        const shortcuts = panel.querySelector('#enable-shortcuts').checked;
        const transitions = panel.querySelector('#enable-transitions').checked;
        const duration = parseInt(panel.querySelector('#transition-duration').value);
        
        this.setParameterLinkingEnabled(linking);
        this.setAdvancedValidationEnabled(validation);
        this.setKeyboardShortcutsEnabled(shortcuts);
        this.setSmoothTransitionsEnabled(transitions);
        this.setTransitionDuration(duration);
        
        panel.style.display = 'none';
        this.showGlobalFeedback('Advanced settings applied', 'success');
    }

    /**
     * Show advanced settings panel
     */
    showAdvancedSettings() {
        let panel = document.querySelector('.advanced-settings-panel');
        if (!panel) {
            panel = this.createAdvancedSettingsPanel();
        }
        panel.style.display = 'block';
    }

    /**
     * Handle system error with comprehensive recovery
     * @param {Error} error - Error object
     * @param {string} context - Error context
     * @param {Object} metadata - Additional metadata
     */
    handleSystemError(error, context, metadata = {}) {
        if (this.config.enableErrorHandling && this.errorHandlingSystem) {
            return this.errorHandlingSystem.handleError(error, context, metadata);
        } else {
            // Fallback error handling
            console.error(`System error in ${context}:`, error);
            this.showGlobalFeedback('A system error occurred. Please try again.', 'error');
            return null;
        }
    }

    /**
     * Check system health and component availability
     * @returns {Object} System health report
     */
    checkSystemHealth() {
        const healthReport = {
            timestamp: new Date().toISOString(),
            overall: 'healthy',
            components: {},
            errors: [],
            warnings: [],
            recommendations: []
        };

        try {
            // Check error handling system
            if (this.config.enableErrorHandling && this.errorHandlingSystem) {
                const errorHealth = this.errorHandlingSystem.getSystemHealth();
                healthReport.components.errorHandling = {
                    status: errorHealth.status,
                    errors: errorHealth.errors,
                    warnings: errorHealth.warnings,
                    recoveries: errorHealth.recoveries
                };

                if (errorHealth.status !== 'healthy') {
                    healthReport.overall = errorHealth.status;
                    healthReport.warnings.push(`Error handling system status: ${errorHealth.status}`);
                }
            }

            // Check graceful fallback system
            if (this.config.enableGracefulFallbacks && this.gracefulFallbackSystem) {
                const fallbackStatus = this.gracefulFallbackSystem.getSystemStatus();
                healthReport.components.gracefulFallbacks = fallbackStatus;

                if (fallbackStatus.criticalMissing > 0) {
                    healthReport.overall = 'critical';
                    healthReport.errors.push(`${fallbackStatus.criticalMissing} critical components missing`);
                } else if (fallbackStatus.missingComponents > 0) {
                    if (healthReport.overall === 'healthy') {
                        healthReport.overall = 'degraded';
                    }
                    healthReport.warnings.push(`${fallbackStatus.missingComponents} components in fallback mode`);
                }
            }

            // Check parameter linking system
            if (this.config.enableParameterLinking && this.parameterLinkingSystem) {
                const linkingStatus = this.parameterLinkingSystem.getSystemStatus();
                healthReport.components.parameterLinking = {
                    enabled: linkingStatus.enabled,
                    totalLinks: linkingStatus.totalLinks,
                    activeLinks: linkingStatus.activeLinks,
                    activeTransitions: linkingStatus.activeTransitions
                };
            }

            // Check validation system
            if (this.config.enableAdvancedValidation && this.validationSystem) {
                const validationStats = this.validationSystem.getValidationStats();
                healthReport.components.validation = validationStats;

                if (parseFloat(validationStats.successRate) < 80) {
                    healthReport.warnings.push(`Low validation success rate: ${validationStats.successRate}%`);
                }
            }

            // Check keyboard shortcuts
            if (this.config.enableKeyboardShortcuts && this.keyboardShortcuts) {
                const shortcutStatus = this.keyboardShortcuts.getSystemStatus();
                healthReport.components.keyboardShortcuts = shortcutStatus;
            }

            // Check error logging
            if (this.config.enableErrorLogging && this.errorLoggingSystem) {
                const loggingStats = this.errorLoggingSystem.getLogStatistics();
                healthReport.components.errorLogging = loggingStats;

                if (loggingStats.errorRate > 5) {
                    healthReport.warnings.push(`High error rate: ${loggingStats.errorRate.toFixed(2)} errors/minute`);
                }
            }

            // Add recommendations based on findings
            if (healthReport.errors.length > 0) {
                healthReport.recommendations.push('Critical issues detected. Consider reloading the application.');
            }
            if (healthReport.warnings.length > 3) {
                healthReport.recommendations.push('Multiple warnings detected. Check system logs for details.');
            }
            if (healthReport.overall === 'degraded') {
                healthReport.recommendations.push('System is running in degraded mode. Some features may be limited.');
            }

        } catch (error) {
            healthReport.overall = 'critical';
            healthReport.errors.push(`Health check failed: ${error.message}`);
            console.error('Error during health check:', error);
        }

        return healthReport;
    }

    /**
     * Perform system recovery
     * @param {string} recoveryType - Type of recovery to perform
     * @returns {boolean} Whether recovery was successful
     */
    performSystemRecovery(recoveryType = 'auto') {
        try {
            let recoverySuccess = false;

            switch (recoveryType) {
                case 'components':
                    if (this.gracefulFallbackSystem) {
                        const restoredCount = this.gracefulFallbackSystem.attemptComponentRestoration();
                        recoverySuccess = restoredCount > 0;
                    }
                    break;

                case 'parameters':
                    this.parameterController.resetAllParameters();
                    recoverySuccess = true;
                    break;

                case 'ui':
                    this.createControlPanel();
                    this.createControlSections();
                    recoverySuccess = true;
                    break;

                case 'linking':
                    if (this.parameterLinkingSystem) {
                        this.parameterLinkingSystem.updateAllLinkedParameters();
                        recoverySuccess = true;
                    }
                    break;

                case 'full':
                    // Attempt full system recovery
                    this.performSystemRecovery('components');
                    this.performSystemRecovery('parameters');
                    this.performSystemRecovery('ui');
                    this.performSystemRecovery('linking');
                    recoverySuccess = true;
                    break;

                case 'auto':
                default:
                    // Automatic recovery based on system health
                    const health = this.checkSystemHealth();
                    
                    if (health.overall === 'critical') {
                        recoverySuccess = this.performSystemRecovery('full');
                    } else if (health.components.gracefulFallbacks?.missingComponents > 0) {
                        recoverySuccess = this.performSystemRecovery('components');
                    } else if (health.components.validation?.successRate < 80) {
                        recoverySuccess = this.performSystemRecovery('parameters');
                    }
                    break;
            }

            if (recoverySuccess) {
                this.showGlobalFeedback(`System recovery (${recoveryType}) completed successfully`, 'success');
                
                // Log recovery
                if (this.errorLoggingSystem) {
                    this.errorLoggingSystem.log('INFO', 'recovery', `System recovery performed: ${recoveryType}`);
                }
            } else {
                this.showGlobalFeedback(`System recovery (${recoveryType}) failed`, 'error');
            }

            return recoverySuccess;

        } catch (error) {
            console.error('Error during system recovery:', error);
            this.showGlobalFeedback('System recovery failed due to an error', 'error');
            return false;
        }
    }

    /**
     * Create system diagnostics panel
     */
    createSystemDiagnosticsPanel() {
        const panel = document.createElement('div');
        panel.className = 'system-diagnostics-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10%;
            left: 10%;
            right: 10%;
            bottom: 10%;
            background: rgba(15, 15, 20, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: white;
            padding: 24px;
            z-index: 10002;
            display: none;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="margin: 0; color: #60a5fa; font-family: 'Segoe UI', sans-serif;">System Diagnostics</h3>
                <div>
                    <button id="refresh-diagnostics" style="background: #60a5fa; border: none; color: white; 
                                                           padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px;">
                        Refresh
                    </button>
                    <button id="download-diagnostics" style="background: #22c55e; border: none; color: white; 
                                                            padding: 8px 12px; border-radius: 6px; cursor: pointer; margin-right: 8px;">
                        Download
                    </button>
                    <button id="close-diagnostics" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); 
                                                          color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
            <div id="diagnostics-content">
                Loading diagnostics...
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Setup event listeners
        panel.querySelector('#refresh-diagnostics').addEventListener('click', () => {
            this.updateDiagnosticsContent(panel);
        });
        
        panel.querySelector('#download-diagnostics').addEventListener('click', () => {
            this.downloadDiagnostics();
        });
        
        panel.querySelector('#close-diagnostics').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        
        return panel;
    }

    /**
     * Update diagnostics content
     * @param {HTMLElement} panel - Diagnostics panel
     */
    updateDiagnosticsContent(panel) {
        const content = panel.querySelector('#diagnostics-content');
        const health = this.checkSystemHealth();
        
        let html = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #fbbf24; margin-bottom: 10px;">System Health: 
                    <span style="color: ${this.getHealthColor(health.overall)}">${health.overall.toUpperCase()}</span>
                </h4>
                <div style="margin-left: 20px;">
                    <div>Timestamp: ${health.timestamp}</div>
                    <div>Errors: ${health.errors.length}</div>
                    <div>Warnings: ${health.warnings.length}</div>
                </div>
            </div>
        `;
        
        // Component status
        html += `<h4 style="color: #fbbf24; margin-bottom: 10px;">Component Status</h4>`;
        Object.entries(health.components).forEach(([name, status]) => {
            html += `
                <div style="margin-left: 20px; margin-bottom: 10px;">
                    <strong>${name}:</strong>
                    <pre style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow-x: auto;">
${JSON.stringify(status, null, 2)}
                    </pre>
                </div>
            `;
        });
        
        // Recent errors
        if (this.errorLoggingSystem) {
            const recentErrors = this.errorLoggingSystem.getLogs({ level: 'ERROR', limit: 5 });
            html += `<h4 style="color: #ef4444; margin-bottom: 10px;">Recent Errors (${recentErrors.length})</h4>`;
            recentErrors.forEach(error => {
                html += `
                    <div style="margin-left: 20px; margin-bottom: 10px; padding: 10px; background: rgba(239,68,68,0.1); border-radius: 4px;">
                        <div><strong>Time:</strong> ${error.timestamp}</div>
                        <div><strong>Category:</strong> ${error.category}</div>
                        <div><strong>Message:</strong> ${error.message}</div>
                        ${error.error ? `<div><strong>Error:</strong> ${error.error.message}</div>` : ''}
                    </div>
                `;
            });
        }
        
        // Recommendations
        if (health.recommendations.length > 0) {
            html += `<h4 style="color: #22c55e; margin-bottom: 10px;">Recommendations</h4>`;
            health.recommendations.forEach(rec => {
                html += `<div style="margin-left: 20px; margin-bottom: 5px;">• ${rec}</div>`;
            });
        }
        
        content.innerHTML = html;
    }

    /**
     * Get color for health status
     * @param {string} status - Health status
     * @returns {string} Color code
     */
    getHealthColor(status) {
        switch (status) {
            case 'healthy': return '#22c55e';
            case 'warning': return '#f59e0b';
            case 'degraded': return '#ef4444';
            case 'critical': return '#dc2626';
            default: return '#9ca3af';
        }
    }

    /**
     * Download diagnostics report
     */
    downloadDiagnostics() {
        try {
            const health = this.checkSystemHealth();
            const diagnostics = {
                systemHealth: health,
                errorLogs: this.errorLoggingSystem ? this.errorLoggingSystem.exportLogs() : null,
                fallbackReport: this.gracefulFallbackSystem ? this.gracefulFallbackSystem.createDiagnosticReport() : null,
                advancedSystemStatus: this.getAdvancedSystemStatus(),
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(diagnostics, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `heart-sim-diagnostics-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showGlobalFeedback('Diagnostics report downloaded', 'success');
            
        } catch (error) {
            console.error('Error downloading diagnostics:', error);
            this.showGlobalFeedback('Failed to download diagnostics', 'error');
        }
    }

    /**
     * Show system diagnostics panel
     */
    showSystemDiagnostics() {
        let panel = document.querySelector('.system-diagnostics-panel');
        if (!panel) {
            panel = this.createSystemDiagnosticsPanel();
        }
        
        panel.style.display = 'block';
        this.updateDiagnosticsContent(panel);
    }

    /**
     * Clean up resources
     */
    dispose() {
        // Clear update callbacks and transitions
        this.updateCallbacks.forEach(timeoutId => clearTimeout(timeoutId));
        this.updateCallbacks.clear();
        
        this.transitionQueue.forEach(transition => clearInterval(transition.intervalId));
        this.transitionQueue.clear();

        // Remove control panel and advanced settings
        if (this.controlPanel) {
            this.controlPanel.remove();
            this.controlPanel = null;
        }
        
        const advancedPanel = document.querySelector('.advanced-settings-panel');
        if (advancedPanel) {
            advancedPanel.remove();
        }
        
        const diagnosticsPanel = document.querySelector('.system-diagnostics-panel');
        if (diagnosticsPanel) {
            diagnosticsPanel.remove();
        }

        // Dispose of error handling systems
        if (this.errorHandlingSystem) {
            this.errorHandlingSystem.dispose();
        }
        if (this.gracefulFallbackSystem) {
            this.gracefulFallbackSystem.dispose();
        }
        if (this.errorLoggingSystem) {
            this.errorLoggingSystem.dispose();
        }

        // Dispose of advanced systems
        if (this.keyboardShortcuts) {
            this.keyboardShortcuts.dispose();
        }
        if (this.validationSystem) {
            this.validationSystem.dispose();
        }
        if (this.parameterLinkingSystem) {
            this.parameterLinkingSystem.dispose();
        }

        // Dispose of core systems
        if (this.presetUI) {
            this.presetUI.dispose();
        }
        if (this.presetManager) {
            this.presetManager.dispose();
        }
        if (this.heartControlSystem) {
            this.heartControlSystem.dispose();
        }
        if (this.arteryControlSystem) {
            this.arteryControlSystem.dispose();
        }
        if (this.fluidControlSystem) {
            this.fluidControlSystem.dispose();
        }
        if (this.environmentControlSystem) {
            this.environmentControlSystem.dispose();
        }
        if (this.parameterController) {
            this.parameterController.dispose();
        }
        if (this.eventSystem) {
            this.eventSystem.dispose();
        }

        // Clear maps
        this.controlSections.clear();
        this.activeControls.clear();
    }
}