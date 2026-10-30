# Heart in a Jar - Specification Document

## Project Overview

**Project Name:** Artery Simulation (Heart in a Jar)
**Type:** 3D WebGL Simulation / Interactive Visualization
**Technology:** Babylon.js 7.x, TypeScript, Vite

A 3D cardiovascular simulation featuring a beating heart inside a laboratory jar with interactive artery growth using space colonization algorithm. Users can observe organic vessel development and adjust simulation parameters in real-time.

---

## Core Features

### 1. Heart Simulation
- **Beating Animation**: Pulsating heart mesh with rhythmic contraction/expansion
- **Positioning**: Centered in jar, angled for optimal viewing
- **Scaling**: Adjustable size (default 0.4x)
- **Update Loop**: Controllable beat speed

### 2. Vessel Growth System
- **Algorithm**: Space Colonization
- **Growth Parameters:**
  - Segment length: 0.25 units
  - Branch angle: π/5 (36°)
  - Max branches: 150
  - Attraction radius: 2.5 units
  - Kill radius: 0.25 units
  - Growth speed: 80ms delay
  - Branch probability: 0.35
- **Initialization**: Seeds from heart surface
- **Interactive Controls**: Adjust parameters in real-time

### 3. Fluid/Blood Simulation
- **Fill Animation**: Blood level rising in jar
- **Particle System**: Blood cell particles flowing
- **Configurable**: Flow rate, viscosity, target fill level

### 4. Laboratory Environment
- **Jar**: Glass container with realistic materials
- **Lab Setting**: Table, ambient environment
- **Flesh Elements**: Background clumps and organic details

### 5. User Controls
- **Interactive Growth Controls**: UI panel for vessel parameters
- **Control Panel**: Toggle beat, adjust speed, reset arteries
- **Camera**: ArcRotateCamera with orbit controls

### 6. Post-Processing Effects
- **Default Pipeline**: Bloom, chromatic aberration
- **Toggle Control**: Enable/disable via UI

---

## Architecture

### Entity Component System

All systems implement `EntityBase` interface:
```typescript
interface EntityBase {
    name: string;
    getMesh(): AbstractMesh;
    update(deltaTime: number): void;
    dispose(): void;
}
```

### SceneManager
Central orchestrator managing:
- Babylon Engine/Scene initialization
- Entity registration and lifecycle
- Render loop coordination
- Component accessors

### Module Structure

| Module | Purpose |
|--------|---------|
| `main.ts` | Entry point, SceneManager |
| `HeartSimulation.ts` | Heart beat animation |
| `VesselGrowthSystem.ts` | Space colonization algorithm |
| `FluidSimulation.ts` | Blood fill simulation |
| `LabJar.ts` | Glass container |
| `LabEnvironment.ts` | Background setup |
| `SceneCamera.ts` | Camera controls |
| `SceneLighting.ts` | Light setup |
| `ControlPanelManager.ts` | UI orchestration |
| `ButtonHandler.ts` | GUI interactions |
| `PostProcessingManager.ts` | Visual effects |

---

## Data Models

### VesselGrowthConfig
```typescript
interface VesselGrowthConfig {
    segmentLength: number;
    branchAngle: number;
    maxBranches: number;
    attractionRadius: number;
    killRadius: number;
    growthSpeed: number;
    branchProbability: number;
}
```

### SceneManager Interface
```typescript
interface SceneManager {
    entities: Map<string, EntityBase>;
    scene: Scene;
    camera: SceneCamera;
    lighting: SceneLighting;
    controlPanelManager: ControlPanelManager;

    // Component accessors
    heartSim: HeartSimulation | undefined;
    vesselGrowth: VesselGrowthSystem | undefined;
    fluidSim: FluidSimulation | undefined;
    labEnvironment: LabEnvironment | undefined;
    postProcessing: PostProcessingManager | null;
}
```

---

## Performance Optimizations

### Engine Settings
- Hardware scaling level: 1.0
- Geometry unique IDs map: enabled
- Material mesh map: enabled
- Frustum culling: enabled

### Scene Optimization
- Auto-clear: disabled
- Pointer move picking: skipped
- Right-handed system: enabled

### Memory Management
- Proper disposal of all entities
- Texture/mesh cleanup on component disposal

---

## Quality Checks Passed

| Check | Status |
|-------|--------|
| jscpd (duplicate code) | ✅ 0 clones |
| dependency-cruiser | ✅ 0 violations |
| biome lint | Available |
| TypeScript compile | Available |

---

## Future Enhancements (Phase 2)

From design documents:

### Immersive Lab Environment
- Enhanced equipment (ECG monitors, centrifuges)
- Advanced PBR materials
- Dynamic multi-zone lighting
- Interactive elements (switches, controls)
- Audio environment system

### Interactive Heart Controls
- Full control panel with sliders
- Preset configurations (Healthy Heart, Rapid Growth, Lab Demo)
- Parameter validation and tooltips
- Real-time value displays

---

## Build Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript compile
npm run watch   # Watch mode compile
npm run lint    # Biome check
npm run format  # Biome format
npm run preview # Preview production build
```

---

## Dependencies

- **@babylonjs/core** ^7.0.0
- **@babylonjs/inspector** ^7.0.0
- **@babylonjs/loaders** ^7.0.0
- **@biomejs/biome** ^2.4.12
- **@types/node** ^20.0.0
- **jscpd** ^4.0.9
- **dependency-cruiser** ^latest
- **typescript** ^5.4.0
- **vite** ^5.0.0