# Heart in a Jar - Specification

**Type:** 3D WebGL interactive simulation
**Stack:** Babylon.js 7, TypeScript, Vite

A beating heart suspended in a laboratory specimen jar of preservative. Blood vessels sprout from
the heart and grow outward through the liquid using a space colonization algorithm, pulsing in
time with each beat. See [Docs/ARCHITECTURE.md](Docs/ARCHITECTURE.md) for how it is built.

## Features

### Heart
- Procedurally sculpted organ with fat and muscle colouring.
- Lub-dub beat (ventricular squeeze and twist, atrial dilation); adjustable rate (30-140 bpm).
- Aorta and vena cava run to cannulas on the lid.

### Vessel growth
- Space colonization through the whole volume of the jar, up to ~9000 nodes.
- Murray's-law radius taper: thick trunks, fine capillaries; arterial red and venous purple.
- Sprouting is animated on the GPU; a pressure wave travels outward from the heart and swells the
  vessel walls.
- Click the glass to inject growth factor and trigger new branching.
- Controls: pause, speed, signal density, regrow (new random seed), skip ahead, show signals.

### Jar and environment
- Thick glass with meniscus-edged amber liquid, steel lid, cannulas and perfusion lines.
- Tintable preservative, drifting motes, reflective bench, studio reflections on the glass.
- Bloom, ACES tone mapping, vignette, grain.

### Controls
- Orbit with drag, zoom with wheel, optional slow auto-orbit.
- Space pauses growth, R regrows. `?seed=N` makes a run reproducible.

## Commands

```bash
npm run dev       # Vite dev server
npx vite build    # production bundle
npx tsc --noEmit  # type check
```
