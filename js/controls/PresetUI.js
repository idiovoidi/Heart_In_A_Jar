import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Preset UI component for managing and applying presets
 * Provides user interface for preset selection and management
 */
export class PresetUI {
    constructor(presetManager, eventSystem) {
        this.presetManager = presetManager;
        this.eventSystem = eventSystem;
        
        this.presetPanel = null;
        this.isExpanded = false;
        this.currentCategory = 'all';
        
        this.init();
    }

    /**
     * Initialize the preset UI
     */
    init() {
        try {
            this.createPresetPanel();
            this.setupEventListeners();
            this.updatePresetDisplay();
            
            console.log('PresetUI initialized successfully');
        } catch (error) {
            console.error('Error initializing PresetUI:', error);
            ErrorDecorator.logError(error, 'PresetUI.init');
        }
    }

    /**
     * Create the preset panel UI
     */
    createPresetPanel() {
        // Find the control panel
        const controlPanel = document.querySelector('.control-panel .panel-content');
        if (!controlPanel) {
            console.error('Control panel not found for preset UI');
            return;
        }

        // Create preset section
        const presetSection = document.createElement('div');
        presetSection.className = 'control-section preset-section';
        presetSection.innerHTML = `
            <div class="section-header preset-header">
                <span class="section-icon">⚡</span>
                <span class="section-title">Presets</span>
                <button class="section-toggle preset-toggle" title="Expand/Collapse Presets">+</button>
            </div>
            <div class="section-content preset-content" style="display: none;">
                <div class="preset-controls">
                    <div class="preset-categories">
                        <button class="category-btn active" data-category="all">All</button>
                        <button class="category-btn" data-category="medical">Medical</button>
                        <button class="category-btn" data-category="demonstration">Demo</button>
                        <button class="category-btn" data-category="educational">Educational</button>
                    </div>
                    <div class="preset-grid" id="presetGrid">
                        <!-- Preset buttons will be added here -->
                    </div>
                    <div class="preset-actions">
                        <button class="preset-action-btn save-preset" title="Save current settings as preset">
                            💾 Save Current
                        </button>
                        <button class="preset-action-btn manage-presets" title="Manage custom presets">
                            ⚙️ Manage
                        </button>
                    </div>
                </div>
                <div class="preset-info" id="presetInfo">
                    <div class="preset-description">
                        Select a preset to see its description
                    </div>
                </div>
            </div>
        `;

        // Insert at the top of the control panel
        controlPanel.insertBefore(presetSection, controlPanel.firstChild);
        this.presetPanel = presetSection;

        // Setup toggle functionality
        this.setupPresetToggle();
        this.setupCategoryButtons();
        this.setupActionButtons();
    }

    /**
     * Setup preset panel toggle
     */
    setupPresetToggle() {
        const toggleBtn = this.presetPanel.querySelector('.preset-toggle');
        const content = this.presetPanel.querySelector('.preset-content');
        
        toggleBtn.addEventListener('click', () => {
            this.isExpanded = !this.isExpanded;
            
            if (this.isExpanded) {
                content.style.display = 'block';
                toggleBtn.textContent = '−';
                toggleBtn.title = 'Collapse Presets';
                this.presetPanel.classList.add('expanded');
            } else {
                content.style.display = 'none';
                toggleBtn.textContent = '+';
                toggleBtn.title = 'Expand Presets';
                this.presetPanel.classList.remove('expanded');
            }
        });
    }

    /**
     * Setup category filter buttons
     */
    setupCategoryButtons() {
        const categoryButtons = this.presetPanel.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update current category
                this.currentCategory = e.target.dataset.category;
                
                // Update preset display
                this.updatePresetDisplay();
            });
        });
    }

    /**
     * Setup action buttons
     */
    setupActionButtons() {
        const saveBtn = this.presetPanel.querySelector('.save-preset');
        const manageBtn = this.presetPanel.querySelector('.manage-presets');
        
        saveBtn.addEventListener('click', () => {
            this.showSavePresetDialog();
        });
        
        manageBtn.addEventListener('click', () => {
            this.showManagePresetsDialog();
        });
    }

    /**
     * Update preset display based on current category
     */
    updatePresetDisplay() {
        const presetGrid = document.getElementById('presetGrid');
        if (!presetGrid) return;

        // Clear existing presets
        presetGrid.innerHTML = '';

        // Get presets for current category
        let presets = this.presetManager.getAllPresets();
        if (this.currentCategory !== 'all') {
            presets = presets.filter(preset => preset.category === this.currentCategory);
        }

        // Sort presets by name
        presets.sort((a, b) => a.name.localeCompare(b.name));

        // Create preset buttons
        presets.forEach(preset => {
            const presetButton = this.createPresetButton(preset);
            presetGrid.appendChild(presetButton);
        });

        // Show message if no presets
        if (presets.length === 0) {
            presetGrid.innerHTML = `
                <div class="no-presets">
                    No presets found in ${this.currentCategory} category
                </div>
            `;
        }
    }

    /**
     * Create a preset button
     * @param {Object} preset - Preset configuration
     * @returns {HTMLElement} Preset button element
     */
    createPresetButton(preset) {
        const button = document.createElement('button');
        button.className = 'preset-btn';
        button.dataset.presetId = preset.id;
        
        // Add current preset indicator
        const isCurrentPreset = this.presetManager.getCurrentPreset() === preset.id;
        if (isCurrentPreset) {
            button.classList.add('current');
        }
        
        // Add custom preset indicator
        if (!preset.isBuiltIn) {
            button.classList.add('custom');
        }

        button.innerHTML = `
            <div class="preset-icon">${preset.icon || '⚡'}</div>
            <div class="preset-name">${preset.name}</div>
            ${!preset.isBuiltIn ? '<div class="preset-custom-indicator">★</div>' : ''}
        `;

        // Add event listeners
        button.addEventListener('click', () => {
            this.applyPreset(preset.id);
        });

        button.addEventListener('mouseenter', () => {
            this.showPresetInfo(preset);
        });

        button.addEventListener('mouseleave', () => {
            this.hidePresetInfo();
        });

        return button;
    }

    /**
     * Apply a preset
     * @param {string} presetId - Preset ID to apply
     */
    async applyPreset(presetId) {
        try {
            // Show loading state
            this.showPresetLoading(presetId, true);
            
            // Apply preset with smooth transition
            const success = await this.presetManager.applyPreset(presetId, {
                smooth: true,
                duration: 2000
            });

            if (success) {
                // Update UI to reflect current preset
                this.updateCurrentPresetIndicator(presetId);
                
                // Show success feedback
                this.showPresetFeedback('Preset applied successfully', 'success');
            } else {
                this.showPresetFeedback('Failed to apply preset', 'error');
            }
        } catch (error) {
            console.error('Error applying preset:', error);
            this.showPresetFeedback('Error applying preset', 'error');
        } finally {
            // Hide loading state
            this.showPresetLoading(presetId, false);
        }
    }

    /**
     * Show preset loading state
     * @param {string} presetId - Preset ID
     * @param {boolean} loading - Loading state
     */
    showPresetLoading(presetId, loading) {
        const button = this.presetPanel.querySelector(`[data-preset-id="${presetId}"]`);
        if (button) {
            if (loading) {
                button.classList.add('loading');
                button.disabled = true;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    /**
     * Update current preset indicator
     * @param {string} presetId - Current preset ID
     */
    updateCurrentPresetIndicator(presetId) {
        // Remove current indicator from all buttons
        const allButtons = this.presetPanel.querySelectorAll('.preset-btn');
        allButtons.forEach(btn => btn.classList.remove('current'));
        
        // Add current indicator to active preset
        const currentButton = this.presetPanel.querySelector(`[data-preset-id="${presetId}"]`);
        if (currentButton) {
            currentButton.classList.add('current');
        }
    }

    /**
     * Show preset information
     * @param {Object} preset - Preset configuration
     */
    showPresetInfo(preset) {
        const presetInfo = document.getElementById('presetInfo');
        if (!presetInfo) return;

        const parameterCount = Object.keys(preset.parameters).length;
        const categoryDisplay = preset.category.charAt(0).toUpperCase() + preset.category.slice(1);
        
        presetInfo.innerHTML = `
            <div class="preset-description">
                <div class="preset-title">
                    ${preset.icon || '⚡'} ${preset.name}
                    ${!preset.isBuiltIn ? '<span class="custom-badge">Custom</span>' : ''}
                </div>
                <div class="preset-desc">${preset.description}</div>
                <div class="preset-meta">
                    <span class="preset-category">Category: ${categoryDisplay}</span>
                    <span class="preset-params">${parameterCount} parameters</span>
                </div>
            </div>
        `;
    }

    /**
     * Hide preset information
     */
    hidePresetInfo() {
        const presetInfo = document.getElementById('presetInfo');
        if (presetInfo) {
            presetInfo.innerHTML = `
                <div class="preset-description">
                    Select a preset to see its description
                </div>
            `;
        }
    }

    /**
     * Show save preset dialog
     */
    showSavePresetDialog() {
        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'preset-modal';
        modal.innerHTML = `
            <div class="preset-modal-content">
                <div class="preset-modal-header">
                    <h3>Save Current Settings as Preset</h3>
                    <button class="preset-modal-close">&times;</button>
                </div>
                <div class="preset-modal-body">
                    <div class="preset-form">
                        <div class="form-group">
                            <label for="presetName">Preset Name:</label>
                            <input type="text" id="presetName" placeholder="Enter preset name" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label for="presetDescription">Description:</label>
                            <textarea id="presetDescription" placeholder="Enter preset description" maxlength="200"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="presetIcon">Icon (emoji):</label>
                            <input type="text" id="presetIcon" placeholder="⚡" maxlength="2">
                        </div>
                    </div>
                </div>
                <div class="preset-modal-footer">
                    <button class="preset-modal-btn cancel">Cancel</button>
                    <button class="preset-modal-btn save">Save Preset</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup modal event listeners
        this.setupSavePresetModal(modal);
    }

    /**
     * Setup save preset modal
     * @param {HTMLElement} modal - Modal element
     */
    setupSavePresetModal(modal) {
        const closeBtn = modal.querySelector('.preset-modal-close');
        const cancelBtn = modal.querySelector('.cancel');
        const saveBtn = modal.querySelector('.save');
        const nameInput = modal.querySelector('#presetName');

        // Close modal function
        const closeModal = () => {
            modal.remove();
        };

        // Event listeners
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Save preset
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const description = modal.querySelector('#presetDescription').value.trim();
            const icon = modal.querySelector('#presetIcon').value.trim() || '⚡';

            if (!name) {
                this.showPresetFeedback('Please enter a preset name', 'error');
                return;
            }

            const presetId = this.presetManager.saveCurrentAsPreset(name, description, { icon });
            
            if (presetId) {
                this.showPresetFeedback('Preset saved successfully', 'success');
                this.updatePresetDisplay();
                closeModal();
            } else {
                this.showPresetFeedback('Failed to save preset', 'error');
            }
        });

        // Focus name input
        nameInput.focus();
    }

    /**
     * Show manage presets dialog
     */
    showManagePresetsDialog() {
        const customPresets = this.presetManager.getAllPresets().filter(p => !p.isBuiltIn);
        
        if (customPresets.length === 0) {
            this.showPresetFeedback('No custom presets to manage', 'info');
            return;
        }

        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'preset-modal manage-modal';
        modal.innerHTML = `
            <div class="preset-modal-content">
                <div class="preset-modal-header">
                    <h3>Manage Custom Presets</h3>
                    <button class="preset-modal-close">&times;</button>
                </div>
                <div class="preset-modal-body">
                    <div class="custom-presets-list">
                        ${customPresets.map(preset => `
                            <div class="custom-preset-item" data-preset-id="${preset.id}">
                                <div class="preset-info">
                                    <div class="preset-name">${preset.icon} ${preset.name}</div>
                                    <div class="preset-desc">${preset.description}</div>
                                </div>
                                <button class="delete-preset-btn" data-preset-id="${preset.id}">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="preset-modal-footer">
                    <button class="preset-modal-btn close">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup modal event listeners
        this.setupManagePresetsModal(modal);
    }

    /**
     * Setup manage presets modal
     * @param {HTMLElement} modal - Modal element
     */
    setupManagePresetsModal(modal) {
        const closeBtn = modal.querySelector('.preset-modal-close');
        const closeFooterBtn = modal.querySelector('.close');
        const deleteButtons = modal.querySelectorAll('.delete-preset-btn');

        // Close modal function
        const closeModal = () => {
            modal.remove();
        };

        // Event listeners
        closeBtn.addEventListener('click', closeModal);
        closeFooterBtn.addEventListener('click', closeModal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Delete preset buttons
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const presetId = e.target.dataset.presetId;
                this.deleteCustomPreset(presetId, modal);
            });
        });
    }

    /**
     * Delete custom preset
     * @param {string} presetId - Preset ID to delete
     * @param {HTMLElement} modal - Modal element
     */
    deleteCustomPreset(presetId, modal) {
        const preset = this.presetManager.getPreset(presetId);
        if (!preset) return;

        if (confirm(`Are you sure you want to delete the preset "${preset.name}"?`)) {
            const success = this.presetManager.deleteCustomPreset(presetId);
            
            if (success) {
                // Remove from modal
                const presetItem = modal.querySelector(`[data-preset-id="${presetId}"]`);
                if (presetItem) {
                    presetItem.remove();
                }
                
                // Update main preset display
                this.updatePresetDisplay();
                
                this.showPresetFeedback('Preset deleted successfully', 'success');
            } else {
                this.showPresetFeedback('Failed to delete preset', 'error');
            }
        }
    }

    /**
     * Show preset feedback message
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error, info)
     */
    showPresetFeedback(message, type = 'info') {
        // Create or update feedback element
        let feedback = document.querySelector('.preset-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'preset-feedback';
            document.body.appendChild(feedback);
        }

        feedback.textContent = message;
        feedback.className = `preset-feedback ${type} show`;

        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for preset application events
        this.eventSystem.addEventListener('presetApplicationStart', '*', (event) => {
            this.onPresetApplicationStart(event.data);
        });

        this.eventSystem.addEventListener('presetApplicationComplete', '*', (event) => {
            this.onPresetApplicationComplete(event.data);
        });
    }

    /**
     * Handle preset application start
     * @param {Object} data - Event data
     */
    onPresetApplicationStart(data) {
        this.showPresetFeedback(`Applying ${data.presetName}...`, 'info');
    }

    /**
     * Handle preset application complete
     * @param {Object} data - Event data
     */
    onPresetApplicationComplete(data) {
        if (data.success) {
            this.showPresetFeedback(`${data.presetName} applied successfully`, 'success');
        } else {
            this.showPresetFeedback(`Failed to apply ${data.presetName}`, 'error');
        }
    }

    /**
     * Refresh preset display
     */
    refresh() {
        this.updatePresetDisplay();
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (this.presetPanel) {
            this.presetPanel.remove();
        }
        
        // Remove feedback element
        const feedback = document.querySelector('.preset-feedback');
        if (feedback) {
            feedback.remove();
        }
    }
}