import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FluidSimulation } from './FluidSimulation.js';
import { LabEnvironment } from './LabEnvironment.js';

export class ArterySimulation {
    constructor(container) {
        this.container = container;
        this.branches = [];
        this.growthQueue = [];
        this.isGrowing = false;
        this.growthSpeed = 100; // ms between growth steps
        this.fluidSim = new FluidSimulation(container);
        this.labEnvironment = new LabEnvironment();
        this.setup();
        this.createArterySystem();
        this.createControls();
        this.animate();
    }

    setup() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 3, 7);
        this.camera.lookAt(0, 0, 0);

        // Add lab environment
        const lab = this.labEnvironment.getMesh();
        this.scene.add(lab);

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

        // Add preservation jar setup
        const { jar, fluid, heart } = this.fluidSim.init();
        jar.position.y = -0.7;
        fluid.position.y = -0.7;
        heart.position.y = -0.7;
        this.scene.add(jar);
        this.scene.add(fluid);
        this.scene.add(heart);
        this.fluidSim.fluid = fluid;

        // Adjust camera for better view of smaller lab
        this.camera.position.set(3, 0, 4);
        this.controls.target.set(0, -0.7, 0);
    }

    createBranch(startPoint, direction, length, radius, depth = 0, isArtery = true, immediate = true, target = null) {
        if (depth > 12) return;

        const endPoint = new THREE.Vector3()
            .addVectors(
                startPoint,
                direction.clone().multiplyScalar(length)
            );

        // Adjust direction slightly towards target if provided
        if (target) {
            const toTarget = target.clone().sub(endPoint).normalize();
            direction.lerp(toTarget, 0.3);
            direction.normalize();
        }

        const createVessel = () => {
            const curve = new THREE.CatmullRomCurve3([
                startPoint,
                new THREE.Vector3(
                    startPoint.x + (Math.random() - 0.5) * 0.2,
                    startPoint.y + (Math.random() - 0.5) * 0.2,
                    startPoint.z + (Math.random() - 0.5) * 0.2
                ),
                endPoint
            ]);

            const tubeGeometry = new THREE.TubeGeometry(
                curve,
                12,
                radius,
                8,
                false
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

            if (depth < 12) {
                const numBranches = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < numBranches; i++) {
                    const newDirection = direction.clone()
                        .add(new THREE.Vector3(
                            (Math.random() - 0.5) * 0.6,
                            (Math.random() - 0.5) * 0.6,
                            (Math.random() - 0.5) * 0.6
                        ))
                        .normalize();

                    const branchParams = {
                        startPoint: endPoint.clone(),
                        direction: newDirection,
                        length: length * 0.8,
                        radius: radius * 0.7,
                        depth: depth + 1,
                        isArtery: isArtery,
                        target: target
                    };

                    if (immediate) {
                        this.createBranch(
                            branchParams.startPoint,
                            branchParams.direction,
                            branchParams.length,
                            branchParams.radius,
                            branchParams.depth,
                            branchParams.isArtery,
                            true,
                            target
                        );
                    } else {
                        this.growthQueue.push(branchParams);
                    }
                }
            }
        };

        if (immediate) {
            createVessel();
        } else {
            this.growthQueue.push({
                startPoint, direction, length, radius, depth, isArtery,
                execute: createVessel
            });
        }
    }

    processGrowthQueue() {
        if (!this.isGrowing || this.growthQueue.length === 0) return;

        const nextBranch = this.growthQueue.shift();
        if (nextBranch.execute) {
            nextBranch.execute();
        } else {
            this.createBranch(
                nextBranch.startPoint,
                nextBranch.direction,
                nextBranch.length,
                nextBranch.radius,
                nextBranch.depth,
                nextBranch.isArtery,
                false
            );
        }

        setTimeout(() => this.processGrowthQueue(), this.growthSpeed);
    }

    createArterySystem(immediate = true) {
        this.growthQueue = [];
        const startPoint = new THREE.Vector3(0, -0.7, 0); // Adjusted to match jar position
        
        // Create target points for arteries to grow towards
        const targetPoints = [
            new THREE.Vector3(-4, 2, -2),  // Upper left back
            new THREE.Vector3(4, 2, -2),   // Upper right back
            new THREE.Vector3(-4, 2, 2),   // Upper left front
            new THREE.Vector3(4, 2, 2),    // Upper right front
            new THREE.Vector3(-4, -1, -2), // Lower left back
            new THREE.Vector3(4, -1, -2),  // Lower right back
            new THREE.Vector3(-4, -1, 2),  // Lower left front
            new THREE.Vector3(4, -1, 2)    // Lower right front
        ];
        
        // Create arteries growing towards each target
        targetPoints.forEach((target, index) => {
            const direction = target.clone()
                .sub(startPoint)
                .normalize();
            
            const distance = startPoint.distanceTo(target);
            const isArtery = index < 4; // First 4 are arteries, rest are veins
            
            this.createBranch(
                startPoint.clone(),
                direction,
                distance * 0.3, // Initial segment length
                0.03,          // Thinner vessels
                0,
                isArtery,
                immediate,
                target        // Pass target for guidance
            );
        });

        if (!immediate) {
            this.processGrowthQueue();
        }
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
                <button id="regenerate">Regenerate Instant</button>
                <button id="growNew">Grow New System</button>
                <button id="toggleFluid">Toggle Fluid</button>
                <br><br>
                <label>Growth Speed:</label>
                <input type="range" id="growthSpeed" min="50" max="500" step="50" value="${this.growthSpeed}">
                <span id="speedValue">${this.growthSpeed}ms</span>
                <br>
                <label>Flow Rate:</label>
                <input type="range" id="flowRate" min="1" max="100" value="10">
            </div>
        `;
        
        this.container.appendChild(controls);
        
        document.getElementById('regenerate').addEventListener('click', () => {
            this.isGrowing = false;
            this.branches.forEach(branch => this.scene.remove(branch));
            this.branches = [];
            this.createArterySystem(true);
        });

        document.getElementById('growNew').addEventListener('click', () => {
            this.isGrowing = false;
            setTimeout(() => {
                this.branches.forEach(branch => this.scene.remove(branch));
                this.branches = [];
                this.isGrowing = true;
                this.createArterySystem(false);
            }, 100);
        });

        document.getElementById('growthSpeed').addEventListener('input', (e) => {
            this.growthSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = `${this.growthSpeed}ms`;
        });

        document.getElementById('toggleFluid').addEventListener('click', (e) => {
            this.fluidSim.isFlowing = !this.fluidSim.isFlowing;
            e.target.textContent = this.fluidSim.isFlowing ? 'Stop Fluid' : 'Start Fluid';
        });

        document.getElementById('flowRate').addEventListener('input', (e) => {
            this.fluidSim.flowRate = e.target.value * 0.001;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = 0.016; // Approximate for 60fps
        // Update controls
        this.controls.update();
        
        // Update fluid simulation
        this.fluidSim.update(deltaTime);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
} 