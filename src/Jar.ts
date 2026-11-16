import {
	Color3,
	Color4,
	DynamicTexture,
	Mesh,
	MeshBuilder,
	ParticleSystem,
	PBRMaterial,
	type Scene,
	TransformNode,
	Vector3,
} from "@babylonjs/core";
import { CANNULA, JAR } from "./config";

const TESSELLATION = 96;
const CORNER = 0.34;

/** Quarter-circle corner from (cx + r, cy) round to (cx, cy - r), in profile space. */
function bottomCorner(cx: number, cy: number, r: number, steps = 8): Vector3[] {
	const pts: Vector3[] = [];
	for (let i = 0; i <= steps; i++) {
		const a = (i / steps) * (Math.PI / 2);
		pts.push(new Vector3(cx + Math.cos(a) * r, cy - Math.sin(a) * r, 0));
	}
	return pts;
}

/**
 * Specimen jar: thick glass, amber preservative, a steel lid with two perfusion cannulas and
 * a handful of drifting motes. The heart itself is added separately.
 */
export class Jar {
	readonly root: TransformNode;
	readonly glass: Mesh;
	readonly liquid: Mesh;
	readonly meshes: Mesh[] = [];
	private readonly liquidMat: PBRMaterial;
	private readonly motes: ParticleSystem;

	constructor(
		private readonly scene: Scene,
		parent: TransformNode,
	) {
		this.root = new TransformNode("jar", scene);
		this.root.parent = parent;

		this.glass = this.createGlass();
		this.liquidMat = this.createLiquidMaterial();
		this.liquid = this.createLiquid();
		this.createLid();
		this.motes = this.createMotes();
	}

	/** Outer silhouette down one side, then back up the inside: one closed thick-glass profile. */
	private createGlass(): Mesh {
		const ro = JAR.radius + JAR.wall;
		const ri = JAR.radius;
		const outer: Vector3[] = [
			new Vector3(0, 0, 0),
			...bottomCorner(ro - CORNER, CORNER, CORNER).reverse(),
			new Vector3(ro, JAR.rimY - 0.2, 0),
			new Vector3(ro + 0.04, JAR.rimY - 0.14, 0),
			new Vector3(ro + 0.04, JAR.rimY, 0),
		];
		const innerCorner = bottomCorner(ri - 0.28, JAR.floorY + 0.28, 0.28);
		const inner: Vector3[] = [
			new Vector3(ri - 0.0, JAR.rimY, 0),
			new Vector3(ri, JAR.floorY + 0.28, 0),
			...innerCorner.slice(1),
			new Vector3(0, JAR.floorY, 0),
		];

		const glass = MeshBuilder.CreateLathe(
			"glass",
			{ shape: [...outer, ...inner], tessellation: TESSELLATION, sideOrientation: Mesh.DOUBLESIDE },
			this.scene,
		);

		const mat = new PBRMaterial("glassMat", this.scene);
		mat.albedoColor = new Color3(0.82, 0.94, 0.92);
		mat.metallic = 0;
		mat.roughness = 0.03;
		mat.alpha = 0.05;
		mat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
		mat.useRadianceOverAlpha = true;
		mat.useSpecularOverAlpha = true;
		mat.environmentIntensity = 0.7;
		mat.backFaceCulling = false;
		mat.twoSidedLighting = true;
		glass.material = mat;
		glass.alphaIndex = 3;
		glass.isPickable = true;
		glass.parent = this.root;
		this.meshes.push(glass);
		return glass;
	}

	private createLiquidMaterial(): PBRMaterial {
		const mat = new PBRMaterial("liquidMat", this.scene);
		mat.albedoColor = new Color3(0.95, 0.55, 0.22);
		mat.metallic = 0;
		mat.roughness = 0.02;
		mat.alpha = 0.26;
		mat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
		mat.useRadianceOverAlpha = true;
		mat.useSpecularOverAlpha = true;
		mat.environmentIntensity = 0.3;
		mat.backFaceCulling = false;
		mat.twoSidedLighting = true;
		return mat;
	}

	private createLiquid(): Mesh {
		const r = JAR.radius - 0.014;
		const floor = JAR.floorY + 0.014;
		const top = JAR.liquidY;
		const profile: Vector3[] = [
			new Vector3(0, top, 0),
			new Vector3(r - 0.3, top, 0),
			new Vector3(r - 0.1, top + 0.006, 0),
			new Vector3(r - 0.03, top + 0.03, 0),
			new Vector3(r, top + 0.075, 0),
			new Vector3(r, floor + 0.28, 0),
			...bottomCorner(r - 0.28, floor + 0.28, 0.28).slice(1),
			new Vector3(0, floor, 0),
		];
		const liquid = MeshBuilder.CreateLathe(
			"liquid",
			{ shape: profile, tessellation: TESSELLATION, sideOrientation: Mesh.DOUBLESIDE },
			this.scene,
		);
		liquid.material = this.liquidMat;
		liquid.alphaIndex = 2;
		liquid.isPickable = false;
		liquid.parent = this.root;
		this.meshes.push(liquid);
		return liquid;
	}

	private createLid(): void {
		const steel = new PBRMaterial("lidSteel", this.scene);
		steel.albedoColor = new Color3(0.2, 0.21, 0.22);
		steel.metallic = 1;
		steel.roughness = 0.32;

		const rubber = new PBRMaterial("gasket", this.scene);
		rubber.albedoColor = new Color3(0.02, 0.02, 0.02);
		rubber.metallic = 0;
		rubber.roughness = 0.8;

		const plastic = new PBRMaterial("cannulaPlastic", this.scene);
		plastic.albedoColor = new Color3(0.7, 0.72, 0.74);
		plastic.metallic = 0;
		plastic.roughness = 0.25;

		const lidRadius = JAR.radius + JAR.wall + 0.12;
		const lidProfile: Vector3[] = [
			new Vector3(0, JAR.rimY + 0.36, 0),
			new Vector3(lidRadius - 0.1, JAR.rimY + 0.36, 0),
			new Vector3(lidRadius - 0.02, JAR.rimY + 0.33, 0),
			new Vector3(lidRadius, JAR.rimY + 0.28, 0),
			new Vector3(lidRadius, JAR.rimY - 0.12, 0),
			new Vector3(lidRadius - 0.04, JAR.rimY - 0.16, 0),
			new Vector3(JAR.radius + 0.02, JAR.rimY - 0.16, 0),
			new Vector3(JAR.radius + 0.02, JAR.rimY - 0.02, 0),
			new Vector3(0, JAR.rimY - 0.02, 0),
		];
		const lid = MeshBuilder.CreateLathe(
			"lid",
			{ shape: lidProfile, tessellation: TESSELLATION, sideOrientation: Mesh.DOUBLESIDE },
			this.scene,
		);
		lid.material = steel;
		lid.parent = this.root;
		this.meshes.push(lid);

		// Grip grooves around the lid edge.
		for (const y of [0.05, 0.13, 0.21]) {
			const groove = MeshBuilder.CreateTorus(
				"lidGroove",
				{ diameter: lidRadius * 2, thickness: 0.016, tessellation: TESSELLATION },
				this.scene,
			);
			groove.position.y = JAR.rimY + y - 0.06;
			groove.material = rubber;
			groove.parent = this.root;
			this.meshes.push(groove);
		}

		const gasket = MeshBuilder.CreateTorus(
			"gasketRing",
			{ diameter: JAR.radius * 2 + 0.06, thickness: 0.07, tessellation: TESSELLATION },
			this.scene,
		);
		gasket.position.y = JAR.rimY - 0.01;
		gasket.material = rubber;
		gasket.parent = this.root;
		this.meshes.push(gasket);

		// Cannulas: a barbed fitting through the lid, with a soft line curving away on top.
		const lineMat = new PBRMaterial("lineMat", this.scene);
		lineMat.albedoColor = new Color3(0.8, 0.85, 0.85);
		lineMat.metallic = 0;
		lineMat.roughness = 0.12;
		lineMat.alpha = 0.55;
		lineMat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
		lineMat.environmentIntensity = 1.5;

		for (const [name, p, side] of [
			["aorta", CANNULA.aorta, 1],
			["vena", CANNULA.vena, -1],
		] as const) {
			const fitting = MeshBuilder.CreateCylinder(
				`${name}Fitting`,
				{ height: 0.7, diameterTop: 0.2, diameterBottom: 0.26, tessellation: 24 },
				this.scene,
			);
			fitting.position.set(p.x, JAR.rimY + 0.3, p.z);
			fitting.material = plastic;
			fitting.parent = this.root;
			this.meshes.push(fitting);

			for (const dy of [0.12, 0.24, 0.36]) {
				const barb = MeshBuilder.CreateCylinder(
					`${name}Barb`,
					{ height: 0.06, diameterTop: 0.2, diameterBottom: 0.3, tessellation: 24 },
					this.scene,
				);
				barb.position.set(p.x, JAR.rimY + 0.4 + dy, p.z);
				barb.material = plastic;
				barb.parent = this.root;
				this.meshes.push(barb);
			}

			const top = new Vector3(p.x, JAR.rimY + 0.85, p.z);
			const path = [
				top,
				top.add(new Vector3(0.05 * side, 0.3, 0.02)),
				top.add(new Vector3(0.28 * side, 0.62, 0.1)),
				top.add(new Vector3(0.75 * side, 0.7, 0.2)),
				top.add(new Vector3(1.3 * side, 0.45, 0.35)),
				top.add(new Vector3(1.7 * side, 0.05, 0.5)),
			];
			const line = MeshBuilder.CreateTube(
				`${name}Line`,
				{
					path: this.spline(path),
					radius: 0.09,
					tessellation: 20,
					cap: Mesh.CAP_END,
				},
				this.scene,
			);
			line.material = lineMat;
			line.alphaIndex = 4;
			line.parent = this.root;
			this.meshes.push(line);
		}
	}

	private spline(points: Vector3[]): Vector3[] {
		const out: Vector3[] = [];
		const n = points.length;
		for (let i = 0; i < n - 1; i++) {
			const p0 = points[Math.max(i - 1, 0)];
			const p1 = points[i];
			const p2 = points[i + 1];
			const p3 = points[Math.min(i + 2, n - 1)];
			for (let s = 0; s < 12; s++) {
				out.push(Vector3.CatmullRom(p0, p1, p2, p3, s / 12));
			}
		}
		out.push(points[n - 1].clone());
		return out;
	}

	private createMotes(): ParticleSystem {
		const tex = new DynamicTexture("moteTex", 64, this.scene, true);
		const ctx = tex.getContext() as CanvasRenderingContext2D;
		const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
		g.addColorStop(0, "rgba(255,255,255,1)");
		g.addColorStop(0.35, "rgba(255,255,255,0.35)");
		g.addColorStop(1, "rgba(255,255,255,0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 64, 64);
		tex.hasAlpha = true;
		tex.update();

		const ps = new ParticleSystem("motes", 400, this.scene);
		ps.particleTexture = tex;
		ps.emitter = new Vector3(0, (JAR.liquidY + JAR.floorY) / 2, 0);
		ps.minEmitBox = new Vector3(-1.05, -1.5, -1.05);
		ps.maxEmitBox = new Vector3(1.05, 1.5, 1.05);
		ps.minSize = 0.012;
		ps.maxSize = 0.04;
		ps.minLifeTime = 10;
		ps.maxLifeTime = 18;
		ps.emitRate = 26;
		ps.direction1 = new Vector3(-0.03, 0.02, -0.03);
		ps.direction2 = new Vector3(0.03, 0.06, 0.03);
		ps.minEmitPower = 0.3;
		ps.maxEmitPower = 1;
		ps.gravity = new Vector3(0, 0.002, 0);
		ps.color1 = new Color4(1, 0.82, 0.55, 0.5);
		ps.color2 = new Color4(1, 0.7, 0.45, 0.25);
		ps.colorDead = new Color4(1, 0.7, 0.4, 0);
		ps.blendMode = ParticleSystem.BLENDMODE_ADD;
		ps.preWarmCycles = 240;
		ps.preWarmStepOffset = 4;
		ps.start();
		return ps;
	}

	/** Tint the preservative. */
	setLiquidColor(color: Color3, opacity: number): void {
		this.liquidMat.albedoColor = color;
		this.liquidMat.alpha = opacity;
	}

	setMotesVisible(visible: boolean): void {
		if (visible) {
			this.motes.start();
		} else {
			this.motes.stop();
		}
	}

	dispose(): void {
		this.motes.dispose();
		for (const m of this.meshes) m.dispose(false, true);
		this.root.dispose();
	}
}
