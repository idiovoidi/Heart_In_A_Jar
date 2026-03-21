import { Scene } from '@babylonjs/core';

export class SceneDebug {
    scene: Scene;
    isDebugLayerVisible: boolean;

    constructor(scene: Scene) {
        this.scene = scene;
        this.isDebugLayerVisible = false;
        this.setupDebugLayer();
    }

    setupDebugLayer(): void {
        // Add keyboard shortcut (Ctrl + Alt + D) to toggle debug layer
        window.addEventListener("keydown", (ev: KeyboardEvent) => {
            if (ev.ctrlKey && ev.altKey && ev.key === 'd') {
                this.toggleDebugLayer();
            }
        });

        // Initialize debug stats
        this.scene.debugLayer.show({
            embedMode: true,
            overlay: true,
            showExplorer: false,
            showInspector: false
        });
    }

    async toggleDebugLayer(): Promise<void> {
        if (this.isDebugLayerVisible) {
            await this.scene.debugLayer.hide();
        } else {
            await this.scene.debugLayer.show({
                embedMode: true,
                overlay: true,
                showExplorer: true,
                showInspector: true,
                handleResize: true,
                globalRoot: document.body
            });
        }
        this.isDebugLayerVisible = !this.isDebugLayerVisible;
    }

    dispose(): void {
        if (this.isDebugLayerVisible) {
            this.scene.debugLayer.hide();
        }
    }
}
