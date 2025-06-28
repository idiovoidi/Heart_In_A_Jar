import { ErrorDecorator } from '../core/ErrorDecorator.js';

/**
 * Component for managing entity animations
 */
export class AnimationComponent {
    constructor(options = {}) {
        this.type = 'animation';
        this.animations = new Map();
        this.currentAnimation = null;
        this.isPlaying = false;
        this.looping = options.looping !== undefined ? options.looping : true;
        this.speed = options.speed || 1.0;
        this.entity = null;
        
        // Wrap methods with error handling
        this.createAnimation = ErrorDecorator.wrapWithErrorHandler(
            this.createAnimation.bind(this),
            "AnimationComponent.createAnimation"
        );
        
        this.createVectorAnimation = ErrorDecorator.wrapWithErrorHandler(
            this.createVectorAnimation.bind(this),
            "AnimationComponent.createVectorAnimation"
        );
        
        this.play = ErrorDecorator.wrapWithErrorHandler(
            this.play.bind(this),
            "AnimationComponent.play"
        );
    }
    
    /**
     * Initialize the component with the parent entity
     * @param {EntityBase} entity - The parent entity
     */
    init(entity) {
        this.entity = entity;
    }
    
    /**
     * Create a new animation
     * @param {string} name - Animation name
     * @param {string} targetProperty - Property to animate
     * @param {Array} keyframes - Animation keyframes
     * @param {number} frameRate - Animation frame rate
     * @returns {BABYLON.Animation} The created animation
     */
    createAnimation(name, targetProperty, keyframes, frameRate = 30) {
        const animation = new BABYLON.Animation(
            name,
            targetProperty,
            frameRate,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT, // Type can be adjusted based on need
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        animation.setKeys(keyframes);
        this.animations.set(name, animation);
        return animation;
    }
    
    /**
     * Create a vector animation (for position, rotation, etc)
     * @param {string} name - Animation name
     * @param {string} targetProperty - Property to animate
     * @param {Array} keyframes - Animation keyframes with vector values
     * @param {number} frameRate - Animation frame rate
     * @returns {BABYLON.Animation} The created animation
     */
    createVectorAnimation(name, targetProperty, keyframes, frameRate = 30) {
        const animation = new BABYLON.Animation(
            name,
            targetProperty,
            frameRate,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );
        
        animation.setKeys(keyframes);
        this.animations.set(name, animation);
        return animation;
    }
    
    /**
     * Play an animation
     * @param {string} name - Animation name
     * @param {boolean} loop - Whether to loop the animation
     * @param {number} speedRatio - Animation speed ratio
     */
    play(name, loop = true, speedRatio = 1.0) {
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
    }
    
    /**
     * Stop the current animation
     */
    stop() {
        if (!this.entity || !this.entity.entityNode || !this.isPlaying) return;
        
        this.entity.scene.stopAnimation(this.entity.entityNode);
        this.isPlaying = false;
    }
    
    /**
     * Update method called each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Any per-frame animation logic can go here
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        this.animations.clear();
    }
} 