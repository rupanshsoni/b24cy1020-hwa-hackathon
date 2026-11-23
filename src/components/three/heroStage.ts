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

export function createHeroStage(
  container: HTMLElement,
  options?: { onFirstFrame?: () => void },
): HeroStageHandle {
  const width = container.clientWidth || 1;
  const height = container.clientHeight || 1;
  const initialAspect = width / height;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(initialAspect < 0.9 ? 56 : 40, initialAspect, 0.1, 100);
  camera.position.set(-0.45, 1.78, 7.95);

  // Studio lighting: balanced hemisphere + warm key + cool sky rim + gentle front bounce fill
  const hemi = new THREE.HemisphereLight(0xfffaf2, 0x3d594c, 1.7);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff2dc, 2.45);
  key.position.set(4.5, 8.5, 6.5);
  key.target.position.set(1.2, 1.1, 0.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -5.2;
  key.shadow.camera.right = 5.2;
  key.shadow.camera.top = 5.2;
  key.shadow.camera.bottom = -5.2;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  scene.add(key.target);

  const rim = new THREE.DirectionalLight(0x7ec8f2, 1.15);
  rim.position.set(-5.5, 4.5, -4.5);
  scene.add(rim);

  const fill = new THREE.DirectionalLight(0xffe8cc, 0.82);
  fill.position.set(-2.8, 1.1, 6.0);
  scene.add(fill);

  const disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];
  const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const shadowMat = track(new THREE.ShadowMaterial({ opacity: 0.26 }));
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(28, 28)), shadowMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // Soft radial contact shadow discs under both PawVault and Dog
  const createContactShadowTexture = (): THREE.CanvasTexture => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
    grad.addColorStop(0, "rgba(8, 24, 20, 0.42)");
    grad.addColorStop(0.55, "rgba(8, 24, 20, 0.18)");
    grad.addColorStop(1, "rgba(8, 24, 20, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  const contactTex = track(createContactShadowTexture());
  const discMat = track(
    new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
    }),
  );
  const discGeo = track(new THREE.CircleGeometry(1, 48));
  const makeDisc = (x: number, z: number, r: number): THREE.Mesh => {
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(x, 0.005, z);
    disc.scale.setScalar(r);
    scene.add(disc);
    return disc;
  };

  const VAULT_X = 2.3;
  const VAULT_Z = -0.15;
  const DOG_X = 0.18;
  const DOG_Z = 1.12;

  makeDisc(VAULT_X, VAULT_Z, 1.65);
  const dogDisc = makeDisc(DOG_X, DOG_Z - 0.06, 0.78);
  const doorDisc = makeDisc(-1.55, -4.4, 1.28);
  doorDisc.scale.set(1.35, 0.85, 1);

  // Grounded architectural doorway for Beat 0 ("Door Closes") with warm threshold plinth & pine depth
  const plinthMat = track(new THREE.MeshStandardMaterial({ color: 0xd6cebe, roughness: 0.86, metalness: 0.02 }));
  const sillMat = track(new THREE.MeshStandardMaterial({ color: 0xe6dfd1, roughness: 0.78, metalness: 0.03 }));
  const frameMat = track(new THREE.MeshStandardMaterial({ color: 0x244d43, roughness: 0.76, metalness: 0.04 }));
  const trimMat = track(new THREE.MeshStandardMaterial({ color: 0x35665a, roughness: 0.72, metalness: 0.04 }));
  const interiorMat = track(new THREE.MeshStandardMaterial({ color: 0x0b221d, roughness: 0.95, metalness: 0.0 }));
  const doorMat = track(new THREE.MeshStandardMaterial({ color: 0x487a6d, roughness: 0.62, metalness: 0.05 }));
  const doorPanelMat = track(new THREE.MeshStandardMaterial({ color: 0x3d6b5f, roughness: 0.68, metalness: 0.04 }));
  const knobMat = track(new THREE.MeshStandardMaterial({ color: 0xe8c15a, roughness: 0.28, metalness: 0.78 }));

  const doorway = new THREE.Group();
  doorway.position.set(-1.55, 0, -4.4);

  // Warm threshold plinth & sill resting cleanly on y = 0
  const plinth = new THREE.Mesh(track(new THREE.BoxGeometry(1.86, 0.07, 0.48)), plinthMat);
  plinth.position.set(0, 0.035, 0.06);
  plinth.receiveShadow = true;
  const sill = new THREE.Mesh(track(new THREE.BoxGeometry(1.58, 0.04, 0.32)), sillMat);
  sill.position.set(0, 0.09, 0.02);
  sill.receiveShadow = true;

  // Deep pine architectural jambs, header, inner trim & recessed interior backing
  const jambGeo = track(new THREE.BoxGeometry(0.18, 2.56, 0.28));
  const headerGeo = track(new THREE.BoxGeometry(1.6, 0.18, 0.28));
  const leftJamb = new THREE.Mesh(jambGeo, frameMat);
  leftJamb.position.set(-0.71, 1.39, 0);
  const rightJamb = new THREE.Mesh(jambGeo, frameMat);
  rightJamb.position.set(0.71, 1.39, 0);
  const header = new THREE.Mesh(headerGeo, frameMat);
  header.position.set(0, 2.66, 0);

  const innerJambGeo = track(new THREE.BoxGeometry(0.04, 2.46, 0.22));
  const innerLeft = new THREE.Mesh(innerJambGeo, trimMat);
  innerLeft.position.set(-0.61, 1.34, 0.01);
  const innerRight = new THREE.Mesh(innerJambGeo, trimMat);
  innerRight.position.set(0.61, 1.34, 0.01);
  const innerHeader = new THREE.Mesh(track(new THREE.BoxGeometry(1.26, 0.04, 0.22)), trimMat);
  innerHeader.position.set(0, 2.55, 0.01);

  const interiorBack = new THREE.Mesh(track(new THREE.BoxGeometry(1.22, 2.46, 0.04)), interiorMat);
  interiorBack.position.set(0, 1.34, -0.12);

  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.59, 0.11, 0.02);
  const door = new THREE.Mesh(track(new THREE.BoxGeometry(1.18, 2.42, 0.065)), doorMat);
  door.position.set(0.59, 1.21, 0);
  door.castShadow = true;
  const upperInset = new THREE.Mesh(track(new THREE.BoxGeometry(0.82, 0.92, 0.075)), doorPanelMat);
  upperInset.position.set(0.59, 1.72, 0);
  const lowerInset = new THREE.Mesh(track(new THREE.BoxGeometry(0.82, 0.78, 0.075)), doorPanelMat);
  lowerInset.position.set(0.59, 0.66, 0);
  const knob = new THREE.Mesh(track(new THREE.SphereGeometry(0.042, 14, 12)), knobMat);
  knob.position.set(1.04, 1.12, 0.055);
  doorPivot.add(door, upperInset, lowerInset, knob);

  doorway.add(
    plinth,
    sill,
    leftJamb,
    rightJamb,
    header,
    innerLeft,
    innerRight,
    innerHeader,
    interiorBack,
    doorPivot,
  );
  scene.add(doorway);

  // Hero PawVault tower (y = 0..2.92; Tier 2 spans y = 0.84..1.76)
  const vaultRig = buildPawVaultModel();
  vaultRig.group.position.set(VAULT_X, 0, VAULT_Z);
  vaultRig.group.rotation.y = -0.28;
  scene.add(vaultRig.group);

  // Sculpted Golden Pup seated beside PawVault (head reaches y ~ 1.68, right near Tier 2)
  const dogRig = buildSculpturalDog();
  dogRig.root.position.set(DOG_X, 0, DOG_Z);
  dogRig.root.rotation.y = 0.42;
  scene.add(dogRig.root);

  // Tasteful ambient background spheres & smooth discs with strict clearance from PawVault & Dog
  const floaters: Floater[] = [];
  const sphereGeo = track(new THREE.SphereGeometry(0.15, 24, 18));
  const discPropGeo = track(new THREE.CylinderGeometry(0.19, 0.19, 0.045, 28));
  const propMats = {
    sky: track(new THREE.MeshStandardMaterial({ color: SKY, roughness: 0.58, metalness: 0.04 })),
    mint: track(new THREE.MeshStandardMaterial({ color: MINT, roughness: 0.62, metalness: 0.03 })),
    blush: track(new THREE.MeshStandardMaterial({ color: BLUSH, roughness: 0.62, metalness: 0.03 })),
    butter: track(new THREE.MeshStandardMaterial({ color: BUTTER, roughness: 0.55, metalness: 0.05 })),
  };

  const addFloater = (
    mesh: THREE.Mesh,
    x: number,
    y: number,
    z: number,
    scale: number,
    index: number,
  ): void => {
    mesh.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    mesh.castShadow = false;
    scene.add(mesh);
    floaters.push({
      mesh,
      baseX: x,
      baseY: y,
      baseZ: z,
      baseRot: index * 0.85,
      phase: index * 0.92,
      speed: 0.48 + (index % 4) * 0.07,
      depth: z,
      spin: 0.18 + (index % 3) * 0.08,
    });
  };

  // All positioned in background / upper-right periphery (>= 2.8m from PawVault, >= 3.2m from Dog)
  addFloater(new THREE.Mesh(sphereGeo, propMats.sky), 4.75, 2.95, -2.15, 1.0, 0);
  addFloater(new THREE.Mesh(sphereGeo, propMats.mint), 4.45, 1.35, -2.55, 0.88, 1);
  addFloater(new THREE.Mesh(sphereGeo, propMats.blush), 0.65, 3.45, -2.65, 0.82, 2);
  addFloater(new THREE.Mesh(sphereGeo, propMats.butter), 3.85, 3.75, -2.35, 0.76, 3);
  addFloater(new THREE.Mesh(discPropGeo, propMats.mint), 4.85, 2.15, -2.75, 0.95, 4);
  addFloater(new THREE.Mesh(discPropGeo, propMats.sky), -0.45, 3.05, -3.05, 0.88, 5);

  const ringGeo = track(new THREE.RingGeometry(0.9, 1.0, 56));
  const ringMat = track(
    new THREE.MeshBasicMaterial({
      color: MINT,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  const rings: RingCue[] = [];
  for (let i = 0; i < 4; i += 1) {
    const ring = new THREE.Mesh(ringGeo, track(ringMat.clone()));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(VAULT_X, 0.02, VAULT_Z);
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
  let firstFrameDone = false;
  const clock = new THREE.Clock();
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedMotionQuery.matches;

  // Framed so both full PawVault and larger Dog sit cleanly in center-right / right without overlapping left headline
  const cameraPath = [
    { pos: new THREE.Vector3(-0.45, 1.78, 7.95), look: new THREE.Vector3(-0.08, 1.4, 0.0) },
    { pos: new THREE.Vector3(0.45, 2.0, 7.25), look: new THREE.Vector3(0.12, 1.46, 0.1) },
    { pos: new THREE.Vector3(0.95, 2.16, 6.95), look: new THREE.Vector3(0.18, 1.48, 0.12) },
    { pos: new THREE.Vector3(-0.55, 1.88, 7.75), look: new THREE.Vector3(-0.12, 1.42, 0.1) },
  ];
  const posCurve = new THREE.CatmullRomCurve3(
    cameraPath.map((k) => k.pos),
    false,
    "centripetal",
  );
  const lookCurve = new THREE.CatmullRomCurve3(
    cameraPath.map((k) => k.look),
    false,
    "centripetal",
  );
  const lookTarget = new THREE.Vector3().copy(cameraPath[0].look);

  const sampleCamera = (p: number, outPos: THREE.Vector3, outLook: THREE.Vector3): void => {
    const clamped = Math.min(Math.max(p, 0), 1);
    posCurve.getPoint(clamped, outPos);
    lookCurve.getPoint(clamped, outLook);
    if (camera.aspect < 0.9) {
      outPos.x += 1.15;
      outPos.y += 0.35;
      outPos.z += 1.35;
      outLook.x += 1.15;
      outLook.y -= 0.15;
    }
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
      const sway = reducedMotion ? 0 : Math.sin(elapsed * f.speed + f.phase) * 0.1;
      const depthFactor = THREE.MathUtils.clamp((f.depth + 3.5) / 4, 0.15, 0.65);
      f.mesh.position.y = f.baseY + sway;
      f.mesh.position.x = f.baseX + pointerX * 0.22 * depthFactor;
      f.mesh.position.z = f.baseZ - pointerY * 0.12 * depthFactor;
      f.mesh.rotation.y = f.baseRot + (reducedMotion ? 0 : elapsed * f.spin * 0.35);
      f.mesh.rotation.x = reducedMotion ? 0 : Math.sin(elapsed * f.speed * 0.7 + f.phase) * 0.22;
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

    // Subtle beat-driven lean/shift toward the PawVault during Beats 1-2
    const lean = reducedMotion
      ? 0
      : Math.sin(THREE.MathUtils.clamp((progress - 0.12) / 0.72, 0, 1) * Math.PI);
    dogRig.root.position.x = DOG_X + lean * 0.12;
    dogRig.root.position.z = DOG_Z - lean * 0.07;
    dogRig.root.rotation.y = 0.42 + lean * 0.18;
    dogDisc.position.set(dogRig.root.position.x, 0.005, dogRig.root.position.z - 0.06);

    applyDogPose(dogRig, progress, elapsed, reducedMotion);
    vaultRig.updateMechanisms(elapsed, activePart, 0);

    sampleCamera(progress, tempPos, tempLook);
    const parX = reducedMotion ? 0 : pointerX * 0.32;
    const parY = reducedMotion ? 0 : pointerY * 0.2;
    const camAlpha = reducedMotion ? 1 : Math.min(1, delta * 5.5);
    const lookAlpha = reducedMotion ? 1 : Math.min(1, delta * 6.5);
    camera.position.lerp(tempPos, camAlpha);
    camera.position.x += parX * 0.05;
    camera.position.y += parY * 0.05;
    lookTarget.lerp(tempLook, lookAlpha);
    camera.lookAt(lookTarget);

    renderer.render(scene, camera);
    if (!firstFrameDone) {
      firstFrameDone = true;
      options?.onFirstFrame?.();
      (window as Window & { __pawvaultHeroReady?: boolean }).__pawvaultHeroReady = true;
      window.dispatchEvent(new CustomEvent("pawvault:hero-ready"));
    }
  };

  const resize = (): void => {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    const aspect = w / h;
    camera.aspect = aspect;
    camera.fov = aspect < 0.9 ? 56 : 40;
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

  const ro = new ResizeObserver(resize);
  ro.observe(container);

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
      if (clock.elapsedTime < 0.15) {
        progress = targetProgress;
        sampleCamera(progress, camera.position, lookTarget);
        camera.lookAt(lookTarget);
      }
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
      ro.disconnect();
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
      dogRig.disposeTextures();
      vaultRig.disposeTextures();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
