import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ArterySimulation {
    constructor(container) {
        this.container = container;
        this.branches = [];
        this.setup();
        this.createArterySystem();
        this.createControls();
        this.animate();
    }

    setup() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        this.camera.position.y = 2;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(ambientLight, directionalLight);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    createBranch(startPoint, direction, length, radius, depth = 0, isArtery = true) {
        if (depth > 8) return; // Limit recursion depth

        const endPoint = new THREE.Vector3()
            .addVectors(
                startPoint,
                direction.clone().multiplyScalar(length)
            );

        // Create tube geometry for the vessel
        const curve = new THREE.CatmullRomCurve3([
            startPoint,
            new THREE.Vector3(
                startPoint.x + (Math.random() - 0.5) * 0.1,
                startPoint.y + (Math.random() - 0.5) * 0.1,
                startPoint.z + (Math.random() - 0.5) * 0.1
            ),
            endPoint
        ]);

        const tubeGeometry = new THREE.TubeGeometry(
            curve,
            12,  // tubular segments
            radius, // radius
            8,    // radial segments
            false  // closed
        );

        const material = new THREE.MeshPhongMaterial({
            color: isArtery ? 0xff0000 : 0x0000ff,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });

        const tube = new THREE.Mesh(tubeGeometry, material);
        this.scene.add(tube);
        this.branches.push(tube);

        // Create sub-branches
        if (depth < 8) {
            const numBranches = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < numBranches; i++) {
                const newDirection = direction.clone()
                    .add(new THREE.Vector3(
                        (Math.random() - 0.5) * 0.8,
                        (Math.random() - 0.5) * 0.8,
                        (Math.random() - 0.5) * 0.8
                    ))
                    .normalize();

                this.createBranch(
                    endPoint,
                    newDirection,
                    length * 0.7,
                    radius * 0.7,
                    depth + 1,
                    isArtery
                );
            }
        }
    }

    createArterySystem() {
        // Create main arteries and veins
        const startPoint = new THREE.Vector3(0, -2, 0);
        const mainDirection = new THREE.Vector3(0, 1, 0);
        
        // Create arterial system (red)
        this.createBranch(startPoint, mainDirection, 1, 0.05, 0, true);
        
        // Create venous system (blue)
        this.createBranch(
            startPoint.clone().add(new THREE.Vector3(0.2, 0, 0)), 
            mainDirection, 
            1, 
            0.05, 
            0, 
            false
        );
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createControls() {
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
                <button id="regenerate">Regenerate Vessels</button>
                <br><br>
                <label>Rotation Speed:</label>
                <input type="range" id="rotationSpeed" min="0" max="0.01" step="0.001" value="0.001">
            </div>
        `;
        
        this.container.appendChild(controls);
        
        document.getElementById('regenerate').addEventListener('click', () => {
            this.branches.forEach(branch => this.scene.remove(branch));
            this.branches = [];
            this.createArterySystem();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
} 