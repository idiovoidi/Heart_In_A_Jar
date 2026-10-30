import {
	Color3,
	DirectionalLight,
	DynamicTexture,
	HemisphericLight,
	Mesh,
	MeshBuilder,
	MirrorTexture,
	PBRMaterial,
	Plane,
	ReflectionProbe,
	RenderTargetTexture,
	type Scene,
	StandardMaterial,
	TransformNode,
	Vector3,
} from "@babylonjs/core";
import { HEART_CENTER, JAR } from "./config";

/**
 * Everything around the specimen: lights, a dark gradient backdrop, a glossy bench with a
 * soft reflection, and a small procedural "studio" that the glass and liquid reflect.
 */
export class Environment {
	readonly keyDirection = new Vector3(-0.45, -0.9, -0.55).normalize();
	readonly rimDirection = new Vector3(0.75, -0.25, 0.65).normalize();

	readonly key: DirectionalLight;
	readonly rim: DirectionalLight;
	readonly fill: HemisphericLight;
	readonly bench: Mesh;
	private readonly mirror: MirrorTexture;
	private readonly studio: Mesh[] = [];
	private readonly probe: ReflectionProbe;
	private framesUntilStudioHides = 3;

	constructor(
		private readonly scene: Scene,
		specimen: TransformNode,
	) {
		scene.clearColor.set(0.012, 0.016, 0.02, 1);
		scene.ambientColor = new Color3(0.2, 0.2, 0.2);

		this.fill = new HemisphericLight("fill", new Vector3(0, 1, 0), scene);
		this.fill.intensity = 0.28;
		this.fill.diffuse = new Color3(0.65, 0.78, 0.9);
		this.fill.groundColor = new Color3(0.14, 0.08, 0.06);
		this.fill.specular = new Color3(0, 0, 0);

		this.key = new DirectionalLight("key", this.keyDirection, scene);
		this.key.intensity = 2;
		this.key.diffuse = new Color3(1, 0.9, 0.78);

		this.rim = new DirectionalLight("rim", this.rimDirection, scene);
		this.rim.intensity = 1.6;
		this.rim.diffuse = new Color3(0.45, 0.7, 1);

		this.createBackdrop();
		this.bench = this.createBench();
		this.mirror = this.createMirror();
		this.createCoaster();
		this.createCaustic();
		this.probe = this.createStudioProbe(specimen);
	}

	private createBackdrop(): void {
		const tex = new DynamicTexture("backdropTex", { width: 8, height: 512 }, this.scene, false);
		const ctx = tex.getContext() as CanvasRenderingContext2D;
		const g = ctx.createLinearGradient(0, 0, 0, 512);
		g.addColorStop(0, "#04080b");
		g.addColorStop(0.42, "#0c1a20");
		g.addColorStop(0.52, "#10242b");
		g.addColorStop(0.6, "#050a0d");
		g.addColorStop(1, "#010203");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 8, 512);
		tex.update();

		const dome = MeshBuilder.CreateSphere("backdrop", { diameter: 90, segments: 16 }, this.scene);
		const mat = new StandardMaterial("backdropMat", this.scene);
		mat.disableLighting = true;
		mat.emissiveTexture = tex;
		mat.backFaceCulling = false;
		mat.fogEnabled = false;
		dome.material = mat;
		dome.infiniteDistance = true;
		dome.isPickable = false;
		dome.renderingGroupId = 0;
		dome.applyFog = false;
	}

	private createBench(): Mesh {
		const bench = MeshBuilder.CreateDisc("bench", { radius: 9, tessellation: 96 }, this.scene);
		bench.rotation.x = Math.PI / 2;
		bench.position.y = 0;
		bench.isPickable = false;
		return bench;
	}

	private createMirror(): MirrorTexture {
		const mirror = new MirrorTexture("benchMirror", 1024, this.scene, true);
		mirror.mirrorPlane = new Plane(0, -1, 0, 0);
		mirror.level = 0.32;
		mirror.adaptiveBlurKernel = 28;

		const mat = new StandardMaterial("benchMat", this.scene);
		mat.diffuseColor = new Color3(0.02, 0.026, 0.03);
		mat.specularColor = new Color3(0.18, 0.2, 0.22);
		mat.specularPower = 90;
		mat.reflectionTexture = mirror;
		this.bench.material = mat;

		// Fade the bench into darkness at its edge so it has no visible horizon line.
		const fade = new DynamicTexture("benchFade", 256, this.scene, true);
		const ctx = fade.getContext() as CanvasRenderingContext2D;
		const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
		g.addColorStop(0, "rgba(255,255,255,1)");
		g.addColorStop(0.55, "rgba(255,255,255,0.9)");
		g.addColorStop(1, "rgba(255,255,255,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 256, 256);
		fade.hasAlpha = true;
		fade.update();
		mat.opacityTexture = fade;
		mat.opacityTexture.getAlphaFromRGB = false;
		return mirror;
	}

	private createCoaster(): void {
		const mat = new PBRMaterial("coaster", this.scene);
		mat.albedoColor = new Color3(0.1, 0.11, 0.12);
		mat.metallic = 1;
		mat.roughness = 0.38;
		const disc = MeshBuilder.CreateCylinder(
			"coaster",
			{ height: 0.04, diameter: (JAR.radius + JAR.wall + 0.55) * 2, tessellation: 96 },
			this.scene,
		);
		disc.position.y = 0.02;
		disc.material = mat;
		disc.isPickable = false;
	}

	/** A warm pool of light on the bench, as if focused through the amber liquid. */
	private createCaustic(): void {
		const tex = new DynamicTexture("causticTex", 256, this.scene, true);
		const ctx = tex.getContext() as CanvasRenderingContext2D;
		const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
		g.addColorStop(0, "rgba(255,140,60,0.55)");
		g.addColorStop(0.5, "rgba(255,90,40,0.18)");
		g.addColorStop(1, "rgba(255,60,20,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 256, 256);
		tex.hasAlpha = true;
		tex.update();

		const pool = MeshBuilder.CreateGround("caustic", { width: 7, height: 7 }, this.scene);
		pool.position.set(0.5, 0.006, 0.7);
		const mat = new StandardMaterial("causticMat", this.scene);
		mat.disableLighting = true;
		mat.emissiveColor = new Color3(1, 1, 1);
		mat.opacityTexture = tex;
		mat.diffuseTexture = tex;
		mat.alphaMode = 1; // ALPHA_ADD
		pool.material = mat;
		pool.isPickable = false;
		pool.alphaIndex = 0;
	}

	/** Render a few emissive softboxes into a cube map once and use it as scene reflections. */
	private createStudioProbe(specimen: TransformNode): ReflectionProbe {
		const panel = (
			name: string,
			size: { width: number; height: number },
			position: Vector3,
			color: Color3,
			power: number,
		) => {
			const p = MeshBuilder.CreatePlane(name, { ...size, sideOrientation: Mesh.DOUBLESIDE }, this.scene);
			p.position.copyFrom(position);
			p.lookAt(new Vector3(0, 2, 0));
			const m = new StandardMaterial(`${name}Mat`, this.scene);
			m.disableLighting = true;
			m.emissiveColor = color.scale(power);
			m.backFaceCulling = false;
			p.material = m;
			p.isPickable = false;
			this.studio.push(p);
		};

		panel("softTop", { width: 9, height: 9 }, new Vector3(0, 11, 0), new Color3(1, 0.97, 0.92), 0.9);
		panel("stripLeft", { width: 1.6, height: 11 }, new Vector3(-9, 3, 2), new Color3(1, 0.88, 0.7), 3.2);
		panel("stripRight", { width: 1.2, height: 11 }, new Vector3(9, 3, 3), new Color3(0.55, 0.78, 1), 3.4);
		panel("stripBack", { width: 8, height: 1.2 }, new Vector3(0, 4.2, -10), new Color3(0.8, 0.9, 1), 2);
		panel("floorBounce", { width: 14, height: 14 }, new Vector3(0, -3, 0), new Color3(0.2, 0.1, 0.08), 0.12);
		panel("wallFill", { width: 14, height: 8 }, new Vector3(0, 3, 10), new Color3(0.09, 0.14, 0.16), 0.3);

		const probe = new ReflectionProbe("studioProbe", 256, this.scene, true);
		probe.position = HEART_CENTER.add(specimen.position);
		probe.renderList?.push(...this.studio);
		probe.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
		this.scene.environmentTexture = probe.cubeTexture;
		return probe;
	}

	/** Hide the studio panels once the cube map has captured them. */
	update(): void {
		if (this.framesUntilStudioHides > 0 && --this.framesUntilStudioHides === 0) {
			for (const p of this.studio) p.setEnabled(false);
		}
	}

	/** Meshes that should appear in the bench reflection. */
	reflect(meshes: Mesh[]): void {
		this.mirror.renderList?.push(...meshes);
	}

	dispose(): void {
		this.probe.dispose();
		this.mirror.dispose();
	}
}
