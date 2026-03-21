// Stub files for inputs
export class ScrollHandler {
    constructor(_simulation: unknown) {}
    init(): void {}
    dispose(): void {}
}

export class SliderHandler {
    constructor(_simulation: unknown) {}
    init(): void {}
    dispose(): void {}
}

export class InputManager {
    scrollHandler: ScrollHandler;
    buttonHandler: unknown;
    sliderHandler: SliderHandler;

    constructor(simulation: unknown) {
        this.scrollHandler = new ScrollHandler(simulation);
        this.buttonHandler = {};
        this.sliderHandler = new SliderHandler(simulation);
    }

    init(): void {
        this.scrollHandler.init();
        this.sliderHandler.init();
    }

    dispose(): void {
        this.scrollHandler.dispose();
        this.sliderHandler.dispose();
    }
}
