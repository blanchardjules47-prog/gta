// ==========================================
// 1. INITIALISATION DE THREE.JS (VISUEL)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
scene.add(dirLight);

// Le sol
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x333333 }));
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);
scene.add(new THREE.GridHelper(300, 60, 0x000000, 0xffffff));

// Le personnage visuel
const playerGroup = new THREE.Group();
playerGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.2, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x0000ff })));
const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
head.position.y = 1.35; playerGroup.add(head);
const nose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x333333 }));
nose.position.set(0, 1.35, 0.25); playerGroup.add(nose);
scene.add(playerGroup);

// La voiture visuelle (un bloc rouge pour le style)
const carMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 4), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
scene.add(carMesh);

// Un texte ou indicateur au-dessus de la voiture
console.log("Appuie sur F près de la voiture pour monter dedans !");

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

// Joueur physique
const playerBody = new CANNON.Body({ mass: 60, position: new CANNON.Vec3(0, 2, 0), fixedRotation: true });
playerBody.addShape(new CANNON.Sphere(0.6));
world.addBody(playerBody);

// Voiture physique
const carBody = new CANNON.Body({ mass: 500, position: new CANNON.Vec3(5, 1, -5) });
carBody.addShape(new CANNON.Box(new CANNON.Vec3(1, 0.5, 2)));
world.addBody(carBody);

// ==========================================
// 3. ÉTAT DU JEU (À PIED OU EN VOITURE)
// ==========================================
let inVehicle = false; 
let carSpeed = 0;
let carAngle = 0;

// ==========================================
// 4. CAMÉRA ET CONTRÔLES
// ==========================================
let cameraAngleX = 0; let cameraAngleY = 0.3; const cameraRadius = 6;

document.addEventListener('click', () => { document.body.requestPointerLock(); });
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        cameraAngleX -= e.movementX * 0.003; cameraAngleY -= e.movementY * 0.003;
        cameraAngleY = Math.max(0.05, Math.min(Math.PI / 2.5, cameraAngleY));
    }
});

const keys = { z: false, s: false, q: false, d: false };
let canJump = false;

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
    
    if (e.key === ' ' && canJump && !inVehicle) {
        playerBody.velocity.y = 6; canJump = false;
    }

    // Touche F : Entrer / Sortir du véhicule
    if (key === 'f') {
        if (!inVehicle) {
            // Vérifier la distance entre le joueur et la voiture
            const dist = playerBody.position.distanceTo(carBody.position);
            if (dist < 4) { 
                inVehicle = true;
                playerGroup.visible = false; // Cache le personnage
                // Enlever le corps du joueur de la simulation pour éviter qu'il pousse la voiture
                world.removeBody(playerBody);
            }
        } else {
            // Sortir de la voiture
            inVehicle = false;
            playerGroup.visible = true;
            // Repositionner le joueur à côté de la voiture
            playerBody.position.set(carBody.position.x + 2, carBody.position.y + 1, carBody.position.z);
            playerBody.velocity.set(0, 0, 0);
            world.addBody(playerBody);
        }
    }
});
window.addEventListener('keyup', (e) => { const key = e.key.toLowerCase(); if (key in keys) keys[key] = false; });

playerBody.addEventListener("collide", (e) => { if (e.contact.ni.y > 0.5) canJump = true; });

// ==========================================
// 5. BOUCLE DE JEU (ANIMATE)
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    world.step(1 / 60, delta, 3);

    let targetCamX, targetCamY, targetCamZ;

    if (!inVehicle) {
        // --------------------------------------
        // MODE À PIED
        // --------------------------------------
        const moveSpeed = 7; let moveX = 0; let moveZ = 0;
        if (keys.z) { moveX += Math.sin(cameraAngleX); moveZ += Math.cos(cameraAngleX); }
        if (keys.s) { moveX -= Math.sin(cameraAngleX); moveZ -= Math.cos(cameraAngleX); }
        if (keys.q) { moveX += Math.sin(cameraAngleX + Math.PI/2); moveZ += Math.cos(cameraAngleX + Math.PI/2); }
        if (keys.d) { moveX -= Math.sin(cameraAngleX + Math.PI/2); moveZ -= Math.cos(cameraAngleX + Math.PI/2); }

        if (moveX !== 0 || moveZ !== 0) {
            playerBody.velocity.x = moveX * moveSpeed; playerBody.velocity.z = moveZ * moveSpeed;
            playerGroup.rotation.y = Math.atan2(moveX, moveZ);
        } else {
            playerBody.velocity.x = 0; playerBody.velocity.z = 0;
        }

        playerGroup.position.copy(playerBody.position);
        playerGroup.position.y -= 0.3;

        // Position de la cible caméra (Le joueur)
        targetCamX = playerBody.position.x;
        targetCamY = playerBody.position.y + 0.5;
        targetCamZ = playerBody.position.z;

    } else {
        // --------------------------------------
        // MODE VOITURE (PHYSIQUE ARCADE SIMPLE)
        // --------------------------------------
        const maxSpeed = 25;
        const accel = 15;
        const turnSpeed = 2.2;

        // Avancer / Reculer
        if (keys.z) carSpeed = Math.min(carSpeed + accel * delta, maxSpeed);
        else if (keys.s) carSpeed = Math.max(carSpeed - accel * delta, -maxSpeed * 0.5);
        else carSpeed *= 0.98; // Friction naturelle (freinage)

        // Tourner
        if (keys.q) carAngle += turnSpeed * delta * (carSpeed / maxSpeed);
        if (keys.d) carAngle -= turnSpeed * delta * (carSpeed / maxSpeed);

        // Appliquer la rotation et la vitesse au corps physique de la voiture
        carBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), carAngle);
        
        // Calculer le vecteur direction avant de la voiture
        const forwardX = Math.sin(carAngle);
        const forwardZ = Math.cos(carAngle);
        carBody.velocity.x = forwardX * carSpeed;
        carBody.velocity.z = forwardZ * carSpeed;

        // Synchroniser le visuel
        carMesh.position.copy(carBody.position);
        carMesh.quaternion.copy(carBody.quaternion);

        // Position de la cible caméra (La voiture)
        targetCamX = carBody.position.x;
        targetCamY = carBody.position.y + 0.5;
        targetCamZ = carBody.position.z;
    }

    // Gestion commune de la caméra orbitale
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
