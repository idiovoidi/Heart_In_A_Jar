import * as THREE from 'three';

export class ArterySimulation {
    constructor(container) {
        this.container = container;
        this.setup();
        this.createArtery();
        this.createControls();
        this.animate();
    }

    setup() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 2;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Add stats for performance monitoring
        this.isAnimating = true;
        this.rotationSpeed = 0.001;
        this.pulseSpeed = 0.02;
        this.pulseStrength = 0.1;
        this.baseRadius = 0.5;
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
    }

    createArtery() {
        // Create a circle geometry (similar to the C++ version)
        const segments = 360;
        const radius = 0.5;
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            vertices.push(
                radius * Math.cos(theta),
                radius * Math.sin(theta),
                0
            );
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices, 3)
        );

        // Create material
        const material = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 2
        });

        // Create the line (artery)
        this.artery = new THREE.LineLoop(geometry, material);
        this.scene.add(this.artery);
    }

    createControls() {
        // Add control panel
        const controls = document.createElement('div');
        controls.style.position = 'absolute';
        controls.style.top = '10px';
        controls.style.left = '10px';
        controls.style.background = 'rgba(0,0,0,0.7)';
        controls.style.padding = '10px';
        controls.style.borderRadius = '5px';
        controls.style.color = 'white';
        
        controls.innerHTML = `
            <div>
                <button id="toggleAnimation">Pause</button>
                <br><br>
                <label>Rotation Speed:</label>
                <input type="range" id="rotationSpeed" min="0" max="0.01" step="0.001" value="${this.rotationSpeed}">
                <br>
                <label>Pulse Speed:</label>
                <input type="range" id="pulseSpeed" min="0" max="0.1" step="0.001" value="${this.pulseSpeed}">
                <br>
                <label>Pulse Strength:</label>
                <input type="range" id="pulseStrength" min="0" max="0.5" step="0.01" value="${this.pulseStrength}">
            </div>
        `;
        
        this.container.appendChild(controls);
        
        // Add event listeners
        document.getElementById('toggleAnimation').addEventListener('click', (e) => {
            this.isAnimating = !this.isAnimating;
            e.target.textContent = this.isAnimating ? 'Pause' : 'Play';
        });
        
        document.getElementById('rotationSpeed').addEventListener('input', (e) => {
            this.rotationSpeed = parseFloat(e.target.value);
        });
        
        document.getElementById('pulseSpeed').addEventListener('input', (e) => {
            this.pulseSpeed = parseFloat(e.target.value);
        });
        
        document.getElementById('pulseStrength').addEventListener('input', (e) => {
            this.pulseStrength = parseFloat(e.target.value);
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isAnimating) {
            // Rotation animation
            this.artery.rotation.z += this.rotationSpeed;
            
            // Pulsing animation
            const time = performance.now() * this.pulseSpeed;
            const scale = this.baseRadius + Math.sin(time) * this.pulseStrength;
            this.artery.scale.set(scale, scale, 1);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
} 