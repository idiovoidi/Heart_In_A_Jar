import { ArterySimulation } from './ArterySimulation.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const simulation = new ArterySimulation(container);
}); 