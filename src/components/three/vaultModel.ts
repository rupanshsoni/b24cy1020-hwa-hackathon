import * as THREE from "three";
import {
  BLUSH,
  BUTTER,
  CREAM,
  MINT,
  SKY,
  type HighlightMesh,
  type PartKey,
  type PawVaultRig,
  archFrameGeometry,
  beveledFrameGeometry,
  boneChewGeometry,
  chamferedOctagonShellGeometry,
  conicalFunnelGeometry,
  createVaultTextures,
  curvedVisorGeometry,
  helicalThreadGeometry,
  kibbleWheelGeometry,
  openDrawerGeometry,
  roundedBlockGeometry,
  scallopedDialGeometry,
  scratchRampGeometry,
  tier1FaceDistance,
  tier1FaceSlope,
  uHandleGeometry,
} from "./vaultGeometry";

const DOG_BLUE = 0x3f9fe0;
const DOG_YELLOW = 0xf7d23c;
const DARK = 0x231f1d;

export function buildPawVaultModel(): PawVaultRig {
  const group = new THREE.Group();
  const tex = createVaultTextures();

  const siliconeMat = (
    color: number | string,
    opts: Partial<THREE.MeshStandardMaterialParameters> = {},
  ) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.72,
      metalness: 0.02,
      bumpMap: tex.siliconeBump,
      bumpScale: 0.004,
      roughnessMap: tex.siliconeRoughness,
      ...opts,
    });

  const satinMat = (
    color: number | string,
    opts: Partial<THREE.MeshPhysicalMaterialParameters> = {},
  ) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.42,
      metalness: 0.02,
      clearcoat: 0.16,
      clearcoatRoughness: 0.38,
      bumpMap: tex.satinBump,
      bumpScale: 0.0025,
      roughnessMap: tex.satinRoughness,
      ...opts,
    });

  const m = {
    tier1: siliconeMat(MINT),
    tier2: siliconeMat(MINT),
    tier3: siliconeMat(BLUSH),
    cream: siliconeMat(CREAM),
    blush: siliconeMat(BLUSH),
    mint: siliconeMat(MINT),
    recessDark: new THREE.MeshStandardMaterial({
      color: DARK,
      roughness: 0.88,
      metalness: 0.02,
    }),
    recessPink: siliconeMat(0xd9aeb7, { roughness: 0.8 }),
    recessMint: siliconeMat(0x98bfb7, { roughness: 0.8 }),
    // Per-part highlightable materials so highlighting one PartKey never bleeds into another
    skySeesaw: satinMat(SKY),
    butterSeesaw: satinMat(BUTTER),
    blushSeesaw: siliconeMat(BLUSH, { roughness: 0.58 }),
    butterPaddle: satinMat(BUTTER),
    mintPaddle: siliconeMat(MINT),
    blushWheel: siliconeMat(BLUSH, { roughness: 0.58 }),
    skyLick: satinMat(SKY),
    butterLick: satinMat(BUTTER),
    mintLick: siliconeMat(MINT, { roughness: 0.56 }),
    creamScratch: siliconeMat(0xefe6d6, { roughness: 0.78 }),
    gritPad: new THREE.MeshStandardMaterial({
      color: 0xf7f0e4,
      map: tex.gritMap,
      bumpMap: tex.gritBump,
      bumpScale: 0.022,
      roughnessMap: tex.gritRoughness,
      roughness: 0.94,
      metalness: 0.0,
    }),
    creamScent: siliconeMat(CREAM),
    skyScent: satinMat(SKY),
    kibble: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex.kibbleMap,
      bumpMap: tex.kibbleBump,
      bumpScale: 0.024,
      roughnessMap: tex.kibbleRoughness,
      roughness: 0.88,
      metalness: 0.0,
    }),
    bone: new THREE.MeshStandardMaterial({
      color: 0xd8b48a,
      map: tex.kibbleMap,
      bumpMap: tex.kibbleBump,
      bumpScale: 0.016,
      roughnessMap: tex.kibbleRoughness,
      roughness: 0.84,
      metalness: 0.0,
    }),
    timerFace: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex.timerDialMap,
      roughness: 0.62,
      metalness: 0.02,
    }),
    dome: new THREE.MeshPhysicalMaterial({
      color: 0xeaf4f8,
      transparent: true,
      opacity: 0.74,
      roughness: 0.3,
      metalness: 0.0,
      clearcoat: 0.22,
      clearcoatRoughness: 0.45,
      sheen: 0.45,
      sheenRoughness: 0.55,
      sheenColor: new THREE.Color(0xffffff),
      bumpMap: tex.domeBump,
      bumpScale: 0.003,
      roughnessMap: tex.domeRoughness,
    }),
    nubs: new THREE.MeshPhysicalMaterial({
      color: 0xf4f9fc,
      transparent: true,
      opacity: 0.84,
      roughness: 0.22,
      metalness: 0.0,
      sheen: 0.5,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color(0xffffff),
    }),
    led: new THREE.MeshStandardMaterial({
      color: 0xdaf4ff,
      emissive: new THREE.Color(SKY),
      emissiveIntensity: 0.95,
      roughness: 0.25,
      metalness: 0.0,
      transparent: true,
      opacity: 0.95,
    }),
  };

  const shellTinted = [m.tier1, m.tier2, m.mintPaddle];
  const contrastTinted = [m.tier3, m.blush, m.blushWheel, m.blushSeesaw];
  const partMeshes: Record<PartKey, THREE.Mesh[]> = {
    scratch: [],
    lick: [],
    seesaw: [],
    paddle: [],
    wheel: [],
    scent: [],
  };
  const highlightMeshes: HighlightMesh[] = [];
  const smartOnly: THREE.Object3D[] = [];
  const pureOnly: THREE.Object3D[] = [];

  function track(mesh: THREE.Mesh, part?: PartKey, highlight = false) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (part) {
      partMeshes[part].push(mesh);
      if (highlight) {
        highlightMeshes.push({
          mesh,
          base: (mesh.material as THREE.MeshStandardMaterial).color.clone(),
          part,
        });
      }
    }
    return mesh;
  }

  function add(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    part?: PartKey,
    highlight = false,
  ) {
    const mesh = track(new THREE.Mesh(geo, material), part, highlight);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  const kibbleGeo = new THREE.DodecahedronGeometry(0.036, 1);
  kibbleGeo.scale(1.18, 0.72, 0.96);

  function addKibbleCluster(
    parent: THREE.Object3D,
    positions: Array<[number, number, number, number]>,
    part?: PartKey,
  ) {
    for (const [kx, ky, kz, rot] of positions) {
      const k = add(parent, kibbleGeo, m.kibble, kx, ky, kz, part);
      k.rotation.set(rot * 0.7, rot, rot * 0.4);
    }
  }

  // ============================================================================
  // TIER 1 (y = 0.00 to 0.88): Flared base, arch alcove, ramp, paddle/drawer,
  // 6-spoke kibble wheel, speaker grille, left funnel + floor ball/kibble, rear bay
  // ============================================================================
  const t1 = new THREE.Group();
  const t1Width = 1.08;
  const t1Chamfer = t1Width * 0.46;
  const t1YStart = 0.135;
  const t1Height = 0.745;
  const t1Flare = 0.26;
  const t1FlarePow = 2.2;

  // Warm Cream bottom rim (y = 0.00 to 0.145) with front arch cutout
  add(
    t1,
    chamferedOctagonShellGeometry({
      width: 1.34,
      height: 0.145,
      chamfer: 1.34 * 0.46,
      bevel: 0.22,
      bevelTaper: 0.06,
      flare: 0.035,
      flarePower: 1.5,
      segments: 192,
      rings: 16,
      recesses: [
        {
          angle: Math.PI / 2,
          yCenter: 0.08,
          halfW: 0.38,
          halfH: 0.22,
          depth: 0.36,
          shape: "arch",
          edgeSoftness: 0.02,
        },
      ],
    }),
    m.cream,
    0,
    0,
    0,
  );

  // Seafoam Mint flared base (y = 0.135 to 0.88) with carved recesses & hollow top well
  add(
    t1,
    chamferedOctagonShellGeometry({
      width: t1Width,
      height: t1Height,
      chamfer: t1Chamfer,
      bevel: 0.08,
      bevelTaper: 0.05,
      flare: t1Flare,
      flarePower: t1FlarePow,
      segments: 192,
      rings: 44,
      topWell: { inset: 0.24, depth: 0.22, rimBevel: 0.03 },
      recesses: [
        {
          angle: Math.PI / 2,
          yCenter: 0.06,
          halfW: 0.38,
          halfH: 0.21,
          depth: 0.36,
          shape: "arch",
          edgeSoftness: 0.02,
        },
        {
          angle: Math.PI / 2,
          yCenter: 0.46,
          halfW: 0.34,
          halfH: 0.12,
          cornerRadius: 0.11,
          depth: 0.14,
          shape: "roundRect",
          edgeSoftness: 0.022,
        },
        {
          angle: Math.PI / 4,
          yCenter: 0.31,
          halfW: 0.3,
          halfH: 0.3,
          depth: 0.14,
          shape: "circle",
          edgeSoftness: 0.022,
        },
        {
          angle: (3 * Math.PI) / 4,
          yCenter: 0.33,
          halfW: 0.24,
          halfH: 0.27,
          depth: 0.22,
          shape: "circle",
          edgeSoftness: 0.022,
        },
        {
          angle: -Math.PI / 2,
          yCenter: 0.38,
          halfW: 0.38,
          halfH: 0.2,
          cornerRadius: 0.06,
          depth: 0.09,
          shape: "roundRect",
          edgeSoftness: 0.022,
        },
      ],
    }),
    m.tier1,
    0,
    t1YStart,
    0,
  );

  // Blush Pink inner collar ring inside Tier 1 top well (visible on explode)
  add(
    t1,
    chamferedOctagonShellGeometry({
      width: 0.84,
      height: 0.12,
      chamfer: 0.84 * 0.46,
      bevel: 0.18,
      bevelTaper: 0.06,
      segments: 96,
      rings: 10,
      topWell: { inset: 0.12, depth: 0.1, rimBevel: 0.015 },
    }),
    m.blush,
    0,
    0.755,
    0,
  );

  // Bottom-right micro-perforated speaker grille on Warm Cream rim
  const grilleRows = 3;
  const grilleCols = 14;
  const grille = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.0075, 0.0075, 0.01, 8),
    m.recessDark,
    grilleRows * grilleCols,
  );
  const dummy = new THREE.Object3D();
  const smoothMinLocal = (a: number, b: number, k: number) => {
    const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k));
    return b * (1 - h) + a * h - k * h * (1 - h);
  };
  let gIdx = 0;
  for (let r = 0; r < grilleRows; r++) {
    const gy = 0.044 + r * 0.026;
    const gt = gy / 0.145;
    const gScale = 1 + 0.035 * Math.pow(1 - gt, 1.5);
    for (let c = 0; c < grilleCols; c++) {
      const a = 0.06 + (c / (grilleCols - 1)) * 0.44;
      const ca = Math.abs(Math.cos(a));
      const sa = Math.abs(Math.sin(a));
      const sqR = 1.34 / Math.max(ca, sa);
      const diR = (1.34 * 1.46) / (ca + sa);
      const rad = smoothMinLocal(sqR, diR, 1.34 * 0.1) * gScale + 0.001;
      dummy.position.set(Math.cos(a) * rad, gy, Math.sin(a) * rad);
      dummy.lookAt(Math.cos(a) * (rad + 1), gy, Math.sin(a) * (rad + 1));
      dummy.rotateX(Math.PI / 2);
      dummy.updateMatrix();
      grille.setMatrixAt(gIdx++, dummy.matrix);
    }
  }
  grille.instanceMatrix.needsUpdate = true;
  t1.add(grille);

  // Tier 1 Front: Arch alcove liner, recessed LED strip, sloped nail-scratch ramp
  const archFrontZ = tier1FaceDistance(
    0.2,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    false,
  );
  const archFrame = add(
    t1,
    archFrameGeometry(0.74, 0.36, 0.68, 0.33, 0.2, 0.006),
    m.recessDark,
    0,
    0.01,
    archFrontZ - 0.11,
  );
  archFrame.rotation.x = -0.36;
  // Dark shadowed alcove interior back & ceiling (tucked cleanly inside alcove)
  add(
    t1,
    roundedBlockGeometry(0.7, 0.34, 0.12, 0.04, 0),
    m.recessDark,
    0,
    0.18,
    archFrontZ - 0.3,
  );
  add(
    t1,
    roundedBlockGeometry(0.68, 0.2, 0.06, 0.03, 0),
    m.recessDark,
    0,
    0.365,
    archFrontZ - 0.24,
  ).rotation.x = Math.PI / 2;

  // Soft recessed Sky Blue LED diffuser bar tucked cleanly inside arch ceiling
  const led = add(
    t1,
    new THREE.CapsuleGeometry(0.02, 0.5, 8, 16),
    m.led,
    0,
    0.345,
    archFrontZ - 0.16,
  );
  led.rotation.z = Math.PI / 2;
  led.castShadow = false;
  smartOnly.push(led);

  // Sloped Warm Cream nail-scratch ramp + inset fine-grit sandpaper pad
  const rampBackZ = archFrontZ - 0.22;
  const rampLen = 0.68;
  const rampBackH = 0.265;
  const rampFrontH = 0.052;
  add(
    t1,
    scratchRampGeometry(0.64, rampLen, rampBackH, rampFrontH),
    m.creamScratch,
    0,
    0,
    rampBackZ,
    "scratch",
    true,
  );
  const rampSlope = Math.atan2(rampBackH - rampFrontH, rampLen - 0.04);
  const gritPad = add(
    t1,
    roundedBlockGeometry(0.56, 0.52, 0.045, 0.018, 0.006),
    m.gritPad,
    0,
    0.198,
    rampBackZ + 0.341,
    "scratch",
    true,
  );
  gritPad.rotation.x = -Math.PI / 2 + rampSlope;

  // Tier 1 Front Upper Oval Pocket (y = 0.595): Smart paddle+drawer / Pure dial+latch
  const frontPocketY = 0.595;
  const frontPocketZ = tier1FaceDistance(
    frontPocketY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    false,
  );
  const frontPocketSlope = tier1FaceSlope(
    frontPocketY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    false,
  );
  const frontPocket = new THREE.Group();
  frontPocket.position.set(0, frontPocketY, frontPocketZ);
  frontPocket.rotation.x = -frontPocketSlope;
  t1.add(frontPocket);

  add(
    frontPocket,
    beveledFrameGeometry(0.74, 0.29, 0.13, 0.64, 0.21, 0.095, 0.09, 0.012),
    m.tier1,
    0,
    0,
    0.006,
  );
  add(
    frontPocket,
    roundedBlockGeometry(0.64, 0.21, 0.095, 0.02, 0),
    m.recessDark,
    0,
    0,
    -0.085,
  );

  // Smart mode: Butter Yellow paw-paddle + pull-out Mint treat drawer with bone chew
  const paddleBaseY = 0.052;
  const paddle = add(
    frontPocket,
    roundedBlockGeometry(0.56, 0.09, 0.044, 0.09, 0.014),
    m.butterPaddle,
    0,
    paddleBaseY,
    0.015,
    "paddle",
    true,
  );
  smartOnly.push(paddle);

  const drawer = new THREE.Group();
  const drawerBaseZ = 0.075;
  drawer.position.set(0, -0.062, drawerBaseZ);
  add(
    drawer,
    openDrawerGeometry(0.44, 0.082, 0.26, 0.022),
    m.mintPaddle,
    0,
    -0.04,
    0,
    "paddle",
    true,
  );
  const drawerFloor = add(
    drawer,
    roundedBlockGeometry(0.41, 0.23, 0.02, 0.018, 0.004),
    m.mintPaddle,
    0,
    -0.032,
    0,
    "paddle",
  );
  drawerFloor.rotation.x = Math.PI / 2;
  const bone = add(
    drawer,
    boneChewGeometry(),
    m.bone,
    0,
    -0.004,
    0.01,
    "paddle",
  );
  bone.rotation.y = 0.12;
  smartOnly.push(drawer);
  frontPocket.add(drawer);

  // Pure mode: Wind-up timer dial + spring latch tab
  const pureDialGroup = new THREE.Group();
  pureDialGroup.position.set(0, 0.005, 0.01);
  const dialRing = add(
    pureDialGroup,
    new THREE.CylinderGeometry(0.115, 0.115, 0.03, 28),
    m.timerFace,
    0,
    0,
    -0.01,
    "scratch",
    true,
  );
  dialRing.rotation.x = Math.PI / 2;
  const pureDial = new THREE.Group();
  const dialKnob = add(
    pureDial,
    new THREE.CylinderGeometry(0.076, 0.082, 0.045, 24),
    m.creamScratch,
    0,
    0,
    0.015,
    "scratch",
    true,
  );
  dialKnob.rotation.x = Math.PI / 2;
  add(
    pureDial,
    roundedBlockGeometry(0.026, 0.12, 0.012, 0.035, 0.006),
    m.creamScratch,
    0,
    0,
    0.042,
    "scratch",
  );
  pureDialGroup.add(pureDial);
  pureOnly.push(pureDialGroup);
  frontPocket.add(pureDialGroup);

  const pureLatch = new THREE.Group();
  const latchY = 0.43;
  const latchZ = tier1FaceDistance(
    latchY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    false,
  );
  pureLatch.position.set(0, latchY, latchZ + 0.015);
  pureLatch.rotation.x = -frontPocketSlope;
  add(
    pureLatch,
    roundedBlockGeometry(0.14, 0.2, 0.03, 0.05, 0.01),
    m.creamScratch,
    0,
    0,
    0,
    "paddle",
    true,
  );
  for (let r = 0; r < 2; r++) {
    for (let c = -1; c <= 1; c++) {
      add(
        pureLatch,
        new THREE.SphereGeometry(0.008, 8, 6),
        m.recessMint,
        c * 0.028,
        -0.045 + r * 0.028,
        0.032,
      );
    }
  }
  pureOnly.push(pureLatch);
  t1.add(pureLatch);

  // Tier 1 Front-Right Chamfer (+45°): Recessed circular pocket + 6-spoke Blush Pink kibble wheel
  const rightChamfer = new THREE.Group();
  rightChamfer.rotation.y = Math.PI / 4;
  t1.add(rightChamfer);

  const wheelY = 0.445;
  const wheelDist = tier1FaceDistance(
    wheelY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    true,
  );
  const wheelSlope = tier1FaceSlope(
    wheelY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    true,
  );
  const wheelPocket = new THREE.Group();
  wheelPocket.position.set(0, wheelY, wheelDist);
  wheelPocket.rotation.x = -wheelSlope;
  rightChamfer.add(wheelPocket);

  const wheelBezelPts = [
    new THREE.Vector2(0.282, -0.08),
    new THREE.Vector2(0.282, 0.012),
    new THREE.Vector2(0.305, 0.022),
    new THREE.Vector2(0.332, 0.008),
    new THREE.Vector2(0.332, -0.02),
  ];
  const wheelBezelGeo = new THREE.LatheGeometry(wheelBezelPts, 40);
  wheelBezelGeo.rotateX(Math.PI / 2);
  add(wheelPocket, wheelBezelGeo, m.tier1, 0, 0, 0);

  const wheelBack = add(
    wheelPocket,
    new THREE.CylinderGeometry(0.282, 0.282, 0.02, 32),
    m.recessDark,
    0,
    0,
    -0.085,
  );
  wheelBack.rotation.x = Math.PI / 2;

  const wheel = new THREE.Group();
  wheel.position.set(0, 0, -0.022);
  add(
    wheel,
    kibbleWheelGeometry(0.278, 0.072, 6, 0.052),
    m.blushWheel,
    0,
    0,
    0,
    "wheel",
    true,
  );
  const wheelHub = add(
    wheel,
    new THREE.CylinderGeometry(0.072, 0.072, 0.062, 24),
    m.blushWheel,
    0,
    0,
    0.004,
    "wheel",
  );
  wheelHub.rotation.x = Math.PI / 2;

  const wheelKibblePositions: Array<[number, number, number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const a = ((i + 0.5) / 6) * Math.PI * 2;
    wheelKibblePositions.push(
      [Math.cos(a) * 0.165, Math.sin(a) * 0.165, -0.018, i * 1.1],
      [Math.cos(a - 0.14) * 0.205, Math.sin(a - 0.14) * 0.205, -0.022, i * 1.7 + 0.5],
      [Math.cos(a + 0.14) * 0.205, Math.sin(a + 0.14) * 0.205, -0.022, i * 2.3 + 1.0],
    );
  }
  addKibbleCluster(wheel, wheelKibblePositions, "wheel");
  wheelPocket.add(wheel);

  // Tier 1 Front-Left Chamfer (-45°): Recessed oval Sky Blue funnel bore + floor ball & kibble
  const leftChamfer = new THREE.Group();
  leftChamfer.rotation.y = -Math.PI / 4;
  t1.add(leftChamfer);

  const t1FunnelY = 0.465;
  const t1FunnelDist = tier1FaceDistance(
    t1FunnelY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    true,
  );
  const t1FunnelSlope = tier1FaceSlope(
    t1FunnelY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    true,
  );
  const t1FunnelPocket = new THREE.Group();
  t1FunnelPocket.position.set(0, t1FunnelY, t1FunnelDist);
  t1FunnelPocket.rotation.x = -t1FunnelSlope;
  t1FunnelPocket.scale.set(0.92, 1.08, 1);
  leftChamfer.add(t1FunnelPocket);

  add(
    t1FunnelPocket,
    conicalFunnelGeometry(0.235, 0.11, 0.18, 0.038),
    m.skySeesaw,
    0,
    0,
    0.005,
    "seesaw",
    true,
  );
  const t1FunnelCap = add(
    t1FunnelPocket,
    new THREE.CylinderGeometry(0.112, 0.112, 0.04, 24),
    m.recessDark,
    0,
    0,
    -0.175,
  );
  t1FunnelCap.rotation.x = Math.PI / 2;

  // Textured Sky Blue silicone ball & 3 kibble pieces resting cleanly on floor (y = 0)
  const ballRadius = 0.145;
  const ball = add(
    t1,
    new THREE.SphereGeometry(ballRadius, 28, 20),
    m.skySeesaw,
    -1.18,
    ballRadius,
    1.18,
    "seesaw",
    true,
  );
  const ballSeam = new THREE.Mesh(
    new THREE.TorusGeometry(ballRadius * 0.995, 0.004, 6, 32),
    m.recessDark,
  );
  ballSeam.rotation.x = 0.45;
  ball.add(ballSeam);

  addKibbleCluster(
    t1,
    [
      [-1.36, 0.026, 1.26, 0.4],
      [-1.42, 0.026, 1.12, 1.7],
      [-1.28, 0.026, 1.38, 2.9],
    ],
    "seesaw",
  );

  // Tier 1 Rear (-Z): Sealed scent & audio bay
  const rear = new THREE.Group();
  const rearY = 0.515;
  const rearDist = tier1FaceDistance(
    rearY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    false,
  );
  const rearSlope = tier1FaceSlope(
    rearY,
    t1YStart,
    t1Height,
    t1Width,
    t1Chamfer,
    t1Flare,
    t1FlarePow,
    false,
  );
  const rearBaseZ = -rearDist;
  rear.position.set(0, rearY, rearBaseZ);
  rear.rotation.order = "YXZ";
  rear.rotation.set(-rearSlope, Math.PI, 0);
  add(
    rear,
    roundedBlockGeometry(0.72, 0.36, 0.06, 0.08, 0.014),
    m.creamScent,
    0,
    0,
    -0.01,
    "scent",
    true,
  );
  add(
    rear,
    roundedBlockGeometry(0.48, 0.16, 0.03, 0.02, 0.004),
    m.recessDark,
    0,
    0.03,
    0.035,
    "scent",
  );
  for (let i = 0; i < 5; i++) {
    const port = add(
      rear,
      new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12),
      m.skyScent,
      -0.16 + i * 0.08,
      -0.095,
      0.035,
      "scent",
      true,
    );
    port.rotation.x = Math.PI / 2;
  }
  t1.add(rear);
  group.add(t1);

  // ============================================================================
  // TIER 2 (y = 0.88 to 1.76): Cream collar, Mint body, conical ball-drop funnel,
  // left U-handle, right vertical slider + pink sliding door with kibble
  // ============================================================================
  const t2 = new THREE.Group();
  const t2Width = 1.02;
  const t2Chamfer = t2Width * 0.46;

  // Warm Cream bottom collar (y = 0.88 to 0.99)
  add(
    t2,
    chamferedOctagonShellGeometry({
      width: 1.025,
      height: 0.11,
      chamfer: 1.025 * 0.46,
      bevel: 0.24,
      bevelTaper: 0.08,
      segments: 192,
      rings: 12,
    }),
    m.cream,
    0,
    0.88,
    0,
  );

  // 4 protruding locking lugs + O-ring underneath Tier 2 (visible on explode)
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const lug = add(
      t2,
      roundedBlockGeometry(0.16, 0.06, 0.02, 0.08, 0.008),
      m.cream,
      Math.cos(a) * 0.68,
      0.855,
      Math.sin(a) * 0.68,
    );
    lug.rotation.y = -a + Math.PI / 2;
  }
  const t2Gasket = add(
    t2,
    new THREE.TorusGeometry(0.72, 0.011, 8, 48),
    m.recessDark,
    0,
    0.885,
    0,
  );
  t2Gasket.rotation.x = Math.PI / 2;

  // Seafoam Mint main body (y = 0.985 to 1.76)
  add(
    t2,
    chamferedOctagonShellGeometry({
      width: t2Width,
      height: 0.775,
      chamfer: t2Chamfer,
      bevel: 0.09,
      bevelTaper: 0.07,
      segments: 192,
      rings: 40,
      topWell: { inset: 0.28, depth: 0.18, rimBevel: 0.03 },
      recesses: [
        {
          angle: Math.PI / 2,
          yCenter: 0.38,
          halfW: 0.25,
          halfH: 0.25,
          depth: 0.3,
          shape: "circle",
          edgeSoftness: 0.022,
        },
        {
          angle: (3 * Math.PI) / 4,
          yCenter: 0.38,
          halfW: 0.11,
          halfH: 0.26,
          cornerRadius: 0.09,
          depth: 0.1,
          shape: "roundRect",
          edgeSoftness: 0.02,
        },
        {
          angle: Math.PI / 4,
          yCenter: 0.38,
          sCenter: 0.19,
          halfW: 0.06,
          halfH: 0.24,
          cornerRadius: 0.05,
          depth: 0.08,
          shape: "roundRect",
          edgeSoftness: 0.018,
        },
        {
          angle: Math.PI / 4,
          yCenter: 0.38,
          sCenter: -0.12,
          halfW: 0.16,
          halfH: 0.24,
          cornerRadius: 0.045,
          depth: 0.12,
          shape: "roundRect",
          edgeSoftness: 0.02,
        },
      ],
    }),
    m.tier2,
    0,
    0.985,
    0,
  );

  // Tier 2 Front: Deep conical Sky Blue ball-drop funnel
  add(
    t2,
    conicalFunnelGeometry(0.275, 0.115, 0.28, 0.042),
    m.skySeesaw,
    0,
    1.365,
    t2Width + 0.005,
    "seesaw",
    true,
  );
  const t2FunnelCap = add(
    t2,
    new THREE.CylinderGeometry(0.118, 0.118, 0.04, 24),
    m.recessDark,
    0,
    1.365,
    t2Width - 0.27,
  );
  t2FunnelCap.rotation.x = Math.PI / 2;

  // Tier 2 Front-Left Chamfer (-45°): Butter Yellow U-shaped pull handle in vertical slot
  const t2ChamferDist = (t2Width + t2Chamfer) / Math.SQRT2;
  const t2Left = new THREE.Group();
  t2Left.rotation.y = -Math.PI / 4;
  t2Left.position.set(0, 1.365, 0);
  t2.add(t2Left);

  add(
    t2Left,
    beveledFrameGeometry(0.22, 0.52, 0.1, 0.14, 0.44, 0.065, 0.08, 0.012),
    m.tier2,
    0,
    0,
    t2ChamferDist + 0.005,
  );
  add(
    t2Left,
    roundedBlockGeometry(0.14, 0.44, 0.065, 0.02, 0),
    m.recessDark,
    0,
    0,
    t2ChamferDist - 0.075,
  );
  add(
    t2Left,
    uHandleGeometry(0.24, 0.2, 0.045, 0.065),
    m.butterSeesaw,
    0,
    0,
    t2ChamferDist - 0.02,
    "seesaw",
    true,
  );

  // Tier 2 Front-Right Chamfer (+45°): Vertical Butter Yellow slider + Blush Pink sliding door
  const t2Right = new THREE.Group();
  t2Right.rotation.y = Math.PI / 4;
  t2Right.position.set(0, 1.365, 0);
  t2.add(t2Right);

  // Vertical slider slot (left side of right chamfer, x = -0.19)
  add(
    t2Right,
    beveledFrameGeometry(0.14, 0.5, 0.065, 0.085, 0.44, 0.04, 0.07, 0.01),
    m.tier2,
    -0.19,
    0,
    t2ChamferDist + 0.005,
  );
  add(
    t2Right,
    roundedBlockGeometry(0.085, 0.44, 0.04, 0.02, 0),
    m.recessDark,
    -0.19,
    0,
    t2ChamferDist - 0.06,
  );
  add(
    t2Right,
    roundedBlockGeometry(0.062, 0.38, 0.03, 0.05, 0.01),
    m.butterSeesaw,
    -0.19,
    -0.01,
    t2ChamferDist - 0.005,
    "seesaw",
    true,
  );
  add(
    t2Right,
    roundedBlockGeometry(0.092, 0.12, 0.042, 0.06, 0.012),
    m.butterSeesaw,
    -0.19,
    0.11,
    t2ChamferDist + 0.01,
    "seesaw",
    true,
  );

  // Kibble pocket + Blush Pink sliding door (right side of right chamfer, x = +0.12)
  add(
    t2Right,
    beveledFrameGeometry(0.38, 0.52, 0.06, 0.3, 0.44, 0.04, 0.1, 0.012),
    m.tier2,
    0.12,
    0,
    t2ChamferDist + 0.005,
  );
  add(
    t2Right,
    roundedBlockGeometry(0.3, 0.44, 0.04, 0.02, 0),
    m.recessDark,
    0.12,
    0,
    t2ChamferDist - 0.095,
  );
  addKibbleCluster(
    t2Right,
    [
      [0.02, 0.08, t2ChamferDist - 0.055, 0.3],
      [0.05, 0.02, t2ChamferDist - 0.05, 1.1],
      [0.01, -0.04, t2ChamferDist - 0.055, 2.2],
      [0.06, -0.1, t2ChamferDist - 0.05, 0.8],
      [0.03, 0.14, t2ChamferDist - 0.055, 1.9],
      [0.08, 0.06, t2ChamferDist - 0.06, 2.7],
      [0.07, -0.02, t2ChamferDist - 0.06, 0.5],
      [0.02, -0.14, t2ChamferDist - 0.055, 1.4],
    ],
    "seesaw",
  );
  add(
    t2Right,
    roundedBlockGeometry(0.21, 0.42, 0.04, 0.045, 0.012),
    m.blushSeesaw,
    0.18,
    0,
    t2ChamferDist - 0.008,
    "seesaw",
    true,
  );
  group.add(t2);

  // ============================================================================
  // TIER 3 (y = 1.76 to 2.56): Cream collar, Blush Pink body, 2 recessed slider
  // channels with Mint & Butter knobs, 2 stacked curved visors, scalloped rotary dial
  // ============================================================================
  const t3 = new THREE.Group();
  const t3Width = 0.91;
  const t3Chamfer = t3Width * 0.46;

  // Warm Cream bottom collar (y = 1.76 to 1.87)
  add(
    t3,
    chamferedOctagonShellGeometry({
      width: 0.915,
      height: 0.11,
      chamfer: 0.915 * 0.46,
      bevel: 0.24,
      bevelTaper: 0.08,
      segments: 192,
      rings: 12,
    }),
    m.cream,
    0,
    1.76,
    0,
  );

  // 4 protruding Blush Pink locking lugs + O-ring underneath Tier 3
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const lug = add(
      t3,
      roundedBlockGeometry(0.14, 0.06, 0.02, 0.07, 0.008),
      m.tier3,
      Math.cos(a) * 0.6,
      1.735,
      Math.sin(a) * 0.6,
    );
    lug.rotation.y = -a + Math.PI / 2;
  }
  const t3Gasket = add(
    t3,
    new THREE.TorusGeometry(0.64, 0.011, 8, 48),
    m.recessDark,
    0,
    1.765,
    0,
  );
  t3Gasket.rotation.x = Math.PI / 2;

  // Blush Pink main body (y = 1.865 to 2.56)
  add(
    t3,
    chamferedOctagonShellGeometry({
      width: t3Width,
      height: 0.695,
      chamfer: t3Chamfer,
      bevel: 0.09,
      bevelTaper: 0.07,
      segments: 192,
      rings: 40,
      topWell: { inset: 0.24, depth: 0.22, rimBevel: 0.03 },
      recesses: [
        {
          angle: Math.PI / 2,
          yCenter: 0.48,
          halfW: 0.3,
          halfH: 0.11,
          cornerRadius: 0.045,
          depth: 0.09,
          shape: "roundRect",
          edgeSoftness: 0.02,
        },
        {
          angle: Math.PI / 2,
          yCenter: 0.21,
          halfW: 0.3,
          halfH: 0.11,
          cornerRadius: 0.045,
          depth: 0.09,
          shape: "roundRect",
          edgeSoftness: 0.02,
        },
        {
          angle: Math.PI / 4,
          yCenter: 0.48,
          halfW: 0.24,
          halfH: 0.1,
          cornerRadius: 0.045,
          depth: 0.11,
          shape: "roundRect",
          edgeSoftness: 0.02,
        },
        {
          angle: Math.PI / 4,
          yCenter: 0.21,
          halfW: 0.24,
          halfH: 0.1,
          cornerRadius: 0.045,
          depth: 0.11,
          shape: "roundRect",
          edgeSoftness: 0.02,
        },
        {
          angle: (3 * Math.PI) / 4,
          yCenter: 0.345,
          halfW: 0.21,
          halfH: 0.21,
          depth: 0.08,
          shape: "circle",
          edgeSoftness: 0.02,
        },
      ],
    }),
    m.tier3,
    0,
    1.865,
    0,
  );

  // Tier 3 Front: TWO recessed rounded-rectangle slider channels + Mint & Butter knobs
  const sliderRows: Array<{
    y: number;
    knobX: number;
    knobMat: THREE.Material;
  }> = [
    { y: 2.345, knobX: 0.12, knobMat: m.mintLick },
    { y: 2.075, knobX: -0.12, knobMat: m.butterLick },
  ];
  for (const row of sliderRows) {
    add(
      t3,
      beveledFrameGeometry(0.64, 0.24, 0.055, 0.54, 0.17, 0.038, 0.08, 0.014),
      m.tier3,
      0,
      row.y,
      t3Width + 0.005,
    );
    add(
      t3,
      roundedBlockGeometry(0.54, 0.17, 0.038, 0.02, 0),
      m.recessPink,
      0,
      row.y,
      t3Width - 0.075,
    );
    add(
      t3,
      roundedBlockGeometry(0.44, 0.026, 0.012, 0.012, 0),
      m.recessDark,
      0,
      row.y,
      t3Width - 0.062,
    );
    // Rounded-square slider knob + raised rounded-square finger pad
    add(
      t3,
      roundedBlockGeometry(0.175, 0.165, 0.038, 0.075, 0.014),
      row.knobMat,
      row.knobX,
      row.y,
      t3Width - 0.015,
      "lick",
      true,
    );
    add(
      t3,
      roundedBlockGeometry(0.095, 0.095, 0.024, 0.035, 0.01),
      row.knobMat,
      row.knobX,
      row.y,
      t3Width + 0.042,
      "lick",
      true,
    );
  }

  // Tier 3 Front-Right Chamfer (+45°): TWO stacked curved visors (Sky Blue top, Butter bottom)
  const t3ChamferDist = (t3Width + t3Chamfer) / Math.SQRT2;
  const t3Right = new THREE.Group();
  t3Right.rotation.y = Math.PI / 4;
  t3.add(t3Right);

  for (const [vy, vMat] of [
    [2.345, m.skyLick],
    [2.075, m.butterLick],
  ] as const) {
    add(
      t3Right,
      beveledFrameGeometry(0.5, 0.22, 0.055, 0.4, 0.15, 0.038, 0.095, 0.014),
      m.tier3,
      0,
      vy,
      t3ChamferDist + 0.005,
    );
    add(
      t3Right,
      roundedBlockGeometry(0.4, 0.15, 0.038, 0.02, 0),
      m.recessDark,
      0,
      vy,
      t3ChamferDist - 0.09,
    );
    add(
      t3Right,
      curvedVisorGeometry(0.34, 0.18, 0.055, 0.042),
      vMat,
      0,
      vy + 0.025,
      t3ChamferDist - 0.02,
      "lick",
      true,
    );
  }

  // Tier 3 Front-Left Chamfer (-45°): Sculpted Sky Blue rotary dial with scalloped grip
  const t3Left = new THREE.Group();
  t3Left.rotation.y = -Math.PI / 4;
  t3Left.position.set(0, 2.21, 0);
  t3.add(t3Left);

  const dialBezelPts = [
    new THREE.Vector2(0.18, -0.06),
    new THREE.Vector2(0.18, 0.01),
    new THREE.Vector2(0.2, 0.018),
    new THREE.Vector2(0.225, 0.006),
    new THREE.Vector2(0.225, -0.02),
  ];
  const dialBezelGeo = new THREE.LatheGeometry(dialBezelPts, 36);
  dialBezelGeo.rotateX(Math.PI / 2);
  add(t3Left, dialBezelGeo, m.tier3, 0, 0, t3ChamferDist);

  const dialBack = add(
    t3Left,
    new THREE.CylinderGeometry(0.18, 0.18, 0.02, 28),
    m.recessPink,
    0,
    0,
    t3ChamferDist - 0.065,
  );
  dialBack.rotation.x = Math.PI / 2;

  add(
    t3Left,
    scallopedDialGeometry(0.172, 8, 0.065),
    m.skyLick,
    0,
    0,
    t3ChamferDist - 0.008,
    "lick",
    true,
  );
  const dialCap = add(
    t3Left,
    new THREE.CylinderGeometry(0.122, 0.132, 0.045, 28),
    m.skyLick,
    0,
    0,
    t3ChamferDist + 0.025,
    "lick",
    true,
  );
  dialCap.rotation.x = Math.PI / 2;
  add(
    t3Left,
    roundedBlockGeometry(0.052, 0.175, 0.024, 0.045, 0.01),
    m.skyLick,
    0,
    0,
    t3ChamferDist + 0.055,
    "lick",
    true,
  );
  group.add(t3);

  // ============================================================================
  // TIER 4 (y = 2.56 to 3.05): Blush Pink lid, 2.5-turn screw threads underneath,
  // frosted translucent silicone lick dome + 111 concentric raised silicone nubs
  // ============================================================================
  const t4 = new THREE.Group();

  // Exposed 2.5-turn screw thread neck underneath lid (y = 2.36 to 2.56)
  add(
    t4,
    new THREE.CylinderGeometry(0.555, 0.545, 0.2, 40),
    m.tier3,
    0,
    2.46,
    0,
  );
  add(
    t4,
    helicalThreadGeometry(0.562, 0.15, 2.5, 0.018),
    m.tier3,
    0,
    2.46,
    0,
  );
  const t4Gasket = add(
    t4,
    new THREE.TorusGeometry(0.572, 0.012, 8, 48),
    m.recessDark,
    0,
    2.555,
    0,
  );
  t4Gasket.rotation.x = Math.PI / 2;

  // Blush Pink chamfered octagonal lid with crisp horizontal parting groove (y = 2.56 to 2.78)
  add(
    t4,
    chamferedOctagonShellGeometry({
      width: 0.89,
      height: 0.1,
      chamfer: 0.89 * 0.46,
      bevel: 0.22,
      bevelTaper: 0.07,
      segments: 192,
      rings: 10,
    }),
    m.tier3,
    0,
    2.56,
    0,
  );
  add(
    t4,
    chamferedOctagonShellGeometry({
      width: 0.895,
      height: 0.115,
      chamfer: 0.895 * 0.46,
      bevel: 0.26,
      bevelTaper: 0.09,
      segments: 192,
      rings: 12,
    }),
    m.tier3,
    0,
    2.665,
    0,
  );

  // Subtle recessed lick-plate disc visible softly beneath the frosted dome
  add(
    t4,
    new THREE.CylinderGeometry(0.54, 0.54, 0.02, 40),
    m.cream,
    0,
    2.775,
    0,
  );
  const domeFlange = add(
    t4,
    new THREE.TorusGeometry(0.555, 0.018, 10, 48),
    m.dome,
    0,
    2.78,
    0,
    "lick",
  );
  domeFlange.rotation.x = Math.PI / 2;

  // Frosted translucent silicone lick dome (y = 2.77 to 3.05)
  const domeRadius = 0.56;
  const domeScaleY = 0.5;
  const dome = add(
    t4,
    new THREE.SphereGeometry(domeRadius, 48, 28, 0, Math.PI * 2, 0, Math.PI / 2),
    m.dome,
    0,
    2.77,
    0,
    "lick",
    true,
  );
  dome.scale.set(1, domeScaleY, 1);

  // 111 crisp concentric raised silicone nubs aligned to dome surface normals
  const ringCounts = [1, 6, 14, 22, 30, 38];
  const ringPhis = [0, 0.2, 0.4, 0.6, 0.8, 1.02];
  const totalNubs = ringCounts.reduce((a, b) => a + b, 0);
  const nubGeo = new THREE.SphereGeometry(0.015, 10, 8);
  nubGeo.scale(1, 0.85, 1);
  const nubs = new THREE.InstancedMesh(nubGeo, m.nubs, totalNubs);
  const upVec = new THREE.Vector3(0, 1, 0);
  const normVec = new THREE.Vector3();
  let nIdx = 0;
  for (let r = 0; r < ringCounts.length; r++) {
    const count = ringCounts[r];
    const phi = ringPhis[r];
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2 + r * 0.21;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      dummy.position.set(
        domeRadius * nx,
        2.77 + domeRadius * domeScaleY * ny,
        domeRadius * nz,
      );
      normVec.set(nx, ny / domeScaleY, nz).normalize();
      dummy.quaternion.setFromUnitVectors(upVec, normVec);
      dummy.updateMatrix();
      nubs.setMatrixAt(nIdx++, dummy.matrix);
    }
  }
  nubs.instanceMatrix.needsUpdate = true;
  nubs.castShadow = true;
  t4.add(nubs);
  partMeshes.lick.push(nubs);
  group.add(t4);

  // ============================================================================
  // INTERNALS REVEALED ON EXPLODE
  // ============================================================================
  const internals = new THREE.Group();
  const rotor = add(
    internals,
    kibbleWheelGeometry(0.42, 0.12, 6, 0.06),
    m.skyLick,
    0,
    2.48,
    0,
    "lick",
  );
  rotor.rotation.x = Math.PI / 2;
  add(
    internals,
    roundedBlockGeometry(0.56, 0.055, 0.02, 0.16, 0.01),
    m.butterSeesaw,
    0,
    1.62,
    0,
    "seesaw",
  );
  const pivotAxle = add(
    internals,
    new THREE.CylinderGeometry(0.04, 0.04, 0.28, 16),
    m.cream,
    0,
    1.62,
    0,
    "seesaw",
  );
  pivotAxle.rotation.x = Math.PI / 2;
  add(
    internals,
    helicalThreadGeometry(0.14, 0.16, 3, 0.022),
    m.butterPaddle,
    0,
    0.72,
    0.12,
    "scratch",
  );
  internals.visible = false;
  group.add(internals);

  const tiers = [t1, t2, t3, t4];
  const offsets = [0, 0.72, 1.48, 2.28];
  const glow = new THREE.PointLight(SKY, 1.05, 3.2, 2);
  glow.position.set(0, 0.3, archFrontZ - 0.04);
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

    const contrastHex =
      shellHex.toUpperCase() === "#F6D1D8" ? MINT : BLUSH;
    const contrast = new THREE.Color(contrastHex);
    const contrastFinal = dogVision ? mute(contrast) : contrast;
    contrastTinted.forEach((material) => material.color.copy(contrastFinal));

    m.recessPink.color.copy(contrastFinal).multiplyScalar(0.84);
    m.recessMint.color.copy(tinted).multiplyScalar(0.84);
    m.mintLick.color.copy(tinted);

    const skyHex = dogVision ? DOG_BLUE : SKY;
    const butterHex = dogVision ? DOG_YELLOW : BUTTER;
    m.skySeesaw.color.setHex(skyHex);
    m.skyLick.color.setHex(skyHex);
    m.skyScent.color.setHex(skyHex);
    m.butterSeesaw.color.setHex(butterHex);
    m.butterPaddle.color.setHex(butterHex);
    m.butterLick.color.setHex(butterHex);
    m.dome.opacity = dogVision ? 0.84 : 0.74;

    for (const hm of highlightMeshes) {
      const matRef = hm.mesh.material as THREE.MeshStandardMaterial;
      if (matRef && "color" in matRef) {
        hm.base.copy(matRef.color);
      }
    }
  }

  function setVersion(v: "pure" | "smart") {
    version = v;
    smartOnly.forEach((o) => {
      o.visible = v === "smart";
    });
    pureOnly.forEach((o) => {
      o.visible = v === "pure";
    });
    glow.intensity = v === "smart" ? 1.05 : 0;
    m.led.emissiveIntensity = v === "smart" ? 0.95 : 0;
    m.led.opacity = v === "smart" ? 0.95 : 0;
  }

  function setShellColor(hex: string) {
    shellHex = hex;
    applyColors();
  }

  function setDogVision(on: boolean) {
    dogVision = on;
    applyColors();
  }

  function setExplode(amount: number) {
    explodeAmount = THREE.MathUtils.clamp(amount, 0, 1);
  }

  function updateMechanisms(
    time: number,
    activePart: PartKey | null,
    explode: number,
  ) {
    if (explode !== undefined) setExplode(explode);
    tiers.forEach((tier, i) => {
      tier.position.y = offsets[i] * explodeAmount;
    });
    rear.position.z = rearBaseZ - 0.32 * explodeAmount;
    internals.visible = explodeAmount > 0.22;
    wheel.rotation.z = time * (activePart === "wheel" ? 1.4 : 0.18);

    if (activePart === "seesaw") {
      const bounce = Math.abs(Math.sin(time * 2.4));
      ball.position.y = ballRadius + bounce * 0.04;
      ball.rotation.z = Math.sin(time * 2.4) * 0.35;
    } else {
      ball.position.y = ballRadius;
      ball.rotation.z = 0;
    }

    if (activePart === "paddle") {
      const cycle = 0.5 + 0.5 * Math.sin(time * 3.2);
      drawer.position.z = drawerBaseZ + cycle * 0.09;
      paddle.position.y = paddleBaseY - Math.max(0, Math.sin(time * 3.2)) * 0.016;
    } else {
      drawer.position.z = drawerBaseZ;
      paddle.position.y = paddleBaseY;
    }

    if (version === "pure") {
      pureDial.rotation.z = -time * 0.55;
    }
    if (version === "smart") {
      glow.intensity = 0.95 + Math.sin(time * 1.7) * 0.15;
    }
  }

  function disposeTextures() {
    tex.dispose();
  }

  setVersion("smart");
  applyColors();

  return {
    group,
    tiers,
    rear,
    internals,
    wheel,
    drawer,
    paddle,
    ball,
    dome,
    led,
    glow,
    highlightMeshes,
    partMeshes,
    setVersion,
    setShellColor,
    setDogVision,
    setExplode,
    updateMechanisms,
    disposeTextures,
  };
}
