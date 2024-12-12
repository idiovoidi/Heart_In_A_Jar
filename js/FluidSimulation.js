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

    init() {
        // Create preservation jar
        const jar = this.createPreservationJar();
        
        // Create fluid
        const fluid = this.createFluid();
        
        // Create heart base
        const heart = this.createHeartBase();
        
        return {
            jar,
            fluid,
            heart
        };
    }

    createPreservationJar() {
        // Create glass material
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.1,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            envMapIntensity: 1.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
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
                uColor: { value: new THREE.Color(0x990000) }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        const fluidGeometry = new THREE.CylinderGeometry(
            this.jarRadius * 0.95,
            this.jarRadius * 0.95,
            this.jarHeight * 0.9,
            32,
            32,
            true
        );

        return new THREE.Mesh(fluidGeometry, fluidMaterial);
    }

    createHeartBase() {
        const heart = this.heartSim.getMesh();
        heart.position.y = -this.jarHeight / 2 + 1;
        heart.scale.setScalar(0.8);
        return heart;
    }

    update(deltaTime) {
        if (!this.isFlowing) return;
        
        this.time += deltaTime;
        
        // Update fluid shader
        const fluid = this.fluid;
        if (fluid && fluid.material.uniforms) {
            fluid.material.uniforms.uTime.value = this.time;
        }
        
        // Update heart
        this.heartSim.update(deltaTime);
    }
} 