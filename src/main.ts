import {
	ArcRotateCamera,
	Color4,
	DefaultRenderingPipeline,
	DynamicTexture,
	Engine,
	ImageProcessingConfiguration,
	ParticleSystem,
	PointerEventTypes,
	Scene,
	TransformNode,
	Vector3,
} from "@babylonjs/core";
import { Environment } from "./Environment";
import { Heart } from "./Heart";
import { Jar } from "./Jar";
import { VesselGrowth } from "./VesselGrowth";
import { HEART_CENTER, JAR, SPECIMEN_Y } from "./config";
import { Panel } from "./ui/Panel";

const CAMERA_HOME = { alpha: -Math.PI / 2 + 0.35, beta: 1.38, radius: 12.5 };

class App {
	readonly engine: Engine;
	readonly scene: Scene;
	readonly camera: ArcRotateCamera;
	readonly specimen: TransformNode;
	readonly environment: Environment;
	readonly jar: Jar;
	readonly heart: Heart;
	readonly growth: VesselGrowth;
	readonly pipeline: DefaultRenderingPipeline;
	readonly panel: Panel;
	private readonly burst: ParticleSystem;

	constructor(canvas: HTMLCanvasElement) {
		this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: false });
		this.scene = new Scene(this.engine);

		this.camera = this.createCamera(canvas);
		this.specimen = new TransformNode("specimen", this.scene);
		this.specimen.position.y = SPECIMEN_Y;

		this.environment = new Environment(this.scene, this.specimen);
		this.jar = new Jar(this.scene, this.specimen);
		this.heart = new Heart(this.scene, this.specimen);
		this.growth = new VesselGrowth(
			this.scene,
			this.specimen,
			this.heart,
			this.camera,
			this.environment.keyDirection.scale(-1),
			this.environment.rimDirection.scale(-1),
		);

		const params = new URLSearchParams(window.location.search);
		const seed = Number(params.get("seed"));
		if (seed) this.regrow(seed);

		this.environment.reflect([...this.jar.meshes, ...this.heart.meshes, this.growth.mesh]);
		this.pipeline = this.createPipeline();
		this.burst = this.createBurst();

		this.panel = new Panel(
			this.heart,
			this.growth,
			this.jar,
			{
				setAutoRotate: (on) => {
					this.camera.useAutoRotationBehavior = on;
				},
				setBloom: (on) => {
					this.pipeline.bloomEnabled = on;
				},
				resetCamera: () => this.resetCamera(),
			},
			(density) => {
				this.growth.settings.attractorCount = density;
				this.regrow();
			},
		);

		this.scene.onPointerObservable.add((info) => {
			if (info.type !== PointerEventTypes.POINTERTAP) return;
			const pick = this.scene.pick(
				this.scene.pointerX,
				this.scene.pointerY,
				(m) => m === this.jar.glass,
			);
			if (pick?.hit && pick.pickedPoint) this.injectGrowthFactor(pick.pickedPoint);
		});

		this.scene.onBeforeRenderObservable.add(() => {
			const dt = Math.min(this.engine.getDeltaTime() / 1000, 0.05);
			this.heart.update(dt);
			this.growth.update(dt, this.heart.phase);
			this.environment.update();
		});

		window.addEventListener("resize", () => this.engine.resize());
		this.engine.runRenderLoop(() => this.scene.render());
	}

	private createCamera(canvas: HTMLCanvasElement): ArcRotateCamera {
		const camera = new ArcRotateCamera(
			"camera",
			CAMERA_HOME.alpha,
			CAMERA_HOME.beta,
			CAMERA_HOME.radius,
			new Vector3(0, HEART_CENTER.y + SPECIMEN_Y + 0.55, 0),
			this.scene,
		);
		camera.fov = 0.55;
		camera.minZ = 0.1;
		camera.maxZ = 200;
		camera.lowerRadiusLimit = 5;
		camera.upperRadiusLimit = 22;
		camera.lowerBetaLimit = 0.35;
		camera.upperBetaLimit = Math.PI / 2 + 0.12;
		camera.wheelDeltaPercentage = 0.01;
		camera.panningSensibility = 0;
		camera.inertia = 0.9;
		camera.attachControl(canvas, true);

		camera.useAutoRotationBehavior = true;
		if (camera.autoRotationBehavior) {
			camera.autoRotationBehavior.idleRotationSpeed = 0.07;
			camera.autoRotationBehavior.idleRotationWaitTime = 2500;
			camera.autoRotationBehavior.idleRotationSpinupTime = 2500;
		}
		return camera;
	}

	private resetCamera(): void {
		this.camera.alpha = CAMERA_HOME.alpha;
		this.camera.beta = CAMERA_HOME.beta;
		this.camera.radius = CAMERA_HOME.radius;
	}

	private createPipeline(): DefaultRenderingPipeline {
		const pipeline = new DefaultRenderingPipeline("pipeline", true, this.scene, [this.camera]);
		pipeline.samples = 4;
		pipeline.bloomEnabled = true;
		pipeline.bloomThreshold = 0.75;
		pipeline.bloomWeight = 0.32;
		pipeline.bloomKernel = 56;
		pipeline.bloomScale = 0.5;
		pipeline.chromaticAberrationEnabled = true;
		pipeline.chromaticAberration.aberrationAmount = 6;
		pipeline.chromaticAberration.radialIntensity = 1.2;
		pipeline.grainEnabled = true;
		pipeline.grain.intensity = 5;
		pipeline.grain.animated = true;
		pipeline.imageProcessingEnabled = true;
		const ip = pipeline.imageProcessing;
		ip.toneMappingEnabled = true;
		ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
		ip.exposure = 1.1;
		ip.contrast = 1.2;
		ip.vignetteEnabled = true;
		ip.vignetteWeight = 2.2;
		ip.vignetteStretch = 0.4;
		ip.vignetteColor = new Color4(0, 0, 0, 0);
		return pipeline;
	}

	/** Small flare where growth factor is injected. */
	private createBurst(): ParticleSystem {
		const tex = new DynamicTexture("burstTex", 64, this.scene, true);
		const ctx = tex.getContext() as CanvasRenderingContext2D;
		const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
		g.addColorStop(0, "rgba(255,255,255,1)");
		g.addColorStop(0.3, "rgba(255,255,255,0.4)");
		g.addColorStop(1, "rgba(255,255,255,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 64, 64);
		tex.hasAlpha = true;
		tex.update();

		const ps = new ParticleSystem("burst", 200, this.scene);
		ps.particleTexture = tex;
		ps.emitter = Vector3.Zero();
		ps.createSphereEmitter(0.05, 1);
		ps.minSize = 0.04;
		ps.maxSize = 0.14;
		ps.minLifeTime = 0.6;
		ps.maxLifeTime = 1.4;
		ps.minEmitPower = 0.05;
		ps.maxEmitPower = 0.35;
		ps.emitRate = 0;
		ps.color1 = new Color4(1, 0.75, 0.45, 1);
		ps.color2 = new Color4(1, 0.35, 0.2, 1);
		ps.colorDead = new Color4(0.6, 0.1, 0.05, 0);
		ps.blendMode = ParticleSystem.BLENDMODE_ADD;
		ps.start();
		return ps;
	}

	/** Place a cloud of growth signals just inside the glass where the viewer clicked. */
	private injectGrowthFactor(worldPoint: Vector3): void {
		const local = worldPoint.subtract(this.specimen.position);
		const inward = new Vector3(-local.x, 0, -local.z);
		const len = inward.length() || 1;
		const target = local.add(inward.scale(0.4 / len));
		target.y = Math.min(Math.max(target.y, JAR.floorY + 0.3), JAR.liquidY - 0.25);

		this.growth.addGrowthFactor(target);
		this.burst.emitter = target.add(this.specimen.position);
		this.burst.manualEmitCount = 70;
	}

	regrow(seed?: number): void {
		this.growth.reset(seed);
		this.growth.paused = false;
	}
}

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const app = new App(canvas);
(window as unknown as { __sim: App }).__sim = app;
