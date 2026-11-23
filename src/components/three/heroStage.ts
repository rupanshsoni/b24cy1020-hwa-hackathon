import * as THREE from "three";
import { buildPawVaultModel } from "./vaultScene";
import { buildSculpturalDog, applyDogPose } from "./dogBuilder";
import { SKY, BUTTER, BLUSH, MINT, PartKey } from "./vaultGeometry";

export interface HeroStageHandle {
  setProgress(p: number): void;
  setPointer(nx: number, ny: number): void;
  setVisible(v: boolean): void;
  dispose(): void;
}

type Floater = {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  baseRot: number;
  phase: number;
  speed: number;
  depth: number;
  spin: number;
};

type RingCue = {
  mesh: THREE.Mesh;
  phase: number;
};

export function createHeroStage(container: HTMLElement): HeroStageHandle {
  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0.2, 1.6, 6.2);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x1a473e, 1.9);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff3df, 2.3);
  key.position.set(4, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.0008;
  scene.add(key);

  const rim = new THREE.DirectionalLight(SKY, 0.9);
  rim.position.set(-6, 4, -4);
  scene.add(rim);

  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const shadowMat = track(new THREE.ShadowMaterial({ opacity: 0.28 }));
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(28, 28)), shadowMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  const discMat = track(new THREE.MeshBasicMaterial({ color: 0x0f2a24, transparent: true, opacity: 0.16, depthWrite: false }));
  const discGeo = track(new THREE.CircleGeometry(1, 40));
  const makeDisc = (x: number, z: number, r: number): THREE.Mesh => {
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(x, 0.006, z);
    disc.scale.setScalar(r);
    scene.add(disc);
    return disc;
  };
  makeDisc(1.85, 0.1, 0.95);
  makeDisc(0.25, 0.95, 0.72);

  const frameMat = track(new THREE.MeshStandardMaterial({ color: 0xe9efe6, roughness: 0.8, metalness: 0.05 }));
  const doorMat = track(new THREE.MeshStandardMaterial({ color: BLUSH, roughness: 0.55, metalness: 0.1 }));
  const doorway = new THREE.Group();
  doorway.position.set(-1.6, 0, -4.2);
  const jambGeo = track(new THREE.BoxGeometry(0.16, 2.6, 0.2));
  const headerGeo = track(new THREE.BoxGeometry(1.5, 0.16, 0.2));
  const leftJamb = new THREE.Mesh(jambGeo, frameMat);
  leftJamb.position.set(-0.68, 1.3, 0);
  const rightJamb = new THREE.Mesh(jambGeo, frameMat);
  rightJamb.position.set(0.68, 1.3, 0);
  const header = new THREE.Mesh(headerGeo, frameMat);
  header.position.set(0, 2.6, 0);
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.6, 0, 0);
  const door = new THREE.Mesh(track(new THREE.BoxGeometry(1.2, 2.45, 0.06)), doorMat);
  door.position.set(0.6, 1.22, 0);
  door.castShadow = true;
  doorPivot.add(door);
  doorway.add(leftJamb, rightJamb, header, doorPivot);
  scene.add(doorway);

  const vaultRig = buildPawVaultModel();
  vaultRig.group.position.set(1.85, 0, 0.1);
  vaultRig.group.rotation.y = -0.42;
  scene.add(vaultRig.group);

  const dogRig = buildSculpturalDog();
  dogRig.root.position.set(0.25, 0, 0.95);
  dogRig.root.rotation.y = 0.45;
  scene.add(dogRig.root);

  const floaters: Floater[] = [];
  const ballGeo = track(new THREE.IcosahedronGeometry(0.16, 2));
  const ballMat = track(new THREE.MeshStandardMaterial({ color: SKY, roughness: 0.35, metalness: 0.05 }));
  const biteGeo = track(new THREE.DodecahedronGeometry(0.12, 0));
  const biteMat = track(new THREE.MeshStandardMaterial({ color: 0xc79a6a, roughness: 0.85, metalness: 0 }));
  const discGeo2 = track(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 18));
  const woodMat = track(new THREE.MeshStandardMaterial({ color: 0xa9774f, roughness: 0.9, metalness: 0 }));
  const accentGeo = track(new THREE.OctahedronGeometry(0.15, 0));
  const accentMats = [
    track(new THREE.MeshStandardMaterial({ color: BUTTER, roughness: 0.4, metalness: 0.2 })),
    track(new THREE.MeshStandardMaterial({ color: BLUSH, roughness: 0.4, metalness: 0.2 })),
    track(new THREE.MeshStandardMaterial({ color: MINT, roughness: 0.4, metalness: 0.2 })),
  ];

  const addFloater = (mesh: THREE.Mesh, x: number, y: number, z: number, index: number): void => {
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    scene.add(mesh);
    floaters.push({
      mesh,
      baseX: x,
      baseY: y,
      baseZ: z,
      baseRot: Math.random() * Math.PI * 2,
      phase: index * 0.73,
      speed: 0.55 + (index % 5) * 0.08,
      depth: z,
      spin: 0.25 + (index % 4) * 0.12,
    });
  };

  for (let i = 0; i < 3; i += 1) {
    addFloater(new THREE.Mesh(ballGeo, ballMat), 2.3 + i * 0.55, 1.5 + i * 0.6, -0.4 - i * 0.7, i);
  }
  for (let i = 0; i < 5; i += 1) {
    addFloater(new THREE.Mesh(biteGeo, biteMat), 1.5 + (i % 3) * 0.8, 0.9 + i * 0.42, 0.9 - i * 0.55, 3 + i);
  }
  for (let i = 0; i < 3; i += 1) {
    addFloater(new THREE.Mesh(discGeo2, woodMat), 2.8 + i * 0.5, 2.4 - i * 0.5, -1.2 - i * 0.4, 8 + i);
  }
  for (let i = 0; i < 5; i += 1) {
    addFloater(new THREE.Mesh(accentGeo, accentMats[i % 3]), 1.2 + i * 0.62, 2.9 - (i % 2) * 0.7, -0.6 - i * 0.5, 11 + i);
  }

  const ringGeo = track(new THREE.RingGeometry(0.9, 1.0, 56));
  const ringMat = track(new THREE.MeshBasicMaterial({ color: MINT, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }));
  const rings: RingCue[] = [];
  for (let i = 0; i < 4; i += 1) {
    const ring = new THREE.Mesh(ringGeo, ringMat.clone());
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(1.85, 0.02, 0.1);
    ring.visible = false;
    scene.add(ring);
    rings.push({ mesh: ring, phase: i / 4 });
  }

  let progress = 0;
  let targetProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let raf = 0;
  let disposed = false;
  const clock = new THREE.Clock();
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedMotionQuery.matches;

  const cameraPath = [
    { pos: new THREE.Vector3(0.1, 1.75, 7.1), look: new THREE.Vector3(0.45, 1.45, 0) },
    { pos: new THREE.Vector3(0.65, 1.95, 6.6), look: new THREE.Vector3(0.75, 1.55, 0.1) },
    { pos: new THREE.Vector3(0.35, 2.05, 6.4), look: new THREE.Vector3(0.65, 1.6, 0) },
    { pos: new THREE.Vector3(-0.1, 1.85, 6.9), look: new THREE.Vector3(0.35, 1.45, 0.15) },
  ];
  const lookTarget = new THREE.Vector3().copy(cameraPath[0].look);

  const sampleCamera = (p: number, outPos: THREE.Vector3, outLook: THREE.Vector3): void => {
    const clamped = Math.min(Math.max(p, 0), 0.9999);
    const scaled = clamped * (cameraPath.length - 1);
    const i = Math.floor(scaled);
    const t = scaled - i;
    const smooth = t * t * (3 - 2 * t);
    const a = cameraPath[i];
    const b = cameraPath[Math.min(i + 1, cameraPath.length - 1)];
    outPos.lerpVectors(a.pos, b.pos, smooth);
    outLook.lerpVectors(a.look, b.look, smooth);
  };

  let activePart: PartKey = "scratch";
  const resolvePart = (p: number): PartKey => {
    if (p < 0.25) return "scratch";
    if (p < 0.5) return "lick";
    if (p < 0.75) return "paddle";
    return "scent";
  };

  const tempPos = new THREE.Vector3();
  const tempLook = new THREE.Vector3();

  const animate = (): void => {
    if (disposed) return;
    raf = window.requestAnimationFrame(animate);
    if (!visible) return;

    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;

    progress += (targetProgress - progress) * Math.min(1, delta * 6);
    activePart = resolvePart(progress);

    const easeShut = Math.min(Math.max(progress / 0.25, 0), 1);
    doorPivot.rotation.y = reducedMotion ? -0.02 : -0.02 - (1 - easeShut) * 0.95;

    for (let i = 0; i < floaters.length; i += 1) {
      const f = floaters[i];
      const sway = reducedMotion ? 0 : Math.sin(elapsed * f.speed + f.phase) * 0.12;
      const depthFactor = THREE.MathUtils.clamp((f.depth + 2) / 4, 0.15, 1);
      f.mesh.position.y = f.baseY + sway;
      f.mesh.position.x = f.baseX + pointerX * 0.28 * depthFactor;
      f.mesh.position.z = f.baseZ - pointerY * 0.16 * depthFactor;
      f.mesh.rotation.y = f.baseRot + (reducedMotion ? 0 : elapsed * f.spin * 0.35);
      f.mesh.rotation.x = reducedMotion ? 0 : Math.sin(elapsed * f.speed * 0.7 + f.phase) * 0.25;
    }

    const pulseActive = progress > 0.25 && progress < 0.75;
    for (let i = 0; i < rings.length; i += 1) {
      const cue = rings[i];
      const mat = cue.mesh.material as THREE.MeshBasicMaterial;
      if (!pulseActive) {
        cue.mesh.visible = false;
        continue;
      }
      cue.mesh.visible = true;
      const cycle = reducedMotion ? 0.5 : (elapsed * 0.35 + cue.phase) % 1;
      const s = 0.6 + cycle * 2.6;
      cue.mesh.scale.setScalar(s);
      mat.opacity = (1 - cycle) * 0.42;
    }

    if (vaultRig.led) {
      const glow = 0.6 + Math.sin(elapsed * 1.7) * 0.2 + (pulseActive ? 0.25 : 0);
      const ledMat = vaultRig.led.material as THREE.MeshStandardMaterial;
      if (ledMat && "emissiveIntensity" in ledMat) {
        ledMat.emissiveIntensity = Math.max(0, glow);
      }
    }

    applyDogPose(dogRig, progress, elapsed, reducedMotion);
    vaultRig.updateMechanisms(elapsed, activePart, 0);

    sampleCamera(progress, tempPos, tempLook);
    const parX = reducedMotion ? 0 : pointerX * 0.35;
    const parY = reducedMotion ? 0 : pointerY * 0.22;
    camera.position.lerp(tempPos, reducedMotion ? 1 : 0.08);
    camera.position.x += parX * 0.05;
    camera.position.y += parY * 0.05;
    lookTarget.lerp(tempLook, reducedMotion ? 1 : 0.1);
    camera.lookAt(lookTarget);

    renderer.render(scene, camera);
  };

  const resize = (): void => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
      }
    },
    { threshold: 0.05 },
  );
  io.observe(container);

  const onReducedChange = (): void => {
    reducedMotion = reducedMotionQuery.matches;
  };

  window.addEventListener("resize", resize);
  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", onReducedChange);
  }

  clock.start();
  animate();

  return {
    setProgress(p: number): void {
      targetProgress = Math.min(Math.max(p, 0), 1);
    },
    setPointer(nx: number, ny: number): void {
      pointerX = Math.min(Math.max(nx, -1), 1);
      pointerY = Math.min(Math.max(ny, -1), 1);
    },
    setVisible(v: boolean): void {
      visible = v;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      window.cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", onReducedChange);
      }
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry && !disposables.includes(mesh.geometry)) {
          disposables.push(mesh.geometry);
        }
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) {
          material.forEach((m) => {
            if (!disposables.includes(m)) disposables.push(m);
          });
        } else if (material && !disposables.includes(material)) {
          disposables.push(material);
        }
      });
      for (const item of disposables) {
        item.dispose();
      }
      vaultRig.disposeTextures();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
