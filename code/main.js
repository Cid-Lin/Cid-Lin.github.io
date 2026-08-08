(() => {
    const container = document.getElementById('canvas-container');
    const overlay = document.getElementById('overlay');
    const ui = document.getElementById('ui');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 100, 300);

    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(90, 70, 90);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 40;
    controls.maxDistance = 250;
    controls.target.set(0, 8, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(
        0xfff1df,
        0.18
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
        0xffd4a8,
        1.25
    );
    keyLight.position.set(55, 85, 45);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 240;
    keyLight.shadow.camera.left = -110;
    keyLight.shadow.camera.right = 110;
    keyLight.shadow.camera.top = 110;
    keyLight.shadow.camera.bottom = -110;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.025;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
        0xb8c8ff,
        0.34
    );
    fillLight.position.set(-70, 38, 35);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(
        0xff7a4d,
        0.8,
        240,
        Math.PI / 5,
        0.55,
        1.0
    );
    rimLight.position.set(-15, 68, -90);
    rimLight.target.position.set(0, 8, 0);
    scene.add(rimLight.target);
    scene.add(rimLight);

    // Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 400),
        new THREE.MeshStandardMaterial({
            color: 0x2a0a0a,
            roughness: 0.8,
            metalness: 0.1,
            polygonOffset: true,
            polygonOffsetFactor: 2,
            polygonOffsetUnits: 2
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation Easing function
    function easeOutBounce(x) {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (x < 1 / d1) {
            return n1 * x * x;
        }

        if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        }

        if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        }

        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }

    const MODEL_BASE_PATH = './models/';
    const STL_LOADER_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js';

    const plateMaterial = new THREE.MeshStandardMaterial({
        color: 0x8c1414,
        roughness: 0.3,
        metalness: 0.2
    });

    const pineappleMaterial = new THREE.MeshStandardMaterial({
        color: 0xf2bf3f,
        roughness: 0.68,
        metalness: 0.02
    });

    pineappleMaterial.onBeforeCompile = function (shader) {
        shader.vertexShader = shader.vertexShader
            .replace(
                '#include <common>',
                `#include <common>
varying vec3 vObjectPosition;`
            )
            .replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
vObjectPosition = position;`
            );

        shader.fragmentShader = shader.fragmentShader
            .replace(
                '#include <common>',
                `#include <common>
varying vec3 vObjectPosition;
float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}
float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
}`
            )
            .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
float coarseNoise = valueNoise(vObjectPosition * 0.22);
float fineNoise = valueNoise(vObjectPosition * 0.85);
float bakedSpots = smoothstep(0.56, 0.84, coarseNoise * 0.72 + fineNoise * 0.28);
float edgeX = smoothstep(12.5, 17.5, abs(vObjectPosition.x));
float edgeZ = smoothstep(7.5, 11.5, abs(vObjectPosition.z));
float edgeBake = max(edgeX, edgeZ);
float topBake = smoothstep(5.0, 12.0, vObjectPosition.y);
float browning = clamp(bakedSpots * 0.52 + edgeBake * 0.28 + topBake * 0.08, 0.0, 0.72);
vec3 toastedColor = vec3(0.48, 0.20, 0.045);
diffuseColor.rgb = mix(diffuseColor.rgb, toastedColor, browning);`
            );
    };

    pineappleMaterial.customProgramCacheKey = function () {
        return 'pineapple-procedural-baked-v1';
    };

    const peanutMaterial = new THREE.MeshStandardMaterial({
        color: 0xa6733f,
        roughness: 0.7,
        metalness: 0
    });

    const loveLetterMaterial = new THREE.MeshStandardMaterial({
        color: 0xebd18c,
        roughness: 0.85,
        metalness: 0.1
    });

    const butterCherryMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.1
    });

    const flowerMaterial = new THREE.MeshStandardMaterial({
        color: 0xf299b8,
        roughness: 0.66,
        metalness: 0.02
    });

    flowerMaterial.onBeforeCompile = function (shader) {
        shader.uniforms.uTime = { value: 0 };

        shader.vertexShader = shader.vertexShader
            .replace(
                '#include <common>',
                `#include <common>
varying vec3 vFlowerObjectPosition;
uniform float uTime;`
            )
            .replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
vFlowerObjectPosition = position;
float flowerRadius = length(position.xz);
float flowerAngle = atan(position.z, position.x);
float flowerEdgeMask = smoothstep(7.0, 16.5, flowerRadius);
float flowerWave = sin(uTime * 2.0 + flowerAngle * 5.0 + flowerRadius * 0.16);
transformed.y += flowerWave * flowerEdgeMask * 0.18;`
            );

        shader.fragmentShader = shader.fragmentShader
            .replace(
                '#include <common>',
                `#include <common>
varying vec3 vFlowerObjectPosition;
float flowerHash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}
float flowerValueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = flowerHash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = flowerHash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = flowerHash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = flowerHash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = flowerHash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = flowerHash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = flowerHash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = flowerHash31(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
}`
            )
            .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
vec2 flowerXZ = vFlowerObjectPosition.xz;
float flowerR = length(flowerXZ);
float flowerAngleF = atan(flowerXZ.y, flowerXZ.x);
float flowerPetalMask = 0.5 + 0.5 * cos(flowerAngleF * 5.0);
float flowerCenterGlow = 1.0 - smoothstep(0.0, 7.0, flowerR);
float flowerPetalBody = smoothstep(5.5, 15.5, flowerR);
float flowerPetalEdge = smoothstep(11.5, 18.0, flowerR);
float flowerTopMask = smoothstep(1.0, 7.8, vFlowerObjectPosition.y);
float flowerCoarseNoise = flowerValueNoise(vFlowerObjectPosition * 0.28);
float flowerFineNoise = flowerValueNoise(vFlowerObjectPosition * 1.1);
float flowerSugarNoise = flowerValueNoise(vFlowerObjectPosition * 2.8);
float flowerSugarSpeck = smoothstep(0.78, 0.94, flowerSugarNoise) * (0.35 + 0.65 * flowerTopMask);
float flowerToast = smoothstep(0.55, 0.82, flowerCoarseNoise * 0.7 + flowerFineNoise * 0.3) * 0.35;
float flowerPetalVariation = flowerPetalMask * flowerPetalBody * 0.18;
vec3 flowerBasePink = vec3(0.95, 0.60, 0.72);
vec3 flowerCenterPink = vec3(0.99, 0.78, 0.84);
vec3 flowerEdgePink = vec3(0.84, 0.36, 0.54);
vec3 flowerToastedPink = vec3(0.72, 0.30, 0.38);
vec3 flowerSugarColor = vec3(1.0, 0.95, 0.96);
vec3 flowerCookieColor = flowerBasePink;
flowerCookieColor = mix(flowerCookieColor, flowerCenterPink, flowerCenterGlow * 0.85);
flowerCookieColor = mix(flowerCookieColor, flowerEdgePink, flowerPetalEdge * (0.35 + flowerPetalVariation));
flowerCookieColor = mix(flowerCookieColor, flowerToastedPink, flowerToast * (0.45 + flowerPetalEdge * 0.35));
flowerCookieColor = mix(flowerCookieColor, flowerSugarColor, flowerSugarSpeck * 0.32);
diffuseColor.rgb = flowerCookieColor;`
            )
            .replace(
                '#include <roughnessmap_fragment>',
                `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.82, flowerSugarSpeck * 0.35);
roughnessFactor = mix(roughnessFactor, 0.60, flowerCenterGlow * 0.30);
roughnessFactor = mix(roughnessFactor, 0.72, flowerPetalEdge * 0.25);`
            );

        flowerMaterial.userData.shader = shader;
    };

    flowerMaterial.customProgramCacheKey = function () {
        return 'flower-procedural-wobble-v1';
    };

    function loadSTLLoader() {
        return new Promise(function (resolve, reject) {
            if (THREE.STLLoader) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = STL_LOADER_URL;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function normalizeSTLGeometry(geometry) {
        geometry.computeBoundingBox();

        const box = geometry.boundingBox;
        const centerX = (box.min.x + box.max.x) * 0.5;
        const centerY = (box.min.y + box.max.y) * 0.5;

        geometry.translate(-centerX, -centerY, -box.min.z);
        geometry.rotateX(-Math.PI / 2);
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        return geometry;
    }

    function applyButterCherryColors(geometry) {
        const position = geometry.getAttribute('position');
        const colors = new Float32Array(position.count * 3);
        const butter = new THREE.Color(0xfaeba6);
        const cherry = new THREE.Color(0xd92626);
        const stem = new THREE.Color(0x408c34);

        for (let i = 0; i < position.count; i++) {
            const y = position.getY(i);
            const x = position.getX(i);
            const z = position.getZ(i);
            const radial = Math.sqrt(x * x + z * z);

            let color = butter;

            if (y >= 7.95) {
                color = cherry;
            }

            if (y >= 12.9 && radial <= 1.25) {
                color = stem;
            }

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(colors, 3)
        );
    }

    function loadSTL(loader, file, material, useButterCherryColors) {
        return new Promise(function (resolve, reject) {
            loader.load(
                MODEL_BASE_PATH + file,
                function (geometry) {
                    normalizeSTLGeometry(geometry);

                    if (useButterCherryColors) {
                        applyButterCherryColors(geometry);
                    }

                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    resolve(mesh);
                },
                undefined,
                reject
            );
        });
    }

    // Scene Assembly
    const configs = [
        {
            file: 'plate.stl',
            material: plateMaterial,
            pos: [0, 0, 0],
            delay: 0,
            isPlate: true
        },
        {
            file: 'pineapple_tart.stl',
            material: pineappleMaterial,
            pos: [0, 5, 48],
            delay: 0.6
        },
        {
            file: 'peanut_cookie.stl',
            material: peanutMaterial,
            pos: [-48, 5, 0],
            delay: 1.0
        },
        {
            file: 'love_letter_stack.stl',
            material: loveLetterMaterial,
            pos: [0, 5, -48],
            delay: 1.4
        },
        {
            file: 'butter_cherry.stl',
            material: butterCherryMaterial,
            pos: [48, 5, 0],
            delay: 1.8,
            butterCherryColors: true
        },
        {
            file: 'flower_cookie.stl',
            material: flowerMaterial,
            pos: [0, 5, 0],
            delay: 2.2
        }
    ];

    const clock = new THREE.Clock(false);
    const meshes = [];

    // UI
    function showLoadedUI() {
        if (overlay) {
            overlay.classList.add('hidden');
        }

        if (ui) {
            ui.classList.remove('hidden');
        }
    }

    function showLoadError(error) {
        console.error(error);

        if (overlay) {
            const title = overlay.querySelector('h1');
            const text = overlay.querySelector('p');

            if (title) {
                title.textContent = 'Failed to load models';
            }

            if (text) {
                text.textContent = 'Check STL file paths and local server.';
            }
        }
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        if (flowerMaterial.userData.shader) {
            flowerMaterial.userData.shader.uniforms.uTime.value = t;
        }

        scene.rotation.y = Math.sin(t * 0.15) * 0.15 + t * 0.05;

        meshes.forEach(function (m) {
            const d = m.userData;

            if (t < d.delay || !m.visible) {
                if (t >= d.delay) {
                    m.visible = true;
                }
                return;
            }

            const lt = Math.min((t - d.delay) * d.speed, 1);

            m.position.y = d.startY + (d.targetY - d.startY) * easeOutBounce(lt);

            if (lt >= 1) {
                m.position.y = d.targetY + Math.sin(t * 2 + d.delay * 10) * 0.15;
            }
        });

        controls.update();
        renderer.render(scene, camera);
    }

    loadSTLLoader()
        .then(function () {
            const loader = new THREE.STLLoader();

            return Promise.all(
                configs.map(function (cfg) {
                    return loadSTL(
                        loader,
                        cfg.file,
                        cfg.material,
                        cfg.butterCherryColors
                    ).then(function (obj) {
                        const targetY = cfg.pos[1];

                        obj.position.set(
                            cfg.pos[0],
                            targetY - 50,
                            cfg.pos[2]
                        );
                        obj.visible = false;
                        obj.userData = {
                            targetY: targetY,
                            delay: cfg.isPlate ? 0 : cfg.delay,
                            startY: targetY - 50,
                            speed: 0.8
                        };

                        scene.add(obj);
                        meshes.push(obj);
                    });
                })
            );
        })
        .then(function () {
            showLoadedUI();
            clock.start();
            animate();
        })
        .catch(showLoadError);

    // Resize
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
