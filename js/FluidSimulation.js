import * as THREE from 'three';
import { FluidShader } from './shaders/FluidShader.js';
import { HeartSimulation } from './HeartSimulation.js';

export class FluidSimulation {
    constructor(container) {
        this.container = container;
        this.isFlowing = false;
        this.time = 0;
        this.heartSim = new HeartSimulation();
        
        // Jar dimensions
        this.jarHeight = 4;
        this.jarRadius = 1.5;
        this.jarThickness = 0.05;
    }

    dispose() {
        // Dispose of jar meshes
        if (this.jar) {
            this.jar.traverse(child => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    child.material.dispose();
                }
            });
        }

        // Dispose of fluid mesh
        if (this.fluid) {
            if (this.fluid.geometry) {
                this.fluid.geometry.dispose();
            }
            if (this.fluid.material) {
                this.fluid.material.dispose();
            }
        }

        // Dispose of heart simulation
        if (this.heartSim) {
            this.heartSim.dispose();
        }

        this.isFlowing = false;
        this.time = 0;
    }

    init() {
        const jar = this.createPreservationJar();
        const fluid = this.createFluid();
        const heart = this.createHeartBase();
        
        // Set higher render order values
        jar.renderOrder = 10;
        fluid.renderOrder = 20;
        heart.renderOrder = 30;
        
        // Scale down the jar and contents
        jar.scale.set(0.5, 0.5, 0.5);
        fluid.scale.set(0.5, 0.5, 0.5);
        
        this.jar = jar;
        this.fluid = fluid;
        this.heart = heart;
        
        return { jar, fluid, heart };
    }

    createPreservationJar() {
        // Create glass material with adjusted properties
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
            envMapIntensity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            depthWrite: false,     // Disable depth writing
            depthTest: false,      // Disable depth testing
            blending: THREE.NormalBlending  // Changed from CustomBlending
        });

        // Create jar geometry
        const jarGeometry = new THREE.CylinderGeometry(
            this.jarRadius,
            this.jarRadius,
            this.jarHeight,
            32,
            1,
            true
        );
        
        const jar = new THREE.Mesh(jarGeometry, glassMaterial);

        // Create lid
        const lidGeometry = new THREE.CylinderGeometry(
            this.jarRadius + this.jarThickness,
            this.jarRadius + this.jarThickness,
            this.jarThickness,
            32
        );
        const lid = new THREE.Mesh(lidGeometry, glassMaterial);
        lid.position.y = this.jarHeight / 2;

        // Create base
        const baseGeometry = new THREE.CylinderGeometry(
            this.jarRadius + this.jarThickness,
            this.jarRadius + this.jarThickness,
            this.jarThickness,
            32
        );
        const base = new THREE.Mesh(baseGeometry, glassMaterial);
        base.position.y = -this.jarHeight / 2;

        const jarGroup = new THREE.Group();
        jarGroup.add(jar);
        jarGroup.add(lid);
        jarGroup.add(base);

        return jarGroup;
    }

    createFluid() {
        const fluidMaterial = new THREE.ShaderMaterial({
            vertexShader: FluidShader.vertexShader,
            fragmentShader: FluidShader.fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0x660000) },
                uFlowSpeed: { value: 1.0 }
            },
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
            depthTest: false,      // Disable depth testing
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        const fluidGeometry = new THREE.CylinderGeometry(
            this.jarRadius * 0.9,
            this.jarRadius * 0.9,
            this.jarHeight * 0.85,
            32,
            32,
            true
        );

        const fluid = new THREE.Mesh(fluidGeometry, fluidMaterial);
        fluid.renderOrder = 2;
        this.fluid = fluid;
        return fluid;
    }

    createHeartBase() {
        const heart = this.heartSim.getMesh();
        // Adjust position for larger heart
        heart.position.y = -this.jarHeight / 3.2; // Moved up slightly
        heart.position.z = 0;
        heart.position.x = 0;
        return heart;
    }

    update(deltaTime) {
        if (!this.isFlowing) return;
        
        this.time += deltaTime;
        
        // Update fluid shader with more noticeable movement
        if (this.fluid && this.fluid.material.uniforms) {
            this.fluid.material.uniforms.uTime.value = this.time;
            // Update flow speed based on slider value
            this.fluid.material.uniforms.uFlowSpeed.value = this.flowRate || 1.0;
        }
        
        // Update heart
        this.heartSim.update(deltaTime);
    }

    setFlowRate(rate) {
        this.flowRate = rate;
    }
} 