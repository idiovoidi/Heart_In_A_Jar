import { ButtonHandler } from '../inputs/ButtonHandler';
import type { Scene } from '@babylonjs/core';
import type { SceneManager } from '../types/scene';

export class ControlPanelManager {
    buttonHandler: ButtonHandler;

    constructor(scene: Scene, _canvas: HTMLCanvasElement, sceneManager: SceneManager) {
        console.log('ControlPanelManager initialized');
        this.buttonHandler = new ButtonHandler(sceneManager);
    }

    update(_deltaTime: number): void {
        // Update logic if needed
    }

    dispose(): void {
        this.buttonHandler.dispose();
    }
}
