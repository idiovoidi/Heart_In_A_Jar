import { Color3 } from "@babylonjs/core";
import type { Heart } from "../Heart";
import type { Jar } from "../Jar";
import type { VesselGrowth } from "../VesselGrowth";

export interface ViewControls {
	setAutoRotate(on: boolean): void;
	setBloom(on: boolean): void;
	resetCamera(): void;
}

interface Preset {
	label: string;
	color: Color3;
	opacity: number;
}

const LIQUIDS: Preset[] = [
	{ label: "Amber", color: new Color3(0.95, 0.55, 0.22), opacity: 0.26 },
	{ label: "Clear", color: new Color3(0.85, 0.95, 0.95), opacity: 0.06 },
	{ label: "Crimson", color: new Color3(0.8, 0.1, 0.1), opacity: 0.28 },
	{ label: "Viridian", color: new Color3(0.3, 0.85, 0.55), opacity: 0.2 },
	{ label: "Cobalt", color: new Color3(0.2, 0.45, 0.95), opacity: 0.22 },
];

function el<K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className?: string,
	text?: string,
): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (className) node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

/** The floating control panel and live readout. Plain DOM, no framework. */
export class Panel {
	private readonly root = el("aside", "panel");
	private readonly stats = new Map<string, HTMLElement>();
	private pauseButton!: HTMLButtonElement;
	private beatButton!: HTMLButtonElement;
	private readonly status: HTMLElement;
	private readonly timer: number;

	constructor(
		private readonly heart: Heart,
		private readonly growth: VesselGrowth,
		private readonly jar: Jar,
		private readonly view: ViewControls,
		private readonly onRegrow: (density: number) => void,
	) {
		const header = el("header");
		header.append(el("h1", undefined, "Heart in a Jar"));
		this.status = el("span", "status", "Growing");
		header.append(this.status);
		this.root.append(header);

		this.root.append(
			this.heartSection(),
			this.growthSection(),
			this.liquidSection(),
			this.viewSection(),
			this.statsSection(),
			el("p", "hint", "Click the glass to inject growth factor. Space pauses, R regrows."),
		);

		const toggle = el("button", "collapse", "Hide");
		toggle.onclick = () => {
			const hidden = this.root.classList.toggle("collapsed");
			toggle.textContent = hidden ? "Controls" : "Hide";
		};
		this.root.append(toggle);
		document.body.append(this.root);

		window.addEventListener("keydown", this.onKey);
		this.timer = window.setInterval(() => this.refresh(), 250);
		this.refresh();
	}

	private section(title: string): HTMLElement {
		const s = el("section");
		s.append(el("h2", undefined, title));
		return s;
	}

	private slider(
		label: string,
		min: number,
		max: number,
		step: number,
		value: number,
		format: (v: number) => string,
		onInput: (v: number) => void,
	): HTMLElement {
		const row = el("label", "slider");
		const readout = el("output", undefined, format(value));
		const input = el("input");
		input.type = "range";
		input.min = String(min);
		input.max = String(max);
		input.step = String(step);
		input.value = String(value);
		input.oninput = () => {
			const v = Number(input.value);
			readout.textContent = format(v);
			onInput(v);
		};
		row.append(el("span", undefined, label), readout, input);
		return row;
	}

	private button(label: string, onClick: () => void): HTMLButtonElement {
		const b = el("button", undefined, label);
		b.onclick = onClick;
		return b;
	}

	private toggle(label: string, initial: boolean, onChange: (on: boolean) => void): HTMLElement {
		const row = el("label", "toggle");
		const input = el("input");
		input.type = "checkbox";
		input.checked = initial;
		input.onchange = () => onChange(input.checked);
		row.append(input, el("span", undefined, label));
		return row;
	}

	private heartSection(): HTMLElement {
		const s = this.section("Heart");
		s.append(
			this.slider(
				"Rate",
				30,
				140,
				1,
				this.heart.bpm,
				(v) => `${v} bpm`,
				(v) => {
					this.heart.bpm = v;
				},
			),
			this.slider(
				"Wall pulse",
				0,
				2,
				0.05,
				this.growth.pulseStrength,
				(v) => `${Math.round(v * 100)}%`,
				(v) => {
					this.growth.pulseStrength = v;
				},
			),
		);
		this.beatButton = this.button("Stop heart", () => {
			this.heart.beating = !this.heart.beating;
			this.beatButton.textContent = this.heart.beating ? "Stop heart" : "Start heart";
		});
		s.append(this.beatButton);
		return s;
	}

	private growthSection(): HTMLElement {
		const s = this.section("Vessel growth");
		let density = this.growth.settings.attractorCount;
		s.append(
			this.slider(
				"Speed",
				0.25,
				8,
				0.25,
				this.growth.speed,
				(v) => `${v}x`,
				(v) => {
					this.growth.speed = v;
				},
			),
			this.slider(
				"Signal density",
				1200,
				7000,
				100,
				density,
				(v) => `${v}`,
				(v) => {
					density = v;
				},
			),
		);
		const row = el("div", "buttons");
		this.pauseButton = this.button("Pause", () => this.togglePause());
		row.append(
			this.pauseButton,
			this.button("Regrow", () => this.onRegrow(density)),
			this.button("Skip ahead", () => this.growth.fastForward()),
		);
		s.append(row);
		s.append(this.toggle("Show growth signals", false, (on) => this.growth.setShowSignals(on)));
		return s;
	}

	private liquidSection(): HTMLElement {
		const s = this.section("Preservative");
		const row = el("div", "swatches");
		for (const preset of LIQUIDS) {
			const b = el("button", "swatch");
			b.title = preset.label;
			b.setAttribute("aria-label", preset.label);
			const { r, g, b: blue } = preset.color;
			b.style.background = `rgb(${r * 255}, ${g * 255}, ${blue * 255})`;
			b.onclick = () => {
				this.jar.setLiquidColor(preset.color, preset.opacity);
				for (const other of row.children) other.classList.remove("active");
				b.classList.add("active");
			};
			row.append(b);
		}
		row.children[0].classList.add("active");
		s.append(row);
		s.append(this.toggle("Drifting motes", true, (on) => this.jar.setMotesVisible(on)));
		return s;
	}

	private viewSection(): HTMLElement {
		const s = this.section("View");
		s.append(
			this.toggle("Slow orbit", true, (on) => this.view.setAutoRotate(on)),
			this.toggle("Bloom", true, (on) => this.view.setBloom(on)),
			this.button("Reset camera", () => this.view.resetCamera()),
		);
		return s;
	}

	private statsSection(): HTMLElement {
		const s = el("dl", "stats");
		for (const key of ["Segments", "Signals left", "Seed"]) {
			const value = el("dd", undefined, "-");
			this.stats.set(key, value);
			s.append(el("dt", undefined, key), value);
		}
		return s;
	}

	private togglePause(): void {
		this.growth.paused = !this.growth.paused;
		this.refresh();
	}

	private readonly onKey = (e: KeyboardEvent): void => {
		if (e.target instanceof HTMLInputElement) return;
		if (e.code === "Space") {
			e.preventDefault();
			this.togglePause();
		} else if (e.key === "r" || e.key === "R") {
			this.onRegrow(this.growth.settings.attractorCount);
		}
	};

	private refresh(): void {
		this.pauseButton.textContent = this.growth.paused ? "Resume" : "Pause";
		const state = this.growth.paused ? "Paused" : this.growth.isMature ? "Mature" : "Growing";
		this.status.textContent = state;
		this.status.dataset.state = state.toLowerCase();
		this.setStat("Segments", this.growth.segmentCount.toLocaleString());
		this.setStat("Signals left", this.growth.remainingSignals.toLocaleString());
		this.setStat("Seed", String(this.growth.currentSeed));
	}

	private setStat(key: string, value: string): void {
		const node = this.stats.get(key);
		if (node) node.textContent = value;
	}

	dispose(): void {
		window.clearInterval(this.timer);
		window.removeEventListener("keydown", this.onKey);
		this.root.remove();
	}
}
