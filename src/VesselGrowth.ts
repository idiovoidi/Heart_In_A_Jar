import {
	BoundingInfo,
	Color3,
	Effect,
	Mesh,
	ShaderMaterial,
	StandardMaterial,
	type Camera,
	type Scene,
	TransformNode,
	Vector3,
	VertexBuffer,
	VertexData,
} from "@babylonjs/core";
import type { Heart } from "./Heart";
import { JAR } from "./config";
import { type Rng, clamp, mulberry32 } from "./sim/util";

export interface GrowthSettings {
	/** Attractors scattered through the liquid at the start. */
	attractorCount: number;
	/** How far a vessel tip can "smell" a growth signal. */
	influenceRadius: number;
	/** A signal is satisfied once a vessel gets this close. */
	killRadius: number;
	/** Length of each new segment. */
	stepLength: number;
	/** Seconds between growth iterations at speed 1. */
	stepInterval: number;
	/** Radius of the finest capillary tips. */
	tipRadius: number;
	/** Murray-style exponent for how a parent's radius relates to its children's. */
	murrayExponent: number;
	seedCount: number;
}

export const DEFAULT_GROWTH: GrowthSettings = {
	attractorCount: 3600,
	influenceRadius: 0.5,
	killRadius: 0.1,
	stepLength: 0.05,
	stepInterval: 0.4,
	tipRadius: 0.0065,
	murrayExponent: 2.4,
	seedCount: 11,
};

const SIDES = 7;
const MAX_NODES = 9000;
const VERTS_PER_NODE = SIDES * 2;
const FLOATS_PER_VERT = { position: 3, normal: 3, uv: 2, center: 3, parent: 3, info: 2 };
const PULSE_DELAY = 0.085;

const VERTEX_SHADER = /* glsl */ `
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec3 aCenter;
attribute vec3 aParent;
attribute vec2 aInfo;

uniform mat4 world;
uniform mat4 worldViewProjection;
uniform float uTime;
uniform float uPhase;
uniform float uPulse;
uniform float uGrowDur;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vBeat;
varying float vFresh;
varying float vVenous;
varying float vThin;

float pulse(float t, float centre, float width) {
	float d = fract(t - centre + 0.5) - 0.5;
	return exp(-(d / width) * (d / width));
}

void main(void) {
	float age = uTime - uv.y;
	float g = clamp(age / uGrowDur, 0.0, 1.0);
	g = g * g * (3.0 - 2.0 * g);

	float t = uPhase - uv.x * ${PULSE_DELAY.toFixed(3)};
	float beat = pulse(t, 0.05, 0.065) + 0.55 * pulse(t, 0.33, 0.08);

	vec3 centre = mix(aParent, aCenter, g);
	vec3 rel = position - aCenter;
	float swell = 1.0 + uPulse * (0.03 + 0.14 * beat);
	// Only the advancing end tapers in; the base ring keeps the parent's full radius.
	vec3 gap = aCenter - aParent;
	float isTip = step(1e-8, dot(gap, gap));
	vec3 p = centre + rel * swell * mix(1.0, mix(0.3, 1.0, g), isTip);

	vec4 wp = world * vec4(p, 1.0);
	vWorldPos = wp.xyz;
	vNormal = normalize(mat3(world) * normal);
	vBeat = beat;
	vFresh = 1.0 - smoothstep(0.0, 3.5, age);
	vVenous = aInfo.x;
	vThin = clamp(aInfo.y / 0.03, 0.0, 1.0);
	gl_Position = worldViewProjection * vec4(p, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vBeat;
varying float vFresh;
varying float vVenous;
varying float vThin;

uniform vec3 uCamera;
uniform vec3 uKeyDir;
uniform vec3 uRimDir;
uniform float uPulse;

void main(void) {
	vec3 n = normalize(vNormal);
	if (!gl_FrontFacing) n = -n;
	vec3 v = normalize(uCamera - vWorldPos);

	vec3 arterial = mix(vec3(0.3, 0.006, 0.01), vec3(0.42, 0.012, 0.015), 1.0 - vThin);
	vec3 venous = mix(vec3(0.12, 0.02, 0.1), vec3(0.2, 0.04, 0.16), 1.0 - vThin);
	vec3 albedo = mix(arterial, venous, vVenous);

	float key = clamp((dot(n, uKeyDir) + 0.45) / 1.45, 0.0, 1.0);
	float rim = clamp((dot(n, uRimDir) + 0.3) / 1.3, 0.0, 1.0);
	vec3 col = albedo * (0.16 + 0.95 * key) + albedo * vec3(0.5, 0.7, 1.0) * rim * 0.22;

	float spec = pow(max(dot(n, normalize(uKeyDir + v)), 0.0), 70.0);
	float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
	col += vec3(1.0, 0.8, 0.7) * spec * 0.28;
	col += vec3(0.55, 0.06, 0.05) * fres * 0.25;

	// The pressure wave brightens the walls as it passes; fresh sprouts glow pale.
	col += vec3(0.55, 0.05, 0.03) * vBeat * uPulse * 0.5;
	col += vec3(1.0, 0.5, 0.35) * vFresh * vFresh * 0.55;

	gl_FragColor = vec4(col, 1.0);
}
`;

interface Attractor {
	x: number;
	y: number;
	z: number;
}

/**
 * Space colonization in the liquid. A cloud of growth signals ("attractors") is scattered
 * through the jar. Vessel tips grow towards the signals that are closest to them, consuming
 * them on arrival, so branching, wall-hugging and fine capillary beds emerge on their own.
 *
 * The network is stored as flat arrays and rendered as one mesh. Sprouting and the pressure
 * wave are animated in the vertex shader, so the CPU only touches the mesh when nodes are added.
 */
export class VesselGrowth {
	readonly mesh: Mesh;
	settings: GrowthSettings;

	paused = false;
	/** Multiplier on how many growth iterations run per second. */
	speed = 1;
	/** Pulse strength: how much the wall swells and flashes on each beat. */
	pulseStrength = 1;
	/** Seconds of simulated time since the last reset. */
	time = 0;

	private readonly material: ShaderMaterial;
	private readonly attractorCloud: Mesh;
	private readonly attractorMat: StandardMaterial;

	// Node storage (struct of arrays). Parents always precede their children.
	private readonly px = new Float32Array(MAX_NODES);
	private readonly py = new Float32Array(MAX_NODES);
	private readonly pz = new Float32Array(MAX_NODES);
	private readonly dx = new Float32Array(MAX_NODES);
	private readonly dy = new Float32Array(MAX_NODES);
	private readonly dz = new Float32Array(MAX_NODES);
	private readonly parent = new Int32Array(MAX_NODES);
	private readonly firstChild = new Int32Array(MAX_NODES);
	private readonly pathLength = new Float32Array(MAX_NODES);
	private readonly birth = new Float32Array(MAX_NODES);
	private readonly radius = new Float32Array(MAX_NODES);
	private readonly venous = new Uint8Array(MAX_NODES);
	private readonly leafWeight = new Float32Array(MAX_NODES);
	private readonly refX = new Float32Array(MAX_NODES);
	private readonly refY = new Float32Array(MAX_NODES);
	private readonly refZ = new Float32Array(MAX_NODES);
	private nodeCount = 0;

	private attractors: Attractor[] = [];
	private readonly grid = new Map<number, number[]>();
	private idleSteps = 0;
	private accumulator = 0;
	private rng: Rng = mulberry32(1);
	private seed = 1;

	private readonly buffers = {
		position: new Float32Array(MAX_NODES * VERTS_PER_NODE * FLOATS_PER_VERT.position),
		normal: new Float32Array(MAX_NODES * VERTS_PER_NODE * FLOATS_PER_VERT.normal),
		uv: new Float32Array(MAX_NODES * VERTS_PER_NODE * FLOATS_PER_VERT.uv),
		center: new Float32Array(MAX_NODES * VERTS_PER_NODE * FLOATS_PER_VERT.center),
		parent: new Float32Array(MAX_NODES * VERTS_PER_NODE * FLOATS_PER_VERT.parent),
		info: new Float32Array(MAX_NODES * VERTS_PER_NODE * FLOATS_PER_VERT.info),
	};

	constructor(
		private readonly scene: Scene,
		parent: TransformNode,
		private readonly heart: Heart,
		private readonly camera: Camera,
		private readonly keyDirection: Vector3,
		private readonly rimDirection: Vector3,
		settings: Partial<GrowthSettings> = {},
	) {
		this.settings = { ...DEFAULT_GROWTH, ...settings };

		Effect.ShadersStore.vesselVertexShader = VERTEX_SHADER;
		Effect.ShadersStore.vesselFragmentShader = FRAGMENT_SHADER;
		this.material = new ShaderMaterial(
			"vesselMat",
			scene,
			{ vertex: "vessel", fragment: "vessel" },
			{
				attributes: ["position", "normal", "uv", "aCenter", "aParent", "aInfo"],
				uniforms: [
					"world",
					"worldViewProjection",
					"uTime",
					"uPhase",
					"uPulse",
					"uGrowDur",
					"uCamera",
					"uKeyDir",
					"uRimDir",
				],
			},
		);
		this.material.backFaceCulling = false;

		this.mesh = this.createMesh();
		this.mesh.parent = parent;
		this.mesh.material = this.material;

		this.attractorCloud = new Mesh("attractorCloud", scene);
		this.attractorCloud.parent = parent;
		this.attractorCloud.isPickable = false;
		this.attractorCloud.setEnabled(false);
		this.attractorMat = new StandardMaterial("attractorMat", scene);
		this.attractorMat.disableLighting = true;
		this.attractorMat.emissiveColor = new Color3(0.35, 1, 0.55);
		this.attractorMat.pointsCloud = true;
		this.attractorMat.pointSize = 3;
		this.attractorCloud.material = this.attractorMat;

		this.reset(1);
	}

	private createMesh(): Mesh {
		const mesh = new Mesh("vessels", this.scene);

		// Index pattern is fixed per node; only the draw range changes as the tree grows.
		const indices = new Uint32Array(MAX_NODES * SIDES * 6);
		let o = 0;
		for (let n = 0; n < MAX_NODES; n++) {
			const base = n * VERTS_PER_NODE;
			for (let j = 0; j < SIDES; j++) {
				const a = base + j;
				const b = base + ((j + 1) % SIDES);
				const c = base + SIDES + j;
				const d = base + SIDES + ((j + 1) % SIDES);
				indices[o++] = a;
				indices[o++] = c;
				indices[o++] = b;
				indices[o++] = b;
				indices[o++] = c;
				indices[o++] = d;
			}
		}

		const vd = new VertexData();
		vd.positions = this.buffers.position;
		vd.normals = this.buffers.normal;
		vd.uvs = this.buffers.uv;
		vd.indices = indices;
		vd.applyToMesh(mesh, true);
		mesh.setVerticesData("aCenter", this.buffers.center, true, 3);
		mesh.setVerticesData("aParent", this.buffers.parent, true, 3);
		mesh.setVerticesData("aInfo", this.buffers.info, true, 2);

		const r = JAR.radius;
		mesh.setBoundingInfo(
			new BoundingInfo(new Vector3(-r, 0, -r), new Vector3(r, JAR.rimY, r)),
		);
		mesh.alwaysSelectAsActiveMesh = true;
		mesh.isPickable = false;
		mesh.subMeshes[0].indexCount = 0;
		return mesh;
	}

	get nodes(): number {
		return this.nodeCount;
	}

	get remainingSignals(): number {
		return this.attractors.length;
	}

	get isMature(): boolean {
		return this.idleSteps > 24;
	}

	get segmentCount(): number {
		let n = 0;
		for (let i = 0; i < this.nodeCount; i++) if (this.parent[i] >= 0) n++;
		return n;
	}

	/** Start over with a fresh random scatter of signals and new sprouting points. */
	reset(seed = Math.floor(Math.random() * 1e9)): void {
		this.seed = seed;
		this.rng = mulberry32(seed);
		this.nodeCount = 0;
		this.grid.clear();
		this.idleSteps = 0;
		this.accumulator = 0;
		this.time = 0;

		this.scatterAttractors();
		for (const s of this.heart.pickSeeds(this.settings.seedCount, this.rng)) {
			const root = this.addNode(
				s.position.subtract(s.normal.scale(0.09)),
				-1,
				0,
				this.rng() < 0.35,
			);
			this.addNode(s.position.add(s.normal.scale(0.03)), root, 0);
		}
		this.rebuildMesh();
	}

	get currentSeed(): number {
		return this.seed;
	}

	private scatterAttractors(): void {
		this.attractors = [];
		const rMax = JAR.radius - 0.1;
		const yMin = JAR.floorY + 0.12;
		const yMax = JAR.liquidY - 0.1;
		let guard = 0;
		while (this.attractors.length < this.settings.attractorCount && guard++ < this.settings.attractorCount * 20) {
			// Favour the walls a little so vessels spread out and crawl along the glass.
			const wallBias = this.rng() < 0.3;
			const r = wallBias ? rMax - this.rng() * 0.3 : rMax * Math.sqrt(this.rng());
			const a = this.rng() * Math.PI * 2;
			const p = new Vector3(Math.cos(a) * r, yMin + this.rng() * (yMax - yMin), Math.sin(a) * r);
			if (this.heart.signedDistance(p) < 0.14) continue;
			this.attractors.push({ x: p.x, y: p.y, z: p.z });
		}
	}

	/** Drop a burst of growth signals at a point, e.g. where the viewer clicked. */
	addGrowthFactor(centre: Vector3, count = 220, radius = 0.42): void {
		const rMax = JAR.radius - 0.08;
		let added = 0;
		let guard = 0;
		while (added < count && guard++ < count * 10) {
			const u = this.rng() * 2 - 1;
			const a = this.rng() * Math.PI * 2;
			const s = Math.sqrt(1 - u * u);
			const r = radius * Math.cbrt(this.rng());
			const p = new Vector3(
				centre.x + s * Math.cos(a) * r,
				centre.y + u * r,
				centre.z + s * Math.sin(a) * r,
			);
			if (Math.hypot(p.x, p.z) > rMax || p.y < JAR.floorY + 0.1 || p.y > JAR.liquidY - 0.08) continue;
			if (this.heart.signedDistance(p) < 0.1) continue;
			this.attractors.push({ x: p.x, y: p.y, z: p.z });
			added++;
		}
		this.idleSteps = 0;
		this.updateAttractorCloud();
	}

	private cellKey(x: number, y: number, z: number): number {
		const s = this.settings.influenceRadius;
		return this.cellIndex(Math.floor(x / s), Math.floor(y / s), Math.floor(z / s));
	}

	private cellIndex(ix: number, iy: number, iz: number): number {
		return (ix + 64) + 128 * ((iy + 64) + 128 * (iz + 64));
	}

	private addNode(pos: Vector3, parent: number, birth: number, venous = false): number {
		const i = this.nodeCount++;
		this.px[i] = pos.x;
		this.py[i] = pos.y;
		this.pz[i] = pos.z;
		this.parent[i] = parent;
		this.firstChild[i] = -1;
		this.birth[i] = birth;
		this.venous[i] = venous ? 1 : 0;
		if (parent >= 0) {
			const dx = pos.x - this.px[parent];
			const dy = pos.y - this.py[parent];
			const dz = pos.z - this.pz[parent];
			const len = Math.hypot(dx, dy, dz) || 1;
			this.dx[i] = dx / len;
			this.dy[i] = dy / len;
			this.dz[i] = dz / len;
			this.pathLength[i] = this.pathLength[parent] + len;
			this.venous[i] = this.venous[parent];
			if (this.firstChild[parent] < 0) this.firstChild[parent] = i;
		} else {
			this.dx[i] = 0;
			this.dy[i] = 1;
			this.dz[i] = 0;
			this.pathLength[i] = 0;
		}
		const key = this.cellKey(pos.x, pos.y, pos.z);
		const cell = this.grid.get(key);
		if (cell) cell.push(i);
		else this.grid.set(key, [i]);
		return i;
	}

	/** One iteration of space colonization. Returns the number of nodes added. */
	private step(instant: boolean): number {
		const { influenceRadius: di, killRadius: dk, stepLength } = this.settings;
		const di2 = di * di;
		const dk2 = dk * dk;
		const cell = di;

		const accX = new Map<number, number>();
		const accY = new Map<number, number>();
		const accZ = new Map<number, number>();

		for (let a = this.attractors.length - 1; a >= 0; a--) {
			const at = this.attractors[a];
			const cx = Math.floor(at.x / cell);
			const cy = Math.floor(at.y / cell);
			const cz = Math.floor(at.z / cell);
			let best = -1;
			let bestD = di2;
			for (let ox = -1; ox <= 1; ox++) {
				for (let oy = -1; oy <= 1; oy++) {
					for (let oz = -1; oz <= 1; oz++) {
						const bucket = this.grid.get(this.cellIndex(cx + ox, cy + oy, cz + oz));
						if (!bucket) continue;
						for (const n of bucket) {
							const d =
								(this.px[n] - at.x) ** 2 + (this.py[n] - at.y) ** 2 + (this.pz[n] - at.z) ** 2;
							if (d < bestD) {
								bestD = d;
								best = n;
							}
						}
					}
				}
			}
			if (best < 0) continue;
			if (bestD < dk2) {
				this.attractors[a] = this.attractors[this.attractors.length - 1];
				this.attractors.pop();
				continue;
			}
			const inv = 1 / Math.sqrt(bestD);
			accX.set(best, (accX.get(best) ?? 0) + (at.x - this.px[best]) * inv);
			accY.set(best, (accY.get(best) ?? 0) + (at.y - this.py[best]) * inv);
			accZ.set(best, (accZ.get(best) ?? 0) + (at.z - this.pz[best]) * inv);
		}

		const birthTime = instant ? -1000 : this.time;
		const rMax = JAR.radius - 0.065;
		let added = 0;
		for (const [n, ax] of accX) {
			if (this.nodeCount >= MAX_NODES) break;
			let x = ax;
			let y = accY.get(n) as number;
			let z = accZ.get(n) as number;
			const len = Math.hypot(x, y, z) || 1;
			x /= len;
			y /= len;
			z /= len;

			// Inertia keeps the vessels smooth; a touch of noise keeps them alive.
			x += this.dx[n] * 0.55 + (this.rng() - 0.5) * 0.18;
			y += this.dy[n] * 0.55 + (this.rng() - 0.5) * 0.18;
			z += this.dz[n] * 0.55 + (this.rng() - 0.5) * 0.18;
			const l2 = Math.hypot(x, y, z) || 1;

			const pos = new Vector3(
				this.px[n] + (x / l2) * stepLength,
				this.py[n] + (y / l2) * stepLength,
				this.pz[n] + (z / l2) * stepLength,
			);

			// Stay inside the glass and out of the muscle.
			const radial = Math.hypot(pos.x, pos.z);
			if (radial > rMax) {
				pos.x *= rMax / radial;
				pos.z *= rMax / radial;
			}
			pos.y = clamp(pos.y, JAR.floorY + 0.06, JAR.liquidY - 0.06);
			if (this.heart.signedDistance(pos) < 0.012) continue;
			if (this.tooCrowded(pos, n, stepLength * 0.55)) continue;

			this.addNode(pos, n, birthTime);
			added++;
		}
		return added;
	}

	private tooCrowded(pos: Vector3, parent: number, minDist: number): boolean {
		const cell = this.settings.influenceRadius;
		const cx = Math.floor(pos.x / cell);
		const cy = Math.floor(pos.y / cell);
		const cz = Math.floor(pos.z / cell);
		const min2 = minDist * minDist;
		for (let ox = -1; ox <= 1; ox++) {
			for (let oy = -1; oy <= 1; oy++) {
				for (let oz = -1; oz <= 1; oz++) {
					const bucket = this.grid.get(this.cellIndex(cx + ox, cy + oy, cz + oz));
					if (!bucket) continue;
					for (const n of bucket) {
						if (n === parent) continue;
						const d =
							(this.px[n] - pos.x) ** 2 + (this.py[n] - pos.y) ** 2 + (this.pz[n] - pos.z) ** 2;
						if (d < min2) return true;
					}
				}
			}
		}
		return false;
	}

	/** Run growth to completion immediately (nothing animates in). */
	fastForward(maxSteps = 600): void {
		for (let i = 0; i < maxSteps; i++) {
			const added = this.step(true);
			this.idleSteps = added === 0 ? this.idleSteps + 1 : 0;
			if (this.isMature) break;
		}
		this.rebuildMesh();
		this.updateAttractorCloud();
	}

	update(dt: number, heartPhase: number): void {
		this.time += dt;

		if (!this.paused && !this.isMature) {
			this.accumulator += dt * this.speed;
			let stepped = 0;
			let added = 0;
			while (this.accumulator >= this.settings.stepInterval && stepped < 4) {
				this.accumulator -= this.settings.stepInterval;
				const n = this.step(false);
				added += n;
				this.idleSteps = n === 0 ? this.idleSteps + 1 : 0;
				stepped++;
			}
			if (stepped === 4) this.accumulator = 0;
			if (added > 0) {
				this.rebuildMesh();
				if (this.attractorCloud.isEnabled()) this.updateAttractorCloud();
			}
		}

		const cam = this.camera.globalPosition;
		this.material.setFloat("uTime", this.time);
		this.material.setFloat("uPhase", heartPhase);
		this.material.setFloat("uPulse", this.pulseStrength);
		// A new segment extends over roughly one growth step, so tips advance without gaps.
		this.material.setFloat(
			"uGrowDur",
			clamp((this.settings.stepInterval / this.speed) * 1.3, 0.03, 0.5),
		);
		this.material.setVector3("uCamera", cam);
		this.material.setVector3("uKeyDir", this.keyDirection);
		this.material.setVector3("uRimDir", this.rimDirection);
	}

	setShowSignals(show: boolean): void {
		this.attractorCloud.setEnabled(show);
		if (show) this.updateAttractorCloud();
	}

	private updateAttractorCloud(): void {
		if (!this.attractorCloud.isEnabled()) return;
		const n = this.attractors.length;
		const pos = new Float32Array(Math.max(n, 1) * 3);
		const idx = new Uint32Array(Math.max(n, 1));
		for (let i = 0; i < n; i++) {
			pos[i * 3] = this.attractors[i].x;
			pos[i * 3 + 1] = this.attractors[i].y;
			pos[i * 3 + 2] = this.attractors[i].z;
			idx[i] = i;
		}
		const vd = new VertexData();
		vd.positions = pos;
		vd.indices = idx;
		vd.applyToMesh(this.attractorCloud, true);
		this.attractorCloud.material = this.attractorMat;
		this.attractorCloud.alwaysSelectAsActiveMesh = true;
	}

	/** Murray's law radii, bottom-up: a parent's cross-section carries all its children. */
	private computeRadii(): void {
		const p = this.settings.murrayExponent;
		const sum = this.leafWeight;
		sum.fill(0, 0, this.nodeCount);
		for (let i = this.nodeCount - 1; i >= 0; i--) {
			const own = sum[i] === 0 ? this.settings.tipRadius ** p : sum[i];
			sum[i] = own;
			this.radius[i] = own ** (1 / p);
			const par = this.parent[i];
			if (par >= 0) sum[par] += own;
		}
	}

	private rebuildMesh(): void {
		const n = this.nodeCount;
		this.computeRadii();

		const { position, normal, uv, center, parent, info } = this.buffers;
		const step = (Math.PI * 2) / SIDES;
		const cosines: number[] = [];
		const sines: number[] = [];
		for (let j = 0; j < SIDES; j++) {
			cosines.push(Math.cos(j * step));
			sines.push(Math.sin(j * step));
		}

		const nb = [0, 0, 0];
		const nt = [0, 0, 0];

		for (let i = 0; i < n; i++) {
			const par = this.parent[i];
			const vBase = i * VERTS_PER_NODE;
			if (par < 0) {
				// Roots have no segment of their own; collapse them to a point.
				for (let k = 0; k < VERTS_PER_NODE; k++) {
					const v = vBase + k;
					position[v * 3] = this.px[i];
					position[v * 3 + 1] = this.py[i];
					position[v * 3 + 2] = this.pz[i];
					center[v * 3] = parent[v * 3] = this.px[i];
					center[v * 3 + 1] = parent[v * 3 + 1] = this.py[i];
					center[v * 3 + 2] = parent[v * 3 + 2] = this.pz[i];
					normal[v * 3] = 0;
					normal[v * 3 + 1] = 1;
					normal[v * 3 + 2] = 0;
				}
				this.refX[i] = 1;
				this.refY[i] = 0;
				this.refZ[i] = 0;
				continue;
			}

			const dxI = this.dx[i];
			const dyI = this.dy[i];
			const dzI = this.dz[i];

			// Mitred ring planes so segments meet cleanly along a chain.
			if (this.parent[par] >= 0) {
				nb[0] = dxI + this.dx[par];
				nb[1] = dyI + this.dy[par];
				nb[2] = dzI + this.dz[par];
			} else {
				nb[0] = dxI;
				nb[1] = dyI;
				nb[2] = dzI;
			}
			const child = this.firstChild[i];
			if (child >= 0) {
				nt[0] = dxI + this.dx[child];
				nt[1] = dyI + this.dy[child];
				nt[2] = dzI + this.dz[child];
			} else {
				nt[0] = dxI;
				nt[1] = dyI;
				nt[2] = dzI;
			}
			normalise(nb);
			normalise(nt);

			// Parallel-transport the ring's reference vector down the chain to avoid twisting.
			let rx = this.refX[par];
			let ry = this.refY[par];
			let rz = this.refZ[par];
			if (this.parent[par] < 0) {
				// Pick any vector perpendicular to the first segment.
				rx = Math.abs(dyI) < 0.9 ? 0 : 1;
				ry = Math.abs(dyI) < 0.9 ? 1 : 0;
				rz = 0;
			}
			const rb = project(rx, ry, rz, nb);
			const rt = project(rb[0], rb[1], rb[2], nt);
			this.refX[i] = rt[0];
			this.refY[i] = rt[1];
			this.refZ[i] = rt[2];

			const botR = this.radius[par];
			const topR = this.radius[i] * (child >= 0 ? 1 : 0.3);

			writeRing(vBase, nb, rb, botR, this.px[par], this.py[par], this.pz[par]);
			writeRing(vBase + SIDES, nt, rt, topR, this.px[i], this.py[i], this.pz[i]);

			for (let k = 0; k < VERTS_PER_NODE; k++) {
				const v = vBase + k;
				const top = k >= SIDES;
				center[v * 3] = top ? this.px[i] : this.px[par];
				center[v * 3 + 1] = top ? this.py[i] : this.py[par];
				center[v * 3 + 2] = top ? this.pz[i] : this.pz[par];
				parent[v * 3] = this.px[par];
				parent[v * 3 + 1] = this.py[par];
				parent[v * 3 + 2] = this.pz[par];
				uv[v * 2] = top ? this.pathLength[i] : this.pathLength[par];
				uv[v * 2 + 1] = this.birth[i];
				info[v * 2] = this.venous[i];
				info[v * 2 + 1] = top ? this.radius[i] : this.radius[par];
			}
		}

		function normalise(v: number[]): void {
			const l = Math.hypot(v[0], v[1], v[2]) || 1;
			v[0] /= l;
			v[1] /= l;
			v[2] /= l;
		}
		function project(x: number, y: number, z: number, axis: number[]): number[] {
			const d = x * axis[0] + y * axis[1] + z * axis[2];
			const out = [x - axis[0] * d, y - axis[1] * d, z - axis[2] * d];
			const l = Math.hypot(out[0], out[1], out[2]);
			if (l < 1e-5) return [axis[1], axis[2], axis[0]];
			return [out[0] / l, out[1] / l, out[2] / l];
		}
		function writeRing(
			v0: number,
			axis: number[],
			right: number[],
			r: number,
			cx: number,
			cy: number,
			cz: number,
		): void {
			// up = axis x right
			const ux = axis[1] * right[2] - axis[2] * right[1];
			const uy = axis[2] * right[0] - axis[0] * right[2];
			const uz = axis[0] * right[1] - axis[1] * right[0];
			for (let j = 0; j < SIDES; j++) {
				const c = cosines[j];
				const s = sines[j];
				const nx = right[0] * c + ux * s;
				const ny = right[1] * c + uy * s;
				const nz = right[2] * c + uz * s;
				const v = v0 + j;
				position[v * 3] = cx + nx * r;
				position[v * 3 + 1] = cy + ny * r;
				position[v * 3 + 2] = cz + nz * r;
				normal[v * 3] = nx;
				normal[v * 3 + 1] = ny;
				normal[v * 3 + 2] = nz;
			}
		}

		const verts = n * VERTS_PER_NODE;
		this.mesh.updateVerticesData(VertexBuffer.PositionKind, position.subarray(0, verts * 3));
		this.mesh.updateVerticesData(VertexBuffer.NormalKind, normal.subarray(0, verts * 3));
		this.mesh.updateVerticesData(VertexBuffer.UVKind, uv.subarray(0, verts * 2));
		this.mesh.updateVerticesData("aCenter", center.subarray(0, verts * 3));
		this.mesh.updateVerticesData("aParent", parent.subarray(0, verts * 3));
		this.mesh.updateVerticesData("aInfo", info.subarray(0, verts * 2));
		this.mesh.subMeshes[0].indexCount = n * SIDES * 6;
	}

	dispose(): void {
		this.mesh.dispose(false, true);
		this.attractorCloud.dispose(false, true);
		this.attractorMat.dispose();
		this.material.dispose();
	}
}
