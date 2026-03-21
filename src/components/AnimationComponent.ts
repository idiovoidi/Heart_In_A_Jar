import { Animation, Scene, TransformNode, AnimationEvent } from '@babylonjs/core';
import { ErrorDecorator } from '../core/ErrorDecorator.js';
import type { Component } from '../core/EntityBase.js';

export interface AnimationKeyframe {
    frame: number;
    value: number | unknown;
}

export interface AnimationOptions {
    looping?: boolean;
    speed?: number;
}

/**
 * Component for managing entity animations
 */
export class AnimationComponent implements Component {
    type: string;
    animations: Map<string, Animation>;
    currentAnimation: string | null;
    isPlaying: boolean;
    looping: boolean;
    speed: number;
    entity: { scene: Scene; entityNode: TransformNode } | null;

    constructor(options: AnimationOptions = {}) {
        this.type = 'animation';
        this.animations = new Map();
        this.currentAnimation = null;
        this.isPlaying = false;
        this.looping = options.looping !== undefined ? options.looping : true;
        this.speed = options.speed || 1.0;
        this.entity = null;
    }

    /**
     * Initialize the component with the parent entity
     * @param entity - The parent entity
     */
    init(entity: { scene: Scene; entityNode: TransformNode }): void {
        this.entity = entity;
    }

    /**
     * Create a new animation
     * @param name - Animation name
     * @param targetProperty - Property to animate
     * @param keyframes - Animation keyframes
     * @param frameRate - Animation frame rate
     * @returns The created animation
     */
    createAnimation(
        name: string,
        targetProperty: string,
        keyframes: AnimationKeyframe[],
        frameRate: number = 30
    ): Animation | undefined {
        try {
            const animation = new Animation(
                name,
                targetProperty,
                frameRate,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CYCLE
            );

            animation.setKeys(keyframes);
            this.animations.set(name, animation);
            return animation;
        } catch (error) {
            console.error(`Error in AnimationComponent.createAnimation:`, (error as Error).message);
            ErrorDecorator.logError(error as Error, "AnimationComponent.createAnimation");
            return undefined;
        }
    }

    /**
     * Create a vector animation (for position, rotation, etc)
     * @param name - Animation name
     * @param targetProperty - Property to animate
     * @param keyframes - Animation keyframes with vector values
     * @param frameRate - Animation frame rate
     * @returns The created animation
     */
    createVectorAnimation(
        name: string,
        targetProperty: string,
        keyframes: AnimationKeyframe[],
        frameRate: number = 30
    ): Animation | undefined {
        try {
            const animation = new Animation(
                name,
                targetProperty,
                frameRate,
                Animation.ANIMATIONTYPE_VECTOR3,
                Animation.ANIMATIONLOOPMODE_CYCLE
            );

            animation.setKeys(keyframes);
            this.animations.set(name, animation);
            return animation;
        } catch (error) {
            console.error(`Error in AnimationComponent.createVectorAnimation:`, (error as Error).message);
            ErrorDecorator.logError(error as Error, "AnimationComponent.createVectorAnimation");
            return undefined;
        }
    }

    /**
     * Play an animation
     * @param name - Animation name
     * @param loop - Whether to loop the animation
     * @param speedRatio - Animation speed ratio
     */
    play(name: string, loop: boolean = true, speedRatio: number = 1.0): void {
        try {
            if (!this.entity || !this.entity.entityNode) return;

            const animation = this.animations.get(name);
            if (!animation) {
                console.warn(`Animation "${name}" not found`);
                return;
            }

            this.entity.scene.beginDirectAnimation(
                this.entity.entityNode,
                [animation],
                0,
                animation.getHighestFrame(),
                loop,
                speedRatio * this.speed
            );

            this.currentAnimation = name;
            this.isPlaying = true;
        } catch (error) {
            console.error(`Error in AnimationComponent.play:`, (error as Error).message);
            ErrorDecorator.logError(error as Error, "AnimationComponent.play");
        }
    }

    /**
     * Stop the current animation
     */
    stop(): void {
        if (!this.entity || !this.entity.entityNode || !this.isPlaying) return;

        this.entity.scene.stopAnimation(this.entity.entityNode);
        this.isPlaying = false;
    }

    /**
     * Update method called each frame
     * @param _deltaTime - Time since last frame in seconds
     */
    update(_deltaTime: number): void {
        // Any per-frame animation logic can go here
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.stop();
        this.animations.clear();
    }
}
