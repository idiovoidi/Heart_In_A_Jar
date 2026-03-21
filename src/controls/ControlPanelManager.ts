import { ButtonHandler } from '../inputs/ButtonHandler';
import type { Scene } from '@babylonjs/core';

// Type matching the SceneManager from main.ts
type SceneManagerLike = {
    heartSim?: { isBeating: boolean; setBeating(isBeating: boolean): void; setBeatSpeed(speed: number): void };
    arterySim?: { isGrowing: boolean; reset(): void; growthSpeed: number };
    fluidSim?: { isFlowing: boolean; startFilling(level: number): void; stopFilling(): void };
    labEnvironment?: { toggleOverheadLight(): void };
    camera?: { resetView(): void };
};

export class ControlPanelManager {
    buttonHandler: ButtonHandler;

    constructor(scene: Scene, _canvas: HTMLCanvasElement, sceneManager: SceneManagerLike) {
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
