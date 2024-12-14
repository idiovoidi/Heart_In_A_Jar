import { Scene } from './Scene.js';

let scene;

function initScene() {
    try {
        if (scene) {
            console.log('Cleaning up old scene...');
            scene.dispose();
            scene = null;
        }

        console.log('Creating new scene...');
        const container = document.getElementById('container');
        if (!container) {
            throw new Error('Container not found');
        }
        scene = new Scene(container);
    } catch (error) {
        console.error('Error initializing scene:', error);
    }
}

document.addEventListener('DOMContentLoaded', initScene);

// Handle hot reloads better
if (module.hot) {
    module.hot.accept(() => {
        console.log('Hot reloading, reinitializing scene...');
        initScene();
    });
}

// Only clean up when the page is actually unloading
window.addEventListener('beforeunload', () => {
    if (scene) {
        scene.dispose();
        scene = null;
    }
});

// Remove the visibility change handler since it's causing issues
// document.addEventListener('visibilitychange', () => {
//     if (document.hidden && scene) {
//         scene.dispose();
//         scene = null;
//     }
// }); 