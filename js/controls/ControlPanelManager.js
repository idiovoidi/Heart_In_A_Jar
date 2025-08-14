import { ParameterController } from './ParameterController.js';
import { ParameterEventSystem } from './ParameterEventSystem.js';
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
        
        this.controlPanel = null;
        this.controlSections = new Map();
        this.activeControls = new Map();
        this.updateCallbacks = new Map();
        
        // Configuration
        this.config = {
            autoUpdate: true,
            showTooltips: true,
            showValues: true,
            animateChanges: true,
            collapsibleSections: true
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
        
        // Setup section toggle
        const toggleBtn = header.querySelector('.section-toggle');
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = content.style.display === 'none';
            content.style.display = isCollapsed ? 'block' : 'none';
            toggleBtn.textContent = isCollapsed ? '−' : '+';
            section.classList.toggle('collapsed', !isCollapsed);
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
                    <button class="action-button drain-blood" title="Drain all blood from the jar">
                        🚰 Drain Blood
                    </button>
                    <button class="action-button reset-view" title="Reset camera to default position">
                        📷 Reset View
                    </button>
                    <button class="action-button reset-all" title="Reset all parameters to defaults">
                        🏠 Reset All
                    </button>
                </div>
            </div>
        `;

        // Setup action button listeners
        const resetArteriesBtn = section.querySelector('.reset-arteries');
        const drainBloodBtn = section.querySelector('.drain-blood');
        const resetViewBtn = section.querySelector('.reset-view');
        const resetAllBtn = section.querySelector('.reset-all');

        resetArteriesBtn.addEventListener('click', () => this.resetArteries());
        drainBloodBtn.addEventListener('click', () => this.drainBlood());
        resetViewBtn.addEventListener('click', () => this.resetView());
        resetAllBtn.addEventListener('click', () => this.resetAllParameters());

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

        // Window resize listener
        window.addEventListener('resize', () => {
            this.adjustPanelLayout();
        });
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
     * Apply a parameter change
     * @param {string} paramName - Parameter name
     * @param {any} value - New value
     * @param {string} source - Source of change
     */
    applyParameterChange(paramName, value, source = 'ui') {
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

        controlContainer.classList.add(`feedback-${type}`);
        
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
        const arterySim = this.sceneManager.getEntity('arterySim');
        if (arterySim && arterySim.reset) {
            arterySim.reset();
            this.showGlobalFeedback('Arteries reset successfully', 'success');
        }
    }

    drainBlood() {
        const fluidSim = this.sceneManager.getEntity('fluidSim');
        if (fluidSim) {
            fluidSim.currentLevel = 0;
            fluidSim.stopFilling();
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
        if (width < 768) {
            this.controlPanel.classList.add('mobile');
        } else {
            this.controlPanel.classList.remove('mobile');
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
     * Clean up resources
     */
    dispose() {
        // Clear update callbacks
        this.updateCallbacks.forEach(timeoutId => clearTimeout(timeoutId));
        this.updateCallbacks.clear();

        // Remove control panel
        if (this.controlPanel) {
            this.controlPanel.remove();
            this.controlPanel = null;
        }

        // Dispose of systems
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