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
    renderer.toneMappingExposure = 1.1;

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
        0xffffff,
        0.35
    );
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(
        0xffeebb,
        1.0
    );
    mainLight.position.set(50, 80, 40);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 200;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    mainLight.shadow.bias = -0.001;
    mainLight.shadow.normalBias = 0.02;
    scene.add(mainLight);

    const pointLight = new THREE.PointLight(
        0xffaa55,
        0.5,
        200
    );
    pointLight.position.set(-40, 40, -40);
    scene.add(pointLight);

    const spotLight = new THREE.SpotLight(
        0xffffff,
        0.4
    );
    spotLight.position.set(0, 60, -80);
    scene.add(spotLight);

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

    // Plate
    function buildPlate() {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x8c1414,
            roughness: 0.3,
            metalness: 0.2
        });

        const innerMat = new THREE.MeshStandardMaterial({
            color: 0x5a0a0a,
            roughness: 0.4,
            metalness: 0.1
        });

        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(
                90,
                90,
                10,
                6
            ),
            bodyMat
        );

        body.position.y = 5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const inner = new THREE.Mesh(
            new THREE.CylinderGeometry(
                82.5,
                82.5,
                5,
                6
            ),
            innerMat
        );
        inner.position.y = 7.5;
        inner.receiveShadow = true;
        group.add(inner);

        return group;
    }

    // Pineapple Tart
    function buildPineappleTart() {
        const w = 20;
        const d = 8;
        const h = 12;
        const r = 2;

        const shape = new THREE.Shape();
        shape.moveTo(-w + r, -d);
        shape.lineTo(w - r, -d);
        shape.quadraticCurveTo(w, -d, w, -d + r);
        shape.lineTo(w, d - r);
        shape.quadraticCurveTo(w, d, w - r, d);
        shape.lineTo(-w + r, d);
        shape.quadraticCurveTo(-w, d, -w, d - r);
        shape.lineTo(-w, -d + r);
        shape.quadraticCurveTo(-w, -d, -w + r, -d);

        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: h,
            bevelEnabled: false
        });
        geo.rotateX(-Math.PI / 2);

        const material = new THREE.MeshStandardMaterial({
            color: 0xf2bf3f,
            roughness: 0.6,
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geo, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    // Peanut Cookie
    function buildPeanutCookie() {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xa6733f,
            roughness: 0.7,
            metalness: 0
        });

        const body = new THREE.Mesh(
            new THREE.SphereGeometry(15, 32, 16),
            bodyMat
        );
        body.scale.set(1, 0.6, 1);
        body.position.y = 9;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        const r = 15;
        for (let i = 0; i < 50; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5 + 0.1;

            const x = r * Math.sin(phi) * Math.cos(theta) * 0.92;
            const y = r * Math.cos(phi) * 0.92 * 0.6 + 9;
            const z = r * Math.sin(phi) * Math.sin(theta) * 0.92;

            const crumb = new THREE.Mesh(
                new THREE.SphereGeometry(1.2 + Math.random() * 0.9, 8, 8),
                bodyMat
            );
            crumb.position.set(x, y, z);
            crumb.scale.set(1, 0.65, 1);
            group.add(crumb);
        }
        return group;
    }

    // Love Letter Roll + Procedural Texture
    function buildLoveLetterRaw() {
        const points = [
            new THREE.Vector2(5, -27.5),
            new THREE.Vector2(5, 27.5),
            new THREE.Vector2(4.3, 27.5),
            new THREE.Vector2(4.3, -27.5),
            new THREE.Vector2(5, -27.5)
        ];

        const geo = new THREE.LatheGeometry(points, 32);
        geo.rotateX(Math.PI / 2);

        // Procedural texture
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = '#909090';
        ctx.lineWidth = 2;

        // Grid pattern
        for (let i = 0; i <= size; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }

        // Random bumps
        for (let i = 0; i < 3000; i++) {
            const shade = Math.floor(Math.random() * 60 + 100);
            ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * size,
                Math.random() * size,
                Math.random() * 2.5 + 0.5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 1);

        const mat = new THREE.MeshStandardMaterial({
            color: 0xebd18c,
            metalness: 0.1,
            bumpMap: tex,
            bumpScale: 0.25,
            roughnessMap: tex,
            roughness: 0.85
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 5;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    // Love Letter Stack
    function buildLoveLetterStack() {
        const group = new THREE.Group();

        const angle = 25 * Math.PI / 180;
        const r = 5;

        const dx = r * Math.cos(angle);
        const dz = r * Math.sin(angle);

        const roll1 = buildLoveLetterRaw();
        roll1.position.set(-dx, 0, dz);
        roll1.rotation.y = angle;
        group.add(roll1);

        const roll2 = buildLoveLetterRaw();
        roll2.position.set(dx, 0, -dz);
        roll2.rotation.y = angle;
        group.add(roll2);

        const roll3 = buildLoveLetterRaw();
        roll3.position.set(0, 5 * Math.sqrt(3), 0);
        roll3.rotation.y = angle + 30 * Math.PI / 180;
        group.add(roll3);

        return group;
    }

    // Butter Cookie + Cherry
    function buildButterCherry() {
        const group = new THREE.Group();

        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(15, 15, 8, 32),
            new THREE.MeshStandardMaterial({
                color: 0xfaeba6,
                roughness: 0.5,
                metalness: 0.1
            })
        );
        base.position.y = 4;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);

        const cherry = new THREE.Mesh(
            new THREE.SphereGeometry(5, 32, 16),
            new THREE.MeshStandardMaterial({
                color: 0xd92626,
                roughness: 0.3,
                metalness: 0.1
            })
        );
        cherry.position.y = 13;
        cherry.castShadow = true;
        group.add(cherry);

        const stem = new THREE.Mesh(
            new THREE.CylinderGeometry(1, 1, 5, 8),
            new THREE.MeshStandardMaterial({
                color: 0x408c34,
                roughness: 0.6
            })
        );
        stem.position.y = 20.5;
        group.add(stem);

        return group;
    }

    // Flower Cookie
    function buildFlowerCookie() {
        const group = new THREE.Group();

        const pinkMat = new THREE.MeshStandardMaterial({
            color: 0xf299b8,
            roughness: 0.5,
            metalness: 0.1
        });

        const center = new THREE.Mesh(
            new THREE.CylinderGeometry(6, 6, 8, 32),
            pinkMat
        );
        center.position.y = 4;
        center.castShadow = true;
        center.receiveShadow = true;
        group.add(center);

        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(
                new THREE.CylinderGeometry(7, 7, 8, 32),
                pinkMat
            );
            const angle = i * 72 * Math.PI / 180;
            petal.position.set(
                Math.cos(angle) * 10.5,
                4,
                Math.sin(angle) * 10.5
            );
            petal.castShadow = true;
            petal.receiveShadow = true;
            group.add(petal);
        }
        return group;
    }

    // Scene Assembly
    const NORMAL_LIFT = 5;
    const LL_LIFT = 10;

    const configs = [
        {
            build: buildPlate,
            pos: [0, 0, 0],
            delay: 0,
            isPlate: true
        },
        {
            build: buildPineappleTart,
            pos: [0, 5, 48],
            delay: 0.6,
            lift: NORMAL_LIFT
        },
        {
            build: buildPeanutCookie,
            pos: [-48, 5, 0],
            delay: 1.0,
            lift: NORMAL_LIFT
        },
        {
            build: buildLoveLetterStack,
            pos: [0, 5, -48],
            delay: 1.4,
            lift: LL_LIFT
        },
        {
            build: buildButterCherry,
            pos: [48, 5, 0],
            delay: 1.8,
            lift: NORMAL_LIFT
        },
        {
            build: buildFlowerCookie,
            pos: [0, 5, 0],
            delay: 2.2,
            lift: NORMAL_LIFT
        }
    ];

    const clock = new THREE.Clock();
    const meshes = [];

    configs.forEach(function (cfg) {
        const obj = cfg.build();
        const lift = cfg.isPlate ? 0 : (cfg.lift || NORMAL_LIFT);
        const targetY = cfg.pos[1] + lift;

        obj.position.set(cfg.pos[0], targetY - 50, cfg.pos[2]);
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

    // UI
    setTimeout(function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
        if (ui) {
            ui.classList.remove('hidden');
        }
    }, 500);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

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

    animate();

    // Resize
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();