export class FleshGoblin {
    constructor(scene) {
        this.scene = scene;
        this.goblinGroup = new BABYLON.TransformNode("goblinGroup", scene);
        this.createGoblin();
        this.setupBehavior();
    }

    createGoblin() {
        // Create custom shader material with improved flesh effects
        const goblinShader = new BABYLON.ShaderMaterial(
            "goblinShader",
            this.scene,
            {
                vertex: "goblin",
                fragment: "goblin",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "time", "cameraPosition"],
            }
        );

        // Create more organic base shape by combining meshes
        const bodyCore = BABYLON.MeshBuilder.CreateIcoSphere("goblinCore", {
            radius: 0.15,
            subdivisions: 4,
            updatable: true
        }, this.scene);

        // Add asymmetric growths
        const growths = [];
        const numGrowths = 5;
        for (let i = 0; i < numGrowths; i++) {
            const growth = BABYLON.MeshBuilder.CreateIcoSphere("growth", {
                radius: 0.05 + Math.random() * 0.08,
                subdivisions: 3
            }, this.scene);

            const angle = (i / numGrowths) * Math.PI * 2;
            growth.position = new BABYLON.Vector3(
                Math.cos(angle) * 0.1,
                Math.sin(angle) * 0.1 - 0.05,
                Math.sin(angle * 2) * 0.1
            );
            growths.push(growth);
        }

        // Create tentacle-like appendages
        const tentacles = [];
        const numTentacles = 4;
        for (let i = 0; i < numTentacles; i++) {
            const points = [];
            const segments = 10;
            const length = 0.7 + Math.random() * 0.2;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                points.push(new BABYLON.Vector3(
                    Math.sin(t * Math.PI * 2) * 0.02,
                    -t * length,
                    Math.cos(t * Math.PI * 2) * 0.02
                ));
            }

            const tentacle = BABYLON.MeshBuilder.CreateTube("tentacle", {
                path: points,
                radius: 0.07,
                tessellation: 8,
                cap: BABYLON.Mesh.CAP_ALL
            }, this.scene);

            const angle = (i / numTentacles) * Math.PI * 2;
            tentacle.position = new BABYLON.Vector3(
                Math.cos(angle) * 0.1,
                0.05,
                Math.sin(angle) * 0.1
            );
            tentacle.rotation.x = Math.random() * Math.PI * 0.25;
            tentacle.rotation.z = angle;
            tentacles.push(tentacle);
        }

        // Enhanced shader code for more organic movement
        BABYLON.Effect.ShadersStore["goblinVertexShader"] = `
            precision highp float;
            
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 uv;
            
            uniform mat4 world;
            uniform mat4 worldViewProjection;
            uniform float time;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUV;
            
            void main() {
                vec3 pos = position;
                
                // Multiple layers of organic movement
                float displacement = 
                    sin(pos.x * 4.0 + time) * 
                    cos(pos.y * 4.0 + time * 0.7) * 
                    sin(pos.z * 4.0 + time * 0.5) * 0.05 +
                    sin(pos.x * 8.0 - time * 0.5) * 
                    sin(pos.y * 8.0 + time * 0.3) * 
                    cos(pos.z * 8.0 + time * 0.6) * 0.025;
                
                // Add pulsing
                float pulse = sin(time * 1.5) * 0.05 + 1.0;
                pos *= pulse;
                pos += normal * displacement;
                
                vPosition = (world * vec4(pos, 1.0)).xyz;
                vNormal = (world * vec4(normal, 0.0)).xyz;
                vUV = uv;
                
                gl_Position = worldViewProjection * vec4(pos, 1.0);
            }
        `;

        // Enhanced fragment shader for more grotesque appearance
        BABYLON.Effect.ShadersStore["goblinFragmentShader"] = `
            precision highp float;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUV;
            
            uniform float time;
            
            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            void main() {
                vec3 normal = normalize(vNormal);
                
                // Create pulsing flesh color with more variation
                float pulse = sin(time * 2.0) * 0.5 + 0.5;
                vec3 fleshColor = vec3(0.8, 0.2, 0.2) * (0.8 + pulse * 0.2);
                
                // Add more detailed veins
                float veins = sin(vUV.x * 20.0 + time) * sin(vUV.y * 20.0 - time);
                veins += sin(vUV.x * 15.0 - time * 0.7) * sin(vUV.y * 15.0 + time * 0.8) * 0.5;
                veins = smoothstep(0.8, 1.0, veins);
                vec3 veinColor = vec3(0.4, 0.0, 0.0);
                
                // Add flesh texture
                float fleshNoise = noise(vUV * 10.0 + time * 0.1) * 0.1;
                
                // Combine colors with more complex mixing
                vec3 color = mix(fleshColor, veinColor, veins * 0.5);
                color = mix(color, color * 0.7, fleshNoise);
                
                // Enhanced subsurface scattering
                float sss = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 4.0);
                color += vec3(0.9, 0.2, 0.1) * sss * 0.5;
                
                // Add slight transparency at edges
                float alpha = 0.95 - sss * 0.3;
                
                gl_FragColor = vec4(color, alpha);
            }
        `;

        // Apply shader to all parts
        const applyMaterial = (mesh) => {
            mesh.material = goblinShader;
            mesh.parent = this.goblinGroup;
        };

        applyMaterial(bodyCore);
        growths.forEach(applyMaterial);
        tentacles.forEach(applyMaterial);

        this.goblinMesh = bodyCore;
        this.goblinShader = goblinShader;
        this.growths = growths;
        this.tentacles = tentacles;

        // Add creepier eyes
        this.createEyes();
    }

    createEyes() {
        const eyeMaterial = new BABYLON.StandardMaterial("eyeMaterial", this.scene);
        eyeMaterial.emissiveColor = new BABYLON.Color3(0.9, 0.2, 0.0);
        eyeMaterial.specularPower = 256;

        // Create multiple small eyes
        const numEyes = 6;
        this.eyes = [];
        
        for (let i = 0; i < numEyes; i++) {
            const eye = BABYLON.MeshBuilder.CreateSphere("eye", {
                diameter: 0.02 + Math.random() * 0.02,
                segments: 16
            }, this.scene);
            
            const angle = (i / numEyes) * Math.PI * 1.5 - Math.PI * 0.25;
            const radius = 0.08 + Math.random() * 0.03;
            
            eye.position = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                0.05 + Math.random() * 0.03,
                Math.sin(angle) * radius
            );
            
            eye.material = eyeMaterial;
            eye.parent = this.goblinGroup;
            this.eyes.push(eye);
        }
    }

    setupBehavior() {
        this.targetPosition = new BABYLON.Vector3(0, -1.5, 0);
        this.currentPosition = this.goblinGroup.position.clone();
        this.moveSpeed = 0.5;
        this.wanderRadius = 0.5;
        this.lastTargetUpdate = 0;
        this.targetUpdateInterval = 2000; // ms
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        
        // Update shader time
        if (this.goblinShader) {
            this.goblinShader.setFloat("time", time);
        }

        // Animate tentacles
        if (this.tentacles) {
            this.tentacles.forEach((tentacle, index) => {
                const offset = index * Math.PI * 0.5;
                tentacle.rotation.x = Math.sin(time * 2 + offset) * 0.2;
                tentacle.rotation.z += Math.sin(time + offset) * 0.01;
            });
        }

        // Animate eyes
        if (this.eyes) {
            this.eyes.forEach((eye, index) => {
                const offset = index * 0.5;
                const blinkTime = (time + offset) * 2;
                const blink = Math.sin(blinkTime) * 0.5 + 0.5;
                eye.scaling.y = 0.7 + blink * 0.3;
                
                // Random eye movements
                if (Math.random() < 0.01) {
                    eye.position.y += (Math.random() - 0.5) * 0.01;
                }
            });
        }

        // Update target position periodically
        if (time - this.lastTargetUpdate > this.targetUpdateInterval) {
            const angle = Math.random() * Math.PI * 2;
            this.targetPosition = new BABYLON.Vector3(
                Math.cos(angle) * this.wanderRadius,
                -1.5 + Math.random() * 0.2,
                Math.sin(angle) * this.wanderRadius
            );
            this.lastTargetUpdate = time;
        }

        // Move towards target
        const direction = this.targetPosition.subtract(this.currentPosition);
        const distance = direction.length();
        
        if (distance > 0.01) {
            direction.normalize();
            this.currentPosition.addInPlace(direction.scale(this.moveSpeed * deltaTime));
            this.goblinGroup.position = this.currentPosition;
            
            // Look in movement direction
            const lookAt = Math.atan2(direction.z, direction.x);
            this.goblinGroup.rotation.y = lookAt + Math.PI / 2;
        }
    }

    getMesh() {
        return this.goblinGroup;
    }

    dispose() {
        if (this.goblinMesh) {
            this.goblinMesh.dispose();
        }
        if (this.goblinShader) {
            this.goblinShader.dispose();
        }
        if (this.eyes) {
            this.eyes.forEach(eye => {
                eye.dispose();
            });
        }
        this.goblinGroup.dispose();
    }
} 