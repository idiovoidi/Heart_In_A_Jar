# Architecture Overview

A single Babylon.js scene: a specimen jar holding a beating heart whose blood vessels grow outward
into the preservative using space colonization.

```
src/
├── main.ts            App: engine, camera, post-processing, click-to-inject, render loop
├── config.ts          Shared dimensions (jar radius, liquid level, heart position, cannulas)
├── Jar.ts             Thick glass, amber liquid, steel lid, cannulas, drifting motes
├── Heart.ts           Procedural heart, lub-dub beating, great vessels, surface queries
├── VesselGrowth.ts    Space colonization + vessel mesh + vessel shader
├── Environment.ts     Lights, backdrop, reflective bench, procedural studio reflections
├── sim/util.ts        Seeded RNG, value noise, cardiac cycle curves (lub / dub)
└── ui/Panel.ts        Control panel and live readout (plain DOM)
```

Everything inside the specimen lives in one local frame: origin at the centre of the jar floor,
+Y up. `main.ts` parents it to a node raised onto the coaster. Dimensions come from `config.ts`.

## Heart

- The mesh starts as a welded icosphere, projected onto an implicit "heart" surface, then smoothed
  with Taubin smoothing (keeps volume, rounds the cleft) and given lumpy noise and fat/muscle
  vertex colours.
- Beating is a CPU vertex deformation per frame driven by `lub(phase)` and `dub(phase)`:
  the ventricles squeeze and twist while the atria dilate. Normals are recomputed each frame.
- The aorta and vena cava run up to the lid cannulas; a pulmonary trunk stub is added too.
- `signedDistance(p)` and `pickSeeds(n)` expose the surface to the growth system.

## Vessel growth

1. **Signals.** A few thousand attractors are scattered through the liquid (biased towards the
   glass), outside the heart.
2. **Iteration.** Each attractor is claimed by its nearest vessel node within the influence
   radius (spatial hash grid). Each claimed node grows one segment towards the average direction
   of its attractors, with inertia and a little noise. Attractors die when a node gets within the
   kill radius.
3. **Constraints.** New nodes are clamped inside the glass, kept out of the heart, and rejected
   if they crowd existing nodes.
4. **Radii.** After every step radii are recomputed bottom-up with Murray's law
   (`r_parent^p = sum(r_child^p)`), so trunks are thick and capillaries are fine.
5. **Rendering.** The whole tree is one mesh with a fixed index pattern; only the draw range and
   vertex buffers change when nodes are added. Rings are mitred and use parallel-transported
   frames so chains do not twist.
6. **Animation is in the shader** (`vesselVertexShader`): sprouting (tip extends from its parent
   over one growth step), the pressure wave (delay proportional to path length from the heart),
   wall swell and a pale glow on fresh growth.

Click the glass to drop a burst of attractors (`addGrowthFactor`) and trigger new branching.

## Look

- Glass and liquid are PBR with alpha. Reflections come from a small procedural studio (emissive
  panels) rendered once into a `ReflectionProbe`, after which the panels are hidden.
- The bench uses a blurred `MirrorTexture`.
- Post-processing: `DefaultRenderingPipeline` with MSAA, bloom, ACES tone mapping, vignette,
  grain and light chromatic aberration.

## Dev notes

- `npm run dev` serves `index.html` through Vite; `npm run build` runs `tsc` only. Use
  `npx vite build` for a production bundle.
- `?seed=N` in the URL makes growth deterministic. `window.__sim` exposes the app for debugging
  (for example `__sim.growth.fastForward()`).
