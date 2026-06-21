// ==========================================
// 1. INITIALISATION DE THREE.JS (VISUEL)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122); // Ambiance nuit urbaine

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lumières de la ville
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
dirLight.position.set(50, 100, 50);
scene.add(dirLight);

// Le sol (Asphalte)
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.8 }));
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);
scene.add(new THREE.GridHelper(400, 80, 0x444444, 0x222222));

// ==========================================
// 2. INITIALISATION DE CANNON.JS (PHYSIQUE)
// ==========================================
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Sol physique
const floorBody = new CANNON.Body({ mass: 0 });
floorBody.addShape(new CANNON.Plane());
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

// ==========================================
// 3. CRÉATION DU PERSONNAGE ANIMÉ
// ==========================================
const playerGroup = new THREE.Group();

const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
const clothesMat = new THREE.MeshStandardMaterial({ color: 0x3366ff }); // T-shirt bleu
const pantsMat = new THREE.MeshStandardMaterial({ color: 0x222222 });   // Pantalon noir

// Torse
const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.3), clothesMat);
torso.position.y = 0.85; playerGroup.add(torso);

// Tête
const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), skinMat);
head.position.y = 1.3; playerGroup.add(head);

// Bras
const armGeo = new THREE.BoxGeometry(0.18, 0.6, 0.18);
const leftArm = new THREE.Mesh(armGeo, clothesMat); leftArm.position.set(-0.4, 0.85, 0);
const rightArm = new THREE.Mesh(armGeo, clothesMat); rightArm.position.set(0.4, 0.85, 0);
playerGroup.add(leftArm, rightArm);

// Jambes
const legGeo = new THREE.BoxGeometry(0.2, 0.6, 0.2);
const leftLeg = new THREE.Mesh(legGeo, pantsMat); leftLeg.position.set(-0.18, 0.3, 0);
const rightLeg = new THREE.Mesh(legGeo, pantsMat); rightLeg.position.set(0.18, 0.3, 0);
playerGroup.add(leftLeg, rightLeg);

scene.add(playerGroup);

// Joueur physique
const playerBody = new CANNON.Body({ mass: 60, position: new CANNON.Vec3(0, 2, 0), fixedRotation: true });
playerBody.addShape(new CANNON.Sphere(0.6));
world.addBody(playerBody);

// ==========================================
// 4. CRÉATION DE LA VOITURE (SANS DOUBLON !)
// ==========================================
const carMesh = new THREE.Group(); 
scene.add(carMesh);

// Carrosserie
const carBodyVisual = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 4), new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.2 }));
carBodyVisual.position.y = 0.3;
const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.1 }));
cabin.position.set(0, 0.75, -0.2);
carMesh.add(carBodyVisual, cabin);

// Roues
const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const fLeft = new THREE.Mesh(wheelGeo, wheelMat); fLeft.rotation.z = Math.PI/2; fLeft.position.set(-1.1, 0.2, -1.2);
const fRight = new THREE.Mesh(wheelGeo, wheelMat); fRight.rotation.z = Math.PI/2; fRight.position.set(1.1, 0.2, -1.2);
const bLeft = new THREE.Mesh(wheelGeo, wheelMat); bLeft.rotation.z = Math.PI/2; bLeft.position.set(-1.1, 0.2, 1.2);
const bRight = new THREE.Mesh(wheelGeo, wheelMat); bRight.rotation.z = Math.PI/2; bRight.position.set(1.1, 0.2, 1.2);
carMesh.add(fLeft, fRight, bLeft, bRight);

// Voiture physique
const carBody = new CANNON.Body({ mass: 500, position: new CANNON.Vec3(0, 1, -10) });
carBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.4, 2)));
world.addBody(carBody);

// ==========================================
// 5. GÉNÉRATION DE LA VILLE (BÂTIMENTS)
// ==========================================
const buildingColors = [0x4a4e69, 0x9a8c98, 0x3d5a80, 0x293241, 0x6d597a];

for (let i = 0; i < 40; i++) {
    const w = Math.random() * 8 + 6;
    const h = Math.random() * 30 + 10;
    const d = Math.random() * 8 + 6;

    let x = (Math.random() - 0.5) * 300;
    let z = (Math.random() - 0.5) * 300;
    if (Math.abs(x) < 20 && Math.abs(z) < 20) { x += 30; z += 30; }

    // Bâtiment Visuel
    const randomColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
    const buildMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: randomColor, roughness: 0.5 }));
    buildMesh.position.set(x, h / 2, z);
    scene.add(buildMesh);

    // Bâtiment Physique
    const buildShape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
    const buildBody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(x, h / 2, z) });
    buildBody.addShape(buildShape);
    world.addBody(buildBody);
}

// ==========================================
// 6. ÉTAT DU JEU, CAMÉRA ET CLAVIER
// ==========================================
let inVehicle = false; let carSpeed = 0; let carAngle = 0;
let cameraAngleX = 0; let cameraAngleY = 0.3; const cameraRadius = 7;
const keys = { z: false, s: false, q: false, d: false };
let canJump = false;

document.addEventListener('click', () => { document.body.requestPointerLock(); });
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        cameraAngleX -= e.movementX * 0.003; cameraAngleY -= e.movementY * 0.003;
        cameraAngleY = Math.max(0.05, Math.min(Math.PI / 2.5, cameraAngleY));
    }
});

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase(); if (key in keys) keys[key] = true;
    if (e.key === ' ' && canJump && !inVehicle) { playerBody.velocity.y = 6; canJump = false; }

    if (key === 'f') {
        if (!inVehicle) {
            const dx = playerBody.position.x - carBody.position.x;
            const dz = playerBody.position.z - carBody.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < 4) { 
                inVehicle = true; playerGroup.visible = false; world.removeBody(playerBody);
            }
        } else {
            inVehicle = false; playerGroup.visible = true;
            playerBody.position.set(carBody.position.x + 2, carBody.position.y + 1, carBody.position.z);
            playerBody.velocity.set(0, 0, 0); world.addBody(playerBody);
        }
    }
});
window.addEventListener('keyup', (e) => { const key = e.key.toLowerCase(); if (key in keys) keys[key] = false; });
playerBody.addEventListener("collide", (e) => { if (e.contact.ni.y > 0.5) canJump = true; });

// ==========================================
// 7. BOUCLE DE JEU & ANIMATIONS
// ==========================================
const clock = new THREE.Clock();
let animationTime = 0;

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    world.step(1 / 60, delta, 3);

    let targetCamX, targetCamY, targetCamZ;

    if (!inVehicle) {
        // À PIED
        const moveSpeed = 6; let moveX = 0; let moveZ = 0;
        if (keys.z) { moveX += Math.sin(cameraAngleX); moveZ += Math.cos(cameraAngleX); }
        if (keys.s) { moveX -= Math.sin(cameraAngleX); moveZ -= Math.cos(cameraAngleX); }
        if (keys.q) { moveX += Math.sin(cameraAngleX + Math.PI/2); moveZ += Math.cos(cameraAngleX + Math.PI/2); }
        if (keys.d) { moveX -= Math.sin(cameraAngleX + Math.PI/2); moveZ -= Math.cos(cameraAngleX + Math.PI/2); }

        if (moveX !== 0 || moveZ !== 0) {
            playerBody.velocity.x = moveX * moveSpeed; playerBody.velocity.z = moveZ * moveSpeed;
            playerGroup.rotation.y = Math.atan2(moveX, moveZ);

            animationTime += delta * 12;
            leftLeg.rotation.x = Math.sin(animationTime) * 0.6;
            rightLeg.rotation.x = -Math.sin(animationTime) * 0.6;
            leftArm.rotation.x = -Math.sin(animationTime) * 0.4;
            rightArm.rotation.x = Math.sin(animationTime) * 0.4;
        } else {
            playerBody.velocity.x = 0; playerBody.velocity.z = 0;
            leftLeg.rotation.x = 0; rightLeg.rotation.x = 0;
            leftArm.rotation.x = 0; rightArm.rotation.x = 0;
        }

        playerGroup.position.copy(playerBody.position);
        playerGroup.position.y -= 0.5;
        targetCamX = playerBody.position.x; targetCamY = playerBody.position.y + 0.5; targetCamZ = playerBody.position.z;

    } else {
        // EN VOITURE
        const maxSpeed = 30; const accel = 20; const turnSpeed = 2.5;
        if (keys.z) carSpeed = Math.min(carSpeed + accel * delta, maxSpeed);
        else if (keys.s) carSpeed = Math.max(carSpeed - accel * delta, -maxSpeed * 0.5);
        else carSpeed *= 0.96;

        if (keys.q) carAngle += turnSpeed * delta * (carSpeed / maxSpeed);
        if (keys.d) carAngle -= turnSpeed * delta * (carSpeed / maxSpeed);

        carBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), carAngle);
        carBody.velocity.x = Math.sin(carAngle) * carSpeed;
        carBody.velocity.z = Math.cos(carAngle) * carSpeed;

        carMesh.position.copy(carBody.position);
        carMesh.quaternion.copy(carBody.quaternion);

        targetCamX = carBody.position.x; targetCamY = carBody.position.y + 0.5; targetCamZ = carBody.position.z;
    }

    // Caméra orbitale
    camera.position.x = targetCamX + cameraRadius * Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
    camera.position.z = targetCamZ + cameraRadius * Math.cos(cameraAngleX) * Math.cos(cameraAngleY);
    camera.position.y = targetCamY + cameraRadius * Math.sin(cameraAngleY) + 0.5;
    camera.lookAt(targetCamX, targetCamY, targetCamZ);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
