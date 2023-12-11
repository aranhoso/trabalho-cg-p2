import './style.css';
import * as THREE from 'https://threejs.org/build/three.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let mixer;
let isAnimationPlaying = false;
let character;

const clock = new THREE.Clock();

function createCharacter() {
  const loader = new FBXLoader();

  loader.load('./assets/modelos/gundam/Running5.fbx', (fbx) => {
    character = fbx;
    character.scale.set(0.003, 0.003, 0.003);
    character.rotation.y = Math.PI / 4;
    character.position.set(0, 0, 0);

    // Adicione o personagem à cena
    scene.add(character);

    // Verifique se há animações no modelo
    if (fbx.animations && fbx.animations.length > 0) {
      console.log('Tem animação');
      console.log(fbx.animations);

      // Inicializa o mixer
      mixer = new THREE.AnimationMixer(character);

      // Adiciona um ouvinte de eventos para a tecla W
      document.addEventListener('keydown', onKeyPress);

      // Inicia o loop de animação após a inicialização do mixer
      animate();
    }
  });
}


function loadAndPlayAnimation(animPath) {
    let animLoader = new FBXLoader();
    animLoader.load(animPath, (anim) => {
      let m = new THREE.AnimationMixer(character);
      m.clipAction(anim.animations[0]).play();
      mixer = m; // Atualize a variável global do mixer
      isAnimationPlaying = true; // Define isAnimationPlaying como falso após iniciar a animação
    });
}

let moveForward = false;

function onKeyPress(event) {
  if (event.key === 'w' || event.key === 'W') {
    moveForward = true;

    if (!isAnimationPlaying) {
      isAnimationPlaying = true;
      loadAndPlayAnimation('./assets/modelos/gundam/Running5.fbx');
    }
  }

  if (event.key === 'a' || event.key === 'A') {
    character.rotation.y += 0.05;
  }

  if (event.key === 'd' || event.key === 'D') {
    character.rotation.y -= 0.05;
  }

  if (event.key === 's' || event.key === 'S') {
    moveForward = false;
    mixer.stopAllAction();
    isAnimationPlaying = false;
  }
}

function updateCharacterMovement() {
  if (moveForward) {
    const forward = new THREE.Vector3();
    character.getWorldDirection(forward);
    character.position.add(forward.multiplyScalar(0.01));
  }
}

// CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0.5, 1, 1); // Ajuste a posição inicial da câmera

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

for (let i = 0; i < 15; i++) {
  const pointLight = new THREE.PointLight(0xffffff, 3);
  pointLight.position.set(1, 2, -i * 2);

  pointLight.intensity = 1.8;

  pointLight.castShadow = true;

  scene.add(pointLight);
}

// Chão
const blockSize = 5; // Tamanho de cada bloco
const gridRows = 10; // Número de linhas na grade
const gridCols = 10; // Número de colunas na grade

const groundGeometry = new THREE.PlaneGeometry(blockSize, blockSize);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./assets/stones.png');

const material_ground = new THREE.MeshStandardMaterial({
  map: texture,
  side: THREE.DoubleSide,
});

for (let i = 0; i < gridRows; i++) {
  for (let j = 0; j < gridCols; j++) {
    const ground = new THREE.Mesh(groundGeometry, material_ground);

    ground.position.set(j * blockSize - 10, 0 , i * blockSize - 10);

    scene.add(ground);
    ground.rotation.x = -Math.PI / 2;
  }
}


createCharacter();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.rotateSpeed = 0.5; // Ajuste a velocidade de rotação
controls.zoomSpeed = 0.5; // Ajuste a velocidade de zoom
controls.panSpeed = 0.5; // Ajuste a velocidade de panorâmica

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  // Atualize o mixer a cada quadro
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  updateCharacterMovement();

  // Atualize a posição da câmera para seguir o personagem
  if (character && camera) {
    const targetPosition = new THREE.Vector3();
    character.getWorldPosition(targetPosition);
    
    // Atualize a direção da câmera para olhar para o personagem
    camera.lookAt(targetPosition);
    
    controls.target.copy(targetPosition); // Ajuste também o ponto para onde a câmera aponta
  }

  controls.update();
  renderer.render(scene, camera);
}


animate();