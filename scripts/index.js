import * as THREE from "./threejs/three.module.js";
import { GLTFLoader } from "./threejs/GLTFLoader.js";

const container = document.querySelector('.mainView'); // this is your container (main)
const canvasEl = container; // we append renderer.domElement into this container

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFF532B);
const parallaxIntensity = 0.2;
let targetCameraX = 0;
let targetCameraY = 0;

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

// Renderer (create renderer and append its canvas inside container)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xff532b, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);
// --- Moving lights setup ---
const movingLight1 = new THREE.PointLight(0xffffff, 1, 10);
const movingLight2 = new THREE.PointLight(0xffaa33, 1, 10);

scene.add(movingLight1);
scene.add(movingLight2);

let model;
const clock = new THREE.Clock();

// Load GLTF model
const loader = new GLTFLoader();
loader.load('./assets/cosplay/Cosplay.glb',
  (gltf) => {
    model = gltf.scene;
    
    // Center model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    
    // small initial rotation (radians)
    model.rotation.y = -Math.PI / 2;
    
    scene.add(model);
    
    model.traverse(obj => {
      if (obj.isMesh) {
        obj.material.emissive = new THREE.Color(0xff532b); // warm glow color
        obj.material.emissiveIntensity = 0.3; // tweak 0.2–0.6
       }
    });
  },
  undefined,
  (error) => {
    console.error("Checking error here: ", error);
  }
);

// ---------------- Interaction logic ----------------
let isDragging = false;
let lastX = 0;
let lastY = 0;

let currentZoom = camera.position.z; // 2 initially
let lastTap = 0;

// Pinch state
let initialPinchDistance = null;
let pinchStartZoom = null;

// Inertia (optional)
let velocityX = 0;
let velocityY = 0;
const friction = 0.92;

// Utility
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Handle pointer (mouse) drag
let isPointerDown = false;
container.addEventListener('pointerdown', (e) => {
  // ignore right-click
  if (e.button !== 0) return;
  isPointerDown = true;
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  velocityX = 0;
  velocityY = 0;
  container.setPointerCapture?.(e.pointerId);
});
window.addEventListener('pointermove', (e) => {
  if (!isPointerDown || !model) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  
  // rotate model
  model.rotation.y += dx * 0.005;
  model.rotation.x += dy * 0.005;
  // clamp x rotation to avoid flipping
  model.rotation.x = clamp(model.rotation.x, -Math.PI / 4, Math.PI / 4);
  
  // store velocity
  velocityX = dx * 0.005;
  velocityY = dy * 0.005;
});
window.addEventListener('pointerup', (e) => {
  isPointerDown = false;
  isDragging = false;
  try { container.releasePointerCapture(e.pointerId); } catch (e) {}
});
const heroText = document.querySelector('.hero-text');

function updateHeroTextScale() {
  // camera.position.z goes from ~0.5 (zoomed in) to ~5 (zoomed out)
  // You can adjust this mapping
  const scale = THREE.MathUtils.mapLinear(camera.position.z, 0.5, 5, 0.7, 1.2);
  heroText.style.transform = `scale(${scale})`;
  heroText.style.transformOrigin = "center center";
}
// Mouse wheel zoom (desktop)
window.addEventListener('wheel', (e) => {
  e.preventDefault?.();
  camera.position.z += e.deltaY * 0.002;
  camera.position.z = clamp(camera.position.z, 1, 4);
  currentZoom = camera.position.z;
  updateHeroTextScale();
}, { passive: false });

// Touch handling (single unified touchstart/move/end)
container.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    const t = e.touches[0];
    const now = Date.now();
    // double-tap detection
    if (now - lastTap < 300) {
      // toggle zoom between default and a closer zoom
      const target = (currentZoom > 1.5) ? 1.2 : 2;
      camera.position.z = target;
      currentZoom = camera.position.z;
      updateHeroTextScale();
    } else {
      // start dragging
      isDragging = true;
      lastX = t.clientX;
      lastY = t.clientY;
    }
    lastTap = now;
  } else if (e.touches.length === 2) {
    // start pinch
    initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
    pinchStartZoom = camera.position.z;
  }
}, { passive: false });

container.addEventListener('touchmove', (e) => {
  // prevent page scroll while interacting
  if (e.touches.length > 0) e.preventDefault();
  
  if (e.touches.length === 1 && isDragging && model) {
    const t = e.touches[0];
    const dx = t.clientX - lastX;
    const dy = t.clientY - lastY;
    lastX = t.clientX;
    lastY = t.clientY;
    
    model.rotation.y += dx * 0.005;
    model.rotation.x += dy * 0.005;
    model.rotation.x = clamp(model.rotation.x, -Math.PI / 4, Math.PI / 4);
    
    velocityX = dx * 0.005;
    velocityY = dy * 0.005;
  } else if (e.touches.length === 2) {
    const dist = getDistance(e.touches[0], e.touches[1]);
    if (initialPinchDistance !== null && pinchStartZoom !== null) {
      const zoomFactor = initialPinchDistance / dist;
      camera.position.z = clamp(pinchStartZoom * zoomFactor, 1, 4);
    }
  }
}, { passive: false });

container.addEventListener('touchend', (e) => {
  // when finishing pinch, update currentZoom
  if (e.touches.length < 2) {
    initialPinchDistance = null;
    pinchStartZoom = null;
    currentZoom = camera.position.z;
    updateHeroTextScale();
  }
  if (e.touches.length === 0) {
    isDragging = false;
  }
});
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  targetCameraX = x * parallaxIntensity;
  targetCameraY = -y * parallaxIntensity;
});
// helper
function getDistance(a, b) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// ---------------- Animation loop ----------------
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  updateHeroTextScale();
  
  // apply inertia when user stops dragging
  if (!isDragging && model) {
    // slowly decay velocity
    if (Math.abs(velocityX) > 0.0001 || Math.abs(velocityY) > 0.0001) {
      model.rotation.y += velocityX;
      model.rotation.x += velocityY;
      model.rotation.x = clamp(model.rotation.x, -Math.PI / 4, Math.PI / 4);
      velocityX *= friction;
      velocityY *= friction;
    } else {
      velocityX = 0;
      velocityY = 0;
    }
  }
  
  // ensure renderer matches container size (handles CSS resizing)
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (renderer.domElement.width !== Math.floor(width * renderer.getPixelRatio()) ||
    renderer.domElement.height !== Math.floor(height * renderer.getPixelRatio())) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const t = performance.now() * 0.001; // time in seconds

  // orbiting motion
  movingLight1.position.set(Math.sin(t) * 3, Math.cos(t * 1.3) * 2, Math.cos(t * 0.8) * 3);
  movingLight2.position.set(Math.sin(t * 0.7) * -3, Math.cos(t * 1.1) * 1.5, Math.sin(t * 0.6) * 2);
  // Smooth parallax camera movement
  camera.position.x += (targetCameraX - camera.position.x) * 0.05;
  camera.position.y += (targetCameraY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}
animate();

// Resize window handler (keeps camera aspect correct when viewport changes)
window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// optional: keyboard zoom for quick testing
window.addEventListener('keydown', (e) => {
  if (e.key === '+' || e.key === '=') {
    camera.position.z = clamp(camera.position.z - 0.2, 1, 4);
    currentZoom = camera.position.z;
  } else if (e.key === '-' || e.key === '_') {
    camera.position.z = clamp(camera.position.z + 0.2, 1, 4);
    currentZoom = camera.position.z;
  }
});