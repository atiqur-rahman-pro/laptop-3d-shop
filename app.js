import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let laptopGroup, baseGroup, hingePivot, lidGroup;
let laptopBodyMaterial, screenDisplayMaterial, screenCanvas, screenCtx, screenTexture;
let currentLidAngle = 110; // degrees
let targetLidAngle = 110;

// Camera Target Presets
const cameraPresets = {
  front: { pos: new THREE.Vector3(0, 1.2, 3.2), target: new THREE.Vector3(0, 0.4, 0) },
  keyboard: { pos: new THREE.Vector3(0, 2.2, 1.2), target: new THREE.Vector3(0, 0.1, 0.2) },
  side: { pos: new THREE.Vector3(3.2, 1.0, 0.5), target: new THREE.Vector3(0, 0.4, 0) },
  top: { pos: new THREE.Vector3(0, 4.0, 0.01), target: new THREE.Vector3(0, 0, 0) }
};

let currentCamPos = cameraPresets.front.pos.clone();
let currentCamTarget = cameraPresets.front.target.clone();

// Initialize Studio Application
function init() {
  const container = document.getElementById('canvas-container');
  const canvas = document.getElementById('webgl-canvas');

  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c10);
  scene.fog = new THREE.FogExp2(0x0a0c10, 0.12);

  // 2. Camera
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.copy(currentCamPos);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // 4. OrbitControls
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2.0;
  controls.maxDistance = 7.0;
  controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go under floor
  controls.target.copy(currentCamTarget);

  // 5. Lighting
  setupLighting();

  // 6. Environment Floor & Grid
  setupEnvironment();

  // 7. Dynamic Screen Canvas
  setupScreenCanvas();

  // 8. Build 3D Laptop Model
  buildLaptopModel();

  // 9. Attach Event Listeners
  setupUIEvents();

  // 10. Hide Loader
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
  }, 500);

  // 11. Window Resize listener
  window.addEventListener('resize', onWindowResize);

  // Render Loop
  animate();
}

// Lighting Setup
function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Key Main Directional Light with Shadows
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(4, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  // Fill Light (Cool Cyan Tint)
  const fillLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
  fillLight.position.set(-4, 3, -2);
  scene.add(fillLight);

  // Rim Backlight (Purple Tint)
  const rimLight = new THREE.DirectionalLight(0x7f00ff, 1.5);
  rimLight.position.set(0, 4, -5);
  scene.add(rimLight);
}

// Floor setup with subtle reflective grid
function setupEnvironment() {
  // Shadow Receiver Plane
  const planeGeo = new THREE.PlaneGeometry(20, 20);
  const planeMat = new THREE.ShadowMaterial({ opacity: 0.4 });
  const floor = new THREE.Mesh(planeGeo, planeMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid Helper
  const grid = new THREE.GridHelper(16, 32, 0x00f2fe, 0x1f293d);
  grid.position.y = -0.012;
  scene.add(grid);
}

// Screen Canvas Generator
function setupScreenCanvas() {
  screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 640; // 16:10 aspect ratio
  screenCtx = screenCanvas.getContext('2d');

  renderWallpaper('matrix');

  screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  screenDisplayMaterial = new THREE.MeshStandardMaterial({
    map: screenTexture,
    roughness: 0.1,
    metalness: 0.1,
    emissive: 0xffffff,
    emissiveMap: screenTexture,
    emissiveIntensity: 0.85
  });
}

// Render dynamic canvas wallpapers
function renderWallpaper(type) {
  const w = screenCanvas.width;
  const h = screenCanvas.height;

  if (type === 'matrix') {
    // Cyberpunk Code Wallpaper
    screenCtx.fillStyle = '#050a14';
    screenCtx.fillRect(0, 0, w, h);

    // Neon Grid lines
    screenCtx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    screenCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      screenCtx.beginPath();
      screenCtx.moveTo(x, 0);
      screenCtx.lineTo(x, h);
      screenCtx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      screenCtx.beginPath();
      screenCtx.moveTo(0, y);
      screenCtx.lineTo(w, y);
      screenCtx.stroke();
    }

    // Glowing Header Bar / Window UI
    screenCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    screenCtx.fillRect(40, 40, w - 80, 50);
    screenCtx.fillStyle = '#ff5f56'; screenCtx.beginPath(); screenCtx.arc(65, 65, 6, 0, Math.PI * 2); screenCtx.fill();
    screenCtx.fillStyle = '#ffbd2e'; screenCtx.beginPath(); screenCtx.arc(85, 65, 6, 0, Math.PI * 2); screenCtx.fill();
    screenCtx.fillStyle = '#27c93f'; screenCtx.beginPath(); screenCtx.arc(105, 65, 6, 0, Math.PI * 2); screenCtx.fill();

    screenCtx.font = 'bold 22px "Courier New", monospace';
    screenCtx.fillStyle = '#00f2fe';
    screenCtx.fillText('// NEXUS 3D STUDIO v4.2 - CYBERPUNK ENGINE', 140, 72);

    // Code lines
    screenCtx.font = '18px "Courier New", monospace';
    const lines = [
      'const laptop = new Three.Mesh(laptopGeometry, laptopMaterial);',
      'laptop.position.set(0, 0, 0);',
      'laptop.castShadow = true;',
      'scene.add(laptop);',
      '',
      'function animate() {',
      '  requestAnimationFrame(animate);',
      '  laptop.rotation.y += 0.005; // 360 Rotation',
      '  renderer.render(scene, camera);',
      '}',
      '// READY FOR BUY NOW ACTION!'
    ];

    lines.forEach((line, i) => {
      screenCtx.fillStyle = i === lines.length - 1 ? '#10b981' : '#a5b4fc';
      screenCtx.fillText(line, 60, 140 + i * 32);
    });

    // Glowing Emblem
    const grad = screenCtx.createLinearGradient(w - 250, h - 200, w - 50, h - 50);
    grad.addColorStop(0, '#00f2fe');
    grad.addColorStop(1, '#7f00ff');
    screenCtx.fillStyle = grad;
    screenCtx.font = 'bold 70px sans-serif';
    screenCtx.fillText('NEXUS', w - 300, h - 80);

  } else if (type === 'nebula') {
    // Cosmic Nebula
    const grad = screenCtx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.2);
    grad.addColorStop(0, '#7f00ff');
    grad.addColorStop(0.5, '#4facfe');
    grad.addColorStop(1, '#050b14');
    screenCtx.fillStyle = grad;
    screenCtx.fillRect(0, 0, w, h);

    // Stars
    screenCtx.fillStyle = '#ffffff';
    for (let i = 0; i < 150; i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h;
      const sr = Math.random() * 2;
      screenCtx.beginPath();
      screenCtx.arc(sx, sy, sr, 0, Math.PI * 2);
      screenCtx.fill();
    }

    screenCtx.fillStyle = '#ffffff';
    screenCtx.font = '300 48px sans-serif';
    screenCtx.fillText('DEEP SPACE OS', 80, 120);

  } else if (type === 'minimal') {
    // Minimalist Clean OS
    const grad = screenCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    screenCtx.fillStyle = grad;
    screenCtx.fillRect(0, 0, w, h);

    // Dock at bottom
    screenCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    screenCtx.roundRect(w / 2 - 200, h - 70, 400, 50, 16);
    screenCtx.fill();

    // App icons in dock
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    colors.forEach((col, i) => {
      screenCtx.fillStyle = col;
      screenCtx.roundRect(w / 2 - 170 + i * 70, h - 60, 32, 32, 8);
      screenCtx.fill();
    });

    screenCtx.fillStyle = '#ffffff';
    screenCtx.font = '300 56px "Outfit", sans-serif';
    screenCtx.fillText('10:42 AM', w / 2 - 110, h / 2 - 20);
    screenCtx.font = '400 20px "Hind Siliguri", sans-serif';
    screenCtx.fillStyle = '#9ca3af';
    screenCtx.fillText('মঙ্গলবার, ১৮ আগস্ট ২০২৬', w / 2 - 100, h / 2 + 25);
  }

  if (screenTexture) screenTexture.needsUpdate = true;
}

// Build Procedural 3D Laptop Model
function buildLaptopModel() {
  laptopGroup = new THREE.Group();
  scene.add(laptopGroup);

  // Metallic Laptop Finish Material
  laptopBodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x1b1c20),
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1
  });

  const darkDeckMaterial = new THREE.MeshStandardMaterial({
    color: 0x141518,
    metalness: 0.3,
    roughness: 0.7
  });

  const keycapMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c0d0f,
    metalness: 0.2,
    roughness: 0.5
  });

  const trackpadMaterial = new THREE.MeshStandardMaterial({
    color: 0x22242a,
    metalness: 0.7,
    roughness: 0.3
  });

  const bezelMaterial = new THREE.MeshStandardMaterial({
    color: 0x08090b,
    roughness: 0.4
  });

  const chromeLogoMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.05
  });

  // Dimensions
  const baseW = 2.4, baseH = 0.08, baseD = 1.6;

  // ==========================================
  // 1. BASE GROUP
  // ==========================================
  baseGroup = new THREE.Group();
  laptopGroup.add(baseGroup);

  // Main Base Chassis (Rounded Box)
  const baseGeo = createRoundedBoxGeometry(baseW, baseH, baseD, 0.03);
  const baseMesh = new THREE.Mesh(baseGeo, laptopBodyMaterial);
  baseMesh.position.y = baseH / 2;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  baseGroup.add(baseMesh);

  // Keyboard Recessed Deck
  const deckGeo = new THREE.BoxGeometry(2.1, 0.005, 0.75);
  const deckMesh = new THREE.Mesh(deckGeo, darkDeckMaterial);
  deckMesh.position.set(0, baseH + 0.001, -0.22);
  baseGroup.add(deckMesh);

  // Keycaps (Generate Grid of Keys)
  const keysGroup = new THREE.Group();
  baseGroup.add(keysGroup);

  const rows = 5;
  const keyDepth = 0.12;
  const startZ = -0.52;

  for (let r = 0; r < rows; r++) {
    const zPos = startZ + r * (keyDepth + 0.02);
    let numKeys = 14;
    let keyW = 0.12;

    if (r === 4) {
      // Spacebar row
      numKeys = 7;
    }

    const startX = -((numKeys * (keyW + 0.02)) / 2) + keyW / 2;

    for (let k = 0; k < numKeys; k++) {
      let currentW = keyW;
      if (r === 4 && k === 3) currentW = 0.65; // Spacebar

      const keyGeo = createRoundedBoxGeometry(currentW, 0.015, keyDepth, 0.005);
      const keyMesh = new THREE.Mesh(keyGeo, keycapMaterial);

      const xPos = startX + k * (keyW + 0.02) + (r === 4 && k > 3 ? 0.5 : 0);
      keyMesh.position.set(xPos, baseH + 0.008, zPos);
      keysGroup.add(keyMesh);
    }
  }

  // Trackpad
  const trackpadGeo = createRoundedBoxGeometry(0.75, 0.002, 0.5, 0.02);
  const trackpadMesh = new THREE.Mesh(trackpadGeo, trackpadMaterial);
  trackpadMesh.position.set(0, baseH + 0.002, 0.4);
  baseGroup.add(trackpadMesh);

  // Rubber Feet on Bottom
  const footGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 16);
  const footMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const feetPositions = [
    [-1.0, 0.7], [1.0, 0.7], [-1.0, -0.7], [1.0, -0.7]
  ];
  feetPositions.forEach(([fx, fz]) => {
    const foot = new THREE.Mesh(footGeo, footMat);
    foot.position.set(fx, -0.005, fz);
    baseGroup.add(foot);
  });

  // Side USB-C Ports
  const portGeo = new THREE.BoxGeometry(0.01, 0.02, 0.05);
  const portMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  [-0.3, -0.1, 0.1].forEach(pz => {
    const leftPort = new THREE.Mesh(portGeo, portMat);
    leftPort.position.set(-baseW / 2 - 0.001, baseH / 2, pz);
    baseGroup.add(leftPort);

    const rightPort = new THREE.Mesh(portGeo, portMat);
    rightPort.position.set(baseW / 2 + 0.001, baseH / 2, pz);
    baseGroup.add(rightPort);
  });

  // ==========================================
  // 2. HINGE & LID GROUP
  // ==========================================
  const hingeZ = -baseD / 2 + 0.03;
  const hingeY = baseH;

  // Hinge Cylinders
  hingePivot = new THREE.Group();
  hingePivot.position.set(0, hingeY, hingeZ);
  baseGroup.add(hingePivot);

  const hingeGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.8, 16);
  hingeGeo.rotateZ(Math.PI / 2);
  const hingeMesh = new THREE.Mesh(hingeGeo, laptopBodyMaterial);
  hingePivot.add(hingeMesh);

  // Lid Group (attached to hingePivot)
  lidGroup = new THREE.Group();
  hingePivot.add(lidGroup);

  // Lid Outer Frame Mesh
  const lidH = 0.05;
  const lidGeo = createRoundedBoxGeometry(baseW, lidH, baseD, 0.03);
  // Center lid relative to hinge
  lidGeo.translate(0, lidH / 2, baseD / 2);
  const lidMesh = new THREE.Mesh(lidGeo, laptopBodyMaterial);
  lidMesh.castShadow = true;
  lidGroup.add(lidMesh);

  // Screen Bezel (Front face of lid)
  const bezelGeo = new THREE.BoxGeometry(baseW - 0.02, 0.002, baseD - 0.02);
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMaterial);
  bezelMesh.position.set(0, -0.001, baseD / 2);
  lidGroup.add(bezelMesh);

  // Display Screen Panel
  const screenW = 2.2, screenH = 1.375; // 16:10 ratio
  const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
  const screenMesh = new THREE.Mesh(screenGeo, screenDisplayMaterial);
  screenMesh.rotation.x = Math.PI / 2;
  screenMesh.position.set(0, 0.001, baseD / 2);
  lidGroup.add(screenMesh);

  // Glowing Chrome Logo on Back Cover of Lid
  const logoGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.005, 32);
  const logoMesh = new THREE.Mesh(logoGeo, chromeLogoMaterial);
  logoMesh.position.set(0, lidH + 0.002, baseD / 2);
  lidGroup.add(logoMesh);

  // Set initial Lid rotation (110 degrees open)
  setLidAngle(currentLidAngle);
}

// Helper to construct Rounded Box Geometry using ExtrudeGeometry
function createRoundedBoxGeometry(width, height, depth, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const z = -depth / 2;
  const w = width;
  const d = depth;
  const r = Math.min(radius, w / 2, d / 2);

  shape.moveTo(x + r, z);
  shape.lineTo(x + w - r, z);
  shape.quadraticCurveTo(x + w, z, x + w, z + r);
  shape.lineTo(x + w, z + d - r);
  shape.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
  shape.lineTo(x + r, z + d);
  shape.quadraticCurveTo(x, z + d, x, z + d - r);
  shape.lineTo(x, z + r);
  shape.quadraticCurveTo(x, z, x + r, z);

  const extrudeSettings = {
    depth: height,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: r * 0.4,
    bevelThickness: r * 0.4
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.rotateX(Math.PI / 2);
  geo.center();
  return geo;
}

// Lid Angle Controller
function setLidAngle(angleDeg) {
  targetLidAngle = angleDeg;
  document.getElementById('lid-angle-text').innerText = `${angleDeg}° ${angleDeg === 0 ? '(Closed)' : 'Open'}`;
  document.getElementById('lid-slider').value = angleDeg;
  document.getElementById('modal-lid-state').innerText = `${angleDeg}° ${angleDeg === 0 ? 'Closed' : 'Open'}`;
}

// UI Event Handlers
function setupUIEvents() {
  // 1. Color Customization Buttons
  const colorBtns = document.querySelectorAll('.color-btn');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const hex = btn.getAttribute('data-color');
      const name = btn.getAttribute('data-name');

      // Update 3D Material
      laptopBodyMaterial.color.set(hex);
      document.getElementById('selected-color-name').innerText = name;
      document.getElementById('modal-color-name').innerText = name;
    });
  });

  // 2. Lid Slider
  const slider = document.getElementById('lid-slider');
  slider.addEventListener('input', (e) => {
    setLidAngle(parseInt(e.target.value));
  });

  // 3. Lid Preset Buttons
  document.getElementById('btn-close-lid').addEventListener('click', () => setLidAngle(0));
  document.getElementById('btn-half-lid').addEventListener('click', () => setLidAngle(65));
  document.getElementById('btn-open-lid').addEventListener('click', () => setLidAngle(110));

  // 4. Camera View Buttons
  const camBtns = document.querySelectorAll('.cam-btn');
  camBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      camBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const camKey = btn.getAttribute('data-cam');
      if (cameraPresets[camKey]) {
        currentCamPos.copy(cameraPresets[camKey].pos);
        currentCamTarget.copy(cameraPresets[camKey].target);
      }
    });
  });

  // 5. Auto Spin Toggle
  document.getElementById('auto-spin-toggle').addEventListener('change', (e) => {
    controls.autoRotate = e.target.checked;
    controls.autoRotateSpeed = 2.0;
  });

  // 6. Wallpaper Selector
  const wpBtns = document.querySelectorAll('.wp-btn');
  wpBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      wpBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWallpaper(btn.getAttribute('data-wp'));
    });
  });

  // 7. Buy Now & Checkout Modal
  const modal = document.getElementById('checkout-modal');
  const buyBtn = document.getElementById('buy-now-btn');
  const closeBtn = document.getElementById('close-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const addCartBtn = document.getElementById('add-cart-btn');

  buyBtn.addEventListener('click', () => {
    modal.classList.add('open');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    modal.classList.remove('open');
    showToast('🎉 ধন্যবাদ! আপনার Nexus Pro 16 3D অর্ডারটি সফলভাবে গৃহীত হয়েছে!');
  });

  addCartBtn.addEventListener('click', () => {
    const badge = document.getElementById('cart-count');
    let count = parseInt(badge.innerText) + 1;
    badge.innerText = count;
    showToast('🛒 পণ্যটি আপনার শপিং কার্টে যোগ করা হয়েছে!');
  });
}

// Toast Notification Handler
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Window Resize Handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Smooth Lid Angle Lerp (Conversion deg to radians)
  currentLidAngle += (targetLidAngle - currentLidAngle) * 0.1;
  const rad = (currentLidAngle * Math.PI) / 180;
  if (lidGroup) {
    lidGroup.rotation.x = rad;
  }

  // Smooth Camera Lerp to preset view
  camera.position.lerp(currentCamPos, 0.05);
  controls.target.lerp(currentCamTarget, 0.05);

  controls.update();
  renderer.render(scene, camera);
}

// Start Application on Load
window.addEventListener('DOMContentLoaded', init);
