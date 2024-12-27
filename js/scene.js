import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { LabJar } from './LabJar.js';
import { HeartSimulation } from './HeartSimulation.js';
import { FleshClumps } from './FleshClumps.js';
import { ButtonHandler } from './inputs/ButtonHandler.js';
import { ArterySimulation } from './ArterySimulation.js';

export class Scene {
    constructor(container) {
        if (!container) {
            console.error('Container element not found');
            return;
        }

        console.log('Initializing Scene...');
        this.container = container;
        this.clock = new THREE.Clock();
        this.init();
    }

    init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLighting();
            this.setupControls();
            this.setupObjects();
            this.setupEventListeners();
            this.setupPostProcessing();

            console.log('Starting animation loop...');
            this.animate();
        } catch (error) {
            console.error('Error initializing Scene:', error);
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 8);
        this.camera.lookAt(0, -1, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
        backLight.position.set(-5, -5, -5);
        
        this.scene.add(ambientLight, directionalLight, backLight);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;
        this.controls.enablePan = false;
        this.controls.maxPolarAngle = Math.PI * 0.75;
        this.controls.minPolarAngle = Math.PI * 0.25;
        this.controls.target.set(0, -1, 0);
        this.controls.update();

        this.inputHandler = new ButtonHandler(this);
    }

    setupObjects() {
        try {
            // Setup jar
            console.log('Setting up jar...');
            this.jar = new LabJar().getMesh();
            this.jar.scale.set(1.2, 1.2, 1.2);
            this.jar.position.y = -1;
            this.scene.add(this.jar);

            // Setup heart
            console.log('Setting up heart...');
            this.heartSim = new HeartSimulation();
            this.heart = this.heartSim.getMesh();
            this.heart.scale.set(0.25, 0.25, 0.25);
            this.heart.position.set(0, -1.8, 0);
            this.heart.rotation.x = Math.PI * 0.15;
            this.scene.add(this.heart);

            // Setup artery system
            console.log('Setting up artery system...');
            this.arterySim = new ArterySimulation();
            this.arterySim.createArterySystem();
            this.arterySystem = this.arterySim.getMesh();
            this.arterySystem.scale.set(0.25, 0.25, 0.25);
            this.arterySystem.position.copy(this.heart.position);
            this.arterySystem.rotation.copy(this.heart.rotation);
            this.scene.add(this.arterySystem);

            // Setup flesh clumps
            console.log('Setting up flesh clumps...');
            this.fleshClumps = new FleshClumps(1.5);
            const fleshClumpsMesh = this.fleshClumps.getMesh();
            fleshClumpsMesh.position.set(0, -2, 0);
            fleshClumpsMesh.scale.set(0.3, 0.15, 0.3);
            this.scene.add(fleshClumpsMesh);
            
            console.log('All objects setup complete');
        } catch (error) {
            console.error('Error in setupObjects:', error);
            console.error(error.stack);
            throw error;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if (!this.container.isConnected) {
            console.log('Container disconnected, disposing...');
            this.dispose();
            return;
        }

        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(0.1, this.clock.getDelta());
        
        if (this.controls) this.controls.update();
        if (this.heartSim) {
            this.heartSim.update(deltaTime);
        }
        if (this.arterySim) {
            this.arterySim.update(deltaTime);
        }
        if (this.fleshClumps) {
            this.fleshClumps.update(deltaTime);
        }
        
        this.composer.render();
    }

    dispose() {
        this.scene.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        if (this.renderer) this.renderer.dispose();
        if (this.composer) this.composer.dispose();
        if (this.controls) this.controls.dispose();
        if (this.heartSim) this.heartSim.dispose();
        if (this.arterySim) {
            this.arterySim.dispose();
        }
        if (this.fleshClumps) this.fleshClumps.dispose();

        window.removeEventListener('resize', this.onWindowResize);
    }
}