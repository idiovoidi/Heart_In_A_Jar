import { EntityBase } from './core/EntityBase.js';
import { MaterialComponent } from './components/MaterialComponent.js';
import { AnimationComponent } from './components/AnimationComponent.js';
import { ErrorDecorator } from './core/ErrorDecorator.js';

export class HeartSimulation extends EntityBase {
    constructor(scene) {
        super(scene, "heartGroup");
        
        // Add components
        this.materialComponent = this.addComponent(new MaterialComponent(scene));
        this.animationComponent = this.addComponent(new AnimationComponent({
            speed: 1.0,
            looping: true
        }));
        
        this.time = 0;
        this.beatSpeed = 2;
        this.isBeating = true;
        this.contractionIntensity = 1.0;
        
        // Create structure containers
        this.structure = {};
        this.chambers = {};
        this.valves = {};
        this.surface = {};
        
        this.init();
    }
    
    init() {
        try {
            this.createHeartStructure();
            this.createAnatomicalHeart();
        } catch (error) {
            console.error("Error initializing HeartSimulation:", error);
            ErrorDecorator.logError(error, "HeartSimulation.init");
        }
    }

    createHeartStructure() {
        try {
            // Create main structural groups
            this.structure = {
                core: new BABYLON.TransformNode("core", this.scene),
                chambers: new BABYLON.TransformNode("chambers", this.scene),
                vessels: new BABYLON.TransformNode("vessels", this.scene),
                valves: new BABYLON.TransformNode("valves", this.scene),
                muscles: new BABYLON.TransformNode("muscles", this.scene),
                surface: new BABYLON.TransformNode("surface", this.scene)
            };

            // Parent all groups to the heart group
            Object.values(this.structure).forEach(node => {
                node.parent = this.entityNode;
            });
        } catch (error) {
            console.error("Error creating heart structure:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createHeartStructure");
        }
    }

    createAnatomicalHeart() {
        try {
            // Create chambers
            this.chambers = {
                leftVentricle: this.createLeftVentricle(),
                rightVentricle: this.createRightVentricle(),
                leftAtrium: this.createLeftAtrium(),
                rightAtrium: this.createRightAtrium(),
                connectingTissue: this.createConnectingTissue()
            };

            // Create valves
            this.valves = {
                mitral: this.createMitralValve(),
                tricuspid: this.createTricuspidValve(),
                semilunar: this.createSemilunarValves()
            };

            // Create surface features
            this.surface = {
                coronaryVessels: this.createCoronaryVessels(),
                muscleFibers: this.createMuscleFibers(),
                details: this.createSurfaceDetails()
            };
        } catch (error) {
            console.error("Error creating anatomical heart:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createAnatomicalHeart");
        }
    }

    createLeftVentricle() {
        try {
            const points = [];
            const resolution = 20;
            
            // Create heart shape curve points
            for (let i = 0; i <= resolution; i++) {
                const t = i / resolution;
                const x = -1.5 * Math.sin(t * Math.PI);
                const y = -2.5 + 3.5 * t;
                points.push(new BABYLON.Vector3(x, y, 0));
            }

            // Create custom shape
            const ventricle = BABYLON.MeshBuilder.CreateLathe("leftVentricle", {
                shape: points,
                radius: 1,
                tessellation: 32,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
            }, this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("ventriclemat", {
                albedoColor: new BABYLON.Color3(0.55, 0, 0),
                roughness: 0.7,
                metallic: 0.1
            });
            
            ventricle.material = material;
            ventricle.parent = this.structure.chambers;

            return ventricle;
        } catch (error) {
            console.error("Error creating left ventricle:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createLeftVentricle");
            return null;
        }
    }

    createRightVentricle() {
        try {
            const points = [];
            const resolution = 20;
            
            // Create slightly different shape for right ventricle
            for (let i = 0; i <= resolution; i++) {
                const t = i / resolution;
                const x = 1.2 * Math.sin(t * Math.PI);
                const y = -2.0 + 3.0 * t;
                points.push(new BABYLON.Vector3(x, y, 0));
            }

            const ventricle = BABYLON.MeshBuilder.CreateLathe("rightVentricle", {
                shape: points,
                radius: 0.8,
                tessellation: 32,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
            }, this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("rightventmat", {
                albedoColor: new BABYLON.Color3(0.5, 0, 0),
                roughness: 0.75,
                metallic: 0.1
            });
            
            ventricle.material = material;
            ventricle.parent = this.structure.chambers;

            return ventricle;
        } catch (error) {
            console.error("Error creating right ventricle:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createRightVentricle");
            return null;
        }
    }

    createLeftAtrium() {
        try {
            const atrium = BABYLON.MeshBuilder.CreateSphere("leftAtrium", {
                segments: 32,
                diameter: 2
            }, this.scene);

            // Deform the sphere to create atrium shape
            const positions = atrium.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                if (y < 0) {
                    positions[i + 1] = y * 1.2;
                }
            }
            atrium.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

            // Create material using component
            const material = this.materialComponent.createMaterial("leftatriummat", {
                albedoColor: new BABYLON.Color3(0.6, 0.15, 0.15),
                roughness: 0.65,
                metallic: 0.1
            });
            
            atrium.material = material;
            atrium.parent = this.structure.chambers;
            atrium.position = new BABYLON.Vector3(-0.8, 2.2, 0);

            return atrium;
        } catch (error) {
            console.error("Error creating left atrium:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createLeftAtrium");
            return null;
        }
    }

    createRightAtrium() {
        try {
            const atrium = BABYLON.MeshBuilder.CreateSphere("rightAtrium", {
                segments: 32,
                diameter: 2.2
            }, this.scene);

            // Deform the sphere
            const positions = atrium.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                if (y < 0) {
                    positions[i + 1] = y * 1.3;
                }
            }
            atrium.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);

            // Create material using component
            const material = this.materialComponent.createMaterial("rightatriummat", {
                albedoColor: new BABYLON.Color3(0.58, 0.24, 0.25),
                roughness: 0.7,
                metallic: 0.1
            });
            
            atrium.material = material;
            atrium.parent = this.structure.chambers;
            atrium.position = new BABYLON.Vector3(0.8, 2.2, 0);

            return atrium;
        } catch (error) {
            console.error("Error creating right atrium:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createRightAtrium");
            return null;
        }
    }

    createConnectingTissue() {
        try {
            const tissue = new BABYLON.TransformNode("connectingTissue", this.scene);
            
            // Create material using component
            const material = this.materialComponent.createMaterial("tissuemat", {
                albedoColor: new BABYLON.Color3(0.55, 0, 0),
                roughness: 0.6,
                alpha: 0.7
            });
            
            // Create left connection
            const leftConnection = BABYLON.MeshBuilder.CreateCylinder("leftConnection", {
                height: 1.5,
                diameter: 0.8,
                tessellation: 32
            }, this.scene);
            
            leftConnection.material = material;
            leftConnection.position = new BABYLON.Vector3(-0.8, 1.5, 0);
            leftConnection.parent = tissue;

            // Create right connection
            const rightConnection = leftConnection.clone("rightConnection");
            rightConnection.position = new BABYLON.Vector3(0.8, 1.5, 0);
            rightConnection.parent = tissue;

            tissue.parent = this.structure.chambers;
            return tissue;
        } catch (error) {
            console.error("Error creating connecting tissue:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createConnectingTissue");
            return null;
        }
    }

    createMitralValve() {
        try {
            const valveGroup = new BABYLON.TransformNode("mitralValve", this.scene);
            
            // Create material using component
            const material = this.materialComponent.createMaterial("valvemat", {
                albedoColor: new BABYLON.Color3(0.94, 0.89, 0.88),
                roughness: 0.4,
                alpha: 0.9
            });

            // Create anterior leaflet
            const anteriorLeaflet = BABYLON.MeshBuilder.CreateDisc("anteriorLeaflet", {
                radius: 0.8,
                arc: 0.5,
                tessellation: 32
            }, this.scene);
            anteriorLeaflet.material = material;
            anteriorLeaflet.position = new BABYLON.Vector3(-1, 1.5, 0);
            anteriorLeaflet.rotation.z = Math.PI;
            anteriorLeaflet.parent = valveGroup;

            // Create posterior leaflet
            const posteriorLeaflet = BABYLON.MeshBuilder.CreateDisc("posteriorLeaflet", {
                radius: 0.6,
                arc: 0.5,
                tessellation: 32
            }, this.scene);
            posteriorLeaflet.material = material;
            posteriorLeaflet.position = new BABYLON.Vector3(-1.2, 1.3, 0.2);
            posteriorLeaflet.rotation.z = Math.PI * 1.1;
            posteriorLeaflet.parent = valveGroup;

            valveGroup.parent = this.structure.valves;
            return valveGroup;
        } catch (error) {
            console.error("Error creating mitral valve:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createMitralValve");
            return null;
        }
    }

    createTricuspidValve() {
        try {
            const valveGroup = new BABYLON.TransformNode("tricuspidValve", this.scene);
            
            // Create material using component
            const material = this.materialComponent.createMaterial("tricuspidvalvemat", {
                albedoColor: new BABYLON.Color3(0.94, 0.89, 0.88),
                roughness: 0.4,
                alpha: 0.9
            });

            // Create three leaflets
            for (let i = 0; i < 3; i++) {
                const leaflet = BABYLON.MeshBuilder.CreateDisc("tricuspidLeaflet" + i, {
                    radius: 0.7,
                    arc: 0.4,
                    tessellation: 32
                }, this.scene);
                leaflet.material = material;
                leaflet.position = new BABYLON.Vector3(1, 1.3, 0);
                leaflet.rotation = new BABYLON.Vector3(
                    0,
                    i * Math.PI / 6,
                    Math.PI + (i * Math.PI / 3)
                );
                leaflet.parent = valveGroup;
            }

            valveGroup.parent = this.structure.valves;
            return valveGroup;
        } catch (error) {
            console.error("Error creating tricuspid valve:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createTricuspidValve");
            return null;
        }
    }

    createSemilunarValves() {
        try {
            const valveGroup = new BABYLON.TransformNode("semilunarValves", this.scene);
            
            // Create material using component
            const material = this.materialComponent.createMaterial("semilunarvalvemat", {
                albedoColor: new BABYLON.Color3(0.98, 0.98, 0.98),
                roughness: 0.3,
                alpha: 0.85
            });

            const createValveCusps = (position, rotation) => {
                const cuspGroup = new BABYLON.TransformNode("cuspGroup", this.scene);
                cuspGroup.position = position;
                cuspGroup.rotation = rotation;
                cuspGroup.parent = valveGroup;

                for (let i = 0; i < 3; i++) {
                    const cusp = BABYLON.MeshBuilder.CreateTorus("cusp" + i, {
                        diameter: 0.8,
                        thickness: 0.2,
                        tessellation: 32,
                        arc: 0.5
                    }, this.scene);
                    cusp.material = material;
                    cusp.rotation.z = (i * Math.PI * 2) / 3;
                    cusp.parent = cuspGroup;
                }
                return cuspGroup;
            };

            // Create aortic and pulmonary valves
            createValveCusps(
                new BABYLON.Vector3(-1, 2.5, 0),
                new BABYLON.Vector3(Math.PI / 2, 0, 0)
            );
            createValveCusps(
                new BABYLON.Vector3(1, 2.5, 0),
                new BABYLON.Vector3(Math.PI / 2, 0, Math.PI / 6)
            );

            return valveGroup;
        } catch (error) {
            console.error("Error creating semilunar valves:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createSemilunarValves");
            return null;
        }
    }

    createCoronaryVessels() {
        try {
            const vesselGroup = new BABYLON.TransformNode("coronaryVessels", this.scene);
            
            // Create artery material
            const arteryMaterial = this.materialComponent.createMaterial("arteryMat", {
                albedoColor: new BABYLON.Color3(0.8, 0, 0),
                roughness: 0.5,
                metallic: 0.2
            });
            
            // Create vein material
            const veinMaterial = this.materialComponent.createMaterial("veinMat", {
                albedoColor: new BABYLON.Color3(0, 0, 0.5),
                roughness: 0.6,
                metallic: 0.1
            });
            
            // Helper function to create vessel curves
            const createVessel = (points, radius, material) => {
                // Create a custom curve from points
                const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 60);
                const tube = BABYLON.MeshBuilder.CreateTube("vessel", {
                    path: catmullRom.getPoints(),
                    radius: radius,
                    tessellation: 12, // Increased from 8 for smoother look
                    updatable: false
                }, this.scene);

                tube.material = material;
                tube.parent = vesselGroup;
                return tube;
            };

            // Left anterior descending artery (LAD)
            const ladPoints = [
                new BABYLON.Vector3(-0.8, 2.0, 0.5),
                new BABYLON.Vector3(-1.0, 1.5, 0.6),
                new BABYLON.Vector3(-1.2, 0.5, 0.4),
                new BABYLON.Vector3(-0.8, -0.5, 0.2),
                new BABYLON.Vector3(-0.4, -1.5, 0.1)
            ];
            createVessel(ladPoints, 0.06, arteryMaterial);

            // Left circumflex artery (LCX)
            const lcxPoints = [
                new BABYLON.Vector3(-0.8, 2.0, 0.5),
                new BABYLON.Vector3(-1.5, 1.8, 0.2),
                new BABYLON.Vector3(-2.0, 1.0, -0.2),
                new BABYLON.Vector3(-1.5, 0.0, -0.4)
            ];
            createVessel(lcxPoints, 0.05, arteryMaterial);

            // Right coronary artery (RCA)
            const rcaPoints = [
                new BABYLON.Vector3(0.8, 2.0, 0.5),
                new BABYLON.Vector3(1.2, 1.5, 0.4),
                new BABYLON.Vector3(1.5, 0.5, 0.0),
                new BABYLON.Vector3(1.2, -0.5, -0.2),
                new BABYLON.Vector3(0.6, -1.0, -0.3)
            ];
            createVessel(rcaPoints, 0.055, arteryMaterial);

            // Coronary vein
            const veinPoints = [
                new BABYLON.Vector3(0, -1.5, 0.3),
                new BABYLON.Vector3(-0.5, -0.5, 0.4),
                new BABYLON.Vector3(-1.0, 0.5, 0.5),
                new BABYLON.Vector3(-1.2, 1.5, 0.4),
                new BABYLON.Vector3(-0.8, 2.2, 0.3)
            ];
            createVessel(veinPoints, 0.07, veinMaterial);

            vesselGroup.parent = this.structure.surface;
            return vesselGroup;
        } catch (error) {
            console.error("Error creating coronary vessels:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createCoronaryVessels");
            return null;
        }
    }

    createMuscleFibers() {
        try {
            const fiberGroup = new BABYLON.TransformNode("muscleFibers", this.scene);
            
            // Create material using component
            const material = this.materialComponent.createMaterial("fiberMat", {
                albedoColor: new BABYLON.Color3(0.55, 0, 0),
                roughness: 0.7,
                alpha: 0.85
            });

            const createFiberLayer = (baseY, direction) => {
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = 1.5 + Math.sin(angle) * 0.2;
                    
                    // Create spiral points
                    const points = [];
                    const segments = 64;
                    for (let j = 0; j <= segments; j++) {
                        const t = j / segments;
                        const spiralAngle = direction * t * Math.PI * 2.5;
                        const x = radius * Math.cos(spiralAngle) * (1 - t * 0.3);
                        const y = baseY + t * 3;
                        const z = radius * Math.sin(spiralAngle) * (1 - t * 0.3);
                        points.push(new BABYLON.Vector3(x, y, z));
                    }

                    const fiber = BABYLON.MeshBuilder.CreateTube(`fiber_${baseY}_${i}`, {
                        path: points,
                        radius: 0.08,
                        tessellation: 8
                    }, this.scene);
                    
                    fiber.material = material;
                    fiber.parent = fiberGroup;
                }
            };

            // Create multiple layers with alternating directions
            createFiberLayer(-2.0, 1);   // Bottom layer, clockwise
            createFiberLayer(-1.5, -1);  // Middle layer, counter-clockwise
            createFiberLayer(-1.0, 1);   // Top layer, clockwise

            fiberGroup.parent = this.structure.muscles;
            return fiberGroup;
        } catch (error) {
            console.error("Error creating muscle fibers:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createMuscleFibers");
            return null;
        }
    }

    createSurfaceDetails() {
        try {
            const detailGroup = new BABYLON.TransformNode("surfaceDetails", this.scene);
            
            // Create material using component
            const material = this.materialComponent.createMaterial("grooveMat", {
                albedoColor: new BABYLON.Color3(0.55, 0, 0),
                roughness: 0.6,
                alpha: 0.7
            });
            
            // Create grooves (sulci)
            const createGroove = (points, width) => {
                const curve = BABYLON.Curve3.CreateCatmullRomSpline(points, 32);
                const groove = BABYLON.MeshBuilder.CreateTube("groove", {
                    path: curve.getPoints(),
                    radius: width,
                    tessellation: 8
                }, this.scene);

                groove.material = material;
                groove.parent = detailGroup;
                return groove;
            };

            // Anterior interventricular sulcus
            const aivPoints = [
                new BABYLON.Vector3(0, 2.0, 0.5),
                new BABYLON.Vector3(0, 0.5, 0.4),
                new BABYLON.Vector3(0, -1.0, 0.2)
            ];
            createGroove(aivPoints, 0.1);

            // Atrioventricular groove
            const avPoints = [
                new BABYLON.Vector3(-2.0, 1.5, 0),
                new BABYLON.Vector3(-1.0, 1.8, 0.2),
                new BABYLON.Vector3(0, 1.9, 0.3),
                new BABYLON.Vector3(1.0, 1.8, 0.2),
                new BABYLON.Vector3(2.0, 1.5, 0)
            ];
            createGroove(avPoints, 0.12);

            detailGroup.parent = this.structure.surface;
            return detailGroup;
        } catch (error) {
            console.error("Error creating surface details:", error);
            ErrorDecorator.logError(error, "HeartSimulation.createSurfaceDetails");
            return null;
        }
    }

    update(deltaTime) {
        try {
            if (!this.isBeating) return;

            this.time += deltaTime * this.beatSpeed;
            
            // Calculate phases
            const ventriclePhase = Math.sin(this.time * 4);
            const atrialPhase = Math.sin(this.time * 4 - Math.PI * 0.5);
            
            // Ventricle contraction
            const ventricleContract = Math.max(0, ventriclePhase);
            
            // Update chamber scales with contraction intensity
            if (this.chambers.leftVentricle) {
                const scale = 1 - ventricleContract * 0.15 * this.contractionIntensity;
                this.chambers.leftVentricle.scaling = new BABYLON.Vector3(scale, scale, scale);
            }

            if (this.chambers.rightVentricle) {
                const scale = 1 - ventricleContract * 0.12 * this.contractionIntensity;
                this.chambers.rightVentricle.scaling = new BABYLON.Vector3(scale, scale, scale);
            }

            // Atrial animation with contraction intensity
            if (this.chambers.leftAtrium) {
                const atrialScale = 1 + Math.max(0, -atrialPhase) * 0.1 * this.contractionIntensity;
                this.chambers.leftAtrium.scaling = new BABYLON.Vector3(
                    1.2 * atrialScale,
                    0.8 * atrialScale,
                    atrialScale
                );
            }

            // Heart twist animation
            const twistAngle = Math.PI * 0.15 + ventricleContract * 0.1;
            this.entityNode.rotation.z = twistAngle;
        } catch (error) {
            console.error("Error updating heart simulation:", error);
            ErrorDecorator.logError(error, "HeartSimulation.update");
        }
    }

    getMesh() {
        return this.entityNode;
    }

    setBeating(isBeating) {
        this.isBeating = isBeating;
    }

    setBeatSpeed(speed) {
        this.beatSpeed = speed;
    }

    setContractionIntensity(intensity) {
        this.contractionIntensity = Math.max(0.1, Math.min(2.0, intensity));
    }

    /**
     * Get current heart phase for beat detection
     * @returns {number} Current heart phase (-1 to 1)
     */
    getHeartPhase() {
        if (!this.isBeating) return 0;
        return Math.sin(this.time * 4);
    }

    /**
     * Get heart statistics
     * @returns {Object} Heart statistics
     */
    getHeartStats() {
        return {
            beatSpeed: this.beatSpeed,
            isBeating: this.isBeating,
            contractionIntensity: this.contractionIntensity,
            currentPhase: this.getHeartPhase(),
            time: this.time
        };
    }

    /**
     * Set heart scale (for size parameter)
     * @param {number} scale - Scale multiplier
     */
    setHeartScale(scale) {
        if (this.entityNode) {
            const clampedScale = Math.max(0.3, Math.min(2.0, scale));
            this.entityNode.scaling = new BABYLON.Vector3(clampedScale, clampedScale, clampedScale);
        }
    }

    /**
     * Get current heart scale
     * @returns {number} Current scale
     */
    getHeartScale() {
        if (this.entityNode && this.entityNode.scaling) {
            return this.entityNode.scaling.x;
        }
        return 1.0;
    }
} 