/** Small deterministic helpers shared by the simulation. */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function clamp(v: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, v));
}

export function smoothstep(a: number, b: number, v: number): number {
	const t = clamp((v - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
}

function hash3(x: number, y: number, z: number): number {
	let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
	h = Math.imul(h ^ (h >>> 13), 1274126177);
	return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth 3D value noise in [0, 1]. */
export function valueNoise(x: number, y: number, z: number): number {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const zi = Math.floor(z);
	const fx = x - xi;
	const fy = y - yi;
	const fz = z - zi;
	const u = fx * fx * (3 - 2 * fx);
	const v = fy * fy * (3 - 2 * fy);
	const w = fz * fz * (3 - 2 * fz);
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
	const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
	return lerp(
		lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
		lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
		w,
	);
}

/** Fractal noise, roughly in [0, 1]. */
export function fbm(x: number, y: number, z: number, octaves = 3): number {
	let sum = 0;
	let amp = 0.5;
	let freq = 1;
	let norm = 0;
	for (let i = 0; i < octaves; i++) {
		sum += amp * valueNoise(x * freq, y * freq, z * freq);
		norm += amp;
		amp *= 0.5;
		freq *= 2;
	}
	return sum / norm;
}

/**
 * Cardiac cycle envelope. `t` is in cycles. Returns the "lub" (ventricular systole) and
 * "dub" (valve closure) pulses. The same curves are evaluated in the vessel shader.
 */
function wrappedGauss(t: number, centre: number, width: number): number {
	let d = t - centre;
	d -= Math.round(d);
	return Math.exp(-((d / width) ** 2));
}

export function lub(t: number): number {
	return wrappedGauss(t, 0.05, 0.065);
}

export function dub(t: number): number {
	return wrappedGauss(t, 0.33, 0.08);
}
