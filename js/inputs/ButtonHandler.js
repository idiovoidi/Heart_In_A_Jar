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

        // Artery Controls Section
        this.createArteryControls(panel);

        // Fluid Controls Section
        this.createFluidControls(panel);
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

    createArteryControls(panel) {
        const arteryContainer = document.createElement('div');
        arteryContainer.className = 'control-section';

        // Start/Stop Growth Button
        const toggleGrowthBtn = document.createElement('button');
        toggleGrowthBtn.textContent = 'Start Artery Growth';
        toggleGrowthBtn.onclick = () => this.toggleArteryGrowth();
        arteryContainer.appendChild(toggleGrowthBtn);

        // Growth Speed Slider
        const speedContainer = document.createElement('div');
        speedContainer.className = 'slider-container';
        
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Growth Speed';
        speedContainer.appendChild(speedLabel);

        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '50';
        speedSlider.max = '200';
        speedSlider.step = '10';
        speedSlider.value = '100';
        speedSlider.oninput = (e) => this.updateGrowthSpeed(e.target.value);
        speedContainer.appendChild(speedSlider);
        
        arteryContainer.appendChild(speedContainer);
        panel.appendChild(arteryContainer);
    }

    createFluidControls(panel) {
        const fluidContainer = document.createElement('div');
        fluidContainer.className = 'control-section';

        // Start/Stop Filling Button
        const toggleFillBtn = document.createElement('button');
        toggleFillBtn.textContent = 'Start Filling';
        toggleFillBtn.onclick = () => this.toggleFluidFilling();
        fluidContainer.appendChild(toggleFillBtn);

        panel.appendChild(fluidContainer);
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
            camera.setPosition(new BABYLON.Vector3(0, 0, 10));
            camera.setTarget(new BABYLON.Vector3(0, -1, 0));
        }
    }

    toggleArteryGrowth() {
        if (this.sceneManager.arterySim) {
            if (this.sceneManager.arterySim.isGrowing) {
                this.sceneManager.arterySim.isGrowing = false;
            } else {
                this.sceneManager.arterySim.isGrowing = true;
                this.sceneManager.arterySim.processGrowthQueue();
            }
        }
    }

    updateGrowthSpeed(speed) {
        if (this.sceneManager.arterySim) {
            this.sceneManager.arterySim.growthSpeed = parseInt(speed);
        }
    }

    toggleFluidFilling() {
        if (this.sceneManager.fluidSim) {
            if (this.sceneManager.fluidSim.isFlowing) {
                this.sceneManager.fluidSim.stopFilling();
            } else {
                this.sceneManager.fluidSim.startFilling(0.8);
            }
        }
    }

    dispose() {
        const panel = document.querySelector('.control-panel');
        if (panel) {
            panel.remove();
        }
    }
} 