import * as THREE from "three";
import { SHELL_COLORS, PartKey, PawVaultRig, SKY } from "./vaultGeometry";
import { buildPawVaultModel } from "./vaultModel";

export { SHELL_COLORS, SKY };
export type { PartKey, PawVaultRig };
export { buildPawVaultModel };

export interface SceneHandle {
  pivot: THREE.Group;
  explosion: THREE.Group;
  setVersion: (v: "pure" | "smart") => void;
  setDogVision: (on: boolean) => void;
  setShellColor: (hex: string) => void;
  setActive: (key: PartKey | null, amount: number) => void;
  dispose: () => void;
}

const PRESETS: Record<string, [number, number, number]> = {
  scratch: [0, 1.1, 5.2],
  lick: [3.6, 4.2, 5.4],
  seesaw: [-5.2, 2.4, 5.0],
  paddle: [3.8, 1.7, 5.6],
  wheel: [5.4, 2.0, 4.4],
  scent: [-4.4, 2.6, -5.2],
  default: [4.6, 3.4, 6.4],
};

const LOOK_Y: Record<string, number> = { lick: 2.2, scratch: 0.7 };

function sphericalOf(pos: THREE.Vector3, look: THREE.Vector3) {
  const dx = pos.x - look.x;
  const dy = pos.y - look.y;
  const dz = pos.z - look.z;
  const radius = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
  const azimuth = Math.atan2(dx, dz);
  const polar = Math.acos(THREE.MathUtils.clamp(dy / radius, -1, 1));
  return { radius, azimuth, polar };
}

export function createVaultScene(container: HTMLElement): SceneHandle {
  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd6c7b4, 2.2);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff3df, 2.2);
  key.position.set(5, 9, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const fill = new THREE.DirectionalLight(SKY, 0.55);
  fill.position.set(-6, 3, -5);
  scene.add(fill);

  const floorGeo = new THREE.CircleGeometry(7, 60);
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.32 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.35;
  floor.receiveShadow = true;
  scene.add(floor);

  const pivot = new THREE.Group();
  pivot.position.y = -0.3;
  const explosion = new THREE.Group();
  const rig = buildPawVaultModel();
  explosion.add(rig.group);
  pivot.add(explosion);
  scene.add(pivot);

  let active: PartKey | null = null;
  let explodeTarget = 0;
  let explodeCurrent = 0;
  let dogVision = false;

  const lookCurrent = new THREE.Vector3(0, 1.3, 0);
  const targetLook = new THREE.Vector3(0, 1.3, 0);

  const base = sphericalOf(new THREE.Vector3(...PRESETS.default), new THREE.Vector3(0, 1.3, 0));
  const target = { ...base };
  const current = { ...base };

  let userYaw = 0;
  let dragging = false;
  let lastX = 0;

  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    userYaw += (e.clientX - lastX) * 0.005;
    lastX = e.clientX;
  };
  const onPointerUp = () => {
    dragging = false;
  };

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let visible = true;
  let raf = 0;
  let time = 0;

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) start();
    },
    { threshold: 0.05 },
  );
  io.observe(container);

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);

  const minRadius = () => {
    const half = THREE.MathUtils.degToRad(camera.fov * 0.5);
    return Math.max(3.6, 1.95 / Math.sin(half) / Math.min(1, camera.aspect));
  };

  const clampPolar = (p: number) => THREE.MathUtils.clamp(p, 0.25, 1.42);

  function setTargetFor(keyName: string) {
    const pos = new THREE.Vector3(...(PRESETS[keyName] ?? PRESETS.default));
    let ly = LOOK_Y[keyName] ?? (keyName === "default" ? 1.3 : 1.4);
    if (explodeTarget > 0.5) ly += 0.75;
    const look = new THREE.Vector3(0, ly, 0);
    const s = sphericalOf(pos, look);
    target.radius = s.radius;
    if (explodeTarget > 0.5) target.radius += 1.9;
    target.azimuth = s.azimuth;
    target.polar = clampPolar(s.polar);
    targetLook.copy(look);
  }

  setTargetFor("default");

  function applyCamera() {
    const az = current.azimuth + userYaw;
    const sp = Math.sin(current.polar);
    camera.position.set(
      lookCurrent.x + current.radius * sp * Math.sin(az),
      lookCurrent.y + current.radius * Math.cos(current.polar),
      lookCurrent.z + current.radius * sp * Math.cos(az),
    );
    camera.lookAt(lookCurrent);
  }

  function start() {
    if (raf) return;
    if (prefersReduced) {
      applyCamera();
      rig.updateMechanisms(0, active, explodeCurrent);
      renderer.render(scene, camera);
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function loop() {
    raf = 0;
    if (!visible) return;
    time += 1 / 60;

    const k = 0.08;
    current.radius += (Math.max(target.radius, minRadius()) - current.radius) * k;
    const dAz = Math.atan2(
      Math.sin(target.azimuth - current.azimuth),
      Math.cos(target.azimuth - current.azimuth),
    );
    current.azimuth += dAz * k;
    current.polar += (clampPolar(target.polar) - current.polar) * k;
    lookCurrent.lerp(targetLook, k);

    explodeCurrent += (explodeTarget - explodeCurrent) * k;

    applyCamera();

    rig.updateMechanisms(time, active, explodeCurrent);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }

  start();

  return {
    pivot,
    explosion,
    setVersion(v) {
      rig.setVersion?.(v);
    },
    setDogVision(on) {
      dogVision = on;
      rig.setDogVision?.(on);
    },
    setShellColor(hex) {
      rig.setShellColor?.(hex);
    },
    setActive(k, amount) {
      active = k;
      explodeTarget = amount;
      const meshes = rig.highlightMeshes ?? [];
      for (const hm of meshes) {
        const mat = hm.mesh?.material as THREE.MeshStandardMaterial | undefined;
        if (mat && "emissive" in mat) {
          const on = k !== null && hm.part === k;
          if (on) mat.emissive.copy(hm.base).multiplyScalar(0.35);
          else mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = on ? 0.6 * amount + 0.15 : 0;
        }
      }
      setTargetFor(k ?? "default");
      if (prefersReduced) {
        current.radius = Math.max(target.radius, minRadius());
        current.azimuth = target.azimuth;
        current.polar = clampPolar(target.polar);
        lookCurrent.copy(targetLook);
        explodeCurrent = explodeTarget;
        applyCamera();
        rig.updateMechanisms(0, active, explodeCurrent);
        renderer.render(scene, camera);
      }
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      rig.disposeTextures();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
