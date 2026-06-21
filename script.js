
// 1. Initialisation de la Scène, de la Caméra et du Rendu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Ciel bleu

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
scene.add(dirLight);

// 3. Le Sol
const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Sol asphalte
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Ajouter des lignes sur le sol pour mieux voir le mouvement
const grid = new THREE.GridHelper(200, 50, 0x000000, 0xffffff);
grid.position.y = 0.01;
scene.add(grid);

// 4. Création du Personnage (Option B : Un personnage assemblé)
const playerGroup = new THREE.Group(); // Conteneur pour tout le corps

// Le tronc
const bodyGeo = new THREE.CylinderGeometry(0.4, 0.2, 1.2, 8);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // T-shirt bleu
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 0.6;
playerGroup.add(body);

// La tête
const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac }); // Peau
const head = new THREE.Mesh(headGeo, headMat);
head.position.y = 1.35;
playerGroup.add(head);

// Un "nez" ou une visière pour savoir où regarde le personnage
const noseGeo = new THREE.BoxGeometry(0.1, 0.1, 0.3);
const noseMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const nose = new THREE.Mesh(noseGeo, noseMat);
nose.position.set(0, 1.35, 0.25);
playerGroup.add(nose);

scene.add(playerGroup);

// 5. Gestion de la Caméra Orbitale à la souris (Option A)
let cameraAngleX = 0; // Rotation gauche/droite
let cameraAngleY = 0.3; // Rotation haut/bas
const cameraRadius = 5; // Distance derrière le joueur

// Capturer les mouvements de la souris quand on clique sur l'écran
document.addEventListener('click', () => {
    document.body.requestPointerLock(); // Bloque la souris au centre comme dans GTA
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        cameraAngleX -= e.movementX * 0.003;
        cameraAngleY -= e.movementY * 0.003;

        // Limiter la caméra pour ne pas qu'elle passe sous le sol ou se retourne
        cameraAngleY = Math.max(0.05, Math.min(Math.PI / 2.5, cameraAngleY));
    }
});

// 6. Contrôles Clavier
const keys = { z: false, s: false, q: false, d: false };
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

// 7. Boucle principale du jeu
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const moveSpeed = 5 * delta;

    // Déplacement relatif à l'orientation de la caméra
    let moveX = 0;
    let moveZ = 0;

    if (keys.z) { moveX += Math.sin(cameraAngleX); moveZ += Math.cos(cameraAngleX); }
    if (keys.s) { moveX -= Math.sin(cameraAngleX); moveZ -= Math.cos(cameraAngleX); }
    if (keys.q) { moveX += Math.sin(cameraAngleX + Math.PI/2); moveZ += Math.cos(cameraAngleX + Math.PI/2); }
    if (keys.d) { moveX -= Math.sin(cameraAngleX + Math.PI/2); moveZ -= Math.cos(cameraAngleX + Math.PI/2); }

    // Si le joueur bouge, on applique le mouvement et on l'oriente
    if (moveX !== 0 || moveZ !== 0) {
        playerGroup.position.x += moveX * moveSpeed;
        playerGroup.position.z += moveZ * moveSpeed;
        
        // Aligner le regard du personnage avec sa direction de marche
        playerGroup.rotation.y = Math.atan2(moveX, moveZ);
    }

    // Mise à jour de la position de la caméra autour du joueur
    camera.position.x = playerGroup.position.x + cameraRadius * Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
    camera.position.z = playerGroup.position.z + cameraRadius * Math.cos(cameraAngleX) * Math.cos(cameraAngleY);
    camera.position.y = playerGroup.position.y + cameraRadius * Math.sin(cameraAngleY) + 1; // Légèrement surélevée
    
    // La caméra regarde le personnage
    camera.lookAt(playerGroup.position.x, playerGroup.position.y + 1, playerGroup.position.z);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
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

// Le sol visuel
const floorGeo = new THREE.PlaneGeometry(200, 200);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const floorMesh = new THREE.Mesh(floorGeo, floorMat);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

const grid = new THREE.GridHelper(200, 50, 0x000000, 0xffffff);
grid.position.y = 0.01;
scene.add(grid);

// Le personnage visuel
const playerGroup = new THREE.Group();
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.2, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x0000ff }));
body.position.y = 0.6;
playerGroup.add(body);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
head.position.y = 1.35;
playerGroup.add(head);
const nose = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x333333 }));
nose.position.set(0, 1.35, 0.25);
playerGroup.add(nose);
scene.add(playerGroup);

// Un obstacle visuel (un gros bloc au milieu de la route)
const boxGeo = new THREE.BoxGeometry(4, 4, 4);
const boxMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

// ==========================================
// 2. INITIALISATION DE CANNON.JS (PHYSIQUE)
// ==========================================
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Gravité terrestre

// Sol physique
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({ mass: 0 }); // Masse 0 = objet immobile (statique)
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

// Joueur physique (une sphère ou un cylindre, ici une sphère pour glisser doucement)
const playerShape = new CANNON.Sphere(0.6);
const playerBody = new CANNON.Body({
    mass: 60, // Poids en kg
    position: new CANNON.Vec3(0, 5, 0), // Commence en l'air pour le voir tomber
    fixedRotation: true // Empêche le joueur de rouler sur lui-même
});
playerBody.addShape(playerShape);
world.addBody(playerBody);

// Obstacle physique
const boxShape = new CANNON.Box(new CANNON.Vec3(2, 2, 2)); // Moitié des dimensions de Three.js
const boxBody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, 2, -10) });
boxBody.addShape(boxShape);
world.addBody(boxBody);
boxMesh.position.set(0, 2, -10); // Aligner le visuel de l'obstacle

// ==========================================
// 3. CAMÉRA ET CONTRÔLES
// ==========================================
let cameraAngleX = 0;
let cameraAngleY = 0.3;
const cameraRadius = 5;

document.addEventListener('click', () => { document.body.requestPointerLock(); });
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        cameraAngleX -= e.movementX * 0.003;
        cameraAngleY -= e.movementY * 0.003;
        cameraAngleY = Math.max(0.05, Math.min(Math.PI / 2.5, cameraAngleY));
    }
});

const keys = { z: false, s: false, q: false, d: false };
let canJump = false;

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;
    
    // Sauter avec la barre d'espace (seulement si on touche le sol)
    if (e.key === ' ' && canJump) {
        playerBody.velocity.y = 6; // Impulsion vers le haut
        canJump = false;
    }
});
window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

// Vérifier si le joueur touche le sol pour l'autoriser à sauter
playerBody.addEventListener("collide", (e) => {
    // Si la collision vient du bas (le sol ou le dessus d'un bloc)
    if (e.contact.ni.y > 0.5) {
        canJump = true;
    }
});

// ==========================================
// 4. BOUCLE DE JEU
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);

    // Mettre à jour le monde physique (60 FPS)
    world.step(1 / 60, delta, 3);

    // Déplacement
    const moveSpeed = 7;
    let moveX = 0;
    let moveZ = 0;

    if (keys.z) { moveX += Math.sin(cameraAngleX); moveZ += Math.cos(cameraAngleX); }
    if (keys.s) { moveX -= Math.sin(cameraAngleX); moveZ -= Math.cos(cameraAngleX); }
    if (keys.q) { moveX += Math.sin(cameraAngleX + Math.PI/2); moveZ += Math.cos(cameraAngleX + Math.PI/2); }
    if (keys.d) { moveX -= Math.sin(cameraAngleX + Math.PI/2); moveZ -= Math.cos(cameraAngleX + Math.PI/2); }

    // Appliquer la vitesse sur le corps physique (en conservant la vitesse de chute Y)
    if (moveX !== 0 || moveZ !== 0) {
        playerBody.velocity.x = moveX * moveSpeed;
        playerBody.velocity.z = moveZ * moveSpeed;
        playerGroup.rotation.y = Math.atan2(moveX, moveZ);
    } else {
        // Freiner si on ne touche à rien
        playerBody.velocity.x = 0;
        playerBody.velocity.z = 0;
    }

    // COPIER la position physique sur le visuel Three.js
    playerGroup.position.copy(playerBody.position);
    // Ajustement visuel car le centre de la sphère physique est au milieu du corps
    playerGroup.position.y -= 0.3; 

    // Caméra orbitale autour du joueur
    camera.position.x = playerBody.position.x + cameraRadius * Math.sin(cameraAngleX) * Math.cos(cameraAngleY);
    camera.position.z = playerBody.position.z + cameraRadius * Math.cos(cameraAngleX) * Math.cos(cameraAngleY);
    camera.position.y = playerBody.position.y + cameraRadius * Math.sin(cameraAngleY) + 1;
    camera.lookAt(playerBody.position.x, playerBody.position.y + 0.5, playerBody.position.z);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
