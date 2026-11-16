# Requirements Document

## Introduction

This feature will add interactive controls to the existing heart-in-jar demo, allowing users to manipulate various parameters of the heart simulation, artery growth, blood flow, and environmental settings in real-time. The goal is to create an engaging, educational experience where users can experiment with different biological and visual parameters to see how they affect the heart simulation.

## Requirements

### Requirement 1

**User Story:** As a user, I want to control heart simulation parameters, so that I can experiment with different heart behaviors and understand cardiac physiology.

#### Acceptance Criteria

1. WHEN the user adjusts the heart beat speed slider THEN the heart SHALL pulse at the corresponding rate
2. WHEN the user toggles the heart beating THEN the heart SHALL start or stop its beating animation
3. WHEN the user adjusts the heart size slider THEN the heart SHALL scale proportionally
4. WHEN the user adjusts the contraction intensity slider THEN the heart chambers SHALL contract with the corresponding strength

### Requirement 2

**User Story:** As a user, I want to control artery growth parameters, so that I can observe how different conditions affect vascular development.

#### Acceptance Criteria

1. WHEN the user adjusts the growth speed slider THEN arteries SHALL grow at the corresponding rate
2. WHEN the user adjusts the maximum branches slider THEN the artery system SHALL limit growth to that number of branches
3. WHEN the user toggles artery growth THEN the growth process SHALL start or stop
4. WHEN the user clicks reset arteries THEN the artery system SHALL clear and restart growth from the heart
5. WHEN the user adjusts the artery thickness slider THEN new arteries SHALL be created with the corresponding radius

### Requirement 3

**User Story:** As a user, I want to control blood flow and fluid parameters, so that I can see how different conditions affect blood circulation.

#### Acceptance Criteria

1. WHEN the user adjusts the blood flow rate slider THEN the fluid simulation SHALL fill at the corresponding speed
2. WHEN the user adjusts the blood viscosity slider THEN the fluid SHALL behave with the corresponding thickness
3. WHEN the user toggles blood flow THEN the fluid filling SHALL start or stop
4. WHEN the user clicks drain blood THEN the fluid level SHALL decrease to empty

### Requirement 4

**User Story:** As a user, I want to control environmental and visual settings, so that I can customize the laboratory atmosphere and visual quality.

#### Acceptance Criteria

1. WHEN the user toggles the overhead light THEN the laboratory lighting SHALL turn on or off
2. WHEN the user adjusts the fog density slider THEN the atmospheric fog SHALL become more or less dense
3. WHEN the user toggles post-processing effects THEN bloom and other visual effects SHALL be enabled or disabled
4. WHEN the user adjusts the camera sensitivity slider THEN camera controls SHALL respond with the corresponding sensitivity

### Requirement 5

**User Story:** As a user, I want preset configurations, so that I can quickly switch between different demonstration modes.

#### Acceptance Criteria

1. WHEN the user clicks a preset button THEN all parameters SHALL be set to predefined values for that scenario
2. WHEN the user clicks "Healthy Heart" preset THEN parameters SHALL be set to simulate normal cardiac function
3. WHEN the user clicks "Rapid Growth" preset THEN parameters SHALL be set to demonstrate accelerated artery development
4. WHEN the user clicks "Laboratory Demo" preset THEN parameters SHALL be set for educational demonstration purposes

### Requirement 6

**User Story:** As a user, I want visual feedback and information, so that I can understand the current state and values of the simulation.

#### Acceptance Criteria

1. WHEN the user hovers over a control THEN a tooltip SHALL display explaining the parameter's effect
2. WHEN parameters change THEN the current values SHALL be displayed next to sliders
3. WHEN the simulation reaches limits THEN visual indicators SHALL show the constraint status
4. WHEN presets are applied THEN a confirmation message SHALL briefly appear