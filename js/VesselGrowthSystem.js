/**
 * Space Colonization Vessel Growth System
 * Implements biological vascular growth using attractor points and tip cell migration
 */

export class VesselGrowthSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.growthNodes = [];
        this.attractors = [];
        this.vessels = [];
        this.obstacles = [];
        
        // Growth parameters
        this.segmentLength = options.segmentLength || 0.3;
        this.branchAngle = options.branchAngle || Math.PI / 6;
        this.maxBranches = options.maxBranches || 200;
        this.attractionRadius = options.attractionRadius || 2.0;
        this.killRadius = options.killRadius || 0.2;
        this.minRadius = options.minRadius || 0.02;
        this.maxRadius = options.maxRadius || 0.25;
        this.growthSpeed = options.growthSpeed || 100; // ms per segment
        this.branchProbability = options.branchProbability || 0.3;
        
        // L-system parameters
        this.axiom = options.axiom || 'A';
        this.rules = options.rules || {
            'A': 'AB',
            'B': 'A[B]A'
        };
        this.iterations = options.iterations || 4;
        
        // Growth state
        this.isGrowing = false;
        this.growthQueue = [];
        this.completedVessels = [];
        this.time = 0;
        
        // Create base material
        this.vesselMaterial = this.createVesselMaterial();
        
        // Root group for all vessels
        this.rootNode = new BABYLON.TransformNode("vesselRoot", scene);
    }
    
    createVesselMaterial() {
        const material = new BABYLON.PBRMaterial("vesselMat", this.scene);
        material.albedoColor = new BABYLON.Color3(0.75, 0.1, 0.05);
        material.roughness = 0.35;
        material.metallic = 0.1;
        material.subSurface.isTranslucencyEnabled = true;
        material.subSurface.translucencyIntensity = 0.6;
        return material;
    }
    
    /**
     * Initialize growth from a seed point (e.g., heart surface)
     * @param {BABYLON.Vector3} seedPoint - Starting position
     * @param {BABYLON.Vector3} initialDirection - Initial growth direction
     * @param {number} radius - Initial vessel radius
     */
    initializeFromSeed(seedPoint, initialDirection, radius = 0.2) {
        // Create initial growth node (tip cell)
        const rootNode = new GrowthNode(seedPoint, null, radius, initialDirection, 0);
        this.growthNodes.push(rootNode);
        
        // Generate attractor points in the growth volume
        this.generateAttractors();
        
        // Start growth process
        this.isGrowing = true;
        this.processGrowth();
        
        return rootNode;
    }
    
    /**
     * Generate attractor points using space colonization
     * Creates a cloud of points that will guide vessel growth
     */
    generateAttractors() {
        this.attractors = [];
        
        // Create attractors in a volume around the heart
        // This simulates tissue regions that need vascularization
        const numAttractors = 150;
        const volumeRadius = 3.0;
        const heartPosition = new BABYLON.Vector3(0, -1.9, 0);
        
        for (let i = 0; i < numAttractors; i++) {
            // Use rejection sampling for better distribution
            let point;
            let valid = false;
            let attempts = 0;
            
            while (!valid && attempts < 50) {
                // Random point in spherical volume
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = Math.cbrt(Math.random()) * volumeRadius;
                
                point = new BABYLON.Vector3(
                    heartPosition.x + r * Math.sin(phi) * Math.cos(theta),
                    heartPosition.y + r * Math.cos(phi) * 0.8, // Slightly flattened
                    heartPosition.z + r * Math.sin(phi) * Math.sin(theta)
                );
                
                // Check if point is valid (not inside obstacles)
                valid = this.isValidAttractor(point);
                attempts++;
            }
            
            if (valid) {
                this.attractors.push(new Attractor(point));
            }
        }
        
        console.log(`Generated ${this.attractors.length} attractor points`);
    }
    
    /**
     * Check if an attractor position is valid (not inside heart/jar walls)
     */
    isValidAttractor(point) {
        const heartPosition = new BABYLON.Vector3(0, -1.9, 0);
        const distToHeart = BABYLON.Vector3.Distance(point, heartPosition);
        
        // Keep attractors outside heart surface but inside jar
        if (distToHeart < 1.0) return false;
        if (distToHeart > 4.5) return false;
        
        // Avoid being too close to existing attractors (Poisson disk-like)
        for (const attractor of this.attractors) {
            if (BABYLON.Vector3.Distance(point, attractor.position) < 0.3) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Main growth processing loop
     */
    processGrowth() {
        if (!this.isGrowing || this.vessels.length >= this.maxBranches) {
            this.isGrowing = false;
            return;
        }
        
        // Process each growth node
        const activeNodes = this.growthNodes.filter(n => n.active);
        
        if (activeNodes.length === 0) {
            this.isGrowing = false;
            console.log('Growth complete. Total vessels:', this.vessels.length);
            return;
        }
        
        // For each active growth node, find closest attractors and grow toward them
        for (const node of activeNodes) {
            this.growNodeTowardAttractors(node);
        }
        
        // Remove consumed attractors
        this.attractors = this.attractors.filter(a => !a.consumed);
        
        // Schedule next growth step
        setTimeout(() => this.processGrowth(), this.growthSpeed);
    }
    
    /**
     * Grow a single node toward its attractors
     */
    growNodeTowardAttractors(node) {
        // Find attractors within attraction radius
        const nearbyAttractors = this.attractors.filter(a => {
            const dist = BABYLON.Vector3.Distance(node.position, a.position);
            return dist < this.attractionRadius && !a.consumed;
        });
        
        if (nearbyAttractors.length === 0) {
            // No attractors nearby - check if we should branch via L-system rules
            this.applyLSystemRules(node);
            return;
        }
        
        // Calculate average direction toward attractors
        const direction = new BABYLON.Vector3(0, 0, 0);
        let consumedCount = 0;
        
        for (const attractor of nearbyAttractors) {
            const toAttractor = attractor.position.subtract(node.position).normalize();
            direction.addInPlace(toAttractor);
            
            // Mark attractors within kill radius as consumed
            if (BABYLON.Vector3.Distance(node.position, attractor.position) < this.killRadius) {
                attractor.consumed = true;
                consumedCount++;
            }
        }
        
        direction.normalize();
        
        // Add some randomness for organic growth
        direction.x += (Math.random() - 0.5) * 0.2;
        direction.y += (Math.random() - 0.5) * 0.2;
        direction.z += (Math.random() - 0.5) * 0.2;
        direction.normalize();
        
        // Create new vessel segment
        this.createVesselSegment(node, direction);
    }
    
    /**
     * Apply L-system rules for branching patterns
     */
    applyLSystemRules(node) {
        // L-system inspired branching when no attractors guide growth
        if (Math.random() < this.branchProbability && node.generation < this.iterations) {
            // Branch into two directions
            const angle = this.branchAngle + (Math.random() - 0.5) * 0.2;
            
            // Left branch
            const leftDir = this.rotateVector(node.direction, angle, new BABYLON.Vector3(0, 1, 0));
            this.createVesselSegment(node, leftDir, true);
            
            // Right branch  
            const rightDir = this.rotateVector(node.direction, -angle, new BABYLON.Vector3(0, 1, 0));
            this.createVesselSegment(node, rightDir, true);
            
            node.active = false; // Parent node stops growing after branching
        }
    }
    
    /**
     * Create a new vessel segment extending from a node
     */
    createVesselSegment(parentNode, direction, isBranch = false) {
        const startPoint = parentNode.position.clone();
        
        // Calculate end point with segment length
        let endPoint = startPoint.add(direction.scale(this.segmentLength));
        
        // Check for collisions/obstacles
        endPoint = this.avoidObstacles(startPoint, endPoint);
        
        // Update direction after obstacle avoidance
        direction = endPoint.subtract(startPoint).normalize();
        
        // Calculate radius (tapers with generation)
        const radius = Math.max(this.minRadius, parentNode.radius * 0.85);
        
        // Create curved path for more organic look
        const path = this.createCurvedPath(startPoint, endPoint, direction);
        
        // Create the vessel mesh
        const vessel = BABYLON.MeshBuilder.CreateTube("vessel_" + this.vessels.length, {
            path: path,
            radius: radius,
            tessellation: 12,
            cap: BABYLON.Mesh.CAP_ALL,
            updatable: true
        }, this.scene);
        
        vessel.material = this.vesselMaterial.clone("vesselMat_" + this.vessels.length);
        vessel.parent = this.rootNode;
        
        // Store vessel data
        const vesselData = {
            mesh: vessel,
            startPoint: startPoint,
            endPoint: endPoint,
            radius: radius,
            parent: parentNode,
            children: [],
            generation: parentNode.generation + 1
        };
        
        this.vessels.push(vesselData);
        parentNode.children.push(vesselData);
        
        // Create new growth node at the end
        const newNode = new GrowthNode(endPoint, vesselData, radius, direction, parentNode.generation + 1);
        this.growthNodes.push(newNode);
        
        return vesselData;
    }
    
    /**
     * Create a curved path between two points for organic vessel shape
     */
    createCurvedPath(start, end, direction) {
        const path = [start.clone()];
        const segments = 8;
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const point = BABYLON.Vector3.Lerp(start, end, t);
            
            // Add slight curve variation
            if (i > 0 && i < segments - 1) {
                const variation = 0.03;
                point.x += (Math.random() - 0.5) * variation;
                point.y += (Math.random() - 0.5) * variation;
                point.z += (Math.random() - 0.5) * variation;
            }
            
            path.push(point);
        }
        
        path.push(end.clone());
        return path;
    }
    
    /**
     * Avoid obstacles (heart, jar walls) when growing
     */
    avoidObstacles(start, end) {
        const heartPosition = new BABYLON.Vector3(0, -1.9, 0);
        const result = end.clone();
        
        // Check distance to heart
        const distToHeart = BABYLON.Vector3.Distance(result, heartPosition);
        if (distToHeart < 1.1) {
            // Push away from heart surface
            const away = result.subtract(heartPosition).normalize();
            result.addInPlace(away.scale(1.1 - distToHeart + 0.1));
        }
        
        // Check jar walls (cylinder constraint)
        const distFromCenter = Math.sqrt(result.x * result.x + result.z * result.z);
        const jarRadius = 4.8;
        if (distFromCenter > jarRadius * 0.9) {
            // Push inward
            const center = new BABYLON.Vector3(0, result.y, 0);
            const towardCenter = center.subtract(result).normalize();
            result.addInPlace(towardCenter.scale(distFromCenter - jarRadius * 0.9 + 0.1));
        }
        
        // Check jar height
        const jarBottom = -5;
        const jarTop = 3;
        if (result.y < jarBottom + 0.5) {
            result.y = jarBottom + 0.5;
        }
        if (result.y > jarTop - 0.5) {
            result.y = jarTop - 0.5;
        }
        
        return result;
    }
    
    /**
     * Rotate a vector by an angle around an axis
     */
    rotateVector(vector, angle, axis) {
        const rotationMatrix = BABYLON.Matrix.RotationAxis(axis, angle);
        return BABYLON.Vector3.TransformNormal(vector.clone(), rotationMatrix).normalize();
    }
    
    /**
     * Update pulse animation for all vessels
     */
    update(deltaTime) {
        this.time += deltaTime;
        
        // Create traveling pulse wave from heart outward
        const pulseSpeed = 4;
        const pulseWave = (this.time * pulseSpeed) % 10;
        
        this.vessels.forEach((vessel, index) => {
            // Calculate distance-based pulse delay
            const distFromHeart = BABYLON.Vector3.Distance(
                vessel.startPoint,
                new BABYLON.Vector3(0, -1.9, 0)
            );
            
            // Wave arrives at vessel based on distance
            const waveArrival = distFromHeart * 0.5;
            const localTime = this.time - waveArrival;
            
            // Pulse function: sharp rise, gradual fall
            const pulsePhase = (localTime * pulseSpeed) % (Math.PI * 2);
            const pulse = Math.max(0, Math.sin(pulsePhase));
            const pulseIntensity = 0.08 * pulse;
            
            // Apply pulse to vessel
            vessel.mesh.scaling = new BABYLON.Vector3(1 + pulseIntensity, 1, 1 + pulseIntensity);
            
            // Color shift during pulse (brighter when pulsing)
            const brightness = 1 + pulse * 0.2;
            vessel.mesh.material.emissiveColor = new BABYLON.Color3(0.2 * pulse, 0, 0);
        });
    }
    
    /**
     * Get the root transform node
     */
    getMesh() {
        return this.rootNode;
    }
    
    /**
     * Reset and regrow vessels
     */
    reset() {
        // Dispose existing vessels
        this.vessels.forEach(v => {
            if (v.mesh) v.mesh.dispose();
        });
        
        this.vessels = [];
        this.growthNodes = [];
        this.attractors = [];
        this.isGrowing = false;
        
        // Restart growth
        this.initializeFromSeed(
            new BABYLON.Vector3(0, -1.9, 0),
            new BABYLON.Vector3(0, 1, 0),
            0.2
        );
    }
    
    /**
     * Dispose all resources
     */
    dispose() {
        this.vessels.forEach(v => {
            if (v.mesh) v.mesh.dispose();
        });
        this.vesselMaterial.dispose();
        this.rootNode.dispose();
    }
}

/**
 * Represents a growth node (tip cell) that can extend and branch
 */
class GrowthNode {
    constructor(position, parent, radius, direction, generation) {
        this.position = position.clone();
        this.parent = parent;
        this.radius = radius;
        this.direction = direction.clone();
        this.generation = generation;
        this.active = true;
        this.children = [];
        this.age = 0;
    }
    
    /**
     * Get distance from heart (for pulse timing)
     */
    getDistanceFromHeart() {
        const heartPos = new BABYLON.Vector3(0, -1.9, 0);
        return BABYLON.Vector3.Distance(this.position, heartPos);
    }
}

/**
 * Represents an attractor point that guides vessel growth
 */
class Attractor {
    constructor(position) {
        this.position = position.clone();
        this.consumed = false;
        this.influenceRadius = 2.0;
    }
}

export { GrowthNode, Attractor };
