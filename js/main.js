import { ArterySimulation } from './ArterySimulation.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let simulation;

function initSimulation() {
    try {
        if (simulation) {
            console.log('Cleaning up old simulation...');
            simulation.dispose();
            simulation = null;
        }

        console.log('Creating new simulation...');
        const container = document.getElementById('container');
        if (!container) {
            console.error('Container element not found');
            return;
        }
        
        simulation = new ArterySimulation(container);
    } catch (error) {
        console.error('Error initializing simulation:', error);
    }
}

document.addEventListener('DOMContentLoaded', initSimulation);

// Handle hot reloads better
if (module.hot) {
    module.hot.accept(() => {
        console.log('Hot reloading, reinitializing simulation...');
        initSimulation();
    });
}

// Only clean up when the page is actually unloading
window.addEventListener('beforeunload', () => {
    if (simulation) {
        simulation.dispose();
        simulation = null;
    }
});

// Remove the visibility change handler since it's causing issues
// document.addEventListener('visibilitychange', () => {
//     if (document.hidden && simulation) {
//         simulation.dispose();
//         simulation = null;
//     }
// }); 