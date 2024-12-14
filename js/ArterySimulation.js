import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FluidSimulation } from './FluidSimulation.js';
import { LabEnvironment } from './LabEnvironment.js';
import { InputManager } from './inputs/InputManager.js';

export class ArterySimulation {
    constructor(container) {
        if (!container) {
            console.error('Container element not found');
            return;
        }
        
        console.log('Initializing ArterySimulation...');
        
        try {
            this.container = container;
            this.branches = [];
            this.growthQueue = [];
            this.isGrowing = false;
            this.growthSpeed = 100;
            
            console.log('Creating FluidSimulation...');
            this.fluidSim = new FluidSimulation(container);
            
            console.log('Setting up scene...');
            this.setup();
            
            console.log('Creating artery system...');
            this.createArterySystem(false);
            
            console.log('Creating controls...');
            this.inputManager = new InputManager(this);
            this.inputManager.init();
            
            console.log('Starting animation loop...');
            this.animate();
        } catch (error) {
            console.error('Error initializing ArterySimulation:', error);
        }
    }

    dispose() {
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize);
        
        // Dispose of branches
        this.cleanupBranches();

        // Dispose of fluid simulation
        if (this.fluidSim) {
            this.fluidSim.dispose();
        }

        // Clear scene
        while(this.scene.children.length > 0) { 
            const object = this.scene.children[0];
            this.scene.remove(object);
        }

        // Dispose of lights
        this.scene.traverse(object => {
            if (object.isLight) {
                object.dispose();
            }
        });

        // Dispose of controls
        if (this.controls) {
            this.controls.dispose();
        }

        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement.remove();
            this.renderer = null;
        }

        // Clear growth queue
        this.growthQueue = [];
        this.isGrowing = false;

        // Clear references
        this.scene = null;
        this.camera = null;
        this.controls = null;

        // Add input manager disposal
        if (this.inputManager) {
            this.inputManager.dispose();
        }
    }

    cleanupBranches() {
        this.branches.forEach(branch => {
            if (branch.geometry) {
                branch.geometry.dispose();
            }
            if (branch.material) {
                branch.material.dispose();
            }
            this.scene.remove(branch);
        });
        this.branches = [];
    }

    setup() {
        try {
            // Scene setup
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x111111);
            
            // Camera setup
            this.camera = new THREE.PerspectiveCamera(
                45,  // narrower FOV
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            
            // Initial camera setup
            this.camera.position.set(3, 0, 4);
            this.camera.zoom = 1.0;
            this.camera.updateProjectionMatrix();
            this.camera.lookAt(0, -0.35, 0);
            
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

            // Controls setup
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 2;
            this.controls.maxDistance = 10;
            this.controls.enablePan = false;
            this.controls.maxPolarAngle = Math.PI * 0.75;
            this.controls.minPolarAngle = Math.PI * 0.25;
            this.controls.target.set(0, -0.35, 0);
            this.controls.update();

            // Handle window resize
            this.onWindowResize = () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', this.onWindowResize, false);

            console.log('Setting up fluid simulation...');
            // Add preservation jar setup
            const { jar, fluid, heart } = this.fluidSim.init();
            jar.position.y = -0.35;
            fluid.position.y = -0.35;
            heart.position.y = -0.35;
            
            console.log('Adding objects to scene...');
            this.scene.add(jar);
            this.scene.add(fluid);
            this.scene.add(heart);
            this.fluidSim.fluid = fluid;

            // Set initial camera and controls position
            this.controls.target.set(0, -0.35, 0);
            
            console.log('Setup complete');
        } catch (error) {
            console.error('Error in setup:', error);
            throw error;
        }
    }

    createBranch(startPoint, direction, length, radius, depth = 0, isArtery = true, immediate = false) {
        if (depth > 8) return;

        const endPoint = new THREE.Vector3()
            .addVectors(
                startPoint,
                direction.clone().multiplyScalar(length)
            );

        const createVessel = () => {
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
                12,
                radius,
                8,
                false
            );

            const material = new THREE.MeshPhongMaterial({
                color: isArtery ? 0xff0000 : 0x0000ff,
                shininess: 100,
                transparent: false,
                side: THREE.DoubleSide,
                depthWrite: true,
                depthTest: true
            });

            const tube = new THREE.Mesh(tubeGeometry, material);
            tube.renderOrder = 4;
            this.scene.add(tube);
            this.branches.push(tube);

            // Queue sub-branches
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

                    const branchParams = {
                        startPoint: endPoint.clone(),
                        direction: newDirection,
                        length: length * 0.7,
                        radius: radius * 0.7,
                        depth: depth + 1,
                        isArtery: isArtery
                    };

                    if (immediate) {
                        this.createBranch(
                            branchParams.startPoint,
                            branchParams.direction,
                            branchParams.length,
                            branchParams.radius,
                            branchParams.depth,
                            branchParams.isArtery,
                            true
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

    createArterySystem(immediate = false) {
        this.growthQueue = [];
        const startPoint = new THREE.Vector3(0, -0.35, 0);
        
        this.createBranch(startPoint, new THREE.Vector3(0, 1, 0), 1, 0.05, 0, true, immediate);
        this.createBranch(
            startPoint.clone().add(new THREE.Vector3(0.2, 0, 0)),
            new THREE.Vector3(0, 1, 0),
            1,
            0.05,
            0,
            false,
            immediate
        );

        if (!immediate) {
            this.isGrowing = true;
            this.processGrowthQueue();
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        try {
            if (!this.container.isConnected) {
                console.log('Container disconnected, disposing...');
                this.dispose();
                return;
            }

            requestAnimationFrame(() => this.animate());
            
            const deltaTime = 0.016;
            this.controls.update();
            this.fluidSim.update(deltaTime);
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
} 