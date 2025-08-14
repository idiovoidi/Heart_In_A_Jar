# Interactive Heart Controls System

A comprehensive control system for the Heart in a Jar simulation, providing advanced parameter management, real-time monitoring, and user-friendly interfaces.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Components](#core-components)
- [Advanced Features](#advanced-features)
- [Testing](#testing)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Interactive Heart Controls System provides a modular, extensible framework for controlling and monitoring a 3D heart simulation. It features:

- **16 comprehensive parameters** across 4 major systems
- **Real-time monitoring** with medical-grade displays
- **Advanced error handling** and recovery mechanisms
- **Parameter linking** for realistic physiological relationships
- **Responsive UI** that works across all devices
- **Comprehensive testing** with 200+ automated tests

## 🏗️ Architecture

The system follows a modular architecture with clear separation of concerns:

```
ControlPanelManager (Main Controller)
├── ParameterController (Core parameter management)
├── ParameterEventSystem (Event handling)
├── HeartControlSystem (Heart simulation controls)
├── ArteryControlSystem (Artery growth controls)
├── FluidControlSystem (Blood flow controls)
├── EnvironmentControlSystem (Environment controls)
├── PresetManager (Preset configurations)
├── PresetUI (Preset user interface)
├── ParameterLinkingSystem (Parameter relationships)
├── AdvancedValidationSystem (Input validation)
├── KeyboardShortcutSystem (Keyboard controls)
├── ErrorHandlingSystem (Error management)
├── GracefulFallbackSystem (Component fallbacks)
└── ErrorLoggingSystem (Comprehensive logging)
```

## 🔧 Core Components

### ParameterController
Central parameter management with validation and application logic.

**Key Features:**
- 16 predefined parameters with metadata
- Type validation and range checking
- Event-driven parameter changes
- Callback system for custom handling

**Parameters:**
- **Heart**: `heartBeating`, `heartBeatSpeed`, `heartSize`, `heartContractionIntensity`
- **Arteries**: `arteryGrowth`, `arteryGrowthSpeed`, `arteryMaxBranches`, `arteryThickness`
- **Blood**: `bloodFlow`, `bloodFlowRate`, `bloodViscosity`, `bloodLevel`
- **Environment**: `overheadLight`, `fogDensity`, `postProcessing`, `cameraSensitivity`

### ControlPanelManager
Main orchestrator that manages all subsystems and provides the primary API.

**Responsibilities:**
- UI generation and management
- System coordination
- Error handling integration
- Configuration management

### Control Systems
Specialized systems for each simulation aspect:

#### HeartControlSystem
- Real-time BPM monitoring
- ECG-style rhythm visualization
- Heart status indicators
- Medical-grade displays

#### ArteryControlSystem
- Growth pattern analysis
- Branch counting and monitoring
- Debug tools and visualizations
- Performance optimization

#### FluidControlSystem
- Hemodynamic simulation
- Blood analysis displays
- Flow rate monitoring
- Level management

#### EnvironmentControlSystem
- Laboratory atmosphere control
- Lighting presets
- Post-processing effects
- Camera management

## 🚀 Advanced Features

### Parameter Linking System
Creates realistic physiological relationships between parameters:

- **Heart rate → Artery pulse speed**: Synchronized cardiovascular simulation
- **Heart size → Blood flow rate**: Larger hearts require more circulation
- **Contraction intensity → Artery thickness**: Pressure affects vessel development
- **Blood viscosity → Flow rate**: Inverse relationship modeling
- **Artery count → Blood requirements**: More vessels need more blood

### Advanced Validation System
Comprehensive input validation with user-friendly feedback:

- **Range validation** with custom error messages
- **Contextual validation** considering parameter relationships
- **Performance warnings** for resource-intensive settings
- **Recovery suggestions** for fixing issues
- **Validation history** for debugging

### Error Handling & Recovery
Multi-layered error handling with graceful degradation:

- **Automatic error detection** and classification
- **Graceful fallbacks** for missing components
- **System recovery** mechanisms
- **Comprehensive logging** with export capabilities
- **Health monitoring** with status reporting

### Keyboard Shortcuts
Extensive keyboard control system:

- **20+ shortcuts** for all major functions
- **Context-aware** activation
- **Visual feedback** for actions
- **Help system** with categorized reference
- **Customizable** key bindings

## 🧪 Testing

Comprehensive test suite with multiple testing levels:

### Test Coverage
- **Unit Tests**: Individual component testing
- **Integration Tests**: Cross-system communication
- **Stress Tests**: Performance under load
- **Error Scenario Tests**: Failure handling
- **UI Tests**: Interface responsiveness

### Test Files
- `ParameterControllerTest.js` - Core parameter management
- `ControlPanelTest.js` - UI generation and management
- `HeartControlTest.js` - Heart simulation controls
- `ArteryControlTest.js` - Artery growth system
- `FluidControlTest.js` - Blood flow controls
- `EnvironmentControlTest.js` - Environment management
- `PresetTest.js` - Preset system functionality
- `UIEnhancementTest.js` - Responsive design features
- `AdvancedFeaturesTest.js` - Parameter linking and validation
- `ErrorHandlingTest.js` - Error handling and recovery
- `ComprehensiveTestSuite.js` - Complete system testing

### Running Tests
```javascript
// Run all tests
const testSuite = new ComprehensiveTestSuite(controlPanelManager);
await testSuite.runAllTests();

// Run with options
await testSuite.runAllTests({
    stopOnFailure: false,
    verbose: true,
    includeStressTests: true,
    includeIntegrationTests: true
});

// Download test results
testSuite.downloadResults();
```

## 📖 Usage

### Basic Setup
```javascript
import { ControlPanelManager } from './js/controls/ControlPanelManager.js';

// Initialize with scene manager
const controlPanel = new ControlPanelManager(sceneManager);

// The system automatically creates UI and sets up all subsystems
```

### Parameter Management
```javascript
// Apply parameter changes
controlPanel.applyParameterChange('heartBeatSpeed', 2.5, 'user');

// Get current values
const currentBPM = controlPanel.parameterController.getCurrentValue('heartBeatSpeed');

// Reset parameters
controlPanel.parameterController.resetParameter('heartBeatSpeed');
controlPanel.parameterController.resetAllParameters();
```

### Preset Management
```javascript
// Apply built-in presets
controlPanel.presetManager.applyPreset('healthy-heart');
controlPanel.presetManager.applyPreset('rapid-growth');
controlPanel.presetManager.applyPreset('laboratory-demo');

// Create custom presets
controlPanel.presetManager.savePreset('my-preset', {
    heartBeatSpeed: 2.0,
    heartSize: 1.2,
    bloodFlowRate: 0.0005
});
```

### Error Handling
```javascript
// Check system health
const health = controlPanel.checkSystemHealth();
console.log(`System status: ${health.overall}`);

// Perform recovery
const recovered = controlPanel.performSystemRecovery('auto');

// Access error logs
const errorLogs = controlPanel.errorLoggingSystem.getLogs({ level: 'ERROR' });
```

### Advanced Features
```javascript
// Configure parameter linking
controlPanel.setParameterLinkingEnabled(true);

// Enable advanced validation
controlPanel.setAdvancedValidationEnabled(true);

// Configure smooth transitions
controlPanel.setSmoothTransitionsEnabled(true);
controlPanel.setTransitionDuration(500); // milliseconds
```

## 📚 API Reference

### ControlPanelManager

#### Methods
- `applyParameterChange(paramName, value, source)` - Apply parameter with validation
- `getCurrentParameterValues()` - Get all current parameter values
- `checkSystemHealth()` - Get comprehensive system health report
- `performSystemRecovery(type)` - Perform system recovery
- `showAdvancedSettings()` - Display advanced configuration panel
- `showSystemDiagnostics()` - Display system diagnostics
- `exportConfiguration()` - Export current configuration
- `importConfiguration(config)` - Import configuration

#### Events
- `parameterChanged` - Parameter value changed
- `validationFailed` - Parameter validation failed
- `systemError` - System error occurred
- `recoveryCompleted` - System recovery completed

### ParameterController

#### Methods
- `applyParameter(name, value)` - Apply parameter value
- `validateParameter(name, value)` - Validate parameter value
- `getCurrentValue(name)` - Get current parameter value
- `resetParameter(name)` - Reset parameter to default
- `registerCallback(name, callback)` - Register parameter change callback

### Parameter Definitions
Each parameter includes:
- `displayName` - Human-readable name
- `type` - Control type (slider, toggle, button)
- `min/max/step` - Range constraints
- `defaultValue` - Default value
- `unit` - Display unit
- `description` - Parameter description
- `tooltip` - Help text
- `validator` - Validation function
- `formatter` - Display formatter

## ⚙️ Configuration

### System Configuration
```javascript
const config = {
    autoUpdate: true,                    // Auto-update UI on changes
    showTooltips: true,                  // Show parameter tooltips
    showValues: true,                    // Show current values
    animateChanges: true,                // Animate parameter changes
    collapsibleSections: true,           // Allow section collapse
    enableParameterLinking: true,        // Enable parameter relationships
    enableAdvancedValidation: true,      // Enable comprehensive validation
    enableKeyboardShortcuts: true,       // Enable keyboard controls
    enableErrorHandling: true,           // Enable error handling
    enableGracefulFallbacks: true,       // Enable component fallbacks
    enableErrorLogging: true,            // Enable comprehensive logging
    smoothTransitions: true,             // Enable smooth parameter transitions
    transitionDuration: 300              // Transition duration in milliseconds
};
```

### Logging Configuration
```javascript
// Set log level
controlPanel.errorLoggingSystem.setLogLevel('INFO');

// Add log listener
controlPanel.errorLoggingSystem.addLogListener('*', (logEntry) => {
    console.log('Log:', logEntry);
});

// Set category filter
controlPanel.errorLoggingSystem.setCategoryFilter('debug', false);
```

## 🔍 Troubleshooting

### Common Issues

#### Parameter Changes Not Applied
1. Check parameter validation: `controlPanel.validationSystem.validateParameter(name, value)`
2. Verify parameter exists: `controlPanel.parameterController.getParameter(name)`
3. Check error logs: `controlPanel.errorLoggingSystem.getLogs({ level: 'ERROR' })`

#### UI Not Updating
1. Check if control exists: `document.querySelector('[data-parameter="paramName"]')`
2. Verify event system: `controlPanel.eventSystem`
3. Check for JavaScript errors in console

#### System Performance Issues
1. Check system health: `controlPanel.checkSystemHealth()`
2. Review error rate: `controlPanel.errorLoggingSystem.getLogStatistics()`
3. Disable non-essential features temporarily

#### Missing Components
1. Check fallback status: `controlPanel.gracefulFallbackSystem.getSystemStatus()`
2. Attempt component restoration: `controlPanel.gracefulFallbackSystem.attemptComponentRestoration()`
3. Review diagnostic report: `controlPanel.gracefulFallbackSystem.createDiagnosticReport()`

### Debug Tools

#### System Diagnostics
```javascript
// Show diagnostics panel
controlPanel.showSystemDiagnostics();

// Get diagnostic data
const diagnostics = {
    systemHealth: controlPanel.checkSystemHealth(),
    errorLogs: controlPanel.errorLoggingSystem.exportLogs(),
    fallbackReport: controlPanel.gracefulFallbackSystem.createDiagnosticReport(),
    advancedStatus: controlPanel.getAdvancedSystemStatus()
};
```

#### Test System
```javascript
// Run comprehensive tests
const testSuite = new ComprehensiveTestSuite(controlPanel);
await testSuite.runAllTests();

// Run specific test category
const heartTest = new HeartControlTest(controlPanel);
await heartTest.runAllTests();
```

### Performance Optimization

#### Reduce Resource Usage
1. Disable smooth transitions: `controlPanel.setSmoothTransitionsEnabled(false)`
2. Reduce logging level: `controlPanel.errorLoggingSystem.setLogLevel('WARN')`
3. Disable parameter linking: `controlPanel.setParameterLinkingEnabled(false)`

#### Memory Management
1. Clear error logs: `controlPanel.errorLoggingSystem.clearLogs()`
2. Force garbage collection: `window.gc()` (if available)
3. Monitor memory usage: `window.performance.memory`

## 🤝 Contributing

### Code Style
- Use ES6+ features
- Follow JSDoc documentation standards
- Include comprehensive error handling
- Write tests for new features

### Testing Requirements
- Unit tests for all new methods
- Integration tests for cross-system features
- Error scenario tests for failure cases
- Performance tests for resource-intensive features

### Documentation
- Update README.md for new features
- Include inline JSDoc comments
- Provide usage examples
- Document configuration options

## 📄 License

This project is part of the Heart in a Jar simulation system. See the main project license for details.

## 🔗 Related Files

- `../HeartSimulation.js` - Main heart simulation
- `../ArterySimulation.js` - Artery growth simulation
- `../main.js` - Application entry point
- `../../css/styles.css` - UI styling
- `../../index.html` - Main HTML file