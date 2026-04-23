import { Scene, TransformNode, MeshBuilder, Vector3, Mesh, VertexBuffer, Color3, Curve3 } from '@babylonjs/core';
import { EntityBase, Component } from './core/EntityBase';
import { MaterialComponent } from './components/MaterialComponent';
import { AnimationComponent } from './components/AnimationComponent';
import { ErrorDecorator } from './core/ErrorDecorator';

export interface HeartChambers {
    leftVentricle?: Mesh | null;
    rightVentricle?: Mesh | null;
    leftAtrium?: Mesh | null;
    rightAtrium?: Mesh | null;
    connectingTissue?: TransformNode | null;
}

export interface HeartValves {
    mitral?: TransformNode | null;
    tricuspid?: TransformNode | null;
    semilunar?: TransformNode | null;
}

export interface HeartSurface {
    coronaryVessels?: TransformNode | null;
    muscleFibers?: TransformNode | null;
    details?: TransformNode | null;
}

export interface HeartStructure {
    core: TransformNode;
    chambers: TransformNode;
    vessels: TransformNode;
    valves: TransformNode;
    muscles: TransformNode;
    surface: TransformNode;
}

export class HeartSimulation extends EntityBase {
    materialComponent: MaterialComponent;
    animationComponent: AnimationComponent;
    time: number;
    beatSpeed: number;
    isBeating: boolean;
    contractionIntensity: number;
    structure: HeartStructure;
    chambers: HeartChambers;
    valves: HeartValves;
    surface: HeartSurface;

    constructor(scene: Scene) {
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
        this.structure = {} as HeartStructure;
        this.chambers = {};
        this.valves = {};
        this.surface = {};

        this.init();
    }

    init(): void {
        try {
            this.createHeartStructure();
            this.createAnatomicalHeart();
        } catch (error) {
            console.error("Error initializing HeartSimulation:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.init");
        }
    }

    createHeartStructure(): void {
        try {
            // Create main structural groups
            this.structure = {
                core: new TransformNode("core", this.scene),
                chambers: new TransformNode("chambers", this.scene),
                vessels: new TransformNode("vessels", this.scene),
                valves: new TransformNode("valves", this.scene),
                muscles: new TransformNode("muscles", this.scene),
                surface: new TransformNode("surface", this.scene)
            };

            // Parent all groups to the heart group
            Object.values(this.structure).forEach(node => {
                node.parent = this.entityNode;
            });
        } catch (error) {
            console.error("Error creating heart structure:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createHeartStructure");
        }
    }

    createAnatomicalHeart(): void {
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
            ErrorDecorator.logError(error as Error, "HeartSimulation.createAnatomicalHeart");
        }
    }

    createLeftVentricle(): Mesh | null {
        try {
            const points: Vector3[] = [];
            const resolution = 20;

            // Create heart shape curve points
            for (let i = 0; i <= resolution; i++) {
                const t = i / resolution;
                const x = -1.5 * Math.sin(t * Math.PI);
                const y = -2.5 + 3.5 * t;
                points.push(new Vector3(x, y, 0));
            }

            // Create custom shape
            const ventricle = MeshBuilder.CreateLathe("leftVentricle", {
                shape: points,
                radius: 1,
                tessellation: 32,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("ventriclemat", {
                albedoColor: new Color3(0.55, 0, 0),
                roughness: 0.7,
                metallic: 0.1
            });

            ventricle.material = material;
            ventricle.parent = this.structure.chambers;

            return ventricle;
        } catch (error) {
            console.error("Error creating left ventricle:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createLeftVentricle");
            return null;
        }
    }

    createRightVentricle(): Mesh | null {
        try {
            const points: Vector3[] = [];
            const resolution = 20;

            // Create slightly different shape for right ventricle
            for (let i = 0; i <= resolution; i++) {
                const t = i / resolution;
                const x = 1.2 * Math.sin(t * Math.PI);
                const y = -2.0 + 3.0 * t;
                points.push(new Vector3(x, y, 0));
            }

            const ventricle = MeshBuilder.CreateLathe("rightVentricle", {
                shape: points,
                radius: 0.8,
                tessellation: 32,
                sideOrientation: Mesh.DOUBLESIDE
            }, this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("rightventmat", {
                albedoColor: new Color3(0.5, 0, 0),
                roughness: 0.75,
                metallic: 0.1
            });

            ventricle.material = material;
            ventricle.parent = this.structure.chambers;

            return ventricle;
        } catch (error) {
            console.error("Error creating right ventricle:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createRightVentricle");
            return null;
        }
    }

    private deformAtrium(atrium: Mesh, stretchFactor: number): void {
        const positions = atrium.getVerticesData(VertexBuffer.PositionKind);
        if (positions) {
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                if (y < 0) {
                    positions[i + 1] = y * stretchFactor;
                }
            }
            atrium.updateVerticesData(VertexBuffer.PositionKind, positions);
        }
    }

    createLeftAtrium(): Mesh | null {
        try {
            const atrium = MeshBuilder.CreateSphere("leftAtrium", {
                segments: 32,
                diameter: 2
            }, this.scene);

            this.deformAtrium(atrium, 1.2);

            const material = this.materialComponent.createMaterial("leftatriummat", {
                albedoColor: new Color3(0.6, 0.15, 0.15),
                roughness: 0.65,
                metallic: 0.1
            });

            atrium.material = material;
            atrium.parent = this.structure.chambers;
            atrium.position = new Vector3(-0.8, 2.2, 0);

            return atrium;
        } catch (error) {
            console.error("Error creating left atrium:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createLeftAtrium");
            return null;
        }
    }

    createRightAtrium(): Mesh | null {
        try {
            const atrium = MeshBuilder.CreateSphere("rightAtrium", {
                segments: 32,
                diameter: 2.2
            }, this.scene);

            this.deformAtrium(atrium, 1.3);

            const material = this.materialComponent.createMaterial("rightatriummat", {
                albedoColor: new Color3(0.58, 0.24, 0.25),
                roughness: 0.7,
                metallic: 0.1
            });

            atrium.material = material;
            atrium.parent = this.structure.chambers;
            atrium.position = new Vector3(0.8, 2.2, 0);

            return atrium;
        } catch (error) {
            console.error("Error creating right atrium:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createRightAtrium");
            return null;
        }
    }

    createConnectingTissue(): TransformNode | null {
        try {
            const tissue = new TransformNode("connectingTissue", this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("tissuemat", {
                albedoColor: new Color3(0.55, 0, 0),
                roughness: 0.6,
                alpha: 0.7
            });

            // Create left connection
            const leftConnection = MeshBuilder.CreateCylinder("leftConnection", {
                height: 1.5,
                diameter: 0.8,
                tessellation: 32
            }, this.scene);

            leftConnection.material = material;
            leftConnection.position = new Vector3(-0.8, 1.5, 0);
            leftConnection.parent = tissue;

            // Create right connection
            const rightConnection = leftConnection.clone("rightConnection");
            rightConnection.position = new Vector3(0.8, 1.5, 0);
            rightConnection.parent = tissue;

            tissue.parent = this.structure.chambers;
            return tissue;
        } catch (error) {
            console.error("Error creating connecting tissue:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createConnectingTissue");
            return null;
        }
    }

    createMitralValve(): TransformNode | null {
        try {
            const valveGroup = new TransformNode("mitralValve", this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("valvemat", {
                albedoColor: new Color3(0.94, 0.89, 0.88),
                roughness: 0.4,
                alpha: 0.9
            });

            // Create anterior leaflet
            const anteriorLeaflet = MeshBuilder.CreateDisc("anteriorLeaflet", {
                radius: 0.8,
                arc: 0.5,
                tessellation: 32
            }, this.scene);
            anteriorLeaflet.material = material;
            anteriorLeaflet.position = new Vector3(-1, 1.5, 0);
            anteriorLeaflet.rotation.z = Math.PI;
            anteriorLeaflet.parent = valveGroup;

            // Create posterior leaflet
            const posteriorLeaflet = MeshBuilder.CreateDisc("posteriorLeaflet", {
                radius: 0.6,
                arc: 0.5,
                tessellation: 32
            }, this.scene);
            posteriorLeaflet.material = material;
            posteriorLeaflet.position = new Vector3(-1.2, 1.3, 0.2);
            posteriorLeaflet.rotation.z = Math.PI * 1.1;
            posteriorLeaflet.parent = valveGroup;

            valveGroup.parent = this.structure.valves;
            return valveGroup;
        } catch (error) {
            console.error("Error creating mitral valve:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createMitralValve");
            return null;
        }
    }

    createTricuspidValve(): TransformNode | null {
        try {
            const valveGroup = new TransformNode("tricuspidValve", this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("tricuspidvalvemat", {
                albedoColor: new Color3(0.94, 0.89, 0.88),
                roughness: 0.4,
                alpha: 0.9
            });

            // Create three leaflets
            for (let i = 0; i < 3; i++) {
                const leaflet = MeshBuilder.CreateDisc("tricuspidLeaflet" + i, {
                    radius: 0.7,
                    arc: 0.4,
                    tessellation: 32
                }, this.scene);
                leaflet.material = material;
                leaflet.position = new Vector3(1, 1.3, 0);
                leaflet.rotation = new Vector3(
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
            ErrorDecorator.logError(error as Error, "HeartSimulation.createTricuspidValve");
            return null;
        }
    }

    createSemilunarValves(): TransformNode | null {
        try {
            const valveGroup = new TransformNode("semilunarValves", this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("semilunarvalvemat", {
                albedoColor: new Color3(0.98, 0.98, 0.98),
                roughness: 0.3,
                alpha: 0.85
            });

            const createValveCusps = (position: Vector3, rotation: Vector3) => {
                const cuspGroup = new TransformNode("cuspGroup", this.scene);
                cuspGroup.position = position;
                cuspGroup.rotation = rotation;
                cuspGroup.parent = valveGroup;

                for (let i = 0; i < 3; i++) {
                    const cusp = MeshBuilder.CreateTorus("cusp" + i, {
                        diameter: 0.8,
                        thickness: 0.2,
                        tessellation: 32,
                        arc: 0.5
                    } as { diameter?: number; thickness?: number; tessellation?: number; arc?: number }, this.scene);
                    cusp.material = material;
                    cusp.rotation.z = (i * Math.PI * 2) / 3;
                    cusp.parent = cuspGroup;
                }
                return cuspGroup;
            };

            // Create aortic and pulmonary valves
            createValveCusps(
                new Vector3(-1, 2.5, 0),
                new Vector3(Math.PI / 2, 0, 0)
            );
            createValveCusps(
                new Vector3(1, 2.5, 0),
                new Vector3(Math.PI / 2, 0, Math.PI / 6)
            );

            return valveGroup;
        } catch (error) {
            console.error("Error creating semilunar valves:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createSemilunarValves");
            return null;
        }
    }

    createCoronaryVessels(): TransformNode | null {
        try {
            const vesselGroup = new TransformNode("coronaryVessels", this.scene);

            // Create artery material
            const arteryMaterial = this.materialComponent.createMaterial("arteryMat", {
                albedoColor: new Color3(0.8, 0, 0),
                roughness: 0.5,
                metallic: 0.2
            });

            // Create vein material
            const veinMaterial = this.materialComponent.createMaterial("veinMat", {
                albedoColor: new Color3(0, 0, 0.5),
                roughness: 0.6,
                metallic: 0.1
            });

            // Helper function to create vessel curves
            const createVessel = (points: Vector3[], radius: number, material: import('@babylonjs/core').Material | null) => {
                // Create a custom curve from points
                const catmullRom = Curve3.CreateCatmullRomSpline(points, 60);
                const tube = MeshBuilder.CreateTube("vessel", {
                    path: catmullRom.getPoints(),
                    radius: radius,
                    tessellation: 12,
                    updatable: false
                }, this.scene);

                tube.material = material;
                tube.parent = vesselGroup;
                return tube;
            };

            // Left anterior descending artery (LAD)
            const ladPoints = [
                new Vector3(-0.8, 2.0, 0.5),
                new Vector3(-1.0, 1.5, 0.6),
                new Vector3(-1.2, 0.5, 0.4),
                new Vector3(-0.8, -0.5, 0.2),
                new Vector3(-0.4, -1.5, 0.1)
            ];
            createVessel(ladPoints, 0.06, arteryMaterial);

            // Left circumflex artery (LCX)
            const lcxPoints = [
                new Vector3(-0.8, 2.0, 0.5),
                new Vector3(-1.5, 1.8, 0.2),
                new Vector3(-2.0, 1.0, -0.2),
                new Vector3(-1.5, 0.0, -0.4)
            ];
            createVessel(lcxPoints, 0.05, arteryMaterial);

            // Right coronary artery (RCA)
            const rcaPoints = [
                new Vector3(0.8, 2.0, 0.5),
                new Vector3(1.2, 1.5, 0.4),
                new Vector3(1.5, 0.5, 0.0),
                new Vector3(1.2, -0.5, -0.2),
                new Vector3(0.6, -1.0, -0.3)
            ];
            createVessel(rcaPoints, 0.055, arteryMaterial);

            // Coronary vein
            const veinPoints = [
                new Vector3(0, -1.5, 0.3),
                new Vector3(-0.5, -0.5, 0.4),
                new Vector3(-1.0, 0.5, 0.5),
                new Vector3(-1.2, 1.5, 0.4),
                new Vector3(-0.8, 2.2, 0.3)
            ];
            createVessel(veinPoints, 0.07, veinMaterial);

            vesselGroup.parent = this.structure.surface;
            return vesselGroup;
        } catch (error) {
            console.error("Error creating coronary vessels:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createCoronaryVessels");
            return null;
        }
    }

    createMuscleFibers(): TransformNode | null {
        try {
            const fiberGroup = new TransformNode("muscleFibers", this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("fiberMat", {
                albedoColor: new Color3(0.55, 0, 0),
                roughness: 0.7,
                alpha: 0.85
            });

            const createFiberLayer = (baseY: number, direction: number) => {
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = 1.5 + Math.sin(angle) * 0.2;

                    // Create spiral points
                    const points: Vector3[] = [];
                    const segments = 64;
                    for (let j = 0; j <= segments; j++) {
                        const t = j / segments;
                        const spiralAngle = direction * t * Math.PI * 2.5;
                        const x = radius * Math.cos(spiralAngle) * (1 - t * 0.3);
                        const y = baseY + t * 3;
                        const z = radius * Math.sin(spiralAngle) * (1 - t * 0.3);
                        points.push(new Vector3(x, y, z));
                    }

                    const fiber = MeshBuilder.CreateTube(`fiber_${baseY}_${i}`, {
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
            ErrorDecorator.logError(error as Error, "HeartSimulation.createMuscleFibers");
            return null;
        }
    }

    createSurfaceDetails(): TransformNode | null {
        try {
            const detailGroup = new TransformNode("surfaceDetails", this.scene);

            // Create material using component
            const material = this.materialComponent.createMaterial("grooveMat", {
                albedoColor: new Color3(0.55, 0, 0),
                roughness: 0.6,
                alpha: 0.7
            });

            // Create grooves (sulci)
            const createGroove = (points: Vector3[], width: number) => {
                const curve = Curve3.CreateCatmullRomSpline(points, 32);
                const groove = MeshBuilder.CreateTube("groove", {
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
                new Vector3(0, 2.0, 0.5),
                new Vector3(0, 0.5, 0.4),
                new Vector3(0, -1.0, 0.2)
            ];
            createGroove(aivPoints, 0.1);

            // Atrioventricular groove
            const avPoints = [
                new Vector3(-2.0, 1.5, 0),
                new Vector3(-1.0, 1.8, 0.2),
                new Vector3(0, 1.9, 0.3),
                new Vector3(1.0, 1.8, 0.2),
                new Vector3(2.0, 1.5, 0)
            ];
            createGroove(avPoints, 0.12);

            detailGroup.parent = this.structure.surface;
            return detailGroup;
        } catch (error) {
            console.error("Error creating surface details:", error);
            ErrorDecorator.logError(error as Error, "HeartSimulation.createSurfaceDetails");
            return null;
        }
    }

    update(deltaTime: number): void {
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
                this.chambers.leftVentricle.scaling = new Vector3(scale, scale, scale);
            }

            if (this.chambers.rightVentricle) {
                const scale = 1 - ventricleContract * 0.12 * this.contractionIntensity;
                this.chambers.rightVentricle.scaling = new Vector3(scale, scale, scale);
            }

            // Atrial animation with contraction intensity
            if (this.chambers.leftAtrium) {
                const atrialScale = 1 + Math.max(0, -atrialPhase) * 0.1 * this.contractionIntensity;
                this.chambers.leftAtrium.scaling = new Vector3(
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
            ErrorDecorator.logError(error as Error, "HeartSimulation.update");
        }
    }

    getMesh(): TransformNode {
        return this.entityNode;
    }

    setBeating(isBeating: boolean): void {
        this.isBeating = isBeating;
    }

    setBeatSpeed(speed: number): void {
        this.beatSpeed = speed;
    }

    setContractionIntensity(intensity: number): void {
        this.contractionIntensity = Math.max(0.1, Math.min(2.0, intensity));
    }

    /**
     * Get current heart phase for beat detection
     * @returns Current heart phase (-1 to 1)
     */
    getHeartPhase(): number {
        if (!this.isBeating) return 0;
        return Math.sin(this.time * 4);
    }

    /**
     * Get heart statistics
     * @returns Heart statistics
     */
    getHeartStats(): {
        beatSpeed: number;
        isBeating: boolean;
        contractionIntensity: number;
        currentPhase: number;
        time: number;
    } {
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
     * @param scale - Scale multiplier
     */
    setHeartScale(scale: number): void {
        if (this.entityNode) {
            const clampedScale = Math.max(0.3, Math.min(2.0, scale));
            this.entityNode.scaling = new Vector3(clampedScale, clampedScale, clampedScale);
        }
    }

    /**
     * Get current heart scale
     * @returns Current scale
     */
    getHeartScale(): number {
        if (this.entityNode && this.entityNode.scaling) {
            return this.entityNode.scaling.x;
        }
        return 1.0;
    }
}
