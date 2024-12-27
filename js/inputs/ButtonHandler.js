export class ButtonHandler {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.createControlPanel();
    }

    createControlPanel() {
        // Create main control panel
        const panel = document.createElement('div');
        panel.className = 'control-panel';
        document.body.appendChild(panel);

        // Heart Controls Section
        this.createHeartControls(panel);
        
        // View Controls Section
        this.createViewControls(panel);
    }

    createHeartControls(panel) {
        // Toggle Beat Button
        const toggleBeatBtn = document.createElement('button');
        toggleBeatBtn.textContent = 'Toggle Heartbeat';
        toggleBeatBtn.onclick = () => this.toggleHeartbeat();
        panel.appendChild(toggleBeatBtn);

        // Beat Speed Slider
        const speedContainer = document.createElement('div');
        speedContainer.className = 'slider-container';
        
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Beat Speed';
        speedContainer.appendChild(speedLabel);

        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '0.5';
        speedSlider.max = '4';
        speedSlider.step = '0.1';
        speedSlider.value = '2';
        speedSlider.oninput = (e) => this.updateBeatSpeed(e.target.value);
        speedContainer.appendChild(speedSlider);
        
        panel.appendChild(speedContainer);
    }

    createViewControls(panel) {
        // Reset View Button
        const resetViewBtn = document.createElement('button');
        resetViewBtn.textContent = 'Reset View';
        resetViewBtn.onclick = () => this.resetView();
        panel.appendChild(resetViewBtn);
    }

    toggleHeartbeat() {
        if (this.sceneManager.heartSim) {
            const isBeating = !this.sceneManager.heartSim.isBeating;
            this.sceneManager.heartSim.setBeating(isBeating);
        }
    }

    updateBeatSpeed(speed) {
        if (this.sceneManager.heartSim) {
            this.sceneManager.heartSim.setBeatSpeed(parseFloat(speed));
        }
    }

    resetView() {
        const camera = this.sceneManager.scene.activeCamera;
        if (camera) {
            camera.setPosition(new BABYLON.Vector3(0, 0, 8));
            camera.setTarget(new BABYLON.Vector3(0, -1, 0));
        }
    }

    dispose() {
        const panel = document.querySelector('.control-panel');
        if (panel) {
            panel.remove();
        }
    }
} 