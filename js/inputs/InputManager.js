import { ScrollHandler } from './ScrollHandler.js';
import { ButtonHandler } from './ButtonHandler.js';
import { SliderHandler } from './SliderHandler.js';

export class InputManager {
    constructor(simulation) {
        this.simulation = simulation;
        this.scrollHandler = new ScrollHandler(simulation);
        this.buttonHandler = new ButtonHandler(simulation);
        this.sliderHandler = new SliderHandler(simulation);
    }

    init() {
        this.buttonHandler.init();
        this.scrollHandler.init();
        this.sliderHandler.init();
    }

    dispose() {
        this.scrollHandler.dispose();
        this.buttonHandler.dispose();
        this.sliderHandler.dispose();
    }
} 