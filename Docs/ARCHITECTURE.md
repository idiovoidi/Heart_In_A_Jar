# Architecture Overview

## System Structure

```
Artery_Sim_babylon/
├── src/
│   ├── main.ts                 # Entry point, SceneManager orchestration
│   │
│   ├── core/                   # Base abstractions
│   │   ├── EntityBase.ts       # Entity interface (getMesh, update, dispose)
│   │   └── ErrorDecorator.ts   # Error handling utility
│   │
│   ├── simulation/             # Core simulation systems
│   │   ├── HeartSimulation.ts  # Heart beating animation
│   │   ├── VesselGrowthSystem.ts  # Space colonization algorithm
│   │   ├── FluidSimulation.ts # Blood/fluid fill simulation
│   │   ├── FleshClumps.ts      # Ambient flesh particles
│   │   └── FleshGoblin.ts      # Background flesh elements
│   │
│   ├── environment/            # Environment components
│   │   ├── LabJar.ts           # Glass jar container
│   │   ├── LabEnvironment.ts   # Lab setting (table, background)
│   │   └── InteractiveGrowthControls.ts  # Growth parameter UI
│   │
│   ├── camera/                 # Camera system
│   │   └── SceneCamera.ts      # ArcRotateCamera wrapper
│   │
│   ├── lighting/               # Lighting system
│   │   └── SceneLighting.ts   # Scene lights setup
│   │
│   ├── inputs/                 # User input handling
│   │   ├── InputManager.ts     # Keyboard/mouse input
│   │   └── ButtonHandler.ts    # GUI button management
│   │
│   ├── controls/               # UI control system
│   │   ├── ControlPanelManager.ts  # Main control panel
│   │   └── QuickSystemTest.ts # Test utilities
│   │
│   ├── postprocessing/         # Visual effects
│   │   └── PostProcessingManager.ts  # Post-processing pipeline
│   │
│   ├── components/             # Reusable 3D components
│   │   ├── AnimationComponent.ts
│   │   ├── MaterialComponent.ts
│   │   └── MovementComponent.ts
│   │
│   ├── debug/                  # Debug tools
│   │   └── SceneDebug.ts       # Babylon inspector integration
│   │
│   └── types/                  # TypeScript definitions
│       ├── scene.ts            # SceneManager type exports
│       └── babylon.d.ts        # Babylon type declarations
│
├── Docs/                       # Documentation
│   └── ARCHITECTURE.md         # This file
│
└── public/                    # Static assets (textures, etc.)
```

## Core Concepts

### Entity Component System

All simulation components implement `EntityBase`:
- `getMesh(): AbstractMesh` - Returns the Babylon mesh
- `update(deltaTime: number): void` - Called each frame
- `dispose(): void` - Cleanup on shutdown

### SceneManager

Central orchestrator that:
- Creates Babylon Engine and Scene
- Manages entity registration and lifecycle
- Coordinates render loop
- Exposes component getters (heartSim, vesselGrowth, fluidSim, etc.)

### Rendering Pipeline

1. **Setup Phase**: Create scene, camera, lighting, post-processing
2. **Entity Registration**: Create and position all simulation components
3. **Render Loop**: Update all entities, render frame
4. **Cleanup**: Dispose resources on shutdown

## Key Systems

### Vessel Growth System

Uses space colonization algorithm:
- Seeds grow from heart surface
- Attract points generate branches within attraction radius
- Kill radius prevents overcrowding
- Configurable: segment length, branch angle, max branches, growth speed

### Control Panel

- Built with Babylon GUI (AdvancedDynamicTexture)
- ButtonHandler manages button interactions
- ControlPanelManager coordinates UI updates

### Post-Processing

- DefaultRenderingPipeline with bloom, chromatic aberration
- Managed by PostProcessingManager
- Can be toggled via controls

## Dependencies

- **@babylonjs/core** - Core 3D engine
- **@babylonjs/inspector** - Debug tools
- **@babylonjs/loaders** - Asset loading
- **biome** - Linting/formatting
- **jscpd** - Duplicate code detection
- **dependency-cruiser** - Dependency analysis

## Build Commands

```bash
npm run dev      # Start dev server
npm run build    # TypeScript compile
npm run lint     # Biome check
npm run format   # Biome format
```