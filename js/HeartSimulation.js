export class HeartSimulation {
    constructor(scene) {
        this.scene = scene;
        this.heartGroup = new BABYLON.TransformNode("heartGroup", scene);
        this.time = 0;
        this.beatSpeed = 2;
        this.isBeating = true;
        
        this.createAnatomicalHeart();
    }

    createAnatomicalHeart() {
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
            node.parent = this.heartGroup;
        });

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
    }

    createLeftVentricle() {
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

        const material = new BABYLON.StandardMaterial("ventriclemat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.55, 0, 0);
        material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        ventricle.material = material;
        ventricle.parent = this.structure.chambers;

        return ventricle;
    }

    createRightVentricle() {
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

        const material = new BABYLON.StandardMaterial("rightventmat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.5, 0, 0);
        ventricle.material = material;
        ventricle.parent = this.structure.chambers;

        return ventricle;
    }

    createLeftAtrium() {
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

        const material = new BABYLON.StandardMaterial("leftatriummat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.6, 0.15, 0.15);
        atrium.material = material;
        atrium.parent = this.structure.chambers;
        atrium.position = new BABYLON.Vector3(-0.8, 2.2, 0);

        return atrium;
    }

    createRightAtrium() {
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

        const material = new BABYLON.StandardMaterial("rightatriummat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.58, 0.24, 0.25);
        atrium.material = material;
        atrium.parent = this.structure.chambers;
        atrium.position = new BABYLON.Vector3(0.8, 2.2, 0);

        return atrium;
    }

    createConnectingTissue() {
        const tissue = new BABYLON.TransformNode("connectingTissue", this.scene);
        
        // Create left connection
        const leftConnection = BABYLON.MeshBuilder.CreateCylinder("leftConnection", {
            height: 1.5,
            diameter: 0.8,
            tessellation: 32
        }, this.scene);
        
        const material = new BABYLON.StandardMaterial("tissuemat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.55, 0, 0);
        material.alpha = 0.7;
        material.backFaceCulling = false;
        
        leftConnection.material = material;
        leftConnection.position = new BABYLON.Vector3(-0.8, 1.5, 0);
        leftConnection.parent = tissue;

        // Create right connection
        const rightConnection = leftConnection.clone("rightConnection");
        rightConnection.position = new BABYLON.Vector3(0.8, 1.5, 0);
        rightConnection.parent = tissue;

        tissue.parent = this.structure.chambers;
        return tissue;
    }

    createMitralValve() {
        const valveGroup = new BABYLON.TransformNode("mitralValve", this.scene);
        
        const material = new BABYLON.StandardMaterial("valvemat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.94, 0.89, 0.88);
        material.alpha = 0.9;
        material.backFaceCulling = false;

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
    }

    createTricuspidValve() {
        const valveGroup = new BABYLON.TransformNode("tricuspidValve", this.scene);
        
        const material = new BABYLON.StandardMaterial("valvemat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.94, 0.89, 0.88);
        material.alpha = 0.9;
        material.backFaceCulling = false;

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
    }

    createSemilunarValves() {
        const valveGroup = new BABYLON.TransformNode("semilunarValves", this.scene);
        
        const material = new BABYLON.StandardMaterial("valvemat", this.scene);
        material.diffuseColor = new BABYLON.Color3(0.98, 0.98, 0.98);
        material.alpha = 0.85;
        material.backFaceCulling = false;

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
    }

    createCoronaryVessels() {
        const vesselGroup = new BABYLON.TransformNode("coronaryVessels", this.scene);
        
        // Helper function to create vessel curves
        const createVessel = (points, radius, color) => {
            // Create a custom curve from points
            const catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(points, 60);
            const tube = BABYLON.MeshBuilder.CreateTube("vessel", {
                path: catmullRom.getPoints(),
                radius: radius,
                tessellation: 8,
                updatable: false
            }, this.scene);

            const material = new BABYLON.StandardMaterial("vesselMat", this.scene);
            material.diffuseColor = new BABYLON.Color3(...color);
            material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
        createVessel(ladPoints, 0.06, [0.8, 0, 0]);

        // Left circumflex artery (LCX)
        const lcxPoints = [
            new BABYLON.Vector3(-0.8, 2.0, 0.5),
            new BABYLON.Vector3(-1.5, 1.8, 0.2),
            new BABYLON.Vector3(-2.0, 1.0, -0.2),
            new BABYLON.Vector3(-1.5, 0.0, -0.4)
        ];
        createVessel(lcxPoints, 0.05, [0.8, 0, 0]);

        // Right coronary artery (RCA)
        const rcaPoints = [
            new BABYLON.Vector3(0.8, 2.0, 0.5),
            new BABYLON.Vector3(1.2, 1.5, 0.4),
            new BABYLON.Vector3(1.5, 0.5, 0.0),
            new BABYLON.Vector3(1.2, -0.5, -0.2),
            new BABYLON.Vector3(0.6, -1.0, -0.3)
        ];
        createVessel(rcaPoints, 0.055, [0.8, 0, 0]);

        // Coronary vein
        const veinPoints = [
            new BABYLON.Vector3(0, -1.5, 0.3),
            new BABYLON.Vector3(-0.5, -0.5, 0.4),
            new BABYLON.Vector3(-1.0, 0.5, 0.5),
            new BABYLON.Vector3(-1.2, 1.5, 0.4),
            new BABYLON.Vector3(-0.8, 2.2, 0.3)
        ];
        createVessel(veinPoints, 0.07, [0, 0, 0.5]);

        vesselGroup.parent = this.structure.surface;
        return vesselGroup;
    }

    createMuscleFibers() {
        const fiberGroup = new BABYLON.TransformNode("muscleFibers", this.scene);
        
        const createFiberLayer = (baseY, direction) => {
            const material = new BABYLON.StandardMaterial("fiberMat", this.scene);
            material.diffuseColor = new BABYLON.Color3(0.55, 0, 0);
            material.alpha = 0.85;
            material.backFaceCulling = false;

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

                const fiber = BABYLON.MeshBuilder.CreateTube("fiber", {
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
    }

    createSurfaceDetails() {
        const detailGroup = new BABYLON.TransformNode("surfaceDetails", this.scene);
        
        // Create grooves (sulci)
        const createGroove = (points, width) => {
            const curve = BABYLON.Curve3.CreateCatmullRomSpline(points, 32);
            const groove = BABYLON.MeshBuilder.CreateTube("groove", {
                path: curve.getPoints(),
                radius: width,
                tessellation: 8
            }, this.scene);

            const material = new BABYLON.StandardMaterial("grooveMat", this.scene);
            material.diffuseColor = new BABYLON.Color3(0.55, 0, 0);
            material.alpha = 0.7;
            material.backFaceCulling = false;
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
    }

    update(deltaTime) {
        if (!this.isBeating) return;

        this.time += deltaTime * this.beatSpeed;
        
        // Calculate phases
        const ventriclePhase = Math.sin(this.time * 4);
        const atrialPhase = Math.sin(this.time * 4 - Math.PI * 0.5);
        
        // Ventricle contraction
        const ventricleContract = Math.max(0, ventriclePhase);
        
        // Update chamber scales
        if (this.chambers.leftVentricle) {
            const scale = 1 - ventricleContract * 0.15;
            this.chambers.leftVentricle.scaling = new BABYLON.Vector3(scale, scale, scale);
        }

        if (this.chambers.rightVentricle) {
            const scale = 1 - ventricleContract * 0.12;
            this.chambers.rightVentricle.scaling = new BABYLON.Vector3(scale, scale, scale);
        }

        // Atrial animation
        if (this.chambers.leftAtrium) {
            const atrialScale = 1 + Math.max(0, -atrialPhase) * 0.1;
            this.chambers.leftAtrium.scaling = new BABYLON.Vector3(
                1.2 * atrialScale,
                0.8 * atrialScale,
                atrialScale
            );
        }

        // Heart twist animation
        const twistAngle = Math.PI * 0.15 + ventricleContract * 0.1;
        this.heartGroup.rotation.z = twistAngle;
    }

    getMesh() {
        return this.heartGroup;
    }

    setBeating(isBeating) {
        this.isBeating = isBeating;
    }

    setBeatSpeed(speed) {
        this.beatSpeed = speed;
    }

    dispose() {
        this.heartGroup.getChildMeshes().forEach(mesh => {
            mesh.dispose();
        });
        this.heartGroup.dispose();
    }
} 