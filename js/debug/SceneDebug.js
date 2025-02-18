export class SceneDebug {
    constructor(scene) {
        this.scene = scene;
        this.isDebugLayerVisible = false;
        this.setupDebugLayer();
    }

    setupDebugLayer() {
        // Add keyboard shortcut (Ctrl + Alt + D) to toggle debug layer
        window.addEventListener("keydown", (ev) => {
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

    async toggleDebugLayer() {
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

    dispose() {
        if (this.isDebugLayerVisible) {
            this.scene.debugLayer.hide();
        }
    }
} 