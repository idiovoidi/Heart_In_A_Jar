import * as THREE from 'three';

export class ScrollHandler {
    constructor(simulation) {
        this.simulation = simulation;
        this.camera = simulation.camera;
        this.controls = simulation.controls;
        
        // Camera constraints
        this.minZoom = 0.5;
        this.maxZoom = 2.0;
        this.zoomSpeed = 0.1;
        
        // Initial camera setup
        this.defaultPosition = new THREE.Vector3(3, 0, 4);
        this.targetPosition = new THREE.Vector3(0, -0.35, 0);
        
        this.handleWheel = this.handleWheel.bind(this);
    }

    init() {
        this.simulation.container.addEventListener('wheel', this.handleWheel, { passive: false });
        
        // Set initial camera position and zoom
        this.camera.position.copy(this.defaultPosition);
        this.camera.zoom = 1.0; // Set initial zoom
        this.camera.updateProjectionMatrix();
        this.controls.target.copy(this.targetPosition);
        this.controls.update();
    }

    handleWheel(event) {
        event.preventDefault();
        
        const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = THREE.MathUtils.clamp(
            this.camera.zoom + zoomDelta,
            this.minZoom,
            this.maxZoom
        );
        
        this.camera.zoom = newZoom;
        this.camera.updateProjectionMatrix();
        this.controls.update();
    }

    dispose() {
        this.simulation.container.removeEventListener('wheel', this.handleWheel);
    }
} 