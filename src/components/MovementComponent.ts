import { Vector3 } from '@babylonjs/core';
import { ErrorDecorator } from '../core/ErrorDecorator';

export interface MovementOptions {
    baseSpeed?: number;
    wandering?: boolean;
    wanderRadius?: number;
    wanderCenter?: { x: number; y: number; z: number };
    updateInterval?: number;
}

/**
 * Component for managing entity movement and physics
 */
export class MovementComponent {
    type: string;
    position: Vector3;
    target: Vector3;
    direction: Vector3;
    speed: number;
    isWandering: boolean;
    wanderRadius: number;
    wanderCenter: Vector3;
    lastTargetUpdate: number;
    targetUpdateInterval: number;

    constructor(options: MovementOptions = {}) {
        this.type = 'movement';

        // Movement properties
        this.position = new Vector3(0, 0, 0);
        this.target = new Vector3(0, 0, 0);
        this.direction = new Vector3(0, 0, 0);
        this.speed = options.baseSpeed || 0.5;

        // Wandering behavior
        this.isWandering = options.wandering !== undefined ? options.wandering : true;
        this.wanderRadius = options.wanderRadius || 1.0;
        this.wanderCenter = options.wanderCenter ?
            new Vector3(options.wanderCenter.x, options.wanderCenter.y, options.wanderCenter.z) :
            new Vector3(0, 0, 0);

        // Target update timing
        this.lastTargetUpdate = 0;
        this.targetUpdateInterval = options.updateInterval || 3000; // ms
    }

    /**
     * Set the current position
     * @param position - New position
     */
    setPosition(position: Vector3): void {
        this.position.copyFrom(position);
    }

    /**
     * Set the target position to move towards
     * @param target - Target position
     */
    setTarget(target: Vector3): void {
        this.target.copyFrom(target);

        // Update direction vector
        this.direction = target.subtract(this.position).normalize();
    }

    /**
     * Get the current position
     * @returns Current position
     */
    getCurrentPosition(): Vector3 {
        return this.position;
    }

    /**
     * Get the current movement direction
     * @returns Movement direction
     */
    getDirection(): Vector3 {
        return this.direction;
    }

    /**
     * Generate a new random target within wander radius
     */
    generateRandomTarget(): void {
        try {
            // Create random direction
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.wanderRadius;

            // Calculate new target
            const newTarget = new Vector3(
                this.wanderCenter.x + Math.cos(angle) * distance,
                this.wanderCenter.y,  // Keep y position constant for flat movement
                this.wanderCenter.z + Math.sin(angle) * distance
            );

            this.setTarget(newTarget);
        } catch (error) {
            console.error(`Error in MovementComponent.generateRandomTarget:`, (error as Error).message);
            ErrorDecorator.logError(error as Error, "MovementComponent.generateRandomTarget");
        }
    }

    /**
     * Update movement each frame
     * @param deltaTime - Time since last frame in seconds
     * @param currentTime - Current game time
     */
    update(deltaTime: number, currentTime: number): void {
        try {
            // Check if it's time to update the target
            if (this.isWandering && currentTime - this.lastTargetUpdate > this.targetUpdateInterval) {
                this.generateRandomTarget();
                this.lastTargetUpdate = currentTime;
            }

            // Calculate distance to target
            const distanceToTarget = Vector3.Distance(this.position, this.target);

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
        } catch (error) {
            console.error(`Error in MovementComponent.update:`, (error as Error).message);
            ErrorDecorator.logError(error as Error, "MovementComponent.update");
        }
    }
}
