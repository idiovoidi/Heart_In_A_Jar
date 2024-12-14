import * as THREE from 'three';

export class HeartSimulation {
    constructor() {
        this.heartGroup = new THREE.Group();
        this.time = 0;
        this.beatSpeed = 2;
        this.isBeating = true;
        this.baseScale = 0.15;
        this.initialRotation = Math.PI;
        
        console.log('Initializing heart simulation...');
        this.createAnatomicalHeart();
        
        this.heartGroup.scale.set(this.baseScale, this.baseScale, this.baseScale);
        this.heartGroup.rotation.z = this.initialRotation;
        this.heartGroup.position.set(0, 0, 0);
    }

    createAnatomicalHeart() {
        try {
            console.log('Creating chambers...');
            this.chambers = {
                leftVentricle: this.createLeftVentricle(),
                rightVentricle: this.createRightVentricle(),
                leftAtrium: this.createLeftAtrium(),
                rightAtrium: this.createRightAtrium(),
                connectingTissue: this.createConnectingTissue()
            };

            console.log('Creating valves...');
            this.valves = {
                mitral: this.createMitralValve(),
                tricuspid: this.createTricuspidValve(),
                semilunar: this.createSemilunarValves()
            };

            // Add all parts to the heart group
            console.log('Adding chambers to heart group...');
            Object.values(this.chambers).forEach(chamber => {
                if (chamber) this.heartGroup.add(chamber);
            });
            
            console.log('Adding valves to heart group...');
            Object.values(this.valves).forEach(valve => {
                if (valve) this.heartGroup.add(valve);
            });

            // Adjust initial position and rotation
            this.heartGroup.rotation.x = Math.PI * 0.15;
            this.heartGroup.rotation.y = Math.PI * 0.1;
            this.heartGroup.position.y = -0.35;
            
            console.log('Heart creation complete');
        } catch (error) {
            console.error('Error in createAnatomicalHeart:', error);
            this.createSimpleHeart();
        }
    }

    createLeftVentricle() {
        // Create the main pumping chamber with smoother transitions
        const shape = new THREE.Shape();
        shape.moveTo(0, -2.5);
        
        // More rounded bottom curve
        shape.bezierCurveTo(
            -1.5, -2.5,  // cp1
            -4.0, -1.0,  // cp2 - adjusted for smoother curve
            -3.5, 1.5    // end point - connects better with atrium
        );
        
        // Connection to left atrium
        shape.bezierCurveTo(
            -3.0, 2.5,   // cp1
            -2.0, 3.0,   // cp2
            -1.0, 3.0    // end point - overlaps with atrium
        );
        
        // Return curve
        shape.bezierCurveTo(
            -1.0, 1.0,   // cp1
            -0.5, -1.0,  // cp2
            0, -2.5      // back to start
        );

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 3,
            bevelEnabled: true,
            bevelThickness: 0.8,
            bevelSize: 0.6,
            bevelSegments: 64,
            curveSegments: 64
        });

        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x8B0000,
            shininess: 30,
            side: THREE.DoubleSide
        }));
        mesh.position.set(-0.8, 0, 0);  // Adjusted position for better overlap
        return mesh;
    }

    createRightVentricle() {
        // Create connecting geometry to left ventricle
        const shape = new THREE.Shape();
        shape.moveTo(-0.5, -2.0);  // Start closer to left ventricle
        
        // Outer curve
        shape.bezierCurveTo(
            1.5, -2.0,   // cp1
            3.0, -0.5,   // cp2
            2.5, 1.5     // end point
        );
        
        // Connection to right atrium
        shape.bezierCurveTo(
            2.0, 2.5,    // cp1
            1.5, 3.0,    // cp2
            0.5, 3.0     // end point - overlaps with atrium
        );
        
        // Inner curve (connects to left ventricle)
        shape.bezierCurveTo(
            0.0, 2.0,    // cp1
            -0.5, 0.0,   // cp2
            -0.5, -2.0   // back to start
        );

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 2.8,  // Slightly less deep than left ventricle
            bevelEnabled: true,
            bevelThickness: 0.7,
            bevelSize: 0.5,
            bevelSegments: 64,
            curveSegments: 64
        });

        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x800000,
            shininess: 30,
            side: THREE.DoubleSide
        }));
        mesh.position.set(0.8, 0, -0.1);  // Slightly offset for overlap
        return mesh;
    }

    createLeftAtrium() {
        // Create more organic atrium shape
        const geometry = new THREE.SphereGeometry(1.0, 32, 32);
        geometry.scale(1.2, 0.8, 1.0);
        
        // Add deformation to connect with ventricle
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            if (y < 0) {
                positions.setY(i, y * 1.2);  // Stretch bottom to connect
            }
        }
        
        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x9B2D30,
            shininess: 30,
            side: THREE.DoubleSide
        }));
        mesh.position.set(-0.8, 2.2, 0);
        return mesh;
    }

    createRightAtrium() {
        // Create more organic atrium shape
        const geometry = new THREE.SphereGeometry(1.1, 32, 32);
        geometry.scale(1.3, 0.9, 1.1);
        
        // Add deformation to connect with ventricle
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            if (y < 0) {
                positions.setY(i, y * 1.3);  // Stretch bottom to connect
            }
        }
        
        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: 0x943E3F,
            shininess: 30,
            side: THREE.DoubleSide
        }));
        mesh.position.set(0.8, 2.2, 0);
        return mesh;
    }

    createMitralValve() {
        // Create mitral valve (between left atrium and ventricle)
        const valveGroup = new THREE.Group();
        
        // Create two leaflets
        const leafletGeometry = new THREE.CircleGeometry(0.8, 32, 0, Math.PI);
        const leafletMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFE4E1,  // Pale pink
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        // Anterior leaflet (larger)
        const anteriorLeaflet = new THREE.Mesh(leafletGeometry, leafletMaterial);
        anteriorLeaflet.position.set(-1, 1.5, 0);
        anteriorLeaflet.rotation.z = Math.PI;
        
        // Posterior leaflet (smaller)
        const posteriorLeaflet = new THREE.Mesh(
            new THREE.CircleGeometry(0.6, 32, 0, Math.PI),
            leafletMaterial
        );
        posteriorLeaflet.position.set(-1.2, 1.3, 0.2);
        posteriorLeaflet.rotation.z = Math.PI * 1.1;

        valveGroup.add(anteriorLeaflet, posteriorLeaflet);
        return valveGroup;
    }

    createTricuspidValve() {
        // Create tricuspid valve (between right atrium and ventricle)
        const valveGroup = new THREE.Group();
        
        // Create three leaflets
        const leafletMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFE4E1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        // Create three overlapping leaflets
        for (let i = 0; i < 3; i++) {
            const leaflet = new THREE.Mesh(
                new THREE.CircleGeometry(0.7, 32, 0, Math.PI * 0.8),
                leafletMaterial
            );
            leaflet.position.set(1, 1.3, 0);
            leaflet.rotation.z = Math.PI + (i * Math.PI / 3);
            leaflet.rotation.y = i * Math.PI / 6;
            valveGroup.add(leaflet);
        }

        return valveGroup;
    }

    createSemilunarValves() {
        // Create aortic and pulmonary valves
        const valveGroup = new THREE.Group();
        
        // Create cusps for both valves
        const createValveCusps = (position, rotation) => {
            const cuspGroup = new THREE.Group();
            const cuspMaterial = new THREE.MeshPhongMaterial({
                color: 0xFFFAFA,  // Snow white
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85
            });

            // Create three curved cusps
            for (let i = 0; i < 3; i++) {
                const cusp = new THREE.Mesh(
                    new THREE.TorusGeometry(0.4, 0.1, 16, 32, Math.PI),
                    cuspMaterial
                );
                cusp.rotation.z = (i * Math.PI * 2) / 3;
                cusp.position.copy(position);
                cusp.rotation.x = rotation.x;
                cusp.rotation.y = rotation.y;
                cusp.rotation.z += rotation.z;
                cuspGroup.add(cusp);
            }
            return cuspGroup;
        };

        // Add aortic valve
        const aorticValve = createValveCusps(
            new THREE.Vector3(-1, 2.5, 0),
            new THREE.Vector3(Math.PI / 2, 0, 0)
        );
        
        // Add pulmonary valve
        const pulmonaryValve = createValveCusps(
            new THREE.Vector3(1, 2.5, 0),
            new THREE.Vector3(Math.PI / 2, 0, Math.PI / 6)
        );

        valveGroup.add(aorticValve, pulmonaryValve);
        return valveGroup;
    }

    update(deltaTime) {
        if (!this.isBeating) return;

        this.time += deltaTime * this.beatSpeed;
        
        // Calculate phases for different chambers
        const ventriclePhase = Math.sin(this.time * 4);
        const atrialPhase = Math.sin(this.time * 4 - Math.PI * 0.5);
        
        // Ventricle contraction
        const ventricleContract = Math.max(0, ventriclePhase);
        const ventricleExpand = Math.max(0, -ventriclePhase);
        
        // Atrial contraction (slightly delayed)
        const atrialContract = Math.max(0, atrialPhase);
        const atrialExpand = Math.max(0, -atrialPhase);

        // Animate left ventricle
        if (this.chambers.leftVentricle) {
            this.chambers.leftVentricle.scale.set(
                1 - ventricleContract * 0.15,
                1 - ventricleContract * 0.2,
                1 - ventricleContract * 0.15
            );
        }

        // Animate right ventricle
        if (this.chambers.rightVentricle) {
            this.chambers.rightVentricle.scale.set(
                1 - ventricleContract * 0.12,
                1 - ventricleContract * 0.15,
                1 - ventricleContract * 0.12
            );
        }

        // Animate atria
        if (this.chambers.leftAtrium) {
            this.chambers.leftAtrium.scale.set(
                1.2 * (1 + atrialExpand * 0.1),
                0.8 * (1 + atrialExpand * 0.15),
                1 * (1 + atrialExpand * 0.1)
            );
        }

        if (this.chambers.rightAtrium) {
            this.chambers.rightAtrium.scale.set(
                1.4 * (1 + atrialExpand * 0.1),
                0.9 * (1 + atrialExpand * 0.15),
                1.1 * (1 + atrialExpand * 0.1)
            );
        }

        // Add slight twisting motion
        const twistAngle = this.initialRotation + ventricleContract * 0.1;
        this.heartGroup.rotation.z = twistAngle;

        // Valve animations
        if (this.valves) {
            // Mitral and tricuspid valves open during atrial contraction
            const atrioventricularOpen = (1 - Math.cos(this.time * 4)) / 2;
            
            if (this.valves.mitral) {
                this.valves.mitral.children.forEach(leaflet => {
                    leaflet.rotation.x = atrioventricularOpen * Math.PI / 3;
                });
            }
            
            if (this.valves.tricuspid) {
                this.valves.tricuspid.children.forEach(leaflet => {
                    leaflet.rotation.x = atrioventricularOpen * Math.PI / 3;
                });
            }

            // Semilunar valves open during ventricular contraction
            if (this.valves.semilunar) {
                const semilunarOpen = ventricleContract * Math.PI / 2;
                this.valves.semilunar.children.forEach(valveGroup => {
                    valveGroup.children.forEach(cusp => {
                        cusp.scale.y = 1 - ventricleContract * 0.5;
                    });
                });
            }
        }
    }

    createSimpleHeart() {
        console.log('Creating simple fallback heart...');
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide
        });
        const heart = new THREE.Mesh(geometry, material);
        this.heartGroup.add(heart);
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
        this.heartGroup.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                child.material.dispose();
            }
        });

        while(this.heartGroup.children.length > 0) {
            this.heartGroup.remove(this.heartGroup.children[0]);
        }

        this.isBeating = false;
        this.time = 0;
    }

    createConnectingTissue() {
        const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32, 1, true);
        const material = new THREE.MeshPhongMaterial({
            color: 0x8B0000,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        // Create connecting tissue between chambers
        const connections = new THREE.Group();
        
        // Left connection
        const leftConnection = new THREE.Mesh(geometry, material);
        leftConnection.position.set(-0.8, 1.5, 0);
        leftConnection.scale.set(0.8, 1, 0.8);
        
        // Right connection
        const rightConnection = new THREE.Mesh(geometry, material);
        rightConnection.position.set(0.8, 1.5, 0);
        rightConnection.scale.set(0.8, 1, 0.8);
        
        connections.add(leftConnection, rightConnection);
        return connections;
    }
} 