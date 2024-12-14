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
        try {
            console.log('Creating heart shape...');
            const heartShape = new THREE.Shape();
            
            // Start at bottom point
            heartShape.moveTo(0, -2);
            
            // Left ventricle
            heartShape.bezierCurveTo(
                -3, -2,     // cp1
                -4, 0.5,    // cp2
                -2, 2.5     // end point
            );
            
            // Left atrium
            heartShape.bezierCurveTo(
                -1.8, 3.5,  // cp1
                -0.8, 4,    // cp2
                0, 3        // end point
            );
            
            // Right atrium
            heartShape.bezierCurveTo(
                0.8, 4,     // cp1
                1.8, 3.5,   // cp2
                2, 2.5      // end point
            );
            
            // Right ventricle
            heartShape.bezierCurveTo(
                4, 0.5,     // cp1
                3, -2,      // cp2
                0, -2       // back to start
            );

            const extrudeSettings = {
                depth: 3,
                bevelEnabled: true,
                bevelThickness: 0.8,
                bevelSize: 0.6,
                bevelSegments: 32,
                curveSegments: 32
            };

            console.log('Creating heart geometry...');
            const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
            
            console.log('Creating heart material...');
            const heartMaterial = new THREE.MeshPhongMaterial({
                color: 0xcc0000,
                specular: 0x444444,
                shininess: 30,
                side: THREE.DoubleSide
            });

            console.log('Creating heart mesh...');
            const heart = new THREE.Mesh(heartGeometry, heartMaterial);
            heart.geometry.center();
            
            heart.rotation.x = Math.PI * 0.2;
            heart.rotation.y = Math.PI * 0.15;
            
            this.heartGroup.add(heart);
            console.log('Heart creation complete');

        } catch (error) {
            console.error('Error in createAnatomicalHeart:', error);
            this.createSimpleHeart();
        }
    }

    update(deltaTime) {
        if (!this.isBeating) return;

        this.time += deltaTime * this.beatSpeed;
        
        // Simple beating animation
        const scale = 0.1 * (1 + Math.sin(this.time * 4) * 0.05);
        this.heartGroup.scale.set(scale, scale, scale);
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
} 