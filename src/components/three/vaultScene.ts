import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export const SHELL_COLORS = [
  { id: "blush", name: "Blush Pink", hex: "#F6D1D8" },
  { id: "mint", name: "Seafoam Mint", hex: "#BFE3DC" },
  { id: "oat", name: "Warm Oat Cream", hex: "#FAF6F0" },
];

export type PartKey = "scratch" | "lick" | "seesaw" | "paddle" | "wheel" | "scent";

export type SceneHandle = {
  pivot: THREE.Group;
  explosion: THREE.Group;
  setVersion: (v: "pure" | "smart") => void;
  setDogVision: (on: boolean) => void;
  setShellColor: (hex: string) => void;
  setActive: (key: PartKey | null, amount: number) => void;
  dispose: () => void;
};

function mat(color: number | string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.66, metalness: 0.03, ...opts });
}

function rbox(w: number, h: number, d: number, r = 0.1) {
  return new RoundedBoxGeometry(w, h, d, 4, r);
}

const SKY = 0x4da8da;
const BUTTER = 0xf4d35e;
const CREAM = 0xf3e9d8;
const COCOA = 0x2b2623;

export function createVaultScene(container: HTMLElement): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4.6, 3.4, 6.4);
  camera.lookAt(0, 1.3, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd6c7b4, 2.2));
  const key = new THREE.DirectionalLight(0xfff3df, 2.2);
  key.position.set(5, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const fill = new THREE.DirectionalLight(SKY, 0.55);
  fill.position.set(-6, 3, -5);
  scene.add(fill);

  const pivot = new THREE.Group();
  pivot.position.y = -0.3;
  scene.add(pivot);
  const explosion = new THREE.Group();
  pivot.add(explosion);

  const shellMaterial = mat(0xbfe3dc);
  const creamMaterial = mat(CREAM);
  const skyMaterial = mat(SKY, { roughness: 0.38 });
  const butterMaterial = mat(BUTTER, { roughness: 0.45 });
  const blushMaterial = mat(0xf6d1d8);
  const darkMaterial = mat(COCOA, { roughness: 0.5 });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0.9 });
  const domeMaterial = mat(0xe4f3f0, { transparent: true, opacity: 0.7, roughness: 0.2, metalness: 0.05 });

  const partMeshes: Record<PartKey, THREE.Mesh[]> = {
    scratch: [], lick: [], seesaw: [], paddle: [], wheel: [], scent: [],
  };
  const tiers: THREE.Group[] = [];
  const smartOnly: THREE.Object3D[] = [];
  const pureOnly: THREE.Object3D[] = [];
  const highlightMeshes: { mesh: THREE.Mesh; base: THREE.Color; part: PartKey }[] = [];

  function track(mesh: THREE.Mesh, part?: PartKey, highlight = false) {
    mesh.castShadow = true;
    if (part) {
      partMeshes[part].push(mesh);
      if (highlight) highlightMeshes.push({ mesh, base: (mesh.material as THREE.MeshStandardMaterial).color.clone(), part });
    }
    return mesh;
  }

  // ---- Bottom deck: flared base with sloped front scratch pad ----
  const bottom = new THREE.Group();
  const base = track(new THREE.Mesh(rbox(2.5, 0.75, 2.1, 0.3), creamMaterial));
  base.position.y = 0.38;
  bottom.add(base);
  const flare = track(new THREE.Mesh(rbox(2.9, 0.18, 2.45, 0.1), creamMaterial));
  flare.position.y = 0.1;
  bottom.add(flare);

  const pad = track(new THREE.Mesh(rbox(1.1, 0.08, 0.85, 0.05), mat(0xf0ece2)), "scratch", true);
  pad.position.set(0, 0.22, 1.16);
  pad.rotation.x = -0.42;
  bottom.add(pad);
  const led = new THREE.Mesh(rbox(0.9, 0.09, 0.05, 0.02), glowMaterial);
  led.position.set(0, 0.44, 1.14);
  led.rotation.x = -0.42;
  bottom.add(led);
  smartOnly.push(led);

  const windup = track(new THREE.Mesh(rbox(0.34, 0.34, 0.12, 0.06), butterMaterial), "scratch", true);
  windup.position.set(-0.95, 0.62, 1.0);
  bottom.add(windup);
  pureOnly.push(windup);
  const ratchet = track(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 18), darkMaterial), "scratch");
  ratchet.position.set(-0.95, 0.62, 1.07);
  bottom.add(ratchet);
  pureOnly.push(ratchet);

  // ball funnel + loose rubber ball
  const funnel = track(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 14, 32), skyMaterial), "seesaw", true);
  funnel.position.set(-1.3, 0.66, 0.35);
  funnel.rotation.y = Math.PI / 2;
  bottom.add(funnel);
  const ball = track(new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 18), skyMaterial), "seesaw");
  ball.position.set(-1.72, 0.2, 0.55);
  bottom.add(ball);

  // butter-yellow paw paddle + sliding treat drawer
  const paddle = track(new THREE.Mesh(rbox(0.78, 0.22, 0.18, 0.09), butterMaterial), "paddle", true);
  paddle.position.set(0.15, 0.62, 1.1);
  bottom.add(paddle);
  const drawer = track(new THREE.Mesh(rbox(0.7, 0.25, 0.45, 0.06), mat(0xf6e9cf)), "paddle", true);
  drawer.position.set(0.15, 0.5, 1.38);
  bottom.add(drawer);

  // nose-spin forage wheel with treat pockets
  const wheel = new THREE.Group();
  const rim = track(new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.11, 14, 32), blushMaterial), undefined, true);
  wheel.add(rim);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const pocket = track(new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), butterMaterial), undefined);
    pocket.position.set(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0.03);
    wheel.add(pocket);
  }
  const hub = track(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 16), blushMaterial), undefined);
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);
  wheel.position.set(1.3, 0.55, 0.55);
  wheel.rotation.y = -0.5;
  bottom.add(wheel);
  wheel.traverse((o) => { if (o instanceof THREE.Mesh) partMeshes.wheel.push(o); });
  explosion.add(bottom);
  tiers.push(bottom);

  // ---- Middle tier: puzzle latches ----
  const middle = new THREE.Group();
  const midBody = track(new THREE.Mesh(rbox(2.15, 0.95, 1.8, 0.26), shellMaterial));
  midBody.position.y = 1.22;
  middle.add(midBody);
  for (const [x, z] of [[-0.65, 0.92], [0.65, 0.92], [-0.65, -0.92], [0.65, -0.92]]) {
    const latch = track(new THREE.Mesh(rbox(0.24, 0.16, 0.1, 0.04), butterMaterial));
    latch.position.set(x, 1.2, z);
    middle.add(latch);
  }
  const port = track(new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.08, 12, 26), skyMaterial), "seesaw", true);
  port.position.set(-1.08, 1.24, 0.2);
  port.rotation.y = Math.PI / 2;
  middle.add(port);
  explosion.add(middle);
  tiers.push(middle);

  // ---- Top tier: textured translucent frozen lick dome ----
  const top = new THREE.Group();
  const topBody = track(new THREE.Mesh(rbox(1.95, 0.85, 1.62, 0.24), blushMaterial));
  topBody.position.y = 2.05;
  top.add(topBody);
  const dome = track(new THREE.Mesh(new THREE.SphereGeometry(0.6, 36, 22, 0, Math.PI * 2, 0, Math.PI / 2), domeMaterial), "lick", true);
  dome.position.y = 2.47;
  top.add(dome);
  for (let i = 0; i < 5; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12 + i * 0.1, 0.012, 6, 26), mat(0xffffff, { transparent: true, opacity: 0.35 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 2.48 + i * 0.012;
    top.add(ring);
  }
  explosion.add(top);
  tiers.push(top);

  // ---- Rear sealed scent + audio bay ----
  const rear = new THREE.Group();
  const bay = track(new THREE.Mesh(rbox(0.9, 0.5, 0.16, 0.06), creamMaterial), "scent", true);
  bay.position.set(0.55, 1.22, -0.98);
  rear.add(bay);
  const vent = track(new THREE.Mesh(rbox(0.55, 0.26, 0.04, 0.02), darkMaterial), "scent", true);
  vent.position.set(0.55, 1.22, -1.08);
  rear.add(vent);
  for (let i = 0; i < 5; i++) {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 8), skyMaterial);
    hole.rotation.x = Math.PI / 2;
    hole.position.set(0.34 + i * 0.105, 1.22, -1.11);
    rear.add(hole);
  }
  const grille = track(new THREE.Mesh(rbox(0.36, 0.2, 0.04, 0.02), mat(0xd8c9b6)), "scent");
  grille.position.set(-0.3, 1.22, -1.08);
  rear.add(grille);
  explosion.add(rear);

  // internal mechanisms revealed on explode
  const internals = new THREE.Group();
  const rotor = track(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 10, 26), skyMaterial), "lick");
  rotor.position.set(0, 2.4, 0);
  rotor.rotation.x = Math.PI / 2;
  internals.add(rotor);
  const coil = track(new THREE.Mesh(new THREE.TorusKnotGeometry(0.16, 0.05, 48, 8), butterMaterial), "scratch");
  coil.position.set(0, 0.62, 0.2);
  internals.add(coil);
  explosion.add(internals);

  // ground shadow catcher
  const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 60), mat(0xf0e7d8, { roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.35;
  floor.receiveShadow = true;
  scene.add(floor);

  // lighting accents for Smart
  const accentLight = new THREE.PointLight(SKY, 1.2, 6, 2);
  accentLight.position.set(0, 0.8, 1.6);
  scene.add(accentLight);

  let currentVersion: "pure" | "smart" = "smart";
  let dogVision = false;
  let active: PartKey | null = null;
  let explodeTarget = 0;
  let explodeCurrent = 0;
  let camTarget = new THREE.Vector3(4.6, 3.4, 6.4);
  let camCurrent = camTarget.clone();
  let lookTarget = new THREE.Vector3(0, 1.3, 0);
  let lookCurrent = lookTarget.clone();
  let dragging = false;
  let lastX = 0;
  let userYaw = 0;
  let animFrame = 0;

  function setVersion(v: "pure" | "smart") {
    currentVersion = v;
    smartOnly.forEach((o) => { o.visible = v === "smart"; });
    pureOnly.forEach((o) => { o.visible = v === "pure"; });
    accentLight.intensity = v === "smart" ? 1.2 : 0;
    glowMaterial.color.setHex(v === "smart" ? SKY : 0xd8c9b6);
    glowMaterial.opacity = v === "smart" ? 0.9 : 0.55;
  }

  function applyColor() {
    const shoulder = new THREE.Color(dogVision ? 0xa8a6a2 : 0xbfe3dc);
    const blushNeutral = new THREE.Color(dogVision ? 0xb3aca6 : 0xf6d1d8);
    shellMaterial.color.copy(shoulder);
    blushMaterial.color.copy(blushNeutral);
    skyMaterial.color.setHex(dogVision ? 0x3f9fe0 : SKY);
    butterMaterial.color.setHex(dogVision ? 0xf7d23c : BUTTER);
    (domeMaterial as THREE.MeshStandardMaterial).opacity = dogVision ? 0.82 : 0.7;
  }

  function setDogVision(on: boolean) { dogVision = on; applyColor(); }
  function setShellColor(hex: string) {
    const c = new THREE.Color(hex);
    shellMaterial.color.copy(dogVision ? new THREE.Color(0xa8a6a2) : c);
    blushMaterial.color.copy(dogVision ? new THREE.Color(0xb3aca6) : c);
  }

  function setActive(key: PartKey | null, amount: number) {
    active = key;
    explodeTarget = amount;
    highlightMeshes.forEach(({ mesh, base, part }) => {
      const m = mesh.material as THREE.MeshStandardMaterial;
      const isActive = key !== null && part === key;
      if (isActive) {
        m.emissive.copy(base).multiplyScalar(0.35);
        m.emissiveIntensity = 0.9;
      } else {
        m.emissive.setHex(0x000000);
        m.emissiveIntensity = 0;
      }
    });
    const presets: Record<PartKey, [number, number, number]> = {
      scratch: [0, 1.1, 5.2], lick: [3.6, 4.2, 5.4], seesaw: [-5.2, 2.4, 5.0],
      paddle: [3.8, 1.7, 5.6], wheel: [5.4, 2.0, 4.4], scent: [-4.4, 2.6, -5.2],
    };
    if (key && presets[key]) {
      const [x, y, z] = presets[key];
      camTarget.set(x, y, z);
      lookTarget.set(0, key === "lick" ? 2.2 : key === "scratch" ? 0.7 : 1.4, 0);
    } else {
      camTarget.set(4.6, 3.4, 6.4);
      lookTarget.set(0, 1.3, 0);
    }
  }

  const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; renderer.domElement.setPointerCapture(e.pointerId); };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    userYaw += (e.clientX - lastX) * 0.008;
    lastX = e.clientX;
  };
  const onUp = () => { dragging = false; };
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointercancel", onUp);

  const onResize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  const offsets = [0, 0.62, 1.3];
  const animate = () => {
    animFrame = requestAnimationFrame(animate);
    explodeCurrent += (explodeTarget - explodeCurrent) * 0.07;
    tiers.forEach((t, i) => { t.position.y = offsets[i] * explodeCurrent; });
    internals.visible = explodeCurrent > 0.25;
    rear.position.z = -0.2 * explodeCurrent;
    wheel.rotation.z += 0.004 + explodeCurrent * 0.01;
    if (active === "paddle") drawer.position.z = 1.38 + Math.sin(performance.now() * 0.003) * 0.12;

    camCurrent.lerp(camTarget, 0.06);
    lookCurrent.lerp(lookTarget, 0.06);
    const offset = camCurrent.clone().sub(lookCurrent);
    const radius = Math.hypot(offset.x, offset.z);
    const baseAngle = Math.atan2(offset.x, offset.z);
    const angle = baseAngle + userYaw;
    camera.position.set(
      lookCurrent.x + Math.sin(angle) * radius,
      camCurrent.y,
      lookCurrent.z + Math.cos(angle) * radius,
    );
    camera.lookAt(lookCurrent);
    renderer.render(scene, camera);
  };
  setVersion("smart");
  applyColor();
  animate();

  function dispose() {
    cancelAnimationFrame(animFrame);
    ro.disconnect();
    renderer.domElement.removeEventListener("pointerdown", onDown);
    renderer.domElement.removeEventListener("pointermove", onMove);
    renderer.domElement.removeEventListener("pointerup", onUp);
    renderer.domElement.removeEventListener("pointercancel", onUp);
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach((m) => m.dispose());
      }
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
  }

  return { pivot, explosion, setVersion, setDogVision, setShellColor, setActive, dispose };
}
