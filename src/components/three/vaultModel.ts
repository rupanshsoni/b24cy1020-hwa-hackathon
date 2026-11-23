import * as THREE from "three";
import {
  BLUSH,
  BUTTER,
  CREAM,
  SKY,
  type HighlightMesh,
  type PartKey,
  type PawVaultRig,
  chamferedOctagonGeometry,
  createGritBumpTexture,
  mat,
} from "./vaultGeometry";

const DOG_BLUE = 0x3f9fe0;
const DOG_YELLOW = 0xf7d23c;
const DARK = 0x2b2623;

export function buildPawVaultModel(): PawVaultRig {
  const group = new THREE.Group();
  const m = {
    tier1: mat(BLUSH),
    tier2: mat(0xbfe3dc),
    tier3: mat(BLUSH),
    cream: mat(CREAM),
    sky: mat(SKY, { roughness: 0.38 }),
    butter: mat(BUTTER, { roughness: 0.45 }),
    blush: mat(BLUSH),
    mint: mat(0xbfe3dc),
    dark: mat(DARK, { roughness: 0.5 }),
    dome: mat(0xd8eef8, { transparent: true, opacity: 0.68, roughness: 0.22, metalness: 0.04 }),
    glow: new THREE.MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0.9 }),
  };
  const shellTinted = [m.tier1, m.tier2];
  const partMeshes: Record<PartKey, THREE.Mesh[]> = {
    scratch: [], lick: [], seesaw: [], paddle: [], wheel: [], scent: [],
  };
  const highlightMeshes: HighlightMesh[] = [];
  const smartOnly: THREE.Object3D[] = [];
  const pureOnly: THREE.Object3D[] = [];

  function track(mesh: THREE.Mesh, part?: PartKey, highlight = false) {
    mesh.castShadow = true;
    if (part) {
      partMeshes[part].push(mesh);
      if (highlight) highlightMeshes.push({
        mesh, base: (mesh.material as THREE.MeshStandardMaterial).color.clone(), part,
      });
    }
    return mesh;
  }
  function add(
    parent: THREE.Object3D, geo: THREE.BufferGeometry, material: THREE.Material,
    x: number, y: number, z: number, part?: PartKey, highlight = false,
  ) {
    const mesh = track(new THREE.Mesh(geo, material), part, highlight);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  const gritTexture = createGritBumpTexture();

  // Tier 1: flared weighted base, grille, ramp and mechanisms
  const t1 = new THREE.Group();
  const base = add(t1, chamferedOctagonGeometry({
    width: 1.25, height: 0.72, flare: 0.28, bevel: 0.12, bevelTaper: 0.16,
  }), m.tier1, 0, 0.12, 0);
  base.castShadow = true;
  add(t1, chamferedOctagonGeometry({
    width: 1.28, height: 0.1, chamfer: 0.6, bevel: 0.2,
  }), m.cream, 0, 0.06, 0);

  const grille = new THREE.InstancedMesh(new THREE.SphereGeometry(0.026, 8, 6), m.dark, 33);
  const matrix = new THREE.Matrix4();
  for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++)
    grille.setMatrixAt(r * 11 + c, matrix.makeTranslation(0.52 + c * 0.04, 0.24 + r * 0.058, 0.92 - c * 0.04));
  grille.instanceMatrix.needsUpdate = true;
  t1.add(grille);

  const ramp = add(t1, chamferedOctagonGeometry({
    width: 0.44, height: 0.56, chamfer: 0.08, bevel: 0.06, segments: 48, rings: 6,
  }), mat(0xf0ece2, { bumpMap: gritTexture, bumpScale: 0.06 }), 0, 0.02, 1.52, "scratch", true);
  ramp.rotation.x = -0.52;
  ramp.scale.set(1.15, 1, 0.35);

  const led = add(t1, new THREE.BoxGeometry(0.78, 0.05, 0.06), m.glow, 0, 0.44, 1.36);
  led.rotation.x = 0;
  smartOnly.push(led);
  const dial = add(t1, new THREE.CylinderGeometry(0.14, 0.14, 0.1, 20), m.butter, -0.76, 0.62, 0.78, "scratch", true);
  dial.rotation.x = Math.PI / 2;
  pureOnly.push(dial);
  pureOnly.push(add(t1, new THREE.TorusGeometry(0.09, 0.026, 8, 20), m.dark, -0.76, 0.62, 0.84, "scratch"));

  const paddle = add(t1, new THREE.SphereGeometry(0.16, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), m.butter, 0, 0.62, 1.08, "paddle", true);
  paddle.scale.set(1.7, 0.7, 0.5);
  const drawer = new THREE.Group();
  drawer.add(track(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.24, 0.4), m.cream), "paddle", true));
  drawer.add(track(new THREE.Mesh(new THREE.TorusKnotGeometry(0.07, 0.026, 40, 6), m.cream), "paddle"));
  drawer.children[1].position.set(0, 0.06, 0.1);
  drawer.position.set(0, 0.48, 1.08);
  t1.add(drawer);

  const wheel = new THREE.Group();
  wheel.add(track(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 12, 28), m.blush), "wheel", true));
  const hub = track(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 14), m.blush), "wheel");
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    wheel.add(track(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), m.butter), "wheel"))
      .position.set(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0.04);
  }
  wheel.position.set(1.06, 0.46, 0.18);
  wheel.rotation.set(0, -Math.PI / 2, 0.22);
  t1.add(wheel);

  const funnel = add(t1, new THREE.TorusGeometry(0.26, 0.09, 12, 28), m.sky, -1.12, 0.6, 0.42, "seesaw", true);
  funnel.rotation.y = Math.PI / 2;
  const ball = add(t1, new THREE.SphereGeometry(0.18, 22, 16), m.sky, -1.5, 0.2, 0.62, "seesaw");
  for (let i = 0; i < 4; i++)
    add(t1, new THREE.DodecahedronGeometry(0.05, 0), m.butter, -1.62 + i * 0.13, 0.06, 0.95, "seesaw");

  const rear = new THREE.Group();
  add(rear, new THREE.BoxGeometry(0.8, 0.44, 0.14), m.cream, 0.4, 0.55, -0.94, "scent", true);
  add(rear, new THREE.BoxGeometry(0.5, 0.24, 0.04), m.dark, 0.4, 0.55, -1.03, "scent");
  for (let i = 0; i < 5; i++) {
    const hole = add(rear, new THREE.CylinderGeometry(0.022, 0.022, 0.05, 8), m.sky, 0.24 + i * 0.08, 0.55, -1.07, "scent");
    hole.rotation.x = Math.PI / 2;
  }
  t1.add(rear);
  group.add(t1);

  // Tier 2: middle puzzle tier
  const t2 = new THREE.Group();
  add(t2, chamferedOctagonGeometry({ width: 1.02, height: 0.92 }), m.tier2, 0, 0.84, 0);
  add(t2, chamferedOctagonGeometry({ width: 1.05, height: 0.09, bevel: 0.2 }), m.cream, 0, 0.84, 0);
  add(t2, new THREE.TorusGeometry(0.24, 0.08, 12, 26), m.sky, 0, 1.24, 0.95, "seesaw", true);
  const handle = add(t2, new THREE.TorusGeometry(0.18, 0.045, 10, 24, Math.PI), m.butter, -1.0, 1.28, 0.2, "seesaw", true);
  handle.rotation.z = Math.PI / 2;
  add(t2, new THREE.BoxGeometry(0.1, 0.42, 0.08), m.butter, 1.0, 1.3, 0.2, "seesaw", true);
  const door = add(t2, new THREE.BoxGeometry(0.56, 0.36, 0.1), m.blush, 0.98, 1.22, 0.12, "seesaw", true);
  door.rotation.y = Math.PI / 2;
  add(t2, new THREE.SphereGeometry(0.16, 12, 10), m.butter, 1.02, 1.22, 0.22, "seesaw");
  for (const x of [-0.62, 0.62]) add(t2, new THREE.BoxGeometry(0.18, 0.12, 0.16), m.cream, x, 0.82, 0);
  void door;
  group.add(t2);

  // Tier 3: top control tier
  const t3 = new THREE.Group();
  add(t3, chamferedOctagonGeometry({ width: 0.9, height: 0.78 }), m.tier3, 0, 1.76, 0);
  add(t3, chamferedOctagonGeometry({ width: 0.94, height: 0.08, bevel: 0.2 }), m.cream, 0, 1.76, 0);
  add(t3, new THREE.BoxGeometry(0.54, 0.14, 0.02), m.dark, 0, 2.24, 0.905);
  add(t3, new THREE.BoxGeometry(0.54, 0.14, 0.02), m.dark, 0, 1.98, 0.905);
  add(t3, new THREE.BoxGeometry(0.18, 0.18, 0.08), m.mint, 0.14, 2.24, 0.94, "lick", true);
  add(t3, new THREE.BoxGeometry(0.18, 0.18, 0.08), m.butter, -0.14, 1.98, 0.94, "lick", true);
  const visorGeo = new THREE.SphereGeometry(0.22, 18, 12, 0, Math.PI, 0, Math.PI / 2);
  for (const [y, material] of [[2.18, m.sky], [1.94, m.butter]] as const) {
    const visor = add(t3, visorGeo, material, 0.86, y, 0.18, "lick", true);
    visor.rotation.z = -Math.PI / 2;
  }
  const rotary = add(t3, new THREE.CylinderGeometry(0.16, 0.16, 0.1, 20), m.sky, -0.86, 2.06, 0.18, "lick", true);
  rotary.rotation.z = Math.PI / 2;
  group.add(t3);

  // Tier 4: core, screw thread and lick dome
  const t4 = new THREE.Group();
  add(t4, chamferedOctagonGeometry({ width: 0.62, height: 0.26 }), m.cream, 0, 2.28, 0);
  add(t4, chamferedOctagonGeometry({ width: 0.88, height: 0.12, bevel: 0.22 }), m.tier3, 0, 2.54, 0);
  const thread = add(t4, new THREE.TorusKnotGeometry(0.34, 0.035, 120, 8, 1, 5), m.cream, 0, 2.42, 0);
  thread.rotation.x = Math.PI / 2;
  const dome = add(t4, new THREE.SphereGeometry(0.56, 36, 22, 0, Math.PI * 2, 0, Math.PI / 2), m.dome, 0, 2.66, 0, "lick", true);
  dome.scale.set(1, 0.46, 1);
  const nubs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), mat(0xffffff, { transparent: true, opacity: 0.5 }), 64);
  for (let ring = 0; ring < 4; ring++) {
    const phi = 0.28 + ring * 0.22;
    const radius = 0.56 * Math.sin(phi);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + ring * 0.19;
      nubs.setMatrixAt(ring * 16 + i, matrix.makeTranslation(radius * Math.cos(a), 0.56 * Math.cos(phi), radius * Math.sin(a)));
    }
  }
  nubs.instanceMatrix.needsUpdate = true;
  nubs.position.y = 2.66;
  nubs.scale.set(1, 0.46, 1);
  t4.add(nubs);
  t4.traverse((o) => { if (o instanceof THREE.Mesh) partMeshes.lick.push(o); });
  group.add(t4);

  // Internals revealed on explode
  const internals = new THREE.Group();
  const rotor = add(internals, new THREE.TorusGeometry(0.3, 0.07, 10, 26), m.sky, 0, 2.6, 0, "lick");
  rotor.rotation.x = Math.PI / 2;
  add(internals, new THREE.TorusKnotGeometry(0.14, 0.045, 48, 8), m.butter, 0, 0.62, 0.2, "scratch");
  add(internals, new THREE.BoxGeometry(0.5, 0.05, 0.16), m.butter, 0, 1.4, 0, "seesaw");
  internals.visible = false;
  group.add(internals);

  const tiers = [t1, t2, t3, t4];
  const offsets = [0, 0.7, 1.45, 2.25];
  const glow = new THREE.PointLight(SKY, 1.1, 5, 2);
  glow.position.set(0, 0.8, 1.2);
  group.add(glow);

  let version: "pure" | "smart" = "smart";
  let shellHex = "#BFE3DC";
  let dogVision = false;
  let explodeAmount = 0;

  function applyColors() {
    const chosen = new THREE.Color(shellHex);
    const mute = (c: THREE.Color) => {
      const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
      return new THREE.Color(l * 0.94, l * 0.9, l * 0.84);
    };
    const tinted = dogVision ? mute(chosen) : chosen;
    shellTinted.forEach((material) => material.color.copy(tinted));
    const contrastHex = shellHex.toUpperCase() === "#F6D1D8" ? 0xbfe3dc : 0xf6d1d8;
    const contrast = new THREE.Color(contrastHex);
    m.tier3.color.copy(dogVision ? mute(contrast) : contrast);
    m.sky.color.setHex(dogVision ? DOG_BLUE : SKY);
    m.butter.color.setHex(dogVision ? DOG_YELLOW : BUTTER);
    m.dome.opacity = dogVision ? 0.82 : 0.68;
  }
  function setVersion(v: "pure" | "smart") {
    version = v;
    smartOnly.forEach((o) => { o.visible = v === "smart"; });
    pureOnly.forEach((o) => { o.visible = v === "pure"; });
    glow.intensity = v === "smart" ? 1.1 : 0;
    m.glow.color.setHex(v === "smart" ? SKY : 0xd8c9b6);
    m.glow.opacity = v === "smart" ? 0.9 : 0.55;
  }
  function setShellColor(hex: string) { shellHex = hex; applyColors(); }
  function setDogVision(on: boolean) { dogVision = on; applyColors(); }
  function setExplode(amount: number) { explodeAmount = THREE.MathUtils.clamp(amount, 0, 1); }

  function updateMechanisms(time: number, activePart: PartKey | null, explode: number) {
    if (explode !== undefined) setExplode(explode);
    tiers.forEach((tier, i) => { tier.position.y = offsets[i] * explodeAmount; });
    rear.position.z = -0.35 * explodeAmount;
    internals.visible = explodeAmount > 0.25;
    wheel.rotation.z = time * (activePart === "wheel" ? 1.6 : 0.2);
    ball.position.y = 0.2 + Math.sin(time * 1.4) * 0.04;
    drawer.position.z = activePart === "paddle" ? 1.08 + Math.sin(time * 4) * 0.14 : 1.08;
    if (version === "pure") dial.rotation.y = time * 0.6;
  }
  function disposeTextures() { gritTexture.dispose(); }

  setVersion("smart");
  applyColors();

  return {
    group, tiers, rear, internals, wheel, drawer, paddle, ball, dome, led, glow,
    highlightMeshes, partMeshes, setVersion, setShellColor, setDogVision,
    setExplode, updateMechanisms, disposeTextures,
  };
}
