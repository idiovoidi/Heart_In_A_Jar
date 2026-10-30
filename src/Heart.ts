import {
	Color3,
	Matrix,
	Mesh,
	MeshBuilder,
	PBRMaterial,
	PointLight,
	type Scene,
	TransformNode,
	Vector3,
	VertexBuffer,
	VertexData,
} from "@babylonjs/core";
import { CANNULA, HEART_CENTER, JAR } from "./config";
import type { Rng } from "./sim/util";
import { clamp, dub, fbm, lub, smoothstep } from "./sim/util";

/** Overall size and tilt of the organ. */
const SCALE = 0.66;
const DEPTH = 1.3;
const TILT = -0.5;

export interface SurfaceSeed {
	position: Vector3;
	normal: Vector3;
}

/** Implicit "heart" surface, z up. Negative inside. */
function heartField(x: number, y: number, z: number): number {
	const a = x * x + 2.25 * y * y + z * z - 1;
	return a * a * a - x * x * z * z * z - 0.1125 * y * y * z * z * z;
}

/** Distance from the origin to the surface along a unit direction (implicit coordinates). */
function heartRadius(dx: number, dy: number, dz: number): number {
	let lo = 0;
	let t = 0.02;
	while (t < 2.2 && heartField(dx * t, dy * t, dz * t) <= 0) {
		lo = t;
		t += 0.02;
	}
	let hi = t;
	for (let i = 0; i < 22; i++) {
		const mid = (lo + hi) / 2;
		if (heartField(dx * mid, dy * mid, dz * mid) <= 0) lo = mid;
		else hi = mid;
	}
	return lo;
}

/**
 * The organ: a sculpted ventricular mass with great vessels running up to the lid. It beats
 * with a lub-dub cycle by deforming its vertices on the CPU.
 */
export class Heart {
	readonly root: TransformNode;
	readonly body: Mesh;
	readonly meshes: Mesh[] = [];

	bpm = 62;
	beating = true;
	/** Position in the cardiac cycle, in cycles. */
	phase = 0;
	/** Current systolic contraction, 0..1. */
	systole = 0;

	private readonly base: Float32Array;
	private readonly positions: Float32Array;
	private readonly normals: Float32Array;
	private readonly indices: Uint32Array;
	private readonly weights: Float32Array;
	private readonly heights: Float32Array;
	private readonly glow: PointLight;
	private readonly toSpecimen: Matrix;
	private readonly samplePos: Vector3[] = [];
	private readonly sampleNormal: Vector3[] = [];
	private readonly anchors = new Map<string, { position: Vector3; normal: Vector3 }>();

	constructor(
		private readonly scene: Scene,
		parent: TransformNode,
	) {
		this.root = new TransformNode("heart", scene);
		this.root.parent = parent;
		this.root.position.copyFrom(HEART_CENTER);
		this.root.rotation.z = TILT;
		this.toSpecimen = Matrix.RotationZ(TILT).multiply(
			Matrix.Translation(HEART_CENTER.x, HEART_CENTER.y, HEART_CENTER.z),
		);

		const geom = this.buildGeometry();
		this.base = geom.positions;
		this.positions = new Float32Array(geom.positions);
		this.normals = new Float32Array(geom.positions.length);
		this.indices = geom.indices;
		this.weights = geom.weights;
		this.heights = geom.heights;

		this.body = new Mesh("heartBody", scene);
		const vd = new VertexData();
		vd.positions = this.positions;
		vd.indices = this.indices;
		vd.normals = this.normals;
		vd.colors = geom.colors;
		VertexData.ComputeNormals(this.positions, this.indices, this.normals);
		vd.applyToMesh(this.body, true);
		this.body.parent = this.root;
		this.body.material = this.createMuscleMaterial();
		this.body.isPickable = false;
		this.meshes.push(this.body);

		this.collectSamples();
		this.createGreatVessels();

		this.glow = new PointLight("heartGlow", HEART_CENTER.clone(), scene);
		this.glow.parent = parent;
		this.glow.diffuse = new Color3(1, 0.12, 0.08);
		this.glow.specular = new Color3(0, 0, 0);
		this.glow.range = 3.2;
		this.glow.intensity = 0.4;
	}

	private buildGeometry() {
		const ico = MeshBuilder.CreateIcoSphere(
			"heartSeed",
			{ radius: 1, subdivisions: 22, flat: false },
			this.scene,
		);
		const srcPos = ico.getVerticesData(VertexBuffer.PositionKind) as Float32Array;
		const srcIdx = ico.getIndices() as ArrayLike<number>;
		ico.dispose();

		// The generated sphere duplicates vertices along texture seams; weld them so that
		// smoothing and normals treat the surface as one piece.
		const canon = new Map<string, number>();
		const remap = new Uint32Array(srcPos.length / 3);
		const dirs: number[] = [];
		for (let i = 0; i < remap.length; i++) {
			const x = srcPos[i * 3];
			const y = srcPos[i * 3 + 1];
			const z = srcPos[i * 3 + 2];
			const key = `${Math.round(x * 1e4)},${Math.round(y * 1e4)},${Math.round(z * 1e4)}`;
			let id = canon.get(key);
			if (id === undefined) {
				id = dirs.length / 3;
				canon.set(key, id);
				dirs.push(x, y, z);
			}
			remap[i] = id;
		}
		const indices = Uint32Array.from(srcIdx, (i) => remap[i]);
		const count = dirs.length / 3;

		// Project each direction onto the implicit heart (z up, y is depth there).
		const pos = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			const dx = dirs[i * 3];
			const dy = dirs[i * 3 + 1];
			const dz = dirs[i * 3 + 2];
			const r = heartRadius(dx, dz, dy);
			pos[i * 3] = dx * r * SCALE;
			pos[i * 3 + 1] = (dy * r - 0.1) * SCALE;
			pos[i * 3 + 2] = dz * r * SCALE * DEPTH;
		}

		this.smooth(pos, indices, 12);

		// Fatty, lumpy surface.
		const normals = new Float32Array(pos.length);
		VertexData.ComputeNormals(pos, indices, normals);
		const colors = new Float32Array(count * 4);
		const weights = new Float32Array(count);
		const heights = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			const x = pos[i * 3] / SCALE;
			const y = pos[i * 3 + 1] / SCALE;
			const z = pos[i * 3 + 2] / SCALE;
			const lump = (fbm(x * 7 + 3, y * 7, z * 7) - 0.5) * 0.045 + (fbm(x * 2, y * 2, z * 2) - 0.5) * 0.05;
			pos[i * 3] += normals[i * 3] * lump;
			pos[i * 3 + 1] += normals[i * 3 + 1] * lump;
			pos[i * 3 + 2] += normals[i * 3 + 2] * lump;

			const mottle = fbm(x * 3.5, y * 3.5 + 9, z * 3.5);
			const top = smoothstep(0.1, 0.7, y);
			const band = Math.exp(-(((y - 0.28 + x * 0.12) / 0.2) ** 2));
			const sulcus = Math.exp(-(((x - 0.12 + y * 0.28) / 0.1) ** 2)) * smoothstep(-0.9, 0.2, -y);
			const fat = clamp(
				smoothstep(0.5, 0.78, fbm(x * 6, y * 6, z * 6 + 4)) * Math.max(band, sulcus * 0.8) * 0.85,
				0,
				1,
			);
			const r = 0.3 + mottle * 0.18 - top * 0.08;
			const g = 0.018 + mottle * 0.02 + top * 0.01;
			const b = 0.026 + mottle * 0.016 + top * 0.04;
			colors[i * 4] = r + (0.78 - r) * fat;
			colors[i * 4 + 1] = g + (0.42 - g) * fat;
			colors[i * 4 + 2] = b + (0.14 - b) * fat;
			colors[i * 4 + 3] = 1;

			weights[i] = 1 - smoothstep(0.25, 0.85, y);
			heights[i] = y;
		}

		return { positions: pos, indices, colors, weights, heights };
	}

	/** Taubin smoothing: rounds off the cleft between the lobes without shrinking the volume. */
	private smooth(pos: Float32Array, indices: Uint32Array, iterations: number): void {
		const n = pos.length / 3;
		const neighbours: Set<number>[] = Array.from({ length: n }, () => new Set<number>());
		for (let i = 0; i < indices.length; i += 3) {
			const a = indices[i];
			const b = indices[i + 1];
			const c = indices[i + 2];
			neighbours[a].add(b).add(c);
			neighbours[b].add(a).add(c);
			neighbours[c].add(a).add(b);
		}
		const next = new Float32Array(pos.length);
		const pass = (factor: number) => {
			for (let i = 0; i < n; i++) {
				let sx = 0;
				let sy = 0;
				let sz = 0;
				for (const j of neighbours[i]) {
					sx += pos[j * 3];
					sy += pos[j * 3 + 1];
					sz += pos[j * 3 + 2];
				}
				const k = neighbours[i].size;
				next[i * 3] = pos[i * 3] + factor * (sx / k - pos[i * 3]);
				next[i * 3 + 1] = pos[i * 3 + 1] + factor * (sy / k - pos[i * 3 + 1]);
				next[i * 3 + 2] = pos[i * 3 + 2] + factor * (sz / k - pos[i * 3 + 2]);
			}
			pos.set(next);
		};
		for (let it = 0; it < iterations; it++) {
			pass(0.5);
			pass(-0.53);
		}
	}

	private createMuscleMaterial(): PBRMaterial {
		const mat = new PBRMaterial("muscle", this.scene);
		mat.albedoColor = new Color3(1, 1, 1);
		mat.metallic = 0;
		mat.roughness = 0.46;
		mat.clearCoat.isEnabled = true;
		mat.clearCoat.intensity = 0.6;
		mat.clearCoat.roughness = 0.1;
		mat.environmentIntensity = 0.8;
		mat.backFaceCulling = true;
		return mat;
	}

	/** Cache coarse surface samples (specimen-local) for distance queries and seeding. */
	private collectSamples(): void {
		const n = this.base.length / 3;
		const rot = Matrix.RotationZ(TILT);
		for (let i = 0; i < n; i += 3) {
			const p = new Vector3(this.base[i * 3], this.base[i * 3 + 1], this.base[i * 3 + 2]);
			const nrm = new Vector3(this.normals[i * 3], this.normals[i * 3 + 1], this.normals[i * 3 + 2]);
			this.samplePos.push(Vector3.TransformCoordinates(p, this.toSpecimen));
			this.sampleNormal.push(Vector3.TransformNormal(nrm, rot).normalize());
		}
	}

	/** Surface point furthest along a local-space direction. */
	private anchorToward(dir: Vector3): { position: Vector3; normal: Vector3 } {
		const d = dir.normalizeToNew();
		const n = this.base.length / 3;
		let best = 0;
		let bestScore = Number.NEGATIVE_INFINITY;
		for (let i = 0; i < n; i++) {
			const score = this.base[i * 3] * d.x + this.base[i * 3 + 1] * d.y + this.base[i * 3 + 2] * d.z;
			if (score > bestScore) {
				bestScore = score;
				best = i;
			}
		}
		const p = new Vector3(this.base[best * 3], this.base[best * 3 + 1], this.base[best * 3 + 2]);
		const nrm = new Vector3(
			this.normals[best * 3],
			this.normals[best * 3 + 1],
			this.normals[best * 3 + 2],
		);
		return {
			position: Vector3.TransformCoordinates(p, this.toSpecimen),
			normal: Vector3.TransformNormal(nrm, Matrix.RotationZ(TILT)).normalize(),
		};
	}

	private spline(points: Vector3[], perSegment = 14): Vector3[] {
		const out: Vector3[] = [];
		const n = points.length;
		for (let i = 0; i < n - 1; i++) {
			const p0 = points[Math.max(i - 1, 0)];
			const p3 = points[Math.min(i + 2, n - 1)];
			for (let s = 0; s < perSegment; s++) {
				out.push(Vector3.CatmullRom(p0, points[i], points[i + 1], p3, s / perSegment));
			}
		}
		out.push(points[n - 1].clone());
		return out;
	}

	private createGreatVessels(): void {
		const wall = (name: string, color: Color3) => {
			const m = new PBRMaterial(name, this.scene);
			m.albedoColor = color;
			m.metallic = 0;
			m.roughness = 0.5;
			m.clearCoat.isEnabled = true;
			m.clearCoat.intensity = 0.5;
			m.clearCoat.roughness = 0.15;
			return m;
		};
		const arterial = wall("aortaWall", new Color3(0.5, 0.13, 0.11));
		const venous = wall("venaWall", new Color3(0.32, 0.15, 0.3));

		const aorta = this.anchorToward(new Vector3(0.2, 1, 0.1));
		const vena = this.anchorToward(new Vector3(-0.75, 0.75, -0.15));
		const trunk = this.anchorToward(new Vector3(0.7, 0.85, 0.5));
		this.anchors.set("aorta", aorta);
		this.anchors.set("vena", vena);
		this.anchors.set("trunk", trunk);

		const lidIn = (c: Vector3) => new Vector3(c.x, JAR.rimY - 0.15, c.z);
		const make = (
			name: string,
			path: Vector3[],
			r0: number,
			r1: number,
			material: PBRMaterial,
			cap: number,
		) => {
			const tube = MeshBuilder.CreateTube(
				name,
				{
					path: this.spline(path),
					radiusFunction: (_i, d) => r0 + (r1 - r0) * clamp(d / 4, 0, 1),
					tessellation: 28,
					cap,
				},
				this.scene,
			);
			tube.material = material;
			tube.parent = this.root.parent as TransformNode;
			tube.isPickable = false;
			this.meshes.push(tube);
			return tube;
		};

		const inward = (a: { position: Vector3; normal: Vector3 }, depth: number) =>
			a.position.subtract(a.normal.scale(depth));

		make(
			"aorta",
			[
				inward(aorta, 0.25),
				aorta.position.add(new Vector3(0.02, 0.15, 0)),
				new Vector3(aorta.position.x + 0.2, aorta.position.y + 0.55, aorta.position.z + 0.05),
				new Vector3(CANNULA.aorta.x - 0.05, 3.15, CANNULA.aorta.z),
				lidIn(CANNULA.aorta),
				new Vector3(CANNULA.aorta.x, JAR.rimY + 0.2, CANNULA.aorta.z),
			],
			0.115,
			0.085,
			arterial,
			Mesh.NO_CAP,
		);
		make(
			"vena",
			[
				inward(vena, 0.25),
				vena.position.add(new Vector3(-0.06, 0.2, 0)),
				new Vector3(vena.position.x - 0.12, vena.position.y + 0.6, vena.position.z - 0.05),
				new Vector3(CANNULA.vena.x + 0.02, 3.2, CANNULA.vena.z),
				lidIn(CANNULA.vena),
				new Vector3(CANNULA.vena.x, JAR.rimY + 0.2, CANNULA.vena.z),
			],
			0.12,
			0.09,
			venous,
			Mesh.NO_CAP,
		);
		make(
			"pulmonaryTrunk",
			[
				inward(trunk, 0.2),
				trunk.position.add(new Vector3(0.12, 0.16, 0.08)),
				trunk.position.add(new Vector3(0.38, 0.4, 0.16)),
				trunk.position.add(new Vector3(0.62, 0.52, 0.12)),
			],
			0.095,
			0.075,
			arterial,
			Mesh.CAP_END,
		);
	}

	/** Signed distance from the heart surface in specimen space (negative inside). */
	signedDistance(p: Vector3): number {
		let best = Number.POSITIVE_INFINITY;
		let idx = 0;
		for (let i = 0; i < this.samplePos.length; i++) {
			const q = this.samplePos[i];
			const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2 + (q.z - p.z) ** 2;
			if (d < best) {
				best = d;
				idx = i;
			}
		}
		const q = this.samplePos[idx];
		const n = this.sampleNormal[idx];
		const side = (p.x - q.x) * n.x + (p.y - q.y) * n.y + (p.z - q.z) * n.z;
		return Math.sqrt(best) * (side < 0 ? -1 : 1);
	}

	/** Well-spread points on the surface that vessels can sprout from. */
	pickSeeds(count: number, rng: Rng): SurfaceSeed[] {
		const candidates: number[] = [];
		const clearOf = [...this.anchors.values()];
		for (let i = 0; i < this.samplePos.length; i++) {
			const p = this.samplePos[i];
			if (clearOf.every((a) => Vector3.Distance(a.position, p) > 0.3)) candidates.push(i);
		}
		const picked: number[] = [candidates[Math.floor(rng() * candidates.length)]];
		const minDist = candidates.map(() => Number.POSITIVE_INFINITY);
		while (picked.length < count) {
			const last = this.samplePos[picked[picked.length - 1]];
			let far = -1;
			let farDist = -1;
			for (let c = 0; c < candidates.length; c++) {
				minDist[c] = Math.min(minDist[c], Vector3.DistanceSquared(this.samplePos[candidates[c]], last));
				if (minDist[c] > farDist) {
					farDist = minDist[c];
					far = c;
				}
			}
			picked.push(candidates[far]);
		}
		return picked.map((i) => ({
			position: this.samplePos[i].clone(),
			normal: this.sampleNormal[i].clone(),
		}));
	}

	update(dt: number): void {
		if (this.beating) this.phase = (this.phase + (dt * this.bpm) / 60) % 1;

		const l = lub(this.phase);
		const d = dub(this.phase);
		this.systole = l;
		this.glow.intensity = 0.35 + 0.9 * l + 0.25 * d;

		const n = this.base.length / 3;
		const twist = 0.07 * l;
		for (let i = 0; i < n; i++) {
			const w = this.weights[i];
			const s = 1 - 0.085 * w * l + 0.022 * (1 - w) * l - 0.008 * d;
			const phi = twist * (0.6 - this.heights[i] * 0.5);
			const c = Math.cos(phi);
			const sn = Math.sin(phi);
			const bx = this.base[i * 3];
			const bz = this.base[i * 3 + 2];
			this.positions[i * 3] = (c * bx - sn * bz) * s;
			this.positions[i * 3 + 1] = this.base[i * 3 + 1] * (1 - 0.04 * w * l);
			this.positions[i * 3 + 2] = (sn * bx + c * bz) * s;
		}
		VertexData.ComputeNormals(this.positions, this.indices, this.normals);
		this.body.updateVerticesData(VertexBuffer.PositionKind, this.positions);
		this.body.updateVerticesData(VertexBuffer.NormalKind, this.normals);
	}

	dispose(): void {
		this.glow.dispose();
		for (const m of this.meshes) m.dispose(false, true);
		this.root.dispose();
	}
}
