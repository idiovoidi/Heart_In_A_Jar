import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Component for managing entity movement and physics
 */
export class MovementComponent {
    constructor(options = {}) {
        this.type = 'movement';
        
        // Movement properties
        this.position = new BABYLON.Vector3(0, 0, 0);
        this.target = new BABYLON.Vector3(0, 0, 0);
        this.direction = new BABYLON.Vector3(0, 0, 0);
        this.speed = options.baseSpeed || 0.5;
        
        // Wandering behavior
        this.isWandering = options.wandering !== undefined ? options.wandering : true;
        this.wanderRadius = options.wanderRadius || 1.0;
        this.wanderCenter = options.wanderCenter ? 
            new BABYLON.Vector3(options.wanderCenter.x, options.wanderCenter.y, options.wanderCenter.z) :
            new BABYLON.Vector3(0, 0, 0);
        
        // Target update timing
        this.lastTargetUpdate = 0;
        this.targetUpdateInterval = options.updateInterval || 3000; // ms
        
        // Wrap methods with error handling
        this.generateRandomTarget = ErrorDecorator.wrapWithErrorHandler(
            this.generateRandomTarget.bind(this),
            "MovementComponent.generateRandomTarget"
        );
        
        this.update = ErrorDecorator.wrapWithErrorHandler(
            this.update.bind(this),
            "MovementComponent.update"
        );
    }
    
    /**
     * Set the current position
     * @param {BABYLON.Vector3} position - New position
     */
    setPosition(position) {
        this.position.copyFrom(position);
    }
    
    /**
     * Set the target position to move towards
     * @param {BABYLON.Vector3} target - Target position
     */
    setTarget(target) {
        this.target.copyFrom(target);
        
        // Update direction vector
        this.direction = target.subtract(this.position).normalize();
    }
    
    /**
     * Get the current position
     * @returns {BABYLON.Vector3} Current position
     */
    getCurrentPosition() {
        return this.position;
    }
    
    /**
     * Get the current movement direction
     * @returns {BABYLON.Vector3} Movement direction
     */
    getDirection() {
        return this.direction;
    }
    
    /**
     * Generate a new random target within wander radius
     */
    generateRandomTarget() {
        // Create random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.wanderRadius;
        
        // Calculate new target
        const newTarget = new BABYLON.Vector3(
            this.wanderCenter.x + Math.cos(angle) * distance,
            this.wanderCenter.y,  // Keep y position constant for flat movement
            this.wanderCenter.z + Math.sin(angle) * distance
        );
        
        this.setTarget(newTarget);
    }
    
    /**
     * Update movement each frame
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} currentTime - Current game time
     */
    update(deltaTime, currentTime) {
        // Check if it's time to update the target
        if (this.isWandering && currentTime - this.lastTargetUpdate > this.targetUpdateInterval) {
            this.generateRandomTarget();
            this.lastTargetUpdate = currentTime;
        }
        
        // Calculate distance to target
        const distanceToTarget = BABYLON.Vector3.Distance(this.position, this.target);
        
        // If we're close to the target, just snap to it and stop moving
        if (distanceToTarget < 0.01) {
            this.position.copyFrom(this.target);
            return;
        }
        
        // Calculate movement distance for this frame
        const moveDistance = this.speed * deltaTime;
        
        // If we'll reach the target in this frame, just move there directly
        if (moveDistance >= distanceToTarget) {
            this.position.copyFrom(this.target);
            return;
        }
        
        // Otherwise, move towards the target
        const moveDirection = this.target.subtract(this.position).normalize();
        this.direction = moveDirection.clone();
        
        const movement = moveDirection.scale(moveDistance);
        this.position.addInPlace(movement);
    }
} 