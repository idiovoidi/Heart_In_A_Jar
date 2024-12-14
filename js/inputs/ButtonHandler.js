import * as THREE from 'three';

export class ButtonHandler {
    constructor(scene) {
        this.scene = scene;
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
        // Regenerate Arteries Button
        const regenArteriesBtn = document.createElement('button');
        regenArteriesBtn.textContent = 'Regenerate Arteries';
        regenArteriesBtn.onclick = () => this.regenerateArteries();
        panel.appendChild(regenArteriesBtn);
    }

    regenerateArteries() {
        if (this.scene.arterySim) {
            // Remove old artery system
            if (this.scene.arterySystem) {
                this.scene.scene.remove(this.scene.arterySystem);
            }
            
            // Create new artery system
            this.scene.arterySim.createArterySystem(false);
            this.scene.arterySystem = this.scene.arterySim.getMesh();
            
            // Position arteries
            this.scene.arterySystem.scale.set(0.25, 0.25, 0.25);
            this.scene.arterySystem.position.copy(this.scene.heart.position);
            this.scene.arterySystem.position.y += 0.5; // Start above heart
            this.scene.arterySystem.rotation.copy(this.scene.heart.rotation);
            
            this.scene.scene.add(this.scene.arterySystem);
        }
    }

    toggleHeartbeat() {
        if (this.scene.heartSim) {
            const isBeating = !this.scene.heartSim.isBeating;
            this.scene.heartSim.setBeating(isBeating);
        }
    }

    updateBeatSpeed(speed) {
        if (this.scene.heartSim) {
            this.scene.heartSim.setBeatSpeed(parseFloat(speed));
        }
    }

    resetView() {
        if (this.scene.camera && this.scene.controls) {
            this.scene.camera.position.set(0, 0, 8);
            this.scene.camera.lookAt(0, -1, 0);
            this.scene.camera.zoom = 1;
            this.scene.camera.updateProjectionMatrix();
            this.scene.controls.reset();
        }
    }

    dispose() {
        const panel = document.querySelector('.control-panel');
        if (panel) {
            panel.remove();
        }
    }
} 