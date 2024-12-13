import * as THREE from 'three';

export class HeartSimulation {
    constructor() {
        this.heartGroup = new THREE.Group();
        this.time = 0;
        this.beatSpeed = 2;
        this.isBeating = true;
        this.createAnatomicalHeart();
        this.heartGroup.scale.set(0.03, 0.03, 0.03);
        this.heartGroup.rotation.z = Math.PI;
    }

    createAnatomicalHeart() {
        const heartShape = new THREE.Shape();
        
        heartShape.moveTo(0, -2);
        
        heartShape.bezierCurveTo(
            -2.5, -1.5,  // cp1
            -3.5, 0.5,   // cp2
            -1.8, 2      // end point
        );
        
        heartShape.bezierCurveTo(
            -1.2, 3,     // cp1
            -0.5, 3.2,   // cp2
            0, 2.8       // end point
        );
        
        heartShape.bezierCurveTo(
            0.5, 3.2,    // cp1
            1.2, 3,      // cp2
            1.8, 2       // end point
        );
        
        heartShape.bezierCurveTo(
            3.5, 0.5,    // cp1
            2.5, -1.5,   // cp2
            0, -2        // back to start
        );

        const extrudeSettings = {
            depth: 1.8,
            bevelEnabled: true,
            bevelThickness: 0.4,
            bevelSize: 0.3,
            bevelSegments: 16
        };

        const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        
        const heartMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0xcc0000) },
                uPulseIntensity: { value: 0.12 },
                uDetail: { value: 40.0 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPulseIntensity;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vPulse;

                float noise(vec3 p) {
                    return sin(p.x * 10.0 + uTime) * 
                           sin(p.y * 10.0 + uTime) * 
                           sin(p.z * 10.0 + uTime);
                }

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    
                    float mainPulse = sin(uTime * 2.0) * uPulseIntensity;
                    float secondaryPulse = cos(uTime * 2.5) * (uPulseIntensity * 0.5);
                    
                    float contractionWave = sin(position.y * 4.0 + uTime * 5.0) * 0.04;
                    float muscleFlex = sin(position.x * 3.0 + uTime * 4.0) * 0.03;
                    
                    float organicMotion = noise(position * 0.5 + uTime * 0.1) * 0.02;
                    
                    vec3 pos = position;
                    
                    float ventricleIntensity = smoothstep(-2.0, 1.0, position.y);
                    float atriumIntensity = smoothstep(1.0, 3.0, position.y);
                    
                    float deformation = mainPulse * (1.0 - ventricleIntensity) + 
                                      secondaryPulse * atriumIntensity +
                                      contractionWave + muscleFlex + organicMotion;
                    
                    pos *= (1.0 + deformation);
                    vPulse = deformation;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uTime;
                uniform float uDetail;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vPulse;

                void main() {
                    float fiber = sin(vPosition.x * uDetail + vPosition.y * uDetail) * 0.5 + 0.5;
                    float crossFiber = cos(vPosition.x * uDetail - vPosition.y * uDetail) * 0.5 + 0.5;
                    
                    float pulse = sin(uTime * 2.0 + vPosition.y * 3.0) * 0.5 + 0.5;
                    
                    float ventricleShading = smoothstep(-2.0, 1.0, vPosition.y) * 0.4;
                    float atriumShading = smoothstep(1.0, 3.0, vPosition.y) * 0.3;
                    
                    vec3 baseColor = mix(uColor * 0.8, uColor * 1.2, fiber);
                    baseColor = mix(baseColor, baseColor * 1.1, crossFiber);
                    
                    vec3 pulseColor = mix(baseColor, baseColor * 1.4, pulse);
                    pulseColor *= (1.0 - ventricleShading) * (1.0 - atriumShading);
                    
                    float sss = pow(1.0 - abs(dot(normalize(vPosition), vNormal)), 4.0);
                    vec3 finalColor = mix(pulseColor, vec3(1.0, 0.2, 0.2), sss * 0.4);
                    
                    finalColor *= (1.0 + vPulse * 0.2);
                    
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        const heart = new THREE.Mesh(heartGeometry, heartMaterial);
        this.heartGroup.add(heart);
    }

    update(deltaTime) {
        if (!this.isBeating) return;

        this.time += deltaTime * this.beatSpeed;
        
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
} 