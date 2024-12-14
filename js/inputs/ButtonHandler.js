export class ButtonHandler {
    constructor(simulation) {
        this.simulation = simulation;
        this.setupHandlers();
    }

    setupHandlers() {
        this.handleRegenerate = () => {
            console.log('Regenerating system...');
            this.simulation.isGrowing = false;
            this.simulation.cleanupBranches();
            this.simulation.createArterySystem(true);
            this.simulation.isGrowing = true;
        };

        this.handleGrowNew = () => {
            console.log('Growing new system...');
            this.simulation.isGrowing = false;
            this.simulation.cleanupBranches();
            this.simulation.createArterySystem(false);
            this.simulation.isGrowing = true;
            this.simulation.processGrowthQueue();
        };

        this.handleToggleFluid = (e) => {
            console.log('Toggling fluid...');
            this.simulation.fluidSim.isFlowing = !this.simulation.fluidSim.isFlowing;
            e.target.textContent = this.simulation.fluidSim.isFlowing ? 'Stop Fluid' : 'Start Fluid';
        };

        this.handleHeartBeat = (e) => {
            console.log('Toggling heartbeat...');
            const heartSim = this.simulation.fluidSim.heartSim;
            heartSim.setBeating(!heartSim.isBeating);
            e.target.textContent = heartSim.isBeating ? 'Stop Heart' : 'Start Heart';
        };
    }

    init() {
        console.log('Initializing button controls...');
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `
            <div>
                <button id="regenerate">Regenerate Instant</button>
                <button id="growNew">Grow New System</button>
                <button id="toggleFluid">Start Fluid</button>
                <button id="toggleHeart">Start Heart</button>
                <br><br>
                <label>Growth Speed:</label>
                <input type="range" id="growthSpeed" min="50" max="500" step="50" value="${this.simulation.growthSpeed}">
                <span id="speedValue">${this.simulation.growthSpeed}ms</span>
                <br>
                <label>Flow Rate:</label>
                <input type="range" id="flowRate" min="1" max="100" value="50">
                <br>
                <label>Heart Rate:</label>
                <input type="range" id="heartRate" min="1" max="5" step="0.5" value="2">
            </div>
        `;
        
        this.simulation.container.appendChild(controls);

        // Add event listeners
        document.getElementById('regenerate')?.addEventListener('click', this.handleRegenerate);
        document.getElementById('growNew')?.addEventListener('click', this.handleGrowNew);
        document.getElementById('toggleFluid')?.addEventListener('click', this.handleToggleFluid);
        document.getElementById('toggleHeart')?.addEventListener('click', this.handleHeartBeat);
    }

    dispose() {
        document.getElementById('regenerate')?.removeEventListener('click', this.handleRegenerate);
        document.getElementById('growNew')?.removeEventListener('click', this.handleGrowNew);
        document.getElementById('toggleFluid')?.removeEventListener('click', this.handleToggleFluid);
        document.getElementById('toggleHeart')?.removeEventListener('click', this.handleHeartBeat);
        
        const controls = document.querySelector('.controls');
        if (controls) {
            controls.remove();
        }
    }
} 