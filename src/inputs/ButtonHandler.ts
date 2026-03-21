// Stub type for SceneManager to avoid circular dependency
type SceneManager = {
    heartSim?: { isBeating: boolean; setBeating(isBeating: boolean): void; setBeatSpeed(speed: number): void };
    arterySim?: unknown;
    fluidSim?: { isFlowing: boolean; startFilling(level: number): void; stopFilling(): void };
    labEnvironment?: { toggleOverheadLight(): void };
    camera?: { resetView(): void };
};

export class ButtonHandler {
    sceneManager: SceneManager;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
        this.createControlPanel();
    }

    createControlPanel(): void {
        const panel = document.createElement('div');
        panel.className = 'control-panel';
        document.body.appendChild(panel);

        this.createHeartControls(panel);
        this.createViewControls(panel);
        this.createArteryControls(panel);
        this.createFluidControls(panel);
        this.createLabControls(panel);
    }

    createHeartControls(panel: HTMLElement): void {
        const toggleBeatBtn = document.createElement('button');
        toggleBeatBtn.textContent = 'Toggle Heartbeat';
        toggleBeatBtn.onclick = () => this.toggleHeartbeat();
        panel.appendChild(toggleBeatBtn);

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
        speedSlider.oninput = (e) => this.updateBeatSpeed((e.target as HTMLInputElement).value);
        speedContainer.appendChild(speedSlider);

        panel.appendChild(speedContainer);
    }

    createViewControls(panel: HTMLElement): void {
        const resetViewBtn = document.createElement('button');
        resetViewBtn.textContent = 'Reset View';
        resetViewBtn.onclick = () => this.resetView();
        panel.appendChild(resetViewBtn);
    }

    createArteryControls(panel: HTMLElement): void {
        const arteryContainer = document.createElement('div');
        arteryContainer.className = 'control-section';

        const toggleGrowthBtn = document.createElement('button');
        toggleGrowthBtn.textContent = 'Pause Growth';
        toggleGrowthBtn.onclick = () => {
            if (this.sceneManager.arterySim) {
                (this.sceneManager.arterySim as { isGrowing: boolean }).isGrowing = !(this.sceneManager.arterySim as { isGrowing: boolean }).isGrowing;
                toggleGrowthBtn.textContent = (this.sceneManager.arterySim as { isGrowing: boolean }).isGrowing ? 'Pause Growth' : 'Resume Growth';
            }
        };
        arteryContainer.appendChild(toggleGrowthBtn);

        const resetGrowthBtn = document.createElement('button');
        resetGrowthBtn.textContent = 'Reset Growth';
        resetGrowthBtn.onclick = () => {
            if (this.sceneManager.arterySim) {
                (this.sceneManager.arterySim as { reset(): void }).reset();
            }
        };
        arteryContainer.appendChild(resetGrowthBtn);

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
        speedSlider.oninput = (e) => this.updateGrowthSpeed((e.target as HTMLInputElement).value);
        speedContainer.appendChild(speedSlider);

        arteryContainer.appendChild(speedContainer);
        panel.appendChild(arteryContainer);
    }

    createFluidControls(panel: HTMLElement): void {
        const fluidContainer = document.createElement('div');
        fluidContainer.className = 'control-section';

        const toggleFillBtn = document.createElement('button');
        toggleFillBtn.textContent = 'Start Filling';
        toggleFillBtn.onclick = () => this.toggleFluidFilling();
        fluidContainer.appendChild(toggleFillBtn);

        panel.appendChild(fluidContainer);
    }

    createLabControls(panel: HTMLElement): void {
        const labContainer = document.createElement('div');
        labContainer.className = 'control-section';

        const toggleLightBtn = document.createElement('button');
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
            (this.sceneManager.arterySim as { growthSpeed: number }).growthSpeed = parseInt(speed);
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
        const panel = document.querySelector('.control-panel');
        if (panel) {
            panel.remove();
        }
    }
}
