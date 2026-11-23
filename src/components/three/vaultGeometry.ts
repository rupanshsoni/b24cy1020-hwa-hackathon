import * as THREE from "three";

export const SHELL_COLORS = [
  { id: "blush", name: "Blush Pink", hex: "#F6D1D8" },
  { id: "mint", name: "Seafoam Mint", hex: "#BFE3DC" },
  { id: "oat", name: "Warm Oat Cream", hex: "#FAF6F0" },
];

export type PartKey = "scratch" | "lick" | "seesaw" | "paddle" | "wheel" | "scent";

export const SKY = 0x4da8da;
export const BUTTER = 0xf4d35e;
export const CREAM = 0xf5efe4;
export const COCOA = 0x2b2623;
export const BLUSH = 0xf6d1d8;
export const MINT = 0xbfe3dc;

export type HighlightMesh = {
  mesh: THREE.Mesh;
  base: THREE.Color;
  part: PartKey;
};

export interface PawVaultRig {
  group: THREE.Group;
  tiers: THREE.Group[];
  rear: THREE.Group;
  internals: THREE.Group;
  wheel: THREE.Group;
  drawer: THREE.Group;
  paddle: THREE.Mesh;
  ball: THREE.Mesh;
  dome: THREE.Mesh;
  led: THREE.Mesh;
  glow: THREE.PointLight;
  highlightMeshes: HighlightMesh[];
  partMeshes: Record<PartKey, THREE.Mesh[]>;
  setVersion: (v: "pure" | "smart") => void;
  setShellColor: (hex: string) => void;
  setDogVision: (on: boolean) => void;
  setExplode: (amount: number) => void;
  updateMechanisms: (
    time: number,
    activePart: PartKey | null,
    explodeAmount: number,
  ) => void;
  disposeTextures: () => void;
}

export function mat(
  color: number | string,
  opts: Partial<THREE.MeshStandardMaterialParameters> = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.64,
    metalness: 0.02,
    ...opts,
  });
}

function seededNoise(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function createGritBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rand = seededNoise(4201);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = 112 + rand() * 32;
    data[i] = data[i + 1] = data[i + 2] = grain;
    data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  for (let i = 0; i < size * 16; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const bright = rand() > 0.48;
    ctx.fillStyle = bright
      ? `rgba(240,240,240,${0.18 + rand() * 0.42})`
      : `rgba(30,30,30,${0.18 + rand() * 0.42})`;
    const r = rand() < 0.82 ? 0.65 : 1.35;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

export interface VaultTextureBundle {
  siliconeBump: THREE.CanvasTexture;
  siliconeRoughness: THREE.CanvasTexture;
  gritMap: THREE.CanvasTexture;
  gritBump: THREE.CanvasTexture;
  gritRoughness: THREE.CanvasTexture;
  domeBump: THREE.CanvasTexture;
  domeRoughness: THREE.CanvasTexture;
  kibbleMap: THREE.CanvasTexture;
  kibbleBump: THREE.CanvasTexture;
  kibbleRoughness: THREE.CanvasTexture;
  satinBump: THREE.CanvasTexture;
  satinRoughness: THREE.CanvasTexture;
  timerDialMap: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  return { canvas, ctx: canvas.getContext("2d")! };
}

function wrapTexture(
  canvas: HTMLCanvasElement,
  repeatX: number,
  repeatY: number,
  srgb = false,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createVaultTextures(): VaultTextureBundle {
  const rand = seededNoise(918273);

  // 1. Matte food-grade silicone / soft-touch ABS micro-grain
  const silSize = 256;
  const silBumpC = makeCanvas(silSize);
  const silRoughC = makeCanvas(silSize);
  const silBumpImg = silBumpC.ctx.createImageData(silSize, silSize);
  const silRoughImg = silRoughC.ctx.createImageData(silSize, silSize);

  for (let y = 0; y < silSize; y++) {
    for (let x = 0; x < silSize; x++) {
      const idx = (y * silSize + x) * 4;
      const wave =
        Math.sin((x / silSize) * Math.PI * 12) *
          Math.cos((y / silSize) * Math.PI * 12) *
          4 +
        Math.sin(((x + y) / silSize) * Math.PI * 20) * 2.5;
      const micro = (rand() - 0.5) * 22;
      const bVal = THREE.MathUtils.clamp(128 + wave + micro, 90, 166);
      const rVal = THREE.MathUtils.clamp(164 + wave * 0.8 + micro * 0.7, 138, 192);
      silBumpImg.data[idx] = silBumpImg.data[idx + 1] = silBumpImg.data[idx + 2] = bVal;
      silBumpImg.data[idx + 3] = 255;
      silRoughImg.data[idx] = silRoughImg.data[idx + 1] = silRoughImg.data[idx + 2] = rVal;
      silRoughImg.data[idx + 3] = 255;
    }
  }
  silBumpC.ctx.putImageData(silBumpImg, 0, 0);
  silRoughC.ctx.putImageData(silRoughImg, 0, 0);
  const siliconeBump = wrapTexture(silBumpC.canvas, 4, 4);
  const siliconeRoughness = wrapTexture(silRoughC.canvas, 4, 4);

  // 2. Fine-grit sandpaper pad (albedo + bump + roughness)
  const gritSize = 256;
  const gritMapC = makeCanvas(gritSize);
  const gritBumpC = makeCanvas(gritSize);
  const gritRoughC = makeCanvas(gritSize);

  gritMapC.ctx.fillStyle = "#E8DFD0";
  gritMapC.ctx.fillRect(0, 0, gritSize, gritSize);
  gritBumpC.ctx.fillStyle = "#808080";
  gritBumpC.ctx.fillRect(0, 0, gritSize, gritSize);
  gritRoughC.ctx.fillStyle = "#E4E4E4";
  gritRoughC.ctx.fillRect(0, 0, gritSize, gritSize);

  const gmImg = gritMapC.ctx.getImageData(0, 0, gritSize, gritSize);
  const gbImg = gritBumpC.ctx.getImageData(0, 0, gritSize, gritSize);
  const grImg = gritRoughC.ctx.getImageData(0, 0, gritSize, gritSize);
  for (let i = 0; i < gmImg.data.length; i += 4) {
    const n = (rand() - 0.5) * 24;
    gmImg.data[i] = THREE.MathUtils.clamp(232 + n * 0.7, 194, 246);
    gmImg.data[i + 1] = THREE.MathUtils.clamp(223 + n * 0.7, 184, 238);
    gmImg.data[i + 2] = THREE.MathUtils.clamp(206 + n * 0.7, 166, 224);
    gmImg.data[i + 3] = 255;

    const b = THREE.MathUtils.clamp(128 + n * 2.2, 40, 220);
    gbImg.data[i] = gbImg.data[i + 1] = gbImg.data[i + 2] = b;
    gbImg.data[i + 3] = 255;

    const r = THREE.MathUtils.clamp(232 + n * 0.8, 210, 252);
    grImg.data[i] = grImg.data[i + 1] = grImg.data[i + 2] = r;
    grImg.data[i + 3] = 255;
  }
  gritMapC.ctx.putImageData(gmImg, 0, 0);
  gritBumpC.ctx.putImageData(gbImg, 0, 0);
  gritRoughC.ctx.putImageData(grImg, 0, 0);

  for (let i = 0; i < 2500; i++) {
    const x = rand() * gritSize;
    const y = rand() * gritSize;
    const rad = 0.55 + rand() * 1.15;
    const light = rand() > 0.45;
    gritMapC.ctx.fillStyle = light
      ? `rgba(242,234,220,${0.24 + rand() * 0.32})`
      : `rgba(194,180,158,${0.22 + rand() * 0.34})`;
    gritMapC.ctx.beginPath();
    gritMapC.ctx.arc(x, y, rad, 0, Math.PI * 2);
    gritMapC.ctx.fill();

    gritBumpC.ctx.fillStyle = light
      ? `rgba(235,235,235,${0.25 + rand() * 0.45})`
      : `rgba(45,45,45,${0.25 + rand() * 0.45})`;
    gritBumpC.ctx.beginPath();
    gritBumpC.ctx.arc(x, y, rad, 0, Math.PI * 2);
    gritBumpC.ctx.fill();
  }
  const gritMap = wrapTexture(gritMapC.canvas, 2.5, 2.5, true);
  const gritBump = wrapTexture(gritBumpC.canvas, 2.5, 2.5);
  const gritRoughness = wrapTexture(gritRoughC.canvas, 2.5, 2.5);

  // 3. Frosted translucent silicone dome
  const domeSize = 256;
  const domeBumpC = makeCanvas(domeSize);
  const domeRoughC = makeCanvas(domeSize);
  const dbImg = domeBumpC.ctx.createImageData(domeSize, domeSize);
  const drImg = domeRoughC.ctx.createImageData(domeSize, domeSize);
  for (let i = 0; i < dbImg.data.length; i += 4) {
    const n = (rand() - 0.5) * 18;
    const b = THREE.MathUtils.clamp(128 + n, 100, 156);
    const r = THREE.MathUtils.clamp(88 + n * 1.1, 62, 118);
    dbImg.data[i] = dbImg.data[i + 1] = dbImg.data[i + 2] = b;
    dbImg.data[i + 3] = 255;
    drImg.data[i] = drImg.data[i + 1] = drImg.data[i + 2] = r;
    drImg.data[i + 3] = 255;
  }
  domeBumpC.ctx.putImageData(dbImg, 0, 0);
  domeRoughC.ctx.putImageData(drImg, 0, 0);
  const domeBump = wrapTexture(domeBumpC.canvas, 3, 3);
  const domeRoughness = wrapTexture(domeRoughC.canvas, 3, 3);

  // 4. Roasted organic kibble & dental chew
  const kibSize = 256;
  const kibMapC = makeCanvas(kibSize);
  const kibBumpC = makeCanvas(kibSize);
  const kibRoughC = makeCanvas(kibSize);
  const kmImg = kibMapC.ctx.createImageData(kibSize, kibSize);
  const kbImg = kibBumpC.ctx.createImageData(kibSize, kibSize);
  const krImg = kibRoughC.ctx.createImageData(kibSize, kibSize);
  for (let i = 0; i < kmImg.data.length; i += 4) {
    const n = (rand() - 0.5) * 34;
    kmImg.data[i] = THREE.MathUtils.clamp(142 + n * 0.8, 95, 180);
    kmImg.data[i + 1] = THREE.MathUtils.clamp(96 + n * 0.6, 60, 130);
    kmImg.data[i + 2] = THREE.MathUtils.clamp(58 + n * 0.45, 34, 88);
    kmImg.data[i + 3] = 255;

    const b = THREE.MathUtils.clamp(128 + n * 2.1, 35, 225);
    kbImg.data[i] = kbImg.data[i + 1] = kbImg.data[i + 2] = b;
    kbImg.data[i + 3] = 255;

    const r = THREE.MathUtils.clamp(222 + n * 0.6, 195, 246);
    krImg.data[i] = krImg.data[i + 1] = krImg.data[i + 2] = r;
    krImg.data[i + 3] = 255;
  }
  kibMapC.ctx.putImageData(kmImg, 0, 0);
  kibBumpC.ctx.putImageData(kbImg, 0, 0);
  kibRoughC.ctx.putImageData(krImg, 0, 0);
  for (let i = 0; i < 1800; i++) {
    const x = rand() * kibSize;
    const y = rand() * kibSize;
    const rad = 0.8 + rand() * 2.2;
    kibMapC.ctx.fillStyle =
      rand() > 0.5 ? "rgba(82,48,24,0.28)" : "rgba(178,128,82,0.24)";
    kibMapC.ctx.beginPath();
    kibMapC.ctx.arc(x, y, rad, 0, Math.PI * 2);
    kibMapC.ctx.fill();
    kibBumpC.ctx.fillStyle =
      rand() > 0.5 ? "rgba(40,40,40,0.35)" : "rgba(215,215,215,0.3)";
    kibBumpC.ctx.beginPath();
    kibBumpC.ctx.arc(x, y, rad, 0, Math.PI * 2);
    kibBumpC.ctx.fill();
  }
  const kibbleMap = wrapTexture(kibMapC.canvas, 2, 2, true);
  const kibbleBump = wrapTexture(kibBumpC.canvas, 2, 2);
  const kibbleRoughness = wrapTexture(kibRoughC.canvas, 2, 2);

  // 5. Brushed / satin accent finish
  const satSize = 256;
  const satBumpC = makeCanvas(satSize);
  const satRoughC = makeCanvas(satSize);
  const sbImg = satBumpC.ctx.createImageData(satSize, satSize);
  const srImg = satRoughC.ctx.createImageData(satSize, satSize);
  for (let y = 0; y < satSize; y++) {
    const streak = (rand() - 0.5) * 10;
    for (let x = 0; x < satSize; x++) {
      const idx = (y * satSize + x) * 4;
      const fine = (rand() - 0.5) * 8 + streak;
      const b = THREE.MathUtils.clamp(128 + fine, 108, 148);
      const r = THREE.MathUtils.clamp(102 + fine * 1.1, 80, 128);
      sbImg.data[idx] = sbImg.data[idx + 1] = sbImg.data[idx + 2] = b;
      sbImg.data[idx + 3] = 255;
      srImg.data[idx] = srImg.data[idx + 1] = srImg.data[idx + 2] = r;
      srImg.data[idx + 3] = 255;
    }
  }
  satBumpC.ctx.putImageData(sbImg, 0, 0);
  satRoughC.ctx.putImageData(srImg, 0, 0);
  const satinBump = wrapTexture(satBumpC.canvas, 2, 2);
  const satinRoughness = wrapTexture(satRoughC.canvas, 2, 2);

  // 6. Pure mode mechanical timer dial face
  const dialSize = 256;
  const dialC = makeCanvas(dialSize);
  dialC.ctx.fillStyle = "#BFE3DC";
  dialC.ctx.fillRect(0, 0, dialSize, dialSize);
  const cx = dialSize / 2;
  const cy = dialSize / 2;
  dialC.ctx.strokeStyle = "#8FB8AF";
  dialC.ctx.lineWidth = 3;
  dialC.ctx.beginPath();
  dialC.ctx.arc(cx, cy, 108, 0, Math.PI * 2);
  dialC.ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const major = i % 6 === 0;
    const r0 = major ? 86 : 94;
    const r1 = 106;
    dialC.ctx.strokeStyle = major ? "#5E857D" : "#7FA69E";
    dialC.ctx.lineWidth = major ? 3.5 : 2;
    dialC.ctx.beginPath();
    dialC.ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    dialC.ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    dialC.ctx.stroke();
  }
  const timerDialMap = wrapTexture(dialC.canvas, 1, 1, true);
  timerDialMap.wrapS = timerDialMap.wrapT = THREE.ClampToEdgeWrapping;

  const all = [
    siliconeBump,
    siliconeRoughness,
    gritMap,
    gritBump,
    gritRoughness,
    domeBump,
    domeRoughness,
    kibbleMap,
    kibbleBump,
    kibbleRoughness,
    satinBump,
    satinRoughness,
    timerDialMap,
  ];

  return {
    siliconeBump,
    siliconeRoughness,
    gritMap,
    gritBump,
    gritRoughness,
    domeBump,
    domeRoughness,
    kibbleMap,
    kibbleBump,
    kibbleRoughness,
    satinBump,
    satinRoughness,
    timerDialMap,
    dispose() {
      all.forEach((t) => t.dispose());
    },
  };
}

export type ChamferedOctagonOptions = {
  width?: number;
  height?: number;
  chamfer?: number;
  bevel?: number;
  bevelTaper?: number;
  flare?: number;
  flarePower?: number;
  fillet?: number;
  segments?: number;
  rings?: number;
};

export type ShellRecess = {
  angle: number;
  yCenter: number;
  sCenter?: number;
  halfW: number;
  halfH: number;
  cornerRadius?: number;
  depth: number;
  edgeSoftness?: number;
  shape?: "roundRect" | "circle" | "arch";
};

export type ChamferedOctagonShellOptions = ChamferedOctagonOptions & {
  recesses?: ShellRecess[];
  topWell?: {
    inset: number;
    depth: number;
    rimBevel?: number;
  };
};

function smoothMin(a: number, b: number, k: number) {
  const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k));
  return b * (1 - h) + a * h - k * h * (1 - h);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function tierProfileScale(
  t: number,
  bevel: number,
  bevelTaper: number,
  flare: number,
  flarePower = 2.2,
) {
  const ease = (x: number) => x * x * (3 - 2 * x);
  let s = 1;
  if (bevel > 0) {
    const bottom = ease(Math.min(t / bevel, 1));
    const top = ease(Math.min((1 - t) / bevel, 1));
    s *= 1 - bevelTaper * (1 - Math.min(bottom, top));
  }
  if (flare > 0) s *= 1 + flare * Math.pow(1 - t, flarePower);
  return s;
}

export function tier1FaceDistance(
  y: number,
  yStart: number,
  height: number,
  width: number,
  chamfer: number,
  flare: number,
  flarePower: number,
  isChamferFace: boolean,
) {
  const t = THREE.MathUtils.clamp((y - yStart) / height, 0, 1);
  const scale = tierProfileScale(t, 0.08, 0.05, flare, flarePower);
  const baseDist = isChamferFace ? (width + chamfer) / Math.SQRT2 : width;
  return baseDist * scale;
}

export function tier1FaceSlope(
  y: number,
  yStart: number,
  height: number,
  width: number,
  chamfer: number,
  flare: number,
  flarePower: number,
  isChamferFace: boolean,
) {
  const eps = 0.005;
  const d0 = tier1FaceDistance(
    y - eps,
    yStart,
    height,
    width,
    chamfer,
    flare,
    flarePower,
    isChamferFace,
  );
  const d1 = tier1FaceDistance(
    y + eps,
    yStart,
    height,
    width,
    chamfer,
    flare,
    flarePower,
    isChamferFace,
  );
  return Math.atan2(d0 - d1, 2 * eps);
}

function octagonRadiusAt(
  a: number,
  width: number,
  chamfer: number,
  fillet: number,
) {
  const c = Math.abs(Math.cos(a));
  const sn = Math.abs(Math.sin(a));
  const squareR = width / Math.max(c, sn);
  const diamondR = (width + chamfer) / (c + sn);
  return smoothMin(squareR, diamondR, fillet);
}

function recessSdf(rec: ShellRecess, sCoord: number, yCoord: number): number {
  const kind = rec.shape ?? "roundRect";
  if (kind === "circle") {
    const ex = sCoord / rec.halfW;
    const ey = yCoord / rec.halfH;
    return (Math.hypot(ex, ey) - 1) * Math.min(rec.halfW, rec.halfH);
  }
  if (kind === "arch") {
    if (yCoord >= 0) {
      const ex = sCoord / rec.halfW;
      const ey = yCoord / rec.halfH;
      return (Math.hypot(ex, ey) - 1) * Math.min(rec.halfW, rec.halfH);
    }
    return Math.abs(sCoord) - rec.halfW;
  }
  const cr = Math.min(rec.cornerRadius ?? 0.06, rec.halfW, rec.halfH);
  const qx = Math.abs(sCoord) - (rec.halfW - cr);
  const qy = Math.abs(yCoord) - (rec.halfH - cr);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    cr
  );
}

export function chamferedOctagonShellGeometry(
  options: ChamferedOctagonShellOptions = {},
): THREE.BufferGeometry {
  const width = options.width ?? 1;
  const height = options.height ?? 0.8;
  const chamfer = options.chamfer ?? width * 0.46;
  const bevel = options.bevel ?? 0.09;
  const bevelTaper = options.bevelTaper ?? 0.08;
  const flare = options.flare ?? 0;
  const flarePower = options.flarePower ?? 2.2;
  const fillet = options.fillet ?? width * 0.1;
  const segments = options.segments ?? 192;
  const rings = options.rings ?? 40;
  const recesses = options.recesses ?? [];
  const topWell = options.topWell;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const pushRing = (
    y: number,
    scale: number,
    vCoord: number,
    applyRecesses: boolean,
  ) => {
    for (let s = 0; s <= segments; s++) {
      const u = s / segments;
      const a = u * Math.PI * 2;
      const baseR = octagonRadiusAt(a, width, chamfer, fillet) * scale;
      let px = Math.cos(a) * baseR;
      let pz = Math.sin(a) * baseR;

      if (applyRecesses && recesses.length > 0) {
        const rLen = Math.hypot(px, pz) || 1;
        for (let i = 0; i < recesses.length; i++) {
          const rec = recesses[i];
          const nx = Math.cos(rec.angle);
          const nz = Math.sin(rec.angle);
          const dot = (px * nx + pz * nz) / rLen;
          if (dot < 0.52) continue;
          const tx = -nz;
          const tz = nx;
          const sCoord = px * tx + pz * tz - (rec.sCenter ?? 0);
          const yCoord = y - rec.yCenter;
          const soft = rec.edgeSoftness ?? 0.024;
          if (Math.abs(sCoord) > rec.halfW + soft * 1.5) continue;
          if (rec.shape !== "arch" && Math.abs(yCoord) > rec.halfH + soft * 1.5) {
            continue;
          }
          if (rec.shape === "arch" && yCoord > rec.halfH + soft * 1.5) continue;
          const d = recessSdf(rec, sCoord, yCoord);
          const f = 1 - smoothstep(-soft, soft, d);
          if (f > 0.0001) {
            const push = rec.depth * f;
            px -= nx * push;
            pz -= nz * push;
          }
        }
      }

      positions.push(px, y, pz);
      uvs.push(u * 4, vCoord);
    }
  };

  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const y = t * height;
    const scale = tierProfileScale(t, bevel, bevelTaper, flare, flarePower);
    pushRing(y, scale, y * 1.4, true);
  }

  let totalRings = rings;
  if (topWell) {
    const topScale = tierProfileScale(1, bevel, bevelTaper, flare, flarePower);
    const rimBevel = topWell.rimBevel ?? 0.035;
    const innerScale = Math.max(0.25, topScale - topWell.inset);
    const midScale = THREE.MathUtils.lerp(topScale, innerScale, 0.55);
    pushRing(height + 0.004, midScale, height * 1.4 + 0.05, false);
    pushRing(height - rimBevel, innerScale, height * 1.4 + 0.12, false);
    pushRing(
      Math.max(0.04, height - topWell.depth),
      innerScale,
      height * 1.4 + 0.35,
      false,
    );
    totalRings += 3;
  }

  const stride = segments + 1;
  for (let r = 0; r < totalRings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * stride + s;
      const b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const bottomCenter = positions.length / 3;
  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);

  const topCapY = topWell ? Math.max(0.04, height - topWell.depth) : height;
  const topCenter = positions.length / 3;
  positions.push(0, topCapY, 0);
  uvs.push(0.5, 0.5);

  const topRingStart = totalRings * stride;
  for (let s = 0; s < segments; s++) {
    indices.push(bottomCenter, s, s + 1);
    indices.push(topCenter, topRingStart + s + 1, topRingStart + s);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function chamferedOctagonGeometry(
  options: ChamferedOctagonOptions = {},
): THREE.BufferGeometry {
  return chamferedOctagonShellGeometry({
    width: options.width ?? 1,
    height: options.height ?? 2.6,
    chamfer: options.chamfer ?? (options.width ?? 1) * 0.46,
    bevel: options.bevel ?? 0.08,
    bevelTaper: options.bevelTaper ?? 0.12,
    flare: options.flare ?? 0,
    flarePower: options.flarePower ?? 2.2,
    fillet: options.fillet ?? (options.width ?? 1) * 0.1,
    segments: options.segments ?? 96,
    rings: options.rings ?? 14,
  });
}

export function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const cr = Math.min(r, hw, hh);
  const s = new THREE.Shape();
  s.moveTo(-hw + cr, -hh);
  s.lineTo(hw - cr, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + cr);
  s.lineTo(hw, hh - cr);
  s.quadraticCurveTo(hw, hh, hw - cr, hh);
  s.lineTo(-hw + cr, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - cr);
  s.lineTo(-hw, -hh + cr);
  s.quadraticCurveTo(-hw, -hh, -hw + cr, -hh);
  return s;
}

export function roundedRectPath(w: number, h: number, r: number): THREE.Path {
  const hw = w / 2;
  const hh = h / 2;
  const cr = Math.min(r, hw, hh);
  const p = new THREE.Path();
  p.moveTo(-hw + cr, -hh);
  p.quadraticCurveTo(-hw, -hh, -hw, -hh + cr);
  p.lineTo(-hw, hh - cr);
  p.quadraticCurveTo(-hw, hh, -hw + cr, hh);
  p.lineTo(hw - cr, hh);
  p.quadraticCurveTo(hw, hh, hw, hh - cr);
  p.lineTo(hw, -hh + cr);
  p.quadraticCurveTo(hw, -hh, hw - cr, -hh);
  p.lineTo(-hw + cr, -hh);
  return p;
}

export function pillShape(w: number, h: number): THREE.Shape {
  return roundedRectShape(w, h, Math.min(w, h) * 0.49);
}

export function roundedBlockGeometry(
  w: number,
  h: number,
  r: number,
  depth: number,
  bevel = 0.014,
): THREE.BufferGeometry {
  const shape = roundedRectShape(w, h, r);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 20,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

export function beveledFrameGeometry(
  outerW: number,
  outerH: number,
  outerR: number,
  innerW: number,
  innerH: number,
  innerR: number,
  depth: number,
  bevel = 0.014,
): THREE.BufferGeometry {
  const shape = roundedRectShape(outerW, outerH, outerR);
  const hw = innerW / 2;
  const hh = innerH / 2;
  const cr = Math.min(innerR, hw, hh);
  const hole = new THREE.Path();
  hole.moveTo(-hw + cr, -hh);
  hole.quadraticCurveTo(-hw, -hh, -hw, -hh + cr);
  hole.lineTo(-hw, hh - cr);
  hole.quadraticCurveTo(-hw, hh, -hw + cr, hh);
  hole.lineTo(hw - cr, hh);
  hole.quadraticCurveTo(hw, hh, hw, hh - cr);
  hole.lineTo(hw, -hh + cr);
  hole.quadraticCurveTo(hw, -hh, hw - cr, -hh);
  hole.lineTo(-hw + cr, -hh);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 22,
  });
  geo.translate(0, 0, -depth);
  geo.computeVertexNormals();
  return geo;
}

export function archFrameGeometry(
  outerW: number,
  outerH: number,
  innerW: number,
  innerH: number,
  depth: number,
  bevel = 0.014,
): THREE.BufferGeometry {
  const ow = outerW / 2;
  const iw = innerW / 2;
  const archR = iw;
  const outerArchR = ow;
  const straightH = Math.max(0.04, innerH - archR);
  const outerStraightH = Math.max(0.04, outerH - outerArchR);

  const shape = new THREE.Shape();
  shape.moveTo(-ow, 0);
  shape.lineTo(-ow, outerStraightH);
  shape.absarc(0, outerStraightH, outerArchR, Math.PI, 0, true);
  shape.lineTo(ow, 0);
  shape.lineTo(iw, 0);
  shape.lineTo(iw, straightH);
  shape.absarc(0, straightH, archR, 0, Math.PI, false);
  shape.lineTo(-iw, 0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geo.translate(0, 0, -depth);
  geo.computeVertexNormals();
  return geo;
}

export function conicalFunnelGeometry(
  outerR: number,
  innerR: number,
  depth: number,
  lipR = 0.045,
): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(outerR, -0.01),
    new THREE.Vector2(outerR + lipR * 0.35, 0.015),
    new THREE.Vector2(outerR, lipR * 0.95),
    new THREE.Vector2(outerR - lipR * 0.75, lipR * 0.85),
    new THREE.Vector2(THREE.MathUtils.lerp(outerR - lipR, innerR, 0.45), -depth * 0.35),
    new THREE.Vector2(innerR + 0.015, -depth * 0.78),
    new THREE.Vector2(innerR, -depth),
    new THREE.Vector2(innerR - 0.012, -depth),
  ];
  const geo = new THREE.LatheGeometry(pts, 44);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

export function kibbleWheelGeometry(
  outerR: number,
  hubR: number,
  spokes: number,
  depth: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

  const rimThick = 0.042;
  const rIn = hubR + 0.025;
  const rOut = outerR - rimThick;
  const sector = (Math.PI * 2) / spokes;
  const spokeHalfAngle = 0.16;

  for (let i = 0; i < spokes; i++) {
    const a0 = i * sector + spokeHalfAngle;
    const a1 = (i + 1) * sector - spokeHalfAngle;
    const aMid = (a0 + a1) * 0.5;
    const hole = new THREE.Path();
    const p0x = Math.cos(a0) * rIn;
    const p0y = Math.sin(a0) * rIn;
    const p1x = Math.cos(a0) * rOut;
    const p1y = Math.sin(a0) * rOut;
    const p2x = Math.cos(aMid) * (rOut + 0.012);
    const p2y = Math.sin(aMid) * (rOut + 0.012);
    const p3x = Math.cos(a1) * rOut;
    const p3y = Math.sin(a1) * rOut;
    const p4x = Math.cos(a1) * rIn;
    const p4y = Math.sin(a1) * rIn;
    const p5x = Math.cos(aMid) * (rIn - 0.008);
    const p5y = Math.sin(aMid) * (rIn - 0.008);

    hole.moveTo(p0x, p0y);
    hole.lineTo(p1x, p1y);
    hole.quadraticCurveTo(p2x, p2y, p3x, p3y);
    hole.lineTo(p4x, p4y);
    hole.quadraticCurveTo(p5x, p5y, p0x, p0y);
    shape.holes.push(hole);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

export function curvedVisorGeometry(
  width: number,
  reach: number,
  drop: number,
  thickness: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.04, thickness * 0.5);
  shape.quadraticCurveTo(reach * 0.55, thickness * 0.45, reach, -drop);
  shape.quadraticCurveTo(reach + 0.015, -drop - thickness * 0.45, reach - 0.02, -drop - thickness * 0.85);
  shape.quadraticCurveTo(reach * 0.48, -thickness * 0.45, -0.04, -thickness * 0.5);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.012,
    bevelSegments: 4,
    curveSegments: 20,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  geo.computeBoundingBox();
  if (geo.boundingBox) {
    geo.translate(0, -geo.boundingBox.min.y, 0);
  }
  geo.computeVertexNormals();
  return geo;
}

export function uHandleGeometry(
  span: number,
  reach: number,
  strapThick: number,
  height: number,
): THREE.BufferGeometry {
  const hs = span / 2;
  const innerHs = hs - strapThick;
  const innerReach = reach - strapThick;

  const shape = new THREE.Shape();
  shape.moveTo(-hs, -0.04);
  shape.lineTo(-hs, reach * 0.55);
  shape.quadraticCurveTo(-hs, reach, -hs + 0.08, reach);
  shape.lineTo(hs - 0.08, reach);
  shape.quadraticCurveTo(hs, reach, hs, reach * 0.55);
  shape.lineTo(hs, -0.04);
  shape.lineTo(innerHs, -0.04);
  shape.lineTo(innerHs, innerReach * 0.55);
  shape.quadraticCurveTo(innerHs, innerReach, innerHs - 0.05, innerReach);
  shape.lineTo(-innerHs + 0.05, innerReach);
  shape.quadraticCurveTo(-innerHs, innerReach, -innerHs, innerReach * 0.55);
  shape.lineTo(-innerHs, -0.04);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 4,
    curveSegments: 20,
  });
  geo.translate(0, 0, -height / 2);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

export function scallopedDialGeometry(
  radius: number,
  lobes: number,
  depth: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const steps = lobes * 16;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = radius * (0.92 + 0.08 * Math.cos(a * lobes));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

export function helicalThreadGeometry(
  radius: number,
  height: number,
  turns: number,
  tubeRadius: number,
): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  const steps = Math.round(turns * 40);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const y = (t - 0.5) * height;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, steps, tubeRadius, 10, false);
  geo.computeVertexNormals();
  return geo;
}

export function boneChewGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.11, -0.022);
  shape.bezierCurveTo(-0.14, -0.055, -0.185, -0.045, -0.185, -0.012);
  shape.bezierCurveTo(-0.185, 0.0, -0.17, 0.0, -0.185, 0.012);
  shape.bezierCurveTo(-0.185, 0.045, -0.14, 0.055, -0.11, 0.022);
  shape.lineTo(0.11, 0.022);
  shape.bezierCurveTo(0.14, 0.055, 0.185, 0.045, 0.185, 0.012);
  shape.bezierCurveTo(0.185, 0.0, 0.17, 0.0, 0.185, -0.012);
  shape.bezierCurveTo(0.185, -0.045, 0.14, -0.055, 0.11, -0.022);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.032,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.01,
    bevelSegments: 3,
    curveSegments: 16,
  });
  geo.translate(0, 0, -0.016);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

export function scratchRampGeometry(
  width: number,
  length: number,
  backHeight: number,
  frontHeight: number,
): THREE.BufferGeometry {
  // Side profile in (z, y) extruded along X
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length - 0.04, 0);
  shape.quadraticCurveTo(length, 0, length, frontHeight * 0.55);
  shape.quadraticCurveTo(length, frontHeight, length - 0.04, frontHeight + 0.012);
  shape.lineTo(0.04, backHeight);
  shape.quadraticCurveTo(0, backHeight, 0, backHeight - 0.04);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.022,
    bevelSize: 0.018,
    bevelSegments: 4,
    curveSegments: 16,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  geo.computeBoundingBox();
  if (geo.boundingBox) {
    geo.translate(0, -geo.boundingBox.min.y, 0);
  }
  geo.computeVertexNormals();
  return geo;
}

export function openDrawerGeometry(
  w: number,
  h: number,
  d: number,
  wall = 0.024,
): THREE.BufferGeometry {
  // Outer rounded tray with recessed interior cavity
  const outer = roundedRectShape(w, d, 0.04);
  const inner = roundedRectShape(w - wall * 2, d - wall * 2, 0.025);
  const hole = new THREE.Path(inner.getPoints(24).reverse());
  outer.holes.push(hole);

  const wallsGeo = new THREE.ExtrudeGeometry(outer, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 16,
  });
  wallsGeo.rotateX(-Math.PI / 2);
  wallsGeo.computeVertexNormals();
  return wallsGeo;
}
