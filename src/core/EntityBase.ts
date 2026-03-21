import type { Scene, TransformNode } from '@babylonjs/core';
import { TransformNode as BabylonTransformNode } from '@babylonjs/core';
import { ErrorDecorator } from './ErrorDecorator.js';

export interface Component {
    type?: string;
    init?(entity: EntityBase): void;
    update?(deltaTime: number): void;
    dispose?(): void;
}

/**
 * Base class for all entities in the simulation
 * Provides common functionality and lifecycle management
 */
export class EntityBase {
    scene: Scene;
    name: string;
    entityNode: TransformNode;
    components: Component[];
    isDisposed: boolean;

    constructor(scene: Scene, name: string) {
        this.scene = scene;
        this.name = name;
        this.entityNode = new BabylonTransformNode(name, scene);
        this.components = [];
        this.isDisposed = false;
    }

    /**
     * Add a component to this entity
     * @param component - The component to add
     */
    addComponent<T extends Component>(component: T): T {
        this.components.push(component);
        if (component.init && typeof component.init === 'function') {
            try {
                component.init(this);
            } catch (error) {
                console.error(`Error initializing component in ${this.name}:`, error);
                ErrorDecorator.logError(error as Error, `${this.name}.addComponent`);
            }
        }
        return component;
    }

    /**
     * Get a component by type
     * @param type - The type of component to get
     * @returns The component, or null if not found
     */
    getComponent(type: string): Component | null {
        return this.components.find(c => c.type === type) || null;
    }

    /**
     * Get the mesh of this entity
     * @returns The mesh, or null if not found
     */
    getMesh(): any {
        // Assuming the mesh is a child of the entity node
        return this.entityNode.getChildMeshes()[0];
    }

    /**
     * Update method to be called each frame
     * @param deltaTime - Time since last frame in seconds
     */
    update(deltaTime: number): void {
        // Update all components
        this.components.forEach(component => {
            if (component.update && typeof component.update === 'function') {
                try {
                    component.update(deltaTime);
                } catch (error) {
                    console.error(`Error updating component in ${this.name}:`, error);
                    ErrorDecorator.logError(error as Error, `${this.name}.update`);
                }
            }
        });
    }

    /**
     * Clean up all resources used by this entity
     */
    dispose(): void {
        if (this.isDisposed) return;

        try {
            // Dispose all components
            this.components.forEach(component => {
                if (component.dispose && typeof component.dispose === 'function') {
                    try {
                        component.dispose();
                    } catch (error) {
                        console.error(`Error disposing component in ${this.name}:`, error);
                        ErrorDecorator.logError(error as Error, `${this.name}.dispose`);
                    }
                }
            });

            // Clear components array
            this.components.length = 0;

            // Dispose the entity node
            if (this.entityNode) {
                this.entityNode.dispose();
                this.entityNode = null as unknown as TransformNode;
            }

            (this.scene as unknown as { useCameraFrustumCulling?: boolean }).useCameraFrustumCulling = true;

            this.isDisposed = true;
        } catch (error) {
            console.error(`Error disposing entity ${this.name}:`, error);
            ErrorDecorator.logError(error as Error, `${this.name}.dispose`);
        }
    }
}
