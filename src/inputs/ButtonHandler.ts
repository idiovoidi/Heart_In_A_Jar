import type { SceneManager } from '../types/scene';

export class ButtonHandler {
    sceneManager: SceneManager;
    panel: HTMLElement | null = null;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        
        // Always create panel immediately since scripts are loaded with type="module"
        // which are deferred by default
        this.createControlPanel();
    }

    createControlPanel(): void {
        // Remove existing panel if any
        const existing = document.querySelector('.control-panel');
        if (existing) existing.remove();
        
        const panel = document.createElement('div');
        panel.className = 'control-panel';
        this.panel = panel;
        
        // Add panel header
        const header = document.createElement('div');
        header.className = 'panel-header';
        const title = document.createElement('h3');
        title.textContent = 'Controls';
        header.appendChild(title);
        panel.appendChild(header);
        
        // Add content container
        const content = document.createElement('div');
        content.className = 'panel-content';
        panel.appendChild(content);
        
        this.createHeartControls(content);
        this.createViewControls(content);
        this.createArteryControls(content);
        this.createFluidControls(content);
        this.createLabControls(content);
        
        document.body.appendChild(panel);
        console.log('Control panel created and added to body');
    }

    createHeartControls(panel: HTMLElement): void {
        const section = document.createElement('div');
        section.className = 'control-section';
        
        const toggleBeatBtn = document.createElement('button');
        toggleBeatBtn.className = 'parameter-button';
        toggleBeatBtn.textContent = 'Toggle Heartbeat';
        toggleBeatBtn.onclick = () => this.toggleHeartbeat();
        section.appendChild(toggleBeatBtn);

        const speedContainer = document.createElement('div');
        speedContainer.className = 'slider-container';

        const speedLabel = document.createElement('label');
        speedLabel.className = 'control-label';
        speedLabel.textContent = 'Beat Speed';
        speedContainer.appendChild(speedLabel);

        const speedSlider = document.createElement('input');
        speedSlider.className = 'parameter-slider';
        speedSlider.type = 'range';
        speedSlider.min = '0.5';
        speedSlider.max = '4';
        speedSlider.step = '0.1';
        speedSlider.value = '2';
        speedSlider.oninput = (e) => this.updateBeatSpeed((e.target as HTMLInputElement).value);
        speedContainer.appendChild(speedSlider);

        section.appendChild(speedContainer);
        panel.appendChild(section);
    }

    createViewControls(panel: HTMLElement): void {
        const section = document.createElement('div');
        section.className = 'control-section';
        
        const resetViewBtn = document.createElement('button');
        resetViewBtn.className = 'parameter-button';
        resetViewBtn.textContent = 'Reset View';
        resetViewBtn.onclick = () => this.resetView();
        section.appendChild(resetViewBtn);
        
        panel.appendChild(section);
    }

    createArteryControls(panel: HTMLElement): void {
        const arteryContainer = document.createElement('div');
        arteryContainer.className = 'control-section';

        const toggleGrowthBtn = document.createElement('button');
        toggleGrowthBtn.className = 'parameter-button';
        toggleGrowthBtn.textContent = 'Pause Growth';
        toggleGrowthBtn.onclick = () => {
            if (this.sceneManager.arterySim) {
                this.sceneManager.arterySim.isGrowing = !this.sceneManager.arterySim.isGrowing;
                toggleGrowthBtn.textContent = this.sceneManager.arterySim.isGrowing ? 'Pause Growth' : 'Resume Growth';
            }
        };
        arteryContainer.appendChild(toggleGrowthBtn);

        const resetGrowthBtn = document.createElement('button');
        resetGrowthBtn.className = 'parameter-button';
        resetGrowthBtn.textContent = 'Reset Growth';
        resetGrowthBtn.onclick = () => {
            if (this.sceneManager.arterySim) {
                this.sceneManager.arterySim.reset();
            }
        };
        arteryContainer.appendChild(resetGrowthBtn);

        const speedContainer = document.createElement('div');
        speedContainer.className = 'slider-container';

        const speedLabel = document.createElement('label');
        speedLabel.className = 'control-label';
        speedLabel.textContent = 'Growth Speed';
        speedContainer.appendChild(speedLabel);

        const speedSlider = document.createElement('input');
        speedSlider.className = 'parameter-slider';
        speedSlider.type = 'range';
        speedSlider.min = '50';
        speedSlider.max = '200';
        speedSlider.step = '10';
        speedSlider.value = '100';
        speedSlider.oninput = (e) => this.updateGrowthSpeed((e.target as HTMLInputElement).value);
        speedContainer.appendChild(speedSlider);

        arteryContainer.appendChild(speedContainer);
        panel.appendChild(arteryContainer);
    }

    createFluidControls(panel: HTMLElement): void {
        const fluidContainer = document.createElement('div');
        fluidContainer.className = 'control-section';

        const toggleFillBtn = document.createElement('button');
        toggleFillBtn.className = 'parameter-button';
        toggleFillBtn.textContent = 'Start Filling';
        toggleFillBtn.onclick = () => this.toggleFluidFilling();
        fluidContainer.appendChild(toggleFillBtn);

        panel.appendChild(fluidContainer);
    }

    createLabControls(panel: HTMLElement): void {
        const labContainer = document.createElement('div');
        labContainer.className = 'control-section';

        const toggleLightBtn = document.createElement('button');
        toggleLightBtn.className = 'parameter-button';
        toggleLightBtn.textContent = 'Toggle Overhead Light';
        toggleLightBtn.onclick = () => this.toggleOverheadLight();
        labContainer.appendChild(toggleLightBtn);

        panel.appendChild(labContainer);
    }

    toggleHeartbeat(): void {
        if (this.sceneManager.heartSim) {
            const isBeating = !this.sceneManager.heartSim.isBeating;
            this.sceneManager.heartSim.setBeating(isBeating);
        }
    }

    updateBeatSpeed(speed: string): void {
        if (this.sceneManager.heartSim) {
            this.sceneManager.heartSim.setBeatSpeed(parseFloat(speed));
        }
    }

    resetView(): void {
        if (this.sceneManager.camera) {
            this.sceneManager.camera.resetView();
        }
    }

    updateGrowthSpeed(speed: string): void {
        if (this.sceneManager.arterySim) {
            this.sceneManager.arterySim.growthSpeed = parseInt(speed);
        }
    }

    toggleFluidFilling(): void {
        if (this.sceneManager.fluidSim) {
            if (this.sceneManager.fluidSim.isFlowing) {
                this.sceneManager.fluidSim.stopFilling();
            } else {
                this.sceneManager.fluidSim.startFilling(0.8);
            }
        }
    }

    toggleOverheadLight(): void {
        if (this.sceneManager.labEnvironment) {
            this.sceneManager.labEnvironment.toggleOverheadLight();
        }
    }

    dispose(): void {
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
    }
}
