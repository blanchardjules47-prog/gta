// 1. Initialisation de la Scène, de la Caméra et du Moteur de Rendu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Un ciel bleu

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Ajout de la Lumière (comme le soleil)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7).normalize();
scene.add(light);

// 3. Création du Sol (la ville)
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2; // On l'allonge à plat
scene.add(floor);

// 4. Création du Joueur (un cube temporaire)
const playerGeometry = new THREE.BoxGeometry(1, 2, 1); // Dimensions proches d'un humain
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 1; // On le place juste au-dessus du sol
scene.add(player);

// Position initiale de la caméra (derrière le joueur)
camera.position.set(0, 5, 10);
camera.lookAt(player.position);

// 5. Gestion des mouvements du joueur
const keys = { z: false, s: false, q: false, d: false };

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false;
});

// 6. Boucle d'animation (Le jeu tourne ici en continu)
function animate() {
    requestAnimationFrame(animate);

    // Déplacement du joueur selon les touches enfoncées
    const speed = 0.1;
    if (keys.z) player.position.z -= speed; // Avancer
    if (keys.s) player.position.z += speed; // Reculer
    if (keys.q) player.position.x -= speed; // Gauche
    if (keys.d) player.position.x += speed; // Droite

    // Faire suivre la caméra derrière le joueur
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 10;
    camera.position.y = player.position.y + 4;
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}

// Lancement du jeu
animate();

// Ajuster la taille de la fenêtre si l'utilisateur redimensionne l'écran
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
