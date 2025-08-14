# Design Document

## Overview

The Interactive Heart Controls feature will enhance the existing heart-in-jar demo by adding a comprehensive control panel that allows real-time manipulation of simulation parameters. The design leverages the existing component architecture and extends the current ButtonHandler system to provide a rich, educational interface for exploring cardiac physiology and vascular development.

## Architecture

### Component Structure

The system will follow the existing component-based architecture with these key components:

1. **ControlPanelManager** - Main orchestrator for all UI controls
2. **ParameterController** - Handles parameter validation and application
3. **PresetManager** - Manages preset configurations
4. **TooltipSystem** - Provides contextual help and information
5. **ValueDisplayManager** - Shows real-time parameter values

### Integration Points

The controls will integrate with existing systems:
- **HeartSimulation** - Beat speed, contraction intensity, size scaling
- **ArterySimulation** - Growth parameters, branching limits, thickness
- **FluidSimulation** - Flow rate, viscosity, filling behavior
- **LabEnvironment** - Lighting, fog density, atmospheric effects
- **SceneCamera** - Sensitivity and view controls

## Components and Interfaces

### ControlPanelManager

```javascript
class ControlPanelManager {
    constructor(sceneManager)
    createControlSections()
    updateControlValues()
    applyPreset(presetName)
    dispose()
}
```

**Responsibilities:**
- Create and manage the main control panel UI
- Coordinate between different control sections
- Handle preset application
- Manage panel visibility and layout

### ParameterController

```javascript
class ParameterController {
    constructor(sceneManager)
    validateParameter(name, value)
    applyParameter(name, value)
    getParameterLimits(name)
    registerParameterCallback(name, callback)
}
```

**Responsibilities:**
- Validate parameter values within acceptable ranges
- Apply parameters to appropriate simulation components
- Provide parameter metadata (limits, descriptions)
- Handle parameter change callbacks

### Control Sections

#### HeartControlSection
- Beat speed slider (0.5-5.0 BPM multiplier)
- Beat toggle button
- Heart size slider (0.3-2.0 scale)
- Contraction intensity slider (0.1-2.0 multiplier)

#### ArteryControlSection  
- Growth speed slider (25-500ms delay)
- Max branches slider (10-200 branches)
- Artery thickness slider (0.05-0.3 radius)
- Growth toggle button
- Reset arteries button

#### FluidControlSection
- Flow rate slider (0.0001-0.01 fill speed)
- Viscosity slider (0.5-5.0 viscosity multiplier)
- Blood level target slider (0.0-1.0 fill level)
- Flow toggle button
- Drain blood button

#### EnvironmentControlSection
- Overhead light toggle
- Fog density slider (0.0-0.2 density)
- Post-processing toggle
- Camera sensitivity slider (0.1-2.0 multiplier)

#### PresetSection
- Healthy Heart button
- Rapid Growth button  
- Laboratory Demo button
- Custom preset save/load

## Data Models

### ParameterDefinition

```javascript
{
    name: string,
    displayName: string,
    type: 'slider' | 'toggle' | 'button',
    min: number,
    max: number,
    step: number,
    defaultValue: any,
    description: string,
    tooltip: string,
    target: string, // Which simulation component
    property: string, // Which property to modify
    validator: function,
    formatter: function
}
```

### PresetConfiguration

```javascript
{
    name: string,
    displayName: string,
    description: string,
    parameters: {
        [parameterName]: value
    }
}
```

### ControlState

```javascript
{
    isVisible: boolean,
    currentPreset: string,
    parameterValues: Map<string, any>,
    isDirty: boolean,
    lastUpdate: timestamp
}
```

## Error Handling

### Parameter Validation
- Range checking for all numeric inputs
- Type validation for all parameters
- Graceful fallback to default values on invalid input
- User feedback for validation errors

### Simulation Integration
- Safe parameter application with rollback on failure
- Component availability checking before parameter application
- Error logging for debugging
- Graceful degradation when components are unavailable

### UI Error Handling
- Tooltip display for invalid values
- Visual feedback for parameter limits
- Error messages for failed operations
- Recovery mechanisms for UI state corruption

## Testing Strategy

### Unit Testing
- Parameter validation logic
- Preset configuration loading/saving
- Control value formatting and parsing
- Component integration interfaces

### Integration Testing
- End-to-end parameter application
- Preset switching functionality
- UI responsiveness under various conditions
- Cross-component parameter interactions

### User Experience Testing
- Control responsiveness and feedback
- Tooltip accuracy and helpfulness
- Preset effectiveness for different use cases
- Visual feedback clarity

### Performance Testing
- UI update frequency optimization
- Parameter application performance
- Memory usage during extended use
- Smooth animation during parameter changes

## Implementation Phases

### Phase 1: Core Infrastructure
- Extend existing ButtonHandler to ControlPanelManager
- Implement ParameterController with basic validation
- Create base control section framework
- Add parameter definition system

### Phase 2: Heart and Artery Controls
- Implement HeartControlSection with all sliders
- Add ArteryControlSection with growth controls
- Integrate with existing HeartSimulation and ArterySimulation
- Add real-time value display

### Phase 3: Fluid and Environment Controls
- Implement FluidControlSection
- Add EnvironmentControlSection
- Integrate with FluidSimulation and LabEnvironment
- Add visual feedback for parameter changes

### Phase 4: Presets and Polish
- Implement PresetManager with predefined configurations
- Add TooltipSystem for contextual help
- Implement custom preset save/load
- Add smooth transitions and animations

### Phase 5: Advanced Features
- Add parameter linking (e.g., heart rate affects artery pulse)
- Implement parameter history/undo
- Add export functionality for configurations
- Performance optimization and polish