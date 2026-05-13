import { Scene, Camera, DefaultRenderingPipeline, SSAORenderingPipeline } from '@babylonjs/core';
import { ErrorDecorator } from '../core/ErrorDecorator';

export interface BloomConfig {
    enabled: boolean;
    threshold: number;
    weight: number;
    kernel: number;
    scale: number;
}

export interface ChromaticAberrationConfig {
    enabled: boolean;
    aberrationAmount: number;
    radialIntensity: number;
}

export interface GrainConfig {
    enabled: boolean;
    intensity: number;
    animated: boolean;
}

export interface SSAOConfig {
    enabled: boolean;
    ssaoRatio: number;
    combineRatio: number;
    radius: number;
    totalStrength: number;
    base: number;
}

export interface PostProcessingConfig {
    bloom: BloomConfig;
    chromaticAberration: ChromaticAberrationConfig;
    grain: GrainConfig;
    ssao: SSAOConfig;
}

export const DEFAULT_POST_PROCESSING_CONFIG: PostProcessingConfig = {
    bloom: {
        enabled: true,
        threshold: 0.85,
        weight: 0.5,
        kernel: 64,
        scale: 0.5
    },
    chromaticAberration: {
        enabled: true,
        aberrationAmount: 1.0,
        radialIntensity: 0.5
    },
    grain: {
        enabled: true,
        intensity: 10,
        animated: true
    },
    ssao: {
        enabled: true,
        ssaoRatio: 0.5,
        combineRatio: 1.0,
        radius: 2.0,
        totalStrength: 1.2,
        base: 0.3
    }
};

export class PostProcessingManager {
    scene: Scene;
    defaultPipeline: DefaultRenderingPipeline | null = null;
    ssaoPipeline: SSAORenderingPipeline | null = null;
    config: PostProcessingConfig;

    constructor(scene: Scene, config: Partial<PostProcessingConfig> = {}) {
        this.scene = scene;
        this.config = this.mergeConfig(DEFAULT_POST_PROCESSING_CONFIG, config);
    }

    private mergeConfig(defaults: PostProcessingConfig, overrides: Partial<PostProcessingConfig>): PostProcessingConfig {
        return {
            bloom: { ...defaults.bloom, ...overrides.bloom },
            chromaticAberration: { ...defaults.chromaticAberration, ...overrides.chromaticAberration },
            grain: { ...defaults.grain, ...overrides.grain },
            ssao: { ...defaults.ssao, ...overrides.ssao }
        };
    }

    initialize(camera: Camera): void {
        try {
            this.setupDefaultPipeline(camera);
            this.setupSSAOPipeline(camera);
            console.log('Post-processing initialized:', this.getEnabledEffects().join(', '));
        } catch (error) {
            console.error('Error initializing post-processing:', error);
            ErrorDecorator.logError(error as Error, 'PostProcessingManager.initialize');
        }
    }

    private setupDefaultPipeline(camera: Camera): void {
        const config = this.config;

        this.defaultPipeline = new DefaultRenderingPipeline(
            'defaultPipeline',
            true,
            this.scene,
            [camera]
        );

        // Bloom
        this.defaultPipeline.bloomEnabled = config.bloom.enabled;
        if (config.bloom.enabled) {
            this.defaultPipeline.bloomThreshold = config.bloom.threshold;
            this.defaultPipeline.bloomWeight = config.bloom.weight;
            this.defaultPipeline.bloomKernel = config.bloom.kernel;
            this.defaultPipeline.bloomScale = config.bloom.scale;
        }

        // Chromatic Aberration
        this.defaultPipeline.chromaticAberrationEnabled = config.chromaticAberration.enabled;
        if (config.chromaticAberration.enabled) {
            this.defaultPipeline.chromaticAberration.aberrationAmount = config.chromaticAberration.aberrationAmount;
            this.defaultPipeline.chromaticAberration.radialIntensity = config.chromaticAberration.radialIntensity;
        }

        // Grain
        this.defaultPipeline.grainEnabled = config.grain.enabled;
        if (config.grain.enabled) {
            this.defaultPipeline.grain.intensity = config.grain.intensity;
            this.defaultPipeline.grain.animated = config.grain.animated;
        }
    }

    private setupSSAOPipeline(camera: Camera): void {
        const config = this.config.ssao;

        if (!config.enabled) return;

        this.ssaoPipeline = new SSAORenderingPipeline(
            'ssaoPipeline',
            this.scene,
            {
                ssaoRatio: config.ssaoRatio,
                combineRatio: config.combineRatio
            },
            [camera]
        );

        this.ssaoPipeline.radius = config.radius;
        this.ssaoPipeline.totalStrength = config.totalStrength;
        this.ssaoPipeline.base = config.base;
    }

    getEnabledEffects(): string[] {
        const effects: string[] = [];
        if (this.config.bloom.enabled) effects.push('Bloom');
        if (this.config.chromaticAberration.enabled) effects.push('Chromatic Aberration');
        if (this.config.grain.enabled) effects.push('Grain');
        if (this.config.ssao.enabled) effects.push('SSAO');
        return effects;
    }

    setBloomEnabled(enabled: boolean): void {
        if (this.defaultPipeline) {
            this.defaultPipeline.bloomEnabled = enabled;
            this.config.bloom.enabled = enabled;
        }
    }

    setSSAOEnabled(enabled: boolean): void {
        if (this.ssaoPipeline) {
            this.ssaoPipeline.totalStrength = enabled ? this.config.ssao.totalStrength : 0;
            this.config.ssao.enabled = enabled;
        }
    }

    updateBloomConfig(config: Partial<BloomConfig>): void {
        this.config.bloom = { ...this.config.bloom, ...config };
        if (this.defaultPipeline && config.enabled !== undefined) {
            this.defaultPipeline.bloomEnabled = config.enabled;
        }
    }

    updateSSAOConfig(config: Partial<SSAOConfig>): void {
        this.config.ssao = { ...this.config.ssao, ...config };
        if (this.ssaoPipeline) {
            if (config.radius !== undefined) this.ssaoPipeline.radius = config.radius;
            if (config.totalStrength !== undefined) this.ssaoPipeline.totalStrength = config.totalStrength;
            if (config.base !== undefined) this.ssaoPipeline.base = config.base;
            if (config.enabled !== undefined) {
                this.ssaoPipeline.totalStrength = config.enabled ? this.config.ssao.totalStrength : 0;
            }
        }
    }

    dispose(): void {
        this.defaultPipeline?.dispose();
        this.ssaoPipeline?.dispose();
        this.defaultPipeline = null;
        this.ssaoPipeline = null;
    }
}
