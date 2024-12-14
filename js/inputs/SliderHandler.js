export class SliderHandler {
    constructor(simulation) {
        this.simulation = simulation;
        this.setupHandlers();
    }

    setupHandlers() {
        this.handleGrowthSpeed = (e) => {
            this.simulation.growthSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = `${this.simulation.growthSpeed}ms`;
        };

        this.handleFlowRate = (e) => {
            this.simulation.fluidSim.flowRate = e.target.value * 0.001;
        };
    }

    init() {
        document.getElementById('growthSpeed').addEventListener('input', this.handleGrowthSpeed);
        document.getElementById('flowRate').addEventListener('input', this.handleFlowRate);
    }

    dispose() {
        document.getElementById('growthSpeed')?.removeEventListener('input', this.handleGrowthSpeed);
        document.getElementById('flowRate')?.removeEventListener('input', this.handleFlowRate);
    }
} 