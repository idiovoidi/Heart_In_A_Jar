/**
 * InteractiveGrowthControls
 * Handles user interaction for vessel growth simulation
 * - Click on heart to spawn new growth points
 * - Add VEGF (Vascular Endothelial Growth Factor) sources to attract vessels
 * - Visualize attractor points and growth nodes
 */

export class InteractiveGrowthControls {
    constructor(scene, vesselGrowthSystem, canvas) {
        this.scene = scene;
        this.vesselGrowth = vesselGrowthSystem;
        this.canvas = canvas;
        
        // State
        this.vegfSources = [];
        this.visualizers = [];
        this.isVisualizingAttractors = false;
        this.isVisualizingNodes = false;
        
        // Setup
        this.setupInputHandling();
        this.createUI();
    }
    
    setupInputHandling() {
        // Pointer events for clicking on the heart
        this.scene.onPointerDown = (evt, pickResult) => {
            if (pickResult.hit && pickResult.pickedMesh) {
                const pickedPoint = pickResult.pickedPoint;
                
                // Check if we clicked on the heart (or near it)
                const heartPos = new BABYLON.Vector3(0, -1.9, 0);
                const distToHeart = BABYLON.Vector3.Distance(pickedPoint, heartPos);
                
                if (distToHeart < 2.0) {
                    // Spawn new growth from clicked point
                    this.spawnGrowthAt(pickedPoint).catch(console.error);
                }
            }
        };
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'v':
                case 'V':
                    this.toggleAttractorVisualization();
                    break;
                case 'n':
                case 'N':
                    this.toggleNodeVisualization();
                    break;
                case 'c':
                case 'C':
                    this.clearVEGFSources();
                    break;
                case 'r':
                case 'R':
                    this.resetGrowth();
                    break;
            }
        });
    }
    
    /**
     * Spawn a new growth point at a specific location
     */
    async spawnGrowthAt(position, direction = null) {
        if (!direction) {
            // Default direction: outward from heart center
            const heartPos = new BABYLON.Vector3(0, -1.9, 0);
            direction = position.subtract(heartPos).normalize();
            direction.y += 0.3; // Slight upward bias
            direction.normalize();
        }
        
        // Create a new growth node in the existing system
        const { GrowthNode } = await import('./VesselGrowthSystem.js');
        const newNode = new GrowthNode(
            position, 
            null, 
            0.15, 
            direction, 
            0
        );
        
        this.vesselGrowth.growthNodes.push(newNode);
        
        // Visual feedback
        this.showSpawnEffect(position);
        
        console.log('Spawned new growth at:', position);
    }
    
    /**
     * Add a VEGF source that attracts vessel growth
     */
    addVEGFSource(position, strength = 1.0, radius = 3.0) {
        // Create visual representation
        const sphere = BABYLON.MeshBuilder.CreateSphere("vegf_source", {
            diameter: 0.2,
            segments: 16
        }, this.scene);
        
        sphere.position = position.clone();
        
        const material = new BABYLON.PBRMaterial("vegfMat", this.scene);
        material.albedoColor = new BABYLON.Color3(0.2, 1.0, 0.2);
        material.emissiveColor = new BABYLON.Color3(0.1, 0.5, 0.1);
        material.alpha = 0.6;
        sphere.material = material;
        
        // Pulsing animation
        const animation = new BABYLON.Animation(
            "vegfPulse",
            "scaling",
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        const keys = [
            { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
            { frame: 30, value: new BABYLON.Vector3(1.5, 1.5, 1.5) },
            { frame: 60, value: new BABYLON.Vector3(1, 1, 1) }
        ];
        
        animation.setKeys(keys);
        sphere.animations.push(animation);
        this.scene.beginAnimation(sphere, 0, 60, true);
        
        // Store VEGF source
        const vegfSource = {
            mesh: sphere,
            position: position.clone(),
            strength: strength,
            radius: radius,
            created: Date.now()
        };
        
        this.vegfSources.push(vegfSource);
        
        // Add attractors around the VEGF source
        this.addAttractorsAroundPoint(position, radius, Math.floor(strength * 5)).catch(console.error);
        
        return vegfSource;
    }
    
    /**
     * Add multiple attractor points around a position
     */
    async addAttractorsAroundPoint(center, radius, count) {
        const { Attractor } = await import('./VesselGrowthSystem.js');
        
        for (let i = 0; i < count; i++) {
            // Random point in sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.cbrt(Math.random()) * radius;
            
            const point = new BABYLON.Vector3(
                center.x + r * Math.sin(phi) * Math.cos(theta),
                center.y + r * Math.cos(phi),
                center.z + r * Math.sin(phi) * Math.sin(theta)
            );
            
            // Check validity
            if (this.vesselGrowth.isValidAttractor(point)) {
                this.vesselGrowth.attractors.push(new Attractor(point));
            }
        }
        
        console.log(`Added ${count} attractors around VEGF source`);
    }
    
    /**
     * Clear all VEGF sources
     */
    clearVEGFSources() {
        this.vegfSources.forEach(source => {
            source.mesh.dispose();
        });
        this.vegfSources = [];
        console.log('Cleared all VEGF sources');
    }
    
    /**
     * Reset the growth system
     */
    resetGrowth() {
        this.vesselGrowth.reset();
        this.clearVEGFSources();
        console.log('Growth system reset');
    }
    
    /**
     * Show spawn effect animation
     */
    showSpawnEffect(position) {
        const particleSystem = new BABYLON.ParticleSystem("spawnEffect", 50, this.scene);
        
        // Create particle texture
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", this.scene);
        
        particleSystem.emitter = position;
        particleSystem.minEmitBox = new BABYLON.Vector3(-0.1, -0.1, -0.1);
        particleSystem.maxEmitBox = new BABYLON.Vector3(0.1, 0.1, 0.1);
        
        particleSystem.color1 = new BABYLON.Color4(1, 0.2, 0.2, 1);
        particleSystem.color2 = new BABYLON.Color4(1, 0.5, 0.2, 1);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
        
        particleSystem.minSize = 0.05;
        particleSystem.maxSize = 0.15;
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 0.8;
        particleSystem.emitRate = 100;
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        particleSystem.gravity = new BABYLON.Vector3(0, 0.5, 0);
        particleSystem.direction1 = new BABYLON.Vector3(-1, 1, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1);
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;
        particleSystem.speed = 1;
        
        particleSystem.start();
        
        // Stop after short burst
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => particleSystem.dispose(), 1000);
        }, 200);
    }
    
    /**
     * Toggle visualization of attractor points
     */
    toggleAttractorVisualization() {
        this.isVisualizingAttractors = !this.isVisualizingAttractors;
        
        if (this.isVisualizingAttractors) {
            // Create spheres for each attractor
            const material = new BABYLON.StandardMaterial("attractorMat", this.scene);
            material.diffuseColor = new BABYLON.Color3(0, 1, 0);
            material.alpha = 0.3;
            
            this.vesselGrowth.attractors.forEach((attractor, index) => {
                if (!attractor.consumed) {
                    const sphere = BABYLON.MeshBuilder.CreateSphere(`attractor_${index}`, {
                        diameter: 0.08
                    }, this.scene);
                    sphere.position = attractor.position.clone();
                    sphere.material = material;
                    sphere.isPickable = false;
                    this.visualizers.push(sphere);
                }
            });
            
            console.log(`Visualizing ${this.visualizers.length} attractors`);
        } else {
            // Clear visualizers
            this.visualizers.forEach(v => v.dispose());
            this.visualizers = [];
        }
    }
    
    /**
     * Toggle visualization of active growth nodes
     */
    toggleNodeVisualization() {
        this.isVisualizingNodes = !this.isVisualizingNodes;
        
        if (this.isVisualizingNodes) {
            // Create spheres for active growth nodes
            const material = new BABYLON.StandardMaterial("nodeMat", this.scene);
            material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            material.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
            
            const activeNodes = this.vesselGrowth.growthNodes.filter(n => n.active);
            
            activeNodes.forEach((node, index) => {
                const sphere = BABYLON.MeshBuilder.CreateSphere(`node_${index}`, {
                    diameter: 0.12
                }, this.scene);
                sphere.position = node.position.clone();
                sphere.material = material;
                sphere.isPickable = false;
                this.visualizers.push(sphere);
            });
            
            console.log(`Visualizing ${activeNodes.length} growth nodes`);
        } else {
            // Clear visualizers
            this.visualizers.forEach(v => v.dispose());
            this.visualizers = [];
        }
    }
    
    /**
     * Create UI panel for controls
     */
    createUI() {
        // Create HTML UI overlay
        const uiContainer = document.createElement('div');
        uiContainer.id = 'growthControls';
        uiContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            z-index: 1000;
            min-width: 200px;
        `;
        
        uiContainer.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">Growth Controls</h3>
            <div style="margin-bottom: 8px;">
                <strong>Click on heart</strong> to spawn growth
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">V</kbd> Toggle attractor view
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">N</kbd> Toggle node view
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">C</kbd> Clear VEGF sources
            </div>
            <div style="margin-bottom: 5px;">
                <kbd style="background: #444; padding: 2px 6px; border-radius: 3px;">R</kbd> Reset growth
            </div>
            <div style="margin-top: 10px; font-size: 11px; color: #aaa;">
                VEGF Sources: <span id="vegfCount">0</span>
            </div>
            <div style="margin-top: 5px; font-size: 11px; color: #aaa;">
                Vessels: <span id="vesselCount">0</span>
            </div>
        `;
        
        document.body.appendChild(uiContainer);
        
        // Update counts periodically
        setInterval(() => {
            const vegfCount = document.getElementById('vegfCount');
            const vesselCount = document.getElementById('vesselCount');
            if (vegfCount) vegfCount.textContent = this.vegfSources.length;
            if (vesselCount && this.vesselGrowth) {
                vesselCount.textContent = this.vesselGrowth.vessels.length;
            }
        }, 500);
    }
    
    /**
     * Dispose all resources
     */
    dispose() {
        this.clearVEGFSources();
        this.visualizers.forEach(v => v.dispose());
        
        const ui = document.getElementById('growthControls');
        if (ui) ui.remove();
        
        this.scene.onPointerDown = null;
    }
}
