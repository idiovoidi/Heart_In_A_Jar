/**
 * SceneManager interface shared across control components
 * Defines the contract for interacting with scene simulations
 */
export interface SceneManager {
    heartSim?: {
        isBeating: boolean;
        setBeating(isBeating: boolean): void;
        setBeatSpeed(speed: number): void;
    };
    vesselGrowth?: {
        isGrowing: boolean;
        reset(): void;
        growthSpeed: number;
    };
    fluidSim?: {
        isFlowing: boolean;
        startFilling(level: number): void;
        stopFilling(): void;
    };
    labEnvironment?: {
        toggleOverheadLight(): void;
    };
    camera?: {
        resetView(): void;
    };
}
