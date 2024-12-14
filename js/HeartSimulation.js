import * as THREE from 'three';

export class HeartSimulation {
    constructor() {
        this.heartGroup = new THREE.Group();
        this.time = 0;
        this.beatSpeed = 2;
        this.isBeating = true;
        this.createAnatomicalHeart();
        this.heartGroup.scale.set(0.1, 0.1, 0.1);
        this.heartGroup.rotation.z = Math.PI;
        this.heartGroup.position.set(0, 0, 0);
    }

    createAnatomicalHeart() {
        const heartShape = new THREE.Shape();
        
        heartShape.moveTo(0, -2);
        
        heartShape.bezierCurveTo(
            -3, -2,     // cp1 - wider curve
            -4, -0.5,   // cp2 - higher control point
            -2.5, 1.5   // end point - smoother transition
        );
        
        heartShape.bezierCurveTo(
            -2, 3,      // cp1 - higher curve
            -1, 3.5,    // cp2 - rounder peak
            0, 2.8      // end point - higher center
        );
        
        heartShape.bezierCurveTo(
            1, 3.5,     // cp1
            2, 3,       // cp2
            2.5, 1.5    // end point
        );
        
        heartShape.bezierCurveTo(
            4, -0.5,    // cp1
            3, -2,      // cp2
            0, -2       // back to start
        );

        const extrudeSettings = {
            depth: 3,               // Increased depth for more volume
            bevelEnabled: true,
            bevelThickness: 1.2,    // Increased thickness
            bevelSize: 0.8,         // Increased bevel size
            bevelSegments: 64,      // More segments for smoother edges
            curveSegments: 96       // More segments for smoother curves
        };

        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        
        const heartMaterial = new THREE.MeshPhongMaterial({
            color: 0xff2222,
            specular: 0x444444,
            shininess: 30,
            flatShading: false,
            side: THREE.DoubleSide,
            depthWrite: false,     // Disable depth writing
            depthTest: false       // Disable depth testing
        });

        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        
        heart.geometry.center();
        
        heart.rotation.x = Math.PI * 0.2;
        heart.rotation.y = Math.PI * 0.15;
        
        this.heartGroup.add(heart);
    }

    createChamber(radius, height, segments, color) {
        const geometry = new THREE.LatheGeometry(
            this.generateChamberPoints(radius, height),
            segments
        );

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(color) },
                uPulseIntensity: { value: 0.1 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPulseIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vNormal = normal;
                    vPosition = position;
                    
                    // Add anatomical beating animation
                    float pulse = sin(uTime * 2.0) * uPulseIntensity;
                    // Add more complex deformation for muscle contraction
                    float yPulse = sin(position.y * 4.0 + uTime * 3.0) * 0.05;
                    vec3 pos = position * (1.0 + pulse + yPulse);
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uTime;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    // Muscle tissue effect
                    float tissue = sin(vPosition.x * 20.0) * sin(vPosition.y * 20.0) * 0.5 + 0.5;
                    
                    // Pulsing blood flow effect
                    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
                    vec3 color = mix(uColor * 0.8, uColor * 1.2, pulse);
                    
                    // Add tissue detail
                    color = mix(color, color * 0.8, tissue);
                    
                    // Add depth and tissue shading
                    vec3 viewDirection = normalize(-vPosition);
                    float fresnel = pow(1.0 - max(0.0, dot(viewDirection, vNormal)), 2.0);
                    color += vec3(0.2, 0.0, 0.0) * fresnel;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        return new THREE.Mesh(geometry, material);
    }

    generateChamberPoints(radius, height) {
        const points = [];
        const segments = 20;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            // Create anatomically-inspired chamber shape
            const r = radius * (1 - Math.pow(t - 0.5, 2));
            const y = height * t;
            points.push(new THREE.Vector2(r, y));
        }
        
        return points;
    }

    createLeftVentricle() {
        const ventricle = this.createChamber(0.4, 0.8, 32, 0x990000);
        ventricle.position.set(-0.2, 0, 0);
        this.heartGroup.add(ventricle);
    }

    createRightVentricle() {
        const ventricle = this.createChamber(0.35, 0.7, 32, 0x800000);
        ventricle.position.set(0.2, 0, 0);
        this.heartGroup.add(ventricle);
    }

    createLeftAtrium() {
        const atrium = this.createChamber(0.25, 0.4, 32, 0xcc0000);
        atrium.position.set(-0.2, 0.8, 0);
        this.heartGroup.add(atrium);
    }

    createRightAtrium() {
        const atrium = this.createChamber(0.25, 0.4, 32, 0xb00000);
        atrium.position.set(0.2, 0.8, 0);
        this.heartGroup.add(atrium);
    }

    createAorta() {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.2, 1.2, 0),
            new THREE.Vector3(-0.2, 1.4, 0),
            new THREE.Vector3(0, 1.6, 0),
            new THREE.Vector3(0.2, 1.4, 0)
        ]);

        const geometry = new THREE.TubeGeometry(curve, 20, 0.1, 8, false);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const aorta = new THREE.Mesh(geometry, material);
        this.heartGroup.add(aorta);
    }

    createPulmonaryArtery() {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.2, 1.2, 0),
            new THREE.Vector3(0.2, 1.4, 0),
            new THREE.Vector3(0, 1.5, 0.2),
            new THREE.Vector3(-0.2, 1.4, 0.2)
        ]);

        const geometry = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const artery = new THREE.Mesh(geometry, material);
        this.heartGroup.add(artery);
    }

    getAttachmentPoints() {
        return {
            aorta: new THREE.Vector3(-0.2, 1.2, 0),
            pulmonaryArtery: new THREE.Vector3(0.2, 1.2, 0),
            venaCava: new THREE.Vector3(0.2, 1.0, 0),
            pulmonaryVeins: new THREE.Vector3(-0.2, 1.0, 0)
        };
    }

    update(deltaTime) {
        if (!this.isBeating) return;

        this.time += deltaTime * this.beatSpeed;
        
        const scale = 1 + Math.sin(this.time * 4) * 0.03;
        this.heartGroup.scale.set(
            0.1 * scale,
            0.1 * scale,
            0.1 * scale
        );
        
        // Update all chamber materials
        this.heartGroup.traverse((child) => {
            if (child.isMesh && child.material.uniforms) {
                child.material.uniforms.uTime.value = this.time;
            }
        });
    }

    setBeating(isBeating) {
        this.isBeating = isBeating;
    }

    setBeatSpeed(speed) {
        this.beatSpeed = speed;
    }

    getMesh() {
        return this.heartGroup;
    }

    dispose() {
        // Dispose of all heart meshes and materials
        this.heartGroup.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (child.material.uniforms) {
                    // Clean up shader uniforms
                    Object.values(child.material.uniforms).forEach(uniform => {
                        if (uniform.value && uniform.value.dispose) {
                            uniform.value.dispose();
                        }
                    });
                }
                child.material.dispose();
            }
        });

        // Clear the group
        while(this.heartGroup.children.length > 0) {
            this.heartGroup.remove(this.heartGroup.children[0]);
        }

        this.isBeating = false;
        this.time = 0;
    }
} 