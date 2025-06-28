import { ErrorDecorator } from './ErrorDecorator.js';

/**
 * Base class for all entities in the simulation
 * Provides common functionality and lifecycle management
 */
export class EntityBase {
    constructor(scene, name) {
        this.scene = scene;
        this.name = name;
        this.entityNode = new BABYLON.TransformNode(name, scene);
        this.components = [];
        this.isDisposed = false;
    }

    /**
     * Add a component to this entity
     * @param {Object} component - The component to add
     */
    addComponent(component) {
        this.components.push(component);
        if (component.init && typeof component.init === 'function') {
            try {
                component.init(this);
            } catch (error) {
                console.error(`Error initializing component in ${this.name}:`, error);
                ErrorDecorator.logError(error, `${this.name}.addComponent`);
            }
        }
        return component;
    }

    /**
     * Get a component by type
     * @param {string} type - The type of component to get
     * @returns {Object} The component, or null if not found
     */
    getComponent(type) {
        return this.components.find(c => c.type === type) || null;
    }

    /**
     * Update method to be called each frame
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        // Update all components
        this.components.forEach(component => {
            if (component.update && typeof component.update === 'function') {
                try {
                    component.update(deltaTime);
                } catch (error) {
                    console.error(`Error updating component in ${this.name}:`, error);
                    ErrorDecorator.logError(error, `${this.name}.update`);
                }
            }
        });
    }

    /**
     * Clean up all resources used by this entity
     */
    dispose() {
        if (this.isDisposed) return;
        
        try {
            // Dispose all components
            this.components.forEach(component => {
                if (component.dispose && typeof component.dispose === 'function') {
                    try {
                        component.dispose();
                    } catch (error) {
                        console.error(`Error disposing component in ${this.name}:`, error);
                        ErrorDecorator.logError(error, `${this.name}.dispose`);
                    }
                }
            });
            
            // Clear components array
            this.components.length = 0;
            
            // Dispose the entity node
            if (this.entityNode) {
                this.entityNode.dispose();
                this.entityNode = null;
            }
            
            this.isDisposed = true;
        } catch (error) {
            console.error(`Error disposing entity ${this.name}:`, error);
            ErrorDecorator.logError(error, `${this.name}.dispose`);
        }
    }
} 