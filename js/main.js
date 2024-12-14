import { ArterySimulation } from './ArterySimulation.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let simulation;

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM Content Loaded');
        const container = document.getElementById('container');
        if (!container) {
            console.error('Container element not found');
            return;
        }
        
        // Set container style to prevent scrolling issues
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.overflow = 'hidden';
        
        console.log('Creating simulation...');
        simulation = new ArterySimulation(container);
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

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